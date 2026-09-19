import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Eye,
  Trash2,
  MessageSquare,
  Check,
  X,
  Copy,
} from 'lucide-react';
import { api } from '@/lib/api';
import { PageHeader, StatusBadge, LoadingState, EmptyState } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import type { Template } from '@/types';

const categories = ['Utility', 'Marketing', 'Authentication'];
const languages = ['English', 'French', 'Spanish', 'Arabic', 'Hausa', 'Yoruba', 'Igbo'];

function WhatsAppPreview({ template }: { template: Partial<Template> }) {
  const renderBody = (body: string) => {
    return body.replace(/\{\{(\w+)\}\}/g, (_, key) => `[${key}]`);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <MessageSquare className="h-3 w-3" />
        </div>
        WhatsApp Preview
      </div>
      <div className="w-full max-w-xs rounded-xl bg-[#e5ddd5] p-4 dark:bg-slate-800">
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-[#075e54] px-3 py-2 text-white">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
            SL
          </div>
          <div>
            <p className="text-sm font-semibold">SwiftDrop Logistics</p>
            <p className="text-[10px] opacity-80">business account</p>
          </div>
        </div>
        <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-slate-700">
          {template.header && (
            <p className="mb-2 text-sm font-semibold text-[#075e54] dark:text-emerald-400">{template.header}</p>
          )}
          <p className="whitespace-pre-wrap text-sm text-gray-800 dark:text-slate-200">
            {renderBody(template.body || '')}
          </p>
          {template.footer && (
            <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">{template.footer}</p>
          )}
          {template.buttons && template.buttons.length > 0 && (
            <div className="mt-3 border-t border-gray-200 dark:border-slate-600">
              {template.buttons.map((btn, i) => (
                <div key={i} className="border-b border-gray-200 py-2 text-center text-sm font-medium text-[#075e54] last:border-0 dark:border-slate-600 dark:text-emerald-400">
                  {btn}
                </div>
              ))}
            </div>
          )}
          <p className="mt-1 text-right text-[10px] text-gray-400 dark:text-slate-500">12:30 PM ✓✓</p>
        </div>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Template | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Template | null>(null);
  const [previewing, setPreviewing] = useState<Template | null>(null);

  // Editor form state
  const [form, setForm] = useState<Partial<Template>>({});
  const [saving, setSaving] = useState(false);

  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => api.getTemplates(),
  });

  const openEditor = (tpl?: Template) => {
    if (tpl) {
      setEditing(tpl);
      setForm(tpl);
    } else {
      setCreating(true);
      setForm({ category: 'Utility', language: 'English', buttons: [], variables: [], header: '', body: '', footer: '', name: '' });
    }
  };

  const closeEditor = () => {
    setEditing(null);
    setCreating(false);
    setForm({});
  };

  const handleSave = async () => {
    if (!form.name || !form.body) {
      toast.error('Template name and body are required');
      return;
    }
    setSaving(true);
    const variables = [...form.body!.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]);
    const data = { ...form, variables };
    if (editing) {
      await api.updateTemplate(editing.id, data);
      toast.success('Template updated');
    } else {
      await api.createTemplate(data);
      toast.success('Template created');
    }
    setSaving(false);
    closeEditor();
    queryClient.invalidateQueries({ queryKey: ['templates'] });
  };

  const handleDelete = async () => {
    if (!deleting) return;
    await api.deleteTemplate(deleting.id);
    toast.success('Template deleted');
    setDeleting(null);
    queryClient.invalidateQueries({ queryKey: ['templates'] });
  };

  const isEditing = !!(editing || creating);

  return (
    <div>
      <PageHeader title="Templates" description="Manage your WhatsApp message templates.">
        <Button onClick={() => openEditor()}>
          <Plus className="mr-2 h-4 w-4" /> Create Template
        </Button>
      </PageHeader>

      {isLoading ? (
        <LoadingState />
      ) : !templates || templates.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No templates yet"
          description="Create your first WhatsApp message template to start sending notifications."
          action={<Button onClick={() => openEditor()}><Plus className="mr-2 h-4 w-4" /> Create Template</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((tpl) => (
            <div key={tpl.id} className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold capitalize">{tpl.name.replace(/_/g, ' ')}</h3>
                  <p className="text-xs text-muted-foreground">{tpl.category} · {tpl.language}</p>
                </div>
                <StatusBadge status={tpl.status} />
              </div>
              <div className="mb-3 rounded-lg bg-muted p-3">
                {tpl.header && <p className="mb-1 text-sm font-medium">{tpl.header}</p>}
                <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">{tpl.body}</p>
              </div>
              <div className="mb-3 flex flex-wrap gap-1">
                {tpl.variables.map((v) => (
                  <span key={v} className="rounded-md bg-accent px-2 py-0.5 text-xs font-mono text-accent-foreground">{`{{${v}}}`}</span>
                ))}
              </div>
              <div className="flex items-center gap-1 border-t border-border pt-3">
                <Button variant="ghost" size="sm" onClick={() => setPreviewing(tpl)}>
                  <Eye className="mr-1 h-3.5 w-3.5" /> Preview
                </Button>
                <Button variant="ghost" size="sm" onClick={() => openEditor(tpl)}>
                  <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => setDeleting(tpl)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor dialog */}
      <Dialog open={isEditing} onOpenChange={(open) => !open && closeEditor()}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto scrollbar-thin">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Template' : 'Create Template'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left: form */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Template name</Label>
                <Input
                  id="name"
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="pickup_scheduled"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Language</Label>
                  <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {languages.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="header">Header</Label>
                <Input
                  id="header"
                  value={form.header || ''}
                  onChange={(e) => setForm({ ...form, header: e.target.value })}
                  placeholder="Package Pickup Scheduled"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="body">Body</Label>
                <Textarea
                  id="body"
                  value={form.body || ''}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  placeholder="Hi {{customer_name}}, your package {{tracking_id}}..."
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">Use {'{{variable}}'} syntax for dynamic content.</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="footer">Footer</Label>
                <Input
                  id="footer"
                  value={form.footer || ''}
                  onChange={(e) => setForm({ ...form, footer: e.target.value })}
                  placeholder="SwiftDrop Logistics"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Buttons (one per line)</Label>
                <Textarea
                  value={(form.buttons || []).join('\n')}
                  onChange={(e) => setForm({ ...form, buttons: e.target.value.split('\n').filter(Boolean) })}
                  placeholder="Track Package&#10;Reschedule"
                  rows={2}
                />
              </div>
            </div>
            {/* Right: preview */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <WhatsAppPreview template={form} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEditor}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview dialog */}
      <Dialog open={!!previewing} onOpenChange={(open) => !open && setPreviewing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
          </DialogHeader>
          {previewing && <WhatsAppPreview template={previewing} />}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete template?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleting?.name}". This action cannot be undone.
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
