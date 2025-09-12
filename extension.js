// ✅ CSS Classes from HTML Extension v0.0.7 - FIXED WITH CONTEXT
// Автоматична генерація CSS класів з HTML файлів з реальною інтеграцією Figma
// Версія з виправленою проблемою передачі контексту HTML файлу

const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

// Runtime require trace (for packaging optimization)
const Module = require('module');
const __originalLoad = Module._load;
const __originalResolve = Module._resolveFilename;

// Files and packages used from node_modules during runtime
const __requiredModuleFiles = new Set();
const __requiredPackages = new Map(); // pkgName -> count

function __getPackageNameFromPath(resolvedPath) {
  try {
    const ix = resolvedPath.lastIndexOf('node_modules/');
    if (ix === -1) return null;
    const tail = resolvedPath.slice(ix + 'node_modules/'.length);
    if (tail.startsWith('@')) {
      const [scope, name] = tail.split('/');
      return scope && name ? `${scope}/${name}` : tail.split('/')[0] || null;
    }
    return tail.split('/')[0] || null;
  } catch (_) {
    return null;
  }
}

function __trackResolved(resolvedPath) {
  try {
    if (!resolvedPath || resolvedPath.indexOf('node_modules') === -1) return;
    __requiredModuleFiles.add(resolvedPath);
    const pkg = __getPackageNameFromPath(resolvedPath);
    if (pkg) __requiredPackages.set(pkg, (__requiredPackages.get(pkg) || 0) + 1);
  } catch (_) {
    // Ігноруємо помилки
  }
}

Module._load = function (request, parent, isMain) {
  try {
    const resolved = __originalResolve.call(this, request, parent, isMain);
    __trackResolved(resolved);
  } catch (_) {
    // ignore resolve errors, still attempt load
  }
  return __originalLoad.apply(this, arguments);
};

function __persistRequiredModulesSnapshot(note = 'snapshot') {
  try {
    const baseDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, {recursive: true});
    const file = path.join(baseDir, 'required-modules.json');
    const list = Array.from(__requiredModuleFiles);
    const packages = {};
    for (const [k, v] of __requiredPackages.entries()) packages[k] = v;
    const payload = {
      timestamp: new Date().toISOString(),
      note,
      filesCount: list.length,
      packagesCount: Object.keys(packages).length,
      files: list,
      packages
    };
    fs.writeFileSync(file, JSON.stringify(payload, null, 2), 'utf8');
  } catch (_) {
    // Ігноруємо помилки
  }
}

setTimeout(() => __persistRequiredModulesSnapshot('T+1s after bootstrap'), 1000);
process.on('exit', () => __persistRequiredModulesSnapshot('on process exit'));
process.on('beforeExit', () => __persistRequiredModulesSnapshot('on beforeExit'));

// ✅ FIX: Імпорт UniversalMatchingEngine для точного співставлення
const UniversalMatchingEngine = require('./backend/matchers/UniversalMatchingEngine');

// ✅ FIX: Імпорт нових розширених модулів
const AdvancedHTMLParser = require('./backend/core/AdvancedHTMLParser');
const AdvancedCSSGenerator = require('./backend/generators/AdvancedCSSGenerator');
const EnhancedCSSGenerator = require('./backend/generators/EnhancedCSSGenerator');
const ResponsiveEnhancer = require('./backend/generators/ResponsiveEnhancer');
const AdvancedMatchingEngine = require('./backend/matchers/AdvancedMatchingEngine');

// ✅ FIX: Інтернаціоналізація для extension.js
const extensionTranslations = {
  uk: {
    extensionStarting: 'Розширення запускається...',
    loadingBackendModules: 'Завантаження backend модулів...',
    integrationEngineInitialized:
      'Integration Engine ініціалізовано - повна інтеграція Figma доступна',
    integrationEngineInitFailed: 'Ініціалізація Integration Engine не вдалася',
    backendModulesPartial: 'Backend-модулі завантажені не повністю — робота в базовому режимі',
    moduleLoadingDetails: 'Деталі завантаження модулів:',
    registeredCommands: 'Команди зареєстровано успішно',
    extensionFullyActivated: 'Розширення повністю активовано!',
    cssGeneratedSuccessfully: 'CSS згенеровано успішно!',
    cssGenerationCompleted: 'Генерація CSS завершена успішно',
    cssGenerationError: 'Помилка при генерації CSS',
    modernNormalizeAdded: 'Modern Normalize додано в HTML',
    modernNormalizeExists: 'Modern Normalize вже існує в HTML',
    modernNormalizeError: 'Помилка додавання Modern Normalize',
    canvasLoadedSuccessfully: 'Canvas завантажено успішно',
    canvasLoadError: 'Помилка завантаження Canvas',
    layersLoadedSuccessfully: 'Layers завантажено успішно',
    layersLoadError: 'Помилка завантаження Layers',
    layerRenameSuccess: 'Layer перейменовано успішно',
    layerRenameError: 'Помилка перейменування layer',
    settingsLoadedSuccessfully: 'Налаштування завантажено успішно',
    settingsLoadError: 'Помилка завантаження налаштувань',
    settingsSavedSuccessfully: 'Налаштування збережено успішно',
    settingsSaveError: 'Помилка збереження налаштувань',
    operationCancelledByUser: 'Операцію скасовано користувачем',
    // VS Code панель повідомлень
    extensionActivationError: 'Не вдалося активувати CSS Classes from HTML',
    welcome: 'CSS Classes from HTML активовано успішно!',
    figmaIntegrationReady: 'Figma інтеграція готова',
    basicModeEnabled: 'Увімкнено базовий режим',
    htmlFileRequired: 'Спочатку оберіть HTML файл',
    selectFileFirst: 'Оберіть HTML файл для генерації CSS',
    htmlFileSelected: 'HTML файл вибрано',
    noActiveHtmlFile: 'Не знайдено активний HTML файл',
    htmlFileEmpty: 'HTML файл порожній',
    cssGeneratedFor: 'CSS згенеровано для',
    selectFile: 'Вибрати файл',
    cancel: 'Скасувати'
  },
  en: {
    extensionStarting: 'Extension starting...',
    loadingBackendModules: 'Loading backend modules...',
    integrationEngineInitialized:
      'Integration Engine initialized - Full Figma integration available',
    integrationEngineInitFailed: 'Integration Engine initialization failed',
    backendModulesPartial: 'Backend modules loaded partially — working in basic mode',
    moduleLoadingDetails: 'Module loading details:',
    registeredCommands: 'Commands registered successfully',
    extensionFullyActivated: 'Extension fully activated!',
    cssGeneratedSuccessfully: 'CSS generated successfully!',
    cssGenerationCompleted: 'CSS generation completed successfully',
    cssGenerationError: 'Error in CSS generation',
    modernNormalizeAdded: 'Modern Normalize added to HTML',
    modernNormalizeExists: 'Modern Normalize already exists in HTML',
    modernNormalizeError: 'Error adding Modern Normalize',
    canvasLoadedSuccessfully: 'Canvas loaded successfully',
    canvasLoadError: 'Error getting Canvas',
    layersLoadedSuccessfully: 'Layers loaded successfully',
    layersLoadError: 'Error getting Layers',
    layerStylesError: 'Error getting Layer styles',
    imagesImportError: 'Error importing images',
    fontsImportError: 'Error importing fonts',
    layerRenameSuccess: 'Layer renamed successfully',
    layerRenameError: 'Error renaming layer',
    settingsLoadedSuccessfully: 'Settings loaded successfully',
    settingsLoadError: 'Error loading settings',
    settingsSavedSuccessfully: 'Settings saved successfully',
    settingsSaveError: 'Error saving settings',
    operationCancelledByUser: 'Operation cancelled by user',
    // VS Code notification panel
    extensionActivationError: 'Failed to activate CSS Classes from HTML',
    welcome: 'CSS Classes from HTML activated successfully!',
    figmaIntegrationReady: 'Figma integration ready',
    basicModeEnabled: 'Basic mode enabled',
    htmlFileRequired: 'Please select an HTML file first',
    selectFileFirst: 'Select HTML file to generate CSS',
    htmlFileSelected: 'HTML file selected',
    noActiveHtmlFile: 'No active HTML file found',
    htmlFileEmpty: 'HTML file is empty',
    cssGeneratedFor: 'CSS generated for',
    selectFile: 'Select file',
    cancel: 'Cancel'
  },
  de: {
    extensionStarting: 'Erweiterung startet...',
    loadingBackendModules: 'Backend-Module laden...',
    integrationEngineInitialized:
      'Integration Engine initialisiert - Vollständige Figma-Integration verfügbar',
    integrationEngineInitFailed: 'Integration Engine-Initialisierung fehlgeschlagen',
    backendModulesPartial: 'Backend-Module teilweise geladen — arbeitet im Basismodus',
    moduleLoadingDetails: 'Modullade-Details:',
    registeredCommands: 'Befehle erfolgreich registriert',
    extensionFullyActivated: 'Erweiterung vollständig aktiviert!',
    cssGeneratedSuccessfully: 'CSS erfolgreich generiert!',
    cssGenerationCompleted: 'CSS-Generierung erfolgreich abgeschlossen',
    cssGenerationError: 'Fehler bei der CSS-Generierung',
    modernNormalizeAdded: 'Modern Normalize zu HTML hinzugefügt',
    modernNormalizeExists: 'Modern Normalize existiert bereits in HTML',
    modernNormalizeError: 'Fehler beim Hinzufügen von Modern Normalize',
    canvasLoadedSuccessfully: 'Canvas erfolgreich geladen',
    canvasLoadError: 'Fehler beim Laden des Canvas',
    layersLoadedSuccessfully: 'Ebenen erfolgreich geladen',
    layersLoadError: 'Fehler beim Laden der Ebenen',
    layerStylesError: 'Fehler beim Abrufen der Ebenen-Stile',
    imagesImportError: 'Fehler beim Importieren von Bildern',
    fontsImportError: 'Fehler beim Importieren von Schriftarten',
    layerRenameSuccess: 'Ebene erfolgreich umbenannt',
    layerRenameError: 'Fehler beim Umbenennen der Ebene',
    settingsLoadedSuccessfully: 'Einstellungen erfolgreich geladen',
    settingsLoadError: 'Fehler beim Laden der Einstellungen',
    settingsSavedSuccessfully: 'Einstellungen erfolgreich gespeichert',
    settingsSaveError: 'Fehler beim Speichern der Einstellungen',
    operationCancelledByUser: 'Vorgang vom Benutzer abgebrochen',
    // VS Code Benachrichtigungspanel
    extensionActivationError: 'Fehler beim Aktivieren von CSS Classes from HTML',
    welcome: 'CSS Classes from HTML erfolgreich aktiviert!',
    figmaIntegrationReady: 'Figma-Integration bereit',
    basicModeEnabled: 'Basismodus aktiviert',
    htmlFileRequired: 'Bitte wählen Sie zuerst eine HTML-Datei aus',
    selectFileFirst: 'Wählen Sie eine HTML-Datei aus, um CSS zu generieren',
    htmlFileSelected: 'HTML-Datei ausgewählt',
    noActiveHtmlFile: 'Keine aktive HTML-Datei gefunden',
    htmlFileEmpty: 'HTML-Datei ist leer',
    cssGeneratedFor: 'CSS generiert für',
    selectFile: 'Datei auswählen',
    cancel: 'Abbrechen'
  }
};

function persistRequiredModules(context, extra = {}) {
  try {
    // Persist inside the installed extension directory
    const extLogsDir = path.join(context.extensionPath, 'logs');
    if (!fs.existsSync(extLogsDir)) fs.mkdirSync(extLogsDir, {recursive: true});
    const extFile = path.join(extLogsDir, 'required-modules.json');

    const files = Array.from(__requiredModuleFiles || []);
    const packages = {};
    for (const [k, v] of (__requiredPackages || new Map()).entries()) packages[k] = v;

    const payload = {
      timestamp: new Date().toISOString(),
      note: extra.note || 'persistRequiredModules() call',
      filesCount: files.length,
      packagesCount: Object.keys(packages).length,
      files,
      packages
    };
    fs.writeFileSync(extFile, JSON.stringify(payload, null, 2), 'utf8');

    // Also mirror into workspace logs for convenience (if a workspace is open)
    try {
      const wsRoot = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
      if (wsRoot) {
        const wsLogsDir = path.join(wsRoot, 'logs');
        if (!fs.existsSync(wsLogsDir)) fs.mkdirSync(wsLogsDir, {recursive: true});
        const wsFile = path.join(wsLogsDir, 'required-modules.json');
        fs.writeFileSync(wsFile, JSON.stringify(payload, null, 2), 'utf8');
      }
    } catch (_) {
    // Ігноруємо помилки
    }
  } catch (_) {
    // Ігноруємо помилки
  }
}

// Функція для отримання поточної мови VS Code
function getVSCodeLanguage() {
  try {
    if (!vscode || !vscode.env || !vscode.env.language) {
      console.log('🌍 VS Code env not available, defaulting to Ukrainian');
      return 'uk';
    }

    const lang = vscode.env.language;
    console.log('🌍 VS Code language detected:', lang);

    if (lang.startsWith('uk') || lang.startsWith('ukrainian')) return 'uk';
    if (lang.startsWith('en') || lang.startsWith('english')) return 'en';
    if (lang.startsWith('de') || lang.startsWith('german')) return 'de';

    console.log('🌍 Defaulting to Ukrainian language (no match found or preference)');
    return 'uk';
  } catch (error) {
    console.log('🌍 Error getting VS Code language, defaulting to Ukrainian:', error.message);
    return 'uk';
  }
}

// Функція для отримання перекладу в extension.js
function getExtensionTranslation(key, lang = null) {
  if (!lang) {
    lang = getVSCodeLanguage();
  }
  const langTranslations = extensionTranslations[lang];
  const fallbackTranslations = extensionTranslations.uk;
  return langTranslations?.[key] || fallbackTranslations?.[key] || key;
}

// =======================================
// 🔧 СИСТЕМА ЗАВАНТАЖЕННЯ МОДУЛІВ
// =======================================

class ModuleLoader {
  constructor() {
    this.loadedModules = {};
    this.loadingErrors = [];
    this.outputChannel = null;
  }

