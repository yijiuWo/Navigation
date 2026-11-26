const EARTH_RADIUS = 6371000;

function distanceBetween(a, b) {
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const dLat = lat2 - lat1;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS * Math.asin(Math.min(1, Math.sqrt(h)));
}

function buildRouteMetrics(points) {
  const cum = [0];
  for (let i = 1; i < points.length; i += 1) {
    cum.push(cum[i - 1] + distanceBetween(points[i - 1], points[i]));
  }
  return { cum, total: cum[cum.length - 1] || 0 };
}

function projectOnRoute(points, cum, point) {
  let best = { along: 0, offset: Infinity };
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    const segLen = cum[i] - cum[i - 1];
    if (segLen <= 0) continue;

    const kx = (Math.PI / 180) * EARTH_RADIUS * Math.cos((a.lat * Math.PI) / 180);
    const ky = (Math.PI / 180) * EARTH_RADIUS;
    const bx = (b.lng - a.lng) * kx;
    const by = (b.lat - a.lat) * ky;
    const px = (point.lng - a.lng) * kx;
    const py = (point.lat - a.lat) * ky;
    const lenSq = bx * bx + by * by;
    const t = lenSq > 0 ? Math.max(0, Math.min(1, (px * bx + py * by) / lenSq)) : 0;
    const dx = px - bx * t;
    const dy = py - by * t;
    const offset = Math.hypot(dx, dy);

    if (offset < best.offset) best = { along: cum[i - 1] + t * segLen, offset };
  }
  return best;
}

function alongOfPoint(points, cum, point) {
  return projectOnRoute(points, cum, point).along;
}

function pointAtAlong(points, cum, along) {
  const target = Math.max(0, Math.min(cum[cum.length - 1], along));
  for (let i = 1; i < points.length; i += 1) {
    if (cum[i] >= target) {
      const segLen = cum[i] - cum[i - 1] || 1;
      const t = (target - cum[i - 1]) / segLen;
      return {
        index: i - 1,
        point: {
          lat: points[i - 1].lat + (points[i].lat - points[i - 1].lat) * t,
          lng: points[i - 1].lng + (points[i].lng - points[i - 1].lng) * t,
        },
      };
    }
  }
  const last = points[points.length - 1];
  return { index: Math.max(0, points.length - 2), point: { lat: last.lat, lng: last.lng } };
}

const STOP_PASS_MARGIN = 40;

function buildStopMarks(route) {
  if (!route || !Array.isArray(route.legs) || !Array.isArray(route.points) || !Array.isArray(route.cum)) return [];
  const rides = route.legs.filter((leg) => !leg.walking && Array.isArray(leg.points) && leg.points.length >= 2);
  const finalLeg = rides[rides.length - 1];
  const found = [];

  for (const leg of rides) {
    const stops = [leg.from, ...(leg.stops || []), leg.to].filter((stop) => stop && stop.name && Number.isFinite(stop.lat) && Number.isFinite(stop.lng));
    if (stops.length < 2) continue;

    for (const [index, stop] of stops.entries()) {
      const legEnd = index === stops.length - 1;
      const terminal = legEnd && leg === finalLeg;
      const projection = projectOnRoute(route.points, route.cum, stop);
      if (projection.offset > 1200) continue;
      found.push({
        name: stop.name,
        along: projection.along,
        kind: legEnd ? (terminal ? 'alight' : 'transfer') : 'via',
        exit: terminal ? leg.exit || null : null,
      });
    }
  }

  const marks = [];
  for (const mark of found) {
    if (marks.some((item) => item.name === mark.name && Math.abs(item.along - mark.along) < 2)) continue;
    marks.push(mark);
  }
  return marks.sort((a, b) => a.along - b.along);
}

function createReminderEngine(options = {}) {
  const config = {
    threshold: options.threshold ?? 500,
    accuracyLimit: 150,
    offRouteLimit: 250,
    minInterval: 2000,
    confirmHits: 3,
    confirmMs: 5000,
  };

  let route = null;
  let marks = [];
  let threshold = config.threshold;
  let boarded = false;
  const armed = { boarding: true, alighting: true };
  const hits = { boarding: 0, alighting: 0 };
  const since = { boarding: 0, alighting: 0 };
  let lastFixTime = 0;

  function resetCounters() {
    hits.boarding = 0;
    hits.alighting = 0;
    since.boarding = 0;
    since.alighting = 0;
  }

  function setRoute(next) {
    route = next;
    marks = buildStopMarks(next);
    boarded = false;
    armed.boarding = true;
    armed.alighting = true;
    lastFixTime = 0;
    resetCounters();
  }

  function clear() {
    route = null;
    marks = [];
    resetCounters();
  }

  function setThreshold(value) {
    threshold = Math.max(50, Math.min(5000, Number(value) || config.threshold));
  }

  function getThreshold() {
    return threshold;
  }

  function tick(kind, qualifies, now) {
    if (!qualifies) {
      hits[kind] = 0;
      since[kind] = 0;
      return false;
    }
    if (hits[kind] === 0) since[kind] = now;
    hits[kind] += 1;
    return hits[kind] >= config.confirmHits && now - since[kind] >= config.confirmMs;
  }

  function evaluate(fix) {
    if (!route) return null;
    if (!Number.isFinite(fix.accuracy) || fix.accuracy > config.accuracyLimit) return { skipped: 'accuracy' };

    const now = fix.timestamp || Date.now();
    if (now - lastFixTime < config.minInterval) return { skipped: 'interval' };
    lastFixTime = now;

    const projection = projectOnRoute(route.points, route.cum, fix);
    const base = { accuracy: fix.accuracy, offset: projection.offset, along: projection.along };

    if (projection.offset > config.offRouteLimit) {
      resetCounters();
      return { ...base, offRoute: true };
    }

    const boardingRemaining = route.boarding.along - projection.along;
    const alightingRemaining = route.alighting.along - projection.along;
    if (!boarded && projection.along >= route.boarding.along - 40) boarded = true;

    const boardingQualifies = armed.boarding && boardingRemaining <= threshold && boardingRemaining > -60;
    const alightingQualifies = boarded && armed.alighting && alightingRemaining <= threshold && alightingRemaining > -60;

    const boardingFire = tick('boarding', boardingQualifies, now);
    const alightingFire = tick('alighting', alightingQualifies, now);

    let alert = null;
    if (alightingFire) {
      armed.alighting = false;
      alert = 'alighting';
    } else if (boardingFire) {
      armed.boarding = false;
      alert = 'boarding';
    }

    const upcoming = marks.filter((mark) => mark.along > projection.along + STOP_PASS_MARGIN);
    const nextStop = boarded ? upcoming[0] || null : null;
    const nextRideEnd = upcoming.findIndex((mark) => mark.kind === 'alight' || mark.kind === 'transfer');
    const stopsLeft = nextStop && nextRideEnd > 0 ? nextRideEnd : 0;

    return {
      ...base,
      boarded,
      boardingRemaining: Math.max(0, boardingRemaining),
      alightingRemaining: Math.max(0, alightingRemaining),
      nextStop,
      stopsLeft,
      alert,
    };
  }

  return { setRoute, clear, setThreshold, getThreshold, evaluate };
}