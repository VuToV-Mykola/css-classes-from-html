// Сервіс для роботи з Figma API та витягування дизайн-токенів
const https = require("https")
const { URL } = require("url")

class FigmaService {
  constructor(accessToken) {
    if (!accessToken) {
      throw new Error("Figma access token is required")
    }
    this.accessToken = accessToken
    this.baseURL = "https://api.figma.com/v1"
  }

  _getHeaders() {
    return {"X-FIGMA-TOKEN": this.accessToken}
  }

  async getFile(fileKey) {
    if (!fileKey) throw new Error("File key is required")
    try {
      const data = await this._makeRequest(`${this.baseURL}/files/${fileKey}`)
      return data
    } catch (error) {
      throw new Error(`Помилка отримання файлу з Figma: ${error.message}`)
    }
  }

  async getStyles(fileKey) {
    if (!fileKey) throw new Error("File key is required")
    try {
      const data = await this._makeRequest(`${this.baseURL}/files/${fileKey}/styles`)
      return data
    } catch (error) {
      throw new Error(`Помилка отримання стилів з Figma: ${error.message}`)
    }
  }

  _makeRequest(url) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url)
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: this._getHeaders()
      }

      const req = https.request(options, (res) => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          try {
            resolve(JSON.parse(data))
          } catch (e) {
            reject(new Error('Invalid JSON response'))
          }
        })
      })

      req.on('error', reject)
      req.end()
    })
  }

  extractFileKeyFromLink(link) {
    const match = link.match(/(?:file|design)\/([a-zA-Z0-9]+)/)
    return match ? match[1] : null
  }

  parseDesignTokens(fileData, stylesData) {
    const tokens = {
      colors: {},
      typography: {},
      spacing: {},
      effects: {},
      classStyles: {},
      document: fileData.document,
      breakpoints: {
        mobile: "320px",
        tablet: "768px", 
        desktop: "1158px"
      }
    }

    // Extract from document
    if (fileData.document?.children) {
      this._extractAllTokens(fileData.document.children, tokens)
    }

    // Extract from styles
    if (stylesData.meta?.styles) {
      this._extractTextStyles(stylesData.meta.styles, tokens.typography)
    }

    // Add default tokens if none found
    if (Object.keys(tokens.colors).length === 0) {
      tokens.colors = {
        primary: "#4d5ae5",
        dark: "#2e2f42",
        light: "#f4f4fd",
        white: "#ffffff",
        border: "#e7e9fc",
        hover: "#404bbf"
      }
    }

    if (Object.keys(tokens.typography).length === 0) {
      tokens.typography = {
        "font-primary": "'Roboto', sans-serif",
        "font-secondary": "'Raleway', sans-serif",
        "size-h1": "56px",
        "size-h2": "36px",
        "size-h3": "20px",
        "size-body": "16px",
        "weight-regular": "400",
        "weight-medium": "500",
        "weight-bold": "700"
      }
    }

    if (Object.keys(tokens.spacing).length === 0) {
      tokens.spacing = {
        "xs": "4px",
        "sm": "8px",
        "md": "16px",
        "lg": "24px",
        "xl": "32px",
        "xxl": "48px",
        "section": "120px"
      }
    }

    if (Object.keys(tokens.effects).length === 0) {
      tokens.effects = {
        "light": "0 1px 6px rgba(46, 47, 66, 0.08)",
        "card": "0 1px 6px rgba(46, 47, 66, 0.08), 0 1px 1px rgba(46, 47, 66, 0.16), 0 2px 1px rgba(46, 47, 66, 0.08)",
        "hover": "0 4px 4px rgba(0, 0, 0, 0.15)"
      }
    }

    return tokens
  }

  _extractAllTokens(nodes, tokens) {
    nodes.forEach(node => {
      // Extract colors from any node with fills
      if (node.fills?.[0]?.color) {
        const color = node.fills[0].color
        const colorValue = this._convertToRgba(color)
        
        if (node.name) {
          const colorName = node.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
          if (colorName) tokens.colors[colorName] = colorValue
        }
      }
      
      // Extract class styles
      if (node.name && node.type !== "DOCUMENT" && node.type !== "CANVAS") {
        const className = this._normalizeClassName(node.name)
        const styles = this._extractNodeStyles(node)
        
        if (Object.keys(styles).length > 0) {
          tokens.classStyles[className] = styles
        }
      }
      
      if (node.children) {
        this._extractAllTokens(node.children, tokens)
      }
    })
  }

  _extractSpacing(nodes, spacingMap) {
    nodes.forEach(node => {
      if (node.name?.startsWith("spacing/") && node.absoluteBoundingBox) {
        const spacingName = node.name.replace("spacing/", "").toLowerCase().replace(/\s+/g, "-")
        spacingMap[spacingName] = `${node.absoluteBoundingBox.width}px`
      }
      
      if (node.children) {
        this._extractSpacing(node.children, spacingMap)
      }
    })
  }

  _extractClassStyles(nodes, classStylesMap) {
    nodes.forEach(node => {
      if (node.name && node.type !== "DOCUMENT" && node.type !== "CANVAS") {
        const className = this._normalizeClassName(node.name)
        const styles = this._extractNodeStyles(node)
        
        if (Object.keys(styles).length > 0) {
          classStylesMap[className] = styles
        }
      }
      
      if (node.children) {
        this._extractClassStyles(node.children, classStylesMap)
      }
    })
  }

  _normalizeClassName(name) {
    return name.toLowerCase()
      .replace(/[^a-z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
  }

  _extractNodeStyles(node) {
    const styles = {}
    
    // Typography
    if (node.style) {
      if (node.style.fontSize) styles["font-size"] = `${node.style.fontSize}px`
      if (node.style.fontWeight) styles["font-weight"] = node.style.fontWeight
      if (node.style.lineHeightPx) {
        const lineHeight = typeof node.style.lineHeightPx === 'object' ? 
          node.style.lineHeightPx.value || node.style.lineHeightPx : node.style.lineHeightPx
        styles["line-height"] = `${lineHeight}px`
      }
      if (node.style.fontFamily) styles["font-family"] = `"${node.style.fontFamily}", sans-serif`
      if (node.style.textAlignHorizontal) {
        const align = node.style.textAlignHorizontal.toLowerCase()
        if (align !== "left") styles["text-align"] = align
      }
    }
    
    // Colors
    if (node.fills?.[0]?.color) {
      const color = node.fills[0].color
      styles.color = this._convertToRgba(color)
    }
    
    if (node.backgroundColor) {
      const bg = node.backgroundColor
      styles["background-color"] = this._convertToRgba(bg)
    }
    
    // Layout
    if (node.absoluteBoundingBox) {
      const box = node.absoluteBoundingBox
      if (box.width) styles.width = `${box.width}px`
      if (box.height) styles.height = `${box.height}px`
    }
    
    // Border radius
    if (node.cornerRadius) {
      styles["border-radius"] = `${node.cornerRadius}px`
    }
    
    return styles
  }

  _convertToRgba(color) {
    const r = Math.round(color.r * 255)
    const g = Math.round(color.g * 255)
    const b = Math.round(color.b * 255)
    const a = color.a || 1
    return `rgba(${r}, ${g}, ${b}, ${a})`
  }

  _extractTextStyles(styles, typographyMap) {
    styles.forEach(style => {
      if (style.styleType === "TEXT" && style.name) {
        const styleName = style.name.toLowerCase().replace(/\s+/g, "-")
        // Extract actual properties from Figma style
        typographyMap[styleName] = {
          "font-family": style.fontFamily || "var(--font-primary, sans-serif)",
          "font-size": style.fontSize ? `${style.fontSize}px` : "16px",
          "font-weight": style.fontWeight || "400",
          "line-height": style.lineHeight || "1.5"
        }
      }
    })
  }
}

module.exports = FigmaService