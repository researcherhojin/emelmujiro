#!/usr/bin/env node

/**
 * Image optimization script
 * Optimizes all images in the assets directory
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ASSETS_DIR = path.join(__dirname, '../src/assets');
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;
const JPEG_QUALITY = 85;
const PNG_QUALITY = 90;

// Image size thresholds
const SIZE_THRESHOLDS = {
  logo: { width: 400, height: 400 },
  icon: { width: 192, height: 192 },
  thumbnail: { width: 300, height: 300 },
  default: { width: 1200, height: 1200 },
};

async function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const fileName = path.basename(filePath);
  const fileSize = fs.statSync(filePath).size;

  console.log(`Processing: ${fileName} (${(fileSize / 1024).toFixed(1)}KB)`);

  try {
    let pipeline = sharp(filePath);
    const metadata = await pipeline.metadata();

    // Determine optimal dimensions based on file name and location
    let maxDimensions = SIZE_THRESHOLDS.default;
    if (fileName.includes('logo')) {
      maxDimensions = SIZE_THRESHOLDS.logo;
    } else if (fileName.includes('icon')) {
      maxDimensions = SIZE_THRESHOLDS.icon;
    } else if (fileName.includes('thumb')) {
      maxDimensions = SIZE_THRESHOLDS.thumbnail;
    }

    // Only resize if larger than max dimensions
    if (
      metadata.width > maxDimensions.width ||
      metadata.height > maxDimensions.height
    ) {
      pipeline = pipeline.resize(maxDimensions.width, maxDimensions.height, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Optimize based on format
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        await pipeline
          .jpeg({ quality: JPEG_QUALITY, progressive: true })
          .toFile(filePath + '.optimized');
        break;

      case '.png':
        await pipeline
          .png({ quality: PNG_QUALITY, compressionLevel: 9 })
          .toFile(filePath + '.optimized');
        break;

      default:
        console.log(`  Skipping unsupported format: ${ext}`);
        return;
    }

    // Check if optimization was successful
    const optimizedSize = fs.statSync(filePath + '.optimized').size;
    const savings = ((1 - optimizedSize / fileSize) * 100).toFixed(1);

    if (optimizedSize < fileSize) {
      // Replace original with optimized version
      fs.renameSync(filePath + '.optimized', filePath);
      console.log(
        `  ✓ Optimized: ${(optimizedSize / 1024).toFixed(1)}KB (saved ${savings}%)`
      );
    } else {
      // Remove optimized version if no improvement
      fs.unlinkSync(filePath + '.optimized');
      console.log(`  ⚬ Already optimal`);
    }
  } catch (error) {
    console.error(`  ✗ Error: ${error.message}`);
    // Clean up any temporary files
    if (fs.existsSync(filePath + '.optimized')) {
      fs.unlinkSync(filePath + '.optimized');
    }
  }
}

async function findAndOptimizeImages(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      await findAndOptimizeImages(fullPath);
    } else if (file.isFile()) {
      const ext = path.extname(file.name).toLowerCase();
      if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        // Skip if file is larger than 100KB
        const fileSize = fs.statSync(fullPath).size;
        if (fileSize > 100 * 1024) {
          await optimizeImage(fullPath);
        }
      }
    }
  }
}

// Main execution
async function main() {
  console.log('Starting image optimization...\n');

  if (!fs.existsSync(ASSETS_DIR)) {
    console.error('Assets directory not found:', ASSETS_DIR);
    process.exit(1);
  }

  await findAndOptimizeImages(ASSETS_DIR);

  console.log('\nImage optimization complete!');
}

main().catch(console.error);
