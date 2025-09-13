
const { logger } = require('../backend/utils/Logger');
logger.start('Запуск інтеграційного тесту');

// Test HTML Parser
try {
  const HTMLParser = require('../backend/core/HTMLParser');
  const parser = new HTMLParser();
    
  const testHTML = `
    <div class="container">
        <header class="header">
            <h1 class="title">Test Title</h1>
        </header>
        <main class="main-content">
            <section class="hero-section">
                <h2 class="hero-title">Hero Title</h2>
                <button class="btn btn-primary">Click Me</button>
            </section>
        </main>
    </div>`;
    
  const result = parser.parseToHierarchy(testHTML);
    
  if (!result.hierarchy || result.hierarchy.size === 0) {
    throw new Error('HTML parsing failed - no elements found');
  }
    
  logger.success(`HTML Parser: ${result.hierarchy.size} елементів розпарсено`);
    
  if (!result.classMap || result.classMap.size === 0) {
    throw new Error('No CSS classes found');
  }
    
  logger.success(`Витягування класів: ${result.classMap.size} класів знайдено`);
    
} catch (error) {
  logger.error('Інтеграційний тест не пройшов', error.message);
  process.exit(1);
}

// Test CSS Generator
try {
  const SmartCSSGenerator = require('../backend/generators/SmartCSSGenerator');
  const generator = new SmartCSSGenerator({
    mode: 'minimal',
    includeComments: true
  });
    
  // Mock data for testing
  const figmaData = { hierarchy: new Map() };
  const htmlData = { 
    hierarchy: new Map([
      ['test1', { classes: ['container'] }],
      ['test2', { classes: ['title'] }]
    ])
  };
  const matches = new Map();
    
  const css = generator.generateCSS(figmaData, htmlData, matches);
    
  if (!css || css.length === 0) {
    throw new Error('CSS generation failed - no output');
  }
    
  logger.success(`CSS Generator: ${css.length} символів згенеровано`);
    
  if (!css.includes('.container') || !css.includes('.title')) {
    throw new Error('CSS generation failed - missing expected classes');
  }
    
  logger.success('CSS класи правильно згенеровано');
    
} catch (error) {
  logger.error('CSS генерація не пройшла', error.message);
  process.exit(1);
}

logger.complete('Інтеграційний тест успішно завершено!');
