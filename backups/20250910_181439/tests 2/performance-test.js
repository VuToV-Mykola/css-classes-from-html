const { performance } = require('perf_hooks');

console.log('🚀 Running performance test...');

// Test large HTML parsing
const testHTML = `<div class="container">` + 
    Array(1000).fill().map((_, i) => 
        `<div class="item-${i}"><span class="text-${i}">Content ${i}</span></div>`
    ).join('') + 
    `</div>`;

const start = performance.now();

try {
    const HTMLParser = require('../backend/core/HTMLParser');
    const parser = new HTMLParser();
    
    const result = parser.parseHTML(testHTML);
    
    const end = performance.now();
    const duration = end - start;
    
    console.log(`✓ Large HTML parsed in ${duration.toFixed(2)}ms`);
    console.log(`✓ Elements processed: ${result.hierarchy.size}`);
    console.log(`✓ Classes extracted: ${result.classMap.size}`);
    
    if (duration > 5000) {
        console.warn('⚠️ Performance warning: parsing took over 5 seconds');
    }
    
    console.log('✅ Performance test completed');
    
} catch (error) {
    console.error('❌ Performance test failed:', error.message);
    process.exit(1);
}
