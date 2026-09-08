import { NextResponse } from 'next/server'
import { backendFetch } from '@/lib/backend'

export const dynamic = 'force-dynamic'

export async function GET() {
  const items = await backendFetch('/gallery');
  return NextResponse.json(items.map((i: any) => ({
    id: i._id,
    url: i.imageUrl || i.url,
    caption: i.caption || '',
    createdAt: i.createdAt
  })));
}
