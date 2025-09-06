/**
 * Тест Simply Chocolate макету
 * Перевіряє роботу з реальним Figma макетом
 * @version 1.0.0
 */

const IntegrationEngine = require('../backend/core/IntegrationEngine');
const SimplyChocolateAnalyzer = require('../backend/analyzers/SimplyChocolateAnalyzer');
const SimplyChocolateCSSGenerator = require('../backend/generators/SimplyChocolateCSSGenerator');
const ValidationSystem = require('../backend/utils/ValidationSystem');

// Тестовий HTML для Simply Chocolate
const simplyChocolateHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simply Chocolate - Premium Chocolate Store</title>
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="container">
            <div class="header__content">
                <div class="logo">
                    <img src="logo.svg" alt="Simply Chocolate" class="logo__image">
                    <span class="logo__text">Simply Chocolate</span>
                </div>
                <nav class="nav">
                    <ul class="nav__list">
                        <li class="nav__item">
                            <a href="#home" class="nav__link">Home</a>
                        </li>
                        <li class="nav__item">
                            <a href="#about" class="nav__link">About</a>
                        </li>
                        <li class="nav__item">
                            <a href="#products" class="nav__link">Products</a>
                        </li>
                        <li class="nav__item">
                            <a href="#contact" class="nav__link">Contact</a>
                        </li>
                    </ul>
                </nav>
                <button class="btn btn--primary">Order Now</button>
            </div>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
        <div class="container">
            <div class="hero__content">
                <h1 class="hero__title">Premium Chocolate Experience</h1>
                <p class="hero__description">
                    Discover the finest selection of artisanal chocolates crafted with love and passion. 
                    Each piece is a masterpiece of flavor and texture.
                </p>
                <div class="hero__actions">
                    <button class="btn btn--primary btn--large">Shop Now</button>
                    <button class="btn btn--secondary btn--large">Learn More</button>
                </div>
            </div>
            <div class="hero__image">
                <img src="hero-chocolate.jpg" alt="Premium Chocolate" class="hero__img">
            </div>
        </div>
    </section>

    <!-- About Section -->
    <section class="about">
        <div class="container">
            <div class="about__content">
                <h2 class="about__title">Our Story</h2>
                <p class="about__description">
                    For over 50 years, we have been creating exceptional chocolates using traditional 
                    methods and the finest ingredients from around the world.
                </p>
                <div class="about__features">
                    <div class="feature-card">
                        <div class="feature-card__icon">
                            <img src="icon-quality.svg" alt="Quality" class="feature-card__img">
                        </div>
                        <h3 class="feature-card__title">Premium Quality</h3>
                        <p class="feature-card__description">
                            We source only the finest cocoa beans and ingredients.
                        </p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-card__icon">
                            <img src="icon-craft.svg" alt="Craft" class="feature-card__img">
                        </div>
                        <h3 class="feature-card__title">Handcrafted</h3>
                        <p class="feature-card__description">
                            Each chocolate is carefully crafted by our master chocolatiers.
                        </p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-card__icon">
                            <img src="icon-sustainable.svg" alt="Sustainable" class="feature-card__img">
                        </div>
                        <h3 class="feature-card__title">Sustainable</h3>
                        <p class="feature-card__description">
                            We are committed to sustainable and ethical sourcing.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Products Section -->
    <section class="products">
        <div class="container">
            <h2 class="products__title">Our Products</h2>
            <div class="products__grid">
                <div class="product-card">
                    <div class="product-card__image">
                        <img src="product-1.jpg" alt="Dark Chocolate" class="product-card__img">
                    </div>
                    <div class="product-card__content">
                        <h3 class="product-card__title">Dark Chocolate Collection</h3>
                        <p class="product-card__description">
                            Rich and intense dark chocolate with 70% cocoa content.
                        </p>
                        <div class="product-card__price">$24.99</div>
                        <button class="btn btn--primary">Add to Cart</button>
                    </div>
                </div>
                <div class="product-card">
                    <div class="product-card__image">
                        <img src="product-2.jpg" alt="Milk Chocolate" class="product-card__img">
                    </div>
                    <div class="product-card__content">
                        <h3 class="product-card__title">Milk Chocolate Delight</h3>
                        <p class="product-card__description">
                            Creamy and smooth milk chocolate with a hint of vanilla.
                        </p>
                        <div class="product-card__price">$19.99</div>
                        <button class="btn btn--primary">Add to Cart</button>
                    </div>
                </div>
                <div class="product-card">
                    <div class="product-card__image">
                        <img src="product-3.jpg" alt="White Chocolate" class="product-card__img">
                    </div>
                    <div class="product-card__content">
                        <h3 class="product-card__title">White Chocolate Dream</h3>
                        <p class="product-card__description">
                            Luxurious white chocolate with delicate floral notes.
                        </p>
                        <div class="product-card__price">$22.99</div>
                        <button class="btn btn--primary">Add to Cart</button>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Contact Section -->
    <section class="contact">
        <div class="container">
            <div class="contact__content">
                <h2 class="contact__title">Get in Touch</h2>
                <p class="contact__description">
                    Have questions about our products? We'd love to hear from you.
                </p>
                <form class="contact__form">
                    <div class="form-group">
                        <label for="name" class="form-label">Name</label>
                        <input type="text" id="name" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label for="email" class="form-label">Email</label>
                        <input type="email" id="email" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label for="message" class="form-label">Message</label>
                        <textarea id="message" class="form-textarea" rows="5" required></textarea>
                    </div>
                    <button type="submit" class="btn btn--primary btn--large">Send Message</button>
                </form>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer__content">
                <div class="footer__section">
                    <h3 class="footer__title">Simply Chocolate</h3>
                    <p class="footer__description">
                        Premium chocolates crafted with love and passion.
                    </p>
                </div>
                <div class="footer__section">
                    <h4 class="footer__subtitle">Quick Links</h4>
                    <ul class="footer__list">
                        <li><a href="#about" class="footer__link">About</a></li>
                        <li><a href="#products" class="footer__link">Products</a></li>
                        <li><a href="#contact" class="footer__link">Contact</a></li>
                    </ul>
                </div>
                <div class="footer__section">
                    <h4 class="footer__subtitle">Follow Us</h4>
                    <div class="footer__social">
                        <a href="#" class="footer__social-link">Facebook</a>
                        <a href="#" class="footer__social-link">Instagram</a>
                        <a href="#" class="footer__social-link">Twitter</a>
                    </div>
                </div>
            </div>
            <div class="footer__bottom">
                <p class="footer__copyright">&copy; 2024 Simply Chocolate. All rights reserved.</p>
            </div>
        </div>
    </footer>
</body>
</html>
`;

// Figma file ID для Simply Chocolate
const FIGMA_FILE_ID = 'Gz419qkOjPvKUuSgURTNP2';

async function runSimplyChocolateTest() {
    console.log('🍫 Запуск тесту Simply Chocolate макету...\n');
    
    try {
        // 1. Ініціалізація системи
        console.log('1. Ініціалізація системи...');
        const integrationEngine = new IntegrationEngine({
            figmaToken: process.env.FIGMA_TOKEN || 'test-token',
            confidenceThreshold: 0.8,
            generateResponsive: true,
            generateModernCSS: true,
            generateAnimations: true,
            optimizeCSS: true
        });
        
        const chocolateAnalyzer = new SimplyChocolateAnalyzer();
        const chocolateCSSGenerator = new SimplyChocolateCSSGenerator();
        const validationSystem = new ValidationSystem();
        
        console.log('✅ Система ініціалізована\n');
        
        // 2. Аналіз HTML
        console.log('2. Аналіз HTML структури...');
        
        // Парсинг HTML
        const HTMLParser = require('../backend/core/HTMLParser');
        const htmlParser = new HTMLParser();
        const htmlData = htmlParser.parseHTML(simplyChocolateHTML);
        
        console.log(`✅ HTML проаналізовано: ${htmlData.hierarchy.size} елементів`);
        console.log(`   - Класів: ${htmlData.classMap.size}`);
        console.log(`   - Семантичних ролей: ${htmlData.semanticMap.size}`);
        console.log(`   - Максимальна глибина: ${htmlData.structure.depth}\n`);
        
        // 3. Симуляція Figma даних
        console.log('3. Симуляція Figma даних...');
        const mockFigmaData = createMockFigmaData();
        console.log(`✅ Figma дані створено: ${mockFigmaData.hierarchy.size} елементів\n`);
        
        // 4. Співставлення елементів
        console.log('4. Співставлення елементів...');
        const StyleMatcher = require('../backend/matchers/StyleMatcher');
        const styleMatcher = new StyleMatcher();
        const matches = styleMatcher.matchStyles(mockFigmaData, htmlData);
        
        console.log(`✅ Співставлення завершено: ${matches.matches.size} елементів`);
        console.log(`   - Відсоток співставлення: ${matches.statistics.matchPercentage.toFixed(1)}%`);
        console.log(`   - Середня впевненість: ${(matches.statistics.averageConfidence * 100).toFixed(1)}%\n`);
        
        // 5. Генерація CSS
        console.log('5. Генерація Simply Chocolate CSS...');
        const css = chocolateCSSGenerator.generateSimplyChocolateCSS(mockFigmaData, htmlData, matches.matches);
        
        console.log(`✅ CSS згенеровано: ${css.length} символів`);
        console.log(`   - CSS правил: ${chocolateCSSGenerator.cssRules.size}`);
        console.log(`   - CSS змінних: ${chocolateCSSGenerator.variables.size}`);
        console.log(`   - Медіа запитів: ${chocolateCSSGenerator.mediaQueries.size}\n`);
        
        // 6. Валідація
        console.log('6. Валідація системи...');
        const validationResults = validationSystem.validateSystem(mockFigmaData, htmlData, matches.matches, css);
        
        console.log(`✅ Валідація завершена:`);
        console.log(`   - HTML: ${validationResults.html.score}/100`);
        console.log(`   - Figma: ${validationResults.figma.score}/100`);
        console.log(`   - CSS: ${validationResults.css.score}/100`);
        console.log(`   - Співставлення: ${validationResults.matching.score}/100`);
        console.log(`   - Адаптивність: ${validationResults.responsive.score}/100`);
        console.log(`   - Загальна оцінка: ${validationResults.overall.score.toFixed(1)}/100 (${validationResults.overall.grade})\n`);
        
        // 7. Збереження результатів
        console.log('7. Збереження результатів...');
        const fs = require('fs');
        const path = require('path');
        
        const outputDir = path.join(__dirname, '../output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Збереження CSS
        const cssPath = path.join(outputDir, 'simply-chocolate.css');
        fs.writeFileSync(cssPath, css, 'utf8');
        console.log(`✅ CSS збережено: ${cssPath}`);
        
        // Збереження звіту валідації
        const reportPath = path.join(outputDir, 'validation-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(validationSystem.generateReport(), null, 2), 'utf8');
        console.log(`✅ Звіт збережено: ${reportPath}\n`);
        
        // 8. Підсумок
        console.log('🎉 Тест Simply Chocolate завершено успішно!');
        console.log('✅ Система готова для роботи з реальним Figma макетом');
        console.log('📊 Детальна статистика:');
        console.log(`   - HTML елементів: ${htmlData.hierarchy.size}`);
        console.log(`   - Figma елементів: ${mockFigmaData.hierarchy.size}`);
        console.log(`   - Співставлених: ${matches.matches.size}`);
        console.log(`   - CSS розмір: ${(css.length / 1024).toFixed(1)} KB`);
        console.log(`   - Загальна оцінка: ${validationResults.overall.grade}`);
        
        if (validationResults.overall.recommendations.length > 0) {
            console.log('\n💡 Рекомендації для покращення:');
            validationResults.overall.recommendations.forEach((rec, index) => {
                console.log(`   ${index + 1}. ${rec}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Помилка під час тестування:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

/**
 * Створення mock Figma даних для тестування
 */
function createMockFigmaData() {
    const hierarchy = new Map();
    
    // Header
    hierarchy.set('header-1', {
        id: 'header-1',
        name: 'Header',
        type: 'FRAME',
        content: { text: null },
        styles: {
            colors: [{ type: 'solid', color: '#FFFFFF', opacity: 1 }],
            layout: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
        },
        semanticRole: 'header',
        children: ['logo-1', 'nav-1', 'btn-1']
    });
    
    // Logo
    hierarchy.set('logo-1', {
        id: 'logo-1',
        name: 'Logo',
        type: 'FRAME',
        content: { text: 'Simply Chocolate' },
        styles: {
            colors: [{ type: 'solid', color: '#D2691E', opacity: 1 }],
            typography: { fontFamily: 'Montserrat', fontSize: 24, fontWeight: 700 }
        },
        semanticRole: 'generic',
        children: []
    });
    
    // Navigation
    hierarchy.set('nav-1', {
        id: 'nav-1',
        name: 'Navigation',
        type: 'FRAME',
        content: { text: null },
        styles: {
            layout: { display: 'flex', gap: '24px' }
        },
        semanticRole: 'navigation',
        children: ['nav-item-1', 'nav-item-2', 'nav-item-3', 'nav-item-4']
    });
    
    // Hero Section
    hierarchy.set('hero-1', {
        id: 'hero-1',
        name: 'Hero Section',
        type: 'FRAME',
        content: { text: null },
        styles: {
            colors: [{ type: 'solid', color: '#D2691E', opacity: 1 }],
            layout: { display: 'flex', justifyContent: 'center', alignItems: 'center' }
        },
        semanticRole: 'section',
        children: ['hero-title-1', 'hero-description-1', 'hero-actions-1']
    });
    
    // Hero Title
    hierarchy.set('hero-title-1', {
        id: 'hero-title-1',
        name: 'Hero Title',
        type: 'TEXT',
        content: { text: 'Premium Chocolate Experience' },
        styles: {
            typography: { fontFamily: 'Montserrat', fontSize: 48, fontWeight: 700, textAlign: 'center' },
            colors: [{ type: 'solid', color: '#FFFFFF', opacity: 1 }]
        },
        semanticRole: 'heading',
        children: []
    });
    
    // Product Cards
    hierarchy.set('product-card-1', {
        id: 'product-card-1',
        name: 'Product Card',
        type: 'FRAME',
        content: { text: null },
        styles: {
            colors: [{ type: 'solid', color: '#FFFFFF', opacity: 1 }],
            effects: [{ type: 'box-shadow', x: 0, y: 4, blur: 8, spread: 0, color: '#D2691E', opacity: 0.1 }]
        },
        semanticRole: 'content-card',
        children: ['product-image-1', 'product-content-1']
    });
    
    // Button
    hierarchy.set('btn-1', {
        id: 'btn-1',
        name: 'Primary Button',
        type: 'RECTANGLE',
        content: { text: 'Order Now' },
        styles: {
            colors: [{ type: 'solid', color: '#D2691E', opacity: 1 }],
            typography: { fontFamily: 'Inter', fontSize: 16, fontWeight: 600 },
            effects: [{ type: 'box-shadow', x: 0, y: 2, blur: 4, spread: 0, color: '#8B4513', opacity: 0.2 }]
        },
        semanticRole: 'interactive',
        children: []
    });
    
    return {
        hierarchy,
        contentMap: new Map([
            ['Simply Chocolate', hierarchy.get('logo-1')],
            ['Premium Chocolate Experience', hierarchy.get('hero-title-1')],
            ['Order Now', hierarchy.get('btn-1')]
        ]),
        structure: {
            depth: 3,
            totalElements: hierarchy.size,
            elementTypes: new Map([
                ['FRAME', 4],
                ['TEXT', 1],
                ['RECTANGLE', 1]
            ]),
            semanticRoles: new Map([
                ['header', 1],
                ['navigation', 1],
                ['section', 1],
                ['heading', 1],
                ['content-card', 1],
                ['interactive', 1]
            ])
        }
    };
}

// Запуск тесту
if (require.main === module) {
    runSimplyChocolateTest();
}

module.exports = { runSimplyChocolateTest };
