#!/bin/bash
# Скрипт очистки та перевстановлення залежностей для VS Code розширення

echo "🧹 Очищення та перевстановлення залежностей"
echo "=========================================="

# Зупиняємо скрипт при першій помилці
set -e

echo "📦 Перевірка поточного стану..."
npm list --depth=0 2>/dev/null || echo "ℹ️  npm list має помилки (очікувано)"

echo "🗑️  Видаляємо node_modules та package-lock.json..."
rm -rf node_modules
rm -f package-lock.json
rm -f npm-debug.log

echo "🔄 Повне перевстановлення залежностей..."
npm install

echo "🔧 Встановлення тільки production залежностей..."
npm install --production

echo "🧹 Очистка непотрібних залежностей..."
npm prune --production

echo "📋 Перевірка залежностей..."
if npm list --production --depth=0 2>/dev/null; then
    echo "✅ Залежності в порядку"
else
    echo "⚠️  Є попередження, але це нормально для VS Code розширень"
fi

echo "🔍 Перевірка ключових залежностей..."
REQUIRED_DEPS=("vscode" "node-fetch" "jsdom")
for dep in "${REQUIRED_DEPS[@]}"; do
    if npm list "$dep" --production >/dev/null 2>&1; then
        echo "✅ $dep знайдено"
    else
        echo "❌ $dep не знайдено"
        npm install "$dep" --save --production
    fi
done

echo "🎉 Очистка та встановлення завершено!"
echo ""
echo "📋 Наступні кроки:"
echo "1. Запустіть: npm run lint"
echo "2. Запустіть: npm test"
echo "3. Запустіть: vsce package"
echo ""
echo "ℹ️  Якщо vsce package все ще має помилки, спробуйте:"
echo "   vsce package --yarn"