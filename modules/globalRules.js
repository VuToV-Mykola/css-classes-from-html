/* !!! Шаблон глобальних CSS правил 2025 !!! */
/* !!! Містить сучасні глобальні та reset CSS правила !!! */

const commentManager = require("./commentManager")

function getGlobalRules(includeReset = true, selectedTags = null) {
  const parts = []

  if (includeReset) {
    parts.push(
      `${commentManager.getTranslation("reset_rules")}`,
      `/* !!! Сучасний CSS Reset 2025 з врахуванням доступності !!! */`,
      `*, *::before, *::after {`,
      `  /* !!! Включаємо border-box для зручного розрахунку розмірів !!! */`,
      `  box-sizing: border-box;`,
      `}`,
      ``,
      `* {`,
      `  /* !!! Обнуляємо зовнішні та внутрішні відступи !!! */`,
      `  margin: 0;`,
      `  padding: 0;`,
      `}`,
      ``,
      `html {`,
      `  /* Плавна прокрутка сторінки */`,
      `  scroll-behavior: smooth;`,
      `  /* Автоматичні відступи для scroll-snap */`,
      `  scroll-padding-top: 2rem;`,
      `  /* Гнучка типографіка */`,
      `  font-size: clamp(1rem, 0.75rem + 1.5vw, 1.25rem);`,
      `}`,
      ``,
      `body {`,
      `  /* Покращене відображення тексту */`,
      `  -webkit-font-smoothing: antialiased;`,
      `  -moz-osx-font-smoothing: grayscale;`,
      `  text-rendering: optimizeSpeed;`,
      `  /* Мінімальна висота на всю висоту вікна */`,
      `  min-height: 100vh;`,
      `  min-height: 100dvh;`,
      `  /* Базовий міжрядковий інтервал */`,
      `  line-height: 1.6;`,
      `}`
    )
  }

  parts.push(
    `${commentManager.getTranslation("global_rules")}`,
    ``,
    `/* !!! Сучасна система макетування !!! */`,
    `.container {`,
    `  /* Максимальна ширина контейнера */`,
    `  width: min(100% - 2rem, 1200px);`,
    `  /* Центрування по горизонталі */`,
    `  margin-inline: auto;`,
    `}`,
    ``,
    `.grid {`,
    `  /* Система сітки Grid */`,
    `  display: grid;`,
    `  /* Відстань між елементами */`,
    `  gap: var(--space-md, 1rem);`,
    `}`,
    ``,
    `.flex {`,
    `  /* Гнучка система Flexbox */`,
    `  display: flex;`,
    `  /* Відстань між елементами */`,
    `  gap: var(--space-md, 1rem);`,
    `}`
  )

  // Base element styles with modern approaches (filtered for selected tags)
  const elementStyles = {
    body: getBodyStyles(),
    h: `/* !!! Стилі заголовків !!! */\nh1, h2, h3, h4, h5, h6 {\n  /* Сімейство шрифтів для заголовків */\n  font-family: var(--font-secondary, sans-serif);\n  /* Міжрядковий інтервал */\n  line-height: 1.2;\n  /* Товщина шрифту */\n  font-weight: 700;\n  /* Відстань знизу */\n  margin-bottom: var(--space-md, 1rem);\n}\n\n`,
    p: `/* !!! Стилі параграфів !!! */\np {\n  /* Відстань знизу */\n  margin-bottom: var(--space-md, 1rem);\n  /* Максимальна ширина для читабельності */\n  max-width: 65ch;\n}\n\n`,
    img: `/* !!! Стилі медіа елементів !!! */\nimg, picture, video, canvas, svg {\n  /* Блокове відображення */\n  display: block;\n  /* Максимальна ширина */\n  max-width: 100%;\n  /* Автоматична висота */\n  height: auto;\n}\n\n`,
    input: `/* !!! Стилі форм !!! */\ninput, button, textarea, select {\n  /* Наслідування шрифту */\n  font: inherit;\n}\n\n`,
    button: `/* !!! Стилі кнопок !!! */\nbutton {\n  /* Курсор показчик */\n  cursor: pointer;\n  /* Обнулення рамки */\n  border: none;\n  /* Обнулення фону */\n  background: none;\n  /* Внутрішні відступи */\n  padding: var(--space-sm, 0.5rem) var(--space-md, 1rem);\n  /* Заокруглення кутів */\n  border-radius: var(--radius-md, 4px);\n  /* Плавний перехід */\n  transition: background-color var(--transition-base, 0.2s ease);\n}\n\n`,
    a: `/* !!! Стилі посилань !!! */\na {\n  /* Колір посилання */\n  color: var(--color-primary, #4d5ae5);\n  /* Обнулення підкреслення */\n  text-decoration: none;\n  /* Плавний перехід кольору */\n  transition: color var(--transition-base, 0.2s ease);\n}\n\na:hover {\n  /* Колір при наведенні */\n  color: color-mix(in oklab, var(--color-primary, #4d5ae5), black 15%);\n}\n\n`,
    ul: `/* !!! Стилі списків !!! */\nul, ol {\n  /* Обнулення стилю списку */\n  list-style: none;\n  /* Лівий відступ */\n  padding-left: var(--space-lg, 2rem);\n}\n\n`,
    li: `/* !!! Стилі елементів списку !!! */\nli {\n  /* Відстань знизу */\n  margin-bottom: var(--space-sm, 0.5rem);\n}\n\n`
  }

  if (selectedTags) {
    parts.push(`/* !!! Базові стилі для вибраних елементів !!! */`)
    const processedTags = new Set()

    selectedTags.forEach(tag => {
      if (elementStyles[tag] && !processedTags.has(tag)) {
        parts.push(elementStyles[tag])
        processedTags.add(tag)
      } else if (
        ["h1", "h2", "h3", "h4", "h5", "h6"].includes(tag) &&
        elementStyles.h &&
        !processedTags.has("h")
      ) {
        parts.push(elementStyles.h)
        processedTags.add("h")
      } else if (
        ["picture", "video", "canvas", "svg"].includes(tag) &&
        elementStyles.img &&
        !processedTags.has("img")
      ) {
        parts.push(elementStyles.img)
        processedTags.add("img")
      } else if (
        ["textarea", "select"].includes(tag) &&
        elementStyles.input &&
        !processedTags.has("input")
      ) {
        parts.push(elementStyles.input)
        processedTags.add("input")
      } else if (tag === "ol" && elementStyles.ul && !processedTags.has("ul")) {
        parts.push(elementStyles.ul)
        processedTags.add("ul")
      }
    })
  } else {
    parts.push(`/* !!! Базові стилі елементів !!! */`)
    parts.push(...Object.values(elementStyles))
  }

  // Utility classes for modern development (filtered for selected tags)
  const utilityClasses = {
    all: `/* !!! Утилітний клас для доступності !!! */\n.sr-only {\n  /* Позиціонування для приховання */\n  position: absolute;\n  /* Мінімальні розміри */\n  width: 1px;\n  height: 1px;\n  /* Обнулення відступів */\n  padding: 0;\n  margin: -1px;\n  /* Приховання переповнення */\n  overflow: hidden;\n  /* Обрізання контенту */\n  clip-path: inset(50%);\n  /* Заборона переносу рядків */\n  white-space: nowrap;\n  /* Обнулення рамки */\n  border: 0;\n}\n\n`,
    text: `/* !!! Утилітний клас для тексту !!! */\n.text-balance {\n  /* Балансоване обгортання тексту */\n  text-wrap: balance;\n}\n\n`,
    container: `/* !!! Утилітний клас для сітки !!! */\n.grid-auto-fit {\n  /* Автоматична сітка */\n  display: grid;\n  /* Адаптивні колонки */\n  grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr));\n  /* Відстань між елементами */\n  gap: var(--space-md, 1rem);\n}\n\n`,
    media: `/* !!! Утилітний клас для медіа !!! */\n.aspect-ratio {\n  /* Співвідношення сторін 16:9 */\n  aspect-ratio: 16/9;\n}\n\n`
  }

  if (selectedTags) {
    parts.push(`/* !!! Утилітні класи !!! */`)
    // Always include sr-only for accessibility
    parts.push(utilityClasses.all)

    // Include text utilities for text elements
    if (
      selectedTags.some(tag => ["p", "span", "h1", "h2", "h3", "h4", "h5", "h6", "a"].includes(tag))
    ) {
      parts.push(utilityClasses.text)
    }

    // Include grid utilities for container elements
    if (selectedTags.some(tag => ["div", "section", "article", "main"].includes(tag))) {
      parts.push(utilityClasses.container)
    }

    // Include media utilities for media elements
    if (selectedTags.some(tag => ["img", "video", "picture"].includes(tag))) {
      parts.push(utilityClasses.media)
    }
  } else {
    parts.push(`/* !!! Утилітні класи !!! */`)
    parts.push(...Object.values(utilityClasses))
  }

  return parts.join('\n')
}

function getBodyStyles() {
  return `/* !!! Базові стилі body елемента !!! */
body {
  /* Сімейство шрифтів */
  font-family: var(--font-primary, sans-serif);
  /* Колір тексту */
  color: var(--color-text, #333);
  /* Колір фону */
  background-color: var(--color-background, #fff);
  /* Розмір шрифту */
  font-size: 1rem;
  /* Міжрядковий інтервал */
  line-height: 1.6;
}

`
}

function getCSSReset() {
  return [
    `/* !!! Сучасний CSS Reset 2025 !!! */`,
    `*, *::before, *::after {`,
    `  /* Включаємо border-box для зручного розрахунку розмірів */`,
    `  box-sizing: border-box;`,
    `}`,
    ``,
    `* {`,
    `  /* Обнуляємо зовнішні та внутрішні відступи */`,
    `  margin: 0;`,
    `  padding: 0;`,
    `}`,
    ``,
    `html {`,
    `  /* Плавна прокрутка сторінки */`,
    `  scroll-behavior: smooth;`,
    `  /* Гнучка типографіка */`,
    `  font-size: clamp(1rem, 0.75rem + 1.5vw, 1.25rem);`,
    `}`,
    ``,
    `body {`,
    `  /* Покращене відображення тексту */`,
    `  -webkit-font-smoothing: antialiased;`,
    `  -moz-osx-font-smoothing: grayscale;`,
    `  /* Мінімальна висота на всю висоту вікна */`,
    `  min-height: 100vh;`,
    `  /* Базовий міжрядковий інтервал */`,
    `  line-height: 1.6;`,
    `}`
  ].join('\n')
}

function getGlobalStyles() {
  return [
    `/* !!! Глобальні стилі !!! */`,
    `.container {`,
    `  /* Максимальна ширина контейнера */`,
    `  width: min(100% - 2rem, 1200px);`,
    `  /* Центрування по горизонталі */`,
    `  margin-inline: auto;`,
    `}`,
    ``,
    `.flex {`,
    `  /* Гнучка система Flexbox */`,
    `  display: flex;`,
    `  /* Відстань між елементами */`,
    `  gap: 1rem;`,
    `}`,
    ``,
    `.grid {`,
    `  /* Система сітки Grid */`,
    `  display: grid;`,
    `  /* Відстань між елементами */`,
    `  gap: 1rem;`,
    `}`,
    ``,
    `.sr-only {`,
    `  /* Позиціонування для приховання */`,
    `  position: absolute;`,
    `  /* Мінімальні розміри */`,
    `  width: 1px;`,
    `  height: 1px;`,
    `  /* Обнулення відступів */`,
    `  padding: 0;`,
    `  margin: -1px;`,
    `  /* Приховання переповнення */`,
    `  overflow: hidden;`,
    `  /* Обрізання контенту */`,
    `  clip-path: inset(50%);`,
    `  /* Заборона переносу рядків */`,
    `  white-space: nowrap;`,
    `  /* Обнулення рамки */`,
    `  border: 0;`,
    `}`
  ].join('\n')
}

module.exports = {
  getGlobalRules,
  getCSSReset,
  getGlobalStyles
}
