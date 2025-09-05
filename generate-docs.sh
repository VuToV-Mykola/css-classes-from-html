#!/bin/bash
# generate-docs.sh - Генератор документації на 3 мовах
# @version 3.0.0

echo "📚 Генерація документації на 3 мовах..."

# README.md - Українська версія
cat > README.md << 'EOF'
# 🎨 CSS Classes from HTML

### 🌐 Виберіть мову/Choose language/Wählen Sprache:
[🇺🇦 Українська](README.md) | [🇬🇧 English](README.en.md) | [🇩🇪 Deutsch](README.de.md)

## 📌 Опис

Автоматична генерація CSS класів з HTML файлів з інтеграцією Figma. Розроблено завдяки знанням отриманим на курсах GoIT з використанням штучного інтелекту.

## ✨ Можливості

- 🚀 **Три режими генерації**: Мінімальний, Максимальний, Production
- 🎨 **Інтеграція з Figma**: Імпорт стилів безпосередньо з дизайнів
- 📱 **Адаптивні стилі**: Автоматична генерація media queries
- 🔧 **Оптимізація**: Мініфікація та оптимізація для production
- 💾 **Збереження налаштувань**: Автоматичне збереження конфігурації

## 📦 Встановлення

### Спосіб 1: З VS Code Marketplace
```bash
code --install-extension vutov-mykola.css-classes-from-html
```

### Спосіб 2: З VSIX файлу
1. Завантажте `.vsix` файл з [Releases](https://github.com/VuToV-Mykola/css-classes-from-html/releases)
2. У VS Code: `Ctrl+Shift+P` → `Extensions: Install from VSIX...`

### Спосіб 3: З вихідного коду
```bash
git clone https://github.com/VuToV-Mykola/css-classes-from-html.git
cd css-classes-from-html
npm install
```

## 🚀 Використання

1. Відкрийте HTML файл у VS Code
2. Натисніть `Ctrl+Shift+P` (Windows/Linux) або `Cmd+Shift+P` (Mac)
3. Виберіть `CSS Classes: Show Main Menu`
4. Оберіть режим генерації:
   - **Мінімальний**: Базові CSS класи
   - **Максимальний**: Повна інтеграція з Figma
   - **Production**: Оптимізований код

## ⚙️ Налаштування

### Figma інтеграція
1. Отримайте [Figma Personal Access Token](https://www.figma.com/developers/api#access-tokens)
2. Вставте посилання на Figma файл
3. Виберіть Canvas та Layers для імпорту

### Опції генерації
- `includeReset`: Включити reset стилі
- `includeComments`: Додати коментарі
- `optimizeCSS`: Оптимізувати CSS
- `generateResponsive`: Генерувати адаптивні стилі

## ⌨️ Гарячі клавіші

| Команда | Windows/Linux | Mac |
|---------|---------------|-----|
| Показати меню | `Ctrl+Shift+C` | `Cmd+Shift+C` |
| Швидка генерація | `Ctrl+Alt+C` | `Cmd+Alt+C` |

## 🛠️ Розробка

```bash
# Клонування репозиторію
git clone https://github.com/VuToV-Mykola/css-classes-from-html.git

# Встановлення залежностей
npm install

# Запуск тестів
npm test

# Створення VSIX пакету
vsce package
```

## 📝 Ліцензія

MIT License - дивіться файл [LICENSE](LICENSE)

## 👨‍💻 Автор

**VuToV-Mykola**
- GitHub: [@VuToV-Mykola](https://github.com/VuToV-Mykola)
- Email: vutov.mykola@gmail.com

## 🙏 Подяки

- [GoIT](https://goit.global) - за знання та навчання
- Anthropic Claude AI - за допомогу в розробці
- VS Code Team - за чудовий редактор

## 🐛 Повідомлення про помилки

Знайшли помилку? [Створіть issue](https://github.com/VuToV-Mykola/css-classes-from-html/issues)

## 🤝 Внесок у проєкт

Внески вітаються! Будь ласка, прочитайте [CONTRIBUTING.md](CONTRIBUTING.md)

---
Розроблено з ❤️ в Україні 🇺🇦
EOF

# README.en.md - English version
cat > README.en.md << 'EOF'
# 🎨 CSS Classes from HTML

### 🌐 Виберіть мову/Choose language/Wählen Sprache:
[🇺🇦 Українська](README.md) | [🇬🇧 English](README.en.md) | [🇩🇪 Deutsch](README.de.md)

## 📌 Description

Automatic CSS class generation from HTML files with Figma integration. Developed with knowledge gained from GoIT courses and AI assistance.

## ✨ Features

- 🚀 **Three generation modes**: Minimal, Maximum, Production
- 🎨 **Figma integration**: Import styles directly from designs
- 📱 **Responsive styles**: Automatic media queries generation
- 🔧 **Optimization**: Minification and production optimization
- 💾 **Settings persistence**: Automatic configuration saving

## 📦 Installation

### Method 1: From VS Code Marketplace
```bash
code --install-extension vutov-mykola.css-classes-from-html
```

### Method 2: From VSIX file
1. Download `.vsix` file from [Releases](https://github.com/VuToV-Mykola/css-classes-from-html/releases)
2. In VS Code: `Ctrl+Shift+P` → `Extensions: Install from VSIX...`

### Method 3: From source code
```bash
git clone https://github.com/VuToV-Mykola/css-classes-from-html.git
cd css-classes-from-html
npm install
```

## 🚀 Usage

1. Open HTML file in VS Code
2. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
3. Select `CSS Classes: Show Main Menu`
4. Choose generation mode:
   - **Minimal**: Basic CSS classes