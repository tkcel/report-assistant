"use client";

import { Header } from "@/app/components/common/Header";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

const HomePage = () => {
  const router = useRouter();

  return (
    <div className="w-full">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-screen">
          <Button onClick={() => router.push("/protected-page/generate")}>
            レポートを作成する
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
