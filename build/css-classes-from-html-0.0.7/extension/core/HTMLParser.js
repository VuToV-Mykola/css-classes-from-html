/**
 * HTMLParser.js
 * Модуль парсингу HTML для інтеграції з Figma
 * @version 2.0.0
 */

const fs = require("fs")
const {JSDOM} = require("jsdom")

class HTMLParser {
  constructor() {
    // Map елементів по ID для швидкого доступу
    this.hierarchy = new Map()
    this.contentMap = new Map()
  }

  /**
   * Основний метод парсингу HTML
   * @param {string} htmlContent - HTML як рядок
   * @returns {Object} { hierarchy, contentMap }
   */
  parseHTML(htmlContent) {
    if (!htmlContent || typeof htmlContent !== "string") {
      throw new Error("Невірний HTML контент для парсингу")
    }

    // Створюємо DOM
    const dom = new JSDOM(htmlContent)
    const document = dom.window.document

    // Ініціалізація
    this.hierarchy.clear()
    this.contentMap.clear()

    // Рекурсивний обхід DOM
    this._traverseElement(document.body, null, "")

    return {
      hierarchy: this.hierarchy,
      contentMap: this.contentMap
    }
  }

  /**
   * Рекурсивне обходження елементів
   * @param {HTMLElement} element
   * @param {string|null} parentId
   * @param {string} path
   */
  _traverseElement(element, parentId = null, path = "") {
    if (!element) return

    const elId = element.getAttribute("id") || this._generateId()
    const children = Array.from(element.children || [])

    // Рівень вкладеності
    const level = path ? path.split("/").length : 0

    // Семантична роль
    const semanticRole = this._getSemanticRole(element)

    // Створення об’єкта елементу
    const elObj = {
      id: elId,
      tagName: element.tagName.toLowerCase(),
      textContent: (element.textContent || "").trim(),
      classes: Array.from(element.classList || []),
      children: [],
      parent: parentId,
      path: path ? `${path}/${elId}` : elId,
      level,
      semanticRole,
      matchedChildren: new Set(),
      matchedClasses: new Set()
    }

    // Додаємо до hierarchy
    this.hierarchy.set(elId, elObj)

    // Додаємо до contentMap, якщо є текст
    if (elObj.textContent) {
      this.contentMap.set(elObj.textContent, elObj)
    }

    // Рекурсивно додаємо дітей
    children.forEach(child => {
      const childObj = this._traverseElement(child, elId, elObj.path)
      if (childObj) {
        elObj.children.push(childObj.id)
      }
    })

    return elObj
  }

  /**
   * Генератор унікального ID
   */
  _generateId() {
    return "el_" + Math.random().toString(36).substring(2, 10)
  }

  /**
   * Визначає семантичну роль HTML елементу
   * @param {HTMLElement} element
   */
  _getSemanticRole(element) {
    const tag = element.tagName.toLowerCase()
    const roleAttr = element.getAttribute("role")

    if (roleAttr) return roleAttr

    switch (tag) {
      case "button":
        return "interactive"
      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "h5":
      case "h6":
        return "heading"
      case "nav":
      case "ul":
      case "ol":
        return "navigation"
      case "img":
        return "image"
      case "section":
      case "article":
      case "aside":
      case "main":
        return "content-section"
      default:
        return "generic"
    }
  }

  /**
   * Завантаження HTML з файлу
   * @param {string} filePath
   */
  loadHTML(filePath) {
    if (!filePath || typeof filePath !== "string") {
      throw new Error("Невірний шлях до HTML файлу")
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`Файл не знайдено: ${filePath}`)
    }

    return fs.readFileSync(filePath, "utf8")
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = HTMLParser
}
