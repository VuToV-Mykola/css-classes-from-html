// ✅ CSS Classes from HTML Extension v0.0.7 - FIXED WITH CONTEXT
// Автоматична генерація CSS класів з HTML файлів з реальною інтеграцією Figma
// Версія з виправленою проблемою передачі контексту HTML файлу

const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

// ✅ FIX: Інтернаціоналізація для extension.js
const extensionTranslations = {
  uk: {
    extensionStarting: 'Розширення запускається...',
    loadingBackendModules: 'Завантаження backend модулів...',
    integrationEngineInitialized: 'Integration Engine ініціалізовано - повна інтеграція Figma доступна',
    integrationEngineInitFailed: 'Ініціалізація Integration Engine не вдалася',
    backendModulesPartial: 'Backend-модулі завантажені не повністю — робота в базовому режимі',
    moduleLoadingDetails: 'Деталі завантаження модулів:',
    registeredCommands: 'Команди зареєстровано успішно',
    extensionFullyActivated: 'Розширення повністю активовано!',
    cssGeneratedSuccessfully: 'CSS згенеровано успішно!',
    cssGenerationCompleted: 'Генерація CSS завершена успішно',
    cssGenerationError: 'Помилка при генерації CSS',
    canvasLoadedSuccessfully: 'Canvas завантажено успішно',
    canvasLoadError: 'Помилка завантаження Canvas',
    layersLoadedSuccessfully: 'Layers завантажено успішно',
    layersLoadError: 'Помилка завантаження Layers',
    layerStylesError: 'Помилка отримання стилів Layer',
    imagesImportError: 'Помилка імпорту зображень',
    fontsImportError: 'Помилка імпорту шрифтів',
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
    integrationEngineInitialized: 'Integration Engine initialized - Full Figma integration available',
    integrationEngineInitFailed: 'Integration Engine initialization failed',
    backendModulesPartial: 'Backend modules loaded partially — working in basic mode',
    moduleLoadingDetails: 'Module loading details:',
    registeredCommands: 'Commands registered successfully',
    extensionFullyActivated: 'Extension fully activated!',
    cssGeneratedSuccessfully: 'CSS generated successfully!',
    cssGenerationCompleted: 'CSS generation completed successfully',
    cssGenerationError: 'Error in CSS generation',
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
    integrationEngineInitialized: 'Integration Engine initialisiert - Vollständige Figma-Integration verfügbar',
    integrationEngineInitFailed: 'Integration Engine-Initialisierung fehlgeschlagen',
    backendModulesPartial: 'Backend-Module teilweise geladen — arbeitet im Basismodus',
    moduleLoadingDetails: 'Modullade-Details:',
    registeredCommands: 'Befehle erfolgreich registriert',
    extensionFullyActivated: 'Erweiterung vollständig aktiviert!',
    cssGeneratedSuccessfully: 'CSS erfolgreich generiert!',
    cssGenerationCompleted: 'CSS-Generierung erfolgreich abgeschlossen',
    cssGenerationError: 'Fehler bei der CSS-Generierung',
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
      try { fs.appendFileSync(logFilePath, line + "\n", 'utf8'); } catch (_e) {}
    }
  } catch (_e) {}
}

function safeSerialize(obj) {
  try {
    return JSON.stringify(obj, (k, v) => (typeof v === 'string' && v.length > 500 ? v.slice(0, 500) + '…' : v));
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
    } catch {}
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
      sidebarVisible: false,
      savedAt: new Date().toISOString(),
      version: '2.1.0',
      lastHTMLFile: '' // ✅ FIX: Додано поле для збереження останнього HTML файлу - лінія 180 ✅
    };
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
      if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
      logFilePath = path.join(logsDir, 'runtime.log');
      fs.appendFileSync(logFilePath, `\n===== Session start ${new Date().toLocaleString()} =====\n`, 'utf8');
      logDebug('📓 File logger initialized', { logFilePath });
    } catch (e) {
      outputChannel?.appendLine(`⚠️ Failed to init file logger: ${e.message}`);
    }

    // 2. Налаштування модульного завантажувача
    moduleLoader.setOutputChannel(outputChannel);

    // 3. Ініціалізація конфігурації (використовуємо globalStorage)
    const storagePath = context.globalStorageUri?.fsPath || context.storageUri?.fsPath || context.extensionPath;
    configManager.initialize(context.extensionPath, storagePath);

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
          outputChannel.appendLine(
            `✅ ${getExtensionTranslation('integrationEngineInitialized')}`
          );
        } else {
          throw new Error('Модуль IntegrationEngine відсутній');
        }
      } catch (error) {
        outputChannel.appendLine(`❌ ${getExtensionTranslation('integrationEngineInitFailed')}: ${error.message}`);
        integrationEngine = null;
      }
    } else {
      outputChannel.appendLine(`⚠️ ${getExtensionTranslation('backendModulesPartial')}`);
      outputChannel.appendLine(`📋 ${getExtensionTranslation('moduleLoadingDetails')}`);
      moduleResult.errors.forEach(error => {
        outputChannel.appendLine(`   • ${error.moduleName}: ${error.error}`);
      });
    }

    // 6. Реєстрація команд
    const commands = registerAllCommands(context);
    outputChannel.appendLine(`✅ ${getExtensionTranslation('registeredCommands')}: ${commands.length}`);

    // 7. Додавання ресурсів до subscriptions
    context.subscriptions.push(...commands, outputChannel);

    // 8. Показ вітального повідомлення
    showWelcomeMessage(moduleResult);

    outputChannel.appendLine(`✅ ${getExtensionTranslation('extensionFullyActivated')}`);

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

    vscode.window.showErrorMessage(`${getExtensionTranslation('extensionActivationError')}: ${error.message}`);
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
        vscode.window.showInformationMessage(`${getExtensionTranslation('htmlFileSelected')}: ${path.basename(currentHTMLFile)}`);
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
      const cspMeta = `\n<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https: data:; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource} 'unsafe-inline' 'unsafe-eval'; font-src ${webview.cspSource} https: data:; connect-src ${webview.cspSource} https:;">`;
      if (/<head[^>]*>/i.test(htmlContent)) {
        htmlContent = htmlContent.replace(/<head[^>]*>/i, match => `${match}${cspMeta}`);
      } else {
        htmlContent = cspMeta + htmlContent;
      }

      panel.webview.html = htmlContent;
    } else {
      // Якщо файл не знайдено, генеруємо HTML динамічно
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
  panel.webview.onDidReceiveMessage(async (message) => {
    try {
      outputChannel?.appendLine(`📨 Received message: ${message.command}`);
      logDebug('📥 Webview → Extension message', { command: message?.command, payloadKeys: Object.keys(message || {}) });

      switch (message.command) {
      case 'getInitialContext':
        // Відповідь на запит початкового контексту від вебв’ю
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
        outputChannel?.appendLine('📥 generateCSS command received in backend');
        outputChannel?.appendLine(`📄 Settings received: ${JSON.stringify(message.settings, null, 2)}`);
        await handleGenerateCSS(panel, message.settings);
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

      case 'loadLastSettings':
        await handleLoadSettings(panel);
        break;

      case 'saveCurrentSettings': {
        await handleSaveSettings(panel, message.settings);
        break;
      }

      case 'renameLayer':
        await handleRenameLayer(panel, message);
        break;

      case 'testMessage':
        outputChannel?.appendLine(`🧪 Test message received: ${JSON.stringify(message.data)}`);
        panel.webview.postMessage({
          command: 'testResponse', 
          message: 'Test message processed successfully!'
        });
        break;

      default:
        outputChannel?.appendLine(`⚠️ Unknown command: ${message.command}`);
        logDebug('⚠️ Unknown webview command', { command: message?.command });
      }
    } catch (error) {
      outputChannel?.appendLine(`❌ Error handling message: ${error.message}`);
      logDebug('❌ Error handling webview message', { error: error?.message, stack: error?.stack });
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

    // Генерація відповідно до режиму
    if (settings.mode === 'minimal') {
      outputChannel?.appendLine('🔧 Generating basic CSS...');
      css = generateBasicCSS(htmlContent);
    } else if (settings.mode === 'maximum' && integrationEngine) {
      if (settings.figmaLink && settings.figmaToken) {
        const fileId = integrationEngine.extractFileIdFromFigmaLink(settings.figmaLink);
        if (fileId) {
          const result = await integrationEngine.generateCSS(fileId, htmlContent, {
            figmaToken: settings.figmaToken,
            selectedCanvases: settings.selectedCanvases,
            selectedLayers: settings.selectedLayers
          });
          css = result.css;
        } else {
          css = generateBasicCSS(htmlContent);
        }
      } else {
        css = generateBasicCSS(htmlContent);
      }
    } else if (settings.mode === 'production') {
      css = generateProductionCSS(htmlContent);
    } else {
      css = generateBasicCSS(htmlContent);
    }

    // Збереження CSS файлу
    await saveGeneratedCSS(css, htmlFilePath);

    panel.webview.postMessage({
      command: 'generationComplete',
      success: true,
      css: css,
      message: getExtensionTranslation('cssGeneratedSuccessfully')
    });

    outputChannel?.appendLine(`✅ ${getExtensionTranslation('cssGenerationCompleted')}`);
  } catch (error) {
    outputChannel?.appendLine(`❌ ${getExtensionTranslation('cssGenerationError')}: ${error.message}`);
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

    const css = generateBasicCSS(htmlContent);
    await saveGeneratedCSS(css, htmlFilePath);

    vscode.window.showInformationMessage(`✅ ${getExtensionTranslation('cssGeneratedFor')}: ${path.basename(htmlFilePath)}`);
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

function generateBasicCSS(htmlContent) {
  let css = `/* ✅ CSS Generated by CSS Classes from HTML v0.0.7 */
/* Generated: ${new Date().toLocaleString()} */
/* Source: ${currentHTMLFile ? path.basename(currentHTMLFile) : 'Unknown'} */

/* ============================================
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

/* ============================================
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

  // Генерація селекторів за HTML-ієрархією
  const hierarchical = extractSelectorsWithHierarchy(htmlContent);

  if (hierarchical.length > 0) {
    css += `/* ============================================
   GENERATED SELECTORS (HTML hierarchy order)
   ============================================ */
`;
    hierarchical.forEach(item => {
      css += `/* path: ${item.path} */\n${item.selector} {\n  /* styles mapped from Figma/HTML */\n}\n\n`;
    });
  } else {
    // Fallback: плоский список класів
    const classes = extractClassesFromHTML(htmlContent);
    if (classes.length > 0) {
      css += `/* ============================================
   GENERATED CLASSES
   ============================================ */
`;
      classes.forEach(className => {
        css += `.${className} {\n  /* TODO: Add styles for ${className} */\n}\n\n`;
      });
    }
  }

  // Адаптивні стилі
  css += generateResponsiveStyles();

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
  .container {
    max-width: 720px;
  }
  
  .hidden-tablet {
    display: none !important;
  }
}

/* Large devices (desktops, 992px and up) */
@media (min-width: 992px) {
  .container {
    max-width: 960px;
  }
  
  .hidden-desktop {
    display: none !important;
  }
}

/* Extra large devices (large desktops, 1200px and up) */
@media (min-width: 1200px) {
  .container {
    max-width: 1140px;
  }
}

/* Print styles */
@media print {
  body {
    font-size: 12pt;
  }
  
  .no-print {
    display: none !important;
  }
}
`;
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
    const { JSDOM } = require('jsdom');
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;
    const root = document.body || document.documentElement;

    const selectors = [];
    const seen = new Set();

    const buildToken = (el) => {
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

      // Будуємо селектор як повний шлях
      if (token) {
        const selector = nextPath.join(' ');
        const key = selector;
        if (!seen.has(key)) {
          seen.add(key);
          selectors.push({ selector, depth: nextPath.length, path: selector });
        }
      }

      // Діти
      Array.from(el.children || []).forEach(child => walk(child, nextPath));
    };

    walk(root, ['body']);

    return selectors;
  } catch (e) {
    outputChannel?.appendLine(`⚠️ Hierarchy extraction fallback: ${e.message}`);
    return [];
  }
}

// =======================================
// 💾 ЗБЕРЕЖЕННЯ CSS
// =======================================

async function saveGeneratedCSS(cssContent, htmlFilePath) {
  try {
    const dir = path.dirname(htmlFilePath);
    const ts = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const stamp = `${ts.getFullYear()}-${pad(ts.getMonth() + 1)}-${pad(ts.getDate())}--${pad(ts.getHours())}-${pad(ts.getMinutes())}-${pad(ts.getSeconds())}`;
    const cssFilePath = path.join(dir, `styles-${stamp}.css`);

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
    logDebug('🎨 Fetching Figma canvases', { fileId, hasToken: !!message.figmaToken });

    const canvases = await integrationEngine.getFigmaCanvases(fileId);

    panel.webview.postMessage({
      command: 'figmaCanvases',
      canvases: canvases,
      success: true
    });

    outputChannel?.appendLine(`✅ ${getExtensionTranslation('canvasLoadedSuccessfully')}: ${canvases.length}`);
    logDebug('✅ Figma canvases loaded', { count: canvases?.length, sample: canvases?.slice?.(0, 3) });
  } catch (error) {
    outputChannel?.appendLine(`❌ ${getExtensionTranslation('canvasLoadError')}: ${error.message}`);
    logDebug('❌ Figma canvases load failed', { error: error?.message, stack: error?.stack });
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
    logDebug('🎨 Fetching Figma layers', { fileId, canvasIds: message.canvasIds });

    const layers = await integrationEngine.getFigmaLayers(fileId, message.canvasIds);

    panel.webview.postMessage({
      command: 'figmaLayers',
      layers: layers,
      success: true
    });

    outputChannel?.appendLine(`✅ ${getExtensionTranslation('layersLoadedSuccessfully')}: ${layers.length}`);
    logDebug('✅ Figma layers loaded', { count: layers?.length, sample: layers?.slice?.(0, 3) });
  } catch (error) {
    outputChannel?.appendLine(`❌ ${getExtensionTranslation('layersLoadError')}: ${error.message}`);
    logDebug('❌ Figma layers load failed', { error: error?.message, stack: error?.stack });
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
    const htmlPath = currentHTMLFile && fs.existsSync(currentHTMLFile)
      ? currentHTMLFile
      : (vscode.window.activeTextEditor?.document?.languageId === 'html'
        ? vscode.window.activeTextEditor.document.uri.fsPath
        : null);

    const workspaceFallback = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
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
        fs.mkdirSync(imagesDir, { recursive: true });
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
      formats: Array.isArray(message.formats) && message.formats.length > 0 ? message.formats : ['png', 'jpg', 'svg'],
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

    // ✅ FIX: Визначаємо директорію за замовчуванням (поруч з HTML)
    const htmlPath = currentHTMLFile && fs.existsSync(currentHTMLFile)
      ? currentHTMLFile
      : (vscode.window.activeTextEditor?.document?.languageId === 'html'
        ? vscode.window.activeTextEditor.document.uri.fsPath
        : null);

    const workspaceFallback = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
      ? vscode.workspace.workspaceFolders[0].uri.fsPath
      : process.cwd();

    const defaultDir = htmlPath ? path.dirname(htmlPath) : workspaceFallback;

    // ✅ FIX: Генеруємо ім'я файлу з датою та часом
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}--${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    const defaultFileName = `fonts-${timestamp}.html`;

    // ✅ FIX: Запитуємо користувача куди зберігати файл
    const saveUri = await vscode.window.showSaveDialog({
      defaultUri: vscode.Uri.file(path.join(defaultDir, defaultFileName)),
      filters: {
        'HTML files': ['html'],
        'All files': ['*']
      },
      title: 'Зберегти файл шрифтів'
    });

    if (!saveUri) {
      // Користувач скасував
      panel.webview.postMessage({
        command: 'fontsImported',
        success: false,
        error: getExtensionTranslation('operationCancelledByUser')
      });
      return;
    }

    const outputDir = path.dirname(saveUri.fsPath);
    const outputFileName = path.basename(saveUri.fsPath, '.html');

    const importer = new FontImporter({
      outputDir: outputDir,
      includeAllWeights: true,
      includeAllStyles: true,
      display: 'swap',
      customFileName: outputFileName // ✅ FIX: Передаємо кастомне ім'я файлу
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

    panel.webview.postMessage({
      command: 'fontsImported',
      success: true,
      stats: stats,
      fonts: result.fonts.length,
      htmlFile: result.htmlFile,
      cssFile: result.cssFile
    });

    outputChannel?.appendLine(`✅ Fonts imported: ${stats.totalFonts} fonts`);
    outputChannel?.appendLine(`📄 Saved to: ${result.htmlFile}`);
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

    const { layerId, newName } = message;
    
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
