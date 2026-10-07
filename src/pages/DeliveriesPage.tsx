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
  ArrowLeft,
  Star,
  MapPin,
  Clock,
} from 'lucide-react';

import { api } from '@/lib/api';
import {
  PageHeader,
  StatusBadge,
  LoadingState,
  EmptyState,
} from '@/components/shared';

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

const statusOptions = [
  'all',
  'Created',
  'Pickup Scheduled',
  'Picked Up',
  'In Transit',
  'Out for Delivery',
  'Delivered',
  'Failed',
];

const serviceTypes = [
  {
    label: 'Drop off',
    value: 'dropoff',
  },
  {
    label: 'Pickup',
    value: 'pickup',
  },
];

interface ShippingCategory {
  category_id: number;
  category: string;
}

interface Courier {
  courier_id: string;
  courier_name: string;
  courier_image: string;
  service_code: string;

  insurance: {
    code: string;
    fee: number;
  };

  discount: {
    percentage: number;
    symbol: string;
    discounted: number;
  };

  service_type: string;
  waybill: boolean;
  on_demand: boolean;
  is_cod_available: boolean;
  tracking_level: number;

  ratings: number;
  votes: number;

  connected_account: boolean;

  rate_card_amount: number;
  rate_card_currency: string;

  pickup_eta: string;
  pickup_eta_time: string;

  dropoff_station: {
    name: string;
    address: string;
    phone: string | null;
  } | null;

  pickup_station: {
    name: string;
    address: string;
    phone: string | null;
  } | null;

  delivery_eta: string;
  delivery_eta_time: string;

  info: string | null;

  currency: string;
  vat: number;
  total: number;

  tracking: {
    bars: number;
    label: string;
  };
}

interface CheckoutData {
  ship_from: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };

  ship_to: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };

  currency: string;
  package_amount: number;
  package_weight: number;
  pickup_date: string;
  is_invoice_required: boolean;
  cod_policy: string;
}

interface RatesResponse {
  status: string;
  message: string;

  data: {
    request_token: string;
    couriers: Courier[];
    fastest_courier: Courier | null;
    cheapest_courier: Courier | null;
    checkout_data: CheckoutData;
  };
}

interface CategoryResponse {
  status: string;
  message: string;
  data: ShippingCategory[];
}

interface DeliveryFormState {
  senderAddressCode: string;
  receiverAddressCode: string;

  packageName: string;
  packageDescription: string;

  categoryId: string;

  weight: string;
  amount: string;
  quantity: string;

  length: string;
  width: string;
  height: string;

  pickupDate: string;
  serviceType: string;

  instructions: string;
}

const initialFormState: DeliveryFormState = {
  senderAddressCode: '',
  receiverAddressCode: '',

  packageName: '',
  packageDescription: '',

  categoryId: '',

  weight: '',
  amount: '',
  quantity: '1',

  length: '',
  width: '',
  height: '',

  pickupDate: '',
  serviceType: 'dropoff',

  instructions: '',
};

