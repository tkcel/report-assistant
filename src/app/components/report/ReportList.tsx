"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Edit3, Calendar, FileText, MoreVertical, Trash2 } from "lucide-react";
import {
  getUserReportsFromFirestore,
  deleteReportFromFirestore,
  type FirestoreReport,
} from "@/lib/firebase/firestore-reports";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Timestamp } from "firebase/firestore";

interface ReportListProps {
  userId: string;
}

export const ReportList = ({ userId }: ReportListProps) => {
  const [reports, setReports] = useState<FirestoreReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchReports();
  }, [userId]);

  // クリック外側でメニューを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId && !(event.target as Element).closest(".menu-dropdown")) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const result = await getUserReportsFromFirestore(userId);
      if (result.success && result.reports) {
        setReports(result.reports);
      }
    } catch (error) {
      console.error("レポート取得エラー:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm("このレポートを削除してもよろしいですか？")) {
      return;
    }

    setDeletingId(reportId);
    try {
      const result = await deleteReportFromFirestore(reportId, userId);
      if (result.success) {
        setReports(reports.filter((r) => r.id !== reportId));
      } else {
        alert(result.error || "削除に失敗しました");
      }
    } catch (error) {
      console.error("削除エラー:", error);
      alert("削除に失敗しました");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (reportId: string) => {
    router.push(`/protected-page/edit?id=${reportId}`);
  };

  const formatDate = (date: Timestamp | Date) => {
    const dateObj = date instanceof Timestamp ? date.toDate() : date;
    return format(dateObj, "yyyy年MM月dd日 HH:mm", { locale: ja });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      draft: { label: "下書き", className: "bg-gray-100 text-gray-700" },
      generating: { label: "生成中", className: "bg-blue-100 text-blue-700" },
    };

    if (status === "completed") {
      return null;
    }

    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.draft;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">まだレポートがありません</p>
          <Button onClick={() => router.push("/protected-page/generate/")}>
            最初のレポートを作成
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {reports.map((report) => (
        <Card key={report.id} className="hover:shadow-lg transition-shadow relative">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-lg line-clamp-2">
                  {report.theme || "無題のレポート"}
                </CardTitle>
                {getStatusBadge(report.status) && (
                  <div className="mt-2">{getStatusBadge(report.status)}</div>
                )}
              </div>
              <div className="relative">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setOpenMenuId(openMenuId === report.id ? null : report.id)}
                  className="h-8 w-8 p-0"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
                {openMenuId === report.id && (
                  <div className="menu-dropdown absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                    <button
                      onClick={() => {
                        handleDelete(report.id);
                        setOpenMenuId(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                      disabled={deletingId === report.id}
                    >
                      <Trash2 className="h-4 w-4" />
                      削除する
                    </button>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>作成: {formatDate(report.createdAt)}</span>
                </div>
                {report.updatedAt && (
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    <span>更新: {formatDate(report.updatedAt)}</span>
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-600">
                <p>言語: {report.settings?.language}</p>
                <p>文体: {report.settings?.writingStyle}</p>
                <p>トーン: {report.settings?.tone}</p>
              </div>

              <div className="pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(report.id)}
                  className="w-full"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  編集
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
