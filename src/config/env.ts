/** Typed access to environment variables */
export const env = {
  firebaseApiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  firebaseAuthDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  firebaseProjectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  firebaseStorageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  firebaseMessagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  firebaseAppId: import.meta.env.VITE_FIREBASE_APP_ID as string,
  recaptchaSiteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY as string,
  isDev: import.meta.env.DEV,
} as const;
