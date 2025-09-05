#!/bin/bash

#############################################
# 🔐 Налаштування Figma API токена
# Версія: 1.0.0
#############################################

# Кольори
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║           🔐 Налаштування Figma API Authentication          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${YELLOW}⚠️  Помилка 403 Forbidden означає:${NC}"
echo "  1. Відсутній або невірний Figma API токен"
echo "  2. Токен не має доступу до файлу"
echo "  3. Файл приватний або видалений"
echo ""

echo -e "${BLUE}📋 Інструкція отримання Figma API токена:${NC}"
echo "  1. Відкрийте Figma у браузері"
echo "  2. Перейдіть в Settings → Account Settings"
echo "  3. Прокрутіть до 'Personal access tokens'"
echo "  4. Натисніть 'Create new token'"
echo "  5. Дайте назву токену (наприклад: 'CSS Generator')"
echo "  6. Скопіюйте згенерований токен"
echo ""

# Перевірка поточного токена
if [ ! -z "$FIGMA_API_TOKEN" ]; then
    echo -e "${YELLOW}📌 Поточний токен знайдено (приховано для безпеки)${NC}"
    echo -e "   Перші символи: ${FIGMA_API_TOKEN:0:10}..."
    echo ""
    read -p "Бажаєте змінити токен? (y/n): " change_token
    if [ "$change_token" != "y" ]; then
        echo -e "${GREEN}✅ Використовується існуючий токен${NC}"
    else
        unset FIGMA_API_TOKEN
    fi
fi

# Введення нового токена
if [ -z "$FIGMA_API_TOKEN" ]; then
    echo -e "${CYAN}🔑 Введіть ваш Figma Personal Access Token:${NC}"
    read -s FIGMA_TOKEN_INPUT
    echo ""
    
    if [ -z "$FIGMA_TOKEN_INPUT" ]; then
        echo -e "${RED}❌ Токен не може бути порожнім!${NC}"
        exit 1
    fi
    
    export FIGMA_API_TOKEN="$FIGMA_TOKEN_INPUT"
    echo -e "${GREEN}✅ Токен встановлено${NC}"
fi

# Створення .env файлу
ENV_FILE="$HOME/Desktop/Projects/css-classes-from-html/.env"
echo -e "\n${BLUE}📁 Збереження токена в .env файл...${NC}"

cat > "$ENV_FILE" << EOF
# Figma API Configuration
FIGMA_API_TOKEN=$FIGMA_API_TOKEN

# Project Settings
PROJECT_NAME=css-classes-from-html
OUTPUT_DIR=./output
LOG_DIR=./log
EOF

echo -e "${GREEN}✅ .env файл створено${NC}"

# Додавання .env до .gitignore
GITIGNORE_FILE="$HOME/Desktop/Projects/css-classes-from-html/.gitignore"
if ! grep -q "^.env" "$GITIGNORE_FILE" 2>/dev/null; then
    echo -e "\n# Environment variables\n.env\n.env.local" >> "$GITIGNORE_FILE"
    echo -e "${GREEN}✅ .env додано до .gitignore${NC}"
fi

echo ""
echo -e "${CYAN}🔍 Перевірка доступу до Figma API...${NC}"

# Тестовий запит до API
FIGMA_FILE_KEY="Gz419qkOjPvKUuSgURTNP2"
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "X-Figma-Token: $FIGMA_API_TOKEN" \
    "https://api.figma.com/v1/files/$FIGMA_FILE_KEY")

echo ""
if [ "$API_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Токен працює! API відповів кодом 200${NC}"
    echo ""
    echo -e "${GREEN}🎉 Тепер можна запустити інтеграцію:${NC}"
    echo -e "${CYAN}cd ~/Desktop/Projects/css-classes-from-html${NC}"
    echo -e "${CYAN}node main.js $FIGMA_FILE_KEY examples/example.html${NC}"
elif [ "$API_RESPONSE" = "403" ]; then
    echo -e "${RED}❌ Помилка 403: Токен невірний або не має доступу${NC}"
    echo -e "${YELLOW}Перевірте:${NC}"
    echo "  - Чи правильно скопійований токен"
    echo "  - Чи маєте доступ до файлу у Figma"
elif [ "$API_RESPONSE" = "404" ]; then
    echo -e "${RED}❌ Помилка 404: Файл не знайдено${NC}"
    echo -e "${YELLOW}Введіть правильний Figma file key${NC}"
else
    echo -e "${RED}❌ Невідома помилка: HTTP $API_RESPONSE${NC}"
fi

echo ""
echo -e "${CYAN}📝 Додаткова інформація:${NC}"
echo "  • Токен зберігається в змінній FIGMA_API_TOKEN"
echo "  • Для постійного збереження додайте до ~/.bashrc або ~/.zshrc:"
echo -e "    ${YELLOW}export FIGMA_API_TOKEN='ваш_токен'${NC}"
echo ""

# Створення тестового файлу з правильним ключем
TEST_FILE="$HOME/Desktop/Projects/css-classes-from-html/test_figma.js"
cat > "$TEST_FILE" << 'EOF'
#!/usr/bin/env node

/**
 * Тестування Figma API з'єднання
 */

require('dotenv').config();

async function testFigmaAPI() {
    const token = process.env.FIGMA_API_TOKEN;
    
    if (!token) {
        console.error('❌ FIGMA_API_TOKEN не знайдено в .env файлі');
        process.exit(1);
    }
    
    console.log('🔍 Тестування Figma API...');
    console.log(`📝 Токен: ${token.substring(0, 10)}...`);
    
    // Список тестових файлів для перевірки
    const testFiles = [
        { key: 'Gz419qkOjPvKUuSgURTNP2', name: 'Original file' },
        { key: 'FILE_KEY', name: 'User file' }
    ];
    
    for (const file of testFiles) {
        try {
            const response = await fetch(`https://api.figma.com/v1/files/${file.key}`, {
                headers: {
                    'X-Figma-Token': token
                }
            });
            
            console.log(`\n📁 ${file.name} (${file.key}):`);
            console.log(`   Status: ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`   ✅ Назва: ${data.name}`);
                console.log(`   📅 Оновлено: ${data.lastModified}`);
            } else {
                const error = await response.text();
                console.log(`   ❌ Помилка: ${error}`);
            }
        } catch (err) {
            console.error(`   ❌ Помилка з'єднання: ${err.message}`);
        }
    }
}

testFigmaAPI();
EOF

chmod +x "$TEST_FILE"

echo -e "${GREEN}✅ Створено тестовий файл: test_figma.js${NC}"
echo -e "${CYAN}   Запустити: node test_figma.js${NC}"
echo ""

# Фінальна підказка
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    ✅ Налаштування завершено               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"