/* !!! Модуль першого налаштування розширення !!! */
const vscode = require("vscode")

class FirstTimeSetup {
  constructor() {
    this.config = vscode.workspace.getConfiguration("cssclasssfromhtml")
  }

  async showFirstTimeDialog() {
    const isFirstTime = !this.config.get("hasShownFirstTimeSetup", false)
    const forceShow = this.config.get("forceFirstTimeSetup", false)
    
    if (!isFirstTime && !forceShow) {
      return null
    }
    
    // Скидаємо примусовий показ після використання
    if (forceShow) {
      await this.config.update("forceFirstTimeSetup", false, vscode.ConfigurationTarget.Global)
    }

    const options = [
      {
        label: "$(symbol-class) Мінімальне",
        description: "Експорт класів з пустими оголошеннями",
        detail: "Швидкий старт без додаткових налаштувань",
        preset: "minimal"
      },
      {
        label: "$(gear) Стандартне", 
        description: "Всі налаштування без Figma інтеграції",
        detail: "Повна функціональність для локальної розробки",
        preset: "standard"
      },
      {
        label: "$(rocket) Максимальне",
        description: "Всі можливості включно з Figma",
        detail: "Повна інтеграція з дизайн-системою",
        preset: "maximum"
      },
      {
        label: "$(package) Продакшн",
        description: "Мінімізований CSS для продакшну",
        detail: "Оптимізований вивід без коментарів",
        preset: "production"
      },
      {
        label: "$(settings-gear) Налаштування користувача",
        description: "Власна конфігурація",
        detail: "Створити або завантажити власні налаштування",
        preset: "custom"
      }
    ]

    const selected = await vscode.window.showQuickPick(options, {
      placeHolder: "Виберіть початкове налаштування CSS Classes from HTML",
      ignoreFocusOut: true,
      title: "🎉 Ласкаво просимо до CSS Classes from HTML!"
    })

    if (selected) {
      await this.applyPreset(selected.preset)
      await this.config.update("hasShownFirstTimeSetup", true, vscode.ConfigurationTarget.Global)
      
      // Зберігаємо вибраний пресет для наступних дій
      const savePreset = this.config.get("savePresetConfiguration", true)
      if (savePreset) {
        await this.config.update("lastSelectedPreset", selected.preset, vscode.ConfigurationTarget.Global)
      }
      
      vscode.window.showInformationMessage(
        `✅ Налаштування "${selected.label}" застосовано! Використовуйте Ctrl+Shift+H для генерації CSS.`
      )
    }

    return selected?.preset || null
  }

  async applyPreset(preset) {
    const presets = {
      minimal: {
        includeGlobal: false,
        includeReset: false,
        includeComments: true,
        commentStyle: "author",
        optimizeCSS: false,
        saveFigmaStyles: false,
        responsive: false,
        darkMode: false,
        cssVariables: false,
        minify: false,
        skipFigmaInput: true,
        minimal: true,
        showConfigurationDialog: false
      },
      standard: {
        includeGlobal: true,
        includeReset: true,
        includeComments: true,
        commentStyle: "author",
        optimizeCSS: true,
        saveFigmaStyles: false,
        responsive: true,
        darkMode: true,
        cssVariables: true,
        minify: false,
        skipFigmaInput: true,
        minimal: false,
        showConfigurationDialog: false
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
        enableInspection: true,
        skipFigmaInput: false,
        minimal: false,
        showConfigurationDialog: false
      },
      production: {
        includeGlobal: true,
        includeReset: true,
        includeComments: false,
        commentStyle: "standard",
        optimizeCSS: true,
        saveFigmaStyles: true,
        responsive: true,
        darkMode: false,
        cssVariables: false,
        minify: true,
        removeRedundant: true,
        removeEmptyRules: true,
        enableInspection: true,
        skipFigmaInput: false,
        minimal: false,
        showConfigurationDialog: false
      }
    }

    if (preset === 'custom') {
      return await this.handleCustomConfiguration()
    }

    const config = presets[preset]
    if (config) {
      for (const [key, value] of Object.entries(config)) {
        await this.config.update(key, value, vscode.ConfigurationTarget.Global)
      }
    }
  }

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

    if (!selected) return

    switch (selected.action) {
      case "create":
        return await this.createCustomConfiguration()
      case "import":
        return await this.importCustomConfiguration()
      case "select":
        return await this.selectSavedPreset()
    }
  }

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
      const presets = this.config.get("configurationPresets", {})
      presets[saveName] = customConfig
      await this.config.update("configurationPresets", presets, vscode.ConfigurationTarget.Global)
    }

    for (const [key, value] of Object.entries(customConfig)) {
      await this.config.update(key, value, vscode.ConfigurationTarget.Global)
    }

    return customConfig
  }

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
        
        for (const [key, value] of Object.entries(config)) {
          await this.config.update(key, value, vscode.ConfigurationTarget.Global)
        }
        
        vscode.window.showInformationMessage("Конфігурацію успішно імпортовано!")
        return config
      } catch (error) {
        vscode.window.showErrorMessage(`Помилка імпорту: ${error.message}`)
      }
    }
  }

  async selectSavedPreset() {
    const presets = this.config.get("configurationPresets", {})
    const presetNames = Object.keys(presets)
    
    if (presetNames.length === 0) {
      vscode.window.showInformationMessage("Немає збережених пресетів")
      return
    }

    const options = presetNames.map(name => ({
      label: name,
      description: presets[name].savedAt ? `Збережено: ${new Date(presets[name].savedAt).toLocaleDateString()}` : "",
      preset: presets[name]
    }))

    const selected = await vscode.window.showQuickPick(options, {
      placeHolder: "Виберіть збережений пресет",
      ignoreFocusOut: true
    })

    if (selected) {
      for (const [key, value] of Object.entries(selected.preset)) {
        await this.config.update(key, value, vscode.ConfigurationTarget.Global)
      }
      return selected.preset
    }
  }

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

  // Метод для застосування збереженого пресету
  async applyLastPreset() {
    const lastPreset = this.config.get("lastSelectedPreset", null)
    const savePreset = this.config.get("savePresetConfiguration", true)
    
    if (lastPreset && savePreset) {
      await this.applyPreset(lastPreset)
      return lastPreset
    }
    
    return null
  }

  // Метод для примусового показу діалогу
  async forceShowDialog() {
    await this.config.update("forceFirstTimeSetup", true, vscode.ConfigurationTarget.Global)
    return await this.showFirstTimeDialog()
  }
}

module.exports = FirstTimeSetup