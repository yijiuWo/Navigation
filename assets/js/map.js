const $ = (selector) => document.querySelector(selector);

const els = {
  map: $('#map'),
  mapSkeleton: $('#map-skeleton'),
  mode: $('#mode-label'),
  dest: $('#dest-label'),
  destNote: $('#dest-note'),
  destNoteText: $('#dest-note-text'),
  destNoteWarn: $('#dest-note-warn'),
  destSwitch: $('#dest-switch'),
  destCandidatesPanel: $('#dest-candidates'),
  destCandidatesTitle: $('#dest-candidates-title'),
  destCandidateList: $('#dest-candidate-list'),
  destCandidatesClose: $('#dest-candidates-close'),
  destRetype: $('#dest-retype'),
  topbar: $('.zen-topbar'),
  locate: $('#locate-btn'),
  sheet: $('#sheet'),
  dot: $('#status-dot'),
  statusText: $('#status-text'),
  statusSub: $('#status-sub'),
  retry: $('#retry-btn'),
  manualLink: $('#manual-link'),
  form: $('#origin-form'),
  input: $('#origin-input'),
  error: $('#origin-error'),
  offlineNote: $('#offline-note'),
  banner: $('#alert-banner'),
  bannerTitle: $('#alert-title'),
  bannerSub: $('#alert-sub'),
  routePanel: $('#route-panel'),
  routeTitle: $('#route-title'),
  routeTag: $('#route-tag'),
  routeSummary: $('#route-summary'),
  routeNote: $('#route-note'),
  routeOptions: $('#route-options'),
  routeStrategy: $('#route-strategy'),
  routeSafety: $('#route-safety'),
  safetyDisclaimer: $('#safety-disclaimer'),
  routeStops: $('#route-stops'),
  routeRemind: $('#route-remind'),
  boardName: $('#board-name'),
  alightName: $('#alight-name'),
  alightExtra: $('#alight-extra'),
  transitCross: $('#transit-cross'),
  transitCrossText: $('#transit-cross-text'),
  transitCrossToggle: $('#transit-cross-toggle'),
  transitLegs: $('#transit-legs'),
  threshold: $('#threshold'),
  testAlert: $('#test-alert'),
  remindStatus: $('#remind-status'),
  startNav: $('#start-nav-btn'),
  navBar: $('#nav-bar'),
  navRemain: $('#nav-remain'),
  navEta: $('#nav-eta'),
  navLeg: $('#nav-leg'),
  navOffRoute: $('#nav-offroute'),
  navReroute: $('#nav-reroute'),
  navExit: $('#nav-exit'),
  gasBtn: $('#gas-btn'),
  gasChip: $('#gas-chip'),
  gasChipName: $('#gas-chip-name'),
  gasPanel: $('#gas-panel'),
  gasClose: $('#gas-close'),
  gasRefresh: $('#gas-refresh'),
  gasStatus: $('#gas-status'),
  gasList: $('#gas-list'),
  gasWaypoint: $('#gas-waypoint'),
  gasWaypointName: $('#gas-waypoint-name'),
  gasClear: $('#gas-clear'),
  weatherPanel: $('#weather-panel'),
  weatherTemp: $('#weather-temp'),
  weatherText: $('#weather-text'),
  weatherRain: $('#weather-rain'),
  weatherDest: $('#weather-dest'),
  weatherDestTemp: $('#weather-dest-temp'),
  weatherDestText: $('#weather-dest-text'),
};

const TRIP_KEY = 'zenmap:trip';
const THRESHOLD_KEY = 'zenmap:threshold';
const GEO_TTL = 7 * 24 * 60 * 60 * 1000;
const ROUTE_TTL = 30 * 60 * 1000;
const FUEL_TTL = 30 * 60 * 1000;
const WEATHER_TTL = 20 * 60 * 1000;
const MODE_LABEL = { transit: '公交地铁', drive: '自驾', walk: '步行' };
const MODE_TITLE = { transit: '公交路线', drive: '驾车路线', walk: '步行路线' };
const TRANSIT_STRATEGIES = [
  { value: '0', label: '最快' },
  { value: '2', label: '最少换乘' },
  { value: '5', label: '不乘地铁' },
];
const PLACE_FALLBACK = {
  北京站: { lat: 39.9051, lng: 116.4228, label: '北京站', city: '北京市' },
  北京西站: { lat: 39.894, lng: 116.3151, label: '北京西站', city: '北京市' },
  北京南站: { lat: 39.8646, lng: 116.3709, label: '北京南站', city: '北京市' },
  虹桥火车站: { lat: 31.196, lng: 121.314, label: '虹桥火车站', city: '上海市' },
  人民广场: { lat: 31.234, lng: 121.471, label: '人民广场', city: '上海市' },
  外滩: { lat: 31.235, lng: 121.488, label: '外滩', city: '上海市' },
  上海南站: { lat: 31.155, lng: 121.426, label: '上海南站', city: '上海市' },
  广州塔: { lat: 23.109, lng: 113.318, label: '广州塔', city: '广州市' },
  深圳湾公园: { lat: 22.524, lng: 113.988, label: '深圳湾公园', city: '深圳市' },
  杭州东站: { lat: 30.294, lng: 120.208, label: '杭州东站', city: '杭州市' },
  西安北站: { lat: 34.381, lng: 108.934, label: '西安北站', city: '西安市' },
  成都东站: { lat: 30.631, lng: 104.139, label: '成都东站', city: '成都市' },
  北京: { lat: 39.9057, lng: 116.3913, label: '北京市', city: '北京市' },
  故宫: { lat: 39.9173, lng: 116.3908, label: '故宫', city: '北京市' },
  故宫博物院: { lat: 39.9173, lng: 116.3908, label: '故宫', city: '北京市' },
  西单: { lat: 39.9057, lng: 116.3682, label: '西单', city: '北京市' },
  国贸: { lat: 39.9107, lng: 116.4535, label: '中国国际贸易中心', city: '北京市' },
  北京大学: { lat: 39.9917, lng: 116.304, label: '北京大学', city: '北京市' },
  北京首都国际机场: { lat: 40.0802, lng: 116.5939, label: '北京首都国际机场', city: '北京市' },
  首都机场: { lat: 40.0802, lng: 116.5939, label: '北京首都国际机场', city: '北京市' },
  北京大兴国际机场: { lat: 39.4973, lng: 116.4123, label: '北京大兴国际机场', city: '北京市' },
  大兴机场: { lat: 39.4973, lng: 116.4123, label: '北京大兴国际机场', city: '北京市' },
  上海: { lat: 31.2313, lng: 121.47, label: '上海市', city: '上海市' },
  静安寺: { lat: 31.2252, lng: 121.4408, label: '静安寺', city: '上海市' },
  复旦大学: { lat: 31.3012, lng: 121.4975, label: '复旦大学', city: '上海市' },
  上海迪士尼度假区: { lat: 31.1434, lng: 121.662, label: '上海迪士尼度假区', city: '上海市' },
  迪士尼: { lat: 31.1434, lng: 121.662, label: '上海迪士尼度假区', city: '上海市' },
  上海浦东国际机场: { lat: 31.1427, lng: 121.8041, label: '上海浦东国际机场', city: '上海市' },
  浦东机场: { lat: 31.1427, lng: 121.8041, label: '上海浦东国际机场', city: '上海市' },
  上海虹桥国际机场: { lat: 31.1977, lng: 121.3345, label: '上海虹桥国际机场', city: '上海市' },
  虹桥机场: { lat: 31.1977, lng: 121.3345, label: '上海虹桥国际机场', city: '上海市' },
  广州: { lat: 23.1288, lng: 113.259, label: '广州市', city: '广州市' },
  广州南站: { lat: 22.9911, lng: 113.2605, label: '广州南站', city: '广州市' },
  珠江新城: { lat: 23.122, lng: 113.3158, label: '珠江新城', city: '广州市' },
  琶洲: { lat: 23.101, lng: 113.3612, label: '琶洲', city: '广州市' },
  中山大学: { lat: 23.0996, lng: 113.2924, label: '中山大学（广州校区南校园）', city: '广州市' },
  广州白云国际机场: { lat: 23.3863, lng: 113.3023, label: '广州白云国际机场', city: '广州市' },
  白云机场: { lat: 23.3863, lng: 113.3023, label: '广州白云国际机场', city: '广州市' },
  深圳: { lat: 22.5446, lng: 114.0545, label: '深圳市', city: '深圳市' },
  深圳北站: { lat: 22.613, lng: 114.0251, label: '深圳北站', city: '深圳市' },
  世界之窗: { lat: 22.5375, lng: 113.9686, label: '世界之窗', city: '深圳市' },
  深圳宝安国际机场: { lat: 22.6404, lng: 113.8031, label: '深圳宝安国际机场', city: '深圳市' },
  宝安机场: { lat: 22.6404, lng: 113.8031, label: '深圳宝安国际机场', city: '深圳市' },
  杭州: { lat: 30.249, lng: 120.2052, label: '杭州市', city: '杭州市' },
  西湖: { lat: 30.246, lng: 120.1431, label: '西湖', city: '杭州市' },
  浙江大学: { lat: 30.3051, lng: 120.0753, label: '浙江大学（紫金港校区）', city: '杭州市' },
  杭州萧山国际机场: { lat: 30.2369, lng: 120.4291, label: '杭州萧山国际机场', city: '杭州市' },
  萧山机场: { lat: 30.2369, lng: 120.4291, label: '杭州萧山国际机场', city: '杭州市' },
  西安: { lat: 34.261, lng: 108.9423, label: '西安市', city: '西安市' },
  西安站: { lat: 34.2799, lng: 108.9582, label: '西安站', city: '西安市' },
  大雁塔: { lat: 34.2198, lng: 108.9594, label: '大雁塔', city: '西安市' },
  西安咸阳国际机场: { lat: 34.4424, lng: 108.76, label: '西安咸阳国际机场', city: '西安市' },
  咸阳机场: { lat: 34.4424, lng: 108.76, label: '西安咸阳国际机场', city: '西安市' },
  成都: { lat: 30.6599, lng: 104.0633, label: '成都市', city: '成都市' },
  春熙路: { lat: 30.6592, lng: 104.0753, label: '春熙路', city: '成都市' },
  宽窄巷子: { lat: 30.6662, lng: 104.0508, label: '宽窄巷子', city: '成都市' },
  四川大学: { lat: 30.6335, lng: 104.0816, label: '四川大学（望江校区）', city: '成都市' },
  成都双流国际机场: { lat: 30.5548, lng: 103.9479, label: '成都双流国际机场', city: '成都市' },
  双流机场: { lat: 30.5548, lng: 103.9479, label: '成都双流国际机场', city: '成都市' },
  成都天府国际机场: { lat: 30.3036, lng: 104.4457, label: '成都天府国际机场', city: '成都市' },
  天府机场: { lat: 30.3036, lng: 104.4457, label: '成都天府国际机场', city: '成都市' },
  郑州: { lat: 34.7473, lng: 113.6193, label: '郑州市', city: '郑州市' },
  郑州站: { lat: 34.7475, lng: 113.6537, label: '郑州站', city: '郑州市' },
  郑州东站: { lat: 34.7601, lng: 113.77, label: '郑州东站', city: '郑州市' },
  二七广场: { lat: 34.7536, lng: 113.6593, label: '二七广场', city: '郑州市' },
  中原工学院: { lat: 34.7479, lng: 113.5835, label: '中原工学院', city: '郑州市' },
  郑州方特: { lat: 34.7672, lng: 113.9244, label: '郑州方特欢乐世界', city: '郑州市' },
  郑州方特欢乐世界: { lat: 34.7672, lng: 113.9244, label: '郑州方特欢乐世界', city: '郑州市' },
  郑州新郑国际机场: { lat: 34.5271, lng: 113.8475, label: '郑州新郑国际机场', city: '郑州市' },
  新郑机场: { lat: 34.5271, lng: 113.8475, label: '郑州新郑国际机场', city: '郑州市' },
  武汉: { lat: 30.5789, lng: 114.2921, label: '武汉市', city: '武汉市' },
  武汉站: { lat: 30.6096, lng: 114.4191, label: '武汉站', city: '武汉市' },
  汉口站: { lat: 30.6217, lng: 114.2494, label: '汉口站', city: '武汉市' },
  武昌站: { lat: 30.5311, lng: 114.3122, label: '武昌站', city: '武汉市' },
  黄鹤楼: { lat: 30.5471, lng: 114.297, label: '黄鹤楼', city: '武汉市' },
  江汉路: { lat: 30.5852, lng: 114.2836, label: '江汉路步行街', city: '武汉市' },
  江汉路步行街: { lat: 30.5852, lng: 114.2836, label: '江汉路步行街', city: '武汉市' },
  光谷广场: { lat: 30.5083, lng: 114.3929, label: '光谷广场', city: '武汉市' },
  武汉大学: { lat: 30.5374, lng: 114.3615, label: '武汉大学', city: '武汉市' },
  武汉天河国际机场: { lat: 30.7757, lng: 114.2171, label: '武汉天河国际机场', city: '武汉市' },
  天河机场: { lat: 30.7757, lng: 114.2171, label: '武汉天河国际机场', city: '武汉市' },
  长沙: { lat: 28.2001, lng: 112.9717, label: '长沙市', city: '长沙市' },
  长沙站: { lat: 28.1974, lng: 113.0054, label: '长沙站', city: '长沙市' },
  长沙火车站: { lat: 28.1974, lng: 113.0054, label: '长沙站', city: '长沙市' },
  长沙南站: { lat: 28.1499, lng: 113.0597, label: '长沙南站', city: '长沙市' },
  五一广场: { lat: 28.1986, lng: 112.9709, label: '五一广场', city: '长沙市' },
  橘子洲: { lat: 28.1897, lng: 112.9561, label: '橘子洲', city: '长沙市' },
  湖南大学: { lat: 28.1835, lng: 112.9413, label: '湖南大学', city: '长沙市' },
  长沙黄花国际机场: { lat: 28.1906, lng: 113.2198, label: '长沙黄花国际机场', city: '长沙市' },
  黄花机场: { lat: 28.1906, lng: 113.2198, label: '长沙黄花国际机场', city: '长沙市' },
  南京: { lat: 32.0438, lng: 118.7789, label: '南京市', city: '南京市' },
  南京站: { lat: 32.0913, lng: 118.7914, label: '南京站', city: '南京市' },
  南京南站: { lat: 31.973, lng: 118.7916, label: '南京南站', city: '南京市' },
  新街口: { lat: 32.0436, lng: 118.7789, label: '新街口', city: '南京市' },
  夫子庙: { lat: 32.0263, lng: 118.7857, label: '夫子庙', city: '南京市' },
  南京大学: { lat: 32.0566, lng: 118.7741, label: '南京大学（鼓楼校区）', city: '南京市' },
  南京禄口国际机场: { lat: 31.7318, lng: 118.8723, label: '南京禄口国际机场', city: '南京市' },
  禄口机场: { lat: 31.7318, lng: 118.8723, label: '南京禄口国际机场', city: '南京市' },
  重庆: { lat: 29.5657, lng: 106.5479, label: '重庆市', city: '重庆市' },
  重庆北站: { lat: 29.6098, lng: 106.5462, label: '重庆北站南广场', city: '重庆市' },
  重庆西站: { lat: 29.5029, lng: 106.437, label: '重庆西站', city: '重庆市' },
  沙坪坝站: { lat: 29.5568, lng: 106.4562, label: '沙坪坝站', city: '重庆市' },
  解放碑: { lat: 29.5601, lng: 106.5734, label: '解放碑', city: '重庆市' },
  洪崖洞: { lat: 29.5651, lng: 106.5753, label: '洪崖洞', city: '重庆市' },
  磁器口: { lat: 29.5833, lng: 106.4466, label: '磁器口古镇', city: '重庆市' },
  磁器口古镇: { lat: 29.5833, lng: 106.4466, label: '磁器口古镇', city: '重庆市' },
  重庆江北国际机场: { lat: 29.7267, lng: 106.652, label: '重庆江北国际机场', city: '重庆市' },
  江北机场: { lat: 29.7267, lng: 106.652, label: '重庆江北国际机场', city: '重庆市' },
  天津: { lat: 39.0844, lng: 117.1957, label: '天津市', city: '天津市' },
  天津站: { lat: 39.1371, lng: 117.2036, label: '天津站', city: '天津市' },
  天津西站: { lat: 39.1573, lng: 117.1569, label: '天津西站', city: '天津市' },
  五大道: { lat: 39.1041, lng: 117.1921, label: '五大道', city: '天津市' },
  意式风情区: { lat: 39.1352, lng: 117.1925, label: '意式风情区', city: '天津市' },
  天津滨海国际机场: { lat: 39.1275, lng: 117.3548, label: '天津滨海国际机场', city: '天津市' },
  滨海机场: { lat: 39.1275, lng: 117.3548, label: '天津滨海国际机场', city: '天津市' },
  苏州: { lat: 31.3111, lng: 120.6213, label: '苏州市', city: '苏州市' },
  苏州站: { lat: 31.3318, lng: 120.6063, label: '苏州站', city: '苏州市' },
  拙政园: { lat: 31.3264, lng: 120.6247, label: '拙政园', city: '苏州市' },
  青岛: { lat: 36.0663, lng: 120.3778, label: '青岛市', city: '青岛市' },
  青岛站: { lat: 36.0644, lng: 120.3084, label: '青岛站', city: '青岛市' },
  栈桥: { lat: 36.062, lng: 120.3144, label: '栈桥', city: '青岛市' },
  青岛胶东国际机场: { lat: 36.362, lng: 120.088, label: '青岛胶东国际机场', city: '青岛市' },
  胶东机场: { lat: 36.362, lng: 120.088, label: '青岛胶东国际机场', city: '青岛市' },
  济南: { lat: 36.652, lng: 117.1138, label: '济南市', city: '济南市' },
  济南站: { lat: 36.6687, lng: 116.985, label: '济南站', city: '济南市' },
  济南遥墙国际机场: { lat: 36.8529, lng: 117.211, label: '济南遥墙国际机场', city: '济南市' },
  合肥: { lat: 31.8666, lng: 117.2814, label: '合肥市', city: '合肥市' },
  合肥南站: { lat: 31.8003, lng: 117.2847, label: '合肥南站', city: '合肥市' },
  福州: { lat: 26.0775, lng: 119.2918, label: '福州市', city: '福州市' },
  福州站: { lat: 26.1169, lng: 119.3156, label: '福州站', city: '福州市' },
  厦门: { lat: 24.4801, lng: 118.0853, label: '厦门市', city: '厦门市' },
  厦门站: { lat: 24.4702, lng: 118.1112, label: '厦门站', city: '厦门市' },
  厦门大学: { lat: 24.4399, lng: 118.093, label: '厦门大学', city: '厦门市' },
  厦门高崎国际机场: { lat: 24.5438, lng: 118.1327, label: '厦门高崎国际机场', city: '厦门市' },
  昆明: { lat: 25.0399, lng: 102.7169, label: '昆明市', city: '昆明市' },
  昆明站: { lat: 25.0206, lng: 102.7222, label: '昆明站', city: '昆明市' },
  昆明长水国际机场: { lat: 25.1088, lng: 102.9397, label: '昆明长水国际机场', city: '昆明市' },
  沈阳: { lat: 41.8026, lng: 123.4279, label: '沈阳市', city: '沈阳市' },
  沈阳站: { lat: 41.7915, lng: 123.39, label: '沈阳站', city: '沈阳市' },
  哈尔滨: { lat: 45.7594, lng: 126.6276, label: '哈尔滨市', city: '哈尔滨市' },
  哈尔滨站: { lat: 45.76, lng: 126.6254, label: '哈尔滨站', city: '哈尔滨市' },
  大连: { lat: 38.913, lng: 121.6098, label: '大连市', city: '大连市' },
  大连站: { lat: 38.9217, lng: 121.6277, label: '大连站', city: '大连市' },
  大连周水子国际机场: { lat: 38.9642, lng: 121.5392, label: '大连周水子国际机场', city: '大连市' },
  南宁: { lat: 22.8158, lng: 108.318, label: '南宁市', city: '南宁市' },
  南宁东站: { lat: 22.8448, lng: 108.4099, label: '南宁东站', city: '南宁市' },
  贵阳: { lat: 26.5878, lng: 106.7087, label: '贵阳市', city: '贵阳市' },
  贵阳北站: { lat: 26.6228, lng: 106.6725, label: '贵阳北站', city: '贵阳市' },
  贵阳龙洞堡国际机场: { lat: 26.5409, lng: 106.8022, label: '贵阳龙洞堡国际机场', city: '贵阳市' },
  兰州: { lat: 36.0526, lng: 103.8395, label: '兰州市', city: '兰州市' },
  兰州站: { lat: 36.0342, lng: 103.8485, label: '兰州站', city: '兰州市' },
  石家庄站: { lat: 38.0095, lng: 114.4781, label: '石家庄站', city: '石家庄市' },
  太原: { lat: 37.87, lng: 112.5437, label: '太原市', city: '太原市' },
  太原站: { lat: 37.86, lng: 112.5818, label: '太原站', city: '太原市' },
  南昌: { lat: 28.6773, lng: 115.8997, label: '南昌市', city: '南昌市' },
  南昌站: { lat: 28.6653, lng: 115.9148, label: '南昌站', city: '南昌市' },
  宁波: { lat: 29.872, lng: 121.55, label: '宁波市', city: '宁波市' },
  宁波站: { lat: 29.8646, lng: 121.5327, label: '宁波站', city: '宁波市' },
  温州: { lat: 27.9964, lng: 120.6953, label: '温州市', city: '温州市' },
  温州南站: { lat: 27.9693, lng: 120.5816, label: '温州南站', city: '温州市' },
};
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright" rel="noopener">OpenStreetMap</a> contributors';
const TILE_PRIMARY = { url: 'https://tile.openstreetmap.de/{z}/{x}/{y}.png', maxZoom: 19 };
const TILE_FALLBACK = { url: 'https://b.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', maxZoom: 19 };
const TILE_ERROR_LIMIT = 3;
const TILE_PROBE_TIMEOUT = 1000;
const TILE_SKELETON_MIN = 4;

const trip = readTrip();
const state = {
  origin: null,
  originManual: false,
  originCity: '',
  originCityName: '',
  dest: null,
  destCity: '',
  destCityName: '',
  destLabel: '',
  destCandidates: [],
  watchId: null,
  viewMode: 'none',
  lastFix: null,
  route: null,
  routePending: false,
  planToken: 0,
  routeLayers: [],
  routeCandidates: [],
  selectedRouteIndex: 0,
  transitStrategy: '0',
  transitDemoReason: '',
  transitPending: false,
  bannerTimer: 0,
  nav: { mode: 'off', offHits: 0, lastPan: 0, rerouting: false, view: null },
  engine: null,
  fuel: { loading: false, key: '', list: [], selectedId: '', layers: [] },
  weather: { loading: false, key: '' },
};

let map = null;
let originMarker = null;
let destinationMarker = null;
let accuracyCircle = null;
let originIcon = null;
let manualIcon = null;
let destinationIcon = null;
let tileLayer = null;
let tileErrors = 0;
let tileProbed = false;

function readTrip() {
  try {
    return JSON.parse(sessionStorage.getItem(TRIP_KEY) ?? 'null');
  } catch {
    return null;
  }
}

function readStorage(key) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    sessionStorage.setItem(key, String(value));
  } catch {}
}

function isTransit() {
  return trip?.mode === 'transit';
}

function isDrive() {
  return trip?.mode === 'drive';
}

function isWalk() {
  return trip?.mode === 'walk';
}

function wantsRoute() {
  return isTransit() || isDrive() || isWalk();
}

function ink() {
  return getComputedStyle(document.documentElement).getPropertyValue('--z-ink').trim() || '#0a0a0a';
}

function ghost() {
  return getComputedStyle(document.documentElement).getPropertyValue('--z-ghost').trim() || '#737373';
}

function sheetHeight() {
  return els.sheet ? els.sheet.offsetHeight : 0;
}

function formatMeters(meters) {
  if (!Number.isFinite(meters)) return '—';
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.max(0, Math.round(meters))} m`;
}

function render(kind, payload = {}) {
  const line = kind === 'ok' ? `已定位 ±${payload.accuracy} m` : kind === 'manual' ? `起点：${payload.label}` : STATUS[kind]()[0];
  const sub = kind === 'ok' ? '定位实时更新' : kind === 'manual' ? '手动设置 · 未使用实时定位' : STATUS[kind]()[1];

  els.statusText.textContent = line;
  els.statusSub.textContent = sub;
  els.dot.hidden = kind !== 'locating';
  els.retry.hidden = !['denied', 'timeout', 'unavailable', 'manual'].includes(kind);
  els.retry.textContent = kind === 'manual' ? '改用定位' : '重试定位';

  if (kind === 'manual') hideForm();
  if (FAILURES.includes(kind)) showForm(false);

  els.manualLink.hidden = kind === 'manual' || !els.form.hidden;
}

const STATUS = {
  locating: () => ['正在获取位置…', '首次使用请允许位置权限'],
  denied: () => ['位置权限被拒绝', '允许权限后重试，或手动设置起点'],
  timeout: () => ['定位超时', '到开阔处重试，或手动设置起点'],
  unavailable: () => ['暂时无法获取位置', '检查系统定位开关后重试，或手动设置起点'],
  insecure: () => ['无法使用定位', '需 HTTPS 或 localhost 打开；可手动设置起点'],
  unsupported: () => ['此浏览器不支持定位', '请手动设置起点'],
};

const FAILURES = ['denied', 'timeout', 'unavailable', 'insecure', 'unsupported'];

function showForm(focus) {
  els.form.hidden = false;
  els.error.hidden = true;
  els.manualLink.hidden = true;
  if (focus) els.input.focus({ preventScroll: true });
}

function hideForm() {
  els.form.hidden = true;
  els.input.value = '';
  els.error.hidden = true;
  els.manualLink.hidden = state.originManual;
}

function startWatch() {
  if (!('geolocation' in navigator)) {
    render('unsupported');
    return;
  }
  if (!window.isSecureContext) {
    render('insecure');
    return;
  }

  stopWatch();
  hideForm();
  render('locating');

  try {
    state.watchId = navigator.geolocation.watchPosition(onFix, onGeoError, {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 15000,
    });
  } catch {
    render('unavailable');
  }
}

function stopWatch() {
  if (state.watchId !== null) {
    navigator.geolocation.clearWatch(state.watchId);
    state.watchId = null;
  }
}

function onFix(position) {
  if (!els.form.hidden) return;
  const { latitude: lat, longitude: lng, accuracy } = position.coords;
  const fix = { lat, lng, accuracy, timestamp: position.timestamp || Date.now() };
  state.lastFix = fix;
  setOrigin(L.latLng(lat, lng), { manual: false, accuracy });
  render('ok', { accuracy: Math.round(accuracy) });
  considerView();
  if (isTransit()) {
    maybePlanRoute();
    feedReminder(fix);
  }
  if (isDrive()) maybePlanRoute();
  loadWeather();
  if (isWalk()) maybePlanRoute();
  if (state.nav.mode !== 'off') updateNavigation(fix);
}

function onGeoError(error) {
  stopWatch();
  if (error.code === 1) {
    render('denied');
  } else if (error.code === 3) {
    render('timeout');
  } else {
    render('unavailable');
  }
}

function setOrigin(latlng, { manual, accuracy = 0 }) {
  state.origin = latlng;
  state.originManual = manual;

  if (!originMarker) {
    originMarker = L.marker(latlng, {
      icon: manual ? manualIcon : originIcon,
      keyboard: false,
      zIndexOffset: 400,
    }).addTo(map);
  } else {
    originMarker.setLatLng(latlng);
    originMarker.setIcon(manual ? manualIcon : originIcon);
  }

  if (manual || accuracy <= 0) {
    if (accuracyCircle) {
      accuracyCircle.remove();
      accuracyCircle = null;
    }
    return;
  }

  const color = ink();
  if (!accuracyCircle) {
    accuracyCircle = L.circle(latlng, {
      radius: accuracy,
      color,
      weight: 1,
      opacity: 0.3,
      fillColor: color,
      fillOpacity: 0.05,
      interactive: false,
    }).addTo(map);
  } else {
    accuracyCircle.setLatLng(latlng);
    accuracyCircle.setRadius(accuracy);
  }
}

function considerView() {
  if (state.route || state.viewMode === 'both') return;
  const { origin, dest } = state;

  if (origin && dest) {
    state.viewMode = 'both';
    if (origin.distanceTo(dest) < 30) {
      map.setView(origin, 16);
      return;
    }
    map.fitBounds(L.latLngBounds(origin, dest).pad(0.35), {
      paddingTopLeft: [36, 96],
      paddingBottomRight: [36, sheetHeight() + 24],
      maxZoom: 15,
    });
  } else if (origin) {
    state.viewMode = 'origin';
    map.setView(origin, 15);
  } else if (dest) {
    state.viewMode = 'dest';
    map.setView(dest, 13);
  }
}

let destToken = 0;

async function waitForOrigin(timeout = 6000) {
  const started = Date.now();
  while (!state.origin && Date.now() - started < timeout) {
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}

async function resolveDestination() {
  const token = ++destToken;
  els.destNote.hidden = false;
  els.destNoteWarn.hidden = true;
  els.destSwitch.hidden = true;
  els.destNoteText.textContent = '正在定位目的地…';
  hideCandidatePanel();
  await waitForOrigin();

  try {
    const place = await geocode(trip.destination);
    if (token !== destToken) return;
    state.destCandidates = (place.candidates || []).length > 1 ? place.candidates : [];
    if (place.degraded) els.destNoteWarn.hidden = false;

    if (state.destCandidates.length) {
      els.destNoteText.textContent = `找到 ${state.destCandidates.length} 个可能地点`;
      els.destSwitch.textContent = '看候选';
      els.destSwitch.hidden = false;
      renderCandidatePanel();
      return;
    }
    applyChoice({ name: place.label, district: place.district, lat: place.lat, lng: place.lng, transitCity: place.city, cityName: place.cityName || place.city }, { plan: true });
  } catch {
    if (token !== destToken) return;
    state.destCandidates = [];
    hideCandidatePanel();
    els.destNoteText.textContent = `没找到「${trip.destination}」，试试输入城市名、火车站或地标`;
  }
}

function applyChoice(choice, { plan }) {
  const latlng = L.latLng(choice.lat, choice.lng);
  state.dest = latlng;
  state.destLabel = choice.name || trip.destination;
  state.destCity = choice.transitCity || '';
  state.destCityName = choice.cityName || '';
  if (destinationMarker) map.removeLayer(destinationMarker);
  destinationMarker = L.marker(latlng, { icon: destinationIcon, keyboard: false }).addTo(map);

  hideCandidatePanel();
  els.destNoteText.textContent = `已定位：${choice.name}${choice.district ? `（${choice.district}）` : ''}`;
  els.destSwitch.textContent = '换一个';
  els.destSwitch.hidden = state.destCandidates.length < 2;

  considerView();
  if (!plan) return;
  if (wantsRoute()) maybePlanRoute();
  loadWeather();
  loadDestWeather();
}

function renderCandidatePanel() {
  els.destCandidatesTitle.textContent = `找到 ${state.destCandidates.length} 个可能地点`;
  els.destCandidateList.textContent = '';

  state.destCandidates.forEach((candidate, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.candidateIndex = String(index);
    button.className = `zen-option w-full border border-zen-line px-3 py-2.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zen-ink${index === 0 ? ' zen-option-active' : ''}`;

    const name = document.createElement('span');
    name.className = 'block text-sm font-medium tracking-[-0.01em]';
    name.textContent = candidate.name;

    const detail = document.createElement('span');
    detail.className = 'zen-cand-sub mt-0.5 block text-xs leading-5 text-zen-ghost';
    detail.textContent = candidateDetail(candidate);

    button.append(name, detail);
    const item = document.createElement('li');
    item.append(button);
    els.destCandidateList.append(item);
  });

  els.destCandidatesPanel.hidden = false;
}

function candidateDetail(candidate) {
  const parts = [];
  if (candidate.district) parts.push(candidate.district);
  if (state.origin) parts.push(`距起点 ${(distanceBetween(state.origin, candidate) / 1000).toFixed(1)} km`);
  if ((candidate.members || []).length > 1) parts.push(`同片区共 ${candidate.members.length} 个场所`);
  return parts.join(' · ');
}

function hideCandidatePanel() {
  els.destCandidatesPanel.hidden = true;
}

function selectCandidate(index) {
  const candidate = state.destCandidates[index];
  if (!candidate) return;
  resetRouteState();
  applyChoice({ name: candidate.name, district: candidate.district, lat: candidate.lat, lng: candidate.lng, transitCity: candidate.province || candidate.city, cityName: candidate.city || candidate.province }, { plan: true });
}

async function geocode(query) {
  const cacheKey = `zenmap:geo:v3:${query.trim().toLowerCase()}`;
  const cached = ZenStore.get(cacheKey, GEO_TTL);
  if (cached) return pickPlace(cached);

  const cityTask = poiCityName();
  const wideTask = collectPoiItems(query, '').catch(() => null);
  const [cityName, wide] = await Promise.all([cityTask, wideTask]);

  try {
    const result = await buildPoiCandidates(query, { cityName, wide });
    ZenStore.set(cacheKey, result);
    return pickPlace(result);
  } catch (error) {
    const stale = ZenStore.getStale(cacheKey);
    if (stale) return pickPlace(stale);
    const fallback = PLACE_FALLBACK[query.trim().toLowerCase()];
    if (fallback) return { ...fallback, district: '', cityName: '', candidates: null, selected: 0, degraded: true };
    throw error;
  }
}

function pickPlace(result) {
  const ranked = rankPoiGroups(result.groups, state.origin);
  const picked = ranked.list[ranked.selected];
  if (!picked) throw new Error('geocode-empty');

  return {
    lat: picked.lat,
    lng: picked.lng,
    label: picked.name,
    district: picked.district || '',
    city: picked.province || picked.city || '',
    cityName: picked.city || picked.province || '',
    candidates: ranked.list,
    selected: ranked.selected,
    degraded: !!result.degraded,
  };
}

async function poiCityName() {
  if (state.originCityName) return state.originCityName;
  if (!state.origin) return '';
  const info = await reverseCity(state.origin);
  return info.city || info.province || '';
}

const reversePending = new Map();

async function reverseCity(latlng) {
  const cacheKey = `zenmap:rev:v2:${latlng.lat.toFixed(3)},${latlng.lng.toFixed(3)}`;
  const cached = ZenStore.get(cacheKey, GEO_TTL);
  if (cached) return cached;
  if (reversePending.has(cacheKey)) return reversePending.get(cacheKey);

  const task = (async () => {
    try {
      const url = `https://photon.komoot.io/reverse?lat=${latlng.lat}&lon=${latlng.lng}&lang=default`;
      const data = await ZenNet.fetchJson(url, { timeout: 8000, retries: 0 });
      const props = data?.features?.[0]?.properties ?? {};
      const info = { province: props.state || '', city: props.city || '' };
      ZenStore.set(cacheKey, info);
      return info;
    } catch {
      return ZenStore.getStale(cacheKey) ?? { province: '', city: '' };
    } finally {
      reversePending.delete(cacheKey);
    }
  })();

  reversePending.set(cacheKey, task);
  return task;
}

async function cityNameForTransit(latlng) {
  const info = await reverseCity(latlng);
  return info.province || info.city || '';
}

function showOriginError(message) {
  els.error.textContent = message;
  els.error.hidden = false;
}

function setBusy(busy) {
  const button = els.form.querySelector('button[type="submit"]');
  button.disabled = busy;
  button.classList.toggle('opacity-40', busy);
}

async function onSubmit(event) {
  event.preventDefault();
  const query = els.input.value.replace(/\s+/g, ' ').trim();
  if (!query) {
    showOriginError('先写一个起点');
    return;
  }

  setBusy(true);
  els.error.hidden = true;

  try {
    const place = await geocode(query);
    stopWatch();
    setOrigin(L.latLng(place.lat, place.lng), { manual: true });
    state.originCity = place.city || '';
    state.originCityName = place.cityName || place.city || '';
    render('manual', { label: place.label });
    state.viewMode = 'none';
    if (wantsRoute()) resetRouteState();
    await resolveDestination();
    considerView();
  } catch {
    showOriginError('没找到这个地点，或服务暂不可用');
    els.input.focus({ preventScroll: true });
  } finally {
    setBusy(false);
  }
}

function resetRouteState() {
  state.planToken += 1;
  state.routePending = false;
  state.transitPending = false;
  state.route = null;
  state.routeCandidates = [];
  state.selectedRouteIndex = 0;
  state.transitDemoReason = '';
  state.engine?.clear();
  clearRouteLayers();
  els.routeOptions.hidden = true;
  els.routeOptions.textContent = '';
  els.safetyDisclaimer.hidden = true;
  syncStartNavButton();
}

const STAGED_NOTE_DELAY = 5000;
const STAGED_NOTE_TEXT = '网络较慢，仍在重试';

function beginStagedNote() {
  const timer = window.setTimeout(() => {
    els.routeNote.hidden = false;
    els.routeNote.textContent = STAGED_NOTE_TEXT;
  }, STAGED_NOTE_DELAY);

  return () => {
    window.clearTimeout(timer);
    if (els.routeNote.textContent === STAGED_NOTE_TEXT) els.routeNote.hidden = true;
  };
}

async function planTransitTrip() {
  if (!isTransit() || !state.origin || !state.dest || state.route || state.routePending) return;

  const token = state.planToken;
  state.routePending = true;
  els.routePanel.hidden = false;
  els.routeTag.textContent = '';
  els.routeSummary.textContent = '正在规划路线…';
  els.routeNote.hidden = true;
  els.remindStatus.textContent = '等待定位…';
  renderTransitStrategy();
  const staged = beginStagedNote();

  try {
    const plans = await loadTransitPlans(state.transitStrategy);
    if (token !== state.planToken) return;
    applyTransitPlans(plans, '');
  } catch (error) {
    if (token !== state.planToken) return;
    const reason = error?.message === 'no-key' || error?.message === 'no-city' ? error.message : 'api';
    applyTransitPlans([buildDemoRoute(state.origin, state.dest)], reason);
  } finally {
    staged();
    if (token === state.planToken) state.routePending = false;
  }
}

async function loadTransitPlans(strategy) {
  const routeKey = routeCacheKey('transit', 'v2', strategy);
  const cached = ZenStore.get(routeKey, ROUTE_TTL);
  if (Array.isArray(cached) && cached.length) return cached;

  const key = (window.ZENMAP_CONFIG?.amapKey || '').trim();
  if (!key) throw new Error('no-key');
  const city1 = state.originCity || (await cityNameForTransit(state.origin));
  const city2 = state.destCity || (await cityNameForTransit(state.dest));
  if (!city1 || !city2) throw new Error('no-city');

  const plans = await fetchTransitPlans({
    key,
    origin: state.origin,
    destination: state.dest,
    city1,
    city2,
    destinationName: state.destLabel,
    strategy,
  });
  for (const plan of plans) plan.crossCity = city1 !== city2;
  state.originCity = city1;
  state.destCity = city2;
  ZenStore.set(routeKey, plans);
  return plans;
}

function applyTransitPlans(plans, demoReason) {
  state.routeCandidates = plans;
  state.selectedRouteIndex = 0;
  state.transitDemoReason = demoReason;
  applyRoute(plans[0], demoReason);
  renderTransitOptions();
  renderTransitStrategy();
}

async function switchTransitStrategy(strategy) {
  if (strategy === state.transitStrategy || state.transitPending || !state.routeCandidates.length) return;

  const previous = state.transitStrategy;
  const token = state.planToken;
  state.transitStrategy = strategy;
  state.transitPending = true;
  els.routeNote.hidden = false;
  els.routeNote.textContent = '正在刷新方案…';
  renderTransitStrategy();

  try {
    const plans = await loadTransitPlans(strategy);
    if (token !== state.planToken || strategy !== state.transitStrategy) return;
    applyTransitPlans(plans, '');
  } catch {
    if (token !== state.planToken) return;
    state.transitStrategy = previous;
    els.routeNote.textContent = '策略切换失败，仍是上次结果，可稍后重试';
    renderTransitStrategy();
  } finally {
    if (token === state.planToken) {
      state.transitPending = false;
      renderTransitStrategy();
    }
  }
}

function renderTransitStrategy() {
  if (!isTransit()) {
    els.routeStrategy.hidden = true;
    return;
  }
  els.routeStrategy.hidden = false;
  els.routeStrategy.setAttribute('aria-busy', String(state.transitPending));
  els.routeStrategy.textContent = '';

  for (const option of TRANSIT_STRATEGIES) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.strategy = option.value;
    button.setAttribute('aria-pressed', String(option.value === state.transitStrategy));
    button.setAttribute('aria-busy', String(state.transitPending));
    button.disabled = state.transitPending;
    button.className = 'zen-mini text-xs';
    button.textContent = option.label;
    els.routeStrategy.append(button);
  }
}

function selectTransitPlan(index) {
  const plan = state.routeCandidates[index];
  if (!plan || index === state.selectedRouteIndex) return;
  state.selectedRouteIndex = index;
  applyRoute(plan, state.transitDemoReason);
  renderTransitOptions();
}

function renderTransitOptions() {
  els.routeOptions.hidden = false;
  els.routeOptions.textContent = '';

  for (const [index, plan] of state.routeCandidates.entries()) {
    const active = index === state.selectedRouteIndex;

    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.index = String(index);
    button.setAttribute('aria-pressed', String(active));
    button.className = `zen-option border border-zen-line px-3 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zen-ink${active ? ' zen-option-active' : ''}`;

    const name = document.createElement('span');
    name.className = 'block text-[0.6875rem] tracking-[0.12em]';
    name.textContent = plan.demo ? `${plan.id} · 离线演示` : plan.id;

    const metric = document.createElement('span');
    metric.className = 'mt-1 block text-sm font-medium tracking-tight';
    metric.textContent = [plan.title, formatDuration(plan.duration), plan.cost != null ? `¥${plan.cost}` : '']
      .filter(Boolean)
      .join(' · ');

    const meta = document.createElement('span');
    meta.className = 'mt-1 block text-[0.6875rem] opacity-70';
    const bits = plan.modeTags.slice();
    if (plan.transferCount > 0) bits.push(`换乘 ${plan.transferCount} 次`);
    if (plan.walkingDistance > 0) bits.push(`步行 ${formatMeters(plan.walkingDistance)}`);
    meta.textContent = bits.join(' · ');

    button.append(name, metric, meta);
    els.routeOptions.append(button);
  }
}

