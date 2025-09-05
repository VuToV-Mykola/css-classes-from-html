/**
 * @module ContentAnalyzer
 * @description Глибокий аналіз контенту для точного співставлення елементів
 * @author Ukrainian Developer
 * @version 2.0.0
 */

class ContentAnalyzer {
  constructor() {
    this.stopWords = new Set([
      'і', 'та', 'або', 'але', 'що', 'як', 'в', 'на', 'з', 'до', 'для',
      'and', 'or', 'but', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for'
    ]);
    
    this.contentCache = new WeakMap();
    this.similarityCache = new Map();
  }

  /**
   * Повний аналіз контенту елемента
   * @param {Object} element - Елемент для аналізу
   * @returns {Object} Детальний аналіз контенту
   */
  analyzeContent(element) {
    // Перевірка кешу
    if (this.contentCache.has(element)) {
      return this.contentCache.get(element);
    }

    const content = element.content || element.textContent || '';
    
    const analysis = {
      raw: content,
      normalized: this.normalizeContent(content),
      words: this.extractWords(content),
      keywords: this.extractKeywords(content),
      contentType: this.detectContentType(content),
      language: this.detectLanguage(content),
      metrics: this.calculateContentMetrics(content),
      features: this.extractContentFeatures(content)
    };

    // Збереження в кеш
    this.contentCache.set(element, analysis);
    return analysis;
  }

  /**
   * Порівняння контенту двох елементів
   * @param {string} content1 - Перший контент
   * @param {string} content2 - Другий контент
   * @returns {Object} Результати порівняння
   */
  compareContent(content1, content2) {
    const cacheKey = `${content1}::${content2}`;
    
    // Перевірка кешу
    if (this.similarityCache.has(cacheKey)) {
      return this.similarityCache.get(cacheKey);
    }

    const comparison = {
      exactMatch: content1 === content2,
      normalizedMatch: false,
      levenshteinSimilarity: 0,
      jaccardSimilarity: 0,
      cosineSimilarity: 0,
      semanticSimilarity: 0,
      overallSimilarity: 0
    };

    // Нормалізовані версії
    const norm1 = this.normalizeContent(content1);
    const norm2 = this.normalizeContent(content2);
    
    comparison.normalizedMatch = norm1 === norm2;

    // Різні метрики схожості
    comparison.levenshteinSimilarity = this.calculateLevenshteinSimilarity(norm1, norm2);
    comparison.jaccardSimilarity = this.calculateJaccardSimilarity(content1, content2);
    comparison.cosineSimilarity = this.calculateCosineSimilarity(content1, content2);
    comparison.semanticSimilarity = this.calculateSemanticSimilarity(content1, content2);

    // Зважена загальна схожість
    comparison.overallSimilarity = (
      comparison.levenshteinSimilarity * 0.3 +
      comparison.jaccardSimilarity * 0.2 +
      comparison.cosineSimilarity * 0.2 +
      comparison.semanticSimilarity * 0.3
    );

    // Збереження в кеш
    this.similarityCache.set(cacheKey, comparison);
    return comparison;
  }

  /**
   * Нормалізація контенту
   * @param {string} content - Вхідний контент
   * @returns {string} Нормалізований контент
   */
  normalizeContent(content) {
    return content
      .toLowerCase()
      .replace(/[\s\u00A0]+/g, ' ') // Заміна всіх пробільних символів
      .replace(/[^\w\s\u0400-\u04FF]/g, '') // Видалення спецсимволів
      .trim();
  }

  /**
   * Витягування слів з контенту
   * @param {string} content - Вхідний контент
   * @returns {Array} Масив слів
   */
  extractWords(content) {
    const normalized = this.normalizeContent(content);
    const words = normalized.split(/\s+/).filter(word => word.length > 0);
    return words;
  }

  /**
   * Витягування ключових слів
   * @param {string} content - Вхідний контент
   * @returns {Array} Масив ключових слів
   */
  extractKeywords(content) {
    const words = this.extractWords(content);
    const wordFrequency = new Map();

    // Підрахунок частоти слів
    words.forEach(word => {
      if (!this.stopWords.has(word) && word.length > 2) {
        wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
      }
    });

    // Сортування за частотою
    const keywords = Array.from(wordFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);

    return keywords;
  }

