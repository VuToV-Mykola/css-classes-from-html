/**
 * Розширена система співставлення стилів Figma з HTML класами
 * Використовує множинні алгоритми та ML для досягнення високої точності
 * @version 3.0.0;
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
      visual: 0.1;
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
            strategyName;
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
              confidence;
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
          strategy: "ml-based",
          timestamp: Date.now()
        });
        
        matchHistory.push({
          figmaElement: figmaElement.id,
          htmlElement: htmlElement.id,
          strategy: "ml-based",
          confidence: 0.75;
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
      matchHistory;
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
   * ML-based matching;
   */
  performMLMatching(figmaElements, htmlElements) {
    const matches = new Map();
    
    if (figmaElements.length === 0 || htmlElements.length === 0) {
      return matches;
    }

    const figmaVectors = figmaElements.map(el => this.createFeatureVector(el, "figma"));
    const htmlVectors = htmlElements.map(el => this.createFeatureVector(el, "html"));

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
    vector.push(this.countWords(element.content || ""));
    vector.push(this.hasNumbers(element.content || "") ? 1 : 0);
    vector.push(element.children ? element.children.length : 0);
    vector.push(this.calculateDepth(element));
    
    if (type === "html") {
      // HTML специфічні характеристики
      vector.push(element.tagName === "button" ? 1 : 0);
      vector.push(element.tagName === "h1" ? 1 : 0);
      vector.push(element.tagName === "img" ? 1 : 0);
      vector.push(element.classes.length);
      vector.push(element.importance);
      vector.push(element.contentAnalysis.hasText ? 1 : 0);
      vector.push(element.contentAnalysis.hasImages ? 1 : 0);
      vector.push(element.contentAnalysis.hasButtons ? 1 : 0);
    } else {
      // Figma специфічні характеристики
      vector.push(element.type === "RECTANGLE" ? 1 : 0);
      vector.push(element.type === "TEXT" ? 1 : 0);
      vector.push(element.type === "FRAME" ? 1 : 0);
      vector.push(element.styles ? Object.keys(element.styles).length : 0);
      vector.push(element.semanticRole === "interactive" ? 1 : 0);
      vector.push(element.semanticRole === "heading" ? 1 : 0);
      vector.push(element.semanticRole === "image" ? 1 : 0);
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
            matrix[j - 1][i - 1] + 1;
          );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Допоміжні методи
   */
  normalizeText(text) {
    if (typeof text !== "string") {
      return "";
    }
    return text.toLowerCase().replace(/\s+/g, " ").trim();
  }

  countWords(text) {
    if (typeof text !== "string") {
      return 0;
    }
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  }

  hasNumbers(text) {
    return /\d/.test(text);
  }

  calculateDepth(element) {
    return element.path ? element.path.split("/").length : 0;
  }

  getFigmaSemanticRole(element) {
    const name = element.name ? element.name.toLowerCase() : "";
    const type = element.type;
    
    if (type === "TEXT") {
      if (name.includes("title") || name.includes("heading")) return "heading";
      if (name.includes("button") || name.includes("btn")) return "interactive";
      return "text";
    }
    
    if (type === "FRAME") {
      if (name.includes("header")) return "header";
      if (name.includes("footer")) return "footer";
      if (name.includes("nav") || name.includes("menu")) return "navigation";
      if (name.includes("card")) return "content-card";
      if (name.includes("container") || name.includes("wrapper")) return "container";
      return "section";
    }
    
    if (type === "RECTANGLE") {
      if (name.includes("button") || name.includes("btn")) return "interactive";
      return "generic";
    }
    
    return "generic";
  }

  /**
   * Приватні методи
   */
  _generateCacheKey(figmaData, htmlData) {
    return `figma_${figmaData.hierarchy.size}_html_${htmlData.hierarchy.size}`;
  }

  _getStrategyBonus(strategy) {
    const bonuses = {
      "content-based": 0.1,
      "semantic": 0.15,
      "structural": 0.05,
      "positional": 0.05,
      "hierarchical": 0.1,
      "visual": 0.1,
      "contextual": 0.1,
      "ml-based": 0.05;
    };
    return bonuses[strategy] || 0;
  }

  _calculateRoleSimilarity(role1, role2) {
    const roleHierarchy = {
      "main": 10,
      "header": 9,
      "footer": 8,
      "navigation": 7,
      "heading": 6,
      "interactive": 5,
      "content-section": 4,
      "text": 3,
      "generic": 1;
    };
    
    const level1 = roleHierarchy[role1] || 1;
    const level2 = roleHierarchy[role2] || 1;
    
    const maxLevel = Math.max(level1, level2);
    return maxLevel > 0 ? 1 - Math.abs(level1 - level2) / maxLevel : 0;
  }

  _compareSizes(figmaPosition, htmlStyles) {
    if (!figmaPosition) return 0.5;
    // У HTML ми рідко маємо точні width/height на елементах під час аналізу,
    // тож повертаємо помірно нейтральне значення, якщо відсутні стилі
    const fw = figmaPosition.width || 0;
    const fh = figmaPosition.height || 0;
    if (fw === 0 && fh === 0) return 0.5;
    // Якщо є стилі HTML з width/height (потенційно з inline або обчислень) — спробуємо порівняти
    const hw = Number((htmlStyles && htmlStyles.width) || 0);
    const hh = Number((htmlStyles && htmlStyles.height) || 0);
    if (!hw && !hh) return 0.6; // невеликий бонус за наявність розмірів у Figma;
    const wSim = this._ratioSimilarity(fw, hw);
    const hSim = this._ratioSimilarity(fh, hh);
    return (wSim + hSim) / 2;
  }

  _compareColors(figmaColors, htmlStyles) {
    if (!Array.isArray(figmaColors) || figmaColors.length === 0) return 0.5;
    // Очікуємо, що htmlStyles може мати color або background-color (не завжди доступно тут)
    const htmlColor = htmlStyles && (htmlStyles.color || htmlStyles.backgroundColor);
    if (!htmlColor) return 0.6; // легкий бонус при наявності кольорів у Figma;
    // Порівняємо перший solid колір
    const solid = figmaColors.find(c => c.type === "solid" && c.color);
    if (!solid) return 0.5;
    const fHex = solid.color;
    return fHex && typeof htmlColor === "string" && htmlColor.toLowerCase() === fHex.toLowerCase() ? 1 : 0.6;
  }

  _compareTypography(figmaTypography, htmlContentAnalysis) {
    if (!figmaTypography) return 0.5;
    // htmlContentAnalysis може містити лише контентні факти; типографічних значень може не бути
    // Оцінимо за наявністю тексту
    const hasText = htmlContentAnalysis && htmlContentAnalysis.hasText;
    if (!hasText) return 0.6;
    let score = 0.6;
    if (figmaTypography.fontSize) score += 0.1;
    if (figmaTypography.fontWeight) score += 0.1;
    if (figmaTypography.lineHeight) score += 0.1;
    return Math.min(score, 1.0);
  }

  _ratioSimilarity(a, b) {
    if (!a && !b) return 1;
    if (!a || !b) return 0.5;
    const max = Math.max(a, b);
    const min = Math.min(a, b);
    return max > 0 ? min / max : 1;
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
  name() { return "content-based"; }
  
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
  name() { return "structural"; }
  
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
    const feChildren = fe.children?.length || 0;
    const heChildren = he.children?.length || 0;
    const feDepth = fe.path?.split("/").length || 0;
    return feChildren === heChildren && feDepth === he.level;
  }
}

