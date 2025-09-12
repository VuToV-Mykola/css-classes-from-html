/**
 * 🎨 Ієрархічний генератор CSS з Figma властивостей
 * 
 * Універсальна система для 100% переносу властивостей з Figma вузлів 
 * на HTML класи із збереженням ієрархічної структури без хардкодінгу.
 * 
 * @author Claude Code Assistant
 * @version 1.0.0
 */

class HierarchicalCSSGenerator {
  constructor(options = {}) {
    this.options = {
      // Налаштування генерації
      includeResetStyles: true,
      includeUtilities: true,
      includeResponsive: true,
      minifyOutput: false,
      
      // Префікси та суфікси
      classPrefix: '',
      classSuffix: '',
      
      // Налаштування переносу властивостей
      propertyTransfer: {
        transferAll: true,        // Переносити всі властивості
        transferLayout: true,     // Розмір, позиція, margin, padding
        transferTypography: true, // Шрифт, розмір, вага, колір тексту
        transferBackground: true, // Фон, кольори, градієнти
        transferBorders: true,    // Бордери, радіус
        transferEffects: true     // Тіні, прозорість, ефекти
      },
      
      // Налаштування логування
      debug: true,
      
      ...options
    }
    
    this.generatedCSS = new Map()
    this.processedMatches = new Set()
  }

  /**
   * 🚀 Основний метод генерації CSS
   */
  async generateCSS(matches, figmaData = null, htmlElements = []) {
    console.log("🎨 Початок генерації ієрархічного CSS...")
    console.log(`📊 Співставлень для обробки: ${matches.length}`)

    if (!matches.length) {
      console.warn("⚠️ Немає співставлень для генерації CSS")
      return this.generateFallbackCSS(htmlElements)
    }

    // Очищуємо попередні результати
    this.generatedCSS.clear()
    this.processedMatches.clear()

    // Етап 1: Сортуємо співставлення за ієрархією (батьки перед дітьми)
    const sortedMatches = this.sortMatchesByHierarchy(matches)
    
    // Етап 2: Генеруємо CSS для кожного співставлення
    for (const match of sortedMatches) {
      await this.generateCSSForMatch(match, figmaData)
    }

    // Етап 3: Генеруємо CSS для елементів без співставлень
    await this.generateFallbackCSSForUnmatchedElements(htmlElements, matches)

    // Етап 4: Формуємо підсумковий CSS
    const finalCSS = this.compileFinalCSS()
    
    console.log(`✅ CSS згенеровано: ${this.generatedCSS.size} класів`)
    return finalCSS
  }

  /**
   * 🔄 Сортування співставлень за ієрархією
   */
  sortMatchesByHierarchy(matches) {
    // Створюємо мапу батьківських зв'язків
    const parentChildMap = new Map()
    
    for (const match of matches) {
      const level = match.metadata?.level || 0
      if (!parentChildMap.has(level)) {
        parentChildMap.set(level, [])
      }
      parentChildMap.get(level).push(match)
    }
    
    // Сортуємо за рівнями (батьки перед дітьми)
    const sortedLevels = Array.from(parentChildMap.keys()).sort((a, b) => a - b)
    const sortedMatches = []
    
    for (const level of sortedLevels) {
      const levelMatches = parentChildMap.get(level)
      // В межах рівня сортуємо за впевненістю
      levelMatches.sort((a, b) => b.confidence - a.confidence)
      sortedMatches.push(...levelMatches)
    }
    
    console.log(`🔄 Співставлення відсортовані за ${sortedLevels.length} рівнями`)
    return sortedMatches
  }

