/**
 * Система валідації та тестування для CSS Classes from HTML;
 * Перевіряє якість співставлення та генерації CSS;
 * @version 1.0.0;
 */

class ValidationSystem {
  constructor() {
    this.validators = [
      new HTMLValidator(),
      new FigmaValidator(),
      new CSSValidator(),
      new MatchingValidator(),
      new ResponsiveValidator()
    ];
    
    this.results = {
      html: {},
      figma: {},
      css: {},
      matching: {},
      responsive: {},
      overall: {}
    };
  }

  /**
   * Комплексна валідація системи
   */
  validateSystem(figmaData, htmlData, matches, css) {
    this.reset();
    
    // Валідація HTML;
    this.results.html = this.validateHTML(htmlData);
    
    // Валідація Figma;
    this.results.figma = this.validateFigma(figmaData);
    
    // Валідація CSS;
    this.results.css = this.validateCSS(css);
    
    // Валідація співставлення
    this.results.matching = this.validateMatching(figmaData, htmlData, matches);
    
    // Валідація адаптивності
    this.results.responsive = this.validateResponsive(css);
    
    // Загальна оцінка
    this.results.overall = this.calculateOverallScore();
    
    return this.results;
  }

  /**
   * Валідація HTML;
   */
  validateHTML(htmlData) {
    const validator = this.validators.find(v => v instanceof HTMLValidator);
    return validator.validate(htmlData);
  }

  /**
   * Валідація Figma;
   */
  validateFigma(figmaData) {
    const validator = this.validators.find(v => v instanceof FigmaValidator);
    return validator.validate(figmaData);
  }

  /**
   * Валідація CSS;
   */
  validateCSS(css) {
    const validator = this.validators.find(v => v instanceof CSSValidator);
    return validator.validate(css);
  }

  /**
   * Валідація співставлення
   */
  validateMatching(figmaData, htmlData, matches) {
    const validator = this.validators.find(v => v instanceof MatchingValidator);
    return validator.validate(figmaData, htmlData, matches);
  }

  /**
   * Валідація адаптивності
   */
  validateResponsive(css) {
    const validator = this.validators.find(v => v instanceof ResponsiveValidator);
    return validator.validate(css);
  }

  /**
   * Розрахунок загальної оцінки
   */
  calculateOverallScore() {
    const scores = [
      this.results.html.score,
      this.results.figma.score,
      this.results.css.score,
      this.results.matching.score,
      this.results.responsive.score;
    ];
    
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    return {
      score: averageScore,
      grade: this.getGrade(averageScore),
      recommendations: this.generateRecommendations(),
      issues: this.collectAllIssues()
    };
  }

  /**
   * Отримання оцінки
   */
  getGrade(score) {
    if (score >= 90) return "A+";
    if (score >= 80) return "A";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    if (score >= 50) return "D";
    return "F";
  }

  /**
   * Генерація рекомендацій
   */
  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.matching.score < 80) {
      recommendations.push("Покращити алгоритми співставлення елементів");
    }
    
    if (this.results.css.score < 80) {
      recommendations.push("Оптимізувати генерацію CSS стилів");
    }
    
    if (this.results.responsive.score < 80) {
      recommendations.push("Додати більше адаптивних стилів");
    }
    
    if (this.results.html.score < 80) {
      recommendations.push("Покращити парсинг HTML структури");
    }
    
    return recommendations;
  }

  /**
   * Збір всіх проблем
   */
  collectAllIssues() {
    const issues = [];
    
    Object.values(this.results).forEach(result => {
      if (result.issues) {
        issues.push(...result.issues);
      }
    });
    
    return issues;
  }

  /**
   * Скидання результатів
   */
  reset() {
    this.results = {
      html: {},
      figma: {},
      css: {},
      matching: {},
      responsive: {},
      overall: {}
    };
  }

  /**
   * Генерація звіту
   */
  generateReport() {
    return {
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: {
        totalScore: this.results.overall.score,
        grade: this.results.overall.grade,
        totalIssues: this.collectAllIssues().length,
        recommendations: this.results.overall.recommendations;
      }
    };
  }
}

/**
 * Валідатор HTML;
 */
