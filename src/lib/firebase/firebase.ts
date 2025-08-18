import { getApp, getApps, initializeApp } from "firebase/app";
import type { FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getToken, initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Firebase 初期化処理
export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const firebaseAuth = getAuth(firebaseApp);

// FIREBASE_APPCHECK_DEBUG_TOKEN の定義(TypeScript用)
declare global {
  let FIREBASE_APPCHECK_DEBUG_TOKEN: boolean | string | undefined;
}

// AppCheck 初期化処理
if (typeof document !== "undefined") {
  // AppCheck 初期化
  const appCheck = initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaEnterpriseProvider("6LcHp6krAAAAAD9KaL9qnrHX4zINrHiZPz1BS7rB"),
    isTokenAutoRefreshEnabled: true,
  });
  // AppCheck 結果 ＆ トークン確認
  getToken(appCheck).catch(() => {
    // AppCheckのエラーは静かに処理
  });
}
