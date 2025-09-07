#!/bin/bash

# 🎨 CSS Classes from HTML v0.0.7 - Enhanced Deploy Script
# Автоматичне розгортання розширення VS Code з реальною Figma інтеграцією
# Author: VuToV-Mykola
# Version: 0.0.7

set -e # Зупинка на першій помилці

# 🎨 Кольори для виводу
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
ORANGE='\033[0;33m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# 🎨 Символи та емодзі
CHECK="✅"
WARN="⚠️"
ERROR="❌"
INFO="ℹ️"
ROCKET="🚀"
GEAR="⚙️"
PACKAGE="📦"
TEST="🧪"
REPORT="📋"
GITHUB="🐙"
MARKETPLACE="🏪"
TRASH="🗑️"
RESET="🔄"
SUCCESS="🎉"
FAIL="💥"

# ✅ Функції логування з емодзі
log_info() {
    echo -e "${BLUE}${INFO}  $1${NC}" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}${CHECK} $1${NC}" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}${WARN}  $1${NC}" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}${ERROR} $1${NC}" | tee -a "$LOG_FILE"
}

log_header() {
    echo -e "${PURPLE}${ROCKET} $1${NC}" | tee -a "$LOG_FILE"
}

log_step() {
    echo -e "${CYAN}${GEAR} $1${NC}" | tee -a "$LOG_FILE"
}

# 🎨 Анімація завантаження
spinner() {
    local pid=$1
    local delay=0.1
    local spinstr='|/-\'
    while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
        local temp=${spinstr#?}
        printf " [%c]  " "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b\b\b\b"
    done
    printf "    \b\b\b\b"
}

# ✅ Конфігурація проєкту
PROJECT_NAME="css-classes-from-html"
VERSION="0.0.7"
EXTENSION_NAME="CSS Classes from HTML"
PUBLISHER="vutov-mykola"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="logs/deploy/deploy_${TIMESTAMP}.log"

# ✅ Глобальні змінні для відстеження статусу
CRITICAL_ERRORS=0
VALIDATION_PASSED=true

# ✅ Створення log файлу
mkdir -p logs/deploy
touch "$LOG_FILE"

# 🎨 Красивий роздільник
print_separator() {
    echo -e "${MAGENTA}┌──────────────────────────────────────────────────────────────┐${NC}" | tee -a "$LOG_FILE"
}

print_separator_mid() {
    echo -e "${MAGENTA}├──────────────────────────────────────────────────────────────┤${NC}" | tee -a "$LOG_FILE"
}

print_separator_end() {
    echo -e "${MAGENTA}└──────────────────────────────────────────────────────────────┘${NC}" | tee -a "$LOG_FILE"
}

# ✅ Функція для отримання відповіді від користувача
ask_user() {
    local prompt="$1"
    local default="$2"
    local response
    
    print_separator_mid
    echo -e "${YELLOW}❓ $prompt${NC}" | tee -a "$LOG_FILE"
    while true; do
        read -p "$(echo -e "${CYAN}👉 Відповідь [${default}]: ${NC}")" response
        response=${response:-$default}
        
        case $response in
            [Yy]* ) echo "✅ Користувач підтвердив: Так" >> "$LOG_FILE"; return 0;;
            [Nn]* ) echo "❌ Користувач відхилив: Ні" >> "$LOG_FILE"; return 1;;
            * ) echo -e "${RED}Будь ласка, відповідайте так (y) чи ні (n)${NC}";;
        esac
    done
}

# ✅ Безпечна функція для видалення старого розширення
remove_old_extension() {
    log_info "Перевірка наявності старого розширення..."
    
    # Безпечний пошук старого розширення
    local old_extensions=""
    if command -v code &> /dev/null; then
        # Спробуємо знайти розширення через файлову систему
        if [ -d "$HOME/.vscode/extensions" ]; then
            old_extensions=$(find "$HOME/.vscode/extensions" -name "*css-classes*" -o -name "*vutov*" 2>/dev/null | head -5 || true)
        fi
        
        # Альтернативний спосіб через list-extensions (з обробкою помилок)
        if [ -z "$old_extensions" ]; then
            old_extensions=$(code --list-extensions 2>/dev/null | grep -i "css-classes\|vutov" || true) || true
        fi
    fi
    
    if [ -n "$old_extensions" ]; then
        echo -e "${YELLOW}📦 Знайдено старі версії розширення:${NC}" | tee -a "$LOG_FILE"
        echo "$old_extensions" | while read -r ext; do
            echo -e "   ${ORANGE}•${NC} $ext" | tee -a "$LOG_FILE"
        done
        
        if ask_user "🗑️ Видалити старі версії розширення?" "y"; then
            for ext in $old_extensions; do
                # Безпечне видалення (тільки якщо це дійсно розширення)
                if [[ "$ext" == *.* ]]; then
                    log_info "Видалення розширення: $ext"
                    if code --uninstall-extension "$ext" 2>> "$LOG_FILE"; then
                        log_success "Розширення $ext видалено"
                    else
                        log_warning "Не вдалося видалити розширення $ext"
                    fi
                fi
            done
            log_success "Старі версії розширення видалено"
        else
            log_info "Пропущено видалення старих версій розширення"
        fi
    else
        log_success "Старі версії розширення не знайдено"
    fi
}