class HTMLValidator {
  validate(htmlData) {
    const issues = [];
    let score = 100;
    
    // Перевірка структури
    if (!htmlData.hierarchy || htmlData.hierarchy.size === 0) {
      issues.push("HTML hierarchy is empty");
      score -= 30;
    }
    
    // Перевірка класів
    if (!htmlData.classMap || htmlData.classMap.size === 0) {
      issues.push("No CSS classes found");
      score -= 20;
    }
    
    // Перевірка семантики
    if (!htmlData.semanticMap || htmlData.semanticMap.size === 0) {
      issues.push("No semantic roles found");
      score -= 15;
    }
    
    // Перевірка контенту
    if (!htmlData.contentMap || htmlData.contentMap.size === 0) {
      issues.push("No content found");
      score -= 10;
    }
    
    // Перевірка структури
    if (htmlData.structure && htmlData.structure.depth > 10) {
      issues.push("HTML structure is too deep");
      score -= 5;
    }
    
    return {
      score: Math.max(0, score),
      issues,
      details: {
        elementsCount: htmlData.hierarchy?.size || 0,
        classesCount: htmlData.classMap?.size || 0,
        semanticRolesCount: htmlData.semanticMap?.size || 0,
        contentCount: htmlData.contentMap?.size || 0,
        maxDepth: htmlData.structure?.depth || 0;
      }
    };
  }
}

/**
 * Валідатор Figma;
 */
class FigmaValidator {
  validate(figmaData) {
    const issues = [];
    let score = 100;
    
    // Перевірка структури
    if (!figmaData.hierarchy || figmaData.hierarchy.size === 0) {
      issues.push("Figma hierarchy is empty");
      score -= 40;
    }
    
    // Перевірка стилів
    let styledElements = 0;
    figmaData.hierarchy?.forEach(element => {
      if (element.styles && Object.keys(element.styles).length > 0) {
        styledElements++;
      }
    });
    
    if (styledElements === 0) {
      issues.push("No styled elements found");
      score -= 30;
    }
    
    // Перевірка контенту
    let contentElements = 0;
    figmaData.hierarchy?.forEach(element => {
      if (element.content && element.content.text) {
        contentElements++;
      }
    });
    
    if (contentElements === 0) {
      issues.push("No content elements found");
      score -= 20;
    }
    
    // Перевірка семантики
    let semanticElements = 0;
    figmaData.hierarchy?.forEach(element => {
      if (element.semanticRole && element.semanticRole !== "generic") {
        semanticElements++;
      }
    });
    
    if (semanticElements === 0) {
      issues.push("No semantic elements found");
      score -= 10;
    }
    
    return {
      score: Math.max(0, score),
      issues,
      details: {
        elementsCount: figmaData.hierarchy?.size || 0,
        styledElements,
        contentElements,
        semanticElements;
      }
    };
  }
}

/**
 * Валідатор CSS;
 */
class CSSValidator {
  validate(css) {
    const issues = [];
    let score = 100;
    
    // Перевірка базової структури
    if (!css || css.length === 0) {
      issues.push("CSS is empty");
      return { score: 0, issues, details: {} };
    }
    
    // Перевірка CSS змінних
    const cssVariables = (css.match(/--[a-zA-Z-]+:/g) || []).length;
    if (cssVariables === 0) {
      issues.push("No CSS variables found");
      score -= 15;
    }
    
    // Перевірка медіа запитів
    const mediaQueries = (css.match(/@media/g) || []).length;
    if (mediaQueries === 0) {
      issues.push("No responsive styles found");
      score -= 20;
    }
    
    // Перевірка селекторів
    const selectors = (css.match(/[.#]?[a-zA-Z][a-zA-Z0-9_-]*\s*{/g) || []).length;
    if (selectors < 5) {
      issues.push("Too few CSS selectors");
      score -= 10;
    }
    
    // Перевірка властивостей
    const properties = (css.match(/[a-zA-Z-]+\s*:/g) || []).length;
    if (properties < 10) {
      issues.push("Too few CSS properties");
      score -= 15;
    }
    
    // Перевірка анімацій
    const animations = (css.match(/@keyframes|animation:/g) || []).length;
    if (animations === 0) {
      issues.push("No animations found");
      score -= 10;
    }
    
    // Перевірка Flexbox/Grid;
    const modernLayout = (css.match(/display:\s*(flex|grid)/g) || []).length;
    if (modernLayout === 0) {
      issues.push("No modern layout properties found");
      score -= 10;
    }
    
    // Перевірка CSS Grid;
    const gridProperties = (css.match(/grid-template|grid-area|grid-gap/g) || []).length;
    if (gridProperties === 0) {
      issues.push("No CSS Grid properties found");
      score -= 5;
    }
    
    // Перевірка CSS Custom Properties;
    const customProperties = (css.match(/var\(--[a-zA-Z-]+\)/g) || []).length;
    if (customProperties < 5) {
      issues.push("Too few CSS custom properties used");
      score -= 5;
    }
    
    return {
      score: Math.max(0, score),
      issues,
      details: {
        length: css.length,
        variables: cssVariables,
        mediaQueries,
        selectors,
        properties,
        animations,
        modernLayout,
        gridProperties,
        customProperties;
      }
    };
  }
}

/**
 * Валідатор співставлення
 */
class MatchingValidator {
  validate(figmaData, htmlData, matches) {
    const issues = [];
    let score = 100;
    
    const totalFigma = figmaData.hierarchy?.size || 0;
    const totalHTML = htmlData.hierarchy?.size || 0;
    const matchedCount = matches?.size || 0;
    
    if (totalFigma === 0 || totalHTML === 0) {
      issues.push("No elements to match");
      return { score: 0, issues, details: {} };
    }
    
    // Перевірка кількості співставлень
    const matchPercentage = (matchedCount / Math.min(totalFigma, totalHTML)) * 100;
    
    if (matchPercentage < 50) {
      issues.push("Low matching percentage");
      score -= 30;
    } else if (matchPercentage < 70) {
      issues.push("Moderate matching percentage");
      score -= 15;
    }
    
    // Перевірка впевненості співставлень
    let totalConfidence = 0;
    let confidenceCount = 0;
    
    matches?.forEach(match => {
      if (match.confidence) {
        totalConfidence += match.confidence;
        confidenceCount++;
      }
    });
    
    const averageConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0;
    
    if (averageConfidence < 0.6) {
      issues.push("Low matching confidence");
      score -= 25;
    } else if (averageConfidence < 0.8) {
      issues.push("Moderate matching confidence");
      score -= 10;
    }
    
    // Перевірка стратегій співставлення
    const strategies = new Set();
    matches?.forEach(match => {
      if (match.strategy) {
        strategies.add(match.strategy);
      }
    });
    
    if (strategies.size < 2) {
      issues.push("Limited matching strategies used");
      score -= 10;
    }
    
    return {
      score: Math.max(0, score),
      issues,
      details: {
        totalFigma,
        totalHTML,
        matchedCount,
        matchPercentage,
        averageConfidence,
        strategiesUsed: strategies.size;
      }
    };
  }
}

/**
 * Валідатор адаптивності
 */
class ResponsiveValidator {
  validate(css) {
    const issues = [];
    let score = 100;
    
    // Перевірка медіа запитів
    const mediaQueries = css.match(/@media[^{]+{/g) || [];
    
    if (mediaQueries.length === 0) {
      issues.push("No responsive styles found");
      score -= 40;
    }
    
    // Перевірка breakpoints;
    const breakpoints = [];
    mediaQueries.forEach(mq => {
      const matches = mq.match(/(min-width|max-width):\s*(\d+)px/g);
      if (matches) {
        matches.forEach(match => {
          const value = parseInt(match.match(/(\d+)px/)[1]);
          breakpoints.push(value);
        });
      }
    });
    
    if (breakpoints.length < 2) {
      issues.push("Insufficient breakpoints");
      score -= 20;
    }
    
    // Перевірка мобільних стилів
    const mobileStyles = css.match(/@media[^{]*max-width[^{]*768px[^{]*{/g) || [];
    if (mobileStyles.length === 0) {
      issues.push("No mobile styles found");
      score -= 20;
    }
    
    // Перевірка desktop стилів
    const desktopStyles = css.match(/@media[^{]*min-width[^{]*1200px[^{]*{/g) || [];
    if (desktopStyles.length === 0) {
      issues.push("No desktop styles found");
      score -= 10;
    }
    
    // Перевірка flexbox/grid в медіа запитах
    const responsiveLayout = css.match(/@media[^{]*{[^}]*display:\s*(flex|grid)/g) || [];
    if (responsiveLayout.length === 0) {
      issues.push("No responsive layout properties found");
      score -= 10;
    }
    
    return {
      score: Math.max(0, score),
      issues,
      details: {
        mediaQueries: mediaQueries.length,
        breakpoints: breakpoints.sort((a, b) => a - b),
        mobileStyles: mobileStyles.length,
        desktopStyles: desktopStyles.length,
        responsiveLayout: responsiveLayout.length;
      }
    };
  }
}

module.exports = ValidationSystem;
