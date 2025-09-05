### 🌐 Виберіть мову/Choose language/Wählen Sprache:

[🇺🇦 Українська](README.md) | [🇬🇧 English](README.en.md) | [🇩🇪 Deutsch](README.de.md)

<!-- AUTOGEN:STATS -->
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript) [![Shell](https://img.shields.io/badge/Shell-000000?style=for-the-badge)]() [![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML) [![Terminal](https://img.shields.io/badge/mac%20terminal-000000?style=for-the-badge&logo=apple&logoColor=white&labelColor=000000)](https://support.apple.com/guide/terminal/welcome/mac) [![VS Code](https://img.shields.io/badge/VS_Code-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white)](https://code.visualstudio.com/) [![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/) [![Figma](https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white)](https://www.figma.com/) 

[![📊 Views](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/VuToV-Mykola/css-classes-from-html/main/assets/db/visitors-badge.json)](https://github.com/VuToV-Mykola/css-classes-from-html/graphs/traffic)
[![⭐ Stars](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/VuToV-Mykola/css-classes-from-html/main/assets/db/likes-badge.json)](https://github.com/VuToV-Mykola/css-classes-from-html/actions/workflows/screenshot-and-visitor.yaml)
[![📦 Size](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/VuToV-Mykola/css-classes-from-html/main/assets/db/repo-size.json)](https://github.com/VuToV-Mykola/css-classes-from-html)
[![📄 License](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/VuToV-Mykola/css-classes-from-html/main/assets/db/repo-license.json)](https://github.com/VuToV-Mykola/css-classes-from-html/blob/main/LICENSE)
[![📝 Commits](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/VuToV-Mykola/css-classes-from-html/main/assets/db/commits-badge.json)](https://github.com/VuToV-Mykola/css-classes-from-html/commits)
[![👥 Contributors](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/VuToV-Mykola/css-classes-from-html/main/assets/db/contributors-badge.json)](https://github.com/VuToV-Mykola/css-classes-from-html/graphs/contributors)
[![⬇️ Downloads](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/VuToV-Mykola/css-classes-from-html/main/assets/db/downloads-badge.json)](https://github.com/VuToV-Mykola/css-classes-from-html/releases)

<!-- ## 📸 Скріншот проекту -->
<!-- ![Project Screenshot](./assets/screenshot.png) -->
<!-- END:AUTOGEN -->

# 🎨 CSS Classes from HTML - Figma Integration

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![VSCode](https://img.shields.io/badge/VSCode-^1.85.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 📌 Опис

**CSS Classes from HTML** — це потужне розширення для Visual Studio Code, яке автоматично генерує CSS класи з HTML файлів з можливістю інтеграції з Figma дизайнами.

## ✨ Основні можливості

- 🚀 **Швидка генерація CSS** з HTML класів
- 🎨 **Інтеграція з Figma** через API
- 📱 **Адаптивні стилі** з media queries
- 🎯 **Розумне співставлення** елементів
- ⚡ **3 режими роботи**: мінімальний, максимальний, production
- 🔧 **Візуальний конфігуратор** у WebView
- 💾 **Збереження налаштувань** для повторного використання

## 📦 Встановлення

### З VSCode Marketplace
1. Відкрийте VSCode
2. Перейдіть в Extensions (Ctrl+Shift+X)
3. Знайдіть "CSS Classes from HTML"
4. Натисніть Install

### Ручне встановлення
```bash
git clone https://github.com/VuToV-Mykola/css-classes-from-html.git
cd css-classes-from-html
npm install
npm run compile
```

## 🚀 Використання

### Швидкий старт
1. Відкрийте HTML файл у VSCode
2. Натисніть `Ctrl+Shift+C` (або `Cmd+Shift+C` на Mac)
3. Виберіть режим генерації
4. CSS файл буде створено автоматично!

### Гарячі клавіші
- `Ctrl+Shift+C` - Показати меню
- `Ctrl+Alt+C` - Швидка генерація
- `Ctrl+Shift+R` - Повторити останню дію

### Режими роботи

#### ⚡ Мінімальний режим
- Швидкий парсинг HTML
- Генерація порожніх CSS класів
- Без інтеграції з Figma

#### 🚀 Максимальний режим
- Повна інтеграція з Figma
- Співставлення елементів
- Імпорт стилів з дизайну
- Адаптивні стилі

#### 📦 Production режим
- Оптимізований CSS
- Мінімізація коду
- Видалення коментарів
- Ready для деплою

## ⚙️ Налаштування

### Figma інтеграція
1. Отримайте API токен на [figma.com/developers](https://www.figma.com/developers)
2. Додайте токен в налаштування розширення
3. Вставте посилання на Figma файл при генерації

### Параметри конфігурації
- `cssClasses.includeReset` - Включити CSS reset
- `cssClasses.includeComments` - Додавати коментарі
- `cssClasses.optimizeCSS` - Оптимізувати CSS
- `cssClasses.generateResponsive` - Генерувати media queries

## 📊 Приклад роботи

### Вхідний HTML:
```html
<div class="container">
    <header class="header">
        <nav class="nav-menu">
            <a class="nav-link">Home</a>
        </nav>
    </header>
    <main class="content">
        <section class="hero-section">
            <h1 class="hero-title">Welcome</h1>
            <button class="btn btn-primary">Get Started</button>
        </section>
    </main>
</div>
```

### Згенерований CSS:
```css
/* Container */
.container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Header */
.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 0;
}

/* Navigation */
.nav-menu {
    display: flex;
    gap: 2rem;
}

.nav-link {
    color: var(--text-color);
    text-decoration: none;
    transition: color 0.3s ease;
}

.nav-link:hover {
    color: var(--primary-color);
}

/* Content */
.content {
    padding: 2rem 0;
}

/* Hero Section */
.hero-section {
    text-align: center;
    padding: 4rem 0;
}

.hero-title {
    font-size: 3rem;
    margin-bottom: 2rem;
}

/* Buttons */
.btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-primary {
    background-color: var(--primary-color);
    color: white;
}

.btn-primary:hover {
    background-color: var(--primary-hover);
    transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 768px) {
    .container {
        padding: 0 15px;
    }
    
    .hero-title {
        font-size: 2rem;
    }
    
    .nav-menu {
        flex-direction: column;
        gap: 1rem;
    }
}
```

## 🛠️ Розробка

### Структура проекту
```
css-classes-from-html/
├── extension.js         # Головний файл розширення
├── package.json         # Конфігурація
├── core/               # Основні модулі
│   ├── FigmaAPIClient.js
│   ├── HTMLParser.js
│   ├── StyleMatcher.js
│   └── CSSGenerator.js
├── analyzers/          # Аналізатори
├── generators/         # Генератори
└── utils/             # Утиліти
```

### Збірка проекту
```bash
npm run compile      # Компіляція
npm run watch       # Watch mode
npm run test        # Тестування
npm run package     # Створення VSIX
```

## 🤝 Внесок у проект

Ми вітаємо внески від спільноти! Будь ласка:

1. Fork репозиторій
2. Створіть гілку для вашої функції
3. Commit ваші зміни
4. Push в гілку
5. Створіть Pull Request

## 📝 Ліцензія

MIT License - див. файл [LICENSE](LICENSE)

## 👨‍💻 Автор

**VuToV Mykola**
- GitHub: [@VuToV-Mykola](https://github.com/VuToV-Mykola)
- Email: your-email@example.com

## 🙏 Подяки

- Команді GoIT за навчання
- Спільноті VSCode за підтримку
- Figma за чудове API

## 📞 Підтримка

Якщо у вас виникли питання або проблеми:
- Створіть [Issue](https://github.com/VuToV-Mykola/css-classes-from-html/issues)
- Напишіть на email
- Приєднуйтесь до нашого Discord

---

Made with ❤️ in Ukraine 🇺🇦
