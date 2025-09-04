/**
 * Розширений клієнт для роботи з Figma API
 * Підтримує всі необхідні операції для отримання структури та стилів
 */

class FigmaAPIClient {
  constructor(apiToken) {
    this.apiToken = apiToken;
    this.baseURL = "https://api.figma.com/v1";
    this.cache = new Map(); // Кешування для оптимізації
  }

  /**
   * Отримання повної структури файлу з детальною ієрархією
   */
  async getFileStructure(fileKey) {
    const cacheKey = `file_${fileKey}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const response = await fetch(`${this.baseURL}/files/${fileKey}`, {
      headers: {
        "X-Figma-Token": this.apiToken,
      },
    });
    console.log("response: ", response);
    const data = await response.json();

    // Розширений парсинг з детальною ієрархією
    const structuredData = this.parseFileStructure(data);
    this.cache.set(cacheKey, structuredData);

    return structuredData;
  }

  /**
   * Парсинг структури з створенням детальної ієрархічної мапи
   */
  parseFileStructure(fileData) {
    const hierarchy = new Map();
    const contentMap = new Map();

    const traverseNode = (node, parentPath = "") => {
      const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;

      // Детальний аналіз властивостей вузла
      const nodeData = {
        id: node.id,
        name: node.name,
        type: node.type,
        path: currentPath,
        parent: parentPath,
        children: [],
        content: this.extractContent(node),
        styles: this.extractStyles(node),
        layout: this.extractLayout(node),
        constraints: node.constraints || {},
        effects: node.effects || [],
        fills: node.fills || [],
        strokes: node.strokes || [],
      };

      hierarchy.set(node.id, nodeData);
      contentMap.set(this.normalizeContent(nodeData.content), nodeData);

      // Рекурсивний обхід дочірніх елементів
      if (node.children) {
        node.children.forEach((child) => {
          const childData = traverseNode(child, currentPath);
          nodeData.children.push(childData.id);
        });
      }

      return nodeData;
    };
    console.log(fileData);
    if (!fileData.document || !fileData.document.children) {
      throw new Error(
        "Figma API response is invalid: 'document' or 'children' is missing"
      );
    }
    // Обхід всіх сторінок
    fileData.document.children.forEach((page) => {
      traverseNode(page);
    });

    return {
      hierarchy,
      contentMap,
      metadata: {
        name: fileData.name,
        version: fileData.version,
        thumbnailUrl: fileData.thumbnailUrl,
      },
    };
  }

  /**
   * Витягування текстового контенту з вузла
   */
  extractContent(node) {
    if (node.type === "TEXT") {
      return node.characters || "";
    }

    if (node.name) {
      // Нормалізація назви для співставлення з HTML класами
      return node.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    }

    return "";
  }

  /**
   * Витягування стилів з вузла Figma
   */
  extractStyles(node) {
    const styles = {};

    // Typography стилі
    if (node.style) {
      const textStyle = node.style;
      styles.typography = {
        "font-family": textStyle.fontFamily || "",
        "font-size": textStyle.fontSize ? `${textStyle.fontSize}px` : "",
        "font-weight": textStyle.fontWeight || "",
        "font-style": textStyle.italic ? "italic" : "normal",
        "line-height": textStyle.lineHeightPx
          ? `${textStyle.lineHeightPx}px`
          : "",
        color: this.rgbaToHex(textStyle.fills?.[0]?.color) || "",
        "text-align": textStyle.textAlignHorizontal?.toLowerCase() || "",
        "text-decoration": textStyle.textDecoration?.toLowerCase() || "none",
        "text-transform": textStyle.textCase?.toLowerCase() || "none",
      };
    }

    // Visual & Effects стилі
    if (node.fills && node.fills.length > 0) {
      const fill = node.fills[0];
      if (fill.type === "SOLID") {
        styles.visual = {
          "background-color": this.rgbaToHex(fill.color, fill.opacity),
        };
      }
    }

    // Box Model стилі
    if (node.absoluteBoundingBox) {
      const bbox = node.absoluteBoundingBox;
      styles.boxModel = {
        width: `${bbox.width}px`,
        height: `${bbox.height}px`,
      };
    }

    // Border стилі
    if (node.strokes && node.strokes.length > 0) {
      const stroke = node.strokes[0];
      styles.border = {
        border: `${node.strokeWeight || 1}px solid ${this.rgbaToHex(
          stroke.color
        )}`,
        "border-radius": node.cornerRadius ? `${node.cornerRadius}px` : "0",
      };
    }

    // Effects (тіні, розмиття)
    if (node.effects && node.effects.length > 0) {
      styles.effects = {};
      node.effects.forEach((effect) => {
        if (effect.type === "DROP_SHADOW") {
          styles.effects["box-shadow"] = `${effect.offset.x}px ${
            effect.offset.y
          }px ${effect.radius}px ${this.rgbaToHex(effect.color)}`;
        }
      });
    }

    return styles;
  }

  /**
   * Витягування інформації про макет
   */
  extractLayout(node) {
    const layout = {};

    // Flexbox властивості для AUTO_LAYOUT
    if (node.layoutMode) {
      layout.display = "flex";
      layout["flex-direction"] =
        node.layoutMode === "HORIZONTAL" ? "row" : "column";

      if (node.itemSpacing) {
        layout.gap = `${node.itemSpacing}px`;
      }

      // Вирівнювання
      if (node.primaryAxisAlignItems) {
        layout["justify-content"] = this.mapFigmaAlignment(
          node.primaryAxisAlignItems
        );
      }

      if (node.counterAxisAlignItems) {
        layout["align-items"] = this.mapFigmaAlignment(
          node.counterAxisAlignItems
        );
      }
    }

    // Padding
    if (
      node.paddingLeft ||
      node.paddingRight ||
      node.paddingTop ||
      node.paddingBottom
    ) {
      const padding = [
        node.paddingTop || 0,
        node.paddingRight || 0,
        node.paddingBottom || 0,
        node.paddingLeft || 0,
      ];

      layout.padding = padding.every((p) => p === padding[0])
        ? `${padding[0]}px`
        : padding.map((p) => `${p}px`).join(" ");
    }

    return layout;
  }

  /**
   * Конвертація RGBA в HEX
   */
  rgbaToHex(color, opacity = 1) {
    if (!color) return "";

    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    const a = opacity !== undefined ? opacity : color.a || 1;

    if (a < 1) {
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  /**
   * Мапінг вирівнювання Figma в CSS
   */
  mapFigmaAlignment(alignment) {
    const mappings = {
      MIN: "flex-start",
      CENTER: "center",
      MAX: "flex-end",
      SPACE_BETWEEN: "space-between",
    };
    return mappings[alignment] || "flex-start";
  }

  /**
   * Нормалізація контенту для співставлення
   */
  normalizeContent(content) {
    return content.toLowerCase().replace(/\s+/g, " ").trim();
  }
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = FigmaAPIClient;
}
