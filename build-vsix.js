// build-vsix.js - скрипт для збірки VSIX пакету
const {execSync} = require("child_process")
const fs = require("fs")
const path = require("path")

console.log("🚀 Початок збірки VSIX пакету...")

try {
  // Перевірка наявності vsce
  try {
    execSync("vsce --version", {stdio: "pipe"})
  } catch (error) {
    console.log("📦 Встановлення vsce глобально...")
    execSync("npm install -g @vscode/vsce", {stdio: "inherit"})
  }

  // Очистка попередніх збірок
  const files = fs.readdirSync(".")
  files.forEach(file => {
    if (file.endsWith(".vsix")) {
      console.log(`🗑️ Видалення старого пакету: ${file}`)
      fs.unlinkSync(file)
    }
  })

  // Виконання тестів
  console.log("🧪 Запуск тестів...")
  try {
    execSync("npm test", {stdio: "inherit"})
  } catch (testError) {
    console.warn("⚠️ Тести не пройдені, але продовжуємо збірку...")
  }

  // Пакування розширення
  console.log("📦 Пакування розширення...")
  execSync("vsce package", {stdio: "inherit"})

  // Пошук створеного VSIX файлу
  const vsixFiles = fs.readdirSync(".").filter(file => file.endsWith(".vsix"))
  if (vsixFiles.length > 0) {
    console.log(`✅ VSIX пакет створено: ${vsixFiles[0]}`)
    console.log(`📊 Розмір: ${Math.round(fs.statSync(vsixFiles[0]).size / 1024)}KB`)
  } else {
    throw new Error("VSIX файл не знайдено після пакування")
  }
} catch (error) {
  console.error("❌ Помилка збірки:")
  console.error(error.message)
  process.exit(1)
}
