import AdminSidebar from "@/components/AdminSidebar";
import { getFullUserFromRequest, isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }) {
  // Server-side security check
  const user = await getFullUserFromRequest();
  
  if (!user || !isAdmin(user)) {
    redirect("/admin/login");
  }
  
  return (
    <div className="flex bg-[#f9fafb] min-h-screen">
      <AdminSidebar />
      <main className="flex-1 min-w-0 transition-all duration-300 md:ml-72 ml-0 p-4 pt-20 md:p-8 w-full">
        <div className="container mx-auto max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
