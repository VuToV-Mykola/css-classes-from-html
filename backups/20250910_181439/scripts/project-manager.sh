#!/bin/bash

# 🚀 МЕНЕДЖЕР ПРОЕКТУ CSS CLASSES FROM HTML v0.0.7
# Інтерактивний інструмент для управління проектом
# Об'єднує всі скрипти з красивою візуалізацією та інтерактивністю
# Author: VuToV-Mykola

set -e

# ✅ Кольори та стилі
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;37m'
NC='\033[0m'

# ✅ Unicode символи
CHECKMARK="✅"
CROSS="❌"
ARROW="➤"
STAR="⭐"
GEAR="⚙️"
ROCKET="🚀"
BOOK="📚"
TOOL="🔧"
BUG="🐛"
PACKAGE="📦"
GLOBE="🌐"
FIRE="🔥"

# ✅ Змінні проекту
PROJECT_NAME="CSS Classes from HTML"
PROJECT_VERSION="0.0.7"
AUTHOR="VuToV-Mykola"
SCRIPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPTS_DIR")"

# ✅ Функції для красивого виводу
print_header() {
    clear
    echo -e "${BLUE}
╔══════════════════════════════════════════════════════════════════════════════════╗
║                          ${WHITE}🚀 МЕНЕДЖЕР ПРОЕКТУ${BLUE}                               ║
║                     ${CYAN}$PROJECT_NAME v$PROJECT_VERSION${BLUE}                      ║
║                                                                              ║
║            ${GRAY}Інтерактивний інструмент для управління проектом${BLUE}                ║
║                        ${GRAY}Створено з ${RED}❤️${GRAY}  by $AUTHOR${BLUE}                         ║
╚══════════════════════════════════════════════════════════════════════════════════╝${NC}
"
}

print_menu() {
    echo -e "${CYAN}
╔════════════════════════════════════════════════════════════════════════════╗
║                             ${WHITE}📋 ГОЛОВНЕ МЕНЮ${CYAN}                              ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  ${YELLOW}1${CYAN}) ${BOOK} Генерація документації                                        ║
║      ${GRAY}├─ Автогенерація багатомовних README файлів${CYAN}                        ║
║      ${GRAY}├─ Аналіз структури проекту${CYAN}                                       ║
║      ${GRAY}└─ Створення GitHub метаданих${CYAN}                                     ║
║                                                                            ║
║  ${YELLOW}2${CYAN}) ${PACKAGE} Збірка та розгортання                                      ║
║      ${GRAY}├─ Валідація коду та виправлення помилок${CYAN}                          ║
║      ${GRAY}├─ Створення VSIX пакету${CYAN}                                         ║
║      ${GRAY}└─ Публікація в Marketplace${CYAN}                                       ║
║                                                                            ║
║  ${YELLOW}3${CYAN}) ${BUG} Тестування та відлагодження                                    ║
║      ${GRAY}├─ Автоматизоване тестування розширення${CYAN}                            ║
║      ${GRAY}├─ Валідація команд та активації${CYAN}                                  ║
║      ${GRAY}└─ Перевірка інтеграційних тестів${CYAN}                                 ║
║                                                                            ║
║  ${YELLOW}4${CYAN}) ${GLOBE} Git операції                                               ║
║      ${GRAY}├─ Коміт та push змін${CYAN}                                             ║
║      ${GRAY}├─ Створення релізів та тегів${CYAN}                                     ║
║      ${GRAY}└─ Синхронізація з GitHub${CYAN}                                        ║
║                                                                            ║
║  ${YELLOW}5${CYAN}) ${GEAR} Системна інформація                                         ║
║      ${GRAY}├─ Статистика проекту${CYAN}                                             ║
║      ${GRAY}├─ Перевірка залежностей${CYAN}                                          ║
║      ${GRAY}└─ Діагностика середовища${CYAN}                                        ║
║                                                                            ║
║  ${YELLOW}6${CYAN}) ${TOOL} Утиліти розробки                                            ║
║      ${GRAY}├─ Очищення проекту${CYAN}                                               ║
║      ${GRAY}├─ Оновлення залежностей${CYAN}                                          ║
║      ${GRAY}└─ Резервне копіювання${CYAN}                                            ║
║                                                                            ║
║  ${YELLOW}0${CYAN}) ${CROSS} Вихід                                                       ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝${NC}
"
}

print_step() {
    echo -e "${YELLOW}${ARROW} $1${NC}"
}

print_success() {
    echo -e "${GREEN}${CHECKMARK} $1${NC}"
}

print_error() {
    echo -e "${RED}${CROSS} $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

print_separator() {
    echo -e "${GRAY}────────────────────────────────────────────────────────────${NC}"
}

# ✅ Функція показу прогрес-бару
show_progress() {
    local duration=$1
    local steps=50
    local step_duration=$((duration * 1000 / steps))
    
    echo -ne "${CYAN}Прогрес: ${NC}["
    for ((i=0; i<steps; i++)); do
        echo -ne "${GREEN}█${NC}"
        usleep $step_duration
    done
    echo -e "] ${GREEN}Завершено!${NC}"
}

# ✅ Функція перевірки скриптів
check_scripts() {
    local scripts=(
        "auto-generate-docs.sh:Автогенератор документації"
        "auto-generate-package-json.sh:Автогенератор package.json"
        "deploy.sh:Скрипт розгортання"
        "tests.sh:Тестовий пакет"
        "debug.sh:Відладчик проекту"
        "push-to-github.sh:Git менеджер"
    )
    
    print_step "Перевірка доступності скриптів..."
    
    for script_info in "${scripts[@]}"; do
        IFS=':' read -r script_name script_desc <<< "$script_info"
        if [ -f "$SCRIPTS_DIR/$script_name" ]; then
            print_success "$script_desc ($script_name)"
        else
            print_error "$script_desc ($script_name) - НЕ ЗНАЙДЕНО"
        fi
    done
}

# ✅ Функція показу статистики проекту
show_project_stats() {
    print_step "Аналіз статистики проекту..."
    
    # Підрахунок файлів
    local js_files=$(find "$PROJECT_ROOT" -name "*.js" ! -path "*/node_modules/*" | wc -l | tr -d ' ')
    local html_files=$(find "$PROJECT_ROOT" -name "*.html" ! -path "*/node_modules/*" | wc -l | tr -d ' ')
    local md_files=$(find "$PROJECT_ROOT" -name "*.md" ! -path "*/node_modules/*" | wc -l | tr -d ' ')
    local total_files=$(find "$PROJECT_ROOT" -type f ! -path "*/node_modules/*" ! -path "*/.git/*" | wc -l | tr -d ' ')
    
    # Розмір проекту
    local project_size=$(du -sh "$PROJECT_ROOT" 2>/dev/null | cut -f1)
    
    # Git інформація
    local git_commits="N/A"
    local git_branch="N/A"
    if [ -d "$PROJECT_ROOT/.git" ]; then
        git_commits=$(git -C "$PROJECT_ROOT" rev-list --count HEAD 2>/dev/null || echo "N/A")
        git_branch=$(git -C "$PROJECT_ROOT" branch --show-current 2>/dev/null || echo "N/A")
    fi
    
    echo -e "${CYAN}
╔══════════════════════════════════════════════════════════════╗
║                    📊 СТАТИСТИКА ПРОЕКТУ                     ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  📁 Структура файлів:                                       ║
║     ├─ JavaScript файлів: ${YELLOW}$js_files${CYAN}                                  ║
║     ├─ HTML файлів: ${YELLOW}$html_files${CYAN}                                      ║
║     ├─ Markdown файлів: ${YELLOW}$md_files${CYAN}                                    ║
║     └─ Загалом файлів: ${YELLOW}$total_files${CYAN}                                  ║
║                                                              ║
║  💾 Розмір проекту: ${YELLOW}$project_size${CYAN}                                     ║
║                                                              ║
║  🔧 Git репозиторій:                                         ║
║     ├─ Гілка: ${YELLOW}$git_branch${CYAN}                                            ║
║     └─ Комітів: ${YELLOW}$git_commits${CYAN}                                         ║
║                                                              ║
║  🚀 Версія проекту: ${YELLOW}$PROJECT_VERSION${CYAN}                                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝${NC}
"
}

# ✅ Функція виконання скрипту з візуалізацією
run_script_with_progress() {
    local script_name=$1
    local script_desc=$2
    local script_path="$SCRIPTS_DIR/$script_name"
    
    if [ ! -f "$script_path" ]; then
        print_error "Скрипт $script_name не знайдено!"
        return 1
    fi
    
    print_step "Запуск: $script_desc"
    print_separator
    
    # Запуск скрипту
    if bash "$script_path"; then
        print_separator
        print_success "$script_desc завершено успішно!"
    else
        print_separator
        print_error "$script_desc завершився з помилкою!"
        return 1
    fi
}

# ✅ Функція меню генерації документації
menu_generate_docs() {
    clear
    print_header
    echo -e "${CYAN}
╔══════════════════════════════════════════════════════════════╗
║                   📚 ГЕНЕРАЦІЯ ДОКУМЕНТАЦІЇ                   ║
╚══════════════════════════════════════════════════════════════╝${NC}
"
    
    echo -e "${YELLOW}Виберіть опцію:${NC}"
    echo -e "${CYAN}1)${NC} ${BOOK} Автогенерація всієї документації"
    echo -e "${CYAN}2)${NC} ${GEAR} Генерація тільки README файлів"
    echo -e "${CYAN}3)${NC} ${GLOBE} Створення GitHub метаданих"
    echo -e "${CYAN}4)${NC} ${PACKAGE} Автогенерація package.json з extension.js"
    echo -e "${CYAN}0)${NC} ${ARROW} Повернутись до головного меню"
    echo
    
    read -p "Ваш вибір: " choice
    
    case $choice in
        1)
            run_script_with_progress "auto-generate-docs.sh" "Автогенерація документації"
            ;;
        2)
            print_info "Генерація тільки README файлів..."
            # Тут можна додати окремий скрипт або параметр
            run_script_with_progress "auto-generate-docs.sh" "Генерація README"
            ;;
        3)
            print_info "Створення GitHub метаданих..."
            run_script_with_progress "generate-docs.sh" "GitHub метадані"
            ;;
        4)
            # Новий пункт для автогенерації package.json
            echo -e "${RED}${CROSS} УВАГА! Це перезапише існуючий package.json!${NC}"
            echo -n "Ви впевнені? Буде створено резервну копію. (y/n): "
            read confirmation
            if [[ "$confirmation" =~ ^[Yy]$ ]]; then
                run_script_with_progress "auto-generate-package-json.sh" "Автогенерація package.json"
            else
                print_info "Скасовано користувачем"
            fi
            ;;
        0)
            return
            ;;
        *)
            print_error "Неправильний вибір!"
            ;;
    esac
    
    echo
    read -p "Натисніть Enter для продовження..."
}

# ✅ Функція меню збірки та розгортання
menu_build_deploy() {
    clear
    print_header
    echo -e "${CYAN}
╔══════════════════════════════════════════════════════════════╗
║                  📦 ЗБІРКА ТА РОЗГОРТАННЯ                    ║
╚══════════════════════════════════════════════════════════════╝${NC}
"
    
    echo -e "${YELLOW}Виберіть опцію:${NC}"
    echo -e "${CYAN}1)${NC} ${ROCKET} Повне розгортання (збірка + публікація)"
    echo -e "${CYAN}2)${NC} ${PACKAGE} Тільки збірка VSIX пакету"
    echo -e "${CYAN}3)${NC} ${GEAR} Валідація коду та виправлення"
    echo -e "${CYAN}4)${NC} ${GLOBE} Публікація в Marketplace"
    echo -e "${CYAN}0)${NC} ${ARROW} Повернутись до головного меню"
    echo
    
    read -p "Ваш вибір: " choice
    
    case $choice in
        1)
            run_script_with_progress "deploy.sh" "Повне розгортання"
            ;;
        2)
            print_info "Створення VSIX пакету..."
            cd "$PROJECT_ROOT"
            npm run package
            print_success "VSIX пакет створено!"
            ;;
        3)
            print_info "Валідація коду..."
            cd "$PROJECT_ROOT"
            npm run validate
            print_success "Валідація завершена!"
            ;;
        4)
            print_info "Публікація в Marketplace..."
            print_error "Функція в розробці!"
            ;;
        0)
            return
            ;;
        *)
            print_error "Неправильний вибір!"
            ;;
    esac
    
    echo
    read -p "Натисніть Enter для продовження..."
}

# ✅ Функція меню тестування
menu_testing() {
    clear
    print_header
    echo -e "${CYAN}
╔══════════════════════════════════════════════════════════════╗
║                  🐛 ТЕСТУВАННЯ ТА ВІДЛАГОДЖЕННЯ              ║
╚══════════════════════════════════════════════════════════════╝${NC}
"
    
    echo -e "${YELLOW}Виберіть опцію:${NC}"
    echo -e "${CYAN}1)${NC} ${FIRE} Автоматизоване тестування розширення"
    echo -e "${CYAN}2)${NC} ${BUG} Запуск всіх тестів проекту"
    echo -e "${CYAN}3)${NC} ${GEAR} Відлагодження проекту"
    echo -e "${CYAN}4)${NC} ${TOOL} Валідація команд розширення"
    echo -e "${CYAN}0)${NC} ${ARROW} Повернутись до головного меню"
    echo
    
    read -p "Ваш вибір: " choice
    
    case $choice in
        1)
            if [ -f "$PROJECT_ROOT/test_extension.sh" ]; then
                run_script_with_progress "../test_extension.sh" "Автоматизоване тестування"
            else
                print_error "Скрипт test_extension.sh не знайдено!"
            fi
            ;;
        2)
            run_script_with_progress "tests.sh" "Запуск всіх тестів"
            ;;
        3)
            run_script_with_progress "debug.sh" "Відлагодження проекту"
            ;;
        4)
            print_info "Валідація команд розширення..."
            cd "$PROJECT_ROOT"
            node -c extension.js
            print_success "Команди валідні!"
            ;;
        0)
            return
            ;;
        *)
            print_error "Неправильний вибір!"
            ;;
    esac
    
    echo
    read -p "Натисніть Enter для продовження..."
}

