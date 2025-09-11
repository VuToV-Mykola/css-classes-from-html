/**
 * 🧪 Тестовий файл для перевірки UniversalMatchingEngine
 * Тестує інтеграцію з реальними даними Figma та HTML
 */

const UniversalMatchingEngine = require('./backend/matchers/UniversalMatchingEngine');
const fs = require('fs');
const path = require('path');

async function testUniversalMatching() {
  console.log('🧪 Початок тестування UniversalMatchingEngine...');
  
  try {
    // 1. Ініціалізація двигуна
    const matchingEngine = new UniversalMatchingEngine({
      thresholds: {
        high: 0.9,
        medium: 0.7,
        low: 0.5,
        reject: 0.3
      },
      weights: {
        text: 0.4,
        hierarchy: 0.3,
        semantic: 0.2,
        style: 0.1
      }
    });
    
    console.log('✅ UniversalMatchingEngine ініціалізовано');
    
    // 2. Завантаження тестових даних
    const figmaDataPath = path.join(__dirname, 'figma-data.json');
    const htmlDataPath = path.join(__dirname, 'test-figma.html');
    
    if (!fs.existsSync(figmaDataPath)) {
      throw new Error('Файл figma-data.json не знайдено');
    }
    
    if (!fs.existsSync(htmlDataPath)) {
      throw new Error('Файл test-figma.html не знайдено');
    }
    
    const figmaData = JSON.parse(fs.readFileSync(figmaDataPath, 'utf8'));
    const htmlContent = fs.readFileSync(htmlDataPath, 'utf8');
    
    console.log('✅ Тестові дані завантажено');
    console.log(`📊 Figma елементів: ${figmaData.document?.children?.length || 0}`);
    console.log(`📄 HTML розмір: ${htmlContent.length} символів`);
    
    // 3. Виконання співставлення
    console.log('🎯 Початок співставлення...');
    const startTime = performance.now();
    
    const matches = await matchingEngine.match(figmaData, htmlContent);
    
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    
    console.log('✅ Співставлення завершено');
    console.log(`⏱️ Час обробки: ${processingTime.toFixed(2)}ms`);
    
    // 4. Аналіз результатів
    const stats = matchingEngine.getStatistics();
    console.log('\n📊 Статистика співставлення:');
    console.log(`   • Всього співставлень: ${stats.totalMatches}`);
    console.log(`   • Успішних: ${stats.successfulMatches}`);
    console.log(`   • Невдалих: ${stats.failedMatches}`);
    console.log(`   • Середня впевненість: ${(stats.averageConfidence * 100).toFixed(1)}%`);
    console.log(`   • Швидкість успіху: ${stats.successRate.toFixed(1)}%`);
    
    // 5. Детальний аналіз співставлень
    console.log('\n🔍 Детальний аналіз співставлень:');
    
    const highConfidence = matches.filter(m => m.confidence >= 0.9);
    const mediumConfidence = matches.filter(m => m.confidence >= 0.7 && m.confidence < 0.9);
    const lowConfidence = matches.filter(m => m.confidence >= 0.5 && m.confidence < 0.7);
    const rejected = matches.filter(m => m.confidence < 0.5);
    
    console.log(`   • Високе співпадіння (≥90%): ${highConfidence.length}`);
    console.log(`   • Середнє співпадіння (70-89%): ${mediumConfidence.length}`);
    console.log(`   • Низьке співпадіння (50-69%): ${lowConfidence.length}`);
    console.log(`   • Відхилені (<50%): ${rejected.length}`);
    
    // 6. Приклади найкращих співставлень
    console.log('\n🏆 Топ-5 найкращих співставлень:');
    const topMatches = matches
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
    
    topMatches.forEach((match, index) => {
      console.log(`   ${index + 1}. ${match.type} - ${(match.confidence * 100).toFixed(1)}%`);
      if (match.metadata) {
        if (match.metadata.figmaText && match.metadata.htmlText) {
          console.log(`      Figma: "${match.metadata.figmaText}"`);
          console.log(`      HTML: "${match.metadata.htmlText}"`);
        }
        if (match.metadata.figmaName && match.metadata.htmlTag) {
          console.log(`      Figma: ${match.metadata.figmaName} (${match.metadata.figmaType})`);
          console.log(`      HTML: <${match.metadata.htmlTag}> (${match.metadata.htmlClass || 'no class'})`);
        }
      }
      console.log('');
    });
    
    // 7. Аналіз по типах алгоритмів
    console.log('🔬 Аналіз по типах алгоритмів:');
    const algorithmStats = {};
    matches.forEach(match => {
      const algorithm = match.algorithm || 'unknown';
      if (!algorithmStats[algorithm]) {
        algorithmStats[algorithm] = { count: 0, totalConfidence: 0 };
      }
      algorithmStats[algorithm].count++;
      algorithmStats[algorithm].totalConfidence += match.confidence;
    });
    
    Object.entries(algorithmStats).forEach(([algorithm, stats]) => {
      const avgConfidence = stats.totalConfidence / stats.count;
      console.log(`   • ${algorithm}: ${stats.count} співставлень, середня впевненість ${(avgConfidence * 100).toFixed(1)}%`);
    });
    
    // 8. Збереження результатів
    const resultsPath = path.join(__dirname, 'matching-results.json');
    const results = {
      timestamp: new Date().toISOString(),
      processingTime: processingTime,
      statistics: stats,
      matches: matches.map(match => ({
        confidence: match.confidence,
        type: match.type,
        algorithm: match.algorithm,
        metadata: match.metadata
      })),
      algorithmStats: algorithmStats
    };
    
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Результати збережено в ${resultsPath}`);
    
    // 9. Висновки
    console.log('\n🎯 Висновки:');
    if (stats.successRate >= 80) {
      console.log('✅ Відмінний результат! Система показує високу точність співставлення.');
    } else if (stats.successRate >= 60) {
      console.log('⚠️ Добрий результат, але є можливості для покращення.');
    } else {
      console.log('❌ Результат потребує оптимізації алгоритмів.');
    }
    
    if (stats.averageConfidence >= 0.8) {
      console.log('✅ Висока середня впевненість співставлень.');
    } else {
      console.log('⚠️ Середня впевненість може бути покращена.');
    }
    
    console.log('\n🎉 Тестування завершено успішно!');
    
  } catch (error) {
    console.error('❌ Помилка при тестуванні:', error);
    process.exit(1);
  }
}

// Запуск тесту
if (require.main === module) {
  testUniversalMatching();
}

module.exports = { testUniversalMatching };

