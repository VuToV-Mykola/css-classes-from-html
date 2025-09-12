// HTMLParser — побудова ієрархії DOM для матчінгу з Figma
const { JSDOM } = require('jsdom');

class HTMLParser {
  constructor() {}

  // Повертає структуру { hierarchy: Map, contentMap: Map }
  parseToHierarchy(htmlContent) {
    if (!htmlContent || typeof htmlContent !== 'string') {
      return { hierarchy: new Map(), contentMap: new Map() };
    }

    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;
    const root = document.documentElement;

    const hierarchy = new Map();
    const contentMap = new Map(); // normalizedText -> node (останній)
    let autoId = 0;

    const normalizeText = (text) => {
      return (text || '')
        .toLowerCase()
        .replace(/[\n\r\t]+/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/[^\p{L}\p{N}\s]/gu, '')
        .trim();
    };

    const getNodeId = (el) => {
      if (el.id) return `#${el.id}`;
      return `auto-${autoId++}`;
    };

    const walk = (el, parentId = null, parentPath = [], level = 0) => {
      if (!el || !el.tagName) return null;
      const id = getNodeId(el);
      const classes = Array.from(el.classList || []);
      const textContent = normalizeText(el.textContent || '');
      const path = [...parentPath, classes[0] || (el.tagName || 'div').toLowerCase()].join('/');

      const node = {
        id,
        tagName: (el.tagName || 'div').toLowerCase(),
        classes,
        level,
        parent: parentId,
        children: [],
        textContent,
        semanticRole: this.determineSemanticRole(el, classes),
        path
      };

      hierarchy.set(id, node);
      if (textContent) contentMap.set(textContent, node);

      Array.from(el.children || []).forEach(child => {
        const childNode = walk(child, id, [...parentPath, classes[0] || (el.tagName || 'div').toLowerCase()], level + 1);
        if (childNode) node.children.push(childNode.id);
      });

      return node;
    };

    // Старт від <body>, якщо є
    const start = document.body || root;
    walk(start, null, [], 0);

    // Повертаємо сумісну структуру: contentMap і alias classMap для зворотної сумісності
    return { hierarchy, contentMap, classMap: contentMap };
  }

  determineSemanticRole(el, classes) {
    const tag = (el.tagName || '').toLowerCase();
    const cls = (classes || []).join(' ').toLowerCase();
    if (['h1','h2','h3','h4','h5','h6'].includes(tag)) return 'heading';
    if (tag === 'button') return 'button';
    if (tag === 'a') return 'link';
    if (tag === 'img') return 'image';
    if (tag === 'header') return 'header';
    if (tag === 'footer') return 'footer';
    if (tag === 'nav') return 'navigation';
    if (tag === 'main') return 'main';
    if (tag === 'section' || tag === 'article') return 'container';
    if (cls.includes('btn')) return 'button';
    if (cls.includes('nav') || cls.includes('menu')) return 'navigation';
    if (cls.includes('header')) return 'header';
    if (cls.includes('footer')) return 'footer';
    if (cls.includes('card') || cls.includes('item')) return 'card';
    if (cls.includes('title') || cls.includes('heading')) return 'heading';
    return tag === 'div' || tag === 'span' ? 'container' : 'generic';
  }
}

module.exports = HTMLParser;
