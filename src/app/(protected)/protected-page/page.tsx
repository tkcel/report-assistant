"use client";

import { Header } from "@/app/components/common/Header";
import { Button } from "@/components/ui/Button";
import { ReportList } from "@/app/components/report/ReportList";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Plus } from "lucide-react";

const HomePage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="w-full">
        <Header />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!session?.user?.uid) {
    return null;
  }

  return (
    <div className="w-full">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">マイレポート</h1>
            <Button
              onClick={() => router.push("/protected-page/generate/")}
              className="flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              新規レポート作成
            </Button>
          </div>
          <ReportList userId={session.user.uid} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
