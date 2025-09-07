// .eslintrc.js - оновлена конфігурація ESLint
module.exports = {
  env: {
    node: true,
    es2022: true
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "script",
    ecmaFeatures: {
      globalReturn: true
    }
  },
  rules: {
    "no-unused-vars": "warn",
    "no-console": "off",
    indent: ["error", 2],
    quotes: ["error", "single"],
    semi: ["error", "always"]
  },
  // ✅ FIX: Додаємо глобальні змінні для VS Code extensions
  globals: {
    vscode: "readonly",
    acquireVsCodeApi: "readonly"
  }
}
