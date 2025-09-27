const { logger } = require("../utils/Logger");
/**
 * ✅ FIX: Розширений HTML парсер з правильним обробкою закриваючих тегів
 * Зберігає текст для порівняння з Figma вузлами
 * @version 2.0.0 - ADVANCED PARSING;
 */

const { JSDOM } = require("jsdom");

class AdvancedHTMLParser {
  constructor() {
    this.elements = [];
    this.textElements = [];
    this.hierarchy = [];
  }

  /**
   * ✅ FIX: Парсинг HTML з правильним обробкою закриваючих тегів
   */
  parseHTML(htmlContent) {
    try {
      const dom = new JSDOM(htmlContent);
      const document = dom.window.document;
      
      // Очищаємо попередні дані
      this.elements = [];
      this.textElements = [];
      this.hierarchy = [];
      
      // Парсимо всі елементи з збереженням порядку
      this.parseElement(document.body || document.documentElement, 0, 0);
      
      logger.info("📊 HTML парсинг завершено:");
      logger.info(`   • Всього елементів: ${this.elements.length}`);
      logger.info(`   • Текстових елементів: ${this.textElements.length}`);
      logger.info(`   • Ієрархічних рівнів: ${this.hierarchy.length}`);
      
      return {
        elements: this.elements,
        textElements: this.textElements,
        hierarchy: this.hierarchy,
        totalElements: this.elements.length,
        textElementsCount: this.textElements.length;
      };
      
    } catch (error) {
      logger.error("❌ Помилка парсингу HTML:", error);
      return {
        elements: [],
        textElements: [],
        hierarchy: [],
        totalElements: 0,
        textElementsCount: 0;
      };
    }
  }

  /**
   * ✅ FIX: Рекурсивний парсинг елементів з збереженням тексту
   */
  parseElement(element, depth = 0, domIndex = 0) {
    if (!element || element.nodeType !== 1) return;
    
    // Отримуємо текстовий вміст елемента
    const textContent = this.extractTextContent(element);
    const hasText = textContent && textContent.trim().length > 0;
    
    // Створюємо об"єкт елемента
    const elementData = {
      internalId: this.generateElementId(),
      tagName: element.tagName.toLowerCase(),
      className: this.cleanClassName(element.className || ""),
      id: element.id || "",
      textContent: textContent,
      hasText: hasText,
      depth: depth,
      domIndex: domIndex, // ✅ FIX: Зберігаємо порядок в DOM;
      parent: null,
      children: [],
      attributes: this.extractAttributes(element),
      boundingRect: this.getBoundingRect(element),
      isTextElement: hasText,
      isContainer: element.children.length > 0,
      isSelfClosing: this.isSelfClosingTag(element.tagName)
    };
    
    // Додаємо до списку елементів
    this.elements.push(elementData);
    
    // Якщо елемент містить текст, додаємо до текстових
    if (hasText) {
      this.textElements.push(elementData);
    }
    
    // Додаємо до ієрархії
    this.addToHierarchy(elementData, depth);
    
    // Рекурсивно обробляємо дочірні елементи
    Array.from(element.children).forEach((child, index) => {
      const childData = this.parseElement(child, depth + 1, domIndex + index + 1);
      if (childData) {
        childData.parent = elementData;
        elementData.children.push(childData);
      }
    });
    
    return elementData;
  }

  /**
   * ✅ FIX: Витягування текстового вмісту з елемента
   */
  extractTextContent(element) {
    if (!element) return "";
    
    // Отримуємо весь текстовий вміст
    let text = element.textContent || "";
    
    // Очищаємо від зайвих пробілів та переносів
    text = text.replace(/\s+/g, " ").trim();
    
    // Якщо елемент містить тільки текст (без дочірніх елементів)
    if (element.children.length === 0) {
      return text;
    }
    
    // Якщо елемент містить дочірні елементи, перевіряємо чи є прямий текст
    const directText = Array.from(element.childNodes)
      .filter(node => node.nodeType === 3) // Text nodes;
      .map(node => node.textContent.trim())
      .filter(text => text.length > 0)
      .join(" ");
    
    return directText || text;
  }

  /**
   * ✅ FIX: Очищення назви класу від подвійних крапок
   */
  cleanClassName(className) {
    if (!className) return "";
    
    // Очищаємо від подвійних крапок та зайвих пробілів
    return className;
      .replace(/\.+/g, ".")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * ✅ FIX: Витягування атрибутів елемента
   */
  extractAttributes(element) {
    const attributes = {};
    
    if (element.attributes) {
      Array.from(element.attributes).forEach(attr => {
        attributes[attr.name] = attr.value;
      });
    }
    
    return attributes;
  }

  /**
   * ✅ FIX: Отримання розмірів елемента
   */
  getBoundingRect(element) {
    try {
      const rect = element.getBoundingClientRect();
      return {
        left: rect.left || 0,
        top: rect.top || 0,
        width: rect.width || 0,
        height: rect.height || 0,
        right: rect.right || 0,
        bottom: rect.bottom || 0;
      };
    } catch (error) {
      return {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        right: 0,
        bottom: 0;
      };
    }
  }

  /**
   * ✅ FIX: Перевірка чи є тег самозакриваючим
   */
  isSelfClosingTag(tagName) {
    const selfClosingTags = [
      "img", "br", "hr", "input", "meta", "link", "area", "base",
      "col", "embed", "source", "track", "wbr"
    ];
    return selfClosingTags.includes(tagName.toLowerCase());
  }

  /**
   * ✅ FIX: Додавання елемента до ієрархії
   */
  addToHierarchy(elementData, depth) {
    // Ініціалізуємо рівень якщо потрібно
    if (!this.hierarchy[depth]) {
      this.hierarchy[depth] = [];
    }
    
    this.hierarchy[depth].push(elementData);
  }

  /**
   * ✅ FIX: Генерація унікального ID для елемента
   */
  generateElementId() {
    return `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * ✅ FIX: Пошук елементів за класом
   */
  findByClassName(className) {
    return this.elements.filter(el => 
      el.className && el.className.includes(className)
    );
  }

  /**
   * ✅ FIX: Пошук елементів за текстом
   */
  findByText(text) {
    return this.textElements.filter(el => 
      el.textContent && el.textContent.toLowerCase().includes(text.toLowerCase())
    );
  }

  /**
   * ✅ FIX: Пошук елементів за тегом
   */
  findByTagName(tagName) {
    return this.elements.filter(el => 
      el.tagName === tagName.toLowerCase()
    );
  }

  /**
   * ✅ FIX: Отримання статистики парсингу
   */
  getStatistics() {
    const stats = {
      totalElements: this.elements.length,
      textElements: this.textElements.length,
      containerElements: this.elements.filter(el => el.isContainer).length,
      selfClosingElements: this.elements.filter(el => el.isSelfClosing).length,
      maxDepth: Math.max(...this.elements.map(el => el.depth)),
      elementsByTag: {},
      elementsByClass: {},
      textLength: this.textElements.reduce((sum, el) => sum + (el.textContent?.length || 0), 0)
    };
    
    // Групуємо за тегами
    this.elements.forEach(el => {
      stats.elementsByTag[el.tagName] = (stats.elementsByTag[el.tagName] || 0) + 1;
    });
    
    // Групуємо за класами
    this.elements.forEach(el => {
      if (el.className) {
        const classes = el.className.split(" ').filter(cls => cls.trim());
        classes.forEach(cls => {
          stats.elementsByClass[cls] = (stats.elementsByClass[cls] || 0) + 1;
        });
      }
    });
    
    return stats;
  }
}

module.exports = AdvancedHTMLParser;
