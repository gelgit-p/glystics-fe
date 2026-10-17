import { useEffect, useState } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { Link } from 'react-router-dom';

import { toast } from 'sonner';
import {
  ArrowLeft,
  Clock,
  Download,
  Eye,
  MapPin,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Send,
  Star,
  Truck,
} from 'lucide-react';

import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  StatusBadge,
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
  DialogDescription,
  DialogFooter,
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

/* =========================================================
 * API
 * ======================================================= */

// const API_BASE_URL = 'https://glystics.onrender.com';

/* =========================================================
 * CONSTANTS
 * ======================================================= */

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

/* =========================================================
 * TYPES
 * ======================================================= */

interface ShippingCategory {
  category_id: number;
  category: string;
}

interface CategoryResponse {
  status: string;
  message: string;
  data: ShippingCategory[];
}

interface DeliveryRecord {
  id: string;
  trackingId: string;
  receiverName: string;
  receiverPhone: string;
  senderAddress: string;
  receiverAddress: string;
  deliveryStatus: string;
  createdAt: string;
  courier_name?: string | null;
}

interface DeliveryTableRow {
  id: string;
  trackingId: string;
  receiverName: string;
  receiverPhone: string;
  origin: string;
  destination: string;
  courier: string;
  status: string;
  createdAt: string;
}

const isDeliveryRecord = (
  value: unknown,
): value is DeliveryRecord => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === 'string' &&
    typeof record.trackingId === 'string' &&
    typeof record.receiverName === 'string' &&
    typeof record.receiverPhone === 'string' &&
    typeof record.senderAddress === 'string' &&
    typeof record.receiverAddress === 'string' &&
    typeof record.deliveryStatus === 'string' &&
    typeof record.createdAt === 'string' &&
    (record.courier_name === undefined ||
      record.courier_name === null ||
      typeof record.courier_name === 'string')
  );
};

interface ValidatedAddress {
  address_code: number;

  address: string;

  name: string;

  email: string;

  street_no: string;

  street: string;

  phone: string;

  formatted_address: string;

  country: string;

  country_code: string;

  city: string;

  city_code: string;

  state: string;

  state_code: string;

  postal_code: string;

  latitude: number;

  longitude: number;
}

interface ValidateAddressResponse {
  status: string;

  message: string;

  data: ValidatedAddress;
}

interface Courier {
  courier_id: string | number;

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

interface RatesData {
  request_token: string;

  couriers: Courier[];

  fastest_courier: Courier | null;

  cheapest_courier: Courier | null;

  checkout_data: CheckoutData;
}

interface RatesResponse {
  status: string;

  message: string;

  data: RatesData;
}

interface InsuranceRate {
  code: string;
  insurer: string;
  currency: string;
  insure_percentage: number;
  amount: number;
  policy_condition: string;
}

interface InsuranceRatesResponse {
  status: string;
  message: string;
  data: InsuranceRate[];
}

interface CheckoutDeliveryStatus {
  paymentStatus: string;
  bookingStatus: string;
  deliveryStatus: string | null;
  shipbubbleOrderId: string | null;
  bookingError: string | null;
}

interface DeliveryFormState {
  /* Sender */

  senderName: string;

  senderEmail: string;

  senderPhone: string;

  senderAddress: string;

  /* Receiver */

  receiverName: string;

  receiverEmail: string;

  receiverPhone: string;

  receiverAddress: string;

  /* Package */

  packageName: string;

  packageDescription: string;

  categoryId: string;

  weight: string;

  amount: string;

  quantity: string;

  /* Dimensions */

  length: string;

  width: string;

  height: string;

  /* Delivery */

  pickupDate: string;

  serviceType: string;

