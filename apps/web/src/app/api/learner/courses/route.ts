import { NextResponse } from 'next/server';
import { fetchLearnerCourses } from '@/lib/store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  const courses = await fetchLearnerCourses(userId);
  return NextResponse.json({ courses });
}
