/* !!! Головний інтегратор системи Figma → HTML/CSS !!! */
const FigmaAPIClient = require("./core/FigmaAPIClient")
const StyleMatcher = require("./core/StyleMatcher")
const CSSGenerator = require("./core/CSSGenerator")
const ModernCSSGenerator = require("./generators/ModernCSSGenerator")
const ContainerGenerator = require("./generators/ContainerGenerator")
const ValidationUtils = require("./utils/ValidationUtils")
const TestingUtils = require("./utils/TestingUtils")

class FigmaHTMLIntegration {
  constructor(config = {}) {
    this.config = config
    this.figmaClient = new FigmaAPIClient(config.token || process.env.FIGMA_TOKEN)
    this.styleMatcher = new StyleMatcher()
    this.cssGenerator = new CSSGenerator()
    this.modernCSSGenerator = new ModernCSSGenerator()
    this.containerGenerator = new ContainerGenerator({
      maxWidth: config.maxWidth || 1200,
      padding: config.padding || 20
    })
    this.validationUtils = new ValidationUtils()
    this.testingUtils = new TestingUtils()
  }

  /* --- Основний процес інтеграції --- */
  async integrate(fileKey) {
    try {
      console.log("📥 Завантаження даних з Figma...")
      const figmaData = await this.figmaClient.fetchFile(fileKey)

      console.log("🔍 Пошук відповідних стилів...")
      const matchedStyles = this.styleMatcher.matchStyles(figmaData)

      console.log("🎨 Генерація HTML...")
      const htmlData = this.generateHTML(figmaData)

      console.log("🎨 Генерація CSS...")
      const css = await this.generateCSS(matchedStyles, figmaData, htmlData)

      console.log("🔧 Валідація та оптимізація...")
      this.validationUtils.validateSystem(css, htmlData)

      console.log("🧪 Запуск повного тестування...")
      await this.testingUtils.runFullTestSuite(this, figmaData, htmlData)

      console.log("✅ Інтеграція завершена успішно!")
      return {html: htmlData, css}
    } catch (error) {
      console.error("❌ Помилка під час інтеграції:", error)
      throw error
    }
  }

  /* --- Генерація HTML (спрощена) --- */
  generateHTML(figmaData) {
    return `<div class="app-root">Figma project ${figmaData.name}</div>`
  }

  /* --- Єдиний виправлений метод generateCSS --- */
  async generateCSS(matchedStyles, figmaData, htmlData) {
    try {
      if (!matchedStyles || !figmaData || !htmlData) {
        throw new Error("Некоректні вхідні дані у generateCSS")
      }

      // ✅ fallback для hierarchy
      if (!figmaData.hierarchy) {
        console.warn("⚠️ У figmaData немає поля hierarchy. Використовую порожній об’єкт.")
        figmaData.hierarchy = new Map()
      }

      // Базова генерація CSS
      let css = this.cssGenerator.generateCSS(matchedStyles, figmaData, htmlData)

      // Додаткові сучасні стилі
      if (figmaData.hierarchy.size > 0) {
        const firstElement = figmaData.hierarchy.values().next().value
        const modernStyles = this.modernCSSGenerator.generateModernStyles(firstElement, {})
        css += "\n\n" + this.modernCSSGenerator.compileToCSS(modernStyles)
      }

      // Генерація контейнерної системи
      const containerSystem = this.containerGenerator.generateContainerSystem({
        maxWidth: this.config.maxWidth || 1200,
        padding: this.config.padding || 20
      })

      // Додаємо mixins автоматично
      if (containerSystem.mixins) {
        let mixinsCSS = "\n/* Container Mixins */\n"
        Object.entries(containerSystem.mixins).forEach(([name, styles]) => {
          mixinsCSS += `.${name} {\n`
          Object.entries(styles).forEach(([prop, value]) => {
            const cssProp = prop.replace(/([A-Z])/g, "-$1").toLowerCase()
            mixinsCSS += `  ${cssProp}: ${value};\n`
          })
          mixinsCSS += "}\n\n"
        })
        css += mixinsCSS
      }

      // Додаємо іншу CSS систему
      css += "\n\n" + this.containerGenerator.compileToCSS(containerSystem)

      return css
    } catch (error) {
      console.error("❌ Помилка у generateCSS:", error.message)
      throw error
    }
  }
}

module.exports = FigmaHTMLIntegration

// --- Тестовий запуск ---
if (require.main === module) {
  const integration = new FigmaHTMLIntegration({maxWidth: 1400})
  integration
    .integrate("FILE_KEY")
    .then(res => {
      console.log("✅ HTML:", res.html)
      console.log("✅ CSS:", res.css.substring(0, 300) + "...")
    })
    .catch(err => console.error("❌ Помилка:", err))
}
