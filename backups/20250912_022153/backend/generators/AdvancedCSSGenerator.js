/**
 * ✅ FIX: Розширений CSS генератор з 100% переносом властивостей
 * Забезпечує повний перенос стилів з Figma в HTML класи
 * @version 2.0.0 - ADVANCED GENERATION
 */

class AdvancedCSSGenerator {
  constructor(options = {}) {
    this.options = {
      includeReset: options.includeReset !== false,
      includeComments: options.includeComments !== false,
      optimizeCSS: options.optimizeCSS || false,
      generateResponsive: options.generateResponsive !== false,
      mobileFirst: options.mobileFirst !== false,
      fluidTypography: options.fluidTypography !== false,
      ultraSmallViewports: options.ultraSmallViewports !== false,
      mode: options.mode || 'minimal',
      layerAliases: options.layerAliases || {},
      customUtilityStyles: options.customUtilityStyles || {},
      viewportBreakpoints: options.viewportBreakpoints || {
        xs: '280px',
        sm: '320px', 
        md: '480px',
        lg: '768px',
        xl: '1024px'
      },
      ...options
    };

    this.cssRules = new Map();
    this.orderedSelectors = []; // ✅ FIX: Зберігаємо порядок селекторів
    this.variables = new Map();
    this.mediaQueries = new Map();
    this.fluidProperties = new Set(['font-size', 'padding', 'margin', 'width', 'height']);
    this.statistics = {
      totalRules: 0,
      matchedElements: 0,
      unmatchedElements: 0,
      responsiveRules: 0,
      fluidProperties: 0,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * ✅ FIX: Генерація адаптивного CSS з мобільним підходом
   */
  async generateCSS(figmaData, htmlData, matchingResults) {
    console.log('🎨 Початок розширеної адаптивної генерації CSS...');
    
    // Очищаємо попередні дані
    this.cssRules.clear();
    this.variables.clear();
    this.mediaQueries.clear();
    
    console.log(`📊 Результати співставлення: ${matchingResults.length}`);
    
    // Генеруємо адаптивні CSS змінні
    if (this.options.fluidTypography || this.options.mobileFirst) {
      this.generateFluidVariables();
    }
    
    // Обробляємо кожне співставлення з адаптивністю
    for (const match of matchingResults) {
      await this.generateResponsiveCSSForMatch(match);
    }
    
    // Генеруємо фінальний адаптивний CSS
    const css = this.compileCSS();
    
    // Розраховуємо статистику
    this.calculateStatistics();
    
    console.log('✅ CSS генерація завершена:');
    console.log(`   • Всього правил: ${this.statistics.totalRules}`);
    console.log(`   • Зіставлено елементів: ${this.statistics.matchedElements}`);
    console.log(`   • Не зіставлено елементів: ${this.statistics.unmatchedElements}`);
    
    return css;
  }

  /**
   * ✅ FIX: Генерація CSS для конкретного співставлення
   */
  async generateCSSForMatch(match) {
    const { figma, html, confidence, type, metadata } = match;
    
    try {
      console.log('🔍 Обробка співставлення:');
      console.log(`   Figma: ${figma.name || figma.type}`);
      console.log(`   HTML: ${html.tagName}.${html.className || 'no-class'}`);
      console.log(`   Confidence: ${confidence}`);
      console.log(`   Type: ${type}`);
      
      // Витягуємо стилі з Figma елемента
      const figmaStyles = this.extractFigmaStyles(figma);
      console.log('📊 Figma стилі:', figmaStyles);
      
      // Генеруємо CSS селектор для HTML елемента
      const selector = this.generateSelector(html);
      console.log(`🎯 Селектор: ${selector}`);
      
      // Отримуємо інформацію про Canvas та Layers
      const canvasInfo = this.getCanvasInfo(figma);
      const layerInfo = this.getLayerInfo(figma);
      
      // Для точних співпадінь використовуємо 100% властивостей
      const shouldUseFullTransfer = metadata && metadata.isExactMatch === true;
      const cssRules = this.convertFigmaStylesToCSS(figmaStyles, shouldUseFullTransfer ? 1.0 : confidence);
      console.log('📊 CSS правила:', cssRules);
      
      // ✅ Мердж утилітних класів з бібліотеки (тільки відсутні властивості)
      const enhancedRules = this.mergeUtilityClassIfNeeded(selector, cssRules);

      // ✅ FIX: Додаємо правила ТІЛЬКИ якщо є реальні стилі з Figma або після мерджу (БЕЗ FALLBACK)
      if (Object.keys(enhancedRules).length > 0) {
        // ✅ FIX: Зберігаємо порядок селекторів відповідно до HTML ієрархії
        if (!this.cssRules.has(selector)) {
          this.orderedSelectors.push(selector);
        }
        
        this.cssRules.set(selector, {
          rules: enhancedRules,
          confidence: shouldUseFullTransfer ? 1.0 : confidence,
          source: 'figma',
          canvas: canvasInfo,
          layer: layerInfo,
          htmlElement: html, // ✅ FIX: Зберігаємо HTML елемент для сортування
          metadata: {
            ...metadata,
            isExactMatch: shouldUseFullTransfer,
            hasFigmaStyles: true,
            canvasName: canvasInfo.name,
            layerName: layerInfo.name
          }
        });
        
        this.statistics.matchedElements++;
        
        console.log(`✅ CSS згенеровано для ${selector}`);
        console.log(`   Canvas: ${canvasInfo.name}`);
        console.log(`   Layer: ${layerInfo.name}`);
        console.log(`   Кількість правил: ${Object.keys(cssRules).length}`);
        console.log('   Джерело: Figma (БЕЗ FALLBACK)');
      } else {
        console.log(`⚠️ Немає Figma стилів для ${selector} - пропускаємо (БЕЗ FALLBACK)`);
        this.statistics.unmatchedElements++;
      }
      
    } catch (error) {
      console.error('❌ Помилка генерації CSS для співставлення:', error);
      this.statistics.unmatchedElements++;
    }
  }

  /**
   * ✅ NEW: Додає властивості з користувацької бібліотеки утилітних класів,
   * якщо селектор є класом і відповідний клас присутній у бібліотеці.
   * Перезапис НЕ виконуємо — лише відсутні властивості.
   */
  mergeUtilityClassIfNeeded(selector, cssRules) {
    try {
      if (!selector || selector[0] !== '.') return cssRules;
      const className = selector.slice(1).trim();
      const utilities = this.options.customUtilityStyles || {};
      const utilRules = utilities[className];
      if (!utilRules || typeof utilRules !== 'object') return cssRules;

      const merged = { ...cssRules };
      for (const [prop, val] of Object.entries(utilRules)) {
        if (!(prop in merged)) {
          merged[prop] = val;
        }
      }
      return merged;
    } catch (_) {
      return cssRules;
    }
  }

  /**
   * ✅ FIX: Витягування стилів з Figma елемента
   */
  extractFigmaStyles(figmaNode) {
    const styles = {};
    
    if (!figmaNode) return styles;
    
    console.log(`🔍 Витягування стилів з Figma вузла: ${figmaNode.name || figmaNode.type}`);
    
    // Кольори
    if (figmaNode.fills && figmaNode.fills.length > 0) {
      const fill = figmaNode.fills[0];
      if (fill.type === 'SOLID' && fill.color) {
        styles.color = this.rgbToHex(fill.color);
        console.log(`   ✅ color: ${styles.color}`);
      }
    }
    
    // Фон
    if (figmaNode.fills && figmaNode.fills.length > 0) {
      const fill = figmaNode.fills[0];
      if (fill.type === 'SOLID' && fill.color) {
        styles.backgroundColor = this.rgbToHex(fill.color);
        console.log(`   ✅ background-color: ${styles.backgroundColor}`);
      }
    }
    
    // Шрифти
    if (figmaNode.style) {
      if (figmaNode.style.fontFamily) {
        styles.fontFamily = `"${figmaNode.style.fontFamily}", sans-serif`;
        console.log(`   ✅ font-family: ${styles.fontFamily}`);
      }
      
      if (figmaNode.style.fontSize) {
        styles.fontSize = `${figmaNode.style.fontSize}px`;
        console.log(`   ✅ font-size: ${styles.fontSize}`);
      }
      
      if (figmaNode.style.fontWeight) {
        styles.fontWeight = figmaNode.style.fontWeight;
        console.log(`   ✅ font-weight: ${styles.fontWeight}`);
      }
      
      if (figmaNode.style.fontStyle) {
        styles.fontStyle = figmaNode.style.fontStyle;
        console.log(`   ✅ font-style: ${styles.fontStyle}`);
      }
      
      if (figmaNode.style.textAlignHorizontal) {
        styles.textAlign = figmaNode.style.textAlignHorizontal.toLowerCase();
        console.log(`   ✅ text-align: ${styles.textAlign}`);
      }
      
      if (figmaNode.style.textAlignVertical) {
        styles.verticalAlign = figmaNode.style.textAlignVertical.toLowerCase();
        console.log(`   ✅ vertical-align: ${styles.verticalAlign}`);
      }
      
      if (figmaNode.style.letterSpacing) {
        styles.letterSpacing = `${figmaNode.style.letterSpacing}px`;
        console.log(`   ✅ letter-spacing: ${styles.letterSpacing}`);
      }
      
      if (figmaNode.style.lineHeightPx) {
        styles.lineHeight = `${figmaNode.style.lineHeightPx}px`;
        console.log(`   ✅ line-height: ${styles.lineHeight}`);
      }
    }
    
    // Розміри
    if (figmaNode.absoluteBoundingBox) {
      const { width, height } = figmaNode.absoluteBoundingBox;
      
      if (width) {
        styles.width = `${width}px`;
        console.log(`   ✅ width: ${styles.width}`);
      }
      
      if (height) {
        styles.height = `${height}px`;
        console.log(`   ✅ height: ${styles.height}`);
      }
    }
    
    // Відступи
    if (figmaNode.paddingLeft) {
      styles.paddingLeft = `${figmaNode.paddingLeft}px`;
      console.log(`   ✅ padding-left: ${styles.paddingLeft}`);
    }
    
    if (figmaNode.paddingRight) {
      styles.paddingRight = `${figmaNode.paddingRight}px`;
      console.log(`   ✅ padding-right: ${styles.paddingRight}`);
    }
    
    if (figmaNode.paddingTop) {
      styles.paddingTop = `${figmaNode.paddingTop}px`;
      console.log(`   ✅ padding-top: ${styles.paddingTop}`);
    }
    
    if (figmaNode.paddingBottom) {
      styles.paddingBottom = `${figmaNode.paddingBottom}px`;
      console.log(`   ✅ padding-bottom: ${styles.paddingBottom}`);
    }
    
    // Радіус кутів
    if (figmaNode.cornerRadius) {
      styles.borderRadius = `${figmaNode.cornerRadius}px`;
      console.log(`   ✅ border-radius: ${styles.borderRadius}`);
    }
    
    // Границі
    if (figmaNode.strokes && figmaNode.strokes.length > 0) {
      const stroke = figmaNode.strokes[0];
      if (stroke.type === 'SOLID' && stroke.color) {
        styles.borderColor = this.rgbToHex(stroke.color);
        console.log(`   ✅ border-color: ${styles.borderColor}`);
      }
      
      if (stroke.strokeWeight) {
        styles.borderWidth = `${stroke.strokeWeight}px`;
        console.log(`   ✅ border-width: ${styles.borderWidth}`);
      }
    }
    
    // Тіні
    if (figmaNode.effects && figmaNode.effects.length > 0) {
      const shadow = figmaNode.effects.find(effect => effect.type === 'DROP_SHADOW');
      if (shadow) {
        const { offset, radius, color } = shadow;
        styles.boxShadow = `${offset.x}px ${offset.y}px ${radius}px ${this.rgbToHex(color)}`;
        console.log(`   ✅ box-shadow: ${styles.boxShadow}`);
      }
    }
    
    // Flexbox
    if (figmaNode.layoutMode) {
      styles.display = 'flex';
      console.log('   ✅ display: flex');
      
      if (figmaNode.primaryAxisAlignItems) {
        const alignMap = {
          'MIN': 'flex-start',
          'CENTER': 'center',
          'MAX': 'flex-end',
          'SPACE_BETWEEN': 'space-between'
        };
        styles.justifyContent = alignMap[figmaNode.primaryAxisAlignItems] || 'flex-start';
        console.log(`   ✅ justify-content: ${styles.justifyContent}`);
      }
      
      if (figmaNode.counterAxisAlignItems) {
        const alignMap = {
          'MIN': 'flex-start',
          'CENTER': 'center',
          'MAX': 'flex-end',
          'BASELINE': 'baseline'
        };
        styles.alignItems = alignMap[figmaNode.counterAxisAlignItems] || 'flex-start';
        console.log(`   ✅ align-items: ${styles.alignItems}`);
      }
    }
    
    // Позиціонування
    if (figmaNode.absoluteBoundingBox) {
      const { x, y } = figmaNode.absoluteBoundingBox;
      
      if (x !== undefined) {
        styles.left = `${x}px`;
        console.log(`   ✅ left: ${styles.left}`);
      }
      
      if (y !== undefined) {
        styles.top = `${y}px`;
        console.log(`   ✅ top: ${styles.top}`);
      }
    }
    
    console.log(`📊 Всього стилів витягнуто: ${Object.keys(styles).length}`);
    
    return styles;
  }

  /**
   * ✅ FIX: Конвертація Figma стилів в CSS
   */
  convertFigmaStylesToCSS(figmaStyles, confidence = 1.0) {
    const cssRules = {};
    
    if (!figmaStyles || Object.keys(figmaStyles).length === 0) {
      return cssRules;
    }
    
    console.log(`🎨 Конвертація Figma стилів в CSS (впевненість: ${(confidence * 100).toFixed(1)}%)`);
    
    // Копіюємо всі стилі з Figma
    for (const [property, value] of Object.entries(figmaStyles)) {
      if (value !== undefined && value !== null && value !== '') {
        cssRules[property] = value;
        console.log(`   ✅ ${property}: ${value}`);
      }
    }
    
    // Якщо це точне співпадіння, додаємо додаткові стилі
    if (confidence >= 0.9) {
      // Додаємо базові стилі для кращої сумісності
      if (!cssRules.display && !cssRules.position) {
        cssRules.display = 'block';
      }
      
      if (!cssRules.boxSizing) {
        cssRules.boxSizing = 'border-box';
      }
    }
    
    console.log(`📊 CSS правил згенеровано: ${Object.keys(cssRules).length}`);
    
    return cssRules;
  }

  /**
   * ✅ FIX: Генерація CSS селектора
   */
  generateSelector(htmlElement) {
    if (!htmlElement) return '';
    
    // Якщо є клас, використовуємо його
    if (htmlElement.className && htmlElement.className.trim()) {
      const cleanClassName = htmlElement.className.trim().replace(/\.+/g, '.');
      const classes = cleanClassName.split(/\s+/).filter(cls => cls && cls !== '.');
      
      if (classes.length === 0) {
        return htmlElement.tagName.toLowerCase();
      }
      
      if (classes.length === 1) {
        return '.' + classes[0].replace(/^\.+/, '');
      } else {
        return '.' + classes.map(cls => cls.replace(/^\.+/, '')).join(' .');
      }
    }
    
    // Якщо немає класу — спробувати побудувати клас від Figma layer alias, якщо він існує
    const figmaId = htmlElement.figmaNodeId || htmlElement.figmaId;
    if (figmaId && this.options.layerAliases && this.options.layerAliases[figmaId]) {
      const alias = this.options.layerAliases[figmaId];
      const clean = String(alias)
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '') || 'element';
      return '.' + clean;
    }

    // Якщо є ID, використовуємо його
    if (htmlElement.id) {
      return '#' + htmlElement.id;
    }
    
    // Інакше використовуємо тег
    return htmlElement.tagName.toLowerCase();
  }

  /**
   * ✅ FIX: Отримання інформації про Canvas
   */
  getCanvasInfo(figmaNode) {
    // Шукаємо найближчий Canvas або FRAME
    let current = figmaNode;
    while (current) {
      if (current.type === 'CANVAS' || current.type === 'FRAME') {
        return {
          id: current.id,
          name: current.name || 'Unknown Canvas',
          type: current.type
        };
      }
      current = current.parent;
    }
    
    return {
      id: 'unknown',
      name: 'Unknown Canvas',
      type: 'CANVAS'
    };
  }

  /**
   * ✅ FIX: Отримання інформації про Layer
   */
  getLayerInfo(figmaNode) {
    const aliasName = (this.options.layerAliases && this.options.layerAliases[figmaNode.id]) || null;
    return {
      id: figmaNode.id,
      name: aliasName || figmaNode.name || figmaNode.type || 'Unknown Layer',
      originalName: figmaNode.name || figmaNode.type || 'Unknown Layer',
      type: figmaNode.type,
      characters: figmaNode.characters || '',
      visible: figmaNode.visible !== false
    };
  }

  /**
   * ✅ FIX: Конвертація RGB в HEX
   */
  rgbToHex(rgb) {
    if (!rgb) return '';
    
    const r = Math.round(rgb.r * 255);
    const g = Math.round(rgb.g * 255);
    const b = Math.round(rgb.b * 255);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  /**
   * ✅ FIX: Компіляція фінального CSS
   */
  compileCSS() {
    let css = '';
    
    // Заголовок
    if (this.options.includeComments) {
      css += '/* ✅ CSS згенеровано Advanced CSS Generator v2.0 */\n';
      css += `/* Згенеровано: ${this.statistics.generatedAt} */\n`;
      css += `/* Зіставлено: ${this.statistics.matchedElements} | Не зіставлено: ${this.statistics.unmatchedElements} */\n`;
      css += `/* Точність: ${this.statistics.matchedElements > 0 ? ((this.statistics.matchedElements / (this.statistics.matchedElements + this.statistics.unmatchedElements)) * 100).toFixed(1) : 0}% */\n\n`;
    }
    
    // CSS змінні
    if (this.variables.size > 0) {
      if (this.options.includeComments) {
        css += '/* 🎨 CSS Custom Properties (змінні) - автоматично згенеровані з Figma */\n';
      }
      css += ':root {\n';
      for (const [name, value] of this.variables) {
        css += `  --${name}: ${value};\n`;
      }
      css += '}\n\n';
    }
    
    // ✅ FIX: Основні CSS правила в ієрархічному порядку HTML
    const sortedSelectors = this.sortSelectorsByHierarchy();
    
    for (const selector of sortedSelectors) {
      const ruleData = this.cssRules.get(selector);
      if (!ruleData) continue;
      
      const { rules, confidence, canvas, layer, metadata } = ruleData;
      
      if (Object.keys(rules).length > 0) {
        // ✅ FIX: Додаємо розширений коментар з джерелом властивостей
        if (this.options.includeComments) {
          const layerLabel = layer.originalName && layer.originalName !== layer.name
            ? `${layer.name} (alias: ${layer.originalName})`
            : layer.name;
          
          // Визначаємо тип джерела властивостей
          let sourceType = 'layer';
          if (metadata && metadata.isCanvasLevel) sourceType = 'canvas';
          if (metadata && metadata.isGlobalStyle) sourceType = 'глобальні';
          if (metadata && metadata.isResetStyle) sourceType = 'reset';
          if (metadata && metadata.isCustomStyle) sourceType = 'користувацькі';
          if (metadata && metadata.isUtilityMerged) sourceType += '+утиліти';
          
          const confidencePercent = Math.round(confidence * 100);
          css += `/* 📍 Canvas: ${canvas.name} | Layer: ${layerLabel} */\n`;
          css += `/* 🎯 Джерело: ${sourceType} | Точність: ${confidencePercent}% | Властивостей: ${Object.keys(rules).length} */\n`;
        }
        
        css += `${selector} {\n`;
        
        for (const [property, value] of Object.entries(rules)) {
          css += `  ${property}: ${value};\n`;
        }
        
        css += '}\n\n';
      }
    }
    
    // Медіа-запити
    if (this.mediaQueries.size > 0) {
      if (this.options.includeComments) {
        css += '/* 📱 Responsive Media Queries - адаптивні стилі згенеровані з Figma */\n';
      }
      for (const [query, rules] of this.mediaQueries) {
        if (this.options.includeComments) {
          css += `/* Брекпоінт: ${query} */\n`;
        }
        css += `@media ${query} {\n`;
        for (const [selector, ruleData] of rules) {
          const { rules: cssRules } = ruleData;
          if (Object.keys(cssRules).length > 0) {
            css += `  ${selector} {\n`;
            for (const [property, value] of Object.entries(cssRules)) {
              css += `    ${property}: ${value};\n`;
            }
            css += '  }\n';
          }
        }
        css += '}\n\n';
      }
    }
    
    return css;
  }

  /**
   * ✅ FIX: Сортування селекторів за ієрархічним порядком HTML
   */
  sortSelectorsByHierarchy() {
    console.log('🌳 Сортування селекторів за ієрархічним порядком HTML...');
    
    // Створюємо масив з селекторами та їх HTML елементами
    const selectorsWithElements = [];
    
    for (const selector of this.orderedSelectors) {
      const ruleData = this.cssRules.get(selector);
      if (ruleData && ruleData.htmlElement) {
        selectorsWithElements.push({
          selector: selector,
          htmlElement: ruleData.htmlElement,
          depth: ruleData.htmlElement.depth || 0,
          order: this.getElementOrder(ruleData.htmlElement)
        });
      }
    }
    
    // Сортуємо за глибиною, а потім за порядком в документі
    selectorsWithElements.sort((a, b) => {
      // Спочатку за глибиною (глибші елементи йдуть пізніше)
      if (a.depth !== b.depth) {
        return a.depth - b.depth;
      }
      
      // Потім за порядком в документі
      return a.order - b.order;
    });
    
    const sortedSelectors = selectorsWithElements.map(item => item.selector);
    
    console.log(`📊 Селекторів відсортовано: ${sortedSelectors.length}`);
    console.log('🌳 Порядок селекторів:', sortedSelectors);
    
    return sortedSelectors;
  }

  /**
   * ✅ FIX: Отримання порядку елемента в HTML документі
   */
  getElementOrder(htmlElement) {
    // Використовуємо ID елемента як порядок
    if (htmlElement.id) {
      const idMatch = htmlElement.id.match(/_(\d+)$/);
      if (idMatch) {
        return parseInt(idMatch[1], 10);
      }
    }
    
    // Якщо немає ID, використовуємо позицію в DOM
    return htmlElement.domIndex || 0;
  }

  /**
   * ✅ FIX: Розрахунок статистики
   */
  calculateStatistics() {
    this.statistics.totalRules = this.cssRules.size;
  }
}

module.exports = AdvancedCSSGenerator;
