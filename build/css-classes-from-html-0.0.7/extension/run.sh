#!/bin/bash

echo "🎨 CSS Classes from HTML"
echo "======================="
echo ""
echo "Виберіть опцію:"
echo "1) 🌐 Запустити Web UI"
echo "2) 📝 CLI режим"
echo "3) 🧪 Запустити тести"
echo "4) 📦 Встановити залежності"
echo "5) 🗑️ Очистити кеш"
echo ""
read -p "Ваш вибір (1-5): " choice

case $choice in
  1)
    npm run dev
    ;;
  2)
    read -p "Figma file key: " figma_key
    read -p "HTML file (examples/example.html): " html_file
    html_file=${html_file:-examples/example.html}
    node main.js "$figma_key" "$html_file"
    ;;
  3)
    npm test
    ;;
  4)
    npm install
    ;;
  5)
    rm -rf .vscode/css-classes-config
    rm -rf output/*
    echo "✅ Кеш очищено"
    ;;
  *)
    echo "Невірний вибір"
    ;;
esac
