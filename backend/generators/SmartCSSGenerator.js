/**
 * ✅ FIX: Розумний CSS генератор з реальним співставленням Figma-HTML
 * Без хардкодінгу - справжнє співставлення елементів за ієрархією, контентом та семантикою
 * @version 5.0.0 - SMART MATCHING
 */

class SmartCSSGenerator {
  constructor(options = {}) {
    this.options = {
      includeReset: options.includeReset !== false,
      includeComments: options.includeComments !== false,
      optimizeCSS: options.optimizeCSS || false,
      generateResponsive: options.generateResponsive !== false,
      mode: options.mode || 'minimal',
      matchingThreshold: options.matchingThreshold || 0.7, // Поріг співставлення
      ...options
    };

    this.cssRules = new Map();
    this.variables = new Map();
    this.mediaQueries = new Map();
    this.matchingResults = new Map();
    this.unmatchedElements = new Set();

    // ✅ FIX: Ваги для співставлення
    this.matchingWeights = {
      textContent: 0.4, // Текстовий вміст
      semanticRole: 0.25, // Семантична роль
      hierarchy: 0.2, // Ієрархічна позиція
      namesimilarity: 0.15 // Схожість назв
    };

    this.statistics = {
      totalRules: 0,
      matchedElements: 0,
      unmatchedElements: 0,
      matchingAccuracy: 0,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * ✅ FIX: Генерація CSS з використанням UniversalMatchingEngine
   */
  generateCSSWithMatching(figmaData, htmlData, matchingResults) {
    this.reset();

    console.log('🎯 Початок генерації CSS з точним співставленням...');

    // Використовуємо результати точного співставлення
    if (matchingResults && matchingResults.length > 0) {
      console.log(`📊 Використовуємо ${matchingResults.length} точних співставлень`);
      
      for (const match of matchingResults) {
        if (match.confidence >= this.options.matchingThreshold) {
          this.generateCSSForMatch(match);
        }
      }
      
      // Оновлюємо статистику
      this.statistics.matchedElements = matchingResults.filter(m => m.confidence >= this.options.matchingThreshold).length;
      this.statistics.unmatchedElements = matchingResults.filter(m => m.confidence < this.options.matchingThreshold).length;
      this.statistics.matchingAccuracy = this.calculateMatchingAccuracy(matchingResults);
    }

    return this.compileCSS();
  }

  /**
   * ✅ FIX: Генерація CSS для конкретного співставлення
   */
  generateCSSForMatch(match) {
    const { figma, html, confidence, type, metadata } = match;
    
    try {
      console.log('🔍 ДІАГНОСТИКА СПІВСТАВЛЕННЯ:');
      console.log('   Figma вузол:', figma);
      console.log('   HTML елемент:', html);
      console.log(`   Confidence: ${confidence}`);
      console.log(`   Type: ${type}`);
      
      // ✅ FIX: 100% перенос властивостей для точних співпадінь тексту
      const isExactTextMatch = metadata && metadata.isExactMatch === true;
      
      // ✅ FIX: 100% перенос властивостей для ієрархічних співставлень
      const isHierarchicalMatch = type === 'hierarchical';
      const isMainNodeMatch = metadata && metadata.isMainNode === true;
      
      if (isExactTextMatch) {
        console.log('🎯 100% ТОЧНЕ СПІВПАДІННЯ ТЕКСТУ - ПОВНИЙ ПЕРЕНОС ВЛАСТИВОСТЕЙ!');
        console.log(`   Figma текст: "${metadata.figmaText}"`);
        console.log(`   HTML текст: "${metadata.htmlText}"`);
        console.log(`   HTML елемент: ${html.tagName}.${html.className || 'no-class'}`);
      }
      
      if (isHierarchicalMatch) {
        console.log('🌳 ІЄРАРХІЧНЕ СПІВСТАВЛЕННЯ - ПОВНИЙ ПЕРЕНОС ВЛАСТИВОСТЕЙ!');
        console.log(`   Figma вузол: ${figma.name || figma.type}`);
        console.log(`   HTML елемент: ${html.tagName}.${html.className || 'no-class'}`);
        console.log(`   Алгоритм: ${metadata.algorithm || 'hierarchical'}`);
        
        if (isMainNodeMatch) {
          console.log('🎯 ГОЛОВНИЙ ВУЗОЛ FIGMA ↔ BODY (100%)');
        }
      }
      
      // Витягуємо стилі з Figma елемента
      const figmaStyles = this.extractFigmaStyles(figma);
      console.log('📊 Figma стилі:', figmaStyles);
      
      // Генеруємо CSS селектор для HTML елемента
      const selector = this.generateSelector(html);
      console.log(`🎯 Згенерований селектор: ${selector}`);
      
      // ✅ FIX: Для точних співпадінь використовуємо 100% властивостей
      const shouldUseFullTransfer = isExactTextMatch || (isHierarchicalMatch && confidence >= 0.8);
      const cssRules = this.convertFigmaStylesToCSS(figmaStyles, shouldUseFullTransfer ? 1.0 : confidence);
      console.log('📊 CSS правила:', cssRules);
      
      // ✅ FIX: Додаємо правила тільки якщо є реальні стилі з Figma
      if (Object.keys(cssRules).length > 0) {
        this.cssRules.set(selector, {
          rules: cssRules,
          confidence: shouldUseFullTransfer ? 1.0 : confidence,
          source: 'figma',
          metadata: {
            ...metadata,
            isExactTextMatch: isExactTextMatch,
            isHierarchicalMatch: isHierarchicalMatch,
            isMainNodeMatch: isMainNodeMatch,
            fullPropertyTransfer: shouldUseFullTransfer,
            hasFigmaStyles: true
          }
        });
        
        if (shouldUseFullTransfer) {
          console.log(`🎯 100% ВЛАСТИВОСТЕЙ ПЕРЕНЕСЕНО для ${selector}`);
          console.log(`   Кількість CSS правил: ${Object.keys(cssRules).length}`);
          console.log(`   Тип співставлення: ${isExactTextMatch ? 'text-exact' : 'hierarchical'}`);
          console.log('   Джерело стилів: Figma');
        } else {
          console.log(`✅ Згенеровано CSS для ${selector} (впевненість: ${(confidence * 100).toFixed(1)}%)`);
          console.log(`   Кількість CSS правил: ${Object.keys(cssRules).length}`);
          console.log('   Джерело стилів: Figma');
        }
      } else {
        console.log(`⚠️ Немає Figma стилів для ${selector} - пропускаємо`);
        console.log(`   Figma вузол має стилі: ${Object.keys(figmaStyles).length > 0 ? 'ТАК' : 'НІ'}`);
        console.log('   Figma стилі:', figmaStyles);
      }
      
    } catch (error) {
      console.error('❌ Помилка генерації CSS для співставлення:', error);
    }
  }

  /**
   * ✅ FIX: Витягування стилів з Figma елемента
   */
  extractFigmaStyles(figmaNode) {
    const styles = {};
    
    console.log(`🔍 Витягуємо стилі з Figma вузла: ${figmaNode.name || figmaNode.type}`);
    console.log('📊 Структура вузла:', Object.keys(figmaNode));
    
    // ✅ FIX: Кольори - розширений аналіз
    if (figmaNode.fills && figmaNode.fills.length > 0) {
      const fill = figmaNode.fills[0];
      if (fill.type === 'SOLID' && fill.color) {
        styles.color = this.rgbToHex(fill.color);
        console.log(`   ✅ color: ${styles.color}`);
      }
    }
    
    // ✅ FIX: Фон - розширений аналіз
    if (figmaNode.fills && figmaNode.fills.length > 0) {
      const fill = figmaNode.fills[0];
      if (fill.type === 'SOLID' && fill.color) {
        styles.backgroundColor = this.rgbToHex(fill.color);
        console.log(`   ✅ background-color: ${styles.backgroundColor}`);
      }
    }
    
    // ✅ FIX: Шрифти - розширений аналіз
    if (figmaNode.style) {
      if (figmaNode.style.fontSize) {
        styles.fontSize = figmaNode.style.fontSize;
        console.log(`   ✅ font-size: ${styles.fontSize}px`);
      }
      if (figmaNode.style.fontFamily) {
        styles.fontFamily = figmaNode.style.fontFamily;
        console.log(`   ✅ font-family: ${styles.fontFamily}`);
      }
      if (figmaNode.style.fontWeight) {
        styles.fontWeight = figmaNode.style.fontWeight;
        console.log(`   ✅ font-weight: ${styles.fontWeight}`);
      }
      if (figmaNode.style.lineHeightPx) {
        styles.lineHeight = figmaNode.style.lineHeightPx;
        console.log(`   ✅ line-height: ${styles.lineHeight}px`);
      }
      if (figmaNode.style.letterSpacing) {
        styles.letterSpacing = figmaNode.style.letterSpacing;
        console.log(`   ✅ letter-spacing: ${styles.letterSpacing}px`);
      }
      if (figmaNode.style.textAlignHorizontal) {
        styles.textAlign = figmaNode.style.textAlignHorizontal.toLowerCase();
        console.log(`   ✅ text-align: ${styles.textAlign}`);
      }
    }
    
    // ✅ FIX: Розміри та позиція - розширений аналіз
    if (figmaNode.absoluteBoundingBox) {
      styles.width = figmaNode.absoluteBoundingBox.width;
      styles.height = figmaNode.absoluteBoundingBox.height;
      console.log(`   ✅ width: ${styles.width}px, height: ${styles.height}px`);
    }
    
    // ✅ FIX: Відступи - розширений аналіз
    if (figmaNode.paddingLeft !== undefined) {
      styles.paddingLeft = figmaNode.paddingLeft;
      console.log(`   ✅ padding-left: ${styles.paddingLeft}px`);
    }
    if (figmaNode.paddingRight !== undefined) {
      styles.paddingRight = figmaNode.paddingRight;
      console.log(`   ✅ padding-right: ${styles.paddingRight}px`);
    }
    if (figmaNode.paddingTop !== undefined) {
      styles.paddingTop = figmaNode.paddingTop;
      console.log(`   ✅ padding-top: ${styles.paddingTop}px`);
    }
    if (figmaNode.paddingBottom !== undefined) {
      styles.paddingBottom = figmaNode.paddingBottom;
      console.log(`   ✅ padding-bottom: ${styles.paddingBottom}px`);
    }
    
    // ✅ FIX: Маржіни - розширений аналіз
    if (figmaNode.marginLeft !== undefined) {
      styles.marginLeft = figmaNode.marginLeft;
      console.log(`   ✅ margin-left: ${styles.marginLeft}px`);
    }
    if (figmaNode.marginRight !== undefined) {
      styles.marginRight = figmaNode.marginRight;
      console.log(`   ✅ margin-right: ${styles.marginRight}px`);
    }
    if (figmaNode.marginTop !== undefined) {
      styles.marginTop = figmaNode.marginTop;
      console.log(`   ✅ margin-top: ${styles.marginTop}px`);
    }
    if (figmaNode.marginBottom !== undefined) {
      styles.marginBottom = figmaNode.marginBottom;
      console.log(`   ✅ margin-bottom: ${styles.marginBottom}px`);
    }
    
    // ✅ FIX: Радіус кутів - розширений аналіз
    if (figmaNode.cornerRadius !== undefined) {
      styles.borderRadius = figmaNode.cornerRadius;
      console.log(`   ✅ border-radius: ${styles.borderRadius}px`);
    }
    
    // ✅ FIX: Бордери - розширений аналіз
    if (figmaNode.strokes && figmaNode.strokes.length > 0) {
      const stroke = figmaNode.strokes[0];
      if (stroke.type === 'SOLID' && stroke.color) {
        styles.borderColor = this.rgbToHex(stroke.color);
        console.log(`   ✅ border-color: ${styles.borderColor}`);
      }
    }
    if (figmaNode.strokeWeight !== undefined) {
      styles.borderWidth = figmaNode.strokeWeight;
      console.log(`   ✅ border-width: ${styles.borderWidth}px`);
    }
    
    // ✅ FIX: Тіні - розширений аналіз
    if (figmaNode.effects && figmaNode.effects.length > 0) {
      const effect = figmaNode.effects[0];
      if (effect.type === 'DROP_SHADOW') {
        const shadow = effect;
        styles.boxShadow = `${shadow.offset.x}px ${shadow.offset.y}px ${shadow.radius}px ${shadow.color ? this.rgbToHex(shadow.color) : 'rgba(0,0,0,0.25)'}`;
        console.log(`   ✅ box-shadow: ${styles.boxShadow}`);
      }
    }
    
    // ✅ FIX: Flexbox - розширений аналіз
    if (figmaNode.layoutMode) {
      styles.display = 'flex';
      console.log('   ✅ display: flex');
      
      if (figmaNode.layoutMode === 'HORIZONTAL') {
        styles.flexDirection = 'row';
        console.log('   ✅ flex-direction: row');
      } else if (figmaNode.layoutMode === 'VERTICAL') {
        styles.flexDirection = 'column';
        console.log('   ✅ flex-direction: column');
      }
    }
    
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
        'MAX': 'flex-end'
      };
      styles.alignItems = alignMap[figmaNode.counterAxisAlignItems] || 'flex-start';
      console.log(`   ✅ align-items: ${styles.alignItems}`);
    }
    
    // ✅ FIX: Позиціонування - розширений аналіз
    if (figmaNode.absoluteBoundingBox) {
      styles.position = 'absolute';
      styles.left = figmaNode.absoluteBoundingBox.x;
      styles.top = figmaNode.absoluteBoundingBox.y;
      console.log(`   ✅ position: absolute, left: ${styles.left}px, top: ${styles.top}px`);
    }
    
    console.log(`📊 Всього витягнуто ${Object.keys(styles).length} властивостей`);
    
    return styles;
  }

  /**
   * ✅ FIX: Конвертація Figma стилів в CSS
   */
  convertFigmaStylesToCSS(figmaStyles, confidence) {
    const cssRules = {};
    const isExactMatch = confidence === 1.0;
    
    if (isExactMatch) {
      console.log('🎯 100% ТОЧНЕ СПІВПАДІННЯ - ПОВНИЙ ПЕРЕНОС ВСІХ ВЛАСТИВОСТЕЙ!');
    }
    
    // ✅ FIX: Кольори - повний перенос
    if (figmaStyles.color) {
      cssRules.color = figmaStyles.color;
      if (isExactMatch) console.log(`   ✅ color: ${figmaStyles.color}`);
    }
    
    // ✅ FIX: Шрифти - повний перенос
    if (figmaStyles.fontSize) {
      cssRules['font-size'] = `${figmaStyles.fontSize}px`;
      if (isExactMatch) console.log(`   ✅ font-size: ${figmaStyles.fontSize}px`);
    }
    if (figmaStyles.fontFamily) {
      cssRules['font-family'] = `"${figmaStyles.fontFamily}", sans-serif`;
      if (isExactMatch) console.log(`   ✅ font-family: "${figmaStyles.fontFamily}"`);
    }
    if (figmaStyles.fontWeight) {
      cssRules['font-weight'] = figmaStyles.fontWeight;
      if (isExactMatch) console.log(`   ✅ font-weight: ${figmaStyles.fontWeight}`);
    }
    if (figmaStyles.lineHeight) {
      cssRules['line-height'] = `${figmaStyles.lineHeight}px`;
      if (isExactMatch) console.log(`   ✅ line-height: ${figmaStyles.lineHeight}px`);
    }
    if (figmaStyles.letterSpacing) {
      cssRules['letter-spacing'] = `${figmaStyles.letterSpacing}px`;
      if (isExactMatch) console.log(`   ✅ letter-spacing: ${figmaStyles.letterSpacing}px`);
    }
    if (figmaStyles.textAlign) {
      cssRules['text-align'] = figmaStyles.textAlign;
      if (isExactMatch) console.log(`   ✅ text-align: ${figmaStyles.textAlign}`);
    }
    if (figmaStyles.textDecoration) {
      cssRules['text-decoration'] = figmaStyles.textDecoration;
      if (isExactMatch) console.log(`   ✅ text-decoration: ${figmaStyles.textDecoration}`);
    }
    
    // ✅ FIX: Розміри - повний перенос
    if (figmaStyles.width) {
      cssRules.width = `${figmaStyles.width}px`;
      if (isExactMatch) console.log(`   ✅ width: ${figmaStyles.width}px`);
    }
    if (figmaStyles.height) {
      cssRules.height = `${figmaStyles.height}px`;
      if (isExactMatch) console.log(`   ✅ height: ${figmaStyles.height}px`);
    }
    if (figmaStyles.minWidth) {
      cssRules['min-width'] = `${figmaStyles.minWidth}px`;
      if (isExactMatch) console.log(`   ✅ min-width: ${figmaStyles.minWidth}px`);
    }
    if (figmaStyles.minHeight) {
      cssRules['min-height'] = `${figmaStyles.minHeight}px`;
      if (isExactMatch) console.log(`   ✅ min-height: ${figmaStyles.minHeight}px`);
    }
    if (figmaStyles.maxWidth) {
      cssRules['max-width'] = `${figmaStyles.maxWidth}px`;
      if (isExactMatch) console.log(`   ✅ max-width: ${figmaStyles.maxWidth}px`);
    }
    if (figmaStyles.maxHeight) {
      cssRules['max-height'] = `${figmaStyles.maxHeight}px`;
      if (isExactMatch) console.log(`   ✅ max-height: ${figmaStyles.maxHeight}px`);
    }
    
    // ✅ FIX: Відступи - повний перенос
    if (figmaStyles.paddingLeft || figmaStyles.paddingRight || figmaStyles.paddingTop || figmaStyles.paddingBottom) {
      const padding = [
        figmaStyles.paddingTop || 0,
        figmaStyles.paddingRight || 0,
        figmaStyles.paddingBottom || 0,
        figmaStyles.paddingLeft || 0
      ].map(p => `${p}px`).join(' ');
      cssRules.padding = padding;
      if (isExactMatch) console.log(`   ✅ padding: ${padding}`);
    }
    
    if (figmaStyles.marginLeft || figmaStyles.marginRight || figmaStyles.marginTop || figmaStyles.marginBottom) {
      const margin = [
        figmaStyles.marginTop || 0,
        figmaStyles.marginRight || 0,
        figmaStyles.marginBottom || 0,
        figmaStyles.marginLeft || 0
      ].map(m => `${m}px`).join(' ');
      cssRules.margin = margin;
      if (isExactMatch) console.log(`   ✅ margin: ${margin}`);
    }
    
    // ✅ FIX: Позиціонування - повний перенос
    if (figmaStyles.position) {
      cssRules.position = figmaStyles.position;
      if (isExactMatch) console.log(`   ✅ position: ${figmaStyles.position}`);
    }
    if (figmaStyles.top !== undefined) {
      cssRules.top = `${figmaStyles.top}px`;
      if (isExactMatch) console.log(`   ✅ top: ${figmaStyles.top}px`);
    }
    if (figmaStyles.right !== undefined) {
      cssRules.right = `${figmaStyles.right}px`;
      if (isExactMatch) console.log(`   ✅ right: ${figmaStyles.right}px`);
    }
    if (figmaStyles.bottom !== undefined) {
      cssRules.bottom = `${figmaStyles.bottom}px`;
      if (isExactMatch) console.log(`   ✅ bottom: ${figmaStyles.bottom}px`);
    }
    if (figmaStyles.left !== undefined) {
      cssRules.left = `${figmaStyles.left}px`;
      if (isExactMatch) console.log(`   ✅ left: ${figmaStyles.left}px`);
    }
    
    // ✅ FIX: Радіус кутів - повний перенос
    if (figmaStyles.borderRadius) {
      cssRules['border-radius'] = `${figmaStyles.borderRadius}px`;
      if (isExactMatch) console.log(`   ✅ border-radius: ${figmaStyles.borderRadius}px`);
    }
    
    // ✅ FIX: Тіні - повний перенос
    if (figmaStyles.boxShadow) {
      cssRules['box-shadow'] = figmaStyles.boxShadow;
      if (isExactMatch) console.log(`   ✅ box-shadow: ${figmaStyles.boxShadow}`);
    }
    if (figmaStyles.textShadow) {
      cssRules['text-shadow'] = figmaStyles.textShadow;
      if (isExactMatch) console.log(`   ✅ text-shadow: ${figmaStyles.textShadow}`);
    }
    
    // ✅ FIX: Фон - повний перенос
    if (figmaStyles.backgroundColor) {
      cssRules['background-color'] = figmaStyles.backgroundColor;
      if (isExactMatch) console.log(`   ✅ background-color: ${figmaStyles.backgroundColor}`);
    }
    if (figmaStyles.backgroundImage) {
      cssRules['background-image'] = figmaStyles.backgroundImage;
      if (isExactMatch) console.log(`   ✅ background-image: ${figmaStyles.backgroundImage}`);
    }
    if (figmaStyles.backgroundSize) {
      cssRules['background-size'] = figmaStyles.backgroundSize;
      if (isExactMatch) console.log(`   ✅ background-size: ${figmaStyles.backgroundSize}`);
    }
    if (figmaStyles.backgroundPosition) {
      cssRules['background-position'] = figmaStyles.backgroundPosition;
      if (isExactMatch) console.log(`   ✅ background-position: ${figmaStyles.backgroundPosition}`);
    }
    
    // ✅ FIX: Бордери - повний перенос
    if (figmaStyles.borderWidth) {
      cssRules['border-width'] = `${figmaStyles.borderWidth}px`;
      if (isExactMatch) console.log(`   ✅ border-width: ${figmaStyles.borderWidth}px`);
    }
    if (figmaStyles.borderColor) {
      cssRules['border-color'] = figmaStyles.borderColor;
      if (isExactMatch) console.log(`   ✅ border-color: ${figmaStyles.borderColor}`);
    }
    if (figmaStyles.borderStyle) {
      cssRules['border-style'] = figmaStyles.borderStyle;
      if (isExactMatch) console.log(`   ✅ border-style: ${figmaStyles.borderStyle}`);
    }
    
    // ✅ FIX: Flexbox - повний перенос
    if (figmaStyles.display) {
      cssRules.display = figmaStyles.display;
      if (isExactMatch) console.log(`   ✅ display: ${figmaStyles.display}`);
    }
    if (figmaStyles.flexDirection) {
      cssRules['flex-direction'] = figmaStyles.flexDirection;
      if (isExactMatch) console.log(`   ✅ flex-direction: ${figmaStyles.flexDirection}`);
    }
    if (figmaStyles.justifyContent) {
      cssRules['justify-content'] = figmaStyles.justifyContent;
      if (isExactMatch) console.log(`   ✅ justify-content: ${figmaStyles.justifyContent}`);
    }
    if (figmaStyles.alignItems) {
      cssRules['align-items'] = figmaStyles.alignItems;
      if (isExactMatch) console.log(`   ✅ align-items: ${figmaStyles.alignItems}`);
    }
    if (figmaStyles.flexWrap) {
      cssRules['flex-wrap'] = figmaStyles.flexWrap;
      if (isExactMatch) console.log(`   ✅ flex-wrap: ${figmaStyles.flexWrap}`);
    }
    if (figmaStyles.flexGrow) {
      cssRules['flex-grow'] = figmaStyles.flexGrow;
      if (isExactMatch) console.log(`   ✅ flex-grow: ${figmaStyles.flexGrow}`);
    }
    if (figmaStyles.flexShrink) {
      cssRules['flex-shrink'] = figmaStyles.flexShrink;
      if (isExactMatch) console.log(`   ✅ flex-shrink: ${figmaStyles.flexShrink}`);
    }
    if (figmaStyles.flexBasis) {
      cssRules['flex-basis'] = `${figmaStyles.flexBasis}px`;
      if (isExactMatch) console.log(`   ✅ flex-basis: ${figmaStyles.flexBasis}px`);
    }
    
    if (isExactMatch) {
      console.log(`🎯 ВСЬОГО ПЕРЕНЕСЕНО ${Object.keys(cssRules).length} CSS ВЛАСТИВОСТЕЙ!`);
    }
    
    // Додаємо коментар з рівнем впевненості
    if (this.options.includeComments) {
      cssRules['/* confidence'] = `${(confidence * 100).toFixed(1)}% */`;
    }
    
    return cssRules;
  }

  /**
   * ✅ FIX: Розрахунок точності співставлення
   */
  calculateMatchingAccuracy(matchingResults) {
    if (!matchingResults || matchingResults.length === 0) return 0;
    
    const totalConfidence = matchingResults.reduce((sum, match) => sum + match.confidence, 0);
    return totalConfidence / matchingResults.length;
  }

  /**
   * ✅ FIX: Генерація CSS селектора для HTML елемента
   */
  generateSelector(htmlElement) {
    if (!htmlElement) return '';
    
    // Якщо є клас, використовуємо його
    if (htmlElement.className && htmlElement.className.trim()) {
      // ✅ FIX: Очищаємо className від подвійних крапок
      const cleanClassName = htmlElement.className.trim().replace(/\.+/g, '.');
      const classes = cleanClassName.split(/\s+/).filter(cls => cls && cls !== '.');
      
      if (classes.length === 0) {
        return htmlElement.tagName.toLowerCase();
      }
      
      // ✅ FIX: Генеруємо правильні селектори
      if (classes.length === 1) {
        return '.' + classes[0].replace(/^\.+/, '');
      } else {
        return '.' + classes.map(cls => cls.replace(/^\.+/, '')).join(' .');
      }
    }
    
    // Якщо є ID, використовуємо його
    if (htmlElement.id) {
      return '#' + htmlElement.id;
    }
    
    // Інакше використовуємо тег
    return htmlElement.tagName.toLowerCase();
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
   * ✅ FIX: Головна функція генерації CSS з розумним співставленням
   */
  generateCSS(figmaData, htmlData, preMatchedElements = null) {
    this.reset();

    console.log('🧠 Початок розумної генерації CSS...');

    // ✅ FIX: Розумне співставлення елементів
    const matches = preMatchedElements || this.performSmartMatching(figmaData, htmlData);

    console.log(`🎯 Smart matching found ${matches.size} element pairs`);

    // ✅ FIX: Генерація базових стилів
    if (this.options.includeReset) {
      this.generateReset();
    }

    // ✅ FIX: Генерація CSS змінних
    this.generateVariables();

    // ✅ FIX: Обробка співставлених елементів
    matches.forEach((htmlElementId, figmaElementId) => {
      const figmaElement = figmaData?.hierarchy?.get(figmaElementId);
      const htmlElement = htmlData?.hierarchy?.get(htmlElementId);

      if (figmaElement && htmlElement) {
        this.generateElementStyles(figmaElement, htmlElement, htmlElementId);
      }
    });

    // ✅ FIX: Обробка неспівставлених HTML елементів
    this.generateUnmatchedElementsCSS(htmlData, matches);

    // ✅ FIX: Генерація адаптивних стилів
    if (this.options.generateResponsive) {
      this.generateResponsiveStyles();
    }

    // ✅ FIX: Розрахунок статистики
    this.calculateStatistics(matches, figmaData, htmlData);

    return this.compileCSS();
  }

  /**
   * ✅ FIX: Розумне співставлення Figma та HTML елементів
   */
  performSmartMatching(figmaData, htmlData) {
    const matches = new Map();
    const figmaElements = Array.from(figmaData.hierarchy.values());
    const htmlElements = Array.from(htmlData.hierarchy.values());

    console.log(
      `🔍 Matching ${figmaElements.length} Figma elements with ${htmlElements.length} HTML elements`
    );

    // ✅ FIX: Створення матриці схожості
    const similarityMatrix = this.createSimilarityMatrix(figmaElements, htmlElements);

    // ✅ FIX: Пошук найкращих пар
    const usedHtmlElements = new Set();

    figmaElements.forEach((figmaElement, figmaIndex) => {
      let bestMatch = null;
      let bestScore = 0;

      htmlElements.forEach((htmlElement, htmlIndex) => {
        if (usedHtmlElements.has(htmlIndex)) return;

        const score = similarityMatrix[figmaIndex][htmlIndex];
        if (score > bestScore && score >= this.options.matchingThreshold) {
          bestScore = score;
          bestMatch = {htmlElement, htmlIndex, score};
        }
      });

      if (bestMatch) {
        matches.set(figmaElement.id, {
          htmlElementId: bestMatch.htmlElement.id,
          confidence: bestMatch.score,
          strategy: 'smart-matching',
          figmaElement: figmaElement,
          htmlElement: bestMatch.htmlElement
        });
        usedHtmlElements.add(bestMatch.htmlIndex);

        console.log(
          `✅ Matched: "${figmaElement.name}" → ".${this.getElementClassName(bestMatch.htmlElement)}" (${(bestMatch.score * 100).toFixed(1)}%)`
        );
      } else {
        console.log(`❌ No match found for Figma element: "${figmaElement.name}"`);
      }
    });

    return matches;
  }

  /**
   * ✅ FIX: Створення матриці схожості між елементами
   */
  createSimilarityMatrix(figmaElements, htmlElements) {
    const matrix = [];

    figmaElements.forEach(figmaElement => {
      const row = [];
      htmlElements.forEach(htmlElement => {
        const similarity = this.calculateElementSimilarity(figmaElement, htmlElement);
        row.push(similarity);
      });
      matrix.push(row);
    });

    return matrix;
  }

  /**
   * ✅ FIX: Розрахунок схожості між Figma та HTML елементом
   */
  calculateElementSimilarity(figmaElement, htmlElement) {
    let totalScore = 0;

    // ✅ FIX: 1. Схожість за текстовим контентом
    const textScore = this.calculateTextSimilarity(figmaElement, htmlElement);
    totalScore += textScore * this.matchingWeights.textContent;

    // ✅ FIX: 2. Семантична схожість
    const semanticScore = this.calculateSemanticSimilarity(figmaElement, htmlElement);
    totalScore += semanticScore * this.matchingWeights.semanticRole;

    // ✅ FIX: 3. Ієрархічна схожість
    const hierarchyScore = this.calculateHierarchySimilarity(figmaElement, htmlElement);
    totalScore += hierarchyScore * this.matchingWeights.hierarchy;

    // ✅ FIX: 4. Схожість назв
    const nameScore = this.calculateNameSimilarity(figmaElement, htmlElement);
    totalScore += nameScore * this.matchingWeights.namesimilarity;

    return Math.min(totalScore, 1.0);
  }

  /**
   * ✅ FIX: Схожість за текстовим контентом
   */
  calculateTextSimilarity(figmaElement, htmlElement) {
    const figmaText = this.extractTextContent(figmaElement);
    const htmlText = this.extractTextContent(htmlElement);

    if (!figmaText && !htmlText) return 0.5; // Обидва без тексту
    if (!figmaText || !htmlText) return 0; // Один без тексту

    const normalizedFigma = this.normalizeText(figmaText);
    const normalizedHtml = this.normalizeText(htmlText);

    if (normalizedFigma === normalizedHtml) return 1.0; // Точний збіг

    // ✅ FIX: Часткове співпадіння
    const similarity = this.calculateStringSimilarity(normalizedFigma, normalizedHtml);
    return similarity;
  }

  /**
   * ✅ FIX: Семантична схожість
   */
  calculateSemanticSimilarity(figmaElement, htmlElement) {
    const figmaRole = this.determineFigmaSemanticRole(figmaElement);
    const htmlRole = this.determineHtmlSemanticRole(htmlElement);

    // ✅ FIX: Прямий збіг ролей
    if (figmaRole === htmlRole) return 1.0;

    // ✅ FIX: Спорідненість ролей
    return this.calculateRoleAffinity(figmaRole, htmlRole);
  }

  /**
   * ✅ FIX: Ієрархічна схожість
   */
  calculateHierarchySimilarity(figmaElement, htmlElement) {
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

  /**
   * ✅ FIX: Схожість назв/класів
   */
  calculateNameSimilarity(figmaElement, htmlElement) {
    const figmaName = this.normalizeText(figmaElement.name || '');
    const htmlTag = htmlElement.tagName || '';

    if (!figmaName) return 0;

    // ✅ FIX: Перевірка схожості з класами HTML
    let bestSimilarity = 0;

    htmlElement.classes?.forEach(className => {
      const similarity = this.calculateStringSimilarity(figmaName, this.normalizeText(className));
      bestSimilarity = Math.max(bestSimilarity, similarity);
    });

    // ✅ FIX: Перевірка схожості з тегом HTML
    const tagSimilarity = this.calculateStringSimilarity(figmaName, htmlTag);
    bestSimilarity = Math.max(bestSimilarity, tagSimilarity);

    return bestSimilarity;
  }

  /**
   * ✅ FIX: Генерація стилів для співставленого елемента
   */
  generateElementStyles(figmaElement, htmlElement, matchInfo) {
    const className = this.getElementClassName(htmlElement);
    if (!className) return;

    const styles = new Map();

    // ✅ FIX: Витягуємо стилі з Figma елемента
    this.extractFigmaStylesToCSS(figmaElement, styles);

    // ✅ FIX: Зберігаємо правило
    this.cssRules.set(className, styles);

    // ✅ FIX: Зберігаємо інформацію про співставлення
    this.matchingResults.set(className, {
      figmaId: figmaElement.id,
      figmaName: figmaElement.name,
      figmaType: figmaElement.type,
      htmlTag: htmlElement.tagName,
      confidence: matchInfo.confidence,
      strategy: matchInfo.strategy
    });

    this.statistics.totalRules++;
    this.statistics.matchedElements++;

    console.log(
      `📝 Згенеровано стилі для .${className} з «${figmaElement.name}» (${figmaElement.type})`
    );
  }

  /**
   * ✅ FIX: Витягування реальних стилів з Figma
   */
  extractFigmaStylesToCSS(figmaElement, styles) {
    // ✅ FIX: Typography (для TEXT елементів)
    if (figmaElement.type === 'TEXT' || figmaElement.characters) {
      this.extractTypographyStyles(figmaElement, styles);
    }

    // ✅ FIX: Colors і Fills
    this.extractColorStyles(figmaElement, styles);

    // ✅ FIX: Layout стилі
    this.extractLayoutStyles(figmaElement, styles);

    // ✅ FIX: Spacing стилі
    this.extractSpacingStyles(figmaElement, styles);

    // ✅ FIX: Border стилі
    this.extractBorderStyles(figmaElement, styles);

    // ✅ FIX: Effects (тіні, розмиття)
    this.extractEffectStyles(figmaElement, styles);

    // ✅ FIX: Size стилі
    this.extractSizeStyles(figmaElement, styles);
  }

  /**
   * ✅ FIX: Витягування typography стилів
   */
  extractTypographyStyles(figmaElement, styles) {
    if (figmaElement.style) {
      const typo = figmaElement.style;

      if (typo.fontFamily) styles.set('font-family', `'${typo.fontFamily}', sans-serif`);
      if (typo.fontSize) styles.set('font-size', `${typo.fontSize}px`);
      if (typo.fontWeight) styles.set('font-weight', typo.fontWeight.toString());
      if (typo.lineHeightPx) styles.set('line-height', `${typo.lineHeightPx}px`);
      if (typo.letterSpacing) styles.set('letter-spacing', `${typo.letterSpacing}px`);

      if (typo.textAlignHorizontal) {
        const align = typo.textAlignHorizontal.toLowerCase();
        styles.set(
          'text-align',
          align === 'center' ? 'center' : align === 'right' ? 'right' : 'left'
        );
      }

      if (typo.textDecoration && typo.textDecoration !== 'NONE') {
        styles.set('text-decoration', typo.textDecoration.toLowerCase());
      }
    }
  }

  /**
   * ✅ FIX: Витягування color стилів
   */
  extractColorStyles(figmaElement, styles) {
    if (figmaElement.fills && figmaElement.fills.length > 0) {
      const primaryFill = figmaElement.fills[0];

      if (primaryFill.type === 'SOLID' && primaryFill.color) {
        const colorHex = this.rgbToHex(primaryFill.color);

        if (figmaElement.type === 'TEXT') {
          styles.set('color', colorHex);
        } else {
          styles.set('background-color', colorHex);
        }

        if (primaryFill.opacity !== undefined && primaryFill.opacity < 1) {
          styles.set('opacity', primaryFill.opacity.toString());
        }
      }
    }
  }

  /**
   * ✅ FIX: Витягування layout стилів
   */
  extractLayoutStyles(figmaElement, styles) {
    if (figmaElement.layoutMode) {
      styles.set('display', 'flex');
      styles.set('flex-direction', figmaElement.layoutMode === 'HORIZONTAL' ? 'row' : 'column');

      if (figmaElement.primaryAxisAlignItems) {
        styles.set('justify-content', this.mapFigmaAlignment(figmaElement.primaryAxisAlignItems));
      }

      if (figmaElement.counterAxisAlignItems) {
        styles.set('align-items', this.mapFigmaAlignment(figmaElement.counterAxisAlignItems));
      }

      if (figmaElement.itemSpacing) {
        styles.set('gap', `${figmaElement.itemSpacing}px`);
      }
    }
  }

  /**
   * ✅ FIX: Витягування spacing стилів
   */
  extractSpacingStyles(figmaElement, styles) {
    const paddings = [
      figmaElement.paddingTop || 0,
      figmaElement.paddingRight || 0,
      figmaElement.paddingBottom || 0,
      figmaElement.paddingLeft || 0
    ];

    if (paddings.some(p => p > 0)) {
      if (paddings.every(p => p === paddings[0])) {
        styles.set('padding', `${paddings[0]}px`);
      } else {
        styles.set('padding', `${paddings[0]}px ${paddings[1]}px ${paddings[2]}px ${paddings[3]}px`);
      }
    }
  }

  /**
   * ✅ FIX: Витягування border стилів
   */
  extractBorderStyles(figmaElement, styles) {
    if (figmaElement.strokeWeight && figmaElement.strokeWeight > 0) {
      styles.set('border-width', `${figmaElement.strokeWeight}px`);
      styles.set('border-style', 'solid');

      if (figmaElement.strokes && figmaElement.strokes.length > 0) {
        const stroke = figmaElement.strokes[0];
        if (stroke.type === 'SOLID' && stroke.color) {
          styles.set('border-color', this.rgbToHex(stroke.color));
        }
      }
    }

    if (figmaElement.cornerRadius) {
      styles.set('border-radius', `${figmaElement.cornerRadius}px`);
    }
  }

  /**
   * ✅ FIX: Витягування effect стилів
   */
  extractEffectStyles(figmaElement, styles) {
    if (figmaElement.effects && figmaElement.effects.length > 0) {
      const shadows = figmaElement.effects
        .filter(effect => effect.type === 'DROP_SHADOW' && effect.visible !== false)
        .map(effect => {
          const x = effect.offset?.x || 0;
          const y = effect.offset?.y || 0;
          const blur = effect.radius || 0;
          const spread = effect.spread || 0;
          const color = effect.color ? this.rgbToHex(effect.color) : '#000000';
          return `${x}px ${y}px ${blur}px ${spread}px ${color}`;
        });

      if (shadows.length > 0) {
        styles.set('box-shadow', shadows.join(', '));
      }
    }
  }

  /**
   * ✅ FIX: Витягування size стилів
   */
  extractSizeStyles(figmaElement, styles) {
    if (figmaElement.absoluteBoundingBox) {
      const {width, height} = figmaElement.absoluteBoundingBox;

      // ✅ FIX: Розумне встановлення розмірів
      if (width && width < 2000) {
        // Уникаємо занадто великих розмірів
        styles.set('width', `${width}px`);
      }

      if (height && height < 2000) {
        styles.set('height', `${height}px`);
      }
    }
  }

  /**
   * ✅ FIX: Генерація CSS для неспівставлених елементів
   */
  generateUnmatchedElementsCSS(htmlData, matches) {
    if (!htmlData?.hierarchy) return;

    const matchedHtmlIds = new Set();
    matches.forEach(match => matchedHtmlIds.add(match.htmlElementId));

    htmlData.hierarchy.forEach((htmlElement, htmlId) => {
      if (!matchedHtmlIds.has(htmlId) && htmlElement.classes && htmlElement.classes.length > 0) {
        htmlElement.classes.forEach(className => {
          if (!this.cssRules.has(className)) {
            this.cssRules.set(className, new Map());
            this.unmatchedElements.add(className);
            this.statistics.unmatchedElements++;
            this.statistics.totalRules++;
          }
        });
      }
    });
  }

  /**
   * ✅ FIX: Допоміжні методи
   */
  extractTextContent(element) {
    if (element.characters) return element.characters;
    if (element.textContent) return element.textContent;
    if (element.content?.text) return element.content.text;
    return null;
  }

  normalizeText(text) {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  calculateStringSimilarity(str1, str2) {
    if (str1 === str2) return 1.0;
    if (!str1 || !str2) return 0;

    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = Array(str2.length + 1)
      .fill()
      .map(() => Array(str1.length + 1).fill(0));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        matrix[j][i] =
          str1[i - 1] === str2[j - 1]
            ? matrix[j - 1][i - 1]
            : Math.min(matrix[j - 1][i] + 1, matrix[j][i - 1] + 1, matrix[j - 1][i - 1] + 1);
      }
    }

    return matrix[str2.length][str1.length];
  }

  determineFigmaSemanticRole(element) {
    const name = (element.name || '').toLowerCase();
    const type = element.type;

    if (type === 'TEXT') {
      if (
        name.includes('title') ||
        name.includes('heading') ||
        name.includes('h1') ||
        name.includes('h2')
      )
        return 'heading';
      if (name.includes('button') || name.includes('btn')) return 'button';
      if (name.includes('link') || name.includes('anchor')) return 'link';
      return 'text';
    }

    if (type === 'FRAME' || type === 'GROUP') {
      if (name.includes('header') || name.includes('head')) return 'header';
      if (name.includes('footer') || name.includes('foot')) return 'footer';
      if (name.includes('nav') || name.includes('menu')) return 'navigation';
      if (name.includes('main') || name.includes('content')) return 'main';
      if (name.includes('card') || name.includes('item')) return 'card';
      if (name.includes('button') || name.includes('btn')) return 'button';
      return 'container';
    }

    if (type === 'RECTANGLE' || type === 'ELLIPSE') {
      if (name.includes('button') || name.includes('btn')) return 'button';
      if (name.includes('image') || name.includes('img') || name.includes('photo')) return 'image';
      return 'shape';
    }

    if (type === 'COMPONENT' || type === 'INSTANCE') {
      if (name.includes('button')) return 'button';
      if (name.includes('card')) return 'card';
      return 'component';
    }

    return 'generic';
  }

  determineHtmlSemanticRole(element) {
    const tag = element.tagName?.toLowerCase();
    const classes = (element.classes || []).join(' ').toLowerCase();

    // ✅ FIX: За тегом
    if (tag === 'button') return 'button';
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) return 'heading';
    if (tag === 'a') return 'link';
    if (tag === 'img') return 'image';
    if (tag === 'header') return 'header';
    if (tag === 'footer') return 'footer';
    if (tag === 'nav') return 'navigation';
    if (tag === 'main') return 'main';
    if (tag === 'section' || tag === 'article') return 'container';

    // ✅ FIX: За класами
    if (classes.includes('button') || classes.includes('btn')) return 'button';
    if (classes.includes('header') || classes.includes('head')) return 'header';
    if (classes.includes('footer') || classes.includes('foot')) return 'footer';
    if (classes.includes('nav') || classes.includes('menu')) return 'navigation';
    if (classes.includes('main') || classes.includes('content')) return 'main';
    if (classes.includes('card') || classes.includes('item')) return 'card';
    if (classes.includes('title') || classes.includes('heading')) return 'heading';

    return tag === 'div' || tag === 'span' ? 'container' : 'generic';
  }

  calculateRoleAffinity(role1, role2) {
    const affinityMap = {
      heading: {text: 0.8, title: 0.9, container: 0.3},
      button: {link: 0.7, container: 0.4, shape: 0.6},
      text: {heading: 0.8, container: 0.5},
      container: {card: 0.8, main: 0.7, header: 0.6, footer: 0.6},
      navigation: {header: 0.8, container: 0.6},
      image: {shape: 0.7, container: 0.4}
    };

    return affinityMap[role1]?.[role2] || 0;
  }

  getElementClassName(htmlElement) {
    if (htmlElement.classes && htmlElement.classes.length > 0) {
      return htmlElement.classes[0];
    }
    return htmlElement.tagName?.toLowerCase() || null;
  }


  mapFigmaAlignment(alignment) {
    const alignmentMap = {
      MIN: 'flex-start',
      CENTER: 'center',
      MAX: 'flex-end',
      SPACE_BETWEEN: 'space-between',
      SPACE_AROUND: 'space-around'
    };
    return alignmentMap[alignment] || 'flex-start';
  }

  /**
   * ✅ FIX: Генерація базових стилів
   */
  generateReset() {
    const resetStyles = new Map([
      ['margin', '0'],
      ['padding', '0'],
      ['box-sizing', 'border-box']
    ]);

    this.cssRules.set('*', resetStyles);
    this.cssRules.set('*::before', resetStyles);
    this.cssRules.set('*::after', resetStyles);

    const bodyStyles = new Map([
      ['font-family', '-apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif'],
      ['line-height', '1.5'],
      ['color', 'var(--text-color)'],
      ['background-color', 'var(--background-color)']
    ]);

    this.cssRules.set('body', bodyStyles);
    this.statistics.totalRules += 4;
  }

