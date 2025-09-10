// ✅ CSS Classes from HTML Extension - FIXED VERSION
// Автоматична генерація CSS класів з HTML файлів з реальною інтеграцією Figma
// Версія з виправленою проблемою завантаження backend модулів

const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

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

  /**
     * Безпечне завантаження модуля з детальним логуванням
     */
  safeRequire(modulePath, moduleName) {
    try {
      // Перевіряємо чи існує файл
      const fullPath = path.resolve(__dirname, modulePath);
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Module file not found: ${fullPath}`);
      }

      // Завантажуємо модуль
      const module = require(modulePath);
            
      if (typeof module !== 'function' && typeof module !== 'object') {
        throw new Error(`Invalid module export type: ${typeof module}`);
      }

      this.loadedModules[moduleName] = module;
      this.log(`✅ ${moduleName} loaded successfully from ${modulePath}`);
      return module;

    } catch (error) {
      const errorMsg = `❌ Failed to load ${moduleName}: ${error.message}`;
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

  /**
     * Завантаження всіх backend модулів
     */
  loadAllBackendModules() {
    this.log('🚀 Starting backend modules loading...');

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
    this.log(`📊 Module loading summary: ${successCount}/${totalCount} modules loaded`);
        
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

  /**
     * Отримання завантаженого модуля
     */
  getModule(name) {
    return this.loadedModules[name] || null;
  }

  /**
     * Перевірка чи всі модулі завантажено
     */
  allModulesLoaded() {
    const requiredModules = ['FigmaAPIClient', 'IntegrationEngine', 'HTMLParser'];
    return requiredModules.every(name => this.loadedModules[name]);
  }

  /**
     * Отримання статистики завантаження
     */
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
// 🌐 ГЛОБАЛЬНІ ЗМІННІ
// =======================================

let panel = null;
let outputChannel = null;
let integrationEngine = null;
let extensionContext = null;

// =======================================
// ⚙️ МЕНЕДЖЕР КОНФІГУРАЦІЇ
// =======================================

const configManager = {
  configPath: null,

  initialize(extensionPath) {
    const configDir = path.join(extensionPath, '.vscode', 'css-classes-config');
    this.configPath = path.join(configDir, 'last-settings.json');

    try {
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, {recursive: true});
      }
    } catch (error) {
      console.error('❌ Error creating config directory:', error.message);
    }
  },

  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('❌ Error loading config:', error.message);
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
        version: '2.0.1'
      };
      fs.writeFileSync(this.configPath, JSON.stringify(dataToSave, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error('❌ Error saving config:', error.message);
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
      version: '2.0.1'
    };
  }
};

// =======================================
// 🚀 АКТИВАЦІЯ РОЗШИРЕННЯ
// =======================================

/**
 * Головна функція активації розширення
 */
function activate(context) {
  console.log('🚀 CSS Classes from HTML v2.0.1 FIXED activating...');
  extensionContext = context;
    
  try {
    // 1. Ініціалізація output channel
    outputChannel = vscode.window.createOutputChannel('CSS Classes from HTML');
    outputChannel.show(true);
    outputChannel.appendLine('🚀 Extension starting...');

    // 2. Налаштування модульного завантажувача
    moduleLoader.setOutputChannel(outputChannel);
        
    // 3. Ініціалізація конфігурації
    configManager.initialize(context.extensionPath);
        
    // 4. Завантаження backend модулів
    outputChannel.appendLine('📦 Loading backend modules...');
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
          outputChannel.appendLine('✅ Integration Engine initialized - Full Figma integration available');
        } else {
          throw new Error('IntegrationEngine module is null');
        }
      } catch (error) {
        outputChannel.appendLine(`❌ Integration Engine initialization failed: ${error.message}`);
        integrationEngine = null;
      }
    } else {
      outputChannel.appendLine('⚠️ Backend modules not fully loaded - Working in basic mode');
      outputChannel.appendLine('📋 Module loading details:');
      moduleResult.errors.forEach(error => {
        outputChannel.appendLine(`   • ${error.moduleName}: ${error.error}`);
      });
    }

    // 6. Реєстрація команд
    const commands = registerAllCommands(context);
    outputChannel.appendLine(`✅ Registered ${commands.length} commands successfully`);
        
    // 7. Додавання ресурсів до subscriptions
    context.subscriptions.push(...commands, outputChannel);
        
    // 8. Показ вітального повідомлення
    showWelcomeMessage(moduleResult);
        
    outputChannel.appendLine('✅ Extension fully activated!');
        
    return {
      success: true,
      commandsCount: commands.length,
      version: '2.0.1',
      moduleStats: moduleResult
    };
        
  } catch (error) {
    const errorMessage = `💥 Fatal error during activation: ${error.message}`;
    console.error(errorMessage);
    console.error('Stack trace:', error.stack);
        
    if (outputChannel) {
      outputChannel.appendLine(errorMessage);
      outputChannel.appendLine(`Stack: ${error.stack}`);
    }
        
    vscode.window.showErrorMessage(`CSS Classes from HTML activation failed: ${error.message}`);
    throw error;
  }
}

/**
 * Реєстрація всіх команд
 */
function registerAllCommands(context) {
  const commands = [];
    
  // Команда 1: Головне меню
  commands.push(vscode.commands.registerCommand('css-classes.showMenu', async () => {
    outputChannel?.appendLine('🎯 Command \'css-classes.showMenu\' executed');
    await openMainMenu(context);
  }));
    
  // Команда 2: Меню з контексту
  commands.push(vscode.commands.registerCommand('css-classes.showMenuFromContext', async (uri) => {
    outputChannel?.appendLine('🎯 Command \'css-classes.showMenuFromContext\' executed');
    outputChannel?.appendLine(`📂 URI: ${uri ? uri.fsPath : 'undefined'}`);
    await openMainMenu(context);
  }));
    
  // Команда 3: Швидка генерація
  commands.push(vscode.commands.registerCommand('css-classes.quickGenerate', async () => {
    outputChannel?.appendLine('🎯 Command \'css-classes.quickGenerate\' executed');
    await quickGenerateCSS();
  }));
    
  // Команда 4: Зворотна сумісність
  commands.push(vscode.commands.registerCommand('extension.cssClassesFromHtml', async () => {
    outputChannel?.appendLine('🎯 Command \'extension.cssClassesFromHtml\' executed');
    await openMainMenu(context);
  }));
    
  return commands;
}

/**
 * Показ вітального повідомлення
 */
async function showWelcomeMessage(moduleResult) {
  const statusText = moduleResult.success ? 
    '✅ Повна інтеграція з Figma доступна!' : 
    '⚠️ Базовий режим (деякі модулі не завантажено)';
    
  const message = `🚀 CSS Classes from HTML готовий!\n${statusText}`;
    
  const choice = await vscode.window.showInformationMessage(
    message,
    'Відкрити меню',
    'Швидка генерація', 
    'Детальна діагностика'
  );
    
  switch (choice) {
  case 'Відкрити меню':
    vscode.commands.executeCommand('css-classes.showMenu');
    break;
  case 'Швидка генерація':
    vscode.commands.executeCommand('css-classes.quickGenerate');
    break;
  case 'Детальна діагностика':
    showDiagnosticInfo(moduleResult);
    break;
  }
}

/**
 * Показ діагностичної інформації
 */
function showDiagnosticInfo(moduleResult) {
  outputChannel?.appendLine('\n🔍 DIAGNOSTIC INFORMATION');
  outputChannel?.appendLine('=' .repeat(50));
  outputChannel?.appendLine(`Loaded modules: ${moduleResult.loadedCount}/${moduleResult.totalCount}`);
  outputChannel?.appendLine(`All modules loaded: ${moduleResult.success}`);
  outputChannel?.appendLine(`Integration Engine available: ${!!integrationEngine}`);
    
  if (moduleResult.errors.length > 0) {
    outputChannel?.appendLine('\n❌ MODULE LOADING ERRORS:');
    moduleResult.errors.forEach(error => {
      outputChannel?.appendLine(`• ${error.moduleName}:`);
      outputChannel?.appendLine(`  Path: ${error.modulePath}`);
      outputChannel?.appendLine(`  Error: ${error.error}`);
      outputChannel?.appendLine(`  Time: ${error.timestamp}`);
    });
  }
    
  outputChannel?.appendLine('\n✅ LOADED MODULES:');
  Object.keys(moduleResult.modules).forEach(moduleName => {
    outputChannel?.appendLine(`• ${moduleName}: OK`);
  });
    
  outputChannel?.appendLine('=' .repeat(50));
  outputChannel?.show();
}

// =======================================
// 🎨 WEBVIEW ІНТЕРФЕЙС
// =======================================

/**
 * Відкриття головного меню
 */
async function openMainMenu(context) {
  try {
    outputChannel?.appendLine('📋 Opening main menu...');
        
    if (panel) {
      panel.reveal(vscode.ViewColumn.One);
      return;
    }
        
    panel = vscode.window.createWebviewPanel(
      'cssClassesMenu',
      'CSS Classes from HTML v2.0.1',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.file(context.extensionPath)]
      }
    );
        
    // Генерація HTML контенту
    const htmlContent = generateWebViewHTML();
    panel.webview.html = htmlContent;
        
    // Налаштування обробників
    setupMessageHandlers(panel);
        
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

/**
 * Генерація HTML для WebView
 */
function generateWebViewHTML() {
  const moduleStats = moduleLoader.getLoadingStats();
  const statusColor = moduleStats.allLoaded ? '#4caf50' : '#ff9800';
  const statusText = moduleStats.allLoaded ? 
    'Повна інтеграція доступна' : 
    'Базовий режим (деякі модулі не завантажено)';

  return `<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSS Classes from HTML v2.0.1</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        :root {
            --primary: #007ACC;
            --success: #4caf50;
            --warning: #ff9800;
            --error: #f44336;
            --bg: #1e1e1e;
            --bg-secondary: #252526;
            --text: #cccccc;
            --border: #3c3c3c;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--bg);
            color: var(--text);
            min-height: 100vh;
            font-size: 14px;
        }
        
        .header {
            background: linear-gradient(135deg, var(--primary) 0%, #005a9e 100%);
            padding: 1rem;
            text-align: center;
            color: white;
        }
        
        .header h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
        
        .status {
            display: inline-block;
            padding: 0.3rem 0.8rem;
            background: ${statusColor};
            color: white;
            border-radius: 15px;
            font-size: 0.9rem;
        }
        
        .container { max-width: 800px; margin: 0 auto; padding: 1rem; }
        
        .section {
            background: var(--bg-secondary);
            border: 1px solid var(--border);
            border-radius: 8px;
            margin-bottom: 1rem;
            overflow: hidden;
        }
        
        .section-header {
            background: #2d2d30;
            padding: 0.8rem 1rem;
            border-bottom: 1px solid var(--border);
            font-weight: 600;
        }
        
        .section-content { padding: 1rem; }
        
        .button {
            background: var(--primary);
            color: white;
            border: none;
            padding: 0.8rem 1.2rem;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
            margin: 0.3rem;
            transition: all 0.2s ease;
        }
        
        .button:hover {
            background: #005a9e;
            transform: translateY(-1px);
        }
        
        .button.success { background: var(--success); }
        .button.warning { background: var(--warning); }
        
        .diagnostic-info {
            background: #2d2d30;
            border-radius: 6px;
            padding: 1rem;
            margin: 1rem 0;
            font-family: 'Courier New', monospace;
            font-size: 0.8rem;
        }
        
        .module-status {
            display: flex;
            justify-content: space-between;
            margin: 0.5rem 0;
            padding: 0.3rem;
            background: rgba(255,255,255,0.05);
            border-radius: 4px;
        }
        
        .module-ok { color: var(--success); }
        .module-error { color: var(--error); }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 CSS Classes from HTML v2.0.1</h1>
        <div class="status">${statusText}</div>
    </div>

    <div class="container">
        <!-- Швидкі дії -->
        <div class="section">
            <div class="section-header">⚡ Швидкі дії</div>
            <div class="section-content">
                <button class="button success" onclick="quickGenerate()">🚀 Швидка генерація CSS</button>
                <button class="button warning" onclick="showDiagnostic()">🔍 Діагностика модулів</button>
            </div>
        </div>

        <!-- Діагностика системи -->
        <div class="section">
            <div class="section-header">📊 Статус модулів</div>
            <div class="section-content">
                <div class="diagnostic-info">
                    <div><strong>Завантажені модулі:</strong></div>
                    ${moduleStats.loadedModules.map(name => 
    `<div class="module-status">
                            <span>${name}</span>
                            <span class="module-ok">✅ OK</span>
                        </div>`
  ).join('')}
                    
                    ${moduleStats.loadingErrors.length > 0 ? 
    `<div style="margin-top: 1rem;"><strong>Помилки завантаження:</strong></div>
                        ${moduleStats.loadingErrors.map(error => 
    `<div class="module-status">
                                <span>${error.moduleName}</span>
                                <span class="module-error">❌ ${error.error}</span>
                            </div>`
  ).join('')}` : ''
}
                </div>
            </div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        function quickGenerate() {
            vscode.postMessage({ command: 'quickGenerate' });
        }

        function showDiagnostic() {
            vscode.postMessage({ command: 'showDiagnostic' });
        }
    </script>
</body>
</html>`;
}

/**
 * Налаштування обробників повідомлень
 */
function setupMessageHandlers(panel) {
  panel.webview.onDidReceiveMessage(async message => {
    try {
      switch (message.command) {
      case 'quickGenerate':
        await quickGenerateCSS();
        break;
      case 'showDiagnostic':
        const stats = moduleLoader.getLoadingStats();
        showDiagnosticInfo({ 
          success: stats.allLoaded, 
          errors: stats.loadingErrors,
          modules: stats.loadedModules 
        });
        break;
      }
    } catch (error) {
      outputChannel?.appendLine(`❌ Error handling message: ${error.message}`);
    }
  });
}

// =======================================
// ⚡ ШВИДКА ГЕНЕРАЦІЯ CSS
// =======================================

/**
 * Швидка генерація CSS
 */
async function quickGenerateCSS() {
  try {
    outputChannel?.appendLine('⚡ Quick CSS generation started...');
        
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor || activeEditor.document.languageId !== 'html') {
      vscode.window.showErrorMessage('Відкрийте HTML файл для генерації CSS');
      return;
    }
        
    const htmlContent = activeEditor.document.getText();
    if (!htmlContent.trim()) {
      vscode.window.showErrorMessage('HTML файл порожній');
      return;
    }
        
    const css = generateBasicCSS(htmlContent);
    const htmlFilePath = activeEditor.document.uri.fsPath;
        
    await saveGeneratedCSS(css, htmlFilePath);
        
    vscode.window.showInformationMessage('✅ CSS згенеровано успішно!');
    outputChannel?.appendLine('✅ Quick CSS generation completed');
        
  } catch (error) {
    const errorMessage = `❌ Quick generation failed: ${error.message}`;
    outputChannel?.appendLine(errorMessage);
    vscode.window.showErrorMessage(errorMessage);
  }
}

/**
 * Генерація базового CSS
 */
function generateBasicCSS(htmlContent) {
  let css = `/* ✅ CSS Generated by CSS Classes from HTML v2.0.1 */
/* Generated: ${new Date().toLocaleString()} */

/* Reset Styles */
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
}

/* CSS Variables */
:root {
  --primary-color: #007ACC;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #17a2b8;
  --light-color: #f8f9fa;
  --dark-color: #343a40;
}

`;

  // Витягування класів з HTML
  const classes = extractClassesFromHTML(htmlContent);
    
  if (classes.length > 0) {
    css += '/* Generated Classes */\n';
    classes.forEach(className => {
      css += `.${className} {\n  /* Add styles for ${className} here */\n}\n\n`;
    });
  }
    
  // Адаптивні стилі
  css += `/* Responsive Styles */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
  
  .hidden-mobile {
    display: none !important;
  }
}

@media (min-width: 769px) {
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .hidden-desktop {
    display: none !important;
  }
}
`;

  return css;
}

/**
 * Витягування класів з HTML
 */
function extractClassesFromHTML(htmlContent) {
  try {
    const classMatches = htmlContent.match(/class\s*=\s*["']([^"']+)["']/g) || [];
    const allClasses = new Set();

    classMatches.forEach(match => {
      const classString = match.match(/["']([^"']+)["']/)[1];
      const classes = classString.split(/\s+/).filter(cls => cls.trim());
      classes.forEach(cls => allClasses.add(cls));
    });

    return Array.from(allClasses).sort();
  } catch (error) {
    outputChannel?.appendLine(`❌ Error extracting classes: ${error.message}`);
    return [];
  }
}

/**
 * Збереження CSS файлу
 */
async function saveGeneratedCSS(cssContent, htmlFilePath) {
  try {
    const cssFilePath = htmlFilePath.replace(/\.html?$/i, '.css');
        
    await vscode.workspace.fs.writeFile(
      vscode.Uri.file(cssFilePath),
      Buffer.from(cssContent, 'utf8')
    );
        
    outputChannel?.appendLine(`✅ CSS saved to: ${cssFilePath}`);
        
    // Відкриття згенерованого файлу
    const document = await vscode.workspace.openTextDocument(cssFilePath);
    await vscode.window.showTextDocument(document, vscode.ViewColumn.Beside);
        
  } catch (error) {
    outputChannel?.appendLine(`❌ Error saving CSS: ${error.message}`);
    throw error;
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