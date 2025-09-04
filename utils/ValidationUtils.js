/**
 * @module ValidationUtils
 * @description Утиліти для валідації даних, стилів та структур
 * @author Ukrainian Developer
 * @version 2.0.0
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
    };

    this.errors = [];
    this.warnings = [];
    this.validationResults = new Map();
  }

  /**
   * Комплексна валідація системи
   * @param {Object} data - Дані для валідації
   * @returns {Object} Результати валідації
   */
  validateSystem(data) {
    this.clearResults();

    const results = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      details: {}
    };

    // Валідація Figma даних
    if (data.figmaData) {
      results.details.figma = this.validateFigmaData(data.figmaData);
      if (!results.details.figma.valid) results.valid = false;
    }

    // Валідація HTML
    if (data.htmlData && this.options.validateHTML) {
      results.details.html = this.validateHTMLData(data.htmlData);
      if (!results.details.html.valid) results.valid = false;
    }

    // Валідація CSS
    if (data.css && this.options.validateCSS) {
      results.details.css = this.validateCSS(data.css);
      if (!results.details.css.valid) results.valid = false;
    }

    // Валідація співставлень
    if (data.matches) {
      results.details.matches = this.validateMatches(data.matches);
      if (!results.details.matches.valid) results.valid = false;
    }

    // Валідація доступності
    if (this.options.validateAccessibility) {
      results.details.accessibility = this.validateAccessibility(data);
      if (!results.details.accessibility.valid && this.options.strictMode) {
        results.valid = false;
      }
    }

    // Збір всіх помилок та попереджень
    results.errors = this.errors;
    results.warnings = this.warnings;
    results.suggestions = this.generateSuggestions(results);

    return results;
  }

  /**
   * Валідація даних Figma
   * @param {Object} figmaData - Дані Figma
   * @returns {Object} Результати валідації
   */
  validateFigmaData(figmaData) {
    const validation = {
      valid: true,
      errors: [],
      warnings: []
    };

    // Перевірка структури
    if (!figmaData.hierarchy || !(figmaData.hierarchy instanceof Map)) {
      validation.valid = false;
      validation.errors.push({
        type: 'STRUCTURE_ERROR',
        message: 'Відсутня або некоректна ієрархія Figma'
      });
    }

    // Перевірка елементів
    if (figmaData.hierarchy) {
      figmaData.hierarchy.forEach((element, id) => {
        const elementValidation = this.validateFigmaElement(element, id);
        if (!elementValidation.valid) {
          validation.valid = false;
          validation.errors.push(...elementValidation.errors);
        }
        validation.warnings.push(...elementValidation.warnings);
      });
    }

    // Перевірка контент-мапи
    if (!figmaData.contentMap || !(figmaData.contentMap instanceof Map)) {
      validation.warnings.push({
        type: 'MISSING_CONTENT_MAP',
        message: 'Відсутня контент-мапа Figma'
      });
    }

    return validation;
  }

  /**
   * Валідація елемента Figma
   * @param {Object} element - Елемент Figma
   * @param {string} id - ID елемента
   * @returns {Object} Результати валідації
   */
  validateFigmaElement(element, id) {
    const validation = {
      valid: true,
      errors: [],
      warnings: []
    };

    // Обов'язкові поля
    if (!element.name) {
      validation.warnings.push({
        type: 'MISSING_NAME',
        elementId: id,
        message: `Елемент ${id} не має назви`
      });
    }

    if (!element.type) {
      validation.valid = false;
      validation.errors.push({
        type: 'MISSING_TYPE',
        elementId: id,
        message: `Елемент ${id} не має типу`
      });
    }

    // Валідація стилів
    if (element.styles) {
      const styleValidation = this.validateStyles(element.styles);
      if (!styleValidation.valid) {
        validation.warnings.push(...styleValidation.errors);
      }
    }

    // Валідація розмірів
    if (element.absoluteBoundingBox) {
      const boundsValidation = this.validateBoundingBox(element.absoluteBoundingBox);
      if (!boundsValidation.valid) {
        validation.warnings.push(...boundsValidation.errors);
      }
    }

    return validation;
  }

  /**
   * Валідація HTML даних
   * @param {Object} htmlData - HTML дані
   * @returns {Object} Результати валідації
   */
  validateHTMLData(htmlData) {
    const validation = {
      valid: true,
      errors: [],
      warnings: []
    };

    // Перевірка структури
    if (!htmlData.hierarchy || !(htmlData.hierarchy instanceof Map)) {
      validation.valid = false;
      validation.errors.push({
        type: 'HTML_STRUCTURE_ERROR',
        message: 'Відсутня або некоректна HTML ієрархія'
      });
    }

    // Перевірка класів
    if (!htmlData.classMap || !(htmlData.classMap instanceof Map)) {
      validation.warnings.push({
        type: 'MISSING_CLASS_MAP',
        message: 'Відсутня мапа класів HTML'
      });
    }

    // Валідація елементів
    if (htmlData.hierarchy) {
      htmlData.hierarchy.forEach((element, id) => {
        const elementValidation = this.validateHTMLElement(element);
        if (!elementValidation.valid) {
          validation.warnings.push(...elementValidation.errors);
        }
      });
    }

    // Перевірка семантики
    const semanticValidation = this.validateSemanticHTML(htmlData);
    validation.warnings.push(...semanticValidation.warnings);

    return validation;
  }

  /**
   * Валідація HTML елемента
   * @param {Object} element - HTML елемент
   * @returns {Object} Результати валідації
   */
  validateHTMLElement(element) {
    const validation = {
      valid: true,
      errors: [],
      warnings: []
    };

    // Перевірка тегу
    if (!element.tagName) {
      validation.valid = false;
      validation.errors.push({
        type: 'MISSING_TAG',
        message: 'HTML елемент без тегу'
      });
    }

    // Валідація класів
    if (element.classes && element.classes.length > 0) {
      element.classes.forEach(className => {
        if (!this.isValidClassName(className)) {
          validation.warnings.push({
            type: 'INVALID_CLASS_NAME',
            className,
            message: `Некоректна назва класу: ${className}`
          });
        }
      });
    }

    // Валідація атрибутів
    if (element.attributes) {
      Object.entries(element.attributes).forEach(([attr, value]) => {
        if (!this.isValidAttribute(attr, value)) {
          validation.warnings.push({
            type: 'INVALID_ATTRIBUTE',
            attribute: attr,
            value,
            message: `Некоректний атрибут: ${attr}="${value}"`
          });
        }
      });
    }

    return validation;
  }

  /**
   * Валідація CSS
   * @param {string} css - CSS код
   * @returns {Object} Результати валідації
   */
  validateCSS(css) {
    const validation = {
      valid: true,
      errors: [],
      warnings: []
    };

    // Перевірка синтаксису
    const syntaxErrors = this.validateCSSSyntax(css);
    if (syntaxErrors.length > 0) {
      validation.valid = false;
      validation.errors.push(...syntaxErrors);
    }

    // Перевірка властивостей
    const propertyErrors = this.validateCSSProperties(css);
    validation.warnings.push(...propertyErrors);

    // Перевірка селекторів
    const selectorErrors = this.validateCSSSelectors(css);
    validation.warnings.push(...selectorErrors);

    // Перевірка на дублікати
    const duplicates = this.findDuplicateRules(css);
    if (duplicates.length > 0) {
      validation.warnings.push(...duplicates);
    }

    // Перевірка на невикористані стилі
    const unused = this.findUnusedStyles(css);
    if (unused.length > 0) {
      validation.warnings.push(...unused);
    }

    return validation;
  }

  /**
   * Валідація CSS синтаксису
   * @param {string} css - CSS код
   * @returns {Array} Масив помилок
   */
  validateCSSSyntax(css) {
    const errors = [];
    const lines = css.split('\n');
    
    let braceCount = 0;
    let inRule = false;
    let inComment = false;
    let currentSelector = '';

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Пропуск коментарів
      if (trimmedLine.startsWith('/*')) inComment = true;
      if (trimmedLine.endsWith('*/')) inComment = false;
      if (inComment) return;
      
      // Підрахунок дужок
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      
      braceCount += openBraces - closeBraces;
      
      if (openBraces > 0) {
        inRule = true;
        currentSelector = trimmedLine.split('{')[0].trim();
      }
      if (closeBraces > 0) {
        inRule = false;
        currentSelector = '';
      }
      
      // Перевірка властивостей
      if (inRule && trimmedLine.includes(':') && !trimmedLine.includes('{')) {
        if (!trimmedLine.endsWith(';') && !trimmedLine.endsWith('}')) {
          errors.push({
            type: 'CSS_SYNTAX_ERROR',
            line: index + 1,
            message: `Рядок ${index + 1}: Відсутня крапка з комою`
          });
        }
        
        // Перевірка формату властивості
        const propertyMatch = trimmedLine.match(/^\s*([a-z-]+)\s*:\s*(.+);?\s*$/i);
        if (!propertyMatch) {
          errors.push({
            type: 'INVALID_PROPERTY_FORMAT',
            line: index + 1,
            message: `Рядок ${index + 1}: Некоректний формат властивості`
          });
        }
      }
      
      // Перевірка селекторів
      if (trimmedLine.endsWith('{') && !trimmedLine.includes('@')) {
        const selector = trimmedLine.replace('{', '').trim();
        if (!this.isValidSelector(selector)) {
          errors.push({
            type: 'INVALID_SELECTOR',
            line: index + 1,
            selector,
            message: `Рядок ${index + 1}: Некоректний селектор "${selector}"`
          });
        }
      }
    });
    
    // Перевірка балансу дужок
    if (braceCount !== 0) {
      errors.push({
        type: 'UNBALANCED_BRACES',
        message: `Незбалансовані фігурні дужки (різниця: ${braceCount})`
      });
    }
    
    return errors;
  }

  /**
   * Валідація CSS властивостей
   * @param {string} css - CSS код
   * @returns {Array} Масив попереджень
   */
  validateCSSProperties(css) {
    const warnings = [];
    const deprecatedProperties = [
      'clip',
      'ime-mode',
      'filter', // старий IE filter
      'scrollbar-*'
    ];
    
    const vendorPrefixes = ['-webkit-', '-moz-', '-ms-', '-o-'];
    
    // Пошук застарілих властивостей
    deprecatedProperties.forEach(prop => {
      if (css.includes(prop)) {
        warnings.push({
          type: 'DEPRECATED_PROPERTY',
          property: prop,
          message: `Застаріла властивість: ${prop}`
        });
      }
    });
    
    // Перевірка vendor префіксів
    vendorPrefixes.forEach(prefix => {
      const regex = new RegExp(`${prefix}[a-z-]+`, 'g');
      const matches = css.match(regex) || [];
      
      matches.forEach(match => {
        warnings.push({
          type: 'VENDOR_PREFIX',
          property: match,
          message: `Розгляньте використання autoprefixer для: ${match}`
        });
      }

);
    });
    
    // Перевірка на важливість
    const importantCount = (css.match(/!important/g) || []).length;
    if (importantCount > 5) {
      warnings.push({
        type: 'EXCESSIVE_IMPORTANT',
        count: importantCount,
        message: `Надмірне використання !important (${importantCount} разів)`
      });
    }
    
    return warnings;
  }

  /**
   * Валідація співставлень
   * @param {Object} matches - Співставлення
   * @returns {Object} Результати валідації
   */
  validateMatches(matches) {
    const validation = {
      valid: true,
      errors: [],
      warnings: []
    };

    if (!matches.matches || !(matches.matches instanceof Map)) {
      validation.valid = false;
      validation.errors.push({
        type: 'INVALID_MATCHES',
        message: 'Некоректна структура співставлень'
      });
      return validation;
    }

    // Перевірка якості співставлень
    let lowConfidenceCount = 0;
    matches.matches.forEach((match, figmaId) => {
      if (match.confidence < 0.5) {
        lowConfidenceCount++;
        validation.warnings.push({
          type: 'LOW_CONFIDENCE_MATCH',
          figmaId,
          confidence: match.confidence,
          message: `Низька довіра для співставлення: ${figmaId} (${(match.confidence * 100).toFixed(1)}%)`
        });
      }
    });

    // Перевірка покриття
    const coverage = matches.statistics?.matchPercentage || 0;
    if (coverage < 50) {
      validation.warnings.push({
        type: 'LOW_COVERAGE',
        coverage,
        message: `Низьке покриття співставлень: ${coverage.toFixed(1)}%`
      });
    }

    return validation;
  }

  /**
   * Валідація доступності
   * @param {Object} data - Дані для перевірки
   * @returns {Object} Результати валідації
   */
  validateAccessibility(data) {
    const validation = {
      valid: true,
      errors: [],
      warnings: []
    };

    // Перевірка контрастності кольорів
    if (data.css) {
      const contrastIssues = this.validateColorContrast(data.css);
      validation.warnings.push(...contrastIssues);
    }

    // Перевірка семантичної структури
    if (data.htmlData) {
      const semanticIssues = this.validateSemanticStructure(data.htmlData);
      validation.warnings.push(...semanticIssues);
    }

    // Перевірка ARIA атрибутів
    if (data.htmlData) {
      const ariaIssues = this.validateARIA(data.htmlData);
      validation.warnings.push(...ariaIssues);
    }

    // Перевірка інтерактивних елементів
    const interactiveIssues = this.validateInteractiveElements(data);
    validation.warnings.push(...interactiveIssues);

    return validation;
  }

  /**
   * Валідація контрастності кольорів
   * @param {string} css - CSS код
   * @returns {Array} Масив проблем
   */
  validateColorContrast(css) {
    const issues = [];
    
    // Витягування кольорів
    const colorRegex = /#[0-9a-f]{3,6}|rgba?\([^)]+\)/gi;
    const colors = css.match(colorRegex) || [];
    
    // Спрощена перевірка (в реальності потрібен розрахунок WCAG контрастності)
    colors.forEach(color => {
      if (this.isLowContrast(color)) {
        issues.push({
          type: 'LOW_CONTRAST',
          color,
          message: `Можливо низький контраст для кольору: ${color}`
        });
      }
    });
    
    return issues;
  }

  /**
   * Валідація семантичної структури
   * @param {Object} htmlData - HTML дані
   * @returns {Array} Масив проблем
   */
  validateSemanticStructure(htmlData) {
    const issues = [];
    const headings = [];
    
    htmlData.hierarchy.forEach(element => {
      // Збір заголовків
      if (/^h[1-6]$/.test(element.tagName)) {
        headings.push({
          level: parseInt(element.tagName[1]),
          element
        });
      }
      
      // Перевірка кнопок без тексту
      if (element.tagName === 'button' && !element.textContent) {
        issues.push({
          type: 'BUTTON_NO_TEXT',
          element: element.id,
          message: 'Кнопка без текстового вмісту'
        });
      }
      
      // Перевірка посилань без href
      if (element.tagName === 'a' && !element.attributes?.href) {
        issues.push({
          type: 'LINK_NO_HREF',
          element: element.id,
          message: 'Посилання без атрибуту href'
        });
      }
      
      // Перевірка зображень без alt
      if (element.tagName === 'img' && !element.attributes?.alt) {
        issues.push({
          type: 'IMG_NO_ALT',
          element: element.id,
          message: 'Зображення без атрибуту alt'
        });
      }
    });
    
    // Перевірка ієрархії заголовків
    for (let i = 1; i < headings.length; i++) {
      if (headings[i].level - headings[i-1].level > 1) {
        issues.push({
          type: 'HEADING_SKIP',
          from: `h${headings[i-1].level}`,
          to: `h${headings[i].level}`,
          message: `Пропущено рівень заголовка: h${headings[i-1].level} -> h${headings[i].level}`
        });
      }
    }
    
    return issues;
  }

  /**
   * Валідація ARIA атрибутів
   * @param {Object} htmlData - HTML дані
   * @returns {Array} Масив проблем
   */
  validateARIA(htmlData) {
    const issues = [];
    const validRoles = [
      'button', 'navigation', 'main', 'banner', 'contentinfo',
      'complementary', 'search', 'form', 'region'
    ];
    
    htmlData.hierarchy.forEach(element => {
      if (element.attributes) {
        // Перевірка role
        if (element.attributes.role && !validRoles.includes(element.attributes.role)) {
          issues.push({
            type: 'INVALID_ARIA_ROLE',
            role: element.attributes.role,
            element: element.id,
            message: `Некоректний ARIA role: ${element.attributes.role}`
          });
        }
        
        // Перевірка aria-label на інтерактивних елементах
        if (['button', 'a', 'input'].includes(element.tagName) && 
            !element.attributes['aria-label'] && 
            !element.textContent) {
          issues.push({
            type: 'MISSING_ARIA_LABEL',
            element: element.id,
            message: 'Інтерактивний елемент без aria-label або тексту'
          });
        }
      }
    });
    
    return issues;
  }

  /**
   * Валідація інтерактивних елементів
   * @param {Object} data - Дані
   * @returns {Array} Масив проблем
   */
  validateInteractiveElements(data) {
    const issues = [];
    
    if (!data.css) return issues;
    
    // Перевірка focus стилів
    if (!data.css.includes(':focus')) {
      issues.push({
        type: 'NO_FOCUS_STYLES',
        message: 'Відсутні стилі для :focus стану'
      });
    }
    
    // Перевірка hover стилів
    if (!data.css.includes(':hover')) {
      issues.push({
        type: 'NO_HOVER_STYLES',
        message: 'Відсутні стилі для :hover стану'
      });
    }
    
    // Перевірка розмірів інтерактивних елементів
    const minSize = 44; // WCAG рекомендація
    const sizeRegex = /\.(btn|button)[^{]*\{[^}]*(width|height):\s*(\d+)px/g;
    let match;
    
    while ((match = sizeRegex.exec(data.css)) !== null) {
      const size = parseInt(match[3]);
      if (size < minSize) {
        issues.push({
          type: 'SMALL_INTERACTIVE_ELEMENT',
          size,
          minSize,
          message: `Інтерактивний елемент занадто малий: ${size}px (мінімум ${minSize}px)`
        });
      }
    }
    
    return issues;
  }

  // === Допоміжні методи валідації ===

  /**
   * Перевірка валідності назви класу
   */
  isValidClassName(className) {
    // Перевірка на валідний CSS клас
    const validClassRegex = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
    return validClassRegex.test(className);
  }

  /**
   * Перевірка валідності атрибуту
   */
  isValidAttribute(attr, value) {
    // Базова перевірка HTML атрибутів
    const invalidAttrs = ['onclick', 'onmouseover', 'onerror']; // XSS ризики
    return !invalidAttrs.includes(attr.toLowerCase());
  }

  /**
   * Перевірка валідності селектора
   */
  isValidSelector(selector) {
    if (!selector || selector.length === 0) return false;
    
    // Базова перевірка CSS селектора
    try {
      document.querySelector(selector);
      return true;
    } catch {
      // Якщо не в браузері, використовуємо regex
      const validSelectorRegex = /^[.#]?[a-zA-Z][a-zA-Z0-9_-]*(\s+[.#]?[a-zA-Z][a-zA-Z0-9_-]*)*$/;
      return validSelectorRegex.test(selector);
    }
  }

  /**
   * Валідація стилів
   */
  validateStyles(styles) {
    const validation = {
      valid: true,
      errors: []
    };
    
    // Перевірка на некоректні значення
    Object.entries(styles).forEach(([prop, value]) => {
      if (value === undefined || value === null) {
        validation.errors.push({
          type: 'INVALID_STYLE_VALUE',
          property: prop,
          message: `Некоректне значення для властивості ${prop}`
        });
        validation.valid = false;
      }
    });
    
    return validation;
  }

  /**
   * Валідація bounding box
   */
  validateBoundingBox(bbox) {
    const validation = {
      valid: true,
      errors: []
    };
    
    if (bbox.width <= 0) {
      validation.errors.push({
        type: 'INVALID_WIDTH',
        message: `Некоректна ширина: ${bbox.width}`
      });
      validation.valid = false;
    }
    
    if (bbox.height <= 0) {
      validation.errors.push({
        type: 'INVALID_HEIGHT',
        message: `Некоректна висота: ${bbox.height}`
      });
      validation.valid = false;
    }
    
    return validation;
  }

  /**
   * Валідація семантичного HTML
   */
  validateSemanticHTML(htmlData) {
    const warnings = [];
    
    // Перевірка на використання семантичних тегів
    const semanticTags = ['header', 'nav', 'main', 'article', 'section', 'aside', 'footer'];
    const hasSemanticTags = Array.from(htmlData.hierarchy.values())
      .some(el => semanticTags.includes(el.tagName));
    
    if (!hasSemanticTags) {
      warnings.push({
        type: 'NO_SEMANTIC_TAGS',
        message: 'Відсутні семантичні HTML5 теги'
      });
    }
    
    return { warnings };
  }

  /**
   * Пошук дублікованих правил
   */
  findDuplicateRules(css) {
    const warnings = [];
    const rules = new Map();
    
    // Простий пошук дублікатів селекторів
    const selectorRegex = /([^{]+)\{[^}]+\}/g;
    let match;
    
    while ((match = selectorRegex.exec(css)) !== null) {
      const selector = match[1].trim();
      
      if (rules.has(selector)) {
        warnings.push({
          type: 'DUPLICATE_RULE',
          selector,
          message: `Дублікат правила для селектора: ${selector}`
        });
      } else {
        rules.set(selector, true);
      }
    }
    
    return warnings;
  }

  /**
   * Пошук невикористаних стилів
   */
  findUnusedStyles(css) {
    // В реальному проекті це вимагає аналізу використання в HTML
    // Тут - спрощена версія
    const warnings = [];
    
    // Перевірка на надмірну специфічність
    const overSpecificRegex = /([.#][a-zA-Z0-9_-]+\s*){4,}/g;
    const matches = css.match(overSpecificRegex) || [];
    
    matches.forEach(match => {
      warnings.push({
        type: 'OVER_SPECIFIC',
        selector: match.trim(),
        message: `Надмірна специфічність селектора: ${match.trim()}`
      });
    });
    
    return warnings;
  }

  /**
   * Перевірка низького контрасту
   */
  isLowContrast(color) {
    // Спрощена перевірка - в реальності потрібен WCAG алгоритм
    if (color.includes('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      
      // Перевірка на дуже світлі кольори
      return luminance > 0.9;
    }
    
    return false;
  }

  /**
   * Генерація пропозицій покращення
   */
  generateSuggestions(results) {
    const suggestions = [];
    
    // Пропозиції на основі помилок
    if (results.errors.length > 5) {
      suggestions.push({
        type: 'CRITICAL',
        message: 'Виявлено критичні проблеми. Рекомендується детальна перевірка коду.'
      });
    }
    
    // Пропозиції на основі попереджень
    if (results.warnings.some(w => w.type === 'LOW_COVERAGE')) {
      suggestions.push({
        type: 'IMPROVEMENT',
        message: 'Низьке покриття співставлень. Перевірте назви класів та структуру.'
      });
    }
    
    if (results.warnings.some(w => w.type === 'NO_SEMANTIC_TAGS')) {
      suggestions.push({
        type: 'SEMANTIC',
        message: 'Використовуйте семантичні HTML5 теги для кращої доступності.'
      });
    }
    
    if (results.warnings.some(w => w.type === 'EXCESSIVE_IMPORTANT')) {
      suggestions.push({
        type: 'CSS_QUALITY',
        message: 'Зменшіть використання !important через рефакторинг специфічності.'
      });
    }
    
    return suggestions;
  }

  /**
   * Очищення результатів
   */
  clearResults() {
    this.errors = [];
    this.warnings = [];
    this.validationResults.clear();
  }

  /**
   * Додавання помилки
   */
  addError(error) {
    this.errors.push(error);
    if (this.options.throwOnError) {
      throw new Error(error.message);
    }
  }

  /**
   * Додавання попередження
   */
  addWarning(warning) {
    this.warnings.push(warning);
    if (this.options.logWarnings) {
      console.warn(warning.message);
    }
  }
}

// Експорт модуля
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ValidationUtils;
}