class SemanticMatching {
  name() { return "semantic"; }
  
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
    const name = fe.name ? fe.name.toLowerCase() : "";
    const type = fe.type;
    
    if (type === "TEXT" && name.includes("title")) return "heading";
    if (name.includes("button")) return "interactive";
    if (name.includes("header")) return "header";
    if (name.includes("card")) return "content-card";
    
    return "generic";
  }
}

class PositionalMatching {
  name() { return "positional"; }
  
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
    const feDepth = fe.path.split("/").length;
    const heDepth = he.path.split("/").length;
    return feDepth === heDepth;
  }
}

class HierarchicalMatching {
  name() { return "hierarchical"; }
  
  findMatches(figmaData, htmlData) {
    const matches = new Map();
    
    // Рекурсивне співставлення ієрархічних структур
    this.matchHierarchicalStructures(figmaData, htmlData, matches);
    
    return matches;
  }
  
  /**
   * Рекурсивне співставлення ієрархічних структур
   */
  matchHierarchicalStructures(figmaData, htmlData, matches) {
    // Створюємо ієрархічні дерева для більш ефективного пошуку
    const figmaTree = this.buildTree(figmaData.hierarchy);
    const htmlTree = this.buildTree(htmlData.hierarchy);
    
    // Рекурсивно порівнюємо структури, починаючи з кореневих елементів
    this.compareTreeNodes(figmaTree.roots, htmlTree.roots, figmaData, htmlData, matches);
  }
  
  /**
   * Побудова дерева з ієрархії
   */
  buildTree(hierarchy) {
    const nodes = new Map();
    const roots = [];
    
    // Створюємо вузли для кожного елементу
    hierarchy.forEach((element, id) => {
      nodes.set(id, {
        id,
        element,
        children: [],
        parent: null;
      });
    });
    
    // Встановлюємо зв"язки батько-дитина
    hierarchy.forEach((element, id) => {
      const node = nodes.get(id);
      if (element.path && element.path.includes("/")) {
        // Знаходимо батьківський елемент за шляхом
        const pathParts = element.path.split("/");
        if (pathParts.length > 1) {
          const parentPath = pathParts.slice(0, -1).join("/");
          const parentNode = Array.from(nodes.values()).find(n => 
            n.element.path === parentPath;
          );
          if (parentNode) {
            parentNode.children.push(node);
            node.parent = parentNode;
          }
        }
      }
      
      // Якщо немає батька, це кореневий елемент
      if (!node.parent) {
        roots.push(node);
      }
    });
    
    return { nodes, roots };
  }
  
  /**
   * Рекурсивне порівняння вузлів дерев
   */
  compareTreeNodes(figmaNodes, htmlNodes, figmaData, htmlData, matches, depth = 0) {
    if (!figmaNodes || !htmlNodes || figmaNodes.length === 0 || htmlNodes.length === 0) {
      return;
    }
    
    // Обмежуємо глибину рекурсії для запобігання нескінченним циклам
    if (depth > 10) {
      return;
    }
    
    // Порівнюємо кожен вузол Figma з вузлами HTML на тому ж рівні
    figmaNodes.forEach(figmaNode => {
      let bestMatch = null;
      let bestScore = 0;
      
      htmlNodes.forEach(htmlNode => {
        const score = this.calculateHierarchicalSimilarity(figmaNode, htmlNode);
        
        // Перевіряємо, чи вузол вже співставлений
        const alreadyMatched = Array.from(matches.values()).some(match => 
          match === htmlNode.id || match.htmlElement === htmlNode.id;
        );
        
        if (score > bestScore && score > 0.6 && !alreadyMatched) {
          bestScore = score;
          bestMatch = htmlNode;
        }
      });
      
      // Якщо знайшли гарне співпадіння, додаємо його
      if (bestMatch && bestScore > 0.6) {
        matches.set(figmaNode.id, bestMatch.id);
        
        // Рекурсивно перевіряємо дочірні елементи
        if (figmaNode.children.length > 0 && bestMatch.children.length > 0) {
          this.compareTreeNodes(
            figmaNode.children, 
            bestMatch.children, 
            figmaData, 
            htmlData, 
            matches, 
            depth + 1;
          );
        }
      }
    });
  }
  
  /**
   * Розрахунок ієрархічної схожості між вузлами
   */
  calculateHierarchicalSimilarity(figmaNode, htmlNode) {
    let score = 0;
    let maxScore = 0;
    
    // Порівняння глибини в ієрархії
    const figmaDepth = this.getNodeDepth(figmaNode);
    const htmlDepth = this.getNodeDepth(htmlNode);
    if (figmaDepth === htmlDepth) {
      score += 0.3;
    } else {
      const depthDiff = Math.abs(figmaDepth - htmlDepth);
      score += Math.max(0, 0.3 - (depthDiff * 0.1));
    }
    maxScore += 0.3;
    
    // Порівняння кількості дочірніх елементів
    const figmaChildrenCount = figmaNode.children.length;
    const htmlChildrenCount = htmlNode.children.length;
    if (figmaChildrenCount === htmlChildrenCount) {
      score += 0.25;
    } else if (figmaChildrenCount > 0 && htmlChildrenCount > 0) {
      const childrenRatio = Math.min(figmaChildrenCount, htmlChildrenCount) / 
                           Math.max(figmaChildrenCount, htmlChildrenCount);
      score += 0.25 * childrenRatio;
    }
    maxScore += 0.25;
    
    // Порівняння типу/ролі елемента
    const figmaRole = this.getElementRole(figmaNode.element);
    const htmlRole = htmlNode.element.semanticRole;
    if (figmaRole === htmlRole) {
      score += 0.25;
    } else if (this.areRolesCompatible(figmaRole, htmlRole)) {
      score += 0.15;
    }
    maxScore += 0.25;
    
    // Порівняння контенту (якщо є)
    if (figmaNode.element.content && htmlNode.element.textContent) {
      const contentSimilarity = this.calculateContentSimilarity(
        figmaNode.element.content,
        htmlNode.element.textContent;
      );
      score += 0.2 * contentSimilarity;
    }
    maxScore += 0.2;
    
    return maxScore > 0 ? score / maxScore : 0;
  }
  
  /**
   * Отримання глибини вузла в дереві
   */
  getNodeDepth(node) {
    let depth = 0;
    let current = node.parent;
    while (current) {
      depth++;
      current = current.parent;
    }
    return depth;
  }
  
  /**
   * Визначення ролі елемента
   */
  getElementRole(element) {
    if (element.type === "TEXT") {
      const name = element.name ? element.name.toLowerCase() : "";
      if (name.includes("title") || name.includes("heading")) return "heading";
      if (name.includes("button") || name.includes("btn")) return "interactive";
      return "text";
    }
    
    if (element.type === "FRAME") {
      const name = element.name ? element.name.toLowerCase() : "";
      if (name.includes("header")) return "header";
      if (name.includes("footer")) return "footer";
      if (name.includes("nav") || name.includes("menu")) return "navigation";
      if (name.includes("card")) return "content-card";
      return "container";
    }
    
    return "generic";
  }
  
  /**
   * Перевірка сумісності ролей
   */
  areRolesCompatible(role1, role2) {
    const compatibleRoles = {
      "container": ["section", "content-section"],
      "text": ["generic"],
      "heading": ["text"],
      "interactive": ["generic"]
    };
    
    return compatibleRoles[role1]?.includes(role2) || 
           compatibleRoles[role2]?.includes(role1) || false;
  }
  
  /**
   * Розрахунок схожості контенту
   */
  calculateContentSimilarity(content1, content2) {
    if (!content1 || !content2) return 0;
    
    const c1 = content1.toLowerCase().trim();
    const c2 = content2.toLowerCase().trim();
    
    if (c1 === c2) return 1;
    
    // Простий алгоритм схожості на основі спільних слів
    const words1 = c1.split(/\s+/);
    const words2 = c2.split(/\s+/);
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = Math.max(words1.length, words2.length);
    
    return totalWords > 0 ? commonWords.length / totalWords : 0;
  }
}

class VisualMatching {
  name() { return "visual"; }
  
  findMatches(figmaData, htmlData) {
    const matches = new Map();
    
    // Візуальне співставлення на основі стилів та зовнішнього вигляду
    this.performVisualMatching(figmaData, htmlData, matches);
    
    return matches;
  }
  
  /**
   * Виконання візуального співставлення елементів
   */
  performVisualMatching(figmaData, htmlData, matches) {
    figmaData.hierarchy.forEach((figmaElement, figmaId) => {
      // Пропускаємо вже співставлені елементи
      if (matches.has(figmaId)) return;
      
      let bestMatch = null;
      let bestScore = 0;
      
      htmlData.hierarchy.forEach((htmlElement, htmlId) => {
        // Перевіряємо, чи HTML елемент вже використовується
        const alreadyUsed = Array.from(matches.values()).some(match => 
          match === htmlId || (typeof match === "object" && match.htmlElement === htmlId)
        );
        
        if (!alreadyUsed) {
          const visualScore = this.calculateVisualSimilarity(figmaElement, htmlElement);
          
          if (visualScore > bestScore && visualScore > 0.65) {
            bestScore = visualScore;
            bestMatch = htmlId;
          }
        }
      });
      
      if (bestMatch && bestScore > 0.65) {
        matches.set(figmaId, bestMatch);
      }
    });
  }
  
  /**
   * Розрахунок візуальної схожості між елементами
   */
  calculateVisualSimilarity(figmaElement, htmlElement) {
    let score = 0;
    let maxScore = 0;
    
    // Порівняння розмірів та позицій
    if (figmaElement.styles?.position) {
      const sizeScore = this.compareSizes(figmaElement.styles.position, htmlElement);
      score += sizeScore * 0.3;
      maxScore += 0.3;
    }
    
    // Порівняння кольорів
    if (figmaElement.styles?.colors) {
      const colorScore = this.compareColors(figmaElement.styles.colors, htmlElement);
      score += colorScore * 0.25;
      maxScore += 0.25;
    }
    
    // Порівняння типографіки
    if (figmaElement.styles?.typography) {
      const typographyScore = this.compareTypography(figmaElement.styles.typography, htmlElement);
      score += typographyScore * 0.2;
      maxScore += 0.2;
    }
    
    // Порівняння форми та типу елемента
    const shapeScore = this.compareShape(figmaElement, htmlElement);
    score += shapeScore * 0.15;
    maxScore += 0.15;
    
    // Порівняння ефектів (тіні, закруглення тощо)
    if (figmaElement.styles?.effects) {
      const effectsScore = this.compareEffects(figmaElement.styles.effects, htmlElement);
      score += effectsScore * 0.1;
      maxScore += 0.1;
    }
    
    return maxScore > 0 ? score / maxScore : 0;
  }
  
  /**
   * Порівняння розмірів елементів
   */
  compareSizes(figmaPosition, htmlElement) {
    if (!figmaPosition || !figmaPosition.width || !figmaPosition.height) {
      return 0.5; // Нейтральна оцінка при відсутності даних
    }
    
    const figmaWidth = figmaPosition.width;
    const figmaHeight = figmaPosition.height;
    const figmaAspectRatio = figmaWidth / figmaHeight;
    
    // Визначаємо розмірну категорію за Figma;
    const figmaSize = this.getSizeCategory(figmaWidth, figmaHeight);
    
    // Для HTML елементів використовуємо теги та класи для визначення розмірів
    const htmlSize = this.inferHTMLSize(htmlElement);
    const htmlAspectRatio = this.inferHTMLAspectRatio(htmlElement);
    
    let sizeScore = 0;
    
    // Порівняння категорій розмірів
    if (figmaSize === htmlSize) {
      sizeScore += 0.6;
    } else if (this.areSizeCategoriesCompatible(figmaSize, htmlSize)) {
      sizeScore += 0.4;
    }
    
    // Порівняння пропорцій
    if (htmlAspectRatio > 0 && figmaAspectRatio > 0) {
      const aspectRatioSimilarity = 1 - Math.abs(figmaAspectRatio - htmlAspectRatio) / 
                                    Math.max(figmaAspectRatio, htmlAspectRatio);
      sizeScore += 0.4 * Math.max(0, aspectRatioSimilarity);
    }
    
    return Math.min(sizeScore, 1.0);
  }
  
  /**
   * Порівняння кольорів
   */
  compareColors(figmaColors, htmlElement) {
    if (!Array.isArray(figmaColors) || figmaColors.length === 0) {
      return 0.5;
    }
    
    // Отримуємо основний колір з Figma;
    const primaryFigmaColor = figmaColors.find(c => c.type === "solid" && c.color);
    if (!primaryFigmaColor) {
      return 0.5;
    }
    
    // Визначаємо колірну схему HTML елемента
    const htmlColors = this.inferHTMLColors(htmlElement);
    
    let bestMatch = 0;
    htmlColors.forEach(htmlColor => {
      const similarity = this.calculateColorSimilarity(primaryFigmaColor.color, htmlColor);
      bestMatch = Math.max(bestMatch, similarity);
    });
    
    return bestMatch;
  }
  
  /**
   * Порівняння типографіки
   */
  compareTypography(figmaTypography, htmlElement) {
    if (!figmaTypography) return 0.5;
    
    let score = 0;
    let factors = 0;
    
    // Розмір шрифту
    if (figmaTypography.fontSize) {
      const htmlFontSize = this.inferHTMLFontSize(htmlElement);
      if (htmlFontSize > 0) {
        const sizeSimilarity = 1 - Math.abs(figmaTypography.fontSize - htmlFontSize) / 
                               Math.max(figmaTypography.fontSize, htmlFontSize);
        score += sizeSimilarity * 0.4;
      }
      factors += 0.4;
    }
    
    // Вага шрифту
    if (figmaTypography.fontWeight) {
      const htmlFontWeight = this.inferHTMLFontWeight(htmlElement);
      if (htmlFontWeight > 0) {
        const weightSimilarity = 1 - Math.abs(figmaTypography.fontWeight - htmlFontWeight) / 
                                 Math.max(figmaTypography.fontWeight, htmlFontWeight);
        score += weightSimilarity * 0.3;
      }
      factors += 0.3;
    }
    
    // Висота рядка
    if (figmaTypography.lineHeight) {
      score += 0.2; // Бонус за наявність параметра
      factors += 0.2;
    }
    
    // Назва шрифту
    if (figmaTypography.fontFamily) {
      const fontFamilyMatch = this.compareFontFamilies(
        figmaTypography.fontFamily, 
        htmlElement.tagName, 
        htmlElement.classes || []
      );
      score += fontFamilyMatch * 0.1;
      factors += 0.1;
    }
    
    return factors > 0 ? score / factors : 0.5;
  }
  
  /**
   * Порівняння форми елементів
   */
  compareShape(figmaElement, htmlElement) {
    // Співставлення типів Figma з HTML тегами
    const figmaType = figmaElement.type;
    const htmlTag = htmlElement.tagName?.toLowerCase();
    
    const shapeMapping = {
      "TEXT": ["p", "span", "h1", "h2", "h3", "h4", "h5", "h6", "label"],
      "RECTANGLE": ["div", "section", "article", "button", "input"],
      "FRAME": ["div", "section", "article", "main", "header", "footer", "nav"],
      "IMAGE": ["img", "picture", "figure"],
      "INSTANCE": ["div", "section", "article"]
    };
    
    const expectedTags = shapeMapping[figmaType] || [];
    
    if (expectedTags.includes(htmlTag)) {
      return 1.0;
    }
    
    // Часткові співпадіння
    if (figmaType === "RECTANGLE" && ["span", "a"].includes(htmlTag)) {
      return 0.7;
    }
    
    if (figmaType === "TEXT" && ["div", "button"].includes(htmlTag)) {
      return 0.6;
    }
    
    return 0.3; // Мінімальний бал за невідповідність
  }
  
  /**
   * Порівняння ефектів
   */
  compareEffects(figmaEffects, htmlElement) {
    if (!Array.isArray(figmaEffects) || figmaEffects.length === 0) {
      return 0.5;
    }
    
    let score = 0;
    let effectCount = 0;
    
    figmaEffects.forEach(effect => {
      switch (effect.type) {
      case "DROP_SHADOW":
      case "INNER_SHADOW":
        if (this.hasHTMLShadowEffect(htmlElement)) {
          score += 0.8;
        } else {
          score += 0.3;
        }
        effectCount++;
        break;
          
      case "BLUR":
        if (this.hasHTMLBlurEffect(htmlElement)) {
          score += 0.9;
        } else {
          score += 0.2;
        }
        effectCount++;
        break;
          
      default:
        score += 0.4; // За наявність будь-якого ефекту
        effectCount++;
      }
    });
    
    return effectCount > 0 ? score / effectCount : 0.5;
  }
  
