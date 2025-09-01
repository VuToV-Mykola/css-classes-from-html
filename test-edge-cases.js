const fs = require('fs');
const path = require('path');

// Тестові випадки для перевірки крайніх сценаріїв
const edgeCaseTests = [
  {
    name: 'Порожній HTML',
    html: '<!DOCTYPE html><html><head></head><body></body></html>',
    expectedClasses: []
  },
  {
    name: 'HTML без класів',
    html: `<!DOCTYPE html>
<html>
<body>
  <div>
    <h1>Заголовок без класів</h1>
    <p>Параграф без класів</p>
  </div>
</body>
</html>`,
    expectedClasses: []
  },
  {
    name: 'Дублікати класів',
    html: `<div class="container container main main">
  <p class="text text">Дублікати</p>
</div>`,
    expectedClasses: ['container', 'main', 'text']
  },
  {
    name: 'Спеціальні символи в класах',
    html: `<div class="my-class_name test123 -prefix">
  <span class="icon:before data-test">Спеціальні символи</span>
</div>`,
    expectedClasses: ['my-class_name', 'test123', '-prefix', 'icon:before', 'data-test']
  },
  {
    name: 'Довгі назви класів',
    html: `<div class="very-long-class-name-that-exceeds-normal-length-and-should-be-handled-properly">
  <p class="another-extremely-long-class-name-for-testing-purposes-only">Довгі класи</p>
</div>`,
    expectedClasses: [
      'very-long-class-name-that-exceeds-normal-length-and-should-be-handled-properly',
      'another-extremely-long-class-name-for-testing-purposes-only'
    ]
  },
  {
    name: 'Кирилічні символи в класах',
    html: `<div class="контейнер головний">
  <h1 class="заголовок-укр">Українські класи</h1>
</div>`,
    expectedClasses: ['контейнер', 'головний', 'заголовок-укр']
  },
  {
    name: 'Змішані лапки',
    html: `<div class='single-quotes' class="double-quotes">
  <span class='mixed "quotes" test'>Змішані лапки</span>
</div>`,
    expectedClasses: ['single-quotes', 'double-quotes', 'mixed', 'quotes', 'test']
  },
  {
    name: 'Великий HTML файл',
    html: generateLargeHTML(),
    expectedMinClasses: 100
  }
];

function generateLargeHTML() {
  let html = '<!DOCTYPE html><html><body>';
  
  for (let i = 0; i < 100; i++) {
    html += `
    <section class="section-${i} container-${i % 10}">
      <div class="wrapper-${i} content-${i % 5}">
        <h2 class="title-${i} heading-${i % 3}">Заголовок ${i}</h2>
        <p class="text-${i} paragraph-${i % 7}">Текст параграфу ${i}</p>
        <button class="btn-${i} button-${i % 4}">Кнопка ${i}</button>
      </div>
    </section>`;
  }
  
  html += '</body></html>';
  return html;
}

// Тести продуктивності
const performanceTests = [
  {
    name: 'Швидкість парсингу',
    test: async (tester) => {
      const startTime = Date.now();
      const classes = tester.extractClasses(edgeCaseTests[7].html); // Великий HTML
      const endTime = Date.now();
      
      return {
        duration: endTime - startTime,
        classCount: classes.length,
        passed: endTime - startTime < 1000 // Має бути швидше 1 секунди
      };
    }
  },
  {
    name: 'Генерація великого CSS',
    test: async (tester) => {
      const classes = Array.from({length: 1000}, (_, i) => `class-${i}`);
      const config = { includeComments: true, responsive: true, darkMode: true };
      
      const startTime = Date.now();
      const css = tester.generateCSS(classes, config);
      const endTime = Date.now();
      
      return {
        duration: endTime - startTime,
        outputSize: css.length,
        passed: endTime - startTime < 5000 // Має бути швидше 5 секунд
      };
    }
  }
];

// Тести валідації
const validationTests = [
  {
    name: 'Валідний CSS синтаксис',
    test: (css) => {
      try {
        // Перевірка базового синтаксису
        const rules = css.split('}').filter(rule => rule.trim());
        
        for (const rule of rules) {
          if (rule.includes('{')) {
            const [selector, declarations] = rule.split('{');
            
            // Перевірка селектора
            if (!selector.trim()) {
              throw new Error('Порожній селектор');
            }
            
            // Перевірка декларацій
            if (declarations) {
              const props = declarations.split(';').filter(p => p.trim());
              for (const prop of props) {
                if (prop.includes(':') && !prop.includes('/*')) {
                  const [property, value] = prop.split(':');
                  if (!property.trim() || !value.trim()) {
                    throw new Error(`Невалідна властивість: ${prop}`);
                  }
                }
              }
            }
          }
        }
        
        return { passed: true };
      } catch (error) {
        return { passed: false, error: error.message };
      }
    }
  },
  {
    name: 'Правильність структури',
    test: (css) => {
      const openBraces = (css.match(/{/g) || []).length;
      const closeBraces = (css.match(/}/g) || []).length;
      
      return {
        passed: openBraces === closeBraces,
        openBraces,
        closeBraces
      };
    }
  }
];

class EdgeCaseTester {
  constructor() {
    this.results = {
      edgeCases: [],
      performance: [],
      validation: []
    };
  }

