import { NextResponse } from 'next/server';
import { resetDemo } from '@/lib/db';

export async function POST() {
  try {
    resetDemo();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to reset demo' }, { status: 500 });
  }
}
