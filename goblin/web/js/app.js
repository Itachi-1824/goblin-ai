/**
 * Goblin AI - Neo-Brutalist Interface
 * Main Application Controller
 */

// === STATE ===
const state = {
  status: 'idle', // idle | generating | success | error
  params: {
    prompt: '',
    negative_prompt: '',
    model: 'goblin-sd',
    shape: 'square',
    guidance_scale: 7,
    seed: -1,
    width: null,  // null = no upscale, use native
    height: null,
    upscale_strategy: 'off'
  },
  models: {},
  totalModels: 0,
  currentImage: null,
  gpuInfo: null  // cached GPU info
};

// === DOM ELEMENTS ===
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const dom = {
  prompt: $('#prompt'),
  negativePrompt: $('#negativePrompt'),
  randomBtn: $('#randomBtn'),
  generateBtn: $('#generateBtn'),
  modelsContainer: $('#modelsContainer'),
  modelCount: $('#modelCount'),
  shapeBtns: $$('.shape-btn'),
  guidanceSlider: $('#guidanceSlider'),
  guidanceValue: $('#guidanceValue'),
  sliderFill: $('.slider-fill'),
  seedInput: $('#seedInput'),
  seedRandomBtn: $('#seedRandomBtn'),
  resolutionValue: $('#resolutionValue'),
  presetBtns: $$('.preset-btn'),
  upscaleOptions: $('#upscaleOptions'),
  upscaleModel: $('#upscaleModel'),
  canvas: $('#canvas'),
  placeholder: $('#placeholder'),
  canvasLoader: $('#canvasLoader'),
  resultImage: $('#resultImage'),
  actionBar: $('#actionBar'),
  downloadBtn: $('#downloadBtn'),
  copyBtn: $('#copyBtn'),
  upscaleBtn: $('#upscaleBtn'),
  seedDisplay: $('#seedDisplay'),
  statusText: $('#statusText'),
  statusDot: $('.status-dot'),
  // Modal elements
  upscaleModal: $('#upscaleModal'),
  modalClose: $('#modalClose'),
  modalPresets: $$('.modal-preset'),
  modalWidth: $('#modalWidth'),
  modalHeight: $('#modalHeight'),
  modalModel: $('#modalModel'),
  modalCancel: $('#modalCancel'),
  modalConfirm: $('#modalConfirm')
};

// === API ===
const api = {
  async getModels() {
    const res = await fetch('/models');
    if (!res.ok) throw new Error('Failed to fetch models');
    return res.json();
  },

  async getRandomPrompt() {
    const res = await fetch('/prompts/random');
    if (!res.ok) throw new Error('Failed to fetch prompt');
    return res.json();
  },

  async getGpuStatus() {
    const res = await fetch('/health');
    if (!res.ok) throw new Error('Failed to fetch GPU status');
    return res.json();
  },

  async generate(params) {
    const res = await fetch('/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || 'Generation failed');
    }
    const blob = await res.blob();
    const seed = res.headers.get('X-Seed');
    return { blob, seed };
  }
};

// === RENDER ===
function renderModels() {
  const { models, totalModels } = state;
  dom.modelsContainer.innerHTML = '';
  dom.modelCount.textContent = `${totalModels} available`;

  Object.entries(models).forEach(([catKey, catData]) => {
    const modelList = catData.models || catData;
    const catInfo = catData.info || {};

    if (!modelList?.length) return;

    const category = document.createElement('div');
    category.className = 'model-category';

    const name = document.createElement('div');
    name.className = 'category-name';
    name.textContent = catInfo.name || catKey.replace(/[-_]/g, ' ');
    category.appendChild(name);

    const list = document.createElement('div');
    list.className = 'model-list';

    modelList.forEach(model => {
      const id = typeof model === 'string' ? model : model.id;
      const modelName = typeof model === 'string' ? model : model.name;

      const item = document.createElement('div');
      item.className = 'model-item';
      item.dataset.id = id;

      // Clean display name
      const displayName = modelName
        .replace(/^goblin[-_]/i, '')
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      item.textContent = displayName;

      if (model.tags) {
        item.title = model.tags.join(', ');
      }

      item.addEventListener('click', () => {
        state.params.model = id;
        updateModelSelection();
      });

      list.appendChild(item);
    });

    category.appendChild(list);
    dom.modelsContainer.appendChild(category);
  });

  updateModelSelection();
}

function updateModelSelection() {
  $$('.model-item').forEach(item => {
    item.classList.toggle('active', item.dataset.id === state.params.model);
  });
}

function updateShapeSelection() {
  dom.shapeBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.shape === state.params.shape);
  });
  dom.canvas.className = `canvas canvas--${state.params.shape}`;
}

async function updateGpuIndicator() {
  const indicator = document.getElementById('gpuIndicator');
  const icon = indicator.querySelector('.gpu-icon');
  const text = indicator.querySelector('.gpu-text');

  // Reset state
  indicator.className = 'gpu-indicator checking';
  icon.textContent = '⟳';
  text.textContent = 'Checking...';

  // Use cached info if available
  if (state.gpuInfo) {
    applyGpuInfo(state.gpuInfo);
    return;
  }

  try {
    const data = await api.getGpuStatus();
    state.gpuInfo = data;
    applyGpuInfo(data);
  } catch (e) {
    indicator.className = 'gpu-indicator cpu';
    icon.textContent = '⚠';
    text.textContent = 'Status unknown';
  }
}

function applyGpuInfo(data) {
  const indicator = document.getElementById('gpuIndicator');
  const icon = indicator.querySelector('.gpu-icon');
  const text = indicator.querySelector('.gpu-text');

  if (data.cuda_available || data.gpu) {
    indicator.className = 'gpu-indicator gpu';
    icon.textContent = '⚡';
    const gpuName = data.gpu_name || data.device || 'GPU';
    text.textContent = `GPU: ${gpuName}`;
  } else {
    indicator.className = 'gpu-indicator cpu';
    icon.textContent = '🖥';
    text.textContent = 'CPU Mode (slower)';
  }
}

function updateResolutionSelection() {
  const resLabels = { 0: 'Off', 1024: 'HD', 1920: 'FHD', 2048: '2K', 4096: '4K' };
  const currentRes = state.params.width || 0;

  dom.presetBtns.forEach(btn => {
    const res = parseInt(btn.dataset.res, 10);
    btn.classList.toggle('active', res === currentRes);
  });

  // Update display value
  dom.resolutionValue.textContent = resLabels[currentRes] || currentRes;

  // Show/hide upscale model selector and check GPU
  const showUpscale = currentRes > 0;
  dom.upscaleOptions.classList.toggle('visible', showUpscale);

  if (showUpscale) {
    updateGpuIndicator();
  }
}

function updateSliderFill() {
  const min = parseFloat(dom.guidanceSlider.min);
  const max = parseFloat(dom.guidanceSlider.max);
  const val = parseFloat(dom.guidanceSlider.value);
  const percent = ((val - min) / (max - min)) * 100;
  if (dom.sliderFill) {
    dom.sliderFill.style.width = `${percent}%`;
  }
}

function setStatus(status, text) {
  if (dom.statusText) {
    dom.statusText.textContent = text;
  }
  if (dom.statusDot) {
    dom.statusDot.style.background =
      status === 'error' ? 'var(--error)' :
      status === 'busy' ? 'var(--warning)' :
      'var(--success)';
  }
}

