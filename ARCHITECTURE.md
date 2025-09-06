# Архітектура CSS Classes from HTML

## Огляд

Цей проект було повністю реструктуризовано для забезпечення максимальної точності співставлення Figma макетів з HTML класами та генерації CSS стилів.

## Нова структура проекту

```
css-classes-from-html/
├── backend/                 # Backend логіка
│   ├── core/                # Основні модулі
│   │   ├── FigmaAPIClient.js    # Оптимізований Figma API клієнт
│   │   ├── HTMLParser.js        # Розширений HTML парсер
│   │   └── IntegrationEngine.js # Головний двигун інтеграції
│   ├── analyzers/           # Аналізатори
│   │   └── FigmaAnalyzer.js     # Детальний аналіз Figma макетів
│   ├── generators/          # Генератори CSS
│   │   └── CSSGenerator.js      # Розширений CSS генератор
│   ├── matchers/            # Система співставлення
│   │   ├── StyleMatcher.js      # ML-based співставлення стилів
│   │   └── HierarchyMatcher.js  # Ієрархічне співставлення
│   ├── api/                 # API ендпоінти
│   └── utils/               # Backend утиліти
├── frontend/                # Веб-інтерфейс
│   ├── components/          # React компоненти
│   ├── services/            # API сервіси
│   ├── utils/               # Утиліти фронтенду
│   └── assets/              # Статичні файли
├── shared/                  # Спільні модулі
│   ├── types/               # TypeScript типи
│   ├── constants/           # Константи
│   └── validators/          # Валідатори
└── tests/                   # Тести
    └── integration-test.js  # Тест інтеграції
```

## Ключові компоненти

### 1. IntegrationEngine
Головний модуль, який координує роботу всіх компонентів:
- Завантаження та аналіз Figma макетів
- Парсинг та аналіз HTML
- Співставлення елементів
- Генерація CSS
- Статистика та моніторинг

### 2. FigmaAPIClient
Оптимізований клієнт для роботи з Figma API:
- Кешування запитів
- Retry логіка з exponential backoff
- Rate limiting
- Детальне логування помилок
- Підтримка всіх Figma API ендпоінтів

### 3. HTMLParser
Розширений парсер HTML з детальним аналізом:
- Семантичний аналіз елементів
- Аналіз класів за типами (utility, component, layout, etc.)
- Аналіз контенту та структури
- Розрахунок важливості елементів
- Побудова ієрархічного дерева

### 4. FigmaAnalyzer
Детальний аналізатор Figma макетів:
- Аналіз структури та ієрархії
- Витягування стилів (typography, colors, effects, layout)
- Визначення семантичних ролей
- Розрахунок складності та важливості
- Аналіз контенту та візуальних характеристик

### 5. StyleMatcher
ML-based система співставлення стилів:
- Множинні стратегії співставлення
- Machine Learning алгоритми
- Косинусна схожість та Levenshtein distance
- Адаптивні ваги для різних критеріїв
- Кешування результатів

### 6. HierarchyMatcher
Ієрархічне співставлення HTML-Figma:
- Побудова ієрархічних дерев
- Співставлення по рівнях глибини
- Алгоритм максимального паросполучення
- Аналіз позиції та контексту
- Метрики точності

### 7. CSSGenerator
Розширений генератор CSS з підтримкою всіх властивостей:

#### Typography
- font-family, font-size, font-weight
- font-style, line-height, letter-spacing
- text-align, text-decoration, text-transform

#### Visual & Effects
- background, background-color, opacity
- box-shadow, filter

#### Animation & Transitions
- transition, transform, animation

#### Modern CSS
- container queries, aspect-ratio
- object-fit, scroll-behavior

#### Display & Flexbox
- display, flex, flex-direction
- flex-wrap, justify-content, align-items
- align-content, gap

#### Box Model
- width, height, min-width, min-height
- max-width, max-height, margin, padding
- border, border-radius, box-sizing

#### Positioning & Layout
- position, top, right, bottom, left
- z-index, inset

## Алгоритм роботи

1. **Завантаження Figma макету**
   - Валідація посилання
   - Завантаження через FigmaAPIClient
   - Аналіз структури через FigmaAnalyzer

2. **Парсинг HTML**
   - Парсинг через HTMLParser
   - Семантичний аналіз
   - Побудова ієрархії

3. **Співставлення елементів**
   - StyleMatcher для стилів
   - HierarchyMatcher для структури
   - Об'єднання результатів

4. **Генерація CSS**
   - CSSGenerator з усіма властивостями
   - Адаптивні стилі
   - Сучасний CSS
   - Анімації

5. **Статистика та моніторинг**
   - Метрики точності
   - Час обробки
   - Помилки та попередження

## Переваги нової архітектури

### 1. Модульність
- Кожен компонент має чітку відповідальність
- Легке тестування та підтримка
- Можливість заміни компонентів

### 2. Масштабованість
- Підтримка великих Figma макетів
- Ефективне кешування
- Паралельна обробка

### 3. Точність
- ML алгоритми для співставлення
- Множинні стратегії
- Адаптивні ваги

### 4. Продуктивність
- Оптимізовані алгоритми
- Кешування результатів
- Retry логіка

### 5. Розширюваність
- Легке додавання нових стратегій
- Підтримка нових CSS властивостей
- Інтеграція з іншими сервісами

## Тестування

Запуск тесту інтеграції:
```bash
node test/integration-test.js
```

Тест перевіряє:
- Ініціалізацію всіх компонентів
- Парсинг HTML
- Генерацію CSS
- Статистику та метрики

## Майбутні покращення

1. **AI/ML покращення**
   - Більш складні ML моделі
   - Навчання на користувацьких даних
   - Автоматичне налаштування ваг

2. **Додаткові формати**
   - Підтримка Sketch макетів
   - Adobe XD інтеграція
   - Figma компонентів

3. **Розширена CSS підтримка**
   - CSS Grid детальна підтримка
   - CSS Custom Properties
   - CSS-in-JS генерація

4. **Колaborative features**
   - Командна робота
- Версіонування стилів
- Коментарі та анотації

5. **Performance оптимізації**
   - Web Workers для обробки
   - Streaming API
   - Progressive enhancement
