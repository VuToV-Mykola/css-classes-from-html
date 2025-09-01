#!/usr/bin/env node

console.log('🧪 Running all tests for CSS Classes from HTML v0.0.6...\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(testName, testFn) {
  totalTests++;
  try {
    testFn();
    console.log(`✅ ${testName}`);
    passedTests++;
  } catch (error) {
    console.log(`❌ ${testName}: ${error.message}`);
    failedTests++;
  }
}

// CSS Generator Tests
console.log('📝 Testing CSS Generator...');
const cssGenerator = require('../modules/cssGenerator');

runTest('Should extract classes from HTML', () => {
  const result = cssGenerator.createClassDictionary(['container', 'main']);
  if (!result.container || !result.main) {
    throw new Error('Classes not extracted properly');
  }
});

runTest('Should generate CSS with comments', () => {
  const classes = ['test-class'];
  const dictionary = cssGenerator.createClassDictionary(classes);
  const css = cssGenerator.generateCSS(classes, dictionary, true, true);
  if (!css.includes('AUTO-GENERATED CSS FROM HTML')) {
    throw new Error('CSS header comment missing');
  }
});

// HTML Parser Tests
console.log('\n🔍 Testing HTML Parser...');
const htmlParser = require('../modules/htmlParser');

runTest('Should extract classes from HTML', () => {
  const html = '<div class="btn primary">Button</div>';
  const result = htmlParser.extractClasses(html);
  if (!result.classes.includes('btn') || !result.classes.includes('primary')) {
    throw new Error('Classes not extracted correctly');
  }
});

// Configuration Manager Tests
console.log('\n⚙️ Testing Configuration Manager...');

runTest('Should load config files', () => {
  const fs = require('fs');
  if (!fs.existsSync('./config/presets.json')) {
    throw new Error('Config files not found');
  }
});

// Results
console.log('\n📊 Test Results:');
console.log(`Total Tests: ${totalTests}`);
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log(`📈 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

if (failedTests === 0) {
  console.log('\n🎉 All tests passed! Ready for publication.');
  process.exit(0);
} else {
  console.log('\n⚠️ Some tests failed. Please fix before publication.');
  process.exit(1);
}