import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  CreditCard,
  Download,
  Check,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { api } from '@/lib/api';
import { usage as mockUsage, pricingPlans } from '@/lib/mock-data';
import { PageHeader, StatusBadge, LoadingState } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

function UsageBar({ label, used, total, color }: { label: string; used: number; total: number; color: string }) {
  const pct = Math.min((used / total) * 100, 100);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{used.toLocaleString()} / {total.toLocaleString()}</span>
      </div>
      <Progress value={pct} className="h-2" />
    </div>
  );
}

export default function BillingPage() {
  const { data: plan, isLoading: planLoading } = useQuery({ queryKey: ['billing-plan'], queryFn: () => api.getBillingPlan() });
  const { data: invoices, isLoading: invLoading } = useQuery({ queryKey: ['invoices'], queryFn: () => api.getInvoices() });

  return (
    <div>
      <PageHeader title="Billing" description="Manage your subscription, usage, and payment details." />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Current plan */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 text-base font-semibold">Current Plan</h3>
          {planLoading ? (
            <LoadingState />
          ) : plan ? (
            <>
              <div className="mb-4 rounded-lg bg-accent p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-accent-foreground">{plan.name}</span>
                  <span className="text-2xl font-bold">{plan.price}<span className="text-sm font-normal text-muted-foreground">/{plan.period}</span></span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Renews on {new Date(plan.renewalDate).toLocaleDateString('en-NG', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <Button variant="outline" className="w-full" onClick={() => toast.info('Opening plan settings...')}>
                Change Plan
              </Button>
            </>
          ) : null}
        </div>

        {/* Usage */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 text-base font-semibold">Usage This Period</h3>
          <div className="space-y-4">
            <UsageBar label="WhatsApp messages" used={mockUsage.whatsappMessages.used} total={mockUsage.whatsappMessages.total} color="primary" />
            <UsageBar label="Deliveries" used={mockUsage.deliveries.used} total={mockUsage.deliveries.total} color="blue" />
            <UsageBar label="Contacts" used={mockUsage.contacts.used} total={mockUsage.contacts.total} color="emerald" />
          </div>
        </div>

        {/* Payment method */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 text-base font-semibold">Payment Method</h3>
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">•••• •••• •••• 4242</p>
              <p className="text-xs text-muted-foreground">Visa · Expires 12/27</p>
            </div>
          </div>
          <Button variant="outline" className="mt-4 w-full" onClick={() => toast.info('Opening payment settings...')}>
            Update Payment Method
          </Button>
        </div>
      </div>

      {/* Pricing plans */}
      <div className="mt-8">
        <h3 className="mb-4 text-base font-semibold">Available Plans</h3>
        <div className="grid gap-4 lg:grid-cols-3">
          {pricingPlans.map((p) => (
            <div
              key={p.name}
              className={cn(
                'relative rounded-xl border p-6',
                p.current ? 'border-primary shadow-md' : 'border-border bg-card',
              )}
            >
              {p.current && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                  Current Plan
                </span>
              )}
              <h4 className="font-semibold">{p.name}</h4>
              <p className="mt-1 text-2xl font-bold">{p.price}<span className="text-sm font-normal text-muted-foreground">/{p.period}</span></p>
              <ul className="mt-4 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={p.current ? 'outline' : 'default'}
                className="mt-6 w-full"
                disabled={p.current}
                onClick={() => toast.success(`Switching to ${p.name} plan...`)}
              >
                {p.current ? 'Current Plan' : `Switch to ${p.name}`}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Billing history */}
      <div className="mt-8">
        <h3 className="mb-4 text-base font-semibold">Billing History</h3>
        <div className="rounded-xl border border-border bg-card">
          {invLoading ? (
            <LoadingState />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices?.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono text-xs font-medium">{inv.number}</TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {new Date(inv.date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="font-medium">{inv.amount}</TableCell>
                    <TableCell><StatusBadge status={inv.status} /></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => toast.success('Downloading invoice...')}>
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
