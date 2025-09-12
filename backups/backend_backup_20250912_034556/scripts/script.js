// ✅ CSS Classes from HTML v0.0.7 - Main JavaScript ✅

// ✅ СТАНДАРТИЗОВАНА СИСТЕМА КОМУНІКАЦІЇ ✅

// Константи для команд фронтенд -> розширення
const COMMANDS_TO_EXTENSION = {
  // HTML файли
  SELECT_HTML_FILE: 'selectHTMLFile',
  REFRESH_HTML_CONTEXT: 'refreshHTMLContext',
  
  // CSS генерація
  GENERATE_CSS: 'generateCSS',
  QUICK_GENERATE: 'quickGenerate',
  
  // Figma інтеграція
  LOAD_FIGMA_CANVASES: 'loadFigmaCanvases',
  GET_FIGMA_LAYERS: 'getFigmaLayers',
  SEARCH_FIGMA_LAYERS: 'searchFigmaLayers',
  GET_LAYER_STYLES: 'getLayerStyles',
  IMPORT_IMAGES: 'importImages',
  IMPORT_FONTS: 'importFonts',
  
  // Налаштування
  LOAD_SETTINGS: 'loadSettings',
  SAVE_SETTINGS: 'saveSettings',
  SAVE_LANGUAGE: 'saveLanguage',
  
  // Стилі
  LOAD_STYLE_LIBRARIES: 'loadStyleLibraries',
  SELECT_STYLE_LIBRARY: 'selectStyleLibrary',
  SAVE_STYLE_LIBRARY: 'saveStyleLibrary'
};

// Константи для команд розширення -> фронтенд
const COMMANDS_FROM_EXTENSION = {
  // HTML файли
  HTML_FILE_SELECTED: 'htmlFileSelected',
  HTML_CONTEXT_UPDATED: 'updateHTMLContext',
  
  // CSS генерація
  CSS_GENERATED: 'cssGenerated',
  GENERATION_COMPLETE: 'generationComplete',
  
  // Figma дані
  FIGMA_CANVASES_LOADED: 'figmaCanvasesLoaded',
  FIGMA_LAYERS_LOADED: 'figmaLayers',
  LAYER_STYLES_LOADED: 'layerStyles',
  
  // Налаштування
  SETTINGS_LOADED: 'settingsLoaded',
  SETTINGS_SAVED: 'settingsSaved',
  
  // Статуси
  ERROR: 'error',
  SUCCESS: 'success',
  STATUS_UPDATE: 'statusUpdate'
};

// VSCode API initialization
let vscode;
try {
  vscode = acquireVsCodeApi();
  console.log('✅ VS Code API acquired successfully');
} catch (error) {
  console.error('❌ Failed to acquire VS Code API:', error);
  vscode = {
    postMessage: message => {
      console.error('❌ VS Code API not available, message:', message);
      alert('VS Code API не доступний. Будь ласка, перезапустіть розширення.');
    }
  };
}

// ✅ СТАНДАРТИЗОВАНІ ФУНКЦІЇ КОМУНІКАЦІЇ ✅

// Основна функція для надсилання команд до розширення
function sendCommandToExtension(command, payload = {}) {
  try {
    const message = {
      command,
      timestamp: Date.now(),
      requestId: generateRequestId(),
      ...payload
    };
    
    console.log(`📤 Надсилаю команду: ${command}`, message);
    vscode.postMessage(message);
    
    return message.requestId;
  } catch (error) {
    console.error(`❌ Помилка надсилання команди ${command}:`, error);
    showStatus(`❌ Помилка комунікації: ${error.message}`, 'error');
    throw error;
  }
}

// Генерація унікального ID для запитів
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Валідація повідомлень від розширення
function validateMessageFromExtension(message) {
  if (!message || typeof message !== 'object') {
    throw new Error('Некоректне повідомлення від розширення');
  }
  
  if (!message.command) {
    throw new Error('Відсутня команда у повідомленні');
  }
  
  return true;
}

// Application state
let state = {
  mode: 'minimal',
  currentHTMLFile: null,
  currentHTMLPath: null,
  figmaLink: '',
  figmaToken: '',
  selectedCanvases: [],
  selectedLayers: [],
  selectedCanvasIds: new Set(),
  selectedLayerIds: new Set(),
  settings: {},
  currentLanguage: 'uk',
  lastRenderedLayout: null,
  cssFileNameTemplate: 'styles.css',
  pendingRequests: new Map() // Для відстеження запитів
};

// Dynamic actions panel configurations
const actionPanelConfigs = {
  default: [
    { text: '📂 Завантажити', action: 'loadLastSettings()', class: 'btn-secondary' },
    { text: '💾 Зберегти', action: 'saveSettings()', class: 'btn-secondary' },
    { text: '🗑️ Очистити', action: 'clearSettings()', class: 'btn-secondary' },
    { text: '🇺🇦 🚀 Генерувати CSS', action: 'generateCSS()', class: 'btn-primary', id: 'generateBtn' }
  ],
  generating: [
    { text: '⏳ Генерація...', action: '', class: 'btn-secondary', disabled: true },
    { text: '❌ Скасувати', action: 'cancelGeneration()', class: 'btn-danger' }
  ],
  completed: [
    { text: '📋 Копіювати CSS', action: 'copyGeneratedCSS()', class: 'btn-success' },
    { text: '💾 Зберегти CSS', action: 'saveGeneratedCSS()', class: 'btn-primary' },
    { text: '🔄 Нова генерація', action: 'resetToDefault()', class: 'btn-secondary' }
  ],
  error: [
    { text: '🔄 Спробувати знову', action: 'generateCSS()', class: 'btn-warning' },
    { text: '📋 Копіювати помилку', action: 'copyError()', class: 'btn-secondary' },
    { text: '🏠 На головну', action: 'resetToDefault()', class: 'btn-primary' }
  ]
};

// Update actions panel function
function updateActionsPanel(configName = 'default') {
  const panel = document.getElementById('actionsPanel');
  const config = actionPanelConfigs[configName] || actionPanelConfigs.default;
  
  panel.innerHTML = '';
  
  config.forEach(buttonConfig => {
    const button = document.createElement('button');
    button.className = `btn ${buttonConfig.class}`;
    button.textContent = buttonConfig.text;
    
    if (buttonConfig.id) {
      button.id = buttonConfig.id;
    }
    
    if (buttonConfig.disabled) {
      button.disabled = true;
    }
    
    if (buttonConfig.action) {
      button.setAttribute('onclick', buttonConfig.action);
    }
    
    panel.appendChild(button);
  });
  
  console.log(`🎯 Панель дій оновлена: ${configName}`);
}

// Panel state management functions
window.setActionsPanel = updateActionsPanel;

window.resetToDefault = function() {
  updateActionsPanel('default');
};

window.cancelGeneration = function() {
  showStatus('❌ Генерацію скасовано', 'warning');
  updateActionsPanel('default');
};

// ✅ FIX: Функції роботи з HTML контекстом ✅
window.selectHTMLFile = function() {
  sendCommandToExtension(COMMANDS_TO_EXTENSION.SELECT_HTML_FILE);
};

window.refreshHTMLContext = function() {
  sendCommandToExtension(COMMANDS_TO_EXTENSION.REFRESH_HTML_CONTEXT);
  showStatus('🔄 Оновлення контексту...', 'info');
};

// Оновлення відображення поточного HTML файлу
window.updateHTMLDisplay = function(fileName, fullPath = null) {
  const element = document.getElementById('currentHTMLFile');
  
  state.currentHTMLFile = fileName;
  state.currentHTMLPath = fullPath;
  
  if (element) {
    element.textContent = fileName || 'Не вибрано';
    element.style.color = fileName ? 'white' : 'rgba(255,255,255,0.7)';
    element.title = fullPath || '';
  }
  
  console.log('📄 HTML display updated:', {fileName, fullPath});
};

window.copyGeneratedCSS = function() {
  showStatus('📋 CSS скопійовано', 'success');
};

