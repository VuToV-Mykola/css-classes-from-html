// Модуль генерації CSS з оптимізацією для Figma
const commentManager = require("./commentManager")
const globalRules = require("./globalRules")

// Категорізація властивостей для правильного порядку CSS
const PROPERTY_CATEGORIES = {
  layout: ["display", "position", "top", "right", "bottom", "left", "z-index", "float", "clear"],
  flexGrid: ["flex", "flex-direction", "flex-wrap", "justify-content", "align-items", "grid", "grid-template", "gap"],
  boxModel: ["width", "height", "margin", "padding", "border", "border-radius", "box-sizing"],
  typography: ["font-family", "font-size", "font-weight", "line-height", "text-align", "color"],
  visual: ["background", "background-color", "opacity", "box-shadow"],
  animation: ["transition", "transform", "animation"]
}

const INHERITED_PROPERTIES = [
  "color", "font-family", "font-size", "font-weight", "font-style", 
  "line-height", "text-align", "text-transform", "letter-spacing"
]

// Global properties that shouldn't be duplicated in classes
const GLOBAL_PROPERTIES = [
  "box-sizing", "margin", "padding", "font-family", "line-height"
]

// Create property lookup for O(1) categorization
const PROPERTY_LOOKUP = {}
Object.entries(PROPERTY_CATEGORIES).forEach(([category, props]) => {
  props.forEach(prop => {
    PROPERTY_LOOKUP[prop] = category
  })
})

function generateCSS(classes, classDictionary, includeGlobal = true, includeReset = true, designTokens = null, selectedTags = null) {
  const cssBlocks = []

  // Add file header
  cssBlocks.push(commentManager.getFileHeader())

  // Add global rules if enabled
  if (includeGlobal) {
    cssBlocks.push(globalRules.getGlobalRules(includeReset, selectedTags))
  }

  // Generate class CSS first to extract used variables
  const classCSS = []
  classes.forEach(className => {
    const classInfo = classDictionary[className]
    if (classInfo && hasValidProperties(classInfo)) {
      classCSS.push(generateClassCSS(className, classInfo))
    }
  })

  // Add media queries
  const mediaCSS = generateMediaQueries(classes, classDictionary, designTokens)
  
  // Extract used CSS variables from all generated CSS
  const allCSS = [...cssBlocks, ...classCSS, mediaCSS].join("\n")
  const usedTokens = selectedTags ? extractUsedTokens(allCSS) : null

  // Generate CSS variables from design tokens (filtered if selection)
  if (designTokens) {
    cssBlocks.push(generateCSSVariables(designTokens, usedTokens))
  }

  // Add class CSS
  cssBlocks.push(...classCSS)
  
  // Add media queries
  if (mediaCSS.trim()) {
    cssBlocks.push(mediaCSS)
  }

  return cssBlocks.filter(block => block.trim()).join("\n\n")
}

function generateCSSVariables(tokens, usedTokens = null) {
  const sections = []
  
  sections.push("/* Дизайн-токени з макету */", ":root {")
  
  // Generate variables efficiently
  const tokenSections = [
    {name: "colors", prefix: "--color"},
    {name: "typography", prefix: "--font"},
    {name: "spacing", prefix: "--space"},
    {name: "effects", prefix: "--shadow"},
    {name: "breakpoints", prefix: "--bp"}
  ]
  
  tokenSections.forEach(({name, prefix}) => {
    if (tokens[name]) {
      const sectionNames = {
        colors: "Кольори",
        typography: "Типографіка", 
        spacing: "Відступи",
        effects: "Ефекти",
        breakpoints: "Точки перелому"
      }
      
      const filteredTokens = usedTokens ? 
        Object.fromEntries(Object.entries(tokens[name]).filter(([key]) => 
          usedTokens.has(`${prefix}-${key}`))) : tokens[name]
      
      if (Object.keys(filteredTokens).length > 0) {
        sections.push(`  /* ${sectionNames[name] || name} */`)
        Object.entries(filteredTokens).forEach(([key, value]) => {
          sections.push(`  ${prefix}-${key}: ${value};`)
        })
      }
    }
  })
  
  sections.push("}")
  
  return sections.join("\n")
}

function generateClassCSS(className, classInfo) {
  const {properties = {}, pseudoClasses = {}} = classInfo
  const blocks = []
  
  // Main class
  const comment = commentManager.getClassComment(className)
  blocks.push(comment)
  
  const categorizedProps = categorizeProperties(properties)
  const cssRules = []
  
  // Add properties in proper order
  Object.entries(PROPERTY_CATEGORIES).forEach(([category, _]) => {
    const categoryProps = categorizedProps[category]
    if (categoryProps && Object.keys(categoryProps).length > 0) {
      const categoryTranslations = {
        layout: "Властивості макету",
        flexGrid: "Flexbox та Grid властивості", 
        boxModel: "Властивості блокової моделі",
        typography: "Властивості типографіки",
        visual: "Візуальні властивості",
        animation: "Властивості анімації",
        other: "Інші властивості"
      }
      cssRules.push(`  /* ${categoryTranslations[category] || category} */`)
      Object.entries(categoryProps).forEach(([prop, value]) => {
        cssRules.push(`  ${prop}: ${value};`)
      })
    }
  })
  
  if (cssRules.length > 0) {
    blocks.push(`.${className} {`)
    blocks.push(...cssRules)
    blocks.push("}")
  }
  
  // Pseudo-classes
  Object.entries(pseudoClasses).forEach(([pseudo, pseudoProps]) => {
    if (Object.keys(pseudoProps).length > 0) {
      blocks.push(`\n.${className}${pseudo} {`)
      Object.entries(pseudoProps).forEach(([prop, value]) => {
        blocks.push(`  ${prop}: ${value};`)
      })
      blocks.push("}")
    }
  })
  
  return blocks.join("\n")
}

function categorizeProperties(properties) {
  const categorized = {}
  
  Object.entries(properties).forEach(([prop, value]) => {
    const category = PROPERTY_LOOKUP[prop] || "other"
    if (!categorized[category]) categorized[category] = {}
    categorized[category][prop] = value
  })
  
  return categorized
}

function generateMediaQueries(classes, classDictionary, designTokens) {
  const breakpoints = designTokens?.breakpoints || {tablet: "768px", desktop: "1158px"}
  const mediaBlocks = []
  
  // Generate media queries efficiently
  Object.entries(breakpoints).forEach(([breakpoint, size]) => {
    if (breakpoint === "mobile") return // Mobile first approach
    
    const rules = []
    classes.forEach(className => {
      const responsive = classDictionary[className]?.responsive?.[breakpoint]
      if (responsive && Object.keys(responsive).length > 0) {
        rules.push(`  .${className} {`)
        Object.entries(responsive).forEach(([prop, value]) => {
          rules.push(`    ${prop}: ${value};`)
        })
        rules.push("  }")
      }
    })
    
    if (rules.length > 0) {
      mediaBlocks.push(`/* ${breakpoint.toUpperCase()}: ${size} and up */`)
      mediaBlocks.push(`@media (min-width: ${size}) {`)
      mediaBlocks.push(...rules)
      mediaBlocks.push("}")
    }
  })
  
  return mediaBlocks.join("\n")
}

function createClassDictionary(classes, options = {}, classParents = {}, classTags = {}) {
  const {responsive = true, darkMode = true, designTokens = null} = options
  const dictionary = {}
  
  classes.forEach(className => {
    const properties = getPropertiesForClass(className, designTokens, classTags, classParents)
    const filteredProperties = filterInheritedAndGlobalProperties(properties, className, classTags, classParents)
    
    dictionary[className] = {
      properties: filteredProperties,
      pseudoClasses: getPseudoClassesForClass(className, designTokens),
      responsive: responsive ? getResponsiveProperties(className, designTokens) : {}
    }
  })
  
  return dictionary
}

function getPropertiesForClass(className, designTokens = {}, classTags = {}, classParents = {}) {
  // Priority: Figma styles > General patterns > Defaults
  let properties = {}
  
  // 1. Figma class styles (highest priority)
  if (designTokens?.classStyles?.[className]) {
    properties = {...designTokens.classStyles[className]}
  }
  
  // 2. General patterns based on class name
  const patterns = getClassPatterns(className)
  Object.assign(properties, patterns)
  
  return properties
}

const CLASS_PATTERNS = {
  // Layout components
  header: {"border-bottom": "1px solid var(--color-border, #e7e9fc)", "box-shadow": "var(--shadow-light, 0 1px 6px rgba(0,0,0,0.08))"},
  hero: {"background-color": "var(--color-dark, #2e2f42)", color: "var(--color-white, #fff)", "text-align": "center", padding: "120px 0"},
  footer: {"background-color": "var(--color-dark, #2e2f42)", color: "var(--color-light, #f4f4fd)", padding: "100px 0"},
  
  // Interactive elements
  btn: {"background-color": "var(--color-primary, #4d5ae5)", color: "var(--color-white, #fff)", "border-radius": "4px", padding: "16px 32px", border: "none", cursor: "pointer"},
  button: {"background-color": "var(--color-primary, #4d5ae5)", color: "var(--color-white, #fff)", "border-radius": "4px", padding: "16px 32px", border: "none", cursor: "pointer"},
  link: {color: "var(--color-primary, #4d5ae5)", "text-decoration": "none", transition: "color 250ms ease"},
  
  // Typography
  title: {"font-size": "var(--size-h2, 36px)", "font-weight": "var(--weight-bold, 700)", "text-align": "center", "margin-bottom": "72px"},
  subtitle: {"font-size": "var(--size-h3, 20px)", "font-weight": "var(--weight-medium, 500)", "margin-bottom": "8px"},
  
  // Layout utilities
  container: {width: "100%", "max-width": "1158px", "margin-left": "auto", "margin-right": "auto", "padding-left": "15px", "padding-right": "15px"},
  section: {"padding-top": "120px", "padding-bottom": "120px"}
}

function getClassPatterns(className) {
  const patterns = {}
  
  Object.entries(CLASS_PATTERNS).forEach(([pattern, props]) => {
    if (className.includes(pattern)) {
      Object.assign(patterns, props)
    }
  })
  
  return patterns
}

function filterInheritedAndGlobalProperties(properties, className, classTags = {}, classParents = {}) {
  const filtered = {...properties}
  
  // Remove global properties that are already defined globally
  GLOBAL_PROPERTIES.forEach(prop => {
    if (filtered[prop]) {
      delete filtered[prop]
    }
  })
  
  // Remove inherited properties for text elements (unless explicitly overridden)
  const tags = classTags[className] || new Set()
  const isTextElement = ["p", "span", "a", "h1", "h2", "h3", "h4", "h5", "h6"].some(tag => tags.has(tag))
  
  if (isTextElement) {
    INHERITED_PROPERTIES.forEach(prop => {
      // Only keep if it's different from parent or explicitly set in Figma
      const hasExplicitValue = properties[prop] && typeof properties[prop] === 'string' && properties[prop].includes("var(")
      if (!hasExplicitValue && filtered[prop]) {
        delete filtered[prop]
      }
    })
  }
  
  return filtered
}

function getPseudoClassesForClass(className, designTokens = null) {
  const pseudo = {}
  
  // Interactive elements
  if (className.includes("link") || className.includes("btn") || className.includes("button")) {
    pseudo[":hover"] = {color: "var(--color-hover, #404bbf)"}
    pseudo[":focus"] = {color: "var(--color-hover, #404bbf)"}
  }
  
  if (className.includes("btn") || className.includes("button")) {
    pseudo[":hover"]["background-color"] = "var(--color-hover, #404bbf)"
    pseudo[":focus"]["background-color"] = "var(--color-hover, #404bbf)"
  }
  
  return pseudo
}

function getResponsiveProperties(className, designTokens = null) {
  const responsive = {}
  const breakpoints = designTokens?.breakpoints || {tablet: "768px", desktop: "1158px"}
  
  // Container responsive
  if (className === "container") {
    responsive.tablet = {"max-width": "768px"}
    responsive.desktop = {"max-width": "1158px"}
  }
  
  // Typography responsive
  if (className.includes("title") || className.includes("hero")) {
    responsive.tablet = {"font-size": "clamp(36px, 4vw, 56px)"}
  }
  
  return responsive
}

function extractUsedTokens(cssText) {
  const tokenRegex = /var\((--[\w-]+)/g
  const usedTokens = new Set()
  let match
  
  while ((match = tokenRegex.exec(cssText)) !== null) {
    usedTokens.add(match[1])
  }
  
  return usedTokens
}

function hasValidProperties(classInfo) {
  const {properties = {}, pseudoClasses = {}, responsive = {}} = classInfo
  return Object.keys(properties).length > 0 || 
         Object.keys(pseudoClasses).length > 0 || 
         Object.keys(responsive).length > 0
}

module.exports = {
  generateCSS,
  generateClassCSS,
  createClassDictionary,
  PROPERTY_CATEGORIES,
  INHERITED_PROPERTIES
}