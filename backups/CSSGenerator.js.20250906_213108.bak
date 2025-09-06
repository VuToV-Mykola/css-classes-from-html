/**
 * Розширений CSS генератор з підтримкою всіх властивостей
 * Підтримує Typography, Visual & Effects, Animation, Modern CSS, Display & Flexbox, Box Model
 * @version 3.0.0
 */

class CSSGenerator {
  constructor(options = {}) {
    this.options = {
      includeReset: options.includeReset !== false,
      includeComments: options.includeComments !== false,
      optimizeCSS: options.optimizeCSS !== false,
      generateResponsive: options.generateResponsive !== false,
      generateModernCSS: options.generateModernCSS !== false,
      generateAnimations: options.generateAnimations !== false,
      ...options
    };
    
    this.cssRules = new Map();
    this.variables = new Map();
    this.mediaQueries = new Map();
    this.animations = new Map();
    this.imports = new Set();
  }

  /**
   * Генерація CSS з Figma та HTML даних
   */
  generateCSS(figmaData, htmlData, matches) {
    this.reset();
    
    // Генерація базових стилів
    if (this.options.includeReset) {
      this.generateReset();
    }
    
    // Генерація CSS змінних
    this.generateVariables(figmaData);
    
    // Генерація стилів для кожного співставлення
    matches.forEach((match, figmaElementId) => {
      const figmaElement = figmaData.hierarchy.get(figmaElementId);
      const htmlElement = htmlData.hierarchy.get(match.htmlElement);
      
      if (figmaElement && htmlElement) {
        this.generateElementStyles(figmaElement, htmlElement, match);
      }
    });
    
    // Генерація адаптивних стилів
    if (this.options.generateResponsive) {
      this.generateResponsiveStyles();
    }
    
    // Генерація анімацій
    if (this.options.generateAnimations) {
      this.generateAnimations();
    }
    
    // Генерація сучасного CSS
    if (this.options.generateModernCSS) {
      this.generateModernCSS();
    }
    
    return this.compileCSS();
  }

  /**
   * Генерація стилів для елемента
   */
  generateElementStyles(figmaElement, htmlElement, match) {
    const className = this.generateClassName(htmlElement);
    const styles = new Map();
    
    // Typography
    this.generateTypographyStyles(figmaElement, styles);
    
    // Visual & Effects
    this.generateVisualStyles(figmaElement, styles);
    
    // Display & Flexbox
    this.generateDisplayStyles(figmaElement, styles);
    
    // Box Model
    this.generateBoxModelStyles(figmaElement, styles);
    
    // Positioning & Layout
    this.generatePositioningStyles(figmaElement, styles);
    
    // Animation & Transitions
    if (this.options.generateAnimations) {
      this.generateAnimationStyles(figmaElement, styles);
    }
    
    // Додавання стилів до правил
    this.cssRules.set(className, styles);
  }

  /**
   * Генерація Typography стилів
   */
  generateTypographyStyles(figmaElement, styles) {
    const typography = figmaElement.styles?.typography;
    if (!typography) return;
    
    if (typography.fontFamily) {
      styles.set('font-family', this.formatFontFamily(typography.fontFamily));
    }
    
    if (typography.fontSize) {
      styles.set('font-size', `${typography.fontSize}px`);
    }
    
    if (typography.fontWeight) {
      styles.set('font-weight', this.formatFontWeight(typography.fontWeight));
    }
    
    if (typography.fontStyle) {
      styles.set('font-style', typography.fontStyle);
    }
    
    if (typography.lineHeight) {
      styles.set('line-height', this.formatLineHeight(typography.lineHeight));
    }
    
    if (typography.letterSpacing) {
      styles.set('letter-spacing', `${typography.letterSpacing}px`);
    }
    
    if (typography.textAlign) {
      styles.set('text-align', typography.textAlign);
    }
    
    if (typography.textDecoration) {
      styles.set('text-decoration', typography.textDecoration);
    }
    
    if (typography.textTransform) {
      styles.set('text-transform', typography.textTransform);
    }
  }

  /**
   * Генерація Visual & Effects стилів
   */
  generateVisualStyles(figmaElement, styles) {
    // Кольори
    const colors = figmaElement.styles?.colors;
    if (colors && colors.length > 0) {
      const primaryColor = colors[0];
      if (primaryColor.type === 'solid') {
        styles.set('color', primaryColor.color);
        if (primaryColor.opacity < 1) {
          styles.set('opacity', primaryColor.opacity);
        }
      } else if (primaryColor.type === 'gradient') {
        styles.set('background', this.formatGradient(primaryColor.gradient));
      }
    }
    
    // Фон
    if (figmaElement.styles?.colors) {
      const backgroundColors = figmaElement.styles.colors.filter(c => c.type === 'solid');
      if (backgroundColors.length > 0) {
        styles.set('background-color', backgroundColors[0].color);
      }
    }
    
    // Ефекти
    const effects = figmaElement.styles?.effects;
    if (effects && effects.length > 0) {
      effects.forEach(effect => {
        if (effect.type === 'box-shadow') {
          styles.set('box-shadow', this.formatBoxShadow(effect));
        }
      });
    }
    
    // Фільтри
    if (figmaElement.styles?.filters) {
      styles.set('filter', this.formatFilters(figmaElement.styles.filters));
    }
  }

  /**
   * Генерація Display & Flexbox стилів
   */
  generateDisplayStyles(figmaElement, styles) {
    const type = figmaElement.type;
    const name = figmaElement.name.toLowerCase();
    
    // Визначення display
    if (type === 'FRAME') {
      if (name.includes('flex') || name.includes('row') || name.includes('col')) {
        styles.set('display', 'flex');
        this.generateFlexboxStyles(figmaElement, styles);
      } else if (name.includes('grid')) {
        styles.set('display', 'grid');
        this.generateGridStyles(figmaElement, styles);
      } else {
        styles.set('display', 'block');
      }
    } else if (type === 'TEXT') {
      styles.set('display', 'inline-block');
    } else {
      styles.set('display', 'block');
    }
    
    // Flexbox стилі
    if (styles.get('display') === 'flex') {
      this.generateFlexboxStyles(figmaElement, styles);
    }
  }

  /**
   * Генерація Flexbox стилів
   */
  generateFlexboxStyles(figmaElement, styles) {
    const name = figmaElement.name.toLowerCase();
    
    // Flex direction
    if (name.includes('row')) {
      styles.set('flex-direction', 'row');
    } else if (name.includes('col') || name.includes('column')) {
      styles.set('flex-direction', 'column');
    }
    
    // Justify content
    if (name.includes('center')) {
      styles.set('justify-content', 'center');
    } else if (name.includes('between')) {
      styles.set('justify-content', 'space-between');
    } else if (name.includes('around')) {
      styles.set('justify-content', 'space-around');
    } else if (name.includes('start')) {
      styles.set('justify-content', 'flex-start');
    } else if (name.includes('end')) {
      styles.set('justify-content', 'flex-end');
    }
    
    // Align items
    if (name.includes('center')) {
      styles.set('align-items', 'center');
    } else if (name.includes('start')) {
      styles.set('align-items', 'flex-start');
    } else if (name.includes('end')) {
      styles.set('align-items', 'flex-end');
    } else if (name.includes('stretch')) {
      styles.set('align-items', 'stretch');
    }
    
    // Flex wrap
    if (name.includes('wrap')) {
      styles.set('flex-wrap', 'wrap');
    }
    
    // Gap
    if (name.includes('gap')) {
      const gapMatch = name.match(/gap-(\d+)/);
      if (gapMatch) {
        styles.set('gap', `${gapMatch[1]}px`);
      }
    }
  }

  /**
   * Генерація Grid стилів
   */
  generateGridStyles(figmaElement, styles) {
    const name = figmaElement.name.toLowerCase();
    
    // Grid template columns
    if (name.includes('col')) {
      const colMatch = name.match(/col-(\d+)/);
      if (colMatch) {
        const cols = parseInt(colMatch[1]);
        styles.set('grid-template-columns', `repeat(${cols}, 1fr)`);
      }
    }
    
    // Gap
    if (name.includes('gap')) {
      const gapMatch = name.match(/gap-(\d+)/);
      if (gapMatch) {
        styles.set('gap', `${gapMatch[1]}px`);
      }
    }
  }

