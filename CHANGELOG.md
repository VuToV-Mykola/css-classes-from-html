# Changelog

All notable changes to the "CSS Classes from HTML" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.6] - 2025-01-03

### 🎉 Major Features
- **Configuration Management System** - повна система управління налаштуваннями з пресетами
- **2025 CSS Standards** - підтримка сучасних CSS властивостей (container queries, subgrid, cascade layers)
- **Performance Optimization** - Set/Map оптимізації замість масивів для O(1) пошуку
- **Configurable Comments** - налаштування стилю коментарів (author/standard)

### ✨ New Features
- Множинний вибір Canvas з Figma макетів
- Система пресетів конфігурації (мінімальне, стандартне, максимальне, продакшн)
- Експорт/імпорт конфігурацій у JSON форматі
- Історія дій для швидкого повторення
- Автоматичне збереження останніх налаштувань
- Покращена система коментарів з підтримкою мов

### 🚀 Performance Improvements
- Кешування селекторів для миттєвої обробки великих файлів
- Memory management з автоматичним очищенням пам'яті
- Оптимізовані алгоритми парсингу CSS та HTML
- Швидша генерація CSS з мінімальними обчисленнями

### 🎨 CSS Generation Enhancements
- Modern CSS syntax (oklch(), color-mix(), aspect-ratio)
- Container queries для адаптивності нового покоління
- CSS Grid subgrid підтримка
- Cascade layers для контролю каскаду
- Покращені shorthand оптимізації

### 🛡️ Security & Quality
- Security audit з захистом від Path Traversal та Log Injection
- Enhanced error handling з детальною обробкою помилок
- Input validation для всіх вхідних даних
- Безпечна робота з файловою системою

### 🔧 Developer Experience
- Нові команди управління пресетами
- Покращений інтерфейс вибору конфігурацій
- Детальні повідомлення про помилки
- Автоматичне відновлення після збоїв

### 🐛 Bug Fixes
- Виправлено проблеми з генерацією пустих CSS правил
- Покращено обробку Figma токенів
- Виправлено помилки з множинним Canvas
- Стабілізовано роботу з великими HTML файлами

### 📚 Documentation
- Оновлено README з новими можливостями
- Додано приклади використання всіх режимів
- Покращено опис Figma інтеграції
- Додано відео інструкції

### 🔄 Breaking Changes
- Змінено структуру конфігурації (автоматична міграція)
- Оновлено формат збережених налаштувань
- Нові обов'язкові поля в package.json

### 📦 Technical Details
- Node.js 18+ підтримка
- VS Code 1.74+ сумісність
- Покращена архітектура модулів
- Оптимізований розмір пакету

## [0.0.5] - 2024-12-15

### Added
- Figma integration with design tokens extraction
- Multiple Canvas selection support
- CSS optimization engine
- Responsive design generation

### Fixed
- HTML parsing edge cases
- CSS generation performance issues

## [0.0.4] - 2024-11-20

### Added
- Basic HTML to CSS conversion
- Class extraction from HTML
- Simple CSS generation

### Fixed
- Initial release bugs

## [0.0.3] - 2024-11-10

### Added
- Core functionality
- VS Code integration

## [0.0.2] - 2024-11-05

### Added
- Basic extension structure

## [0.0.1] - 2024-11-01

### Added
- Initial release
- Basic HTML class extraction