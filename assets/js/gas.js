const FUEL_ENDPOINTS = [
  'https://overpass.openstreetmap.fr/api/interpreter',
  'https://overpass-api.de/api/interpreter',
];

const FUEL_TIMEOUT = 12000;

async function fetchFuelStations({ lat, lng, radius = 4000 }) {
  if (!navigator.onLine) throw new Error('offline');
  const query = `[out:json][timeout:15];nwr["amenity"="fuel"](around:${Math.round(radius)},${lat.toFixed(5)},${lng.toFixed(5)});out center 60;`;
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