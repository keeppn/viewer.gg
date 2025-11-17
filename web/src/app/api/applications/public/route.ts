import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * POST /api/applications/public
 * Publicly accessible endpoint to submit tournament applications
 * Uses anon key with RLS policy allowing public inserts on applications table
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log('[Public Applications API] Received application:', {
      tournament_id: body.tournament_id,
      streamer_name: body.streamer?.name,
      discord_user_id: body.streamer?.discord_user_id,
    });

    // Create a simple Supabase client with anon key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Insert the application
    const { data, error } = await supabase
      .from('applications')
      .insert({
        tournament_id: body.tournament_id,
        streamer: body.streamer,
        custom_data: body.custom_data || {},
        status: 'Pending',
        availability_confirmed: false,
        submission_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('[Public Applications API] Insert error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      throw error;
    }

    console.log('[Public Applications API] Application created:', {
      id: data.id,
      streamer: data.streamer,
    });

    // Increment application count on tournament
    await supabase.rpc('increment_tournament_applications', {
      tournament_id: body.tournament_id,
    });

    return NextResponse.json({
      success: true,
      application: data,
    });

  } catch (error: any) {
    console.error('[Public Applications API] Error:', {
      message: error?.message,
      stack: error?.stack,
    });
    return NextResponse.json(
      { error: error?.message || 'Failed to submit application' },
      { status: 500 }
    );
  }
}
