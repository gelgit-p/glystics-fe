import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { aiApi, type SenderProfileInput } from '@/lib/ai-api';

const FIELDS: { key: keyof SenderProfileInput; label: string; placeholder: string }[] = [
  { key: 'senderName', label: 'Sender name', placeholder: 'Your business name' },
  { key: 'senderPhone', label: 'Sender phone', placeholder: '08012345678' },
  { key: 'senderAddress', label: 'Sender / pickup address', placeholder: '12 Allen Avenue, Ikeja, Lagos' },
  { key: 'senderEmail', label: 'Sender email', placeholder: 'you@business.com' },
];

export function SenderProfileFields({ value, onChange }: { value: SenderProfileInput; onChange: (v: SenderProfileInput) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {FIELDS.map((f) => (
        <label key={f.key} className="text-sm">{f.label}
          <input className="mt-1 w-full rounded-md border p-2" placeholder={f.placeholder} value={value[f.key] ?? ''} onChange={(e) => onChange({ ...value, [f.key]: e.target.value })} />
        </label>
      ))}
    </div>
  );
}

/** Standalone sender-profile editor (used in Profile settings). */
export function SenderProfileCard() {
  const qc = useQueryClient();
  const profile = useQuery({ queryKey: ['ai-sender-profile'], queryFn: aiApi.senderProfile });
  const [form, setForm] = useState<SenderProfileInput>({});
  useEffect(() => {
    if (profile.data) setForm({ senderName: profile.data.senderName ?? '', senderPhone: profile.data.senderPhone ?? '', senderAddress: profile.data.senderAddress ?? '', senderEmail: profile.data.senderEmail ?? '' });
  }, [profile.data]);
  const save = useMutation({
    mutationFn: () => aiApi.updateSenderProfile(form),
    onSuccess: () => { toast.success('Sender details saved — AI simulations and drafts will use them'); qc.invalidateQueries({ queryKey: ['ai-sender-profile'] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to save sender details'),
  });
  return (
    <div className="mt-6 rounded-xl border border-border bg-card p-6">
      <h3 className="mb-1 text-base font-semibold">Sender (Pickup) Details</h3>
      <p className="mb-4 text-sm text-muted-foreground">Default sender for deliveries. Dispatchly AI seeds every WhatsApp delivery draft with these details, so customers only need to provide receiver and package information.</p>
      <SenderProfileFields value={form} onChange={setForm} />
      <div className="mt-4 flex justify-end">
        <button type="button" className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50" disabled={save.isPending || profile.isLoading} onClick={() => save.mutate()}>{save.isPending ? 'Saving...' : 'Save Sender Details'}</button>
      </div>
    </div>
  );
}
