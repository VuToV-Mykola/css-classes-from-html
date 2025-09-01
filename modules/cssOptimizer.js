/* !!! Модуль оптимізації CSS згідно з найновішими стандартами 2025 !!! */
class CSSOptimizer {
  constructor(options = {}) {
    this.commentStyle = options.commentStyle || 'author'
    
    /* !!! Властивості що успадковуються згідно CSS 2025 !!! */
    this.inheritableProperties = new Set([
      'color', 'font-family', 'font-size', 'font-weight', 'font-style',
      'line-height', 'text-align', 'text-transform', 'letter-spacing',
      'word-spacing', 'text-indent', 'text-decoration', 'visibility',
      'cursor', 'quotes', 'list-style', 'direction', 'writing-mode'
    ])
    
    /* !!! Конфігурація shorthand властивостей 2025 !!! */
    this.shorthandProperties = {
      margin: ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'],
      padding: ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'],
      border: ['border-width', 'border-style', 'border-color'],
      'border-radius': ['border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius'],
      font: ['font-style', 'font-variant', 'font-weight', 'font-size', 'line-height', 'font-family'],
      background: ['background-color', 'background-image', 'background-repeat', 'background-position', 'background-size'],
      animation: ['animation-name', 'animation-duration', 'animation-timing-function', 'animation-delay'],
      transition: ['transition-property', 'transition-duration', 'transition-timing-function', 'transition-delay']
    }
    
    /* !!! Кеш для оптимізації продуктивності !!! */
    this.selectorRuleMap = new Map()
    this.propertyOrderMap = null
  }

  /* !!! Оптимізація CSS з поліпшеною обробкою помилок !!! */
  optimizeCSS(cssContent, options = {}) {
    try {
      const {
        removeRedundant = true,
        optimizeShorthands = true,
        sortProperties = true,
        removeEmptyRules = true, // Змінено на true для 2025
        optimizeInheritance = true,
        preserveComments = true,
        modernSyntax = true
      } = options

      if (!cssContent || typeof cssContent !== 'string') {
        throw new Error('Некоректний CSS контент')
      }

      let optimized = cssContent

      /* !!! Послідовність оптимізації 2025 !!! */
      if (removeRedundant) {
        optimized = this.removeRedundantDeclarations(optimized)
      }

      if (optimizeShorthands) {
        optimized = this.optimizeShorthands(optimized)
      }

      if (sortProperties) {
        optimized = this.sortProperties(optimized)
      }

      if (optimizeInheritance) {
        optimized = this.optimizeInheritance(optimized)
      }

      if (removeEmptyRules) {
        optimized = this.removeEmptyRules(optimized)
      }

      if (modernSyntax) {
        optimized = this.modernizeSyntax(optimized)
      }

      return optimized
    } catch (error) {
      console.error('Помилка оптимізації CSS:', encodeURIComponent(error.message))
      return cssContent // Повертаємо оригінальний контент
    }
  }

  removeRedundantDeclarations(css) {
    const rules = this.parseCSS(css)
    const optimizedRules = []

    rules.forEach(rule => {
      if (rule.type === 'rule') {
        const uniqueDeclarations = new Map()
        
        rule.declarations.forEach(decl => {
          uniqueDeclarations.set(decl.property, decl)
        })
        
        rule.declarations = Array.from(uniqueDeclarations.values())
      }
      optimizedRules.push(rule)
    })

    return this.stringifyCSS(optimizedRules)
  }

  optimizeShorthands(css) {
    const rules = this.parseCSS(css)

    rules.forEach(rule => {
      if (rule.type === 'rule') {
        Object.entries(this.shorthandProperties).forEach(([shorthand, longhand]) => {
          const longhandDecls = rule.declarations.filter(d => longhand.includes(d.property))
          
          if (longhandDecls.length >= 2) {
            const shorthandValue = this.createShorthand(shorthand, longhandDecls)
            if (shorthandValue) {
              rule.declarations = rule.declarations.filter(d => !longhand.includes(d.property))
              rule.declarations.push({ property: shorthand, value: shorthandValue })
            }
          }
        })
      }
    })

    return this.stringifyCSS(rules)
  }

