/**
 * 🔍 Детальний тест реєстрації команд розширення
 * Автор: AI Assistant
 * Дата: $(date '+%Y-%m-%d %H:%M:%S')
 */

console.log('🔍 Детальний тест реєстрації команд розширення...');

// Тест 1: Перевірка синтаксису extension.js
console.log('\n1. Перевірка синтаксису extension.js...');
try {
  const fs = require('fs');
  const extensionContent = fs.readFileSync('./extension.js', 'utf8');

  // Перевірка наявності ключових елементів
  const hasActivate = extensionContent.includes('function activate(');
  const hasDeactivate = extensionContent.includes('function deactivate(');
  const hasModuleExports = extensionContent.includes('module.exports = {');
  const hasShowMenuFromContext = extensionContent.includes('css-classes.showMenuFromContext');

  console.log(`✅ function activate: ${hasActivate}`);
  console.log(`✅ function deactivate: ${hasDeactivate}`);
  console.log(`✅ module.exports: ${hasModuleExports}`);
  console.log(`✅ css-classes.showMenuFromContext: ${hasShowMenuFromContext}`);

  if (hasActivate && hasDeactivate && hasModuleExports && hasShowMenuFromContext) {
    console.log('✅ Синтаксис extension.js правильний');
  } else {
    console.log('❌ Проблеми з синтаксисом extension.js');
  }
} catch (error) {
  console.error('❌ Помилка читання extension.js:', error.message);
}

// Тест 2: Перевірка package.json
console.log('\n2. Перевірка package.json...');
try {
  const packageJson = require('../package.json');

  // Перевірка основних полів
  const hasMain = packageJson.main === './extension.js';
  const hasActivationEvents =
    packageJson.activationEvents &&
    packageJson.activationEvents.includes('onCommand:css-classes.showMenuFromContext');
  const hasCommands =
    packageJson.contributes &&
    packageJson.contributes.commands &&
    packageJson.contributes.commands.some(cmd => cmd.command === 'css-classes.showMenuFromContext');

  console.log(`✅ main: ${hasMain} (${packageJson.main})`);
  console.log(`✅ activationEvents: ${hasActivationEvents}`);
  console.log(`✅ commands: ${hasCommands}`);

  if (hasMain && hasActivationEvents && hasCommands) {
    console.log('✅ package.json налаштований правильно');
  } else {
    console.log('❌ Проблеми з package.json');
  }
} catch (error) {
  console.error('❌ Помилка читання package.json:', error.message);
}

// Тест 3: Перевірка backend модулів
console.log('\n3. Перевірка backend модулів...');
try {
  const IntegrationEngine = require('../backend/core/IntegrationEngine');
  console.log('✅ IntegrationEngine завантажено');
} catch (error) {
  console.error('❌ Помилка завантаження IntegrationEngine:', error.message);
}

try {
  const FigmaAPIClient = require('../backend/core/FigmaAPIClient');
  console.log('✅ FigmaAPIClient завантажено');
} catch (error) {
  console.error('❌ Помилка завантаження FigmaAPIClient:', error.message);
}

try {
  const HTMLParser = require('../backend/core/HTMLParser');
  console.log('✅ HTMLParser завантажено');
} catch (error) {
  console.error('❌ Помилка завантаження HTMLParser:', error.message);
}

// Тест 4: Перевірка залежностей
console.log('\n4. Перевірка залежностей...');
try {
  const jsdom = require('jsdom');
  console.log('✅ jsdom завантажено');
} catch (error) {
  console.error('❌ Помилка завантаження jsdom:', error.message);
}

// Тест 5: Перевірка VS Code API
console.log('\n5. Перевірка VS Code API...');
try {
  const vscode = require('vscode');
  console.log('✅ vscode модуль завантажено');
  console.log(`   Версія: ${vscode.version || 'не визначено'}`);
} catch (error) {
  console.error('❌ Помилка завантаження vscode:', error.message);
}

// Тест 6: Перевірка структури команд
console.log('\n6. Перевірка структури команд...');
try {
  const packageJson = require('../package.json');
  const commands = packageJson.contributes.commands;

  console.log(`📊 Загальна кількість команд: ${commands.length}`);

  const requiredCommands = [
    'css-classes.showMenu',
    'css-classes.showMenuFromContext',
    'css-classes.openCanvasSelector',
    'css-classes.quickGenerate',
    'css-classes.fullGenerate',
    'css-classes.testNetwork'
  ];

  requiredCommands.forEach(cmd => {
    const found = commands.find(c => c.command === cmd);
    if (found) {
      console.log(`✅ ${cmd}: ${found.title}`);
    } else {
      console.log(`❌ ${cmd}: НЕ ЗНАЙДЕНО`);
    }
  });
} catch (error) {
  console.error('❌ Помилка перевірки команд:', error.message);
}

// Тест 7: Перевірка меню
console.log('\n7. Перевірка меню...');
try {
  const packageJson = require('../package.json');
  const menus = packageJson.contributes.menus;

  if (menus) {
    console.log('✅ Меню налаштовані:');
    Object.keys(menus).forEach(menuType => {
      console.log(`   - ${menuType}: ${menus[menuType].length} елементів`);
    });
  } else {
    console.log('❌ Меню не налаштовані');
  }
} catch (error) {
  console.error('❌ Помилка перевірки меню:', error.message);
}

console.log('\n🏁 Тестування завершено');
