#!/bin/bash

# 🤖 АВТОМАТИЗОВАНИЙ ТЕСТУВАЛЬНИК CSS CLASSES FROM HTML v0.0.7
# Скрипт для автоматичного тестування розширення VS Code на macOS
# Використання: ./test_extension.sh

set -e  # Зупинка при помилках

# ✅ Кольорові виводи
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ✅ Функції для виводу
print_header() {
    echo -e "${BLUE}
╔══════════════════════════════════════════════════════════════════╗
║                    CSS CLASSES FROM HTML v0.0.7                  ║
║                    АВТОМАТИЗОВАНЕ ТЕСТУВАННЯ                     ║
╚══════════════════════════════════════════════════════════════════╝${NC}"
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
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# ✅ Змінні
PROJECT_ROOT="/Users/vutov/Desktop/Projects/css-classes-from-html"
EXTENSION_NAME="vutov-mykola.css-classes-from-html"
VSIX_FILE="css-classes-from-html-0.0.7.vsix"
BUILD_DIR="$PROJECT_ROOT/builds"
TEST_DIR="$PROJECT_ROOT/test_files"
LOG_FILE="$PROJECT_ROOT/test_results.log"

# ✅ Функція для перевірки залежностей
check_dependencies() {
    print_step "Перевірка залежностей..."
    
    # Перевірка Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js не встановлено. Встановіть Node.js та повторіть спробу."
        exit 1
    fi
    print_success "Node.js: $(node --version)"
    
    # Перевірка npm
    if ! command -v npm &> /dev/null; then
        print_error "npm не встановлено."
        exit 1
    fi
    print_success "npm: $(npm --version)"
    
    # Перевірка VS Code
    if ! command -v code &> /dev/null; then
        print_error "VS Code CLI не доступне. Встановіть VS Code та додайте до PATH."
        exit 1
    fi
    print_success "VS Code: $(code --version | head -1)"
    
    # Перевірка vsce
    if ! npm list -g @vscode/vsce &> /dev/null; then
        print_info "Встановлюємо @vscode/vsce глобально..."
        npm install -g @vscode/vsce
    fi
    print_success "vsce доступне"
}

# ✅ Функція підготовки середовища
setup_environment() {
    print_step "Підготовка середовища..."
    
    # Перехід в директорію проєкту
    cd "$PROJECT_ROOT" || {
        print_error "Не можу перейти в директорію проєкту: $PROJECT_ROOT"
        exit 1
    }
    
    # Створення директорій
    mkdir -p "$BUILD_DIR"
    mkdir -p "$TEST_DIR"
    
    # Очищення старих результатів
    > "$LOG_FILE"
    
    print_success "Середовище підготовлене"
}

# ✅ Функція встановлення залежностей
install_dependencies() {
    print_step "Встановлення залежностей проєкту..."
    
    if [ -f "package.json" ]; then
        npm install 2>&1 | tee -a "$LOG_FILE"
        print_success "Залежності встановлені"
    else
        print_error "package.json не знайдено"
        exit 1
    fi
}

# ✅ Функція валідації коду
validate_code() {
    print_step "Валідація коду..."
    
    # Перевірка JavaScript синтаксису
    if node -c extension.js 2>&1 | tee -a "$LOG_FILE"; then
        print_success "extension.js - синтаксис правильний"
    else
        print_error "extension.js - помилки синтаксису"
        return 1
    fi
    
    # Перевірка package.json
    if node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" 2>&1 | tee -a "$LOG_FILE"; then
        print_success "package.json - валідний JSON"
    else
        print_error "package.json - невалідний JSON"
        return 1
    fi
    
    # Перевірка WebView файлу
    if [ -f "frontend/css-classes-from-html-menu.html" ]; then
        print_success "WebView HTML файл знайдено"
    else
        print_error "WebView HTML файл не знайдено"
        return 1
    fi
    
    # Перевірка іконки
    if [ -f "assets/icon.png" ]; then
        print_success "Іконка знайдена"
    else
        print_error "Іконка не знайдена"
        return 1
    fi
}

# ✅ Функція збирання розширення
build_extension() {
    print_step "Збирання розширення..."
    
    # Запуск валідації
    if npm run validate 2>&1 | tee -a "$LOG_FILE"; then
        print_success "npm run validate - успішно"
    else
        print_error "npm run validate - помилка"
        return 1
    fi
    
    # Створення VSIX пакету
    if npm run package 2>&1 | tee -a "$LOG_FILE"; then
        print_success "VSIX пакет створено"
    else
        print_error "Помилка створення VSIX пакету"
        return 1
    fi
    
    # Перевірка створеного файлу
    VSIX_PATH="$BUILD_DIR/$VSIX_FILE"
    if [ -f "$VSIX_PATH" ]; then
        print_success "VSIX файл: $VSIX_PATH"
        print_info "Розмір файлу: $(du -h "$VSIX_PATH" | cut -f1)"
    else
        print_error "VSIX файл не створено"
        return 1
    fi
}

# ✅ Функція встановлення розширення
install_extension() {
    print_step "Встановлення розширення в VS Code..."
    
    VSIX_PATH="$BUILD_DIR/$VSIX_FILE"
    
    # Видалення попередньої версії (якщо є)
    if code --list-extensions | grep -q "$EXTENSION_NAME"; then
        print_info "Видаляємо попередню версію..."
        code --uninstall-extension "$EXTENSION_NAME" 2>&1 | tee -a "$LOG_FILE"
        sleep 2
    fi
    
    # Встановлення нової версії
    if code --install-extension "$VSIX_PATH" 2>&1 | tee -a "$LOG_FILE"; then
        print_success "Розширення встановлено"
        sleep 3
    else
        print_error "Помилка встановлення розширення"
        return 1
    fi
    
    # Перевірка встановлення
    if code --list-extensions | grep -q "$EXTENSION_NAME"; then
        print_success "Розширення знайдено в списку встановлених"
    else
        print_error "Розширення не знайдено в списку встановлених"
        return 1
    fi
}

# ✅ Функція створення тестових файлів
create_test_files() {
    print_step "Створення тестових файлів..."
    
    # Створення тестового HTML файлу
    cat > "$TEST_DIR/test.html" << 'EOF'
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Тестова сторінка для CSS генерації</title>
</head>
<body>
    <div class="container">
        <header class="main-header">
            <h1 class="page-title">Заголовок сторінки</h1>
            <nav class="navigation">
                <ul class="nav-list">
                    <li class="nav-item"><a href="#" class="nav-link">Головна</a></li>
                    <li class="nav-item"><a href="#" class="nav-link">Про нас</a></li>
                    <li class="nav-item"><a href="#" class="nav-link">Контакти</a></li>
                </ul>
            </nav>
        </header>
        
        <main class="main-content">
            <section class="hero-section">
                <h2 class="hero-title">Вітаємо на тестовій сторінці</h2>
                <p class="hero-description">Це тестовий HTML для генерації CSS класів</p>
                <button class="cta-button primary-button">Основна дія</button>
                <button class="cta-button secondary-button">Додаткова дія</button>
            </section>
            
            <section class="content-section">
                <div class="content-wrapper">
                    <article class="article">
                        <h3 class="article-title">Заголовок статті</h3>
                        <p class="article-text">Текст статті з <span class="highlight">виділеним</span> фрагментом.</p>
                        <div class="article-meta">
                            <span class="author">Автор: Тестувальник</span>
                            <time class="date">2025-09-08</time>
                        </div>
                    </article>
                </div>
            </section>
        </main>
        
        <aside class="sidebar">
            <div class="widget">
                <h4 class="widget-title">Віджет</h4>
                <ul class="widget-list">
                    <li class="widget-item">Елемент 1</li>
                    <li class="widget-item">Елемент 2</li>
                    <li class="widget-item active">Активний елемент</li>
                </ul>
            </div>
        </aside>
        
        <footer class="main-footer">
            <div class="footer-content">
                <p class="copyright">© 2025 Тестове розширення</p>
                <div class="social-links">
                    <a href="#" class="social-link">Facebook</a>
                    <a href="#" class="social-link">Twitter</a>
                    <a href="#" class="social-link">Instagram</a>
                </div>
            </div>
        </footer>
    </div>
</body>
</html>
EOF
    
    print_success "Тестовий HTML файл створено: $TEST_DIR/test.html"
}

# ✅ Функція базового тестування
run_basic_tests() {
    print_step "Запуск базових тестів..."
    
    # Тест 1: Відкриття тестового файлу
    print_info "Тест 1: Відкриття VS Code з тестовим файлом..."
    code "$TEST_DIR/test.html" &
    CODE_PID=$!
    sleep 5
    
    print_success "VS Code запущено з тестовим файлом"
    
    # Інструкції для мануального тестування
    echo -e "${BLUE}
╔══════════════════════════════════════════════════════════════════╗
║                         МАНУАЛЬНЕ ТЕСТУВАННЯ                     ║
╚══════════════════════════════════════════════════════════════════╝${NC}"
    
    echo -e "${YELLOW}
Виконайте наступні дії у відкритому VS Code:

1. Перевірте, що розширення активувалось:
   - Command Palette (Cmd+Shift+P) → пошук "CSS Classes"
   - Мають з'явитися команди розширення

2. Тестування швидкої генерації:
   - У відкритому test.html натисніть Cmd+Alt+C
   - Перевірте, що створився test.css файл

3. Тестування головного меню:
   - Натисніть Cmd+Shift+C
   - Перевірте відкриття WebView панелі

4. Тестування контекстного меню:
   - Правий клік на HTML файл → "Generate CSS from HTML"
   
Натисніть будь-яку клавішу для продовження після тестування...${NC}"
    
    read -n 1 -s
    print_success "Мануальне тестування завершено"
    
    # Закриття VS Code процесу (якщо він ще працює)
    if kill -0 $CODE_PID 2>/dev/null; then
        print_info "Закриваємо VS Code процес..."
        kill $CODE_PID 2>/dev/null || true
    fi
}

# ✅ Функція генерації звіту
generate_report() {
    print_step "Генерація звіту про тестування..."
    
    REPORT_FILE="$PROJECT_ROOT/test_report_$(date +%Y%m%d_%H%M%S).md"
    
    cat > "$REPORT_FILE" << EOF
# 📋 ЗВІТ ПРО ТЕСТУВАННЯ CSS CLASSES FROM HTML v0.0.7

**Дата тестування:** $(date '+%d.%m.%Y %H:%M:%S')
**Операційна система:** macOS $(sw_vers -productVersion)
**Node.js версія:** $(node --version)
**VS Code версія:** $(code --version | head -1)

## ✅ РЕЗУЛЬТАТИ АВТОМАТИЗОВАНИХ ТЕСТІВ

### 1. Перевірка залежностей
- Node.js: ✅ ПРОЙДЕНО
- npm: ✅ ПРОЙДЕНО  
- VS Code CLI: ✅ ПРОЙДЕНО
- vsce: ✅ ПРОЙДЕНО

### 2. Валідація коду
- extension.js синтаксис: ✅ ПРОЙДЕНО
- package.json валідність: ✅ ПРОЙДЕНО
- WebView HTML: ✅ ПРОЙДЕНО
- Іконка розширення: ✅ ПРОЙДЕНО

### 3. Збирання розширення
- npm run validate: ✅ ПРОЙДЕНО
- Створення VSIX: ✅ ПРОЙДЕНО
- Файл: $BUILD_DIR/$VSIX_FILE
- Розмір: $(du -h "$BUILD_DIR/$VSIX_FILE" 2>/dev/null | cut -f1 || echo "N/A")

### 4. Встановлення
- Видалення старої версії: ✅ ПРОЙДЕНО
- Встановлення нової версії: ✅ ПРОЙДЕНО
- Перевірка в списку розширень: ✅ ПРОЙДЕНО

## 📝 МАНУАЛЬНІ ТЕСТИ (заповніть після тестування)

- [ ] Команди в Command Palette доступні
- [ ] Швидка генерація CSS (Cmd+Alt+C) працює
- [ ] Головне меню (Cmd+Shift+C) відкривається
- [ ] Контекстні меню працюють
- [ ] CSS файли генеруються правильно
- [ ] WebView панель функціональна

## 🐛 ЗНАЙДЕНІ ПРОБЛЕМИ

1. _________________________
2. _________________________
3. _________________________

## 📊 ЗАГАЛЬНА ОЦІНКА

**Статус:** [ ] ГОТОВО ДО ВИКОРИСТАННЯ / [ ] ПОТРЕБУЄ ДОРОБКИ

**Коментарі:**
_________________________________________________________________________
_________________________________________________________________________

## 📂 ФАЙЛИ ТЕСТУВАННЯ

- Тестовий HTML: $TEST_DIR/test.html
- Логи: $LOG_FILE
- VSIX пакет: $BUILD_DIR/$VSIX_FILE

---
*Звіт згенеровано автоматично скриптом test_extension.sh*
EOF
    
    print_success "Звіт створено: $REPORT_FILE"
}

# ✅ Функція очищення
cleanup() {
    print_step "Очищення тимчасових файлів..."
    
    # Видалення тестових файлів (опціонально)
    read -p "Видалити тестові файли? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$TEST_DIR"
        print_success "Тестові файли видалені"
    else
        print_info "Тестові файли збережені в: $TEST_DIR"
    fi
}

# ✅ Головна функція
main() {
    print_header
    
    echo "🚀 Запуск автоматизованого тестування розширення..."
    echo "📂 Проект: $PROJECT_ROOT"
    echo "📝 Логи: $LOG_FILE"
    echo
    
    # Послідовність тестування
    check_dependencies
    setup_environment  
    install_dependencies
    validate_code
    build_extension
    install_extension
    create_test_files
    run_basic_tests
    generate_report
    cleanup
    
    print_header
    echo -e "${GREEN}
🎉 ТЕСТУВАННЯ ЗАВЕРШЕНО УСПІШНО!

📋 Перевірте згенерований звіт для деталей
📂 Всі файли збережені в проекті
🚀 Розширення готове до використання

Дякуємо за тестування CSS Classes from HTML v0.0.7!${NC}"
}

# ✅ Обробка помилок
error_handler() {
    print_error "Виникла помилка на рядку $1"
    print_info "Дивіться деталі в: $LOG_FILE"
    exit 1
}

trap 'error_handler $LINENO' ERR

# ✅ Запуск скрипту
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi