/**
 * Розширений генератор CSS з підтримкою сучасних стандартів та адаптивності
 */
class CSSGenerator {
  constructor(options = {}) {
    this.options = {
      includeReset: true,
      useModernProperties: true,
      generateResponsive: true,
      optimizeForPerformance: true,
      includeContainerQueries: true,
      useCascadeLayers: false,
      ...options,
    };

    this.cssRules = new Map();
    this.mediaQueries = new Map();
    this.containerQueries = new Map();
    this.customProperties = new Map();
  }

  /**
   * Головний метод генерації CSS
   */
  generateCSS(matchedStyles, figmaData, htmlData) {
    // Очищення попередніх правил
    this.cssRules.clear();
    this.mediaQueries.clear();
    this.containerQueries.clear();
    this.customProperties.clear();

    // Генерація CSS змінних з Figma токенів
    this.generateCSSVariables(figmaData);

    // Генерація базових стилів
    if (this.options.includeReset) {
      this.generateResetStyles();
    }

    // Генерація контейнера
    this.generateContainerStyles();

    // Генерація стилів для кожного співставленого елемента
    matchedStyles.matches.forEach((match, figmaId) => {
      const figmaElement = figmaData.hierarchy.get(figmaId);
      const htmlElement = htmlData.hierarchy.get(match.htmlElement);

      this.generateElementStyles(figmaElement, htmlElement);
    });

    // Генерація адаптивних стилів
    if (this.options.generateResponsive) {
      this.generateResponsiveStyles(figmaData);
    }

    // Компіляція фінального CSS
    return this.compileCSS();
  }

  /**
   * Генерація CSS змінних з Figma токенів
   */
  generateCSSVariables(figmaData) {
    const variables = new Map();

    // Збір кольорів
    figmaData.hierarchy.forEach((element) => {
      if (element.styles?.visual?.["background-color"]) {
        const color = element.styles.visual["background-color"];
        const varName = this.generateColorVariable(element.name);
        variables.set(varName, color);
      }

      if (element.styles?.typography?.color) {
        const color = element.styles.typography.color;
        const varName = this.generateColorVariable(element.name + "-text");
        variables.set(varName, color);
      }
    });

    // Збір шрифтів
    const fonts = new Set();
    figmaData.hierarchy.forEach((element) => {
      if (element.styles?.typography?.["font-family"]) {
        fonts.add(element.styles.typography["font-family"]);
      }
    });

    fonts.forEach((font, index) => {
      variables.set(`--font-family-${index + 1}`, font);
    });

    // Збір spacing значень
    const spacings = new Set();
    figmaData.hierarchy.forEach((element) => {
      if (element.styles?.layout?.gap) {
        spacings.add(element.styles.layout.gap);
      }
      if (element.styles?.layout?.padding) {
        spacings.add(element.styles.layout.padding);
      }
    });

    Array.from(spacings)
      .sort((a, b) => {
        return parseInt(a) - parseInt(b);
      })
      .forEach((spacing, index) => {
        variables.set(`--spacing-${index + 1}`, spacing);
      });

    this.customProperties = variables;
  }

  /**
   * Генерація reset стилів
   */
  generateResetStyles() {
    const resetCSS = `
/* CSS Reset з современними підходами */
*,
*::before,
*::after {
    box-sizing: border-box;
}

* {
    margin: 0;
}

body {
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
}

img,
picture,
video,
canvas,
svg {
    display: block;
    max-width: 100%;
    height: auto;
}

input,
button,
textarea,
select {
    font: inherit;
}

p,
h1,
h2,
h3,
h4,
h5,
h6 {
    overflow-wrap: break-word;
}

#root,
#__next {
    isolation: isolate;
}
`;

    this.cssRules.set("reset", resetCSS);
  }

  /**
   * Генерація стилів контейнера
   */
  generateContainerStyles() {
    const containerCSS = `
/* Контейнер з адаптивною шириною */
.container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 16px;
    container-type: inline-size;
}

/* Секції з універсальним падінгом */
.section {
    padding: 60px 0;
}

@media (min-width: 768px) {
    .container {
        padding: 0 32px;
    }
    
    .section {
        padding: 80px 0;
    }
}

@media (min-width: 1200px) {
    .container {
        padding: 0 15px;
    }
    
    .section {
        padding: 120px 0;
    }
}
`;

    this.cssRules.set("container", containerCSS);
  }

