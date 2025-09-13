/**
 * Імпортер шрифтів з Figma з Google Fonts інтеграцією
 * Аналізує шрифти в Figma та генерує посилання на Google Fonts
 * @version 1.0.0
 */

const https = require("https")
const {logger} = require("./Logger")

class FontImporter {
  constructor(options = {}) {
    this.googleFontsApiKey = options.googleFontsApiKey || null
    this.outputDir = options.outputDir || "."
    this.includeAllWeights = options.includeAllWeights !== false
    this.includeAllStyles = options.includeAllStyles !== false
    this.display = options.display || "swap" // font-display property
    this.customFileName = options.customFileName || "font-imports" // ✅ FIX: Кастомне ім'я файлу

    // ✅ FIX: Mapping Figma font names to Google Fonts
    this.fontMapping = {
      Inter: "Inter",
      Roboto: "Roboto",
      "Open Sans": "Open+Sans",
      Lato: "Lato",
      Montserrat: "Montserrat",
      "Source Sans Pro": "Source+Sans+Pro",
      Oswald: "Oswald",
      Raleway: "Raleway",
      "PT Sans": "PT+Sans",
      Lora: "Lora",
      "Playfair Display": "Playfair+Display",
      Nunito: "Nunito",
      Poppins: "Poppins",
      Merriweather: "Merriweather",
      Ubuntu: "Ubuntu",
      Muli: "Mulish", // Muli was renamed to Mulish
      "Fira Sans": "Fira+Sans",
      "Work Sans": "Work+Sans",
      "Crimson Text": "Crimson+Text",
      "Libre Baskerville": "Libre+Baskerville"
    }
  }

  /**
   * ✅ FIX: Імпорт шрифтів з Figma файлу з оптимізацією для використаних параметрів
   */
  async importFonts(figmaClient, fileKey, selectedLayers = [], selectedCanvasIds = []) {
    try {
      logger.start("Аналіз шрифтів з Figma")

      // Отримання всіх шрифтів з файлу (з фільтрацією по canvas/layers)
      logger.debug("Вибрані Canvas IDs", selectedCanvasIds)
      logger.debug("Вибрані Layers", selectedLayers)

      const figmaFonts = await this.getFontsFromCanvasesAndLayers(
        figmaClient,
        fileKey,
        selectedCanvasIds,
        selectedLayers
      )
      logger.debug("Знайдено шрифтів", figmaFonts.length)
      logger.debug("Деталі шрифтів", figmaFonts)

      if (figmaFonts.length === 0) {
        logger.warn("Шрифти не знайдено в Figma файлі")
        return {
          success: true,
          fonts: [],
          imports: {html: "", css: "", urls: [], clipboard: ""},
          message: "No fonts found in Figma file"
        }
      }

      logger.info(`Знайдено ${figmaFonts.length} унікальних шрифтів у Figma`)

      // ✅ FIX: Аналіз кожного шрифту
      const processedFonts = []
      const availableFonts = await this.getAvailableGoogleFonts()

      for (const figmaFont of figmaFonts) {
        try {
          const result = await this.processFont(figmaFont, availableFonts)
          processedFonts.push(result)
          logger.success(`Оброблено шрифт: ${result.name}`)
        } catch (error) {
          logger.error(`Не вдалося обробити шрифт ${figmaFont.family}`, error.message)
        }
      }

      // ✅ FIX: Генерація CSS та HTML imports
      const imports = this.generateFontImports(processedFonts)
      const css = this.generateFontCSS(processedFonts)

      // ✅ FIX: Файли не зберігаються автоматично - тільки генерація контенту

      return {
        success: true,
        fonts: processedFonts,
        imports: imports,
        css: css,
        htmlPreview: this.generateHTMLPreview(imports),
        message: `Successfully processed ${processedFonts.length} fonts - файли не зберігаються автоматично`
      }
    } catch (error) {
      logger.error("Імпорт шрифтів не вдався", error.message)
      throw new Error(`Помилка імпорту шрифтів: ${error.message}`)
    }
  }

