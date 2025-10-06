const functions = require('@google-cloud/functions-framework');
const admin = require('firebase-admin');
const {PredictionServiceClient} = require('@google-cloud/aiplatform');
const {Storage} = require('@google-cloud/storage');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const firestore = admin.firestore();
const storage = new Storage();

// Vertex AI configuration
const PROJECT_ID = 'mediaforge-957e4';
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

/**
 * Cloud Function for AI image generation using Vertex AI Imagen 3
 */
functions.http('generateImage', async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    // Validate request
    const { userId, prompt, styleId, illustrationId } = req.body;

    console.log('Generate request:', { userId, prompt, styleId, illustrationId });

    if (!userId || !prompt || !styleId || !illustrationId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Verify user has credits
    const userDoc = await firestore.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const userData = userDoc.data();
    const creditsUsed = userData.creditsUsed || 0;
    const plan = userData.subscriptionTier || 'free';
    const maxCredits = getCreditsForPlan(plan);

    if (creditsUsed >= maxCredits) {
      res.status(403).json({ error: 'No credits remaining' });
      return;
    }

    // Build style-enhanced prompt
    const styleModifier = styleModifiers[styleId] || '';
    const fullPrompt = `${prompt}. ${styleModifier}`;

    console.log('Generating with Imagen 3:', { fullPrompt, styleId });

    const startTime = Date.now();

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
    const timestamp = Date.now();
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

    // Update Firestore
    const generationData = {
      imageURL: imageUrl,
      thumbnailURL: thumbnailUrl,
      status: 'completed',
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
      generationTime,
      modelUsed: 'imagen-3.0-generate-002',
      width: 1024,
      height: 1024,
      finalPrompt: fullPrompt
    };

    await firestore.collection('illustrations').doc(illustrationId).update(generationData);

    // Increment user's credit usage
    await firestore.collection('users').doc(userId).update({
      creditsUsed: admin.firestore.FieldValue.increment(1),
      lastGenerationAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('Generation completed:', illustrationId);

    // Return success response
    res.status(200).json({
      success: true,
      imageURL: imageUrl,
      thumbnailURL: thumbnailUrl,
      generationTime: generationData.generationTime
    });

  } catch (error) {
    console.error('Generation error:', error);

    // Update illustration with error status
    if (req.body.illustrationId) {
      await firestore.collection('illustrations').doc(req.body.illustrationId).update({
        status: 'failed',
        error: error.message,
        failedAt: admin.firestore.FieldValue.serverTimestamp()
      }).catch(console.error);
    }

    res.status(500).json({
      error: 'Failed to generate image',
      details: error.message
    });
  }
});

function getCreditsForPlan(plan) {
  switch(plan) {
    case 'starter': return 100;
    case 'pro': return 300;
    case 'business': return 700;
    default: return 5;
  }
}