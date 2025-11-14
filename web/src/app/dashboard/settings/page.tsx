import { Suspense } from 'react';
import Settings from '@/components/pages/Settings';

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function SettingsFallback() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center py-12">
        <div className="inline-block w-12 h-12 border-4 border-[#387B66] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 mt-4">Preparing settings...</p>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsFallback />}>
      <Settings />
    </Suspense>
  );
}
