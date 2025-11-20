"use client";

import { Suspense } from 'react';
import Tournaments from '@/components/pages/Tournaments';

function TournamentsFallback() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center py-12">
        <div className="inline-block w-12 h-12 border-4 border-[#387B66] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 mt-4">Loading tournaments...</p>
      </div>
    </div>
  );
}

export default function TournamentsPage() {
  return (
    <Suspense fallback={<TournamentsFallback />}>
      <Tournaments />
    </Suspense>
  );
}
