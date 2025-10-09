# Gemini Architecture Strategy for MediaForge

## 1. Overview & Goal

This document outlines the robust, asynchronous architecture required to reliably power MediaForge's core features, specifically AI image generation and the long-running brand training process. The primary goal is to eliminate the recurring "Network error" by creating a system that is resilient to timeouts and scalable for future growth.

This strategy is a direct implementation of the vision described in the project's own `Architecture.md` and `PRD.md`, which specify an asynchronous, queue-based system.

## 2. Problem Diagnosis: The Root Cause of the "Network Error"

The persistent "Network error" is not a bug in the code's logic but a failure of the underlying architecture.

*   **The Mismatch:** The application is attempting to perform long-running tasks (image generation, 15-30 minute brand training) within a standard, short-lived web request.
*   **The Inevitable Timeout:** A standard web server or cloud function will time out after 30-60 seconds. This is a hard technical limit.
*   **The Result:** The backend service crashes or times out during the process. The frontend, waiting for a response that will never come, gives up and displays the generic "Network error."

The previous "simple" architecture was not scalable, and more importantly, it was not functional for the core features of the application.

## 3. The Correct Architecture: A Resilient, Asynchronous Workflow

We will implement an industry-standard, event-driven architecture using a job queue. This decouples the initial user request from the long-running backend process.

Here is the step-by-step flow:

**Step 1: Frontend Request (The Trigger)**
*   The Next.js client calls the API to start a job (e.g., generate an image).
*   It does **not** wait for the image. It only waits for a confirmation that the job has been accepted.

**Step 2: API Gateway (The Dispatcher)**
*   A lightweight, public-facing **Cloud Run** service receives the request.
*   **Action 1:** It immediately creates a document in a `jobs` collection in Firestore with a `status: "queued"`.
*   **Action 2:** It publishes the job details (prompt, user ID, job ID) to a **Pub/Sub** topic.
*   **Response:** It instantly returns a `202 Accepted` response to the frontend with the `jobId`. This completely eliminates the user-facing timeout error.

**Step 3: Job Queue (The Buffer)**
*   **Google Cloud Pub/Sub** acts as a reliable and scalable message queue. It holds the job until a worker is ready, preventing the system from being overwhelmed.

**Step 4: The Worker (The Powerhouse)**
*   A separate, powerful, and private **Cloud Run** service is subscribed to the Pub/Sub topic. This service is designed for long-running tasks.
*   **Action 1: Acknowledge:** It pulls a job from the queue and updates the Firestore job document to `status: "processing"`.
*   **Action 2: Execute:** It performs the heavy lifting: calling the Vertex AI Imagen 3 API, running the brand training, etc. This can safely take 30 minutes or more.
*   **Action 3: Finalize:**
    *   It saves the final asset (e.g., the generated image) to Google Cloud Storage.
    *   It updates the Firestore job document to `status: "completed"` and adds the public URL of the final image.
    *   If an error occurs, it updates the status to `status: "failed"` and includes an error message.

**Step 5: Frontend Update (The Result)**
*   The Next.js client, which has been listening to the Firestore job document since Step 2, sees the status change to `completed`.
*   It then displays the final image to the user.

## 4. Implementation Plan

I will now execute the following steps to build this architecture:
1.  **Configure `firebase.json`:** Set up the project to correctly deploy the two required Cloud Run services (API Gateway and Worker).
2.  **Refactor `generate-image` Function:** Convert the existing HTTP function into the lightweight API Gateway service.
3.  **Refactor `sdxl-lora` Function:** Convert the existing background function into the powerful, long-running Cloud Run worker.
4.  **Establish Permissions:** Ensure the worker service has the necessary IAM roles to access Firestore, Storage, and Vertex AI.
5.  **Deploy & Test:** Deploy the new services and run an end-to-end test to validate the entire flow.

This architecture is not a premature optimization; it is the **minimum viable architecture** required to make the application's core features functional and reliable.