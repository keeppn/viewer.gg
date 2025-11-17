import { createServiceRoleClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/tournaments/[id]/public
 * Publicly accessible endpoint to fetch tournament data for application forms
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log('[Public Tournament API] Fetching tournament:', id);
    console.log('[Public Tournament API] Service role key present:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Check if service role key is configured
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[Public Tournament API] SUPABASE_SERVICE_ROLE_KEY not configured');
      return NextResponse.json(
        { error: 'Server configuration error - missing service role key' },
        { status: 500 }
      );
    }

    // Use service role client to bypass RLS for public tournament access
    const supabase = createServiceRoleClient();

    console.log('[Public Tournament API] Service role client created');

    // Fetch tournament data
    const { data: tournament, error } = await supabase
      .from('tournaments')
      .select('id, title, game, banner_url, form_fields, status')
      .eq('id', id)
      .single();

    if (error || !tournament) {
      console.error('[Public Tournament API] Error:', error);
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }

    console.log('[Public Tournament API] Tournament found:', {
      id: tournament.id,
      title: tournament.title,
      status: tournament.status,
    });

    return NextResponse.json({
      success: true,
      tournament,
    });

  } catch (error) {
    console.error('[Public Tournament API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
