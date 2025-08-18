"use client";

import { SessionProvider } from "next-auth/react";
import ProfileCheckWrapper from "@/app/components/common/ProfileCheckWrapper";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ProfileCheckWrapper>{children}</ProfileCheckWrapper>
    </SessionProvider>
  );
}
