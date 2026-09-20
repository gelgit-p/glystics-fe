import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Plus,
  Download,
  Search,
  MoreHorizontal,
  Eye,
  Send,
  Truck,
  Package,
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const statusOptions = ['all', 'Created', 'Pickup Scheduled', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Failed'];
// const courierOptions = ['all', 'Swift Rider', 'ExpressGo', 'DeliverFast', 'Nigeria Post', 'Flash Courier'];
const categories = ['Electronics', 'Documents', 'Clothing', 'Food', 'Pharmacy', 'Books', 'Other'];
const deliveryTypes = ['Standard', 'Express'];

export default function DeliveriesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [courier, setCourier] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const { data: deliveries, isLoading } = useQuery({
    queryKey: ['deliveries', { search, status, courier }],
    queryFn: () => api.getDeliveries({ search, status, courier }),
  });

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreating(true);
    const form = new FormData(e.currentTarget);
    await api.createDelivery({
      senderName: form.get('senderName') as string,
      senderPhone: form.get('senderPhone') as string,
      senderAddress: form.get('senderAddress') as string,
      receiverName: form.get('receiverName') as string,
      receiverPhone: form.get('receiverPhone') as string,
      receiverAddress: form.get('receiverAddress') as string,
      packageName: form.get('packageName') as string,
      category: form.get('category') as string,
      weight: form.get('weight') as string,
      dimensions: form.get('dimensions') as string,
      value: form.get('value') as string,
      pickupDate: form.get('pickupDate') as string,
      deliveryType: form.get('deliveryType') as string,
      courier: form.get('courier') as string,
      instructions: form.get('instructions') as string,
      origin: form.get('senderAddress') as string,
      destination: form.get('receiverAddress') as string,
    });
    setCreating(false);
    setCreateOpen(false);
    toast.success('Delivery created successfully!');
    queryClient.invalidateQueries({ queryKey: ['deliveries'] });
  };

  return (
    <div>
      <PageHeader title="Deliveries" description="Manage and track all your deliveries.">
        <Button variant="outline" onClick={() => toast.success('Exporting deliveries...')}>
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Delivery
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto scrollbar-thin">
            <DialogHeader>
              <DialogTitle>Create New Delivery</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-6">
              {/* Sender */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Package className="h-4 w-4 text-muted-foreground" /> Sender
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="senderName">Name</Label>
                    <Input id="senderName" name="senderName" required placeholder="Adebayo Johnson" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="senderPhone">Phone</Label>
                    <Input id="senderPhone" name="senderPhone" required placeholder="+234 801 234 5678" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="senderAddress">Address</Label>
                    <Textarea id="senderAddress" name="senderAddress" required placeholder="10 Main St, Lagos" rows={2} />
                  </div>
                </div>
              </div>

              {/* Receiver */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Truck className="h-4 w-4 text-muted-foreground" /> Receiver
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="receiverName">Name</Label>
                    <Input id="receiverName" name="receiverName" required placeholder="Chioma Eze" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="receiverPhone">Phone</Label>
                    <Input id="receiverPhone" name="receiverPhone" required placeholder="+234 802 345 6789" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="receiverAddress">Address</Label>
                    <Textarea id="receiverAddress" name="receiverAddress" required placeholder="5 Adeola St, Abuja" rows={2} />
                  </div>
                </div>
              </div>

              {/* Package */}
              <div>
                <h3 className="mb-3 text-sm font-semibold">Package</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="packageName">Package name</Label>
                    <Input id="packageName" name="packageName" required placeholder="Package 1" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" defaultValue="Electronics">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="weight">Weight</Label>
                    <Input id="weight" name="weight" placeholder="2.5 kg" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="dimensions">Dimensions</Label>
                    <Input id="dimensions" name="dimensions" placeholder="20x15x10 cm" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="value">Value</Label>
                    <Input id="value" name="value" placeholder="₦5,000" />
                  </div>
                </div>
              </div>

              {/* Delivery */}
              <div>
                <h3 className="mb-3 text-sm font-semibold">Delivery</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="pickupDate">Pickup date</Label>
                    <Input id="pickupDate" name="pickupDate" type="date" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="deliveryType">Delivery type</Label>
                    <Select name="deliveryType" defaultValue="Standard">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {deliveryTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="instructions">Delivery instructions</Label>
                    <Textarea id="instructions" name="instructions" placeholder="Handle with care. Ring bell on arrival." rows={2} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Delivery'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tracking ID, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            {statusOptions.map((s) => <SelectItem key={s} value={s}>{s === 'all' ? 'All statuses' : s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card">
        {isLoading ? (
          <LoadingState />
        ) : !deliveries || deliveries.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No deliveries found"
            description="Try adjusting your filters or create a new delivery to get started."
            action={<Button><Plus className="mr-2 h-4 w-4" /> Create Delivery</Button>}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead className="hidden lg:table-cell">Origin</TableHead>
                <TableHead className="hidden lg:table-cell">Destination</TableHead>
                <TableHead className="hidden xl:table-cell">Courier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <Link to={`/deliveries/${d.id}`} className="font-mono text-xs font-medium text-primary hover:underline">
                      {d.trackingId}
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium">{d.receiverName}</TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">{d.receiverPhone}</TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">{d.origin}</TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">{d.destination}</TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground xl:table-cell">{d.courier}</TableCell>
                  <TableCell><StatusBadge status={d.status} /></TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                    {new Date(d.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link to={`/deliveries/${d.id}`}>
                          <DropdownMenuItem className="cursor-pointer"><Eye className="mr-2 h-4 w-4" /> View</DropdownMenuItem>
                        </Link>
                        <Link to={`/deliveries/${d.id}`}>
                          <DropdownMenuItem className="cursor-pointer"><Truck className="mr-2 h-4 w-4" /> Track</DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => toast.success(`Notification sent to ${d.receiverName}`)}>
                          <Send className="mr-2 h-4 w-4" /> Send notification
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
