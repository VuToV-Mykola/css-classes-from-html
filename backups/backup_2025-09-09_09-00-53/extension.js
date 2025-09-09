// ✅ CSS Classes from HTML Extension v2.1.0 - FIXED WITH CONTEXT
// Автоматична генерація CSS класів з HTML файлів з реальною інтеграцією Figma
// Версія з виправленою проблемою передачі контексту HTML файлу

const vscode = require("vscode")
const path = require("path")
const fs = require("fs")

// =======================================
// 🔧 СИСТЕМА ЗАВАНТАЖЕННЯ МОДУЛІВ
// =======================================

class ModuleLoader {
  constructor() {
    this.loadedModules = {}
    this.loadingErrors = []
    this.outputChannel = null
  }

  setOutputChannel(channel) {
    this.outputChannel = channel
    this.log("Module loader initialized")
  }

  log(message) {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `[${timestamp}] ${message}`

    console.log(logMessage)
    if (this.outputChannel) {
      this.outputChannel.appendLine(logMessage)
    }
  }

  safeRequire(modulePath, moduleName) {
    try {
      const fullPath = path.resolve(__dirname, modulePath)
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Module file not found: ${fullPath}`)
      }

      const module = require(modulePath)

      if (typeof module !== "function" && typeof module !== "object") {
        throw new Error(`Invalid module export type: ${typeof module}`)
      }

      this.loadedModules[moduleName] = module
      this.log(`✅ ${moduleName} loaded successfully from ${modulePath}`)
      return module
    } catch (error) {
      const errorMsg = `❌ Failed to load ${moduleName}: ${error.message}`
      this.log(errorMsg)
      this.loadingErrors.push({
        moduleName,
        modulePath,
        error: error.message,
        timestamp: new Date().toISOString()
      })
      return null
    }
  }

  loadAllBackendModules() {
    this.log("🚀 Starting backend modules loading...")

    const modules = {
      FigmaAPIClient: "./backend/core/FigmaAPIClient.js",
      HTMLParser: "./backend/core/HTMLParser.js",
      IntegrationEngine: "./backend/core/IntegrationEngine.js",
      SmartCSSGenerator: "./backend/generators/SmartCSSGenerator.js",
      ImageImporter: "./backend/utils/ImageImporter.js",
      FontImporter: "./backend/utils/FontImporter.js"
    }

    let successCount = 0
    let totalCount = Object.keys(modules).length

    for (const [name, path] of Object.entries(modules)) {
      if (this.safeRequire(path, name)) {
        successCount++
      }
    }

    const isSuccess = successCount === totalCount
    this.log(`📊 Module loading summary: ${successCount}/${totalCount} modules loaded`)

    if (isSuccess) {
      this.log("✅ All backend modules loaded successfully - Full integration available!")
    } else {
      this.log("⚠️ Some backend modules missing - Working in basic mode")
      this.log("📋 Loading errors:")
      this.loadingErrors.forEach(error => {
        this.log(`   • ${error.moduleName}: ${error.error}`)
      })
    }

    return {
      success: isSuccess,
      loadedCount: successCount,
      totalCount: totalCount,
      modules: this.loadedModules,
      errors: this.loadingErrors
    }
  }

  getModule(name) {
    return this.loadedModules[name] || null
  }

  allModulesLoaded() {
    const requiredModules = ["FigmaAPIClient", "IntegrationEngine", "HTMLParser"]
    return requiredModules.every(name => this.loadedModules[name])
  }

  getLoadingStats() {
    return {
      loadedModules: Object.keys(this.loadedModules),
      loadingErrors: this.loadingErrors,
      allLoaded: this.allModulesLoaded()
    }
  }
}

// Глобальний екземпляр завантажувача модулів
const moduleLoader = new ModuleLoader()

// =======================================
// 🌍 ГЛОБАЛЬНІ ЗМІННІ
// =======================================

let panel = null
let outputChannel = null
let integrationEngine = null
let extensionContext = null
let currentHTMLFile = null // ✅ FIX: Додано змінну для збереження контексту HTML файлу - лінія 114 ✅

// =======================================
// ⚙️ МЕНЕДЖЕР КОНФІГУРАЦІЇ
// =======================================

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
        version: "2.1.0",
        lastHTMLFile: currentHTMLFile // ✅ FIX: Зберігаємо останній HTML файл - лінія 161 ✅
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
      version: "2.1.0",
      lastHTMLFile: "" // ✅ FIX: Додано поле для збереження останнього HTML файлу - лінія 180 ✅
    }
  }
}

// =======================================
// 🚀 АКТИВАЦІЯ РОЗШИРЕННЯ
// =======================================

function activate(context) {
  console.log("🚀 CSS Classes from HTML v2.1.0 FIXED activating...")
  extensionContext = context

  try {
    // 1. Ініціалізація output channel
    outputChannel = vscode.window.createOutputChannel("CSS Classes from HTML")
    outputChannel.show(true)
    outputChannel.appendLine("🚀 Extension starting...")

    // 2. Налаштування модульного завантажувача
    moduleLoader.setOutputChannel(outputChannel)

    // 3. Ініціалізація конфігурації
    configManager.initialize(context.extensionPath)

    // ✅ FIX: Завантаження останнього HTML файлу з конфігурації - лінія 206-209 ✅
    const savedConfig = configManager.loadConfig()
    if (savedConfig.lastHTMLFile) {
      currentHTMLFile = savedConfig.lastHTMLFile
    }

    // 4. Завантаження backend модулів
    outputChannel.appendLine("📦 Loading backend modules...")
    const moduleResult = moduleLoader.loadAllBackendModules()

    // 5. Створення Integration Engine якщо модулі завантажено
    if (moduleResult.success) {
      try {
        const IntegrationEngine = moduleLoader.getModule("IntegrationEngine")
        if (IntegrationEngine) {
          integrationEngine = new IntegrationEngine({
            figmaToken: "",
            confidenceThreshold: 0.7,
            generateResponsive: true,
            mode: "minimal"
          })
          outputChannel.appendLine(
            "✅ Integration Engine initialized - Full Figma integration available"
          )
        } else {
          throw new Error("IntegrationEngine module is null")
        }
      } catch (error) {
        outputChannel.appendLine(`❌ Integration Engine initialization failed: ${error.message}`)
        integrationEngine = null
      }
    } else {
      outputChannel.appendLine("⚠️ Backend modules not fully loaded - Working in basic mode")
      outputChannel.appendLine("📋 Module loading details:")
      moduleResult.errors.forEach(error => {
        outputChannel.appendLine(`   • ${error.moduleName}: ${error.error}`)
      })
    }

    // 6. Реєстрація команд
    const commands = registerAllCommands(context)
    outputChannel.appendLine(`✅ Registered ${commands.length} commands successfully`)

    // 7. Додавання ресурсів до subscriptions
    context.subscriptions.push(...commands, outputChannel)

    // 8. Показ вітального повідомлення
    showWelcomeMessage(moduleResult)

    outputChannel.appendLine("✅ Extension fully activated!")

    return {
      success: true,
      commandsCount: commands.length,
      version: "2.1.0",
      moduleStats: moduleResult
    }
  } catch (error) {
    const errorMessage = `💥 Fatal error during activation: ${error.message}`
    console.error(errorMessage)
    console.error("Stack trace:", error.stack)

    if (outputChannel) {
      outputChannel.appendLine(errorMessage)
      outputChannel.appendLine(`Stack: ${error.stack}`)
    }

    vscode.window.showErrorMessage(`CSS Classes from HTML activation failed: ${error.message}`)
    throw error
  }
}

// =======================================
// 📝 РЕЄСТРАЦІЯ КОМАНД
// =======================================

function registerAllCommands(context) {
  const commands = []

  // ✅ FIX: Команда 1 - Головне меню з автоматичним визначенням контексту - лінія 281-288 ✅
  commands.push(
    vscode.commands.registerCommand("css-classes.showMenu", async () => {
      outputChannel?.appendLine("🎯 Command 'css-classes.showMenu' executed")

      // Автоматично визначаємо активний HTML файл
      const activeEditor = vscode.window.activeTextEditor
      if (activeEditor && activeEditor.document.languageId === "html") {
        currentHTMLFile = activeEditor.document.uri.fsPath
        outputChannel?.appendLine(`📄 Auto-detected HTML file: ${currentHTMLFile}`)
      }

      await openMainMenu(context)
    })
  )

  // ✅ FIX: Команда 2 - Меню з контексту файлу - лінія 293-299 ✅
  commands.push(
    vscode.commands.registerCommand("css-classes.showMenuFromContext", async uri => {
      outputChannel?.appendLine("🎯 Command 'css-classes.showMenuFromContext' executed")

      if (uri && uri.fsPath) {
        currentHTMLFile = uri.fsPath
        outputChannel?.appendLine(`📄 Context HTML file set: ${currentHTMLFile}`)
        configManager.saveConfig({...configManager.loadConfig(), lastHTMLFile: currentHTMLFile})
      }

      await openMainMenu(context)
    })
  )

  // ✅ FIX: Команда 3 - Швидка генерація з контекстом - лінія 304-315 ✅
  commands.push(
    vscode.commands.registerCommand("css-classes.quickGenerate", async uri => {
      outputChannel?.appendLine("🎯 Command 'css-classes.quickGenerate' executed")

      if (uri && uri.fsPath) {
        currentHTMLFile = uri.fsPath
      } else {
        const activeEditor = vscode.window.activeTextEditor
        if (activeEditor && activeEditor.document.languageId === "html") {
          currentHTMLFile = activeEditor.document.uri.fsPath
        }
      }

      await quickGenerateCSS()
    })
  )

  // ✅ FIX: Команда 4 - Вибір HTML файлу - лінія 320-340 ✅
  commands.push(
    vscode.commands.registerCommand("css-classes.selectHTMLFile", async () => {
      outputChannel?.appendLine("🎯 Command 'css-classes.selectHTMLFile' executed")

      const options = {
        canSelectMany: false,
        openLabel: "Select HTML File",
        filters: {
          "HTML files": ["html", "htm"],
          "All files": ["*"]
        }
      }

      const fileUri = await vscode.window.showOpenDialog(options)

      if (fileUri && fileUri[0]) {
        currentHTMLFile = fileUri[0].fsPath
        outputChannel?.appendLine(`📄 Selected HTML file: ${currentHTMLFile}`)
        configManager.saveConfig({...configManager.loadConfig(), lastHTMLFile: currentHTMLFile})
        vscode.window.showInformationMessage(`HTML файл вибрано: ${path.basename(currentHTMLFile)}`)
        await openMainMenu(context)
      }
    })
  )

  return commands
}

// =======================================
// 📋 ПОКАЗ ВІТАЛЬНОГО ПОВІДОМЛЕННЯ
// =======================================

async function showWelcomeMessage(moduleResult) {
  const statusText = moduleResult.success
    ? "✅ Повна інтеграція з Figma доступна!"
    : "⚠️ Базовий режим (деякі модулі не завантажено)"

  const message = `🚀 CSS Classes from HTML готовий!\n${statusText}`

  const choice = await vscode.window.showInformationMessage(
    message,
    "Відкрити меню",
    "Швидка генерація",
    "Вибрати HTML файл"
  )

  switch (choice) {
    case "Відкрити меню":
      vscode.commands.executeCommand("css-classes.showMenu")
      break
    case "Швидка генерація":
      vscode.commands.executeCommand("css-classes.quickGenerate")
      break
    case "Вибрати HTML файл":
      vscode.commands.executeCommand("css-classes.selectHTMLFile")
      break
  }
}

// =======================================
// 🎨 WEBVIEW ІНТЕРФЕЙС
// =======================================

async function openMainMenu(context) {
  try {
    outputChannel?.appendLine("📋 Opening main menu...")

    // ✅ FIX: Перевірка наявності HTML файлу в контексті - лінія 392-398 ✅
    if (!currentHTMLFile) {
      const activeEditor = vscode.window.activeTextEditor
      if (activeEditor && activeEditor.document.languageId === "html") {
        currentHTMLFile = activeEditor.document.uri.fsPath
      }
    }

    if (panel) {
      panel.reveal(vscode.ViewColumn.One)
      // ✅ FIX: Передача контексту в існуючу панель - лінія 402-406 ✅
      panel.webview.postMessage({
        command: "updateHTMLContext",
        htmlFile: currentHTMLFile,
        fileName: currentHTMLFile ? path.basename(currentHTMLFile) : null
      })
      return
    }

    panel = vscode.window.createWebviewPanel(
      "cssClassesMenu",
      "CSS Classes from HTML v2.1.0",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.file(context.extensionPath)]
      }
    )

    // ✅ FIX: Завантаження HTML з файлу якщо існує - лінія 423-441 ✅
    const htmlPath = path.join(context.extensionPath, "frontend", "css-classes-from-html-menu.html")

    if (fs.existsSync(htmlPath)) {
      let htmlContent = fs.readFileSync(htmlPath, "utf8")

      // Конвертація локальних ресурсів
      const baseUri = panel.webview.asWebviewUri(vscode.Uri.file(context.extensionPath))
      htmlContent = htmlContent.replace(/href="([^"]*\.css)"/g, `href="${baseUri}/$1"`)
      htmlContent = htmlContent.replace(/src="([^"]*\.js)"/g, `src="${baseUri}/$1"`)

      panel.webview.html = htmlContent
    } else {
      // Якщо файл не знайдено, генеруємо HTML динамічно
      panel.webview.html = generateWebViewHTML()
    }

    // Налаштування обробників
    setupMessageHandlers(panel, context)

    // ✅ FIX: Передача початкового контексту - лінія 444-451 ✅
    setTimeout(() => {
      panel.webview.postMessage({
        command: "initializeContext",
        htmlFile: currentHTMLFile,
        fileName: currentHTMLFile ? path.basename(currentHTMLFile) : null,
        config: configManager.loadConfig()
      })
    }, 100)

    panel.onDidDispose(() => {
      panel = null
    })

    outputChannel?.appendLine("✅ Main menu opened successfully")
  } catch (error) {
    const errorMessage = `❌ Error opening menu: ${error.message}`
    outputChannel?.appendLine(errorMessage)
    vscode.window.showErrorMessage(errorMessage)
  }
}

// =======================================
// 📨 ОБРОБКА ПОВІДОМЛЕНЬ WEBVIEW
// =======================================

function setupMessageHandlers(panel, context) {
  panel.webview.onDidReceiveMessage(async message => {
    try {
      outputChannel?.appendLine(`📨 Received message: ${message.command}`)

      switch (message.command) {
        // ✅ FIX: Обробка запиту на вибір HTML файлу - лінія 478-496 ✅
        case "selectHTMLFile":
          const options = {
            canSelectMany: false,
            openLabel: "Select HTML File",
            filters: {
              "HTML files": ["html", "htm"],
              "All files": ["*"]
            }
          }

          const fileUri = await vscode.window.showOpenDialog(options)

          if (fileUri && fileUri[0]) {
            currentHTMLFile = fileUri[0].fsPath
            panel.webview.postMessage({
              command: "htmlFileSelected",
              htmlFile: currentHTMLFile,
              fileName: path.basename(currentHTMLFile)
            })
          }
          break

        // ✅ FIX: Генерація CSS з контекстом - лінія 499-501 ✅
        case "generateCSS":
          await handleGenerateCSS(panel, message.settings)
          break

        case "quickGenerate":
          await quickGenerateCSS()
          break

        case "getFigmaCanvases":
          await handleGetFigmaCanvases(panel, message)
          break

        case "getFigmaLayers":
          await handleGetFigmaLayers(panel, message)
          break

        case "importImages":
          await handleImportImages(panel, message)
          break

        case "importFonts":
          await handleImportFonts(panel, message)
          break

        case "loadLastSettings":
          await handleLoadSettings(panel)
          break

        case "saveCurrentSettings":
          await handleSaveSettings(panel, message.settings)
          break

        default:
          outputChannel?.appendLine(`⚠️ Unknown command: ${message.command}`)
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

// =======================================
// 🚀 ГЕНЕРАЦІЯ CSS
// =======================================

async function handleGenerateCSS(panel, settings) {
  try {
    outputChannel?.appendLine("🚀 Starting CSS generation...")

    // ✅ FIX: Використання контекстного HTML файлу - лінія 551-562 ✅
    let htmlContent = ""
    let htmlFilePath = ""

    if (currentHTMLFile && fs.existsSync(currentHTMLFile)) {
      htmlContent = fs.readFileSync(currentHTMLFile, "utf8")
      htmlFilePath = currentHTMLFile
      outputChannel?.appendLine(`📄 Using context HTML file: ${currentHTMLFile}`)
    } else {
      const activeEditor = vscode.window.activeTextEditor
      if (!activeEditor || activeEditor.document.languageId !== "html") {
        throw new Error("Будь ласка, виберіть HTML файл або відкрийте його в редакторі")
      }
      htmlContent = activeEditor.document.getText()
      htmlFilePath = activeEditor.document.uri.fsPath
    }

    if (!htmlContent.trim()) {
      throw new Error("HTML файл порожній")
    }

    let css = ""

    // Генерація відповідно до режиму
    if (settings.mode === "minimal") {
      css = generateBasicCSS(htmlContent)
    } else if (settings.mode === "maximum" && integrationEngine) {
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
          css = generateBasicCSS(htmlContent)
        }
      } else {
        css = generateBasicCSS(htmlContent)
      }
    } else if (settings.mode === "production") {
      css = generateProductionCSS(htmlContent)
    } else {
      css = generateBasicCSS(htmlContent)
    }

    // Збереження CSS файлу
    await saveGeneratedCSS(css, htmlFilePath)

    panel.webview.postMessage({
      command: "generationComplete",
      success: true,
      css: css,
      message: "CSS згенеровано успішно!"
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

async function quickGenerateCSS() {
  try {
    outputChannel?.appendLine("⚡ Quick CSS generation started...")

    // ✅ FIX: Використання контекстного HTML файлу для швидкої генерації - лінія 622-638 ✅
    let htmlContent = ""
    let htmlFilePath = ""

    if (currentHTMLFile && fs.existsSync(currentHTMLFile)) {
      htmlContent = fs.readFileSync(currentHTMLFile, "utf8")
      htmlFilePath = currentHTMLFile
      outputChannel?.appendLine(`📄 Using context HTML file: ${currentHTMLFile}`)
    } else {
      const activeEditor = vscode.window.activeTextEditor
      if (!activeEditor || activeEditor.document.languageId !== "html") {
        // Пропонуємо вибрати файл
        const choice = await vscode.window.showInformationMessage(
          "Не знайдено активний HTML файл",
          "Вибрати файл",
          "Скасувати"
        )

        if (choice === "Вибрати файл") {
          await vscode.commands.executeCommand("css-classes.selectHTMLFile")
          return
        } else {
          return
        }
      }
      htmlContent = activeEditor.document.getText()
      htmlFilePath = activeEditor.document.uri.fsPath
    }

    if (!htmlContent.trim()) {
      vscode.window.showErrorMessage("HTML файл порожній")
      return
    }

    const css = generateBasicCSS(htmlContent)
    await saveGeneratedCSS(css, htmlFilePath)

    vscode.window.showInformationMessage(`✅ CSS згенеровано для: ${path.basename(htmlFilePath)}`)
    outputChannel?.appendLine("✅ Quick CSS generation completed")
  } catch (error) {
    const errorMessage = `❌ Quick generation failed: ${error.message}`
    outputChannel?.appendLine(errorMessage)
    vscode.window.showErrorMessage(errorMessage)
  }
}

// =======================================
// 🎨 ГЕНЕРАЦІЯ РІЗНИХ ТИПІВ CSS
// =======================================

function generateBasicCSS(htmlContent) {
  let css = `/* ✅ CSS Generated by CSS Classes from HTML v2.1.0 */
/* Generated: ${new Date().toLocaleString()} */
/* Source: ${currentHTMLFile ? path.basename(currentHTMLFile) : "Unknown"} */

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

`

  // Витягування класів з HTML
  const classes = extractClassesFromHTML(htmlContent)

  if (classes.length > 0) {
    css += `/* ============================================
   GENERATED CLASSES
   ============================================ */
`
    classes.forEach(className => {
      css += `.${className} {\n  /* TODO: Add styles for ${className} */\n}\n\n`
    })
  }

  // Адаптивні стилі
  css += generateResponsiveStyles()

  return css
}

function generateProductionCSS(htmlContent) {
  let css = `/* ✅ PRODUCTION CSS - Minified and Optimized */
/* Generated: ${new Date().toISOString()} */

`

  // Мінімізований reset
  css += `*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}`
  css += `body{font-family:system-ui,-apple-system,sans-serif;line-height:1.5}`
  css += `img,video{max-width:100%;height:auto}`
  css += `button{cursor:pointer;border:none;background:transparent}`
  css += `a{text-decoration:none;color:inherit}`
  css += `\n\n`

  // CSS змінні для production
  css += `:root{`
  css += `--p:#007ACC;--s:#6c757d;--success:#28a745;--danger:#dc3545;`
  css += `--spacing:1rem;--radius:0.25rem;`
  css += `}\n\n`

  // Генерація класів
  const classes = extractClassesFromHTML(htmlContent)
  classes.forEach(className => {
    css += `.${className}{}\n`
  })

  return css
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
`
}

// =======================================
// 🔍 ВИТЯГУВАННЯ КЛАСІВ З HTML
// =======================================

function extractClassesFromHTML(htmlContent) {
  try {
    const classMatches = htmlContent.match(/class\s*=\s*["']([^"']+)["']/g) || []
    const allClasses = new Set()

    classMatches.forEach(match => {
      const classString = match.match(/["']([^"']+)["']/)[1]
      const classes = classString.split(/\s+/).filter(cls => cls.trim())
      classes.forEach(cls => {
        // ✅ FIX: Фільтрація некоректних класів - лінія 893-897 ✅
        if (cls && /^[a-zA-Z_-][a-zA-Z0-9_-]*$/.test(cls)) {
          allClasses.add(cls)
        }
      })
    })

    return Array.from(allClasses).sort()
  } catch (error) {
    outputChannel?.appendLine(`❌ Error extracting classes: ${error.message}`)
    return []
  }
}

// =======================================
// 💾 ЗБЕРЕЖЕННЯ CSS
// =======================================

async function saveGeneratedCSS(cssContent, htmlFilePath) {
  try {
    const cssFilePath = htmlFilePath.replace(/\.html?$/i, ".css")

    await vscode.workspace.fs.writeFile(
      vscode.Uri.file(cssFilePath),
      Buffer.from(cssContent, "utf8")
    )

    outputChannel?.appendLine(`✅ CSS saved to: ${cssFilePath}`)

    // Відкриття згенерованого файлу
    const config = vscode.workspace.getConfiguration("cssClassesFromHtml")
    if (config.get("autoOpenCSS", true)) {
      const document = await vscode.workspace.openTextDocument(cssFilePath)
      await vscode.window.showTextDocument(document, vscode.ViewColumn.Beside)
    }
  } catch (error) {
    outputChannel?.appendLine(`❌ Error saving CSS: ${error.message}`)
    throw error
  }
}

// =======================================
// 🔌 FIGMA INTEGRATION HANDLERS
// =======================================

async function handleGetFigmaCanvases(panel, message) {
  try {
    if (!integrationEngine) {
      throw new Error("Integration Engine не доступний")
    }

    if (!message.figmaToken) {
      throw new Error("Figma API token необхідний")
    }

    integrationEngine.updateOptions({
      figmaToken: message.figmaToken
    })

    const fileId = integrationEngine.extractFileIdFromFigmaLink(message.figmaLink)
    if (!fileId) {
      throw new Error("Некоректний формат Figma посилання")
    }

    outputChannel?.appendLine(`🎨 Loading Canvas from Figma file: ${fileId}`)

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

async function handleGetFigmaLayers(panel, message) {
  try {
    if (!integrationEngine) {
      throw new Error("Integration Engine не доступний")
    }

    const fileId = integrationEngine.extractFileIdFromFigmaLink(message.figmaLink)
    if (!fileId) {
      throw new Error("Некоректний формат Figma посилання")
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

async function handleImportImages(panel, message) {
  try {
    const ImageImporter = moduleLoader.getModule("ImageImporter")
    if (!ImageImporter) {
      throw new Error("Image Importer не доступний")
    }

    if (!integrationEngine || !message.figmaToken) {
      throw new Error("Figma token та integration engine необхідні")
    }

    outputChannel?.appendLine("🖼️ Starting image import...")

    const importer = new ImageImporter({
      outputDir: "images",
      optimizeImages: true,
      formats: ["png", "jpg", "svg"],
      scales: [1, 2]
    })

    integrationEngine.updateOptions({
      figmaToken: message.figmaToken
    })

    const fileId = integrationEngine.extractFileIdFromFigmaLink(message.figmaLink)
    if (!fileId) {
      throw new Error("Некоректний формат Figma посилання")
    }

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

    outputChannel?.appendLine(`✅ Images imported: ${stats.imagesCount} images, ${stats.totalSize}`)
  } catch (error) {
    outputChannel?.appendLine(`❌ Error importing images: ${error.message}`)
    panel.webview.postMessage({
      command: "imagesImported",
      success: false,
      error: error.message
    })
  }
}

async function handleImportFonts(panel, message) {
  try {
    const FontImporter = moduleLoader.getModule("FontImporter")
    if (!FontImporter) {
      throw new Error("Font Importer не доступний")
    }

    if (!integrationEngine || !message.figmaToken) {
      throw new Error("Figma token та integration engine необхідні")
    }

    outputChannel?.appendLine("🔤 Starting font import...")

    const importer = new FontImporter({
      outputDir: ".",
      includeAllWeights: true,
      includeAllStyles: true,
      display: "swap"
    })

    integrationEngine.updateOptions({
      figmaToken: message.figmaToken
    })

    const fileId = integrationEngine.extractFileIdFromFigmaLink(message.figmaLink)
    if (!fileId) {
      throw new Error("Некоректний формат Figma посилання")
    }

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
      cssFile: result.cssFile
    })

    outputChannel?.appendLine(`✅ Fonts imported: ${stats.totalFonts} fonts`)
  } catch (error) {
    outputChannel?.appendLine(`❌ Error importing fonts: ${error.message}`)
    panel.webview.postMessage({
      command: "fontsImported",
      success: false,
      error: error.message
    })
  }
}

async function handleLoadSettings(panel) {
  try {
    const settings = configManager.loadConfig()

    // ✅ FIX: Додаємо поточний HTML файл до налаштувань - лінія 1159-1161 ✅
    settings.currentHTMLFile = currentHTMLFile
    settings.currentHTMLFileName = currentHTMLFile ? path.basename(currentHTMLFile) : null

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

async function handleSaveSettings(panel, settings) {
  try {
    // ✅ FIX: Зберігаємо поточний HTML файл разом з налаштуваннями - лінія 1184-1185 ✅
    settings.lastHTMLFile = currentHTMLFile

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

// =======================================
// 🔄 ДЕАКТИВАЦІЯ
// =======================================

function deactivate() {
  console.log("🔄 CSS Classes from HTML deactivating...")

  try {
    if (panel) {
      panel.dispose()
      panel = null
    }

    if (outputChannel) {
      outputChannel.dispose()
      outputChannel = null
    }

    integrationEngine = null
    currentHTMLFile = null

    console.log("✅ Extension deactivated successfully")
  } catch (error) {
    console.error("❌ Error during deactivation:", error.message)
  }
}

// =======================================
// 📤 ЕКСПОРТ
// =======================================

module.exports = {
  activate,
  deactivate
}
