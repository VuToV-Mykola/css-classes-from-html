// HTMLParser - заглушка для тестування
class HTMLParser {
    constructor() {}
    
    parse(htmlContent) {
        const classes = htmlContent.match(/class="([^"]*)"/g) || [];
        return { classes: classes.map(c => c.replace(/class="|"/g, '')) };
    }
}

module.exports = HTMLParser;