  setOutputChannel(channel) {
    this.outputChannel = channel;
    this.log('Module loader initialized');
  }

  log(message) {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;

    console.log(logMessage);
    if (this.outputChannel) {
      this.outputChannel.appendLine(logMessage);
    }
  }

  safeRequire(modulePath, moduleName) {
    try {
      const fullPath = path.resolve(__dirname, modulePath);
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Файл модуля не знайдено: ${fullPath}`);
      }

      const module = require(modulePath);

      if (typeof module !== 'function' && typeof module !== 'object') {
        throw new Error(`Некоректний тип експорту модуля: ${typeof module}`);
      }

      this.loadedModules[moduleName] = module;
      this.log(`✅ ${moduleName} loaded successfully from ${modulePath}`);
      return module;
    } catch (error) {
      const errorMsg = `❌ Не вдалося завантажити ${moduleName}: ${error.message}`;
      this.log(errorMsg);
      this.loadingErrors.push({
        moduleName,
        modulePath,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return null;
    }
  }

  loadAllBackendModules() {
    this.log('🚀 Begin loading Backet-modules...');

    const modules = {
      FigmaAPIClient: './backend/core/FigmaAPIClient.js',
      HTMLParser: './backend/core/HTMLParser.js',
      IntegrationEngine: './backend/core/IntegrationEngine.js',
      SmartCSSGenerator: './backend/generators/SmartCSSGenerator.js',
      ImageImporter: './backend/utils/ImageImporter.js',
      FontImporter: './backend/utils/FontImporter.js'
    };

    let successCount = 0;
    let totalCount = Object.keys(modules).length;

    for (const [name, path] of Object.entries(modules)) {
      if (this.safeRequire(path, name)) {
        successCount++;
      }
    }

    const isSuccess = successCount === totalCount;
    this.log(`📊 Summary of loading modules: ${successCount}/${totalCount}`);

    if (isSuccess) {
      this.log('✅ All backend modules loaded successfully - Full integration available!');
    } else {
      this.log('⚠️ Some backend modules missing - Working in basic mode');
      this.log('📋 Loading errors:');
      this.loadingErrors.forEach(error => {
        this.log(`   • ${error.moduleName}: ${error.error}`);
      });
    }

    return {
      success: isSuccess,
      loadedCount: successCount,
      totalCount: totalCount,
      modules: this.loadedModules,
      errors: this.loadingErrors
    };
  }

  getModule(name) {
    return this.loadedModules[name] || null;
  }

  allModulesLoaded() {
    const requiredModules = ['FigmaAPIClient', 'IntegrationEngine', 'HTMLParser'];
    return requiredModules.every(name => this.loadedModules[name]);
  }

  getLoadingStats() {
    return {
      loadedModules: Object.keys(this.loadedModules),
      loadingErrors: this.loadingErrors,
      allLoaded: this.allModulesLoaded()
    };
  }
}

// Глобальний екземпляр завантажувача модулів
const moduleLoader = new ModuleLoader();

// =======================================
// 🌍 ГЛОБАЛЬНІ ЗМІННІ
// =======================================

let panel = null;
let outputChannel = null;
let integrationEngine = null;
// ✅ FIX: Глобальна змінна для UniversalMatchingEngine
let universalMatchingEngine = null;
let extensionContext = null; // 📦 Зберігаємо контекст для доступу до globalStorage
let currentHTMLFile = null; // ✅ FIX: Додано змінну для збереження контексту HTML файлу - лінія 114 ✅
let logFilePath = null; // 📝 Шлях до файлу логів runtime

// 🛠️ ✅ FIX: Простий логер у файл + OutputChannel (для діагностики Canvas/Layers)
function logDebug(message, data = null) {
  try {
    const ts = new Date().toISOString();
    const suffix = data ? ` | ${safeSerialize(data)}` : '';
    const line = `[${ts}] ${message}${suffix}`;
    outputChannel?.appendLine(line);
    if (logFilePath) {
      try {
        fs.appendFileSync(logFilePath, line + '\n', 'utf8');
      } catch (_e) {
        // Ігноруємо помилки запису в лог файл
      }
    }
  } catch (_e) {
    // Ігноруємо помилки загального логування
  }
}

function safeSerialize(obj) {
  try {
    return JSON.stringify(obj, (k, v) =>
      typeof v === 'string' && v.length > 500 ? v.slice(0, 500) + '…' : v
    );
  } catch {
    return '[unserializable]';
  }
}

// Генератор nonce для CSP у webview
function getNonce() {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// =======================================
// ⚙️ МЕНЕДЖЕР КОНФІГУРАЦІЇ
// =======================================

const configManager = {
  configPath: null,

  initialize(extensionPath, storagePath) {
    // 🛠️ ✅ FIX: Використовуємо persistent-сховище VS Code (globalStorage) для збереження налаштувань
    const baseDir = storagePath || extensionPath;
    const configDir = path.join(baseDir, 'css-classes-config');
    this.configPath = path.join(configDir, 'last-settings.json');

    try {
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, {recursive: true});
      }
    } catch (error) {
      console.error('❌ Помилка створення теки конфігурації:', error.message);
    }
    try {
      outputChannel?.appendLine(`🗂️ Settings storage directory: ${configDir}`);
    } catch (e) {
      // Ігноруємо помилки
    }
  },

  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('❌ Помилка завантаження конфігурації:', error.message);
    }
    return this.getDefaultConfig();
  },

  saveConfig(config) {
    try {
      const configDir = path.dirname(this.configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, {recursive: true});
      }
      const dataToSave = {
        ...config,
        timestamp: new Date().toISOString(),
        version: '2.1.0',
        lastHTMLFile: currentHTMLFile // ✅ FIX: Зберігаємо останній HTML файл - лінія 161 ✅
      };
      fs.writeFileSync(this.configPath, JSON.stringify(dataToSave, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error('❌ Помилка збереження конфігурації:', error.message);
      return false;
    }
  },

  getDefaultConfig() {
    return {
      mode: 'minimal',
      figmaLink: '',
      figmaToken: '',
      selectedCanvases: [],
      selectedLayers: [],
      includeModernNormalize: false,
      selectedStyleLibrary: null,
      sidebarVisible: false,
      savedAt: new Date().toISOString(),
      version: '2.1.0',
      lastHTMLFile: '' // ✅ FIX: Додано поле для збереження останнього HTML файлу - лінія 180 ✅
    };
  }
};

// =======================================
// 📁 МЕНЕДЖЕР КОРИСТУВАЦЬКИХ СТИЛІВ
// =======================================

const userStylesManager = {
  userStylesPath: null,

  initialize(extensionPath, storagePath) {
    const baseDir = storagePath || extensionPath;
    this.userStylesPath = path.join(baseDir, 'user-styles');
    
    // Створюємо теку для користувацьких стилів якщо її немає
    try {
      if (!fs.existsSync(this.userStylesPath)) {
        fs.mkdirSync(this.userStylesPath, { recursive: true });
        outputChannel?.appendLine(`📁 Створено теку користувацьких стилів: ${this.userStylesPath}`);
      }
    } catch (error) {
      outputChannel?.appendLine(`⚠️ Не вдалося створити теку користувацьких стилів: ${error.message}`);
    }
  },

  /**
   * ✅ FIX: Збереження CSS файлу з іменем макету + canvas
   */
  async saveUserStyle(fileName, cssContent, figmaInfo = {}) {
    try {
      if (!this.userStylesPath) {
        throw new Error('Тека користувацьких стилів не ініціалізована');
      }

      const filePath = path.join(this.userStylesPath, fileName);
      
      // Додаємо коментарі з метаінформацією
      const header = `/* 
 * Згенеровано з Figma: ${figmaInfo.fileName || 'Невідомий файл'} 
 * Canvas: ${figmaInfo.canvasName || 'Невідомий canvas'}
 * Дата створення: ${new Date().toLocaleString('uk-UA')}
 * Розширення: CSS Classes from HTML v0.0.7
 */\n\n`;
      
      const finalContent = header + cssContent;
      
      fs.writeFileSync(filePath, finalContent, 'utf8');
      outputChannel?.appendLine(`💾 Користувацький стиль збережено: ${fileName}`);
      
      return {
        success: true,
        filePath: filePath,
        fileName: fileName
      };
    } catch (error) {
      outputChannel?.appendLine(`❌ Помилка збереження користувацького стилю: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * ✅ FIX: Отримання списку користувацьких стилів
   */
  getUserStyles() {
    try {
      if (!this.userStylesPath || !fs.existsSync(this.userStylesPath)) {
        return [];
      }

      const files = fs.readdirSync(this.userStylesPath);
      const cssFiles = files
        .filter(file => file.endsWith('.css'))
        .map(file => {
          const filePath = path.join(this.userStylesPath, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            path: filePath,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
          };
        })
        .sort((a, b) => b.modified - a.modified); // Сортуємо за датою модифікації (новіші першими)

      return cssFiles;
    } catch (error) {
      outputChannel?.appendLine(`⚠️ Помилка читання користувацьких стилів: ${error.message}`);
      return [];
    }
  },

  /**
   * ✅ FIX: Видалення користувацького стилю
   */
  deleteUserStyle(fileName) {
    try {
      const filePath = path.join(this.userStylesPath, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        outputChannel?.appendLine(`🗑️ Користувацький стиль видалено: ${fileName}`);
        return { success: true };
      } else {
        return { success: false, error: 'Файл не знайдено' };
      }
    } catch (error) {
      outputChannel?.appendLine(`❌ Помилка видалення користувацького стилю: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
};

// =======================================
// 🚀 АКТИВАЦІЯ РОЗШИРЕННЯ
// =======================================

function activate(context) {
  console.log('🚀 CSS Classes from HTML v0.0.7 FIXED activating...');
  console.log('🔧 DEBUG: Context available:', !!context);
  console.log('🔧 DEBUG: vscode API available:', !!vscode);
  console.log('🔧 DEBUG: vscode.window available:', !!(vscode && vscode.window));
  extensionContext = context;

  try {
    // 1. Ініціалізація output channel
    console.log('🔧 DEBUG: Creating output channel...');
    outputChannel = vscode.window.createOutputChannel('CSS Classes from HTML');
    console.log('🔧 DEBUG: Output channel created:', !!outputChannel);

    // outputChannel.show(true); - може не працювати у всіх версіях VS Code
    if (outputChannel && typeof outputChannel.show === 'function') {
      console.log('🔧 DEBUG: Showing output channel...');
      outputChannel.show(true);
    } else {
      console.log('🔧 DEBUG: Output channel show method not available');
    }

    console.log('🔧 DEBUG: Getting extension translation...');
    const startingMessage = getExtensionTranslation('extensionStarting');
    console.log('🔧 DEBUG: Starting message:', startingMessage);

    outputChannel.appendLine(`🚀 ${startingMessage}`);

    // 🗂️ Ініціалізація файлового логування
    try {
      const logsDir = path.join(context.extensionPath, 'logs');
      if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, {recursive: true});
      logFilePath = path.join(logsDir, 'runtime.log');
      fs.appendFileSync(
        logFilePath,
        `\n===== Session start ${new Date().toLocaleString()} =====\n`,
        'utf8'
      );
      logDebug('📓 File logger initialized', {logFilePath});
    } catch (e) {
      outputChannel?.appendLine(`⚠️ Failed to init file logger: ${e.message}`);
    }

    // 2. Налаштування модульного завантажувача
    moduleLoader.setOutputChannel(outputChannel);

    // 3. Ініціалізація конфігурації (використовуємо globalStorage)
    const storagePath =
      context.globalStorageUri?.fsPath || context.storageUri?.fsPath || context.extensionPath;
    configManager.initialize(context.extensionPath, storagePath);

    // ✅ FIX: Ініціалізація менеджера користувацьких стилів
    userStylesManager.initialize(context.extensionPath, storagePath);

    // ✅ FIX: Завантаження останнього HTML файлу з конфігурації - лінія 206-209 ✅
    const savedConfig = configManager.loadConfig();
    if (savedConfig.lastHTMLFile) {
      currentHTMLFile = savedConfig.lastHTMLFile;
    }

    // 4. Завантаження backend модулів
    outputChannel.appendLine(`📦 ${getExtensionTranslation('loadingBackendModules')}`);
    const moduleResult = moduleLoader.loadAllBackendModules();

    // 5. Створення Integration Engine якщо модулі завантажено
    if (moduleResult.success) {
      try {
        const IntegrationEngine = moduleLoader.getModule('IntegrationEngine');
        if (IntegrationEngine) {
          integrationEngine = new IntegrationEngine({
            figmaToken: '',
            confidenceThreshold: 0.7,
            generateResponsive: true,
            mode: 'minimal'
          });
          outputChannel.appendLine(`✅ ${getExtensionTranslation('integrationEngineInitialized')}`);
        } else {
          throw new Error('Модуль IntegrationEngine відсутній');
        }
      } catch (error) {
        outputChannel.appendLine(
          `❌ ${getExtensionTranslation('integrationEngineInitFailed')}: ${error.message}`
        );
        integrationEngine = null;
      }
    } else {
      outputChannel.appendLine(`⚠️ ${getExtensionTranslation('backendModulesPartial')}`);
      outputChannel.appendLine(`📋 ${getExtensionTranslation('moduleLoadingDetails')}`);
      moduleResult.errors.forEach(error => {
        outputChannel.appendLine(`   • ${error.moduleName}: ${error.error}`);
      });
    }

    // ✅ FIX: Ініціалізація UniversalMatchingEngine для точного співставлення
    try {
      universalMatchingEngine = new UniversalMatchingEngine({
        thresholds: {
          high: 0.9, // 100% перенос властивостей
          medium: 0.7, // 80% перенос властивостей
          low: 0.5, // 50% перенос властивостей
          reject: 0.3 // Відхилення
        },
        weights: {
          text: 0.4, // Текстовий аналіз
          hierarchy: 0.3, // Ієрархічний аналіз
          semantic: 0.2, // Семантичний аналіз
          style: 0.1 // Стильовий аналіз
        }
      });
      outputChannel.appendLine(
        '✅ UniversalMatchingEngine ініціалізовано - точне співставлення доступне'
      );
    } catch (error) {
      outputChannel.appendLine(`❌ Помилка ініціалізації UniversalMatchingEngine: ${error.message}`);
    }

    // 6. Реєстрація команд
    const commands = registerAllCommands(context);
    outputChannel.appendLine(
      `✅ ${getExtensionTranslation('registeredCommands')}: ${commands.length}`
    );

    // 7. Додавання ресурсів до subscriptions
    context.subscriptions.push(...commands, outputChannel);

    // 8. Показ вітального повідомлення
    showWelcomeMessage(moduleResult);

    outputChannel.appendLine(`✅ ${getExtensionTranslation('extensionFullyActivated')}`);

    // після успішної ініціалізації
    try {
      persistRequiredModules(context, {note: 'Modules required during activate()'});
    } catch (_) {
    // Ігноруємо помилки
    }
    return {
      success: true,
      commandsCount: commands.length,
      version: '2.1.0',
      moduleStats: moduleResult
    };
  } catch (error) {
    const errorMessage = `💥 Критична помилка під час активації: ${error.message}`;
    console.error(errorMessage);
    console.error('Stack trace:', error.stack);

    if (outputChannel) {
      outputChannel.appendLine(errorMessage);
      outputChannel.appendLine(`Stack: ${error.stack}`);
    }

    vscode.window.showErrorMessage(
      `${getExtensionTranslation('extensionActivationError')}: ${error.message}`
    );
    throw error;
  }
}

// =======================================
// 📝 РЕЄСТРАЦІЯ КОМАНД
// =======================================

function registerAllCommands(context) {
  const commands = [];

  // ✅ FIX: Команда 1 - Головне меню з автоматичним визначенням контексту - лінія 281-288 ✅
  commands.push(
    vscode.commands.registerCommand('css-classes.showMenu', async () => {
      outputChannel?.appendLine('🎯 Command \'css-classes.showMenu\' executed');

      // Автоматично визначаємо активний HTML файл
      const activeEditor = vscode.window.activeTextEditor;
      if (activeEditor && activeEditor.document.languageId === 'html') {
        currentHTMLFile = activeEditor.document.uri.fsPath;
        outputChannel?.appendLine(`📄 Auto-detected HTML file: ${currentHTMLFile}`);
      }

      await openMainMenu(context);
    })
  );

  // ✅ FIX: Команда 2 - Меню з контексту файлу - лінія 293-299 ✅
  commands.push(
    vscode.commands.registerCommand('css-classes.showMenuFromContext', async uri => {
      outputChannel?.appendLine('🎯 Command \'css-classes.showMenuFromContext\' executed');

      if (uri && uri.fsPath) {
        currentHTMLFile = uri.fsPath;
        outputChannel?.appendLine(`📄 Context HTML file set: ${currentHTMLFile}`);
        configManager.saveConfig({...configManager.loadConfig(), lastHTMLFile: currentHTMLFile});
      }

      await openMainMenu(context);
    })
  );

  // ✅ FIX: Команда 3 - Швидка генерація з контекстом - лінія 304-315 ✅
  commands.push(
    vscode.commands.registerCommand('css-classes.quickGenerate', async uri => {
      outputChannel?.appendLine('🎯 Command \'css-classes.quickGenerate\' executed');

      if (uri && uri.fsPath) {
        currentHTMLFile = uri.fsPath;
      } else {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && activeEditor.document.languageId === 'html') {
          currentHTMLFile = activeEditor.document.uri.fsPath;
        }
      }

      await quickGenerateCSS();
    })
  );

  // ✅ FIX: Команда 4 - Вибір HTML файлу - лінія 320-340 ✅
  commands.push(
    vscode.commands.registerCommand('css-classes.selectHTMLFile', async () => {
      outputChannel?.appendLine('🎯 Command \'css-classes.selectHTMLFile\' executed');

      const options = {
        canSelectMany: false,
        openLabel: 'Вибрати HTML файл',
        filters: {
          'HTML files': ['html', 'htm'],
          'All files': ['*']
        }
      };

      const fileUri = await vscode.window.showOpenDialog(options);

      if (fileUri && fileUri[0]) {
        currentHTMLFile = fileUri[0].fsPath;
        outputChannel?.appendLine(`📄 Selected HTML file: ${currentHTMLFile}`);
        configManager.saveConfig({...configManager.loadConfig(), lastHTMLFile: currentHTMLFile});
        vscode.window.showInformationMessage(
          `${getExtensionTranslation('htmlFileSelected')}: ${path.basename(currentHTMLFile)}`
        );
        await openMainMenu(context);
      }
    })
  );

  // ✅ FIX: Команда 5 - Максимальна генерація CSS - лінія 380-410 ✅
  commands.push(
    vscode.commands.registerCommand('css-classes.generateMaximalCSS', async uri => {
      outputChannel?.appendLine('🎯 Command \'css-classes.generateMaximalCSS\' executed');

      if (uri && uri.fsPath) {
        currentHTMLFile = uri.fsPath;
      } else {
        // Якщо немає контексту, пропонуємо вибрати файл
        if (!currentHTMLFile) {
          const fileUri = await vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            filters: {
              'HTML files': ['html', 'htm']
            },
            title: '🇺🇦 Виберіть HTML файл для максимальної генерації CSS'
          });

          if (fileUri && fileUri[0]) {
            currentHTMLFile = fileUri[0].fsPath;
          } else {
            outputChannel?.appendLine('❌ Вибір HTML файлу скасовано');
            return;
          }
        }
      }

      outputChannel?.appendLine(`🚀 Запуск максимальної генерації CSS для: ${currentHTMLFile}`);
      await quickGenerateCSS(true); // true = максимальний режим
    })
  );

  return commands;
}

// =======================================
// 📋 ПОКАЗ ВІТАЛЬНОГО ПОВІДОМЛЕННЯ
// =======================================

async function showWelcomeMessage(moduleResult) {
  const statusText = moduleResult.success
    ? '✅ Повна інтеграція з Figma доступна!'
    : '⚠️ Базовий режим (деякі модулі не завантажено)';

  const message = `🚀 CSS Classes from HTML готовий!\n${statusText}`;

  const choice = await vscode.window.showInformationMessage(
    message,
    'Відкрити меню',
    'Швидка генерація',
    'Вибрати HTML файл'
  );

  switch (choice) {
  case 'Відкрити меню':
    vscode.commands.executeCommand('css-classes.showMenu');
    break;
  case 'Швидка генерація':
    vscode.commands.executeCommand('css-classes.quickGenerate');
    break;
  case 'Вибрати HTML файл':
    vscode.commands.executeCommand('css-classes.selectHTMLFile');
    break;
  }
}

// =======================================
// 🎨 WEBVIEW ІНТЕРФЕЙС
// =======================================

async function openMainMenu(context) {
  try {
    outputChannel?.appendLine('📋 Opening main menu...');

    // ✅ FIX: Перевірка наявності HTML файлу в контексті - лінія 392-398 ✅
    if (!currentHTMLFile) {
      const activeEditor = vscode.window.activeTextEditor;
      if (activeEditor && activeEditor.document.languageId === 'html') {
        currentHTMLFile = activeEditor.document.uri.fsPath;
      }
    }

    if (panel) {
      panel.reveal(vscode.ViewColumn.One);
      // ✅ FIX: Передача контексту в існуючу панель - лінія 402-406 ✅
      panel.webview.postMessage({
        command: 'updateHTMLContext',
        htmlFile: currentHTMLFile,
        fileName: currentHTMLFile ? path.basename(currentHTMLFile) : null
      });
      return;
    }

    panel = vscode.window.createWebviewPanel(
      'cssClassesMenu',
      'CSS Classes from HTML v0.0.7',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.file(context.extensionPath)]
      }
    );

    // ✅ FIX: Завантаження HTML з файлу якщо існує - лінія 423-441 ✅
    const htmlPath = path.join(context.extensionPath, 'frontend', 'css-classes-from-html-menu.html');

    if (fs.existsSync(htmlPath)) {
      let htmlContent = fs.readFileSync(htmlPath, 'utf8');

      const webview = panel.webview;
      const baseUri = webview.asWebviewUri(vscode.Uri.file(context.extensionPath));
      const nonce = getNonce();

      // Перетворення шляхів до локальних ресурсів
      htmlContent = htmlContent.replace(/href="([^"]*\.css)"/g, `href="${baseUri}/$1"`);
      htmlContent = htmlContent.replace(/src="([^"]*\.js)"/g, `src="${baseUri}/$1"`);

      // Додаємо більш дозвільну CSP політику для webview
      const cspMeta = `\n<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https: data:; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource} 'unsafe-inline' 'unsafe-eval'; font-src ${webview.cspSource} https: data:;">`;
      if (/<head[^>]*>/i.test(htmlContent)) {
        htmlContent = htmlContent.replace(/<head[^>]*>/i, match => `${match}${cspMeta}`);
      } else {
        htmlContent = cspMeta + htmlContent;
      }

      panel.webview.html = htmlContent;
    } else {
      // Якщо файл не знайдено, генеруємо HTML динамічно
      const generateWebViewHTML = function() {
        const htmlPath = path.join(__dirname, 'frontend', 'css-classes-from-html-menu.html');
        
        if (fs.existsSync(htmlPath)) {
          let html = fs.readFileSync(htmlPath, 'utf8');
          
          // Додаємо viewport detection та dynamic scaling
          const viewportScript = `
          <script>
            // Viewport detection and dynamic scaling for ultra-small screens
            function detectViewport() {
              const width = window.innerWidth;
              const height = window.innerHeight;
              const body = document.body;
              
              // Remove existing viewport classes
              body.classList.remove('viewport-xs', 'viewport-sm', 'viewport-md', 'viewport-lg');
              
              // Add appropriate viewport class
              if (width <= 280) {
                body.classList.add('viewport-xs');
                body.style.fontSize = '11px';
              } else if (width <= 320) {
                body.classList.add('viewport-sm');
                body.style.fontSize = '12px';
              } else if (width <= 480) {
                body.classList.add('viewport-md');
                body.style.fontSize = '13px';
              } else {
                body.classList.add('viewport-lg');
                body.style.fontSize = '14px';
              }
              
              // Dynamic content scaling for VSCode sidebar
              if (width < 300) {
                document.documentElement.style.setProperty('--dynamic-scale', '0.85');
              } else if (width < 400) {
                document.documentElement.style.setProperty('--dynamic-scale', '0.9');
              } else {
                document.documentElement.style.setProperty('--dynamic-scale', '1');
              }
            }
            
            // Initial detection
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', detectViewport);
            } else {
              detectViewport();
            }
            
            // Re-detect on resize
            window.addEventListener('resize', detectViewport);
            
            // VSCode webview specific optimizations
            if (window.acquireVsCodeApi) {
              const vscode = window.acquireVsCodeApi();
              
              // Notify extension about viewport changes
              window.addEventListener('resize', () => {
                vscode.postMessage({
                  command: 'viewportChanged',
                  width: window.innerWidth,
                  height: window.innerHeight
                });
              });
            }
          </script>
          `;
          
          // Insert script before closing body tag
          html = html.replace('</body>', viewportScript + '</body>');
          
          return html;
        }
      }
      panel.webview.html = generateWebViewHTML();
    }

    // Налаштування обробників
    setupMessageHandlers(panel);
    logDebug('🧩 Webview panel created and message handlers attached');

    // ✅ FIX: Передача початкового контексту - лінія 444-451 ✅
    setTimeout(() => {
      panel.webview.postMessage({
        command: 'initializeContext',
        htmlFile: currentHTMLFile,
        fileName: currentHTMLFile ? path.basename(currentHTMLFile) : null,
        config: configManager.loadConfig()
      });
    }, 100);

    panel.onDidDispose(() => {
      panel = null;
    });

    outputChannel?.appendLine('✅ Main menu opened successfully');
  } catch (error) {
    const errorMessage = `❌ Error opening menu: ${error.message}`;
    outputChannel?.appendLine(errorMessage);
    vscode.window.showErrorMessage(errorMessage);
  }
}

// =======================================
// 📨 ОБРОБКА ПОВІДОМЛЕНЬ WEBVIEW
// =======================================

function setupMessageHandlers(panel) {
  panel.webview.onDidReceiveMessage(async message => {
    try {
      outputChannel?.appendLine(`📨 Received message: ${message.command}`);
      logDebug('📥 Webview → Extension message', {
        command: message?.command,
        payloadKeys: Object.keys(message || {})
      });

      switch (message.command) {
      case 'getInitialContext':
        // Відповідь на запит початкового контексту від вебв'ю
        panel.webview.postMessage({
          command: 'initializeContext',
          htmlFile: currentHTMLFile,
          fileName: currentHTMLFile ? path.basename(currentHTMLFile) : null,
          config: configManager.loadConfig()
        });
        break;
        // ✅ FIX: Обробка запиту на вибір HTML файлу - лінія 478-496 ✅
      case 'selectHTMLFile': {
        const options = {
          canSelectMany: false,
          openLabel: 'Вибрати HTML файл',
          filters: {
            'HTML files': ['html', 'htm'],
            'All files': ['*']
          }
        };

        const fileUri = await vscode.window.showOpenDialog(options);

        if (fileUri && fileUri[0]) {
          currentHTMLFile = fileUri[0].fsPath;
          panel.webview.postMessage({
            command: 'htmlFileSelected',
            htmlFile: currentHTMLFile,
            fileName: path.basename(currentHTMLFile)
          });
        }
        break;
      }

      // ✅ FIX: Обробка запиту на оновлення HTML контексту
      case 'refreshHTMLContext': {
        // Перевіряємо поточний активний редактор
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && activeEditor.document.languageId === 'html') {
          currentHTMLFile = activeEditor.document.uri.fsPath;
        }

        // Відправляємо оновлений контекст назад у webview
        panel.webview.postMessage({
          command: 'updateHTMLContext',
          htmlFile: currentHTMLFile,
          fileName: currentHTMLFile ? path.basename(currentHTMLFile) : null
        });
        break;
      }

      // ✅ FIX: Генерація CSS з контекстом - лінія 499-501 ✅
      case 'generateCSS':
        outputChannel?.appendLine(`🎨 ${getExtensionTranslation('cssGenerationStarted')}`);
        await generateResponsiveCSSFromHTML(message.htmlFile, message.settings, panel);
        break;

      case 'quickGenerate':
        await quickGenerateCSS();
        break;

      case 'generateMaximalCSS':
        await quickGenerateCSS(true); // true = максимальний режим
        break;

      case 'getFigmaCanvases':
        await handleGetFigmaCanvases(panel, message);
        break;

      case 'getFigmaLayers':
        await handleGetFigmaLayers(panel, message);
        break;

      case 'searchFigmaLayers':
        await handleSearchFigmaLayers(panel, message);
        break;

      case 'getLayerStyles':
        await handleGetLayerStyles(panel, message);
        break;

      case 'importImages':
        await handleImportImages(panel, message);
        break;

      case 'importFonts':
        await handleImportFonts(panel, message);
        break;

      case 'setLayerAlias': {
        try {
          if (!integrationEngine) throw new Error('Integration engine не доступний');
          const {layerId, newName, oldName} = message;
          if (!layerId || !newName) throw new Error('Некоректні параметри для alias');

          // Зберігаємо alias в інтеграційному движку
          await integrationEngine.setLayerAlias(layerId, newName);
          outputChannel?.appendLine(`✏️ Alias set for ${layerId}: "${oldName}" -> "${newName}"`);

          // Повідомляємо фронтенд про успішне встановлення alias'а
          panel.webview.postMessage({
            command: 'aliasSet',
            success: true,
            layerId,
            newName,
            oldName
          });
        } catch (e) {
          outputChannel?.appendLine(`❌ Alias set failed: ${e.message}`);
          panel.webview.postMessage({command: 'aliasSet', success: false, error: e.message});
        }
        break;
      }

      case 'loadLastSettings':
        await handleLoadSettings(panel);
        break;

      case 'saveCurrentSettings': {
        await handleSaveSettings(panel, message.settings);
        break;
      }

      // 🧩 Збереження вибраної бібліотеки стилів у файл
      case 'saveStyleLibrary': {
        await handleSaveStyleLibrary(panel, message.payload);
        break;
      }

      // 🧩 Завантаження бібліотек стилів з диску
      case 'loadStyleLibraries': {
        await handleLoadStyleLibraries(panel, message.payload);
        break;
      }

      // 🧩 Встановити вибрану бібліотеку стилів у налаштуваннях
      case 'selectStyleLibrary': {
        await handleSelectStyleLibrary(panel, message.payload);
        break;
      }

      // 🧩 Вибрати файл бібліотеки стилів
      case 'chooseStyleLibrary': {
        await handleChooseStyleLibrary(panel);
        break;
      }

      // 🎨 Завантаження списку файлів стилів
      case 'loadStyleFiles': {
        await handleLoadStyleFiles(panel, message.type);
        break;
      }

      // 🎨 Створення нового файлу стилів
      case 'createStyleFile': {
        await handleCreateStyleFile(panel, message);
        break;
      }

      // 🎨 Відкриття файлу стилів для редагування
      case 'openStyleFile': {
        await handleOpenStyleFile(panel, message.filePath);
        break;
      }

      // 👤 Користувацькі стилі
      case 'loadUserStyles': {
        await handleLoadUserStyles(panel);
        break;
      }

      case 'deleteUserStyle': {
        await handleDeleteUserStyle(panel, message.fileName);
        break;
      }

      case 'openUserStyle': {
        await handleOpenUserStyle(panel, message.fileName);
        break;
      }

      case 'saveUserStyle': {
        await handleSaveUserStyle(panel, message.fileName, message.content);
        break;
      }

      case 'renameLayer':
        await handleRenameLayer(panel, message);
        break;

        // 💾 Збереження CSS файлу після перейменування layer'а
      case 'saveStyleFile': {
        try {
          if (!currentHTMLFile) throw new Error('Немає активного HTML файлу');

          const {fileName, content, layerId, layerName} = message;
          if (!fileName || !content) throw new Error('Некоректні параметри для збереження');

          // Визначаємо шлях для збереження CSS файлу
          const htmlDir = path.dirname(currentHTMLFile);
          const cssFilePath = path.join(htmlDir, fileName);

          // Перевіряємо чи файл вже існує
          let finalContent = content;
          let fileAction = 'створено';

          if (fs.existsSync(cssFilePath)) {
            // Файл існує - додаємо стилі до існуючого контенту
            const existingContent = fs.readFileSync(cssFilePath, 'utf8');

            // Перевіряємо чи цей layer вже є в файлі
            const layerComment = `/* ${layerName} */`;
            if (existingContent.includes(layerComment)) {
              // Замінюємо існуючі стилі для цього layer'а
              const regex = new RegExp(
                `\\/\\* ${layerName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\*/[\\s\\S]*?(?=\\/\\*|$)`,
                'g'
              );
              finalContent = existingContent.replace(regex, content);
              fileAction = 'оновлено';
            } else {
              // Додаємо нові стилі до існуючого файлу
              finalContent = existingContent + '\n\n' + content;
              fileAction = 'розширено';
            }
          }

          // Зберігаємо CSS файл
          fs.writeFileSync(cssFilePath, finalContent, 'utf8');
          outputChannel?.appendLine(`💾 CSS файл ${fileAction}: ${fileName}`);

          // Відкриваємо збережений CSS файл
          const cssDocument = await vscode.workspace.openTextDocument(cssFilePath);
          await vscode.window.showTextDocument(cssDocument, vscode.ViewColumn.Beside);

          // Сповіщаємо фронтенд про успішне збереження
          panel.webview.postMessage({
            command: 'styleFileSaved',
            success: true,
            fileName: fileName,
            filePath: cssFilePath,
            layerId: layerId,
            layerName: layerName,
            message: `CSS файл ${fileAction} як ${fileName}`
          });
        } catch (error) {
          outputChannel?.appendLine(`❌ Помилка збереження CSS файлу: ${error.message}`);
          panel.webview.postMessage({
            command: 'styleFileSaved',
            success: false,
            error: error.message
          });
        }
        break;
      }

      case 'testMessage':
        outputChannel?.appendLine(`🧪 Test message received: ${JSON.stringify(message.data)}`);
        panel.webview.postMessage({
          command: 'testResponse',
          message: 'Test message processed successfully!'
        });
        break;

      case 'viewportChanged':
        // Handle viewport changes for dynamic optimization
        outputChannel?.appendLine(`📱 Viewport changed: ${message.width}x${message.height}`);
        break;

      default:
        outputChannel?.appendLine(`⚠️ Unknown command: ${message.command}`);
        logDebug('⚠️ Unknown webview command', {command: message?.command});
      }
    } catch (error) {
      outputChannel?.appendLine(`❌ Error handling message: ${error.message}`);
      logDebug('❌ Error handling webview message', {error: error?.message, stack: error?.stack});
      panel.webview.postMessage({
        command: 'error',
        message: error.message
      });
    }
  });
}

// =======================================
// 🚀 ГЕНЕРАЦІЯ CSS
// =======================================

async function handleGenerateCSS(panel, settings) {
  try {
    outputChannel?.appendLine('🚀 Starting CSS generation...');
    outputChannel?.appendLine(`🔧 Mode: ${settings?.mode || 'undefined'}`);
    outputChannel?.appendLine(`📄 HTML file from settings: ${settings?.htmlFile || 'undefined'}`);
    outputChannel?.appendLine(`📄 Current HTML file: ${currentHTMLFile || 'undefined'}`);

    // ✅ FIX: Використання контекстного HTML файлу - лінія 551-562 ✅
    let htmlContent = '';
    let htmlFilePath = '';

    if (currentHTMLFile && fs.existsSync(currentHTMLFile)) {
      htmlContent = fs.readFileSync(currentHTMLFile, 'utf8');
      htmlFilePath = currentHTMLFile;
      outputChannel?.appendLine(`✅ Using context HTML file: ${currentHTMLFile}`);
    } else {
      outputChannel?.appendLine('❌ No current HTML file found, checking active editor...');
      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor || activeEditor.document.languageId !== 'html') {
        outputChannel?.appendLine('❌ No active HTML editor found');
        throw new Error('Будь ласка, виберіть HTML файл або відкрийте його в редакторі');
      }
      htmlContent = activeEditor.document.getText();
      htmlFilePath = activeEditor.document.uri.fsPath;
      outputChannel?.appendLine(`✅ Using active editor HTML: ${htmlFilePath}`);
    }

    if (!htmlContent.trim()) {
      outputChannel?.appendLine('❌ HTML content is empty');
      throw new Error('HTML файл порожній');
    }

    outputChannel?.appendLine(`📊 HTML content length: ${htmlContent.length} characters`);

    let css = '';
    // ✅ NEW: Підтримка утилітних класів з бібліотеки стилів
    let customUtilityStyles = {};
    // Завантаження додаткових утилітних стилів з обраної бібліотеки
    try {
      customUtilityStyles = await loadSelectedStyleLibrary(settings || {});
      // if (lib && (lib.utilities || lib.styles || lib.classes)) {
      //   customUtilityStyles = lib.utilities || lib.styles || lib.classes || {};
      //   outputChannel?.appendLine(`✅ Loaded style library utilities: ${Object.keys(customUtilityStyles).length}`);
      // }
    } catch (e) {
      outputChannel?.appendLine(`⚠️ Failed to load style library: ${e.message}`);
    }

    // Генерація відповідно до режиму
    if (settings.mode === 'minimal') {
      outputChannel?.appendLine('🔧 Generating basic CSS...');
      css = generateBasicCSS(htmlContent, {...settings, customUtilityStyles});
    } else if (settings.mode === 'maximum' && integrationEngine) {
      if (settings.figmaLink && settings.figmaToken) {
        const fileId = integrationEngine.extractFileIdFromFigmaLink(settings.figmaLink);
        if (fileId) {
          outputChannel?.appendLine('🎯 Using AdvancedMatchingEngine for precise matching...');

          // ✅ FIX: Отримуємо дані з Figma
          integrationEngine.updateOptions({figmaToken: settings.figmaToken});

          if (!integrationEngine.figmaClient) {
            throw new Error('Figma client не ініціалізовано. Перевірте токен.');
          }

          let figmaData = await integrationEngine.figmaClient.getFile(fileId);

          // ✅ FIX: Використовуємо AdvancedHTMLParser для правильного парсингу HTML
          const htmlParser = new AdvancedHTMLParser();
          const htmlData = htmlParser.parseHTML(htmlContent);

          // ✅ FIX: Використовуємо AdvancedMatchingEngine для точного співставлення
          const advancedMatchingEngine = new AdvancedMatchingEngine({
            thresholds: {
              exact: 1.0,
              high: 0.9,
              medium: 0.7,
              low: 0.5,
              reject: 0.3
            },
            filters: {
              canvasIds: [],
              layerIds: []
            }
          });

          const matchingResults = await advancedMatchingEngine.match(figmaData, htmlData);

          outputChannel?.appendLine(
            `📊 Matching results: ${matchingResults.length} elements matched`
          );

          // ✅ FIX: Генеруємо CSS з точними співставленнями
          // ✅ NEW: Прокидуємо алиаси (перейменування) для пріоритету користувацьких назв
          if (settings.userRenames && typeof settings.userRenames === 'object') {
            try {
              Object.entries(settings.userRenames).forEach(([layerId, newName]) => {
                if (layerId && newName) {
                  integrationEngine.setLayerAlias(layerId, newName);
                }
              });
              outputChannel?.appendLine(
                `✏️ Applied ${Object.keys(settings.userRenames).length} user layer renames`
              );
            } catch (e) {
              outputChannel?.appendLine(`⚠️ Failed to apply user renames: ${e.message}`);
            }
          }

          // ✅ NEW: Використовуємо EnhancedCSSGenerator для повної підтримки вимог
          const cssGenerator = new EnhancedCSSGenerator({
            // Налаштування з VS Code
            includeReset: settings.includeReset === true || settings.resetStylesToggle === true,
            includeVariables: settings.includeVariables === true || settings.cssVariablesToggle === true,
            includeGlobalStyles: settings.globalStylesToggle === true,
            includeModernNormalize: settings.includeModernNormalize === true,
            generateResponsive: settings.includeResponsive === true,
            
            // Користувацькі стилі
            customStyles: customUtilityStyles,
            userStylesPath: userStylesManager?.userStylesPath,
            
            // Режим та алиаси
            mode: settings.mode,
            layerAliases: integrationEngine?.getAllAliases ? integrationEngine.getAllAliases() : {}
          });

          css = await cssGenerator.generateCSS(figmaData, htmlData, matchingResults);

          // Додаємо статистику
          const stats = cssGenerator.statistics;
          outputChannel?.appendLine('📈 CSS Generation Stats:');
          outputChannel?.appendLine(`   • Matched elements: ${stats.matchedElements}`);
          outputChannel?.appendLine(`   • Unmatched elements: ${stats.unmatchedElements}`);
          outputChannel?.appendLine(`   • Total rules: ${stats.totalRules}`);
        } else {
          css = generateBasicCSS(htmlContent, {...settings, customUtilityStyles});
        }
      } else {
        css = generateBasicCSS(htmlContent, {...settings, customUtilityStyles});
      }
    } else if (settings.mode === 'production') {
      css = generateProductionCSS(htmlContent);
    } else {
      css = generateBasicCSS(htmlContent, {...settings, customUtilityStyles});
    }

    // Якщо користувач обрав modern-normalize — оновлюємо HTML head
    if (settings.includeModernNormalize === true) {
      try {
        await ensureModernNormalizeInHtml(htmlFilePath);
        outputChannel?.appendLine('✅ modern-normalize підключено/оновлено у HTML');
      } catch (e) {
        outputChannel?.appendLine(`⚠️ Не вдалося оновити modern-normalize: ${e.message}`);
      }
    }

    // ✅ FIX: Збереження CSS файлу в користувацьку теку з правильним іменем
    let userStyleSaved = false;
    if (settings.mode === 'maximum' && settings.figmaLink && settings.figmaToken && integrationEngine) {
      try {
        const fileId = integrationEngine.extractFileIdFromFigmaLink(settings.figmaLink);
        if (fileId && integrationEngine.figmaClient) {
          // Отримуємо ім'я Canvas з вибраних користувачем
          const selectedCanvasIds = Array.isArray(settings.selectedCanvases) ? settings.selectedCanvases : [];
          let canvasName = 'Canvas';
          
          if (selectedCanvasIds.length > 0) {
            try {
              const figmaData = await integrationEngine.figmaClient.getFile(fileId);
              const canvas = figmaData?.document?.children?.find(child => 
                selectedCanvasIds.includes(child.id)
              );
              if (canvas) {
                canvasName = canvas.name || 'Canvas';
              }
            } catch (e) {
              outputChannel?.appendLine(`⚠️ Не вдалося отримати ім'я canvas: ${e.message}`);
            }
          }
          
          // Отримуємо правильне ім'я файлу
          const fileNameInfo = await integrationEngine.figmaClient.getFileNameAndCanvas(fileId, canvasName);
          
          // Зберігаємо в користувацьку теку
          const saveResult = await userStylesManager.saveUserStyle(
            fileNameInfo.fullFileName,
            css,
            {
              fileName: fileNameInfo.fileName,
              canvasName: fileNameInfo.canvasName,
              figmaLink: settings.figmaLink,
              mode: settings.mode
            }
          );
          
          if (saveResult.success) {
            userStyleSaved = true;
            outputChannel?.appendLine(`💾 CSS збережено як користувацький стиль: ${fileNameInfo.fullFileName}`);
          }
        }
      } catch (error) {
        outputChannel?.appendLine(`⚠️ Помилка збереження користувацького стилю: ${error.message}`);
      }
    }

    // Звичайне збереження CSS файлу поруч з HTML
    await saveGeneratedCSS(css, htmlFilePath, settings);

    panel.webview.postMessage({
      command: 'generationComplete',
      success: true,
      css: css,
      userStyleSaved: userStyleSaved,
      message: getExtensionTranslation('cssGeneratedSuccessfully')
    });

    outputChannel?.appendLine(`✅ ${getExtensionTranslation('cssGenerationCompleted')}`);
  } catch (error) {
    outputChannel?.appendLine(
      `❌ ${getExtensionTranslation('cssGenerationError')}: ${error.message}`
    );
    panel.webview.postMessage({
      command: 'generationComplete',
      success: false,
      error: error.message
    });
  }
}

