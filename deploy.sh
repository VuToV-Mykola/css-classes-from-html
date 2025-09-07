#!/bin/bash

# 🚀 CSS Classes from HTML - Figma Integration Deploy Script
# Автоматичне розгортання оновленої системи з підтримкою Canvas/Layers

set -e

echo "🚀 Starting CSS Classes from HTML - Figma Integration Deploy..."
echo "📅 $(date)"

# ✅ Базові налаштування
PROJECT_NAME="css-classes-from-html"
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
VERSION="2.2.0"

# 📁 Створення структури директорій
echo "📁 Creating project structure..."
mkdir -p {backend/{core,matchers,generators,analyzers,utils},frontend,test,docs,media,.vscode,.github/{workflows,ISSUE_TEMPLATE}}

# # 💾 Створення backup існуючих файлів
# if [ -f "extension.js" ]; then
#     echo "💾 Creating backup..."
#     mkdir -p "$BACKUP_DIR"
#     cp -r . "$BACKUP_DIR/" 2>/dev/null || true
#     echo "✅ Backup created in $BACKUP_DIR"
# fi

# 🔧 Frontend - Оновлений HTML з мультивибором та sidebar
echo "🔧 Updating frontend..."
cat > frontend/css-classes-from-html-menu.html << 'EOF'
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSS Classes from HTML - Enhanced Figma Integration</title>
    <style>
        /* ✅ FIX: Повністю перероблені стилі для мультивибору Canvas/Layers */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --primary: #007ACC;
            --primary-dark: #005a9e;
            --success: #4caf50;
            --warning: #ff9800;
            --danger: #f44336;
            --bg: #1e1e1e;
            --bg-secondary: #252526;
            --bg-tertiary: #2d2d30;
            --text: #cccccc;
            --text-secondary: #8c8c8c;
            --border: #3c3c3c;
            --shadow: rgba(0, 0, 0, 0.3);
            --sidebar-width: 350px;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--bg);
            color: var(--text);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            font-size: 13px;
            line-height: 1.4;
        }

        /* ✅ FIX: Header з покращеним дизайном */
        .header {
            background: var(--bg-secondary);
            padding: 1rem;
            border-bottom: 1px solid var(--border);
            text-align: center;
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .header h1 {
            font-size: 1.3rem;
            color: var(--primary);
            margin-bottom: 0.3rem;
        }

        .header p {
            color: var(--text-secondary);
            font-size: 0.8rem;
        }

        /* ✅ FIX: Main layout з sidebar */
        .main-layout {
            display: flex;
            flex: 1;
            position: relative;
        }

        .content-area {
            flex: 1;
            padding: 1rem;
            max-width: calc(100% - var(--sidebar-width));
            transition: max-width 0.3s ease;
        }

        .content-area.sidebar-hidden {
            max-width: 100%;
        }

        /* ✅ FIX: Sidebar для стилів */
        .sidebar {
            width: var(--sidebar-width);
            background: var(--bg-secondary);
            border-left: 1px solid var(--border);
            padding: 1rem;
            overflow-y: auto;
            position: fixed;
            right: 0;
            top: 80px;
            bottom: 70px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            z-index: 90;
        }

        .sidebar.visible {
            transform: translateX(0);
        }

        .sidebar-header {
            display: flex;
            justify-content: between;
            align-items: center;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--border);
        }

        .sidebar-title {
            font-size: 1rem;
            color: var(--primary);
            flex: 1;
        }

        .sidebar-toggle {
            position: fixed;
            right: 1rem;
            top: 50%;
            transform: translateY(-50%);
            background: var(--primary);
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            cursor: pointer;
            z-index: 95;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            transition: all 0.3s ease;
        }

        .sidebar-toggle:hover {
            background: var(--primary-dark);
            transform: translateY(-50%) scale(1.1);
        }

        /* ✅ FIX: Mode selector з покращеним UI */
        .mode-selector {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 0.8rem;
            margin-bottom: 1.5rem;
        }

        .mode-card {
            background: var(--bg-secondary);
            border: 2px solid var(--border);
            border-radius: 8px;
            padding: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            text-align: center;
        }

        .mode-card:hover {
            border-color: var(--primary);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px var(--shadow);
        }

        .mode-card.selected {
            border-color: var(--success);
            background: var(--bg-tertiary);
        }

        .mode-card.selected::after {
            content: '✓';
            position: absolute;
            top: 0.8rem;
            right: 0.8rem;
            background: var(--success);
            color: white;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
        }

        /* ✅ FIX: Canvas мультивибір */
        .canvas-multi-selector {
            background: var(--bg-secondary);
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
        }

        .canvas-multi-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.8rem;
        }

        .canvas-counter {
            background: var(--primary);
            color: white;
            padding: 0.2rem 0.6rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 500;
        }

        .canvas-list {
            max-height: 300px;
            overflow-y: auto;
            border: 1px solid var(--border);
            border-radius: 6px;
        }

        .canvas-item {
            display: flex;
            align-items: center;
            padding: 0.8rem;
            border-bottom: 1px solid var(--border);
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
        }

        .canvas-item:last-child {
            border-bottom: none;
        }

        .canvas-item:hover {
            background: var(--bg-tertiary);
        }

        .canvas-item.selected {
            background: var(--bg-tertiary);
            border-left: 3px solid var(--success);
        }

        .canvas-checkbox {
            margin-right: 0.8rem;
            width: 16px;
            height: 16px;
            cursor: pointer;
        }

        .canvas-info {
            flex: 1;
        }

        .canvas-name {
            font-weight: 500;
            color: var(--text);
            margin-bottom: 0.2rem;
        }

        .canvas-meta {
            font-size: 0.75rem;
            color: var(--text-secondary);
        }

        .canvas-order {
            background: var(--primary);
            color: white;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            font-weight: 500;
        }

        /* ✅ FIX: Ієрархічні Layers з advanced функціоналом */
        .layers-hierarchy {
            background: var(--bg-secondary);
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
        }

        .layers-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.8rem;
        }

        .layers-controls {
            display: flex;
            gap: 0.5rem;
        }

        .layers-list {
            max-height: 400px;
            overflow-y: auto;
            border: 1px solid var(--border);
            border-radius: 6px;
        }

        .layer-item {
            display: flex;
            align-items: center;
            padding: 0.6rem;
            border-bottom: 1px solid var(--border);
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
        }

        .layer-item:last-child {
            border-bottom: none;
        }

        .layer-item:hover {
            background: var(--bg-tertiary);
        }

        .layer-item.selected {
            background: var(--bg-tertiary);
            border-left: 3px solid var(--success);
        }

        .layer-item.inherited {
            background: rgba(76, 175, 80, 0.1);
            border-left: 3px solid rgba(76, 175, 80, 0.5);
        }

        .layer-indent {
            display: inline-block;
            width: 20px;
            height: 1px;
            border-bottom: 1px dotted var(--border);
            margin-right: 0.3rem;
        }

        .layer-checkbox {
            margin-right: 0.6rem;
            width: 14px;
            height: 14px;
            cursor: pointer;
        }

        .layer-info {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .layer-icon {
            font-size: 1rem;
        }

        .layer-name {
            font-weight: 500;
            color: var(--text);
        }

        .layer-type {
            background: var(--bg-tertiary);
            color: var(--text-secondary);
            padding: 0.1rem 0.4rem;
            border-radius: 4px;
            font-size: 0.7rem;
        }

        /* ✅ FIX: Styles preview в sidebar */
        .styles-preview {
            margin-bottom: 1rem;
        }

        .styles-empty {
            text-align: center;
            color: var(--text-secondary);
            font-style: italic;
            padding: 2rem;
            border: 2px dashed var(--border);
            border-radius: 6px;
        }

        .style-group {
            background: var(--bg-tertiary);
            border-radius: 6px;
            padding: 0.8rem;
            margin-bottom: 0.8rem;
        }

        .style-group-title {
            font-weight: 500;
            color: var(--primary);
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.3rem;
        }

        .style-property {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.3rem 0;
            border-bottom: 1px solid var(--border);
            font-size: 0.8rem;
        }

        .style-property:last-child {
            border-bottom: none;
        }

        .style-name {
            color: var(--text-secondary);
        }

        .style-value {
            color: var(--text);
            font-family: 'Courier New', monospace;
            background: var(--bg);
            padding: 0.2rem 0.4rem;
            border-radius: 3px;
        }

        /* ✅ FIX: Action buttons */
        .actions {
            display: flex;
            gap: 0.6rem;
            justify-content: center;
            padding: 1rem;
            background: var(--bg-secondary);
            border-top: 1px solid var(--border);
            position: sticky;
            bottom: 0;
            z-index: 80;
        }

        .btn {
            padding: 0.6rem 1.2rem;
            border: none;
            border-radius: 6px;
            font-size: 0.85rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
        }

        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .btn-primary {
            background: var(--primary);
            color: white;
        }

        .btn-primary:hover:not(:disabled) {
            background: var(--primary-dark);
            transform: translateY(-1px);
        }

        .btn-secondary {
            background: var(--bg-tertiary);
            color: var(--text);
            border: 1px solid var(--border);
        }

        .btn-secondary:hover:not(:disabled) {
            background: var(--bg);
            border-color: var(--primary);
        }

        .btn-success {
            background: var(--success);
            color: white;
        }

        .btn-copy {
            background: var(--warning);
            color: white;
        }

        /* ✅ FIX: Status повідомлення */
        .status {
            text-align: center;
            padding: 0.8rem;
            margin: 0.8rem 0;
            border-radius: 6px;
            display: none;
            font-size: 0.85rem;
        }

        .status.show {
            display: block;
        }

        .status.success {
            background: rgba(76, 175, 80, 0.1);
            border: 1px solid var(--success);
            color: var(--success);
        }

        .status.error {
            background: rgba(244, 67, 54, 0.1);
            border: 1px solid var(--danger);
            color: var(--danger);
        }

        .status.warning {
            background: rgba(255, 152, 0, 0.1);
            border: 1px solid var(--warning);
            color: var(--warning);
        }

        /* ✅ FIX: Loading spinner */
        .loading {
            display: inline-block;
            width: 14px;
            height: 14px;
            border: 2px solid var(--text-secondary);
            border-radius: 50%;
            border-top-color: var(--primary);
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* ✅ FIX: Responsive design */
        @media (max-width: 1200px) {
            :root {
                --sidebar-width: 300px;
            }
        }

        @media (max-width: 768px) {
            .main-layout {
                flex-direction: column;
            }
            
            .content-area {
                max-width: 100%;
            }
            
            .sidebar {
                position: fixed;
                top: 0;
                right: 0;
                width: 100%;
                height: 100%;
                z-index: 999;
            }
            
            .mode-selector {
                grid-template-columns: 1fr;
            }
            
            .actions {
                flex-wrap: wrap;
            }
            
            .btn {
                flex: 1;
                min-width: 120px;
            }
        }

        /* ✅ FIX: Scrollbar стилізація */
        ::-webkit-scrollbar {
            width: 8px;
        }

        ::-webkit-scrollbar-track {
            background: var(--bg);
        }

        ::-webkit-scrollbar-thumb {
            background: var(--border);
            border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: var(--text-secondary);
        }
    </style>
</head>
<body>
    <!-- ✅ FIX: Header з покращеним UI -->
    <div class="header">
        <h1>🎨 CSS Classes from HTML - Enhanced Figma Integration</h1>
        <p>Автоматична генерація CSS з HTML файлів та розширена інтеграція з Figma</p>
    </div>

    <!-- ✅ FIX: Sidebar toggle button -->
    <button class="sidebar-toggle" id="sidebarToggle" title="Toggle Styles Sidebar">
        <span>🎨</span>
    </button>

    <div class="main-layout">
        <!-- ✅ FIX: Main content area -->
        <div class="content-area" id="contentArea">
            <!-- Mode Selection -->
            <div class="mode-selector" id="modeSelector">
                <div class="mode-card" data-mode="minimal">
                    <div class="mode-icon">⚡</div>
                    <div class="mode-title">Мінімальний</div>
                    <div class="mode-description">Базова генерація CSS класів без Figma</div>
                </div>
                
                <div class="mode-card" data-mode="maximum">
                    <div class="mode-icon">🚀</div>
                    <div class="mode-title">Максимальний</div>
                    <div class="mode-description">Повна інтеграція з Figma та всі функції</div>
                </div>
                
                <div class="mode-card" data-mode="production">
                    <div class="mode-icon">📦</div>
                    <div class="mode-title">Production</div>
                    <div class="mode-description">Оптимізований CSS для production</div>
                </div>
            </div>

            <!-- Figma Configuration -->
            <div class="section" id="figmaSection" style="background: var(--bg-secondary); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; display: none;">
                <h2 style="color: var(--primary); margin-bottom: 0.8rem;">🎨 Налаштування Figma</h2>
                
                <div style="margin-bottom: 0.8rem;">
                    <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary);">Посилання на Figma файл</label>
                    <input type="text" id="figmaLink" placeholder="https://www.figma.com/file/..." 
                           style="width: 100%; padding: 0.6rem; background: var(--bg-tertiary); border: 1px solid var(--border); color: var(--text); border-radius: 4px;">
                </div>

                <div style="margin-bottom: 0.8rem;">
                    <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary);">Figma API Token (опціонально)</label>
                    <input type="password" id="figmaToken" placeholder="Ваш Figma API токен"
                           style="width: 100%; padding: 0.6rem; background: var(--bg-tertiary); border: 1px solid var(--border); color: var(--text); border-radius: 4px;">
                </div>

                <button class="btn btn-secondary" id="loadCanvasBtn">
                    📋 Завантажити Canvas
                </button>
            </div>

            <!-- ✅ FIX: Canvas мультивибір -->
            <div class="canvas-multi-selector" id="canvasSection" style="display: none;">
                <div class="canvas-multi-header">
                    <h2 style="color: var(--primary); margin: 0;">📋 Вибір Canvas</h2>
                    <div class="canvas-counter" id="canvasCounter">0 вибрано</div>
                </div>
                
                <div class="canvas-list" id="canvasList">
                    <!-- Динамічно заповнюється Canvas -->
                </div>
                
                <div style="margin-top: 0.8rem; display: flex; gap: 0.5rem;">
                    <button class="btn btn-secondary" id="selectAllCanvasBtn">✅ Вибрати всі</button>
                    <button class="btn btn-secondary" id="clearCanvasBtn">❌ Очистити</button>
                    <button class="btn btn-secondary" id="orderCanvasBtn">📊 Змінити порядок</button>
                </div>
            </div>

            <!-- ✅ FIX: Ієрархічні Layers -->
            <div class="layers-hierarchy" id="layersSection" style="display: none;">
                <div class="layers-header">
                    <h2 style="color: var(--primary); margin: 0;">🎨 Вибір Layers</h2>
                    <div class="layers-controls">
                        <button class="btn btn-secondary" id="expandAllBtn">🔼 Розгорнути</button>
                        <button class="btn btn-secondary" id="collapseAllBtn">🔽 Згорнути</button>
                    </div>
                </div>
                
                <div class="layers-list" id="layersList">
                    <!-- Динамічно заповнюється Layers з ієрархією -->
                </div>
                
                <div style="margin-top: 0.8rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <button class="btn btn-secondary" id="selectAllLayersBtn">✅ Вибрати всі</button>
                    <button class="btn btn-secondary" id="clearLayersBtn">❌ Очистити</button>
                    <button class="btn btn-secondary" id="selectChildrenBtn">👶 Вибрати нащадків</button>
                    <button class="btn btn-secondary" id="selectParentsBtn">👴 Вибрати предків</button>
                </div>
            </div>

            <!-- Status Messages -->
            <div id="status" class="status"></div>
        </div>

        <!-- ✅ FIX: Sidebar для preview стилів -->
        <div class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <h3 class="sidebar-title">🎨 Стилі вибраних Layers</h3>
                <button class="btn btn-copy" id="copyStylesBtn" title="Копіювати стилі в буфер обміну">
                    📋 Копіювати
                </button>
            </div>
            
            <div class="styles-preview" id="stylesPreview">
                <div class="styles-empty">
                    <p>🎨 Виберіть Layers для перегляду стилів</p>
                    <p style="font-size: 0.8rem; margin-top: 0.5rem;">Стилі будуть автоматично відображені тут</p>
                </div>
            </div>
        </div>
    </div>

    <!-- ✅ FIX: Action buttons -->
    <div class="actions">
        <button class="btn btn-secondary" id="loadLastBtn">📂 Завантажити останні</button>
        <button class="btn btn-secondary" id="saveBtn">💾 Зберегти</button>
        <button class="btn btn-secondary" id="clearBtn">🗑️ Очистити</button>
        <button class="btn btn-primary" id="generateBtn" disabled>🚀 Згенерувати CSS</button>
    </div>

    <script>
        // ✅ FIX: Canvas мультивибір функції
        function loadFigmaCanvases() {
            if (!state.figmaLink) {
                showStatus('Введіть посилання на Figma файл', 'error');
                return;
            }
            
            showStatus('<span class="loading"></span> Завантаження Canvas...', 'warning');
            
            vscode.postMessage({
                command: 'getFigmaCanvases',
                figmaLink: state.figmaLink,
                figmaToken: state.figmaToken
            });
        }

        function displayCanvases(canvases) {
            const container = document.getElementById('canvasList');
            container.innerHTML = '';
            
            if (canvases.length === 0) {
                container.innerHTML = '<div class="status warning show">Не знайдено Canvas</div>';
                return;
            }
            
            canvases.forEach((canvas, index) => {
                const item = document.createElement('div');
                item.className = 'canvas-item';
                item.dataset.id = canvas.id;
                item.innerHTML = `
                    <input type="checkbox" class="canvas-checkbox" data-canvas-id="${canvas.id}">
                    <div class="canvas-info">
                        <div class="canvas-name">${canvas.name}</div>
                        <div class="canvas-meta">${canvas.childrenCount} елементів • ${canvas.elementTypes.join(', ')}</div>
                    </div>
                    <div class="canvas-order" style="display: none;">${index + 1}</div>
                `;
                
                const checkbox = item.querySelector('.canvas-checkbox');
                checkbox.addEventListener('change', function() {
                    handleCanvasSelection(canvas, this.checked);
                });
                
                container.appendChild(item);
            });
            
            document.getElementById('canvasSection').style.display = 'block';
            updateCanvasCounter();
        }

        function handleCanvasSelection(canvas, isSelected) {
            if (isSelected) {
                // Додаємо Canvas до вибраних
                if (!state.selectedCanvases.find(c => c.id === canvas.id)) {
                    state.selectedCanvases.push({
                        ...canvas,
                        order: state.selectedCanvases.length + 1
                    });
                }
            } else {
                // Видаляємо Canvas з вибраних
                state.selectedCanvases = state.selectedCanvases.filter(c => c.id !== canvas.id);
                // Видаляємо всі Layers цього Canvas
                state.selectedLayers = state.selectedLayers.filter(l => l.canvasId !== canvas.id);
            }
            
            updateCanvasVisuals();
            updateCanvasCounter();
            
            // Завантажуємо Layers для вибраних Canvas
            if (state.selectedCanvases.length > 0) {
                loadLayersForSelectedCanvases();
            } else {
                document.getElementById('layersSection').style.display = 'none';
                updateStylesPreview();
            }
        }

        function selectAllCanvas() {
            const checkboxes = document.querySelectorAll('.canvas-checkbox');
            checkboxes.forEach(checkbox => {
                if (!checkbox.checked) {
                    checkbox.checked = true;
                    checkbox.dispatchEvent(new Event('change'));
                }
            });
        }

        function clearCanvasSelection() {
            const checkboxes = document.querySelectorAll('.canvas-checkbox');
            checkboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    checkbox.checked = false;
                    checkbox.dispatchEvent(new Event('change'));
                }
            });
        }

        function reorderCanvas() {
            // Простий алгоритм перестановки - переміщення першого в кінець
            if (state.selectedCanvases.length > 1) {
                const first = state.selectedCanvases.shift();
                state.selectedCanvases.push(first);
                updateCanvasVisuals();
                showStatus('Порядок Canvas змінено', 'success');
            }
        }

        function updateCanvasVisuals() {
            // Оновлюємо візуальне відображення порядку Canvas
            state.selectedCanvases.forEach((canvas, index) => {
                const item = document.querySelector(`[data-id="${canvas.id}"]`);
                if (item) {
                    item.classList.add('selected');
                    const orderElement = item.querySelector('.canvas-order');
                    orderElement.style.display = 'flex';
                    orderElement.textContent = index + 1;
                }
            });
            
            // Приховуємо порядок для невибраних
            document.querySelectorAll('.canvas-item:not(.selected) .canvas-order').forEach(el => {
                el.style.display = 'none';
            });
        }

        function updateCanvasCounter() {
            const counter = document.getElementById('canvasCounter');
            counter.textContent = `${state.selectedCanvases.length} вибрано`;
        }

        // ✅ FIX: Layers ієрархічні функції
        function loadLayersForSelectedCanvases() {
            if (state.selectedCanvases.length === 0) return;
            
            showStatus('<span class="loading"></span> Завантаження Layers...', 'warning');
            
            // Завантажуємо Layers для всіх вибраних Canvas
            const canvasIds = state.selectedCanvases.map(c => c.id);
            
            vscode.postMessage({
                command: 'getFigmaLayers',
                figmaLink: state.figmaLink,
                figmaToken: state.figmaToken,
                canvasIds: canvasIds // Передаємо масив Canvas IDs
            });
        }

        function displayLayers(layersData) {
            const container = document.getElementById('layersList');
            container.innerHTML = '';
            
            if (!layersData || layersData.length === 0) {
                container.innerHTML = '<div class="status warning show">Не знайдено Layers</div>';
                return;
            }
            
            // Будуємо ієрархію
            buildLayerHierarchy(layersData);
            
            // Відображаємо ієрархію по Canvas
            state.selectedCanvases.forEach(canvas => {
                const canvasLayers = layersData.filter(l => l.canvasId === canvas.id);
                if (canvasLayers.length > 0) {
                    displayCanvasLayers(container, canvas, canvasLayers);
                }
            });
            
            document.getElementById('layersSection').style.display = 'block';
        }

        function buildLayerHierarchy(layersData) {
            state.layerHierarchy.clear();
            
            layersData.forEach(layer => {
                state.layerHierarchy.set(layer.id, {
                    ...layer,
                    children: [],
                    parent: null,
                    isExpanded: false
                });
            });
            
            // Побудова дерева
            layersData.forEach(layer => {
                if (layer.parentId) {
                    const parent = state.layerHierarchy.get(layer.parentId);
                    const child = state.layerHierarchy.get(layer.id);
                    if (parent && child) {
                        parent.children.push(child);
                        child.parent = parent;
                    }
                }
            });
        }

        function displayCanvasLayers(container, canvas, layers) {
            // Заголовок Canvas
            const canvasHeader = document.createElement('div');
            canvasHeader.className = 'layer-item';
            canvasHeader.style.background = 'var(--bg-tertiary)';
            canvasHeader.style.fontWeight = 'bold';
            canvasHeader.innerHTML = `
                <input type="checkbox" class="canvas-layers-checkbox" data-canvas-id="${canvas.id}">
                <div class="layer-info">
                    <span class="layer-icon">📋</span>
                    <span class="layer-name">${canvas.name}</span>
                    <span class="layer-type">CANVAS</span>
                </div>
            `;
            
            const canvasCheckbox = canvasHeader.querySelector('.canvas-layers-checkbox');
            canvasCheckbox.addEventListener('change', function() {
                handleCanvasLayersSelection(canvas.id, this.checked);
            });
            
            container.appendChild(canvasHeader);
            
            // Відображаємо Layers цього Canvas
            const rootLayers = layers.filter(l => !l.parentId);
            rootLayers.forEach(layer => {
                displayLayerHierarchy(container, layer, 1);
            });
        }

        function displayLayerHierarchy(container, layer, depth) {
            const item = document.createElement('div');
            item.className = 'layer-item';
            item.dataset.layerId = layer.id;
            item.dataset.depth = depth;
            
            const indent = '&nbsp;'.repeat(depth * 4);
            const hasChildren = layer.children && layer.children.length > 0;
            const expandIcon = hasChildren ? (layer.isExpanded ? '🔽' : '▶️') : '•';
            
            item.innerHTML = `
                <span class="layer-indent">${indent}</span>
                <span class="layer-expand" style="cursor: pointer; margin-right: 0.3rem;">${expandIcon}</span>
                <input type="checkbox" class="layer-checkbox" data-layer-id="${layer.id}" data-canvas-id="${layer.canvasId}">
                <div class="layer-info">
                    <span class="layer-icon">${getLayerIcon(layer.type)}</span>
                    <span class="layer-name">${layer.name}</span>
                    <span class="layer-type">${layer.type}</span>
                </div>
            `;
            
            // Обробники подій
            const expandElement = item.querySelector('.layer-expand');
            if (hasChildren) {
                expandElement.addEventListener('click', function() {
                    toggleLayerExpansion(layer.id);
                });
            }
            
            const checkbox = item.querySelector('.layer-checkbox');
            checkbox.addEventListener('change', function() {
                handleLayerSelection(layer, this.checked);
            });
            
            container.appendChild(item);
            
            // Відображаємо дітей якщо розгорнуто
            if (layer.isExpanded && hasChildren) {
                layer.children.forEach(child => {
                    displayLayerHierarchy(container, child, depth + 1);
                });
            }
        }

        function getLayerIcon(type) {
            const icons = {
                'TEXT': '🔤',
                'RECTANGLE': '🟦',
                'FRAME': '🖼️',
                'GROUP': '📁',
                'COMPONENT': '⚙️',
                'INSTANCE': '🔗',
                'VECTOR': '✏️',
                'IMAGE': '🖼️'
            };
            return icons[type] || '📄';
        }

        function toggleLayerExpansion(layerId) {
            const layer = state.layerHierarchy.get(layerId);
            if (layer) {
                layer.isExpanded = !layer.isExpanded;
                refreshLayersDisplay();
            }
        }

        function handleLayerSelection(layer, isSelected) {
            if (isSelected) {
                // Додаємо Layer до вибраних
                if (!state.selectedLayers.find(l => l.id === layer.id)) {
                    state.selectedLayers.push(layer);
                }
                
                // Автовибір дітей при виборі батька
                if (layer.children && layer.children.length > 0) {
                    selectLayerChildren(layer, true);
                }
            } else {
                // Видаляємо Layer з вибраних
                state.selectedLayers = state.selectedLayers.filter(l => l.id !== layer.id);
                
                // Зняття вибору з дітей
                if (layer.children && layer.children.length > 0) {
                    selectLayerChildren(layer, false);
                }
            }
            
            updateLayerVisuals();
            loadStylesForSelectedLayers();
        }

        function selectLayerChildren(parentLayer, select) {
            if (!parentLayer.children) return;
            
            parentLayer.children.forEach(child => {
                const checkbox = document.querySelector(`[data-layer-id="${child.id}"]`);
                if (checkbox && checkbox.checked !== select) {
                    checkbox.checked = select;
                    handleLayerSelection(child, select);
                }
            });
        }

        function handleCanvasLayersSelection(canvasId, isSelected) {
            // Вибір/зняття всіх Layers Canvas
            const checkboxes = document.querySelectorAll(`[data-canvas-id="${canvasId}"].layer-checkbox`);
            checkboxes.forEach(checkbox => {
                if (checkbox.checked !== isSelected) {
                    checkbox.checked = isSelected;
                    checkbox.dispatchEvent(new Event('change'));
                }
            });
        }

        // ✅ FIX: Layers control functions
        function expandAllLayers() {
            state.layerHierarchy.forEach(layer => {
                layer.isExpanded = true;
            });
            refreshLayersDisplay();
        }

        function collapseAllLayers() {
            state.layerHierarchy.forEach(layer => {
                layer.isExpanded = false;
            });
            refreshLayersDisplay();
        }

        function selectAllLayers() {
            const checkboxes = document.querySelectorAll('.layer-checkbox');
            checkboxes.forEach(checkbox => {
                if (!checkbox.checked) {
                    checkbox.checked = true;
                    checkbox.dispatchEvent(new Event('change'));
                }
            });
        }

        function clearLayersSelection() {
            const checkboxes = document.querySelectorAll('.layer-checkbox, .canvas-layers-checkbox');
            checkboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    checkbox.checked = false;
                    checkbox.dispatchEvent(new Event('change'));
                }
            });
        }

        function selectChildrenLayers() {
            // Вибір всіх нащадків для поточно вибраних Layers
            const selectedIds = state.selectedLayers.map(l => l.id);
            selectedIds.forEach(layerId => {
                const layer = state.layerHierarchy.get(layerId);
                if (layer && layer.children) {
                    selectLayerChildren(layer, true);
                }
            });
        }

        function selectParentsLayers() {
            // Вибір всіх предків для поточно вибраних Layers
            const newSelections = [];
            
            state.selectedLayers.forEach(layer => {
                let currentLayer = layer;
                while (currentLayer.parent) {
                    currentLayer = currentLayer.parent;
                    if (!state.selectedLayers.find(l => l.id === currentLayer.id)) {
                        newSelections.push(currentLayer);
                    }
                }
            });
            
            newSelections.forEach(layer => {
                const checkbox = document.querySelector(`[data-layer-id="${layer.id}"]`);
                if (checkbox && !checkbox.checked) {
                    checkbox.checked = true;
                    checkbox.dispatchEvent(new Event('change'));
                }
            });
        }

        function refreshLayersDisplay() {
            // Перебудова відображення Layers
            if (state.selectedCanvases.length > 0) {
                loadLayersForSelectedCanvases();
            }
        }

        function updateLayerVisuals() {
            // Оновлення візуальних станів Layers
            state.selectedLayers.forEach(layer => {
                const item = document.querySelector(`[data-layer-id="${layer.id}"]`);
                if (item) {
                    item.classList.add('selected');
                }
            });
        }

        // ✅ FIX: Styles management
        function loadStylesForSelectedLayers() {
            if (state.selectedLayers.length === 0) {
                updateStylesPreview();
                return;
            }
            
            // Запит стилів для вибраних Layers
            const layerIds = state.selectedLayers.map(l => l.id);
            
            vscode.postMessage({
                command: 'getLayerStyles',
                figmaLink: state.figmaLink,
                figmaToken: state.figmaToken,
                layerIds: layerIds
            });
        }

        function displayLayerStyles(stylesData) {
            // Збереження стилів в state
            stylesData.forEach(styleData => {
                state.layerStyles.set(styleData.layerId, styleData.styles);
            });
            
            updateStylesPreview();
        }

        function updateStylesPreview() {
            const container = document.getElementById('stylesPreview');
            
            if (state.selectedLayers.length === 0) {
                container.innerHTML = `
                    <div class="styles-empty">
                        <p>🎨 Виберіть Layers для перегляду стилів</p>
                        <p style="font-size: 0.8rem; margin-top: 0.5rem;">Стилі будуть автоматично відображені тут</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = '';
            
            state.selectedLayers.forEach(layer => {
                const styles = state.layerStyles.get(layer.id);
                if (styles) {
                    const layerSection = document.createElement('div');
                    layerSection.innerHTML = `
                        <h4 style="color: var(--primary); margin-bottom: 0.8rem; padding-bottom: 0.3rem; border-bottom: 1px solid var(--border);">
                            ${getLayerIcon(layer.type)} ${layer.name}
                        </h4>
                    `;
                    
                    // Групуємо стилі по категоріях
                    const styleGroups = groupStyles(styles);
                    
                    Object.keys(styleGroups).forEach(groupName => {
                        const group = styleGroups[groupName];
                        if (Object.keys(group).length > 0) {
                            const groupDiv = document.createElement('div');
                            groupDiv.className = 'style-group';
                            
                            let groupHTML = `<div class="style-group-title">${getGroupIcon(groupName)} ${groupName}</div>`;
                            
                            Object.keys(group).forEach(property => {
                                const value = group[property];
                                groupHTML += `
                                    <div class="style-property">
                                        <span class="style-name">${property}</span>
                                        <span class="style-value">${value}</span>
                                    </div>
                                `;
                            });
                            
                            groupDiv.innerHTML = groupHTML;
                            layerSection.appendChild(groupDiv);
                        }
                    });
                    
                    container.appendChild(layerSection);
                }
            });
            
            // Автоматично відкриваємо sidebar якщо є стилі
            if (state.selectedLayers.length > 0 && !state.sidebarVisible) {
                toggleSidebar();
            }
        }

        function groupStyles(styles) {
            const groups = {
                'Typography': {},
                'Colors': {},
                'Layout': {},
                'Effects': {},
                'Borders': {},
                'Spacing': {},
                'Other': {}
            };
            
            Object.keys(styles).forEach(property => {
                const value = styles[property];
                
                if (['font-family', 'font-size', 'font-weight', 'line-height', 'text-align'].includes(property)) {
                    groups.Typography[property] = value;
                } else if (['color', 'background-color', 'background'].includes(property)) {
                    groups.Colors[property] = value;
                } else if (['display', 'flex-direction', 'justify-content', 'align-items', 'position'].includes(property)) {
                    groups.Layout[property] = value;
                } else if (['box-shadow', 'filter', 'opacity'].includes(property)) {
                    groups.Effects[property] = value;
                } else if (['border', 'border-radius', 'border-width', 'border-color'].includes(property)) {
                    groups.Borders[property] = value;
                } else if (['margin', 'padding', 'gap'].includes(property) || property.includes('margin') || property.includes('padding')) {
                    groups.Spacing[property] = value;
                } else {
                    groups.Other[property] = value;
                }
            });
            
            return groups;
        }

        function getGroupIcon(groupName) {
            const icons = {
                'Typography': '🔤',
                'Colors': '🎨',
                'Layout': '📐',
                'Effects': '✨',
                'Borders': '🔲',
                'Spacing': '📏',
                'Other': '⚙️'
            };
            return icons[groupName] || '📄';
        }

        function copyStylesToClipboard() {
            if (state.selectedLayers.length === 0) {
                showStatus('Немає вибраних Layers для копіювання стилів', 'warning');
                return;
            }
            
            let cssContent = '/* Стилі з вибраних Figma Layers */\n';
            cssContent += `/* Згенеровано: ${new Date().toLocaleString()} */\n\n`;
            
            state.selectedLayers.forEach(layer => {
                const styles = state.layerStyles.get(layer.id);
                if (styles) {
                    const className = layer.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
                    cssContent += `/* ${layer.name} (${layer.type}) */\n`;
                    cssContent += `.${className} {\n`;
                    
                    Object.keys(styles).forEach(property => {
                        cssContent += `  ${property}: ${styles[property]};\n`;
                    });
                    
                    cssContent += '}\n\n';
                }
            });
            
            // Копіювання в буфер обміну через VSCode API
            vscode.postMessage({
                command: 'copyToClipboard',
                content: cssContent
            });
            
            showStatus('✅ Стилі скопійовано в буфер обміну!', 'success');
        }

        // ✅ FIX: Enhanced message handling
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.command) {
                case 'figmaCanvases':
                    displayCanvases(message.canvases);
                    showStatus('Canvas завантажено', 'success');
                    break;
                    
                case 'figmaLayers':
                    displayLayers(message.layers);
                    showStatus('Layers завантажено', 'success');
                    break;
                    
                case 'layerStyles':
                    displayLayerStyles(message.styles);
                    showStatus('Стилі завантажено', 'success');
                    break;
                    
                case 'clipboardCopied':
                    if (message.success) {
                        showStatus('✅ Стилі скопійовано в буфер обміну!', 'success');
                    } else {
                        showStatus('❌ Помилка копіювання в буфер обміну', 'error');
                    }
                    break;
                    
                case 'generationComplete':
                    if (message.success) {
                        showStatus(`✅ CSS згенеровано успішно!`, 'success');
                    } else {
                        showStatus(`❌ Помилка: ${message.error}`, 'error');
                    }
                    break;
                    
                case 'error':
                    showStatus(`❌ Помилка: ${message.message}`, 'error');
                    break;
            }
        });

        // ✅ FIX: Utility functions
        function updateState() {
            // Оновлення глобального стану
        }

        function validateFigmaLink() {
            // Валідація Figma посилання
        }

        function loadLastSettings() {
            showStatus('<span class="loading"></span> Завантаження налаштувань...', 'warning');
            vscode.postMessage({ command: 'loadLastSettings' });
        }

        function saveSettings() {
            updateState();
            showStatus('<span class="loading"></span> Збереження налаштувань...', 'warning');
            vscode.postMessage({
                command: 'saveCurrentSettings',
                settings: {
                    ...state,
                    selectedCanvases: state.selectedCanvases.map(c => ({ id: c.id, name: c.name, order: c.order })),
                    selectedLayers: state.selectedLayers.map(l => ({ id: l.id, name: l.name, canvasId: l.canvasId }))
                }
            });
        }

        function clearSettings() {
            // Очищення всіх налаштувань
            state = {
                mode: null,
                figmaLink: '',
                figmaToken: '',
                selectedCanvases: [],
                selectedLayers: [],
                layerHierarchy: new Map(),
                layerStyles: new Map(),
                includeReset: true,
                includeComments: true,
                optimizeCSS: true,
                generateResponsive: true,
                sidebarVisible: false
            };
            
            // Очищення UI
            document.querySelectorAll('.mode-card').forEach(card => {
                card.classList.remove('selected');
            });
            
            document.getElementById('figmaLink').value = '';
            document.getElementById('figmaToken').value = '';
            document.getElementById('canvasList').innerHTML = '';
            document.getElementById('layersList').innerHTML = '';
            
            document.getElementById('canvasSection').style.display = 'none';
            document.getElementById('layersSection').style.display = 'none';
            document.getElementById('figmaSection').style.display = 'none';
            
            updateStylesPreview();
            updateCanvasCounter();
            
            if (state.sidebarVisible) {
                toggleSidebar();
            }
            
            showStatus('Налаштування очищено', 'success');
            
            vscode.postMessage({ command: 'clearSettings' });
        }

        function generateCSS() {
            if (!state.mode) {
                showStatus('Виберіть режим генерації', 'error');
                return;
            }
            
            updateState();
            showStatus('<span class="loading"></span> Генерація CSS...', 'warning');
            
            vscode.postMessage({
                command: 'generateCSS',
                settings: {
                    ...state,
                    selectedCanvases: state.selectedCanvases,
                    selectedLayers: state.selectedLayers
                }
            });
        }

        function showStatus(message, type = 'success') {
            const status = document.getElementById('status');
            status.className = `status ${type} show`;
            status.innerHTML = message;
            
            if (!message.includes('loading')) {
                setTimeout(() => {
                    status.classList.remove('show');
                }, 5000);
            }
        }
    </script>
</body>
</html>
EOF

# 🔧 Backend - Enhanced FigmaAPIClient with multi-canvas support
echo "🔧 Updating backend FigmaAPIClient..."
cat > backend/core/FigmaAPIClient.js << 'EOF'
/**
 * ✅ FIX: Enhanced Figma API Client з підтримкою мультивибору Canvas/Layers
 * Розширена інтеграція з Figma API для роботи з Canvas та Layers
 * @version 3.1.0 - ENHANCED
 */

const https = require('https');
const { URL } = require('url');

class FigmaAPIClient {
  constructor(apiToken, options = {}) {
    this.apiToken = apiToken;
    this.baseURL = 'https://api.figma.com/v1';
    this.cache = new Map();
    this.rateLimit = {
      requests: 0,
      resetTime: Date.now() + 60000,
      maxRequests: 100
    };
    this.timeout = options.timeout || 15000;
    this.retryAttempts = options.retryAttempts || 3;
  }

  /**
   * ✅ FIX: Завантаження файлу з розширеним кешуванням
   */
  async fetchFile(fileKey, options = {}) {
    const cacheKey = `file_${fileKey}`;
    const useCache = options.useCache !== false;
    
    if (useCache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    if (!this.apiToken) {
      throw new Error('401 No Figma token provided');
    }

    await this.checkRateLimit();

    const url = `${this.baseURL}/files/${fileKey}`;
    const headers = {
      'X-Figma-Token': this.apiToken,
      'Content-Type': 'application/json',
      'User-Agent': 'CSS-Classes-From-HTML/3.1.0'
    };

    try {
      const response = await this.makeRequest(url, 'GET', null, headers);
      const data = response.data;
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      if (error.statusCode === 429) {
        await this.handleRateLimit();
        return this.fetchFile(fileKey, options);
      }
      throw error;
    }
  }

  /**
   * ✅ FIX: Отримання Canvas з розширеною інформацією
   */
  async getCanvases(fileKey) {
    const data = await this.fetchFile(fileKey);
    const pages = (data.document && data.document.children) || [];
    
    return pages.map(page => ({
      id: page.id,
      name: page.name || 'Untitled',
      childrenCount: Array.isArray(page.children) ? page.children.length : 0,
      elementTypes: this.getElementTypes(page),
      hasText: this.hasTextContent(page),
      hasImages: this.hasImages(page),
      complexity: this.calculateCanvasComplexity(page),
      metadata: {
        width: page.absoluteBoundingBox?.width || 0,
        height: page.absoluteBoundingBox?.height || 0,
        backgroundColor: this.extractBackX: Enhanced JavaScript з повною підтримкою мультивибору та ієрархії
        const vscode = acquireVsCodeApi();
        
        // ✅ FIX: Global state з розширеними можливостями
        let state = {
            mode: null,
            figmaLink: '',
            figmaToken: '',
            selectedCanvases: [], // Масив вибраних Canvas з порядком
            selectedLayers: [], // Масив вибраних Layers
            layerHierarchy: new Map(), // Ієрархія Layers
            layerStyles: new Map(), // Стилі для кожного Layer
            includeReset: true,
            includeComments: true,
            optimizeCSS: true,
            generateResponsive: true,
            sidebarVisible: false
        };

        // ✅ FIX: Initialization
        window.addEventListener('DOMContentLoaded', () => {
            initializeUI();
            loadLastSettings();
        });

        // ✅ FIX: Enhanced UI initialization
        function initializeUI() {
            // Mode selection
            document.querySelectorAll('.mode-card').forEach(card => {
                card.addEventListener('click', function() {
                    selectMode(this.dataset.mode);
                });
            });

            // Sidebar toggle
            document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);

            // Main action buttons
            document.getElementById('loadLastBtn').addEventListener('click', loadLastSettings);
            document.getElementById('saveBtn').addEventListener('click', saveSettings);
            document.getElementById('clearBtn').addEventListener('click', clearSettings);
            document.getElementById('generateBtn').addEventListener('click', generateCSS);

            // Figma controls
            document.getElementById('loadCanvasBtn').addEventListener('click', loadFigmaCanvases);
            document.getElementById('figmaLink').addEventListener('input', validateFigmaLink);
            document.getElementById('figmaToken').addEventListener('input', updateState);

            // Canvas controls
            document.getElementById('selectAllCanvasBtn').addEventListener('click', selectAllCanvas);
            document.getElementById('clearCanvasBtn').addEventListener('click', clearCanvasSelection);
            document.getElementById('orderCanvasBtn').addEventListener('click', reorderCanvas);

            // Layers controls
            document.getElementById('expandAllBtn').addEventListener('click', expandAllLayers);
            document.getElementById('collapseAllBtn').addEventListener('click', collapseAllLayers);
            document.getElementById('selectAllLayersBtn').addEventListener('click', selectAllLayers);
            document.getElementById('clearLayersBtn').addEventListener('click', clearLayersSelection);
            document.getElementById('selectChildrenBtn').addEventListener('click', selectChildrenLayers);
            document.getElementById('selectParentsBtn').addEventListener('click', selectParentsLayers);

            // Styles controls
            document.getElementById('copyStylesBtn').addEventListener('click', copyStylesToClipboard);
        }

        // ✅ FIX: Mode selection з enhanced логікою
        function selectMode(mode) {
            document.querySelectorAll('.mode-card').forEach(card => {
                card.classList.remove('selected');
            });
            document.querySelector(`[data-mode="${mode}"]`).classList.add('selected');
            
            state.mode = mode;
            
            // Show/hide sections based on mode
            const showFigma = mode !== 'minimal';
            document.getElementById('figmaSection').style.display = showFigma ? 'block' : 'none';
            
            document.getElementById('generateBtn').disabled = false;
            
            showStatus(`Режим "${getModeName(mode)}" вибрано`, 'success');
            updateState();
        }

        function getModeName(mode) {
            const names = {
                minimal: 'Мінімальний',
                maximum: 'Максимальний', 
                production: 'Production'
            };
            return names[mode] || mode;
        }

        // ✅ FIX: Sidebar управління
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const contentArea = document.getElementById('contentArea');
            const toggle = document.getElementById('sidebarToggle');
            
            state.sidebarVisible = !state.sidebarVisible;
            
            if (state.sidebarVisible) {
                sidebar.classList.add('visible');
                contentArea.classList.remove('sidebar-hidden');
                toggle.innerHTML = '<span>✖️</span>';
                toggle.title = 'Закрити Sidebar';
            } else {
                sidebar.classList.remove('visible');
                contentArea.classList.add('sidebar-hidden');
                toggle.innerHTML = '<span>🎨</span>';
                toggle.title = 'Відкрити Sidebar';
            }
        }

        // ✅ FI