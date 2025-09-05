#!/bin/bash
# Скрипт виправлення помилок команд у VS Code розширенні

echo "🔧 Виправлення помилок команд CSS Classes from HTML"
echo "=================================================="

# Перевіряємо чи файл package.json існує
if [ ! -f "package.json" ]; then
    echo "❌ package.json не знайдено"
    exit 1
fi

# Перевіряємо наявність команд у package.json
echo "📋 Перевірка команд у package.json..."

CHECK_SHOW_MENU=$(grep -c "css-classes.showMenu" package.json)
CHECK_CANVAS_SELECTOR=$(grep -c "css-classes.openCanvasSelector" package.json)

if [ $CHECK_SHOW_MENU -eq 0 ]; then
    echo "❌ Команда 'css-classes.showMenu' не знайдена в package.json"
else
    echo "✓ Команда 'css-classes.showMenu' знайдена"
fi

if [ $CHECK_CANVAS_SELECTOR -eq 0 ]; then
    echo "❌ Команда 'css-classes.openCanvasSelector' не знайдена в package.json"
else
    echo "✓ Команда 'css-classes.openCanvasSelector' знайдена"
fi

# Перевіряємо activationEvents
echo "📋 Перевірка activationEvents..."
ACTIVATION_EVENTS=$(grep -A 10 -B 2 "activationEvents" package.json | grep -E "showMenu|openCanvasSelector")

if echo "$ACTIVATION_EVENTS" | grep -q "showMenu"; then
    echo "✓ showMenu в activationEvents"
else
    echo "❌ showMenu не в activationEvents"
fi

if echo "$ACTIVATION_EVENTS" | grep -q "openCanvasSelector"; then
    echo "✓ openCanvasSelector в activationEvents"
else
    echo "❌ openCanvasSelector не в activationEvents"
fi

# Перевіряємо реєстрацію команд у extension.js
echo "📋 Перевірка реєстрації команд у extension.js..."
if [ ! -f "extension.js" ]; then
    echo "❌ extension.js не знайдено"
else
    REGISTER_SHOW_MENU=$(grep -c "css-classes.showMenu" extension.js)
    REGISTER_CANVAS_SELECTOR=$(grep -c "css-classes.openCanvasSelector" extension.js)
    
    if [ $REGISTER_SHOW_MENU -gt 0 ]; then
        echo "✓ Команда showMenu зареєстрована в extension.js"
    else
        echo "❌ Команда showMenu не зареєстрована в extension.js"
    fi
    
    if [ $REGISTER_CANVAS_SELECTOR -gt 0 ]; then
        echo "✓ Команда openCanvasSelector зареєстрована в extension.js"
    else
        echo "❌ Команда openCanvasSelector не зареєстрована в extension.js"
    fi
fi

echo ""
echo "📋 РЕКОМЕНДАЦІЇ:"
echo "1. Перезавантажте VS Code: Ctrl+Shift+P → 'Developer: Reload Window'"
echo "2. Перевірте чи з'явилися команди:"
echo "   - CSS Classes: Show Main Menu"
echo "   - CSS Classes: Open Canvas Selector (Legacy)"
echo "3. Якщо проблеми залишаються, видаліть розширення та встановіть знову"

echo ""
echo "📋 Якщо проблеми залишаються:"
echo "1. Видаліть розширення з VS Code"
echo "2. Видаліть директорію розширення:"
echo "   - Windows: %USERPROFILE%\.vscode\extensions\vutov-mykola.css-classes-from-html-*"
echo "   - Mac/Linux: ~/.vscode/extensions/vutov-mykola.css-classes-from-html-*"
echo "3. Перевстановіть розширення"

echo ""
echo "🎉 Перевірка завершена!"
