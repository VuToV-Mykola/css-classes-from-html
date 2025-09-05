/**
 * @module ResponsiveAnalyzer
 * @description Аналіз та генерація адаптивних стилів
 * @author Ukrainian Developer
 * @version 2.0.0
 */

class ResponsiveAnalyzer {
  constructor() {
    // Стандартні breakpoints
    this.breakpoints = {
      xs: 320,    // Mobile portrait
      sm: 576,    // Mobile landscape
      md: 768,    // Tablet
      lg: 1024,   // Desktop
      xl: 1200,   // Large desktop
      xxl: 1440   // Extra large
    };

    // Кеш для оптимізації
    this.analysisCache = new WeakMap();
    this.mediaQueriesCache = new Map();
  }

  /**
   * Повний аналіз адаптивності елемента
   * @param {Object} element - Елемент для аналізу
   * @param {Object} figmaData - Дані Figma
   * @returns {Object} Аналіз адаптивності
   */
  analyzeResponsiveness(element, figmaData) {
    // Перевірка кешу
    if (this.analysisCache.has(element)) {
      return this.analysisCache.get(element);
    }

    const analysis = {
      isResponsive: false,
      breakpointBehavior: this.analyzeBreakpointBehavior(element),
      fluidProperties: this.analyzeFluidProperties(element),
      constraints: this.analyzeConstraints(element, figmaData),
      scalingStrategy: this.determineScalingStrategy(element),
      mediaQueries: this.generateMediaQueries(element),
      containerQueries: this.generateContainerQueries(element),
      adaptiveText: this.analyzeTextAdaptivity(element),
      adaptiveImages: this.analyzeImageAdaptivity(element),
      recommendations: []
    };

    // Визначення загальної адаптивності
    analysis.isResponsive = this.isElementResponsive(analysis);
    
    // Генерація рекомендацій
    analysis.recommendations = this.generateRecommendations(analysis);

    // Збереження в кеш
    this.analysisCache.set(element, analysis);
    return analysis;
  }

  /**
   * Аналіз поведінки на різних breakpoints
   * @param {Object} element - Елемент
   * @returns {Object} Поведінка на breakpoints
   */
  analyzeBreakpointBehavior(element) {
    const behavior = {};

    Object.entries(this.breakpoints).forEach(([name, width]) => {
      behavior[name] = {
        display: this.getDisplayAtBreakpoint(element, width),
        layout: this.getLayoutAtBreakpoint(element, width),
        sizing: this.getSizingAtBreakpoint(element, width),
        visibility: this.getVisibilityAtBreakpoint(element, width)
      };
    });

    return behavior;
  }

  /**
   * Аналіз флюїдних властивостей
   * @param {Object} element - Елемент
   * @returns {Object} Флюїдні властивості
   */
  analyzeFluidProperties(element) {
    const fluid = {
      width: false,
      height: false,
      fontSize: false,
      spacing: false,
      units: []
    };

    // Перевірка ширини
    if (element.styles?.width) {
      fluid.width = this.isFluidValue(element.styles.width);
    }

    // Перевірка висоти
    if (element.styles?.height) {
      fluid.height = this.isFluidValue(element.styles.height);
    }

    // Перевірка розміру шрифту
    if (element.styles?.fontSize) {
      fluid.fontSize = this.isFluidValue(element.styles.fontSize);
    }

    // Перевірка відступів
    ['padding', 'margin', 'gap'].forEach(prop => {
      if (element.styles?.[prop]) {
        fluid.spacing = fluid.spacing || this.isFluidValue(element.styles[prop]);
      }
    });

    // Збір використаних одиниць
    fluid.units = this.collectUnits(element);

    return fluid;
  }

  /**
   * Аналіз обмежень (constraints)
   * @param {Object} element - Елемент
   * @param {Object} figmaData - Дані Figma
   * @returns {Object} Обмеження
   */
  analyzeConstraints(element, figmaData) {
    const constraints = {
      horizontal: null,
      vertical: null,
      aspectRatio: null,
      minMax: {},
      figmaConstraints: null
    };

    // Figma constraints
    if (element.constraints) {
      constraints.figmaConstraints = element.constraints;
      constraints.horizontal = element.constraints.horizontal;
      constraints.vertical = element.constraints.vertical;
    }

    // CSS constraints
    ['minWidth', 'maxWidth', 'minHeight', 'maxHeight'].forEach(prop => {
      if (element.styles?.[prop]) {
        constraints.minMax[prop] = element.styles[prop];
      }
    });

    // Aspect ratio
    if (element.styles?.aspectRatio) {
      constraints.aspectRatio = element.styles.aspectRatio;
    } else if (element.absoluteBoundingBox) {
      const { width, height } = element.absoluteBoundingBox;
      constraints.aspectRatio = width / height;
    }

    return constraints;
  }

  /**
   * Визначення стратегії масштабування
   * @param {Object} element - Елемент
   * @returns {string} Стратегія
   */
  determineScalingStrategy(element) {
    const constraints = element.constraints;
    const hasFluidWidth = this.isFluidValue(element.styles?.width);
    const hasFluidHeight = this.isFluidValue(element.styles?.height);

    // Figma-based стратегії
    if (constraints) {
      if (constraints.horizontal === 'SCALE' && constraints.vertical === 'SCALE') {
        return 'proportional-scale';
      }
      if (constraints.horizontal === 'STRETCH' && constraints.vertical === 'STRETCH') {
        return 'stretch';
      }
      if (constraints.horizontal === 'CENTER' || constraints.vertical === 'CENTER') {
        return 'center-fixed';
      }
    }

    // CSS-based стратегії
    if (hasFluidWidth && hasFluidHeight) {
      return 'fully-responsive';
    }
    if (hasFluidWidth) {
      return 'horizontal-fluid';
    }
    if (hasFluidHeight) {
      return 'vertical-fluid';
    }

    return 'fixed';
  }

  /**
   * Генерація media queries
   * @param {Object} element - Елемент
   * @returns {Array} Media queries
   */
  generateMediaQueries(element) {
    const queries = [];

    // Mobile-first підхід
    Object.entries(this.breakpoints).forEach(([name, width]) => {
      const styles = this.generateBreakpointStyles(element, width);
      
      if (Object.keys(styles).length > 0) {
        queries.push({
          breakpoint: name,
          minWidth: width,
          query: `(min-width: ${width}px)`,
          styles: styles
        });
      }
    });

    // Додаткові queries для особливих випадків
    if (element.hiddenOnMobile) {
      queries.push({
        breakpoint: 'mobile-hidden',
        query: '(max-width: 767px)',
        styles: { display: 'none' }
      });
    }

    if (element.orientation) {
      queries.push({
        breakpoint: 'orientation',
        query: `(orientation: ${element.orientation})`,
        styles: this.generateOrientationStyles(element)
      });
    }

    return queries;
  }

  /**
   * Генерація container queries
   * @param {Object} element - Елемент
   * @returns {Array} Container queries
   */
  generateContainerQueries(element) {
    const queries = [];

    // Container query підтримка
    if (element.containerType || element.useContainerQueries) {
      queries.push({
        type: 'inline-size',
        name: element.containerName || 'container',
        breakpoints: [
          {
            minWidth: 400,
            query: '(min-width: 400px)',
            styles: this.generateContainerStyles(element, 400)
          },
          {
            minWidth: 600,
            query: '(min-width: 600px)',
            styles: this.generateContainerStyles(element, 600)
          },
          {
            minWidth: 900,
            query: '(min-width: 900px)',
            styles: this.generateContainerStyles(element, 900)
          }
        ]
      });
    }

    return queries;
  }

