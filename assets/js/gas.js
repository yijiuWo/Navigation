const FUEL_ENDPOINTS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.openstreetmap.fr/api/interpreter',
];

const FUEL_TIMEOUT = 12000;
const FUEL_POINT_RADIUS = 4000;
const FUEL_BBOX_PAD = 1100;

function fuelCoord(point) {
  return Boolean(point) && Number.isFinite(point.lat) && Number.isFinite(point.lng);
}

function fuelRouteBounds(points) {
  const list = Array.isArray(points) ? points.filter(fuelCoord) : [];
  if (list.length < 2) return null;

  let south = list[0].lat;
  let north = list[0].lat;
  let west = list[0].lng;
  let east = list[0].lng;
  for (const point of list) {
    if (point.lat < south) south = point.lat;
    if (point.lat > north) north = point.lat;
    if (point.lng < west) west = point.lng;
    if (point.lng > east) east = point.lng;
  }

  const padLat = FUEL_BBOX_PAD / 111320;
  const padLng = padLat / Math.max(0.2, Math.cos((((south + north) / 2) * Math.PI) / 180));
  return { south: south - padLat, west: west - padLng, north: north + padLat, east: east + padLng };
}

function fuelBoundsQuery(bounds) {
  const box = [bounds.south, bounds.west, bounds.north, bounds.east].map((value) => value.toFixed(5)).join(',');
  return `[out:json][timeout:25];nwr["amenity"="fuel"](${box});out center 200;`;
}

function fuelAroundQuery(point, radius) {
  if (!fuelCoord(point)) throw new Error('fuel-anchor');
  return `[out:json][timeout:15];nwr["amenity"="fuel"](around:${Math.round(radius)},${point.lat.toFixed(5)},${point.lng.toFixed(5)});out center 60;`;
}

async function fetchFuelStations({ points, lat, lng, radius = FUEL_POINT_RADIUS }) {
  if (!navigator.onLine) throw new Error('offline');
  const bounds = fuelRouteBounds(points);
  const query = bounds ? fuelBoundsQuery(bounds) : fuelAroundQuery({ lat, lng }, radius);
  const controllers = FUEL_ENDPOINTS.map(() => new AbortController());
  const timer = setTimeout(() => controllers.forEach((controller) => controller.abort()), FUEL_TIMEOUT);

  const attempts = FUEL_ENDPOINTS.map(async (endpoint, index) => {
    const response = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`, {
      signal: controllers[index].signal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`fuel-http-${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data?.elements)) throw new Error('fuel-bad-payload');
    return normalizeFuel(data.elements);
  });

  try {
    return await Promise.any(attempts);
  } catch (error) {
    const first = error instanceof AggregateError ? error.errors[0] : error;
    throw first || new Error('fuel-failed');
  } finally {
    clearTimeout(timer);
    controllers.forEach((controller) => controller.abort());
  }
}

function normalizeFuel(elements) {
  const list = [];

  for (const element of elements) {
    const lat = Number(element.lat ?? element.center?.lat);
    const lng = Number(element.lon ?? element.center?.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

    const tags = element.tags ?? {};
    const name = tags.name || tags.brand || tags.operator || '加油站';
    if (list.some((item) => item.name === name && distanceBetween(item, { lat, lng }) < 60)) continue;

    list.push({ id: `${element.type}/${element.id}`, name, brand: tags.brand || '', lat, lng });
  }

  return list;
}