let planScheduled = false;
function maybePlanRoute() {
  if (!wantsRoute() || !state.origin || !state.dest || state.route || state.routePending) return;
  if (planScheduled) return;
  planScheduled = true;
  queueMicrotask(() => {
    planScheduled = false;
    if (isTransit()) planTransitTrip();
    else if (isWalk()) planWalkTrip();
    else planDriveTrip();
  });
}

function routeCacheKey(prefix, version = 'v1', suffix = '') {
  const pair = `${state.origin.lat.toFixed(4)},${state.origin.lng.toFixed(4)}>${state.dest.lat.toFixed(4)},${state.dest.lng.toFixed(4)}`;
  return `zenmap:${prefix}:${version}${suffix ? `:${suffix}` : ''}:${pair}`;
}

async function planDriveTrip() {
  if (!isDrive() || !state.origin || !state.dest || state.route || state.routePending) return;

  const token = state.planToken;
  state.routePending = true;
  els.routePanel.hidden = false;
  els.routeTag.textContent = '';
  els.routeSummary.textContent = '正在规划路线…';
  els.routeNote.hidden = true;
  els.routeOptions.hidden = true;
  els.routeSafety.hidden = true;
  const staged = beginStagedNote();

  const routeKey = routeCacheKey('drive');
  try {
    const cached = ZenStore.get(routeKey, ROUTE_TTL);
    if (Array.isArray(cached) && cached.length) {
      await applyDriveRoutes(cached, token);
      return;
    }
    const routes = await fetchDriveRoutes({ origin: state.origin, destination: state.dest });
    if (token !== state.planToken) return;
    ZenStore.set(routeKey, routes);
    await applyDriveRoutes(routes, token);
  } catch {
    if (token !== state.planToken) return;
    await applyDriveRoutes(buildDriveEstimates(state.origin, state.dest, 2), token);
  } finally {
    staged();
    if (token === state.planToken) state.routePending = false;
  }
}

async function planWalkTrip() {
  if (!isWalk() || !state.origin || !state.dest || state.route || state.routePending) return;

  const token = state.planToken;
  state.routePending = true;
  els.routePanel.hidden = false;
  els.routeTag.textContent = '';
  els.routeSummary.textContent = '正在规划路线…';
  els.routeNote.hidden = true;
  els.routeOptions.hidden = true;
  els.routeSafety.hidden = true;

  const routeKey = routeCacheKey('walk');
  const staged = beginStagedNote();
  try {
    const cached = ZenStore.get(routeKey, ROUTE_TTL);
    if (cached) {
      await applyWalkRoute(cached, token);
      return;
    }
    const route = await fetchWalkRoute({ origin: state.origin, destination: state.dest });
    if (token !== state.planToken) return;
    ZenStore.set(routeKey, route);
    await applyWalkRoute(route, token);
  } catch {
    if (token !== state.planToken) return;
    await applyWalkRoute(buildWalkEstimate(state.origin, state.dest), token);
  } finally {
    staged();
    if (token === state.planToken) state.routePending = false;
  }
}

async function applyWalkRoute(route, token) {
  if (token !== state.planToken) return;

  const weather = await weatherForScoring(state.origin);
  if (token !== state.planToken) return;
  route.safety = scoreRoute(route.points, { weather, mode: 'walk' });

  state.route = route;
  els.routePanel.hidden = false;
  els.routeTag.textContent = route.estimated ? '直线估算' : 'OSRM · 步行';
  els.routeSummary.textContent = `${formatMeters(route.total)} · ${formatDuration(route.duration)}`;
  els.routeNote.hidden = false;
  els.routeNote.textContent = route.estimated
    ? '步行路径服务暂不可用，当前为直线估算'
    : '步行路线来自 OSM 步行路网，国内人行道覆盖有限';

  clearRouteLayers();
  renderRouteSafety(route, '步行评分基于演示风险数据与天气估算，仅供参考');
  const color = ink();
  state.routeLayers.push(
    L.polyline(
      route.points.map((point) => [point.lat, point.lng]),
      route.estimated
        ? { color, weight: 4, opacity: 0.9, dashArray: '6 8', lineCap: 'round' }
        : { color, weight: 4, opacity: 0.9, lineCap: 'round' },
    ).addTo(map),
  );

  const bounds = L.latLngBounds(route.points.map((point) => [point.lat, point.lng]));
  map.fitBounds(bounds.pad(0.12), {
    paddingTopLeft: [36, 96],
    paddingBottomRight: [36, sheetHeight() + 24],
    maxZoom: 16,
  });
  state.viewMode = 'both';
  syncStartNavButton();
}

async function weatherForScoring(place) {
  const cacheKey = `zenmap:weather:v1:${place.lat.toFixed(2)},${place.lng.toFixed(2)}`;
  const cached = ZenStore.get(cacheKey, WEATHER_TTL);
  if (cached) return cached;

  try {
    const weather = await fetchWeather({ lat: place.lat, lng: place.lng });
    ZenStore.set(cacheKey, weather);
    return weather;
  } catch {
    return ZenStore.getStale(cacheKey);
  }
}

function applyRoute(route, demoReason) {
  state.route = route;
  renderRouteInfo(route, demoReason);
  drawRoute(route);
  state.engine?.setRoute(route);
  if (state.lastFix) feedReminder(state.lastFix);
  syncStartNavButton();
}

function renderRouteInfo(route, demoReason) {
  els.routePanel.hidden = false;
  els.routeTag.textContent = demoReason ? '离线演示' : '高德 · 公交';

  const bits = [formatDuration(route.duration)];
  if (route.walkingDistance > 0) bits.push(`步行 ${formatMeters(route.walkingDistance)}`);
  if (route.totalDistance > 0) bits.push(`全程 ${formatMeters(route.totalDistance)}`);
  if (route.cost != null) bits.push(`¥${route.cost}`);
  els.routeSummary.textContent = bits.join(' · ');

  renderTransitStops(route);
  renderTransitCross(route);

  const note = transitRouteNote(route, demoReason);
  els.routeNote.hidden = !note;
  els.routeNote.textContent = note;
}

function transitRouteNote(route, demoReason) {
  if (demoReason === 'no-key') return '未配置高德 Key，当前为离线演示线路；填入 Key 后自动切换真实线路';
  if (demoReason === 'no-city') return '无法确定所在城市，当前为离线演示线路';
  if (demoReason) return '线路服务暂不可用，当前为离线演示线路';
  if (route.noMetroFallback) return '没有找到不含地铁的方案，仍显示原结果';
  return '';
}

function formatDuration(seconds) {
  const total = Math.max(1, Math.round((Number(seconds) || 0) / 60));
  const hours = Math.floor(total / 60);
  return hours ? `约 ${hours} 小时 ${total % 60} 分` : `约 ${total} 分钟`;
}

function formatAmapClock(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (digits.length < 3) return '';
  const time = digits.slice(-4).padStart(4, '0');
  return `${time.slice(0, 2)}:${time.slice(2)}`;
}

function lastRideLegs(route) {
  const rides = route.legs.filter((leg) => !leg.walking);
  const taxi = rides.length && rides[rides.length - 1].kind === 'taxi' ? rides[rides.length - 1] : null;
  return { taxi, last: taxi ? rides[rides.length - 2] : rides[rides.length - 1] };
}

function railwayLabel(leg) {
  const clock = formatAmapClock(leg.fromTime);
  const arrive = `${formatAmapClock(leg.toTime)}${leg.toNextDay ? ' 次日' : ''}`;
  if (!clock) return [leg.toName, leg.name].filter(Boolean).join(' · ');
  return `${leg.toName} · ${leg.name} ${clock} → ${arrive}`;
}

function renderTransitStops(route) {
  els.boardName.textContent = route.boarding.name || '上车站';
  const { taxi, last } = lastRideLegs(route);

  if (last?.kind === 'railway') {
    els.alightName.textContent = railwayLabel(last) || route.alighting.name || '下车站';
  } else {
    els.alightName.textContent = (last && last.toName) || route.alighting.name || '下车站';
  }

  if (taxi) {
    els.alightExtra.textContent = `${taxi.toName || '目的地'}（打车 ${formatMeters(taxi.distance)}）`;
    els.alightExtra.hidden = false;
  } else {
    els.alightExtra.hidden = true;
  }
}

function renderTransitCross(route) {
  els.transitCross.hidden = !route.crossCity;
  els.transitLegs.hidden = true;
  els.transitCrossToggle.textContent = '查看分段';
  if (!route.crossCity) return;

  els.transitCrossText.textContent = '跨城出行建议乘高铁，普速方案仅供参考';
  els.transitLegs.textContent = '';
  for (const leg of route.legs) {
    const item = document.createElement('li');
    item.textContent = transitLegText(leg);
    els.transitLegs.append(item);
  }
}

function transitLegText(leg) {
  const distance = leg.distance > 0 ? ` · ${formatMeters(leg.distance)}` : '';
  if (leg.walking) return `步行${distance}`;
  if (leg.kind === 'railway') {
    return `${leg.name}｜${leg.fromName} ${formatAmapClock(leg.fromTime)} → ${leg.toName} ${formatAmapClock(leg.toTime)}${leg.toNextDay ? '（次日）' : ''}${distance}`;
  }
  if (leg.kind === 'taxi') return `打车｜${leg.fromName || '上车点'} → ${leg.toName || '目的地'}${distance}`;
  return `${leg.name}｜${leg.fromName} → ${leg.toName}${distance}`;
}

function drawRoute(route) {
  clearRouteLayers();
  const color = ink();

  for (const leg of route.legs) {
    if (leg.points.length < 2) continue;
    const style = leg.walking
      ? { color, weight: 2, opacity: 0.35, dashArray: '1 6', lineCap: 'round' }
      : leg.kind === 'taxi'
        ? { color, weight: 3, opacity: 0.7, dashArray: '8 8', lineCap: 'round' }
        : { color, weight: 4, opacity: 0.9, lineCap: 'round' };
    state.routeLayers.push(L.polyline(leg.points.map((point) => [point.lat, point.lng]), style).addTo(map));
  }

  const boardIcon = L.divIcon({
    className: '',
    html: '<span class="zen-stop-board"></span>',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
  const alightIcon = L.divIcon({
    className: '',
    html: '<span class="zen-stop-alight"></span>',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

  state.routeLayers.push(
    L.marker([route.boarding.lat, route.boarding.lng], { icon: boardIcon, keyboard: false, zIndexOffset: 200 }).addTo(map),
    L.marker([route.alighting.lat, route.alighting.lng], { icon: alightIcon, keyboard: false, zIndexOffset: 200 }).addTo(map),
  );

  const bounds = L.latLngBounds(route.points.map((point) => [point.lat, point.lng]));
  map.fitBounds(bounds.pad(0.12), {
    paddingTopLeft: [36, 96],
    paddingBottomRight: [36, sheetHeight() + 24],
    maxZoom: 16,
  });
  state.viewMode = 'both';
}

async function applyDriveRoutes(routes, token) {
  const weather = await weatherForScoring(state.origin);
  if (token !== state.planToken) return;

  state.routeCandidates = routes.map((route) => ({ ...route, safety: scoreRoute(route.points, { weather }) }));
  state.selectedRouteIndex = 0;
  drawDriveSelection();
}

function driveRoutesEstimated() {
  return state.routeCandidates.every((candidate) => candidate.estimated);
}

function selectDrivePlan(index) {
  if (!state.routeCandidates[index] || index === state.selectedRouteIndex) return;
  state.selectedRouteIndex = index;
  drawDriveSelection();
}

function drawDriveSelection() {
  const selected = state.routeCandidates[state.selectedRouteIndex];
  if (!selected) return;

  state.route = selected;
  els.routePanel.hidden = false;
  els.routeTag.textContent = driveRoutesEstimated()
    ? '直线估算'
    : `OSRM · 自驾 · ${state.routeCandidates.length} 条方案`;
  els.routeSummary.textContent = `${formatMeters(selected.total)} · ${formatDuration(selected.duration)}`;
  els.routeNote.hidden = !selected.estimated;
  els.routeNote.textContent = selected.estimated ? '路径服务暂不可用，当前为直线估算' : '';

  clearRouteLayers();
  const color = ink();
  const faded = ghost();

  for (const [index, candidate] of state.routeCandidates.entries()) {
    if (index === state.selectedRouteIndex) continue;
    const line = L.polyline(
      candidate.points.map((point) => [point.lat, point.lng]),
      { color: faded, weight: 3, opacity: 0.35, lineCap: 'round' },
    ).addTo(map);
    line.zenFaded = true;
    state.routeLayers.push(line);
  }

  const selectedLine = L.polyline(
    selected.points.map((point) => [point.lat, point.lng]),
    selected.estimated
      ? { color, weight: 4, opacity: 0.9, dashArray: '6 8', lineCap: 'round' }
      : { color, weight: 4, opacity: 0.9, lineCap: 'round' },
  ).addTo(map);
  state.routeLayers.push(selectedLine);

  renderDriveOptions();
  renderRouteSafety(selected, '安全评分为启发式估算，风险数据为演示样本');

  const bounds = L.latLngBounds(
    state.routeCandidates.flatMap((candidate) => candidate.points.map((point) => [point.lat, point.lng])),
  );
  map.fitBounds(bounds.pad(0.12), {
    paddingTopLeft: [36, 96],
    paddingBottomRight: [36, sheetHeight() + 24],
    maxZoom: 16,
  });
  state.viewMode = 'both';
  syncStartNavButton();
}

function renderDriveOptions() {
  els.routeOptions.hidden = false;
  els.routeOptions.textContent = '';

  for (const [index, candidate] of state.routeCandidates.entries()) {
    const grade = scoreGrade(candidate.safety.score);
    const active = index === state.selectedRouteIndex;

    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.index = String(index);
    button.setAttribute('aria-pressed', String(active));
    button.className = `zen-option border border-zen-line px-3 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zen-ink${active ? ' zen-option-active' : ''}`;

    const name = document.createElement('span');
    name.className = 'block text-[0.6875rem] tracking-[0.12em]';
    name.textContent = candidate.estimated ? `${candidate.id} · 直线估算` : candidate.id;

    const metric = document.createElement('span');
    metric.className = 'mt-1 block text-sm font-medium tracking-tight';
    metric.textContent = `${formatMeters(candidate.total)} · ${formatDuration(candidate.duration)}`;

    const score = document.createElement('span');
    score.className = `zen-grade-${grade.tone} mt-1 block text-[0.6875rem]`;
    score.textContent = `安全 ${candidate.safety.score} · ${grade.label}`;

    button.append(name, metric, score);
    els.routeOptions.append(button);
  }
}

function renderRouteSafety(candidate, disclaimerText = '') {
  els.routeSafety.hidden = false;
  els.routeSafety.textContent = '';

  const grade = scoreGrade(candidate.safety.score);
  const head = document.createElement('p');
  head.className = 'text-xs leading-5 text-zen-ghost';
  head.append(`安全评分 ${candidate.safety.score} · `);

  const label = document.createElement('span');
  label.className = `zen-grade-${grade.tone} font-medium`;
  label.textContent = grade.label;
  head.append(label);
  els.routeSafety.append(head);

  for (const factor of candidate.safety.factors) {
    const row = document.createElement('p');
    row.className = 'text-xs leading-5 text-zen-ghost';
    row.textContent = `· ${factor.label}`;
    if (factor.weight > 0) row.append(` −${factor.weight}`);
    els.routeSafety.append(row);
  }

  els.safetyDisclaimer.textContent = disclaimerText;
  els.safetyDisclaimer.hidden = !disclaimerText;
}

function bindRouteCards() {
  els.routeOptions.addEventListener('click', (event) => {
    const button = event.target.closest('[data-index]');
    if (!button) return;
    const index = Number(button.dataset.index);
    if (isTransit()) selectTransitPlan(index);
    else selectDrivePlan(index);
  });

  els.routeStrategy.addEventListener('click', (event) => {
    const button = event.target.closest('[data-strategy]');
    if (!button) return;
    switchTransitStrategy(button.dataset.strategy);
  });
}

function clearRouteLayers() {
  for (const layer of state.routeLayers) layer.remove();
  state.routeLayers = [];
}

function feedReminder(fix) {
  if (!state.route || !state.engine) return;
  const result = state.engine.evaluate(fix);
  if (!result || result.skipped) return;
  updateRemindStatus(result);
  if (result.alert) fireAlert(result.alert);
}

function updateRemindStatus(result) {
  if (result.offRoute) {
    els.remindStatus.textContent = `偏离路线约 ${formatMeters(result.offset)}`;
    return;
  }
  if (result.alert) return;
  if (isLongHaulLeg(result.along)) {
    els.remindStatus.textContent = '行程较长，请留意时间';
    return;
  }
  const parts = [];
  if (!result.boarded) parts.push(`距上车站 ${formatMeters(result.boardingRemaining)}`);
  parts.push(`距下车站 ${formatMeters(result.alightingRemaining)}`);
  els.remindStatus.textContent = parts.join(' · ');
}

function isLongHaulLeg(along) {
  if (!state.route || !Number.isFinite(along)) return false;
  let acc = 0;
  for (const leg of state.route.legs) {
    acc += buildRouteMetrics(leg.points).total;
    if (along <= acc) return leg.kind === 'railway' || leg.kind === 'taxi';
  }
  return false;
}

function showBanner(title, sub) {
  els.bannerTitle.textContent = title;
  els.bannerSub.textContent = sub;
  els.banner.hidden = false;
  window.clearTimeout(state.bannerTimer);
  state.bannerTimer = window.setTimeout(() => {
    els.banner.hidden = true;
  }, 10000);
}

function fireAlert(kind) {
  if (!state.route) return;
  const stop = kind === 'boarding' ? state.route.boarding : state.route.alighting;
  const name = stop.name || (kind === 'boarding' ? '上车站' : '下车站');
  const title = kind === 'boarding' ? '准备上车' : '即将到站';
  const sub = kind === 'boarding' ? `${name} · 请前往上车站` : `${name} · 请准备下车`;

  showBanner(title, sub);
  const canVibrate = !navigator.userActivation || navigator.userActivation.hasBeenActive;
  if ('vibrate' in navigator && canVibrate) {
    try {
      navigator.vibrate([300, 120, 300]);
    } catch {}
  }
  speak(kind === 'boarding' ? `请准备上车，${name}` : `即将到站，${name}，请准备下车`);
}

function speak(text) {
  if (!('speechSynthesis' in window)) return;
  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  } catch {}
}

const NAV_OFF_LIMIT = 80;
const NAV_RECOVER_LIMIT = 50;
const NAV_CONFIRM_HITS = 2;
const NAV_ACCURACY_LIMIT = 150;
const NAV_PAN_INTERVAL = 1200;
const NAV_ZOOM = 17;
const NAV_ARRIVE_LIMIT = 50;

function ensureRouteMetrics(route) {
  if (!route) return null;
  if (!Array.isArray(route.cum) || route.cum.length !== route.points.length) {
    const metrics = buildRouteMetrics(route.points);
    route.cum = metrics.cum;
    route.total = metrics.total;
  }
  return route;
}

function syncStartNavButton() {
  els.startNav.hidden = !state.route || state.nav.mode !== 'off';
}

function startNavigation() {
  if (!state.route || state.nav.mode !== 'off') return;
  ensureRouteMetrics(state.route);
  state.nav.mode = 'following';
  state.nav.offHits = 0;
  state.nav.view = { center: map.getCenter(), zoom: map.getZoom() };
  document.body.dataset.nav = 'on';
  els.navBar.hidden = false;
  els.navExit.hidden = false;
  els.navOffRoute.hidden = true;
  els.navLeg.hidden = !isTransit();
  syncStartNavButton();
  if (state.lastFix) followNavPosition(state.lastFix);
  updateNavigation(state.lastFix);
}

function stopNavigation() {
  if (state.nav.mode === 'off') return;
  state.nav.mode = 'off';
  state.nav.offHits = 0;
  delete document.body.dataset.nav;
  els.navBar.hidden = true;
  els.navExit.hidden = true;
  els.navOffRoute.hidden = true;
  syncStartNavButton();
  window.clearTimeout(state.bannerTimer);
  els.banner.hidden = true;
  const view = state.nav.view;
  state.nav.view = null;
  if (view) map.setView(view.center, view.zoom, { animate: false });
}

function followNavPosition(fix) {
  const now = Date.now();
  const target = L.latLng(fix.lat, fix.lng);
  if (map.getZoom() < NAV_ZOOM) {
    map.setView(target, NAV_ZOOM);
    state.nav.lastPan = now;
    return;
  }
  if (now - state.nav.lastPan < NAV_PAN_INTERVAL) return;
  state.nav.lastPan = now;
  map.panTo(target, { animate: true, duration: 0.6 });
}

function updateNavigation(fix) {
  if (state.nav.mode === 'off' || state.nav.mode === 'arrived' || !state.route || !fix) return;
  const route = ensureRouteMetrics(state.route);
  const projection = projectOnRoute(route.points, route.cum, fix);
  const remaining = Math.max(0, route.total - projection.along);
  const accurate = Number.isFinite(fix.accuracy) && fix.accuracy <= NAV_ACCURACY_LIMIT;

  if (accurate && (state.nav.mode === 'following' || state.nav.mode === 'off-route')) {
    const drifted = projection.offset > (state.nav.mode === 'off-route' ? NAV_RECOVER_LIMIT : NAV_OFF_LIMIT);
    const advancing = state.nav.mode === 'following' ? drifted : !drifted;
    state.nav.offHits = advancing ? state.nav.offHits + 1 : 0;
    if (state.nav.offHits >= NAV_CONFIRM_HITS) {
      if (state.nav.mode === 'following') enterNavOffRoute();
      else leaveNavOffRoute();
    }
  }

  renderNavMetrics(route, remaining);

  if (state.nav.mode !== 'following') return;
  if (isTransit()) els.navLeg.textContent = transitGuidance(route, projection.along);
  followNavPosition(fix);
  if (remaining <= NAV_ARRIVE_LIMIT) markNavArrived();
}

function enterNavOffRoute() {
  state.nav.mode = 'off-route';
  state.nav.offHits = 0;
  els.navOffRoute.hidden = false;
}

function leaveNavOffRoute() {
  state.nav.mode = 'following';
  state.nav.offHits = 0;
  els.navOffRoute.hidden = true;
}

function renderNavMetrics(route, remaining) {
  els.navRemain.textContent = `还剩 ${formatMeters(remaining)}`;
  const seconds = route.total > 0 ? (remaining / route.total) * route.duration : 0;
  els.navEta.textContent = seconds > 0 ? `${formatDuration(seconds)} · ${clockText(Date.now() + seconds * 1000)} 到` : '';
}

function clockText(ms) {
  const date = new Date(ms);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function markNavArrived() {
  state.nav.mode = 'arrived';
  state.nav.offHits = 0;
  els.navOffRoute.hidden = true;
  els.navRemain.textContent = '已到达目的地附近';
  els.navEta.textContent = '';
  els.navLeg.hidden = false;
  els.navLeg.textContent = isTransit() ? '行程结束，请确认已到站' : '行程结束';
  showBanner('已到达', '目的地就在附近');
  speak('已到达目的地附近');
}

function transitGuidance(route, along) {
  const legs = route.legs;
  let acc = 0;
  for (const leg of legs) {
    const length = buildRouteMetrics(leg.points).total;
    if (along <= acc + length || leg === legs[legs.length - 1]) return legGuidance(leg, along - acc, length);
    acc += length;
  }
  return '';
}

function legGuidance(leg, into, length) {
  if (leg.kind === 'taxi') return `打车前往${leg.toName || '目的地'}`;
  if (leg.kind === 'railway') {
    const clock = formatAmapClock(leg.fromTime);
    return `乘 ${leg.name}${clock ? ` ${clock} 开` : ''}，在 ${leg.toName || '终点'} 下车`;
  }
  if (!leg.walking) {
    const via = leg.viaNum ? ` · 途经 ${leg.viaNum} 站` : '';
    return `乘 ${leg.label || leg.name}${via}，在 ${leg.toName || '下车站'} 下车`;
  }
  const span = leg.distance || length;
  return nextWalkStep(leg, into) || `步行 ${formatMeters(Math.max(0, span - into))} 至 ${leg.to || '目的地'}`;
}

function nextWalkStep(leg, into) {
  let acc = 0;
  for (const step of leg.steps || []) {
    acc += step.distance || 0;
    if (acc > into + 15) return walkStepText(step, leg);
  }
  return '';
}

function walkStepText(step, leg) {
  if (!step.text) return '';
  if (leg.to && /到达目的地$/.test(step.text)) return step.text.replace(/到达目的地$/, `到达${leg.to}`);
  return step.text;
}

async function rerouteFromNavigation() {
  if (state.nav.rerouting || !state.lastFix) return;
  state.nav.rerouting = true;
  els.navReroute.disabled = true;
  els.navReroute.textContent = '正在规划…';

  try {
    const fix = state.lastFix;
    setOrigin(L.latLng(fix.lat, fix.lng), { manual: false, accuracy: fix.accuracy });
    resetRouteState();
    if (isTransit()) await planTransitTrip();
    else if (isWalk()) await planWalkTrip();
    else await planDriveTrip();
    if (!state.route) throw new Error('route-empty');

    ensureRouteMetrics(state.route);
    state.nav.mode = 'following';
    state.nav.offHits = 0;
    els.navOffRoute.hidden = true;
    els.navLeg.hidden = !isTransit();
    if (state.lastFix) followNavPosition(state.lastFix);
    updateNavigation(state.lastFix);
  } catch {
    els.navOffRoute.hidden = false;
    showBanner('重新规划失败', '检查网络后再试一次');
  } finally {
    state.nav.rerouting = false;
    els.navReroute.disabled = false;
    els.navReroute.textContent = '重新规划';
  }
}

function initialThreshold() {
  const stored = Number(readStorage(THRESHOLD_KEY));
  return [300, 500, 800, 1000].includes(stored) ? stored : 500;
}

function bindTransitUI() {
  const threshold = initialThreshold();
  els.threshold.value = String(threshold);

  els.transitCrossToggle.addEventListener('click', () => {
    const open = els.transitLegs.hidden;
    els.transitLegs.hidden = !open;
    els.transitCrossToggle.textContent = open ? '收起分段' : '查看分段';
  });

  els.threshold.addEventListener('change', () => {
    const value = Number(els.threshold.value) || 500;
    state.engine?.setThreshold(value);
    writeStorage(THRESHOLD_KEY, value);
    els.remindStatus.textContent = `提醒阈值 ${formatMeters(value)}`;
  });

  els.testAlert.addEventListener('click', () => {
    if (state.route) {
      fireAlert('alighting');
      return;
    }
    showBanner('提醒测试', '到达站点前会以闪烁文字提醒');
    speak('提醒测试：即将到站，请准备下车');
  });
}

function bearingBetween(from, to) {
  const toRad = Math.PI / 180;
  const dLng = (to.lng - from.lng) * toRad;
  const lat1 = from.lat * toRad;
  const lat2 = to.lat * toRad;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) / toRad) + 360) % 360;
}

function angleDelta(a, b) {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function bindFuel() {
  if (trip?.mode !== 'drive') return;
  els.gasBtn.hidden = false;
  document.documentElement.style.setProperty('--z-bottom-extra', '3.5rem');
  els.gasBtn.addEventListener('click', () => toggleGasPanel());
  els.gasClose.addEventListener('click', () => toggleGasPanel(false));
  els.gasRefresh.addEventListener('click', () => loadFuel(true));
  els.gasClear.addEventListener('click', () => clearGasWaypoint());
  els.gasChip.addEventListener('click', () => toggleGasPanel(true));
}

function toggleGasPanel(open = els.gasPanel.hidden) {
  if (!open) {
    els.gasPanel.hidden = true;
    return;
  }
  els.gasPanel.hidden = false;
  loadFuel();
}

async function loadFuel(force = false) {
  if (trip?.mode !== 'drive' || state.fuel.loading) return;
  const anchor = state.origin || state.dest;
  if (!anchor) {
    els.gasStatus.textContent = '先确定起点再查找加油站';
    return;
  }
  if (state.fuel.key && !force) {
    renderFuelList();
    return;
  }

  state.fuel.loading = true;
  els.gasStatus.textContent = '正在查找附近加油站…';

  const cacheKey = `zenmap:fuel:v1:${anchor.lat.toFixed(3)},${anchor.lng.toFixed(3)}`;
  try {
    const cached = force ? null : ZenStore.get(cacheKey, FUEL_TTL);
    if (cached !== null) {
      state.fuel.key = cacheKey;
      state.fuel.list = cached;
      renderFuelList();
      return;
    }
    try {
      const stations = await fetchFuelStations({ lat: anchor.lat, lng: anchor.lng });
      ZenStore.set(cacheKey, stations);
      state.fuel.key = cacheKey;
      state.fuel.list = stations;
      renderFuelList();
    } catch (error) {
      const stale = ZenStore.getStale(cacheKey);
      if (!Array.isArray(stale) || !stale.length) throw error;
      state.fuel.key = cacheKey;
      state.fuel.list = stale;
      renderFuelList();
      if (els.gasList.children.length) els.gasStatus.textContent += ' · 离线缓存';
    }
  } catch {
    els.gasStatus.textContent = '服务繁忙，稍后重试';
  } finally {
    state.fuel.loading = false;
  }
}

function rankFuelStations(stations) {
  const anchor = state.origin || state.dest;
  if (!anchor) return [];

  const hasDirection = Boolean(state.dest && distanceBetween(anchor, state.dest) > 80);
  const destBearing = hasDirection ? bearingBetween(anchor, state.dest) : null;

  return stations
    .map((station) => {
      const distance = distanceBetween(anchor, station);
      const ahead = destBearing !== null && angleDelta(bearingBetween(anchor, station), destBearing) <= 75;
      return { ...station, distance, ahead };
    })
    .filter((station) => Number.isFinite(station.distance) && station.distance <= 4000)
    .sort((a, b) => Number(b.ahead) - Number(a.ahead) || a.distance - b.distance);
}

function renderFuelList() {
  const stations = rankFuelStations(state.fuel.list);
  const hasDirection = Boolean(state.origin && state.dest && distanceBetween(state.origin, state.dest) > 80);
  els.gasList.innerHTML = '';

  if (!stations.length) {
    els.gasStatus.textContent = '4 km 内没有找到加油站';
    return;
  }

  const ahead = stations.filter((station) => station.ahead).length;
  els.gasStatus.textContent = hasDirection
    ? `4 km 内 ${stations.length} 个 · 前方 ${ahead} 个`
    : `4 km 内 ${stations.length} 个`;

  for (const station of stations.slice(0, 8)) {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.id = station.id;
    button.className = 'gas-row flex w-full items-center justify-between gap-3 px-1 py-2.5 text-left text-sm tracking-tight';
    if (station.id === state.fuel.selectedId) button.setAttribute('aria-pressed', 'true');

    const name = document.createElement('span');
    name.className = 'min-w-0 truncate';
    name.textContent = station.name;

    const meta = document.createElement('span');
    meta.className = 'gas-meta shrink-0 text-xs text-zen-ghost';
    meta.textContent = `${formatMeters(station.distance)}${station.ahead ? ' · 前方' : ''}`;

    button.append(name, meta);
    button.addEventListener('click', () => selectFuelStation(station));
    item.append(button);
    els.gasList.append(item);
  }
}

function selectFuelStation(station) {
  const from = state.origin || state.dest;
  if (!from) return;

  state.fuel.selectedId = station.id;
  clearFuelLayers();

  const color = ink();
  const line = L.polyline([[from.lat, from.lng], [station.lat, station.lng]], {
    color,
    weight: 2,
    opacity: 0.55,
    dashArray: '4 6',
    lineCap: 'round',
  }).addTo(map);
  const icon = L.divIcon({
    className: '',
    html: '<span class="zen-marker-gas"></span>',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
  const marker = L.marker([station.lat, station.lng], { icon, keyboard: false, zIndexOffset: 250 }).addTo(map);
  state.fuel.layers.push(line, marker);

  els.gasWaypoint.hidden = false;
  els.gasWaypointName.textContent = station.name;
  els.gasChipName.textContent = station.name;
  els.gasChip.hidden = false;
  els.gasBtn.hidden = true;
  els.gasPanel.hidden = true;
  syncGasSelection();

  const bounds = L.latLngBounds([[from.lat, from.lng], [station.lat, station.lng]]);
  map.fitBounds(bounds.pad(0.25), {
    paddingTopLeft: [36, 96],
    paddingBottomRight: [36, sheetHeight() + 24],
    maxZoom: 15,
  });
}

function clearFuelLayers() {
  for (const layer of state.fuel.layers) layer.remove();
  state.fuel.layers = [];
}

function clearGasWaypoint() {
  state.fuel.selectedId = '';
  clearFuelLayers();
  els.gasWaypoint.hidden = true;
  els.gasWaypointName.textContent = '';
  els.gasChip.hidden = true;
  els.gasChipName.textContent = '';
  els.gasBtn.hidden = false;
  syncGasSelection();
}

function syncGasSelection() {
  for (const button of els.gasList.querySelectorAll('.gas-row')) {
    if (button.dataset.id === state.fuel.selectedId) button.setAttribute('aria-pressed', 'true');
    else button.removeAttribute('aria-pressed');
  }
}

async function loadWeather(force = false) {
  if (!trip) return;
  const place = state.origin || state.dest;
  if (!place) return;

  const key = `${place.lat.toFixed(2)},${place.lng.toFixed(2)}`;
  if (!force && (state.weather.key === key || state.weather.loading)) return;

  state.weather.loading = true;
  try {
    const cacheKey = `zenmap:weather:v1:${key}`;
    const cached = force ? null : ZenStore.get(cacheKey, WEATHER_TTL);
    if (cached) {
      state.weather.key = key;
      renderWeather(cached, place === state.dest);
      return;
    }
    try {
      const weather = await fetchWeather(place);
      ZenStore.set(cacheKey, weather);
      state.weather.key = key;
      renderWeather(weather, place === state.dest);
    } catch (error) {
      const stale = ZenStore.getStale(cacheKey);
      if (!stale) throw error;
      state.weather.key = key;
      renderWeather(stale, place === state.dest);
      els.weatherRain.textContent += ' · 离线缓存';
    }
  } catch {
    els.weatherPanel.hidden = false;
    if (!state.weather.key) {
      els.weatherTemp.textContent = '—';
      els.weatherText.textContent = '天气服务暂不可用';
      els.weatherRain.textContent = '';
    }
  } finally {
    state.weather.loading = false;
  }
}

function cityKeyFor(cityName, regionName) {
  const city = (cityName || '').trim();
  if (city.endsWith('市')) return city;
  const region = (regionName || '').trim();
  return region.endsWith('市') ? region : '';
}

function sameCityKey(left, right) {
  const a = left.replace(/\s+/g, '').replace(/市$/, '');
  const b = right.replace(/\s+/g, '').replace(/市$/, '');
  return Boolean(a) && a === b;
}

async function cityKeyFromReverse(latlng) {
  const info = await reverseCity(latlng);
  return cityKeyFor(info.city, info.province);
}

async function loadDestWeather() {
  if (!state.origin || !state.dest) {
    els.weatherDest.hidden = true;
    return;
  }

  const originAt = state.origin;
  const destAt = state.dest;
  els.weatherDest.hidden = true;
  const [originKey, destKey] = await Promise.all([
    cityKeyFor(state.originCityName, state.originCity) || cityKeyFromReverse(originAt),
    cityKeyFor(state.destCityName, state.destCity) || cityKeyFromReverse(destAt),
  ]);
  if (state.origin !== originAt || state.dest !== destAt) return;

  const sameCity = originKey && destKey ? sameCityKey(originKey, destKey) : distanceBetween(originAt, destAt) <= 10000;
  if (sameCity) {
    els.weatherDest.hidden = true;
    return;
  }

  const place = { lat: destAt.lat, lng: destAt.lng };
  const cacheKey = `zenmap:weather:v1:${place.lat.toFixed(2)},${place.lng.toFixed(2)}`;
  let weather = ZenStore.get(cacheKey, WEATHER_TTL);
  let offline = false;
  try {
    if (!weather) {
      weather = await fetchWeather(place);
      ZenStore.set(cacheKey, weather);
    }
  } catch {
    weather = ZenStore.getStale(cacheKey);
    offline = true;
  }

  if (!weather) {
    els.weatherDest.hidden = true;
    return;
  }

  if (state.dest !== destAt) return;
  els.weatherDestTemp.textContent = `${weather.temp}`;
  els.weatherDestText.textContent = `${weather.text} · 体感 ${weather.feels}°${offline ? ' · 离线缓存' : ''}`;
  els.weatherDest.hidden = false;
}

function renderWeather(weather, fromDest) {
  els.weatherPanel.hidden = false;
  els.weatherTemp.textContent = `${weather.temp}°`;
  els.weatherText.textContent = `${weather.text} · 体感 ${weather.feels}°${fromDest ? ' · 目的地' : ''}`;

  if (weather.precipitation > 0.05) {
    els.weatherRain.textContent = '正在下雨，记得带伞';
  } else if (weather.maxProb >= 50) {
    els.weatherRain.textContent = `接下来 3 小时降雨概率 ${weather.maxProb}%，带把伞`;
  } else {
    els.weatherRain.textContent = '接下来 3 小时无降雨';
  }
}

function onLocate() {
  if (state.origin && !state.originManual && state.watchId !== null) {
    map.flyTo(state.origin, Math.max(map.getZoom(), 16), { duration: 0.45 });
    return;
  }
  startWatch();
}

function syncSheetOffset() {
  const update = () => document.documentElement.style.setProperty('--z-sheet', `${sheetHeight()}px`);
  update();
  if ('ResizeObserver' in window) new ResizeObserver(update).observe(els.sheet);
  window.addEventListener('resize', update);
}

function syncTopbarOffset() {
  const update = () => document.documentElement.style.setProperty('--z-topbar', `${els.topbar.offsetHeight}px`);
  update();
  if ('ResizeObserver' in window) new ResizeObserver(update).observe(els.topbar);
  window.addEventListener('resize', update);
}

function bindTheme() {
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const color = ink();
    if (accuracyCircle) accuracyCircle.setStyle({ color, fillColor: color });
    for (const layer of [...state.routeLayers, ...state.fuel.layers]) {
      if (typeof layer.setStyle === 'function') layer.setStyle({ color: layer.zenFaded ? ghost() : color });
    }
  });
}

function bindNetwork() {
  const sync = () => {
    els.offlineNote.hidden = navigator.onLine;
  };
  window.addEventListener('online', sync);
  window.addEventListener('offline', sync);
  sync();
}

function bindEvents() {
  els.retry.addEventListener('click', startWatch);
  els.locate.addEventListener('click', onLocate);
  els.manualLink.addEventListener('click', () => showForm(true));
  els.form.addEventListener('submit', onSubmit);
  els.destSwitch.addEventListener('click', renderCandidatePanel);
  els.destCandidatesClose.addEventListener('click', () => {
    hideCandidatePanel();
    els.destSwitch.hidden = false;
  });
  els.destCandidateList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-candidate-index]');
    if (button) selectCandidate(Number(button.dataset.candidateIndex));
  });
  els.destRetype.addEventListener('click', () => {
    window.location.href = `./index.html?dest=${encodeURIComponent(trip.destination)}`;
  });
  els.startNav.addEventListener('click', startNavigation);
  els.navExit.addEventListener('click', stopNavigation);
  els.navReroute.addEventListener('click', rerouteFromNavigation);
  window.addEventListener('pagehide', stopWatch);
}

function mountTiles(source = TILE_PRIMARY) {
  if (tileLayer) map.removeLayer(tileLayer);
  tileErrors = 0;
  tileLayer = L.tileLayer(source.url, { maxZoom: source.maxZoom, attribution: TILE_ATTRIBUTION }).addTo(map);
  tileLayer.on('tileload', () => {
    if (document.querySelectorAll('.leaflet-tile-loaded').length >= TILE_SKELETON_MIN) hideMapSkeleton();
  });
  tileLayer.on('tileerror', () => {
    tileErrors += 1;
    if (tileErrors < TILE_ERROR_LIMIT || tileProbed || !navigator.onLine) return;
    probeTileFallback();
  });
}

function probeTileFallback() {
  const zoom = Math.round(map.getZoom());
  const tile = map.project(map.getCenter(), zoom).divideBy(256).floor();
  tileProbed = true;
  loadTileImage(TILE_FALLBACK.url, zoom, tile.x, tile.y).then((ok) => {
    if (ok) {
      mountTiles(TILE_FALLBACK);
      return;
    }
    tileProbed = false;
    tileErrors = 0;
  });
}

function loadTileImage(url, zoom, x, y) {
  return new Promise((resolve) => {
    const image = new Image();
    const finish = (ok) => {
      window.clearTimeout(timer);
      image.onload = null;
      image.onerror = null;
      resolve(ok);
    };
    const timer = window.setTimeout(() => finish(false), TILE_PROBE_TIMEOUT);
    image.onload = () => finish(true);
    image.onerror = () => finish(false);
    image.src = url.replace('{z}', zoom).replace('{x}', x).replace('{y}', y);
  });
}

