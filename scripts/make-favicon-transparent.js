const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function makeTransparent() {
  const inputPath = path.join(__dirname, '../public/favicon.png');
  const outputPathPng = path.join(__dirname, '../public/favicon.png');
  const outputPathIco = path.join(__dirname, '../src/app/favicon.ico');

  try {
    // Read the image and make white pixels transparent
    await sharp(inputPath)
      .flatten({ background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .removeAlpha()
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
      .then(({ data, info }) => {
        // Process pixels to make white transparent
        const pixels = new Uint8ClampedArray(data);
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];

          // Check if pixel is white or near-white
          if (r > 250 && g > 250 && b > 250) {
            pixels[i + 3] = 0; // Make transparent
          }
        }

        // Save as PNG with transparency
        return sharp(Buffer.from(pixels.buffer), {
          raw: {
            width: info.width,
            height: info.height,
            channels: 4
          }
        })
        .png()
        .toFile(outputPathPng);
      });

    // Also save as ICO (which is really a PNG in this case)
    await sharp(outputPathPng)
      .resize(32, 32)
      .png()
      .toFile(outputPathIco);

    console.log('Favicon updated with transparent background!');
    console.log('- Updated:', outputPathPng);
    console.log('- Updated:', outputPathIco);
  } catch (error) {
    console.error('Error processing favicon:', error);
  }
}

makeTransparent();