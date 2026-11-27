const $ = (selector) => document.querySelector(selector);

const els = {
  start: $('#start-btn'),
  panel: $('#panel'),
  scrim: $('#scrim'),
  sheet: $('#sheet'),
  close: $('#close-btn'),
  label: $('#step-label'),
  value: $('#step-value'),
  ask: $('#ask-form'),
  destination: $('#destination'),
  error: $('#ask-error'),
  examples: $('#examples'),
  modeStep: $('#mode-step'),
  summaryStep: $('#summary-step'),
  sumDest: $('#sum-dest'),
  sumMode: $('#sum-mode'),
  editAsk: $('#edit-ask'),
  backMode: $('#back-mode'),
  restart: $('#restart-btn'),
  openMap: $('#open-map'),
  netHint: $('#net-hint'),
};

const TRIP_KEY = 'zenmap:trip';
const MODE_LABEL = { transit: '公共交通', drive: '自驾', walk: '步行' };

const saved = readTrip();
let trip = {
  destination: typeof saved?.destination === 'string' ? saved.destination : '',
  mode: MODE_LABEL[saved?.mode] ? saved.mode : '',
};
let lastFocus = null;
let closeTimer = 0;
let openTimer = 0;

function readTrip() {
  try {
    return JSON.parse(sessionStorage.getItem(TRIP_KEY) ?? 'null');
  } catch {
    return null;
  }
}

function writeTrip() {
  try {
    sessionStorage.setItem(TRIP_KEY, JSON.stringify(trip));
  } catch {}
}

function clearTrip() {
  try {
    sessionStorage.removeItem(TRIP_KEY);
  } catch {}
}

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function replay(el, className) {
  if (reducedMotion()) return;
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
}

function setStep(next) {
  const showAsk = next === 'ask';
  els.ask.hidden = !showAsk;
  els.modeStep.hidden = next !== 'mode';
  els.summaryStep.hidden = next !== 'summary';

  els.label.textContent = showAsk ? '目的地' : next === 'mode' ? '选择出行方式' : '确认';
  els.value.hidden = showAsk || !trip.destination;
  els.value.textContent = trip.destination;

  if (next === 'summary') {
    els.sumDest.textContent = trip.destination;
    els.sumMode.textContent = MODE_LABEL[trip.mode] ?? '未选择';
  }

  const visible = showAsk ? els.ask : next === 'mode' ? els.modeStep : els.summaryStep;
  replay(visible, 'zen-rise');

  if (showAsk) {
    hideError();
    els.destination.focus({ preventScroll: true });
  } else if (next === 'mode') {
    els.modeStep.querySelector('[data-mode]')?.focus({ preventScroll: true });
  }
}

function revealSheet() {
  window.clearTimeout(openTimer);
  els.scrim.dataset.open = 'true';
  els.sheet.dataset.open = 'true';
}

function openPanel() {
  window.clearTimeout(closeTimer);
  lastFocus = document.activeElement;
  els.panel.dataset.open = 'true';
  document.documentElement.style.overflow = 'hidden';
  els.destination.value = trip.destination;
  setStep(trip.mode ? 'summary' : trip.destination ? 'mode' : 'ask');
  requestAnimationFrame(revealSheet);
  openTimer = window.setTimeout(revealSheet, 300);
}

function closePanel() {
  els.scrim.dataset.open = 'false';
  els.sheet.dataset.open = 'false';
  document.documentElement.style.overflow = '';
  closeTimer = window.setTimeout(() => {
    els.panel.dataset.open = 'false';
    lastFocus?.focus?.({ preventScroll: true });
  }, reducedMotion() ? 0 : 220);
}

function showError(message) {
  els.error.textContent = message;
  els.error.hidden = false;
  replay(els.destination, 'zen-shake');
  els.destination.focus();
}

function hideError() {
  els.error.hidden = true;
}

function panelIsOpen() {
  return els.panel.dataset.open === 'true';
}

function focusables() {
  return [...els.sheet.querySelectorAll('button, input, [href]')].filter(
    (el) => !el.closest('[hidden]') && !el.disabled && el.offsetParent !== null,
  );
}

els.start.addEventListener('click', openPanel);
els.close.addEventListener('click', closePanel);
els.scrim.addEventListener('click', closePanel);

els.ask.addEventListener('submit', (event) => {
  event.preventDefault();
  const destination = els.destination.value.replace(/\s+/g, ' ').trim();
  if (!destination) {
    showError('先写一个目的地');
    return;
  }
  trip.destination = destination;
  writeTrip();
  setStep('mode');
});

els.destination.addEventListener('input', hideError);

els.examples.addEventListener('click', (event) => {
  const button = event.target.closest('[data-example]');
  if (!button) return;
  els.destination.value = button.dataset.example;
  els.ask.requestSubmit();
});

els.modeStep.addEventListener('click', (event) => {
  const button = event.target.closest('[data-mode]');
  if (!button) return;
  trip.mode = button.dataset.mode;
  writeTrip();
  setStep('summary');
});

els.editAsk.addEventListener('click', () => setStep('ask'));
els.backMode.addEventListener('click', () => setStep('mode'));

els.openMap.addEventListener('click', () => {
  window.location.href = './map.html';
});

els.restart.addEventListener('click', () => {
  trip = { destination: '', mode: '' };
  clearTrip();
  els.destination.value = '';
  setStep('ask');
});

document.addEventListener('keydown', (event) => {
  if (!panelIsOpen()) return;

  if (event.key === 'Escape') {
    event.preventDefault();
    closePanel();
    return;
  }

  if (event.key !== 'Tab') return;

  const items = focusables();
  if (items.length === 0) return;
  const first = items[0];
  const last = items[items.length - 1];

  if (!els.sheet.contains(document.activeElement)) {
    event.preventDefault();
    first.focus();
  } else if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

function syncNetHint() {
  els.netHint.hidden = navigator.onLine;
}

window.addEventListener('online', syncNetHint);
window.addEventListener('offline', syncNetHint);
syncNetHint();

const presetDest = new URLSearchParams(window.location.search).get('dest');
if (presetDest) {
  trip = { destination: presetDest, mode: '' };
  writeTrip();
  openPanel();
  setStep('ask');
}