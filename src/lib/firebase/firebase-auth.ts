import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  reload,
} from "firebase/auth";
import { firebaseAuth } from "./firebase";
import { signIn as signInWithNextAuth, signOut as signOutWithNextAuth } from "next-auth/react";
import { createUserInFirestore } from "./firestore-users";

export function logInWithGoogleAuthProvider() {
  const provider = new GoogleAuthProvider();

  signInWithPopup(firebaseAuth, provider)
    .then(async ({ user }) => {
      if (user) {
        // Firestoreにユーザーデータが存在するか確認、なければ作成
        const { getUserFromFirestore } = await import("./firestore-users");
        const userResult = await getUserFromFirestore(user.uid);

        if (!userResult.success) {
          // ユーザーデータが存在しない場合は作成
          const firestoreResult = await createUserInFirestore(user.uid, {
            name: user.displayName || "",
            email: user.email || "",
            emailVerified: user.emailVerified,
            photoURL: user.photoURL || undefined,
          });

          if (!firestoreResult.success) {
            console.error(
              "Failed to create user in Firestore during Google sign-in:",
              firestoreResult.error,
            );
          }
        }

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

    // Firestoreにユーザー情報を保存
    const firestoreResult = await createUserInFirestore(user.uid, {
      name: displayName || "",
      email: user.email || "",
      emailVerified: false,
    });

    if (!firestoreResult.success) {
      console.error("Failed to create user in Firestore:", firestoreResult.error);
    }

    // メール確認を送信
    await sendEmailVerification(user);

    // メール確認が必要であることを返す
    return {
      success: true,
      requiresVerification: true,
      email: user.email,
    };
  } catch (error: any) {
    console.error("Error creating account:", error);

    // エラーメッセージを日本語にマッピング
    let errorMessage = "アカウント作成に失敗しました";
    if (error.code === "auth/email-already-in-use") {
      errorMessage = "このメールアドレスは既に使用されています";
    } else if (error.code === "auth/weak-password") {
      errorMessage = "パスワードは6文字以上にしてください";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "有効なメールアドレスを入力してください";
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function signInWithEmailPassword(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    const user = userCredential.user;

    // メールが確認されているかチェック
    if (!user.emailVerified) {
      // 最新の状態を取得
      await reload(user);

      if (!user.emailVerified) {
        // まだ確認されていない場合は、再度確認メールを送信するオプションを提供
        return {
          success: false,
          requiresVerification: true,
          email: user.email,
          error: "メールアドレスの確認が必要です。確認メールをご確認ください。",
        };
      }
    }

    // Firestoreにユーザーデータが存在するか確認、なければ作成
    const { getUserFromFirestore } = await import("./firestore-users");
    const userResult = await getUserFromFirestore(user.uid);

    if (!userResult.success) {
      // ユーザーデータが存在しない場合は作成
      const firestoreResult = await createUserInFirestore(user.uid, {
        name: user.displayName || "",
        email: user.email || "",
        emailVerified: user.emailVerified,
      });

      if (!firestoreResult.success) {
        console.error("Failed to create user in Firestore during sign-in:", firestoreResult.error);
      }
    }

    // メール確認済みの場合のみセッションを作成
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

    // エラーメッセージを日本語にマッピング
    let errorMessage = "ログインに失敗しました";
    if (error.code === "auth/user-not-found") {
      errorMessage = "アカウントが見つかりません";
    } else if (error.code === "auth/wrong-password") {
      errorMessage = "パスワードが正しくありません";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "有効なメールアドレスを入力してください";
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// メール確認を再送信する関数
export async function resendVerificationEmail() {
  try {
    const user = firebaseAuth.currentUser;
    if (user && !user.emailVerified) {
      await sendEmailVerification(user);
      return { success: true };
    }
    return { success: false, error: "ユーザーが見つかりません" };
  } catch (error: any) {
    console.error("Error resending verification email:", error);
    return { success: false, error: "確認メールの送信に失敗しました" };
  }
}
