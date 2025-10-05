const functions = require('@google-cloud/functions-framework');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const firestore = admin.firestore();

/**
 * Mock Cloud Function to simulate image generation
 * This will be replaced with real Vertex AI integration later
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

    // Simulate generation delay (2-5 seconds)
    const delay = Math.floor(Math.random() * 3000) + 2000;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Generate mock image URL using Lorem Picsum with style-based seeds
    const styleSeed = {
      google: 'clean',
      notion: 'friendly',
      saasthetic: 'line',
      clayframe: '3d',
      flat2d: 'flat'
    };

    const seed = `${styleSeed[styleId] || 'default'}${Date.now()}`;
    const imageUrl = `https://picsum.photos/seed/${seed}/1024/1024`;
    const thumbnailUrl = `https://picsum.photos/seed/${seed}/256/256`;

    // Update Firestore
    const generationData = {
      imageURL: imageUrl,
      thumbnailURL: thumbnailUrl,
      status: 'completed',
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
      generationTime: Math.floor(delay / 1000),
      modelUsed: 'mock-picsum',
      width: 1024,
      height: 1024,
      finalPrompt: `${styleId} style: ${prompt}`
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