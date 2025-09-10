#!/bin/bash

# 🐙 GitHub Push Script for CSS Classes from HTML v0.0.7
# Автоматичний push з багатомовною документацією
# Author: VuToV-Mykola

set -e

# 🎨 Кольори
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🐙 GitHub Push Script v0.0.7${NC}"
echo "=================================="

# ✅ Перевірка Git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git не знайдено${NC}"
    exit 1
fi

# ✅ Перевірка репозиторію
if [ ! -d .git ]; then
    echo -e "${YELLOW}⚠️ Git репозиторій не ініціалізовано${NC}"
    echo -e "${BLUE}🔧 Ініціалізація...${NC}"
    git init
    git remote add origin https://github.com/VuToV-Mykola/css-classes-from-html.git
fi

# ✅ Генерація документації
echo -e "${BLUE}📚 Генерація документації...${NC}"
if [ -f generate-docs.sh ]; then
    chmod +x generate-docs.sh
    ./generate-docs.sh
else
    echo -e "${YELLOW}⚠️ generate-docs.sh не знайдено${NC}"
fi

# ✅ Перевірка файлів
echo -e "${BLUE}📋 Перевірка файлів...${NC}"

REQUIRED_FILES=(
    "deploy.sh"
    "package.json"
    "extension.js"
    "README.md"
    "scripts/tests.sh"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file відсутній${NC}"
    fi
done

# ✅ Статус змін
echo -e "\n${BLUE}📊 Статус змін:${NC}"
git status --porcelain

# ✅ Додавання файлів
echo -e "\n${BLUE}📦 Додавання файлів...${NC}"
git add --all

# ✅ Створення коміту
COMMIT_MESSAGE="🌍 Enhanced deploy script v0.0.7 with multilingual docs

✨ Features:
- 🔍 Automatic project structure analysis
- ⚡ VS Code command validation & auto-fix
- 🎯 VS Code ^1.103.0 support
- 🔧 Auto-fix for 'Command * not found' errors
- 📋 Comprehensive logging and reporting
- 🌐 Multilingual documentation (UA, EN, DE)

🔧 Technical improvements:
- Enhanced error detection and fixing
- Backup system for safe operations
- Detailed deployment reports
- GitHub and Marketplace integration

📚 Documentation:
- README.md (Українська)
- README.en.md (English)  
- README.de.md (Deutsch)
- GitHub About sections and topics
- Comprehensive testing suite"

echo -e "${BLUE}💬 Коміт...${NC}"
git commit -m "$COMMIT_MESSAGE"

# ✅ Створення тегу
VERSION="v0.0.7"
echo -e "${BLUE}🏷️ Створення тегу $VERSION...${NC}"
git tag -f "$VERSION" -m "Release $VERSION - Enhanced deploy with command validation"

# ✅ Push на GitHub
echo -e "${BLUE}🚀 Push на GitHub...${NC}"
if git push --force origin main --tags; then
    echo -e "${GREEN}🎉 Успішно завантажено на GitHub!${NC}"
    echo ""
    echo -e "${YELLOW}📋 Наступні кроки:${NC}"
    echo "1. Оновити About секцію на GitHub"
    echo "2. Додати Topics (з github-topics.txt)"
    echo "3. Створити Release на GitHub"
    echo "4. Протестувати розширення"
    echo ""
    
    # ✅ Інформація про About секцію
    if [ -f github-about.txt ]; then
        echo -e "${BLUE}📌 GitHub About секції:${NC}"
        cat github-about.txt
        echo ""
    fi
    
    # ✅ Інформація про Topics
    if [ -f github-topics.txt ]; then
        echo -e "${BLUE}🏷️ GitHub Topics:${NC}"
        cat github-topics.txt
        echo ""
    fi
    
    echo -e "${GREEN}✅ Деплой завершено успішно!${NC}"
else
    echo -e "${RED}❌ Помилка push на GitHub${NC}"
    exit 1
fi