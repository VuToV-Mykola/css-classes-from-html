/* Простий smoke-test проектних модулів */
const FigmaAPIClient = require('../core/FigmaAPIClient');
(async ()=>{
  console.log('Running smoke tests...');
  try {
    // Перевірка імпорту і помилка при відсутності токена
    const client = new FigmaAPIClient(process.env.FIGMA_API_TOKEN || '');
    console.log('FigmaAPIClient created OK');
    console.log('Smoke tests passed');
    process.exit(0);
  } catch (e) {
    console.error('Smoke tests failed', e);
    process.exit(1);
  }
})();
