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
            designTokens
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
          isSelection ? selectedTags : null
        )

        await showGeneratedCSS(cssContent)
        vscode.window.showInformationMessage("CSS успішно згенеровано!")

      } catch (error) {
        vscode.window.showErrorMessage(`Помилка генерації CSS: ${error.message}`)
      }
    }
  )

  context.subscriptions.push(disposable)
}

async function getFigmaInput() {
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

    accessToken = await vscode.window.showInputBox({
      prompt: "Введіть ваш токен доступу Figma",
      password: true,
      ignoreFocusOut: true
    })

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
    darkMode: config.get("darkMode", true)
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