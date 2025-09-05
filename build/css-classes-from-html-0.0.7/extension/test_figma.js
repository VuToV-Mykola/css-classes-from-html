#!/usr/bin/env node

/**
 * Тестування Figma API з'єднання
 */

require('dotenv').config();

async function testFigmaAPI() {
    const token = process.env.FIGMA_API_TOKEN;
    
    if (!token) {
        console.error('❌ FIGMA_API_TOKEN не знайдено в .env файлі');
        process.exit(1);
    }
    
    console.log('🔍 Тестування Figma API...');
    console.log(`📝 Токен: ${token.substring(0, 10)}...`);
    
    // Список тестових файлів для перевірки
    const testFiles = [
        { key: 'Gz419qkOjPvKUuSgURTNP2', name: 'Original file' },
        { key: 'FILE_KEY', name: 'User file' }
    ];
    
    for (const file of testFiles) {
        try {
            const response = await fetch(`https://api.figma.com/v1/files/${file.key}`, {
                headers: {
                    'X-Figma-Token': token
                }
            });
            
            console.log(`\n📁 ${file.name} (${file.key}):`);
            console.log(`   Status: ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`   ✅ Назва: ${data.name}`);
                console.log(`   📅 Оновлено: ${data.lastModified}`);
            } else {
                const error = await response.text();
                console.log(`   ❌ Помилка: ${error}`);
            }
        } catch (err) {
            console.error(`   ❌ Помилка з'єднання: ${err.message}`);
        }
    }
}

testFigmaAPI();
