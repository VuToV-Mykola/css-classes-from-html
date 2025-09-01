#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building VSIX package for CSS Classes from HTML v0.0.6...');

try {
  // Перевіряємо наявність vsce
  try {
    execSync('npx vsce --version', { stdio: 'pipe' });
  } catch (error) {
    console.log('📦 Installing @vscode/vsce...');
    execSync('npm install -g @vscode/vsce', { stdio: 'inherit' });
  }

  // Очищуємо старі VSIX файли
  const vsixFiles = fs.readdirSync('.').filter(file => file.endsWith('.vsix'));
  vsixFiles.forEach(file => {
    fs.unlinkSync(file);
    console.log(`🗑️ Removed old VSIX: ${file}`);
  });

  // Перевіряємо package.json
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`📋 Package: ${packageJson.name} v${packageJson.version}`);

  // Збираємо VSIX
  console.log('🔨 Building VSIX package...');
  execSync('npx vsce package --no-dependencies', { stdio: 'inherit' });

  // Знаходимо створений VSIX файл
  const newVsixFiles = fs.readdirSync('.').filter(file => file.endsWith('.vsix'));
  if (newVsixFiles.length > 0) {
    const vsixFile = newVsixFiles[0];
    const stats = fs.statSync(vsixFile);
    const fileSizeKB = Math.round(stats.size / 1024);
    
    console.log(`✅ VSIX package created successfully!`);
    console.log(`📦 File: ${vsixFile}`);
    console.log(`📊 Size: ${fileSizeKB} KB`);
    console.log(`🎯 Ready for publication to VS Code Marketplace`);
  } else {
    throw new Error('VSIX file was not created');
  }

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}