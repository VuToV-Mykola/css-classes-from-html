// extension.js
const vscode = require("vscode")
const path = require("path")
const fs = require("fs")
const https = require("https")

// ✅ FIX: Ініціалізація менеджерів конфігурації
let configManager = {
  initialize: () => {},
  loadConfig: () => ({}),
  saveConfig: () => true,
  clearConfig: () => {},
  defaultConfig: {}
}

let ConfigLoader = function () {}

// Глобальні змінні
let panel = null
let outputChannel = null
let htmlContext = {
  activeHtmlFile: null,
  htmlContent: null,
  htmlFilePath: null,
  source: "none"
}

// Ініціалізація менеджерів конфігурації
const configLoader = new ConfigLoader()
let globalConfig = configManager.defaultConfig

/**
 * Активація розширення
 */
function activate(context) {
  console.log("✅ CSS Classes from HTML Extension activated")

  // Ініціалізація менеджера конфігурації
  configManager.initialize(context.extensionPath)

  // Завантажуємо збережену конфігурацію
  globalConfig = configManager.loadConfig()

  // Створюємо output channel для логування
  outputChannel = vscode.window.createOutputChannel("CSS Classes from HTML")
  outputChannel.appendLine("Extension activated successfully")

  // ✅ FIX: Реєструємо команду showMenuFromContext
  const showMenuFromContextCommand = vscode.commands.registerCommand(
    "css-classes.showMenuFromContext",
    async uri => {
      outputChannel.appendLine("Command 'css-classes.showMenuFromContext' executed")
      await handleHtmlContext(uri)
      await openMainMenu(context)
    }
  )

  // Реєструємо команду showMenu
  const showMenuCommand = vscode.commands.registerCommand("css-classes.showMenu", async () => {
    outputChannel.appendLine("Command 'css-classes.showMenu' executed")
    await handleHtmlContext()
    await openMainMenu(context)
  })

  // Реєструємо команду openCanvasSelector (для сумісності)
  const openCanvasSelectorCommand = vscode.commands.registerCommand(
    "css-classes.openCanvasSelector",
    async () => {
      outputChannel.appendLine("Command 'css-classes.openCanvasSelector' executed")
      await handleHtmlContext()
      await openMainMenu(context)
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
    showMenuFromContextCommand,
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
 * Обробка контексту HTML файлу
 */
async function handleHtmlContext(uri = null) {
  try {
    if (uri && uri.fsPath && uri.fsPath.endsWith(".html")) {
      // Контекст з правого кліку на файл
      htmlContext = {
        activeHtmlFile: uri.fsPath,
        htmlContent: fs.readFileSync(uri.fsPath, "utf8"),
        htmlFilePath: uri.fsPath,
        source: "context-menu"
      }
      outputChannel.appendLine(`HTML context from context menu: ${path.basename(uri.fsPath)}`)
    } else {
      // Контекст з активної вкладки
      const activeEditor = vscode.window.activeTextEditor
      if (activeEditor && activeEditor.document.languageId === "html") {
        htmlContext = {
          activeHtmlFile: activeEditor.document.uri.fsPath,
          htmlContent: activeEditor.document.getText(),
          htmlFilePath: activeEditor.document.uri.fsPath,
          source: "active-tab"
        }
        outputChannel.appendLine(
          `HTML context from active editor: ${path.basename(activeEditor.document.uri.fsPath)}`
        )
      } else {
        // Немає HTML контексту
        htmlContext = {
          activeHtmlFile: null,
          htmlContent: null,
          htmlFilePath: null,
          source: "none"
        }
        outputChannel.appendLine("No HTML context available")
      }
    }
  } catch (error) {
    outputChannel.appendLine(`Error handling HTML context: ${error.message}`)
    htmlContext = {
      activeHtmlFile: null,
      htmlContent: null,
      htmlFilePath: null,
      source: "error"
    }
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
    "CSS Classes from HTML",
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

    // Передаємо контекст HTML в WebView
    setTimeout(() => {
      panel.webview.postMessage({
        command: "htmlContextLoaded",
        hasHtmlContext: !!htmlContext.activeHtmlFile,
        htmlFileName: htmlContext.activeHtmlFile ? path.basename(htmlContext.activeHtmlFile) : null
      })
    }, 100)
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
    // Якщо файл не знайдено, створюємо його
    const defaultHTML = getDefaultMenuHTML()
    const frontendDir = path.join(context.extensionPath, "frontend")
    if (!fs.existsSync(frontendDir)) {
      fs.mkdirSync(frontendDir, {recursive: true})
    }
    fs.writeFileSync(htmlPath, defaultHTML, "utf8")
    return defaultHTML
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

        case "getLayerStyles":
          await handleGetLayerStyles(panel, message)
          break

        case "validateFigmaLink":
          await handleValidateFigmaLink(panel, message)
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
  const success = configManager.saveConfig(globalConfig)

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

    // Використовуємо контекст HTML замість активного редактора
    if (!htmlContext || !htmlContext.htmlContent) {
      // Якщо контексту немає, намагаємося отримати з активного редактора
      const activeEditor = vscode.window.activeTextEditor
      if (activeEditor && activeEditor.document.languageId === "html") {
        htmlContext = {
          activeHtmlFile: activeEditor.document.uri.fsPath,
          htmlContent: activeEditor.document.getText(),
          htmlFilePath: activeEditor.document.uri.fsPath,
          source: "active-tab"
        }
      } else {
        vscode.window.showErrorMessage("❌ Будь ласка, відкрийте HTML файл перед генерацією CSS")
        return
      }
    }

    const htmlContent = htmlContext.htmlContent
    const htmlFilePath = htmlContext.htmlFilePath

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
    configManager.saveConfig(globalConfig)

    // Відкриваємо згенерований CSS файл
    await openGeneratedCSSFile(savedPath)

    // Закриваємо меню
    if (panel) {
      panel.dispose()
      panel = null
    }

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
 * Відкриває згенерований CSS файл у редакторі
 */
async function openGeneratedCSSFile(cssFilePath) {
  try {
    const cssUri = vscode.Uri.file(cssFilePath)
    const document = await vscode.workspace.openTextDocument(cssUri)
    await vscode.window.showTextDocument(document, {
      viewColumn: vscode.ViewColumn.Beside,
      preview: false
    })
    outputChannel.appendLine(`CSS file opened: ${cssFilePath}`)
  } catch (error) {
    outputChannel.appendLine(`Failed to open CSS file: ${error.message}`)
    vscode.window.showWarningMessage(`Не вдалося відкрити файл: ${path.basename(cssFilePath)}`)
  }
}

/**
 * Обробка очищення налаштувань
 */
async function handleClearSettings(panel, context) {
  globalConfig = configManager.defaultConfig
  configManager.clearConfig()

  panel.webview.postMessage({
    command: "settingsCleared",
    success: true
  })
}

/**
 * Отримання реальних Canvas з Figma
 */
async function handleGetFigmaCanvases(panel, message) {
  try {
    const {figmaLink, figmaToken} = message

    if (!figmaLink) {
      throw new Error("Необхідно вказати посилання на Figma файл")
    }

    // Витягуємо ID файлу з посилання на Figma
    const fileId = extractFileIdFromFigmaLink(figmaLink)
    if (!fileId) {
      throw new Error("Невірний формат посилання на Figma файл")
    }

    // Отримуємо дані файлу з Figma API
    const figmaData = await fetchFigmaFile(fileId, figmaToken)

    // Витягуємо Canvas (сторінки) з файлу
    const canvases = extractCanvasesFromFigmaData(figmaData)

    panel.webview.postMessage({
      command: "figmaCanvases",
      canvases: canvases
    })
  } catch (error) {
    outputChannel.appendLine(`Error getting Figma canvases: ${error.message}`)
    panel.webview.postMessage({
      command: "error",
      message: `Помилка отримання Canvas з Figma: ${error.message}`
    })
  }
}

/**
 * Отримання реальних Layers з Figma
 */
async function handleGetFigmaLayers(panel, message) {
  try {
    const {figmaLink, figmaToken, canvasId} = message

    if (!figmaLink || !canvasId) {
      throw new Error("Необхідні параметри: figmaLink, canvasId")
    }

    const fileId = extractFileIdFromFigmaLink(figmaLink)
    if (!fileId) {
      throw new Error("Невірний формат посилання на Figma файл")
    }

    // Отримуємо дані файлу
    const figmaData = await fetchFigmaFile(fileId, figmaToken)

    // Витягуємо Layers з конкретного Canvas
    const layers = extractLayersFromCanvas(figmaData, canvasId)

    panel.webview.postMessage({
      command: "figmaLayers",
      layers: layers
    })
  } catch (error) {
    outputChannel.appendLine(`Error getting Figma layers: ${error.message}`)
    panel.webview.postMessage({
      command: "error",
      message: `Помилка отримання Layers з Figma: ${error.message}`
    })
  }
}

/**
 * Обробка отримання стилів конкретного Layer
 */
async function handleGetLayerStyles(panel, message) {
  try {
    const {figmaLink, figmaToken, layerId} = message

    if (!figmaLink || !layerId) {
      throw new Error("Необхідні параметри: figmaLink, layerId")
    }

    const fileId = extractFileIdFromFigmaLink(figmaLink)
    const layerData = await getLayerStyles({fileKey: fileId}, layerId, figmaToken)

    panel.webview.postMessage({
      command: "layerStyles",
      layerId: layerId,
      styles: layerData
    })
  } catch (error) {
    outputChannel.appendLine(`Error getting layer styles: ${error.message}`)
    panel.webview.postMessage({
      command: "error",
      message: `Помилка отримання стилів слою: ${error.message}`
    })
  }
}

/**
 * Валідація Figma посилання
 */
async function handleValidateFigmaLink(panel, message) {
  try {
    const {figmaLink, figmaToken} = message

    if (!figmaLink) {
      panel.webview.postMessage({
        command: "figmaLinkValidated",
        isValid: false,
        message: "Посилання не вказано"
      })
      return
    }

    const fileId = extractFileIdFromFigmaLink(figmaLink)
    if (!fileId) {
      panel.webview.postMessage({
        command: "figmaLinkValidated",
        isValid: false,
        message: "Невірний формат посилання"
      })
      return
    }

    // Спроба отримати дані файлу для валідації
    try {
      await fetchFigmaFile(fileId, figmaToken)
      panel.webview.postMessage({
        command: "figmaLinkValidated",
        isValid: true,
        message: "Посилання валідне"
      })
    } catch (error) {
      panel.webview.postMessage({
        command: "figmaLinkValidated",
        isValid: false,
        message: "Не вдалося отримати доступ до файлу"
      })
    }
  } catch (error) {
    panel.webview.postMessage({
      command: "figmaLinkValidated",
      isValid: false,
      message: error.message
    })
  }
}

/**
 * Витягує ID файлу з посилання на Figma
 */
function extractFileIdFromFigmaLink(figmaLink) {
  try {
    // Приклад посилань:
    // https://www.figma.com/file/ABC123456789/Project-Name
    // https://www.figma.com/design/Gz419qk0jPvKUuSgURTNP2/Simply-Chocolate-v17node-id=5701-1482&t=xaMM5ywXzG2vyyjC-1

    let fileId = null

    // Спроба 1: пошук у стандартному форматі /file/
    let match = figmaLink.match(/file\/([a-zA-Z0-9]+)/)
    if (match) {
      fileId = match[1]
    }

    // Спроба 2: пошук у форматі /design/
    if (!fileId) {
      match = figmaLink.match(/design\/([a-zA-Z0-9]+)/)
      if (match) {
        fileId = match[1]
      }
    }

    // Спроба 3: пошук прямого ID у URL (видаляємо все після ?)
    if (!fileId) {
      const cleanLink = figmaLink.split("?")[0]
      match = cleanLink.match(/([a-zA-Z0-9]{17,22})/)
      if (match) {
        fileId = match[1]
      }
    }

    if (!fileId) {
      outputChannel.appendLine(`Не вдалося витягти ID з посилання: ${figmaLink}`)
      return null
    }

    outputChannel.appendLine(`Витягнуто Figma file ID: ${fileId} з посилання: ${figmaLink}`)
    return fileId
  } catch (error) {
    outputChannel.appendLine(`Error extracting file ID: ${error.message}`)
    return null
  }
}

/**
 * Отримання даних файлу з Figma API
 */
async function fetchFigmaFile(fileId, accessToken) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.figma.com",
      path: `/v1/files/${fileId}`,
      method: "GET",
      headers: {
        "X-FIGMA-TOKEN": accessToken || ""
      }
    }

    const req = https.request(options, res => {
      let data = ""

      res.on("data", chunk => {
        data += chunk
      })

      res.on("end", () => {
        if (res.statusCode >= 400) {
          try {
            const errorData = JSON.parse(data)
            reject(new Error(errorData.message || `HTTP error ${res.statusCode}`))
          } catch {
            reject(new Error(`HTTP error ${res.statusCode}`))
          }
        } else {
          try {
            resolve(JSON.parse(data))
          } catch (error) {
            reject(new Error("Invalid JSON response from Figma API"))
          }
        }
      })
    })

    req.on("error", error => {
      reject(new Error(`Network error: ${error.message}`))
    })

    req.setTimeout(10000, () => {
      req.destroy()
      reject(new Error("Request timeout to Figma API"))
    })

    req.end()
  })
}

/**
 * Витягує Canvas (сторінки) з даних Figma
 */
function extractCanvasesFromFigmaData(figmaData) {
  const canvases = []

  if (!figmaData.document || !figmaData.document.children) {
    return canvases
  }

  // Діти документа - це Canvas (сторінки)
  figmaData.document.children.forEach((canvas, index) => {
    if (canvas.type === "CANVAS") {
      canvases.push({
        id: canvas.id,
        name: canvas.name || `Canvas ${index + 1}`,
        childrenCount: countChildren(canvas),
        type: canvas.type
      })
    }
  })

  return canvases
}

/**
 * Витягує Layers з конкретного Canvas
 */
function extractLayersFromCanvas(figmaData, canvasId) {
  const layers = []

  // Знаходимо Canvas за ID
  const canvas = findCanvasById(figmaData.document, canvasId)
  if (!canvas || !canvas.children) {
    return layers
  }

  // Рекурсивно обходимо всі слої
  traverseLayers(canvas.children, layers)

  return layers
}

/**
 * Рекурсивний обхід слоїв
 */
function traverseLayers(nodes, layers, depth = 0) {
  nodes.forEach(node => {
    // Додаємо тільки видимі слої з корисними типами
    if (node.visible !== false && isUsefulLayerType(node.type)) {
      layers.push({
        id: node.id,
        name: getLayerName(node),
        type: node.type,
        depth: depth,
        hasChildren: node.children && node.children.length > 0
      })
    }

    // Рекурсивно обходимо дітей
    if (node.children && node.children.length > 0) {
      traverseLayers(node.children, layers, depth + 1)
    }
  })
}

/**
 * Перевіряє чи тип слою корисний для CSS генерації
 */
function isUsefulLayerType(type) {
  const usefulTypes = [
    "FRAME",
    "GROUP",
    "RECTANGLE",
    "TEXT",
    "COMPONENT",
    "INSTANCE",
    "VECTOR",
    "LINE",
    "ELLIPSE",
    "POLYGON"
  ]
  return usefulTypes.includes(type)
}

/**
 * Генерує зрозуміле ім'я для слою
 */
function getLayerName(node) {
  if (node.name) return node.name

  // Генеруємо ім'я на основі типу
  const typeNames = {
    FRAME: "Frame",
    GROUP: "Group",
    RECTANGLE: "Rectangle",
    TEXT: "Text",
    COMPONENT: "Component",
    INSTANCE: "Instance",
    VECTOR: "Vector",
    LINE: "Line",
    ELLIPSE: "Ellipse",
    POLYGON: "Polygon"
  }

  return typeNames[node.type] || node.type
}

/**
 * Знаходить Canvas за ID
 */
function findCanvasById(node, canvasId) {
  if (node.id === canvasId && node.type === "CANVAS") {
    return node
  }

  if (node.children) {
    for (const child of node.children) {
      const found = findCanvasById(child, canvasId)
      if (found) return found
    }
  }

  return null
}

/**
 * Підраховує кількість дітей у вузлі
 */
function countChildren(node) {
  let count = 0

  if (node.children) {
    node.children.forEach(child => {
      count++ // Поточний дитини
      count += countChildren(child) // Рекурсивно діти дітей
    })
  }

  return count
}

/**
 * Отримання стилів з конкретного Layer
 */
async function getLayerStyles(figmaData, layerId, accessToken) {
  try {
    const fileId = figmaData.fileKey
    if (!fileId) return null

    const response = await new Promise((resolve, reject) => {
      const options = {
        hostname: "api.figma.com",
        path: `/v1/files/${fileId}/nodes?ids=${layerId}`,
        method: "GET",
        headers: {
          "X-FIGMA-TOKEN": accessToken || ""
        }
      }

      const req = https.request(options, res => {
        let data = ""

        res.on("data", chunk => {
          data += chunk
        })

        res.on("end", () => {
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP error ${res.statusCode}`))
          } else {
            try {
              resolve(JSON.parse(data))
            } catch (error) {
              reject(new Error("Invalid JSON response"))
            }
          }
        })
      })

      req.on("error", reject)
      req.setTimeout(10000, () => {
        req.destroy()
        reject(new Error("Request timeout"))
      })

      req.end()
    })

    return response.nodes[layerId]?.document || null
  } catch (error) {
    outputChannel.appendLine(`Error getting layer styles: ${error.message}`)
    return null
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

  // Відкриваємо згенерований CSS файл
  await openGeneratedCSSFile(savedPath)

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
  } else if (className.includes("flex")) {
    styles += `  display: flex;\n`
  } else if (className.includes("grid")) {
    styles += `  display: grid;\n`
  } else if (className.includes("hidden")) {
    styles += `  display: none;\n`
  } else if (className.includes("visible")) {
    styles += `  display: block;\n`
  } else if (className.includes("center")) {
    styles += `  text-align: center;\n`
  } else if (className.includes("left")) {
    styles += `  text-align: left;\n`
  } else if (className.includes("right")) {
    styles += `  text-align: right;\n`
  } else {
    // Базові стилі для невідомих класів
    styles += `  /* Add styles for ${className} */\n`
  }

  return styles
}

/**
 * Збереження згенерованого CSS
 */
async function saveGeneratedCSS(cssContent, htmlFilePath) {
  const htmlDir = path.dirname(htmlFilePath)
  const htmlName = path.basename(htmlFilePath, ".html")
  const cssFileName = `${htmlName}.css`
  const cssFilePath = path.join(htmlDir, cssFileName)

  // Перевіряємо чи файл вже існує
  let counter = 1
  let finalPath = cssFilePath

  while (fs.existsSync(finalPath)) {
    const newName = `${htmlName}-${counter}.css`
    finalPath = path.join(htmlDir, newName)
    counter++
  }

  fs.writeFileSync(finalPath, cssContent, "utf8")
  outputChannel.appendLine(`CSS saved to: ${finalPath}`)

  return finalPath
}

/**
 * Fallback HTML для випадку помилки
 */
function getFallbackHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSS Classes from HTML</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            padding: 20px;
            background: #f5f5f5;
        }
        .error-container {
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #e74c3c;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <h1>⚠️ Error Loading Menu</h1>
        <p>Unable to load the configuration menu. Please try reopening the menu or check the extension logs.</p>
        <p>You can also try the quick commands:</p>
        <ul>
            <li><strong>Quick Generate CSS</strong> - Generates minimal CSS from current HTML</li>
            <li><strong>Full Generate with Figma</strong> - Opens configuration menu</li>
        </ul>
    </div>
</body>
</html>`
}

/**
 * Default HTML для меню
 */
function getDefaultMenuHTML() {
  return `<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSS Classes from HTML</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --primary: #007ACC;
            --primary-dark: #005a9e;
            --success: #4caf50;
            --warning: #ff9800;
            --danger: #f44336;
            --bg: #1e1e1e;
            --bg-secondary: #252526;
            --bg-tertiary: #2d2d30;
            --text: #cccccc;
            --text-secondary: #8c8c8c;
            --border: #3c3c3c;
            --shadow: rgba(0, 0, 0, 0.3);
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--bg);
            color: var(--text);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            font-size: 13px;
            line-height: 1.4;
        }

        /* Header */
        .header {
            background: var(--bg-secondary);
            padding: 1rem;
            border-bottom: 1px solid var(--border);
            text-align: center;
        }

        .header h1 {
            font-size: 1.4rem;
            color: var(--primary);
            margin-bottom: 0.3rem;
        }

        .header p {
            color: var(--text-secondary);
            font-size: 0.85rem;
        }

        /* Container */
        .container {
            flex: 1;
            padding: 1rem;
            max-width: 1000px;
            margin: 0 auto;
            width: 100%;
        }

        /* Mode selector */
        .mode-selector {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 0.8rem;
            margin-bottom: 1.5rem;
        }

        .mode-card {
            background: var(--bg-secondary);
            border: 2px solid var(--border);
            border-radius: 6px;
            padding: 1.2rem;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
        }

        .mode-card:hover {
            border-color: var(--primary);
            transform: translateY(-1px);
            box-shadow: 0 2px 8px var(--shadow);
        }

        .mode-card.selected {
            border-color: var(--success);
            background: var(--bg-tertiary);
        }

        .mode-card.selected::after {
            content: '✓';
            position: absolute;
            top: 0.8rem;
            right: 0.8rem;
            background: var(--success);
            color: white;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
        }

        .mode-icon {
            font-size: 1.6rem;
            margin-bottom: 0.8rem;
        }

        .mode-title {
            font-size: 1.1rem;
            margin-bottom: 0.4rem;
            color: var(--text);
        }

        .mode-description {
            color: var(--text-secondary);
            font-size: 0.8rem;
        }

        /* Sections */
        .section {
            background: var(--bg-secondary);
            border-radius: 6px;
            padding: 1.2rem;
            margin-bottom: 1rem;
            display: none;
        }

        .section.active {
            display: block;
        }

        .section-title {
            font-size: 1.1rem;
            margin-bottom: 0.8rem;
            color: var(--primary);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        /* Form elements */
        .input-group {
            margin-bottom: 0.8rem;
            position: relative;
        }

        .input-group label {
            display: block;
            margin-bottom: 0.4rem;
            color: var(--text-secondary);
            font-size: 0.8rem;
        }

        .input-group input,
        .input-group select {
            width: 100%;
            padding: 0.6rem;
            background: var(--bg-tertiary);
            border: 1px solid var(--border);
            color: var(--text);
            border-radius: 4px;
            font-size: 0.9rem;
        }

        .input-group input:focus,
        .input-group select:focus {
            outline: none;
            border-color: var(--primary);
        }

        /* Validation indicators */
        .validation-indicator {
            position: absolute;
            right: 0.6rem;
            top: 2.1rem;
            width: 8px;
            height: 8px;
            border-radius: 50%;
        }

        .validation-valid {
            background: var(--success);
        }

        .validation-invalid {
            background: var(--danger);
        }

        /* Checkboxes */
        .checkbox-group {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 0.6rem;
            margin: 0.8rem 0;
        }

        .checkbox-item {
            display: flex;
            align-items: center;
            padding: 0.6rem;
            background: var(--bg-tertiary);
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
            border: 2px solid transparent;
        }

        .checkbox-item:hover {
            background: var(--bg);
        }

        .checkbox-item.selected {
            background: var(--bg);
            border-color: var(--primary);
        }

        .checkbox-item input[type="checkbox"] {
            margin-right: 0.4rem;
            width: 16px;
            height: 16px;
            cursor: pointer;
        }

        .checkbox-item label {
            cursor: pointer;
            user-select: none;
            color: var(--text);
            display: flex;
            align-items: center;
            gap: 0.4rem;
            font-size: 0.9rem;
        }

        /* Buttons */
        .btn {
            padding: 0.6rem 1.2rem;
            border: none;
            border-radius: 4px;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
        }

        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .btn-primary {
            background: var(--primary);
            color: white;
        }

        .btn-primary:hover:not(:disabled) {
            background: var(--primary-dark);
        }

        .btn-secondary {
            background: var(--bg-tertiary);
            color: var(--text);
            border: 1px solid var(--border);
        }

        .btn-secondary:hover:not(:disabled) {
            background: var(--bg);
            border-color: var(--primary);
        }

        /* Actions */
        .actions {
            display: flex;
            gap: 0.8rem;
            justify-content: center;
            padding: 1.2rem;
            background: var(--bg-secondary);
            border-top: 1px solid var(--border);
            position: sticky;
            bottom: 0;
        }

        /* Status messages */
        .status {
            text-align: center;
            padding: 0.8rem;
            margin: 0.8rem 0;
            border-radius: 4px;
            display: none;
            font-size: 0.9rem;
        }

        .status.show {
            display: block;
        }

        .status.success {
            background: rgba(76, 175, 80, 0.1);
            border: 1px solid var(--success);
            color: var(--success);
        }

        .status.error {
            background: rgba(244, 67, 54, 0.1);
            border: 1px solid var(--danger);
            color: var(--danger);
        }

        .status.warning {
            background: rgba(255, 152, 0, 0.1);
            border: 1px solid var(--warning);
            color: var(--warning);
        }

        /* Loading spinner */
        .loading {
            display: inline-block;
            width: 14px;
            height: 14px;
            border: 2px solid var(--text-secondary);
            border-radius: 50%;
            border-top-color: var(--primary);
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Canvas list */
        .canvas-list {
            max-height: 300px;
            overflow-y: auto;
        }

        .canvas-item {
            padding: 0.8rem;
            border: 1px solid var(--border);
            border-radius: 4px;
            margin-bottom: 0.5rem;
            cursor: pointer;
            transition: all 0.2s;
        }

        .canvas-item:hover {
            border-color: var(--primary);
            background: var(--bg-tertiary);
        }

        .canvas-item.selected {
            border-color: var(--success);
            background: var(--bg-tertiary);
        }

        /* Responsive */
        @media (max-width: 768px) {
            .container {
                padding: 0.8rem;
            }
            
            .mode-selector {
                grid-template-columns: 1fr;
            }
            
            .actions {
                flex-direction: column;
            }
            
            .btn {
                width: 100%;
                justify-content: center;
            }
            
            .checkbox-group {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 480px) {
            .header h1 {
                font-size: 1.2rem;
            }
            
            .mode-card {
                padding: 1rem;
            }
            
            .section {
                padding: 1rem;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎨 CSS Classes from HTML</h1>
        <p>Автоматична генерація CSS з HTML файлів та інтеграція з Figma</p>
    </div>

    <div class="container">
        <!-- Mode Selection -->
        <div class="mode-selector" id="modeSelector">
            <div class="mode-card" data-mode="minimal">
                <div class="mode-icon">⚡</div>
                <div class="mode-title">Мінімальний</div>
                <div class="mode-description">Базова генерація CSS класів без додаткових опцій</div>
            </div>
            
            <div class="mode-card" data-mode="maximum">
                <div class="mode-icon">🚀</div>
                <div class="mode-title">Максимальний</div>
                <div class="mode-description">Повна інтеграція з Figma, всі можливості</div>
            </div>
            
            <div class="mode-card" data-mode="production">
                <div class="mode-icon">📦</div>
                <div class="mode-title">Production</div>
                <div class="mode-description">Оптимізований CSS для продакшену</div>
            </div>
        </div>

        <!-- Figma Configuration -->
        <div class="section" id="figmaSection">
            <h2 class="section-title">🎨 Налаштування Figma</h2>
            
            <div class="input-group">
                <label for="figmaLink">Посилання на Figma файл</label>
                <input type="text" id="figmaLink" placeholder="https://www.figma.com/file/..." class="validation-input">
                <div class="validation-indicator" id="figmaLinkIndicator"></div>
            </div>

            <div class="input-group">
                <label for="figmaToken">Figma API Token (опціонально)</label>
                <input type="password" id="figmaToken" placeholder="Ваш Figma API токен">
            </div>

            <button class="btn btn-secondary" id="loadCanvasBtn">
                📋 Завантажити Canvas
            </button>
        </div>

        <!-- Canvas Selection -->
        <div class="section" id="canvasSection">
            <h2 class="section-title">📋 Вибір Canvas</h2>
            <div class="canvas-list" id="canvasList">
                <!-- Динамічно заповнюється -->
            </div>
        </div>

        <!-- Layers Selection -->
        <div class="section" id="layersSection">
            <h2 class="section-title">🎨 Вибір Layers</h2>
            <div class="canvas-list" id="layersList">
                <!-- Динамічно заповнюється -->
            </div>
        </div>

        <!-- Options -->
        <div class="section" id="optionsSection">
            <h2 class="section-title">⚙️ Додаткові налаштування</h2>
            
            <div class="checkbox-group">
                <div class="checkbox-item">
                    <input type="checkbox" id="includeReset" checked>
                    <label for="includeReset">Включити Reset стилі</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" id="includeComments" checked>
                    <label for="includeComments">Додати коментарі</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" id="optimizeCSS" checked>
                    <label for="optimizeCSS">Оптимізувати CSS</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" id="generateResponsive" checked>
                    <label for="generateResponsive">Генерувати адаптивні стилі</label>
                </div>
            </div>
        </div>

        <!-- Status Messages -->
        <div id="status" class="status"></div>
    </div>

    <!-- Action Buttons -->
    <div class="actions">
        <button class="btn btn-secondary" id="loadLastBtn">
            📂 Завантажити останні
        </button>
        <button class="btn btn-secondary" id="saveBtn">
            💾 Зберегти
        </button>
        <button class="btn btn-secondary" id="clearBtn">
            🗑️ Очистити
        </button>
        <button class="btn btn-primary" id="generateBtn" disabled>
            🚀 Згенерувати CSS
        </button>
    </div>

    <script>
        // VS Code API
        const vscode = acquireVsCodeApi();
        
        // Global state
        let state = {
            mode: null,
            figmaLink: '',
            figmaToken: '',
            selectedCanvas: null,
            selectedLayers: [],
            includeReset: true,
            includeComments: true,
            optimizeCSS: true,
            generateResponsive: true
        };

        // Initialize on load
        window.addEventListener('DOMContentLoaded', () => {
            initializeUI();
            loadLastSettings();
        });

        // Initialize UI
        function initializeUI() {
            // Mode selection
            document.querySelectorAll('.mode-card').forEach(card => {
                card.addEventListener('click', function() {
                    selectMode(this.dataset.mode);
                });
            });

            // Checkbox handling
            document.querySelectorAll('.checkbox-item input').forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    const parent = this.closest('.checkbox-item');
                    if (this.checked) {
                        parent.classList.add('selected');
                    } else {
                        parent.classList.remove('selected');
                    }
                    updateState();
                });
            });

            // Button handlers
            document.getElementById('loadLastBtn').addEventListener('click', loadLastSettings);
            document.getElementById('saveBtn').addEventListener('click', saveSettings);
            document.getElementById('clearBtn').addEventListener('click', clearSettings);
            document.getElementById('generateBtn').addEventListener('click', generateCSS);
            document.getElementById('loadCanvasBtn').addEventListener('click', loadFigmaCanvases);

            // Input handlers
            document.getElementById('figmaLink').addEventListener('input', function() {
                updateState();
                validateFigmaLink();
            });

            document.getElementById('figmaToken').addEventListener('input', updateState);
        }

        // Select mode
        function selectMode(mode) {
            // Update UI
            document.querySelectorAll('.mode-card').forEach(card => {
                card.classList.remove('selected');
            });
            document.querySelector(\`[data-mode="\${mode}"]\`).classList.add('selected');
            
            // Update state
            state.mode = mode;
            
            // Show/hide sections based on mode
            const showFigma = mode !== 'minimal';
            document.getElementById('figmaSection').classList.toggle('active', showFigma);
            document.getElementById('optionsSection').classList.add('active');
            
            // Enable generate button if mode selected
            document.getElementById('generateBtn').disabled = false;
            
            showStatus(\`Режим "\${getModeName(mode)}" вибрано\`, 'success');
            updateState();
        }

        // Get mode name in Ukrainian
        function getModeName(mode) {
            const names = {
                minimal: 'Мінімальний',
                maximum: 'Максимальний',
                production: 'Production'
            };
            return names[mode] || mode;
        }

        // Update state
        function updateState() {
            state.figmaLink = document.getElementById('figmaLink').value || '';
            state.figmaToken = document.getElementById('figmaToken').value || '';
            state.includeReset = document.getElementById('includeReset').checked || false;
            state.includeComments = document.getElementById('includeComments').checked || false;
            state.optimizeCSS = document.getElementById('optimizeCSS').checked || false;
            state.generateResponsive = document.getElementById('generateResponsive').checked || false;
        }

        // Validate Figma link
        function validateFigmaLink() {
            const link = document.getElementById('figmaLink').value;
            const indicator = document.getElementById('figmaLinkIndicator');
            
            if (!link) {
                indicator.className = 'validation-indicator';
                return;
            }

            // Basic validation
            if (link.includes('figma.com') && (link.includes('/file/') || link.includes('/design/'))) {
                indicator.className = 'validation-indicator validation-valid';
                
                // Send for deeper validation
                vscode.postMessage({
                    command: 'validateFigmaLink',
                    figmaLink: link,
                    figmaToken: state.figmaToken
                });
            } else {
                indicator.className = 'validation-indicator validation-invalid';
            }
        }

        // Load last settings
        function loadLastSettings() {
            showStatus('<span class="loading"></span> Завантаження налаштувань...', 'warning');
            vscode.postMessage({ command: 'loadLastSettings' });
        }

        // Save settings
        function saveSettings() {
            updateState();
            showStatus('<span class="loading"></span> Збереження налаштувань...', 'warning');
            vscode.postMessage({
                command: 'saveCurrentSettings',
                settings: state
            });
        }

        // Clear settings
        function clearSettings() {
            // Reset UI
            document.querySelectorAll('.mode-card').forEach(card => {
                card.classList.remove('selected');
            });
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
                cb.closest('.checkbox-item')?.classList.remove('selected');
            });
            document.querySelectorAll('input[type="text"], input[type="password"]').forEach(input => {
                input.value = '';
            });
            
            // Reset validation indicators
            document.getElementById('figmaLinkIndicator').className = 'validation-indicator';
            
            // Reset canvas and layers
            document.getElementById('canvasList').innerHTML = '';
            document.getElementById('layersList').innerHTML = '';
            
            // Reset state
            state = {
                mode: null,
                figmaLink: '',
                figmaToken: '',
                selectedCanvas: null,
                selectedLayers: [],
                includeReset: true,
                includeComments: true,
                optimizeCSS: true,
                generateResponsive: true
            };
            
            // Disable generate button
            document.getElementById('generateBtn').disabled = true;
            
            // Hide sections
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            
            showStatus('Налаштування очищено', 'success');
            
            // Send to extension
            vscode.postMessage({ command: 'clearSettings' });
        }

        // Generate CSS
        function generateCSS() {
            if (!state.mode) {
                showStatus('Виберіть режим генерації', 'error');
                return;
            }
            
            updateState();
            showStatus('<span class="loading"></span> Генерація CSS...', 'warning');
            
            vscode.postMessage({
                command: 'generateCSS',
                settings: state
            });
        }

        // Load Figma canvases
        function loadFigmaCanvases() {
            if (!state.figmaLink) {
                showStatus('Введіть посилання на Figma файл', 'error');
                return;
            }
            
            showStatus('<span class="loading"></span> Завантаження Canvas...', 'warning');
            
            vscode.postMessage({
                command: 'getFigmaCanvases',
                figmaLink: state.figmaLink,
                figmaToken: state.figmaToken
            });
        }

        // Handle messages from VS Code
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.command) {
                case 'lastSettingsLoaded':
                    applySettings(message.settings);
                    showStatus('Налаштування завантажено', 'success');
                    break;
                    
                case 'settingsSaved':
                    if (message.success) {
                        showStatus('Налаштування збережено', 'success');
                    } else {
                        showStatus('Помилка збереження', 'error');
                    }
                    break;
                    
                case 'generationComplete':
                    if (message.success) {
                        showStatus(\`✅ CSS згенеровано успішно!\`, 'success');
                    } else {
                        showStatus(\`❌ Помилка: \${message.error}\`, 'error');
                    }
                    break;
                    
                case 'figmaCanvases':
                    displayCanvases(message.canvases);
                    showStatus('Canvas завантажено', 'success');
                    break;
                    
                case 'figmaLayers':
                    displayLayers(message.layers);
                    showStatus('Layers завантажено', 'success');
                    break;
                    
                case 'settingsCleared':
                    showStatus('Налаштування очищено', 'success');
                    break;
                    
                case 'error':
                    showStatus(\`❌ Помилка: \${message.message}\`, 'error');
                    break;
                    
                case 'figmaLinkValidated':
                    const indicator = document.getElementById('figmaLinkIndicator');
                    if (message.isValid) {
                        indicator.className = 'validation-indicator validation-valid';
                    } else {
                        indicator.className = 'validation-indicator validation-invalid';
                    }
                    break;
            }
        });

        // Apply settings from storage
        function applySettings(settings) {
            if (!settings) return;
            
            // Apply mode
            if (settings.mode) {
                selectMode(settings.mode);
            }
            
            // Apply inputs
            if (settings.figmaLink) {
                document.getElementById('figmaLink').value = settings.figmaLink;
                validateFigmaLink();
            }
            if (settings.figmaToken) {
                document.getElementById('figmaToken').value = settings.figmaToken;
            }
            
            // Apply checkboxes
            document.getElementById('includeReset').checked = settings.includeReset !== false;
            document.getElementById('includeComments').checked = settings.includeComments !== false;
            document.getElementById('optimizeCSS').checked = settings.optimizeCSS !== false;
            document.getElementById('generateResponsive').checked = settings.generateResponsive !== false;
            
            // Update checkbox UI
            document.querySelectorAll('.checkbox-item input').forEach(cb => {
                const parent = cb.closest('.checkbox-item');
                if (cb.checked) {
                    parent.classList.add('selected');
                } else {
                    parent.classList.remove('selected');
                }
            });
            
            // Update state
            state = { ...state, ...settings };
        }

        // Display canvases
        function displayCanvases(canvases) {
            const container = document.getElementById('canvasList');
            container.innerHTML = '';
            
            if (canvases.length === 0) {
                container.innerHTML = '<div class="status warning show">Не знайдено Canvas</div>';
                return;
            }
            
            canvases.forEach(canvas => {
                const item = document.createElement('div');
                item.className = 'canvas-item';
                item.dataset.id = canvas.id;
                item.innerHTML = \`
                    <strong>\${canvas.name}</strong>
                    <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.3rem;">
                        \${canvas.childrenCount} елементів • \${canvas.type}
                    </div>
                \`;
                
                item.addEventListener('click', function() {
                    // Remove previous selection
                    document.querySelectorAll('.canvas-item').forEach(el => {
                        el.classList.remove('selected');
                    });
                    
                    // Select current
                    this.classList.add('selected');
                    state.selectedCanvas = canvas.id;
                    
                    // Load layers for this canvas
                    loadFigmaLayers(canvas.id);
                });
                
                container.appendChild(item);
            });
            
            // Show section
            document.getElementById('canvasSection').classList.add('active');
        }

        // Load Figma layers
        function loadFigmaLayers(canvasId) {
            showStatus('<span class="loading"></span> Завантаження Layers...', 'warning');
            
            vscode.postMessage({
                command: 'getFigmaLayers',
                figmaLink: state.figmaLink,
                figmaToken: state.figmaToken,
                canvasId: canvasId
            });
        }

        // Display layers
        function displayLayers(layers) {
            const container = document.getElementById('layersList');
            container.innerHTML = '';
            
            if (layers.length === 0) {
                container.innerHTML = '<div class="status warning show">Не знайдено Layers</div>';
                return;
            }
            
            layers.forEach(layer => {
                const item = document.createElement('div');
                item.className = 'checkbox-item';
                item.innerHTML = \`
                    <input type="checkbox" id="layer-\${layer.id}" value="\${layer.id}">
                    <label for="layer-\${layer.id}">
                        \${'&nbsp;&nbsp;'.repeat(layer.depth)}\${layer.name} 
                        <span style="color: var(--text-secondary); font-size: 0.8rem;">(\${layer.type})</span>
                    </label>
                \`;
                
                // Add event listener
                item.querySelector('input').addEventListener('change', function() {
                    this.closest('.checkbox-item').classList.toggle('selected', this.checked);
                    
                    // Update selected layers
                    state.selectedLayers = Array.from(
                        document.querySelectorAll('#layersList input:checked')
                    ).map(el => el.value);
                });
                
                container.appendChild(item);
            });
            
            // Show section
            document.getElementById('layersSection').classList.add('active');
        }

        // Show status message
        function showStatus(message, type = 'success') {
            const status = document.getElementById('status');
            status.className = \`status \${type} show\`;
            status.innerHTML = message;
            
            // Auto-hide after 5 seconds (except for loading)
            if (!message.includes('loading')) {
                setTimeout(() => {
                    status.classList.remove('show');
                }, 5000);
            }
        }
    </script>
</body>
</html>`
}

// Експортуємо функції для тестування
module.exports = {
  activate,
  deactivate,
  extractClassesFromHTML,
  generateMinimalCSS,
  extractFileIdFromFigmaLink,
  extractCanvasesFromFigmaData,
  extractLayersFromCanvas
}
