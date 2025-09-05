/* extension.js — головний файл розширення з повною інтеграцією меню */
const vscode = require("vscode")
const path = require("path")
const fs = require("fs")
const FigmaAPIClient = require("./core/FigmaAPIClient")
const ConfigLoader = require("./core/configLoader")
const {saveConfig, loadConfig} = require("./frontend/configurationManager")

let panel = null
let outputChannel = null
let configLoader = null

function activate(context) {
  console.log("✅ CSS Classes from HTML Extension activated")
  configLoader = new ConfigLoader()

  // Створюємо output channel для логування
  outputChannel = vscode.window.createOutputChannel("CSS Classes from HTML")
  outputChannel.appendLine("Extension activated successfully")

  // Реєструємо команду showMenu
  const showMenuCommand = vscode.commands.registerCommand("css-classes.showMenu", async () => {
    outputChannel.appendLine("Command 'css-classes.showMenu' executed")
    openMainMenu(context)
  })

  // Реєструємо команду openCanvasSelector
  const openCanvasSelectorCommand = vscode.commands.registerCommand(
    "css-classes.openCanvasSelector",
    () => {
      outputChannel.appendLine("Command 'css-classes.openCanvasSelector' executed")
      openCanvasSelector(context)
    }
  )

  // Додаємо до підписок
  context.subscriptions.push(showMenuCommand)
  context.subscriptions.push(openCanvasSelectorCommand)
  context.subscriptions.push(outputChannel)

  outputChannel.appendLine("All commands registered successfully")
}

function deactivate() {
  if (panel) panel.dispose()
  if (outputChannel) outputChannel.dispose()
}

/**
 * Відкриває головне меню розширення
 */
function openMainMenu(context) {
  if (panel) {
    panel.reveal(vscode.ViewColumn.One)
    return
  }

  panel = vscode.window.createWebviewPanel(
    "cssClassesMainMenu",
    "CSS Classes from HTML - Configuration",
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [
        vscode.Uri.file(path.join(context.extensionPath, "frontend")),
        vscode.Uri.file(path.join(context.extensionPath, "media"))
      ]
    }
  )

  // Завантажуємо HTML меню
  loadMenuHtml(context, panel)
}

/**
 * Завантажує HTML меню з обробкою ресурсів
 */
function loadMenuHtml(context, panel) {
  const htmlPath = path.join(context.extensionPath, "frontend", "css-classes-from-html-menu.html")
  outputChannel.appendLine(`Шлях до HTML меню: ${htmlPath}`)

  try {
    if (fs.existsSync(htmlPath)) {
      let htmlContent = fs.readFileSync(htmlPath, "utf8")

      // Обробляємо ресурси для WebView
      htmlContent = processWebviewResources(htmlContent, context, panel)

      panel.webview.html = htmlContent
      outputChannel.appendLine("Main menu HTML loaded successfully")
    } else {
      panel.webview.html = getFallbackMenuHtml()
      outputChannel.appendLine("Using fallback HTML for main menu")
      outputChannel.appendLine(`File not found: ${htmlPath}`)
    }
  } catch (error) {
    outputChannel.appendLine(`Error loading menu HTML: ${error.message}`)
    panel.webview.html = getFallbackMenuHtml()
  }

  setupMessageHandlers(panel, context)
}

/**
 * Обробляє ресурси для WebView
 */
function processWebviewResources(htmlContent, context, panel) {
  // Обробляємо скрипти
  htmlContent = htmlContent.replace(/<script src="([^"]+)"><\/script>/g, (match, src) => {
    const scriptPath = vscode.Uri.file(path.join(context.extensionPath, "frontend", src))
    const scriptUri = panel.webview.asWebviewUri(scriptPath)
    return `<script src="${scriptUri}"></script>`
  })

  // Обробляємо стилі
  htmlContent = htmlContent.replace(/<link rel="stylesheet" href="([^"]+)">/g, (match, href) => {
    const stylePath = vscode.Uri.file(path.join(context.extensionPath, "frontend", href))
    const styleUri = panel.webview.asWebviewUri(stylePath)
    return `<link rel="stylesheet" href="${styleUri}">`
  })

  // Обробляємо зображення
  htmlContent = htmlContent.replace(/<img src="([^"]+)"([^>]*)>/g, (match, src, attrs) => {
    const imgPath = vscode.Uri.file(path.join(context.extensionPath, "media", src))
    const imgUri = panel.webview.asWebviewUri(imgPath)
    return `<img src="${imgUri}"${attrs}>`
  })

  return htmlContent
}

/**
 * Налаштовує обробники повідомлень
 */
function setupMessageHandlers(panel, context) {
  panel.webview.onDidReceiveMessage(async message => {
    try {
      outputChannel.appendLine(`Received message: ${message.command}`)

      switch (message.command) {
        case "loadSettings":
          await handleLoadSettings(panel)
          break

        case "saveSettings":
          await handleSaveSettings(message.settings)
          break

        case "generateCSS":
          await handleGenerateCSS(message.settings, panel)
          break

        case "clearSettings":
          await handleClearSettings(panel)
          break

        case "getFigmaCanvases":
          await handleGetFigmaCanvases(message, panel)
          break

        case "getFigmaLayers":
          await handleGetFigmaLayers(message, panel)
          break

        default:
          outputChannel.appendLine(`Unknown command: ${message.command}`)
      }
    } catch (error) {
      outputChannel.appendLine(`Error handling message: ${error.message}`)
      panel.webview.postMessage({
        command: "error",
        message: error.message
      })
    }
  })

  panel.onDidDispose(() => {
    panel = null
    outputChannel.appendLine("Main menu panel disposed")
  })
}

/**
 * Обробляє завантаження налаштувань
 */
async function handleLoadSettings(panel) {
  try {
    const settings = await configLoader.loadLastSettings()
    panel.webview.postMessage({
      command: "settingsLoaded",
      settings: settings || {}
    })
  } catch (error) {
    panel.webview.postMessage({
      command: "error",
      message: `Failed to load settings: ${error.message}`
    })
  }
}

/**
 * Обробляє збереження налаштувань
 */
async function handleSaveSettings(settings) {
  try {
    const success = await configLoader.saveLastSettings(settings)
    return success
  } catch (error) {
    outputChannel.appendLine(`Failed to save settings: ${error.message}`)
    return false
  }
}

/**
 * Обробляє генерацію CSS
 */
async function handleGenerateCSS(settings, panel) {
  try {
    outputChannel.appendLine(`Starting CSS generation with mode: ${settings.mode}`)

    // Отримуємо активний HTML файл
    const activeEditor = vscode.window.activeTextEditor
    if (!activeEditor || activeEditor.document.languageId !== "html") {
      throw new Error("Будь ласка, відкрийте HTML файл перед генерацією CSS")
    }

    const htmlFilePath = activeEditor.document.uri.fsPath
    const htmlContent = activeEditor.document.getText()

    // Генеруємо CSS відповідно до обраного режиму
    let cssContent = ""

    switch (settings.mode) {
      case "minimal":
        cssContent = generateMinimalCSS(htmlContent)
        break

      case "maximum":
        cssContent = await generateMaximumCSS(htmlContent, settings)
        break

      case "production":
        cssContent = await generateProductionCSS(htmlContent, settings)
        break

      default:
        throw new Error(`Невідомий режим: ${settings.mode}`)
    }

    // Зберігаємо згенерований CSS
    const savedPath = await saveGeneratedCSS(cssContent)

    // Зберігаємо налаштування
    await handleSaveSettings(settings)

    panel.webview.postMessage({
      command: "generationComplete",
      success: true,
      cssPath: savedPath,
      cssContent: cssContent
    })

    vscode.window.showInformationMessage(
      `✅ CSS згенеровано та збережено: ${path.basename(savedPath)}`
    )
  } catch (error) {
    outputChannel.appendLine(`Generation error: ${error.message}`)
    panel.webview.postMessage({
      command: "generationComplete",
      success: false,
      error: error.message
    })
  }
}

/**
 * Генерує мінімальний CSS
 */
function generateMinimalCSS(htmlContent) {
  const classes = extractClassesFromHTML(htmlContent)
  let cssContent = `/* Minimal CSS generated from HTML classes */\n/* Generated on: ${new Date().toLocaleString()} */\n\n`

  classes.forEach(className => {
    cssContent += `.${className} {\n`
    cssContent += `  /* Add your styles here */\n`
    cssContent += `}\n\n`
  })

  return cssContent
}

/**
 * Генерує максимальний CSS з інтеграцією Figma
 */
async function generateMaximumCSS(htmlContent, settings) {
  const classes = extractClassesFromHTML(htmlContent)
  let cssContent = `/* Maximum CSS generated from HTML with Figma integration */\n/* Generated on: ${new Date().toLocaleString()} */\n\n`

  // Додаємо класи з HTML
  classes.forEach(className => {
    cssContent += `.${className} {\n`
    cssContent += `  /* Styles from HTML structure */\n`
    cssContent += `}\n\n`
  })

  // Додаємо стилі з Figma, якщо налаштовано
  if (settings.figmaLink && settings.selectedLayers && settings.selectedLayers.length > 0) {
    try {
      const figmaStyles = await generateCSSFromFigmaLayers(settings)
      cssContent += `\n/* Figma Styles */\n${figmaStyles}`
    } catch (error) {
      outputChannel.appendLine(`Figma integration error: ${error.message}`)
      cssContent += `\n/* Figma integration failed: ${error.message} */\n`
    }
  }

  return cssContent
}

/**
 * Генерує production CSS
 */
async function generateProductionCSS(htmlContent, settings) {
  let cssContent = await generateMaximumCSS(htmlContent, settings)

  // Мінімізуємо CSS для production
  cssContent = minimizeCSS(cssContent)

  return `/* Production-optimized CSS */\n/* Generated on: ${new Date().toLocaleString()} */\n${cssContent}`
}

/**
 * Витягує CSS класи з HTML
 */
function extractClassesFromHTML(htmlContent) {
  const classRegex = /class=["']([^"']+)["']/g
  const classes = new Set()
  let match

  while ((match = classRegex.exec(htmlContent)) !== null) {
    match[1].split(/\s+/).forEach(className => {
      if (className.trim()) {
        classes.add(className.trim())
      }
    })
  }

  return Array.from(classes)
}

/**
 * Мінімізує CSS
 */
function minimizeCSS(cssContent) {
  return cssContent
    .replace(/\/\*[\s\S]*?\*\//g, "") // Видаляємо коментарі
    .replace(/\s+/g, " ") // Замінюємо множинні пробіли на один
    .replace(/\s*([{:}])\s*/g, "$1") // Видаляємо пробіли вокруг {, }, :
    .trim()
}

/**
 * Обробляє отримання Canvas з Figma
 */
async function handleGetFigmaCanvases(message, panel) {
  try {
    const {figmaLink, figmaToken} = message
    const key = extractFigmaKey(figmaLink)

    if (!key) throw new Error("Invalid Figma link")

    const client = new FigmaAPIClient(figmaToken || process.env.FIGMA_API_TOKEN)
    const canvases = await client.getCanvases(key)

    panel.webview.postMessage({
      command: "figmaCanvases",
      canvases: canvases
    })
  } catch (error) {
    panel.webview.postMessage({
      command: "error",
      message: `Failed to get Figma canvases: ${error.message}`
    })
  }
}

/**
 * Обробляє отримання Layers з Figma
 */
async function handleGetFigmaLayers(message, panel) {
  try {
    const {figmaLink, figmaToken, canvasIds} = message
    const key = extractFigmaKey(figmaLink)

    if (!key) throw new Error("Invalid Figma link")

    const client = new FigmaAPIClient(figmaToken || process.env.FIGMA_API_TOKEN)
    const layers = await client.getLayers(key, canvasIds || [])

    panel.webview.postMessage({
      command: "figmaLayers",
      layers: layers
    })
  } catch (error) {
    panel.webview.postMessage({
      command: "error",
      message: `Failed to get Figma layers: ${error.message}`
    })
  }
}

/**
 * Генерує CSS з шарів Figma
 */
async function generateCSSFromFigmaLayers(settings) {
  const {figmaLink, figmaToken, selectedLayers} = settings
  const key = extractFigmaKey(figmaLink)

  if (!key) throw new Error("Invalid Figma link")

  const client = new FigmaAPIClient(figmaToken || process.env.FIGMA_API_TOKEN)
  const layers = await client.getLayers(key, selectedLayers || [])

  return generateCSSFromLayers(layers)
}

/**
 * Генерує CSS з обраних шарів Figma
 */
function generateCSSFromLayers(layers) {
  if (!layers || layers.length === 0) {
    return "/* No Figma layers selected */"
  }

  let cssContent = ""

  layers.forEach((layer, index) => {
    const className =
      layer.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") || `figma-layer-${index + 1}`

    cssContent += `.${className} {\n`

    if (layer.absoluteBoundingBox) {
      cssContent += `  width: ${layer.absoluteBoundingBox.width}px;\n`
      cssContent += `  height: ${layer.absoluteBoundingBox.height}px;\n`
    }

    if (layer.backgroundColor) {
      const rgb = layer.backgroundColor
      cssContent += `  background-color: rgba(${Math.round(rgb.r * 255)}, ${Math.round(rgb.g * 255)}, ${Math.round(rgb.b * 255)}, ${rgb.a});\n`
    }

    // Додаткові властивості Figma
    if (layer.fills && layer.fills.length > 0) {
      layer.fills.forEach((fill, fillIndex) => {
        if (fill.color) {
          const color = fill.color
          cssContent += `  fill-${fillIndex + 1}: rgba(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)}, ${color.a});\n`
        }
      })
    }

    cssContent += `}\n\n`
  })

  return cssContent
}

/**
 * Обробляє очищення налаштувань
 */
async function handleClearSettings(panel) {
  try {
    await configLoader.cleanupOldSettings()
    panel.webview.postMessage({
      command: "settingsCleared",
      success: true
    })
  } catch (error) {
    panel.webview.postMessage({
      command: "error",
      message: `Failed to clear settings: ${error.message}`
    })
  }
}

/**
 * Відкриває Canvas Selector (legacy функціонал)
 */
function openCanvasSelector(context) {
  // Реалізація залишається незмінною для зворотньої сумісності
  outputChannel.appendLine("Legacy canvas selector opened")
  vscode.window.showInformationMessage("Canvas Selector is available in main menu")
  openMainMenu(context)
}

/**
 * Зберігає згенеровані CSS стилі
 */
async function saveGeneratedCSS(cssContent) {
  const activeEditor = vscode.window.activeTextEditor
  if (!activeEditor) {
    throw new Error("Не знайдено активного редактора. Відкрийте HTML файл.")
  }

  const currentDocument = activeEditor.document
  if (currentDocument.languageId !== "html") {
    throw new Error("Активний файл не є HTML документом.")
  }

  const htmlFilePath = currentDocument.uri.fsPath
  const htmlDir = path.dirname(htmlFilePath)
  const htmlFileName = path.basename(htmlFilePath, ".html")

  // Створюємо папку css якщо не існує
  const cssDir = path.join(htmlDir, "css")
  if (!fs.existsSync(cssDir)) {
    fs.mkdirSync(cssDir, {recursive: true})
    outputChannel.appendLine(`Створено папку: ${cssDir}`)
  }

  // Генеруємо ім'я CSS файлу
  const cssFileName = `generated-${htmlFileName}.css`
  const cssFilePath = path.join(cssDir, cssFileName)

  // Записуємо CSS контент
  fs.writeFileSync(cssFilePath, cssContent, "utf8")

  const relativePath = path.relative(htmlDir, cssFilePath)
  outputChannel.appendLine(`CSS збережено: ${relativePath}`)

  return cssFilePath
}

/**
 * Витягує ключ з Figma URL
 */
function extractFigmaKey(url) {
  if (!url) return null
  const m = url.match(/file\/([a-zA-Z0-9_-]+)(?:\/|$|\?)/)
  return m ? m[1] : null
}

/**
 * Fallback HTML для меню
 */
function getFallbackMenuHtml() {
  return `<!DOCTYPE html>
<html lang="uk">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>CSS Classes from HTML - Configuration</title>
<style>
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #1f1f1f;
  color: #fff;
  padding: 20px;
  text-align: center;
}
h2 { color: #0ea5e9; margin-bottom: 1rem; }
.error { color: #f44336; margin-bottom: 1rem; }
.btn {
  padding: 10px 20px;
  background: #0ea5e9;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin: 5px;
}
</style>
</head>
<body>
<h2>🎨 CSS Classes from HTML</h2>
<p class="error">❌ Помилка завантаження головного меню</p>
<p>Будь ласка, перезавантажте розширення або зверніться до розробника.</p>
<button class="btn" onclick="vscode.postMessage({command: 'loadSettings'})">Завантажити налаштування</button>
<button class="btn" onclick="vscode.postMessage({command: 'generateCSS', settings: {mode: 'minimal'}})">Мінімальна генерація</button>
</body>
</html>`
}

module.exports = {activate, deactivate}
