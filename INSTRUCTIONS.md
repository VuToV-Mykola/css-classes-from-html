# Інструкція з виправлення помилок команд

## Виконані зміни:

### 1. package.json
- Додано `"onStartupFinished"` до activationEvents

### 2. extension.js  
- Додано реєстрацію команди `css-classes.showMenu`
- Додано реєстрацію команди `css-classes.showMenuFromContext`

### 3. Створено простий тестовий скрипт
- `test-commands-simple.js` - перевіряє структуру файлів без залежності від vscode

## Наступні кроки:

1. **Перезавантажте VS Code** - це обов'язково для активації змін
2. **Перевірте команди** через Command Palette (Ctrl+Shift+P)
3. **Тестуйте контекстне меню** на HTML-файлах

## Команди для перевірки:

```bash
# Перезавантажити VS Code
code --restart

# Запустити простий тест структури
node test-commands-simple.js
