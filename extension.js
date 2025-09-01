/* !!! Головний файл розширення VS Code для генерації CSS з HTML !!! */
const vscode = require("vscode")
const htmlParser = require("./modules/htmlParser")
const cssGenerator = require("./modules/cssGenerator")
const commentManager = require("./modules/commentManager")
const FigmaService = require("./modules/figmaService")
const FigmaInspector = require("./modules/figmaInspector")
const UniversalFigmaGenerator = require("./modules/universalFigmaGenerator")
const CanvasSelector = require("./modules/canvasSelector")
const ConfigurationManager = require("./modules/configurationManager")
const path = require('path')
const fs = require('fs').promises

function activate(context) {
  const configManager = new ConfigurationManager()
  
  let disposable = vscode.commands.registerCommand(
    "cssclasssfromhtml.generateCSS",
    async function () {
      try {
        const editor = vscode.window.activeTextEditor
        if (!editor) {
          vscode.window.showErrorMessage("Не знайдено активного редактора!")
          return
        }

        const {figmaLink, accessToken, selectedCanvases} = await getFigmaInput()
        const config = await getConfiguration(configManager)
        /* !!! Отримуємо вибраний текст або весь документ !!! */
        const selection = editor.selection
        const htmlContent = selection.isEmpty 
          ? editor.document.getText() 
          : editor.document.getText(selection)

        commentManager.setLanguage(config.language)
        commentManager.setCommentStyle(config.commentStyle)

        const {classes, classParents, classTags} = htmlParser.extractClasses(htmlContent)
        
        if (classes.length === 0) {
          vscode.window.showWarningMessage("Не знайдено CSS класів у вибраному тексті!")
          return
        }
        let designTokens = null

        if (figmaLink && accessToken) {
          designTokens = await getFigmaTokens(figmaLink, accessToken, selectedCanvases)
        }

        const classDictionary = cssGenerator.createClassDictionary(
          classes,
          {
            responsive: config.responsive,
            darkMode: config.darkMode,
            designTokens,
            breakpoints: config.breakpoints,
            colorFormat: config.colorFormat,
            prefixClasses: config.prefixClasses,
            enableInspection: config.enableInspection,
            inspectionPriority: config.inspectionPriority,
            matchThreshold: config.matchThreshold
          },
          classParents,
          classTags
        )

        /* !!! Якщо вибрано фрагмент - фільтруємо глобальні стилі для відповідних елементів !!! */
        const isSelection = !selection.isEmpty
        const selectedTags = isSelection ? extractTagsFromSelection(htmlContent) : []
        const cssContent = cssGenerator.generateCSS(
          classes,
          classDictionary,
          config.includeGlobal,
          config.includeReset,
          designTokens,
          isSelection ? selectedTags : null,
          {
            cssVariables: config.cssVariables,
            minify: config.minify,
            indentSize: config.indentSize,
            includeComments: config.includeComments,
            sortProperties: config.sortProperties,
            colorFormat: config.colorFormat,
            optimizeCSS: config.optimizeCSS,
            removeRedundant: config.removeRedundant,
            optimizeShorthands: config.optimizeShorthands,
            optimizeInheritance: config.optimizeInheritance,
            removeEmptyRules: config.removeEmptyRules,
            commentStyle: config.commentStyle,
            modernSyntax: true,
            preserveComments: true
          }
        )

        await showGeneratedCSS(cssContent)
        
        /* !!! Автозбереження файлу відносно HTML !!! */
        if (config.autoSave) {
          const htmlFilePath = editor.document.uri.fsPath
          const relativeOutputPath = getRelativeFigmaPath(htmlFilePath, config.outputPath)
          await saveToFile(cssContent, relativeOutputPath)
        }
        
        /* !!! Генерація універсального CSS з Figma токенів !!! */
        if (config.saveFigmaStyles && designTokens && selectedCanvases && selectedCanvases.length > 0) {
          const htmlFilePath = editor.document.uri.fsPath
          const figmaService = new FigmaService(accessToken)
          const universalGenerator = new UniversalFigmaGenerator(figmaService)
          const tokens = universalGenerator.extractTokensFromCanvases(selectedCanvases)
          const universalCSS = universalGenerator.generateUniversalCSS(classes, tokens)
          
          let universalPath = config.figmaOutputPath
          if (!universalPath.includes('figma') && !universalPath.includes('styles.css')) {
            universalPath = universalPath.replace('.css', '-figma.css')
          }
          const relativeUniversalPath = getRelativeFigmaPath(htmlFilePath, universalPath)
          await saveToFile(universalCSS, relativeUniversalPath)
        }
        
        /* !!! Зберігаємо останню дію та додаємо в історію !!! */
        const actionSettings = {
          figmaLink,
          selectedCanvases: selectedCanvases?.map(canvas => canvas.name) || [],
          includeGlobal: config.includeGlobal,
          includeReset: config.includeReset,
          saveFigmaStyles: config.saveFigmaStyles,
          optimizeCSS: config.optimizeCSS,
          removeRedundant: config.removeRedundant,
          optimizeShorthands: config.optimizeShorthands,
          optimizeInheritance: config.optimizeInheritance,
          removeEmptyRules: config.removeEmptyRules,
          timestamp: new Date().toLocaleString()
        }
        
        await saveActionToHistory(actionSettings)
        await configManager.autoSaveConfiguration(config)
        
        const configUpdate = vscode.workspace.getConfiguration("cssclasssfromhtml")
        await Promise.all([
          configUpdate.update("saveLastAction", "generateCSS", vscode.ConfigurationTarget.Global),
          configUpdate.update("lastActionSettings", actionSettings, vscode.ConfigurationTarget.Global),
          configUpdate.update("lastSelectedCanvases", selectedCanvases?.map(canvas => canvas.name) || [], vscode.ConfigurationTarget.Global)
        ])
        
        vscode.window.showInformationMessage("CSS успішно згенеровано!")

      } catch (error) {
        vscode.window.showErrorMessage(`Помилка генерації CSS: ${error.message}`)
      }
    }
  )

  /* !!! Команда для повторення останньої дії !!! */
  let repeatDisposable = vscode.commands.registerCommand(
    "cssclasssfromhtml.repeatLastAction",
    async function () {
      try {
        const config = vscode.workspace.getConfiguration("cssclasssfromhtml")
        const lastActionSettings = config.get("lastActionSettings", {})
        const actionHistory = config.get("actionHistory", [])
        const showHistory = config.get("showActionHistory", true)
        
        if (showHistory && actionHistory.length > 0) {
          /* !!! Показуємо історію дій для вибору !!! */
          const historyItems = actionHistory.map((action, index) => ({
            label: `${action.timestamp} - ${action.figmaLink ? 'Figma' : 'HTML only'}`,
            description: action.figmaLink ? `Canvas: ${action.selectedCanvases?.join(', ') || 'All'}` : 'Local generation',
            detail: `Global: ${action.includeGlobal}, Reset: ${action.includeReset}, Figma: ${action.saveFigmaStyles}`,
            action: action
          }))
          
          const selected = await vscode.window.showQuickPick(historyItems, {
            placeHolder: "Виберіть дію для повторення",
            ignoreFocusOut: true
          })
          
          if (selected) {
            await config.update("lastActionSettings", selected.action, vscode.ConfigurationTarget.Global)
            await config.update("repeatLastAction", true, vscode.ConfigurationTarget.Global)
            await vscode.commands.executeCommand("cssclasssfromhtml.generateCSS")
            await config.update("repeatLastAction", false, vscode.ConfigurationTarget.Global)
          }
        } else if (Object.keys(lastActionSettings).length > 0) {
          /* !!! Повторюємо останню дію без вибору !!! */
          await config.update("repeatLastAction", true, vscode.ConfigurationTarget.Global)
          await vscode.commands.executeCommand("cssclasssfromhtml.generateCSS")
          await config.update("repeatLastAction", false, vscode.ConfigurationTarget.Global)
        } else {
          vscode.window.showWarningMessage("Немає збережених дій для повторення")
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Помилка повторення дії: ${error.message}`)
      }
    }
  )

  /* !!! Команда для управління пресетами !!! */
  let presetsDisposable = vscode.commands.registerCommand(
    "cssclasssfromhtml.managePresets",
    async function () {
      try {
        const action = await configManager.showPresetSelector()
        if (!action) return

        switch (action.action) {
          case "create":
            const name = await vscode.window.showInputBox({
              prompt: "Введіть назву пресету",
              placeHolder: "Моя конфігурація",
              ignoreFocusOut: true
            })
            if (name) {
              const currentConfig = await getConfiguration(configManager)
              await configManager.savePreset(name, currentConfig)
            }
            break

          case "delete":
            const presets = configManager.getAvailablePresets()
            const toDelete = await vscode.window.showQuickPick(
              presets.map(p => ({ label: p.label, description: p.description, name: p.label })),
              { placeHolder: "Виберіть пресет для видалення" }
            )
            if (toDelete) {
              await configManager.deletePreset(toDelete.name)
            }
            break

          case "load":
            const config = action.preset
            if (config) {
              await configManager.autoSaveConfiguration(config)
              vscode.window.showInformationMessage(`Пресет "${action.label}" завантажено!`)
            }
            break
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Помилка управління пресетами: ${error.message}`)
      }
    }
  )

  /* !!! Команда для експорту конфігурації !!! */
  let exportDisposable = vscode.commands.registerCommand(
    "cssclasssfromhtml.exportConfiguration",
    async function () {
      try {
        await configManager.exportConfiguration()
      } catch (error) {
        vscode.window.showErrorMessage(`Помилка експорту: ${error.message}`)
      }
    }
  )

  /* !!! Команда для імпорту конфігурації !!! */
  let importDisposable = vscode.commands.registerCommand(
    "cssclasssfromhtml.importConfiguration",
    async function () {
      try {
        const editor = vscode.window.activeTextEditor
        if (!editor) {
          vscode.window.showErrorMessage("Відкрийте JSON файл з конфігурацією")
          return
        }

        const jsonContent = editor.document.getText()
        await configManager.importConfiguration(jsonContent)
      } catch (error) {
        vscode.window.showErrorMessage(`Помилка імпорту: ${error.message}`)
      }
    }
  )

  context.subscriptions.push(disposable, repeatDisposable, presetsDisposable, exportDisposable, importDisposable)
}

async function getFigmaInput() {
  const config = vscode.workspace.getConfiguration("cssclasssfromhtml")
  const savedToken = config.get("figmaToken", "")
  const lastFigmaLink = config.get("lastFigmaLink", "")
  const quickGenerate = config.get("quickGenerate", false)
  const repeatLastAction = config.get("repeatLastAction", false)
  const lastActionSettings = config.get("lastActionSettings", {})
  
  /* !!! Повторення останньої дії !!! */
  if (repeatLastAction && lastActionSettings.figmaLink) {
    const lastCanvasNames = config.get("lastSelectedCanvases", [])
    
    if (lastCanvasNames.length > 0) {
      const figmaService = new FigmaService(savedToken)
      const fileKey = figmaService.extractFileKeyFromLink(lastActionSettings.figmaLink)
      
      try {
        const fileData = await figmaService.getFile(fileKey)
        const selectedCanvases = fileData.document.children
          .filter(child => child.type === "CANVAS" && lastCanvasNames.includes(child.name))
        
        if (selectedCanvases.length > 0) {
          vscode.window.showInformationMessage(`Відновлено вибір Canvas: ${lastCanvasNames.join(', ')}`)
          return {
            figmaLink: lastActionSettings.figmaLink,
            accessToken: savedToken,
            selectedCanvases
          }
        }
      } catch (error) {
        vscode.window.showWarningMessage(`Помилка відновлення Canvas: ${error.message}`)
      }
    }
  }

  /* !!! Швидка генерація з збереженими налаштуваннями !!! */
  if (quickGenerate && lastFigmaLink) {
    return {figmaLink: lastFigmaLink, accessToken: savedToken}
  }

  const figmaLink = await vscode.window.showInputBox({
    prompt: "Введіть посилання на макет Figma (опціонально)",
    placeHolder: lastFigmaLink || "https://www.figma.com/file/...",
    value: lastFigmaLink || "",
    ignoreFocusOut: true
  })

  let accessToken = null
  let selectedCanvases = []
  
  if (figmaLink?.trim()) {
    /* !!! Перевіряємо валідність URL Figma !!! */
    if (!figmaLink.includes("figma.com/")) {
      throw new Error("Невірний формат посилання Figma")
    }

    /* !!! Використовуємо збережений токен або запитуємо новий !!! */
    if (savedToken?.trim()) {
      accessToken = savedToken
    } else {
      accessToken = await vscode.window.showInputBox({
        prompt: "Введіть ваш токен доступу Figma (або збережіть в налаштуваннях)",
        password: true,
        ignoreFocusOut: true
      })
    }

    if (!accessToken) {
      vscode.window.showWarningMessage("Генерація без токена Figma - будуть використані стандартні значення")
    } else {
      /* !!! Отримуємо список Canvas для вибору !!! */
      const canvasSelector = new CanvasSelector(new FigmaService(accessToken))
      selectedCanvases = await canvasSelector.selectMultipleCanvas(figmaLink, accessToken)
      
      /* !!! Зберігаємо вибрані Canvas !!! */
      if (selectedCanvases.length > 0) {
        const canvasNames = selectedCanvases.map(canvas => canvas.name)
        await config.update("lastSelectedCanvases", canvasNames, vscode.ConfigurationTarget.Global)
      }
    }
  }

  /* !!! Зберігаємо останнє використане посилання !!! */
  if (figmaLink?.trim()) {
    await config.update("lastFigmaLink", figmaLink, vscode.ConfigurationTarget.Global)
  }

  return {figmaLink, accessToken, selectedCanvases}
}

async function selectCanvas(figmaLink, accessToken) {
  try {
    const config = vscode.workspace.getConfiguration("cssclasssfromhtml")
    const lastSelectedCanvas = config.get("lastSelectedCanvas", "")
    const rememberCanvas = config.get("rememberCanvas", true)
    const autoSelectCanvas = config.get("autoSelectCanvas", false)
    
    const figmaService = new FigmaService(accessToken)
    const fileKey = figmaService.extractFileKeyFromLink(figmaLink)
    const fileData = await figmaService.getFile(fileKey)
    
    if (!fileData.document?.children) {
      return null
    }
    
    const canvases = fileData.document.children
      .filter(child => child.type === "CANVAS")
      .map(canvas => ({
        label: canvas.name,
        description: `Canvas • ${canvas.children?.length || 0} елементів`,
        canvas: canvas
      }))
    
    if (canvases.length === 0) {
      vscode.window.showWarningMessage("Canvas не знайдено в макеті")
      return null
    }
    
    if (canvases.length === 1) {
      const canvas = canvases[0].canvas
      if (rememberCanvas) {
        await config.update("lastSelectedCanvas", canvas.name, vscode.ConfigurationTarget.Global)
      }
      return canvas
    }
    
    // Автовибір останнього Canvas
    if (autoSelectCanvas && lastSelectedCanvas) {
      const lastCanvas = canvases.find(c => c.canvas.name === lastSelectedCanvas)
      if (lastCanvas) {
        vscode.window.showInformationMessage(`Автовибір Canvas: ${lastSelectedCanvas}`)
        return lastCanvas.canvas
      }
    }
    
    // Позначаємо останній вибраний Canvas
    if (rememberCanvas && lastSelectedCanvas) {
      const lastIndex = canvases.findIndex(c => c.canvas.name === lastSelectedCanvas)
      if (lastIndex !== -1) {
        canvases[lastIndex].description += " (останній вибраний)"
      }
    }
    
    const selected = await vscode.window.showQuickPick(canvases, {
      placeHolder: "Виберіть Canvas для генерації CSS",
      ignoreFocusOut: true
    })
    
    if (selected && rememberCanvas) {
      await config.update("lastSelectedCanvas", selected.canvas.name, vscode.ConfigurationTarget.Global)
    }
    
    return selected?.canvas || null
  } catch (error) {
    vscode.window.showWarningMessage(`Помилка отримання Canvas: ${error.message}`)
    return null
  }
}

async function getConfiguration(configManager) {
  const config = vscode.workspace.getConfiguration("cssclasssfromhtml")
  
  // Показуємо діалог конфігурації якщо потрібно
  const dialogConfig = await configManager.showConfigurationDialog()
  if (dialogConfig === null) {
    throw new Error("Конфігурацію скасовано користувачем")
  }
  
  const savedConfig = dialogConfig || config.get("savedConfiguration", {})
  const saveConfiguration = config.get("saveConfiguration", true)
  const rememberSettings = config.get("rememberSettings", true)
  
  const settings = {
    language: config.get("language", "uk"),
    includeGlobal: saveConfiguration && savedConfig.includeGlobal !== undefined ? savedConfig.includeGlobal : config.get("includeGlobal", true),
    includeReset: saveConfiguration && savedConfig.includeReset !== undefined ? savedConfig.includeReset : config.get("includeReset", true),
    responsive: config.get("responsive", true),
    darkMode: config.get("darkMode", true),
    figmaToken: config.get("figmaToken", ""),
    autoSave: config.get("autoSave", true),
    outputPath: config.get("outputPath", "./css/styles.css"),
    cssVariables: config.get("cssVariables", true),
    minify: config.get("minify", false),
    indentSize: config.get("indentSize", 2),
    breakpoints: config.get("breakpoints", {mobile: "320px", tablet: "768px", desktop: "1158px"}),
    colorFormat: config.get("colorFormat", "hex"),
    includeComments: config.get("includeComments", true),
    sortProperties: config.get("sortProperties", true),
    prefixClasses: config.get("prefixClasses", ""),
    enableInspection: config.get("enableInspection", true),
    inspectionPriority: config.get("inspectionPriority", "figma-first"),
    matchThreshold: config.get("matchThreshold", 0.4),
    saveFigmaStyles: saveConfiguration && savedConfig.saveFigmaStyles !== undefined ? savedConfig.saveFigmaStyles : config.get("saveFigmaStyles", true),
    figmaOutputPath: config.get("figmaOutputPath", "./css/figma.css"),
    figmaInspectionDepth: config.get("figmaInspectionDepth", "full"),
    figmaHierarchicalOutput: config.get("figmaHierarchicalOutput", true),
    relativePaths: config.get("relativePaths", true),
    createCssFolder: config.get("createCssFolder", true),
    rememberSettings: config.get("rememberSettings", true),
    quickGenerate: config.get("quickGenerate", false),
    lastSelectedCanvas: config.get("lastSelectedCanvas", ""),
    rememberCanvas: config.get("rememberCanvas", true),
    autoSelectCanvas: config.get("autoSelectCanvas", false),
    saveLastAction: config.get("saveLastAction", ""),
    repeatLastAction: config.get("repeatLastAction", false),
    lastActionSettings: config.get("lastActionSettings", {}),
    figmaMultiCanvas: config.get("figmaMultiCanvas", true),
    universalGeneration: config.get("universalGeneration", true),
    optimizeCSS: saveConfiguration && savedConfig.optimizeCSS !== undefined ? savedConfig.optimizeCSS : config.get("optimizeCSS", true),
    removeRedundant: saveConfiguration && savedConfig.removeRedundant !== undefined ? savedConfig.removeRedundant : config.get("removeRedundant", true),
    optimizeShorthands: saveConfiguration && savedConfig.optimizeShorthands !== undefined ? savedConfig.optimizeShorthands : config.get("optimizeShorthands", true),
    optimizeInheritance: saveConfiguration && savedConfig.optimizeInheritance !== undefined ? savedConfig.optimizeInheritance : config.get("optimizeInheritance", true),
    removeEmptyRules: saveConfiguration && savedConfig.removeEmptyRules !== undefined ? savedConfig.removeEmptyRules : config.get("removeEmptyRules", true),
    commentStyle: config.get("commentStyle", "author"),
    lastSelectedCanvases: config.get("lastSelectedCanvases", []),
    saveConfiguration
  }
  
  // Зберігаємо налаштування для наступної дії
  if (settings.saveConfiguration) {
    const configToSave = {
      includeGlobal: settings.includeGlobal,
      includeReset: settings.includeReset,
      saveFigmaStyles: settings.saveFigmaStyles,
      optimizeCSS: settings.optimizeCSS,
      removeRedundant: settings.removeRedundant,
      optimizeShorthands: settings.optimizeShorthands,
      optimizeInheritance: settings.optimizeInheritance,
      removeEmptyRules: settings.removeEmptyRules,
      lastSelectedCanvases: settings.lastSelectedCanvases,
      colorFormat: settings.colorFormat,
      responsive: settings.responsive,
      darkMode: settings.darkMode,
      cssVariables: settings.cssVariables,
      includeComments: settings.includeComments,
      sortProperties: settings.sortProperties,
      commentStyle: settings.commentStyle
    }
    
    await config.update("savedConfiguration", configToSave, vscode.ConfigurationTarget.Global)
  }
  
  if (rememberSettings) {
    const settingsToSave = {
      figmaMultiCanvas: settings.figmaMultiCanvas,
      universalGeneration: settings.universalGeneration,
      matchThreshold: settings.matchThreshold,
      saveFigmaStyles: settings.saveFigmaStyles,
      includeGlobal: settings.includeGlobal,
      includeReset: settings.includeReset,
      optimizeCSS: settings.optimizeCSS,
      removeRedundant: settings.removeRedundant,
      optimizeShorthands: settings.optimizeShorthands,
      optimizeInheritance: settings.optimizeInheritance,
      removeEmptyRules: settings.removeEmptyRules,
      colorFormat: settings.colorFormat,
      responsive: settings.responsive,
      darkMode: settings.darkMode,
      cssVariables: settings.cssVariables,
      includeComments: settings.includeComments,
      sortProperties: settings.sortProperties,
      commentStyle: settings.commentStyle
    }
    
    await config.update("lastActionSettings", {
      ...config.get("lastActionSettings", {}),
      ...settingsToSave
    }, vscode.ConfigurationTarget.Global)
  }
  
  return settings
}

async function getFigmaTokens(figmaLink, accessToken, selectedCanvases = []) {
  try {
    const figmaService = new FigmaService(accessToken)
    const figmaInspector = new FigmaInspector(accessToken)
    const fileKey = figmaService.extractFileKeyFromLink(figmaLink)

    if (!fileKey) {
      throw new Error("Не вдалося витягти ключ файлу з посилання Figma")
    }

    const [fileData, stylesData, inspectedStyles] = await Promise.all([
      figmaService.getFile(fileKey),
      figmaService.getStyles(fileKey),
      figmaInspector.inspectFile(fileKey)
    ])

    // Використовуємо вибрані Canvas або весь документ
    const documentToProcess = selectedCanvases.length > 0 ? 
      { ...fileData, document: { ...fileData.document, children: selectedCanvases } } : 
      fileData

    const designTokens = figmaService.parseDesignTokens(documentToProcess, stylesData)
    
    // Додаємо детальні стилі з інспекції та назву файлу
    designTokens.inspectedStyles = inspectedStyles
    designTokens.fileName = selectedCanvases.length > 0 ? 
      selectedCanvases.map(canvas => canvas.name).join('-') : 
      (fileData.name || 'figma')
    
    const canvasInfo = selectedCanvases.length > 0 ? 
      ` (Canvas: ${selectedCanvases.map(canvas => canvas.name).join(', ')})` : ''
    vscode.window.showInformationMessage(`Дизайн-токени та стилі успішно отримані з Figma${canvasInfo}`)
    
    return designTokens
  } catch (error) {
    vscode.window.showWarningMessage(
      `Не вдалося отримати токени з Figma: ${error.message}. Використовуються стандартні токени.`
    )
    return null
  }
}

async function showGeneratedCSS(cssContent) {
  const doc = await vscode.workspace.openTextDocument({
    content: cssContent,
    language: "css"
  })
  
  await vscode.window.showTextDocument(doc)
}

function getRelativeFigmaPath(htmlFilePath, outputPath) {
  const config = vscode.workspace.getConfiguration("cssclasssfromhtml")
  
  if (config.get("relativePaths", true)) {
    const htmlDir = path.dirname(htmlFilePath)
    return path.resolve(htmlDir, outputPath)
  } else {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
    return workspaceFolder ? path.resolve(workspaceFolder, outputPath) : outputPath
  }
}

async function saveToFile(cssContent, outputPath) {
  try {
    // Безпечна валідація шляху
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
    
    if (!workspaceRoot) {
      throw new Error('Workspace не знайдено')
    }
    
    // Санітизація вхідного шляху
    const sanitizedPath = outputPath.replace(/\.\./g, '').replace(/[<>:"|?*]/g, '')
    
    // Використовуємо outputPath як є, якщо він абсолютний
    let fullPath = path.isAbsolute(sanitizedPath) ? sanitizedPath : path.join(workspaceRoot, sanitizedPath)
    
    // Нормалізуємо шлях після об'єднання
    fullPath = path.normalize(fullPath)
    
    // Перевіряємо що шлях знаходиться в межах workspace
    if (!fullPath.startsWith(workspaceRoot)) {
      throw new Error('Небезпечний шлях файлу')
    }
    
    // Перевіряємо чи це директорія
    try {
      const stat = await fs.stat(fullPath)
      if (stat.isDirectory()) {
        fullPath = path.join(fullPath, 'styles.css')
      }
    } catch (e) {
      // Перевіряємо тип помилки
      if (e.code !== 'ENOENT') {
        throw new Error(`Помилка доступу до файлу: ${e.message}`)
      }
      // Файл не існує - це нормально
    }
    
    const dir = path.dirname(fullPath)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(fullPath, cssContent, 'utf8')
    
    const relativePath = path.relative(workspaceRoot, fullPath)
    vscode.window.showInformationMessage(`CSS збережено: ${relativePath}`)
  } catch (error) {
    vscode.window.showErrorMessage(`Помилка збереження: ${error.message}`)
  }
}

function extractTagsFromSelection(htmlContent) {
  const tags = new Set()
  
  // Використовуємо matchAll для безпечного парсингу
  for (const match of htmlContent.matchAll(/<(\w+)[^>]*>/g)) {
    tags.add(match[1].toLowerCase())
  }
  
  return Array.from(tags)
}

async function saveActionToHistory(actionSettings) {
  const config = vscode.workspace.getConfiguration("cssclasssfromhtml")
  const actionHistory = config.get("actionHistory", [])
  const maxHistorySize = config.get("maxHistorySize", 5)
  
  // Оптимізований спосіб додавання на початок
  actionHistory.unshift(actionSettings)
  const trimmedHistory = actionHistory.slice(0, maxHistorySize)
  
  await config.update("actionHistory", trimmedHistory, vscode.ConfigurationTarget.Global)
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
}