  /**
   * 🎯 Генерація CSS для одного співставлення
   */
  async generateCSSForMatch(match, figmaData) {
    if (this.processedMatches.has(match)) {
      return
    }
    
    const { figma: figmaNode, html: htmlElement, confidence, type } = match
    
    console.log(`🎯 Обробка співставлення: ${figmaNode.name || figmaNode.type} ↔ ${this.getElementSelector(htmlElement)}`)
    
    // Генеруємо селектор CSS
    const cssSelector = this.generateCSSSelector(htmlElement, match)
    
    if (!cssSelector) {
      console.warn(`⚠️ Не вдалося згенерувати селектор для елемента`)
      return
    }
    
    // Генеруємо CSS властивості з Figma вузла
    const cssProperties = await this.extractCSSPropertiesFromFigma(figmaNode, htmlElement, match)
    
    if (cssProperties.length === 0) {
      console.log(`ℹ️ Немає властивостей для переносу з ${figmaNode.name || figmaNode.type}`)
      return
    }
    
    // Зберігаємо згенерований CSS
    this.generatedCSS.set(cssSelector, {
      properties: cssProperties,
      match: match,
      confidence: confidence,
      type: type,
      source: {
        figmaNodeId: figmaNode.id,
        figmaNodeName: figmaNode.name || figmaNode.type,
        htmlElement: this.getElementInfo(htmlElement)
      }
    })
    
    this.processedMatches.add(match)
    console.log(`✅ CSS згенеровано для ${cssSelector}: ${cssProperties.length} властивостей`)
  }

  /**
   * 🏷️ Генерація CSS селектора
   */
  generateCSSSelector(htmlElement, match) {
    const tagName = htmlElement.tagName?.toLowerCase() || 'div'
    const classes = this.getElementClasses(htmlElement)
    const id = htmlElement.id
    
    // Пріоритет: ID > Класи > Тег
    if (id) {
      return `#${id}`
    }
    
    if (classes.length > 0) {
      // Використовуємо перший клас
      const mainClass = classes[0]
      return `.${this.options.classPrefix}${mainClass}${this.options.classSuffix}`
    }
    
    // Якщо немає класів, генеруємо клас на основі Figma назви
    if (match.figma.name) {
      const generatedClass = this.normalizeClassName(match.figma.name)
      if (generatedClass) {
        // Додаємо клас до HTML елемента (якщо можливо)
        if (htmlElement.classList) {
          htmlElement.classList.add(generatedClass)
        }
        return `.${this.options.classPrefix}${generatedClass}${this.options.classSuffix}`
      }
    }
    
    // Останній варіант - використовуємо тег
    return tagName
  }

  /**
   * 🎨 Витягування CSS властивостей з Figma вузла
   */
  async extractCSSPropertiesFromFigma(figmaNode, htmlElement, match) {
    const properties = []
    
    try {
      // Базові властивості макета
      if (this.options.propertyTransfer.transferLayout) {
        properties.push(...this.extractLayoutProperties(figmaNode))
      }
      
      // Типографіка
      if (this.options.propertyTransfer.transferTypography) {
        properties.push(...this.extractTypographyProperties(figmaNode))
      }
      
      // Фон та кольори
      if (this.options.propertyTransfer.transferBackground) {
        properties.push(...this.extractBackgroundProperties(figmaNode))
      }
      
      // Бордери
      if (this.options.propertyTransfer.transferBorders) {
        properties.push(...this.extractBorderProperties(figmaNode))
      }
      
      // Ефекти
      if (this.options.propertyTransfer.transferEffects) {
        properties.push(...this.extractEffectProperties(figmaNode))
      }
      
    } catch (error) {
      console.error(`❌ Помилка при витягуванні властивостей з ${figmaNode.name}:`, error.message)
    }
    
    return properties.filter(Boolean)
  }

  /**
   * 📐 Витягування властивостей макета
   */
  extractLayoutProperties(figmaNode) {
    const properties = []
    
    try {
      const bounds = figmaNode.absoluteBoundingBox
      if (bounds) {
        // Розміри
        if (bounds.width && bounds.width > 0) {
          properties.push(`width: ${Math.round(bounds.width)}px`)
        }
        if (bounds.height && bounds.height > 0) {
          properties.push(`height: ${Math.round(bounds.height)}px`)
        }
      }
      
      // Відступи (якщо доступні)
      if (figmaNode.paddingLeft !== undefined) {
        const padding = [
          figmaNode.paddingTop || 0,
          figmaNode.paddingRight || 0,
          figmaNode.paddingBottom || 0,
          figmaNode.paddingLeft || 0
        ]
        
        if (padding.some(p => p > 0)) {
          if (padding.every(p => p === padding[0])) {
            properties.push(`padding: ${padding[0]}px`)
          } else {
            properties.push(`padding: ${padding.join('px ')}px`)
          }
        }
      }
      
      // Позиціонування
      if (figmaNode.constraints) {
        properties.push(...this.extractConstraintProperties(figmaNode.constraints))
      }
      
    } catch (error) {
      console.warn(`⚠️ Помилка при витягуванні layout властивостей:`, error.message)
    }
    
    return properties
  }

  /**
   * 📝 Витягування типографіки
   */
  extractTypographyProperties(figmaNode) {
    const properties = []
    
    try {
      if (figmaNode.type === 'TEXT' && figmaNode.style) {
        const style = figmaNode.style
        
        // Розмір шрифта
        if (style.fontSize) {
          properties.push(`font-size: ${style.fontSize}px`)
        }
        
        // Сім'я шрифтів
        if (style.fontFamily) {
          properties.push(`font-family: "${style.fontFamily}", sans-serif`)
        }
        
        // Вага шрифта
        if (style.fontWeight) {
          properties.push(`font-weight: ${style.fontWeight}`)
        }
        
        // Вирівнювання тексту
        if (style.textAlignHorizontal) {
          const align = style.textAlignHorizontal.toLowerCase()
          if (['left', 'center', 'right', 'justify'].includes(align)) {
            properties.push(`text-align: ${align}`)
          }
        }
        
        // Висота рядка
        if (style.lineHeightPx) {
          properties.push(`line-height: ${style.lineHeightPx}px`)
        } else if (style.lineHeightPercent) {
          properties.push(`line-height: ${style.lineHeightPercent / 100}`)
        }
        
        // Міжлітерний інтервал
        if (style.letterSpacing) {
          properties.push(`letter-spacing: ${style.letterSpacing}px`)
        }
        
        // Колір тексту
        if (style.fills && style.fills.length > 0) {
          const textColor = this.extractColorFromFill(style.fills[0])
          if (textColor) {
            properties.push(`color: ${textColor}`)
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️ Помилка при витягуванні typography властивостей:`, error.message)
    }
    
    return properties
  }

  /**
   * 🎨 Витягування фону та кольорів
   */
  extractBackgroundProperties(figmaNode) {
    const properties = []
    
    try {
      if (figmaNode.fills && figmaNode.fills.length > 0) {
        for (const fill of figmaNode.fills) {
          if (!fill.visible) continue
          
          if (fill.type === 'SOLID') {
            const color = this.extractColorFromFill(fill)
            if (color) {
              properties.push(`background-color: ${color}`)
            }
          } else if (fill.type === 'GRADIENT_LINEAR') {
            const gradient = this.extractLinearGradient(fill)
            if (gradient) {
              properties.push(`background: ${gradient}`)
            }
          } else if (fill.type === 'IMAGE') {
            // Обробка фонових зображень
            properties.push('background-size: cover')
            properties.push('background-position: center')
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️ Помилка при витягуванні background властивостей:`, error.message)
    }
    
    return properties
  }

  /**
   * 🔲 Витягування бордерів
   */
  extractBorderProperties(figmaNode) {
    const properties = []
    
    try {
      // Радіус кутів
      if (figmaNode.cornerRadius !== undefined) {
        if (typeof figmaNode.cornerRadius === 'number') {
          properties.push(`border-radius: ${figmaNode.cornerRadius}px`)
        } else if (Array.isArray(figmaNode.cornerRadius)) {
          const radii = figmaNode.cornerRadius.map(r => `${r}px`).join(' ')
          properties.push(`border-radius: ${radii}`)
        }
      }
      
      // Бордери
      if (figmaNode.strokes && figmaNode.strokes.length > 0) {
        const stroke = figmaNode.strokes[0]
        const strokeWeight = figmaNode.strokeWeight || 1
        const strokeColor = this.extractColorFromFill(stroke)
        
        if (strokeColor) {
          properties.push(`border: ${strokeWeight}px solid ${strokeColor}`)
        }
      }
      
    } catch (error) {
      console.warn(`⚠️ Помилка при витягуванні border властивостей:`, error.message)
    }
    
    return properties
  }

  /**
   * ✨ Витягування ефектів
   */
  extractEffectProperties(figmaNode) {
    const properties = []
    
    try {
      // Прозорість
      if (figmaNode.opacity !== undefined && figmaNode.opacity < 1) {
        properties.push(`opacity: ${figmaNode.opacity}`)
      }
      
      // Тіні
      if (figmaNode.effects && figmaNode.effects.length > 0) {
        const shadows = []
        
        for (const effect of figmaNode.effects) {
          if (!effect.visible) continue
          
          if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
            const shadow = this.extractShadowEffect(effect)
            if (shadow) {
              shadows.push(shadow)
            }
          }
        }
        
        if (shadows.length > 0) {
          properties.push(`box-shadow: ${shadows.join(', ')}`)
        }
      }
      
    } catch (error) {
      console.warn(`⚠️ Помилка при витягуванні effect властивостей:`, error.message)
    }
    
    return properties
  }

  // ===========================================
  // ДОПОМІЖНІ МЕТОДИ
  // ===========================================

  extractColorFromFill(fill) {
    if (!fill || !fill.color) return null
    
    const { r, g, b, a = 1 } = fill.color
    const red = Math.round(r * 255)
    const green = Math.round(g * 255)
    const blue = Math.round(b * 255)
    
    if (a < 1) {
      return `rgba(${red}, ${green}, ${blue}, ${a})`
    } else {
      return `rgb(${red}, ${green}, ${blue})`
    }
  }

  extractLinearGradient(gradientFill) {
    try {
      if (!gradientFill.gradientStops || gradientFill.gradientStops.length < 2) {
        return null
      }
      
      const stops = gradientFill.gradientStops
        .map(stop => {
          const color = this.extractColorFromFill({ color: stop.color })
          const position = Math.round(stop.position * 100)
          return `${color} ${position}%`
        })
        .join(', ')
      
      // Вираховуємо кут на основі градієнтних хендлів
      const angle = this.calculateGradientAngle(gradientFill.gradientHandlePositions)
      
      return `linear-gradient(${angle}deg, ${stops})`
    } catch (error) {
      console.warn(`⚠️ Помилка при обробці градієнта:`, error.message)
      return null
    }
  }

  extractShadowEffect(effect) {
    try {
      const { offset, radius, color, type } = effect
      const shadowColor = this.extractColorFromFill({ color })
      
      if (!shadowColor) return null
      
      const x = Math.round(offset?.x || 0)
      const y = Math.round(offset?.y || 0)
      const blur = Math.round(radius || 0)
      const inset = type === 'INNER_SHADOW' ? 'inset ' : ''
      
      return `${inset}${x}px ${y}px ${blur}px ${shadowColor}`
    } catch (error) {
      console.warn(`⚠️ Помилка при обробці тіні:`, error.message)
      return null
    }
  }

  calculateGradientAngle(handlePositions) {
    try {
      if (!handlePositions || handlePositions.length < 2) return 90
      
      const start = handlePositions[0]
      const end = handlePositions[1]
      
      const dx = end.x - start.x
      const dy = end.y - start.y
      
      let angle = Math.atan2(dy, dx) * 180 / Math.PI
      angle = (angle + 90) % 360
      
      return Math.round(angle)
    } catch (error) {
      return 90 // За замовчуванням
    }
  }

  extractConstraintProperties(constraints) {
    const properties = []
    // Логіка для constraints (автолейаут, позиціонування)
    return properties
  }

  getElementClasses(htmlElement) {
    if (!htmlElement.classes) return []
    return Array.isArray(htmlElement.classes) ? htmlElement.classes : []
  }

  getElementSelector(htmlElement) {
    const id = htmlElement.id
    const classes = this.getElementClasses(htmlElement)
    const tag = htmlElement.tagName?.toLowerCase() || 'element'
    
    if (id) return `#${id}`
    if (classes.length > 0) return `.${classes[0]}`
    return tag
  }

  getElementInfo(htmlElement) {
    return {
      tag: htmlElement.tagName?.toLowerCase() || 'unknown',
      id: htmlElement.id || null,
      classes: this.getElementClasses(htmlElement)
    }
  }

  normalizeClassName(name) {
    if (!name) return ''
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()
  }

  /**
   * 🔄 Генерація fallback CSS для елементів без співставлень
   */
  async generateFallbackCSSForUnmatchedElements(htmlElements, matches) {
    const matchedElementIds = new Set(matches.map(m => this.getElementId(m.html)))
    
    for (const element of htmlElements) {
      const elementId = this.getElementId(element)
      if (!matchedElementIds.has(elementId)) {
        const selector = this.generateCSSSelector(element, { figma: { name: null } })
        if (selector && !this.generatedCSS.has(selector)) {
          this.generatedCSS.set(selector, {
            properties: this.generateBasicStyles(element),
            match: null,
            confidence: 0,
            type: 'fallback',
            source: {
              figmaNodeId: null,
              figmaNodeName: 'fallback',
              htmlElement: this.getElementInfo(element)
            }
          })
        }
      }
    }
  }

  generateBasicStyles(element) {
    const properties = []
    const tag = element.tagName?.toLowerCase()
    
    // Базові стилі за типом елемента
    switch (tag) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        properties.push('font-weight: bold')
        properties.push('margin: 0.5em 0')
        break
      case 'p':
        properties.push('margin: 1em 0')
        break
      case 'button':
        properties.push('cursor: pointer')
        properties.push('border: none')
        properties.push('padding: 0.5em 1em')
        break
      case 'a':
        properties.push('text-decoration: none')
        properties.push('color: inherit')
        break
    }
    
    return properties
  }

  getElementId(element) {
    return element.id || element.dataset?.id || `${element.tagName}-${Date.now()}-${Math.random()}`
  }

  /**
   * 🔄 Генерація fallback CSS
   */
  generateFallbackCSS(htmlElements) {
    console.log("🔄 Генерація fallback CSS для всіх HTML елементів...")
    
    let css = `/* Українською: Автогенерований CSS без співставлень Figma / English: Auto-generated CSS without Figma matches */\n\n`
    
    for (const element of htmlElements) {
      const selector = this.generateCSSSelector(element, { figma: { name: null } })
      const properties = this.generateBasicStyles(element)
      
      if (selector && properties.length > 0) {
        css += `${selector} {\n`
        for (const property of properties) {
          css += `  ${property};\n`
        }
        css += `}\n\n`
      }
    }
    
    return css
  }

  /**
   * 📝 Компіляція підсумкового CSS
   */
  compileFinalCSS() {
    let css = `/* Українською: Ієрархічно згенерований CSS з Figma макету / English: Hierarchically generated CSS from Figma layout */\n\n`
    
    // Додаємо reset стилі якщо потрібно
    if (this.options.includeResetStyles) {
      css += this.generateResetStyles()
    }
    
    // Генеруємо основні стилі
    for (const [selector, data] of this.generatedCSS) {
      const { properties, confidence, type, source } = data
      
      if (properties.length === 0) continue
      
      // Додаємо коментар з інформацією про джерело
      if (this.options.debug) {
        css += `/* Confidence: ${Math.round(confidence * 100)}% | Type: ${type} | Source: ${source.figmaNodeName} */\n`
      }
      
      css += `${selector} {\n`
      
      for (const property of properties) {
        css += `  ${property};\n`
      }
      
      css += `}\n\n`
    }
    
    // Додаємо утилітарні класи якщо потрібно
    if (this.options.includeUtilities) {
      css += this.generateUtilityClasses()
    }
    
    // Мініфікація якщо потрібна
    if (this.options.minifyOutput) {
      css = this.minifyCSS(css)
    }
    
    return css
  }

  generateResetStyles() {
    return `/* Reset styles */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
}

img {
  max-width: 100%;
  height: auto;
}

`
  }

  generateUtilityClasses() {
    return `/* Utility classes */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }
.hidden { display: none; }
.visible { display: block; }

`
  }

  minifyCSS(css) {
    return css
      .replace(/\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//g, '') // Видаляємо коментарі
      .replace(/\s+/g, ' ') // Замінюємо множинні пробіли
      .replace(/;\s*}/g, '}') // Видаляємо останню крапку з комою
      .trim()
  }
}

module.exports = HierarchicalCSSGenerator