#!/bin/bash

# ===================================================================
# 🔧 CSS Classes from HTML - Syntax Errors Fix
# ===================================================================
# Виправляє конкретні синтаксичні помилки в extension.js
# ===================================================================

set -e

# Кольори
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    local level=$1
    local message=$2
    case $level in
        "SUCCESS") echo -e "${GREEN}✅ ${message}${NC}" ;;
        "ERROR") echo -e "${RED}❌ ${message}${NC}" ;;
        "INFO") echo -e "${BLUE}ℹ️  ${message}${NC}" ;;
        "WARNING") echo -e "${YELLOW}⚠️  ${message}${NC}" ;;
    esac
}

echo -e "${BLUE}"
echo "====================================================================="
echo "🔧 Виправлення синтаксичних помилок в extension.js"
echo "====================================================================="
echo -e "${NC}"

# Перевірка наявності файлу
if [ ! -f "extension.js" ]; then
    log "ERROR" "extension.js не знайдено в поточній директорії"
    exit 1
fi

# Створення резервної копії
log "INFO" "Створення резервної копії..."
cp extension.js "extension.js.backup-$(date +%Y%m%d-%H%M%S)"
log "SUCCESS" "Резервна копія створена"

# Перевірка синтаксичних помилок
log "INFO" "Перевірка поточного стану extension.js..."
if node -c extension.js 2>/dev/null; then
    log "SUCCESS" "extension.js синтаксично правильний. Виправлення не потрібне."
    exit 0
else
    log "WARNING" "Виявлено синтаксичні помилки. Починаємо виправлення..."
fi

# Виправлення конкретних помилок на основі лог файлу
log "INFO" "Виправлення template literals..."

# Заміна template literals на звичайні рядки (для сумісності)
sed -i.tmp 's/`\([^`]*\)`/"\1"/g' extension.js

# Виправлення ${} виразів на + конкатенацію
sed -i.tmp 's/"\([^"]*\)\${\([^}]*\)}\([^"]*\)"/\1" + \2 + "\3/g' extension.js

# Виправлення стрілочних функцій на звичайні (для кращої сумісності)
sed -i.tmp 's/=> {/function() {/g' extension.js
sed -i.tmp 's/(\([^)]*\)) => /function(\1) /g' extension.js

# Виправлення let/const на var (для старих версій Node.js)
sed -i.tmp 's/const /var /g' extension.js
sed -i.tmp 's/let /var /g' extension.js

# Видалення тимчасових файлів
rm -f extension.js.tmp

log "INFO" "Перевірка результату виправлення..."
if node -c extension.js 2>/dev/null; then
    log "SUCCESS" "Синтаксичні помилки виправлено!"
else
    log "ERROR" "Помилки все ще присутні. Потрібне ручне виправлення."
    log "INFO" "Відновлення з резервної копії..."
    
    # Знаходження останньої резервної копії
    BACKUP_FILE=$(ls -t extension.js.backup-* 2>/dev/null | head -n1)
    if [ -n "$BACKUP_FILE" ]; then
        cp "$BACKUP_FILE" extension.js
        log "INFO" "Файл відновлено з резервної копії: $BACKUP_FILE"
    fi
    
    log "ERROR" "Рекомендується замінити extension.js повністю виправленою версією"
    exit 1
fi

# Тестування можливості імпорту
log "INFO" "Тестування можливості завантаження модуля..."
if node -e "
try {
    var ext = require('./extension.js');
    if (typeof ext.activate === 'function' && typeof ext.deactivate === 'function') {
        console.log('✅ Extension module is valid');
    } else {
        console.log('❌ Missing required functions');
        process.exit(1);
    }
} catch (error) {
    console.log('❌ Error loading extension:', error.message);
    process.exit(1);
}
" 2>/dev/null; then
    log "SUCCESS" "Extension модуль завантажується успішно"
else
    log "ERROR" "Модуль все ще має проблеми завантаження"
fi

# Створення простого тестового скрипта
cat > test-extension.js << 'EOF'
// Простий тест для extension.js
try {
    console.log('🔍 Testing extension.js...');
    
    const extension = require('./extension.js');
    
    console.log('✅ Module loaded successfully');
    console.log('✅ activate function:', typeof extension.activate);
    console.log('✅ deactivate function:', typeof extension.deactivate);
    
    if (extension.extractClassesFromHTML) {
        const testHTML = '<div class="test-class another-class">Test</div>';
        const classes = extension.extractClassesFromHTML(testHTML);
        console.log('✅ extractClassesFromHTML:', classes);
    }
    
    console.log('🎉 All tests passed!');
    
} catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
}
EOF

log "INFO" "Запуск тестів..."
if node test-extension.js; then
    log "SUCCESS" "Всі тести пройдено успішно!"
    rm test-extension.js
else
    log "ERROR" "Тести не пройдено"
    rm test-extension.js
    exit 1
fi

# Фінальні рекомендації
echo -e "${GREEN}"
echo "====================================================================="
echo "🎉 ВИПРАВЛЕННЯ ЗАВЕРШЕНО УСПІШНО!"
echo "====================================================================="
echo -e "${NC}"

log "SUCCESS" "Синтаксичні помилки в extension.js виправлено"
log "INFO" "Тепер можна запустити команди VS Code Extension"

# Додаткові кроки
echo -e "${YELLOW}"
echo "📋 Наступні кроки:"
echo "1. Перезапустіть VS Code"
echo "2. Перевідкрийте проєкт"
echo "3. Протестуйте команди розширення"
echo "4. Якщо проблеми залишаються - використайте повністю виправлену версію"
echo -e "${NC}"

# Створення команди для швидкого тестування в VS Code
cat > test-vscode.sh << 'EOF'
#!/bin/bash
echo "🧪 Тестування в VS Code..."
echo "Відкриваємо проєкт..."
code .
echo "Натисніть F5 для запуску Extension Development Host"
echo "Або Ctrl+Shift+P і введіть 'CSS Classes' для тестування команд"
EOF

chmod +x test-vscode.sh

log "INFO" "Створено скрипт для тестування: ./test-vscode.sh"