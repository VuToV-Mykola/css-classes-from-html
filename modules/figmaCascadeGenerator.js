// Модуль каскадної генерації CSS з Figma макетів
function generateFigmaCascadeCSS(designTokens) {
  const cssBlocks = []
  const inheritanceMap = new Map()
  const usedProperties = new Set()
  
  cssBlocks.push("/* Повний аналіз стилів Figma макету */")
  cssBlocks.push("/* Каскадне відображення без дублювання */")
  
  if (designTokens?.document?.children) {
    const hierarchy = buildInheritanceHierarchy(designTokens.document.children)
    cssBlocks.push(...generateOptimizedHierarchy(hierarchy, inheritanceMap, usedProperties, 0))
  }
  
  return cssBlocks.join("\n")
}

function buildInheritanceHierarchy(nodes, parent = null) {
  const hierarchy = []
  
  nodes.forEach(node => {
    if (node.name && node.type !== "DOCUMENT") {
      const nodeData = {
        node,
        parent,
        children: node.children ? buildInheritanceHierarchy(node.children, node) : []
      }
      hierarchy.push(nodeData)
    }
  })
  
  return hierarchy
}

function generateOptimizedHierarchy(hierarchy, inheritanceMap, usedProperties, depth) {
  const cssBlocks = []
  const indent = "  ".repeat(depth)
  
  hierarchy.forEach(({node, parent, children}) => {
    const className = normalizeClassName(node.name)
    const allStyles = extractNodeStyles(node, depth + 1)
    const inheritedStyles = getInheritedStyles(parent, inheritanceMap)
    const uniqueStyles = filterUniqueStyles(allStyles, inheritedStyles, usedProperties)
    
    if (uniqueStyles.length > 0) {
      cssBlocks.push(`${indent}/* ${node.name} */`)
      cssBlocks.push(`${indent}.${className} {`)
      cssBlocks.push(...uniqueStyles)
      cssBlocks.push(`${indent}}`)
      
      inheritanceMap.set(className, combineStyles(inheritedStyles, uniqueStyles))
    }
    
    if (children.length > 0) {
      cssBlocks.push(...generateOptimizedHierarchy(children, inheritanceMap, usedProperties, depth + 1))
    }
  })
  
  return cssBlocks
}

const INHERITABLE_PROPS = ['color', 'font-family', 'font-size', 'font-weight', 'line-height', 'text-align']
const LAYOUT_PROPS = ['width', 'height', 'margin', 'padding', 'display', 'position']
const VISUAL_PROPS = ['background-color', 'border', 'border-radius', 'box-shadow']

function extractNodeStyles(node, indentLevel) {
  const styles = []
  const indent = "  ".repeat(indentLevel)
  const props = new Map()
  
  if (node.absoluteBoundingBox) {
    const box = node.absoluteBoundingBox
    if (box.width) props.set('width', `${box.width}px`)
    if (box.height) props.set('height', `${box.height}px`)
  }
  
  if (node.backgroundColor) {
    const bg = node.backgroundColor
    props.set('background-color', `rgba(${Math.round(bg.r * 255)}, ${Math.round(bg.g * 255)}, ${Math.round(bg.b * 255)}, ${bg.a || 1})`)
  }
  
  if (node.fills?.[0]?.color) {
    const color = node.fills[0].color
    props.set('color', `rgba(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)}, ${color.a || 1})`)
  }
  
  if (node.style) {
    if (node.style.fontSize) props.set('font-size', `${node.style.fontSize}px`)
    if (node.style.fontWeight) props.set('font-weight', node.style.fontWeight)
    if (node.style.fontFamily) props.set('font-family', `"${node.style.fontFamily}", sans-serif`)
    if (node.style.lineHeightPx) props.set('line-height', `${node.style.lineHeightPx}px`)
  }
  
  const sortedProps = [...props.entries()].sort(([a], [b]) => {
    const aCategory = getPropertyCategory(a)
    const bCategory = getPropertyCategory(b)
    return aCategory - bCategory || a.localeCompare(b)
  })
  
  sortedProps.forEach(([prop, value]) => {
    styles.push(`${indent}${prop}: ${value};`)
  })
  
  return styles
}

function getPropertyCategory(prop) {
  if (LAYOUT_PROPS.includes(prop)) return 1
  if (INHERITABLE_PROPS.includes(prop)) return 2
  if (VISUAL_PROPS.includes(prop)) return 3
  return 4
}

function getInheritedStyles(parent, inheritanceMap) {
  if (!parent) return new Map()
  const parentClass = normalizeClassName(parent.name)
  return inheritanceMap.get(parentClass) || new Map()
}

function filterUniqueStyles(allStyles, inheritedStyles, usedProperties) {
  const uniqueStyles = []
  
  allStyles.forEach(styleStr => {
    const parts = styleStr.split(': ')
    if (parts.length < 2) return
    
    const [prop, value] = parts
    const cleanProp = prop.trim()
    const cleanValue = value?.replace(';', '')?.trim() || ''
    const propKey = `${cleanProp}:${cleanValue}`
    
    if (!usedProperties.has(propKey) && !inheritedStyles.has(cleanProp)) {
      uniqueStyles.push(styleStr)
      usedProperties.add(propKey)
    }
  })
  
  return uniqueStyles
}

function combineStyles(inherited, unique) {
  const combined = new Map(inherited)
  unique.forEach(styleStr => {
    const [prop, value] = styleStr.split(': ')
    combined.set(prop.trim(), value?.replace(';', '').trim())
  })
  return combined
}

function normalizeClassName(name) {
  return name.toLowerCase().replace(/[^a-z0-9-_]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
}

module.exports = {
  generateFigmaCascadeCSS
}