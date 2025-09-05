/* extension.js
   VSCode extension entry — обробка WebView для canvas-selector, збереження lastConfig, виклики FigmaAPIClient
*/
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const FigmaAPIClient = require('./core/FigmaAPIClient');
const cfgManager = require('./frontend/configurationManager');

let panel = null;
let globalContext = null;

function activate(context) {
  globalContext = context;

  context.subscriptions.push(
    vscode.commands.registerCommand('css-classes.openCanvasSelector', () => {
      openCanvasSelector();
    })
  );

  // status bar command shortcut
  context.subscriptions.push(
    vscode.commands.registerCommand('css-classes.showMenu', async () => {
      // open quick pick with option to open canvas selector
      const chosen = await vscode.window.showQuickPick([
        { label: '⚡ Quick Generate (Minimal)', mode: 'minimal' },
        { label: '🚀 Open Canvas & Layers Selector', mode: 'selector' },
        { label: '📦 Production Generate', mode: 'production' }
      ], { placeHolder: 'Select action' });
      if (!chosen) return;
      if (chosen.mode === 'selector') {
        openCanvasSelector();
      } else {
        vscode.window.showInformationMessage('Selected: ' + chosen.label);
      }
    })
  );

  // register message-based activation from other commands
  console.log('✅ extension activated');
}

function deactivate() {
  if (panel) panel.dispose();
}

// Відкриваємо WebView
function openCanvasSelector() {
  if (panel) {
    panel.reveal(vscode.ViewColumn.One);
    return;
  }

  panel = vscode.window.createWebviewPanel(
    'cssClassesSelector',
    'Canvas & Layers Selector',
    vscode.ViewColumn.One,
    { enableScripts: true, retainContextWhenHidden: true }
  );

  const htmlPath = path.join(__dirname, 'frontend', 'canvas-selector.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  panel.webview.html = html;

  // Обробляємо повідомлення з WebView
  panel.webview.onDidReceiveMessage(async (message) => {
    try {
      switch (message.command) {
        case 'getFigmaCanvases': {
          const { figmaLink, figmaToken } = message;
          try {
            const figmaKey = extractFigmaKey(figmaLink);
            if (!figmaKey) throw new Error('Invalid Figma link');
            const client = new FigmaAPIClient(figmaToken || process.env.FIGMA_API_TOKEN);
            const canvases = await client.getCanvases(figmaKey);
            panel.webview.postMessage({ command: 'figmaCanvases', canvases });
          } catch (err) {
            panel.webview.postMessage({ command: 'error', message: err.message });
          }
          break;
        }
        case 'getFigmaLayers': {
          const { figmaLink, figmaToken, canvasIds } = message;
          try {
            const figmaKey = extractFigmaKey(figmaLink || (cfgManager.loadConfig() || {}).figmaLink);
            if (!figmaKey) throw new Error('Invalid Figma link');
            const client = new FigmaAPIClient(figmaToken || process.env.FIGMA_API_TOKEN);
            const layers = await client.getLayers(figmaKey, canvasIds || []);
            panel.webview.postMessage({ command: 'figmaLayers', layers });
          } catch (err) {
            panel.webview.postMessage({ command: 'error', message: err.message });
          }
          break;
        }
        case 'saveLastConfig': {
          const success = cfgManager.saveConfig(message.config || {});
          panel.webview.postMessage({ command: 'lastConfigSaved', success });
          break;
        }
        case 'loadLastConfig': {
          const cfg = cfgManager.loadConfig() || {};
          panel.webview.postMessage({ command: 'lastConfigLoaded', config: cfg });
          break;
        }
        case 'generateFromSelection': {
          // згенерувати CSS — тут просто лог, реальна генерація викликає main.js або інші модулі
          const cfg = message;
          // збережемо конфіг у .vscode
          cfgManager.saveConfig(cfg);
          vscode.window.showInformationMessage('Generation requested — перевірте output channel');
          // TODO: викликати реальну генерацію або послати повідомлення у main.js
          break;
        }
      }
    } catch (e) {
      panel.webview.postMessage({ command: 'error', message: e.message });
    }
  }, undefined);

  // коли webview закривається
  panel.onDidDispose(() => { panel = null; }, null);

  // при відкритті — надіслати останній конфіг, якщо є
  const last = cfgManager.loadConfig();
  if (last) {
    panel.webview.postMessage({ command: 'lastConfigLoaded', config: last });
  }
}

// Витягувати ключ з посилання
function extractFigmaKey(url) {
  if (!url || typeof url !== 'string') return null;
  const m = url.match(/file\/([a-zA-Z0-9_-]+)(?:\/|$|\?)/);
  return m ? m[1] : null;
}

module.exports = { activate, deactivate };
