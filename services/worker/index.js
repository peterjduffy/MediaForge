const express = require('express');
const admin = require('firebase-admin');
const { PubSub } = require('@google-cloud/pubsub');
const { PredictionServiceClient } = require('@google-cloud/aiplatform');
const { Storage } = require('@google-cloud/storage');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const firestore = admin.firestore();
const storage = new Storage();
const pubsub = new PubSub();

// Vertex AI configuration
const PROJECT_ID = process.env.PROJECT_ID || 'mediaforge-957e4';
const LOCATION = 'us-central1';
const BUCKET_NAME = 'mediaforge-957e4.firebasestorage.app';

// Initialize Vertex AI client
const predictionClient = new PredictionServiceClient({
  apiEndpoint: `${LOCATION}-aiplatform.googleapis.com`
});

// Style-specific prompt modifiers
const styleModifiers = {
  google: 'clean, modern, vibrant colors, Google Material Design style, minimalist',
  notion: 'friendly, soft colors, illustration style, warm and approachable',
  saasthetic: 'modern SaaS aesthetic, gradient colors, sleek line art style',
  clayframe: '3D clay render, soft lighting, playful 3D illustration style',
  flat2d: 'flat 2D design, bold colors, geometric shapes, modern flat illustration'
};

const app = express();
app.use(express.json());

// Structured logging helpers
function logInfo(message, metadata = {}) {
  console.log(JSON.stringify({
    severity: 'INFO',
    message,
    timestamp: new Date().toISOString(),
    service: 'worker',
    ...metadata
  }));
}

function logError(message, error, metadata = {}) {
  console.error(JSON.stringify({
    severity: 'ERROR',
    message,
    error: error?.message || error,
    stack: error?.stack,
    timestamp: new Date().toISOString(),
    service: 'worker',
    ...metadata
  }));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'worker', timestamp: new Date().toISOString() });
});

/**
 * Process image generation job
 */
async function processImageGeneration(message) {
  const startTime = Date.now();
  let illustrationId;
  let userId;

  try {
    const job = message.data ? JSON.parse(Buffer.from(message.data, 'base64').toString()) : message;
    illustrationId = job.illustrationId;
    userId = job.userId;

    logInfo('Received generation job from Pub/Sub', {
      illustrationId,
      userId,
      styleId: job.styleId,
      width: job.width,
      height: job.height
    });

    // IDEMPOTENCY CHECK: Only process if status is 'queued'
    const illustrationDoc = await firestore.collection('illustrations').doc(illustrationId).get();

    if (!illustrationDoc.exists) {
      logError('Illustration document not found', null, { illustrationId, userId });
      throw new Error('Illustration document not found');
    }

    const currentStatus = illustrationDoc.data().status;

    if (currentStatus !== 'queued') {
      logInfo('Job already processed or in progress, skipping', {
        illustrationId,
        userId,
        currentStatus,
        reason: 'idempotency_check'
      });
      return { success: true, skipped: true, reason: 'Already processed' };
    }

    // Update status to 'processing'
    await firestore.collection('illustrations').doc(illustrationId).update({
      status: 'processing',
      processingStartedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    logInfo('Started processing generation', { illustrationId, userId });

    const { prompt, styleId, width = 1024, height = 1024 } = job;

    // Build style-enhanced prompt
    const styleModifier = styleModifiers[styleId] || '';
    const fullPrompt = `${prompt}. ${styleModifier}`;

    logInfo('Calling Vertex AI Imagen 3', {
      illustrationId,
      userId,
      styleId,
      promptLength: fullPrompt.length
    });

    // Call Imagen 3 via Vertex AI
    const endpoint = `projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/imagen-3.0-generate-002`;

    const instanceValue = {
      prompt: fullPrompt,
      sampleCount: 1,
      aspectRatio: '1:1',
      negativePrompt: 'blurry, low quality, distorted, text, watermark, signature',
      personGeneration: 'allow_all'
    };

    const instance = {
      structValue: {
        fields: Object.keys(instanceValue).reduce((acc, key) => {
          const value = instanceValue[key];
          if (typeof value === 'string') {
            acc[key] = { stringValue: value };
          } else if (typeof value === 'number') {
            acc[key] = { numberValue: value };
          }
          return acc;
        }, {})
      }
    };

    const parameter = {
      structValue: {
        fields: {
          sampleCount: { numberValue: 1 }
        }
      }
    };

    const request = {
      endpoint,
      instances: [instance],
      parameters: parameter
    };

    // Generate image with Imagen 3
    const [response] = await predictionClient.predict(request);

    if (!response.predictions || response.predictions.length === 0) {
      throw new Error('No image generated');
    }

    // Extract base64 image from response
    const prediction = response.predictions[0];
    const imageBytes = prediction.structValue.fields.bytesBase64Encoded.stringValue;
    const imageBuffer = Buffer.from(imageBytes, 'base64');

    // Upload to Cloud Storage
    const fileName = `illustrations/${userId}/${illustrationId}.png`;
    const thumbnailFileName = `illustrations/${userId}/${illustrationId}_thumb.png`;

    const file = storage.bucket(BUCKET_NAME).file(fileName);
    await file.save(imageBuffer, {
      contentType: 'image/png',
      metadata: {
        metadata: {
          userId,
          illustrationId,
          styleId,
          prompt,
          generatedAt: new Date().toISOString()
        }
      }
    });

    // Make file publicly readable
    await file.makePublic();

    // Create thumbnail (for now, same image - could use Sharp library later)
    const thumbnailFile = storage.bucket(BUCKET_NAME).file(thumbnailFileName);
    await thumbnailFile.save(imageBuffer, {
      contentType: 'image/png'
    });
    await thumbnailFile.makePublic();

    const imageUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${fileName}`;
    const thumbnailUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${thumbnailFileName}`;

    const generationTime = Math.floor((Date.now() - startTime) / 1000);

    // Update Firestore with completed status
    const generationData = {
      imageURL: imageUrl,
      thumbnailURL: thumbnailUrl,
      status: 'completed',
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
      generationTime,
      modelUsed: 'imagen-3.0-generate-002',
      width,
      height,
      finalPrompt: fullPrompt
    };

    await firestore.collection('illustrations').doc(illustrationId).update(generationData);

    // Deduct credits from user or team (reuse idempotency check doc)
    const illustrationData = illustrationDoc.data();
    const creditsUsed = illustrationData.creditsUsed || 1;

    if (illustrationData.teamId) {
      // Deduct from team credits
      await firestore.collection('teams').doc(illustrationData.teamId).update({
        credits: admin.firestore.FieldValue.increment(-creditsUsed),
        lastUsedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      logInfo('Team credits deducted', {
        illustrationId,
        teamId: illustrationData.teamId,
        creditsUsed
      });
    } else {
      // Deduct from user credits
      await firestore.collection('users').doc(userId).update({
        creditsUsed: admin.firestore.FieldValue.increment(creditsUsed),
        lastGenerationAt: admin.firestore.FieldValue.serverTimestamp()
      });
      logInfo('User credits deducted', {
        illustrationId,
        userId,
        creditsUsed
      });
    }

    logInfo('Generation completed successfully', {
      illustrationId,
      userId,
      generationTime,
      imageUrl
    });

    return { success: true, illustrationId };

  } catch (error) {
    logError('Generation failed', error, {
      illustrationId,
      userId,
      processingTime: Math.floor((Date.now() - startTime) / 1000)
    });

    // Update illustration with error status
    if (illustrationId) {
      await firestore.collection('illustrations').doc(illustrationId).update({
        status: 'failed',
        error: error.message,
        failedAt: admin.firestore.FieldValue.serverTimestamp()
      }).catch(err => logError('Failed to update error status', err, { illustrationId }));
    }

    throw error;
  }
}

/**
 * Process brand training job (mock for now)
 */
async function processBrandTraining(message) {
  const startTime = Date.now();
  let brandId, userId;

  try {
    const job = message.data ? JSON.parse(Buffer.from(message.data, 'base64').toString()) : message;
    brandId = job.brandId;
    userId = job.userId;

    logInfo('Received training job from Pub/Sub', {
      brandId,
      userId,
      brandName: job.brandName,
      imageCount: job.trainingImages?.length
    });

    // IDEMPOTENCY CHECK: Only process if status is 'queued'
    const brandDoc = await firestore
      .collection('users')
      .doc(userId)
      .collection('brands')
      .doc(brandId)
      .get();

    if (!brandDoc.exists) {
      logError('Brand document not found', null, { brandId, userId });
      throw new Error('Brand document not found');
    }

    const currentStatus = brandDoc.data().status;

    if (currentStatus !== 'queued') {
      logInfo('Training already processed or in progress, skipping', {
        brandId,
        userId,
        currentStatus,
        reason: 'idempotency_check'
      });
      return { success: true, skipped: true, reason: 'Already processed' };
    }

    // Update status to 'training'
    await firestore
      .collection('users')
      .doc(userId)
      .collection('brands')
      .doc(brandId)
      .update({
        status: 'training',
        trainingStarted: admin.firestore.FieldValue.serverTimestamp()
      });

    logInfo('Started brand training (mock)', { brandId, userId });

    // Mock training - in production, this would call Vertex AI Training
    // For now, simulate 30 seconds of processing
    await new Promise(resolve => setTimeout(resolve, 30000));

    const trainingTime = Math.floor((Date.now() - startTime) / 1000);

    // Update to ready
    await firestore
      .collection('users')
      .doc(userId)
      .collection('brands')
      .doc(brandId)
      .update({
        status: 'ready',
        loraModelPath: `gs://mediaforge-lora-models/mock/${brandId}/model.safetensors`,
        trainingCompleted: admin.firestore.FieldValue.serverTimestamp(),
        trainingDuration: trainingTime
      });

    logInfo('Brand training completed successfully', {
      brandId,
      userId,
      trainingTime
    });

    return { success: true, brandId };

  } catch (error) {
    logError('Brand training failed', error, {
      brandId,
      userId,
      processingTime: Math.floor((Date.now() - startTime) / 1000)
    });

    // Update brand with error status
    if (brandId && userId) {
      await firestore
        .collection('users')
        .doc(userId)
        .collection('brands')
        .doc(brandId)
        .update({
          status: 'failed',
          error: error.message,
          failedAt: admin.firestore.FieldValue.serverTimestamp()
        }).catch(err => logError('Failed to update brand error status', err, { brandId }));
    }

    throw error;
  }
}

/**
 * HTTP endpoint for Pub/Sub push - image generation
 */
app.post('/process-generation', async (req, res) => {
  try {
    const pubsubMessage = req.body.message;
    const job = JSON.parse(Buffer.from(pubsubMessage.data, 'base64').toString());

    console.log('Received generation job:', job.illustrationId);

    // Process the job (don't await - respond quickly to Pub/Sub)
    processImageGeneration(job).catch(error => {
      console.error('Failed to process generation:', error);
    });

    // Acknowledge immediately (200 OK)
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing push message:', error);
    res.status(500).send('Error processing message');
  }
});

/**
 * HTTP endpoint for Pub/Sub push - brand training
 */
app.post('/process-training', async (req, res) => {
  try {
    const pubsubMessage = req.body.message;
    const job = JSON.parse(Buffer.from(pubsubMessage.data, 'base64').toString());

    console.log('Received training job:', job.brandId);

    // Process the job (don't await - respond quickly to Pub/Sub)
    processBrandTraining(job).catch(error => {
      console.error('Failed to process training:', error);
    });

    // Acknowledge immediately (200 OK)
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing push message:', error);
    res.status(500).send('Error processing message');
  }
});

// Start Express server for health checks
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Worker service listening on port ${PORT}`);
});
