/**
 * Модуль ієрархічного співставлення HTML-Figma
 * Забезпечує точне співставлення елементів на основі ієрархічної структури
 * @version 3.0.0
 */

class HierarchyMatcher {
  constructor(options = {}) {
    this.options = {
      depthWeight: options.depthWeight || 0.3,
      positionWeight: options.positionWeight || 0.2,
      contentWeight: options.contentWeight || 0.25,
      semanticWeight: options.semanticWeight || 0.25,
      ...options
    };
    
    this.matches = new Map();
    this.unmatchedFigma = new Set();
    this.unmatchedHTML = new Set();
    this.statistics = {
      totalMatches: 0,
      successfulMatches: 0,
      averageConfidence: 0,
      depthAccuracy: 0,
      positionAccuracy: 0
    };
  }

  /**
   * Основний метод ієрархічного співставлення
   */
  matchHierarchy(figmaData, htmlData) {
    this.reset();
    
    // Створення ієрархічних дерев
    const figmaTree = this.buildHierarchyTree(figmaData);
    const htmlTree = this.buildHierarchyTree(htmlData);
    // Зберігаємо контекст дерев для допоміжних методів
    this.currentTrees = { figma: figmaTree, html: htmlTree };
    
    // Співставлення на рівні кореня
    this.matchRootLevel(figmaTree, htmlTree);
    
    // Рекурсивне співставлення дітей
    this.matchChildren(figmaTree, htmlTree);
    
    // Обробка неспівставлених елементів
    this.handleUnmatchedElements(figmaData, htmlData);
    
    // Розрахунок статистики
    this.calculateStatistics();
    
    return {
      matches: this.matches,
      unmatchedFigma: Array.from(this.unmatchedFigma),
      unmatchedHTML: Array.from(this.unmatchedHTML),
      statistics: this.statistics
    };
  }

  /**
   * Побудова ієрархічного дерева
   */
  buildHierarchyTree(data) {
    const tree = {
      root: null,
      nodes: new Map(),
      depth: 0,
      maxDepth: 0
    };
    
    // Знаходження кореня
    data.hierarchy.forEach((element, id) => {
      if (!element.parent) {
        tree.root = element;
      }
      tree.nodes.set(id, element);
    });
    
    // Розрахунок глибини
    this.calculateTreeDepth(tree);
    
    return tree;
  }

  /**
   * Розрахунок глибини дерева
   */
  calculateTreeDepth(tree) {
    let maxDepth = 0;
    
    tree.nodes.forEach(element => {
      const depth = this.calculateElementDepth(element, tree.nodes);
      element.treeDepth = depth;
      maxDepth = Math.max(maxDepth, depth);
    });
    
    tree.maxDepth = maxDepth;
  }

  /**
   * Розрахунок глибини елемента
   */
  calculateElementDepth(element, nodes) {
    if (!element.parent) return 0;
    
    const parent = nodes.get(element.parent);
    if (!parent) return 0;
    
    return 1 + this.calculateElementDepth(parent, nodes);
  }

  /**
   * Співставлення на рівні кореня
   */
  matchRootLevel(figmaTree, htmlTree) {
    if (!figmaTree.root || !htmlTree.root) return;
    
    const confidence = this.calculateMatchConfidence(
      figmaTree.root,
      htmlTree.root,
      'root'
    );
    
    if (confidence >= 0.7) {
      this.addMatch(figmaTree.root.id, htmlTree.root.id, confidence, 'root');
    }
  }

  /**
   * Рекурсивне співставлення дітей
   */
  matchChildren(figmaTree, htmlTree) {
    // Групування елементів за глибиною
    const figmaByDepth = this.groupByDepth(figmaTree);
    const htmlByDepth = this.groupByDepth(htmlTree);
    
    // Співставлення по рівнях
    for (let depth = 1; depth <= Math.min(figmaTree.maxDepth, htmlTree.maxDepth); depth++) {
      const figmaElements = figmaByDepth.get(depth) || [];
      const htmlElements = htmlByDepth.get(depth) || [];
      
      this.matchElementsAtDepth(figmaElements, htmlElements, depth);
    }
  }

  /**
   * Групування елементів за глибиною
   */
  groupByDepth(tree) {
    const groups = new Map();
    
    tree.nodes.forEach(element => {
      const depth = element.treeDepth || 0;
      if (!groups.has(depth)) {
        groups.set(depth, []);
      }
      groups.get(depth).push(element);
    });
    
    return groups;
  }

  /**
   * Співставлення елементів на конкретній глибині
   */
  matchElementsAtDepth(figmaElements, htmlElements, depth) {
    // Створення матриці схожості
    const similarityMatrix = this.createSimilarityMatrix(figmaElements, htmlElements);
    
    // Використання алгоритму максимального паросполучення
    const matches = this.findMaximumMatching(similarityMatrix);
    
    // Додавання знайдених співставлень
    matches.forEach(({ figmaIndex, htmlIndex, confidence }) => {
      const figmaElement = figmaElements[figmaIndex];
      const htmlElement = htmlElements[htmlIndex];
      
      this.addMatch(figmaElement.id, htmlElement.id, confidence, `depth-${depth}`);
    });
  }

  /**
   * Створення матриці схожості
   */
  createSimilarityMatrix(figmaElements, htmlElements) {
    const matrix = [];
    
    figmaElements.forEach((figmaElement, figmaIndex) => {
      const row = [];
      htmlElements.forEach((htmlElement, htmlIndex) => {
        const similarity = this.calculateElementSimilarity(figmaElement, htmlElement);
        row.push(similarity);
      });
      matrix.push(row);
    });
    
    return matrix;
  }

  /**
   * Розрахунок схожості елементів
   */
  calculateElementSimilarity(figmaElement, htmlElement) {
    let totalScore = 0;
    let maxScore = 0;
    
    // Схожість за глибиною
    const depthScore = this.calculateDepthSimilarity(figmaElement, htmlElement);
    totalScore += depthScore * this.options.depthWeight;
    maxScore += this.options.depthWeight;
    
    // Схожість за позицією
    const positionScore = this.calculatePositionSimilarity(figmaElement, htmlElement);
    totalScore += positionScore * this.options.positionWeight;
    maxScore += this.options.positionWeight;
    
    // Схожість за контентом
    const contentScore = this.calculateContentSimilarity(figmaElement, htmlElement);
    totalScore += contentScore * this.options.contentWeight;
    maxScore += this.options.contentWeight;
    
    // Схожість за семантикою
    const semanticScore = this.calculateSemanticSimilarity(figmaElement, htmlElement);
    totalScore += semanticScore * this.options.semanticWeight;
    maxScore += this.options.semanticWeight;
    
    return maxScore > 0 ? totalScore / maxScore : 0;
  }

  /**
   * Розрахунок схожості за глибиною
   */
  calculateDepthSimilarity(figmaElement, htmlElement) {
    const figmaDepth = figmaElement.treeDepth || 0;
    const htmlDepth = htmlElement.level || 0;
    
    if (figmaDepth === htmlDepth) return 1;
    
    const depthDiff = Math.abs(figmaDepth - htmlDepth);
    const maxDepth = Math.max(figmaDepth, htmlDepth);
    
    return maxDepth > 0 ? 1 - (depthDiff / maxDepth) : 0;
  }

  /**
   * Розрахунок схожості за позицією
   */
  calculatePositionSimilarity(figmaElement, htmlElement) {
    // Порівняння позиції в ієрархії
    const figmaPosition = this.calculateElementPosition(figmaElement);
    const htmlPosition = this.calculateElementPosition(htmlElement);
    
    if (figmaPosition === htmlPosition) return 1;
    
    const positionDiff = Math.abs(figmaPosition - htmlPosition);
    const maxPosition = Math.max(figmaPosition, htmlPosition);
    
    return maxPosition > 0 ? 1 - (positionDiff / maxPosition) : 0;
  }

  /**
   * Розрахунок схожості за контентом
   */
  calculateContentSimilarity(figmaElement, htmlElement) {
    const figmaContent = figmaElement.content?.text || '';
    const htmlContent = htmlElement.textContent || '';
    
    if (!figmaContent && !htmlContent) return 1;
    if (!figmaContent || !htmlContent) return 0;
    
    const normalizedFigma = this.normalizeText(figmaContent);
    const normalizedHTML = this.normalizeText(htmlContent);
    
    if (normalizedFigma === normalizedHTML) return 1;
    
    const distance = this.levenshteinDistance(normalizedFigma, normalizedHTML);
    const maxLength = Math.max(normalizedFigma.length, normalizedHTML.length);
    
    return maxLength > 0 ? 1 - (distance / maxLength) : 0;
  }

  /**
   * Розрахунок схожості за семантикою
   */
  calculateSemanticSimilarity(figmaElement, htmlElement) {
    const figmaRole = this.getFigmaSemanticRole(figmaElement);
    const htmlRole = htmlElement.semanticRole;
    
    if (figmaRole === htmlRole) return 1;
    
    // Часткове співпадіння
    return this.calculateRoleSimilarity(figmaRole, htmlRole);
  }

  /**
   * Розрахунок позиції елемента
   */
  calculateElementPosition(element) {
    // Позиція в межах батьківського елемента
    if (element.parent) {
      const parent = this.findParent(element);
      if (parent && Array.isArray(parent.children)) {
        const idx = parent.children.indexOf(element.id);
        return idx >= 0 ? idx : 0;
      }
    }
    return 0;
  }

