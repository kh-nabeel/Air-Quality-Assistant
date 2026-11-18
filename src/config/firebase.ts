import { initializeApp } from 'firebase/app';
import { type AppCheck, initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getAI, GoogleAIBackend } from 'firebase/ai';
import { env } from './env';

const firebaseConfig = {
  apiKey: env.firebaseApiKey,
  authDomain: env.firebaseAuthDomain,
  projectId: env.firebaseProjectId,
  storageBucket: env.firebaseStorageBucket,
  messagingSenderId: env.firebaseMessagingSenderId,
  appId: env.firebaseAppId,
};

/** Firebase application instance */
export const firebaseApp = initializeApp(firebaseConfig);

/** Firebase App Check — protects backend APIs from abuse */
let appCheckInstance: AppCheck | null = null;

/** Global augmentation for Firebase App Check debug token (dev only) */
declare global {
  // eslint-disable-next-line no-var
  var FIREBASE_APPCHECK_DEBUG_TOKEN: boolean | string | undefined;
}

export function getAppCheck(): AppCheck | null {
  if (appCheckInstance) return appCheckInstance;

  if (!env.recaptchaSiteKey) return null;

  try {
    if (env.isDev) {
      // Use explicit debug token from env, or fall back to auto-debug mode
      globalThis.FIREBASE_APPCHECK_DEBUG_TOKEN = env.appCheckDebugToken || true;
    }

    appCheckInstance = initializeAppCheck(firebaseApp, {
      provider: new ReCaptchaV3Provider(env.recaptchaSiteKey),
      isTokenAutoRefreshEnabled: true,
    });

    return appCheckInstance;
  } catch {
    console.warn('[Saans] App Check initialization failed — continuing without protection');
    return null;
  }
}

/** Firebase AI Logic instance (Gemini Developer API backend) */
export const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });
