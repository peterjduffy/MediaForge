# Async Architecture Deployment Runbook

## Overview

MediaForge has migrated from a synchronous HTTP-based architecture to an asynchronous queue-based architecture to support long-running operations like brand training (15-30 minutes) and handle HTTP timeout limitations.

**Deployment Date**: 2025-10-09
**Phase**: 5C - Async Architecture Migration

## Architecture Components

### 1. API Gateway (Cloud Run)
- **Service**: `api-gateway`
- **URL**: https://api-gateway-261323568725.us-central1.run.app
- **Image**: `us-central1-docker.pkg.dev/mediaforge-957e4/mediaforge-services/api-gateway`
- **Purpose**: Lightweight service that accepts job requests and immediately returns job IDs
- **Response Time**: < 500ms
- **Endpoints**:
  - `GET /health` - Health check
  - `POST /generate` - Queue image generation job
  - `POST /train-brand` - Queue brand training job

### 2. Worker Service (Cloud Run)
- **Service**: `worker`
- **URL**: https://worker-261323568725.us-central1.run.app (private)
- **Image**: `us-central1-docker.pkg.dev/mediaforge-957e4/mediaforge-services/worker`
- **Purpose**: Processes long-running AI jobs from Pub/Sub queue
- **Timeout**: 3600 seconds (1 hour)
- **Memory**: 1GB
- **CPU**: 2 cores
- **Endpoints**:
  - `GET /health` - Health check
  - `POST /process-generation` - Pub/Sub push endpoint for generation
  - `POST /process-training` - Pub/Sub push endpoint for training

### 3. Pub/Sub Topics & Subscriptions

**Topics:**
- `image-generation-jobs` - Queue for image generation jobs
- `brand-training-jobs` - Queue for brand training jobs
- `job-dlq` - Dead letter queue for failed jobs

**Subscriptions:**
- `image-generation-workers` - Push subscription → Worker service `/process-generation`
- `brand-training-workers` - Push subscription → Worker service `/process-training`
- `job-dlq-sub` - Subscription to monitor failed jobs

**Configuration:**
- Ack deadline: 600 seconds (10 minutes)
- Message retention: 1 hour
- Max delivery attempts: 5
- Dead letter topic: `job-dlq`

## Deployment Steps

### Prerequisites
```bash
# Ensure you're authenticated
gcloud config set project mediaforge-957e4

# Verify Artifact Registry repository exists
gcloud artifacts repositories list --location=us-central1
```

### 1. Deploy API Gateway

```bash
cd /home/user/mediaforge/services/api-gateway

# Build the container
gcloud builds submit \
  --tag us-central1-docker.pkg.dev/mediaforge-957e4/mediaforge-services/api-gateway \
  --project=mediaforge-957e4

# Deploy to Cloud Run
gcloud run deploy api-gateway \
  --image us-central1-docker.pkg.dev/mediaforge-957e4/mediaforge-services/api-gateway \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 10 \
  --memory 512Mi \
  --timeout 60 \
  --project mediaforge-957e4
```

### 2. Deploy Worker Service

```bash
cd /home/user/mediaforge/services/worker

# Build the container
gcloud builds submit \
  --tag us-central1-docker.pkg.dev/mediaforge-957e4/mediaforge-services/worker \
  --project=mediaforge-957e4

# Deploy to Cloud Run (private)
gcloud run deploy worker \
  --image us-central1-docker.pkg.dev/mediaforge-957e4/mediaforge-services/worker \
  --platform managed \
  --region us-central1 \
  --no-allow-unauthenticated \
  --min-instances 0 \
  --max-instances 10 \
  --memory 1Gi \
  --timeout 3600 \
  --cpu 2 \
  --project mediaforge-957e4

# Grant Pub/Sub permission to invoke worker
gcloud run services add-iam-policy-binding worker \
  --region=us-central1 \
  --member=serviceAccount:service-261323568725@gcp-sa-pubsub.iam.gserviceaccount.com \
  --role=roles/run.invoker \
  --project=mediaforge-957e4
```

### 3. Create Pub/Sub Infrastructure

```bash
# Create topics
gcloud pubsub topics create image-generation-jobs --project=mediaforge-957e4
gcloud pubsub topics create brand-training-jobs --project=mediaforge-957e4
gcloud pubsub topics create job-dlq --project=mediaforge-957e4

# Create push subscriptions
gcloud pubsub subscriptions create image-generation-workers \
  --topic=image-generation-jobs \
  --push-endpoint=https://worker-261323568725.us-central1.run.app/process-generation \
  --ack-deadline=600 \
  --message-retention-duration=1h \
  --dead-letter-topic=job-dlq \
  --max-delivery-attempts=5 \
  --project=mediaforge-957e4

gcloud pubsub subscriptions create brand-training-workers \
  --topic=brand-training-jobs \
  --push-endpoint=https://worker-261323568725.us-central1.run.app/process-training \
  --ack-deadline=600 \
  --message-retention-duration=1h \
  --dead-letter-topic=job-dlq \
  --max-delivery-attempts=5 \
  --project=mediaforge-957e4

gcloud pubsub subscriptions create job-dlq-sub \
  --topic=job-dlq \
  --project=mediaforge-957e4
```

### 4. Deploy Frontend

```bash
cd /home/user/mediaforge

# Build Next.js app
npm run build

# Deploy to Firebase Hosting
firebase experiments:enable webframeworks
firebase deploy --project mediaforge-957e4 --only hosting --non-interactive
```

## Request Flow

### Image Generation

1. **Frontend** → API Gateway `POST /generate`
   - Payload: `{ userId, prompt, styleId, styleName, width, height }`
   - Response: `{ success: true, illustrationId, status: "queued" }`

2. **API Gateway**:
   - Creates Firestore document with status `queued`
   - Publishes message to `image-generation-jobs` topic
   - Returns immediately (< 500ms)

3. **Pub/Sub** → Worker service `POST /process-generation`
   - Delivers message via push subscription
   - Worker responds 200 OK immediately
   - Processing happens asynchronously

4. **Worker Service**:
   - Updates Firestore status to `processing`
   - Calls Vertex AI Imagen 3
   - Uploads image to Cloud Storage
   - Updates Firestore status to `completed` with image URLs
   - Deducts credits from user/team

5. **Frontend**:
   - Firestore listener detects status changes
   - UI updates in real-time (queued → processing → completed)
   - Displays generated image

### Brand Training

Same flow as image generation but:
- Topic: `brand-training-jobs`
- Endpoint: `/process-training`
- Duration: 30 seconds (mock) or 15-30 minutes (production LoRA training)
- Status flow: `queued → training → ready/failed`

## Monitoring

### Check Service Health

```bash
# API Gateway
curl https://api-gateway-261323568725.us-central1.run.app/health

# Worker (requires auth)
gcloud run services proxy worker --region=us-central1 --project=mediaforge-957e4 &
curl http://localhost:8080/health
```

### Monitor Pub/Sub Queues

```bash
# Check subscription status
gcloud pubsub subscriptions list --project=mediaforge-957e4

# View subscription details
gcloud pubsub subscriptions describe image-generation-workers --project=mediaforge-957e4

# Check dead letter queue
gcloud pubsub subscriptions pull job-dlq-sub --limit=10 --project=mediaforge-957e4
```

### View Logs

```bash
# API Gateway logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=api-gateway" \
  --limit 50 \
  --format="table(timestamp,jsonPayload.message)" \
  --project=mediaforge-957e4

# Worker logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=worker" \
  --limit 50 \
  --format="table(timestamp,jsonPayload.message)" \
  --project=mediaforge-957e4
```

### Monitor Firestore

```javascript
// Check job status in Firestore
const doc = await getDoc(doc(db, 'illustrations', illustrationId));
console.log(doc.data().status); // queued | processing | completed | failed
```

## Troubleshooting

### Jobs Stuck in "Queued" Status

**Symptom**: Illustrations stay in `queued` status forever

**Diagnosis**:
1. Check Pub/Sub subscription is delivering messages:
   ```bash
   gcloud pubsub subscriptions describe image-generation-workers --project=mediaforge-957e4
   ```

2. Check worker service is receiving messages (logs):
   ```bash
   gcloud logging read "resource.labels.service_name=worker AND jsonPayload.message=~'Received generation job'" \
     --limit 10 --project=mediaforge-957e4
   ```

**Resolution**:
- Verify Pub/Sub subscription exists and has correct push endpoint
- Check worker service IAM permissions allow Pub/Sub to invoke it
- Redeploy worker service if code issue

### Jobs Failing Immediately

**Symptom**: Status goes from `queued` to `failed` quickly

**Diagnosis**:
1. Check Firestore for error message:
   ```javascript
   const doc = await getDoc(doc(db, 'illustrations', illustrationId));
   console.log(doc.data().error);
   ```

2. Check worker logs for errors:
   ```bash
   gcloud logging read "resource.labels.service_name=worker AND severity>=ERROR" \
     --limit 20 --project=mediaforge-957e4
   ```

**Common Causes**:
- Insufficient credits (check user/team credits)
- Vertex AI quota exceeded
- Invalid prompt or parameters
- Network timeout to Vertex AI

### Dead Letter Queue Filling Up

**Symptom**: Messages accumulating in `job-dlq`

**Diagnosis**:
```bash
gcloud pubsub subscriptions pull job-dlq-sub --limit=10 --project=mediaforge-957e4
```

**Resolution**:
1. Identify pattern in failed messages
2. Fix root cause (code bug, API issue, etc.)
3. Manually reprocess failed jobs if needed
4. Purge DLQ once resolved:
   ```bash
   gcloud pubsub subscriptions seek job-dlq-sub --time=$(date -u +%Y-%m-%dT%H:%M:%S) --project=mediaforge-957e4
   ```

### High Latency

**Symptom**: Jobs taking too long to process

**Diagnosis**:
1. Check worker instance count:
   ```bash
   gcloud run services describe worker --region=us-central1 --project=mediaforge-957e4
   ```

2. Check queue depth:
   ```bash
   gcloud pubsub subscriptions describe image-generation-workers --project=mediaforge-957e4
   ```

**Resolution**:
- Increase `--max-instances` if queue is backed up
- Increase `--min-instances` to 1-2 if cold starts are issue
- Increase worker CPU/memory if processing is slow

## Rollback Procedure

If async architecture causes issues, rollback to synchronous:

1. **Revert frontend**:
   ```bash
   git revert HEAD  # Revert frontend changes
   npm run build
   firebase deploy --only hosting
   ```

2. **Point directly to old Cloud Function**:
   - Update `IMAGEN3_ENDPOINT` in `src/lib/ai-generation.ts`
   - Redeploy

3. **Keep Pub/Sub for future use** - no need to delete

## Cost Monitoring

**Expected Costs**:
- API Gateway: ~$0.40/million requests (scale-to-zero)
- Worker: ~$0.24/hour active time (scale-to-zero)
- Pub/Sub: $0.40/million operations (first 10GB free)

**Total Monthly Estimate** (100 generations/day):
- Pub/Sub: ~$0.12
- Cloud Run: ~$2-5 (mostly cold starts)
- **Vertex AI remains dominant cost**: $90/month (3000 images × $0.03)

## Success Metrics

- API Gateway response time: < 500ms
- Job queue time: < 5 seconds
- Image generation time: 15-20 seconds
- Brand training time: 30 seconds (mock) / 15-30 minutes (production)
- Error rate: < 1%
- Dead letter queue: Empty

## Next Steps

1. ✅ Deploy async architecture (Phase 5C)
2. ⏳ Monitor for 24 hours
3. ⏳ Test end-to-end with real user
4. ⏳ Begin UAT with 5-10 beta users
5. ⏳ Deploy production LoRA training when revenue validates

---

**Last Updated**: 2025-10-09
**Maintained By**: MediaForge Engineering Team
