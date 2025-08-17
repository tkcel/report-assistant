import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { firebaseAuth } from "./firebase";
import { signIn as signInWithNextAuth, signOut as signOutWithNextAuth } from "next-auth/react";

export function logInWithGoogleAuthProvider() {
  const provider = new GoogleAuthProvider();

  signInWithPopup(firebaseAuth, provider)
    .then(async ({ user }) => {
      if (user) {
        const refreshToken = user.refreshToken;
        const idToken = await user.getIdToken();
        await signInWithNextAuth("credentials", {
          idToken,
          refreshToken,
          callbackUrl: `/protected-page`, //ログイン後に遷移する画面の指定
        });
      }
    })
    .catch((error) => {
      console.error("Error Sing In with Google", error);
    });
}

export function logOutWithFirebaseAuth() {
  firebaseAuth
    .signOut()
    .then(() => {
      signOutWithNextAuth({ callbackUrl: `/` }); //ログアウト後に遷移する画面の指
    })
    .catch((error) => {
      console.error("Error Sign Out with Google", error);
    });
}

export async function signUpWithEmailAndPassword(
  email: string,
  password: string,
  displayName: string,
) {
  try {
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    const user = userCredential.user;

    // ユーザー名を設定
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    // NextAuthでセッションを作成
    const idToken = await user.getIdToken();
    const refreshToken = user.refreshToken;

    await signInWithNextAuth("credentials", {
      idToken,
      refreshToken,
      callbackUrl: `/protected-page`,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error creating account:", error);
    return {
      success: false,
      error: error.message || "アカウント作成に失敗しました",
    };
  }
}

export async function signInWithEmailPassword(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    const user = userCredential.user;

    // NextAuthでセッションを作成
    const idToken = await user.getIdToken();
    const refreshToken = user.refreshToken;

    await signInWithNextAuth("credentials", {
      idToken,
      refreshToken,
      callbackUrl: `/protected-page`,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error signing in:", error);
    return {
      success: false,
      error: error.message || "ログインに失敗しました",
    };
  }
}
