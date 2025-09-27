#!/bin/bash

# ✅ FIX: Скрипт для виправлення помилок валідації HTML та CSS
# Автор: AI Assistant
# Дата: $(date)

echo "🔧 Початок виправлення помилок валідації..."

# Створюємо директорію для логів
mkdir -p logs

# Логуємо початок роботи
echo "$(date): Початок виправлення помилок валідації" >> logs/validation-fixes-$(date +%Y%m%d-%H%M%S).log

# Файл для виправлення
HTML_FILE="frontend/css-classes-from-html-menu.html"

if [ ! -f "$HTML_FILE" ]; then
    echo "❌ Помилка: Файл $HTML_FILE не знайдено!"
    exit 1
fi

echo "📁 Виправляємо файл: $HTML_FILE"

# ✅ FIX 1: Виправляємо CSS помилку overscroll-behavior: smooth
echo "🔧 Виправляємо CSS помилку: overscroll-behavior: smooth"
sed -i.bak 's/overscroll-behavior: smooth;/overscroll-behavior: contain;/g' "$HTML_FILE"
echo "✅ Виправлено: overscroll-behavior: smooth -> overscroll-behavior: contain"

# ✅ FIX 2: Виправляємо CSS помилку prefers-contrast: high
echo "🔧 Виправляємо CSS помилку: prefers-contrast: high"
sed -i.bak2 's/@media (prefers-contrast: high)/@media (prefers-contrast: more)/g' "$HTML_FILE"
echo "✅ Виправлено: prefers-contrast: high -> prefers-contrast: more"

# ✅ FIX 3: Виправляємо HTML помилки з input всередині button
echo "🔧 Виправляємо HTML помилки: input елементи всередині button"

# Створюємо тимчасовий файл для виправлення
TEMP_FILE=$(mktemp)

# Виправляємо перший button з input
sed 's/<button[^>]*class="btn btn-secondary"[^>]*onclick="toggleCheckbox('\''includeVariables'\'')"[^>]*>/<div class="btn btn-secondary" style="display: flex; align-items: center; gap: 6px; padding: 0.4rem 0.6rem; font-size: 0.8rem; cursor: pointer;" onclick="toggleCheckbox('\''includeVariables'\'')">/g' "$HTML_FILE" > "$TEMP_FILE"
sed 's/<\/button>/<\/div>/g' "$TEMP_FILE" > "$HTML_FILE"

# Виправляємо другий button з input
sed 's/<button[^>]*class="btn btn-primary"[^>]*onclick="toggleCheckbox('\''globalStylesToggle'\'')"[^>]*>/<div class="btn btn-primary" style="display: flex; align-items: center; gap: 6px; padding: 0.4rem 0.6rem; font-size: 0.8rem; cursor: pointer;" onclick="toggleCheckbox('\''globalStylesToggle'\'')">/g' "$HTML_FILE" > "$TEMP_FILE"
sed 's/<\/button>/<\/div>/g' "$TEMP_FILE" > "$HTML_FILE"

# Виправляємо третій button з input
sed 's/<button[^>]*class="btn btn-primary"[^>]*onclick="toggleCheckbox('\''resetStylesToggle'\'')"[^>]*>/<div class="btn btn-primary" style="display: flex; align-items: center; gap: 6px; padding: 0.4rem 0.6rem; font-size: 0.8rem; cursor: pointer;" onclick="toggleCheckbox('\''resetStylesToggle'\'')">/g' "$HTML_FILE" > "$TEMP_FILE"
sed 's/<\/button>/<\/div>/g' "$TEMP_FILE" > "$HTML_FILE"

# Виправляємо четвертий button з input
sed 's/<button[^>]*class="btn btn-primary"[^>]*onclick="toggleCheckbox('\''includeUserStyles'\'')"[^>]*>/<div class="btn btn-primary" style="display: flex; align-items: center; gap: 6px; padding: 0.4rem 0.6rem; font-size: 0.8rem; cursor: pointer;" onclick="toggleCheckbox('\''includeUserStyles'\'')">/g' "$HTML_FILE" > "$TEMP_FILE"
sed 's/<\/button>/<\/div>/g' "$TEMP_FILE" > "$HTML_FILE"

# Видаляємо тимчасовий файл
rm -f "$TEMP_FILE"

echo "✅ Виправлено: input елементи тепер поза button елементами"

# ✅ FIX 4: Додаємо валідні CSS властивості для кращої сумісності
echo "🔧 Додаємо валідні CSS властивості для кращої сумісності"

# Додаємо fallback для scrollbar-width
sed -i.bak3 's/scrollbar-width: thin;/scrollbar-width: thin; \/* fallback для старих браузерів *\/ -ms-overflow-style: -ms-autohiding-scrollbar;/g' "$HTML_FILE"

# Додаємо fallback для scrollbar-color
sed -i.bak4 's/scrollbar-color: var(--border) transparent;/scrollbar-color: var(--border) transparent; \/* fallback для старих браузерів *\/ -ms-scrollbar-track-color: transparent; -ms-scrollbar-face-color: var(--border);/g' "$HTML_FILE"

echo "✅ Додано fallback для CSS властивостей"

# ✅ FIX 5: Виправляємо backdrop-filter для кращої сумісності
echo "🔧 Виправляємо backdrop-filter для кращої сумісності"
sed -i.bak5 's/backdrop-filter: blur(10px);/backdrop-filter: blur(10px); \/* fallback для старих браузерів *\/ background: rgba(0, 0, 0, 0.8);/g' "$HTML_FILE"

echo "✅ Виправлено: backdrop-filter з fallback"

# Очищуємо backup файли
rm -f "$HTML_FILE.bak" "$HTML_FILE.bak2" "$HTML_FILE.bak3" "$HTML_FILE.bak4" "$HTML_FILE.bak5"

# Логуємо завершення
echo "$(date): Завершено виправлення помилок валідації" >> logs/validation-fixes-$(date +%Y%m%d-%H%M%S).log

echo "🎉 Всі помилки валідації виправлені!"
echo "📋 Виправлені помилки:"
echo "   ✅ overscroll-behavior: smooth -> overscroll-behavior: contain"
echo "   ✅ prefers-contrast: high -> prefers-contrast: more"
echo "   ✅ input елементи винесені з button елементів"
echo "   ✅ Додано fallback для CSS властивостей"
echo "   ✅ Виправлено backdrop-filter з fallback"

echo "🔍 Рекомендується перевірити файл через:"
echo "   - HTML валідатор: https://validator.w3.org/"
echo "   - CSS валідатор: https://jigsaw.w3.org/css-validator/"
echo "   - JavaScript валідатор: https://jshint.com/"

echo "📁 Логи збережено в директорії: logs/"
