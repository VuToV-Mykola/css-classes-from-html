#!/bin/bash
# deploy.sh - Автоматичне розгортання CSS Classes from HTML
# @version 3.0.0
# @author VuToV-Mykola

# Кольори для виводу
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Змінні
PROJECT_NAME="css-classes-from-html"
VERSION="0.0.7"
LOG_DIR="log"
OUTPUT_DIR="output"
BUILD_DIR="build"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/deploy_$TIMESTAMP.log"

# Функція логування
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

# Функція перевірки помилок
check_error() {
    if [ $? -ne 0 ]; then
        log "${RED}❌ Помилка: $1${NC}"
        exit 1
    fi
}

# Заголовок
clear
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║          CSS Classes from HTML - Deployment Script          ║"
echo "║                      Version: $VERSION                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Створення директорій
log "${YELLOW}📁 Створення необхідних директорій...${NC}"
mkdir -p "$LOG_DIR" "$OUTPUT_DIR" "$BUILD_DIR" ".vscode/css-classes-config"
check_error "Не вдалось створити директорії"

# Перевірка залежностей
log "${YELLOW}🔍 Перевірка системних залежностей...${NC}"

# Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    log "${GREEN}✓ Node.js знайдено: $NODE_VERSION${NC}"
else
    log "${RED}❌ Node.js не встановлено${NC}"
    exit 1
fi

# npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    log "${GREEN}✓ npm знайдено: $NPM_VERSION${NC}"
else
    log "${RED}❌ npm не встановлено${NC}"
    exit 1
fi

# VS Code
if command -v code &> /dev/null; then
    CODE_VERSION=$(code --version | head -n 1)
    log "${GREEN}✓ VS Code знайдено: $CODE_VERSION${NC}"
else
    log "${YELLOW}⚠️ VS Code CLI не знайдено (опціонально)${NC}"
fi

# Встановлення npm залежностей
log "${YELLOW}📦 Встановлення npm залежностей...${NC}"
npm install --production 2>&1 | tee -a "$LOG_FILE"
check_error "Не вдалось встановити npm залежності"

# Встановлення dev залежностей
log "${YELLOW}📦 Встановлення dev залежностей...${NC}"
npm install --save-dev @types/vscode @vscode/test-electron @vscode/vsce 2>&1 | tee -a "$LOG_FILE"
check_error "Не вдалось встановити dev залежності"

# Перевірка основних файлів
# log "${YELLOW}📝 Перевірка структури проєкту...${NC}"

# REQUIRED_FILES=(
#     "extension.js"
#     "package.json"
#     "frontend/css-classes-from-html-menu.html"
#     "frontend/configurationManager.js"
#     "core/FigmaAPIClient.js"
#     "core/HTMLParser.js"
#     "core/StyleMatcher.js"
#     "core/CSSGenerator.js"
# )

# for file in "${REQUIRED_FILES[@]}"; do
#     if [ -f "$file" ]; then
#         log "${GREEN}✓ $file${NC}"
#     else
#         log "${RED}❌ Відсутній файл: $file${NC}"
#         exit 1
#     fi
# done

# Перевірка синтаксису JavaScript
log "${YELLOW}🔧 Перевірка синтаксису JavaScript...${NC}"
for file in extension.js core/*.js frontend/*.js backend/*.js; do
    if [ -f "$file" ]; then
        node -c "$file" 2>&1 | tee -a "$LOG_FILE"
        if [ $? -eq 0 ]; then
            log "${GREEN}✓ Синтаксис $file валідний${NC}"
        else
            log "${RED}❌ Помилка синтаксису в $file${NC}"
            exit 1
        fi
    fi
done

# Створення тестового HTML файлу
log "${YELLOW}📄 Створення тестового HTML файлу...${NC}"
cat > "test/test.html" << 'EOF'
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <title>Test HTML</title>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1 class="title">Test Title</h1>
        </header>
        <main class="main-content">
            <section class="hero-section">
                <h2 class="hero-title">Hero Title</h2>
                <p class="hero-text">Hero description text</p>
                <button class="btn btn-primary">Click Me</button>
            </section>
            <div class="card-container">
                <div class="card">
                    <h3 class="card-title">Card Title</h3>
                    <p class="card-text">Card content</p>
                </div>
            </div>
        </main>
        <footer class="footer">
            <p class="footer-text">Footer text</p>
        </footer>
    </div>
</body>
</html>
EOF
check_error "Не вдалось створити тестовий HTML файл"

# Запуск тестів
log "${YELLOW}🧪 Запуск тестів...${NC}"
if [ -f "test/runTest.js" ]; then
    node test/runTest.js 2>&1 | tee -a "$LOG_FILE"
    if [ $? -eq 0 ]; then
        log "${GREEN}✓ Тести пройдено успішно${NC}"
    else
        log "${YELLOW}⚠️ Деякі тести не пройдено${NC}"
    fi
fi

# Створення VSIX пакету (якщо встановлено vsce)
if command -v vsce &> /dev/null; then
    log "${YELLOW}📦 Створення VSIX пакету...${NC}"
    vsce package --out "$BUILD_DIR/${PROJECT_NAME}-${VERSION}.vsix" 2>&1 | tee -a "$LOG_FILE"
    if [ $? -eq 0 ]; then
        log "${GREEN}✓ VSIX пакет створено: $BUILD_DIR/${PROJECT_NAME}-${VERSION}.vsix${NC}"
    else
        log "${YELLOW}⚠️ Не вдалось створити VSIX пакет${NC}"
    fi
else
    log "${YELLOW}⚠️ vsce не встановлено. Встановіть за допомогою: npm install -g @vscode/vsce${NC}"
fi

# Створення backup
log "${YELLOW}💾 Створення backup...${NC}"
BACKUP_NAME="${PROJECT_NAME}_backup_${TIMESTAMP}.tar.gz"
tar -czf "$BUILD_DIR/$BACKUP_NAME" \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=build \
    --exclude=output \
    --exclude=log \
    . 2>&1 | tee -a "$LOG_FILE"
check_error "Не вдалось створити backup"
log "${GREEN}✓ Backup створено: $BUILD_DIR/$BACKUP_NAME${NC}"

# Генерація звіту
log "${YELLOW}📊 Генерація звіту...${NC}"
REPORT_FILE="$LOG_DIR/deployment_report_${TIMESTAMP}.txt"
cat > "$REPORT_FILE" << EOF
=====================================
CSS Classes from HTML - Deployment Report
=====================================
Date: $(date)
Version: $VERSION
Node.js: $NODE_VERSION
npm: $NPM_VERSION

Files Status:
$(for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file"
    else
        echo "✗ $file"
    fi
done)

Directories:
$(ls -la | grep "^d")

Package Info:
$(npm list --depth=0 2>/dev/null || echo "No packages info available")

=====================================
EOF
log "${GREEN}✓ Звіт збережено: $REPORT_FILE${NC}"

# Фінальна статистика
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                   🎉 Deployment Complete 🎉                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

log "${GREEN}📊 Статистика:${NC}"
log "   • Файлів перевірено: ${#REQUIRED_FILES[@]}"
log "   • Логи збережено в: $LOG_FILE"
log "   • Звіт збережено в: $REPORT_FILE"
if [ -f "$BUILD_DIR/${PROJECT_NAME}-${VERSION}.vsix" ]; then
    log "   • VSIX пакет: $BUILD_DIR/${PROJECT_NAME}-${VERSION}.vsix"
fi
log "   • Backup: $BUILD_DIR/$BACKUP_NAME"

echo ""
log "${YELLOW}📋 Наступні кроки:${NC}"
log "1. Відкрийте VS Code"
log "2. Натисніть F5 для запуску розширення в debug режимі"
log "3. У новому вікні VS Code відкрийте HTML файл"
log "4. Натисніть Ctrl+Shift+P та виберіть 'CSS Classes: Show Main Menu'"

echo ""
log "${GREEN}✅ Deployment завершено успішно!${NC}"

# Запит на відкриття VS Code
read -p "Відкрити проєкт у VS Code? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    code .
fi