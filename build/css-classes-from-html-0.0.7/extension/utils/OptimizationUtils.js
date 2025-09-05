/**
 * @module OptimizationUtils
 * @description Утиліти для оптимізації продуктивності та розміру коду
 * @author Ukrainian Developer
 * @version 2.0.0
 */

class OptimizationUtils {
  constructor(options = {}) {
    this.options = {
      minifyCSS: true,
      removeComments: true,
      combineMediaQueries: true,
      optimizeSelectors: true,
      removeUnused: true,
      compressColors: true,
      optimizeImages: true,
      cacheResults: true,
      ...options
    };

    // Кеш для оптимізованих результатів
    this.cache = new Map();
    this.statistics = {
      originalSize: 0,
      optimizedSize: 0,
      savedBytes: 0,
      optimizationRatio: 0
    };
  }

  /**
   * Комплексна оптимізація всієї системи
   * @param {Object} system - Система для оптимізації
   * @returns {Object} Оптимізована система
   */
  optimizeSystem(system) {
    const startSize = this.calculateSize(system);
    this.statistics.originalSize = startSize;

    const optimized = {
      css: this.optimizeCSS(system.css),
      html: this.optimizeHTML(system.html),
      javascript: this.optimizeJavaScript(system.javascript),
      assets: this.optimizeAssets(system.assets),
      performance: this.optimizePerformance(system)
    };

    const endSize = this.calculateSize(optimized);
    this.statistics.optimizedSize = endSize;
    this.statistics.savedBytes = startSize - endSize;
    this.statistics.optimizationRatio = (this.statistics.savedBytes / startSize) * 100;

    return {
      ...optimized,
      statistics: { ...this.statistics }
    };
  }

  /**
   * Оптимізація CSS
   * @param {string} css - CSS код
   * @returns {string} Оптимізований CSS
   */
  optimizeCSS(css) {
    if (!css) return '';

    // Перевірка кешу
    const cacheKey = this.generateCacheKey(css);
    if (this.options.cacheResults && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    let optimized = css;

    // Видалення коментарів
    if (this.options.removeComments) {
      optimized = this.removeComments(optimized);
    }

    // Мініфікація
    if (this.options.minifyCSS) {
      optimized = this.minifyCSS(optimized);
    }

    // Оптимізація селекторів
    if (this.options.optimizeSelectors) {
      optimized = this.optimizeSelectors(optimized);
    }

    // Стиснення кольорів
    if (this.options.compressColors) {
      optimized = this.compressColors(optimized);
    }

    // Об'єднання media queries
    if (this.options.combineMediaQueries) {
      optimized = this.combineMediaQueries(optimized);
    }

    // Видалення дублікатів
    optimized = this.removeDuplicateRules(optimized);

    // Оптимізація властивостей
    optimized = this.optimizeProperties(optimized);

    // Збереження в кеш
    if (this.options.cacheResults) {
      this.cache.set(cacheKey, optimized);
    }

    return optimized;
  }

  /**
   * Мініфікація CSS
   * @param {string} css - CSS код
   * @returns {string} Мініфікований CSS
   */
  minifyCSS(css) {
    return css
      // Видалення пробілів навколо символів
      .replace(/\s*([{}:;,])\s*/g, '$1')
      // Видалення зайвих пробілів
      .replace(/\s+/g, ' ')
      // Видалення пробілів на початку та в кінці
      .trim()
      // Видалення останньої крапки з комою перед }
      .replace(/;}/g, '}')
      // Видалення пробілів в calc()
      .replace(/calc\s*\(\s*/g, 'calc(')
      .replace(/\s*\)/g, ')')
      // Оптимізація 0 значень
      .replace(/:\s*0px/g, ':0')
      .replace(/:\s*0\.\d+/g, (match) => {
        const num = parseFloat(match.split(':')[1]);
        return `:${num}`;
      })
      // Видалення quotes з url()
      .replace(/url\(["']([^"']+)["']\)/g, 'url($1)');
  }

  /**
   * Видалення коментарів
   * @param {string} code - Код
   * @returns {string} Код без коментарів
   */
  removeComments(code) {
    // CSS коментарі
    code = code.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // JS однорядкові коментарі (обережно з регулярками та рядками)
    code = code.replace(/(?<!["'`])\/\/.*$/gm, '');
    
    return code;
  }

  /**
   * Оптимізація селекторів
   * @param {string} css - CSS код
   * @returns {string} CSS з оптимізованими селекторами
   */
  optimizeSelectors(css) {
    // Видалення надмірної специфічності
    css = css.replace(/body\s+([.#])/g, '$1');
    css = css.replace(/html\s+body\s+/g, '');
    
    // Скорочення універсальних селекторів
    css = css.replace(/\*\s*>\s*/g, '> ');
    css = css.replace(/\s*>\s*\*/g, ' > ');
    
    // Оптимізація псевдокласів
    css = css.replace(/:nth-child\(1\)/g, ':first-child');
    css = css.replace(/:nth-last-child\(1\)/g, ':last-child');
    
    // Видалення зайвих пробілів в селекторах
    css = css.replace(/\s*([>+~])\s*/g, '$1');
    
    return css;
  }

  /**
   * Стиснення кольорів
   * @param {string} css - CSS код
   * @returns {string} CSS зі стисненими кольорами
   */
  compressColors(css) {
    // HEX кольори
    css = css.replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3/gi, '#$1$2$3');
    
    // RGB в HEX
    css = css.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g, (match, r, g, b) => {
      const hex = '#' + 
        parseInt(r).toString(16).padStart(2, '0') +
        parseInt(g).toString(16).padStart(2, '0') +
        parseInt(b).toString(16).padStart(2, '0');
      return hex;
    });
    
    // Заміна назв кольорів на коротші HEX
    const colorMap = {
      'white': '#fff',
      'black': '#000',
      'red': '#f00',
      'green': '#008000',
      'blue': '#00f',
      'yellow': '#ff0',
      'cyan': '#0ff',
      'magenta': '#f0f',
      'silver': '#c0c0c0',
      'gray': '#808080',
      'grey': '#808080'
    };
    
    Object.entries(colorMap).forEach(([name, hex]) => {
      const regex = new RegExp(`:\\s*${name}\\b`, 'gi');
      css = css.replace(regex, `:${hex}`);
    });
    
    return css;
  }

  /**
   * Об'єднання media queries
   * @param {string} css - CSS код
   * @returns {string} CSS з об'єднаними media queries
   */
  combineMediaQueries(css) {
    const mediaQueries = new Map();
    
    // Витягування всіх media queries
    const regex = /@media([^{]+)\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
    let match;
    
    while ((match = regex.exec(css)) !== null) {
      const condition = match[1].trim();
      const rules = match[2].trim();
      
      if (!mediaQueries.has(condition)) {
        mediaQueries.set(condition, []);
      }
      mediaQueries.get(condition).push(rules);
    }
    
    // Видалення оригінальних media queries
    css = css.replace(regex, '');
    
    // Додавання об'єднаних media queries в кінець
    mediaQueries.forEach((rules, condition) => {
      css += `@media ${condition}{${rules.join('')}}`;
    });
    
    return css;
  }

  /**
   * Видалення дублікованих правил
   * @param {string} css - CSS код
   * @returns {string} CSS без дублікатів
   */
  removeDuplicateRules(css) {
    const rules = new Map();
    const regex = /([^{]+)\{([^}]+)\}/g;
    let match;
    
    while ((match = regex.exec(css)) !== null) {
      const selector = match[1].trim();
      const properties = match[2].trim();
      
      // Зберігаємо тільки останнє правило для кожного селектора
      rules.set(selector, properties);
    }
    
    // Відновлення CSS з унікальних правил
    let optimized = '';
    rules.forEach((properties, selector) => {
      optimized += `${selector}{${properties}}`;
    });
    
    return optimized;
  }

  /**
   * Оптимізація властивостей
   * @param {string} css - CSS код
   * @returns {string} CSS з оптимізованими властивостями
   */
  optimizeProperties(css) {
    // Скорочення margin/padding
    css = css.replace(/margin:(\S+)\s+\1\s+\1\s+\1/g, 'margin:$1');
    css = css.replace(/margin:(\S+)\s+(\S+)\s+\1\s+\2/g, 'margin:$1 $2');
    css = css.replace(/padding:(\S+)\s+\1\s+\1\s+\1/g, 'padding:$1');
    css = css.replace(/padding:(\S+)\s+(\S+)\s+\1\s+\2/g, 'padding:$1 $2');
    
    // Скорочення border
    css = css.replace(/border-width:(\S+);border-style:(\S+);border-color:(\S+)/g, 
                     'border:$1 $2 $3');
    
    // Оптимізація font
    css = css.replace(/font-weight:normal/g, 'font-weight:400');
    css = css.replace(/font-weight:bold/g, 'font-weight:700');
    
    // Видалення префіксів для стабільних властивостей
    const stableProperties = ['border-radius', 'box-shadow', 'transition'];
    stableProperties.forEach(prop => {
      css = css.replace(new RegExp(`-webkit-${prop}`, 'g'), prop);
      css = css.replace(new RegExp(`-moz-${prop}`, 'g'), prop);
      css = css.replace(new RegExp(`-ms-${prop}`, 'g'), prop);
      css = css.replace(new RegExp(`-o-${prop}`, 'g'), prop);
    });
    
    return css;
  }

  /**
   * Оптимізація HTML
   * @param {string} html - HTML код
   * @returns {string} Оптимізований HTML
   */
  optimizeHTML(html) {
    if (!html) return '';
    
    let optimized = html;
    
    // Видалення коментарів (крім умовних IE коментарів)
    optimized = optimized.replace(/<!--(?!\[if).*?-->/gs, '');
    
    // Видалення зайвих пробілів
    optimized = optimized.replace(/\s+/g, ' ');
    optimized = optimized.replace(/>\s+</g, '><');
    
    // Видалення непотрібних атрибутів
    optimized = optimized.replace(/\s+type="text\/javascript"/g, '');
    optimized = optimized.replace(/\s+type="text\/css"/g, '');
    
    // Оптимізація boolean атрибутів
    optimized = optimized.replace(/\s+(disabled|readonly|required|checked)="[^"]*"/g, ' $1');
    
    // Видалення порожніх атрибутів
    optimized = optimized.replace(/\s+[a-z-]+=""/g, '');
    
    return optimized;
  }

  /**
   * Оптимізація JavaScript
   * @param {string} js - JavaScript код
   * @returns {string} Оптимізований JavaScript
   */
  optimizeJavaScript(js) {
    if (!js) return '';
    
    let optimized = js;
    
    // Видалення коментарів
    optimized = this.removeComments(optimized);
    
    // Базова мініфікація (в реальності краще використовувати terser)
    optimized = optimized
      .replace(/\s+/g, ' ')
      .replace(/\s*([{}()[\],;:=<>+\-*/%!&|^~?])\s*/g, '$1')
      .replace(/;}/g, '}')
      .trim();
    
    // Скорочення true/false
    optimized = optimized.replace(/===true/g, '');
    optimized = optimized.replace(/===false/g, '!');
    optimized = optimized.replace(/!==true/g, '!');
    optimized = optimized.replace(/!==false/g, '!!');
    
    return optimized;
  }

  /**
   * Оптимізація асетів
   * @param {Object} assets - Асети
   * @returns {Object} Оптимізовані асети
   */
  optimizeAssets(assets) {
    if (!assets) return {};
    
    const optimized = {};
    
    Object.entries(assets).forEach(([key, asset]) => {
      if (asset.type === 'image' && this.options.optimizeImages) {
        optimized[key] = this.optimizeImage(asset);
      } else if (asset.type === 'font') {
        optimized[key] = this.optimizeFont(asset);
      } else {
        optimized[key] = asset;
      }
    });
    
    return optimized;
  }

  /**
   * Оптимізація зображень
   * @param {Object} image - Зображення
   * @returns {Object} Оптимізоване зображення
   */
  optimizeImage(image) {
    const optimized = { ...image };
    
    // Рекомендації для оптимізації
    optimized.recommendations = [];
    
    // Перевірка розміру
    if (image.size > 100000) {
      optimized.recommendations.push({
        type: 'SIZE',
        message: 'Розмір зображення перевищує 100KB, розгляньте компресію'
      });
    }
    
    // Перевірка формату
    if (!['webp', 'avif'].includes(image.format)) {
      optimized.recommendations.push({
        type: 'FORMAT',
        message: `Розгляньте використання WebP або AVIF замість ${image.format}`
      });
    }
    
    // Генерація srcset
    optimized.srcset = this.generateSrcset(image);
    
    // Lazy loading
    optimized.loading = 'lazy';
    
    return optimized;
  }

  /**
   * Оптимізація шрифтів
   * @param {Object} font - Шрифт
   * @returns {Object} Оптимізований шрифт
   */
  optimizeFont(font) {
    const optimized = { ...font };
    
    // Font-display стратегія
    optimized.fontDisplay = 'swap';
    
    // Підмножини символів
    optimized.unicodeRange = this.detectUnicodeRange(font);
    
    // Preload для критичних шрифтів
    if (font.critical) {
      optimized.preload = true;
    }
    
    return optimized;
  }

  /**
   * Оптимізація продуктивності
   * @param {Object} system - Система
   * @returns {Object} Оптимізації продуктивності
   */
  optimizePerformance(system) {
    const optimizations = {
      critical: this.extractCriticalCSS(system),
      lazyLoad: this.implementLazyLoading(system),
      codeSplifting: this.implementCodeSplitting(system),
      caching: this.implementCaching(system),
      compression: this.implementCompression(system)
    };
    
    return optimizations;
  }

  /**
   * Витягування критичного CSS
   * @param {Object} system - Система
   * @returns {Object} Критичний CSS
   */
  extractCriticalCSS(system) {
    const critical = {
      inline: '',
      deferred: ''
    };
    
    if (!system.css) return critical;
    
    // Визначення критичних селекторів (above the fold)
    const criticalSelectors = [
      'body', 'html', '.container', '.header', '.hero',
      'h1', 'h2', 'nav', '.logo'
    ];
    
    const cssRules = this.parseCSSRules(system.css);
    
    cssRules.forEach(rule => {
      const isCritical = criticalSelectors.some(selector => 
        rule.selector.includes(selector)
      );
      
      if (isCritical) {
        critical.inline += `${rule.selector}{${rule.properties}}`;
      } else {
        critical.deferred += `${rule.selector}{${rule.properties}}`;
      }
    });
    
    return critical;
  }

  /**
   * Реалізація lazy loading
   * @param {Object} system - Система
   * @returns {Object} Lazy loading конфігурація
   */
  implementLazyLoading(system) {
    return {
      images: {
        enabled: true,
        rootMargin: '50px',
        threshold: 0.01
      },
      components: {
        enabled: true,
        strategy: 'intersection-observer'
      },
      scripts: {
        enabled: true,
        strategy: 'dynamic-import'
      }
    };
  }

  /**
   * Реалізація code splitting
   * @param {Object} system - Система
   * @returns {Object} Code splitting конфігурація
   */
  implementCodeSplitting(system) {
    return {
      chunks: {
        vendor: ['react', 'lodash'],
        common: ['utils', 'helpers'],
        routes: 'dynamic'
      },
      strategy: 'route-based',
      prefetch: true
    };
  }

  /**
   * Реалізація кешування
   * @param {Object} system - Система
   * @returns {Object} Кешування конфігурація
   */
  implementCaching(system) {
    return {
      browser: {
        'max-age': 31536000, // 1 рік для статичних файлів
        'stale-while-revalidate': 86400
      },
      cdn: {
        enabled: true,
        purgeOnDeploy: true
      },
      serviceWorker: {
        enabled: true,
        strategies: {
          images: 'cache-first',
          api: 'network-first',
          static: 'cache-first'
        }
      }
    };
  }

  /**
   * Реалізація компресії
   * @param {Object} system - Система
   * @returns {Object} Компресія конфігурація
   */
  implementCompression(system) {
    return {
      gzip: {
        enabled: true,
        level: 6
      },
      brotli: {
        enabled: true,
        quality: 11
      },
      minification: {
        html: true,
        css: true,
        js: true
      }
    };
  }

  // === Допоміжні методи ===

  /**
   * Розрахунок розміру
   */
  calculateSize(obj) {
    const json = JSON.stringify(obj);
    return new Blob([json]).size;
  }

  /**
   * Генерація ключа кешу
   */
  generateCacheKey(content) {
    // Простий хеш для кешування
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  /**
   * Парсинг CSS правил
   */
  parseCSSRules(css) {
    const rules = [];
    const regex = /([^{]+)\{([^}]+)\}/g;
    let match;
    
    while ((match = regex.exec(css)) !== null) {
      rules.push({
        selector: match[1].trim(),
        properties: match[2].trim()
      });
    }
    
    return rules;
  }

  /**
   * Генерація srcset для зображення
   */
  generateSrcset(image) {
    const widths = [320, 640, 768, 1024, 1280, 1920];
    const srcset = [];
    
    widths.forEach(width => {
      if (width <= image.width) {
        srcset.push(`${image.url}?w=${width} ${width}w`);
      }
    });
    
    return srcset.join(', ');
  }

  /**
   * Визначення unicode range для шрифту
   */
  detectUnicodeRange(font) {
    // Базові діапазони для різних мов
    const ranges = {
      latin: 'U+0000-00FF',
      'latin-ext': 'U+0100-024F',
      cyrillic: 'U+0400-04FF',
      'cyrillic-ext': 'U+0500-052F',
      greek: 'U+0370-03FF'
    };
    
    // Визначення на основі назви або вмісту
    if (font.languages) {
      return font.languages.map(lang => ranges[lang] || ranges.latin).join(', ');
    }
    
    return ranges.latin;
  }

  /**
   * Отримання статистики оптимізації
   */
  getStatistics() {
    return {
      ...this.statistics,
      cacheSize: this.cache.size,
      compressionRatio: this.statistics.optimizationRatio.toFixed(2) + '%'
    };
  }

  /**
   * Очищення кешу
   */
  clearCache() {
    this.cache.clear();
  }
}

// Експорт модуля
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OptimizationUtils;
}