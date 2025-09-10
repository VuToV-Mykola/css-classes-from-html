/**
 * ✅ FIX: Виправлений IntegrationEngine з реальним співставленням
 * Головний модуль інтеграції для CSS генерації з Figma та HTML
 * @version 5.0.0 - REAL INTEGRATION
 */

const FigmaAPIClient = require('./FigmaAPIClient');
const HTMLParser = require('./HTMLParser');
const SmartCSSGenerator = require('../generators/SmartCSSGenerator');

class IntegrationEngine {
  constructor(options = {}) {
    this.options = {
      figmaToken: options.figmaToken || '',
      confidenceThreshold: options.confidenceThreshold || 0.7,
      generateResponsive: options.generateResponsive !== false,
      generateModernCSS: options.generateModernCSS !== false,
      optimizeCSS: options.optimizeCSS || false,
      mode: options.mode || 'minimal',
      ...options
    };

    // ✅ FIX: Ініціалізація компонентів з реальними даними
    this.figmaClient = new FigmaAPIClient(this.options.figmaToken, {
      timeout: 15000,
      retryAttempts: 3
    });

    this.htmlParser = new HTMLParser();

    this.cssGenerator = new SmartCSSGenerator({
      includeReset: true,
      includeComments: true,
      optimizeCSS: this.options.optimizeCSS,
      generateResponsive: this.options.generateResponsive,
      mode: this.options.mode,
      matchingThreshold: this.options.confidenceThreshold
    });

    // ✅ FIX: Статистика обробки
    this.statistics = {
      processingTime: 0,
      totalFigmaElements: 0,
      totalHtmlElements: 0,
      matchedElements: 0,
      matchPercentage: 0,
      averageConfidence: 0,
      errors: [],
      warnings: []
    };
  }

  /**
   * ✅ FIX: Головний метод генерації CSS з реальним співставленням
   */
  async generateCSS(figmaFileId, htmlContent, options = {}) {
    const startTime = Date.now();

    try {
      console.log('🚀 Starting real CSS generation with Figma integration...');

      // ✅ FIX: 1. Завантаження та аналіз Figma макету
      console.log('🎨 Loading and analyzing Figma design...');
      const figmaData = await this.loadAndAnalyzeFigma(figmaFileId, options);

      // ✅ FIX: 2. Парсинг та аналіз HTML
      console.log('📄 Parsing and analyzing HTML...');
      const htmlData = this.parseAndAnalyzeHTML(htmlContent);

      // ✅ FIX: 3. Розумне співставлення елементів
      console.log('🧠 Performing smart element matching...');
      const matches = this.performSmartMatching(figmaData, htmlData);

      // ✅ FIX: 4. Генерація CSS з реальними стилями
      console.log('📝 Generating CSS with real Figma styles...');
      const css = this.cssGenerator.generateCSS(figmaData, htmlData, matches);

      // ✅ FIX: 5. Розрахунок статистики
      this.calculateStatistics(startTime, figmaData, htmlData, matches);

      console.log('✅ CSS generation completed successfully!');
      console.log(
        `📊 Stats: ${this.statistics.matchedElements}/${this.statistics.totalFigmaElements} elements matched (${this.statistics.matchPercentage.toFixed(1)}%)`
      );

      return {
        css,
        statistics: this.statistics,
        figmaData,
        htmlData,
        matches: this.convertMatchesToMap(matches),
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ CSS generation failed:', error.message);
      this.statistics.errors.push(error.message);
      throw new Error(`CSS generation failed: ${error.message}`);
    }
  }

  /**
   * ✅ FIX: Завантаження та аналіз Figma макету з реальної API
   */
  async loadAndAnalyzeFigma(figmaFileId, options = {}) {
    try {
      if (!this.options.figmaToken) {
        throw new Error('❌ Figma API token is required for real integration');
      }

      // ✅ FIX: Завантаження даних з реальної Figma API
      console.log(`📡 Fetching Figma file: ${figmaFileId}`);
      const rawFigmaData = await this.figmaClient.fetchFile(figmaFileId);

      if (!rawFigmaData || !rawFigmaData.document) {
        throw new Error('❌ Invalid Figma data received');
      }

      console.log('📋 Analyzing Figma structure...');

      // ✅ FIX: Фільтрація за вибраними Canvas (якщо є)
      let canvasesToProcess = rawFigmaData.document.children || [];

      if (options.selectedCanvases && options.selectedCanvases.length > 0) {
        const selectedIds = options.selectedCanvases.map(c => c.id);
        canvasesToProcess = canvasesToProcess.filter(canvas => selectedIds.includes(canvas.id));
        console.log(`🎯 Processing ${canvasesToProcess.length} selected Canvas`);
      }

      // ✅ FIX: Створення ієрархії елементів
      const hierarchy = new Map();
      const contentMap = new Map();
      const styleMap = new Map();

      canvasesToProcess.forEach(canvas => {
        this.processCanvasHierarchy(canvas, hierarchy, contentMap, styleMap, 0, null);
      });

      // ✅ FIX: Фільтрація за вибраними Layers (якщо є)
      if (options.selectedLayers && options.selectedLayers.length > 0) {
        const selectedLayerIds = options.selectedLayers.map(l => l.id);
        const filteredHierarchy = new Map();

        hierarchy.forEach((element, id) => {
          if (selectedLayerIds.includes(id)) {
            filteredHierarchy.set(id, element);
          }
        });

        console.log(`🎯 Processing ${filteredHierarchy.size} selected Layers`);
        return {
          hierarchy: filteredHierarchy,
          contentMap,
          styleMap,
          rawData: rawFigmaData
        };
      }

      console.log(`📊 Processed ${hierarchy.size} Figma elements`);

      return {
        hierarchy,
        contentMap,
        styleMap,
        rawData: rawFigmaData
      };
    } catch (error) {
      console.error('❌ Figma analysis failed:', error.message);
      throw new Error(`Failed to load Figma design: ${error.message}`);
    }
  }

  /**
   * ✅ FIX: Рекурсивна обробка ієрархії Canvas
   */
  processCanvasHierarchy(node, hierarchy, contentMap, styleMap, depth, parentId) {
    if (!node) return;

    const elementInfo = {
      id: node.id,
      name: node.name || 'Unnamed',
      type: node.type,
      depth: depth,
      parent: parentId,
      children: [],

      // ✅ FIX: Реальні дані з Figma
      content: this.extractNodeContent(node),
      styles: this.extractNodeStyles(node),
      position: this.extractNodePosition(node),
      constraints: node.constraints,
      visible: node.visible !== false,
      locked: node.locked === true,

      // ✅ FIX: Семантична роль
      semanticRole: this.determineSemanticRole(node),
      importance: this.calculateElementImportance(node, depth)
    };

    // ✅ FIX: Додаємо до maps
    hierarchy.set(node.id, elementInfo);

    if (elementInfo.content && elementInfo.content.text) {
      contentMap.set(elementInfo.content.text, elementInfo);
    }

    if (elementInfo.styles && Object.keys(elementInfo.styles).length > 0) {
      styleMap.set(node.id, elementInfo.styles);
    }

    // ✅ FIX: Рекурсивно обробляємо дітей
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(child => {
        this.processCanvasHierarchy(child, hierarchy, contentMap, styleMap, depth + 1, node.id);
        elementInfo.children.push(child.id);
      });
    }
  }

  /**
   * ✅ FIX: Витягування контенту з Figma node
   */
  extractNodeContent(node) {
    const content = {
      text: null,
      hasText: false,
      textLength: 0,
      wordCount: 0
    };

    if (node.type === 'TEXT' && node.characters) {
      content.text = node.characters;
      content.hasText = true;
      content.textLength = node.characters.length;
      content.wordCount = node.characters
        .trim()
        .split(/\s+/)
        .filter(w => w.length > 0).length;
    }

    return content;
  }

  /**
   * ✅ FIX: Витягування стилів з Figma node
   */
  extractNodeStyles(node) {
    const styles = {};

    // ✅ FIX: Typography стилі
    if (node.type === 'TEXT' && node.style) {
      if (node.style.fontFamily) styles.fontFamily = node.style.fontFamily;
      if (node.style.fontSize) styles.fontSize = node.style.fontSize;
      if (node.style.fontWeight) styles.fontWeight = node.style.fontWeight;
      if (node.style.lineHeightPx) styles.lineHeight = node.style.lineHeightPx;
      if (node.style.letterSpacing) styles.letterSpacing = node.style.letterSpacing;
      if (node.style.textAlignHorizontal) styles.textAlign = node.style.textAlignHorizontal;
    }

    // ✅ FIX: Fills (кольори/фони)
    if (node.fills && node.fills.length > 0) {
      const primaryFill = node.fills[0];
      if (primaryFill.type === 'SOLID' && primaryFill.color) {
        styles.fill = {
          type: 'solid',
          color: primaryFill.color,
          opacity: primaryFill.opacity || 1
        };
      }
    }

    // ✅ FIX: Strokes (обводки)
    if (node.strokes && node.strokes.length > 0 && node.strokeWeight) {
      const primaryStroke = node.strokes[0];
      if (primaryStroke.type === 'SOLID' && primaryStroke.color) {
        styles.stroke = {
          color: primaryStroke.color,
          weight: node.strokeWeight
        };
      }
    }

    // ✅ FIX: Layout стилі
    if (node.layoutMode) {
      styles.layout = {
        mode: node.layoutMode,
        primaryAxisAlignItems: node.primaryAxisAlignItems,
        counterAxisAlignItems: node.counterAxisAlignItems,
        itemSpacing: node.itemSpacing
      };
    }

    // ✅ FIX: Corner radius
    if (node.cornerRadius) {
      styles.cornerRadius = node.cornerRadius;
    }

    // ✅ FIX: Effects (тіні, розмиття)
    if (node.effects && node.effects.length > 0) {
      styles.effects = node.effects.filter(effect => effect.visible !== false);
    }

    return styles;
  }

  /**
   * ✅ FIX: Витягування позиції з Figma node
   */
  extractNodePosition(node) {
    const position = {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };

    if (node.absoluteBoundingBox) {
      position.x = node.absoluteBoundingBox.x;
      position.y = node.absoluteBoundingBox.y;
      position.width = node.absoluteBoundingBox.width;
      position.height = node.absoluteBoundingBox.height;
    }

    return position;
  }

  /**
   * ✅ FIX: Визначення семантичної ролі
   */
  determineSemanticRole(node) {
    const name = (node.name || '').toLowerCase();
    const type = node.type;

    if (type === 'TEXT') {
      if (name.includes('title') || name.includes('heading')) return 'heading';
      if (name.includes('button') || name.includes('btn')) return 'button';
      if (name.includes('link')) return 'link';
      return 'text';
    }

    if (type === 'FRAME' || type === 'GROUP') {
      if (name.includes('header')) return 'header';
      if (name.includes('footer')) return 'footer';
      if (name.includes('nav') || name.includes('menu')) return 'navigation';
      if (name.includes('main')) return 'main';
      if (name.includes('card')) return 'card';
      return 'container';
    }

    if (type === 'RECTANGLE') {
      if (name.includes('button') || name.includes('btn')) return 'button';
      if (name.includes('image') || name.includes('img')) return 'image';
      return 'shape';
    }

    return 'generic';
  }

  /**
   * ✅ FIX: Розрахунок важливості елемента
   */
  calculateElementImportance(node, depth) {
    let importance = 0;

    // ✅ FIX: Базова важливість за типом
    const typeImportance = {
      TEXT: 5,
      FRAME: 4,
      RECTANGLE: 3,
      GROUP: 3,
      COMPONENT: 6,
      INSTANCE: 5
    };
    importance += typeImportance[node.type] || 1;

    // ✅ FIX: Важливість за назвою
    const name = (node.name || '').toLowerCase();
    if (name.includes('main') || name.includes('primary')) importance += 3;
    if (name.includes('header') || name.includes('title')) importance += 2;
    if (name.includes('button') || name.includes('nav')) importance += 2;

    // ✅ FIX: Зменшення важливості з глибиною
    importance -= Math.min(depth * 0.5, 3);

    return Math.max(importance, 1);
  }

