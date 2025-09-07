/**
 * Розширений HTML парсер з детальним аналізом ієрархії
 * Підтримує семантичний аналіз та співставлення з Figma
 * @version 3.0.0
 */

const fs = require('fs');
const { JSDOM } = require('jsdom');

class HTMLParser {
  constructor() {
    this.hierarchy = new Map();
    this.contentMap = new Map();
    this.classMap = new Map();
    this.semanticMap = new Map();
    this.structure = {
      depth: 0,
      totalElements: 0,
      elementTypes: new Map(),
      semanticRoles: new Map()
    };
  }

  /**
   * Основний метод парсингу HTML з детальним аналізом
   */
  parseHTML(htmlContent) {
    if (!htmlContent || typeof htmlContent !== 'string') {
      throw new Error('Невірний HTML контент для парсингу');
    }

    // Створюємо DOM
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    // Ініціалізація
    this.hierarchy.clear();
    this.contentMap.clear();
    this.classMap.clear();
    this.semanticMap.clear();
    this.structure = {
      depth: 0,
      totalElements: 0,
      elementTypes: new Map(),
      semanticRoles: new Map()
    };

    // Рекурсивний обхід DOM
    this._traverseElement(document.body, null, '');

    // Аналіз структури
    this._analyzeStructure();

    return {
      hierarchy: this.hierarchy,
      contentMap: this.contentMap,
      classMap: this.classMap,
      semanticMap: this.semanticMap,
      structure: this.structure
    };
  }

  /**
   * Рекурсивне обходження елементів з детальним аналізом
   */
  _traverseElement(element, parentId = null, path = '') {
    if (!element) return null;

    const elId = element.getAttribute('id') || this._generateId();
    const children = Array.from(element.children || []);
    const level = path ? path.split('/').length : 0;

    // Семантична роль
    const semanticRole = this._getSemanticRole(element);

    // Аналіз класів
    const classes = Array.from(element.classList || []);
    const classAnalysis = this._analyzeClasses(classes, element);

    // Аналіз контенту
    const contentAnalysis = this._analyzeContent(element);

    // Створення об'єкта елементу
    const elObj = {
      id: elId,
      tagName: element.tagName.toLowerCase(),
      textContent: (element.textContent || '').trim(),
      classes,
      classAnalysis,
      contentAnalysis,
      children: [],
      parent: parentId,
      path: path ? `${path}/${elId}` : elId,
      level,
      semanticRole,
      matchedChildren: new Set(),
      matchedClasses: new Set(),
      styles: this._extractInlineStyles(element),
      attributes: this._extractAttributes(element),
      position: this._calculatePosition(element, level),
      importance: this._calculateImportance(element, semanticRole, classes)
    };

    // Додаємо до hierarchy
    this.hierarchy.set(elId, elObj);

    // Додаємо до contentMap, якщо є текст
    if (elObj.textContent) {
      this.contentMap.set(elObj.textContent, elObj);
    }

    // Додаємо до classMap
    classes.forEach(className => {
      if (!this.classMap.has(className)) {
        this.classMap.set(className, []);
      }
      this.classMap.get(className).push(elObj);
    });

    // Додаємо до semanticMap
    if (!this.semanticMap.has(semanticRole)) {
      this.semanticMap.set(semanticRole, []);
    }
    this.semanticMap.get(semanticRole).push(elObj);

    // Рекурсивно додаємо дітей
    children.forEach(child => {
      const childObj = this._traverseElement(child, elId, elObj.path);
      if (childObj) {
        elObj.children.push(childObj.id);
      }
    });

    return elObj;
  }

  /**
   * Аналіз класів елемента
   */
  _analyzeClasses(classes, element) {
    const analysis = {
      utility: [],
      component: [],
      layout: [],
      state: [],
      responsive: [],
      semantic: [],
      custom: []
    };

    classes.forEach(className => {
      if (this._isUtilityClass(className)) {
        analysis.utility.push(className);
      } else if (this._isComponentClass(className)) {
        analysis.component.push(className);
      } else if (this._isLayoutClass(className)) {
        analysis.layout.push(className);
      } else if (this._isStateClass(className)) {
        analysis.state.push(className);
      } else if (this._isResponsiveClass(className)) {
        analysis.responsive.push(className);
      } else if (this._isSemanticClass(className)) {
        analysis.semantic.push(className);
      } else {
        analysis.custom.push(className);
      }
    });

    return analysis;
  }

  /**
   * Аналіз контенту елемента
   */
  _analyzeContent(element) {
    const analysis = {
      hasText: false,
      hasImages: false,
      hasLinks: false,
      hasButtons: false,
      textLength: 0,
      wordCount: 0,
      hasNumbers: false,
      hasSpecialChars: false,
      language: 'unknown'
    };

    const textContent = element.textContent || '';
    analysis.hasText = textContent.length > 0;
    analysis.textLength = textContent.length;
    analysis.wordCount = textContent.trim().split(/\s+/).filter(w => w.length > 0).length;
    analysis.hasNumbers = /\d/.test(textContent);
    analysis.hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(textContent);

    // Перевірка на зображення
    const images = element.querySelectorAll('img');
    analysis.hasImages = images.length > 0;

    // Перевірка на посилання
    const links = element.querySelectorAll('a');
    analysis.hasLinks = links.length > 0;

    // Перевірка на кнопки
    const buttons = element.querySelectorAll('button, input[type="button"], input[type="submit"]');
    analysis.hasButtons = buttons.length > 0;

    // Визначення мови
    const lang = element.getAttribute('lang') || element.closest('[lang]')?.getAttribute('lang');
    analysis.language = lang || 'unknown';

    return analysis;
  }

  /**
   * Витягування inline стилів
   */
  _extractInlineStyles(element) {
    const styleAttr = element.getAttribute('style');
    if (!styleAttr) return {};

    const styles = {};
    styleAttr.split(';').forEach(rule => {
      const [property, value] = rule.split(':').map(s => s.trim());
      if (property && value) {
        styles[property] = value;
      }
    });

    return styles;
  }

  /**
   * Витягування атрибутів
   */
  _extractAttributes(element) {
    const attributes = {};
    Array.from(element.attributes).forEach(attr => {
      attributes[attr.name] = attr.value;
    });
    return attributes;
  }

  /**
   * Розрахунок позиції елемента
   */
  _calculatePosition(element, level) {
    return {
      level,
      isFirstChild: element.previousElementSibling === null,
      isLastChild: element.nextElementSibling === null,
      siblingCount: element.parentElement ? element.parentElement.children.length : 0,
      siblingIndex: Array.from(element.parentElement?.children || []).indexOf(element)
    };
  }

  /**
   * Розрахунок важливості елемента
   */
  _calculateImportance(element, semanticRole, classes) {
    let importance = 0;

    // Семантична важливість
    const semanticImportance = {
      'main': 10,
      'header': 9,
      'footer': 8,
      'navigation': 7,
      'heading': 6,
      'interactive': 5,
      'content-section': 4,
      'text': 3,
      'generic': 1
    };
    importance += semanticImportance[semanticRole] || 1;

    // Важливість тегу
    const tagImportance = {
      'main': 10,
      'header': 9,
      'footer': 8,
      'nav': 7,
      'h1': 8,
      'h2': 7,
      'h3': 6,
      'h4': 5,
      'h5': 4,
      'h6': 3,
      'button': 6,
      'a': 5,
      'img': 4,
      'section': 3,
      'article': 3,
      'aside': 2,
      'div': 1,
      'span': 1
    };
    importance += tagImportance[element.tagName.toLowerCase()] || 1;

    // Важливість класів
    classes.forEach(className => {
      if (className.includes('main') || className.includes('primary')) importance += 3;
      if (className.includes('header') || className.includes('footer')) importance += 2;
      if (className.includes('nav') || className.includes('menu')) importance += 2;
      if (className.includes('title') || className.includes('heading')) importance += 2;
      if (className.includes('button') || className.includes('btn')) importance += 1;
    });

    return Math.min(importance, 20); // Максимум 20
  }

  /**
   * Аналіз структури документа
   */
  _analyzeStructure() {
    this.hierarchy.forEach((element, id) => {
      this.structure.totalElements++;
      this.structure.depth = Math.max(this.structure.depth, element.level);

      // Підрахунок типів елементів
      const count = this.structure.elementTypes.get(element.tagName) || 0;
      this.structure.elementTypes.set(element.tagName, count + 1);

      // Підрахунок семантичних ролей
      const roleCount = this.structure.semanticRoles.get(element.semanticRole) || 0;
      this.structure.semanticRoles.set(element.semanticRole, roleCount + 1);
    });
  }

  /**
   * Визначення семантичної ролі HTML елементу
   */
  _getSemanticRole(element) {
    const tag = element.tagName.toLowerCase();
    const roleAttr = element.getAttribute('role');
    const classes = Array.from(element.classList || []);

    if (roleAttr) return roleAttr;

    // Аналіз за тегом
    switch (tag) {
    case 'button':
      return 'interactive';
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return 'heading';
    case 'nav':
      return 'navigation';
    case 'ul':
    case 'ol':
      return 'navigation';
    case 'img':
      return 'image';
    case 'section':
    case 'article':
    case 'aside':
      return 'content-section';
    case 'main':
      return 'main';
    case 'header':
      return 'header';
    case 'footer':
      return 'footer';
    case 'a':
      return 'interactive';
    default:
      break;
    }

    // Аналіз за класами
    const classString = classes.join(' ').toLowerCase();
    if (classString.includes('header') || classString.includes('head')) return 'header';
    if (classString.includes('footer') || classString.includes('foot')) return 'footer';
    if (classString.includes('nav') || classString.includes('menu')) return 'navigation';
    if (classString.includes('main') || classString.includes('content')) return 'main';
    if (classString.includes('title') || classString.includes('heading')) return 'heading';
    if (classString.includes('button') || classString.includes('btn')) return 'interactive';
    if (classString.includes('card') || classString.includes('item')) return 'content-card';
    if (classString.includes('container') || classString.includes('wrapper')) return 'container';

    return 'generic';
  }

