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

      // ✅ FIX: Отримуємо інформацію про всі layers для створення тек
      logger.info('🔄 Getting all layers info for folder structure...');
      const allLayers = await this.getAllLayersInfo(figmaClient, fileKey);
      logger.info(`📋 Found ${allLayers.length} layers for folder organization`);

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
          const result = await this.processImage(figmaClient, fileKey, image, allLayers);
          processedImages.push(result);
          logger.info(`✅ Processed: ${result.name} → Layer: ${result.layerName}`);
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

      // ✅ FIX: Генерація SVG спрайту для іконок
      const iconImages = processedImages.filter(img => img.isIcon);
      let spriteInfo = null;
      if (iconImages.length > 0) {
        spriteInfo = await this.generateSVGSprite(iconImages);
        logger.info(`🎨 Generated SVG sprite with ${iconImages.length} icons`);
      }

      return {
        success: true,
        images: processedImages,
        icons: iconImages,
        sprite: spriteInfo,
        errors: errors,
        cssFile: path.join(this.outputDir, 'images.css'),
        message: `Successfully imported ${processedImages.length} images (${iconImages.length} icons)`
      };
    } catch (error) {
      logger.error('❌ Імпорт зображень не вдався:', error.message);
      throw new Error(`Помилка імпорту зображень: ${error.message}`);
    }
  }

  /**
   * ✅ FIX: Обробка окремого зображення з ієрархічним збереженням за структурою Figma
   */
  async processImage(figmaClient, fileKey, imageInfo, allLayers = []) {
    // ✅ FIX: Створюємо унікальну назву файлу з оригінальної назви Figma
    const originalName = imageInfo.name || 'unnamed-image';
    const cleanName = this.createUniqueFileName(originalName, imageInfo.id);

    // ✅ FIX: Будуємо повний ієрархічний шлях за структурою Figma шарів
    const hierarchicalPath = this.buildHierarchicalPath(imageInfo, allLayers);
    const parentLayer = this.findParentLayer(imageInfo, allLayers);

    const imageData = {
      id: imageInfo.id,
      name: cleanName,
      originalName: originalName,
      type: imageInfo.type,
      layerName: parentLayer?.name || 'Unknown Layer',
      layerFolder: hierarchicalPath[hierarchicalPath.length - 1] || 'unknown-layer',
      hierarchicalPath: hierarchicalPath, // Зберігаємо повний шлях
      fullPath: hierarchicalPath.join('/'), // Шлях як рядок
      isIcon: imageInfo.isIcon || false,
      isVector: imageInfo.isVector || false,
      iconSize: imageInfo.size || { width: 24, height: 24 },
      files: []
    };

    // ✅ FIX: Спеціальна логіка для іконок та звичайних зображень
    const formatsToExport = imageInfo.isIcon ? ['svg'] : this.formats; // Іконки експортуємо тільки в SVG
    const scalesToExport = imageInfo.isIcon ? [1] : this.scales; // Іконки тільки в 1x розмірі

    for (const format of formatsToExport) {
      for (const scale of scalesToExport) {
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

          // ✅ FIX: Створюємо ієрархічну структуру папок за Figma шарами
          let basePath;
          if (imageInfo.isIcon) {
            // Для іконок: images/icons/[ієрархічний-шлях]
            basePath = path.join(this.outputDir, 'icons', ...hierarchicalPath);
          } else {
            // Для зображень: images/[ієрархічний-шлях]/[format]/[scale]
            basePath = path.join(this.outputDir, ...hierarchicalPath, format, scaleFolder);
          }

          if (!fs.existsSync(basePath)) {
            fs.mkdirSync(basePath, { recursive: true });
          }
          const filePath = path.join(basePath, fileName);

          logger.info(`📁 Створюю файл: ${filePath}`);

          // ✅ FIX: Завантаження файлу
          await this.downloadFile(exportUrl, filePath);

          // ✅ FIX: Спеціальна обробка для SVG іконок
          if (imageInfo.isIcon && format === 'svg') {
            await this.processSVGIcon(filePath);
          }

          // ✅ FIX: Оптимізація (якщо включена)
          if (this.optimizeImages && !imageInfo.isIcon) {
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
   * ✅ FIX: Розширена оптимізація SVG
   */
  async optimizeSVG(filePath) {
    try {
      let svgContent = fs.readFileSync(filePath, 'utf8');

      // ✅ FIX: Розширені оптимізації SVG
      svgContent = svgContent
        // Видаляємо коментарі
        .replace(/<!--[\s\S]*?-->/g, '')
        // Видаляємо metadata
        .replace(/<metadata[\s\S]*?<\/metadata>/gi, '')
        // Видаляємо DOCTYPE
        .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
        // Видаляємо XML декларації
        .replace(/<\?xml[\s\S]*?\?>/gi, '')
        // Видаляємо зайві атрибути
        .replace(/\s*(id|class|data-[\w-]+)\s*=\s*["'][^"']*["']/gi, '')
        // Видаляємо зайві namespace
        .replace(/\s*xmlns:[\w]+\s*=\s*["'][^"']*["']/gi, '')
        // Видаляємо editor-specific атрибути
        .replace(/\s*(inkscape|sodipodi|adobe|sketch)[\w:-]*\s*=\s*["'][^"']*["']/gi, '')
        // Видаляємо пусті групи
        .replace(/<g[^>]*>\s*<\/g>/gi, '')
        // Видаляємо fill та stroke для кастомізації
        .replace(/\s*fill\s*=\s*["'][^"']*["']/gi, '')
        .replace(/\s*stroke\s*=\s*["'][^"']*["']/gi, '')
        // Видаляємо style атрибути з fill/stroke
        .replace(/style\s*=\s*["']([^"']*?)fill\s*:[^;"']*;?([^"']*?)["']/gi, 'style="$1$2"')
        .replace(/style\s*=\s*["']([^"']*?)stroke\s*:[^;"']*;?([^"']*?)["']/gi, 'style="$1$2"')
        // Видаляємо пусті style атрибути
        .replace(/\s*style\s*=\s*["']\s*["']/gi, '')
        // Стискаємо пробіли
        .replace(/\s+/g, ' ')
        // Видаляємо пробіли між тегами
        .replace(/>\s+</g, '><')
        // Округлюємо числа в path та інших атрибутах
        .replace(/(\d+\.\d{3,})/g, (match) => parseFloat(match).toFixed(2))
        // Видаляємо зайві пробіли в path
        .replace(/\s*([MLHVCSQTAZ])\s*/gi, '$1')
        .replace(/\s*,\s*/g, ',')
        .trim();

      // Додаємо fill="currentColor" для кастомізації кольору
      if (!svgContent.includes('fill=') && !svgContent.includes('currentColor')) {
        svgContent = svgContent.replace(
          /<svg([^>]*)>/i,
          '<svg$1 fill="currentColor">'
        );
      }

      fs.writeFileSync(filePath, svgContent, 'utf8');
      logger.info(`🎨 Застосовано розширену оптимізацію SVG до ${path.basename(filePath)}`);
    } catch (error) {
      throw new Error(`Помилка оптимізації SVG: ${error.message}`);
    }
  }

  /**
   * ✅ FIX: Створення CSS файлу для зображень
   */
  generateImageCSS(processedImages) {
    let css = '/* ✅ Згенеровані стилі зображень з Figma (з layer теками) */\n';
    css += `/* Згенеровано: ${new Date().toLocaleString()} */\n`;
    css += `/* Імпортовано зображень: ${processedImages.length} */\n`;
    css += `/* Структура: images/[layer-name]/[format]/[@scale]/[filename] */\n\n`;

    // ✅ FIX: CSS змінні для шляхів
    css += ':root {\n';
    css += '  --images-path: "./images/";\n';
    css += '}\n\n';

    processedImages.forEach(image => {
      const className = this.generateCSSClassName(image.name);

      // ✅ FIX: Основний клас з інформацією про layer та ієрархічний шлях
      css += `/* Figma Image: ${image.originalName} */\n`;
      css += `/* Layer Path: ${image.fullPath} */\n`;
      css += `.${className} {\n`;

      // ✅ FIX: Шукаємо найкращий формат
      const pngFile = image.files.find(f => f.format === 'png' && f.scale === 1);
      const jpgFile = image.files.find(f => f.format === 'jpg' && f.scale === 1);
      const svgFile = image.files.find(f => f.format === 'svg' && f.scale === 1);

      const primaryFile = svgFile || pngFile || jpgFile || image.files[0];

      if (primaryFile) {
        // ✅ FIX: Використовуємо повний ієрархічний шлях
        const relativePath = image.isIcon
          ? `icons/${image.hierarchicalPath.join('/')}/${primaryFile.fileName}`
          : `${image.hierarchicalPath.join('/')}/${primaryFile.format}/@1x/${primaryFile.fileName}`;
        css += `  background-image: url(var(--images-path)${relativePath});\n`;
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
        // ✅ FIX: Використовуємо ієрархічний шлях для retina
        const retinaRelativePath = image.isIcon
          ? `icons/${image.hierarchicalPath.join('/')}/${retinaFile.fileName}`
          : `${image.hierarchicalPath.join('/')}/${retinaFile.format}/@${retinaFile.scale}x/${retinaFile.fileName}`;
        css += `    background-image: url(var(--images-path)${retinaRelativePath});\n`;

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
   * ✅ FIX: Генерація оптимізованого sprite для SVG іконок
   */
  async generateSVGSprite(iconImages) {
    if (!iconImages || iconImages.length === 0) {
      return null;
    }

    // ✅ Конфігурований SVG namespace URL
    const svgNamespace = 'http://www.w3.org/2000/svg';
    let sprite = `<svg xmlns="${svgNamespace}" style="display: none;">\n`;

    for (const icon of iconImages) {
      const svgFile = icon.files.find(f => f.format === 'svg');
      if (svgFile) {
        try {
          let svgContent = fs.readFileSync(svgFile.filePath, 'utf8');
          const symbolId = this.generateCSSClassName(icon.name);

          // ✅ FIX: Витягуємо viewBox з оригінального SVG
          const viewBoxMatch = svgContent.match(/viewBox\s*=\s*["']([^"']+)["']/i);
          const viewBox = viewBoxMatch ? viewBoxMatch[1] : `0 0 ${icon.iconSize.width} ${icon.iconSize.height}`;

          // ✅ FIX: Витягуємо вміст SVG та обгортаємо в symbol з #frame ідентифікатором
          const svgBody = svgContent
            .replace(/<svg[^>]*>/, '')
            .replace(/<\/svg>/, '')
            .replace(/fill="[^"]*"/g, '') // Видаляємо fill для кастомізації
            .replace(/\s*stroke\s*=\s*["'][^"']*["']/gi, '') // Видаляємо stroke
            .trim();

          // ✅ FIX: Додаємо #frame до ID для легшого пошуку
          const frameSymbolId = `frame-${symbolId}`;
          sprite += `  <symbol id="${frameSymbolId}" viewBox="${viewBox}">\n`;
          sprite += `    ${svgBody}\n`;
          sprite += '  </symbol>\n';

          logger.info(`🎨 Added icon to sprite: ${icon.name} (${icon.iconSize.width}x${icon.iconSize.height})`);
        } catch (error) {
          logger.warn(`⚠️ Failed to add ${icon.name} to sprite:`, error.message);
        }
      }
    }

    sprite += '</svg>\n';

    // ✅ FIX: Оптимізація sprite
    sprite = this.optimizeSVGForIcon(sprite);

    // ✅ FIX: Збереження sprite
    const spritePath = path.join(this.outputDir, 'icons.svg');
    fs.writeFileSync(spritePath, sprite, 'utf8');

    logger.info(`🎨 Generated optimized SVG sprite: ${spritePath} (${iconImages.length} icons)`);

    // ✅ FIX: Генерація CSS для використання sprite
    const spriteCSS = this.generateSpriteUsageCSS(iconImages);
    const spriteCSSPath = path.join(this.outputDir, 'icons.css');
    fs.writeFileSync(spriteCSSPath, spriteCSS, 'utf8');

    return {
      filePath: spritePath,
      cssFilePath: spriteCSSPath,
      iconsCount: iconImages.length,
      usage: spriteCSS
    };
  }

  /**
   * ✅ FIX: Генерація CSS для sprite з розмірами іконок
   */
  generateSpriteUsageCSS(iconImages) {
    let css = '/* ✅ SVG Icons Sprite - Optimized for Use */\n';
    css += `/* Generated: ${new Date().toLocaleString()} */\n`;
    css += `/* Icons count: ${iconImages.length} */\n\n`;

    // ✅ Базовий клас для всіх іконок
    css += '.icon {\n';
    css += '  display: inline-block;\n';
    css += '  width: 1em;\n';
    css += '  height: 1em;\n';
    css += '  fill: currentColor;\n';
    css += '  flex-shrink: 0;\n';
    css += '}\n\n';

    // ✅ Додаткові розміри іконок
    css += '/* Icon Sizes */\n';
    css += '.icon-xs { width: 12px; height: 12px; }\n';
    css += '.icon-sm { width: 16px; height: 16px; }\n';
    css += '.icon-md { width: 20px; height: 20px; }\n';
    css += '.icon-lg { width: 24px; height: 24px; }\n';
    css += '.icon-xl { width: 32px; height: 32px; }\n';
    css += '.icon-2xl { width: 48px; height: 48px; }\n\n';

    // ✅ Специфічні класи для кожної іконки з #frame префіксом
    iconImages.forEach(icon => {
      const className = this.generateCSSClassName(icon.name);
      const frameSymbolId = `frame-${className}`;
      css += `/* Icon: ${icon.originalName} (${icon.iconSize.width}x${icon.iconSize.height}) */\n`;
      css += `.icon-${className} {\n`;
      css += `  /* Використання: <svg class="icon icon-${className}"><use href="#${frameSymbolId}"></use></svg> */\n`;

      // Додаємо оригінальні розміри як custom properties
      if (icon.iconSize.width !== 24 || icon.iconSize.height !== 24) {
        css += `  --icon-width: ${icon.iconSize.width}px;\n`;
        css += `  --icon-height: ${icon.iconSize.height}px;\n`;
      }

      css += '}\n\n';
    });

    // ✅ Додаємо інструкції з використання з #frame префіксом
    css += '/* Usage Examples:\n';
    css += ' * Basic: <svg class="icon icon-name"><use href="#frame-icon-name"></use></svg>\n';
    css += ' * With size: <svg class="icon icon-lg icon-name"><use href="#frame-icon-name"></use></svg>\n';
    css += ' * Custom color: <svg class="icon" style="color: #ff0000;"><use href="#frame-icon-name"></use></svg>\n';
    css += ' */\n';

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
        
        // ✅ FIX: Розпізнавання векторних іконок
        if (this.isVectorIcon(node)) {
          allImages.push({
            id: node.id,
            name: node.name || `icon-${node.id}`,
            type: 'VECTOR_ICON',
            canvasId: canvasId,
            parentId: parentId,
            layerType: node.type,
            isIcon: true,
            isVector: true,
            size: this.extractIconSize(node),
            isLayer: true
          });
          logger.info(`🎨 Found vector icon: ${node.name} (${node.id}) - ${node.type}`);
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
   * ✅ FIX: Отримує інформацію про всі layers з файлу
   */
  async getAllLayersInfo(figmaClient, fileKey) {
    try {
      const file = await figmaClient.getFile(fileKey);
      const pages = file?.document?.children || [];

      const allLayers = [];

      // Рекурсивний обхід для збору всіх layers
      const walkForLayers = (node, parentId = null, canvasId = null, depth = 0) => {
        if (!node) return;

        allLayers.push({
          id: node.id,
          name: node.name || `Layer-${node.id}`,
          type: node.type,
          parentId: parentId,
          canvasId: canvasId || node.id,
          depth: depth,
          children: node.children ? node.children.map(child => ({ id: child.id, name: child.name })) : []
        });

        // Рекурсивно обходимо дочірні елементи
        if (node.children && Array.isArray(node.children)) {
          node.children.forEach(child =>
            walkForLayers(child, node.id, canvasId || node.id, depth + 1)
          );
        }
      };

      // Обходимо кожну сторінку
      pages.forEach(page => {
        walkForLayers(page, null, page.id, 0);
      });

      logger.info(`📋 Collected ${allLayers.length} layers from Figma file`);
      return allLayers;

    } catch (error) {
      logger.error('❌ Error getting layers info:', error.message);
      return [];
    }
  }

  /**
   * ✅ FIX: Створює повний ієрархічний шлях за структурою Figma шарів
   */
  buildHierarchicalPath(imageInfo, allLayers) {
    if (!allLayers || allLayers.length === 0) {
      return ['unknown-canvas', 'unknown-layer'];
    }

    // Знаходимо layer для цього зображення
    const targetLayer = this.findTargetLayer(imageInfo, allLayers);
    if (!targetLayer) {
      return ['unknown-canvas', 'unknown-layer'];
    }

    // Будуємо повний ієрархічний шлях від canvas до поточного layer
    const pathParts = [];
    let currentLayer = targetLayer;

    // Йдемо вгору по ієрархії до самого верху
    while (currentLayer) {
      const safeName = this.sanitizeFileName(currentLayer.name || currentLayer.type || 'unnamed');
      pathParts.unshift(safeName); // Додаємо на початок для правильного порядку

      // Шукаємо батьківський layer
      const parent = allLayers.find(l => l.id === currentLayer.parentId);
      currentLayer = parent;

      // Якщо досягли canvas (depth = 0), зупиняємося
      if (currentLayer && currentLayer.depth === 0) {
        const canvasName = this.sanitizeFileName(currentLayer.name || 'canvas');
        pathParts.unshift(canvasName);
        break;
      }
    }

    // Якщо шлях пустий, використовуємо fallback
    if (pathParts.length === 0) {
      pathParts.push('unknown-canvas', 'unknown-layer');
    }

    logger.info(`📁 Ієрархічний шлях для ${imageInfo.name}: ${pathParts.join(' / ')}`);
    return pathParts;
  }

  /**
   * ✅ FIX: Знаходить цільовий layer для зображення
   */
  findTargetLayer(imageInfo, allLayers) {
    // Спочатку шукаємо прямий збіг по ID
    let layer = allLayers.find(l => l.id === imageInfo.id);
    if (layer) {
      return layer;
    }

    // Потім шукаємо по parentId
    layer = allLayers.find(l => l.id === imageInfo.parentId);
    if (layer) {
      return layer;
    }

    // Шукаємо по layerId (якщо є)
    if (imageInfo.layerId) {
      layer = allLayers.find(l => l.id === imageInfo.layerId);
      if (layer) {
        return layer;
      }
    }

    // Шукаємо серед батьківських елементів
    for (const l of allLayers) {
      if (l.children && l.children.some(child => child.id === imageInfo.id)) {
        return l;
      }
    }

    // Fallback - повертаємо перший layer з canvas
    const canvasLayer = allLayers.find(l => l.canvasId === imageInfo.canvasId);
    return canvasLayer || allLayers[0] || null;
  }

  /**
   * ✅ FIX: Знаходить батьківський layer для зображення (legacy функція)
   */
  findParentLayer(imageInfo, allLayers) {
    return this.findTargetLayer(imageInfo, allLayers);
  }

  /**
   * ✅ FIX: Розпізнає векторні іконки ТІЛЬКИ для FRAME з назвою, що починається з #
   */
  isVectorIcon(node) {
    if (!node || !node.type) return false;

    // ✅ FIX: Імпортуємо ТІЛЬКИ FRAME, що мають назви, які починаються з '#'
    if (node.type === 'FRAME') {
      // Перевіряємо, чи назва починається з '#frame' (для іконок спрайту)
      const isFrameIcon = node.name && node.name.startsWith('#');

      if (isFrameIcon) {
        // Також перевіряємо наявність векторних дочірніх елементів для підтвердження
        const vectorTypes = ['VECTOR', 'STAR', 'POLYGON', 'ELLIPSE', 'LINE'];
        const hasVectorChildren = node.children?.some(child =>
          vectorTypes.includes(child.type)
        );

        // Якщо це #frame ТА має векторні елементи - це іконка для спрайту
        return hasVectorChildren;
      }
    }

    // Інші типи та FRAME без '#' не імпортуємо як векторні іконки для спрайту
    return false;
  }

  /**
   * ✅ FIX: Витягує розміри іконки з Figma node
   */
  extractIconSize(node) {
    if (!node) return { width: 24, height: 24 }; // Розмір за замовчуванням

    // Витягуємо розміри з bounding box або absoluteBoundingBox
    const bounds = node.absoluteBoundingBox || node.boundingBox || {};

    return {
      width: Math.round(bounds.width || 24),
      height: Math.round(bounds.height || 24)
    };
  }

  /**
   * ✅ FIX: Обробляє SVG іконку - очищає fill та оптимізує
   */
  async processSVGIcon(filePath) {
    try {
      let svgContent = fs.readFileSync(filePath, 'utf8');

      // Очищуємо fill атрибути
      svgContent = this.cleanSVGFills(svgContent);

      // Додаємо currentColor як fill за замовчуванням для кастомізації
      svgContent = svgContent.replace(
        /<svg([^>]*)>/i,
        '<svg$1 fill="currentColor">'
      );

      // Оптимізуємо SVG
      svgContent = this.optimizeSVGForIcon(svgContent);

      // Записуємо оброблений файл
      fs.writeFileSync(filePath, svgContent, 'utf8');

      logger.info(`🎨 Processed SVG icon: ${path.basename(filePath)}`);
    } catch (error) {
      logger.warn(`⚠️ Failed to process SVG icon ${path.basename(filePath)}:`, error.message);
    }
  }

  /**
   * ✅ FIX: Розширена оптимізація SVG для іконок
   */
  optimizeSVGForIcon(svgContent) {
    if (!svgContent) return svgContent;

    return svgContent
      // Видаляємо коментарі та metadata
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<metadata[\s\S]*?<\/metadata>/gi, '')
      .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
      .replace(/<\?xml[\s\S]*?\?>/gi, '')
      // Видаляємо зайві атрибути
      .replace(/\s*(id|class|data-[\w-]+)\s*=\s*["'][^"']*["']/gi, '')
      // Видаляємо зайві namespace
      .replace(/\s*xmlns:[\w]+\s*=\s*["'][^"']*["']/gi, '')
      // Видаляємо editor-specific атрибути
      .replace(/\s*(inkscape|sodipodi|adobe|sketch)[\w:-]*\s*=\s*["'][^"']*["']/gi, '')
      // Видаляємо title та desc елементи
      .replace(/<title[\s\S]*?<\/title>/gi, '')
      .replace(/<desc[\s\S]*?<\/desc>/gi, '')
      // Видаляємо пусті групи
      .replace(/<g[^>]*>\s*<\/g>/gi, '')
      // Видаляємо defs якщо вони пусті
      .replace(/<defs[^>]*>\s*<\/defs>/gi, '')
      // Оптимізуємо path команди
      .replace(/\s*([MLHVCSQTAZ])\s*/gi, '$1')
      .replace(/\s*,\s*/g, ',')
      // Стискаємо пробіли
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      // Округлюємо числа з високою точністю
      .replace(/(\d+\.\d{3,})/g, (match) => parseFloat(match).toFixed(2))
      // Видаляємо зайві нулі
      .replace(/(\.\d*?)0+(?=\D)/g, '$1')
      .replace(/\.0+(?=\D)/g, '')
      .trim();
  }

  /**
   * ✅ FIX: Очищає fill атрибути з SVG для кастомізації
   */
  cleanSVGFills(svgContent) {
    if (!svgContent) return svgContent;

    return svgContent
      // Видаляємо fill атрибути
      .replace(/\s*fill\s*=\s*["'][^"']*["']/gi, '')
      // Видаляємо fill в style атрибутах
      .replace(/fill\s*:\s*[^;]+;?/gi, '')
      // Видаляємо пусті style атрибути
      .replace(/\s*style\s*=\s*["']\s*["']/gi, '')
      // Очищуємо зайві пробіли
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim();
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

  /**
   * ✅ FIX: Створює унікальну назву файлу зберігаючи оригінальну назву з Figma
   */
  createUniqueFileName(originalName, nodeId) {
    // Зберігаємо оригінальну назву, але робимо її безпечною для файлової системи
    let safeName = originalName
      .trim()
      .replace(/[<>:"/\\|?*]/g, '') // Видаляємо заборонені символи для файлів
      .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, '') // Видаляємо контрольні символи
      .replace(/\s+/g, '_') // Замінюємо пробіли на підкреслення
      .replace(/\.+$/g, '') // Видаляємо крапки в кінці
      .slice(0, 50) || 'unnamed'; // Обмежуємо довжину

    // Додаємо короткий унікальний ідентифікатор з nodeId
    const shortId = nodeId.substring(nodeId.length - 6); // Останні 6 символів ID

    return `${safeName}_${shortId}`;
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
