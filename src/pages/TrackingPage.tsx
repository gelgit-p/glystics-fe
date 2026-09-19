import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MessageCircle,
  Check,
  Package,
  Truck,
  MapPin,
  User,
  Phone,
  Calendar,
  ArrowRight,
  Circle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { StatusBadge, LoadingState, ErrorState } from '@/components/shared';
import { cn } from '@/lib/utils';

export default function TrackingPage() {
  const { trackingId } = useParams();

  const { data: delivery, isLoading, error, refetch } = useQuery({
    queryKey: ['track', trackingId],
    queryFn: () => api.getDelivery(trackingId!),
  });

  if (isLoading) return <LoadingState text="Loading tracking info..." />;
  if (error || !delivery) return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <ErrorState message="Tracking ID not found" onRetry={refetch} />
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MessageCircle className="h-5 w-5" />
            </div>
            <span className="font-bold">WhatsApp Notify</span>
          </Link>
          <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Sign in
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Tracking header */}
        <div className="mb-6 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Tracking Number</p>
              <h1 className="text-xl font-bold font-mono">{delivery.trackingId}</h1>
            </div>
            <StatusBadge status={delivery.status} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm">
            <div>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> From</p>
              <p className="font-medium">{delivery.origin}</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> To</p>
              <p className="font-medium">{delivery.destination}</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-6 rounded-xl border border-border bg-card p-6">
          <h2 className="mb-6 text-base font-semibold">Delivery Timeline</h2>
          <div className="space-y-0">
            {delivery.timeline.map((event, i) => (
              <div key={event.status} className="flex gap-4">
                <div className="flex flex-col items-center">
                  {event.completed ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-5 w-5" />
                    </div>
                  ) : event.current ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-white">
                      <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-white">
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  {i < delivery.timeline.length - 1 && (
                    <div className={cn('h-10 w-0.5', event.completed ? 'bg-primary' : 'bg-border')} />
                  )}
                </div>
                <div className="pb-8 last:pb-0">
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

        {/* Delivery details */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <User className="h-4 w-4 text-muted-foreground" /> Sender
            </h3>
            <div className="space-y-1.5 text-sm">
              <p className="font-medium">{delivery.senderName}</p>
              <p className="text-muted-foreground">{delivery.senderPhone}</p>
              <p className="text-muted-foreground">{delivery.senderAddress}</p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <User className="h-4 w-4 text-muted-foreground" /> Receiver
            </h3>
            <div className="space-y-1.5 text-sm">
              <p className="font-medium">{delivery.receiverName}</p>
              <p className="text-muted-foreground">{delivery.receiverPhone}</p>
              <p className="text-muted-foreground">{delivery.receiverAddress}</p>
            </div>
          </div>
        </div>

        {/* Package info */}
        <div className="mt-4 rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Package className="h-4 w-4 text-muted-foreground" /> Package
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div><p className="text-xs text-muted-foreground">Package</p><p className="font-medium">{delivery.packageName}</p></div>
            <div><p className="text-xs text-muted-foreground">Weight</p><p className="font-medium">{delivery.weight}</p></div>
            <div><p className="text-xs text-muted-foreground">Courier</p><p className="font-medium">{delivery.courier}</p></div>
            <div><p className="text-xs text-muted-foreground">Type</p><p className="font-medium">{delivery.deliveryType}</p></div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 rounded-xl bg-primary p-6 text-center">
          <h2 className="text-lg font-bold text-primary-foreground">Want notifications like this for your business?</h2>
          <p className="mt-1 text-sm text-primary-foreground/80">Start sending automated WhatsApp delivery updates today.</p>
          <Link to="/register" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-primary">
            Get Started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
