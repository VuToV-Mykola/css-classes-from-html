/* !!! Модуль управління конфігурацією та пресетами !!! */
const vscode = require("vscode")

class ConfigurationManager {
  constructor() {
    this.config = vscode.workspace.getConfiguration("cssclasssfromhtml")
  }

  /* !!! Збереження поточної конфігурації як пресет !!! */
  async savePreset(name, configuration) {
    const presets = this.config.get("configurationPresets", {})
    presets[name] = {
      ...configuration,
      savedAt: new Date().toISOString(),
      version: "0.0.6"
    }
    
    await this.config.update("configurationPresets", presets, vscode.ConfigurationTarget.Global)
    vscode.window.showInformationMessage(`Пресет "${name}" збережено успішно!`)
  }

  /* !!! Завантаження пресету !!! */
  async loadPreset(name) {
    const presets = this.config.get("configurationPresets", {})
    const preset = presets[name]
    
    if (!preset) {
      vscode.window.showErrorMessage(`Пресет "${name}" не знайдено!`)
      return null
    }

    return preset
  }

  /* !!! Отримання списку доступних пресетів !!! */
  getAvailablePresets() {
    const presets = this.config.get("configurationPresets", {})
    return Object.keys(presets).map(name => ({
      label: name,
      description: presets[name].savedAt ? `Збережено: ${this.formatSafeDate(presets[name].savedAt)}` : "",
      preset: presets[name]
    }))
  }

  /* !!! Видалення пресету !!! */
  async deletePreset(name) {
    const presets = this.config.get("configurationPresets", {})
    
    if (!presets[name]) {
      vscode.window.showErrorMessage(`Пресет "${name}" не знайдено!`)
      return false
    }

    delete presets[name]
    await this.config.update("configurationPresets", presets, vscode.ConfigurationTarget.Global)
    vscode.window.showInformationMessage(`Пресет "${name}" видалено!`)
    return true
  }

  /* !!! Показ діалогу вибору пресету !!! */
  async showPresetSelector() {
    const presetsConfig = this.config.get("configurationPresets", {})
    const presetNames = Object.keys(presetsConfig)
    
    if (presetNames.length === 0) {
      vscode.window.showInformationMessage("Немає збережених пресетів")
      return null
    }

    const options = [
      { label: "$(gear) Створити новий пресет", description: "Зберегти поточну конфігурацію", action: "create" },
      { label: "$(trash) Видалити пресет", description: "Видалити існуючий пресет", action: "delete" },
      ...presetNames.map(name => ({
        label: name,
        description: presetsConfig[name].savedAt ? `Збережено: ${this.formatSafeDate(presetsConfig[name].savedAt)}` : "",
        preset: presetsConfig[name],
        action: "load"
      }))
    ]

    const selected = await vscode.window.showQuickPick(options, {
      placeHolder: "Виберіть дію з пресетами",
      ignoreFocusOut: true
    })

    return selected
  }

  /* !!! Автоматичне збереження конфігурації !!! */
  async autoSaveConfiguration(configuration) {
    const autoSave = this.config.get("autoSaveConfiguration", true)
    
    if (autoSave) {
      await this.config.update("savedConfiguration", configuration, vscode.ConfigurationTarget.Global)
    }
  }

  /* !!! Отримання збереженої конфігурації !!! */
  getSavedConfiguration() {
    return this.config.get("savedConfiguration", {})
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

    await this.config.update("savedConfiguration", defaultConfig, vscode.ConfigurationTarget.Global)
    vscode.window.showInformationMessage("Конфігурацію скинуто до значень за замовчуванням")
    return defaultConfig
  }

  /* !!! Експорт конфігурації в JSON !!! */
  async exportConfiguration() {
    const config = this.getSavedConfiguration()
    const presets = this.config.get("configurationPresets", {})
    
    const exportData = {
      version: "0.0.6",
      exportedAt: new Date().toISOString(),
      currentConfiguration: config,
      presets: presets
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
      
      if (importData.version && importData.currentConfiguration) {
        await this.config.update("savedConfiguration", importData.currentConfiguration, vscode.ConfigurationTarget.Global)
      }
      
      if (importData.presets) {
        const currentPresets = this.config.get("configurationPresets", {})
        const mergedPresets = { ...currentPresets, ...importData.presets }
        await this.config.update("configurationPresets", mergedPresets, vscode.ConfigurationTarget.Global)
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

  /* !!! Показ діалогу конфігурації !!! */
  async showConfigurationDialog() {
    const showDialog = this.config.get("showConfigurationDialog", false)
    
    if (!showDialog) {
      return this.getSavedConfiguration()
    }

    const options = [
      { label: "$(gear) Використати збережену конфігурацію", action: "saved" },
      { label: "$(list-selection) Вибрати пресет", action: "preset" },
      { label: "$(settings) Налаштувати вручну", action: "manual" },
      { label: "$(refresh) Скинути до значень за замовчуванням", action: "reset" }
    ]

    const selected = await vscode.window.showQuickPick(options, {
      placeHolder: "Виберіть конфігурацію для генерації CSS",
      ignoreFocusOut: true
    })

    if (!selected) return null

    switch (selected.action) {
      case "saved":
        return this.getSavedConfiguration()
      
      case "preset":
        const presetAction = await this.showPresetSelector()
        if (presetAction && presetAction.action === "load") {
          return presetAction.preset
        }
        return null
      
      case "reset":
        return await this.resetToDefaults()
      
      case "manual":
        // Тут можна додати детальний діалог налаштувань
        return this.getSavedConfiguration()
      
      default:
        return null
    }
  }
}

module.exports = ConfigurationManager