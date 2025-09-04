/**
 * VSCode Extension: CSS Classes from HTML with Figma Integration
 * @version 2.0.0
 * @author Ukrainian Developer
 */

const vscode = require("vscode");
const path = require("path");
const fs = require("fs").promises;

// Імпорт модулів
const FigmaAPIClient = require("./core/FigmaAPIClient");
const HTMLParser = require("./core/HTMLParser");
const StyleMatcher = require("./core/StyleMatcher");
const CSSGenerator = require("./core/CSSGenerator");
const ConfigurationManager = require("./frontend/configurationManager");

// Глобальні змінні
let statusBarItem;
let outputChannel;
let webviewPanel = undefined;

/**
 * Активація розширення
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log("✅ CSS Classes from HTML Extension активовано!");

  // Ініціалізація Output Channel
  outputChannel = vscode.window.createOutputChannel("CSS Classes Generator");

  // Створення StatusBar
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.command = "css-classes.showMenu";
  statusBarItem.text = "$(symbol-color) CSS Classes";
  statusBarItem.tooltip = "Генерація CSS з HTML та Figma";
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Реєстрація команд
  registerCommands(context);

  // Автоактивація при відкритті HTML
  vscode.workspace.onDidOpenTextDocument((document) => {
    if (document.languageId === "html") {
      statusBarItem.text = "$(symbol-color) CSS Ready";
    }
  });
}

/**
 * Реєстрація всіх команд розширення
 */
function registerCommands(context) {
  // Головна команда - показ меню
  const showMenu = vscode.commands.registerCommand(
    "css-classes.showMenu",
    async () => {
      const items = [
        {
          label: "$(zap) Швидка генерація",
          description: "Тільки HTML парсинг",
          action: "quick",
        },
        {
          label: "$(rocket) Повна генерація",
          description: "HTML + Figma інтеграція",
          action: "full",
        },
        {
          label: "$(gear) Налаштування",
          description: "Відкрити панель конфігурації",
          action: "config",
        },
        {
          label: "$(history) Останні налаштування",
          description: "Використати попередню конфігурацію",
          action: "last",
        },
      ];

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: "Виберіть режим генерації CSS",
      });

      if (selected) {
        handleMenuAction(selected.action);
      }
    }
  );

  // Команда швидкої генерації
  const quickGenerate = vscode.commands.registerCommand(
    "css-classes.quickGenerate",
    () => {
      generateCSS("minimal");
    }
  );

  // Команда повної генерації
  const fullGenerate = vscode.commands.registerCommand(
    "css-classes.fullGenerate",
    () => {
      generateCSS("maximum");
    }
  );

  // Команда відкриття конфігуратора
  const openConfig = vscode.commands.registerCommand(
    "css-classes.openConfig",
    () => {
      createWebviewPanel();
    }
  );

  // Команда повторення останньої дії
  const repeatLast = vscode.commands.registerCommand(
    "css-classes.repeatLast",
    async () => {
      const config = await loadLastConfig();
      if (config) {
        generateCSS(config.mode, config);
      } else {
        vscode.window.showWarningMessage("Немає збережених налаштувань");
      }
    }
  );

  // Додавання команд до контексту
  context.subscriptions.push(
    showMenu,
    quickGenerate,
    fullGenerate,
    openConfig,
    repeatLast
  );
}

/**
 * Обробка вибору з меню
 */
async function handleMenuAction(action) {
  switch (action) {
    case "quick":
      await generateCSS("minimal");
      break;
    case "full":
      await generateCSS("maximum");
      break;
    case "config":
      createWebviewPanel();
      break;
    case "last":
      vscode.commands.executeCommand("css-classes.repeatLast");
      break;
  }
}

/**
 * Головна функція генерації CSS
 */
async function generateCSS(mode = "minimal", savedConfig = null) {
  try {
    // Перевірка активного документа
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== "html") {
      vscode.window.showErrorMessage("Відкрийте HTML файл для генерації CSS");
      return;
    }

    // Показ прогресу
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Генерація CSS класів",
        cancellable: false,
      },
      async (progress) => {
        progress.report({ increment: 0, message: "Ініціалізація..." });

        // Отримання HTML контенту
        const htmlContent = editor.document.getText();
        const htmlPath = editor.document.fileName;

        // Конфігурація
        let config = savedConfig || (await getConfiguration(mode));

        progress.report({ increment: 20, message: "Парсинг HTML..." });

        // Парсинг HTML
        const htmlParser = new HTMLParser();
        const htmlData = htmlParser.parseHTML(htmlContent);

        outputChannel.appendLine(
          `✅ Знайдено ${htmlData.classMap.size} унікальних класів`
        );

        // Figma інтеграція (якщо потрібно)
        let figmaData = null;
        let matches = null;

        if (mode !== "minimal" && config.figmaLink) {
          progress.report({
            increment: 40,
            message: "Завантаження з Figma...",
          });

          const figmaKey = extractFigmaKey(config.figmaLink);
          if (figmaKey) {
            const figmaClient = new FigmaAPIClient(config.figmaToken);

            try {
              figmaData = await figmaClient.getFileStructure(figmaKey);
              outputChannel.appendLine(
                `✅ Завантажено ${figmaData.hierarchy.size} Figma елементів`
              );

              // Співставлення
              progress.report({
                increment: 60,
                message: "Співставлення елементів...",
              });
              const styleMatcher = new StyleMatcher();
              matches = styleMatcher.matchStyles(figmaData, htmlData);

              outputChannel.appendLine(
                `✅ Співставлено ${matches.matches.size} елементів`
              );
            } catch (error) {
              outputChannel.appendLine(`⚠️ Figma помилка: ${error.message}`);
              vscode.window.showWarningMessage(
                "Продовжую без Figma інтеграції"
              );
            }
          }
        }

        progress.report({ increment: 80, message: "Генерація CSS..." });

        // Генерація CSS
        const cssGenerator = new CSSGenerator(config);
        const css = cssGenerator.generateCSS(
          matches || { matches: new Map() },
          figmaData || {},
          htmlData
        );

        // Збереження CSS
        progress.report({ increment: 90, message: "Збереження файлу..." });

        const cssPath = htmlPath.replace(".html", "_generated.css");
        await fs.writeFile(cssPath, css, "utf8");

        // Відкриття CSS файлу
        const cssDocument = await vscode.workspace.openTextDocument(cssPath);
        await vscode.window.showTextDocument(
          cssDocument,
          vscode.ViewColumn.Beside
        );

        progress.report({ increment: 100, message: "Завершено!" });

        // Збереження конфігурації
        await saveLastConfig(config);

        // Показ результату
        vscode.window
          .showInformationMessage(
            `✅ CSS успішно згенеровано! Класів: ${htmlData.classMap.size}`,
            "Відкрити файл"
          )
          .then((selection) => {
            if (selection === "Відкрити файл") {
              vscode.window.showTextDocument(cssDocument);
            }
          });

        // Оновлення StatusBar
        statusBarItem.text = `$(check) CSS: ${htmlData.classMap.size} класів`;

        // Лог
        outputChannel.appendLine(`✅ CSS збережено: ${cssPath}`);
        outputChannel.show();
      }
    );
  } catch (error) {
    outputChannel.appendLine(`❌ Помилка: ${error.message}`);
    vscode.window.showErrorMessage(`Помилка генерації CSS: ${error.message}`);
  }
}

/**
 * Створення WebView панелі для конфігурації
 */
function createWebviewPanel() {
  if (webviewPanel) {
    webviewPanel.reveal(vscode.ViewColumn.Two);
    return;
  }

  webviewPanel = vscode.window.createWebviewPanel(
    "cssClassesConfig",
    "CSS Classes Configuration",
    vscode.ViewColumn.Two,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    }
  );

  // HTML контент для WebView
  webviewPanel.webview.html = getWebviewContent();

  // Обробка повідомлень від WebView
  webviewPanel.webview.onDidReceiveMessage(
    async (message) => {
      switch (message.command) {
        case "generate":
          await generateCSS(message.mode, message.config);
          break;
        case "save":
          await saveLastConfig(message.config);
          vscode.window.showInformationMessage("Налаштування збережено");
          break;
      }
    },
    undefined,
    []
  );

  // Очищення при закритті
  webviewPanel.onDidDispose(() => {
    webviewPanel = undefined;
  });
}

/**
 * HTML контент для WebView
 */
