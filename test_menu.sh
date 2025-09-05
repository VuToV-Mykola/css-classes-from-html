#!/bin/bash

mkdir -p log
echo "📌 Запуск тестів WebView меню..." | tee -a log/test_log.txt

curl -s http://localhost:8000/webview/menu.html > /dev/null
echo "$(date): HTML завантажено" >> log/test_log.txt

echo "✅ Тести завершено"
