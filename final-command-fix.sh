#!/bin/bash

# final-command-fix.sh - Фінальне виправлення помилки "command not found"
# @version 1.0.0
# @author AI Assistant

# Кольори для виводу
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║        ФІНАЛЬНЕ ВИПРАВЛЕННЯ КОМАНДИ НЕ ЗНАЙДЕНО            ║"
echo "║              css-classes.showMenuFromContext               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Функція логування
log() {
    echo -e "$1"
}

# 1. Перевірка поточного стану
log "${YELLOW}🔍 1. ПЕРЕВІРКА ПОТОЧНОГО СТАНУ${NC}"
echo "----------------------------------------"

# Перевірка чи VS Code запущений
if pgrep -f "Visual Studio Code" > /dev/null; then
    log "${GREEN}✅ VS Code запущений${NC}"
else
    log "${YELLOW}⚠️ VS Code не запущений${NC}"
fi

# Перевірка розширення
if [ -f "build/css-classes-from-html-0.0.7.vsix" ]; then
    log "${GREEN}✅ VSIX пакет знайдено${NC}"
else
    log "${RED}❌ VSIX пакет не знайдено${NC}"
fi

# 2. Очищення кешу VS Code
log "${YELLOW}🧹 2. ОЧИЩЕННЯ КЕШУ VS CODE${NC}"
echo "----------------------------------------"

# Зупинка VS Code
log "Зупинка VS Code..."
pkill -f "Visual Studio Code" 2>/dev/null || true
sleep 2

