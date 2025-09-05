/* frontend/configurationManager.js
 * Уніфікований менеджер конфігурацій для VS Code розширення
 * @version 3.0.0
 */

const fs = require("fs")
const path = require("path")

class ConfigurationManager {
  constructor() {
    this.configPath = null
    this.defaultConfig = {
      mode: "maximum",
      figmaLink: "",
      figmaToken: "",
      selectedCanvas: [],
      selectedLayers: [],
      includeGlobal: false,
      includeReset: true,
      includeComments: true,
      optimizeCSS: true,
      generateResponsive: true,
      savedAt: null,
      version: "3.0.0"
    }
  }

  /**
   * Ініціалізація конфігурації
   * @param {string} extensionPath - Шлях до розширення
   */
  initialize(extensionPath) {
    const configDir = path.join(extensionPath, ".vscode", "css-classes-config")
    this.configPath = path.join(configDir, "last-settings.json")

    // Створюємо директорію якщо не існує
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, {recursive: true})
    }
  }

  /**
   * Завантаження конфігурації
   * @returns {Object} Конфігурація
   */
  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const raw = fs.readFileSync(this.configPath, "utf8")
        const config = JSON.parse(raw)

        // Перевіряємо версію
        if (config.version === this.defaultConfig.version) {
          return {...this.defaultConfig, ...config}
        } else {
          // Міграція старої конфігурації
          return this.migrateConfig(config)
        }
      }

      return this.defaultConfig
    } catch (error) {
      console.error("Помилка завантаження конфігурації:", error.message)
      return this.defaultConfig
    }
  }

  /**
   * Збереження конфігурації
   * @param {Object} config - Конфігурація для збереження
   * @returns {boolean} Успішність операції
   */
  saveConfig(config) {
    try {
      const dataToSave = {
        ...this.defaultConfig,
        ...config,
        savedAt: new Date().toISOString(),
        version: this.defaultConfig.version
      }

      fs.writeFileSync(this.configPath, JSON.stringify(dataToSave, null, 2), "utf8")
      return true
    } catch (error) {
      console.error("Помилка збереження конфігурації:", error.message)
      return false
    }
  }

  /**
   * Очищення конфігурації
   * @returns {boolean} Успішність операції
   */
  clearConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        fs.unlinkSync(this.configPath)
      }
      return true
    } catch (error) {
      console.error("Помилка очищення конфігурації:", error.message)
      return false
    }
  }

  /**
   * Міграція старої конфігурації
   * @param {Object} oldConfig - Стара конфігурація
   * @returns {Object} Нова конфігурація
   */
  migrateConfig(oldConfig) {
    const newConfig = {...this.defaultConfig}

    // Копіюємо існуючі поля
    Object.keys(oldConfig).forEach(key => {
      if (key in newConfig) {
        newConfig[key] = oldConfig[key]
      }
    })

    // Зберігаємо мігровану конфігурацію
    this.saveConfig(newConfig)
    return newConfig
  }

  /**
   * Експорт конфігурації
   * @param {string} filePath - Шлях для експорту
   * @returns {boolean} Успішність операції
   */
  exportConfig(filePath) {
    try {
      const config = this.loadConfig()
      fs.writeFileSync(filePath, JSON.stringify(config, null, 2), "utf8")
      return true
    } catch (error) {
      console.error("Помилка експорту конфігурації:", error.message)
      return false
    }
  }

  /**
   * Імпорт конфігурації
   * @param {string} filePath - Шлях до файлу
   * @returns {boolean} Успішність операції
   */
  importConfig(filePath) {
    try {
      const raw = fs.readFileSync(filePath, "utf8")
      const config = JSON.parse(raw)
      return this.saveConfig(config)
    } catch (error) {
      console.error("Помилка імпорту конфігурації:", error.message)
      return false
    }
  }

  /**
   * Валідація конфігурації
   * @param {Object} config - Конфігурація для перевірки
   * @returns {Object} Результат валідації
   */
  validateConfig(config) {
    const errors = []
    const warnings = []

    // Перевірка обов'язкових полів
    if (!config.mode || !["minimal", "maximum", "production"].includes(config.mode)) {
      errors.push("Невірний режим генерації")
    }

    // Перевірка Figma налаштувань
    if (config.mode === "maximum" && !config.figmaLink) {
      warnings.push("Для максимального режиму рекомендується вказати Figma посилання")
    }

    // Перевірка версії
    if (config.version && config.version !== this.defaultConfig.version) {
      warnings.push("Конфігурація створена для іншої версії розширення")
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }
}

// Експорт як singleton
const configManager = new ConfigurationManager()
module.exports = configManager