export default function DeliveriesPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [courier, setCourier] = useState('all');

  const [createOpen, setCreateOpen] = useState(false);

  /**
   * Step 1 = shipment form
   * Step 2 = courier selection
   */
  const [step, setStep] = useState<1 | 2>(1);

  const [fetchingRates, setFetchingRates] = useState(false);
  const [bookingCourierId, setBookingCourierId] = useState<string | null>(
    null,
  );

  const [formData, setFormData] =
    useState<DeliveryFormState>(initialFormState);

  const [rates, setRates] = useState<RatesResponse['data'] | null>(null);

  /**
   * Existing deliveries
   */
  const {
    data: deliveries,
    isLoading,
  } = useQuery({
    queryKey: ['deliveries', { search, status, courier }],
    queryFn: () =>
      api.getDeliveries({
        search,
        status,
        courier,
      }),
  });

  /**
   * Fetch Shipbubble categories
   */
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useQuery<ShippingCategory[]>({
    queryKey: ['shipping-categories'],

    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/shipping/labels/categories`,
        {
          method: 'GET',
          headers: {
            accept: '*/*',
          },
        },
      );

      if (!response.ok) {
        throw new Error('Unable to fetch shipping categories');
      }

      const result: CategoryResponse = await response.json();

      if (result.status !== 'success') {
        throw new Error(
          result.message || 'Unable to fetch shipping categories',
        );
      }

      return result.data ?? [];
    },

    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  const updateForm = (
    field: keyof DeliveryFormState,
    value: string,
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const resetDeliveryDialog = () => {
    setStep(1);
    setRates(null);
    setFetchingRates(false);
    setBookingCourierId(null);
    setFormData(initialFormState);
  };

  const handleDialogChange = (open: boolean) => {
    setCreateOpen(open);

    if (!open) {
      resetDeliveryDialog();
    }
  };

  /**
   * STEP 1
   *
   * Submit shipment information to:
   *
   * POST /shipping/fetch_rates
   */
  const handleFetchRates = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (!formData.categoryId) {
      toast.error('Please select a package category');
      return;
    }

    if (!formData.senderAddressCode) {
      toast.error('Sender address code is required');
      return;
    }

    if (!formData.receiverAddressCode) {
      toast.error('Receiver address code is required');
      return;
    }

    if (!formData.packageName) {
      toast.error('Package name is required');
      return;
    }

    if (!formData.weight || Number(formData.weight) <= 0) {
      toast.error('Enter a valid package weight');
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error('Enter a valid package value');
      return;
    }

    if (!formData.pickupDate) {
      toast.error('Pickup date is required');
      return;
    }

    setFetchingRates(true);

    try {
      const payload = {
        sender_address_code: Number(
          formData.senderAddressCode,
        ),

        reciever_address_code: Number(
          formData.receiverAddressCode,
        ),

        pickup_date: formData.pickupDate,

        category_id: Number(formData.categoryId),

        package_items: [
          {
            name: formData.packageName,

            description:
              formData.packageDescription ||
              formData.packageName,

            unit_weight: Number(formData.weight),

            unit_amount: Number(formData.amount),

            quantity: Number(formData.quantity || 1),
          },
        ],

        package_dimension: {
          length: Number(formData.length || 0),
          width: Number(formData.width || 0),
          height: Number(formData.height || 0),
        },

        service_type: formData.serviceType,

        delivery_instructions:
          formData.instructions || '',
      };

      console.log('Fetch rates payload:', payload);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/shipping/fetch_rates`,
        {
          method: 'POST',

          headers: {
            accept: '*/*',
            'Content-Type': 'application/json',
          },

          body: JSON.stringify(payload),
        },
      );

      const result: RatesResponse = await response.json();

      console.log('Fetch rates response:', result);

      if (!response.ok) {
        throw new Error(
          result?.message || 'Unable to fetch delivery rates',
        );
      }

      if (result.status !== 'success') {
        throw new Error(
          result.message || 'Unable to fetch delivery rates',
        );
      }

      if (!result.data?.couriers?.length) {
        toast.error(
          'No delivery companies are available for this shipment.',
        );

        return;
      }

      setRates(result.data);

      setStep(2);

      toast.success(
        `${result.data.couriers.length} delivery option${
          result.data.couriers.length === 1 ? '' : 's'
        } found`,
      );
    } catch (error) {
      console.error('Fetch rates error:', error);

      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to fetch delivery rates',
      );
    } finally {
      setFetchingRates(false);
    }
  };

  /**
   * STEP 2
   *
   * Currently selects the courier.
   *
   * Put your Shipbubble booking endpoint here when ready.
   */
  const handleBookCourier = async (selectedCourier: Courier) => {
    if (!rates) {
      return;
    }

    setBookingCourierId(selectedCourier.courier_id);

    try {
      console.log('Selected courier:', selectedCourier);

      console.log('Request token:', rates.request_token);

      /**
       * Add the actual booking API here.
       *
       * Example payload you will normally need:
       *
       * {
       *   request_token: rates.request_token,
       *   courier_id: selectedCourier.courier_id
       * }
       */

      toast.success(
        `${selectedCourier.courier_name} selected`,
      );

      /**
       * Do NOT close the dialog yet until your
       * actual booking endpoint succeeds.
       */

      // setCreateOpen(false);
      // resetDeliveryDialog();
      // queryClient.invalidateQueries({
      //   queryKey: ['deliveries'],
      // });
    } catch (error) {
      console.error('Booking error:', error);

      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to book courier',
      );
    } finally {
      setBookingCourierId(null);
    }
  };

  const formatMoney = (
    amount: number,
    currency = 'NGN',
  ) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isFastest = (item: Courier) => {
    return (
      rates?.fastest_courier?.courier_id ===
      item.courier_id
    );
  };

  const isCheapest = (item: Courier) => {
    return (
      rates?.cheapest_courier?.courier_id ===
      item.courier_id
    );
  };

  return (
    <div>
      <PageHeader
        title="Deliveries"
        description="Manage and track all your deliveries."
      >
        <Button
          variant="outline"
          onClick={() =>
            toast.success('Exporting deliveries...')
          }
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>

        <Dialog
          open={createOpen}
          onOpenChange={handleDialogChange}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Delivery
            </Button>
          </DialogTrigger>

          <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto scrollbar-thin">
            <DialogHeader>
              <DialogTitle>
                {step === 1
                  ? 'Create New Delivery'
                  : 'Choose Delivery Company'}
              </DialogTitle>
            </DialogHeader>

            {/* Step indicator */}

            <div className="flex items-center gap-3 border-b pb-4">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                    step >= 1
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  1
                </div>

                <span className="text-sm font-medium">
                  Shipment
                </span>
              </div>

              <div className="h-px flex-1 bg-border" />

              <div className="flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                    step >= 2
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  2
                </div>

                <span className="text-sm font-medium">
                  Courier
                </span>
              </div>
            </div>

            {/* ================================ */}
            {/* STEP 1                           */}
            {/* ================================ */}

            {step === 1 && (
              <form
                onSubmit={handleFetchRates}
                className="space-y-6"
              >
                {/* Addresses */}

                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Delivery Addresses
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="senderAddressCode">
                        Sender address code
                      </Label>

                      <Input
                        id="senderAddressCode"
                        type="number"
                        required
                        placeholder="117709171"
                        value={formData.senderAddressCode}
                        onChange={(e) =>
                          updateForm(
                            'senderAddressCode',
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="receiverAddressCode">
                        Receiver address code
                      </Label>

                      <Input
                        id="receiverAddressCode"
                        type="number"
                        required
                        placeholder="382978966"
                        value={
                          formData.receiverAddressCode
                        }
                        onChange={(e) =>
                          updateForm(
                            'receiverAddressCode',
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Package */}

                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    Package
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="packageName">
                        Package name
                      </Label>

                      <Input
                        id="packageName"
                        required
                        placeholder="Wireless Headphones"
                        value={formData.packageName}
                        onChange={(e) =>
                          updateForm(
                            'packageName',
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label>Category</Label>

                      <Select
                        value={formData.categoryId}
                        onValueChange={(value) =>
                          updateForm(
                            'categoryId',
                            value,
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              categoriesLoading
                                ? 'Loading categories...'
                                : 'Select category'
                            }
                          />
                        </SelectTrigger>

                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem
                              key={category.category_id}
                              value={String(
                                category.category_id,
                              )}
                            >
                              {category.category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {categoriesError && (
                        <p className="text-xs text-destructive">
                          Unable to load categories.
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="packageDescription">
                        Description
                      </Label>

                      <Textarea
                        id="packageDescription"
                        placeholder="Electronics - Audio device"
                        rows={2}
                        value={
                          formData.packageDescription
                        }
                        onChange={(e) =>
                          updateForm(
                            'packageDescription',
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="weight">
                        Weight (kg)
                      </Label>

                      <Input
                        id="weight"
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        placeholder="0.5"
                        value={formData.weight}
                        onChange={(e) =>
                          updateForm(
                            'weight',
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="amount">
                        Package value
                      </Label>

                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        placeholder="99.99"
                        value={formData.amount}
                        onChange={(e) =>
                          updateForm(
                            'amount',
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="quantity">
                        Quantity
                      </Label>

                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        required
                        value={formData.quantity}
                        onChange={(e) =>
                          updateForm(
                            'quantity',
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Dimensions */}

                <div>
                  <h3 className="mb-3 text-sm font-semibold">
                    Package Dimensions
                  </h3>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="length">
                        Length
                      </Label>

                      <Input
                        id="length"
                        type="number"
                        min="0"
                        placeholder="10"
                        value={formData.length}
                        onChange={(e) =>
                          updateForm(
                            'length',
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="width">
                        Width
                      </Label>

                      <Input
                        id="width"
                        type="number"
                        min="0"
                        placeholder="8"
                        value={formData.width}
                        onChange={(e) =>
                          updateForm(
                            'width',
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="height">
                        Height
                      </Label>

                      <Input
                        id="height"
                        type="number"
                        min="0"
                        placeholder="6"
                        value={formData.height}
                        onChange={(e) =>
                          updateForm(
                            'height',
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery */}

                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    Delivery
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="pickupDate">
                        Pickup date
                      </Label>

                      <Input
                        id="pickupDate"
                        type="date"
                        required
                        value={formData.pickupDate}
                        onChange={(e) =>
                          updateForm(
                            'pickupDate',
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label>Service type</Label>

                      <Select
                        value={formData.serviceType}
                        onValueChange={(value) =>
                          updateForm(
                            'serviceType',
                            value,
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                          {serviceTypes.map((type) => (
                            <SelectItem
                              key={type.value}
                              value={type.value}
                            >
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="instructions">
                        Delivery instructions
                      </Label>

                      <Textarea
                        id="instructions"
                        placeholder="Leave at the front door."
                        rows={2}
                        value={formData.instructions}
                        onChange={(e) =>
                          updateForm(
                            'instructions',
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-border pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      handleDialogChange(false)
                    }
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={
                      fetchingRates ||
                      categoriesLoading
                    }
                  >
                    {fetchingRates ? (
                      'Fetching rates...'
                    ) : (
                      <>
                        <Truck className="mr-2 h-4 w-4" />
                        Get Delivery Rates
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}

            {/* ================================ */}
            {/* STEP 2                           */}
            {/* ================================ */}

            {step === 2 && rates && (
              <div className="space-y-5">
                {/* Shipment summary */}

                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold">
                      Shipment Summary
                    </h3>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep(1)}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </div>

                  <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        From
                      </p>

                      <p className="font-medium">
                        {rates.checkout_data.ship_from.name}
                      </p>

                      <p className="text-muted-foreground">
                        {
                          rates.checkout_data.ship_from
                            .address
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        To
                      </p>

                      <p className="font-medium">
                        {rates.checkout_data.ship_to.name}
                      </p>

                      <p className="text-muted-foreground">
                        {
                          rates.checkout_data.ship_to
                            .address
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Package weight
                      </p>

                      <p className="font-medium">
                        {
                          rates.checkout_data
                            .package_weight
                        }{' '}
                        kg
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Pickup date
                      </p>

                      <p className="font-medium">
                        {
                          rates.checkout_data
                            .pickup_date
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold">
                    Available Delivery Companies
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    Choose a courier to continue with
                    your delivery.
                  </p>
                </div>

                {/* Courier list */}

                <div className="space-y-3">
                  {rates.couriers.map(
                    (deliveryCourier) => (
                      <div
                        key={
                          deliveryCourier.courier_id
                        }
                        className="rounded-xl border bg-card p-4 transition-colors hover:border-primary/40"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex gap-3">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white p-1">
                              {deliveryCourier.courier_image ? (
                                <img
                                  src={
                                    deliveryCourier.courier_image
                                  }
                                  alt={
                                    deliveryCourier.courier_name
                                  }
                                  className="h-full w-full object-contain"
                                />
                              ) : (
                                <Truck className="h-6 w-6 text-muted-foreground" />
                              )}
                            </div>

                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="font-semibold">
                                  {
                                    deliveryCourier.courier_name
                                  }
                                </h4>

                                {isCheapest(
                                  deliveryCourier,
                                ) && (
                                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700">
                                    Cheapest
                                  </span>
                                )}

                                {isFastest(
                                  deliveryCourier,
                                ) && (
                                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                                    Fastest
                                  </span>
                                )}
                              </div>

                              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Star className="h-3.5 w-3.5" />

                                  {
                                    deliveryCourier.ratings
                                  }

                                  <span>
                                    (
                                    {
                                      deliveryCourier.votes
                                    }{' '}
                                    votes)
                                  </span>
                                </span>

                                <span className="capitalize">
                                  {
                                    deliveryCourier.service_type
                                  }
                                </span>

                                <span>
                                  Tracking:{' '}
                                  {
                                    deliveryCourier
                                      .tracking.label
                                  }
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="sm:text-right">
                            <p className="text-xl font-bold">
                              {formatMoney(
                                deliveryCourier.total,
                                deliveryCourier.currency,
                              )}
                            </p>

                            {deliveryCourier.discount
                              ?.percentage > 0 && (
                              <p className="text-xs text-green-600">
                                {
                                  deliveryCourier
                                    .discount.percentage
                                }
                                {
                                  deliveryCourier
                                    .discount.symbol
                                }{' '}
                                discount
                              </p>
                            )}

                            <p className="text-xs text-muted-foreground">
                              VAT:{' '}
                              {formatMoney(
                                deliveryCourier.vat,
                                deliveryCourier.currency,
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 border-t pt-4 text-sm sm:grid-cols-2">
                          <div>
                            <p className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              Pickup
                            </p>

                            <p>
                              {
                                deliveryCourier.pickup_eta
                              }
                            </p>
                          </div>

                          <div>
                            <p className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                              <Truck className="h-3.5 w-3.5" />
                              Delivery
                            </p>

                            <p>
                              {
                                deliveryCourier.delivery_eta
                              }
                            </p>
                          </div>
                        </div>

                        {deliveryCourier.pickup_station && (
                          <div className="mt-3 rounded-lg bg-muted/40 p-3">
                            <p className="mb-1 text-xs font-semibold">
                              Pickup station
                            </p>

                            <p className="text-sm font-medium">
                              {
                                deliveryCourier
                                  .pickup_station.name
                              }
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {
                                deliveryCourier
                                  .pickup_station.address
                              }
                            </p>
                          </div>
                        )}

                        {deliveryCourier.dropoff_station && (
                          <div className="mt-3 rounded-lg bg-muted/40 p-3">
                            <p className="mb-1 text-xs font-semibold">
                              Drop-off station
                            </p>

                            <p className="text-sm font-medium">
                              {
                                deliveryCourier
                                  .dropoff_station.name
                              }
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {
                                deliveryCourier
                                  .dropoff_station.address
                              }
                            </p>
                          </div>
                        )}

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <div className="text-xs text-muted-foreground">
                            {deliveryCourier.is_cod_available
                              ? 'Cash on delivery available'
                              : 'Cash on delivery unavailable'}
                          </div>

                          <Button
                            onClick={() =>
                              handleBookCourier(
                                deliveryCourier,
                              )
                            }
                            disabled={
                              bookingCourierId !== null
                            }
                          >
                            {bookingCourierId ===
                            deliveryCourier.courier_id
                              ? 'Booking...'
                              : 'Book Now'}
                          </Button>
                        </div>
                      </div>
                    ),
                  )}
                </div>

                <div className="flex justify-between border-t pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() =>
                      handleDialogChange(false)
                    }
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
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
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="pl-9"
          />
        </div>

        <Select
          value={status}
          onValueChange={setStatus}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>

          <SelectContent>
            {statusOptions.map((item) => (
              <SelectItem
                key={item}
                value={item}
              >
                {item === 'all'
                  ? 'All statuses'
                  : item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Deliveries Table */}

      <div className="rounded-xl border border-border bg-card">
        {isLoading ? (
          <LoadingState />
        ) : !deliveries ||
          deliveries.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No deliveries found"
            description="Try adjusting your filters or create a new delivery to get started."
            action={
              <Button
                onClick={() =>
                  setCreateOpen(true)
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Delivery
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking ID</TableHead>
                <TableHead>Customer</TableHead>

                <TableHead className="hidden md:table-cell">
                  Phone
                </TableHead>

                <TableHead className="hidden lg:table-cell">
                  Origin
                </TableHead>

                <TableHead className="hidden lg:table-cell">
                  Destination
                </TableHead>

                <TableHead className="hidden xl:table-cell">
                  Courier
                </TableHead>

                <TableHead>Status</TableHead>

                <TableHead className="hidden lg:table-cell">
                  Created
                </TableHead>

                <TableHead className="text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {deliveries.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell>
                    <Link
                      to={`/deliveries/${delivery.id}`}
                      className="font-mono text-xs font-medium text-primary hover:underline"
                    >
                      {delivery.trackingId}
                    </Link>
                  </TableCell>

                  <TableCell className="font-medium">
                    {delivery.receiverName}
                  </TableCell>

                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    {delivery.receiverPhone}
                  </TableCell>

                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                    {delivery.origin}
                  </TableCell>

                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                    {delivery.destination}
                  </TableCell>

                  <TableCell className="hidden text-sm text-muted-foreground xl:table-cell">
                    {delivery.courier}
                  </TableCell>

                  <TableCell>
                    <StatusBadge
                      status={delivery.status}
                    />
                  </TableCell>

                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                    {new Date(
                      delivery.createdAt,
                    ).toLocaleDateString(
                      'en-NG',
                      {
                        month: 'short',
                        day: 'numeric',
                      },
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <Link
                          to={`/deliveries/${delivery.id}`}
                        >
                          <DropdownMenuItem className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                        </Link>

                        <Link
                          to={`/deliveries/${delivery.id}`}
                        >
                          <DropdownMenuItem className="cursor-pointer">
                            <Truck className="mr-2 h-4 w-4" />
                            Track
                          </DropdownMenuItem>
                        </Link>

                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() =>
                            toast.success(
                              `Notification sent to ${delivery.receiverName}`,
                            )
                          }
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Send notification
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