const fs = require('fs');
const path = require('path');

console.log('🧪 Running integration test...');

// Test HTML Parser
try {
    const HTMLParser = require('../backend/core/HTMLParser');
    const parser = new HTMLParser();
    
    const testHTML = `
    <div class="container">
        <header class="header">
            <h1 class="title">Test Title</h1>
        </header>
        <main class="main-content">
            <section class="hero-section">
                <h2 class="hero-title">Hero Title</h2>
                <button class="btn btn-primary">Click Me</button>
            </section>
        </main>
    </div>`;
    
    const result = parser.parseToHierarchy(testHTML);
    
    if (!result.hierarchy || result.hierarchy.size === 0) {
        throw new Error('HTML parsing failed - no elements found');
    }
    
    console.log(`✓ HTML Parser: ${result.hierarchy.size} elements parsed`);
    
    if (!result.classMap || result.classMap.size === 0) {
        throw new Error('No CSS classes found');
    }
    
    console.log(`✓ Class extraction: ${result.classMap.size} classes found`);
    
} catch (error) {
    console.error('❌ Integration test failed:', error.message);
    process.exit(1);
}

// Test CSS Generator
try {
    const SmartCSSGenerator = require('../backend/generators/SmartCSSGenerator');
    const generator = new SmartCSSGenerator({
        mode: 'minimal',
        includeComments: true
    });
    
    // Mock data for testing
    const figmaData = { hierarchy: new Map() };
    const htmlData = { 
        hierarchy: new Map([
            ['test1', { classes: ['container'] }],
            ['test2', { classes: ['title'] }]
        ])
    };
    const matches = new Map();
    
    const css = generator.generateCSS(figmaData, htmlData, matches);
    
    if (!css || css.length === 0) {
        throw new Error('CSS generation failed - no output');
    }
    
    console.log(`✓ CSS Generator: ${css.length} characters generated`);
    
    if (!css.includes('.container') || !css.includes('.title')) {
        throw new Error('CSS generation failed - missing expected classes');
    }
    
    console.log('✓ CSS classes properly generated');
    
} catch (error) {
    console.error('❌ CSS generation test failed:', error.message);
    process.exit(1);
}

console.log('🎉 Integration test completed successfully!');
