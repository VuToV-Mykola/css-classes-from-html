/**
 * ✅ FIX: CSS генератор - ВИПРАВЛЕНА ВЕРСІЯ без логічних помилок
 * Генерує CSS стилі з Figma та HTML даних з коментарями про співставлення
 * @version 4.1.0 - ВИПРАВЛЕНО
 */

class CSSGenerator {
  constructor(options = {}) {
    this.options = {
      includeReset: options.includeReset !== false,
      includeComments: options.includeComments !== false,
      optimizeCSS: options.optimizeCSS || false,
      generateResponsive: options.generateResponsive !== false,
      mode: options.mode || 'minimal',
      ...options
    };

    this.cssRules = new Map();
    this.variables = new Map();
    this.mediaQueries = new Map();
    this.figmaMapping = new Map();

    // ✅ FIX: Додаємо лічильники та статистику
    this.statistics = {
      totalRules: 0,
      emptyRules: 0,
      figmaRules: 0,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * ✅ FIX: Головна функція генерації CSS з правильною логікою
   */
  generateCSS(figmaData, htmlData, matches) {
    this.reset();

    // ✅ FIX: Генерація базових стилів
    if (this.options.includeReset) {
      this.generateReset();
    }

    // ✅ FIX: Генерація CSS змінних
    this.generateVariables(figmaData);

    // ✅ FIX: Обробка співставлених елементів
    if (matches && matches.size > 0) {
      matches.forEach((match, figmaElementId) => {
        const figmaElement = figmaData?.hierarchy?.get(figmaElementId);
        const htmlElement = htmlData?.hierarchy?.get(match.htmlElement);

        if (figmaElement && htmlElement) {
          this.generateElementStyles(figmaElement, htmlElement, match);
        }
      });
    }

    // ✅ FIX: Додавання неспівставлених HTML елементів з пустими правилами
    if (htmlData?.hierarchy) {
      htmlData.hierarchy.forEach((htmlElement, htmlId) => {
        const hasMatch = matches
          ? Array.from(matches.values()).some(m => m.htmlElement === htmlId)
          : false;
        if (!hasMatch && htmlElement.classes && htmlElement.classes.length > 0) {
          this.generateEmptyRules(htmlElement);
        }
      });
    }

    // ✅ FIX: Генерація адаптивних стилів
    if (this.options.generateResponsive) {
      this.generateResponsiveStyles();
    }

    return this.compileCSS();
  }

  /**
   * ✅ FIX: Генерація стилів для елемента з правильною логікою
   */
  generateElementStyles(figmaElement, htmlElement, match) {
    const className = this.generateClassName(htmlElement);
    if (!className) return;

    const styles = new Map();

    // ✅ FIX: Зберігаємо інформацію про співставлення
    const mappingInfo = {
      figmaId: figmaElement.id,
      figmaName: figmaElement.name || 'Unnamed',
      figmaType: figmaElement.type || 'Unknown',
      confidence: match.confidence || 0,
      strategy: match.strategy || 'unknown',
      canvas: this.findCanvasForElement(figmaElement)
    };

    this.figmaMapping.set(className, mappingInfo);

    // ✅ FIX: Логіка генерації стилів залежно від режиму
    if (this.options.mode === 'minimal') {
      // У мінімальному режимі генеруємо пусті правила
      this.statistics.emptyRules++;
    } else {
      // ✅ FIX: Витягуємо стилі з Figma для інших режимів
      this.extractFigmaStyles(figmaElement, styles);
      if (styles.size > 0) {
        this.statistics.figmaRules++;
      }
    }

    this.cssRules.set(className, styles);
    this.statistics.totalRules++;
  }

  /**
   * ✅ FIX: Генерація пустих правил для неспівставлених елементів
   */
  generateEmptyRules(htmlElement) {
    if (!htmlElement.classes) return;

    htmlElement.classes.forEach(className => {
      if (!this.cssRules.has(className)) {
        this.cssRules.set(className, new Map());

        // ✅ FIX: Додаємо інформацію про відсутність співставлення
        this.figmaMapping.set(className, {
          figmaId: null,
          figmaName: 'Not matched',
          figmaType: 'N/A',
          confidence: 0,
          strategy: 'none',
          canvas: 'N/A'
        });

        this.statistics.emptyRules++;
        this.statistics.totalRules++;
      }
    });
  }

  /**
   * ✅ FIX: Витягування стилів безпосередньо з Figma елемента
   */
  extractFigmaStyles(figmaElement, styles) {
    if (!figmaElement || !styles) return;

    // ✅ FIX: Typography стилі
    if (figmaElement.styles?.typography) {
      const typo = figmaElement.styles.typography;
      this.addStyleIfExists(styles, 'font-family', typo.fontFamily);
      this.addStyleIfExists(styles, 'font-size', this.formatSize(typo.fontSize));
      this.addStyleIfExists(styles, 'font-weight', typo.fontWeight);
      this.addStyleIfExists(styles, 'font-style', typo.fontStyle);
      this.addStyleIfExists(styles, 'line-height', this.formatLineHeight(typo.lineHeight));
      this.addStyleIfExists(styles, 'letter-spacing', this.formatSize(typo.letterSpacing));
      this.addStyleIfExists(styles, 'text-align', typo.textAlign?.toLowerCase());
      this.addStyleIfExists(styles, 'text-decoration', typo.textDecoration?.toLowerCase());
      this.addStyleIfExists(styles, 'text-transform', typo.textTransform?.toLowerCase());
    }

    // ✅ FIX: Color стилі
    if (figmaElement.styles?.colors && Array.isArray(figmaElement.styles.colors)) {
      const primaryColor = figmaElement.styles.colors[0];
      if (primaryColor?.type === 'solid' && primaryColor.color) {
        styles.set('color', primaryColor.color);
        if (primaryColor.opacity !== undefined && primaryColor.opacity < 1) {
          styles.set('opacity', primaryColor.opacity.toString());
        }
      }
    }

    // ✅ FIX: Background стилі з правильною перевіркою
    if (figmaElement.fills && Array.isArray(figmaElement.fills)) {
      figmaElement.fills.forEach(fill => {
        if (fill.type === 'SOLID' && fill.color) {
          styles.set('background-color', this.rgbToHex(fill.color));
          if (fill.opacity !== undefined && fill.opacity < 1) {
            styles.set('opacity', fill.opacity.toString());
          }
        }
      });
    }

    // ✅ FIX: Position та розміри
    if (figmaElement.styles?.position) {
      const pos = figmaElement.styles.position;
      this.addStyleIfExists(styles, 'width', this.formatSize(pos.width));
      this.addStyleIfExists(styles, 'height', this.formatSize(pos.height));
    } else if (figmaElement.absoluteBoundingBox) {
      // Fallback до absoluteBoundingBox
      const box = figmaElement.absoluteBoundingBox;
      this.addStyleIfExists(styles, 'width', this.formatSize(box.width));
      this.addStyleIfExists(styles, 'height', this.formatSize(box.height));
    }

    // ✅ FIX: Layout стилі (Flexbox/Grid)
    if (figmaElement.styles?.layout) {
      const layout = figmaElement.styles.layout;
      this.addStyleIfExists(styles, 'display', layout.display);
      this.addStyleIfExists(styles, 'flex-direction', layout.flexDirection);
      this.addStyleIfExists(styles, 'justify-content', layout.justifyContent);
      this.addStyleIfExists(styles, 'align-items', layout.alignItems);
      this.addStyleIfExists(styles, 'gap', layout.gap);
    }

    // ✅ FIX: Effects (shadows, etc.)
    if (figmaElement.styles?.effects && Array.isArray(figmaElement.styles.effects)) {
      const shadows = figmaElement.styles.effects
        .filter(e => e.type === 'box-shadow')
        .map(e => this.formatBoxShadow(e))
        .filter(shadow => shadow);

      if (shadows.length > 0) {
        styles.set('box-shadow', shadows.join(', '));
      }
    }

    // ✅ FIX: Border стилі
    if (figmaElement.styles?.borders) {
      const borders = figmaElement.styles.borders;
      this.addStyleIfExists(styles, 'border-width', borders.width);
      this.addStyleIfExists(styles, 'border-color', borders.color);
      this.addStyleIfExists(styles, 'border-radius', borders.radius);
    }

    // ✅ FIX: Spacing (padding/margin)
    if (figmaElement.styles?.spacing) {
      const spacing = figmaElement.styles.spacing;
      this.addStyleIfExists(styles, 'padding-top', spacing.paddingTop);
      this.addStyleIfExists(styles, 'padding-right', spacing.paddingRight);
      this.addStyleIfExists(styles, 'padding-bottom', spacing.paddingBottom);
      this.addStyleIfExists(styles, 'padding-left', spacing.paddingLeft);
    }
  }

  /**
   * ✅ FIX: Допоміжна функція для додавання стилів
   */
  addStyleIfExists(styles, property, value) {
    if (value !== undefined && value !== null && value !== '') {
      styles.set(property, value);
    }
  }

  /**
   * ✅ FIX: Форматування розмірів
   */
  formatSize(value) {
    if (typeof value === 'number') {
      return `${value}px`;
    }
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
    return null;
  }

  /**
   * ✅ FIX: Форматування line-height
   */
  formatLineHeight(lineHeight) {
    if (typeof lineHeight === 'number') {
      return lineHeight > 10 ? `${lineHeight}px` : lineHeight.toString();
    }
    if (typeof lineHeight === 'object' && lineHeight?.value) {
      return this.formatLineHeight(lineHeight.value);
    }
    return lineHeight?.toString() || null;
  }

  /**
   * ✅ FIX: Пошук Canvas для елемента
   */
  findCanvasForElement(element) {
    if (!element) return 'Unknown';

    // Простий алгоритм - повертаємо назву на основі ієрархії
    if (element.parent) {
      return 'Canvas';
    }
    return element.name || 'Root';
  }

  /**
   * ✅ FIX: Генерація імені класу
   */
  generateClassName(htmlElement) {
    if (!htmlElement) return null;

    if (htmlElement.classes && htmlElement.classes.length > 0) {
      return htmlElement.classes[0];
    }

    if (htmlElement.tagName) {
      return htmlElement.tagName.toLowerCase();
    }

    return null;
  }

  /**
   * ✅ FIX: Компіляція CSS з коментарями та правильним форматуванням
   */
  compileCSS() {
    let css = '';

    // ✅ FIX: Заголовок з інформацією про генерацію
    css += '/* CSS Classes from HTML - Generated CSS */\n';
    css += `/* Generated: ${this.statistics.generatedAt} */\n`;
    css += `/* Mode: ${this.options.mode} */\n`;
    css += `/* Total rules: ${this.statistics.totalRules} */\n`;
    css += `/* Figma mapped: ${this.statistics.figmaRules} */\n`;
    css += `/* Empty rules: ${this.statistics.emptyRules} */\n\n`;

    // ✅ FIX: CSS змінні
    if (this.variables.size > 0) {
      css += ':root {\n';
      this.variables.forEach((value, variable) => {
        css += `  ${variable}: ${value};\n`;
      });
      css += '}\n\n';
    }

    // ✅ FIX: CSS правила з коментарями про Figma співставлення
    this.cssRules.forEach((styles, selector) => {
      const mapping = this.figmaMapping.get(selector);

      // ✅ FIX: Додаємо коментар з інформацією про Figma (якщо включені коментарі)
      if (this.options.includeComments && mapping) {
        if (mapping.figmaId) {
          css += `/* Figma Layer: "${mapping.figmaName}" (${mapping.figmaType}) */\n`;
          css += `/* Canvas: ${mapping.canvas} | Confidence: ${(mapping.confidence * 100).toFixed(0)}% | Strategy: ${mapping.strategy} */\n`;
        } else {
          css += '/* No Figma mapping found for this class */\n';
        }
      }

      css += `.${selector} {\n`;

      if (styles.size === 0) {
        // ✅ FIX: Пусте правило для мінімального режиму або неспівставлених елементів
        if (this.options.includeComments) {
          const reason = mapping?.figmaId
            ? 'minimal mode - add styles manually'
            : 'not matched with Figma';
          css += `  /* ${reason} */\n`;
        }
      } else {
        // ✅ FIX: Стилі з Figma з коментарями
        styles.forEach((value, property) => {
          if (this.options.includeComments) {
            css += `  ${property}: ${value}; /* from Figma */\n`;
          } else {
            css += `  ${property}: ${value};\n`;
          }
        });
      }

      css += '}\n\n';
    });

    // ✅ FIX: Адаптивні стилі
    if (this.mediaQueries.size > 0) {
      this.mediaQueries.forEach((rules, mediaQuery) => {
        css += `${mediaQuery} {\n`;
        rules.forEach((styles, selector) => {
          css += `  .${selector} {\n`;
          styles.forEach((value, property) => {
            css += `    ${property}: ${value};\n`;
          });
          css += '  }\n';
        });
        css += '}\n\n';
      });
    }

    return this.options.optimizeCSS ? this.optimizeCSS(css) : css;
  }

  /**
   * ✅ FIX: Генерація Reset стилів
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

    // ✅ FIX: Body стилі
    const bodyStyles = new Map([
      ['font-family', '-apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif'],
      ['line-height', '1.5'],
      ['color', '#212529'],
      ['background-color', '#ffffff']
    ]);

    this.cssRules.set('body', bodyStyles);
    this.statistics.totalRules += 4;
  }

  /**
   * ✅ FIX: Генерація CSS змінних
   */
  generateVariables(figmaData) {
    // ✅ FIX: Базові змінні
    this.variables.set('--primary-color', '#007ACC');
    this.variables.set('--secondary-color', '#6c757d');
    this.variables.set('--success-color', '#28a745');
    this.variables.set('--danger-color', '#dc3545');
    this.variables.set('--warning-color', '#ffc107');
    this.variables.set('--info-color', '#17a2b8');
    this.variables.set('--light-color', '#f8f9fa');
    this.variables.set('--dark-color', '#343a40');
    this.variables.set('--text-color', '#212529');
    this.variables.set('--background-color', '#ffffff');

    // ✅ FIX: Spacing змінні
    this.variables.set('--spacing-xs', '0.25rem');
    this.variables.set('--spacing-sm', '0.5rem');
    this.variables.set('--spacing-md', '1rem');
    this.variables.set('--spacing-lg', '1.5rem');
    this.variables.set('--spacing-xl', '2rem');
    this.variables.set('--spacing-xxl', '3rem');

    // ✅ FIX: Breakpoints
    this.variables.set('--breakpoint-sm', '576px');
    this.variables.set('--breakpoint-md', '768px');
    this.variables.set('--breakpoint-lg', '992px');
    this.variables.set('--breakpoint-xl', '1200px');
  }

  /**
   * ✅ FIX: Генерація адаптивних стилів
   */
  generateResponsiveStyles() {
    const mediaQueries = [
      '@media (max-width: 768px)',
      '@media (min-width: 769px) and (max-width: 1024px)',
      '@media (min-width: 1025px)'
    ];

    mediaQueries.forEach(mq => {
      if (!this.mediaQueries.has(mq)) {
        this.mediaQueries.set(mq, new Map());
      }
    });

    // ✅ FIX: Базові адаптивні стилі
    const mobileStyles = new Map([
      ['padding', 'var(--spacing-sm)'],
      ['font-size', '14px']
    ]);

    this.mediaQueries.get('@media (max-width: 768px)').set('container', mobileStyles);
  }

  /**
   * ✅ FIX: Допоміжні методи
   */
  rgbToHex(color) {
    if (typeof color === 'string') return color;
    if (!color) return '#000000';

    const r = Math.round((color.r || 0) * 255);
    const g = Math.round((color.g || 0) * 255);
    const b = Math.round((color.b || 0) * 255);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  formatBoxShadow(effect) {
    if (!effect) return null;

    const x = effect.x || 0;
    const y = effect.y || 0;
    const blur = effect.blur || 0;
    const spread = effect.spread || 0;
    const color = effect.color ? this.rgbToHex(effect.color) : '#000000';
    const opacity = effect.opacity || 1;
    const inset = effect.inset ? 'inset ' : '';

    return `${inset}${x}px ${y}px ${blur}px ${spread}px ${color}${opacity < 1 ? ` / ${opacity}` : ''}`;
  }

  optimizeCSS(css) {
    if (!this.options.optimizeCSS) return css;

    // ✅ FIX: Мінімальна оптимізація - зберігаємо читабельність
    return css
      .replace(/\n\s*\n/g, '\n') // Видаляємо зайві порожні рядки
      .replace(/\s+/g, ' ') // Зменшуємо множинні пробіли
      .replace(/;\s*}/g, ';}') // Видаляємо пробіли перед закриваючими дужками
      .trim();
  }

  reset() {
    this.cssRules.clear();
    this.variables.clear();
    this.mediaQueries.clear();
    this.figmaMapping.clear();

    this.statistics = {
      totalRules: 0,
      emptyRules: 0,
      figmaRules: 0,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * ✅ FIX: Отримання статистики генерації
   */
  getStatistics() {
    return {
      ...this.statistics,
      cssRulesCount: this.cssRules.size,
      variablesCount: this.variables.size,
      mediaQueriesCount: this.mediaQueries.size,
      figmaMappingsCount: this.figmaMapping.size
    };
  }
}

module.exports = CSSGenerator;
