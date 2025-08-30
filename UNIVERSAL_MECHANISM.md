# 🎯 Universal Figma to CSS Generator

## 📋 Огляд

Цей механізм забезпечує **AUTO-GENERATED CSS FROM HTML = токенам з вузлів Figma** для будь-якого макету.

## 🔧 Ключові компоненти

### 1. UniversalFigmaGenerator
- **Множинний вибір Canvas** - підтримка декількох Canvas одночасно
- **Витягування токенів** - кольори, типографіка, відступи, ефекти, компоненти
- **Генерація CSS** - відповідно до структури goit-markup-hw-04

### 2. CanvasSelector
- **Інтерфейс вибору** - VS Code QuickPick з множинним вибором
- **Фільтрація токенів** - по вибраних Canvas
- **Звітність** - детальна інформація про вибрані Canvas

### 3. FigmaTokenMatcher
- **Зіставлення класів** - автоматичне зіставлення HTML класів з Figma токенами
- **Генерація стилів** - створення CSS властивостей на основі назв класів
- **Інтелектуальний пошук** - пошук відповідних токенів за ключовими словами

## 🎨 Структура токенів

### CSS змінні з Figma токенів
```css
:root {
  /* Кольори з Figma */
  --primary-color: #4d5ae5;
  --secondary-color: #404bbf;
  --text-color: #2e2f42;
  
  /* Шрифти з Figma */
  --main-font-family: "Inter", sans-serif;
  --heading-font-size: 24px;
}
```

### Компоненти
- **Автоматичне розпізнавання** - header, hero, button, card, container
- **Інтелектуальне зіставлення** - пошук відповідних Figma компонентів
- **Базові паттерни** - стандартні стилі для типових елементів
- **Hover ефекти** - автоматичні інтерактивні стани

## 🚀 Використання

### 1. Вибір множинних Canvas
```javascript
const canvasSelector = new CanvasSelector(figmaService)
const selectedCanvases = await canvasSelector.selectMultipleCanvas(figmaLink, accessToken)
```

### 2. Витягування токенів
```javascript
const generator = new UniversalFigmaGenerator(figmaService)
const tokens = generator.extractTokensFromCanvases(selectedCanvases)
```

### 3. Зіставлення класів
```javascript
const matcher = new FigmaTokenMatcher()
const matches = matcher.matchHTMLClassesToFigmaTokens(htmlClasses, tokens)
```

### 4. Генерація CSS
```javascript
const css = generator.generateUniversalCSS(htmlClasses, tokens)
```

## 📊 Механізм зіставлення

### Пошук відповідників
- **Пряме співпадіння** - точне зіставлення назв
- **Схожість назв** - розрахунок схожості слів
- **Ключові слова** - пошук за паттернами (btn, title, card)

### Генерація стилів
- **Базові паттерни** - стандартні стилі для типових класів
- **Токени кольорів** - автоматичне призначення кольорів
- **Типографіка** - розміри та ваги шрифтів з Figma
- **Відступи та ефекти** - padding, margin, box-shadow

## 🎯 Універсальність

### Для будь-якого макету:
1. **Автоматичне розпізнавання** структури HTML
2. **Витягування токенів** з будь-яких Figma вузлів
3. **Інтелектуальне зіставлення** класів з токенами
4. **Адаптивна генерація** CSS властивостей

### Підтримувані елементи:
- ✅ Кольори (solid fills, backgrounds, strokes)
- ✅ Типографіка (font-family, size, weight, line-height)
- ✅ Відступи (padding, margin, gap)
- ✅ Ефекти (box-shadow, border-radius)
- ✅ Layout (flexbox, grid, positioning)

## 📁 Структура файлів

```
css-classes-from-html/
├── modules/
│   ├── universalFigmaGenerator.js    # Основний генератор
│   ├── canvasSelector.js             # Вибір Canvas
│   ├── figmaTokenMatcher.js          # Зіставлення токенів
│   └── ...
├── extension.js                      # Інтеграція з VS Code
└── UNIVERSAL_MECHANISM.md           # Ця документація
```

## 🔄 Алгоритм роботи

1. **Вибір Canvas** → Множинний вибір через VS Code UI
2. **Витягування токенів** → Обхід всіх вузлів у вибраних Canvas
3. **Зіставлення класів** → HTML класи ↔ Figma токени
4. **Генерація стилів** → Створення CSS властивостей
5. **Компіляція CSS** → Фінальний CSS файл
6. **Збереження файлів** → styles.css + figma.css

## 🎨 Приклад результату

### Вхідні дані:
- **HTML класи**: `header`, `logo`, `hero-title`, `hero-btn`
- **Figma Canvas**: "Desktop", "Mobile"
- **Токени**: кольори, шрифти, розміри з обох Canvas

### Вихідний CSS:
```css
:root {
  --primary-color: #4d5ae5;
  --main-font-family: "Inter", sans-serif;
  --button-padding: 16px 32px;
}

.header {
  width: 100%;
  border-bottom: 1px solid #e7e9fc;
}

.hero-btn {
  background-color: var(--primary-color);
  padding: var(--button-padding);
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

.hero-btn:hover,
.hero-btn:focus {
  opacity: 0.8;
  transition: all 250ms ease;
}
```

## 🔧 Налаштування

### VS Code Settings
```json
{
  "cssclasssfromhtml.figmaMultiCanvas": true,
  "cssclasssfromhtml.universalGeneration": true,
  "cssclasssfromhtml.matchThreshold": 0.3
}
```

### Команди
- `Ctrl+Shift+H` - Генерація CSS з HTML
- Вибір Canvas через QuickPick
- Автоматичне збереження universal CSS

## 📈 Переваги

1. **Універсальність** - працює з будь-яким Figma макетом
2. **Інтелектуальність** - автоматичне зіставлення класів
3. **Множинність** - підтримка декількох Canvas
4. **Автоматизація** - мінімум ручної роботи
5. **Якість** - чистий та оптимізований CSS

## 🎯 Результат

**AUTO-GENERATED CSS FROM HTML** ≡ **Figma токени**

Механізм забезпечує повну відповідність між HTML класами та Figma токенами, залишаючись універсальним для будь-якого проекту.