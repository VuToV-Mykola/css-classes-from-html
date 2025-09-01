/* !!! Модуль генерації CSS з оптимізацією для HTML !!! */
const commentManager = require("./commentManager")
const globalRules = require("./globalRules")
const CSSOptimizer = require("./cssOptimizer")
const { minifyCSS } = require("./cssMinifier")

const PROPERTY_CATEGORIES = {
  layout: ["display", "position", "top", "right", "bottom", "left", "z-index", "float", "clear"],
  flexGrid: [
    "flex",
    "flex-direction",
    "flex-wrap",
    "justify-content",
    "align-items",
    "grid",
    "grid-template",
    "gap"
  ],
  boxModel: ["width", "height", "margin", "padding", "border", "border-radius", "box-sizing"],
  typography: ["font-family", "font-size", "font-weight", "line-height", "text-align", "color"],
  visual: ["background", "background-color", "opacity", "box-shadow"],
  animation: ["transition", "transform", "animation"]
}

const INHERITED_PROPERTIES = [
  "color",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "line-height",
  "text-align",
  "text-transform",
  "letter-spacing"
]

const GLOBAL_PROPERTIES = ["box-sizing", "margin", "padding", "font-family", "line-height"]

const PROPERTY_LOOKUP = {}
Object.entries(PROPERTY_CATEGORIES).forEach(([category, props]) => {
  props.forEach(prop => {
    PROPERTY_LOOKUP[prop] = category
  })
})

function generateCSS(
  classes,
  classDictionary,
  includeGlobal = true,
  includeReset = true,
  designTokens = null,
  selectedTags = null,
  options = {}
) {
  let css = generateHTMLBasedCSS(
    classes,
    classDictionary,
    includeGlobal,
    includeReset,
    selectedTags,
    options,
    designTokens
  )

  /* !!! Оптимізація CSS з новими стандартами 2025 !!! */
  if (options.optimizeCSS) {
    const optimizer = new CSSOptimizer({
      commentStyle: options.commentStyle || 'author'
    })
    css = optimizer.optimizeCSS(css, {
      removeRedundant: options.removeRedundant,
      optimizeShorthands: options.optimizeShorthands,
      sortProperties: options.sortProperties,
      removeEmptyRules: options.removeEmptyRules,
      optimizeInheritance: options.optimizeInheritance,
      modernSyntax: options.modernSyntax !== false,
      preserveComments: options.preserveComments !== false
    })
  }

  /* !!! Мінімізація CSS !!! */
  if (options.minify) {
    css = minifyCSS(css)
  }

  return css
}

function extractCSSFromHTML(htmlContent) {
  const cssBlocks = []
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi
  let match

  while ((match = styleRegex.exec(htmlContent)) !== null) {
    cssBlocks.push(match[1].trim())
  }

  return cssBlocks.join("\n")
}

function generateHTMLBasedCSS(
  classes,
  classDictionary,
  includeGlobal = true,
  includeReset = true,
  selectedTags = null,
  options = {},
  designTokens = null
) {
  const cssBlocks = []
  const inheritanceMap = new Map()
  const usedProperties = new Set()

  cssBlocks.push(commentManager.getFileHeader())

  if (includeReset) {
    cssBlocks.push(commentManager.getTranslation("reset_rules"))
    cssBlocks.push(globalRules.getCSSReset())
  }

  if (includeGlobal) {
    cssBlocks.push(commentManager.getTranslation("global_rules"))
    cssBlocks.push(globalRules.getGlobalStyles(selectedTags))
  }

  // Додаємо CSS з тегів style в HTML, якщо є
  if (options.htmlContent) {
    const extractedCSS = extractCSSFromHTML(options.htmlContent)
    if (extractedCSS) {
      cssBlocks.push("/* !!! Стилі з HTML тегів <style> !!! */")
      cssBlocks.push(extractedCSS)
    }
  }

  /* !!! Будуємо ієрархію класів з урахуванням Figma стилів !!! */
  const classHierarchy = buildClassHierarchy(classes, classDictionary, designTokens)

  /* !!! Генеруємо CSS в порядку HTML !!! */
  classHierarchy.forEach(({className, classInfo}) => {
    if (classInfo) {
      const classCSS = generateOptimizedClassCSS(className, classInfo, options.minimal || false)
      cssBlocks.push(classCSS)
    }
  })

  return cssBlocks.join("\n\n")
}

function buildClassHierarchy(classes, classDictionary, designTokens) {
  const hierarchy = []

  /* !!! Для AUTO-GENERATED CSS FROM HTML зберігаємо порядок як в HTML !!! */
  classes.forEach((className, index) => {
    hierarchy.push({
      className,
      classInfo: classDictionary[className],
      level: 0,
      htmlOrder: index
    })
  })

  return hierarchy
}

function getClassInheritedStyles(className, classInfo, inheritanceMap) {
  const inherited = {}

  /* !!! Наслідування від батьківських класів !!! */
  if (classInfo.parents?.length > 0) {
    classInfo.parents.forEach(parentClass => {
      const parentStyles = inheritanceMap.get(parentClass)
      if (parentStyles) {
        INHERITED_PROPERTIES.forEach(prop => {
          if (parentStyles[prop] && !inherited[prop]) {
            inherited[prop] = parentStyles[prop]
          }
        })
      }
    })
  }

  return inherited
}

function filterClassUniqueStyles(properties, inheritedStyles, usedProperties) {
  const unique = {}

  Object.entries(properties).forEach(([prop, value]) => {
    const propKey = `${prop}:${value}`

    // Не дублюємо глобальні властивості
    if (GLOBAL_PROPERTIES.includes(prop)) return

    // Не дублюємо успадковані властивості з тим же значенням
    if (inheritedStyles[prop] === value) return

    // Не дублюємо вже використані пари властивість:значення
    if (usedProperties.has(propKey)) return

    unique[prop] = value
    usedProperties.add(propKey)
  })

  return unique
}

function generateOptimizedClassCSS(className, classInfo, isMinimal = false) {
  const {properties = {}, pseudoClasses = {}, darkMode = {}} = classInfo
  const blocks = []

  const comment = commentManager.getClassComment(className)
  blocks.push(comment)

  // Якщо немає властивостей (мінімальний режим), генеруємо пустий клас
  if (Object.keys(properties).length === 0 || isMinimal) {
    blocks.push(`.${className} {}`)
    return blocks.join("\n")
  }

  const categorizedProps = categorizeProperties(properties)
  const cssRules = []

  Object.entries(PROPERTY_CATEGORIES).forEach(([category, _]) => {
    const categoryProps = categorizedProps[category]
    if (categoryProps && Object.keys(categoryProps).length > 0) {
      Object.entries(categoryProps).forEach(([prop, value]) => {
        cssRules.push(`  /* ${getPropertyComment(prop)} */`)
        cssRules.push(`  ${prop}: ${value};`)
      })
    }
  })

  if (cssRules.length > 0) {
    blocks.push(`.${className} {`)
    blocks.push(...cssRules)
    blocks.push("}")
  } else {
    blocks.push(`.${className} {}`)
  }

  /* !!! Псевдо-класи !!! */
  Object.entries(pseudoClasses).forEach(([selector, props]) => {
    if (Object.keys(props).length > 0) {
      blocks.push("")
      blocks.push(commentManager.getTranslation("hover_focus_states"))
      blocks.push(`.${className}${selector} {`)
      Object.entries(props).forEach(([prop, value]) => {
        blocks.push(`  /* ${getPropertyComment(prop)} */`)
        blocks.push(`  ${prop}: ${value};`)
      })
      blocks.push("}")
    }
  })

  /* !!! Dark mode стилі !!! */
  Object.entries(darkMode).forEach(([mediaQuery, props]) => {
    if (Object.keys(props).length > 0) {
      blocks.push("")
      blocks.push("/* !!! Dark mode стилі !!! */")
      blocks.push(`${mediaQuery} {`)
      blocks.push(`  .${className} {`)
      Object.entries(props).forEach(([prop, value]) => {
        blocks.push(`    /* ${getPropertyComment(prop)} */`)
        blocks.push(`    ${prop}: ${value};`)
      })
      blocks.push("  }")
      blocks.push("}")
    }
  })

  return blocks.join("\n")
}

function getPropertyComment(property) {
  const propertyComments = {
    display: "Спосіб відображення елемента",
    position: "Спосіб позиціонування елемента",
    flex: "Flexbox властивості",
    grid: "Grid властивості",
    width: "Ширина елемента",
    height: "Висота елемента",
    margin: "Зовнішні відступи",
    padding: "Внутрішні відступи",
    border: "Рамка елемента",
    "border-radius": "Заокруглення кутів",
    "font-family": "Сімейство шрифтів",
    "font-size": "Розмір шрифту",
    "font-weight": "Товщина шрифту",
    "line-height": "Міжрядковий інтервал",
    color: "Колір тексту",
    background: "Фон елемента",
    "background-color": "Колір фону",
    opacity: "Рівень непрозорості",
    "box-shadow": "Тінь елемента",
    transition: "Анімація переходу",
    transform: "Трансформація елемента",
    cursor: "Тип курсора при наведенні"
  }

  return propertyComments[property] || "Властивість елемента"
}

function categorizeProperties(properties) {
  const categorized = {
    layout: {},
    flexGrid: {},
    boxModel: {},
    typography: {},
    visual: {},
    animation: {},
    other: {}
  }

  Object.entries(properties).forEach(([prop, value]) => {
    const category = PROPERTY_LOOKUP[prop] || "other"
    categorized[category][prop] = value
  })

  return categorized
}

function createClassDictionary(classes, options = {}, classParents = {}, classTags = {}) {
  const {
    responsive = true,
    darkMode = true,
    designTokens = null,
    breakpoints = {mobile: "320px", tablet: "768px", desktop: "1158px"},
    colorFormat = "hex",
    prefixClasses = "",
    enableInspection = true,
    inspectionPriority = "figma-first",
    matchThreshold = 0.4,
    minimal = false
  } = options

  const dictionary = {}

  classes.forEach(className => {
    const finalClassName = prefixClasses ? `${prefixClasses}${className}` : className
    const tags = classTags[className] ? Array.from(classTags[className]) : []
    const parents = classParents[className] ? Array.from(classParents[className]) : []

    // Для мінімального режиму повертаємо пусті властивості
    const properties = minimal ? {} : getEnhancedClassProperties(className, tags, designTokens, options)

    dictionary[finalClassName] = {
      properties,
      pseudoClasses: responsive ? generateResponsiveProperties(className, breakpoints) : {},
      darkMode: darkMode ? generateDarkModeProperties(className) : {},
      tags,
      parents
    }
  })

  return dictionary
}

function getEnhancedClassProperties(className, tags = [], designTokens = null, options = {}) {
  const properties = {}

  // Покращене зіставлення з Figma вузлами
  if (designTokens?.document?.children) {
    const matchedNode = findBestMatchingNode(className, tags, designTokens.document.children)
    if (matchedNode) {
      Object.assign(properties, extractNodeProperties(matchedNode))
    }
  }

  // Figma стилі з inspectedStyles
  if (designTokens?.inspectedStyles) {
    const matchedStyle = findMatchingFigmaStyle(
      className,
      designTokens.inspectedStyles,
      options.matchThreshold
    )
    if (matchedStyle) {
      Object.assign(properties, matchedStyle)
    }
  }

  // Базові властивості на основі назви класу
  Object.assign(properties, getClassPatterns(className))

  // Властивості на основі тегів
  tags.forEach(tag => {
    Object.assign(properties, getTagProperties(tag))
  })

  return properties
}

function findMatchingFigmaStyle(className, inspectedStyles, matchThreshold = 0.4) {
  if (inspectedStyles[className]) return inspectedStyles[className]

  const classWords = className.split(/[-_]/)
  let bestMatch = null
  let bestScore = 0

  Object.keys(inspectedStyles).forEach(inspectedClass => {
    const inspectedWords = inspectedClass.split(/[-_]/)
    const commonWords = classWords.filter(word => inspectedWords.includes(word))
    const maxLength = Math.max(classWords.length, inspectedWords.length)
    const score = maxLength > 0 ? commonWords.length / maxLength : 0

    if (score > bestScore && score > matchThreshold) {
      bestScore = score
      bestMatch = inspectedStyles[inspectedClass]
    }
  })

  return bestMatch
}

function getClassPatterns(className) {
  const patterns = {
    container: {"max-width": "1200px", margin: "0 auto", padding: "0 15px"},
    header: {"border-bottom": "1px solid #e7e9fc"},
    hero: {
      "background-color": "#2e2f42",
      color: "#fff",
      "text-align": "center",
      padding: "120px 0"
    },
    footer: {"background-color": "#2e2f42", color: "#f4f4fd", padding: "100px 0"},
    btn: {
      "background-color": "var(--accent-color, #4d5ae5)",
      color: "#fff",
      "border-radius": "4px",
      padding: "16px 32px",
      border: "none",
      cursor: "pointer"
    },
    title: {
      "font-size": "36px",
      "font-weight": "700",
      "text-align": "center",
      "margin-bottom": "72px"
    },
    section: {"padding-top": "120px", "padding-bottom": "120px"}
  }

  const result = {}
  Object.entries(patterns).forEach(([pattern, props]) => {
    if (className.includes(pattern) || (pattern === 'btn' && className.includes('button'))) {
      Object.assign(result, props)
    }
  })

  return result
}

function getTagProperties(tag) {
  const tagProperties = {
    h1: {"font-weight": "bold", "font-size": "2rem", "margin-bottom": "1rem"},
    h2: {"font-weight": "bold", "font-size": "1.5rem", "margin-bottom": "1rem"},
    h3: {"font-weight": "bold", "font-size": "1.25rem", "margin-bottom": "0.5rem"},
    button: {padding: "10px 20px", border: "none", cursor: "pointer"},
    a: {"text-decoration": "none", color: "var(--link-color, #4d5ae5)"},
    p: {"margin-bottom": "1rem"},
    ul: {"list-style": "none", padding: "0"},
    img: {"max-width": "100%", height: "auto"}
  }

  return tagProperties[tag] || {}
}

function generateResponsiveProperties(className, breakpoints) {
  const responsive = {}

  if (className.includes("mobile")) {
    responsive[`:is(@media (max-width: ${breakpoints.tablet}))`] = {
      display: "block"
    }
  }

  return responsive
}

function generateDarkModeProperties(className) {
  const darkMode = {}

  if (className.includes("text")) {
    darkMode["@media (prefers-color-scheme: dark)"] = {
      color: "#ffffff"
    }
  }

  return darkMode
}

function findBestMatchingNode(className, tags, nodes, hierarchy = []) {
  let bestMatch = null
  let bestScore = 0

  for (const node of nodes) {
    if (node.name && node.type !== "DOCUMENT") {
      const currentHierarchy = [...hierarchy, node.name]

      // Обчислюємо скор відповідності
      const score = calculateNodeMatchScore(className, tags, node, currentHierarchy)

      if (score > bestScore) {
        bestScore = score
        bestMatch = node
      }

      // Рекурсивно перевіряємо дочірні вузли
      if (node.children) {
        const childMatch = findBestMatchingNode(className, tags, node.children, currentHierarchy)
        if (childMatch) {
          const childScore = calculateNodeMatchScore(className, tags, childMatch, [
            ...currentHierarchy,
            childMatch.name
          ])
          if (childScore > bestScore) {
            bestScore = childScore
            bestMatch = childMatch
          }
        }
      }
    }
  }

  return bestMatch
}

function calculateNodeMatchScore(className, tags, node, hierarchy) {
  let score = 0
  const nodeName = node.name.toLowerCase()
  const classWords = className.toLowerCase().split(/[-_]/)
  const nodeWords = nodeName.split(/[-_\s]/)

  // Пряме співпадіння назви
  if (nodeName === className.toLowerCase()) {
    score += 100
  }

  // Співпадіння слів у назві
  const commonWords = classWords.filter(word =>
    nodeWords.some(nWord => nWord.includes(word) || word.includes(nWord))
  )
  const maxWordsLength = Math.max(classWords.length, nodeWords.length)
  score += maxWordsLength > 0 ? (commonWords.length / maxWordsLength) * 50 : 0

  // Співпадіння з тегами
  if (tags.length > 0) {
    const tagMatches = tags.filter(tag => {
      const tagPatterns = {
        h1: ["title", "heading", "header"],
        h2: ["subtitle", "heading", "title"],
        h3: ["subtitle", "heading"],
        button: ["btn", "button", "cta"],
        a: ["link", "nav"],
        p: ["text", "description", "content"],
        div: ["container", "wrapper", "section"],
        section: ["section", "block"],
        header: ["header", "top"],
        footer: ["footer", "bottom"]
      }

      const patterns = tagPatterns[tag] || []
      return patterns.some(pattern => nodeName.includes(pattern))
    })
    score += (tagMatches.length / tags.length) * 30
  }

  // Бонус за ієрархію (чим глибше, тим більше бонус)
  score += Math.min(hierarchy.length * 5, 20)

  // Бонус за наявність стилів
  if (node.style || node.fills || node.backgroundColor) {
    score += 10
  }

  return score
}

function extractNodeProperties(node) {
  const properties = {}

  // Розміри з виправленою точністю (максимум 4 десяткові знаки)
  if (node.absoluteBoundingBox) {
    const box = node.absoluteBoundingBox
    if (box.width && box.width > 0) {
      const width = parseFloat(box.width.toFixed(4))
      properties["width"] = `${width}px`
    }
    if (box.height && box.height > 0) {
      const height = parseFloat(box.height.toFixed(4))
      properties["height"] = `${height}px`
    }
  }

  // Кольори з покращеною обробкою
  if (node.backgroundColor) {
    const bg = node.backgroundColor
    const r = Math.round(bg.r * 255)
    const g = Math.round(bg.g * 255)
    const b = Math.round(bg.b * 255)
    const a = parseFloat((bg.a || 1).toFixed(3))

    if (a === 1) {
      properties["background-color"] = `rgb(${r}, ${g}, ${b})`
    } else {
      properties["background-color"] = `rgba(${r}, ${g}, ${b}, ${a})`
    }
  }

  if (node.fills?.[0]?.color) {
    const color = node.fills[0].color
    const r = Math.round(color.r * 255)
    const g = Math.round(color.g * 255)
    const b = Math.round(color.b * 255)
    const a = parseFloat((color.a || 1).toFixed(3))

    if (a === 1) {
      properties["color"] = `rgb(${r}, ${g}, ${b})`
    } else {
      properties["color"] = `rgba(${r}, ${g}, ${b}, ${a})`
    }
  }

  // Типографіка з виправленою точністю
  if (node.style) {
    if (node.style.fontSize) {
      const fontSize = parseFloat(parseFloat(node.style.fontSize).toFixed(4))
      properties["font-size"] = `${fontSize}px`
    }
    if (node.style.fontWeight) {
      properties["font-weight"] = node.style.fontWeight
    }
    if (node.style.fontFamily) {
      properties["font-family"] = `"${node.style.fontFamily}", sans-serif`
    }
    if (node.style.lineHeightPx) {
      const lineHeight = parseFloat(parseFloat(node.style.lineHeightPx).toFixed(4))
      properties["line-height"] = `${lineHeight}px`
    }
    if (node.style.textAlignHorizontal) {
      const alignMap = {LEFT: "left", CENTER: "center", RIGHT: "right", JUSTIFIED: "justify"}
      properties["text-align"] = alignMap[node.style.textAlignHorizontal] || "left"
    }
  }

  // Відступи з оптимізованою точністю
  if (node.paddingLeft || node.paddingRight || node.paddingTop || node.paddingBottom) {
    const padding = [
      parseFloat((node.paddingTop || 0).toFixed(4)),
      parseFloat((node.paddingRight || 0).toFixed(4)),
      parseFloat((node.paddingBottom || 0).toFixed(4)),
      parseFloat((node.paddingLeft || 0).toFixed(4))
    ]

    if (padding.some(p => p > 0)) {
      // Оптимізуємо padding shorthand
      if (padding[0] === padding[2] && padding[1] === padding[3]) {
        if (padding[0] === padding[1]) {
          properties["padding"] = `${padding[0]}px`
        } else {
          properties["padding"] = `${padding[0]}px ${padding[1]}px`
        }
      } else {
        properties["padding"] = padding.map(p => `${p}px`).join(" ")
      }
    }
  }

  // Макет з покращеною обробкою
  if (node.layoutMode) {
    if (node.layoutMode === "HORIZONTAL") {
      properties["display"] = "flex"
      properties["flex-direction"] = "row"
    } else if (node.layoutMode === "VERTICAL") {
      properties["display"] = "flex"
      properties["flex-direction"] = "column"
    }

    if (node.itemSpacing) {
      const spacing = parseFloat(parseFloat(node.itemSpacing).toFixed(4))
      properties["gap"] = `${spacing}px`
    }

    if (node.primaryAxisAlignItems) {
      const justifyMap = {
        MIN: "flex-start",
        CENTER: "center",
        MAX: "flex-end",
        SPACE_BETWEEN: "space-between"
      }
      properties["justify-content"] = justifyMap[node.primaryAxisAlignItems] || "flex-start"
    }

    if (node.counterAxisAlignItems) {
      const alignMap = {MIN: "flex-start", CENTER: "center", MAX: "flex-end"}
      properties["align-items"] = alignMap[node.counterAxisAlignItems] || "flex-start"
    }
  }

  // Обрізка кутів з виправленою точністю
  if (node.cornerRadius) {
    const radius = parseFloat(parseFloat(node.cornerRadius).toFixed(4))
    properties["border-radius"] = `${radius}px`
  }

  // Обведення з покращеною обробкою
  if (node.strokes && node.strokes.length > 0) {
    const stroke = node.strokes[0]
    if (stroke.color && node.strokeWeight) {
      const color = stroke.color
      const r = Math.round(color.r * 255)
      const g = Math.round(color.g * 255)
      const b = Math.round(color.b * 255)
      const a = parseFloat((color.a || 1).toFixed(3))
      const weight = parseFloat(parseFloat(node.strokeWeight).toFixed(4))

      if (a === 1) {
        properties["border"] = `${weight}px solid rgb(${r}, ${g}, ${b})`
      } else {
        properties["border"] = `${weight}px solid rgba(${r}, ${g}, ${b}, ${a})`
      }
    }
  }

  return properties
}

function hasValidProperties(classInfo) {
  const {properties = {}, pseudoClasses = {}, responsive = {}} = classInfo
  return (
    Object.keys(properties).length > 0 ||
    Object.keys(pseudoClasses).length > 0 ||
    Object.keys(responsive).length > 0
  )
}

module.exports = {
  generateCSS,
  createClassDictionary,
  extractCSSFromHTML,
  PROPERTY_CATEGORIES,
  INHERITED_PROPERTIES
}