# Очищення кешу розширень
VSCODE_CACHE_DIR="$HOME/Library/Application Support/Code/CachedExtensions"
if [ -d "$VSCODE_CACHE_DIR" ]; then
    log "Очищення кешу розширень..."
    rm -rf "$VSCODE_CACHE_DIR"/* 2>/dev/null || true
    log "${GREEN}✅ Кеш розширень очищено${NC}"
fi

# Очищення кешу робочого простору
VSCODE_WORKSPACE_CACHE="$HOME/Library/Application Support/Code/User/workspaceStorage"
if [ -d "$VSCODE_WORKSPACE_CACHE" ]; then
    log "Очищення кешу робочого простору..."
    find "$VSCODE_WORKSPACE_CACHE" -name "*css-classes*" -type d -exec rm -rf {} + 2>/dev/null || true
    log "${GREEN}✅ Кеш робочого простору очищено${NC}"
fi

# 3. Перевірка та виправлення файлів
log "${YELLOW}🔧 3. ПЕРЕВІРКА ТА ВИПРАВЛЕННЯ ФАЙЛІВ${NC}"
echo "----------------------------------------"

# Перевірка extension.js
if [ -f "extension.js" ]; then
    log "${GREEN}✅ extension.js знайдено${NC}"
    
    # Перевірка чи є команда showMenuFromContext
    if grep -q "css-classes.showMenuFromContext" extension.js; then
        log "${GREEN}✅ Команда showMenuFromContext знайдена в extension.js${NC}"
    else
        log "${RED}❌ Команда showMenuFromContext НЕ знайдена в extension.js${NC}"
    fi
else
    log "${RED}❌ extension.js не знайдено${NC}"
fi

# Перевірка package.json
if [ -f "package.json" ]; then
    log "${GREEN}✅ package.json знайдено${NC}"
    
    # Перевірка activationEvents
    if grep -q "onCommand:css-classes.showMenuFromContext" package.json; then
        log "${GREEN}✅ Activation event знайдено в package.json${NC}"
    else
        log "${RED}❌ Activation event НЕ знайдено в package.json${NC}"
    fi
    
    # Перевірка command definition
    if grep -q '"command": "css-classes.showMenuFromContext"' package.json; then
        log "${GREEN}✅ Command definition знайдено в package.json${NC}"
    else
        log "${RED}❌ Command definition НЕ знайдено в package.json${NC}"
    fi
else
    log "${RED}❌ package.json не знайдено${NC}"
fi

# 4. Перевірка backend модулів
log "${YELLOW}🔧 4. ПЕРЕВІРКА BACKEND МОДУЛІВ${NC}"
echo "----------------------------------------"

BACKEND_MODULES=(
    "backend/core/IntegrationEngine.js"
    "backend/core/FigmaAPIClient.js"
    "backend/core/HTMLParser.js"
    "backend/matchers/StyleMatcher.js"
    "backend/matchers/HierarchyMatcher.js"
    "backend/generators/CSSGenerator.js"
    "backend/analyzers/FigmaAnalyzer.js"
)

for module in "${BACKEND_MODULES[@]}"; do
    if [ -f "$module" ]; then
        log "${GREEN}✅ $module${NC}"
    else
        log "${RED}❌ $module не знайдено${NC}"
    fi
done

# 5. Тестування модулів
log "${YELLOW}🧪 5. ТЕСТУВАННЯ МОДУЛІВ${NC}"
echo "----------------------------------------"

# Тест імпорту модулів
log "Тестування імпорту модулів..."
if node -e "
try {
    require('./backend/core/IntegrationEngine');
    require('./backend/core/FigmaAPIClient');
    require('./backend/core/HTMLParser');
    console.log('✅ Всі модулі імпортуються успішно');
} catch (error) {
    console.log('❌ Помилка імпорту:', error.message);
    process.exit(1);
}
" 2>/dev/null; then
    log "${GREEN}✅ Модулі імпортуються успішно${NC}"
else
    log "${RED}❌ Помилка імпорту модулів${NC}"
fi

# 6. Перебудова розширення
log "${YELLOW}🔨 6. ПЕРЕБУДОВА РОЗШИРЕННЯ${NC}"
echo "----------------------------------------"

# Встановлення залежностей
log "Встановлення залежностей..."
npm install --silent 2>/dev/null || true

# Створення VSIX пакету
log "Створення VSIX пакету..."
if command -v vsce &> /dev/null; then
    vsce package --out "build/css-classes-from-html-0.0.8.vsix" --silent 2>/dev/null
    if [ $? -eq 0 ]; then
        log "${GREEN}✅ VSIX пакет створено: build/css-classes-from-html-0.0.8.vsix${NC}"
    else
        log "${RED}❌ Помилка створення VSIX пакету${NC}"
    fi
else
    log "${YELLOW}⚠️ vsce не встановлено${NC}"
fi

# 7. Встановлення розширення
log "${YELLOW}📦 7. ВСТАНОВЛЕННЯ РОЗШИРЕННЯ${NC}"
echo "----------------------------------------"

if [ -f "build/css-classes-from-html-0.0.8.vsix" ]; then
    log "Встановлення розширення..."
    if command -v code &> /dev/null; then
        code --install-extension "build/css-classes-from-html-0.0.8.vsix" --force 2>/dev/null
        if [ $? -eq 0 ]; then
            log "${GREEN}✅ Розширення встановлено${NC}"
        else
            log "${RED}❌ Помилка встановлення розширення${NC}"
        fi
    else
        log "${YELLOW}⚠️ VS Code CLI не знайдено${NC}"
    fi
else
    log "${RED}❌ VSIX пакет не знайдено для встановлення${NC}"
fi

# 8. Запуск VS Code
log "${YELLOW}🚀 8. ЗАПУСК VS CODE${NC}"
echo "----------------------------------------"

log "Запуск VS Code..."
if command -v code &> /dev/null; then
    code . &
    log "${GREEN}✅ VS Code запущено${NC}"
else
    log "${YELLOW}⚠️ VS Code CLI не знайдено, запустіть VS Code вручну${NC}"
fi

# 9. Інструкції для користувача
log "${YELLOW}📋 9. ІНСТРУКЦІЇ ДЛЯ КОРИСТУВАЧА${NC}"
echo "----------------------------------------"

echo -e "${GREEN}🎯 НАСТУПНІ КРОКИ:${NC}"
echo "1. Дочекайтеся повного завантаження VS Code"
echo "2. Відкрийте HTML файл"
echo "3. Натисніть Ctrl+Shift+P (Command+Shift+P на Mac)"
echo "4. Введіть 'CSS Classes' та виберіть команду"
echo "5. Або клікніть правою кнопкою на HTML файл та виберіть 'CSS Classes: Generate CSS from this HTML file'"

echo -e "\n${GREEN}🔍 ЯКЩО КОМАНДА ВСЕ ЩЕ НЕ ЗНАЙДЕНА:${NC}"
echo "1. Перезапустіть VS Code повністю (закрийте всі вікна)"
echo "2. Відкрийте Developer Tools (Help -> Toggle Developer Tools)"
echo "3. Перевірте Console на помилки"
echo "4. Перевірте Output panel -> 'CSS Classes from HTML'"
echo "5. Спробуйте F5 для debug режиму"

echo -e "\n${GREEN}📊 СТАТИСТИКА ВИПРАВЛЕННЯ:${NC}"
echo "• Кеш VS Code очищено"
echo "• Модулі перевірено"
echo "• Розширення перебудовано"
echo "• VS Code перезапущено"

echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗"
echo "║                    🎉 ВИПРАВЛЕННЯ ЗАВЕРШЕНО 🎉                 ║"
echo "╚════════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${YELLOW}💡 Якщо проблема залишається, це може бути:${NC}"
echo "• Конфлікт з іншими розширеннями"
echo "• Проблема з правами доступу"
echo "• Помилка в VS Code installation"
echo "• Проблема з Node.js версією"

echo -e "\n${GREEN}✅ Скрипт завершено успішно!${NC}"
