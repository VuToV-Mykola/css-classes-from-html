// FigmaAPIClient — клієнт реального Figma API без хардкоду
const https = require('https');
const axios = require('axios');

class FigmaAPIClient {
  constructor(config) {
    this.config = config || {};
    this.baseURL = 'https://api.figma.com/v1';
    this.http = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      httpsAgent: new https.Agent({ keepAlive: true })
    });
  }

  getAuthHeaders() {
    const token = this.config.figmaToken || process.env.FIGMA_TOKEN;
    if (!token) {
      throw new Error('Figma API token відсутній (config.figmaToken або ENV FIGMA_TOKEN)');
    }
    return { 'X-Figma-Token': token };
  }

  async getFile(fileKey) {
    const res = await this.http.get(`/files/${fileKey}`, { headers: this.getAuthHeaders() });
    return res.data;
  }

  async getNodes(fileKey, nodeIds = []) {
    if (!nodeIds || nodeIds.length === 0) return { nodes: {} };
    const idsParam = encodeURIComponent(nodeIds.join(','));
    const res = await this.http.get(`/files/${fileKey}/nodes?ids=${idsParam}`, {
      headers: this.getAuthHeaders()
    });
    return res.data;
  }

  async getImages(fileKey, ids = [], format = 'png', scale = 1) {
    if (!ids || ids.length === 0) return { images: {} };
    const params = new URLSearchParams();
    params.set('ids', ids.join(','));
    params.set('format', format);
    params.set('scale', String(scale));
    const res = await this.http.get(`/images/${fileKey}?${params.toString()}`, {
      headers: this.getAuthHeaders()
    });
    return res.data;
  }

  // ✅ FIX: Отримання всіх зображень з файлу
  async getAllImages(fileKey) {
    try {
      console.log('🖼️ Getting all images from Figma file:', fileKey);
      const file = await this.getFile(fileKey);
      const imageNodes = [];
      
      const walk = (node) => {
        if (!node) return;
        
        // Перевіряємо всі типи вузлів, які можуть містити зображення
        if (node.type === 'RECTANGLE' || node.type === 'ELLIPSE' || node.type === 'POLYGON' || 
            node.type === 'STAR' || node.type === 'VECTOR' || node.type === 'FRAME' || 
            node.type === 'GROUP' || node.type === 'COMPONENT' || node.type === 'INSTANCE') {
          
          // Перевіряємо fills на наявність зображень
          if (node.fills && Array.isArray(node.fills)) {
            const imageFills = node.fills.filter(fill => fill.type === 'IMAGE');
            if (imageFills.length > 0) {
              imageNodes.push({
                id: node.id,
                name: node.name || `Image_${node.id}`,
                type: node.type,
                fills: imageFills,
                imageRef: imageFills[0].imageRef || null,
                imageHash: imageFills[0].imageHash || null
              });
            }
          }
          
          // Перевіряємо background на зображення
          if (node.backgrounds && Array.isArray(node.backgrounds)) {
            const imageBackgrounds = node.backgrounds.filter(bg => bg.type === 'IMAGE');
            if (imageBackgrounds.length > 0) {
              imageNodes.push({
                id: node.id,
                name: node.name || `Background_${node.id}`,
                type: node.type,
                fills: imageBackgrounds,
                imageRef: imageBackgrounds[0].imageRef || null,
                imageHash: imageBackgrounds[0].imageHash || null
              });
            }
          }
        }
        
        // Рекурсивно обходимо дочірні вузли
        if (node.children && Array.isArray(node.children)) {
          node.children.forEach(walk);
        }
      };
      
      walk(file.document);
      console.log(`📸 Found ${imageNodes.length} image nodes`);
      
      // Якщо є зображення, отримуємо їх URL
      if (imageNodes.length > 0) {
        const imageIds = imageNodes.map(img => img.id);
        console.log('🔄 Getting image URLs for:', imageIds);
        
        const imagesResponse = await this.getImages(fileKey, imageIds);
        console.log('📸 Images response:', imagesResponse);
        
        return imageNodes.map(node => ({
          ...node,
          url: imagesResponse.images[node.id] || null
        }));
      }
      
      console.log('⚠️ No images found in the file');
      return [];
    } catch (error) {
      console.error('❌ Error getting all images:', error);
      return [];
    }
  }

  async fetchFileTree(fileKey) {
    const file = await this.getFile(fileKey);
    return file;
  }

  // ✅ NEW: Збір шрифтів з TEXT-вузлів у файлі
  async getFonts(fileKey) {
    const file = await this.getFile(fileKey);
    const root = file?.document;
    if (!root) return [];

    const familyToWeights = new Map();

    const addFont = (family, weight) => {
      if (!family) return;
      const w = Number(weight) || 400;
      if (!familyToWeights.has(family)) familyToWeights.set(family, new Set());
      familyToWeights.get(family).add(w);
    };

    const walk = (node) => {
      if (!node) return;
      if (node.type === 'TEXT') {
        const s = node.style || {};
        if (s.fontFamily) addFont(s.fontFamily, s.fontWeight || s.fontPostScriptName?.match(/\d+/)?.[0] || 400);

        // Перевірка overrides (деякі символи можуть мати інші стилі)
        if (node.styleOverrideTable) {
          Object.values(node.styleOverrideTable).forEach(os => {
            if (os.fontFamily) addFont(os.fontFamily, os.fontWeight || 400);
          });
        }
      }
      (node.children || []).forEach(walk);
    };

    walk(root);

    return Array.from(familyToWeights.entries()).map(([family, set]) => ({
      family,
      weights: Array.from(set).sort((a,b)=>a-b)
    }));
  }

  normalizeNode(rawNode, parentPath = []) {
    const path = [...parentPath, rawNode.name || rawNode.id];
    const abs = rawNode.absoluteBoundingBox || {};
    return {
      id: rawNode.id,
      name: rawNode.name || 'Unnamed',
      type: rawNode.type,
      path: path.join('/'),
      depth: parentPath.length,
      children: (rawNode.children || []).map(c => c.id),
      absoluteBoundingBox: rawNode.absoluteBoundingBox || null,
      layoutMode: rawNode.layoutMode,
      primaryAxisAlignItems: rawNode.primaryAxisAlignItems,
      counterAxisAlignItems: rawNode.counterAxisAlignItems,
      itemSpacing: rawNode.itemSpacing,
      paddingTop: rawNode.paddingTop,
      paddingRight: rawNode.paddingRight,
      paddingBottom: rawNode.paddingBottom,
      paddingLeft: rawNode.paddingLeft,
      fills: rawNode.fills,
      strokes: rawNode.strokes,
      strokeWeight: rawNode.strokeWeight,
      cornerRadius: rawNode.cornerRadius,
      effects: rawNode.effects,
      opacity: rawNode.opacity,
      style: rawNode.style || null,
      characters: rawNode.characters || null,
      position: {
        x: abs.x || 0,
        y: abs.y || 0,
        width: abs.width || 0,
        height: abs.height || 0
      }
    };
  }
}

module.exports = FigmaAPIClient;
