/**
 * Комплексна система тестування та валідації
 */
class TestingUtils {
  constructor() {
    this.testResults = [];
    this.validationErrors = [];
  }
  async runFullTestSuite(integration) {
    console.log("🧪 Запуск повного тестування через інтеграцію...");

    // Отримання даних з інтеграції (з запасними дефолтами)
    const figmaData = integration.getFigmaData
      ? await integration.getFigmaData()
      : { hierarchy: new Map(), contentMap: new Map() };

    const htmlData = integration.getHTMLData
      ? await integration.getHTMLData()
      : { hierarchy: new Map(), classMap: new Map() };

    const matches = integration.getMatches
      ? await integration.getMatches(figmaData, htmlData)
      : { matches: new Map() };

    const generatedCSS = integration.generateCSS
      ? await integration.generateCSS(matches)
      : "";

    // Виклик основного тестування
    const report = this.runCompleteTest(
      figmaData,
      htmlData,
      matches,
      generatedCSS
    );

    return {
      report,
      failed: report.errors.length,
      warnings: report.warnings.length,
      passed: report.results.filter((r) =>
        ["passed", "excellent", "good"].includes(r.status)
      ).length,
    };
  }
  // Додати всередині класу TestingUtils
  async runFullTestSuite(figmaData, htmlData, matches, generatedCSS) {
    return this.runCompleteTest(figmaData, htmlData, matches, generatedCSS);
  }
  /**
   * Повне тестування системи співставлення
   */
  runCompleteTest(figmaData, htmlData, matches, generatedCSS) {
    console.log("🧪 Початок повного тестування системи...\n");

    // Тест 1: Валідація даних
    this.testDataIntegrity(figmaData, htmlData);

    // Тест 2: Якість співставлення
    this.testMatchingQuality(matches, figmaData, htmlData);

    // Тест 3: Валідність CSS
    this.testCSSValidity(generatedCSS);

    // Тест 4: Тестування адаптивності
    this.testResponsiveDesign(generatedCSS);

    // Тест 5: Перевірка доступності
    this.testAccessibility(generatedCSS, htmlData);

    // Генерація звіту
    return this.generateTestReport();
  }

  /**
   * Тестування цілісності даних
   */
  testDataIntegrity(figmaData, htmlData) {
    console.log("🔍 Тестування цілісності даних...");

    // Перевірка структури Figma даних
    if (!figmaData.hierarchy || figmaData.hierarchy.size === 0) {
      this.addError("FIGMA_DATA", "Figma ієрархія порожня або відсутня");
    }

    if (!figmaData.contentMap || figmaData.contentMap.size === 0) {
      this.addWarning("FIGMA_DATA", "Figma contentMap порожня");
    }

    // Перевірка структури HTML даних
    if (!htmlData.hierarchy || htmlData.hierarchy.size === 0) {
      this.addError("HTML_DATA", "HTML ієрархія порожня або відсутня");
    }

    if (!htmlData.classMap || htmlData.classMap.size === 0) {
      this.addError(
        "HTML_DATA",
        "HTML classMap порожня - немає класів для стилізації"
      );
    }

    // Перевірка консистентності даних
    figmaData.hierarchy.forEach((element, id) => {
      if (!element.name) {
        this.addWarning("FIGMA_CONSISTENCY", `Елемент ${id} не має назви`);
      }

      if (!element.styles || Object.keys(element.styles).length === 0) {
        this.addWarning(
          "FIGMA_STYLES",
          `Елемент ${element.name} не має стилів`
        );
      }
    });

    this.addTestResult(
      "DATA_INTEGRITY",
      "passed",
      "Цілісність даних перевірена"
    );
  }

