/**
 * Config Loader - завантаження та збереження налаштувань
 */

const fs = require('fs').promises;
const path = require('path');

class ConfigLoader {
  constructor() {
    this.configPath = path.join(__dirname, '..', 'config');
    this.userConfigPath = path.join(__dirname, '..', '.vscode', 'css-classes-config');
  }

  /**
   * Створення директорії конфігурацій
   */
  async ensureConfigDir() {
    try {
      await fs.mkdir(this.userConfigPath, { recursive: true });
      await fs.mkdir(this.configPath, { recursive: true });
    } catch (error) {
      console.warn('Помилка створення директорії:', error.message);
    }
  }

  /**
   * Збереження останніх налаштувань
   */
  async saveLastSettings(settings) {
    await this.ensureConfigDir();

    try {
      const settingsPath = path.join(this.userConfigPath, 'last-settings.json');
      
      const dataToSave = {
        ...settings,
        savedAt: new Date().toISOString(),
        version: "2.1.0"
      };
      
      await fs.writeFile(settingsPath, JSON.stringify(dataToSave, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.warn('Помилка збереження налаштувань:', error.message);
      return false;
    }
  }

  /**
   * Завантаження останніх налаштувань
   */
  async loadLastSettings() {
    try {
      const settingsPath = path.join(this.userConfigPath, 'last-settings.json');
      const content = await fs.readFile(settingsPath, 'utf8');
      const data = JSON.parse(content);
      
      if (data.version && data.version !== "2.1.0") {
        console.warn('Несумісна версія налаштувань');
        return null;
      }
      
      return data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Збереження користувацького пресету
   */
  async saveUserPreset(name, settings) {
    await this.ensureConfigDir();

    try {
      const presetsPath = path.join(this.userConfigPath, 'user-presets.json');
      
      let userPresets = {};
      try {
        const content = await fs.readFile(presetsPath, 'utf8');
        userPresets = JSON.parse(content);
      } catch (error) {
        // Файл не існує
      }
      
      userPresets[name] = {
        ...settings,
        savedAt: new Date().toISOString(),
        version: "2.1.0"
      };
      
      await fs.writeFile(presetsPath, JSON.stringify(userPresets, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.warn('Помилка збереження пресету:', error.message);
      return false;
    }
  }

  /**
   * Завантаження користувацьких пресетів
   */
  async loadUserPresets() {
    try {
      const presetsPath = path.join(this.userConfigPath, 'user-presets.json');
      const content = await fs.readFile(presetsPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      return {};
    }
  }

  /**
   * Очищення застарілих налаштувань
   */
  async cleanupOldSettings() {
    try {
      const settingsPath = path.join(this.userConfigPath, 'last-settings.json');
      await fs.unlink(settingsPath);
      console.log('🗑️ Налаштування очищено');
    } catch (error) {
      // Файл не існує
    }
  }
}

module.exports = ConfigLoader;
