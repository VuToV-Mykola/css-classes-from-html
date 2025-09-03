/* !!! Тест інтеграції нових модулів !!! */
const HierarchyAnalyzer = require('../modules/hierarchyAnalyzer');
const AdvancedStyleMatcher = require('../modules/advancedStyleMatcher');
const ConfigurationManager = require('../modules/configurationManager');

async function runTests() {
  console.log('🧪 Запуск тестів інтеграції...\n');
  
  let passed = 0;
  let failed = 0;
  
  // Тест 1: HierarchyAnalyzer
  try {
    const analyzer = new HierarchyAnalyzer();
    const testData = {
      hierarchy: new Map([
        ['test1', { name: 'Test', type: 'div', children: [] }]
      ])
    };
    const result = analyzer.analyzeHierarchy(testData, 'html');
    
    if (result.nodeCount > 0) {
      console.log('✅ HierarchyAnalyzer працює коректно');
      passed++;
    } else {
      throw new Error('Невірний результат аналізу');
    }
  } catch (error) {
    console.error('❌ HierarchyAnalyzer тест провалився:', error.message);
    failed++;
  }
  
  // Тест 2: AdvancedStyleMatcher
  try {
    const matcher = new AdvancedStyleMatcher();
    console.log('✅ AdvancedStyleMatcher ініціалізовано');
    passed++;
  } catch (error) {
    console.error('❌ AdvancedStyleMatcher тест провалився:', error.message);
    failed++;
  }
  
  // Тест 3: ConfigurationManager - 3 режими
  try {
    const configManager = new ConfigurationManager();
    const modes = ['minimal', 'maximum', 'production'];
    
    for (const mode of modes) {
      const config = await configManager.applyMode(mode);
      if (config) {
        console.log(`✅ Режим "${mode}" працює коректно`);
        passed++;
      }
    }
  } catch (error) {
    console.error('❌ ConfigurationManager тест провалився:', error.message);
    failed++;
  }
  
  // Результати
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Результати тестування:`);
  console.log(`   ✅ Пройшло: ${passed}`);
  console.log(`   ❌ Провалилось: ${failed}`);
  console.log('='.repeat(50));
  
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(console.error);