function hideMapSkeleton() {
  if (els.mapSkeleton) els.mapSkeleton.hidden = true;
}

function mountRouteChrome() {
  els.routeTitle.textContent = MODE_TITLE[trip.mode] || '路线';
  els.routeStops.hidden = !isTransit();
  els.transitCross.hidden = true;
  els.routeRemind.hidden = !isTransit();
  els.remindStatus.hidden = !isTransit();
  els.routeStrategy.hidden = !isTransit();
}

function boot() {
  document.title = `${trip.destination} · ZenMap`;
  els.mode.textContent = MODE_LABEL[trip.mode] || '导航';
  els.dest.textContent = trip.destination;

  map = L.map(els.map, {
    center: [34.5, 108.9],
    zoom: 4,
    zoomControl: false,
    zoomSnap: 0.5,
    worldCopyJump: true,
  });

  mountTiles();
  map.attributionControl.setPrefix(false);

  originIcon = L.divIcon({ className: '', html: '<span class="zen-marker-dot"></span>', iconSize: [14, 14], iconAnchor: [7, 7] });
  manualIcon = L.divIcon({ className: '', html: '<span class="zen-marker-manual"></span>', iconSize: [14, 14], iconAnchor: [7, 7] });
  destinationIcon = L.divIcon({ className: '', html: '<span class="zen-marker-dest"></span>', iconSize: [14, 14], iconAnchor: [7, 7] });

  state.engine = createReminderEngine({ threshold: initialThreshold() });

  syncSheetOffset();
  syncTopbarOffset();
  mountRouteChrome();
  bindTheme();
  bindNetwork();
  bindEvents();
  bindTransitUI();
  bindFuel();
  bindRouteCards();

  startWatch();
  resolveDestination();
}

if (trip?.destination) {
  boot();
} else {
  window.location.replace('./index.html');
}