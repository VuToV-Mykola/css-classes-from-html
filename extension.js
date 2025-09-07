// ✅ FIX: Виправлений extension.js з робочими обробниками
const vscode = require("vscode")
const path = require("path")
const fs = require("fs")

// ✅ FIX: Глобальні змінні
let panel = null
let outputChannel = null
let globalConfig = {}

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
        version: "2.2.0"
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
      version: "2.2.0"
    }
  }
}

/**
 * ✅ FIX: Активація розширення
 */
function activate(context) {
  console.log("🚀 CSS Classes from HTML Enhanced Extension activating...")

  try {
    configManager.initialize(context.extensionPath)
    globalConfig = configManager.loadConfig()

    outputChannel = vscode.window.createOutputChannel("CSS Classes from HTML Enhanced")
    outputChannel.show(true)
    outputChannel.appendLine("✅ Enhanced Extension activated successfully")

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

    outputChannel.appendLine(`✅ Enhanced Extension fully activated with ${commands.length} commands!`)
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
      "cssClassesEnhancedMenu",
      "CSS Classes from HTML - Enhanced",
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

    outputChannel?.appendLine("✅ Enhanced menu opened successfully")
  } catch (error) {
    outputChannel?.appendLine(`❌ Error opening menu: ${error.message}`)
    vscode.window.showErrorMessage(`Помилка відкриття меню: ${error.message}`)
    throw error
  }
}

/**
 * ✅ FIX: Обробники повідомлень WebView
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
 * ✅ FIX: Mock Figma Canvas handler з реалістичними даними
 */
async function handleGetFigmaCanvases(panel, message) {
  try {
    outputChannel?.appendLine("🎨 Getting Figma canvases...")
    outputChannel?.appendLine(`🔗 Figma link: ${message.figmaLink}`)

    if (!message.figmaLink) {
      throw new Error("Figma посилання не надано")
    }

    const fileId = extractFileIdFromFigmaLink(message.figmaLink)
    if (!fileId) {
      throw new Error("Невірний формат Figma посилання")
    }

    outputChannel?.appendLine(`📁 Extracted file ID: ${fileId}`)

    // ✅ FIX: Mock Canvas data для демонстрації
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
    
    const mockCanvases = [
      {
        id: "canvas_1_desktop",
        name: "Desktop Version",
        childrenCount: 15,
        elementTypes: ["FRAME", "TEXT", "RECTANGLE"],
        hasText: true,
        hasImages: true,
        complexity: 7.5
      },
      {
        id: "canvas_2_mobile", 
        name: "Mobile Version",
        childrenCount: 12,
        elementTypes: ["FRAME", "TEXT", "RECTANGLE", "COMPONENT"],
        hasText: true,
        hasImages: false,
        complexity: 5.2
      },
      {
        id: "canvas_3_tablet",
        name: "Tablet Version", 
        childrenCount: 8,
        elementTypes: ["FRAME", "TEXT"],
        hasText: true,
        hasImages: false,
        complexity: 3.8
      }
    ]
    
    panel.webview.postMessage({
      command: "figmaCanvases",
      canvases: mockCanvases,
      fileId: fileId
    })

    outputChannel?.appendLine(`✅ Sent ${mockCanvases.length} mock canvases`)
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
 * ✅ FIX: Mock Figma Layers handler
 */
async function handleGetFigmaLayers(panel, message) {
  try {
    outputChannel?.appendLine("🎨 Getting Figma layers...")
    outputChannel?.appendLine(`📋 Canvas IDs: ${JSON.stringify(message.canvasIds)}`)

    if (!message.figmaLink || !message.canvasIds) {
      throw new Error("Не вистачає даних для завантаження Layers")
    }

    const fileId = extractFileIdFromFigmaLink(message.figmaLink)
    if (!fileId) {
      throw new Error("Невірний формат Figma посилання")
    }

    // ✅ FIX: Mock Layers data
    await new Promise(resolve => setTimeout(resolve, 1200)) // Simulate API delay

    const mockLayers = []
    
    message.canvasIds.forEach((canvasId, canvasIndex) => {
      const canvasName = canvasId.includes('desktop') ? 'Desktop Version' : 
                         canvasId.includes('mobile') ? 'Mobile Version' : 'Tablet Version'
      
      // Header section
      mockLayers.push({
        id: `${canvasId}_header`,
        name: "Header",
        type: "FRAME",
        canvasId: canvasId,
        canvasName: canvasName,
        depth: 0,
        hasChildren: true
      })
      
      mockLayers.push({
        id: `${canvasId}_logo`,
        name: "Logo",
        type: "COMPONENT",
        canvasId: canvasId,
        canvasName: canvasName,
        depth: 1,
        hasChildren: false
      })
      
      mockLayers.push({
        id: `${canvasId}_nav`,
        name: "Navigation",
        type: "FRAME", 
        canvasId: canvasId,
        canvasName: canvasName,
        depth: 1,
        hasChildren: true
      })
      
      // Main content
      mockLayers.push({
        id: `${canvasId}_main`,
        name: "Main Content",
        type: "FRAME",
        canvasId: canvasId,
        canvasName: canvasName,
        depth: 0,
        hasChildren: true
      })
      
      mockLayers.push({
        id: `${canvasId}_title`,
        name: "Page Title",
        type: "TEXT",
        canvasId: canvasId,
        canvasName: canvasName,
        depth: 1,
        hasChildren: false
      })
      
      mockLayers.push({
        id: `${canvasId}_button`,
        name: "Primary Button",
        type: "RECTANGLE",
        canvasId: canvasId,
        canvasName: canvasName,
        depth: 1,
        hasChildren: false
      })
      
      // Footer
      mockLayers.push({
        id: `${canvasId}_footer`,
        name: "Footer",
        type: "FRAME",
        canvasId: canvasId,
        canvasName: canvasName,
        depth: 0,
        hasChildren: false
      })
    })
    
    panel.webview.postMessage({
      command: "figmaLayers",
      layers: mockLayers,
      canvasIds: message.canvasIds
    })

    outputChannel?.appendLine(`✅ Sent ${mockLayers.length} mock layers`)
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
 * ✅ FIX: Mock Layer Styles handler
 */
async function handleGetLayerStyles(panel, message) {
  try {
    outputChannel?.appendLine("🎨 Getting layer styles...")
    outputChannel?.appendLine(`🎯 Layer IDs: ${JSON.stringify(message.layerIds)}`)

    if (!message.figmaLink || !message.layerIds || message.layerIds.length === 0) {
      throw new Error("Не вистачає даних для завантаження стилів")
    }

    // ✅ FIX: Mock Styles data
    await new Promise(resolve => setTimeout(resolve, 800)) // Simulate API delay

    const mockStyles = message.layerIds.map(layerId => {
      let styles = {}
      
      if (layerId.includes('title')) {
        styles = {
          'font-family': 'Inter, sans-serif',
          'font-size': '32px',
          'font-weight': '700',
          'color': '#1a1a1a',
          'line-height': '1.2',
          'margin-bottom': '24px'
        }
      } else if (layerId.includes('button')) {
        styles = {
          'background-color': '#007ACC',
          'color': '#ffffff',
          'border-radius': '8px',
          'padding': '12px 24px',
          'font-size': '16px',
          'font-weight': '500',
          'border': 'none',
          'cursor': 'pointer'
        }
      } else if (layerId.includes('header')) {
        styles = {
          'background-color': '#ffffff',
          'padding': '16px 24px',
          'border-bottom': '1px solid #e0e0e0',
          'display': 'flex',
          'justify-content': 'space-between',
          'align-items': 'center'
        }
      } else if (layerId.includes('nav')) {
        styles = {
          'display': 'flex',
          'gap': '24px',
          'list-style': 'none'
        }
      } else if (layerId.includes('footer')) {
        styles = {
          'background-color': '#f8f9fa',
          'padding': '48px 24px',
          'text-align': 'center',
          'border-top': '1px solid #e0e0e0'
        }
      } else if (layerId.includes('logo')) {
        styles = {
          'width': '120px',
          'height': 'auto'
        }
      } else {
        styles = {
          'display': 'block',
          'margin': '0',
          'padding': '0'
        }
      }
      
      return {
        layerId: layerId,
        styles: styles,
        metadata: {
          name: layerId.split('_').pop(),
          type: layerId.includes('title') ? 'TEXT' : 
                layerId.includes('button') ? 'RECTANGLE' : 'FRAME'
        }
      }
    })
    
    panel.webview.postMessage({
      command: "layerStyles",
      styles: mockStyles,
      layerIds: message.layerIds
    })

    outputChannel?.appendLine(`✅ Sent styles for ${mockStyles.length} layers`)
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
 * ✅ FIX: Копіювання в буфер обміну
 */
async function handleCopyToClipboard(panel, message) {
  try {
    if (!message.content) {
      throw new Error("Немає контенту для копіювання")
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
 * ✅ FIX: Генерація CSS
 */
async function handleGenerateCSS(panel, settings) {
  try {
    outputChannel?.appendLine("🚀 Starting CSS generation...")

    // Отримуємо HTML контент
    const activeEditor = vscode.window.activeTextEditor
    if (!activeEditor || activeEditor.document.languageId !== "html") {
      throw new Error("HTML контент не знайдено. Відкрийте HTML файл спочатку.")
    }

    const htmlContent = activeEditor.document.getText()
    const htmlFilePath = activeEditor.document.uri.fsPath

    let cssContent = ""

    if (settings.mode === "minimal" || !settings.selectedCanvases || settings.selectedCanvases.length === 0) {
      // Мінімальна генерація
      cssContent = generateMinimalCSS(htmlContent)
    } else {
      // Enhanced генерація з Figma
      cssContent = generateEnhancedCSS(htmlContent, settings)
    }

    const savedPath = await saveGeneratedCSS(cssContent, htmlFilePath)
    await openGeneratedCSSFile(savedPath)

    panel.webview.postMessage({
      command: "generationComplete",
      success: true,
      cssPath: savedPath,
      message: `CSS успішно згенеровано: ${path.basename(savedPath)}`
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
 * ✅ FIX: Enhanced CSS генерація
 */
function generateEnhancedCSS(htmlContent, settings) {
  try {
    let cssContent = `/* CSS Classes from HTML - Enhanced with Figma */\n`
    cssContent += `/* Generated: ${new Date().toLocaleString("uk-UA")} */\n`
    cssContent += `/* Mode: ${settings.mode} */\n`
    cssContent += `/* Canvas: ${settings.selectedCanvases.length} */\n`
    cssContent += `/* Layers: ${settings.selectedLayers.length} */\n\n`

    // CSS Reset
    cssContent += generateResetCSS()
    
    // CSS Variables
    cssContent += generateCSSVariables()

    // HTML класи
    const htmlClasses = extractClassesFromHTML(htmlContent)
    
    if (settings.selectedLayers && settings.selectedLayers.length > 0) {
      // Генерація на основі Figma Layers з mock стилями
      cssContent += generateFigmaBasedCSS(settings.selectedLayers, htmlClasses)
    } else {
      // Базова генерація HTML класів
      cssContent += generateHTMLBasedCSS(htmlClasses)
    }

    // Responsive styles
    cssContent += generateResponsiveCSS()

    return cssContent
  } catch (error) {
    outputChannel?.appendLine(`❌ Error in enhanced CSS generation: ${error.message}`)
    return generateMinimalCSS(htmlContent)
  }
}

/**
 * ✅ FIX: Генерація CSS на основі Figma Layers
 */
function generateFigmaBasedCSS(selectedLayers, htmlClasses) {
  let cssContent = `/* === FIGMA-BASED STYLES === */\n`
  
  selectedLayers.forEach(layer => {
    const className = generateClassNameFromLayer(layer)
    
    cssContent += `/* Figma Layer: "${layer.name}" (${layer.type}) */\n`
    cssContent += `/* Canvas: ${layer.canvasName || 'Unknown'} */\n`
    cssContent += `.${className} {\n`
    
    // Mock стилі на основі типу layer
    if (layer.name.toLowerCase().includes('title')) {
      cssContent += `  font-family: 'Inter', sans-serif;\n`
      cssContent += `  font-size: 32px;\n`
      cssContent += `  font-weight: 700;\n`
      cssContent += `  color: #1a1a1a;\n`
      cssContent += `  line-height: 1.2;\n`
      cssContent += `  margin-bottom: 24px;\n`
    } else if (layer.name.toLowerCase().includes('button')) {
      cssContent += `  background-color: #007ACC;\n`
      cssContent += `  color: #ffffff;\n`
      cssContent += `  border-radius: 8px;\n`
      cssContent += `  padding: 12px 24px;\n`
      cssContent += `  font-size: 16px;\n`
      cssContent += `  font-weight: 500;\n`
      cssContent += `  border: none;\n`
      cssContent += `  cursor: pointer;\n`
    } else if (layer.name.toLowerCase().includes('header')) {
      cssContent += `  background-color: #ffffff;\n`
      cssContent += `  padding: 16px 24px;\n`
      cssContent += `  border-bottom: 1px solid #e0e0e0;\n`
      cssContent += `  display: flex;\n`
      cssContent += `  justify-content: space-between;\n`
      cssContent += `  align-items: center;\n`
    } else {
      cssContent += `  /* Add styles for ${layer.name} here */\n`
    }
    
    cssContent += `}\n\n`
  })
  
  // Генеруємо пусті правила для HTML класів без Figma співставлення
  htmlClasses.forEach(className => {
    const alreadyGenerated = selectedLayers.some(layer => 
      generateClassNameFromLayer(layer) === className
    )
    
    if (!alreadyGenerated) {
      cssContent += `.${className} {\n`
      cssContent += `  /* Add styles for ${className} here */\n`
      cssContent += `}\n\n`
    }
  })
  
  return cssContent
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
      const message = "Будь ласка, відкрийте або оберіть HTML файл"
      vscode.window.showWarningMessage(message)
      outputChannel?.appendLine(`⚠️ ${message}`)
      return
    }

    if (!fs.existsSync(targetUri.fsPath)) {
      const message = `HTML файл не знайдено: ${targetUri.fsPath}`
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
    vscode.window.showErrorMessage(`Помилка швидкої генерації: ${error.message}`)
    throw error
  }
}

/**
 * ✅ FIX: Допоміжні функції
 */
function generateMinimalCSS(htmlContent) {
  try {
    const classes = extractClassesFromHTML(htmlContent)
    let cssContent = `/* CSS Classes from HTML - Minimal Mode */\n`
    cssContent += `/* Generated: ${new Date().toLocaleString("uk-UA")} */\n`
    cssContent += `/* Total classes found: ${classes.length} */\n\n`

    cssContent += generateResetCSS()
    cssContent += generateCSSVariables()
    cssContent += generateHTMLBasedCSS(classes)
    cssContent += generateResponsiveCSS()

    return cssContent
  } catch (error) {
    outputChannel?.appendLine(`❌ Error generating minimal CSS: ${error.message}`)
    return `/* Error generating CSS: ${error.message} */\n`
  }
}

function generateResetCSS() {
  return `/* === RESET STYLES === */\n` +
    `* {\n` +
    `  margin: 0;\n` +
    `  padding: 0;\n` +
    `  box-sizing: border-box;\n` +
    `}\n\n` +
    `body {\n` +
    `  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n` +
    `  line-height: 1.5;\n` +
    `  color: #212529;\n` +
    `  background-color: #ffffff;\n` +
    `}\n\n`
}

function generateCSSVariables() {
  return `/* === CSS VARIABLES === */\n` +
    `:root {\n` +
    `  --primary-color: #007ACC;\n` +
    `  --secondary-color: #6c757d;\n` +
    `  --success-color: #28a745;\n` +
    `  --danger-color: #dc3545;\n` +
    `  --text-color: #212529;\n` +
    `  --background-color: #ffffff;\n` +
    `  --spacing-sm: 0.5rem;\n` +
    `  --spacing-md: 1rem;\n` +
    `  --spacing-lg: 1.5rem;\n` +
    `}\n\n`
}

function generateHTMLBasedCSS(classes) {
  let cssContent = `/* === CLASS RULES === */\n`
  
  if (classes.length === 0) {
    cssContent += `/* No CSS classes found in HTML */\n\n`
  } else {
    classes.forEach(className => {
      cssContent += `.${className} {\n`
      cssContent += `  /* Add styles for ${className} here */\n`
      cssContent += `}\n\n`
    })
  }
  
  return cssContent
}

function generateResponsiveCSS() {
  return `/* === RESPONSIVE STYLES === */\n` +
    `@media (max-width: 768px) {\n` +
    `  .container {\n` +
    `    padding: var(--spacing-sm);\n` +
    `  }\n` +
    `}\n\n` +
    `@media (min-width: 769px) {\n` +
    `  .container {\n` +
    `    padding: var(--spacing-lg);\n` +
    `  }\n` +
    `}\n`
}

function generateClassNameFromLayer(layer) {
  return layer.name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    || 'figma-layer'
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
    throw new Error(`Помилка збереження CSS: ${error.message}`)
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
    vscode.window.showWarningMessage(`Не вдалося відкрити файл: ${path.basename(cssFilePath)}`)
  }
}

/**
 * ✅ FIX: Деактивація
 */
function deactivate() {
  console.log("🔄 CSS Classes from HTML Enhanced Extension deactivating...")

  try {
    if (panel) {
      panel.dispose()
      panel = null
    }

    if (outputChannel) {
      outputChannel.dispose()
      outputChannel = null
    }

    console.log("✅ Enhanced Extension deactivated successfully")
  } catch (error) {
    console.error("❌ Error during deactivation:", error.message)
  }
}

module.exports = {
  activate,
  deactivate
}