  /**
   * ✅ FIX: Отримання шрифтів тільки з вибраних canvas та layers
   */
  async getFontsFromCanvasesAndLayers(
    figmaClient,
    fileKey,
    selectedCanvasIds = [],
    selectedLayers = []
  ) {
    try {
      // Отримуємо структуру файлу
      const file = await figmaClient.getFile(fileKey)
      const pages = file?.document?.children || []

      // Фільтруємо сторінки за вибраними canvas
      const targetPages =
        selectedCanvasIds.length > 0 ? pages.filter(p => selectedCanvasIds.includes(p.id)) : pages

      logger.info(`Аналізуємо шрифти з ${targetPages.length} canvas(ів)`)

      const fontsUsage = new Map() // font family -> { weights: Set, styles: Set }
      let totalNodesProcessed = 0
      let textNodesFound = 0

      // Рекурсивний обхід для пошуку текстових елементів
      const walkForFonts = (node, canvasId = null) => {
        totalNodesProcessed++
        if (!node) return

        // Додаткова діагностика для перших кількох вузлів
        if (totalNodesProcessed <= 10) {
          logger.debug(`Обробка вузла ${totalNodesProcessed}: ${node.name} (${node.type})`)
        }

        // Перевіряємо чи треба обробляти цей layer
        if (selectedLayers.length > 0 && !selectedLayers.includes(node.id)) {
          // Якщо є фільтр по layers і цей node не в списку - пропускаємо його дітей теж
          return
        }

        // Якщо це текстовий елемент
        if (node.type === "TEXT" && node.style) {
          textNodesFound++
          const fontFamily = node.style.fontFamily
          const fontWeight = node.style.fontWeight || 400
          const isItalic = node.style.italic || false

           logger.debug(
             `Знайдено TEXT вузол: ${node.name}, fontFamily: ${fontFamily}, fontWeight: ${fontWeight}, isItalic: ${isItalic}`
           )

          if (fontFamily) {
            if (!fontsUsage.has(fontFamily)) {
              fontsUsage.set(fontFamily, {
                weights: new Set(),
                styles: new Set(),
                canvasIds: new Set(),
                usageCount: 0
              })
            }

            const fontData = fontsUsage.get(fontFamily)
            fontData.weights.add(fontWeight)
            fontData.styles.add(isItalic ? "italic" : "normal")
            fontData.canvasIds.add(canvasId)
            fontData.usageCount++

             logger.debug(
               `Додано шрифт: ${fontFamily} (вага: ${fontWeight}, стиль: ${isItalic ? "italic" : "normal"})`
             )
          } else {
            logger.warn(`TEXT вузол без fontFamily: ${node.name}`)
          }
        }

        // Рекурсивно обходимо дочірні елементи
        if (node.children) {
          node.children.forEach(child => walkForFonts(child, canvasId || node.id))
        }
      }

      // Обходимо кожну вибрану сторінку
       targetPages.forEach(page => {
         logger.debug(`Сканування шрифтів на canvas: ${page.name} (${page.id})`)
         logger.debug(`Canvas children count: ${page.children?.length || 0}`)
         
         // Додаткова діагностика структури
         if (page.children && page.children.length > 0) {
           logger.debug(`Перші 5 дочірніх елементів:`, page.children.slice(0, 5).map(child => ({
             id: child.id,
             name: child.name,
             type: child.type,
             hasStyle: !!child.style
           })))
         }
         
         walkForFonts(page, page.id)
       })

      // Конвертуємо в масив з необхідною структурою
      const figmaFonts = Array.from(fontsUsage.entries()).map(([family, data]) => ({
        family: family,
        weights: Array.from(data.weights).sort((a, b) => a - b),
        styles: Array.from(data.styles),
        canvasIds: Array.from(data.canvasIds),
        usageCount: data.usageCount
      }))

       logger.info(`Знайдено ${figmaFonts.length} унікальних шрифтів у вибраних canvas/layers`)
       logger.info(
         `Загальна статистика: ${totalNodesProcessed} вузлів оброблено, ${textNodesFound} текстових вузлів знайдено`
       )

      return figmaFonts
    } catch (error) {
      logger.error("Помилка отримання шрифтів з canvas", error.message)
      logger.error("Повна помилка", error)
      // ✅ FIX: Повертаємо порожній масив замість fallback
      return []
    }
  }

