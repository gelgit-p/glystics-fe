import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Send,
  Package,
  User,
  Truck,
  MapPin,
  Calendar,
  CheckCircle,
  Circle,
  MessageCircle,
  Weight,
  Box,
  DollarSign,
} from 'lucide-react';
import { api } from '@/lib/api';
import { StatusBadge, LoadingState, ErrorState } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function InfoCard({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4 text-muted-foreground" /> {title}
      </h3>
      <div className="space-y-2.5 text-sm">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

export default function DeliveryDetailsPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data: delivery, isLoading, error, refetch } = useQuery({
    queryKey: ['delivery', id],
    queryFn: () => api.getDelivery(id!),
  });

  if (isLoading) return <LoadingState text="Loading delivery details..." />;
  if (error || !delivery) return <ErrorState message="Delivery not found" onRetry={refetch} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link to="/deliveries">
            <Button variant="ghost" size="sm"><ArrowLeft className="mr-1 h-4 w-4" /> Back</Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Shipment {delivery.trackingId}</h1>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={delivery.status} />
              <span className="text-sm text-muted-foreground">
                Created {new Date(delivery.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
        <Button onClick={() => toast.success('WhatsApp notification sent!')}>
          <Send className="mr-2 h-4 w-4" /> Send Notification
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Info cards */}
        <div className="space-y-4 lg:col-span-1">
          <InfoCard icon={User} title="Sender">
            <InfoRow label="Name" value={delivery.senderName} />
            <InfoRow label="Phone" value={delivery.senderPhone} />
            <InfoRow label="Address" value={delivery.senderAddress} />
          </InfoCard>

          <InfoCard icon={User} title="Receiver">
            <InfoRow label="Name" value={delivery.receiverName} />
            <InfoRow label="Phone" value={delivery.receiverPhone} />
            <InfoRow label="Address" value={delivery.receiverAddress} />
          </InfoCard>

          <InfoCard icon={Package} title="Package Details">
            <InfoRow label="Package" value={delivery.packageName} />
            <InfoRow label="Category" value={delivery.category} />
            <InfoRow label="Weight" value={delivery.weight} />
            <InfoRow label="Dimensions" value={delivery.dimensions} />
            <InfoRow label="Value" value={delivery.value} />
          </InfoCard>

          <InfoCard icon={Truck} title="Delivery Info">
            <InfoRow label="Courier" value={delivery.courier} />
            <InfoRow label="Delivery type" value={delivery.deliveryType} />
            <InfoRow label="Pickup date" value={new Date(delivery.pickupDate).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })} />
            <div className="pt-1">
              <span className="text-muted-foreground">Instructions</span>
              <p className="mt-1 text-sm">{delivery.instructions}</p>
            </div>
          </InfoCard>
        </div>

        {/* Right: Timeline + WhatsApp activity */}
        <div className="space-y-6 lg:col-span-2">
          {/* Timeline */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-6 text-base font-semibold">Delivery Timeline</h3>
            <div className="space-y-0">
              {delivery.timeline.map((event, i) => (
                <div key={event.status} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    {event.completed ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                    ) : event.current ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-white">
                        <div className="h-3 w-3 rounded-full bg-primary" />
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-white">
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    {i < delivery.timeline.length - 1 && (
                      <div className={cn('h-12 w-0.5', event.completed ? 'bg-primary' : 'bg-border')} />
                    )}
                  </div>
                  <div className="pb-12 last:pb-0">
                    <p className={cn('text-sm font-medium', event.completed || event.current ? 'text-foreground' : 'text-muted-foreground')}>
                      {event.status}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {event.completed
                        ? new Date(event.timestamp).toLocaleString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : event.current
                          ? 'In progress'
                          : 'Pending'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp activity */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
              <MessageCircle className="h-5 w-5 text-primary" /> WhatsApp Activity
            </h3>
            {delivery.notifications.length === 0 ? (
              <div className="flex items-center gap-3 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                <MessageCircle className="h-5 w-5" /> No notifications sent yet for this delivery.
              </div>
            ) : (
              <div className="space-y-2">
                {delivery.notifications.map((n) => (
                  <div key={n.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium capitalize">{n.template.replace(/_/g, ' ')} notification sent</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(n.sentAt).toLocaleString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={n.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
