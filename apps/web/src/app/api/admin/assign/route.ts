import { NextResponse } from 'next/server';
import { assignCourse, unassignCourse } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const { userId, courseId, action } = await request.json();
    if (!userId || !courseId) {
      return NextResponse.json({ error: 'userId and courseId are required' }, { status: 400 });
    }

    if (action === 'unassign') {
      await unassignCourse(userId, courseId);
      return NextResponse.json({ success: true, action: 'unassigned' });
    } else {
      await assignCourse(userId, courseId);
      return NextResponse.json({ success: true, action: 'assigned' });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
