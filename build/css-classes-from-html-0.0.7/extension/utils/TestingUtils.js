/**
 * Комплексна система тестування та валідації
 */
class TestingUtils {
  constructor() {
    this.testResults = []
    this.validationErrors = []
  }

  /**
   * Запуск повного тестування через інтеграцію
   */
  async runFullTestSuite(integration) {
    console.log("🧪 Запуск повного тестування через інтеграцію...")

    // Отримання даних з інтеграції з fallback
    const figmaData = integration.getFigmaData
      ? await integration.getFigmaData()
      : {hierarchy: new Map(), contentMap: new Map()}

    const htmlData = integration.getHTMLData
      ? await integration.getHTMLData()
      : {hierarchy: new Map(), classMap: new Map()}

    const matches = integration.getMatches
      ? await integration.getMatches(figmaData, htmlData)
      : {matches: new Map()}

    const generatedCSS = integration.generateCSS
      ? await integration.generateCSS(matches, figmaData, htmlData)
      : ""

    // Виклик основного тестування
    return this.runCompleteTest(figmaData, htmlData, matches, generatedCSS)
  }

  /**
   * Повне тестування системи співставлення
   */
  runCompleteTest(figmaData, htmlData, matches, generatedCSS) {
    console.log("🧪 Початок повного тестування системи...\n")

    this.testDataIntegrity(figmaData, htmlData)
    this.testMatchingQuality(matches, figmaData, htmlData)
    this.testCSSValidity(generatedCSS)
    this.testResponsiveDesign(generatedCSS)
    this.testAccessibility(generatedCSS, htmlData)

    return this.generateTestReport()
  }

  /**
   * Тестування цілісності даних
   */
  testDataIntegrity(figmaData, htmlData) {
    console.log("🔍 Тестування цілісності даних...")

    const figmaHierarchy = figmaData.hierarchy ?? new Map()
    const figmaContentMap = figmaData.contentMap ?? new Map()
    const htmlHierarchy = htmlData.hierarchy ?? new Map()
    const htmlClassMap = htmlData.classMap ?? new Map()

    // Перевірка Figma
    if (figmaHierarchy.size === 0) {
      this.addError("FIGMA_DATA", "Figma ієрархія порожня або відсутня")
    }
    if (figmaContentMap.size === 0) {
      this.addWarning("FIGMA_DATA", "Figma contentMap порожня")
    }

    // Перевірка HTML
    if (htmlHierarchy.size === 0) {
      this.addError("HTML_DATA", "HTML ієрархія порожня або відсутня")
    }
    if (htmlClassMap.size === 0) {
      this.addError("HTML_DATA", "HTML classMap порожня - немає класів для стилізації")
    }

    // Консистентність Figma
    figmaHierarchy.forEach((element, id) => {
      if (!element?.name) {
        this.addWarning("FIGMA_CONSISTENCY", `Елемент ${id} не має назви`)
      }
      if (!element?.styles || Object.keys(element.styles).length === 0) {
        this.addWarning("FIGMA_STYLES", `Елемент ${element?.name ?? id} не має стилів`)
      }
    })

    this.addTestResult("DATA_INTEGRITY", "passed", "Цілісність даних перевірена")
  }

  /**
   * Тестування якості співставлення
   */
  testMatchingQuality(matches, figmaData, htmlData) {
    console.log("🎯 Тестування якості співставлення...")

    const totalFigmaElements = (figmaData.hierarchy ?? new Map()).size
    const totalHTMLClasses = (htmlData.classMap ?? new Map()).size
    const matchedElements = (matches?.matches ?? new Map()).size

    const matchRate = totalFigmaElements > 0 ? (matchedElements / totalFigmaElements) * 100 : 0
    const coverageRate = totalHTMLClasses > 0 ? (matchedElements / totalHTMLClasses) * 100 : 0

    console.log(`📊 Статистика співставлення:`)
    console.log(`   Figma елементів: ${totalFigmaElements}`)
    console.log(`   HTML класів: ${totalHTMLClasses}`)
    console.log(`   Співставлено: ${matchedElements}`)
    console.log(`   Відсоток співставлення: ${matchRate.toFixed(1)}%`)
    console.log(`   Покриття класів: ${coverageRate.toFixed(1)}%\n`)

    if (matchRate >= 90) {
      this.addTestResult(
        "MATCH_QUALITY",
        "excellent",
        `Відмінна якість співставлення: ${matchRate.toFixed(1)}%`
      )
    } else if (matchRate >= 75) {
      this.addTestResult(
        "MATCH_QUALITY",
        "good",
        `Хороша якість співставлення: ${matchRate.toFixed(1)}%`
      )
    } else if (matchRate >= 50) {
      this.addTestResult(
        "MATCH_QUALITY",
        "fair",
        `Задовільна якість співставлення: ${matchRate.toFixed(1)}%`
      )
      this.addWarning(
        "MATCH_QUALITY",
        "Низький відсоток співставлення може вплинути на точність стилів"
      )
    } else {
      this.addTestResult(
        "MATCH_QUALITY",
        "poor",
        `Незадовільна якість співставлення: ${matchRate.toFixed(1)}%`
      )
      this.addError("MATCH_QUALITY", "Критично низький відсоток співставлення")
    }

    const confidenceValues = Array.from((matches?.matches ?? new Map()).values()).map(
      match => match?.confidence ?? 0
    )
    const averageConfidence =
      confidenceValues.length > 0
        ? confidenceValues.reduce((sum, c) => sum + c, 0) / confidenceValues.length
        : 0

    console.log(`🔍 Середня довіра співставлення: ${(averageConfidence * 100).toFixed(1)}%`)

    if (averageConfidence >= 0.9) {
      this.addTestResult("MATCH_CONFIDENCE", "excellent", "Висока довіра до співставлень")
    } else if (averageConfidence >= 0.7) {
      this.addTestResult("MATCH_CONFIDENCE", "good", "Хороша довіра до співставлень")
    } else {
      this.addWarning("MATCH_CONFIDENCE", "Низька довіра до деяких співставлень")
    }
  }

  /**
   * Валідація CSS
   */
  testCSSValidity(css) {
    console.log("✅ Тестування валідності CSS...")

    const syntaxErrors = this.validateCSSSyntax(css)
    if (syntaxErrors.length > 0) {
      syntaxErrors.forEach(error => this.addError("CSS_SYNTAX", error))
    } else {
      this.addTestResult("CSS_SYNTAX", "passed", "CSS синтаксис валідний")
    }

    this.checkEssentialStyles(css)
    this.checkModernCSS(css)
  }

  validateCSSSyntax(css) {
    const errors = []
    const lines = (css ?? "").split("\n")
    let braceCount = 0
    let inRule = false

    lines.forEach((line, index) => {
      const trimmed = line.trim()
      const open = (line.match(/\{/g) || []).length
      const close = (line.match(/\}/g) || []).length

      braceCount += open - close
      if (open > 0) inRule = true
      if (close > 0) inRule = false

      if (inRule && trimmed.includes(":") && !trimmed.endsWith(";") && !trimmed.endsWith("{")) {
        errors.push(`Рядок ${index + 1}: Відсутня крапка з комою`)
      }

      if (
        trimmed.endsWith("{") &&
        !trimmed.includes("@") &&
        trimmed.replace("{", "").trim().length === 0
      ) {
        errors.push(`Рядок ${index + 1}: Порожній селектор`)
      }
    })

    if (braceCount !== 0) errors.push("Незбалансовані фігурні дужки")
    return errors
  }

