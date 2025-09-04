/**
 * @module FlexboxGridGenerator
 * @description Оптимізований генератор Flexbox та Grid макетів
 * @author Ukrainian Developer
 * @version 2.0.0
 */

class FlexboxGridGenerator {
  constructor(options = {}) {
    this.options = {
      preferGrid: false, // Пріоритет Grid над Flexbox
      useGap: true, // Використання gap замість margins
      generateFallbacks: true,
      optimizeForBrowser: true,
      autoPrefix: false,
      ...options
    };

    // Кеш для оптимізації
    this.layoutCache = new Map();
    this.patternCache = new Map();
  }

  /**
   * Автоматичне визначення оптимального макету
   * @param {Object} element - Елемент
   * @param {Object} figmaLayout - Макет з Figma
   * @returns {Object} Оптимізований макет
   */
  generateOptimalLayout(element, figmaLayout) {
    // Перевірка кешу
    const cacheKey = this.getCacheKey(element);
    if (this.layoutCache.has(cacheKey)) {
      return this.layoutCache.get(cacheKey);
    }

    const analysis = this.analyzeLayoutRequirements(element, figmaLayout);
    let layout;

    // Вибір оптимального типу макету
    if (analysis.requiresGrid || (this.options.preferGrid && analysis.canUseGrid)) {
      layout = this.generateGridLayout(element, figmaLayout, analysis);
    } else if (analysis.requiresFlex) {
      layout = this.generateFlexLayout(element, figmaLayout, analysis);
    } else {
      layout = this.generateHybridLayout(element, figmaLayout, analysis);
    }

    // Оптимізація
    if (this.options.optimizeForBrowser) {
      layout = this.optimizeForBrowserSupport(layout);
    }

    // Збереження в кеш
    this.layoutCache.set(cacheKey, layout);
    return layout;
  }

  /**
   * Аналіз вимог до макету
   * @param {Object} element - Елемент
   * @param {Object} figmaLayout - Макет з Figma
   * @returns {Object} Аналіз вимог
   */
  analyzeLayoutRequirements(element, figmaLayout) {
    const analysis = {
      requiresGrid: false,
      requiresFlex: false,
      canUseGrid: true,
      canUseFlex: true,
      hasComplexAlignment: false,
      hasDynamicContent: false,
      needsWrapping: false,
      hasEqualColumns: false,
      hasMasonry: false,
      hasOverlapping: false
    };

    // Перевірка на Grid-специфічні вимоги
    if (figmaLayout.layoutMode === 'GRID' || element.gridTemplateColumns) {
      analysis.requiresGrid = true;
    }

    // Перевірка на необхідність двовимірного макету
    if (this.requiresTwoDimensionalLayout(element, figmaLayout)) {
      analysis.requiresGrid = true;
      analysis.hasComplexAlignment = true;
    }

    // Перевірка на Flex-специфічні вимоги
    if (figmaLayout.layoutMode === 'HORIZONTAL' || figmaLayout.layoutMode === 'VERTICAL') {
      analysis.requiresFlex = true;
    }

    // Аналіз вмісту
    if (element.children) {
      analysis.hasDynamicContent = element.children.some(child => child.isDynamic);
      analysis.needsWrapping = element.children.length > 4;
      analysis.hasEqualColumns = this.checkEqualColumns(element.children);
    }

    // Перевірка на masonry макет
    if (element.layoutType === 'masonry' || this.detectMasonryPattern(element)) {
      analysis.hasMasonry = true;
      analysis.requiresGrid = true;
    }

    // Перевірка на перекриття елементів
    if (this.hasOverlappingElements(element, figmaLayout)) {
      analysis.hasOverlapping = true;
      analysis.requiresGrid = true;
    }

    return analysis;
  }

  /**
   * Генерація Grid макету
   * @param {Object} element - Елемент
   * @param {Object} figmaLayout - Макет з Figma
   * @param {Object} analysis - Аналіз вимог
   * @returns {Object} Grid макет
   */
  generateGridLayout(element, figmaLayout, analysis) {
    const grid = {
      display: 'grid',
      styles: {},
      children: {},
      responsive: {}
    };

    // Визначення колонок
    if (analysis.hasEqualColumns) {
      const columns = this.calculateColumns(element);
      grid.styles.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    } else if (figmaLayout.columns) {
      grid.styles.gridTemplateColumns = this.generateColumnTemplate(figmaLayout.columns);
    } else {
      grid.styles.gridTemplateColumns = this.generateAutoColumns(element);
    }

    // Визначення рядків
    if (figmaLayout.rows) {
      grid.styles.gridTemplateRows = this.generateRowTemplate(figmaLayout.rows);
    } else if (analysis.hasMasonry) {
      grid.styles.gridTemplateRows = 'masonry';
    } else {
      grid.styles.gridAutoRows = 'minmax(min-content, max-content)';
    }

    // Gap
    if (this.options.useGap) {
      const gap = this.calculateGap(figmaLayout);
      grid.styles.gap = gap;
    }

    // Вирівнювання
    grid.styles.alignItems = this.mapAlignment(figmaLayout.alignItems || 'stretch');
    grid.styles.justifyItems = this.mapAlignment(figmaLayout.justifyItems || 'stretch');

    // Grid areas для складних макетів
    if (analysis.hasComplexAlignment) {
      grid.styles.gridTemplateAreas = this.generateGridAreas(element);
      grid.children = this.assignGridAreas(element.children);
    }

    // Auto-placement
    if (element.autoFlow) {
      grid.styles.gridAutoFlow = element.autoFlow;
    }

    // Адаптивність
    grid.responsive = this.generateGridResponsive(grid, element);

    return grid;
  }

  /**
   * Генерація Flexbox макету
   * @param {Object} element - Елемент
   * @param {Object} figmaLayout - Макет з Figma
   * @param {Object} analysis - Аналіз вимог
   * @returns {Object} Flex макет
   */
  generateFlexLayout(element, figmaLayout, analysis) {
    const flex = {
      display: 'flex',
      styles: {},
      children: {},
      responsive: {}
    };

    // Direction
    if (figmaLayout.layoutMode === 'HORIZONTAL') {
      flex.styles.flexDirection = 'row';
    } else if (figmaLayout.layoutMode === 'VERTICAL') {
      flex.styles.flexDirection = 'column';
    } else {
      flex.styles.flexDirection = element.direction || 'row';
    }

    // Wrap
    if (analysis.needsWrapping) {
      flex.styles.flexWrap = 'wrap';
    }

    // Gap або fallback
    if (this.options.useGap) {
      flex.styles.gap = this.calculateGap(figmaLayout);
    } else if (this.options.generateFallbacks) {
      flex.children = this.generateGapFallback(element.children, figmaLayout);
    }

    // Alignment
    flex.styles.alignItems = this.mapFlexAlignment(
      figmaLayout.counterAxisAlignItems || 'center'
    );
    flex.styles.justifyContent = this.mapFlexAlignment(
      figmaLayout.primaryAxisAlignItems || 'flex-start'
    );

    // Flex items властивості
    if (element.children) {
      flex.children = this.generateFlexItemStyles(element.children);
    }

    // Оптимізація для однорядкових макетів
    if (!analysis.needsWrapping) {
      flex.styles.alignContent = 'stretch';
    } else {
      flex.styles.alignContent = this.mapFlexAlignment(
        figmaLayout.alignContent || 'flex-start'
      );
    }

    // Адаптивність
    flex.responsive = this.generateFlexResponsive(flex, element);

    return flex;
  }

  /**
   * Генерація гібридного макету
   * @param {Object} element - Елемент
   * @param {Object} figmaLayout - Макет з Figma
   * @param {Object} analysis - Аналіз вимог
   * @returns {Object} Гібридний макет
   */
  generateHybridLayout(element, figmaLayout, analysis) {
    const hybrid = {
      display: 'flex',
      styles: {},
      children: {},
      responsive: {},
      nested: {}
    };

    // Основний контейнер - Flexbox
    hybrid.styles = this.generateFlexLayout(element, figmaLayout, analysis).styles;

    // Вкладені Grid контейнери для складних секцій
    if (element.children) {
      element.children.forEach((child, index) => {
        if (this.requiresGrid(child)) {
          hybrid.nested[`child-${index}`] = {
            display: 'grid',
            ...this.generateGridLayout(child, child.layout || {}, {})
          };
        }
      });
    }

    return hybrid;
  }

  /**
   * Генерація auto-fit/auto-fill колонок
   * @param {Object} element - Елемент
   * @returns {string} Grid template
   */
  generateAutoColumns(element) {
    const minWidth = this.calculateMinColumnWidth(element);
    const idealWidth = this.calculateIdealColumnWidth(element);
    
    // Використання auto-fit для адаптивності
    if (element.fillContainer) {
      return `repeat(auto-fit, minmax(${minWidth}px, 1fr))`;
    }
    
    // Використання auto-fill для фіксованих розмірів
    return `repeat(auto-fill, minmax(${minWidth}px, ${idealWidth}px))`;
  }

