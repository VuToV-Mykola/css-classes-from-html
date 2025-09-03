// Модуль інспекції Figma макетів для автогенерації CSS стилів
const FigmaService = require("./figmaService")

class FigmaInspector {
  constructor(accessToken) {
    this.figmaService = new FigmaService(accessToken)
    this.nodeStyles = new Map()
    this.hierarchyMap = new Map()
  }

  async inspectFile(fileKey) {
    const fileData = await this.figmaService.getFile(fileKey)
    const styles = {}
    const hierarchy = []
    this._traverseNodes(fileData.document.children, styles, [], hierarchy)
    return this._generateHierarchicalCSS(styles, hierarchy)
  }

  _traverseNodes(nodes, styles, parentPath, hierarchy) {
    nodes.forEach((node, index) => {
      const currentPath = [...parentPath, node.name]
      const className = this._generateClassName(node, currentPath)
      const nodeInfo = {
        name: node.name,
        type: node.type,
        className,
        path: currentPath.join(' > '),
        level: currentPath.length - 1,
        index,
        children: []
      }
      
      if (className) {
        styles[className] = {
          ...this._extractNodeProperties(node, currentPath),
          _meta: {
            figmaName: node.name,
            figmaType: node.type,
            path: currentPath.join(' > '),
            level: currentPath.length - 1
          }
        }
      }

      hierarchy.push(nodeInfo)

      if (node.children) {
        this._traverseNodes(node.children, styles, currentPath, nodeInfo.children)
      }
    })
  }

  _generateClassName(node, path) {
    if (node.name.startsWith('.') || node.name.includes('class')) {
      return node.name.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase()
    }

    const componentTypes = {
      'FRAME': 'container',
      'GROUP': 'group',
      'TEXT': 'text',
      'RECTANGLE': 'box',
      'ELLIPSE': 'circle',
      'COMPONENT': 'component',
      'INSTANCE': 'instance'
    }

    const baseClass = componentTypes[node.type] || 'element'
    const pathSuffix = path.slice(-2).join('-').toLowerCase().replace(/[^a-zA-Z0-9-]/g, '-')
    
    return `${baseClass}-${pathSuffix}`.replace(/--+/g, '-').replace(/^-|-$/g, '')
  }

  _extractNodeProperties(node, path) {
    const properties = {}

    if (node.absoluteBoundingBox) {
      const {width, height} = node.absoluteBoundingBox
      if (width) properties.width = `${Math.round(width)}px`
      if (height) properties.height = `${Math.round(height)}px`
    }

    if (node.relativeTransform) {
      const transform = node.relativeTransform
      if (transform[0][2] !== 0) properties.left = `${Math.round(transform[0][2])}px`
      if (transform[1][2] !== 0) properties.top = `${Math.round(transform[1][2])}px`
    }

    if (node.fills && node.fills.length > 0) {
      const fill = node.fills[0]
      if (fill.type === 'SOLID') {
        properties['background-color'] = this._rgbaToCSS(fill.color, fill.opacity)
      }
    }

    if (node.strokes && node.strokes.length > 0) {
      const stroke = node.strokes[0]
      const strokeWeight = node.strokeWeight || 1
      properties.border = `${strokeWeight}px solid ${this._rgbaToCSS(stroke.color, stroke.opacity)}`
    }

    if (node.cornerRadius) {
      properties['border-radius'] = `${node.cornerRadius}px`
    }

    if (node.style) {
      const style = node.style
      if (style.fontFamily) properties['font-family'] = `"${style.fontFamily}", sans-serif`
      if (style.fontSize) properties['font-size'] = `${style.fontSize}px`
      if (style.fontWeight) properties['font-weight'] = style.fontWeight
      if (style.lineHeightPx) properties['line-height'] = `${style.lineHeightPx}px`
      if (style.letterSpacing) properties['letter-spacing'] = `${style.letterSpacing}px`
      if (style.textAlignHorizontal && style.textAlignHorizontal !== 'LEFT') {
        properties['text-align'] = style.textAlignHorizontal.toLowerCase()
      }
    }

    if (node.fills && node.type === 'TEXT') {
      const textFill = node.fills[0]
      if (textFill && textFill.type === 'SOLID') {
        properties.color = this._rgbaToCSS(textFill.color, textFill.opacity)
      }
    }

    if (node.constraints) {
      const {horizontal, vertical} = node.constraints
      if (horizontal === 'CENTER') properties['margin-left'] = 'auto', properties['margin-right'] = 'auto'
      if (vertical === 'CENTER') properties['margin-top'] = 'auto', properties['margin-bottom'] = 'auto'
    }

    if (node.layoutMode) {
      properties.display = 'flex'
      properties['flex-direction'] = node.layoutMode === 'HORIZONTAL' ? 'row' : 'column'
      
      if (node.itemSpacing) properties.gap = `${node.itemSpacing}px`
      if (node.paddingLeft) properties['padding-left'] = `${node.paddingLeft}px`
      if (node.paddingRight) properties['padding-right'] = `${node.paddingRight}px`
      if (node.paddingTop) properties['padding-top'] = `${node.paddingTop}px`
      if (node.paddingBottom) properties['padding-bottom'] = `${node.paddingBottom}px`

      const justifyMap = {
        'MIN': 'flex-start',
        'CENTER': 'center',
        'MAX': 'flex-end',
        'SPACE_BETWEEN': 'space-between'
      }
      if (node.primaryAxisAlignItems && justifyMap[node.primaryAxisAlignItems]) {
        properties['justify-content'] = justifyMap[node.primaryAxisAlignItems]
      }

      const alignMap = {
        'MIN': 'flex-start',
        'CENTER': 'center',
        'MAX': 'flex-end'
      }
      if (node.counterAxisAlignItems && alignMap[node.counterAxisAlignItems]) {
        properties['align-items'] = alignMap[node.counterAxisAlignItems]
      }
    }

    if (node.effects && node.effects.length > 0) {
      const shadows = node.effects.filter(effect => effect.type === 'DROP_SHADOW')
      if (shadows.length > 0) {
        const shadow = shadows[0]
        const {x, y} = shadow.offset
        const blur = shadow.radius
        const color = this._rgbaToCSS(shadow.color, shadow.color.a)
        properties['box-shadow'] = `${x}px ${y}px ${blur}px ${color}`
      }
    }

    if (node.opacity && node.opacity < 1) {
      properties.opacity = node.opacity.toFixed(2)
    }

    return properties
  }

  _rgbaToCSS(color, opacity = 1) {
    const r = Math.round(color.r * 255)
    const g = Math.round(color.g * 255)
    const b = Math.round(color.b * 255)
    const a = opacity !== undefined ? opacity : (color.a || 1)
    
    return a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${parseFloat(a.toFixed(2))})`
  }

  _generateHierarchicalCSS(styles, hierarchy) {
    let css = '/* Повний аналіз стилів Figma макету */\n'
    css += '/* Ієрархічна структура від предка до нащадка */\n\n'
    
    css = this._generateHierarchicalNodes(hierarchy, styles, css, 0)
    
    return css
  }

  _generateHierarchicalNodes(nodes, styles, css, level) {
    nodes.forEach(node => {
      const indent = '  '.repeat(level)
      css += `${indent}/* ${node.path} (${node.type}) */\n`
      
      if (node.className && styles[node.className]) {
        const properties = styles[node.className]
        const { _meta, ...cssProps } = properties
        
        if (Object.keys(cssProps).length > 0) {
          css += `${indent}.${node.className} {\n`
          Object.entries(cssProps).forEach(([prop, value]) => {
            css += `${indent}  ${prop}: ${value};\n`
          })
          css += `${indent}}\n\n`
        }
      }
      
      if (node.children.length > 0) {
        css = this._generateHierarchicalNodes(node.children, styles, css, level + 1)
      }
    })
    
    return css
  }

  matchHTMLClasses(htmlClasses, figmaStyles) {
    const matches = {}
    
    htmlClasses.forEach(htmlClass => {
      const bestMatch = this._findBestMatch(htmlClass, Object.keys(figmaStyles))
      if (bestMatch) {
        matches[htmlClass] = figmaStyles[bestMatch]
      }
    })

    return matches
  }

  _findBestMatch(htmlClass, figmaClasses) {
    if (figmaClasses.includes(htmlClass)) return htmlClass

    const htmlWords = htmlClass.split(/[-_]/)
    let bestScore = 0
    let bestMatch = null

    for (const figmaClass of figmaClasses) {
      const figmaWords = figmaClass.split(/[-_]/)
      const score = this._calculateSimilarity(htmlWords, figmaWords)
      
      if (score === 1.0) {
        return figmaClass
      }
      
      if (score > bestScore && score > 0.3) {
        bestScore = score
        bestMatch = figmaClass
      }
    }

    return bestMatch
  }

  _calculateSimilarity(words1, words2) {
    const commonWords = words1.filter(word => words2.includes(word))
    const maxLength = Math.max(words1.length, words2.length)
    return maxLength > 0 ? commonWords.length / maxLength : 0
  }
}

module.exports = FigmaInspector