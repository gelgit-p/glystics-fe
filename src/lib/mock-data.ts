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

const now = new Date();
const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString();
const hoursAgo = (n: number) => new Date(now.getTime() - n * 3600000).toISOString();
const minsAgo = (n: number) => new Date(now.getTime() - n * 60000).toISOString();

export const currentUser = {
  name: 'Michael Okafor',
  email: 'michael@swiftdrop.ng',
  avatar: 'MO',
  role: 'Owner',
  organization: 'SwiftDrop Logistics',
};

export const organizations = [
  { id: 'org-1', name: 'SwiftDrop Logistics', plan: 'Business' },
  { id: 'org-2', name: 'QuickShip NG', plan: 'Growth' },
];

export const dashboardStats = {
  totalDeliveries: 12482,
  delivered: 10921,
  inTransit: 1204,
  failed: 357,
  whatsappMessages: 18420,
  whatsappDelivered: 17921,
  whatsappRead: 16840,
  whatsappFailed: 499,
};

export const deliveryActivityData = [
  { date: 'Mon', created: 320, pickedUp: 280, inTransit: 240, delivered: 200 },
  { date: 'Tue', created: 350, pickedUp: 310, inTransit: 270, delivered: 230 },
  { date: 'Wed', created: 410, pickedUp: 380, inTransit: 320, delivered: 290 },
  { date: 'Thu', created: 380, pickedUp: 340, inTransit: 290, delivered: 260 },
  { date: 'Fri', created: 450, pickedUp: 410, inTransit: 350, delivered: 320 },
  { date: 'Sat', created: 280, pickedUp: 250, inTransit: 210, delivered: 180 },
  { date: 'Sun', created: 190, pickedUp: 160, inTransit: 130, delivered: 110 },
];

export const messageVolumeData = Array.from({ length: 30 }, (_, i) => ({
  date: `${i + 1}`,
  sent: Math.floor(400 + Math.random() * 300),
  delivered: Math.floor(380 + Math.random() * 280),
  read: Math.floor(350 + Math.random() * 260),
}));

export const deliveryRateData = [
  { name: 'Delivered', value: 17921, color: 'hsl(var(--chart-1))' },
  { name: 'Failed', value: 499, color: 'hsl(var(--chart-5))' },
];

export const readRateData = [
  { name: 'Read', value: 16840, color: 'hsl(var(--chart-2))' },
  { name: 'Delivered Only', value: 1081, color: 'hsl(var(--chart-3))' },
];

export const notificationBreakdownData = [
  { name: 'Pickup', value: 4200, color: 'hsl(var(--chart-1))' },
  { name: 'In Transit', value: 3800, color: 'hsl(var(--chart-2))' },
  { name: 'Out for Delivery', value: 3500, color: 'hsl(var(--chart-3))' },
  { name: 'Delivered', value: 5900, color: 'hsl(var(--chart-4))' },
  { name: 'Failed', value: 1020, color: 'hsl(var(--chart-5))' },
];

export const engagementData = {
  avgReadTime: '2.4 min',
  deliveryEngagement: '91.4%',
  failedRate: '2.7%',
};

const couriers = ['Swift Rider', 'ExpressGo', 'DeliverFast', 'Nigeria Post', 'Flash Courier'];
const cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 'Enugu', 'Benin City'];
const categories = ['Electronics', 'Documents', 'Clothing', 'Food', 'Pharmacy', 'Books', 'Other'];
const statuses: Delivery['status'][] = ['Created', 'Pickup Scheduled', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Failed'];
const customerNames = ['Adebayo Johnson', 'Chioma Eze', 'Ibrahim Musa', 'Funke Adebola', 'Tunde Bakare', 'Ngozi Okoro', 'Emeka Obi', 'Fatima Bello', 'David Okafor', 'Sarah Adeyemi', 'Yusuf Aliyu', 'Grace Eze'];
const phones = ['+234 801 234 5678', '+234 802 345 6789', '+234 803 456 7890', '+234 805 567 8901', '+234 807 678 9012', '+234 809 789 0123'];

function buildTimeline(status: Delivery['status']): Delivery['timeline'] {
  const allSteps = ['Order Created', 'Pickup Scheduled', 'Rider Assigned', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered'];
  const statusIndex = statuses.indexOf(status);
  const failedAt = status === 'Failed' ? 5 : -1;

  return allSteps.map((step, i) => {
    const completed = i < statusIndex || (status === 'Failed' && i < failedAt);
    const current = i === statusIndex;
    return {
      status: step,
      timestamp: completed ? hoursAgo((statusIndex - i) * 3 + 2) : '',
      completed,
      current,
      description: completed ? `Step completed successfully` : current ? 'In progress' : 'Pending',
    };
  });
}

function buildNotifications(status: Delivery['status']): Delivery['notifications'] {
  const notifs: Delivery['notifications'][] = [];
  const statusIndex = statuses.indexOf(status);
  const templates = ['pickup_scheduled', 'rider_assigned', 'in_transit', 'out_for_delivery', 'delivered'];
  return templates.slice(0, Math.min(statusIndex, 5)).map((t, i) => ({
    id: `notif-${i}`,
    template: t,
    status: 'Delivered' as const,
    sentAt: hoursAgo((statusIndex - i) * 3),
  }));
}

export const deliveries: Delivery[] = Array.from({ length: 48 }, (_, i) => {
  const status = statuses[i % statuses.length];
  const sender = customerNames[i % customerNames.length];
  const receiver = customerNames[(i + 5) % customerNames.length];
  const origin = cities[i % cities.length];
  const dest = cities[(i + 3) % cities.length];
  return {
    id: `del-${i + 1}`,
    trackingId: `SD${String(12340 + i).padStart(5, '0')}`,
    senderName: sender,
    senderPhone: phones[i % phones.length],
    senderAddress: `${i + 10} Main St, ${origin}`,
    receiverName: receiver,
    receiverPhone: phones[(i + 2) % phones.length],
    receiverAddress: `${i + 5} Adeola St, ${dest}`,
    packageName: `Package ${i + 1}`,
    category: categories[i % categories.length],
    weight: `${(0.5 + i * 0.3).toFixed(1)} kg`,
    dimensions: `${20 + i}x${15 + i}x${10 + i} cm`,
    value: `₦${(5000 + i * 1500).toLocaleString()}`,
    pickupDate: daysAgo(i % 7),
    deliveryType: i % 2 === 0 ? 'Standard' : 'Express',
    courier: couriers[i % couriers.length],
    instructions: 'Handle with care. Ring bell on arrival.',
    status,
    createdAt: daysAgo(i % 30),
    updatedAt: hoursAgo(i % 48),
    origin,
    destination: dest,
    timeline: buildTimeline(status),
    notifications: buildNotifications(status),
  };
});

export const notifications: Notification[] = Array.from({ length: 40 }, (_, i) => {
  const status: Notification['status'] = (['Sent', 'Delivered', 'Read', 'Failed', 'Queued'] as const)[i % 5];
  const delivery = deliveries[i % deliveries.length];
  const template = ['pickup_scheduled', 'rider_assigned', 'in_transit', 'out_for_delivery', 'delivered', 'delivery_failed'][i % 6];
  return {
    id: `notif-${i + 1}`,
    recipient: delivery.receiverName,
    recipientPhone: delivery.receiverPhone,
    template,
    templateBody: `Hi ${delivery.receiverName.split(' ')[0]}, your package ${delivery.trackingId} has been ${template.replace(/_/g, ' ')}.`,
    deliveryId: delivery.id,
    trackingId: delivery.trackingId,
    status,
    sentAt: hoursAgo(i * 2),
    readAt: status === 'Read' ? hoursAgo(i * 2 - 1) : null,
    deliveredAt: status === 'Delivered' || status === 'Read' ? hoursAgo(i * 2 - 1) : null,
    whatsappMessageId: `wamid.${Math.random().toString(36).substring(2, 15)}`,
    parameters: {
      customer_name: delivery.receiverName,
      tracking_id: delivery.trackingId,
      pickup_date: delivery.pickupDate,
      delivery_time: '2:00 PM',
    },
    error: status === 'Failed' ? 'Recipient phone number not on WhatsApp' : null,
  };
});

export const templates: Template[] = [
  {
    id: 'tpl-1',
    name: 'pickup_scheduled',
    category: 'Utility',
    status: 'Approved',
    header: 'Package Pickup Scheduled',
    body: 'Hi {{customer_name}},\n\nYour package {{tracking_id}} has been scheduled for pickup.\n\nPickup date: {{pickup_date}}',
    footer: 'SwiftDrop Logistics',
    buttons: ['Track Package'],
    variables: ['customer_name', 'tracking_id', 'pickup_date'],
    language: 'English',
    createdAt: daysAgo(20),
  },
  {
    id: 'tpl-2',
    name: 'out_for_delivery',
    category: 'Utility',
    status: 'Approved',
    header: 'Out for Delivery',
    body: 'Hi {{customer_name}},\n\nYour package {{tracking_id}} is out for delivery.\n\nExpected delivery: {{delivery_time}}',
    footer: 'SwiftDrop Logistics',
    buttons: ['Track Package', 'Reschedule'],
    variables: ['customer_name', 'tracking_id', 'delivery_time'],
    language: 'English',
    createdAt: daysAgo(18),
  },
  {
    id: 'tpl-3',
    name: 'delivered',
    category: 'Utility',
    status: 'Approved',
    header: 'Package Delivered',
    body: 'Hi {{customer_name}},\n\nYour package {{tracking_id}} has been delivered successfully.',
    footer: 'SwiftDrop Logistics',
    buttons: ['Confirm Receipt'],
    variables: ['customer_name', 'tracking_id'],
    language: 'English',
    createdAt: daysAgo(15),
  },
  {
    id: 'tpl-4',
    name: 'delivery_failed',
    category: 'Utility',
    status: 'Approved',
    header: 'Delivery Attempt Failed',
    body: 'Hi {{customer_name}},\n\nWe attempted to deliver your package {{tracking_id}} but were unsuccessful.\n\nPlease contact us to reschedule.',
    footer: 'SwiftDrop Logistics',
    buttons: ['Reschedule', 'Contact Support'],
    variables: ['customer_name', 'tracking_id'],
    language: 'English',
    createdAt: daysAgo(10),
  },
  {
    id: 'tpl-5',
    name: 'rider_assigned',
    category: 'Utility',
    status: 'Approved',
    header: 'Rider Assigned',
    body: 'Hi {{customer_name}},\n\nA rider has been assigned to your package {{tracking_id}}.\n\nRider: {{rider_name}}',
    footer: 'SwiftDrop Logistics',
    buttons: ['Track Package'],
    variables: ['customer_name', 'tracking_id', 'rider_name'],
    language: 'English',
    createdAt: daysAgo(8),
  },
  {
    id: 'tpl-6',
    name: 'in_transit',
    category: 'Utility',
    status: 'Approved',
    header: 'Package In Transit',
    body: 'Hi {{customer_name}},\n\nYour package {{tracking_id}} is now in transit to {{destination}}.',
    footer: 'SwiftDrop Logistics',
    buttons: ['Track Package'],
    variables: ['customer_name', 'tracking_id', 'destination'],
    language: 'English',
    createdAt: daysAgo(5),
  },
  {
    id: 'tpl-7',
    name: 'welcome_message',
    category: 'Marketing',
    status: 'Pending',
    header: 'Welcome to SwiftDrop',
    body: 'Hi {{customer_name}},\n\nWelcome to SwiftDrop Logistics! We\'re excited to serve you.\n\nTrack your deliveries anytime with our platform.',
    footer: 'SwiftDrop Logistics',
    buttons: ['Get Started'],
    variables: ['customer_name'],
    language: 'English',
    createdAt: daysAgo(2),
  },
  {
    id: 'tpl-8',
    name: 'delivery_reschedule',
    category: 'Utility',
    status: 'Draft',
    header: 'Delivery Rescheduled',
    body: 'Hi {{customer_name}},\n\nYour delivery for package {{tracking_id}} has been rescheduled to {{new_date}}.',
    footer: 'SwiftDrop Logistics',
    buttons: ['Confirm', 'Reschedule Again'],
    variables: ['customer_name', 'tracking_id', 'new_date'],
    language: 'English',
    createdAt: daysAgo(1),
  },
];

export const automations: Automation[] = [
  {
    id: 'auto-1',
    name: 'Out for Delivery Alert',
    enabled: true,
    trigger: 'Shipment status changes',
    triggerValue: 'Out for Delivery',
    condition: 'Status = Out for Delivery',
    action: 'Send WhatsApp template',
    actionTemplate: 'out_for_delivery',
    lastTriggered: minsAgo(12),
    totalRuns: 3200,
  },
  {
    id: 'auto-2',
    name: 'Delivery Failed Alert',
    enabled: true,
    trigger: 'Delivery fails',
    triggerValue: 'Failed',
    condition: 'Status = Failed',
    action: 'Send WhatsApp template',
    actionTemplate: 'delivery_failed',
    lastTriggered: hoursAgo(3),
    totalRuns: 357,
  },
  {
    id: 'auto-3',
    name: 'Delivery Completed Alert',
    enabled: true,
    trigger: 'Package is delivered',
    triggerValue: 'Delivered',
    condition: 'Status = Delivered',
    action: 'Send WhatsApp template',
    actionTemplate: 'delivered',
    lastTriggered: minsAgo(5),
    totalRuns: 10921,
  },
  {
    id: 'auto-4',
    name: 'Pickup Scheduled Alert',
    enabled: true,
    trigger: 'Shipment status changes',
    triggerValue: 'Pickup Scheduled',
    condition: 'Status = Pickup Scheduled',
    action: 'Send WhatsApp template',
    actionTemplate: 'pickup_scheduled',
    lastTriggered: hoursAgo(1),
    totalRuns: 4200,
  },
  {
    id: 'auto-5',
    name: 'Rider Assignment Alert',
    enabled: false,
    trigger: 'Rider assigned',
    triggerValue: 'Rider Assigned',
    condition: 'Status = Rider Assigned',
    action: 'Send WhatsApp template',
    actionTemplate: 'rider_assigned',
    lastTriggered: daysAgo(2),
    totalRuns: 1800,
  },
  {
    id: 'auto-6',
    name: 'In Transit Update',
    enabled: true,
    trigger: 'Shipment status changes',
    triggerValue: 'In Transit',
    condition: 'Status = In Transit',
    action: 'Send WhatsApp template',
    actionTemplate: 'in_transit',
    lastTriggered: hoursAgo(2),
    totalRuns: 3800,
  },
];

export const contacts: Contact[] = Array.from({ length: 24 }, (_, i) => ({
  id: `contact-${i + 1}`,
  name: customerNames[i % customerNames.length] + (i > 11 ? ' Jr' : ''),
  phone: phones[i % phones.length],
  totalDeliveries: Math.floor(Math.random() * 50) + 1,
  lastDelivery: daysAgo(i % 20),
  whatsappStatus: i % 4 === 0 ? 'Inactive' : 'Active',
  email: `customer${i + 1}@email.com`,
  address: `${i + 10} Adeola St, ${cities[i % cities.length]}`,
  createdAt: daysAgo(i * 3),
}));

export const apiKeys: ApiKey[] = [
  { id: 'key-1', name: 'Production API Key', key: 'sk_live_aB3xK9pQ2mN7vR4tZ', createdAt: daysAgo(30), lastUsed: minsAgo(5) },
  { id: 'key-2', name: 'Webhook Integration', key: 'sk_live_xY7wL2jH8kF5dT1', createdAt: daysAgo(15), lastUsed: hoursAgo(2) },
];

export const webhooks: Webhook[] = [
  {
    id: 'wh-1',
    url: 'https://api.swiftdrop.ng/webhooks/whatsapp',
    events: ['message.sent', 'message.delivered', 'message.read', 'message.failed', 'delivery.created', 'delivery.updated', 'delivery.delivered'],
    active: true,
    createdAt: daysAgo(25),
  },
];

export const invoices: Invoice[] = Array.from({ length: 6 }, (_, i) => ({
  id: `inv-${i + 1}`,
  number: `INV-2026-${String(1000 + i).padStart(4, '0')}`,
  date: daysAgo(i * 30),
  amount: '₦75,000',
  status: i === 0 ? 'Pending' : 'Paid',
  plan: 'Business Plan',
}));

export const teamMembers: TeamMember[] = [
  { id: 'tm-1', name: 'Michael Okafor', email: 'michael@swiftdrop.ng', role: 'Owner', status: 'Active', avatar: 'MO' },
  { id: 'tm-2', name: 'Sarah Adeyemi', email: 'sarah@swiftdrop.ng', role: 'Admin', status: 'Active', avatar: 'SA' },
  { id: 'tm-3', name: 'Tunde Bakare', email: 'tunde@swiftdrop.ng', role: 'Member', status: 'Active', avatar: 'TB' },
  { id: 'tm-4', name: 'Ngozi Okoro', email: 'ngozi@swiftdrop.ng', role: 'Member', status: 'Invited', avatar: 'NO' },
];

export const billingPlan = {
  name: 'Business Plan',
  price: '₦75,000',
  period: 'month',
  renewalDate: daysAgo(-10),
};

export const usage = {
  whatsappMessages: { used: 18420, total: 50000 },
  deliveries: { used: 12482, total: 20000 },
  contacts: { used: 1240, total: 5000 },
};

export const pricingPlans = [
  {
    name: 'Starter',
    price: '₦25,000',
    period: 'month',
    features: ['5,000 WhatsApp messages/mo', '1,000 deliveries/mo', '5 team members', 'Basic analytics', 'Email support'],
    current: false,
  },
  {
    name: 'Growth',
    price: '₦75,000',
    period: 'month',
    features: ['20,000 WhatsApp messages/mo', '10,000 deliveries/mo', '15 team members', 'Advanced analytics', 'Priority support', 'Webhooks & API'],
    current: false,
  },
  {
    name: 'Business',
    price: '₦200,000',
    period: 'month',
    features: ['50,000 WhatsApp messages/mo', 'Unlimited deliveries', 'Unlimited team members', 'Custom analytics', '24/7 support', 'Webhooks & API', 'Custom templates'],
    current: true,
  },
];

export const whatsappConnection = {
  status: 'Connected' as const,
  businessName: 'SwiftDrop Logistics',
  phoneNumber: '+234 801 234 5678',
  businessAccountId: 'BWA_1234567890',
  phoneNumberId: 'PHN_9876543210',
  connectionDate: daysAgo(45),
  webhookStatus: 'Connected' as const,
  lastEvent: minsAgo(2),
  messageHealth: {
    sent: 18420,
    delivered: 17921,
    read: 16840,
    failed: 499,
  },
};

export const disconnectedWhatsAppConnection = {
  status: 'Disconnected' as const,
  businessName: '',
  phoneNumber: '',
  businessAccountId: '',
  phoneNumberId: '',
  connectionDate: '',
  webhookStatus: 'Disconnected' as const,
  lastEvent: '',
  messageHealth: {
    sent: 0,
    delivered: 0,
    read: 0,
    failed: 0,
  },
};
