/**
 * @module ContainerGenerator
 * @description Генератор контейнерних класів та компонентів
 * @author Ukrainian Developer
 * @version 2.0.2
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
    }

    this.containerTypes = new Map()
    this.breakpoints = {
      xs: 320,
      sm: 576,
      md: 768,
      lg: 1024,
      xl: 1200,
      xxl: 1440
    }
  }

  generateContainerSystem(config) {
    const system = {
      containers: this.generateContainers(config),
      utilities: this.options.generateUtilities ? this.generateUtilityClasses() : {},
      components: this.options.generateComponents ? this.generateComponents(config) : {},
      variables: this.generateCSSVariables(config),
      mixins: this.generateMixins(),
      documentation: this.generateDocumentation()
    }

    return system
  }

  generateMixins() {
    return {
      clearfix: {
        "&::after": {
          content: "''",
          display: "table",
          clear: "both"
        }
      },
      visuallyHidden: {
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: 0,
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0,0,0,0)",
        whiteSpace: "nowrap",
        border: 0
      }
    }
  }

  generateContainers(config) {
    const containers = {}
    containers.base = this.generateBaseContainer(config)
    containers.fluid = this.generateFluidContainer()
    containers.responsive = this.generateResponsiveContainer()
    if (this.options.useContainerQueries) {
      containers.queryContainer = this.generateQueryContainer()
    }
    containers.section = this.generateSectionContainer()
    containers.content = this.generateContentContainer()
    containers.hero = this.generateHeroContainer()
    containers.card = this.generateCardContainer()
    containers.modal = this.generateModalContainer()
    return containers
  }

  generateBaseContainer(config) {
    const maxWidth = config.maxWidth || this.options.maxWidth
    const padding = config.padding || this.options.padding
    return {
      className: "container",
      styles: {
        width: "100%",
        maxWidth: `${maxWidth}px`,
        marginLeft: "auto",
        marginRight: "auto",
        paddingLeft: `${padding}px`,
        paddingRight: `${padding}px`,
        boxSizing: "border-box"
      },
      responsive: this.generateResponsivePadding(padding),
      modifiers: this.generateContainerModifiers()
    }
  }

  generateFluidContainer() {
    return {
      className: "container-fluid",
      styles: {
        width: "100%",
        paddingLeft: "var(--container-padding, 1rem)",
        paddingRight: "var(--container-padding, 1rem)",
        boxSizing: "border-box"
      },
      responsive: {
        mobile: {paddingLeft: "16px", paddingRight: "16px"},
        tablet: {paddingLeft: "24px", paddingRight: "24px"},
        desktop: {paddingLeft: "32px", paddingRight: "32px"}
      }
    }
  }

  generateResponsiveContainer() {
    return {
      className: "container-responsive",
      styles: {
        width: "100%",
        marginLeft: "auto",
        marginRight: "auto",
        paddingLeft: "clamp(1rem, 4vw, 3rem)",
        paddingRight: "clamp(1rem, 4vw, 3rem)",
        boxSizing: "border-box"
      },
      breakpoints: this.generateBreakpointContainers()
    }
  }

  generateQueryContainer() {
    return {
      className: "query-container",
      styles: {
        containerType: "inline-size",
        containerName: "main",
        width: "100%",
        position: "relative"
      },
      queries: this.generateContainerQueries(),
      nested: this.generateNestedContainers()
    }
  }

  generateSectionContainer() {
    return {
      className: "container-section",
      styles: {
        width: "100%",
        paddingTop: "var(--section-spacing-y, 4rem)",
        paddingBottom: "var(--section-spacing-y, 4rem)",
        paddingLeft: "var(--section-spacing-x, 2rem)",
        paddingRight: "var(--section-spacing-x, 2rem)"
      },
      variants: {
        compact: {paddingTop: "2rem", paddingBottom: "2rem"},
        spacious: {paddingTop: "6rem", paddingBottom: "6rem"},
        full: {paddingTop: "8rem", paddingBottom: "8rem"}
      }
    }
  }

  generateContentContainer() {
    return {
      className: "container-content",
      styles: {
        width: "100%",
        maxWidth: "65ch",
        marginLeft: "auto",
        marginRight: "auto",
        padding: "1rem"
      },
      typography: {
        fontSize: "clamp(1rem, 1rem + 0.5vw, 1.25rem)",
        lineHeight: 1.6,
        letterSpacing: "0.01em"
      },
      variants: {
        prose: {maxWidth: "65ch"},
        narrow: {maxWidth: "45ch"},
        wide: {maxWidth: "85ch"}
      }
    }
  }

  generateHeroContainer() {
    return {
      className: "container-hero",
      styles: {
        width: "100%",
        minHeight: "min(100vh, 800px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(2rem, 8vw, 6rem)",
        position: "relative",
        overflow: "hidden"
      },
      inner: {
        maxWidth: "1200px",
        width: "100%",
        marginLeft: "auto",
        marginRight: "auto",
        zIndex: 1
      },
      background: {position: "absolute", inset: 0, zIndex: 0}
    }
  }

  generateCardContainer() {
    return {
      className: "container-card",
      styles: {
        width: "100%",
        padding: "var(--card-padding, 1.5rem)",
        borderRadius: "var(--card-radius, 0.5rem)",
        backgroundColor: "var(--card-bg, white)",
        boxShadow: "var(--card-shadow, 0 2px 8px rgba(0,0,0,0.1))",
        position: "relative",
        overflow: "hidden"
      },
      variants: {
        compact: {padding: "1rem"},
        spacious: {padding: "2rem"},
        bordered: {border: "1px solid var(--border-color, #e0e0e0)", boxShadow: "none"},
        elevated: {boxShadow: "0 4px 16px rgba(0,0,0,0.15)"}
      },
      responsive: {
        mobile: {padding: "1rem", borderRadius: "0.375rem"},
        desktop: {padding: "1.5rem", borderRadius: "0.5rem"}
      }
    }
  }

  generateModalContainer() {
    return {
      className: "container-modal",
      styles: {
        width: "90%",
        maxWidth: "600px",
        maxHeight: "90vh",
        margin: "auto",
        padding: "2rem",
        borderRadius: "0.5rem",
        backgroundColor: "white",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        position: "relative",
        overflow: "auto"
      },
      sizes: {
        small: {maxWidth: "400px"},
        medium: {maxWidth: "600px"},
        large: {maxWidth: "800px"},
        full: {maxWidth: "95%"}
      },
      overlay: {
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999
      }
    }
  }

  // --- Утиліти ---
  generateUtilityClasses() {
    return {
      spacing: this.generateSpacingUtilities(),
      sizing: this.generateSizingUtilities(),
      display: this.generateDisplayUtilities(),
      position: this.generatePositionUtilities(),
      overflow: this.generateOverflowUtilities()
    }
  }

  generateSpacingUtilities() {
    const utilities = {}
    const spacings = [0, 0.25, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8]
    spacings.forEach(spacing => {
      const value = `${spacing}rem`
      const key = spacing.toString().replace(".", "_")
      utilities[`p-${key}`] = {padding: value}
      utilities[`px-${key}`] = {paddingLeft: value, paddingRight: value}
      utilities[`py-${key}`] = {paddingTop: value, paddingBottom: value}
      utilities[`pt-${key}`] = {paddingTop: value}
      utilities[`pr-${key}`] = {paddingRight: value}
      utilities[`pb-${key}`] = {paddingBottom: value}
      utilities[`pl-${key}`] = {paddingLeft: value}
      utilities[`m-${key}`] = {margin: value}
      utilities[`mx-${key}`] = {marginLeft: value, marginRight: value}
      utilities[`my-${key}`] = {marginTop: value, marginBottom: value}
      utilities[`mt-${key}`] = {marginTop: value}
      utilities[`mr-${key}`] = {marginRight: value}
      utilities[`mb-${key}`] = {marginBottom: value}
      utilities[`ml-${key}`] = {marginLeft: value}
    })
    utilities["mx-auto"] = {marginLeft: "auto", marginRight: "auto"}
    utilities["my-auto"] = {marginTop: "auto", marginBottom: "auto"}
    utilities["m-auto"] = {margin: "auto"}
    return utilities
  }

  generateSizingUtilities() {
    return {
      "w-full": {width: "100%"},
      "w-screen": {width: "100vw"},
      "w-min": {width: "min-content"},
      "w-max": {width: "max-content"},
      "w-fit": {width: "fit-content"},
      "h-full": {height: "100%"},
      "h-screen": {height: "100vh"},
      "h-min": {height: "min-content"},
      "h-max": {height: "max-content"},
      "h-fit": {height: "fit-content"},
      "min-w-0": {minWidth: "0"},
      "min-w-full": {minWidth: "100%"},
      "max-w-none": {maxWidth: "none"},
      "max-w-full": {maxWidth: "100%"},
      "max-w-screen": {maxWidth: "100vw"},
      "max-w-prose": {maxWidth: "65ch"}
    }
  }

  // --- Доданий відсутній метод ---
  generateDisplayUtilities() {
    return {
      block: {display: "block"},
      inline: {display: "inline"},
      inlineBlock: {display: "inline-block"},
      flex: {display: "flex"},
      inlineFlex: {display: "inline-flex"},
      grid: {display: "grid"},
      inlineGrid: {display: "inline-grid"},
      hidden: {display: "none"}
    }
  }

  generatePositionUtilities() {
    return {
      static: {position: "static"},
      relative: {position: "relative"},
      absolute: {position: "absolute"},
      fixed: {position: "fixed"},
      sticky: {position: "sticky"},
      top0: {top: 0},
      right0: {right: 0},
      bottom0: {bottom: 0},
      left0: {left: 0}
    }
  }

  generateOverflowUtilities() {
    return {
      overflowAuto: {overflow: "auto"},
      overflowHidden: {overflow: "hidden"},
      overflowScroll: {overflow: "scroll"},
      overflowVisible: {overflow: "visible"}
    }
  }

  generateComponents(config) {
    return {
      grid: this.generateGridComponent(),
      stack: this.generateStackComponent(),
      cluster: this.generateClusterComponent(),
      sidebar: this.generateSidebarComponent(),
      switcher: this.generateSwitcherComponent()
    }
  }

  generateGridComponent() {
    return {
      className: "grid-container",
      styles: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
        gap: "var(--grid-gap, 1rem)",
        width: "100%"
      },
      variants: {
        "2-col": {gridTemplateColumns: "repeat(2, 1fr)"},
        "3-col": {gridTemplateColumns: "repeat(3, 1fr)"},
        "4-col": {gridTemplateColumns: "repeat(4, 1fr)"},
        auto: {gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))"}
      }
    }
  }

  generateStackComponent() {
    return {
      className: "stack",
      styles: {
        display: "flex",
        flexDirection: "column",
        gap: "var(--stack-gap, 1rem)",
        width: "100%"
      },
      variants: {
        horizontal: {flexDirection: "row"},
        reverse: {flexDirection: "column-reverse"},
        center: {alignItems: "center"},
        stretch: {alignItems: "stretch"}
      }
    }
  }

  generateClusterComponent() {
    return {
      className: "cluster",
      styles: {
        display: "flex",
        flexWrap: "wrap",
        gap: "var(--cluster-gap, 0.5rem)",
        alignItems: "center"
      }
    }
  }

  generateSidebarComponent() {
    return {
      className: "sidebar-layout",
      styles: {
        display: "flex",
        flexWrap: "wrap",
        gap: "var(--sidebar-gap, 1rem)"
      },
      sidebar: {flexBasis: "20rem", flexGrow: 1},
      content: {flexBasis: 0, flexGrow: 999, minInlineSize: "50%"}
    }
  }

  generateSwitcherComponent() {
    return {
      className: "switcher",
      styles: {
        display: "flex",
        flexWrap: "wrap",
        gap: "var(--switcher-gap, 1rem)"
      },
      threshold: "30rem",
      limit: 3
    }
  }

  generateCSSVariables(config) {
    return {
      "--container-max-width": `${config.maxWidth || this.options.maxWidth}px`,
      "--container-padding": "1rem",
      "--container-padding-mobile": "1rem",
      "--container-padding-tablet": "1.5rem",
      "--container-padding-desktop": "2rem",
      "--spacing-xs": "0.25rem",
      "--spacing-sm": "0.5rem",
      "--spacing-md": "1rem",
      "--spacing-lg": "1.5rem",
      "--spacing-xl": "2rem",
      "--spacing-2xl": "3rem",
      "--spacing-3xl": "4rem",
      "--section-spacing-y": "4rem",
      "--section-spacing-x": "2rem",
      "--card-padding": "1.5rem",
      "--card-radius": "0.5rem",
      "--card-shadow": "0 2px 8px rgba(0,0,0,0.1)",
      "--grid-gap": "1rem",
      "--stack-gap": "1rem",
      "--cluster-gap": "0.5rem"
    }
  }

  compileToCSS(system) {
    let css = ""
    css += ":root {\n"
    Object.entries(system.variables).forEach(([name, value]) => {
      css += `  ${name}: ${value};\n`
    })
    css += "}\n\n"

    Object.values(system.containers).forEach(container => {
      css += this.compileContainer(container)
    })

    if (system.utilities) {
      css += "\n/* Utility Classes */\n"
      Object.entries(system.utilities).forEach(([category, utilities]) => {
        css += `\n/* ${category} */\n`
        Object.entries(utilities).forEach(([className, styles]) => {
          css += `.${className} {\n`
          Object.entries(styles).forEach(([prop, value]) => {
            const cssProp = prop.replace(/([A-Z])/g, "-$1").toLowerCase()
            css += `  ${cssProp}: ${value};\n`
          })
          css += "}\n"
        })
      })
    }

    if (system.components) {
      css += "\n/* Components */\n"
      Object.values(system.components).forEach(component => {
        css += this.compileComponent(component)
      })
    }

    return css
  }

  generateResponsivePadding(basePadding) {
    return {
      mobile: {paddingLeft: `${basePadding}px`, paddingRight: `${basePadding}px`},
      tablet: {paddingLeft: `${basePadding * 1.5}px`, paddingRight: `${basePadding * 1.5}px`},
      desktop: {paddingLeft: `${basePadding * 2}px`, paddingRight: `${basePadding * 2}px`}
    }
  }

  generateContainerModifiers() {
    return {
      small: {maxWidth: "800px"},
      medium: {maxWidth: "1000px"},
      large: {maxWidth: "1400px"},
      full: {maxWidth: "100%"},
      left: {marginLeft: "0"},
      right: {marginRight: "0"},
      center: {marginLeft: "auto", marginRight: "auto"}
    }
  }

  generateBreakpointContainers() {
    const containers = {}
    Object.entries(this.breakpoints).forEach(([name, width]) => {
      containers[name] = {
        minWidth: `${width}px`,
        styles: {maxWidth: `${width - 40}px`, paddingLeft: "20px", paddingRight: "20px"}
      }
    })
    return containers
  }

  generateContainerQueries() {
    return [
      {condition: "(min-width: 400px)", styles: {fontSize: "1rem"}},
      {condition: "(min-width: 600px)", styles: {fontSize: "1.125rem"}},
      {condition: "(min-width: 900px)", styles: {fontSize: "1.25rem"}}
    ]
  }

  generateNestedContainers() {
    return {
      header: {padding: "1rem 2rem"},
      main: {padding: "2rem 3rem"},
      footer: {padding: "1rem 2rem"}
    }
  }

  generateDocumentation() {
    return {
      title: "Container System",
      description: "Повна система контейнерів, утиліт та компонентів для сучасних проектів",
      version: "2.0.2",
      author: "Микола"
    }
  }

  compileContainer(container) {
    let css = `.${container.className} {\n`
    Object.entries(container.styles).forEach(([prop, value]) => {
      const cssProp = prop.replace(/([A-Z])/g, "-$1").toLowerCase()
      css += `  ${cssProp}: ${value};\n`
    })
    css += "}\n\n"
    return css
  }

  compileComponent(component) {
    let css = `.${component.className} {\n`
    Object.entries(component.styles).forEach(([prop, value]) => {
      const cssProp = prop.replace(/([A-Z])/g, "-$1").toLowerCase()
      css += `  ${cssProp}: ${value};\n`
    })
    css += "}\n\n"
    return css
  }
}

module.exports = ContainerGenerator