  /**
   * Генерація шаблону колонок
   * @param {Array} columns - Масив колонок
   * @returns {string} CSS grid-template-columns
   */
  generateColumnTemplate(columns) {
    return columns.map(col => {
      if (col.type === 'fixed') {
        return `${col.width}px`;
      } else if (col.type === 'fraction') {
        return `${col.fraction}fr`;
      } else if (col.type === 'auto') {
        return 'auto';
      } else if (col.type === 'minmax') {
        return `minmax(${col.min}px, ${col.max === 'auto' ? '1fr' : col.max + 'px'})`;
      }
      return '1fr';
    }).join(' ');
  }

  /**
   * Генерація шаблону рядків
   * @param {Array} rows - Масив рядків
   * @returns {string} CSS grid-template-rows
   */
  generateRowTemplate(rows) {
    return rows.map(row => {
      if (row.type === 'fixed') {
        return `${row.height}px`;
      } else if (row.type === 'auto') {
        return 'auto';
      } else if (row.type === 'minmax') {
        return `minmax(${row.min}px, ${row.max}px)`;
      }
      return 'auto';
    }).join(' ');
  }

  /**
   * Генерація Grid Areas
   * @param {Object} element - Елемент
   * @returns {string} Grid template areas
   */
  generateGridAreas(element) {
    const areas = [];
    const layout = element.gridLayout || this.detectGridPattern(element);
    
    layout.forEach(row => {
      areas.push(`"${row.join(' ')}"`);
    });
    
    return areas.join('\n    ');
  }

  /**
   * Призначення Grid Areas дітям
   * @param {Array} children - Дочірні елементи
   * @returns {Object} Стилі для дітей
   */
  assignGridAreas(children) {
    const childStyles = {};
    
    children.forEach((child, index) => {
      if (child.gridArea) {
        childStyles[child.id || `child-${index}`] = {
          gridArea: child.gridArea
        };
      } else if (child.gridPosition) {
        childStyles[child.id || `child-${index}`] = {
          gridColumn: child.gridPosition.column,
          gridRow: child.gridPosition.row
        };
      }
    });
    
    return childStyles;
  }

  /**
   * Генерація стилів для Flex items
   * @param {Array} children - Дочірні елементи
   * @returns {Object} Стилі для дітей
   */
  generateFlexItemStyles(children) {
    const itemStyles = {};
    
    children.forEach((child, index) => {
      const styles = {};
      
      // Flex grow/shrink/basis
      if (child.flexGrow !== undefined) {
        styles.flexGrow = child.flexGrow;
      }
      if (child.flexShrink !== undefined) {
        styles.flexShrink = child.flexShrink;
      }
      if (child.flexBasis) {
        styles.flexBasis = child.flexBasis;
      }
      
      // Скорочена властивість flex
      if (child.flex) {
        styles.flex = child.flex;
      } else if (child.fillContainer) {
        styles.flex = '1 1 auto';
      } else if (child.fixedSize) {
        styles.flex = '0 0 auto';
      }
      
      // Вирівнювання
      if (child.alignSelf) {
        styles.alignSelf = this.mapFlexAlignment(child.alignSelf);
      }
      
      // Order
      if (child.order !== undefined) {
        styles.order = child.order;
      }
      
      itemStyles[child.id || `child-${index}`] = styles;
    });
    
    return itemStyles;
  }

  /**
   * Генерація адаптивних стилів для Grid
   * @param {Object} grid - Grid макет
   * @param {Object} element - Елемент
   * @returns {Object} Адаптивні стилі
   */
  generateGridResponsive(grid, element) {
    const responsive = {
      mobile: {},
      tablet: {},
      desktop: {}
    };

    // Mobile: одна колонка
    responsive.mobile = {
      gridTemplateColumns: '1fr',
      gap: this.scaleGap(grid.styles.gap, 0.5)
    };

    // Tablet: дві колонки
    responsive.tablet = {
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: this.scaleGap(grid.styles.gap, 0.75)
    };

    // Desktop: оригінальний макет
    responsive.desktop = { ...grid.styles };

    return responsive;
  }

