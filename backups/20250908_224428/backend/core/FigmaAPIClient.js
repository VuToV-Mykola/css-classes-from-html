/**
 * ✅ Enhanced Figma API Client з підтримкою реальної інтеграції
 * Повноцінна робота з Figma API без Mock даних
 * @version 4.0.0 - REAL FIGMA INTEGRATION
 */

const https = require("https")
const {URL} = require("url")

class FigmaAPIClient {
  constructor(apiToken, options = {}) {
    this.apiToken = apiToken
    this.baseURL = "https://api.figma.com/v1"
    this.cache = new Map()
    this.rateLimit = {
      requests: 0,
      resetTime: Date.now() + 60000,
      maxRequests: 100
    }
    this.timeout = options.timeout || 15000
    this.retryAttempts = options.retryAttempts || 3
  }

  /**
   * ✅ FIX: Завантаження файлу з реальної Figma API
   */
  async fetchFile(fileKey, options = {}) {
    const cacheKey = `file_${fileKey}`
    const useCache = options.useCache !== false

    if (useCache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    if (!this.apiToken) {
      throw new Error(
        "❌ No Figma token provided. Get token from https://www.figma.com/developers/api#access-tokens"
      )
    }

    await this.checkRateLimit()

    const url = `${this.baseURL}/files/${fileKey}`
    const headers = {
      "X-Figma-Token": this.apiToken,
      "Content-Type": "application/json",
      "User-Agent": "CSS-Classes-From-HTML/4.0.0"
    }

    try {
      const response = await this.makeRequest(url, "GET", null, headers)
      const data = response.data

      // ✅ FIX: Валідація отриманих даних
      if (!data.document || !data.document.children) {
        throw new Error("❌ Invalid Figma file structure received")
      }

      this.cache.set(cacheKey, data)
      return data
    } catch (error) {
      if (error.statusCode === 429) {
        await this.handleRateLimit()
        return this.fetchFile(fileKey, options)
      }
      throw error
    }
  }

  /**
   * ✅ FIX: Отримання реальних Canvas з Figma
   */
  async getCanvases(fileKey) {
    const data = await this.fetchFile(fileKey)
    const pages = (data.document && data.document.children) || []

    return pages.map(page => ({
      id: page.id,
      name: page.name || "Untitled Canvas",
      type: page.type,
      childrenCount: Array.isArray(page.children) ? page.children.length : 0,
      elementTypes: this.getElementTypes(page),
      hasText: this.hasTextContent(page),
      hasImages: this.hasImages(page),
      complexity: this.calculateCanvasComplexity(page),
      metadata: {
        width: page.absoluteBoundingBox?.width || 0,
        height: page.absoluteBoundingBox?.height || 0,
        // ✅ FIX: Виправлена синтаксична помилка
        backgroundColor: this.extractBackgroundColor(page),
        created: data.lastModified || new Date().toISOString()
      }
    }))
  }

  /**
   * ✅ FIX: Отримання реальних Layers з Canvas
   */
  async getLayers(fileKey, canvasIds) {
    const data = await this.fetchFile(fileKey)
    const layers = []

    if (!Array.isArray(canvasIds)) {
      canvasIds = [canvasIds]
    }

    // ✅ FIX: Обхід всіх Canvas та збір реальних Layers
    data.document.children.forEach(canvas => {
      if (canvasIds.includes(canvas.id)) {
        this.extractLayersRecursively(canvas, layers, canvas.name, 0)
      }
    })

    return layers
  }

  /**
   * ✅ FIX: Рекурсивне витягування Layers
   */
  extractLayersRecursively(element, layers, canvasName, depth) {
    if (!element) return

    // ✅ FIX: Додаємо поточний елемент
    layers.push({
      id: element.id,
      name: element.name || "Unnamed Layer",
      type: element.type,
      canvasId: element.id.split(":")[0], // Приблизний Canvas ID
      canvasName: canvasName,
      depth: depth,
      hasChildren: element.children && element.children.length > 0,
      parentId: element.parent || null,
      visible: element.visible !== false,
      locked: element.locked === true,
      absoluteBoundingBox: element.absoluteBoundingBox,
      constraints: element.constraints,
      fills: element.fills || [],
      strokes: element.strokes || [],
      effects: element.effects || [],
      characters: element.characters || null, // Для TEXT елементів
      style: element.style || null, // Для TEXT елементів
      layoutMode: element.layoutMode || null, // Для FRAME елементів
      itemSpacing: element.itemSpacing || null,
      primaryAxisAlignItems: element.primaryAxisAlignItems || null,
      counterAxisAlignItems: element.counterAxisAlignItems || null
    })

    // ✅ FIX: Рекурсивний обхід дітей
    if (element.children && Array.isArray(element.children)) {
      element.children.forEach(child => {
        this.extractLayersRecursively(child, layers, canvasName, depth + 1)
      })
    }
  }

  /**
   * ✅ FIX: Отримання стилів конкретного Layer
   */
  async getLayerStyles(fileKey, layerIds) {
    const data = await this.fetchFile(fileKey)
    const styles = []

    if (!Array.isArray(layerIds)) {
      layerIds = [layerIds]
    }

    // ✅ FIX: Пошук елементів за ID та витягування стилів
    layerIds.forEach(layerId => {
      const element = this.findElementById(data.document, layerId)
      if (element) {
        const extractedStyles = this.extractElementStyles(element)
        styles.push({
          layerId: layerId,
          name: element.name,
          type: element.type,
          styles: extractedStyles,
          metadata: {
            visible: element.visible,
            locked: element.locked,
            absoluteBoundingBox: element.absoluteBoundingBox
          }
        })
      }
    })

    return styles
  }

  /**
   * ✅ FIX: Витягування реальних стилів з Figma елемента
   */
  extractElementStyles(element) {
    const styles = {}

    // ✅ FIX: Typography стилі для TEXT елементів
    if (element.type === "TEXT" && element.style) {
      if (element.style.fontFamily) styles["font-family"] = element.style.fontFamily
      if (element.style.fontSize) styles["font-size"] = `${element.style.fontSize}px`
      if (element.style.fontWeight) styles["font-weight"] = element.style.fontWeight
      if (element.style.lineHeightPx) styles["line-height"] = `${element.style.lineHeightPx}px`
      if (element.style.letterSpacing) styles["letter-spacing"] = `${element.style.letterSpacing}px`
      if (element.style.textAlignHorizontal) {
        const align = element.style.textAlignHorizontal.toLowerCase()
        styles["text-align"] = align === "center" ? "center" : align === "right" ? "right" : "left"
      }
      if (element.style.textDecoration)
        styles["text-decoration"] = element.style.textDecoration.toLowerCase()
    }

    // ✅ FIX: Fills (Background/Color)
    if (element.fills && element.fills.length > 0) {
      const primaryFill = element.fills[0]
      if (primaryFill.type === "SOLID" && primaryFill.color) {
        const colorHex = this.rgbToHex(primaryFill.color)
        if (element.type === "TEXT") {
          styles["color"] = colorHex
        } else {
          styles["background-color"] = colorHex
        }
        if (primaryFill.opacity !== undefined && primaryFill.opacity < 1) {
          styles["opacity"] = primaryFill.opacity.toString()
        }
      }
    }

    // ✅ FIX: Strokes (Borders)
    if (element.strokes && element.strokes.length > 0) {
      const primaryStroke = element.strokes[0]
      if (primaryStroke.type === "SOLID" && primaryStroke.color) {
        styles["border-color"] = this.rgbToHex(primaryStroke.color)
      }
    }

    if (element.strokeWeight) {
      styles["border-width"] = `${element.strokeWeight}px`
      styles["border-style"] = "solid"
    }

    // ✅ FIX: Corner Radius
    if (element.cornerRadius) {
      styles["border-radius"] = `${element.cornerRadius}px`
    } else if (element.rectangleCornerRadii) {
      const radii = element.rectangleCornerRadii
      if (radii.every(r => r === radii[0])) {
        styles["border-radius"] = `${radii[0]}px`
      } else {
        styles["border-radius"] = `${radii[0]}px ${radii[1]}px ${radii[2]}px ${radii[3]}px`
      }
    }

    // ✅ FIX: Layout стилі (Flexbox)
    if (element.layoutMode) {
      styles["display"] = "flex"
      styles["flex-direction"] = element.layoutMode === "HORIZONTAL" ? "row" : "column"

      if (element.primaryAxisAlignItems) {
        const alignment = this.mapFigmaAlignment(element.primaryAxisAlignItems)
        styles["justify-content"] = alignment
      }

      if (element.counterAxisAlignItems) {
        const alignment = this.mapFigmaAlignment(element.counterAxisAlignItems)
        styles["align-items"] = alignment
      }

      if (element.itemSpacing) {
        styles["gap"] = `${element.itemSpacing}px`
      }
    }

    // ✅ FIX: Padding
    if (
      element.paddingLeft ||
      element.paddingTop ||
      element.paddingRight ||
      element.paddingBottom
    ) {
      const paddingValues = [
        element.paddingTop || 0,
        element.paddingRight || 0,
        element.paddingBottom || 0,
        element.paddingLeft || 0
      ]

      if (paddingValues.every(p => p === paddingValues[0])) {
        styles["padding"] = `${paddingValues[0]}px`
      } else {
        styles["padding"] =
          `${paddingValues[0]}px ${paddingValues[1]}px ${paddingValues[2]}px ${paddingValues[3]}px`
      }
    }

    // ✅ FIX: Size
    if (element.absoluteBoundingBox) {
      styles["width"] = `${element.absoluteBoundingBox.width}px`
      styles["height"] = `${element.absoluteBoundingBox.height}px`
    }

    // ✅ FIX: Effects (Shadows)
    if (element.effects && element.effects.length > 0) {
      const shadows = element.effects
        .filter(effect => effect.type === "DROP_SHADOW" && effect.visible !== false)
        .map(effect => {
          const x = effect.offset?.x || 0
          const y = effect.offset?.y || 0
          const blur = effect.radius || 0
          const spread = effect.spread || 0
          const color = effect.color ? this.rgbToHex(effect.color) : "#000000"
          return `${x}px ${y}px ${blur}px ${spread}px ${color}`
        })

      if (shadows.length > 0) {
        styles["box-shadow"] = shadows.join(", ")
      }
    }

    return styles
  }

  /**
   * ✅ FIX: Пошук елемента за ID
   */
  findElementById(node, targetId) {
    if (node.id === targetId) {
      return node
    }

    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        const found = this.findElementById(child, targetId)
        if (found) return found
      }
    }