  checkEssentialStyles(css) {
    const checks = [
      {pattern: /box-sizing:\s*border-box/, name: "Box-sizing reset"},
      {pattern: /\.container\s*{/, name: "Клас контейнера"},
      {pattern: /@media/, name: "Media queries для адаптивності"},
      {pattern: /margin:\s*0/, name: "Reset стилі"}
    ]
    checks.forEach(check => {
      if (check.pattern.test(css))
        this.addTestResult("ESSENTIAL_STYLES", "passed", `${check.name} присутній`)
      else this.addWarning("ESSENTIAL_STYLES", `${check.name} відсутній`)
    })
  }

  checkModernCSS(css) {
    const features = [
      {pattern: /display:\s*grid/, name: "CSS Grid"},
      {pattern: /display:\s*flex/, name: "Flexbox"},
      {pattern: /@container/, name: "Container queries"},
      {pattern: /gap:/, name: "Gap property"},
      {pattern: /aspect-ratio:/, name: "Aspect ratio"},
      {pattern: /object-fit:/, name: "Object fit"}
    ]

    let count = 0
    features.forEach(f => {
      if (f.pattern.test(css)) {
        count++
        this.addTestResult("MODERN_CSS", "passed", `${f.name} використовується`)
      }
    })

    if (count >= 3)
      this.addTestResult("MODERN_CSS", "excellent", "Широке використання сучасного CSS")
    else if (count >= 1)
      this.addTestResult("MODERN_CSS", "good", "Часткове використання сучасного CSS")
    else this.addWarning("MODERN_CSS", "Не використовуються сучасні CSS властивості")
  }

  testResponsiveDesign(css) {
    console.log("📱 Тестування адаптивного дизайну...")
    const mediaQueries = (css ?? "").match(/@media[^{]*{[^{}]*({[^{}]*}[^{}]*)*}/g) || []
    if (mediaQueries.length === 0) return this.addError("RESPONSIVE", "Відсутні media queries")

    const breakpoints = []
    mediaQueries.forEach(mq => {
      const widths = mq.match(/(?:min-width|max-width):\s*(\d+)px/g) || []
      widths.forEach(w => breakpoints.push(parseInt(w.match(/\d+/)[0])))
    })

    const standard = [768, 1024, 1200]
    const hasStandard = standard.some(bp => breakpoints.some(b => Math.abs(b - bp) < 50))

    if (hasStandard)
      this.addTestResult("RESPONSIVE", "passed", "Використовуються стандартні breakpoints")
    else this.addWarning("RESPONSIVE", "Нестандартні breakpoints")
  }

  testAccessibility(css, htmlData) {
    console.log("♿ Тестування доступності...")
    this.checkColorContrast(css)
    this.checkFontSizes(css)
    this.checkInteractiveElements(css, htmlData)
  }

  checkColorContrast(css) {
    const colors = (css ?? "").match(/#[0-9a-f]{6}|rgba?\([^)]*\)/gi) || []
    if (colors.length > 0)
      this.addTestResult(
        "ACCESSIBILITY",
        "info",
        `Знайдено ${colors.length} кольорів для перевірки контрастності`
      )
  }

  checkFontSizes(css) {
    const fontSizes = []
    let m
    const regex = /font-size:\s*(\d+(?:\.\d+)?)px/g
    while ((m = regex.exec(css ?? "")) !== null) fontSizes.push(parseFloat(m[1]))

    if (fontSizes.length === 0) return
    const minSize = Math.min(...fontSizes)

    if (minSize < 14) this.addWarning("ACCESSIBILITY", `Виявлені дуже малі шрифти: ${minSize}px`)
    else if (minSize >= 16)
      this.addTestResult("ACCESSIBILITY", "passed", "Розміри шрифтів відповідають рекомендаціям")
  }

  checkInteractiveElements(css, htmlData) {
    const buttonClasses = []
    ;(htmlData.classMap ?? new Map()).forEach((elements, className) => {
      elements.forEach(el => {
        if (el.tagName === "button" || className.includes("btn")) buttonClasses.push(className)
      })
    })

    buttonClasses.forEach(cls => {
      if (!css.includes(`.${cls}:hover`))
        this.addWarning("ACCESSIBILITY", `Кнопка .${cls} не має :hover стану`)
      if (!css.includes(`.${cls}:focus`))
        this.addWarning("ACCESSIBILITY", `Кнопка .${cls} не має :focus стану`)
    })
  }

  generateTestReport() {
    const report = {
      timestamp: new Date().toISOString(),
      results: this.testResults,
      errors: this.validationErrors.filter(e => e.type === "error"),
      warnings: this.validationErrors.filter(e => e.type === "warning"),
      summary: this.generateSummary()
    }

    console.log("\n" + "=".repeat(60))
    console.log("📋 ПІДСУМКОВИЙ ЗВІТ ТЕСТУВАННЯ")
    console.log("=".repeat(60))
    console.log(
      `\n✅ Пройдено тестів: ${
        this.testResults.filter(r => ["passed", "excellent", "good"].includes(r.status)).length
      }`
    )
    console.log(`⚠️  Попереджень: ${report.warnings.length}`)
    console.log(`❌ Помилок: ${report.errors.length}`)

    if (report.errors.length > 0) {
      console.log("\n🚨 КРИТИЧНІ ПОМИЛКИ:")
      report.errors.forEach(e => console.log(`   - ${e.category}: ${e.message}`))
    }

    if (report.warnings.length > 0) {
      console.log("\n⚠️  ПОПЕРЕДЖЕННЯ:")
      report.warnings.forEach(w => console.log(`   - ${w.category}: ${w.message}`))
    }

    console.log("\n" + "=".repeat(60) + "\n")
    return report
  }

  generateSummary() {
    const total = this.testResults.length
    const passed = this.testResults.filter(r =>
      ["passed", "excellent", "good"].includes(r.status)
    ).length
    const rate = total > 0 ? (passed / total) * 100 : 0

    let grade = "F"
    if (rate >= 95) grade = "A+"
    else if (rate >= 90) grade = "A"
    else if (rate >= 85) grade = "A-"
    else if (rate >= 80) grade = "B+"
    else if (rate >= 75) grade = "B"
    else if (rate >= 70) grade = "B-"
    else if (rate >= 65) grade = "C+"
    else if (rate >= 60) grade = "C"

    return {
      totalTests: total,
      passedTests: passed,
      successRate: Math.round(rate),
      grade,
      recommendation: this.getRecommendation(rate)
    }
  }

  getRecommendation(rate) {
    if (rate >= 90) return "Відмінна робота! Система готова до продакшену."
    if (rate >= 75) return "Хороший результат. Розгляньте виправлення попереджень."
    if (rate >= 60) return "Потрібні покращення перед використанням у продакшені."
    return "Критичні проблеми. Необхідне серйозне доопрацювання."
  }

  addTestResult(category, status, message) {
    this.testResults.push({category, status, message, timestamp: new Date().toISOString()})
  }

  addError(category, message) {
    this.validationErrors.push({
      type: "error",
      category,
      message,
      timestamp: new Date().toISOString()
    })
  }

  addWarning(category, message) {
    this.validationErrors.push({
      type: "warning",
      category,
      message,
      timestamp: new Date().toISOString()
    })
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = TestingUtils
}