  async runEdgeCaseTests() {
    console.log('🧪 Тестування крайніх випадків...\n');
    
    for (const test of edgeCaseTests) {
      try {
        const classes = this.extractClasses(test.html);
        
        let passed = false;
        if (test.expectedClasses) {
          passed = this.arraysEqual(classes.sort(), test.expectedClasses.sort());
        } else if (test.expectedMinClasses) {
          passed = classes.length >= test.expectedMinClasses;
        }
        
        this.results.edgeCases.push({
          name: test.name,
          passed,
          expected: test.expectedClasses || `мін. ${test.expectedMinClasses}`,
          actual: classes,
          actualCount: classes.length
        });
        
        const status = passed ? '✅' : '❌';
        console.log(`${status} ${test.name}: ${classes.length} класів`);
        
      } catch (error) {
        this.results.edgeCases.push({
          name: test.name,
          passed: false,
          error: error.message
        });
        console.log(`❌ ${test.name}: Помилка - ${error.message}`);
      }
    }
  }

  async runPerformanceTests() {
    console.log('\n⚡ Тестування продуктивності...\n');
    
    for (const test of performanceTests) {
      try {
        const result = await test.test(this);
        
        this.results.performance.push({
          name: test.name,
          ...result
        });
        
        const status = result.passed ? '✅' : '❌';
        console.log(`${status} ${test.name}: ${result.duration}ms`);
        
      } catch (error) {
        this.results.performance.push({
          name: test.name,
          passed: false,
          error: error.message
        });
        console.log(`❌ ${test.name}: Помилка - ${error.message}`);
      }
    }
  }

  async runValidationTests() {
    console.log('\n🔍 Тестування валідації...\n');
    
    // Генеруємо тестовий CSS
    const testClasses = ['container', 'title', 'button', 'text'];
    const testConfig = {
      includeComments: true,
      includeReset: true,
      responsive: true,
      cssVariables: true
    };
    
    const css = this.generateCSS(testClasses, testConfig);
    
    for (const test of validationTests) {
      try {
        const result = test.test(css);
        
        this.results.validation.push({
          name: test.name,
          ...result
        });
        
        const status = result.passed ? '✅' : '❌';
        console.log(`${status} ${test.name}`);
        if (!result.passed && result.error) {
          console.log(`   Помилка: ${result.error}`);
        }
        
      } catch (error) {
        this.results.validation.push({
          name: test.name,
          passed: false,
          error: error.message
        });
        console.log(`❌ ${test.name}: Помилка - ${error.message}`);
      }
    }
  }

  // Допоміжні методи (копії з основного тестера)
  extractClasses(html) {
    const classRegex = /class\s*=\s*["']([^"']+)["']/g;
    const classes = new Set();
    let match;
    
    while ((match = classRegex.exec(html)) !== null) {
      match[1].split(/\s+/).forEach(cls => {
        if (cls.trim()) classes.add(cls.trim());
      });
    }
    
    return Array.from(classes);
  }

  generateCSS(classes, config) {
    let css = '';
    
    if (config.includeComments) {
      css += '/* Тестовий CSS */\n';
    }

    if (config.includeReset) {
      css += '*, *::before, *::after { box-sizing: border-box; }\n';
    }

    if (config.cssVariables) {
      css += ':root { --primary: #007bff; }\n';
    }

    classes.forEach(className => {
      css += `.${className} {\n  /* Стилі для ${className} */\n}\n`;
    });

    if (config.responsive) {
      css += '@media (min-width: 768px) {\n  .container { max-width: 1200px; }\n}\n';
    }

    return css;
  }

  arraysEqual(a, b) {
    return a.length === b.length && a.every((val, i) => val === b[i]);
  }

  generateReport() {
    console.log('\n=== ЗВІТ КРАЙНІХ ВИПАДКІВ ===\n');
    
    // Статистика крайніх випадків
    const edgePassed = this.results.edgeCases.filter(r => r.passed).length;
    const edgeTotal = this.results.edgeCases.length;
    console.log(`🧪 Крайні випадки: ${edgePassed}/${edgeTotal} пройдено`);
    
    // Статистика продуктивності
    const perfPassed = this.results.performance.filter(r => r.passed).length;
    const perfTotal = this.results.performance.length;
    console.log(`⚡ Продуктивність: ${perfPassed}/${perfTotal} пройдено`);
    
    // Статистика валідації
    const validPassed = this.results.validation.filter(r => r.passed).length;
    const validTotal = this.results.validation.length;
    console.log(`🔍 Валідація: ${validPassed}/${validTotal} пройдено`);
    
    // Загальна оцінка
    const totalPassed = edgePassed + perfPassed + validPassed;
    const totalTests = edgeTotal + perfTotal + validTotal;
    const percentage = Math.round((totalPassed / totalTests) * 100);
    
    console.log(`\n📊 Загальний результат: ${totalPassed}/${totalTests} (${percentage}%)`);
    
    if (percentage >= 90) {
      console.log('🎉 Відмінно! Всі основні тести пройдено.');
    } else if (percentage >= 70) {
      console.log('👍 Добре! Більшість тестів пройдено.');
    } else {
      console.log('⚠️ Потрібні покращення. Багато тестів не пройдено.');
    }
    
    // Збереження детального звіту
    const reportPath = path.join(__dirname, 'test-output', 'edge-cases-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📋 Детальний звіт збережено: ${reportPath}`);
  }

  async runAllTests() {
    await this.runEdgeCaseTests();
    await this.runPerformanceTests();
    await this.runValidationTests();
    this.generateReport();
  }
}

module.exports = { EdgeCaseTester, edgeCaseTests, performanceTests, validationTests };

if (require.main === module) {
  const tester = new EdgeCaseTester();
  tester.runAllTests().catch(console.error);
}