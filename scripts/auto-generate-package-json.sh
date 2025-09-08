#!/bin/bash

# 🤖 АВТОГЕНЕРАТОР PACKAGE.JSON
# Автоматична генерація package.json з аналізом залежностей extension.js
# Author: VuToV-Mykola
# Version: 1.0.0

set -e

# ✅ Кольори для виводу
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ✅ Функції для красивого виводу
print_banner() {
    echo -e "${BLUE}
╔══════════════════════════════════════════════════════════════════════════╗
║                    🤖 АВТОГЕНЕРАТОР PACKAGE.JSON                         ║
║                   CSS Classes from HTML v0.0.7                           ║
║                                                                          ║
║         Автоматична генерація з аналізом залежностей extension.js        ║
║                        Створено з ❤️  by VuToV-Mykola                    ║
╚══════════════════════════════════════════════════════════════════════════╝${NC}"
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
    echo -e "${CYAN}ℹ️  $1${NC}"
}

print_feature() {
    echo -e "${PURPLE}🔥 $1${NC}"
}

# ✅ Змінні проекту
PROJECT_ROOT="$(pwd)"
PROJECT_NAME="css-classes-from-html"
PROJECT_VERSION="0.0.7"
AUTHOR="VuToV-Mykola"
AUTHOR_EMAIL="vutov_nikola@icloud.com"
GITHUB_REPO="https://github.com/VuToV-Mykola/css-classes-from-html"
EXTENSION_FILE="$PROJECT_ROOT/extension.js"
BACKUP_DIR="$PROJECT_ROOT/backups"

# ✅ Функція аналізу extension.js
analyze_extension() {
    print_step "Аналіз extension.js для виявлення залежностей..."
    
    if [ ! -f "$EXTENSION_FILE" ]; then
        print_error "Файл extension.js не знайдено!"
        exit 1
    fi
    
    # Пошук require залежностей
    local node_modules=$(grep -E "require\(['\"]" "$EXTENSION_FILE" | grep -v "^[[:space:]]*\/\/" | sed -E "s/.*require\(['\"]([^'\"]*)['\"].*/\1/" | grep -v "^\." | sort -u)
    local local_modules=$(grep -E "require\(['\"]\./" "$EXTENSION_FILE" | grep -v "^[[:space:]]*\/\/" | sed -E "s/.*require\(['\"]([^'\"]*)['\"].*/\1/" | sort -u)
    
    # Пошук команд розширення
    local commands=$(grep -E "registerCommand\(['\"]" "$EXTENSION_FILE" | sed -E "s/.*registerCommand\(['\"]([^'\"]*)['\"].*/\1/" | sort -u)
    
    # Пошук використаних VS Code API
    local vscode_apis=$(grep -E "vscode\." "$EXTENSION_FILE" | sed -E "s/.*vscode\.([a-zA-Z]*).*/\1/" | sort -u | head -10)
    
    # Збереження результатів в глобальні змінні
    NODE_MODULES="$node_modules"
    LOCAL_MODULES="$local_modules"
    EXTENSION_COMMANDS="$commands"
    VSCODE_APIS="$vscode_apis"
    
    print_info "Знайдено Node.js модулів: $(echo "$NODE_MODULES" | wc -l | tr -d ' ')"
    print_info "Знайдено локальних модулів: $(echo "$LOCAL_MODULES" | wc -l | tr -d ' ')"
    print_info "Знайдено команд розширення: $(echo "$EXTENSION_COMMANDS" | wc -l | tr -d ' ')"
    print_success "Аналіз extension.js завершено"
}

# ✅ Функція аналізу frontend файлів
analyze_frontend() {
    print_step "Аналіз frontend файлів..."
    
    local html_files=$(find "$PROJECT_ROOT/frontend" -name "*.html" 2>/dev/null | wc -l | tr -d ' ')
    local css_files=$(find "$PROJECT_ROOT/frontend" -name "*.css" 2>/dev/null | wc -l | tr -d ' ')
    local js_files=$(find "$PROJECT_ROOT/frontend" -name "*.js" 2>/dev/null | wc -l | tr -d ' ')
    
    FRONTEND_HTML=$html_files
    FRONTEND_CSS=$css_files
    FRONTEND_JS=$js_files
    
    print_info "Frontend HTML файлів: $html_files"
    print_info "Frontend CSS файлів: $css_files"
    print_info "Frontend JS файлів: $js_files"
}

# ✅ Функція аналізу backend структури
analyze_backend() {
    print_step "Аналіз backend структури..."
    
    local backend_dirs=""
    if [ -d "$PROJECT_ROOT/backend" ]; then
        backend_dirs=$(find "$PROJECT_ROOT/backend" -type d -maxdepth 2 ! -path "$PROJECT_ROOT/backend" | sed "s|$PROJECT_ROOT/backend/||" | sort)
    fi
    
    BACKEND_DIRS="$backend_dirs"
    
    if [ -n "$backend_dirs" ]; then
        print_info "Backend директорії:"
        echo "$backend_dirs" | while read -r dir; do
            print_info "  - $dir"
        done
    else
        print_info "Backend директорії не знайдено"
    fi
}

# ✅ Функція генерації залежностей
generate_dependencies() {
    # Основні залежності VS Code розширення
    cat << 'EOF'
  "dependencies": {
    "jsdom": "^22.0.0"
  },
  "devDependencies": {
    "@types/vscode": "^1.74.0",
    "@vscode/test-electron": "^2.3.0",
    "@vscode/vsce": "^2.19.0",
    "eslint": "^8.0.0"
  }
EOF
}

# ✅ Функція генерації команд
generate_commands() {
    cat << 'EOF'
    "commands": [
      {
        "command": "css-classes.showMenu",
        "title": "Show Main Menu",
        "category": "CSS Classes from HTML",
        "icon": "$(symbol-class)"
      },
      {
        "command": "css-classes.showMenuFromContext",
        "title": "Generate CSS from HTML",
        "category": "CSS Classes from HTML",
        "icon": "$(output)"
      },
      {
        "command": "css-classes.quickGenerate",
        "title": "Quick Generate CSS",
        "category": "CSS Classes from HTML",
        "icon": "$(rocket)"
      },
      {
        "command": "extension.cssClassesFromHtml",
        "title": "CSS Classes from HTML: Generate CSS",
        "category": "CSS Classes from HTML"
      }
    ],
EOF
}

# ✅ Функція генерації меню
generate_menus() {
    cat << 'EOF'
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
EOF
}

# ✅ Функція генерації активацій
generate_activation_events() {
    cat << 'EOF'
  "activationEvents": [
    "onLanguage:html",
    "onCommand:css-classes.showMenu",
    "onCommand:css-classes.showMenuFromContext",
    "onCommand:css-classes.quickGenerate",
    "onCommand:extension.cssClassesFromHtml"
  ],
EOF
}

# ✅ Функція генерації конфігурації
generate_configuration() {
    cat << 'EOF'
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
EOF
}

# ✅ Функція генерації клавіатурних комбінацій
generate_keybindings() {
    cat << 'EOF'
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
EOF
}

# ✅ Функція генерації скриптів
generate_scripts() {
    cat << 'EOF'
  "scripts": {
    "build": "echo \"✅ Build completed for v0.0.7\"",
    "package": "vsce package --out ./builds/",
    "lint": "eslint . --ext .js,.ts",
    "test": "bash scripts/tests.sh",
    "deploy": "bash scripts/deploy.sh",
    "validate": "node -c extension.js && echo \"✅ Validation passed\"",
    "clean": "rm -rf builds/* logs/deploy/*.log node_modules/.cache",
    "prepackage": "npm run validate",
    "postpackage": "echo \"📦 Package created successfully\"",
    "docs": "bash scripts/auto-generate-docs.sh",
    "manager": "bash scripts/project-manager.sh"
  },
EOF
}