    return null
  }

  /**
   * ✅ FIX: Отримання всіх зображень з Figma
   */
  async getImages(fileKey) {
    const data = await this.fetchFile(fileKey)
    const images = []

    this.extractImagesRecursively(data.document, images)

    // ✅ FIX: Отримання URLs для експорту зображень
    if (images.length > 0) {
      const imageIds = images.map(img => img.id)
      const exportUrl = `${this.baseURL}/images/${fileKey}?ids=${imageIds.join(",")}&format=png&scale=2`

      try {
        const response = await this.makeRequest(exportUrl, "GET", null, {
          "X-Figma-Token": this.apiToken
        })

        // ✅ FIX: Додаємо URLs до зображень
        images.forEach(image => {
          if (response.data.images && response.data.images[image.id]) {
            image.downloadUrl = response.data.images[image.id]
          }
        })
      } catch (error) {
        console.warn("Warning: Could not get image export URLs:", error.message)
      }
    }

    return images
  }

  /**
   * ✅ FIX: Рекурсивне витягування зображень
   */
  extractImagesRecursively(node, images) {
    // ✅ FIX: Перевіряємо чи є це зображення
    if (node.fills && Array.isArray(node.fills)) {
      node.fills.forEach(fill => {
        if (fill.type === "IMAGE" && fill.imageRef) {
          images.push({
            id: node.id,
            name: node.name || "Unnamed Image",
            type: "IMAGE_FILL",
            imageRef: fill.imageRef,
            absoluteBoundingBox: node.absoluteBoundingBox,
            visible: node.visible !== false
          })
        }
      })
    }

    // ✅ FIX: Для окремих IMAGE нодів
    if (node.type === "RECTANGLE" && node.fills) {
      // Вже обробляється вище
    }

    // ✅ FIX: Рекурсивний обхід дітей
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(child => {
        this.extractImagesRecursively(child, images)
      })
    }
  }

  /**
   * ✅ FIX: Отримання шрифтів з Figma
   */
  async getFonts(fileKey) {
    const data = await this.fetchFile(fileKey)
    const fonts = new Set()

    this.extractFontsRecursively(data.document, fonts)

    return Array.from(fonts).map(fontFamily => ({
      family: fontFamily,
      googleFontsUrl: this.generateGoogleFontsUrl(fontFamily),
      weights: this.detectFontWeights(data.document, fontFamily)
    }))
  }

  /**
   * ✅ FIX: Рекурсивне витягування шрифтів
   */
  extractFontsRecursively(node, fonts) {
    if (node.type === "TEXT" && node.style && node.style.fontFamily) {
      fonts.add(node.style.fontFamily)
    }

    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(child => {
        this.extractFontsRecursively(child, fonts)
      })
    }
  }

  /**
   * ✅ FIX: Генерація Google Fonts URL
   */
  generateGoogleFontsUrl(fontFamily) {
    const cleanFontName = fontFamily.replace(/\s+/g, "+")
    return `https://fonts.googleapis.com/css2?family=${cleanFontName}:wght@100;200;300;400;500;600;700;800;900&display=swap`
  }

  /**
   * ✅ FIX: Визначення ваг шрифту
   */
  detectFontWeights(node, targetFamily) {
    const weights = new Set()

    this.detectWeightsRecursively(node, targetFamily, weights)

    return Array.from(weights).sort((a, b) => a - b)
  }

  detectWeightsRecursively(node, targetFamily, weights) {
    if (node.type === "TEXT" && node.style && node.style.fontFamily === targetFamily) {
      weights.add(node.style.fontWeight || 400)
    }

    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(child => {
        this.detectWeightsRecursively(child, targetFamily, weights)
      })
    }
  }

  /**
   * ✅ FIX: HTTP запити
   */
  async makeRequest(url, method = "GET", body = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url)
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: urlObj.pathname + urlObj.search,
        method: method,
        headers: headers,
        timeout: this.timeout
      }

      const req = https.request(options, res => {
        let data = ""

        res.on("data", chunk => {
          data += chunk
        })

        res.on("end", () => {
          try {
            const jsonData = JSON.parse(data)

            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({
                statusCode: res.statusCode,
                data: jsonData
              })
            } else {
              reject(
                new Error(`API Error ${res.statusCode}: ${jsonData.message || "Unknown error"}`)
              )
            }
          } catch (parseError) {
            reject(new Error(`Failed to parse JSON response: ${parseError.message}`))
          }
        })
      })

      req.on("error", error => {
        reject(new Error(`Request failed: ${error.message}`))
      })

      req.on("timeout", () => {
        req.destroy()
        reject(new Error("Request timeout"))
      })

      if (body) {
        req.write(typeof body === "string" ? body : JSON.stringify(body))
      }

      req.end()
    })
  }

  /**
   * ✅ FIX: Допоміжні методи
   */
  getElementTypes(page) {
    const types = new Set()
    this.collectTypesRecursively(page, types)
    return Array.from(types)
  }

  collectTypesRecursively(node, types) {
    types.add(node.type)
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(child => {
        this.collectTypesRecursively(child, types)
      })
    }
  }

  hasTextContent(page) {
    return this.hasTextRecursively(page)
  }

  hasTextRecursively(node) {
    if (node.type === "TEXT" && node.characters) {
      return true
    }

    if (node.children && Array.isArray(node.children)) {
      return node.children.some(child => this.hasTextRecursively(child))
    }

    return false
  }

  hasImages(page) {
    return this.hasImagesRecursively(page)
  }

  hasImagesRecursively(node) {
    if (node.fills && Array.isArray(node.fills)) {
      if (node.fills.some(fill => fill.type === "IMAGE")) {
        return true
      }
    }

    if (node.children && Array.isArray(node.children)) {
      return node.children.some(child => this.hasImagesRecursively(child))
    }

    return false
  }

  calculateCanvasComplexity(page) {
    let complexity = 0
    complexity = this.calculateComplexityRecursively(page, 0)
    return Math.min(complexity / 10, 10) // Нормалізуємо до 10
  }

  calculateComplexityRecursively(node, complexity) {
    complexity += 1

    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(child => {
        complexity += this.calculateComplexityRecursively(child, 0)
      })
    }

    return complexity
  }

  extractBackgroundColor(page) {
    if (page.backgroundColor) {
      return this.rgbToHex(page.backgroundColor)
    }

    if (page.fills && page.fills.length > 0) {
      const firstFill = page.fills[0]
      if (firstFill.type === "SOLID" && firstFill.color) {
        return this.rgbToHex(firstFill.color)
      }
    }

    return "#ffffff"
  }

  rgbToHex(color) {
    if (typeof color === "string") return color
    if (!color) return "#000000"

    const r = Math.round((color.r || 0) * 255)
    const g = Math.round((color.g || 0) * 255)
    const b = Math.round((color.b || 0) * 255)
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
  }

  mapFigmaAlignment(alignment) {
    const alignmentMap = {
      MIN: "flex-start",
      CENTER: "center",
      MAX: "flex-end",
      SPACE_BETWEEN: "space-between",
      SPACE_AROUND: "space-around"
    }

    return alignmentMap[alignment] || "flex-start"
  }

  async checkRateLimit() {
    const now = Date.now()

    if (now > this.rateLimit.resetTime) {
      this.rateLimit.requests = 0
      this.rateLimit.resetTime = now + 60000
    }

    if (this.rateLimit.requests >= this.rateLimit.maxRequests) {
      const waitTime = this.rateLimit.resetTime - now
      await new Promise(resolve => setTimeout(resolve, waitTime))
      this.rateLimit.requests = 0
      this.rateLimit.resetTime = Date.now() + 60000
    }

    this.rateLimit.requests++
  }

  async handleRateLimit() {
    console.warn("Rate limit reached, waiting...")
    await new Promise(resolve => setTimeout(resolve, 60000))
  }

  clearCache() {
    this.cache.clear()
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

module.exports = FigmaAPIClient
