import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { firebaseApp } from "./firebase";
import type { Paragraph } from "@/app/types";

const db = getFirestore(firebaseApp);

export interface FirestoreReport {
  id: string;
  userId: string;
  theme: string;
  settings: {
    language: string;
    writingStyle: string;
    tone: string;
    quality: string;
    purpose?: string;
  };
  paragraphs: Paragraph[];
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  status: "draft" | "generating" | "completed";
}

/**
 * レポートをFirestoreに作成する
 */
export async function createReportInFirestore(
  userId: string,
  reportData: Omit<FirestoreReport, "id" | "userId" | "createdAt" | "updatedAt">,
) {
  try {
    const reportId = doc(collection(db, "reports")).id;
    const reportRef = doc(db, "reports", reportId);

    const newReport = {
      id: reportId,
      userId,
      ...reportData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(reportRef, newReport);

    return { success: true, reportId };
  } catch (error) {
    console.error("レポート作成エラー:", error);
    return { success: false, error: "レポートの作成に失敗しました" };
  }
}

/**
 * レポートを取得する
 */
export async function getReportFromFirestore(reportId: string, userId: string) {
  try {
    const reportRef = doc(db, "reports", reportId);
    const reportSnapshot = await getDoc(reportRef);

    if (reportSnapshot.exists()) {
      const reportData = reportSnapshot.data() as FirestoreReport;

      // ユーザーIDの確認
      if (reportData.userId !== userId) {
        return { success: false, error: "アクセス権限がありません" };
      }

      return { success: true, report: reportData };
    } else {
      return { success: false, error: "レポートが見つかりません" };
    }
  } catch (error) {
    console.error("レポート取得エラー:", error);
    return { success: false, error: "レポートの取得に失敗しました" };
  }
}

/**
 * ユーザーのレポート一覧を取得する
 */
export async function getUserReportsFromFirestore(userId: string) {
  try {
    const reportsRef = collection(db, "reports");
    const q = query(reportsRef, where("userId", "==", userId), orderBy("updatedAt", "desc"));

    const querySnapshot = await getDocs(q);
    const reports: FirestoreReport[] = [];

    querySnapshot.forEach((doc) => {
      reports.push(doc.data() as FirestoreReport);
    });

    return { success: true, reports };
  } catch (error) {
    console.error("レポート一覧取得エラー:", error);
    return { success: false, error: "レポート一覧の取得に失敗しました" };
  }
}

/**
 * レポートを更新する
 */
export async function updateReportInFirestore(
  reportId: string,
  userId: string,
  updates: Partial<Omit<FirestoreReport, "id" | "userId" | "createdAt">>,
) {
  try {
    const reportRef = doc(db, "reports", reportId);

    // 既存のレポートを取得してユーザーIDを確認
    const reportSnapshot = await getDoc(reportRef);
    if (!reportSnapshot.exists()) {
      return { success: false, error: "レポートが見つかりません" };
    }

    const reportData = reportSnapshot.data() as FirestoreReport;
    if (reportData.userId !== userId) {
      return { success: false, error: "アクセス権限がありません" };
    }

    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(reportRef, updateData);

    return { success: true };
  } catch (error) {
    console.error("レポート更新エラー:", error);
    return { success: false, error: "レポートの更新に失敗しました" };
  }
}

/**
 * レポートを削除する
 */
export async function deleteReportFromFirestore(reportId: string, userId: string) {
  try {
    const reportRef = doc(db, "reports", reportId);

    // 既存のレポートを取得してユーザーIDを確認
    const reportSnapshot = await getDoc(reportRef);
    if (!reportSnapshot.exists()) {
      return { success: false, error: "レポートが見つかりません" };
    }

    const reportData = reportSnapshot.data() as FirestoreReport;
    if (reportData.userId !== userId) {
      return { success: false, error: "アクセス権限がありません" };
    }

    await deleteDoc(reportRef);

    return { success: true };
  } catch (error) {
    console.error("レポート削除エラー:", error);
    return { success: false, error: "レポートの削除に失敗しました" };
  }
}