import { Storage } from '@google-cloud/storage';

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

const buckets = {
  uploads: storage.bucket(process.env.GCS_UPLOADS_BUCKET || 'mediaforge-uploads'),
  renders: storage.bucket(process.env.GCS_RENDERS_BUCKET || 'mediaforge-renders'),
  exports: storage.bucket(process.env.GCS_EXPORTS_BUCKET || 'mediaforge-exports'),
};

export const storageService = {
  async uploadFile(
    bucketName: 'uploads' | 'renders' | 'exports',
    fileName: string,
    buffer: Buffer,
    contentType?: string
  ): Promise<string> {
    const bucket = buckets[bucketName];
    const file = bucket.file(fileName);

    await file.save(buffer, {
      metadata: {
        contentType: contentType || 'application/octet-stream',
      },
    });

    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    return url;
  },

  async getSignedUrl(
    bucketName: 'uploads' | 'renders' | 'exports',
    fileName: string,
    expiresInMs = 3600000
  ): Promise<string> {
    const bucket = buckets[bucketName];
    const file = bucket.file(fileName);

    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresInMs,
    });

    return url;
  },

  async getUploadUrl(
    bucketName: 'uploads' | 'renders' | 'exports',
    fileName: string,
    contentType = 'image/png'
  ): Promise<string> {
    const bucket = buckets[bucketName];
    const file = bucket.file(fileName);

    const [url] = await file.getSignedUrl({
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000,
      contentType,
    });

    return url;
  },

  async deleteFile(
    bucketName: 'uploads' | 'renders' | 'exports',
    fileName: string
  ): Promise<void> {
    const bucket = buckets[bucketName];
    await bucket.file(fileName).delete();
  },

  async moveFile(
    sourceBucket: 'uploads' | 'renders' | 'exports',
    sourceName: string,
    destBucket: 'uploads' | 'renders' | 'exports',
    destName: string
  ): Promise<void> {
    const source = buckets[sourceBucket].file(sourceName);
    const destination = buckets[destBucket].file(destName);

    await source.move(destination);
  },

  generateFileName(userId: string, type: string, extension: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `${userId}/${type}_${timestamp}_${random}.${extension}`;
  },
};