async function quickGenerateCSS(isMaximal = false) {
  try {
    const mode = isMaximal ? '🚀 Maximal' : '⚡ Quick';
    outputChannel?.appendLine(`${mode} CSS generation started...`);

    // ✅ FIX: Використання контекстного HTML файлу для швидкої генерації - лінія 622-638 ✅
    let htmlContent = '';
    let htmlFilePath = '';

    if (currentHTMLFile && fs.existsSync(currentHTMLFile)) {
      htmlContent = fs.readFileSync(currentHTMLFile, 'utf8');
      htmlFilePath = currentHTMLFile;
      outputChannel?.appendLine(`📄 Using context HTML file: ${currentHTMLFile}`);
    } else {
      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor || activeEditor.document.languageId !== 'html') {
        // Пропонуємо вибрати файл
        const choice = await vscode.window.showInformationMessage(
          getExtensionTranslation('noActiveHtmlFile'),
          'Вибрати файл',
          'Скасувати'
        );

        if (choice === 'Вибрати файл') {
          await vscode.commands.executeCommand('css-classes.selectHTMLFile');
          return;
        } else {
          return;
        }
      }
      htmlContent = activeEditor.document.getText();
      htmlFilePath = activeEditor.document.uri.fsPath;
    }

    if (!htmlContent.trim()) {
      vscode.window.showErrorMessage(getExtensionTranslation('htmlFileEmpty'));
      return;
    }

    const css = generateBasicCSS(htmlContent, {});
    await saveGeneratedCSS(css, htmlFilePath, null);

    vscode.window.showInformationMessage(
      `✅ ${getExtensionTranslation('cssGeneratedFor')}: ${path.basename(htmlFilePath)}`
    );
    outputChannel?.appendLine('✅ Quick CSS generation completed');
  } catch (error) {
    const errorMessage = `❌ Quick generation failed: ${error.message}`;
    outputChannel?.appendLine(errorMessage);
    vscode.window.showErrorMessage(errorMessage);
  }
}