  /**
   * Пошук батьківського елемента
   */
  findParent(element) {
    // Визначаємо дерево, до якого належить елемент, і повертаємо батька за id
    const parentId = element.parent;
    if (!parentId) return null;

    // Спроба у Figma дереві
    if (this.currentTrees && this.currentTrees.figma && this.currentTrees.figma.nodes.has(parentId)) {
      return this.currentTrees.figma.nodes.get(parentId);
    }
    // Спроба у HTML дереві
    if (this.currentTrees && this.currentTrees.html && this.currentTrees.html.nodes.has(parentId)) {
      return this.currentTrees.html.nodes.get(parentId);
    }
    return null;
  }

  /**
   * Алгоритм максимального паросполучення
   */
  findMaximumMatching(similarityMatrix) {
    const matches = [];
    const used = new Set();
    const threshold = 0.6; // Мінімальна схожість
    
    // Простий жадібний алгоритм
    for (let i = 0; i < similarityMatrix.length; i++) {
      let bestMatch = -1;
      let bestScore = 0;
      
      for (let j = 0; j < similarityMatrix[i].length; j++) {
        if (!used.has(j) && similarityMatrix[i][j] > bestScore && similarityMatrix[i][j] >= threshold) {
          bestScore = similarityMatrix[i][j];
          bestMatch = j;
        }
      }
      
      if (bestMatch >= 0) {
        matches.push({
          figmaIndex: i,
          htmlIndex: bestMatch,
          confidence: bestScore
        });
        used.add(bestMatch);
      }
    }
    
    return matches;
  }

  /**
   * Обробка неспівставлених елементів
   */
  handleUnmatchedElements(figmaData, htmlData) {
    // Знаходження неспівставлених Figma елементів
    figmaData.hierarchy.forEach((element, id) => {
      if (!this.matches.has(id)) {
        this.unmatchedFigma.add(id);
      }
    });
    
    // Знаходження неспівставлених HTML елементів
    htmlData.hierarchy.forEach((element, id) => {
      if (!Array.from(this.matches.values()).some(match => match.htmlElement === id)) {
        this.unmatchedHTML.add(id);
      }
    });
  }

  /**
   * Додавання співставлення
   */
  addMatch(figmaElementId, htmlElementId, confidence, strategy) {
    this.matches.set(figmaElementId, {
      htmlElement: htmlElementId,
      confidence,
      strategy,
      timestamp: Date.now()
    });
  }

  /**
   * Розрахунок впевненості в співставленні
   */
  calculateMatchConfidence(figmaElement, htmlElement, strategy) {
    const similarity = this.calculateElementSimilarity(figmaElement, htmlElement);
    const strategyBonus = this.getStrategyBonus(strategy);
    
    return Math.min(similarity + strategyBonus, 1.0);
  }

  /**
   * Бонус за стратегію
   */
  getStrategyBonus(strategy) {
    const bonuses = {
      'root': 0.2,
      'depth-1': 0.15,
      'depth-2': 0.1,
      'depth-3': 0.05,
      'content': 0.1,
      'semantic': 0.15
    };
    
    return bonuses[strategy] || 0;
  }

  /**
   * Розрахунок статистики
   */
  calculateStatistics() {
    this.statistics.totalMatches = this.matches.size;
    this.statistics.successfulMatches = this.matches.size;
    
    if (this.matches.size > 0) {
      const totalConfidence = Array.from(this.matches.values())
        .reduce((sum, match) => sum + match.confidence, 0);
      this.statistics.averageConfidence = totalConfidence / this.matches.size;
    }
    
    // Розрахунок точності за глибиною та позицією
    this.calculateAccuracyMetrics();
  }

  /**
   * Розрахунок метрик точності
   */
  calculateAccuracyMetrics() {
    let depthMatches = 0;
    let positionMatches = 0;
    let totalMatches = 0;
    
    this.matches.forEach(() => {
      // Тут має бути логіка для перевірки точності
      // Це залежить від структури даних
      totalMatches++;
    });
    
    this.statistics.depthAccuracy = totalMatches > 0 ? depthMatches / totalMatches : 0;
    this.statistics.positionAccuracy = totalMatches > 0 ? positionMatches / totalMatches : 0;
  }

  /**
   * Допоміжні методи
   */
  normalizeText(text) {
    return text.toLowerCase().replace(/\s+/g, ' ').trim();
  }

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

  getFigmaSemanticRole(element) {
    const name = element.name ? element.name.toLowerCase() : '';
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

  calculateRoleSimilarity(role1, role2) {
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
    
    const maxLevel = Math.max(level1, level2);
    return maxLevel > 0 ? 1 - Math.abs(level1 - level2) / maxLevel : 0;
  }

  /**
   * Скидання матчера
   */
  reset() {
    this.matches.clear();
    this.unmatchedFigma.clear();
    this.unmatchedHTML.clear();
    this.statistics = {
      totalMatches: 0,
      successfulMatches: 0,
      averageConfidence: 0,
      depthAccuracy: 0,
      positionAccuracy: 0
    };
  }

  /**
   * Отримання статистики
   */
  getStatistics() {
    return { ...this.statistics };
  }
}

module.exports = HierarchyMatcher;
