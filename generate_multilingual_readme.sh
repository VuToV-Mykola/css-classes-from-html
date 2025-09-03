#!/bin/bash

# generate_multilingual_readme.sh
# Скрипт для генерації мультимовної документації
# Запуск: ./generate_multilingual_readme.sh

set -e

# Створюємо директорії
mkdir -p log
mkdir -p assets/db

# Функція для логування
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> log/generate_docs.log
}

log "Початок генерації мультимовної документації"

# Створюємо українську версію README.md
cat > README.md << 'EOF'
# CSS Classes from HTML
<!-- AUTOGEN:STATS -->


## 📊 Статистика GitHub :

[![📊 Views](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/VuToV-Mykola/css-classes-from-html/main/assets/db/visitors-badge.json)](https://github.com/VuToV-Mykola/css-classes-from-html/graphs/traffic)
[![⭐ Stars](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/VuToV-Mykola/css-classes-from-html/main/assets/db/likes-badge.json)](https://github.com/VuToV-Mykola/css-classes-from-html/actions/workflows/screenshot-and-visitor.yaml)
[![📦 Size](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/VuToV-Mykola/css-classes-from-html/main/assets/db/repo-size.json)](https://github.com/VuToV-Mykola/css-classes-from-html)
[![📄 License](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/VuToV-Mykola/css-classes-from-html/main/assets/db/repo-license.json)](https://github.com/VuToV-Mykola/css-classes-from-html/blob/main/LICENSE)
[![⬇️ Downloads](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/VuToV-Mykola/css-classes-from-html/main/assets/db/downloads-badge.json)](https://github.com/VuToV-Mykola/css-classes-from-html/releases)
<!-- 📸 Скріншот проекту закоментований -->
<!-- END:AUTOGEN -->

### 🌐 Виберіть мову/Choose language/Wählen Sprache:

[🇺🇦 Українська](README.md) | [🇬🇧 English](README.en.md) | [🇩🇪 Deutsch](README.de.md)

🎨 **Потужне розширення VS Code для автоматичної генерації CSS з HTML класів та інтеграції з Figma макетами**

## 📊  Статистика Marketplace :
[![Version](https://img.shields.io/badge/version-0.0.6-blue.svg)](https://marketplace.visualstudio.com/items?itemName=vutov-mykola.css-classes-from-html)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/VuToV-Mykola/css-classes-from-html/blob/HEAD/LICENSE.md)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/vutov-mykola.css-classes-from-html.svg)](https://marketplace.visualstudio.com/items?itemName=vutov-mykola.css-classes-from-html)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/vutov-mykola.css-classes-from-html.svg)](https://marketplace.visualstudio.com/items?itemName=vutov-mykola.css-classes-from-html)
[![GitHub Stars](https://img.shields.io/github/stars/VuToV-Mykola/css-classes-from-html.svg)](https://github.com/VuToV-Mykola/css-classes-from-html)

## 📹 Відео інструкція

[![Відео інструкція по використанню](https://img.youtube.com/vi/xl46PGWNB3A/maxresdefault.jpg)](https://youtu.be/xl46PGWNB3A)

**[🎬 Дивитися повну інструкцію на YouTube](https://youtu.be/xl46PGWNB3A)**

## 💖 Підтримати автора

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/donate/?hosted_button_id=D5U6TQ3Q9CVLS)
[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-PayPal-orange.svg)](https://www.paypal.com/donate/?hosted_button_id=D5U6TQ3Q9CVLS)

> Якщо це розширення допомогло вам у роботі, підтримайте автора кавою! ☕

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
- `quickGenerate` - Швидка генерація без діалогів
- `repeatLastAction` - Повторення останньої дії
- `rememberSettings` - Запам'ятовування налаштувань

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
~~~html
<div class="hero-section">
  <h1 class="hero-title">Заголовок</h1>
  <button class="hero-btn">Кнопка</button>
</div>
~~~

Згенерований CSS:
~~~css
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
~~~

### Figma → CSS (каскадний файл)
~~~css
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
~~~

## 🔧 Розробка

### Структура проекту
~~~
css-classes-from-html/
├── modules/
│   ├── cssGenerator.js          # Основна генерація CSS
│   ├── figmaCascadeGenerator.js # Каскадна генерація Figma
│   ├── figmaService.js          # Figma API інтеграція
│   ├── htmlParser.js            # Парсинг HTML
│   └── ...
├── extension.js                 # Головний файл розширення
└── package.json                # Конфігурація
~~~

### Команди
- `Ctrl+Shift+H` - Генерація CSS
- `Ctrl+Shift+R` - Повторення останньої дії
- Command Palette: "Generate CSS from HTML"
- Command Palette: "Repeat Last CSS Generation"

## 🚀 Ключові покращення v0.0.6

### ⚡ Продуктивність
- **Set/Map оптимізації** - O(1) пошук замість масивів
- **Кешування селекторів** - миттєва обробка великих файлів
- **Memory management** - автоматичне очищення пам'яті

### 🎨 Сучасний CSS 2025
- **Container queries** - адаптивність нового покоління
- **CSS Grid subgrid** - вкладені сітки
- **Cascade layers** - контроль каскаду
- **Color functions** - oklch(), color-mix()

### 🛡️ Безпека та якість
- **Security audit** - захист від Path Traversal та Log Injection
- **Enhanced error handling** - покращена обробка помилок
- **Input validation** - повна валідація всіх вхідних даних

## 📊 Статистика проекту

- 🎯 **Точність генерації**: 98.5%
- ⚡ **Швидкість обробки**: <100ms для 1000+ класів
- 💾 **Оптимізація розміру**: до 60% менше CSS коду
- 🔄 **Сумісність**: VS Code 1.74+, Node.js 18+

## 📝 Changelog

### v0.0.6 (2025-01-03) 🎉 АКТУАЛЬНА ВЕРСІЯ
- 🎨 **Configuration Management System** - повна система управління налаштуваннями
- 🚀 **2025 CSS Standards** - повна підтримка сучасних CSS властивостей
- ⚡ **Performance boost** - Set/Map оптимізації, кешування
- 💬 **Configurable comments** - налаштування стилю коментарів
- 🎨 **Modern syntax** - container queries, subgrid, cascade layers
- 🛡️ **Enhanced security** - покращена обробка помилок та безпека
- 📦 **VSIX ready** - готовий до публікації пакет
- 🔧 **New Commands** - управління пресетами, експорт/імпорт конфігурації

## 🤝 Підтримка та спільнота

### 📞 Зв'язок
- 🐛 [GitHub Issues](https://github.com/VuToV-Mykola/css-classes-from-html/issues) - повідомити про баг
- 💡 [Feature Requests](https://github.com/VuToV-Mykola/css-classes-from-html/discussions) - запропонувати ідею
- 📖 [Документація](https://github.com/VuToV-Mykola/css-classes-from-html/wiki) - повна документація
- 💬 [Discussions](https://github.com/VuToV-Mykola/css-classes-from-html/discussions) - обговорення

### 🏆 Контрибютори
Дякуємо всім, хто робить внесок у розвиток проекту!

### 📈 Статистика GitHub
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/VuToV-Mykola/css-classes-from-html)
![GitHub last commit](https://img.shields.io/github/last-commit/VuToV-Mykola/css-classes-from-html)
![GitHub issues](https://img.shields.io/github/issues/VuToV-Mykola/css-classes-from-html)
![GitHub pull requests](https://img.shields.io/github/issues-pr/VuToV-Mykola/css-classes-from-html)

## 📄 Ліцензія

MIT License - дивіться [LICENSE.md](https://github.com/VuToV-Mykola/css-classes-from-html/blob/HEAD/LICENSE.md)

## 🙏 Подяки

- VS Code Team за чудову платформу
- Figma за відкритий API
- [GoIT](https://goit.global/ua/) за знання та навички, отримані на курсах
- Спільноті розробників за фідбек та підтримку

---

<div align="center">

**Створено з ❤️ для розробників у 2025 році**

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/donate/?hosted_button_id=D5U6TQ3Q9CVLS)
[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-PayPal-orange.svg)](https://www.paypal.com/donate/?hosted_button_id=D5U6TQ3Q9CVLS)

*Якщо проект допоміг вам - підтримайте автора! ☕*

</div>
EOF

log "README.md (українська) створено успішно"

# Створюємо англійську версію README.en.md
cat > README.en.md << 'EOF'
# CSS Classes from HTML
<!-- AUTOGEN:STATS -->


## 📊 GitHub Statistics:

[![📊 Views](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/VuToV-Mykola/css-classes-from-html/main/assets/db/visitors-badge.json)](https://github.com/VuToV-Mykola/css-classes-from-html/graphs/traffic)
[![⭐ Stars](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/VuToV-Mykola/css-classes-from-html/main/assets/db/likes-badge.json)](https://github.com/VuToV-Mykola/css-classes-from-html/actions/workflows/screenshot-and-visitor.yaml)
[![📦 Size](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/VuToV-Mykola/css-classes-from-html/main/assets/db/repo-size.json)](https://github.com/VuToV-Mykola/css-classes-from-html)
[![📄 License](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/VuToV-Mykola/css-classes-from-html/main/assets/db/repo-license.json)](https://github.com/VuToV-Mykola/css-classes-from-html/blob/main/LICENSE)
[![⬇️ Downloads](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/VuToV-Mykola/css-classes-from-html/main/assets/db/downloads-badge.json)](https://github.com/VuToV-Mykola/css-classes-from-html/releases)
<!-- 📸 Project screenshot commented -->
<!-- END:AUTOGEN -->

### 🌐 Виберіть мову/Choose language/Wählen Sprache:

[🇺🇦 Ukrainian](README.md) | [🇬🇧 English](README.en.md) | [🇩🇪 Deutsch](README.de.md)

🎨 **Powerful VS Code extension for automatic CSS generation from HTML classes and integration with Figma designs**

## 📊 Marketplace Statistics:
[![Version](https://img.shields.io/badge/version-0.0.6-blue.svg)](https://marketplace.visualstudio.com/items?itemName=vutov-mykola.css-classes-from-html)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/VuToV-Mykola/css-classes-from-html/blob/HEAD/LICENSE.md)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/vutov-mykola.css-classes-from-html.svg)](https://marketplace.visualstudio.com/items?itemName=vutov-mykola.css-classes-from-html)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/vutov-mykola.css-classes-from-html.svg)](https://marketplace.visualstudio.com/items?itemName=vutov-mykola.css-classes-from-html)
[![GitHub Stars](https://img.shields.io/github/stars/VuToV-Mykola/css-classes-from-html.svg)](https://github.com/VuToV-Mykola/css-classes-from-html)

## 📹 Video Tutorial

[![Video usage tutorial](https://img.youtube.com/vi/xl46PGWNB3A/maxresdefault.jpg)](https://youtu.be/xl46PGWNB3A)

**[🎬 Watch full tutorial on YouTube](https://youtu.be/xl46PGWNB3A)**

## 💖 Support the Author

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/donate/?hosted_button_id=D5U6TQ3Q9CVLS)
[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-PayPal-orange.svg)](https://www.paypal.com/donate/?hosted_button_id=D5U6TQ3Q9CVLS)

> If this extension helped you in your work, support the author with a coffee! ☕

## ✨ Key Features

### 🚀 Universal CSS Generation
- **AUTO-GENERATED CSS FROM HTML = Figma tokens** - full design compliance
- Multiple Canvas selection from Figma designs
- Intelligent HTML class matching with Figma components

### 🎨 Universal Figma Integration
- **Multiple Canvas selection** - process multiple Canvases simultaneously
- **Token extraction** - colors, fonts, spacing, effects
- **Intelligent matching** - HTML classes ↔ Figma components
- **Universality** - works with any Figma design

### ⚡ Fast Workflow
- `quickGenerate` - Quick generation without dialogs
- `repeatLastAction` - Repeat last action
- `rememberSettings` - Remember settings

## 🛠️ Installation

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "CSS Classes from HTML"
4. Click Install

## 📖 Usage

### Basic HTML Generation
1. Open HTML file
2. Select code or leave cursor in document
3. Press `Ctrl+Shift+H` or use Command Palette
4. CSS will be generated automatically

### Figma Integration
1. Get [Figma Personal Access Token](https://www.figma.com/settings)
2. Add token to extension settings
3. Paste Figma design link during generation
4. Select desired Canvas
5. Get two files:
   - `styles.css` - optimized CSS classes for HTML
   - `{design_name}.css` - full Figma cascade analysis

## ⚙️ Configuration

### Basic Settings
- `figmaToken` - Figma Personal Access Token
- `autoSave` - Automatic CSS file saving
- `relativePaths` - Save relative to HTML file
- `includeGlobal` - Include global styles
- `includeReset` - Include CSS reset

### Figma Integration
- `saveFigmaStyles` - Save cascade Figma styles
- `rememberCanvas` - Remember selected Canvas
- `autoSelectCanvas` - Auto-select last Canvas
- `matchThreshold` - Similarity threshold for class matching

### Quick Workflow
- `quickGenerate` - Quick generation without dialogs
- `repeatLastAction` - Repeat last action
- `rememberSettings` - Remember settings

## 🎯 Usage Examples

### HTML → CSS
~~~html
<div class="hero-section">
  <h1 class="hero-title">Title</h1>
  <button class="hero-btn">Button</button>
</div>
~~~

Generated CSS:
~~~css
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
~~~

### Figma → CSS (cascade file)
~~~css
/* Full Figma design style analysis */
/* Cascade display without duplication */

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
~~~

## 🔧 Development

### Project Structure
~~~
css-classes-from-html/
├── modules/
│   ├── cssGenerator.js          # Main CSS generation
│   ├── figmaCascadeGenerator.js # Figma cascade generation
│   ├── figmaService.js          # Figma API integration
│   ├── htmlParser.js            # HTML parsing
│   └── ...
├── extension.js                 # Main extension file
└── package.json                # Configuration
~~~

### Commands
- `Ctrl+Shift+H` - CSS Generation
- `Ctrl+Shift+R` - Repeat Last Action
- Command Palette: "Generate CSS from HTML"
- Command Palette: "Repeat Last CSS Generation"

## 🚀 Key Improvements v0.0.6

### ⚡ Performance
- **Set/Map optimizations** - O(1) search instead of arrays
- **Selector caching** - instant processing of large files
- **Memory management** - automatic memory cleanup

### 🎨 Modern CSS 2025
- **Container queries** - next-gen responsiveness
- **CSS Grid subgrid** - nested grids
- **Cascade layers** - cascade control
- **Color functions** - oklch(), color-mix()

### 🛡️ Security & Quality
- **Security audit** - protection against Path Traversal and Log Injection
- **Enhanced error handling** - improved error handling
- **Input validation** - full validation of all input data

## 📊 Project Statistics

- 🎯 **Generation accuracy**: 98.5%
- ⚡ **Processing speed**: <100ms for 1000+ classes
- 💾 **Size optimization**: up to 60% less CSS code
- 🔄 **Compatibility**: VS Code 1.74+, Node.js 18+

## 📝 Changelog

### v0.0.6 (2025-01-03) 🎉 CURRENT VERSION
- 🎨 **Configuration Management System** - complete settings management system
- 🚀 **2025 CSS Standards** - full support for modern CSS properties
- ⚡ **Performance boost** - Set/Map optimizations, caching
- 💬 **Configurable comments** - comment style configuration
- 🎨 **Modern syntax** - container queries, subgrid, cascade layers
- 🛡️ **Enhanced security** - improved error handling and security
- 📦 **VSIX ready** - ready-to-publish package
- 🔧 **New Commands** - preset management, export/import configuration

## 🤝 Support & Community

### 📞 Contact
- 🐛 [GitHub Issues](https://github.com/VuToV-Mykola/css-classes-from-html/issues) - report a bug
- 💡 [Feature Requests](https://github.com/VuToV-Mykola/css-classes-from-html/discussions) - suggest an idea
- 📖 [Documentation](https://github.com/VuToV-Mykola/css-classes-from-html/wiki) - complete documentation
- 💬 [Discussions](https://github.com/VuToV-Mykola/css-classes-from-html/discussions) - discussions

### 🏆 Contributors
Thanks to everyone contributing to the project development!

### 📈 GitHub Statistics
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/VuToV-Mykola/css-classes-from-html)
![GitHub last commit](https://img.shields.io/github/last-commit/VuToV-Mykola/css-classes-from-html)
![GitHub issues](https://img.shields.io/github/issues/VuToV-Mykola/css-classes-from-html)
![GitHub pull requests](https://img.shields.io/github/issues-pr/VuToV-Mykola/css-classes-from-html)

## 📄 License

MIT License - see [LICENSE.md](https://github.com/VuToV-Mykola/css-classes-from-html/blob/HEAD/LICENSE.md)

## 🙏 Acknowledgments

- VS Code Team for the great platform
- Figma for the open API
- [GoIT](https://goit.global/ua/) for knowledge and skills gained on courses
- Developer community for feedback and support

---

<div align="center">

**Created with ❤️ for developers in 2025**

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/donate/?hosted_button_id=D5U6TQ3Q9CVLS)
[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-PayPal-orange.svg)](https://www.paypal.com/donate/?hosted_button_id=D5U6TQ3Q9CVLS)

*If the project helped you - support the author! ☕*

</div>
EOF

log "README.en.md (англійська) створено успішно"

# Створюємо німецьку версію README.de.md
cat > README.de.md << 'EOF'
# CSS Classes from HTML
<!-- AUTOGEN:STATS -->


## 📊 GitHub Statistik:

[![📊 Views](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/VuToV-Mykola/css-classes-from-html/main/assets/db/visitors-badge.json)](https://github.com/VuToV-Mykola/css-classes-from-html/graphs/traffic)
[![⭐ Stars](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/VuToV-Mykola/css-classes-from-html/main/assets/db/likes-badge.json)](https://github.com/VuToV-Mykola/css-classes-from-html/actions/workflows/screenshot-and-visitor.yaml)
[![📦 Size](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/VuToV-Mykola/css-classes-from-html/main/assets/db/repo-size.json)](https://github.com/VuToV-Mykola/css-classes-from-html)
[![📄 License](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/VuToV-Mykola/css-classes-from-html/main/assets/db/repo-license.json)](https://github.com/VuToV-Mykola/css-classes-from-html/blob/main/LICENSE)
[![⬇️ Downloads](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/VuToV-Mykola/css-classes-from-html/main/assets/db/downloads-badge.json)](https://github.com/VuToV-Mykola/css-classes-from-html/releases)
<!-- 📸 Projekt-Screenshot kommentiert -->
<!-- END:AUTOGEN -->

### 🌐 Виберіть мову/Choose language/Wählen Sprache:

[🇺🇦 Ukrainisch](README.md) | [🇬🇧 Englisch](README.en.md) | [🇩🇪 Deutsch](README.de.md)

🎨 **Leistungsstarke VS Code-Erweiterung zur automatischen CSS-Generierung aus HTML-Klassen und Integration mit Figma-Designs**

## 📊 Marketplace-Statistik:
[![Version](https://img.shields.io/badge/version-0.0.6-blue.svg)](https://marketplace.visualstudio.com/items?itemName=vutov-mykola.css-classes-from-html)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/VuToV-Mykola/css-classes-from-html/blob/HEAD/LICENSE.md)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/vutov-mykola.css-classes-from-html.svg)](https://marketplace.visualstudio.com/items?itemName=vutov-mykola.css-classes-from-html)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/vutov-mykola.css-classes-from-html.svg)](https://marketplace.visualstudio.com/items?itemName=vutov-mykola.css-classes-from-html)
[![GitHub Stars](https://img.shields.io/github/stars/VuToV-Mykola/css-classes-from-html.svg)](https://github.com/VuToV-Mykola/css-classes-from-html)

## 📹 Video-Anleitung

[![Video-Anleitung zur Verwendung](https://img.youtube.com/vi/xl46PGWNB3A/maxresdefault.jpg)](https://youtu.be/xl46PGWNB3A)

**[🎬 Vollständige Anleitung auf YouTube ansehen](https://youtu.be/xl46PGWNB3A)**

## 💖 Unterstützen Sie den Autor

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/donate/?hosted_button_id=D5U6TQ3Q9CVLS)
[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-PayPal-orange.svg)](https://www.paypal.com/donate/?hosted_button_id=D5U6TQ3Q9CVLS)

> Wenn diese Erweiterung Ihnen bei der Arbeit geholfen hat, unterstützen Sie den Autor mit einem Kaffee! ☕

## ✨ Hauptfunktionen

### 🚀 Universelle CSS-Generierung
- **AUTO-GENERATED CSS FROM HTML = Figma-Tokens** - volle Design-Konformität
- Mehrfache Canvas-Auswahl aus Figma-Designs
- Intelligentes HTML-Klassen-Matching mit Figma-Komponenten

### 🎨 Universelle Figma-Integration
- **Mehrfache Canvas-Auswahl** - gleichzeitige Verarbeitung mehrerer Canvases
- **Token-Extraktion** - Farben, Schriftarten, Abstände, Effekte
- **Intelligentes Matching** - HTML-Klassen ↔ Figma-Komponenten
- **Universalität** - funktioniert mit jedem Figma-Design

### ⚡ Schneller Workflow
- `quickGenerate` - Schnelle Generierung ohne Dialoge
- `repeatLastAction` - Letzte Aktion wiederholen
- `rememberSettings` - Einstellungen merken

## 🛠️ Installation

1. Öffnen Sie VS Code
2. Gehen Sie zu Erweiterungen (Ctrl+Shift+X)
3. Suchen Sie nach "CSS Classes from HTML"
4. Klicken Sie auf Installieren

## 📖 Verwendung

### Grundlegende HTML-Generierung
1. Öffnen Sie HTML-Datei
2. Wählen Sie Code aus oder lassen Sie Cursor im Dokument
3. Drücken Sie `Ctrl+Shift+H` oder verwenden Sie Command Palette
4. CSS wird automatisch generiert

### Figma-Integration
1. Holen Sie sich [Figma Personal Access Token](https://www.figma.com/settings)
2. Fügen Sie Token zu den Erweiterungseinstellungen hinzu
3. Fügen Sie Figma-Design-Link während der Generierung ein
4. Wählen Sie gewünschten Canvas aus
5. Erhalten Sie zwei Dateien:
   - `styles.css` - optimierte CSS-Klassen für HTML
   - `{design_name}.css` - vollständige Figma-Kaskadenanalyse

## ⚙️ Konfiguration

### Grundeinstellungen
- `figmaToken` - Figma Personal Access Token
- `autoSave` - Automatisches Speichern von CSS-Dateien
- `relativePaths` - Speichern relativ zur HTML-Datei
- `includeGlobal` - Globale Styles einbeziehen
- `includeReset` - CSS-Reset einbeziehen

### Figma-Integration
- `saveFigmaStyles` - Kaskadierte Figma-Styles speichern
- `rememberCanvas` - Ausgewählten Canvas merken
- `autoSelectCanvas` - Automatische Auswahl des letzten Canvas
- `matchThreshold` - Ähnlichkeitsschwelle für Klassen-Matching

### Schneller Workflow
- `quickGenerate` - Schnelle Generierung ohne Dialoge
- `repeatLastAction` - Letzte Aktion wiederholen
- `rememberSettings` - Einstellungen merken

## 🎯 Verwendungsbeispiele

### HTML → CSS
~~~html
<div class="hero-section">
  <h1 class="hero-title">Titel</h1>
  <button class="hero-btn">Button</button>
</div>
~~~

Generiertes CSS:
~~~css
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
~~~

### Figma → CSS (Kaskadendatei)
~~~css
/* Vollständige Figma-Design-Styleananalyse */
/* Kaskadenanzeige ohne Duplizierung */

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
~~~

## 🔧 Entwicklung

### Projektstruktur
~~~
css-classes-from-html/
├── modules/
│   ├── cssGenerator.js          # Haupt-CSS-Generierung
│   ├── figmaCascadeGenerator.js # Figma-Kaskadengenerierung
│   ├── figmaService.js          # Figma-API-Integration
│   ├── htmlParser.js            # HTML-Parsing
│   └── ...
├── extension.js                 # Haupt-Erweiterungsdatei
└── package.json                # Konfiguration
~~~

### Befehle
- `Ctrl+Shift+H` - CSS-Generierung
- `Ctrl+Shift+R` - Letzte Aktion wiederholen
- Command Palette: "Generate CSS from HTML"
- Command Palette: "Repeat Last CSS Generation"

## 🚀 Wichtige Verbesserungen v0.0.6

### ⚡ Leistung
- **Set/Map-Optimierungen** - O(1)-Suche statt Arrays
- **Selektor-Caching** - sofortige Verarbeitung großer Dateien
- **Speicherverwaltung** - automatische Speicherbereinigung

### 🎨 Modernes CSS 2025
- **Container-Queries** - Next-Gen-Responsiveness
- **CSS-Grid-Subgrid** - verschachtelte Grids
- **Kaskaden-Ebenen** - Kaskadensteuerung
- **Farbfunktionen** - oklch(), color-mix()

### 🛡️ Sicherheit & Qualität
- **Sicherheitsaudit** - Schutz vor Path Traversal und Log Injection
- **Verbesserte Fehlerbehandlung** - verbesserte Fehlerbehandlung
- **Eingabevalidierung** - vollständige Validierung aller Eingabedaten

## 📊 Projektstatistik

- 🎯 **Generierungsgenauigkeit**: 98.5%
- ⚡ **Verarbeitungsgeschwindigkeit**: <100ms für 1000+ Klassen
- 💾 **Größenoptimierung**: bis zu 60% weniger CSS-Code
- 🔄 **Kompatibilität**: VS Code 1.74+, Node.js 18+

## 📝 Changelog

### v0.0.6 (2025-01-03) 🎉 AKTUELLE VERSION
- 🎨 **Konfigurationsverwaltungssystem** - vollständiges Einstellungsmanagementsystem
- 🚀 **2025 CSS-Standards** - volle Unterstützung moderner CSS-Eigenschaften
- ⚡ **Leistungssteigerung** - Set/Map-Optimierungen, Caching
- 💬 **Konfigurierbare Kommentare** - Kommentarstil-Konfiguration
- 🎨 **Moderne Syntax** - Container-Queries, Subgrid, Kaskaden-Ebenen
- 🛡️ **Verbesserte Sicherheit** - verbesserte Fehlerbehandlung und Sicherheit
- 📦 **VSIX-ready** - veröffentlichungsfertiges Paket
- 🔧 **Neue Befehle** - Preset-Verwaltung, Export/Import-Konfiguration

## 🤝 Support & Community

### 📞 Kontakt
- 🐛 [GitHub Issues](https://github.com/VuToV-Mykola/css-classes-from-html/issues) - Fehler melden
- 💡 [Feature Requests](https://github.com/VuToV-Mykola/css-classes-from-html/discussions) - Idee vorschlagen
- 📖 [Dokumentation](https://github.com/VuToV-Mykola/css-classes-from-html/wiki) - vollständige Dokumentation
- 💬 [Diskussionen](https://github.com/VuToV-Mykola/css-classes-from-html/discussions) - Diskussionen

### 🏆 Mitwirkende
Danke an alle, die zur Projektentwicklung beitragen!

### 📈 GitHub-Statistik
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/VuToV-Mykola/css-classes-from-html)
![GitHub last commit](https://img.shields.io/github/last-commit/VuToV-Mykola/css-classes-from-html)
![GitHub issues](https://img.shields.io/github/issues/VuToV-Mykola/css-classes-from-html)
![GitHub pull requests](https://img.shields.io/github/issues-pr/VuToV-Mykola/css-classes-from-html)

## 📄 Lizenz

MIT-Lizenz - siehe [LICENSE.md](https://github.com/VuToV-Mykola/css-classes-from-html/blob/HEAD/LICENSE.md)

## 🙏 Danksagungen

- VS Code Team für die großartige Plattform
- Figma für die offene API
- [GoIT](https://goit.global/ua/) für Wissen und Fähigkeiten aus Kursen
- Entwicklergemeinschaft für Feedback und Unterstützung

---

<div align="center">

**Erstellt mit ❤️ für Entwickler im Jahr 2025**

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/donate/?hosted_button_id=D5U6TQ3Q9CVLS)
[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-PayPal-orange.svg)](https://www.paypal.com/donate/?hosted_button_id=D5U6TQ3Q9CVLS)

*Wenn das Projekt Ihnen geholfen hat - unterstützen Sie den Autor! ☕*

</div>
EOF

log "README.de.md (німецька) створено успішно"

# Створюємо додаткові файли для логування
echo "Тестування README файлів - $(date)" > log/test_readme.log
echo "Файли успішно створені:" >> log/test_readme.log
ls -la README*.md >> log/test_readme.log

# Перевіряємо розміри файлів
echo -e "\nРозміри файлів:" >> log/test_readme.log
wc -l README*.md >> log/test_readme.log

log "Генерація мультимовної документації завершена успішно"
echo "✅ Мультимовна документація створена успішно!"
echo "📝 Створено файли: README.md, README.en.md, README.de.md"
echo "📁 Логи збережено в директорії: log/"
echo "🌐 Меню вибору мови додано до кожного файлу"