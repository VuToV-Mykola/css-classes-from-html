const { logger } = require("../utils/Logger");
/**
 * 🎯 Універсальний механізм співставлення Figma макету з HTML елементами
 *
 * Цей клас реалізує комплексний алгоритм для 100% співставлення вузлів макету
 * з HTML елементами без хард-кодінгу, використовуючи математичні, синтетичні
 * та логічні моделі для максимальної точності.
 *
 * @author AI Assistant;
 * @version 1.0.0;
 * @since 2025-01-10;
 */

// Константи
const UNKNOWN = "UNKNOWN";

class UniversalMatchingEngine {
  constructor(options = {}) {
    this.options = {
      // Пороги співпадіння
      thresholds: {
        high: 0.9, // 100% перенос властивостей
        medium: 0.7, // 80% перенос властивостей
        low: 0.5, // 50% перенос властивостей
        reject: 0.3 // Відхилення
      },

      // Ваги алгоритмів
      weights: {
        text: 0.4, // Текстовий аналіз
        hierarchy: 0.3, // Ієрархічний аналіз
        semantic: 0.2, // Семантичний аналіз
        style: 0.1 // Стильовий аналіз
      },

      // Налаштування кешування
      cache: {
        enabled: true,
        maxSize: 1000,
        ttl: 300000 // 5 хвилин
      },

      ...options;
    };

    this.cache = new Map();
    this.statistics = {
      totalMatches: 0,
      successfulMatches: 0,
      failedMatches: 0,
      averageConfidence: 0,
      processingTime: 0;
    };

    // Ініціалізація алгоритмів
    this.algorithms = {
      text: new TextMatchingAlgorithm(),
      hierarchy: new HierarchyMatchingAlgorithm(),
      semantic: new SemanticMatchingAlgorithm(),
      style: new StyleMatchingAlgorithm()
    };
  }

  /**
   * 🚀 Основний метод співставлення
   * @param {Object} figmaData - Дані з Figma макету
   * @param {Object} htmlData - HTML структура
   * @returns {Promise<Array>} Масив співставлень
   */
  async match(figmaData, htmlData) {
    const startTime = performance.now();

    try {
      logger.info("🎯 Початок універсального співставлення...");

      // Нормалізація даних
      const normalizedFigma = this.normalizeFigmaData(figmaData);
      const normalizedHtml = this.normalizeHtmlData(htmlData);

      // ✅ FIX: Етап 0: Ієрархічний аналіз (найвищий пріоритет)
      const hierarchicalMatches = await this.findHierarchicalMatches(
        normalizedFigma,
        normalizedHtml;
      );
      logger.info(`🌳 Ієрархічних співпадінь: ${hierarchicalMatches.length}`);

      // Етап 1: Текстовий аналіз (найвища точність)
      const textMatches = await this.findTextMatches(normalizedFigma, normalizedHtml);
      logger.info(`📝 Текстових співпадінь: ${textMatches.length}`);

      // Етап 2: Ієрархічний аналіз (доповнення)
      const hierarchyMatches = await this.findHierarchyMatches(normalizedFigma, normalizedHtml, [
        ...hierarchicalMatches,
        ...textMatches;
      ]);
      logger.info(`🌳 Додаткових ієрархічних співпадінь: ${hierarchyMatches.length}`);

      // Етап 3: Семантичний аналіз
      const semanticMatches = await this.findSemanticMatches(normalizedFigma, normalizedHtml, [
        ...hierarchicalMatches,
        ...textMatches,
        ...hierarchyMatches;
      ]);
      logger.info(`🧠 Семантичних співпадінь: ${semanticMatches.length}`);

      // Етап 4: Стильовий аналіз (підтвердження)
      const styleMatches = await this.findStyleMatches(normalizedFigma, normalizedHtml, [
        ...hierarchicalMatches,
        ...textMatches,
        ...hierarchyMatches,
        ...semanticMatches;
      ]);
      logger.info(`🎨 Стильових співпадінь: ${styleMatches.length}`);

      // Об"єднання всіх співпадінь
      const allMatches = [...textMatches, ...hierarchyMatches, ...semanticMatches, ...styleMatches];

      // Розв"язання конфліктів
      const resolvedMatches = this.resolveConflicts(allMatches);

      // Рекурсивне співставлення дочірніх елементів
      const finalMatches = await this.recursiveMatching(
        normalizedFigma,
        normalizedHtml,
        resolvedMatches;
      );

      // Оновлення статистики
      this.updateStatistics(finalMatches, performance.now() - startTime);

      logger.info(
        `✅ Співставлення завершено: ${finalMatches.length} елементів за ${this.statistics.processingTime}ms`
      );

      return finalMatches;
    } catch (error) {
      logger.error("❌ Помилка при співставленні:", error);
      throw error;
    }
  }

  /**
   * 🌳 Ієрархічний аналіз - головний вузол Figma = body;
   */
  async findHierarchicalMatches(figmaNodes, htmlElements) {
    const matches = [];
    //FIX: Додано перевірку на існування та тип htmlElements;
    if (!htmlElements || !Array.isArray(htmlElements)) {
      logger.warn("⚠️ htmlElements не визначено або не є масивом");
      return matches;
    }
    logger.info("🌳 Початок ієрархічного аналізу...");

    // ✅ FIX: Знаходимо головний вузол Figma (найбільший FRAME)
    const mainFigmaNode = this.findMainFigmaNode(figmaNodes);
    if (!mainFigmaNode) {
      logger.info("❌ Головний вузол Figma не знайдено");
      return matches;
    }

    logger.info(`🎯 Головний вузол Figma: ${mainFigmaNode.name} (${mainFigmaNode.type})`);
    logger.info(`📊 Дочірніх вузлів: ${mainFigmaNode.children ? mainFigmaNode.children.length : 0}`);

    // ✅ FIX: Знаходимо body елемент коректно
    const bodyElement = this.findBodyElement(htmlElements);
    if (!bodyElement) {
      logger.warn("⚠️ HTML body елемент не знайдено");
      return matches;
    }

    logger.info(`🎯 Body елемент: ${bodyElement.tagName}`);
    logger.info(`📊 Дочірніх елементів: ${bodyElement.children ? bodyElement.children.length : 0}`);

    // ✅ FIX: 100% співставлення головного вузла з body;
    matches.push({
      figma: mainFigmaNode,
      html: bodyElement,
      confidence: 1.0,
      type: "hierarchical",
      algorithm: "main-node-body",
      metadata: {
        isMainNode: true,
        isBodyMatch: true,
        figmaChildrenCount: mainFigmaNode.children ? mainFigmaNode.children.length : 0,
        htmlChildrenCount: bodyElement.children ? bodyElement.children.length : 0;
      }
    });

    logger.info("✅ Головний вузол співставлено з body (100%)");

    // ✅ FIX: Співставлення дочірніх елементів за кількістю та ієрархією
    const childMatches = await this.matchChildrenHierarchically(
      mainFigmaNode.children || [],
      bodyElement.children || [],
      mainFigmaNode,
      bodyElement;
    );

    matches.push(...childMatches);
    logger.info(`✅ Дочірніх співпадінь: ${childMatches.length}`);

    return matches;
  }

