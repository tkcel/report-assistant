import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ReactElement } from "react";
import { RootLayout } from "../root-layout";
import ClientLayout from "./client-layout";

const Layout = async ({ children }: { children: ReactElement }) => {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect(`/`);

  return (
    <RootLayout>
      <ClientLayout>{children}</ClientLayout>
    </RootLayout>
  );
};

export default Layout;
