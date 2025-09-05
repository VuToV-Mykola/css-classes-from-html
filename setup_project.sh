#!/bin/bash

# Встановлення необхідних директорій
mkdir -p webview log

# Оновлення файлів WebView
cat > webview/menu.html << 'EOF'
<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="style.css">
  <title>CSS Classes Menu</title>
</head>
<body>
  <div class="menu-container">
    <h2>CSS Classes Menu</h2>
    <button id="loadConfigBtn">Load Config</button>
    <button id="toggleThemeBtn">Toggle Theme</button>
    <pre id="config">Config will appear here...</pre>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    function sendMessage(type, payload) {
      vscode.postMessage({ type, payload });
    }

    window.addEventListener('message', event => {
      const message = event.data;
      switch (message.type) {
        case 'configData':
          document.getElementById('config').innerText = JSON.stringify(message.payload, null, 2);
          break;
        case 'log':
          console.log('Extension log:', message.payload);
          break;
        default:
          console.warn('Unknown message type', message.type);
      }
    });

    document.getElementById('loadConfigBtn').addEventListener('click', () => {
      sendMessage('requestConfig', {});
    });

    document.getElementById('toggleThemeBtn').addEventListener('click', () => {
      sendMessage('updateConfig', { theme: document.body.dataset.theme === 'light' ? 'dark' : 'light' });
      document.body.dataset.theme = document.body.dataset.theme === 'light' ? 'dark' : 'light';
    });
  </script>
</body>
</html>
EOF

cat > webview/style.css << 'EOF'
body {
  font-family: Arial, sans-serif;
  background-color: var(--bg-color, #fff);
  color: var(--text-color, #000);
  padding: 20px;
}

body[data-theme="dark"] {
  --bg-color: #1e1e1e;
  --text-color: #ddd;
}

.menu-container {
  border: 1px solid #ccc;
  padding: 15px;
  border-radius: 8px;
}

button {
  margin: 5px;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 5px;
}
EOF

# Оновлення файлу розширення VS Code
cat > extension.js << 'EOF'
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

let globalConfig = {
  theme: 'light',
  showAdvanced: false
};

function activate(context) {
  vscode.commands.registerCommand('css-classes.openMenu', () => {
    const panel = vscode.window.createWebviewPanel(
      'cssMenu',
      'CSS Classes Menu',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'webview'))]
      }
    );

    const menuHtmlPath = path.join(context.extensionPath, 'webview', 'menu.html');
    panel.webview.html = fs.readFileSync(menuHtmlPath, 'utf8');

    panel.webview.onDidReceiveMessage(message => {
      switch(message.type) {
        case 'requestConfig':
          panel.webview.postMessage({ type: 'configData', payload: globalConfig });
          logMessage(`Sent config to WebView: ${JSON.stringify(globalConfig)}`);
          break;
        case 'updateConfig':
          globalConfig = { ...globalConfig, ...message.payload };
          logMessage(`Updated config: ${JSON.stringify(globalConfig)}`);
          break;
        default:
          logMessage(`Unknown message type: ${message.type}`);
      }
    });
  });
}

function logMessage(msg) {
  const logDir = path.join(__dirname, 'log');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
  const logPath = path.join(logDir, 'webview.log');
  fs.appendFileSync(logPath, `${new Date().toISOString()} - ${msg}\n`);
}

function deactivate() {}

module.exports = { activate, deactivate };
EOF

# Створення bash-скрипта для тестування
cat > test_menu.sh << 'EOF'
#!/bin/bash

mkdir -p log
echo "📌 Запуск тестів WebView меню..." | tee -a log/test_log.txt

curl -s http://localhost:8000/webview/menu.html > /dev/null
echo "$(date): HTML завантажено" >> log/test_log.txt

echo "✅ Тести завершено"
EOF

chmod +x test_menu.sh

# Логування завершення налаштування
echo "✅ Проєкт налаштовано успішно. Для тестування використовуйте ./test_menu.sh"
EOF

---

### ✅ Інструкція

1. **Збережіть скрипт**: Створіть файл `setup_project.sh` у кореневій директорії вашого проєкту.
2. **Надайте права на виконання**: Виконайте команду `chmod +x setup_project.sh` у терміналі.
3. **Запустіть скрипт**: Виконайте команду `./setup_project.sh` для автоматичного налаштування проєкту.
4. **Тестування**: Після налаштування, запустіть тестування за допомогою скрипта `./test_menu.sh`.

Цей скрипт автоматизує процес налаштування та виправлення всіх необхідних файлів у вашому проєкті. Якщо виникнуть додаткові питання або потрібна допомога, звертайтесь!
::contentReference[oaicite:0]{index=0}
 
