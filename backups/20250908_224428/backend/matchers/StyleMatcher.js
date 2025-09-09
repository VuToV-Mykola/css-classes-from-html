/**
 * Розширена система співставлення стилів Figma з HTML класами
 * Використовує множинні алгоритми та ML для досягнення високої точності
 * @version 3.0.0
 */

class StyleMatcher {
  constructor(options = {}) {
    this.matchingStrategies = [
      new ContentBasedMatching(),
      new StructuralMatching(),
      new SemanticMatching(),
      new PositionalMatching(),
      new HierarchicalMatching(),
      new VisualMatching(),
      new ContextualMatching()
    ];
    
    this.confidenceThreshold = options.confidenceThreshold || 0.8;
    this.mlEnabled = options.mlEnabled !== false;
    this.weights = {
      content: 0.3,
      semantic: 0.25,
      structural: 0.2,
      positional: 0.15,
      visual: 0.1
    };
    
    this.cache = new Map();
    this.statistics = {
      totalMatches: 0,
      successfulMatches: 0,
      averageConfidence: 0,
      strategyUsage: new Map()
    };
  }

  /**
   * Головний метод співставлення з множинними стратегіями
   */
  matchStyles(figmaData, htmlData) {
    const startTime = Date.now();
    const cacheKey = this._generateCacheKey(figmaData, htmlData);
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const matches = new Map();
    const unmatchedFigma = new Set(figmaData.hierarchy.keys());
    const unmatchedHTML = new Set(htmlData.hierarchy.keys());
    const matchHistory = [];

    // Використання множинних стратегій
    this.matchingStrategies.forEach(strategy => {
      const strategyMatches = strategy.findMatches(figmaData, htmlData);
      const strategyName = strategy.name();
      
      strategyMatches.forEach((htmlElement, figmaElement) => {
        if (!matches.has(figmaElement)) {
          const confidence = this.calculateMatchConfidence(
            figmaData.hierarchy.get(figmaElement),
            htmlData.hierarchy.get(htmlElement),
            strategyName
          );

          if (confidence >= this.confidenceThreshold) {
            matches.set(figmaElement, {
              htmlElement,
              confidence,
              strategy: strategyName,
              timestamp: Date.now()
            });
            
            unmatchedFigma.delete(figmaElement);
            unmatchedHTML.delete(htmlElement);
            matchHistory.push({
              figmaElement,
              htmlElement,
              strategy: strategyName,
              confidence
            });
          }
        }
      });
    });

    // ML-based matching для неспівставлених елементів
    if (this.mlEnabled && unmatchedFigma.size > 0) {
      const mlMatches = this.performMLMatching(
        Array.from(unmatchedFigma).map(id => figmaData.hierarchy.get(id)),
        Array.from(unmatchedHTML).map(id => htmlData.hierarchy.get(id))
      );

      mlMatches.forEach((htmlElement, figmaElement) => {
        matches.set(figmaElement.id, {
          htmlElement: htmlElement.id,
          confidence: 0.75,
          strategy: 'ml-based',
          timestamp: Date.now()
        });
        
        matchHistory.push({
          figmaElement: figmaElement.id,
          htmlElement: htmlElement.id,
          strategy: 'ml-based',
          confidence: 0.75
        });
      });
    }

    // Генерація результатів
    const result = {
      matches,
      unmatchedFigma: Array.from(unmatchedFigma),
      unmatchedHTML: Array.from(unmatchedHTML),
      statistics: this.generateStatistics(matches, figmaData, htmlData, matchHistory),
      processingTime: Date.now() - startTime,
      matchHistory
    };

    this.cache.set(cacheKey, result);
    this._updateStatistics(result);
    
    return result;
  }

  /**
   * Розрахунок впевненості в співставленні
   */
  calculateMatchConfidence(figmaElement, htmlElement, strategy) {
    let score = 0;
    let maxScore = 0;

    // Контентне співставлення
    const contentScore = this.compareContent(figmaElement.content, htmlElement.textContent);
    score += contentScore * this.weights.content;
    maxScore += this.weights.content;

    // Семантичне співставлення
    const semanticScore = this.compareSemantic(figmaElement, htmlElement);
    score += semanticScore * this.weights.semantic;
    maxScore += this.weights.semantic;

    // Структурне співставлення
    const structuralScore = this.compareStructure(figmaElement, htmlElement);
    score += structuralScore * this.weights.structural;
    maxScore += this.weights.structural;

    // Позиційне співставлення
    const positionalScore = this.comparePosition(figmaElement, htmlElement);
    score += positionalScore * this.weights.positional;
    maxScore += this.weights.positional;

    // Візуальне співставлення
    const visualScore = this.compareVisual(figmaElement, htmlElement);
    score += visualScore * this.weights.visual;
    maxScore += this.weights.visual;

    // Бонус за стратегію
    const strategyBonus = this._getStrategyBonus(strategy);
    score += strategyBonus;

    return maxScore > 0 ? Math.min(score / maxScore + strategyBonus, 1.0) : 0;
  }

  /**
   * Порівняння контенту
   */
  compareContent(figmaContent, htmlContent) {
    if (!figmaContent || !htmlContent) return 0;
    
    const f = this.normalizeText(figmaContent);
    const h = this.normalizeText(htmlContent);
    
    if (f === h) return 1;
    
    const distance = this.levenshteinDistance(f, h);
    const maxLength = Math.max(f.length, h.length);
    
    return maxLength > 0 ? 1 - distance / maxLength : 0;
  }

  /**
   * Порівняння семантики
   */
  compareSemantic(figmaElement, htmlElement) {
    const figmaRole = this.getFigmaSemanticRole(figmaElement);
    const htmlRole = htmlElement.semanticRole;
    
    if (figmaRole === htmlRole) return 1;
    
    // Часткове співпадіння
    const roleSimilarity = this._calculateRoleSimilarity(figmaRole, htmlRole);
    return roleSimilarity;
  }

  /**
   * Порівняння структури
   */
  compareStructure(figmaElement, htmlElement) {
    const figmaChildren = figmaElement.children?.length || 0;
    const htmlChildren = htmlElement.children?.length || 0;
    
    if (figmaChildren === 0 && htmlChildren === 0) return 1;
    if (figmaChildren === 0 || htmlChildren === 0) return 0;
    
    const ratio = Math.min(figmaChildren, htmlChildren) / Math.max(figmaChildren, htmlChildren);
    return ratio;
  }

  /**
   * Порівняння позиції
   */
  comparePosition(figmaElement, htmlElement) {
    const figmaDepth = this.calculateDepth(figmaElement);
    const htmlDepth = htmlElement.level;
    
    if (figmaDepth === htmlDepth) return 1;
    
    const depthDiff = Math.abs(figmaDepth - htmlDepth);
    return Math.max(0, 1 - depthDiff / Math.max(figmaDepth, htmlDepth));
  }

  /**
   * Порівняння візуальних характеристик
   */
  compareVisual(figmaElement, htmlElement) {
    let score = 0;
    let maxScore = 0;

    // Порівняння розмірів
    if (figmaElement.styles?.position && htmlElement.styles) {
      const sizeScore = this._compareSizes(figmaElement.styles.position, htmlElement.styles);
      score += sizeScore * 0.4;
      maxScore += 0.4;
    }

    // Порівняння кольорів
    if (figmaElement.styles?.colors && htmlElement.styles) {
      const colorScore = this._compareColors(figmaElement.styles.colors, htmlElement.styles);
      score += colorScore * 0.3;
      maxScore += 0.3;
    }

    // Порівняння типографіки
    if (figmaElement.styles?.typography && htmlElement.contentAnalysis) {
      const typographyScore = this._compareTypography(figmaElement.styles.typography, htmlElement.contentAnalysis);
      score += typographyScore * 0.3;
      maxScore += 0.3;
    }

    return maxScore > 0 ? score / maxScore : 0.5;
  }

  /**
   * ML-based matching
   */
  performMLMatching(figmaElements, htmlElements) {
    const matches = new Map();
    
    if (figmaElements.length === 0 || htmlElements.length === 0) {
      return matches;
    }

    const figmaVectors = figmaElements.map(el => this.createFeatureVector(el, 'figma'));
    const htmlVectors = htmlElements.map(el => this.createFeatureVector(el, 'html'));

    figmaVectors.forEach((fv, i) => {
      let bestMatch = -1;
      let bestSim = 0;
      
      htmlVectors.forEach((hv, j) => {
        const sim = this.cosineSimilarity(fv, hv);
        if (sim > bestSim && sim > 0.6) {
          bestSim = sim;
          bestMatch = j;
        }
      });
      
      if (bestMatch >= 0) {
        matches.set(figmaElements[i], htmlElements[bestMatch]);
      }
    });

    return matches;
  }

  /**
   * Створення вектора характеристик
   */
  createFeatureVector(element, type) {
    const vector = [];
    
    // Базові характеристики
    vector.push(element.content ? element.content.length : 0);
    vector.push(this.countWords(element.content || ''));
    vector.push(this.hasNumbers(element.content || '') ? 1 : 0);
    vector.push(element.children ? element.children.length : 0);
    vector.push(this.calculateDepth(element));
    
    if (type === 'html') {
      // HTML специфічні характеристики
      vector.push(element.tagName === 'button' ? 1 : 0);
      vector.push(element.tagName === 'h1' ? 1 : 0);
      vector.push(element.tagName === 'img' ? 1 : 0);
      vector.push(element.classes.length);
      vector.push(element.importance);
      vector.push(element.contentAnalysis.hasText ? 1 : 0);
      vector.push(element.contentAnalysis.hasImages ? 1 : 0);
      vector.push(element.contentAnalysis.hasButtons ? 1 : 0);
    } else {
      // Figma специфічні характеристики
      vector.push(element.type === 'RECTANGLE' ? 1 : 0);
      vector.push(element.type === 'TEXT' ? 1 : 0);
      vector.push(element.type === 'FRAME' ? 1 : 0);
      vector.push(element.styles ? Object.keys(element.styles).length : 0);
      vector.push(element.semanticRole === 'interactive' ? 1 : 0);
      vector.push(element.semanticRole === 'heading' ? 1 : 0);
      vector.push(element.semanticRole === 'image' ? 1 : 0);
    }
    
    return vector;
  }

  /**
   * Косинусна схожість
   */
  cosineSimilarity(a, b) {
    const dot = a.reduce((sum, x, i) => sum + x * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, x) => sum + x * x, 0));
    const magB = Math.sqrt(b.reduce((sum, x) => sum + x * x, 0));
    return magA && magB ? dot / (magA * magB) : 0;
  }

  /**
   * Відстань Левенштейна
   */
  levenshteinDistance(str1, str2) {
    const matrix = Array(str2.length + 1)
      .fill()
      .map(() => Array(str1.length + 1).fill(0));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        matrix[j][i] = str1[i - 1] === str2[j - 1]
          ? matrix[j - 1][i - 1]
          : Math.min(
            matrix[j - 1][i] + 1,
            matrix[j][i - 1] + 1,
            matrix[j - 1][i - 1] + 1
          );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Допоміжні методи
   */
  normalizeText(text) {
    if (typeof text !== 'string') {
      return '';
    }
    return text.toLowerCase().replace(/\s+/g, ' ').trim();
  }

  countWords(text) {
    if (typeof text !== 'string') {
      return 0;
    }
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  }

  hasNumbers(text) {
    return /\d/.test(text);
  }

  calculateDepth(element) {
    return element.path ? element.path.split('/').length : 0;
  }

  getFigmaSemanticRole(element) {
    const name = element.name.toLowerCase();
    const type = element.type;
    
    if (type === 'TEXT') {
      if (name.includes('title') || name.includes('heading')) return 'heading';
      if (name.includes('button') || name.includes('btn')) return 'interactive';
      return 'text';
    }
    
    if (type === 'FRAME') {
      if (name.includes('header')) return 'header';
      if (name.includes('footer')) return 'footer';
      if (name.includes('nav') || name.includes('menu')) return 'navigation';
      if (name.includes('card')) return 'content-card';
      if (name.includes('container') || name.includes('wrapper')) return 'container';
      return 'section';
    }
    
    if (type === 'RECTANGLE') {
      if (name.includes('button') || name.includes('btn')) return 'interactive';
      return 'generic';
    }
    
    return 'generic';
  }

  /**
   * Приватні методи
   */
  _generateCacheKey(figmaData, htmlData) {
    return `figma_${figmaData.hierarchy.size}_html_${htmlData.hierarchy.size}`;
  }

  _getStrategyBonus(strategy) {
    const bonuses = {
      'content-based': 0.1,
      'semantic': 0.15,
      'structural': 0.05,
      'positional': 0.05,
      'hierarchical': 0.1,
      'visual': 0.1,
      'contextual': 0.1,
      'ml-based': 0.05
    };
    return bonuses[strategy] || 0;
  }

  _calculateRoleSimilarity(role1, role2) {
    const roleHierarchy = {
      'main': 10,
      'header': 9,
      'footer': 8,
      'navigation': 7,
      'heading': 6,
      'interactive': 5,
      'content-section': 4,
      'text': 3,
      'generic': 1
    };
    
    const level1 = roleHierarchy[role1] || 1;
    const level2 = roleHierarchy[role2] || 1;
    
    return 1 - Math.abs(level1 - level2) / Math.max(level1, level2);
  }

  _compareSizes(figmaPosition, htmlStyles) {
    // Простий порівняльний аналіз розмірів
    return 0.5; // Placeholder
  }

  _compareColors(figmaColors, htmlStyles) {
    // Простий порівняльний аналіз кольорів
    return 0.5; // Placeholder
  }

  _compareTypography(figmaTypography, htmlContentAnalysis) {
    // Простий порівняльний аналіз типографіки
    return 0.5; // Placeholder
  }

  _updateStatistics(result) {
    this.statistics.totalMatches += result.matches.size;
    this.statistics.successfulMatches += result.matches.size;
    this.statistics.averageConfidence = result.statistics.averageConfidence;
    
    result.matchHistory.forEach(match => {
      const count = this.statistics.strategyUsage.get(match.strategy) || 0;
      this.statistics.strategyUsage.set(match.strategy, count + 1);
    });
  }

  generateStatistics(matches, figmaData, htmlData, matchHistory) {
    const totalFigma = figmaData.hierarchy.size;
    const totalHTML = htmlData.hierarchy.size;
    const matchedCount = matches.size;
    
    return {
      totalFigmaElements: totalFigma,
      totalHTMLElements: totalHTML,
      matchedElements: matchedCount,
      matchPercentage: totalFigma > 0 ? (matchedCount / totalFigma) * 100 : 0,
      averageConfidence: this.calculateAverageConfidence(matches),
      strategyDistribution: this._calculateStrategyDistribution(matchHistory),
      processingTime: Date.now()
    };
  }

  calculateAverageConfidence(matches) {
    if (matches.size === 0) return 0;
    return Array.from(matches.values()).reduce((sum, m) => sum + m.confidence, 0) / matches.size;
  }

  _calculateStrategyDistribution(matchHistory) {
    const distribution = new Map();
    matchHistory.forEach(match => {
      const count = distribution.get(match.strategy) || 0;
      distribution.set(match.strategy, count + 1);
    });
    return Object.fromEntries(distribution);
  }

  /**
   * Очищення кешу
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Отримання статистики
   */
  getStatistics() {
    return {
      ...this.statistics,
      cacheSize: this.cache.size,
      strategies: this.matchingStrategies.map(s => s.name())
    };
  }
}

// Стратегії співставлення
class ContentBasedMatching {
  name() { return 'content-based'; }
  
  findMatches(figmaData, htmlData) {
    const matches = new Map();
    figmaData.contentMap.forEach((fe, content) => {
      if (htmlData.contentMap.has(content)) {
        matches.set(fe.id, htmlData.contentMap.get(content).id);
      }
    });
    return matches;
  }
}

class StructuralMatching {
  name() { return 'structural'; }
  
  findMatches(figmaData, htmlData) {
    const matches = new Map();
    figmaData.hierarchy.forEach((fe, fid) => {
      htmlData.hierarchy.forEach((he, hid) => {
        if (this.structuresMatch(fe, he)) {
          matches.set(fid, hid);
        }
      });
    });
    return matches;
  }
  
  structuresMatch(fe, he) {
    return fe.children?.length === he.children?.length && 
           fe.path?.split('/').length === he.level;
  }
}

class SemanticMatching {
  name() { return 'semantic'; }
  
  findMatches(figmaData, htmlData) {
    const matches = new Map();
    figmaData.hierarchy.forEach((fe, fid) => {
      const role = this.getFigmaRole(fe);
      htmlData.hierarchy.forEach((he, hid) => {
        if (role === he.semanticRole) {
          matches.set(fid, hid);
        }
      });
    });
    return matches;
  }
  
  getFigmaRole(fe) {
    const name = fe.name.toLowerCase();
    const type = fe.type;
    
    if (type === 'TEXT' && name.includes('title')) return 'heading';
    if (name.includes('button')) return 'interactive';
    if (name.includes('header')) return 'header';
    if (name.includes('card')) return 'content-card';
    
    return 'generic';
  }
}

class PositionalMatching {
  name() { return 'positional'; }
  
  findMatches(figmaData, htmlData) {
    const matches = new Map();
    figmaData.hierarchy.forEach((fe, fid) => {
      htmlData.hierarchy.forEach((he, hid) => {
        if (this.positionsMatch(fe, he)) {
          matches.set(fid, hid);
        }
      });
    });
    return matches;
  }
  
  positionsMatch(fe, he) {
    if (!fe.path || !he.path) {
      return false;
    }
    return fe.path.split('/').length === he.path.split('/').length;
  }
}

class HierarchicalMatching {
  name() { return 'hierarchical'; }
  
  findMatches(figmaData, htmlData) {
    const matches = new Map();
    // Рекурсивне співставлення можна реалізувати пізніше
    return matches;
  }
}

class VisualMatching {
  name() { return 'visual'; }
  
  findMatches(figmaData, htmlData) {
    const matches = new Map();
    // Візуальне співставлення на основі стилів
    return matches;
  }
}

class ContextualMatching {
  name() { return 'contextual'; }
  
  findMatches(figmaData, htmlData) {
    const matches = new Map();
    // Контекстне співставлення на основі оточення
    return matches;
  }
}

module.exports = StyleMatcher;
