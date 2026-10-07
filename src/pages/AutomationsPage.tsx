import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Plus,
  Zap,
  ArrowDown,
  Trash2,
  Pencil,
} from 'lucide-react';
import { api } from '@/lib/api';
import { PageHeader, LoadingState, EmptyState } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import type { Automation } from '@/types';

const triggers = [
  { value: 'Shipment status changes', label: 'Shipment status changes' },
  { value: 'Delivery fails', label: 'Delivery fails' },
  { value: 'Package is delivered', label: 'Package is delivered' },
  { value: 'Rider assigned', label: 'Rider is assigned' },
  { value: 'Pickup scheduled', label: 'Pickup is scheduled' },
];

const triggerValues = ['Out for Delivery', 'Failed', 'Delivered', 'Pickup Scheduled', 'Rider Assigned', 'In Transit', 'Picked Up'];

function timeAgo(date: string | null): string {
  if (!date) return 'Never';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function AutomationsPage() {
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Automation | null>(null);
  const [deleting, setDeleting] = useState<Automation | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Automation>>({});
  const userId = localStorage.getItem('userId') ?? '';

  const { data: automations, isLoading } = useQuery({
    queryKey: ['automations'],
    queryFn: () => api.getAutomations(),
  });

  const {
    data: messageTemplates = [],
    isLoading: isLoadingTemplates,
    isError: isTemplatesError,
  } = useQuery<string[]>({
    queryKey: ['whatsapp-message-template-names', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('Logged-in user ID not found');
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/whatsapp/message-templates/${encodeURIComponent(userId)}`,
        {
          method: 'GET',
          headers: { accept: '*/*' },
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch templates: ${response.status} ${response.statusText}`,
        );
      }

      const result: { data?: { name: string }[] } = await response.json();
      return Array.isArray(result.data)
        ? result.data.map((template) => template.name)
        : [];
    },
    enabled: Boolean(userId),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const openCreate = () => {
    setCreating(true);
    setForm({ trigger: 'Shipment status changes', triggerValue: 'Out for Delivery', action: 'Send WhatsApp template', actionTemplate: messageTemplates[0] ?? '', name: '' });
  };

  const openEdit = (auto: Automation) => {
    setEditing(auto);
    setForm(auto);
  };

  const closeEditor = () => {
    setCreating(false);
    setEditing(null);
    setForm({});
  };

  const handleSave = async () => {
    if (!form.name?.trim()) {
      toast.error('Automation name is required');
      return;
    }
    setSaving(true);
    if (editing) {
      await api.createAutomation(form);
      toast.success('Automation updated');
    } else {
      await api.createAutomation(form);
      toast.success('Automation created');
    }
    setSaving(false);
    closeEditor();
    queryClient.invalidateQueries({ queryKey: ['automations'] });
  };

  const handleToggle = async (id: string) => {
    await api.toggleAutomation(id);
    queryClient.invalidateQueries({ queryKey: ['automations'] });
  };

  const handleDelete = async () => {
    if (!deleting) return;
    await api.deleteAutomation(deleting.id);
    toast.success('Automation deleted');
    setDeleting(null);
    queryClient.invalidateQueries({ queryKey: ['automations'] });
  };

  return (
    <div>
      <PageHeader title="Automations" description="Build workflows that automatically send WhatsApp notifications.">
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Create Automation
        </Button>
      </PageHeader>

      {isLoading ? (
        <LoadingState />
      ) : !automations || automations.length === 0 ? (
        <EmptyState
          icon={Zap}
          title="No automations yet"
          description="Create your first automation to send WhatsApp notifications automatically."
          action={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Create Automation</Button>}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {automations.map((auto) => (
            <div key={auto.id} className={cn('rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md', !auto.enabled && 'opacity-60')}>
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', auto.enabled ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground')}>
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{auto.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {auto.totalRuns.toLocaleString()} runs · Last triggered {timeAgo(auto.lastTriggered)}
                    </p>
                  </div>
                </div>
                <Switch checked={auto.enabled} onCheckedChange={() => handleToggle(auto.id)} />
              </div>

              {/* Workflow visualization */}
              <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">WHEN</span>
                  <span className="text-sm">{auto.trigger}</span>
                </div>
                {auto.triggerValue && (
                  <div className="flex items-center gap-2 pl-4">
                    <ArrowDown className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium">{auto.triggerValue}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <ArrowDown className="h-3 w-3 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">THEN</span>
                  <span className="text-sm">{auto.action}</span>
                </div>
                <div className="flex items-center gap-2 pl-4">
                  <ArrowDown className="h-3 w-3 text-muted-foreground" />
                  <span className="font-mono text-xs font-medium text-primary">{auto.actionTemplate}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-1 border-t border-border pt-3">
                <Button variant="ghost" size="sm" onClick={() => openEdit(auto)}>
                  <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => setDeleting(auto)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={creating || !!editing} onOpenChange={(open) => !open && closeEditor()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Automation' : 'Create Automation'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="autoName">Automation name</Label>
              <Input
                id="autoName"
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Out for Delivery Alert"
              />
            </div>

            {/* Trigger */}
            <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-300">TRIGGER</span>
                <span className="text-sm font-medium">When</span>
              </div>
              <div className="space-y-3">
                <Select value={form.trigger} onValueChange={(v) => setForm({ ...form, trigger: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {triggers.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Select value={form.triggerValue} onValueChange={(v) => setForm({ ...form, triggerValue: v })}>
                    <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {triggerValues.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="rounded-lg border border-primary/30 bg-accent/30 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">ACTION</span>
                <span className="text-sm font-medium">Then</span>
              </div>
              <div className="space-y-3">
                <div className="text-sm font-medium">Send WhatsApp template</div>
                <Select value={form.actionTemplate} onValueChange={(v) => setForm({ ...form, actionTemplate: v })}>
                  <SelectTrigger><SelectValue placeholder="Select template" /></SelectTrigger>
                  <SelectContent>
                    {messageTemplates.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                    {isLoadingTemplates && <SelectItem value="loading" disabled>Loading templates...</SelectItem>}
                    {isTemplatesError && <SelectItem value="error" disabled>Failed to load templates</SelectItem>}
                    {!userId && <SelectItem value="no-user" disabled>Log in to load templates</SelectItem>}
                    {!isLoadingTemplates && !isTemplatesError && userId && messageTemplates.length === 0 && (
                      <SelectItem value="empty" disabled>No templates available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEditor}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Automation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete automation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleting?.name}" and stop all associated notifications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
