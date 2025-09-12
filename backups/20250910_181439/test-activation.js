// Тест активації розширення CSS Classes from HTML
const fs = require('fs');
const path = require('path');

console.log('🧪 Тестування активації CSS Classes from HTML...\n');

// Перевірка основних файлів
const checks = [
  { name: 'package.json', path: './package.json' },
  { name: 'extension.js', path: './extension.js' },  
  { name: 'HTML Menu', path: './frontend/css-classes-from-html-menu.html' },
  { name: 'FigmaAPIClient', path: './backend/core/FigmaAPIClient.js' },
  { name: 'HTMLParser', path: './backend/core/HTMLParser.js' },
  { name: 'IntegrationEngine', path: './backend/core/IntegrationEngine.js' }
];

console.log('📁 Перевірка файлової структури:');
checks.forEach(check => {
  const exists = fs.existsSync(check.path);
  console.log(`${exists ? '✅' : '❌'} ${check.name}: ${exists ? 'Існує' : 'Відсутній'}`);
  
  if (exists && check.path.endsWith('.js')) {
    try {
      require(check.path);
      console.log('   📦 Модуль завантажується успішно');
    } catch (err) {
      console.log(`   ❌ Помилка завантаження: ${err.message}`);
    }
  }
});

console.log('\n🔧 Перевірка package.json:');
try {
  const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  console.log(`✅ Назва: ${pkg.name}`);
  console.log(`✅ Версія: ${pkg.version}`);
  console.log(`✅ Головний файл: ${pkg.main}`);
  console.log(`✅ Команди: ${Object.keys(pkg.contributes?.commands || {}).length}`);
} catch (err) {
  console.log(`❌ Помилка читання package.json: ${err.message}`);
}

console.log('\n📄 Перевірка HTML файлу:');
try {
  const htmlPath = './frontend/css-classes-from-html-menu.html';
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  console.log(`✅ Розмір HTML: ${htmlContent.length} символів`);
  console.log(`✅ Містить <script>: ${htmlContent.includes('<script>')}`);
  console.log(`✅ Містить vscode.postMessage: ${htmlContent.includes('vscode.postMessage')}`);
  console.log(`✅ Містить onclick: ${htmlContent.includes('onclick=')}`);
} catch (err) {
  console.log(`❌ Помилка читання HTML: ${err.message}`);
}

console.log('\n🎯 Висновок:');
console.log('Якщо всі перевірки пройшли успішно, проблема може бути в:');
console.log('1. VS Code не може активувати розширення (перевірте Output Channel)');
console.log('2. Webview не може завантажити HTML (CSP проблеми)'); 
console.log('3. JavaScript код в HTML має помилки виконання');
console.log('4. Повідомлення між extension.js та HTML не проходять');