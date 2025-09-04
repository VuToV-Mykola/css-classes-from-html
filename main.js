#!/usr/bin/env node

/**
 * Figma-HTML Integration System
 * Головний модуль системи
 * @version 2.0.0
 */

// Завантаження модулів
const FigmaAPIClient = require("./core/FigmaAPIClient");
const HTMLParser = require("./core/HTMLParser");
const StyleMatcher = require("./core/StyleMatcher");
const CSSGenerator = require("./core/CSSGenerator");
const HierarchyAnalyzer = require("./core/HierarchyAnalyzer");

const ContentAnalyzer = require("./analyzers/ContentAnalyzer");
const LayoutAnalyzer = require("./analyzers/LayoutAnalyzer");
const ResponsiveAnalyzer = require("./analyzers/ResponsiveAnalyzer");

const ModernCSSGenerator = require("./generators/ModernCSSGenerator");
const FlexboxGridGenerator = require("./generators/FlexboxGridGenerator");
const ContainerGenerator = require("./generators/ContainerGenerator");

const ValidationUtils = require("./utils/ValidationUtils");
const OptimizationUtils = require("./utils/OptimizationUtils");
const TestingUtils = require("./utils/TestingUtils");

const fs = require("fs");
const path = require("path");
require("dotenv").config();

/**
 * Головний клас системи
 */
class FigmaHTMLIntegration {
  constructor(config = {}) {
    this.config = {
      figmaToken: config.figmaToken || process.env.FIGMA_API_TOKEN,
      outputDir: config.outputDir || process.env.OUTPUT_DIR || "./output",
      debug: config.debug || process.env.DEBUG === "true",
      ...config,
    };

    this.initializeModules();
    this.setupOutputDirectory();
  }

  initializeModules() {
    // Core модулі
    this.figmaClient = new FigmaAPIClient(this.config.figmaToken);
    this.htmlParser = new HTMLParser();
    this.styleMatcher = new StyleMatcher();
    this.cssGenerator = new CSSGenerator(this.config);
    this.hierarchyAnalyzer = new HierarchyAnalyzer();

    // Analyzers
    this.contentAnalyzer = new ContentAnalyzer();
    this.layoutAnalyzer = new LayoutAnalyzer();
    this.responsiveAnalyzer = new ResponsiveAnalyzer();

    // Generators
    this.modernCSSGenerator = new ModernCSSGenerator(this.config);
    this.flexboxGridGenerator = new FlexboxGridGenerator(this.config);
    this.containerGenerator = new ContainerGenerator(this.config);

    // Utils
    this.validator = new ValidationUtils(this.config);
    this.optimizer = new OptimizationUtils(this.config);
    this.tester = new TestingUtils(this.config);
  }

