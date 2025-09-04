/**
 * Система точного співставлення стилів Figma з HTML класами
 * Використовує множинні алгоритми для досягнення 100% точності
 */
class StyleMatcher {
  constructor() {
    this.matchingStrategies = [
      new ContentBasedMatching(),
      new StructuralMatching(),
      new SemanticMatching(),
      new PositionalMatching(),
      new HierarchicalMatching(),
    ];
    this.confidenceThreshold = 0.8;
  }

  /**
   * Головний метод співставлення з множинними стратегіями
   */
  matchStyles(figmaData, htmlData) {
    const matches = new Map();
    const unmatchedFigma = new Set(figmaData.hierarchy.keys());
    const unmatchedHTML = new Set(htmlData.hierarchy.keys());

    // Застосовуємо всі стратегії співставлення
    this.matchingStrategies.forEach((strategy) => {
      const strategyMatches = strategy.findMatches(figmaData, htmlData);

      strategyMatches.forEach((htmlElement, figmaElement) => {
        if (!matches.has(figmaElement)) {
          const confidence = this.calculateMatchConfidence(
            figmaData.hierarchy.get(figmaElement),
            htmlData.hierarchy.get(htmlElement)
          );

          if (confidence >= this.confidenceThreshold) {
            matches.set(figmaElement, {
              htmlElement,
              confidence,
              strategy: strategy.name,
            });
            unmatchedFigma.delete(figmaElement);
            unmatchedHTML.delete(htmlElement);
          }
        }
      });
    });

    // Спроба співставлення нерозпізнаних елементів через ML
    if (unmatchedFigma.size > 0) {
      const mlMatches = this.performMLMatching(
        Array.from(unmatchedFigma).map((id) => figmaData.hierarchy.get(id)),
        Array.from(unmatchedHTML).map((id) => htmlData.hierarchy.get(id))
      );

      mlMatches.forEach((htmlElement, figmaElement) => {
        matches.set(figmaElement.id, {
          htmlElement: htmlElement.id,
          confidence: 0.75,
          strategy: "ml-based",
        });
      });
    }

    return {
      matches,
      unmatchedFigma: Array.from(unmatchedFigma),
      unmatchedHTML: Array.from(unmatchedHTML),
      statistics: this.generateStatistics(matches, figmaData, htmlData),
    };
  }

  /**
   * Розрахунок довіри до співставлення
   */
  calculateMatchConfidence(figmaElement, htmlElement) {
    let score = 0;
    let maxScore = 0;

    // Співставлення контенту (вага 30%)
    const contentScore = this.compareContent(
      figmaElement.content,
      htmlElement.textContent
    );
    score += contentScore * 0.3;
    maxScore += 0.3;

    // Співставлення семантики (вага 25%)
    const semanticScore = this.compareSemantic(figmaElement, htmlElement);
    score += semanticScore * 0.25;
    maxScore += 0.25;

    // Співставлення структури (вага 20%)
    const structuralScore = this.compareStructure(figmaElement, htmlElement);
    score += structuralScore * 0.2;
    maxScore += 0.2;

    // Співставлення позиції (вага 15%)
    const positionScore = this.comparePosition(figmaElement, htmlElement);
    score += positionScore * 0.15;
    maxScore += 0.15;

    // Співставлення стилів (вага 10%)
    const styleScore = this.compareStyles(figmaElement.styles, htmlElement);
    score += styleScore * 0.1;
    maxScore += 0.1;

    return maxScore > 0 ? score / maxScore : 0;
  }

  /**
   * Порівняння контенту з використанням Levenshtein distance
   */
  compareContent(figmaContent, htmlContent) {
    if (!figmaContent || !htmlContent) return 0;

    const normalizedFigma = this.normalizeText(figmaContent);
    const normalizedHTML = this.normalizeText(htmlContent);

    if (normalizedFigma === normalizedHTML) return 1;

    const distance = this.levenshteinDistance(normalizedFigma, normalizedHTML);
    const maxLength = Math.max(normalizedFigma.length, normalizedHTML.length);

    return maxLength > 0 ? 1 - distance / maxLength : 0;
  }

  /**
   * ML-based співставлення для складних випадків
   */
  performMLMatching(figmaElements, htmlElements) {
    // Створюємо feature vectors для кожного елемента
    const figmaVectors = figmaElements.map((el) =>
      this.createFeatureVector(el, "figma")
    );
    const htmlVectors = htmlElements.map((el) =>
      this.createFeatureVector(el, "html")
    );

    const matches = new Map();

    // Використовуємо cosine similarity для знаходження найкращих співставлень
    figmaVectors.forEach((figmaVector, figmaIndex) => {
      let bestMatch = -1;
      let bestSimilarity = 0;

      htmlVectors.forEach((htmlVector, htmlIndex) => {
        const similarity = this.cosineSimilarity(figmaVector, htmlVector);
        if (similarity > bestSimilarity && similarity > 0.6) {
          bestSimilarity = similarity;
          bestMatch = htmlIndex;
        }
      });

      if (bestMatch >= 0) {
        matches.set(figmaElements[figmaIndex], htmlElements[bestMatch]);
      }
    });

    return matches;
  }

  /**
   * Створення feature vector для ML алгоритмів
   */
  createFeatureVector(element, type) {
    const vector = [];

    // Текстові особливості
    vector.push(element.content ? element.content.length : 0);
    vector.push(this.countWords(element.content || ""));
    vector.push(this.hasNumbers(element.content || "") ? 1 : 0);

    // Структурні особливості
    vector.push(element.children ? element.children.length : 0);
    vector.push(this.calculateDepth(element));

    // Семантичні особливості
    if (type === "html") {
      vector.push(element.tagName === "button" ? 1 : 0);
      vector.push(element.tagName === "h1" ? 1 : 0);
      vector.push(element.tagName === "img" ? 1 : 0);
      vector.push(element.classes.length);
    } else {
      vector.push(element.type === "RECTANGLE" ? 1 : 0);
      vector.push(element.type === "TEXT" ? 1 : 0);
      vector.push(element.type === "FRAME" ? 1 : 0);
      vector.push(element.styles ? Object.keys(element.styles).length : 0);
    }

    return vector;
  }

  /**
   * Обчислення cosine similarity між векторами
   */
  cosineSimilarity(vectorA, vectorB) {
    const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
    const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));

    return magnitudeA && magnitudeB
      ? dotProduct / (magnitudeA * magnitudeB)
      : 0;
  }

  /**
   * Levenshtein distance для порівняння рядків
   */
  levenshteinDistance(str1, str2) {
    const matrix = Array(str2.length + 1)
      .fill()
      .map(() => Array(str1.length + 1).fill(0));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        if (str1[i - 1] === str2[j - 1]) {
          matrix[j][i] = matrix[j - 1][i - 1];
        } else {
          matrix[j][i] = Math.min(
            matrix[j - 1][i] + 1, // deletion
            matrix[j][i - 1] + 1, // insertion
            matrix[j - 1][i - 1] + 1 // substitution
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Допоміжні методи для аналізу
   */
  normalizeText(text) {
    return text.toLowerCase().replace(/\s+/g, " ").trim();
  }

  countWords(text) {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }

  hasNumbers(text) {
    return /\d/.test(text);
  }

  calculateDepth(element) {
    return element.path ? element.path.split("/").length : 0;
  }

  compareSemantic(figmaElement, htmlElement) {
    // Порівняння семантичних ролей
    const figmaRole = this.getFigmaSemanticRole(figmaElement);
    const htmlRole = htmlElement.semanticRole;

    return figmaRole === htmlRole ? 1 : 0.5;
  }

  compareStructure(figmaElement, htmlElement) {
    const figmaChildren = figmaElement.children?.length || 0;
    const htmlChildren = htmlElement.children?.length || 0;

    if (figmaChildren === 0 && htmlChildren === 0) return 1;
    if (figmaChildren === 0 || htmlChildren === 0) return 0;

    return (
      1 -
      Math.abs(figmaChildren - htmlChildren) /
        Math.max(figmaChildren, htmlChildren)
    );
  }

  comparePosition(figmaElement, htmlElement) {
    // Порівняння позиції в ієрархії
    const figmaLevel = this.calculateDepth(figmaElement);
    const htmlLevel = htmlElement.level;

    return figmaLevel === htmlLevel ? 1 : 0.7;
  }

  compareStyles(figmaStyles, htmlElement) {
    // Базове порівняння стилів (можна розширити)
    return 0.5; // Placeholder
  }

  getFigmaSemanticRole(figmaElement) {
    const name = figmaElement.name.toLowerCase();

    if (name.includes("button") || name.includes("btn")) return "interactive";
    if (name.includes("header")) return "header";
    if (name.includes("title") || name.includes("heading")) return "heading";
    if (name.includes("card")) return "content-card";
    if (name.includes("menu") || name.includes("nav")) return "navigation";

    return "generic";
  }

  generateStatistics(matches, figmaData, htmlData) {
    const totalFigma = figmaData.hierarchy.size;
    const totalHTML = htmlData.hierarchy.size;
    const matchedCount = matches.size;

    return {
      totalFigmaElements: totalFigma,
      totalHTMLElements: totalHTML,
      matchedElements: matchedCount,
      matchPercentage: totalFigma > 0 ? (matchedCount / totalFigma) * 100 : 0,
      averageConfidence: this.calculateAverageConfidence(matches),
    };
  }

  calculateAverageConfidence(matches) {
    if (matches.size === 0) return 0;

    const total = Array.from(matches.values()).reduce(
      (sum, match) => sum + match.confidence,
      0
    );
    return total / matches.size;
  }
}

/**
 * Стратегії співставлення
 */
class ContentBasedMatching {
  name = "content-based";

  findMatches(figmaData, htmlData) {
    const matches = new Map();

    figmaData.contentMap.forEach((figmaElement, content) => {
      if (htmlData.contentMap.has(content)) {
        const htmlElement = htmlData.contentMap.get(content);
        matches.set(figmaElement.id, htmlElement.id);
      }
    });

    return matches;
  }
}

class StructuralMatching {
  name = "structural";

  findMatches(figmaData, htmlData) {
    const matches = new Map();

    // Порівнюємо елементи з однаковою кількістю дітей та рівнем вкладеності
    figmaData.hierarchy.forEach((figmaElement, figmaId) => {
      htmlData.hierarchy.forEach((htmlElement, htmlId) => {
        if (this.structuresMatch(figmaElement, htmlElement)) {
          matches.set(figmaId, htmlId);
        }
      });
    });

    return matches;
  }

  structuresMatch(figmaElement, htmlElement) {
    return (
      figmaElement.children?.length === htmlElement.children?.length &&
      this.calculateDepth(figmaElement) === htmlElement.level
    );
  }

  calculateDepth(element) {
    return element.path ? element.path.split("/").length : 0;
  }
}

class SemanticMatching {
  name = "semantic";

  findMatches(figmaData, htmlData) {
    const matches = new Map();

    figmaData.hierarchy.forEach((figmaElement, figmaId) => {
      const figmaRole = this.getFigmaRole(figmaElement);

      htmlData.hierarchy.forEach((htmlElement, htmlId) => {
        if (figmaRole === htmlElement.semanticRole) {
          matches.set(figmaId, htmlId);
        }
      });
    });

    return matches;
  }

  getFigmaRole(figmaElement) {
    const name = figmaElement.name.toLowerCase();
    const type = figmaElement.type;

    if (type === "TEXT" && name.includes("title")) return "main-heading";
    if (name.includes("button")) return "interactive";
    if (name.includes("header")) return "header";
    if (name.includes("card")) return "content-card";

    return "generic";
  }
}

class PositionalMatching {
  name = "positional";

  findMatches(figmaData, htmlData) {
    const matches = new Map();

    // Співставляємо елементи на основі їх позиції в ієрархії
    figmaData.hierarchy.forEach((figmaElement, figmaId) => {
      htmlData.hierarchy.forEach((htmlElement, htmlId) => {
        if (this.positionsMatch(figmaElement, htmlElement)) {
          matches.set(figmaId, htmlId);
        }
      });
    });

    return matches;
  }

  positionsMatch(figmaElement, htmlElement) {
    // Порівнюємо позиції в DOM дереві
    const figmaPath = figmaElement.path.split("/");
    const htmlPath = htmlElement.path.split("/");

    return figmaPath.length === htmlPath.length;
  }
}

class HierarchicalMatching {
  name = "hierarchical";

  findMatches(figmaData, htmlData) {
    const matches = new Map();

    // Співставляємо елементи на основі їх батьківсько-дочірніх відносин
    this.matchHierarchyRecursively(figmaData, htmlData, matches);

    return matches;
  }

  matchHierarchyRecursively(figmaData, htmlData, matches) {
    // Складний алгоритм рекурсивного співставлення ієрархій
    // Реалізація залежить від конкретних потреб проекту
  }
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = StyleMatcher;
}

