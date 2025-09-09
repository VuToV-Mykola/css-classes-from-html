// ✅ FIX: Виправлений extension.js БЕЗ дублювання та з правильною реєстрацією команд
const vscode = require("vscode")
const path = require("path")
const fs = require("fs")

// ✅ FIX: Безпечний імпорт backend модулів з детальною обробкою помилок
let FigmaAPIClient, ImageImporter, FontImporter, IntegrationEngine;
let backendModulesLoaded = false;
const loadingErrors = [];

// Функція безпечного завантаження модуля
function safeRequire(modulePath, moduleName) {
  try {
    const module = require(modulePath);
    console.log(`✅ ${moduleName} loaded successfully`);
    return module;
  } catch (error) {
    const errorMsg = `❌ Failed to load ${moduleName}: ${error.message}`;
    console.warn(errorMsg);
    loadingErrors.push(errorMsg);
    return null;
  }
}

// Завантаження всіх backend модулів
try {
  FigmaAPIClient = safeRequire("./backend/core/FigmaAPIClient", "FigmaAPIClient");
  ImageImporter = safeRequire("./backend/utils/ImageImporter", "ImageImporter");
  FontImporter = safeRequire("./backend/utils/FontImporter", "FontImporter");
  IntegrationEngine = safeRequire("./backend/core/IntegrationEngine", "IntegrationEngine");
  
  // Перевірка чи всі модулі завантажено
  backendModulesLoaded = !!(FigmaAPIClient && ImageImporter && FontImporter && IntegrationEngine);
  
  if (backendModulesLoaded) {
    console.log('🚀 All backend modules loaded successfully - Full Figma integration available!');
  } else {
    console.warn('⚠️ Some backend modules missing - Working in basic mode');
    console.warn('📋 Loading errors:', loadingErrors);
  }
} catch (error) {
  console.error('💥 Critical error loading backend modules:', error.message);
  loadingErrors.push(`Critical error: ${error.message}`);
}

// ✅ FIX: Глобальні змінні з правильною ініціалізацією
let panel = null
let outputChannel = null
let globalConfig = {}
let integrationEngine = null


// ✅ FIX: Менеджер конфігурації з безпечною роботою з файлами
const configManager = {
  configPath: null,

  initialize: function(extensionPath) {
    const configDir = path.join(extensionPath, ".vscode", "css-classes-config")
    this.configPath = path.join(configDir, "last-settings.json")

    try {
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, {recursive: true})
      }
    } catch (error) {
      console.error("❌ Error creating config directory:", error.message)
    }
  },

  loadConfig: function() {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, "utf8")
        return JSON.parse(data)
      }
    } catch (error) {
      console.error("❌ Error loading config:", error.message)
    }
    return this.getDefaultConfig()
  },

  saveConfig: function(config) {
    try {
      const configDir = path.dirname(this.configPath)
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, {recursive: true})
      }
      const dataToSave = {
        ...config,
        timestamp: new Date().toISOString(),
        version: "0.0.7"
      }
      fs.writeFileSync(this.configPath, JSON.stringify(dataToSave, null, 2), "utf8")
      return true
    } catch (error) {
      console.error("❌ Error saving config:", error.message)
      return false
    }
  },

  getDefaultConfig: function() {
    return {
      mode: "minimal",
      figmaLink: "",
      figmaToken: "",
      selectedCanvases: [],
      selectedLayers: [],
      sidebarVisible: false,
      savedAt: new Date().toISOString(),
      version: "0.0.7"
    }
  }
}

/**
 * ✅ FIX: Правильна активація розширення БЕЗ дублювання
 */
