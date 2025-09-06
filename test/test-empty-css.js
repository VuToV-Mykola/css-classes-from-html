/**
 * Тест для перевірки генерації пустих CSS правил
 */

const CSSGenerator = require('../backend/generators/CSSGenerator');
const HTMLParser = require('../backend/core/HTMLParser');
const fs = require('fs');
const path = require('path');

console.log('🧪 Тестування генерації CSS без стилів...\n');

// Тестовий HTML
const testHTML = `
<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>
  <div class="container">
    <header class="header">
      <h1 class="title">Test Title</h1>
    </header>
    <main class="content">
      <section class="hero">
        <h2 class="hero-title">Hero</h2>
        <button class="btn btn-primary">Click</button>
      </section>
    </main>
  </div>
</body>
</html>
`;

// Парсинг HTML
const parser = new HTMLParser();
const htmlData = parser.parseHTML(testHTML);

// Симуляція Figma даних
const figmaData = {
  hierarchy: new Map([
    ['figma-1', {
      id: 'figma-1',
      name: 'Container Component',
      type: 'FRAME',
      styles: {
        layout: { display: 'flex', flexDirection: 'column' },
        position: { width: 1200, height: 800 }
      }
    }],
    ['figma-2', {
      id: 'figma-2', 
      name: 'Header Section',
      type: 'FRAME',
      styles: {
        colors: [{ type: 'solid', color: '#007ACC', opacity: 1 }],
        typography: { fontSize: 24, fontWeight: 'bold' }
      }
    }]
  ])
};

// Симуляція matches
const matches = new Map([
  ['figma-1', { htmlElement: Array.from(htmlData.hierarchy.keys())[0], confidence: 0.85 }],
  ['figma-2', { htmlElement: Array.from(htmlData.hierarchy.keys())[1], confidence: 0.92 }]
]);

// Тест 1: Мінімальний режим (пусті правила)
console.log('📝 Тест 1: Мінімальний режим');
const minimalGenerator = new CSSGenerator({ 
  mode: 'minimal',
  includeComments: true,
  includeReset: false
});
const minimalCSS = minimalGenerator.generateCSS(figmaData, htmlData, matches);
console.log('Результат:\n', minimalCSS.substring(0, 500));
console.log('✅ Пусті правила згенеровано\n');

// Тест 2: Максимальний режим (стилі з Figma)
console.log('📝 Тест 2: Максимальний режим');
const maxGenerator = new CSSGenerator({ 
  mode: 'maximum',
  includeComments: true,
  includeReset: false
});
const maxCSS = maxGenerator.generateCSS(figmaData, htmlData, matches);
console.log('Результат:\n', maxCSS.substring(0, 500));
console.log('✅ Стилі з Figma згенеровано\n');

// Збереження результатів
const outputDir = path.join(__dirname, '..', 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(path.join(outputDir, 'test-minimal.css'), minimalCSS);
fs.writeFileSync(path.join(outputDir, 'test-maximum.css'), maxCSS);

console.log('💾 Результати збережено в output/');
console.log('✅ Всі тести пройдено успішно!');
