#!/usr/bin/env node

/**
 * Скрипт для очищення console.log з backend файлів
 * Замінює всі console.log на відповідні logger методи
 */

const fs = require('fs');
const path = require('path');
const { logger } = require('../backend/utils/Logger');

// Файли для обробки
const backendFiles = [
  'backend/matchers/UniversalMatchingEngine.js',
  'backend/generators/HierarchicalCSSGenerator.js',
  'backend/matchers/HierarchicalMatchingEngine.js',
  'backend/generators/AdvancedCSSGenerator.js',
  'backend/generators/SmartCSSGenerator.js',
  'backend/generators/EnhancedCSSGenerator.js',
  'backend/matchers/AdvancedMatchingEngine.js',
  'backend/utils/ViewportManager.js',
  'backend/utils/ImageImporter.js',
  'backend/core/AdvancedHTMLParser.js',
  'backend/core/FigmaAPIClient.js',
  'backend/analyzers/FigmaAnalyzer.js'
];

// Функція для заміни console.log на logger
function replaceConsoleLogs(content, filePath) {
  let updated = false;
  
  // Додаємо import logger якщо його немає
  if (!content.includes("require('./Logger')") && !content.includes("require('../utils/Logger')")) {
    const relativePath = filePath.includes('utils/') ? './Logger' : '../utils/Logger';
    content = `const { logger } = require('${relativePath}');\n${content}`;
    updated = true;
  }
  
  // Замінюємо console.log
  if (content.includes('console.log')) {
    content = content.replace(/console\.log\(/g, 'logger.info(');
    updated = true;
  }
  
  // Замінюємо console.error
  if (content.includes('console.error')) {
    content = content.replace(/console\.error\(/g, 'logger.error(');
    updated = true;
  }
  
  // Замінюємо console.warn
  if (content.includes('console.warn')) {
    content = content.replace(/console\.warn\(/g, 'logger.warn(');
    updated = true;
  }
  
  return { content, updated };
}

// Обробка файлів
let processedFiles = 0;
let updatedFiles = 0;

console.log('🧹 Очищення console.log з backend файлів...');

backendFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (fs.existsSync(fullPath)) {
    try {
      let content = fs.readFileSync(fullPath, 'utf8');
      const result = replaceConsoleLogs(content, filePath);
      
      if (result.updated) {
        fs.writeFileSync(fullPath, result.content, 'utf8');
        console.log(`✅ Оновлено: ${filePath}`);
        updatedFiles++;
      } else {
        console.log(`⏭️  Пропущено: ${filePath} (немає console.log)`);
      }
      
      processedFiles++;
    } catch (error) {
      console.error(`❌ Помилка обробки ${filePath}:`, error.message);
    }
  } else {
    console.warn(`⚠️  Файл не знайдено: ${filePath}`);
  }
});

console.log(`\n📊 Результат: оброблено ${processedFiles} файлів, оновлено ${updatedFiles} файлів`);
console.log('✅ Очищення console.log завершено!');
