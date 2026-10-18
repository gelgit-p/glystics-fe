import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authenticatedFetch as fetch } from '@/lib/authenticated-fetch';
import {
  ArrowLeft,
  Send,
  Package,
  User,
  Truck,
  ExternalLink,
} from 'lucide-react';
import { StatusBadge, LoadingState, ErrorState } from '@/components/shared';
import { Button } from '@/components/ui/button';

interface DeliveryRecord {
  id: string;
  trackingId: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  senderLatitude: string | null;
  senderLongitude: string | null;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverLatitude: string | null;
  receiverLongitude: string | null;
  packageName: string;
  packageCategory: string;
  packageWeight: string;
  packageDimensions: string;
  packageValue: string;
  pickupDate: string;
  courier_name: string | null;
  courier_email: string | null;
  courier_phone: string | null;
  shipbubbleOrderId: string | null;
  tracking_url: string | null;
  package_amount: string | null;
  package_weight: string | null;
  shipping_fee: string | null;
  shipping_payment_type: string | null;
  shipping_payment_status: string | null;
  deliveryStatus: string;
  deliveryType: string;
  deliveryInstructions: string | null;
  createdAt: string;
  updatedAt: string;
}

const isOptionalString = (value: unknown): value is string | null =>
  value === null || typeof value === 'string';

const isDeliveryRecord = (value: unknown): value is DeliveryRecord => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === 'string' &&
    typeof record.trackingId === 'string' &&
    typeof record.senderName === 'string' &&
    typeof record.senderPhone === 'string' &&
    typeof record.senderAddress === 'string' &&
    isOptionalString(record.senderLatitude) &&
    isOptionalString(record.senderLongitude) &&
    typeof record.receiverName === 'string' &&
    typeof record.receiverPhone === 'string' &&
    typeof record.receiverAddress === 'string' &&
    isOptionalString(record.receiverLatitude) &&
    isOptionalString(record.receiverLongitude) &&
    typeof record.packageName === 'string' &&
    typeof record.packageCategory === 'string' &&
    typeof record.packageWeight === 'string' &&
    typeof record.packageDimensions === 'string' &&
    typeof record.packageValue === 'string' &&
    typeof record.pickupDate === 'string' &&
    isOptionalString(record.courier_name) &&
    isOptionalString(record.courier_email) &&
    isOptionalString(record.courier_phone) &&
    isOptionalString(record.shipbubbleOrderId) &&
    isOptionalString(record.tracking_url) &&
    isOptionalString(record.package_amount) &&
    isOptionalString(record.package_weight) &&
    isOptionalString(record.shipping_fee) &&
    isOptionalString(record.shipping_payment_type) &&
    isOptionalString(record.shipping_payment_status) &&
    typeof record.deliveryStatus === 'string' &&
    typeof record.deliveryType === 'string' &&
    isOptionalString(record.deliveryInstructions) &&
    typeof record.createdAt === 'string' &&
    typeof record.updatedAt === 'string'
  );
};

const formatStatus = (status: string) =>
  status.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDate = (date: string, options: Intl.DateTimeFormatOptions) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleString('en-NG', options);
};

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
  const userId = localStorage.getItem('userId');
  const { data: delivery, isLoading, error, refetch } = useQuery<DeliveryRecord>({
    queryKey: ['delivery-details', userId, id],
    queryFn: async () => {
      if (!id || !userId) {
        throw new Error('Delivery ID or logged-in user ID is missing.');
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/delivery/${encodeURIComponent(userId)}`,
        { headers: { accept: '*/*' } },
      );

      if (!response.ok) {
        throw new Error(
          `Unable to fetch delivery: ${response.status} ${response.statusText}`,
        );
      }

      const result: unknown = await response.json();
      if (!Array.isArray(result)) {
        throw new Error('Invalid deliveries response received from the server.');
      }

      const records = result.filter(isDeliveryRecord);
      if (records.length !== result.length) {
        throw new Error('Invalid delivery record received from the server.');
      }

      const matchingDelivery = records.find((record) => record.id === id);
      if (!matchingDelivery) {
        throw new Error('Delivery not found.');
      }

      return matchingDelivery;
    },
  });

  if (isLoading) return <LoadingState text="Loading delivery details..." />;
  if (error || !delivery) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Delivery not found'}
        onRetry={refetch}
      />
    );
  }

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
              <StatusBadge status={formatStatus(delivery.deliveryStatus)} />
              <span className="text-sm text-muted-foreground">
                Created {formatDate(delivery.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}
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
            {delivery.senderLatitude && delivery.senderLongitude && (
              <InfoRow
                label="Coordinates"
                value={`${delivery.senderLatitude}, ${delivery.senderLongitude}`}
              />
            )}
          </InfoCard>

          <InfoCard icon={User} title="Receiver">
            <InfoRow label="Name" value={delivery.receiverName} />
            <InfoRow label="Phone" value={delivery.receiverPhone} />
            <InfoRow label="Address" value={delivery.receiverAddress} />
            {delivery.receiverLatitude && delivery.receiverLongitude && (
              <InfoRow
                label="Coordinates"
                value={`${delivery.receiverLatitude}, ${delivery.receiverLongitude}`}
              />
            )}
          </InfoCard>

          <InfoCard icon={Package} title="Package Details">
            <InfoRow label="Package" value={delivery.packageName} />
            <InfoRow label="Category" value={delivery.packageCategory} />
            <InfoRow label="Weight" value={`${delivery.package_weight ?? delivery.packageWeight} kg`} />
            <InfoRow label="Dimensions" value={delivery.packageDimensions} />
            <InfoRow label="Value" value={delivery.package_amount ?? delivery.packageValue} />
          </InfoCard>

          <InfoCard icon={Truck} title="Delivery Info">
            <InfoRow label="Courier" value={delivery.courier_name ?? 'Not assigned'} />
            {delivery.courier_email && <InfoRow label="Courier email" value={delivery.courier_email} />}
            {delivery.courier_phone && <InfoRow label="Courier phone" value={delivery.courier_phone} />}
            <InfoRow label="Delivery type" value={delivery.deliveryType} />
            <InfoRow label="Pickup date" value={formatDate(delivery.pickupDate, { month: 'short', day: 'numeric', year: 'numeric' })} />
            {delivery.deliveryInstructions && (
              <div className="pt-1">
                <span className="text-muted-foreground">Instructions</span>
                <p className="mt-1 text-sm">{delivery.deliveryInstructions}</p>
              </div>
            )}
          </InfoCard>
        </div>

        {/* Shipment and payment details */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 text-base font-semibold">Shipment Details</h3>
            <div className="space-y-3 text-sm">
              {delivery.shipbubbleOrderId && (
                <InfoRow label="Shipbubble order ID" value={delivery.shipbubbleOrderId} />
              )}
              <InfoRow label="Tracking number" value={delivery.trackingId} />
              <InfoRow label="Status last updated" value={formatDate(delivery.updatedAt, { dateStyle: 'medium', timeStyle: 'short' })} />
              {delivery.tracking_url && (
                <a
                  href={delivery.tracking_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
                >
                  Track shipment <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 text-base font-semibold">Shipping Payment</h3>
            <div className="space-y-3 text-sm">
              <InfoRow label="Shipping fee" value={delivery.shipping_fee ?? 'Not available'} />
              <InfoRow label="Payment method" value={delivery.shipping_payment_type ?? 'Not available'} />
              <InfoRow label="Payment status" value={delivery.shipping_payment_status ? formatStatus(delivery.shipping_payment_status) : 'Not available'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
