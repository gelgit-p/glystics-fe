import { useQuery } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { PageHeader, LoadingState } from '@/components/shared';
import { aiApi } from '@/lib/ai-api';
import { SuperAdminAiPanel, AiDeliveryDetectionCard } from '@/components/ai/AiAutomationSettings';

export default function AdminPage() {
  const settings = useQuery({ queryKey: ['ai-settings'], queryFn: aiApi.settings });
  const health = useQuery({ queryKey: ['ai-admin-health'], queryFn: aiApi.adminAiHealth, enabled: settings.data?.role === 'SUPER_ADMIN' });

  if (settings.isLoading) return <LoadingState text="Loading admin..." />;
  if (settings.data && settings.data.role !== 'SUPER_ADMIN') return <Navigate to="/dashboard" replace />;

  return (
    <div>
      <PageHeader title="Super Admin" description="Global Dispatchly AI controls — Baseten delivery inference, detection kill-switches, and tenant roles." />
      {health.data && (
        <div className="mb-6 rounded-xl border border-border bg-card p-4 text-sm">
          <span className="font-semibold">Baseten AI health: </span>
          {health.data.ok ? `Live · ${health.data.provider} / ${health.data.model}${health.data.latencyMs ? ` · ${health.data.latencyMs}ms` : ''}` : `${health.data.mode === 'demo' ? 'Demo mode (no live Baseten call)' : 'Unavailable'} · ${health.data.provider} / ${health.data.model}${health.data.error ? ` — ${health.data.error}` : ''}`}
        </div>
      )}
      <AiDeliveryDetectionCard />
      <SuperAdminAiPanel />
    </div>
  );
}
