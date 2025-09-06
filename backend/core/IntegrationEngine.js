/**
 * Головний модуль інтеграції для CSS генерації з Figma та HTML
 * Координує роботу всіх компонентів системи
 * @version 3.0.0
 */

const FigmaAPIClient = require('./FigmaAPIClient');
const HTMLParser = require('./HTMLParser');
const StyleMatcher = require('../matchers/StyleMatcher');
const HierarchyMatcher = require('../matchers/HierarchyMatcher');
const CSSGenerator = require('../generators/CSSGenerator');
const FigmaAnalyzer = require('../analyzers/FigmaAnalyzer');

class IntegrationEngine {
  constructor(options = {}) {
    this.options = {
      figmaToken: options.figmaToken || '',
      confidenceThreshold: options.confidenceThreshold || 0.8,
      generateResponsive: options.generateResponsive !== false,
      generateModernCSS: options.generateModernCSS !== false,
      generateAnimations: options.generateAnimations !== false,
      optimizeCSS: options.optimizeCSS !== false,
      ...options
    };
    
    // Ініціалізація компонентів
    this.figmaClient = new FigmaAPIClient(this.options.figmaToken, {
      timeout: 15000,
      retryAttempts: 3
    });
    
    this.htmlParser = new HTMLParser();
    this.styleMatcher = new StyleMatcher({
      confidenceThreshold: this.options.confidenceThreshold,
      mlEnabled: true
    });
    
    this.hierarchyMatcher = new HierarchyMatcher({
      depthWeight: 0.3,
      positionWeight: 0.2,
      contentWeight: 0.25,
      semanticWeight: 0.25
    });
    
    this.cssGenerator = new CSSGenerator({
      includeReset: true,
      includeComments: true,
      optimizeCSS: this.options.optimizeCSS,
      generateResponsive: this.options.generateResponsive,
      generateModernCSS: this.options.generateModernCSS,
      generateAnimations: this.options.generateAnimations
    });
    
    this.figmaAnalyzer = new FigmaAnalyzer();
    
    // Статистика
    this.statistics = {
      processingTime: 0,
      totalElements: 0,
      matchedElements: 0,
      matchPercentage: 0,
      averageConfidence: 0,
      errors: []
    };
  }

  /**
   * Основний метод генерації CSS
   */
  async generateCSS(figmaFileId, htmlContent, options = {}) {
    const startTime = Date.now();
    
    try {
      // 1. Завантаження та аналіз Figma макету
      console.log('🔄 Завантаження Figma макету...');
      const figmaData = await this.loadAndAnalyzeFigma(figmaFileId);
      
      // 2. Парсинг та аналіз HTML
      console.log('🔄 Парсинг HTML...');
      const htmlData = this.parseAndAnalyzeHTML(htmlContent);
      
      // 3. Співставлення елементів
      console.log('🔄 Співставлення елементів...');
      const matches = await this.matchElements(figmaData, htmlData);
      
      // 4. Генерація CSS
      console.log('🔄 Генерація CSS...');
      const css = this.cssGenerator.generateCSS(figmaData, htmlData, matches);
      
      // 5. Розрахунок статистики
      this.calculateStatistics(startTime, figmaData, htmlData, matches);
      
      console.log('✅ CSS успішно згенеровано!');
      
      return {
        css,
        statistics: this.statistics,
        figmaData,
        htmlData,
        matches
      };
      
    } catch (error) {
      console.error('❌ Помилка генерації CSS:', error.message);
      this.statistics.errors.push(error.message);
      throw error;
    }
  }

  /**
   * Завантаження та аналіз Figma макету
   */
  async loadAndAnalyzeFigma(figmaFileId) {
    try {
      // Завантаження даних з Figma
      const rawFigmaData = await this.figmaClient.fetchFile(figmaFileId);
      
      // Аналіз структури
      const analyzedData = this.figmaAnalyzer.analyzeFigma(rawFigmaData);
      
      // Створення ієрархії для співставлення
      const hierarchy = new Map();
      analyzedData.hierarchy.forEach((element, id) => {
        hierarchy.set(id, {
          id: element.id,
          name: element.name,
          type: element.type,
          content: element.content?.text || '',
          styles: element.styles,
          semanticRole: element.semanticRole,
          children: element.children || [],
          parent: element.parent,
          level: element.depth,
          importance: element.importance,
          complexity: element.complexity
        });
      });
      
      return {
        hierarchy,
        contentMap: analyzedData.content,
        structure: analyzedData.structure,
        styles: analyzedData.styles,
        semantics: analyzedData.semantics
      };
      
    } catch (error) {
      throw new Error(`Помилка завантаження Figma макету: ${error.message}`);
    }
  }

  /**
   * Парсинг та аналіз HTML
   */
  parseAndAnalyzeHTML(htmlContent) {
    try {
      const parsedData = this.htmlParser.parseHTML(htmlContent);
      
      return {
        hierarchy: parsedData.hierarchy,
        contentMap: parsedData.contentMap,
        classMap: parsedData.classMap,
        semanticMap: parsedData.semanticMap,
        structure: parsedData.structure
      };
      
    } catch (error) {
      throw new Error(`Помилка парсингу HTML: ${error.message}`);
    }
  }

  /**
   * Співставлення елементів Figma та HTML
   */
  async matchElements(figmaData, htmlData) {
    try {
      // Використання множинних стратегій співставлення
      const styleMatches = this.styleMatcher.matchStyles(figmaData, htmlData);
      const hierarchyMatches = this.hierarchyMatcher.matchHierarchy(figmaData, htmlData);
      
      // Об'єднання результатів
      const combinedMatches = this.combineMatches(styleMatches, hierarchyMatches);
      
      return combinedMatches;
      
    } catch (error) {
      throw new Error(`Помилка співставлення елементів: ${error.message}`);
    }
  }

  /**
   * Об'єднання результатів співставлення
   */
  combineMatches(styleMatches, hierarchyMatches) {
    const combinedMatches = new Map();
    
    // Додавання співставлень з StyleMatcher
    styleMatches.matches.forEach((match, figmaId) => {
      combinedMatches.set(figmaId, {
        htmlElement: match.htmlElement,
        confidence: match.confidence,
        strategy: match.strategy,
        source: 'style'
      });
    });
    
    // Додавання співставлень з HierarchyMatcher
    hierarchyMatches.matches.forEach((match, figmaId) => {
      if (combinedMatches.has(figmaId)) {
        // Якщо вже є співставлення, вибираємо краще
        const existing = combinedMatches.get(figmaId);
        if (match.confidence > existing.confidence) {
          combinedMatches.set(figmaId, {
            htmlElement: match.htmlElement,
            confidence: match.confidence,
            strategy: match.strategy,
            source: 'hierarchy'
          });
        }
      } else {
        combinedMatches.set(figmaId, {
          htmlElement: match.htmlElement,
          confidence: match.confidence,
          strategy: match.strategy,
          source: 'hierarchy'
        });
      }
    });
    
    return combinedMatches;
  }

  /**
   * Розрахунок статистики
   */
  calculateStatistics(startTime, figmaData, htmlData, matches) {
    this.statistics.processingTime = Date.now() - startTime;
    this.statistics.totalElements = figmaData.hierarchy.size;
    this.statistics.matchedElements = matches.size;
    this.statistics.matchPercentage = this.statistics.totalElements > 0 
      ? (this.statistics.matchedElements / this.statistics.totalElements) * 100 
      : 0;
    
    // Розрахунок середньої впевненості
    if (matches.size > 0) {
      const totalConfidence = Array.from(matches.values())
        .reduce((sum, match) => sum + match.confidence, 0);
      this.statistics.averageConfidence = totalConfidence / matches.size;
    }
  }

  /**
   * Отримання Canvas з Figma файлу
   */
  async getFigmaCanvases(figmaFileId) {
    try {
      return await this.figmaClient.getCanvases(figmaFileId);
    } catch (error) {
      throw new Error(`Помилка отримання Canvas: ${error.message}`);
    }
  }

  /**
   * Отримання Layers з Canvas
   */
  async getFigmaLayers(figmaFileId, canvasId) {
    try {
      return await this.figmaClient.getLayers(figmaFileId, canvasId);
    } catch (error) {
      throw new Error(`Помилка отримання Layers: ${error.message}`);
    }
  }

  /**
   * Отримання стилів конкретного Layer
   */
  async getLayerStyles(figmaFileId, layerId) {
    try {
      return await this.figmaClient.getLayerStyles(figmaFileId, layerId);
    } catch (error) {
      throw new Error(`Помилка отримання стилів Layer: ${error.message}`);
    }
  }

  /**
   * Валідація Figma посилання
   */
  async validateFigmaLink(figmaLink) {
    try {
      const fileId = this.extractFileIdFromFigmaLink(figmaLink);
      if (!fileId) {
        return { isValid: false, message: 'Невірний формат посилання' };
      }
      
      // Спроба завантажити файл
      await this.figmaClient.fetchFile(fileId, { useCache: false });
      
      return { isValid: true, message: 'Посилання валідне', fileId };
      
    } catch (error) {
      return { isValid: false, message: `Помилка валідації: ${error.message}` };
    }
  }

  /**
   * Витягування ID файлу з посилання на Figma
   */
  extractFileIdFromFigmaLink(figmaLink) {
    const patterns = [
      /file\/([a-zA-Z0-9]{17,22})(?:\/|$)/,
      /design\/([a-zA-Z0-9]{17,22})(?:\/|$)/,
      /figma\.com\/(?:file|design)\/([a-zA-Z0-9]{17,22})/,
      /([a-zA-Z0-9]{17,22})/
    ];
    
    for (const pattern of patterns) {
      const match = figmaLink.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  }

  /**
   * Отримання статистики системи
   */
  getSystemStatistics() {
    return {
      ...this.statistics,
      figmaClient: this.figmaClient.getCacheStats(),
      styleMatcher: this.styleMatcher.getStatistics(),
      hierarchyMatcher: this.hierarchyMatcher.getStatistics()
    };
  }

  /**
   * Очищення кешу
   */
  clearCache() {
    this.figmaClient.clearCache();
    this.styleMatcher.clearCache();
  }

  /**
   * Оновлення налаштувань
   */
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
    
    // Оновлення компонентів
    this.styleMatcher.confidenceThreshold = this.options.confidenceThreshold;
    this.cssGenerator.options = { ...this.cssGenerator.options, ...newOptions };
  }

  /**
   * Тестування з'єднання з Figma API
   */
  async testFigmaConnection() {
    try {
      const testUrl = 'https://api.figma.com/health';
      const response = await this.figmaClient.makeRequest(testUrl, 'GET');
      
      return {
        success: true,
        status: response.statusCode,
        message: 'З\'єднання з Figma API успішне'
      };
      
    } catch (error) {
      return {
        success: false,
        message: `Помилка з'єднання: ${error.message}`
      };
    }
  }

  /**
   * Експорт конфігурації
   */
  exportConfiguration() {
    return {
      options: this.options,
      statistics: this.statistics,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Імпорт конфігурації
   */
  importConfiguration(config) {
    if (config.options) {
      this.updateOptions(config.options);
    }
    
    if (config.timestamp) {
      console.log(`Конфігурація імпортована з ${config.timestamp}`);
    }
  }
}

module.exports = IntegrationEngine;