  /**
   * ✅ FIX: Парсинг та аналіз HTML
   */
  parseAndAnalyzeHTML(htmlContent) {
    try {
      console.log('📄 Parsing HTML structure...');
      const parsedData = this.htmlParser.parseHTML(htmlContent);

      console.log(`📊 Parsed ${parsedData.hierarchy.size} HTML elements`);

      return {
        hierarchy: parsedData.hierarchy,
        contentMap: parsedData.contentMap,
        classMap: parsedData.classMap,
        semanticMap: parsedData.semanticMap,
        structure: parsedData.structure
      };
    } catch (error) {
      console.error('❌ HTML parsing failed:', error.message);
      throw new Error(`Failed to parse HTML: ${error.message}`);
    }
  }

  /**
   * ✅ FIX: Розумне співставлення елементів
   */
  performSmartMatching(figmaData, htmlData) {
    console.log('🧠 Starting smart element matching...');

    const figmaElements = Array.from(figmaData.hierarchy.values());
    const htmlElements = Array.from(htmlData.hierarchy.values());

    console.log(
      `🔍 Matching ${figmaElements.length} Figma elements with ${htmlElements.length} HTML elements`
    );

    const matches = new Map();
    const usedHtmlElements = new Set();

    // ✅ FIX: 1. Точне співставлення за текстом
    console.log('🎯 Phase 1: Exact text matching...');
    let exactMatches = 0;

    figmaElements.forEach(figmaElement => {
      if (figmaElement.content && figmaElement.content.text) {
        const figmaText = this.normalizeText(figmaElement.content.text);

        htmlElements.forEach(htmlElement => {
          if (usedHtmlElements.has(htmlElement.id)) return;

          const htmlText = this.normalizeText(htmlElement.textContent || '');

          if (figmaText && htmlText && figmaText === htmlText) {
            matches.set(figmaElement.id, {
              htmlElementId: htmlElement.id,
              confidence: 1.0,
              strategy: 'exact-text-match',
              figmaElement,
              htmlElement
            });
            usedHtmlElements.add(htmlElement.id);
            exactMatches++;
            console.log(`✅ Exact match: "${figmaElement.name}" ↔ "${htmlText}"`);
          }
        });
      }
    });

    console.log(`📊 Phase 1 complete: ${exactMatches} exact matches`);

    // ✅ FIX: 2. Семантичне співставлення
    console.log('🎯 Phase 2: Semantic role matching...');
    let semanticMatches = 0;

    figmaElements.forEach(figmaElement => {
      if (matches.has(figmaElement.id)) return;

      htmlElements.forEach(htmlElement => {
        if (usedHtmlElements.has(htmlElement.id)) return;

        const semanticSimilarity = this.calculateSemanticSimilarity(figmaElement, htmlElement);

        if (semanticSimilarity >= 0.8) {
          matches.set(figmaElement.id, {
            htmlElementId: htmlElement.id,
            confidence: semanticSimilarity,
            strategy: 'semantic-role-match',
            figmaElement,
            htmlElement
          });
          usedHtmlElements.add(htmlElement.id);
          semanticMatches++;
          console.log(
            `✅ Semantic match: "${figmaElement.name}" (${figmaElement.semanticRole}) ↔ .${this.getElementClassName(htmlElement)} (${htmlElement.semanticRole})`
          );
        }
      });
    });

    console.log(`📊 Phase 2 complete: ${semanticMatches} semantic matches`);

    // ✅ FIX: 3. Ієрархічне співставлення
    console.log('🎯 Phase 3: Hierarchical matching...');
    let hierarchicalMatches = 0;

    figmaElements.forEach(figmaElement => {
      if (matches.has(figmaElement.id)) return;

      let bestMatch = null;
      let bestScore = 0;

      htmlElements.forEach(htmlElement => {
        if (usedHtmlElements.has(htmlElement.id)) return;

        const hierarchicalSimilarity = this.calculateHierarchicalSimilarity(
          figmaElement,
          htmlElement
        );

        if (
          hierarchicalSimilarity > bestScore &&
          hierarchicalSimilarity >= this.options.confidenceThreshold
        ) {
          bestScore = hierarchicalSimilarity;
          bestMatch = htmlElement;
        }
      });

      if (bestMatch) {
        matches.set(figmaElement.id, {
          htmlElementId: bestMatch.id,
          confidence: bestScore,
          strategy: 'hierarchical-match',
          figmaElement,
          htmlElement: bestMatch
        });
        usedHtmlElements.add(bestMatch.id);
        hierarchicalMatches++;
        console.log(
          `✅ Hierarchical match: "${figmaElement.name}" ↔ .${this.getElementClassName(bestMatch)} (${(bestScore * 100).toFixed(1)}%)`
        );
      }
    });

    console.log(`📊 Phase 3 complete: ${hierarchicalMatches} hierarchical matches`);

    const totalMatches = exactMatches + semanticMatches + hierarchicalMatches;
    console.log(`🎉 Smart matching complete: ${totalMatches} total matches found`);

    return matches;
  }