  /**
   * Перевірка типів класів
   */
  _isUtilityClass(className) {
    const utilityPatterns = [
      /^(m|p)[trblxy]?-\d+$/,
      /^(w|h)-\d+$/,
      /^(text|bg|border)-(left|center|right)$/,
      /^(flex|grid|block|inline|hidden)$/,
      /^(justify|items|content)-(start|end|center|between|around|evenly)$/
    ];
    return utilityPatterns.some(pattern => pattern.test(className));
  }

  _isComponentClass(className) {
    const componentPatterns = [
      /^(btn|button)-/,
      /^(card|modal|dropdown|tooltip)-/,
      /^(form|input|select|textarea)-/,
      /^(alert|notification|toast)-/
    ];
    return componentPatterns.some(pattern => pattern.test(className));
  }

  _isLayoutClass(className) {
    const layoutPatterns = [
      /^(container|wrapper|row|col|grid|flex)$/,
      /^(header|footer|main|sidebar|content)$/,
      /^(nav|menu|breadcrumb)$/
    ];
    return layoutPatterns.some(pattern => pattern.test(className));
  }

  _isStateClass(className) {
    const statePatterns = [
      /^(active|inactive|disabled|enabled)$/,
      /^(selected|unselected|checked|unchecked)$/,
      /^(hover|focus|visited|link)$/
    ];
    return statePatterns.some(pattern => pattern.test(className));
  }

  _isResponsiveClass(className) {
    const responsivePatterns = [
      /^(sm|md|lg|xl|2xl):/,
      /^(mobile|tablet|desktop):/,
      /^(xs|sm|md|lg|xl)-/
    ];
    return responsivePatterns.some(pattern => pattern.test(className));
  }

  _isSemanticClass(className) {
    const semanticPatterns = [
      /^(title|heading|subtitle)$/,
      /^(text|paragraph|description)$/,
      /^(button|link|anchor)$/,
      /^(image|img|picture|photo)$/
    ];
    return semanticPatterns.some(pattern => pattern.test(className));
  }

  /**
   * Генератор унікального ID
   */
  _generateId() {
    return 'el_' + Math.random().toString(36).substring(2, 10);
  }

  /**
   * Завантаження HTML з файлу
   */
  loadHTML(filePath) {
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Невірний шлях до HTML файлу');
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`Файл не знайдено: ${filePath}`);
    }

    return fs.readFileSync(filePath, 'utf8');
  }

  /**
   * Пошук елементів за критеріями
   */
  findElements(criteria) {
    const results = [];
    
    this.hierarchy.forEach((element, id) => {
      let matches = true;
      
      if (criteria.tagName && element.tagName !== criteria.tagName) matches = false;
      if (criteria.semanticRole && element.semanticRole !== criteria.semanticRole) matches = false;
      if (criteria.classes && !criteria.classes.every(cls => element.classes.includes(cls))) matches = false;
      if (criteria.hasText !== undefined && (!!element.textContent) !== criteria.hasText) matches = false;
      if (criteria.level !== undefined && element.level !== criteria.level) matches = false;
      if (criteria.importance && element.importance < criteria.importance) matches = false;
      
      if (matches) {
        results.push(element);
      }
    });
    
    return results;
  }

  /**
   * Отримання статистики парсингу
   */
  getStatistics() {
    return {
      totalElements: this.structure.totalElements,
      maxDepth: this.structure.depth,
      elementTypes: Object.fromEntries(this.structure.elementTypes),
      semanticRoles: Object.fromEntries(this.structure.semanticRoles),
      totalClasses: this.classMap.size,
      totalContent: this.contentMap.size,
      averageImportance: this._calculateAverageImportance()
    };
  }

  /**
   * Розрахунок середньої важливості
   */
  _calculateAverageImportance() {
    let totalImportance = 0;
    let count = 0;
    
    this.hierarchy.forEach(element => {
      totalImportance += element.importance;
      count++;
    });
    
    return count > 0 ? totalImportance / count : 0;
  }
}

module.exports = HTMLParser;
