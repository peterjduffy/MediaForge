const functions = require('@google-cloud/functions-framework');
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const firestore = admin.firestore();

/**
 * Mock brand training endpoint for testing
 * In production, this would submit to Vertex AI Training
 */
functions.http('mockTrainBrand', async (req, res) => {
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

  // Verify Firebase Auth token (optional for development)
  // In production, you'd want to verify the token
  // const token = req.headers.authorization?.split('Bearer ')[1];
  // if (token) {
  //   try {
  //     await admin.auth().verifyIdToken(token);
  //   } catch (error) {
  //     return res.status(401).json({ error: 'Unauthorized' });
  //   }
  // }

  try {
    const { userId, brandName, brandColors, trainingImages } = req.body;

    // Validate request
    if (!userId || !brandName) {
      return res.status(400).json({
        error: 'Missing required fields: userId, brandName'
      });
    }

    console.log(`Mock training started for brand: ${brandName}`);
    console.log(`User: ${userId}`);
    console.log(`Colors: ${brandColors?.length || 0}`);
    console.log(`Images: ${trainingImages?.length || 0}`);

    // Generate brand ID
    const brandId = `brand_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create brand document in Firestore
    await firestore
      .collection('users')
      .doc(userId)
      .collection('brands')
      .doc(brandId)
      .set({
        id: brandId,
        name: brandName,
        colors: brandColors || [],
        status: 'training',
        trainingStarted: admin.firestore.FieldValue.serverTimestamp(),
        imageCount: trainingImages?.length || 0,
        userId
      });

    // Simulate training completion after 30 seconds
    setTimeout(async () => {
      try {
        await firestore
          .collection('users')
          .doc(userId)
          .collection('brands')
          .doc(brandId)
          .update({
            status: 'ready',
            loraModelPath: `gs://mediaforge-lora-models/mock/${brandId}/model.safetensors`,
            trainingCompleted: admin.firestore.FieldValue.serverTimestamp()
          });
        console.log(`Mock training completed for brand: ${brandId}`);
      } catch (error) {
        console.error('Error updating brand status:', error);
      }
    }, 30000);

    // Return success (in production, this would start actual training)
    res.json({
      success: true,
      brandId,
      status: 'training',
      message: 'Mock brand training started. In production, this would take 15-30 minutes.',
      estimatedTime: 900 // 15 minutes in seconds
    });

  } catch (error) {
    console.error('Mock training error:', error);
    res.status(500).json({
      error: 'Failed to start training',
      details: error.message
    });
  }
});