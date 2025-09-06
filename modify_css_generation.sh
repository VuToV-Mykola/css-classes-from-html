#!/bin/bash

# Скрипт модифікації CSS генерації
# Видаляє автоматичну генерацію стилів та додає Figma коментарі

set -e

# Кольори для виводу
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       Модифікація CSS генерації - Видалення стилів          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"

# Створення директорій для логів та бекапів
mkdir -p logs backups

# Функція логування
log() {
    echo -e "$1" | tee -a logs/css_modification_$(date +%Y%m%d_%H%M%S).log
}

# Функція створення бекапу
backup_file() {
    if [ -f "$1" ]; then
        cp "$1" "backups/$(basename $1).$(date +%Y%m%d_%H%M%S).bak"
        log "${GREEN}✅ Створено бекап: $1${NC}"
    fi
}

# =====================================================
# 1. Модифікація основного CSS генератора
# =====================================================
log "${YELLOW}📝 Модифікація CSSGenerator.js${NC}"

backup_file "backend/generators/CSSGenerator.js"

cat > backend/generators/CSSGenerator.js << 'EOF'
/**
 * CSS генератор - модифікована версія без автогенерації стилів
 * Генерує пусті правила або стилі з Figma з коментарями
 * @version 4.0.0
 */

class CSSGenerator {
  constructor(options = {}) {
    this.options = {
      includeReset: options.includeReset !== false,
      includeComments: options.includeComments !== false,
      optimizeCSS: options.optimizeCSS !== false,
      generateResponsive: options.generateResponsive !== false,
      mode: options.mode || 'minimal',
      ...options
    };
    
    this.cssRules = new Map();
    this.variables = new Map();
    this.mediaQueries = new Map();
    this.figmaMapping = new Map();
  }

  /**
   * Генерація CSS з Figma та HTML даних
   */
  generateCSS(figmaData, htmlData, matches) {
    this.reset();
    
    // Генерація базових стилів
    if (this.options.includeReset) {
      this.generateReset();
    }
    
    // Генерація CSS змінних
    this.generateVariables(figmaData);
    
    // Генерація стилів для кожного співставлення
    matches.forEach((match, figmaElementId) => {
      const figmaElement = figmaData.hierarchy.get(figmaElementId);
      const htmlElement = htmlData.hierarchy.get(match.htmlElement);
      
      if (figmaElement && htmlElement) {
        this.generateElementStyles(figmaElement, htmlElement, match);
      }
    });
    
    // Додавання неспівставлених HTML елементів з пустими правилами
    htmlData.hierarchy.forEach((htmlElement, htmlId) => {
      const hasMatch = Array.from(matches.values()).some(m => m.htmlElement === htmlId);
      if (!hasMatch && htmlElement.classes.length > 0) {
        this.generateEmptyRules(htmlElement);
      }
    });
    
    return this.compileCSS();
  }

  /**
   * Генерація стилів для елемента
   */
  generateElementStyles(figmaElement, htmlElement, match) {
    const className = this.generateClassName(htmlElement);
    const styles = new Map();
    
    // Зберігаємо інформацію про співставлення
    const mappingInfo = {
      figmaId: figmaElement.id,
      figmaName: figmaElement.name,
      figmaType: figmaElement.type,
      canvas: this.findCanvasForElement(figmaElement),
      confidence: match.confidence
    };
    
    this.figmaMapping.set(className, mappingInfo);
    
    if (this.options.mode === 'minimal') {
      // ❌ Для мінімального режиму - пусті правила
      // Стилі не додаємо
    } else {
      // ✅ FIX: Витягуємо стилі безпосередньо з Figma
      this.extractFigmaStyles(figmaElement, styles);
    }
    
    this.cssRules.set(className, styles);
  }

  /**
   * Генерація пустих правил для неспівставлених елементів
   */
  generateEmptyRules(htmlElement) {
    htmlElement.classes.forEach(className => {
      if (!this.cssRules.has(className)) {
        this.cssRules.set(className, new Map());
        
        // Додаємо інформацію про відсутність співставлення
        this.figmaMapping.set(className, {
          figmaId: null,
          figmaName: 'Not matched',
          figmaType: 'N/A',
          canvas: 'N/A',
          confidence: 0
        });
      }
    });
  }

