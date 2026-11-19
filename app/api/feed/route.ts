import { NextRequest, NextResponse } from 'next/server';
import { getFeed } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '10', 10) || 10, 1), 50);
    const profiles = getFeed(limit);
    return NextResponse.json({ profiles });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
  }
}
