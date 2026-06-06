import { getFullUserFromRequest, isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminLayoutContent from "@/components/admin/AdminLayoutContent";

export default async function AdminLayout({ children }) {
  // Server-side security check
  const user = await getFullUserFromRequest();
  
  if (!user || !isAdmin(user)) {
    redirect("/admin/login");
  }
  
  return (
    <AdminLayoutContent>
      {children}
    </AdminLayoutContent>
  );
}
