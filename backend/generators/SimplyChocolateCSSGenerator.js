/**
 * Спеціалізований CSS генератор для Simply Chocolate макету
 * Оптимізований для конкретного дизайну з детальними стилями
 * @version 1.0.0
 */

const CSSGenerator = require('./CSSGenerator');

class SimplyChocolateCSSGenerator extends CSSGenerator {
  constructor(options = {}) {
    super(options);
    this.chocolateTheme = {
      colors: {
        primary: '#D2691E',
        secondary: '#8B4513', 
        accent: '#FFD700',
        background: '#FFF8DC',
        text: '#2F1B14',
        light: '#F5F5DC',
        dark: '#1A0F0A',
        white: '#FFFFFF',
        gray: '#6B7280'
      },
      typography: {
        primaryFont: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        secondaryFont: '"Playfair Display", serif',
        headingFont: '"Montserrat", sans-serif'
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
        xxxl: 64
      },
      breakpoints: {
        mobile: 375,
        tablet: 768,
        desktop: 1200,
        wide: 1440
      },
      shadows: {
        sm: '0 1px 2px rgba(210, 105, 30, 0.1)',
        md: '0 4px 6px rgba(210, 105, 30, 0.15)',
        lg: '0 10px 15px rgba(210, 105, 30, 0.2)',
        xl: '0 20px 25px rgba(210, 105, 30, 0.25)'
      },
      borderRadius: {
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
        full: 9999
      }
    };
  }

  /**
   * Генерація CSS з Simply Chocolate темою
   */
  generateSimplyChocolateCSS(figmaData, htmlData, matches) {
    this.reset();
    
    // Генерація базових стилів
    this.generateChocolateBaseStyles();
    
    // Генерація CSS змінних
    this.generateChocolateVariables();
    
    // Генерація стилів для співставлень
    matches.forEach((match, figmaElementId) => {
      const figmaElement = figmaData.hierarchy.get(figmaElementId);
      const htmlElement = htmlData.hierarchy.get(match.htmlElement);
      
      if (figmaElement && htmlElement) {
        this.generateChocolateElementStyles(figmaElement, htmlElement, match);
      }
    });
    
    // Генерація компонентів Simply Chocolate
    this.generateChocolateComponents();
    
    // Генерація адаптивних стилів
    this.generateChocolateResponsiveStyles();
    
    // Генерація анімацій
    this.generateChocolateAnimations();
    
    return this.compileCSS();
  }

  /**
   * Генерація базових стилів Simply Chocolate
   */
  generateChocolateBaseStyles() {
    // Reset стилі
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
      ['font-family', 'var(--chocolate-primary-font)'],
      ['line-height', '1.6'],
      ['color', 'var(--chocolate-text)'],
      ['background-color', 'var(--chocolate-background)'],
      ['font-size', '16px'],
      ['scroll-behavior', 'smooth']
    ]);
    
    this.cssRules.set('body', bodyStyles);
    
    // Typography стилі
    this.generateChocolateTypography();
    
    // Container стилі
    this.generateChocolateContainer();
  }

  /**
   * Генерація CSS змінних Simply Chocolate
   */
  generateChocolateVariables() {
    // Colors
    Object.entries(this.chocolateTheme.colors).forEach(([key, value]) => {
      this.variables.set(`--chocolate-${key}`, value);
    });
    
    // Typography
    Object.entries(this.chocolateTheme.typography).forEach(([key, value]) => {
      this.variables.set(`--chocolate-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
    });
    
    // Spacing
    Object.entries(this.chocolateTheme.spacing).forEach(([key, value]) => {
      this.variables.set(`--chocolate-spacing-${key}`, `${value}px`);
    });
    
    // Breakpoints
    Object.entries(this.chocolateTheme.breakpoints).forEach(([key, value]) => {
      this.variables.set(`--chocolate-${key}`, `${value}px`);
    });
    
    // Shadows
    Object.entries(this.chocolateTheme.shadows).forEach(([key, value]) => {
      this.variables.set(`--chocolate-shadow-${key}`, value);
    });
    
    // Border radius
    Object.entries(this.chocolateTheme.borderRadius).forEach(([key, value]) => {
      this.variables.set(`--chocolate-radius-${key}`, `${value}px`);
    });
  }

  /**
   * Генерація типографії Simply Chocolate
   */
  generateChocolateTypography() {
    // Headings
    const headingStyles = new Map([
      ['font-family', 'var(--chocolate-heading-font)'],
      ['font-weight', '700'],
      ['line-height', '1.2'],
      ['color', 'var(--chocolate-text)'],
      ['margin-bottom', 'var(--chocolate-spacing-md)']
    ]);
    
    this.cssRules.set('h1', new Map([...headingStyles, ['font-size', '2.5rem']]));
    this.cssRules.set('h2', new Map([...headingStyles, ['font-size', '2rem']]));
    this.cssRules.set('h3', new Map([...headingStyles, ['font-size', '1.75rem']]));
    this.cssRules.set('h4', new Map([...headingStyles, ['font-size', '1.5rem']]));
    this.cssRules.set('h5', new Map([...headingStyles, ['font-size', '1.25rem']]));
    this.cssRules.set('h6', new Map([...headingStyles, ['font-size', '1rem']]));
    
    // Paragraphs
    const paragraphStyles = new Map([
      ['font-family', 'var(--chocolate-primary-font)'],
      ['font-size', '1rem'],
      ['line-height', '1.6'],
      ['color', 'var(--chocolate-text)'],
      ['margin-bottom', 'var(--chocolate-spacing-md)']
    ]);
    
    this.cssRules.set('p', paragraphStyles);
    
    // Links
    const linkStyles = new Map([
      ['color', 'var(--chocolate-primary)'],
      ['text-decoration', 'none'],
      ['transition', 'color 0.3s ease'],
      ['&:hover', 'color: var(--chocolate-secondary)']
    ]);
    
    this.cssRules.set('a', linkStyles);
  }

  /**
   * Генерація контейнера Simply Chocolate
   */
  generateChocolateContainer() {
    const containerStyles = new Map([
      ['width', '100%'],
      ['max-width', '1200px'],
      ['margin', '0 auto'],
      ['padding', '0 var(--chocolate-spacing-md)'],
      ['position', 'relative']
    ]);
    
    this.cssRules.set('.container', containerStyles);
    
    // Responsive container
    const responsiveContainer = new Map([
      ['padding', '0 var(--chocolate-spacing-sm)']
    ]);
    
    this.mediaQueries.set('@media (max-width: 768px)', new Map([
      ['container', responsiveContainer]
    ]));
  }

  /**
   * Генерація стилів елементів Simply Chocolate
   */
  generateChocolateElementStyles(figmaElement, htmlElement, match) {
    const className = this.generateChocolateClassName(htmlElement);
    const styles = new Map();
    
    // Базові стилі
    this.generateChocolateBaseElementStyles(figmaElement, styles);
    
    // Специфічні стилі для Simply Chocolate
    this.generateChocolateSpecificStyles(figmaElement, htmlElement, styles);
    
    // Typography стилі
    this.generateChocolateElementTypography(figmaElement, styles);
    
    // Layout стилі
    this.generateChocolateElementLayout(figmaElement, styles);
    
    // Color стилі
    this.generateChocolateElementColors(figmaElement, styles);
    
    // Effects стилі
    this.generateChocolateElementEffects(figmaElement, styles);
    
    this.cssRules.set(className, styles);
  }

  /**
   * Генерація базових стилів елементів
   */
  generateChocolateBaseElementStyles(figmaElement, styles) {
    const name = figmaElement.name.toLowerCase();
    const type = figmaElement.type;
    
    // Display стилі
    if (type === 'FRAME') {
      if (name.includes('flex') || name.includes('row') || name.includes('col')) {
        styles.set('display', 'flex');
      } else if (name.includes('grid')) {
        styles.set('display', 'grid');
      } else {
        styles.set('display', 'block');
      }
    } else if (type === 'TEXT') {
      styles.set('display', 'inline-block');
    } else {
      styles.set('display', 'block');
    }
    
    // Box model
    styles.set('box-sizing', 'border-box');
  }

  /**
   * Генерація специфічних стилів Simply Chocolate
   */
  generateChocolateSpecificStyles(figmaElement, htmlElement, styles) {
    const name = figmaElement.name.toLowerCase();
    const semanticRole = htmlElement.semanticRole;
    
    // Header стилі
    if (semanticRole === 'header' || name.includes('header')) {
      styles.set('background-color', 'var(--chocolate-white)');
      styles.set('box-shadow', 'var(--chocolate-shadow-sm)');
      styles.set('position', 'sticky');
      styles.set('top', '0');
      styles.set('z-index', '1000');
    }
    
    // Hero стилі
    if (name.includes('hero') || name.includes('banner')) {
      styles.set('background', 'linear-gradient(135deg, var(--chocolate-primary) 0%, var(--chocolate-secondary) 100%)');
      styles.set('color', 'var(--chocolate-white)');
      styles.set('padding', 'var(--chocolate-spacing-xxxl) 0');
      styles.set('text-align', 'center');
    }
    
    // Card стилі
    if (name.includes('card') || semanticRole === 'content-card') {
      styles.set('background-color', 'var(--chocolate-white)');
      styles.set('border-radius', 'var(--chocolate-radius-md)');
      styles.set('box-shadow', 'var(--chocolate-shadow-md)');
      styles.set('padding', 'var(--chocolate-spacing-lg)');
      styles.set('transition', 'transform 0.3s ease, box-shadow 0.3s ease');
    }
    
    // Button стилі
    if (name.includes('button') || name.includes('btn') || semanticRole === 'interactive') {
      this.generateChocolateButtonStyles(name, styles);
    }
    
    // Navigation стилі
    if (semanticRole === 'navigation' || name.includes('nav')) {
      styles.set('display', 'flex');
      styles.set('align-items', 'center');
      styles.set('gap', 'var(--chocolate-spacing-lg)');
    }
  }

  /**
   * Генерація стилів кнопок Simply Chocolate
   */
  generateChocolateButtonStyles(name, styles) {
    // Базові стилі кнопки
    styles.set('display', 'inline-flex');
    styles.set('align-items', 'center');
    styles.set('justify-content', 'center');
    styles.set('padding', 'var(--chocolate-spacing-md) var(--chocolate-spacing-lg)');
    styles.set('border', 'none');
    styles.set('border-radius', 'var(--chocolate-radius-md)');
    styles.set('font-family', 'var(--chocolate-primary-font)');
    styles.set('font-weight', '600');
    styles.set('text-decoration', 'none');
    styles.set('cursor', 'pointer');
    styles.set('transition', 'all 0.3s ease');
    
    // Primary button
    if (name.includes('primary')) {
      styles.set('background-color', 'var(--chocolate-primary)');
      styles.set('color', 'var(--chocolate-white)');
      styles.set('&:hover', 'background-color: var(--chocolate-secondary)');
    }
    
    // Secondary button
    if (name.includes('secondary')) {
      styles.set('background-color', 'transparent');
      styles.set('color', 'var(--chocolate-primary)');
      styles.set('border', '2px solid var(--chocolate-primary)');
      styles.set('&:hover', 'background-color: var(--chocolate-primary); color: var(--chocolate-white)');
    }
    
    // Outline button
    if (name.includes('outline')) {
      styles.set('background-color', 'transparent');
      styles.set('color', 'var(--chocolate-text)');
      styles.set('border', '1px solid var(--chocolate-gray)');
      styles.set('&:hover', 'background-color: var(--chocolate-light)');
    }
    
    // Size variants
    if (name.includes('large') || name.includes('lg')) {
      styles.set('padding', 'var(--chocolate-spacing-lg) var(--chocolate-spacing-xl)');
      styles.set('font-size', '1.125rem');
    }
    
    if (name.includes('small') || name.includes('sm')) {
      styles.set('padding', 'var(--chocolate-spacing-sm) var(--chocolate-spacing-md)');
      styles.set('font-size', '0.875rem');
    }
  }

  /**
   * Генерація типографії елементів
   */
  generateChocolateElementTypography(figmaElement, styles) {
    const typography = figmaElement.styles?.typography;
    if (!typography) return;
    
    if (typography.fontFamily) {
      styles.set('font-family', this.mapFigmaFont(typography.fontFamily));
    }
    
    if (typography.fontSize) {
      styles.set('font-size', `${typography.fontSize}px`);
    }
    
    if (typography.fontWeight) {
      styles.set('font-weight', this.mapFigmaFontWeight(typography.fontWeight));
    }
    
    if (typography.lineHeight) {
      styles.set('line-height', this.mapFigmaLineHeight(typography.lineHeight));
    }
    
    if (typography.textAlign) {
      styles.set('text-align', typography.textAlign);
    }
  }

  /**
   * Генерація layout стилів елементів
   */
  generateChocolateElementLayout(figmaElement, styles) {
    const layout = figmaElement.styles?.layout;
    if (!layout) return;
    
    if (layout.display) {
      styles.set('display', layout.display);
    }
    
    if (layout.flexDirection) {
      styles.set('flex-direction', layout.flexDirection);
    }
    
    if (layout.justifyContent) {
      styles.set('justify-content', layout.justifyContent);
    }
    
    if (layout.alignItems) {
      styles.set('align-items', layout.alignItems);
    }
    
    if (layout.gap) {
      styles.set('gap', layout.gap);
    }
  }

  /**
   * Генерація кольорів елементів
   */
  generateChocolateElementColors(figmaElement, styles) {
    const colors = figmaElement.styles?.colors;
    if (!colors || colors.length === 0) return;
    
    const primaryColor = colors[0];
    if (primaryColor.type === 'solid') {
      const chocolateColor = this.mapToChocolateColor(primaryColor.color);
      styles.set('color', chocolateColor);
      
      if (primaryColor.opacity < 1) {
        styles.set('opacity', primaryColor.opacity);
      }
    }
  }

  /**
   * Генерація ефектів елементів
   */
  generateChocolateElementEffects(figmaElement, styles) {
    const effects = figmaElement.styles?.effects;
    if (!effects || effects.length === 0) return;
    
    effects.forEach(effect => {
      if (effect.type === 'box-shadow') {
        const shadow = this.mapToChocolateShadow(effect);
        styles.set('box-shadow', shadow);
      }
    });
  }

  /**
   * Генерація компонентів Simply Chocolate
   */
  generateChocolateComponents() {
    // Product Card
    this.generateProductCard();
    
    // Navigation
    this.generateNavigation();
    
    // Form Elements
    this.generateFormElements();
    
    // Hero Section
    this.generateHeroSection();
  }

  /**
   * Генерація Product Card
   */
  generateProductCard() {
    const cardStyles = new Map([
      ['background-color', 'var(--chocolate-white)'],
      ['border-radius', 'var(--chocolate-radius-lg)'],
      ['box-shadow', 'var(--chocolate-shadow-md)'],
      ['overflow', 'hidden'],
      ['transition', 'transform 0.3s ease, box-shadow 0.3s ease'],
      ['&:hover', 'transform: translateY(-4px); box-shadow: var(--chocolate-shadow-lg)']
    ]);
    
    this.cssRules.set('.product-card', cardStyles);
    
    // Card Image
    const cardImageStyles = new Map([
      ['width', '100%'],
      ['height', '200px'],
      ['object-fit', 'cover']
    ]);
    
    this.cssRules.set('.product-card__image', cardImageStyles);
    
    // Card Content
    const cardContentStyles = new Map([
      ['padding', 'var(--chocolate-spacing-lg)']
    ]);
    
    this.cssRules.set('.product-card__content', cardContentStyles);
  }

  /**
   * Генерація Navigation
   */
  generateNavigation() {
    const navStyles = new Map([
      ['display', 'flex'],
      ['align-items', 'center'],
      ['justify-content', 'space-between'],
      ['padding', 'var(--chocolate-spacing-md) 0'],
      ['background-color', 'var(--chocolate-white)'],
      ['box-shadow', 'var(--chocolate-shadow-sm)']
    ]);
    
    this.cssRules.set('.nav', navStyles);
    
    // Nav List
    const navListStyles = new Map([
      ['display', 'flex'],
      ['list-style', 'none'],
      ['gap', 'var(--chocolate-spacing-lg)'],
      ['margin', '0'],
      ['padding', '0']
    ]);
    
    this.cssRules.set('.nav__list', navListStyles);
    
    // Nav Link
    const navLinkStyles = new Map([
      ['color', 'var(--chocolate-text)'],
      ['text-decoration', 'none'],
      ['font-weight', '500'],
      ['transition', 'color 0.3s ease'],
      ['&:hover', 'color: var(--chocolate-primary)']
    ]);
    
    this.cssRules.set('.nav__link', navLinkStyles);
  }

  /**
   * Генерація Form Elements
   */
  generateFormElements() {
    const inputStyles = new Map([
      ['width', '100%'],
      ['padding', 'var(--chocolate-spacing-md)'],
      ['border', '2px solid var(--chocolate-light)'],
      ['border-radius', 'var(--chocolate-radius-md)'],
      ['font-family', 'var(--chocolate-primary-font)'],
      ['font-size', '1rem'],
      ['transition', 'border-color 0.3s ease'],
      ['&:focus', 'outline: none; border-color: var(--chocolate-primary)']
    ]);
    
    this.cssRules.set('.form-input', inputStyles);
  }

  /**
   * Генерація Hero Section
   */
  generateHeroSection() {
    const heroStyles = new Map([
      ['background', 'linear-gradient(135deg, var(--chocolate-primary) 0%, var(--chocolate-secondary) 100%)'],
      ['color', 'var(--chocolate-white)'],
      ['padding', 'var(--chocolate-spacing-xxxl) 0'],
      ['text-align', 'center'],
      ['position', 'relative'],
      ['overflow', 'hidden']
    ]);
    
    this.cssRules.set('.hero', heroStyles);
  }

  /**
   * Генерація адаптивних стилів
   */
  generateChocolateResponsiveStyles() {
    // Mobile styles
    this.mediaQueries.set('@media (max-width: 768px)', new Map([
      ['container', new Map([['padding', '0 var(--chocolate-spacing-sm)']])],
      ['hero', new Map([['padding', 'var(--chocolate-spacing-xl) 0']])],
      ['nav', new Map([['flex-direction', 'column'], ['gap', 'var(--chocolate-spacing-md)']])]
    ]));
    
    // Tablet styles
    this.mediaQueries.set('@media (min-width: 769px) and (max-width: 1199px)', new Map([
      ['container', new Map([['max-width', '768px']])]
    ]));
    
    // Desktop styles
    this.mediaQueries.set('@media (min-width: 1200px)', new Map([
      ['container', new Map([['max-width', '1200px']])]
    ]));
  }

  /**
   * Генерація анімацій Simply Chocolate
   */
  generateChocolateAnimations() {
    // Fade in animation
    this.animations.set('fadeIn', {
      '0%': { opacity: '0', transform: 'translateY(20px)' },
      '100%': { opacity: '1', transform: 'translateY(0)' }
    });
    
    // Slide in from left
    this.animations.set('slideInLeft', {
      '0%': { transform: 'translateX(-100%)', opacity: '0' },
      '100%': { transform: 'translateX(0)', opacity: '1' }
    });
    
    // Pulse animation
    this.animations.set('pulse', {
      '0%, 100%': { transform: 'scale(1)' },
      '50%': { transform: 'scale(1.05)' }
    });
    
    // Chocolate hover effect
    this.animations.set('chocolateHover', {
      '0%': { transform: 'translateY(0)', boxShadow: 'var(--chocolate-shadow-md)' },
      '100%': { transform: 'translateY(-4px)', boxShadow: 'var(--chocolate-shadow-lg)' }
    });
  }

  /**
   * Генерація імені класу Simply Chocolate
   */
  generateChocolateClassName(htmlElement) {
    if (htmlElement.classes.length > 0) {
      return htmlElement.classes[0];
    }
    
    const role = htmlElement.semanticRole;
    const tag = htmlElement.tagName;
    
    const roleMap = {
      'heading': 'heading',
      'interactive': 'btn',
      'container': 'container',
      'content-section': 'section',
      'header': 'header',
      'footer': 'footer',
      'navigation': 'nav',
      'content-card': 'card'
    };
    
    return roleMap[role] || tag;
  }

  /**
   * Допоміжні методи
   */
  mapFigmaFont(figmaFont) {
    const fontMap = {
      'Inter': 'var(--chocolate-primary-font)',
      'Playfair Display': 'var(--chocolate-secondary-font)',
      'Montserrat': 'var(--chocolate-heading-font)'
    };
    
    return fontMap[figmaFont] || 'var(--chocolate-primary-font)';
  }

  mapFigmaFontWeight(weight) {
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

  mapFigmaLineHeight(lineHeight) {
    return typeof lineHeight === 'number' ? lineHeight.toString() : lineHeight;
  }

  mapToChocolateColor(color) {
    const colorMap = {
      '#D2691E': 'var(--chocolate-primary)',
      '#8B4513': 'var(--chocolate-secondary)',
      '#FFD700': 'var(--chocolate-accent)',
      '#FFF8DC': 'var(--chocolate-background)',
      '#2F1B14': 'var(--chocolate-text)',
      '#F5F5DC': 'var(--chocolate-light)',
      '#1A0F0A': 'var(--chocolate-dark)',
      '#FFFFFF': 'var(--chocolate-white)',
      '#6B7280': 'var(--chocolate-gray)'
    };
    
    return colorMap[color] || color;
  }

  mapToChocolateShadow(effect) {
    const { x, y, blur, spread, color, opacity } = effect;
    const chocolateColor = this.mapToChocolateColor(color);
    const alpha = opacity !== undefined ? opacity : 1;
    
    return `${x}px ${y}px ${blur}px ${spread}px ${chocolateColor.replace('var(--chocolate-', 'rgba(').replace(')', `, ${alpha})`)}`;
  }
}

module.exports = SimplyChocolateCSSGenerator;