function updateUI() {
  const { status } = state;
  const isGenerating = status === 'generating';

  // Status indicator
  if (isGenerating) {
    setStatus('busy', 'Generating');
  } else {
    setStatus('ok', 'Ready');
  }

  // Generate button
  dom.generateBtn.disabled = isGenerating;
  dom.generateBtn.classList.toggle('generating', isGenerating);

  const generateText = dom.generateBtn.querySelector('.generate-text');
  const generateIcon = dom.generateBtn.querySelector('.generate-icon');

  if (isGenerating) {
    generateText.textContent = 'Creating';
    generateIcon.innerHTML = `
      <div class="loader-ring" style="width:20px;height:20px">
        <div class="ring ring-1" style="border-width:2px"></div>
      </div>
    `;
  } else {
    generateText.textContent = 'Generate';
    generateIcon.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="5" y1="12" x2="19" y2="12"/>
        <polyline points="12 5 19 12 12 19"/>
      </svg>
    `;
  }

  // Canvas states
  if (isGenerating) {
    dom.placeholder.classList.add('hidden');
    dom.canvasLoader.classList.remove('hidden');
    dom.resultImage.classList.remove('visible');
  } else {
    dom.canvasLoader.classList.add('hidden');
  }

  // Guidance value
  dom.guidanceValue.textContent = state.params.guidance_scale.toFixed(1);
  updateSliderFill();

  // Sync textareas if not focused
  if (document.activeElement !== dom.prompt) {
    dom.prompt.value = state.params.prompt;
  }
  if (document.activeElement !== dom.negativePrompt) {
    dom.negativePrompt.value = state.params.negative_prompt;
  }
}

function showImage(url, seed) {
  dom.resultImage.src = url;
  dom.resultImage.onload = () => {
    dom.placeholder.classList.add('hidden');
    dom.resultImage.classList.add('visible');
    dom.actionBar.classList.add('visible');
  };
  dom.seedDisplay.textContent = seed || '---';
}

// === EVENT HANDLERS ===
function setupEvents() {
  // Prompt input
  dom.prompt.addEventListener('input', (e) => {
    state.params.prompt = e.target.value;
  });

  dom.negativePrompt.addEventListener('input', (e) => {
    state.params.negative_prompt = e.target.value;
  });

  // Guidance slider
  dom.guidanceSlider.addEventListener('input', (e) => {
    state.params.guidance_scale = parseFloat(e.target.value);
    updateUI();
  });

  // Seed input
  dom.seedInput.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    state.params.seed = val === '' ? -1 : parseInt(val, 10);
  });

  // Seed random button - clear to use random
  dom.seedRandomBtn.addEventListener('click', () => {
    dom.seedInput.value = '';
    state.params.seed = -1;
  });

  // Resolution presets
  dom.presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const res = parseInt(btn.dataset.res, 10);
      if (res === 0) {
        // Off - no upscale
        state.params.width = null;
        state.params.height = null;
        state.params.upscale_strategy = 'off';
      } else if (res === 1920) {
        // FHD 1920x1080
        state.params.width = 1920;
        state.params.height = 1080;
        state.params.upscale_strategy = 'balanced';
      } else {
        // Square
        state.params.width = res;
        state.params.height = res;
        state.params.upscale_strategy = 'balanced';
      }
      updateResolutionSelection();
    });
  });

  // Upscale model select
  dom.upscaleModel.addEventListener('change', (e) => {
    state.params.upscale_strategy = e.target.value === 'default' ? 'balanced' : e.target.value;
  });

  // Shape buttons
  dom.shapeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      state.params.shape = btn.dataset.shape;
      updateShapeSelection();
    });
  });

  // Random prompt
  dom.randomBtn.addEventListener('click', async () => {
    try {
      dom.randomBtn.disabled = true;
      const data = await api.getRandomPrompt();
      state.params.prompt = data.prompt || '';
      state.params.negative_prompt = data.negative_prompt || '';
      updateUI();
    } catch (e) {
      console.error('Random prompt failed:', e);
    } finally {
      dom.randomBtn.disabled = false;
    }
  });

  // Generate
  dom.generateBtn.addEventListener('click', async () => {
    const prompt = state.params.prompt.trim();
    if (!prompt) {
      dom.prompt.focus();
      dom.prompt.classList.add('shake');
      setTimeout(() => dom.prompt.classList.remove('shake'), 500);
      return;
    }

    state.status = 'generating';
    updateUI();

    try {
      // Cleanup old blob
      if (state.currentImage?.url) {
        URL.revokeObjectURL(state.currentImage.url);
      }

      const { blob, seed } = await api.generate(state.params);
      const url = URL.createObjectURL(blob);

      state.currentImage = { url, seed };
      state.status = 'success';

      showImage(url, seed);
    } catch (e) {
      console.error('Generation failed:', e);
      state.status = 'error';
      setStatus('error', 'Error');
      alert('Generation failed: ' + e.message);
    } finally {
      updateUI();
    }
  });

  // Download
  dom.downloadBtn.addEventListener('click', () => {
    if (!state.currentImage?.url) return;

    const a = document.createElement('a');
    a.href = state.currentImage.url;
    a.download = `goblin-${state.currentImage.seed || Date.now()}.png`;
    a.click();
  });

  // Copy
  dom.copyBtn.addEventListener('click', async () => {
    if (!state.currentImage?.url) return;

    try {
      // Create a canvas to convert to PNG (better clipboard support)
      const img = dom.resultImage;
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      // Convert to blob and copy
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);

      const originalHTML = dom.copyBtn.innerHTML;
      dom.copyBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span>Copied!</span>
      `;

      setTimeout(() => {
        dom.copyBtn.innerHTML = originalHTML;
      }, 2000);
    } catch (e) {
      console.error('Copy failed:', e);
      alert('Copy failed - try right-click > Copy Image instead');
    }
  });

  // Upscale button - open modal
  dom.upscaleBtn.addEventListener('click', () => {
    if (!state.currentImage?.url) return;
    dom.upscaleModal.classList.remove('hidden');
  });

  // Modal close handlers
  dom.modalClose.addEventListener('click', () => {
    dom.upscaleModal.classList.add('hidden');
  });

  dom.modalCancel.addEventListener('click', () => {
    dom.upscaleModal.classList.add('hidden');
  });

  dom.upscaleModal.querySelector('.modal-backdrop').addEventListener('click', () => {
    dom.upscaleModal.classList.add('hidden');
  });

  // Modal preset buttons
  dom.modalPresets.forEach(btn => {
    btn.addEventListener('click', () => {
      dom.modalPresets.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      dom.modalWidth.value = btn.dataset.w;
      dom.modalHeight.value = btn.dataset.h;
    });
  });

  // Custom input clears preset selection
  dom.modalWidth.addEventListener('input', () => {
    dom.modalPresets.forEach(b => b.classList.remove('active'));
  });
  dom.modalHeight.addEventListener('input', () => {
    dom.modalPresets.forEach(b => b.classList.remove('active'));
  });

  // Modal confirm - do the upscale
  dom.modalConfirm.addEventListener('click', async () => {
    const width = parseInt(dom.modalWidth.value, 10);
    const height = parseInt(dom.modalHeight.value, 10);

    if (!width || !height || width < 512 || height < 512 || width > 4096 || height > 4096) {
      alert('Please enter valid dimensions (512-4096)');
      return;
    }

    // Get image as base64
    const img = dom.resultImage;
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const base64 = canvas.toDataURL('image/png').split(',')[1];

    // Close modal and show loading
    dom.upscaleModal.classList.add('hidden');
    setStatus('busy', 'Upscaling');
    dom.upscaleBtn.disabled = true;

    try {
      const response = await fetch('/upscale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: base64,
          width: width,
          height: height,
          model: dom.modalModel.value
        })
      });

      if (!response.ok) throw new Error('Upscale failed');

      const data = await response.json();

      // Update image
      if (state.currentImage?.url) {
        URL.revokeObjectURL(state.currentImage.url);
      }

      const byteArray = Uint8Array.from(atob(data.image_base64), c => c.charCodeAt(0));
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);

      state.currentImage.url = url;
      dom.resultImage.src = url;

      setStatus('ok', 'Ready');
    } catch (e) {
      console.error('Upscale failed:', e);
      alert('Upscale failed: ' + e.message);
      setStatus('error', 'Error');
    } finally {
      dom.upscaleBtn.disabled = false;
    }
  });

  // Keyboard shortcut: Ctrl/Cmd + Enter to generate
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      dom.generateBtn.click();
    }
  });
}

// === INIT ===
async function init() {
  setupEvents();
  updateShapeSelection();
  updateSliderFill();
  updateUI();

  // Load models
  try {
    const data = await api.getModels();
    state.models = data.categories || data;
    state.totalModels = data.total_models || Object.values(state.models).flat().length;
    renderModels();
  } catch (e) {
    console.error('Failed to load models:', e);
    dom.modelsContainer.innerHTML = `
      <div style="color: var(--error); padding: var(--space-lg); text-align: center; font-size: 0.75rem; font-family: var(--font-mono);">
        Failed to connect.<br>
        <span style="opacity: 0.6">Is the backend running?</span>
      </div>
    `;
    setStatus('error', 'Offline');
  }
}

// Start
init();
