// Універсальний генератор CSS з Figma токенів з підтримкою множинного Canvas
const FigmaTokenMatcher = require('./figmaTokenMatcher')

class UniversalFigmaGenerator {
  constructor(figmaService) {
    this.figmaService = figmaService
    this.tokenMatcher = new FigmaTokenMatcher()
    this.designTokens = {
      colors: new Map(),
      typography: new Map(),
      spacing: new Map(),
      effects: new Map(),
      components: new Map()
    }
  }

  // Вибір множинних Canvas
  async selectMultipleCanvas(fileKey, canvasNames = []) {
    const fileData = await this.figmaService.getFile(fileKey)
    const selectedCanvases = []
    
    if (canvasNames.length === 0) {
      // Якщо не вказано Canvas, повертаємо всі доступні
      return fileData.document.children.filter(child => child.type === "CANVAS")
    }
    
    for (const canvas of fileData.document.children) {
      if (canvas.type === "CANVAS" && canvasNames.includes(canvas.name)) {
        selectedCanvases.push(canvas)
        if (selectedCanvases.length === canvasNames.length) break
      }
    }
    
    return selectedCanvases
  }

  // Витягування токенів з множинних Canvas
  extractTokensFromCanvases(canvases) {
    canvases.forEach(canvas => {
      this._extractCanvasTokens(canvas)
    })
    
    return {
      colors: Object.fromEntries(this.designTokens.colors),
      typography: Object.fromEntries(this.designTokens.typography),
      spacing: Object.fromEntries(this.designTokens.spacing),
      effects: Object.fromEntries(this.designTokens.effects),
      components: Object.fromEntries(this.designTokens.components)
    }
  }

  _extractCanvasTokens(canvas) {
    this._traverseNodes(canvas.children || [])
  }

  _traverseNodes(nodes) {
    nodes.forEach(node => {
      // Витягуємо кольори
      this._extractColors(node)
      
      // Витягуємо типографіку
      this._extractTypography(node)
      
      // Витягуємо відступи
      this._extractSpacing(node)
      
      // Витягуємо ефекти
      this._extractEffects(node)
      
      // Витягуємо компоненти
      this._extractComponents(node)
      
      // Рекурсивно обробляємо дочірні елементи
      if (node.children) {
        this._traverseNodes(node.children)
      }
    })
  }

  _extractColors(node) {
    // Фонові кольори
    if (node.backgroundColor) {
      const colorName = this._generateColorName(node.name, 'bg')
      this.designTokens.colors.set(colorName, this._rgbaToCSS(node.backgroundColor))
    }
    
    // Кольори заливки
    if (node.fills && node.fills.length > 0) {
      node.fills.forEach((fill, index) => {
        if (fill.type === 'SOLID') {
          const colorName = this._generateColorName(node.name, index === 0 ? 'primary' : `fill-${index}`)
          this.designTokens.colors.set(colorName, this._rgbaToCSS(fill.color, fill.opacity))
        }
      })
    }
    
    // Кольори обведення
    if (node.strokes && node.strokes.length > 0) {
      node.strokes.forEach((stroke, index) => {
        if (stroke.type === 'SOLID') {
          const colorName = this._generateColorName(node.name, `stroke-${index}`)
          this.designTokens.colors.set(colorName, this._rgbaToCSS(stroke.color, stroke.opacity))
        }
      })
    }
  }

  _extractTypography(node) {
    if (node.style) {
      const typeName = this._generateTypographyName(node.name)
      
      this.designTokens.typography.set(`${typeName}-family`, 
        node.style.fontFamily ? `"${node.style.fontFamily}", sans-serif` : 'inherit')
      
      if (node.style.fontSize) {
        this.designTokens.typography.set(`${typeName}-size`, `${node.style.fontSize}px`)
      }
      
      if (node.style.fontWeight) {
        this.designTokens.typography.set(`${typeName}-weight`, node.style.fontWeight)
      }
      
      if (node.style.lineHeightPx) {
        this.designTokens.typography.set(`${typeName}-line-height`, `${node.style.lineHeightPx}px`)
      }
      
      if (node.style.letterSpacing) {
        const spacing = typeof node.style.letterSpacing === 'string' && 
          /[a-z%]$/i.test(node.style.letterSpacing) ? 
          node.style.letterSpacing : `${node.style.letterSpacing}px`
        this.designTokens.typography.set(`${typeName}-letter-spacing`, spacing)
      }
    }
  }

  _extractSpacing(node) {
    // Padding
    if (node.paddingLeft || node.paddingRight || node.paddingTop || node.paddingBottom) {
      const spaceName = this._generateSpacingName(node.name, 'padding')
      const padding = [
        node.paddingTop || 0,
        node.paddingRight || 0,
        node.paddingBottom || 0,
        node.paddingLeft || 0
      ].map(p => `${p}px`).join(' ')
      
      this.designTokens.spacing.set(spaceName, padding)
    }
    
    // Gap для flex/grid
    if (node.itemSpacing) {
      const spaceName = this._generateSpacingName(node.name, 'gap')
      this.designTokens.spacing.set(spaceName, `${node.itemSpacing}px`)
    }
    
    // Розміри
    if (node.absoluteBoundingBox) {
      const sizeName = this._generateSpacingName(node.name, 'size')
      if (node.absoluteBoundingBox.width) {
        this.designTokens.spacing.set(`${sizeName}-width`, `${node.absoluteBoundingBox.width}px`)
      }
      if (node.absoluteBoundingBox.height) {
        this.designTokens.spacing.set(`${sizeName}-height`, `${node.absoluteBoundingBox.height}px`)
      }
    }
  }

  _extractEffects(node) {
    if (node.effects && node.effects.length > 0) {
      node.effects.forEach((effect, index) => {
        const effectName = this._generateEffectName(node.name, effect.type, index)
        
        if (effect.type === 'DROP_SHADOW') {
          const shadow = `${effect.offset.x}px ${effect.offset.y}px ${effect.radius}px ${this._rgbaToCSS(effect.color)}`
          this.designTokens.effects.set(effectName, shadow)
        }
        
        if (effect.type === 'INNER_SHADOW') {
          const shadow = `inset ${effect.offset.x}px ${effect.offset.y}px ${effect.radius}px ${this._rgbaToCSS(effect.color)}`
          this.designTokens.effects.set(effectName, shadow)
        }
      })
    }
    
    // Border radius
    if (node.cornerRadius) {
      const effectName = this._generateEffectName(node.name, 'border-radius')
      this.designTokens.effects.set(effectName, `${node.cornerRadius}px`)
    }
  }

  _extractComponents(node) {
    if (node.type === 'COMPONENT' || node.type === 'INSTANCE') {
      const componentName = this._normalizeClassName(node.name)
      const componentStyles = this._generateComponentStyles(node)
      
      this.designTokens.components.set(componentName, componentStyles)
    }
  }

  _generateComponentStyles(node) {
    const styles = {}
    
    // Layout
    if (node.layoutMode) {
      styles.display = 'flex'
      styles['flex-direction'] = node.layoutMode === 'HORIZONTAL' ? 'row' : 'column'
      
      if (node.itemSpacing) styles.gap = `${node.itemSpacing}px`
      
      // Justify content
      const justifyMap = {
        'MIN': 'flex-start',
        'CENTER': 'center', 
        'MAX': 'flex-end',
        'SPACE_BETWEEN': 'space-between'
      }
      if (node.primaryAxisAlignItems) {
        styles['justify-content'] = justifyMap[node.primaryAxisAlignItems] || 'flex-start'
      }
      
      // Align items
      const alignMap = {
        'MIN': 'flex-start',
        'CENTER': 'center',
        'MAX': 'flex-end'
      }
      if (node.counterAxisAlignItems) {
        styles['align-items'] = alignMap[node.counterAxisAlignItems] || 'flex-start'
      }
    }
    
    // Розміри
    if (node.absoluteBoundingBox) {
      const bbox = node.absoluteBoundingBox
      if (bbox.width) styles.width = `${bbox.width}px`
      if (bbox.height) styles.height = `${bbox.height}px`
    }
    
    // Кольори
    if (node.backgroundColor) {
      styles['background-color'] = this._rgbaToCSS(node.backgroundColor)
    }
    
    if (node.fills && node.fills[0] && node.fills[0].type === 'SOLID') {
      styles.color = this._rgbaToCSS(node.fills[0].color, node.fills[0].opacity)
    }
    
    // Padding
    if (node.paddingLeft || node.paddingRight || node.paddingTop || node.paddingBottom) {
      const padding = [
        node.paddingTop || 0,
        node.paddingRight || 0,
        node.paddingBottom || 0,
        node.paddingLeft || 0
      ].map(p => `${p}px`).join(' ')
      styles.padding = padding
    }
    
    // Border
    if (node.strokes && node.strokes.length > 0) {
      const stroke = node.strokes[0]
      if (stroke.type === 'SOLID') {
        styles.border = `${node.strokeWeight || 1}px solid ${this._rgbaToCSS(stroke.color, stroke.opacity)}`
      }
    }
    
    // Border radius
    if (node.cornerRadius) {
      styles['border-radius'] = `${node.cornerRadius}px`
    }
    
    // Typography
    if (node.style) {
      if (node.style.fontFamily) styles['font-family'] = `"${node.style.fontFamily}", sans-serif`
      if (node.style.fontSize) styles['font-size'] = `${node.style.fontSize}px`
      if (node.style.fontWeight) styles['font-weight'] = node.style.fontWeight
      if (node.style.lineHeightPx) styles['line-height'] = `${node.style.lineHeightPx}px`
      if (node.style.letterSpacing) styles['letter-spacing'] = `${node.style.letterSpacing}px`
      
      if (node.style.textAlignHorizontal) {
        const alignMap = { 'LEFT': 'left', 'CENTER': 'center', 'RIGHT': 'right', 'JUSTIFIED': 'justify' }
        styles['text-align'] = alignMap[node.style.textAlignHorizontal] || 'left'
      }
    }
    
    // Effects
    if (node.effects && node.effects.length > 0) {
      const shadows = node.effects
        .filter(effect => effect.type === 'DROP_SHADOW')
        .map(effect => `${effect.offset.x}px ${effect.offset.y}px ${effect.radius}px ${this._rgbaToCSS(effect.color)}`)
      
      if (shadows.length > 0) {
        styles['box-shadow'] = shadows.join(', ')
      }
    }
    
    return styles
  }

  // Генерація CSS з токенів для HTML класів
  generateUniversalCSS(htmlClasses, tokens) {
    const cssBlocks = []
    
    // CSS змінні з токенів
    cssBlocks.push(this._generateCSSVariables(tokens))
    
    // Зіставлення HTML класів з Figma токенами
    const classMatches = this.tokenMatcher.matchHTMLClassesToFigmaTokens(htmlClasses, tokens)
    
    // Генерація CSS для кожного класу
    Object.entries(classMatches).forEach(([className, styles]) => {
      if (Object.keys(styles).length > 0) {
        cssBlocks.push(this._generateClassCSS(className, styles))
      }
    })
    
    return cssBlocks.join('\n\n')
  }

  _generateCSSVariables(tokens) {
    let css = ':root {\n'
    
    Object.entries(tokens.colors).forEach(([name, value]) => {
      css += `  --${name}: ${value};\n`
    })
    
    Object.entries(tokens.typography).forEach(([name, value]) => {
      css += `  --${name}: ${value};\n`
    })
    
    Object.entries(tokens.spacing).forEach(([name, value]) => {
      css += `  --${name}: ${value};\n`
    })
    
    Object.entries(tokens.effects).forEach(([name, value]) => {
      css += `  --${name}: ${value};\n`
    })
    
    css += '}'
    return css
  }



  _generateClassCSS(className, styles) {
    let css = `.${className} {\n`
    
    Object.entries(styles).forEach(([property, value]) => {
      css += `  ${property}: ${value};\n`
    })
    
    css += '}'
    
    if (this._isInteractiveElement(className)) {
      css += this._generateHoverEffects(className, styles)
    }
    
    return css
  }

  _isInteractiveElement(className) {
    const interactivePatterns = ['btn', 'button', 'link', 'nav-link', 'social-link']
    return interactivePatterns.some(pattern => className.includes(pattern))
  }

  _generateHoverEffects(className, styles) {
    let hoverCSS = `\n\n.${className}:hover,\n.${className}:focus {\n`
    
    if (styles['background-color']) {
      hoverCSS += `  filter: brightness(0.9);\n`
    }
    
    hoverCSS += `  transition: all 250ms ease;\n`
    hoverCSS += '}'
    return hoverCSS
  }

  // Утилітні методи
  _generateColorName(nodeName, suffix) {
    const baseName = this._normalizeClassName(nodeName)
    return `${baseName}-${suffix}`.replace(/--+/g, '-')
  }

  _generateTypographyName(nodeName) {
    return this._normalizeClassName(nodeName) + '-font'
  }

  _generateSpacingName(nodeName, type) {
    const baseName = this._normalizeClassName(nodeName)
    return `${baseName}-${type}`.replace(/--+/g, '-')
  }

  _generateEffectName(nodeName, effectType, index = 0) {
    const baseName = this._normalizeClassName(nodeName)
    const type = effectType.toLowerCase().replace('_', '-')
    return index > 0 ? `${baseName}-${type}-${index}` : `${baseName}-${type}`
  }

  _normalizeClassName(name) {
    return name.toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  _rgbaToCSS(color, opacity = 1) {
    const r = Math.round(color.r * 255)
    const g = Math.round(color.g * 255)
    const b = Math.round(color.b * 255)
    const a = opacity ?? color.a ?? 1
    
    return a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`
  }
}

module.exports = UniversalFigmaGenerator