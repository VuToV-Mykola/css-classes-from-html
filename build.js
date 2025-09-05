// build.js
// ===========================================
// Простий збірковий скрипт для VS Code extension
// Виконує підготовку файлів перед пакуванням
// ===========================================

const fs = require("fs")
const path = require("path")

// Приклад: копіюємо всі файли src у build (якщо потрібна компіляція, можна додати TS/Babel)
const srcDir = path.join(__dirname, "src")
const buildDir = path.join(__dirname, "build")

// Створюємо build, якщо його нема
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir)
}

// Копіюємо файли (для JS просто дублюємо)
if (fs.existsSync(srcDir)) {
  const files = fs.readdirSync(srcDir)
  files.forEach(file => {
    const srcFile = path.join(srcDir, file)
    const destFile = path.join(buildDir, file)
    fs.copyFileSync(srcFile, destFile)
  })
  console.log(`✅ Копійовано ${files.length} файлів із src → build`)
} else {
  console.log("⚠️ Папка src не знайдена, створено пустий build")
}