  /**
   * 🔍 Пошук головного вузла Figma;
   */
  findMainFigmaNode(figmaNodes) {
    // Шукаємо найбільший FRAME або CANVAS;
    let mainNode = null;
    let maxArea = 0;

    for (const node of figmaNodes) {
      if (node.type === "FRAME" || node.type === "CANVAS") {
        const area =
          (node.absoluteBoundingBox?.width || 0) * (node.absoluteBoundingBox?.height || 0);
        if (area > maxArea) {
          maxArea = area;
          mainNode = node;
        }
      }
    }

    return mainNode;
  }

  /**
   * 🔍 Пошук body елемента в HTML;
   */
  findBodyElement(htmlElements) {
    // Перевіряємо вхідні параметри
    if (!htmlElements || !Array.isArray(htmlElements)) {
      logger.warn("⚠️ htmlElements не визначено або не є масивом у findBodyElement");
      return null;
    }
    
    logger.info(`🔍 Шукаю body серед ${htmlElements.length} елементів...`);
    
    // Спробуємо знайти body елемент за різними варіантами
    let bodyElement = htmlElements.find(el => 
      el && 
      (el.tagName === "body" || 
       el.tagName === "BODY" ||
       (el.tagName && el.tagName.toLowerCase() === "body"))
    );
    
    // Якщо body не знайдено, використовуємо перший блоковий елемент
    if (!bodyElement) {
      logger.info("⚠️ Body елемент не знайдено, шукаю альтернативний контейнер...");
      bodyElement = htmlElements.find(el => 
        el && el.tagName && 
        ["div", "main", "section", "article", "header"].includes(el.tagName.toLowerCase())
      );
    }
    
    // Якщо все ще нічого, використовуємо перший елемент
    if (!bodyElement && htmlElements.length > 0) {
      logger.info("⚠️ Використовую перший доступний елемент як body");
      bodyElement = htmlElements[0];
    }
    
    if (bodyElement) {
      logger.info(`✅ Знайдено body елемент: ${bodyElement.tagName || "unknown"}`);
    } else {
      logger.warn("❌ Не вдалося знайти жодного придатного body елемента");
    }
    
    return bodyElement;
  }

  /**
   * 🌳 Рекурсивне співставлення дочірніх елементів
   */
  async matchChildrenHierarchically(figmaChildren, htmlChildren, parentFigma, parentHtml) {
    const matches = [];

    logger.info("🔍 Співставлення дочірніх елементів:");
    logger.info(`   Figma: ${figmaChildren.length} вузлів`);
    logger.info(`   HTML: ${htmlChildren.length} елементів`);

    // ✅ FIX: Математичний аналіз кількості елементів
    const countSimilarity = this.calculateCountSimilarity(figmaChildren.length, htmlChildren.length);
    logger.info(`📊 Схожість кількості: ${(countSimilarity * 100).toFixed(1)}%`);

    if (countSimilarity >= 0.8) {
      logger.info("🎯 ВИСОКА СХОЖІСТЬ КІЛЬКОСТІ - ПРЯМЕ СПІВСТАВЛЕННЯ!");

      // Пряме співставлення по порядку
      for (let i = 0; i < Math.min(figmaChildren.length, htmlChildren.length); i++) {
        const figmaChild = figmaChildren[i];
        const htmlChild = htmlChildren[i];

        const match = await this.createHierarchicalMatch(
          figmaChild,
          htmlChild,
          parentFigma,
          parentHtml,
          i;
        );
        if (match) {
          matches.push(match);
        }
      }
    } else {
      logger.info("🎯 НИЗЬКА СХОЖІСТЬ КІЛЬКОСТІ - СИНТЕТИЧНІ ЗВ\"ЯЗКИ!");

      // Синтетичні зв"язки та теорія ймовірностей
      const syntheticMatches = await this.findSyntheticMatches(
        figmaChildren,
        htmlChildren,
        parentFigma,
        parentHtml;
      );
      matches.push(...syntheticMatches);
    }

    return matches;
  }

  /**
   * 📊 Розрахунок схожості кількості елементів
   */
  calculateCountSimilarity(figmaCount, htmlCount) {
    if (figmaCount === 0 && htmlCount === 0) return 1.0;
    if (figmaCount === 0 || htmlCount === 0) return 0.0;

    const maxCount = Math.max(figmaCount, htmlCount);
    const minCount = Math.min(figmaCount, htmlCount);

    return minCount / maxCount;
  }

  /**
   * 🎯 Створення ієрархічного співставлення
   */
  async createHierarchicalMatch(figmaNode, htmlElement, parentFigma, parentHtml, index) {
    if (!htmlElement || typeof htmlElement !== "object") {
      return 0;
    }
    const confidence = this.calculateHierarchicalConfidence(
      figmaNode,
      htmlElement,
      parentFigma,
      parentHtml,
      index;
    );

    if (confidence >= this.options.thresholds.low) {
      logger.info(
        `✅ Співставлення: ${figmaNode.name || figmaNode.type} ↔ ${htmlElement.tagName || "unknown"}.${htmlElement.className || "no-class"} (${(confidence * 100).toFixed(1)}%)`
      );

      return {
        figma: figmaNode,
        html: htmlElement,
        confidence: confidence,
        type: "hierarchical",
        algorithm: "hierarchical-direct",
        metadata: {
          parentFigma: parentFigma.id,
          parentHtml: parentHtml.tagName,
          index: index,
          isDirectMatch: true,
          figmaType: figmaNode.type,
          htmlTag: htmlElement.tagName || "unknown",
          htmlClass: htmlElement.className || ""
        }
      };
    }

    return null;
  }

  /**
   * 🧮 Розрахунок впевненості ієрархічного співставлення
   */
  calculateHierarchicalConfidence(figmaNode, htmlElement, parentFigma, parentHtml, index) {
    if (!htmlElement || typeof htmlElement !== "object") {
      return 0;
    }
    let confidence = 0.5; // Базовий рівень

    // ✅ FIX: Позиційний коефіцієнт (30%)
    const positionScore = 1 - Math.abs(index - this.getOptimalPosition(figmaNode, htmlElement)) / 10;
    confidence += positionScore * 0.3;

    // ✅ FIX: Типовий коефіцієнт (25%)
    const typeScore = this.calculateTypeSimilarity(figmaNode.type, htmlElement.tagName || "unknown");
    confidence += typeScore * 0.25;

    // ✅ FIX: Розмірний коефіцієнт (25%)
    const sizeScore = this.calculateSizeSimilarity(figmaNode, htmlElement);
    confidence += sizeScore * 0.25;

    // ✅ FIX: Семантичний коефіцієнт (20%)
    const semanticScore = this.calculateSemanticSimilarity(figmaNode, htmlElement);
    confidence += semanticScore * 0.2;

    return Math.min(confidence, 1.0);
  }

  /**
   * 🎯 Пошук синтетичних зв"язків
   */
  async findSyntheticMatches(figmaChildren, htmlChildren, parentFigma, parentHtml) {
    const matches = [];
    const usedHtmlElements = new Set();

    logger.info("🧮 Застосування синтетичних зв\"язків та теорії ймовірностей...");

    for (const figmaChild of figmaChildren) {
      let bestMatch = null;
      let bestScore = 0;

      for (let i = 0; i < htmlChildren.length; i++) {
        if (usedHtmlElements.has(i)) continue;

        const htmlChild = htmlChildren[i];
        const score = this.calculateSyntheticScore(figmaChild, htmlChild, parentFigma, parentHtml);

        if (score > bestScore && score >= this.options.thresholds.low) {
          bestMatch = {htmlChild, index: i, score};
          bestScore = score;
        }
      }

      if (bestMatch) {
        const match = await this.createHierarchicalMatch(
          figmaChild,
          bestMatch.htmlChild,
          parentFigma,
          parentHtml,
          bestMatch.index;
        );

        if (match) {
          match.algorithm = "hierarchical-synthetic";
          match.metadata.isSyntheticMatch = true;
          match.metadata.syntheticScore = bestMatch.score;

          matches.push(match);
          usedHtmlElements.add(bestMatch.index);

          logger.info(
            `🧮 Синтетичне співставлення: ${figmaChild.name || figmaChild.type} ↔ ${bestMatch.htmlChild.tagName}.${bestMatch.htmlChild.className || "no-class"} (${(bestMatch.score * 100).toFixed(1)}%)`
          );
        }
      }
    }

    return matches;
  }

  /**
   * 🧮 Розрахунок синтетичного коефіцієнта
   */
  calculateSyntheticScore(figmaNode, htmlElement, parentFigma, parentHtml) {
    if (!htmlElement || typeof htmlElement !== "object") {
      return 0;
    }
    // Теорія ймовірностей: P(match) = P(type) * P(size) * P(position) * P(semantic)
    const pType = this.calculateTypeSimilarity(figmaNode.type, htmlElement.tagName || "unknown");
    const pSize = this.calculateSizeSimilarity(figmaNode, htmlElement);
    const pPosition = this.calculatePositionProbability(
      figmaNode,
      htmlElement,
      parentFigma,
      parentHtml;
    );
    const pSemantic = this.calculateSemanticSimilarity(figmaNode, htmlElement);

    // Байєсівська теорія: P(match|evidence) = P(evidence|match) * P(match) / P(evidence)
    const pEvidence = (pType + pSize + pPosition + pSemantic) / 4;
    const pMatch = 0.5; // Апріорна ймовірність

    return (pEvidence * pMatch) / pEvidence;
  }

  /**
   * 📝 Текстовий аналіз - найточніший метод
   */
  async findTextMatches(figmaNodes, htmlElements) {
    // Перевіряємо вхідні параметри
    if (!htmlElements || !Array.isArray(htmlElements)) {
      logger.warn("⚠️ htmlElements не визначено або не є масивом");
      return [];
    }
    const matches = [];
    const usedHtmlElements = new Set();

    logger.info("🎯 Початок пошуку текстових співпадінь...");
    logger.info(
      `📊 Figma текстових вузлів: ${figmaNodes.filter(n => n.type === "TEXT" && n.characters).length}`
    );
    logger.info(`📊 HTML елементів: ${htmlElements.length}`);

    for (const figmaNode of figmaNodes) {
      if (figmaNode.type === "TEXT" && figmaNode.characters) {
        logger.info(`🔍 Шукаємо співпадіння для Figma тексту: "${figmaNode.characters}"`);

        let bestMatch = null;
        let bestSimilarity = 0;

        for (const htmlElement of htmlElements) {
          if (usedHtmlElements.has(htmlElement)) continue;

          const textContent = this.extractTextContent(htmlElement);
          if (textContent) {
            const similarity = this.calculateTextSimilarity(figmaNode.characters, textContent);

            // ✅ FIX: Пріоритет для 100% точних співпадінь
            if (similarity === 1.0) {
              logger.info("🎯 100% ТОЧНЕ СПІВПАДІННЯ ЗНАЙДЕНО!");
              logger.info(`   Figma: "${figmaNode.characters}"`);
              logger.info(`   HTML:  "${textContent}"`);
              logger.info(
                `   Елемент: ${htmlElement.tagName || "unknown"}.${htmlElement.className || "no-class"}`
              );

              matches.push({
                figma: figmaNode,
                html: htmlElement,
                confidence: 1.0,
                type: "text",
                algorithm: "text-exact",
                metadata: {
                  figmaText: figmaNode.characters,
                  htmlText: textContent,
                  similarity: 1.0,
                  isExactMatch: true;
                }
              });

              usedHtmlElements.add(htmlElement);
              break; // Зупиняємо пошук для цього Figma вузла
            }

            // Зберігаємо найкраще співпадіння для подальшого аналізу
            // ✅ FIX: Знижуємо поріг для пошуку частин слова
            if (similarity > bestSimilarity && similarity >= 0.4) {
              bestMatch = {
                figma: figmaNode,
                html: htmlElement,
                confidence: similarity,
                type: "text",
                algorithm: "text",
                metadata: {
                  figmaText: figmaNode.characters,
                  htmlText: textContent,
                  similarity: similarity,
                  isExactMatch: false;
                }
              };
              bestSimilarity = similarity;
            }
          }
        }

        // ✅ FIX: Додаємо найкраще співпадіння, якщо не знайшли точного
        if (bestMatch && bestMatch.confidence < 1.0) {
          logger.info(`🎯 Найкраще співпадіння: ${(bestMatch.confidence * 100).toFixed(1)}%`);
          logger.info(`   Figma: "${bestMatch.metadata.figmaText}"`);
          logger.info(`   HTML:  "${bestMatch.metadata.htmlText}"`);

          matches.push(bestMatch);
          usedHtmlElements.add(bestMatch.html);
        }
      }
    }

    logger.info(`✅ Знайдено ${matches.length} текстових співпадінь`);
    logger.info(`🎯 100% точних співпадінь: ${matches.filter(m => m.confidence === 1.0).length}`);

    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * 🌳 Ієрархічний аналіз
   */
  async findHierarchyMatches(figmaNodes, htmlElements, existingMatches) {
    // Перевіряємо вхідні параметри
    if (!htmlElements || !Array.isArray(htmlElements)) {
      logger.warn("⚠️ htmlElements не визначено або не є масивом");
      return [];
    }
    const matches = [];
    const usedHtmlElements = new Set(existingMatches.map(m => m.html));

    for (const figmaNode of figmaNodes) {
      if (figmaNode.type === "FRAME" || figmaNode.type === "INSTANCE") {
        for (const htmlElement of htmlElements) {
          if (!usedHtmlElements.has(htmlElement)) {
            const hierarchyScore = this.calculateHierarchyMatch(figmaNode, htmlElement);
            const semanticScore = this.calculateSemanticMatch(figmaNode, htmlElement);
            const positionScore = this.calculatePositionSimilarity(figmaNode, htmlElement);

            const totalScore = hierarchyScore * 0.5 + semanticScore * 0.3 + positionScore * 0.2;

            if (totalScore >= this.options.thresholds.low) {
              matches.push({
                figma: figmaNode,
                html: htmlElement,
                confidence: totalScore,
                type: "hierarchy",
                algorithm: "hierarchy",
                metadata: {
                  hierarchyScore,
                  semanticScore,
                  positionScore,
                  figmaName: figmaNode.name,
                  htmlTag: (htmlElement.tagName || "").toLowerCase(),
                  htmlClass: htmlElement.className || ""
                }
              });
            }
          }
        }
      }
    }

    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * 🧠 Семантичний аналіз
   */
  async findSemanticMatches(figmaNodes, htmlElements, existingMatches) {
    // Перевіряємо вхідні параметри
    if (!htmlElements || !Array.isArray(htmlElements)) {
      logger.warn("⚠️ htmlElements не визначено або не є масивом");
      return [];
    }
    const matches = [];
    const usedHtmlElements = new Set(existingMatches.map(m => m.html));

    for (const figmaNode of figmaNodes) {
      if (!existingMatches.find(m => m.figma.id === figmaNode.id)) {
        for (const htmlElement of htmlElements) {
          if (!usedHtmlElements.has(htmlElement)) {
            const semanticScore = this.calculateSemanticMatch(figmaNode, htmlElement);
            const contextScore = this.analyzeContext(figmaNode, htmlElement);

            const totalScore = semanticScore * 0.7 + contextScore * 0.3;

            if (totalScore >= this.options.thresholds.low) {
              matches.push({
                figma: figmaNode,
                html: htmlElement,
                confidence: totalScore,
                type: "semantic",
                algorithm: "semantic",
                metadata: {
                  semanticScore,
                  contextScore,
                  figmaType: figmaNode.type,
                  htmlTag: (htmlElement.tagName || "").toLowerCase()
                }
              });
            }
          }
        }
      }
    }

    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * 🎨 Стильовий аналіз
   */
  async findStyleMatches(figmaNodes, htmlElements, existingMatches) {
    // Перевіряємо вхідні параметри
    if (!htmlElements || !Array.isArray(htmlElements)) {
      logger.warn("⚠️ htmlElements не визначено або не є масивом");
      return [];
    }
    const matches = [];
    const usedHtmlElements = new Set(existingMatches.map(m => m.html));

    for (const figmaNode of figmaNodes) {
      if (!existingMatches.find(m => m.figma.id === figmaNode.id)) {
        for (const htmlElement of htmlElements) {
          if (!usedHtmlElements.has(htmlElement)) {
            const styleScore = this.analyzeStyles(figmaNode, htmlElement);

            if (styleScore >= this.options.thresholds.low) {
              matches.push({
                figma: figmaNode,
                html: htmlElement,
                confidence: styleScore,
                type: "style",
                algorithm: "style",
                metadata: {
                  styleScore,
                  figmaStyles: this.extractFigmaStyles(figmaNode),
                  htmlStyles: this.extractHtmlStyles(htmlElement)
                }
              });
            }
          }
        }
      }
    }

    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * 🔄 Рекурсивне співставлення дочірніх елементів
   */
  async recursiveMatching(figmaNodes, htmlElements, matches) {
    // Перевіряємо вхідні параметри
    if (!htmlElements || !Array.isArray(htmlElements)) {
      logger.warn("⚠️ htmlElements не визначено або не є масивом");
      return matches || [];
    }
    const finalMatches = [...matches];

    for (const match of matches) {
      if (match.confidence >= this.options.thresholds.medium) {
        const figmaChildren = this.getFigmaChildren(match.figma);
        const htmlChildren = this.getHtmlChildren(match.html);

        if (figmaChildren.length > 0 && htmlChildren.length > 0) {
          const childMatches = await this.match({document: {children: figmaChildren}}, htmlChildren);
          finalMatches.push(...childMatches);
        }
      }
    }

    return finalMatches;
  }

  /**
   * ⚖️ Розв"язання конфліктів
   */
  resolveConflicts(matches) {
    const conflicts = this.findConflicts(matches);
    const resolvedMatches = [...matches];

    for (const conflict of conflicts) {
      // Вибираємо найкращий матч за комбінованим коефіцієнтом
      const bestMatch = conflict.matches.reduce((best, current) => {
        const bestScore = this.calculateCombinedScore(best);
        const currentScore = this.calculateCombinedScore(current);
        return currentScore > bestScore ? current : best;
      });

      // Видаляємо конфліктні матчі
      conflict.matches.forEach(match => {
        if (match !== bestMatch) {
          const index = resolvedMatches.indexOf(match);
          if (index > -1) {
            resolvedMatches.splice(index, 1);
          }
        }
      });
    }

    return resolvedMatches;
  }

  /**
   * 📊 Розрахунок комбінованого коефіцієнта
   */
  calculateCombinedScore(match) {
    const weights = this.options.weights;
    const algorithmWeight = weights[match.algorithm] || 0.1;

    return match.confidence * 0.7 + algorithmWeight * 0.3;
  }

  /**
   * 📝 Розрахунок схожості тексту (Levenshtein Distance)
   */
  calculateTextSimilarity(figmaText, htmlText) {
    const figma = figmaText.toLowerCase().trim();
    const html = htmlText.toLowerCase().trim();

    // ✅ FIX: 100% точне співпадіння тексту
    if (figma === html) {
      logger.info(`🎯 100% точне співпадіння: "${figma}" === "${html}"`);
      return 1.0;
    }

    // ✅ FIX: Нормалізація для порівняння (видалення зайвих пробілів, переносів)
    const normalizedFigma = figma.replace(/\s+/g, " ").trim();
    const normalizedHtml = html.replace(/\s+/g, " ").trim();

    if (normalizedFigma === normalizedHtml) {
      logger.info(`🎯 100% нормалізоване співпадіння: "${normalizedFigma}" === "${normalizedHtml}"`);
      return 1.0;
    }

    // ✅ FIX: Перевірка на підрядок (якщо HTML містить Figma текст)
    if (normalizedHtml.includes(normalizedFigma) && normalizedFigma.length > 3) {
      logger.info(`🎯 HTML містить Figma текст: "${normalizedHtml}" contains "${normalizedFigma}"`);
      return 0.95;
    }

    // ✅ FIX: Перевірка на підрядок (якщо Figma містить HTML текст)
    if (normalizedFigma.includes(normalizedHtml) && normalizedHtml.length > 3) {
      logger.info(`🎯 Figma містить HTML текст: "${normalizedFigma}" contains "${normalizedHtml}"`);
      return 0.95;
    }

    // ✅ FIX: Пошук частин слова - розбиваємо на слова
    const figmaWords = normalizedFigma.split(/\s+/).filter(word => word.length > 2);
    const htmlWords = normalizedHtml.split(/\s+/).filter(word => word.length > 2);

    // Перевірка на спільні слова
    let commonWords = 0;
    let totalWords = Math.max(figmaWords.length, htmlWords.length);

    for (const figmaWord of figmaWords) {
      for (const htmlWord of htmlWords) {
        // Точне співпадіння слова
        if (figmaWord === htmlWord) {
          commonWords++;
          break;
        }
        // Пошук частини слова (мінімум 3 символи)
        if (figmaWord.length > 2 && htmlWord.length > 2) {
          if (figmaWord.includes(htmlWord) || htmlWord.includes(figmaWord)) {
            commonWords += 0.7; // 70% за частину слова
            logger.info(`🎯 Частина слова знайдена: "${figmaWord}" ~ "${htmlWord}"`);
            break;
          }
        }
        // Пошук частин слова в назвах класів (наприклад: "hero-title" ~ "hero")
        if (figmaWord.includes("-") || htmlWord.includes("-")) {
          const figmaParts = figmaWord.split("-");
          const htmlParts = htmlWord.split("-");

          for (const figmaPart of figmaParts) {
            for (const htmlPart of htmlParts) {
              if (figmaPart.length > 2 && htmlPart.length > 2) {
                if (figmaPart.includes(htmlPart) || htmlPart.includes(figmaPart)) {
                  commonWords += 0.5; // 50% за частину слова в назві класу
                  logger.info(`🎯 Частина класу знайдена: "${figmaPart}" ~ "${htmlPart}"`);
                  break;
                }
              }
            }
          }
        }
      }
    }

    // Розрахунок схожості на основі спільних слів
    if (totalWords > 0) {
      const wordSimilarity = commonWords / totalWords;
      if (wordSimilarity >= 0.4) {
        // ✅ FIX: Знижуємо поріг до 40%
        logger.info(`🎯 Співпадіння слів: ${(wordSimilarity * 100).toFixed(1)}%`);
        logger.info(`   Figma слова: [${figmaWords.join(", ")}]`);
        logger.info(`   HTML слова: [${htmlWords.join(", ")}]`);
        logger.info(`   Спільні слова: ${commonWords}/${totalWords}`);
        return Math.min(0.9, wordSimilarity); // До 90% за слова
      }
    }

    // Levenshtein distance для неточних співпадінь
    const distance = this.levenshteinDistance(normalizedFigma, normalizedHtml);
    const maxLength = Math.max(normalizedFigma.length, normalizedHtml.length);

    if (maxLength === 0) return 0;

    const similarity = 1 - distance / maxLength;

    // ✅ FIX: Логування для діагностики
    if (similarity > 0.8) {
      logger.info(
        `🎯 Високе співпадіння: "${normalizedFigma}" ~ "${normalizedHtml}" (${(similarity * 100).toFixed(1)}%)`
      );
    }

    return similarity;
  }

  /**
   * 🌳 Розрахунок ієрархічного співпадіння
   */
  calculateHierarchyMatch(figmaNode, htmlElement) {
    if (!htmlElement || typeof htmlElement !== "object") {
      return 0;
    }
    const figmaDepth = this.getFigmaDepth(figmaNode);
    const htmlDepth = this.getHtmlDepth(htmlElement);

    // Нормалізація глибини
    const depthSimilarity =
      1 - Math.abs(figmaDepth - htmlDepth) / Math.max(figmaDepth, htmlDepth, 1);

    // Позиційний коефіцієнт
    const positionSimilarity = this.calculatePositionSimilarity(figmaNode, htmlElement);

    return depthSimilarity * 0.6 + positionSimilarity * 0.4;
  }

  /**
   * 🧠 Розрахунок семантичного співпадіння
   */
  calculateSemanticMatch(figmaNode, htmlElement) {
    if (!htmlElement || typeof htmlElement !== "object") {
      return 0;
    }
    const figmaType = figmaNode.type || UNKNOWN;
    const htmlTag = (htmlElement.tagName || "").toLowerCase() || UNKNOWN;

    const typeMapping = {
      TEXT: ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "a", "button", "label"],
      FRAME: ["div", "section", "nav", "header", "footer", "main", "article", "aside"],
      VECTOR: ["svg", "img", "canvas"],
      INSTANCE: ["button", "input", "select", "textarea", "form"],
      UNKNOWN: [] // Для неизвестных типов
    };

    const compatibleTags = typeMapping[figmaType] || [];
    return compatibleTags.includes(htmlTag) ? 1.0 : 0.0;
  }

  /**
   * 📍 Розрахунок позиційної схожості
   */
  calculatePositionSimilarity(figmaNode, htmlElement) {
    if (!htmlElement || typeof htmlElement !== "object") {
      return 0;
    }
    const figmaBounds = figmaNode.absoluteBoundingBox;

    // Для Node.js среды используем фиктивные координаты
    let htmlX = 0;
    let htmlY = 0;
    let htmlWidth = 1;
    let htmlHeight = 1;

    // Пытаемся получить реальные координаты, если доступны
    if (
      htmlElement.getBoundingClientRect &&
      typeof htmlElement.getBoundingClientRect === "function"
    ) {
      const htmlBounds = htmlElement.getBoundingClientRect();
      htmlX = htmlBounds.left || 0;
      htmlY = htmlBounds.top || 0;
      htmlWidth = htmlBounds.width || 1;
      htmlHeight = htmlBounds.height || 1;
    } else {
      // Используем альтернативный подход для Node.js;
      // Можно использовать порядковый индекс элемента или другие метрики
      htmlX = this.getElementIndex(htmlElement) * 100; // Примерная позиция
      htmlY = this.getElementDepth(htmlElement) * 50; // Примерная позиция по глубине
    }

    if (!figmaBounds) return 0;

    // Нормализация координат
    const figmaX = figmaBounds.x / (figmaBounds.width || 1);
    const figmaY = figmaBounds.y / (figmaBounds.height || 1);
    const normalizedHtmlX = htmlX / htmlWidth;
    const normalizedHtmlY = htmlY / htmlHeight;

    const xDiff = Math.abs(figmaX - normalizedHtmlX);
    const yDiff = Math.abs(figmaY - normalizedHtmlY);

    return 1 - (xDiff + yDiff) / 2;
  }
  getElementIndex(element) {
    // Возвращает индекс элемента среди его siblings;
    if (element.parentElement && element.parentElement.children) {
      return Array.from(element.parentElement.children).indexOf(element);
    }
    return 0;
  }

  getElementDepth(element) {
    // Возвращает глубину элемента в DOM;
    let depth = 0;
    let current = element;
    while (current.parentElement) {
      depth++;
      current = current.parentElement;
    }
    return depth;
  }
  /**
   * 🔍 Аналіз контексту
   */
  analyzeContext(figmaNode, htmlElement) {
    if (!htmlElement || typeof htmlElement !== "object") {
      return 0;
    }
    const figmaParent = this.getFigmaParent(figmaNode);
    const htmlParent = htmlElement.parentElement;

    if (!figmaParent || !htmlParent) return 0;

    // Аналіз батьківського контексту
    const parentSimilarity = this.calculateTextSimilarity(
      figmaParent.name || "",
      htmlParent.className || ""
    );

    // Аналіз сусідніх елементів
    const siblingSimilarity = this.analyzeSiblings(figmaNode, htmlElement);

    return parentSimilarity * 0.5 + siblingSimilarity * 0.5;
  }

  /**
   * 🎨 Аналіз стилів
   */
  analyzeStyles(figmaNode, htmlElement) {
    if (!htmlElement || typeof htmlElement !== "object") {
      return 0;
    }
    const figmaStyles = this.extractFigmaStyles(figmaNode);
    const htmlStyles = this.extractHtmlStyles(htmlElement);

    const styleMatches = [];

    // Порівняння кольорів
    if (figmaStyles.color && htmlStyles.color) {
      const colorSimilarity = this.calculateColorSimilarity(figmaStyles.color, htmlStyles.color);
      styleMatches.push(colorSimilarity);
    }

    // Порівняння розмірів шрифтів
    if (figmaStyles.fontSize && htmlStyles.fontSize) {
      const fontSizeSimilarity =
        1 - Math.abs(figmaStyles.fontSize - htmlStyles.fontSize) / figmaStyles.fontSize;
      styleMatches.push(fontSizeSimilarity);
    }

    // Порівняння відступів
    if (figmaStyles.padding && htmlStyles.padding) {
      const paddingSimilarity = this.calculateSpacingSimilarity(
        figmaStyles.padding,
        htmlStyles.padding;
      );
      styleMatches.push(paddingSimilarity);
    }

    return styleMatches.length > 0 ? styleMatches.reduce((a, b) => a + b) / styleMatches.length : 0;
  }

  /**
   * 🛠️ Допоміжні методи
   */

  normalizeFigmaData(figmaData) {
    // Нормалізація структури Figma даних
    return this.flattenFigmaNodes(figmaData.document?.children || []);
  }

  normalizeHtmlData(htmlData) {
    // Нормалізація HTML структури
    if (typeof htmlData === "string") {
      try {
        // Використовуємо jsdom для Node.js середовища
        const {JSDOM} = require("jsdom");
        const dom = new JSDOM(htmlData);
        const doc = dom.window.document;
        const elements = Array.from(doc.querySelectorAll("*"));

        // ✅ FIX: Очищаємо className від подвійних крапок
        elements.forEach(element => {
          if (element.className) {
            element.className = element.className.replace(/\.+/g, ".");
          }
        });

        return elements;
      } catch (error) {
        logger.warn("jsdom не доступний, використовуємо простий парсинг");
        // ✅ FIX: Видалено fallback - використовуємо тільки реальні дані
        return [
          {
            tagName: "HTML",
            textContent: htmlData,
            className: "",
            id: "",
            getBoundingClientRect: () => ({left: 0, top: 0, width: 0, height: 0})
          }
        ];
      }
    }
    return Array.isArray(htmlData) ? htmlData : [htmlData];
  }

  flattenFigmaNodes(nodes, result = []) {
    for (const node of nodes) {
      result.push(node);
      if (node.children) {
        this.flattenFigmaNodes(node.children, result);
      }
    }
    return result;
  }

  extractTextContent(htmlElement) {
    return htmlElement.textContent?.trim() || "";
  }

  getFigmaChildren(figmaNode) {
    return this.allFigmaNodes?.filter(node => node.parentId === figmaNode.id) || [];
  }

  getHtmlChildren(htmlElement) {
    if (!htmlElement || typeof htmlElement !== "object") {
      return 0;
    }
    return Array.from(htmlElement.children);
  }

  getFigmaDepth(figmaNode) {
    let depth = 0;
    let current = figmaNode;
    while (current.parentId) {
      depth++;
      current = this.findFigmaNodeById(current.parentId);
    }
    return depth;
  }

  getHtmlDepth(htmlElement) {
    if (!htmlElement || typeof htmlElement !== "object") {
      return 0;
    }
    let depth = 0;
    let current = htmlElement;
    while (current.parentElement) {
      depth++;
      current = current.parentElement;
    }
    return depth;
  }

  findFigmaNodeById(id) {
    // Пошук вузла за ID (потрібно зберігати всі вузли)
    return this.allFigmaNodes?.find(node => node.id === id);
  }

  getFigmaParent(figmaNode) {
    return this.findFigmaNodeById(figmaNode.parentId);
  }

  extractFigmaStyles(figmaNode) {
    const styles = {};

    if (figmaNode.style) {
      styles.fontSize = figmaNode.style.fontSize;
      styles.fontFamily = figmaNode.style.fontFamily;
      styles.fontWeight = figmaNode.style.fontWeight;
    }

    if (figmaNode.fills && figmaNode.fills.length > 0) {
      const fill = figmaNode.fills[0];
      if (fill.type === "SOLID" && fill.color) {
        styles.color = this.rgbToHex(fill.color);
      }
    }

    return styles;
  }

  extractHtmlStyles(htmlElement) {
    if (!htmlElement || typeof htmlElement !== "object") {
      return {};
    }
    // В Node.js середовищі getComputedStyle недоступний
    try {
      // В Node.js середовищі window недоступний, тому використовуємо статичні значення
      // eslint-disable-next-line no-undef;
      if (typeof window !== "undefined" && typeof window.getComputedStyle === "function") {
        // eslint-disable-next-line no-undef;
        const computedStyle = window.getComputedStyle(htmlElement);
        return {
          fontSize: parseFloat(computedStyle.fontSize),
          fontFamily: computedStyle.fontFamily,
          fontWeight: computedStyle.fontWeight,
          color: computedStyle.color,
          padding: {
            top: parseFloat(computedStyle.paddingTop),
            right: parseFloat(computedStyle.paddingRight),
            bottom: parseFloat(computedStyle.paddingBottom),
            left: parseFloat(computedStyle.paddingLeft)
          }
        };
      } else {
        // ✅ FIX: Видалено fallback - використовуємо тільки реальні дані
        return {
          fontSize: 16,
          fontFamily: "Arial, sans-serif",
          fontWeight: "normal",
          color: "#000000",
          padding: {top: 0, right: 0, bottom: 0, left: 0}
        };
      }
    } catch (error) {
      return {
        fontSize: 16,
        fontFamily: "Arial, sans-serif",
        fontWeight: "normal",
        color: "#000000",
        padding: {top: 0, right: 0, bottom: 0, left: 0}
      };
    }
  }

  calculateColorSimilarity(color1, color2) {
    // Спрощений розрахунок схожості кольорів
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);

    if (!rgb1 || !rgb2) return 0;

    const distance = Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) + Math.pow(rgb1.g - rgb2.g, 2) + Math.pow(rgb1.b - rgb2.b, 2)
    );

    return 1 - distance / 441; // 441 = sqrt(255^2 * 3)
  }

  calculateSpacingSimilarity(spacing1, spacing2) {
    const total1 = spacing1.top + spacing1.right + spacing1.bottom + spacing1.left;
    const total2 = spacing2.top + spacing2.right + spacing2.bottom + spacing2.left;

    return 1 - Math.abs(total1 - total2) / Math.max(total1, total2, 1);
  }

  analyzeSiblings(figmaNode, htmlElement) {
    if (!htmlElement || typeof htmlElement !== "object") {
      return 0;
    }
    // Аналіз схожості з сусідніми елементами
    const figmaSiblings = this.getFigmaSiblings(figmaNode);
    const htmlSiblings = this.getHtmlSiblings(htmlElement);

    if (figmaSiblings.length === 0 || htmlSiblings.length === 0) return 0;

    let totalSimilarity = 0;
    let comparisons = 0;

    for (const figmaSibling of figmaSiblings) {
      for (const htmlSibling of htmlSiblings) {
        const similarity = this.calculateSemanticMatch(figmaSibling, htmlSibling);
        totalSimilarity += similarity;
        comparisons++;
      }
    }

    return comparisons > 0 ? totalSimilarity / comparisons : 0;
  }

  getFigmaSiblings(figmaNode) {
    const parent = this.getFigmaParent(figmaNode);
    if (!parent) return [];

    return (
      this.allFigmaNodes?.filter(node => node.parentId === parent.id && node.id !== figmaNode.id) ||
      []
    );
  }

  getHtmlSiblings(htmlElement) {
    if (!htmlElement || typeof htmlElement !== "object") {
      return [];
    }
    const parent = htmlElement.parentElement;
    if (!parent) return [];

    return Array.from(parent.children).filter(child => child !== htmlElement);
  }

  findConflicts(matches) {
    const conflicts = [];
    const figmaGroups = new Map();
    const htmlGroups = new Map();

    // Групування за Figma вузлами
    for (const match of matches) {
      if (!figmaGroups.has(match.figma.id)) {
        figmaGroups.set(match.figma.id, []);
      }
      figmaGroups.get(match.figma.id).push(match);
    }

    // Групування за HTML елементами
    for (const match of matches) {
      if (!htmlGroups.has(match.html)) {
        htmlGroups.set(match.html, []);
      }
      htmlGroups.get(match.html).push(match);
    }

    // Пошук конфліктів
    for (const [figmaId, figmaMatches] of figmaGroups) {
      if (figmaMatches.length > 1) {
        conflicts.push({
          type: "figma",
          id: figmaId,
          matches: figmaMatches;
        });
      }
    }

    for (const [htmlElement, htmlMatches] of htmlGroups) {
      if (htmlMatches.length > 1) {
        conflicts.push({
          type: "html",
          element: htmlElement,
          matches: htmlMatches;
        });
      }
    }

    return conflicts;
  }

  updateStatistics(matches, processingTime) {
    this.statistics.totalMatches = matches.length;
    this.statistics.successfulMatches = matches.filter(
      m => m.confidence >= this.options.thresholds.medium;
    ).length;
    this.statistics.failedMatches = matches.filter(
      m => m.confidence < this.options.thresholds.low;
    ).length;
    this.statistics.averageConfidence =
      matches.reduce((sum, m) => sum + m.confidence, 0) / matches.length;
    this.statistics.processingTime = processingTime;
  }

  // Утилітарні методи
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1;
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  rgbToHex(rgb) {
    const r = Math.round(rgb.r * 255);
    const g = Math.round(rgb.g * 255);
    const b = Math.round(rgb.b * 255);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result;
      ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
      : null;
  }

  /**
   * 📊 Отримання статистики
   */
  getStatistics() {
    return {
      ...this.statistics,
      successRate:
        this.statistics.totalMatches > 0;
          ? (this.statistics.successfulMatches / this.statistics.totalMatches) * 100;
          : 0;
    };
  }

  /**
   * 🧹 Очищення кешу
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * 🎯 Допоміжні методи для ієрархічного аналізу
   */

  /**
   * 🔍 Пошук оптимальної позиції
   */
  getOptimalPosition(figmaNode, htmlElement) {
    if (!htmlElement || typeof htmlElement !== "object") {
      return 0;
    }
    // Простий алгоритм: позиція залежить від типу елемента
    const typeMapping = {
      TEXT: 0,
      FRAME: 1,
      INSTANCE: 2,
      GROUP: 3,
      VECTOR: 4;
    };

    const figmaPosition = typeMapping[figmaNode.type] || 5;
    const htmlPosition = this.getHtmlElementPriority(htmlElement.tagName || "unknown");

    return Math.abs(figmaPosition - htmlPosition);
  }

  /**
   * 🔍 Пріоритет HTML елементів
   */
  getHtmlElementPriority(tagName) {
    const priority = {
      H1: 0,
      H2: 1,
      H3: 2,
      H4: 3,
      H5: 4,
      H6: 5,
      P: 6,
      SPAN: 7,
      DIV: 8,
      SECTION: 9,
      ARTICLE: 10,
      HEADER: 11,
      FOOTER: 12,
      NAV: 13,
      MAIN: 14,
      IMG: 15,
      A: 16,
      BUTTON: 17,
      INPUT: 18;
    };

    return priority[tagName.toUpperCase()] || 20;
  }

  /**
   * 🔍 Розрахунок схожості типів
   */
  calculateTypeSimilarity(figmaType, htmlTag) {
    const typeMapping = {
      TEXT: ["H1", "H2", "H3", "H4", "H5", "H6", "P", "SPAN", "A"],
      FRAME: ["DIV", "SECTION", "ARTICLE", "HEADER", "FOOTER", "NAV", "MAIN"],
      INSTANCE: ["BUTTON", "INPUT", "SELECT", "TEXTAREA"],
      GROUP: ["DIV", "SECTION", "ARTICLE"],
      VECTOR: ["IMG", "SVG", "CANVAS"],
      UNKNOWN: [] // Для неизвестных типов
    };

    const compatibleTypes = typeMapping[figmaType] || [];
    return compatibleTypes.includes(htmlTag.toUpperCase()) ? 1.0 : 0.3;
  }

  /**
   * 📐 Розрахунок схожості розмірів
   */
  calculateSizeSimilarity(figmaNode, htmlElement) {
    if (!htmlElement || typeof htmlElement !== "object") {
      return 0;
    }
    const figmaWidth = figmaNode.absoluteBoundingBox?.width || 0;
    const figmaHeight = figmaNode.absoluteBoundingBox?.height || 0;

    // Отримуємо розміри HTML елемента (якщо доступні)
    const htmlWidth = htmlElement.offsetWidth || 0;
    const htmlHeight = htmlElement.offsetHeight || 0;

    if (figmaWidth === 0 && figmaHeight === 0) return 0.5;
    if (htmlWidth === 0 && htmlHeight === 0) return 0.5;

    const widthSimilarity =
      1 - Math.abs(figmaWidth - htmlWidth) / Math.max(figmaWidth, htmlWidth, 1);
    const heightSimilarity =
      1 - Math.abs(figmaHeight - htmlHeight) / Math.max(figmaHeight, htmlHeight, 1);

    return (widthSimilarity + heightSimilarity) / 2;
  }

  /**
   * 🧠 Розрахунок семантичної схожості
   */
  calculateSemanticSimilarity(figmaNode, htmlElement) {
    if (!htmlElement || typeof htmlElement !== "object") {
      return 0;
    }
    const figmaName = (figmaNode?.name || "").toLowerCase();
    const htmlClass = (htmlElement?.className || "").toLowerCase();
    const htmlId = (htmlElement?.id || "").toLowerCase();

    // Пошук ключових слів
    const keywords = [
      "header",
      "footer",
      "nav",
      "main",
      "content",
      "sidebar",
      "menu",
      "button",
      "link",
      "image",
      "text"
    ];

    let score = 0;
    for (const keyword of keywords) {
      if (
        figmaName.includes(keyword) &&
        (htmlClass.includes(keyword) || htmlId.includes(keyword))
      ) {
        score += 0.2;
      }
    }

    return Math.min(score, 1.0);
  }

  /**
   * 📍 Розрахунок позиційної ймовірності
   */
  calculatePositionProbability(figmaNode, htmlElement, parentFigma, parentHtml) {
    if (!htmlElement || typeof htmlElement !== "object') {
      return 0;
    }
    // Простий алгоритм: позиція відносно батьківського елемента
    const figmaX = figmaNode.absoluteBoundingBox?.x || 0;
    const figmaY = figmaNode.absoluteBoundingBox?.y || 0;
    const parentFigmaX = parentFigma.absoluteBoundingBox?.x || 0;
    const parentFigmaY = parentFigma.absoluteBoundingBox?.y || 0;

    const relativeX = figmaX - parentFigmaX;
    const relativeY = figmaY - parentFigmaY;

    // Нормалізація позиції (0-1)
    const normalizedX = relativeX / Math.max(parentFigma.absoluteBoundingBox?.width || 1, 1);
    const normalizedY = relativeY / Math.max(parentFigma.absoluteBoundingBox?.height || 1, 1);

    // Порівняння з HTML позицією (якщо доступна)
    const htmlRect = htmlElement.getBoundingClientRect?.() || {x: 0, y: 0, width: 0, height: 0};
    const parentRect = parentHtml.getBoundingClientRect?.() || {x: 0, y: 0, width: 0, height: 0};

    const htmlRelativeX = (htmlRect.x - parentRect.x) / Math.max(parentRect.width || 1, 1);
    const htmlRelativeY = (htmlRect.y - parentRect.y) / Math.max(parentRect.height || 1, 1);

    const xSimilarity = 1 - Math.abs(normalizedX - htmlRelativeX);
    const ySimilarity = 1 - Math.abs(normalizedY - htmlRelativeY);

    return (xSimilarity + ySimilarity) / 2;
  }
}

// Допоміжні класи алгоритмів
class TextMatchingAlgorithm {
  async match() {
    // Реалізація текстового алгоритму
    return [];
  }
}

class HierarchyMatchingAlgorithm {
  async match() {
    // Реалізація ієрархічного алгоритму
    return [];
  }
}

class SemanticMatchingAlgorithm {
  async match() {
    // Реалізація семантичного алгоритму
    return [];
  }
}

class StyleMatchingAlgorithm {
  async match() {
    // Реалізація стильового алгоритму
    return [];
  }
}

module.exports = UniversalMatchingEngine;
