/**
 * Спеціальний аналізатор для Figma макету Simply Chocolate
 * Оптимізований для конкретного макету з детальним аналізом структури
 * @version 1.0.0
 */

const FigmaAnalyzer = require('./FigmaAnalyzer');

class SimplyChocolateAnalyzer extends FigmaAnalyzer {
  constructor() {
    super();
    this.chocolateTheme = {
      colors: {
        primary: '#D2691E',      // Chocolate brown
        secondary: '#8B4513',    // Saddle brown
        accent: '#FFD700',       // Gold
        background: '#FFF8DC',   // Cornsilk
        text: '#2F1B14',         // Dark brown
        light: '#F5F5DC'         // Beige
      },
      typography: {
        primaryFont: 'Inter',
        secondaryFont: 'Playfair Display',
        headingFont: 'Montserrat'
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48
      },
      breakpoints: {
        mobile: 375,
        tablet: 768,
        desktop: 1200,
        wide: 1440
      }
    };
  }

  /**
   * Спеціалізований аналіз Simply Chocolate макету
   */
  analyzeSimplyChocolate(figmaData) {
    const baseAnalysis = super.analyzeFigma(figmaData);
    
    // Додатковий аналіз специфічний для Simply Chocolate
    const chocolateAnalysis = {
      ...baseAnalysis,
      chocolateSpecific: {
        sections: this.identifyChocolateSections(baseAnalysis),
        components: this.identifyChocolateComponents(baseAnalysis),
        layout: this.analyzeChocolateLayout(baseAnalysis),
        colors: this.extractChocolateColors(baseAnalysis),
        typography: this.extractChocolateTypography(baseAnalysis),
        spacing: this.analyzeChocolateSpacing(baseAnalysis),
        responsive: this.analyzeResponsiveStructure(baseAnalysis)
      }
    };

    return chocolateAnalysis;
  }

  /**
   * Ідентифікація секцій Simply Chocolate
   */
  identifyChocolateSections(analysis) {
    const sections = [];
    
    analysis.hierarchy.forEach((element, id) => {
      const name = element.name.toLowerCase();
      
      if (name.includes('header') || name.includes('navigation')) {
        sections.push({
          id,
          type: 'header',
          name: element.name,
          elements: this.getSectionElements(element, analysis.hierarchy)
        });
      } else if (name.includes('hero') || name.includes('banner')) {
        sections.push({
          id,
          type: 'hero',
          name: element.name,
          elements: this.getSectionElements(element, analysis.hierarchy)
        });
      } else if (name.includes('about') || name.includes('story')) {
        sections.push({
          id,
          type: 'about',
          name: element.name,
          elements: this.getSectionElements(element, analysis.hierarchy)
        });
      } else if (name.includes('products') || name.includes('catalog')) {
        sections.push({
          id,
          type: 'products',
          name: element.name,
          elements: this.getSectionElements(element, analysis.hierarchy)
        });
      } else if (name.includes('contact') || name.includes('footer')) {
        sections.push({
          id,
          type: 'footer',
          name: element.name,
          elements: this.getSectionElements(element, analysis.hierarchy)
        });
      }
    });

    return sections;
  }

  /**
   * Ідентифікація компонентів Simply Chocolate
   */
  identifyChocolateComponents(analysis) {
    const components = [];
    
    analysis.hierarchy.forEach((element, id) => {
      const name = element.name.toLowerCase();
      
      if (name.includes('card') || name.includes('product-card')) {
        components.push({
          id,
          type: 'product-card',
          name: element.name,
          styles: element.styles,
          content: element.content
        });
      } else if (name.includes('button') || name.includes('btn')) {
        components.push({
          id,
          type: 'button',
          name: element.name,
          styles: element.styles,
          variants: this.identifyButtonVariants(element)
        });
      } else if (name.includes('input') || name.includes('form')) {
        components.push({
          id,
          type: 'form-input',
          name: element.name,
          styles: element.styles
        });
      } else if (name.includes('logo') || name.includes('brand')) {
        components.push({
          id,
          type: 'logo',
          name: element.name,
          styles: element.styles
        });
      }
    });

    return components;
  }

  /**
   * Аналіз layout Simply Chocolate
   */
  analyzeChocolateLayout(analysis) {
    const layout = {
      containers: [],
      grids: [],
      flexbox: [],
      positioning: []
    };

    analysis.hierarchy.forEach((element, id) => {
      const name = element.name.toLowerCase();
      const styles = element.styles;

      // Container analysis
      if (name.includes('container') || name.includes('wrapper')) {
        layout.containers.push({
          id,
          name: element.name,
          maxWidth: this.extractMaxWidth(styles),
          padding: this.extractPadding(styles),
          margin: this.extractMargin(styles)
        });
      }

      // Grid analysis
      if (name.includes('grid') || name.includes('row') || name.includes('col')) {
        layout.grids.push({
          id,
          name: element.name,
          columns: this.extractGridColumns(styles),
          gap: this.extractGap(styles),
          alignment: this.extractAlignment(styles)
        });
      }

      // Flexbox analysis
      if (styles?.layout?.display === 'flex') {
        layout.flexbox.push({
          id,
          name: element.name,
          direction: styles.layout.flexDirection,
          justify: styles.layout.justifyContent,
          align: styles.layout.alignItems,
          wrap: styles.layout.flexWrap
        });
      }
    });

    return layout;
  }

  /**
   * Витягування кольорів Simply Chocolate
   */
  extractChocolateColors(analysis) {
    const colors = {
      primary: [],
      secondary: [],
      accent: [],
      background: [],
      text: [],
      custom: []
    };

    analysis.hierarchy.forEach((element, id) => {
      const elementColors = element.styles?.colors || [];
      
      elementColors.forEach(color => {
        if (color.type === 'solid') {
          const colorCategory = this.categorizeColor(color.color);
          colors[colorCategory].push({
            id,
            color: color.color,
            opacity: color.opacity,
            element: element.name
          });
        }
      });
    });

    return colors;
  }

  /**
   * Витягування типографіки Simply Chocolate
   */
  extractChocolateTypography(analysis) {
    const typography = {
      headings: [],
      body: [],
      buttons: [],
      navigation: [],
      custom: []
    };

    analysis.hierarchy.forEach((element, id) => {
      const typographyStyles = element.styles?.typography;
      
      if (typographyStyles) {
        const category = this.categorizeTypography(element, typographyStyles);
        typography[category].push({
          id,
          name: element.name,
          fontFamily: typographyStyles.fontFamily,
          fontSize: typographyStyles.fontSize,
          fontWeight: typographyStyles.fontWeight,
          lineHeight: typographyStyles.lineHeight,
          color: this.extractTextColor(element.styles)
        });
      }
    });

    return typography;
  }

  /**
   * Аналіз spacing Simply Chocolate
   */
  analyzeChocolateSpacing(analysis) {
    const spacing = {
      padding: [],
      margin: [],
      gap: [],
      consistent: true
    };

    const spacingValues = new Set();

    analysis.hierarchy.forEach((element, id) => {
      const styles = element.styles;
      
      // Padding analysis
      if (styles?.spacing) {
        Object.entries(styles.spacing).forEach(([property, value]) => {
          if (property.includes('padding')) {
            spacing.padding.push({
              id,
              property,
              value,
              element: element.name
            });
            spacingValues.add(parseInt(value));
          }
        });
      }

      // Gap analysis
      if (styles?.layout?.gap) {
        spacing.gap.push({
          id,
          value: styles.layout.gap,
          element: element.name
        });
        spacingValues.add(parseInt(styles.layout.gap));
      }
    });

    // Check for consistent spacing
    const uniqueValues = Array.from(spacingValues).sort((a, b) => a - b);
    spacing.consistent = this.checkSpacingConsistency(uniqueValues);

    return spacing;
  }

  /**
   * Аналіз responsive структури
   */
  analyzeResponsiveStructure(analysis) {
    const responsive = {
      breakpoints: this.chocolateTheme.breakpoints,
      mobile: [],
      tablet: [],
      desktop: [],
      wide: []
    };

    analysis.hierarchy.forEach((element, id) => {
      const name = element.name.toLowerCase();
      const styles = element.styles;
      
      // Categorize by responsive indicators
      if (name.includes('mobile') || name.includes('sm')) {
        responsive.mobile.push({
          id,
          name: element.name,
          styles: this.extractResponsiveStyles(styles, 'mobile')
        });
      } else if (name.includes('tablet') || name.includes('md')) {
        responsive.tablet.push({
          id,
          name: element.name,
          styles: this.extractResponsiveStyles(styles, 'tablet')
        });
      } else if (name.includes('desktop') || name.includes('lg')) {
        responsive.desktop.push({
          id,
          name: element.name,
          styles: this.extractResponsiveStyles(styles, 'desktop')
        });
      } else if (name.includes('wide') || name.includes('xl')) {
        responsive.wide.push({
          id,
          name: element.name,
          styles: this.extractResponsiveStyles(styles, 'wide')
        });
      }
    });

    return responsive;
  }

  /**
   * Допоміжні методи
   */
  getSectionElements(sectionElement, hierarchy) {
    const elements = [sectionElement.id];
    
    if (sectionElement.children) {
      sectionElement.children.forEach(childId => {
        const child = hierarchy.get(childId);
        if (child) {
          elements.push(childId);
          elements.push(...this.getSectionElements(child, hierarchy));
        }
      });
    }
    
    return elements;
  }

  identifyButtonVariants(element) {
    const name = element.name.toLowerCase();
    const variants = [];
    
    if (name.includes('primary')) variants.push('primary');
    if (name.includes('secondary')) variants.push('secondary');
    if (name.includes('outline')) variants.push('outline');
    if (name.includes('ghost')) variants.push('ghost');
    if (name.includes('large') || name.includes('lg')) variants.push('large');
    if (name.includes('small') || name.includes('sm')) variants.push('small');
    
    return variants;
  }

  categorizeColor(color) {
    const colorMap = {
      '#D2691E': 'primary',
      '#8B4513': 'secondary', 
      '#FFD700': 'accent',
      '#FFF8DC': 'background',
      '#2F1B14': 'text',
      '#F5F5DC': 'background'
    };
    
    return colorMap[color] || 'custom';
  }

  categorizeTypography(element, typography) {
    const name = element.name.toLowerCase();
    const role = element.semanticRole;
    
    if (name.includes('heading') || name.includes('title') || role === 'heading') {
      return 'headings';
    } else if (name.includes('button') || name.includes('btn')) {
      return 'buttons';
    } else if (name.includes('nav') || name.includes('menu')) {
      return 'navigation';
    } else if (name.includes('body') || name.includes('text') || role === 'text') {
      return 'body';
    }
    
    return 'custom';
  }

  extractMaxWidth(styles) {
    return styles?.positioning?.width || '100%';
  }

  extractPadding(styles) {
    return styles?.spacing || {};
  }

  extractMargin(styles) {
    return styles?.spacing || {};
  }

  extractGridColumns(styles) {
    return styles?.layout?.gridTemplateColumns || 'auto';
  }

  extractGap(styles) {
    return styles?.layout?.gap || '0';
  }

  extractAlignment(styles) {
    return {
      justify: styles?.layout?.justifyContent || 'start',
      align: styles?.layout?.alignItems || 'start'
    };
  }

  extractTextColor(styles) {
    const colors = styles?.colors || [];
    return colors.find(c => c.type === 'solid')?.color || '#000000';
  }

  extractResponsiveStyles(styles, breakpoint) {
    return {
      display: styles?.layout?.display,
      flexDirection: styles?.layout?.flexDirection,
      width: styles?.positioning?.width,
      height: styles?.positioning?.height,
      padding: styles?.spacing,
      gap: styles?.layout?.gap
    };
  }

  checkSpacingConsistency(values) {
    if (values.length <= 1) return true;
    
    // Check if values follow a consistent pattern (e.g., multiples of 4, 8, 16)
    const patterns = [4, 8, 16];
    
    return patterns.some(pattern => 
      values.every(value => value % pattern === 0)
    );
  }

  /**
   * Генерація CSS змінних для Simply Chocolate
   */
  generateChocolateCSSVariables() {
    const { colors, typography, spacing, breakpoints } = this.chocolateTheme;
    
    let css = ':root {\n';
    
    // Colors
    css += '  /* Chocolate Theme Colors */\n';
    Object.entries(colors).forEach(([key, value]) => {
      css += `  --chocolate-${key}: ${value};\n`;
    });
    
    // Typography
    css += '\n  /* Typography */\n';
    Object.entries(typography).forEach(([key, value]) => {
      css += `  --chocolate-${key}: ${value};\n`;
    });
    
    // Spacing
    css += '\n  /* Spacing Scale */\n';
    Object.entries(spacing).forEach(([key, value]) => {
      css += `  --chocolate-spacing-${key}: ${value}px;\n`;
    });
    
    // Breakpoints
    css += '\n  /* Breakpoints */\n';
    Object.entries(breakpoints).forEach(([key, value]) => {
      css += `  --chocolate-${key}: ${value}px;\n`;
    });
    
    css += '}\n';
    
    return css;
  }

  /**
   * Генерація responsive CSS для Simply Chocolate
   */
  generateChocolateResponsiveCSS(analysis) {
    const { responsive } = analysis.chocolateSpecific;
    let css = '';
    
    Object.entries(responsive.breakpoints).forEach(([breakpoint, size]) => {
      if (responsive[breakpoint].length > 0) {
        css += `@media (min-width: ${size}px) {\n`;
        
        responsive[breakpoint].forEach(element => {
          css += `  .${this.sanitizeClassName(element.name)} {\n`;
          
          if (element.styles.display) {
            css += `    display: ${element.styles.display};\n`;
          }
          if (element.styles.flexDirection) {
            css += `    flex-direction: ${element.styles.flexDirection};\n`;
          }
          if (element.styles.width) {
            css += `    width: ${element.styles.width};\n`;
          }
          if (element.styles.gap) {
            css += `    gap: ${element.styles.gap};\n`;
          }
          
          css += '  }\n';
        });
        
        css += '}\n\n';
      }
    });
    
    return css;
  }

  sanitizeClassName(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}

module.exports = SimplyChocolateAnalyzer;