  /**
   * Генерація Box Model стилів
   */
  generateBoxModelStyles(figmaElement, styles) {
    const position = figmaElement.styles?.position;
    if (!position) return;
    
    // Розміри
    if (position.width) {
      styles.set('width', `${position.width}px`);
    }
    
    if (position.height) {
      styles.set('height', `${position.height}px`);
    }
    
    // Min/Max розміри
    if (position.minWidth) {
      styles.set('min-width', `${position.minWidth}px`);
    }
    
    if (position.minHeight) {
      styles.set('min-height', `${position.minHeight}px`);
    }
    
    if (position.maxWidth) {
      styles.set('max-width', `${position.maxWidth}px`);
    }
    
    if (position.maxHeight) {
      styles.set('max-height', `${position.maxHeight}px`);
    }
    
    // Padding та Margin
    this.generateSpacingStyles(figmaElement, styles);
    
    // Border
    this.generateBorderStyles(figmaElement, styles);
    
    // Box sizing
    styles.set('box-sizing', 'border-box');
  }

  /**
   * Генерація Spacing стилів
   */
  generateSpacingStyles(figmaElement, styles) {
    const name = figmaElement.name.toLowerCase();
    
    // Padding
    if (name.includes('p-')) {
      const paddingMatch = name.match(/p-(\d+)/);
      if (paddingMatch) {
        const value = `${paddingMatch[1]}px`;
        styles.set('padding', value);
      }
    }
    
    // Margin
    if (name.includes('m-')) {
      const marginMatch = name.match(/m-(\d+)/);
      if (marginMatch) {
        const value = `${marginMatch[1]}px`;
        styles.set('margin', value);
      }
    }
    
    // Специфічні padding
    if (name.includes('px-')) {
      const paddingXMatch = name.match(/px-(\d+)/);
      if (paddingXMatch) {
        styles.set('padding-left', `${paddingXMatch[1]}px`);
        styles.set('padding-right', `${paddingXMatch[1]}px`);
      }
    }
    
    if (name.includes('py-')) {
      const paddingYMatch = name.match(/py-(\d+)/);
      if (paddingYMatch) {
        styles.set('padding-top', `${paddingYMatch[1]}px`);
        styles.set('padding-bottom', `${paddingYMatch[1]}px`);
      }
    }
  }

  /**
   * Генерація Border стилів
   */
  generateBorderStyles(figmaElement, styles) {
    const name = figmaElement.name.toLowerCase();
    
    // Border radius
    if (name.includes('rounded')) {
      const radiusMatch = name.match(/rounded-(\d+)/);
      if (radiusMatch) {
        styles.set('border-radius', `${radiusMatch[1]}px`);
      } else {
        styles.set('border-radius', '4px');
      }
    }
    
    // Border
    if (name.includes('border')) {
      const borderMatch = name.match(/border-(\d+)/);
      if (borderMatch) {
        styles.set('border', `${borderMatch[1]}px solid #ccc`);
      } else {
        styles.set('border', '1px solid #ccc');
      }
    }
  }

  /**
   * Генерація Positioning стилів
   */
  generatePositioningStyles(figmaElement, styles) {
    const position = figmaElement.styles?.position;
    if (!position) return;
    
    // Position
    if (position.x !== undefined && position.y !== undefined) {
      styles.set('position', 'absolute');
      styles.set('left', `${position.x}px`);
      styles.set('top', `${position.y}px`);
    }
    
    // Z-index
    if (position.zIndex !== undefined) {
      styles.set('z-index', position.zIndex);
    }
  }

  /**
   * Генерація Animation стилів
   */
  generateAnimationStyles(figmaElement, styles) {
    const name = figmaElement.name.toLowerCase();
    
    // Transition
    if (name.includes('hover') || name.includes('transition')) {
      styles.set('transition', 'all 0.3s ease');
    }
    
    // Transform
    if (name.includes('scale')) {
      const scaleMatch = name.match(/scale-(\d+)/);
      if (scaleMatch) {
        const scale = parseInt(scaleMatch[1]) / 100;
        styles.set('transform', `scale(${scale})`);
      }
    }
    
    if (name.includes('rotate')) {
      const rotateMatch = name.match(/rotate-(\d+)/);
      if (rotateMatch) {
        styles.set('transform', `rotate(${rotateMatch[1]}deg)`);
      }
    }
  }

  /**
   * Генерація адаптивних стилів
   */
  generateResponsiveStyles() {
    const breakpoints = {
      mobile: '768px',
      tablet: '1024px',
      desktop: '1200px'
    };
    
    Object.entries(breakpoints).forEach(([name, size]) => {
      const mediaQuery = `@media (max-width: ${size})`;
      const styles = new Map();
      
      // Базові адаптивні стилі
      styles.set('container', new Map([
        ['padding', '0 16px'],
        ['max-width', '100%']
      ]));
      
      this.mediaQueries.set(mediaQuery, styles);
    });
  }

  /**
   * Генерація сучасного CSS
   */
  generateModernCSS() {
    // Container queries
    this.cssRules.set('.container', new Map([
      ['container-type', 'inline-size'],
      ['container-name', 'main']
    ]));
    
    // Aspect ratio
    this.cssRules.set('.aspect-ratio', new Map([
      ['aspect-ratio', '16/9']
    ]));
    
    // Object fit
    this.cssRules.set('.object-fit', new Map([
      ['object-fit', 'cover']
    ]));
    
    // Scroll behavior
    this.cssRules.set('.smooth-scroll', new Map([
      ['scroll-behavior', 'smooth']
    ]));
  }

  /**
   * Генерація анімацій
   */
  generateAnimations() {
    // Fade in анімація
    this.animations.set('fadeIn', {
      '0%': { opacity: '0', transform: 'translateY(20px)' },
      '100%': { opacity: '1', transform: 'translateY(0)' }
    });
    
    // Slide in анімація
    this.animations.set('slideIn', {
      '0%': { transform: 'translateX(-100%)' },
      '100%': { transform: 'translateX(0)' }
    });
    
    // Pulse анімація
    this.animations.set('pulse', {
      '0%, 100%': { transform: 'scale(1)' },
      '50%': { transform: 'scale(1.05)' }
    });
  }

  /**
   * Генерація CSS змінних
   */
  generateVariables(figmaData) {
    // Кольори
    this.variables.set('--primary-color', '#007ACC');
    this.variables.set('--secondary-color', '#6C757D');
    this.variables.set('--background-color', '#FFFFFF');
    this.variables.set('--text-color', '#212529');
    
    // Spacing
    this.variables.set('--spacing-xs', '0.25rem');
    this.variables.set('--spacing-sm', '0.5rem');
    this.variables.set('--spacing-md', '1rem');
    this.variables.set('--spacing-lg', '1.5rem');
    this.variables.set('--spacing-xl', '2rem');
    
    // Typography
    this.variables.set('--font-family-primary', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
    this.variables.set('--font-size-base', '16px');
    this.variables.set('--line-height-base', '1.5');
    
    // Border radius
    this.variables.set('--border-radius-sm', '4px');
    this.variables.set('--border-radius-md', '8px');
    this.variables.set('--border-radius-lg', '12px');
    
    // Shadows
    this.variables.set('--shadow-sm', '0 1px 2px rgba(0, 0, 0, 0.05)');
    this.variables.set('--shadow-md', '0 4px 6px rgba(0, 0, 0, 0.1)');
    this.variables.set('--shadow-lg', '0 10px 15px rgba(0, 0, 0, 0.1)');
  }

  /**
   * Генерація Reset стилів
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
    
    // Body стилі
    const bodyStyles = new Map([
      ['font-family', 'var(--font-family-primary)'],
      ['line-height', 'var(--line-height-base)'],
      ['color', 'var(--text-color)'],
      ['background-color', 'var(--background-color)']
    ]);
    
    this.cssRules.set('body', bodyStyles);
  }

  /**
   * Генерація імені класу
   */
  generateClassName(htmlElement) {
    if (htmlElement.classes.length > 0) {
      return htmlElement.classes[0];
    }
    
    // Генерація на основі семантичної ролі
    const role = htmlElement.semanticRole;
    const tag = htmlElement.tagName;
    
    if (role === 'heading') return 'heading';
    if (role === 'interactive') return 'btn';
    if (role === 'container') return 'container';
    if (role === 'content-section') return 'section';
    
    return tag;
  }

  /**
   * Компіляція CSS
   */
  compileCSS() {
    let css = '';
    
    // Imports
    if (this.imports.size > 0) {
      this.imports.forEach(importRule => {
        css += `@import ${importRule};\n`;
      });
      css += '\n';
    }
    
    // Variables
    if (this.variables.size > 0) {
      css += ':root {\n';
      this.variables.forEach((value, variable) => {
        css += `  ${variable}: ${value};\n`;
      });
      css += '}\n\n';
    }
    
    // Animations
    if (this.animations.size > 0) {
      this.animations.forEach((keyframes, name) => {
        css += `@keyframes ${name} {\n`;
        Object.entries(keyframes).forEach(([key, styles]) => {
          css += `  ${key} {\n`;
          Object.entries(styles).forEach(([prop, value]) => {
            css += `    ${prop}: ${value};\n`;
          });
          css += '  }\n';
        });
        css += '}\n\n';
      });
    }
    
    // CSS Rules
    this.cssRules.forEach((styles, selector) => {
      css += `.${selector} {\n`;
      styles.forEach((value, property) => {
        css += `  ${property}: ${value};\n`;
      });
      css += '}\n\n';
    });
    
    // Media Queries
    this.mediaQueries.forEach((styles, mediaQuery) => {
      css += `${mediaQuery} {\n`;
      styles.forEach((ruleStyles, selector) => {
        css += `  .${selector} {\n`;
        ruleStyles.forEach((value, property) => {
          css += `    ${property}: ${value};\n`;
        });
        css += '  }\n';
      });
      css += '}\n\n';
    });
    
    return this.options.optimizeCSS ? this.optimizeCSS(css) : css;
  }

  /**
   * Оптимізація CSS
   */
  optimizeCSS(css) {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Видалення коментарів
      .replace(/\s+/g, ' ') // Заміна множинних пробілів
      .replace(/\s*([{:;}])\s*/g, '$1') // Видалення пробілів навколо спеціальних символів
      .trim();
  }

  /**
   * Допоміжні методи форматування
   */
  formatFontFamily(fontFamily) {
    return `"${fontFamily}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  }

  formatFontWeight(weight) {
    const weightMap = {
      '100': '100',
      '200': '200',
      '300': '300',
      '400': '400',
      '500': '500',
      '600': '600',
      '700': '700',
      '800': '800',
      '900': '900',
      'Thin': '100',
      'ExtraLight': '200',
      'Light': '300',
      'Regular': '400',
      'Medium': '500',
      'SemiBold': '600',
      'Bold': '700',
      'ExtraBold': '800',
      'Black': '900'
    };
    
    return weightMap[weight] || '400';
  }

  formatLineHeight(lineHeight) {
    if (typeof lineHeight === 'number') {
      return lineHeight.toString();
    }
    return lineHeight;
  }

  formatGradient(gradient) {
    if (gradient.type === 'linear') {
      return `linear-gradient(45deg, ${gradient.stops.map(stop => stop.color).join(', ')})`;
    }
    return 'none';
  }

  formatBoxShadow(effect) {
    const { x, y, blur, spread, color, opacity } = effect;
    const alpha = opacity !== undefined ? opacity : 1;
    const rgbaColor = this.hexToRgba(color, alpha);
    
    return `${x}px ${y}px ${blur}px ${spread}px ${rgbaColor}`;
  }

  formatFilters(filters) {
    return filters.map(filter => {
      switch (filter.type) {
        case 'blur':
          return `blur(${filter.value}px)`;
        case 'brightness':
          return `brightness(${filter.value})`;
        case 'contrast':
          return `contrast(${filter.value})`;
        case 'saturate':
          return `saturate(${filter.value})`;
        default:
          return '';
      }
    }).join(' ');
  }

  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /**
   * Скидання генератора
   */
  reset() {
    this.cssRules.clear();
    this.variables.clear();
    this.mediaQueries.clear();
    this.animations.clear();
    this.imports.clear();
  }
}

module.exports = CSSGenerator;