// =======================================
// 🎨 ГЕНЕРАЦІЯ РІЗНИХ ТИПІВ CSS
// =======================================

function generateBasicCSS(htmlContent, settings = {}) {
  let css = `/* ✅ CSS Generated by CSS Classes from HTML v0.0.7 */
/* Generated: ${new Date().toLocaleString()} */
/* Source: ${currentHTMLFile ? path.basename(currentHTMLFile) : 'Unknown'} */

`;

  // ✅ FIX: Додавання Reset стилів тільки якщо включено - лінія 1047-1065 ✅
  if (settings.includeReset === true) {
    css += `/* ============================================
   RESET STYLES
   ============================================ */
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #fff;
}

`;
  }

  // ✅ FIX: Додавання CSS змінних тільки якщо включено - лінія 1068-1106 ✅
  if (settings.includeVariables === true) {
    css += `/* ============================================
   CSS VARIABLES
   ============================================ */
:root {
  /* Colors */
  --primary-color: #007ACC;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #17a2b8;
  --light-color: #f8f9fa;
  --dark-color: #343a40;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-xxl: 3rem;
  
  /* Typography */
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-xxl: 1.5rem;
  
  /* Borders */
  --border-radius: 0.25rem;
  --border-width: 1px;
  --border-color: #dee2e6;
}

`;
  }

  // Генерація селекторів за HTML-ієрархією
  const hierarchical = extractSelectorsWithHierarchy(htmlContent);

  if (hierarchical.length > 0) {
    css += `/* ============================================
   GENERATED SELECTORS (HTML hierarchy order)
   ============================================ */
`;
    hierarchical.forEach(item => {
      css += `/* path: ${item.path} */\n${item.selector} {\n\n}\n\n`;
    });
  } else {
    // ✅ FIX: Видалено fallback - використовуємо тільки реальні стилі з Figma
    const classes = extractClassesFromHTML(htmlContent);
    if (classes.length > 0) {
      css += `/* ============================================
   GENERATED CLASSES
   ============================================ */
`;
      classes.forEach(className => {
        css += `.${className} {\n\n}\n\n`;
      });
    }
  }

  // ✅ FIX: Додавання Responsive стилів тільки якщо включено - лінія 1133-1136 ✅
  if (settings.includeResponsive === true) {
    css += generateResponsiveStyles();
  }

  // ✅ FIX: Додавання користувацьких стилів з теки користувача якщо включено
  if (settings.includeUserStyles === true && userStylesManager) {
    try {
      const userStyles = userStylesManager.getAllUserStyles();
      if (userStyles && userStyles.length > 0) {
        css += `/* ============================================
   USER STYLES (від користувача)
   ============================================ */
`;
        userStyles.forEach(styleFile => {
          if (styleFile.content && styleFile.content.trim()) {
            css += `/* Користувацькі стилі з файлу: ${styleFile.fileName} */\n`;
            css += styleFile.content;
            css += '\n\n';
          }
        });
        outputChannel?.appendLine(`✅ Включено користувацькі стилі: ${userStyles.length} файлів`);
      }
    } catch (error) {
      outputChannel?.appendLine(`⚠️ Помилка завантаження користувацьких стилів: ${error.message}`);
    }
  }

  return css;
}

