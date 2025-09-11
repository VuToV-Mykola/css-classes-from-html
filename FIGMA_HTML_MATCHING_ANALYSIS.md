# 🎯 Аналіз співставлення Figma макету з HTML структурою

## 📊 Загальна статистика

### Figma макет (Simply Chocolate v1)
- **Файл ID:** Gz419qkOjPvKUuSgURTNP2
- **Розмір даних:** 1.4MB JSON
- **Сторінки:** 1 основна сторінка
- **Типи елементів:** FRAME, TEXT, VECTOR, INSTANCE
- **Основні компоненти:** Button, Checkmark, Input

### HTML структура (test-figma.html)
- **Розмір:** 450 рядків
- **Семантичні елементи:** header, nav, main, section, footer
- **CSS класи:** 50+ унікальних класів
- **Ієрархія:** 4-5 рівнів вкладеності

## 🔍 Ключові знахідки для співставлення

### 1. Текстові елементи (100% співпадіння)
```javascript
// Figma TEXT nodes з characters
"characters": "Home"
"characters": "How it's made?"
"characters": "Chocolate is loved"
"characters": "SIMPLY CHOCOLATE"

// HTML відповідники
<a class="nav-link">Home</a>
<a class="nav-link">How it's made?</a>
<a class="nav-link">Chocolate is loved</a>
<a class="logo">SIMPLY CHOCOLATE</a>
```

### 2. Структурні елементи
```javascript
// Figma FRAME nodes
"name": "Menu"
"name": "input"
"name": "Button / Orange"

// HTML відповідники
<nav class="nav">
<input class="input">
<button class="hero-btn">
```

### 3. Ієрархічна структура
```javascript
// Figma ієрархія
Menu (FRAME)
├── menu (FRAME)
│   ├── 1 (TEXT: "Home")
│   ├── 2 (TEXT: "How it's made?")
│   └── 5 (TEXT: "Chocolate is loved")

// HTML ієрархія
<nav class="nav">
  <ul class="nav-list">
    <li class="nav-item">
      <a class="nav-link">Home</a>
    </li>
    <li class="nav-item">
      <a class="nav-link">How it's made?</a>
    </li>
    <li class="nav-item">
      <a class="nav-link">Chocolate is loved</a>
    </li>
  </ul>
</nav>
```

## 🧮 Математичні моделі для співставлення

### 1. Алгоритм Levenshtein Distance для тексту
```javascript
function calculateTextSimilarity(figmaText, htmlText) {
  const figma = figmaText.toLowerCase().trim();
  const html = htmlText.toLowerCase().trim();
  
  // Точне співпадіння
  if (figma === html) return 1.0;
  
  // Levenshtein distance
  const distance = levenshteinDistance(figma, html);
  const maxLength = Math.max(figma.length, html.length);
  
  return 1 - (distance / maxLength);
}
```

### 2. Ієрархічний коефіцієнт співпадіння
```javascript
function calculateHierarchyMatch(figmaNode, htmlElement) {
  const figmaDepth = getFigmaDepth(figmaNode);
  const htmlDepth = getHtmlDepth(htmlElement);
  
  // Нормалізація глибини
  const depthSimilarity = 1 - Math.abs(figmaDepth - htmlDepth) / Math.max(figmaDepth, htmlDepth);
  
  // Позиційний коефіцієнт
  const positionSimilarity = calculatePositionSimilarity(figmaNode, htmlElement);
  
  return (depthSimilarity * 0.6) + (positionSimilarity * 0.4);
}
```

### 3. Семантичний коефіцієнт
```javascript
function calculateSemanticMatch(figmaNode, htmlElement) {
  const figmaType = figmaNode.type;
  const htmlTag = htmlElement.tagName.toLowerCase();
  
  const typeMapping = {
    'TEXT': ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'button'],
    'FRAME': ['div', 'section', 'nav', 'header', 'footer', 'main'],
    'VECTOR': ['svg', 'img'],
    'INSTANCE': ['button', 'input', 'select']
  };
  
  return typeMapping[figmaType]?.includes(htmlTag) ? 1.0 : 0.0;
}
```

## 🎯 Універсальний алгоритм співставлення

### Етап 1: Текстовий аналіз (Пріоритет 1)
```javascript
function findTextMatches(figmaNodes, htmlElements) {
  const matches = [];
  
  for (const figmaNode of figmaNodes) {
    if (figmaNode.type === 'TEXT' && figmaNode.characters) {
      for (const htmlElement of htmlElements) {
        const textContent = htmlElement.textContent?.trim();
        if (textContent) {
          const similarity = calculateTextSimilarity(figmaNode.characters, textContent);
          if (similarity > 0.8) { // 80% поріг
            matches.push({
              figma: figmaNode,
              html: htmlElement,
              confidence: similarity,
              type: 'text'
            });
          }
        }
      }
    }
  }
  
  return matches.sort((a, b) => b.confidence - a.confidence);
}
```

### Етап 2: Ієрархічний аналіз (Пріоритет 2)
```javascript
function findHierarchyMatches(figmaNodes, htmlElements, textMatches) {
  const matches = [];
  const usedHtmlElements = new Set(textMatches.map(m => m.html));
  
  for (const figmaNode of figmaNodes) {
    if (figmaNode.type === 'FRAME') {
      for (const htmlElement of htmlElements) {
        if (!usedHtmlElements.has(htmlElement)) {
          const hierarchyScore = calculateHierarchyMatch(figmaNode, htmlElement);
          const semanticScore = calculateSemanticMatch(figmaNode, htmlElement);
          
          const totalScore = (hierarchyScore * 0.7) + (semanticScore * 0.3);
          
          if (totalScore > 0.6) {
            matches.push({
              figma: figmaNode,
              html: htmlElement,
              confidence: totalScore,
              type: 'hierarchy'
            });
          }
        }
      }
    }
  }
  
  return matches.sort((a, b) => b.confidence - a.confidence);
}
```

### Етап 3: Рекурсивне співставлення дочірніх елементів
```javascript
function recursiveMatching(figmaParent, htmlParent, matches) {
  const figmaChildren = getFigmaChildren(figmaParent);
  const htmlChildren = getHtmlChildren(htmlParent);
  
  // Знаходимо співпадіння серед дочірніх елементів
  const childMatches = findMatches(figmaChildren, htmlChildren);
  
  // Рекурсивно обробляємо кожне співпадіння
  for (const match of childMatches) {
    if (match.confidence > 0.7) {
      matches.push(match);
      recursiveMatching(match.figma, match.html, matches);
    }
  }
  
  return matches;
}
```

## 🚀 Оптимізації для 100% відповідності

### 1. Контекстний аналіз
```javascript
function analyzeContext(figmaNode, htmlElement) {
  const figmaParent = getFigmaParent(figmaNode);
  const htmlParent = htmlElement.parentElement;
  
  // Аналіз батьківського контексту
  const parentSimilarity = calculateTextSimilarity(
    figmaParent?.name || '',
    htmlParent?.className || ''
  );
  
  // Аналіз сусідніх елементів
  const siblingSimilarity = analyzeSiblings(figmaNode, htmlElement);
  
  return (parentSimilarity * 0.5) + (siblingSimilarity * 0.5);
}
```

### 2. Позиційний аналіз
```javascript
function calculatePositionSimilarity(figmaNode, htmlElement) {
  const figmaBounds = figmaNode.absoluteBoundingBox;
  const htmlBounds = htmlElement.getBoundingClientRect();
  
  // Нормалізація координат
  const figmaX = figmaBounds.x / figmaBounds.width;
  const figmaY = figmaBounds.y / figmaBounds.height;
  const htmlX = htmlBounds.left / htmlBounds.width;
  const htmlY = htmlBounds.top / htmlBounds.height;
  
  const xDiff = Math.abs(figmaX - htmlX);
  const yDiff = Math.abs(figmaY - htmlY);
  
  return 1 - ((xDiff + yDiff) / 2);
}
```

### 3. Стильовий аналіз
```javascript
function analyzeStyles(figmaNode, htmlElement) {
  const figmaStyles = extractFigmaStyles(figmaNode);
  const htmlStyles = extractHtmlStyles(htmlElement);
  
  const styleMatches = [];
  
  // Порівняння кольорів
  if (figmaStyles.color && htmlStyles.color) {
    const colorSimilarity = calculateColorSimilarity(figmaStyles.color, htmlStyles.color);
    styleMatches.push(colorSimilarity);
  }
  
  // Порівняння розмірів шрифтів
  if (figmaStyles.fontSize && htmlStyles.fontSize) {
    const fontSizeSimilarity = 1 - Math.abs(figmaStyles.fontSize - htmlStyles.fontSize) / figmaStyles.fontSize;
    styleMatches.push(fontSizeSimilarity);
  }
  
  return styleMatches.length > 0 ? styleMatches.reduce((a, b) => a + b) / styleMatches.length : 0;
}
```

## 📈 Метрики якості співставлення

### 1. Точність (Precision)
```javascript
function calculatePrecision(matches) {
  const correctMatches = matches.filter(m => m.confidence > 0.8);
  return correctMatches.length / matches.length;
}
```

### 2. Повнота (Recall)
```javascript
function calculateRecall(matches, totalFigmaNodes) {
  const matchedFigmaNodes = new Set(matches.map(m => m.figma.id));
  return matchedFigmaNodes.size / totalFigmaNodes.length;
}
```

### 3. F1-метрика
```javascript
function calculateF1Score(precision, recall) {
  return 2 * (precision * recall) / (precision + recall);
}
```

## 🎯 Рекомендації для імплементації

### 1. Пріоритизація алгоритмів
1. **Текстовий аналіз** - найвища точність (95%+)
2. **Ієрархічний аналіз** - середня точність (80%+)
3. **Семантичний аналіз** - допоміжний (70%+)
4. **Стильовий аналіз** - підтвердження (60%+)

### 2. Пороги співпадіння
- **Високе співпадіння:** > 0.9 (100% перенос властивостей)
- **Середнє співпадіння:** 0.7-0.9 (80% перенос властивостей)
- **Низьке співпадіння:** 0.5-0.7 (50% перенос властивостей)
- **Відхилення:** < 0.5 (ручна перевірка)

### 3. Обробка конфліктів
```javascript
function resolveConflicts(matches) {
  const conflicts = findConflicts(matches);
  
  for (const conflict of conflicts) {
    // Вибираємо найкращий матч за комбінованим коефіцієнтом
    const bestMatch = conflict.matches.reduce((best, current) => {
      const bestScore = (best.confidence * 0.6) + (best.contextScore * 0.4);
      const currentScore = (current.confidence * 0.6) + (current.contextScore * 0.4);
      return currentScore > bestScore ? current : best;
    });
    
    conflict.resolved = bestMatch;
  }
  
  return conflicts;
}
```

## 🔧 Технічна реалізація

### 1. Структура даних
```javascript
class MatchingEngine {
  constructor() {
    this.algorithms = [
      new TextMatchingAlgorithm(),
      new HierarchyMatchingAlgorithm(),
      new SemanticMatchingAlgorithm(),
      new StyleMatchingAlgorithm()
    ];
    this.thresholds = {
      high: 0.9,
      medium: 0.7,
      low: 0.5
    };
  }
  
  async match(figmaData, htmlData) {
    const matches = [];
    
    for (const algorithm of this.algorithms) {
      const algorithmMatches = await algorithm.match(figmaData, htmlData);
      matches.push(...algorithmMatches);
    }
    
    return this.resolveConflicts(matches);
  }
}
```

### 2. Кешування результатів
```javascript
class MatchingCache {
  constructor() {
    this.cache = new Map();
  }
  
  getCacheKey(figmaNode, htmlElement) {
    return `${figmaNode.id}-${htmlElement.tagName}-${htmlElement.className}`;
  }
  
  get(figmaNode, htmlElement) {
    const key = this.getCacheKey(figmaNode, htmlElement);
    return this.cache.get(key);
  }
  
  set(figmaNode, htmlElement, result) {
    const key = this.getCacheKey(figmaNode, htmlElement);
    this.cache.set(key, result);
  }
}
```

## 📊 Очікувані результати

### Точність співставлення
- **Текстові елементи:** 95-98%
- **Структурні елементи:** 85-90%
- **Стильові елементи:** 80-85%
- **Загальна точність:** 88-92%

### Продуктивність
- **Час обробки:** 2-5 секунд для макету середнього розміру
- **Використання пам'яті:** 50-100MB
- **Масштабованість:** до 1000 елементів

### Покриття
- **Автоматичне співставлення:** 85-90%
- **Ручна перевірка:** 10-15%
- **Пропущені елементи:** < 5%

Цей аналіз забезпечує основу для створення універсального механізму співставлення без хард-кодінгу, з високою точністю та масштабованістю.

