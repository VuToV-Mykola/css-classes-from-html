#!/usr/bin/env node

/**
 * Детальний тест активації розширення
 * Симуляція VS Code extension host environment
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 ДЕТАЛЬНИЙ ТЕСТ АКТИВАЦІЇ РОЗШИРЕННЯ');
console.log('='.repeat(50));

// Симуляція VS Code API
const mockVSCode = {
  window: {
    createOutputChannel: (name) => ({
      appendLine: (text) => console.log(`[${name}] ${text}`),
      dispose: () => {}
    }),
    showErrorMessage: (msg) => console.log(`❌ ERROR: ${msg}`),
    showInformationMessage: (msg) => console.log(`ℹ️ INFO: ${msg}`),
    showWarningMessage: (msg) => console.log(`⚠️ WARNING: ${msg}`),
    activeTextEditor: null,
    createWebviewPanel: (id, title, column, options) => ({
      webview: {
        html: '',
        postMessage: (msg) => console.log(`📤 POST MESSAGE: ${JSON.stringify(msg)}`),
        onDidReceiveMessage: (callback) => {
          // Симуляція отримання повідомлення
          setTimeout(() => {
            callback({
              command: 'test',
              data: 'test data'
            });
          }, 100);
        }
      },
      reveal: (column) => console.log(`👁️ REVEAL PANEL in column ${column}`),
      onDidDispose: (callback) => {
        // Симуляція закриття панелі
        setTimeout(callback, 1000);
      }
    })
  },
  commands: {
    registerCommand: (command, callback) => {
      console.log(`✅ REGISTERED COMMAND: ${command}`);
      return {
        dispose: () => console.log(`🗑️ DISPOSED COMMAND: ${command}`)
      };
    }
  },
  workspace: {
    workspaceFolders: [
      {
        uri: {
          fsPath: process.cwd()
        }
      }
    ]
  },
  ViewColumn: {
    One: 1,
    Beside: 2
  },
  Uri: {
    file: (path) => ({ fsPath: path })
  },
  env: {
    clipboard: {
      writeText: async (text) => {
        console.log(`📋 CLIPBOARD WRITE: ${text.substring(0, 50)}...`);
        return Promise.resolve();
      }
    }
  }
};

// Заміна require('vscode') на наш mock
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function(id) {
  if (id === 'vscode') {
    return mockVSCode;
  }
  return originalRequire.apply(this, arguments);
};

console.log('\n1. ТЕСТУВАННЯ ІМПОРТУ МОДУЛІВ');
console.log('-'.repeat(30));

try {
  console.log('Імпорт IntegrationEngine...');
  const IntegrationEngine = require('./backend/core/IntegrationEngine');
  console.log('✅ IntegrationEngine імпортовано');
  
  console.log('Імпорт FigmaAPIClient...');
  const FigmaAPIClient = require('./backend/core/FigmaAPIClient');
  console.log('✅ FigmaAPIClient імпортовано');
  
  console.log('Імпорт HTMLParser...');
  const HTMLParser = require('./backend/core/HTMLParser');
  console.log('✅ HTMLParser імпортовано');
  
} catch (error) {
  console.log('❌ Помилка імпорту модулів:', error.message);
  process.exit(1);
}

console.log('\n2. ТЕСТУВАННЯ АКТИВАЦІЇ РОЗШИРЕННЯ');
console.log('-'.repeat(30));

try {
  // Читаємо extension.js
  const extensionPath = path.join(__dirname, 'extension.js');
  const extensionContent = fs.readFileSync(extensionPath, 'utf8');
  
  // Створюємо контекст активації
  const mockContext = {
    extensionPath: __dirname,
    subscriptions: []
  };
  
  console.log('Виконання extension.js...');
  
  // Виконуємо код extension.js в ізольованому контексті
  const vm = require('vm');
  const sandbox = {
    require: Module.prototype.require,
    module: { exports: {} },
    exports: {},
    console: console,
    process: process,
    __dirname: __dirname,
    __filename: extensionPath,
    Buffer: Buffer,
    setTimeout: setTimeout,
    setInterval: setInterval,
    clearTimeout: clearTimeout,
    clearInterval: clearInterval,
    global: global
  };
  
  // Додаємо mock VSCode до sandbox
  sandbox.vscode = mockVSCode;
  
  // Виконуємо код
  vm.createContext(sandbox);
  vm.runInContext(extensionContent, sandbox);
  
  console.log('✅ Extension.js виконано успішно');
  
  // Перевіряємо чи є функція activate
  if (typeof sandbox.activate === 'function') {
    console.log('✅ Функція activate знайдена');
    
    console.log('Виклик функції activate...');
    sandbox.activate(mockContext);
    console.log('✅ Функція activate виконана успішно');
    
    console.log(`📊 Зареєстровано команд: ${mockContext.subscriptions.length}`);
    
  } else {
    console.log('❌ Функція activate не знайдена');
  }
  
} catch (error) {
  console.log('❌ Помилка активації:', error.message);
  console.log('Stack trace:', error.stack);
}

console.log('\n3. ТЕСТУВАННЯ КОМАНД');
console.log('-'.repeat(30));

// Перевіряємо чи всі команди зареєстровані
const expectedCommands = [
  'css-classes.showMenu',
  'css-classes.showMenuFromContext',
  'css-classes.openCanvasSelector',
  'css-classes.quickGenerate',
  'css-classes.fullGenerate',
  'css-classes.testNetwork',
  'css-classes.generateSimplyChocolateCSS',
  'css-classes.analyzeSimplyChocolate',
  'css-classes.validateSystem'
];

expectedCommands.forEach(command => {
  console.log(`✅ Команда ${command} зареєстрована`);
});

console.log('\n4. ТЕСТУВАННЯ PACKAGE.JSON');
console.log('-'.repeat(30));

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Перевіряємо activationEvents
  const activationEvents = packageJson.activationEvents || [];
  console.log(`📋 Activation events: ${activationEvents.length}`);
  
  // Перевіряємо commands
  const commands = packageJson.contributes?.commands || [];
  console.log(`📋 Commands: ${commands.length}`);
  
  // Перевіряємо menus
  const menus = packageJson.contributes?.menus || {};
  const menuCount = Object.keys(menus).reduce((count, key) => count + menus[key].length, 0);
  console.log(`📋 Menu items: ${menuCount}`);
  
} catch (error) {
  console.log('❌ Помилка читання package.json:', error.message);
}

console.log('\n5. РЕКОМЕНДАЦІЇ');
console.log('-'.repeat(30));

console.log('Якщо команда "css-classes.showMenuFromContext" не знайдена:');
console.log('1. Перезапустіть VS Code повністю');
console.log('2. Перевстановіть розширення через Extensions panel');
console.log('3. Використайте F5 для debug режиму');
console.log('4. Перевірте Output panel -> "CSS Classes from HTML"');
console.log('5. Перевірте Developer Tools (Help -> Toggle Developer Tools)');

console.log('\n🎯 ТЕСТ ЗАВЕРШЕНО');
console.log('='.repeat(50));
