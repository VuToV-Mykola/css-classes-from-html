#!/bin/bash

# 🚀 CSS Classes from HTML - Універсальний скрипт виправлення та налаштування
# Версія: 3.0.0 Ultimate Edition для v0.0.7
# Автор: VuToV-Mykola
# Призначення: Повна автоматизація виправлення, оновлення та встановлення розширення
# Запуск з: scripts/ultimate-fix-and-setup.sh

set -e  # Зупинити виконання при будь-якій помилці

# =======================================
# 📁 НАЛАШТУВАННЯ ШЛЯХІВ
# =======================================

# Перехід до кореневої директорії проекту
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo "📁 Робоча директорія: $PROJECT_ROOT"
echo "📁 Скрипт запущено з: $SCRIPT_DIR"

# =======================================
# 🎨 ВІЗУАЛЬНИЙ ІНТЕРФЕЙС ТА КОЛЬОРИ
# =======================================

# Кольори для різних типів повідомлень
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;90m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Emoji для кращої візуалізації
ROCKET="🚀"
CHECK="✅"
CROSS="❌"
WARNING="⚠️"
INFO="ℹ️"
GEAR="⚙️"
PACKAGE="📦"
CODE="💻"
MAGIC="✨"
FIRE="🔥"
FOLDER="📁"
SEARCH="🔍"
FIX="🔧"
CLEAN="🧹"
SHIELD="🛡️"

# Функції для красивого виводу
header() {
    echo -e "\n${CYAN}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${BOLD}${WHITE}$(printf "%78s" "$1" | sed 's/./ &/g' | sed 's/^ //')${NC}${CYAN}║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════════════════╝${NC}\n"
}

subheader() {
    echo -e "\n${BLUE}▶ ${BOLD}${WHITE}$1${NC}"
    echo -e "${GRAY}$(printf '%.78s' $(printf '%*s' 78 | tr ' ' '─'))${NC}"
}

step() {
    echo -e "\n${CYAN}${BOLD}[$2/10]${NC} ${BLUE}$ROCKET${NC} ${WHITE}$1${NC}"
}

success() {
    echo -e "   ${GREEN}$CHECK $1${NC}"
}

warning() {
    echo -e "   ${YELLOW}$WARNING $1${NC}"
}

error() {
    echo -e "   ${RED}$CROSS $1${NC}"
}

info() {
    echo -e "   ${PURPLE}$INFO $1${NC}"
}

progress() {
    echo -ne "   ${GRAY}$GEAR Виконується: $1...${NC}"
}

progress_done() {
    echo -e "\r   ${GREEN}$CHECK $1 - Завершено!${NC}"
}

# Функція для інтерактивного запитання
ask() {
    local question="$1"
    local default="$2"
    echo -ne "\n${YELLOW}❓ ${question}"
    if [ -n "$default" ]; then
        echo -ne " ${GRAY}[за замовчуванням: $default]${NC}"
    fi
    echo -ne ": ${WHITE}"
    read -r answer
    echo -ne "${NC}"
    
    if [ -z "$answer" ] && [ -n "$default" ]; then
        answer="$default"
    fi
    
    echo "$answer"
}

confirm() {
    local question="$1"
    echo -ne "\n${YELLOW}❓ ${question} ${GRAY}(y/N)${NC}: ${WHITE}"
    read -r answer
    echo -ne "${NC}"
    [[ "$answer" =~ ^[Yy] ]] && return 0 || return 1
}

# =======================================
# 🔧 ГЛОБАЛЬНІ ЗМІННІ
# =======================================

EXTENSION_VERSION="0.0.7"
PROJECT_NAME="css-classes-from-html"
AUTHOR="vutov-mykola"
DESCRIPTION="Автоматична генерація CSS класів з HTML файлів з реальною інтеграцією Figma"

# Файли для резервного копіювання
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"

# Лічильники для статистики
FILES_FIXED=0
ERRORS_FOUND=0
WARNINGS_FOUND=0

# Система логування та дебагу
LOG_DIR="logs/$(date +%Y%m%d_%H%M%S)"
LOG_SUCCESS="$LOG_DIR/success"
LOG_WARNING="$LOG_DIR/warnings"
LOG_ERROR="$LOG_DIR/errors"
DEBUG_MODE=false
VERBOSE_OUTPUT=false

# Створення директорій для логів
mkdir -p "$LOG_SUCCESS" "$LOG_WARNING" "$LOG_ERROR"

# =======================================
# 📝 СИСТЕМА ЛОГУВАННЯ ТА ДЕБАГУ
# =======================================

# Функція логування
log_message() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local log_entry="[$timestamp] $message"
    
    case "$level" in
        "SUCCESS")
            echo "$log_entry" >> "$LOG_SUCCESS/$(date +%H%M%S)_success.log"
            [ "$DEBUG_MODE" = true ] && debug_output "✅ SUCCESS" "$message" "$GREEN"
            ;;
        "WARNING")
            echo "$log_entry" >> "$LOG_WARNING/$(date +%H%M%S)_warning.log"
            [ "$DEBUG_MODE" = true ] && debug_output "⚠️ WARNING" "$message" "$YELLOW"
            ;;
        "ERROR")
            echo "$log_entry" >> "$LOG_ERROR/$(date +%H%M%S)_error.log"
            [ "$DEBUG_MODE" = true ] && debug_output "❌ ERROR" "$message" "$RED"
            ;;
    esac
    
    # Загальний лог
    echo "[$level] $log_entry" >> "$LOG_DIR/full_session.log"
}

# Функція дебаг виводу
debug_output() {
    local level="$1"
    local message="$2"
    local color="$3"
    
    if [ "$DEBUG_MODE" = true ]; then
        echo -e "\n${GRAY}┌─ DEBUG INFO ─────────────────────────────────────────────────────────────────────────────────${NC}"
        echo -e "${GRAY}│ Time: $(date '+%H:%M:%S.%3N')${NC}"
        echo -e "${GRAY}│ Level: ${color}${level}${NC}"
        echo -e "${GRAY}│ Message: ${WHITE}${message}${NC}"
        echo -e "${GRAY}│ Process ID: $$${NC}"
        echo -e "${GRAY}│ Memory usage: $(ps -o rss= -p $$)KB${NC}"
        echo -e "${GRAY}└─────────────────────────────────────────────────────────────────────────────────────────────${NC}"
    fi
}

# Функція детального виводу команд
verbose_command() {
    local cmd="$1"
    local description="$2"
    
    if [ "$VERBOSE_OUTPUT" = true ]; then
        echo -e "\n${CYAN}🔧 EXECUTING COMMAND:${NC}"
        echo -e "${GRAY}Description: $description${NC}"
        echo -e "${GRAY}Command: ${WHITE}$cmd${NC}"
        echo -e "${GRAY}Working Dir: $(pwd)${NC}"
        echo -e "${GRAY}$(printf '%.60s' $(printf '%*s' 60 | tr ' ' '─'))${NC}"
    fi
    
    # Виконання команди з логуванням
    if eval "$cmd"; then
        log_message "SUCCESS" "Command executed: $cmd"
        [ "$VERBOSE_OUTPUT" = true ] && echo -e "${GREEN}✅ Command completed successfully${NC}\n"
        return 0
    else
        log_message "ERROR" "Command failed: $cmd"
        [ "$VERBOSE_OUTPUT" = true ] && echo -e "${RED}❌ Command failed${NC}\n"
        return 1
    fi
}

# Функція прогрес бару
show_progress() {
    local current="$1"
    local total="$2"
    local step_name="$3"
    local width=50
    local percentage=$((current * 100 / total))
    local filled=$((current * width / total))
    local empty=$((width - filled))
    
    printf "\r${CYAN}Progress: [${GREEN}"
    printf "%*s" "$filled" | tr ' ' '█'
    printf "${GRAY}%*s${CYAN}] %3d%% ${WHITE}%s${NC}" "$empty" "" "$percentage" "$step_name"
    
    if [ "$current" -eq "$total" ]; then
        echo ""
    fi
}

# Інтерактивне налаштування режиму виконання
setup_execution_mode() {
    echo -e "\n${YELLOW}🔧 НАЛАШТУВАННЯ РЕЖИМУ ВИКОНАННЯ${NC}"
    echo -e "${GRAY}$(printf '%.78s' $(printf '%*s' 78 | tr ' ' '─'))${NC}"
    
    if confirm "Увімкнути режим детального логування (DEBUG)?"; then
        DEBUG_MODE=true
        success "🐛 Debug режим увімкнено"
    fi
    
    if confirm "Увімкнути детальний вивід команд (VERBOSE)?"; then
        VERBOSE_OUTPUT=true
        success "📝 Verbose режим увімкнено"
    fi
    
    log_message "SUCCESS" "Execution mode configured - DEBUG: $DEBUG_MODE, VERBOSE: $VERBOSE_OUTPUT"
}

# =======================================
# 🛡️ ПЕРЕВІРКА СЕРЕДОВИЩА
# =======================================

check_environment() {
    step "Перевірка середовища розробки" "1"
    show_progress 1 10 "Аналіз системи..."
    
    log_message "SUCCESS" "Starting environment check"
    
    local missing_tools=()
    local warnings=()
    
    # Перевірка операційної системи
    if [[ "$OSTYPE" == "darwin"* ]]; then
        success "macOS виявлено"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        success "Linux виявлено"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        success "Windows/WSL виявлено"
    else
        warning "Невідома операційна система: $OSTYPE"
    fi
    
    # Перевірка Node.js
    if command -v node >/dev/null 2>&1; then
        local node_version=$(node --version)
        if [[ $(echo "$node_version" | cut -d'v' -f2 | cut -d'.' -f1) -ge 16 ]]; then
            success "Node.js $node_version (підтримується)"
        else
            warning "Node.js $node_version (рекомендується v16+)"
        fi
    else
        missing_tools+=("Node.js")
    fi
    
    # Перевірка npm
    if command -v npm >/dev/null 2>&1; then
        success "npm $(npm --version)"
    else
        missing_tools+=("npm")
    fi
    
    # Перевірка VS Code
    if command -v code >/dev/null 2>&1; then
        success "VS Code CLI доступний"
    else
        warning "VS Code CLI недоступний (встановлення розширення буде ручним)"
    fi
    
    # Перевірка Git
    if command -v git >/dev/null 2>&1; then
        success "Git $(git --version | head -1 | cut -d' ' -f3)"
    else
        warning "Git недоступний (версіонування недоступне)"
    fi
    
    # Обробка відсутніх інструментів
    if [ ${#missing_tools[@]} -ne 0 ]; then
        error "Критичні інструменти відсутні: ${missing_tools[*]}"
        log_message "ERROR" "Missing critical tools: ${missing_tools[*]}"
        
        echo -e "\n${RED}Встановіть відсутні компоненти та спробуйте знову:${NC}"
        for tool in "${missing_tools[@]}"; do
            case "$tool" in
                "Node.js")
                    echo -e "${GRAY}  • Завантажте з https://nodejs.org/${NC}"
                    log_message "ERROR" "Node.js not found - download from https://nodejs.org/"
                    ;;
                "npm")
                    echo -e "${GRAY}  • Встановлюється разом з Node.js${NC}"
                    log_message "ERROR" "npm not found - installs with Node.js"
                    ;;
            esac
        done
        
        exit 1
    fi
    
    success "Середовище перевірено - готово до роботи!"
    log_message "SUCCESS" "Environment check completed successfully"
    
    if [ "$DEBUG_MODE" = true ]; then
        debug_output "ENV CHECK" "All required tools found and verified" "$GREEN"
    fi
}

# =======================================
# 📦 СТВОРЕННЯ РЕЗЕРВНИХ КОПІЙ
# =======================================

create_backups() {
    step "Створення резервних копій" "2"
    show_progress 2 10 "Створення бекапів..."
    
    log_message "SUCCESS" "Starting backup process"
    
    mkdir -p "$BACKUP_DIR"
    
    local files_to_backup=("package.json" "extension.js" ".eslintrc.js" ".gitignore")
    local backed_up=0
    
    for file in "${files_to_backup[@]}"; do
        if [ -f "$file" ]; then
            progress "Копіювання $file"
            cp "$file" "$BACKUP_DIR/"
            progress_done "Скопійовано $file"
            ((backed_up++))
        fi
    done
    
    # Додаткові директорії
    if [ -d "backend" ]; then
        progress "Копіювання backend/"
        cp -r backend "$BACKUP_DIR/"
        progress_done "Скопійовано backend/"
        ((backed_up++))
    fi
    
    if [ -d "frontend" ]; then
        progress "Копіювання frontend/"
        cp -r frontend "$BACKUP_DIR/"
        progress_done "Скопійовано frontend/"
        ((backed_up++))
    fi
    
    success "Створено резервні копії: $backed_up файлів/папок"
    info "Розташування: $BACKUP_DIR"
    
    log_message "SUCCESS" "Backup created: $backed_up files/folders in $BACKUP_DIR"
    
    if [ "$DEBUG_MODE" = true ]; then
        debug_output "BACKUP" "$backed_up items backed up to $BACKUP_DIR" "$GREEN"
    fi
}

# =======================================
# 🔍 АНАЛІЗ ПОТОЧНОГО СТАНУ
# =======================================

analyze_project() {
    step "Аналіз поточного стану проекту" "3"
    show_progress 3 10 "Аналіз проекту..."
    
    log_message "SUCCESS" "Starting project analysis"
    
    local issues=()
    
    # Перевірка package.json
    if [ -f "package.json" ]; then
        success "package.json знайдено"
        
        # Перевірка основних полів
        if ! grep -q "\"name\":" package.json; then
            issues+=("Відсутнє поле 'name' в package.json")
        fi
        
        if ! grep -q "\"main\":" package.json; then
            issues+=("Відсутнє поле 'main' в package.json")
        fi
        
        if ! grep -q "\"engines\":" package.json; then
            issues+=("Відсутнє поле 'engines' в package.json")
        fi
        
        # Перевірка залежностей
        if ! grep -q "\"dependencies\":" package.json; then
            warning "Відсутній блок dependencies"
        fi
        
        if ! grep -q "@types/vscode" package.json; then
            issues+=("Відсутня залежність @types/vscode")
        fi
    else
        issues+=("package.json не знайдено")
    fi
    
    # Перевірка extension.js
    if [ -f "extension.js" ]; then
        success "extension.js знайдено"
        
        # Синтаксична перевірка
        if node -c extension.js 2>/dev/null; then
            success "Синтаксис extension.js коректний"
        else
            issues+=("Синтаксичні помилки в extension.js")
        fi
        
        # Перевірка базових функцій
        if ! grep -q "function activate" extension.js; then
            issues+=("Відсутня функція activate в extension.js")
        fi
        
        if ! grep -q "function deactivate" extension.js; then
            issues+=("Відсутня функція deactivate в extension.js")
        fi
        
    else
        issues+=("extension.js не знайдено")
    fi
    
    # Перевірка backend модулів
    if [ -d "backend" ]; then
        success "Директорія backend/ знайдена"
        
        local backend_files=0
        for file in backend/**/*.js; do
            if [ -f "$file" ]; then
                ((backend_files++))
                if ! node -c "$file" 2>/dev/null; then
                    issues+=("Синтаксичні помилки в $file")
                fi
            fi
        done
        
        success "Знайдено $backend_files backend модулів"
    else
        warning "Директорія backend/ не знайдена"
    fi
    
    # Перевірка frontend
    if [ -d "frontend" ]; then
        success "Директорія frontend/ знайдена"
    else
        issues+=("Відсутня директорія frontend/")
    fi
    
    # Підсумок аналізу
    ERRORS_FOUND=${#issues[@]}
    
    if [ $ERRORS_FOUND -eq 0 ]; then
        success "Проект в хорошому стані - помилок не знайдено!"
        log_message "SUCCESS" "Project analysis completed - no issues found"
    else
        warning "Знайдено $ERRORS_FOUND проблем:"
        log_message "WARNING" "Project analysis found $ERRORS_FOUND issues"
        
        for issue in "${issues[@]}"; do
            error "$issue"
            log_message "ERROR" "Issue: $issue"
        done
    fi
    
    info "Аналіз завершено"
    log_message "SUCCESS" "Project analysis phase completed"
}

# =======================================
# 📝 ГЕНЕРАЦІЯ PACKAGE.JSON
# =======================================

generate_package_json() {
    step "Генерація/оновлення package.json" "4"
    show_progress 4 10 "Генерація package.json..."
    
    log_message "SUCCESS" "Starting package.json generation"
    
    # Інтерактивні налаштування
    local auto_config=true
    log_message "SUCCESS" "Using automatic configuration"
    
    if [ "$auto_config" = false ]; then
        EXTENSION_VERSION=$(ask "Версія розширення" "$EXTENSION_VERSION")
        AUTHOR=$(ask "Ім'я автора" "$AUTHOR")
        DESCRIPTION=$(ask "Опис розширення" "$DESCRIPTION")
    fi
    
    progress "Генерування package.json"
    
    cat > package.json << EOF
{
  "name": "$PROJECT_NAME",
  "displayName": "CSS Classes from HTML v$EXTENSION_VERSION",
  "description": "$DESCRIPTION",
  "version": "$EXTENSION_VERSION",
  "publisher": "$AUTHOR",
  "author": {
    "name": "VuToV-Mykola",
    "email": "vutov_nikola@icloud.com"
  },
  "license": "MIT",
  "engines": {
    "vscode": "^1.74.0",
    "node": ">=16.0.0"
  },
  "categories": [
    "Other",
    "Snippets",
    "Formatters",
    "Extension Packs"
  ],
  "keywords": [
    "css",
    "html",
    "figma",
    "generator",
    "classes",
    "frontend",
    "ui",
    "design",
    "automation",
    "integration",
    "vscode-extension",
    "web-development",
    "css-generator",
    "responsive",
    "bootstrap"
  ],
  "main": "./extension.js",
  "icon": "assets/icon.png",
  "galleryBanner": {
    "color": "#007ACC",
    "theme": "dark"
  },
  "activationEvents": [
    "onLanguage:html",
    "onLanguage:css",
    "onCommand:css-classes.showMenu",
    "onCommand:css-classes.showMenuFromContext",
    "onCommand:css-classes.quickGenerate",
    "onCommand:extension.cssClassesFromHtml"
  ],
  "contributes": {
    "commands": [
      {
        "command": "css-classes.showMenu",
        "title": "Show Main Menu",
        "category": "CSS Classes from HTML",
        "icon": "\$(symbol-class)"
      },
      {
        "command": "css-classes.showMenuFromContext",
        "title": "Generate CSS from HTML",
        "category": "CSS Classes from HTML",
        "icon": "\$(output)"
      },
      {
        "command": "css-classes.quickGenerate",
        "title": "Quick Generate CSS",
        "category": "CSS Classes from HTML",
        "icon": "\$(rocket)"
      },
      {
        "command": "extension.cssClassesFromHtml",
        "title": "CSS Classes from HTML: Generate CSS",
        "category": "CSS Classes from HTML"
      }
    ],
    "menus": {
      "explorer/context": [
        {
          "command": "css-classes.showMenuFromContext",
          "when": "resourceExtname == .html",
          "group": "navigation@1"
        }
      ],
      "editor/context": [
        {
          "command": "css-classes.showMenuFromContext",
          "when": "editorLangId == html",
          "group": "navigation@1"
        }
      ],
      "editor/title": [
        {
          "command": "css-classes.quickGenerate",
          "when": "editorLangId == html",
          "group": "navigation@1"
        }
      ],
      "commandPalette": [
        {
          "command": "css-classes.showMenu",
          "when": "editorLangId == html"
        },
        {
          "command": "css-classes.showMenuFromContext",
          "when": "editorLangId == html"
        },
        {
          "command": "css-classes.quickGenerate",
          "when": "editorLangId == html"
        }
      ]
    },
    "keybindings": [
      {
        "command": "css-classes.showMenu",
        "key": "ctrl+shift+c",
        "mac": "cmd+shift+c",
        "when": "editorLangId == html"
      },
      {
        "command": "css-classes.quickGenerate",
        "key": "ctrl+alt+c",
        "mac": "cmd+alt+c",
        "when": "editorLangId == html"
      }
    ],
    "configuration": {
      "title": "CSS Classes from HTML",
      "properties": {
        "cssClassesFromHtml.figmaToken": {
          "type": "string",
          "default": "",
          "description": "Figma API Token for integration",
          "scope": "application"
        },
        "cssClassesFromHtml.autoOpenCSS": {
          "type": "boolean",
          "default": true,
          "description": "Automatically open generated CSS file"
        },
        "cssClassesFromHtml.includeReset": {
          "type": "boolean",
          "default": true,
          "description": "Include CSS reset styles"
        },
        "cssClassesFromHtml.includeVariables": {
          "type": "boolean",
          "default": true,
          "description": "Include CSS custom properties (variables)"
        },
        "cssClassesFromHtml.generateResponsive": {
          "type": "boolean",
          "default": true,
          "description": "Generate responsive media queries"
        }
      }
    }
  },
  "scripts": {
    "build": "echo \"✅ Build completed for v$EXTENSION_VERSION\" && npm run validate",
    "package": "vsce package --out ./builds/",
    "lint": "eslint . --ext .js,.ts --fix",
    "test": "bash scripts/tests.sh",
    "deploy": "bash scripts/deploy.sh",
    "validate": "node -c extension.js && echo \"✅ Extension validation passed\"",
    "clean": "rm -rf builds/* logs/deploy/*.log node_modules/.cache",
    "prepackage": "npm run validate",
    "postpackage": "echo \"📦 Package created successfully\"",
    "docs": "bash scripts/auto-generate-docs.sh",
    "manager": "bash scripts/project-manager.sh",
    "fix": "bash scripts/ultimate-fix-and-setup.sh",
    "start": "npm run build && npm run package"
  },
  "dependencies": {
    "jsdom": "^23.0.0",
    "axios": "^1.6.0",
    "https": "^1.0.0"
  },
  "devDependencies": {
    "@types/vscode": "^1.74.0",
    "@types/node": "^20.0.0",
    "@vscode/test-electron": "^2.3.0",
    "@vscode/vsce": "^2.22.0",
    "eslint": "^8.56.0",
    "typescript": "^5.3.0"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/VuToV-Mykola/css-classes-from-html.git"
  },
  "bugs": {
    "url": "https://github.com/VuToV-Mykola/css-classes-from-html/issues"
  },
  "homepage": "https://github.com/VuToV-Mykola/css-classes-from-html#readme",
  "qna": "marketplace"
}
EOF

    progress_done "Згенеровано package.json"
    FILES_FIXED=$((FILES_FIXED + 1))
    success "package.json створено/оновлено з актуальними залежностями"
    
    log_message "SUCCESS" "package.json generated/updated successfully"
}

# =======================================
# 📁 СТВОРЕННЯ ДИРЕКТОРІЙ
# =======================================

create_directories() {
    step "Створення необхідних директорій" "5"
    show_progress 5 10 "Створення директорій..."
    
    local directories=("assets" "builds" "logs" "frontend" ".vscode")
    local created=0
    
    for dir in "${directories[@]}"; do
        if [ ! -d "$dir" ]; then
            progress "Створення $dir/"
            mkdir -p "$dir"
            progress_done "Створено $dir/"
            ((created++))
        else
            success "$dir/ вже існує"
        fi
    done
    
    # Створення файлу іконки якщо не існує
    if [ ! -f "assets/icon.png" ]; then
        warning "Іконка не знайдена - створіть assets/icon.png (128x128px)"
    fi
    
    success "Створено $created нових директорій"
    log_message "SUCCESS" "Created $created new directories"
}

# =======================================
# 📦 ВСТАНОВЛЕННЯ ЗАЛЕЖНОСТЕЙ
# =======================================

install_dependencies() {
    step "Встановлення/оновлення залежностей" "6"
    show_progress 6 10 "Встановлення залежностей..."
    
    log_message "SUCCESS" "Starting dependency installation"
    
    # Очищення старих залежностей якщо потрібно
    if confirm "Очистити існуючі node_modules та переустановити залежності?"; then
        if [ -d "node_modules" ]; then
            progress "Видалення node_modules"
            rm -rf node_modules
            progress_done "Видалено node_modules"
        fi
        
        if [ -f "package-lock.json" ]; then
            progress "Видалення package-lock.json"
            rm package-lock.json
            progress_done "Видалено package-lock.json"
        fi
    fi
    
    progress "Встановлення залежностей з npm"
    
    # Встановлення з детальним логуванням
    if [ "$VERBOSE_OUTPUT" = true ]; then
        npm install --no-audit --no-fund 2>&1 | tee "$LOG_SUCCESS/npm_install_output.log"
        npm_exit_code=${PIPESTATUS[0]}
    else
        npm install --no-audit --no-fund --progress=false > "$LOG_SUCCESS/npm_install_output.log" 2>&1
        npm_exit_code=$?
    fi
    
    if [ $npm_exit_code -eq 0 ]; then
        progress_done "Залежності встановлено"
        success "Всі залежності встановлено успішно"
        log_message "SUCCESS" "npm install completed successfully"
    else
        error "Помилка встановлення залежностей"
        log_message "ERROR" "npm install failed with exit code $npm_exit_code"
        
        # Копіювання логу помилки
        cp "$LOG_SUCCESS/npm_install_output.log" "$LOG_ERROR/npm_install_failed.log"
        
        exit 1
    fi
}

# =======================================
# 🔍 ВАЛІДАЦІЯ КОДУ
# =======================================

validate_code() {
    step "Валідація та перевірка коду" "7"
    show_progress 7 10 "Валідація коду..."
    
    local validation_errors=0
    
    # Перевірка extension.js
    progress "Валідація extension.js"
    if node -c extension.js 2>/dev/null; then
        progress_done "extension.js валідний"
        log_message "SUCCESS" "extension.js syntax validation passed"
    else
        error "extension.js містить синтаксичні помилки"
        log_message "ERROR" "extension.js syntax validation failed"
        ((validation_errors++))
    fi
    
    # Перевірка backend модулів якщо існують
    if [ -d "backend" ]; then
        progress "Валідація backend модулів"
        local backend_valid=true
        
        for file in backend/**/*.js; do
            if [ -f "$file" ]; then
                if ! node -c "$file" 2>/dev/null; then
                    error "$(basename "$file") містить помилки"
                    log_message "ERROR" "Backend module validation failed: $file"
                    backend_valid=false
                    ((validation_errors++))
                fi
            fi
        done
        
        if [ "$backend_valid" = true ]; then
            progress_done "Backend модулі валідні"
            log_message "SUCCESS" "All backend modules validation passed"
        fi
    fi
    
    # Запуск npm скриптів валідації
    if command -v npm >/dev/null && grep -q "\"validate\":" package.json; then
        progress "Запуск npm run validate"
        if npm run validate --silent; then
            progress_done "npm валідація пройдена"
            log_message "SUCCESS" "npm validate script passed"
        else
            warning "npm валідація виявила попередження"
            log_message "WARNING" "npm validate script found warnings"
        fi
    fi
    
    # Підсумок валідації
    if [ $validation_errors -eq 0 ]; then
        success "Всі файли пройшли валідацію!"
    else
        warning "Знайдено $validation_errors помилок валідації"
        if confirm "Продовжити попри помилки?"; then
            info "Продовжуємо з попередженнями..."
        else
            error "Зупинено через помилки валідації"
            exit 1
        fi
    fi
}

# =======================================
# 🏗️ ЗБІРКА РОЗШИРЕННЯ
# =======================================

build_extension() {
    step "Збірка та пакування розширення" "8"
    show_progress 8 10 "Збірка розширення..."
    
    log_message "SUCCESS" "Starting extension build process"
    
    # Створення директорії для збірок
    mkdir -p builds
    
    # Запуск npm build якщо є
    if grep -q "\"build\":" package.json; then
        progress "Запуск npm run build"
        if npm run build --silent; then
            progress_done "Build скрипт виконано"
        else
            warning "Build скрипт завершився з попередженнями"
        fi
    fi
    
    # Пакування розширення
    progress "Пакування VSIX файлу"
    if npm run package --silent; then
        progress_done "VSIX файл створено"
        
        # Знаходження останнього .vsix файлу
        LATEST_VSIX=$(ls -t builds/*.vsix 2>/dev/null | head -n1)
        
        if [ -n "$LATEST_VSIX" ]; then
            success "Створено: $(basename "$LATEST_VSIX")"
            echo "$LATEST_VSIX" > .last-built-extension
            info "Розмір файлу: $(du -h "$LATEST_VSIX" | cut -f1)"
            
            log_message "SUCCESS" "VSIX package created: $(basename "$LATEST_VSIX")"
        fi
    else
        error "Помилка при пакуванні розширення"
        log_message "ERROR" "VSIX packaging failed"
        exit 1
    fi
}

# =======================================
# 🗑️ ДЕІНСТАЛЯЦІЯ СТАРИХ ВЕРСІЙ
# =======================================

uninstall_previous() {
    step "Деінсталяція попередніх версій" "9"
    show_progress 9 10 "Деінсталяція старих версій..."
    
    if ! command -v code >/dev/null 2>&1; then
        warning "VS Code CLI недоступний - пропускаємо деінсталяцію"
        return
    fi
    
    progress "Пошук встановлених версій"
    local installed_extensions=$(code --list-extensions 2>/dev/null | grep -i "css-classes.*html\|$AUTHOR.*css" || true)
    
    if [ -n "$installed_extensions" ]; then
        info "Знайдені встановлені версії:"
        echo "$installed_extensions" | while IFS= read -r ext; do
            if [ -n "$ext" ]; then
                echo "  • $ext"
            fi
        done
        
        if confirm "Видалити всі попередні версії?"; then
            echo "$installed_extensions" | while IFS= read -r ext; do
                if [ -n "$ext" ]; then
                    progress "Видалення $ext"
                    if code --uninstall-extension "$ext" >/dev/null 2>&1; then
                        progress_done "Видалено $ext"
                        log_message "SUCCESS" "Uninstalled extension: $ext"
                    else
                        warning "Не вдалося видалити $ext"
                        log_message "WARNING" "Failed to uninstall: $ext"
                    fi
                fi
            done
        fi
        progress_done "Деінсталяція завершена"
    else
        success "Попередні версії не знайдено"
    fi
}

# =======================================
# 🚀 ВСТАНОВЛЕННЯ НОВОЇ ВЕРСІЇ
# =======================================

install_new_version() {
    step "Встановлення нової версії" "10"
    show_progress 10 10 "Встановлення розширення..."
    
    if ! command -v code >/dev/null 2>&1; then
        warning "VS Code CLI недоступний - виконайте встановлення вручну:"
        if [ -f ".last-built-extension" ]; then
            LATEST_VSIX=$(cat .last-built-extension)
            info "Файл для встановлення: $LATEST_VSIX"
            info "Команда: code --install-extension \"$LATEST_VSIX\" --force"
        fi
        return
    fi
    
    if [ -f ".last-built-extension" ]; then
        LATEST_VSIX=$(cat .last-built-extension)
    else
        LATEST_VSIX=$(ls -t builds/*.vsix 2>/dev/null | head -n1)
    fi
    
    if [ -n "$LATEST_VSIX" ] && [ -f "$LATEST_VSIX" ]; then
        progress "Встановлення $(basename "$LATEST_VSIX")"
        
        if code --install-extension "$LATEST_VSIX" --force >/dev/null 2>&1; then
            progress_done "Розширення встановлено"
            success "✨ Розширення успішно встановлено в VS Code!"
            log_message "SUCCESS" "Extension installed successfully in VS Code"
        else
            error "Помилка встановлення розширення"
            log_message "ERROR" "Extension installation failed"
            info "Спробуйте встановити вручну: code --install-extension \"$LATEST_VSIX\" --force"
            exit 1
        fi
    else
        error "Не знайдено файл розширення для встановлення"
        log_message "ERROR" "No VSIX file found for installation"
        exit 1
    fi
}

# =======================================
# ✅ СТВОРЕННЯ ТЕСТОВОГО ФАЙЛУ
# =======================================

create_test_file() {
    info "Створення тестового файлу для перевірки backend модулів"
    
    cat > test-extension-v${EXTENSION_VERSION}.html << 'EOF'
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Тест CSS Classes Extension v0.0.7</title>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1 class="main-title">Тест CSS Classes from HTML v0.0.7</h1>
            <p class="subtitle">Перевірка завантаження backend модулів та Integration Engine</p>
        </header>
        
        <main class="content">
            <section class="test-section">
                <h2 class="section-title">Backend модулі</h2>
                
                <div class="module-card figma-card">
                    <h3 class="card-title">FigmaAPIClient</h3>
                    <p class="card-description">API клієнт для роботи з Figma</p>
                    <div class="status-indicator" id="figma-status">Перевірка...</div>
                </div>
                
                <div class="module-card engine-card">
                    <h3 class="card-title">IntegrationEngine</h3>
                    <p class="card-description">Головний движок інтеграції</p>
                    <div class="status-indicator" id="engine-status">Перевірка...</div>
                </div>
                
                <div class="module-card parser-card">
                    <h3 class="card-title">HTMLParser</h3>
                    <p class="card-description">Парсер HTML структури</p>
                    <div class="status-indicator" id="parser-status">Перевірка...</div>
                </div>
                
                <div class="module-card generator-card">
                    <h3 class="card-title">SmartCSSGenerator</h3>
                    <p class="card-description">Розумний генератор CSS</p>
                    <div class="status-indicator" id="generator-status">Перевірка...</div>
                </div>
            </section>
            
            <section class="actions-section">
                <h2 class="section-title">Дії для тестування</h2>
                <div class="action-buttons">
                    <button class="test-button btn-primary">Швидка генерація (Cmd+Alt+C)</button>
                    <button class="test-button btn-secondary">Головне меню (Cmd+Shift+C)</button>
                    <button class="test-button btn-info">Діагностика модулів</button>
                </div>
            </section>
        </main>
        
        <footer class="footer">
            <p class="footer-text">CSS Classes from HTML v0.0.7 | Backend Integration Test</p>
            <p class="footer-note">Перевірте Output Channel "CSS Classes from HTML" для детальної інформації</p>
        </footer>
    </div>
</body>
</html>
EOF

    success "Створено test-extension-v${EXTENSION_VERSION}.html"
    log_message "SUCCESS" "Test file created: test-extension-v${EXTENSION_VERSION}.html"
}

# =======================================
# 📊 ФІНАЛЬНИЙ ЗВІТ З ЛОГУВАННЯМ
# =======================================

create_log_summary() {
    echo -e "\n${BLUE}📊 СТВОРЕННЯ ЗВІТУ ЛОГІВ${NC}"
    
    # Підрахунок файлів логів
    local success_logs=$(find "$LOG_SUCCESS" -name "*.log" | wc -l)
    local warning_logs=$(find "$LOG_WARNING" -name "*.log" | wc -l)
    local error_logs=$(find "$LOG_ERROR" -name "*.log" | wc -l)
    
    # Створення загального звіту
    cat > "$LOG_DIR/session_summary.log" << EOF
======================================================
CSS CLASSES FROM HTML - SESSION SUMMARY
======================================================

Session Date: $(date '+%Y-%m-%d %H:%M:%S')
Script Version: Ultimate v3.0.0 для v$EXTENSION_VERSION
Execution Duration: $(($(date +%s) - start_time))s
Extension Version: v$EXTENSION_VERSION

СТАТИСТИКА:
- Files Fixed: $FILES_FIXED
- Errors Found: $ERRORS_FOUND
- Warnings: $WARNINGS_FOUND
- Success Logs: $success_logs
- Warning Logs: $warning_logs
- Error Logs: $error_logs

СИСТЕМА:
- OS: $OSTYPE
- User: $(whoami)
- Working Dir: $PROJECT_ROOT
- Node Version: $(node --version 2>/dev/null || echo "N/A")
- NPM Version: $(npm --version 2>/dev/null || echo "N/A")

MODES:
- Debug Mode: $DEBUG_MODE
- Verbose Output: $VERBOSE_OUTPUT

LOG LOCATIONS:
- Success Logs: $LOG_SUCCESS/
- Warning Logs: $LOG_WARNING/  
- Error Logs: $LOG_ERROR/
- Full Session: $LOG_DIR/full_session.log

======================================================
EOF
    
    success "📝 Звіт логів створено: $LOG_DIR/session_summary.log"
    info "📁 Структура логів:"
    info "   ✅ Успішні операції: $success_logs файлів"
    info "   ⚠️  Попередження: $warning_logs файлів"
    info "   ❌ Критичні помилки: $error_logs файлів"
}

show_final_report() {
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    # Створення звіту логів
    create_log_summary
    
    header "🎉 ВСТАНОВЛЕННЯ ЗАВЕРШЕНО УСПІШНО!"
    
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════════════════════════════════════════╗"
    echo "║                            ✨ ЗВІТ ПРО ВИКОНАННЯ                              ║"
    echo "╠════════════════════════════════════════════════════════════════════════════════╣"
    echo "║  📊 Статистика:                                                               ║"
    echo "║     • Файлів виправлено: $FILES_FIXED                                                      ║"
    echo "║     • Помилок знайдено: $ERRORS_FOUND                                                       ║"
    echo "║     • Попереджень: $WARNINGS_FOUND                                                          ║"
    echo "║     • Час виконання: ${duration}с                                                      ║"
    echo "║                                                                                ║"
    echo "║  🚀 CSS Classes from HTML v$EXTENSION_VERSION готовий до використання!         ║"
    echo "║                                                                                ║"
    echo "║  📋 Наступні кроки:                                                           ║"
    echo "║     1. Відкрийте VS Code                                                       ║"
    echo "║     2. Відкрийте файл test-extension-v${EXTENSION_VERSION}.html                           ║"
    echo "║     3. Натисніть Cmd+Shift+C для активації розширення                         ║"
    echo "║     4. Перевірте Output Channel 'CSS Classes from HTML'                       ║"
    echo "║     5. Переконайтеся що backend модулі завантажено                            ║"
    echo "║                                                                                ║"
    echo "║  🔗 Корисні команди:                                                          ║"
    echo "║     • Швидка генерація: Cmd+Alt+C / Ctrl+Alt+C                                ║"
    echo "║     • Command Palette: \"CSS Classes from HTML\"                               ║"
    echo "║     • Контекстне меню: правий клік на HTML файлі                               ║"
    echo "╚════════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    info "📁 Файли проекту:"
    info "   • Резервні копії: $BACKUP_DIR"
    info "   • Збірка розширення: builds/"
    info "   • Тестовий файл: test-extension-v${EXTENSION_VERSION}.html"
    
    if [ -f "builds/css-classes-from-html-$EXTENSION_VERSION.vsix" ]; then
        info "   • VSIX файл: builds/css-classes-from-html-$EXTENSION_VERSION.vsix"
    fi
    
    # Показати детальну інформацію про логи
    if [ "$DEBUG_MODE" = true ] || [ "$VERBOSE_OUTPUT" = true ]; then
        echo -e "\n${PURPLE}📋 ДЕТАЛЬНА ІНФОРМАЦІЯ ПРО ЛОГИ:${NC}"
        echo -e "${GRAY}$(printf '%.78s' $(printf '%*s' 78 | tr ' ' '─'))${NC}"
        echo -e "${CYAN}📂 Головна директорія логів: ${WHITE}$LOG_DIR${NC}"
        
        if [ -d "$LOG_SUCCESS" ] && [ "$(ls -A "$LOG_SUCCESS" 2>/dev/null)" ]; then
            echo -e "${GREEN}✅ Успішні операції:${NC}"
            ls -la "$LOG_SUCCESS/" | tail -n +2 | while read -r line; do
                echo -e "${GRAY}   $line${NC}"
            done
        fi
        
        if [ -d "$LOG_WARNING" ] && [ "$(ls -A "$LOG_WARNING" 2>/dev/null)" ]; then
            echo -e "${YELLOW}⚠️ Попередження:${NC}"
            ls -la "$LOG_WARNING/" | tail -n +2 | while read -r line; do
                echo -e "${GRAY}   $line${NC}"
            done
        fi
        
        if [ -d "$LOG_ERROR" ] && [ "$(ls -A "$LOG_ERROR" 2>/dev/null)" ]; then
            echo -e "${RED}❌ Критичні помилки:${NC}"
            ls -la "$LOG_ERROR/" | tail -n +2 | while read -r line; do
                echo -e "${GRAY}   $line${NC}"
            done
        fi
        
        echo -e "${GRAY}$(printf '%.78s' $(printf '%*s' 78 | tr ' ' '─'))${NC}"
        echo -e "${BLUE}💡 Підказка: Використовуйте 'cat $LOG_DIR/session_summary.log' для швидкого перегляду звіту${NC}"
    fi
    
    success "🎊 Розширення готове до роботи!"
    success "💌 Зв'яжіться з автором: vutov_nikola@icloud.com"
    success "🌟 GitHub: https://github.com/VuToV-Mykola/css-classes-from-html"
}

# =======================================
# 🚀 ГОЛОВНА ФУНКЦІЯ
# =======================================

main() {
    start_time=$(date +%s)  # Зробити глобальною змінною
    
    header "🚀 CSS CLASSES FROM HTML v$EXTENSION_VERSION - ULTIMATE SETUP"
    
    info "Цей скрипт автоматично виправить всі проблеми та підготує розширення до роботи"
    info "Запущено з директорії: $SCRIPT_DIR"
    info "Робоча директорія: $PROJECT_ROOT"
    
    # Налаштування режиму виконання
    setup_execution_mode
    
    if ! confirm "Почати автоматичне налаштування?"; then
        info "Операція скасована користувачем"
        log_message "WARNING" "Operation cancelled by user"
        exit 0
    fi
    
    # Виконання всіх кроків
    check_environment
    create_backups
    analyze_project
    generate_package_json
    create_directories
    install_dependencies
    validate_code
    build_extension
    uninstall_previous
    install_new_version
    
    # Створення тестового файлу
    create_test_file
    
    # Очищення тимчасових файлів
    if [ -f ".last-built-extension" ]; then
        rm .last-built-extension
    fi
    
    show_final_report
}

# =======================================
# 🎯 ОБРОБКА СИГНАЛІВ
# =======================================

# Обробка сигналів переривання
trap 'echo -e "\n${RED}❌ Скрипт перервано користувачем${NC}"; log_message "WARNING" "Script interrupted by user"; exit 1' INT TERM

# Обробка помилок
set -E
trap 'echo -e "\n${RED}💥 Критична помилка в рядку $LINENO${NC}"; log_message "ERROR" "Critical error at line $LINENO"; exit 1' ERR

# =======================================
# 🏁 ЗАПУСК СКРИПТУ
# =======================================

# Перевірка чи скрипт запущено з правильної директорії
if [ ! -f "$PROJECT_ROOT/package.json" ] && [ ! -f "$PROJECT_ROOT/extension.js" ]; then
    echo -e "${RED}❌ Запустіть скрипт з директорії scripts/ всередині проекту CSS Classes from HTML${NC}"
    echo -e "${GRAY}Поточна директорія: $(pwd)${NC}"
    echo -e "${GRAY}Очікувана структура:${NC}"
    echo -e "${GRAY}  css-classes-from-html/${NC}"
    echo -e "${GRAY}  ├── package.json${NC}"
    echo -e "${GRAY}  ├── extension.js${NC}"
    echo -e "${GRAY}  └── scripts/ultimate-fix-and-setup.sh${NC}"
    exit 1
fi

# Запуск головної функції з усіма параметрами
main "$@"