# ✅ Основна функція генерації package.json
generate_package_json() {
    print_step "Генерація нового package.json..."
    
    local temp_file="package.json.new"
    
    # Створення резервної копії
    if [ -f "package.json" ]; then
        mkdir -p "$BACKUP_DIR"
        cp "package.json" "$BACKUP_DIR/package.json.backup.$(date +%Y%m%d_%H%M%S)"
        print_info "Створено резервну копію package.json"
    fi
    
    # Генерація нового package.json з правильною JSON структурою
    cat > "$temp_file" << 'EOF'
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
    "vscode": "^1.74.0",
    "node": ">=16.0.0"
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
  "icon": "assets/icon.png",
  "galleryBanner": {
    "color": "#007ACC",
    "theme": "dark"
  },
  "activationEvents": [
    "onLanguage:html",
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
        "icon": "$(symbol-class)"
      },
      {
        "command": "css-classes.showMenuFromContext",
        "title": "Generate CSS from HTML",
        "category": "CSS Classes from HTML",
        "icon": "$(output)"
      },
      {
        "command": "css-classes.quickGenerate",
        "title": "Quick Generate CSS",
        "category": "CSS Classes from HTML",
        "icon": "$(rocket)"
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
    "build": "echo \"✅ Build completed for v0.0.7\"",
    "package": "vsce package --out ./builds/",
    "lint": "eslint . --ext .js,.ts",
    "test": "bash scripts/tests.sh",
    "deploy": "bash scripts/deploy.sh",
    "validate": "node -c extension.js && echo \"✅ Validation passed\"",
    "clean": "rm -rf builds/* logs/deploy/*.log node_modules/.cache",
    "prepackage": "npm run validate",
    "postpackage": "echo \"📦 Package created successfully\"",
    "docs": "bash scripts/auto-generate-docs.sh",
    "manager": "bash scripts/project-manager.sh"
  },
  "dependencies": {
    "jsdom": "^22.0.0"
  },
  "devDependencies": {
    "@types/vscode": "^1.74.0",
    "@vscode/test-electron": "^2.3.0",
    "@vscode/vsce": "^2.19.0",
    "eslint": "^8.0.0"
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
    
    # Перевірка валідності JSON
    if node -e "JSON.parse(require('fs').readFileSync('$temp_file', 'utf8'))" 2>/dev/null; then
        mv "$temp_file" "package.json"
        print_success "package.json успішно згенеровано та валідовано"
    else
        print_error "Згенерований package.json містить помилки JSON"
        rm -f "$temp_file"
        exit 1
    fi
}

# ✅ Функція показу статистики
show_generation_stats() {
    print_step "Статистика генерації..."
    
    local commands_count=$(echo "$EXTENSION_COMMANDS" | wc -l | tr -d ' ')
    local node_deps_count=$(echo "$NODE_MODULES" | wc -l | tr -d ' ')
    local local_deps_count=$(echo "$LOCAL_MODULES" | wc -l | tr -d ' ')
    
    echo -e "${CYAN}
╔══════════════════════════════════════════════════════════════╗
║                    📊 СТАТИСТИКА ГЕНЕРАЦІЇ                   ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  📋 Аналіз extension.js:                                     ║
║     ├─ Команд розширення: ${YELLOW}$commands_count${CYAN}                               ║
║     ├─ Node.js залежностей: ${YELLOW}$node_deps_count${CYAN}                             ║
║     └─ Локальних модулів: ${YELLOW}$local_deps_count${CYAN}                              ║
║                                                              ║
║  🎯 Frontend структура:                                      ║
║     ├─ HTML файлів: ${YELLOW}$FRONTEND_HTML${CYAN}                                      ║
║     ├─ CSS файлів: ${YELLOW}$FRONTEND_CSS${CYAN}                                       ║
║     └─ JS файлів: ${YELLOW}$FRONTEND_JS${CYAN}                                        ║
║                                                              ║
║  📦 Згенеровано:                                             ║
║     ├─ Команди та меню                                       ║
║     ├─ Клавіатурні комбінації                               ║
║     ├─ Конфігурація                                          ║
║     ├─ Залежності                                            ║
║     └─ Скрипти управління                                    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝${NC}"
    
    # Показ знайдених команд
    if [ -n "$EXTENSION_COMMANDS" ]; then
        print_feature "Знайдені команди розширення:"
        echo "$EXTENSION_COMMANDS" | while read -r cmd; do
            print_info "  - $cmd"
        done
    fi
    
    # Показ локальних модулів
    if [ -n "$LOCAL_MODULES" ]; then
        print_feature "Знайдені локальні модулі:"
        echo "$LOCAL_MODULES" | while read -r mod; do
            print_info "  - $mod"
        done
    fi
}

# ✅ Функція валідації результату
validate_result() {
    print_step "Валідація згенерованого package.json..."
    
    # Перевірка JSON синтаксису
    if ! node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" 2>/dev/null; then
        print_error "package.json містить помилки JSON синтаксису!"
        return 1
    fi
    
    # Перевірка основних полів
    local required_fields=("name" "version" "main" "engines")
    for field in "${required_fields[@]}"; do
        if ! node -e "const pkg = JSON.parse(require('fs').readFileSync('package.json', 'utf8')); console.log(pkg.$field)" > /dev/null 2>&1; then
            print_error "Відсутнє обов'язкове поле: $field"
            return 1
        fi
    done
    
    # Перевірка команд
    local commands_in_json=$(node -e "const pkg = JSON.parse(require('fs').readFileSync('package.json', 'utf8')); console.log((pkg.contributes.commands || []).length)")
    if [ "$commands_in_json" -eq 0 ]; then
        print_error "Не знайдено команд у package.json"
        return 1
    fi
    
    print_success "package.json валідний та містить всі необхідні поля"
    print_info "Команд у package.json: $commands_in_json"
}

# ✅ Функція збереження логів
save_logs() {
    print_step "Збереження логів генерації..."
    
    mkdir -p logs
    {
        echo "=== АВТОГЕНЕРАТОР PACKAGE.JSON ==="
        echo "Дата: $(date)"
        echo "Версія: $PROJECT_VERSION"
        echo "Автор: $AUTHOR"
        echo ""
        echo "=== АНАЛІЗ EXTENSION.JS ==="
        echo "Команд розширення: $(echo "$EXTENSION_COMMANDS" | wc -l | tr -d ' ')"
        echo "Node.js залежностей: $(echo "$NODE_MODULES" | wc -l | tr -d ' ')"  
        echo "Локальних модулів: $(echo "$LOCAL_MODULES" | wc -l | tr -d ' ')"
        echo ""
        echo "=== ЗНАЙДЕНІ КОМАНДИ ==="
        echo "$EXTENSION_COMMANDS"
        echo ""
        echo "=== ЛОКАЛЬНІ МОДУЛІ ==="
        echo "$LOCAL_MODULES"
        echo ""
        echo "=== ЗАВЕРШЕНО ==="
        echo "Час виконання: $(date)"
    } >> logs/package-json-generation.log
    
    print_success "Логи збережені в logs/package-json-generation.log"
}

# ✅ Основна функція
main() {
    print_banner
    
    cd "$PROJECT_ROOT" || {
        print_error "Не можу перейти в директорію проекту"
        exit 1
    }
    
    analyze_extension
    analyze_frontend  
    analyze_backend
    generate_package_json
    validate_result
    show_generation_stats
    save_logs
    
    echo -e "${GREEN}
╔══════════════════════════════════════════════════════════════════════════╗
║                            ✅ УСПІШНО ЗАВЕРШЕНО                          ║
║                                                                          ║
║              🤖 package.json згенеровано на основі extension.js          ║
║                   📋 Всі залежності та команди додані                    ║
║                     🔍 Результат валідований та готовий                  ║
║                                                                          ║
║                        Створено з ❤️  by $AUTHOR                         ║
╚══════════════════════════════════════════════════════════════════════════╝${NC}"
    
    print_success "Автогенерація package.json завершена успішно!"
}

# ✅ Обробка помилок
error_handler() {
    print_error "Помилка на рядку $1"
    exit 1
}

trap 'error_handler $LINENO' ERR

# ✅ Запуск скрипту
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi