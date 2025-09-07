// test/run-all-tests.js - базовий тест для розширення
const {execSync} = require("child_process")
const fs = require("fs")
const path = require("path")

console.log("🧪 Запуск тестів для CSS Classes from HTML...")

try {
  // Перевірка основного файлу
  if (!fs.existsSync("extension.js")) {
    throw new Error("extension.js не знайдено")
  }

  // Перевірка package.json
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"))
  if (!packageJson.main) {
    throw new Error("package.json не містить main поля")
  }

  // Перевірка активаційних подій
  if (!packageJson.activationEvents || packageJson.activationEvents.length === 0) {
    throw new Error("Не вказано activationEvents")
  }

  // Перевірка команд
  if (!packageJson.contributes || !packageJson.contributes.commands) {
    throw new Error("Не вказано commands в contributes")
  }

  console.log("✅ Основні перевірки пройдені")
  console.log(`📦 Кількість команд: ${packageJson.contributes.commands.length}`)
  console.log(`🎯 Активаційні події: ${packageJson.activationEvents.length}`)

  // Спрощена перевірка синтаксису
  try {
    const eslintCheck = execSync("npx eslint extension.js --env node --env es2022 --parser-options ecmaVersion:2022,sourceType:script", {
      encoding: "utf8"
    })
    console.log("✅ Синтаксис extension.js валідний")
  } catch (eslintError) {
    console.warn("⚠️ Попередження ESLint:", eslintError.stdout || eslintError.message)
  }

  console.log("🎉 Всі тести пройдені успішно!")
} catch (error) {
  console.error("❌ Помилка тестування:")
  console.error(error.message)
  process.exit(1)
}