  /**
   * ✅ FIX: Допоміжні методи співставлення
   */
  calculateSemanticSimilarity(figmaElement, htmlElement) {
    if (figmaElement.semanticRole === htmlElement.semanticRole) return 1.0;

    // ✅ FIX: Таблиця спорідненості ролей
    const roleAffinity = {
      heading: {text: 0.8},
      button: {link: 0.7, container: 0.4},
      text: {heading: 0.8},
      container: {card: 0.8, main: 0.7},
      navigation: {header: 0.8}
    };

    return roleAffinity[figmaElement.semanticRole]?.[htmlElement.semanticRole] || 0;
  }

  calculateHierarchicalSimilarity(figmaElement, htmlElement) {
    const figmaDepth = figmaElement.depth || 0;
    const htmlDepth = htmlElement.level || 0;

    // ✅ FIX: Схожість за глибиною
    const depthDiff = Math.abs(figmaDepth - htmlDepth);
    const maxDepth = Math.max(figmaDepth, htmlDepth) || 1;
    const depthSimilarity = 1 - depthDiff / maxDepth;

    // ✅ FIX: Схожість за кількістю дітей
    const figmaChildren = figmaElement.children?.length || 0;
    const htmlChildren = htmlElement.children?.length || 0;
    const childrenSimilarity =
      figmaChildren === 0 && htmlChildren === 0
        ? 1.0
        : Math.min(figmaChildren, htmlChildren) / Math.max(figmaChildren, htmlChildren) || 0;

    return (depthSimilarity + childrenSimilarity) / 2;
  }

