#!/bin/bash

# MediaForge Cloud Storage Setup Script
# This script creates the necessary Cloud Storage buckets for the MediaForge application

PROJECT_ID="mediaforge-957e4"
REGION="us-central1"

echo "Setting up Cloud Storage buckets for MediaForge..."
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"

# Set the project
gcloud config set project $PROJECT_ID

# Create buckets with appropriate settings
echo "Creating user-uploads bucket..."
gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://${PROJECT_ID}-user-uploads

echo "Creating generated-images bucket..."
gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://${PROJECT_ID}-generated-images

echo "Creating vector-outputs bucket..."
gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://${PROJECT_ID}-vector-outputs

echo "Creating style-packs bucket..."
gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://${PROJECT_ID}-style-packs

echo "Creating training-data bucket..."
gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://${PROJECT_ID}-training-data

echo "Creating temp-uploads bucket..."
gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://${PROJECT_ID}-temp-uploads

echo "Creating public-assets bucket..."
gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://${PROJECT_ID}-public-assets

# Set lifecycle policies for temp uploads (auto-delete after 24 hours)
echo "Setting lifecycle policy for temp-uploads bucket..."
cat > temp_lifecycle.json << EOF
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {"age": 1}
      }
    ]
  }
}
EOF

gsutil lifecycle set temp_lifecycle.json gs://${PROJECT_ID}-temp-uploads
rm temp_lifecycle.json

# Set CORS policy for user-facing buckets
echo "Setting CORS policy for user-uploads bucket..."
cat > cors.json << EOF
[
  {
    "origin": ["http://localhost:3000", "https://${PROJECT_ID}.web.app", "https://${PROJECT_ID}.firebaseapp.com"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"],
    "maxAgeSeconds": 3600
  }
]
EOF

gsutil cors set cors.json gs://${PROJECT_ID}-user-uploads
gsutil cors set cors.json gs://${PROJECT_ID}-temp-uploads
rm cors.json

# Set public access for public-assets bucket
echo "Setting public access for public-assets bucket..."
gsutil iam ch allUsers:objectViewer gs://${PROJECT_ID}-public-assets

# Set uniform bucket-level access for all buckets
echo "Enabling uniform bucket-level access..."
gsutil uniformbucketlevelaccess set on gs://${PROJECT_ID}-user-uploads
gsutil uniformbucketlevelaccess set on gs://${PROJECT_ID}-generated-images
gsutil uniformbucketlevelaccess set on gs://${PROJECT_ID}-vector-outputs
gsutil uniformbucketlevelaccess set on gs://${PROJECT_ID}-style-packs
gsutil uniformbucketlevelaccess set on gs://${PROJECT_ID}-training-data
gsutil uniformbucketlevelaccess set on gs://${PROJECT_ID}-temp-uploads
gsutil uniformbucketlevelaccess set on gs://${PROJECT_ID}-public-assets

echo "✅ Cloud Storage setup complete!"
echo ""
echo "Created buckets:"
echo "  - ${PROJECT_ID}-user-uploads (user profile images, style references)"
echo "  - ${PROJECT_ID}-generated-images (AI-generated images)"
echo "  - ${PROJECT_ID}-vector-outputs (SVG, EPS, PDF files)"
echo "  - ${PROJECT_ID}-style-packs (style pack assets)"
echo "  - ${PROJECT_ID}-training-data (custom style training data)"
echo "  - ${PROJECT_ID}-temp-uploads (temporary files, auto-deleted after 24h)"
echo "  - ${PROJECT_ID}-public-assets (public thumbnails, examples)"
echo ""
echo "Next steps:"
echo "  1. Update environment variables with bucket names"
echo "  2. Configure IAM permissions for service accounts"
echo "  3. Test bucket access from the application"