// Простий тестовий скрипт для перевірки структури extension.js
const fs = require('fs');

function testExtensionStructure() {
    try {
        const content = fs.readFileSync('extension.js', 'utf8');
        
        // Перевіряємо наявність реєстрації команд
        const commandsToCheck = [
            'css-classes.showMenu',
            'css-classes.showMenuFromContext',
            'css-classes.quickGenerate',
            'extension.cssClassesFromHtml'
        ];

        console.log('🔍 Перевірка структури extension.js:');
        
        let allFound = true;
        commandsToCheck.forEach(cmd => {
            // Шукаємо реєстрацію команди в extension.js
            const regex = new RegExp(`registerCommand\\(.${cmd}.`);
            const found = regex.test(content);
            console.log(`${found ? '✅' : '❌'} ${cmd}: ${found ? 'наявна' : 'відсутня'}`);
            if (!found) allFound = false;
        });

        // Перевіряємо activation events у package.json
        const packageContent = fs.readFileSync('package.json', 'utf8');
        const packageJson = JSON.parse(packageContent);
        
        console.log('\n🔍 Перевірка activation events:');
        const activationEvents = packageJson.activationEvents || [];
        const hasStartupFinished = activationEvents.includes('onStartupFinished');
        console.log(`${hasStartupFinished ? '✅' : '❌'} onStartupFinished: ${hasStartupFinished ? 'наявний' : 'відсутній'}`);
        
        return allFound && hasStartupFinished;
    } catch (error) {
        console.error('❌ Помилка перевірки структури:', error);
        return false;
    }
}

const success = testExtensionStructure();
process.exit(success ? 0 : 1);
