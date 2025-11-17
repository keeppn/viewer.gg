import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * GET /api/tournaments/[id]/public
 * Publicly accessible endpoint to fetch tournament data for application forms
 * Uses anon key with RLS disabled on tournaments table for public read access
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log('[Public Tournament API] Fetching tournament:', id);

    // Create a simple Supabase client with anon key
    // This will work if tournaments table has RLS policy allowing public reads
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    console.log('[Public Tournament API] Client created, fetching data...');

    // Fetch tournament data
    const { data: tournament, error } = await supabase
      .from('tournaments')
      .select('id, title, game, banner_url, form_fields, status')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[Public Tournament API] Supabase error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 404 }
      );
    }

    if (!tournament) {
      console.error('[Public Tournament API] No tournament found');
      return NextResponse.json(
        { error: 'Tournament not found in database' },
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

  } catch (error: any) {
    console.error('[Public Tournament API] Unexpected error:', {
      message: error?.message,
      stack: error?.stack
    });
    return NextResponse.json(
      { error: `Internal server error: ${error?.message}` },
      { status: 500 }
    );
  }
}
