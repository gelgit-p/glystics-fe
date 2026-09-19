import {
  deliveries as mockDeliveries,
  notifications as mockNotifications,
  templates as mockTemplates,
  automations as mockAutomations,
  contacts as mockContacts,
  apiKeys as mockApiKeys,
  webhooks as mockWebhooks,
  invoices as mockInvoices,
  teamMembers as mockTeamMembers,
  dashboardStats,
  deliveryActivityData,
  messageVolumeData,
  deliveryRateData,
  readRateData,
  notificationBreakdownData,
  engagementData,
  billingPlan,
  usage,
  pricingPlans,
  whatsappConnection,
  disconnectedWhatsAppConnection,
  currentUser,
  organizations,
} from './mock-data';
import type {
  Delivery,
  Notification,
  Template,
  Automation,
  Contact,
  ApiKey,
  Webhook,
  Invoice,
  TeamMember,
} from '@/types';

function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export const api = {
  // Dashboard
  getDashboardStats: () => delay(dashboardStats),
  getDeliveryActivity: (range: string = '7days') => delay(deliveryActivityData),

  // Deliveries
  getDeliveries: (filters?: { search?: string; status?: string; courier?: string }) => {
    let result = [...mockDeliveries];
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
    return delay(result);
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

  // Contacts
  getContacts: (search?: string) => {
    let result = [...mockContacts];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q));
    }
    return delay(result);
  },
  getContact: (id: string) => delay(mockContacts.find((c) => c.id === id)),

  // WhatsApp
  getWhatsAppConnection: () => delay(whatsappConnection),
  getDisconnectedWhatsAppConnection: () => delay(disconnectedWhatsAppConnection),
  connectWhatsApp: () => {
    const connected = { ...whatsappConnection, status: 'Connected' as const, connectionDate: new Date().toISOString() };
    return delay(connected, 1200);
  },
  disconnectWhatsApp: () => {
    return delay(disconnectedWhatsAppConnection, 800);
  },

  // Analytics
  getMessageVolume: () => delay(messageVolumeData),
  getDeliveryRate: () => delay(deliveryRateData),
  getReadRate: () => delay(readRateData),
  getNotificationBreakdown: () => delay(notificationBreakdownData),
  getEngagement: () => delay(engagementData),

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
