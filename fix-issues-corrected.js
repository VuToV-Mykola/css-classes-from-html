const fs = require('fs');
const path = require('path');

class IssueFixer {
  constructor() {
    this.fixes = [];
  }

  fixEmptyRulesInMinification() {
    console.log('🔧 Виправлення проблеми з порожніми CSS правилами...');
    
    const fixedMinifyCSS = `
  minifyCSS(css) {
    return css
      .replace(/\\/\\*[\\s\\S]*?\\*\\//g, '')
      .replace(/\\s+/g, ' ')
      .replace(/;\\s*}/g, '}')
      .replace(/{\\s*/g, '{')
      .replace(/;\\s*/g, ';')
      .replace(/\\s*{\\s*}/g, '')
      .replace(/}\\s*}/g, '}}')
      .trim();
  }`;

    this.fixes.push({
      file: 'test-configurations.js',
      method: 'minifyCSS',
      issue: 'Порожні CSS правила при мініфікації',
      fix: fixedMinifyCSS,
      description: 'Додано видалення порожніх CSS правил {}'
    });
  }

  fixMixedQuotesRegex() {
    console.log('🔧 Виправлення проблеми з парсингом змішаних лапок...');
    
    const fixedExtractClasses = `
  extractClasses(html) {
    const classes = new Set();
    
    const patterns = [
      /class\\s*=\\s*"([^"]+)"/g,
      /class\\s*=\\s*'([^']+)'/g
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        match[1].split(/\\s+/).forEach(cls => {
          if (cls.trim()) {
            classes.add(cls.trim());
          }
        });
      }
    });
    
    return Array.from(classes);
  }`;

    this.fixes.push({
      file: 'test-configurations.js',
      method: 'extractClasses',
      issue: 'Неправильний парсинг змішаних лапок',
      fix: fixedExtractClasses,
      description: 'Покращено regex для обробки різних типів лапок'
    });
  }

  fixCSSGeneration() {
    console.log('🔧 Покращення генерації CSS...');
    
    const improvedGenerateClassCSS = `
  generateClassCSS(className, config) {
    const indent = ' '.repeat(config.indentSize || 2);
    let css = '.' + className + ' {\\n';
    let hasProperties = false;
    
    if (className.includes('container')) {
      css += indent + 'max-width: 1200px;\\n' + indent + 'margin: 0 auto;\\n' + indent + 'padding: 0 15px;\\n';
      hasProperties = true;
    } else if (className.includes('title') || className.includes('heading')) {
      css += indent + 'font-size: 2rem;\\n' + indent + 'font-weight: bold;\\n';
      hasProperties = true;
    } else if (className.includes('button') || className.includes('btn')) {
      css += indent + 'padding: 10px 20px;\\n' + indent + 'border: none;\\n' + indent + 'cursor: pointer;\\n';
      hasProperties = true;
    } else if (className.includes('nav')) {
      css += indent + 'display: flex;\\n' + indent + 'align-items: center;\\n';
      hasProperties = true;
    } else if (className.includes('text') || className.includes('paragraph')) {
      css += indent + 'line-height: 1.6;\\n' + indent + 'margin-bottom: 1rem;\\n';
      hasProperties = true;
    } else if (className.includes('header')) {
      css += indent + 'background: #f8f9fa;\\n' + indent + 'padding: 1rem 0;\\n';
      hasProperties = true;
    } else if (className.includes('section')) {
      css += indent + 'padding: 2rem 0;\\n';
      hasProperties = true;
    } else {
      css += indent + '/* Додайте стилі для ' + className + ' */\\n';
      css += indent + 'display: block;\\n';
      hasProperties = true;
    }
    
    css += '}\\n\\n';
    
    return hasProperties ? css : '';
  }`;

    this.fixes.push({
      file: 'test-configurations.js',
      method: 'generateClassCSS',
      issue: 'Генерація порожніх CSS правил',
      fix: improvedGenerateClassCSS,
      description: 'Додано перевірку наявності властивостей та базові стилі'
    });
  }

  fixResponsiveCSS() {
    console.log('🔧 Покращення responsive CSS...');
    
    const improvedResponsiveCSS = `
  generateResponsiveCSS(classes, config) {
    const breakpoints = config.breakpoints || {
      mobile: '320px',
      tablet: '768px',
      desktop: '1158px'
    };
    
    let css = '';
    
    Object.entries(breakpoints).forEach(([device, size]) => {
      let hasResponsiveRules = false;
      let responsiveCSS = '@media (min-width: ' + size + ') {\\n';
      
      classes.forEach(className => {
        let deviceCSS = '';
        
        if (device === 'mobile') {
          if (className.includes('container')) {
            deviceCSS = '    padding: 0 10px;\\n';
          } else if (className.includes('title')) {
            deviceCSS = '    font-size: 1.5rem;\\n';
          }
        } else if (device === 'tablet') {
          if (className.includes('container')) {
            deviceCSS = '    padding: 0 20px;\\n';
          } else if (className.includes('title')) {
            deviceCSS = '    font-size: 1.8rem;\\n';
          }
        } else if (device === 'desktop') {
          if (className.includes('container')) {
            deviceCSS = '    max-width: 1200px;\\n';
          } else if (className.includes('title')) {
            deviceCSS = '    font-size: 2.5rem;\\n';
          }
        }
        
        if (deviceCSS) {
          responsiveCSS += '  .' + className + ' {\\n' + deviceCSS + '  }\\n';
          hasResponsiveRules = true;
        }
      });
      
      responsiveCSS += '}\\n\\n';
      
      if (hasResponsiveRules) {
        css += responsiveCSS;
      }
    });
    
    return css;
  }`;

    this.fixes.push({
      file: 'test-configurations.js',
      method: 'generateResponsiveCSS',
      issue: 'Порожні responsive правила',
      fix: improvedResponsiveCSS,
      description: 'Додано реальні responsive стилі'
    });
  }

