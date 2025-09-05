/* extension.js — головний файл розширення з повною інтеграцією меню
 * Оптимізований та виправлений для VSCode
 * @version 3.0.0
 */

const vscode = require("vscode")
const path = require("path")
const fs = require("fs")

// Глобальні змінні
let panel = null
let outputChannel = null
let globalConfig = {
  mode: "maximum",
  figmaLink: "",
  figmaToken: "",
  selectedCanvas: [],
  selectedLayers: [],
  includeGlobal: false,
  includeReset: true,
  includeComments: true,
  optimizeCSS: true,
  savedAt: null
}

/**
 * Активація розширення
 */
function activate(context) {
  console.log("✅ CSS Classes from HTML Extension activated")

  // Створюємо output channel для логування
  const outputChannel = vscode.window.createOutputChannel("CSS Classes from HTML")
  outputChannel.appendLine("Extension activated successfully")

  // Завантажуємо збережену конфігурацію
  loadSavedConfig(context)

  // Реєструємо команду showMenu
  const showMenuCommand = vscode.commands.registerCommand("css-classes.showMenu", async () => {
    outputChannel.appendLine("Command 'css-classes.showMenu' executed")
    await openMainMenu(context)
  })

  // Реєструємо команду openCanvasSelector (для сумісності)
  const openCanvasSelectorCommand = vscode.commands.registerCommand(
    "css-classes.openCanvasSelector",
    async () => {
      outputChannel.appendLine("Command 'css-classes.openCanvasSelector' executed")
      await openMainMenu(context) // Перенаправляємо на головне меню
    }
  )

  // Додаткові команди
  const quickGenerateCommand = vscode.commands.registerCommand(
    "css-classes.quickGenerate",
    async () => {
      await quickGenerateCSS(context)
    }
  )

  const fullGenerateCommand = vscode.commands.registerCommand(
    "css-classes.fullGenerate",
    async () => {
      await fullGenerateWithFigma(context)
    }
  )

  // Додаємо до підписок
  context.subscriptions.push(
    showMenuCommand,
    openCanvasSelectorCommand,
    quickGenerateCommand,
    fullGenerateCommand,
    outputChannel
  )

  outputChannel.appendLine("All commands registered successfully")
}

/**
 * Деактивація розширення
 */
function deactivate() {
  if (panel) {
    panel.dispose()
    panel = null
  }
  if (outputChannel) {
    outputChannel.dispose()
    outputChannel = null
  }
}

/**
 * Завантаження збереженої конфігурації
 */
function loadSavedConfig(context) {
  try {
    const configPath = path.join(
      context.extensionPath,
      ".vscode",
      "css-classes-config",
      "last-settings.json"
    )

    if (fs.existsSync(configPath)) {
      const savedConfig = JSON.parse(fs.readFileSync(configPath, "utf8"))
      globalConfig = {...globalConfig, ...savedConfig}
      outputChannel.appendLine("Configuration loaded from file")
    }
  } catch (error) {
    outputChannel.appendLine(`Failed to load config: ${error.message}`)
  }
}

/**
 * Збереження конфігурації
 */
function saveConfig(context, config) {
  try {
    const configDir = path.join(context.extensionPath, ".vscode", "css-classes-config")
    const configPath = path.join(configDir, "last-settings.json")

    // Створюємо директорію якщо не існує
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, {recursive: true})
    }

    // Зберігаємо конфігурацію
    const dataToSave = {
      ...config,
      savedAt: new Date().toISOString(),
      version: "3.0.0"
    }

    fs.writeFileSync(configPath, JSON.stringify(dataToSave, null, 2), "utf8")
    outputChannel.appendLine("Configuration saved successfully")

    return true
  } catch (error) {
    outputChannel.appendLine(`Failed to save config: ${error.message}`)
    return false
  }
}

/**
 * Відкриває головне меню розширення
 */
async function openMainMenu(context) {
  // Якщо панель вже відкрита, показуємо її
  if (panel) {
    panel.reveal(vscode.ViewColumn.One)
    return
  }

  // Створюємо нову панель
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

  // Завантажуємо HTML
  try {
    const htmlContent = await loadMenuHTML(context, panel)
    panel.webview.html = htmlContent
    outputChannel.appendLine("Main menu HTML loaded successfully")
  } catch (error) {
    outputChannel.appendLine(`Error loading menu: ${error.message}`)
    panel.webview.html = getFallbackHTML()
  }

  // Налаштовуємо обробники повідомлень
  setupMessageHandlers(panel, context)

  // Обробка закриття панелі
  panel.onDidDispose(() => {
    panel = null
    outputChannel.appendLine("Main menu panel disposed")
  })
}

/**
 * Завантаження HTML для меню
 */
async function loadMenuHTML(context, panel) {
  const htmlPath = path.join(context.extensionPath, "frontend", "css-classes-from-html-menu.html")

  if (!fs.existsSync(htmlPath)) {
    throw new Error("Menu HTML file not found")
  }

  let htmlContent = fs.readFileSync(htmlPath, "utf8")

  // Обробляємо шляхи до ресурсів для WebView
  htmlContent = processWebviewResources(htmlContent, context, panel)

  return htmlContent
}

/**
 * Обробка ресурсів для WebView
 */
function processWebviewResources(htmlContent, context, panel) {
  // Заміна шляхів до скриптів
  htmlContent = htmlContent.replace(/<script src="([^"]+)"><\/script>/g, (match, src) => {
    if (src.startsWith("http")) return match // Залишаємо зовнішні скрипти
    const scriptPath = vscode.Uri.file(path.join(context.extensionPath, "frontend", src))
    const scriptUri = panel.webview.asWebviewUri(scriptPath)
    return `<script src="${scriptUri}"></script>`
  })

  // Заміна шляхів до стилів
  htmlContent = htmlContent.replace(/<link rel="stylesheet" href="([^"]+)">/g, (match, href) => {
    if (href.startsWith("http")) return match // Залишаємо зовнішні стилі
    const stylePath = vscode.Uri.file(path.join(context.extensionPath, "frontend", href))
    const styleUri = panel.webview.asWebviewUri(stylePath)
    return `<link rel="stylesheet" href="${styleUri}">`
  })

  return htmlContent
}

/**
 * Налаштування обробників повідомлень від WebView
 */
function setupMessageHandlers(panel, context) {
  panel.webview.onDidReceiveMessage(async message => {
    outputChannel.appendLine(`Received message: ${message.command}`)

    try {
      switch (message.command) {
        case "loadLastSettings":
          await handleLoadSettings(panel, context)
          break

        case "saveCurrentSettings":
          await handleSaveSettings(panel, context, message.settings)
          break

        case "generateCSS":
          await handleGenerateCSS(panel, context, message.settings)
          break

        case "clearSettings":
          await handleClearSettings(panel, context)
          break

        case "getFigmaCanvases":
          await handleGetFigmaCanvases(panel, message)
          break

        case "getFigmaLayers":
          await handleGetFigmaLayers(panel, message)
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
}

/**
 * Обробка завантаження налаштувань
 */
async function handleLoadSettings(panel, context) {
  panel.webview.postMessage({
    command: "lastSettingsLoaded",
    settings: globalConfig
  })
}

/**
 * Обробка збереження налаштувань
 */
async function handleSaveSettings(panel, context, settings) {
  globalConfig = {...globalConfig, ...settings}
  const success = saveConfig(context, globalConfig)

  panel.webview.postMessage({
    command: "settingsSaved",
    success: success
  })
}

/**
 * Обробка генерації CSS
 */
async function handleGenerateCSS(panel, context, settings) {
  try {
    outputChannel.appendLine(`Starting CSS generation with mode: ${settings.mode}`)

    // Отримуємо активний HTML файл
    const activeEditor = vscode.window.activeTextEditor

    if (!activeEditor) {
      vscode.window.showErrorMessage("❌ Будь ласка, відкрийте HTML файл перед генерацією CSS")
      return
    }

    if (activeEditor.document.languageId !== "html") {
      vscode.window.showErrorMessage("❌ Команда доступна лише для HTML файлів")
      return
    }

    const htmlContent = activeEditor.document.getText()
    const htmlFilePath = activeEditor.document.uri.fsPath

    // Генеруємо CSS відповідно до режиму
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

    // Зберігаємо CSS
    const savedPath = await saveGeneratedCSS(cssContent, htmlFilePath)

    // Зберігаємо налаштування
    globalConfig = {...globalConfig, ...settings}
    saveConfig(context, globalConfig)

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
 * Обробка очищення налаштувань
 */
async function handleClearSettings(panel, context) {
  globalConfig = {
    mode: "maximum",
    figmaLink: "",
    figmaToken: "",
    selectedCanvas: [],
    selectedLayers: []
  }

  saveConfig(context, globalConfig)

  panel.webview.postMessage({
    command: "settingsCleared",
    success: true
  })
}

/**
 * Обробка отримання Canvas з Figma
 */
async function handleGetFigmaCanvases(panel, message) {
  try {
    // Імітація отримання Canvas з Figma
    const canvases = [
      {id: "desktop", name: "🎨 Desktop", childrenCount: 10},
      {id: "mobile", name: "📱 Mobile", childrenCount: 8},
      {id: "tablet", name: "📋 Tablet", childrenCount: 7},
      {id: "components", name: "🧩 Components", childrenCount: 15}
    ]

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
 * Обробка отримання Layers з Figma
 */
async function handleGetFigmaLayers(panel, message) {
  try {
    // Імітація отримання Layers з Figma
    const layers = [
      {id: "layout", name: "📐 Layout", type: "FRAME"},
      {id: "styles", name: "🎨 Styles", type: "FRAME"},
      {id: "typography", name: "🔤 Typography", type: "TEXT"},
      {id: "images", name: "🖼️ Images", type: "RECTANGLE"},
      {id: "components", name: "🔘 Components", type: "COMPONENT"}
    ]

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
 * Швидка генерація CSS (мінімальний режим)
 */
async function quickGenerateCSS(context, args = null) {
  let targetUri =
    args && args.fsPath
      ? args
      : vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.document.uri
        : null

  if (!targetUri || path.extname(targetUri.fsPath) !== ".html") {
    vscode.window.showErrorMessage("Будь ласка, відкрийте або оберіть HTML файл")
    return
  }

  const htmlContent = fs.readFileSync(targetUri.fsPath, "utf8")
  const cssContent = generateMinimalCSS(htmlContent)
  const savedPath = await saveGeneratedCSS(cssContent, targetUri.fsPath)

  vscode.window.showInformationMessage(`✅ CSS згенеровано: ${path.basename(savedPath)}`)
}

/**
 * Повна генерація з Figma (максимальний режим)
 */
async function fullGenerateWithFigma(context) {
  globalConfig.mode = "maximum"
  await openMainMenu(context)
}

/**
 * Генерація мінімального CSS
 */
function generateMinimalCSS(htmlContent) {
  const classes = extractClassesFromHTML(htmlContent)
  let cssContent = `/* CSS Classes from HTML - Minimal Mode */\n`
  cssContent += `/* Generated: ${new Date().toLocaleString()} */\n\n`

  // Reset стилі
  cssContent += `/* Reset */\n`
  cssContent += `* { margin: 0; padding: 0; box-sizing: border-box; }\n\n`

  // Генеруємо класи
  classes.forEach(className => {
    cssContent += `.${className} {\n`
    cssContent += `  /* Styles for ${className} */\n`
    cssContent += `}\n\n`
  })

  return cssContent
}

/**
 * Генерація максимального CSS з інтеграцією Figma
 */
async function generateMaximumCSS(htmlContent, settings) {
  const classes = extractClassesFromHTML(htmlContent)
  let cssContent = `/* CSS Classes from HTML - Maximum Mode */\n`
  cssContent += `/* Generated: ${new Date().toLocaleString()} */\n\n`

  // CSS змінні
  cssContent += `:root {\n`
  cssContent += `  /* Colors */\n`
  cssContent += `  --primary-color: #007ACC;\n`
  cssContent += `  --secondary-color: #6C757D;\n`
  cssContent += `  --background-color: #FFFFFF;\n`
  cssContent += `  --text-color: #212529;\n`
  cssContent += `  \n`
  cssContent += `  /* Spacing */\n`
  cssContent += `  --spacing-xs: 0.25rem;\n`
  cssContent += `  --spacing-sm: 0.5rem;\n`
  cssContent += `  --spacing-md: 1rem;\n`
  cssContent += `  --spacing-lg: 1.5rem;\n`
  cssContent += `  --spacing-xl: 2rem;\n`
  cssContent += `}\n\n`

  // Reset стилі
  if (settings.includeReset !== false) {
    cssContent += `/* Reset & Base Styles */\n`
    cssContent += `*,\n*::before,\n*::after {\n`
    cssContent += `  margin: 0;\n`
    cssContent += `  padding: 0;\n`
    cssContent += `  box-sizing: border-box;\n`
    cssContent += `}\n\n`

    cssContent += `body {\n`
    cssContent += `  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n`
    cssContent += `  line-height: 1.5;\n`
    cssContent += `  color: var(--text-color);\n`
    cssContent += `  background-color: var(--background-color);\n`
    cssContent += `}\n\n`
  }

  // Container класи
  cssContent += `/* Container */\n`
  cssContent += `.container {\n`
  cssContent += `  width: 100%;\n`
  cssContent += `  max-width: 1200px;\n`
  cssContent += `  margin: 0 auto;\n`
  cssContent += `  padding: 0 var(--spacing-md);\n`
  cssContent += `}\n\n`

  // Генеруємо класи з HTML
  classes.forEach(className => {
    const baseStyles = generateStylesForClass(className)
    cssContent += `.${className} {\n`
    cssContent += baseStyles
    cssContent += `}\n\n`
  })

  // Адаптивні стилі
  if (settings.generateResponsive !== false) {
    cssContent += `/* Responsive */\n`
    cssContent += `@media (max-width: 768px) {\n`
    cssContent += `  .container {\n`
    cssContent += `    padding: 0 var(--spacing-sm);\n`
    cssContent += `  }\n`
    cssContent += `}\n\n`
  }

  return cssContent
}

/**
 * Генерація production CSS
 */
async function generateProductionCSS(htmlContent, settings) {
  let cssContent = await generateMaximumCSS(htmlContent, settings)

  // Мінімізація CSS для production
  cssContent = cssContent
    .replace(/\/\*[\s\S]*?\*\//g, "") // Видаляємо коментарі
    .replace(/\s+/g, " ") // Замінюємо множинні пробіли
    .replace(/\s*([{:;}])\s*/g, "$1") // Видаляємо пробіли біля символів
    .trim()

  return cssContent
}

/**
 * Витягування класів з HTML
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

  return Array.from(classes).sort()
}

/**
 * Генерація стилів для класу на основі його назви
 */
function generateStylesForClass(className) {
  let styles = ""

  // Аналіз назви класу для генерації відповідних стилів
  if (className.includes("container") || className.includes("wrapper")) {
    styles += `  width: 100%;\n`
    styles += `  max-width: 1200px;\n`
    styles += `  margin: 0 auto;\n`
    styles += `  padding: var(--spacing-md);\n`
  } else if (className.includes("btn") || className.includes("button")) {
    styles += `  display: inline-flex;\n`
    styles += `  align-items: center;\n`
    styles += `  justify-content: center;\n`
    styles += `  padding: var(--spacing-sm) var(--spacing-md);\n`
    styles += `  border: none;\n`
    styles += `  border-radius: 4px;\n`
    styles += `  background-color: var(--primary-color);\n`
    styles += `  color: white;\n`
    styles += `  cursor: pointer;\n`
    styles += `  transition: all 0.3s ease;\n`
  } else if (className.includes("card")) {
    styles += `  background: white;\n`
    styles += `  border-radius: 8px;\n`
    styles += `  padding: var(--spacing-md);\n`
    styles += `  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n`
  } else if (className.includes("title") || className.includes("heading")) {
    styles += `  font-size: 2rem;\n`
    styles += `  font-weight: 700;\n`
    styles += `  margin-bottom: var(--spacing-md);\n`
    styles += `  color: var(--text-color);\n`
  } else if (className.includes("text") || className.includes("paragraph")) {
    styles += `  font-size: 1rem;\n`
    styles += `  line-height: 1.6;\n`
    styles += `  margin-bottom: var(--spacing-sm);\n`
  } else if (className.includes("nav")) {
    styles += `  display: flex;\n`
    styles += `  align-items: center;\n`
    styles += `  gap: var(--spacing-md);\n`
  } else if (className.includes("list")) {
    styles += `  list-style: none;\n`
    styles += `  padding: 0;\n`
    styles += `  margin: 0;\n`
  } else {
    styles += `  /* Auto-generated styles */\n`
  }

  return styles
}

/**
 * Збереження згенерованого CSS
 */
async function saveGeneratedCSS(cssContent, htmlFilePath) {
  const htmlDir = path.dirname(htmlFilePath)
  const htmlFileName = path.basename(htmlFilePath, ".html")

  // Створюємо папку css якщо не існує
  const cssDir = path.join(htmlDir, "css")
  if (!fs.existsSync(cssDir)) {
    fs.mkdirSync(cssDir, {recursive: true})
  }

  // Генеруємо ім'я файлу
  const timestamp = new Date().toISOString().split("T")[0]
  const cssFileName = `${htmlFileName}-styles-${timestamp}.css`
  const cssFilePath = path.join(cssDir, cssFileName)

  // Записуємо файл
  fs.writeFileSync(cssFilePath, cssContent, "utf8")

  outputChannel.appendLine(`CSS saved to: ${cssFilePath}`)

  return cssFilePath
}

/**
 * Fallback HTML для випадку помилки
 */
function getFallbackHTML() {
  return `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CSS Classes from HTML - Error</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #1e1e1e;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }
    .error-container {
      text-align: center;
      max-width: 500px;
    }
    h1 {
      color: #f44336;
      margin-bottom: 1rem;
    }
    p {
      color: #ccc;
      line-height: 1.6;
    }
    button {
      background: #007ACC;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 1rem;
    }
    button:hover {
      background: #005a9e;
    }
  </style>
</head>
<body>
  <div class="error-container">
    <h1>❌ Помилка завантаження меню</h1>
    <p>Не вдалося завантажити головне меню розширення.</p>
    <p>Будь ласка, перезавантажте VS Code або зверніться до розробника.</p>
    <button onclick="location.reload()">Спробувати ще раз</button>
  </div>
</body>
</html>`
}

// Експорт модуля
module.exports = {
  activate,
  deactivate
}
