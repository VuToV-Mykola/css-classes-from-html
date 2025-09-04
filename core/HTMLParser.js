/**
 * Розширений парсер HTML з детальним аналізом ієрархії та контенту
 */
class HTMLParser {
  constructor() {
    this.hierarchy = new Map();
    this.classMap = new Map();
    this.contentMap = new Map();
  }

  /**
   * Парсинг HTML з створенням детальної ієрархічної структури
   */
  parseHTML(htmlContent) {
    // Використовуємо DOMParser для безпечного парсингу
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");

    this.hierarchy.clear();
    this.classMap.clear();
    this.contentMap.clear();

    // Рекурсивний обхід DOM дерева
    this.traverseDOM(doc.body, null, "");

    return {
      hierarchy: this.hierarchy,
      classMap: this.classMap,
      contentMap: this.contentMap,
    };
  }

  /**
   * Рекурсивний обхід DOM з детальним аналізом
   */
  traverseDOM(element, parent, path) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return;

    const elementId = this.generateElementId(element, path);
    const currentPath = path
      ? `${path}/${element.tagName.toLowerCase()}`
      : element.tagName.toLowerCase();

    // Детальний аналіз елемента
    const elementData = {
      id: elementId,
      tagName: element.tagName.toLowerCase(),
      classes: Array.from(element.classList),
      attributes: this.getAttributes(element),
      content: this.extractElementContent(element),
      path: currentPath,
      parent: parent,
      children: [],
      level: this.calculateNestingLevel(path),
      semanticRole: this.determineSemanticRole(element),
      textContent: this.getDirectTextContent(element),
      position: this.getElementPosition(element, parent),
    };

    // Збереження в maps
    this.hierarchy.set(elementId, elementData);

    // Мапінг класів
    elementData.classes.forEach((className) => {
      if (!this.classMap.has(className)) {
        this.classMap.set(className, []);
      }
      this.classMap.get(className).push(elementData);
    });

    // Мапінг контенту
    if (elementData.textContent.trim()) {
      const normalizedContent = this.normalizeContent(elementData.textContent);
      this.contentMap.set(normalizedContent, elementData);
    }

    // Обхід дочірніх елементів
    Array.from(element.children).forEach((child, index) => {
      const childData = this.traverseDOM(child, elementId, currentPath);
      if (childData) {
        elementData.children.push(childData);
      }
    });

    return elementData;
  }

  /**
   * Генерація унікального ID для елемента
   */
  generateElementId(element, path) {
    const classes = Array.from(element.classList).join("-");
    const tag = element.tagName.toLowerCase();
    const pathHash = this.hashString(path);

    return `${tag}-${classes || "no-class"}-${pathHash}`;
  }

  /**
   * Отримання всіх атрибутів елемента
   */
  getAttributes(element) {
    const attributes = {};
    for (let attr of element.attributes) {
      attributes[attr.name] = attr.value;
    }
    return attributes;
  }

  /**
   * Витягування контенту елемента (включаючи вкладені текстові вузли)
   */
  extractElementContent(element) {
    // Отримуємо всі текстові вузли
    const textNodes = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while ((node = walker.nextNode())) {
      const text = node.textContent.trim();
      if (text) {
        textNodes.push(text);
      }
    }

    return textNodes.join(" ");
  }

  /**
   * Отримання прямого текстового контенту (без вкладених елементів)
   */
  getDirectTextContent(element) {
    let text = "";
    for (let child of element.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        text += child.textContent.trim() + " ";
      }
    }
    return text.trim();
  }

  /**
   * Визначення семантичної ролі елемента
   */
  determineSemanticRole(element) {
    const tag = element.tagName.toLowerCase();
    const classes = Array.from(element.classList).join(" ").toLowerCase();

    // Семантичні HTML5 теги
    const semanticTags = {
      header: "header",
      nav: "navigation",
      main: "main-content",
      section: "section",
      article: "article",
      aside: "sidebar",
      footer: "footer",
      h1: "main-heading",
      h2: "section-heading",
      h3: "subsection-heading",
      button: "interactive",
      a: "link",
      form: "form",
      img: "image",
    };

    if (semanticTags[tag]) {
      return semanticTags[tag];
    }

    // Аналіз на основі класів
    if (classes.includes("hero")) return "hero-section";
    if (classes.includes("btn") || classes.includes("button"))
      return "interactive";
    if (classes.includes("card")) return "content-card";
    if (classes.includes("list")) return "list";
    if (classes.includes("menu")) return "navigation";

    return "generic";
  }

  /**
   * Розрахунок рівня вкладеності
   */
  calculateNestingLevel(path) {
    return path ? path.split("/").length : 0;
  }

  /**
   * Отримання позиції елемента серед сіблінгів
   */
  getElementPosition(element, parent) {
    if (!element.parentElement) return 0;

    return Array.from(element.parentElement.children).indexOf(element);
  }

  /**
   * Нормалізація контенту для співставлення
   */
  normalizeContent(content) {
    return content
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[^\w\s]/g, "")
      .trim();
  }

  /**
   * Простий хеш для рядків
   */
  hashString(str) {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Перетворення в 32bit integer
    }
    return Math.abs(hash).toString(36);
  }
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = HTMLParser;
}