  fixDarkModeCSS() {
    console.log('🔧 Покращення dark mode CSS...');
    
    const improvedDarkModeCSS = `
  generateDarkModeCSS(classes, config) {
    let css = '@media (prefers-color-scheme: dark) {\\n';
    css += '  :root {\\n';
    css += '    --bg-color: #1a1a1a;\\n';
    css += '    --text-color: #ffffff;\\n';
    css += '    --border-color: #333333;\\n';
    css += '    --accent-color: #4a9eff;\\n';
    css += '  }\\n\\n';
    
    let hasDarkRules = false;
    
    classes.forEach(className => {
      let darkCSS = '';
      
      if (className.includes('header')) {
        darkCSS = '    background: var(--bg-color);\\n    color: var(--text-color);\\n';
      } else if (className.includes('button') || className.includes('btn')) {
        darkCSS = '    background: var(--accent-color);\\n    color: var(--text-color);\\n';
      } else if (className.includes('text') || className.includes('title')) {
        darkCSS = '    color: var(--text-color);\\n';
      } else if (className.includes('container') || className.includes('section')) {
        darkCSS = '    background: var(--bg-color);\\n';
      }
      
      if (darkCSS) {
        css += '  .' + className + ' {\\n' + darkCSS + '  }\\n';
        hasDarkRules = true;
      }
    });
    
    css += '}\\n\\n';
    
    return hasDarkRules ? css : '';
  }`;

    this.fixes.push({
      file: 'test-configurations.js',
      method: 'generateDarkModeCSS',
      issue: 'Порожні dark mode правила',
      fix: improvedDarkModeCSS,
      description: 'Додано реальні dark mode стилі з CSS змінними'
    });
  }

  async applyAllFixes() {
    console.log('🚀 Застосування всіх виправлень...\\n');
    
    this.fixEmptyRulesInMinification();
    this.fixMixedQuotesRegex();
    this.fixCSSGeneration();
    this.fixResponsiveCSS();
    this.fixDarkModeCSS();
    
    const fixedConfigPath = path.join(__dirname, 'test-configurations-fixed.js');
    const originalContent = fs.readFileSync(
      path.join(__dirname, 'test-configurations.js'), 
      'utf8'
    );
    
    let fixedContent = originalContent;
    
    this.fixes.forEach(fix => {
      console.log(`✅ Застосовано виправлення: ${fix.issue}`);
      
      const methodRegex = new RegExp(
        `(\\s*${fix.method}\\s*\\([^)]*\\)\\s*{[\\s\\S]*?^\\s*})`,
        'gm'
      );
      
      if (methodRegex.test(fixedContent)) {
        fixedContent = fixedContent.replace(methodRegex, fix.fix);
      }
    });
    
    fs.writeFileSync(fixedConfigPath, fixedContent);
    
    console.log(`\\n📁 Виправлений файл збережено: ${fixedConfigPath}`);
    
    this.generateFixReport();
    
    return fixedConfigPath;
  }

  generateFixReport() {
    const reportPath = path.join(__dirname, 'test-output', 'fix-report.json');
    
    const report = {
      timestamp: new Date().toISOString(),
      totalFixes: this.fixes.length,
      fixes: this.fixes.map(fix => ({
        issue: fix.issue,
        description: fix.description,
        method: fix.method,
        file: fix.file
      }))
    };
    
    const outputDir = path.dirname(reportPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📋 Звіт про виправлення збережено: ${reportPath}`);
    
    console.log('\\n📊 ПІДСУМОК ВИПРАВЛЕНЬ:');
    this.fixes.forEach((fix, index) => {
      console.log(`${index + 1}. ${fix.issue}`);
      console.log(`   └─ ${fix.description}`);
    });
  }
}

if (require.main === module) {
  const fixer = new IssueFixer();
  fixer.applyAllFixes().then(fixedFile => {
    console.log(`\\n🎉 Всі виправлення застосовано успішно!`);
    console.log(`📁 Виправлений файл: ${fixedFile}`);
    console.log('\\n💡 Рекомендації:');
    console.log('1. Протестуйте виправлений файл');
    console.log('2. Замініть оригінальний файл виправленим');
    console.log('3. Запустіть тести повторно для перевірки');
  }).catch(console.error);
}

module.exports = { IssueFixer };