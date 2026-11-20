import { NextResponse } from 'next/server';
import { fetchUsersWithCourses, createNewUser, deleteUser } from '@/lib/store';

export async function GET() {
  const users = await fetchUsersWithCourses();
  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  try {
    const { name, email, role, initialCourseId } = await request.json();
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }
    const user = await createNewUser(name, email, role || 'learner', initialCourseId);
    return NextResponse.json({ user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    await deleteUser(userId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
