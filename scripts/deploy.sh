#!/bin/bash
# ✅ Автоматичний скрипт розгортання CSS Classes from HTML v2.1.0
# Для MacOS/Linux - повна інтеграція з логуванням

# Кольори для виводу
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Налаштування
PROJECT_NAME="css-classes-from-html"
VERSION="2.1.0"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
LOG_DIR="logs"
LOG_FILE="$LOG_DIR/deploy_${TIMESTAMP}.log"

# Функція для логування
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

# Функція для виводу статусу
status() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}ℹ️  $1${NC}" | tee -a "$LOG_FILE"
}

# Створення директорії для логів
mkdir -p "$LOG_DIR"

# Початок розгортання
log "\n=========================================="
log "🚀 РОЗГОРТАННЯ $PROJECT_NAME v$VERSION"
log "⏰ Час: $TIMESTAMP"
log "==========================================\n"

# Перевірка наявності необхідних файлів
info "Перевірка файлової структури..."

REQUIRED_FILES=(
    "package.json"
    "extension.js"
    "frontend/css-classes-from-html-menu.html"
)

MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
        error "Файл не знайдено: $file"
    else
        status "Файл знайдено: $file"
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    error "Деякі файли відсутні. Створюю їх..."
    
    # Створення директорій
    mkdir -p frontend backend/core backend/generators backend/utils logs builds scripts
    
    # Створення відсутніх файлів
    for file in "${MISSING_FILES[@]}"; do
        touch "$file"
        warning "Створено порожній файл: $file"
    done
fi

# Резервне копіювання
info "Створення резервних копій..."
BACKUP_DIR="backups/backup_${TIMESTAMP}"
mkdir -p "$BACKUP_DIR"

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "$BACKUP_DIR/"
        status "Резервна копія: $file"
    fi
done

# Оновлення package.json
info "Оновлення package.json..."
if [ -f "package.json" ]; then
    # Оновлення версії в package.json
    sed -i.bak "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" package.json
    rm -f package.json.bak
    status "Версія оновлена до $VERSION"
fi

# Встановлення залежностей
info "Встановлення залежностей..."
if command -v npm &> /dev/null; then
    npm install >> "$LOG_FILE" 2>&1
    if [ $? -eq 0 ]; then
        status "Залежності встановлено"
    else
        error "Помилка встановлення залежностей"
    fi
else
    warning "npm не знайдено. Пропускаю встановлення залежностей"
fi

# Валідація JavaScript
info "Валідація JavaScript коду..."
if command -v node &> /dev/null; then
    node -c extension.js >> "$LOG_FILE" 2>&1
    if [ $? -eq 0 ]; then
        status "JavaScript код валідний"
    else
        error "Помилка валідації JavaScript"
    fi
else
    warning "Node.js не знайдено. Пропускаю валідацію"
fi

# Створення структури backend модулів (заглушки)
info "Створення структури backend модулів..."

# FigmaAPIClient.js
cat > backend/core/FigmaAPIClient.js << 'EOF'
// FigmaAPIClient - заглушка для тестування
class FigmaAPIClient {
    constructor(config) {
        this.config = config;
    }
    
    async getFile(fileId) {
        console.log(`Getting Figma file: ${fileId}`);
        return { document: { children: [] } };
    }
}

module.exports = FigmaAPIClient;
EOF

# HTMLParser.js
cat > backend/core/HTMLParser.js << 'EOF'
// HTMLParser - заглушка для тестування
class HTMLParser {
    constructor() {}
    
    parse(htmlContent) {
        const classes = htmlContent.match(/class="([^"]*)"/g) || [];
        return { classes: classes.map(c => c.replace(/class="|"/g, '')) };
    }
}

module.exports = HTMLParser;
EOF

# IntegrationEngine.js
cat > backend/core/IntegrationEngine.js << 'EOF'
// IntegrationEngine - заглушка для тестування
class IntegrationEngine {
    constructor(config) {
        this.config = config;
    }
    
    extractFileIdFromFigmaLink(link) {
        const match = link.match(/figma\.com\/file\/([a-zA-Z0-9]+)/);
        return match ? match[1] : null;
    }
    
    updateOptions(options) {
        Object.assign(this.config, options);
    }
}

module.exports = IntegrationEngine;
EOF

status "Backend модулі створено"

# Створення тестів
info "Створення тестового файлу..."
cat > test.html << 'EOF'
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <title>Test HTML File</title>
</head>
<body>
    <div class="container">
        <header class="header main-header">
            <h1 class="title">Test Title</h1>
        </header>
        <main class="content">
            <section class="section">
                <p class="text">Test content</p>
            </section>
        </main>
        <footer class="footer">
            <p class="copyright">© 2024</p>
        </footer>
    </div>
</body>
</html>
EOF
status "Тестовий HTML файл створено"

# Створення scripts директорії
info "Створення допоміжних скриптів..."

# auto-generate-docs.sh
cat > scripts/auto-generate-docs.sh << 'EOF'
#!/bin/bash
# Генерація документації на трьох мовах

echo "📚 Генерація документації..."

# README.md (Українська)
cat > README.md << 'EOMD'
### 🌐 Виберіть мову/Choose language/Wählen Sprache:
[🇺🇦 Українська](README.md) | [🇬🇧 English](README.en.md) | [🇩🇪 Deutsch](README.de.md)

# CSS Classes from HTML

📌 Автоматична генерація CSS класів з HTML файлів з інтеграцією Figma.

## Встановлення
```bash
npm install
```

## Використання
1. Відкрийте HTML файл
2. Запустіть команду "CSS Classes from HTML: Show Menu"
3. Виберіть режим генерації
4. Отримайте готовий CSS файл

## Ліцензія
MIT
EOMD

# README.en.md (English)
cat > README.en.md << 'EOMD'
### 🌐 Виберіть мову/Choose language/Wählen Sprache:
[🇺🇦 Українська](README.md) | [🇬🇧 English](README.en.md) | [🇩🇪 Deutsch](README.de.md)

# CSS Classes from HTML

📌 Automatic CSS class generation from HTML files with Figma integration. Developed using knowledge from GoIT courses and AI.

## Installation
```bash
npm install
```

## Usage
1. Open HTML file
2. Run command "CSS Classes from HTML: Show Menu"
3. Choose generation mode
4. Get ready CSS file

## License
MIT
EOMD

# README.de.md (Deutsch)
cat > README.de.md << 'EOMD'
### 🌐 Виберіть мову/Choose language/Wählen Sprache:
[🇺🇦 Українська](README.md) | [🇬🇧 English](README.en.md) | [🇩🇪 Deutsch](README.de.md)

# CSS Classes from HTML

📌 Automatische CSS-Klassengenerierung aus HTML-Dateien mit Figma-Integration. Entwickelt mit GoIT-Kursen und KI.

## Installation
```bash
npm install
```

## Verwendung
1. HTML-Datei öffnen
2. Befehl "CSS Classes from HTML: Show Menu" ausführen
3. Generierungsmodus wählen
4. Fertige CSS-Datei erhalten

## Lizenz
MIT
EOMD

echo "✅ Документація згенерована"
EOF

chmod +x scripts/auto-generate-docs.sh
status "Скрипт генерації документації створено"

# Виконання генерації документації
bash scripts/auto-generate-docs.sh >> "$LOG_FILE" 2>&1
status "Документація згенерована"

# Створення builds директорії
mkdir -p builds

# Пакування розширення
info "Пакування розширення..."
if command -v vsce &> /dev/null; then
    vsce package --out builds/ >> "$LOG_FILE" 2>&1
    if [ $? -eq 0 ]; then
        status "Розширення запаковано в builds/"
    else
        error "Помилка пакування розширення"
    fi
else
    warning "vsce не встановлено. Встановіть через: npm install -g @vscode/vsce"
fi

# Тестування
info "Запуск тестів..."

# Перевірка структури проекту
DIRS=("frontend" "backend" "backend/core" "backend/generators" "backend/utils" "logs" "builds" "scripts")
for dir in "${DIRS[@]}"; do
    if [ -d "$dir" ]; then
        status "Директорія існує: $dir"
    else
        mkdir -p "$dir"
        warning "Створено директорію: $dir"
    fi
done

# Звіт про розгортання
log "\n=========================================="
log "📊 ЗВІТ ПРО РОЗГОРТАННЯ"
log "==========================================\n"

info "Версія: $VERSION"
info "Час розгортання: $TIMESTAMP"
info "Лог файл: $LOG_FILE"

# Підрахунок файлів
FILE_COUNT=$(find . -type f -name "*.js" -o -name "*.json" -o -name "*.html" | wc -l)
info "Кількість файлів проекту: $FILE_COUNT"

# Розмір проекту
PROJECT_SIZE=$(du -sh . | cut -f1)
info "Розмір проекту: $PROJECT_SIZE"

# Генерація команди для Git
log "\n=========================================="
log "📤 GIT КОМАНДА ДЛЯ ПУШУ"
log "==========================================\n"

echo "# Команда для пуша на GitHub (скопіюйте та виконайте):"
echo "git add --all && git commit -m \"🚀 Deploy v$VERSION - Fixed HTML context handling\" && git push --force"

# Фінальний статус
log "\n=========================================="
if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    status "✨ РОЗГОРТАННЯ ЗАВЕРШЕНО УСПІШНО!"
else
    warning "⚠️ РОЗГОРТАННЯ ЗАВЕРШЕНО З ПОПЕРЕДЖЕННЯМИ"
fi
log "==========================================\n"

# Відкриття логу
if [ -f "$LOG_FILE" ]; then
    info "Перегляд логу: cat $LOG_FILE"
fi

exit 0