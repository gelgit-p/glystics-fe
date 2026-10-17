export type DeliveryStatus =
  | 'Created'
  | 'Pickup Scheduled'
  | 'Picked Up'
  | 'In Transit'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Failed';

export type NotificationStatus = 'Queued' | 'Sent' | 'Delivered' | 'Read' | 'Failed';

export type TemplateStatus = 'Approved' | 'Pending' | 'Rejected' | 'Draft';

export type WhatsAppStatus = 'Connected' | 'Disconnected' | 'Connecting';

export interface Delivery {
  id: string;
  trackingId: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  packageName: string;
  category: string;
  weight: string;
  dimensions: string;
  value: string;
  pickupDate: string;
  deliveryType: string;
  courier: string;
  instructions: string;
  status: DeliveryStatus;
  createdAt: string;
  updatedAt: string;
  origin: string;
  destination: string;
  timeline: TimelineEvent[];
  notifications: DeliveryNotification[];
}

export interface TimelineEvent {
  status: string;
  timestamp: string;
  completed: boolean;
  current?: boolean;
  description: string;
}

export interface DeliveryNotification {
  id: string;
  template: string;
  status: NotificationStatus;
  sentAt: string;
}

export interface Notification {
  id: string;
  recipient: string;
  recipientPhone: string;
  template: string;
  templateBody: string;
  deliveryId: string;
  trackingId: string;
  status: NotificationStatus;
  sentAt: string;
  readAt: string | null;
  deliveredAt: string | null;
  whatsappMessageId: string;
  parameters: Record<string, string>;
  error: string | null;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  status: TemplateStatus;
  header: string;
  body: string;
  footer: string;
  buttons: string[];
  variables: string[];
  language: string;
  createdAt: string;
}

export interface Automation {
  id: string;
  name: string;
  enabled: boolean;
  trigger: string;
  triggerValue: string | null;
  condition: string;
  action: string;
  actionTemplate: string;
  lastTriggered: string | null;
  totalRuns: number;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string;
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: string;
  status: 'Paid' | 'Pending' | 'Failed';
  plan: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Member';
  status: 'Active' | 'Invited';
  avatar: string;
}
