import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  getMetadata,
  listAll,
  ListResult
} from 'firebase/storage';
import { storage } from './firebase';

// Bucket configurations
export const STORAGE_BUCKETS = {
  USER_UPLOADS: 'user-uploads',
  GENERATED_IMAGES: 'generated-images',
  VECTOR_OUTPUTS: 'vector-outputs',
  STYLE_PACKS: 'style-packs',
  TRAINING_DATA: 'training-data',
  TEMP_UPLOADS: 'temp-uploads',
  PUBLIC_ASSETS: 'public-assets'
} as const;

// File type configurations
export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
];

export const ACCEPTED_VECTOR_TYPES = [
  'image/svg+xml',
  'application/postscript', // EPS
  'application/pdf'
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_TRAINING_IMAGES = 20;

// Helper function to validate file
export const validateFile = (file: File, allowedTypes: string[]): void => {
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }
};

// Generate unique file path
export const generateFilePath = (
  bucket: keyof typeof STORAGE_BUCKETS,
  userId: string,
  fileName: string,
  subfolder?: string
): string => {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const uniqueFileName = `${timestamp}_${sanitizedFileName}`;

  if (subfolder) {
    return `${bucket}/${userId}/${subfolder}/${uniqueFileName}`;
  }
  return `${bucket}/${userId}/${uniqueFileName}`;
};

type Metadata = {
    contentType: string;
    customMetadata: {
        [key: string]: string;
    };
};

// Upload file with progress tracking
export const uploadFile = async (
  file: File,
  path: string,
  onProgress?: (progress: number) => void,
  metadata?: Metadata
): Promise<string> => {
  const storageRef = ref(storage, path);

  if (onProgress) {
    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress);
        },
        (error) => {
          console.error('Upload failed:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } else {
    const snapshot = await uploadBytes(storageRef, file, metadata);
    return await getDownloadURL(snapshot.ref);
  }
};

// Upload user profile image
export const uploadProfileImage = async (
  userId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  validateFile(file, ACCEPTED_IMAGE_TYPES);
  const path = generateFilePath('USER_UPLOADS', userId, file.name, 'profile');

  const metadata: Metadata = {
    contentType: file.type,
    customMetadata: {
      uploadedBy: userId,
      originalName: file.name,
      purpose: 'profile-image'
    }
  };

  return await uploadFile(file, path, onProgress, metadata);
};

// Upload style reference images
export const uploadStyleReference = async (
  userId: string,
  file: File,
  stylePackId: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  validateFile(file, ACCEPTED_IMAGE_TYPES);
  const path = generateFilePath('TRAINING_DATA', userId, file.name, stylePackId);

  const metadata: Metadata = {
    contentType: file.type,
    customMetadata: {
      uploadedBy: userId,
      stylePackId,
      originalName: file.name,
      purpose: 'style-reference'
    }
  };

  return await uploadFile(file, path, onProgress, metadata);
};

// Upload temporary file
export const uploadTempFile = async (
  userId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  validateFile(file, [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VECTOR_TYPES]);
  const path = generateFilePath('TEMP_UPLOADS', userId, file.name);

  const metadata: Metadata = {
    contentType: file.type,
    customMetadata: {
      uploadedBy: userId,
      originalName: file.name,
      purpose: 'temporary',
      expiresAt: (Date.now() + 24 * 60 * 60 * 1000).toString() // 24 hours
    }
  };

  return await uploadFile(file, path, onProgress, metadata);
};

// Get file metadata
export const getFileMetadata = async (path: string) => {
  const storageRef = ref(storage, path);
  return await getMetadata(storageRef);
};

// Delete file
export const deleteFile = async (path: string): Promise<void> => {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
};

// List files in a directory
export const listFiles = async (path: string): Promise<ListResult> => {
  const storageRef = ref(storage, path);
  return await listAll(storageRef);
};

// Get user's uploaded files
export const getUserFiles = async (userId: string, bucket: keyof typeof STORAGE_BUCKETS): Promise<string[]> => {
  const path = `${bucket}/${userId}`;
  const result = await listFiles(path);

  const urls = await Promise.all(
    result.items.map(async (item) => {
      return await getDownloadURL(item);
    })
  );

  return urls;
};

// Generate signed URL for private access (server-side only)
export const generateSignedUrl = async (
  path: string
): Promise<string> => {
  // This would typically be done server-side with admin SDK
  // For client-side, we use getDownloadURL which provides a long-lived URL
  const storageRef = ref(storage, path);
  return await getDownloadURL(storageRef);
};

// Batch upload multiple files
export const uploadMultipleFiles = async (
  files: File[],
  userId: string,
  bucket: keyof typeof STORAGE_BUCKETS,
  subfolder?: string,
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<string[]> => {
  const uploadPromises = files.map(async (file, index) => {
    const path = generateFilePath(bucket, userId, file.name, subfolder);

    const metadata: Metadata = {
      contentType: file.type,
      customMetadata: {
        uploadedBy: userId,
        originalName: file.name,
        batchUpload: 'true',
        batchIndex: index.toString()
      }
    };

    return await uploadFile(
      file,
      path,
      onProgress ? (progress) => onProgress(index, progress) : undefined,
      metadata
    );
  });

  return await Promise.all(uploadPromises);
};

// Clean up expired temporary files (would typically run as a Cloud Function)
export const cleanupTempFiles = async (userId: string): Promise<void> => {
  const tempPath = `${STORAGE_BUCKETS.TEMP_UPLOADS}/${userId}`;
  const result = await listFiles(tempPath);

  const now = Date.now();
  const deletePromises = result.items.map(async (item) => {
    try {
      const metadata = await getMetadata(item);
      const expiresAt = parseInt(metadata.customMetadata?.expiresAt || '0');

      if (expiresAt > 0 && now > expiresAt) {
        await deleteObject(item);
        console.log(`Deleted expired temp file: ${item.fullPath}`);
      }
    } catch (error) {
      console.error(`Error processing temp file ${item.fullPath}:`, error);
    }
  });

  await Promise.all(deletePromises);
};