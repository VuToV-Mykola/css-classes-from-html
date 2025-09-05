/**
 * @module ValidationUtils
 * @description Утиліти для валідації даних, стилів та структур (оновлений стиль з fallback)
 * @author Ukrainian Developer
 * @version 2.1.0
 */

class ValidationUtils {
  constructor(options = {}) {
    this.options = {
      strictMode: false,
      throwOnError: false,
      logWarnings: true,
      validateCSS: true,
      validateHTML: true,
      validateAccessibility: true,
      ...options
    }

    this.errors = []
    this.warnings = []
    this.validationResults = new Map()
  }

  /**
   * Комплексна валідація системи
   * @param {Object} data - Дані для валідації
   * @returns {Object} Результати валідації
   */
  validateSystem(data = {}) {
    this.clearResults()

    const results = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      details: {}
    }

    const figmaData = data.figmaData ?? {hierarchy: new Map(), contentMap: new Map()}
    const htmlData = data.htmlData ?? {hierarchy: new Map(), classMap: new Map()}
    const css = data.css ?? ""
    const matches = data.matches ?? {matches: new Map(), statistics: {}}

    // Валідація Figma
    results.details.figma = this.validateFigmaData(figmaData)
    if (!results.details.figma.valid) results.valid = false

    // Валідація HTML
    if (this.options.validateHTML) {
      results.details.html = this.validateHTMLData(htmlData)
      if (!results.details.html.valid) results.valid = false
    }

    // Валідація CSS
    if (this.options.validateCSS) {
      results.details.css = this.validateCSS(css)
      if (!results.details.css.valid) results.valid = false
    }

    // Валідація співставлень
    results.details.matches = this.validateMatches(matches)
    if (!results.details.matches.valid) results.valid = false

    // Валідація доступності
    if (this.options.validateAccessibility) {
      results.details.accessibility = this.validateAccessibility({css, htmlData})
      if (!results.details.accessibility.valid && this.options.strictMode) results.valid = false
    }

    // Збір всіх помилок та попереджень
    results.errors = this.errors
    results.warnings = this.warnings
    results.suggestions = this.generateSuggestions(results)

