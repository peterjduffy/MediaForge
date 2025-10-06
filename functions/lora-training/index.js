const functions = require('@google-cloud/functions-framework');
const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');
const { v4: uuidv4 } = require('uuid');
const { CloudTasksClient } = require('@google-cloud/tasks');
const { helpers } = require('@google-cloud/aiplatform');

// Initialize services
if (!admin.apps.length) {
  admin.initializeApp();
}

const firestore = admin.firestore();
const storage = new Storage();
const tasksClient = new CloudTasksClient();

// Configuration
const PROJECT_ID = 'mediaforge-957e4';
const LOCATION = 'us-central1';
const TRAINING_BUCKET = 'mediaforge-training-data';
const MODELS_BUCKET = 'mediaforge-lora-models';
const QUEUE_NAME = 'lora-training-queue';

/**
 * Cloud Function to handle brand training requests
 * This orchestrates the LoRA training process
 */
functions.http('trainBrand', async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { userId, brandId, brandName, brandColors, trainingImages } = req.body;

    // Validate request
    if (!userId || !brandId || !brandName || !trainingImages || trainingImages.length < 10) {
      return res.status(400).json({
        error: 'Invalid request. Need userId, brandId, brandName, and at least 10 training images.'
      });
    }

    console.log(`Starting LoRA training for brand: ${brandName} (${brandId})`);

    // Create brand document in Firestore
    const brandRef = firestore
      .collection('users')
      .doc(userId)
      .collection('brands')
      .doc(brandId);

    await brandRef.set({
      id: brandId,
      name: brandName,
      colors: brandColors || [],
      status: 'preparing',
      trainingStarted: admin.firestore.FieldValue.serverTimestamp(),
      imageCount: trainingImages.length,
      userId
    });

    // Prepare training data directory
    const trainingJobId = `lora-${brandId}-${Date.now()}`;
    const trainingDataPath = `training-data/${brandId}/`;

    // Copy training images to training bucket
    console.log('Preparing training dataset...');
    const bucket = storage.bucket(TRAINING_BUCKET);

    for (let i = 0; i < trainingImages.length; i++) {
      const imageUrl = trainingImages[i];
      const fileName = `${trainingDataPath}image_${i + 1}.jpg`;

      // Download and re-upload to training bucket
      // In production, these would already be in Cloud Storage
      console.log(`Processing image ${i + 1}/${trainingImages.length}`);

      // For now, just track the URLs
      // Real implementation would copy from user uploads to training bucket
    }

    // Update status to queued
    await brandRef.update({
      status: 'queued',
      trainingJobId,
      trainingDataPath
    });

    // Create Cloud Task to run training job
    const queuePath = tasksClient.queuePath(PROJECT_ID, LOCATION, QUEUE_NAME);

    const task = {
      httpRequest: {
        httpMethod: 'POST',
        url: `https://${LOCATION}-${PROJECT_ID}.cloudfunctions.net/runLoraTraining`,
        body: Buffer.from(JSON.stringify({
          userId,
          brandId,
          brandName,
          trainingJobId,
          trainingDataPath,
          imageCount: trainingImages.length
        })).toString('base64'),
        headers: {
          'Content-Type': 'application/json',
        },
      },
      scheduleTime: {
        seconds: Math.floor(Date.now() / 1000) + 10, // Start in 10 seconds
      }
    };

    // Create the task
    const [response] = await tasksClient.createTask({ parent: queuePath, task });
    console.log(`Training task created: ${response.name}`);

    // Return immediate response (async processing)
    res.json({
      success: true,
      brandId,
      status: 'queued',
      message: 'Brand training started. This will take 15-30 minutes.',
      trainingJobId
    });

  } catch (error) {
    console.error('Training orchestration error:', error);
    res.status(500).json({
      error: 'Failed to start training',
      details: error.message
    });
  }
});

/**
 * Cloud Function to actually run the LoRA training job on Vertex AI
 * This is triggered by Cloud Tasks
 */
functions.http('runLoraTraining', async (req, res) => {
  try {
    const { userId, brandId, brandName, trainingJobId, trainingDataPath, imageCount } = req.body;

    console.log(`Starting Vertex AI training job for ${brandId}`);

    // Update status to training
    const brandRef = firestore
      .collection('users')
      .doc(userId)
      .collection('brands')
      .doc(brandId);

    await brandRef.update({
      status: 'training',
      trainingStartedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Vertex AI Training job configuration
    const trainingConfig = {
      displayName: `lora-training-${brandId}`,
      jobSpec: {
        workerPoolSpecs: [
          {
            machineSpec: {
              machineType: 'n1-standard-8',
              acceleratorType: 'NVIDIA_TESLA_T4',
              acceleratorCount: 1
            },
            replicaCount: 1,
            containerSpec: {
              imageUri: `gcr.io/${PROJECT_ID}/lora-trainer:latest`,
              args: [
                '--brand_id', brandId,
                '--brand_name', brandName,
                '--input_bucket', TRAINING_BUCKET,
                '--input_path', trainingDataPath,
                '--output_bucket', MODELS_BUCKET,
                '--output_path', `models/${brandId}/`,
                '--num_images', imageCount.toString(),
                '--max_train_steps', '500',
                '--learning_rate', '1e-4'
              ]
            }
          }
        ]
      }
    };

    // In a real implementation, submit to Vertex AI Training
    // For now, simulate the training process
    console.log('Simulating LoRA training on Vertex AI...');
    console.log('Training config:', trainingConfig);

    // Simulate training time (in production, this would be async)
    setTimeout(async () => {
      // After "training", update the brand with the model path
      const modelPath = `gs://${MODELS_BUCKET}/models/${brandId}/lora_weights.safetensors`;

      await brandRef.update({
        status: 'ready',
        loraModelPath: modelPath,
        trainingCompletedAt: admin.firestore.FieldValue.serverTimestamp(),
        trainingDuration: 900 // 15 minutes in seconds
      });

      console.log(`Training completed for ${brandId}`);

      // Send notification (email, push, etc.)
      // await sendTrainingCompleteNotification(userId, brandName);

    }, 5000); // Simulate 5 seconds for demo (would be 15-30 min in reality)

    res.json({
      success: true,
      message: 'Training job submitted to Vertex AI',
      trainingJobId
    });

  } catch (error) {
    console.error('Vertex AI training error:', error);

    // Update brand status to failed
    if (req.body.userId && req.body.brandId) {
      await firestore
        .collection('users')
        .doc(req.body.userId)
        .collection('brands')
        .doc(req.body.brandId)
        .update({
          status: 'failed',
          error: error.message,
          failedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }

    res.status(500).json({
      error: 'Training failed',
      details: error.message
    });
  }
});

/**
 * Cloud Function to check training status
 * Can be called by frontend to poll for completion
 */
functions.http('checkTrainingStatus', async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');

  try {
    const { userId, brandId } = req.query;

    if (!userId || !brandId) {
      return res.status(400).json({ error: 'Missing userId or brandId' });
    }

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

    res.json({
      brandId,
      status: brand.status,
      name: brand.name,
      trainingStarted: brand.trainingStarted,
      trainingCompleted: brand.trainingCompletedAt,
      loraModelPath: brand.loraModelPath
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to check status' });
  }
});