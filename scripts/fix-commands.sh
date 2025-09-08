#!/bin/bash

LOG_FILE="logs/fix-commands-integration.log"
echo "$(date): Початок інтеграції фіксів" > $LOG_FILE

# Крок 1: Резервне копіювання
cp extension.js backups/extension.js.bak
cp package.json backups/package.json.bak
echo "✅ Резервні копії створено" >> $LOG_FILE

# Крок 2: Застосувати фікси (використовуємо sed для редагування)
# Видалити дубльовані if в extension.js (приблизно рядки 70-85, адаптуйте)
sed -i '/context.globalState.update("isActive", true);/ {N; /if (context.globalState.get("isActive")) {/d;}' extension.js
sed -i '/context.globalState.update("isActive", true);/ {N; /if (context.globalState.get("isActive")) {/d;}' extension.js  # Другий дубль
echo "✅ Виправлено дубльовані перевірки в extension.js" >> $LOG_FILE

# Додати перевірку реєстру (додайте вручну або через echo >> extension.js)
# ...

# Видалити дублі в package.json
sed -i 's/"onStartupFinished", "onStartupFinished", "onStartupFinished"/"onStartupFinished"/' package.json
echo "✅ Виправлено activationEvents в package.json" >> $LOG_FILE

# Крок 3: Тестування
node debugs/diagnose-showMenuFromContext.js >> $LOG_FILE
./scripts/test-command-final.sh >> $LOG_FILE
./scripts/monitor-extension-logs.sh >> $LOG_FILE

# Крок 4: Пакування та встановлення
npm run package
code --uninstall-extension vutov-mykola.css-classes-from-html
code --install-extension builds/css-classes-from-html-0.0.7.vsix
echo "✅ Розширення перепаковано та встановлено" >> $LOG_FILE

echo "$(date): Інтеграція завершена. Перевірте $LOG_FILE"