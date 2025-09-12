/**
 * ✅ Responsive Enhancer для максимальної адаптивності VSCode розширення
 * Забезпечує підтримку найменших вьюпортів та fluid дизайн
 * @version 1.0.0 - ULTRA RESPONSIVE
 */

class ResponsiveEnhancer {
  constructor(options = {}) {
    this.options = {
      ultraSmallViewports: options.ultraSmallViewports !== false,
      fluidTypography: options.fluidTypography !== false,
      touchOptimized: options.touchOptimized !== false,
      vscodeOptimized: options.vscodeOptimized !== false,
      ...options
    };

    this.breakpoints = {
      xs: 280,  // VSCode sidebar minimum
      sm: 320,  // Mobile portrait
      md: 480,  // Mobile landscape
      lg: 768,  // Tablet
      xl: 1024, // Desktop
      xxl: 1440 // Large desktop
    };

    this.fluidRanges = {
      fontSize: { min: 11, max: 16, unit: 'px' },
      spacing: { min: 0.25, max: 1, unit: 'rem' },
      padding: { min: 0.4, max: 1, unit: 'rem' },
      touchTarget: { min: 32, max: 44, unit: 'px' }
    };
  }

  /**
   * Генерує адаптивні CSS змінні з clamp()
   */
  generateFluidVariables() {
    const variables = [];
    
    // Fluid typography
    variables.push(`  /* Fluid Typography - Ultra Responsive */`);
    variables.push(`  --font-xs: clamp(0.6rem, 2.5vw, 0.75rem);`);
    variables.push(`  --font-sm: clamp(0.7rem, 3vw, 0.85rem);`);
    variables.push(`  --font-base: clamp(0.75rem, 3.5vw, 1rem);`);
    variables.push(`  --font-lg: clamp(0.9rem, 4vw, 1.2rem);`);
    variables.push(`  --font-xl: clamp(1rem, 4.5vw, 1.5rem);`);
    
    // Fluid spacing
    variables.push(`  /* Fluid Spacing */`);
    variables.push(`  --space-xs: clamp(0.25rem, 1vw, 0.5rem);`);
    variables.push(`  --space-sm: clamp(0.4rem, 2vw, 0.75rem);`);
    variables.push(`  --space-md: clamp(0.6rem, 3vw, 1rem);`);
    variables.push(`  --space-lg: clamp(0.8rem, 4vw, 1.5rem);`);
    variables.push(`  --space-xl: clamp(1rem, 5vw, 2rem);`);
    
    // Touch targets
    variables.push(`  /* Touch-Friendly Targets */`);
    variables.push(`  --touch-min: clamp(32px, 8vw, 44px);`);
    variables.push(`  --button-h: clamp(36px, 9vw, 48px);`);
    variables.push(`  --input-h: clamp(32px, 8vw, 40px);`);
    
    // VSCode specific
    variables.push(`  /* VSCode Webview Optimized */`);
    variables.push(`  --sidebar-padding: clamp(0.4rem, 3vw, 1rem);`);
    variables.push(`  --panel-gap: clamp(0.3rem, 2vw, 0.8rem);`);
    variables.push(`  --border-radius: clamp(3px, 1vw, 8px);`);
    
    return variables.join('\n');
  }

  /**
   * Генерує медіа-запити для різних вьюпортів
   */
  generateMediaQueries(cssRules) {
    const mediaQueries = [];
    
    // Ultra-small viewports (280px-320px) - VSCode sidebar
    mediaQueries.push(`/* Ultra-small viewports - VSCode sidebar */`);
    mediaQueries.push(`@media (max-width: ${this.breakpoints.sm}px) {`);
    mediaQueries.push(`  :root {`);
    mediaQueries.push(`    --font-base: 11px;`);
    mediaQueries.push(`    --space-base: 0.3rem;`);
    mediaQueries.push(`    --touch-min: 32px;`);
    mediaQueries.push(`  }`);
    mediaQueries.push(`  `);
    mediaQueries.push(`  .container { padding: var(--space-xs); }`);
    mediaQueries.push(`  .btn { min-height: var(--touch-min); font-size: var(--font-xs); }`);
    mediaQueries.push(`  .input { min-height: var(--touch-min); }`);
    mediaQueries.push(`  .header { padding: var(--space-xs); }`);
    mediaQueries.push(`}`);
    mediaQueries.push(``);
    
    // Small viewports (321px-480px)
    mediaQueries.push(`/* Small viewports - Mobile portrait */`);
    mediaQueries.push(`@media (min-width: ${this.breakpoints.sm + 1}px) and (max-width: ${this.breakpoints.md}px) {`);
    mediaQueries.push(`  .grid { grid-template-columns: 1fr; }`);
    mediaQueries.push(`  .sidebar { position: static; height: auto; }`);
    mediaQueries.push(`  .controls { flex-direction: column; }`);
    mediaQueries.push(`}`);
    mediaQueries.push(``);
    
    // Medium viewports (481px-768px)
    mediaQueries.push(`/* Medium viewports - Mobile landscape / Tablet */`);
    mediaQueries.push(`@media (min-width: ${this.breakpoints.md + 1}px) and (max-width: ${this.breakpoints.lg}px) {`);
    mediaQueries.push(`  .grid { grid-template-columns: 1fr 1fr; }`);
    mediaQueries.push(`  .sidebar { max-width: 50%; }`);
    mediaQueries.push(`}`);
    mediaQueries.push(``);
    
    return mediaQueries.join('\n');
  }

  /**
   * Оптимізує CSS властивості для малих екранів
   */
  optimizeForSmallScreens(property, value) {
    const optimizations = {
      'font-size': (val) => {
        const size = parseInt(val);
        if (size > 16) return 'var(--font-base)';
        if (size > 14) return 'var(--font-sm)';
        return 'var(--font-xs)';
      },
      
      'padding': (val) => {
        if (val.includes('px')) {
          const num = parseInt(val);
          if (num > 16) return 'var(--space-lg)';
          if (num > 8) return 'var(--space-md)';
          return 'var(--space-sm)';
        }
        return val;
      },
      
      'margin': (val) => {
        if (val.includes('px')) {
          const num = parseInt(val);
          if (num > 16) return 'var(--space-lg)';
          if (num > 8) return 'var(--space-md)';
          return 'var(--space-sm)';
        }
        return val;
      },
      
      'width': (val) => {
        if (val.includes('%') && parseInt(val) === 100) return '100%';
        if (val.includes('px')) {
          const num = parseInt(val);
          if (num > 300) return 'min(100%, ' + val + ')';
        }
        return val;
      },
      
      'height': (val) => {
        if (val.includes('px')) {
          const num = parseInt(val);
          if (num < 32) return 'var(--touch-min)';
        }
        return val;
      }
    };

    return optimizations[property] ? optimizations[property](value) : value;
  }

  /**
   * Генерує touch-friendly стилі
   */
  generateTouchStyles() {
    return `
/* Touch-Optimized Styles */
.btn, .input, .select, .checkbox, .radio {
  min-height: var(--touch-min);
  min-width: var(--touch-min);
}

.btn {
  padding: var(--space-sm) var(--space-md);
  font-size: var(--font-sm);
  border-radius: var(--border-radius);
  touch-action: manipulation;
}

.input, .select {
  padding: var(--space-sm);
  font-size: var(--font-base);
  border-radius: var(--border-radius);
}

/* Improved scrolling */
.scrollable {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

/* Better focus indicators for keyboard navigation */
.btn:focus, .input:focus, .select:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
`;
  }

  /**
   * Генерує VSCode webview оптимізації
   */
  generateVSCodeOptimizations() {
    return `
/* VSCode Webview Optimizations */
body {
  margin: 0;
  padding: var(--sidebar-padding);
  font-family: var(--vscode-font-family);
  font-size: var(--font-base);
  color: var(--vscode-foreground);
  background: var(--vscode-editor-background);
}

.container {
  max-width: 100%;
  overflow-x: hidden;
}

.header {
  position: sticky;
  top: 0;
  background: var(--vscode-editor-background);
  z-index: 100;
  border-bottom: 1px solid var(--vscode-panel-border);
  padding: var(--space-sm) 0;
}

.sidebar {
  background: var(--vscode-sideBar-background);
  border: 1px solid var(--vscode-panel-border);
  border-radius: var(--border-radius);
}

.footer {
  position: sticky;
  bottom: 0;
  background: var(--vscode-editor-background);
  border-top: 1px solid var(--vscode-panel-border);
  padding: var(--space-sm);
}

/* Responsive grid for VSCode panels */
.panel-grid {
  display: grid;
  gap: var(--panel-gap);
  grid-template-columns: 1fr;
}

@media (min-width: 480px) {
  .panel-grid {
    grid-template-columns: 1fr 300px;
  }
}

@media (max-width: 320px) {
  .panel-grid {
    grid-template-columns: 1fr;
    gap: var(--space-xs);
  }
}
`;
  }

  /**
   * Повна генерація адаптивного CSS
   */
  generateResponsiveCSS(baseCSS = '') {
    const parts = [];
    
    // CSS змінні
    parts.push(`:root {`);
    parts.push(this.generateFluidVariables());
    parts.push(`}`);
    parts.push(``);
    
    // Базовий CSS
    if (baseCSS) {
      parts.push(baseCSS);
      parts.push(``);
    }
    
    // Touch стилі
    if (this.options.touchOptimized) {
      parts.push(this.generateTouchStyles());
      parts.push(``);
    }
    
    // VSCode оптимізації
    if (this.options.vscodeOptimized) {
      parts.push(this.generateVSCodeOptimizations());
      parts.push(``);
    }
    
    // Медіа-запити
    parts.push(this.generateMediaQueries());
    
    return parts.join('\n');
  }
}

module.exports = ResponsiveEnhancer;
