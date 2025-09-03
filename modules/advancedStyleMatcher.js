/* !!! Покращений модуль співставлення стилів з ML !!! */
// [Вставте код advancedStyleMatcher.js звідси]
/* !!! Покращений модуль співставлення стилів з ML !!! */
const HierarchyAnalyzer = require('./hierarchyAnalyzer')

class AdvancedStyleMatcher {
  constructor() {
    this.matchingStrategies = [
      new ContentBasedMatching(),
      new StructuralMatching(),
      new SemanticMatching(),
      new PositionalMatching(),
      new HierarchicalMatching()
    ]
    this.hierarchyAnalyzer = new HierarchyAnalyzer()
    this.confidenceThreshold = 0.8
    this.matchCache = new Map()
  }

  /* !!! Основний метод співставлення з ML !!! */
  async matchStyles(figmaData, htmlData) {
    const cacheKey = this.generateCacheKey(figmaData, htmlData)
    
    if (this.matchCache.has(cacheKey)) {
      return this.matchCache.get(cacheKey)
    }

    const matches = new Map()
    const unmatchedFigma = new Set(figmaData.hierarchy.keys())
    const unmatchedHTML = new Set(htmlData.hierarchy.keys())
    
    // Аналіз ієрархій
    const figmaAnalysis = this.hierarchyAnalyzer.analyzeHierarchy(figmaData, 'figma')
    const htmlAnalysis = this.hierarchyAnalyzer.analyzeHierarchy(htmlData, 'html')
    const hierarchyComparison = this.hierarchyAnalyzer.compareHierarchies(
      figmaAnalysis, 
      htmlAnalysis
    )

    // Застосування стратегій з вагами на основі аналізу
    const strategyWeights = this.calculateStrategyWeights(hierarchyComparison)
    
    for (const [index, strategy] of this.matchingStrategies.entries()) {
      const weight = strategyWeights[index] || 1
      const strategyMatches = await strategy.findMatches(figmaData, htmlData)
      
      strategyMatches.forEach((htmlElement, figmaElement) => {
        if (!matches.has(figmaElement)) {
          const confidence = this.calculateMatchConfidence(
            figmaData.hierarchy.get(figmaElement),
            htmlData.hierarchy.get(htmlElement),
            hierarchyComparison
          ) * weight

          if (confidence >= this.confidenceThreshold) {
            matches.set(figmaElement, {
              htmlElement,
              confidence,
              strategy: strategy.name,
              weight
            })
            unmatchedFigma.delete(figmaElement)
            unmatchedHTML.delete(htmlElement)
          }
        }
      })
    }

    // ML matching для нерозпізнаних елементів
    if (unmatchedFigma.size > 0) {
      const mlMatches = await this.performEnhancedMLMatching(
        Array.from(unmatchedFigma).map(id => figmaData.hierarchy.get(id)),
        Array.from(unmatchedHTML).map(id => htmlData.hierarchy.get(id)),
        hierarchyComparison
      )
      
      mlMatches.forEach((htmlElement, figmaElement) => {
        matches.set(figmaElement.id, {
          htmlElement: htmlElement.id,
          confidence: 0.75,
          strategy: 'ml-enhanced',
          weight: 1
        })
        unmatchedFigma.delete(figmaElement.id)
        unmatchedHTML.delete(htmlElement.id)
      })
    }

    const result = {
      matches,
      unmatchedFigma: Array.from(unmatchedFigma),
      unmatchedHTML: Array.from(unmatchedHTML),
      statistics: this.generateDetailedStatistics(
        matches, 
        figmaData, 
        htmlData,
        hierarchyComparison
      ),
      hierarchyAnalysis: {
        figma: figmaAnalysis,
        html: htmlAnalysis,
        comparison: hierarchyComparison
      }
    }

    this.matchCache.set(cacheKey, result)
    return result
  }