function activate(context) {
  console.log("🚀 CSS Classes from HTML v0.0.7 activating...")
  
  try {
    // ✅ FIX: Ініціалізація менеджера конфігурації
    configManager.initialize(context.extensionPath)
    
    // ✅ FIX: Створення output channel
    outputChannel = vscode.window.createOutputChannel("CSS Classes from HTML")
    outputChannel.appendLine("🚀 Extension starting...")
    
    // ✅ FIX: Безпечна ініціалізація Integration Engine з детальною перевіркою
    if (IntegrationEngine && backendModulesLoaded) {
      try {
        integrationEngine = new IntegrationEngine({
          figmaToken: "",
          confidenceThreshold: 0.7,
          generateResponsive: true,
          mode: "minimal"
        });
        outputChannel.appendLine("✅ Integration Engine initialized - Full Figma mode available");
      } catch (error) {
        outputChannel.appendLine(`❌ Integration Engine initialization failed: ${error.message}`);
        integrationEngine = null;
      }
    } else {
      outputChannel.appendLine(`⚠️ Integration Engine not available - Working in basic mode`);
      if (loadingErrors.length > 0) {
        outputChannel.appendLine(`📋 Module loading issues:`);
        loadingErrors.forEach(err => outputChannel.appendLine(`   • ${err}`));
      }
      integrationEngine = null;
    }
    
    // ✅ FIX: Реєстрація всіх команд з package.json
    const commands = []
    
    // Команда 1: css-classes.showMenu
    commands.push(vscode.commands.registerCommand("css-classes.showMenu", async () => {
      outputChannel.appendLine("🎯 Command 'css-classes.showMenu' executed")
      await openMainMenu(context)
    }))
    
    // Команда 2: css-classes.showMenuFromContext  
    commands.push(vscode.commands.registerCommand("css-classes.showMenuFromContext", async (uri) => {
      outputChannel.appendLine("🎯 Command 'css-classes.showMenuFromContext' executed")
      outputChannel.appendLine(`📂 URI: ${uri ? uri.fsPath : 'undefined'}`)
      await openMainMenu(context)
    }))
    
    // Команда 3: css-classes.quickGenerate
    commands.push(vscode.commands.registerCommand("css-classes.quickGenerate", async (args) => {
      outputChannel.appendLine("🎯 Command 'css-classes.quickGenerate' executed")
      await quickGenerateCSS(args)
    }))
    
    // Команда 4: extension.cssClassesFromHtml (для зворотної сумісності)
    commands.push(vscode.commands.registerCommand("extension.cssClassesFromHtml", async () => {
      outputChannel.appendLine("🎯 Command 'extension.cssClassesFromHtml' executed")
      await openMainMenu(context)
    }))
    
    outputChannel.appendLine(`✅ Registered ${commands.length} commands successfully`)
    
    // ✅ FIX: Додавання всіх ресурсів до subscriptions
    context.subscriptions.push(...commands, outputChannel)
    
    outputChannel.appendLine("✅ Extension fully activated!")
    console.log("✅ CSS Classes from HTML v0.0.7 activated successfully!")
    
    return {
      success: true,
      commandsCount: commands.length,
      version: "0.0.7"
    }
    
  } catch (error) {
    const errorMessage = `💥 Fatal error during activation: ${error.message}`
    console.error(errorMessage)
    console.error("Stack trace:", error.stack)
    
    if (outputChannel) {
      outputChannel.appendLine(errorMessage)
      outputChannel.appendLine(`Stack: ${error.stack}`)
    }
    
    // ✅ FIX: Показати помилку користувачу
    vscode.window.showErrorMessage(`CSS Classes from HTML activation failed: ${error.message}`)
    
    throw error
  }
}

/**
 * ✅ FIX: Відкриття головного меню з правильним завантаженням WebView
 */
