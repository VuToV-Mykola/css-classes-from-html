/**
 * ✅ FIX: Розумний CSS генератор з реальним співставленням Figma-HTML
 * Без хардкодінгу - справжнє співставлення елементів за ієрархією, контентом та семантикою
 * @version 5.0.0 - SMART MATCHING
 */

class SmartCSSGenerator {
  constructor(options = {}) {
    this.options = {
      includeReset: options.includeReset !== false,
      includeComments: options.includeComments !== false,
      optimizeCSS: options.optimizeCSS || false,
      generateResponsive: options.generateResponsive !== false,
      mode: options.mode || 'minimal',
      matchingThreshold: options.matchingThreshold || 0.7, // Поріг співставлення
      ...options
    };

    this.cssRules = new Map();
    this.variables = new Map();
    this.mediaQueries = new Map();
    this.matchingResults = new Map();
    this.unmatchedElements = new Set();

    // ✅ FIX: Ваги для співставлення
    this.matchingWeights = {
      textContent: 0.4, // Текстовий вміст
      semanticRole: 0.25, // Семантична роль
      hierarchy: 0.2, // Ієрархічна позиція
      namesimilarity: 0.15 // Схожість назв
    };

    this.statistics = {
      totalRules: 0,
      matchedElements: 0,
      unmatchedElements: 0,
      matchingAccuracy: 0,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * ✅ FIX: Головна функція генерації CSS з розумним співставленням
   */
  generateCSS(figmaData, htmlData, preMatchedElements = null) {
    this.reset();

    console.log('🧠 Початок розумної генерації CSS...');

    // ✅ FIX: Розумне співставлення елементів
    const matches = preMatchedElements || this.performSmartMatching(figmaData, htmlData);

    console.log(`🎯 Smart matching found ${matches.size} element pairs`);

    // ✅ FIX: Генерація базових стилів
    if (this.options.includeReset) {
      this.generateReset();
    }

    // ✅ FIX: Генерація CSS змінних
    this.generateVariables(figmaData);

    // ✅ FIX: Обробка співставлених елементів
    matches.forEach((htmlElementId, figmaElementId) => {
      const figmaElement = figmaData?.hierarchy?.get(figmaElementId);
      const htmlElement = htmlData?.hierarchy?.get(htmlElementId);

      if (figmaElement && htmlElement) {
        this.generateElementStyles(figmaElement, htmlElement, htmlElementId);
      }
    });

    // ✅ FIX: Обробка неспівставлених HTML елементів
    this.generateUnmatchedElementsCSS(htmlData, matches);

    // ✅ FIX: Генерація адаптивних стилів
    if (this.options.generateResponsive) {
      this.generateResponsiveStyles(figmaData, htmlData);
    }

    // ✅ FIX: Розрахунок статистики
    this.calculateStatistics(matches, figmaData, htmlData);

    return this.compileCSS();
  }

  /**
   * ✅ FIX: Розумне співставлення Figma та HTML елементів
   */
  performSmartMatching(figmaData, htmlData) {
    const matches = new Map();
    const figmaElements = Array.from(figmaData.hierarchy.values());
    const htmlElements = Array.from(htmlData.hierarchy.values());

    console.log(
      `🔍 Matching ${figmaElements.length} Figma elements with ${htmlElements.length} HTML elements`
    );

    // ✅ FIX: Створення матриці схожості
    const similarityMatrix = this.createSimilarityMatrix(figmaElements, htmlElements);

    // ✅ FIX: Пошук найкращих пар
    const usedHtmlElements = new Set();

    figmaElements.forEach((figmaElement, figmaIndex) => {
      let bestMatch = null;
      let bestScore = 0;

      htmlElements.forEach((htmlElement, htmlIndex) => {
        if (usedHtmlElements.has(htmlIndex)) return;

        const score = similarityMatrix[figmaIndex][htmlIndex];
        if (score > bestScore && score >= this.options.matchingThreshold) {
          bestScore = score;
          bestMatch = {htmlElement, htmlIndex, score};
        }
      });

      if (bestMatch) {
        matches.set(figmaElement.id, {
          htmlElementId: bestMatch.htmlElement.id,
          confidence: bestMatch.score,
          strategy: 'smart-matching',
          figmaElement: figmaElement,
          htmlElement: bestMatch.htmlElement
        });
        usedHtmlElements.add(bestMatch.htmlIndex);

        console.log(
          `✅ Matched: "${figmaElement.name}" → ".${this.getElementClassName(bestMatch.htmlElement)}" (${(bestMatch.score * 100).toFixed(1)}%)`
        );
      } else {
        console.log(`❌ No match found for Figma element: "${figmaElement.name}"`);
      }
    });

    return matches;
  }

  /**
   * ✅ FIX: Створення матриці схожості між елементами
   */
  createSimilarityMatrix(figmaElements, htmlElements) {
    const matrix = [];

    figmaElements.forEach(figmaElement => {
      const row = [];
      htmlElements.forEach(htmlElement => {
        const similarity = this.calculateElementSimilarity(figmaElement, htmlElement);
        row.push(similarity);
      });
      matrix.push(row);
    });

    return matrix;
  }

  /**
   * ✅ FIX: Розрахунок схожості між Figma та HTML елементом
   */
  calculateElementSimilarity(figmaElement, htmlElement) {
    let totalScore = 0;

    // ✅ FIX: 1. Схожість за текстовим контентом
    const textScore = this.calculateTextSimilarity(figmaElement, htmlElement);
    totalScore += textScore * this.matchingWeights.textContent;

    // ✅ FIX: 2. Семантична схожість
    const semanticScore = this.calculateSemanticSimilarity(figmaElement, htmlElement);
    totalScore += semanticScore * this.matchingWeights.semanticRole;

    // ✅ FIX: 3. Ієрархічна схожість
    const hierarchyScore = this.calculateHierarchySimilarity(figmaElement, htmlElement);
    totalScore += hierarchyScore * this.matchingWeights.hierarchy;

    // ✅ FIX: 4. Схожість назв
    const nameScore = this.calculateNameSimilarity(figmaElement, htmlElement);
    totalScore += nameScore * this.matchingWeights.namesimilarity;

    return Math.min(totalScore, 1.0);
  }

  /**
   * ✅ FIX: Схожість за текстовим контентом
   */
  calculateTextSimilarity(figmaElement, htmlElement) {
    const figmaText = this.extractTextContent(figmaElement);
    const htmlText = this.extractTextContent(htmlElement);

    if (!figmaText && !htmlText) return 0.5; // Обидва без тексту
    if (!figmaText || !htmlText) return 0; // Один без тексту

    const normalizedFigma = this.normalizeText(figmaText);
    const normalizedHtml = this.normalizeText(htmlText);

    if (normalizedFigma === normalizedHtml) return 1.0; // Точний збіг

    // ✅ FIX: Часткове співпадіння
    const similarity = this.calculateStringSimilarity(normalizedFigma, normalizedHtml);
    return similarity;
  }

  /**
   * ✅ FIX: Семантична схожість
   */
  calculateSemanticSimilarity(figmaElement, htmlElement) {
    const figmaRole = this.determineFigmaSemanticRole(figmaElement);
    const htmlRole = this.determineHtmlSemanticRole(htmlElement);

    // ✅ FIX: Прямий збіг ролей
    if (figmaRole === htmlRole) return 1.0;

    // ✅ FIX: Спорідненість ролей
    return this.calculateRoleAffinity(figmaRole, htmlRole);
  }

  /**
   * ✅ FIX: Ієрархічна схожість
   */
  calculateHierarchySimilarity(figmaElement, htmlElement) {
    const figmaDepth = figmaElement.depth || 0;
    const htmlDepth = htmlElement.level || 0;

    // ✅ FIX: Схожість за глибиною
    const depthDiff = Math.abs(figmaDepth - htmlDepth);
    const maxDepth = Math.max(figmaDepth, htmlDepth) || 1;
    const depthSimilarity = 1 - depthDiff / maxDepth;

    // ✅ FIX: Схожість за кількістю дітей
    const figmaChildren = figmaElement.children?.length || 0;
    const htmlChildren = htmlElement.children?.length || 0;
    const childrenSimilarity =
      figmaChildren === 0 && htmlChildren === 0
        ? 1.0
        : Math.min(figmaChildren, htmlChildren) / Math.max(figmaChildren, htmlChildren) || 0;

    return (depthSimilarity + childrenSimilarity) / 2;
  }

  /**
   * ✅ FIX: Схожість назв/класів
   */
  calculateNameSimilarity(figmaElement, htmlElement) {
    const figmaName = this.normalizeText(figmaElement.name || '');
    const htmlClasses = (htmlElement.classes || []).join(' ');
    const htmlTag = htmlElement.tagName || '';

    if (!figmaName) return 0;

    // ✅ FIX: Перевірка схожості з класами HTML
    let bestSimilarity = 0;

    htmlElement.classes?.forEach(className => {
      const similarity = this.calculateStringSimilarity(figmaName, this.normalizeText(className));
      bestSimilarity = Math.max(bestSimilarity, similarity);
    });

    // ✅ FIX: Перевірка схожості з тегом HTML
    const tagSimilarity = this.calculateStringSimilarity(figmaName, htmlTag);
    bestSimilarity = Math.max(bestSimilarity, tagSimilarity);

    return bestSimilarity;
  }

  /**
   * ✅ FIX: Генерація стилів для співставленого елемента
   */
  generateElementStyles(figmaElement, htmlElement, matchInfo) {
    const className = this.getElementClassName(htmlElement);
    if (!className) return;

    const styles = new Map();

    // ✅ FIX: Витягуємо стилі з Figma елемента
    this.extractFigmaStylesToCSS(figmaElement, styles);

    // ✅ FIX: Зберігаємо правило
    this.cssRules.set(className, styles);

    // ✅ FIX: Зберігаємо інформацію про співставлення
    this.matchingResults.set(className, {
      figmaId: figmaElement.id,
      figmaName: figmaElement.name,
      figmaType: figmaElement.type,
      htmlTag: htmlElement.tagName,
      confidence: matchInfo.confidence,
      strategy: matchInfo.strategy
    });

    this.statistics.totalRules++;
    this.statistics.matchedElements++;

    console.log(
      `📝 Згенеровано стилі для .${className} з «${figmaElement.name}» (${figmaElement.type})`
    );
  }

  /**
   * ✅ FIX: Витягування реальних стилів з Figma
   */
  extractFigmaStylesToCSS(figmaElement, styles) {
    // ✅ FIX: Typography (для TEXT елементів)
    if (figmaElement.type === 'TEXT' || figmaElement.characters) {
      this.extractTypographyStyles(figmaElement, styles);
    }

    // ✅ FIX: Colors і Fills
    this.extractColorStyles(figmaElement, styles);

    // ✅ FIX: Layout стилі
    this.extractLayoutStyles(figmaElement, styles);

    // ✅ FIX: Spacing стилі
    this.extractSpacingStyles(figmaElement, styles);

    // ✅ FIX: Border стилі
    this.extractBorderStyles(figmaElement, styles);

    // ✅ FIX: Effects (тіні, розмиття)
    this.extractEffectStyles(figmaElement, styles);

    // ✅ FIX: Size стилі
    this.extractSizeStyles(figmaElement, styles);
  }

  /**
   * ✅ FIX: Витягування typography стилів
   */
  extractTypographyStyles(figmaElement, styles) {
    if (figmaElement.style) {
      const typo = figmaElement.style;

      if (typo.fontFamily) styles.set('font-family', `'${typo.fontFamily}', sans-serif`);
      if (typo.fontSize) styles.set('font-size', `${typo.fontSize}px`);
      if (typo.fontWeight) styles.set('font-weight', typo.fontWeight.toString());
      if (typo.lineHeightPx) styles.set('line-height', `${typo.lineHeightPx}px`);
      if (typo.letterSpacing) styles.set('letter-spacing', `${typo.letterSpacing}px`);

      if (typo.textAlignHorizontal) {
        const align = typo.textAlignHorizontal.toLowerCase();
        styles.set(
          'text-align',
          align === 'center' ? 'center' : align === 'right' ? 'right' : 'left'
        );
      }

      if (typo.textDecoration && typo.textDecoration !== 'NONE') {
        styles.set('text-decoration', typo.textDecoration.toLowerCase());
      }
    }
  }

  /**
   * ✅ FIX: Витягування color стилів
   */
  extractColorStyles(figmaElement, styles) {
    if (figmaElement.fills && figmaElement.fills.length > 0) {
      const primaryFill = figmaElement.fills[0];

      if (primaryFill.type === 'SOLID' && primaryFill.color) {
        const colorHex = this.rgbToHex(primaryFill.color);

        if (figmaElement.type === 'TEXT') {
          styles.set('color', colorHex);
        } else {
          styles.set('background-color', colorHex);
        }

        if (primaryFill.opacity !== undefined && primaryFill.opacity < 1) {
          styles.set('opacity', primaryFill.opacity.toString());
        }
      }
    }
  }

  /**
   * ✅ FIX: Витягування layout стилів
   */
  extractLayoutStyles(figmaElement, styles) {
    if (figmaElement.layoutMode) {
      styles.set('display', 'flex');
      styles.set('flex-direction', figmaElement.layoutMode === 'HORIZONTAL' ? 'row' : 'column');

      if (figmaElement.primaryAxisAlignItems) {
        styles.set('justify-content', this.mapFigmaAlignment(figmaElement.primaryAxisAlignItems));
      }

      if (figmaElement.counterAxisAlignItems) {
        styles.set('align-items', this.mapFigmaAlignment(figmaElement.counterAxisAlignItems));
      }

      if (figmaElement.itemSpacing) {
        styles.set('gap', `${figmaElement.itemSpacing}px`);
      }
    }
  }

  /**
   * ✅ FIX: Витягування spacing стилів
   */
  extractSpacingStyles(figmaElement, styles) {
    const paddings = [
      figmaElement.paddingTop || 0,
      figmaElement.paddingRight || 0,
      figmaElement.paddingBottom || 0,
      figmaElement.paddingLeft || 0
    ];

    if (paddings.some(p => p > 0)) {
      if (paddings.every(p => p === paddings[0])) {
        styles.set('padding', `${paddings[0]}px`);
      } else {
        styles.set('padding', `${paddings[0]}px ${paddings[1]}px ${paddings[2]}px ${paddings[3]}px`);
      }
    }
  }

  /**
   * ✅ FIX: Витягування border стилів
   */
  extractBorderStyles(figmaElement, styles) {
    if (figmaElement.strokeWeight && figmaElement.strokeWeight > 0) {
      styles.set('border-width', `${figmaElement.strokeWeight}px`);
      styles.set('border-style', 'solid');

      if (figmaElement.strokes && figmaElement.strokes.length > 0) {
        const stroke = figmaElement.strokes[0];
        if (stroke.type === 'SOLID' && stroke.color) {
          styles.set('border-color', this.rgbToHex(stroke.color));
        }
      }
    }

    if (figmaElement.cornerRadius) {
      styles.set('border-radius', `${figmaElement.cornerRadius}px`);
    }
  }

  /**
   * ✅ FIX: Витягування effect стилів
   */
  extractEffectStyles(figmaElement, styles) {
    if (figmaElement.effects && figmaElement.effects.length > 0) {
      const shadows = figmaElement.effects
        .filter(effect => effect.type === 'DROP_SHADOW' && effect.visible !== false)
        .map(effect => {
          const x = effect.offset?.x || 0;
          const y = effect.offset?.y || 0;
          const blur = effect.radius || 0;
          const spread = effect.spread || 0;
          const color = effect.color ? this.rgbToHex(effect.color) : '#000000';
          return `${x}px ${y}px ${blur}px ${spread}px ${color}`;
        });

      if (shadows.length > 0) {
        styles.set('box-shadow', shadows.join(', '));
      }
    }
  }

  /**
   * ✅ FIX: Витягування size стилів
   */
  extractSizeStyles(figmaElement, styles) {
    if (figmaElement.absoluteBoundingBox) {
      const {width, height} = figmaElement.absoluteBoundingBox;

      // ✅ FIX: Розумне встановлення розмірів
      if (width && width < 2000) {
        // Уникаємо занадто великих розмірів
        styles.set('width', `${width}px`);
      }

      if (height && height < 2000) {
        styles.set('height', `${height}px`);
      }
    }
  }

  /**
   * ✅ FIX: Генерація CSS для неспівставлених елементів
   */
  generateUnmatchedElementsCSS(htmlData, matches) {
    if (!htmlData?.hierarchy) return;

    const matchedHtmlIds = new Set();
    matches.forEach(match => matchedHtmlIds.add(match.htmlElementId));

    htmlData.hierarchy.forEach((htmlElement, htmlId) => {
      if (!matchedHtmlIds.has(htmlId) && htmlElement.classes && htmlElement.classes.length > 0) {
        htmlElement.classes.forEach(className => {
          if (!this.cssRules.has(className)) {
            this.cssRules.set(className, new Map());
            this.unmatchedElements.add(className);
            this.statistics.unmatchedElements++;
            this.statistics.totalRules++;
          }
        });
      }
    });
  }

  /**
   * ✅ FIX: Допоміжні методи
   */
  extractTextContent(element) {
    if (element.characters) return element.characters;
    if (element.textContent) return element.textContent;
    if (element.content?.text) return element.content.text;
    return null;
  }

  normalizeText(text) {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  calculateStringSimilarity(str1, str2) {
    if (str1 === str2) return 1.0;
    if (!str1 || !str2) return 0;

    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = Array(str2.length + 1)
      .fill()
      .map(() => Array(str1.length + 1).fill(0));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        matrix[j][i] =
          str1[i - 1] === str2[j - 1]
            ? matrix[j - 1][i - 1]
            : Math.min(matrix[j - 1][i] + 1, matrix[j][i - 1] + 1, matrix[j - 1][i - 1] + 1);
      }
    }

    return matrix[str2.length][str1.length];
  }

  determineFigmaSemanticRole(element) {
    const name = (element.name || '').toLowerCase();
    const type = element.type;

    if (type === 'TEXT') {
      if (
        name.includes('title') ||
        name.includes('heading') ||
        name.includes('h1') ||
        name.includes('h2')
      )
        return 'heading';
      if (name.includes('button') || name.includes('btn')) return 'button';
      if (name.includes('link') || name.includes('anchor')) return 'link';
      return 'text';
    }

    if (type === 'FRAME' || type === 'GROUP') {
      if (name.includes('header') || name.includes('head')) return 'header';
      if (name.includes('footer') || name.includes('foot')) return 'footer';
      if (name.includes('nav') || name.includes('menu')) return 'navigation';
      if (name.includes('main') || name.includes('content')) return 'main';
      if (name.includes('card') || name.includes('item')) return 'card';
      if (name.includes('button') || name.includes('btn')) return 'button';
      return 'container';
    }

    if (type === 'RECTANGLE' || type === 'ELLIPSE') {
      if (name.includes('button') || name.includes('btn')) return 'button';
      if (name.includes('image') || name.includes('img') || name.includes('photo')) return 'image';
      return 'shape';
    }

    if (type === 'COMPONENT' || type === 'INSTANCE') {
      if (name.includes('button')) return 'button';
      if (name.includes('card')) return 'card';
      return 'component';
    }

    return 'generic';
  }

  determineHtmlSemanticRole(element) {
    const tag = element.tagName?.toLowerCase();
    const classes = (element.classes || []).join(' ').toLowerCase();

    // ✅ FIX: За тегом
    if (tag === 'button') return 'button';
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) return 'heading';
    if (tag === 'a') return 'link';
    if (tag === 'img') return 'image';
    if (tag === 'header') return 'header';
    if (tag === 'footer') return 'footer';
    if (tag === 'nav') return 'navigation';
    if (tag === 'main') return 'main';
    if (tag === 'section' || tag === 'article') return 'container';

    // ✅ FIX: За класами
    if (classes.includes('button') || classes.includes('btn')) return 'button';
    if (classes.includes('header') || classes.includes('head')) return 'header';
    if (classes.includes('footer') || classes.includes('foot')) return 'footer';
    if (classes.includes('nav') || classes.includes('menu')) return 'navigation';
    if (classes.includes('main') || classes.includes('content')) return 'main';
    if (classes.includes('card') || classes.includes('item')) return 'card';
    if (classes.includes('title') || classes.includes('heading')) return 'heading';

    return tag === 'div' || tag === 'span' ? 'container' : 'generic';
  }

  calculateRoleAffinity(role1, role2) {
    const affinityMap = {
      heading: {text: 0.8, title: 0.9, container: 0.3},
      button: {link: 0.7, container: 0.4, shape: 0.6},
      text: {heading: 0.8, container: 0.5},
      container: {card: 0.8, main: 0.7, header: 0.6, footer: 0.6},
      navigation: {header: 0.8, container: 0.6},
      image: {shape: 0.7, container: 0.4}
    };

    return affinityMap[role1]?.[role2] || 0;
  }

  getElementClassName(htmlElement) {
    if (htmlElement.classes && htmlElement.classes.length > 0) {
      return htmlElement.classes[0];
    }
    return htmlElement.tagName?.toLowerCase() || null;
  }

  rgbToHex(color) {
    if (typeof color === 'string') return color;
    if (!color) return '#000000';

    const r = Math.round((color.r || 0) * 255);
    const g = Math.round((color.g || 0) * 255);
    const b = Math.round((color.b || 0) * 255);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  mapFigmaAlignment(alignment) {
    const alignmentMap = {
      MIN: 'flex-start',
      CENTER: 'center',
      MAX: 'flex-end',
      SPACE_BETWEEN: 'space-between',
      SPACE_AROUND: 'space-around'
    };
    return alignmentMap[alignment] || 'flex-start';
  }

  /**
   * ✅ FIX: Генерація базових стилів
   */
  generateReset() {
    const resetStyles = new Map([
      ['margin', '0'],
      ['padding', '0'],
      ['box-sizing', 'border-box']
    ]);

    this.cssRules.set('*', resetStyles);
    this.cssRules.set('*::before', resetStyles);
    this.cssRules.set('*::after', resetStyles);

    const bodyStyles = new Map([
      ['font-family', '-apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif'],
      ['line-height', '1.5'],
      ['color', 'var(--text-color)'],
      ['background-color', 'var(--background-color)']
    ]);

    this.cssRules.set('body', bodyStyles);
    this.statistics.totalRules += 4;
  }

  generateVariables(figmaData) {
    // ✅ FIX: Базові змінні
    this.variables.set('--primary-color', '#007ACC');
    this.variables.set('--secondary-color', '#6c757d');
    this.variables.set('--text-color', '#212529');
    this.variables.set('--background-color', '#ffffff');
    this.variables.set('--border-color', '#dee2e6');
    this.variables.set('--shadow-color', 'rgba(0, 0, 0, 0.1)');

    // ✅ FIX: Spacing змінні
    this.variables.set('--spacing-xs', '0.25rem');
    this.variables.set('--spacing-sm', '0.5rem');
    this.variables.set('--spacing-md', '1rem');
    this.variables.set('--spacing-lg', '1.5rem');
    this.variables.set('--spacing-xl', '2rem');

    // ✅ FIX: Breakpoints
    this.variables.set('--breakpoint-sm', '576px');
    this.variables.set('--breakpoint-md', '768px');
    this.variables.set('--breakpoint-lg', '992px');
    this.variables.set('--breakpoint-xl', '1200px');
  }

  generateResponsiveStyles(figmaData, htmlData) {
    const mediaQueries = [
      '@media (max-width: 768px)',
      '@media (min-width: 769px) and (max-width: 1024px)',
      '@media (min-width: 1025px)'
    ];

    mediaQueries.forEach(mq => {
      this.mediaQueries.set(mq, new Map());
    });

    // ✅ FIX: Базові адаптивні стилі
    const mobileStyles = new Map([
      ['padding', 'var(--spacing-sm)'],
      ['font-size', '14px']
    ]);

    this.mediaQueries.get('@media (max-width: 768px)').set('container', mobileStyles);
  }

  /**
   * ✅ FIX: Компіляція фінального CSS
   */
  compileCSS() {
    let css = '';

    // ✅ FIX: Заголовок
    css += '/* ✅ CSS згенеровано Smart CSS Generator v5.0 */\n';
    css += `/* Згенеровано: ${this.statistics.generatedAt} */\n`;
    css += `/* Зіставлено: ${this.statistics.matchedElements} | Не зіставлено: ${this.statistics.unmatchedElements} */\n`;
    css += `/* Точність: ${(this.statistics.matchingAccuracy * 100).toFixed(1)}% */\n\n`;

    // ✅ FIX: CSS змінні
    if (this.variables.size > 0) {
      css += ':root {\n';
      this.variables.forEach((value, variable) => {
        css += `  ${variable}: ${value};\n`;
      });
      css += '}\n\n';
    }

    // ✅ FIX: CSS правила з детальними коментарями
    this.cssRules.forEach((styles, selector) => {
      const matchInfo = this.matchingResults.get(selector);

      if (this.options.includeComments) {
        if (matchInfo) {
          css += `/* ✅ MATCHED: Figma "${matchInfo.figmaName}" (${matchInfo.figmaType}) → HTML .${selector} */\n`;
          css += `/* Confidence: ${(matchInfo.confidence * 100).toFixed(1)}% | Strategy: ${matchInfo.strategy} */\n`;
        } else if (this.unmatchedElements.has(selector)) {
          css += `/* ❌ UNMATCHED: No Figma element found for .${selector} */\n`;
        }
      }

      css += `.${selector} {\n`;

      if (styles.size === 0) {
        css += '  /* Add styles manually */\n';
      } else {
        styles.forEach((value, property) => {
          css += `  ${property}: ${value};\n`;
        });
      }

      css += '}\n\n';
    });

    // ✅ FIX: Адаптивні стилі
    if (this.mediaQueries.size > 0) {
      css += '/* ✅ RESPONSIVE STYLES */\n';
      this.mediaQueries.forEach((rules, mediaQuery) => {
        if (rules.size > 0) {
          css += `${mediaQuery} {\n`;
          rules.forEach((styles, selector) => {
            css += `  .${selector} {\n`;
            styles.forEach((value, property) => {
              css += `    ${property}: ${value};\n`;
            });
            css += '  }\n';
          });
          css += '}\n\n';
        }
      });
    }

    return this.options.optimizeCSS ? this.optimizeCSS(css) : css;
  }

  calculateStatistics(matches, figmaData, htmlData) {
    const totalFigmaElements = figmaData?.hierarchy?.size || 0;
    const totalHtmlElements = htmlData?.hierarchy?.size || 0;

    this.statistics.matchingAccuracy =
      totalFigmaElements > 0 ? matches.size / totalFigmaElements : 0;

    console.log('📊 Matching Statistics:');
    console.log(`   Total Figma elements: ${totalFigmaElements}`);
    console.log(`   Total HTML elements: ${totalHtmlElements}`);
    console.log(`   Successful matches: ${matches.size}`);
    console.log(`   Matching accuracy: ${(this.statistics.matchingAccuracy * 100).toFixed(1)}%`);
  }

  optimizeCSS(css) {
    return css
      .replace(/\n\s*\n/g, '\n')
      .replace(/\s*{\s*/g, ' {\n  ')
      .replace(/;\s*}/g, ';\n}')
      .trim();
  }

  reset() {
    this.cssRules.clear();
    this.variables.clear();
    this.mediaQueries.clear();
    this.matchingResults.clear();
    this.unmatchedElements.clear();

    this.statistics = {
      totalRules: 0,
      matchedElements: 0,
      unmatchedElements: 0,
      matchingAccuracy: 0,
      generatedAt: new Date().toISOString()
    };
  }

  getStatistics() {
    return {...this.statistics};
  }
}

module.exports = SmartCSSGenerator;
