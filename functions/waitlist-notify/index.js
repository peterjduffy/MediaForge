const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const { Resend } = require('resend');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Define the secret
const resendApiKey = defineSecret('RESEND_API_KEY');

exports.notifyWaitlist = onDocumentCreated(
  {
    document: 'waitlist/{docId}',
    secrets: [resendApiKey],
  },
  async (event) => {
    const data = event.data.data();
    const docId = event.params.docId;

    // Initialize Resend with the secret value
    const resend = new Resend(resendApiKey.value());

    try {
      await resend.emails.send({
        from: 'MediaForge <notifications@mediaforge.dev>',
        to: 'peter@mediaforge.dev',
        subject: '🎨 New Waitlist Signup - MediaForge',
        html: `
          <h2>New Beta Access Request</h2>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Team Size:</strong> ${data.teamSize}</p>
          <p><strong>Use Case:</strong></p>
          <p>${data.useCase}</p>
          <hr>
          <p><strong>Submitted:</strong> ${data.createdAt ? new Date(data.createdAt.toDate()).toLocaleString() : 'Just now'}</p>
          <p><strong>Source:</strong> ${data.source}</p>
          <p><strong>Status:</strong> ${data.status}</p>
          <br>
          <p><a href="https://console.firebase.google.com/project/mediaforge-957e4/firestore/data/waitlist/${docId}">View in Firestore Console</a></p>
        `
      });

      console.log(`Notification sent for waitlist signup: ${data.email}`);
      return null;
    } catch (error) {
      console.error('Error sending notification email:', error);
      // Don't throw - we don't want to fail the waitlist signup if email fails
      return null;
    }
  }
);