  /* !!! Оптимізація наслідування з поліпшеною логікою !!! */
  optimizeInheritance(css) {
    const rules = this.parseCSS(css)
    this.buildSelectorRuleMap(rules)

    /* !!! Оптимізуємо кожен селектор окремо !!! */
    rules.forEach(rule => {
      if (rule.type === 'rule') {
        rule.declarations = rule.declarations.filter(decl => {
          if (!this.inheritableProperties.has(decl.property)) {
            return true
          }

          /* !!! Перевіряємо всі селектори в правилі !!! */
          return !rule.selectors.some(selector => 
            this.isInheritedFromParent(selector, decl, rules)
          )
        })
      }
    })

    return this.stringifyCSS(rules)
  }

  /* !!! Сортування властивостей згідно стандартів 2025 !!! */
  sortProperties(css) {
    const rules = this.parseCSS(css)
    
    /* !!! Оптимізований порядок властивостей 2025 !!! */
    if (!this.propertyOrderMap) {
      const propertyOrder = [
        // Positioning & Layout
        'position', 'top', 'right', 'bottom', 'left', 'z-index', 'inset',
        // Display & Flexbox/Grid
        'display', 'flex', 'flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'align-content',
        'grid', 'grid-template', 'grid-area', 'gap', 'place-items',
        // Box Model
        'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
        'margin', 'padding', 'border', 'border-radius', 'box-sizing',
        // Typography
        'font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 
        'color', 'text-align', 'text-decoration', 'text-transform',
        // Visual & Effects
        'background', 'background-color', 'opacity', 'box-shadow', 'filter',
        // Animation & Transitions
        'transition', 'transform', 'animation',
        // Modern CSS
        'container', 'aspect-ratio', 'object-fit', 'scroll-behavior'
      ]
      
      this.propertyOrderMap = new Map(propertyOrder.map((prop, index) => [prop, index]))
    }

    rules.forEach(rule => {
      if (rule.type === 'rule') {
        rule.declarations.sort((a, b) => {
          const aIndex = this.propertyOrderMap.get(a.property) ?? 9999
          const bIndex = this.propertyOrderMap.get(b.property) ?? 9999
          
          if (aIndex === 9999 && bIndex === 9999) {
            return a.property.localeCompare(b.property)
          }
          
          return aIndex - bIndex
        })
      }
    })

    return this.stringifyCSS(rules)
  }

  removeEmptyRules(css) {
    const rules = this.parseCSS(css)
    return this.stringifyCSS(rules.filter(rule => {
      if (rule.type === 'rule') {
        return rule.declarations.length > 0
      }
      return true
    }))
  }

  /* !!! Поліпшений парсер CSS з обробкою помилок !!! */
  parseCSS(css) {
    try {
      const rules = []
      const comments = []
      
      /* !!! Патерни для парсингу CSS !!! */
      const CSS_RULE_PATTERN = /([^{]+)\{([^}]+)\}/g
      const CSS_DECLARATION_PATTERN = /([^:]+):\s*([^;]+);?/g
      const CSS_COMMENT_PATTERN = /\/\*[\s\S]*?\*\//g
      
      /* !!! Зберігаємо коментарі !!! */
      let commentMatch
      while ((commentMatch = CSS_COMMENT_PATTERN.exec(css)) !== null) {
        comments.push({
          content: commentMatch[0],
          index: commentMatch.index
        })
      }
      
      let match
      while ((match = CSS_RULE_PATTERN.exec(css)) !== null) {
        const selectors = match[1].trim().split(',').map(s => s.trim()).filter(Boolean)
        const declarations = []
        
        let declMatch
        while ((declMatch = CSS_DECLARATION_PATTERN.exec(match[2])) !== null) {
          const property = declMatch[1].trim()
          const value = declMatch[2].trim()
          
          if (property && value) {
            declarations.push({ property, value })
          }
        }
        
        if (selectors.length > 0) {
          rules.push({
            type: 'rule',
            selectors,
            declarations,
            originalIndex: match.index
          })
        }
      }

      return rules
    } catch (error) {
      console.error('Помилка парсингу CSS:', encodeURIComponent(error.message))
      return []
    }
  }

  stringifyCSS(rules) {
    return rules.map(rule => {
      if (rule.type === 'rule') {
        const declarations = rule.declarations
          .map(d => `  ${d.property}: ${d.value};`)
          .join('\n')
        
        return `${rule.selectors.join(', ')} {\n${declarations}\n}`
      }
      return rule.raw || ''
    }).join('\n\n')
  }

  /* !!! Універсальний генератор shorthand властивостей !!! */
  createShorthand(property, declarations) {
    const shorthandConfig = this.shorthandProperties[property]
    if (!shorthandConfig) return null

    switch (property) {
      case 'margin':
      case 'padding':
        return this.createBoxModelShorthand(declarations, property)
      
      case 'border':
        return this.createBorderShorthand(declarations)
      
      case 'border-radius':
        return this.createBorderRadiusShorthand(declarations)
      
      case 'font':
        return this.createFontShorthand(declarations)
      
      case 'background':
        return this.createBackgroundShorthand(declarations)
      
      case 'animation':
      case 'transition':
        return this.createAnimationShorthand(declarations, property)
      
      default:
        return null
    }
  }

  /* !!! Генератор shorthand для margin/padding !!! */
  createBoxModelShorthand(declarations, property) {
    const values = ['top', 'right', 'bottom', 'left'].map(side => {
      const decl = declarations.find(d => d.property === `${property}-${side}`)
      return decl ? decl.value : '0'
    })
    
    if (values.every(v => v === values[0])) return values[0]
    if (values[0] === values[2] && values[1] === values[3]) {
      return values[0] === values[1] ? values[0] : `${values[0]} ${values[1]}`
    }
    if (values[1] === values[3]) {
      return `${values[0]} ${values[1]} ${values[2]}`
    }
    return values.join(' ')
  }

  /* !!! Генератор shorthand для border !!! */
  createBorderShorthand(declarations) {
    const width = declarations.find(d => d.property === 'border-width')?.value
    const style = declarations.find(d => d.property === 'border-style')?.value
    const color = declarations.find(d => d.property === 'border-color')?.value
    
    if (width && style && color) {
      return `${width} ${style} ${color}`
    }
    return null
  }

  /* !!! Генератор shorthand для border-radius !!! */
  createBorderRadiusShorthand(declarations) {
    const corners = ['top-left', 'top-right', 'bottom-right', 'bottom-left']
    const values = corners.map(corner => {
      const decl = declarations.find(d => d.property === `border-${corner}-radius`)
      return decl ? decl.value : '0'
    })
    
    if (values.every(v => v === values[0])) return values[0]
    return values.join(' ')
  }

  /* !!! Генератор shorthand для font !!! */
  createFontShorthand(declarations) {
    const size = declarations.find(d => d.property === 'font-size')?.value
    const family = declarations.find(d => d.property === 'font-family')?.value
    
    if (size && family) {
      const style = declarations.find(d => d.property === 'font-style')?.value || ''
      const weight = declarations.find(d => d.property === 'font-weight')?.value || ''
      const lineHeight = declarations.find(d => d.property === 'line-height')?.value
      
      let fontValue = ''
      if (style && style !== 'normal') fontValue += `${style} `
      if (weight && weight !== 'normal') fontValue += `${weight} `
      fontValue += size
      if (lineHeight) fontValue += `/${lineHeight}`
      fontValue += ` ${family}`
      
      return fontValue.trim()
    }
    return null
  }