  setupOutputDirectory() {
    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true });
    }
  }

  /**
   * Головний метод інтеграції
   */
  async integrate(figmaFileKey, htmlContent, options = {}) {
    console.log("🚀 Початок інтеграції Figma-HTML...\n");

    try {
      // 1. Отримання даних з Figma
      console.log("📥 Завантаження даних з Figma...");
      const figmaData = await this.figmaClient.getFileStructure(figmaFileKey);
      console.log(`✅ Завантажено ${figmaData.hierarchy.size} елементів\n`);

      // 2. Парсинг HTML
      console.log("🔍 Аналіз HTML структури...");
      const htmlData = this.htmlParser.parseHTML(htmlContent);
      console.log(`✅ Проаналізовано ${htmlData.hierarchy.size} елементів\n`);

      // 3. Аналіз ієрархій
      console.log("📊 Аналіз ієрархічних структур...");
      const hierarchyComparison = this.hierarchyAnalyzer.compareHierarchies(
        figmaData.hierarchy,
        htmlData.hierarchy
      );
      console.log(
        `✅ Схожість структур: ${(
          hierarchyComparison.overallSimilarity * 100
        ).toFixed(1)}%\n`
      );

      // 4. Співставлення стилів
      console.log("🎯 Співставлення елементів...");
      const matchedStyles = this.styleMatcher.matchStyles(figmaData, htmlData);
      console.log(`✅ Співставлено ${matchedStyles.matches.size} елементів\n`);

      // 5. Аналіз контенту та макетів
      console.log("📝 Детальний аналіз елементів...");
      await this.performDetailedAnalysis(figmaData, htmlData, matchedStyles);

      // 6. Генерація CSS
      console.log("🎨 Генерація CSS стилів...");
      const css = await this.generateCSS(matchedStyles, figmaData, htmlData);
      console.log("✅ CSS успішно згенеровано\n");

      // 7. Валідація та оптимізація
      console.log("🔧 Валідація та оптимізація...");
      const validated = this.validator.validateSystem({
        figmaData,
        htmlData,
        css,
        matches: matchedStyles,
      });
      const optimized = this.optimizer.optimizeSystem({
        css,
        html: htmlContent,
      });
      console.log("✅ Система валідована та оптимізована\n");

      // 8. Тестування
      if (this.config.runTests !== false) {
        console.log("🧪 Запуск тестів...");
        const testResults = await this.tester.runFullTestSuite(this);
        console.log(
          `✅ Тести пройдено: ${testResults.passed}/${
            testResults.passed + testResults.failed
          }\n`
        );
      }

      // 9. Збереження результатів
      console.log("💾 Збереження результатів...");
      await this.saveResults({
        css: optimized.css,
        matches: matchedStyles,
        analysis: hierarchyComparison,
        validation: validated,
        tests: this.config.runTests !== false ? testResults : null,
      });

      console.log("🎉 Інтеграція завершена успішно!");

      return {
        success: true,
        css: optimized.css,
        matches: matchedStyles,
        statistics: matchedStyles.statistics,
      };
    } catch (error) {
      console.error("❌ Помилка під час інтеграції:", error);
      throw error;
    }
  }

  async performDetailedAnalysis(figmaData, htmlData, matchedStyles) {
    const analyses = new Map();

    matchedStyles.matches.forEach((match, figmaId) => {
      const figmaElement = figmaData.hierarchy.get(figmaId);
      const htmlElement = htmlData.hierarchy.get(match.htmlElement);

      analyses.set(figmaId, {
        content: this.contentAnalyzer.analyzeContent(figmaElement),
        layout: this.layoutAnalyzer.analyzeLayout(figmaElement),
        responsive: this.responsiveAnalyzer.analyzeResponsiveness(
          figmaElement,
          figmaData
        ),
      });
    });

    return analyses;
  }

  async generateCSS(matchedStyles, figmaData, htmlData) {
    // Базова генерація
    let css = this.cssGenerator.generateCSS(matchedStyles, figmaData, htmlData);

    // Додавання сучасних властивостей
    const modernStyles = this.modernCSSGenerator.generateModernStyles(
      figmaData.hierarchy.values().next().value,
      {}
    );
    css += "\n\n" + this.modernCSSGenerator.compileToCSS(modernStyles);

    // Генерація контейнерної системи
    const containerSystem = this.containerGenerator.generateContainerSystem({
      maxWidth: 1200,
      padding: 20,
    });
    css += "\n\n" + this.containerGenerator.compileToCSS(containerSystem);

    return css;
  }

  async saveResults(results) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    // CSS файл
    fs.writeFileSync(
      path.join(this.config.outputDir, `styles_${timestamp}.css`),
      results.css,
      "utf8"
    );

    // Звіт співставлення
    fs.writeFileSync(
      path.join(this.config.outputDir, `matches_${timestamp}.json`),
      JSON.stringify(results.matches, null, 2),
      "utf8"
    );

    // Повний звіт
    fs.writeFileSync(
      path.join(this.config.outputDir, `report_${timestamp}.json`),
      JSON.stringify(
        {
          analysis: results.analysis,
          validation: results.validation,
          tests: results.tests,
          timestamp,
        },
        null,
        2
      ),
      "utf8"
    );
  }
}

// CLI інтерфейс
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log("Використання: node main.js <figma-file-key> <html-file>");
    process.exit(1);
  }

  const figmaKey = args[0];
  const htmlFile = args[1];

  if (!fs.existsSync(htmlFile)) {
    console.error(`Файл не знайдено: ${htmlFile}`);
    process.exit(1);
  }

  const htmlContent = fs.readFileSync(htmlFile, "utf8");
  const integration = new FigmaHTMLIntegration();

  integration
    .integrate(figmaKey, htmlContent)
    .then((result) => {
      if (result.success) {
        console.log("\n✅ Успішно завершено!");
        console.log(
          `📊 Статистика: ${result.statistics.matchPercentage.toFixed(
            1
          )}% співставлено`
        );
      }
    })
    .catch((error) => {
      console.error("\n❌ Помилка:", error.message);
      process.exit(1);
    });
}

module.exports = FigmaHTMLIntegration;
