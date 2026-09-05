import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import { Users, FileCheck, CheckCircle, AlertTriangle } from "lucide-react";

export default async function DashboardPage() {
  const session = await getSession();
  
  if (!session.isLoggedIn) {
    redirect("/login");
  }

  const teamFilter = session.role === "ADMIN" ? {} : { teamId: session.teamId ?? -1 };
  
  const students = await prisma.student.findMany({
    where: {
      ...teamFilter,
      status: "Active",
    },
    include: {
      registrations: {
        include: {
          program: true,
        },
      },
    },
  });

  const totalStudents = students.length;
  
  let totalRegistrations = 0;
  let compliantStudents = 0;
  
  for (const student of students) {
    totalRegistrations += student.registrations.length;
    
    const stageCount = student.registrations.filter((r: any) => r.program.type === 'Stage').length;
    const nonStageCount = student.registrations.filter((r: any) => r.program.type === 'Non-Stage').length;
    
    if (student.registrations.length > 0 && stageCount > 0 && nonStageCount > 0) {
      compliantStudents++;
    }
  }

  const complianceRate = totalStudents > 0 ? Math.round((compliantStudents / totalStudents) * 100) : 0;
  const nonCompliantStudents = totalStudents - compliantStudents;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">
          Welcome back, {session.displayName}. Here is an overview of {session.teamName ? `${session.teamName}'s` : "all"} statistics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Students" 
          value={totalStudents} 
          icon={<Users size={24} className="text-blue-500" />}
          bgColor="bg-blue-50"
        />
        <StatCard 
          title="Total Registrations" 
          value={totalRegistrations} 
          icon={<FileCheck size={24} className="text-purple-500" />}
          bgColor="bg-purple-50"
        />
        <StatCard 
          title="Compliant Students" 
          value={compliantStudents} 
          icon={<CheckCircle size={24} className="text-emerald-500" />}
          bgColor="bg-emerald-50"
        />
        <StatCard 
          title="Action Needed" 
          value={nonCompliantStudents} 
          icon={<AlertTriangle size={24} className="text-amber-500" />}
          bgColor="bg-amber-50"
        />
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Registration Progress</h3>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className="bg-emerald-500 h-4 rounded-full transition-all" 
            style={{ width: `${complianceRate}%` }}
          ></div>
        </div>
        <div className="mt-2 text-sm text-gray-600 flex justify-between">
          <span>0%</span>
          <span>{complianceRate}% Compliant</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, bgColor }: { title: string, value: number, icon: React.ReactNode, bgColor: string }) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
      <div className={`p-4 rounded-full ${bgColor}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
