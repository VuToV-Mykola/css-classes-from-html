/**
 * Оптимізований Figma API клієнт
 * Підтримує всі необхідні функції для роботи з макетами
 * @version 3.0.0
 */

const https = require('https');
const { URL } = require('url');

class FigmaAPIClient {
  constructor(apiToken, options = {}) {
    this.apiToken = apiToken;
    this.baseURL = 'https://api.figma.com/v1';
    this.cache = new Map();
    this.rateLimit = {
      requests: 0,
      resetTime: Date.now() + 60000, // 1 хвилина
      maxRequests: 100
    };
    this.timeout = options.timeout || 15000;
    this.retryAttempts = options.retryAttempts || 3;
  }

  /**
   * Завантаження повного файлу з кешуванням та retry логікою
   */
  async fetchFile(fileKey, options = {}) {
    const cacheKey = `file_${fileKey}`;
    const useCache = options.useCache !== false;
    
    if (useCache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    if (!this.apiToken) {
      throw new Error('401 No Figma token provided');
    }

    await this.checkRateLimit();

    const url = `${this.baseURL}/files/${fileKey}`;
    const headers = {
      'X-Figma-Token': this.apiToken,
      'Content-Type': 'application/json',
      'User-Agent': 'CSS-Classes-From-HTML/3.0.0'
    };

    try {
      const data = await this.makeRequest(url, 'GET', null, headers);
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      if (error.statusCode === 429) {
        await this.handleRateLimit();
        return this.fetchFile(fileKey, options);
      }
      throw error;
    }
  }

  /**
   * Отримання структури файлу з детальною інформацією
   */
  async getFileStructure(fileKey) {
    const data = await this.fetchFile(fileKey);
    return {
      ...data,
      structure: this.analyzeFileStructure(data)
    };
  }

  /**
   * Аналіз структури файлу для кращого розуміння
   */
  analyzeFileStructure(data) {
    const structure = {
      pages: [],
      totalElements: 0,
      elementTypes: new Map(),
      depth: 0
    };

    if (data.document && data.document.children) {
      data.document.children.forEach(page => {
        const pageInfo = this.analyzePage(page);
        structure.pages.push(pageInfo);
        structure.totalElements += pageInfo.elementCount;
        structure.depth = Math.max(structure.depth, pageInfo.maxDepth);
      });
    }

    return structure;
  }

  /**
   * Аналіз сторінки (Canvas)
   */
  analyzePage(page) {
    const pageInfo = {
      id: page.id,
      name: page.name || 'Untitled',
      elementCount: 0,
      maxDepth: 0,
      elementTypes: new Map(),
      children: []
    };

    if (page.children) {
      page.children.forEach(child => {
        const childInfo = this.analyzeElement(child, 0);
        pageInfo.children.push(childInfo);
        pageInfo.elementCount += childInfo.totalElements;
        pageInfo.maxDepth = Math.max(pageInfo.maxDepth, childInfo.depth);
      });
    }

    return pageInfo;
  }

  /**
   * Рекурсивний аналіз елемента
   */
  analyzeElement(element, depth) {
    const elementInfo = {
      id: element.id,
      name: element.name || 'Unnamed',
      type: element.type,
      depth,
      totalElements: 1,
      children: [],
      styles: this.extractElementStyles(element),
      content: this.extractElementContent(element),
      semanticRole: this.determineSemanticRole(element)
    };

    if (element.children) {
      element.children.forEach(child => {
        const childInfo = this.analyzeElement(child, depth + 1);
        elementInfo.children.push(childInfo);
        elementInfo.totalElements += childInfo.totalElements;
      });
    }

    return elementInfo;
  }

  /**
   * Витягування стилів елемента
   */
  extractElementStyles(element) {
    const styles = {};

    // Позиціонування
    if (element.absoluteBoundingBox) {
      styles.position = {
        x: element.absoluteBoundingBox.x,
        y: element.absoluteBoundingBox.y,
        width: element.absoluteBoundingBox.width,
        height: element.absoluteBoundingBox.height
      };
    }

    // Кольори
    if (element.fills) {
      styles.colors = this.extractColors(element.fills);
    }

    // Текст
    if (element.style) {
      styles.typography = this.extractTypography(element.style);
    }

    // Ефекти
    if (element.effects) {
      styles.effects = this.extractEffects(element.effects);
    }

    return styles;
  }

  /**
   * Витягування кольорів
   */
  extractColors(fills) {
    const colors = [];
    fills.forEach(fill => {
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
    return colors;
  }

  /**
   * Витягування типографіки
   */
  extractTypography(style) {
    return {
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      fontStyle: style.fontStyle,
      lineHeight: style.lineHeight,
      letterSpacing: style.letterSpacing,
      textAlign: style.textAlign,
      textDecoration: style.textDecoration,
      textTransform: style.textTransform
    };
  }

  /**
   * Витягування ефектів
   */
  extractEffects(effects) {
    const extractedEffects = [];
    effects.forEach(effect => {
      if (effect.type === 'DROP_SHADOW') {
        extractedEffects.push({
          type: 'box-shadow',
          x: effect.offset.x,
          y: effect.offset.y,
          blur: effect.radius,
          spread: effect.spread || 0,
          color: this.rgbToHex(effect.color),
          opacity: effect.color.a
        });
      } else if (effect.type === 'INNER_SHADOW') {
        extractedEffects.push({
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
    return extractedEffects;
  }

  /**
   * Витягування контенту елемента
   */
  extractElementContent(element) {
    if (element.type === 'TEXT' && element.characters) {
      return element.characters;
    }
    return null;
  }

  /**
   * Визначення семантичної ролі
   */
  determineSemanticRole(element) {
    const name = element.name.toLowerCase();
    const type = element.type;

    if (type === 'TEXT') {
      if (name.includes('title') || name.includes('heading')) return 'heading';
      if (name.includes('button') || name.includes('btn')) return 'interactive';
      return 'text';
    }

    if (type === 'FRAME') {
      if (name.includes('header')) return 'header';
      if (name.includes('footer')) return 'footer';
      if (name.includes('nav') || name.includes('menu')) return 'navigation';
      if (name.includes('card')) return 'content-card';
      if (name.includes('container') || name.includes('wrapper')) return 'container';
      return 'section';
    }

    if (type === 'RECTANGLE') {
      if (name.includes('button') || name.includes('btn')) return 'interactive';
      return 'generic';
    }

    return 'generic';
  }

  /**
   * Отримання Canvas (сторінок)
   */
  async getCanvases(fileKey) {
    const data = await this.fetchFile(fileKey);
    const pages = (data.document && data.document.children) || [];
    
    return pages.map(page => ({
      id: page.id,
      name: page.name || 'Untitled',
      childrenCount: Array.isArray(page.children) ? page.children.length : 0,
      elementTypes: this.getElementTypes(page),
      hasText: this.hasTextContent(page),
      hasImages: this.hasImages(page)
    }));
  }

  /**
   * Отримання Layers для конкретного Canvas
   */
  async getLayers(fileKey, canvasId) {
    const data = await this.fetchFile(fileKey);
    const canvas = this.findCanvasById(data, canvasId);
    
    if (!canvas) {
      throw new Error(`Canvas with id ${canvasId} not found`);
    }

    return this.extractLayersFromCanvas(canvas);
  }

  /**
   * Пошук Canvas за ID
   */
  findCanvasById(data, canvasId) {
    if (!data.document || !data.document.children) return null;
    
    return data.document.children.find(page => page.id === canvasId);
  }

  /**
   * Витягування Layers з Canvas
   */
  extractLayersFromCanvas(canvas) {
    const layers = [];
    
    if (canvas.children) {
      this.traverseLayers(canvas.children, layers, 0);
    }
    
    return layers;
  }

  /**
   * Рекурсивний обхід Layers
   */
  traverseLayers(nodes, layers, depth) {
    nodes.forEach(node => {
      if (node.visible !== false) {
        layers.push({
          id: node.id,
          name: node.name || 'Unnamed',
          type: node.type,
          depth,
          hasChildren: node.children && node.children.length > 0,
          styles: this.extractElementStyles(node),
          content: this.extractElementContent(node),
          semanticRole: this.determineSemanticRole(node)
        });
      }

      if (node.children && node.children.length > 0) {
        this.traverseLayers(node.children, layers, depth + 1);
      }
    });
  }

  /**
   * Отримання стилів конкретного Layer
   */
  async getLayerStyles(fileKey, layerId) {
    const url = `${this.baseURL}/files/${fileKey}/nodes?ids=${layerId}`;
    const headers = {
      'X-Figma-Token': this.apiToken,
      'Content-Type': 'application/json'
    };

    const response = await this.makeRequest(url, 'GET', null, headers);
    return response.nodes && response.nodes[layerId] 
      ? response.nodes[layerId].document 
      : null;
  }

  /**
   * HTTP запит з retry логікою
   */
  async makeRequest(url, method = 'GET', data = null, headers = {}) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await this.performRequest(url, method, data, headers);
      } catch (error) {
        lastError = error;
        
        if (attempt < this.retryAttempts) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          await this.sleep(delay);
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Виконання HTTP запиту
   */
  performRequest(url, method, data, headers) {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.pathname + parsedUrl.search,
        method,
        headers: {
          'User-Agent': 'CSS-Classes-From-HTML/3.0.0',
          ...headers
        },
        timeout: this.timeout
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsedData = responseData ? JSON.parse(responseData) : null;
            resolve({
              statusCode: res.statusCode,
              data: parsedData,
              headers: res.headers
            });
          } catch (parseError) {
            reject(new Error(`JSON parse error: ${parseError.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (data) {
        req.write(typeof data === 'string' ? data : JSON.stringify(data));
      }

      req.end();
    });
  }

  /**
   * Перевірка rate limit
   */
  async checkRateLimit() {
    const now = Date.now();
    
    if (now > this.rateLimit.resetTime) {
      this.rateLimit.requests = 0;
      this.rateLimit.resetTime = now + 60000;
    }
    
    if (this.rateLimit.requests >= this.rateLimit.maxRequests) {
      const waitTime = this.rateLimit.resetTime - now;
      await this.sleep(waitTime);
    }
    
    this.rateLimit.requests++;
  }

  /**
   * Обробка rate limit
   */
  async handleRateLimit() {
    await this.sleep(60000); // Wait 1 minute
    this.rateLimit.requests = 0;
    this.rateLimit.resetTime = Date.now() + 60000;
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
    // Implementation for gradient extraction
    return {
      type: 'linear',
      stops: fill.gradientStops || []
    };
  }

  getElementTypes(page) {
    const types = new Set();
    if (page.children) {
      this.collectElementTypes(page.children, types);
    }
    return Array.from(types);
  }

  collectElementTypes(nodes, types) {
    nodes.forEach(node => {
      types.add(node.type);
      if (node.children) {
        this.collectElementTypes(node.children, types);
      }
    });
  }

  hasTextContent(page) {
    if (!page.children) return false;
    return this.checkForTextContent(page.children);
  }

  checkForTextContent(nodes) {
    return nodes.some(node => {
      if (node.type === 'TEXT') return true;
      if (node.children) return this.checkForTextContent(node.children);
      return false;
    });
  }

  hasImages(page) {
    if (!page.children) return false;
    return this.checkForImages(page.children);
  }

  checkForImages(nodes) {
    return nodes.some(node => {
      if (node.type === 'RECTANGLE' && node.fills) {
        return node.fills.some(fill => fill.type === 'IMAGE');
      }
      if (node.children) return this.checkForImages(node.children);
      return false;
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Очищення кешу
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Отримання статистики кешу
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

module.exports = FigmaAPIClient;