  /**
   * Генерація адаптивних стилів для Flexbox
   * @param {Object} flex - Flex макет
   * @param {Object} element - Елемент
   * @returns {Object} Адаптивні стилі
   */
  generateFlexResponsive(flex, element) {
    const responsive = {
      mobile: {},
      tablet: {},
      desktop: {}
    };

    // Mobile: вертикальний напрямок
    if (flex.styles.flexDirection === 'row') {
      responsive.mobile = {
        flexDirection: 'column',
        alignItems: 'stretch'
      };
    }

    // Tablet: можливо wrap
    responsive.tablet = {
      flexWrap: 'wrap'
    };

    // Desktop: оригінальний макет
    responsive.desktop = { ...flex.styles };

    return responsive;
  }

  /**
   * Оптимізація для підтримки браузерів
   * @param {Object} layout - Макет
   * @returns {Object} Оптимізований макет
   */
  optimizeForBrowserSupport(layout) {
    const optimized = { ...layout };

    // Fallback для gap у Flexbox
    if (layout.display === 'flex' && layout.styles.gap && this.options.generateFallbacks) {
      optimized.fallback = this.generateFlexGapFallback(layout.styles.gap);
    }

    // Fallback для Grid у старих браузерах
    if (layout.display === 'grid' && this.options.generateFallbacks) {
      optimized.fallback = this.generateGridFallback(layout);
    }

    // Префікси для старих браузерів
    if (this.options.autoPrefix) {
      optimized.prefixed = this.addVendorPrefixes(layout.styles);
    }

    return optimized;
  }

  /**
   * Компіляція в CSS
   * @param {Object} layout - Макет
   * @param {string} selector - CSS селектор
   * @returns {string} CSS код
   */
  compileToCSS(layout, selector = '.container') {
    let css = '';

    // Основні стилі
    css += `${selector} {\n`;
    css += `  display: ${layout.display};\n`;
    
    Object.entries(layout.styles).forEach(([prop, value]) => {
      const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
      css += `  ${cssProp}: ${value};\n`;
    });
    css += '}\n\n';

    // Стилі для дітей
    if (layout.children && Object.keys(layout.children).length > 0) {
      Object.entries(layout.children).forEach(([childId, childStyles]) => {
        css += `${selector} > .${childId} {\n`;
        Object.entries(childStyles).forEach(([prop, value]) => {
          const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
          css += `  ${cssProp}: ${value};\n`;
        });
        css += '}\n\n';
      });
    }

    // Адаптивні стилі
    if (layout.responsive) {
      // Mobile
      if (layout.responsive.mobile) {
        css += '@media (max-width: 767px) {\n';
        css += `  ${selector} {\n`;
        Object.entries(layout.responsive.mobile).forEach(([prop, value]) => {
          const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
          css += `    ${cssProp}: ${value};\n`;
        });
        css += '  }\n}\n\n';
      }

      // Tablet
      if (layout.responsive.tablet) {
        css += '@media (min-width: 768px) and (max-width: 1023px) {\n';
        css += `  ${selector} {\n`;
        Object.entries(layout.responsive.tablet).forEach(([prop, value]) => {
          const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
          css += `    ${cssProp}: ${value};\n`;
        });
        css += '  }\n}\n\n';
      }
    }

    // Fallbacks
    if (layout.fallback) {
      css += `/* Fallback для старих браузерів */\n`;
      css += `@supports not (${layout.display === 'grid' ? 'display: grid' : 'gap: 1px'}) {\n`;
      css += this.compileFallback(layout.fallback, selector);
      css += '}\n\n';
    }

    return css;
  }

  // === Приватні допоміжні методи ===

  /**
   * Генерація ключа кешу
   */
  getCacheKey(element) {
    return JSON.stringify({
      id: element.id,
      type: element.type,
      children: element.children?.length
    });
  }

  /**
   * Перевірка необхідності двовимірного макету
   */
  requiresTwoDimensionalLayout(element, figmaLayout) {
    return element.hasComplexGrid || 
           figmaLayout.requiresPrecisePositioning ||
           (element.children && element.children.some(c => c.spanMultiple));
  }

  /**
   * Перевірка рівних колонок
   */
  checkEqualColumns(children) {
    if (!children || children.length < 2) return false;
    const firstWidth = children[0].width;
    return children.every(child => child.width === firstWidth);
  }

  /**
   * Виявлення masonry патерну
   */
  detectMasonryPattern(element) {
    return element.children && 
           element.children.some(child => child.variableHeight) &&
           element.layoutType?.includes('masonry');
  }

  /**
   * Перевірка перекриття елементів
   */
  hasOverlappingElements(element, figmaLayout) {
    return figmaLayout.hasAbsolutePositioning || 
           element.children?.some(child => child.position === 'absolute');
  }

