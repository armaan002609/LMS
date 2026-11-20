import { NextResponse } from 'next/server';
import {
  assignCourse,
  unassignCourse,
  assignLearnerToInstructor,
  unassignLearnerFromInstructor,
  bulkAssignLearnersToInstructor,
} from '@/lib/store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, courseId, learnerId, instructorId, learnerIds, action } = body;

    if (action === 'assign-instructor') {
      if (!learnerId || !instructorId) {
        return NextResponse.json({ error: 'learnerId and instructorId are required' }, { status: 400 });
      }
      await assignLearnerToInstructor(learnerId, instructorId);
      return NextResponse.json({ success: true, action: 'instructor-assigned' });
    }

    if (action === 'unassign-instructor') {
      if (!learnerId) {
        return NextResponse.json({ error: 'learnerId is required' }, { status: 400 });
      }
      await unassignLearnerFromInstructor(learnerId);
      return NextResponse.json({ success: true, action: 'instructor-unassigned' });
    }

    if (action === 'bulk-assign-instructor') {
      if (!instructorId || !Array.isArray(learnerIds)) {
        return NextResponse.json({ error: 'instructorId and learnerIds array are required' }, { status: 400 });
      }
      await bulkAssignLearnersToInstructor(learnerIds, instructorId);
      return NextResponse.json({ success: true, action: 'bulk-instructor-assigned' });
    }

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
