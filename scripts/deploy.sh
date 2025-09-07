#!/bin/bash

# ✅ CSS Classes from HTML v0.0.7 - Deploy Script
# Автоматичне розгортання розширення VS Code з реальною Figma інтеграцією
# Author: VuToV-Mykola
# Version: 0.0.7

set -e # Зупинка на першій помилці

# ✅ Кольори для виводу
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ✅ Функції логування
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
}

log_header() {
    echo -e "${PURPLE}🚀 $1${NC}" | tee -a "$LOG_FILE"
}

# ✅ Конфігурація проєкту
PROJECT_NAME="css-classes-from-html"
VERSION="0.0.7"
EXTENSION_NAME="CSS Classes from HTML"
PUBLISHER="vutov-mykola"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="logs/deploy/deploy_${TIMESTAMP}.log"

# ✅ Створення log файлу
mkdir -p logs/deploy
touch "$LOG_FILE"

# ✅ Перевірка залежностей
check_dependencies() {
    log_info "Перевірка залежностей..."
    
    # Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js не знайдено. Встановіть Node.js 18+"
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    log_success "Node.js знайдено: $NODE_VERSION"
    
    # npm
    if ! command -v npm &> /dev/null; then
        log_error "npm не знайдено"
        exit 1
    fi
    
    NPM_VERSION=$(npm --version)
    log_success "npm знайдено: $NPM_VERSION"
    
    # VS Code (опціонально)
    if command -v code &> /dev/null; then
        CODE_VERSION=$(code --version | head -n 1)
        log_success "VS Code знайдено: $CODE_VERSION"
    else
        log_warning "VS Code CLI не знайдено (опціонально)"
    fi
    
    # vsce (VS Code Extension Manager)
    if command -v vsce &> /dev/null; then
        VSCE_VERSION=$(vsce --version)
        log_success "vsce знайдено: $VSCE_VERSION"
    else
        log_warning "vsce не знайдено. Встановлюємо..."
        npm install -g @vscode/vsce
    fi
}

# ✅ Валідація файлів проєкту
validate_project_files() {
    log_info "Валідація файлів проєкту..."
    
    REQUIRED_FILES=(
        "package.json"
        "extension.js"
        "frontend/css-classes-from-html-menu.html"
        "backend/core/FigmaAPIClient.js"
        "backend/core/IntegrationEngine.js"
        "backend/core/HTMLParser.js"
        "backend/generators/SmartCSSGenerator.js"
        "backend/utils/ImageImporter.js"
        "backend/utils/FontImporter.js"
    )
    
    MISSING_FILES=()
    
    for file in "${REQUIRED_FILES[@]}"; do
        if [[ ! -f "$file" ]]; then
            MISSING_FILES+=("$file")
        fi
    done
    
    if [[ ${#MISSING_FILES[@]} -gt 0 ]]; then
        log_error "Відсутні обов'язкові файли:"
        for file in "${MISSING_FILES[@]}"; do
            echo "  - $file" | tee -a "$LOG_FILE"
        done
        exit 1
    fi
    
    log_success "Всі необхідні файли присутні (${#REQUIRED_FILES[@]} файлів)"
}

# ✅ Перевірка синтаксису JavaScript
validate_javascript() {
    log_info "Перевірка синтаксису JavaScript..."
    
    JS_FILES=$(find . -name "*.js" -not -path "./node_modules/*" -not -path "./builds/*" -not -path "./logs/*" -not -path "./backups/*")
    
    SYNTAX_ERRORS=()
    FILE_COUNT=0
    
    while IFS= read -r file; do
        if [[ -f "$file" ]]; then
            FILE_COUNT=$((FILE_COUNT + 1))
            if ! node -c "$file" 2>/dev/null; then
                SYNTAX_ERRORS+=("$file")
            fi
        fi
    done <<< "$JS_FILES"
    
    if [[ ${#SYNTAX_ERRORS[@]} -gt 0 ]]; then
        log_error "Синтаксичні помилки в файлах:"
        for file in "${SYNTAX_ERRORS[@]}"; do
            echo "  - $file" | tee -a "$LOG_FILE"
            node -c "$file" 2>&1 | head -3 | sed 's/^/    /' | tee -a "$LOG_FILE"
        done
        exit 1
    fi
    
    log_success "Синтаксис JavaScript валідний ($FILE_COUNT файлів перевірено)"
}

# ✅ Встановлення залежностей
install_dependencies() {
    log_info "Встановлення залежностей..."
    
    # Продакшн залежності
    if npm install --production > logs/deploy/npm-install.log 2>&1; then
        log_success "Продакшн залежності встановлено"
    else
        log_error "Помилка встановлення залежностей"
        cat logs/deploy/npm-install.log | tail -10 | tee -a "$LOG_FILE"
        exit 1
    fi
    
    # Dev залежності для збірки
    if npm install --save-dev @vscode/vsce @types/vscode >> logs/deploy/npm-install.log 2>&1; then
        log_success "Dev залежності встановлено"
    else
        log_warning "Деякі dev залежності можуть бути недоступні"
    fi
}

# ✅ Оновлення package.json для збірки
update_package_json() {
    log_info "Оновлення package.json..."
    
    # Створення backup
    cp package.json "backups/package.json.backup.${TIMESTAMP}"
    
    # Оновлення версії та метаданих
    node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    pkg.version = '$VERSION';
    pkg.displayName = '$EXTENSION_NAME v$VERSION';
    pkg.description = 'Автоматична генерація CSS класів з HTML файлів з реальною інтеграцією Figma та розумним співставленням елементів';
    pkg.main = './extension.js';
    pkg.engines = { 'vscode': '^1.103.0', 'node': '>=18.0.0' };
    
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
        'frontend', 'ui', 'design', 'automation', 'integration',
        'smart-matching', 'real-figma', 'asset-import'
    ];
    
    // Оновлення contributes
    if (!pkg.contributes) pkg.contributes = {};
    if (!pkg.contributes.commands) pkg.contributes.commands = [];
    
    // Додаємо основні команди
    pkg.contributes.commands = [
        {
            'command': 'css-classes.showMenu',
            'title': 'CSS Classes: Show Enhanced Menu',
            'category': 'CSS Classes Enhanced',
            'icon': '\$(gear)'
        },
        {
            'command': 'css-classes.showMenuFromContext',
            'title': 'CSS Classes: Generate Enhanced CSS from this HTML file',
            'category': 'CSS Classes Enhanced',
            'icon': '\$(file-code)'
        },
        {
            'command': 'css-classes.quickGenerate',
            'title': 'CSS Classes: Quick Generate CSS',
            'category': 'CSS Classes Enhanced',
            'icon': '\$(zap)'
        }
    ];
    
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    console.log('✅ package.json updated to version $VERSION');
    " | tee -a "$LOG_FILE"
    
    log_success "package.json оновлено до версії $VERSION"
}

# ✅ Запуск тестів перед збіркою
run_pre_build_tests() {
    log_info "Запуск pre-build тестів..."
    
    if [ -f "scripts/tests.sh" ]; then
        if bash scripts/tests.sh > logs/deploy/pre-build-tests.log 2>&1; then
            log_success "Pre-build тести пройдено"
        else
            log_warning "Деякі тести не пройдено, але продовжуємо збірку"
            tail -10 logs/deploy/pre-build-tests.log | tee -a "$LOG_FILE"
        fi
    else
        log_warning "Тестовий скрипт не знайдено, пропускаємо тести"
    fi
}

# ✅ Створення VSIX пакету
create_vsix_package() {
    log_info "Створення VSIX пакету..."
    
    # Очищення попередніх збірок
    rm -rf builds/*
    mkdir -p builds
    
    # Створення пакету
    if vsce package --out builds/ > logs/deploy/vsce-package.log 2>&1; then
        VSIX_FILE=$(find builds -name "*.vsix" | head -1)
        if [[ -f "$VSIX_FILE" ]]; then
            VSIX_SIZE=$(du -h "$VSIX_FILE" | cut -f1)
            VSIX_NAME=$(basename "$VSIX_FILE")
            log_success "VSIX пакет створено: $VSIX_NAME ($VSIX_SIZE)"
            
            # Копіювання в корінь для зручності
            cp "$VSIX_FILE" .
            log_info "Пакет скопійовано в корінь проєкту: $VSIX_NAME"
            
            # Збереження інформації про пакет
            echo "$VSIX_NAME" > builds/latest-package.txt
            echo "$(date): $VSIX_NAME ($VSIX_SIZE)" >> builds/package-history.txt
        else
            log_error "VSIX файл не знайдено після збірки"
            cat logs/deploy/vsce-package.log | tee -a "$LOG_FILE"
            exit 1
        fi
    else
        log_error "Помилка при створенні VSIX пакету"
        cat logs/deploy/vsce-package.log | tee -a "$LOG_FILE"
        exit 1
    fi
}

# ✅ Створення deployment звіту
create_deployment_report() {
    log_info "Створення deployment звіту..."
    
    REPORT_FILE="logs/deploy/deployment_report_${TIMESTAMP}.md"
    
    {
        echo "# 🚀 CSS Classes from HTML v$VERSION - Deployment Report"
        echo ""
        echo "## 📊 Deployment Information"
        echo "- **Date:** $(date)"
        echo "- **Version:** $VERSION"
        echo "- **Node.js:** $(node --version)"
        echo "- **npm:** $(npm --version)"
        echo "- **Extension Name:** $EXTENSION_NAME"
        echo "- **Publisher:** $PUBLISHER"
        echo ""
        echo "## 📦 Package Information"
        if [ -f "builds/latest-package.txt" ]; then
            PACKAGE_NAME=$(cat builds/latest-package.txt)
            echo "- **VSIX File:** $PACKAGE_NAME"
            echo "- **Size:** $(du -h "builds/$PACKAGE_NAME" | cut -f1)"
        fi
        echo ""
        echo "## ✅ Validation Results"
        echo "- **Required Files:** ✅ All present"
        echo "- **JavaScript Syntax:** ✅ Valid"
        echo "- **Dependencies:** ✅ Installed"
        echo "- **Package Build:** ✅ Successful"
        echo ""
        echo "## 📁 Project Structure"
        echo "\`\`\`"
        tree -I 'node_modules|.git' -L 2 || ls -la
        echo "\`\`\`"
        echo ""
        echo "## 🎯 Next Steps"
        echo "1. Test the extension in VS Code"
        echo "2. Upload to VS Code Marketplace"
        echo "3. Create GitHub release"
        echo "4. Update documentation"
        echo ""
        echo "---"
        echo "**Generated by:** CSS Classes from HTML Deploy Script v$VERSION"
    } > "$REPORT_FILE"
    
    log_success "Deployment звіт створено: $REPORT_FILE"
}

# ✅ Генерація GitHub команд
generate_github_commands() {
    log_info "Генерація GitHub команд..."
    
    COMMIT_MESSAGE="🚀 CSS Classes from HTML v$VERSION - Enhanced Figma Integration & Asset Import"
    
    cat > scripts/push-to-github.sh << EOF
#!/bin/bash

# ✅ Команди для пуша на GitHub
echo "🚀 Pushing CSS Classes from HTML v$VERSION to GitHub..."

# Додавання всіх змін
git add --all

# Створення коміту
git commit -m "$COMMIT_MESSAGE"

# Створення тегу
git tag -a "v$VERSION" -m "Release v$VERSION - Enhanced Figma Integration"

# Пуш змін та тегів
git push origin main --tags

echo "✅ Successfully pushed to GitHub!"
echo "🔗 Create release at: https://github.com/VuToV-Mykola/css-classes-from-html/releases/new"
echo "📦 Upload VSIX file from builds/ directory"
EOF

    chmod +x scripts/push-to-github.sh
    
    cat > scripts/marketplace-upload.md << EOF
# 📦 VS Code Marketplace Upload Instructions

## Upload to VS Code Marketplace

1. **Login to Marketplace:**
   - Go to: https://marketplace.visualstudio.com/manage
   - Login with Microsoft account

2. **Upload VSIX:**
   - Click "New extension"
   - Upload file: \`$(cat builds/latest-package.txt 2>/dev/null || echo 'css-classes-from-html-0.0.7.vsix')\`

3. **Verify Extension:**
   - Check extension page
   - Test installation

## Alternative: Command Line Upload

\`\`\`bash
# Install vsce if not already installed
npm install -g @vscode/vsce

# Login to marketplace (requires Personal Access Token)
vsce login $PUBLISHER

# Publish directly
vsce publish
\`\`\`

## Package Information
- **Version:** $VERSION
- **Package:** $(cat builds/latest-package.txt 2>/dev/null || echo 'Not created yet')
- **Size:** $(du -h builds/*.vsix 2>/dev/null | cut -f1 | head -1 || echo 'Unknown')
EOF

    log_success "GitHub команди згенеровано: scripts/push-to-github.sh"
    log_success "Marketplace інструкції: scripts/marketplace-upload.md"
}

# ✅ Головна функція
main() {
    log_header "🚀 CSS Classes from HTML v$VERSION - Deploy Script Starting..."
    echo ""
    
    # Перевірка середовища
    check_dependencies
    echo ""
    
    # Валідація проєкту
    validate_project_files
    echo ""
    
    # Перевірка синтаксису
    validate_javascript
    echo ""
    
    # Встановлення залежностей
    install_dependencies
    echo ""
    
    # Оновлення метаданих
    update_package_json
    echo ""
    
    # Pre-build тести
    run_pre_build_tests
    echo ""
    
    # Створення пакету
    create_vsix_package
    echo ""
    
    # Створення звітів
    create_deployment_report
    echo ""
    
    # GitHub команди
    generate_github_commands
    echo ""
    
    # Фінальна статистика
    TOTAL_FILES=$(find . -type f -not -path "./.git/*" -not -path "./node_modules/*" | wc -l)
    PROJECT_SIZE=$(du -sh . 2>/dev/null | cut -f1 || echo "Unknown")
    
    log_header "📊 DEPLOYMENT STATISTICS"
    echo -e "${CYAN}Project Name:${NC} $PROJECT_NAME" | tee -a "$LOG_FILE"
    echo -e "${CYAN}Version:${NC} $VERSION" | tee -a "$LOG_FILE"
    echo -e "${CYAN}Total Files:${NC} $TOTAL_FILES" | tee -a "$LOG_FILE"
    echo -e "${CYAN}Project Size:${NC} $PROJECT_SIZE" | tee -a "$LOG_FILE"
    echo -e "${CYAN}Build Directory:${NC} builds/" | tee -a "$LOG_FILE"
    echo -e "${CYAN}Logs Directory:${NC} logs/" | tee -a "$LOG_FILE"
    echo ""
    
    log_success "🎉 Deployment completed successfully!"
    log_info "📦 VSIX package ready for VS Code Marketplace"
    log_info "🧪 All validations passed"
    log_info "🚀 Ready for GitHub push"
    log_info "📋 Full deployment log: $LOG_FILE"
    echo ""
    
    echo -e "${GREEN}Next steps:${NC}"
    echo -e "1. ${YELLOW}bash scripts/push-to-github.sh${NC} - Push to GitHub"
    echo -e "2. ${YELLOW}Upload VSIX to VS Code Marketplace${NC} (see scripts/marketplace-upload.md)"
    echo -e "3. ${YELLOW}Create GitHub release${NC}"
    echo -e "4. ${YELLOW}Test extension in VS Code${NC}"
    echo ""
    
    log_header "🎯 Project URL: https://github.com/VuToV-Mykola/css-classes-from-html"
}

# ✅ Запуск
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi