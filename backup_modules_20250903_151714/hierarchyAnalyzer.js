/* !!! Модуль аналізу ієрархічних структур Figma та HTML !!! */
// [Вставте код hierarchyAnalyzer.js звідси]
/* !!! Модуль аналізу ієрархічних структур Figma та HTML !!! */
class HierarchyAnalyzer {
  constructor() {
    // Кеш для оптимізації повторних аналізів
    this.analysisCache = new Map()
    this.structureCache = new Map()
  }

  /* !!! Аналіз ієрархії з кешуванням !!! */
  analyzeHierarchy(data, type = 'html') {
    const cacheKey = `${type}-${this.generateCacheKey(data)}`
    
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey)
    }

    const analysis = {
      depth: 0,
      nodeCount: 0,
      componentTypes: new Map(),
      structuralComplexity: 0,
      patterns: [],
      semanticRoles: new Map()
    }

    // Рекурсивний аналіз
    this._analyzeRecursive(data.hierarchy || data, analysis, 0)
    
    // Визначення паттернів
    analysis.patterns = this._detectPatterns(analysis)
    
    // Обчислення складності
    analysis.structuralComplexity = this._calculateComplexity(analysis)
    
    this.analysisCache.set(cacheKey, analysis)
    return analysis
  }

  /* !!! Порівняння двох ієрархій з ML !!! */
  compareHierarchies(figmaAnalysis, htmlAnalysis) {
    const comparison = {
      structuralSimilarity: 0,
      semanticSimilarity: 0,
      depthDifference: Math.abs(figmaAnalysis.depth - htmlAnalysis.depth),
      commonPatterns: [],
      mappingSuggestions: new Map(),
      confidence: 0
    }

    // Структурна схожість
    comparison.structuralSimilarity = this._calculateStructuralSimilarity(
      figmaAnalysis,
      htmlAnalysis
    )

    // Семантична схожість
    comparison.semanticSimilarity = this._calculateSemanticSimilarity(
      figmaAnalysis,
      htmlAnalysis
    )

    // Спільні паттерни
    comparison.commonPatterns = this._findCommonPatterns(
      figmaAnalysis.patterns,
      htmlAnalysis.patterns
    )

    // ML-based mapping suggestions
    comparison.mappingSuggestions = this._generateMappingSuggestions(
      figmaAnalysis,
      htmlAnalysis
    )

    // Загальна впевненість
    comparison.confidence = (
      comparison.structuralSimilarity * 0.4 +
      comparison.semanticSimilarity * 0.4 +
      (comparison.commonPatterns.length / Math.max(
        figmaAnalysis.patterns.length,
        htmlAnalysis.patterns.length
      )) * 0.2
    )

    return comparison
  }

  _analyzeRecursive(node, analysis, depth) {
    if (!node) return

    analysis.depth = Math.max(analysis.depth, depth)
    analysis.nodeCount++

    // Збір типів компонентів
    if (node.type) {
      const count = analysis.componentTypes.get(node.type) || 0
      analysis.componentTypes.set(node.type, count + 1)
    }

    // Семантичні ролі
    if (node.semanticRole) {
      const count = analysis.semanticRoles.get(node.semanticRole) || 0
      analysis.semanticRoles.set(node.semanticRole, count + 1)
    }

    // Рекурсія для дітей
    if (node.children) {
      node.children.forEach(child => {
        this._analyzeRecursive(child, analysis, depth + 1)
      })
    } else if (node instanceof Map) {
      node.forEach(value => {
        this._analyzeRecursive(value, analysis, depth + 1)
      })
    }
  }

  _detectPatterns(analysis) {
    const patterns = []
    
    // Паттерн: Grid layout
    if (analysis.componentTypes.get('GRID') > 2 || 
        analysis.componentTypes.get('grid') > 2) {
      patterns.push('grid-layout')
    }
    
    // Паттерн: Flexbox layout
    if (analysis.componentTypes.get('FLEX') > 3 || 
        analysis.componentTypes.get('flex') > 3) {
      patterns.push('flex-layout')
    }
    
    // Паттерн: Card-based
    if (analysis.componentTypes.get('CARD') > 3 || 
        analysis.componentTypes.get('card') > 3) {
      patterns.push('card-based')
    }
    
    // Паттерн: Hero section
    if (analysis.semanticRoles.get('hero-section') > 0) {
      patterns.push('hero-section')
    }
    
    // Паттерн: Navigation
    if (analysis.semanticRoles.get('navigation') > 0) {
      patterns.push('navigation')
    }

    return patterns
  }

  _calculateComplexity(analysis) {
    const depthWeight = Math.min(analysis.depth / 10, 1)
    const nodeWeight = Math.min(analysis.nodeCount / 100, 1)
    const typeVariety = analysis.componentTypes.size / 20
    
    return (depthWeight * 0.3 + nodeWeight * 0.4 + typeVariety * 0.3)
  }

  _calculateStructuralSimilarity(analysis1, analysis2) {
    const depthSim = 1 - Math.abs(analysis1.depth - analysis2.depth) / 
                     Math.max(analysis1.depth, analysis2.depth)
    
    const nodeSim = 1 - Math.abs(analysis1.nodeCount - analysis2.nodeCount) / 
                    Math.max(analysis1.nodeCount, analysis2.nodeCount)
    
    const complexitySim = 1 - Math.abs(
      analysis1.structuralComplexity - analysis2.structuralComplexity
    )
    
    return (depthSim * 0.3 + nodeSim * 0.4 + complexitySim * 0.3)
  }

  _calculateSemanticSimilarity(analysis1, analysis2) {
    const roles1 = Array.from(analysis1.semanticRoles.keys())
    const roles2 = Array.from(analysis2.semanticRoles.keys())
    
    const commonRoles = roles1.filter(role => roles2.includes(role))
    const allRoles = new Set([...roles1, ...roles2])
    
    return allRoles.size > 0 ? commonRoles.length / allRoles.size : 0
  }

  _findCommonPatterns(patterns1, patterns2) {
    return patterns1.filter(pattern => patterns2.includes(pattern))
  }

  _generateMappingSuggestions(figmaAnalysis, htmlAnalysis) {
    const suggestions = new Map()
    
    // Мапінг за семантичними ролями
    figmaAnalysis.semanticRoles.forEach((count, role) => {
      if (htmlAnalysis.semanticRoles.has(role)) {
        suggestions.set(role, {
          confidence: 0.9,
          reason: 'semantic-match'
        })
      }
    })
    
    // Мапінг за паттернами
    const commonPatterns = this._findCommonPatterns(
      figmaAnalysis.patterns,
      htmlAnalysis.patterns
    )
    
    commonPatterns.forEach(pattern => {
      suggestions.set(pattern, {
        confidence: 0.8,
        reason: 'pattern-match'
      })
    })
    
    return suggestions
  }

  generateCacheKey(data) {
    // Простий хеш для кешування
    const str = JSON.stringify(data).slice(0, 100)
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i)
      hash = hash & hash
    }
    return hash.toString(36)
  }

  /* !!! Генерація звіту аналізу !!! */
  generateAnalysisReport(figmaAnalysis, htmlAnalysis, comparison) {
    return `
/* ================================================
   📊 СТАТИСТИКА ВІДПОВІДНОСТІ СТИЛІВ МАКЕТУ
   ================================================
   
   🎯 ЗАГАЛЬНА ТОЧНІСТЬ: ${(comparison.confidence * 100).toFixed(1)}%
   
   📈 СТРУКТУРНИЙ АНАЛІЗ:
   • Структурна схожість: ${(comparison.structuralSimilarity * 100).toFixed(1)}%
   • Семантична схожість: ${(comparison.semanticSimilarity * 100).toFixed(1)}%
   • Різниця глибини: ${comparison.depthDifference} рівнів
   
   🔍 FIGMA МАКЕТ:
   • Глибина ієрархії: ${figmaAnalysis.depth}
   • Кількість елементів: ${figmaAnalysis.nodeCount}
   • Типи компонентів: ${figmaAnalysis.componentTypes.size}
   • Складність: ${(figmaAnalysis.structuralComplexity * 100).toFixed(1)}%
   
   📝 HTML СТРУКТУРА:
   • Глибина ієрархії: ${htmlAnalysis.depth}
   • Кількість елементів: ${htmlAnalysis.nodeCount}
   • Типи елементів: ${htmlAnalysis.componentTypes.size}
   • Складність: ${(htmlAnalysis.structuralComplexity * 100).toFixed(1)}%
   
   ✅ СПІЛЬНІ ПАТТЕРНИ: ${comparison.commonPatterns.join(', ') || 'немає'}
   
   🎨 МАПІНГ РЕКОМЕНДАЦІЇ:
${Array.from(comparison.mappingSuggestions.entries())
  .map(([key, value]) => `   • ${key}: ${(value.confidence * 100).toFixed(1)}% (${value.reason})`)
  .join('\n')}
   
   ⏱ Згенеровано: ${new Date().toLocaleString('uk-UA')}
   ================================================ */

`
  }
}

module.exports = HierarchyAnalyzer
