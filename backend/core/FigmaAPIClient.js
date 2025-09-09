// FigmaAPIClient - заглушка для тестування
class FigmaAPIClient {
    constructor(config) {
        this.config = config;
    }
    
    async getFile(fileId) {
        console.log(`Getting Figma file: ${fileId}`);
        return { document: { children: [] } };
    }
}

module.exports = FigmaAPIClient;
