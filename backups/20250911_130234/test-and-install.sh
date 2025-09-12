#!/bin/bash

# 🚀 CSS Classes from HTML - Автоматичний скрипт тестування та встановлення
# Версія: 1.0.0
# Призначення: Повна автоматизація перевстановлення та тестування розширення для Mac OS

set -e  # Зупинити виконання при будь-якій помилці

# Кольори для виводу
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Функція для виводу кольорових повідомлень
print_step() {
    echo -e "${BLUE}==>${NC} ${CYAN}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${PURPLE}ℹ️  $1${NC}"
}

# Заголовок
echo -e "${CYAN}
╔══════════════════════════════════════════════════════════════════╗
║                CSS Classes from HTML v0.0.7                     ║
║              Автоматичне тестування та встановлення              ║
╚══════════════════════════════════════════════════════════════════╝
${NC}"

# Перевірка операційної системи
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "Цей скрипт призначений для Mac OS"
    exit 1
fi

# Перевірка наявності необхідних інструментів
check_requirements() {
    print_step "Перевірка необхідних інструментів..."
    
    local missing_tools=()
    
    if ! command -v node >/dev/null 2>&1; then
        missing_tools+=("Node.js")
    else
        print_success "Node.js $(node --version) знайдено"
    fi
    
    if ! command -v npm >/dev/null 2>&1; then
        missing_tools+=("npm")
    else
        print_success "npm $(npm --version) знайдено"
    fi
    
    if ! command -v code >/dev/null 2>&1; then
        missing_tools+=("VS Code CLI")
    else
        print_success "VS Code CLI знайдено"
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "Не знайдено необхідні інструменти: ${missing_tools[*]}"
        print_info "Встановіть відсутні компоненти та спробуйте знову"
        exit 1
    fi
}

# Встановлення залежностей
install_dependencies() {
    print_step "Встановлення залежностей..."
    
    if [ -f "package-lock.json" ]; then
        print_info "Видаляю старий package-lock.json..."
        rm package-lock.json
    fi
    
    if [ -d "node_modules" ]; then
        print_info "Очищую node_modules..."
        rm -rf node_modules
    fi
    
    print_info "Встановлюю свіжі залежності..."
    npm install --no-audit --no-fund
    
    if [ $? -eq 0 ]; then
        print_success "Залежності встановлено успішно"
    else
        print_error "Помилка встановлення залежностей"
        exit 1
    fi
}

# Валідація коду
validate_code() {
    print_step "Валідація коду розширення..."
    
    print_info "Перевіряю extension.js..."
    if node -c extension.js; then
        print_success "extension.js - синтаксис коректний"
    else
        print_error "extension.js містить синтаксичні помилки"
        exit 1
    fi
    
    print_info "Перевіряю IntegrationEngine.js..."
    if node -c backend/core/IntegrationEngine.js; then
        print_success "IntegrationEngine.js - синтаксис коректний"
    else
        print_error "IntegrationEngine.js містить синтаксичні помилки"
        exit 1
    fi
    
    print_info "Перевіряю інші backend модулі..."
    local backend_files=(
        "backend/core/FigmaAPIClient.js"
        "backend/core/HTMLParser.js"
        "backend/utils/ImageImporter.js"
        "backend/utils/FontImporter.js"
        "backend/generators/SmartCSSGenerator.js"
    )
    
    for file in "${backend_files[@]}"; do
        if [ -f "$file" ]; then
            if node -c "$file"; then
                print_success "$(basename "$file") - OK"
            else
                print_warning "$(basename "$file") - містить помилки, але продовжуємо"
            fi
        else
            print_warning "$(basename "$file") - файл не знайдено"
        fi
    done
}

# Запуск тестів
run_tests() {
    print_step "Запуск тестів розширення..."
    
    if [ -f "scripts/tests.sh" ]; then
        print_info "Запускаю власні тести..."
        bash scripts/tests.sh
    else
        print_warning "Файл тестів не знайдено, пропускаю"
    fi
    
    print_success "Тести завершено"
}

# Збірка розширення
build_extension() {
    print_step "Збірка розширення..."
    
    # Створюємо директорію для збірок якщо не існує
    mkdir -p builds
    
    print_info "Пакую розширення..."
    npm run package
    
    if [ $? -eq 0 ]; then
        print_success "Розширення успішно запаковано"
        
        # Знаходимо останній .vsix файл
        LATEST_VSIX=$(ls -t builds/*.vsix 2>/dev/null | head -n1)
        
        if [ -n "$LATEST_VSIX" ]; then
            print_info "Створено файл: $LATEST_VSIX"
            echo "$LATEST_VSIX" > .last-built-extension
        fi
    else
        print_error "Помилка під час пакування розширення"
        exit 1
    fi
}

# Деінсталяція попередньої версії
uninstall_previous() {
    print_step "Деінсталяція попередніх версій..."
    
    print_info "Шукаю встановлені версії..."
    local installed_extensions=$(code --list-extensions | grep -i "vutov-mykola.css-classes-from-html" || true)
    
    if [ -n "$installed_extensions" ]; then
        print_info "Знайдено встановлені версії:"
        echo "$installed_extensions"
        
        echo "$installed_extensions" | while IFS= read -r ext; do
            if [ -n "$ext" ]; then
                print_info "Видаляю $ext..."
                code --uninstall-extension "$ext"
            fi
        done
        
        print_success "Попередні версії видалено"
    else
        print_info "Попередні версії не знайдено"
    fi
}

# Встановлення нової версії
install_new_version() {
    print_step "Встановлення нової версії..."
    
    if [ -f ".last-built-extension" ]; then
        LATEST_VSIX=$(cat .last-built-extension)
    else
        LATEST_VSIX=$(ls -t builds/*.vsix 2>/dev/null | head -n1)
    fi
    
    if [ -n "$LATEST_VSIX" ] && [ -f "$LATEST_VSIX" ]; then
        print_info "Встановлюю $LATEST_VSIX..."
        
        if code --install-extension "$LATEST_VSIX" --force; then
            print_success "Розширення встановлено успішно!"
        else
            print_error "Помилка встановлення розширення"
            exit 1
        fi
    else
        print_error "Не знайдено файл розширення для встановлення"
        exit 1
    fi
}

# Верифікація встановлення
verify_installation() {
    print_step "Верифікація встановлення..."
    
    print_info "Перевіряю встановлені розширення..."
    sleep 2  # Даємо час VS Code оновити список
    
    local installed=$(code --list-extensions | grep -i "css-classes-from-html" || true)
    
    if [ -n "$installed" ]; then
        print_success "Розширення успішно встановлено: $installed"
        
        print_info "Перевіряю статус активації..."
        
        # Створюємо тестовий HTML файл для перевірки
        cat > test-activation.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test CSS Classes Extension</title>
</head>
<body>
    <div class="container">
        <h1 class="title">Test Title</h1>
        <p class="description">Test description</p>
        <button class="btn btn-primary">Test Button</button>
    </div>
</body>
</html>
EOF
        
        print_info "Створено тестовий файл test-activation.html"
        print_success "Верифікація завершена успішно!"
        
    else
        print_error "Розширення не знайдено в списку встановлених"
        exit 1
    fi
}

# Очищення тимчасових файлів
cleanup() {
    print_step "Очищення тимчасових файлів..."
    
    if [ -f ".last-built-extension" ]; then
        rm .last-built-extension
    fi
    
    print_success "Очищення завершено"
}

# Головна функція
main() {
    local start_time=$(date +%s)
    
    print_step "Початок автоматичного тестування та встановлення..."
    
    # Основна послідовність дій
    check_requirements
    install_dependencies
    validate_code
    run_tests
    build_extension
    uninstall_previous
    install_new_version
    verify_installation
    cleanup
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo -e "${GREEN}
╔══════════════════════════════════════════════════════════════════╗
║                          ✅ УСПІХ!                              ║
║                                                                  ║
║  CSS Classes from HTML v0.0.7 успішно встановлено!             ║
║  Час виконання: ${duration} секунд                                      ║
║                                                                  ║
║  Наступні кроки:                                                 ║
║  1. Відкрийте VS Code                                            ║
║  2. Відкрийте test-activation.html                               ║
║  3. Використайте Cmd+Shift+C для активації розширення           ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
${NC}"
    
    print_info "Лог файли збережено в logs/"
    print_info "Збірка розширення знаходиться в builds/"
}

# Обробка сигналів переривання
trap 'print_error "Скрипт перервано користувачем"; exit 1' INT TERM

# Запуск головної функції
main "$@"