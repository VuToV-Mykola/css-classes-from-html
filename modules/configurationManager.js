/* !!! Модуль управління конфігурацією та пресетами !!! */
const vscode = require("vscode")
const ConfigLoader = require('./configLoader')

class ConfigurationManager {
  constructor() {
    this.config = vscode.workspace.getConfiguration("cssclasssfromhtml")
    this.configLoader = new ConfigLoader()
    this.lastUsedSettings = null
  }

  /* !!! Показ діалогу конфігурації з пресетами !!! */
  async showConfigurationDialog() {
    // Завантажуємо пресети з файлу
    const presets = await this.configLoader.loadPresets()
    const userPresets = await this.configLoader.loadUserPresets()
    const lastSettings = await this.configLoader.loadLastSettings()
    
    const options = []
    
    // Додаємо стандартні пресети
    for (const [key, preset] of Object.entries(presets)) {
      options.push({
        label: `${preset.icon} ${preset.name}`,
        description: preset.description,
        detail: this.getPresetDetails(preset.settings),
        preset: key
      })
    }
    
    // Додаємо користувацькі пресети
    for (const [name, preset] of Object.entries(userPresets)) {
      options.push({
        label: `$(star) ${name}`,
        description: "Користувацький пресет",
        detail: `Збережено: ${this.formatSafeDate(preset.savedAt)}`,
        preset: "user",
        userPreset: name,
        settings: preset
      })
    }
    
    // Додаємо опцію останніх налаштувань
    if (lastSettings) {
      options.unshift({
        label: "$(history) Останні налаштування",
        description: "Використати останню конфігурацію",
        detail: `Збережено: ${this.formatSafeDate(lastSettings.savedAt)}`,
        preset: "last",
        settings: lastSettings
      })
    }
    
    // Додаємо опцію користувацьких налаштувань
    options.push({
      label: "$(settings-gear) Налаштування користувача",
      description: "Власна конфігурація",
      detail: "Створити або завантажити власні налаштування",
      preset: "custom"
    })

    const selected = await vscode.window.showQuickPick(options, {
      placeHolder: "Виберіть конфігурацію для генерації CSS",
      ignoreFocusOut: true,
      title: "🎉 CSS Classes from HTML - Конфігурація"
    })

    if (!selected) {
      return null // Скасовано
    }

    let config
    if (selected.preset === "last" || selected.preset === "user") {
      config = selected.settings
    } else {
      config = await this.applyPreset(selected.preset)
    }
    
    // Зберігаємо як останні налаштування
    if (config) {
      this.lastUsedSettings = config
      await this.configLoader.saveLastSettings(config)
    }
    
    return config
  }

  /* !!! Застосування пресету !!! */
  async applyPreset(preset) {
    if (preset === 'custom') {
      return await this.handleCustomConfiguration()
    }

    // Завантажуємо пресети з файлу
    const presets = await this.configLoader.loadPresets()
    const presetConfig = presets[preset]
    
    if (presetConfig) {
      vscode.window.showInformationMessage(`✅ Застосовано конфігурацію: ${presetConfig.name}`)
      return presetConfig.settings
    }

    // Якщо пресет не знайдено, використовуємо налаштування за замовчуванням
    const defaults = await this.configLoader.loadDefaults()
    return defaults
  }

  /* !!! Обробка користувацької конфігурації !!! */
  async handleCustomConfiguration() {
    const options = [
      {
        label: "$(file-add) Створити нову конфігурацію",
        description: "Налаштувати параметри вручну",
        action: "create"
      },
      {
        label: "$(folder-opened) Завантажити з файлу",
        description: "Імпортувати збережену конфігурацію",
        action: "import"
      },
      {
        label: "$(list-selection) Вибрати збережений пресет",
        description: "Використати раніше створений пресет",
        action: "select"
      }
    ]

    const selected = await vscode.window.showQuickPick(options, {
      placeHolder: "Виберіть спосіб налаштування",
      ignoreFocusOut: true
    })

    if (!selected) return this.getSavedConfiguration()

    switch (selected.action) {
      case "create":
        return await this.createCustomConfiguration()
      case "import":
        return await this.importCustomConfiguration()
      case "select":
        return await this.selectSavedPreset()
      default:
        return await this.getSavedConfiguration()
    }
  }

  /* !!! Створення користувацької конфігурації !!! */
  async createCustomConfiguration() {
    const customConfig = {
      includeGlobal: await this.askBoolean("Включити глобальні стилі?", true),
      includeReset: await this.askBoolean("Включити CSS reset?", true),
      includeComments: await this.askBoolean("Включити коментарі?", true),
      optimizeCSS: await this.askBoolean("Оптимізувати CSS?", true),
      saveFigmaStyles: await this.askBoolean("Зберігати Figma стилі?", false),
      responsive: await this.askBoolean("Адаптивний дизайн?", true),
      darkMode: await this.askBoolean("Підтримка темної теми?", true),
      cssVariables: await this.askBoolean("Використовувати CSS змінні?", true),
      minify: await this.askBoolean("Мінімізувати CSS?", false)
    }

    const saveName = await vscode.window.showInputBox({
      prompt: "Введіть назву для збереження конфігурації (опціонально)",
      placeHolder: "Моя конфігурація"
    })

    if (saveName) {
      await this.savePreset(saveName, customConfig)
    }

    return customConfig
  }

  /* !!! Вибір збереженого пресету !!! */
  async selectSavedPreset() {
    const userPresets = await this.configLoader.loadUserPresets()
    const presetNames = Object.keys(userPresets)
    
    if (presetNames.length === 0) {
      vscode.window.showInformationMessage("Немає збережених пресетів")
      return await this.getSavedConfiguration()
    }

    const options = presetNames.map(name => ({
      label: name,
      description: userPresets[name].savedAt ? `Збережено: ${this.formatSafeDate(userPresets[name].savedAt)}` : "",
      preset: userPresets[name]
    }))

    const selected = await vscode.window.showQuickPick(options, {
      placeHolder: "Виберіть збережений пресет",
      ignoreFocusOut: true
    })

    return selected ? selected.preset : this.getSavedConfiguration()
  }

  /* !!! Імпорт користувацької конфігурації !!! */
  async importCustomConfiguration() {
    const fileUri = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      filters: {
        'JSON files': ['json']
      }
    })

    if (fileUri && fileUri[0]) {
      try {
        const fs = require('fs').promises
        const content = await fs.readFile(fileUri[0].fsPath, 'utf8')
        const config = JSON.parse(content)
        
        vscode.window.showInformationMessage("Конфігурацію успішно імпортовано!")
        return config
      } catch (error) {
        vscode.window.showErrorMessage(`Помилка імпорту: ${error.message}`)
      }
    }
    
    return this.getSavedConfiguration()
  }

  /* !!! Допоміжний метод для запитання булевих значень !!! */
  async askBoolean(question, defaultValue) {
    const options = [
      { label: "Так", value: true },
      { label: "Ні", value: false }
    ]

    const selected = await vscode.window.showQuickPick(options, {
      placeHolder: question,
      ignoreFocusOut: true
    })

    return selected ? selected.value : defaultValue
  }

  /* !!! Збереження поточної конфігурації як пресет !!! */
  async savePreset(name, configuration) {
    const success = await this.configLoader.saveUserPreset(name, configuration)
    
    if (success) {
      vscode.window.showInformationMessage(`Пресет "${name}" збережено успішно!`)
    } else {
      vscode.window.showErrorMessage(`Помилка збереження пресету "${name}"`)
    }
  }

  /* !!! Завантаження пресету !!! */
  async loadPreset(name) {
    const userPresets = await this.configLoader.loadUserPresets()
    const preset = userPresets[name]
    
    if (!preset) {
      vscode.window.showErrorMessage(`Пресет "${name}" не знайдено!`)
      return null
    }

    return preset
  }

  /* !!! Отримання списку доступних пресетів !!! */
  async getAvailablePresets() {
    const userPresets = await this.configLoader.loadUserPresets()
    return Object.keys(userPresets).map(name => ({
      label: name,
      description: userPresets[name].savedAt ? `Збережено: ${this.formatSafeDate(userPresets[name].savedAt)}` : "",
      preset: userPresets[name]
    }))
  }

  /* !!! Видалення пресету !!! */
  async deletePreset(name) {
    const success = await this.configLoader.deleteUserPreset(name)
    
    if (success) {
      vscode.window.showInformationMessage(`Пресет "${name}" видалено!`)
    } else {
      vscode.window.showErrorMessage(`Пресет "${name}" не знайдено!`)
    }
    
    return success
  }

  /* !!! Показ діалогу вибору пресету !!! */
  async showPresetSelector() {
    const userPresets = await this.configLoader.loadUserPresets()
    const presetNames = Object.keys(userPresets)
    
    const options = [
      { label: "$(gear) Створити новий пресет", description: "Зберегти поточну конфігурацію", action: "create" }
    ]
    
    if (presetNames.length > 0) {
      options.push({ label: "$(trash) Видалити пресет", description: "Видалити існуючий пресет", action: "delete" })
      
      options.push(...presetNames.map(name => ({
        label: name,
        description: userPresets[name].savedAt ? `Збережено: ${this.formatSafeDate(userPresets[name].savedAt)}` : "",
        preset: userPresets[name],
        action: "load"
      })))
    } else {
      vscode.window.showInformationMessage("Немає збережених користувацьких пресетів")
    }

    const selected = await vscode.window.showQuickPick(options, {
      placeHolder: "Виберіть дію з пресетами",
      ignoreFocusOut: true
    })

    return selected || { action: "cancel" }
  }

  /* !!! Автоматичне збереження конфігурації !!! */
  async autoSaveConfiguration(configuration) {
    const autoSave = this.config.get("autoSaveConfiguration", true)
    
    if (autoSave) {
      // Використовуємо ConfigLoader замість VS Code API
      await this.configLoader.saveLastSettings(configuration)
    }
  }

  /* !!! Отримання збереженої конфігурації !!! */
  async getSavedConfiguration() {
    // Використовуємо ConfigLoader замість VS Code API
    const lastSettings = await this.configLoader.loadLastSettings()
    return lastSettings || {}
  }

  /* !!! Скидання конфігурації до значень за замовчуванням !!! */
  async resetToDefaults() {
    const defaultConfig = {
      includeGlobal: true,
      includeReset: true,
      responsive: true,
      darkMode: true,
      saveFigmaStyles: true,
      optimizeCSS: true,
      removeRedundant: true,
      optimizeShorthands: true,
      optimizeInheritance: true,
      removeEmptyRules: true,
      colorFormat: "hex",
      cssVariables: true,
      includeComments: true,
      sortProperties: true,
      commentStyle: "author"
    }

    // Використовуємо ConfigLoader замість VS Code API
    await this.configLoader.saveLastSettings(defaultConfig)
    vscode.window.showInformationMessage("Конфігурацію скинуто до значень за замовчуванням")
    return defaultConfig
  }

  /* !!! Експорт конфігурації в JSON !!! */
  async exportConfiguration() {
    const lastSettings = await this.configLoader.loadLastSettings()
    const userPresets = await this.configLoader.loadUserPresets()
    
    const exportData = {
      version: "0.0.6",
      exportedAt: new Date().toISOString(),
      lastConfiguration: lastSettings || {},
      userPresets: userPresets
    }

    const jsonString = JSON.stringify(exportData, null, 2)
    
    const doc = await vscode.workspace.openTextDocument({
      content: jsonString,
      language: "json"
    })
    
    await vscode.window.showTextDocument(doc)
    vscode.window.showInformationMessage("Конфігурацію експортовано в новий документ")
  }

  /* !!! Імпорт конфігурації з JSON !!! */
  async importConfiguration(jsonString) {
    try {
      const importData = JSON.parse(jsonString)
      
      if (importData.lastConfiguration) {
        await this.configLoader.saveLastSettings(importData.lastConfiguration)
      }
      
      if (importData.userPresets) {
        for (const [name, preset] of Object.entries(importData.userPresets)) {
          await this.configLoader.saveUserPreset(name, preset)
        }
      }
      
      // Підтримка старого формату
      if (importData.currentConfiguration) {
        await this.configLoader.saveLastSettings(importData.currentConfiguration)
      }
      
      if (importData.presets) {
        for (const [name, preset] of Object.entries(importData.presets)) {
          await this.configLoader.saveUserPreset(name, preset)
        }
      }
      
      vscode.window.showInformationMessage("Конфігурацію імпортовано успішно!")
      return true
    } catch (error) {
      vscode.window.showErrorMessage(`Помилка імпорту конфігурації: ${error.message}`)
      return false
    }
  }

  /* !!! Метод для безпечного форматування дати !!! */
  formatSafeDate(dateString) {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch (error) {
      return 'Невірна дата'
    }
  }

  /* !!! Отримання деталей пресету для відображення !!! */
  getPresetDetails(settings) {
    const features = []
    
    if (settings.includeGlobal) features.push('Global')
    if (settings.includeReset) features.push('Reset')
    if (settings.responsive) features.push('Responsive')
    if (settings.darkMode) features.push('Dark Mode')
    if (settings.saveFigmaStyles) features.push('Figma')
    if (settings.optimizeCSS) features.push('Optimized')
    if (settings.minify) features.push('Minified')
    if (settings.minimal) features.push('Minimal')
    
    return features.join(', ') || 'Basic'
  }

  /* !!! Отримання останніх використаних налаштувань !!! */
  async getLastUsedSettings() {
    if (this.lastUsedSettings) {
      return this.lastUsedSettings
    }
    
    return await this.configLoader.loadLastSettings()
  }

  /* !!! Очищення кешу останніх налаштувань !!! */
  clearLastUsedSettings() {
    this.lastUsedSettings = null
  }

  /* !!! Ініціалізація та очищення застарілих налаштувань !!! */
  async initialize() {
    await this.configLoader.cleanupOldSettings()
  }
}

module.exports = ConfigurationManager