  /**
   * ✅ FIX: Обробка окремого шрифту
   */
  async processFont(figmaFont, availableFonts) {
    const fontFamily = figmaFont.family
    const cleanName = this.cleanFontName(fontFamily)

    // ✅ FIX: Пошук відповідного Google Font
    const googleFontName = this.findGoogleFontMatch(fontFamily, availableFonts)
    const isAvailable = googleFontName !== null

    // ✅ FIX: Визначення варіантів (ваги та стилі) - лише використані
    const variants = this.detectFontVariants(
      figmaFont.weights || [400],
      figmaFont.styles || ["normal"]
    )

    const fontData = {
      name: fontFamily,
      cleanName: cleanName,
      figmaWeights: figmaFont.weights || [400],
      googleFontName: googleFontName,
      isGoogleFont: isAvailable,
      variants: variants,
      url: null,
      cssDeclaration: null,
      fallbackStack: this.generateFallbackStack(fontFamily)
    }

    if (isAvailable) {
      fontData.url = this.generateGoogleFontsUrl(googleFontName, variants)
      fontData.cssDeclaration = this.generateCSSFontDeclaration(fontFamily, fontData.fallbackStack)
    } else {
       logger.warn(`Шрифт "${fontFamily}" недоступний на Google Fonts`)
      fontData.alternatives = this.suggestAlternatives(fontFamily, availableFonts)
    }

    return fontData
  }

  /**
   * ✅ FIX: Отримання доступних Google Fonts
   */
  async getAvailableGoogleFonts() {
    try {
      // ✅ FIX: Якщо є API key, використовуємо API
      if (this.googleFontsApiKey) {
        const apiUrl = `https://www.googleapis.com/webfonts/v1/webfonts?key=${this.googleFontsApiKey}`
        const response = await this.makeHttpRequest(apiUrl)
        const data = JSON.parse(response)
        return data.items.map(font => ({
          family: font.family,
          variants: font.variants,
          subsets: font.subsets,
          category: font.category
        }))
      } else {
        // ✅ FIX: Використовуємо вбудований список популярних шрифтів
        return this.getPopularGoogleFonts()
      }
    } catch (error) {
       logger.warn("Не вдалося отримати список Google Fonts, використовуємо вбудований список")
      return this.getPopularGoogleFonts()
    }
  }

  /**
   * ✅ FIX: Вбудований список популярних Google Fonts
   */
  getPopularGoogleFonts() {
    return [
      {
        family: "Inter",
        variants: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
        category: "sans-serif"
      },
      {
        family: "Roboto",
        variants: ["100", "300", "400", "500", "700", "900"],
        category: "sans-serif"
      },
      {family: "Open Sans", variants: ["300", "400", "600", "700", "800"], category: "sans-serif"},
      {family: "Lato", variants: ["100", "300", "400", "700", "900"], category: "sans-serif"},
      {
        family: "Montserrat",
        variants: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
        category: "sans-serif"
      },
      {
        family: "Source Sans Pro",
        variants: ["200", "300", "400", "600", "700", "900"],
        category: "sans-serif"
      },
      {
        family: "Oswald",
        variants: ["200", "300", "400", "500", "600", "700"],
        category: "sans-serif"
      },
      {
        family: "Raleway",
        variants: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
        category: "sans-serif"
      },
      {family: "PT Sans", variants: ["400", "700"], category: "sans-serif"},
      {family: "Lora", variants: ["400", "500", "600", "700"], category: "serif"},
      {
        family: "Playfair Display",
        variants: ["400", "500", "600", "700", "800", "900"],
        category: "serif"
      },
      {
        family: "Nunito",
        variants: ["200", "300", "400", "600", "700", "800", "900"],
        category: "sans-serif"
      },
      {
        family: "Poppins",
        variants: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
        category: "sans-serif"
      },
      {family: "Merriweather", variants: ["300", "400", "700", "900"], category: "serif"},
      {family: "Ubuntu", variants: ["300", "400", "500", "700"], category: "sans-serif"},
      {
        family: "Mulish",
        variants: ["200", "300", "400", "500", "600", "700", "800", "900"],
        category: "sans-serif"
      },
      {
        family: "Fira Sans",
        variants: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
        category: "sans-serif"
      },
      {
        family: "Work Sans",
        variants: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
        category: "sans-serif"
      },
      {family: "Crimson Text", variants: ["400", "600", "700"], category: "serif"},
      {family: "Libre Baskerville", variants: ["400", "700"], category: "serif"}
    ]
  }

  /**
   * ✅ FIX: Пошук відповідного Google Font
   */
  findGoogleFontMatch(figmaFontName, availableFonts) {
    // ✅ FIX: Точний збіг
    let match = availableFonts.find(
      font => font.family.toLowerCase() === figmaFontName.toLowerCase()
    )

    if (match) return match.family

    // ✅ FIX: Перевірка mapping
    const mappedName = this.fontMapping[figmaFontName]
    if (mappedName) {
      const decodedName = mappedName.replace(/\+/g, " ")
      match = availableFonts.find(font => font.family.toLowerCase() === decodedName.toLowerCase())
      if (match) return match.family
    }

    // ✅ FIX: Часткове співпадіння
    const cleanFigmaName = figmaFontName.replace(/[^\w\s]/g, "").toLowerCase()
    match = availableFonts.find(font => {
      const cleanGoogleName = font.family.replace(/[^\w\s]/g, "").toLowerCase()
      return cleanGoogleName.includes(cleanFigmaName) || cleanFigmaName.includes(cleanGoogleName)
    })

    return match ? match.family : null
  }

  /**
   * ✅ FIX: Визначення варіантів шрифту - лише використані в Figma
   */
  detectFontVariants(weights, styles = ["normal"]) {
    const variants = []

    weights.forEach(weight => {
      styles.forEach(style => {
        if (style === "normal") {
          // ✅ FIX: Основний варіант
          variants.push(weight.toString())
        } else if (style === "italic") {
          // ✅ FIX: Курсивний варіант (лише якщо використовується)
          variants.push(`${weight}italic`)
        }
      })
    })

    // ✅ FIX: Додаємо стандартні ваги лише якщо включено і не конфліктує з оптимізацією
    if (this.includeAllWeights) {
      const standardWeights = ["300", "400", "500", "600", "700"]
      standardWeights.forEach(weight => {
        if (!variants.includes(weight)) {
          variants.push(weight)

          // Додаємо курсивні варіанти для стандартних ваг якщо італік взагалі використовується
          if (styles.includes("italic") && !variants.includes(`${weight}italic`)) {
            variants.push(`${weight}italic`)
          }
        }
      })
    }

    return variants.sort()
  }

  /**
   * ✅ FIX: Генерація Google Fonts URL
   */
  generateGoogleFontsUrl(fontFamily, variants) {
    const encodedFamily = fontFamily.replace(/\s+/g, "+")
    const weightsString = variants.join(";")

    return `https://fonts.googleapis.com/css2?family=${encodedFamily}:wght@${weightsString}&display=${this.display}`
  }

  /**
   * ✅ FIX: Генерація CSS font-family декларації
   */
  generateCSSFontDeclaration(primaryFont, fallbackStack) {
    return `font-family: '${primaryFont}', ${fallbackStack.join(", ")};`
  }

  /**
   * ✅ FIX: Генерація fallback stack
   */
  generateFallbackStack(fontFamily) {
    const cleanName = fontFamily.toLowerCase()

    // ✅ FIX: Визначення категорії шрифту
    if (this.isSansSerif(cleanName)) {
      return ["-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", "sans-serif"]
    } else if (this.isSerif(cleanName)) {
      return ["Georgia", '"Times New Roman"', "Times", "serif"]
    } else if (this.isMonospace(cleanName)) {
      return ['"SF Mono"', "Monaco", '"Cascadia Code"', '"Roboto Mono"', "Consolas", "monospace"]
    } else {
      return ["-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", "sans-serif"]
    }
  }

  /**
   * ✅ FIX: Перевірка типу шрифту
   */
  isSansSerif(fontName) {
    const sansSerifKeywords = [
      "sans",
      "arial",
      "helvetica",
      "roboto",
      "open",
      "lato",
      "montserrat",
      "inter",
      "nunito",
      "poppins"
    ]
    return sansSerifKeywords.some(keyword => fontName.includes(keyword))
  }

  isSerif(fontName) {
    const serifKeywords = [
      "serif",
      "times",
      "georgia",
      "merriweather",
      "lora",
      "playfair",
      "crimson",
      "baskerville"
    ]
    return serifKeywords.some(keyword => fontName.includes(keyword))
  }

  isMonospace(fontName) {
    const monospaceKeywords = ["mono", "code", "courier", "fira", "source code"]
    return monospaceKeywords.some(keyword => fontName.includes(keyword))
  }

  /**
   * ✅ FIX: Пропозиції альтернатив
   */
  suggestAlternatives(figmaFontName, availableFonts) {
    const cleanName = figmaFontName.toLowerCase()
    const alternatives = []

    // ✅ FIX: Пошук схожих за назвою
    availableFonts.forEach(font => {
      const fontScore = this.calculateSimilarityScore(cleanName, font.family.toLowerCase())
      if (fontScore > 0.3) {
        alternatives.push({
          family: font.family,
          score: fontScore,
          reason: "Similar name"
        })
      }
    })

    // ✅ FIX: Додаємо популярні альтернативи за типом
    if (this.isSansSerif(cleanName)) {
      alternatives.push(
        {family: "Inter", score: 0.8, reason: "Popular sans-serif"},
        {family: "Roboto", score: 0.7, reason: "Popular sans-serif"},
        {family: "Open Sans", score: 0.6, reason: "Popular sans-serif"}
      )
    } else if (this.isSerif(cleanName)) {
      alternatives.push(
        {family: "Lora", score: 0.8, reason: "Popular serif"},
        {family: "Merriweather", score: 0.7, reason: "Popular serif"},
        {family: "Playfair Display", score: 0.6, reason: "Popular serif"}
      )
    }

    return alternatives.sort((a, b) => b.score - a.score).slice(0, 3) // Топ 3 альтернативи
  }

  /**
   * ✅ FIX: Розрахунок схожості назв
   */
  calculateSimilarityScore(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1

    if (longer.length === 0) return 1.0

    const editDistance = this.levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  levenshteinDistance(str1, str2) {
    const matrix = Array(str2.length + 1)
      .fill()
      .map(() => Array(str1.length + 1).fill(0))

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        matrix[j][i] =
          str1[i - 1] === str2[j - 1]
            ? matrix[j - 1][i - 1]
            : Math.min(matrix[j - 1][i] + 1, matrix[j][i - 1] + 1, matrix[j - 1][i - 1] + 1)
      }
    }

