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
      <main className="flex-grow transition-all duration-300 md:ml-72 ml-0 p-4 md:p-8">
        <div className="container mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
