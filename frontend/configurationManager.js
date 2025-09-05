/* frontend/configurationManager.js
   Уніфікований менеджер конфігурацій для основного меню
*/
const fs = require("fs")
const path = require("path")
import * as vscode from "vscode"

class ConfigurationManager {
  constructor() {
    this.configPath = this.getConfigPath()
  }

  /**
   * Отримує шлях до файлу конфігурації
   */
  getConfigPath() {
    const workspaceFolders = vscode.workspace.workspaceFolders
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return path.join(process.cwd(), ".vscode", "css-classes-config.json")
    }

    return path.join(workspaceFolders[0].uri.fsPath, ".vscode", "css-classes-config.json")
  }

  /**
   * Створює директорію конфігурації
   */
  ensureConfigDir() {
    const dir = path.dirname(this.configPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {recursive: true})
    }
  }

  /**
   * Зберігає конфігурацію
   */
  saveConfig(config) {
    try {
      this.ensureConfigDir()
      const dataToSave = {
        ...config,
        savedAt: new Date().toISOString(),
        version: "3.0.0"
      }

      fs.writeFileSync(this.configPath, JSON.stringify(dataToSave, null, 2), "utf8")
      return true
    } catch (error) {
      console.error("Помилка збереження конфігурації:", error.message)
      return false
    }
  }

  /**
   * Завантажує конфігурацію
   */
  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const raw = fs.readFileSync(this.configPath, "utf8")
        const config = JSON.parse(raw)

        // Перевіряємо версію конфігурації
        if (config.version && config.version === "3.0.0") {
          return config
        } else {
          console.warn("Застаріла версія конфігурації")
          return this.migrateConfig(config)
        }
      }
      return null
    } catch (error) {
      console.error("Помилка завантаження конфігурації:", error.message)
      return null
    }
  }

  /**
   * Мігрує застарілу конфігурацію
   */
  migrateConfig(oldConfig) {
    // Конвертуємо старі формати в новий
    const newConfig = {
      mode: oldConfig.mode || "maximum",
      figmaLink: oldConfig.figmaLink || "",
      figmaToken: oldConfig.figmaToken || "",
      selectedCanvas: oldConfig.selectedCanvas || [],
      selectedLayers: oldConfig.selectedLayers || [],
      version: "3.0.0",
      savedAt: new Date().toISOString()
    }

    // Зберігаємо мігровану конфігурацію
    this.saveConfig(newConfig)
    return newConfig
  }

  /**
   * Очищає конфігурацію
   */
  clearConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        fs.unlinkSync(this.configPath)
        return true
      }
      return false
    } catch (error) {
      console.error("Помилка очищення конфігурації:", error.message)
      return false
    }
  }

  /**
   * Отримує налаштування VS Code
   */
  getVSCodeConfig() {
    const config = vscode.workspace.getConfiguration("css-classes")
    return {
      figmaToken: config.get("figmaToken") || "",
      lastFigmaLink: config.get("lastFigmaLink") || "",
      lastSelectedCanvases: config.get("lastSelectedCanvases") || [],
      lastSelectedLayers: config.get("lastSelectedLayers") || [],
      mode: config.get("mode") || "maximum"
    }
  }

  /**
   * Зберігає налаштування VS Code
   */
  async saveVSCodeConfig(config) {
    try {
      await vscode.workspace
        .getConfiguration("css-classes")
        .update("figmaToken", config.figmaToken, true)
      await vscode.workspace
        .getConfiguration("css-classes")
        .update("lastFigmaLink", config.figmaLink, true)
      await vscode.workspace
        .getConfiguration("css-classes")
        .update("lastSelectedCanvases", config.selectedCanvas, true)
      await vscode.workspace
        .getConfiguration("css-classes")
        .update("lastSelectedLayers", config.selectedLayers, true)
      await vscode.workspace.getConfiguration("css-classes").update("mode", config.mode, true)
      return true
    } catch (error) {
      console.error("Помилка збереження налаштувань VS Code:", error.message)
      return false
    }
  }
}

// Експортуємо як singleton
const configManager = new ConfigurationManager()
module.exports = configManager
