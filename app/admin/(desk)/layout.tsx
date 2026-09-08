import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import AdminChrome from "../AdminChrome";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return <AdminChrome email={session.email}>{children}</AdminChrome>;
}
