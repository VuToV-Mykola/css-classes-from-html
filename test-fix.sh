#!/bin/bash
# Тестовий скрипт для перевірки виправлень CSS Classes from HTML (сучасні пакети)

echo "🧪 Тестування виправлень CSS Classes from HTML"
echo "=============================================="

# Створюємо директорію для логів
LOG_DIR="./logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/test-$(date +%Y%m%d-%H%M%S).log"

# Функція для логування
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Функція перевірки файлу
check_file() {
    if [ -f "$1" ]; then
        log "✓ $1 знайдено"
        return 0
    else
        log "❌ $1 не знайдено"
        return 1
    fi
}

# Функція перевірки синтаксису
check_syntax() {
    if node -c "$1" 2>> "$LOG_FILE"; then
        log "✓ Синтаксис $1 валідний"
        return 0
    else
        log "❌ Помилка синтаксису в $1"
        return 1
    fi
}

# Функція перевірки залежностей
check_dependencies() {
    if npm list "$1" > /dev/null 2>&1; then
        log "✓ $1 доступний"
        return 0
    else
        log "❌ $1 не встановлено"
        return 1
    fi
}

# Початок тестування
log "Початок тестування виправлень"

# Перевірка наявності файлів
log "Перевірка наявності файлів..."
check_file "extension.js"
check_file "frontend/css-classes-from-html-menu.html"
check_file "frontend/configurationManager.js"

# Перевірка синтаксису
log "Перевірка синтаксису..."
check_syntax "extension.js"

# Перевірка залежностей
log "Перевірка залежностей..."

# VSCode API
if npm list @types/vscode &> /dev/null && npm list @vscode/test-electron &> /dev/null; then
    log "✓ VS Code API встановлено"
else
    log "❌ VS Code API не встановлено"
    log "Спробуйте встановити вручну: npm install --save-dev @types/vscode @vscode/test-electron"
fi

# node-fetch
check_dependencies "node-fetch"

# jsdom
check_dependencies "jsdom"

# mkdirp
check_dependencies "mkdirp"

# glob
check_dependencies "glob"

# Перевірка структури проекту
log "Перевірка структури проекту..."
if [ -d "core" ]; then
    log "✓ Директорія core знайдена"
    check_file "core/FigmaAPIClient.js"
else
    log "❌ Директорія core не знайдена"
fi

if [ -d "frontend" ]; then
    log "✓ Директорія frontend знайдена"
else
    log "❌ Директорія frontend не знайдена"
fi

# Перевірка конфігураційних файлів
log "Перевірка конфігураційних файлів..."
if [ -f "package.json" ]; then
    log "✓ package.json знайдено"
    if grep -q "css-classes.showMenu" package.json; then
        log "✓ Команда showMenu зареєстрована в package.json"
    else
        log "❌ Команда showMenu не знайдена в package.json"
    fi
else
    log "❌ package.json не знайдено"
fi

# Фінальний звіт
echo ""
echo "📊 РЕЗУЛЬТАТИ ТЕСТУВАННЯ"
echo "========================"
PASS_COUNT=$(grep -c "✓" "$LOG_FILE")
FAIL_COUNT=$(grep -c "❌" "$LOG_FILE")

echo "Успішні перевірки: $PASS_COUNT"
echo "Невдалі перевірки: $FAIL_COUNT"

if [ $FAIL_COUNT -eq 0 ]; then
    echo "🎉 Всі перевірки пройдено успішно!"
else
    echo "⚠️  Знайдено помилки. Перевірте лог-файл: $LOG_FILE"
    exit 1
fi

# Інструкція для користувача
echo ""
echo "📋 ІНСТРУКЦІЯ З ЗАПУСКУ"
echo "======================="
echo "1. Перезавантажте VS Code: Ctrl+Shift+P → 'Developer: Reload Window'"
echo "2. Відкрийте HTML файл"
echo "3. Клік правою кнопкою → 'CSS Classes: Show Main Menu'"
echo "4. Перевірте завантаження/збереження налаштувань"
echo "5. Спробуйте згенерувати CSS"

echo ""
echo "📋 ЛОГУВАННЯ"
echo "============"
echo "Логи будуть доступні у: Output → 'CSS Classes from HTML'"
echo "Детальні логи: $LOG_FILE"

log "Тестування завершено"
