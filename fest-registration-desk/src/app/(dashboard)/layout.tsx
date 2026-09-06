import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, LayoutDashboard, UserCheck, Users, BookOpen } from "lucide-react";
import LogoutButton from "./LogoutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect("/"); // Changed to / since login is at root
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">Huda Festival</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link
            href="/registration-desk"
            className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
          >
            <UserCheck size={20} />
            <span className="font-medium">Registration Desk</span>
          </Link>
          {session.role === "ADMIN" && (
            <>
              <Link
                href="/topics"
                className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              >
                <BookOpen size={20} />
                <span className="font-medium">Manage Topics</span>
              </Link>
              <Link
                href="/admin/teams"
                className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Users size={20} />
                <span className="font-medium">Admin Panel</span>
              </Link>
            </>
          )}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-800">{session.displayName || "User"}</p>
            <p className="text-xs text-gray-500">{session.teamName || "Admin"}</p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h2 className="text-xl font-semibold text-gray-800">Registration Portal</h2>
        </header>
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
