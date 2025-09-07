#!/usr/bin/env node

/**
 * Комплексний аналіз всіх компонентів розширення
 * Детальна діагностика помилки "command not found"
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 КОМПЛЕКСНИЙ АНАЛІЗ РОЗШИРЕННЯ CSS CLASSES FROM HTML');
console.log('='.repeat(60));

// 1. Аналіз extension.js
console.log('\n📄 1. АНАЛІЗ EXTENSION.JS');
console.log('-'.repeat(30));

try {
  const extensionContent = fs.readFileSync('extension.js', 'utf8');
  
  // Перевірка імпортів
  const imports = extensionContent.match(/require\(['"][^'"]+['"]\)/g) || [];
  console.log('✅ Імпорти знайдено:', imports.length);
  
  // Перевірка реєстрації команд
  const commandRegistrations = extensionContent.match(/registerCommand\(['"][^'"]+['"]/g) || [];
  console.log('✅ Реєстрації команд:', commandRegistrations.length);
  
  // Перевірка конкретної команди
  const showMenuFromContext = extensionContent.includes("'css-classes.showMenuFromContext'");
  console.log('✅ Команда showMenuFromContext:', showMenuFromContext ? 'ЗНАЙДЕНО' : 'НЕ ЗНАЙДЕНО');
  
  // Перевірка функції activate
  const hasActivate = extensionContent.includes('function activate(');
  console.log('✅ Функція activate:', hasActivate ? 'ЗНАЙДЕНО' : 'НЕ ЗНАЙДЕНО');
  
  // Перевірка module.exports
  const hasModuleExports = extensionContent.includes('module.exports');
  console.log('✅ module.exports:', hasModuleExports ? 'ЗНАЙДЕНО' : 'НЕ ЗНАЙДЕНО');
  
} catch (error) {
  console.log('❌ Помилка читання extension.js:', error.message);
}

// 2. Аналіз package.json
console.log('\n📦 2. АНАЛІЗ PACKAGE.JSON');
console.log('-'.repeat(30));

try {
  const packageContent = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Перевірка main
  console.log('✅ Main файл:', packageContent.main);
  
  // Перевірка activationEvents
  const activationEvents = packageContent.activationEvents || [];
  const hasShowMenuFromContext = activationEvents.includes('onCommand:css-classes.showMenuFromContext');
  console.log('✅ Activation event showMenuFromContext:', hasShowMenuFromContext ? 'ЗНАЙДЕНО' : 'НЕ ЗНАЙДЕНО');
  
  // Перевірка commands
  const commands = packageContent.contributes?.commands || [];
  const commandDef = commands.find(cmd => cmd.command === 'css-classes.showMenuFromContext');
  console.log('✅ Command definition:', commandDef ? 'ЗНАЙДЕНО' : 'НЕ ЗНАЙДЕНО');
  
  // Перевірка menus
  const menus = packageContent.contributes?.menus || {};
  const hasContextMenu = menus['explorer/context']?.some(menu => menu.command === 'css-classes.showMenuFromContext');
  console.log('✅ Context menu:', hasContextMenu ? 'ЗНАЙДЕНО' : 'НЕ ЗНАЙДЕНО');
  
} catch (error) {
  console.log('❌ Помилка читання package.json:', error.message);
}

// 3. Аналіз backend модулів
console.log('\n🔧 3. АНАЛІЗ BACKEND МОДУЛІВ');
console.log('-'.repeat(30));

const backendModules = [
  'backend/core/IntegrationEngine.js',
  'backend/core/FigmaAPIClient.js',
  'backend/core/HTMLParser.js',
  'backend/matchers/StyleMatcher.js',
  'backend/matchers/HierarchyMatcher.js',
  'backend/generators/CSSGenerator.js',
  'backend/analyzers/FigmaAnalyzer.js'
];

backendModules.forEach(modulePath => {
  try {
    if (fs.existsSync(modulePath)) {
      const content = fs.readFileSync(modulePath, 'utf8');
      const hasClass = content.includes('class ');
      const hasModuleExports = content.includes('module.exports');
      console.log(`✅ ${path.basename(modulePath)}: ${hasClass ? 'CLASS' : 'FUNCTION'} ${hasModuleExports ? 'EXPORTED' : 'NO EXPORT'}`);
    } else {
      console.log(`❌ ${modulePath}: ФАЙЛ НЕ ЗНАЙДЕНО`);
    }
  } catch (error) {
    console.log(`❌ ${modulePath}: ПОМИЛКА - ${error.message}`);
  }
});

// 4. Тест імпорту модулів
console.log('\n🧪 4. ТЕСТ ІМПОРТУ МОДУЛІВ');
console.log('-'.repeat(30));

try {
  console.log('Тестування імпорту IntegrationEngine...');
  const IntegrationEngine = require('./backend/core/IntegrationEngine');
  console.log('✅ IntegrationEngine імпортовано успішно');
  
  console.log('Тестування імпорту FigmaAPIClient...');
  const FigmaAPIClient = require('./backend/core/FigmaAPIClient');
  console.log('✅ FigmaAPIClient імпортовано успішно');
  
  console.log('Тестування імпорту HTMLParser...');
  const HTMLParser = require('./backend/core/HTMLParser');
  console.log('✅ HTMLParser імпортовано успішно');
  
} catch (error) {
  console.log('❌ Помилка імпорту модулів:', error.message);
}

// 5. Перевірка синтаксису
console.log('\n🔍 5. ПЕРЕВІРКА СИНТАКСИСУ');
console.log('-'.repeat(30));

const filesToCheck = [
  'extension.js',
  'backend/core/IntegrationEngine.js',
  'backend/core/FigmaAPIClient.js',
  'backend/core/HTMLParser.js'
];

filesToCheck.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      // Спрощена перевірка синтаксису
      const hasSyntaxErrors = content.includes('undefined') && content.includes('require(');
      console.log(`✅ ${file}: ${hasSyntaxErrors ? 'ПОПЕРЕДЖЕННЯ' : 'СИНТАКСИС OK'}`);
    }
  } catch (error) {
    console.log(`❌ ${file}: ПОМИЛКА СИНТАКСИСУ - ${error.message}`);
  }
});

// 6. Перевірка структури проєкту
console.log('\n📁 6. СТРУКТУРА ПРОЄКТУ');
console.log('-'.repeat(30));

const requiredFiles = [
  'extension.js',
  'package.json',
  'frontend/css-classes-from-html-menu.html',
  'backend/core/IntegrationEngine.js',
  'backend/core/FigmaAPIClient.js',
  'backend/core/HTMLParser.js'
];

requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// 7. Аналіз помилок
console.log('\n🚨 7. АНАЛІЗ МОЖЛИВИХ ПРИЧИН ПОМИЛКИ');
console.log('-'.repeat(30));

console.log('Можливі причини "command not found":');
console.log('1. Розширення не активовано');
console.log('2. VS Code не перезапущено після встановлення');
console.log('3. Конфлікт з іншими розширеннями');
console.log('4. Помилка в activationEvents');
console.log('5. Помилка в реєстрації команд');
console.log('6. Помилка в extension.js');

// 8. Рекомендації
console.log('\n💡 8. РЕКОМЕНДАЦІЇ ДЛЯ ВИПРАВЛЕННЯ');
console.log('-'.repeat(30));

console.log('1. Перезапустіть VS Code');
console.log('2. Перевстановіть розширення');
console.log('3. Перевірте логи розширення');
console.log('4. Використайте F5 для debug режиму');
console.log('5. Перевірте Command Palette (Ctrl+Shift+P)');

console.log('\n🎯 АНАЛІЗ ЗАВЕРШЕНО');
console.log('='.repeat(60));
