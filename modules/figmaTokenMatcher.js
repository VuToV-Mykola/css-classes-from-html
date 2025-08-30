// Механізм зіставлення HTML класів з Figma токенами
class FigmaTokenMatcher {
  constructor() {
    this.matchThreshold = 0.3
  }

  // Основний метод зіставлення HTML класів з Figma компонентами
  matchHTMLClassesToFigmaTokens(htmlClasses, figmaTokens) {
    const matches = {}
    
    htmlClasses.forEach(className => {
      const bestMatch = this._findBestComponentMatch(className, figmaTokens.components)
      if (bestMatch) {
        matches[className] = bestMatch.styles
      } else {
        // Створюємо стилі на основі назви класу та доступних токенів
        matches[className] = this._generateStylesFromTokens(className, figmaTokens)
      }
    })
    
    return matches
  }

  // Пошук найкращого відповідника серед Figma компонентів
  _findBestComponentMatch(className, figmaComponents) {
    let bestMatch = null
    let bestScore = 0
    
    Object.entries(figmaComponents).forEach(([componentName, styles]) => {
      const score = this._calculateSimilarity(className, componentName)
      if (score > bestScore && score > this.matchThreshold) {
        bestScore = score
        bestMatch = { name: componentName, styles, score }
      }
    })
    
    return bestMatch
  }

  // Генерація стилів на основі назви класу та доступних токенів
  _generateStylesFromTokens(className, tokens) {
    const styles = {}
    
    // Базові стилі на основі назви класу
    const classPatterns = this._getClassPatterns(className)
    Object.assign(styles, classPatterns)
    
    // Додаємо кольори з токенів
    const colorMatch = this._findColorMatch(className, tokens.colors)
    if (colorMatch) {
      if (className.includes('btn') || className.includes('button')) {
        styles['background-color'] = colorMatch
      } else if (className.includes('text') || className.includes('title')) {
        styles.color = colorMatch
      }
    }
    
    // Додаємо типографіку з токенів
    const fontMatch = this._findFontMatch(className, tokens.typography)
    if (fontMatch) {
      Object.assign(styles, fontMatch)
    }
    
    // Додаємо відступи з токенів
    const spacingMatch = this._findSpacingMatch(className, tokens.spacing)
    if (spacingMatch) {
      Object.assign(styles, spacingMatch)
    }
    
    // Додаємо ефекти з токенів
    const effectMatch = this._findEffectMatch(className, tokens.effects)
    if (effectMatch) {
      Object.assign(styles, effectMatch)
    }
    
    return styles
  }

  // Розрахунок схожості між назвами
  _calculateSimilarity(str1, str2) {
    const words1 = str1.toLowerCase().split(/[-_]/)
    const words2 = str2.toLowerCase().split(/[-_]/)
    
    const commonWords = words1.filter(word => 
      words2.some(w => w.includes(word) || word.includes(w))
    )
    
    return commonWords.length / Math.max(words1.length, words2.length)
  }

  // Базові паттерни стилів для класів
  _getClassPatterns(className) {
    const patterns = {
      // Layout
      container: { 'max-width': '1200px', 'margin': '0 auto', 'padding': '0 15px' },
      wrapper: { 'width': '100%' },
      section: { 'padding': '60px 0' },
      
      // Typography
      title: { 'font-weight': 'bold', 'margin-bottom': '1rem' },
      subtitle: { 'font-weight': '600', 'margin-bottom': '0.5rem' },
      text: { 'line-height': '1.5' },
      
      // Interactive
      btn: { 'padding': '10px 20px', 'border': 'none', 'cursor': 'pointer', 'border-radius': '4px' },
      button: { 'padding': '10px 20px', 'border': 'none', 'cursor': 'pointer', 'border-radius': '4px' },
      link: { 'text-decoration': 'none', 'cursor': 'pointer' },
      
      // Layout components
      header: { 'width': '100%' },
      footer: { 'width': '100%' },
      nav: { 'display': 'flex' },
      menu: { 'list-style': 'none', 'padding': '0' },
      
      // Content
      card: { 'border-radius': '8px', 'padding': '20px' },
      hero: { 'text-align': 'center', 'padding': '80px 0' },
      feature: { 'margin-bottom': '30px' }
    }
    
    const result = {}
    Object.entries(patterns).forEach(([pattern, styles]) => {
      if (className.includes(pattern)) {
        Object.assign(result, styles)
      }
    })
    
    return result
  }

  // Пошук відповідного кольору
  _findColorMatch(className, colors) {
    // Пряме співпадіння
    const directMatch = colors[className]
    if (directMatch) return directMatch
    
    // Пошук за ключовими словами
    const colorKeywords = ['primary', 'secondary', 'accent', 'main', 'brand']
    for (const keyword of colorKeywords) {
      if (className.includes(keyword)) {
        const match = Object.keys(colors).find(key => key.includes(keyword))
        if (match) return colors[match]
      }
    }
    
    // Повертаємо перший доступний колір
    const colorValues = Object.values(colors)
    return colorValues.length > 0 ? colorValues[0] : null
  }

  // Пошук відповідного шрифту
  _findFontMatch(className, typography) {
    const fontStyles = {}
    
    // Пошук розміру шрифту
    const sizeKeys = Object.keys(typography).filter(key => key.includes('size'))
    if (sizeKeys.length > 0) {
      if (className.includes('title') || className.includes('h1')) {
        const largeSize = sizeKeys.find(key => key.includes('large') || key.includes('h1'))
        if (largeSize) fontStyles['font-size'] = typography[largeSize]
      } else if (className.includes('subtitle') || className.includes('h2')) {
        const mediumSize = sizeKeys.find(key => key.includes('medium') || key.includes('h2'))
        if (mediumSize) fontStyles['font-size'] = typography[mediumSize]
      }
    }
    
    // Пошук сімейства шрифтів
    const familyKeys = Object.keys(typography).filter(key => key.includes('family'))
    if (familyKeys.length > 0) {
      fontStyles['font-family'] = typography[familyKeys[0]]
    }
    
    // Пошук ваги шрифту
    const weightKeys = Object.keys(typography).filter(key => key.includes('weight'))
    if (weightKeys.length > 0) {
      if (className.includes('bold') || className.includes('title')) {
        const boldWeight = weightKeys.find(key => key.includes('bold') || key.includes('700'))
        if (boldWeight) fontStyles['font-weight'] = typography[boldWeight]
      }
    }
    
    return Object.keys(fontStyles).length > 0 ? fontStyles : null
  }

  // Пошук відповідних відступів
  _findSpacingMatch(className, spacing) {
    const spacingStyles = {}
    
    // Пошук padding
    const paddingKeys = Object.keys(spacing).filter(key => key.includes('padding'))
    if (paddingKeys.length > 0) {
      if (className.includes('section') || className.includes('container')) {
        spacingStyles.padding = spacing[paddingKeys[0]]
      }
    }
    
    // Пошук gap
    const gapKeys = Object.keys(spacing).filter(key => key.includes('gap'))
    if (gapKeys.length > 0 && (className.includes('list') || className.includes('grid'))) {
      spacingStyles.gap = spacing[gapKeys[0]]
    }
    
    return Object.keys(spacingStyles).length > 0 ? spacingStyles : null
  }

  // Пошук відповідних ефектів
  _findEffectMatch(className, effects) {
    const effectStyles = {}
    
    // Пошук тіней
    const shadowKeys = Object.keys(effects).filter(key => 
      key.includes('shadow') || key.includes('drop')
    )
    if (shadowKeys.length > 0 && (className.includes('card') || className.includes('btn'))) {
      effectStyles['box-shadow'] = effects[shadowKeys[0]]
    }
    
    // Пошук border-radius
    const radiusKeys = Object.keys(effects).filter(key => key.includes('radius'))
    if (radiusKeys.length > 0 && (className.includes('btn') || className.includes('card'))) {
      effectStyles['border-radius'] = effects[radiusKeys[0]]
    }
    
    return Object.keys(effectStyles).length > 0 ? effectStyles : null
  }
}

module.exports = FigmaTokenMatcher