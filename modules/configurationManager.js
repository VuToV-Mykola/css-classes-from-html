// Оновлений код configurationManager.js з 3 режимами
const vscode = require("vscode");
const ConfigLoader = require('./configLoader');

class ConfigurationManager {
      constructor() {
    this.config = vscode.workspace.getConfiguration("cssclasssfromhtml")
    this.configLoader = new ConfigLoader()
    this.lastUsedSettings = null
    this.lastSelectedMode = null
    this.lastSelectedCanvas = []
    this.lastSelectedLayers = []
  }

  /* !!! Показ діалогу конфігурації - 3 режими !!! */
  async showConfigurationDialog() {
    // Завантажуємо останні налаштування
    const lastSettings = await this.configLoader.loadLastSettings()
    
    const options = [
      {
        label: "$(symbol-class) Мінімальне налаштування",
        description: "Тільки парсинг HTML та генерація порожніх класів",
        detail: "Швидкий старт • Без Figma • Без оптимізацій",
        mode: "minimal",
        icon: "⚡"
      },
      {
        label: "$(rocket) Максимальне налаштування", 
        description: "Повна інтеграція з Figma та всі можливості",
        detail: "Figma інтеграція • Canvas/Layers • ML matching • Всі оптимізації",
        mode: "maximum",
        icon: "🚀"
      },
      {
        label: "$(package) Продакт",
        description: "Оптимізований CSS для production",
        detail: "Мінімізація • Без коментарів • Canvas/Layers • Production-ready",
        mode: "production",
        icon: "📦"
      }
    ]

    // Додаємо мітку про останній вибір
    if (lastSettings?.mode) {
      options.forEach(opt => {
        if (opt.mode === lastSettings.mode) {
          opt.label += " ⭐"
          opt.description += " (останній вибір)"
        }
      })
    }

    const selected = await vscode.window.showQuickPick(options, {
      placeHolder: "Виберіть режим генерації CSS",
      ignoreFocusOut: true,
      title: "🎨 CSS Classes from HTML - Режим роботи"
    })

    if (!selected) return null

    // Зберігаємо вибраний режим
    this.lastSelectedMode = selected.mode

    let config = await this.applyMode(selected.mode)
    
    // Для максимального та продакт режимів - вибір Canvas та Layers
    if (selected.mode !== 'minimal') {
      const canvasAndLayers = await this.selectCanvasAndLayers()
      if (canvasAndLayers) {
        config.selectedCanvas = canvasAndLayers.canvas
        config.selectedLayers = canvasAndLayers.layers
        
        // Зберігаємо вибір
        this.lastSelectedCanvas = canvasAndLayers.canvas
        this.lastSelectedLayers = canvasAndLayers.layers
      }
    }
    
    // Зберігаємо всі налаштування
    config.mode = selected.mode
    config.timestamp = new Date().toISOString()
    
    await this.configLoader.saveLastSettings(config)
    this.lastUsedSettings = config
    
    return config
  }

  /* !!! Вибір Canvas та Layers !!! */
  async selectCanvasAndLayers() {
    // Перевіряємо чи є Figma посилання
    const figmaLink = this.config.get("lastFigmaLink", "")
    
    if (!figmaLink) {
      const input = await vscode.window.showInputBox({
        prompt: "Введіть посилання на Figma макет",
        placeHolder: "https://www.figma.com/file/...",
        ignoreFocusOut: true
      })
      
      if (!input) return null
      
      await this.config.update("lastFigmaLink", input, vscode.ConfigurationTarget.Global)
    }

    // Симуляція вибору Canvas (в реальній версії - запит до Figma API)
    const canvasOptions = [
      { label: "🎨 Desktop", value: "desktop", picked: this.lastSelectedCanvas.includes("desktop") },
      { label: "📱 Mobile", value: "mobile", picked: this.lastSelectedCanvas.includes("mobile") },
      { label: "📋 Tablet", value: "tablet", picked: this.lastSelectedCanvas.includes("tablet") },
      { label: "🧩 Components", value: "components", picked: this.lastSelectedCanvas.includes("components") },
      { label: "🎯 All Canvas", value: "all", picked: this.lastSelectedCanvas.includes("all") }
    ]

    const selectedCanvas = await vscode.window.showQuickPick(canvasOptions, {
      placeHolder: `Виберіть Canvas (останні: ${this.lastSelectedCanvas.join(', ') || 'не вибрано'})`,
      canPickMany: true,
      ignoreFocusOut: true
    })

    if (!selectedCanvas || selectedCanvas.length === 0) {
      // Використовуємо останній вибір
      if (this.lastSelectedCanvas.length > 0) {
        vscode.window.showInformationMessage(`Використовуємо останній вибір Canvas: ${this.lastSelectedCanvas.join(', ')}`)
      }
    }

    // Симуляція вибору Layers
    const layerOptions = [
      { label: "📐 Layout", value: "layout", picked: this.lastSelectedLayers.includes("layout") },
      { label: "🎨 Styles", value: "styles", picked: this.lastSelectedLayers.includes("styles") },
      { label: "🔤 Typography", value: "typography", picked: this.lastSelectedLayers.includes("typography") },
      { label: "🖼️ Images", value: "images", picked: this.lastSelectedLayers.includes("images") },
      { label: "🔘 Components", value: "components", picked: this.lastSelectedLayers.includes("components") },
      { label: "✨ Effects", value: "effects", picked: this.lastSelectedLayers.includes("effects") },
      { label: "📦 All Layers", value: "all", picked: this.lastSelectedLayers.includes("all") }
    ]

    const selectedLayers = await vscode.window.showQuickPick(layerOptions, {
      placeHolder: `Виберіть Layers (останні: ${this.lastSelectedLayers.join(', ') || 'не вибрано'})`,
      canPickMany: true,
      ignoreFocusOut: true
    })

    if (!selectedLayers || selectedLayers.length === 0) {
      // Використовуємо останній вибір
      if (this.lastSelectedLayers.length > 0) {
        vscode.window.showInformationMessage(`Використовуємо останній вибір Layers: ${this.lastSelectedLayers.join(', ')}`)
      }
    }

    return {
      canvas: selectedCanvas ? selectedCanvas.map(c => c.value) : this.lastSelectedCanvas,
      layers: selectedLayers ? selectedLayers.map(l => l.value) : this.lastSelectedLayers
    }
  }

  /* !!! Застосування режиму !!! */
  async applyMode(mode) {
    const configs = {
      minimal: {
        includeGlobal: false,
        includeReset: false,
        includeComments: false,
        commentStyle: "standard",
        optimizeCSS: false,
        saveFigmaStyles: false,
        responsive: false,
        darkMode: false,
        cssVariables: false,
        minify: false,
        skipFigmaInput: true,
        minimal: true,
        enableInspection: false,
        enableHierarchyAnalysis: false,
        enableMLMatching: false
      },
      maximum: {
        includeGlobal: true,
        includeReset: true,
        includeComments: true,
        commentStyle: "author",
        optimizeCSS: true,
        saveFigmaStyles: true,
        responsive: true,
        darkMode: true,
        cssVariables: true,
        minify: false,
        skipFigmaInput: false,
        minimal: false,
        enableInspection: true,
        enableHierarchyAnalysis: true,
        enableMLMatching: true,
        matchingStrategies: ["all"],
        confidenceThreshold: 0.8
      },
      production: {
        includeGlobal: true,
        includeReset: true,
        includeComments: false,
        commentStyle: "none",
        optimizeCSS: true,
        saveFigmaStyles: true,
        responsive: true,
        darkMode: false,
        cssVariables: true,
        minify: true,
        removeRedundant: true,
        removeEmptyRules: true,
        skipFigmaInput: false,
        minimal: false,
        enableInspection: true,
        enableHierarchyAnalysis: true,
        enableMLMatching: true,
        matchingStrategies: ["content", "structural", "ml"],
        confidenceThreshold: 0.9
      }
    }

    const config = configs[mode] || configs.minimal
    
    vscode.window.showInformationMessage(`✅ Режим "${mode}" активовано!`)
    
    return config
  }

  /* !!! Завантаження останніх налаштувань !!! */
  async loadLastSettings() {
    const saved = await this.configLoader.loadLastSettings()
    
    if (saved) {
      // Відновлюємо останні вибори
      this.lastSelectedMode = saved.mode
      this.lastSelectedCanvas = saved.selectedCanvas || []
      this.lastSelectedLayers = saved.selectedLayers || []
      
      vscode.window.showInformationMessage(
        `📂 Відновлено останні налаштування: ${saved.mode} режим`
      )
    }
    
    return saved
  }

  /* !!! Очищення налаштувань !!! */
  async clearSettings() {
    this.lastSelectedMode = null
    this.lastSelectedCanvas = []
    this.lastSelectedLayers = []
    this.lastUsedSettings = null
    
    await this.configLoader.cleanupOldSettings()
    
    vscode.window.showInformationMessage("🗑️ Налаштування очищено")
  }

  /* !!! Експорт поточних налаштувань !!! */
  async exportSettings() {
    const settings = {
      mode: this.lastSelectedMode,
      canvas: this.lastSelectedCanvas,
      layers: this.lastSelectedLayers,
      config: this.lastUsedSettings,
      exportedAt: new Date().toISOString()
    }

    const jsonString = JSON.stringify(settings, null, 2)
    
    const doc = await vscode.workspace.openTextDocument({
      content: jsonString,
      language: "json"
    })
    
    await vscode.window.showTextDocument(doc)
    
    vscode.window.showInformationMessage("📤 Налаштування експортовано")
    
    return settings
  }
}

module.exports = ConfigurationManager;
