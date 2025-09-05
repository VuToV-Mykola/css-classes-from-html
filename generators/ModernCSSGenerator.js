/**
 * @module ModernCSSGenerator
 * @description Генератор сучасних CSS властивостей та оптимізацій
 * @author Ukrainian Developer
 * @version 2.0.0
 */

class ModernCSSGenerator {
  constructor(options = {}) {
    this.options = {
      useCSSVariables: true,
      useLogicalProperties: true,
      useContainerQueries: true,
      useCascadeLayers: false,
      useHasPseudoClass: true,
      useSubgrid: true,
      optimizeForPerformance: true,
      ...options
    }

    // Кеш для генерованих стилів
    this.styleCache = new Map()
    this.variablesCache = new Map()
  }

  /**
   * Генерація сучасних CSS стилів
   * @param {Object} element - Елемент
   * @param {Object} figmaStyles - Стилі з Figma
   * @returns {Object} Згенеровані стилі
   */
  generateModernStyles(element, figmaStyles) {
    const modernStyles = {
      base: {},
      variables: {},
      supports: {},
      container: {},
      layers: {}
    }

    // CSS змінні
    if (this.options.useCSSVariables) {
      modernStyles.variables = this.generateCSSVariables(element, figmaStyles)
    }

    // Логічні властивості
    if (this.options.useLogicalProperties) {
      modernStyles.base = this.convertToLogicalProperties(figmaStyles)
    } else {
      modernStyles.base = {...figmaStyles}
    }

    // Container queries
    if (this.options.useContainerQueries) {
      modernStyles.container = this.generateContainerStyles(element)
    }

    // Cascade layers
    if (this.options.useCascadeLayers) {
      modernStyles.layers = this.generateLayerStyles(element)
    }

    // Feature detection з @supports
    modernStyles.supports = this.generateSupportsQueries(modernStyles.base)

    // Оптимізація
    if (this.options.optimizeForPerformance) {
      this.optimizeStyles(modernStyles)
    }

    return modernStyles
  }

  /**
   * Генерація CSS змінних
   * @param {Object} element - Елемент
   * @param {Object} styles - Стилі
   * @returns {Object} CSS змінні
   */
  generateCSSVariables(element, styles) {
    const variables = {}
    const prefix = element.className ? `--${element.className}` : "--component"

    // Кольори
    if (styles.color) {
      variables[`${prefix}-color`] = styles.color
    }
    if (styles.backgroundColor) {
      variables[`${prefix}-bg-color`] = styles.backgroundColor
    }
    if (styles.borderColor) {
      variables[`${prefix}-border-color`] = styles.borderColor
    }

    // Розміри
    if (styles.fontSize) {
      variables[`${prefix}-font-size`] = styles.fontSize
    }
    if (styles.lineHeight) {
      variables[`${prefix}-line-height`] = styles.lineHeight
    }

    // Відступи
    if (styles.padding) {
      variables[`${prefix}-padding`] = styles.padding
    }
    if (styles.margin) {
      variables[`${prefix}-margin`] = styles.margin
    }
    if (styles.gap) {
      variables[`${prefix}-gap`] = styles.gap
    }

    // Тіні та ефекти
    if (styles.boxShadow) {
      variables[`${prefix}-shadow`] = styles.boxShadow
    }
    if (styles.filter) {
      variables[`${prefix}-filter`] = styles.filter
    }

    // Анімації
    if (styles.transition) {
      variables[`${prefix}-transition`] = styles.transition
    }
    if (styles.animation) {
      variables[`${prefix}-animation`] = styles.animation
    }

    return variables
  }

  /**
   * Конвертація в логічні властивості
   * @param {Object} styles - Вхідні стилі
   * @returns {Object} Стилі з логічними властивостями
   */
  convertToLogicalProperties(styles) {
    const logical = {...styles}

    const propertyMap = {
      marginLeft: "marginInlineStart",
      marginRight: "marginInlineEnd",
      marginTop: "marginBlockStart",
      marginBottom: "marginBlockEnd",
      paddingLeft: "paddingInlineStart",
      paddingRight: "paddingInlineEnd",
      paddingTop: "paddingBlockStart",
      paddingBottom: "paddingBlockEnd",
      borderLeft: "borderInlineStart",
      borderRight: "borderInlineEnd",
      borderTop: "borderBlockStart",
      borderBottom: "borderBlockEnd",
      borderTopLeftRadius: "borderStartStartRadius",
      borderTopRightRadius: "borderStartEndRadius",
      borderBottomLeftRadius: "borderEndStartRadius",
      borderBottomRightRadius: "borderEndEndRadius",
      left: "insetInlineStart",
      right: "insetInlineEnd",
      top: "insetBlockStart",
      bottom: "insetBlockEnd",
      width: "inlineSize",
      height: "blockSize",
      minWidth: "minInlineSize",
      minHeight: "minBlockSize",
      maxWidth: "maxInlineSize",
      maxHeight: "maxBlockSize",
      textAlign: value => {
        if (value === "left") return {textAlign: "start"}
        if (value === "right") return {textAlign: "end"}
        return {textAlign: value}
      }
    }

    Object.entries(propertyMap).forEach(([physical, logicalProp]) => {
      if (styles.hasOwnProperty(physical)) {
        if (typeof logicalProp === "function") {
          Object.assign(logical, logicalProp(styles[physical]))
        } else {
          logical[logicalProp] = styles[physical]
        }
        delete logical[physical]
      }
    })

    this.processShorthandProperties(logical)

    return logical
  }

  /**
   * Генерація container query стилів
   * @param {Object} element - Елемент
   * @returns {Object} Container стилі
   */
  generateContainerStyles(element) {
    const containerStyles = {
      type: "inline-size",
      name: element.containerName || "component",
      queries: []
    }

    // Визначення breakpoints для container
    const breakpoints = [
      {size: 300, name: "small"},
      {size: 500, name: "medium"},
      {size: 700, name: "large"},
      {size: 900, name: "xlarge"}
    ]

    breakpoints.forEach(({size, name}) => {
      const styles = this.generateContainerBreakpointStyles(element, size, name)

      if (Object.keys(styles).length > 0) {
        containerStyles.queries.push({
          condition: `(min-width: ${size}px)`,
          styles: styles
        })
      }
    })

    return containerStyles
  }

  /**
   * Генерація layer стилів
   * @param {Object} element - Елемент
   * @returns {Object} Layer стилі
   */
  generateLayerStyles(element) {
    const layers = {
      name: element.layerName || "components",
      order: element.layerOrder || ["base", "components", "utilities"],
      styles: {}
    }

    // Розподіл стилів по layers
    if (element.isBaseStyle) {
      layers.styles.base = element.styles
    } else if (element.isUtility) {
      layers.styles.utilities = element.styles
    } else {
      layers.styles.components = element.styles
    }

    return layers
  }

  /**
   * Генерація @supports queries
   * @param {Object} styles - Стилі
   * @returns {Object} Supports queries
   */
  generateSupportsQueries(styles) {
    const supports = {}

    // Перевірка підтримки container queries
    if (styles.containerType) {
      supports["container"] = {
        condition: "(container-type: inline-size)",
        styles: {
          containerType: styles.containerType
        }
      }
    }

    // Перевірка підтримки :has()
    if (this.options.useHasPseudoClass) {
      supports["has"] = {
        condition: "selector(:has(*))",
        styles: this.generateHasStyles(styles)
      }
    }

    // Перевірка підтримки subgrid
    if (this.options.useSubgrid && styles.display === "grid") {
      supports["subgrid"] = {
        condition: "(grid-template-columns: subgrid)",
        styles: {
          gridTemplateColumns: "subgrid",
          gridTemplateRows: "subgrid"
        }
      }
    }

    // Перевірка підтримки aspect-ratio
    if (styles.aspectRatio) {
      supports["aspectRatio"] = {
        condition: "(aspect-ratio: 1)",
        styles: {
          aspectRatio: styles.aspectRatio
        },
        fallback: this.generateAspectRatioFallback(styles.aspectRatio)
      }
    }

    // Перевірка підтримки gap для flexbox
    if (styles.display === "flex" && styles.gap) {
      supports["flexGap"] = {
        condition: "(gap: 1px)",
        styles: {
          gap: styles.gap
        },
        fallback: this.generateFlexGapFallback(styles.gap)
      }
    }

    return supports
  }

  /**
   * Генерація сучасних Grid стилів
   * @param {Object} element - Елемент
   * @returns {Object} Grid стилі
   */
  generateModernGrid(element) {
    const grid = {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
      gap: "var(--grid-gap, 1rem)",
      alignItems: "start"
    }

    // Subgrid для вкладених елементів
    if (this.options.useSubgrid && element.isNested) {
      grid.gridTemplateColumns = "subgrid"
      grid.gridColumn = "span 2"
    }

    // Masonry layout
    if (element.layoutType === "masonry") {
      grid.gridTemplateRows = "masonry"
      grid.masonryAutoFlow = "ordered"
    }

    // Grid areas
    if (element.gridAreas) {
      grid.gridTemplateAreas = this.generateGridAreas(element.gridAreas)
    }

    // Auto-placement
    if (element.autoPlacement) {
      grid.gridAutoFlow = element.autoPlacement
      grid.gridAutoRows = "minmax(100px, auto)"
    }

    return grid
  }

  /**
   * Генерація сучасних Flexbox стилів
   * @param {Object} element - Елемент
   * @returns {Object} Flex стилі
   */
  generateModernFlex(element) {
    const flex = {
      display: "flex",
      gap: "var(--flex-gap, 1rem)",
      flexWrap: "wrap"
    }

    // Використання логічних властивостей для direction
    if (element.direction === "horizontal") {
      flex.flexDirection = "row"
    } else if (element.direction === "vertical") {
      flex.flexDirection = "column"
    }

    // Сучасне вирівнювання
    if (element.alignment) {
      flex.placeContent = element.alignment
    } else {
      flex.alignItems = "center"
      flex.justifyContent = "space-between"
    }

    // Flex basis з min()
    if (element.flexBasis) {
      flex.flex = `1 1 min(${element.flexBasis}, 100%)`
    }

    return flex
  }

  /**
   * Генерація анімацій та переходів
   * @param {Object} element - Елемент
   * @returns {Object} Анімаційні стилі
   */
  generateAnimations(element) {
    const animations = {}

    // View Transitions API
    if (element.useViewTransitions) {
      animations.viewTransitionName = element.transitionName || "element"
    }

    // Scroll-driven animations
    if (element.scrollAnimation) {
      animations.animationTimeline = "scroll()"
      animations.animationRange = "entry 25% cover 50%"
    }

    // Performance-optimized transitions
    if (element.transitions) {
      animations.transition = "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      animations.willChange = "transform"
      animations.containIntrinsicSize = "auto 500px"
    }

    // Використання CSS Houdini
    if (element.customProperties) {
      animations["@property"] = this.generateHoudiniProperties(element)
    }

    return animations
  }

  /**
   * Генерація стилів для темної теми
   * @param {Object} styles - Базові стилі
   * @returns {Object} Стилі для темної теми
   */
  generateDarkThemeStyles(styles) {
    const darkStyles = {}

    // Автоматична інверсія кольорів
    if (styles.color) {
      darkStyles.color = this.invertColor(styles.color)
    }
    if (styles.backgroundColor) {
      darkStyles.backgroundColor = this.invertColor(styles.backgroundColor)
    }
    if (styles.borderColor) {
      darkStyles.borderColor = this.adjustBorderForDark(styles.borderColor)
    }

    // Коригування тіней
    if (styles.boxShadow) {
      darkStyles.boxShadow = this.adjustShadowForDark(styles.boxShadow)
    }

    // Використання color-scheme
    darkStyles.colorScheme = "dark"

    return darkStyles
  }

  /**
   * Оптимізація стилів для продуктивності
   * @param {Object} styles - Вхідні стилі
   */
  optimizeStyles(styles) {
    // Використання contain для ізоляції
    if (!styles.base.contain) {
      styles.base.contain = "layout style"
    }

    // Використання content-visibility для великих елементів
    if (styles.base.height && parseInt(styles.base.height) > 500) {
      styles.base.contentVisibility = "auto"
      styles.base.containIntrinsicSize = `auto ${styles.base.height}`
    }

    // GPU acceleration для анімованих елементів
    if (styles.base.animation || styles.base.transition) {
      styles.base.transform = styles.base.transform || "translateZ(0)"
    }

    // Оптимізація font-display
    if (styles.base.fontFamily) {
      styles.base.fontDisplay = "swap"
    }

    // Використання aspect-ratio замість padding hack
    this.replaceAspectRatioHacks(styles)
  }

  /**
   * Компіляція в фінальний CSS
   * @param {Object} modernStyles - Сучасні стилі
   * @returns {string} CSS код
   */
  compileToCSS(modernStyles) {
    let css = ""

    // CSS змінні
    if (modernStyles.variables && Object.keys(modernStyles.variables).length > 0) {
      css += ":root {\n"
      Object.entries(modernStyles.variables).forEach(([name, value]) => {
        css += `  ${name}: ${value};\n`
      })
      css += "}\n\n"
    }

    // Cascade layers
    if (
      modernStyles.layers &&
      modernStyles.layers.styles &&
      Object.keys(modernStyles.layers.styles).length > 0
    ) {
      css += `@layer ${modernStyles.layers.order?.join(", ") || "base"};\n\n`

      Object.entries(modernStyles.layers.styles).forEach(([layer, styles]) => {
        if (styles) {
          css += `@layer ${layer} {\n`
          css += this.stylesToCSS(styles, "  ")
          css += "}\n\n"
        }
      })
    }

    // Базові стилі
    if (modernStyles.base) {
      css += this.stylesToCSS(modernStyles.base)
    }

    // @supports queries
    if (modernStyles.supports) {
      Object.entries(modernStyles.supports).forEach(([feature, query]) => {
        if (query?.condition && query.styles) {
          css += `\n@supports ${query.condition} {\n`
          css += this.stylesToCSS(query.styles, "  ")
          css += "}\n"

          if (query.fallback) {
            css += `\n@supports not ${query.condition} {\n`
            css += this.stylesToCSS(query.fallback, "  ")
            css += "}\n"
          }
        }
      })
    }

    // Container queries
    if (modernStyles.container?.queries?.length > 0) {
      css += `\n.container {\n`
      css += `  container-type: ${modernStyles.container.type || "inline-size"};\n`
      css += `  container-name: ${modernStyles.container.name || "component"};\n`
      css += "}\n"

      modernStyles.container.queries.forEach(query => {
        if (query?.condition && query.styles) {
          css += `\n@container ${modernStyles.container.name} ${query.condition} {\n`
          css += this.stylesToCSS(query.styles, "  ")
          css += "}\n"
        }
      })
    }

    return css
  }

  // === Приватні допоміжні методи ===

  /**
   * Обробка скорочених властивостей
   */
  processShorthandProperties(styles) {
    // Обробка margin/padding
    ;["margin", "padding"].forEach(prop => {
      if (styles[prop] && typeof styles[prop] === "string") {
        const values = styles[prop].split(" ")
        if (values.length === 4) {
          styles[`${prop}BlockStart`] = values[0]
          styles[`${prop}InlineEnd`] = values[1]
          styles[`${prop}BlockEnd`] = values[2]
          styles[`${prop}InlineStart`] = values[3]
          delete styles[prop]
        }
      }
    })
  }

  /**
   * Генерація стилів для container breakpoint
   */
  generateContainerBreakpointStyles(element, size, name) {
    const styles = {}

    if (name === "small") {
      styles.fontSize = "14px"
      styles.padding = "8px"
    } else if (name === "medium") {
      styles.fontSize = "16px"
      styles.padding = "12px"
    } else if (name === "large") {
      styles.fontSize = "18px"
      styles.padding = "16px"
    }

    return styles
  }

  /**
   * Генерація :has() стилів
   */
  generateHasStyles(styles) {
    return {
      "&:has(> .active)": {
        borderColor: "var(--accent-color)"
      },
      "&:has(img)": {
        display: "grid",
        placeItems: "center"
      }
    }
  }

  /**
   * Генерація fallback для aspect-ratio
   */
  generateAspectRatioFallback(ratio) {
    const [width, height] = ratio.split("/").map(Number)
    const percentage = (height / width) * 100

    return {
      position: "relative",
      paddingBottom: `${percentage}%`,
      "&::before": {
        content: '""',
        display: "block",
        paddingTop: `${percentage}%`
      }
    }
  }

  /**
   * Генерація fallback для flex gap
   */
  generateFlexGapFallback(gap) {
    const gapValue = parseInt(gap) || 16

    return {
      "& > *:not(:last-child)": {
        marginRight: `${gapValue}px`
      }
    }
  }

  /**
   * Генерація grid areas
   */
  generateGridAreas(areas) {
    return areas.map(row => `"${row.join(" ")}"`).join(" ")
  }

  /**
   * Генерація Houdini properties
   */
  generateHoudiniProperties(element) {
    const properties = {}

    element.customProperties.forEach(prop => {
      properties[prop.name] = {
        syntax: prop.syntax || "<color>",
        inherits: prop.inherits !== false,
        initialValue: prop.initialValue || "transparent"
      }
    })

    return properties
  }

  /**
   * Інвертування кольору для темної теми
   */
  invertColor(color) {
    // Спрощена логіка інверсії
    if (color === "#000000") return "#ffffff"
    if (color === "#ffffff") return "#000000"
    if (color.startsWith("#")) {
      // Інверсія HEX кольору
      const inverted =
        "#" + (Number(`0x1${color.slice(1)}`) ^ 0xffffff).toString(16).slice(1).toUpperCase()
      return inverted
    }
    return color
  }

  /**
   * Коригування border для темної теми
   */
  adjustBorderForDark(borderColor) {
    // Збільшення яскравості для кращої видимості
    return borderColor // Placeholder
  }

  /**
   * Коригування тіні для темної теми
   */
  adjustShadowForDark(shadow) {
    // Зменшення інтенсивності тіні
    return shadow.replace(/rgba?\([^)]+\)/g, "rgba(0, 0, 0, 0.3)")
  }

  /**
   * Заміна aspect-ratio хаків
   */
  replaceAspectRatioHacks(styles) {
    if (styles.base.paddingTop && styles.base.paddingTop.includes("%")) {
      const percentage = parseFloat(styles.base.paddingTop)
      styles.base.aspectRatio = `100 / ${percentage}`
      delete styles.base.paddingTop
    }
  }

  /**
   * Конвертація стилів в CSS рядок
   */
  stylesToCSS(styles, indent = "") {
    let css = ""

    Object.entries(styles).forEach(([prop, value]) => {
      const cssProperty = prop.replace(/([A-Z])/g, "-$1").toLowerCase()
      css += `${indent}${cssProperty}: ${value};\n`
    })

    return css
  }
}

// Експорт модуля
if (typeof module !== "undefined" && module.exports) {
  module.exports = ModernCSSGenerator
}