function getWebviewContent() {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {
                font-family: var(--vscode-font-family);
                padding: 20px;
                color: var(--vscode-foreground);
                background: var(--vscode-editor-background);
            }
            h2 {
                color: var(--vscode-textLink-foreground);
                border-bottom: 1px solid var(--vscode-panel-border);
                padding-bottom: 10px;
            }
            .mode-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 15px;
                margin: 20px 0;
            }
            .mode-card {
                border: 2px solid var(--vscode-panel-border);
                border-radius: 8px;
                padding: 15px;
                cursor: pointer;
                transition: all 0.3s;
            }
            .mode-card:hover {
                border-color: var(--vscode-focusBorder);
                background: var(--vscode-list-hoverBackground);
            }
            .mode-card.selected {
                border-color: var(--vscode-textLink-foreground);
                background: var(--vscode-list-activeSelectionBackground);
            }
            .mode-icon {
                font-size: 28px;
                margin-bottom: 10px;
            }
            .mode-title {
                font-weight: bold;
                margin-bottom: 5px;
            }
            .mode-desc {
                font-size: 12px;
                opacity: 0.8;
            }
            .input-group {
                margin: 20px 0;
            }
            label {
                display: block;
                margin-bottom: 5px;
                font-weight: 500;
            }
            input {
                width: 100%;
                padding: 8px;
                background: var(--vscode-input-background);
                border: 1px solid var(--vscode-input-border);
                color: var(--vscode-input-foreground);
                border-radius: 4px;
            }
            button {
                background: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                cursor: pointer;
                margin: 10px 10px 10px 0;
            }
            button:hover {
                background: var(--vscode-button-hoverBackground);
            }
            .actions {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid var(--vscode-panel-border);
            }
        </style>
    </head>
    <body>
        <h2>🎨 CSS Classes from HTML - Configuration</h2>
        
        <div class="mode-grid">
            <div class="mode-card" onclick="selectMode('minimal')">
                <div class="mode-icon">⚡</div>
                <div class="mode-title">Мінімальний режим</div>
                <div class="mode-desc">Швидка генерація без Figma</div>
            </div>
            
            <div class="mode-card" onclick="selectMode('maximum')">
                <div class="mode-icon">🚀</div>
                <div class="mode-title">Максимальний режим</div>
                <div class="mode-desc">Повна інтеграція з Figma</div>
            </div>
            
            <div class="mode-card" onclick="selectMode('production')">
                <div class="mode-icon">📦</div>
                <div class="mode-title">Production режим</div>
                <div class="mode-desc">Оптимізований для продакшену</div>
            </div>
        </div>
        
        <div id="figmaSection" style="display:none;">
            <div class="input-group">
                <label>Figma посилання:</label>
                <input type="text" id="figmaLink" placeholder="https://www.figma.com/file/...">
            </div>
            
            <div class="input-group">
                <label>Figma API Token:</label>
                <input type="password" id="figmaToken" placeholder="Ваш токен">
            </div>
        </div>
        
        <div class="actions">
            <button onclick="generate()">🚀 Згенерувати CSS</button>
            <button onclick="saveConfig()">💾 Зберегти налаштування</button>
        </div>
        
        <script>
            const vscode = acquireVsCodeApi();
            let selectedMode = null;
            
            function selectMode(mode) {
                selectedMode = mode;
                document.querySelectorAll('.mode-card').forEach(card => {
                    card.classList.remove('selected');
                });
                event.currentTarget.classList.add('selected');
                
                // Показ/приховування Figma секції
                document.getElementById('figmaSection').style.display = 
                    mode === 'minimal' ? 'none' : 'block';
            }
            
            function generate() {
                if (!selectedMode) {
                    alert('Виберіть режим генерації');
                    return;
                }
                
                const config = {
                    mode: selectedMode,
                    figmaLink: document.getElementById('figmaLink').value,
                    figmaToken: document.getElementById('figmaToken').value
                };
                
                vscode.postMessage({
                    command: 'generate',
                    mode: selectedMode,
                    config: config
                });
            }
            
            function saveConfig() {
                const config = {
                    mode: selectedMode,
                    figmaLink: document.getElementById('figmaLink').value,
                    figmaToken: document.getElementById('figmaToken').value
                };
                
                vscode.postMessage({
                    command: 'save',
                    config: config
                });
            }
        </script>
    </body>
    </html>
    `;
}

/**
 * Отримання конфігурації
 */
async function getConfiguration(mode) {
  const config = vscode.workspace.getConfiguration("cssClasses");

  const baseConfig = {
    mode: mode,
    includeReset: config.get("includeReset", true),
    includeComments: config.get("includeComments", true),
    optimizeCSS: config.get("optimizeCSS", true),
    generateResponsive: config.get("generateResponsive", true),
  };

  // Запит Figma даних для maximum режиму
  if (mode === "maximum") {
    const figmaLink = await vscode.window.showInputBox({
      prompt: "Введіть посилання на Figma файл",
      placeHolder: "https://www.figma.com/file/...",
    });

    if (figmaLink) {
      const figmaToken = await vscode.window.showInputBox({
        prompt: "Введіть Figma API Token (опціонально)",
        password: true,
      });

      baseConfig.figmaLink = figmaLink;
      baseConfig.figmaToken = figmaToken;
    }
  }

  return baseConfig;
}

/**
 * Збереження останньої конфігурації
 */
async function saveLastConfig(config) {
  const context = vscode.ExtensionContext;
  if (context && context.globalState) {
    await context.globalState.update("lastConfig", config);
  }
}

/**
 * Завантаження останньої конфігурації
 */
async function loadLastConfig() {
  const context = vscode.ExtensionContext;
  if (context && context.globalState) {
    return context.globalState.get("lastConfig");
  }
  return null;
}

/**
 * Витягування Figma ключа з посилання
 */
function extractFigmaKey(url) {
  const match = url.match(/file\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

/**
 * Деактивація розширення
 */
function deactivate() {
  if (statusBarItem) {
    statusBarItem.dispose();
  }
  if (outputChannel) {
    outputChannel.dispose();
  }
  if (webviewPanel) {
    webviewPanel.dispose();
  }
}

module.exports = {
  activate,
  deactivate,
};
