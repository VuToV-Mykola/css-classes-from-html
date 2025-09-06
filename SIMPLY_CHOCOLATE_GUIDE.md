# 🍫 Simply Chocolate Integration Guide

## Огляд

Цей посібник описує інтеграцію з Figma макетом Simply Chocolate та використання спеціалізованих модулів для генерації CSS.

## 🚀 Швидкий старт

### 1. Аналіз Figma макету

```javascript
const SimplyChocolateAnalyzer = require('./backend/analyzers/SimplyChocolateAnalyzer');

const analyzer = new SimplyChocolateAnalyzer();
const analysis = analyzer.analyzeSimplyChocolate(figmaData);

console.log('Секції:', analysis.chocolateSpecific.sections);
console.log('Компоненти:', analysis.chocolateSpecific.components);
console.log('Кольори:', analysis.chocolateSpecific.colors);
```

### 2. Генерація CSS

```javascript
const SimplyChocolateCSSGenerator = require('./backend/generators/SimplyChocolateCSSGenerator');

const generator = new SimplyChocolateCSSGenerator();
const css = generator.generateSimplyChocolateCSS(figmaData, htmlData, matches);

console.log('CSS згенеровано:', css.length, 'символів');
```

### 3. Валідація системи

```javascript
const ValidationSystem = require('./backend/utils/ValidationSystem');

const validator = new ValidationSystem();
const results = validator.validateSystem(figmaData, htmlData, matches, css);

console.log('Загальна оцінка:', results.overall.grade);
```

## 📋 Команди VSCode

### Генерація Simply Chocolate CSS
- **Команда**: `css-classes.generateSimplyChocolateCSS`
- **Опис**: Генерує CSS з Simply Chocolate темою
- **Використання**: Command Palette → "Generate Simply Chocolate CSS"

### Аналіз Simply Chocolate макету
- **Команда**: `css-classes.analyzeSimplyChocolate`
- **Опис**: Аналізує Figma макет Simply Chocolate
- **Використання**: Command Palette → "Analyze Simply Chocolate"

### Валідація системи
- **Команда**: `css-classes.validateSystem`
- **Опис**: Перевіряє якість співставлення та генерації
- **Використання**: Command Palette → "Validate System"

## 🎨 Тема Simply Chocolate

### Кольори
```css
:root {
  --chocolate-primary: #D2691E;      /* Chocolate brown */
  --chocolate-secondary: #8B4513;    /* Saddle brown */
  --chocolate-accent: #FFD700;       /* Gold */
  --chocolate-background: #FFF8DC;   /* Cornsilk */
  --chocolate-text: #2F1B14;         /* Dark brown */
  --chocolate-light: #F5F5DC;        /* Beige */
}
```

### Типографіка
```css
:root {
  --chocolate-primary-font: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  --chocolate-secondary-font: '"Playfair Display", serif';
  --chocolate-heading-font: '"Montserrat", sans-serif';
}
```

### Spacing Scale
```css
:root {
  --chocolate-spacing-xs: 4px;
  --chocolate-spacing-sm: 8px;
  --chocolate-spacing-md: 16px;
  --chocolate-spacing-lg: 24px;
  --chocolate-spacing-xl: 32px;
  --chocolate-spacing-xxl: 48px;
  --chocolate-spacing-xxxl: 64px;
}
```

### Breakpoints
```css
:root {
  --chocolate-mobile: 375px;
  --chocolate-tablet: 768px;
  --chocolate-desktop: 1200px;
  --chocolate-wide: 1440px;
}
```

## 🧩 Компоненти

### Product Card
```css
.product-card {
  background-color: var(--chocolate-white);
  border-radius: var(--chocolate-radius-lg);
  box-shadow: var(--chocolate-shadow-md);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--chocolate-shadow-lg);
}
```

### Button Variants
```css
.btn--primary {
  background-color: var(--chocolate-primary);
  color: var(--chocolate-white);
}

.btn--secondary {
  background-color: transparent;
  color: var(--chocolate-primary);
  border: 2px solid var(--chocolate-primary);
}

.btn--outline {
  background-color: transparent;
  color: var(--chocolate-text);
  border: 1px solid var(--chocolate-gray);
}
```

### Navigation
```css
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--chocolate-spacing-md) 0;
  background-color: var(--chocolate-white);
  box-shadow: var(--chocolate-shadow-sm);
}
```

## 📱 Адаптивність

### Mobile First
```css
/* Mobile styles (default) */
.container {
  padding: 0 var(--chocolate-spacing-sm);
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 0 var(--chocolate-spacing-md);
  }
}

/* Desktop */
@media (min-width: 1200px) {
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

### Responsive Grid
```css
.products__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--chocolate-spacing-lg);
}

@media (min-width: 768px) {
  .products__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1200px) {
  .products__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## 🔧 Налаштування

### Конфігурація генератора
```javascript
const generator = new SimplyChocolateCSSGenerator({
  includeReset: true,
  includeComments: true,
  optimizeCSS: false,
  generateResponsive: true,
  generateModernCSS: true,
  generateAnimations: true
});
```

### Налаштування валідації
```javascript
const validator = new ValidationSystem();
const results = validator.validateSystem(figmaData, htmlData, matches, css);

// Результати валідації
console.log('HTML:', results.html.score);
console.log('Figma:', results.figma.score);
console.log('CSS:', results.css.score);
console.log('Matching:', results.matching.score);
console.log('Responsive:', results.responsive.score);
```

## 📊 Статистика та звіти

### Звіт валідації
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "results": {
    "overall": {
      "score": 89.0,
      "grade": "A",
      "totalIssues": 2,
      "recommendations": [
        "Покращити алгоритми співставлення елементів"
      ]
    }
  }
}
```

### Статистика генерації
```javascript
const stats = {
  elementsCount: 116,
  classesCount: 62,
  matchedElements: 3,
  matchPercentage: 42.9,
  averageConfidence: 0.8,
  cssSize: '5.9 KB',
  cssRules: 24,
  cssVariables: 32,
  mediaQueries: 3
};
```

## 🚨 Обмеження та рекомендації

### Обмеження
- Потрібен валідний Figma API токен
- Макет повинен мати правильну структуру
- HTML повинен містити семантичні класи

### Рекомендації
1. Використовуйте семантичні імена класів
2. Додавайте атрибути `data-*` для кращого співставлення
3. Перевіряйте валідацію після генерації
4. Тестуйте на різних розмірах екранів

## 🔍 Налагодження

### Логи
```javascript
// Увімкнення детальних логів
outputChannel.appendLine("🔍 Детальний режим налагодження");

// Перевірка співставлень
matches.forEach((match, figmaId) => {
  console.log(`Figma: ${figmaId} → HTML: ${match.htmlElement}`);
  console.log(`Confidence: ${match.confidence}`);
});
```

### Тестування
```bash
# Запуск тесту Simply Chocolate
node test/simply-chocolate-test.js

# Запуск інтеграційного тесту
node test/integration-test.js
```

## 📚 Додаткові ресурси

- [Figma API Documentation](https://www.figma.com/plugin-docs/api/api-reference/)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
- [Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)

## 🤝 Підтримка

Якщо у вас виникли питання або проблеми:

1. Перевірте логи в Output Channel
2. Запустіть валідацію системи
3. Перегляньте звіт валідації
4. Створіть issue з детальним описом проблеми

---

**Версія**: 1.0.0  
**Останнє оновлення**: 2024-01-15  
**Автор**: CSS Classes from HTML Team
