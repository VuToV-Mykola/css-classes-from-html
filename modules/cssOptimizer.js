// Модуль оптимізації CSS згідно з https://codeguide.co
class CSSOptimizer {
  constructor() {
    this.inheritableProperties = [
      'color', 'font-family', 'font-size', 'font-weight', 'font-style',
      'line-height', 'text-align', 'text-transform', 'letter-spacing',
      'word-spacing', 'text-indent', 'text-decoration', 'visibility'
    ]
    
    this.shorthandProperties = {
      'margin': ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'],
      'padding': ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'],
      'border': ['border-width', 'border-style', 'border-color'],
      'font': ['font-style', 'font-variant', 'font-weight', 'font-size', 'line-height', 'font-family'],
      'background': ['background-color', 'background-image', 'background-repeat', 'background-position']
    }
  }

  optimizeCSS(cssContent, options = {}) {
    const {
      removeRedundant = true,
      optimizeShorthands = true,
      sortProperties = true,
      removeEmptyRules = true,
      optimizeInheritance = true
    } = options

    let optimized = cssContent

    if (removeRedundant) {
      optimized = this.removeRedundantDeclarations(optimized)
    }

    if (optimizeShorthands) {
      optimized = this.optimizeShorthands(optimized)
    }

    if (optimizeInheritance) {
      optimized = this.optimizeInheritance(optimized)
    }

    if (sortProperties) {
      optimized = this.sortProperties(optimized)
    }

    if (removeEmptyRules) {
      optimized = this.removeEmptyRules(optimized)
    }

    return optimized
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

  optimizeInheritance(css) {
    const rules = this.parseCSS(css)
    const inheritanceMap = new Map()

    // Будуємо карту наслідування
    rules.forEach(rule => {
      if (rule.type === 'rule') {
        rule.selectors.forEach(selector => {
          const parent = this.getParentSelector(selector)
          if (parent) {
            if (!inheritanceMap.has(parent)) {
              inheritanceMap.set(parent, new Set())
            }
            inheritanceMap.get(parent).add(selector)
          }
        })
      }
    })

    // Оптимізуємо наслідування
    rules.forEach(rule => {
      if (rule.type === 'rule') {
        rule.declarations = rule.declarations.filter(decl => {
          if (!this.inheritableProperties.includes(decl.property)) {
            return true
          }

          // Перевіряємо чи є це властивість успадкована від батька
          return !this.isInheritedFromParent(rule.selectors[0], decl, rules)
        })
      }
    })

    return this.stringifyCSS(rules)
  }

  sortProperties(css) {
    const rules = this.parseCSS(css)
    const propertyOrder = [
      // Positioning
      'position', 'top', 'right', 'bottom', 'left', 'z-index',
      // Box model
      'display', 'flex', 'flex-direction', 'justify-content', 'align-items',
      'width', 'height', 'margin', 'padding', 'border', 'border-radius',
      // Typography
      'font-family', 'font-size', 'font-weight', 'line-height', 'color', 'text-align',
      // Visual
      'background', 'background-color', 'opacity', 'box-shadow',
      // Other
      'transition', 'transform'
    ]

    rules.forEach(rule => {
      if (rule.type === 'rule') {
        rule.declarations.sort((a, b) => {
          const aIndex = propertyOrder.indexOf(a.property)
          const bIndex = propertyOrder.indexOf(b.property)
          
          if (aIndex === -1 && bIndex === -1) {
            return a.property.localeCompare(b.property)
          }
          if (aIndex === -1) return 1
          if (bIndex === -1) return -1
          
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

  parseCSS(css) {
    const rules = []
    const ruleRegex = /([^{]+)\{([^}]+)\}/g
    let match

    while ((match = ruleRegex.exec(css)) !== null) {
      const selectors = match[1].trim().split(',').map(s => s.trim())
      const declarations = []
      
      const declRegex = /([^:]+):\s*([^;]+);?/g
      let declMatch
      
      while ((declMatch = declRegex.exec(match[2])) !== null) {
        declarations.push({
          property: declMatch[1].trim(),
          value: declMatch[2].trim()
        })
      }
      
      rules.push({
        type: 'rule',
        selectors,
        declarations
      })
    }

    return rules
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

  createShorthand(property, declarations) {
    if (property === 'margin' || property === 'padding') {
      const values = ['top', 'right', 'bottom', 'left'].map(side => {
        const decl = declarations.find(d => d.property.endsWith(side))
        return decl ? decl.value : '0'
      })
      
      if (values.every(v => v === values[0])) return values[0]
      if (values[0] === values[2] && values[1] === values[3]) {
        return `${values[0]} ${values[1]}`
      }
      return values.join(' ')
    }
    
    return null
  }

  getParentSelector(selector) {
    const parts = selector.split(/\s+/)
    return parts.length > 1 ? parts.slice(0, -1).join(' ') : null
  }

  isInheritedFromParent(selector, declaration, rules) {
    const parent = this.getParentSelector(selector)
    if (!parent) return false

    const parentRule = rules.find(rule => 
      rule.selectors && rule.selectors.includes(parent)
    )
    
    if (!parentRule) return false

    return parentRule.declarations.some(d => 
      d.property === declaration.property && d.value === declaration.value
    )
  }
}

module.exports = CSSOptimizer