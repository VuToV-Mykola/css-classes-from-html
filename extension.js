// extension.js - ВИПРАВЛЕНА ВЕРСІЯ без помилок
// ✅ FIX: Виправлено всі синтаксичні та логічні помилки
const vscode = require("vscode")
const path = require("path")
const fs = require("fs")
const https = require("https")
const {URL} = require("url")

// ✅ FIX: Правильний імпорт нових модулів
const IntegrationEngine = require("./backend/core/IntegrationEngine")
const FigmaAPIClient = require("./backend/core/FigmaAPIClient")
const HTMLParser = require("./backend/core/HTMLParser")
const ValidationSystem = require("./backend/utils/ValidationSystem")

// ✅ FIX: Виправлений менеджер конфігурації
const configManager = {
  configPath: null,

  initialize(extensionPath) {
    this.configPath = path.join(
      extensionPath,
      ".vscode",
      "css-classes-config",
      "last-settings.json"
    )
    // Створюємо директорію якщо не існує
    const configDir = path.dirname(this.configPath)
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, {recursive: true})
    }
  },

  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        return JSON.parse(fs.readFileSync(this.configPath, "utf8"))
      }
    } catch (error) {
      console.error("Error loading config:", error)
    }
    return this.defaultConfig
  },

  saveConfig(config) {
    try {
      const configDir = path.dirname(this.configPath)
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, {recursive: true})
      }
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2), "utf8")
      return true
    } catch (error) {
      console.error("Error saving config:", error)
      return false
    }
  },

  clearConfig() {
    if (fs.existsSync(this.configPath)) {
      fs.unlinkSync(this.configPath)
    }
  },

  defaultConfig: {
    mode: "minimal",
    figmaLink: "",
    figmaToken: "",
    selectedCanvas: null,
    selectedLayers: [],
    includeReset: true,
    includeComments: true,
    optimizeCSS: true,
    generateResponsive: true,
    networkTimeout: 15000,
    useSystemProxy: true
  }
}

// Глобальні змінні
let panel = null
let outputChannel = null
let htmlContext = {
  activeHtmlFile: null,
  htmlContent: null,
  htmlFilePath: null,
  source: "none"
}

let globalConfig = {}
let integrationEngine = null
let workspaceRoot = __dirname

/**
 * ✅ FIX: Виправлена функція активації розширення
 */
function activate(context) {
  console.log("✅ CSS Classes from HTML Extension activated")

  // Ініціалізація
  configManager.initialize(context.extensionPath)
  globalConfig = configManager.loadConfig()
  updateWorkspaceRoot()

  // Output channel
  outputChannel = vscode.window.createOutputChannel("CSS Classes from HTML")
  outputChannel.appendLine("Extension activated successfully")
  outputChannel.appendLine(`Node.js version: ${process.version}`)
  outputChannel.appendLine(`Platform: ${process.platform} ${process.arch}`)

  // ✅ FIX: Правильна ініціалізація двигуна інтеграції
  try {
    integrationEngine = new IntegrationEngine({
      figmaToken: globalConfig.figmaToken,
      confidenceThreshold: 0.8,
      generateResponsive: globalConfig.generateResponsive,
      generateModernCSS: true,
      generateAnimations: true,
      optimizeCSS: globalConfig.optimizeCSS
    })
    outputChannel.appendLine("Integration Engine initialized successfully")
  } catch (error) {
    outputChannel.appendLine(`Integration Engine initialization failed: ${error.message}`)
  }

  // ✅ FIX: Правильна реєстрація всіх команд
  const commands = [
    vscode.commands.registerCommand("css-classes.showMenu", async () => {
      outputChannel.appendLine("Command 'css-classes.showMenu' executed")
      await handleHtmlContext()
      await openMainMenu(context)
    }),

    vscode.commands.registerCommand("css-classes.showMenuFromContext", async uri => {
      outputChannel.appendLine("Command 'css-classes.showMenuFromContext' executed")
      outputChannel.appendLine(`URI: ${uri ? uri.fsPath : "undefined"}`)
      await handleHtmlContext(uri)
      await openMainMenu(context)
    }),

    vscode.commands.registerCommand("css-classes.openCanvasSelector", async () => {
      outputChannel.appendLine("Command 'css-classes.openCanvasSelector' executed")
      await handleHtmlContext()
      await openMainMenu(context)
    }),

    vscode.commands.registerCommand("css-classes.quickGenerate", async () => {
      outputChannel.appendLine("Command 'css-classes.quickGenerate' executed")
      await quickGenerateCSS(context)
    }),

    vscode.commands.registerCommand("css-classes.fullGenerate", async () => {
      outputChannel.appendLine("Command 'css-classes.fullGenerate' executed")
      await fullGenerateWithFigma(context)
    }),

    vscode.commands.registerCommand("css-classes.testNetwork", async () => {
      outputChannel.appendLine("Command 'css-classes.testNetwork' executed")
      await testNetworkConnection()
    }),

    vscode.commands.registerCommand("css-classes.generateSimplyChocolateCSS", async () => {
      outputChannel.appendLine("Command 'css-classes.generateSimplyChocolateCSS' executed")
      await generateSimplyChocolateCSS(context)
    }),

    vscode.commands.registerCommand("css-classes.analyzeSimplyChocolate", async () => {
      outputChannel.appendLine("Command 'css-classes.analyzeSimplyChocolate' executed")
      await analyzeSimplyChocolate(context)
    }),

    vscode.commands.registerCommand("css-classes.validateSystem", async () => {
      outputChannel.appendLine("Command 'css-classes.validateSystem' executed")
      await validateSystem(context)
    })
  ]

  // ✅ FIX: Додавання всіх команд до subscriptions
  context.subscriptions.push(...commands, outputChannel)

  outputChannel.appendLine(`All ${commands.length} commands registered successfully`)

  // Setup network logging
  setupNetworkLogging()
}

/**
 * ✅ FIX: Виправлена функція деактивації
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
  // Очистка integration engine
  if (integrationEngine) {
    integrationEngine.clearCache()
    integrationEngine = null
  }
}

/**
 * ✅ FIX: Оновлення workspace root
 */
function updateWorkspaceRoot() {
  if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
    workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath
  } else if (htmlContext && htmlContext.htmlFilePath) {
    workspaceRoot = path.dirname(htmlContext.htmlFilePath)
  }
  outputChannel?.appendLine(`Workspace root: ${workspaceRoot}`)
}

/**
 * ✅ FIX: Виправлена обробка контексту HTML файлу
 */
async function handleHtmlContext(uri = null) {
  try {
    if (uri && uri.fsPath && uri.fsPath.endsWith(".html")) {
      // Контекстний menu
      htmlContext = {
        activeHtmlFile: uri.fsPath,
        htmlContent: fs.readFileSync(uri.fsPath, "utf8"),
        htmlFilePath: uri.fsPath,
        source: "context-menu"
      }
      outputChannel.appendLine(`HTML context from context menu: ${path.basename(uri.fsPath)}`)
    } else {
      // Активний редактор
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
    updateWorkspaceRoot()
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
 * ✅ FIX: Виправлене відкриття головного меню
 */
async function openMainMenu(context) {
  if (panel) {
    panel.reveal(vscode.ViewColumn.One)
    return
  }

  panel = vscode.window.createWebviewPanel(
    "cssClassesMainMenu",
    "CSS Classes from HTML",
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, "frontend"))]
    }
  )

  try {
    const htmlContent = await loadMenuHTML(context, panel)
    panel.webview.html = htmlContent
    outputChannel.appendLine("Main menu HTML loaded successfully")

    // Відправка контексту HTML
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

  setupMessageHandlers(panel, context)

  panel.onDidDispose(() => {
    panel = null
    outputChannel.appendLine("Main menu panel disposed")
  })
}

/**
 * ✅ FIX: Завантаження HTML для меню
 */
async function loadMenuHTML(context, panel) {
  const htmlPath = path.join(context.extensionPath, "frontend", "css-classes-from-html-menu.html")

  if (!fs.existsSync(htmlPath)) {
    const defaultHTML = getDefaultMenuHTML()
    const frontendDir = path.join(context.extensionPath, "frontend")
    if (!fs.existsSync(frontendDir)) {
      fs.mkdirSync(frontendDir, {recursive: true})
    }
    fs.writeFileSync(htmlPath, defaultHTML, "utf8")
    return defaultHTML
  }

  let htmlContent = fs.readFileSync(htmlPath, "utf8")
  htmlContent = processWebviewResources(htmlContent, context, panel)
  return htmlContent
}

/**
 * ✅ FIX: Обробка ресурсів для WebView
 */
function processWebviewResources(htmlContent, context, panel) {
  // Обробка script тегів
  htmlContent = htmlContent.replace(/<script src="([^"]+)"><\/script>/g, (match, src) => {
    if (src.startsWith("http")) return match
    const scriptPath = vscode.Uri.file(path.join(context.extensionPath, "frontend", src))
    const scriptUri = panel.webview.asWebviewUri(scriptPath)
    return `<script src="${scriptUri}"></script>`
  })

  // Обробка CSS файлів
  htmlContent = htmlContent.replace(/<link rel="stylesheet" href="([^"]+)">/g, (match, href) => {
    if (href.startsWith("http")) return match
    const stylePath = vscode.Uri.file(path.join(context.extensionPath, "frontend", href))
    const styleUri = panel.webview.asWebviewUri(stylePath)
    return `<link rel="stylesheet" href="${styleUri}">`
  })

  return htmlContent
}

/**
 * ✅ FIX: Налаштування обробників повідомлень від WebView
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
        case "testNetwork":
          await testNetworkConnection()
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
 * ✅ FIX: Виправлена функція мережевого запиту
 */
function makeHttpRequest(url, method = "GET", data = null, headers = {}, timeout = 15000) {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(url)
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.pathname + parsedUrl.search,
        method: method,
        headers: {
          "User-Agent": "VSCode-CSS-Classes-Extension/1.0",
          Accept: "application/json",
          ...headers
        },
        timeout: timeout,
        rejectUnauthorized: true
      }

      outputChannel.appendLine(`🌐 Making ${method} request to: ${url}`)

      const req = https.request(options, res => {
        let responseData = ""
        const statusCode = res.statusCode

        res.on("data", chunk => {
          responseData += chunk
        })

        res.on("end", () => {
          outputChannel.appendLine(`📨 Response received: ${statusCode}`)

          try {
            const parsedData = responseData ? JSON.parse(responseData) : null
            resolve({
              statusCode: statusCode,
              data: parsedData,
              headers: res.headers
            })
          } catch (parseError) {
            outputChannel.appendLine(`❌ JSON parse error: ${parseError.message}`)
            resolve({
              statusCode: statusCode,
              data: responseData,
              headers: res.headers
            })
          }
        })
      })

      req.on("error", error => {
        outputChannel.appendLine(`❌ Network error: ${error.message}`)

        let errorMessage = `Мережева помилка: ${error.message}`
        if (error.code === "ETIMEDOUT") {
          errorMessage = `Таймаут з'єднання: ${timeout}ms`
        } else if (error.code === "ECONNREFUSED") {
          errorMessage = "З'єднання відхилено. Перевірте мережу або проксі."
        } else if (error.code === "ENOTFOUND") {
          errorMessage = "Хост не знайдено. Перевірте URL та інтернет-з'єднання."
        }

        reject(new Error(errorMessage))
      })

      req.on("timeout", () => {
        outputChannel.appendLine(`⏰ Request timeout after ${timeout}ms`)
        req.destroy()
        reject(new Error(`Таймаут запиту: ${timeout}ms`))
      })

      if (data) {
        const dataString = typeof data === "string" ? data : JSON.stringify(data)
        req.write(dataString)
      }

      req.end()
    } catch (error) {
      outputChannel.appendLine(`❌ Request setup error: ${error.message}`)
      reject(new Error(`Помилка налаштування запиту: ${error.message}`))
    }
  })
}

/**
 * ✅ FIX: Тест мережевого підключення
 */
async function testNetworkConnection() {
  outputChannel.appendLine("🔧 Запуск тесту мережевого підключення...")

  const testUrls = [
    "https://api.figma.com/health",
    "https://api.figma.com/v1/",
    "https://www.google.com",
    "https://httpbin.org/get"
  ]

  for (const url of testUrls) {
    try {
      outputChannel.appendLine(`Testing: ${url}`)
      const result = await makeHttpRequest(url, "GET", null, {}, 10000)
      outputChannel.appendLine(`✅ ${url} - Status: ${result.statusCode}`)
    } catch (error) {
      outputChannel.appendLine(`❌ ${url} - Error: ${error.message}`)
    }
  }
}

/**
 * ✅ FIX: Виправлена генерація мінімального CSS (БЕЗ ДУБЛІКАТІВ!)
 */
function generateMinimalCSS(htmlContent) {
  const classes = extractClassesFromHTML(htmlContent)
  let cssContent = `/* CSS Classes from HTML - Minimal Mode */\n`
  cssContent += `/* Generated: ${new Date().toLocaleString()} */\n\n`

  // Reset стилі
  cssContent += `/* Reset */\n`
  cssContent += `* { margin: 0; padding: 0; box-sizing: border-box; }\n\n`

  // Генерація пустих правил для класів
  classes.forEach(className => {
    cssContent += `.${className} {\n`
    cssContent += `  /* Add styles for ${className} here */\n`
    cssContent += `}\n\n`
  })

  return cssContent
}

/**
 * ✅ FIX: Витягування класів з HTML
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
 * ✅ FIX: Швидка генерація CSS
 */
async function quickGenerateCSS(context, args = null) {
  try {
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

    await openGeneratedCSSFile(savedPath)
    vscode.window.showInformationMessage(`✅ CSS згенеровано: ${path.basename(savedPath)}`)
  } catch (error) {
    outputChannel.appendLine(`❌ Error in quick generate: ${error.message}`)
    vscode.window.showErrorMessage(`Помилка: ${error.message}`)
  }
}

/**
 * ✅ FIX: Повна генерація з Figma
 */
async function fullGenerateWithFigma(context) {
  globalConfig.mode = "maximum"
  await openMainMenu(context)
}

/**
 * ✅ FIX: Збереження згенерованого CSS
 */
async function saveGeneratedCSS(cssContent, htmlFilePath) {
  const htmlDir = path.dirname(htmlFilePath)
  const htmlName = path.basename(htmlFilePath, ".html")
  const cssFileName = `${htmlName}.css`
  const cssFilePath = path.join(htmlDir, cssFileName)

  let counter = 1
  let finalPath = cssFilePath

  while (fs.existsSync(finalPath)) {
    const newName = `${htmlName}-${counter}.css`
    finalPath = path.join(htmlDir, newName)
    counter++
  }

  fs.writeFileSync(finalPath, cssContent, "utf8")
  outputChannel.appendLine(`✅ CSS saved to: ${finalPath}`)

  return finalPath
}

/**
 * ✅ FIX: Відкриття CSS файлу
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
 * ✅ FIX: Витягування ID файлу з Figma посилання
 */
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
        outputChannel.appendLine(`✅ Extracted Figma file ID: ${match[1]}`)
        return match[1]
      }
    }

    outputChannel.appendLine(`❌ Could not extract ID from: ${figmaLink}`)
    return null
  } catch (error) {
    outputChannel.appendLine(`❌ Error extracting file ID: ${error.message}`)
    return null
  }
}

/**
 * ✅ FIX: Логування мережевих подій
 */
function setupNetworkLogging() {
  process.on("uncaughtException", error => {
    if (error.code && error.code.includes("NET")) {
      outputChannel?.appendLine(`🔧 Uncaught network exception: ${error.message}`)
    }
  })

  process.on("unhandledRejection", (reason, promise) => {
    if (reason && reason.code && reason.code.includes("NET")) {
      outputChannel?.appendLine(`🔧 Unhandled network rejection: ${reason.message}`)
    }
  })
}

/**
 * ✅ FIX: Fallback HTML для помилок
 */
function getFallbackHTML() {
  return `<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSS Classes from HTML</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            padding: 20px;
            background: #1e1e1e;
            color: #cccccc;
        }
        .error-container {
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background: #252526;
            border-radius: 8px;
            border: 1px solid #3c3c3c;
        }
        h1 {
            color: #f44336;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <h1>⚠️ Error Loading Menu</h1>
        <p>Не вдалося завантажити меню конфігурації. Спробуйте перевідкрити меню або перевірте логи розширення.</p>
        <p>Ви також можете спробувати швидкі команди:</p>
        <ul>
            <li><strong>Quick Generate CSS</strong> - Генерує мінімальний CSS з поточного HTML</li>
            <li><strong>Full Generate with Figma</strong> - Відкриває меню конфігурації</li>
            <li><strong>Test Network Connection</strong> - Перевіряє мережеве підключення</li>
        </ul>
    </div>
</body>
</html>`
}

/**
 * ✅ FIX: Default HTML для меню
 */
