// IntegrationEngine - заглушка для тестування
class IntegrationEngine {
    constructor(config) {
        this.config = config;
        this.figmaClient = null;
    }
    
    extractFileIdFromFigmaLink(link) {
        if (!link || typeof link !== "string") return null;
        const match = link.match(/(?:https?:\/\/)?(?:www\.|app\.)?figma\.com\/(?:file|design|proto)\/([a-zA-Z0-9]+)(?:[\/?]|$)/);
        return match ? match[1] : null;
    }
    
    updateOptions(options) {
        Object.assign(this.config, options);
    }

    async getFigmaCanvases(figmaFileId) {
        // Заглушка: повертаємо псевдодані Canvas
        return [
            { id: '1:1', name: 'Home', type: 'CANVAS', childrenCount: 12 },
            { id: '1:2', name: 'Components', type: 'CANVAS', childrenCount: 28 }
        ];
    }

    async getFigmaLayers(figmaFileId, canvasIds = []) {
        // Заглушка: повертаємо псевдо-Layers для вибраних Canvas
        const layers = [];
        canvasIds.forEach((cid, idx) => {
            layers.push({ id: `${cid}-L1`, name: `Header ${idx+1}`, type: 'FRAME', childrenCount: 5 })
            layers.push({ id: `${cid}-L2`, name: `Button ${idx+1}`, type: 'COMPONENT', childrenCount: 0 })
            layers.push({ id: `${cid}-L3`, name: `Card ${idx+1}`, type: 'GROUP', childrenCount: 3 })
        })
        return layers;
    }

    async getLayerStyles(figmaFileId, layerIds = []) {
        // Заглушка: генеруємо простий CSS для кожного шару
        return layerIds.map((id, i) => ({
            layerId: id,
            name: `Layer ${i + 1}`,
            css: `.layer-${i + 1} {\n  /* Generated from Figma layer ${id} */\n  display: block;\n  width: 100%;\n  height: auto;\n}`
        }))
    }
}

module.exports = IntegrationEngine;
