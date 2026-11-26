const POI_SEARCH_URL = 'https://restapi.amap.com/v5/place/text';
const PHOTON_SEARCH_URL = 'https://photon.komoot.io/api/';
const CANDIDATE_LIMIT = 5;
const TYPE_TIE_METERS = 300;
const DEFAULT_CLUSTER_RADIUS = 1000;

const CLUSTER_RADIUS = (() => {
  const raw = Number(new URLSearchParams(window.location.search).get('cluster'));
  return Number.isFinite(raw) && raw >= 200 && raw <= 5000 ? raw : DEFAULT_CLUSTER_RADIUS;
})();

const POI_NOISE_TYPE = /售票|停车场|公交车站|游客中心|服务中心|宾馆酒店|餐饮|美食|购物|商店|洗手间|公共厕所|检票口|出入口|进站口|出站口|隧道|快速路出口/;
const PHOTON_NOISE_VALUES = ['bus_stop', 'stop'];
const POI_KIND_RAIL = /火车站|机场|航空港|长途汽车站|客运站|汽车站|railway|aerodrome/;
const POI_KIND_METRO = /地铁站|subway|metro/;
const POI_KIND_CIVIC = /风景名胜|公园|广场|大学|学院|学校|景点|博物馆|纪念馆|scenic|university|college|school|park|square|museum/;

function poiNameKey(name) {
  return (name || '').replace(/[（(].*?[)）]/g, '').replace(/[\s·\-—_]/g, '');
}

function withoutCityPrefix(name, cityName) {
  const city = poiNameKey(cityName).replace(/市$/, '');
  return city && name.startsWith(city) ? name.slice(city.length) : name;
}

function poiNameScore(name, query, cityName) {
  const key = poiNameKey(name);
  const target = poiNameKey(query);
  if (!key || !target) return 3;
  if (key === target) return 0;
  if (withoutCityPrefix(key, cityName).startsWith(target)) return 1;
  if (key.includes(target)) return 2;
  return 3;
}

function poiTypeScore(type, query) {
  if (/站/.test(query)) return POI_KIND_RAIL.test(type) ? 0 : POI_KIND_METRO.test(type) ? 1 : 2;
  return POI_KIND_CIVIC.test(type) ? 0 : POI_KIND_METRO.test(type) ? 1 : 2;
}

function isExactAmapName(name, query) {
  const target = poiNameKey(query);
  return Boolean(target) && poiNameKey(name) === target;
}

function pickGroupHead(members, query) {
  const anchor = members[0];
  const near = members.filter((member) => distanceBetween(anchor, member) < TYPE_TIE_METERS);
  return near.reduce((best, member) => (poiTypeScore(member.type, query) < poiTypeScore(best.type, query) ? member : best), near[0]);
}

function finalizePoiGroups(groups, query) {
  return groups.map((group) => {
    const head = pickGroupHead(group.members, query);
    return {
      ...group,
      name: head.name,
      district: head.district,
      city: head.city,
      province: head.province,
      lat: head.lat,
      lng: head.lng,
      type: head.type,
      source: head.source,
      amapOrder: head.amapOrder,
      photonOrder: head.photonOrder ?? 0,
      exact: head.source === 'amap' && isExactAmapName(head.name, query),
      typeScore: poiTypeScore(head.type, query),
    };
  });
}

function samePoiFamily(a, b) {
  const left = poiNameKey(a.name);
  const right = poiNameKey(b.name);
  if (!left || !right) return false;
  return left.startsWith(right) || right.startsWith(left);
}

function canMergePoi(a, b) {
  if (distanceBetween(a, b) >= CLUSTER_RADIUS) return false;
  if (a.source === b.source) return !a.district || !b.district || a.district === b.district;
  return samePoiFamily(a, b);
}

function clusterPoiItems(items) {
  const groups = [];
  for (const item of items) {
    const group = groups.find((candidate) => candidate.members.some((member) => canMergePoi(member, item)));
    if (group) {
      group.members.push(item);
      continue;
    }
    groups.push({
      name: item.name,
      district: item.district,
      city: item.city,
      province: item.province,
      lat: item.lat,
      lng: item.lng,
      source: item.source,
      amapOrder: item.amapOrder,
      photonOrder: item.photonOrder ?? 0,
      members: [item],
    });
  }
  return groups;
}

function matchesPoiCity(props, cityName) {
  if (!cityName) return true;
  return props.city === cityName || props.state === cityName || props.county === cityName;
}

async function searchAmapPoi(query, cityName) {
  const key = (window.ZENMAP_CONFIG?.amapKey || '').trim();
  if (!key) throw new Error('poi-no-key');

  const params = new URLSearchParams({ key, keywords: query, page_size: '10' });
  if (cityName) {
    params.set('region', cityName);
    params.set('city_limit', 'true');
  }

  const url = `${POI_SEARCH_URL}?${params}`;
  let data = await ZenNet.fetchJson(url, { timeout: 9000, retries: 1 });
  if (data?.status !== '1') data = await ZenNet.fetchJson(url, { timeout: 9000, retries: 1 });
  if (data?.status !== '1') throw new Error(`poi-${data?.infocode || data?.info || 'error'}`);

  return (data.pois || [])
    .map((poi, index) => {
      const [lngGcj, latGcj] = String(poi.location || '').split(',').map(Number);
      if (!Number.isFinite(latGcj) || !Number.isFinite(lngGcj)) return null;
      const point = gcj02ToWgs84(latGcj, lngGcj);
      return {
        name: poi.name || query,
        district: poi.adname || '',
        city: poi.cityname || '',
        province: poi.pname || '',
        lat: point.lat,
        lng: point.lng,
        type: poi.type || '',
        source: 'amap',
        amapOrder: index,
      };
    })
    .filter(Boolean)
    .filter((item) => !POI_NOISE_TYPE.test(item.type));
}

async function searchPhotonPoi(query, cityName) {
  const url = `${PHOTON_SEARCH_URL}?q=${encodeURIComponent(query)}&limit=5&lang=default`;
  const data = await ZenNet.fetchJson(url, { timeout: 9000, retries: 1 });

  return (data?.features || [])
    .map((feature, index) => {
      const coordinates = feature?.geometry?.coordinates;
      if (!Array.isArray(coordinates) || coordinates.length < 2) return null;
      const props = feature.properties || {};
      const [lng, lat] = coordinates;
      return {
        name: props.name || props.street || query,
        district: props.district || props.city || '',
        city: props.city || '',
        province: props.state || '',
        lat,
        lng,
        type: props.osm_value || '',
        source: 'photon',
        amapOrder: Number.MAX_SAFE_INTEGER,
        photonOrder: index,
      };
    })
    .filter(Boolean)
    .filter((item) => !PHOTON_NOISE_VALUES.includes(item.type))
    .filter((item) => matchesPoiCity({ city: item.city, state: item.province, county: item.district }, cityName));
}

async function collectPoiItems(query, cityName) {
  const [amapResult, photonResult] = await Promise.allSettled([
    searchAmapPoi(query, cityName),
    searchPhotonPoi(query, cityName),
  ]);

  const amapItems = amapResult.status === 'fulfilled' ? amapResult.value : [];
  const photonItems = photonResult.status === 'fulfilled' ? photonResult.value : [];

  if (!amapItems.length && !photonItems.length) {
    if (amapResult.status === 'rejected' && photonResult.status === 'rejected') throw photonResult.reason;
    throw new Error('poi-empty');
  }

  return {
    groups: finalizePoiGroups(clusterPoiItems([...amapItems, ...photonItems]), query),
    degraded: amapResult.status === 'rejected',
  };
}

function poiContains(name, query) {
  const key = poiNameKey(query);
  return Boolean(key) && poiNameKey(name).includes(key);
}

function groupLooseMatches(group, query) {
  return group.members.some((member) => poiContains(member.name, query));
}

function groupStrongMatches(group, query, cityName) {
  return group.members.some((member) => poiNameScore(member.name, query, cityName) <= 1);
}

async function buildPoiCandidates(query, { cityName, wide: prefetched } = {}) {
  if (prefetched && (!cityName || prefetched.groups.some((group) => groupStrongMatches(group, query, '')))) {
    return prefetched;
  }

  let local = null;
  try {
    local = await collectPoiItems(query, cityName);
  } catch (error) {
    if (!cityName) throw error;
  }

  if (local && local.groups.some((group) => groupStrongMatches(group, query, cityName))) return local;

  let wide = prefetched;
  if (!wide) {
    try {
      wide = await collectPoiItems(query, '');
    } catch (error) {
      if (local) return local;
      throw error;
    }
  }

  const kept = local ? local.groups.filter((group) => groupLooseMatches(group, query)) : [];
  const matched = wide.groups.filter((group) => groupLooseMatches(group, query));
  if (matched.length) return { groups: [...kept, ...matched], degraded: wide.degraded, crossCity: true };

  if (local) return local;
  throw new Error('poi-empty');
}

function rankPoiGroups(groups, origin, { noPick = false } = {}) {
  const scored = groups.map((group) => ({ ...group, count: group.members.length }));
  const hasOrigin = origin && Number.isFinite(origin.lat) && Number.isFinite(origin.lng);

  const ordered = hasOrigin
    ? scored
        .map((group) => ({ ...group, distance: distanceBetween(origin, group) }))
        .sort((a, b) => a.distance - b.distance)
    : [...scored].sort((a, b) => a.amapOrder - b.amapOrder || a.photonOrder - b.photonOrder);

  if (noPick) return { list: ordered.slice(0, CANDIDATE_LIMIT), selected: 0 };
  return { list: putPickedFirst(ordered, pickPoiGroup(ordered, hasOrigin)), selected: 0 };
}

function pickPoiGroup(ordered, hasOrigin) {
  const exact = ordered.find((group) => group.exact);
  if (exact) return exact;
  if (!hasOrigin) return ordered[0];

  const nearest = ordered[0].distance;
  const tied = ordered.filter((group) => group.distance - nearest < TYPE_TIE_METERS);
  return tied.reduce((best, group) => (compareScores(groupScore(group), groupScore(best)) < 0 ? group : best));
}

function groupScore(group) {
  return [
    group.typeScore,
    group.source === 'amap' ? 0 : 1,
    group.source === 'amap' ? group.amapOrder : group.photonOrder ?? 0,
  ];
}

function compareScores(left, right) {
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return left[index] - right[index];
  }
  return 0;
}

function putPickedFirst(ordered, picked) {
  return [picked, ...ordered.filter((group) => group !== picked)].slice(0, CANDIDATE_LIMIT);
}
