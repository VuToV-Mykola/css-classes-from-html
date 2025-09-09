/**
 * Детальний аналізатор Figma макету
 * Аналізує ієрархію, стилі та семантику елементів
 * @version 3.0.0
 */

class FigmaAnalyzer {
  constructor() {
    this.analysis = {
      hierarchy: new Map(),
      styles: new Map(),
      semantics: new Map(),
      content: new Map(),
      structure: {
        depth: 0,
        totalElements: 0,
        elementTypes: new Map(),
        semanticRoles: new Map(),
        complexity: 0
      }
    };
  }

  /**
   * Основний метод аналізу Figma макету
   */
  analyzeFigma(figmaData) {
    this.reset();
    
    if (!figmaData || !figmaData.document) {
      throw new Error('Невірні дані Figma для аналізу');
    }

    // Аналіз структури документа
    this.analyzeDocumentStructure(figmaData.document);
    
    // Аналіз стилів
    this.analyzeStyles(figmaData);
    
    // Аналіз семантики
    this.analyzeSemantics(figmaData);
    
    // Аналіз контенту
    this.analyzeContent(figmaData);
    
    // Розрахунок складності
    this.calculateComplexity();
    
    return this.analysis;
  }

  /**
   * Аналіз структури документа
   */
  analyzeDocumentStructure(document) {
    if (!document.children) return;
    
    document.children.forEach(page => {
      this.analyzePage(page, 0);
    });
  }

  /**
   * Аналіз сторінки (Canvas)
   */
  analyzePage(page, depth) {
    const pageInfo = {
      id: page.id,
      name: page.name || 'Untitled',
      type: 'CANVAS',
      depth,
      children: [],
      elementCount: 0,
      maxDepth: depth,
      styles: this.extractPageStyles(page),
      semanticRole: this.determinePageSemanticRole(page),
      content: this.extractPageContent(page)
    };

    this.analysis.hierarchy.set(page.id, pageInfo);
    this.analysis.structure.totalElements++;

    if (page.children) {
      page.children.forEach(child => {
        const childInfo = this.analyzeElement(child, depth + 1, page.id);
        pageInfo.children.push(childInfo.id);
        pageInfo.elementCount += childInfo.totalElements;
        pageInfo.maxDepth = Math.max(pageInfo.maxDepth, childInfo.maxDepth);
      });
    }

    this.analysis.structure.depth = Math.max(this.analysis.structure.depth, pageInfo.maxDepth);
  }

  /**
   * Рекурсивний аналіз елемента
   */
  analyzeElement(element, depth, parentId) {
    const elementInfo = {
      id: element.id,
      name: element.name || 'Unnamed',
      type: element.type,
      depth,
      parent: parentId,
      children: [],
      totalElements: 1,
      maxDepth: depth,
      styles: this.extractElementStyles(element),
      semanticRole: this.determineElementSemanticRole(element),
      content: this.extractElementContent(element),
      position: this.extractElementPosition(element),
      importance: this.calculateElementImportance(element, depth),
      complexity: this.calculateElementComplexity(element)
    };

    this.analysis.hierarchy.set(element.id, elementInfo);
    this.analysis.structure.totalElements++;

    // Аналіз дітей
    if (element.children) {
      element.children.forEach(child => {
        const childInfo = this.analyzeElement(child, depth + 1, element.id);
        elementInfo.children.push(childInfo.id);
        elementInfo.totalElements += childInfo.totalElements;
        elementInfo.maxDepth = Math.max(elementInfo.maxDepth, childInfo.maxDepth);
      });
    }

    // Оновлення статистики
    this.updateElementTypeStats(element.type);
    this.updateSemanticRoleStats(elementInfo.semanticRole);

    return elementInfo;
  }

  /**
   * Витягування стилів елемента
   */
  extractElementStyles(element) {
    const styles = {
      typography: this.extractTypographyStyles(element),
      colors: this.extractColorStyles(element),
      effects: this.extractEffectStyles(element),
      layout: this.extractLayoutStyles(element),
      positioning: this.extractPositioningStyles(element),
      borders: this.extractBorderStyles(element),
      spacing: this.extractSpacingStyles(element)
    };

    this.analysis.styles.set(element.id, styles);
    return styles;
  }

  /**
   * Витягування типографічних стилів
   */
  extractTypographyStyles(element) {
    const typography = {};
    
    if (element.style) {
      typography.fontFamily = element.style.fontFamily;
      typography.fontSize = element.style.fontSize;
      typography.fontWeight = element.style.fontWeight;
      typography.fontStyle = element.style.fontStyle;
      typography.lineHeight = element.style.lineHeight;
      typography.letterSpacing = element.style.letterSpacing;
      typography.textAlign = element.style.textAlign;
      typography.textDecoration = element.style.textDecoration;
      typography.textTransform = element.style.textTransform;
    }

    return typography;
  }

  /**
   * Витягування кольорових стилів
   */
  extractColorStyles(element) {
    const colors = [];
    
    if (element.fills) {
      element.fills.forEach(fill => {
        if (fill.type === 'SOLID' && fill.color) {
          colors.push({
            type: 'solid',
            color: this.rgbToHex(fill.color),
            opacity: fill.opacity || 1
          });
        } else if (fill.type === 'GRADIENT_LINEAR') {
          colors.push({
            type: 'gradient',
            gradient: this.extractGradient(fill)
          });
        }
      });
    }

    return colors;
  }

  /**
   * Витягування ефектів
   */
  extractEffectStyles(element) {
    const effects = [];
    
    if (element.effects) {
      element.effects.forEach(effect => {
        if (effect.type === 'DROP_SHADOW') {
          effects.push({
            type: 'box-shadow',
            x: effect.offset.x,
            y: effect.offset.y,
            blur: effect.radius,
            spread: effect.spread || 0,
            color: this.rgbToHex(effect.color),
            opacity: effect.color.a
          });
        } else if (effect.type === 'INNER_SHADOW') {
          effects.push({
            type: 'box-shadow',
            inset: true,
            x: effect.offset.x,
            y: effect.offset.y,
            blur: effect.radius,
            spread: effect.spread || 0,
            color: this.rgbToHex(effect.color),
            opacity: effect.color.a
          });
        }
      });
    }

    return effects;
  }

  /**
   * Витягування layout стилів
   */
  extractLayoutStyles(element) {
    const layout = {};
    
    if (element.layoutMode) {
      layout.display = element.layoutMode === 'HORIZONTAL' ? 'flex' : 'block';
      layout.flexDirection = element.layoutMode === 'HORIZONTAL' ? 'row' : 'column';
    }
    
    if (element.primaryAxisAlignItems) {
      layout.justifyContent = this.mapFigmaAlignment(element.primaryAxisAlignItems);
    }
    
    if (element.counterAxisAlignItems) {
      layout.alignItems = this.mapFigmaAlignment(element.counterAxisAlignItems);
    }
    
    if (element.itemSpacing) {
      layout.gap = `${element.itemSpacing}px`;
    }
    
    return layout;
  }

  /**
   * Витягування positioning стилів
   */
  extractPositioningStyles(element) {
    const positioning = {};
    
    if (element.absoluteBoundingBox) {
      positioning.x = element.absoluteBoundingBox.x;
      positioning.y = element.absoluteBoundingBox.y;
      positioning.width = element.absoluteBoundingBox.width;
      positioning.height = element.absoluteBoundingBox.height;
    }
    
    if (element.absoluteTransform) {
      positioning.transform = this.extractTransform(element.absoluteTransform);
    }
    
    return positioning;
  }

  /**
   * Витягування border стилів
   */
  extractBorderStyles(element) {
    const borders = {};
    
    if (element.strokeWeight) {
      borders.width = `${element.strokeWeight}px`;
    }
    
    if (element.stroke) {
      borders.color = this.rgbToHex(element.stroke);
    }
    
    if (element.cornerRadius) {
      borders.radius = `${element.cornerRadius}px`;
    }
    
    return borders;
  }

  /**
   * Витягування spacing стилів
   */
  extractSpacingStyles(element) {
    const spacing = {};
    
    if (element.paddingLeft) {
      spacing.paddingLeft = `${element.paddingLeft}px`;
    }
    
    if (element.paddingRight) {
      spacing.paddingRight = `${element.paddingRight}px`;
    }
    
    if (element.paddingTop) {
      spacing.paddingTop = `${element.paddingTop}px`;
    }
    
    if (element.paddingBottom) {
      spacing.paddingBottom = `${element.paddingBottom}px`;
    }
    
    return spacing;
  }

