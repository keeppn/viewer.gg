// API Route: Poll all approved streamers and update live status
// This endpoint should be called every 3-5 minutes by a cron service

import { NextResponse } from 'next/server';
import { streamPollerService } from '@/lib/services/streaming/stream-poller.service';

// Verify the request is from a cron service (optional but recommended)
function verifyCronRequest(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // If no CRON_SECRET is set, allow all requests (development mode)
  if (!cronSecret) {
    console.warn('[Cron] No CRON_SECRET set - allowing request without authentication');
    return true;
  }

  // Check if authorization header matches secret
  if (authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  console.error('[Cron] Invalid or missing authorization header');
  return false;
}

export async function GET(request: Request) {
  console.log('[API] /api/cron/poll-streams - Starting stream polling');

  // Verify cron authentication
  if (!verifyCronRequest(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Invalid cron secret' },
      { status: 401 }
    );
  }

  try {
    // Run the polling service
    const result = await streamPollerService.pollAllStreams();

    // Also collect viewership snapshot for analytics
    await streamPollerService.collectViewershipSnapshot();

    return NextResponse.json({
      success: result.success,
      timestamp: new Date().toISOString(),
      stats: {
        streamersChecked: result.checked,
        currentlyLive: result.live,
        errors: result.errors,
      },
      message: result.message,
    });
  } catch (error) {
    console.error('[API] Error in poll-streams cron:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(request: Request) {
  return GET(request);
}
