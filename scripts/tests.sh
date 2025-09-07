#!/bin/bash

# ✅ CSS Classes from HTML v0.0.7 - Tests Script
# Комплексне тестування розширення VS Code
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
    echo -e "${PURPLE}🧪 $1${NC}" | tee -a "$LOG_FILE"
}

# ✅ Конфігурація тестів
VERSION="0.0.7"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="logs/tests/tests_${TIMESTAMP}.log"
TESTS_DIR="tests"

# Лічильники тестів
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0

# ✅ Створення log файлу та директорій
setup_testing_environment() {
    mkdir -p logs/tests
    mkdir -p "$TESTS_DIR"
    touch "$LOG_FILE"
    
    log_header "Setting up testing environment..."
}

# ✅ Функція для запуску окремого тесту
run_test() {
    local test_name="$1"
    local test_function="$2"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "\n${CYAN}Test $TOTAL_TESTS: $test_name${NC}" | tee -a "$LOG_FILE"
    echo "----------------------------------------" | tee -a "$LOG_FILE"
    
    if $test_function; then
        log_success "PASSED: $test_name"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        log_error "FAILED: $test_name"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# ✅ Test 1: Package.json validation
test_package_json() {
    log_info "Validating package.json..."
    
    if [ ! -f "package.json" ]; then
        echo "package.json file not found" | tee -a "$LOG_FILE"
        return 1
    fi
    
    # Перевірка JSON синтаксису
    if ! node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" 2>/dev/null; then
        echo "Invalid JSON syntax in package.json" | tee -a "$LOG_FILE"
        return 1
    fi
    
    # Перевірка обов'язкових полів
    local pkg_content=$(cat package.json)
    local required_fields=("name" "version" "main" "engines" "contributes")
    
    for field in "${required_fields[@]}"; do
        if ! echo "$pkg_content" | grep -q "\"$field\""; then
            echo "Missing required field: $field" | tee -a "$LOG_FILE"
            return 1
        fi
        echo "✓ $field present" | tee -a "$LOG_FILE"
    done
    
    # Перевірка версії
    local version=$(node -e "console.log(JSON.parse(require('fs').readFileSync('package.json', 'utf8')).version)")
    echo "✓ Version: $version" | tee -a "$LOG_FILE"
    
    return 0
}

# ✅ Test 2: Extension.js syntax and structure
test_extension_js() {
    log_info "Testing extension.js..."
    
    if [ ! -f "extension.js" ]; then
        echo "extension.js file not found" | tee -a "$LOG_FILE"
        return 1
    fi
    
    # Синтаксична перевірка
    if ! node -c extension.js 2>/dev/null; then
        echo "Syntax error in extension.js" | tee -a "$LOG_FILE"
        node -c extension.js 2>&1 | head -5 | tee -a "$LOG_FILE"
        return 1
    fi
    echo "✓ Syntax valid" | tee -a "$LOG_FILE"
    
    # Перевірка структури
    local content=$(cat extension.js)
    local required_functions=("activate" "deactivate")
    
    for func in "${required_functions[@]}"; do
        if ! echo "$content" | grep -q "function $func\|$func.*function\|$func.*=.*function\|$func.*=>"; then
            echo "Missing function: $func" | tee -a "$LOG_FILE"
            return 1
        fi
        echo "✓ Function $func found" | tee -a "$LOG_FILE"
    done
    
    # Перевірка експорту
    if ! echo "$content" | grep -q "module.exports"; then
        echo "Missing module.exports" | tee -a "$LOG_FILE"
        return 1
    fi
    echo "✓ module.exports present" | tee -a "$LOG_FILE"
    
    return 0
}

# ✅ Test 3: Frontend HTML validation
test_frontend_html() {
    log_info "Testing frontend HTML..."
    
    local html_file="frontend/css-classes-from-html-menu.html"
    
    if [ ! -f "$html_file" ]; then
        echo "Frontend HTML file not found: $html_file" | tee -a "$LOG_FILE"
        return 1
    fi
    
    local content=$(cat "$html_file")
    
    # Перевірка HTML структури
    if ! echo "$content" | grep -q "<!DOCTYPE html>"; then
        echo "Missing DOCTYPE declaration" | tee -a "$LOG_FILE"
        return 1
    fi
    echo "✓ DOCTYPE present" | tee -a "$LOG_FILE"
    
    # Перевірка VS Code API
    if ! echo "$content" | grep -q "acquireVsCodeApi"; then
        echo "Missing VS Code API integration" | tee -a "$LOG_FILE"
        return 1
    fi
    echo "✓ VS Code API integration found" | tee -a "$LOG_FILE"
    
    # Перевірка JavaScript
    if ! echo "$content" | grep -q "vscode.postMessage"; then
        echo "Missing VS Code message handling" | tee -a "$LOG_FILE"
        return 1
    fi
    echo "✓ VS Code messaging found" | tee -a "$LOG_FILE"
    
    return 0
}

# ✅ Test 4: Backend modules validation
test_backend_modules() {
    log_info "Testing backend modules..."
    
    local modules=(
        "backend/core/FigmaAPIClient.js"
        "backend/core/IntegrationEngine.js"
        "backend/core/HTMLParser.js"
        "backend/generators/SmartCSSGenerator.js"
        "backend/utils/ImageImporter.js"
        "backend/utils/FontImporter.js"
    )
    
    for module in "${modules[@]}"; do
        if [ ! -f "$module" ]; then
            echo "Module not found: $module" | tee -a "$LOG_FILE"
            return 1
        fi
        
        # Синтаксична перевірка
        if ! node -c "$module" 2>/dev/null; then
            echo "Syntax error in $module" | tee -a "$LOG_FILE"
            return 1
        fi
        
        # Перевірка структури (клас або експорт)
        local content=$(cat "$module")
        if ! echo "$content" | grep -q "class \|module.exports\|exports\."; then
            echo "Invalid module structure: $module" | tee -a "$LOG_FILE"
            return 1
        fi
        
        echo "✓ $module valid" | tee -a "$LOG_FILE"
    done
    
    return 0
}

# ✅ Test 5: Dependencies check
test_dependencies() {
    log_info "Testing dependencies..."
    
    if [ ! -f "package.json" ]; then
        echo "package.json not found" | tee -a "$LOG_FILE"
        return 1
    fi
    
    # Перевірка наявності node_modules
    if [ ! -d "node_modules" ]; then
        echo "node_modules directory not found - running npm install..." | tee -a "$LOG_FILE"
        if npm install > logs/tests/npm-install.log 2>&1; then
            echo "✓ Dependencies installed" | tee -a "$LOG_FILE"
        else
            echo "Failed to install dependencies" | tee -a "$LOG_FILE"
            tail -5 logs/tests/npm-install.log | tee -a "$LOG_FILE"
            return 1
        fi
    else
        echo "✓ node_modules present" | tee -a "$LOG_FILE"
    fi
    
    # Перевірка критичних залежностей
    local critical_deps=("jsdom")
    local missing_deps=()
    
    for dep in "${critical_deps[@]}"; do
        if [ ! -d "node_modules/$dep" ]; then
            missing_deps+=("$dep")
            echo "Critical dependency missing: $dep" | tee -a "$LOG_FILE"
        else
            echo "✓ $dep available" | tee -a "$LOG_FILE"
        fi
    done
    
    # Автоматичне встановлення відсутніх залежностей
    if [ ${#missing_deps[@]} -gt 0 ]; then
        log_warning "Installing missing dependencies: ${missing_deps[*]}"
        
        for dep in "${missing_deps[@]}"; do
            echo "Installing $dep..." | tee -a "$LOG_FILE"
            if npm install "$dep" > logs/tests/npm-install-$dep.log 2>&1; then
                echo "✓ $dep installed successfully" | tee -a "$LOG_FILE"
                
                # Перевірка після встановлення
                if [ -d "node_modules/$dep" ]; then
                    echo "✓ $dep now available" | tee -a "$LOG_FILE"
                else
                    echo "❌ $dep still missing after installation" | tee -a "$LOG_FILE"
                    return 1
                fi
            else
                echo "❌ Failed to install $dep" | tee -a "$LOG_FILE"
                tail -5 logs/tests/npm-install-$dep.log | tee -a "$LOG_FILE"
                return 1
            fi
        done
    fi
    
    # Додаткова перевірка: чи можна завантажити jsdom
    log_info "Testing jsdom availability..."
    cat > "$TESTS_DIR/jsdom-test.js" << 'EOF'
try {
    const jsdom = require('jsdom');
    const { JSDOM } = jsdom;
    
    // Простий тест jsdom
    const dom = new JSDOM(`<!DOCTYPE html><html><body><div class="test">Hello</div></body></html>`);
    const div = dom.window.document.querySelector('.test');
    
    if (div && div.textContent === 'Hello') {
        console.log('✅ jsdom working correctly');
        process.exit(0);
    } else {
        console.log('❌ jsdom not working properly');
        process.exit(1);
    }
} catch (error) {
    console.error('❌ jsdom test failed:', error.message);
    process.exit(1);
}
EOF

    if node "$TESTS_DIR/jsdom-test.js" > logs/tests/jsdom-test.log 2>&1; then
        echo "✓ jsdom functionality verified" | tee -a "$LOG_FILE"
        return 0
    else
        echo "❌ jsdom functionality test failed" | tee -a "$LOG_FILE"
        cat logs/tests/jsdom-test.log | tee -a "$LOG_FILE"
        return 1
    fi
}

# ✅ Test 6: Functional integration test
test_integration() {
    log_info "Running integration test..."
    
    # Створення тестового файлу
    cat > "$TESTS_DIR/integration-test.js" << 'EOF'
const fs = require('fs');
const path = require('path');

console.log('🧪 Running integration test...');

// Test HTML Parser
try {
    const HTMLParser = require('../backend/core/HTMLParser');
    const parser = new HTMLParser();
    
    const testHTML = `
    <div class="container">
        <header class="header">
            <h1 class="title">Test Title</h1>
        </header>
        <main class="main-content">
            <section class="hero-section">
                <h2 class="hero-title">Hero Title</h2>
                <button class="btn btn-primary">Click Me</button>
            </section>
        </main>
    </div>`;
    
    const result = parser.parseHTML(testHTML);
    
    if (!result.hierarchy || result.hierarchy.size === 0) {
        throw new Error('HTML parsing failed - no elements found');
    }
    
    console.log(`✓ HTML Parser: ${result.hierarchy.size} elements parsed`);
    
    if (!result.classMap || result.classMap.size === 0) {
        throw new Error('No CSS classes found');
    }
    
    console.log(`✓ Class extraction: ${result.classMap.size} classes found`);
    
} catch (error) {
    console.error('❌ Integration test failed:', error.message);
    process.exit(1);
}

// Test CSS Generator
try {
    const SmartCSSGenerator = require('../backend/generators/SmartCSSGenerator');
    const generator = new SmartCSSGenerator({
        mode: 'minimal',
        includeComments: true
    });
    
    // Mock data for testing
    const figmaData = { hierarchy: new Map() };
    const htmlData = { 
        hierarchy: new Map([
            ['test1', { classes: ['container'] }],
            ['test2', { classes: ['title'] }]
        ])
    };
    const matches = new Map();
    
    const css = generator.generateCSS(figmaData, htmlData, matches);
    
    if (!css || css.length === 0) {
        throw new Error('CSS generation failed - no output');
    }
    
    console.log(`✓ CSS Generator: ${css.length} characters generated`);
    
    if (!css.includes('.container') || !css.includes('.title')) {
        throw new Error('CSS generation failed - missing expected classes');
    }
    
    console.log('✓ CSS classes properly generated');
    
} catch (error) {
    console.error('❌ CSS generation test failed:', error.message);
    process.exit(1);
}

console.log('🎉 Integration test completed successfully!');
EOF

    # Запуск інтеграційного тесту
    if node "$TESTS_DIR/integration-test.js" > logs/tests/integration.log 2>&1; then
        cat logs/tests/integration.log | tee -a "$LOG_FILE"
        return 0
    else
        echo "Integration test failed:" | tee -a "$LOG_FILE"
        cat logs/tests/integration.log | tee -a "$LOG_FILE"
        return 1
    fi
}

# ✅ Test 7: File structure validation
test_file_structure() {
    log_info "Testing file structure..."
    
    local required_structure=(
        "backend/core"
        "backend/generators"
        "backend/utils"
        "backend/matchers"
        "backend/analyzers"
        "frontend"
        "logs"
        "scripts"
        "tests"
        "debugs"
        "builds"
        "backups"
    )
    
    for dir in "${required_structure[@]}"; do
        if [ ! -d "$dir" ]; then
            echo "Missing directory: $dir" | tee -a "$LOG_FILE"
            return 1
        fi
        echo "✓ Directory exists: $dir" | tee -a "$LOG_FILE"
    done
    
    return 0
}

# ✅ Test 8: Configuration files validation
test_configuration() {
    log_info "Testing configuration files..."
    
    local config_files=(
        ".eslintrc.js"
        ".prettierrc.json"
        ".vscodeignore"
        ".gitignore"
    )
    
    local missing_configs=()
    
    for config in "${config_files[@]}"; do
        if [ ! -f "$config" ]; then
            missing_configs+=("$config")
        else
            echo "✓ Config file present: $config" | tee -a "$LOG_FILE"
        fi
    done
    
    if [ ${#missing_configs[@]} -gt 0 ]; then
        echo "Missing config files: ${missing_configs[*]}" | tee -a "$LOG_FILE"
        return 1
    fi
    
    return 0
}

# ✅ Test 9: Documentation validation
test_documentation() {
    log_info "Testing documentation..."
    
    local doc_files=("README.md")
    
    # Перевірка наявності та додавання інших README файлів якщо є
    if [ -f "docs/README.en.md" ]; then
        doc_files+=("docs/README.en.md")
    fi
    
    if [ -f "docs/README.de.md" ]; then
        doc_files+=("docs/README.de.md")
    fi
    
    for doc in "${doc_files[@]}"; do
        if [ ! -f "$doc" ]; then
            echo "Documentation file missing: $doc" | tee -a "$LOG_FILE"
            return 1
        fi
        
        local content=$(cat "$doc")
        if [ ${#content} -lt 500 ]; then
            echo "Documentation too short: $doc" | tee -a "$LOG_FILE"
            return 1
        fi
        
        echo "✓ Documentation valid: $doc (${#content} chars)" | tee -a "$LOG_FILE"
    done
    
    return 0
}

# ✅ Test 10: Performance and memory test
test_performance() {
    log_info "Testing performance..."
    
    # Створення performance тесту
    cat > "$TESTS_DIR/performance-test.js" << 'EOF'
const { performance } = require('perf_hooks');

console.log('🚀 Running performance test...');

// Test large HTML parsing
const testHTML = `<div class="container">` + 
    Array(1000).fill().map((_, i) => 
        `<div class="item-${i}"><span class="text-${i}">Content ${i}</span></div>`
    ).join('') + 
    `</div>`;

const start = performance.now();

try {
    const HTMLParser = require('../backend/core/HTMLParser');
    const parser = new HTMLParser();
    
    const result = parser.parseHTML(testHTML);
    
    const end = performance.now();
    const duration = end - start;
    
    console.log(`✓ Large HTML parsed in ${duration.toFixed(2)}ms`);
    console.log(`✓ Elements processed: ${result.hierarchy.size}`);
    console.log(`✓ Classes extracted: ${result.classMap.size}`);
    
    if (duration > 5000) {
        console.warn('⚠️ Performance warning: parsing took over 5 seconds');
    }
    
    console.log('✅ Performance test completed');
    
} catch (error) {
    console.error('❌ Performance test failed:', error.message);
    process.exit(1);
}
EOF

    if node "$TESTS_DIR/performance-test.js" > logs/tests/performance.log 2>&1; then
        cat logs/tests/performance.log | tee -a "$LOG_FILE"
        return 0
    else
        echo "Performance test failed:" | tee -a "$LOG_FILE"
        cat logs/tests/performance.log | tee -a "$LOG_FILE"
        return 1
    fi
}

# ✅ Генерація звіту про тестування
generate_test_report() {
    log_info "Generating test report..."
    
    local report_file="logs/tests/test_report_${TIMESTAMP}.md"
    local success_rate=0
    
    if [ $TOTAL_TESTS -gt 0 ]; then
        success_rate=$(echo "scale=1; $PASSED_TESTS * 100 / $TOTAL_TESTS" | bc -l 2>/dev/null || echo "0")
    fi
    
    {
        echo "# 🧪 CSS Classes from HTML v$VERSION - Test Report"
        echo ""
        echo "## 📊 Test Summary"
        echo "- **Date:** $(date)"
        echo "- **Version:** $VERSION"
        echo "- **Total Tests:** $TOTAL_TESTS"
        echo "- **Passed:** $PASSED_TESTS ✅"
        echo "- **Failed:** $FAILED_TESTS ❌"
        echo "- **Skipped:** $SKIPPED_TESTS ⏭️"
        echo "- **Success Rate:** $success_rate%"
        echo ""
        
        if [ $success_rate -gt 90 ]; then
            echo "## 🎉 Overall Result: EXCELLENT"
        elif [ $success_rate -gt 80 ]; then
            echo "## ✅ Overall Result: GOOD"
        elif [ $success_rate -gt 70 ]; then
            echo "## ⚠️ Overall Result: ACCEPTABLE"
        else
            echo "## ❌ Overall Result: NEEDS IMPROVEMENT"
        fi
        
        echo ""
        echo "## 📋 Test Details"
        echo "1. Package.json validation"
        echo "2. Extension.js syntax and structure"
        echo "3. Frontend HTML validation"
        echo "4. Backend modules validation"
        echo "5. Dependencies check"
        echo "6. Functional integration test"
        echo "7. File structure validation"
        echo "8. Configuration files validation"
        echo "9. Documentation validation"
        echo "10. Performance and memory test"
        echo ""
        echo "## 📁 Logs Location"
        echo "- **Main Log:** $LOG_FILE"
        echo "- **Integration Log:** logs/tests/integration.log"
        echo "- **Performance Log:** logs/tests/performance.log"
        echo ""
        echo "---"
        echo "**Generated by:** CSS Classes from HTML Test Suite v$VERSION"
    } > "$report_file"
    
    log_success "Test report generated: $report_file"
}

# ✅ Головна функція
main() {
    setup_testing_environment
    
    log_header "CSS Classes from HTML v$VERSION - Test Suite Starting..."
    echo ""
    
    # Запуск всіх тестів
    run_test "Package.json validation" test_package_json
    run_test "Extension.js syntax and structure" test_extension_js
    run_test "Frontend HTML validation" test_frontend_html
    run_test "Backend modules validation" test_backend_modules
    run_test "Dependencies check" test_dependencies
    run_test "Functional integration test" test_integration
    run_test "File structure validation" test_file_structure
    run_test "Configuration files validation" test_configuration
    run_test "Documentation validation" test_documentation
    run_test "Performance and memory test" test_performance
    
    echo ""
    log_header "📊 TEST RESULTS SUMMARY"
    echo -e "${CYAN}Total Tests:${NC} $TOTAL_TESTS" | tee -a "$LOG_FILE"
    echo -e "${GREEN}Passed:${NC} $PASSED_TESTS" | tee -a "$LOG_FILE"
    echo -e "${RED}Failed:${NC} $FAILED_TESTS" | tee -a "$LOG_FILE"
    echo -e "${YELLOW}Skipped:${NC} $SKIPPED_TESTS" | tee -a "$LOG_FILE"
    
    if [ $TOTAL_TESTS -gt 0 ]; then
        local success_rate=$(echo "scale=1; $PASSED_TESTS * 100 / $TOTAL_TESTS" | bc -l 2>/dev/null || echo "0")
        echo -e "${PURPLE}Success Rate:${NC} $success_rate%" | tee -a "$LOG_FILE"
    fi
    
    echo ""
    
    # Генерація звіту
    generate_test_report
    
    echo ""
    
    if [ $FAILED_TESTS -eq 0 ]; then
        log_success "🎉 All tests passed! Extension is ready for deployment."
        echo ""
        echo -e "${GREEN}Ready for:${NC}"
        echo -e "• ${YELLOW}bash scripts/deploy.sh${NC} - Deploy the extension"
        echo -e "• ${YELLOW}VS Code testing${NC} - Manual testing in development mode"
        echo -e "• ${YELLOW}Marketplace upload${NC} - Production deployment"
        exit 0
    else
        log_error "❌ Some tests failed. Please fix issues before deployment."
        echo ""
        echo -e "${RED}Next steps:${NC}"
        echo -e "• ${YELLOW}Review test logs in logs/tests/${NC}"
        echo -e "• ${YELLOW}Fix failing tests${NC}"
        echo -e "• ${YELLOW}Re-run tests${NC}"
        exit 1
    fi
}

# ✅ Запуск
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi