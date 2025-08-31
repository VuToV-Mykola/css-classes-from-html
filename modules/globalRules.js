/**
 * Шаблон глобальних CSS правил 2025
 * Містить сучасні глобальні та reset CSS правила
 */

const commentManager = require("../modules/commentManager")

function getGlobalRules(includeReset = true, selectedTags = null) {
  let rules = ""

  if (includeReset) {
    rules += `${commentManager.getTranslation("reset_rules")}\n`
    rules += `/* !!! Сучасний CSS Reset 2025 з врахуванням доступності !!! */\n`
    rules += `*, *::before, *::after {\n`
    rules += `  /* Включаємо border-box для зручного розрахунку розмірів */\n`
    rules += `  box-sizing: border-box;\n`
    rules += `}\n\n`

    rules += `* {\n`
    rules += `  /* Обнуляємо зовнішні та внутрішні відступи */\n`
    rules += `  margin: 0;\n`
    rules += `  padding: 0;\n`
    rules += `}\n\n`

    rules += `html {\n`
    rules += `  /* Плавна прокрутка сторінки */\n`
    rules += `  scroll-behavior: smooth;\n`
    rules += `  /* Автоматичні відступи для scroll-snap */\n`
    rules += `  scroll-padding-top: 2rem;\n`
    rules += `  /* Гнучка типографіка */\n`
    rules += `  font-size: clamp(1rem, 0.75rem + 1.5vw, 1.25rem);\n`
    rules += `}\n\n`

    rules += `body {\n`
    rules += `  /* Покращене відображення тексту */\n`
    rules += `  -webkit-font-smoothing: antialiased;\n`
    rules += `  -moz-osx-font-smoothing: grayscale;\n`
    rules += `  text-rendering: optimizeSpeed;\n`
    rules += `  /* Мінімальна висота на всю висоту вікна */\n`
    rules += `  min-height: 100vh;\n`
    rules += `  min-height: 100dvh;\n`
    rules += `  /* Базовий міжрядковий інтервал */\n`
    rules += `  line-height: 1.6;\n`
    rules += `}\n\n`
  }

  rules += `${commentManager.getTranslation("global_rules")}\n`

  // Modern layout system
  rules += `/* !!! Сучасна система макетування !!! */\n`
  rules += `.container {\n`
  rules += `  /* Максимальна ширина контейнера */\n`
  rules += `  width: min(100% - 2rem, 1200px);\n`
  rules += `  margin-inline: auto;\n`
  rules += `}\n\n`

  rules += `.grid {\n`
  rules += `  /* Система сітки Grid */\n`
  rules += `  display: grid;\n`
  rules += `  gap: var(--space-md, 1rem);\n`
  rules += `}\n\n`

  rules += `.flex {\n`
  rules += `  /* Гнучка система Flexbox */\n`
  rules += `  display: flex;\n`
  rules += `  gap: var(--space-md, 1rem);\n`
  rules += `}\n\n`

  // Base element styles with modern approaches (filtered for selected tags)
  const elementStyles = {
    body: `body {\n  font-family: var(--font-primary, sans-serif);\n  color: var(--color-text, #333);\n  background-color: var(--color-background, #fff);\n  font-size: 1rem;\n  line-height: 1.6;\n}\n\n`,
    h: `h1, h2, h3, h4, h5, h6 {\n  font-family: var(--font-secondary, sans-serif);\n  line-height: 1.2;\n  font-weight: 700;\n  margin-bottom: var(--space-md, 1rem);\n}\n\n`,
    p: `p {\n  margin-bottom: var(--space-md, 1rem);\n  max-width: 65ch;\n}\n\n`,
    img: `img, picture, video, canvas, svg {\n  display: block;\n  max-width: 100%;\n  height: auto;\n}\n\n`,
    input: `input, button, textarea, select {\n  font: inherit;\n}\n\n`,
    button: `button {\n  cursor: pointer;\n  border: none;\n  background: none;\n  padding: var(--space-sm, 0.5rem) var(--space-md, 1rem);\n  border-radius: var(--radius-md, 4px);\n  transition: background-color var(--transition-base, 0.2s ease);\n}\n\n`,
    a: `a {\n  color: var(--color-primary, #4d5ae5);\n  text-decoration: none;\n  transition: color var(--transition-base, 0.2s ease);\n}\n\na:hover {\n  color: color-mix(in oklab, var(--color-primary, #4d5ae5), black 15%);\n}\n\n`,
    ul: `ul, ol {\n  list-style: none;\n  padding-left: var(--space-lg, 2rem);\n}\n\n`,
    li: `li {\n  margin-bottom: var(--space-sm, 0.5rem);\n}\n\n`
  }

  if (selectedTags) {
    rules += `/* !!! Базові стилі для вибраних елементів !!! */\n`
    const processedTags = new Set()

    selectedTags.forEach(tag => {
      if (elementStyles[tag] && !processedTags.has(tag)) {
        rules += elementStyles[tag]
        processedTags.add(tag)
      } else if (
        ["h1", "h2", "h3", "h4", "h5", "h6"].includes(tag) &&
        elementStyles.h &&
        !processedTags.has("h")
      ) {
        rules += elementStyles.h
        processedTags.add("h")
      } else if (
        ["picture", "video", "canvas", "svg"].includes(tag) &&
        elementStyles.img &&
        !processedTags.has("img")
      ) {
        rules += elementStyles.img
        processedTags.add("img")
      } else if (
        ["textarea", "select"].includes(tag) &&
        elementStyles.input &&
        !processedTags.has("input")
      ) {
        rules += elementStyles.input
        processedTags.add("input")
      } else if (tag === "ol" && elementStyles.ul && !processedTags.has("ul")) {
        rules += elementStyles.ul
        processedTags.add("ul")
      }
    })
  } else {
    rules += `/* !!! Базові стилі елементів !!! */\n`
    Object.values(elementStyles).forEach(style => (rules += style))
  }

  // Utility classes for modern development (filtered for selected tags)
  const utilityClasses = {
    all: `.sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip-path: inset(50%);\n  white-space: nowrap;\n  border: 0;\n}\n\n`,
    text: `.text-balance {\n  text-wrap: balance;\n}\n\n`,
    container: `.grid-auto-fit {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr));\n  gap: var(--space-md, 1rem);\n}\n\n`,
    media: `.aspect-ratio {\n  aspect-ratio: 16/9;\n}\n\n`
  }

  if (selectedTags) {
    rules += `/* !!! Утилітні класи !!! */\n`
    // Always include sr-only for accessibility
    rules += utilityClasses.all

    // Include text utilities for text elements
    if (
      selectedTags.some(tag => ["p", "span", "h1", "h2", "h3", "h4", "h5", "h6", "a"].includes(tag))
    ) {
      rules += utilityClasses.text
    }

    // Include grid utilities for container elements
    if (selectedTags.some(tag => ["div", "section", "article", "main"].includes(tag))) {
      rules += utilityClasses.container
    }

    // Include media utilities for media elements
    if (selectedTags.some(tag => ["img", "video", "picture"].includes(tag))) {
      rules += utilityClasses.media
    }
  } else {
    rules += `/* !!! Утилітні класи !!! */\n`
    Object.values(utilityClasses).forEach(utility => (rules += utility))
  }

  return rules
}

function getCSSReset() {
  return `/* !!! Сучасний CSS Reset 2025 !!! */
*, *::before, *::after {
  box-sizing: border-box;
}

* {
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
  font-size: clamp(1rem, 0.75rem + 1.5vw, 1.25rem);
}

body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  line-height: 1.6;
}`
}

function getGlobalStyles(selectedTags = null) {
  return `/* !!! Глобальні стилі !!! */
.container {
  width: min(100% - 2rem, 1200px);
  margin-inline: auto;
}

.flex {
  display: flex;
  gap: 1rem;
}

.grid {
  display: grid;
  gap: 1rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}`
}

module.exports = {
  getGlobalRules,
  getCSSReset,
  getGlobalStyles
}
