"use client";

import { Suspense } from 'react';
import Analytics from '@/components/pages/Analytics';

function AnalyticsFallback() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center py-12">
        <div className="inline-block w-12 h-12 border-4 border-[#387B66] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 mt-4">Loading analytics...</p>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<AnalyticsFallback />}>
      <Analytics />
    </Suspense>
  );
}
