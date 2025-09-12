// .eslintrc.js - оновлена конфігурація ESLint
module.exports = {
  env: {
    node: true,
    browser: true,
    es2022: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'script',
    ecmaFeatures: {
      globalReturn: true
    }
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off',
    indent: ['error', 2],
    quotes: ['error', 'single'],
    semi: ['error', 'always']
  },
  // ✅ FIX: Додаємо глобальні змінні для VS Code extensions
  globals: {
    vscode: 'readonly',
    acquireVsCodeApi: 'readonly',
    generateResponsiveCSSFromHTML: 'readonly',
    // Frontend functions for script.js
    showStatus: 'readonly',
    updateHTMLDisplay: 'readonly',
    generateCSS: 'readonly',
    saveSettings: 'readonly',
    refreshHTMLContext: 'readonly',
    selectHTMLFile: 'readonly',
    cancelGeneration: 'readonly',
    selectMode: 'readonly',
    switchTab: 'readonly',
    updateAllTranslations: 'readonly',
    setLanguage: 'readonly',
    getVSCodeLanguage: 'readonly',
    handleMessage: 'readonly',
    path: 'readonly',
    // Missing functions
    updateActiveLanguageButton: 'readonly',
    t: 'readonly',
    getModeTitle: 'readonly'
  },
  overrides: [
    {
      files: ['backend/scripts/**/*.js', 'frontend/**/*.js'],
      env: {
        browser: true,
        node: false
      }
    }
  ]
};
