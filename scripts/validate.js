/**
 * Валідація проекту css-classes-from-html;
 * Перевіряє синтаксис JavaScript файлів, структуру проекту і залежності
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class ProjectValidator {
  constructor() {
    this.rootDir = path.dirname(__dirname);
    this.errors = [];
    this.warnings = [];
    
    // Основні файли, які мають бути присутні
    this.requiredFiles = [
      "package.json",
      "extension.js",
      "README.md"
    ];
    
    // Основні директорії проекту
    this.requiredDirs = [
      "backend",
      "backend/core",
      "backend/matchers",
      "backend/generators",
      "backend/utils",
      "backend/analyzers"
    ];
    
    // Файли, які потрібно перевірити на синтаксис
    this.jsFiles = [
      "extension.js",
      "backend/core/FigmaAPIClient.js",
      "backend/core/HTMLParser.js",
      "backend/core/AdvancedHTMLParser.js",
      "backend/core/IntegrationEngine.js",
      "backend/matchers/StyleMatcher.js",
      "backend/matchers/HierarchyMatcher.js",
      "backend/matchers/UniversalMatchingEngine.js",
      "backend/generators/AdvancedCSSGenerator.js",
      "backend/generators/EnhancedCSSGenerator.js",
      "backend/generators/SmartCSSGenerator.js",
      "backend/generators/ResponsiveEnhancer.js",
      "backend/utils/ValidationSystem.js",
      "backend/utils/FontImporter.js",
      "backend/utils/ImageImporter.js",
      "backend/utils/ViewportManager.js",
      "backend/analyzers/FigmaAnalyzer.js"
    ];
  }

  /**
   * Запуск повної валідації проекту
   */
  async validate() {
    console.log("🔍 Початок валідації проекту css-classes-from-html...\n");

    // Перевіряємо структуру проекту
    this.validateProjectStructure();
    
    // Перевіряємо package.json;
    this.validatePackageJson();
    
    // Перевіряємо синтаксис JavaScript файлів
    await this.validateJavaScriptFiles();
    
    // Перевіряємо залежності
    this.validateDependencies();
    
    // Перевіряємо VS Code специфічні файли
    this.validateVSCodeFiles();

    // Виводимо результати
    this.printResults();
    
    return this.errors.length === 0;
  }

  /**
   * Перевірка структури проекту
   */
  validateProjectStructure() {
    console.log("📁 Перевірка структури проекту...");
    
    // Перевіряємо наявність обов"язкових файлів
    this.requiredFiles.forEach(file => {
      const filePath = path.join(this.rootDir, file);
      if (!fs.existsSync(filePath)) {
        this.errors.push(`Відсутній обов"язковий файл: ${file}`);
      }
    });
    
    // Перевіряємо наявність обов"язкових директорій
    this.requiredDirs.forEach(dir => {
      const dirPath = path.join(this.rootDir, dir);
      if (!fs.existsSync(dirPath)) {
        this.errors.push(`Відсутня обов"язкова директорія: ${dir}`);
      }
    });
    
    console.log("✓ Перевірка структури завершена\n");
  }

  /**
   * Перевірка package.json;
   */
  validatePackageJson() {
    console.log("📦 Перевірка package.json...");
    
    try {
      const packagePath = path.join(this.rootDir, "package.json");
      const packageData = JSON.parse(fs.readFileSync(packagePath, "utf8"));
      
      // Перевіряємо обов"язкові поля
      const requiredFields = ["name", "version", "description", "main", "engines"];
      requiredFields.forEach(field => {
        if (!packageData[field]) {
          this.errors.push(`Відсутнє обов"язкове поле в package.json: ${field}`);
        }
      });
      
      // Перевіряємо VS Code специфічні поля
      if (!packageData.contributes) {
        this.errors.push("Відсутнє поле 'contributes' в package.json для VS Code розширення");
      }
      
      if (!packageData.activationEvents) {
        this.warnings.push("Відсутнє поле 'activationEvents' в package.json");
      }
      
      console.log("✓ Перевірка package.json завершена\n");
    } catch (error) {
      this.errors.push(`Помилка при читанні package.json: ${error.message}`);
    }
  }

  /**
   * Перевірка синтаксису JavaScript файлів
   */
  async validateJavaScriptFiles() {
    console.log("🔍 Перевірка синтаксису JavaScript файлів...");
    
    for (const file of this.jsFiles) {
      const filePath = path.join(this.rootDir, file);
      
      if (!fs.existsSync(filePath)) {
        this.warnings.push(`Файл не знайдено: ${file}`);
        continue;
      }
      
      try {
        // Читаємо і перевіряємо синтаксис
        const content = fs.readFileSync(filePath, "utf8");
        
        // Перевіряємо на базові синтаксичні помилки
        try {
          new Function(content);
        } catch (syntaxError) {
          this.errors.push(`Синтаксична помилка в ${file}: ${syntaxError.message}`);
        }
        
        // Перевіряємо на наявність TODO коментарів
        const todoMatches = content.match(/TODO|FIXME|реалізувати пізніше/gi);
        if (todoMatches) {
          this.warnings.push(`Знайдено ${todoMatches.length} TODO коментар(ів) у файлі ${file}`);
        }
        
        // Перевіряємо на наявність console.log у виробничому коді
        const consoleMatches = content.match(/console\.(log|warn|error)/g);
        if (consoleMatches && consoleMatches.length > 5) {
          this.warnings.push(`Багато console виведень у файлі ${file} (${consoleMatches.length})`);
        }
        
      } catch (error) {
        this.errors.push(`Помилка при читанні файлу ${file}: ${error.message}`);
      }
    }
    
    console.log("✓ Перевірка JavaScript файлів завершена\n");
  }

  /**
   * Перевірка залежностей
   */
  validateDependencies() {
    console.log("📚 Перевірка залежностей...");
    
    try {
      const packagePath = path.join(this.rootDir, "package.json");
      const packageData = JSON.parse(fs.readFileSync(packagePath, "utf8"));
      
      // Перевіряємо наявність node_modules;
      const nodeModulesPath = path.join(this.rootDir, "node_modules");
      if (!fs.existsSync(nodeModulesPath)) {
        this.errors.push("Директорія node_modules не знайдена. Виконайте npm install");
        return;
      }
      
      // Перевіряємо критичні залежності
      const criticalDeps = ["vscode", "axios", "jsdom"];
      if (packageData.dependencies || packageData.devDependencies) {
        const allDeps = {
          ...packageData.dependencies,
          ...packageData.devDependencies
        };
        
        criticalDeps.forEach(dep => {
          if (!allDeps[dep]) {
            this.warnings.push(`Відсутня рекомендована залежність: ${dep}`);
          }
        });
      }
      
      console.log("✓ Перевірка залежностей завершена\n");
    } catch (error) {
      this.errors.push(`Помилка при перевірці залежностей: ${error.message}`);
    }
  }

  /**
   * Перевірка VS Code специфічних файлів
   */
  validateVSCodeFiles() {
    console.log("🎨 Перевірка VS Code специфічних файлів...");
    
    // Перевіряємо extension.js;
    const extensionPath = path.join(this.rootDir, "extension.js");
    if (fs.existsSync(extensionPath)) {
      try {
        const content = fs.readFileSync(extensionPath, "utf8");
        
        // Перевіряємо наявність функцій activate та deactivate;
        if (!content.includes("function activate") && !content.includes("activate =")) {
          this.errors.push("Відсутня функція activate в extension.js");
        }
        
        if (!content.includes("function deactivate") && !content.includes("deactivate =")) {
          this.warnings.push("Відсутня функція deactivate в extension.js");
        }
        
        // Перевіряємо на використання vscode API;
        if (!content.includes("vscode.")) {
          this.warnings.push("Не використовується VS Code API в extension.js");
        }
        
      } catch (error) {
        this.errors.push(`Помилка при перевірці extension.js: ${error.message}`);
      }
    }
    
    // Перевіряємо .vscodeignore;
    const vscodeignorePath = path.join(this.rootDir, ".vscodeignore");
    if (!fs.existsSync(vscodeignorePath)) {
      this.warnings.push("Відсутній файл .vscodeignore");
    }
    
    console.log("✓ Перевірка VS Code файлів завершена\n");
  }

  /**
   * Виведення результатів валідації
   */
  printResults() {
    console.log("📊 Результати валідації:\n");
    
    if (this.errors.length === 0) {
      console.log("✅ Валідація пройшла успішно!");
    } else {
      console.log(`❌ Знайдено ${this.errors.length} помилок:`);
      this.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log(`\n⚠️  Попередження (${this.warnings.length}):`);
      this.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning}`);
      });
    }
    
    console.log("\n📈 Статистика:");
    console.log(`   - JavaScript файлів перевірено: ${this.jsFiles.length}`);
    console.log(`   - Помилок знайдено: ${this.errors.length}`);
    console.log(`   - Попереджень: ${this.warnings.length}`);
    
    if (this.errors.length === 0) {
      console.log("\n🎉 Проект готовий до збирання та розгортання!");
    } else {
      console.log("\n🔧 Виправте помилки перед продовженням.");
    }
  }
}

// Запуск валідації
if (require.main === module) {
  const validator = new ProjectValidator();
  validator.validate().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error("💥 Критична помилка валідації:", error);
    process.exit(1);
  });
}

module.exports = ProjectValidator;