function generateProductionCSS(htmlContent) {
  let css = `/* ✅ PRODUCTION CSS - Minified and Optimized */
/* Generated: ${new Date().toISOString()} */

`;

  // Мінімізований reset
  css += '*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}';
  css += 'body{font-family:system-ui,-apple-system,sans-serif;line-height:1.5}';
  css += 'img,video{max-width:100%;height:auto}';
  css += 'button{cursor:pointer;border:none;background:transparent}';
  css += 'a{text-decoration:none;color:inherit}';
  css += '\n\n';

  // CSS змінні для production
  css += ':root{';
  css += '--p:#007ACC;--s:#6c757d;--success:#28a745;--danger:#dc3545;';
  css += '--spacing:1rem;--radius:0.25rem;';
  css += '}\n\n';

  // Генерація класів
  const classes = extractClassesFromHTML(htmlContent);
  classes.forEach(className => {
    css += `.${className}{}\n`;
  });

  return css;
}

function generateResponsiveStyles() {
  return `
/* ============================================
   RESPONSIVE STYLES
   ============================================ */
   
/* Mobile First Approach */

/* Small devices (landscape phones, 576px and up) */
@media (min-width: 576px) {
  .container {
    max-width: 540px;
  }
}

/* Medium devices (tablets, 768px and up) */
@media (min-width: 768px) {
  .container { max-width: 720px; }
  .hidden-tablet { display: none !important; }
}

/* Large devices (desktops, 992px and up) */
@media (min-width: 992px) {
  .container { max-width: 960px; }
  .hidden-desktop { display: none !important; }
}

/* Extra large devices (large desktops, 1200px and up) */
@media (min-width: 1200px) {
  .container { max-width: 1140px; }
}

/* Print styles */
@media print {
  body { font-size: 12pt; }
  .no-print { display: none !important; }
}
`;
}

// =======================================
// 📚 STYLE LIBRARY LOADER (без заглушок)
// =======================================

async function loadSelectedStyleLibrary(settings = {}) {
  try {
    const fs = require('fs').promises;
    const path = require('path');

    // Перевіряємо чи вибрана бібліотека стилів у налаштуваннях
    if (!settings.styleLibrary || !settings.styleLibraryPath) {
      return {};
    }

    const libraryPath = path.resolve(settings.styleLibraryPath);

    // Перевіряємо чи існує файл бібліотеки
    try {
      await fs.access(libraryPath);
    } catch {
      console.warn(`Style library not found: ${libraryPath}`);
      return {};
    }

    // Завантажуємо та парсимо файл бібліотеки
    const libraryContent = await fs.readFile(libraryPath, 'utf8');

    if (libraryPath.endsWith('.json')) {
      return JSON.parse(libraryContent);
    } else if (libraryPath.endsWith('.css')) {
      return parseCSStoUtilities(libraryContent);
    }

    return {};
  } catch (error) {
    console.error('Error loading style library:', error);
    return {};
  }
}

function parseCSStoUtilities(cssContent) {
  const utilities = {};

  try {
    // Простий парсер CSS правил у утилітні класи
    const rules = cssContent.match(/\.[\w-]+\s*{[^}]+}/g) || [];

    rules.forEach(rule => {
      const match = rule.match(/\.([\w-]+)\s*{([^}]+)}/);
      if (match) {
        const className = match[1];
        const styles = match[2].trim();
        utilities[className] = styles
          .split(';')
          .filter(s => s.trim())
          .map(s => s.trim());
      }
    });
  } catch (error) {
    console.error('Error parsing CSS utilities:', error);
  }

  return utilities;
}

async function ensureModernNormalizeInHtml(htmlFilePath) {
  try {
    const fs = require('fs').promises;
    const {JSDOM} = require('jsdom');

    // Читаємо HTML файл
    let htmlContent = await fs.readFile(htmlFilePath, 'utf8');
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    // Шукаємо head секцію
    let head = document.head;
    if (!head) {
      // Якщо немає head, створюємо його
      head = document.createElement('head');
      document.documentElement.insertBefore(head, document.body);
    }

    // Перевіряємо чи вже є modern-normalize
    const existingLink = head.querySelector('link[href*="modern-normalize"]');

    if (!existingLink) {
      // Додаємо modern-normalize CDN link (без хардкодингу)
      const modernNormalizeCDN =
        'https://cdn.jsdelivr.net/npm/modern-normalize@latest/modern-normalize.css';
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = modernNormalizeCDN;
      link.setAttribute('data-added-by', 'css-classes-from-html');

      // Додаємо коментар перед лінком як маркер
      const normalizeComment = document.createComment('!!! normalize !!!');
      head.insertBefore(normalizeComment, head.firstChild);
      // Додаємо на початок head (перед іншими стилями)
      head.insertBefore(link, head.firstChild);

      // Зберігаємо оновлений HTML
      const updatedHtml = dom.serialize();
      await fs.writeFile(htmlFilePath, updatedHtml, 'utf8');

      console.log('✅ modern-normalize додано до HTML файлу');
    } else {
      console.log('ℹ️ modern-normalize вже присутній у HTML файлі');
    }
  } catch (error) {
    console.error('Error ensuring modern-normalize in HTML:', error);
    throw error;
  }
}

// =======================================
// 🔤 ВИДАЛЕНО: Вставка посилання на шрифти в HTML
// Тепер використовуємо тільки Google Fonts imports безпосередньо
// =======================================

// Вставка HTML-імпортів Google Fonts з відступом у 4 пробіли
async function addFontsImportsToHTML(htmlFilePath, importsHtml) {
  try {
    if (!htmlFilePath || !importsHtml) return;
    const fsP = require('fs').promises;
    let htmlContent = await fsP.readFile(htmlFilePath, 'utf8');

    if (htmlContent.includes('<!--!!! FONTS !!!-->')) return;

    // Нормалізуємо рядки і додаємо відступ у 4 пробіли для кожного рядка
    const indented = importsHtml
      .split('\n')
      .map(line => (line.length ? `    ${line}` : line))
      .join('\n');

    const comment = '<!--!!! FONTS !!!-->';
    const viewportMeta = htmlContent.match(/<meta[^>]+name=["']viewport["'][^>]*>/i);
    const charsetMeta = htmlContent.match(/<meta[^>]+charset=["'][^"']+["'][^>]*>/i);
    const openHead = htmlContent.match(/<head[^>]*>/i);
    const closeHead = htmlContent.match(/<\/head>/i);

    let insertPosition;
    let insertContent = `\n    ${comment}\n${indented}`;

    if (viewportMeta) {
      insertPosition = viewportMeta.index + viewportMeta[0].length;
    } else if (charsetMeta) {
      insertPosition = charsetMeta.index + charsetMeta[0].length;
    } else if (openHead) {
      insertPosition = openHead.index + openHead[0].length;
      insertContent = `\n    ${comment}\n${indented}\n`;
    } else if (closeHead) {
      insertPosition = closeHead.index;
      insertContent = `    ${comment}\n${indented}\n    `;
    } else {
      outputChannel?.appendLine('⚠️ Could not find suitable place to insert Google Fonts imports');
      return;
    }

    const newHtml =
      htmlContent.slice(0, insertPosition) + insertContent + htmlContent.slice(insertPosition);
    await fsP.writeFile(htmlFilePath, newHtml, 'utf8');
    outputChannel?.appendLine('✅ Google Fonts imports injected into HTML head');
  } catch (e) {
    outputChannel?.appendLine(`⚠️ Could not inject Google Fonts imports: ${e.message}`);
  }
}

// =======================================
// 🧠 HEURISTIC STYLES (без заглушок)
// =======================================

// inferStylesFromSelector функція видалена - не використовувалася

function getHeuristicStylesForTag(tag) {
  switch (tag) {
  case 'button':
    return [
      'display: inline-flex;',
      'align-items: center;',
      'justify-content: center;',
      'gap: 0.5rem;',
      'padding: 0.5rem 1rem;',
      'border-radius: var(--border-radius);',
      'background: var(--primary-color);',
      'color: #fff;',
      'border: none;',
      'cursor: pointer;'
    ];
  case 'a':
    return ['color: var(--primary-color);', 'text-decoration: none;'];
  case 'img':
    return ['display: block;', 'max-width: 100%;', 'height: auto;'];
  case 'ul':
  case 'ol':
    return ['list-style: none;', 'padding-left: 0;'];
  case 'nav':
  case 'header':
  case 'footer':
    return ['display: flex;', 'align-items: center;', 'gap: var(--spacing-md);'];
  case 'section':
  case 'main':
  case 'article':
  case 'div':
    return ['display: block;'];
  default:
    return [];
  }
}

function getHeuristicStylesForClass(className) {
  const cn = String(className || '').toLowerCase();
  const styles = [];

  const has = s => cn.includes(s);

  if (has('container'))
    styles.push('max-width: 1200px;', 'margin: 0 auto;', 'padding: 0 var(--spacing-md);');
  if (has('grid')) styles.push('display: grid;', 'gap: var(--spacing-md);');
  if (has('row')) styles.push('display: flex;', 'flex-wrap: wrap;', 'gap: var(--spacing-md);');
  if (has('col') || /^col-/.test(cn)) styles.push('flex: 1 1 0%;', 'min-width: 0;');
  if (has('btn') || has('button'))
    styles.push(
      'display: inline-flex;',
      'align-items: center;',
      'justify-content: center;',
      'gap: 0.5rem;',
      'padding: 0.5rem 1rem;',
      'border-radius: var(--border-radius);',
      'background: var(--primary-color);',
      'color: #fff;',
      'border: none;',
      'cursor: pointer;'
    );
  if (has('link')) styles.push('color: var(--primary-color);', 'text-decoration: none;');
  if (has('card'))
    styles.push(
      'background: #fff;',
      'border: 1px solid var(--border-color);',
      'border-radius: var(--border-radius);',
      'box-shadow: 0 1px 3px rgba(0,0,0,0.08);',
      'padding: var(--spacing-md);'
    );
  if (has('list')) styles.push('list-style: none;', 'padding-left: 0;');
  if (has('item')) styles.push('display: flex;', 'align-items: center;', 'gap: var(--spacing-sm);');
  if (has('title') || has('heading')) styles.push('font-weight: 600;', 'line-height: 1.25;');
  if (has('subtitle')) styles.push('color: #6c757d;');
  if (has('text-center')) styles.push('text-align: center;');
  if (has('text-right')) styles.push('text-align: right;');
  if (has('text-left')) styles.push('text-align: left;');
  if (has('nav')) styles.push('display: flex;', 'align-items: center;', 'gap: var(--spacing-md);');
  if (has('header') || has('footer'))
    styles.push('display: flex;', 'align-items: center;', 'gap: var(--spacing-md);');
  if (has('badge'))
    styles.push(
      'display: inline-block;',
      'padding: 0.25rem 0.5rem;',
      'border-radius: 9999px;',
      'background: var(--secondary-color);',
      'color: #fff;'
    );
  if (has('alert'))
    styles.push(
      'padding: var(--spacing-md);',
      'border-radius: var(--border-radius);',
      'background: #fff3cd;',
      'color: #664d03;',
      'border: 1px solid #ffecb5;'
    );
  if (has('modal'))
    styles.push(
      'position: fixed;',
      'inset: 0;',
      'display: none;',
      'align-items: center;',
      'justify-content: center;',
      'background: rgba(0,0,0,0.5);'
    );
  if (has('table')) styles.push('width: 100%;', 'border-collapse: collapse;');
  if (has('image') || has('img'))
    styles.push('display: block;', 'max-width: 100%;', 'height: auto;');
  if (has('icon'))
    styles.push(
      'display: inline-block;',
      'width: 1em;',
      'height: 1em;',
      'vertical-align: -0.125em;'
    );

  return styles;
}

// =======================================
// 🔍 ВИТЯГУВАННЯ КЛАСІВ З HTML
// =======================================

function extractClassesFromHTML(htmlContent) {
  try {
    const classMatches = htmlContent.match(/class\s*=\s*["']([^"']+)["']/g) || [];
    const allClasses = new Set();

    classMatches.forEach(match => {
      const classString = match.match(/["']([^"']+)["']/)[1];
      const classes = classString.split(/\s+/).filter(cls => cls.trim());
      classes.forEach(cls => {
        // ✅ FIX: Фільтрація некоректних класів - лінія 893-897 ✅
        if (cls && /^[a-zA-Z_-][a-zA-Z0-9_-]*$/.test(cls)) {
          allClasses.add(cls);
        }
      });
    });

    return Array.from(allClasses).sort();
  } catch (error) {
    outputChannel?.appendLine(`❌ Error extracting classes: ${error.message}`);
    return [];
  }
}

// Побудова селекторів у порядку проходження DOM з урахуванням ієрархії
function extractSelectorsWithHierarchy(htmlContent) {
  try {
    const {JSDOM} = require('jsdom');
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;
    const root = document.body || document.documentElement;

    const selectors = [];
    const seen = new Set();

    const buildToken = el => {
      if (!el || el.nodeType !== 1) return '';
      const id = el.getAttribute('id');
      if (id) return `#${id}`;
      const classList = (el.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean);
      if (classList.length > 0) return `.${classList[0]}`;
      return el.tagName ? el.tagName.toLowerCase() : '';
    };

    const walk = (el, pathTokens = []) => {
      if (!el || el.nodeType !== 1) return;
      const token = buildToken(el);
      const nextPath = token ? [...pathTokens, token] : pathTokens;

      // Додаємо тільки класи як селектори
      const classList = (el.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean);
      classList.forEach(className => {
        if (!seen.has(className)) {
          seen.add(className);
          const path = nextPath.join(' ');
          // ✅ FIX: Очищаємо className від крапок
          const cleanClassName = className.replace(/^\.+/, '');
          selectors.push({
            selector: `.${cleanClassName}`,
            depth: nextPath.length,
            path: path
          });
        }
      });

      // Діти
      Array.from(el.children || []).forEach(child => walk(child, nextPath));
    };

    walk(root, ['body']);

    return selectors;
  } catch (e) {
    outputChannel?.appendLine(`⚠️ Hierarchy extraction error: ${e.message}`);
    return [];
  }
}

// =======================================
// 💾 ЗБЕРЕЖЕННЯ CSS
// =======================================

// =======================================
// 🌐 ОБРОБКА MODERN NORMALIZE
// =======================================
async function addModernNormalizeToHTML(htmlFilePath, settings) {
  try {
    if (!settings?.includeModernNormalize) {
      return;
    }

    // Якщо файл не існує або не вказаний, запитуємо у користувача
    if (!htmlFilePath || !fs.existsSync(htmlFilePath)) {
      const result = await vscode.window.showInformationMessage(
        'Modern Normalize буде додано в HTML файл. Оберіть HTML файл:',
        'Вибрати файл',
        'Використати поточний',
        'Пропустити'
      );

      if (result === 'Вибрати файл') {
        const fileUri = await vscode.window.showOpenDialog({
          canSelectMany: false,
          openLabel: getExtensionTranslation('selectFile'),
          filters: {
            'HTML files': ['html', 'htm']
          }
        });

        if (fileUri && fileUri[0]) {
          htmlFilePath = fileUri[0].fsPath;
        } else {
          return; // користувач скасував
        }
      } else if (result === 'Використати поточний') {
        if (currentHTMLFile && fs.existsSync(currentHTMLFile)) {
          htmlFilePath = currentHTMLFile;
        } else {
          vscode.window.showWarningMessage('Поточний HTML файл не знайдено');
          return;
        }
      } else {
        return; // користувач пропустив
      }
    }

    const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

    // Перевірка чи вже є Modern Normalize
    if (htmlContent.includes('MODERN NORMALIZE') || htmlContent.includes('modern-normalize')) {
      outputChannel?.appendLine(`ℹ️ ${getExtensionTranslation('modernNormalizeExists')}`);
      return;
    }

    const modernNormalizeComment = '<!--!!! normalize !!!-->';

    // ✅ Конфігуровані CDN посилання без хардкодингу
    const cdnConfig = {
      modernNormalize: 'https://cdn.jsdelivr.net/npm/modern-normalize@latest/modern-normalize.css',
      integrity: null // Використовуємо latest без integrity для flexibility
    };

    const modernNormalizeLink = cdnConfig.integrity
      ? `<link rel="stylesheet" href="${cdnConfig.modernNormalize}" integrity="${cdnConfig.integrity}" crossorigin="anonymous">`
      : `<link rel="stylesheet" href="${cdnConfig.modernNormalize}">`;

    // Пріоритет вставки: після meta viewport -> після meta charset -> на початку <head> -> перед </head>
    const viewportMeta = htmlContent.match(/<meta[^>]+name=["']viewport["'][^>]*>/i);
    const charsetMeta = htmlContent.match(/<meta[^>]+charset=["'][^"']+["'][^>]*>/i);
    const openHead = htmlContent.match(/<head[^>]*>/i);
    const headMatch = htmlContent.match(/<\/head>/i);

    let insertPosition;
    let insertContent = `\n  ${modernNormalizeComment}\n  ${modernNormalizeLink}`;

    if (viewportMeta) {
      insertPosition = viewportMeta.index + viewportMeta[0].length;
    } else if (charsetMeta) {
      insertPosition = charsetMeta.index + charsetMeta[0].length;
    } else if (openHead) {
      insertPosition = openHead.index + openHead[0].length;
      insertContent = `\n  ${modernNormalizeComment}\n  ${modernNormalizeLink}\n`;
    } else if (headMatch) {
      insertPosition = headMatch.index;
      insertContent = `  ${modernNormalizeComment}\n  ${modernNormalizeLink}\n  `;
    } else {
      outputChannel?.appendLine('⚠️ Could not find suitable place to insert Modern Normalize link');
      return;
    }

    const newHtmlContent =
      htmlContent.slice(0, insertPosition) + insertContent + htmlContent.slice(insertPosition);
    fs.writeFileSync(htmlFilePath, newHtmlContent, 'utf8');

    outputChannel?.appendLine(`✅ ${getExtensionTranslation('modernNormalizeAdded')}`);
  } catch (error) {
    outputChannel?.appendLine(
      `❌ ${getExtensionTranslation('modernNormalizeError')}: ${error.message}`
    );
  }
}

async function saveGeneratedCSS(cssContent, htmlFilePath, settings = null) {
  try {
    // Додаємо Modern Normalize в HTML якщо потрібно
    await addModernNormalizeToHTML(htmlFilePath, settings);

    const dir = path.dirname(htmlFilePath);
    // Використовуємо шаблон CSS файлу з settings або fallback
    const cssFileName = settings?.cssFileName || 'styles.css';
    const ts = new Date();
    const pad = n => String(n).padStart(2, '0');
    const stamp = `${ts.getFullYear()}-${pad(ts.getMonth() + 1)}-${pad(ts.getDate())}--${pad(ts.getHours())}-${pad(ts.getMinutes())}-${pad(ts.getSeconds())}`;

    // Якщо назва файлу містить .css, замінюємо на з timestamp, інакше додаємо
    const baseName = cssFileName.replace('.css', '');
    const cssFilePath = path.join(dir, `${baseName}-${stamp}.css`);

    await vscode.workspace.fs.writeFile(
      vscode.Uri.file(cssFilePath),
      Buffer.from(cssContent, 'utf8')
    );

    outputChannel?.appendLine(`✅ CSS saved to: ${cssFilePath}`);

    // Відкриття згенерованого файлу
    const config = vscode.workspace.getConfiguration('cssClassesFromHtml');
    if (config.get('autoOpenCSS', true)) {
      const document = await vscode.workspace.openTextDocument(cssFilePath);
      await vscode.window.showTextDocument(document, vscode.ViewColumn.Beside);
    }
  } catch (error) {
    outputChannel?.appendLine(`❌ Error saving CSS: ${error.message}`);
    throw error;
  }
}

// =======================================
// 🔌 FIGMA INTEGRATION HANDLERS
// =======================================

async function handleGetFigmaCanvases(panel, message) {
  try {
    if (!integrationEngine) {
      throw new Error('Integration Engine не доступний');
    }

    if (!message.figmaToken) {
      throw new Error('Figma API token необхідний');
    }

    integrationEngine.updateOptions({
      figmaToken: message.figmaToken
    });

    const fileId = integrationEngine.extractFileIdFromFigmaLink(message.figmaLink);
    if (!fileId) {
      throw new Error('Некоректний формат Figma посилання');
    }

    outputChannel?.appendLine(`🎨 Loading Canvas from Figma file: ${fileId}`);
    logDebug('🎨 Fetching Figma canvases', {fileId, hasToken: !!message.figmaToken});

    const canvases = await integrationEngine.getFigmaCanvases(fileId);

    panel.webview.postMessage({
      command: 'figmaCanvases',
      canvases: canvases,
      success: true
    });

    outputChannel?.appendLine(
      `✅ ${getExtensionTranslation('canvasLoadedSuccessfully')}: ${canvases.length}`
    );
    logDebug('✅ Figma canvases loaded', {count: canvases?.length, sample: canvases?.slice?.(0, 3)});
  } catch (error) {
    outputChannel?.appendLine(`❌ ${getExtensionTranslation('canvasLoadError')}: ${error.message}`);
    logDebug('❌ Figma canvases load failed', {error: error?.message, stack: error?.stack});
    panel.webview.postMessage({
      command: 'figmaCanvases',
      canvases: [],
      success: false,
      error: error.message
    });
  }
}

async function handleGetFigmaLayers(panel, message) {
  try {
    if (!integrationEngine) {
      throw new Error('Integration Engine не доступний');
    }

    const fileId = integrationEngine.extractFileIdFromFigmaLink(message.figmaLink);
    if (!fileId) {
      throw new Error('Некоректний формат Figma посилання');
    }

    outputChannel?.appendLine('🎨 Loading Layers from Figma...');
    logDebug('🎨 Fetching Figma layers', {fileId, canvasIds: message.canvasIds});

    const layers = await integrationEngine.getFigmaLayers(fileId, message.canvasIds);

    panel.webview.postMessage({
      command: 'figmaLayers',
      layers: layers,
      success: true
    });

    outputChannel?.appendLine(
      `✅ ${getExtensionTranslation('layersLoadedSuccessfully')}: ${layers.length}`
    );
    logDebug('✅ Figma layers loaded', {count: layers?.length, sample: layers?.slice?.(0, 3)});
  } catch (error) {
    outputChannel?.appendLine(`❌ ${getExtensionTranslation('layersLoadError')}: ${error.message}`);
    logDebug('❌ Figma layers load failed', {error: error?.message, stack: error?.stack});
    panel.webview.postMessage({
      command: 'figmaLayers',
      layers: [],
      success: false,
      error: error.message
    });
  }
}

async function handleSearchFigmaLayers(panel, message) {
  try {
    if (!integrationEngine) {
      throw new Error('Integration Engine не доступний');
    }

    const fileId = integrationEngine.extractFileIdFromFigmaLink(message.figmaLink);
    if (!fileId) {
      throw new Error('Некоректний формат Figma посилання');
    }

    const results = await integrationEngine.searchFigmaLayers(
      fileId,
      message.canvasIds || [],
      message.query || ''
    );

    panel.webview.postMessage({
      command: 'figmaLayers',
      layers: results,
      success: true
    });
  } catch (error) {
    outputChannel?.appendLine(`❌ Error searching Layers: ${error.message}`);
    panel.webview.postMessage({
      command: 'figmaLayers',
      layers: [],
      success: false,
      error: error.message
    });
  }
}

async function handleGetLayerStyles(panel, message) {
  try {
    if (!integrationEngine) {
      throw new Error('Integration Engine не доступний');
    }

    if (!message.figmaToken) {
      throw new Error('Figma API token необхідний');
    }

    integrationEngine.updateOptions({
      figmaToken: message.figmaToken
    });

    const fileId = integrationEngine.extractFileIdFromFigmaLink(message.figmaLink);
    if (!fileId) {
      throw new Error('Некоректний формат Figma посилання');
    }

    const styles = await integrationEngine.getLayerStyles(fileId, message.layerIds || []);

    panel.webview.postMessage({
      command: 'layerStyles',
      styles: styles,
      success: true
    });
  } catch (error) {
    outputChannel?.appendLine(`❌ Error getting Layer styles: ${error.message}`);
    panel.webview.postMessage({
      command: 'layerStyles',
      styles: [],
      success: false,
      error: error.message
    });
  }
}

async function handleImportImages(panel, message) {
  try {
    const ImageImporter = moduleLoader.getModule('ImageImporter');
    if (!ImageImporter) {
      throw new Error('Image Importer не доступний');
    }

    if (!integrationEngine || !message.figmaToken) {
      throw new Error('Figma token та integration engine необхідні');
    }

    outputChannel?.appendLine('🖼️ Starting image import...');

    // ✅ FIX: Визначаємо директорію за замовчуванням (images відносно HTML)
    const htmlPath =
      currentHTMLFile && fs.existsSync(currentHTMLFile)
        ? currentHTMLFile
        : vscode.window.activeTextEditor?.document?.languageId === 'html'
          ? vscode.window.activeTextEditor.document.uri.fsPath
          : null;

    const workspaceFallback =
      vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
        ? vscode.workspace.workspaceFolders[0].uri.fsPath
        : process.cwd();

    const defaultDir = htmlPath ? path.dirname(htmlPath) : workspaceFallback;
    const defaultImagesDir = path.join(defaultDir, 'images');

    // ✅ FIX: Запитуємо користувача куди зберігати зображення
    const selectedUri = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      defaultUri: vscode.Uri.file(defaultImagesDir),
      openLabel: 'Вибрати папку для зображень',
      title: 'Вибрати папку для збереження зображень'
    });

    if (!selectedUri || selectedUri.length === 0) {
      // Користувач скасував
      panel.webview.postMessage({
        command: 'imagesImported',
        success: false,
        error: getExtensionTranslation('operationCancelledByUser')
      });
      return;
    }

    const imagesDir = selectedUri[0].fsPath;

    try {
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, {recursive: true});
        outputChannel?.appendLine(`📁 Created images directory: ${imagesDir}`);
      }
    } catch (e) {
      throw new Error(`Не вдалося створити директорію зображень: ${e.message}`);
    }

    // 🛠️ ✅ FIX: Підтримка вибору форматів з фронтенду (fallback до стандартних)
    const importer = new ImageImporter({
      outputDir: imagesDir,
      optimizeImages: true,
      // 📌 Якщо фронтенд передав масив форматів — використовуємо його, інакше дефолтні
      formats:
        Array.isArray(message.formats) && message.formats.length > 0
          ? message.formats
          : ['png', 'jpg', 'svg'],
      // 📌 Масштаби експорту (включає @2x, як просили)
      scales: [1, 2]
    });

    integrationEngine.updateOptions({
      figmaToken: message.figmaToken
    });

    const fileId = integrationEngine.extractFileIdFromFigmaLink(message.figmaLink);
    if (!fileId) {
      throw new Error('Некоректний формат Figma посилання');
    }

    // 🧠 Передаємо вибрані Layers/Canvas для імпорту. Якщо порожньо — обробник має імпортувати все.
    const result = await importer.importImages(
      integrationEngine.figmaClient,
      fileId,
      message.selectedLayers || [],
      message.selectedCanvasIds || []
    );

    const stats = importer.getImportStats(result.images);

    panel.webview.postMessage({
      command: 'imagesImported',
      success: true,
      stats: stats,
      images: result.images.length,
      cssFile: result.cssFile,
      outputDir: imagesDir
    });

    outputChannel?.appendLine(`✅ Images imported: ${stats.imagesCount} images, ${stats.totalSize}`);
    outputChannel?.appendLine(`📁 Saved to: ${imagesDir}`);
  } catch (error) {
    outputChannel?.appendLine(`❌ Error importing images: ${error.message}`);
    panel.webview.postMessage({
      command: 'imagesImported',
      success: false,
      error: error.message
    });
  }
}