  /**
   * Допоміжні методи для визначення характеристик HTML елементів
   */
  getSizeCategory(width, height) {
    const area = width * height;
    if (area < 1000) return "small";
    if (area < 10000) return "medium";
    return "large";
  }
  
  inferHTMLSize(htmlElement) {
    const tag = htmlElement.tagName?.toLowerCase();
    const classes = htmlElement.classes || [];
    
    // Малі елементи
    if (["span", "i", "b", "small", "sub", "sup"].includes(tag)) return "small";
    if (classes.some(cls => cls.includes("small") || cls.includes("xs"))) return "small";
    
    // Великі елементи
    if (["section", "article", "main", "header", "footer"].includes(tag)) return "large";
    if (classes.some(cls => cls.includes("large") || cls.includes("xl"))) return "large";
    
    return "medium";
  }
  
  inferHTMLAspectRatio(htmlElement) {
    // Спробуємо вивести пропорції з класів або тегів
    const classes = htmlElement.classes || [];
    
    // Квадратні елементи
    if (classes.some(cls => cls.includes("square") || cls.includes("avatar"))) return 1;
    
    // Широкі елементи
    if (classes.some(cls => cls.includes("wide") || cls.includes("banner"))) return 3;
    
    // Високі елементи
    if (classes.some(cls => cls.includes("tall") || cls.includes("sidebar"))) return 0.5;
    
    return 1.5; // Типове співвідношення за замовчуванням
  }
  
  inferHTMLColors(htmlElement) {
    const colors = [];
    const classes = htmlElement.classes || [];
    
    // Вивід кольорів з класів
    const colorKeywords = ["red", "blue", "green", "yellow", "purple", "orange", "gray", "black", "white"];
    colorKeywords.forEach(color => {
      if (classes.some(cls => cls.includes(color))) {
        colors.push(color);
      }
    });
    
    // За замовчуванням
    if (colors.length === 0) {
      colors.push("default");
    }
    
    return colors;
  }
  
  inferHTMLFontSize(htmlElement) {
    const tag = htmlElement.tagName?.toLowerCase();
    
    const fontSizes = {
      "h1": 32, "h2": 28, "h3": 24, "h4": 20, "h5": 18, "h6": 16,
      "p": 16, "span": 14, "small": 12, "button": 16;
    };
    
    return fontSizes[tag] || 16;
  }
  
  inferHTMLFontWeight(htmlElement) {
    const tag = htmlElement.tagName?.toLowerCase();
    const classes = htmlElement.classes || [];
    
    // Жирний шрифт
    if (["h1", "h2", "h3", "h4", "h5", "h6", "b", "strong", "button"].includes(tag)) return 700;
    if (classes.some(cls => cls.includes("bold") || cls.includes("font-bold"))) return 700;
    
    // Легкий шрифт
    if (classes.some(cls => cls.includes("light") || cls.includes("font-light"))) return 300;
    
    return 400; // Звичайна вага
  }
  
  compareFontFamilies(figmaFont, htmlTag, htmlClasses) {
    // Основні категорії шрифтів
    const serifFonts = ["times", "georgia", "serif"];
    const sansSerifFonts = ["arial", "helvetica", "sans-serif", "roboto"];
    const monospaceFonts = ["courier", "monaco", "monospace"];
    
    const figmaCategory = this.getFontCategory(figmaFont);
    const htmlCategory = this.inferHTMLFontCategory(htmlTag, htmlClasses);
    
    return figmaCategory === htmlCategory ? 1.0 : 0.3;
  }
  
  getFontCategory(fontName) {
    const font = fontName.toLowerCase();
    if (font.includes("serif") && !font.includes("sans")) return "serif";
    if (font.includes("mono") || font.includes("courier")) return "monospace";
    return "sans-serif";
  }
  
  inferHTMLFontCategory(tag, classes) {
    if (["code", "pre", "kbd", "samp"].includes(tag)) return "monospace";
    
    if (classes.some(cls => cls.includes("serif"))) return "serif";
    if (classes.some(cls => cls.includes("mono"))) return "monospace";
    
    return "sans-serif";
  }
  
  areSizeCategoriesCompatible(size1, size2) {
    const compatibility = {
      "small": ["medium"],
      "medium": ["small", "large"],
      "large": ["medium"]
    };
    
    return compatibility[size1]?.includes(size2) || false;
  }
  
  calculateColorSimilarity(color1, color2) {
    // Спрощений алгоритм порівняння кольорів
    if (color1 === color2) return 1.0;
    
    // Якщо один з кольорів це ключове слово
    if (typeof color1 === "string" && typeof color2 === "string") {
      return color1.toLowerCase() === color2.toLowerCase() ? 1.0 : 0.2;
    }
    
    return 0.3; // Базова схожість для різних форматів
  }
  
  hasHTMLShadowEffect(htmlElement) {
    const classes = htmlElement.classes || [];
    return classes.some(cls => cls.includes("shadow") || cls.includes("drop-shadow"));
  }
  
  hasHTMLBlurEffect(htmlElement) {
    const classes = htmlElement.classes || [];
    return classes.some(cls => cls.includes("blur") || cls.includes("backdrop-blur"));
  }
}

class ContextualMatching {
  name() { return "contextual"; }
  
  findMatches(figmaData, htmlData) {
    const matches = new Map();
    
    // Контекстне співставлення на основі оточення та структурних зв"язків
    this.performContextualMatching(figmaData, htmlData, matches);
    
    return matches;
  }
  
  /**
   * Виконання контекстного співставлення елементів
   */
  performContextualMatching(figmaData, htmlData, matches) {
    // Створюємо карти контексту для швидкого пошуку
    const figmaContextMap = this.buildContextMap(figmaData.hierarchy);
    const htmlContextMap = this.buildContextMap(htmlData.hierarchy);
    
    // Спочатку знаходимо "якірні" елементи - ті, які мають унікальний контент
    const anchorMatches = this.findAnchorMatches(figmaData, htmlData);
    anchorMatches.forEach((htmlId, figmaId) => {
      matches.set(figmaId, htmlId);
    });
    
    // Використовуємо якірні елементи для поширення співставлень на сусідні елементи
    this.propagateMatchesFromAnchors(figmaData, htmlData, matches, figmaContextMap, htmlContextMap);
    
    // Виконуємо додаткове співставлення на основі групування та послідовності
    this.matchByGroupContext(figmaData, htmlData, matches, figmaContextMap, htmlContextMap);
  }
  
  /**
   * Створення карти контексту для елементів
   */
  buildContextMap(hierarchy) {
    const contextMap = new Map();
    
    hierarchy.forEach((element, id) => {
      const context = {
        siblings: this.findSiblings(element, hierarchy),
        parent: this.findParent(element, hierarchy),
        children: this.findChildren(element, hierarchy),
        position: this.getElementPosition(element),
        surroundingContent: this.extractSurroundingContent(element, hierarchy)
      };
      
      contextMap.set(id, context);
    });
    
    return contextMap;
  }
  
  /**
   * Знаходження якірних елементів з унікальним контентом
   */
  findAnchorMatches(figmaData, htmlData) {
    const anchorMatches = new Map();
    
    // Шукаємо елементи з унікальним текстовим контентом
    const figmaUniqueContent = this.extractUniqueContentElements(figmaData.hierarchy);
    const htmlUniqueContent = this.extractUniqueContentElements(htmlData.hierarchy);
    
    figmaUniqueContent.forEach((figmaElement, content) => {
      if (htmlUniqueContent.has(content)) {
        const htmlElement = htmlUniqueContent.get(content);
        const contextScore = this.calculateContextScore(figmaElement, htmlElement, figmaData, htmlData);
        
        if (contextScore > 0.7) {
          anchorMatches.set(figmaElement.id, htmlElement.id);
        }
      }
    });
    
    return anchorMatches;
  }
  
  /**
   * Поширення співставлень від якірних елементів
   */
  propagateMatchesFromAnchors(figmaData, htmlData, matches, figmaContextMap, htmlContextMap) {
    const processedElements = new Set();
    
    matches.forEach((htmlId, figmaId) => {
      this.propagateFromSingleAnchor(
        figmaId, htmlId, 
        figmaData, htmlData, 
        matches, figmaContextMap, htmlContextMap, 
        processedElements;
      );
    });
  }
  
  /**
   * Поширення від одного якірного елемента
   */
  propagateFromSingleAnchor(figmaId, htmlId, figmaData, htmlData, matches, figmaContextMap, htmlContextMap, processedElements) {
    if (processedElements.has(figmaId)) return;
    processedElements.add(figmaId);
    
    const figmaContext = figmaContextMap.get(figmaId);
    const htmlContext = htmlContextMap.get(htmlId);
    
    if (!figmaContext || !htmlContext) return;
    
    // Співставляємо дочірні елементи
    this.matchChildrenInContext(
      figmaContext.children, htmlContext.children,
      figmaData, htmlData, matches, figmaContextMap, htmlContextMap;
    );
    
    // Співставляємо сусідні елементи
    this.matchSiblingsInContext(
      figmaContext.siblings, htmlContext.siblings,
      figmaData, htmlData, matches, figmaContextMap, htmlContextMap, figmaId, htmlId;
    );
  }
  
  /**
   * Співставлення дочірніх елементів у контексті
   */
  matchChildrenInContext(figmaChildren, htmlChildren, figmaData, htmlData, matches, figmaContextMap, htmlContextMap) {
    if (!figmaChildren || !htmlChildren || figmaChildren.length === 0 || htmlChildren.length === 0) {
      return;
    }
    
    // Створюємо матрицю схожості для дочірніх елементів
    const similarityMatrix = figmaChildren.map((figmaChild, i) => {
      return htmlChildren.map((htmlChild, j) => {
        const alreadyMatched = Array.from(matches.values()).includes(htmlChild.id);
        if (alreadyMatched || matches.has(figmaChild.id)) {
          return -1; // Вже співставлений
        }
        
        return this.calculateContextualSimilarity(figmaChild, htmlChild, figmaData, htmlData);
      });
    });
    
    // Знаходимо найкращі співпадіння
    this.findBestMatches(similarityMatrix, figmaChildren, htmlChildren, matches);
  }
  
  /**
   * Співставлення сусідніх елементів у контексті
   */
  matchSiblingsInContext(figmaSiblings, htmlSiblings, figmaData, htmlData, matches, figmaContextMap, htmlContextMap, anchorFigmaId, anchorHtmlId) {
    if (!figmaSiblings || !htmlSiblings || figmaSiblings.length === 0 || htmlSiblings.length === 0) {
      return;
    }
    
    // Знаходимо позицію якірного елемента серед сусідів
    const figmaAnchorIndex = figmaSiblings.findIndex(s => s.id === anchorFigmaId);
    const htmlAnchorIndex = htmlSiblings.findIndex(s => s.id === anchorHtmlId);
    
    if (figmaAnchorIndex === -1 || htmlAnchorIndex === -1) return;
    
    // Співставляємо елементи до та після якірного елемента
    this.matchSiblingsByPosition(figmaSiblings, htmlSiblings, figmaAnchorIndex, htmlAnchorIndex, figmaData, htmlData, matches);
  }
  
  /**
   * Співставлення сусідів за позицією
   */
  matchSiblingsByPosition(figmaSiblings, htmlSiblings, figmaAnchorIndex, htmlAnchorIndex, figmaData, htmlData, matches) {
    // Співставляємо елементи ліворуч від якоря
    for (let offset = 1; offset <= Math.min(figmaAnchorIndex, htmlAnchorIndex); offset++) {
      const figmaIndex = figmaAnchorIndex - offset;
      const htmlIndex = htmlAnchorIndex - offset;
      
      if (figmaIndex >= 0 && htmlIndex >= 0) {
        const figmaSibling = figmaSiblings[figmaIndex];
        const htmlSibling = htmlSiblings[htmlIndex];
        
        if (!matches.has(figmaSibling.id) && !Array.from(matches.values()).includes(htmlSibling.id)) {
          const similarity = this.calculateContextualSimilarity(figmaSibling, htmlSibling, figmaData, htmlData);
          if (similarity > 0.6) {
            matches.set(figmaSibling.id, htmlSibling.id);
          }
        }
      }
    }
    
    // Співставляємо елементи праворуч від якоря
    const maxRightOffset = Math.min(figmaSiblings.length - figmaAnchorIndex - 1, htmlSiblings.length - htmlAnchorIndex - 1);
    for (let offset = 1; offset <= maxRightOffset; offset++) {
      const figmaIndex = figmaAnchorIndex + offset;
      const htmlIndex = htmlAnchorIndex + offset;
      
      if (figmaIndex < figmaSiblings.length && htmlIndex < htmlSiblings.length) {
        const figmaSibling = figmaSiblings[figmaIndex];
        const htmlSibling = htmlSiblings[htmlIndex];
        
        if (!matches.has(figmaSibling.id) && !Array.from(matches.values()).includes(htmlSibling.id)) {
          const similarity = this.calculateContextualSimilarity(figmaSibling, htmlSibling, figmaData, htmlData);
          if (similarity > 0.6) {
            matches.set(figmaSibling.id, htmlSibling.id);
          }
        }
      }
    }
  }
  
  /**
   * Співставлення за груповим контекстом
   */
  matchByGroupContext(figmaData, htmlData, matches, figmaContextMap, htmlContextMap) {
    // Знаходимо групи елементів з подібними характеристиками
    const figmaGroups = this.identifyElementGroups(figmaData.hierarchy, figmaContextMap);
    const htmlGroups = this.identifyElementGroups(htmlData.hierarchy, htmlContextMap);
    
    // Співставляємо групи за схожістю
    figmaGroups.forEach(figmaGroup => {
      const bestMatchingGroup = this.findBestMatchingGroup(figmaGroup, htmlGroups);
      if (bestMatchingGroup) {
        this.matchElementsInGroups(figmaGroup, bestMatchingGroup, matches, figmaData, htmlData);
      }
    });
  }
  
  /**
   * Розрахунок контекстної схожості
   */
  calculateContextualSimilarity(figmaElement, htmlElement, figmaData, htmlData) {
    let score = 0;
    let maxScore = 0;
    
    // Схожість контенту
    if (figmaElement.content && htmlElement.textContent) {
      const contentSim = this.calculateContentSimilarity(figmaElement.content, htmlElement.textContent);
      score += contentSim * 0.4;
      maxScore += 0.4;
    }
    
    // Схожість типу елемента
    const typeSim = this.calculateTypeSimilarity(figmaElement, htmlElement);
    score += typeSim * 0.3;
    maxScore += 0.3;
    
    // Позиційна схожість у контексті батьківського елемента
    const positionSim = this.calculateRelativePositionSimilarity(figmaElement, htmlElement);
    score += positionSim * 0.2;
    maxScore += 0.2;
    
    // Схожість оточуючого контексту
    const contextSim = this.calculateSurroundingContextSimilarity(figmaElement, htmlElement, figmaData, htmlData);
    score += contextSim * 0.1;
    maxScore += 0.1;
    
    return maxScore > 0 ? score / maxScore : 0;
  }
  
  /**
   * Допоміжні методи
   */
  findSiblings(element, hierarchy) {
    if (!element.path) return [];
    
    const pathParts = element.path.split("/");
    if (pathParts.length < 2) return [];
    
    const parentPath = pathParts.slice(0, -1).join("/");
    const siblings = [];
    
    hierarchy.forEach((el, id) => {
      if (el.path && el.path !== element.path) {
        const elPathParts = el.path.split("/");
        if (elPathParts.length === pathParts.length) {
          const elParentPath = elPathParts.slice(0, -1).join("/");
          if (elParentPath === parentPath) {
            siblings.push({...el, id});
          }
        }
      }
    });
    
    return siblings;
  }
  
  findParent(element, hierarchy) {
    if (!element.path || !element.path.includes("/")) return null;
    
    const pathParts = element.path.split("/");
    if (pathParts.length < 2) return null;
    
    const parentPath = pathParts.slice(0, -1).join("/");
    
    for (const [id, el] of hierarchy) {
      if (el.path === parentPath) {
        return {...el, id};
      }
    }
    
    return null;
  }
  
  findChildren(element, hierarchy) {
    if (!element.path) return [];
    
    const children = [];
    const targetDepth = element.path.split("/").length + 1;
    
    hierarchy.forEach((el, id) => {
      if (el.path && el.path.startsWith(element.path + "/")) {
        const elDepth = el.path.split("/").length;
        if (elDepth === targetDepth) {
          children.push({...el, id});
        }
      }
    });
    
    return children;
  }
  
  getElementPosition(element) {
    if (!element.path) return 0;
    
    const pathParts = element.path.split("/");
    const lastPart = pathParts[pathParts.length - 1];
    
    // Спробуємо витягти числову позицію з кінця шляху
    const match = lastPart.match(/(\d+)$/);
    return match ? parseInt(match[1]) : 0;
  }
  
  extractSurroundingContent(element, hierarchy) {
    const siblings = this.findSiblings(element, hierarchy);
    return siblings.map(sibling => sibling.content || sibling.name || "").filter(Boolean).join(" ");
  }
  
  extractUniqueContentElements(hierarchy) {
    const contentMap = new Map();
    const uniqueContent = new Map();
    
    // Підраховуємо частоту контенту
    hierarchy.forEach((element, id) => {
      const content = this.normalizeContent(element.content || element.name || "");
      if (content && content.length > 2) {
        const count = contentMap.get(content) || 0;
        contentMap.set(content, count + 1);
      }
    });
    
    // Залишаємо тільки унікальний контент
    hierarchy.forEach((element, id) => {
      const content = this.normalizeContent(element.content || element.name || "");
      if (content && contentMap.get(content) === 1) {
        uniqueContent.set(content, {...element, id});
      }
    });
    
    return uniqueContent;
  }
  
  normalizeContent(content) {
    return content.toLowerCase().replace(/\s+/g, " ").trim();
  }
  
