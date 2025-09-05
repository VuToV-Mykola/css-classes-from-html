#!/bin/bash
# Скрипт встановлення залежностей для CSS Classes from HTML
# Оновлено для сучасних пакетів та Node.js 18+/ESM

echo "📦 Встановлення залежностей для CSS Classes from HTML"

# Перевіряємо чи встановлений Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не встановлено. Будь ласка, встановіть Node.js з https://nodejs.org/"
    exit 1
fi
echo "✓ Node.js знайдено: $(node --version)"

# Перевіряємо чи встановлений npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm не встановлено"
    exit 1
fi
echo "✓ npm знайдено: $(npm --version)"

# Встановлюємо залежності
echo "📦 Встановлення npm залежностей..."
npm install --save-dev @types/vscode @vscode/test-electron
npm install node-fetch@3 jsdom mkdirp@latest glob@9

# Перевіряємо ключові залежності
echo "🔍 Перевірка залежностей..."

# VSCode API
if npm list @types/vscode &> /dev/null && npm list @vscode/test-electron &> /dev/null; then
    echo "✓ VS Code API встановлено"
else
    echo "❌ VS Code API не встановлено"
    echo "Спробуйте встановити вручну: npm install --save-dev @types/vscode @vscode/test-electron"
fi

# node-fetch
if npm list node-fetch &> /dev/null; then
    echo "✓ node-fetch встановлено"
else
    echo "⚠️  node-fetch не встановлено (потрібен для Figma API)"
fi

# jsdom
if npm list jsdom &> /dev/null; then
    echo "✓ jsdom встановлено"
else
    echo "⚠️  jsdom не встановлено (потрібен для HTML парсингу)"
fi

# mkdirp
if npm list mkdirp &> /dev/null; then
    echo "✓ mkdirp встановлено"
else
    echo "⚠️  mkdirp не встановлено (для створення директорій)"
fi

# glob
if npm list glob &> /dev/null; then
    echo "✓ glob встановлено"
else
    echo "⚠️  glob не встановлено (для роботи з файлами)"
fi

echo ""
echo "🎉 Встановлення завершено!"
echo "📋 Наступні кроки:"
echo "1. Запустіть тестовий скрипт: ./test-fix.sh"
echo "2. Перезавантажте VS Code"
echo "3. Перевірте роботу розширення"
