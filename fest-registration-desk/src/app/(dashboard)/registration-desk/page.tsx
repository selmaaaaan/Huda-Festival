import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import RegistrationGrid from "./RegistrationGrid";

export default async function RegistrationDeskPage() {
  const session = await getSession();
  
  if (!session.isLoggedIn) {
    redirect("/login");
  }

  // We pass session to client so we know if they have EDIT_REGISTRATIONS perm
  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Registration Desk</h1>
        <p className="text-gray-500">
          Manage program registrations for your team. Click a cell to toggle registration.
        </p>
      </div>

      <RegistrationGrid 
        canEdit={session.permissions?.EDIT_REGISTRATIONS || session.role === "ADMIN"} 
      />
    </div>
  );
}
