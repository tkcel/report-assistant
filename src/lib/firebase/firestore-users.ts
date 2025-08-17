import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { firebaseApp } from "./firebase";
import type { User } from "@/app/types";

const db = getFirestore(firebaseApp);

/**
 * Firestoreにユーザーデータを作成する
 */
export async function createUserInFirestore(uid: string, userData: Partial<User>) {
  console.log("Creating user in Firestore:", { uid, userData });

  try {
    const userRef = doc(db, "users", uid);

    // User型に準拠したデータを作成（undefined値を除外）
    const newUser: any = {
      uid,
      name: userData.name || "",
      email: userData.email || "",
      emailVerified: userData.emailVerified || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // オプショナルフィールドはundefinedでない場合のみ追加
    if (userData.phoneNumber !== undefined) newUser.phoneNumber = userData.phoneNumber;
    if (userData.photoURL !== undefined) newUser.photoURL = userData.photoURL;
    if (userData.sex !== undefined) newUser.sex = userData.sex;
    if (userData.schoolType !== undefined) newUser.schoolType = userData.schoolType;
    if (userData.schoolName !== undefined) newUser.schoolName = userData.schoolName;
    if (userData.schoolDepartment !== undefined)
      newUser.schoolDepartment = userData.schoolDepartment;
    if (userData.schoolMajor !== undefined) newUser.schoolMajor = userData.schoolMajor;
    if (userData.schoolGraduationYear !== undefined)
      newUser.schoolGraduationYear = userData.schoolGraduationYear;
    if (userData.schoolGraduationMonth !== undefined)
      newUser.schoolGraduationMonth = userData.schoolGraduationMonth;
    if (userData.selfPr !== undefined) newUser.selfPr = userData.selfPr;
    if (userData.interestedIndustries !== undefined)
      newUser.interestedIndustries = userData.interestedIndustries;
    if (userData.interestedJobTypes !== undefined)
      newUser.interestedJobTypes = userData.interestedJobTypes;

    console.log("Attempting to save user to Firestore:", newUser);

    await setDoc(userRef, newUser);
    console.log("User successfully created in Firestore");

    return { success: true, user: newUser };
  } catch (error) {
    console.error("Error creating user in Firestore - Full error:", error);
    return { success: false, error: "ユーザーデータの作成に失敗しました" };
  }
}

/**
 * Firestoreからユーザーデータを取得する
 */
export async function getUserFromFirestore(uid: string) {
  console.log("Fetching user from Firestore:", uid);

  try {
    const userRef = doc(db, "users", uid);
    const userSnapshot = await getDoc(userRef);

    if (userSnapshot.exists()) {
      const userData = userSnapshot.data() as User;
      console.log("User found in Firestore:", userData);
      return { success: true, user: userData };
    } else {
      console.log("User not found in Firestore for uid:", uid);
      return { success: false, error: "ユーザーが見つかりません" };
    }
  } catch (error) {
    console.error("Error fetching user from Firestore:", error);
    return { success: false, error: "ユーザーデータの取得に失敗しました" };
  }
}

/**
 * Firestoreのユーザーデータを更新する
 */
export async function updateUserInFirestore(uid: string, updates: Partial<User>) {
  try {
    const userRef = doc(db, "users", uid);

    // updatedAtを自動更新
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(userRef, updateData);

    return { success: true };
  } catch (error) {
    console.error("Error updating user in Firestore:", error);
    return { success: false, error: "ユーザーデータの更新に失敗しました" };
  }
}

/**
 * メール認証状態を更新する
 */
export async function updateEmailVerificationStatus(uid: string, verified: boolean) {
  try {
    const userRef = doc(db, "users", uid);

    await updateDoc(userRef, {
      emailVerified: verified,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating email verification status:", error);
    return { success: false, error: "メール認証状態の更新に失敗しました" };
  }
}