async function openMainMenu(context) {
  try {
    outputChannel?.appendLine("📋 Opening main menu...")
    
    // ✅ FIX: Створення або фокусування панелі
    if (panel) {
      panel.reveal(vscode.ViewColumn.One)
      outputChannel?.appendLine("📋 Panel revealed")
      return
    }
    
    // ✅ FIX: Створення нової панелі
    panel = vscode.window.createWebviewPanel(
      'cssClassesMenu',
      'CSS Classes from HTML v0.0.7',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.file(context.extensionPath)]
      }
    )
    
    // ✅ FIX: Завантаження HTML контенту
    const htmlPath = path.join(context.extensionPath, 'frontend', 'css-classes-from-html-menu.html')
    
    if (!fs.existsSync(htmlPath)) {
      throw new Error(`WebView HTML file not found: ${htmlPath}`)
    }
    
    let htmlContent = fs.readFileSync(htmlPath, 'utf8')
    
    // ✅ FIX: Конвертація локальних ресурсів для WebView
    const baseUri = panel.webview.asWebviewUri(vscode.Uri.file(context.extensionPath))
    htmlContent = htmlContent.replace(/href="([^"]*\.css)"/g, `href="${baseUri}/$1"`)
    htmlContent = htmlContent.replace(/src="([^"]*\.js)"/g, `src="${baseUri}/$1"`)
    
    panel.webview.html = htmlContent
    
    // ✅ FIX: Налаштування обробників повідомлень
    setupMessageHandlers(panel, context)
    
    // ✅ FIX: Обробка закриття панелі
    panel.onDidDispose(() => {
      panel = null
      outputChannel?.appendLine("📋 Panel disposed")
    })
    
    outputChannel?.appendLine("✅ Main menu opened successfully")
    
  } catch (error) {
    const errorMessage = `❌ Error opening menu: ${error.message}`
    outputChannel?.appendLine(errorMessage)
    vscode.window.showErrorMessage(errorMessage)
    throw error
  }
}

/**
 * ✅ FIX: Правильна обробка повідомлень WebView
 */
function setupMessageHandlers(panel, context) {
  panel.webview.onDidReceiveMessage(async message => {
    try {
      outputChannel?.appendLine(`📨 Received message: ${message.command}`)
      
      switch (message.command) {
        case 'getFigmaCanvases':
          await handleGetFigmaCanvases(panel, message)
          break
          
        case 'getFigmaLayers':
          await handleGetFigmaLayers(panel, message)
          break
          
        case 'getLayerStyles':
          await handleGetLayerStyles(panel, message)
          break
          
        case 'importImages':
          await handleImportImages(panel, message)
          break
          
        case 'importFonts':
          await handleImportFonts(panel, message)
          break
          
        case 'copyToClipboard':
          await handleCopyToClipboard(panel, message)
          break
          
        case 'loadLastSettings':
          await handleLoadSettings(panel)
          break
          
        case 'saveCurrentSettings':
          await handleSaveSettings(panel, message.settings)
          break
          
        case 'clearSettings':
          await handleClearSettings(panel)
          break
          
        case 'generateCSS':
          await handleGenerateCSS(panel, message.settings)
          break
          
        default:
          outputChannel?.appendLine(`⚠️ Unknown command: ${message.command}`)
          panel.webview.postMessage({
            command: "error",
            message: `Unknown command: ${message.command}`
          })
          break
      }
      
    } catch (error) {
      const errorMessage = `❌ Error handling message: ${error.message}`
      outputChannel?.appendLine(errorMessage)
      panel.webview.postMessage({
        command: "error", 
        message: errorMessage
      })
    }
  })
}

/**
 * ✅ FIX: Обробка Figma Canvas з детальною перевіркою доступності
 */
async function handleGetFigmaCanvases(panel, message) {
  try {
    // Детальна перевірка доступності Integration Engine
    if (!integrationEngine) {
      const errorMessage = backendModulesLoaded ? 
        "Integration Engine failed to initialize" : 
        "Backend modules not loaded - check installation";
      
      outputChannel?.appendLine(`❌ ${errorMessage}`);
      if (loadingErrors.length > 0) {
        outputChannel?.appendLine(`📋 Specific errors:`);
        loadingErrors.forEach(err => outputChannel?.appendLine(`   • ${err}`));
      }
      
      throw new Error(errorMessage);
    }
    
    if (!message.figmaToken) {
      throw new Error("Figma API token is required")
    }
    
    // ✅ FIX: Оновлення токену
    integrationEngine.updateOptions({
      figmaToken: message.figmaToken
    })
    
    // ✅ FIX: Витягування file ID з посилання
    const fileId = integrationEngine.extractFileIdFromFigmaLink(message.figmaLink)
    if (!fileId) {
      throw new Error("Invalid Figma link format")
    }
    
    outputChannel?.appendLine(`🎨 Loading Canvas from Figma file: ${fileId}`)
    
    // ✅ FIX: Отримання Canvas з Figma
    const canvases = await integrationEngine.getFigmaCanvases(fileId)
    
    panel.webview.postMessage({
      command: "figmaCanvases",
      canvases: canvases,
      success: true
    })
    
    outputChannel?.appendLine(`✅ Loaded ${canvases.length} Canvas successfully`)
    
  } catch (error) {
    outputChannel?.appendLine(`❌ Error getting Canvas: ${error.message}`)
    panel.webview.postMessage({
      command: "figmaCanvases",
      canvases: [],
      success: false,
      error: error.message
    })
  }
}

/**
 * ✅ FIX: Обробка Figma Layers
 */
async function handleGetFigmaLayers(panel, message) {
  try {
    if (!integrationEngine) {
      const errorMessage = backendModulesLoaded ? 
        "Integration Engine failed to initialize" : 
        "Backend modules not loaded - check installation";
      throw new Error(errorMessage);
    }
    
    const fileId = integrationEngine.extractFileIdFromFigmaLink(message.figmaLink)
    if (!fileId) {
      throw new Error("Invalid Figma link format")
    }
    
    outputChannel?.appendLine(`🎨 Loading Layers from Figma...`)
    
    const layers = await integrationEngine.getFigmaLayers(fileId, message.canvasIds)
    
    panel.webview.postMessage({
      command: "figmaLayers", 
      layers: layers,
      success: true
    })
    
    outputChannel?.appendLine(`✅ Loaded ${layers.length} Layers successfully`)
    
  } catch (error) {
    outputChannel?.appendLine(`❌ Error getting Layers: ${error.message}`)
    panel.webview.postMessage({
      command: "figmaLayers",
      layers: [],
      success: false,
      error: error.message
    })
  }
}

/**
 * ✅ FIX: Обробка стилів Layer
 */
async function handleGetLayerStyles(panel, message) {
  try {
    if (!integrationEngine) {
      const errorMessage = backendModulesLoaded ? 
        "Integration Engine failed to initialize" : 
        "Backend modules not loaded - check installation";
      throw new Error(errorMessage);
    }
    
    const fileId = integrationEngine.extractFileIdFromFigmaLink(message.figmaLink)
    const styles = await integrationEngine.getLayerStyles(fileId, message.layerIds)
    
    panel.webview.postMessage({
      command: "layerStyles",
      styles: styles,
      success: true
    })
    
  } catch (error) {
    outputChannel?.appendLine(`❌ Error getting layer styles: ${error.message}`)
    panel.webview.postMessage({
      command: "layerStyles",
      styles: [],
      success: false,
      error: error.message
    })
  }
}

/**
 * ✅ FIX: Імпорт зображень 
 */
async function handleImportImages(panel, message) {
  try {
    if (!ImageImporter) {
      throw new Error("Image Importer not available")
    }
    
    if (!integrationEngine || !message.figmaToken) {
      throw new Error("Figma token and integration engine required")
    }
    
    outputChannel?.appendLine("🖼️ Starting image import...")
    
    const importer = new ImageImporter({
      outputDir: "images",
      optimizeImages: true,
      formats: ["png", "jpg", "svg"],
      scales: [1, 2]
    })
    
    // ✅ FIX: Оновлення токену в integration engine
    integrationEngine.updateOptions({
      figmaToken: message.figmaToken
    })
    
    const fileId = integrationEngine.extractFileIdFromFigmaLink(message.figmaLink)
    if (!fileId) {
      throw new Error("Invalid Figma link format")
    }
    
    // ✅ FIX: Реальний імпорт зображень
    const result = await importer.importImages(
      integrationEngine.figmaClient,
      fileId,
      message.selectedLayers || []
    )
    
    const stats = importer.getImportStats(result.images)
    
    panel.webview.postMessage({
      command: "imagesImported",
      success: true,
      stats: stats,
      images: result.images.length,
      cssFile: result.cssFile
    })
    
    outputChannel?.appendLine(`✅ Images imported successfully: ${stats.imagesCount} images, ${stats.totalSize}`)
    
  } catch (error) {
    outputChannel?.appendLine(`❌ Error importing images: ${error.message}`)
    panel.webview.postMessage({
      command: "imagesImported",
      success: false,
      error: error.message
    })
  }
}

/**
 * ✅ FIX: Імпорт шрифтів
 */
async function handleImportFonts(panel, message) {
  try {
    if (!FontImporter) {
      throw new Error("Font Importer not available")
    }
    
    if (!integrationEngine || !message.figmaToken) {
      throw new Error("Figma token and integration engine required")
    }
    
    outputChannel?.appendLine("🔤 Starting font import...")
    
    const importer = new FontImporter({
      outputDir: ".",
      includeAllWeights: true,
      includeAllStyles: true,
      display: "swap"
    })
    
    // ✅ FIX: Оновлення токену в integration engine
    integrationEngine.updateOptions({
      figmaToken: message.figmaToken
    })
    
    const fileId = integrationEngine.extractFileIdFromFigmaLink(message.figmaLink)
    if (!fileId) {
      throw new Error("Invalid Figma link format")
    }
    
    // ✅ FIX: Реальний імпорт шрифтів
    const result = await importer.importFonts(
      integrationEngine.figmaClient,
      fileId,
      message.selectedLayers || []
    )
    
    const stats = importer.getImportStats(result.fonts)
    
    panel.webview.postMessage({
      command: "fontsImported",
      success: true,
      stats: stats,
      fonts: result.fonts.length,
      cssFile: result.cssFile,
      htmlFile: result.htmlFile,
      imports: result.imports
    })
    
    outputChannel?.appendLine(`✅ Fonts imported successfully: ${stats.totalFonts} fonts, ${stats.successRate}% available on Google Fonts`)
    
  } catch (error) {
    outputChannel?.appendLine(`❌ Error importing fonts: ${error.message}`)
    panel.webview.postMessage({
      command: "fontsImported",
      success: false,
      error: error.message
    })
  }
}

/**
 * ✅ FIX: Копіювання в буфер обміну
 */
async function handleCopyToClipboard(panel, message) {
  try {
    await vscode.env.clipboard.writeText(message.content)
    
    panel.webview.postMessage({
      command: "clipboardCopied",
      success: true
    })
    
    outputChannel?.appendLine("✅ Content copied to clipboard")
    
  } catch (error) {
    outputChannel?.appendLine(`❌ Error copying to clipboard: ${error.message}`)
    panel.webview.postMessage({
      command: "clipboardCopied",
      success: false,
      error: error.message
    })
  }
}

/**
 * ✅ FIX: Завантаження налаштувань
 */
async function handleLoadSettings(panel) {
  try {
    const settings = configManager.loadConfig()
    
    panel.webview.postMessage({
      command: "lastSettingsLoaded",
      settings: settings,
      success: true
    })
    
    outputChannel?.appendLine("✅ Settings loaded successfully")
    
  } catch (error) {
    outputChannel?.appendLine(`❌ Error loading settings: ${error.message}`)
    panel.webview.postMessage({
      command: "lastSettingsLoaded",
      settings: null,
      success: false,
      error: error.message
    })
  }
}

/**
 * ✅ FIX: Збереження налаштувань
 */
async function handleSaveSettings(panel, settings) {
  try {
    const saved = configManager.saveConfig(settings)
    
    panel.webview.postMessage({
      command: "settingsSaved",
      success: saved
    })
    
    if (saved) {
      outputChannel?.appendLine("✅ Settings saved successfully")
    } else {
      outputChannel?.appendLine("⚠️ Settings save failed")
    }
    
  } catch (error) {
    outputChannel?.appendLine(`❌ Error saving settings: ${error.message}`)
    panel.webview.postMessage({
      command: "settingsSaved",
      success: false,
      error: error.message
    })
  }
}

/**
 * ✅ FIX: Очищення налаштувань
 */
async function handleClearSettings(panel) {
  try {
    const defaultSettings = configManager.getDefaultConfig()
    configManager.saveConfig(defaultSettings)
    
    panel.webview.postMessage({
      command: "settingsCleared",
      success: true
    })
    
    outputChannel?.appendLine("✅ Settings cleared successfully")
    
  } catch (error) {
    outputChannel?.appendLine(`❌ Error clearing settings: ${error.message}`)
    panel.webview.postMessage({
      command: "settingsCleared",
      success: false,
      error: error.message
    })
  }
}

/**
 * ✅ FIX: Генерація CSS
 */
async function handleGenerateCSS(panel, settings) {
  try {
    outputChannel?.appendLine("🚀 Starting CSS generation...")
    
    // ✅ FIX: Отримання активного HTML файлу
    const activeEditor = vscode.window.activeTextEditor
    if (!activeEditor || activeEditor.document.languageId !== 'html') {
      throw new Error("Please open an HTML file first")
    }
    
    const htmlContent = activeEditor.document.getText()
    if (!htmlContent.trim()) {
      throw new Error("HTML file is empty")
    }
    
    let css = ""
    
    // ✅ FIX: Генерація відповідно до режиму
    if (settings.mode === "minimal") {
      css = generateMinimalCSS(htmlContent)
    } else if (settings.mode === "maximum" && integrationEngine) {
      // ✅ FIX: Повна генерація з Figma (якщо доступна)
      if (settings.figmaLink && settings.figmaToken) {
        const fileId = integrationEngine.extractFileIdFromFigmaLink(settings.figmaLink)
        if (fileId) {
          const result = await integrationEngine.generateCSS(fileId, htmlContent, {
            figmaToken: settings.figmaToken,
            selectedCanvases: settings.selectedCanvases,
            selectedLayers: settings.selectedLayers
          })
          css = result.css
        } else {
          css = generateMinimalCSS(htmlContent)
        }
      } else {
        css = generateMinimalCSS(htmlContent)
      }
    } else {
      css = generateMinimalCSS(htmlContent)
    }
    
    // ✅ FIX: Збереження CSS файлу
    const htmlFilePath = activeEditor.document.uri.fsPath
    await saveGeneratedCSS(css, htmlFilePath)
    
    panel.webview.postMessage({
      command: "generationComplete",
      success: true,
      css: css,
      message: "CSS generated successfully!"
    })
    
    outputChannel?.appendLine("✅ CSS generation completed successfully")
    
  } catch (error) {
    outputChannel?.appendLine(`❌ Error in CSS generation: ${error.message}`)
    panel.webview.postMessage({
      command: "generationComplete",
      success: false,
      error: error.message
    })
  }
}

/**
 * ✅ FIX: Швидка генерація CSS
 */
async function quickGenerateCSS() {
  try {
    outputChannel?.appendLine("⚡ Quick CSS generation started...")
    
    const activeEditor = vscode.window.activeTextEditor
    if (!activeEditor || activeEditor.document.languageId !== 'html') {
      vscode.window.showErrorMessage("Please open an HTML file first")
      return
    }
    
    const htmlContent = activeEditor.document.getText()
    const css = generateMinimalCSS(htmlContent)
    
    const htmlFilePath = activeEditor.document.uri.fsPath
    await saveGeneratedCSS(css, htmlFilePath)
    
    vscode.window.showInformationMessage("✅ CSS generated successfully!")
    outputChannel?.appendLine("✅ Quick CSS generation completed")
    
  } catch (error) {
    const errorMessage = `❌ Quick generation failed: ${error.message}`
    outputChannel?.appendLine(errorMessage)
    vscode.window.showErrorMessage(errorMessage)
    throw error
  }
}

/**
 * ✅ FIX: Мінімальна генерація CSS
 */
function generateMinimalCSS(htmlContent) {
  try {
    let css = ""
    
    // ✅ FIX: Заголовок
    css += `/* ✅ CSS Generated by CSS Classes from HTML v0.0.7 */\n`
    css += `/* Generated: ${new Date().toLocaleString()} */\n\n`
    
    // ✅ FIX: Reset стилі
    css += generateResetCSS()
    
    // ✅ FIX: CSS змінні
    css += generateCSSVariables()
    
    // ✅ FIX: Витягування та генерація класів
    const classes = extractClassesFromHTML(htmlContent)
    css += generateHTMLBasedCSS(classes)
    
    // ✅ FIX: Адаптивні стилі
    css += generateResponsiveCSS()
    
    return css
    
  } catch (error) {
    outputChannel?.appendLine(`❌ Error generating minimal CSS: ${error.message}`)
    return `/* ❌ Error generating CSS: ${error.message} */\n`
  }
}

/**
 * ✅ FIX: Reset стилі
 */
function generateResetCSS() {
  return (
    `/* ✅ RESET STYLES */\n` +
    `*,\n*::before,\n*::after {\n` +
    `  margin: 0;\n` +
    `  padding: 0;\n` +
    `  box-sizing: border-box;\n` +
    `}\n\n` +
    `body {\n` +
    `  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n` +
    `  line-height: 1.5;\n` +
    `  color: var(--text-color);\n` +
    `  background-color: var(--background-color);\n` +
    `}\n\n`
  )
}

/**
 * ✅ FIX: CSS змінні
 */
function generateCSSVariables() {
  return (
    `/* ✅ CSS VARIABLES */\n` +
    `:root {\n` +
    `  /* Colors */\n` +
    `  --primary-color: #007ACC;\n` +
    `  --secondary-color: #6c757d;\n` +
    `  --success-color: #28a745;\n` +
    `  --danger-color: #dc3545;\n` +
    `  --warning-color: #ffc107;\n` +
    `  --info-color: #17a2b8;\n` +
    `  --light-color: #f8f9fa;\n` +
    `  --dark-color: #343a40;\n` +
    `  --text-color: #212529;\n` +
    `  --background-color: #ffffff;\n` +
    `  \n` +
    `  /* Spacing */\n` +
    `  --spacing-xs: 0.25rem;\n` +
    `  --spacing-sm: 0.5rem;\n` +
    `  --spacing-md: 1rem;\n` +
    `  --spacing-lg: 1.5rem;\n` +
    `  --spacing-xl: 2rem;\n` +
    `  --spacing-xxl: 3rem;\n` +
    `  \n` +
    `  /* Breakpoints */\n` +
    `  --breakpoint-sm: 576px;\n` +
    `  --breakpoint-md: 768px;\n` +
    `  --breakpoint-lg: 992px;\n` +
    `  --breakpoint-xl: 1200px;\n` +
    `  --breakpoint-xxl: 1400px;\n` +
    `}\n\n`
  )
}

/**
 * ✅ FIX: Генерація CSS на основі HTML класів
 */
function generateHTMLBasedCSS(classes) {
  let cssContent = `/* ✅ CLASS RULES */\n`

  if (classes.length === 0) {
    cssContent += `/* ❌ No CSS classes found in HTML */\n\n`
  } else {
    classes.forEach(className => {
      cssContent += `.${className} {\n`
      cssContent += `  /* ✅ Add styles for ${className} here */\n`
      cssContent += `}\n\n`
    })
  }

  return cssContent
}

/**
 * ✅ FIX: Адаптивні стилі
 */
function generateResponsiveCSS() {
  return (
    `/* ✅ RESPONSIVE STYLES */\n` +
    `@media (max-width: 768px) {\n` +
    `  .container {\n` +
    `    padding: var(--spacing-md);\n` +
    `  }\n` +
    `  \n` +
    `  .hidden-tablet {\n` +
    `    display: none;\n` +
    `  }\n` +
    `}\n\n` +
    `@media (min-width: 1025px) {\n` +
    `  .container {\n` +
    `    padding: var(--spacing-lg);\n` +
    `    max-width: 1200px;\n` +
    `    margin: 0 auto;\n` +
    `  }\n` +
    `  \n` +
    `  .hidden-desktop {\n` +
    `    display: none;\n` +
    `  }\n` +
    `}\n`
  )
}

/**
 * ✅ FIX: Витягування класів з HTML
 */
function extractClassesFromHTML(htmlContent) {
  try {
    const classMatches = htmlContent.match(/class\s*=\s*["']([^"']+)["']/g) || []
    const allClasses = new Set()

    classMatches.forEach(match => {
      const classString = match.match(/["']([^"']+)["']/)[1]
      const classes = classString.split(/\s+/).filter(cls => cls.trim())
      classes.forEach(cls => allClasses.add(cls))
    })

    return Array.from(allClasses).sort()
    
  } catch (error) {
    outputChannel?.appendLine(`❌ Error extracting classes: ${error.message}`)
    return []
  }
}

/**
 * ✅ FIX: Збереження згенерованого CSS
 */
async function saveGeneratedCSS(cssContent, htmlFilePath) {
  try {
    const cssFilePath = htmlFilePath.replace(/\.html?$/, '.css')
    
    await vscode.workspace.fs.writeFile(
      vscode.Uri.file(cssFilePath),
      Buffer.from(cssContent, 'utf8')
    )
    
    outputChannel?.appendLine(`✅ CSS saved to: ${cssFilePath}`)
    
    // ✅ FIX: Відкриття згенерованого CSS файлу
    await openGeneratedCSSFile(cssFilePath)
    
    vscode.window.showInformationMessage(
      `✅ CSS generated and saved: ${cssFilePath.split('/').pop()}`
    )
    
  } catch (error) {
    outputChannel?.appendLine(`❌ Error saving CSS: ${error.message}`)
    throw new Error(`❌ Failed to save CSS: ${error.message}`)
  }
}

/**
 * ✅ FIX: Відкриття згенерованого CSS файлу
 */
async function openGeneratedCSSFile(cssFilePath) {
  try {
    const document = await vscode.workspace.openTextDocument(cssFilePath)
    await vscode.window.showTextDocument(document, vscode.ViewColumn.Beside)
    
    outputChannel?.appendLine(`✅ CSS file opened: ${cssFilePath}`)
    
  } catch (error) {
    outputChannel?.appendLine(`❌ Failed to open CSS file: ${error.message}`)
    vscode.window.showWarningMessage(`❌ Could not open file: ${cssFilePath.split('/').pop()}`)
  }
}

/**
 * ✅ FIX: Деактивація розширення
 */
function deactivate() {
  console.log("🔄 CSS Classes from HTML v0.0.7 deactivating...")
  
  try {
    // ✅ FIX: Закриття панелі при деактивації
    if (panel) {
      panel.dispose()
      panel = null
    }
    
    // ✅ FIX: Закриття output channel
    if (outputChannel) {
      outputChannel.dispose()
      outputChannel = null
    }
    
    // ✅ FIX: Очищення глобальних змінних
    integrationEngine = null
    globalConfig = {}
    
    console.log("✅ Extension deactivated successfully")
    
  } catch (error) {
    console.error("❌ Error during deactivation:", error.message)
  }
}

// ✅ FIX: Правильний експорт модуля
module.exports = {
  activate,
  deactivate
}