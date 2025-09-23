# Cloud Storage Setup Guide

## Overview
MediaForge uses Google Cloud Storage with multiple buckets for different types of content. This document outlines the bucket structure and setup process.

## Bucket Structure

### 1. User Uploads (`mediaforge-957e4-user-uploads`)
- **Purpose**: User profile images, avatar uploads
- **Access**: Private (user-specific access via Firebase Auth)
- **Location**: us-central1
- **Storage Class**: Standard
- **CORS**: Enabled for web app domains

### 2. Generated Images (`mediaforge-957e4-generated-images`)
- **Purpose**: AI-generated raster images (PNG, JPEG)
- **Access**: Private (user-specific access)
- **Location**: us-central1
- **Storage Class**: Standard

### 3. Vector Outputs (`mediaforge-957e4-vector-outputs`)
- **Purpose**: Converted vector files (SVG, EPS, PDF)
- **Access**: Private (user-specific access)
- **Location**: us-central1
- **Storage Class**: Standard

### 4. Style Packs (`mediaforge-957e4-style-packs`)
- **Purpose**: Style pack assets, thumbnails, examples
- **Access**: Mixed (public style packs, private custom styles)
- **Location**: us-central1
- **Storage Class**: Standard

### 5. Training Data (`mediaforge-957e4-training-data`)
- **Purpose**: User-uploaded images for custom style training
- **Access**: Private (user-specific access)
- **Location**: us-central1
- **Storage Class**: Standard

### 6. Temp Uploads (`mediaforge-957e4-temp-uploads`)
- **Purpose**: Temporary file uploads, processing intermediates
- **Access**: Private (user-specific access)
- **Location**: us-central1
- **Storage Class**: Standard
- **Lifecycle**: Auto-delete after 24 hours

### 7. Public Assets (`mediaforge-957e4-public-assets`)
- **Purpose**: Public thumbnails, examples, marketing assets
- **Access**: Public read access
- **Location**: us-central1
- **Storage Class**: Standard

## Setup Instructions

### Automated Setup
Run the provided setup script:

```bash
chmod +x scripts/setup-storage.sh
./scripts/setup-storage.sh
```

### Manual Setup

1. **Authenticate with Google Cloud**:
   ```bash
   gcloud auth login
   gcloud config set project mediaforge-957e4
   ```

2. **Create buckets**:
   ```bash
   gsutil mb -p mediaforge-957e4 -c STANDARD -l us-central1 gs://mediaforge-957e4-user-uploads
   gsutil mb -p mediaforge-957e4 -c STANDARD -l us-central1 gs://mediaforge-957e4-generated-images
   gsutil mb -p mediaforge-957e4 -c STANDARD -l us-central1 gs://mediaforge-957e4-vector-outputs
   gsutil mb -p mediaforge-957e4 -c STANDARD -l us-central1 gs://mediaforge-957e4-style-packs
   gsutil mb -p mediaforge-957e4 -c STANDARD -l us-central1 gs://mediaforge-957e4-training-data
   gsutil mb -p mediaforge-957e4 -c STANDARD -l us-central1 gs://mediaforge-957e4-temp-uploads
   gsutil mb -p mediaforge-957e4 -c STANDARD -l us-central1 gs://mediaforge-957e4-public-assets
   ```

3. **Set lifecycle policy for temp uploads**:
   ```bash
   echo '{"lifecycle":{"rule":[{"action":{"type":"Delete"},"condition":{"age":1}}]}}' > temp_lifecycle.json
   gsutil lifecycle set temp_lifecycle.json gs://mediaforge-957e4-temp-uploads
   rm temp_lifecycle.json
   ```

4. **Configure CORS for user-facing buckets**:
   ```bash
   echo '[{"origin":["http://localhost:3000","https://mediaforge-957e4.web.app"],"method":["GET","POST","PUT","DELETE"],"responseHeader":["Content-Type"],"maxAgeSeconds":3600}]' > cors.json
   gsutil cors set cors.json gs://mediaforge-957e4-user-uploads
   gsutil cors set cors.json gs://mediaforge-957e4-temp-uploads
   rm cors.json
   ```

5. **Set public access for public assets**:
   ```bash
   gsutil iam ch allUsers:objectViewer gs://mediaforge-957e4-public-assets
   ```

6. **Enable uniform bucket-level access**:
   ```bash
   gsutil uniformbucketlevelaccess set on gs://mediaforge-957e4-user-uploads
   gsutil uniformbucketlevelaccess set on gs://mediaforge-957e4-generated-images
   gsutil uniformbucketlevelaccess set on gs://mediaforge-957e4-vector-outputs
   gsutil uniformbucketlevelaccess set on gs://mediaforge-957e4-style-packs
   gsutil uniformbucketlevelaccess set on gs://mediaforge-957e4-training-data
   gsutil uniformbucketlevelaccess set on gs://mediaforge-957e4-temp-uploads
   gsutil uniformbucketlevelaccess set on gs://mediaforge-957e4-public-assets
   ```

## Security Configuration

### Firebase Storage Rules
The storage rules are configured in `storage.rules` to provide:
- User-specific access to private buckets
- Public read access to public assets
- Server-only write access for generated content

### IAM Permissions
- Firebase service account has full access
- Users access via Firebase Auth tokens
- Public assets bucket allows `allUsers:objectViewer`

## Environment Variables
Update `.env.local` with bucket names:

```env
GCS_USER_UPLOADS_BUCKET=mediaforge-957e4-user-uploads
GCS_GENERATED_IMAGES_BUCKET=mediaforge-957e4-generated-images
GCS_VECTOR_OUTPUTS_BUCKET=mediaforge-957e4-vector-outputs
GCS_STYLE_PACKS_BUCKET=mediaforge-957e4-style-packs
GCS_TRAINING_DATA_BUCKET=mediaforge-957e4-training-data
GCS_TEMP_UPLOADS_BUCKET=mediaforge-957e4-temp-uploads
GCS_PUBLIC_ASSETS_BUCKET=mediaforge-957e4-public-assets
```

## Usage in Application

### Client-Side Uploads
Use the `src/lib/storage.ts` utilities:
- `uploadProfileImage()` - User profile pictures
- `uploadStyleReference()` - Style training images
- `uploadTempFile()` - Temporary uploads

### Server-Side Operations
- Image generation results → `generated-images`
- Vector conversion outputs → `vector-outputs`
- Style pack creation → `style-packs`

### File Organization
```
bucket-name/
├── userId1/
│   ├── subfolder/
│   │   └── timestamp_filename.ext
│   └── timestamp_filename.ext
└── userId2/
    └── ...
```

## Monitoring and Maintenance

### Cost Optimization
- Temp uploads auto-delete after 24 hours
- Consider moving old files to Nearline/Coldline storage
- Monitor egress costs for public assets

### Security Monitoring
- Regular IAM access reviews
- Monitor for unusual access patterns
- Audit bucket policies quarterly

### Backup Strategy
- Critical user data backed up to separate region
- Generated content can be regenerated if needed
- Style packs and training data are most critical

---

*Last updated: 2025-09-22*