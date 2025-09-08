#!/bin/bash

# 🤖 АВТОГЕНЕРАТОР ДОКУМЕНТАЦІЇ CSS CLASSES FROM HTML v0.0.7
# Автоматична генерація багатомовної документації з аналізом проекту
# Використовує перші 37 рядків з існуючих README файлів та генерує решту контенту
# Author: VuToV-Mykola

set -e

# ✅ Кольори для виводу
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ✅ Функції для красивого виводу
print_banner() {
    echo -e "${BLUE}
╔══════════════════════════════════════════════════════════════════════════╗
║                    🤖 АВТОГЕНЕРАТОР ДОКУМЕНТАЦІЇ                         ║
║                   CSS Classes from HTML v0.0.7                           ║
║                                                                          ║
║         Автоматична генерація багатомовної документації                  ║
║                з аналізом структури проекту                             ║
╚══════════════════════════════════════════════════════════════════════════╝${NC}"
}

print_step() {
    echo -e "${YELLOW}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

print_feature() {
    echo -e "${PURPLE}🔥 $1${NC}"
}

# ✅ Змінні проекту
PROJECT_ROOT="$(pwd)"
PROJECT_NAME="CSS Classes from HTML"
PROJECT_VERSION="0.0.7"
AUTHOR="VuToV-Mykola"
GITHUB_REPO="https://github.com/VuToV-Mykola/css-classes-from-html"

# ✅ Функція аналізу проекту
analyze_project() {
    print_step "Аналізування структури проекту..."
    
    # Підрахунок статистики
    local js_files=$(find . -name "*.js" ! -path "./node_modules/*" | wc -l | tr -d ' ')
    local html_files=$(find . -name "*.html" ! -path "./node_modules/*" | wc -l | tr -d ' ')
    local md_files=$(find . -name "*.md" ! -path "./node_modules/*" | wc -l | tr -d ' ')
    local total_files=$(find . -type f ! -path "./node_modules/*" ! -path "./.git/*" | wc -l | tr -d ' ')
    
    # Розмір проекту
    local project_size=$(du -sh . 2>/dev/null | cut -f1 | head -1)
    
    # Аналіз package.json
    local dependencies=""
    local scripts=""
    if [ -f "package.json" ]; then
        dependencies=$(node -pe "Object.keys(JSON.parse(require('fs').readFileSync('package.json', 'utf8')).dependencies || {}).length" 2>/dev/null || echo "0")
        scripts=$(node -pe "Object.keys(JSON.parse(require('fs').readFileSync('package.json', 'utf8')).scripts || {}).length" 2>/dev/null || echo "0")
    fi
    
    # Зберігаємо статистику в глобальні змінні
    STATS_JS_FILES=$js_files
    STATS_HTML_FILES=$html_files
    STATS_MD_FILES=$md_files
    STATS_TOTAL_FILES=$total_files
    STATS_PROJECT_SIZE=$project_size
    STATS_DEPENDENCIES=$dependencies
    STATS_SCRIPTS=$scripts
    
    print_info "Знайдено JS файлів: $js_files"
    print_info "Знайдено HTML файлів: $html_files"
    print_info "Знайдено MD файлів: $md_files"
    print_info "Загальна кількість файлів: $total_files"
    print_info "Розмір проекту: $project_size"
    print_success "Аналіз проекту завершено"
}

# ✅ Функція отримання перших 37 рядків з README
get_readme_header() {
    local file_path=$1
    local output_lines=""
    
    if [ -f "$file_path" ]; then
        output_lines=$(head -37 "$file_path")
        print_success "Отримано заголовок з $file_path (37 рядків)"
    else
        print_error "Файл $file_path не знайдено"
        # Створюємо базовий заголовок
        output_lines="# 🎨 $PROJECT_NAME

### 🌐 Виберіть мову/Choose language/Wählen Sprache:
[🇺🇦 Українська](README.md) | [🇬🇧 English](docs/README.en.md) | [🇩🇪 Deutsch](docs/README.de.md)

<!-- AUTOGEN:STATS -->
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript) [![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML) [![VS Code](https://img.shields.io/badge/VS_Code-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white)](https://code.visualstudio.com/) [![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/) [![Figma](https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white)](https://www.figma.com/)

[![📊 Views](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/VuToV-Mykola/css-classes-from-html/main/assets/db/visitors-badge.json)](https://github.com/VuToV-Mykola/css-classes-from-html/graphs/traffic)
[![⭐ Stars](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/VuToV-Mykola/css-classes-from-html/main/assets/db/likes-badge.json)](https://github.com/VuToV-Mykola/css-classes-from-html/actions/workflows/screenshot-and-visitor.yaml)
[![📦 Size](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/VuToV-Mykola/css-classes-from-html/main/assets/db/repo-size.json)](https://github.com/VuToV-Mykola/css-classes-from-html)
<!-- END:AUTOGEN -->"
    fi
    
    echo "$output_lines"
}

# ✅ Функція генерації українського контенту
generate_ukrainian_content() {
    cat << EOF

## 🚀 Можливості розширення

### ⚡ Швидка генерація CSS
- **Автоматична** - Розпізнавання всіх CSS класів з HTML
- **Інтелектуальна** - Створення структурованих правил
- **Оптимізована** - Мінімальний та чистий код

### 🎨 Інтеграція з Figma
- **Реальні дані** - Пряме підключення до Figma API
- **Canvas імпорт** - Завантаження дизайну та layers
- **Стиль співставлення** - Автоматичне перенесення властивостей
- **Шрифти та зображення** - Імпорт ресурсів дизайну

### 📱 Адаптивний CSS
- **Mobile First** - Оптимізація для мобільних пристроїв
- **Breakpoints** - Стандартні точки переломів
- **Flexbox та Grid** - Сучасні методи верстання

## 🛠️ Встановлення та використання

### 1. Встановлення з Marketplace
\`\`\`bash
# Через VS Code Marketplace
1. Відкрити VS Code
2. Перейти в Extensions (Ctrl+Shift+X)
3. Знайти "CSS Classes from HTML"
4. Натиснути Install
\`\`\`

### 2. Локальне встановлення
\`\`\`bash
# Клонування проекту
git clone $GITHUB_REPO.git
cd css-classes-from-html

# Встановлення залежностей
npm install

# Збірка розширення
npm run package

# Встановлення в VS Code
code --install-extension ./builds/css-classes-from-html-$PROJECT_VERSION.vsix
\`\`\`

### 3. Швидкий старт
1. **Відкрити HTML файл** - Будь-який HTML файл з CSS класами
2. **Натиснути комбінацію** - \`Cmd+Alt+C\` (Mac) або \`Ctrl+Alt+C\` (Windows)
3. **Отримати результат** - CSS файл створено автоматично

## ⌨️ Гарячі клавіші

| Комбінація | Дія | Опис |
|------------|-----|------|
| \`Cmd+Shift+C\` | Головне меню | Відкриває повнофункціональне меню |
| \`Cmd+Alt+C\` | Швидка генерація | Створює CSS без меню |
| \`F1\` → "CSS Classes" | Command Palette | Доступ до всіх команд |

## 🎯 Режими роботи

### ⚡ Мінімальний режим
- Швидка генерація базових CSS класів
- Без зовнішніх інтеграцій
- Ідеально для простих проектів

### 🚀 Максимальний режим
- Повна інтеграція з Figma
- Розумне співставлення стилів
- Імпорт зображень та шрифтів

### 📦 Production режим
- Оптимізований CSS
- Мінімізація коду
- Готовий для продакшн

## 🔧 Налаштування

Розширення можна налаштувати через VS Code Settings:

\`\`\`json
{
  "cssClassesFromHtml.figmaToken": "your-figma-api-token",
  "cssClassesFromHtml.autoOpenCSS": true,
  "cssClassesFromHtml.includeReset": true,
  "cssClassesFromHtml.includeVariables": true,
  "cssClassesFromHtml.generateResponsive": true
}
\`\`\`

## 📊 Статистика проекту

- **📁 JavaScript файлів:** $STATS_JS_FILES
- **🌐 HTML файлів:** $STATS_HTML_FILES
- **📝 Markdown файлів:** $STATS_MD_FILES
- **📦 Загальна кількість файлів:** $STATS_TOTAL_FILES
- **💾 Розмір проекту:** $STATS_PROJECT_SIZE
- **🔧 Залежностей:** $STATS_DEPENDENCIES
- **⚡ Скриптів:** $STATS_SCRIPTS

## 🧪 Тестування

Розширення включає повний набір тестів:

\`\`\`bash
# Запуск всіх тестів
npm test

# Автоматизоване тестування
./test_extension.sh

# Мануальне тестування
# Дивіться TESTING_INSTRUCTIONS.md
\`\`\`

## 🤝 Внесок у проект

Ми вітаємо контрибуції! Дивіться [CONTRIBUTING.md](docs/CONTRIBUTING.md)

1. Fork проекту
2. Створіть feature branch
3. Commit змін
4. Push в branch
5. Створіть Pull Request

## 📜 Ліцензія

Цей проект використовує MIT ліцензію. Деталі в [LICENSE.md](docs/LICENSE.md)

## 👨‍💻 Автор

**$AUTHOR** - Сертифікований програміст з 10+ років досвіду  
Розроблено з використанням знань GoIT курсів та штучного інтелекту

- GitHub: [@VuToV-Mykola](https://github.com/VuToV-Mykola)
- Email: vutov_nikola@icloud.com

## 🚀 Подяки

Особлива подяка:
- **GoIT** - за якісні курси програмування
- **VS Code Team** - за чудову платформу
- **Figma** - за потужний API
- **Спільноті** - за підтримку та фідбек

---

### 📈 Розвиток проекту

Плани на майбутнє:
- 🎨 Більше інтеграцій з дизайн-системами
- 🚀 Підтримка інших фреймворків
- 🧪 Розширені можливості тестування
- 📱 Мобільна версія

**⭐ Поставте зірочку, якщо проект вам сподобався!**
EOF
}

# ✅ Функція генерації англійського контенту
generate_english_content() {
    cat << EOF

## 🚀 Extension Features

### ⚡ Fast CSS Generation
- **Automatic** - Recognizes all CSS classes from HTML
- **Intelligent** - Creates structured rules
- **Optimized** - Minimal and clean code

### 🎨 Figma Integration
- **Real data** - Direct Figma API connection
- **Canvas import** - Loading design and layers
- **Style matching** - Automatic property transfer
- **Fonts and images** - Design resource import

### 📱 Responsive CSS
- **Mobile First** - Mobile device optimization
- **Breakpoints** - Standard breakpoints
- **Flexbox and Grid** - Modern layout methods

## 🛠️ Installation and Usage

### 1. Install from Marketplace
\`\`\`bash
# Through VS Code Marketplace
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "CSS Classes from HTML"
4. Click Install
\`\`\`

### 2. Local Installation
\`\`\`bash
# Clone project
git clone $GITHUB_REPO.git
cd css-classes-from-html

# Install dependencies
npm install

# Build extension
npm run package

# Install in VS Code
code --install-extension ./builds/css-classes-from-html-$PROJECT_VERSION.vsix
\`\`\`

### 3. Quick Start
1. **Open HTML file** - Any HTML file with CSS classes
2. **Press hotkey** - \`Cmd+Alt+C\` (Mac) or \`Ctrl+Alt+C\` (Windows)
3. **Get result** - CSS file created automatically

## ⌨️ Hotkeys

| Combination | Action | Description |
|-------------|--------|-------------|
| \`Cmd+Shift+C\` | Main menu | Opens full-featured menu |
| \`Cmd+Alt+C\` | Quick generation | Creates CSS without menu |
| \`F1\` → "CSS Classes" | Command Palette | Access to all commands |

## 🎯 Work Modes

### ⚡ Minimal Mode
- Fast generation of basic CSS classes
- No external integrations
- Perfect for simple projects

### 🚀 Maximum Mode
- Full Figma integration
- Smart style matching
- Image and font import

### 📦 Production Mode
- Optimized CSS
- Code minification
- Production ready

## 🔧 Configuration

Extension can be configured through VS Code Settings:

\`\`\`json
{
  "cssClassesFromHtml.figmaToken": "your-figma-api-token",
  "cssClassesFromHtml.autoOpenCSS": true,
  "cssClassesFromHtml.includeReset": true,
  "cssClassesFromHtml.includeVariables": true,
  "cssClassesFromHtml.generateResponsive": true
}
\`\`\`

## 📊 Project Statistics

- **📁 JavaScript files:** $STATS_JS_FILES
- **🌐 HTML files:** $STATS_HTML_FILES
- **📝 Markdown files:** $STATS_MD_FILES
- **📦 Total files:** $STATS_TOTAL_FILES
- **💾 Project size:** $STATS_PROJECT_SIZE
- **🔧 Dependencies:** $STATS_DEPENDENCIES
- **⚡ Scripts:** $STATS_SCRIPTS

## 🧪 Testing

Extension includes complete test suite:

\`\`\`bash
# Run all tests
npm test

# Automated testing
./test_extension.sh

# Manual testing
# See TESTING_INSTRUCTIONS.md
\`\`\`

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](docs/CONTRIBUTING.md)

1. Fork the project
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📜 License

This project uses MIT license. Details in [LICENSE.md](docs/LICENSE.md)

## 👨‍💻 Author

**$AUTHOR** - Certified programmer with 10+ years experience  
Developed using GoIT course knowledge and artificial intelligence

- GitHub: [@VuToV-Mykola](https://github.com/VuToV-Mykola)
- Email: vutov_nikola@icloud.com

## 🚀 Acknowledgments

Special thanks to:
- **GoIT** - for quality programming courses
- **VS Code Team** - for amazing platform
- **Figma** - for powerful API
- **Community** - for support and feedback

---

### 📈 Project Development

Future plans:
- 🎨 More design system integrations
- 🚀 Other framework support
- 🧪 Enhanced testing capabilities
- 📱 Mobile version

**⭐ Star the project if you like it!**
EOF
}

# ✅ Функція генерації німецького контенту
generate_german_content() {
    cat << EOF

## 🚀 Erweiterungsfeatures

### ⚡ Schnelle CSS-Generierung
- **Automatisch** - Erkennt alle CSS-Klassen aus HTML
- **Intelligent** - Erstellt strukturierte Regeln
- **Optimiert** - Minimaler und sauberer Code

### 🎨 Figma-Integration
- **Echte Daten** - Direkte Figma API-Verbindung
- **Canvas-Import** - Laden von Design und Layern
- **Style-Matching** - Automatische Eigenschaftsübertragung
- **Schriften und Bilder** - Import von Design-Ressourcen

### 📱 Responsives CSS
- **Mobile First** - Optimierung für mobile Geräte
- **Breakpoints** - Standard-Haltepunkte
- **Flexbox und Grid** - Moderne Layout-Methoden

## 🛠️ Installation und Verwendung

### 1. Installation vom Marketplace
\`\`\`bash
# Über VS Code Marketplace
1. VS Code öffnen
2. Zu Extensions gehen (Ctrl+Shift+X)
3. Nach "CSS Classes from HTML" suchen
4. Install klicken
\`\`\`

### 2. Lokale Installation
\`\`\`bash
# Projekt klonen
git clone $GITHUB_REPO.git
cd css-classes-from-html

# Abhängigkeiten installieren
npm install

# Erweiterung erstellen
npm run package

# In VS Code installieren
code --install-extension ./builds/css-classes-from-html-$PROJECT_VERSION.vsix
\`\`\`

### 3. Schnellstart
1. **HTML-Datei öffnen** - Beliebige HTML-Datei mit CSS-Klassen
2. **Hotkey drücken** - \`Cmd+Alt+C\` (Mac) oder \`Ctrl+Alt+C\` (Windows)
3. **Ergebnis erhalten** - CSS-Datei automatisch erstellt

## ⌨️ Tastenkombinationen

| Kombination | Aktion | Beschreibung |
|-------------|--------|--------------|
| \`Cmd+Shift+C\` | Hauptmenü | Öffnet vollständiges Menü |
| \`Cmd+Alt+C\` | Schnelle Generierung | Erstellt CSS ohne Menü |
| \`F1\` → "CSS Classes" | Command Palette | Zugriff auf alle Befehle |

## 🎯 Arbeitsmodi

### ⚡ Minimaler Modus
- Schnelle Generierung grundlegender CSS-Klassen
- Keine externen Integrationen
- Perfekt für einfache Projekte

### 🚀 Maximaler Modus
- Vollständige Figma-Integration
- Intelligentes Style-Matching
- Bild- und Schrift-Import

### 📦 Production-Modus
- Optimiertes CSS
- Code-Minifizierung
- Produktionsbereit

## 🔧 Konfiguration

Erweiterung kann über VS Code Settings konfiguriert werden:

\`\`\`json
{
  "cssClassesFromHtml.figmaToken": "your-figma-api-token",
  "cssClassesFromHtml.autoOpenCSS": true,
  "cssClassesFromHtml.includeReset": true,
  "cssClassesFromHtml.includeVariables": true,
  "cssClassesFromHtml.generateResponsive": true
}
\`\`\`

## 📊 Projektstatistiken

- **📁 JavaScript-Dateien:** $STATS_JS_FILES
- **🌐 HTML-Dateien:** $STATS_HTML_FILES
- **📝 Markdown-Dateien:** $STATS_MD_FILES
- **📦 Gesamtdateien:** $STATS_TOTAL_FILES
- **💾 Projektgröße:** $STATS_PROJECT_SIZE
- **🔧 Abhängigkeiten:** $STATS_DEPENDENCIES
- **⚡ Skripte:** $STATS_SCRIPTS

## 🧪 Testen

Erweiterung enthält komplette Test-Suite:

\`\`\`bash
# Alle Tests ausführen
npm test

# Automatisierte Tests
./test_extension.sh

# Manuelles Testen
# Siehe TESTING_INSTRUCTIONS.md
\`\`\`

## 🤝 Mitwirken

Wir begrüßen Beiträge! Siehe [CONTRIBUTING.md](docs/CONTRIBUTING.md)

1. Projekt forken
2. Feature-Branch erstellen
3. Änderungen committen
4. Zum Branch pushen
5. Pull Request erstellen

## 📜 Lizenz

Dieses Projekt verwendet MIT-Lizenz. Details in [LICENSE.md](docs/LICENSE.md)

## 👨‍💻 Autor

**$AUTHOR** - Zertifizierter Programmierer mit 10+ Jahren Erfahrung  
Entwickelt mit GoIT-Kurswissen und künstlicher Intelligenz

- GitHub: [@VuToV-Mykola](https://github.com/VuToV-Mykola)
- Email: vutov_nikola@icloud.com

## 🚀 Danksagungen

Besonderer Dank an:
- **GoIT** - für qualitative Programmierkurse
- **VS Code Team** - für erstaunliche Plattform
- **Figma** - für mächtige API
- **Community** - für Unterstützung und Feedback

---

### 📈 Projektentwicklung

Zukunftspläne:
- 🎨 Mehr Design-System-Integrationen
- 🚀 Unterstützung anderer Frameworks
- 🧪 Erweiterte Testfähigkeiten
- 📱 Mobile Version

**⭐ Bewerten Sie das Projekt, wenn es Ihnen gefällt!**
EOF
}

# ✅ Основна функція генерації документації
generate_documentation() {
    print_step "Генерація документації..."
    
    # Створення українського README.md
    print_step "Створюю README.md (українська)..."
    {
        get_readme_header "README.md"
        generate_ukrainian_content
    } > README.md.new
    mv README.md.new README.md
    print_success "README.md оновлено"
    
    # Створення англійського README.en.md
    print_step "Створюю docs/README.en.md (англійська)..."
    mkdir -p docs
    {
        get_readme_header "docs/README.en.md"
        generate_english_content
    } > docs/README.en.md.new
    mv docs/README.en.md.new docs/README.en.md
    print_success "docs/README.en.md оновлено"
    
    # Створення німецького README.de.md
    print_step "Створюю docs/README.de.md (німецька)..."
    {
        get_readme_header "docs/README.de.md"
        generate_german_content
    } > docs/README.de.md.new
    mv docs/README.de.md.new docs/README.de.md
    print_success "docs/README.de.md оновлено"
}

# ✅ Функція створення додаткових файлів
create_additional_files() {
    print_step "Створення додаткових файлів..."
    
    # GitHub About секція
    cat > github-about.txt << EOF
📌 Українська (160 chars):
Автоматична генерація CSS класів з HTML файлів з інтеграцією Figma. Розроблено завдяки знанням отриманим на курсах GoIT з використанням ШІ.

📌 English (160 chars):
Automatic CSS class generation from HTML files with Figma integration. Developed using knowledge from GoIT courses with AI assistance.

📌 Deutsch (160 chars):
Automatische CSS-Klassen-Generierung aus HTML-Dateien mit Figma-Integration. Entwickelt mit GoIT-Kurswissen und KI-Unterstützung.
EOF
    
    # GitHub Topics
    cat > github-topics.txt << EOF
vscode-extension css-generator html-parser figma-integration frontend-tools web-development css-automation javascript nodejs ui-generator design-tools typescript vs-code extension-development automation figma-api css-classes html-to-css
EOF
    
    # Створюємо файл з інструкціями використання
    cat > USAGE_INSTRUCTIONS.md << 'EOF'
# 📋 ІНСТРУКЦІЇ ВИКОРИСТАННЯ АВТОГЕНЕРАТОРА

## 🚀 Запуск
```bash
./scripts/auto-generate-docs.sh
```

## 📁 Генерується
- **README.md** - Українська версія (корінь проекту)
- **docs/README.en.md** - Англійська версія
- **docs/README.de.md** - Німецька версія
- **github-about.txt** - Описи для GitHub About секції
- **github-topics.txt** - Topics для GitHub репозиторію

## 🔧 Принцип роботи
1. Аналізує структуру проекту
2. Зберігає перші 37 рядків з існуючих README файлів
3. Генерує новий контент з рядка 38 на основі проекту
4. Створює багатомовну документацію

## ⚙️ Налаштування
Змініть змінні в початку скрипту для адаптації під інший проект:
- PROJECT_NAME
- PROJECT_VERSION  
- AUTHOR
- GITHUB_REPO
EOF
    
    print_success "Додаткові файли створені"
}

# ✅ Функція збереження логів
save_logs() {
    print_step "Збереження логів..."
    
    mkdir -p logs
    {
        echo "=== АВТОГЕНЕРАТОР ДОКУМЕНТАЦІЇ ==="
        echo "Дата: $(date)"
        echo "Версія: $PROJECT_VERSION"
        echo "Автор: $AUTHOR"
        echo ""
        echo "=== СТАТИСТИКА ПРОЕКТУ ==="
        echo "JS файлів: $STATS_JS_FILES"
        echo "HTML файлів: $STATS_HTML_FILES"  
        echo "MD файлів: $STATS_MD_FILES"
        echo "Всього файлів: $STATS_TOTAL_FILES"
        echo "Розмір проекту: $STATS_PROJECT_SIZE"
        echo "Залежностей: $STATS_DEPENDENCIES"
        echo "Скриптів: $STATS_SCRIPTS"
        echo ""
        echo "=== ЗГЕНЕРОВАНІ ФАЙЛИ ==="
        echo "✅ README.md (українська)"
        echo "✅ docs/README.en.md (англійська)"
        echo "✅ docs/README.de.md (німецька)"
        echo "✅ github-about.txt"
        echo "✅ github-topics.txt"
        echo "✅ USAGE_INSTRUCTIONS.md"
        echo ""
        echo "=== ЗАВЕРШЕНО ==="
        echo "Час виконання: $(date)"
    } >> logs/auto-docs-generation.log
    
    print_success "Логи збережені в logs/auto-docs-generation.log"
}

# ✅ Функція показу результатів
show_results() {
    print_step "Показ результатів..."
    
    echo -e "${GREEN}
╔══════════════════════════════════════════════════════════════════════════╗
║                            ✅ УСПІШНО ЗАВЕРШЕНО                          ║
╚══════════════════════════════════════════════════════════════════════════╝${NC}"
    
    echo -e "${CYAN}📊 СТАТИСТИКА ПРОЕКТУ:${NC}"
    echo -e "├── 📁 JavaScript файлів: ${YELLOW}$STATS_JS_FILES${NC}"
    echo -e "├── 🌐 HTML файлів: ${YELLOW}$STATS_HTML_FILES${NC}"
    echo -e "├── 📝 Markdown файлів: ${YELLOW}$STATS_MD_FILES${NC}"
    echo -e "├── 📦 Всього файлів: ${YELLOW}$STATS_TOTAL_FILES${NC}"
    echo -e "├── 💾 Розмір проекту: ${YELLOW}$STATS_PROJECT_SIZE${NC}"
    echo -e "├── 🔧 Залежностей: ${YELLOW}$STATS_DEPENDENCIES${NC}"
    echo -e "└── ⚡ Скриптів: ${YELLOW}$STATS_SCRIPTS${NC}"
    
    echo -e "\n${CYAN}📄 ЗГЕНЕРОВАНІ ФАЙЛИ:${NC}"
    echo -e "├── ✅ ${GREEN}README.md${NC} (українська)"
    echo -e "├── ✅ ${GREEN}docs/README.en.md${NC} (англійська)"
    echo -e "├── ✅ ${GREEN}docs/README.de.md${NC} (німецька)"
    echo -e "├── ✅ ${GREEN}github-about.txt${NC} (описи для GitHub)"
    echo -e "├── ✅ ${GREEN}github-topics.txt${NC} (topics для GitHub)"
    echo -e "└── ✅ ${GREEN}USAGE_INSTRUCTIONS.md${NC} (інструкції)"
    
    echo -e "\n${CYAN}📋 НАСТУПНІ КРОКИ:${NC}"
    echo -e "1. 📋 Скопіювати контент з ${YELLOW}github-about.txt${NC} у GitHub About секцію"
    echo -e "2. 🏷️  Додати topics з ${YELLOW}github-topics.txt${NC} у налаштування репозиторію"
    echo -e "3. ✅ Перевірити всі згенеровані README файли"
    echo -e "4. 🚀 Зробити commit та push змін"
    
    echo -e "\n${PURPLE}🤖 Автогенератор документації v$PROJECT_VERSION${NC}"
    echo -e "${PURPLE}Створено з ❤️  by $AUTHOR${NC}"
}

# ✅ Основна функція
main() {
    print_banner
    
    cd "$PROJECT_ROOT" || {
        print_error "Не можу перейти в директорію проекту"
        exit 1
    }
    
    analyze_project
    generate_documentation
    create_additional_files
    save_logs
    show_results
    
    print_success "Автогенерація документації завершена успішно!"
}

# ✅ Обробка помилок
error_handler() {
    print_error "Помилка на рядку $1"
    exit 1
}

trap 'error_handler $LINENO' ERR

# ✅ Запуск скрипту
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi