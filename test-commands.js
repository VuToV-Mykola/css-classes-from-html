const vscode = require('vscode');

async function testCommands() {
    try {
        const commands = await vscode.commands.getCommands();
        
        const requiredCommands = [
            'css-classes.showMenu',
            'css-classes.showMenuFromContext', 
            'css-classes.quickGenerate',
            'extension.cssClassesFromHtml'
        ];

        console.log('🔍 Перевірка наявності команд:');
        requiredCommands.forEach(cmd => {
            const exists = commands.includes(cmd);
            console.log(`${exists ? '✅' : '❌'} ${cmd}: ${exists ? 'наявна' : 'відсутня'}`);
        });

        return true;
    } catch (error) {
        console.error('❌ Помилка перевірки команд:', error);
        return false;
    }
}

testCommands().then(success => {
    process.exit(success ? 0 : 1);
});
