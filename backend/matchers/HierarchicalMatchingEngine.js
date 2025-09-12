/**
 * 🎯 Ієрархічний механізм співставлення Figma макету з HTML елементами
 * 
 * Універсальна система без хардкодінгу для точного переносу властивостей
 * з Figma вузлів на HTML класи із збереженням ієрархічної структури.
 * 
 * @author Claude Code Assistant
 * @version 1.0.0
 */

class HierarchicalMatchingEngine {
  constructor(options = {}) {
    this.options = {
      // Пороги довіри для різних типів співставлень
      confidence: {
        exact: 1.0,        // 100% - точне співпадіння
        hierarchical: 0.9, // 90% - ієрархічне співпадіння
        textual: 0.85,     // 85% - текстове співпадіння  
        structural: 0.8,   // 80% - структурне співпадіння
        semantic: 0.7,     // 70% - семантичне співпадіння
        minimal: 0.6       // 60% - мінімальне співпадіння
      },
      
      // Налаштування стратегій
      strategies: {
        enableHierarchicalMatching: true,
        enableTextMatching: true,
        enableClassNameMatching: true,
        enableStructuralMatching: true,
        enableSemanticMatching: true
      },

      // Налаштування логування
      debug: true,
      
      ...options
    }
  }

  /**
   * 🚀 Основний метод співставлення
   */
  async match(figmaNodes, htmlElements, figmaData = null) {
    console.log("🎯 Початок ієрархічного співставлення...")
    console.log(`📊 Figma вузлів: ${figmaNodes ? figmaNodes.length : 0}`)
    console.log(`📊 HTML елементів: ${htmlElements ? htmlElements.length : 0}`)
    
    // Зберігаємо посилання на всі елементи для роботи з дочірніми
    this.allHtmlElements = htmlElements || []
    this.allFigmaNodes = figmaNodes || []

    // ДІАГНОСТИКА: Детальний аналіз вхідних даних
    console.log("🔍 ДІАГНОСТИКА figmaNodes:")
    if (figmaNodes && figmaNodes.length > 0) {
      for (let i = 0; i < Math.min(5, figmaNodes.length); i++) {
        const node = figmaNodes[i]
        console.log(`  [${i}] ID: ${node.id}, Type: ${node.type}, Name: "${node.name}", Children: ${node.children?.length || 0}`)
      }
    } else {
      console.log("  ❌ figmaNodes порожній або не визначений")
    }

    console.log("🔍 ДІАГНОСТИКА htmlElements:")
    if (htmlElements && htmlElements.length > 0) {
      for (let i = 0; i < Math.min(5, htmlElements.length); i++) {
        const element = htmlElements[i]
        console.log(`  [${i}] Tag: ${element.tagName}, Classes: [${element.classes?.join(', ') || ''}], Text: "${element.textContent?.substring(0, 50) || ''}"`)
      }
    } else {
      console.log("  ❌ htmlElements порожній або не визначений")
    }

    if (!figmaNodes || !figmaNodes.length || !htmlElements || !htmlElements.length) {
      console.warn("⚠️ Порожній набір вузлів або елементів")
      return []
    }

    // Етап 1: Знаходимо кореневий вузол Figma (Canvas/Frame)
    const rootFigmaNode = this.findRootFigmaNode(figmaNodes)
    const rootHtmlElement = this.findRootHtmlElement(htmlElements)
    
    console.log(`🌳 Кореневий Figma вузол: ${rootFigmaNode?.name || 'не знайдено'}`)
    console.log(`🌳 Кореневий HTML елемент: ${rootHtmlElement?.tagName || 'не знайдено'}`)

    // Етап 2: Ієрархічне співставлення від кореня
    const matches = []
    
    if (rootFigmaNode && rootHtmlElement) {
      // Основне ієрархічне співставлення
      const hierarchicalMatches = await this.performHierarchicalMatching(
        rootFigmaNode, 
        rootHtmlElement, 
        figmaNodes, 
        htmlElements
      )
      matches.push(...hierarchicalMatches)
    }

    // Етап 3: Текстове співставлення для елементів без пар
    const textMatches = await this.performTextMatching(figmaNodes, htmlElements, matches)
    matches.push(...textMatches)

    // Етап 4: Співставлення за назвами класів
    const classMatches = await this.performClassNameMatching(figmaNodes, htmlElements, matches)
    matches.push(...classMatches)

    // Етап 5: Структурне співставлення
    const structuralMatches = await this.performStructuralMatching(figmaNodes, htmlElements, matches)
    matches.push(...structuralMatches)

    console.log(`✅ Загальна кількість співставлень: ${matches.length}`)
    return this.deduplicateMatches(matches)
  }

  /**
   * 🌳 Знаходження кореневого Figma вузла
   */
  findRootFigmaNode(figmaNodes) {
    // Шукаємо Canvas або головний Frame
    let rootNode = figmaNodes.find(node => 
      node.type === 'CANVAS' || 
      (node.type === 'FRAME' && !node.parentId)
    )
    
    // Якщо не знайшли Canvas, шукаємо Frame з найбільшою кількістю дочірніх елементів
    if (!rootNode) {
      rootNode = figmaNodes
        .filter(node => node.type === 'FRAME')
        .sort((a, b) => (b.children?.length || 0) - (a.children?.length || 0))[0]
    }
    
    return rootNode
  }

  /**
   * 🏠 Знаходження кореневого HTML елемента
   */
  findRootHtmlElement(htmlElements) {
    // Пріоритет: body > main > div з найбільшою кількістю дочірніх елементів
    let rootElement = htmlElements.find(el => 
      el.tagName?.toLowerCase() === 'body'
    )
    
    if (!rootElement) {
      rootElement = htmlElements.find(el => 
        el.tagName?.toLowerCase() === 'main'
      )
    }
    
    if (!rootElement) {
      // Знаходимо елемент з найбільшою кількістю дочірніх елементів
      rootElement = htmlElements
        .filter(el => el.children && el.children.length > 0)
        .sort((a, b) => b.children.length - a.children.length)[0]
    }
    
    return rootElement || htmlElements[0]
  }

  /**
   * 🎯 Ієрархічне співставлення
   */
  async performHierarchicalMatching(rootFigmaNode, rootHtmlElement, figmaNodes, htmlElements) {
    const matches = []
    const usedFigmaNodes = new Set()
    const usedHtmlElements = new Set()
    
    console.log("🌳 Початок ієрархічного співставлення...")
    
    // Створюємо кореневе співставлення
    const rootMatch = {
      figma: rootFigmaNode,
      html: rootHtmlElement,
      confidence: this.options.confidence.hierarchical,
      type: 'hierarchical-root',
      algorithm: 'hierarchical-root-matching',
      metadata: {
        figmaType: rootFigmaNode.type,
        htmlTag: rootHtmlElement.tagName?.toLowerCase() || 'unknown',
        level: 0
      }
    }
    
    matches.push(rootMatch)
    usedFigmaNodes.add(rootFigmaNode.id)
    usedHtmlElements.add(this.getElementId(rootHtmlElement))
    
    console.log(`✅ Кореневе співставлення: ${rootFigmaNode.name} ↔ ${rootHtmlElement.tagName}`)
    
    // Рекурсивно співставляємо дочірні елементи
    await this.matchChildren(
      rootFigmaNode, 
      rootHtmlElement, 
      figmaNodes, 
      htmlElements, 
      matches, 
      usedFigmaNodes, 
      usedHtmlElements,
      1
    )
    
    return matches
  }

  /**
   * 👶 Співставлення дочірніх елементів
   */
  async matchChildren(figmaParent, htmlParent, figmaNodes, htmlElements, matches, usedFigmaNodes, usedHtmlElements, level) {
    const figmaChildren = this.getFigmaChildren(figmaParent, figmaNodes)
    const htmlChildren = this.getHtmlChildren(htmlParent)
    
    if (!figmaChildren.length || !htmlChildren.length) {
      return
    }
    
    console.log(`📊 Рівень ${level}: Figma дітей ${figmaChildren.length}, HTML дітей ${htmlChildren.length}`)
    
    // Стратегія 1: Співставлення по позиції (якщо кількість однакова)
    if (figmaChildren.length === htmlChildren.length) {
      console.log("🎯 Позиційне співставлення (однакова кількість дітей)")
      
      for (let i = 0; i < figmaChildren.length; i++) {
        const figmaChild = figmaChildren[i]
        const htmlChild = htmlChildren[i]
        
        if (usedFigmaNodes.has(figmaChild.id) || usedHtmlElements.has(this.getElementId(htmlChild))) {
          continue
        }
        
        const match = {
          figma: figmaChild,
          html: htmlChild,
          confidence: this.options.confidence.hierarchical,
          type: 'hierarchical-positional',
          algorithm: 'positional-matching',
          metadata: {
            figmaType: figmaChild.type,
            htmlTag: htmlChild.tagName?.toLowerCase() || 'unknown',
            level: level,
            position: i
          }
        }
        
        matches.push(match)
        usedFigmaNodes.add(figmaChild.id)
        usedHtmlElements.add(this.getElementId(htmlChild))
        
        console.log(`  ↳ ${figmaChild.name || figmaChild.type} ↔ ${htmlChild.tagName}[${i}]`)
        
        // Рекурсивно співставляємо їх дітей
        await this.matchChildren(
          figmaChild, 
          htmlChild, 
          figmaNodes, 
          htmlElements, 
          matches, 
          usedFigmaNodes, 
          usedHtmlElements,
          level + 1
        )
      }
    } else {
      // Стратегія 2: Розумне співставлення за типом та контентом
      console.log("🧠 Розумне співставлення (різна кількість дітей)")
      
      const unmatchedFigmaChildren = figmaChildren.filter(child => !usedFigmaNodes.has(child.id))
      const unmatchedHtmlChildren = htmlChildren.filter(child => !usedHtmlElements.has(this.getElementId(child)))
      
      for (const figmaChild of unmatchedFigmaChildren) {
        const bestHtmlMatch = this.findBestChildMatch(figmaChild, unmatchedHtmlChildren)
        
        if (bestHtmlMatch.element && bestHtmlMatch.confidence >= this.options.confidence.minimal) {
          const match = {
            figma: figmaChild,
            html: bestHtmlMatch.element,
            confidence: bestHtmlMatch.confidence,
            type: 'hierarchical-smart',
            algorithm: 'smart-child-matching',
            metadata: {
              figmaType: figmaChild.type,
              htmlTag: bestHtmlMatch.element.tagName?.toLowerCase() || 'unknown',
              level: level,
              matchReason: bestHtmlMatch.reason
            }
          }
          
          matches.push(match)
          usedFigmaNodes.add(figmaChild.id)
          usedHtmlElements.add(this.getElementId(bestHtmlMatch.element))
          
          console.log(`  ↳ ${figmaChild.name || figmaChild.type} ↔ ${bestHtmlMatch.element.tagName} (${bestHtmlMatch.reason})`)
          
          // Рекурсивно співставляємо їх дітей
          await this.matchChildren(
            figmaChild, 
            bestHtmlMatch.element, 
            figmaNodes, 
            htmlElements, 
            matches, 
            usedFigmaNodes, 
            usedHtmlElements,
            level + 1
          )
        }
      }
    }
  }

  /**
   * 🔍 Знаходження найкращого співставлення для дочірнього елемента
   */
  findBestChildMatch(figmaChild, htmlChildren) {
    let bestMatch = { element: null, confidence: 0, reason: '' }
    
    for (const htmlChild of htmlChildren) {
      let confidence = 0
      let reason = ''
      
      // Перевірка на текстове співпадіння
      if (figmaChild.type === 'TEXT' && figmaChild.characters) {
        const htmlText = this.getElementText(htmlChild)
        if (htmlText && this.isTextMatch(figmaChild.characters, htmlText)) {
          confidence = this.options.confidence.textual
          reason = 'text-match'
        }
      }
      
      // Перевірка на семантичне співпадіння
      if (confidence === 0) {
        const semanticScore = this.calculateSemanticMatch(figmaChild, htmlChild)
        if (semanticScore > confidence) {
          confidence = semanticScore
          reason = 'semantic-match'
        }
      }
      
      // Перевірка на структурне співпадіння
      if (confidence === 0) {
        const structuralScore = this.calculateStructuralMatch(figmaChild, htmlChild)
        if (structuralScore > confidence) {
          confidence = structuralScore
          reason = 'structural-match'
        }
      }
      
      if (confidence > bestMatch.confidence) {
        bestMatch = { element: htmlChild, confidence, reason }
      }
    }
    
    return bestMatch
  }

  /**
   * 📝 Текстове співставлення
   */
  async performTextMatching(figmaNodes, htmlElements, existingMatches) {
    const matches = []
    const usedFigmaIds = new Set(existingMatches.map(m => m.figma.id))
    const usedHtmlIds = new Set(existingMatches.map(m => this.getElementId(m.html)))
    
    console.log("📝 Початок текстового співставлення...")
    
    const textFigmaNodes = figmaNodes.filter(node => 
      node.type === 'TEXT' && 
      node.characters && 
      !usedFigmaIds.has(node.id)
    )
    
    for (const figmaNode of textFigmaNodes) {
      const figmaText = this.normalizeText(figmaNode.characters)
      
      for (const htmlElement of htmlElements) {
        if (usedHtmlIds.has(this.getElementId(htmlElement))) continue
        
        const htmlText = this.normalizeText(this.getElementText(htmlElement))
        
        if (htmlText && this.isTextMatch(figmaText, htmlText)) {
          const match = {
            figma: figmaNode,
            html: htmlElement,
            confidence: this.options.confidence.textual,
            type: 'textual',
            algorithm: 'text-exact-matching',
            metadata: {
              figmaText: figmaText.substring(0, 50),
              htmlText: htmlText.substring(0, 50),
              textLength: Math.min(figmaText.length, htmlText.length)
            }
          }
          
          matches.push(match)
          usedFigmaIds.add(figmaNode.id)
          usedHtmlIds.add(this.getElementId(htmlElement))
          
          console.log(`  ✅ Текстове співпадіння: "${figmaText.substring(0, 30)}..." ↔ ${htmlElement.tagName}`)
          break
        }
      }
    }
    
    console.log(`📝 Текстових співпадінь знайдено: ${matches.length}`)
    return matches
  }

  /**
   * 🏷️ Співставлення за назвами класів
   */
  async performClassNameMatching(figmaNodes, htmlElements, existingMatches) {
    const matches = []
    const usedFigmaIds = new Set(existingMatches.map(m => m.figma.id))
    const usedHtmlIds = new Set(existingMatches.map(m => this.getElementId(m.html)))
    
    console.log("🏷️ Початок співставлення за назвами класів...")
    
    for (const figmaNode of figmaNodes) {
      if (usedFigmaIds.has(figmaNode.id)) continue
      
      const figmaName = this.normalizeClassName(figmaNode.name)
      if (!figmaName) continue
      
      for (const htmlElement of htmlElements) {
        if (usedHtmlIds.has(this.getElementId(htmlElement))) continue
        
        const htmlClasses = this.getElementClasses(htmlElement)
        
        for (const htmlClass of htmlClasses) {
          const normalizedHtmlClass = this.normalizeClassName(htmlClass)
          
          if (this.isClassNameMatch(figmaName, normalizedHtmlClass)) {
            const match = {
              figma: figmaNode,
              html: htmlElement,
              confidence: this.options.confidence.exact,
              type: 'class-name',
              algorithm: 'class-name-matching',
              metadata: {
                figmaName: figmaNode.name,
                htmlClass: htmlClass,
                matchType: 'exact-class-match'
              }
            }
            
            matches.push(match)
            usedFigmaIds.add(figmaNode.id)
            usedHtmlIds.add(this.getElementId(htmlElement))
            
            console.log(`  🎯 Клас співпадіння: "${figmaNode.name}" ↔ ".${htmlClass}"`)
            break
          }
        }
        
        if (usedFigmaIds.has(figmaNode.id)) break
      }
    }
    
    console.log(`🏷️ Співпадінь за класами знайдено: ${matches.length}`)
    return matches
  }

  /**
   * 🏗️ Структурне співставлення
   */
  async performStructuralMatching(figmaNodes, htmlElements, existingMatches) {
    const matches = []
    const usedFigmaIds = new Set(existingMatches.map(m => m.figma.id))
    const usedHtmlIds = new Set(existingMatches.map(m => this.getElementId(m.html)))
    
    console.log("🏗️ Початок структурного співставлення...")
    
    const unmatchedFigmaNodes = figmaNodes.filter(node => !usedFigmaIds.has(node.id))
    const unmatchedHtmlElements = htmlElements.filter(el => !usedHtmlIds.has(this.getElementId(el)))
    
    for (const figmaNode of unmatchedFigmaNodes) {
      let bestMatch = { element: null, confidence: 0 }
      
      for (const htmlElement of unmatchedHtmlElements) {
        if (usedHtmlIds.has(this.getElementId(htmlElement))) continue
        
        const structuralScore = this.calculateStructuralMatch(figmaNode, htmlElement)
        
        if (structuralScore >= this.options.confidence.minimal && structuralScore > bestMatch.confidence) {
          bestMatch = { element: htmlElement, confidence: structuralScore }
        }
      }
      
      if (bestMatch.element) {
        const match = {
          figma: figmaNode,
          html: bestMatch.element,
          confidence: bestMatch.confidence,
          type: 'structural',
          algorithm: 'structural-matching',
          metadata: {
            figmaType: figmaNode.type,
            htmlTag: bestMatch.element.tagName?.toLowerCase() || 'unknown',
            structuralScore: bestMatch.confidence
          }
        }
        
        matches.push(match)
        usedFigmaIds.add(figmaNode.id)
        usedHtmlIds.add(this.getElementId(bestMatch.element))
        
        console.log(`  🏗️ Структурне співпадіння: ${figmaNode.name || figmaNode.type} ↔ ${bestMatch.element.tagName}`)
      }
    }
    
    console.log(`🏗️ Структурних співпадінь знайдено: ${matches.length}`)
    return matches
  }

