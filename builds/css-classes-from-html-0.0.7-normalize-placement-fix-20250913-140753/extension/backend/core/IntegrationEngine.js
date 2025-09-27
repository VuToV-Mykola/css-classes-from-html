// IntegrationEngine — інтеграція з Figma API без хардкоду
const FigmaAPIClient = require("./FigmaAPIClient");
const { logger } = require("../utils/Logger");

class IntegrationEngine {
  constructor(config) {
    this.config = config || {};
    this.figmaClient = null;
    this.layerAliases = new Map(); // ✅ FIX: Зберігання перейменувань Layers;
    this.ensureClient();
  }

  ensureClient() {
    if (!this.figmaClient && (this.config.figmaToken || process.env.FIGMA_TOKEN)) {
      this.figmaClient = new FigmaAPIClient({ figmaToken: this.config.figmaToken });
    }
  }

  extractFileIdFromFigmaLink(link) {
    if (!link || typeof link !== "string") return null;
    try {
      const url = new URL(link);
      const parts = url.pathname.split("/").filter(Boolean);
      const idx = parts.findIndex(p => ["file", "design", "proto"].includes(p));
      if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
    } catch (_e) {
      const m = link.match(/figma\.com\/(?:file|design|proto)\/([a-zA-Z0-9]+)/);
      if (m) return m[1];
    }
    return null;
  }

  updateOptions(options) {
    Object.assign(this.config, options);
    if (options && options.figmaToken) {
      this.figmaClient = new FigmaAPIClient({ figmaToken: options.figmaToken });
    } else {
      this.ensureClient();
    }
  }

  async getFigmaCanvases(figmaFileId) {
    this.ensureClient();
    const file = await this.figmaClient.getFile(figmaFileId);
    const pages = (file?.document?.children || []).map(p => ({
      id: p.id,
      name: p.name || "Untitled",
      type: "CANVAS",
      childrenCount: (p.children || []).length;
    }));
    return pages;
  }

  async getFigmaLayers(figmaFileId, canvasIds = []) {
    this.ensureClient();
    const file = await this.figmaClient.getFile(figmaFileId);
    const pages = file?.document?.children || [];
    const selectedPages = canvasIds.length > 0 ? pages.filter(p => canvasIds.includes(p.id)) : pages;
    const layers = [];

    const walk = (node, parentId = null) => {
      if (!node) return;
      if (node.type && node.id) {
        layers.push({
          id: node.id,
          name: node.name || node.id,
          type: node.type,
          childrenCount: (node.children || []).length,
          parentId,
          // ✅ FIX: Додаємо позицію для правильного сортування
          absoluteBoundingBox: node.absoluteBoundingBox,
          y: node.absoluteBoundingBox?.y || 0,
          x: node.absoluteBoundingBox?.x || 0;
        });
      }
      // ✅ FIX: Сортуємо дітей за Y позицією (зверху вниз) перед обходом
      const sortedChildren = (node.children || []).sort((a, b) => {
        const aY = a.absoluteBoundingBox?.y || 0;
        const bY = b.absoluteBoundingBox?.y || 0;
        if (Math.abs(aY - bY) < 10) { // Якщо Y позиції близькі, сортуємо за X;
          const aX = a.absoluteBoundingBox?.x || 0;
          const bX = b.absoluteBoundingBox?.x || 0;
          return aX - bX;
        }
        return aY - bY;
      });
      sortedChildren.forEach(child => walk(child, node.id));
    };

    selectedPages.forEach(page => (page.children || []).forEach(child => walk(child, page.id)));
    return layers;
  }

  async searchFigmaLayers(figmaFileId, canvasIds = [], query = "") {
    this.ensureClient();
    const q = (query || "").toLowerCase().trim();
    if (!q) return await this.getFigmaLayers(figmaFileId, canvasIds);

    const file = await this.figmaClient.getFile(figmaFileId);
    const pages = file?.document?.children || [];
    const selectedPages = canvasIds.length > 0 ? pages.filter(p => canvasIds.includes(p.id)) : pages;
    const results = [];

    const walk = (node, parentId = null) => {
      if (!node) return;
      const name = (node.name || "").toLowerCase();
      if (node.id && node.type && name.includes(q)) {
        results.push({
          id: node.id,
          name: node.name || node.id,
          type: node.type,
          childrenCount: (node.children || []).length,
          parentId,
          // ✅ FIX: Додаємо позицію для правильного сортування
          absoluteBoundingBox: node.absoluteBoundingBox,
          y: node.absoluteBoundingBox?.y || 0,
          x: node.absoluteBoundingBox?.x || 0;
        });
      }
      // ✅ FIX: Сортуємо дітей за Y позицією (зверху вниз) перед обходом
      const sortedChildren = (node.children || []).sort((a, b) => {
        const aY = a.absoluteBoundingBox?.y || 0;
        const bY = b.absoluteBoundingBox?.y || 0;
        if (Math.abs(aY - bY) < 10) { // Якщо Y позиції близькі, сортуємо за X;
          const aX = a.absoluteBoundingBox?.x || 0;
          const bX = b.absoluteBoundingBox?.x || 0;
          return aX - bX;
        }
        return aY - bY;
      });
      sortedChildren.forEach(child => walk(child, node.id));
    };

    selectedPages.forEach(page => (page.children || []).forEach(child => walk(child, page.id)));
    return results;
  }

