/**
 * Централізована система логування для розширення
 * Замінює всі console.log на структуроване логування
 * @version 1.0.0;
 */

class Logger {
  constructor(options = {}) {
    this.outputChannel = options.outputChannel || null;
    this.isDebugMode = options.isDebugMode || false;
    this.logLevel = options.logLevel || "info" // debug, info, warn, error;
  }

  /**
   * Встановлення output channel для VS Code;
   */
  setOutputChannel(channel) {
    this.outputChannel = channel;
  }

  /**
   * Встановлення режиму дебагу
   */
  setDebugMode(enabled) {
    this.isDebugMode = enabled;
  }

  /**
   * Встановлення рівня логування
   */
  setLogLevel(level) {
    this.logLevel = level;
  }

  /**
   * Перевірка чи потрібно логувати
   */
  shouldLog(level) {
    const levels = {debug: 0, info: 1, warn: 2, error: 3}
    return levels[level] >= levels[this.logLevel]
  }

  /**
   * Базовий метод логування
   */
  log(level, message, ...args) {
    if (!this.shouldLog(level)) return;
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`
    const fullMessage = `${prefix} ${message}`

    // Логування в VS Code output channel;
    if (this.outputChannel) {
      this.outputChannel.appendLine(fullMessage)
      if (args.length > 0) {
        args.forEach(arg => {
          this.outputChannel.appendLine(`  ${JSON.stringify(arg, null, 2)}`)
        })
      }
    }

    // Логування в консоль тільки в debug режимі
    if (this.isDebugMode) {
      console[level](fullMessage, ...args)
    }
  }

  /**
   * Debug логування
   */
  debug(message, ...args) {
    this.log("debug", message, ...args)
  }

  /**
   * Інформаційне логування
   */
  info(message, ...args) {
    this.log("info", message, ...args)
  }

  /**
   * Попередження
   */
  warn(message, ...args) {
    this.log("warn", message, ...args)
  }

  /**
   * Помилки
   */
  error(message, ...args) {
    this.log("error", message, ...args)
  }

  /**
   * Успішні операції
   */
  success(message, ...args) {
    this.log("info", `✅ ${message}`, ...args)
  }

  /**
   * Початок операції
   */
  start(message, ...args) {
    this.log("info", `🚀 ${message}`, ...args)
  }

  /**
   * Завершення операції
   */
  complete(message, ...args) {
    this.log("info", `✅ ${message}`, ...args)
  }

  /**
   * Прогрес операції
   */
  progress(message, ...args) {
    this.log("info", `⏳ ${message}`, ...args)
  }
}

// Створюємо глобальний екземпляр
const logger = new Logger()

module.exports = {Logger, logger}