  /**
   * Аналіз адаптивності тексту
   * @param {Object} element - Елемент
   * @returns {Object} Адаптивність тексту
   */
  analyzeTextAdaptivity(element) {
    const textAdaptivity = {
      isFluid: false,
      clampValues: null,
      breakpointSizes: {},
      lineHeightStrategy: null,
      truncation: null
    };

    if (element.type === 'TEXT' || element.styles?.fontSize) {
      const fontSize = element.styles?.fontSize;
      
      // Перевірка флюїдного розміру
      textAdaptivity.isFluid = this.isFluidValue(fontSize);
      
      // Генерація clamp() для флюїдної типографіки
      if (textAdaptivity.isFluid || element.useFluidTypography) {
        textAdaptivity.clampValues = this.generateClampValue(
          element.minFontSize || 14,
          element.maxFontSize || parseInt(fontSize) || 16,
          element.viewportUnit || '1vw'
        );
      }

      // Розміри для різних breakpoints
      Object.entries(this.breakpoints).forEach(([name, width]) => {
        textAdaptivity.breakpointSizes[name] = this.calculateTextSizeForBreakpoint(
          element,
          width
        );
      });

      // Стратегія line-height
      textAdaptivity.lineHeightStrategy = element.styles?.lineHeight?.includes('%') 
        ? 'relative' 
        : 'fixed';

      // Обрізання тексту
      textAdaptivity.truncation = {
        overflow: element.styles?.textOverflow,
        maxLines: element.maxLines,
        ellipsis: element.styles?.textOverflow === 'ellipsis'
      };
    }

    return textAdaptivity;
  }

  /**
   * Аналіз адаптивності зображень
   * @param {Object} element - Елемент
   * @returns {Object} Адаптивність зображень
   */
  analyzeImageAdaptivity(element) {
    const imageAdaptivity = {
      isResponsive: false,
      srcset: [],
      sizes: [],
      loading: 'eager',
      objectFit: null,
      aspectRatio: null
    };

    if (element.type === 'IMAGE' || element.tagName === 'img') {
      // Визначення responsive
      imageAdaptivity.isResponsive = !element.fixedSize;
      
      // Object fit стратегія
      imageAdaptivity.objectFit = element.styles?.objectFit || 'cover';
      
      // Aspect ratio
      if (element.absoluteBoundingBox) {
        const { width, height } = element.absoluteBoundingBox;
        imageAdaptivity.aspectRatio = width / height;
      }
      
      // Lazy loading
      imageAdaptivity.loading = element.loading || 'lazy';
      
      // Генерація srcset для різних розмірів
      if (imageAdaptivity.isResponsive) {
        imageAdaptivity.srcset = this.generateSrcset(element);
        imageAdaptivity.sizes = this.generateSizes(element);
      }
    }

    return imageAdaptivity;
  }

  /**
   * Генерація адаптивних CSS стилів
   * @param {Object} element - Елемент
   * @returns {string} CSS код
   */
  generateResponsiveCSS(element) {
    const analysis = this.analyzeResponsiveness(element);
    let css = '';

    // Базові стилі
    css += this.generateBaseStyles(element);

    // Media queries
    analysis.mediaQueries.forEach(query => {
      css += `\n@media ${query.query} {\n`;
      css += this.formatStyles(query.styles, '  ');
      css += '}\n';
    });

    // Container queries
    if (analysis.containerQueries.length > 0) {
      analysis.containerQueries.forEach(container => {
        css += `\n.${element.className} {\n`;
        css += `  container-type: ${container.type};\n`;
        css += `  container-name: ${container.name};\n`;
        css += '}\n';
        
        container.breakpoints.forEach(bp => {
          css += `\n@container ${container.name} ${bp.query} {\n`;
          css += this.formatStyles(bp.styles, '  ');
          css += '}\n';
        });
      });
    }

    // CSS змінні для адаптивності
    if (analysis.fluidProperties.fontSize) {
      css += `\n:root {\n`;
      css += `  --fluid-font-size: ${analysis.adaptiveText.clampValues};\n`;
      css += '}\n';
    }

    return css;
  }

  // === Приватні допоміжні методи ===

  /**
   * Перевірка чи значення є флюїдним
   */
  isFluidValue(value) {
    if (!value) return false;
    return value.includes('%') || 
           value.includes('vw') || 
           value.includes('vh') || 
           value.includes('em') || 
           value.includes('rem') ||
           value === 'auto';
  }

  /**
   * Збір використаних одиниць вимірювання
   */
  collectUnits(element) {
    const units = new Set();
    const checkValue = (value) => {
      if (!value) return;
      const match = value.match(/\d+(\w+)/);
      if (match) units.add(match[1]);
    };

    // Перевірка всіх стилів
    Object.values(element.styles || {}).forEach(value => {
      if (typeof value === 'string') checkValue(value);
    });

    return Array.from(units);
  }

  /**
   * Визначення display для breakpoint
   */
  getDisplayAtBreakpoint(element, width) {
    if (width < 768 && element.hiddenOnMobile) return 'none';
    if (width >= 768 && width < 1024 && element.hiddenOnTablet) return 'none';
    if (width >= 1024 && element.hiddenOnDesktop) return 'none';
    
    return element.styles?.display || 'block';
  }

  /**
   * Визначення layout для breakpoint
   */
  getLayoutAtBreakpoint(element, width) {
    const layout = {};
    
    if (width < 768) {
      // Mobile: вертикальний layout
      if (element.styles?.flexDirection === 'row') {
        layout.flexDirection = 'column';
      }
      if (element.styles?.gridTemplateColumns) {
        layout.gridTemplateColumns = '1fr';
      }
    } else if (width < 1024) {
      // Tablet: 2 колонки
      if (element.styles?.gridTemplateColumns?.includes('repeat')) {
        layout.gridTemplateColumns = 'repeat(2, 1fr)';
      }
    }
    
    return layout;
  }

  /**
   * Визначення розмірів для breakpoint
   */
  getSizingAtBreakpoint(element, width) {
    const sizing = {};
    
    if (width < 768) {
      sizing.width = '100%';
      sizing.padding = this.scalePadding(element.styles?.padding, 0.7);
      sizing.fontSize = this.scaleFont(element.styles?.fontSize, 0.9);
    } else if (width < 1024) {
      sizing.width = element.styles?.width || '100%';
      sizing.padding = this.scalePadding(element.styles?.padding, 0.85);
    }
    
    return sizing;
  }

  /**
   * Визначення видимості для breakpoint
   */
  getVisibilityAtBreakpoint(element, width) {
    if (width < 768) return element.hiddenOnMobile ? 'hidden' : 'visible';
    if (width < 1024) return element.hiddenOnTablet ? 'hidden' : 'visible';
    return element.hiddenOnDesktop ? 'hidden' : 'visible';
  }

  /**
   * Генерація стилів для breakpoint
   */
  generateBreakpointStyles(element, width) {
    const styles = {};
    
    // Адаптивна ширина
    if (width < 768) {
      styles.width = '100%';
      styles.maxWidth = '100%';
    } else if (width < 1024) {
      styles.width = element.tabletWidth || '50%';
    } else {
      styles.width = element.desktopWidth || element.styles?.width;
    }
    
    // Адаптивні відступи
    const basePadding = parseInt(element.styles?.padding) || 20;
    if (width < 768) {
      styles.padding = `${Math.round(basePadding * 0.5)}px`;
    } else if (width < 1024) {
      styles.padding = `${Math.round(basePadding * 0.75)}px`;
    }
    
    // Адаптивний шрифт
    const baseFontSize = parseInt(element.styles?.fontSize) || 16;
    if (width < 768) {
      styles.fontSize = `${Math.round(baseFontSize * 0.875)}px`;
    } else if (width < 1024) {
      styles.fontSize = `${Math.round(baseFontSize * 0.9375)}px`;
    }
    
    return styles;
  }

  /**
   * Генерація clamp() значення
   */
  generateClampValue(min, max, preferred) {
    return `clamp(${min}px, ${preferred}, ${max}px)`;
  }