  /**
   * Розрахунок кількості колонок
   */
  calculateColumns(element) {
    if (element.columns) return element.columns;
    const childCount = element.children?.length || 1;
    if (childCount <= 3) return childCount;
    if (childCount <= 6) return 3;
    if (childCount <= 12) return 4;
    return 6;
  }

  /**
   * Розрахунок gap
   */
  calculateGap(figmaLayout) {
    if (figmaLayout.itemSpacing !== undefined) {
      return `${figmaLayout.itemSpacing}px`;
    }
    return 'var(--gap, 1rem)';
  }

  /**
   * Розрахунок мінімальної ширини колонки
   */
  calculateMinColumnWidth(element) {
    const baseWidth = element.minColumnWidth || 200;
    const padding = element.padding || 0;
    return baseWidth - (padding * 2);
  }

  /**
   * Розрахунок ідеальної ширини колонки
   */
  calculateIdealColumnWidth(element) {
    const containerWidth = element.containerWidth || 1200;
    const columns = this.calculateColumns(element);
    const gap = parseInt(this.calculateGap(element)) || 16;
    return Math.floor((containerWidth - (gap * (columns - 1))) / columns);
  }

  /**
   * Маппінг вирівнювання
   */
  mapAlignment(alignment) {
    const map = {
      'MIN': 'start',
      'CENTER': 'center',
      'MAX': 'end',
      'STRETCH': 'stretch',
      'BASELINE': 'baseline'
    };
    return map[alignment] || alignment;
  }

  /**
   * Маппінг Flex вирівнювання
   */
  mapFlexAlignment(alignment) {
    const map = {
      'MIN': 'flex-start',
      'CENTER': 'center',
      'MAX': 'flex-end',
      'SPACE_BETWEEN': 'space-between',
      'SPACE_AROUND': 'space-around',
      'SPACE_EVENLY': 'space-evenly'
    };
    return map[alignment] || alignment;
  }

  /**
   * Масштабування gap
   */
  scaleGap(gap, scale) {
    if (!gap) return gap;
    const value = parseInt(gap);
    if (isNaN(value)) return gap;
    return `${Math.round(value * scale)}px`;
  }

  /**
   * Генерація fallback для flex gap
   */
  generateFlexGapFallback(gap) {
    const gapValue = parseInt(gap) || 16;
    return {
      '& > *:not(:last-child)': {
        marginRight: `${gapValue}px`,
        marginBottom: `${gapValue}px`
      }
    };
  }

  /**
   * Генерація fallback для Grid
   */
  generateGridFallback(layout) {
    return {
      display: 'flex',
      flexWrap: 'wrap',
      '& > *': {
        flex: '1 1 calc(33.333% - 20px)',
        margin: '10px'
      }
    };
  }

  /**
   * Додавання vendor префіксів
   */
  addVendorPrefixes(styles) {
    const prefixed = {};
    
    Object.entries(styles).forEach(([prop, value]) => {
      if (prop === 'display' && value === 'grid') {
        prefixed['-ms-display'] = 'grid';
      } else if (prop === 'display' && value === 'flex') {
        prefixed['-webkit-display'] = 'flex';
        prefixed['-ms-display'] = 'flexbox';
      }
      prefixed[prop] = value;
    });
    
    return prefixed;
  }

  /**
   * Компіляція fallback
   */
  compileFallback(fallback, selector) {
    let css = `  ${selector} {\n`;
    
    Object.entries(fallback).forEach(([prop, value]) => {
      if (prop.startsWith('&')) {
        // Вкладений селектор
        css += `  }\n  ${selector}${prop.substring(1)} {\n`;
        Object.entries(value).forEach(([p, v]) => {
          css += `    ${p}: ${v};\n`;
        });
      } else {
        css += `    ${prop}: ${value};\n`;
      }
    });
    
    css += '  }\n';
    return css;
  }

  /**
   * Виявлення Grid патерну
   */
  detectGridPattern(element) {
    // Базовий патерн 3x3
    return [
      ['header', 'header', 'header'],
      ['sidebar', 'content', 'aside'],
      ['footer', 'footer', 'footer']
    ];
  }

  /**
   * Перевірка необхідності Grid
   */
  requiresGrid(element) {
    return element.requiresGrid || 
           element.gridTemplateColumns ||
           element.gridTemplateAreas ||
           (element.children && element.children.length > 6);
  }
}

// Експорт модуля
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FlexboxGridGenerator;
}