# ✅ Функція меню Git операцій
menu_git_operations() {
    clear
    print_header
    echo -e "${CYAN}
╔══════════════════════════════════════════════════════════════╗
║                      🌐 GIT ОПЕРАЦІЇ                         ║
╚══════════════════════════════════════════════════════════════╝${NC}
"
    
    echo -e "${YELLOW}Виберіть опцію:${NC}"
    echo -e "${CYAN}1)${NC} ${ROCKET} Швидкий commit та push"
    echo -e "${CYAN}2)${NC} ${STAR} Створення релізу з тегом"
    echo -e "${CYAN}3)${NC} ${GLOBE} Push в GitHub з налаштуваннями"
    echo -e "${CYAN}4)${NC} ${GEAR} Git статус та інформація"
    echo -e "${CYAN}0)${NC} ${ARROW} Повернутись до головного меню"
    echo
    
    read -p "Ваш вибір: " choice
    
    case $choice in
        1)
            echo -n "Введіть повідомлення коміту: "
            read commit_message
            if [ -n "$commit_message" ]; then
                cd "$PROJECT_ROOT"
                git add --all
                git commit -m "$commit_message"
                git push --force
                print_success "Зміни відправлені в репозиторій!"
            else
                print_error "Повідомлення коміту не може бути порожнім!"
            fi
            ;;
        2)
            echo -n "Введіть версію релізу (наприклад, v0.0.7): "
            read version
            if [ -n "$version" ]; then
                cd "$PROJECT_ROOT"
                git tag "$version"
                git push origin "$version"
                print_success "Реліз $version створено!"
            else
                print_error "Версія не може бути порожньою!"
            fi
            ;;
        3)
            run_script_with_progress "push-to-github.sh" "Push в GitHub"
            ;;
        4)
            print_info "Git статус проекту:"
            cd "$PROJECT_ROOT"
            git status
            git log --oneline -5
            ;;
        0)
            return
            ;;
        *)
            print_error "Неправильний вибір!"
            ;;
    esac
    
    echo
    read -p "Натисніть Enter для продовження..."
}

# ✅ Функція меню системної інформації
menu_system_info() {
    clear
    print_header
    echo -e "${CYAN}
╔══════════════════════════════════════════════════════════════╗
║                   ⚙️  СИСТЕМНА ІНФОРМАЦІЯ                    ║
╚══════════════════════════════════════════════════════════════╝${NC}
"
    
    show_project_stats
    check_scripts
    
    print_step "Перевірка залежностей..."
    
    # Перевірка Node.js
    if command -v node &> /dev/null; then
        print_success "Node.js: $(node --version)"
    else
        print_error "Node.js не встановлено"
    fi
    
    # Перевірка npm
    if command -v npm &> /dev/null; then
        print_success "npm: $(npm --version)"
    else
        print_error "npm не встановлено"
    fi
    
    # Перевірка VS Code
    if command -v code &> /dev/null; then
        print_success "VS Code CLI доступний"
    else
        print_error "VS Code CLI не доступний"
    fi
    
    # Перевірка Git
    if command -v git &> /dev/null; then
        print_success "Git: $(git --version | head -1)"
    else
        print_error "Git не встановлено"
    fi
    
    echo
    read -p "Натисніть Enter для продовження..."
}

# ✅ Функція меню утилітів
menu_utilities() {
    clear
    print_header
    echo -e "${CYAN}
╔══════════════════════════════════════════════════════════════╗
║                     🔧 УТИЛІТИ РОЗРОБКИ                      ║
╚══════════════════════════════════════════════════════════════╝${NC}
"
    
    echo -e "${YELLOW}Виберіть опцію:${NC}"
    echo -e "${CYAN}1)${NC} ${TOOL} Очищення проекту (node_modules, builds, logs)"
    echo -e "${CYAN}2)${NC} ${PACKAGE} Оновлення всіх залежностей"
    echo -e "${CYAN}3)${NC} ${GEAR} Резервне копіювання проекту"
    echo -e "${CYAN}4)${NC} ${FIRE} Повне переініціалізація проекту"
    echo -e "${CYAN}0)${NC} ${ARROW} Повернутись до головного меню"
    echo
    
    read -p "Ваш вибір: " choice
    
    case $choice in
        1)
            print_step "Очищення проекту..."
            cd "$PROJECT_ROOT"
            rm -rf node_modules builds logs backups
            print_success "Проект очищено!"
            ;;
        2)
            print_step "Оновлення залежностей..."
            cd "$PROJECT_ROOT"
            npm update
            print_success "Залежності оновлено!"
            ;;
        3)
            print_step "Створення резервної копії..."
            backup_name="backup_$(date +%Y%m%d_%H%M%S)"
            mkdir -p "$PROJECT_ROOT/backups"
            tar -czf "$PROJECT_ROOT/backups/$backup_name.tar.gz" \
                --exclude=node_modules \
                --exclude=.git \
                --exclude=backups \
                -C "$(dirname "$PROJECT_ROOT")" \
                "$(basename "$PROJECT_ROOT")"
            print_success "Резервну копію створено: $backup_name.tar.gz"
            ;;
        4)
            echo -e "${RED}${CROSS} УВАГА! Це видалить всі зміни та переініціалізує проект!${NC}"
            echo -n "Ви впевнені? (yes/no): "
            read confirmation
            if [ "$confirmation" = "yes" ]; then
                print_step "Переініціалізація проекту..."
                cd "$PROJECT_ROOT"
                rm -rf node_modules builds logs
                npm install
                print_success "Проект переініціалізовано!"
            else
                print_info "Скасовано користувачем"
            fi
            ;;
        0)
            return
            ;;
        *)
            print_error "Неправильний вибір!"
            ;;
    esac
    
    echo
    read -p "Натисніть Enter для продовження..."
}

# ✅ Головна функція меню
main_menu() {
    while true; do
        print_header
        show_project_stats
        print_menu
        
        echo -ne "${YELLOW}${ARROW} Ваш вибір: ${NC}"
        read choice
        
        case $choice in
            1)
                menu_generate_docs
                ;;
            2)
                menu_build_deploy
                ;;
            3)
                menu_testing
                ;;
            4)
                menu_git_operations
                ;;
            5)
                menu_system_info
                ;;
            6)
                menu_utilities
                ;;
            0)
                clear
                echo -e "${GREEN}
╔══════════════════════════════════════════════════════════════╗
║                    ${CHECKMARK} ДЯКУЄМО ЗА ВИКОРИСТАННЯ!                     ║
║                                                              ║
║              ${CYAN}🚀 CSS Classes from HTML v$PROJECT_VERSION${GREEN}               ║
║                   ${GRAY}Створено з ${RED}❤️${GRAY}  by $AUTHOR${GREEN}                    ║
║                                                              ║
║                     ${WHITE}До зустрічі! 👋${GREEN}                             ║
╚══════════════════════════════════════════════════════════════╝${NC}
"
                exit 0
                ;;
            *)
                print_error "Неправильний вибір! Спробуйте ще раз."
                sleep 2
                ;;
        esac
    done
}

# ✅ Функція ініціалізації
initialize() {
    # Перевірка, що ми в правильній директорії
    if [ ! -f "$PROJECT_ROOT/package.json" ]; then
        print_error "Помилка: package.json не знайдено!"
        print_info "Переконайтесь, що ви запускаете скрипт з кореня проекту."
        exit 1
    fi
    
    # Створення необхідних директорій
    mkdir -p "$PROJECT_ROOT/logs"
    mkdir -p "$PROJECT_ROOT/builds"
    mkdir -p "$PROJECT_ROOT/backups"
    
    # Запис логу запуску
    echo "$(date): Project Manager запущено" >> "$PROJECT_ROOT/logs/manager.log"
}

# ✅ Обробка помилок
error_handler() {
    print_error "Помилка на рядку $1"
    echo "$(date): ERROR at line $1" >> "$PROJECT_ROOT/logs/manager.log"
    exit 1
}

trap 'error_handler $LINENO' ERR

# ✅ Точка входу
main() {
    # Перехід в корінь проекту
    cd "$PROJECT_ROOT"
    
    initialize
    main_menu
}

# ✅ Запуск програми
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi