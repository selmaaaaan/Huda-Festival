import { NextResponse } from 'next/server'
import { backendFetch } from '@/lib/backend'

export const dynamic = 'force-dynamic'

export async function GET() {
  const items = await backendFetch('/notifications');
  return NextResponse.json(items.map((i: any) => ({
    id: i._id,
    title: i.title,
    content: i.message,
    createdAt: i.createdAt,
    updatedAt: i.updatedAt
  })));
}
