import {
  deliveries as mockDeliveries,
  notifications as mockNotifications,
  templates as mockTemplates,
  automations as mockAutomations,
  apiKeys as mockApiKeys,
  webhooks as mockWebhooks,
  invoices as mockInvoices,
  teamMembers as mockTeamMembers,
  dashboardStats,
  deliveryActivityData,
  billingPlan,
  usage,
  pricingPlans,
  whatsappConnection,
  disconnectedWhatsAppConnection,
  currentUser,
  organizations,
} from './mock-data';
import type { Delivery, Template, Automation } from '@/types';
import { authenticatedFetch as fetch } from '@/lib/authenticated-fetch';

function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

interface BackendDelivery {
  id: string;
  trackingId: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  packageName: string;
  packageCategory: string;
  packageWeight: string;
  packageDimensions: string;
  packageValue: string;
  pickupDate: string;
  courier_name: string | null;
  deliveryStatus: string | null;
  deliveryType: string;
  deliveryInstructions: string | null;
  createdAt: string;
  updatedAt: string;
}

function toDeliveryStatus(status: string | null): Delivery['status'] {
  switch (status?.trim().toUpperCase().replace(/[\s-]+/g, '_')) {
    case 'PICKUP_SCHEDULED':
      return 'Pickup Scheduled';
    case 'PICKED_UP':
      return 'Picked Up';
    case 'IN_TRANSIT':
    case 'TRANSIT':
      return 'In Transit';
    case 'OUT_FOR_DELIVERY':
      return 'Out for Delivery';
    case 'DELIVERED':
      return 'Delivered';
    case 'FAILED':
    case 'BOOKING_FAILED':
    case 'CANCELLED':
    case 'CANCELED':
      return 'Failed';
    default:
      return 'Created';
  }
}

function toFrontendDelivery(record: BackendDelivery): Delivery {
  return {
    id: record.id,
    trackingId: record.trackingId,
    senderName: record.senderName,
    senderPhone: record.senderPhone,
    senderAddress: record.senderAddress,
    receiverName: record.receiverName,
    receiverPhone: record.receiverPhone,
    receiverAddress: record.receiverAddress,
    packageName: record.packageName,
    category: record.packageCategory,
    weight: record.packageWeight,
    dimensions: record.packageDimensions,
    value: record.packageValue,
    pickupDate: record.pickupDate,
    deliveryType: record.deliveryType,
    courier: record.courier_name ?? '',
    instructions: record.deliveryInstructions ?? '',
    status: toDeliveryStatus(record.deliveryStatus),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    origin: record.senderAddress,
    destination: record.receiverAddress,
    timeline: [],
    notifications: [],
  };
}

// In-memory WhatsApp connection state. Starts disconnected and changes only
// through connectWhatsApp / disconnectWhatsApp below.
type WhatsAppConnection = typeof whatsappConnection;

let currentWhatsApp =
  disconnectedWhatsAppConnection as unknown as WhatsAppConnection;

export const api = {
  // Dashboard
  getDashboardStats: () => delay(dashboardStats),
  getDeliveryActivity: (range: string = '7days') => delay(deliveryActivityData),

  // Deliveries
  getDeliveries: async (filters?: { search?: string; status?: string; courier?: string }) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('Could not load deliveries: logged-in user ID is missing.');
    }

    const headers: HeadersInit = { accept: '*/*' };
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/delivery/${encodeURIComponent(userId)}`,
      { headers },
    );
    if (!response.ok) {
      throw new Error(
        `Could not load deliveries: ${response.status} ${response.statusText}`,
      );
    }

    const body: unknown = await response.json();
    if (!Array.isArray(body)) {
      throw new Error('Could not load deliveries: API returned an invalid response.');
    }

    let result = body.map((record: unknown) => {
      if (typeof record !== 'object' || record === null) {
        throw new Error('Could not load deliveries: API returned an invalid delivery.');
      }
      return toFrontendDelivery(record as BackendDelivery);
    });
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (d) =>
          d.trackingId.toLowerCase().includes(q) ||
          d.senderName.toLowerCase().includes(q) ||
          d.receiverName.toLowerCase().includes(q) ||
          d.destination.toLowerCase().includes(q),
      );
    }
    if (filters?.status && filters.status !== 'all') {
      result = result.filter((d) => d.status === filters.status);
    }
    if (filters?.courier && filters.courier !== 'all') {
      result = result.filter((d) => d.courier === filters.courier);
    }
    return result;
  },
  getDelivery: (id: string) => delay(mockDeliveries.find((d) => d.id === id || d.trackingId === id)),
  createDelivery: (data: Partial<Delivery>) => {
    const newDelivery: Delivery = {
      id: `del-${mockDeliveries.length + 1}`,
      trackingId: `SD${String(12340 + mockDeliveries.length + 1).padStart(5, '0')}`,
      senderName: data.senderName || '',
      senderPhone: data.senderPhone || '',
      senderAddress: data.senderAddress || '',
      receiverName: data.receiverName || '',
      receiverPhone: data.receiverPhone || '',
      receiverAddress: data.receiverAddress || '',
      packageName: data.packageName || '',
      category: data.category || '',
      weight: data.weight || '',
      dimensions: data.dimensions || '',
      value: data.value || '',
      pickupDate: data.pickupDate || new Date().toISOString(),
      deliveryType: data.deliveryType || 'Standard',
      courier: data.courier || 'Swift Rider',
      instructions: data.instructions || '',
      status: 'Created',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      origin: data.origin || '',
      destination: data.destination || '',
      timeline: [
        { status: 'Order Created', timestamp: new Date().toISOString(), completed: true, current: true, description: 'Order created' },
      ],
      notifications: [],
    };
    mockDeliveries.unshift(newDelivery);
    return delay(newDelivery);
  },

  // Notifications
  getNotifications: (filters?: { search?: string; status?: string }) => {
    let result = [...mockNotifications];
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (n) => n.recipient.toLowerCase().includes(q) || n.trackingId.toLowerCase().includes(q) || n.template.toLowerCase().includes(q),
      );
    }
    if (filters?.status && filters.status !== 'all') {
      result = result.filter((n) => n.status === filters.status);
    }
    return delay(result);
  },
  getNotification: (id: string) => delay(mockNotifications.find((n) => n.id === id)),

  // Templates
  getTemplates: () => delay([...mockTemplates]),
  getTemplate: (id: string) => delay(mockTemplates.find((t) => t.id === id)),
  createTemplate: (data: Partial<Template>) => {
    const newTemplate: Template = {
      id: `tpl-${mockTemplates.length + 1}`,
      name: data.name || 'new_template',
      category: data.category || 'Utility',
      status: 'Draft',
      header: data.header || '',
      body: data.body || '',
      footer: data.footer || '',
      buttons: data.buttons || [],
      variables: data.variables || [],
      language: data.language || 'English',
      createdAt: new Date().toISOString(),
    };
    mockTemplates.push(newTemplate);
    return delay(newTemplate);
  },
  updateTemplate: (id: string, data: Partial<Template>) => {
    const idx = mockTemplates.findIndex((t) => t.id === id);
    if (idx >= 0) {
      mockTemplates[idx] = { ...mockTemplates[idx], ...data };
      return delay(mockTemplates[idx]);
    }
    return delay(null);
  },
  deleteTemplate: (id: string) => {
    const idx = mockTemplates.findIndex((t) => t.id === id);
    if (idx >= 0) mockTemplates.splice(idx, 1);
    return delay(true);
  },

  // Automations
  getAutomations: () => delay([...mockAutomations]),
  createAutomation: (data: Partial<Automation>) => {
    const newAuto: Automation = {
      id: `auto-${mockAutomations.length + 1}`,
      name: data.name || 'New Automation',
      enabled: true,
      trigger: data.trigger || 'Shipment status changes',
      triggerValue: data.triggerValue || '',
      condition: data.condition || '',
      action: data.action || 'Send WhatsApp template',
      actionTemplate: data.actionTemplate || '',
      lastTriggered: null,
      totalRuns: 0,
    };
    mockAutomations.push(newAuto);
    return delay(newAuto);
  },
  toggleAutomation: (id: string) => {
    const auto = mockAutomations.find((a) => a.id === id);
    if (auto) auto.enabled = !auto.enabled;
    return delay(auto);
  },
  deleteAutomation: (id: string) => {
    const idx = mockAutomations.findIndex((a) => a.id === id);
    if (idx >= 0) mockAutomations.splice(idx, 1);
    return delay(true);
  },

  // WhatsApp
  getWhatsAppConnection: () => delay(currentWhatsApp),
  getDisconnectedWhatsAppConnection: () => delay(disconnectedWhatsAppConnection),

  connectWhatsApp: (payload: {
    accessToken?: string;
    code?: string;
    wabaId?: string; // optional: classic login doesn't provide these
    phoneNumberId?: string;
  }) => {
    currentWhatsApp = {
      ...whatsappConnection,
      status: 'Connected' as const,
      ...(payload.wabaId ? { businessAccountId: payload.wabaId } : {}),
      ...(payload.phoneNumberId ? { phoneNumberId: payload.phoneNumberId } : {}),
      connectionDate: new Date().toISOString(),
    };
    return delay(currentWhatsApp, 1200);
  },

  disconnectWhatsApp: () => {
    currentWhatsApp =
      disconnectedWhatsAppConnection as unknown as WhatsAppConnection;
    return delay(currentWhatsApp, 800);
  },

  // Billing
  getBillingPlan: () => delay(billingPlan),
  getUsage: () => delay(usage),
  getPricingPlans: () => delay(pricingPlans),
  getInvoices: () => delay([...mockInvoices]),

  // Settings
  getApiKeys: () => delay([...mockApiKeys]),
  getWebhooks: () => delay([...mockWebhooks]),
  getTeamMembers: () => delay([...mockTeamMembers]),
  getCurrentUser: () => delay(currentUser),
  getOrganizations: () => delay(organizations),
};

export type Api = typeof api;