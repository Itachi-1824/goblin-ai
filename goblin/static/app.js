'use strict';

function integer(value, label, min, max) {
  if (!/^-?\d+$/.test(String(value).trim())) throw new Error(`${label} must be a whole number.`);
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < min || number > max) throw new Error(`${label} must be ${min}–${max}.`);
  return number;
}

function upscaleSize(width, height) {
  const scale = Math.min(2, 4096 / Math.max(width, height));
  return [Math.round(width * scale), Math.round(height * scale)];
}

function imageType(bytes) {
  if (bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v)) return 'png';
  if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'jpeg';
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') return 'webp';
  throw new Error('The server returned an unsupported image.');
}

if (typeof document === 'undefined') {
  module.exports = {integer, upscaleSize, imageType};
} else {
(() => {
  const $ = id => document.getElementById(id);
  const shapes = {'square': [768, 768], 'square-sm': [512, 512], 'square-lg': [1024, 1024], 'portrait': [512, 768], 'portrait-lg': [768, 1024], 'landscape': [768, 512], 'landscape-lg': [1024, 768], 'wide': [896, 512], 'tall': [512, 896]};
  const presetNames = {auto: 'Auto — hardware aware', off: 'Off — resize only', fast: 'Fast — Lanczos', balanced: 'Balanced — SPAN', quality: 'Quality — MoSR', best: 'Best — DAT2', photo: 'Photo — RealPLKSR 2x', anime: 'Anime — SPAN', sharp: 'Sharp — MoSR', ultra: 'Ultra — DAT2'};
  const state = {ready: false, healthLabel: 'Connecting', catalog: false, device: false, models: [], options: {}, shape: 'square', result: null, gallery: [], operation: null, selected: null, retry: null, polling: false, timer: null, random: null, hardware: null, setup: null, cooldown: 0, autoRoute: null, routeTimer: null, modelFocus: null, submitting: false, settingsRevision: 0};
  const presetModels = {balanced: ['span-x2', 'span'], anime: ['span-x2', 'span'], quality: ['nomos2-mosr'], sharp: ['nomos2-mosr'], best: ['nomos2-dat2'], ultra: ['nomos2-dat2'], photo: ['realplksr-x2']};
  let nextId = 0;
  let lastFocus = null;
  const text = (id, value) => { if ($(id)) $(id).textContent = value; };
  const show = (id, visible) => { if ($(id)) { $(id).hidden = !visible; $(id).classList.toggle('hidden', !visible); } };

  function notice(message) {
    const item = document.createElement('p');
    item.textContent = message;
    $('toastContainer').append(item);
    setTimeout(() => item.remove(), 6000);
  }

  async function request(path, {body, signal, timeout = 15000} = {}) {
    if (body && Date.now() < state.cooldown) throw new Error(`Please wait ${Math.ceil((state.cooldown - Date.now()) / 1000)} seconds before retrying.`);
    const controller = new AbortController();
    let timedOut = false;
    const abort = () => controller.abort();
    if (signal?.aborted) abort();
    else signal?.addEventListener('abort', abort, {once: true});
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeout);
    try {
      const response = await fetch(path, {method: body ? 'POST' : 'GET', headers: body ? {'Content-Type': 'application/json'} : {}, body: body ? JSON.stringify(body) : undefined, signal: controller.signal});
      let data;
      try { data = await response.json(); } catch { throw new Error(`The server returned an unreadable response (${response.status}).`); }
      if (!response.ok) {
        const detail = Array.isArray(data.detail) ? data.detail.map(item => `${(item.loc || []).filter(part => part !== 'body').join('.')}: ${item.msg || item.type}`).join('; ') : data.detail;
        const delay = response.headers.get('Retry-After');
        if (response.status === 429) {
          const seconds = Number(delay);
          state.cooldown = Number.isFinite(seconds) && seconds > 0 ? Date.now() + seconds * 1000 : Math.max(Date.now() + 1000, Date.parse(delay) || Date.now() + 60000);
        }
        const error = new Error(`${typeof detail === 'string' ? detail : `Request failed (${response.status})`}${response.status === 429 && delay ? ` Retry after ${delay} seconds.` : ''}`);
        error.status = response.status;
        throw error;
      }
      return data;
    } catch (error) {
      if (controller.signal.aborted) throw new Error(timedOut ? 'Request timed out. Server processing may still continue.' : 'Stopped waiting. Server processing may still continue.');
      throw error;
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
    }
  }

  function fillSelect(id, values, defaultLabel = 'Model default') {
    const select = $(id);
    const previous = select.value;
    select.replaceChildren(new Option(defaultLabel, ''));
    for (const value of values) select.add(new Option(String(value).replaceAll('-', ' '), String(value)));
    if ([...select.options].some(option => option.value === previous)) select.value = previous;
  }

  function selectedModel() {
    return $('model').value === 'auto' ? state.autoRoute?.prompt === $('prompt').value.trim() ? state.models.find(item => item.id === state.autoRoute.model) : null : state.models.find(item => item.id === $('model').value);
  }

  function updateModelLabel() {
    const value = $('model').value;
    const model = state.models.find(item => item.id === value);
    text('modelLabel', value === 'auto' ? 'Auto — match my prompt' : model?.name || 'Choose a model');
    if (value !== 'auto') text('modelHelp', model ? `Selected: ${model.name} · ${model.category}` : 'Choose an available model.');
  }

  function renderModels() {
    const select = $('model');
    const previous = select.value || 'auto';
    select.replaceChildren(new Option('Auto — match my prompt', 'auto'));
    const groups = new Map();
    for (const model of state.models) {
      if (!groups.has(model.category)) { const group = document.createElement('optgroup'); group.label = model.category; groups.set(model.category, group); select.append(group); }
      groups.get(model.category).append(new Option(model.name, model.id));
    }
    select.value = [...select.options].some(option => option.value === previous) ? previous : 'auto';
    renderModelChoices();
    updateModelLabel();
    updateCapabilities();
  }

  function modelMatches() {
    const query = $('modelSearch')?.value.trim().toLowerCase() || '';
    return state.models.filter(model => !query || `${model.name} ${model.id} ${model.category}`.toLowerCase().includes(query));
  }

  function renderModelChoices() {
    const choices = $('modelChoices');
    if (!choices) return;
    const matches = modelMatches();
    const query = $('modelSearch').value.trim().toLowerCase();
    choices.replaceChildren();
    const addChoice = (label, id, detail = '') => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'model-choice';
      button.dataset.model = id;
      button.setAttribute('aria-current', String($('model').value === id));
      const name = document.createElement('span');
      name.textContent = label;
      button.append(name);
      if (detail) { const meta = document.createElement('small'); meta.textContent = detail; button.append(meta); }
      if ($('model').value === id) { const mark = document.createElement('span'); mark.className = 'model-choice-check'; mark.setAttribute('aria-hidden', 'true'); mark.textContent = '✓'; button.append(mark); }
      button.addEventListener('click', () => chooseModel(id));
      choices.append(button);
    };
    const autoMatch = !query || ['auto', 'recommended', 'match', 'prompt'].some(term => term.includes(query));
    if (autoMatch) addChoice('Auto — match my prompt', 'auto', 'Recommended');
    const groups = new Map();
    for (const model of matches) { if (!groups.has(model.category)) groups.set(model.category, []); groups.get(model.category).push(model); }
    for (const [category, models] of groups) {
      const heading = document.createElement('h3');
      heading.textContent = category;
      choices.append(heading);
      for (const model of models) addChoice(model.name, model.id);
    }
    text('modelMatches', matches.length ? `${matches.length} model${matches.length === 1 ? '' : 's'} found.` : query && !autoMatch ? 'No matching models.' : 'Choose Auto or search for a model.');
  }

  function chooseModel(id) {
    if (id !== 'auto') { clearTimeout(state.routeTimer); state.autoRoute?.controller?.abort(); state.autoRoute = null; }
    $('model').value = id;
    updateModelLabel();
    renderModelChoices();
    updateCapabilities();
    if (id === 'auto') scheduleAutoRoute();
    if ($('modelChooser')?.open) $('modelChooser').close();
  }

  function updateCapabilities() {
    const model = selectedModel();
    fillSelect('style', model?.styles || []);
    for (const id of ['style', 'quality', 'lighting', 'camera', 'composition', 'expression']) {
      $(id).disabled = !model || !(model.params || []).includes(id);
    }
    updateControls();
  }

  function describeAutoRoute() {
    if ($('model').value !== 'auto') return;
    const prompt = $('prompt').value.trim();
    const route = state.autoRoute;
    if (!prompt) { text('modelHelp', 'Type a prompt and Auto will recommend a model.'); return; }
    if (route?.prompt === prompt && route.model) {
      const model = state.models.find(item => item.id === route.model);
      text('modelHelp', model ? `Recommended: ${model.name} · ${model.category}` : 'Auto is checking the recommended model.');
    } else if (route?.prompt === prompt && route.error) text('modelHelp', 'Auto recommendation is unavailable. Try again when the service reconnects.');
    else text('modelHelp', 'Auto is matching your prompt to a model…');
  }

  function resolveAutoRoute(prompt) {
    if (!prompt || $('model').value !== 'auto') return Promise.resolve(null);
    if (!state.catalog) return Promise.reject(new Error('The model catalog is still loading.'));
    if (state.autoRoute?.prompt === prompt && state.autoRoute.model) return Promise.resolve(state.autoRoute.model);
    if (state.autoRoute?.prompt === prompt && state.autoRoute.promise) return state.autoRoute.promise;
    state.autoRoute?.controller?.abort();
    const route = {prompt, controller: new AbortController()};
    state.autoRoute = route;
    describeAutoRoute();
    route.promise = request('/models/route', {body: {prompt}, signal: route.controller.signal}).then(data => {
      if (state.autoRoute !== route || $('prompt').value.trim() !== prompt) return null;
      if (typeof data.model !== 'string' || !state.models.some(model => model.id === data.model)) throw new Error('The recommended model is unavailable.');
      route.model = data.model;
      describeAutoRoute();
      updateCapabilities();
      return data.model;
    }).catch(error => {
      if (state.autoRoute === route && !route.controller.signal.aborted) { route.error = error; describeAutoRoute(); updateCapabilities(); }
      throw error;
    });
    return route.promise;
  }

  function scheduleAutoRoute() {
    clearTimeout(state.routeTimer);
    if ($('model').value !== 'auto') return;
    const prompt = $('prompt').value.trim();
    state.autoRoute?.controller?.abort();
    if (!prompt) { state.autoRoute = null; describeAutoRoute(); updateCapabilities(); return; }
    state.autoRoute = {prompt};
    describeAutoRoute();
    updateCapabilities();
    state.routeTimer = setTimeout(() => resolveAutoRoute(prompt).catch(() => {}), 250);
  }

  async function loadCatalog() {
    const [catalog, options] = await Promise.all([request('/models'), request('/options')]);
    if (!catalog.categories || !Array.isArray(options.quality)) throw new Error('The server catalog is incomplete.');
    const models = [];
    for (const [category, group] of Object.entries(catalog.categories)) {
      for (const model of group.models || []) models.push({...model, category: group.info?.name || category});
    }
    if (!models.length) throw new Error('No image models are available.');
    state.models = models;
    state.options = options;
    for (const id of ['quality', 'lighting', 'camera', 'composition', 'expression']) fillSelect(id, options[id] || []);
    state.catalog = true;
    renderModels();
    scheduleAutoRoute();
  }

  async function loadDevice(signal) {
    const device = await request('/device', {signal});
    if (signal?.aborted) throw new Error('Stopped waiting.');
    if (!Array.isArray(device.all_providers)) throw new Error('The device response is incomplete.');
    for (const id of ['processingPreset', 'resultPreset']) {
      const select = $(id);
      const previous = select.value || 'auto';
      select.replaceChildren();
      for (const [value, name] of Object.entries(presetNames)) {
        const option = new Option(name, value);
        select.add(option);
      }
      select.value = [...select.options].some(option => option.value === previous && !option.disabled) ? previous : 'auto';
    }
    text('deviceInfo', `Available: ${device.provider || 'Unknown device'} · ${device.ram_gb ?? '?'} GB RAM${device.all_providers.length ? '' : ' · Neural backend unavailable; resize only'}`);
    text('presetHelp', 'Generation Auto considers quality and hardware. Result Auto considers hardware. Off still resizes.');
    state.device = true;
    state.hardware = device;
    for (const id of ['processingPreset', 'resultPreset']) $(id).dataset.previous = $(id).value;
  }

  function updateControls() {
    const busy = Boolean(state.operation || state.setup || state.preparing || state.submitting);
    const cooling = Date.now() < state.cooldown;
    text('statusText', busy ? (state.operation?.kind === 'generate' ? 'Generating' : state.operation?.kind === 'download' ? 'Preparing models' : state.submitting ? 'Choosing model' : state.setup ? 'Model setup' : 'Processing') : state.healthLabel);
    $('generateBtn').disabled = busy || cooling || !state.ready || !state.catalog || !state.device || !$('model').value;
    show('cancelBtn', Boolean(state.operation));
    show('loadingOverlay', Boolean(state.operation));
    const loadingLabel = $('loadingOverlay').querySelector('span:not(.spinner)');
    if (loadingLabel) loadingLabel.textContent = state.operation?.kind === 'download' ? 'Preparing model weights…' : state.operation?.kind === 'upscale' ? 'Upscaling your image…' : 'Creating your image…';
    $('upscaleResultBtn').disabled = busy || cooling || !state.device || !state.result || Math.max(state.result.width, state.result.height) >= 4096;
    show('resultActions', Boolean(state.result));
    show('retryBtn', !busy && Boolean(state.retry));
    $('retryBtn').disabled = cooling;
    if (state.retry) $('retryBtn').textContent = cooling ? `Retry in ${Math.ceil((state.cooldown - Date.now()) / 1000)}s` : 'Retry';
    if ($('installConfirm')) $('installConfirm').disabled = Boolean(state.operation) || cooling;
  }

  async function poll() {
    if (state.polling) return;
    state.polling = true;
    const problems = [];
    try {
      try {
        const health = await request('/health', {timeout: 10000});
        state.ready = health.ready === true;
        const label = state.ready ? 'Online' : health.failed ? 'Setup failed' : health.initializing ? 'Initializing' : 'Recovering';
        state.healthLabel = label;
        $('status')?.setAttribute('data-state', state.ready ? 'online' : 'offline');
        if (!state.ready) problems.push(health.failed ? 'Initialization failed. Check server setup and restart it.' : health.initializing ? 'The image service is starting.' : 'The managed image session is recovering.');
      } catch (error) { state.ready = false; state.healthLabel = 'Offline'; problems.push(error.message); }
      const pending = [];
      if (!state.catalog) pending.push(loadCatalog());
      if (!state.device) pending.push(loadDevice());
      for (const result of await Promise.allSettled(pending)) if (result.status === 'rejected') problems.push(result.reason.message);
      text('setupNotice', problems.join(' '));
      show('setupNotice', Boolean(problems.length));
      show('setupRetry', Boolean(problems.length));
      updateControls();
    } finally {
      state.polling = false;
      clearTimeout(state.timer);
      state.timer = setTimeout(poll, state.ready && state.catalog && state.device ? 15000 : 5000);
    }
  }

  function dimensions() {
    return $('customToggle').checked ? [integer($('widthInput').value, 'Width', 64, 4096), integer($('heightInput').value, 'Height', 64, 4096)] : shapes[state.shape];
  }

  function updateResolution() {
    show('customDims', $('customToggle').checked);
    show('customProcessing', $('customToggle').checked);
    show('shapeGrid', !$('customToggle').checked);
    $('processingPreset').disabled = !$('customToggle').checked;
    try {
      const [width, height] = dimensions();
      text('dimError', '');
      $('previewFrame').style.aspectRatio = `${width} / ${height}`;
      $('previewFrame').style.setProperty('--preview-ratio', String(width / height));
      $('previewFrame').classList.toggle('compact-canvas', width / height > 4 || width / height < 0.25);
      text('previewSize', `Next output ${width} × ${height}`);
      text('resolutionSummary', $('customToggle').checked ? `${width} × ${height} output · best matching native shape, then ${$('processingPreset').value || 'auto'} processing` : `${width} × ${height} native shape`);
    } catch (error) { text('dimError', error.message); }
  }

  function resolvedPreset(select, quality = '') {
    if (select.value !== 'auto') return select.value;
    if (quality === 'low') return 'off';
    if (!state.hardware?.all_providers.length) return 'fast';
    return !['CPUExecutionProvider', 'OpenCV'].includes(state.hardware.provider_id) && quality === 'maximum' ? 'best' : state.hardware.recommended_preset || 'balanced';
  }

  async function ensurePreset(select, quality = '') {
    if (state.preparing || state.setup || state.operation) return false;
    const preset = resolvedPreset(select, quality);
    const chosen = select.value;
    const names = presetModels[preset] || [];
    if (!names.length) { select.dataset.previous = select.value; return true; }
    state.preparing = true;
    updateControls();
    try {
      const data = await request('/upscale/models');
      if (select.value !== chosen) return false;
      if (!Array.isArray(data.models)) throw new Error('The model download catalog is incomplete.');
      const models = names.map(name => {
        const model = data.models.find(item => item.name === name);
        if (!model) throw new Error(`Required processing model ${name} is unavailable.`);
        return model;
      });
      if (models.every(model => model.downloaded) && state.hardware?.all_providers.length) { select.dataset.previous = select.value; return true; }
      text('modelSetupTitle', `Prepare ${presetNames[preset]}`);
      $('modelDialog').querySelector('.runtime-help').hidden = Boolean(state.hardware?.all_providers.length);
      text('modelSetupInfo', state.hardware?.all_providers.length ? 'Download the required model weights once. Other presets that share these weights reuse them.' : 'Neural processing needs a Python backend. Copy an install command, run it in your Goblin environment, then restart Goblin and reload this page. You can prepare the weights now.');
      text('modelSetupStatus', '');
      text('modelSetupError', '');
      $('modelDownloads').replaceChildren();
      for (const model of models) { const row = document.createElement('p'); row.textContent = `${model.name} · ${model.size_mb ?? '?'} MiB · ${model.downloaded ? 'Ready' : 'Download required'}`; $('modelDownloads').append(row); }
      $('installConfirm').textContent = models.every(model => model.downloaded) ? 'Check backend again' : 'Download models';
      return await new Promise(resolve => {
        state.setup = {select, previous: select.dataset.previous || 'auto', models, resolve};
        state.preparing = false;
        updateControls();
        $('modelDialog').showModal();
      });
    } catch (error) { select.value = select.dataset.previous || 'auto'; text('operationError', error.message); return false; }
    finally { state.preparing = false; updateControls(); }
  }

  function finishSetup(success) {
    const setup = state.setup;
    if (!setup) return;
    if (success) setup.select.dataset.previous = setup.select.value;
    else setup.select.value = setup.previous;
    state.setup = null;
    $('modelDialog').close();
    setup.resolve(success);
    updateResolution();
    updateControls();
  }

  function cancelSetup(fallback = false) {
    if (state.operation?.kind === 'download') {
      if (state.setup) state.setup.pendingCancel = fallback;
      state.operation.controller.abort();
      text('modelSetupStatus', 'Stopping client download wait. The server may finish preparing weights.');
      return;
    }
    if (fallback && state.setup) state.setup.select.value = 'fast';
    finishSetup(fallback);
  }

  async function installModels() {
    const setup = state.setup;
    if (!setup || state.operation) return;
    const operation = {kind: 'download', controller: new AbortController()};
    state.operation = operation;
    text('modelSetupError', '');
    updateControls();
    try {
      for (const model of setup.models.filter(item => !item.downloaded)) {
        text('modelSetupStatus', `Downloading ${model.name}…`);
        const data = await request(`/upscale/models/${encodeURIComponent(model.name)}/download`, {body: {confirm: true}, signal: operation.controller.signal, timeout: 240000});
        if (operation.controller.signal.aborted || setup.pendingCancel !== undefined) return;
        if (data.name !== model.name || data.downloaded !== true) throw new Error(`Could not confirm the ${model.name} download.`);
        model.downloaded = true;
      }
      $('modelDownloads').replaceChildren();
      for (const model of setup.models) { const row = document.createElement('p'); row.textContent = `${model.name} · ${model.size_mb ?? '?'} MiB · Ready`; $('modelDownloads').append(row); }
      text('modelSetupStatus', 'Model weights are ready.');
      await loadDevice(operation.controller.signal);
      if (operation.controller.signal.aborted || setup.pendingCancel !== undefined || state.setup !== setup) return;
      if (state.hardware?.all_providers.length) finishSetup(true);
      else { text('modelSetupStatus', 'Weights are ready. Install the backend and restart Goblin, or choose Fast resize.'); $('installConfirm').textContent = 'Check backend again'; }
    } catch (error) { text('modelSetupError', error.message); }
    finally {
      state.operation = null;
      if (setup.pendingCancel !== undefined) {
        if (setup.pendingCancel) setup.select.value = 'fast';
        finishSetup(setup.pendingCancel);
      }
      updateControls();
    }
  }

  function generationSnapshot() {
    const values = {};
    for (const id of ['prompt', 'negativePrompt', 'model', 'seed', 'guidance', 'style', 'quality', 'lighting', 'camera', 'composition', 'expression', 'widthInput', 'heightInput', 'processingPreset']) values[id] = $(id).value;
    values.custom = $('customToggle').checked;
    values.removeBg = $('removeBg').checked;
    values.shape = state.shape;
    values.revision = state.settingsRevision;
    return values;
  }

  async function generateBody(snapshot) {
    const prompt = snapshot.prompt.trim();
    if (!prompt || prompt.length > 4000) throw new Error('Enter a prompt of 1–4000 characters.');
    if (snapshot.model === 'auto') {
      try { await resolveAutoRoute(prompt); }
      catch (error) {
        if (snapshot.revision !== state.settingsRevision) throw new Error('Settings changed while choosing a model. Review them and Generate again.');
        throw error;
      }
    }
    if (snapshot.revision !== state.settingsRevision || snapshot.prompt !== $('prompt').value || snapshot.model !== $('model').value) throw new Error('Settings changed while choosing a model. Review them and Generate again.');
    if (snapshot.model === 'auto' && (!state.autoRoute || state.autoRoute.prompt !== prompt || !state.autoRoute.model)) throw new Error('Auto could not recommend a model for this prompt. Try again when the service reconnects.');
    const resolved = snapshot.model === 'auto' ? state.models.find(item => item.id === state.autoRoute.model) : state.models.find(item => item.id === snapshot.model);
    if (!resolved) throw new Error('Choose an available model.');
    const body = {prompt, negative_prompt: snapshot.negativePrompt.trim(), model: snapshot.model, seed: integer(snapshot.seed, 'Seed', -1, 2147483647)};
    const guidance = snapshot.guidance.trim();
    if (guidance) {
      const number = Number(guidance);
      if (!Number.isFinite(number) || number < 1 || number > 30) throw new Error('Guidance must be 1–30, or empty for the model default.');
      body.guidance_scale = number;
    }
    for (const id of ['style', 'quality', 'lighting', 'camera', 'composition', 'expression']) if ((resolved.params || []).includes(id) && snapshot[id]) body[id] = snapshot[id];
    if (snapshot.removeBg) body.remove_background = true;
    if (snapshot.custom) Object.assign(body, {width: integer(snapshot.widthInput, 'Width', 64, 4096), height: integer(snapshot.heightInput, 'Height', 64, 4096), upscale_preset: snapshot.processingPreset});
    else body.shape = snapshot.shape;
    return body;
  }

  async function decodeResult(data, previous = {}) {
    if (typeof data.image_base64 !== 'string' || data.image_base64.length > 32 * 1024 * 1024) throw new Error('The server returned invalid image data.');
    let binary;
    try { binary = atob(data.image_base64); } catch { throw new Error('The server returned invalid image encoding.'); }
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    const format = imageType(bytes);
    const reported = String(data.format || format).toLowerCase().replace('jpg', 'jpeg');
    if (reported !== format) throw new Error('The returned image format does not match its contents.');
    const url = URL.createObjectURL(new Blob([bytes], {type: `image/${format}`}));
    const image = new Image();
    let decodeTimer;
    try {
      image.src = url;
      await Promise.race([image.decode(), new Promise((resolve, reject) => { decodeTimer = setTimeout(() => reject(new Error('Image decoding timed out.')), 15000); })]);
      if (!image.naturalWidth || !image.naturalHeight) throw new Error('The returned image has no dimensions.');
      const result = {...previous, ...data, id: previous.id || ++nextId, format, url, width: image.naturalWidth, height: image.naturalHeight};
      if (previous.id) for (const key of ['model', 'prompt', 'style', 'quality']) result[key] = previous[key];
      return result;
    } catch (error) { URL.revokeObjectURL(url); throw new Error(`Cannot display the returned image: ${error.message}`); }
    finally { clearTimeout(decodeTimer); }
  }

  function renderResult() {
    if (!state.result) return;
    $('resultImg').src = state.result.url;
    show('resultImg', true);
    show('placeholder', false);
    show('resultMeta', true);
    text('resultMeta', `${state.result.model || 'Image'} · ${state.result.width} × ${state.result.height} · ${state.result.format.toUpperCase()}${state.result.style ? ` · ${state.result.style}` : ''}`);
    updateControls();
  }

  function renderGallery() {
    text('galleryCount', String(state.gallery.length));
    $('galleryGrid').replaceChildren();
    $('clearGallery').disabled = state.gallery.length === 0;
    if (!state.gallery.length) {
      const empty = document.createElement('p');
      empty.className = 'gallery-empty';
      empty.textContent = 'Your creations will appear here. Start with a prompt in Create.';
      $('galleryGrid').append(empty);
    }
    for (const item of state.gallery) {
      const button = document.createElement('button');
      button.className = 'gallery-item';
      button.type = 'button';
      button.setAttribute('aria-label', `View ${item.model || 'image'}: ${item.prompt || ''}`);
      const image = document.createElement('img');
      image.src = item.url;
      image.alt = item.prompt || 'Generated image';
      image.loading = 'lazy';
      const caption = document.createElement('span');
      caption.textContent = `${item.width} × ${item.height} · ${item.model || 'Image'}`;
      button.append(image, caption);
      button.addEventListener('click', () => openDialog(item));
      $('galleryGrid').append(button);
    }
  }

  function openDialog(item) {
    lastFocus = document.activeElement;
    renderDialog(item);
    $('imageDialog').showModal();
  }

  function renderDialog(item) {
    state.selected = item;
    $('lightboxImg').src = item.url;
    text('dialogTitle', item.model || 'Generated image');
    text('lightboxPrompt', item.prompt || '');
    text('lightboxMeta', `${item.width} × ${item.height} · ${item.format.toUpperCase()}`);
    const index = state.gallery.findIndex(entry => entry.id === item.id);
    text('lightboxPosition', index >= 0 ? `${index + 1} / ${state.gallery.length}` : 'Saved preview · no longer in gallery');
    $('lightboxPrev').disabled = index <= 0;
    $('lightboxNext').disabled = index < 0 || index >= state.gallery.length - 1;
  }

  function navigateImage(delta) {
    const index = state.gallery.findIndex(item => item.id === state.selected?.id);
    const next = state.gallery[index + delta];
    if (index < 0 || !next) return false;
    renderDialog(next);
    collectUrls();
    return true;
  }

  function download(item) {
    if (!item) return;
    const anchor = document.createElement('a');
    anchor.href = item.url;
    anchor.download = `goblin-${item.id}.${item.format === 'jpeg' ? 'jpg' : item.format}`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  }

  function collectUrls() {
    const keep = new Set([...state.gallery, state.result, state.selected].filter(Boolean).map(item => item.url));
    for (const url of urls) if (!keep.has(url)) { URL.revokeObjectURL(url); urls.delete(url); }
  }
  const urls = new Set();

  async function operate(kind, body, original = null) {
    if (state.operation || state.setup || state.preparing) return;
    if (kind === 'generate' && (!state.ready || !state.catalog || !state.device)) { text('operationError', 'Wait for setup to finish, or retry setup.'); return; }
    if (kind === 'upscale' || body.width) {
      const select = $(kind === 'generate' ? 'processingPreset' : 'resultPreset');
      if (!await ensurePreset(select, kind === 'generate' ? body.quality : '')) return;
      if (kind === 'generate') body = {...body, upscale_preset: select.value};
      else body = {...body, preset: select.value};
    }
    const operation = {controller: new AbortController(), kind};
    state.operation = operation;
    state.retry = null;
    text('operationError', '');
    text('operationStatus', kind === 'generate' ? 'Generating image…' : 'Processing image…');
    updateControls();
    try {
      const data = await request(kind === 'generate' ? '/generate/base64' : '/upscale', {body, signal: operation.controller.signal, timeout: 240000});
      const result = await decodeResult(data, original || {});
      if (operation.controller.signal.aborted) { URL.revokeObjectURL(result.url); return; }
      urls.add(result.url);
      state.result = result;
      if (original) {
        const index = state.gallery.findIndex(item => item.id === original.id);
        if (index >= 0) state.gallery[index] = result;
        else state.gallery.unshift(result);
      } else state.gallery.unshift(result);
      state.gallery = state.gallery.slice(0, 24);
      while (state.gallery.length > 1 && state.gallery.reduce((sum, item) => sum + item.image_base64.length, 0) > 64 * 1024 * 1024) state.gallery.pop();
      renderResult();
      renderGallery();
      if ($('imageDialog').open && state.selected) renderDialog(state.gallery.find(item => item.id === state.selected.id) || state.selected);
      collectUrls();
      text('operationStatus', `${kind === 'generate' ? 'Generated' : 'Processed'} ${result.width} × ${result.height}.`);
    } catch (error) {
      text('operationError', error.message);
      text('operationStatus', operation.controller.signal.aborted ? 'Stopped waiting.' : 'Request failed. Your previous image is preserved.');
      if (!operation.controller.signal.aborted) state.retry = () => operate(kind, body, original);
    } finally { state.operation = null; updateControls(); }
  }

  async function generate() {
    if (state.operation || state.setup || state.preparing || state.submitting) return;
    clearTimeout(state.routeTimer);
    state.submitting = true;
    updateControls();
    try { const body = await generateBody(generationSnapshot()); state.submitting = false; await operate('generate', body); } catch (error) {
      text('operationError', error.message);
      const field = error.message.startsWith('Enter a prompt') ? 'prompt' : error.message.startsWith('Seed') ? 'seed' : error.message.startsWith('Width') ? 'widthInput' : error.message.startsWith('Height') ? 'heightInput' : error.message.startsWith('Guidance') ? 'guidance' : 'model';
      const control = field === 'model' ? $('modelTrigger') : $(field);
      control.closest('details')?.setAttribute('open', '');
      control.focus();
    } finally { state.submitting = false; updateControls(); }
  }

  for (const [name, size] of Object.entries(shapes)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'shape-btn';
    button.dataset.shape = name;
    const shapeName = document.createElement('span');
    shapeName.className = 'shape-name';
    shapeName.textContent = name.replaceAll('-', ' ');
    const shapeSize = document.createElement('span');
    shapeSize.className = 'shape-size';
    shapeSize.textContent = size.join(' × ');
    button.append(shapeName, shapeSize);
    button.setAttribute('aria-label', `${shapeName.textContent}, ${shapeSize.textContent}`);
    button.setAttribute('aria-pressed', String(name === state.shape));
    button.addEventListener('click', () => {
      state.settingsRevision += 1;
      state.shape = name;
      for (const sibling of $('shapeGrid').children) sibling.setAttribute('aria-pressed', String(sibling === button));
      updateResolution();
    });
    $('shapeGrid').append(button);
  }
  document.querySelectorAll('[data-tab]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-tab]').forEach(item => { item.classList.toggle('active', item === button); item.removeAttribute('aria-selected'); if (item === button) item.setAttribute('aria-current', 'page'); else item.removeAttribute('aria-current'); });
    for (const tab of ['generate', 'gallery']) { show(`tab-${tab}`, button.dataset.tab === tab); $(`tab-${tab}`).classList.toggle('active', button.dataset.tab === tab); }
  }));
  $('generateBtn').addEventListener('click', generate);
  $('prompt').addEventListener('input', () => { text('promptCount', `${$('prompt').value.length} / 4000`); scheduleAutoRoute(); });
  $('prompt').addEventListener('keydown', event => { if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) { event.preventDefault(); generate(); } });
  $('model').addEventListener('change', () => {
    if ($('model').value !== 'auto') { clearTimeout(state.routeTimer); state.autoRoute?.controller?.abort(); state.autoRoute = null; }
    updateModelLabel(); updateCapabilities(); if ($('model').value === 'auto') scheduleAutoRoute();
  });
  $('modelTrigger')?.addEventListener('click', () => {
    const dialog = $('modelChooser');
    if (!dialog?.open) {
      state.modelFocus = document.activeElement;
      $('modelSearch').value = '';
      renderModelChoices();
      dialog.showModal();
      $('modelSearch').focus();
    }
  });
  $('modelChooserClose')?.addEventListener('click', () => $('modelChooser').close());
  $('modelSearch')?.addEventListener('input', renderModelChoices);
  $('modelSearch')?.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); $('modelChooser').close(); return; }
    const choices = [...$('modelChoices').querySelectorAll('button')];
    if (event.key === 'Enter' && choices[0]) { event.preventDefault(); choices[0].click(); }
    if (event.key === 'ArrowDown' && choices[0]) { event.preventDefault(); choices[0].focus(); }
  });
  $('modelChoices')?.addEventListener('keydown', event => {
    const choices = [...$('modelChoices').querySelectorAll('button')];
    const index = choices.indexOf(document.activeElement);
    if (index < 0 || !['ArrowDown', 'ArrowUp'].includes(event.key)) return;
    event.preventDefault();
    choices[(index + (event.key === 'ArrowDown' ? 1 : choices.length - 1)) % choices.length].focus();
  });
  $('modelChooser')?.addEventListener('close', () => { if (state.modelFocus?.isConnected) state.modelFocus.focus(); else $('modelTrigger')?.focus(); state.modelFocus = null; });
  $('modelChooser')?.addEventListener('keydown', event => { if (event.key === 'Escape' && $('modelChooser').open) { event.preventDefault(); $('modelChooser').close(); } });
  $('modelChooser')?.addEventListener('click', event => { if (event.target === $('modelChooser')) $('modelChooser').close(); });
  document.querySelector('.controls')?.addEventListener('input', () => { state.settingsRevision += 1; });
  document.querySelector('.controls')?.addEventListener('change', () => { state.settingsRevision += 1; });
  for (const id of ['customToggle', 'widthInput', 'heightInput', 'processingPreset']) $(id).addEventListener('input', updateResolution);
  for (const id of ['processingPreset', 'resultPreset']) $(id).addEventListener('change', () => ensurePreset($(id), id === 'processingPreset' ? $('quality').value : ''));
  $('installConfirm').addEventListener('click', installModels);
  $('installCancel').addEventListener('click', () => cancelSetup());
  $('modelSetupFallback').addEventListener('click', () => cancelSetup(true));
  for (const [id, extra] of [['copyCpuInstall', 'cpu'], ['copyGpuInstall', 'gpu'], ['copyAmdInstall', 'amd'], ['copyAppleInstall', 'apple']]) $(id).addEventListener('click', async () => {
    const command = `python -m pip install "goblin-ai[${extra}]"`;
    try { await navigator.clipboard.writeText(command); text('modelSetupStatus', `Copied: ${command}`); } catch (error) { text('modelSetupError', `Clipboard unavailable. Copy this command manually: ${command}`); }
  });
  $('modelDialog').addEventListener('cancel', event => { event.preventDefault(); cancelSetup(); });
  $('modelDialog').addEventListener('click', event => { if (event.target === $('modelDialog')) { const rect = event.target.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) cancelSetup(); } });
  $('cancelBtn').addEventListener('click', () => { state.operation?.controller.abort(); text('operationStatus', 'Stopped waiting. Server processing may still continue.'); });
  $('retryBtn').addEventListener('click', () => state.retry?.());
  $('setupRetry').addEventListener('click', () => { clearTimeout(state.timer); poll(); });
  $('downloadBtn').addEventListener('click', () => download(state.result));
  $('upscaleResultBtn').addEventListener('click', () => {
    if (state.operation || !state.result) return;
    const [width, height] = upscaleSize(state.result.width, state.result.height);
    if (width <= state.result.width && height <= state.result.height) { text('operationError', 'This image has reached the 4096-pixel processing limit.'); return; }
    operate('upscale', {image_base64: state.result.image_base64, width, height, preset: $('resultPreset').value}, state.result);
  });
  $('randomSeed').addEventListener('click', () => { $('seed').value = crypto.getRandomValues(new Uint32Array(1))[0] % 2147483648; state.settingsRevision += 1; });
  $('randomPrompt').addEventListener('click', async () => {
    if (state.random) return;
    state.random = new AbortController();
    $('randomPrompt').disabled = true;
    const previousPrompt = $('prompt').value;
    const previousNegative = $('negativePrompt').value;
    try {
      const data = await request('/prompts/random', {signal: state.random.signal});
      if (typeof data.prompt !== 'string' || data.prompt.length > 4000) throw new Error('The random prompt response is invalid.');
      if ($('prompt').value !== previousPrompt || $('negativePrompt').value !== previousNegative) { notice('Random prompt ready, but your newer edits were preserved.'); return; }
      $('prompt').value = data.prompt;
      $('negativePrompt').value = typeof data.negative_prompt === 'string' ? data.negative_prompt : '';
      state.settingsRevision += 1;
      text('promptCount', `${data.prompt.length} / 4000`);
      scheduleAutoRoute();
    } catch (error) { notice(error.message); } finally { state.random = null; $('randomPrompt').disabled = false; }
  });
  $('clearGallery').addEventListener('click', () => { if ($('imageDialog').open) $('imageDialog').close(); state.gallery = []; renderGallery(); collectUrls(); });
  $('lightboxPrev').addEventListener('click', () => navigateImage(-1));
  $('lightboxNext').addEventListener('click', () => navigateImage(1));
  $('imageDialog').addEventListener('keydown', event => {
    if (event.target.closest('input,textarea,select,[contenteditable="true"],#lightboxPrompt,#lightboxMeta')) return;
    if (event.key === 'ArrowLeft' && navigateImage(-1) || event.key === 'ArrowRight' && navigateImage(1)) event.preventDefault();
  });
  let lastWheel = 0;
  $('lightboxImg').addEventListener('wheel', event => {
    const direction = Math.sign(Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY);
    if (!direction || Date.now() - lastWheel < 200) return;
    if (navigateImage(direction)) { event.preventDefault(); lastWheel = Date.now(); }
  }, {passive: false});
  let touchStart = null;
  $('lightboxImg').addEventListener('touchstart', event => { if (event.touches.length === 1) touchStart = [event.touches[0].clientX, event.touches[0].clientY]; }, {passive: true});
  $('lightboxImg').addEventListener('touchend', event => {
    if (!touchStart || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touchStart[0];
    const dy = event.changedTouches[0].clientY - touchStart[1];
    touchStart = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) navigateImage(dx < 0 ? 1 : -1);
  }, {passive: true});
  $('lightboxClose').addEventListener('click', () => $('imageDialog').close());
  $('lightboxDownload').addEventListener('click', () => download(state.selected));
  $('imageDialog').addEventListener('close', () => { state.selected = null; if (lastFocus?.isConnected) lastFocus.focus(); else $('clearGallery').focus(); collectUrls(); });
  $('imageDialog').addEventListener('click', event => { if (event.target === $('imageDialog')) { const rect = event.target.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) event.target.close(); } });
  window.addEventListener('pagehide', () => { clearTimeout(state.timer); clearTimeout(state.routeTimer); state.operation?.controller.abort(); state.random?.abort(); state.autoRoute?.controller?.abort(); for (const url of urls) URL.revokeObjectURL(url); });
  updateResolution();
  renderGallery();
  updateControls();
  const cooldownTicker = setInterval(() => { if (state.cooldown) { if (Date.now() >= state.cooldown) state.cooldown = 0; updateControls(); } }, 1000);
  window.addEventListener('pagehide', () => clearInterval(cooldownTicker));
  poll();
})();
}
