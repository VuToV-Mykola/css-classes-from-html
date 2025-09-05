#!/bin/bash
# test-extension.sh - Автоматичне тестування CSS Classes from HTML
# @version 3.0.0

# Кольори
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Лічильники
TESTS_PASSED=0
TESTS_FAILED=0

# Функція для тестування
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "${YELLOW}🧪 Тест: $test_name${NC}"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASSED${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo "╔════════════════════════════════════════════════════════════╗"
echo "║           CSS Classes from HTML - Test Suite                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Тест 1: Перевірка Node.js
run_test "Node.js встановлено" "command -v node > /dev/null"

# Тест 2: Перевірка npm
run_test "npm встановлено" "command -v npm > /dev/null"

# Тест 3: Перевірка package.json
run_test "package.json існує" "[ -f package.json ]"

# Тест 4: Перевірка extension.js
run_test "extension.js існує" "[ -f extension.js ]"

# Тест 5: Синтаксис extension.js
run_test "Синтаксис extension.js валідний" "node -c extension.js 2>/dev/null"

# Тест 6: Перевірка HTML меню
run_test "HTML меню існує" "[ -f frontend/css-classes-from-html-menu.html ]"

# Тест 7: Перевірка configurationManager.js
run_test "configurationManager.js існує" "[ -f frontend/configurationManager.js ]"

# Тест 8: Синтаксис configurationManager.js
run_test "Синтаксис configurationManager.js валідний" "node -c frontend/configurationManager.js 2>/dev/null"

# Тест 9: Перевірка core модулів
run_test "FigmaAPIClient.js існує" "[ -f core/FigmaAPIClient.js ]"
run_test "HTMLParser.js існує" "[ -f core/HTMLParser.js ]"
run_test "StyleMatcher.js існує" "[ -f core/StyleMatcher.js ]"
run_test "CSSGenerator.js існує" "[ -f core/CSSGenerator.js ]"

# Тест 10: Перевірка залежностей
run_test "node-fetch встановлено" "npm list node-fetch > /dev/null 2>&1"
run_test "jsdom встановлено" "npm list jsdom > /dev/null 2>&1"

# Тест 11: Створення тестової конфігурації
run_test "Створення тестової конфігурації" "mkdir -p .vscode/css-classes-config && echo '{}' > .vscode/css-classes-config/test.json && [ -f .vscode/css-classes-config/test.json ]"

# Тест 12: Перевірка директорій
run_test "Директорія log існує або може бути створена" "mkdir -p log && [ -d log ]"
run_test "Директорія output існує або може бути створена" "mkdir -p output && [ -d output ]"

# Тест 13: Запуск модульних тестів
if [ -f "test/runTest.js" ]; then
    run_test "Модульні тести" "node test/runTest.js"
fi

# Тест 14: Валідація HTML
run_test "HTML меню валідний" "grep -q '<!DOCTYPE html>' frontend/css-classes-from-html-menu.html"

# Тест 15: Перевірка команд у package.json
run_test "Команда showMenu зареєстрована" "grep -q 'css-classes.showMenu' package.json"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                      Test Results                           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${GREEN}✅ Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 Всі тести пройдено успішно!${NC}"
    exit 0
else
    echo -e "${RED}⚠️ Деякі тести не пройдено. Перевірте помилки вище.${NC}"
    exit 1
fi