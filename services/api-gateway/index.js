const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const { PubSub } = require('@google-cloud/pubsub');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const firestore = admin.firestore();
const pubsub = new PubSub();

const app = express();

// Middleware - CORS configuration for production
app.use(cors({
  origin: [
    'https://mediaforge.dev',
    'https://www.mediaforge.dev',
    'https://mediaforge-957e4.web.app',
    'https://mediaforge-957e4.firebaseapp.com',
    'http://localhost:3000' // For local development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Structured logging helper
function logInfo(message, metadata = {}) {
  console.log(JSON.stringify({
    severity: 'INFO',
    message,
    timestamp: new Date().toISOString(),
    service: 'api-gateway',
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
    service: 'api-gateway',
    ...metadata
  }));
}

// Firebase Auth middleware
async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logError('Missing or invalid authorization header', null, {
        path: req.path,
        hasAuth: !!authHeader
      });
      return res.status(401).json({ error: 'Unauthorized: Missing authentication token' });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      req.userId = decodedToken.uid;

      logInfo('User authenticated', {
        userId: decodedToken.uid,
        email: decodedToken.email,
        path: req.path
      });

      next();
    } catch (error) {
      logError('Token verification failed', error, {
        path: req.path,
        tokenLength: token?.length
      });
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  } catch (error) {
    logError('Authentication error', error, { path: req.path });
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

// Explicit OPTIONS handler for CORS preflight
app.options('*', cors());

// Health check endpoint (public, no auth)
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'api-gateway', timestamp: new Date().toISOString() });
});

/**
 * POST /generate
 * Create an image generation job and publish to Pub/Sub
 * REQUIRES AUTHENTICATION
 */
app.post('/generate', authenticateUser, async (req, res) => {
  const requestId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const { userId, prompt, styleId, styleName, width = 1024, height = 1024 } = req.body;

    // Security: Verify userId matches authenticated user
    if (userId !== req.userId) {
      logError('User ID mismatch', null, {
        requestId,
        requestedUserId: userId,
        authenticatedUserId: req.userId
      });
      return res.status(403).json({ error: 'Forbidden: User ID mismatch' });
    }

    logInfo('Generation request received', {
      requestId,
      userId,
      styleId,
      width,
      height,
      promptLength: prompt?.length
    });

    // Validate required fields
    if (!userId || !prompt || !styleId) {
      logError('Missing required fields', null, { requestId, userId, hasPrompt: !!prompt, styleId });
      return res.status(400).json({ error: 'Missing required fields: userId, prompt, styleId' });
    }

    // Check user/team credits (basic check)
    const userDoc = await firestore.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      logError('User not found', null, { requestId, userId });
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const teamId = userData.teamId;

    // Calculate credits needed
    const creditsNeeded = (width === 2048 || height === 2048) ? 2 : 1;

    // Check team or user credits
    if (teamId) {
      const teamDoc = await firestore.collection('teams').doc(teamId).get();
      if (!teamDoc.exists || teamDoc.data().credits < creditsNeeded) {
        logError('Insufficient team credits', null, {
          requestId,
          userId,
          teamId,
          creditsNeeded,
          creditsAvailable: teamDoc.exists ? teamDoc.data().credits : 0
        });
        return res.status(403).json({ error: 'Insufficient team credits' });
      }
    } else {
      const tier = userData.subscriptionTier || 'free';
      const creditsUsed = userData.creditsUsed || 0;
      const maxCredits = getCreditsForPlan(tier);
      if (creditsUsed + creditsNeeded > maxCredits) {
        logError('Insufficient user credits', null, {
          requestId,
          userId,
          tier,
          creditsUsed,
          maxCredits,
          creditsNeeded
        });
        return res.status(403).json({ error: 'Insufficient credits' });
      }
    }

    // Create illustration document in Firestore with 'queued' status
    const illustrationData = {
      userId,
      teamId: teamId || null,
      prompt,
      styleId,
      styleName: styleName || styleId,
      status: 'queued',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      width,
      height,
      creditsUsed: creditsNeeded
    };

    const docRef = await firestore.collection('illustrations').add(illustrationData);
    const illustrationId = docRef.id;

    // Publish job to Pub/Sub
    const topic = pubsub.topic('image-generation-jobs');
    const jobMessage = {
      illustrationId,
      userId,
      prompt,
      styleId,
      styleName: styleName || styleId,
      width,
      height,
      createdAt: new Date().toISOString()
    };

    const messageId = await topic.publishMessage({
      json: jobMessage
    });

    logInfo('Job published successfully', {
      requestId,
      illustrationId,
      userId,
      messageId,
      teamId: teamId || null
    });

    // Return immediately with job ID and status
    res.status(202).json({
      success: true,
      illustrationId,
      status: 'queued',
      message: 'Generation job queued successfully'
    });

  } catch (error) {
    logError('Failed to queue generation job', error, {
      requestId: req.body.requestId,
      userId: req.body.userId
    });
    res.status(500).json({
      error: 'Failed to queue generation job',
      details: error.message
    });
  }
});

/**
 * POST /train-brand
 * Create a brand training job and publish to Pub/Sub
 * REQUIRES AUTHENTICATION
 */
app.post('/train-brand', authenticateUser, async (req, res) => {
  const requestId = `train_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const { userId, brandName, brandColors, trainingImages } = req.body;

    // Security: Verify userId matches authenticated user
    if (userId !== req.userId) {
      logError('User ID mismatch in training request', null, {
        requestId,
        requestedUserId: userId,
        authenticatedUserId: req.userId
      });
      return res.status(403).json({ error: 'Forbidden: User ID mismatch' });
    }

    logInfo('Brand training request received', {
      requestId,
      userId,
      brandName,
      imageCount: trainingImages?.length,
      colorCount: brandColors?.length
    });

    // Validate required fields
    if (!userId || !brandName) {
      logError('Missing required fields in training request', null, {
        requestId,
        userId,
        hasBrandName: !!brandName
      });
      return res.status(400).json({ error: 'Missing required fields: userId, brandName' });
    }

    // Verify user is Business tier
    const userDoc = await firestore.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      logError('User not found for training', null, { requestId, userId });
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const isBusinessTier = userData.tier === 'business' || userData.subscription?.plan === 'business';

    if (!isBusinessTier) {
      logError('Non-business user attempted training', null, {
        requestId,
        userId,
        tier: userData.tier
      });
      return res.status(403).json({ error: 'Brand training is only available for Business tier users' });
    }

    // Generate brand ID
    const brandId = `brand_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create brand document in Firestore with 'queued' status
    const brandData = {
      id: brandId,
      name: brandName,
      colors: brandColors || [],
      status: 'queued',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      imageCount: trainingImages?.length || 0,
      userId
    };

    await firestore
      .collection('users')
      .doc(userId)
      .collection('brands')
      .doc(brandId)
      .set(brandData);

    // Publish job to Pub/Sub
    const topic = pubsub.topic('brand-training-jobs');
    const jobMessage = {
      brandId,
      userId,
      brandName,
      brandColors: brandColors || [],
      trainingImages: trainingImages || [],
      createdAt: new Date().toISOString()
    };

    const messageId = await topic.publishMessage({
      json: jobMessage
    });

    logInfo('Training job published successfully', {
      requestId,
      brandId,
      userId,
      messageId,
      imageCount: trainingImages?.length
    });

    // Return immediately with job ID and status
    res.status(202).json({
      success: true,
      brandId,
      status: 'queued',
      message: 'Brand training job queued successfully',
      estimatedTime: 900 // 15 minutes in seconds
    });

  } catch (error) {
    logError('Failed to queue training job', error, {
      requestId,
      userId: req.body.userId
    });
    res.status(500).json({
      error: 'Failed to queue training job',
      details: error.message
    });
  }
});

function getCreditsForPlan(plan) {
  switch(plan) {
    case 'free': return 10;
    case 'business': return 200;
    default: return 10;
  }
}

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
});
