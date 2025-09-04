#!/bin/bash

# Генерація багатомовної документації для VSCode Extension
# CSS Classes from HTML - Figma Integration

# Кольори для терміналу
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Створення директорії для логів
mkdir -p log
LOG_FILE="log/docs-generation-$(date +%Y%m%d_%H%M%S).log"

# Логування
log_message() {
    echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} $1" | tee -a "$LOG_FILE"
}

error_message() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

# Початок генерації
log_message "🚀 Початок генерації документації..."

# README.md - Українська версія
cat > README.md << 'EOF'
### 🌐 Виберіть мову/Choose language/Wählen Sprache:

[🇺🇦 Українська](README.md) | [🇬🇧 English](README.en.md) | [🇩🇪 Deutsch](README.de.md)

---

# 🎨 CSS Classes from HTML - Figma Integration

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![VSCode](https://img.shields.io/badge/VSCode-^1.85.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 📌 Опис

**CSS Classes from HTML** — це потужне розширення для Visual Studio Code, яке автоматично генерує CSS класи з HTML файлів з можливістю інтеграції з Figma дизайнами.

## ✨ Основні можливості

- 🚀 **Швидка генерація CSS** з HTML класів
- 🎨 **Інтеграція з Figma** через API
- 📱 **Адаптивні стилі** з media queries
- 🎯 **Розумне співставлення** елементів
- ⚡ **3 режими роботи**: мінімальний, максимальний, production
- 🔧 **Візуальний конфігуратор** у WebView
- 💾 **Збереження налаштувань** для повторного використання

## 📦 Встановлення

### З VSCode Marketplace
1. Відкрийте VSCode
2. Перейдіть в Extensions (Ctrl+Shift+X)
3. Знайдіть "CSS Classes from HTML"
4. Натисніть Install

### Ручне встановлення
```bash
git clone https://github.com/VuToV-Mykola/css-classes-from-html.git
cd css-classes-from-html
npm install
npm run compile
```

## 🚀 Використання

### Швидкий старт
1. Відкрийте HTML файл у VSCode
2. Натисніть `Ctrl+Shift+C` (або `Cmd+Shift+C` на Mac)
3. Виберіть режим генерації
4. CSS файл буде створено автоматично!

### Гарячі клавіші
- `Ctrl+Shift+C` - Показати меню
- `Ctrl+Alt+C` - Швидка генерація
- `Ctrl+Shift+R` - Повторити останню дію

### Режими роботи

#### ⚡ Мінімальний режим
- Швидкий парсинг HTML
- Генерація порожніх CSS класів
- Без інтеграції з Figma

#### 🚀 Максимальний режим
- Повна інтеграція з Figma
- Співставлення елементів
- Імпорт стилів з дизайну
- Адаптивні стилі

#### 📦 Production режим
- Оптимізований CSS
- Мінімізація коду
- Видалення коментарів
- Ready для деплою

## ⚙️ Налаштування

### Figma інтеграція
1. Отримайте API токен на [figma.com/developers](https://www.figma.com/developers)
2. Додайте токен в налаштування розширення
3. Вставте посилання на Figma файл при генерації

### Параметри конфігурації
- `cssClasses.includeReset` - Включити CSS reset
- `cssClasses.includeComments` - Додавати коментарі
- `cssClasses.optimizeCSS` - Оптимізувати CSS
- `cssClasses.generateResponsive` - Генерувати media queries

## 📊 Приклад роботи

### Вхідний HTML:
```html
<div class="container">
    <header class="header">
        <nav class="nav-menu">
            <a class="nav-link">Home</a>
        </nav>
    </header>
    <main class="content">
        <section class="hero-section">
            <h1 class="hero-title">Welcome</h1>
            <button class="btn btn-primary">Get Started</button>
        </section>
    </main>
</div>
```

### Згенерований CSS:
```css
/* Container */
.container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Header */
.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 0;
}

/* Navigation */
.nav-menu {
    display: flex;
    gap: 2rem;
}

.nav-link {
    color: var(--text-color);
    text-decoration: none;
    transition: color 0.3s ease;
}

.nav-link:hover {
    color: var(--primary-color);
}

/* Content */
.content {
    padding: 2rem 0;
}

/* Hero Section */
.hero-section {
    text-align: center;
    padding: 4rem 0;
}

.hero-title {
    font-size: 3rem;
    margin-bottom: 2rem;
}

/* Buttons */
.btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-primary {
    background-color: var(--primary-color);
    color: white;
}

.btn-primary:hover {
    background-color: var(--primary-hover);
    transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 768px) {
    .container {
        padding: 0 15px;
    }
    
    .hero-title {
        font-size: 2rem;
    }
    
    .nav-menu {
        flex-direction: column;
        gap: 1rem;
    }
}
```

## 🛠️ Розробка

### Структура проекту
```
css-classes-from-html/
├── extension.js         # Головний файл розширення
├── package.json         # Конфігурація
├── core/               # Основні модулі
│   ├── FigmaAPIClient.js
│   ├── HTMLParser.js
│   ├── StyleMatcher.js
│   └── CSSGenerator.js
├── analyzers/          # Аналізатори
├── generators/         # Генератори
└── utils/             # Утиліти
```

### Збірка проекту
```bash
npm run compile      # Компіляція
npm run watch       # Watch mode
npm run test        # Тестування
npm run package     # Створення VSIX
```

## 🤝 Внесок у проект

Ми вітаємо внески від спільноти! Будь ласка:

1. Fork репозиторій
2. Створіть гілку для вашої функції
3. Commit ваші зміни
4. Push в гілку
5. Створіть Pull Request

## 📝 Ліцензія

MIT License - див. файл [LICENSE](LICENSE)

## 👨‍💻 Автор

**VuToV Mykola**
- GitHub: [@VuToV-Mykola](https://github.com/VuToV-Mykola)
- Email: your-email@example.com

## 🙏 Подяки

- Команді GoIT за навчання
- Спільноті VSCode за підтримку
- Figma за чудове API

## 📞 Підтримка

Якщо у вас виникли питання або проблеми:
- Створіть [Issue](https://github.com/VuToV-Mykola/css-classes-from-html/issues)
- Напишіть на email
- Приєднуйтесь до нашого Discord

---

Made with ❤️ in Ukraine 🇺🇦
EOF

# README.en.md - English version
cat > README.en.md << 'EOF'
### 🌐 Виберіть мову/Choose language/Wählen Sprache:

[🇺🇦 Українська](README.md) | [🇬🇧 English](README.en.md) | [🇩🇪 Deutsch](README.de.md)

---

# 🎨 CSS Classes from HTML - Figma Integration

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![VSCode](https://img.shields.io/badge/VSCode-^1.85.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 📌 Description

**CSS Classes from HTML** is a powerful Visual Studio Code extension that automatically generates CSS classes from HTML files with the ability to integrate with Figma designs.

## ✨ Key Features

- 🚀 **Fast CSS generation** from HTML classes
- 🎨 **Figma integration** via API
- 📱 **Responsive styles** with media queries
- 🎯 **Smart element matching**
- ⚡ **3 working modes**: minimal, maximum, production
- 🔧 **Visual configurator** in WebView
- 💾 **Save settings** for reuse

## 📦 Installation

### From VSCode Marketplace
1. Open VSCode
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "CSS Classes from HTML"
4. Click Install

### Manual Installation
```bash
git clone https://github.com/VuToV-Mykola/css-classes-from-html.git
cd css-classes-from-html
npm install
npm run compile
```

## 🚀 Usage

### Quick Start
1. Open HTML file in VSCode
2. Press `Ctrl+Shift+C` (or `Cmd+Shift+C` on Mac)
3. Select generation mode
4. CSS file will be created automatically!

### Hotkeys
- `Ctrl+Shift+C` - Show menu
- `Ctrl+Alt+C` - Quick generation
- `Ctrl+Shift+R` - Repeat last action

### Working Modes

#### ⚡ Minimal Mode
- Quick HTML parsing
- Generate empty CSS classes
- No Figma integration

#### 🚀 Maximum Mode
- Full Figma integration
- Element matching
- Import styles from design
- Responsive styles

#### 📦 Production Mode
- Optimized CSS
- Code minification
- Remove comments
- Ready for deployment

## 📝 License

MIT License - see [LICENSE](LICENSE) file

## 👨‍💻 Author

**VuToV Mykola**
- GitHub: [@VuToV-Mykola](https://github.com/VuToV-Mykola)

---

Made with ❤️ in Ukraine 🇺🇦
EOF

# README.de.md - German version
cat > README.de.md << 'EOF'
### 🌐 Виберіть мову/Choose language/Wählen Sprache:

[🇺🇦 Українська](README.md) | [🇬🇧 English](README.en.md) | [🇩🇪 Deutsch](README.de.md)

---

# 🎨 CSS Classes from HTML - Figma Integration

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![VSCode](https://img.shields.io/badge/VSCode-^1.85.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 📌 Beschreibung

**CSS Classes from HTML** ist eine leistungsstarke Visual Studio Code-Erweiterung, die automatisch CSS-Klassen aus HTML-Dateien generiert mit der Möglichkeit zur Integration mit Figma-Designs.

## ✨ Hauptfunktionen

- 🚀 **Schnelle CSS-Generierung** aus HTML-Klassen
- 🎨 **Figma-Integration** über API
- 📱 **Responsive Stile** mit Media Queries
- 🎯 **Intelligente Element-Zuordnung**
- ⚡ **3 Arbeitsmodi**: minimal, maximal, produktion
- 🔧 **Visueller Konfigurator** in WebView
- 💾 **Einstellungen speichern** zur Wiederverwendung

## 📦 Installation

### Aus VSCode Marketplace
1. Öffnen Sie VSCode
2. Gehen Sie zu Erweiterungen (Ctrl+Shift+X)
3. Suchen Sie nach "CSS Classes from HTML"
4. Klicken Sie auf Installieren

### Manuelle Installation
```bash
git clone https://github.com/VuToV-Mykola/css-classes-from-html.git
cd css-classes-from-html
npm install
npm run compile
```

## 🚀 Verwendung

### Schnellstart
1. Öffnen Sie HTML-Datei in VSCode
2. Drücken Sie `Ctrl+Shift+C` (oder `Cmd+Shift+C` auf Mac)
3. Wählen Sie Generierungsmodus
4. CSS-Datei wird automatisch erstellt!

## 📝 Lizenz

MIT-Lizenz - siehe [LICENSE](LICENSE) Datei

## 👨‍💻 Autor

**VuToV Mykola**
- GitHub: [@VuToV-Mykola](https://github.com/VuToV-Mykola)

---

Made with ❤️ in Ukraine 🇺🇦
EOF

log_message "✅ Документація згенерована успішно!"

# Створення .vscodeignore
cat > .vscodeignore << 'EOF'
.vscode/**
.vscode-test/**
test/**
.gitignore
.eslintrc.json
**/*.map
**/*.ts
node_modules/**
!node_modules/vscode-nls/**
!node_modules/vscode-nls-dev/**
log/**
*.vsix
.github/**
EOF

log_message "✅ .vscodeignore створено"

# Створення CHANGELOG.md
cat > CHANGELOG.md << 'EOF'
# Changelog

## [2.0.0] - 2024-01-20
### Added
- 🎨 Full Figma integration via API
- 🔧 Visual configuration panel in WebView
- 📱 Responsive styles generation
- 🎯 Smart element matching algorithm
- 💾 Settings persistence

### Changed
- Complete refactoring for VSCode marketplace
- Improved UI/UX
- Optimized performance

### Fixed
- HTML parsing issues
- CSS generation bugs
- Memory leaks

## [1.0.0] - 2023-12-01
### Initial Release
- Basic HTML to CSS generation
- Simple class extraction
EOF

log_message "✅ CHANGELOG.md створено"

# Створення LICENSE
cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2024 VuToV Mykola

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF

log_message "✅ LICENSE створено"

# GitHub About секція
echo -e "\n${BLUE}=== GitHub About Section ===${NC}"
echo -e "${YELLOW}Українська:${NC}"
echo "📌 Автоматична генерація CSS з HTML з інтеграцією Figma. VSCode розширення для швидкої розробки. Створено з використанням AI."

echo -e "\n${YELLOW}English:${NC}"
echo "📌 Auto CSS generation from HTML with Figma integration. VSCode extension for rapid development. Created with AI assistance."

echo -e "\n${YELLOW}Deutsch:${NC}"
echo "📌 Auto-CSS-Generierung aus HTML mit Figma-Integration. VSCode-Erweiterung für schnelle Entwicklung. Mit KI erstellt."

echo -e "\n${YELLOW}Topics:${NC}"
echo "vscode-extension css html figma automation web-development design-to-code javascript nodejs api-integration"

# Підсумок
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Документація згенерована успішно!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\nФайли створено:"
echo "  • README.md (Українська)"
echo "  • README.en.md (English)"
echo "  • README.de.md (Deutsch)"
echo "  • CHANGELOG.md"
echo "  • LICENSE"
echo "  • .vscodeignore"
echo -e "\n${BLUE}Лог збережено:${NC} $LOG_FILE"

# Git команда
echo -e "\n${YELLOW}Команда для пуша на GitHub:${NC}"
echo 'git add --all && git commit -m "🎨 Refactor to VSCode Extension with Figma integration" && git push --force'