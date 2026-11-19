import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { profileExists, recordSwipe } from '@/lib/db';

const SwipeSchema = z.object({
  profileId: z.string().min(1),
  direction: z.enum(['like', 'pass']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = SwipeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input: ' + parsed.error.issues.map(i => i.message).join(', ') },
        { status: 400 }
      );
    }

    const { profileId, direction } = parsed.data;

    if (!profileExists(profileId)) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const result = recordSwipe(profileId, direction);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to record swipe' }, { status: 500 });
  }
}
