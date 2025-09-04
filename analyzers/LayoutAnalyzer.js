/**
 * @module LayoutAnalyzer
 * @description Аналіз макетної структури та позиціонування елементів
 * @author Ukrainian Developer
 * @version 2.0.0
 */

class LayoutAnalyzer {
  constructor() {
    this.gridPatterns = new Map();
    this.flexPatterns = new Map();
    this.layoutCache = new WeakMap();
  }

  /**
   * Комплексний аналіз макету
   * @param {Object} element - Елемент для аналізу
   * @returns {Object} Детальний аналіз макету
   */
  analyzeLayout(element) {
    // Перевірка кешу
    if (this.layoutCache.has(element)) {
      return this.layoutCache.get(element);
    }

    const analysis = {
      type: this.detectLayoutType(element),
      positioning: this.analyzePositioning(element),
      dimensions: this.analyzeDimensions(element),
      spacing: this.analyzeSpacing(element),
      alignment: this.analyzeAlignment(element),
      flexProperties: this.analyzeFlexProperties(element),
      gridProperties: this.analyzeGridProperties(element),
      responsive: this.analyzeResponsiveProperties(element),
      zIndex: this.analyzeZIndex(element),
      overflow: this.analyzeOverflow(element)
    };

    // Збереження в кеш
    this.layoutCache.set(element, analysis);
    return analysis;
  }

  /**
   * Визначення типу макету
   * @param {Object} element - Елемент
   * @returns {string} Тип макету
   */
  detectLayoutType(element) {
    const display = element.styles?.layout?.display;
    
    if (display === 'grid' || element.layoutMode === 'GRID') {
      return 'grid';
    }
    
    if (display === 'flex' || element.layoutMode === 'HORIZONTAL' || element.layoutMode === 'VERTICAL') {
      return 'flex';
    }
    
    if (display === 'inline-flex' || display === 'inline-grid') {
      return 'inline-' + display.replace('inline-', '');
    }
    
    if (element.absoluteBoundingBox || element.position === 'absolute') {
      return 'absolute';
    }
    
    if (element.position === 'fixed') {
      return 'fixed';
    }
    
    if (element.position === 'relative') {
      return 'relative';
    }
    
    return 'static';
  }

  /**
   * Аналіз позиціонування
   * @param {Object} element - Елемент
   * @returns {Object} Дані позиціонування
   */
  analyzePositioning(element) {
    const positioning = {
      position: element.position || 'static',
      coordinates: {},
      bounds: null,
      transform: null
    };

    // Координати для абсолютного позиціонування
    if (element.absoluteBoundingBox) {
      positioning.bounds = {
        x: element.absoluteBoundingBox.x,
        y: element.absoluteBoundingBox.y,
        width: element.absoluteBoundingBox.width,
        height: element.absoluteBoundingBox.height,
        right: element.absoluteBoundingBox.x + element.absoluteBoundingBox.width,
        bottom: element.absoluteBoundingBox.y + element.absoluteBoundingBox.height
      };
    }

    // CSS позиціонування
    ['top', 'right', 'bottom', 'left'].forEach(prop => {
      if (element.styles?.[prop]) {
        positioning.coordinates[prop] = element.styles[prop];
      }
    });

    // Трансформації
    if (element.transform || element.styles?.transform) {
      positioning.transform = element.transform || element.styles.transform;
    }

    return positioning;
  }

  /**
   * Аналіз розмірів
   * @param {Object} element - Елемент
   * @returns {Object} Розміри елемента
   */
  analyzeDimensions(element) {
    const dimensions = {
      width: null,
      height: null,
      minWidth: null,
      maxWidth: null,
      minHeight: null,
      maxHeight: null,
      aspectRatio: null,
      isFluid: false,
      isFixed: false
    };

    // Основні розміри
    if (element.absoluteBoundingBox) {
      dimensions.width = element.absoluteBoundingBox.width;
      dimensions.height = element.absoluteBoundingBox.height;
      dimensions.aspectRatio = dimensions.width / dimensions.height;
    } else if (element.styles?.boxModel) {
      dimensions.width = element.styles.boxModel.width;
      dimensions.height = element.styles.boxModel.height;
    }

    // Обмеження розмірів
    ['minWidth', 'maxWidth', 'minHeight', 'maxHeight'].forEach(prop => {
      if (element.styles?.[prop]) {
        dimensions[prop] = element.styles[prop];
      }
    });

    // Визначення типу розмірів
    if (dimensions.width?.includes?.('%') || dimensions.width === 'auto') {
      dimensions.isFluid = true;
    } else if (dimensions.width?.includes?.('px')) {
      dimensions.isFixed = true;
    }

    return dimensions;
  }

  /**
   * Аналіз відступів та проміжків
   * @param {Object} element - Елемент
   * @returns {Object} Відступи
   */
  analyzeSpacing(element) {
    const spacing = {
      padding: {},
      margin: {},
      gap: null,
      itemSpacing: null
    };

    // Padding
    if (element.paddingLeft !== undefined || element.paddingTop !== undefined ||
        element.paddingRight !== undefined || element.paddingBottom !== undefined) {
      spacing.padding = {
        top: element.paddingTop || 0,
        right: element.paddingRight || 0,
        bottom: element.paddingBottom || 0,
        left: element.paddingLeft || 0
      };
    } else if (element.styles?.padding) {
      spacing.padding = this.parseSpacing(element.styles.padding);
    }

    // Margin
    if (element.styles?.margin) {
      spacing.margin = this.parseSpacing(element.styles.margin);
    }

    // Gap для flex/grid
    if (element.itemSpacing !== undefined) {
      spacing.itemSpacing = element.itemSpacing;
      spacing.gap = `${element.itemSpacing}px`;
    } else if (element.styles?.gap) {
      spacing.gap = element.styles.gap;
    }

    return spacing;
  }

  /**
   * Аналіз вирівнювання
   * @param {Object} element - Елемент
   * @returns {Object} Параметри вирівнювання
   */
  analyzeAlignment(element) {
    const alignment = {
      horizontal: null,
      vertical: null,
      textAlign: null,
      justifyContent: null,
      alignItems: null,
      alignSelf: null,
      placeItems: null
    };

    // Figma вирівнювання
    if (element.primaryAxisAlignItems) {
      alignment.justifyContent = this.mapFigmaAlignment(element.primaryAxisAlignItems);
    }
    
    if (element.counterAxisAlignItems) {
      alignment.alignItems = this.mapFigmaAlignment(element.counterAxisAlignItems);
    }

    // CSS вирівнювання
    ['textAlign', 'justifyContent', 'alignItems', 'alignSelf', 'placeItems'].forEach(prop => {
      if (element.styles?.[prop]) {
        alignment[prop] = element.styles[prop];
      }
    });

    // Визначення загального вирівнювання
    alignment.horizontal = alignment.justifyContent || alignment.textAlign || 'left';
    alignment.vertical = alignment.alignItems || 'top';

    return alignment;
  }

  /**
   * Аналіз Flexbox властивостей
   * @param {Object} element - Елемент
   * @returns {Object} Flex властивості
   */
  analyzeFlexProperties(element) {
    const flex = {
      direction: null,
      wrap: null,
      grow: null,
      shrink: null,
      basis: null,
      order: null,
      isFlexContainer: false,
      isFlexItem: false
    };

    // Контейнер Flex
    if (element.layoutMode === 'HORIZONTAL') {
      flex.direction = 'row';
      flex.isFlexContainer = true;
    } else if (element.layoutMode === 'VERTICAL') {
      flex.direction = 'column';
      flex.isFlexContainer = true;
    }

    // CSS Flex властивості
    if (element.styles?.display === 'flex' || element.styles?.display === 'inline-flex') {
      flex.isFlexContainer = true;
      flex.direction = element.styles.flexDirection || 'row';
      flex.wrap = element.styles.flexWrap || 'nowrap';
    }

    // Flex item властивості
    ['flexGrow', 'flexShrink', 'flexBasis', 'order'].forEach(prop => {
      if (element.styles?.[prop] !== undefined) {
        flex[prop.replace('flex', '').toLowerCase()] = element.styles[prop];
        flex.isFlexItem = true;
      }
    });

    return flex;
  }