  /**
   * Визначення семантичної ролі елемента
   */
  determineElementSemanticRole(element) {
    const name = element.name.toLowerCase();
    const type = element.type;
    
    if (type === 'TEXT') {
      if (name.includes('title') || name.includes('heading')) return 'heading';
      if (name.includes('button') || name.includes('btn')) return 'interactive';
      if (name.includes('link') || name.includes('anchor')) return 'interactive';
      return 'text';
    }
    
    if (type === 'FRAME') {
      if (name.includes('header') || name.includes('head')) return 'header';
      if (name.includes('footer') || name.includes('foot')) return 'footer';
      if (name.includes('nav') || name.includes('menu')) return 'navigation';
      if (name.includes('main') || name.includes('content')) return 'main';
      if (name.includes('card') || name.includes('item')) return 'content-card';
      if (name.includes('container') || name.includes('wrapper')) return 'container';
      if (name.includes('section') || name.includes('area')) return 'content-section';
      return 'section';
    }
    
    if (type === 'RECTANGLE') {
      if (name.includes('button') || name.includes('btn')) return 'interactive';
      if (name.includes('image') || name.includes('img')) return 'image';
      return 'generic';
    }
    
    if (type === 'COMPONENT' || type === 'INSTANCE') {
      if (name.includes('button')) return 'interactive';
      if (name.includes('card')) return 'content-card';
      return 'component';
    }
    
    return 'generic';
  }

  /**
   * Визначення семантичної ролі сторінки
   */
  determinePageSemanticRole(page) {
    const name = page.name.toLowerCase();
    
    if (name.includes('mobile') || name.includes('phone')) return 'mobile';
    if (name.includes('tablet') || name.includes('ipad')) return 'tablet';
    if (name.includes('desktop') || name.includes('web')) return 'desktop';
    if (name.includes('home') || name.includes('main')) return 'home';
    if (name.includes('about')) return 'about';
    if (name.includes('contact')) return 'contact';
    if (name.includes('product')) return 'product';
    
    return 'page';
  }

  /**
   * Витягування контенту елемента
   */
  extractElementContent(element) {
    const content = {
      text: null,
      hasText: false,
      hasImages: false,
      hasLinks: false,
      hasButtons: false,
      textLength: 0,
      wordCount: 0,
      hasNumbers: false,
      hasSpecialChars: false
    };
    
    if (element.type === 'TEXT' && element.characters) {
      content.text = element.characters;
      content.hasText = true;
      content.textLength = element.characters.length;
      content.wordCount = element.characters.trim().split(/\s+/).filter(w => w.length > 0).length;
      content.hasNumbers = /\d/.test(element.characters);
      content.hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(element.characters);
    }
    
    // Перевірка на зображення
    if (element.type === 'RECTANGLE' && element.fills) {
      content.hasImages = element.fills.some(fill => fill.type === 'IMAGE');
    }
    
    // Перевірка на кнопки
    if (element.type === 'RECTANGLE' && element.name.toLowerCase().includes('button')) {
      content.hasButtons = true;
    }
    
    this.analysis.content.set(element.id, content);
    return content;
  }

  /**
   * Витягування контенту сторінки
   */
  extractPageContent(page) {
    const content = {
      hasText: false,
      hasImages: false,
      hasButtons: false,
      elementCount: 0
    };
    
    if (page.children) {
      page.children.forEach(child => {
        const childContent = this.extractElementContent(child);
        if (childContent.hasText) content.hasText = true;
        if (childContent.hasImages) content.hasImages = true;
        if (childContent.hasButtons) content.hasButtons = true;
        content.elementCount++;
      });
    }
    
    return content;
  }

  /**
   * Витягування позиції елемента
   */
  extractElementPosition(element) {
    const position = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      zIndex: 0
    };
    
    if (element.absoluteBoundingBox) {
      position.x = element.absoluteBoundingBox.x;
      position.y = element.absoluteBoundingBox.y;
      position.width = element.absoluteBoundingBox.width;
      position.height = element.absoluteBoundingBox.height;
    }
    
