#!/usr/bin/env node

// Скрипт для перезавантаження розширення
const { execSync } = require('child_process');

console.log('🔄 Перезавантаження розширення...');

try {
  // Перебудова VSIX
  console.log('📦 Створення нового VSIX...');
  execSync('node build-vsix.js', { stdio: 'inherit' });
  
  console.log('✅ Розширення готове до тестування');
  console.log('');
  console.log('🔧 Для вирішення проблеми:');
  console.log('1. Перезавантажте VS Code повністю');
  console.log('2. Відкрийте HTML файл');
  console.log('3. Натисніть Ctrl+Shift+P');
  console.log('4. Введіть "Generate CSS from HTML"');
  
} catch (error) {
  console.error('❌ Помилка:', error.message);
}