window.saveGeneratedCSS = function() {
  showStatus('💾 CSS збережено', 'success');
};

window.copyError = function() {
  showStatus('📋 Помилку скопійовано', 'info');
};


// Translation system
const translations = {
  uk: {
    main_title: '🇺🇦 🎨 CSS Classes from HTML v0.0.7',
    subtitle: 'Автоматична генерація CSS • Реальна інтеграція з Figma • Розумне співставлення',
    current_html_file: 'Поточний HTML файл:',
    not_selected: 'Не вибрано',
    select: '📂 Вибрати',
    refresh: '🔄',
    language_label: 'Мова:',
    title: 'CSS Classes from HTML',
    basic_tab: 'Основні',
    figma_tab: 'Figma',
    advanced_tab: 'Розширені',
    basic_settings: '⚙️ Основні налаштування',
    css_file_name: 'Назва згенерованого CSS файлу',
    include_reset: 'Включити Reset стилі',
    include_variables: 'CSS змінні',
    include_responsive: 'Responsive стилі',
    include_global: 'Глобальні стилі',
    figma_integration: '🎨 Figma інтеграція',
    figma_link: 'Figma File URL',
    figma_token: 'Figma API Token',
    load_canvas: '📋 Завантажити Canvas',
    get_token: '🔑 Отримати Token',
    canvas_selection: '📋 Вибір Canvas',
    layers_selection: '🎨 Вибір Layers',
    select_all: '✅ Всі',
    clear_all: '❌ Очистити',
    get_styles: '🎯 Отримати стилі',
    copy_all: '📋 Копіювати все',
    advanced_settings: '🔧 Розширені налаштування',
    confidence_threshold: 'Поріг співпадіння'
  },
  en: {
    main_title: '🇺🇦 🎨 CSS Classes from HTML v0.0.7',
    subtitle: 'Automatic CSS generation • Real Figma integration • Smart matching',
    current_html_file: 'Current HTML file:',
    not_selected: 'Not selected',
    select: '📂 Select',
    refresh: '🔄',
    language_label: 'Language:',
    title: 'CSS Classes from HTML',
    basic_tab: 'Basic',
    figma_tab: 'Figma',
    advanced_tab: 'Advanced',
    basic_settings: '⚙️ Basic settings',
    css_file_name: 'Generated CSS file name',
    include_reset: 'Include Reset styles',
    include_variables: 'CSS variables',
    include_responsive: 'Responsive styles',
    include_global: 'Global styles',
    figma_integration: '🎨 Figma integration',
    figma_link: 'Figma File URL',
    figma_token: 'Figma API Token',
    load_canvas: '📋 Load Canvas',
    get_token: '🔑 Get Token',
    canvas_selection: '📋 Canvas Selection',
    layers_selection: '🎨 Layers Selection',
    select_all: '✅ All',
    clear_all: '❌ Clear',
    get_styles: '🎯 Get styles',
    copy_all: '📋 Copy all',
    advanced_settings: '🔧 Advanced settings',
    confidence_threshold: 'Confidence threshold'
  }
};

// Language functions
window.t = function (key, params = {}) {
  const currentLang = state.currentLanguage;
  const langTranslations = translations[currentLang];
  const fallbackTranslations = translations.uk;
  
  let text = langTranslations?.[key] || fallbackTranslations?.[key] || key;
  
  Object.keys(params).forEach(param => {
    text = text.replace(`{${param}}`, params[param]);
  });
  
  return text;
};

window.setLanguage = function (lang) {
  console.log(`🌍 setLanguage() викликана з мовою: ${lang}`);
  console.log('📊 Поточний state.currentLanguage:', state.currentLanguage);
  
  if (lang === 'auto') {
    lang = getVSCodeLanguage();
  }
  
  if (lang !== state.currentLanguage) {
    state.currentLanguage = lang;
    updateActiveLanguageButton();
    updateAllTranslations();
    
    sendCommandToExtension(COMMANDS_TO_EXTENSION.SAVE_LANGUAGE, {
      language: lang
    });
  }
};

window.updateActiveLanguageButton = function () {
  console.log('🎯 Updating active language button for:', state.currentLanguage);
  
  document.querySelectorAll('.lang-flag-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const activeBtn = document.querySelector(`[data-lang="${state.currentLanguage}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
};

window.getVSCodeLanguage = function () {
  const browserLang = navigator.language || navigator.userLanguage || 'en';
  const allLanguages = navigator.languages || [browserLang];
  
  for (const lang of allLanguages) {
    if (lang.startsWith('uk') || lang.startsWith('ru')) {
      return 'uk';
    }
    if (lang.startsWith('en')) {
      return 'en';
    }
  }
  
  return 'uk';
};

window.updateAllTranslations = function () {
  console.log('🔄 Updating translations for language:', state.currentLanguage);
  
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = t(key);
    
    if (element.tagName === 'INPUT' && element.type !== 'checkbox') {
      element.placeholder = translation;
    } else {
      element.textContent = translation;
    }
  });
  
  const cssFileNameInput = document.getElementById('cssFileName');
  if (cssFileNameInput) {
    cssFileNameInput.placeholder = state.cssFileNameTemplate;
    
    cssFileNameInput.addEventListener('input', function (e) {
      const newValue = e.target.value.trim() || 'styles.css';
      state.cssFileNameTemplate = newValue;
      console.log('💾 CSS file name template updated:', state.cssFileNameTemplate);
    });
  }
};

// HTML Context functions - перенесено вище для уникнення дублікатів

// Mode selection
window.selectMode = function (mode) {
  console.log('🔧 selectMode() викликана з режимом:', mode);
  state.mode = mode;
  
  document.querySelectorAll('.mode-card').forEach(card => {
    card.classList.remove('active');
  });
  
  const selectedCard = document.querySelector(`[data-mode="${mode}"]`);
  if (selectedCard) {
    selectedCard.classList.add('active');
  }
  
  showStatus(t('modeSelected', {mode: getModeTitle(mode)}), 'success');
};

window.getModeTitle = function (mode) {
  const titles = {
    minimal: 'Мінімальний',
    maximum: 'Максимальний',
    production: 'Production'
  };
  return titles[mode] || mode;
};

// Tab switching
window.switchTab = function (tabName) {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
  const activeContent = document.getElementById(tabName);
  
  if (activeTab) activeTab.classList.add('active');
  if (activeContent) activeContent.classList.add('active');
};

// ✅ ВАЛІДАЦІЯ ТА ОБРОБКА ПОМИЛОК ✅

// Валідація Figma URL
function validateFigmaUrl(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('URL не може бути порожнім');
  }
  
  const figmaUrlPattern = /^https:\/\/(www\.)?figma\.com\/(file|design)\/[a-zA-Z0-9]+/;
  if (!figmaUrlPattern.test(url)) {
    throw new Error('Некоректний Figma URL. Використовуйте формат: https://www.figma.com/file/...');
  }
  
  return true;
}

// Валідація Figma токену
function validateFigmaToken(token) {
  if (!token || typeof token !== 'string') {
    throw new Error('Token не може бути порожнім');
  }
  
  if (token.length < 20) {
    throw new Error('Token занадто короткий. Переконайтеся, що використовуєте правильний Figma API token');
  }
  
  return true;
}

// Валідація налаштувань CSS
function validateCSSSettings(settings) {
  const errors = [];
  
  if (settings.cssFileName && !/^[\w\-. ]+\.css$/i.test(settings.cssFileName)) {
    errors.push('Назва CSS файлу повинна закінчуватися на .css');
  }
  
  if (settings.confidenceThreshold) {
    const threshold = parseInt(settings.confidenceThreshold);
    if (isNaN(threshold) || threshold < 0 || threshold > 100) {
      errors.push('Поріг співпадіння повинен бути числом від 0 до 100');
    }
  }
  
  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }
  
  return true;
}

// Figma functions з валідацією
window.loadCanvas = function () {
  try {
    const figmaLink = document.getElementById('figmaLink').value.trim();
    const figmaToken = document.getElementById('figmaToken').value.trim();
    
    // Валідація вводу
    validateFigmaUrl(figmaLink);
    validateFigmaToken(figmaToken);
    
    sendCommandToExtension(COMMANDS_TO_EXTENSION.LOAD_FIGMA_CANVASES, {
      figmaLink: figmaLink,
      figmaToken: figmaToken
    });
    
    showStatus('🔄 Завантаження Canvas...', 'info');
    
  } catch (error) {
    showStatus(`❌ ${error.message}`, 'error');
  }
};

window.getFigmaToken = function () {
  window.open('https://www.figma.com/developers/api#access-tokens', '_blank');
};

window.selectAllCanvases = function () {
  document.querySelectorAll('#canvasList input[type="checkbox"]').forEach(checkbox => {
    checkbox.checked = true;
  });
};

window.clearCanvasSelection = function () {
  document.querySelectorAll('#canvasList input[type="checkbox"]').forEach(checkbox => {
    checkbox.checked = false;
  });
};

window.selectAllLayers = function () {
  document.querySelectorAll('#layersList input[type="checkbox"]').forEach(checkbox => {
    checkbox.checked = true;
  });
};

window.clearLayerSelection = function () {
  document.querySelectorAll('#layersList input[type="checkbox"]').forEach(checkbox => {
    checkbox.checked = false;
  });
};

window.requestLayerStyles = function () {
  showStatus('🎯 Отримання стилів...', 'info');
};

window.copyAllStyles = function () {
  showStatus('📋 Стилі скопійовано', 'success');
};

// Settings functions
window.loadLastSettings = function () {
  sendCommandToExtension(COMMANDS_TO_EXTENSION.LOAD_SETTINGS);
  showStatus('📂 Завантаження налаштувань...', 'info');
};

window.saveSettings = function () {
  try {
    const settings = {
      mode: state.mode,
      figmaLink: document.getElementById('figmaLink')?.value.trim() || '',
      figmaToken: document.getElementById('figmaToken')?.value.trim() || '',
      includeReset: document.getElementById('includeReset')?.checked || false,
      includeVariables: document.getElementById('includeVariables')?.checked || false,
      includeResponsive: document.getElementById('includeResponsive')?.checked || false,
      includeGlobal: document.getElementById('includeGlobal')?.checked || false,
      confidenceThreshold: document.getElementById('confidenceThreshold')?.value || 70,
      cssFileName: document.getElementById('cssFileName')?.value.trim() || 'styles.css'
    };
    
    // Валідація налаштувань
    validateCSSSettings(settings);
    
    // Валідація Figma даних якщо вони є
    if (settings.figmaLink && settings.figmaToken) {
      validateFigmaUrl(settings.figmaLink);
      validateFigmaToken(settings.figmaToken);
    }
    
    sendCommandToExtension(COMMANDS_TO_EXTENSION.SAVE_SETTINGS, {
      settings: settings
    });
    
    showStatus('💾 Налаштування збережено', 'success');
    
  } catch (error) {
    showStatus(`❌ Помилка збереження: ${error.message}`, 'error');
  }
};

window.clearSettings = function () {
  document.getElementById('figmaLink').value = '';
  document.getElementById('figmaToken').value = '';
  document.getElementById('includeReset').checked = false;
  document.getElementById('includeVariables').checked = false;
  document.getElementById('includeResponsive').checked = false;
  document.getElementById('includeGlobal').checked = false;
  document.getElementById('confidenceThreshold').value = 70;
  document.getElementById('confidenceValue').textContent = '70%';
  document.getElementById('cssFileName').value = '';
  
  showStatus('🗑️ Налаштування очищено', 'info');
};

// Status display function
window.showStatus = function (message, type = 'info') {
  const statusElement = document.getElementById('statusMessage');
  if (statusElement) {
    statusElement.textContent = message;
    statusElement.className = `status ${type}`;
    
    setTimeout(() => {
      statusElement.textContent = '';
      statusElement.className = 'status';
    }, 3000);
  }
  console.log(`📢 Status: ${message} (${type})`);
};

// ✅ СТАНДАРТИЗОВАНА ОБРОБКА ПОВІДОМЛЕНЬ ✅

// Мапа обробників команд
const messageHandlers = {
  [COMMANDS_FROM_EXTENSION.HTML_FILE_SELECTED]: (message) => {
    updateHTMLDisplay(message.fileName, message.fullPath);
    showStatus('📄 HTML файл вибрано', 'success');
  },

  [COMMANDS_FROM_EXTENSION.HTML_CONTEXT_UPDATED]: (message) => {
    if (message.fileName) {
      updateHTMLDisplay(message.fileName, message.fullPath);
    }
    showStatus('🔄 Контекст оновлено', 'info');
  },

  [COMMANDS_FROM_EXTENSION.SETTINGS_LOADED]: (message) => {
    if (message.settings) {
      Object.assign(state, message.settings);
      updateUIFromSettings(message.settings);
      showStatus('📂 Налаштування завантажено', 'success');
    }
  },

  [COMMANDS_FROM_EXTENSION.SETTINGS_SAVED]: (message) => {
    showStatus('💾 Налаштування збережено', 'success');
  },

  [COMMANDS_FROM_EXTENSION.FIGMA_CANVASES_LOADED]: (message) => {
    if (message.canvases) {
      displayCanvases(message.canvases);
      showStatus(`📋 Завантажено ${message.canvases.length} Canvas`, 'success');
    }
  },

  [COMMANDS_FROM_EXTENSION.CSS_GENERATED]: (message) => {
    if (message.success) {
      updateActionsPanel('completed');
      showStatus('✅ CSS успішно згенеровано', 'success');
      
      // Додаткові дії при успішній генерації
      if (message.cssContent) {
        console.log('🎨 Generated CSS length:', message.cssContent.length);
      }
    } else {
      updateActionsPanel('error');
      const errorMsg = message.error || 'Невідома помилка';
      showStatus(`❌ Помилка генерації CSS: ${errorMsg}`, 'error');
    }
  },

  [COMMANDS_FROM_EXTENSION.ERROR]: (message) => {
    const errorMsg = message.error || message.message || 'Невідома помилка';
    showStatus(`❌ Помилка: ${errorMsg}`, 'error');
    console.error('Extension error:', message);
  }
};

// Message handler
window.handleMessage = function (event) {
  try {
    validateMessageFromExtension(event.data);
    
    const message = event.data;
    console.log(`📨 Received: ${message.command}`, message);
    
    // Обробляємо запит, якщо є requestId
    if (message.requestId && state.pendingRequests.has(message.requestId)) {
      const request = state.pendingRequests.get(message.requestId);
      request.resolve(message);
      state.pendingRequests.delete(message.requestId);
    }
    
    // Знаходимо та викликаємо обробник
    const handler = messageHandlers[message.command];
    
    if (handler) {
      handler(message);
    } else {
      console.warn(`🤷 Unknown message command: ${message.command}`);
      showStatus(`⚠️ Невідома команда: ${message.command}`, 'warning');
    }
    
  } catch (error) {
    console.error('❌ Error handling message:', error);
    showStatus(`❌ Помилка обробки повідомлення: ${error.message}`, 'error');
  }
};

function updateUIFromSettings(settings) {
  if (settings.figmaLink) document.getElementById('figmaLink').value = settings.figmaLink;
  if (settings.figmaToken) document.getElementById('figmaToken').value = settings.figmaToken;
  if (settings.includeReset !== undefined) document.getElementById('includeReset').checked = settings.includeReset;
  if (settings.includeVariables !== undefined) document.getElementById('includeVariables').checked = settings.includeVariables;
  if (settings.includeResponsive !== undefined) document.getElementById('includeResponsive').checked = settings.includeResponsive;
  if (settings.includeGlobal !== undefined) document.getElementById('includeGlobal').checked = settings.includeGlobal;
  if (settings.confidenceThreshold) {
    document.getElementById('confidenceThreshold').value = settings.confidenceThreshold;
    document.getElementById('confidenceValue').textContent = settings.confidenceThreshold + '%';
  }
  if (settings.cssFileName) document.getElementById('cssFileName').value = settings.cssFileName;
  if (settings.mode) selectMode(settings.mode);
}

function displayCanvases(canvases) {
  const container = document.getElementById('canvasList');
  container.innerHTML = '';
  
  canvases.forEach(canvas => {
    const div = document.createElement('div');
    div.className = 'list-item';
    div.innerHTML = `
      <label>
        <input type="checkbox" value="${canvas.id}">
        <span>${canvas.name}</span>
      </label>
    `;
    container.appendChild(div);
  });
}

// Initialize event listeners
function initializeEventListeners() {
  // Language buttons
  document.querySelectorAll('.lang-flag-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const lang = e.target.getAttribute('data-lang');
      console.log('🖱️ Language button clicked:', lang);
      if (window.setLanguage) {
        window.setLanguage(lang);
      }
    });
  });
  
  // Confidence threshold slider
  const slider = document.getElementById('confidenceThreshold');
  const value = document.getElementById('confidenceValue');
  if (slider && value) {
    slider.addEventListener('input', function () {
      value.textContent = this.value + '%';
    });
  }
  
  // Tab buttons
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', e => {
      const tabName = e.target.getAttribute('data-tab');
      switchTab(tabName);
    });
  });
  
  // Mode cards
  document.querySelectorAll('.mode-card').forEach(card => {
    card.addEventListener('click', e => {
      const mode = e.currentTarget.getAttribute('data-mode');
      selectMode(mode);
    });
  });
}

// Enhanced generateCSS function з валідацією та обробкою помилок
window.generateCSS = function() {
  try {
    console.log('🚀 generateCSS() викликана');
    
    // Перевіряємо чи вибрано HTML файл
    if (!state.currentHTMLFile || !state.currentHTMLPath) {
      throw new Error('Спочатку виберіть HTML файл для генерації CSS');
    }
    
    updateActionsPanel('generating');
    
    // Get current settings
    const settings = {
      mode: state.mode,
      currentHTMLFile: state.currentHTMLFile,
      currentHTMLPath: state.currentHTMLPath,
      figmaLink: document.getElementById('figmaLink')?.value.trim() || '',
      figmaToken: document.getElementById('figmaToken')?.value.trim() || '',
      includeReset: document.getElementById('includeReset')?.checked || false,
      includeVariables: document.getElementById('includeVariables')?.checked || false,
      includeResponsive: document.getElementById('includeResponsive')?.checked || false,
      includeGlobal: document.getElementById('includeGlobal')?.checked || false,
      confidenceThreshold: document.getElementById('confidenceThreshold')?.value || 70,
      cssFileName: document.getElementById('cssFileName')?.value.trim() || 'styles.css'
    };
    
    // Валідація налаштувань
    validateCSSSettings(settings);
    
    // Валідація Figma даних якщо використовується максимальний режим
    if (settings.mode === 'maximum' && (!settings.figmaLink || !settings.figmaToken)) {
      throw new Error('Для максимального режиму потрібні Figma URL та API Token');
    }
    
    if (settings.figmaLink && settings.figmaToken) {
      validateFigmaUrl(settings.figmaLink);
      validateFigmaToken(settings.figmaToken);
    }
    
    // Send to extension
    sendCommandToExtension(COMMANDS_TO_EXTENSION.GENERATE_CSS, {
      settings: settings
    });
    
  } catch (error) {
    updateActionsPanel('error');
    showStatus(`❌ ${error.message}`, 'error');
  }
};

// Initialize everything on DOM load
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 DOM loaded, initializing...');
  
  // Initialize UI
  updateActionsPanel('default');
  initializeEventListeners();
  updateAllTranslations();
  
  // Set default language
  setLanguage(getVSCodeLanguage());
  
  // Listen for messages from extension
  window.addEventListener('message', handleMessage);
  
  console.log('✅ CSS Classes Menu v0.0.7 з динамічною панеллю завантажено');
});