    return position;
  }

  /**
   * Розрахунок важливості елемента
   */
  calculateElementImportance(element, depth) {
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
    
    const semanticRole = this.determineElementSemanticRole(element);
    importance += semanticImportance[semanticRole] || 1;
    
    // Важливість типу
    const typeImportance = {
      'TEXT': 3,
      'FRAME': 2,
      'RECTANGLE': 1,
      'COMPONENT': 4,
      'INSTANCE': 3
    };
    
    importance += typeImportance[element.type] || 1;
    
    // Важливість за глибиною (менше глибина = більше важливість)
    importance += Math.max(0, 10 - depth);
    
    return Math.min(importance, 20);
  }

  /**
   * Розрахунок складності елемента
   */
  calculateElementComplexity(element) {
    let complexity = 0;
    
    // Складність за кількістю дітей
    if (element.children) {
      complexity += element.children.length * 0.5;
    }
    
    // Складність за стилями
    if (element.fills) complexity += element.fills.length * 0.3;
    if (element.effects) complexity += element.effects.length * 0.4;
    if (element.strokeWeight) complexity += 0.2;
    if (element.cornerRadius) complexity += 0.1;
    
    // Складність за контентом
    if (element.type === 'TEXT' && element.characters) {
      complexity += element.characters.length * 0.01;
    }
    
    return Math.min(complexity, 10);
  }

  /**
   * Розрахунок загальної складності
   */
  calculateComplexity() {
    let totalComplexity = 0;
    let elementCount = 0;
    
    this.analysis.hierarchy.forEach(element => {
      totalComplexity += element.complexity || 0;
      elementCount++;
    });
    
    this.analysis.structure.complexity = elementCount > 0 ? totalComplexity / elementCount : 0;
  }

  /**
   * Оновлення статистики типів елементів
   */
  updateElementTypeStats(type) {
    const count = this.analysis.structure.elementTypes.get(type) || 0;
    this.analysis.structure.elementTypes.set(type, count + 1);
  }

  /**
   * Оновлення статистики семантичних ролей
   */
  updateSemanticRoleStats(role) {
    const count = this.analysis.structure.semanticRoles.get(role) || 0;
    this.analysis.structure.semanticRoles.set(role, count + 1);
  }

  /**
   * Допоміжні методи
   */
  rgbToHex(color) {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  extractGradient(fill) {
    return {
      type: 'linear',
      stops: fill.gradientStops || []
    };
  }

  mapFigmaAlignment(alignment) {
    const alignmentMap = {
      'MIN': 'flex-start',
      'CENTER': 'center',
      'MAX': 'flex-end',
      'SPACE_BETWEEN': 'space-between',
      'SPACE_AROUND': 'space-around'
    };
    
    return alignmentMap[alignment] || 'flex-start';
  }

  extractTransform(transform) {
    // Простий витяг transform матриці
    return `matrix(${transform[0][0]}, ${transform[0][1]}, ${transform[1][0]}, ${transform[1][1]}, ${transform[0][2]}, ${transform[1][2]})`;
  }

  /**
   * Скидання аналізатора
   */
  reset() {
    this.analysis = {
      hierarchy: new Map(),
      styles: new Map(),
      semantics: new Map(),
      content: new Map(),
      structure: {
        depth: 0,
        totalElements: 0,
        elementTypes: new Map(),
        semanticRoles: new Map(),
        complexity: 0
      }
    };
  }

  /**
   * Отримання статистики аналізу
   */
  getStatistics() {
    return {
      totalElements: this.analysis.structure.totalElements,
      maxDepth: this.analysis.structure.depth,
      elementTypes: Object.fromEntries(this.analysis.structure.elementTypes),
      semanticRoles: Object.fromEntries(this.analysis.structure.semanticRoles),
      complexity: this.analysis.structure.complexity,
      averageImportance: this.calculateAverageImportance()
    };
  }

  calculateAverageImportance() {
    let totalImportance = 0;
    let count = 0;
    
    this.analysis.hierarchy.forEach(element => {
      totalImportance += element.importance || 0;
      count++;
    });
    
    return count > 0 ? totalImportance / count : 0;
  }
}

module.exports = FigmaAnalyzer;