  // ===========================================
  // ДОПОМІЖНІ МЕТОДИ
  // ===========================================

  getFigmaChildren(figmaNode, allFigmaNodes) {
    if (!figmaNode.children) return []
    
    return figmaNode.children
      .map(childId => allFigmaNodes.find(node => node.id === childId))
      .filter(Boolean)
  }

  getHtmlChildren(htmlElement) {
    // Для нашого HTMLParser структури, children це масив ID
    if (!htmlElement.children || !Array.isArray(htmlElement.children)) return []
    
    // Знаходимо реальні елементи за ID в масиві всіх елементів
    return htmlElement.children
      .map(childId => this.allHtmlElements?.find(el => el.id === childId))
      .filter(Boolean)
  }

  getElementId(htmlElement) {
    return htmlElement.id || htmlElement.dataset?.id || `${htmlElement.tagName}-${Date.now()}-${Math.random()}`
  }

  getElementText(htmlElement) {
    return htmlElement.textContent?.trim() || ''
  }

  getElementClasses(htmlElement) {
    if (!htmlElement.classes) return []
    return Array.isArray(htmlElement.classes) ? htmlElement.classes : []
  }

  normalizeText(text) {
    return text?.toLowerCase().replace(/\s+/g, ' ').trim() || ''
  }

  normalizeClassName(name) {
    if (!name) return ''
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()
  }

  isTextMatch(text1, text2) {
    const normalized1 = this.normalizeText(text1)
    const normalized2 = this.normalizeText(text2)
    
    return normalized1 === normalized2 || 
           normalized1.includes(normalized2) || 
           normalized2.includes(normalized1)
  }

  isClassNameMatch(figmaName, htmlClass) {
    return figmaName === htmlClass ||
           figmaName.includes(htmlClass) ||
           htmlClass.includes(figmaName)
  }

  calculateSemanticMatch(figmaNode, htmlElement) {
    const figmaType = figmaNode.type?.toLowerCase() || ''
    const htmlTag = htmlElement.tagName?.toLowerCase() || ''
    
    // Семантичне співставлення типів
    const typeMapping = {
      'text': ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'label'],
      'frame': ['div', 'section', 'article', 'main', 'header', 'footer', 'nav'],
      'instance': ['button', 'input', 'select', 'textarea'],
      'group': ['div', 'section'],
      'vector': ['img', 'svg', 'canvas'],
      'rectangle': ['div', 'section', 'article']
    }
    
    const compatibleTags = typeMapping[figmaType] || []
    return compatibleTags.includes(htmlTag) ? this.options.confidence.semantic : 0
  }

  calculateStructuralMatch(figmaNode, htmlElement) {
    let score = 0
    
    // Співпадіння кількості дочірніх елементів
    const figmaChildrenCount = figmaNode.children?.length || 0
    const htmlChildrenCount = htmlElement.children?.length || 0
    
    if (figmaChildrenCount > 0 && htmlChildrenCount > 0) {
      const childrenRatio = Math.min(figmaChildrenCount, htmlChildrenCount) / 
                           Math.max(figmaChildrenCount, htmlChildrenCount)
      score += childrenRatio * 0.4
    }
    
    // Позиційне співпадіння (якщо є батьківські елементи)
    if (figmaNode.parentId && htmlElement.parentElement) {
      score += 0.3
    }
    
    // Базовий структурний бонус
    score += 0.3
    
    return Math.min(score, 1.0)
  }

  /**
   * 🔄 Видалення дублікатів співставлень
   */
  deduplicateMatches(matches) {
    const uniqueMatches = []
    const usedFigmaIds = new Set()
    const usedHtmlIds = new Set()
    
    // Сортуємо за впевненістю (найвищі спочатку)
    matches.sort((a, b) => b.confidence - a.confidence)
    
    for (const match of matches) {
      const figmaId = match.figma.id
      const htmlId = this.getElementId(match.html)
      
      if (!usedFigmaIds.has(figmaId) && !usedHtmlIds.has(htmlId)) {
        uniqueMatches.push(match)
        usedFigmaIds.add(figmaId)
        usedHtmlIds.add(htmlId)
      }
    }
    
    console.log(`🔄 Після дедуплікації: ${uniqueMatches.length} унікальних співставлень`)
    return uniqueMatches
  }
}

module.exports = HierarchicalMatchingEngine