import { CloudTasksClient } from '@google-cloud/tasks';

const tasksClient = new CloudTasksClient();
const project = process.env.GOOGLE_CLOUD_PROJECT || 'mediaforge-957e4';
const location = process.env.VERTEX_AI_LOCATION || 'us-central1';
const queue = 'generation-queue';

export const queueService = {
  async createTask(
    taskType: 'generation' | 'training' | 'vectorization',
    payload: Record<string, unknown>,
    userId: string
  ): Promise<string> {
    const parent = tasksClient.queuePath(project, location, queue);

    const task = {
      httpRequest: {
        httpMethod: 'POST' as const,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/api/jobs/${taskType}`,
        headers: {
          'Content-Type': 'application/json',
        },
        body: Buffer.from(
          JSON.stringify({
            userId,
            type: taskType,
            payload,
            timestamp: Date.now(),
          })
        ).toString('base64'),
      },
    };

    const request = {
      parent,
      task,
    };

    const [response] = await tasksClient.createTask(request);
    return response.name || '';
  },

  async createGenerationTask(
    userId: string,
    generationId: string,
    prompt: string,
    style: string,
    stylePackId?: string
  ): Promise<string> {
    return this.createTask(
      'generation',
      {
        generationId,
        prompt,
        style,
        stylePackId,
      },
      userId
    );
  },

  async createVectorizationTask(
    userId: string,
    generationId: string,
    imageUrl: string
  ): Promise<string> {
    return this.createTask(
      'vectorization',
      {
        generationId,
        imageUrl,
      },
      userId
    );
  },

  async createTrainingTask(
    userId: string,
    stylePackId: string,
    trainingImages: string[]
  ): Promise<string> {
    return this.createTask(
      'training',
      {
        stylePackId,
        trainingImages,
      },
      userId
    );
  },
};