    return results
  }

  // --- Figma ---
  validateFigmaData(figmaData) {
    const validation = {valid: true, errors: [], warnings: []}

    if (!figmaData.hierarchy || !(figmaData.hierarchy instanceof Map)) {
      validation.valid = false
      validation.errors.push({
        type: "STRUCTURE_ERROR",
        message: "Відсутня або некоректна ієрархія Figma"
      })
    }

    if (figmaData.hierarchy) {
      figmaData.hierarchy.forEach((el, id) => {
        const elValidation = this.validateFigmaElement(el, id)
        if (!elValidation.valid) validation.errors.push(...elValidation.errors)
        validation.warnings.push(...elValidation.warnings)
      })
    }

    if (!figmaData.contentMap || !(figmaData.contentMap instanceof Map)) {
      validation.warnings.push({
        type: "MISSING_CONTENT_MAP",
        message: "Відсутня контент-мапа Figma"
      })
    }

    return validation
  }

  validateFigmaElement(element = {}, id) {
    const validation = {valid: true, errors: [], warnings: []}

    if (!element.name)
      validation.warnings.push({
        type: "MISSING_NAME",
        elementId: id,
        message: `Елемент ${id} не має назви`
      })
    if (!element.type) {
      validation.valid = false
      validation.errors.push({
        type: "MISSING_TYPE",
        elementId: id,
        message: `Елемент ${id} не має типу`
      })
    }

    if (element.styles) {
      const styleValidation = this.validateStyles(element.styles)
      if (!styleValidation.valid) validation.warnings.push(...styleValidation.errors)
    }

    if (element.absoluteBoundingBox) {
      const bboxValidation = this.validateBoundingBox(element.absoluteBoundingBox)
      if (!bboxValidation.valid) validation.warnings.push(...bboxValidation.errors)
    }

    return validation
  }

  // --- HTML ---
  validateHTMLData(htmlData) {
    const validation = {valid: true, errors: [], warnings: []}

    if (!htmlData.hierarchy || !(htmlData.hierarchy instanceof Map)) {
      validation.valid = false
      validation.errors.push({
        type: "HTML_STRUCTURE_ERROR",
        message: "Відсутня або некоректна HTML ієрархія"
      })
    }

    if (!htmlData.classMap || !(htmlData.classMap instanceof Map)) {
      validation.warnings.push({type: "MISSING_CLASS_MAP", message: "Відсутня мапа класів HTML"})
    }

    if (htmlData.hierarchy) {
      htmlData.hierarchy.forEach(el => {
        const elValidation = this.validateHTMLElement(el)
        if (!elValidation.valid) validation.warnings.push(...elValidation.errors)
      })
    }

    const semanticValidation = this.validateSemanticHTML(htmlData)
    validation.warnings.push(...(semanticValidation.warnings ?? []))

    return validation
  }

  validateHTMLElement(element = {}) {
    const validation = {valid: true, errors: [], warnings: []}

    if (!element.tagName) {
      validation.valid = false
      validation.errors.push({type: "MISSING_TAG", message: "HTML елемент без тегу"})
    }

    if (element.classes?.length > 0) {
      element.classes.forEach(c => {
        if (!this.isValidClassName(c))
          validation.warnings.push({
            type: "INVALID_CLASS_NAME",
            className: c,
            message: `Некоректна назва класу: ${c}`
          })
      })
    }

    if (element.attributes) {
      Object.entries(element.attributes).forEach(([attr, value]) => {
        if (!this.isValidAttribute(attr, value))
          validation.warnings.push({
            type: "INVALID_ATTRIBUTE",
            attribute: attr,
            value,
            message: `Некоректний атрибут: ${attr}="${value}"`
          })
      })
    }

    return validation
  }

  validateSemanticHTML(htmlData) {
    const warnings = []
    const semanticTags = ["header", "nav", "main", "article", "section", "aside", "footer"]
    const hasSemantic = Array.from(htmlData.hierarchy.values()).some(el =>
      semanticTags.includes(el.tagName)
    )
    if (!hasSemantic)
      warnings.push({type: "NO_SEMANTIC_TAGS", message: "Відсутні семантичні HTML5 теги"})
    return {warnings}
  }

  // --- CSS ---
  validateCSS(css = "") {
    const validation = {valid: true, errors: [], warnings: []}
    const syntaxErrors = this.validateCSSSyntax(css)
    if (syntaxErrors.length) {
      validation.valid = false
      validation.errors.push(...syntaxErrors)
    }

    validation.warnings.push(...this.validateCSSProperties(css))
    validation.warnings.push(...this.validateCSSSelectors(css))
    validation.warnings.push(...this.findDuplicateRules(css))
    validation.warnings.push(...this.findUnusedStyles(css))

    return validation
  }

  validateCSSSyntax(css = "") {
    const errors = []
    let braceCount = 0
    let inRule = false
    let inComment = false
    const lines = css.split("\n")

    lines.forEach((line, idx) => {
      const trim = line.trim()
      if (trim.startsWith("/*")) inComment = true
      if (trim.endsWith("*/")) inComment = false
      if (inComment) return

      const open = (line.match(/\{/g) || []).length
      const close = (line.match(/\}/g) || []).length
      braceCount += open - close

      if (open > 0) {
        inRule = true
      }
      if (close > 0) {
        inRule = false
      }

      if (
        inRule &&
        trim.includes(":") &&
        !trim.includes("{") &&
        !trim.endsWith(";") &&
        !trim.endsWith("}")
      ) {
        errors.push({
          type: "CSS_SYNTAX_ERROR",
          line: idx + 1,
          message: `Рядок ${idx + 1}: Відсутня крапка з комою`
        })
      }
    })

    if (braceCount !== 0)
      errors.push({
        type: "UNBALANCED_BRACES",
        message: `Незбалансовані дужки (різниця: ${braceCount})`
      })
    return errors
  }

  validateCSSProperties(css = "") {
    const warnings = []
    const deprecated = ["clip", "ime-mode", "filter", "scrollbar-*"]
    const vendor = ["-webkit-", "-moz-", "-ms-", "-o-"]

    deprecated.forEach(p => {
      if (css.includes(p))
        warnings.push({
          type: "DEPRECATED_PROPERTY",
          property: p,
          message: `Застаріла властивість: ${p}`
        })
    })
    vendor.forEach(pref => {
      const matches = css.match(new RegExp(`${pref}[a-z-]+`, "g")) || []
      matches.forEach(m =>
        warnings.push({
          type: "VENDOR_PREFIX",
          property: m,
          message: `Розгляньте autoprefixer: ${m}`
        })
      )
    })
    const importantCount = (css.match(/!important/g) || []).length
    if (importantCount > 5)
      warnings.push({
        type: "EXCESSIVE_IMPORTANT",
        count: importantCount,
        message: `Надмірне використання !important (${importantCount})`
      })

    return warnings
  }

  validateCSSSelectors(css = "") {
    const warnings = []
    const regex = /([^{]+)\{/g
    let match
    while ((match = regex.exec(css)) !== null) {
      const sel = match[1].trim()
      if (!this.isValidSelector(sel))
        warnings.push({
          type: "INVALID_SELECTOR",
          selector: sel,
          message: `Некоректний CSS селектор: "${sel}"`
        })
    }
    return warnings
  }

  findDuplicateRules(css = "") {
    const warnings = []
    const rules = new Map()
    const regex = /([^{]+)\{[^}]+\}/g
    let match
    while ((match = regex.exec(css)) !== null) {
      const sel = match[1].trim()
      if (rules.has(sel))
        warnings.push({
          type: "DUPLICATE_RULE",
          selector: sel,
          message: `Дублікат правила для селектора: ${sel}`
        })
      else rules.set(sel, true)
    }
    return warnings
  }

  findUnusedStyles(css = "") {
    const warnings = []
    const regex = /([.#][a-zA-Z0-9_-]+\s*){4,}/g
    const matches = css.match(regex) || []
    matches.forEach(m =>
      warnings.push({
        type: "OVER_SPECIFIC",
        selector: m.trim(),
        message: `Надмірна специфічність селектора: ${m.trim()}`
      })
    )
    return warnings
  }

  // --- Matches ---
  validateMatches(matches = {}) {
    const validation = {valid: true, errors: [], warnings: []}
    if (!matches.matches || !(matches.matches instanceof Map)) {
      validation.valid = false
      validation.errors.push({
        type: "INVALID_MATCHES",
        message: "Некоректна структура співставлень"
      })
      return validation
    }

    let lowConf = 0
    matches.matches.forEach((match, id) => {
      if ((match?.confidence ?? 0) < 0.5) {
        lowConf++
        validation.warnings.push({
          type: "LOW_CONFIDENCE_MATCH",
          figmaId: id,
          confidence: match.confidence,
          message: `Низька довіра для співставлення: ${id} (${(match.confidence * 100).toFixed(
            1
          )}%)`
        })
      }
    })

    const coverage = matches.statistics?.matchPercentage ?? 0
    if (coverage < 50)
      validation.warnings.push({
        type: "LOW_COVERAGE",
        coverage,
        message: `Низьке покриття співставлень: ${coverage.toFixed(1)}%`
      })

    return validation
  }

  // --- Accessibility ---
  validateAccessibility(data = {}) {
    const validation = {valid: true, errors: [], warnings: []}
    validation.warnings.push(...this.validateColorContrast(data.css ?? ""))
    if (data.htmlData) {
      validation.warnings.push(...this.validateSemanticStructure(data.htmlData))
      validation.warnings.push(...this.validateARIA(data.htmlData))
    }
    validation.warnings.push(...this.validateInteractiveElements(data))
    return validation
  }

  validateColorContrast(css = "") {
    const issues = []
    const colors = css.match(/#[0-9a-f]{3,6}|rgba?\([^)]+\)/gi) || []
    colors.forEach(c => {
      if (this.isLowContrast(c))
        issues.push({
          type: "LOW_CONTRAST",
          color: c,
          message: `Можливо низький контраст для кольору: ${c}`
        })
    })
    return issues
  }

  validateSemanticStructure(htmlData = {}) {
    const issues = []
    const headings = []
    htmlData.hierarchy?.forEach(el => {
      if (/^h[1-6]$/.test(el.tagName)) headings.push({level: parseInt(el.tagName[1]), element: el})
      if (el.tagName === "button" && !el.textContent)
        issues.push({type: "BUTTON_NO_TEXT", element: el.id, message: "Кнопка без тексту"})
      if (el.tagName === "a" && !el.attributes?.href)
        issues.push({type: "LINK_NO_HREF", element: el.id, message: "Посилання без href"})
      if (el.tagName === "img" && !el.attributes?.alt)
        issues.push({type: "IMG_NO_ALT", element: el.id, message: "Зображення без alt"})
    })

    for (let i = 1; i < headings.length; i++) {
      if (headings[i].level - headings[i - 1].level > 1)
        issues.push({
          type: "HEADING_SKIP",
          from: `h${headings[i - 1].level}`,
          to: `h${headings[i].level}`,
          message: `Пропущено рівень заголовка: h${headings[i - 1].level} -> h${headings[i].level}`
        })
    }

    return issues
  }

  validateARIA(htmlData = {}) {
    const issues = []
    const validRoles = [
      "button",
      "navigation",
      "main",
      "banner",
      "contentinfo",
      "complementary",
      "search",
      "form",
      "region"
    ]
    htmlData.hierarchy?.forEach(el => {
      if (el.attributes) {
        if (el.attributes.role && !validRoles.includes(el.attributes.role))
          issues.push({
            type: "INVALID_ARIA_ROLE",
            role: el.attributes.role,
            element: el.id,
            message: `Некоректний ARIA role: ${el.attributes.role}`
          })
        if (
          ["button", "a", "input"].includes(el.tagName) &&
          !el.attributes["aria-label"] &&
          !el.textContent
        )
          issues.push({
            type: "MISSING_ARIA_LABEL",
            element: el.id,
            message: "Інтерактивний елемент без aria-label або тексту"
          })
      }
    })
    return issues
  }

  validateInteractiveElements(data = {}) {
    const issues = []
    const css = data.css ?? ""
    if (!css.includes(":focus"))
      issues.push({type: "NO_FOCUS_STYLES", message: "Відсутні стилі для :focus"})
    if (!css.includes(":hover"))
      issues.push({type: "NO_HOVER_STYLES", message: "Відсутні стилі для :hover"})

    const minSize = 44
    const regex = /\.(btn|button)[^{]*\{[^}]*(width|height):\s*(\d+)px/g
    let match
    while ((match = regex.exec(css)) !== null) {
      const size = parseInt(match[3])
      if (size < minSize)
        issues.push({
          type: "SMALL_INTERACTIVE_ELEMENT",
          size,
          minSize,
          message: `Інтерактивний елемент занадто малий: ${size}px (мінімум ${minSize}px)`
        })
    }

    return issues
  }

  // --- Helpers ---
  isValidClassName(c) {
    return /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(c)
  }
  isValidAttribute(attr, val) {
    return !["onclick", "onmouseover", "onerror"].includes(attr?.toLowerCase())
  }
  isValidSelector(sel) {
    if (!sel) return false
    try {
      if (typeof document !== "undefined") {
        document.querySelector(sel)
        return true
      }
    } catch {}
    return /^[.#]?[a-zA-Z][a-zA-Z0-9_-]*(\s+[.#]?[a-zA-Z][a-zA-Z0-9_-]*)*$/.test(sel)
  }
  validateStyles(styles = {}) {
    const validation = {valid: true, errors: []}
    Object.entries(styles).forEach(([prop, val]) => {
      if (val === undefined || val === null) {
        validation.valid = false
        validation.errors.push({
          type: "INVALID_STYLE_VALUE",
          property: prop,
          message: `Некоректне значення для властивості ${prop}`
        })
      }
    })
    return validation
  }
  validateBoundingBox(bbox = {}) {
    const v = {valid: true, errors: []}
    if (bbox.width <= 0) {
      v.valid = false
      v.errors.push({type: "INVALID_WIDTH", message: `Некоректна ширина: ${bbox.width}`})
    }
    if (bbox.height <= 0) {
      v.valid = false
      v.errors.push({type: "INVALID_HEIGHT", message: `Некоректна висота: ${bbox.height}`})
    }
    return v
  }
  isLowContrast(color) {
    if (color.includes("#")) {
      const hex = color.replace("#", ""),
        r = parseInt(hex.substr(0, 2), 16),
        g = parseInt(hex.substr(2, 2), 16),
        b = parseInt(hex.substr(4, 2), 16),
        lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
      return lum > 0.9
    }
    return false
  }

  generateSuggestions(results = {}) {
    const suggestions = []
    if ((results.errors?.length ?? 0) > 5)
      suggestions.push({
        type: "CRITICAL",
        message: "Виявлено критичні проблеми. Рекомендується детальна перевірка коду."
      })
    if (results.warnings?.some(w => w.type === "LOW_COVERAGE"))
      suggestions.push({
        type: "IMPROVEMENT",
        message: "Низьке покриття співставлень. Перевірте назви класів та структуру."
      })
    if (results.warnings?.some(w => w.type === "NO_SEMANTIC_TAGS"))
      suggestions.push({
        type: "SEMANTIC",
        message: "Використовуйте семантичні HTML5 теги для кращої доступності."
      })
    if (results.warnings?.some(w => w.type === "EXCESSIVE_IMPORTANT"))
      suggestions.push({
        type: "CSS_QUALITY",
        message: "Зменшіть використання !important через рефакторинг специфічності."
      })
    return suggestions
  }

  clearResults() {
    this.errors = []
    this.warnings = []
    this.validationResults.clear()
  }
  addError(e) {
    this.errors.push(e)
    if (this.options.throwOnError) throw new Error(e.message)
  }
  addWarning(w) {
    this.warnings.push(w)
    if (this.options.logWarnings) console.warn(w.message)
  }
}

// --- Export ---
if (typeof module !== "undefined" && module.exports) module.exports = ValidationUtils