  calculateContextScore(figmaElement, htmlElement, figmaData, htmlData) {
    // Базовий розрахунок схожості для якірних елементів
    return this.calculateContextualSimilarity(figmaElement, htmlElement, figmaData, htmlData);
  }
  
  calculateContentSimilarity(content1, content2) {
    const c1 = this.normalizeContent(content1);
    const c2 = this.normalizeContent(content2);
    
    if (c1 === c2) return 1;
    if (!c1 || !c2) return 0;
    
    const words1 = c1.split(" ");
    const words2 = c2.split(" ");
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = Math.max(words1.length, words2.length);
    
    return totalWords > 0 ? commonWords.length / totalWords : 0;
  }
  
  calculateTypeSimilarity(figmaElement, htmlElement) {
    const figmaType = figmaElement.type;
    const htmlTag = htmlElement.tagName?.toLowerCase();
    
    // Основні співставлення типів
    const typeMapping = {
      "TEXT": 0.8,
      "FRAME": 0.7,
      "RECTANGLE": 0.6,
      "IMAGE": 0.9;
    };
    
    if (figmaType === "TEXT" && ["p", "span", "h1", "h2", "h3", "h4", "h5", "h6"].includes(htmlTag)) return 1.0;
    if (figmaType === "IMAGE" && ["img", "picture"].includes(htmlTag)) return 1.0;
    if (figmaType === "FRAME" && ["div", "section", "article"].includes(htmlTag)) return 0.9;
    
    return typeMapping[figmaType] || 0.5;
  }
  
  calculateRelativePositionSimilarity(figmaElement, htmlElement) {
    const figmaPos = this.getElementPosition(figmaElement);
    const htmlPos = this.getElementPosition(htmlElement);
    
    if (figmaPos === htmlPos) return 1.0;
    if (Math.abs(figmaPos - htmlPos) <= 1) return 0.8;
    if (Math.abs(figmaPos - htmlPos) <= 2) return 0.6;
    
    return 0.3;
  }
  
  calculateSurroundingContextSimilarity(figmaElement, htmlElement, figmaData, htmlData) {
    // Спрощена оцінка схожості оточуючого контексту
    const figmaSurrounding = this.extractSurroundingContent(figmaElement, figmaData.hierarchy);
    const htmlSurrounding = this.extractSurroundingContent(htmlElement, htmlData.hierarchy);
    
    if (!figmaSurrounding && !htmlSurrounding) return 0.5;
    if (!figmaSurrounding || !htmlSurrounding) return 0.2;
    
    return this.calculateContentSimilarity(figmaSurrounding, htmlSurrounding);
  }
  
  findBestMatches(similarityMatrix, figmaElements, htmlElements, matches) {
    // Жадібний алгоритм для знаходження найкращих співпадінь
    const usedHtml = new Set();
    const usedFigma = new Set();
    
    // Сортуємо всі можливі співпадіння за схожістю
    const allMatches = [];
    for (let i = 0; i < similarityMatrix.length; i++) {
      for (let j = 0; j < similarityMatrix[i].length; j++) {
        if (similarityMatrix[i][j] > 0.6) {
          allMatches.push({
            figmaIndex: i,
            htmlIndex: j,
            similarity: similarityMatrix[i][j]
          });
        }
      }
    }
    
    allMatches.sort((a, b) => b.similarity - a.similarity);
    
    // Обираємо найкращі не конфліктні співпадіння
    allMatches.forEach(match => {
      if (!usedFigma.has(match.figmaIndex) && !usedHtml.has(match.htmlIndex)) {
        const figmaElement = figmaElements[match.figmaIndex];
        const htmlElement = htmlElements[match.htmlIndex];
        
        matches.set(figmaElement.id, htmlElement.id);
        usedFigma.add(match.figmaIndex);
        usedHtml.add(match.htmlIndex);
      }
    });
  }
  
  identifyElementGroups(hierarchy, contextMap) {
    // Спрощена ідентифікація груп - групуємо за типом та батьківським елементом
    const groups = new Map();
    
    hierarchy.forEach((element, id) => {
      const context = contextMap.get(id);
      const parentId = context?.parent?.id || "root";
      const groupKey = `${parentId}_${element.type || "unknown"}`;
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      
      groups.get(groupKey).push({...element, id});
    });
    
    // Повертаємо тільки групи з більш ніж одним елементом
    return Array.from(groups.values()).filter(group => group.length > 1);
  }
  
  findBestMatchingGroup(figmaGroup, htmlGroups) {
    let bestMatch = null;
    let bestScore = 0;
    
    htmlGroups.forEach(htmlGroup => {
      const score = this.calculateGroupSimilarity(figmaGroup, htmlGroup);
      if (score > bestScore && score > 0.6) {
        bestScore = score;
        bestMatch = htmlGroup;
      }
    });
    
    return bestMatch;
  }
  
  calculateGroupSimilarity(group1, group2) {
    if (group1.length !== group2.length) {
      const sizeSimilarity = Math.min(group1.length, group2.length) / Math.max(group1.length, group2.length);
      if (sizeSimilarity < 0.5) return 0;
    }
    
    // Порівняння типів елементів у групах
    const types1 = group1.map(el => el.type).sort();
    const types2 = group2.map(el => el.tagName?.toLowerCase() || "unknown").sort();
    
    const commonTypes = types1.filter(type => types2.includes(type)).length;
    const totalTypes = Math.max(types1.length, types2.length);
    
    return totalTypes > 0 ? commonTypes / totalTypes : 0;
  }
  
  matchElementsInGroups(figmaGroup, htmlGroup, matches, figmaData, htmlData) {
    const minLength = Math.min(figmaGroup.length, htmlGroup.length);
    
    for (let i = 0; i < minLength; i++) {
      const figmaElement = figmaGroup[i];
      const htmlElement = htmlGroup[i];
      
      if (!matches.has(figmaElement.id) && !Array.from(matches.values()).includes(htmlElement.id)) {
        const similarity = this.calculateContextualSimilarity(figmaElement, htmlElement, figmaData, htmlData);
        if (similarity > 0.6) {
          matches.set(figmaElement.id, htmlElement.id);
        }
      }
    }
  }
}

module.exports = StyleMatcher;
