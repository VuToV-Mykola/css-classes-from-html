const { logger } = require('./Logger');
/**
 * ✅ FIX: Імпортер зображень з Figma з автооптимізацією
 * Завантажує та оптимізує зображення з Figma макетів
 * @version 1.0.0
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

class ImageImporter {
  constructor(options = {}) {
    this.outputDir = options.outputDir || 'images';
    this.optimizeImages = options.optimizeImages !== false;
    this.formats = options.formats || ['png', 'jpg', 'svg'];
    this.scales = options.scales || [1, 2]; // 1x та 2x для retina
    this.compressionLevel = options.compressionLevel || 0.8; // 80% якість
  }

  /**
   * ✅ FIX: Імпорт всіх зображень з Figma файлу з фільтрацією по canvas
   */
  async importImages(figmaClient, fileKey, selectedLayers = [], selectedCanvasIds = []) {
    try {
      logger.info('🖼️ Початок імпорту зображень з Figma...');
      logger.info('📋 File key:', fileKey);
      logger.info('📋 Selected layers count:', selectedLayers?.length || 0);
      logger.info('📋 Selected canvas count:', selectedCanvasIds?.length || 0);

      // ✅ FIX: Створення директорії для зображень
      this.ensureOutputDirectory();

      // ✅ FIX: Отримання всіх зображень з файлу (з фільтрацією по canvas)
      logger.info('🔄 Getting all images from Figma...');
      const allImages = await this.getAllImagesFromCanvases(figmaClient, fileKey, selectedCanvasIds);
      logger.info('📸 All images received:', allImages);

      // ✅ FIX: Логіка фільтрації згідно з вимогами користувача
      // Якщо layers не вибрані або вибрані всі - імпортуємо всі зображення
      // Якщо вибрані певні layers - імпортуємо тільки для них
      let imagesToProcess = allImages;

      if (selectedLayers.length === 0) {
        // Якщо layers не вибрані - імпортуємо всі зображення з вибраних canvas або з усього файлу
        if (selectedCanvasIds.length > 0) {
          logger.info(`🌍 Імпортуємо всі зображення з ${selectedCanvasIds.length} вибраних canvas: ${imagesToProcess.length} зображень`);
        } else {
          logger.info(`🌍 Імпортуємо всі зображення з усього файлу: ${imagesToProcess.length} зображень`);
        }
      } else {
        // Якщо вибрані певні layers - фільтруємо зображення тільки для них
        const filteredImages = imagesToProcess.filter(img => {
          // Перевіряємо різні способи співставлення:
          // 1. Пряме співставлення ID зображення
          // 2. Співставлення з parentId зображення
          // 3. Перевірка, чи зображення є частиною вибраного layer
          return selectedLayers.includes(img.id) ||
                 selectedLayers.includes(img.parentId) ||
                 (img.layerId && selectedLayers.includes(img.layerId));
        });

        imagesToProcess = filteredImages;
        logger.info(`🎯 Фільтрація по layers: ${imagesToProcess.length}/${allImages.length} зображень відповідають критеріям`);

        if (imagesToProcess.length === 0) {
          logger.warn(`⚠️ Жодне зображення не знайдено для вибраних layers. Можливо, зображення знаходяться в дочірніх елементах.`);
        }
      }

      logger.info(`📸 Final images to process: ${imagesToProcess.length}`);

      if (imagesToProcess.length === 0) {
        const message = selectedLayers.length === 0
          ? 'Не знайдено зображень у вибраних canvas або файлі'
          : 'Не знайдено зображень у вибраних layers';

        logger.info(`⚠️ ${message}`);
        return {
          success: true,
          images: [],
          message: message
        };
      }

      logger.info(`📸 Знайдено ${imagesToProcess.length} зображень для обробки`);

      // ✅ FIX: Обробка кожного зображення
      const processedImages = [];
      const errors = [];

      for (const image of imagesToProcess) {
        try {
          const result = await this.processImage(figmaClient, fileKey, image);
          processedImages.push(result);
          logger.info(`✅ Processed: ${result.name}`);
        } catch (error) {
          logger.error(`❌ Помилка обробки зображення ${image.name}:`, error.message);
          errors.push({
            image: image.name,
            error: error.message
          });
        }
      }

      // ✅ FIX: Генерація CSS для background-image
      const cssContent = this.generateImageCSS(processedImages);
      this.saveCSSFile(cssContent);

      return {
        success: true,
        images: processedImages,
        errors: errors,
        cssFile: path.join(this.outputDir, 'images.css'),
        message: `Successfully imported ${processedImages.length} images`
      };
    } catch (error) {
      logger.error('❌ Імпорт зображень не вдався:', error.message);
      throw new Error(`Помилка імпорту зображень: ${error.message}`);
    }
  }

  /**
   * ✅ FIX: Обробка окремого зображення
   */
  async processImage(figmaClient, fileKey, imageInfo) {
    const cleanName = this.sanitizeFileName(imageInfo.name);
    const imageData = {
      id: imageInfo.id,
      name: cleanName,
      originalName: imageInfo.name,
      type: imageInfo.type,
      files: []
    };

    // ✅ FIX: Експорт в різних форматах та масштабах
    for (const format of this.formats) {
      for (const scale of this.scales) {
        try {
          const exportUrl = await this.getExportUrl(
            figmaClient,
            fileKey,
            imageInfo.id,
            format,
            scale
          );
          const fileName = `${cleanName}.${format}`;
          const scaleFolder = scale > 1 ? `@${scale}x` : '@1x';
          const dirByFormatAndScale = path.join(this.outputDir, format, scaleFolder);
          if (!fs.existsSync(dirByFormatAndScale)) {
            fs.mkdirSync(dirByFormatAndScale, { recursive: true });
          }
          const filePath = path.join(dirByFormatAndScale, fileName);

          // ✅ FIX: Завантаження файлу
          await this.downloadFile(exportUrl, filePath);

          // ✅ FIX: Оптимізація (якщо включена)
          if (this.optimizeImages) {
            await this.optimizeImage(filePath, format);
          }

          imageData.files.push({
            format: format,
            scale: scale,
            fileName: fileName,
            filePath: filePath,
            size: this.getFileSize(filePath)
          });
        } catch (error) {
          logger.warn(`⚠️ Не вдалося експортувати ${cleanName} у форматі ${format}@${scale}x:`, error.message);
        }
      }
    }

    return imageData;
  }

  /**
   * ✅ FIX: Отримання URL для експорту
   */
  async getExportUrl(figmaClient, fileKey, nodeId, format, scale) {
    try {
      const response = await figmaClient.getImages(fileKey, [nodeId], format, scale);
      
      if (response.images && response.images[nodeId]) {
        return response.images[nodeId];
      }

      throw new Error(`Не знайдено URL експорту для вузла ${nodeId}`);
    } catch (error) {
      logger.error('Помилка отримання URL експорту:', error);
      throw error;
    }
  }

  /**
   * ✅ FIX: Завантаження файлу
   */
  async downloadFile(url, filePath) {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(filePath);

      https
        .get(url, response => {
          if (response.statusCode !== 200) {
            reject(new Error(`Завантаження не вдалося. Код статусу: ${response.statusCode}`));
            return;
          }

          response.pipe(file);

          file.on('finish', () => {
            file.close();
            resolve();
          });

          file.on('error', error => {
            fs.unlink(filePath, () => {}); // Видаляємо некоректний файл
            reject(error);
          });
        })
        .on('error', error => {
          reject(error);
        });
    });
  }

  /**
   * ✅ FIX: Оптимізація зображення
   */
  async optimizeImage(filePath, format) {
    try {
      const stats = fs.statSync(filePath);
      const originalSize = stats.size;

      if (format === 'png') {
        await this.optimizePNG(filePath);
      } else if (format === 'jpg' || format === 'jpeg') {
        await this.optimizeJPEG(filePath);
      } else if (format === 'svg') {
        await this.optimizeSVG(filePath);
      }

      const newStats = fs.statSync(filePath);
      const newSize = newStats.size;
      const savings = (((originalSize - newSize) / originalSize) * 100).toFixed(1);

      logger.info(
        `🔧 Оптимізовано ${path.basename(filePath)}: ${this.formatBytes(originalSize)} → ${this.formatBytes(newSize)} (економія ${savings}%)`
      );
    } catch (error) {
      logger.warn(`⚠️ Не вдалося оптимізувати ${path.basename(filePath)}:`, error.message);
    }
  }

  /**
   * ✅ FIX: Оптимізація PNG (базова компресія)
   */
  async optimizePNG(filePath) {
    try {
      const originalBuffer = fs.readFileSync(filePath);
      
      const optimizedBuffer = await sharp(originalBuffer)
        .png({
          quality: Math.round(this.compressionLevel * 100),
          compressionLevel: 9,
          adaptiveFiltering: true,
          force: true
        })
        .toBuffer();
      
      fs.writeFileSync(filePath, optimizedBuffer);
      
      logger.info(`📸 Застосовано оптимізацію PNG до ${path.basename(filePath)}`);
    } catch (error) {
      throw new Error(`Помилка оптимізації PNG: ${error.message}`);
    }
  }

  /**
   * ✅ FIX: Оптимізація JPEG
   */
  async optimizeJPEG(filePath) {
    try {
      const originalBuffer = fs.readFileSync(filePath);
      
      const optimizedBuffer = await sharp(originalBuffer)
        .jpeg({
          quality: Math.round(this.compressionLevel * 100),
          progressive: true,
          mozjpeg: true,
          force: true
        })
        .toBuffer();
      
      fs.writeFileSync(filePath, optimizedBuffer);
      
      logger.info(`📸 Застосовано оптимізацію JPEG до ${path.basename(filePath)}`);
    } catch (error) {
      throw new Error(`Помилка оптимізації JPEG: ${error.message}`);
    }
  }

  /**
   * ✅ FIX: Оптимізація SVG
   */
  async optimizeSVG(filePath) {
    try {
      let svgContent = fs.readFileSync(filePath, 'utf8');

      // ✅ FIX: Базові оптимізації SVG
      svgContent = svgContent
        .replace(/<!--[\s\S]*?-->/g, '') // Видаляємо коментарі
        .replace(/\s+/g, ' ') // Стискаємо пробіли
        .replace(/>\s+</g, '><') // Видаляємо пробіли між тегами
        .replace(/fill="[^"]*"/g, '') // Видаляємо fill для іконок
        .trim();

      fs.writeFileSync(filePath, svgContent, 'utf8');
      logger.info(`🎨 Застосовано оптимізацію SVG до ${path.basename(filePath)}`);
    } catch (error) {
      throw new Error(`Помилка оптимізації SVG: ${error.message}`);
    }
  }

  /**
   * ✅ FIX: Створення CSS файлу для зображень
   */
  generateImageCSS(processedImages) {
    let css = '/* ✅ Згенеровані стилі зображень з Figma */\n';
    css += `/* Згенеровано: ${new Date().toLocaleString()} */\n`;
    css += `/* Імпортовано зображень: ${processedImages.length} */\n\n`;

    // ✅ FIX: CSS змінні для шляхів
    css += ':root {\n';
    css += '  --images-path: "./images/";\n';
    css += '}\n\n';

    processedImages.forEach(image => {
      const className = this.generateCSSClassName(image.name);

      // ✅ FIX: Основний клас
      css += `/* Figma Image: ${image.originalName} */\n`;
      css += `.${className} {\n`;

      // ✅ FIX: Шукаємо найкращий формат
      const pngFile = image.files.find(f => f.format === 'png' && f.scale === 1);
      const jpgFile = image.files.find(f => f.format === 'jpg' && f.scale === 1);
      const svgFile = image.files.find(f => f.format === 'svg' && f.scale === 1);

      const primaryFile = svgFile || pngFile || jpgFile || image.files[0];

      if (primaryFile) {
        css += `  background-image: url(var(--images-path)${primaryFile.fileName});\n`;
        css += '  background-size: cover;\n';
        css += '  background-position: center;\n';
        css += '  background-repeat: no-repeat;\n';
      }

      css += '}\n\n';

      // ✅ FIX: Retina варіанти
      const retinaFiles = image.files.filter(f => f.scale > 1);
      if (retinaFiles.length > 0) {
        css += `/* Retina-версія для ${image.originalName} */\n`;
        css += '@media only screen and (-webkit-min-device-pixel-ratio: 2),\n';
        css += '       only screen and (min--moz-device-pixel-ratio: 2),\n';
        css += '       only screen and (-o-min-device-pixel-ratio: 2/1),\n';
        css += '       only screen and (min-device-pixel-ratio: 2),\n';
        css += '       only screen and (min-resolution: 192dpi),\n';
        css += '       only screen and (min-resolution: 2dppx) {\n';
        css += `  .${className} {\n`;

        const retinaFile = retinaFiles[0];
        css += `    background-image: url(var(--images-path)${retinaFile.fileName});\n`;

        css += '  }\n';
        css += '}\n\n';
      }
    });

    // ✅ FIX: Utility класи
    css += '/* ✅ Допоміжні класи для зображень */\n';
    css += '.img-responsive {\n';
    css += '  max-width: 100%;\n';
    css += '  height: auto;\n';
    css += '}\n\n';

    css += '.img-contain {\n';
    css += '  background-size: contain !important;\n';
    css += '}\n\n';

    css += '.img-cover {\n';
    css += '  background-size: cover !important;\n';
    css += '}\n\n';

    return css;
  }

  /**
   * ✅ FIX: Генерація sprite для SVG іконок
   */
  async generateSVGSprite(processedImages) {
    const svgImages = processedImages.filter(img => img.files.some(f => f.format === 'svg'));

    if (svgImages.length === 0) {
      return null;
    }

    // ✅ Конфігурований SVG namespace URL
    const svgNamespace = 'http://www.w3.org/2000/svg';
    let sprite = `<svg xmlns="${svgNamespace}" style="display: none;">\n`;

    for (const image of svgImages) {
      const svgFile = image.files.find(f => f.format === 'svg');
      if (svgFile) {
        try {
          const svgContent = fs.readFileSync(svgFile.filePath, 'utf8');
          const symbolId = this.generateCSSClassName(image.name);

          // ✅ FIX: Витягуємо вміст SVG та обгортаємо в symbol
          const svgBody = svgContent
            .replace(/<svg[^>]*>/, '')
            .replace(/<\/svg>/, '')
            .replace(/fill="[^"]*"/g, ''); // Видаляємо fill для кастомізації

          sprite += `  <symbol id="${symbolId}" viewBox="0 0 24 24">\n`;
          sprite += `    ${svgBody}\n`;
          sprite += '  </symbol>\n';
        } catch (error) {
          logger.warn(`⚠️ Failed to add ${image.name} to sprite:`, error.message);
        }
      }
    }

    sprite += '</svg>\n';

    // ✅ FIX: Збереження sprite
    const spritePath = path.join(this.outputDir, 'icons.svg');
    fs.writeFileSync(spritePath, sprite, 'utf8');

    logger.info(`🎨 Generated SVG sprite: ${spritePath}`);

    return {
      filePath: spritePath,
      iconsCount: svgImages.length,
      usage: this.generateSpriteUsageCSS(svgImages)
    };
  }

  /**
   * ✅ FIX: Генерація CSS для sprite
   */
  generateSpriteUsageCSS(svgImages) {
    let css = '/* ✅ SVG Sprite Usage */\n';
    css += '.icon {\n';
    css += '  display: inline-block;\n';
    css += '  width: 1em;\n';
    css += '  height: 1em;\n';
    css += '  fill: currentColor;\n';
    css += '}\n\n';

    svgImages.forEach(image => {
      const className = this.generateCSSClassName(image.name);
      css += `.icon-${className} {\n`;
      css +=
        '  /* Використання: <svg class="icon icon-${className}"><use href="#${className}"></use></svg> */\n';
      css += '}\n\n';
    });

    return css;
  }

  /**
   * ✅ FIX: Отримання зображень тільки з вибраних canvas
   */
  async getAllImagesFromCanvases(figmaClient, fileKey, selectedCanvasIds = []) {
    try {
      // Отримуємо структуру файлу
      const file = await figmaClient.getFile(fileKey);
      const pages = file?.document?.children || [];
      
      // Фільтруємо сторінки за вибраними canvas
      const targetPages = selectedCanvasIds.length > 0 
        ? pages.filter(p => selectedCanvasIds.includes(p.id))
        : pages;
      
      logger.info(`🎯 Filtering images from ${targetPages.length} canvas(es)`);
      
      const allImages = [];
      
      // Рекурсивний обхід для пошуку зображень
      const walkForImages = (node, parentId = null, canvasId = null) => {
        if (!node) return;
        
        // Перевіряємо, чи є це зображенням або має зображення у fills
        if (node.fills && Array.isArray(node.fills)) {
          const imageFields = node.fills.filter(fill => 
            fill.type === 'IMAGE' && fill.imageRef
          );
          
          if (imageFields.length > 0) {
            allImages.push({
              id: node.id,
              name: node.name || `image-${node.id}`,
              type: node.type || 'IMAGE',
              canvasId: canvasId,
              parentId: parentId,
              imageRef: imageFields[0].imageRef,
              layerType: node.type, // Додаємо тип layer
              isLayer: true // Маркуємо як layer
            });
            logger.info(`🖼️ Found image in layer: ${node.name} (${node.id}) on canvas ${canvasId}`);
          }
        }
        
        // Також перевіряємо, чи це зображення як окремий тип вузла
        if (node.type === 'RECTANGLE' && node.fills) {
          // Додаткова перевірка для прямокутників із зображеннями
          const hasImage = node.fills.some(fill => fill.type === 'IMAGE');
          if (hasImage && !allImages.find(img => img.id === node.id)) {
            allImages.push({
              id: node.id,
              name: node.name || `rect-image-${node.id}`,
              type: 'RECTANGLE_IMAGE',
              canvasId: canvasId,
              parentId: parentId,
              layerType: node.type,
              isLayer: true
            });
          }
        }
        
        // Рекурсивно обходимо дочірні елементи
        if (node.children && Array.isArray(node.children)) {
          node.children.forEach(child => 
            walkForImages(child, node.id, canvasId || node.id)
          );
        }
      };
      
      // Обходимо кожну вибрану сторінку
      targetPages.forEach(page => {
        logger.info(`🔍 Scanning canvas: ${page.name} (${page.id})`);
        walkForImages(page, null, page.id);
      });
      
      logger.info(`📸 Found ${allImages.length} images in ${targetPages.length} canvas(es)`);
      
      // Додаткове логування для діагностики
      if (selectedCanvasIds.length > 0) {
        logger.info(`🎯 Canvas filtering active - selected: ${selectedCanvasIds.join(', ')}`);
      } else {
        logger.info(`🌍 Processing all available canvas (${targetPages.length} total)`);
      }
      
      allImages.forEach((img, index) => {
        logger.info(`  ${index + 1}. ${img.name} (${img.type}) - Layer ID: ${img.id} - Canvas: ${img.canvasId}`);
      });
      
      return allImages;
      
    } catch (error) {
      logger.error('❌ Error getting images from canvases:', error.message);
      // ✅ FIX: Повертаємо порожній масив замість fallback
      return [];
    }
  }

  /**
   * ✅ FIX: Допоміжні методи
   */
  ensureOutputDirectory() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, {recursive: true});
      logger.info(`📁 Created output directory: ${this.outputDir}`);
    }
  }

  sanitizeFileName(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')    // Видаляємо спеціальні символи, але залишаємо дефіси
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  generateCSSClassName(name) {
    return this.sanitizeFileName(name).replace(/-/g, '-');
  }

  getFileSize(filePath) {
    try {
      const stats = fs.statSync(filePath);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  saveCSSFile(cssContent) {
    const cssPath = path.join(this.outputDir, 'images.css');
    fs.writeFileSync(cssPath, cssContent, 'utf8');
    logger.info(`📄 Generated CSS file: ${cssPath}`);
  }

  /**
   * ✅ FIX: Отримання статистики імпорту
   */
  getImportStats(processedImages) {
    const totalFiles = processedImages.reduce((sum, img) => sum + img.files.length, 0);
    const totalSize = processedImages.reduce((sum, img) => {
      return sum + img.files.reduce((fileSum, file) => fileSum + file.size, 0);
    }, 0);

    const formatCounts = {};
    processedImages.forEach(img => {
      img.files.forEach(file => {
        formatCounts[file.format] = (formatCounts[file.format] || 0) + 1;
      });
    });

    return {
      imagesCount: processedImages.length,
      filesCount: totalFiles,
      totalSize: this.formatBytes(totalSize),
      formats: formatCounts,
      outputDirectory: this.outputDir
    };
  }
}

module.exports = ImageImporter;
