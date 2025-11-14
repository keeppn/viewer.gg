import Settings from '@/components/pages/Settings';

// Force this page to be dynamic - no caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function SettingsPage() {
  return <Settings />;
}