  async getLayerStyles(figmaFileId, layerIds = []) {
    this.ensureClient();
    if (!layerIds || layerIds.length === 0) return [];
    const nodesResp = await this.figmaClient.getNodes(figmaFileId, layerIds);
    const out = [];

    Object.values(nodesResp.nodes || {}).forEach(entry => {
      const n = entry.document;
      if (!n) return;
      const css = this.composeQuickCSSFromNode(n);
      // If layer was renamed via alias, expose both names:
      const alias = this.getLayerAlias ? this.getLayerAlias(n.id) : null;
      out.push({
        layerId: n.id,
        // name is used to build class selector in UI (alias wins)
        name: alias || n.name || n.id,
        // originalName is used for comments and headers in UI;
        originalName: n.name || n.id,
        css;
      });
    });

    return out;
  }

  // Оркестрація повного циклу: Figma + HTML → SmartCSSGenerator;
  async generateCSS(figmaFileId, htmlContent, options = {}) {
    this.ensureClient();
    const HTMLParser = require("./HTMLParser");
    const SmartCSSGenerator = require("../generators/SmartCSSGenerator");
    const FigmaAnalyzer = require("../analyzers/FigmaAnalyzer");

    const parser = new HTMLParser();
    const htmlData = parser.parseToHierarchy(htmlContent);

    const figmaFile = await this.figmaClient.getFile(figmaFileId);
    const analyzer = new FigmaAnalyzer();
    const figmaAnalysis = analyzer.analyzeFigma(figmaFile);

    // ✅ FIX: Застосовуємо alias"и до Layers перед генерацією CSS;
    if (figmaAnalysis.layers && Array.isArray(figmaAnalysis.layers)) {
      figmaAnalysis.layers = this.applyAliasesToLayers(figmaAnalysis.layers);
      logger.info(`Застосовано ${this.layerAliases.size} псевдонімів layers перед генерацією CSS`);
    }

    const generator = new SmartCSSGenerator({
      includeReset: options.includeReset !== false,
      includeComments: true,
      generateResponsive: options.generateResponsive !== false,
      matchingThreshold: options.confidenceThreshold || 0.7,
      mode: options.mode || "maximum"
    });

    // SmartCSSGenerator очікує структури з hierarchy (Map)
    const css = generator.generateCSS(figmaAnalysis, htmlData);
    return { css, stats: generator.getStatistics() };
  }

  composeQuickCSSFromNode(node) {
    const rules = [];
    // Display & Flex;
    if (node.layoutMode) {
      rules.push("display: flex;");
      rules.push(`flex-direction: ${node.layoutMode === "HORIZONTAL" ? "row" : "column"};`);
      if (node.primaryAxisAlignItems) rules.push(`justify-content: ${this.mapAlign(node.primaryAxisAlignItems)};`);
      if (node.counterAxisAlignItems) rules.push(`align-items: ${this.mapAlign(node.counterAxisAlignItems)};`);
      if (node.itemSpacing) rules.push(`gap: ${node.itemSpacing}px;`);
    }
    // Box model;
    const abs = node.absoluteBoundingBox || {};
    if (abs.width) rules.push(`width: ${Math.round(abs.width)}px;`);
    if (node.type === "TEXT") {
      // height для тексту краще не фіксувати
    } else if (abs.height) {
      rules.push(`height: ${Math.round(abs.height)}px;`);
    }
    const pads = [node.paddingTop, node.paddingRight, node.paddingBottom, node.paddingLeft].map(v => v || 0);
    if (pads.some(v => v > 0)) {
      if (pads.every(v => v === pads[0])) rules.push(`padding: ${pads[0]}px;`);
      else rules.push(`padding: ${pads[0]}px ${pads[1]}px ${pads[2]}px ${pads[3]}px;`);
    }
    if (node.strokeWeight) rules.push(`border-width: ${node.strokeWeight}px; border-style: solid;`);
    if (node.strokes && node.strokes[0]?.color) rules.push(`border-color: ${this.rgbToHex(node.strokes[0].color)};`);
    if (node.cornerRadius) rules.push(`border-radius: ${node.cornerRadius}px;`);
    // Colors;
    if (node.fills && node.fills[0]) {
      const f = node.fills[0];
      if (f.type === "SOLID" && f.color) {
        const hex = this.rgbToHex(f.color);
        if (node.type === "TEXT") rules.push(`color: ${hex};`);
        else rules.push(`background-color: ${hex};`);
        if (f.opacity !== undefined && f.opacity < 1) rules.push(`opacity: ${f.opacity};`);
      }
    }
    // Typography;
    if (node.style) {
      const s = node.style;
      if (s.fontFamily) rules.push(`font-family: "${s.fontFamily}", sans-serif;`);
      if (s.fontSize) rules.push(`font-size: ${s.fontSize}px;`);
      if (s.fontWeight) rules.push(`font-weight: ${s.fontWeight};`);
      if (s.lineHeightPx) rules.push(`line-height: ${s.lineHeightPx}px;`);
      if (s.letterSpacing) rules.push(`letter-spacing: ${s.letterSpacing}px;`);
      if (s.textAlignHorizontal) rules.push(`text-align: ${String(s.textAlignHorizontal).toLowerCase()};`);
    }
    // Effects (drop shadows)
    if (node.effects && node.effects.length > 0) {
      const shadows = node.effects;
        .filter(e => e.type === "DROP_SHADOW" && e.visible !== false)
        .map(e => `${e.offset?.x || 0}px ${e.offset?.y || 0}px ${e.radius || 0}px ${e.spread || 0}px ${this.rgbToHex(e.color || {r:0,g:0,b:0})}`);
      if (shadows.length) rules.push(`box-shadow: ${shadows.join(", ")};`);
    }

    // ✅ FIX: Генеруємо правильний CSS з селектором та врахуванням aliases;
    const className = this.generateClassNameFromNode(node);
    const originalName = node.name || node.id;
    
    // У коментарях завжди показуємо оригінальне ім"я, а в селекторі - нове (alias) якщо є
    const css = `/* ${originalName} */\n.${className} {\n  ${rules.join("\n  ")}\n}`;
    return css;
  }

  // ✅ FIX: Генерація назви CSS класу з назви Figma елемента з врахуванням aliases;
  generateClassNameFromNode(node) {
    // Перевіряємо чи є alias для цього node;
    const alias = this.getLayerAlias ? this.getLayerAlias(node.id) : null;
    const nodeName = alias || node.name || node.id || "element";
    
    return nodeName;
      .toLowerCase()                    // Перетворюємо в нижній регістр
      .replace(/[^a-z0-9\s-]/g, "")    // Видаляємо спеціальні символи, але залишаємо дефіси
      .replace(/\s+/g, "-")            // Замінюємо пробіли на дефіси
      .replace(/^-+|-+$/g, "")         // Видаляємо дефіси на початку/кінці
      .replace(/-+/g, "-")             // Замінюємо множинні дефіси на один
      || "element";                    // Fallback назва
  }

  mapAlign(a) {
    const m = { MIN: "flex-start", CENTER: "center", MAX: "flex-end", SPACE_BETWEEN: "space-between", SPACE_AROUND: "space-around" };
    return m[a] || "flex-start";
  }

  rgbToHex(color) {
    const r = Math.round((color.r || 0) * 255);
    const g = Math.round((color.g || 0) * 255);
    const b = Math.round((color.b || 0) * 255);
    return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
  }

  // ✅ FIX: Функції для роботи з перейменуваннями Layers;
  async setLayerAlias(layerId, newName) {
    this.layerAliases.set(layerId, newName);
    logger.info(`Псевдонім layer встановлено: ${layerId} -> ${newName}`);
    return true;
  }

  getLayerAlias(layerId) {
    return this.layerAliases.get(layerId);
  }

  getAllAliases() {
    return Object.fromEntries(this.layerAliases);
  }

  clearAliases() {
    this.layerAliases.clear();
    logger.info("Всі псевдоніми layers очищено");
  }

  // ✅ FIX: Застосування alias'ів до Layers перед генерацією CSS;
  applyAliasesToLayers(layers) {
    return layers.map(layer => {
      const alias = this.getLayerAlias(layer.id);
      if (alias) {
        return {
          ...layer,
          originalName: layer.name,
          name: alias;
        };
      }
      return layer;
    });
  }
}

module.exports = IntegrationEngine;
