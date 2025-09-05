/**
 * Система точного співставлення стилів Figma з HTML класами
 * Використовує множинні алгоритми для досягнення високої точності
 */
class StyleMatcher {
  constructor() {
    this.matchingStrategies = [
      new ContentBasedMatching(),
      new StructuralMatching(),
      new SemanticMatching(),
      new PositionalMatching(),
      new HierarchicalMatching()
    ]
    this.confidenceThreshold = 0.8
  }

  /**
   * Головний метод співставлення з множинними стратегіями
   */
  matchStyles(figmaData, htmlData) {
    const matches = new Map()
    const unmatchedFigma = new Set(figmaData.hierarchy.keys())
    const unmatchedHTML = new Set(htmlData.hierarchy.keys())

    this.matchingStrategies.forEach(strategy => {
      const strategyMatches = strategy.findMatches(figmaData, htmlData)

      strategyMatches.forEach((htmlElement, figmaElement) => {
        if (!matches.has(figmaElement)) {
          const confidence = this.calculateMatchConfidence(
            figmaData.hierarchy.get(figmaElement),
            htmlData.hierarchy.get(htmlElement)
          )

          if (confidence >= this.confidenceThreshold) {
            matches.set(figmaElement, {
              htmlElement,
              confidence,
              strategy: strategy.name()
            })
            unmatchedFigma.delete(figmaElement)
            unmatchedHTML.delete(htmlElement)
          }
        }
      })
    })

    if (unmatchedFigma.size > 0) {
      const mlMatches = this.performMLMatching(
        Array.from(unmatchedFigma).map(id => figmaData.hierarchy.get(id)),
        Array.from(unmatchedHTML).map(id => htmlData.hierarchy.get(id))
      )

      mlMatches.forEach((htmlElement, figmaElement) => {
        matches.set(figmaElement.id, {
          htmlElement: htmlElement.id,
          confidence: 0.75,
          strategy: "ml-based"
        })
      })
    }

    return {
      matches,
      unmatchedFigma: Array.from(unmatchedFigma),
      unmatchedHTML: Array.from(unmatchedHTML),
      statistics: this.generateStatistics(matches, figmaData, htmlData)
    }
  }

  // --- Методи порівняння ---
  calculateMatchConfidence(figmaElement, htmlElement) {
    let score = 0
    let maxScore = 0

    score += this.compareContent(figmaElement.content, htmlElement.textContent) * 0.3
    maxScore += 0.3

    score += this.compareSemantic(figmaElement, htmlElement) * 0.25
    maxScore += 0.25

    score += this.compareStructure(figmaElement, htmlElement) * 0.2
    maxScore += 0.2

    score += this.comparePosition(figmaElement, htmlElement) * 0.15
    maxScore += 0.15

    score += this.compareStyles(figmaElement.styles, htmlElement) * 0.1
    maxScore += 0.1

    return maxScore > 0 ? score / maxScore : 0
  }

  compareContent(figmaContent, htmlContent) {
    if (!figmaContent || !htmlContent) return 0
    const f = this.normalizeText(figmaContent)
    const h = this.normalizeText(htmlContent)
    if (f === h) return 1
    const distance = this.levenshteinDistance(f, h)
    return Math.max(f.length, h.length) > 0 ? 1 - distance / Math.max(f.length, h.length) : 0
  }

  compareSemantic(figmaElement, htmlElement) {
    return this.getFigmaSemanticRole(figmaElement) === htmlElement.semanticRole ? 1 : 0.5
  }

  compareStructure(figmaElement, htmlElement) {
    const figmaChildren = figmaElement.children?.length || 0
    const htmlChildren = htmlElement.children?.length || 0
    if (figmaChildren === 0 && htmlChildren === 0) return 1
    if (figmaChildren === 0 || htmlChildren === 0) return 0
    return 1 - Math.abs(figmaChildren - htmlChildren) / Math.max(figmaChildren, htmlChildren)
  }

  comparePosition(figmaElement, htmlElement) {
    return this.calculateDepth(figmaElement) === htmlElement.level ? 1 : 0.7
  }

  compareStyles(figmaStyles, htmlElement) {
    return 0.5 // Placeholder
  }

  // --- ML методи ---
  performMLMatching(figmaElements, htmlElements) {
    const matches = new Map()
    const figmaVectors = figmaElements.map(el => this.createFeatureVector(el, "figma"))
    const htmlVectors = htmlElements.map(el => this.createFeatureVector(el, "html"))

    figmaVectors.forEach((fv, i) => {
      let bestMatch = -1
      let bestSim = 0
      htmlVectors.forEach((hv, j) => {
        const sim = this.cosineSimilarity(fv, hv)
        if (sim > bestSim && sim > 0.6) {
          bestSim = sim
          bestMatch = j
        }
      })
      if (bestMatch >= 0) matches.set(figmaElements[i], htmlElements[bestMatch])
    })

    return matches
  }

  createFeatureVector(element, type) {
    const vector = []
    vector.push(element.content ? element.content.length : 0)
    vector.push(this.countWords(element.content || ""))
    vector.push(this.hasNumbers(element.content || "") ? 1 : 0)
    vector.push(element.children ? element.children.length : 0)
    vector.push(this.calculateDepth(element))
    if (type === "html") {
      vector.push(element.tagName === "button" ? 1 : 0)
      vector.push(element.tagName === "h1" ? 1 : 0)
      vector.push(element.tagName === "img" ? 1 : 0)
      vector.push(element.classes.length)
    } else {
      vector.push(element.type === "RECTANGLE" ? 1 : 0)
      vector.push(element.type === "TEXT" ? 1 : 0)
      vector.push(element.type === "FRAME" ? 1 : 0)
      vector.push(element.styles ? Object.keys(element.styles).length : 0)
    }
    return vector
  }

  cosineSimilarity(a, b) {
    const dot = a.reduce((sum, x, i) => sum + x * b[i], 0)
    const magA = Math.sqrt(a.reduce((sum, x) => sum + x * x, 0))
    const magB = Math.sqrt(b.reduce((sum, x) => sum + x * x, 0))
    return magA && magB ? dot / (magA * magB) : 0
  }

  levenshteinDistance(str1, str2) {
    const matrix = Array(str2.length + 1)
      .fill()
      .map(() => Array(str1.length + 1).fill(0))
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        matrix[j][i] =
          str1[i - 1] === str2[j - 1]
            ? matrix[j - 1][i - 1]
            : Math.min(matrix[j - 1][i] + 1, matrix[j][i - 1] + 1, matrix[j - 1][i - 1] + 1)
      }
    }
    return matrix[str2.length][str1.length]
  }

  // --- Допоміжні ---
  normalizeText(text) {
    return text.toLowerCase().replace(/\s+/g, " ").trim()
  }
  countWords(text) {
    return text
      .trim()
      .split(/\s+/)
      .filter(w => w.length > 0).length
  }
  hasNumbers(text) {
    return /\d/.test(text)
  }
  calculateDepth(element) {
    return element.path ? element.path.split("/").length : 0
  }
  getFigmaSemanticRole(el) {
    const name = el.name.toLowerCase()
    if (name.includes("button") || name.includes("btn")) return "interactive"
    if (name.includes("header")) return "header"
    if (name.includes("title") || name.includes("heading")) return "heading"
    if (name.includes("card")) return "content-card"
    if (name.includes("menu") || name.includes("nav")) return "navigation"
    return "generic"
  }

  generateStatistics(matches, figmaData, htmlData) {
    const totalFigma = figmaData.hierarchy.size
    const totalHTML = htmlData.hierarchy.size
    const matchedCount = matches.size
    return {
      totalFigmaElements: totalFigma,
      totalHTMLElements: totalHTML,
      matchedElements: matchedCount,
      matchPercentage: totalFigma > 0 ? (matchedCount / totalFigma) * 100 : 0,
      averageConfidence: this.calculateAverageConfidence(matches)
    }
  }

  calculateAverageConfidence(matches) {
    if (matches.size === 0) return 0
    return Array.from(matches.values()).reduce((sum, m) => sum + m.confidence, 0) / matches.size
  }
}

// --- Стратегії ---
class ContentBasedMatching {
  name() {
    return "content-based"
  }
  findMatches(figmaData, htmlData) {
    const matches = new Map()
    figmaData.contentMap.forEach((fe, content) => {
      if (htmlData.contentMap.has(content)) matches.set(fe.id, htmlData.contentMap.get(content).id)
    })
    return matches
  }
}

class StructuralMatching {
  name() {
    return "structural"
  }
  findMatches(figmaData, htmlData) {
    const matches = new Map()
    figmaData.hierarchy.forEach((fe, fid) => {
      htmlData.hierarchy.forEach((he, hid) => {
        if (this.structuresMatch(fe, he)) matches.set(fid, hid)
      })
    })
    return matches
  }
  structuresMatch(fe, he) {
    return fe.children?.length === he.children?.length && fe.path?.split("/").length === he.level
  }
}

class SemanticMatching {
  name() {
    return "semantic"
  }
  findMatches(figmaData, htmlData) {
    const matches = new Map()
    figmaData.hierarchy.forEach((fe, fid) => {
      const role = this.getFigmaRole(fe)
      htmlData.hierarchy.forEach((he, hid) => {
        if (role === he.semanticRole) matches.set(fid, hid)
      })
    })
    return matches
  }
  getFigmaRole(fe) {
    const name = fe.name.toLowerCase()
    const type = fe.type
    if (type === "TEXT" && name.includes("title")) return "main-heading"
    if (name.includes("button")) return "interactive"
    if (name.includes("header")) return "header"
    if (name.includes("card")) return "content-card"
    return "generic"
  }
}

class PositionalMatching {
  name() {
    return "positional"
  }
  findMatches(figmaData, htmlData) {
    const matches = new Map()
    figmaData.hierarchy.forEach((fe, fid) => {
      htmlData.hierarchy.forEach((he, hid) => {
        if (this.positionsMatch(fe, he)) matches.set(fid, hid)
      })
    })
    return matches
  }
  positionsMatch(fe, he) {
    return fe.path.split("/").length === he.path.split("/").length
  }
}

class HierarchicalMatching {
  name() {
    return "hierarchical"
  }
  findMatches(figmaData, htmlData) {
    const matches = new Map()
    // Рекурсивне співставлення можна реалізувати пізніше
    return matches
  }
}

module.exports = StyleMatcher
