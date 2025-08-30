# CSS Classes from HTML

🚀 **Автоматична генерація CSS класів з HTML файлів з інтеграцією Figma**

[![VS Code](https://img.shields.io/badge/VS_Code-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white)](https://code.visualstudio.com/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Figma](https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white)](https://www.figma.com/)

## ✨ Особливості

- 🎯 **Автоматичне витягування CSS класів** з HTML файлів
- 🎨 **Інтеграція з Figma** для отримання дизайн-токенів
- 📱 **Адаптивний дизайн** з медіа-запитами
- 🌙 **Підтримка темної теми**
- 🏗️ **Сучасний CSS** з коментарями українською/англійською
- ⚡ **Швидкий доступ** через контекстне меню та гарячі клавіші

## 🚀 Встановлення

1. Відкрийте VS Code
2. Перейдіть до Extensions (`Ctrl+Shift+X`)
3. Шукайте "CSS Classes from HTML"
4. Натисніть "Install"

## 🎮 Використання

### Швидкий старт

1. **Відкрийте HTML файл** у VS Code
2. **Виберіть текст** або залиште весь файл
3. **Використайте один з способів**:
   - 🔥 **Гарячі клавіші**: `Ctrl+Shift+H`
   - 🖱️ **Контекстне меню**: Правий клік → "Generate CSS from HTML"
   - 🎯 **Command Palette**: `Ctrl+Shift+P` → "Generate CSS from HTML"

### З інтеграцією Figma

1. Запустіть команду генерації CSS
2. Введіть посилання на макет Figma (опціонально)
3. Введіть токен доступу Figma (опціонально)
4. Отримайте CSS з дизайн-токенами!

## ⚙️ Налаштування

Відкрийте Settings (`Ctrl+,`) та шукайте "CSS Classes from HTML":

```json
{
  "cssclasssfromhtml.language": "uk",           // Мова коментарів: "uk" або "en"
  "cssclasssfromhtml.includeGlobal": true,      // Включити глобальні стилі
  "cssclasssfromhtml.includeReset": true,       // Включити CSS reset
  "cssclasssfromhtml.responsive": true,         // Генерувати адаптивні стилі
  "cssclasssfromhtml.darkMode": true            // Підтримка темної теми
}
```

## 🎨 Figma інтеграція

### Отримання токена доступу

1. Увійдіть в обліковий запис Figma
2. Перейдіть до **Settings** → **Account** → **Personal access tokens**
3. Створіть новий токен
4. Скопіюйте та використовуйте в розширенні

### Підготовка макету

- Використовуйте консистентні назви для кольорів
- Створюйте текстові стилі з зрозумілими назвами
- Використовуйте компоненти для повторюваних елементів

## 📝 Приклад використання

**HTML:**
```html
<div class="hero">
  <h1 class="hero-title">Welcome</h1>
  <button class="hero-btn">Click me</button>
</div>
```

**Згенерований CSS:**
```css
/* !!! AUTO-GENERATED CSS FROM HTML !!! */

/* !!! Стилі для класу hero !!! */
.hero {
  /* Властивості макету */
  background-color: var(--color-dark, #2e2f42);
  color: var(--color-white, #fff);
  text-align: center;
  padding: 120px 0;
}

/* !!! Стилі для класу hero-title !!! */
.hero-title {
  /* Властивості типографіки */
  font-size: var(--size-h1, 56px);
  font-weight: var(--weight-bold, 700);
  margin-bottom: 48px;
}

/* !!! Стилі для класу hero-btn !!! */
.hero-btn {
  /* Властивості макету */
  background-color: var(--color-primary, #4d5ae5);
  color: var(--color-white, #fff);
  border-radius: 4px;
  padding: 16px 32px;
  border: none;
  cursor: pointer;
}

.hero-btn:hover {
  background-color: var(--color-hover, #404bbf);
}

/* TABLET: 768px and up */
@media (min-width: 768px) {
  .hero-title {
    font-size: clamp(36px, 4vw, 56px);
  }
}
```

## 🔧 Команди

| Команда | Опис | Гарячі клавіші |
|---------|------|----------------|
| `Generate CSS from HTML` | Генерує CSS з HTML файлу | `Ctrl+Shift+H` |

## 🌟 Підтримувані функції

- ✅ Витягування CSS класів з HTML
- ✅ Генерація базових стилів
- ✅ Псевдо-класи (:hover, :focus)
- ✅ Медіа-запити для адаптивності
- ✅ CSS змінні (custom properties)
- ✅ Коментарі українською та англійською
- ✅ Інтеграція з Figma API
- ✅ Контекстне меню для HTML файлів
- ✅ Гарячі клавіші

## 🐛 Відомі обмеження

- Потрібен активний редактор з HTML контентом
- Figma токен потрібен для повної інтеграції
- Генерує тільки базові стилі (не складну логіку)

## 📋 Системні вимоги

- VS Code 1.74.0 або новіший
- Інтернет з'єднання (для Figma інтеграції)

## 🤝 Внесок у розвиток

1. Fork репозиторій
2. Створіть feature branch
3. Зробіть зміни
4. Створіть Pull Request

## 📄 Ліцензія

MIT License - дивіться [LICENSE.md](LICENSE.md)

## 👨‍💻 Автор

**VuToV-Mykola**
- GitHub: [@VuToV-Mykola](https://github.com/VuToV-Mykola)
- Email: vutov.mykola@gmail.com

## 🔗 Корисні посилання

- [Документація VS Code API](https://code.visualstudio.com/api)
- [Figma API Documentation](https://www.figma.com/developers/api)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)

---

⭐ **Подобається розширення? Поставте зірочку на GitHub!**