async function handleImportFonts(panel, message) {
  try {
    const FontImporter = moduleLoader.getModule('FontImporter');
    if (!FontImporter) {
      throw new Error('Font Importer не доступний');
    }

    if (!integrationEngine || !message.figmaToken) {
      throw new Error('Figma token та integration engine необхідні');
    }

    outputChannel?.appendLine('🔤 Starting font import...');

    // ✅ FIX: Визначаємо поточний HTML файл для вставки Font imports
    const htmlPath =
      currentHTMLFile && fs.existsSync(currentHTMLFile)
        ? currentHTMLFile
        : vscode.window.activeTextEditor?.document?.languageId === 'html'
          ? vscode.window.activeTextEditor.document.uri.fsPath
          : null;

    // ✅ FIX: FontImporter без збереження файлів
    const importer = new FontImporter({
      includeAllWeights: true,
      includeAllStyles: true,
      display: 'swap',
      customFileName: 'figma-fonts' // ✅ FIX: Ім'я для preview
    });

    integrationEngine.updateOptions({
      figmaToken: message.figmaToken
    });

    const fileId = integrationEngine.extractFileIdFromFigmaLink(message.figmaLink);
    if (!fileId) {
      throw new Error('Некоректний формат Figma посилання');
    }

    // 🛠️ ✅ FIX: Передаємо також вибрані Canvas, щоб обмежити аналіз шрифтів
    const result = await importer.importFonts(
      integrationEngine.figmaClient,
      fileId,
      message.selectedLayers || [],
      message.selectedCanvasIds || []
    );

    const stats = importer.getImportStats(result.fonts);

    // ✅ FIX: Додаємо імпорти Google Fonts безпосередньо в HTML (без збереження окремих файлів)
    if (htmlPath && result && result.imports && result.imports.html) {
      try {
        await addFontsImportsToHTML(htmlPath, result.imports.html);
        outputChannel?.appendLine(`✅ Google Fonts imports додано до HTML: ${htmlPath}`);
        
        // Відкриваємо HTML файл для перегляду
        const doc = await vscode.workspace.openTextDocument(htmlPath);
        await vscode.window.showTextDocument(doc, vscode.ViewColumn.One);
      } catch (error) {
        outputChannel?.appendLine(`⚠️ Не вдалося додати Google Fonts до HTML: ${error.message}`);
      }
    }

    panel.webview.postMessage({
      command: 'fontsImported',
      success: true,
      stats: stats,
      fonts: result.fonts.length,
      htmlFile: htmlPath,
      htmlPreview: result.htmlPreview,
      cssContent: result.css,
      imports: result.imports
    });

    outputChannel?.appendLine(`✅ Fonts imported: ${stats.totalFonts} fonts - імпорти додані в HTML`);
    outputChannel?.appendLine('📄 Файли не зберігаються окремо - все додано безпосередньо в HTML');
  } catch (error) {
    outputChannel?.appendLine(`❌ Error importing fonts: ${error.message}`);
    panel.webview.postMessage({
      command: 'fontsImported',
      success: false,
      error: error.message
    });
  }
}

async function handleRenameLayer(panel, message) {
  try {
    if (!integrationEngine) {
      throw new Error('Integration engine не доступний');
    }

    const {layerId, newName} = message;

    if (!layerId || !newName) {
      throw new Error('Некоректні параметри для перейменовування');
    }

    outputChannel?.appendLine(`✏️ Renaming layer ${layerId} to ${newName}`);

    // Зберігаємо перейменування в IntegrationEngine
    await integrationEngine.setLayerAlias(layerId, newName);

    panel.webview.postMessage({
      command: 'layerRenamed',
      success: true,
      layerId: layerId,
      newName: newName
    });

    outputChannel?.appendLine(`✅ Layer renamed successfully: ${newName}`);
  } catch (error) {
    outputChannel?.appendLine(`❌ Error renaming layer: ${error.message}`);
    panel.webview.postMessage({
      command: 'layerRenamed',
      success: false,
      error: error.message
    });
  }
}

async function handleLoadSettings(panel) {
  try {
    const settings = configManager.loadConfig();

    // ✅ FIX: Додаємо поточний HTML файл до налаштувань - лінія 1159-1161 ✅
    settings.currentHTMLFile = currentHTMLFile;
    settings.currentHTMLFileName = currentHTMLFile ? path.basename(currentHTMLFile) : null;

    panel.webview.postMessage({
      command: 'lastSettingsLoaded',
      settings: settings,
      success: true
    });

    outputChannel?.appendLine('✅ Settings loaded successfully');
  } catch (error) {
    outputChannel?.appendLine(`❌ Error loading settings: ${error.message}`);
    panel.webview.postMessage({
      command: 'lastSettingsLoaded',
      settings: null,
      success: false,
      error: error.message
    });
  }
}

async function handleSaveSettings(panel, settings) {
  try {
    // ✅ FIX: Зберігаємо поточний HTML файл разом з налаштуваннями - лінія 1184-1185 ✅
    settings.lastHTMLFile = currentHTMLFile;

    const saved = configManager.saveConfig(settings);

    panel.webview.postMessage({
      command: 'settingsSaved',
      success: saved
    });

    if (saved) {
      outputChannel?.appendLine('✅ Settings saved successfully');
    } else {
      outputChannel?.appendLine('⚠️ Settings save failed');
    }
  } catch (error) {
    outputChannel?.appendLine(`❌ Error saving settings: ${error.message}`);
    panel.webview.postMessage({
      command: 'settingsSaved',
      success: false,
      error: error.message
    });
  }
}

// =======================================
// 🔄 ДЕАКТИВАЦІЯ
// =======================================

function deactivate() {
  console.log('🔄 CSS Classes from HTML deactivating...');

  try {
    if (panel) {
      panel.dispose();
      panel = null;
    }

    if (outputChannel) {
      outputChannel.dispose();
      outputChannel = null;
    }

    integrationEngine = null;
    currentHTMLFile = null;

    console.log('✅ Extension deactivated successfully');
  } catch (error) {
    console.error('❌ Error during deactivation:', error.message);
  }
}

// =======================================
// 📤 ЕКСПОРТ
// =======================================

module.exports = {
  activate,
  deactivate
};

// ✅ Fallback для випадку відсутності frontend/html
function generateWebViewHTML() {
  return '<!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>CSS Classes from HTML</title></head><body><div style="padding:16px;font-family:system-ui">Frontend HTML не знайдено. Будь ласка, додайте файл frontend/css-classes-from-html-menu.html у директорію розширення.</div><script>const vscode=acquireVsCodeApi&&acquireVsCodeApi();</script></body></html>';
}

async function handleSaveStyleLibrary(panel, payload) {
  try {
    // payload: { name, options, fileId, canvasId }
    const baseDir =
      extensionContext?.globalStorageUri?.fsPath || extensionContext?.extensionPath || process.cwd();
    const libDir = path.join(baseDir, 'style-libraries');
    const fileId = String(payload?.fileId || 'global');
    const canvasId = String(payload?.canvasId || 'all');
    const targetDir = path.join(libDir, fileId, canvasId);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, {recursive: true});

    const safeName = String(payload?.name || 'library')
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/-+/g, '-');
    const filePath = path.join(targetDir, `${safeName}.json`);

    const data = {
      name: payload?.name || 'Library',
      savedAt: new Date().toISOString(),
      options: payload?.options || {},
      fileId,
      canvasId,
      version: '1.0.0'
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

    // Відкриваємо файл бібліотеки для редагування
    try {
      const document = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
      await vscode.window.showTextDocument(document, vscode.ViewColumn.Beside);
      outputChannel?.appendLine(`📖 Style library file opened: ${path.basename(filePath)}`);
    } catch (error) {
      outputChannel?.appendLine(`⚠️ Could not open library file: ${error.message}`);
    }

    panel.webview.postMessage({
      command: 'styleLibrarySaved',
      success: true,
      filePath,
      library: data
    });
    outputChannel?.appendLine(`✅ Style library saved: ${filePath}`);
  } catch (error) {
    outputChannel?.appendLine(`❌ Error saving style library: ${error.message}`);
    panel.webview.postMessage({command: 'styleLibrarySaved', success: false, error: error.message});
  }
}

async function handleLoadStyleLibraries(panel, payload) {
  try {
    // payload: { fileId, canvasId }
    const baseDir =
      extensionContext?.globalStorageUri?.fsPath || extensionContext?.extensionPath || process.cwd();
    const libDir = path.join(baseDir, 'style-libraries');
    const fileId = String(payload?.fileId || 'global');
    const canvasId = String(payload?.canvasId || 'all');

    const lookupDirs = [
      path.join(libDir, fileId, canvasId),
      path.join(libDir, fileId, 'all'),
      path.join(libDir, 'global', 'all')
    ];

    const libraries = [];
    for (const dir of lookupDirs) {
      if (!fs.existsSync(dir)) continue;
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
      for (const f of files) {
        try {
          const full = path.join(dir, f);
          const content = fs.readFileSync(full, 'utf8');
          const json = JSON.parse(content);
          libraries.push({
            name: json.name || path.basename(f, '.json'),
            file: full,
            options: json.options || {},
            savedAt: json.savedAt || null,
            fileId: json.fileId || fileId,
            canvasId: json.canvasId || canvasId
          });
        } catch (_) {
          // Ігноруємо помилки парсингу JSON
        }
      }
    }

    panel.webview.postMessage({command: 'styleLibrariesLoaded', success: true, libraries});
    outputChannel?.appendLine(`✅ Style libraries loaded: ${libraries.length}`);
  } catch (error) {
    outputChannel?.appendLine(`❌ Error loading style libraries: ${error.message}`);
    panel.webview.postMessage({
      command: 'styleLibrariesLoaded',
      success: false,
      libraries: [],
      error: error.message
    });
  }
}

async function handleSelectStyleLibrary(panel, payload) {
  try {
    // payload: { filePath }
    const settings = configManager.loadConfig();
    settings.selectedStyleLibrary = payload?.filePath || null;
    const ok = configManager.saveConfig(settings);
    panel.webview.postMessage({
      command: 'styleLibrarySelected',
      success: ok,
      selected: settings.selectedStyleLibrary
    });
    outputChannel?.appendLine(
      `✅ Selected style library saved in settings: ${settings.selectedStyleLibrary || 'none'}`
    );
  } catch (error) {
    outputChannel?.appendLine(`❌ Error selecting style library: ${error.message}`);
    panel.webview.postMessage({
      command: 'styleLibrarySelected',
      success: false,
      error: error.message
    });
  }
}

async function handleChooseStyleLibrary(panel) {
  try {
    // Показуємо діалог вибору файлу
    const fileUri = await vscode.window.showOpenDialog({
      canSelectMany: false,
      openLabel: getExtensionTranslation('selectFile'),
      filters: {
        'JSON Style Libraries': ['json']
      }
    });

    if (fileUri && fileUri.length > 0) {
      const filePath = fileUri[0].fsPath;

      // Завантажуємо та перевіряємо файл бібліотеки
      const libraryData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      // Зберігаємо вибір у налаштуваннях
      const settings = configManager.loadConfig();
      settings.selectedStyleLibrary = filePath;
      configManager.saveConfig(settings);

      // Повідомляємо фронтенд про успішний вибір
      panel.webview.postMessage({
        command: 'styleLibrarySelected',
        success: true,
        selected: filePath,
        library: libraryData
      });

      outputChannel?.appendLine(`✅ Style library chosen: ${filePath}`);
    } else {
      outputChannel?.appendLine('ℹ️ Style library selection cancelled by user');
    }
  } catch (error) {
    outputChannel?.appendLine(`❌ Error choosing style library: ${error.message}`);
    panel.webview.postMessage({
      command: 'styleLibrarySelected',
      success: false,
      error: error.message
    });
  }
}

// 🎨 Функції для роботи з файлами стилів
async function handleLoadStyleFiles(panel, type) {
  try {
    outputChannel?.appendLine(`📂 Loading ${type} style files...`);

    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
      throw new Error('Workspace not found');
    }

    // Створюємо теку для стилів якщо не існує
    const stylesPath = path.join(workspaceRoot, 'styles');
    if (!fs.existsSync(stylesPath)) {
      fs.mkdirSync(stylesPath, {recursive: true});
    }

    // Шукаємо файли відповідного типу
    const pattern = getStyleFilePattern(type);
    const files = [];

    // Сканування теки styles
    if (fs.existsSync(stylesPath)) {
      const styleFiles = fs
        .readdirSync(stylesPath)
        .filter(file => file.match(pattern))
        .map(file => ({
          name: file,
          path: path.join(stylesPath, file),
          relativePath: `styles/${file}`,
          size: fs.statSync(path.join(stylesPath, file)).size,
          modified: fs.statSync(path.join(stylesPath, file)).mtime
        }));
      files.push(...styleFiles);
    }

    // Сканування кореневої теки
    const rootFiles = fs
      .readdirSync(workspaceRoot)
      .filter(file => file.match(pattern))
      .map(file => ({
        name: file,
        path: path.join(workspaceRoot, file),
        relativePath: file,
        size: fs.statSync(path.join(workspaceRoot, file)).size,
        modified: fs.statSync(path.join(workspaceRoot, file)).mtime
      }));
    files.push(...rootFiles);

    // Сортуємо за датою модифікації
    files.sort((a, b) => b.modified - a.modified);

    panel.webview.postMessage({
      command: 'styleFilesLoaded',
      type: type,
      files: files
    });

    outputChannel?.appendLine(`✅ Found ${files.length} ${type} style files`);
  } catch (error) {
    outputChannel?.appendLine(`❌ Error loading ${type} style files: ${error.message}`);
    panel.webview.postMessage({
      command: 'styleFilesLoaded',
      type: type,
      files: [],
      error: error.message
    });
  }
}

async function handleCreateStyleFile(panel, message) {
  try {
    const {fileName, type, template} = message;
    outputChannel?.appendLine(`🎨 Creating ${type} style file: ${fileName}`);

    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
      throw new Error('Workspace not found');
    }

    // Створюємо теку styles якщо не існує
    const stylesPath = path.join(workspaceRoot, 'styles');
    if (!fs.existsSync(stylesPath)) {
      fs.mkdirSync(stylesPath, {recursive: true});
    }

    const filePath = path.join(stylesPath, fileName);

    // Перевіряємо чи файл не існує
    if (fs.existsSync(filePath)) {
      const overwrite = await vscode.window.showWarningMessage(
        `Файл ${fileName} вже існує. Перезаписати?`,
        'Так',
        'Ні'
      );

      if (overwrite !== 'Так') {
        panel.webview.postMessage({
          command: 'styleFileCreated',
          success: false,
          error: 'Скасовано користувачем'
        });
        return;
      }
    }

    // Записуємо файл
    fs.writeFileSync(filePath, template || getDefaultStyleTemplate(type));

    // Відкриваємо файл для редагування
    const document = await vscode.workspace.openTextDocument(filePath);
    await vscode.window.showTextDocument(document);

    panel.webview.postMessage({
      command: 'styleFileCreated',
      success: true,
      fileName: fileName,
      filePath: filePath
    });

    // Оновлюємо список файлів
    await handleLoadStyleFiles(panel, type);

    outputChannel?.appendLine(`✅ Style file created: ${filePath}`);
  } catch (error) {
    outputChannel?.appendLine(`❌ Error creating style file: ${error.message}`);
    panel.webview.postMessage({
      command: 'styleFileCreated',
      success: false,
      error: error.message
    });
  }
}

async function handleOpenStyleFile(panel, filePath) {
  try {
    outputChannel?.appendLine(`📂 Opening style file: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      throw new Error('Файл не знайдено');
    }

    const document = await vscode.workspace.openTextDocument(filePath);
    await vscode.window.showTextDocument(document);

    panel.webview.postMessage({
      command: 'styleFileOpened',
      success: true,
      filePath: filePath
    });

    outputChannel?.appendLine(`✅ Style file opened: ${filePath}`);
  } catch (error) {
    outputChannel?.appendLine(`❌ Error opening style file: ${error.message}`);
    panel.webview.postMessage({
      command: 'styleFileOpened',
      success: false,
      error: error.message
    });
  }
}

// Допоміжні функції
function getStyleFilePattern(type) {
  switch (type) {
  case 'reset':
    return /^reset.*\.css$/i;
  case 'global':
    return /^(global|base|main).*\.css$/i;
  default:
    return /\.css$/i;
  }
}

// =======================================
// 👤 ОБРОБНИКИ КОРИСТУВАЦЬКИХ СТИЛІВ
// =======================================

async function handleLoadUserStyles(panel) {
  try {
    const userStyles = userStylesManager.getUserStyles();
    
    panel.webview.postMessage({
      command: 'userStylesLoaded',
      success: true,
      styles: userStyles
    });

    outputChannel?.appendLine(`📂 Завантажено ${userStyles.length} користувацьких стилів`);
  } catch (error) {
    outputChannel?.appendLine(`❌ Помилка завантаження користувацьких стилів: ${error.message}`);
    panel.webview.postMessage({
      command: 'userStylesLoaded',
      success: false,
      error: error.message
    });
  }
}

async function handleDeleteUserStyle(panel, fileName) {
  try {
    if (!fileName) {
      throw new Error('Не вказано ім\'я файлу для видалення');
    }

    const result = userStylesManager.deleteUserStyle(fileName);
    
    panel.webview.postMessage({
      command: 'userStyleDeleted',
      success: result.success,
      fileName: fileName,
      error: result.error
    });

    if (result.success) {
      outputChannel?.appendLine(`🗑️ Користувацький стиль видалено: ${fileName}`);
      // Перезавантажуємо список стилів
      await handleLoadUserStyles(panel);
    }
  } catch (error) {
    outputChannel?.appendLine(`❌ Помилка видалення користувацького стилю: ${error.message}`);
    panel.webview.postMessage({
      command: 'userStyleDeleted',
      success: false,
      error: error.message
    });
  }
}

async function handleOpenUserStyle(panel, fileName) {
  try {
    if (!fileName) {
      throw new Error('Не вказано ім\'я файлу для відкриття');
    }

    const userStyles = userStylesManager.getUserStyles();
    const style = userStyles.find(s => s.name === fileName);
    
    if (!style) {
      throw new Error(`Файл ${fileName} не знайдено`);
    }

    // Відкриваємо файл у VS Code
    const document = await vscode.workspace.openTextDocument(style.path);
    await vscode.window.showTextDocument(document, vscode.ViewColumn.One);

    panel.webview.postMessage({
      command: 'userStyleOpened',
      success: true,
      fileName: fileName
    });

    outputChannel?.appendLine(`📂 Відкрито користувацький стиль: ${fileName}`);
  } catch (error) {
    outputChannel?.appendLine(`❌ Помилка відкриття користувацького стилю: ${error.message}`);
    panel.webview.postMessage({
      command: 'userStyleOpened',
      success: false,
      error: error.message
    });
  }
}

async function handleSaveUserStyle(panel, fileName, content) {
  try {
    if (!fileName) {
      throw new Error('Не вказано ім\'я файлу для збереження');
    }
    
    if (!content) {
      throw new Error('Відсутній контент для збереження');
    }
    
    const result = await userStylesManager.saveUserStyle(fileName, content);
    
    if (!result.success) {
      throw new Error(result.error || 'Не вдалося зберегти файл');
    }
    
    panel.webview.postMessage({
      command: 'userStyleSaved',
      success: true,
      fileName: fileName,
      filePath: result.filePath
    });
    
    outputChannel?.appendLine(`💾 Збережено користувацький стиль: ${fileName}`);
    
  } catch (error) {
    outputChannel?.appendLine(`❌ Помилка збереження користувацького стилю: ${error.message}`);
    panel.webview.postMessage({
      command: 'userStyleSaved',
      success: false,
      error: error.message
    });
  }
}

function getDefaultStyleTemplate(type) {
  const date = new Date().toLocaleDateString('uk-UA');

  switch (type) {
  case 'reset':
    return `/* Reset стилі - ${date} */
/* Згенеровано CSS Classes from HTML v0.0.7 */

*, *::before, *::after {
  box-sizing: border-box;
}

* {
  margin: 0;
}

body {
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
}

input, button, textarea, select {
  font: inherit;
}

p, h1, h2, h3, h4, h5, h6 {
  overflow-wrap: break-word;
}

#root, #__next {
  isolation: isolate;
}
`;

  case 'global':
    return `/* Глобальні стилі - ${date} */
/* Згенеровано CSS Classes from HTML v0.0.7 */

:root {
  /* Кольори */
  --primary: #007ACC;
  --secondary: #6c757d;
  --success: #28a745;
  --danger: #dc3545;
  --warning: #ffc107;
  --info: #17a2b8;
  --light: #f8f9fa;
  --dark: #343a40;
  
  /* Відступи */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 3rem;
  
  /* Шрифти */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

body {
  font-family: var(--font-family);
  line-height: 1.5;
  color: var(--dark);
  background-color: var(--light);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}
`;


  default:
    return `/* Стилі - ${date} */
/* Згенеровано CSS Classes from HTML v0.0.7 */

/* Ваші стилі тут */
`;
  }
}