  /* !!! Розрахунок ваг стратегій на основі аналізу !!! */
  calculateStrategyWeights(hierarchyComparison) {
    const weights = [1, 1, 1, 1, 1] // Базові ваги
    
    // Збільшуємо вагу структурної стратегії при високій структурній схожості
    if (hierarchyComparison.structuralSimilarity > 0.8) {
      weights[1] *= 1.5 // StructuralMatching
      weights[4] *= 1.5 // HierarchicalMatching
    }
    
    // Збільшуємо вагу семантичної стратегії при високій семантичній схожості
    if (hierarchyComparison.semanticSimilarity > 0.7) {
      weights[2] *= 1.5 // SemanticMatching
    }
    
    // Збільшуємо вагу контентної стратегії при наявності тексту
    if (hierarchyComparison.commonPatterns.includes('text-heavy')) {
      weights[0] *= 1.5 // ContentBasedMatching
    }
    
    return weights
  }

  /* !!! Покращений ML matching з векторизацією !!! */
  async performEnhancedMLMatching(figmaElements, htmlElements, hierarchyComparison) {
    const matches = new Map()
    
    // Створюємо розширені feature vectors
    const figmaVectors = figmaElements.map(el => 
      this.createEnhancedFeatureVector(el, 'figma', hierarchyComparison)
    )
    const htmlVectors = htmlElements.map(el => 
      this.createEnhancedFeatureVector(el, 'html', hierarchyComparison)
    )
    
    // Використовуємо cosine similarity з порогом
    figmaVectors.forEach((figmaVector, figmaIndex) => {
      let bestMatch = -1
      let bestSimilarity = 0
      
      htmlVectors.forEach((htmlVector, htmlIndex) => {
        const similarity = this.cosineSimilarity(figmaVector, htmlVector)
        
        // Додаємо бонус за схожість імен
        const nameSimilarity = this.calculateNameSimilarity(
          figmaElements[figmaIndex],
          htmlElements[htmlIndex]
        )
        
        const totalSimilarity = similarity * 0.7 + nameSimilarity * 0.3
        
        if (totalSimilarity > bestSimilarity && totalSimilarity > 0.6) {
          bestSimilarity = totalSimilarity
          bestMatch = htmlIndex
        }
      })
      
      if (bestMatch >= 0) {
        matches.set(figmaElements[figmaIndex], htmlElements[bestMatch])
      }
    })
    
    return matches
  }

  /* !!! Створення розширеного feature vector !!! */
  createEnhancedFeatureVector(element, type, hierarchyComparison) {
    const vector = []
    
    // Базові текстові особливості
    const content = element.content || element.textContent || ''
    vector.push(content.length)
    vector.push(this.countWords(content))
    vector.push(this.hasNumbers(content) ? 1 : 0)
    vector.push(this.hasUpperCase(content) ? 1 : 0)
    
    // Структурні особливості
    vector.push(element.children ? element.children.length : 0)
    vector.push(this.calculateDepth(element))
    vector.push(element.level || 0)
    
    // Позиційні особливості
    vector.push(element.position || 0)
    vector.push(element.index || 0)
    
    // Семантичні особливості
    if (type === 'html') {
      vector.push(this.getTagWeight(element.tagName))
      vector.push(element.classes ? element.classes.length : 0)
      vector.push(element.attributes ? Object.keys(element.attributes).length : 0)
    } else {
      vector.push(this.getNodeTypeWeight(element.type))
      vector.push(element.styles ? Object.keys(element.styles).length : 0)
      vector.push(element.effects ? element.effects.length : 0)
    }
    
    // Контекстні особливості на основі ієрархічного аналізу
    vector.push(hierarchyComparison.structuralSimilarity)
    vector.push(hierarchyComparison.semanticSimilarity)
    
    return vector
  }

  /* !!! Допоміжні методи !!! */
  calculateNameSimilarity(figmaElement, htmlElement) {
    const figmaName = (figmaElement.name || '').toLowerCase()
    const htmlClasses = (htmlElement.classes || []).join(' ').toLowerCase()
    
    if (!figmaName || !htmlClasses) return 0
    
    const figmaWords = figmaName.split(/[\s\-_]+/)
    const htmlWords = htmlClasses.split(/[\s\-_]+/)
    
    const commonWords = figmaWords.filter(word => 
      htmlWords.some(hw => hw.includes(word) || word.includes(hw))
    )
    
    return commonWords.length / Math.max(figmaWords.length, htmlWords.length)
  }

