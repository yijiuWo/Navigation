const OSRM_DRIVING_URL = 'https://router.project-osrm.org/route/v1/driving';
const OSRM_FOOT_URL = 'https://routing.openstreetmap.de/routed-foot/route/v1/foot';
const DRIVE_ESTIMATE_SPEED = (40 * 1000) / 3600;
const WALK_ESTIMATE_SPEED = 1.2;
const DRIVE_ROUTE_NAMES = ['方案一', '方案二', '方案三'];
const DRIVE_ROUTE_LIMIT = 3;
const DRIVE_VARIANT_BENDS = [0, 0.12, -0.12];
const OSRM_MODIFIER_TURN = {
  left: '左转',
  right: '右转',
  'slight left': '稍向左',
  'slight right': '稍向右',
  'sharp left': '向左急转',
  'sharp right': '向右急转',
  uturn: '掉头',
};

function osrmRouteUrl(baseUrl, origin, destination, alternatives) {
  const via = `${origin.lng.toFixed(6)},${origin.lat.toFixed(6)};${destination.lng.toFixed(6)},${destination.lat.toFixed(6)}`;
  return `${baseUrl}/${via}?overview=full&geometries=geojson${alternatives ? '&alternatives=true' : ''}&steps=true`;
}

function osrmTurnText(type, modifier, maneuver) {
  if (type === 'depart') return '出发';
  if (type === 'arrive') return '到达目的地';
  if (type === 'turn') return OSRM_MODIFIER_TURN[modifier] || '继续前行';
  if (type === 'continue' || type === 'new name') return '直行';
  if (type === 'fork') return modifier.includes('right') ? '靠右' : '靠左';
  if (type === 'merge') return '汇入主路';
  if (type === 'on ramp') return '上匝道';
  if (type === 'off ramp') return '下匝道';
  if (type === 'end of road') return modifier.includes('left') ? '路口尽头左转' : modifier.includes('right') ? '路口尽头右转' : '继续前行';
  if (type === 'roundabout' || type === 'rotary') return `环岛，第 ${Number(maneuver.exit) || 1} 个出口驶出`;
  return '继续前行';
}

function buildOsrmTurns(raw) {
  const steps = raw?.legs?.[0]?.steps;
  if (!Array.isArray(steps)) return [];

  let along = 0;
  const turns = [];
  for (const step of steps) {
    const maneuver = step?.maneuver;
    if (!maneuver) continue;

    const type = String(maneuver.type || '');
    const modifier = String(maneuver.modifier || '');
    turns.push({
      along: Math.round(along),
      duration: Number(step.duration) || 0,
      type,
      modifier,
      name: typeof step.name === 'string' ? step.name : '',
      text: osrmTurnText(type, modifier, maneuver),
    });
    along += Number(step.distance) || 0;
  }
  return turns;
}

async function fetchOsrmRoutes(url, { timeout, fallbackSpeed, retries = 1 }) {
  const data = await ZenNet.fetchJson(url, { timeout, retries });

  if (data?.code !== 'Ok') throw new Error('osrm-code');

  const routes = (data.routes ?? []).map((raw) => normalizeOsrmRoute(raw, fallbackSpeed)).filter(Boolean);
  if (!routes.length) throw new Error('osrm-empty');

  return routes;
}

function normalizeOsrmRoute(raw, fallbackSpeed) {
  const coordinates = raw?.geometry?.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length < 2) return null;

  const points = coordinates.map(([lng, lat]) => ({ lat, lng }));
  const { total } = buildRouteMetrics(points);
  const seconds = Number(raw.duration);
  let turns = [];
  try {
    turns = buildOsrmTurns(raw);
  } catch {
    turns = [];
  }

  return {
    id: '',
    source: 'osrm',
    legs: [{ walking: false, points }],
    points,
    turns,
    total,
    duration: Number.isFinite(seconds) && seconds > 0 ? seconds : total / fallbackSpeed,
    estimated: false,
  };
}

function buildBendPoints(origin, destination, bend) {
  const steps = 32;
  const dLat = destination.lat - origin.lat;
  const dLng = destination.lng - origin.lng;
  const points = [];

  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const offset = Math.sin(Math.PI * t) * bend;
    points.push({
      lat: origin.lat + dLat * t - dLng * offset,
      lng: origin.lng + dLng * t + dLat * offset,
    });
  }

  return points;
}

function buildDriveEstimate(origin, destination, bend = 0) {
  const points = buildBendPoints(origin, destination, bend);
  const { total } = buildRouteMetrics(points);
  return {
    id: '',
    source: 'estimate',
    legs: [{ walking: false, points }],
    points,
    turns: [],
    total,
    duration: total / DRIVE_ESTIMATE_SPEED,
    estimated: true,
  };
}

function buildDriveEstimates(origin, destination, count) {
  return DRIVE_VARIANT_BENDS.slice(0, count).map((bend, index) => ({
    ...buildDriveEstimate(origin, destination, bend),
    id: DRIVE_ROUTE_NAMES[index] ?? `方案${index + 1}`,
  }));
}

function nameDriveRoutes(routes) {
  return routes.map((route, index) => ({ ...route, id: DRIVE_ROUTE_NAMES[index] ?? `方案${index + 1}` }));
}

async function fetchDriveRoutes({ origin, destination }) {
  const routes = await fetchOsrmRoutes(osrmRouteUrl(OSRM_DRIVING_URL, origin, destination, true), {
    timeout: 12000,
    fallbackSpeed: DRIVE_ESTIMATE_SPEED,
  });
  const picked = routes.slice(0, DRIVE_ROUTE_LIMIT);

  return nameDriveRoutes([...picked, ...buildDriveEstimates(origin, destination, DRIVE_ROUTE_LIMIT - picked.length)]);
}

async function fetchWalkRoute({ origin, destination }) {
  const [route] = await fetchOsrmRoutes(osrmRouteUrl(OSRM_FOOT_URL, origin, destination, false), {
    timeout: 10000,
    fallbackSpeed: WALK_ESTIMATE_SPEED,
  });
  return { ...route, id: '步行路线' };
}

function buildWalkEstimate(origin, destination) {
  const points = buildBendPoints(origin, destination, 0);
  const { total } = buildRouteMetrics(points);

  return {
    id: '步行路线',
    source: 'estimate',
    legs: [{ walking: false, points }],
    points,
    turns: [],
    total,
    duration: total / WALK_ESTIMATE_SPEED,
    estimated: true,
  };
}
