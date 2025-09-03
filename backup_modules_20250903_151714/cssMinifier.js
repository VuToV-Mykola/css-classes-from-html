/* !!! Модуль мінімізації CSS з покращеною обробкою помилок !!! */

function minifyCSS(css) {
  // Валідація вхідних даних
  if (!css || typeof css !== 'string') {
    console.warn('cssMinifier: Некоректний CSS контент')
    return css || ''
  }

  try {
    // Оптимізована мінімізація одним проходом
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Видаляємо коментарі
      .replace(/\s+/g, ' ') // Замінюємо множинні пробіли
      .replace(/;\s*}/g, '}') // Видаляємо останню крапку з комою
      .replace(/\s*([{}:;,])\s*/g, '$1') // Видаляємо пробіли навколо спецсимволів
      .trim()
  } catch (error) {
    console.error('cssMinifier: Помилка мінімізації:', error.message)
    return css // Повертаємо оригінальний CSS при помилці
  }
}

module.exports = { minifyCSS }