  generateVariables() {
    // ✅ FIX: Базові змінні
    this.variables.set('--primary-color', '#007ACC');
    this.variables.set('--secondary-color', '#6c757d');
    this.variables.set('--text-color', '#212529');
    this.variables.set('--background-color', '#ffffff');
    this.variables.set('--border-color', '#dee2e6');
    this.variables.set('--shadow-color', 'rgba(0, 0, 0, 0.1)');

    // ✅ FIX: Spacing змінні
    this.variables.set('--spacing-xs', '0.25rem');
    this.variables.set('--spacing-sm', '0.5rem');
    this.variables.set('--spacing-md', '1rem');
    this.variables.set('--spacing-lg', '1.5rem');
    this.variables.set('--spacing-xl', '2rem');

    // ✅ FIX: Breakpoints
    this.variables.set('--breakpoint-sm', '576px');
    this.variables.set('--breakpoint-md', '768px');
    this.variables.set('--breakpoint-lg', '992px');
    this.variables.set('--breakpoint-xl', '1200px');
  }

  generateResponsiveStyles() {
    const mediaQueries = [
      '@media (max-width: 768px)',
      '@media (min-width: 769px) and (max-width: 1024px)',
      '@media (min-width: 1025px)'
    ];

    mediaQueries.forEach(mq => {
      this.mediaQueries.set(mq, new Map());
    });

    // ✅ FIX: Базові адаптивні стилі
    const mobileStyles = new Map([
      ['padding', 'var(--spacing-sm)'],
      ['font-size', '14px']
    ]);

    this.mediaQueries.get('@media (max-width: 768px)').set('container', mobileStyles);
  }

