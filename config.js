import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  discordToken: process.env.DISCORD_TOKEN,
  applicationId: process.env.APPLICATION_ID,
  publicKey: process.env.PUBLIC_KEY,
  firebaseConfig: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    auth: {
      email: process.env.FIREBASE_AUTH_EMAIL,
      password: process.env.FIREBASE_AUTH_PASSWORD,
    },
  },
};
