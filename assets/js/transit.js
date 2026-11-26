const AMAP_TRANSIT_URL = 'https://restapi.amap.com/v3/direction/transit/integrated';
const TRANSIT_PLAN_LIMIT = 3;
const TRANSIT_PLAN_NAMES = ['方案一', '方案二', '方案三'];
const TRANSIT_METRO_TYPE = /地铁|磁悬浮|railway.*subway/i;

function parseAmapPolyline(value) {
  if (typeof value !== 'string' || value === '') return [];
  return value
    .split(';')
    .map((pair) => {
      const [lng, lat] = pair.split(',').map(Number);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      const point = gcj02ToWgs84(lat, lng);
      return { lat: point.lat, lng: point.lng };
    })
    .filter(Boolean);
}

function parseAmapCoord(value) {
  if (typeof value !== 'string') return null;
  const [lngRaw, latRaw] = value.trim().split(/[,;\s]+/);
  const lng = Number(lngRaw);
  const lat = Number(latRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const point = gcj02ToWgs84(lat, lng);
  return { lat: point.lat, lng: point.lng };
}

function parseAmapStop(stop) {
  const point = parseAmapCoord(stop?.location);
  if (!point) return null;
  return { name: amapText(stop.name), id: amapText(stop.id), lat: point.lat, lng: point.lng };
}

function parseAmapStopList(stops) {
  if (!Array.isArray(stops)) return [];
  return stops.map(parseAmapStop).filter((stop) => stop && stop.name);
}

function amapText(value) {
  return typeof value === 'string' ? value : '';
}

function amapNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function amapLineParts(name) {
  const raw = amapText(name).trim();
  const open = raw.search(/[（(]/);
  if (open < 0) return { label: raw, direction: '' };
  const body = raw.slice(open).replace(/[（()）]/g, '');
  const legsOf = body.split('--');
  const terminus = (legsOf.length > 1 ? legsOf[legsOf.length - 1] : '').trim();
  return { label: raw.slice(0, open).trim(), direction: terminus ? `${terminus}方向` : '' };
}

function parseAmapSteps(steps) {
  const list = [];
  for (const step of steps || []) {
    const text = amapText(step.instruction);
    const points = parseAmapPolyline(step.polyline);
    if (!text) continue;
    list.push({ text, road: amapText(step.road_name), distance: amapNumber(step.distance), point: points[points.length - 1] || null });
  }
  return list;
}

function transitLegLabel(leg) {
  if (leg.kind === 'taxi') return '打车';
  return leg.label || leg.name;
}

function transitModeTags(legs) {
  const tags = [];
  for (const leg of legs) {
    const tag = leg.walking ? '步行' : leg.kind === 'railway' ? '火车' : leg.kind === 'taxi' ? '打车' : leg.metro ? '地铁' : '公交';
    if (!tags.includes(tag)) tags.push(tag);
  }
  return tags;
}

function toAmapCoord(point) {
  const gcj = wgs84ToGcj02(point.lat, point.lng);
  return `${gcj.lng.toFixed(6)},${gcj.lat.toFixed(6)}`;
}

async function fetchTransitPlans({ key, origin, destination, city1, city2, destinationName = '', strategy = '0' }) {
  const url = new URL(AMAP_TRANSIT_URL);
  url.searchParams.set('key', key);
  url.searchParams.set('origin', toAmapCoord(origin));
  url.searchParams.set('destination', toAmapCoord(destination));
  url.searchParams.set('city', city1);
  if (city2 && city2 !== city1) url.searchParams.set('cityd', city2);
  url.searchParams.set('strategy', strategy);
  url.searchParams.set('output', 'json');

  const response = await fetch(url, { signal: ZenNet.timeoutSignal(12000) });
  if (!response.ok) throw new Error('transit-http');

  const data = await response.json();
  if (data.status !== '1') throw new Error(`transit-status-${data.info || 'error'}`);

  const transits = (data.route?.transits || []).filter((transit) => Array.isArray(transit.segments) && transit.segments.length);
  const plans = transits.map((transit, index) => normalizeTransit(transit, destinationName, index));
  if (!plans.length) throw new Error('transit-empty');

  const preferred = strategy === '5' ? plans.filter((plan) => !plan.usesMetro) : plans;
  const fallback = strategy === '5' && !preferred.length;
  const picked = pickTransitPlans(preferred.length ? preferred : plans);
  return picked.map((plan, index) => ({
    ...plan,
    id: TRANSIT_PLAN_NAMES[index] || `方案${index + 1}`,
    noMetroFallback: fallback,
  }));
}

function pickTransitPlans(plans, limit = TRANSIT_PLAN_LIMIT) {
  const picked = [plans[0]];
  const opposite = plans.find((plan) => plan.usesMetro !== plans[0].usesMetro);
  if (opposite) picked.push(opposite);
  for (const plan of plans) {
    if (picked.length >= limit) break;
    if (!picked.includes(plan)) picked.push(plan);
  }
  return picked.slice(0, limit);
}

function normalizeTransit(transit, destinationName = '', index = 0) {
  const legs = [];
  let boarding = null;
  let alighting = null;

  for (const segment of transit.segments || []) {
    if (segment.walking?.steps?.length) {
      const steps = parseAmapSteps(segment.walking.steps);
      const points = segment.walking.steps.flatMap((step) => parseAmapPolyline(step.polyline));
      if (points.length > 1) {
        legs.push({
          walking: true,
          kind: 'walking',
          points,
          steps,
          distance: amapNumber(segment.walking.distance) || steps.reduce((sum, step) => sum + step.distance, 0),
          name: '步行',
        });
      }
    }

    const line = segment.bus?.buslines?.[0];
    if (line) {
      const from = parseAmapStop(line.departure_stop);
      const to = parseAmapStop(line.arrival_stop);
      let points = parseAmapPolyline(line.polyline);
      if (points.length < 2 && from && to) points = [from, to];
      const { label, direction } = amapLineParts(line.name);
      if (points.length > 1) legs.push({
        walking: false,
        kind: 'bus',
        points,
        name: line.name || '',
        label,
        metro: TRANSIT_METRO_TYPE.test(`${line.type || ''}${label}`),
        viaNum: amapNumber(line.via_num),
        from,
        to,
        fromId: from?.id || '',
        toId: to?.id || '',
        fromName: from?.name || '',
        toName: to?.name || '',
        direction,
        stops: parseAmapStopList(line.via_stops),
        entrance: parseAmapStop(segment.entrance),
        exit: parseAmapStop(segment.exit),
        distance: amapNumber(line.distance),
      });
      if (!boarding && from) boarding = from;
      if (to) alighting = to;
    }

    const railway = segment.railway;
    if (railway && (railway.name || railway.trip)) {
      const from = parseAmapStop(railway.departure_stop);
      const to = parseAmapStop(railway.arrival_stop);
      if (from && to) {
        const railLine = amapLineParts(railway.name || railway.trip);
        legs.push({
          walking: false,
          kind: 'railway',
          points: [from, to],
          name: railway.trip || railway.name || '火车',
          trip: railway.trip || '',
          label: railLine.label || '火车',
          from,
          to,
          fromId: from.id,
          toId: to.id,
          fromName: from.name,
          toName: to.name,
          stops: parseAmapStopList(railway.via_stops),
          entrance: parseAmapStop(segment.entrance),
          exit: parseAmapStop(segment.exit),
          distance: amapNumber(railway.distance),
          fromTime: amapText(railway.departure_stop?.time),
          toTime: amapText(railway.arrival_stop?.time),
          toNextDay: railway.arrival_stop?.end === '1',
        });
        if (!boarding) boarding = from;
        alighting = to;
      }
    }

    const taxi = segment.taxi;
    if (taxi) {
      const from = parseAmapCoord(taxi.origin);
      const to = parseAmapCoord(taxi.destination);
      if (from && to) {
        const label = amapText(taxi.tname) || destinationName;
        legs.push({
          walking: false,
          kind: 'taxi',
          points: [from, to],
          name: '打车',
          label: '打车',
          from: { name: amapText(taxi.sname), id: '', lat: from.lat, lng: from.lng },
          to: { name: label, id: '', lat: to.lat, lng: to.lng },
          fromName: amapText(taxi.sname),
          toName: label,
          stops: [],
          distance: amapNumber(taxi.distance),
        });
        if (!boarding) boarding = from;
        alighting = { name: label, lat: to.lat, lng: to.lng };
      }
    }
  }

  if (!legs.length || !boarding || !alighting) throw new Error('transit-incomplete');

  for (const [legIndex, leg] of legs.entries()) {
    if (!leg.walking) continue;
    const next = legs[legIndex + 1];
    leg.to = next ? next.fromName || next.toName || '' : destinationName || '';
  }

  const points = legs.flatMap((leg) => leg.points);
  const { cum, total } = buildRouteMetrics(points);
  const rides = legs.filter((leg) => !leg.walking);
  const modeTags = transitModeTags(legs);
  const boardLeg = rides[0];
  const alightLeg = rides[rides.length - 1];

  return {
    id: TRANSIT_PLAN_NAMES[index] || `方案${index + 1}`,
    source: 'amap',
    legs,
    points,
    cum,
    total,
    boarding: { ...boarding, along: alongOfPoint(points, cum, boarding), exit: boardLeg?.entrance || null, exits: [] },
    alighting: { ...alighting, along: alongOfPoint(points, cum, alighting), exit: alightLeg?.exit || null, exits: [] },
    duration: amapNumber(transit.duration),
    walkingDistance: amapNumber(transit.walking_distance),
    totalDistance: amapNumber(transit.distance),
    cost: transit.cost != null && transit.cost !== '' ? Number(transit.cost) : null,
    title: rides.map(transitLegLabel).filter(Boolean).join('+') || '步行',
    transferCount: Math.max(0, rides.length - 1),
    usesMetro: modeTags.includes('地铁'),
    modeTags,
    demo: false,
  };
}

function buildDemoRoute(origin, destination) {
  const start = { lat: origin.lat, lng: origin.lng };
  const end = { lat: destination.lat, lng: destination.lng };
  const dLat = end.lat - start.lat;
  const dLng = end.lng - start.lng;
  const steps = 24;
  const points = [];

  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const bend = Math.sin(Math.PI * t) * 0.06;
    points.push({
      lat: start.lat + dLat * t - dLng * bend,
      lng: start.lng + dLng * t + dLat * bend,
    });
  }

  const { cum, total } = buildRouteMetrics(points);
  const boardAlong = total * 0.12;
  const alightAlong = total * 0.94;
  const board = pointAtAlong(points, cum, boardAlong);
  const alight = pointAtAlong(points, cum, alightAlong);

  const legs = [];
  const walkStart = points.slice(0, board.index + 1);
  const ride = points.slice(board.index, alight.index + 1);
  const walkEnd = points.slice(alight.index);
  if (walkStart.length > 1) legs.push({ walking: true, kind: 'walking', points: walkStart, steps: [], name: '步行' });
  if (ride.length > 1) legs.push({ walking: false, kind: 'bus', points: ride, name: '演示线路', label: '演示线路', viaNum: 3, fromName: '演示上车站', toName: '演示下车站' });
  if (walkEnd.length > 1) legs.push({ walking: true, kind: 'walking', points: walkEnd, steps: [], name: '步行' });

  const walkingDistance = boardAlong + (total - alightAlong);
  const duration = walkingDistance / 1.2 + Math.max(0, alightAlong - boardAlong) / 7;

  return {
    id: TRANSIT_PLAN_NAMES[0],
    source: 'demo',
    legs,
    points,
    cum,
    total,
    boarding: { name: '演示上车站', id: '', lat: board.point.lat, lng: board.point.lng, along: boardAlong, exit: null, exits: [] },
    alighting: { name: '演示下车站', id: '', lat: alight.point.lat, lng: alight.point.lng, along: alightAlong, exit: null, exits: [] },
    duration,
    walkingDistance,
    totalDistance: total,
    cost: null,
    title: '演示线路',
    transferCount: 0,
    usesMetro: false,
    modeTags: ['步行', '公交'],
    demo: true,
  };
}