  /**
   * Генерація стилів для окремого елемента
   */
  generateElementStyles(figmaElement, htmlElement) {
    if (!htmlElement.classes.length) return;

    htmlElement.classes.forEach((className) => {
      const styles = this.convertFigmaStylesToCSS(figmaElement.styles);
      const optimizedStyles = this.optimizeStyles(
        styles,
        figmaElement,
        htmlElement
      );

      // Додавання логічних властивостей замість фізичних
      const modernStyles = this.convertToLogicalProperties(optimizedStyles);

      this.cssRules.set(className, {
        selector: `.${className}`,
        styles: modernStyles,
        element: htmlElement,
        figmaSource: figmaElement,
      });
    });
  }

  /**
   * Конвертація стилів Figma в CSS
   */
  convertFigmaStylesToCSS(figmaStyles) {
    const cssStyles = {};

    // Typography стилі
    if (figmaStyles?.typography) {
      Object.entries(figmaStyles.typography).forEach(([prop, value]) => {
        if (value && value !== "") {
          cssStyles[prop] = value;
        }
      });
    }

    // Visual стилі
    if (figmaStyles?.visual) {
      Object.entries(figmaStyles.visual).forEach(([prop, value]) => {
        if (value && value !== "") {
          cssStyles[prop] = value;
        }
      });
    }

    // Layout стилі
    if (figmaStyles?.layout) {
      Object.entries(figmaStyles.layout).forEach(([prop, value]) => {
        if (value && value !== "") {
          cssStyles[prop] = value;
        }
      });
    }

    // Box model стилі
    if (figmaStyles?.boxModel) {
      Object.entries(figmaStyles.boxModel).forEach(([prop, value]) => {
        if (value && value !== "") {
          // Конвертуємо фіксовані розміри в адаптивні
          if (prop === "width" || prop === "height") {
            cssStyles[prop] = this.makeResponsive(value);
          } else {
            cssStyles[prop] = value;
          }
        }
      });
    }

    // Border та effects стилі
    if (figmaStyles?.border) {
      Object.entries(figmaStyles.border).forEach(([prop, value]) => {
        if (value && value !== "") {
          cssStyles[prop] = value;
        }
      });
    }

    if (figmaStyles?.effects) {
      Object.entries(figmaStyles.effects).forEach(([prop, value]) => {
        if (value && value !== "") {
          cssStyles[prop] = value;
        }
      });
    }

    return cssStyles;
  }

  /**
   * Оптимізація стилів для кращої продуктивності
   */
  optimizeStyles(styles, figmaElement, htmlElement) {
    const optimized = { ...styles };

    // Використання CSS змінних для повторюваних значень
    Object.entries(optimized).forEach(([prop, value]) => {
      const variable = this.findMatchingVariable(prop, value);
      if (variable) {
        optimized[prop] = `var(${variable})`;
      }
    });

    // Оптимізація Flexbox властивостей
    if (optimized.display === "flex") {
      // Додавання gap замість margin де можливо
      if (!optimized.gap && htmlElement.children.length > 1) {
        optimized.gap = "var(--spacing-2, 16px)";
      }
    }

    // Видалення зайвих властивостей
    if (optimized.width === "100%" && optimized["max-width"]) {
      delete optimized.width;
    }

    return optimized;
  }

  /**
   * Конвертація в логічні властивості CSS
   */
  convertToLogicalProperties(styles) {
    const logical = { ...styles };

    // Конвертація margin та padding
    if (logical["margin-left"]) {
      logical["margin-inline-start"] = logical["margin-left"];
      delete logical["margin-left"];
    }
    if (logical["margin-right"]) {
      logical["margin-inline-end"] = logical["margin-right"];
      delete logical["margin-right"];
    }
    if (logical["margin-top"]) {
      logical["margin-block-start"] = logical["margin-top"];
      delete logical["margin-top"];
    }
    if (logical["margin-bottom"]) {
      logical["margin-block-end"] = logical["margin-bottom"];
      delete logical["margin-bottom"];
    }

    // Аналогічно для padding
    if (logical["padding-left"]) {
      logical["padding-inline-start"] = logical["padding-left"];
      delete logical["padding-left"];
    }
    if (logical["padding-right"]) {
      logical["padding-inline-end"] = logical["padding-right"];
      delete logical["padding-right"];
    }
    if (logical["padding-top"]) {
      logical["padding-block-start"] = logical["padding-top"];
      delete logical["padding-top"];
    }
    if (logical["padding-bottom"]) {
      logical["padding-block-end"] = logical["padding-bottom"];
      delete logical["padding-bottom"];
    }

    return logical;
  }

  /**
   * Генерація адаптивних стилів
   */
  generateResponsiveStyles(figmaData) {
    const breakpoints = {
      mobile: "(max-width: 767px)",
      tablet: "(min-width: 768px) and (max-width: 1199px)",
      desktop: "(min-width: 1200px)",
    };

    // Аналіз елементів для створення адаптивних варіантів
    this.cssRules.forEach((rule, className) => {
      if (rule.figmaSource) {
        // Генерація мобільних стилів
        const mobileStyles = this.generateMobileStyles(rule.styles);
        if (Object.keys(mobileStyles).length > 0) {
          this.addMediaQuery("mobile", rule.selector, mobileStyles);
        }

        // Генерація планшетних стилів
        const tabletStyles = this.generateTabletStyles(rule.styles);
        if (Object.keys(tabletStyles).length > 0) {
          this.addMediaQuery("tablet", rule.selector, tabletStyles);
        }
      }
    });

    // Container queries для сучасної адаптивності
    if (this.options.includeContainerQueries) {
      this.generateContainerQueries();
    }
  }

  /**
   * Генерація container queries
   */
  generateContainerQueries() {
    this.cssRules.forEach((rule, className) => {
      if (rule.styles.display === "flex" || rule.styles.display === "grid") {
        const containerQuery = `
@container (max-width: 600px) {
    ${rule.selector} {
        flex-direction: column;
        gap: var(--spacing-1, 8px);
    }
}

@container (min-width: 900px) {
    ${rule.selector} {
        gap: var(--spacing-3, 24px);
    }
}
`;
        this.containerQueries.set(className, containerQuery);
      }
    });
  }

  /**
   * Компіляція фінального CSS
   */
  compileCSS() {
    let css = "";

    // CSS змінні
    if (this.customProperties.size > 0) {
      css += ":root {\n";
      this.customProperties.forEach((value, name) => {
        css += `  ${name}: ${value};\n`;
      });
      css += "}\n\n";
    }

    // Основні стилі
    this.cssRules.forEach((rule, name) => {
      if (typeof rule === "string") {
        css += rule + "\n";
      } else {
        css += `${rule.selector} {\n`;
        Object.entries(rule.styles).forEach(([prop, value]) => {
          css += `  ${prop}: ${value};\n`;
        });
        css += "}\n\n";
      }
    });

    // Media queries
    this.mediaQueries.forEach((queries, mediaQuery) => {
      css += `@media ${mediaQuery} {\n`;
      queries.forEach((styles, selector) => {
        css += `  ${selector} {\n`;
        Object.entries(styles).forEach(([prop, value]) => {
          css += `    ${prop}: ${value};\n`;
        });
        css += "  }\n\n";
      });
      css += "}\n\n";
    });

    // Container queries
    this.containerQueries.forEach((query) => {
      css += query + "\n";
    });

    return this.beautifyCSS(css);
  }

  /**
   * Допоміжні методи
   */
  makeResponsive(value) {
    const numericValue = parseInt(value);
    if (numericValue > 100) {
      return "min(100%, " + value + ")";
    }
    return value;
  }

  findMatchingVariable(prop, value) {
    if (prop.includes("color")) {
      for (let [varName, varValue] of this.customProperties) {
        if (varValue === value && varName.includes("color")) {
          return varName;
        }
      }
    }
    return null;
  }

  generateColorVariable(name) {
    return "--color-" + name.toLowerCase().replace(/[^a-z0-9]/g, "-");
  }

  generateMobileStyles(baseStyles) {
    const mobile = {};

    if (baseStyles["font-size"]) {
      const fontSize = parseInt(baseStyles["font-size"]);
      if (fontSize > 24) {
        mobile["font-size"] = Math.round(fontSize * 0.8) + "px";
      }
    }

    if (baseStyles.padding) {
      const padding = parseInt(baseStyles.padding);
      if (padding > 20) {
        mobile.padding = Math.round(padding * 0.7) + "px";
      }
    }

    return mobile;
  }

  generateTabletStyles(baseStyles) {
    const tablet = {};

    if (baseStyles["font-size"]) {
      const fontSize = parseInt(baseStyles["font-size"]);
      if (fontSize > 18) {
        tablet["font-size"] = Math.round(fontSize * 0.9) + "px";
      }
    }

    return tablet;
  }

  addMediaQuery(breakpoint, selector, styles) {
    const breakpoints = {
      mobile: "(max-width: 767px)",
      tablet: "(min-width: 768px) and (max-width: 1199px)",
      desktop: "(min-width: 1200px)",
    };

    const mediaQuery = breakpoints[breakpoint];
    if (!this.mediaQueries.has(mediaQuery)) {
      this.mediaQueries.set(mediaQuery, new Map());
    }

    this.mediaQueries.get(mediaQuery).set(selector, styles);
  }

  beautifyCSS(css) {
    return css
      .replace(/\n\n\n+/g, "\n\n")
      .replace(/{\s*\n/g, "{\n")
      .replace(/\n\s*}/g, "\n}")
      .trim();
  }
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = CSSGenerator;
}
