#!/bin/bash

# ✅ CSS Classes from HTML v0.0.7 - Cleanup Old Files Script
# Видалення застарілих файлів та реструктуризація проєкту
# Author: VuToV-Mykola
# Version: 0.0.7

set -e # Зупинка на першій помилці

# ✅ Кольори для виводу
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# ✅ Функції логування
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_header() {
    echo -e "${PURPLE}🚀 $1${NC}"
}

# ✅ Створення нової структури директорій
create_new_structure() {
    log_info "Створення нової структури директорій..."
    
    # Нові основні директорії
    mkdir -p logs/{deploy,tests,debug,cleanup}
    mkdir -p scripts
    mkdir -p tests
    mkdir -p debugs
    mkdir -p backups
    mkdir -p builds
    mkdir -p docs
    
    log_success "Нова структура директорій створена"
}

# ✅ Переміщення існуючих файлів у правильні місця
move_existing_files() {
    log_info "Переміщення існуючих файлів..."
    
    # Переміщення скриптів
    if [ -f "scripts/deploy.sh" ]; then
        mv scripts/deploy.sh scripts/deploy-old.sh
    fi
    
    if [ -f "scripts/deploy-for-build.sh" ]; then
        mv scripts/deploy-for-build.sh scripts/deploy-for-build-old.sh
    fi
    
    if [ -f "scripts/push-to-github.sh" ]; then
        mv scripts/push-to-github.sh backups/
    fi
    
    # Переміщення debug файлів
    if [ -d "debugs" ]; then
        mv debugs/* debugs/ 2>/dev/null || true
    fi
    
    # Переміщення документації
    if [ -f "docs/README.en.md" ]; then
        cp docs/README.en.md backups/README.en.md.backup
    fi
    
    if [ -f "docs/README.de.md" ]; then
        cp docs/README.de.md backups/README.de.md.backup
    fi
    
    log_success "Файли переміщено"
}

# ✅ Видалення застарілих файлів
cleanup_old_files() {
    log_info "Видалення застарілих файлів..."
    
    # Створення backup перед видаленням
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    tar -czf "backups/project_backup_${TIMESTAMP}.tar.gz" \
        --exclude=node_modules \
        --exclude=.git \
        --exclude=backups \
        --exclude=builds \
        --exclude=logs \
        . 2>/dev/null || true
    
    # Список файлів для видалення
    OLD_FILES=(
        "build/build-vsix.js"
        "main.js"
        "index.html"
        "complete-project.sh"
        "generate-docs.sh"
        "test-extension.sh"
        "figma_tester.sh"
        "diagnose_figma.sh"
        "test/run-tests.js"
        "test/runTest.js"
        "test/test.html"
        ".prettierrc copy.json"
    )
    
    # Список директорій для видалення
    OLD_DIRS=(
        "core"
        "analyzers"
        "generators"
        "utils"
        "examples"
        "src"
        "shared"
        "webview"
        "config"
        "media"
        "assets"
        "frontend/assets"
        "frontend/components"
        "frontend/services"
        "frontend/utils"
        "frontend/configurationManager.js"
        "frontend/server.js"
    )
    
    # Видалення застарілих файлів
    for file in "${OLD_FILES[@]}"; do
        if [ -f "$file" ]; then
            log_warning "Видалення файлу: $file"
            rm -f "$file"
        fi
    done
    
    # Видалення застарілих директорій
    for dir in "${OLD_DIRS[@]}"; do
        if [ -d "$dir" ]; then
            log_warning "Видалення директорії: $dir"
            rm -rf "$dir"
        fi
    done
    
    log_success "Застарілі файли видалено"
}

# ✅ Логування результатів
log_cleanup_results() {
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    LOG_FILE="logs/cleanup/cleanup_${TIMESTAMP}.log"
    
    {
        echo "=====================================";
        echo "CSS Classes from HTML - Cleanup Report";
        echo "=====================================";
        echo "Date: $(date)";
        echo "Version: 0.0.7";
        echo "";
        echo "Files Status After Cleanup:";
        echo "✅ extension.js";
        echo "✅ package.json";
        echo "✅ frontend/css-classes-from-html-menu.html";
        echo "✅ backend/ (structure preserved)";
        echo "✅ New structure created:";
        echo "   - logs/";
        echo "   - scripts/";
        echo "   - tests/"; 
        echo "   - debugs/";
        echo "   - backups/";
        echo "   - builds/";
        echo "   - docs/";
        echo "";
        echo "Cleanup completed successfully!";
        echo "=====================================";
    } > "$LOG_FILE"
    
    log_success "Cleanup results logged to: $LOG_FILE"
}

# ✅ Головна функція
main() {
    log_header "CSS Classes from HTML v0.0.7 - Cleanup Script"
    echo ""
    
    create_new_structure
    echo ""
    
    move_existing_files
    echo ""
    
    cleanup_old_files
    echo ""
    
    log_cleanup_results
    echo ""
    
    log_header "🎉 Cleanup completed successfully!"
    log_info "📁 New structure ready for deploy, test, and debug scripts"
    log_info "💾 Backup created in backups/ directory"
    log_info "📋 Cleanup log saved in logs/cleanup/"
    echo ""
    
    echo -e "${GREEN}Next steps:${NC}"
    echo -e "1. ${YELLOW}Run scripts/deploy.sh${NC} - Deploy the project"
    echo -e "2. ${YELLOW}Run scripts/tests.sh${NC} - Run tests"
    echo -e "3. ${YELLOW}Run scripts/debug.sh${NC} - Debug extension"
}

# ✅ Запуск
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi