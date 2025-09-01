#!/usr/bin/env node

const { ConfigurationTester } = require('./test-configurations');
const { EdgeCaseTester } = require('./test-edge-cases');
const fs = require('fs');
const path = require('path');

class MasterTester {
  constructor() {
    this.startTime = Date.now();
    this.testResults = {
      configurations: null,
      edgeCases: null,
      summary: {}
    };
  }

  async runAllTests() {
    console.log('🚀 Запуск повного тестування CSS Classes from HTML Extension\n');
    console.log('=' .repeat(60));
    
    try {
      // Тестування конфігурацій
      console.log('\n📋 ЕТАП 1: Тестування всіх конфігурацій');
      console.log('-'.repeat(40));
      
      const configTester = new ConfigurationTester();
      await configTester.runAllTests();
      this.testResults.configurations = configTester.results;
      
      // Тестування крайніх випадків
      console.log('\n🧪 ЕТАП 2: Тестування крайніх випадків');
      console.log('-'.repeat(40));
      
      const edgeTester = new EdgeCaseTester();
      await edgeTester.runAllTests();
      this.testResults.edgeCases = edgeTester.results;
      
      // Генерація підсумкового звіту
      this.generateMasterReport();
      
    } catch (error) {
      console.error('❌ Критична помилка під час тестування:', error);
      process.exit(1);
    }
  }

  generateMasterReport() {
    const endTime = Date.now();
    const totalDuration = endTime - this.startTime;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 ПІДСУМКОВИЙ ЗВІТ ТЕСТУВАННЯ');
    console.log('='.repeat(60));
    
    // Статистика конфігурацій
    const configResults = this.testResults.configurations || [];
    const configPassed = configResults.filter(r => r.success).length;
    const configTotal = configResults.length;
    
    console.log(`\n📋 Тестування конфігурацій:`);
    console.log(`   ✅ Успішно: ${configPassed}`);
    console.log(`   ❌ Невдало: ${configTotal - configPassed}`);
    console.log(`   📊 Всього: ${configTotal}`);
    
    if (configTotal > 0) {
      const configPercentage = Math.round((configPassed / configTotal) * 100);
      console.log(`   📈 Успішність: ${configPercentage}%`);
    }
    
    // Статистика крайніх випадків
    const edgeResults = this.testResults.edgeCases || {};
    const edgePassed = (edgeResults.edgeCases || []).filter(r => r.passed).length +
                      (edgeResults.performance || []).filter(r => r.passed).length +
                      (edgeResults.validation || []).filter(r => r.passed).length;
    
    const edgeTotal = (edgeResults.edgeCases || []).length +
                     (edgeResults.performance || []).length +
                     (edgeResults.validation || []).length;
    
    console.log(`\n🧪 Тестування крайніх випадків:`);
    console.log(`   ✅ Успішно: ${edgePassed}`);
    console.log(`   ❌ Невдало: ${edgeTotal - edgePassed}`);
    console.log(`   📊 Всього: ${edgeTotal}`);
    
    if (edgeTotal > 0) {
      const edgePercentage = Math.round((edgePassed / edgeTotal) * 100);
      console.log(`   📈 Успішність: ${edgePercentage}%`);
    }
    
    // Загальна статистика
    const totalPassed = configPassed + edgePassed;
    const totalTests = configTotal + edgeTotal;
    const overallPercentage = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;
    
    console.log(`\n🎯 ЗАГАЛЬНИЙ РЕЗУЛЬТАТ:`);
    console.log(`   ✅ Успішних тестів: ${totalPassed}`);
    console.log(`   ❌ Невдалих тестів: ${totalTests - totalPassed}`);
    console.log(`   📊 Загальна кількість: ${totalTests}`);
    console.log(`   📈 Загальна успішність: ${overallPercentage}%`);
    console.log(`   ⏱️  Загальний час: ${Math.round(totalDuration / 1000)}с`);
    
    // Оцінка якості
    this.displayQualityAssessment(overallPercentage);
    
    // Рекомендації
    this.displayRecommendations(configResults, edgeResults);
    
    // Збереження підсумкового звіту
    this.saveMasterReport(totalDuration, overallPercentage);
  }

  displayQualityAssessment(percentage) {
    console.log(`\n🏆 ОЦІНКА ЯКОСТІ:`);
    
    if (percentage >= 95) {
      console.log('   🌟 ВІДМІННО! Розширення готове до продакшену.');
      console.log('   🎉 Всі критичні тести пройдено успішно.');
    } else if (percentage >= 85) {
      console.log('   👍 ДОБРЕ! Розширення майже готове.');
      console.log('   🔧 Рекомендується виправити невеликі проблеми.');
    } else if (percentage >= 70) {
      console.log('   ⚠️  ЗАДОВІЛЬНО. Потрібні покращення.');
      console.log('   🛠️  Необхідно виправити основні проблеми.');
    } else {
      console.log('   ❌ НЕЗАДОВІЛЬНО. Критичні проблеми.');
      console.log('   🚨 Розширення не готове до використання.');
    }
  }

  displayRecommendations(configResults, edgeResults) {
    console.log(`\n💡 РЕКОМЕНДАЦІЇ:`);
    
    const failedConfigs = configResults.filter(r => !r.success);
    if (failedConfigs.length > 0) {
      console.log(`   🔧 Виправити проблеми з конфігураціями:`);
      failedConfigs.slice(0, 3).forEach(config => {
        console.log(`      - ${config.configName} + ${config.htmlFile}`);
      });
    }
    
    const failedEdgeCases = (edgeResults.edgeCases || []).filter(r => !r.passed);
    if (failedEdgeCases.length > 0) {
      console.log(`   🧪 Покращити обробку крайніх випадків:`);
      failedEdgeCases.slice(0, 3).forEach(test => {
        console.log(`      - ${test.name}`);
      });
    }
    
    const slowPerformance = (edgeResults.performance || []).filter(r => !r.passed);
    if (slowPerformance.length > 0) {
      console.log(`   ⚡ Оптимізувати продуктивність:`);
      slowPerformance.forEach(test => {
        console.log(`      - ${test.name}: ${test.duration}ms`);
      });
    }
    
    // Загальні рекомендації
    console.log(`   📚 Загальні поради:`);
    console.log(`      - Додати більше unit тестів`);
    console.log(`      - Покращити обробку помилок`);
    console.log(`      - Оптимізувати алгоритми парсингу`);
    console.log(`      - Додати кешування для покращення швидкості`);
  }

  saveMasterReport(duration, percentage) {
    const reportData = {
      timestamp: new Date().toISOString(),
      duration: duration,
      overallPercentage: percentage,
      configurations: this.testResults.configurations,
      edgeCases: this.testResults.edgeCases,
      summary: {
        totalTests: (this.testResults.configurations || []).length + 
                   ((this.testResults.edgeCases?.edgeCases || []).length +
                    (this.testResults.edgeCases?.performance || []).length +
                    (this.testResults.edgeCases?.validation || []).length),
        passedTests: (this.testResults.configurations || []).filter(r => r.success).length +
                    ((this.testResults.edgeCases?.edgeCases || []).filter(r => r.passed).length +
                     (this.testResults.edgeCases?.performance || []).filter(r => r.passed).length +
                     (this.testResults.edgeCases?.validation || []).filter(r => r.passed).length)
      }
    };
    
    const outputDir = path.join(__dirname, 'test-output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const reportPath = path.join(outputDir, 'master-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    
    // Створення HTML звіту
    this.generateHTMLReport(reportData, outputDir);
    
    console.log(`\n📋 Звіти збережено:`);
    console.log(`   📄 JSON: ${reportPath}`);
    console.log(`   🌐 HTML: ${path.join(outputDir, 'test-report.html')}`);
  }

  generateHTMLReport(data, outputDir) {
    const html = `
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Звіт тестування CSS Classes from HTML</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .warning { color: #ffc107; }
        .info { color: #17a2b8; }
        .card { border: 1px solid #dee2e6; border-radius: 8px; padding: 15px; margin: 10px 0; }
        .progress { background: #e9ecef; border-radius: 4px; height: 20px; overflow: hidden; }
        .progress-bar { background: #28a745; height: 100%; transition: width 0.3s; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #dee2e6; padding: 8px; text-align: left; }
        th { background: #f8f9fa; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 Звіт тестування CSS Classes from HTML Extension</h1>
        <p><strong>Дата:</strong> ${new Date(data.timestamp).toLocaleString('uk-UA')}</p>
        <p><strong>Тривалість:</strong> ${Math.round(data.duration / 1000)}с</p>
        <p><strong>Загальна успішність:</strong> <span class="${data.overallPercentage >= 85 ? 'success' : data.overallPercentage >= 70 ? 'warning' : 'error'}">${data.overallPercentage}%</span></p>
        
        <div class="progress">
            <div class="progress-bar" style="width: ${data.overallPercentage}%"></div>
        </div>
    </div>

    <div class="card">
        <h2>📊 Загальна статистика</h2>
        <p><span class="success">✅ Успішно:</span> ${data.summary.passedTests}</p>
        <p><span class="error">❌ Невдало:</span> ${data.summary.totalTests - data.summary.passedTests}</p>
        <p><span class="info">📊 Всього:</span> ${data.summary.totalTests}</p>
    </div>

    <div class="card">
        <h2>📋 Тестування конфігурацій</h2>
        <table>
            <thead>
                <tr>
                    <th>Конфігурація</th>
                    <th>HTML файл</th>
                    <th>Статус</th>
                    <th>Час (мс)</th>
                    <th>Класів</th>
                </tr>
            </thead>
            <tbody>
                ${(data.configurations || []).map(config => `
                    <tr>
                        <td>${config.configName}</td>
                        <td>${config.htmlFile}</td>
                        <td class="${config.success ? 'success' : 'error'}">${config.success ? '✅' : '❌'}</td>
                        <td>${config.performance?.duration || 'N/A'}</td>
                        <td>${config.performance?.classCount || 'N/A'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="card">
        <h2>🧪 Крайні випадки</h2>
        <table>
            <thead>
                <tr>
                    <th>Тест</th>
                    <th>Статус</th>
                    <th>Очікувано</th>
                    <th>Отримано</th>
                </tr>
            </thead>
            <tbody>
                ${(data.edgeCases?.edgeCases || []).map(test => `
                    <tr>
                        <td>${test.name}</td>
                        <td class="${test.passed ? 'success' : 'error'}">${test.passed ? '✅' : '❌'}</td>
                        <td>${Array.isArray(test.expected) ? test.expected.join(', ') : test.expected}</td>
                        <td>${test.actualCount || (Array.isArray(test.actual) ? test.actual.join(', ') : test.actual)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="card">
        <h2>⚡ Продуктивність</h2>
        <table>
            <thead>
                <tr>
                    <th>Тест</th>
                    <th>Статус</th>
                    <th>Час (мс)</th>
                    <th>Деталі</th>
                </tr>
            </thead>
            <tbody>
                ${(data.edgeCases?.performance || []).map(test => `
                    <tr>
                        <td>${test.name}</td>
                        <td class="${test.passed ? 'success' : 'error'}">${test.passed ? '✅' : '❌'}</td>
                        <td>${test.duration}</td>
                        <td>${test.classCount ? `Класів: ${test.classCount}` : ''}${test.outputSize ? `, Розмір: ${test.outputSize}` : ''}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <script>
        // Додаємо інтерактивність
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Звіт тестування завантажено');
        });
    </script>
</body>
</html>`;

    const htmlPath = path.join(outputDir, 'test-report.html');
    fs.writeFileSync(htmlPath, html);
  }
}

// Запуск тестування
if (require.main === module) {
  const masterTester = new MasterTester();
  masterTester.runAllTests().catch(error => {
    console.error('❌ Критична помилка:', error);
    process.exit(1);
  });
}

module.exports = { MasterTester };