  /**
   * Аналіз Grid властивостей
   * @param {Object} element - Елемент
   * @returns {Object} Grid властивості
   */
  analyzeGridProperties(element) {
    const grid = {
      columns: null,
      rows: null,
      areas: null,
      gap: null,
      autoFlow: null,
      isGridContainer: false,
      isGridItem: false,
      placement: {}
    };

    // Grid контейнер
    if (element.styles?.display === 'grid' || element.styles?.display === 'inline-grid') {
      grid.isGridContainer = true;
      
      // Grid template
      grid.columns = element.styles.gridTemplateColumns || 'none';
      grid.rows = element.styles.gridTemplateRows || 'none';
      grid.areas = element.styles.gridTemplateAreas || null;
      
      // Gap
      grid.gap = element.styles.gridGap || element.styles.gap || '0';
      
      // Auto flow
      grid.autoFlow = element.styles.gridAutoFlow || 'row';
    }

    // Grid item властивості
    ['gridColumn', 'gridRow', 'gridArea'].forEach(prop => {
      if (element.styles?.[prop]) {
        grid.placement[prop] = element.styles[prop];
        grid.isGridItem = true;
      }
    });

    return grid;
  }

  /**
   * Аналіз адаптивних властивостей
   * @param {Object} element - Елемент
   * @returns {Object} Адаптивні властивості
   */
  analyzeResponsiveProperties(element) {
    const responsive = {
      isResponsive: false,
      breakpoints: [],
      fluidWidth: false,
      fluidHeight: false,
      minMaxConstraints: false,
      containerQueries: false
    };

    // Перевірка флюїдних розмірів
    const dimensions = this.analyzeDimensions(element);
    responsive.fluidWidth = dimensions.isFluid;
    responsive.fluidHeight = dimensions.height?.includes?.('%') || dimensions.height === 'auto';

    // Перевірка обмежень
    responsive.minMaxConstraints = !!(dimensions.minWidth || dimensions.maxWidth || 
                                      dimensions.minHeight || dimensions.maxHeight);

    // Визначення адаптивності
    responsive.isResponsive = responsive.fluidWidth || responsive.fluidHeight || 
                             responsive.minMaxConstraints;

    // Container queries
    if (element.styles?.containerType) {
      responsive.containerQueries = true;
    }

    return responsive;
  }

  /**
   * Аналіз Z-індексу
   * @param {Object} element - Елемент
   * @returns {Object} Z-індекс дані
   */
  analyzeZIndex(element) {
    const zIndex = {
      value: null,
      level: 'auto',
      stackingContext: false
    };

    if (element.styles?.zIndex !== undefined) {
      zIndex.value = element.styles.zIndex;
      
      // Визначення рівня
      if (zIndex.value === 'auto') {
        zIndex.level = 'auto';
      } else if (zIndex.value < 0) {
        zIndex.level = 'below';
      } else if (zIndex.value === 0) {
        zIndex.level = 'base';
      } else if (zIndex.value < 10) {
        zIndex.level = 'low';
      } else if (zIndex.value < 100) {
        zIndex.level = 'medium';
      } else if (zIndex.value < 1000) {
        zIndex.level = 'high';
      } else {
        zIndex.level = 'modal';
      }
    }

    // Перевірка створення stacking context
    const position = element.position || element.styles?.position;
    if (position && position !== 'static' && zIndex.value !== 'auto') {
      zIndex.stackingContext = true;
    }

    return zIndex;
  }

  /**
   * Аналіз overflow
   * @param {Object} element - Елемент
   * @returns {Object} Overflow властивості
   */
  analyzeOverflow(element) {
    const overflow = {
      x: 'visible',
      y: 'visible',
      hasScroll: false,
      isClipped: false
    };

    if (element.styles?.overflow) {
      overflow.x = overflow.y = element.styles.overflow;
    }
    
    if (element.styles?.overflowX) {
      overflow.x = element.styles.overflowX;
    }
    
    if (element.styles?.overflowY) {
      overflow.y = element.styles.overflowY;
    }

    // Figma clipping
    if (element.clipsContent !== undefined) {
      overflow.isClipped = element.clipsContent;
      if (overflow.isClipped) {
        overflow.x = overflow.y = 'hidden';
      }
    }

    // Визначення наявності скролу
    overflow.hasScroll = overflow.x === 'scroll' || overflow.y === 'scroll' ||
                        overflow.x === 'auto' || overflow.y === 'auto';

    return overflow;
  }

  /**
   * Порівняння макетів двох елементів
   * @param {Object} layout1 - Перший макет
   * @param {Object} layout2 - Другий макет
   * @returns {number} Схожість від 0 до 1
   */
  compareLayouts(layout1, layout2) {
    let score = 0;
    let factors = 0;

    // Порівняння типів макету
    if (layout1.type === layout2.type) {
      score += 1;
    }
    factors++;

    // Порівняння розмірів
    if (this.compareDimensions(layout1.dimensions, layout2.dimensions)) {
      score += 0.8;
    }
    factors++;

    // Порівняння вирівнювання
    if (this.compareAlignment(layout1.alignment, layout2.alignment)) {
      score += 0.7;
    }
    factors++;

    // Порівняння відступів
    if (this.compareSpacing(layout1.spacing, layout2.spacing)) {
      score += 0.6;
    }
    factors++;

    return factors > 0 ? score / factors : 0;
  }

  /**
   * Оптимізація макету
   * @param {Object} layout - Вхідний макет
   * @returns {Object} Оптимізований макет
   */
  optimizeLayout(layout) {
    const optimized = { ...layout };

    // Оптимізація Flexbox
    if (layout.type === 'flex' && layout.flexProperties.isFlexContainer) {
      // Заміна margin на gap де можливо
      if (layout.spacing.itemSpacing && !layout.flexProperties.gap) {
        optimized.flexProperties.gap = layout.spacing.itemSpacing;
      }

      // Оптимізація flex-direction
      if (layout.flexProperties.direction === 'row' && 
          layout.dimensions.width < 600) {
        optimized.responsive = {
          ...optimized.responsive,
          mobileDirection: 'column'
        };
      }
    }

    // Оптимізація Grid
    if (layout.type === 'grid' && layout.gridProperties.isGridContainer) {
      // Автоматичні колонки для адаптивності
      if (layout.gridProperties.columns?.includes('repeat')) {
        optimized.gridProperties.columns = 
          `repeat(auto-fit, minmax(${this.calculateMinColumnWidth(layout)}px, 1fr))`;
      }
    }

    return optimized;
  }

  // === Приватні допоміжні методи ===

  /**
   * Маппінг вирівнювання Figma в CSS
   */
  mapFigmaAlignment(alignment) {
    const mappings = {
      'MIN': 'flex-start',
      'CENTER': 'center',
      'MAX': 'flex-end',
      'SPACE_BETWEEN': 'space-between',
      'SPACE_AROUND': 'space-around',
      'SPACE_EVENLY': 'space-evenly'
    };
    return mappings[alignment] || alignment;
  }

  /**
   * Парсинг відступів
   */
  parseSpacing(spacing) {
    if (typeof spacing === 'string') {
      const values = spacing.split(' ').map(v => parseInt(v) || 0);
      
      if (values.length === 1) {
        return { top: values[0], right: values[0], bottom: values[0], left: values[0] };
      } else if (values.length === 2) {
        return { top: values[0], right: values[1], bottom: values[0], left: values[1] };
      } else if (values.length === 3) {
        return { top: values[0], right: values[1], bottom: values[2], left: values[1] };
      } else if (values.length === 4) {
        return { top: values[0], right: values[1], bottom: values[2], left: values[3] };
      }
    }
    
    return spacing;
  }

  /**
   * Порівняння розмірів
   */
  compareDimensions(dim1, dim2) {
    if (!dim1 || !dim2) return false;
    
    const widthMatch = dim1.width === dim2.width || 
                       (dim1.isFluid && dim2.isFluid);
    const heightMatch = dim1.height === dim2.height || 
                        (dim1.isFluid && dim2.isFluid);
    
    return widthMatch && heightMatch;
  }

  /**
   * Порівняння вирівнювання
   */
  compareAlignment(align1, align2) {
    if (!align1 || !align2) return false;
    
    return align1.horizontal === align2.horizontal && 
           align1.vertical === align2.vertical;
  }

  /**
   * Порівняння відступів
   */
  compareSpacing(spacing1, spacing2) {
    if (!spacing1 || !spacing2) return false;
    
    const paddingMatch = JSON.stringify(spacing1.padding) === 
                        JSON.stringify(spacing2.padding);
    const marginMatch = JSON.stringify(spacing1.margin) === 
                       JSON.stringify(spacing2.margin);
    
    return paddingMatch && marginMatch;
  }

  /**
   * Розрахунок мінімальної ширини колонки
   */
  calculateMinColumnWidth(layout) {
    // Базова логіка для розрахунку
    const containerWidth = layout.dimensions.width || 1200;
    const columns = 3; // За замовчуванням
    const gap = parseInt(layout.gridProperties.gap) || 20;
    
    return Math.floor((containerWidth - (gap * (columns - 1))) / columns);
  }
}

// Експорт модуля
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LayoutAnalyzer;
}