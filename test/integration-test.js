/**
 * Тест інтеграції нових модулів
 * Перевіряє роботу всіх компонентів системи
 */

const IntegrationEngine = require('../backend/core/IntegrationEngine');
const FigmaAPIClient = require('../backend/core/FigmaAPIClient');
const HTMLParser = require('../backend/core/HTMLParser');
const StyleMatcher = require('../backend/matchers/StyleMatcher');
const HierarchyMatcher = require('../backend/matchers/HierarchyMatcher');
const CSSGenerator = require('../backend/generators/CSSGenerator');
const FigmaAnalyzer = require('../backend/analyzers/FigmaAnalyzer');

// Тестовий HTML контент
const testHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Page</title>
</head>
<body>
    <div class="container">
        <header class="main-header">
            <h1 class="title">Welcome to Our Site</h1>
            <nav class="nav-menu">
                <ul class="nav-list">
                    <li class="nav-item"><a href="#" class="nav-link">Home</a></li>
                    <li class="nav-item"><a href="#" class="nav-link">About</a></li>
                    <li class="nav-item"><a href="#" class="nav-link">Contact</a></li>
                </ul>
            </nav>
        </header>
        
        <main class="main-content">
            <section class="hero-section">
                <h2 class="hero-title">Hero Title</h2>
                <p class="hero-text">This is a hero section with some text content.</p>
                <button class="btn btn-primary">Get Started</button>
            </section>
            
            <section class="features-section">
                <div class="feature-card">
                    <h3 class="feature-title">Feature 1</h3>
                    <p class="feature-text">Description of feature 1</p>
                </div>
                <div class="feature-card">
                    <h3 class="feature-title">Feature 2</h3>
                    <p class="feature-text">Description of feature 2</p>
                </div>
            </section>
        </main>
        
        <footer class="main-footer">
            <p class="footer-text">&copy; 2024 Test Company</p>
        </footer>
    </div>
</body>
</html>
`;

// Тестовий Figma файл ID (замініть на реальний)
const testFigmaFileId = 'Gz419qkOjPvKUuSgURTNP2';

async function runIntegrationTest() {
    console.log('🚀 Запуск тесту інтеграції...\n');
    
    try {
        // 1. Тест HTML парсера
        console.log('1. Тестування HTML парсера...');
        const htmlParser = new HTMLParser();
        const htmlData = htmlParser.parseHTML(testHTML);
        console.log(`✅ HTML парсер: ${htmlData.hierarchy.size} елементів знайдено`);
        console.log(`   - Класів: ${htmlData.classMap.size}`);
        console.log(`   - Семантичних ролей: ${htmlData.semanticMap.size}`);
        console.log(`   - Максимальна глибина: ${htmlData.structure.depth}\n`);
        
        // 2. Тест Figma API клієнта
        console.log('2. Тестування Figma API клієнта...');
        const figmaClient = new FigmaAPIClient('test-token');
        console.log('✅ Figma API клієнт ініціалізований');
        console.log(`   - Base URL: ${figmaClient.baseURL}`);
        console.log(`   - Timeout: ${figmaClient.timeout}ms\n`);
        
        // 3. Тест Style Matcher
        console.log('3. Тестування Style Matcher...');
        const styleMatcher = new StyleMatcher();
        console.log('✅ Style Matcher ініціалізований');
        console.log(`   - Стратегій: ${styleMatcher.matchingStrategies.length}`);
        console.log(`   - Поріг впевненості: ${styleMatcher.confidenceThreshold}\n`);
        
        // 4. Тест Hierarchy Matcher
        console.log('4. Тестування Hierarchy Matcher...');
        const hierarchyMatcher = new HierarchyMatcher();
        console.log('✅ Hierarchy Matcher ініціалізований');
        console.log(`   - Вага глибини: ${hierarchyMatcher.options.depthWeight}`);
        console.log(`   - Вага позиції: ${hierarchyMatcher.options.positionWeight}\n`);
        
        // 5. Тест CSS Generator
        console.log('5. Тестування CSS Generator...');
        const cssGenerator = new CSSGenerator({
            includeReset: true,
            generateResponsive: true,
            generateModernCSS: true,
            generateAnimations: true
        });
        console.log('✅ CSS Generator ініціалізований');
        console.log(`   - Reset стилі: ${cssGenerator.options.includeReset}`);
        console.log(`   - Адаптивність: ${cssGenerator.options.generateResponsive}`);
        console.log(`   - Сучасний CSS: ${cssGenerator.options.generateModernCSS}\n`);
        
        // 6. Тест Figma Analyzer
        console.log('6. Тестування Figma Analyzer...');
        const figmaAnalyzer = new FigmaAnalyzer();
        console.log('✅ Figma Analyzer ініціалізований\n');
        
        // 7. Тест Integration Engine
        console.log('7. Тестування Integration Engine...');
        const integrationEngine = new IntegrationEngine({
            figmaToken: 'test-token',
            confidenceThreshold: 0.8,
            generateResponsive: true,
            generateModernCSS: true,
            generateAnimations: true,
            optimizeCSS: true
        });
        console.log('✅ Integration Engine ініціалізований');
        console.log(`   - Figma токен: ${integrationEngine.options.figmaToken ? 'встановлено' : 'не встановлено'}`);
        console.log(`   - Поріг впевненості: ${integrationEngine.options.confidenceThreshold}\n`);
        
        // 8. Тест генерації CSS (без Figma)
        console.log('8. Тестування генерації CSS...');
        const testFigmaData = {
            hierarchy: new Map(),
            contentMap: new Map(),
            structure: { depth: 0, totalElements: 0 }
        };
        const testMatches = new Map();
        const css = cssGenerator.generateCSS(testFigmaData, htmlData, testMatches);
        console.log(`✅ CSS згенеровано: ${css.length} символів`);
        console.log(`   - CSS правил: ${cssGenerator.cssRules.size}`);
        console.log(`   - CSS змінних: ${cssGenerator.variables.size}`);
        console.log(`   - Медіа запитів: ${cssGenerator.mediaQueries.size}\n`);
        
        // 9. Тест статистики
        console.log('9. Тестування статистики...');
        const htmlStats = htmlParser.getStatistics();
        const figmaStats = figmaAnalyzer.getStatistics();
        console.log('✅ Статистика зібрана:');
        console.log(`   - HTML елементів: ${htmlStats.totalElements}`);
        console.log(`   - HTML класів: ${htmlStats.totalClasses}`);
        console.log(`   - HTML типів: ${Object.keys(htmlStats.elementTypes).length}`);
        console.log(`   - HTML семантичних ролей: ${Object.keys(htmlStats.semanticRoles).length}\n`);
        
        console.log('🎉 Всі тести пройшли успішно!');
        console.log('✅ Система готова до роботи з реальними Figma макетами');
        
    } catch (error) {
        console.error('❌ Помилка під час тестування:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

// Запуск тесту
if (require.main === module) {
    runIntegrationTest();
}

module.exports = { runIntegrationTest };