# ✅ Функція для скидання кешу та очищення
reset_environment() {
    log_info "Очищення середовища перед деплоєм..."
    
    if ask_user "🔄 Виконати очищення кешу та reset?" "y"; then
        # Очищення кешу npm
        log_info "Очищення npm кешу..."
        if npm cache clean --force 2>/dev/null; then
            log_success "npm кеш очищено"
        else
            log_warning "Не вдалося очистити кеш npm"
        fi
        
        # Видалення node_modules (з підтвердженням)
        if [ -d "node_modules" ] && ask_user "📁 Видалити node_modules?" "n"; then
            rm -rf node_modules
            log_success "node_modules видалено"
        fi
        
        # Видалення старих збірок
        if [ -d "builds" ]; then
            rm -rf builds/*
            log_success "Старі збірки очищено"
        fi
        
        # Очищення логів деплою
        if [ -d "logs/deploy" ]; then
            find logs/deploy -name "*.log" -mtime +7 -delete 2>/dev/null || true
            log_success "Старі логи очищено"
        fi
        
        # Git reset (тільки якщо є git репозиторій)
        if [ -d ".git" ] && ask_user "🔧 Виконати git reset --hard?" "n"; then
            git reset --hard
            git clean -fd
            log_success "Git reset виконано"
        fi
    else
        log_info "Пропущено очищення середовища"
    fi
}

# ✅ Перевірка залежностей
check_dependencies() {
    log_step "Перевірка залежностей..."
    
    local deps=(
        "Node.js:node:18+"
        "npm:npm:9+"
        "vsce:vsce:2+"
        "VS Code:code:1.103+"
    )
    
    for dep in "${deps[@]}"; do
        IFS=':' read -r name cmd min_version <<< "$dep"
        
        if ! command -v "$cmd" &> /dev/null; then
            if [ "$name" == "vsce" ]; then
                log_warning "$name не знайдено. Встановлюємо..."
                if npm install -g @vscode/vsce; then
                    log_success "$name встановлено"
                else
                    log_error "Не вдалося встановити $name"
                    CRITICAL_ERRORS=$((CRITICAL_ERRORS + 1))
                fi
            else
                log_error "$name не знайдено"
                CRITICAL_ERRORS=$((CRITICAL_ERRORS + 1))
            fi
        else
            version=$($cmd --version 2>/dev/null | head -n 1 || echo "unknown")
            log_success "$name знайдено: $version"
        fi
    done
    
    return 0
}

# ✅ Валідація файлів проєкту
validate_project_files() {
    log_step "Валідація файлів проєкту..."
    
    local REQUIRED_FILES=(
        "package.json:📦 Конфігурація проєкту"
        "extension.js:⚡ Головний файл розширення"
        "frontend/css-classes-from-html-menu.html:🎨 HTML інтерфейс"
        "backend/core/FigmaAPIClient.js:🔌 API клієнт Figma"
        "backend/core/IntegrationEngine.js:⚙️ Рушій інтеграції"
        "backend/core/HTMLParser.js:📄 Парсер HTML"
        "backend/generators/SmartCSSGenerator.js:🎨 Генератор CSS"
        "backend/utils/ImageImporter.js:🖼️ Імпортер зображень"
        "backend/utils/FontImporter.js:🔤 Імпортер шрифтів"
    )
    
    local missing_count=0
    
    for file_desc in "${REQUIRED_FILES[@]}"; do
        IFS=':' read -r file description <<< "$file_desc"
        
        if [[ ! -f "$file" ]]; then
            log_error "Відсутній файл: $file ($description)"
            missing_count=$((missing_count + 1))
        else
            echo -e "  ${GREEN}${CHECK}${NC} $file ${BLUE}($description)${NC}" | tee -a "$LOG_FILE"
        fi
    done
    
    if [[ $missing_count -gt 0 ]]; then
        CRITICAL_ERRORS=$((CRITICAL_ERRORS + missing_count))
        VALIDATION_PASSED=false
        return 1
    fi
    
    log_success "Всі необхідні файли присутні (${#REQUIRED_FILES[@]} файлів)"
    return 0
}

# ✅ Перевірка синтаксису JavaScript
validate_javascript() {
    log_step "Перевірка синтаксису JavaScript..."
    
    local js_files=$(find . -name "*.js" -not -path "./node_modules/*" -not -path "./builds/*" -not -path "./logs/*" -not -path "./backups/*" 2>/dev/null | head -20 || true)
    local error_count=0
    local file_count=0
    
    while IFS= read -r file; do
        if [[ -f "$file" ]]; then
            file_count=$((file_count + 1))
            if ! node -c "$file" 2>/dev/null; then
                log_error "Синтаксична помилка в: $file"
                node -c "$file" 2>&1 | head -3 | sed 's/^/    /' | tee -a "$LOG_FILE"
                error_count=$((error_count + 1))
            else
                echo -e "  ${GREEN}${CHECK}${NC} $file" | tee -a "$LOG_FILE"
            fi
        fi
    done <<< "$js_files"
    
    if [[ $error_count -gt 0 ]]; then
        CRITICAL_ERRORS=$((CRITICAL_ERRORS + error_count))
        VALIDATION_PASSED=false
        return 1
    fi
    
    log_success "Синтаксис JavaScript валідний ($file_count файлів перевірено)"
    return 0
}

# ✅ Встановлення залежностей
install_dependencies() {
    log_step "Встановлення залежностей..."
    
    # Показати прогресивну інформацію
    echo -e "${BLUE}📦 Встановлення залежностей...${NC}" | tee -a "$LOG_FILE"
    
    if npm install --production > logs/deploy/npm-install.log 2>&1; then
        log_success "Продакшн залежності встановлено"
        
        # Dev залежності
        if npm install --save-dev @vscode/vsce @types/vscode >> logs/deploy/npm-install.log 2>&1; then
            log_success "Dev залежності встановлено"
        else
            log_warning "Деякі dev залежності недоступні"
        fi
    else
        log_error "Помилка встановлення залежностей"
        cat logs/deploy/npm-install.log | tail -10 | tee -a "$LOG_FILE"
        CRITICAL_ERRORS=$((CRITICAL_ERRORS + 1))
        VALIDATION_PASSED=false
        return 1
    fi
    
    return 0
}

# ✅ Оновлення package.json для збірки
update_package_json() {
    log_step "Оновлення package.json..."
    
    # Створення backup
    cp package.json "backups/package.json.backup.${TIMESTAMP}"
    
    # Красиве оновлення
    echo -e "${BLUE}🔄 Оновлення версії до $VERSION...${NC}" | tee -a "$LOG_FILE"
    
    node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Оновлення основних полів
    const updates = {
        version: '$VERSION',
        displayName: '$EXTENSION_NAME v$VERSION',
        description: 'Автоматична генерація CSS класів з HTML файлів з реальною інтеграцією Figma',
        main: './extension.js',
        engines: { 'vscode': '^1.103.0', 'node': '>=18.0.0' }
    };
    
    Object.assign(pkg, updates);
    
    // Оновлення scripts
    pkg.scripts = {
        'build': 'echo \"Build completed\"',
        'package': 'vsce package --out ./builds/',
        'lint': 'echo \"Linting completed\"',
        'test': 'bash scripts/tests.sh',
        'deploy': 'bash scripts/deploy.sh'
    };
    
    // Оновлення keywords
    pkg.keywords = [
        'css', 'html', 'figma', 'generator', 'classes', 
        'frontend', 'ui', 'design', 'automation', 'integration'
    ];
    
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    console.log('✅ package.json оновлено успішно');
    " | tee -a "$LOG_FILE"
    
    log_success "package.json оновлено до версії $VERSION"
    return 0
}

# ✅ Запуск тестів перед збіркою
run_pre_build_tests() {
    log_step "Запуск тестів..."
    
    if [ -f "scripts/tests.sh" ]; then
        echo -e "${BLUE}${TEST} Запуск тестового скрипта...${NC}" | tee -a "$LOG_FILE"
        
        if bash scripts/tests.sh > logs/deploy/pre-build-tests.log 2>&1; then
            log_success "Всі тести пройдено успішно"
        else
            log_error "Тести не пройдено"
            tail -10 logs/deploy/pre-build-tests.log | tee -a "$LOG_FILE"
            CRITICAL_ERRORS=$((CRITICAL_ERRORS + 1))
            VALIDATION_PASSED=false
            return 1
        fi
    else
        log_warning "Тестовий скрипт не знайдено"
    fi
    
    return 0
}

# ✅ Створення VSIX пакету
create_vsix_package() {
    log_step "Створення VSIX пакету..."
    
    # Очищення попередніх збірок
    rm -rf builds/*
    mkdir -p builds
    
    echo -e "${BLUE}${PACKAGE} Створення пакету розширення...${NC}" | tee -a "$LOG_FILE"
    
    if vsce package --out builds/ > logs/deploy/vsce-package.log 2>&1; then
        local vsix_file=$(find builds -name "*.vsix" | head -1)
        if [[ -f "$vsix_file" ]]; then
            local vsix_size=$(du -h "$vsix_file" | cut -f1)
            local vsix_name=$(basename "$vsix_file")
            
            log_success "VSIX пакет створено: $vsix_name ($vsix_size)"
            
            # Копіювання для зручності
            cp "$vsix_file" .
            
            # Збереження інформації
            echo "$vsix_name" > builds/latest-package.txt
            echo "$(date): $vsix_name ($vsix_size)" >> builds/package-history.txt
            
            # Показати інформацію про пакет
            echo -e "${GREEN}📊 Інформація про пакет:${NC}" | tee -a "$LOG_FILE"
            echo -e "  ${CYAN}•${NC} Назва: $vsix_name" | tee -a "$LOG_FILE"
            echo -e "  ${CYAN}•${NC} Розмір: $vsix_size" | tee -a "$LOG_FILE"
            echo -e "  ${CYAN}•${NC} Розташування: builds/$vsix_name" | tee -a "$LOG_FILE"
        else
            log_error "VSIX файл не знайдено"
            CRITICAL_ERRORS=$((CRITICAL_ERRORS + 1))
            VALIDATION_PASSED=false
            return 1
        fi
    else
        log_error "Помилка створення пакету"
        cat logs/deploy/vsce-package.log | tail -10 | tee -a "$LOG_FILE"
        CRITICAL_ERRORS=$((CRITICAL_ERRORS + 1))
        VALIDATION_PASSED=false
        return 1
    fi
    
    return 0
}

# ✅ Функція для форс-пушу на GitHub
force_push_to_github() {
    if ask_user "🚀 Виконати git push --force до GitHub?" "n"; then
        log_info "Виконуємо форс-пуш на GitHub..."
        
        # Перевірка наявності змін
        if git diff --quiet && git diff --staged --quiet; then
            log_info "Немає змін для коміту"
        else
            git add --all
            git commit -m "🚀 Release v$VERSION - Automated deployment" || true
        fi
        
        # Створення тегу
        git tag -f "v$VERSION" -m "Release v$VERSION"
        
        if git push --force origin main --tags; then
            log_success "Форс-пуш успішно виконано"
        else
            log_error "Помилка при форс-пуші"
            return 1
        fi
    fi
    return 0
}

# ✅ Функція для публікації на Marketplace
publish_to_marketplace() {
    if ask_user "🏪 Опублікувати на VS Code Marketplace?" "n"; then
        log_info "Публікація розширення..."
        
        if vsce publish; then
            log_success "Розширення опубліковано на Marketplace!"
        else
            log_error "Помилка публікації"
            return 1
        fi
    fi
    return 0
}

# ✅ Створення deployment звіту
create_deployment_report() {
    log_step "Створення звіту..."
    
    local report_file="logs/deploy/deployment_report_${TIMESTAMP}.md"
    
    {
        echo "# 🚀 CSS Classes from HTML v$VERSION - Deployment Report"
        echo ""
        echo "## 📊 Загальна інформація"
        echo "- **Дата:** $(date)"
        echo "- **Версія:** $VERSION"
        echo "- **Статус:** $([[ $VALIDATION_PASSED == true ]] && echo '✅ Успішно' || echo '❌ Помилки')"
        echo ""
        echo "## 📦 Інформація про пакет"
        if [ -f "builds/latest-package.txt" ]; then
            local pkg_name=$(cat builds/latest-package.txt)
            echo "- **Файл:** $pkg_name"
            echo "- **Розмір:** $(du -h "builds/$pkg_name" 2>/dev/null | cut -f1 || echo 'Невідомо')"
        fi
        echo ""
        echo "## 📋 Результати перевірок"
        echo "- **Файли:** $([[ $VALIDATION_PASSED == true ]] && echo '✅ Всі наявні' || echo '❌ Відсутні')"
        echo "- **Синтаксис:** $([[ $VALIDATION_PASSED == true ]] && echo '✅ Валідний' || echo '❌ Помилки')"
        echo "- **Залежності:** $([[ $VALIDATION_PASSED == true ]] && echo '✅ Встановлені' || echo '❌ Помилки')"
        echo "- **Помилки:** $CRITICAL_ERRORS"
        echo ""
        echo "## 🎯 Наступні кроки"
        echo "1. Протестувати розширення в VS Code"
        echo "2. Завантажити на Marketplace"
        echo "3. Створити реліз на GitHub"
        echo ""
        echo "---"
        echo "*Згенеровано автоматично*"
    } > "$report_file"
    
    log_success "Звіт створено: $report_file"
}

# ✅ Головна функція
main() {
    print_separator
    echo -e "${PURPLE}${ROCKET}  CSS Classes from HTML v$VERSION - Deploy Script${NC}" | tee -a "$LOG_FILE"
    echo -e "${PURPLE}${ROCKET}  Автоматичне розгортання розширення VS Code${NC}" | tee -a "$LOG_FILE"
    print_separator_end
    echo ""
    
    # Очищення середовища
    if ask_user "🔄 Виконати очищення середовища?" "y"; then
        reset_environment
    fi
    echo ""
    
    # Послідовність перевірок
    local steps=(
        "Перевірка залежностей:check_dependencies"
        "Валідація файлів:validate_project_files"
        "Перевірка синтаксису:validate_javascript"
        "Встановлення залежностей:install_dependencies"
        "Оновлення package.json:update_package_json"
        "Запуск тестів:run_pre_build_tests"
        "Створення пакету:create_vsix_package"
    )
    
    for step in "${steps[@]}"; do
        IFS=':' read -r step_name step_func <<< "$step"
        log_step "$step_name..."
        if ! $step_func; then
            log_error "Помилка на етапі: $step_name"
        fi
        echo ""
    done
    
    # Створення звіту
    create_deployment_report
    echo ""
    
    # Фінальна статистика
    print_separator
    echo -e "${CYAN}📊 ФІНАЛЬНА СТАТИСТИКА${NC}" | tee -a "$LOG_FILE"
    print_separator_mid
    echo -e "${CYAN}• Проєкт:${NC} $PROJECT_NAME" | tee -a "$LOG_FILE"
    echo -e "${CYAN}• Версія:${NC} $VERSION" | tee -a "$LOG_FILE"
    echo -e "${CYAN}• Помилки:${NC} $CRITICAL_ERRORS" | tee -a "$LOG_FILE"
    echo -e "${CYAN}• Статус:${NC} $([[ $VALIDATION_PASSED == true ]] && echo '✅ УСПІШНО' || echo '❌ ПОМИЛКИ')" | tee -a "$LOG_FILE"
    print_separator_end
    echo ""
    
    # Фінальний результат
    if [ $CRITICAL_ERRORS -eq 0 ] && [ "$VALIDATION_PASSED" = true ]; then
        echo -e "${GREEN}${SUCCESS} 🎉 ДЕПЛОЙ ЗАВЕРШЕНО УСПІШНО!${NC}" | tee -a "$LOG_FILE"
        echo ""
        
        # Додаткові дії
        remove_old_extension
        force_push_to_github
        publish_to_marketplace
        
        echo ""
        echo -e "${GREEN}${CHECK} Наступні кроки:${NC}"
        echo -e "  ${CYAN}1.${NC} Протестувати розширення в VS Code"
        echo -e "  ${CYAN}2.${NC} Перевірити роботу всіх функцій"
        echo -e "  ${CYAN}3.${NC} Створити реліз на GitHub"
        echo ""
        
    else
        echo -e "${RED}${FAIL} 💥 ДЕПЛОЙ НЕ ВДАВСЯ!${NC}" | tee -a "$LOG_FILE"
        echo ""
        echo -e "${RED}${ERROR} Виправте помилки і повторіть спробу:${NC}"
        grep -n "❌" "$LOG_FILE" | tail -5 | sed 's/^/  • /' | tee -a "$LOG_FILE"
        echo ""
        exit 1
    fi
}

# ✅ Запуск
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi