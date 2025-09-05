/* frontend/configurationManager.js
   Збереження/завантаження останньої конфігурації у .vscode/css-classes-config.json
   Використовується і з extension.js і з webview (через postMessage)
*/
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(process.cwd(), '.vscode', 'css-classes-config.json');

function ensureDir() {
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function saveConfig(config) {
  try {
    ensureDir();
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (e) {
    return false;
  }
}

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
      return JSON.parse(raw);
    }
    return null;
  } catch (e) {
    return null;
  }
}

module.exports = { saveConfig, loadConfig, CONFIG_PATH };
