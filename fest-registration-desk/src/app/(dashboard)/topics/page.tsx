import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/db';
import TopicManager from './TopicManager';

export default async function TopicsPage() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    redirect('/login');
  }

  if (session.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center text-red-600 font-medium">
        403 Forbidden: You do not have permission to access this page.
      </div>
    );
  }

  // Fetch all active programs to allow admin to enable topics on them
  const programs = await prisma.program.findMany({
    where: { status: 'Active' },
    orderBy: { code: 'asc' },
    include: {
      topics: {
        orderBy: { createdAt: 'asc' },
      }
    }
  });

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Topic Management</h1>
          <p className="text-gray-500 mt-1">Configure topic requirements for programs and manage fixed topic lists.</p>
        </div>

        <TopicManager initialPrograms={programs} />
      </div>
    </div>
  );
}
