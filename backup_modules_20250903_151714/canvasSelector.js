// Модуль для вибору множинних Canvas з Figma
const vscode = require("vscode")

class CanvasSelector {
  constructor(figmaService) {
    this.figmaService = figmaService
  }

  async selectMultipleCanvas(figmaLink, accessToken) {
    try {
      const fileKey = this.figmaService.extractFileKeyFromLink(figmaLink)
      const fileData = await this.figmaService.getFile(fileKey)
      
      if (!fileData.document?.children) {
        vscode.window.showWarningMessage("Canvas не знайдено в макеті")
        return []
      }
      
      const canvases = fileData.document.children
        .filter(child => child.type === "CANVAS")
        .map(canvas => ({
          label: canvas.name,
          description: `Canvas • ${canvas.children?.length || 0} елементів`,
          canvas: canvas,
          picked: false
        }))
      
      if (canvases.length === 0) {
        vscode.window.showWarningMessage("Canvas не знайдено в макеті")
        return []
      }
      
      if (canvases.length === 1) {
        vscode.window.showInformationMessage(`Знайдено 1 Canvas: ${canvases[0].canvas.name}`)
        return [canvases[0].canvas]
      }
      
      // Множинний вибір Canvas
      const selectedItems = await vscode.window.showQuickPick(canvases, {
        placeHolder: `Виберіть Canvas (Знайдено: ${canvases.length}). Використовуйте Ctrl/Cmd для множинного вибору`,
        canPickMany: true,
        ignoreFocusOut: true
      })
      
      if (!selectedItems || selectedItems.length === 0) {
        vscode.window.showInformationMessage("Canvas не вибрано")
        return []
      }
      
      const selectedCanvases = selectedItems.map(item => item.canvas)
      const canvasNames = selectedCanvases.map(canvas => canvas.name).join(', ')
      const totalElements = selectedCanvases.reduce((sum, canvas) => sum + (canvas.children?.length || 0), 0)
      
      vscode.window.showInformationMessage(
        `✅ Вибрано ${selectedCanvases.length} Canvas: ${canvasNames} (Загалом елементів: ${totalElements})`
      )
      
      return selectedCanvases
      
    } catch (error) {
      vscode.window.showErrorMessage(`Помилка вибору Canvas: ${error.message}`)
      return []
    }
  }

  async getCanvasInfo(canvases) {
    const info = {
      totalCanvases: canvases.length,
      canvasNames: canvases.map(canvas => canvas.name),
      totalElements: 0,
      elementTypes: new Set()
    }
    
    canvases.forEach(canvas => {
      if (canvas.children) {
        info.totalElements += canvas.children.length
        this._collectElementTypes(canvas.children, info.elementTypes)
      }
    })
    
    return {
      ...info,
      elementTypes: Array.from(info.elementTypes)
    }
  }

  _collectElementTypes(nodes, elementTypes) {
    nodes.forEach(node => {
      elementTypes.add(node.type)
      if (node.children) {
        this._collectElementTypes(node.children, elementTypes)
      }
    })
  }

  // Генерація звіту про вибрані Canvas
  generateCanvasReport(canvases, tokens) {
    let report = `/* ЗВІТ ПРО ВИБРАНІ CANVAS */\n`
    report += `/* Загальна кількість Canvas: ${canvases.length} */\n\n`
    
    canvases.forEach((canvas, index) => {
      report += `/* Canvas ${index + 1}: ${canvas.name} */\n`
      report += `/* Елементів: ${canvas.children?.length || 0} */\n`
      
      if (canvas.children) {
        const elementTypes = new Set()
        this._collectElementTypes(canvas.children, elementTypes)
        report += `/* Типи елементів: ${Array.from(elementTypes).join(', ')} */\n`
      }
      
      report += '\n'
    })
    
    // Статистика токенів
    report += `/* СТАТИСТИКА ТОКЕНІВ */\n`
    report += `/* Кольори: ${Object.keys(tokens.colors || {}).length} */\n`
    report += `/* Типографіка: ${Object.keys(tokens.typography || {}).length} */\n`
    report += `/* Відступи: ${Object.keys(tokens.spacing || {}).length} */\n`
    report += `/* Ефекти: ${Object.keys(tokens.effects || {}).length} */\n`
    report += `/* Компоненти: ${Object.keys(tokens.components || {}).length} */\n\n`
    
    return report
  }

  // Фільтрація токенів по Canvas
  filterTokensByCanvas(tokens, selectedCanvasNames) {
    const filteredTokens = {
      colors: {},
      typography: {},
      spacing: {},
      effects: {},
      components: {}
    }
    
    // Фільтруємо токени, які містять назви вибраних Canvas
    const tokenTypes = ['colors', 'typography', 'spacing', 'effects', 'components']
    tokenTypes.forEach(type => {
      Object.entries(tokens[type] || {}).forEach(([key, value]) => {
        if (this._isTokenFromSelectedCanvas(key, selectedCanvasNames)) {
          filteredTokens[type][key] = value
        }
      })
    })
    
    return filteredTokens
  }

  _isTokenFromSelectedCanvas(tokenKey, canvasNames) {
    // Якщо не вказано Canvas, включаємо всі токени
    if (!canvasNames || canvasNames.length === 0) return true
    
    // Перевіряємо, чи містить ключ токена назву одного з вибраних Canvas
    return canvasNames.some(canvasName => {
      const normalizedCanvasName = canvasName.toLowerCase().replace(/[^a-z0-9]/g, '-')
      const normalizedTokenKey = tokenKey.toLowerCase()
      return normalizedTokenKey.includes(normalizedCanvasName)
    })
  }
}

module.exports = CanvasSelector