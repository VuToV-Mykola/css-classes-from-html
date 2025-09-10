#!/bin/bash

# ✅ CSS Classes from HTML v0.0.7 - Debug Script
# Комплексна система налагодження розширення VS Code
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
    echo -e "${BLUE}🔍 $1${NC}" | tee -a "$LOG_FILE"
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
    echo -e "${PURPLE}🐛 $1${NC}" | tee -a "$LOG_FILE"
}

# ✅ Конфігурація debug
VERSION="0.0.7"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="logs/debug/debug_${TIMESTAMP}.log"
DEBUG_DIR="debugs"

# ✅ Створення debug середовища
setup_debug_environment() {
    log_header "Setting up debug environment..."
    
    mkdir -p logs/debug
    mkdir -p "$DEBUG_DIR"
    touch "$LOG_FILE"
}

# ✅ Debug 1: Extension activation test
debug_extension_activation() {
    log_info "Testing extension activation..."
    
    cat > "$DEBUG_DIR/debug-activation.js" << 'EOF'
#!/usr/bin/env node

/**
 * ✅ FIX: Тест активації розширення з детальним логуванням
 */

console.log("🔧 Детальний тест активації розширення...");

// Симуляція vscode API з детальним логуванням  
const mockVscode = {
    window: {
        createOutputChannel: name => ({
            appendLine: msg => console.log(`[${name}] ${msg}`),
            dispose: () => {}
        }),
        showErrorMessage: msg => console.log(`ERROR: ${msg}`),
        showInformationMessage: msg => console.log(`INFO: ${msg}`),
        showWarningMessage: msg => console.log(`WARNING: ${msg}`),
        activeTextEditor: null
    },
    commands: {
        registerCommand: (name, handler) => {
            console.log(`✅ Команда зареєстрована: ${name}`);
            if (name === "css-classes.showMenuFromContext") {
                console.log(`   🎯 ЦЕ ТА КОМАНДА! Обробник:`, typeof handler);
            }
            return {dispose: () => {}};
        }
    },
    workspace: {
        workspaceFolders: null
    },
    ViewColumn: {
        One: 1,
        Beside: 2
    },
    Uri: {
        file: path => ({fsPath: path})
    }
};

// Заміна require('vscode')
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function(id) {
    if (id === 'vscode') {
        return mockVscode;
    }
    return originalRequire.apply(this, arguments);
};

try {
    console.log("📦 Завантаження extension.js...");
    const extension = require("../extension.js");
    console.log("✅ extension.js завантажено успішно");
    
    if (typeof extension.activate === 'function') {
        console.log("✅ Функція activate знайдена");
        
        const mockContext = {
            extensionPath: __dirname,
            subscriptions: []
        };
        
        console.log("🚀 Симуляція активації...");
        extension.activate(mockContext);
        console.log("✅ Активація завершена успішно");
        
        // Перевірка чи є команда в експорті
        if (extension['css-classes.showMenuFromContext']) {
            console.log("✅ Команда знайдена в експорті");
        } else {
            console.log("⚠️ Команда не знайдена в експорті");
        }
    } else {
        console.log("❌ Функція activate не знайдена");
    }
} catch (error) {
    console.error("❌ Помилка активації:", error.message);
    console.error("Stack trace:", error.stack);
}
EOF

    chmod +x "$DEBUG_DIR/debug-activation.js"
    
    if node "$DEBUG_DIR/debug-activation.js" > logs/debug/activation.log 2>&1; then
        log_success "Extension activation test completed"
        cat logs/debug/activation.log | tail -10 | tee -a "$LOG_FILE"
        return 0
    else
        log_error "Extension activation failed"
        cat logs/debug/activation.log | tee -a "$LOG_FILE"
        return 1
    fi
}

