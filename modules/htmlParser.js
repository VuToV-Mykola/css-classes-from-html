/* !!! Модуль для парсингу HTML та витягування CSS класів !!! */

/* !!! Витягує класи з HTML контенту з інформацією про ієрархію !!! */
function extractClasses(htmlContent) {
  const classRegex = /class="([^"]*)"/g
  const classes = new Set()
  const classParents = {}
  const classTags = {}
  const classHierarchy = new Map()
  
  let match
  while ((match = classRegex.exec(htmlContent)) !== null) {
    const classList = match[1].split(/\s+/).filter(c => c.trim() !== "")
    classList.forEach(cls => {
      const trimmed = cls.trim()
      if (trimmed) {
        classes.add(trimmed)
        if (!classParents[trimmed]) classParents[trimmed] = new Set()
        if (!classTags[trimmed]) classTags[trimmed] = new Set()
      }
    })
  }

  /* !!! Витягуємо ієрархію та інформацію про теги !!! */
  const tagRegex = /<(\w+)[^>]*class="([^"]*)"[^>]*>/g
  let tagMatch
  while ((tagMatch = tagRegex.exec(htmlContent)) !== null) {
    const tagName = tagMatch[1].toLowerCase()
    const classList = tagMatch[2].split(/\s+/).filter(c => c.trim() !== "")
    
    classList.forEach(cls => {
      const trimmed = cls.trim()
      if (trimmed && classTags[trimmed]) {
        classTags[trimmed].add(tagName)
      }
    })
  }

  return {
    classes: Array.from(classes),
    classParents,
    classTags,
    classHierarchy
  }
}

function extractIds(htmlContent) {
  const idRegex = /id="([^"]*)"/g
  const ids = new Set()
  let match

  while ((match = idRegex.exec(htmlContent)) !== null) {
    const trimmed = match[1].trim()
    if (trimmed) {
      ids.add(trimmed)
    }
  }

  return Array.from(ids)
}

const COMPONENT_PATTERNS = {
  header: [/header/i, /\.header/],
  hero: [/\.hero/],
  features: [/\.features/],
  team: [/\.team/],
  portfolio: [/\.portfolio/],
  footer: [/footer/i, /\.footer/]
}

const LAYOUT_PATTERNS = {
  flexbox: [/flex/i, /display:\s*flex/i],
  grid: [/grid/i, /display:\s*grid/i],
  container: [/\.container/]
}

function analyzeStructure(htmlContent) {
  const structure = {
    components: {},
    layout: {
      usesFlexbox: false,
      usesGrid: false,
      hasContainer: false
    }
  }

  /* !!! Перевіряємо компоненти !!! */
  Object.entries(COMPONENT_PATTERNS).forEach(([component, patterns]) => {
    structure.components[component] = patterns.some(pattern => pattern.test(htmlContent))
  })

  /* !!! Перевіряємо макет !!! */
  Object.entries(LAYOUT_PATTERNS).forEach(([layout, patterns]) => {
    if (layout === "flexbox") {
      structure.layout.usesFlexbox = patterns.some(pattern => pattern.test(htmlContent))
    } else if (layout === "grid") {
      structure.layout.usesGrid = patterns.some(pattern => pattern.test(htmlContent))
    } else if (layout === "container") {
      structure.layout.hasContainer = patterns.some(pattern => pattern.test(htmlContent))
    }
  })

  return structure
}

module.exports = {
  extractClasses,
  extractIds,
  analyzeStructure
}