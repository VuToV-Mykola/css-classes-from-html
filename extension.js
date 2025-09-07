// ✅ FIX: Extension.js БЕЗ Mock даних з реальною Figma інтеграцією
const vscode = require("vscode")
const path = require("path")
const fs = require("fs")

// ✅ FIX: Імпорт реальних модулів
const FigmaAPIClient = require("./backend/core/FigmaAPIClient")
const ImageImporter = require("./backend/utils/ImageImporter")
const FontImporter = require("./backend/utils/FontImporter")
const IntegrationEngine = require("./backend/core/IntegrationEngine")

// ✅ FIX: Глобальні змінні
let panel = null
let outputChannel = null
let globalConfig = {}
let integrationEngine = null

const configManager = {
  configPath: null,

  initialize(extensionPath) {
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

  loadConfig() {
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

  saveConfig(config) {
    try {
      const configDir = path.dirname(this.configPath)
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, {recursive: true})
      }
      const dataToSave = {
        ...config,
        timestamp: new Date().toISOString(),
        version: "4.0.0"
      }
      fs.writeFileSync(this.configPath, JSON.stringify(dataToSave, null, 2), "utf8")
      return true
    } catch (error) {
      console.error("❌ Error saving config:", error.message)
      return false
    }
  },

  getDefaultConfig() {
    return {
      mode: "minimal",
      figmaLink: "",
      figmaToken: "",
      selectedCanvases: [],
      selectedLayers: [],
      sidebarVisible: false,
      savedAt: new Date().toISOString(),
      version: "4.0.0"
    }
  }
}

/**
 * ✅ FIX: Активація розширення
 */
function activate(context) {
  console.log("🚀 CSS Classes from HTML v4.0 activating...")

  try {
    configManager.initialize(context.extensionPath)
    globalConfig = configManager.loadConfig()

    outputChannel = vscode.window.createOutputChannel("CSS Classes from HTML")
    outputChannel.show(true)
    outputChannel.appendLine("✅ Extension v4.0 activated successfully")

    // ✅ FIX: Ініціалізація IntegrationEngine
    integrationEngine = new IntegrationEngine({
      figmaToken: globalConfig.figmaToken,
      optimizeCSS: true,
      generateResponsive: true
    })

    // ✅ FIX: Реєстрація команд
    const commands = [
      vscode.commands.registerCommand("css-classes.showMenu", async () => {
        outputChannel.appendLine("🎯 Command 'css-classes.showMenu' executed")
        await openMainMenu(context)
      }),

      vscode.commands.registerCommand("css-classes.showMenuFromContext", async uri => {
        outputChannel.appendLine("🎯 Command 'css-classes.showMenuFromContext' executed")
        await openMainMenu(context)
      }),

      vscode.commands.registerCommand("css-classes.quickGenerate", async args => {
        outputChannel.appendLine("🎯 Command 'css-classes.quickGenerate' executed")
        await quickGenerateCSS(args)
      })
    ]

    context.subscriptions.push(...commands, outputChannel)

    outputChannel.appendLine(`✅ Extension fully activated with ${commands.length} commands!`)
    return {success: true, commandsCount: commands.length}
  } catch (error) {
    console.error("❌ Fatal error during activation:", error)
    outputChannel?.appendLine(`💥 FATAL ACTIVATION ERROR: ${error.message}`)
    throw error
  }
}

/**
 * ✅ FIX: Відкриття головного меню
 */
async function openMainMenu(context) {
  try {
    if (panel) {
      panel.reveal(vscode.ViewColumn.One)
      outputChannel?.appendLine("📋 Revealing existing panel")
      return
    }

    outputChannel?.appendLine("🔧 Creating new WebView panel...")

    panel = vscode.window.createWebviewPanel(
      "cssClassesMenu",
      "CSS Classes from HTML v4.0",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, "frontend"))]
      }
    )

    const htmlPath = path.join(context.extensionPath, "frontend", "css-classes-from-html-menu.html")

    if (!fs.existsSync(htmlPath)) {
      outputChannel?.appendLine(`❌ Menu HTML not found at: ${htmlPath}`)
      throw new Error(`Menu HTML file not found: ${htmlPath}`)
    }

    let htmlContent = fs.readFileSync(htmlPath, "utf8")
    panel.webview.html = htmlContent

    setupMessageHandlers(panel, context)

    panel.onDidDispose(() => {
      panel = null
      outputChannel?.appendLine("🗑️ Panel disposed")
    })

    outputChannel?.appendLine("✅ Menu opened successfully")
  } catch (error) {
    outputChannel?.appendLine(`❌ Error opening menu: ${error.message}`)
    vscode.window.showErrorMessage(`Помилка відкриття меню: ${error.message}`)
    throw error
  }
}

/**
 * ✅ FIX: Обробники повідомлень WebView БЕЗ Mock даних
 */
function setupMessageHandlers(panel, context) {
  panel.webview.onDidReceiveMessage(async message => {
    outputChannel?.appendLine(`📨 Received: ${message.command}`)

    try {
      switch (message.command) {
        case "loadLastSettings":
          await handleLoadSettings(panel)
          break
        case "saveCurrentSettings":
          await handleSaveSettings(panel, message.settings)
          break
        case "generateCSS":
          await handleGenerateCSS(panel, message.settings)
          break
        case "clearSettings":
          await handleClearSettings(panel)
          break
        case "getFigmaCanvases":
          await handleGetFigmaCanvases(panel, message)
          break
        case "getFigmaLayers":
          await handleGetFigmaLayers(panel, message)
          break
        case "getLayerStyles":
          await handleGetLayerStyles(panel, message)
          break
        case "importImages":
          await handleImportImages(panel, message)
          break
        case "importFonts":
          await handleImportFonts(panel, message)
          break
        case "copyToClipboard":
          await handleCopyToClipboard(panel, message)
          break
        default:
          outputChannel?.appendLine(`❓ Unknown command: ${message.command}`)
      }
    } catch (error) {
      outputChannel?.appendLine(`❌ Error handling message: ${error.message}`)
      panel.webview.postMessage({
        command: "error",
        message: error.message
      })
    }
  })
}

/**
 * ✅ FIX: Реальна обробка Figma Canvas
 */
async function handleGetFigmaCanvases(panel, message) {
  try {
    outputChannel?.appendLine("🎨 Getting REAL Figma canvases...")
    outputChannel?.appendLine(`🔗 Figma link: ${message.figmaLink}`)

    if (!message.figmaLink) {
      throw new Error("❌ Figma посилання не надано")
    }

    const fileId = extractFileIdFromFigmaLink(message.figmaLink)
    if (!fileId) {
      throw new Error("❌ Невірний формат Figma посилання")
    }

    outputChannel?.appendLine(`📁 Extracted file ID: ${fileId}`)

    // ✅ FIX: Реальна робота з Figma API
    if (!message.figmaToken) {
      throw new Error("❌ Figma API токен обов'язковий для доступу до файлів")
    }

    const figmaClient = new FigmaAPIClient(message.figmaToken)
    const canvases = await figmaClient.getCanvases(fileId)

    panel.webview.postMessage({
      command: "figmaCanvases",
      canvases: canvases,
      fileId: fileId
    })

    outputChannel?.appendLine(`✅ Sent ${canvases.length} real canvases from Figma`)
  } catch (error) {
    outputChannel?.appendLine(`❌ Error getting canvases: ${error.message}`)
    panel.webview.postMessage({
      command: "figmaCanvases",
      canvases: [],
      error: error.message
    })
  }
}

/**
 * ✅ FIX: Реальна обробка Figma Layers
 */
async function handleGetFigmaLayers(panel, message) {
  try {
    outputChannel?.appendLine("🎨 Getting REAL Figma layers...")
    outputChannel?.appendLine(`📋 Canvas IDs: ${JSON.stringify(message.canvasIds)}`)

    if (!message.figmaLink || !message.canvasIds || !message.figmaToken) {
      throw new Error("❌ Не вистачає даних для завантаження Layers")
    }

    const fileId = extractFileIdFromFigmaLink(message.figmaLink)
    if (!fileId) {
      throw new Error("❌ Невірний формат Figma посилання")
    }

    // ✅ FIX: Реальна робота з Figma API
    const figmaClient = new FigmaAPIClient(message.figmaToken)
    const layers = await figmaClient.getLayers(fileId, message.canvasIds)

    panel.webview.postMessage({
      command: "figmaLayers",
      layers: layers,
      canvasIds: message.canvasIds
    })

    outputChannel?.appendLine(`✅ Sent ${layers.length} real layers from Figma`)
  } catch (error) {
    outputChannel?.appendLine(`❌ Error getting layers: ${error.message}`)
    panel.webview.postMessage({
      command: "figmaLayers",
      layers: [],
      error: error.message
    })
  }
}

/**
 * ✅ FIX: Реальна обробка стилів Layers
 */
async function handleGetLayerStyles(panel, message) {
  try {
    outputChannel?.appendLine("🎨 Getting REAL layer styles...")
    outputChannel?.appendLine(`🎯 Layer IDs: ${JSON.stringify(message.layerIds)}`)

    if (
      !message.figmaLink ||
      !message.layerIds ||
      message.layerIds.length === 0 ||
      !message.figmaToken
    ) {
      throw new Error("❌ Не вистачає даних для завантаження стилів")
    }

    const fileId = extractFileIdFromFigmaLink(message.figmaLink)
    if (!fileId) {
      throw new Error("❌ Невірний формат Figma посилання")
    }

    // ✅ FIX: Реальна робота з Figma API
    const figmaClient = new FigmaAPIClient(message.figmaToken)
    const styles = await figmaClient.getLayerStyles(fileId, message.layerIds)

    panel.webview.postMessage({
      command: "layerStyles",
      styles: styles,
      layerIds: message.layerIds
    })

    outputChannel?.appendLine(`✅ Sent real styles for ${styles.length} layers`)
  } catch (error) {
    outputChannel?.appendLine(`❌ Error getting layer styles: ${error.message}`)
    panel.webview.postMessage({
      command: "layerStyles",
      styles: [],
      error: error.message
    })
  }
}

/**
 * ✅ FIX: Імпорт зображень з Figma
 */
async function handleImportImages(panel, message) {
  try {
    outputChannel?.appendLine("🖼️ Starting image import from Figma...")

    if (!message.figmaLink || !message.figmaToken) {
      throw new Error("❌ Потрібен Figma файл та токен для імпорту зображень")
    }

    const fileId = extractFileIdFromFigmaLink(message.figmaLink)
    if (!fileId) {
      throw new Error("❌ Невірний формат Figma посилання")
    }

    // ✅ FIX: Визначення папки для зображень
    const activeEditor = vscode.window.activeTextEditor
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
    const outputDir = activeEditor
      ? path.join(path.dirname(activeEditor.document.uri.fsPath), "images")
      : workspaceRoot
        ? path.join(workspaceRoot, "images")
        : path.join(process.cwd(), "images")

    // ✅ FIX: Реальний імпорт зображень
    const figmaClient = new FigmaAPIClient(message.figmaToken)
    const imageImporter = new ImageImporter({
      outputDir: outputDir,
      optimizeImages: true,
      formats: ["png", "svg", "jpg"],
      scales: [1, 2]
    })

    const result = await imageImporter.importImages(
      figmaClient,
      fileId,
      message.selectedLayers || []
    )

    // ✅ FIX: Генерація SVG sprite
    if (result.images.some(img => img.files.some(f => f.format === "svg"))) {
      const spriteResult = await imageImporter.generateSVGSprite(result.images)
      if (spriteResult) {
        result.sprite = spriteResult
      }
    }

    panel.webview.postMessage({
      command: "imagesImported",
      success: true,
      result: result,
      stats: imageImporter.getImportStats(result.images)
    })

    outputChannel?.appendLine(
      `✅ Images import completed: ${result.images.length} images processed`
    )
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
 * ✅ FIX: Імпорт шрифтів з Figma
 */
async function handleImportFonts(panel, message) {
  try {
    outputChannel?.appendLine("🔤 Starting font import from Figma...")

    if (!message.figmaLink || !message.figmaToken) {
      throw new Error("❌ Потрібен Figma файл та токен для імпорту шрифтів")
    }

    const fileId = extractFileIdFromFigmaLink(message.figmaLink)
    if (!fileId) {
      throw new Error("❌ Невірний формат Figma посилання")
    }

    // ✅ FIX: Визначення папки для шрифтів
    const activeEditor = vscode.window.activeTextEditor
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
    const outputDir = activeEditor
      ? path.dirname(activeEditor.document.uri.fsPath)
      : workspaceRoot || process.cwd()

    // ✅ FIX: Реальний імпорт шрифтів
    const figmaClient = new FigmaAPIClient(message.figmaToken)
    const fontImporter = new FontImporter({
      outputDir: outputDir,
      includeAllWeights: true,
      includeAllStyles: true,
      display: "swap"
    })

    const result = await fontImporter.importFonts(figmaClient, fileId, message.selectedLayers || [])

    panel.webview.postMessage({
      command: "fontsImported",
      success: true,
      result: result,
      stats: fontImporter.getImportStats(result.fonts)
    })

    outputChannel?.appendLine(`✅ Fonts import completed: ${result.fonts.length} fonts processed`)
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
    if (!message.content) {
      throw new Error("❌ Немає контенту для копіювання")
    }

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
 * ✅ FIX: Обробка налаштувань
 */
async function handleLoadSettings(panel) {
  try {
    const settings = configManager.loadConfig()
    panel.webview.postMessage({
      command: "lastSettingsLoaded",
      settings: settings
    })
    outputChannel?.appendLine("📂 Settings loaded and sent to WebView")
  } catch (error) {
    outputChannel?.appendLine(`❌ Error loading settings: ${error.message}`)
    panel.webview.postMessage({
      command: "error",
      message: `Помилка завантаження налаштувань: ${error.message}`
    })
  }
}

async function handleSaveSettings(panel, settings) {
  try {
    globalConfig = {...globalConfig, ...settings}

    // ✅ FIX: Оновлення IntegrationEngine з новим токеном
    if (settings.figmaToken && integrationEngine) {
      integrationEngine.updateOptions({figmaToken: settings.figmaToken})
    }

    const success = configManager.saveConfig(globalConfig)
    panel.webview.postMessage({
      command: "settingsSaved",
      success: success
    })
    outputChannel?.appendLine(`💾 Settings saved: ${success ? "success" : "failed"}`)
  } catch (error) {
    outputChannel?.appendLine(`❌ Error saving settings: ${error.message}`)
    panel.webview.postMessage({
      command: "settingsSaved",
      success: false,
      error: error.message
    })
  }
}

async function handleClearSettings(panel) {
  try {
    globalConfig = configManager.getDefaultConfig()
    const success = configManager.saveConfig(globalConfig)
    panel.webview.postMessage({
      command: "settingsCleared",
      success: success
    })
    outputChannel?.appendLine(`🗑️ Settings cleared: ${success ? "success" : "failed"}`)
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
 * ✅ FIX: Генерація CSS з реальним співставленням
 */
async function handleGenerateCSS(panel, settings) {
  try {
    outputChannel?.appendLine("🚀 Starting REAL CSS generation...")

    // ✅ FIX: Отримуємо HTML контент
    const activeEditor = vscode.window.activeTextEditor
    if (!activeEditor || activeEditor.document.languageId !== "html") {
      throw new Error("❌ HTML контент не знайдено. Відкрийте HTML файл спочатку.")
    }

    const htmlContent = activeEditor.document.getText()
    const htmlFilePath = activeEditor.document.uri.fsPath

    let cssContent = ""
    let figmaData = null
    let matches = null

    if (settings.mode === "minimal" || !settings.figmaToken || !settings.figmaLink) {
      // ✅ FIX: Мінімальна генерація без Figma
      cssContent = generateMinimalCSS(htmlContent)
    } else {
      // ✅ FIX: Повна генерація з реальним Figma співставленням
      try {
        const fileId = extractFileIdFromFigmaLink(settings.figmaLink)
        if (!fileId) {
          throw new Error("❌ Невірний формат Figma посилання")
        }

        // ✅ FIX: Оновлення токену в IntegrationEngine
        integrationEngine.updateOptions({figmaToken: settings.figmaToken})

        // ✅ FIX: Реальна генерація з Figma співставленням
        const result = await integrationEngine.generateCSS(fileId, htmlContent, {
          mode: settings.mode,
          selectedCanvases: settings.selectedCanvases || [],
          selectedLayers: settings.selectedLayers || []
        })

        cssContent = result.css
        figmaData = result.figmaData
        matches = result.matches

        outputChannel?.appendLine(
          `📊 Matching statistics: ${result.statistics.matchPercentage.toFixed(1)}% elements matched`
        )
      } catch (figmaError) {
        outputChannel?.appendLine(
          `⚠️ Figma processing failed, falling back to minimal mode: ${figmaError.message}`
        )
        cssContent = generateMinimalCSS(htmlContent)
      }
    }

    const savedPath = await saveGeneratedCSS(cssContent, htmlFilePath)
    await openGeneratedCSSFile(savedPath)

    panel.webview.postMessage({
      command: "generationComplete",
      success: true,
      cssPath: savedPath,
      figmaData: figmaData
        ? {
            elementsCount: figmaData.hierarchy.size,
            matchedCount: matches ? matches.size : 0
          }
        : null,
      message: `✅ CSS успішно згенеровано: ${path.basename(savedPath)}`
    })

    outputChannel?.appendLine(`✅ CSS generation completed: ${savedPath}`)
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
async function quickGenerateCSS(args = null) {
  try {
    outputChannel?.appendLine("⚡ Starting quick CSS generation...")

    let targetUri = null

    if (args && args.fsPath) {
      targetUri = args
    } else if (vscode.window.activeTextEditor) {
      targetUri = vscode.window.activeTextEditor.document.uri
    }

    if (!targetUri || path.extname(targetUri.fsPath) !== ".html") {
      const message = "❌ Будь ласка, відкрийте або оберіть HTML файл"
      vscode.window.showWarningMessage(message)
      outputChannel?.appendLine(`⚠️ ${message}`)
      return
    }

    if (!fs.existsSync(targetUri.fsPath)) {
      const message = `❌ HTML файл не знайдено: ${targetUri.fsPath}`
      vscode.window.showErrorMessage(message)
      outputChannel?.appendLine(`❌ ${message}`)
      return
    }

    const htmlContent = fs.readFileSync(targetUri.fsPath, "utf8")
    const cssContent = generateMinimalCSS(htmlContent)
    const savedPath = await saveGeneratedCSS(cssContent, targetUri.fsPath)

    await openGeneratedCSSFile(savedPath)

    const successMessage = `✅ CSS згенеровано: ${path.basename(savedPath)}`
    vscode.window.showInformationMessage(successMessage)
    outputChannel?.appendLine(successMessage)
  } catch (error) {
    outputChannel?.appendLine(`❌ Error in quick generate: ${error.message}`)
    vscode.window.showErrorMessage(`❌ Помилка швидкої генерації: ${error.message}`)
    throw error
  }
}

/**
 * ✅ FIX: Допоміжні функції БЕЗ хардкодінгу
 */
function generateMinimalCSS(htmlContent) {
  try {
    const classes = extractClassesFromHTML(htmlContent)
    let cssContent = `/* ✅ CSS Classes from HTML v4.0 - Minimal Mode */\n`
    cssContent += `/* Generated: ${new Date().toLocaleString("uk-UA")} */\n`
    cssContent += `/* Total classes found: ${classes.length} */\n\n`

    cssContent += generateResetCSS()
    cssContent += generateCSSVariables()
    cssContent += generateHTMLBasedCSS(classes)
    cssContent += generateResponsiveCSS()

    return cssContent
  } catch (error) {
    outputChannel?.appendLine(`❌ Error generating minimal CSS: ${error.message}`)
    return `/* ❌ Error generating CSS: ${error.message} */\n`
  }
}

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

function generateResponsiveCSS() {
  return (
    `/* ✅ RESPONSIVE STYLES */\n` +
    `@media (max-width: 768px) {\n` +
    `  .container {\n` +
    `    padding: var(--spacing-sm);\n` +
    `    font-size: 14px;\n` +
    `  }\n` +
    `  \n` +
    `  .hidden-mobile {\n` +
    `    display: none;\n` +
    `  }\n` +
    `}\n\n` +
    `@media (min-width: 769px) and (max-width: 1024px) {\n` +
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

function extractClassesFromHTML(htmlContent) {
  try {
    const classRegex = /class=["']([^"']+)["']/g
    const classes = new Set()
    let match

    while ((match = classRegex.exec(htmlContent)) !== null) {
      const classNames = match[1].split(/\s+/)
      classNames.forEach(className => {
        const cleanClassName = className.trim()
        if (cleanClassName && /^[a-zA-Z_-][a-zA-Z0-9_-]*$/.test(cleanClassName)) {
          classes.add(cleanClassName)
        }
      })
    }

    const classArray = Array.from(classes).sort()
    outputChannel?.appendLine(`📋 Found ${classArray.length} CSS classes`)
    return classArray
  } catch (error) {
    outputChannel?.appendLine(`❌ Error extracting classes: ${error.message}`)
    return []
  }
}

function extractFileIdFromFigmaLink(figmaLink) {
  try {
    const patterns = [
      /file\/([a-zA-Z0-9]{17,22})(?:\/|$)/,
      /design\/([a-zA-Z0-9]{17,22})(?:\/|$)/,
      /figma\.com\/(?:file|design)\/([a-zA-Z0-9]{17,22})/,
      /([a-zA-Z0-9]{17,22})/
    ]

    for (const pattern of patterns) {
      const match = figmaLink.match(pattern)
      if (match && match[1]) {
        outputChannel?.appendLine(`✅ Extracted Figma file ID: ${match[1]}`)
        return match[1]
      }
    }

    outputChannel?.appendLine(`❌ Could not extract ID from: ${figmaLink}`)
    return null
  } catch (error) {
    outputChannel?.appendLine(`❌ Error extracting file ID: ${error.message}`)
    return null
  }
}

async function saveGeneratedCSS(cssContent, htmlFilePath) {
  try {
    const htmlDir = path.dirname(htmlFilePath)
    const htmlName = path.basename(htmlFilePath, ".html")
    const cssFileName = `${htmlName}.css`
    let cssFilePath = path.join(htmlDir, cssFileName)

    let counter = 1
    while (fs.existsSync(cssFilePath)) {
      const newName = `${htmlName}-${counter}.css`
      cssFilePath = path.join(htmlDir, newName)
      counter++
    }

    fs.writeFileSync(cssFilePath, cssContent, "utf8")
    outputChannel?.appendLine(`💾 CSS saved to: ${cssFilePath}`)

    return cssFilePath
  } catch (error) {
    outputChannel?.appendLine(`❌ Error saving CSS: ${error.message}`)
    throw new Error(`❌ Помилка збереження CSS: ${error.message}`)
  }
}

async function openGeneratedCSSFile(cssFilePath) {
  try {
    const cssUri = vscode.Uri.file(cssFilePath)
    const document = await vscode.workspace.openTextDocument(cssUri)
    await vscode.window.showTextDocument(document, {
      viewColumn: vscode.ViewColumn.Beside,
      preview: false
    })
    outputChannel?.appendLine(`📂 CSS file opened: ${path.basename(cssFilePath)}`)
  } catch (error) {
    outputChannel?.appendLine(`❌ Failed to open CSS file: ${error.message}`)
    vscode.window.showWarningMessage(`❌ Не вдалося відкрити файл: ${path.basename(cssFilePath)}`)
  }
}

/**
 * ✅ FIX: Деактивація
 */
function deactivate() {
  console.log("🔄 CSS Classes from HTML v4.0 deactivating...")

  try {
    if (panel) {
      panel.dispose()
      panel = null
    }

    if (outputChannel) {
      outputChannel.dispose()
      outputChannel = null
    }

    console.log("✅ Extension v4.0 deactivated successfully")
  } catch (error) {
    console.error("❌ Error during deactivation:", error.message)
  }
}

module.exports = {
  activate,
  deactivate
}
