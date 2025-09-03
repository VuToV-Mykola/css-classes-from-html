/* !!! Модуль завантаження конфігурацій з файлів !!! */
const fs = require('fs').promises
const path = require('path')
const vscode = require('vscode')

class ConfigLoader {
  constructor() {
    this.configPath = path.join(__dirname, '..', 'config')
    this.userConfigPath = this.getUserConfigPath()
  }

  /* !!! Отримання шляху до користувацьких конфігурацій !!! */
  getUserConfigPath() {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
    return workspaceFolder ? path.join(workspaceFolder, '.vscode', 'css-classes-config') : null
  }

  /* !!! Завантаження пресетів з файлу !!! */
  async loadPresets() {
    try {
      const presetsPath = path.join(this.configPath, 'presets.json')
      const content = await fs.readFile(presetsPath, 'utf8')
      return JSON.parse(content)
    } catch (error) {
      console.warn('Помилка завантаження пресетів:', error.message)
      return {}
    }
  }

  /* !!! Завантаження налаштувань за замовчуванням !!! */
  async loadDefaults() {
    try {
      const defaultsPath = path.join(this.configPath, 'defaults.json')
      const content = await fs.readFile(defaultsPath, 'utf8')
      return JSON.parse(content)
    } catch (error) {
      console.warn('Помилка завантаження налаштувань за замовчуванням:', error.message)
      return {}
    }
  }

  /* !!! Завантаження схеми валідації !!! */
  async loadSchema() {
    try {
      const schemaPath = path.join(this.configPath, 'schema.json')
      const content = await fs.readFile(schemaPath, 'utf8')
      return JSON.parse(content)
    } catch (error) {
      console.warn('Помилка завантаження схеми:', error.message)
      return null
    }
  }

  /* !!! Збереження останніх налаштувань користувача !!! */
  async saveLastSettings(settings) {
    if (!this.userConfigPath) return false

    try {
      await fs.mkdir(this.userConfigPath, { recursive: true })
      const settingsPath = path.join(this.userConfigPath, 'last-settings.json')
      
      const dataToSave = {
        ...settings,
        savedAt: new Date().toISOString(),
        version: "0.0.6"
      }
      
      await fs.writeFile(settingsPath, JSON.stringify(dataToSave, null, 2), 'utf8')
      return true
    } catch (error) {
      console.warn('Помилка збереження останніх налаштувань:', error.message)
      return false
    }
  }

  /* !!! Завантаження останніх налаштувань користувача !!! */
  async loadLastSettings() {
    if (!this.userConfigPath) return null

    try {
      const settingsPath = path.join(this.userConfigPath, 'last-settings.json')
      const content = await fs.readFile(settingsPath, 'utf8')
      const data = JSON.parse(content)
      
      // Перевіряємо версію для сумісності
      if (data.version && data.version !== "0.0.6") {
        console.warn('Несумісна версія налаштувань, використовуємо за замовчуванням')
        return null
      }
      
      return data
    } catch (error) {
      // Файл не існує або пошкоджений - це нормально
      return null
    }
  }

  /* !!! Збереження користувацького пресету !!! */
  async saveUserPreset(name, settings) {
    if (!this.userConfigPath) return false

    try {
      await fs.mkdir(this.userConfigPath, { recursive: true })
      const presetsPath = path.join(this.userConfigPath, 'user-presets.json')
      
      let userPresets = {}
      try {
        const content = await fs.readFile(presetsPath, 'utf8')
        userPresets = JSON.parse(content)
      } catch (error) {
        // Файл не існує - створюємо новий
      }
      
      userPresets[name] = {
        ...settings,
        savedAt: new Date().toISOString(),
        version: "0.0.6"
      }
      
      await fs.writeFile(presetsPath, JSON.stringify(userPresets, null, 2), 'utf8')
      return true
    } catch (error) {
      console.warn('Помилка збереження користувацького пресету:', error.message)
      return false
    }
  }

  /* !!! Завантаження користувацьких пресетів !!! */
  async loadUserPresets() {
    if (!this.userConfigPath) return {}

    try {
      const presetsPath = path.join(this.userConfigPath, 'user-presets.json')
      const content = await fs.readFile(presetsPath, 'utf8')
      return JSON.parse(content)
    } catch (error) {
      return {}
    }
  }

