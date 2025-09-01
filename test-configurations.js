const fs = require('fs');
const path = require('path');

const testConfigurations = [
  {
    name: 'Мінімальна конфігурація',
    config: {
      language: 'uk',
      includeGlobal: false,
      includeReset: false,
      responsive: false,
      darkMode: false,
      cssVariables: false,
      minify: false,
      includeComments: false
    }
  },
  {
    name: 'Максимальна конфігурація',
    config: {
      language: 'en',
      includeGlobal: true,
      includeReset: true,
      responsive: true,
      darkMode: true,
      cssVariables: true,
      minify: true,
      includeComments: true,
      sortProperties: true,
      optimizeCSS: true,
      modernSyntax: true
    }
  },
  {
    name: 'Figma інтеграція',
    config: {
      enableInspection: true,
      inspectionPriority: 'figma-first',
      matchThreshold: 0.8,
      saveFigmaStyles: true,
      figmaInspectionDepth: 'full',
      figmaHierarchicalOutput: true,
      figmaMultiCanvas: true,
      universalGeneration: true
    }
  },
  {
    name: 'Швидка генерація',
    config: {
      quickGenerate: true,
      autoSave: true,
      rememberSettings: true,
      autoSelectCanvas: true,
      repeatLastAction: true,
      showConfigurationDialog: false
    }
  }
];

const testHtmlFiles = [
  {
    name: 'simple.html',
    content: `<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>
  <div class="container">
    <h1 class="title">Заголовок</h1>
    <p class="text">Текст</p>
  </div>
</body>
</html>`
  },
  {
    name: 'complex.html',
    content: `<!DOCTYPE html>
<html>
<head><title>Complex Test</title></head>
<body>
  <header class="header">
    <nav class="navigation">
      <ul class="nav-list">
        <li class="nav-item"><a class="nav-link">Головна</a></li>
      </ul>
    </nav>
  </header>
  <main class="main-content">
    <section class="hero-section">
      <div class="hero-container">
        <h1 class="hero-title">Головний заголовок</h1>
        <button class="hero-button">Кнопка</button>
      </div>
    </section>
  </main>
</body>
</html>`
  }
];

class ConfigurationTester {
  constructor() {
    this.results = [];
    this.testDir = path.join(__dirname, 'test-output');
  }

  async init() {
    if (!fs.existsSync(this.testDir)) {
      fs.mkdirSync(this.testDir, { recursive: true });
    }
  }

  async testConfiguration(config, htmlFile) {
    try {
      console.log(`Тестування конфігурації: ${config.name} з файлом: ${htmlFile.name}`);
      
      const htmlPath = path.join(this.testDir, htmlFile.name);
      fs.writeFileSync(htmlPath, htmlFile.content);

      console.log(`Застосовуємо конфігурацію: ${JSON.stringify(config.config, null, 2)}`);

      const result = await this.simulateGeneration(htmlPath, config.config);
      
      this.results.push({
        configName: config.name,
        htmlFile: htmlFile.name,
        success: result.success,
        output: result.output,
        errors: result.errors,
        performance: result.performance
      });

      return result;
    } catch (error) {
      console.error(`Помилка при тестуванні ${config.name}:`, error);
      return { success: false, errors: [error.message] };
    }
  }

  async simulateGeneration(htmlPath, config) {
    const startTime = Date.now();
    const errors = [];
    let output = '';

    try {
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');
      const classes = this.extractClasses(htmlContent);
      output = this.generateCSS(classes, config);
      this.validateCSS(output);
      
      const endTime = Date.now();
      
      return {
        success: true,
        output,
        errors,
        performance: {
          duration: endTime - startTime,
          classCount: classes.length,
          outputSize: output.length
        }
      };
    } catch (error) {
      errors.push(error.message);
      return {
        success: false,
        output,
        errors,
        performance: { duration: Date.now() - startTime }
      };
    }
  }

  extractClasses(html) {
    const classes = new Set();
    
    const patterns = [
      /class\s*=\s*"([^"]+)"/g,
      /class\s*=\s*'([^']+)'/g
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        match[1].split(/\s+/).forEach(cls => {
          if (cls.trim()) {
            classes.add(cls.trim());
          }
        });
      }
    });
    
    return Array.from(classes);
  }

  generateCSS(classes, config) {
    let css = '';
    
    if (config.includeComments) {
      const commentStyle = config.commentStyle === 'author' ? '!!!' : '/*';
      const commentEnd = config.commentStyle === 'author' ? '' : ' */';
      css += `${commentStyle} Згенеровано CSS Classes from HTML${commentEnd}\n`;
    }

    if (config.includeReset) {
      css += this.generateReset();
    }

    if (config.includeGlobal) {
      css += this.generateGlobalStyles(config);
    }

    classes.forEach(className => {
      css += this.generateClassCSS(className, config);
    });

    if (config.responsive) {
      css += this.generateResponsiveCSS(classes, config);
    }

    if (config.darkMode) {
      css += this.generateDarkModeCSS(classes, config);
    }

    if (config.minify) {
      css = this.minifyCSS(css);
    }

    return css;
  }

  generateReset() {
    return `
/* CSS Reset */
*, *::before, *::after {
  box-sizing: border-box;
}
* {
  margin: 0;
}
body {
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

`;
  }

  generateGlobalStyles(config) {
    const useVariables = config.cssVariables;
    
    if (useVariables) {
      return `
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

`;
    }
    
    return `
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

`;
  }

  generateClassCSS(className, config) {
    const indent = ' '.repeat(config.indentSize || 2);
    let css = '.' + className + ' {\n';
    let hasProperties = false;
    
    if (className.includes('container')) {
      css += indent + 'max-width: 1200px;\n' + indent + 'margin: 0 auto;\n' + indent + 'padding: 0 15px;\n';
      hasProperties = true;
    } else if (className.includes('title') || className.includes('heading')) {
      css += indent + 'font-size: 2rem;\n' + indent + 'font-weight: bold;\n';
      hasProperties = true;
    } else if (className.includes('button') || className.includes('btn')) {
      css += indent + 'padding: 10px 20px;\n' + indent + 'border: none;\n' + indent + 'cursor: pointer;\n';
      hasProperties = true;
    } else if (className.includes('nav')) {
      css += indent + 'display: flex;\n' + indent + 'align-items: center;\n';
      hasProperties = true;
    } else if (className.includes('text') || className.includes('paragraph')) {
      css += indent + 'line-height: 1.6;\n' + indent + 'margin-bottom: 1rem;\n';
      hasProperties = true;
    } else if (className.includes('header')) {
      css += indent + 'background: #f8f9fa;\n' + indent + 'padding: 1rem 0;\n';
      hasProperties = true;
    } else if (className.includes('section')) {
      css += indent + 'padding: 2rem 0;\n';
      hasProperties = true;
    } else {
      css += indent + '/* Додайте стилі для ' + className + ' */\n';
      css += indent + 'display: block;\n';
      hasProperties = true;
    }
    
    css += '}\n\n';
    
    return hasProperties ? css : '';
  }

  generateResponsiveCSS(classes, config) {
    const breakpoints = config.breakpoints || {
      mobile: '320px',
      tablet: '768px',
      desktop: '1158px'
    };
    
    let css = '';
    
    Object.entries(breakpoints).forEach(([device, size]) => {
      let hasResponsiveRules = false;
      let responsiveCSS = '@media (min-width: ' + size + ') {\n';
      
      classes.forEach(className => {
        let deviceCSS = '';
        
        if (device === 'mobile') {
          if (className.includes('container')) {
            deviceCSS = '    padding: 0 10px;\n';
          } else if (className.includes('title')) {
            deviceCSS = '    font-size: 1.5rem;\n';
          }
        } else if (device === 'tablet') {
          if (className.includes('container')) {
            deviceCSS = '    padding: 0 20px;\n';
          } else if (className.includes('title')) {
            deviceCSS = '    font-size: 1.8rem;\n';
          }
        } else if (device === 'desktop') {
          if (className.includes('container')) {
            deviceCSS = '    max-width: 1200px;\n';
          } else if (className.includes('title')) {
            deviceCSS = '    font-size: 2.5rem;\n';
          }
        }
        
        if (deviceCSS) {
          responsiveCSS += '  .' + className + ' {\n' + deviceCSS + '  }\n';
          hasResponsiveRules = true;
        }
      });
      
      responsiveCSS += '}\n\n';
      
      if (hasResponsiveRules) {
        css += responsiveCSS;
      }
    });
    
    return css;
  }

  generateDarkModeCSS(classes, config) {
    let css = '@media (prefers-color-scheme: dark) {\n';
    css += '  :root {\n';
    css += '    --bg-color: #1a1a1a;\n';
    css += '    --text-color: #ffffff;\n';
    css += '    --border-color: #333333;\n';
    css += '    --accent-color: #4a9eff;\n';
    css += '  }\n\n';
    
    let hasDarkRules = false;
    
    classes.forEach(className => {
      let darkCSS = '';
      
      if (className.includes('header')) {
        darkCSS = '    background: var(--bg-color);\n    color: var(--text-color);\n';
      } else if (className.includes('button') || className.includes('btn')) {
        darkCSS = '    background: var(--accent-color);\n    color: var(--text-color);\n';
      } else if (className.includes('text') || className.includes('title')) {
        darkCSS = '    color: var(--text-color);\n';
      } else if (className.includes('container') || className.includes('section')) {
        darkCSS = '    background: var(--bg-color);\n';
      }
      
      if (darkCSS) {
        css += '  .' + className + ' {\n' + darkCSS + '  }\n';
        hasDarkRules = true;
      }
    });
    
    css += '}\n\n';
    
    return hasDarkRules ? css : '';
  }

  minifyCSS(css) {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .replace(/;\s*}/g, '}')
      .replace(/{\s*/g, '{')
      .replace(/;\s*/g, ';')
      .replace(/\s*{\s*}/g, '')
      .replace(/}\s*}/g, '}}')
      .trim();
  }

  validateCSS(css) {
    const openBraces = (css.match(/{/g) || []).length;
    const closeBraces = (css.match(/}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      throw new Error('Неправильна кількість дужок у CSS');
    }
    
    if (css.includes('{}')) {
      throw new Error('Знайдено порожні CSS правила');
    }
  }

  async runAllTests() {
    await this.init();
    
    console.log('Початок тестування всіх конфігурацій...\n');
    
    for (const config of testConfigurations) {
      for (const htmlFile of testHtmlFiles) {
        await this.testConfiguration(config, htmlFile);
      }
    }
    
    this.generateReport();
  }

  generateReport() {
    console.log('\n=== ЗВІТ ТЕСТУВАННЯ ===\n');
    
    const successful = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    
    console.log(`Загальна статистика:`);
    console.log(`✅ Успішних тестів: ${successful}`);
    console.log(`❌ Невдалих тестів: ${failed}`);
    console.log(`📊 Загальна кількість: ${this.results.length}\n`);
    
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.configName} + ${result.htmlFile}`);
      
      if (result.performance) {
        console.log(`   ⏱️  Час: ${result.performance.duration}ms`);
        if (result.performance.classCount) {
          console.log(`   🏷️  Класів: ${result.performance.classCount}`);
        }
        if (result.performance.outputSize) {
          console.log(`   📄 Розмір: ${result.performance.outputSize} символів`);
        }
      }
      
      if (result.errors && result.errors.length > 0) {
        console.log(`   ⚠️  Помилки: ${result.errors.join(', ')}`);
      }
      console.log('');
    });
    
    const reportPath = path.join(this.testDir, 'test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`📋 Детальний звіт збережено: ${reportPath}`);
  }
}

module.exports = { ConfigurationTester, testConfigurations, testHtmlFiles };

if (require.main === module) {
  const tester = new ConfigurationTester();
  tester.runAllTests().catch(console.error);
}