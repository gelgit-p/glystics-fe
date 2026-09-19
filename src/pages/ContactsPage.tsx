import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Users,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Send,
  MoreHorizontal,
} from 'lucide-react';
import { api } from '@/lib/api';
import { PageHeader, StatusBadge, LoadingState, EmptyState } from '@/components/shared';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Contact } from '@/types';

export default function ContactsPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Contact | null>(null);

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['contacts', search],
    queryFn: () => api.getContacts(search),
  });

  const selectedDeliveries = selected
    ? [] // In a real app, filter deliveries by contact
    : [];

  return (
    <div>
      <PageHeader title="Contacts" description="Manage your customers and recipients." />

      <div className="mb-4 relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-xl border border-border bg-card">
        {isLoading ? (
          <LoadingState />
        ) : !contacts || contacts.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No contacts found"
            description="No contacts match your search."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="hidden md:table-cell">Total Deliveries</TableHead>
                <TableHead className="hidden lg:table-cell">Last Delivery</TableHead>
                <TableHead>WhatsApp Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((c) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer"
                  onClick={() => setSelected(c)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">
                          {c.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{c.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.phone}</TableCell>
                  <TableCell className="hidden md:table-cell font-medium">{c.totalDeliveries}</TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                    {new Date(c.lastDelivery).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
                  </TableCell>
                  <TableCell><StatusBadge status={c.whatsappStatus} /></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Detail drawer */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="overflow-y-auto scrollbar-thin sm:max-w-md">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>Contact Details</SheetTitle>
              </SheetHeader>
              <div className="space-y-5 px-4 pb-6">
                {/* Avatar + name */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-accent text-lg font-semibold text-accent-foreground">
                      {selected.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-bold">{selected.name}</h3>
                    <StatusBadge status={selected.whatsappStatus} />
                  </div>
                </div>

                {/* Contact info */}
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Contact Information</h4>
                  <div className="rounded-lg border border-border p-3 space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selected.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selected.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{selected.address}</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Package className="h-3.5 w-3.5" /> Total Deliveries
                    </div>
                    <p className="mt-1 text-xl font-bold">{selected.totalDeliveries}</p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Send className="h-3.5 w-3.5" /> Last Delivery
                    </div>
                    <p className="mt-1 text-sm font-medium">
                      {new Date(selected.lastDelivery).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Delivery history */}
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Delivery History</h4>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-sm text-muted-foreground">No recent deliveries to show.</p>
                  </div>
                </div>

                {/* Notification history */}
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Notification History</h4>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-sm text-muted-foreground">No notifications sent to this contact.</p>
                  </div>
                </div>

                <Button className="w-full" onClick={() => {}}>
                  <MessageCircle className="mr-2 h-4 w-4" /> Send WhatsApp Message
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
