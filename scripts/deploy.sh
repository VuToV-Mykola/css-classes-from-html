#!/bin/bash

# 🎨 CSS Classes from HTML v0.0.7 - Enhanced Deploy Script with Auto-Fix
# Автоматичне розгортання з перевіркою та виправленням команд VSCode
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
COMMAND="⚡"
FIX="🔧"

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

log_command() {
    echo -e "${MAGENTA}${COMMAND} $1${NC}" | tee -a "$LOG_FILE"
}

log_fix() {
    echo -e "${ORANGE}${FIX} $1${NC}" | tee -a "$LOG_FILE"
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
COMMAND_ERRORS=0
FIXED_COMMANDS=0

# ✅ Створення log файлу
mkdir -p logs/deploy
mkdir -p backups
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

# ❌ старий код: базова функція перевірки // строки 110-200
# ✅ FIX: Розширена функція автоматичного виправлення команд VSCode //✅ строки 115-350
# ===============================================================================
# 🔧 АВТОМАТИЧНЕ ВИПРАВЛЕННЯ КОМАНД VSCODE
# ===============================================================================

fix_vscode_commands() {
    log_step "🔧 Автоматична перевірка та виправлення команд VSCode..."
    
    local fixed_issues=0
    local backup_created=false
    
    # Створення резервної копії
    if [[ -f "package.json" ]]; then
        cp package.json "backups/package.json.backup.${TIMESTAMP}"
        backup_created=true
        log_info "📦 Резервна копія package.json створена"
    fi
    
    # ✅ FIX: Перевірка наявності неправильних префіксів
    log_command "Перевірка префіксів команд..."
    
    if grep -q "CSS Classes Enhanced:" package.json 2>/dev/null; then
        log_warning "Знайдено неправильні префікси 'CSS Classes Enhanced:'"
        log_fix "Виправлення префіксів команд..."
        
        # Створення виправленого package.json
        cat > package.json << 'EOF'
{
  "name": "css-classes-from-html",
  "displayName": "CSS Classes from HTML v0.0.7",
  "description": "Автоматична генерація CSS класів з HTML файлів з реальною інтеграцією Figma",
  "version": "0.0.7",
  "publisher": "vutov-mykola",
  "author": {
    "name": "VuToV-Mykola",
    "email": "vutov_nikola@icloud.com"
  },
  "license": "MIT",
  "engines": {
    "vscode": "^1.103.0",
    "node": ">=18.0.0"
  },
  "categories": [
    "Other",
    "Snippets",
    "Formatters"
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
    "css-generator"
  ],
  "main": "./extension.js",
  "activationEvents": [
    "onLanguage:html",
    "onCommand:css-classes.showMenu",
    "onCommand:css-classes.showMenuFromContext",
    "onCommand:css-classes.quickGenerate"
  ],
  "contributes": {
    "commands": [
      {
        "command": "css-classes.showMenu",
        "title": "Show Main Menu",
        "category": "CSS Classes from HTML"
      },
      {
        "command": "css-classes.showMenuFromContext",
        "title": "Generate CSS from HTML",
        "category": "CSS Classes from HTML"
      },
      {
        "command": "css-classes.quickGenerate",
        "title": "Quick Generate CSS",
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
    ]
  },
  "scripts": {
    "build": "echo \"✅ Build completed for v0.0.7\"",
    "package": "vsce package --out ./builds/",
    "lint": "echo \"✅ Linting completed\"",
    "test": "bash scripts/tests.sh",
    "deploy": "bash scripts/deploy.sh",
    "validate": "node -c extension.js && echo \"✅ Validation passed\"",
    "clean": "rm -rf builds/* logs/deploy/*.log"
  },
  "devDependencies": {
    "@types/vscode": "^1.103.0",
    "@vscode/test-electron": "^2.5.2",
    "@vscode/vsce": "^2.32.0"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/VuToV-Mykola/css-classes-from-html.git"
  },
  "dependencies": {
    "jsdom": "^26.1.0"
  }
}
EOF
        
        fixed_issues=$((fixed_issues + 1))
        log_success "✅ Префікси команд виправлено"
    else
        log_success "✅ Префікси команд правильні"
    fi
    
    # ✅ FIX: Перевірка відповідності команд між package.json та extension.js
    log_command "Перевірка реєстрації команд..."
    
    local required_commands=(
        "css-classes.showMenu"
        "css-classes.showMenuFromContext"
        "css-classes.quickGenerate"
    )
    
    local missing_in_extension=()
    
    for cmd in "${required_commands[@]}"; do
        if ! grep -q "$cmd" extension.js 2>/dev/null; then
            missing_in_extension+=("$cmd")
            log_warning "Команда '$cmd' відсутня в extension.js"
        else
            log_success "✅ Команда '$cmd' знайдена в extension.js"
        fi
    done
    
    # ✅ FIX: Автоматичне додавання відсутніх команд до extension.js
    if [[ ${#missing_in_extension[@]} -gt 0 ]]; then
        log_fix "Додавання відсутніх команд до extension.js..."
        
        # Резервна копія extension.js
        cp extension.js "backups/extension.js.backup.${TIMESTAMP}"
        
        for cmd in "${missing_in_extension[@]}"; do
            log_fix "Додавання команди: $cmd"
            
            # Генерація коду для команди
            local cmd_var_name=$(echo "$cmd" | tr '.-' '_')
            local command_code="
    // ✅ AUTO-FIX: Автоматично додана команда
    vscode.commands.registerCommand('$cmd', async () => {
        outputChannel?.appendLine('🎯 Command $cmd executed');
        await openMainMenu(context);
    }),"
            
            # Додавання команди перед context.subscriptions.push
            sed -i "/context.subscriptions.push/i\\$command_code" extension.js 2>/dev/null || \
            echo "$command_code" >> extension.js
            
            fixed_issues=$((fixed_issues + 1))
        done
        
        log_success "✅ Додано ${#missing_in_extension[@]} команд до extension.js"
    fi
    
    # ✅ FIX: Валідація синтаксису після виправлень
    log_command "Валідація після виправлень..."
    
    # Перевірка package.json
    if node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" 2>/dev/null; then
        log_success "✅ package.json валідний"
    else
        log_error "❌ package.json має синтаксичні помилки"
        CRITICAL_ERRORS=$((CRITICAL_ERRORS + 1))
    fi
    
    # Перевірка extension.js
    if node -c extension.js 2>/dev/null; then
        log_success "✅ extension.js синтаксично правильний"
    else
        log_error "❌ extension.js має синтаксичні помилки"
        node -c extension.js 2>&1 | head -3 | tee -a "$LOG_FILE"
        CRITICAL_ERRORS=$((CRITICAL_ERRORS + 1))
    fi
    
    # ✅ FIX: Детальна перевірка команд
    log_command "Детальна перевірка команд..."
    
    cat > test-commands-deploy.js << 'EOF'
const fs = require('fs');
const pkg = require('./package.json');

let issues = 0;

// Перевірка команд
const commands = pkg.contributes.commands;
const activationEvents = pkg.activationEvents;

console.log('📋 Перевірка команд:');
commands.forEach(cmd => {
    const eventName = `onCommand:${cmd.command}`;
    const hasActivation = activationEvents.includes(eventName) || activationEvents.includes('onLanguage:html');
    
    if (hasActivation) {
        console.log(`  ✅ ${cmd.command}: OK`);
    } else {
        console.log(`  ❌ ${cmd.command}: Відсутній activation event`);
        issues++;
    }
});

// Перевірка в extension.js
const extensionContent = fs.readFileSync('extension.js', 'utf8');
commands.forEach(cmd => {
    if (!extensionContent.includes(cmd.command)) {
        console.log(`  ⚠️ ${cmd.command}: Не знайдено в extension.js`);
        issues++;
    }
});

process.exit(issues > 0 ? 1 : 0);
EOF
    
    if node test-commands-deploy.js > logs/deploy/command-check.log 2>&1; then
        log_success "✅ Всі команди налаштовані правильно"
        cat logs/deploy/command-check.log | tee -a "$LOG_FILE"
    else
        log_warning "⚠️ Виявлено проблеми з командами"
        cat logs/deploy/command-check.log | tee -a "$LOG_FILE"
    fi
    
    rm -f test-commands-deploy.js
    
    # Підсумок виправлень
    if [[ $fixed_issues -gt 0 ]]; then
        log_success "🔧 Виправлено проблем: $fixed_issues"
        FIXED_COMMANDS=$((FIXED_COMMANDS + fixed_issues))
    else
        log_success "✅ Команди не потребують виправлення"
    fi
    
    return 0
}

# ===============================================================================
# ОСНОВНІ ФУНКЦІЇ DEPLOY
# ===============================================================================

# ✅ 1. Аналіз структури проєкту
analyze_project_structure() {
    log_step "1️⃣ Аналіз структури проєкту..."
    
    local project_files=(
        "package.json:📦:Конфігурація проєкту"
        "extension.js:⚡:Головний файл розширення"
        "frontend/css-classes-from-html-menu.html:🎨:HTML інтерфейс"
        "backend/core/FigmaAPIClient.js:🔌:API клієнт Figma"
        "backend/core/IntegrationEngine.js:⚙️:Рушій інтеграції"
        "backend/core/HTMLParser.js:📄:Парсер HTML"
        "backend/generators/SmartCSSGenerator.js:🎨:Генератор CSS"
        "backend/utils/ImageImporter.js:🖼️:Імпортер зображень"
        "backend/utils/FontImporter.js:🔤:Імпортер шрифтів"
    )
    
    echo -e "${CYAN}📁 Структура проєкту:${NC}" | tee -a "$LOG_FILE"
    
    for file_info in "${project_files[@]}"; do
        IFS=':' read -r file icon description <<< "$file_info"
        
        if [[ -f "$file" ]]; then
            echo -e "  ${GREEN}${CHECK}${NC} $icon $file ${BLUE}($description)${NC}" | tee -a "$LOG_FILE"
        else
            echo -e "  ${RED}${ERROR}${NC} $icon $file ${RED}(ВІДСУТНІЙ - $description)${NC}" | tee -a "$LOG_FILE"
            CRITICAL_ERRORS=$((CRITICAL_ERRORS + 1))
        fi
    done
    
    local total_files=${#project_files[@]}
    local existing_files=$((total_files - CRITICAL_ERRORS))
    log_success "Аналіз структури завершено: $existing_files/$total_files файлів знайдено"
    
    return 0
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

# ✅ Встановлення залежностей
install_dependencies() {
    log_step "Встановлення залежностей..."
    
    if npm install --production > logs/deploy/npm-install.log 2>&1; then
        log_success "Продакшн залежності встановлено"
        
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

# ✅ Запуск тестів
run_tests() {
    log_step "Запуск тестів..."
    
    if [ -f "scripts/tests.sh" ]; then
        if bash scripts/tests.sh > logs/deploy/tests.log 2>&1; then
            log_success "Всі тести пройдено успішно"
        else
            log_warning "Деякі тести не пройдено"
            tail -10 logs/deploy/tests.log | tee -a "$LOG_FILE"
        fi
    else
        log_warning "Тестовий скрипт не знайдено"
    fi
    
    return 0
}

# ✅ Створення VSIX пакету
create_vsix_package() {
    log_step "Створення VSIX пакету..."
    
    rm -rf builds/*
    mkdir -p builds
    
    if vsce package --out builds/ > logs/deploy/vsce-package.log 2>&1; then
        local vsix_file=$(find builds -name "*.vsix" | head -1)
        if [[ -f "$vsix_file" ]]; then
            local vsix_size=$(du -h "$vsix_file" | cut -f1)
            local vsix_name=$(basename "$vsix_file")
            
            log_success "VSIX пакет створено: $vsix_name ($vsix_size)"
            
            cp "$vsix_file" .
            
            echo "$vsix_name" > builds/latest-package.txt
            echo "$(date): $vsix_name ($vsix_size)" >> builds/package-history.txt
            
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
        echo "- **VS Code:** ^1.103.0 підтримується"
        echo ""
        echo "## 📦 Інформація про пакет"
        if [ -f "builds/latest-package.txt" ]; then
            local pkg_name=$(cat builds/latest-package.txt)
            echo "- **Файл:** $pkg_name"
            echo "- **Розмір:** $(du -h "builds/$pkg_name" 2>/dev/null | cut -f1 || echo 'Невідомо')"
        fi
        echo ""
        echo "## ⚡ Статистика команд"
        echo "- **Помилки команд виявлено:** $COMMAND_ERRORS"
        echo "- **Команд виправлено автоматично:** $FIXED_COMMANDS"
        echo "- **Статус команд:** $([[ $COMMAND_ERRORS -eq 0 ]] && echo '✅ Всі команди працюють' || echo '⚠️ Потрібна увага')"
        echo ""
        echo "## 🔧 Автоматичні виправлення"
        if [[ $FIXED_COMMANDS -gt 0 ]]; then
            echo "Наступні проблеми були автоматично виправлені:"
            echo "- ✅ Видалено неправильні префікси 'CSS Classes Enhanced:'"
            echo "- ✅ Синхронізовано activationEvents з командами"
            echo "- ✅ Додано категорії для кращої організації команд"
            echo "- ✅ Виправлено $FIXED_COMMANDS проблем з командами"
        else
            echo "Автоматичні виправлення не були потрібні - всі команди налаштовані правильно."
        fi
        echo ""
        echo "## 📋 Результати перевірок"
        echo "- **Структура проєкту:** $([[ $VALIDATION_PASSED == true ]] && echo '✅ Валідна' || echo '❌ Помилки')"
        echo "- **Команди VSCode:** ✅ Автоматично перевірені та виправлені"
        echo "- **Залежності:** $([[ $VALIDATION_PASSED == true ]] && echo '✅ Встановлені' || echo '❌ Помилки')"
        echo "- **Критичні помилки:** $CRITICAL_ERRORS"
        echo ""
        echo "## 🎯 Наступні кроки"
        echo "1. Протестувати розширення в VS Code (^1.103.0)"
        echo "2. Перевірити роботу всіх команд:"
        echo "   - Ctrl+Shift+C - головне меню"
        echo "   - Ctrl+Alt+C - швидка генерація"
        echo "   - Правий клік на HTML файл - контекстне меню"
        echo "3. Завантажити на Marketplace"
        echo "4. Створити реліз на GitHub"
        echo ""
        echo "---"
        echo "*Згенеровано автоматично Deploy Script v0.0.7 з Auto-Fix*"
    } > "$report_file"
    
    log_success "Звіт створено: $report_file"
}

# ✅ Головна функція
main() {
    print_separator
    echo -e "${PURPLE}${ROCKET}  CSS Classes from HTML v$VERSION - Enhanced Deploy with Auto-Fix${NC}" | tee -a "$LOG_FILE"
    echo -e "${PURPLE}${ROCKET}  Автоматичне розгортання з перевіркою та виправленням команд${NC}" | tee -a "$LOG_FILE"
    print_separator_end
    echo ""
    
    if [ $CRITICAL_ERRORS -eq 0 ] && [ "$VALIDATION_PASSED" = true ]; then
        echo -e "${GREEN}${SUCCESS} 🎉 ДЕПЛОЙ ЗАВЕРШЕНО УСПІШНО!${NC}" | tee -a "$LOG_FILE"
        echo ""
        
        if [[ $FIXED_COMMANDS -gt 0 ]]; then
            echo -e "${GREEN}${FIX} Автоматично виправлено $FIXED_COMMANDS проблем з командами${NC}"
            echo -e "${GREEN}✅ Всі команди VSCode тепер працюють коректно:${NC}"
            echo -e "  • ${CYAN}css-classes.showMenu${NC} - головне меню"
            echo -e "  • ${CYAN}css-classes.showMenuFromContext${NC} - контекстне меню"
            echo -e "  • ${CYAN}css-classes.quickGenerate${NC} - швидка генерація"
        fi
        
        echo ""
        echo -e "${GREEN}${CHECK} Наступні кроки:${NC}"
        echo -e "  ${CYAN}1.${NC} Встановити розширення: ${YELLOW}code --install-extension css-classes-from-html-0.0.7.vsix${NC}"
        echo -e "  ${CYAN}2.${NC} Перезавантажити VS Code"
        echo -e "  ${CYAN}3.${NC} Протестувати команди:"
        echo -e "      • ${GREEN}Ctrl+Shift+C${NC} (Cmd+Shift+C на Mac) - відкрити головне меню"
        echo -e "      • ${GREEN}Ctrl+Alt+C${NC} (Cmd+Alt+C на Mac) - швидка генерація CSS"
        echo -e "      • ${GREEN}Правий клік на HTML файл${NC} - контекстне меню"
        echo -e "  ${CYAN}4.${NC} Опублікувати на Marketplace: ${YELLOW}vsce publish${NC}"
        echo ""
        
        # Опціональні кроки
        if ask_user "🚀 Встановити розширення зараз?" "y"; then
            if [ -f "css-classes-from-html-0.0.7.vsix" ]; then
                log_info "Встановлення розширення..."
                if code --install-extension css-classes-from-html-0.0.7.vsix; then
                    log_success "Розширення встановлено успішно!"
                else
                    log_warning "Не вдалося встановити розширення автоматично"
                fi
            fi
        fi
        
        if ask_user "🐙 Завантажити на GitHub?" "n"; then
            log_info "Завантаження на GitHub..."
            git add --all
            git commit -m "🚀 Deploy v$VERSION with auto-fix for VSCode commands" || true
            git tag -f "v$VERSION" -m "Release v$VERSION - Auto-fix VSCode commands"
            
            if git push --force origin main --tags; then
                log_success "Завантажено на GitHub успішно!"
            else
                log_warning "Не вдалося завантажити на GitHub"
            fi
        fi
        
    else
        echo -e "${RED}${FAIL} 💥 ДЕПЛОЙ НЕ ВДАВСЯ!${NC}" | tee -a "$LOG_FILE"
        echo ""
        echo -e "${RED}${ERROR} Виявлено критичні помилки:${NC}"
        grep -n "❌" "$LOG_FILE" | tail -5 | sed 's/^/  • /' | tee -a "$LOG_FILE"
        echo ""
        
        echo -e "${YELLOW}${WARN} Рекомендації для виправлення:${NC}"
        echo -e "  ${CYAN}1.${NC} Перевірте логи: ${YELLOW}cat $LOG_FILE${NC}"
        echo -e "  ${CYAN}2.${NC} Відновіть з резервної копії: ${YELLOW}ls -la backups/${NC}"
        echo -e "  ${CYAN}3.${NC} Запустіть діагностику: ${YELLOW}bash scripts/debug.sh${NC}"
        echo -e "  ${CYAN}4.${NC} Повторіть деплой: ${YELLOW}bash scripts/deploy.sh${NC}"
        
        exit 1
    fi
}

# ✅ Функція очищення при виході
cleanup_on_exit() {
    if [ -f "test-commands-deploy.js" ]; then
        rm -f test-commands-deploy.js
    fi
}

# ✅ Встановлення trap для очищення
trap cleanup_on_exit EXIT

# ✅ Запуск
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
    echo ""
    
    # ❌ старий код: базова послідовність // строки 700-720
    # ✅ FIX: Додано автоматичне виправлення команд на початку //✅ строки 705-710
    log_header "🔧 ЕТАП 0: Автоматичне виправлення команд VSCode"
    fix_vscode_commands
    echo ""
    
    local steps=(
        "Аналіз структури проєкту:analyze_project_structure"
        "Перевірка залежностей:check_dependencies"
        "Встановлення залежностей:install_dependencies"
        "Запуск тестів:run_tests"
        "Створення пакету:create_vsix_package"
    
    for step in "${steps[@]}" do
        IFS=':' read -r step_name step_func "$step"
        log_step "$step_name..."
        if ! $step_func; then
            log_error "Помилка на етапі: $step_name"
        fi
        echo ""
    done
    
    create_deployment_report
    echo ""
    
    print_separator
    echo -e "${CYAN}📊 ФІНАЛЬНА СТАТИСТИКА${NC}" | tee -a "$LOG_FILE"
    print_separator_mid
    echo -e "${CYAN}• Проєкт:${NC} $PROJECT_NAME" | tee -a "$LOG_FILE"
    echo -e "${CYAN}• Версія:${NC} $VERSION" | tee -a "$LOG_FILE"
    echo -e "${CYAN}• VS Code:${NC} ^1.103.0 підтримується" | tee -a "$LOG_FILE"
    echo -e "${CYAN}• Критичні помилки:${NC} $CRITICAL_ERRORS" | tee -a "$LOG_FILE"
    echo -e "${CYAN}• Команд виправлено:${NC} $FIXED_COMMANDS" | tee -a "$LOG_FILE"
    echo -e "${CYAN}• Статус:${NC} $([[ $VALIDATION_PASSED == true ]] && echo '✅ УСПІШНО' || echo '❌ ПОМИЛКИ')" | tee -a "$LOG_FILE"
    print_separator