  /* !!! Генератор shorthand для background !!! */
  createBackgroundShorthand(declarations) {
    const color = declarations.find(d => d.property === 'background-color')?.value
    const image = declarations.find(d => d.property === 'background-image')?.value
    const repeat = declarations.find(d => d.property === 'background-repeat')?.value
    const position = declarations.find(d => d.property === 'background-position')?.value
    const size = declarations.find(d => d.property === 'background-size')?.value
    
    if (color || image) {
      let bgValue = ''
      if (color) bgValue += color
      if (image) bgValue += ` ${image}`
      if (repeat && repeat !== 'repeat') bgValue += ` ${repeat}`
      if (position && position !== '0% 0%') bgValue += ` ${position}`
      if (size && size !== 'auto') bgValue += ` / ${size}`
      
      return bgValue.trim()
    }
    return null
  }

  /* !!! Генератор shorthand для animation/transition !!! */
  createAnimationShorthand(declarations, property) {
    const name = declarations.find(d => 
      property === 'animation' ? d.property === `${property}-name` : d.property === `${property}-property`
    )?.value
    const duration = declarations.find(d => d.property === `${property}-duration`)?.value
    const timing = declarations.find(d => d.property === `${property}-timing-function`)?.value
    const delay = declarations.find(d => d.property === `${property}-delay`)?.value
    
    if (name && duration) {
      let value = `${name} ${duration}`
      if (timing && timing !== 'ease') value += ` ${timing}`
      if (delay && delay !== '0s') value += ` ${delay}`
      return value
    }
    return null
  }

  getParentSelector(selector) {
    const parts = selector.split(/[\s>+~]+/)
    return parts.length > 1 ? parts.slice(0, -1).join(' ') : null
  }

  /* !!! Оптимізована перевірка наслідування !!! */
  isInheritedFromParent(selector, declaration, rules) {
    const parent = this.getParentSelector(selector)
    if (!parent) return false

    /* !!! Використовуємо кеш для оптимізації !!! */
    const parentRule = this.selectorRuleMap.get(parent)
    if (!parentRule) return false

    return parentRule.declarations.some(d => 
      d.property === declaration.property && d.value === declaration.value
    )
  }

  /* !!! Побудова кешу селекторів !!! */
  buildSelectorRuleMap(rules) {
    this.selectorRuleMap.clear()
    rules.forEach(rule => {
      if (rule.type === 'rule') {
        rule.selectors.forEach(selector => {
          this.selectorRuleMap.set(selector, rule)
        })
      }
    })
  }

  /* !!! Модернізація CSS синтаксису для 2025 !!! */
  modernizeSyntax(css) {
    let modernized = css
    
    /* !!! Заміна застарілих властивостей !!! */
    const modernReplacements = {
      'text-decoration-line': 'text-decoration',
      'background-position-x': 'background-position',
      'background-position-y': 'background-position',
      '-webkit-appearance': 'appearance',
      '-moz-appearance': 'appearance'
    }
    
    if (!this.modernReplacementRegexes) {
      this.modernReplacementRegexes = Object.entries(modernReplacements)
        .map(([old, modern]) => [new RegExp(`\\b${old}\\b`, 'g'), modern])
    }
    
    this.modernReplacementRegexes.forEach(([regex, modern]) => {
      modernized = modernized.replace(regex, modern)
    })
    
    /* !!! Оптимізація кольорів !!! */
    modernized = modernized.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*1\)/g, 'rgb($1, $2, $3)')
    modernized = modernized.replace(/hsla\((\d+),\s*(\d+%),\s*(\d+%),\s*1\)/g, 'hsl($1, $2, $3)')
    
    /* !!! Оптимізація нульових значень !!! */
    modernized = modernized.replace(/:\s*0px/g, ': 0')
    modernized = modernized.replace(/:\s*0em/g, ': 0')
    modernized = modernized.replace(/:\s*0rem/g, ': 0')
    
    return modernized
  }

  /* !!! Конфігурація стилю коментарів !!! */
  getCommentStyle() {
    return this.commentStyle === 'author' ? '/* !!! ' : '/* '
  }

  getCommentEnd() {
    return this.commentStyle === 'author' ? ' !!! */' : ' */'
  }
}

module.exports = CSSOptimizer