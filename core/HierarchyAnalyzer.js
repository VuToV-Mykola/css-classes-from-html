/**
 * @module HierarchyAnalyzer
 * @description Аналіз та порівняння ієрархічних структур Figma та HTML
 * @author Ukrainian Developer
 * @version 2.0.0
 */

class HierarchyAnalyzer {
  constructor() {
    this.depthCache = new WeakMap(); // Кешування глибини для оптимізації
    this.pathCache = new WeakMap(); // Кешування шляхів
    this.similarityThreshold = 0.75; // Поріг схожості структур
  }

  /**
   * Аналіз повної ієрархії документа
   * @param {Map} hierarchy - Ієрархічна структура
   * @returns {Object} Детальний аналіз структури
   */
  analyzeHierarchy(hierarchy) {
    const analysis = {
      totalNodes: hierarchy.size,
      maxDepth: 0,
      avgChildrenCount: 0,
      leafNodes: 0,
      branchNodes: 0,
      depthDistribution: new Map(),
      typeDistribution: new Map(),
      complexityScore: 0
    };

    let totalChildren = 0;

    hierarchy.forEach((node, nodeId) => {
      const depth = this.calculateNodeDepth(node);
      const childrenCount = node.children?.length || 0;

      // Оновлення статистики
      analysis.maxDepth = Math.max(analysis.maxDepth, depth);
      totalChildren += childrenCount;

      // Розподіл за глибиною
      const depthCount = analysis.depthDistribution.get(depth) || 0;
      analysis.depthDistribution.set(depth, depthCount + 1);

      // Класифікація вузлів
      if (childrenCount === 0) {
        analysis.leafNodes++;
      } else {
        analysis.branchNodes++;
      }

      // Розподіл за типами
      const nodeType = node.type || node.tagName || 'unknown';
      const typeCount = analysis.typeDistribution.get(nodeType) || 0;
      analysis.typeDistribution.set(nodeType, typeCount + 1);
    });

    // Розрахунки
    analysis.avgChildrenCount = analysis.branchNodes > 0 
      ? totalChildren / analysis.branchNodes 
      : 0;
    
    analysis.complexityScore = this.calculateComplexityScore(analysis);

    return analysis;
  }

  /**
   * Порівняння двох ієрархічних структур
   * @param {Map} hierarchy1 - Перша структура
   * @param {Map} hierarchy2 - Друга структура
   * @returns {Object} Результати порівняння
   */
  compareHierarchies(hierarchy1, hierarchy2) {
    const analysis1 = this.analyzeHierarchy(hierarchy1);
    const analysis2 = this.analyzeHierarchy(hierarchy2);

    const comparison = {
      structuralSimilarity: 0,
      depthSimilarity: 0,
      typeSimilarity: 0,
      sizeSimilarity: 0,
      overallSimilarity: 0,
      recommendations: []
    };

    // Порівняння розмірів
    comparison.sizeSimilarity = 1 - Math.abs(analysis1.totalNodes - analysis2.totalNodes) 
      / Math.max(analysis1.totalNodes, analysis2.totalNodes);

    // Порівняння глибини
    comparison.depthSimilarity = 1 - Math.abs(analysis1.maxDepth - analysis2.maxDepth) 
      / Math.max(analysis1.maxDepth, analysis2.maxDepth);

    // Порівняння типів
    comparison.typeSimilarity = this.compareTypeDistributions(
      analysis1.typeDistribution,
      analysis2.typeDistribution
    );

    // Структурна схожість
    comparison.structuralSimilarity = this.calculateStructuralSimilarity(
      hierarchy1,
      hierarchy2
    );

    // Загальна схожість (зважена)
    comparison.overallSimilarity = (
      comparison.structuralSimilarity * 0.4 +
      comparison.depthSimilarity * 0.2 +
      comparison.typeSimilarity * 0.2 +
      comparison.sizeSimilarity * 0.2
    );

    // Рекомендації
    comparison.recommendations = this.generateRecommendations(
      comparison,
      analysis1,
      analysis2
    );

    return comparison;
  }

  /**
   * Пошук найближчого вузла в ієрархії
   * @param {Object} targetNode - Цільовий вузол
   * @param {Map} hierarchy - Ієрархія для пошуку
   * @returns {Object|null} Найближчий вузол
   */
  findClosestNode(targetNode, hierarchy) {
    let bestMatch = null;
    let bestScore = 0;

    hierarchy.forEach((node, nodeId) => {
      const similarity = this.calculateNodeSimilarity(targetNode, node);
      
      if (similarity > bestScore && similarity > this.similarityThreshold) {
        bestScore = similarity;
        bestMatch = { node, id: nodeId, similarity };
      }
    });

    return bestMatch;
  }

  /**
   * Побудова шляху до вузла
   * @param {Object} node - Вузол
   * @param {Map} hierarchy - Ієрархія
   * @returns {Array} Масив шляху
   */
  buildNodePath(node, hierarchy) {
    // Перевірка кешу
    if (this.pathCache.has(node)) {
      return this.pathCache.get(node);
    }

    const path = [];
    let current = node;

    while (current) {
      path.unshift(current.name || current.id);
      
      if (current.parent) {
        current = hierarchy.get(current.parent);
      } else {
        break;
      }
    }

    // Збереження в кеш
    this.pathCache.set(node, path);
    return path;
  }

  /**
   * Аналіз батьківсько-дочірніх відносин
   * @param {Map} hierarchy - Ієрархія
   * @returns {Object} Аналіз відносин
   */
  analyzeRelationships(hierarchy) {
    const relationships = {
      parentChildPairs: [],
      siblingGroups: new Map(),
      orphanNodes: [],
      rootNodes: []
    };

    hierarchy.forEach((node, nodeId) => {
      // Кореневі вузли
      if (!node.parent) {
        relationships.rootNodes.push(nodeId);
      }

      // Батько-дитина
      if (node.children && node.children.length > 0) {
        node.children.forEach(childId => {
          relationships.parentChildPairs.push({
            parent: nodeId,
            child: childId
          });
        });

        // Групи сіблінгів
        if (node.children.length > 1) {
          relationships.siblingGroups.set(nodeId, node.children);
        }
      }

      // Вузли-сироти (без батьків і дітей)
      if (!node.parent && (!node.children || node.children.length === 0)) {
        relationships.orphanNodes.push(nodeId);
      }
    });

    return relationships;
  }

  /**
   * Оптимізація ієрархії
   * @param {Map} hierarchy - Вхідна ієрархія
   * @returns {Map} Оптимізована ієрархія
   */
  optimizeHierarchy(hierarchy) {
    const optimized = new Map();

    hierarchy.forEach((node, nodeId) => {
      const optimizedNode = { ...node };

      // Видалення порожніх контейнерів
      if (this.isEmptyContainer(node)) {
        return; // Пропускаємо порожні контейнери
      }

      // Злиття однодітніх вузлів
      if (node.children?.length === 1 && this.canMergeNodes(node)) {
        const childId = node.children[0];
        const child = hierarchy.get(childId);
        
        if (child) {
          // Об'єднання властивостей
          optimizedNode.merged = true;
          optimizedNode.originalChild = childId;
          optimizedNode.children = child.children || [];
        }
      }

      optimized.set(nodeId, optimizedNode);
    });

    return optimized;
  }

  /**
   * Пошук патернів у ієрархії
   * @param {Map} hierarchy - Ієрархія
   * @returns {Array} Знайдені патерни
   */
  findPatterns(hierarchy) {
    const patterns = [];
    const visited = new Set();

    hierarchy.forEach((node, nodeId) => {
      if (visited.has(nodeId)) return;

      const pattern = this.detectPattern(node, hierarchy);
      
      if (pattern) {
        patterns.push(pattern);
        pattern.nodes.forEach(id => visited.add(id));
      }
    });

    return patterns;
  }

  // === Приватні методи ===

  /**
   * Розрахунок глибини вузла
   */
  calculateNodeDepth(node) {
    if (this.depthCache.has(node)) {
      return this.depthCache.get(node);
    }

    const depth = node.path ? node.path.split('/').length : 0;
    this.depthCache.set(node, depth);
    return depth;
  }

  /**
   * Розрахунок складності структури
   */
  calculateComplexityScore(analysis) {
    const depthFactor = Math.log2(analysis.maxDepth + 1);
    const sizeFactor = Math.log10(analysis.totalNodes + 1);
    const branchingFactor = analysis.avgChildrenCount / 10;
    const typeDiversityFactor = analysis.typeDistribution.size / 20;

    return (depthFactor + sizeFactor + branchingFactor + typeDiversityFactor) / 4;
  }

  /**
   * Порівняння розподілів типів
   */
  compareTypeDistributions(dist1, dist2) {
    const allTypes = new Set([...dist1.keys(), ...dist2.keys()]);
    let similarity = 0;

    allTypes.forEach(type => {
      const count1 = dist1.get(type) || 0;
      const count2 = dist2.get(type) || 0;
      const maxCount = Math.max(count1, count2);
      
      if (maxCount > 0) {
        similarity += 1 - Math.abs(count1 - count2) / maxCount;
      }
    });

    return similarity / allTypes.size;
  }

  /**
   * Розрахунок структурної схожості
   */
  calculateStructuralSimilarity(hierarchy1, hierarchy2) {
    let matchedPairs = 0;
    let totalPairs = 0;

    hierarchy1.forEach((node1) => {
      const match = this.findClosestNode(node1, hierarchy2);
      
      if (match && match.similarity > this.similarityThreshold) {
        matchedPairs++;
      }
      
      totalPairs++;
    });

    return totalPairs > 0 ? matchedPairs / totalPairs : 0;
  }

  /**
   * Розрахунок схожості вузлів
   */
  calculateNodeSimilarity(node1, node2) {
    let score = 0;
    let factors = 0;

    // Порівняння типів/тегів
    if (node1.type === node2.type || node1.tagName === node2.tagName) {
      score += 1;
    }
    factors++;

    // Порівняння кількості дітей
    const children1 = node1.children?.length || 0;
    const children2 = node2.children?.length || 0;
    const maxChildren = Math.max(children1, children2);
    
    if (maxChildren > 0) {
      score += 1 - Math.abs(children1 - children2) / maxChildren;
    }
    factors++;

    // Порівняння глибини
    const depth1 = this.calculateNodeDepth(node1);
    const depth2 = this.calculateNodeDepth(node2);
    const maxDepth = Math.max(depth1, depth2);
    
    if (maxDepth > 0) {
      score += 1 - Math.abs(depth1 - depth2) / maxDepth;
    }
    factors++;

    return score / factors;
  }

  /**
   * Генерація рекомендацій
   */
  generateRecommendations(comparison, analysis1, analysis2) {
    const recommendations = [];

    if (comparison.sizeSimilarity < 0.5) {
      recommendations.push({
        type: 'warning',
        message: 'Значна різниця в розмірах структур',
        impact: 'high'
      });
    }

    if (comparison.depthSimilarity < 0.6) {
      recommendations.push({
        type: 'info',
        message: 'Різна глибина вкладеності структур',
        impact: 'medium'
      });
    }

    if (comparison.typeSimilarity < 0.7) {
      recommendations.push({
        type: 'info',
        message: 'Різні типи елементів у структурах',
        impact: 'low'
      });
    }

    if (comparison.overallSimilarity > 0.8) {
      recommendations.push({
        type: 'success',
        message: 'Високий рівень схожості структур',
        impact: 'positive'
      });
    }

    return recommendations;
  }

  /**
   * Перевірка на порожній контейнер
   */
  isEmptyContainer(node) {
    return !node.content && 
           !node.styles && 
           (!node.children || node.children.length === 0);
  }

  /**
   * Перевірка можливості злиття вузлів
   */
  canMergeNodes(node) {
    return !node.content && 
           !node.styles?.visual && 
           !node.styles?.typography;
  }

  /**
   * Виявлення патерну
   */
  detectPattern(node, hierarchy) {
    // Пошук повторюваних структур
    if (!node.children || node.children.length < 2) return null;

    const childSignatures = node.children.map(childId => {
      const child = hierarchy.get(childId);
      return this.getNodeSignature(child);
    });

    // Перевірка на однаковість сигнатур
    const firstSignature = childSignatures[0];
    const isPattern = childSignatures.every(sig => sig === firstSignature);

    if (isPattern && childSignatures.length >= 3) {
      return {
        type: 'repeating',
        parent: node.id || node.name,
        nodes: node.children,
        signature: firstSignature,
        count: childSignatures.length
      };
    }

    return null;
  }

  /**
   * Отримання сигнатури вузла
   */
  getNodeSignature(node) {
    if (!node) return '';
    
    const type = node.type || node.tagName || 'unknown';
    const childrenCount = node.children?.length || 0;
    const hasContent = !!node.content;
    
    return `${type}:${childrenCount}:${hasContent}`;
  }
}

// Експорт модуля
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HierarchyAnalyzer;
}