  /**
   * Розрахунок розміру тексту для breakpoint
   */
  calculateTextSizeForBreakpoint(element, width) {
    const baseSize = parseInt(element.styles?.fontSize) || 16;
    
    if (width < 576) return Math.round(baseSize * 0.875);
    if (width < 768) return Math.round(baseSize * 0.9);
    if (width < 1024) return Math.round(baseSize * 0.95);
    return baseSize;
  }

  /**
   * Генерація srcset для зображень
   */
  generateSrcset(element) {
    const srcset = [];
    const widths = [320, 640, 768, 1024, 1440, 1920];
    
    widths.forEach(width => {
      srcset.push(`image-${width}.jpg ${width}w`);
    });
    
    return srcset;
  }

  /**
   * Генерація sizes для зображень
   */
  generateSizes(element) {
    return [
      '(max-width: 320px) 280px',
      '(max-width: 768px) 100vw',
      '(max-width: 1024px) 50vw',
      '33vw'
    ];
  }

  /**
   * Масштабування padding
   */
  scalePadding(padding, scale) {
    if (!padding) return padding;
    const value = parseInt(padding);
    if (isNaN(value)) return padding;
    return `${Math.round(value * scale)}px`;
  }

  /**
   * Масштабування font-size
   */
  scaleFont(fontSize, scale) {
    if (!fontSize) return fontSize;
    const value = parseInt(fontSize);
    if (isNaN(value)) return fontSize;
    return `${Math.round(value * scale)}px`;
  }

  /**
   * Генерація стилів для орієнтації
   */
  generateOrientationStyles(element) {
    return element.orientation === 'landscape' 
      ? { flexDirection: 'row' }
      : { flexDirection: 'column' };
  }

  /**
   * Генерація контейнерних стилів
   */
  generateContainerStyles(element, width) {
    const styles = {};
    
    if (width < 400) {
      styles.fontSize = '14px';
      styles.padding = '8px';
    } else if (width < 600) {
      styles.fontSize = '15px';
      styles.padding = '12px';
    } else {
      styles.fontSize = '16px';
      styles.padding = '16px';
    }
    
    return styles;
  }

  /**
   * Форматування стилів
   */
  formatStyles(styles, indent = '') {
    let css = '';
    Object.entries(styles).forEach(([prop, value]) => {
      const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
      css += `${indent}${cssProp}: ${value};\n`;
    });
    return css;
  }

  /**
   * Генерація базових стилів
   */
  generateBaseStyles(element) {
    let css = `.${element.className || 'element'} {\n`;
    
    // Базові адаптивні властивості
    css += '  width: 100%;\n';
    css += '  max-width: 100%;\n';
    css += '  box-sizing: border-box;\n';
    
    // Додаткові стилі
    if (element.styles) {
      css += this.formatStyles(element.styles, '  ');
    }
    
    css += '}\n';
    return css;
  }

  /**
   * Перевірка елемента на адаптивність
   */
  isElementResponsive(analysis) {
    return analysis.fluidProperties.width ||
           analysis.fluidProperties.height ||
           analysis.mediaQueries.length > 0 ||
           analysis.containerQueries.length > 0 ||
           analysis.adaptiveText.isFluid ||
           analysis.adaptiveImages.isResponsive;
  }

  /**
   * Генерація рекомендацій
   */
  generateRecommendations(analysis) {
    const recommendations = [];
    
    if (!analysis.fluidProperties.width) {
      recommendations.push({
        type: 'improvement',
        message: 'Розгляньте використання відносних одиниць для ширини',
        priority: 'medium'
      });
    }
    
    if (analysis.mediaQueries.length === 0) {
      recommendations.push({
        type: 'warning',
        message: 'Відсутні media queries для адаптивності',
        priority: 'high'
      });
    }
    
    if (!analysis.adaptiveText.isFluid && analysis.adaptiveText.clampValues === null) {
      recommendations.push({
        type: 'suggestion',
        message: 'Використайте clamp() для флюїдної типографіки',
        priority: 'low'
      });
    }
    
    return recommendations;
  }
}

// Експорт модуля
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResponsiveAnalyzer;
}