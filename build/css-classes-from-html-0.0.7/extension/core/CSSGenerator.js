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
      ...options
    }

    this.cssRules = new Map()
    this.mediaQueries = new Map()
    this.containerQueries = new Map()
    this.customProperties = new Map()
  }

  /**
   * Головний метод генерації CSS
   */
  generateCSS(matchedStyles, figmaData = {}, htmlData = {}) {
    // Очищення попередніх правил
    this.cssRules.clear()
    this.mediaQueries.clear()
    this.containerQueries.clear()
    this.customProperties.clear()

    const hierarchyFigma = figmaData?.hierarchy ?? new Map()
    const hierarchyHTML = htmlData?.hierarchy ?? new Map()

    // Генерація CSS змінних з Figma токенів
    this.generateCSSVariables({hierarchy: hierarchyFigma})

    // Reset стилі
    if (this.options.includeReset) {
      this.generateResetStyles()
    }

    // Контейнер
    this.generateContainerStyles()

    // Стилі для співставлених елементів
    if (matchedStyles?.matches) {
      matchedStyles.matches.forEach((match, figmaId) => {
        const figmaElement = hierarchyFigma.get(figmaId)
        const htmlElement = hierarchyHTML.get(match.htmlElement)

        if (figmaElement && htmlElement) {
          this.generateElementStyles(figmaElement, htmlElement)
        }
      })
    }

    // Адаптив
    if (this.options.generateResponsive) {
      this.generateResponsiveStyles({hierarchy: hierarchyFigma})
    }

    return this.compileCSS()
  }

  /**
   * CSS змінні
   */
  generateCSSVariables(figmaData) {
    const variables = new Map()

    figmaData.hierarchy?.forEach(element => {
      if (element?.styles?.visual?.["background-color"]) {
        const color = element.styles.visual["background-color"]
        const varName = this.generateColorVariable(element.name)
        variables.set(varName, color)
      }

      if (element?.styles?.typography?.color) {
        const color = element.styles.typography.color
        const varName = this.generateColorVariable(element.name + "-text")
        variables.set(varName, color)
      }
    })

    // Шрифти
    const fonts = new Set()
    figmaData.hierarchy?.forEach(el => {
      if (el?.styles?.typography?.["font-family"]) {
        fonts.add(el.styles.typography["font-family"])
      }
    })
    Array.from(fonts).forEach((font, i) => {
      variables.set(`--font-family-${i + 1}`, font)
    })

    // Відступи
    const spacings = new Set()
    figmaData.hierarchy?.forEach(el => {
      if (el?.styles?.layout?.gap) spacings.add(el.styles.layout.gap)
      if (el?.styles?.layout?.padding) spacings.add(el.styles.layout.padding)
    })
    Array.from(spacings)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .forEach((spacing, i) => {
        variables.set(`--spacing-${i + 1}`, spacing)
      })

    this.customProperties = variables
  }

  /**
   * Reset стилі
   */
  generateResetStyles() {
    this.cssRules.set("reset", {
      selector: "/* reset */",
      styles: `
*,
*::before,
*::after { box-sizing: border-box; }
* { margin: 0; }
body { line-height: 1.5; -webkit-font-smoothing: antialiased; }
img, picture, video, canvas, svg { display: block; max-width: 100%; height: auto; }
input, button, textarea, select { font: inherit; }
p, h1, h2, h3, h4, h5, h6 { overflow-wrap: break-word; }
#root, #__next { isolation: isolate; }`
    })
  }

  /**
   * Контейнер
   */
  generateContainerStyles() {
    this.cssRules.set("container", {
      selector: ".container, .section",
      styles: `
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
  container-type: inline-size;
}
.section { padding: 60px 0; }
@media (min-width: 768px) {
  .container { padding: 0 32px; }
  .section { padding: 80px 0; }
}
@media (min-width: 1200px) {
  .container { padding: 0 15px; }
  .section { padding: 120px 0; }
}`
    })
  }

  /**
   * Генерація стилів елементів
   */
  generateElementStyles(figmaElement, htmlElement) {
    if (!htmlElement?.classes?.length) return

    htmlElement.classes.forEach(className => {
      const styles = this.convertFigmaStylesToCSS(figmaElement.styles)
      const optimized = this.optimizeStyles(styles, figmaElement, htmlElement)
      const logical = this.convertToLogicalProperties(optimized)

      this.cssRules.set(className, {
        selector: `.${className}`,
        styles: logical
      })
    })
  }

  convertFigmaStylesToCSS(figmaStyles = {}) {
    const cssStyles = {}
    ;["typography", "visual", "layout", "boxModel", "border", "effects"].forEach(group => {
      if (figmaStyles[group]) {
        Object.entries(figmaStyles[group]).forEach(([prop, val]) => {
          if (val) {
            cssStyles[prop] =
              group === "boxModel" && ["width", "height"].includes(prop)
                ? this.makeResponsive(val)
                : val
          }
        })
      }
    })
    return cssStyles
  }

  optimizeStyles(styles, figmaElement, htmlElement) {
    const optimized = {...styles}
    Object.entries(optimized).forEach(([prop, val]) => {
      const variable = this.findMatchingVariable(prop, val)
      if (variable) optimized[prop] = `var(${variable})`
    })

    if (optimized.display === "flex" || optimized.display === "grid") {
      if (!optimized.gap && htmlElement.children?.length > 1) {
        optimized.gap = "var(--spacing-2, 16px)"
      }
    }

    if (optimized.width === "100%" && optimized["max-width"]) delete optimized.width
    return optimized
  }

  convertToLogicalProperties(styles) {
    const logical = {...styles}
    const map = [
      ["margin-left", "margin-inline-start"],
      ["margin-right", "margin-inline-end"],
      ["margin-top", "margin-block-start"],
      ["margin-bottom", "margin-block-end"],
      ["padding-left", "padding-inline-start"],
      ["padding-right", "padding-inline-end"],
      ["padding-top", "padding-block-start"],
      ["padding-bottom", "padding-block-end"]
    ]
    map.forEach(([oldProp, newProp]) => {
      if (logical[oldProp]) {
        logical[newProp] = logical[oldProp]
        delete logical[oldProp]
      }
    })
    return logical
  }

  generateResponsiveStyles(figmaData) {
    this.cssRules.forEach(rule => {
      if (!rule?.styles || typeof rule.styles !== "object") return
      const base = rule.styles

      const mobile = this.generateMobileStyles(base)
      if (Object.keys(mobile).length) this.addMediaQuery("mobile", rule.selector, mobile)

      const tablet = this.generateTabletStyles(base)
      if (Object.keys(tablet).length) this.addMediaQuery("tablet", rule.selector, tablet)
    })

    if (this.options.includeContainerQueries) this.generateContainerQueries()
  }

  generateContainerQueries() {
    this.cssRules.forEach(rule => {
      if (rule?.styles?.display === "flex" || rule?.styles?.display === "grid") {
        this.containerQueries.set(
          rule.selector,
          `
@container (max-width: 600px) {
  ${rule.selector} { flex-direction: column; gap: var(--spacing-1, 8px); }
}
@container (min-width: 900px) {
  ${rule.selector} { gap: var(--spacing-3, 24px); }
}`
        )
      }
    })
  }

  compileCSS() {
    let css = ""

    if (this.customProperties.size > 0) {
      css += ":root {\n"
      this.customProperties.forEach((val, name) => {
        css += `  ${name}: ${val};\n`
      })
      css += "}\n\n"
    }

    this.cssRules.forEach(rule => {
      if (!rule) return
      if (typeof rule.styles === "string") {
        css += rule.styles + "\n\n"
      } else {
        css += `${rule.selector} {\n`
        Object.entries(rule.styles).forEach(([prop, val]) => {
          css += `  ${prop}: ${val};\n`
        })
        css += "}\n\n"
      }
    })

    this.mediaQueries.forEach((queries, mq) => {
      css += `@media ${mq} {\n`
      queries.forEach((styles, selector) => {
        css += `  ${selector} {\n`
        Object.entries(styles).forEach(([p, v]) => {
          css += `    ${p}: ${v};\n`
        })
        css += "  }\n\n"
      })
      css += "}\n\n"
    })

    this.containerQueries.forEach(q => {
      css += q + "\n"
    })

    return this.beautifyCSS(css)
  }

  /* Helpers */
  makeResponsive(value) {
    const n = parseInt(value)
    if (n > 100) return `min(100%, ${value})`
    return value
  }

  findMatchingVariable(prop, val) {
    if (prop.includes("color")) {
      for (let [vName, vVal] of this.customProperties) {
        if (vVal === val && vName.includes("color")) return vName
      }
    }
    return null
  }

  generateColorVariable(name) {
    return "--color-" + name.toLowerCase().replace(/[^a-z0-9]/g, "-")
  }

  generateMobileStyles(base) {
    const m = {}
    if (base["font-size"]) {
      const fs = parseInt(base["font-size"])
      if (fs > 24) m["font-size"] = Math.round(fs * 0.8) + "px"
    }
    if (base.padding) {
      const p = parseInt(base.padding)
      if (p > 20) m.padding = Math.round(p * 0.7) + "px"
    }
    return m
  }

  generateTabletStyles(base) {
    const t = {}
    if (base["font-size"]) {
      const fs = parseInt(base["font-size"])
      if (fs > 18) t["font-size"] = Math.round(fs * 0.9) + "px"
    }
    return t
  }

  addMediaQuery(bp, selector, styles) {
    const breakpoints = {
      mobile: "(max-width: 767px)",
      tablet: "(min-width: 768px) and (max-width: 1199px)",
      desktop: "(min-width: 1200px)"
    }
    const mq = breakpoints[bp]
    if (!this.mediaQueries.has(mq)) this.mediaQueries.set(mq, new Map())
    this.mediaQueries.get(mq).set(selector, styles)
  }

  beautifyCSS(css) {
    return css
      .replace(/\n\n\n+/g, "\n\n")
      .replace(/{\s*\n/g, "{\n")
      .replace(/\n\s*}/g, "\n}")
      .trim()
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = CSSGenerator
}