    return matrix[str2.length][str1.length]
  }

  /**
   * ✅ FIX: Генерація imports для різних форматів
   */
  generateFontImports(processedFonts) {
    const validFonts = processedFonts.filter(font => font.isGoogleFont)

     logger.debug(`Оброблено шрифтів: ${processedFonts.length}`)
     logger.debug(`Валідних шрифтів (Google Fonts): ${validFonts.length}`)
     logger.debug(
       "Деталі оброблених шрифтів:",
       processedFonts.map(f => ({
         name: f.name,
         isGoogleFont: f.isGoogleFont,
         url: f.url
       }))
     )

    return {
      html: this.generateHTMLImports(validFonts),
      css: this.generateCSSImports(validFonts),
      urls: validFonts.map(font => font.url).filter(Boolean),
      clipboard: this.generateClipboardContent(validFonts)
    }
  }

  /**
   * ✅ FIX: HTML imports з оптимізованими preconnect та правильним форматуванням
   */
  generateHTMLImports(fonts) {
    if (fonts.length === 0) return ""

    // ✅ Конфігуровані CDN URL без хардкодингу
    const fontCdnConfig = {
      googleapis: "https://fonts.googleapis.com",
      gstatic: "https://fonts.gstatic.com"
    }

    // ✅ Правильне форматування з 4 пробілами відступу та потрібним коментарем
    let imports = "    <!--!!! FONTS !!!-->\n"
    imports += `    <link rel="preconnect" href="${fontCdnConfig.googleapis}">\n`
    imports += `    <link rel="preconnect" href="${fontCdnConfig.gstatic}" crossorigin="">\n`

    // ✅ Додаємо посилання на шрифти з правильним форматуванням
    fonts.forEach(font => {
      imports += `    <link href="${font.url}" rel="stylesheet">\n`
    })

    return imports.trimEnd() // Видаляємо останній перенос рядка
  }

  /**
   * ✅ FIX: CSS imports
   */
  generateCSSImports(fonts) {
    return fonts.map(font => `@import url('${font.url}');`).join("\n")
  }

  /**
   * ✅ FIX: Контент для буфера обміну
   */
  generateClipboardContent(fonts) {
    let content = "/* ✅ Google Fonts imports for Figma fonts */\n\n"

    content += "<!-- Add to HTML <head> -->\n"
    content += this.generateHTMLImports(fonts) + "\n\n"

    content += "/* Or add to CSS */\n"
    content += this.generateCSSImports(fonts) + "\n\n"

    content += "/* Font families to use in CSS */\n"
    fonts.forEach(font => {
      content += `/* ${font.name} */\n`
      content += `.${this.cleanFontName(font.name)} {\n`
      content += `  ${font.cssDeclaration}\n`
      content += "}\n\n"
    })

    return content
  }

  /**
   * ✅ FIX: Генерація CSS файлу
   */
  generateFontCSS(processedFonts) {
    let css = "/* ✅ Font Styles from Figma */\n"
    css += `/* Generated: ${new Date().toLocaleString()} */\n`
    css += `/* Fonts analyzed: ${processedFonts.length} */\n\n`

    // ✅ FIX: CSS imports
    const validFonts = processedFonts.filter(font => font.isGoogleFont)
    if (validFonts.length > 0) {
      css += "/* Google Fonts imports */\n"
      css += this.generateCSSImports(validFonts) + "\n\n"
    }

    // ✅ FIX: CSS змінні для шрифтів
    css += ":root {\n"
    processedFonts.forEach(font => {
      const varName = `--font-${this.cleanFontName(font.name)}`
      css += `  ${varName}: '${font.name}', ${font.fallbackStack.join(", ")};\n`
    })
    css += "}\n\n"

    // ✅ FIX: Utility класи
    processedFonts.forEach(font => {
      const className = this.cleanFontName(font.name)
      css += `/* ${font.name} ${font.isGoogleFont ? "(Google Fonts)" : "(Not available)"} */\n`
      css += `.font-${className} {\n`
      css += `  font-family: var(--font-${className});\n`
      css += "}\n\n"

      // ✅ FIX: Ваги шрифту
      if (font.figmaWeights && font.figmaWeights.length > 0) {
        font.figmaWeights.forEach(weight => {
          css += `.font-${className}-${weight} {\n`
          css += `  font-family: var(--font-${className});\n`
          css += `  font-weight: ${weight};\n`
          css += "}\n\n"
        })
      }
    })

    // ✅ FIX: Недоступні шрифти
    const unavailableFonts = processedFonts.filter(font => !font.isGoogleFont)
    if (unavailableFonts.length > 0) {
      css += "/* ⚠️ Fonts not available on Google Fonts */\n"
      unavailableFonts.forEach(font => {
        css += `/* ${font.name} - Consider alternatives: ${font.alternatives?.map(a => a.family).join(", ") || "None suggested"} */\n`
      })
      css += "\n"
    }

    return css
  }

  /**
   * ✅ FIX: Генерація HTML контенту для прев'ю (без збереження файлів)
   */
  generateHTMLPreview(imports) {
    // ✅ FIX: HTML контент з imports для попереднього перегляду
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Font Imports Preview - ${this.customFileName}</title>
    
${imports.html}
    
    <style>
    body { 
      font-family: 'Montserrat', sans-serif; 
      padding: 20px; 
      background: #f5f5f5; 
    }
    h1 { color: #333; }
    .font-preview { 
      margin: 20px 0; 
      padding: 15px; 
      background: white; 
      border-radius: 8px; 
    }
    </style>
</head>
<body>
    <h1>🔤 Font Imports Preview</h1>
    <div class="font-preview">
      <p>Шрифти імпортовані з Figma готові для використання!</p>
      <p>Generated: ${new Date().toLocaleString()}</p>
    </div>
</body>
</html>`

    return htmlContent
  }

  /**
   * ✅ FIX: HTTP запити
   */
  async makeHttpRequest(url) {
    return new Promise((resolve, reject) => {
      https
        .get(url, res => {
          let data = ""
          res.on("data", chunk => {
            data += chunk
          })
          res.on("end", () => {
            if (res.statusCode === 200) {
              resolve(data)
            } else {
              reject(new Error(`HTTP ${res.statusCode}`))
            }
          })
        })
        .on("error", reject)
    })
  }

  /**
   * ✅ FIX: Допоміжні методи
   */
  cleanFontName(name) {
    return name
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
  }

  /**
   * ✅ FIX: Статистика імпорту
   */
  getImportStats(processedFonts) {
    const available = processedFonts.filter(f => f.isGoogleFont).length
    const unavailable = processedFonts.length - available

    return {
      totalFonts: processedFonts.length,
      availableOnGoogleFonts: available,
      unavailableOnGoogleFonts: unavailable,
      successRate:
        processedFonts.length > 0 ? ((available / processedFonts.length) * 100).toFixed(1) : 0,
      outputDirectory: this.outputDir
    }
  }
}

module.exports = FontImporter
