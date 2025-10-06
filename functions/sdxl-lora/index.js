const express = require('express');
const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');
const sharp = require('sharp');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const firestore = admin.firestore();
const storage = new Storage();

const app = express();
app.use(express.json());

const PROJECT_ID = 'mediaforge-957e4';
const BUCKET_NAME = 'mediaforge-957e4.firebasestorage.app';
const LORA_MODELS_BUCKET = 'mediaforge-lora-models';

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', service: 'sdxl-lora' });
});

/**
 * Generate image using SDXL + LoRA
 * POST /generate
 * Body: {
 *   userId: string,
 *   illustrationId: string,
 *   prompt: string,
 *   brandId: string,
 *   width: number (1024, 1536, 2048),
 *   height: number (1024, 1536, 2048)
 * }
 */
app.post('/generate', async (req, res) => {
  console.log('SDXL + LoRA generation request:', req.body);

  try {
    const { userId, illustrationId, prompt, brandId, width = 1024, height = 1024 } = req.body;

    // Validate request
    if (!userId || !illustrationId || !prompt || !brandId) {
      return res.status(400).json({
        error: 'Missing required fields: userId, illustrationId, prompt, brandId'
      });
    }

    // Get brand training data from Firestore
    const brandDoc = await firestore
      .collection('users')
      .doc(userId)
      .collection('brands')
      .doc(brandId)
      .get();

    if (!brandDoc.exists) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    const brand = brandDoc.data();
    if (brand.status !== 'ready') {
      return res.status(400).json({
        error: 'Brand training not complete',
        status: brand.status
      });
    }

    // Build enhanced prompt with brand colors
    let enhancedPrompt = prompt;
    if (brand.colors && brand.colors.length > 0) {
      const colorString = brand.colors.map(c => c.hex).join(', ');
      enhancedPrompt += `, incorporating brand colors ${colorString}`;
    }
    if (brand.style) {
      enhancedPrompt += `, in ${brand.style} style`;
    }

    console.log('Enhanced prompt:', enhancedPrompt);
    console.log('LoRA model path:', brand.loraModelPath);

    // Generate image using Python script
    const startTime = Date.now();
    const outputPath = `/tmp/${illustrationId}.png`;

    const pythonProcess = spawn('python3', [
      path.join(__dirname, 'generate_sdxl.py'),
      '--prompt', enhancedPrompt,
      '--lora_path', brand.loraModelPath || '',
      '--output', outputPath,
      '--width', width.toString(),
      '--height', height.toString()
    ]);

    let pythonOutput = '';
    let pythonError = '';

    pythonProcess.stdout.on('data', (data) => {
      pythonOutput += data.toString();
      console.log('Python output:', data.toString());
    });

    pythonProcess.stderr.on('data', (data) => {
      pythonError += data.toString();
      console.error('Python error:', data.toString());
    });

    await new Promise((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python process exited with code ${code}: ${pythonError}`));
        } else {
          resolve();
        }
      });
    });

    // Check if image was generated
    try {
      await fs.access(outputPath);
    } catch (error) {
      throw new Error('Image generation failed - output file not created');
    }

    // Optimize image with Sharp
    const optimizedBuffer = await sharp(outputPath)
      .png({ quality: 95, compressionLevel: 9 })
      .toBuffer();

    // Create thumbnail
    const thumbnailBuffer = await sharp(optimizedBuffer)
      .resize(256, 256, { fit: 'cover' })
      .png({ quality: 90 })
      .toBuffer();

    // Upload to Cloud Storage
    const timestamp = Date.now();
    const fileName = `illustrations/${userId}/${illustrationId}.png`;
    const thumbnailFileName = `illustrations/${userId}/${illustrationId}_thumb.png`;

    const file = storage.bucket(BUCKET_NAME).file(fileName);
    await file.save(optimizedBuffer, {
      contentType: 'image/png',
      metadata: {
        metadata: {
          userId,
          illustrationId,
          brandId,
          prompt: enhancedPrompt,
          model: 'sdxl-lora',
          generatedAt: new Date().toISOString()
        }
      }
    });

    // Make file publicly readable
    await file.makePublic();

    // Upload thumbnail
    const thumbnailFile = storage.bucket(BUCKET_NAME).file(thumbnailFileName);
    await thumbnailFile.save(thumbnailBuffer, {
      contentType: 'image/png'
    });
    await thumbnailFile.makePublic();

    const imageUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${fileName}`;
    const thumbnailUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${thumbnailFileName}`;

    const generationTime = Math.floor((Date.now() - startTime) / 1000);

    // Update Firestore
    const generationData = {
      imageURL: imageUrl,
      thumbnailURL: thumbnailUrl,
      status: 'completed',
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
      generationTime,
      modelUsed: 'sdxl-lora',
      width,
      height,
      finalPrompt: enhancedPrompt,
      brandId
    };

    await firestore
      .collection('users')
      .doc(userId)
      .collection('illustrations')
      .doc(illustrationId)
      .update(generationData);

    // Clean up temp file
    await fs.unlink(outputPath).catch(() => {});

    console.log(`SDXL + LoRA generation completed in ${generationTime}s`);

    res.json({
      success: true,
      imageURL: imageUrl,
      thumbnailURL: thumbnailUrl,
      generationTime,
      illustrationId
    });

  } catch (error) {
    console.error('SDXL generation error:', error);

    // Update Firestore with error
    if (req.body.userId && req.body.illustrationId) {
      await firestore
        .collection('users')
        .doc(req.body.userId)
        .collection('illustrations')
        .doc(req.body.illustrationId)
        .update({
          status: 'failed',
          error: error.message,
          failedAt: admin.firestore.FieldValue.serverTimestamp()
        })
        .catch(console.error);
    }

    res.status(500).json({
      error: 'Generation failed',
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`SDXL + LoRA service listening on port ${PORT}`);
  console.log('Scale-to-zero enabled - container will shut down after inactivity');
});