import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { firebaseApp } from "./firebase";
import type { User } from "@/app/types";

const db = getFirestore(firebaseApp);

/**
 * Firestoreにユーザーデータを作成する
 */
export async function createUserInFirestore(uid: string, userData: Partial<User>) {
  try {
    const userRef = doc(db, "users", uid);

    // User型に準拠したデータを作成（undefined値を除外）
    const newUser: any = {
      uid,
      name: userData.name || "",
      email: userData.email || "",
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

    await setDoc(userRef, newUser);

    return { success: true, user: newUser };
  } catch (error) {
    return { success: false, error: "ユーザーデータの作成に失敗しました" };
  }
}

/**
 * Firestoreからユーザーデータを取得する
 */
export async function getUserFromFirestore(uid: string) {
  try {
    const userRef = doc(db, "users", uid);
    const userSnapshot = await getDoc(userRef);

    if (userSnapshot.exists()) {
      const userData = userSnapshot.data() as User;
      return { success: true, user: userData };
    } else {
      return { success: false, error: "ユーザーが見つかりません" };
    }
  } catch (error) {
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
    return { success: false, error: "ユーザーデータの更新に失敗しました" };
  }
}
