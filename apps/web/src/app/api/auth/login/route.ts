import { NextResponse } from 'next/server';
import { INITIAL_USERS } from '@/lib/store';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const cleanEmail = (email || '').trim().toLowerCase();

    // Check Supabase if configured
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data: dbUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .single();

      if (!error && dbUser) {
        return NextResponse.json({
          user: {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role,
            organizationId: dbUser.organization_id || 'darkspace',
            createdAt: dbUser.created_at,
          },
        });
      }
    }

    // Fallback store
    const user = INITIAL_USERS.find((u) => u.email.toLowerCase() === cleanEmail);
    if (user) {
      return NextResponse.json({ user });
    }

    return NextResponse.json(
      { error: 'Invalid security credentials or unrecognized email.' },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
