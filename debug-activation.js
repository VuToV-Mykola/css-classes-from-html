#!/usr/bin/env node

/**
 * Тест активації розширення з детальним логуванням
 */

console.log('🔧 Детальний тест активації розширення...');

// Симуляція vscode API з детальним логуванням
const mockVscode = {
  window: {
    createOutputChannel: (name) => ({
      appendLine: (msg) => console.log(`[${name}] ${msg}`),
      dispose: () => {}
    }),
    showErrorMessage: (msg) => console.log(`ERROR: ${msg}`),
    showInformationMessage: (msg) => console.log(`INFO: ${msg}`),
    showWarningMessage: (msg) => console.log(`WARNING: ${msg}`),
    activeTextEditor: null
  },
  commands: {
    registerCommand: (name, handler) => {
      console.log(`✅ Команда зареєстрована: ${name}`);
      if (name === 'css-classes.showMenuFromContext') {
        console.log(`   🎯 ЦЕ ТА КОМАНДА! Обробник:`, typeof handler);
      }
      return { dispose: () => {} };
    }
  },
  workspace: {
    workspaceFolders: null
  },
  ViewColumn: {
    One: 1,
    Beside: 2
  },
  Uri: {
    file: (path) => ({ fsPath: path })
  }
};

// Заміна require('vscode')
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function(id) {
  if (id === 'vscode') {
    return mockVscode;
  }
  return originalRequire.apply(this, arguments);
};

try {
  console.log('📦 Завантаження extension.js...');
  const extension = require('./extension.js');
  console.log('✅ extension.js завантажено успішно');
  
  if (typeof extension.activate === 'function') {
    console.log('✅ Функція activate знайдена');
    
    const mockContext = {
      extensionPath: __dirname,
      subscriptions: []
    };
    
    console.log('🚀 Симуляція активації...');
    extension.activate(mockContext);
    console.log('✅ Активація завершена успішно');
    
    // Перевірка чи є команда в експорті
    if (extension.css-classes && extension['css-classes.showMenuFromContext']) {
      console.log('✅ Команда знайдена в експорті');
    } else {
      console.log('⚠️ Команда не знайдена в експорті');
    }
    
  } else {
    console.log('❌ Функція activate не знайдена');
  }
  
} catch (error) {
  console.error('❌ Помилка активації:', error.message);
  console.error('Stack trace:', error.stack);
}