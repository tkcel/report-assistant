"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { getUserFromFirestore } from "@/lib/firebase/firestore-users";

interface ProfileCheckWrapperProps {
  children: React.ReactNode;
}

export default function ProfileCheckWrapper({ children }: ProfileCheckWrapperProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  const checkProfileCompletion = useCallback(async () => {
    if (!session?.user?.uid) {
      setIsChecking(false);
      return;
    }

    try {
      const result = await getUserFromFirestore(session.user.uid);

      if (result.success && result.user) {
        const user = result.user;

        // 必須項目のチェック
        const isProfileIncomplete =
          !user.phoneNumber ||
          !user.schoolType ||
          !user.schoolName ||
          !user.schoolDepartment ||
          !user.schoolMajor ||
          !user.schoolGraduationYear ||
          !user.schoolGraduationMonth;

        if (isProfileIncomplete) {
          router.push("/profile");
        } else {
          setIsChecking(false);
        }
      } else {
        // ユーザーがFirestoreに存在しない場合もプロフィール入力画面へ
        router.push("/profile");
      }
    } catch (error) {
      console.error("Error checking profile:", error);
      setIsChecking(false);
    }
  }, [session, router]);

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user?.uid && pathname !== "/profile") {
      checkProfileCompletion();
    } else {
      setIsChecking(false);
    }
  }, [session, status, pathname, checkProfileCompletion]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