  normalizeText(text) {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  getElementClassName(htmlElement) {
    if (htmlElement.classes && htmlElement.classes.length > 0) {
      return htmlElement.classes[0];
    }
    return htmlElement.tagName?.toLowerCase() || 'element';
  }

  convertMatchesToMap(matches) {
    const result = new Map();
    matches.forEach((match, figmaId) => {
      result.set(figmaId, match.htmlElementId);
    });
    return result;
  }

  /**
   * ✅ FIX: Розрахунок статистики
   */
  calculateStatistics(startTime, figmaData, htmlData, matches) {
    this.statistics.processingTime = Date.now() - startTime;
    this.statistics.totalFigmaElements = figmaData?.hierarchy?.size || 0;
    this.statistics.totalHtmlElements = htmlData?.hierarchy?.size || 0;
    this.statistics.matchedElements = matches?.size || 0;

    this.statistics.matchPercentage =
      this.statistics.totalFigmaElements > 0
        ? (this.statistics.matchedElements / this.statistics.totalFigmaElements) * 100
        : 0;

    // ✅ FIX: Розрахунок середньої впевненості
    if (matches && matches.size > 0) {
      const totalConfidence = Array.from(matches.values()).reduce(
        (sum, match) => sum + match.confidence,
        0
      );
      this.statistics.averageConfidence = totalConfidence / matches.size;
    }
  }

  /**
   * ✅ FIX: Отримання Canvas з Figma файлу
   */
  async getFigmaCanvases(figmaFileId) {
    try {
      return await this.figmaClient.getCanvases(figmaFileId);
    } catch (error) {
      throw new Error(`Failed to get Canvas: ${error.message}`);
    }
  }

  /**
   * ✅ FIX: Отримання Layers з Canvas
   */
  async getFigmaLayers(figmaFileId, canvasIds) {
    try {
      return await this.figmaClient.getLayers(figmaFileId, canvasIds);
    } catch (error) {
      throw new Error(`Failed to get Layers: ${error.message}`);
    }
  }

  /**
   * ✅ FIX: Отримання стилів Layer
   */
  async getLayerStyles(figmaFileId, layerIds) {
    try {
      return await this.figmaClient.getLayerStyles(figmaFileId, layerIds);
    } catch (error) {
      throw new Error(`Failed to get Layer styles: ${error.message}`);
    }
  }

  /**
   * ✅ FIX: Валідація Figma посилання
   */
  async validateFigmaLink(figmaLink) {
    try {
      const fileId = this.extractFileIdFromFigmaLink(figmaLink);
      if (!fileId) {
        return {isValid: false, message: 'Invalid Figma link format'};
      }

      await this.figmaClient.fetchFile(fileId, {useCache: false});

      return {isValid: true, message: 'Link is valid', fileId};
    } catch (error) {
      return {isValid: false, message: `Validation error: ${error.message}`};
    }
  }

  /**
   * ✅ FIX: Витягування ID файлу з посилання
   */
  extractFileIdFromFigmaLink(figmaLink) {
    const patterns = [
      /file\/([a-zA-Z0-9]{17,22})(?:\/|$)/,
      /design\/([a-zA-Z0-9]{17,22})(?:\/|$)/,
      /figma\.com\/(?:file|design)\/([a-zA-Z0-9]{17,22})/
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
   * ✅ FIX: Оновлення налаштувань
   */
  updateOptions(newOptions) {
    this.options = {...this.options, ...newOptions};

    // ✅ FIX: Оновлення токену в Figma клієнті
    if (newOptions.figmaToken) {
      this.figmaClient = new FigmaAPIClient(newOptions.figmaToken, {
        timeout: 15000,
        retryAttempts: 3
      });
    }

    // ✅ FIX: Оновлення генератора CSS
    this.cssGenerator.options = {...this.cssGenerator.options, ...newOptions};
  }

  /**
   * ✅ FIX: Очищення кешу
   */
  clearCache() {
    this.figmaClient.clearCache();
  }

  /**
   * ✅ FIX: Отримання статистики системи
   */
  getSystemStatistics() {
    return {
      ...this.statistics,
      figmaClient: this.figmaClient.getCacheStats(),
      cssGenerator: this.cssGenerator.getStatistics()
    };
  }

  /**
   * ✅ FIX: Тестування з'єднання з Figma API
   */
  async testFigmaConnection() {
    try {
      if (!this.options.figmaToken) {
        return {
          success: false,
          message: 'No Figma API token provided'
        };
      }

      // ✅ FIX: Тестовий запит до Figma API
      const testFileId = 'test'; // Використовуємо невалідний ID для тесту з'єднання

      try {
        await this.figmaClient.fetchFile(testFileId);
      } catch (error) {
        // ✅ FIX: Якщо помилка 404 або 403, то з'єднання працює
        if (error.message.includes('404') || error.message.includes('403')) {
          return {
            success: true,
            message: 'Figma API connection successful'
          };
        }
        throw error;
      }

      return {
        success: true,
        message: 'Figma API connection successful'
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection failed: ${error.message}`
      };
    }
  }

  /**
   * ✅ FIX: Експорт конфігурації
   */
  exportConfiguration() {
    return {
      options: {...this.options, figmaToken: '***'}, // Приховуємо токен
      statistics: this.statistics,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * ✅ FIX: Імпорт конфігурації
   */
  importConfiguration(config) {
    if (config.options) {
      this.updateOptions(config.options);
    }

    if (config.timestamp) {
      console.log(`Configuration imported from ${config.timestamp}`);
    }
  }
}

module.exports = IntegrationEngine;
