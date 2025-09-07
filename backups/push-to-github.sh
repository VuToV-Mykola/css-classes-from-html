#!/bin/bash

# ✅ Команда для пуша на GitHub
echo "🚀 Pushing CSS Classes from HTML v4.0.0 to GitHub..."

git add --all
git commit -m "🚀 CSS Classes from HTML v4.0.0 - Real Figma Integration with Smart Matching"
git tag -a "v4.0.0" -m "Release v4.0.0"
git push origin main --tags

echo "✅ Successfully pushed to GitHub!"
echo "🔗 Create release at: https://github.com/VuToV-Mykola/css-classes-from-html/releases/new"
