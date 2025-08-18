import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ReactElement } from "react";
import { RootLayout } from "../root-layout";

const Layout = async ({ children }: { children: ReactElement }) => {
  const session = await getServerSession(authOptions);

  if (session?.user) redirect(`/protected-page/`);

  return <RootLayout>{children}</RootLayout>;
};

export default Layout;
