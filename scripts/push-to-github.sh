#!/bin/bash

# ✅ Команди для пуша на GitHub
echo "🚀 Pushing CSS Classes from HTML v0.0.7 to GitHub..."

# Додавання всіх змін
git add --all

# Створення коміту
git commit -m "🚀 CSS Classes from HTML v0.0.7 - Enhanced Figma Integration & Asset Import"

# Створення тегу
git tag -a "v0.0.7" -m "Release v0.0.7 - Enhanced Figma Integration"

# Пуш змін та тегів
git push origin main --tags

echo "✅ Successfully pushed to GitHub!"
echo "🔗 Create release at: https://github.com/VuToV-Mykola/css-classes-from-html/releases/new"
echo "📦 Upload VSIX file from builds/ directory"
