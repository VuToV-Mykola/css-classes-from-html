/**
 * ✅ Viewport Manager для оптимізації продуктивності та управління станом
 * Забезпечує ефективне відстеження змін вьюпорта та управління компонентами
 * @version 1.0.0 - PERFORMANCE OPTIMIZED
 */

class ViewportManager {
  constructor(options = {}) {
    this.options = {
      debounceDelay: options.debounceDelay || 150,
      throttleDelay: options.throttleDelay || 16, // ~60fps
      enablePerformanceMonitoring: options.enablePerformanceMonitoring !== false,
      ...options
    };

    this.currentViewport = null;
    this.previousViewport = null;
    this.observers = new Set();
    this.componentStates = new Map();
    this.performanceMetrics = {
      resizeEvents: 0,
      stateChanges: 0,
      lastUpdate: Date.now()
    };

    // Throttled and debounced handlers
    this.throttledResize = this.throttle(this.handleResize.bind(this), this.options.throttleDelay);
    this.debouncedResize = this.debounce(this.handleResizeEnd.bind(this), this.options.debounceDelay);

    this.init();
  }

  /**
   * Ініціалізація viewport manager
   */
  init() {
    if (typeof window === 'undefined') return;

    // Initial viewport detection
    this.detectViewport();

    // Event listeners
    window.addEventListener('resize', this.throttledResize);
    window.addEventListener('resize', this.debouncedResize);
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.detectViewport(), 100);
    });

    // Performance monitoring
    if (this.options.enablePerformanceMonitoring) {
      this.startPerformanceMonitoring();
    }
  }

  /**
   * Детекція поточного вьюпорта з оптимізацією
   */
  detectViewport() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const devicePixelRatio = window.devicePixelRatio || 1;

    const viewport = {
      width,
      height,
      devicePixelRatio,
      orientation: width > height ? 'landscape' : 'portrait',
      category: this.categorizeViewport(width),
      timestamp: Date.now()
    };

    // Only update if viewport actually changed
    if (!this.viewportsEqual(viewport, this.currentViewport)) {
      this.previousViewport = this.currentViewport;
      this.currentViewport = viewport;
      this.updateCSSVariables();
      this.notifyObservers();
      this.updateComponentStates();
      
      if (this.options.enablePerformanceMonitoring) {
        this.performanceMetrics.stateChanges++;
      }
    }
  }

  /**
   * Категоризація вьюпорта
   */
  categorizeViewport(width) {
    if (width <= 280) return 'xs';
    if (width <= 320) return 'sm';
    if (width <= 480) return 'md';
    if (width <= 768) return 'lg';
    if (width <= 1024) return 'xl';
    return 'xxl';
  }

  /**
   * Порівняння вьюпортів для оптимізації
   */
  viewportsEqual(a, b) {
    if (!a || !b) return false;
    return a.width === b.width && 
           a.height === b.height && 
           a.orientation === b.orientation;
  }

  /**
   * Оновлення CSS змінних
   */
  updateCSSVariables() {
    if (!this.currentViewport) return;

    const { width, height, category } = this.currentViewport;
    const root = document.documentElement;

    // Dynamic scaling based on viewport
    const scale = this.calculateDynamicScale(width);
    const fontScale = this.calculateFontScale(width);

    root.style.setProperty('--container-width', `${width}px`);
    root.style.setProperty('--available-height', `${height}px`);
    root.style.setProperty('--dynamic-scale', scale);
    root.style.setProperty('--runtime-font-scale', fontScale);
    root.style.setProperty('--viewport-category', `"${category}"`);

    // Component-specific variables
    if (width <= 320) {
      root.style.setProperty('--grid-columns', '1');
      root.style.setProperty('--sidebar-display', 'none');
      root.style.setProperty('--component-min-width', '260px');
    } else if (width <= 480) {
      root.style.setProperty('--grid-columns', '1');
      root.style.setProperty('--sidebar-display', 'block');
      root.style.setProperty('--component-min-width', '280px');
    } else {
      root.style.setProperty('--grid-columns', '1fr 300px');
      root.style.setProperty('--sidebar-display', 'block');
      root.style.setProperty('--component-min-width', '300px');
    }
  }

  /**
   * Розрахунок динамічного масштабування
   */
  calculateDynamicScale(width) {
    if (width < 280) return 0.8;
    if (width < 320) return 0.85;
    if (width < 400) return 0.9;
    if (width < 480) return 0.95;
    return 1;
  }

  /**
   * Розрахунок масштабування шрифту
   */
  calculateFontScale(width) {
    if (width < 280) return 0.85;
    if (width < 320) return 0.9;
    if (width < 400) return 0.95;
    return 1;
  }

  /**
   * Управління станом компонентів
   */
  updateComponentStates() {
    const { category, width } = this.currentViewport;

    // Update body classes
    document.body.classList.remove('viewport-xs', 'viewport-sm', 'viewport-md', 'viewport-lg', 'viewport-xl');
    document.body.classList.add(`viewport-${category}`);

    // Component-specific state management
    this.componentStates.set('navigation', {
      collapsed: width <= 320,
      simplified: width <= 480
    });

    this.componentStates.set('sidebar', {
      hidden: width <= 320,
      overlay: width <= 480,
      static: width > 480
    });

    this.componentStates.set('controls', {
      stacked: width <= 480,
      compact: width <= 768,
      full: width > 768
    });
  }

  /**
   * Реєстрація observer для змін вьюпорта
   */
  subscribe(callback) {
    this.observers.add(callback);
    
    // Immediately call with current state
    if (this.currentViewport) {
      callback(this.currentViewport, this.previousViewport);
    }

    // Return unsubscribe function
    return () => this.observers.delete(callback);
  }

  /**
   * Повідомлення всіх observers
   */
  notifyObservers() {
    this.observers.forEach(callback => {
      try {
        callback(this.currentViewport, this.previousViewport);
      } catch (error) {
        console.warn('ViewportManager observer error:', error);
      }
    });
  }

  /**
   * Отримання стану компонента
   */
  getComponentState(componentName) {
    return this.componentStates.get(componentName) || {};
  }

  /**
   * Throttle utility
   */
  throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;
    
    return (...args) => {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
      
      if (this.options.enablePerformanceMonitoring) {
        this.performanceMetrics.resizeEvents++;
      }
    };
  }

  /**
   * Debounce utility
   */
  debounce(func, delay) {
    let timeoutId;
    
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * Handle resize events (throttled)
   */
  handleResize() {
    this.detectViewport();
  }

  /**
   * Handle resize end (debounced)
   */
  handleResizeEnd() {
    // Final viewport detection after resize ends
    this.detectViewport();
    
    // Notify VSCode extension if available
    if (window.acquireVsCodeApi) {
      const vscode = window.acquireVsCodeApi();
      vscode.postMessage({
        command: 'viewportChanged',
        viewport: this.currentViewport,
        componentStates: Object.fromEntries(this.componentStates)
      });
    }
  }

  /**
   * Performance monitoring
   */
  startPerformanceMonitoring() {
    setInterval(() => {
      const now = Date.now();
      const timeDiff = now - this.performanceMetrics.lastUpdate;
      
      console.log('ViewportManager Performance:', {
        resizeEventsPerSecond: (this.performanceMetrics.resizeEvents / timeDiff * 1000).toFixed(2),
        stateChangesPerSecond: (this.performanceMetrics.stateChanges / timeDiff * 1000).toFixed(2),
        currentViewport: this.currentViewport?.category,
        activeObservers: this.observers.size
      });
      
      // Reset metrics
      this.performanceMetrics.resizeEvents = 0;
      this.performanceMetrics.stateChanges = 0;
      this.performanceMetrics.lastUpdate = now;
    }, 5000); // Log every 5 seconds
  }

  /**
   * Cleanup
   */
  destroy() {
    window.removeEventListener('resize', this.throttledResize);
    window.removeEventListener('resize', this.debouncedResize);
    this.observers.clear();
    this.componentStates.clear();
  }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ViewportManager;
} else if (typeof window !== 'undefined') {
  window.ViewportManager = ViewportManager;
}
