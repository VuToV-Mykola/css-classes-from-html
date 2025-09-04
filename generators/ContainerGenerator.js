/**
 * @module ContainerGenerator
 * @description Генератор контейнерних класів та компонентів
 * @author Ukrainian Developer
 * @version 2.0.0
 */

class ContainerGenerator {
  constructor(options = {}) {
    this.options = {
      maxWidth: 1200,
      padding: 16,
      fluidBelow: 768,
      generateUtilities: true,
      useContainerQueries: true,
      generateComponents: true,
      ...options
    };

    this.containerTypes = new Map();
    this.breakpoints = {
      xs: 320,
      sm: 576,
      md: 768,
      lg: 1024,
      xl: 1200,
      xxl: 1440
    };
  }

  /**
   * Генерація системи контейнерів
   * @param {Object} config - Конфігурація проекту
   * @returns {Object} Система контейнерів
   */
  generateContainerSystem(config) {
    const system = {
      containers: this.generateContainers(config),
      utilities: this.options.generateUtilities ? this.generateUtilityClasses() : {},
      components: this.options.generateComponents ? this.generateComponents(config) : {},
      variables: this.generateCSSVariables(config),
      mixins: this.generateMixins(),
      documentation: this.generateDocumentation()
    };

    return system;
  }

  /**
   * Генерація основних контейнерів
   * @param {Object} config - Конфігурація
   * @returns {Object} Контейнери
   */
  generateContainers(config) {
    const containers = {};

    // Базовий контейнер
    containers.base = this.generateBaseContainer(config);
    
    // Флюїдний контейнер
    containers.fluid = this.generateFluidContainer();
    
    // Адаптивний контейнер
    containers.responsive = this.generateResponsiveContainer();
    
    // Container Queries контейнер
    if (this.options.useContainerQueries) {
      containers.queryContainer = this.generateQueryContainer();
    }
    
    // Секційні контейнери
    containers.section = this.generateSectionContainer();
    
    // Контейнер для контенту
    containers.content = this.generateContentContainer();
    
    // Спеціалізовані контейнери
    containers.hero = this.generateHeroContainer();
    containers.card = this.generateCardContainer();
    containers.modal = this.generateModalContainer();
    
    return containers;
  }

  /**
   * Генерація базового контейнера
   * @param {Object} config - Конфігурація
   * @returns {Object} Базовий контейнер
   */
  generateBaseContainer(config) {
    const maxWidth = config.maxWidth || this.options.maxWidth;
    const padding = config.padding || this.options.padding;
    
    return {
      className: 'container',
      styles: {
        width: '100%',
        maxWidth: `${maxWidth}px`,
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: `${padding}px`,
        paddingRight: `${padding}px`,
        boxSizing: 'border-box'
      },
      responsive: this.generateResponsivePadding(padding),
      modifiers: this.generateContainerModifiers()
    };
  }

  /**
   * Генерація флюїдного контейнера
   * @returns {Object} Флюїдний контейнер
   */
  generateFluidContainer() {
    return {
      className: 'container-fluid',
      styles: {
        width: '100%',
        paddingLeft: 'var(--container-padding, 1rem)',
        paddingRight: 'var(--container-padding, 1rem)',
        boxSizing: 'border-box'
      },
      responsive: {
        mobile: {
          paddingLeft: '16px',
          paddingRight: '16px'
        },
        tablet: {
          paddingLeft: '24px',
          paddingRight: '24px'
        },
        desktop: {
          paddingLeft: '32px',
          paddingRight: '32px'
        }
      }
    };
  }

  /**
   * Генерація адаптивного контейнера
   * @returns {Object} Адаптивний контейнер
   */
  generateResponsiveContainer() {
    return {
      className: 'container-responsive',
      styles: {
        width: '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: 'clamp(1rem, 4vw, 3rem)',
        paddingRight: 'clamp(1rem, 4vw, 3rem)',
        boxSizing: 'border-box'
      },
      breakpoints: this.generateBreakpointContainers()
    };
  }

  /**
   * Генерація Query Container
   * @returns {Object} Query container
   */
  generateQueryContainer() {
    return {
      className: 'query-container',
      styles: {
        containerType: 'inline-size',
        containerName: 'main',
        width: '100%',
        position: 'relative'
      },
      queries: this.generateContainerQueries(),
      nested: this.generateNestedContainers()
    };
  }

  /**
   * Генерація секційного контейнера
   * @returns {Object} Секційний контейнер
   */
  generateSectionContainer() {
    return {
      className: 'container-section',
      styles: {
        width: '100%',
        paddingTop: 'var(--section-spacing-y, 4rem)',
        paddingBottom: 'var(--section-spacing-y, 4rem)',
        paddingLeft: 'var(--section-spacing-x, 2rem)',
        paddingRight: 'var(--section-spacing-x, 2rem)'
      },
      variants: {
        compact: {
          paddingTop: '2rem',
          paddingBottom: '2rem'
        },
        spacious: {
          paddingTop: '6rem',
          paddingBottom: '6rem'
        },
        full: {
          paddingTop: '8rem',
          paddingBottom: '8rem'
        }
      }
    };
  }

  /**
   * Генерація контентного контейнера
   * @returns {Object} Контентний контейнер
   */
  generateContentContainer() {
    return {
      className: 'container-content',
      styles: {
        width: '100%',
        maxWidth: '65ch', // Оптимальна довжина рядка для читання
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: '1rem'
      },
      typography: {
        fontSize: 'clamp(1rem, 1rem + 0.5vw, 1.25rem)',
        lineHeight: 1.6,
        letterSpacing: '0.01em'
      },
      variants: {
        prose: {
          maxWidth: '65ch'
        },
        narrow: {
          maxWidth: '45ch'
        },
        wide: {
          maxWidth: '85ch'
        }
      }
    };
  }

  /**
   * Генерація Hero контейнера
   * @returns {Object} Hero контейнер
   */
  generateHeroContainer() {
    return {
      className: 'container-hero',
      styles: {
        width: '100%',
        minHeight: 'min(100vh, 800px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(2rem, 8vw, 6rem)',
        position: 'relative',
        overflow: 'hidden'
      },
      inner: {
        maxWidth: '1200px',
        width: '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
        zIndex: 1
      },
      background: {
        position: 'absolute',
        inset: 0,
        zIndex: 0
      }
    };
  }

  /**
   * Генерація Card контейнера
   * @returns {Object} Card контейнер
   */
  generateCardContainer() {
    return {
      className: 'container-card',
      styles: {
        width: '100%',
        padding: 'var(--card-padding, 1.5rem)',
        borderRadius: 'var(--card-radius, 0.5rem)',
        backgroundColor: 'var(--card-bg, white)',
        boxShadow: 'var(--card-shadow, 0 2px 8px rgba(0,0,0,0.1))',
        position: 'relative',
        overflow: 'hidden'
      },
      variants: {
        compact: {
          padding: '1rem'
        },
        spacious: {
          padding: '2rem'
        },
        bordered: {
          border: '1px solid var(--border-color, #e0e0e0)',
          boxShadow: 'none'
        },
        elevated: {
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
        }
      },
      responsive: {
        mobile: {
          padding: '1rem',
          borderRadius: '0.375rem'
        },
        desktop: {
          padding: '1.5rem',
          borderRadius: '0.5rem'
        }
      }
    };
  }

  /**
   * Генерація Modal контейнера
   * @returns {Object} Modal контейнер
   */
  generateModalContainer() {
    return {
      className: 'container-modal',
      styles: {
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        margin: 'auto',
        padding: '2rem',
        borderRadius: '0.5rem',
        backgroundColor: 'white',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        position: 'relative',
        overflow: 'auto'
      },
      sizes: {
        small: { maxWidth: '400px' },
        medium: { maxWidth: '600px' },
        large: { maxWidth: '800px' },
        full: { maxWidth: '95%' }
      },
      overlay: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }
    };
  }

  /**
   * Генерація utility класів
   * @returns {Object} Utility класи
   */
  generateUtilityClasses() {
    return {
      spacing: this.generateSpacingUtilities(),
      sizing: this.generateSizingUtilities(),
      display: this.generateDisplayUtilities(),
      position: this.generatePositionUtilities(),
      overflow: this.generateOverflowUtilities()
    };
  }

  /**
   * Генерація spacing utilities
   * @returns {Object} Spacing utilities
   */
  generateSpacingUtilities() {
    const utilities = {};
    const spacings = [0, 0.25, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8];
    
    spacings.forEach(spacing => {
      const value = `${spacing}rem`;
      const key = spacing.toString().replace('.', '_');
      
      // Padding
      utilities[`p-${key}`] = { padding: value };
      utilities[`px-${key}`] = { paddingLeft: value, paddingRight: value };
      utilities[`py-${key}`] = { paddingTop: value, paddingBottom: value };
      utilities[`pt-${key}`] = { paddingTop: value };
      utilities[`pr-${key}`] = { paddingRight: value };
      utilities[`pb-${key}`] = { paddingBottom: value };
      utilities[`pl-${key}`] = { paddingLeft: value };
      
      // Margin
      utilities[`m-${key}`] = { margin: value };
      utilities[`mx-${key}`] = { marginLeft: value, marginRight: value };
      utilities[`my-${key}`] = { marginTop: value, marginBottom: value };
      utilities[`mt-${key}`] = { marginTop: value };
      utilities[`mr-${key}`] = { marginRight: value };
      utilities[`mb-${key}`] = { marginBottom: value };
      utilities[`ml-${key}`] = { marginLeft: value };
    });
    
    // Auto margins
    utilities['mx-auto'] = { marginLeft: 'auto', marginRight: 'auto' };
    utilities['my-auto'] = { marginTop: 'auto', marginBottom: 'auto' };
    utilities['m-auto'] = { margin: 'auto' };
    
    return utilities;
  }

  /**
   * Генерація sizing utilities
   * @returns {Object} Sizing utilities
   */
  generateSizingUtilities() {
    return {
      // Width
      'w-full': { width: '100%' },
      'w-screen': { width: '100vw' },
      'w-min': { width: 'min-content' },
      'w-max': { width: 'max-content' },
      'w-fit': { width: 'fit-content' },
      
      // Height
      'h-full': { height: '100%' },
      'h-screen': { height: '100vh' },
      'h-min': { height: 'min-content' },
      'h-max': { height: 'max-content' },
      'h-fit': { height: 'fit-content' },
      
      // Min/Max
      'min-w-0': { minWidth: '0' },
      'min-w-full': { minWidth: '100%' },
      'max-w-none': { maxWidth: 'none' },
      'max-w-full': { maxWidth: '100%' },
      'max-w-screen': { maxWidth: '100vw' },
      'max-w-prose': { maxWidth: '65ch' }
    };
  }

  /**
   * Генерація компонентів
   * @param {Object} config - Конфігурація
   * @returns {Object} Компоненти
   */
  generateComponents(config) {
    return {
      grid: this.generateGridComponent(),
      stack: this.generateStackComponent(),
      cluster: this.generateClusterComponent(),
      sidebar: this.generateSidebarComponent(),
      switcher: this.generateSwitcherComponent()
    };
  }

  /**
   * Генерація Grid компонента
   * @returns {Object} Grid компонент
   */
  generateGridComponent() {
    return {
      className: 'grid-container',
      styles: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
        gap: 'var(--grid-gap, 1rem)',
        width: '100%'
      },
      variants: {
        '2-col': { gridTemplateColumns: 'repeat(2, 1fr)' },
        '3-col': { gridTemplateColumns: 'repeat(3, 1fr)' },
        '4-col': { gridTemplateColumns: 'repeat(4, 1fr)' },
        'auto': { gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }
      }
    };
  }

  /**
   * Генерація Stack компонента
   * @returns {Object} Stack компонент
   */
  generateStackComponent() {
    return {
      className: 'stack',
      styles: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--stack-gap, 1rem)',
        width: '100%'
      },
      variants: {
        horizontal: { flexDirection: 'row' },
        reverse: { flexDirection: 'column-reverse' },
        center: { alignItems: 'center' },
        stretch: { alignItems: 'stretch' }
      }
    };
  }

  /**
   * Генерація CSS змінних
   * @param {Object} config - Конфігурація
   * @returns {Object} CSS змінні
   */
  generateCSSVariables(config) {
    return {
      // Container змінні
      '--container-max-width': `${config.maxWidth || this.options.maxWidth}px`,
      '--container-padding': '1rem',
      '--container-padding-mobile': '1rem',
      '--container-padding-tablet': '1.5rem',
      '--container-padding-desktop': '2rem',
      
      // Spacing змінні
      '--spacing-xs': '0.25rem',
      '--spacing-sm': '0.5rem',
      '--spacing-md': '1rem',
      '--spacing-lg': '1.5rem',
      '--spacing-xl': '2rem',
      '--spacing-2xl': '3rem',
      '--spacing-3xl': '4rem',
      
      // Section змінні
      '--section-spacing-y': '4rem',
      '--section-spacing-x': '2rem',
      
      // Component змінні
      '--card-padding': '1.5rem',
      '--card-radius': '0.5rem',
      '--card-shadow': '0 2px 8px rgba(0,0,0,0.1)',
      
      // Grid/Flex змінні
      '--grid-gap': '1rem',
      '--stack-gap': '1rem',
      '--cluster-gap': '0.5rem'
    };
  }

  /**
   * Компіляція в CSS
   * @param {Object} system - Система контейнерів
   * @returns {string} CSS код
   */
  compileToCSS(system) {
    let css = '';
    
    // CSS змінні
    css += ':root {\n';
    Object.entries(system.variables).forEach(([name, value]) => {
      css += `  ${name}: ${value};\n`;
    });
    css += '}\n\n';
    
    // Контейнери
    Object.values(system.containers).forEach(container => {
      css += this.compileContainer(container);
    });
    
    // Utilities
    if (system.utilities) {
      css += '\n/* Utility Classes */\n';
      Object.entries(system.utilities).forEach(([category, utilities]) => {
        css += `\n/* ${category} */\n`;
        Object.entries(utilities).forEach(([className, styles]) => {
          css += `.${className} {\n`;
          Object.entries(styles).forEach(([prop, value]) => {
            const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
            css += `  ${cssProp}: ${value};\n`;
          });
          css += '}\n';
        });
      });
    }
    
    // Компоненти
    if (system.components) {
      css += '\n/* Components */\n';
      Object.values(system.components).forEach(component => {
        css += this.compileComponent(component);
      });
    }
    
    return css;
  }

  // === Приватні допоміжні методи ===

  /**
   * Генерація адаптивних padding
   */
  generateResponsivePadding(basePadding) {
    return {
      mobile: {
        paddingLeft: `${basePadding}px`,
        paddingRight: `${basePadding}px`
      },
      tablet: {
        paddingLeft: `${basePadding * 1.5}px`,
        paddingRight: `${basePadding * 1.5}px`
      },
      desktop: {
        paddingLeft: `${basePadding * 2}px`,
        paddingRight: `${basePadding * 2}px`
      }
    };
  }

  /**
   * Генерація модифікаторів контейнера
   */
  generateContainerModifiers() {
    return {
      small: { maxWidth: '800px' },
      medium: { maxWidth: '1000px' },
      large: { maxWidth: '1400px' },
      full: { maxWidth: '100%' },
      left: { marginLeft: '0' },
      right: { marginRight: '0' },
      center: { marginLeft: 'auto', marginRight: 'auto' }
    };
  }

  /**
   * Генерація breakpoint контейнерів
   */
  generateBreakpointContainers() {
    const containers = {};
    
    Object.entries(this.breakpoints).forEach(([name, width]) => {
      containers[name] = {
        minWidth: `${width}px`,
        styles: {
          maxWidth: `${width - 40}px`,
          paddingLeft: '20px',
          paddingRight: '20px'
        }
      };
    });
    
    return containers;
  }

  /**
   * Генерація container queries
   */
  generateContainerQueries() {
    return [
      {
        condition: '(min-width: 400px)',
        styles: { fontSize: '1rem' }
      },
      {
        condition: '(min-width: 600px)',
        styles: { fontSize: '1.125rem' }
      },
      {
        condition: '(min-width: 900px)',
        styles: { fontSize: '1.25rem' }
      }
    ];
  }

  /**
   * Генерація вкладених контейнерів
   */
  generateNestedContainers() {
    return {
      inner: {
        containerType: 'inline-size',
        containerName: 'inner'
      },
      content: {
        containerType: 'inline-size',
        containerName: 'content'
      }
    };
  }

  /**
   * Генерація інших utility класів
   */
  generateDisplayUtilities() {
    return {
      'block': { display: 'block' },
      'inline-block': { display: 'inline-block' },
      'inline': { display: 'inline' },
      'flex': { display: 'flex' },
      'inline-flex': { display: 'inline-flex' },
      'grid': { display: 'grid' },
      'inline-grid': { display: 'inline-grid' },
      'hidden': { display: 'none' }
    };
  }

  generatePositionUtilities() {
    return {
      'static': { position: 'static' },
      'relative': { position: 'relative' },
      'absolute': { position: 'absolute' },
      'fixed': { position: 'fixed' },
      'sticky': { position: 'sticky' }
    };
  }

  generateOverflowUtilities() {
    return {
      'overflow-auto': { overflow: 'auto' },
      'overflow-hidden': { overflow: 'hidden' },
      'overflow-visible': { overflow: 'visible' },
      'overflow-scroll': { overflow: 'scroll' },
      'overflow-x-auto': { overflowX: 'auto' },
      'overflow-y-auto': { overflowY: 'auto' }
    };
  }

  /**
   * Генерація додаткових компонентів
   */
  generateClusterComponent() {
    return {
      className: 'cluster',
      styles: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--cluster-gap, 0.5rem)',
        alignItems: 'center'
      }
    };
  }

  generateSidebarComponent() {
    return {
      className: 'sidebar-layout',
      styles: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--sidebar-gap, 1rem)'
      },
      sidebar: {
        flexBasis: '20rem',
        flexGrow: 1
      },
      content: {
        flexBasis: 0,
        flexGrow: 999,
        minInlineSize: '50%'
      }
    };
  }

  generateSwitcherComponent() {
    return {
      className: 'switcher',
      styles: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--switcher-gap, 1rem)'
      },
      threshold: '30rem',
      limit: 3
    };
  }

  /**
   * Генерація документації
   */
  generateDocumentation() {
    return {
      overview: 'Container System Documentation',
      usage: {
        basic: 'Use .container for standard centered layout',
        fluid: 'Use .container-fluid for full-width layouts',
        responsive: 'Use .container-responsive for fluid responsive layouts'
      },
      modifiers: {
        sizing: ['small', 'medium', 'large', 'full'],
        alignment: ['left', 'center', 'right']
      },
      utilities: {
        spacing: 'p-*, m-* for padding and margin',
        sizing: 'w-*, h-* for width and height',
        display: 'flex, grid, hidden for display'
      }
    };
  }

  /**
   * Компіляція контейнера
   */
  compileContainer(container) {
    let css = `.${container.className} {\n`;
    
    Object.entries(container.styles).forEach(([prop, value]) => {
      const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
      css += `  ${cssProp}: ${value};\n`;
    });
    css += '}\n\n';
    
    // Responsive стилі
    if (container.responsive) {
      if (container.responsive.mobile) {
        css += `@media (max-width: 767px) {\n`;
        css += `  .${container.className} {\n`;
        Object.entries(container.responsive.mobile).forEach(([prop, value]) => {
          const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
          css += `    ${cssProp}: ${value};\n`;
        });
        css += '  }\n}\n\n';
      }
    }
    
    // Variants
    if (container.variants) {
      Object.entries(container.variants).forEach(([variant, styles]) => {
        css += `.${container.className}--${variant} {\n`;
        Object.entries(styles).forEach(([prop, value]) => {
          const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
          css += `  ${cssProp}: ${value};\n`;
        });
        css += '}\n\n';
      });
    }
    
    return css;
  }

  /**
   * Компіляція компонента
   */
  compileComponent(component) {
    let css = `.${component.className} {\n`;
    
    Object.entries(component.styles).forEach(([prop, value]) => {
      const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
      css += `  ${cssProp}: ${value};\n`;
    });
    css += '}\n\n';
    
    if (component.variants) {
      Object.entries(component.variants).forEach(([variant, styles]) => {
        css += `.${component.className}--${variant} {\n`;
        Object.entries(styles).forEach(([prop, value]) => {
          const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
          css += `  ${cssProp}: ${value};\n`;
        });
        css += '}\n\n';
      });
    }
    
    return css;
  }
}

// Експорт модуля
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContainerGenerator;
}