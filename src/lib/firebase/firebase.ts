import { initializeApp } from "firebase/app";
import type { FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const firebaseApp = initializeApp(firebaseConfig);

// App Checkを有効化
initializeAppCheck(firebaseApp, {
  // XXX: 環境変数使うとundefinedの可能性があるのでベタガキしている。多分大丈夫なはず...？
  provider: new ReCaptchaEnterpriseProvider("6LcHp6krAAAAAD9KaL9qnrHX4zINrHiZPz1BS7rB"),
  isTokenAutoRefreshEnabled: true, // Set to true to allow auto-refresh.
});

export const firebaseAuth = getAuth(firebaseApp);
