import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useState } from 'react';
import { PageHeader, LoadingState, ErrorState } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminApi } from '@/lib/admin-api';

export default function AdminDeliveryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['admin-delivery', id], queryFn: () => adminApi.delivery(id!), enabled: !!id });
  const [deliveryStatus, setDeliveryStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [bookingStatus, setBookingStatus] = useState('');
  const save = useMutation({
    mutationFn: () => adminApi.updateDelivery(id!, { ...(deliveryStatus ? { deliveryStatus } : {}), ...(paymentStatus ? { paymentStatus } : {}), ...(bookingStatus ? { bookingStatus } : {}) }),
    onSuccess: () => { toast.success('Delivery updated'); qc.invalidateQueries({ queryKey: ['admin-delivery', id] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Update failed'),
  });
  if (isLoading) return <LoadingState />;
  if (error || !data) return <ErrorState onRetry={() => refetch()} />;
  return (
    <div>
      <PageHeader title={`Delivery ${data.trackingId}`} description={`${data.senderName} → ${data.receiverName}`} />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-4 text-sm">
          <h3 className="font-semibold">Details</h3>
          <dl className="mt-2 space-y-1">
            {[['Status', data.deliveryStatus], ['Payment', `${data.paymentStatus}${data.paymentAmount ? ` · ${data.paymentAmount} ${data.paymentCurrency ?? ''}` : ''}`], ['Booking', data.bookingStatus], ['Courier', data.courier_name ?? '—'], ['Owner', data.owner ? `${data.owner.businessName} (${data.owner.email})` : '—'], ['Pickup date', data.pickupDate], ['Package', `${data.packageName} · ${data.packageWeight} · ${data.packageValue}`]].map(([k, v]) => <div key={k as string} className="flex justify-between gap-4"><dt className="text-muted-foreground">{k}</dt><dd className="text-right">{String(v ?? '—')}</dd></div>)}
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Sender</dt><dd className="text-right">{data.senderName} · {data.senderPhone}<br />{data.senderAddress}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Receiver</dt><dd className="text-right">{data.receiverName} · {data.receiverPhone}<br />{data.receiverAddress}</dd></div>
          </dl>
        </div>
        <div className="rounded-xl border bg-card p-4 text-sm">
          <h3 className="font-semibold">Update status (where permitted)</h3>
          <div className="mt-3 space-y-3">
            <label className="block">Delivery status<Select value={deliveryStatus} onValueChange={setDeliveryStatus}><SelectTrigger className="mt-1"><SelectValue placeholder={data.deliveryStatus ?? 'Select'} /></SelectTrigger><SelectContent>{['CREATED', 'PAYMENT_PENDING', 'CONFIRMED', 'BOOKED', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'CANCELLED'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></label>
            <label className="block">Payment status<Select value={paymentStatus} onValueChange={setPaymentStatus}><SelectTrigger className="mt-1"><SelectValue placeholder={data.paymentStatus} /></SelectTrigger><SelectContent>{['PENDING', 'PAID', 'FAILED', 'REFUNDED'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></label>
            <label className="block">Booking status<Select value={bookingStatus} onValueChange={setBookingStatus}><SelectTrigger className="mt-1"><SelectValue placeholder={data.bookingStatus} /></SelectTrigger><SelectContent>{['NOT_STARTED', 'BOOKED', 'FAILED', 'CANCELLED'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></label>
            <Button disabled={save.isPending || (!deliveryStatus && !paymentStatus && !bookingStatus)} onClick={() => save.mutate()}>Save changes</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