  /**
   * Визначення типу контенту
   * @param {string} content - Вхідний контент
   * @returns {string} Тип контенту
   */
  detectContentType(content) {
    // Перевірка на різні типи контенту
    if (!content || content.trim().length === 0) {
      return 'empty';
    }
    
    if (/^\d+$/.test(content.trim())) {
      return 'numeric';
    }
    
    if (/^[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(content.trim())) {
      return 'email';
    }
    
    if (/^https?:\/\//.test(content.trim())) {
      return 'url';
    }
    
    if (/^\+?[\d\s\-\(\)]+$/.test(content.trim())) {
      return 'phone';
    }
    
    if (content.length < 20) {
      return 'short-text';
    }
    
    if (content.length < 100) {
      return 'medium-text';
    }
    
    return 'long-text';
  }

  /**
   * Визначення мови контенту
   * @param {string} content - Вхідний контент
   * @returns {string} Код мови
   */
  detectLanguage(content) {
    const cyrillicCount = (content.match(/[\u0400-\u04FF]/g) || []).length;
    const latinCount = (content.match(/[a-zA-Z]/g) || []).length;
    
    if (cyrillicCount > latinCount) {
      return 'uk'; // Українська
    } else if (latinCount > 0) {
      return 'en'; // Англійська
    }
    
    return 'unknown';
  }

  /**
   * Розрахунок метрик контенту
   * @param {string} content - Вхідний контент
   * @returns {Object} Метрики
   */
  calculateContentMetrics(content) {
    const words = this.extractWords(content);
    
    return {
      length: content.length,
      wordCount: words.length,
      avgWordLength: words.length > 0 
        ? words.reduce((sum, word) => sum + word.length, 0) / words.length 
        : 0,
      uniqueWords: new Set(words).size,
      lexicalDiversity: words.length > 0 
        ? new Set(words).size / words.length 
        : 0,
      hasNumbers: /\d/.test(content),
      hasUpperCase: /[A-Z]/.test(content),
      hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(content)
    };
  }

  /**
   * Витягування особливостей контенту
   * @param {string} content - Вхідний контент
   * @returns {Object} Особливості
   */
  extractContentFeatures(content) {
    return {
      startsWithCapital: /^[A-ZА-ЯІЇЄҐ]/.test(content),
      endsWithPunctuation: /[.!?]$/.test(content),
      hasQuotes: /["']/.test(content),
      hasBrackets: /[\[\]\(\)\{\}]/.test(content),
      hasEmoji: /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]/u.test(content),
      isQuestion: /\?$/.test(content),
      isExclamation: /!$/.test(content),
      containsCode: /\b(function|class|const|let|var|if|else|for|while)\b/.test(content)
    };
  }

  /**
   * Розрахунок схожості Левенштейна
   * @param {string} str1 - Перший рядок
   * @param {string} str2 - Другий рядок
   * @returns {number} Схожість від 0 до 1
   */
  calculateLevenshteinSimilarity(str1, str2) {
    if (str1 === str2) return 1;
    if (!str1 || !str2) return 0;

    const matrix = Array(str2.length + 1).fill().map(() => 
      Array(str1.length + 1).fill(0)
    );

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        if (str1[i - 1] === str2[j - 1]) {
          matrix[j][i] = matrix[j - 1][i - 1];
        } else {
          matrix[j][i] = Math.min(
            matrix[j - 1][i] + 1,     // Вставка
            matrix[j][i - 1] + 1,     // Видалення
            matrix[j - 1][i - 1] + 1  // Заміна
          );
        }
      }
    }

    const distance = matrix[str2.length][str1.length];
    const maxLength = Math.max(str1.length, str2.length);
    
    return maxLength > 0 ? 1 - (distance / maxLength) : 0;
  }

  /**
   * Розрахунок схожості Жаккара
   * @param {string} content1 - Перший контент
   * @param {string} content2 - Другий контент
   * @returns {number} Схожість від 0 до 1
   */
  calculateJaccardSimilarity(content1, content2) {
    const words1 = new Set(this.extractWords(content1));
    const words2 = new Set(this.extractWords(content2));

    if (words1.size === 0 && words2.size === 0) return 1;
    if (words1.size === 0 || words2.size === 0) return 0;

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  /**
   * Розрахунок косинусної схожості
   * @param {string} content1 - Перший контент
   * @param {string} content2 - Другий контент
   * @returns {number} Схожість від 0 до 1
   */
  calculateCosineSimilarity(content1, content2) {
    const vector1 = this.createTermFrequencyVector(content1);
    const vector2 = this.createTermFrequencyVector(content2);

    const allTerms = new Set([...vector1.keys(), ...vector2.keys()]);
    
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    allTerms.forEach(term => {
      const freq1 = vector1.get(term) || 0;
      const freq2 = vector2.get(term) || 0;
      
      dotProduct += freq1 * freq2;
      magnitude1 += freq1 * freq1;
      magnitude2 += freq2 * freq2;
    });

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    return magnitude1 && magnitude2 ? dotProduct / (magnitude1 * magnitude2) : 0;
  }

  /**
   * Розрахунок семантичної схожості
   * @param {string} content1 - Перший контент
   * @param {string} content2 - Другий контент
   * @returns {number} Схожість від 0 до 1
   */
  calculateSemanticSimilarity(content1, content2) {
    // Спрощений семантичний аналіз
    const keywords1 = this.extractKeywords(content1);
    const keywords2 = this.extractKeywords(content2);

    if (keywords1.length === 0 && keywords2.length === 0) return 1;
    if (keywords1.length === 0 || keywords2.length === 0) return 0;

    const commonKeywords = keywords1.filter(k => keywords2.includes(k));
    const similarity = (commonKeywords.length * 2) / (keywords1.length + keywords2.length);

    // Враховуємо порядок ключових слів
    let orderBonus = 0;
    for (let i = 0; i < Math.min(keywords1.length, keywords2.length); i++) {
      if (keywords1[i] === keywords2[i]) {
        orderBonus += 0.1;
      }
    }

    return Math.min(1, similarity + orderBonus);
  }

  /**
   * Створення вектора частоти термінів
   * @param {string} content - Контент
   * @returns {Map} Вектор частоти
   */
  createTermFrequencyVector(content) {
    const words = this.extractWords(content);
    const vector = new Map();

    words.forEach(word => {
      if (!this.stopWords.has(word)) {
        vector.set(word, (vector.get(word) || 0) + 1);
      }
    });

    // Нормалізація TF
    const maxFreq = Math.max(...vector.values());
    if (maxFreq > 0) {
      vector.forEach((freq, term) => {
        vector.set(term, freq / maxFreq);
      });
    }

    return vector;
  }

  /**
   * Пошук найкращих збігів контенту
   * @param {string} targetContent - Цільовий контент
   * @param {Array} candidates - Кандидати
   * @returns {Array} Відсортовані збіги
   */
  findBestMatches(targetContent, candidates) {
    const matches = candidates.map(candidate => {
      const comparison = this.compareContent(targetContent, candidate.content);
      return {
        ...candidate,
        similarity: comparison.overallSimilarity,
        comparison
      };
    });

    return matches
      .filter(m => m.similarity > 0.3) // Мінімальний поріг
      .sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Групування схожого контенту
   * @param {Array} contents - Масив контенту
   * @param {number} threshold - Поріг схожості
   * @returns {Array} Групи схожого контенту
   */
  groupSimilarContent(contents, threshold = 0.7) {
    const groups = [];
    const assigned = new Set();

    contents.forEach((content, index) => {
      if (assigned.has(index)) return;

      const group = [content];
      assigned.add(index);

      // Пошук схожих елементів
      for (let j = index + 1; j < contents.length; j++) {
        if (assigned.has(j)) continue;

        const comparison = this.compareContent(content, contents[j]);
        
        if (comparison.overallSimilarity >= threshold) {
          group.push(contents[j]);
          assigned.add(j);
        }
      }

      groups.push(group);
    });

    return groups;
  }
}

// Експорт модуля
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContentAnalyzer;
}