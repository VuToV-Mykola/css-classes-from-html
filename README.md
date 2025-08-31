# CSS Classes from HTML

🎨 **Потужне розширення VS Code для автоматичної генерації CSS з HTML класів та інтеграції з Figma макетами**

[![Version](https://img.shields.io/badge/version-0.1.9-blue.svg)](https://marketplace.visualstudio.com/items?itemName=vutov-mykola.css-classes-from-html)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE.md)

## ✨ Основні можливості

### 🚀 Універсальна генерація CSS
- **AUTO-GENERATED CSS FROM HTML = Figma токени** - повна відповідність макету
- Множинний вибір Canvas з Figma макетів
- Інтелектуальне зіставлення HTML класів з Figma компонентами

### 🎨 Універсальна інтеграція з Figma
- **Множинний вибір Canvas** - обробка декількох Canvas одночасно
- **Витягування токенів** - кольори, шрифти, відступи, ефекти
- **Інтелектуальне зіставлення** - HTML класи ↔ Figma компоненти
- **Універсальність** - працює з будь-яким Figma макетом

### ⚡ Швидка робота
- Збереження та повторення останньої дії без промптів
- Автозбереження налаштувань та контексту
- Швидкі клавіші та контекстне меню

## 🛠️ Встановлення

1. Відкрийте VS Code
2. Перейдіть до Extensions (Ctrl+Shift+X)
3. Шукайте "CSS Classes from HTML"
4. Натисніть Install

## 📖 Використання

### Базова генерація з HTML
1. Відкрийте HTML файл
2. Виділіть код або залиште курсор в документі
3. Натисніть `Ctrl+Shift+H` або використайте Command Palette
4. CSS буде згенеровано автоматично

### Інтеграція з Figma
1. Отримайте [Figma Personal Access Token](https://www.figma.com/settings)
2. Додайте токен в налаштування розширення
3. При генерації вставте посилання на Figma макет
4. Виберіть потрібний Canvas
5. Отримайте два файли:
   - `styles.css` - оптимізовані CSS класи для HTML
   - `{назва_макету}.css` - повний каскадний аналіз Figma

## ⚙️ Налаштування

### Основні налаштування
- `figmaToken` - Figma Personal Access Token
- `autoSave` - Автоматичне збереження CSS файлів
- `relativePaths` - Збереження відносно HTML файлу
- `includeGlobal` - Включення глобальних стилів
- `includeReset` - Включення CSS reset

### Figma інтеграція
- `saveFigmaStyles` - Збереження каскадних Figma стилів
- `rememberCanvas` - Запам'ятовування вибраного Canvas
- `autoSelectCanvas` - Автовибір останнього Canvas
- `matchThreshold` - Поріг схожості для зіставлення класів

### Швидка робота
- `quickGenerate` - Швидка генерація без діалогів
- `repeatLastAction` - Повторення останньої дії
- `rememberSettings` - Запам'ятовування налаштувань

## 🎯 Приклади використання

### HTML → CSS
```html
<div class="hero-section">
  <h1 class="hero-title">Заголовок</h1>
  <button class="hero-btn">Кнопка</button>
</div>
```

Згенерований CSS:
```css
/* AUTO-GENERATED CSS FROM HTML */

.hero-section {
  background-color: #2e2f42;
  color: #fff;
  text-align: center;
  padding: 120px 0;
}

.hero-title {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 72px;
}

.hero-btn {
  background-color: #4d5ae5;
  color: #fff;
  border-radius: 4px;
  padding: 16px 32px;
  border: none;
  cursor: pointer;
}
```

### Figma → CSS (каскадний файл)
```css
/* Повний аналіз стилів Figma макету */
/* Каскадне відображення без дублювання */

/* Header */
.header {
  width: 1440px;
  height: 72px;
  background-color: rgba(255, 255, 255, 1);
}

  /* Navigation */
  .navigation {
    display: flex;
    align-items: center;
    padding: 0 156px;
  }
```

## 🔧 Розробка

### Структура проекту
```
css-classes-from-html/
├── modules/
│   ├── cssGenerator.js          # Основна генерація CSS
│   ├── figmaCascadeGenerator.js # Каскадна генерація Figma
│   ├── figmaService.js          # Figma API інтеграція
│   ├── htmlParser.js            # Парсинг HTML
│   └── ...
├── extension.js                 # Головний файл розширення
└── package.json                # Конфігурація
```

### Команди
- `Ctrl+Shift+H` - Генерація CSS
- `Ctrl+Shift+R` - Повторення останньої дії
- Command Palette: "Generate CSS from HTML"
- Command Palette: "Repeat Last CSS Generation"

## 📝 Changelog

### v0.3.0 (2024-12-19)
- ✨ **Оптимізація CSS** - очищення від зайвих оголошень згідно Code Guide
- 🔄 **Наслідування стилів** - автоматичне видалення успадкованих властивостей
- 📏 **Shorthand оптимізація** - конвертація в короткі властивості
- 🧩 **Очищення коду** - видалення порожніх правил та дублікатів
- ⚙️ **Нові налаштування** - повний контроль оптимізації

### v0.2.0 (2024-12-19)
- 🔄 **Повторення дій** - збереження та повторення останніх дій
- 📚 **Історія дій** - збереження історії до 20 останніх дій
- ⌨️ **Нові команди** - `Ctrl+Shift+R` для повторення останньої дії
- 🎯 **Покращена конфігурація** - автоматичне збереження налаштувань

### v0.1.9 (2024-12-19)
- 🎯 **Універсальний механізм** - повна відповідність HTML ↔ Figma
- 📊 **Множинний вибір Canvas** - обробка декількох Canvas
- 🧠 **Інтелектуальне зіставлення** - автоматичний пошук відповідників
- ⚙️ **Конфігурація налаштувань** - збереження для наступної дії

### v0.1.6 (2024-12-19)
- 🔧 Виправлено помилку globalRules.getCSSReset
- ⚙️ Додано відсутні функції в globalRules
- 🚀 Повна готовність до публікації

### v0.1.5 (2024-12-19)
- ⚙️ Конфігурація налаштувань для наступної дії
- 🔄 Повторення останньої дії без промптів
- 💾 Автозбереження контексту та налаштувань

### v0.1.4 (2024-12-19)
- 📁 Окремий модуль для Figma каскадної генерації
- ⚡ Оптимізована HTML-based генерація з каскадністю
- 🚫 Усунення дублювання оголошень
- 🌳 Покращена система наслідування

## 🤝 Підтримка

- [GitHub Issues](https://github.com/VuToV-Mykola/css-classes-from-html/issues)
- [Документація](https://github.com/VuToV-Mykola/css-classes-from-html)

## 📄 Ліцензія

MIT License - дивіться [LICENSE.md](LICENSE.md)

---

**Створено з ❤️ для розробників**
<!-- AUTOGEN:STATS -->
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript) [![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML) [![Terminal](https://img.shields.io/badge/mac%20terminal-000000?style=for-the-badge&logo=apple&logoColor=white&labelColor=000000)](https://support.apple.com/guide/terminal/welcome/mac) [![VS Code](https://img.shields.io/badge/VS_Code-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white)](https://code.visualstudio.com/) [![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/) [![Figma](https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white)](https://www.figma.com/) 

[![📊 Views](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/VuToV-Mykola/css-classes-from-html/main/assets/db/visitors-badge.json)](https://github.com/VuToV-Mykola/css-classes-from-html/graphs/traffic)
[![⭐ Stars](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/VuToV-Mykola/css-classes-from-html/main/assets/db/likes-badge.json)](https://github.com/VuToV-Mykola/css-classes-from-html/actions/workflows/screenshot-and-visitor.yaml)
[![📦 Size](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/VuToV-Mykola/css-classes-from-html/main/assets/db/repo-size.json)](https://github.com/VuToV-Mykola/css-classes-from-html)
[![📄 License](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/VuToV-Mykola/css-classes-from-html/main/assets/db/repo-license.json)](https://github.com/VuToV-Mykola/css-classes-from-html/blob/main/LICENSE)
[![⬇️ Downloads](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/VuToV-Mykola/css-classes-from-html/main/assets/db/downloads-badge.json)](https://github.com/VuToV-Mykola/css-classes-from-html/releases)

## 📸 Скріншот проекту
![Project Screenshot](./assets/screenshot.png)
<!-- END:AUTOGEN -->
