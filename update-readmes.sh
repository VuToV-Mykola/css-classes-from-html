#!/bin/bash
# Скрипт для оновлення всіх README файлів

echo "🌍 Оновлення мультимовних README файлів..."

# Додаємо виконання workflow через GitHub CLI
if command -v gh &> /dev/null; then
    gh workflow run update-all-readmes.yml
    echo "✅ Workflow запущено через GitHub CLI"
else
    echo "⚠️  GitHub CLI не знайдено, оновлення через git push"
    git add README*.md docs/README*.md guides/README*.md
    git commit -m "🌍 Оновлення README файлів" || true
    git push
fi