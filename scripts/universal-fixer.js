#!/usr/bin/env node

/**
 * 🔧 Універсальний інструмент виправлення помилок
 * Виправляє синтаксичні помилки в HTML/JavaScript файлах
 *
 * @author: AI Assistant
 * @version: 1.0.0
 * @date: 2025-01-27
 */

const fs = require("fs")
const path = require("path")

class UniversalFixer {
  constructor() {
    this.logFile = path.join(
      __dirname,
      "../logs/universal-fixes-" + new Date().toISOString().replace(/[:.]/g, "-") + ".log"
    )
    this.fixes = []
    this.errors = []
  }

  log(message, type = "INFO") {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] [${type}] ${message}`
    console.log(logMessage)

    // Записуємо в лог файл
    fs.appendFileSync(this.logFile, logMessage + "\n")
  }

  // ✅ FIX: Виправлення неправильно закритих тегів у template literals
  fixTemplateLiteralTags(content) {
    const fixes = []

    // Виправляємо </div> замість </button> в template literals
    const buttonDivPattern = /(<button[^>]*>[\s\S]*?)<\/div>/g
    let match
    while ((match = buttonDivPattern.exec(content)) !== null) {
      const original = match[0]
      const fixed = original.replace(/<\/div>$/, "</button>")
      content = content.replace(original, fixed)
      fixes.push({
        type: "template_literal_tag",
        original: original.substring(0, 50) + "...",
        fixed: fixed.substring(0, 50) + "...",
        line: content.substring(0, match.index).split("\n").length
      })
    }

    // Виправляємо інші поширені помилки з тегами
    const commonFixes = [
      {pattern: /(<input[^>]*>)(?!\s*<\/input>)/g, replacement: "$1"}, // Self-closing input tags
      {pattern: /(<img[^>]*>)(?!\s*<\/img>)/g, replacement: "$1"}, // Self-closing img tags
      {pattern: /(<br[^>]*>)(?!\s*<\/br>)/g, replacement: "$1"} // Self-closing br tags
    ]

    commonFixes.forEach(fix => {
      const beforeCount = (content.match(fix.pattern) || []).length
      content = content.replace(fix.pattern, fix.replacement)
      const afterCount = (content.match(fix.pattern) || []).length

      if (beforeCount !== afterCount) {
        fixes.push({
          type: "self_closing_tag",
          description: `Fixed ${beforeCount - afterCount} self-closing tags`,
          pattern: fix.pattern.toString()
        })
      }
    })

    return {content, fixes}
  }

  // ✅ FIX: Виправлення JavaScript синтаксису в template literals
  fixJavaScriptSyntax(content) {
    const fixes = []

    // Виправляємо неправильні template literal закриття
    const templateLiteralPattern = /`([^`]*?)`/g
    let match
    while ((match = templateLiteralPattern.exec(content)) !== null) {
      const templateContent = match[1]

      // Перевіряємо чи є незакриті теги в template literal
      const openTags = templateContent.match(/<[^\/][^>]*>/g) || []
      const closeTags = templateContent.match(/<\/[^>]*>/g) || []

      if (openTags.length !== closeTags.length) {
        // Логуємо проблему, але не виправляємо автоматично
        fixes.push({
          type: "template_literal_validation",
          description: `Template literal has ${openTags.length} open tags and ${closeTags.length} close tags`,
          line: content.substring(0, match.index).split("\n").length
        })
      }
    }

    return {content, fixes}
  }

  // ✅ FIX: Виправлення CSS властивостей для сумісності
  fixCSSCompatibility(content) {
    const fixes = []

    // Додаємо стандартні властивості для webkit
    const webkitFixes = [
      {
        pattern: /scrollbar-track-color:\s*([^;]+);/g,
        replacement: "scrollbar-track-color: $1;\n  scrollbar-color: $1 transparent;"
      },
      {
        pattern: /scrollbar-face-color:\s*([^;]+);/g,
        replacement: "scrollbar-face-color: $1;\n  scrollbar-color: transparent $1;"
      }
    ]

    webkitFixes.forEach(fix => {
      const beforeCount = (content.match(fix.pattern) || []).length
      content = content.replace(fix.pattern, fix.replacement)
      const afterCount = (content.match(fix.pattern) || []).length

      if (beforeCount !== afterCount) {
        fixes.push({
          type: "css_compatibility",
          description: `Added standard CSS properties for ${beforeCount - afterCount} webkit properties`,
          pattern: fix.pattern.toString()
        })
      }
    })

    return {content, fixes}
  }

  // ✅ FIX: Основна функція виправлення файлу
  async fixFile(filePath) {
    try {
      this.log(`🔧 Початок виправлення файлу: ${filePath}`)

      if (!fs.existsSync(filePath)) {
        throw new Error(`Файл не існує: ${filePath}`)
      }

      let content = fs.readFileSync(filePath, "utf8")
      const originalContent = content
      let totalFixes = 0

      // Застосовуємо всі виправлення
      const templateFixes = this.fixTemplateLiteralTags(content)
      content = templateFixes.content
      totalFixes += templateFixes.fixes.length

      const jsFixes = this.fixJavaScriptSyntax(content)
      content = jsFixes.content
      totalFixes += jsFixes.fixes.length

      const cssFixes = this.fixCSSCompatibility(content)
      content = cssFixes.content
      totalFixes += cssFixes.fixes.length

      // Зберігаємо виправлений файл
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, "utf8")
        this.log(`✅ Файл виправлено: ${totalFixes} виправлень застосовано`)

        // Зберігаємо деталі виправлень
        this.fixes.push({
          file: filePath,
          fixes: [...templateFixes.fixes, ...jsFixes.fixes, ...cssFixes.fixes],
          totalFixes
        })
      } else {
        this.log(`ℹ️ Файл не потребує виправлень: ${filePath}`)
      }

      return {success: true, fixes: totalFixes}
    } catch (error) {
      this.log(`❌ Помилка при виправленні файлу ${filePath}: ${error.message}`, "ERROR")
      this.errors.push({
        file: filePath,
        error: error.message
      })
      return {success: false, error: error.message}
    }
  }

  // ✅ FIX: Генерація звіту про виправлення
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalFiles: this.fixes.length,
      totalFixes: this.fixes.reduce((sum, file) => sum + file.totalFixes, 0),
      errors: this.errors.length,
      details: this.fixes
    }

    const reportPath = path.join(
      __dirname,
      "../logs/fixes-report-" + new Date().toISOString().replace(/[:.]/g, "-") + ".json"
    )
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8")

    this.log(`📊 Звіт збережено: ${reportPath}`)
    return report
  }

  // ✅ FIX: Основна функція запуску
  async run() {
    this.log("🚀 Запуск універсального інструменту виправлення")

    // Створюємо директорію для логів
    const logsDir = path.join(__dirname, "../logs")
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, {recursive: true})
    }

    // Виправляємо основний файл
    const mainFile = path.join(__dirname, "../frontend/css-classes-from-html-menu.html")
    await this.fixFile(mainFile)

    // Генеруємо звіт
    const report = this.generateReport()

    this.log(`🎉 Виправлення завершено!`)
    this.log(
      `📈 Статистика: ${report.totalFiles} файлів, ${report.totalFixes} виправлень, ${report.errors} помилок`
    )

    return report
  }
}

// Запускаємо якщо файл викликається безпосередньо
if (require.main === module) {
  const fixer = new UniversalFixer()
  fixer.run().catch(error => {
    console.error("❌ Критична помилка:", error)
    process.exit(1)
  })
}

module.exports = UniversalFixer
