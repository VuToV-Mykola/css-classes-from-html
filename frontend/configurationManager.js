/**
 * Configuration Manager з 3 режимами роботи
 * @version 2.1.0
 */

class ConfigurationManager {
  constructor() {
    this.configLoader = new (require('./configLoader'))();
    this.lastUsedSettings = null;
    this.lastSelectedMode = null;
    this.lastSelectedCanvas = [];
    this.lastSelectedLayers = [];
  }

  /**
   * Показ діалогу конфігурації - 3 режими
   */
  async showConfigurationDialog() {
    const lastSettings = await this.configLoader.loadLastSettings();
    
    const options = [
      {
        label: "⚡ Мінімальне налаштування",
        description: "Тільки парсинг HTML та генерація порожніх класів",
        detail: "Швидкий старт • Без Figma • Без оптимізацій",
        mode: "minimal",
        icon: "⚡"
      },
      {
        label: "🚀 Максимальне налаштування", 
        description: "Повна інтеграція з Figma та всі можливості",
        detail: "Figma інтеграція • Canvas/Layers • ML matching • Всі оптимізації",
        mode: "maximum",
        icon: "🚀"
      },
      {
        label: "📦 Продакт",
        description: "Оптимізований CSS для production",
        detail: "Мінімізація • Без коментарів • Canvas/Layers • Production-ready",
        mode: "production",
        icon: "📦"
      }
    ];

    // Відмічаємо останній вибір
    if (lastSettings?.mode) {
      options.forEach(opt => {
        if (opt.mode === lastSettings.mode) {
          opt.label += " ⭐";
          opt.description += " (останній вибір)";
        }
      });
    }

    return options;
  }

  /**
   * Вибір Canvas та Layers
   */
  async selectCanvasAndLayers(figmaLink) {
    const canvasOptions = [
      { label: "🎨 Desktop", value: "desktop", picked: this.lastSelectedCanvas.includes("desktop") },
      { label: "📱 Mobile", value: "mobile", picked: this.lastSelectedCanvas.includes("mobile") },
      { label: "📋 Tablet", value: "tablet", picked: this.lastSelectedCanvas.includes("tablet") },
      { label: "🧩 Components", value: "components", picked: this.lastSelectedCanvas.includes("components") },
      { label: "🎯 All Canvas", value: "all", picked: this.lastSelectedCanvas.includes("all") }
    ];

    const layerOptions = [
      { label: "📐 Layout", value: "layout", picked: this.lastSelectedLayers.includes("layout") },
      { label: "🎨 Styles", value: "styles", picked: this.lastSelectedLayers.includes("styles") },
      { label: "🔤 Typography", value: "typography", picked: this.lastSelectedLayers.includes("typography") },
      { label: "🖼️ Images", value: "images", picked: this.lastSelectedLayers.includes("images") },
      { label: "🔘 Components", value: "components", picked: this.lastSelectedLayers.includes("components") },
      { label: "✨ Effects", value: "effects", picked: this.lastSelectedLayers.includes("effects") },
      { label: "📦 All Layers", value: "all", picked: this.lastSelectedLayers.includes("all") }
    ];

    return {
      canvasOptions,
      layerOptions
    };
  }

  /**
   * Застосування режиму
   */
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
    };

    const config = configs[mode] || configs.minimal;
    
    console.log(`✅ Режим "${mode}" активовано!`);
    
    return config;
  }

  /**
   * Завантаження останніх налаштувань
   */
  async loadLastSettings() {
    const saved = await this.configLoader.loadLastSettings();
    
    if (saved) {
      this.lastSelectedMode = saved.mode;
      this.lastSelectedCanvas = saved.selectedCanvas || [];
      this.lastSelectedLayers = saved.selectedLayers || [];
      
      console.log(`📂 Відновлено останні налаштування: ${saved.mode} режим`);
    }
    
    return saved;
  }

  /**
   * Збереження налаштувань
   */
  async saveSettings(settings) {
    settings.mode = this.lastSelectedMode;
    settings.selectedCanvas = this.lastSelectedCanvas;
    settings.selectedLayers = this.lastSelectedLayers;
    settings.timestamp = new Date().toISOString();
    
    await this.configLoader.saveLastSettings(settings);
    this.lastUsedSettings = settings;
    
    return settings;
  }
}

module.exports = ConfigurationManager;
