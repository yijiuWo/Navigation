function weatherLabel(code) {
  if (code === 0) return '晴';
  if (code <= 2) return '少云';
  if (code === 3) return '阴';
  if (code === 45 || code === 48) return '雾';
  if (code >= 51 && code <= 57) return '毛毛雨';
  if (code >= 61 && code <= 67) return '雨';
  if (code >= 71 && code <= 77) return '雪';
  if (code >= 80 && code <= 82) return '阵雨';
  if (code >= 85 && code <= 86) return '阵雪';
  if (code >= 95) return '雷雨';
  return '—';
}

async function fetchWeather({ lat, lng }) {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', lat.toFixed(4));
  url.searchParams.set('longitude', lng.toFixed(4));
  url.searchParams.set('current', 'temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m');
  url.searchParams.set('hourly', 'precipitation_probability');
  url.searchParams.set('forecast_hours', '6');
  url.searchParams.set('timezone', 'auto');

  const data = await ZenNet.fetchJson(url, { timeout: 6000, retries: 0 });
  const current = data.current ?? {};
  const probs = (data.hourly?.precipitation_probability ?? []).filter(Number.isFinite).slice(0, 4);
  const maxProb = probs.length ? Math.max(...probs) : 0;
  const precipitation = Number(current.precipitation) || 0;

  return {
    temp: Math.round(current.temperature_2m),
    feels: Math.round(current.apparent_temperature),
    text: weatherLabel(current.weather_code),
    wind: Math.round(current.wind_speed_10m),
    precipitation,
    maxProb,
    rainSoon: precipitation > 0.05 || maxProb >= 50,
  };
}