#!/usr/bin/env bash
# 🧪 Скрипт для тестування команди css-classes.showMenuFromContext з детальним логуванням

echo "🧪 ТЕСТУВАННЯ КОМАНДИ css-classes.showMenuFromContext З ДЕТАЛЬНИМ ЛОГУВАННЯМ"
echo "=================================================================================="

# Кольори для виводу
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Функції для логування
log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

# 1. Перевірка VS Code
log "1. Перевірка VS Code..."
if ! command -v code &> /dev/null; then
    error "VS Code не знайдено в PATH"
    exit 1
fi
success "VS Code знайдено: $(code --version | head -n1)"

# 2. Перевірка розширення
log "2. Перевірка встановленого розширення..."
EXTENSION_LIST=$(code --list-extensions | grep "vutov-mykola.css-classes-from-html")
if [ -z "$EXTENSION_LIST" ]; then
    error "Розширення не встановлено"
    exit 1
fi
success "Розширення встановлено: $EXTENSION_LIST"

# 3. Створення тестового HTML файлу
log "3. Створення тестового HTML файлу для тестування..."
TEST_HTML="test-command-final.html"
cat > "$TEST_HTML" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Final Command Test</title>
</head>
<body class="page">
    <header class="header">
        <div class="container">
            <nav class="nav">
                <a class="logo" href="./index.html">FINAL TEST</a>
                <ul class="nav-list">
                    <li class="nav-item">
                        <a class="nav-link" href="#home">Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#about">About</a>
                    </li>
                </ul>
            </nav>
        </div>
    </header>
    
    <main class="main">
        <section class="hero">
            <div class="container">
                <h1 class="hero-title">Final Test Page</h1>
                <p class="hero-description">This is the final test page for css-classes.showMenuFromContext command.</p>
                <button class="btn btn-primary">Test Button</button>
            </div>
        </section>
    </main>
</body>
</html>
EOF
success "Тестовий HTML файл створено: $TEST_HTML"

# 4. Запуск діагностики
log "4. Запуск діагностики..."
node debugs/diagnose-showMenuFromContext.js
success "Діагностика завершена"

# 5. Відкриття VS Code
log "5. Відкриття VS Code з тестовим файлом..."
code "$TEST_HTML" &
VSCODE_PID=$!
success "VS Code відкрито з PID: $VSCODE_PID"

# 6. Очікування завантаження
log "6. Очікування 5 секунд для завантаження VS Code..."
sleep 5

# 7. Перевірка процесу
if ps -p $VSCODE_PID > /dev/null; then
    success "VS Code працює (PID: $VSCODE_PID)"
else
    warning "VS Code завершився неочікувано"
fi

# 8. Інструкції для тестування
echo ""
echo "🎯 ІНСТРУКЦІЇ ДЛЯ ТЕСТУВАННЯ КОМАНДИ:"
echo "=================================================="
echo ""
echo "1. 📋 Відкрийте Command Palette:"
echo "   - macOS: Cmd+Shift+P"
echo "   - Windows/Linux: Ctrl+Shift+P"
echo ""
echo "2. 🔍 Спробуйте знайти команду:"
echo "   - Введіть: 'Generate CSS from HTML'"
echo "   - Або: 'css-classes.showMenuFromContext'"
echo "   - Або: 'CSS Classes from HTML'"
echo ""
echo "3. 🎯 Альтернативні способи виклику:"
echo "   - Клік правою кнопкою на HTML файлі в Explorer"
echo "   - Клік правою кнопкою в редакторі HTML файлу"
echo "   - Кнопка 'Quick Generate CSS' в заголовку редактора"
echo ""
echo "4. 📊 Перевірка логів розширення:"
echo "   - View -> Output -> CSS Classes from HTML"
echo "   - Help -> Toggle Developer Tools (Console)"
echo ""
echo "5. 🔧 Якщо команда все ще не знайдена:"
echo "   - Перезавантажте VS Code: Cmd+Shift+P -> 'Developer: Reload Window'"
echo "   - Перевірте статус розширення: Extensions -> CSS Classes from HTML"
echo "   - Перевірте логи в Output панелі"
echo ""

# 9. Моніторинг логів
echo "📊 МОНІТОРИНГ ЛОГІВ РОЗШИРЕННЯ:"
echo "=================================================="
echo ""
echo "Для моніторингу логів запустіть:"
echo "  ./scripts/monitor-extension-logs.sh"
echo ""
echo "Або перевірте вручну:"
echo "  - View -> Output -> CSS Classes from HTML"
echo "  - Help -> Toggle Developer Tools -> Console"
echo ""

# 10. Збереження PID
echo $VSCODE_PID > .vscode_test_pid
success "PID VS Code збережено в .vscode_test_pid"

echo ""
echo "✅ ТЕСТУВАННЯ ЗАВЕРШЕНО"
echo "=================================================="
echo ""
echo "📋 Наступні кроки:"
echo "1. Спробуйте викликати команду 'Generate CSS from HTML'"
echo "2. Перевірте логи в Output панелі"
echo "3. Якщо проблема залишається, запустіть моніторинг логів"
echo ""
echo "🔍 Для детальної діагностики:"
echo "  node debugs/diagnose-showMenuFromContext.js"
echo "  ./scripts/monitor-extension-logs.sh"
echo ""
echo "📞 Якщо проблема критична:"
echo "  - Перевірте логи розширення в Output панелі"
echo "  - Перевірте Console в Developer Tools"
echo "  - Перевірте статус розширення в Extensions панелі"
echo ""

success "Скрипт тестування завершено"
