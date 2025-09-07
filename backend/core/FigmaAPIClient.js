/**
 * ✅ FIX: Enhanced Figma API Client з підтримкою мультивибору Canvas/Layers
 * Розширена інтеграція з Figma API для роботи з Canvas та Layers
 * @version 3.1.0 - ENHANCED
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
      resetTime: Date.now() + 60000,
      maxRequests: 100
    };
    this.timeout = options.timeout || 15000;
    this.retryAttempts = options.retryAttempts || 3;
  }

  /**
   * ✅ FIX: Завантаження файлу з розширеним кешуванням
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
      'User-Agent': 'CSS-Classes-From-HTML/3.1.0'
    };

    try {
      const response = await this.makeRequest(url, 'GET', null, headers);
      const data = response.data;
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
   * ✅ FIX: Отримання Canvas з розширеною інформацією
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
      hasImages: this.hasImages(page),
      complexity: this.calculateCanvasComplexity(page),
      metadata: {
        width: page.absoluteBoundingBox?.width || 0,
        height: page.absoluteBoundingBox?.height || 0,
        backgroundColor: this.extractBackX: Enhanced JavaScript з повною підтримкою мультивибору та ієрархії
        const vscode = acquireVsCodeApi();
        
        // ✅ FIX: Global state з розширеними можливостями
        let state = {
            mode: null,
            figmaLink: '',
            figmaToken: '',
            selectedCanvases: [], // Масив вибраних Canvas з порядком
            selectedLayers: [], // Масив вибраних Layers
            layerHierarchy: new Map(), // Ієрархія Layers
            layerStyles: new Map(), // Стилі для кожного Layer
            includeReset: true,
            includeComments: true,
            optimizeCSS: true,
            generateResponsive: true,
            sidebarVisible: false
        };

        // ✅ FIX: Initialization
        window.addEventListener('DOMContentLoaded', () => {
            initializeUI();
            loadLastSettings();
        });

        // ✅ FIX: Enhanced UI initialization
        function initializeUI() {
            // Mode selection
            document.querySelectorAll('.mode-card').forEach(card => {
                card.addEventListener('click', function() {
                    selectMode(this.dataset.mode);
                });
            });

            // Sidebar toggle
            document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);

            // Main action buttons
            document.getElementById('loadLastBtn').addEventListener('click', loadLastSettings);
            document.getElementById('saveBtn').addEventListener('click', saveSettings);
            document.getElementById('clearBtn').addEventListener('click', clearSettings);
            document.getElementById('generateBtn').addEventListener('click', generateCSS);

            // Figma controls
            document.getElementById('loadCanvasBtn').addEventListener('click', loadFigmaCanvases);
            document.getElementById('figmaLink').addEventListener('input', validateFigmaLink);
            document.getElementById('figmaToken').addEventListener('input', updateState);

            // Canvas controls
            document.getElementById('selectAllCanvasBtn').addEventListener('click', selectAllCanvas);
            document.getElementById('clearCanvasBtn').addEventListener('click', clearCanvasSelection);
            document.getElementById('orderCanvasBtn').addEventListener('click', reorderCanvas);

            // Layers controls
            document.getElementById('expandAllBtn').addEventListener('click', expandAllLayers);
            document.getElementById('collapseAllBtn').addEventListener('click', collapseAllLayers);
            document.getElementById('selectAllLayersBtn').addEventListener('click', selectAllLayers);
            document.getElementById('clearLayersBtn').addEventListener('click', clearLayersSelection);
            document.getElementById('selectChildrenBtn').addEventListener('click', selectChildrenLayers);
            document.getElementById('selectParentsBtn').addEventListener('click', selectParentsLayers);

            // Styles controls
            document.getElementById('copyStylesBtn').addEventListener('click', copyStylesToClipboard);
        }

        // ✅ FIX: Mode selection з enhanced логікою
        function selectMode(mode) {
            document.querySelectorAll('.mode-card').forEach(card => {
                card.classList.remove('selected');
            });
            document.querySelector(`[data-mode="${mode}"]`).classList.add('selected');
            
            state.mode = mode;
            
            // Show/hide sections based on mode
            const showFigma = mode !== 'minimal';
            document.getElementById('figmaSection').style.display = showFigma ? 'block' : 'none';
            
            document.getElementById('generateBtn').disabled = false;
            
            showStatus(`Режим "${getModeName(mode)}" вибрано`, 'success');
            updateState();
        }

        function getModeName(mode) {
            const names = {
                minimal: 'Мінімальний',
                maximum: 'Максимальний', 
                production: 'Production'
            };
            return names[mode] || mode;
        }

        // ✅ FIX: Sidebar управління
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const contentArea = document.getElementById('contentArea');
            const toggle = document.getElementById('sidebarToggle');
            
            state.sidebarVisible = !state.sidebarVisible;
            
            if (state.sidebarVisible) {
                sidebar.classList.add('visible');
                contentArea.classList.remove('sidebar-hidden');
                toggle.innerHTML = '<span>✖️</span>';
                toggle.title = 'Закрити Sidebar';
            } else {
                sidebar.classList.remove('visible');
                contentArea.classList.add('sidebar-hidden');
                toggle.innerHTML = '<span>🎨</span>';
                toggle.title = 'Відкрити Sidebar';
            }
        }

        // ✅ FI