  instructions: string;
}

/* =========================================================
 * INITIAL FORM STATE
 * ======================================================= */

const initialFormState: DeliveryFormState = {
  senderName: '',
  senderEmail: '',
  senderPhone: '',
  senderAddress: '',

  receiverName: '',
  receiverEmail: '',
  receiverPhone: '',
  receiverAddress: '',

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

/* =========================================================
 * ADDRESS VALIDATION
 * ======================================================= */

const validateAddress = async ({
  name,
  email,
  phone,
  address,
}: {
  name: string;
  email: string;
  phone: string;
  address: string;
}): Promise<ValidatedAddress> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/shipping/address/validate`,
    {
      method: 'POST',

      headers: {
        accept: '*/*',
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        name,
        email,
        phone,
        address,

        latitude: 0,

        longitude: 0,
      }),
    },
  );

  let result: ValidateAddressResponse;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      'Invalid response received while validating address.',
    );
  }

  if (!response.ok) {
    throw new Error(
      result?.message || 'Unable to validate address.',
    );
  }

  if (result.status !== 'success') {
    throw new Error(
      result.message || 'Address validation failed.',
    );
  }

  if (!result.data?.address_code) {
    throw new Error(
      'Address validation did not return an address code.',
    );
  }

  return result.data;
};

/* =========================================================
 * COMPONENT
 * ======================================================= */

export default function DeliveriesPage() {
  const queryClient = useQueryClient();
  const userId = localStorage.getItem('userId') ?? '';

  /* =======================================================
   * FILTER STATE
   * ===================================================== */

  const [search, setSearch] = useState('');

  const [status, setStatus] = useState('all');

  const [courier, setCourier] = useState('all');

  /* =======================================================
   * DIALOG STATE
   * ===================================================== */

  const [createOpen, setCreateOpen] = useState(false);

  /**
   * Step 1 = Shipment information
   * Step 2 = Courier selection
   */
  const [step, setStep] = useState<1 | 2>(1);

  const [fetchingRates, setFetchingRates] =
    useState(false);

  const [
    bookingCourierId,
    setBookingCourierId,
  ] = useState<string | null>(null);

  const [deliveryId, setDeliveryId] = useState<string | null>(null);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [checkoutTrackingId, setCheckoutTrackingId] = useState<string | null>(null);

  const [insuranceDialogOpen, setInsuranceDialogOpen] = useState(false);

  const [insuranceOptions, setInsuranceOptions] = useState<InsuranceRate[]>([]);

  const [selectedInsuranceCode, setSelectedInsuranceCode] = useState('');

  const [pendingCourier, setPendingCourier] = useState<Courier | null>(null);

  /* =======================================================
   * FORM STATE
   * ===================================================== */

  const [formData, setFormData] =
    useState<DeliveryFormState>(
      initialFormState,
    );

  /* =======================================================
   * RATE STATE
   * ===================================================== */

  const [rates, setRates] =
    useState<RatesData | null>(null);

  const checkoutStatusQuery = useQuery<CheckoutDeliveryStatus>({
    queryKey: ['delivery-checkout-status', checkoutTrackingId],
    enabled: checkoutDialogOpen && Boolean(checkoutTrackingId),
    queryFn: async () => {
      if (!checkoutTrackingId) {
        throw new Error('Delivery tracking ID is missing.');
      }
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/delivery/tracking/${encodeURIComponent(checkoutTrackingId)}`,
        { headers: { accept: '*/*' } },
      );
      const result: unknown = await response.json();
      if (!response.ok) {
        throw new Error('Unable to check delivery payment status.');
      }
      if (
        typeof result !== 'object' ||
        result === null ||
        !('paymentStatus' in result) ||
        typeof result.paymentStatus !== 'string' ||
        !('bookingStatus' in result) ||
        typeof result.bookingStatus !== 'string' ||
        !('deliveryStatus' in result) ||
        (result.deliveryStatus !== null &&
          typeof result.deliveryStatus !== 'string') ||
        !('shipbubbleOrderId' in result) ||
        (result.shipbubbleOrderId !== null &&
          typeof result.shipbubbleOrderId !== 'string') ||
        !('bookingError' in result) ||
        (result.bookingError !== null &&
          typeof result.bookingError !== 'string')
      ) {
        throw new Error('Invalid delivery payment status received.');
      }
      return result as CheckoutDeliveryStatus;
    },
    refetchInterval: checkoutDialogOpen ? 5000 : false,
  });

  useEffect(() => {
    const status = checkoutStatusQuery.data;
    if (
      status?.paymentStatus === 'PAID' &&
      status.bookingStatus === 'BOOKED' &&
      status.shipbubbleOrderId
    ) {
      setCheckoutDialogOpen(false);
      setCheckoutUrl(null);
      setCheckoutTrackingId(null);
      toast.success('Payment received and courier booking confirmed.');
      void queryClient.invalidateQueries({ queryKey: ['deliveries'] });
    } else if (status?.bookingStatus === 'FAILED') {
      toast.error(
        status.bookingError ??
          'Payment succeeded, but courier booking needs attention.',
      );
    }
  }, [
    checkoutStatusQuery.data?.paymentStatus,
    checkoutStatusQuery.data?.bookingStatus,
    checkoutStatusQuery.data?.shipbubbleOrderId,
    checkoutStatusQuery.data?.bookingError,
    queryClient,
  ]);

  const [
    validatedSender,
    setValidatedSender,
  ] = useState<ValidatedAddress | null>(
    null,
  );

  const [
    validatedReceiver,
    setValidatedReceiver,
  ] = useState<ValidatedAddress | null>(
    null,
  );

  /* =======================================================
   * EXISTING DELIVERIES
   * ===================================================== */

  const {
    data: deliveries,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      'deliveries',
      userId,
      {
        search,
        status,
        courier,
      },
    ],

    queryFn: async (): Promise<DeliveryTableRow[]> => {
      if (!userId) {
        throw new Error('Logged-in user ID not found.');
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/delivery/${encodeURIComponent(userId)}`,
        {
          method: 'GET',
          headers: { accept: '*/*' },
        },
      );

      if (!response.ok) {
        throw new Error(
          `Unable to fetch deliveries: ${response.status} ${response.statusText}`,
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

      return records
        .map((delivery) => ({
          id: delivery.id,
          trackingId: delivery.trackingId,
          receiverName: delivery.receiverName,
          receiverPhone: delivery.receiverPhone,
          origin: delivery.senderAddress,
          destination: delivery.receiverAddress,
          courier: delivery.courier_name || 'Not assigned',
          status: delivery.deliveryStatus
            .toLowerCase()
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (character) => character.toUpperCase()),
          createdAt: delivery.createdAt,
        }))
        .filter((delivery) => {
          const searchTerm = search.trim().toLowerCase();
          const matchesSearch =
            !searchTerm ||
            delivery.trackingId.toLowerCase().includes(searchTerm) ||
            delivery.receiverName.toLowerCase().includes(searchTerm) ||
            delivery.origin.toLowerCase().includes(searchTerm) ||
            delivery.destination.toLowerCase().includes(searchTerm);
          const matchesStatus =
            status === 'all' || delivery.status === status;
          const matchesCourier =
            courier === 'all' || delivery.courier === courier;

          return matchesSearch && matchesStatus && matchesCourier;
        });
    },
  });

  /* =======================================================
   * SHIPPING CATEGORIES
   * ===================================================== */

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
    refetch: refetchCategories,
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

      let result: CategoryResponse;

      try {
        result = await response.json();
      } catch {
        throw new Error(
          'Invalid response received while fetching categories.',
        );
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            'Unable to fetch shipping categories.',
        );
      }

      if (result.status !== 'success') {
        throw new Error(
          result.message ||
            'Unable to fetch shipping categories.',
        );
      }

      return result.data ?? [];
    },

    staleTime: 1000 * 60 * 30,

    refetchOnWindowFocus: false,
  });

  /* =======================================================
   * FORM HELPERS
   * ===================================================== */

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

    setValidatedSender(null);

    setValidatedReceiver(null);

    setFetchingRates(false);

    setBookingCourierId(null);

    setDeliveryId(null);

    setCheckoutDialogOpen(false);
    setCheckoutUrl(null);
    setCheckoutTrackingId(null);

    setInsuranceDialogOpen(false);

    setInsuranceOptions([]);

    setSelectedInsuranceCode('');

    setPendingCourier(null);

    setFormData(initialFormState);
  };

  const handleDialogChange = (
    open: boolean,
  ) => {
    setCreateOpen(open);

    if (!open) {
      resetDeliveryDialog();
    }
  };

  /* =======================================================
   * MONEY FORMATTER
   * ===================================================== */

  const formatMoney = (
    amount: number,
    currency = 'NGN',
  ) => {
    return new Intl.NumberFormat(
      'en-NG',
      {
        style: 'currency',

        currency,

        maximumFractionDigits: 0,
      },
    ).format(amount);
  };

  /* =======================================================
   * COURIER HELPERS
   * ===================================================== */

  const isFastest = (
    item: Courier,
  ) => {
    return (
      rates?.fastest_courier
        ?.courier_id === item.courier_id
    );
  };

  const isCheapest = (
    item: Courier,
  ) => {
    return (
      rates?.cheapest_courier
        ?.courier_id === item.courier_id
    );
  };

  /* =======================================================
   * FETCH DELIVERY RATES
   * ===================================================== */

  const handleFetchRates = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    /* -----------------------------
     * Validate form
     * --------------------------- */

    if (!formData.senderName.trim()) {
      toast.error(
        'Sender name is required.',
      );

      return;
    }

    if (!formData.senderEmail.trim()) {
      toast.error(
        'Sender email is required.',
      );

      return;
    }

    if (!formData.senderPhone.trim()) {
      toast.error(
        'Sender phone is required.',
      );

      return;
    }

    if (!formData.senderAddress.trim()) {
      toast.error(
        'Sender address is required.',
      );

      return;
    }

    if (!formData.receiverName.trim()) {
      toast.error(
        'Receiver name is required.',
      );

      return;
    }

    if (
      !formData.receiverEmail.trim()
    ) {
      toast.error(
        'Receiver email is required.',
      );

      return;
    }

    if (
      !formData.receiverPhone.trim()
    ) {
      toast.error(
        'Receiver phone is required.',
      );

      return;
    }

    if (
      !formData.receiverAddress.trim()
    ) {
      toast.error(
        'Receiver address is required.',
      );

      return;
    }

    if (!formData.packageName.trim()) {
      toast.error(
        'Package name is required.',
      );

      return;
    }

    if (!formData.categoryId) {
      toast.error(
        'Please select a package category.',
      );

      return;
    }

    if (
      !formData.weight ||
      Number(formData.weight) <= 0
    ) {
      toast.error(
        'Enter a valid package weight.',
      );

      return;
    }

    if (
      !formData.amount ||
      Number(formData.amount) <= 0
    ) {
      toast.error(
        'Enter a valid package value.',
      );

      return;
    }

    if (
      !formData.quantity ||
      Number(formData.quantity) <= 0
    ) {
      toast.error(
        'Enter a valid quantity.',
      );

      return;
    }

    if (!formData.pickupDate) {
      toast.error(
        'Pickup date is required.',
      );

      return;
    }

    setFetchingRates(true);

    try {
      /* ===================================================
       * STEP A
       *
       * Validate sender + receiver addresses.
       *
       * Both requests can run at the same time.
       * ================================================= */

      const [
        senderAddressResult,
        receiverAddressResult,
      ] = await Promise.all([
        validateAddress({
          name: formData.senderName,

          email: formData.senderEmail,

          phone: formData.senderPhone,

          address:
            formData.senderAddress,
        }),

        validateAddress({
          name: formData.receiverName,

          email:
            formData.receiverEmail,

          phone:
            formData.receiverPhone,

          address:
            formData.receiverAddress,
        }),
      ]);

      console.log(
        'Validated sender address:',
        senderAddressResult,
      );

      console.log(
        'Validated receiver address:',
        receiverAddressResult,
      );

      setValidatedSender(
        senderAddressResult,
      );

      setValidatedReceiver(
        receiverAddressResult,
      );

      /* ===================================================
       * STEP B
       *
       * Extract Shipbubble address codes.
       * ================================================= */

      const senderAddressCode =
        senderAddressResult.address_code;

      const receiverAddressCode =
        receiverAddressResult.address_code;

      console.log(
        'Sender address code:',
        senderAddressCode,
      );

      console.log(
        'Receiver address code:',
        receiverAddressCode,
      );

      /* ===================================================
       * STEP C
       *
       * Create fetch_rates payload.
       * ================================================= */

      const payload = {
        sender_address_code:
          senderAddressCode,

        /**
         * Keep "reciever" spelling because
         * that is what your API currently
         * expects.
         */
        reciever_address_code:
          receiverAddressCode,

        pickup_date:
          formData.pickupDate,

        category_id: Number(
          formData.categoryId,
        ),

        package_items: [
          {
            name:
              formData.packageName,

            description:
              formData.packageDescription ||
              formData.packageName,

            unit_weight: Number(
              formData.weight,
            ),

            unit_amount: Number(
              formData.amount,
            ),

            quantity: Number(
              formData.quantity,
            ),
          },
        ],

        package_dimension: {
          length: Number(
            formData.length || 0,
          ),

          width: Number(
            formData.width || 0,
          ),

          height: Number(
            formData.height || 0,
          ),
        },

        service_type:
          formData.serviceType,

        delivery_instructions:
          formData.instructions || '',
      };

      console.log(
        'Fetch rates payload:',
        payload,
      );

      /* ===================================================
       * STEP D
       *
       * Fetch courier rates.
       * ================================================= */

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/shipping/fetch_rates`,
        {
          method: 'POST',

          headers: {
            accept: '*/*',

            'Content-Type':
              'application/json',
          },

          body: JSON.stringify(
            payload,
          ),
        },
      );

      let result: RatesResponse;

      try {
        result = await response.json();
      } catch {
        throw new Error(
          'Invalid response received while fetching delivery rates.',
        );
      }

      console.log(
        'Fetch rates response:',
        result,
      );

      if (!response.ok) {
        throw new Error(
          result?.message ||
            'Unable to fetch delivery rates.',
        );
      }

      if (
        result.status !== 'success'
      ) {
        throw new Error(
          result.message ||
            'Unable to fetch delivery rates.',
        );
      }

      if (
        !result.data?.couriers ||
        result.data.couriers.length ===
          0
      ) {
        toast.error(
          'No delivery companies are available for this shipment.',
        );

        return;
      }

      /* ===================================================
       * STEP E
       *
       * Store rates and move popup to Step 2.
       * ================================================= */

      setRates(result.data);

      setStep(2);

      toast.success(
        `${
          result.data.couriers.length
        } delivery option${
          result.data.couriers
            .length === 1
            ? ''
            : 's'
        } found.`,
      );
    } catch (error) {
      console.error(
        'Delivery rate error:',
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to fetch delivery rates.',
      );
    } finally {
      setFetchingRates(false);
    }
  };

  /* =======================================================
   * BOOK COURIER
   * ===================================================== */


  const handleBookCourier = async (
    selectedCourier: Courier,
  ) => {
    if (!rates?.request_token) {
      toast.error('Shipping request token is missing.');
      return;
    }

    const courierId = String(selectedCourier.courier_id);

    if (bookingCourierId !== null) {
      return;
    }

    if (!selectedCourier.service_code) {
      toast.error('Selected courier service code is missing.');
      return;
    }

    setBookingCourierId(courierId);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/shipping/insurance_rates?request_token=${encodeURIComponent(rates.request_token)}`,
        {
          method: 'GET',
          headers: { accept: '*/*' },
        },
      );

      const result = (await response.json().catch(() => {
        throw new Error(
          'Invalid response received while fetching insurance rates.',
        );
      })) as InsuranceRatesResponse;

      if (!response.ok || result.status !== 'success') {
        throw new Error(
          result.message || 'Unable to fetch insurance rates.',
        );
      }

      if (!Array.isArray(result.data)) {
        throw new Error('Invalid insurance rates response.');
      }

      if (result.data.length > 0) {
        setPendingCourier(selectedCourier);
        setInsuranceOptions(result.data);
        setSelectedInsuranceCode('');
        setInsuranceDialogOpen(true);
        return;
      }
    } catch (error) {
      console.error('Insurance rates error:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to fetch insurance rates.',
      );
      return;
    } finally {
      setBookingCourierId(null);
    }

    const courierInsuranceCode = selectedCourier.insurance?.code;
    await completeCourierBooking(
      selectedCourier,
      courierInsuranceCode &&
        courierInsuranceCode.toLowerCase() !== 'not available'
        ? courierInsuranceCode
        : '',
      undefined,
    );
  };

  const completeCourierBooking = async (
    selectedCourier: Courier,
    insuranceCode: string,
    selectedInsurance?: InsuranceRate,
  ) => {
    if (!rates?.request_token) {
      toast.error('Shipping request token is missing.');
      return;
    }

    if (bookingCourierId !== null) {
      return;
    }

    if (!Number.isFinite(selectedCourier.total) || selectedCourier.total <= 0) {
      toast.error('The selected courier rate is invalid.');
      return;
    }

    const courierId = String(selectedCourier.courier_id);
    const currency = selectedCourier.currency || rates.checkout_data.currency;
    if (!currency) {
      toast.error('The selected courier rate currency is missing.');
      return;
    }

    setBookingCourierId(courierId);

    try {
      let savedDeliveryId = deliveryId;
      let trackingId = checkoutTrackingId;

      if (!savedDeliveryId) {
        const currentUserId = localStorage.getItem('userId');
        if (!currentUserId) {
          throw new Error('Logged-in user ID not found.');
        }

        const selectedCategory = categories.find(
          (category) =>
            category.category_id === Number(formData.categoryId),
        );
        if (!selectedCategory) {
          throw new Error('Selected package category was not found.');
        }

        const deliveryPayload = {
          senderName: formData.senderName.trim(),
          userId: currentUserId,
          senderPhone: formData.senderPhone.trim(),
          senderAddress: formData.senderAddress.trim(),
          receiverName: formData.receiverName.trim(),
          receiverPhone: formData.receiverPhone.trim(),
          receiverAddress: formData.receiverAddress.trim(),
          senderLatitude:
            validatedSender?.latitude === undefined
              ? undefined
              : String(validatedSender.latitude),
          senderLongitude:
            validatedSender?.longitude === undefined
              ? undefined
              : String(validatedSender.longitude),
          receiverLatitude:
            validatedReceiver?.latitude === undefined
              ? undefined
              : String(validatedReceiver.latitude),
          receiverLongitude:
            validatedReceiver?.longitude === undefined
              ? undefined
              : String(validatedReceiver.longitude),
          packageName: formData.packageName.trim(),
          packageCategory: selectedCategory.category,
          packageWeight: formData.weight,
          packageDimensions: `${formData.length || '0'}x${formData.width || '0'}x${formData.height || '0'}`,
          packageValue: formData.amount,
          pickupDate: formData.pickupDate,
          deliveryStatus: 'CREATED',
          deliveryType: formData.serviceType,
          deliveryInstructions: formData.instructions.trim(),
        };

        const saveResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/delivery`,
          {
            method: 'POST',
            headers: {
              accept: '*/*',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(deliveryPayload),
          },
        );
        const saveResult: unknown = await saveResponse.json().catch(() => null);
        if (!saveResponse.ok) {
          const message =
            typeof saveResult === 'object' && saveResult !== null && 'message' in saveResult
              ? saveResult.message
              : undefined;
          throw new Error(
            Array.isArray(message)
              ? message.join(', ')
              : typeof message === 'string'
                ? message
                : 'Unable to save delivery details.',
          );
        }
        if (
          typeof saveResult !== 'object' ||
          saveResult === null ||
          !('id' in saveResult) ||
          typeof saveResult.id !== 'string' ||
          !('trackingId' in saveResult) ||
          typeof saveResult.trackingId !== 'string'
        ) {
          throw new Error(
            'Delivery was saved but the server did not return its ID and tracking ID.',
          );
        }

        savedDeliveryId = saveResult.id;
        trackingId = saveResult.trackingId;
        setDeliveryId(savedDeliveryId);
        setCheckoutTrackingId(trackingId);
        await queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      }

      if (!savedDeliveryId || !trackingId) {
        throw new Error('Delivery ID or tracking ID is missing.');
      }

      const insuranceAmount = selectedInsurance?.amount ?? 0;
      if (
        insuranceAmount > 0 &&
        selectedInsurance?.currency.toUpperCase() !== currency.toUpperCase()
      ) {
        throw new Error(
          'Insurance currency does not match the selected courier rate currency.',
        );
      }

      const insuranceSaveResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/delivery/${encodeURIComponent(savedDeliveryId)}`,
        {
          method: 'PATCH',
          headers: {
            accept: '*/*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            insuranceAmount,
            insurance_policy_condition:
              selectedInsurance?.policy_condition ?? '',
            insure_percentage: selectedInsurance?.insure_percentage ?? 0,
            insurance_cost: insuranceAmount,
            insuranceCode: insuranceCode || '',
            insurerName: selectedInsurance?.insurer ?? '',
          }),
        },
      );
      const insuranceSaveResult: unknown = await insuranceSaveResponse
        .json()
        .catch(() => null);
      if (!insuranceSaveResponse.ok) {
        const message =
          typeof insuranceSaveResult === 'object' &&
          insuranceSaveResult !== null &&
          'message' in insuranceSaveResult
            ? insuranceSaveResult.message
            : undefined;
        throw new Error(
          typeof message === 'string'
            ? message
            : 'Unable to save selected insurance details.',
        );
      }

      const checkoutResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/delivery/${encodeURIComponent(savedDeliveryId)}/checkout-session`,
        {
          method: 'POST',
          headers: {
            accept: '*/*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: selectedCourier.total.toFixed(2),
            currency,
            request_token: rates.request_token,
            courier_id: courierId,
            service_code: selectedCourier.service_code,
            insurance_code: insuranceCode || undefined,
          }),
        },
      );
      const checkoutResult: unknown = await checkoutResponse.json().catch(() => null);
      if (!checkoutResponse.ok) {
        const message =
          typeof checkoutResult === 'object' && checkoutResult !== null && 'message' in checkoutResult
            ? checkoutResult.message
            : undefined;
        throw new Error(
          typeof message === 'string'
            ? message
            : 'Unable to create payment checkout session.',
        );
      }
      if (
        typeof checkoutResult !== 'object' ||
        checkoutResult === null ||
        !('checkout_id' in checkoutResult) ||
        typeof checkoutResult.checkout_id !== 'string' ||
        !('checkout_url' in checkoutResult) ||
        typeof checkoutResult.checkout_url !== 'string'
      ) {
        throw new Error('The checkout response did not include a payment URL.');
      }

      setCheckoutUrl(checkoutResult.checkout_url);
      setCheckoutTrackingId(trackingId);
      setInsuranceDialogOpen(false);
      setCheckoutDialogOpen(true);
      setCreateOpen(false);
      toast.success('Checkout ready. Complete payment to book your courier.');
    } catch (error) {
      console.error('Delivery checkout error:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to create checkout session.',
      );
    } finally {
      setBookingCourierId(null);
    }
  };

  const handleConfirmInsurance = () => {
    if (!pendingCourier || !selectedInsuranceCode) {
      toast.error('Select an insurance option to continue.');
      return;
    }

    setInsuranceDialogOpen(false);
    void completeCourierBooking(
      pendingCourier,
      selectedInsuranceCode,
      insuranceOptions.find(
        (option) => option.code === selectedInsuranceCode,
      ),
    );
  };


  /* =======================================================
   * RENDER
   * ===================================================== */

  return (
    <div>
      {/* ===================================================
       * PAGE HEADER
       * ================================================= */}

      <PageHeader
        title="Deliveries"
        description="Manage and track all your deliveries."
      >
        <Button
          variant="outline"
          onClick={() =>
            toast.success(
              'Exporting deliveries...',
            )
          }
        >
          <Download className="mr-2 h-4 w-4" />

          Export
        </Button>

        {/* =================================================
         * CREATE DELIVERY DIALOG
         * =============================================== */}

        <Dialog
          open={createOpen}
          onOpenChange={
            handleDialogChange
          }
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

            {/* =============================================
             * STEP INDICATOR
             * =========================================== */}

            <div className="flex items-center gap-3 border-b pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
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

            {/* =============================================
             * STEP 1
             * =========================================== */}

            {step === 1 && (
              <form
                onSubmit={
                  handleFetchRates
                }
                className="space-y-6"
              >
                {/* =========================================
                 * SENDER
                 * ======================================= */}

                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <Package className="h-4 w-4 text-muted-foreground" />

                    Sender
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Name */}

                    <div className="space-y-1.5">
                      <Label htmlFor="senderName">
                        Name
                      </Label>

                      <Input
                        id="senderName"
                        required
                        placeholder="Micheal Doe"
                        value={
                          formData.senderName
                        }
                        onChange={(event) =>
                          updateForm(
                            'senderName',
                            event.target
                              .value,
                          )
                        }
                      />
                    </div>

                    {/* Email */}

                    <div className="space-y-1.5">
                      <Label htmlFor="senderEmail">
                        Email
                      </Label>

                      <Input
                        id="senderEmail"
                        type="email"
                        required
                        placeholder="michael@example.com"
                        value={
                          formData.senderEmail
                        }
                        onChange={(event) =>
                          updateForm(
                            'senderEmail',
                            event.target
                              .value,
                          )
                        }
                      />
                    </div>

                    {/* Phone */}

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="senderPhone">
                        Phone
                      </Label>

                      <Input
                        id="senderPhone"
                        type="tel"
                        required
                        placeholder="+2348028520094"
                        value={
                          formData.senderPhone
                        }
                        onChange={(event) =>
                          updateForm(
                            'senderPhone',
                            event.target
                              .value,
                          )
                        }
                      />
                    </div>

                    {/* Address */}

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="senderAddress">
                        Full address
                      </Label>

                      <Textarea
                        id="senderAddress"
                        required
                        placeholder="60, Herbert Macaulay Way, Yaba, Lagos, Nigeria"
                        rows={2}
                        value={
                          formData.senderAddress
                        }
                        onChange={(event) =>
                          updateForm(
                            'senderAddress',
                            event.target
                              .value,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* =========================================
                 * RECEIVER
                 * ======================================= */}

                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <Truck className="h-4 w-4 text-muted-foreground" />

                    Receiver
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Name */}

                    <div className="space-y-1.5">
                      <Label htmlFor="receiverName">
                        Name
                      </Label>

                      <Input
                        id="receiverName"
                        required
                        placeholder="Chioma Eze"
                        value={
                          formData.receiverName
                        }
                        onChange={(event) =>
                          updateForm(
                            'receiverName',
                            event.target
                              .value,
                          )
                        }
                      />
                    </div>

                    {/* Email */}

                    <div className="space-y-1.5">
                      <Label htmlFor="receiverEmail">
                        Email
                      </Label>

                      <Input
                        id="receiverEmail"
                        type="email"
                        required
                        placeholder="chioma@example.com"
                        value={
                          formData.receiverEmail
                        }
                        onChange={(event) =>
                          updateForm(
                            'receiverEmail',
                            event.target
                              .value,
                          )
                        }
                      />
                    </div>

                    {/* Phone */}

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="receiverPhone">
                        Phone
                      </Label>

                      <Input
                        id="receiverPhone"
                        type="tel"
                        required
                        placeholder="+2348023456789"
                        value={
                          formData.receiverPhone
                        }
                        onChange={(event) =>
                          updateForm(
                            'receiverPhone',
                            event.target
                              .value,
                          )
                        }
                      />
                    </div>

                    {/* Address */}

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="receiverAddress">
                        Full address
                      </Label>

                      <Textarea
                        id="receiverAddress"
                        required
                        placeholder="80, Herbert Macaulay Way, Yaba, Lagos, Nigeria"
                        rows={2}
                        value={
                          formData.receiverAddress
                        }
                        onChange={(event) =>
                          updateForm(
                            'receiverAddress',
                            event.target
                              .value,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* =========================================
                 * PACKAGE
                 * ======================================= */}

                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <Package className="h-4 w-4 text-muted-foreground" />

                    Package
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Package name */}

                    <div className="space-y-1.5">
                      <Label htmlFor="packageName">
                        Package name
                      </Label>

                      <Input
                        id="packageName"
                        required
                        placeholder="Wireless Headphones"
                        value={
                          formData.packageName
                        }
                        onChange={(event) =>
                          updateForm(
                            'packageName',
                            event.target
                              .value,
                          )
                        }
                      />
                    </div>

                    {/* Category */}

                    <div className="space-y-1.5">
                      <Label>
                        Category
                      </Label>

                      <Select
                        value={
                          formData.categoryId
                        }
                        onValueChange={(
                          value,
                        ) =>
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
                          {categories.map(
                            (category) => (
                              <SelectItem
                                key={
                                  category.category_id
                                }
                                value={String(
                                  category.category_id,
                                )}
                              >
                                {
                                  category.category
                                }
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>

                      {categoriesError && (
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-destructive">
                            Unable to load
                            categories.
                          </p>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              refetchCategories()
                            }
                          >
                            Retry
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Description */}

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
                        onChange={(event) =>
                          updateForm(
                            'packageDescription',
                            event.target
                              .value,
                          )
                        }
                      />
                    </div>

                    {/* Weight */}

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
                        value={
                          formData.weight
                        }
                        onChange={(event) =>
                          updateForm(
                            'weight',
                            event.target
                              .value,
                          )
                        }
                      />
                    </div>

                    {/* Amount */}

                    <div className="space-y-1.5">
                      <Label htmlFor="amount">
                        Package value
                      </Label>

                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        placeholder="99.99"
                        value={
                          formData.amount
                        }
                        onChange={(event) =>
                          updateForm(
                            'amount',
                            event.target
                              .value,
                          )
                        }
                      />
                    </div>

                    {/* Quantity */}

                    <div className="space-y-1.5">
                      <Label htmlFor="quantity">
                        Quantity
                      </Label>

                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        required
                        value={
                          formData.quantity
                        }
                        onChange={(event) =>
                          updateForm(
                            'quantity',
                            event.target
                              .value,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* =========================================
                 * DIMENSIONS
                 * ======================================= */}

                <div>
                  <h3 className="mb-3 text-sm font-semibold">
                    Package Dimensions
                  </h3>

                  <p className="mb-3 text-xs text-muted-foreground">
                    Enter package dimensions
                    in centimetres.
                  </p>

                  <div className="grid grid-cols-3 gap-3">
                    {/* Length */}

                    <div className="space-y-1.5">
                      <Label htmlFor="length">
                        Length
                      </Label>

                      <Input
                        id="length"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="10"
                        value={
                          formData.length
                        }
                        onChange={(event) =>
                          updateForm(
                            'length',
                            event.target
                              .value,
                          )
                        }
                      />
                    </div>

                    {/* Width */}

                    <div className="space-y-1.5">
                      <Label htmlFor="width">
                        Width
                      </Label>

                      <Input
                        id="width"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="8"
                        value={
                          formData.width
                        }
                        onChange={(event) =>
                          updateForm(
                            'width',
                            event.target
                              .value,
                          )
                        }
                      />
                    </div>

                    {/* Height */}

                    <div className="space-y-1.5">
                      <Label htmlFor="height">
                        Height
                      </Label>

                      <Input
                        id="height"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="6"
                        value={
                          formData.height
                        }
                        onChange={(event) =>
                          updateForm(
                            'height',
                            event.target
                              .value,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* =========================================
                 * DELIVERY
                 * ======================================= */}

                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <Truck className="h-4 w-4 text-muted-foreground" />

                    Delivery
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Pickup date */}

                    <div className="space-y-1.5">
                      <Label htmlFor="pickupDate">
                        Pickup date
                      </Label>

                      <Input
                        id="pickupDate"
                        type="date"
                        required
                        value={
                          formData.pickupDate
                        }
                        onChange={(event) =>
                          updateForm(
                            'pickupDate',
                            event.target
                              .value,
                          )
                        }
                      />
                    </div>

                    {/* Service type */}

                    <div className="space-y-1.5">
                      <Label>
                        Service type
                      </Label>

                      <Select
                        value={
                          formData.serviceType
                        }
                        onValueChange={(
                          value,
                        ) =>
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
                          {serviceTypes.map(
                            (type) => (
                              <SelectItem
                                key={
                                  type.value
                                }
                                value={
                                  type.value
                                }
                              >
                                {
                                  type.label
                                }
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Instructions */}

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="instructions">
                        Delivery
                        instructions
                      </Label>

                      <Textarea
                        id="instructions"
                        placeholder="Leave at the front door."
                        rows={2}
                        value={
                          formData.instructions
                        }
                        onChange={(event) =>
                          updateForm(
                            'instructions',
                            event.target
                              .value,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* =========================================
                 * FORM ACTIONS
                 * ======================================= */}

                <div className="flex justify-end gap-2 border-t border-border pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={
                      fetchingRates
                    }
                    onClick={() =>
                      handleDialogChange(
                        false,
                      )
                    }
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={
                      fetchingRates ||
                      categoriesLoading ||
                      categoriesError
                    }
                  >
                    {fetchingRates ? (
                      <>
                        <Truck className="mr-2 h-4 w-4 animate-pulse" />

                        Validating &
                        fetching rates...
                      </>
                    ) : (
                      <>
                        <Truck className="mr-2 h-4 w-4" />

                        Get Delivery
                        Rates
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}

            {/* =============================================
             * STEP 2
             * =========================================== */}

            {step === 2 && rates && (
              <div className="space-y-5">
                {/* =========================================
                 * SHIPMENT SUMMARY
                 * ======================================= */}

                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">
                        Shipment Summary
                      </h3>

                      <p className="text-xs text-muted-foreground">
                        Addresses validated
                        successfully.
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setStep(1)
                      }
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />

                      Edit
                    </Button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Sender */}

                    <div className="rounded-lg border bg-background p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />

                        <p className="text-xs font-semibold uppercase text-muted-foreground">
                          From
                        </p>
                      </div>

                      <p className="text-sm font-medium">
                        {
                          rates.checkout_data
                            .ship_from.name
                        }
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {validatedSender
                          ?.formatted_address ||
                          rates
                            .checkout_data
                            .ship_from
                            .address}
                      </p>

                      <p className="mt-2 text-xs text-muted-foreground">
                        {
                          rates.checkout_data
                            .ship_from.phone
                        }
                      </p>
                    </div>

                    {/* Receiver */}

                    <div className="rounded-lg border bg-background p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />

                        <p className="text-xs font-semibold uppercase text-muted-foreground">
                          To
                        </p>
                      </div>

                      <p className="text-sm font-medium">
                        {
                          rates.checkout_data
                            .ship_to.name
                        }
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {validatedReceiver
                          ?.formatted_address ||
                          rates
                            .checkout_data
                            .ship_to
                            .address}
                      </p>

                      <p className="mt-2 text-xs text-muted-foreground">
                        {
                          rates.checkout_data
                            .ship_to.phone
                        }
                      </p>
                    </div>
                  </div>

                  {/* Shipment details */}

                  <div className="mt-4 grid gap-3 border-t pt-4 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Package
                      </p>

                      <p className="font-medium">
                        {
                          formData.packageName
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Weight
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

                {/* =========================================
                 * COURIER TITLE
                 * ======================================= */}

                <div>
                  <h3 className="text-base font-semibold">
                    Available Delivery
                    Companies
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    Choose a courier to
                    continue with your
                    delivery.
                  </p>
                </div>

                {/* =========================================
                 * COURIER LIST
                 * ======================================= */}

                <div className="space-y-3">
                  {rates.couriers.map(
                    (
                      deliveryCourier,
                    ) => (
                      <div
                        key={
                          deliveryCourier.courier_id
                        }
                        className="rounded-xl border bg-card p-4 transition-colors hover:border-primary/40"
                      >
                        {/* Top section */}

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          {/* Courier */}

                          <div className="flex gap-3">
                            {/* Logo */}

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

                            {/* Courier info */}

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
                                {/* Rating */}

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

                                {/* Service type */}

                                <span className="capitalize">
                                  {
                                    deliveryCourier.service_type
                                  }
                                </span>

                                {/* Tracking */}

                                <span>
                                  Tracking:{' '}
                                  {
                                    deliveryCourier
                                      .tracking
                                      .label
                                  }
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Price */}

                          <div className="sm:text-right">
                            <p className="text-xl font-bold">
                              {formatMoney(
                                deliveryCourier.total,

                                deliveryCourier.currency,
                              )}
                            </p>

                            {deliveryCourier
                              .discount
                              ?.percentage >
                              0 && (
                              <p className="text-xs text-green-600">
                                {
                                  deliveryCourier
                                    .discount
                                    .percentage
                                }
                                {
                                  deliveryCourier
                                    .discount
                                    .symbol
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

                        {/* ETA */}

                        <div className="mt-4 grid gap-3 border-t pt-4 text-sm sm:grid-cols-2">
                          {/* Pickup */}

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

                          {/* Delivery */}

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

                        {/* Pickup station */}

                        {deliveryCourier.pickup_station && (
                          <div className="mt-3 rounded-lg bg-muted/40 p-3">
                            <p className="mb-1 text-xs font-semibold">
                              Pickup station
                            </p>

                            <p className="text-sm font-medium">
                              {
                                deliveryCourier
                                  .pickup_station
                                  .name
                              }
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {
                                deliveryCourier
                                  .pickup_station
                                  .address
                              }
                            </p>

                            {deliveryCourier
                              .pickup_station
                              .phone && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {
                                  deliveryCourier
                                    .pickup_station
                                    .phone
                                }
                              </p>
                            )}
                          </div>
                        )}

                        {/* Dropoff station */}

                        {deliveryCourier.dropoff_station && (
                          <div className="mt-3 rounded-lg bg-muted/40 p-3">
                            <p className="mb-1 text-xs font-semibold">
                              Drop-off station
                            </p>

                            <p className="text-sm font-medium">
                              {
                                deliveryCourier
                                  .dropoff_station
                                  .name
                              }
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {
                                deliveryCourier
                                  .dropoff_station
                                  .address
                              }
                            </p>

                            {deliveryCourier
                              .dropoff_station
                              .phone && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {
                                  deliveryCourier
                                    .dropoff_station
                                    .phone
                                }
                              </p>
                            )}
                          </div>
                        )}

                        {/* Footer */}

                        <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <p>
                              {deliveryCourier.is_cod_available
                                ? 'Cash on delivery available'
                                : 'Cash on delivery unavailable'}
                            </p>

                            <p>
                              Insurance:{' '}
                              {deliveryCourier
                                .insurance
                                ?.code ||
                                'Not available'}
                            </p>
                          </div>
                        <Button
                          type="button"
                          onClick={() => handleBookCourier(deliveryCourier)}
                          disabled={bookingCourierId !== null}
                        >
                          {bookingCourierId ===
                          String(deliveryCourier.courier_id) ? (
                            <>
                              <Truck className="mr-2 h-4 w-4 animate-pulse" />
                              Booking...
                            </>
                          ) : (
                            <>
                              <Truck className="mr-2 h-4 w-4" />
                              Book Now
                            </>
                          )}
                        </Button>
                        </div>
                      </div>
                    ),
                  )}
                </div>

                {/* =========================================
                 * STEP 2 ACTIONS
                 * ======================================= */}

                <div className="flex justify-between border-t pt-4">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setStep(1)
                    }
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />

                    Back
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() =>
                      handleDialogChange(
                        false,
                      )
                    }
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog
          open={insuranceDialogOpen}
          onOpenChange={setInsuranceDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select shipment insurance</DialogTitle>
              <DialogDescription>
                Choose an insurance policy before booking with{' '}
                {pendingCourier?.courier_name}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="insurance-option">Insurance policy</Label>
              <Select
                value={selectedInsuranceCode}
                onValueChange={setSelectedInsuranceCode}
              >
                <SelectTrigger id="insurance-option">
                  <SelectValue placeholder="Choose an insurance policy" />
                </SelectTrigger>
                <SelectContent>
                  {insuranceOptions.map((option) => (
                    <SelectItem key={option.code} value={option.code}>
                      {option.insurer} -{' '}
                      {new Intl.NumberFormat('en-NG', {
                        style: 'currency',
                        currency: option.currency,
                        maximumFractionDigits: 2,
                      }).format(option.amount)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedInsuranceCode && (
                <p className="text-sm text-muted-foreground">
                  {
                    insuranceOptions.find(
                      (option) => option.code === selectedInsuranceCode,
                    )?.policy_condition
                  }
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setInsuranceDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmInsurance}
                disabled={!selectedInsuranceCode || bookingCourierId !== null}
              >
                Continue to booking
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={checkoutDialogOpen}
          onOpenChange={setCheckoutDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete delivery payment</DialogTitle>
              <DialogDescription>
                Pay for the selected courier service. The shipment label will
                be created automatically after Bachs confirms payment.
              </DialogDescription>
            </DialogHeader>

            {checkoutUrl && (
              <a
                href={checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all rounded-md border p-3 text-sm text-primary underline"
              >
                {checkoutUrl}
              </a>
            )}

            <div aria-live="polite" className="text-sm text-muted-foreground">
              {checkoutStatusQuery.data?.bookingStatus === 'FAILED'
                ? checkoutStatusQuery.data.bookingError ??
                  'Payment was received, but courier booking failed. Please contact support.'
                : checkoutStatusQuery.data?.bookingStatus === 'PROCESSING'
                  ? 'Payment confirmed. Booking the courier...'
                  : checkoutStatusQuery.data?.paymentStatus === 'PAID'
                    ? 'Payment confirmed. Finalizing courier booking...'
                    : checkoutStatusQuery.isError
                      ? 'Unable to refresh payment status. The webhook or payment verification will continue processing.'
                      : 'Waiting for payment confirmation...'}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCheckoutDialogOpen(false)}
              >
                Close
              </Button>
              {checkoutUrl && (
                <Button asChild>
                  <a
                    href={checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Continue to payment
                  </a>
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* ===================================================
       * FILTERS
       * ================================================= */}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}

        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search tracking ID, customer..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            className="pl-9"
          />
        </div>

        {/* Status */}

        <Select
          value={status}
          onValueChange={setStatus}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>

          <SelectContent>
            {statusOptions.map(
              (item) => (
                <SelectItem
                  key={item}
                  value={item}
                >
                  {item === 'all'
                    ? 'All statuses'
                    : item}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>

      {/* ===================================================
       * DELIVERIES TABLE
       * ================================================= */}

      <div className="rounded-xl border border-border bg-card">
        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState
            message={
              error instanceof Error
                ? error.message
                : 'Unable to load deliveries.'
            }
            onRetry={() => void refetch()}
          />
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
                <TableHead>
                  Tracking ID
                </TableHead>

                <TableHead>
                  Customer
                </TableHead>

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

                <TableHead>
                  Status
                </TableHead>

                <TableHead className="hidden lg:table-cell">
                  Created
                </TableHead>

                <TableHead className="text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {deliveries.map(
                (delivery) => (
                  <TableRow
                    key={delivery.id}
                  >
                    {/* Tracking */}

                    <TableCell>
                      <Link
                        to={`/deliveries/${delivery.id}`}
                        className="font-mono text-xs font-medium text-primary hover:underline"
                      >
                        {
                          delivery.trackingId
                        }
                      </Link>
                    </TableCell>

                    {/* Customer */}

                    <TableCell className="font-medium">
                      {
                        delivery.receiverName
                      }
                    </TableCell>

                    {/* Phone */}

                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {
                        delivery.receiverPhone
                      }
                    </TableCell>

                    {/* Origin */}

                    <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                      {
                        delivery.origin
                      }
                    </TableCell>

                    {/* Destination */}

                    <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                      {
                        delivery.destination
                      }
                    </TableCell>

                    {/* Courier */}

                    <TableCell className="hidden text-sm text-muted-foreground xl:table-cell">
                      {
                        delivery.courier
                      }
                    </TableCell>

                    {/* Status */}

                    <TableCell>
                      <StatusBadge
                        status={
                          delivery.status
                        }
                      />
                    </TableCell>

                    {/* Created */}

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

                    {/* Actions */}

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
                          {/* View */}

                          <Link
                            to={`/deliveries/${delivery.id}`}
                          >
                            <DropdownMenuItem className="cursor-pointer">
                              <Eye className="mr-2 h-4 w-4" />

                              View
                            </DropdownMenuItem>
                          </Link>

                          {/* Track */}

                          <Link
                            to={`/deliveries/${delivery.id}`}
                          >
                            <DropdownMenuItem className="cursor-pointer">
                              <Truck className="mr-2 h-4 w-4" />

                              Track
                            </DropdownMenuItem>
                          </Link>

                          {/* Notification */}

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
                ),
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}