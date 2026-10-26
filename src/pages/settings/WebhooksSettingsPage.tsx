
import { useState } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

import {
  Webhook,
  Check,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

import { api } from '@/lib/api';

import { LoadingState, StatusBadge } from '@/components/shared';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const API_BASE_URL = 'https://glystics.onrender.com';

const allEvents = [
  'message.sent',
  'message.delivered',
  'message.read',
  'message.failed',
  'delivery.created',
  'delivery.updated',
  'delivery.delivered',
];

type WebhookSubscription = {
  id?: string;
  url?: string;
  callback_uri?: string;
  override_callback_uri?: string;
  active?: boolean;
  events?: string[];
  createdAt?: string;
  created_at?: string;
  status?: string;
  [key: string]: unknown;
};

type SubscriptionPayload = {
  userId: string;
  override_callback_uri: string;
  verify_token: string;
};

async function getSubscriptions(): Promise<WebhookSubscription[]> {
  const response = await fetch(
    `${API_BASE_URL}/whatsapp/get-subscriptions`,
    {
      method: 'GET',
      headers: {
        Accept: '*/*',
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch subscriptions (${response.status})`,
    );
  }

  const data = await response.json();

  // Accommodate common API response formats.
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.subscriptions)) {
    return data.subscriptions;
  }

  if (Array.isArray(data?.webhooks)) {
    return data.webhooks;
  }

  return [];
}


async function subscribeWebhook(
  payload: {
    userId: string;
    override_callback_uri: string;
    verify_token: string;
  }
) {
  const params = new URLSearchParams({
    userId: payload.userId,
    override_callback_uri: payload.override_callback_uri,
    verify_token: payload.verify_token,
  });

  const response = await fetch(
    `https://glystics.onrender.com/whatsapp/subscribe?${params}`,
    {
      method: 'POST',
      headers: {
        Accept: '*/*',
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      (await response.text()) ||
        `Subscription failed (${response.status})`
    );
  }

  const contentType = response.headers.get('content-type');

  return contentType?.includes('application/json')
    ? response.json()
    : response.text();
}

export default function WebhooksSettingsPage() {
  const queryClient = useQueryClient();

 const [userId] = useState(() =>
  typeof window !== 'undefined'
    ? localStorage.getItem('userId') ?? ''
    : ''
);
  const [url, setUrl] = useState('');
  const [verifyToken, setVerifyToken] = useState('');

  const [events, setEvents] = useState<Record<string, boolean>>(
    Object.fromEntries(allEvents.map((event) => [event, true])),
  );

  const {
    data: webhooks = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['webhooks'],
    queryFn: getSubscriptions,
    retry: 1,
  });

  const subscribeMutation = useMutation({
    mutationFn: subscribeWebhook,

    onSuccess: async () => {
      toast.success('Webhook subscription updated successfully');

      await queryClient.invalidateQueries({
        queryKey: ['webhooks'],
      });

      setVerifyToken('');
    },

    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update webhook');
    },
  });

  const handleSave = () => {
    if (!userId.trim()) {
      toast.error('User ID not found. Please sign in again.');
      return;
    }

    if (!url.trim()) {
      toast.error('Please enter your webhook URL');
      return;
    }

    try {
      const parsedUrl = new URL(url);

      if (parsedUrl.protocol !== 'https:') {
        toast.error('Webhook URL must use HTTPS');
        return;
      }
    } catch {
      toast.error('Please enter a valid webhook URL');
      return;
    }

    if (!verifyToken.trim()) {
      toast.error('Please enter your verification token');
      return;
    }

    subscribeMutation.mutate({
      userId: userId.trim(),
      override_callback_uri: url.trim(),
      verify_token: verifyToken.trim(),
    });
  };

  const getWebhookUrl = (webhook: WebhookSubscription) =>
    webhook.override_callback_uri ??
    webhook.callback_uri ??
    webhook.url ??
    'Callback URL unavailable';

  const getCreatedDate = (webhook: WebhookSubscription) => {
    const date = webhook.createdAt ?? webhook.created_at;

    if (!date) {
      return 'Creation date unavailable';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Creation date unavailable';
    }

    return parsedDate.toLocaleDateString('en-NG', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isWebhookActive = (webhook: WebhookSubscription) => {
    if (typeof webhook.active === 'boolean') {
      return webhook.active;
    }

    return webhook.status?.toLowerCase() === 'active' ||
      webhook.status?.toLowerCase() === 'connected';
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Webhook configuration */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-1 flex items-center gap-2 text-base font-semibold">
          <Webhook className="h-4 w-4 text-muted-foreground" />
          Webhook URL
        </h3>

        <p className="mb-4 text-sm text-muted-foreground">
          Configure the endpoint that receives your WhatsApp webhook
          callbacks.
        </p>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="userId">User ID</Label>
            {/* <Input
              id="userId"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              placeholder="Enter your account user ID"
              autoComplete="off"
            /> */}
            <Input
                id="userId"
                value={userId}
                readOnly
                autoComplete="off"
              />
            <p className="text-xs text-muted-foreground">
              The userId passed to the WhatsApp subscription API.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="webhookUrl">Callback URL</Label>
            <Input
              id="webhookUrl"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://your-domain.com/webhooks/whatsapp"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="verifyToken">Verification Token</Label>
            <Input
              id="verifyToken"
              type="password"
              value={verifyToken}
              onChange={(event) =>
                setVerifyToken(event.target.value)
              }
              placeholder="Enter your verification token"
              autoComplete="new-password"
            />
            <p className="text-xs text-muted-foreground">
              Sent to the API as verify_token. Keep it private.
            </p>
          </div>
        </div>
      </div>

      {/* Event selection */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-1 text-base font-semibold">
          Subscribed Events
        </h3>

        <p className="mb-4 text-sm text-muted-foreground">
          Select the events you want to receive.
        </p>

        <div className="space-y-1">
          {allEvents.map((event) => (
            <div
              key={event}
              className="flex items-center justify-between rounded-lg border border-border p-3"
            >
              <div className="flex items-center gap-2">
                {events[event] ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-border" />
                )}

                <code className="font-mono text-sm">{event}</code>
              </div>

              <Switch
                checked={events[event]}
                onCheckedChange={(checked) =>
                  setEvents((previous) => ({
                    ...previous,
                    [event]: checked,
                  }))
                }
              />
            </div>
          ))}
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Note: The provided subscribe endpoint does not include an
          events parameter. These selections are currently UI-only and
          are not sent to the backend.
        </p>

        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={subscribeMutation.isPending}
          >
            {subscribeMutation.isPending
              ? 'Saving...'
              : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Active subscriptions */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <h3 className="text-base font-semibold">
              Active Webhooks
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Subscriptions returned by your WhatsApp API.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                isFetching ? 'animate-spin' : ''
              }`}
            />
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="p-5">
            <LoadingState />
          </div>
        ) : isError ? (
          <div className="p-5">
            <p className="text-sm text-destructive">
              {error instanceof Error
                ? error.message
                : 'Failed to load webhook subscriptions.'}
            </p>

            <Button
              className="mt-3"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
            >
              Try again
            </Button>
          </div>
        ) : webhooks.length === 0 ? (
          <div className="p-8 text-center">
            <Webhook className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

            <h4 className="font-medium">
              No webhook subscriptions found
            </h4>

            <p className="mt-1 text-sm text-muted-foreground">
              Configure your callback URL above and save to subscribe.
            </p>
          </div>
        ) : (
          <div className="space-y-3 p-5">
            {webhooks.map((webhook, index) => {
              const webhookUrl = getWebhookUrl(webhook);
              const active = isWebhookActive(webhook);
              const webhookEvents = Array.isArray(webhook.events)
                ? webhook.events
                : [];

              return (
                <div
                  key={webhook.id ?? `${webhookUrl}-${index}`}
                  className="flex items-start justify-between gap-4 rounded-lg border border-border p-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="break-all font-mono text-sm">
                        {webhookUrl}
                      </code>

                      {webhookUrl.startsWith('https://') && (
                        <a
                          href={webhookUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Open webhook URL"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>

                    <div className="mt-2">
                      <StatusBadge
                        status={active ? 'Connected' : 'Disconnected'}
                      />
                    </div>

                    <p className="mt-2 text-xs text-muted-foreground">
                      {webhookEvents.length > 0
                        ? `${webhookEvents.length} events subscribed`
                        : 'Event details unavailable'}
                      {' · '}
                      {getCreatedDate(webhook)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
