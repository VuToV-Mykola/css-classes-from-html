#!/usr/bin/env node

/**
 * Тест команд розширення через симуляцію VS Code API
 */

console.log('🧪 Тест команд CSS Classes from HTML...');

// Лічильник викликаних команд
let commandCalls = {};

// Симуляція webview
const mockWebviewPanel = {
  webview: {
    html: '',
    postMessage: (msg) => {
      console.log('📤 Message to webview:', JSON.stringify(msg, null, 2));
      
      // Симуляція відповіді від webview для команд генерації
      if (msg.command === 'initializeContext') {
        setTimeout(() => {
          console.log('📥 Simulating webview response: generateCSS');
          if (mockWebviewPanel.onDidReceiveMessage) {
            mockWebviewPanel.onDidReceiveMessage({
              command: 'generateCSS',
              mode: 'quick',
              htmlFile: msg.htmlFile
            });
          }
        }, 100);
      }
    },
    onDidReceiveMessage: null,
    asWebviewUri: (uri) => uri,
    cspSource: 'vscode-webview:'
  },
  onDidDispose: () => {},
  reveal: () => console.log('📋 Panel revealed'),
  dispose: () => console.log('❌ Panel disposed')
};

// Розширена симуляція vscode API 
const mockVscode = {
  window: {
    createOutputChannel: name => ({
      appendLine: msg => console.log(`[${name}] ${msg}`),
      show: () => console.log(`📺 Output channel shown: ${name}`),
      dispose: () => {}
    }),
    createWebviewPanel: (viewType, title, column, options) => {
      console.log(`🖼️ Creating webview panel: ${title}`);
      return mockWebviewPanel;
    },
    showErrorMessage: msg => console.log(`❌ ERROR: ${msg}`),
    showInformationMessage: msg => console.log(`ℹ️ INFO: ${msg}`),
    showWarningMessage: msg => console.log(`⚠️ WARNING: ${msg}`),
    showQuickPick: (items) => {
      console.log('📋 Quick pick items:', items);
      return Promise.resolve(items[0]); // вибираємо перший варіант
    },
    showOpenDialog: (options) => {
      console.log('📁 Open dialog:', options);
      return Promise.resolve([{fsPath: '/fake/test.html'}]);
    },
    activeTextEditor: {
      document: {
        languageId: 'html',
        uri: { fsPath: '/fake/test.html' }
      }
    }
  },
  commands: {
    registerCommand: (name, handler) => {
      console.log(`✅ Команда зареєстрована: ${name}`);
      commandCalls[name] = handler;
      return {dispose: () => {}};
    },
    executeCommand: async (name, ...args) => {
      console.log(`🚀 Виконання команди: ${name} з аргументами:`, args);
      if (commandCalls[name]) {
        try {
          await commandCalls[name](...args);
          console.log(`✅ Команда ${name} виконана успішно`);
        } catch (error) {
          console.log(`❌ Помилка виконання команди ${name}:`, error.message);
        }
      } else {
        console.log(`⚠️ Команда ${name} не знайдена`);
      }
    }
  },
  workspace: {
    workspaceFolders: [{ uri: { fsPath: '/fake/workspace' } }]
  },
  ViewColumn: { One: 1, Beside: 2 },
  Uri: {
    file: path => ({fsPath: path, scheme: 'file'}),
    parse: str => ({fsPath: str})
  },
  env: {
    language: 'uk'
  }
};

// Заміна require('vscode')
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function (id) {
  if (id === 'vscode') {
    return mockVscode;
  }
  return originalRequire.apply(this, arguments);
};

async function testExtension() {
  try {
    console.log('📦 Завантаження extension.js...');
    const extension = require('./extension.js');
    
    if (typeof extension.activate === 'function') {
      const mockContext = {
        extensionPath: __dirname,
        subscriptions: []
      };
      
      console.log('🚀 Активація розширення...');
      await extension.activate(mockContext);
      
      console.log('\n🧪 Тестування команд...');
      
      // Тест 1: Головне меню
      console.log('\n--- Тест 1: css-classes.showMenu ---');
      await mockVscode.commands.executeCommand('css-classes.showMenu');
      
      // Тест 2: Меню з контексту  
      console.log('\n--- Тест 2: css-classes.showMenuFromContext ---');
      await mockVscode.commands.executeCommand('css-classes.showMenuFromContext', 
        mockVscode.Uri.file('/test/index.html'));
      
      // Тест 3: Швидка генерація
      console.log('\n--- Тест 3: css-classes.quickGenerate ---');
      await mockVscode.commands.executeCommand('css-classes.quickGenerate',
        mockVscode.Uri.file('/test/index.html'));
      
      // Тест 4: Вибір файлу
      console.log('\n--- Тест 4: css-classes.selectHTMLFile ---');
      await mockVscode.commands.executeCommand('css-classes.selectHTMLFile');
      
      // Тест 5: Максимальна генерація
      console.log('\n--- Тест 5: css-classes.generateMaximalCSS ---');
      await mockVscode.commands.executeCommand('css-classes.generateMaximalCSS',
        mockVscode.Uri.file('/test/index.html'));
        
      console.log('\n✅ Всі тести завершені!');
      
    } else {
      console.log('❌ Функція activate не знайдена');
    }
  } catch (error) {
    console.error('❌ Помилка тестування:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Запуск тестів
testExtension();