  /**
   * ✅ FIX: Компіляція фінального CSS
   */
  compileCSS() {
    let css = '';

    // ✅ FIX: Заголовок
    css += '/* ✅ CSS згенеровано Smart CSS Generator v5.0 */\n';
    css += `/* Згенеровано: ${this.statistics.generatedAt} */\n`;
    css += `/* Зіставлено: ${this.statistics.matchedElements} | Не зіставлено: ${this.statistics.unmatchedElements} */\n`;
    css += `/* Точність: ${(this.statistics.matchingAccuracy * 100).toFixed(1)}% */\n\n`;

    // ✅ FIX: CSS змінні
    if (this.variables.size > 0) {
      css += ':root {\n';
      this.variables.forEach((value, variable) => {
        css += `  ${variable}: ${value};\n`;
      });
      css += '}\n\n';
    }

    // ✅ FIX: CSS правила з детальними коментарями
    this.cssRules.forEach((styles, selector) => {
      const matchInfo = this.matchingResults.get(selector);

      if (this.options.includeComments) {
        if (matchInfo) {
          css += `/* ✅ MATCHED: Figma "${matchInfo.figmaName}" (${matchInfo.figmaType}) → HTML .${selector} */\n`;
          css += `/* Confidence: ${(matchInfo.confidence * 100).toFixed(1)}% | Strategy: ${matchInfo.strategy} */\n`;
        } else if (this.unmatchedElements.has(selector)) {
          css += `/* ❌ UNMATCHED: No Figma element found for .${selector} */\n`;
        }
      }

      css += `.${selector} {\n`;

      if (styles.size > 0) {
        styles.forEach((value, property) => {
          css += `  ${property}: ${value};\n`;
        });
      }

      css += '}\n\n';
    });

    // ✅ FIX: Адаптивні стилі
    if (this.mediaQueries.size > 0) {
      css += '/* ✅ RESPONSIVE STYLES */\n';
      this.mediaQueries.forEach((rules, mediaQuery) => {
        if (rules.size > 0) {
          css += `${mediaQuery} {\n`;
          rules.forEach((styles, selector) => {
            css += `  .${selector} {\n`;
            styles.forEach((value, property) => {
              css += `    ${property}: ${value};\n`;
            });
            css += '  }\n';
          });
          css += '}\n\n';
        }
      });
    }

    return this.options.optimizeCSS ? this.optimizeCSS(css) : css;
  }

  calculateStatistics(matches, figmaData, htmlData) {
    const totalFigmaElements = figmaData?.hierarchy?.size || 0;
    const totalHtmlElements = htmlData?.hierarchy?.size || 0;

    this.statistics.matchingAccuracy =
      totalFigmaElements > 0 ? matches.size / totalFigmaElements : 0;

    console.log('📊 Matching Statistics:');
    console.log(`   Total Figma elements: ${totalFigmaElements}`);
    console.log(`   Total HTML elements: ${totalHtmlElements}`);
    console.log(`   Successful matches: ${matches.size}`);
    console.log(`   Matching accuracy: ${(this.statistics.matchingAccuracy * 100).toFixed(1)}%`);
  }

  optimizeCSS(css) {
    return css
      .replace(/\n\s*\n/g, '\n')
      .replace(/\s*{\s*/g, ' {\n  ')
      .replace(/;\s*}/g, ';\n}')
      .trim();
  }

  reset() {
    this.cssRules.clear();
    this.variables.clear();
    this.mediaQueries.clear();
    this.matchingResults.clear();
    this.unmatchedElements.clear();

    this.statistics = {
      totalRules: 0,
      matchedElements: 0,
      unmatchedElements: 0,
      matchingAccuracy: 0,
      generatedAt: new Date().toISOString()
    };
  }

  getStatistics() {
    return {...this.statistics};
  }
}

module.exports = SmartCSSGenerator;