  /* !!! Видалення користувацького пресету !!! */
  async deleteUserPreset(name) {
    if (!this.userConfigPath) return false

    try {
      const presetsPath = path.join(this.userConfigPath, 'user-presets.json')
      const content = await fs.readFile(presetsPath, 'utf8')
      const userPresets = JSON.parse(content)
      
      if (userPresets[name]) {
        delete userPresets[name]
        await fs.writeFile(presetsPath, JSON.stringify(userPresets, null, 2), 'utf8')
        return true
      }
      
      return false
    } catch (error) {
      console.warn('Помилка видалення користувацького пресету:', error.message)
      return false
    }
  }

  /* !!! Валідація конфігурації за схемою !!! */
  async validateConfig(config) {
    const schema = await this.loadSchema()
    if (!schema) return { valid: true, errors: [] }

    const errors = []
    
    // Базова валідація типів
    for (const [key, value] of Object.entries(config)) {
      const schemaProperty = schema.properties[key]
      if (!schemaProperty) continue

      if (schemaProperty.type === 'boolean' && typeof value !== 'boolean') {
        errors.push(`${key} має бути булевим значенням`)
      }
      
      if (schemaProperty.type === 'string' && typeof value !== 'string') {
        errors.push(`${key} має бути рядком`)
      }
      
      if (schemaProperty.type === 'number' && typeof value !== 'number') {
        errors.push(`${key} має бути числом`)
      }
      
      if (schemaProperty.enum && !schemaProperty.enum.includes(value)) {
        errors.push(`${key} має бути одним з: ${schemaProperty.enum.join(', ')}`)
      }
      
      if (schemaProperty.minimum && value < schemaProperty.minimum) {
        errors.push(`${key} має бути не менше ${schemaProperty.minimum}`)
      }
      
      if (schemaProperty.maximum && value > schemaProperty.maximum) {
        errors.push(`${key} має бути не більше ${schemaProperty.maximum}`)
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /* !!! Експорт конфігурації в файл !!! */
  async exportConfig(config, filePath) {
    try {
      const exportData = {
        version: "0.0.6",
        exportedAt: new Date().toISOString(),
        configuration: config
      }
      
      await fs.writeFile(filePath, JSON.stringify(exportData, null, 2), 'utf8')
      return true
    } catch (error) {
      console.warn('Помилка експорту конфігурації:', error.message)
      return false
    }
  }

  /* !!! Імпорт конфігурації з файлу !!! */
  async importConfig(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8')
      const data = JSON.parse(content)
      
      if (data.configuration) {
        const validation = await this.validateConfig(data.configuration)
        if (!validation.valid) {
          throw new Error(`Невалідна конфігурація: ${validation.errors.join(', ')}`)
        }
        
        return data.configuration
      }
      
      // Якщо це просто конфігурація без обгортки
      const validation = await this.validateConfig(data)
      if (!validation.valid) {
        throw new Error(`Невалідна конфігурація: ${validation.errors.join(', ')}`)
      }
      
      return data
    } catch (error) {
      console.warn('Помилка імпорту конфігурації:', error.message)
      throw error
    }
  }

  /* !!! Очищення застарілих налаштувань !!! */
  async cleanupOldSettings() {
    if (!this.userConfigPath) return

    try {
      const settingsPath = path.join(this.userConfigPath, 'last-settings.json')
      const presetsPath = path.join(this.userConfigPath, 'user-presets.json')
      
      // Перевіряємо та очищуємо останні налаштування
      try {
        const content = await fs.readFile(settingsPath, 'utf8')
        const data = JSON.parse(content)
        
        if (!data.version || data.version !== "0.0.6") {
          await fs.unlink(settingsPath)
          console.log('Видалено застарілі налаштування')
        }
      } catch (error) {
        // Файл не існує - це нормально
      }
      
      // Перевіряємо та очищуємо користувацькі пресети
      try {
        const content = await fs.readFile(presetsPath, 'utf8')
        const presets = JSON.parse(content)
        let hasChanges = false
        
        for (const [name, preset] of Object.entries(presets)) {
          if (!preset.version || preset.version !== "0.0.6") {
            delete presets[name]
            hasChanges = true
          }
        }
        
        if (hasChanges) {
          await fs.writeFile(presetsPath, JSON.stringify(presets, null, 2), 'utf8')
          console.log('Очищено застарілі користувацькі пресети')
        }
      } catch (error) {
        // Файл не існує - це нормально
      }
    } catch (error) {
      console.warn('Помилка очищення застарілих налаштувань:', error.message)
    }
  }
}

module.exports = ConfigLoader