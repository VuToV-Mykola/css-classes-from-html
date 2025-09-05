/* core/FigmaAPIClient.js
   Динамічна робота з Figma API: fetchFile, getCanvases, getLayers
   Коментарі українською; модуль CommonJS
*/
const fetch = require('node-fetch');

class FigmaAPIClient {
  constructor(apiToken) {
    this.apiToken = apiToken;
    this.baseURL = 'https://api.figma.com/v1';
    this.cache = new Map();
  }

  // Завантаження повного файлу (як у Figma API)
  async fetchFile(fileKey) {
    const cacheKey = `file_${fileKey}`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

    if (!this.apiToken) throw new Error('401 No Figma token provided');

    const res = await fetch(`${this.baseURL}/files/${fileKey}`, {
      headers: { 'X-Figma-Token': this.apiToken }
    });

    if (!res.ok) {
      throw new Error(`Figma API error: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    // кешуємо сирі дані
    this.cache.set(cacheKey, data);
    return data;
  }

  // Сумісна назва (згідно з раніше вживаними методами)
  async getFileStructure(fileKey) {
    return this.fetchFile(fileKey);
  }

  // Повертає перелік canvases (сторінок) у файлі
  async getCanvases(fileKey) {
    const data = await this.fetchFile(fileKey);
    // document.children — pages
    const pages = (data.document && data.document.children) || [];
    // Для кожної сторінки повертаємо id, name, childrenCount
    return pages.map(p => ({
      id: p.id,
      name: p.name || 'Untitled',
      childrenCount: Array.isArray(p.children) ? p.children.length : 0
    }));
  }

  // Повернути layers для набору canvasIds (масив id)
  // Якщо canvasIds пустий — повертає порожній масив
  async getLayers(fileKey, canvasIds = []) {
    if (!Array.isArray(canvasIds) || canvasIds.length === 0) return [];
    const data = await this.fetchFile(fileKey);
    const pages = (data.document && data.document.children) || [];
    const layers = [];
    pages.forEach(page => {
      if (canvasIds.includes(page.id) && Array.isArray(page.children)) {
        page.children.forEach(ch => {
          layers.push({
            id: ch.id,
            name: ch.name || 'Unnamed layer',
            type: ch.type || '',
            canvasId: page.id,
            canvasName: page.name || ''
          });
        });
      }
    });
    return layers;
  }
}

module.exports = FigmaAPIClient;
