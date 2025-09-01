#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Підготовка до створення VSIX...');

// Перевіряємо наявність vsce
try {
  execSync('vsce --version', { stdio: 'ignore' });
} catch (error) {
  console.log('📦 Встановлюємо vsce...');
  execSync('npm install -g vsce', { stdio: 'inherit' });
}

// Читаємо package.json для отримання версії
let packageJson, version;
try {
  packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  version = packageJson.version;
} catch (error) {
  console.error('Помилка читання package.json:', encodeURIComponent(error.message));
  process.exit(1);
}

console.log(`📋 Створюємо VSIX для версії ${version}...`);

try {
  // Створюємо VSIX файл
  execSync('vsce package', { stdio: 'inherit' });
  
  const vsixFile = `css-classes-from-html-${version}.vsix`;
  
  if (fs.existsSync(vsixFile)) {
    console.log(`✅ VSIX файл створено: ${vsixFile}`);
    
    // Показуємо розмір файлу
    const stats = fs.statSync(vsixFile);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`📦 Розмір файлу: ${fileSizeInMB} MB`);
    
    console.log('\n🎯 Готово до публікації!');
    console.log(`\n📝 Для публікації виконайте:`);
    console.log(`   vsce publish`);
    console.log(`\n📦 Або встановіть локально:`);
    console.log(`   code --install-extension ${vsixFile}`);
  } else {
    console.error('❌ VSIX файл не створено');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Помилка створення VSIX:', encodeURIComponent(error.message));
  process.exit(1);
}