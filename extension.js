// Головний файл розширення VS Code для генерації CSS з HTML
const vscode = require("vscode")
const htmlParser = require("./modules/htmlParser")
const cssGenerator = require("./modules/cssGenerator")
const commentManager = require("./modules/commentManager")
const FigmaService = require("./modules/figmaService")

function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "cssclasssfromhtml.generateCSS",
    async function () {
      try {
        const editor = vscode.window.activeTextEditor
        if (!editor) {
          vscode.window.showErrorMessage("Не знайдено активного редактора!")
          return
        }

        const {figmaLink, accessToken} = await getFigmaInput()
        const config = getConfiguration()
        // Отримуємо вибраний текст або весь документ
        const selection = editor.selection
        const htmlContent = selection.isEmpty 
          ? editor.document.getText() 
          : editor.document.getText(selection)

        commentManager.setLanguage(config.language)

        const {classes, classParents, classTags} = htmlParser.extractClasses(htmlContent)
        
        if (classes.length === 0) {
          vscode.window.showWarningMessage("Не знайдено CSS класів у вибраному тексті!")
          return
        }
        let designTokens = null

        if (figmaLink && accessToken) {
          designTokens = await getFigmaTokens(figmaLink, accessToken)
        }

        const classDictionary = cssGenerator.createClassDictionary(
          classes,
          {
            responsive: config.responsive,
            darkMode: config.darkMode,
            designTokens,
            breakpoints: config.breakpoints,
            colorFormat: config.colorFormat,
            prefixClasses: config.prefixClasses
          },
          classParents,
          classTags
        )

        // Якщо вибрано фрагмент - фільтруємо глобальні стилі для відповідних елементів
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
            colorFormat: config.colorFormat
          }
        )

        await showGeneratedCSS(cssContent)
        
        // Автозбереження файлу
        if (config.autoSave) {
          await saveToFile(cssContent, config.outputPath)
        }
        
        vscode.window.showInformationMessage("CSS успішно згенеровано!")

      } catch (error) {
        vscode.window.showErrorMessage(`Помилка генерації CSS: ${error.message}`)
      }
    }
  )

  context.subscriptions.push(disposable)
}

async function getFigmaInput() {
  const config = vscode.workspace.getConfiguration("cssclasssfromhtml")
  const savedToken = config.get("figmaToken", "")

  const figmaLink = await vscode.window.showInputBox({
    prompt: "Введіть посилання на макет Figma (опціонально)",
    placeHolder: "https://www.figma.com/file/...",
    ignoreFocusOut: true
  })

  let accessToken = null
  if (figmaLink?.trim()) {
    // Validate Figma URL
    if (!figmaLink.includes("figma.com/")) {
      throw new Error("Невірний формат посилання Figma")
    }

    // Використовуємо збережений токен або запитуємо новий
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
    }
  }

  return {figmaLink, accessToken}
}

function getConfiguration() {
  const config = vscode.workspace.getConfiguration("cssclasssfromhtml")
  return {
    language: config.get("language", "uk"),
    includeGlobal: config.get("includeGlobal", true),
    includeReset: config.get("includeReset", true),
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
    prefixClasses: config.get("prefixClasses", "")
  }
}

async function getFigmaTokens(figmaLink, accessToken) {
  try {
    const figmaService = new FigmaService(accessToken)
    const fileKey = figmaService.extractFileKeyFromLink(figmaLink)

    if (!fileKey) {
      throw new Error("Не вдалося витягти ключ файлу з посилання Figma")
    }

    const [fileData, stylesData] = await Promise.all([
      figmaService.getFile(fileKey),
      figmaService.getStyles(fileKey)
    ])

    const designTokens = figmaService.parseDesignTokens(fileData, stylesData)
    vscode.window.showInformationMessage("Дизайн-токени успішно отримані з Figma")
    
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

async function saveToFile(cssContent, outputPath) {
  try {
    const fs = require('fs').promises
    const path = require('path')
    
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
    if (!workspaceFolder) return
    
    const fullPath = path.resolve(workspaceFolder, outputPath)
    const dir = path.dirname(fullPath)
    
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(fullPath, cssContent, 'utf8')
    
    vscode.window.showInformationMessage(`CSS збережено: ${outputPath}`)
  } catch (error) {
    vscode.window.showErrorMessage(`Помилка збереження: ${error.message}`)
  }
}

function extractTagsFromSelection(htmlContent) {
  const tagRegex = /<(\w+)[^>]*>/g
  const tags = new Set()
  let match
  
  while ((match = tagRegex.exec(htmlContent)) !== null) {
    tags.add(match[1].toLowerCase())
  }
  
  return Array.from(tags)
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
}