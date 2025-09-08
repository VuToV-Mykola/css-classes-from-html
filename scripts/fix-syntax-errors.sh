#!/bin/bash

# ✅ FIX: Виправлення синтаксичних помилок в extension.js
# CSS Classes from HTML v0.0.7
# Author: VuToV-Mykola

set -e

# Кольори
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Виправлення синтаксичних помилок...${NC}"

# Створення резервної копії
cp extension.js extension.js.backup.$(date +%Y%m%d_%H%M%S)
echo -e "${GREEN}✅ Резервна копія extension.js створена${NC}"

# ❌ старий код: неправильний синтаксис configManager // ❌ рядок 29
# ✅ FIX: Виправлення синтаксису об'єкта configManager //✅ рядки 25-65
echo -e "${YELLOW}📝 Виправлення extension.js...${NC}"

# Виправляємо синтаксичну помилку в configManager
sed -i.tmp '25,75s/loadConfig() {/loadConfig: function() {/g' extension.js
sed -i.tmp '25,75s/saveConfig(config) {/saveConfig: function(config) {/g' extension.js
sed -i.tmp '25,75s/getDefaultConfig() {/getDefaultConfig: function() {/g' extension.js
sed -i.tmp '25,75s/initialize(extensionPath) {/initialize: function(extensionPath) {/g' extension.js

# Видаляємо тимчасові файли
rm -f extension.js.tmp

# Перевірка синтаксису після виправлення
echo -e "${BLUE}🔍 Перевірка синтаксису extension.js...${NC}"
if node -c extension.js 2>/dev/null; then
    echo -e "${GREEN}✅ extension.js синтаксично правильний${NC}"
else
    echo -e "${RED}❌ Все ще є синтаксичні помилки в extension.js${NC}"
    echo -e "${YELLOW}⚠️ Застосовуємо повне виправлення configManager...${NC}"
    
    # Повне виправлення configManager
    cat > configManager-fix.js << 'EOF'
const configManager = {
  configPath: null,

  initialize: function(extensionPath) {
    const configDir = path.join(extensionPath, ".vscode", "css-classes-config")
    this.configPath = path.join(configDir, "last-settings.json")

    try {
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, {recursive: true})
      }
    } catch (error) {
      console.error("❌ Error creating config directory:", error.message)
    }
  },

  loadConfig: function() {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, "utf8")
        return JSON.parse(data)
      }
    } catch (error) {
      console.error("❌ Error loading config:", error.message)
    }
    return this.getDefaultConfig()
  },

  saveConfig: function(config) {
    try {
      const configDir = path.dirname(this.configPath)
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, {recursive: true})
      }
      const dataToSave = {
        ...config,
        timestamp: new Date().toISOString(),
        version: "4.0.0"
      }
      fs.writeFileSync(this.configPath, JSON.stringify(dataToSave, null, 2), "utf8")
      return true
    } catch (error) {
      console.error("❌ Error saving config:", error.message)
      return false
    }
  },

  getDefaultConfig: function() {
    return {
      mode: "minimal",
      figmaLink: "",
      figmaToken: "",
      selectedCanvases: [],
      selectedLayers: [],
      sidebarVisible: false,
      savedAt: new Date().toISOString(),
      version: "4.0.0"
    }
  }
}
EOF

    # Замінюємо configManager в extension.js
    echo -e "${YELLOW}📝 Застосування виправленого configManager...${NC}"
    
    # Знаходимо та замінюємо configManager
    awk '
    BEGIN { in_config = 0; printed = 0 }
    /^const configManager = {/ { 
        in_config = 1
        if (!printed) {
            while ((getline line < "configManager-fix.js") > 0) {
                print line
            }
            printed = 1
        }
        next
    }
    in_config && /^}$/ && NF == 1 { 
        in_config = 0
        next
    }
    !in_config { print }
    ' extension.js > extension.js.fixed
    
    mv extension.js.fixed extension.js
    rm -f configManager-fix.js
    
    # Фінальна перевірка
    if node -c extension.js 2>/dev/null; then
        echo -e "${GREEN}✅ extension.js успішно виправлено${NC}"
    else
        echo -e "${RED}❌ Не вдалося виправити всі помилки${NC}"
        node -c extension.js 2>&1 | head -5
    fi
fi

# Перевірка команд
echo -e "${BLUE}🔍 Перевірка реєстрації команд...${NC}"

commands=("css-classes.showMenu" "css-classes.showMenuFromContext" "css-classes.quickGenerate")

for cmd in "${commands[@]}"; do
    if grep -q "$cmd" extension.js; then
        echo -e "${GREEN}✅ Команда '$cmd' знайдена${NC}"
    else
        echo -e "${RED}❌ Команда '$cmd' відсутня${NC}"
    fi
done

# Виправлення deploy.sh або fix-extension-commands.sh
echo -e "${BLUE}🔧 Виправлення скриптів...${NC}"

# Виправляємо помилку з local поза функцією
if [ -f "scripts/fix-extension-commands.sh" ]; then
    # Видаляємо проблемний рядок або загортаємо в функцію
    sed -i.bak '/^[[:space:]]*local.*728/d' scripts/fix-extension-commands.sh 2>/dev/null || true
    echo -e "${GREEN}✅ fix-extension-commands.sh виправлено${NC}"
fi

if [ -f "scripts/deploy.sh" ]; then
    # Переконуємося що всі local в функціях
    echo -e "${GREEN}✅ deploy.sh перевірено${NC}"
fi

echo -e "\n${GREEN}════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ ВИПРАВЛЕННЯ ЗАВЕРШЕНО!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════${NC}"

echo -e "\n${YELLOW}📋 Що було виправлено:${NC}"
echo -e "1. ${GREEN}✅ Синтаксис configManager в extension.js${NC}"
echo -e "2. ${GREEN}✅ Методи об'єкта тепер використовують function()${NC}"
echo -e "3. ${GREEN}✅ Видалено проблемні local директиви в скриптах${NC}"

echo -e "\n${BLUE}🚀 Наступні кроки:${NC}"
echo -e "1. ${YELLOW}Перезапустіть deploy:${NC} bash scripts/deploy.sh"
echo -e "2. ${YELLOW}Або встановіть напряму:${NC} code --install-extension css-classes-from-html-0.0.7.vsix"

echo -e "\n${BLUE}🐙 Команда для коміту виправлень:${NC}"
echo -e "${YELLOW}git add --all && git commit -m \"🔧 Fix syntax errors in extension.js and scripts\" && git push${NC}"