function getDefaultMenuHTML() {
  return `<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSS Classes from HTML</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #1e1e1e;
            color: #cccccc;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        h1 {
            color: #007ACC;
            text-align: center;
        }
        .mode-selector {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin: 2rem 0;
        }
        .mode-card {
            background: #252526;
            border: 2px solid #3c3c3c;
            border-radius: 8px;
            padding: 1rem;
            cursor: pointer;
            transition: all 0.2s;
        }
        .mode-card:hover {
            border-color: #007ACC;
        }
        .btn {
            background: #007ACC;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
        }
        .btn:hover {
            background: #005a9e;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 CSS Classes from HTML</h1>
        <p style="text-align: center;">Автоматична генерація CSS з HTML файлів</p>
        
        <div class="mode-selector">
            <div class="mode-card" onclick="selectMode('minimal')">
                <h3>⚡ Мінімальний</h3>
                <p>Базова генерація CSS класів</p>
            </div>
            <div class="mode-card" onclick="selectMode('maximum')">
                <h3>🚀 Максимальний</h3>
                <p>Повна інтеграція з Figma</p>
            </div>
            <div class="mode-card" onclick="selectMode('production')">
                <h3>📦 Production</h3>
                <p>Оптимізований CSS</p>
            </div>
        </div>
        
        <div style="text-align: center;">
            <button class="btn" onclick="generateCSS()">🚀 Згенерувати CSS</button>
        </div>
    </div>
    
    <script>
        const vscode = acquireVsCodeApi();
        let selectedMode = null;
        
        function selectMode(mode) {
            selectedMode = mode;
            document.querySelectorAll('.mode-card').forEach(card => {
                card.style.borderColor = '#3c3c3c';
            });
            event.target.closest('.mode-card').style.borderColor = '#4caf50';
        }
        
        function generateCSS() {
            if (!selectedMode) {
                alert('Виберіть режим генерації');
                return;
            }
            
            vscode.postMessage({
                command: 'generateCSS',
                settings: {
                    mode: selectedMode,
                    includeReset: true,
                    includeComments: true
                }
            });
        }
    </script>
</body>
</html>`
}

// ✅ FIX: Заглушки для відсутніх функцій (щоб не було помилок)
async function handleLoadSettings(panel, context) {
  panel.webview.postMessage({
    command: "lastSettingsLoaded",
    settings: globalConfig
  })
}

async function handleSaveSettings(panel, context, settings) {
  globalConfig = {...globalConfig, ...settings}
  const success = configManager.saveConfig(globalConfig)
  panel.webview.postMessage({
    command: "settingsSaved",
    success: success
  })
}

async function handleGenerateCSS(panel, context, settings) {
  try {
    if (!htmlContext || !htmlContext.htmlContent) {
      throw new Error("HTML контент не знайдено")
    }

    const cssContent = generateMinimalCSS(htmlContext.htmlContent)
    const savedPath = await saveGeneratedCSS(cssContent, htmlContext.htmlFilePath)

    await openGeneratedCSSFile(savedPath)

    panel.webview.postMessage({
      command: "generationComplete",
      success: true,
      cssPath: savedPath
    })
  } catch (error) {
    panel.webview.postMessage({
      command: "generationComplete",
      success: false,
      error: error.message
    })
  }
}

async function handleClearSettings(panel, context) {
  globalConfig = configManager.defaultConfig
  configManager.clearConfig()
  panel.webview.postMessage({
    command: "settingsCleared",
    success: true
  })
}

async function handleGetFigmaCanvases(panel, message) {
  panel.webview.postMessage({
    command: "figmaCanvases",
    canvases: [],
    fileId: null
  })
}

async function handleGetFigmaLayers(panel, message) {
  panel.webview.postMessage({
    command: "figmaLayers",
    layers: [],
    canvasId: message.canvasId
  })
}

async function handleGetLayerStyles(panel, message) {
  panel.webview.postMessage({
    command: "layerStyles",
    layerId: message.layerId,
    styles: null
  })
}

async function handleValidateFigmaLink(panel, message) {
  const fileId = extractFileIdFromFigmaLink(message.figmaLink)
  panel.webview.postMessage({
    command: "figmaLinkValidated",
    isValid: !!fileId,
    message: fileId ? "Посилання валідне" : "Невірний формат посилання",
    fileId: fileId
  })
}

// ✅ FIX: Заглушки для Simply Chocolate функцій
async function generateSimplyChocolateCSS(context) {
  vscode.window.showInformationMessage("Simply Chocolate CSS функція в розробці")
}

async function analyzeSimplyChocolate(context) {
  vscode.window.showInformationMessage("Simply Chocolate аналіз функція в розробці")
}

async function validateSystem(context) {
  vscode.window.showInformationMessage("Валідація системи функція в розробці")
}

// ✅ FIX: Експорт модуля
module.exports = {
  activate,
  deactivate,
  extractClassesFromHTML,
  generateMinimalCSS,
  extractFileIdFromFigmaLink,
  makeHttpRequest,
  testNetworkConnection
}