  getTagWeight(tag) {
    const weights = {
      'h1': 10, 'h2': 9, 'h3': 8,
      'header': 7, 'main': 7, 'footer': 7,
      'section': 6, 'article': 6,
      'button': 5, 'a': 5,
      'div': 2, 'span': 1
    }
    return weights[tag] || 3
  }

  getNodeTypeWeight(type) {
    const weights = {
      'FRAME': 8, 'COMPONENT': 9, 'INSTANCE': 9,
      'TEXT': 5, 'RECTANGLE': 3, 'GROUP': 4
    }
    return weights[type] || 2
  }

  hasUpperCase(text) {
    return /[A-Z]/.test(text)
  }

  countWords(text) {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  hasNumbers(text) {
    return /\d/.test(text)
  }

  calculateDepth(element) {
    return element.path ? element.path.split('/').length : element.level || 0
  }

  cosineSimilarity(vectorA, vectorB) {
    const dotProduct = vectorA.reduce((sum, a, i) => sum + (a * vectorB[i]), 0)
    const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + (a * a), 0))
    const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + (b * b), 0))
    
    return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0
  }

  generateCacheKey(figmaData, htmlData) {
    const figmaKeys = Array.from(figmaData.hierarchy.keys()).sort().join('')
    const htmlKeys = Array.from(htmlData.hierarchy.keys()).sort().join('')
    return `${figmaKeys}-${htmlKeys}`.slice(0, 50)
  }

  /* !!! Генерація детальної статистики !!! */
  generateDetailedStatistics(matches, figmaData, htmlData, hierarchyComparison) {
    const totalFigma = figmaData.hierarchy.size
    const totalHTML = htmlData.hierarchy.size
    const matchedCount = matches.size
    
    // Розподіл за стратегіями
    const strategyDistribution = new Map()
    let totalConfidence = 0
    
    matches.forEach(match => {
      const count = strategyDistribution.get(match.strategy) || 0
      strategyDistribution.set(match.strategy, count + 1)
      totalConfidence += match.confidence
    })
    
    return {
      totalFigmaElements: totalFigma,
      totalHTMLElements: totalHTML,
      matchedElements: matchedCount,
      matchPercentage: totalFigma > 0 ? (matchedCount / totalFigma) * 100 : 0,
      averageConfidence: matchedCount > 0 ? totalConfidence / matchedCount : 0,
      strategyDistribution: Object.fromEntries(strategyDistribution),
      hierarchicalSimilarity: hierarchyComparison.confidence * 100,
      structuralSimilarity: hierarchyComparison.structuralSimilarity * 100,
      semanticSimilarity: hierarchyComparison.semanticSimilarity * 100
    }
  }
}

/* !!! Стратегії співставлення !!! */
class ContentBasedMatching {
  name = 'content-based'
  
  async findMatches(figmaData, htmlData) {
    const matches = new Map()
    
    figmaData.contentMap.forEach((figmaElement, content) => {
      if (htmlData.contentMap.has(content)) {
        const htmlElement = htmlData.contentMap.get(content)
        matches.set(figmaElement.id, htmlElement.id)
      }
    })
    
    return matches
  }
}

class StructuralMatching {
  name = 'structural'
  
  async findMatches(figmaData, htmlData) {
    const matches = new Map()
    
    figmaData.hierarchy.forEach((figmaElement, figmaId) => {
      htmlData.hierarchy.forEach((htmlElement, htmlId) => {
        if (this.structuresMatch(figmaElement, htmlElement)) {
          if (!matches.has(figmaId)) {
            matches.set(figmaId, htmlId)
          }
        }
      })
    })
    
    return matches
  }
  
  structuresMatch(figmaElement, htmlElement) {
    const figmaChildren = figmaElement.children?.length || 0
    const htmlChildren = htmlElement.children?.length || 0
    const figmaDepth = this.calculateDepth(figmaElement)
    const htmlDepth = htmlElement.level
    
    return figmaChildren === htmlChildren && 
           Math.abs(figmaDepth - htmlDepth) <= 1
  }
  
  calculateDepth(element) {
    return element.path ? element.path.split('/').length : 0
  }
}

class SemanticMatching {
  name = 'semantic'
  
  async findMatches(figmaData, htmlData) {
    const matches = new Map()
    
    figmaData.hierarchy.forEach((figmaElement, figmaId) => {
      const figmaRole = this.getFigmaRole(figmaElement)
      
      htmlData.hierarchy.forEach((htmlElement, htmlId) => {
        if (figmaRole === htmlElement.semanticRole && !matches.has(figmaId)) {
          matches.set(figmaId, htmlId)
        }
      })
    })
    
    return matches
  }
  
  getFigmaRole(figmaElement) {
    const name = (figmaElement.name || '').toLowerCase()
    const type = figmaElement.type
    
    if (type === 'TEXT' && name.includes('title')) return 'main-heading'
    if (name.includes('button') || name.includes('btn')) return 'interactive'
    if (name.includes('header')) return 'header'
    if (name.includes('card')) return 'content-card'
    if (name.includes('nav') || name.includes('menu')) return 'navigation'
    
    return 'generic'
  }
}

class PositionalMatching {
  name = 'positional'
  
  async findMatches(figmaData, htmlData) {
    const matches = new Map()
    
    // Групуємо елементи за рівнями
    const figmaLevels = new Map()
    const htmlLevels = new Map()
    
    figmaData.hierarchy.forEach((element, id) => {
      const level = this.getLevel(element)
      if (!figmaLevels.has(level)) {
        figmaLevels.set(level, [])
      }
      figmaLevels.get(level).push({ id, element })
    })
    
    htmlData.hierarchy.forEach((element, id) => {
      const level = element.level
      if (!htmlLevels.has(level)) {
        htmlLevels.set(level, [])
      }
      htmlLevels.get(level).push({ id, element })
    })
    
    // Співставляємо елементи на однакових рівнях
    figmaLevels.forEach((figmaElements, level) => {
      const htmlElements = htmlLevels.get(level)
      if (htmlElements) {
        figmaElements.forEach((figma, index) => {
          if (htmlElements[index] && !matches.has(figma.id)) {
            matches.set(figma.id, htmlElements[index].id)
          }
        })
      }
    })
    
    return matches
  }
  
  getLevel(element) {
    return element.path ? element.path.split('/').length : 0
  }
}

class HierarchicalMatching {
  name = 'hierarchical'
  
  async findMatches(figmaData, htmlData) {
    const matches = new Map()
    
    // Знаходимо кореневі елементи
    const figmaRoots = this.findRoots(figmaData.hierarchy)
    const htmlRoots = this.findRoots(htmlData.hierarchy)
    
    // Рекурсивне співставлення від коренів
    figmaRoots.forEach((figmaRoot, index) => {
      if (htmlRoots[index]) {
        this.matchRecursively(
          figmaRoot, 
          htmlRoots[index], 
          figmaData.hierarchy, 
          htmlData.hierarchy, 
          matches
        )
      }
    })
    
    return matches
  }
  
  findRoots(hierarchy) {
    const roots = []
    hierarchy.forEach((element, id) => {
      if (!element.parent) {
        roots.push({ id, element })
      }
    })
    return roots
  }
  
  matchRecursively(figmaNode, htmlNode, figmaHierarchy, htmlHierarchy, matches) {
    // Додаємо поточне співставлення
    matches.set(figmaNode.id, htmlNode.id)
    
    // Співставляємо дочірні елементи
    const figmaChildren = figmaNode.element.children || []
    const htmlChildren = htmlNode.element.children || []
    
    const minLength = Math.min(figmaChildren.length, htmlChildren.length)
    
    for (let i = 0; i < minLength; i++) {
      const figmaChild = figmaHierarchy.get(figmaChildren[i])
      const htmlChild = htmlHierarchy.get(htmlChildren[i])
      
      if (figmaChild && htmlChild) {
        this.matchRecursively(
          { id: figmaChildren[i], element: figmaChild },
          { id: htmlChildren[i], element: htmlChild },
          figmaHierarchy,
          htmlHierarchy,
          matches
        )
      }
    }
  }
}

module.exports = AdvancedStyleMatcher