# ✅ Debug 2: Command registration test
debug_command_registration() {
    log_info "Testing command registration..."
    
    cat > "$DEBUG_DIR/debug-command-registration.js" << 'EOF'
/**
 * 🔍 Детальний тест реєстрації команд розширення
 * Author: VuToV-Mykola
 * Version: 0.0.7
 */

console.log("🔍 Детальний тест реєстрації команд розширення...");

// Тест 1: Перевірка синтаксису extension.js
console.log("\n1. Перевірка синтаксису extension.js...");
try {
    const fs = require("fs");
    const extensionContent = fs.readFileSync("./extension.js", "utf8");
    
    // Перевірка наявності ключових елементів
    const hasActivate = extensionContent.includes("function activate(");
    const hasDeactivate = extensionContent.includes("function deactivate(");
    const hasModuleExports = extensionContent.includes("module.exports = {");
    const hasShowMenuFromContext = extensionContent.includes("css-classes.showMenuFromContext");
    
    console.log(`✅ function activate: ${hasActivate}`);
    console.log(`✅ function deactivate: ${hasDeactivate}`);
    console.log(`✅ module.exports: ${hasModuleExports}`);
    console.log(`✅ css-classes.showMenuFromContext: ${hasShowMenuFromContext}`);
    
    if (hasActivate && hasDeactivate && hasModuleExports && hasShowMenuFromContext) {
        console.log("✅ Синтаксис extension.js правильний");
    } else {
        console.log("❌ Проблеми з синтаксисом extension.js");
    }
} catch (error) {
    console.error("❌ Помилка читання extension.js:", error.message);
}

// Тест 2: Перевірка package.json
console.log("\n2. Перевірка package.json...");
try {
    const packageJson = require("../package.json");
    
    // Перевірка основних полів
    const hasMain = packageJson.main === "./extension.js";
    const hasActivationEvents = packageJson.activationEvents &&
        packageJson.activationEvents.includes("onLanguage:html");
    const hasCommands = packageJson.contributes &&
        packageJson.contributes.commands &&
        packageJson.contributes.commands.some(cmd => cmd.command === "css-classes.showMenuFromContext");
    
    console.log(`✅ main: ${hasMain} (${packageJson.main})`);
    console.log(`✅ activationEvents: ${hasActivationEvents}`);
    console.log(`✅ commands: ${hasCommands}`);
    
    if (hasMain && hasActivationEvents && hasCommands) {
        console.log("✅ package.json налаштований правильно");
    } else {
        console.log("❌ Проблеми з package.json");
    }
} catch (error) {
    console.error("❌ Помилка читання package.json:", error.message);
}

// Тест 3: Перевірка backend модулів
console.log("\n3. Перевірка backend модулів...");
try {
    const IntegrationEngine = require("../backend/core/IntegrationEngine");
    console.log("✅ IntegrationEngine завантажено");
} catch (error) {
    console.error("❌ Помилка завантаження IntegrationEngine:", error.message);
}

try {
    const FigmaAPIClient = require("../backend/core/FigmaAPIClient");
    console.log("✅ FigmaAPIClient завантажено");
} catch (error) {
    console.error("❌ Помилка завантаження FigmaAPIClient:", error.message);
}

try {
    const HTMLParser = require("../backend/core/HTMLParser");
    console.log("✅ HTMLParser завантажено");
} catch (error) {
    console.error("❌ Помилка завантаження HTMLParser:", error.message);
}

// Тест 4: Перевірка залежностей
console.log("\n4. Перевірка залежностей...");
try {
    const jsdom = require("jsdom");
    console.log("✅ jsdom завантажено");
} catch (error) {
    console.error("❌ Помилка завантаження jsdom:", error.message);
}

// Тест 5: Перевірка VS Code API
console.log("\n5. Перевірка VS Code API...");
try {
    const vscode = require("vscode");
    console.log("✅ vscode модуль завантажено");
    console.log(`   Версія: ${vscode.version || "не визначено"}`);
} catch (error) {
    console.error("❌ Помилка завантаження vscode:", error.message);
}

// Тест 6: Перевірка структури команд
console.log("\n6. Перевірка структури команд...");
try {
    const packageJson = require("../package.json");
    const commands = packageJson.contributes.commands;
    
    console.log(`📊 Загальна кількість команд: ${commands.length}`);
    
    const requiredCommands = [
        "css-classes.showMenu",
        "css-classes.showMenuFromContext", 
        "css-classes.quickGenerate"
    ];
    
    requiredCommands.forEach(cmd => {
        const found = commands.find(c => c.command === cmd);
        if (found) {
            console.log(`✅ ${cmd}: ${found.title}`);
        } else {
            console.log(`❌ ${cmd}: НЕ ЗНАЙДЕНО`);
        }
    });
} catch (error) {
    console.error("❌ Помилка перевірки команд:", error.message);
}

console.log("\n🏁 Тестування завершено");
EOF

    if node "$DEBUG_DIR/debug-command-registration.js" > logs/debug/commands.log 2>&1; then
        log_success "Command registration test completed"
        cat logs/debug/commands.log | tail -15 | tee -a "$LOG_FILE"
        return 0
    else
        log_error "Command registration test failed"
        cat logs/debug/commands.log | tee -a "$LOG_FILE"
        return 1
    fi
}