  /**
   * Тестування якості співставлення
   */
  testMatchingQuality(matches, figmaData, htmlData) {
    console.log("🎯 Тестування якості співставлення...");

    const totalFigmaElements = figmaData.hierarchy.size;
    const totalHTMLClasses = htmlData.classMap.size;
    const matchedElements = matches.matches.size;

    // Розрахунок метрик якості
    const matchRate = (matchedElements / totalFigmaElements) * 100;
    const coverageRate = (matchedElements / totalHTMLClasses) * 100;

    console.log(`📊 Статистика співставлення:`);
    console.log(`   Figma елементів: ${totalFigmaElements}`);
    console.log(`   HTML класів: ${totalHTMLClasses}`);
    console.log(`   Співставлено: ${matchedElements}`);
    console.log(`   Відсоток співставлення: ${matchRate.toFixed(1)}%`);
    console.log(`   Покриття класів: ${coverageRate.toFixed(1)}%\n`);

    // Оцінка якості
    if (matchRate >= 90) {
      this.addTestResult(
        "MATCH_QUALITY",
        "excellent",
        `Відмінна якість співставлення: ${matchRate.toFixed(1)}%`
      );
    } else if (matchRate >= 75) {
      this.addTestResult(
        "MATCH_QUALITY",
        "good",
        `Хороша якість співставлення: ${matchRate.toFixed(1)}%`
      );
    } else if (matchRate >= 50) {
      this.addTestResult(
        "MATCH_QUALITY",
        "fair",
        `Задовільна якість співставлення: ${matchRate.toFixed(1)}%`
      );
      this.addWarning(
        "MATCH_QUALITY",
        "Низький відсоток співставлення може вплинути на точність стилів"
      );
    } else {
      this.addTestResult(
        "MATCH_QUALITY",
        "poor",
        `Незадовільна якість співставлення: ${matchRate.toFixed(1)}%`
      );
      this.addError("MATCH_QUALITY", "Критично низький відсоток співставлення");
    }

    // Аналіз довіри до співставлень
    const confidenceValues = Array.from(matches.matches.values()).map(
      (match) => match.confidence
    );
    const averageConfidence =
      confidenceValues.reduce((sum, conf) => sum + conf, 0) /
      confidenceValues.length;

    console.log(
      `🔍 Середня довіра співставлення: ${(averageConfidence * 100).toFixed(
        1
      )}%`
    );

    if (averageConfidence >= 0.9) {
      this.addTestResult(
        "MATCH_CONFIDENCE",
        "excellent",
        "Висока довіра до співставлень"
      );
    } else if (averageConfidence >= 0.7) {
      this.addTestResult(
        "MATCH_CONFIDENCE",
        "good",
        "Хороша довіра до співставлень"
      );
    } else {
      this.addWarning(
        "MATCH_CONFIDENCE",
        "Низька довіра до деяких співставлень"
      );
    }
  }

  /**
   * Валідація згенерованого CSS
   */
  testCSSValidity(css) {
    console.log("✅ Тестування валідності CSS...");

    // Перевірка синтаксису CSS
    const syntaxErrors = this.validateCSSSyntax(css);
    if (syntaxErrors.length > 0) {
      syntaxErrors.forEach((error) => {
        this.addError("CSS_SYNTAX", error);
      });
    } else {
      this.addTestResult("CSS_SYNTAX", "passed", "CSS синтаксис валідний");
    }

    // Перевірка наявності основних стилів
    this.checkEssentialStyles(css);

    // Перевірка сучасних CSS властивостей
    this.checkModernCSS(css);
  }

  /**
   * Валідація CSS синтаксису
   */
  validateCSSSyntax(css) {
    const errors = [];
    const lines = css.split("\n");

    let braceCount = 0;
    let inRule = false;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Підрахунок фігурних дужок
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;

      braceCount += openBraces - closeBraces;

      if (openBraces > 0) inRule = true;
      if (closeBraces > 0) inRule = false;

      // Перевірка властивостей CSS
      if (inRule && trimmedLine.includes(":") && !trimmedLine.includes("{")) {
        if (!trimmedLine.endsWith(";") && !trimmedLine.endsWith("{")) {
          errors.push(`Рядок ${index + 1}: Відсутня крапка з комою`);
        }
      }

      // Перевірка селекторів
      if (trimmedLine.endsWith("{") && !trimmedLine.includes("@")) {
        const selector = trimmedLine.replace("{", "").trim();
        if (selector.length === 0) {
          errors.push(`Рядок ${index + 1}: Порожній селектор`);
        }
      }
    });

    if (braceCount !== 0) {
      errors.push("Незбалансовані фігурні дужки");
    }

    return errors;
  }

  /**
   * Перевірка наявності основних стилів
   */
  checkEssentialStyles(css) {
    const essentialChecks = [
      { pattern: /box-sizing:\s*border-box/, name: "Box-sizing reset" },
      { pattern: /\.container\s*{/, name: "Клас контейнера" },
      { pattern: /@media/, name: "Media queries для адаптивності" },
      { pattern: /margin:\s*0/, name: "Reset стилі" },
    ];

    essentialChecks.forEach((check) => {
      if (check.pattern.test(css)) {
        this.addTestResult(
          "ESSENTIAL_STYLES",
          "passed",
          `${check.name} присутній`
        );
      } else {
        this.addWarning("ESSENTIAL_STYLES", `${check.name} відсутній`);
      }
    });
  }

  /**
   * Перевірка сучасних CSS властивостей
   */
  checkModernCSS(css) {
    const modernFeatures = [
      { pattern: /display:\s*grid/, name: "CSS Grid" },
      { pattern: /display:\s*flex/, name: "Flexbox" },
      { pattern: /@container/, name: "Container queries" },
      { pattern: /gap:/, name: "Gap property" },
      { pattern: /aspect-ratio:/, name: "Aspect ratio" },
      { pattern: /object-fit:/, name: "Object fit" },
    ];

    let modernCount = 0;
    modernFeatures.forEach((feature) => {
      if (feature.pattern.test(css)) {
        modernCount++;
        this.addTestResult(
          "MODERN_CSS",
          "passed",
          `${feature.name} використовується`
        );
      }
    });

    if (modernCount >= 3) {
      this.addTestResult(
        "MODERN_CSS",
        "excellent",
        "Широке використання сучасного CSS"
      );
    } else if (modernCount >= 1) {
      this.addTestResult(
        "MODERN_CSS",
        "good",
        "Часткове використання сучасного CSS"
      );
    } else {
      this.addWarning(
        "MODERN_CSS",
        "Не використовуються сучасні CSS властивості"
      );
    }
  }

  /**
   * Тестування адаптивного дизайну
   */
  testResponsiveDesign(css) {
    console.log("📱 Тестування адаптивного дизайну...");

    // Перевірка media queries
    const mediaQueries =
      css.match(/@media[^{]*{[^{}]*({[^{}]*}[^{}]*)*}/g) || [];

    if (mediaQueries.length === 0) {
      this.addError("RESPONSIVE", "Відсутні media queries");
      return;
    }

    console.log(`📐 Знайдено ${mediaQueries.length} media queries`);

    // Аналіз breakpoints
    const breakpoints = [];
    mediaQueries.forEach((mq) => {
      const widthMatch = mq.match(/(?:min-width|max-width):\s*(\d+)px/g);
      if (widthMatch) {
        widthMatch.forEach((match) => {
          const width = match.match(/\d+/)[0];
          breakpoints.push(parseInt(width));
        });
      }
    });

    // Перевірка стандартних breakpoints
    const standardBreakpoints = [768, 1024, 1200];
    const hasStandardBreakpoints = standardBreakpoints.some((bp) =>
      breakpoints.some((found) => Math.abs(found - bp) < 50)
    );

    if (hasStandardBreakpoints) {
      this.addTestResult(
        "RESPONSIVE",
        "passed",
        "Використовуються стандартні breakpoints"
      );
    } else {
      this.addWarning("RESPONSIVE", "Нестандартні breakpoints");
    }
  }

  /**
   * Тестування доступності
   */
  testAccessibility(css, htmlData) {
    console.log("♿ Тестування доступності...");

    // Перевірка контрастності кольорів
    this.checkColorContrast(css);

    // Перевірка розмірів шрифтів
    this.checkFontSizes(css);

    // Перевірка інтерактивних елементів
    this.checkInteractiveElements(css, htmlData);
  }

  /**
   * Перевірка контрастності кольорів
   */
  checkColorContrast(css) {
    const colorRegex = /#[0-9a-f]{6}|rgba?\([^)]*\)/gi;
    const colors = css.match(colorRegex) || [];

    if (colors.length > 0) {
      this.addTestResult(
        "ACCESSIBILITY",
        "info",
        `Знайдено ${colors.length} кольорів для перевірки контрастності`
      );
      // Тут можна додати реальну перевірку контрастності WCAG
    }
  }

  /**
   * Перевірка розмірів шрифтів
   */
  checkFontSizes(css) {
    const fontSizeRegex = /font-size:\s*(\d+(?:\.\d+)?)px/g;
    const fontSizes = [];
    let match;

    while ((match = fontSizeRegex.exec(css)) !== null) {
      fontSizes.push(parseFloat(match[1]));
    }

    const minFontSize = Math.min(...fontSizes);

    if (minFontSize < 14) {
      this.addWarning(
        "ACCESSIBILITY",
        `Виявлені дуже малі шрифти: ${minFontSize}px`
      );
    } else if (minFontSize >= 16) {
      this.addTestResult(
        "ACCESSIBILITY",
        "passed",
        "Розміри шрифтів відповідають рекомендаціям"
      );
    }
  }

  /**
   * Перевірка інтерактивних елементів
   */
  checkInteractiveElements(css, htmlData) {
    const buttonClasses = [];
    htmlData.classMap.forEach((elements, className) => {
      elements.forEach((element) => {
        if (element.tagName === "button" || className.includes("btn")) {
          buttonClasses.push(className);
        }
      });
    });

    buttonClasses.forEach((className) => {
      const hasHoverState = css.includes(`.${className}:hover`);
      const hasFocusState = css.includes(`.${className}:focus`);

      if (!hasHoverState) {
        this.addWarning(
          "ACCESSIBILITY",
          `Кнопка .${className} не має :hover стану`
        );
      }

      if (!hasFocusState) {
        this.addWarning(
          "ACCESSIBILITY",
          `Кнопка .${className} не має :focus стану`
        );
      }
    });
  }

  /**
   * Генерація звіту тестування
   */
  generateTestReport() {
    const report = {
      timestamp: new Date().toISOString(),
      results: this.testResults,
      errors: this.validationErrors.filter((e) => e.type === "error"),
      warnings: this.validationErrors.filter((e) => e.type === "warning"),
      summary: this.generateSummary(),
    };

    console.log("\n" + "=".repeat(60));
    console.log("📋 ПІДСУМКОВИЙ ЗВІТ ТЕСТУВАННЯ");
    console.log("=".repeat(60));

    console.log(
      `\n✅ Пройдено тестів: ${
        this.testResults.filter(
          (r) =>
            r.status === "passed" ||
            r.status === "excellent" ||
            r.status === "good"
        ).length
      }`
    );
    console.log(`⚠️  Попереджень: ${report.warnings.length}`);
    console.log(`❌ Помилок: ${report.errors.length}`);

    if (report.errors.length > 0) {
      console.log("\n🚨 КРИТИЧНІ ПОМИЛКИ:");
      report.errors.forEach((error) => {
        console.log(`   - ${error.category}: ${error.message}`);
      });
    }

    if (report.warnings.length > 0) {
      console.log("\n⚠️  ПОПЕРЕДЖЕННЯ:");
      report.warnings.forEach((warning) => {
        console.log(`   - ${warning.category}: ${warning.message}`);
      });
    }

    console.log("\n" + "=".repeat(60) + "\n");

    return report;
  }

  /**
   * Генерація підсумку
   */
  generateSummary() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(
      (r) =>
        r.status === "passed" || r.status === "excellent" || r.status === "good"
    ).length;

    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

    let grade = "F";
    if (successRate >= 95) grade = "A+";
    else if (successRate >= 90) grade = "A";
    else if (successRate >= 85) grade = "A-";
    else if (successRate >= 80) grade = "B+";
    else if (successRate >= 75) grade = "B";
    else if (successRate >= 70) grade = "B-";
    else if (successRate >= 65) grade = "C+";
    else if (successRate >= 60) grade = "C";

    return {
      totalTests,
      passedTests,
      successRate: Math.round(successRate),
      grade,
      recommendation: this.getRecommendation(successRate),
    };
  }

  getRecommendation(successRate) {
    if (successRate >= 90) {
      return "Відмінна робота! Система готова до продакшену.";
    } else if (successRate >= 75) {
      return "Хороший результат. Розгляньте виправлення попереджень.";
    } else if (successRate >= 60) {
      return "Потрібні покращення перед використанням у продакшені.";
    } else {
      return "Критичні проблеми. Необхідне серйозне доопрацювання.";
    }
  }

  // Допоміжні методи
  addTestResult(category, status, message) {
    this.testResults.push({
      category,
      status,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  addError(category, message) {
    this.validationErrors.push({
      type: "error",
      category,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  addWarning(category, message) {
    this.validationErrors.push({
      type: "warning",
      category,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
// Експорт модуля
if (typeof module !== "undefined" && module.exports) {
  module.exports = TestingUtils;
}
