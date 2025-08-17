"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getUserFromFirestore, updateUserInFirestore } from "@/lib/firebase/firestore-users";
import type { User } from "@/app/types";
import { Header } from "@/app/components/common/Header";

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    sex: "未回答" as User["sex"],
    schoolType: "" as User["schoolType"],
    schoolName: "",
    schoolDepartment: "",
    schoolMajor: "",
    schoolGraduationYear: new Date().getFullYear() + 1,
    schoolGraduationMonth: 3,
  });

  const loadUserProfile = useCallback(async () => {
    if (!session?.user?.uid) return;

    const result = await getUserFromFirestore(session.user.uid);
    if (result.success && result.user) {
      setFormData({
        phoneNumber: result.user.phoneNumber || "",
        sex: result.user.sex || "未回答",
        schoolType: result.user.schoolType || ("" as User["schoolType"]),
        schoolName: result.user.schoolName || "",
        schoolDepartment: result.user.schoolDepartment || "",
        schoolMajor: result.user.schoolMajor || "",
        schoolGraduationYear: result.user.schoolGraduationYear || new Date().getFullYear() + 1,
        schoolGraduationMonth: result.user.schoolGraduationMonth || 3,
      });
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.uid) return;

    setLoading(true);
    try {
      const result = await updateUserInFirestore(session.user.uid, formData);
      if (result.success) {
        router.push("/protected-page");
      } else {
        alert(result.error || "プロフィールの更新に失敗しました");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("プロフィールの更新中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const isProfileComplete = () => {
    return (
      formData.phoneNumber &&
      formData.schoolType &&
      formData.schoolName &&
      formData.schoolDepartment &&
      formData.schoolMajor &&
      formData.schoolGraduationYear &&
      formData.schoolGraduationMonth
    );
  };

  useEffect(() => {
    if (session?.user?.uid) {
      loadUserProfile();
    }
  }, [loadUserProfile, session]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">プロフィール入力</h1>
          <p className="text-gray-600 mb-8">
            サービスをご利用いただくために、以下の情報を入力してください。
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                電話番号 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 090-1234-5678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">性別</label>
              <select
                value={formData.sex}
                onChange={(e) => setFormData({ ...formData, sex: e.target.value as User["sex"] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="未回答">未回答</option>
                <option value="男性">男性</option>
                <option value="女性">女性</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                学校種別 <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.schoolType}
                onChange={(e) =>
                  setFormData({ ...formData, schoolType: e.target.value as User["schoolType"] })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選択してください</option>
                <option value="大学">大学</option>
                <option value="大学院">大学院</option>
                <option value="高専">高専</option>
                <option value="短大">短大</option>
                <option value="専門学校">専門学校</option>
                <option value="高等学校">高等学校</option>
                <option value="その他">その他</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                学校名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 東京大学"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                学部・研究科 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.schoolDepartment}
                onChange={(e) => setFormData({ ...formData, schoolDepartment: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 工学部"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                学科・専攻 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.schoolMajor}
                onChange={(e) => setFormData({ ...formData, schoolMajor: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 情報工学科"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  卒業予定年 <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.schoolGraduationYear}
                  onChange={(e) =>
                    setFormData({ ...formData, schoolGraduationYear: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[...Array(10)].map((_, i) => {
                    const year = new Date().getFullYear() + i;
                    return (
                      <option key={year} value={year}>
                        {year}年
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  卒業予定月 <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.schoolGraduationMonth}
                  onChange={(e) =>
                    setFormData({ ...formData, schoolGraduationMonth: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[...Array(12)].map((_, i) => {
                    const month = i + 1;
                    return (
                      <option key={month} value={month}>
                        {month}月
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || !isProfileComplete()}
                className={`px-6 py-2 rounded-md text-white font-medium ${
                  loading || !isProfileComplete()
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "保存中..." : "保存する"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