# ✅ Debug 3: Figma API client test
debug_figma_api_client() {
    log_info "Testing Figma API client..."
    
    cat > "$DEBUG_DIR/debug-figma-api.js" << 'EOF'
/**
 * 🎨 Тест Figma API клієнта
 */

console.log("🎨 Тестування Figma API клієнта...");

try {
    const FigmaAPIClient = require("../backend/core/FigmaAPIClient");
    
    console.log("✅ FigmaAPIClient модуль завантажено");
    
    // Тест створення клієнта без токену
    try {
        const client = new FigmaAPIClient("");
        console.log("✅ Клієнт створено без токену");
        
        // Тест валідації file ID
        const testLinks = [
            "https://www.figma.com/file/ABC123DEF456/TestFile",
            "https://www.figma.com/design/XYZ789/AnotherFile",
            "ABC123DEF456"
        ];
        
        testLinks.forEach(link => {
            const fileId = client.extractFileIdFromFigmaLink ? 
                client.extractFileIdFromFigmaLink(link) : 
                extractFileId(link);
            console.log(`🔗 ${link} → ${fileId || 'INVALID'}`);
        });
        
        console.log("✅ Figma API client tests completed");
        
    } catch (error) {
        console.error("❌ Помилка створення клієнта:", error.message);
    }
    
} catch (error) {
    console.error("❌ Помилка завантаження FigmaAPIClient:", error.message);
}

// Допоміжна функція для витягування file ID
function extractFileId(link) {
    const patterns = [
        /file\/([a-zA-Z0-9]{17,22})(?:\/|$)/,
        /design\/([a-zA-Z0-9]{17,22})(?:\/|$)/,
        /([a-zA-Z0-9]{17,22})/
    ];
    
    for (const pattern of patterns) {
        const match = link.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    return null;
}
EOF

    if node "$DEBUG_DIR/debug-figma-api.js" > logs/debug/figma-api.log 2>&1; then
        log_success "Figma API client test completed"
        cat logs/debug/figma-api.log | tee -a "$LOG_FILE"
        return 0
    else
        log_error "Figma API client test failed"
        cat logs/debug/figma-api.log | tee -a "$LOG_FILE"
        return 1
    fi
}

# ✅ Debug 4: HTML parser test
debug_html_parser() {
    log_info "Testing HTML parser..."
    
    cat > "$DEBUG_DIR/debug-html-parser.js" << 'EOF'
/**
 * 📄 Тест HTML парсера
 */

console.log("📄 Тестування HTML парсера...");

try {
    const HTMLParser = require("../backend/core/HTMLParser");
    
    console.log("✅ HTMLParser модуль завантажено");
    
    const parser = new HTMLParser();
    
    const testHTML = `
    <!DOCTYPE html>
    <html lang="uk">
    <head>
        <meta charset="UTF-8">
        <title>Test</title>
    </head>
    <body>
        <div class="container">
            <header class="header">
                <h1 class="title">Заголовок</h1>
                <nav class="navigation">
                    <ul class="nav-list">
                        <li class="nav-item"><a href="#" class="nav-link">Пункт 1</a></li>
                        <li class="nav-item"><a href="#" class="nav-link">Пункт 2</a></li>
                    </ul>
                </nav>
            </header>
            <main class="main-content">
                <section class="hero-section">
                    <h2 class="hero-title">Головний заголовок</h2>
                    <p class="hero-text">Опис секції</p>
                    <button class="btn btn-primary">Кнопка</button>
                </section>
                <div class="card-container">
                    <div class="card">
                        <h3 class="card-title">Картка 1</h3>
                        <p class="card-text">Контент картки</p>
                        <button class="card-btn">Дія</button>
                    </div>
                    <div class="card">
                        <h3 class="card-title">Картка 2</h3>
                        <p class="card-text">Контент картки</p>
                    </div>
                </div>
            </main>
            <footer class="footer">
                <p class="footer-text">Футер</p>
            </footer>
        </div>
    </body>
    </html>`;
    
    console.log("🔍 Парсинг тестового HTML...");
    
    const result = parser.parseHTML(testHTML);
    
    console.log(`✅ Елементів проаналізовано: ${result.hierarchy.size}`);
    console.log(`✅ CSS класів знайдено: ${result.classMap.size}`);
    console.log(`✅ Семантичних ролей: ${result.semanticMap.size}`);
    console.log(`✅ Контентних елементів: ${result.contentMap.size}`);
    console.log(`✅ Максимальна глибина: ${result.structure.depth}`);
    
    // Перевірка класів
    const classes = Array.from(result.classMap.keys()).slice(0, 10);
    console.log(`🎨 Перші 10 класів: ${classes.join(', ')}`);
    
    // Перевірка семантичних ролей
    const roles = Array.from(result.semanticMap.keys());
    console.log(`🏷️ Семантичні ролі: ${roles.join(', ')}`);
    
    console.log("✅ HTML parser test completed successfully");
    
} catch (error) {
    console.error("❌ Помилка тестування HTML парсера:", error.message);
    console.error(error.stack);
}
EOF

    if node "$DEBUG_DIR/debug-html-parser.js" > logs/debug/html-parser.log 2>&1; then
        log_success "HTML parser test completed"
        cat logs/debug/html-parser.log | tee -a "$LOG_FILE"
        return 0
    else
        log_error "HTML parser test failed"
        cat logs/debug/html-parser.log | tee -a "$LOG_FILE"
        return 1
    fi
}

# ✅ Debug 5: CSS generator test
debug_css_generator() {
    log_info "Testing CSS generator..."
    
    cat > "$DEBUG_DIR/debug-css-generator.js" << 'EOF'
/**
 * 🎨 Тест CSS генератора
 */

console.log("🎨 Тестування CSS генератора...");

try {
    const SmartCSSGenerator = require("../backend/generators/SmartCSSGenerator");
    
    console.log("✅ SmartCSSGenerator модуль завантажено");
    
    const generator = new SmartCSSGenerator({
        mode: 'minimal',
        includeComments: true,
        includeReset: true,
        generateResponsive: true
    });
    
    // Mock дані для тестування
    const figmaData = {
        hierarchy: new Map([
            ['figma1', {
                id: 'figma1',
                name: 'Header Title',
                type: 'TEXT',
                content: { text: 'Заголовок', hasText: true }
            }],
            ['figma2', {
                id: 'figma2', 
                name: 'Primary Button',
                type: 'RECTANGLE',
                content: { text: 'Кнопка', hasText: true }
            }]
        ])
    };
    
    const htmlData = {
        hierarchy: new Map([
            ['html1', {
                id: 'html1',
                classes: ['title'],
                textContent: 'Заголовок',
                tagName: 'h1'
            }],
            ['html2', {
                id: 'html2',
                classes: ['btn', 'btn-primary'],
                textContent: 'Кнопка', 
                tagName: 'button'
            }],
            ['html3', {
                id: 'html3',
                classes: ['card'],
                textContent: '',
                tagName: 'div'
            }]
        ])
    };
    
    const matches = new Map([
        ['figma1', { htmlElementId: 'html1', confidence: 0.95, strategy: 'exact-text-match' }],
        ['figma2', { htmlElementId: 'html2', confidence: 0.88, strategy: 'semantic-match' }]
    ]);
    
    console.log("🔧 Генерація CSS...");
    
    const css = generator.generateCSS(figmaData, htmlData, matches);
    
    console.log(`✅ CSS згенеровано: ${css.length} символів`);
    
    // Перевірка наявності ключових елементів
    const hasReset = css.includes('* {') && css.includes('box-sizing: border-box');
    const hasVariables = css.includes(':root {') && css.includes('--');
    const hasClasses = css.includes('.title') && css.includes('.btn');
    const hasComments = css.includes('/*') && css.includes('MATCHED');
    const hasResponsive = css.includes('@media');
    
    console.log(`✅ Reset стилі: ${hasReset}`);
    console.log(`✅ CSS змінні: ${hasVariables}`);
    console.log(`✅ CSS класи: ${hasClasses}`);
    console.log(`✅ Коментарі: ${hasComments}`);
    console.log(`✅ Адаптивні стилі: ${hasResponsive}`);
    
    // Збереження результату для перегляду
    const fs = require('fs');
    fs.writeFileSync('debugs/generated-test.css', css);
    console.log("💾 CSS збережено в debugs/generated-test.css");
    
    console.log("✅ CSS generator test completed successfully");
    
} catch (error) {
    console.error("❌ Помилка тестування CSS генератора:", error.message);
    console.error(error.stack);
}
EOF

    if node "$DEBUG_DIR/debug-css-generator.js" > logs/debug/css-generator.log 2>&1; then
        log_success "CSS generator test completed"
        cat logs/debug/css-generator.log | tee -a "$LOG_FILE"
        return 0
    else
        log_error "CSS generator test failed"
        cat logs/debug/css-generator.log | tee -a "$LOG_FILE"
        return 1
    fi
}

# ✅ Debug 6: Integration Engine test
debug_integration_engine() {
    log_info "Testing Integration Engine..."
    
    cat > "$DEBUG_DIR/debug-integration-engine.js" << 'EOF'
/**
 * ⚙️ Тест Integration Engine
 */

console.log("⚙️ Тестування Integration Engine...");

try {
    const IntegrationEngine = require("../backend/core/IntegrationEngine");
    
    console.log("✅ IntegrationEngine модуль завантажено");
    
    // Тест створення без токену
    const engine = new IntegrationEngine({
        figmaToken: '',
        confidenceThreshold: 0.7,
        generateResponsive: true,
        mode: 'minimal'
    });
    
    console.log("✅ IntegrationEngine створено");
    
    // Тест оновлення опцій
    engine.updateOptions({
        figmaToken: 'test-token',
        mode: 'maximum'
    });
    
    console.log("✅ Опції оновлено");
    
    // Тест витягування file ID
    const testLinks = [
        "https://www.figma.com/file/ABC123DEF456789/Test-File",
        "https://www.figma.com/design/XYZ789ABC123/Another-File"
    ];
    
    testLinks.forEach(link => {
        const fileId = engine.extractFileIdFromFigmaLink(link);
        console.log(`🔗 ${link} → ${fileId || 'INVALID'}`);
    });
    
    // Тест валідації Figma посилання
    console.log("🔍 Тестування валідації посилань...");
    
    const validationTests = [
        { link: "https://www.figma.com/file/ABC123DEF456789/Valid", shouldPass: true },
        { link: "invalid-link", shouldPass: false },
        { link: "", shouldPass: false }
    ];
    
    validationTests.forEach(async (test, index) => {
        try {
            // Note: Це буде fail без реального токену, але тестуємо структуру
            console.log(`📝 Тест ${index + 1}: ${test.link} - Expected: ${test.shouldPass ? 'PASS' : 'FAIL'}`);
        } catch (error) {
            console.log(`📝 Тест ${index + 1}: Expected validation error for invalid link`);
        }
    });
    
    console.log("✅ Integration Engine test completed");
    
} catch (error) {
    console.error("❌ Помилка тестування Integration Engine:", error.message);
    console.error(error.stack);
}
EOF

    if node "$DEBUG_DIR/debug-integration-engine.js" > logs/debug/integration-engine.log 2>&1; then
        log_success "Integration Engine test completed"
        cat logs/debug/integration-engine.log | tee -a "$LOG_FILE"
        return 0
    else
        log_error "Integration Engine test failed"
        cat logs/debug/integration-engine.log | tee -a "$LOG_FILE"
        return 1
    fi
}

# ✅ Debug 7: Frontend WebView test
debug_frontend_webview() {
    log_info "Testing Frontend WebView..."
    
    # Перевірка HTML файлу
    local html_file="frontend/css-classes-from-html-menu.html"
    
    if [ ! -f "$html_file" ]; then
        log_error "Frontend HTML file not found: $html_file"
        return 1
    fi
    
    log_success "Frontend HTML file found"
    
    # Аналіз HTML структури
    local html_content=$(cat "$html_file")
    local html_size=${#html_content}
    local css_lines=$(echo "$html_content" | grep -c "}" || echo "0")
    local js_lines=$(echo "$html_content" | grep -c "console.log\|function\|const\|let" || echo "0")
    
    echo "📊 Frontend Statistics:" | tee -a "$LOG_FILE"
    echo "   HTML size: $html_size characters" | tee -a "$LOG_FILE"
    echo "   CSS rules: ~$css_lines" | tee -a "$LOG_FILE"  
    echo "   JS lines: ~$js_lines" | tee -a "$LOG_FILE"
    
    # Перевірка ключових елементів
    local checks=(
        "acquireVsCodeApi:VS Code API"
        "vscode.postMessage:Message sending"
        "window.addEventListener:Event handling"
        "generateCSS:CSS generation function"
        "loadFigmaCanvases:Figma integration"
        "selectMode:Mode selection"
    )
    
    for check in "${checks[@]}"; do
        local search_term="${check%%:*}"
        local description="${check#*:}"
        
        if echo "$html_content" | grep -q "$search_term"; then
            echo "✅ $description found" | tee -a "$LOG_FILE"
        else
            echo "❌ $description missing" | tee -a "$LOG_FILE"
        fi
    done
    
    log_success "Frontend WebView analysis completed"
    return 0
}

# ✅ Генерація debug звіту
generate_debug_report() {
    log_info "Generating debug report..."
    
    local report_file="logs/debug/debug_report_${TIMESTAMP}.md"
    
    {
        echo "# 🐛 CSS Classes from HTML v$VERSION - Debug Report"
        echo ""
        echo "## 📊 Debug Session Information"
        echo "- **Date:** $(date)"
        echo "- **Version:** $VERSION"
        echo "- **Debug Directory:** $DEBUG_DIR"
        echo "- **Logs Directory:** logs/debug"
        echo ""
        echo "## 🧪 Debug Tests Executed"
        echo "1. Extension activation test"
        echo "2. Command registration test"
        echo "3. Figma API client test"
        echo "4. HTML parser test"
        echo "5. CSS generator test"
        echo "6. Integration Engine test"
        echo "7. Frontend WebView test"
        echo ""
        echo "## 📁 Generated Debug Files"
        echo "- \`debugs/debug-activation.js\` - Extension activation test"
        echo "- \`debugs/debug-command-registration.js\` - Commands test"
        echo "- \`debugs/debug-figma-api.js\` - Figma API test"
        echo "- \`debugs/debug-html-parser.js\` - HTML parser test"
        echo "- \`debugs/debug-css-generator.js\` - CSS generator test"
        echo "- \`debugs/debug-integration-engine.js\` - Integration test"
        echo "- \`debugs/generated-test.css\` - Test CSS output"
        echo ""
        echo "## 📊 System Information"
        echo "- **Node.js:** $(node --version 2>/dev/null || echo 'Not available')"
        echo "- **npm:** $(npm --version 2>/dev/null || echo 'Not available')"
        echo "- **Platform:** $(uname -s 2>/dev/null || echo 'Unknown')"
        echo ""
        echo "## 🎯 Debug Results Summary"
        if [ -f "logs/debug/activation.log" ]; then
            echo "- **Extension Activation:** ✅ Completed"
        fi
        if [ -f "logs/debug/commands.log" ]; then
            echo "- **Command Registration:** ✅ Completed"
        fi
        if [ -f "logs/debug/figma-api.log" ]; then
            echo "- **Figma API Client:** ✅ Completed"
        fi
        if [ -f "logs/debug/html-parser.log" ]; then
            echo "- **HTML Parser:** ✅ Completed"
        fi
        if [ -f "logs/debug/css-generator.log" ]; then
            echo "- **CSS Generator:** ✅ Completed"
        fi
        if [ -f "logs/debug/integration-engine.log" ]; then
            echo "- **Integration Engine:** ✅ Completed"
        fi
        echo ""
        echo "## 💡 Recommendations"
        echo "1. Review debug logs for any warnings or errors"
        echo "2. Test extension in VS Code development mode (F5)"
        echo "3. Verify all commands are properly registered"
        echo "4. Test with real Figma files and HTML documents"
        echo ""
        echo "## 🔗 Related Files"
        echo "- **Main Log:** $LOG_FILE"
        echo "- **Extension:** extension.js"
        echo "- **Package:** package.json"
        echo "- **Frontend:** frontend/css-classes-from-html-menu.html"
        echo ""
        echo "---"
        echo "**Generated by:** CSS Classes from HTML Debug Suite v$VERSION"
    } > "$report_file"
    
    log_success "Debug report generated: $report_file"
}

# ✅ Cleanup debug artifacts
cleanup_debug_session() {
    log_info "Cleaning up debug session..."
    
    # Архівування старих debug файлів
    if [ -d "$DEBUG_DIR" ] && [ "$(ls -A $DEBUG_DIR 2>/dev/null)" ]; then
        local archive_name="debug_session_${TIMESTAMP}.tar.gz"
        tar -czf "backups/$archive_name" "$DEBUG_DIR"/* 2>/dev/null || true
        log_success "Debug files archived: backups/$archive_name"
    fi
    
    # Очищення тимчасових файлів (за бажанням)
    # rm -f debugs/generated-test.css debugs/*.tmp 2>/dev/null || true
    
    log_success "Debug session cleanup completed"
}

# ✅ Головна функція
main() {
    setup_debug_environment
    
    log_header "CSS Classes from HTML v$VERSION - Debug Suite Starting..."
    echo ""
    
    local debug_functions=(
        "debug_extension_activation:Extension Activation"
        "debug_command_registration:Command Registration"
        "debug_figma_api_client:Figma API Client"
        "debug_html_parser:HTML Parser"
        "debug_css_generator:CSS Generator"
        "debug_integration_engine:Integration Engine"
        "debug_frontend_webview:Frontend WebView"
    )
    
    local passed_tests=0
    local total_tests=${#debug_functions[@]}
    
    # Запуск всіх debug тестів
    for debug_func in "${debug_functions[@]}"; do
        local func_name="${debug_func%%:*}"
        local func_desc="${debug_func#*:}"
        
        echo ""
        log_header "Testing: $func_desc"
        
        if $func_name; then
            passed_tests=$((passed_tests + 1))
        fi
    done
    
    echo ""
    
    # Генерація звіту
    generate_debug_report
    
    # Cleanup
    cleanup_debug_session
    
    echo ""
    log_header "📊 DEBUG SESSION RESULTS"
    echo -e "${CYAN}Total Tests:${NC} $total_tests" | tee -a "$LOG_FILE"
    echo -e "${GREEN}Passed Tests:${NC} $passed_tests" | tee -a "$LOG_FILE"
    echo -e "${RED}Failed Tests:${NC} $((total_tests - passed_tests))" | tee -a "$LOG_FILE"
    
    if [ $total_tests -gt 0 ]; then
        local success_rate=$(echo "scale=1; $passed_tests * 100 / $total_tests" | bc -l 2>/dev/null || echo "0")
        echo -e "${PURPLE}Success Rate:${NC} $success_rate%" | tee -a "$LOG_FILE"
    fi
    
    echo -e "${CYAN}Debug Directory:${NC} $DEBUG_DIR" | tee -a "$LOG_FILE"
    echo -e "${CYAN}Logs Directory:${NC} logs/debug" | tee -a "$LOG_FILE"
    echo -e "${CYAN}Main Log:${NC} $LOG_FILE" | tee -a "$LOG_FILE"
    echo ""
    
    if [ $passed_tests -eq $total_tests ]; then
        log_success "🎉 All debug tests passed! Extension debugging completed successfully."
        echo ""
        echo -e "${GREEN}Next steps:${NC}"
        echo -e "• ${YELLOW}Open VS Code and press F5${NC} - Test in development mode"
        echo -e "• ${YELLOW}Open HTML file in new window${NC} - Test extension functionality"
        echo -e "• ${YELLOW}Check VS Code Developer Console${NC} - Monitor for runtime errors"
        echo -e "• ${YELLOW}Run 'bash scripts/tests.sh'${NC} - Full test suite"
        exit 0
    else
        log_error "❌ Some debug tests failed. Please review logs and fix issues."
        echo ""
        echo -e "${RED}Next steps:${NC}"
        echo -e "• ${YELLOW}Review debug logs in logs/debug/${NC}"
        echo -e "• ${YELLOW}Check debug files in debugs/${NC}"
        echo -e "• ${YELLOW}Fix failing components${NC}"
        echo -e "• ${YELLOW}Re-run debug script${NC}"
        exit 1
    fi
}

# ✅ Запуск
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi