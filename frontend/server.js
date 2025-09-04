#!/usr/bin/env node

/**
 * Web Server для UI конфігуратора
 */

const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const ConfigurationManager = require('./configurationManager');
const FigmaHTMLIntegration = require('../main');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Configuration manager
const configManager = new ConfigurationManager();

// API Routes
app.get('/api/load-settings', async (req, res) => {
  try {
    const settings = await configManager.loadLastSettings();
    res.json(settings || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/save-settings', async (req, res) => {
  try {
    const result = await configManager.saveSettings(req.body);
    res.json({ success: true, settings: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/generate', async (req, res) => {
  try {
    const { mode, htmlFile, figmaLink, figmaToken, selectedCanvas, selectedLayers } = req.body;
    
    // Apply configuration
    const config = await configManager.applyMode(mode);
    config.selectedCanvas = selectedCanvas;
    config.selectedLayers = selectedLayers;
    
    // Save settings
    await configManager.saveSettings(config);
    
    // Initialize integration
    const integration = new FigmaHTMLIntegration({
      figmaToken: figmaToken || process.env.FIGMA_API_TOKEN,
      ...config
    });
    
    // Read HTML file
    const htmlPath = path.join(__dirname, '..', htmlFile);
    const htmlContent = await fs.readFile(htmlPath, 'utf8');
    
    // Extract Figma key from link
    const figmaKey = figmaLink ? figmaLink.match(/file\/([a-zA-Z0-9]+)/)?.[1] : null;
    
    // Run integration
    const result = await integration.integrate(figmaKey, htmlContent);
    
    if (result.success) {
      res.json({ 
        success: true, 
        outputFile: `output/styles_${new Date().toISOString().split('T')[0]}.css`,
        statistics: result.statistics 
      });
    } else {
      res.status(400).json({ error: 'Generation failed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🎨 CSS Classes from HTML UI`);
  console.log(`🌐 Server running at http://localhost:${PORT}`);
  console.log(`📝 Open browser to configure and generate CSS`);

  // Auto-open browser
  const open = require("open");
  open(`http://localhost:${PORT}`);
  // Додати обробник для graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n🛑 Зупинка сервера...");
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("\n🛑 Отримано сигнал завершення...");
    process.exit(0);
  });
});