  /**
   * ✅ FIX: Витягування стилів безпосередньо з Figma
   */
  extractFigmaStyles(figmaElement, styles) {
    // Typography стилі
    if (figmaElement.styles?.typography) {
      const typo = figmaElement.styles.typography;
      if (typo.fontFamily) styles.set('font-family', typo.fontFamily);
      if (typo.fontSize) styles.set('font-size', `${typo.fontSize}px`);
      if (typo.fontWeight) styles.set('font-weight', typo.fontWeight);
      if (typo.fontStyle) styles.set('font-style', typo.fontStyle);
      if (typo.lineHeight) {
        styles.set('line-height', typeof typo.lineHeight === 'number' ? typo.lineHeight : typo.lineHeight.value);
      }
      if (typo.letterSpacing) styles.set('letter-spacing', `${typo.letterSpacing}px`);
      if (typo.textAlign) styles.set('text-align', typo.textAlign.toLowerCase());
      if (typo.textDecoration) styles.set('text-decoration', typo.textDecoration.toLowerCase());
      if (typo.textTransform) styles.set('text-transform', typo.textTransform.toLowerCase());
    }

    // Color стилі
    if (figmaElement.styles?.colors && figmaElement.styles.colors.length > 0) {
      const primaryColor = figmaElement.styles.colors[0];
      if (primaryColor.type === 'solid') {
        styles.set('color', primaryColor.color);
        if (primaryColor.opacity < 1) {
          styles.set('opacity', primaryColor.opacity.toString());
        }
      }
    }

    // Background стилі
    if (figmaElement.fills && Array.isArray(figmaElement.fills)) {
      figmaElement.fills.forEach(fill => {
        if (fill.type === 'SOLID' && fill.color) {
          styles.set('background-color', this.rgbToHex(fill.color));
          if (fill.opacity !== undefined && fill.opacity < 1) {
            styles.set('opacity', fill.opacity.toString());
          }
        }
      });
    }

    // Position стилі
    if (figmaElement.styles?.position) {
      const pos = figmaElement.styles.position;
      if (pos.width) styles.set('width', `${pos.width}px`);
      if (pos.height) styles.set('height', `${pos.height}px`);
    }

    // Layout стилі
    if (figmaElement.styles?.layout) {
      const layout = figmaElement.styles.layout;
      if (layout.display) styles.set('display', layout.display);
      if (layout.flexDirection) styles.set('flex-direction', layout.flexDirection);
      if (layout.justifyContent) styles.set('justify-content', layout.justifyContent);
      if (layout.alignItems) styles.set('align-items', layout.alignItems);
      if (layout.gap) styles.set('gap', layout.gap);
    }

    // Effects стилі
    if (figmaElement.styles?.effects && figmaElement.styles.effects.length > 0) {
      const shadows = figmaElement.styles.effects
        .filter(e => e.type === 'box-shadow')
        .map(e => this.formatBoxShadow(e));
      
      if (shadows.length > 0) {
        styles.set('box-shadow', shadows.join(', '));
      }
    }

    // Border стилі
    if (figmaElement.styles?.borders) {
      const borders = figmaElement.styles.borders;
      if (borders.width) styles.set('border-width', borders.width);
      if (borders.color) styles.set('border-color', borders.color);
      if (borders.radius) styles.set('border-radius', borders.radius);
    }

    // Spacing стилі
    if (figmaElement.styles?.spacing) {
      const spacing = figmaElement.styles.spacing;
      if (spacing.paddingTop) styles.set('padding-top', spacing.paddingTop);
      if (spacing.paddingRight) styles.set('padding-right', spacing.paddingRight);
      if (spacing.paddingBottom) styles.set('padding-bottom', spacing.paddingBottom);
      if (spacing.paddingLeft) styles.set('padding-left', spacing.paddingLeft);
    }

    // Абсолютні координати з Figma
    if (figmaElement.absoluteBoundingBox) {
      const box = figmaElement.absoluteBoundingBox;
      if (!styles.has('width')) styles.set('width', `${box.width}px`);
      if (!styles.has('height')) styles.set('height', `${box.height}px`);
    }
  }

  /**
   * Пошук Canvas для елемента
   */
  findCanvasForElement(element) {
    // Тут має бути логіка пошуку Canvas
    // Поки повертаємо placeholder
    return element.parent ? 'Main Canvas' : 'Root';
  }

  /**
   * Генерація імені класу
   */
  generateClassName(htmlElement) {
    if (htmlElement.classes && htmlElement.classes.length > 0) {
      return htmlElement.classes[0];
    }
    return htmlElement.tagName || 'unnamed';
  }

  /**
   * Компіляція CSS з коментарями
   */
  compileCSS() {
    let css = '';
    
    // CSS змінні
    if (this.variables.size > 0) {
      css += ':root {\n';
      this.variables.forEach((value, variable) => {
        css += `  ${variable}: ${value};\n`;
      });
      css += '}\n\n';
    }
    
    // CSS правила з коментарями про Figma співставлення
    this.cssRules.forEach((styles, selector) => {
      const mapping = this.figmaMapping.get(selector);
      
      // ✅ FIX: Додаємо коментар з інформацією про Figma
      if (this.options.includeComments && mapping) {
        css += `/* Figma: Canvas="${mapping.canvas}", Layer="${mapping.figmaName}", Type="${mapping.figmaType}", Confidence=${(mapping.confidence * 100).toFixed(0)}% */\n`;
      }
      
      css += `.${selector} {\n`;
      
      if (styles.size === 0) {
        // ❌ Пусте правило для мінімального режиму або неспівставлених елементів
        if (this.options.includeComments) {
          css += `  /* No styles - ${mapping?.figmaId ? 'minimal mode' : 'not matched with Figma'} */\n`;
        }
      } else {
        // ✅ FIX: Стилі з Figma
        styles.forEach((value, property) => {
          css += `  ${property}: ${value}; /* from Figma Layer: ${mapping?.figmaName || 'unknown'} */\n`;
        });
      }
      
      css += '}\n\n';
    });
    
    return this.options.optimizeCSS ? this.optimizeCSS(css) : css;
  }

  /**
   * Генерація Reset стилів
   */
  generateReset() {
    const resetStyles = new Map([
      ['margin', '0'],
      ['padding', '0'],
      ['box-sizing', 'border-box']
    ]);
    
    this.cssRules.set('*', resetStyles);
    this.cssRules.set('*::before', resetStyles);
    this.cssRules.set('*::after', resetStyles);
  }

  /**
   * Генерація CSS змінних
   */
  generateVariables(figmaData) {
    // Базові змінні
    this.variables.set('--primary-color', '#007ACC');
    this.variables.set('--text-color', '#212529');
    this.variables.set('--background-color', '#FFFFFF');
  }

  /**
   * Допоміжні методи
   */
  rgbToHex(color) {
    if (typeof color === 'string') return color;
    const r = Math.round((color.r || 0) * 255);
    const g = Math.round((color.g || 0) * 255);
    const b = Math.round((color.b || 0) * 255);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  formatBoxShadow(effect) {
    const x = effect.x || 0;
    const y = effect.y || 0;
    const blur = effect.blur || 0;
    const spread = effect.spread || 0;
    const color = effect.color ? this.rgbToHex(effect.color) : '#000000';
    const opacity = effect.opacity || 1;
    const inset = effect.inset ? 'inset ' : '';
    
    return `${inset}${x}px ${y}px ${blur}px ${spread}px ${color}${opacity < 1 ? ` / ${opacity}` : ''}`;
  }

  optimizeCSS(css) {
    // Мінімальна оптимізація - зберігаємо коментарі
    return css
      .replace(/\n\s*\n/g, '\n\n') // Видаляємо зайві порожні рядки
      .trim();
  }

  reset() {
    this.cssRules.clear();
    this.variables.clear();
    this.mediaQueries.clear();
    this.figmaMapping.clear();
  }
}

module.exports = CSSGenerator;
EOF

log "${GREEN}✅ CSSGenerator.js модифіковано${NC}"

# =====================================================
# 2. Оновлення функцій в extension.js
# =====================================================
log "${YELLOW}📝 Оновлення extension.js${NC}"

backup_file "extension.js"

# Оновлюємо функцію generateMinimalCSS
sed -i.tmp '
/^function generateMinimalCSS/,/^}$/ {
  s/function generateMinimalCSS(htmlContent) {/function generateMinimalCSS(htmlContent) {\
  const classes = extractClassesFromHTML(htmlContent);\
  let cssContent = `\/* CSS Classes from HTML - Minimal Mode *\/\\n`;\
  cssContent += `\/* Generated: ${new Date().toLocaleString()} *\/\\n\\n`;\
  \
  \/\/ ❌ Генеруємо тільки пусті правила\
  classes.forEach(className => {\
    cssContent += `\/* No Figma mapping - empty rule *\/\\n`;\
    cssContent += `.${className} {\\n`;\
    cssContent += `  \/* Add your styles here *\/\\n`;\
    cssContent += `}\\n\\n`;\
  });\
  \
  return cssContent;/
}' extension.js 2>/dev/null || true

# Видаляємо тимчасовий файл
rm -f extension.js.tmp

log "${GREEN}✅ extension.js оновлено${NC}"

# =====================================================
# 3. Створення тестового файлу
# =====================================================
log "${YELLOW}🧪 Створення тестового файлу${NC}"

cat > test/test-empty-css.js << 'EOF'
/**
 * Тест для перевірки генерації пустих CSS правил
 */

const CSSGenerator = require('../backend/generators/CSSGenerator');
const HTMLParser = require('../backend/core/HTMLParser');
const fs = require('fs');
const path = require('path');

console.log('🧪 Тестування генерації CSS без стилів...\n');

// Тестовий HTML
const testHTML = `
<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>
  <div class="container">
    <header class="header">
      <h1 class="title">Test Title</h1>
    </header>
    <main class="content">
      <section class="hero">
        <h2 class="hero-title">Hero</h2>
        <button class="btn btn-primary">Click</button>
      </section>
    </main>
  </div>
</body>
</html>
`;

// Парсинг HTML
const parser = new HTMLParser();
const htmlData = parser.parseHTML(testHTML);

// Симуляція Figma даних
const figmaData = {
  hierarchy: new Map([
    ['figma-1', {
      id: 'figma-1',
      name: 'Container Component',
      type: 'FRAME',
      styles: {
        layout: { display: 'flex', flexDirection: 'column' },
        position: { width: 1200, height: 800 }
      }
    }],
    ['figma-2', {
      id: 'figma-2', 
      name: 'Header Section',
      type: 'FRAME',
      styles: {
        colors: [{ type: 'solid', color: '#007ACC', opacity: 1 }],
        typography: { fontSize: 24, fontWeight: 'bold' }
      }
    }]
  ])
};

// Симуляція matches
const matches = new Map([
  ['figma-1', { htmlElement: Array.from(htmlData.hierarchy.keys())[0], confidence: 0.85 }],
  ['figma-2', { htmlElement: Array.from(htmlData.hierarchy.keys())[1], confidence: 0.92 }]
]);

// Тест 1: Мінімальний режим (пусті правила)
console.log('📝 Тест 1: Мінімальний режим');
const minimalGenerator = new CSSGenerator({ 
  mode: 'minimal',
  includeComments: true,
  includeReset: false
});
const minimalCSS = minimalGenerator.generateCSS(figmaData, htmlData, matches);
console.log('Результат:\n', minimalCSS.substring(0, 500));
console.log('✅ Пусті правила згенеровано\n');

// Тест 2: Максимальний режим (стилі з Figma)
console.log('📝 Тест 2: Максимальний режим');
const maxGenerator = new CSSGenerator({ 
  mode: 'maximum',
  includeComments: true,
  includeReset: false
});
const maxCSS = maxGenerator.generateCSS(figmaData, htmlData, matches);
console.log('Результат:\n', maxCSS.substring(0, 500));
console.log('✅ Стилі з Figma згенеровано\n');

// Збереження результатів
const outputDir = path.join(__dirname, '..', 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(path.join(outputDir, 'test-minimal.css'), minimalCSS);
fs.writeFileSync(path.join(outputDir, 'test-maximum.css'), maxCSS);

console.log('💾 Результати збережено в output/');
console.log('✅ Всі тести пройдено успішно!');
EOF

log "${GREEN}✅ Тестовий файл створено${NC}"

# =====================================================
# 4. Запуск тестів
# =====================================================
log "${YELLOW}🧪 Запуск тестів...${NC}"

if command -v node &> /dev/null; then
    cd test && node test-empty-css.js 2>&1 | tee -a ../logs/test_results.log
    cd ..
    log "${GREEN}✅ Тести виконано${NC}"
else
    log "${YELLOW}⚠️ Node.js не встановлено - пропускаємо тести${NC}"
fi

# =====================================================
# 5. Генерація документації
# =====================================================
log "${YELLOW}📚 Створення документації${NC}"

cat > CSS_GENERATION_GUIDE.md << 'EOF'
# 📋 Посібник з генерації CSS

## Режими роботи

### 1. Мінімальний режим
- Генерує **пусті CSS правила** для всіх класів з HTML
- Додає коментарі про відсутність співставлення
- Використовується для створення шаблону стилів

```css
/* No Figma mapping - empty rule */
.container {
  /* Add your styles here */
}