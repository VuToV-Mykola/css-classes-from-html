#!/usr/bin/env node

/**
 * Test Runner для Figma-HTML Integration
 */

const FigmaHTMLIntegration = require('../main');
const TestingUtils = require('../utils/TestingUtils');
const fs = require('fs');
const path = require('path');

async function runAllTests() {
  console.log('🧪 Запуск повного набору тестів...\n');
  
  const integration = new FigmaHTMLIntegration({
    figmaToken: 'test-token',
    debug: true
  });

  const tester = new TestingUtils({
    verbose: true,
    generateReports: true
  });

  const results = await tester.runFullTestSuite(integration);

  // Збереження звіту
  const reportPath = path.join(__dirname, '..', 'log', 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results.report, null, 2));

  console.log(`\n📄 Звіт збережено: ${reportPath}`);
  
  // Вихід з відповідним кодом
  process.exit(results.failed > 0 ? 1 : 0);
}

runAllTests().catch(error => {
  console.error('❌ Критична помилка:', error);
  process.exit(1);
});
