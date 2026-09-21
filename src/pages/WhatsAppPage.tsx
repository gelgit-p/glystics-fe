import { useEffect, useState } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  MessageCircle,
  Check,
  RefreshCw,
  Unplug,
  Settings,
  Webhook,
  Send,
  Mail,
  MailOpen,
  XCircle,
  Building2,
  Phone,
  Hash,
  Calendar,
  Loader2,
  AlertTriangle,
  Shield,
  Zap,
  Bell,
} from 'lucide-react';

import { api } from '@/lib/api';
import {
  PageHeader,
  StatusBadge,
  LoadingState,
} from '@/components/shared';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Local alias instead of `declare global`, so it can't clash with any
// existing Facebook SDK typings in the project.
const fbWindow = window as unknown as {
  FB?: any;
  fbAsyncInit?: () => void;
};

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>

      <span className="text-sm font-medium">
        {value}
      </span>
    </div>
  );
}

function HealthStat({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {label}
        </span>

        <div
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-lg',
            color,
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>

      <p className="mt-2 text-xl font-bold">
        {value}
      </p>
    </div>
  );
}

function DisconnectedView({
  onConnect,
  connecting,
}: {
  onConnect: () => void;
  connecting: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border bg-red-50/50 px-6 py-4 dark:bg-red-950/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>

            <div>
              <h3 className="text-base font-semibold text-red-900 dark:text-red-200">
                WhatsApp Business Not Connected
              </h3>

              <p className="text-sm text-red-700 dark:text-red-300">
                Connect your WhatsApp Business account to
                start sending notifications.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 lg:p-8">
          <div className="mx-auto max-w-lg text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>

            <h2 className="text-xl font-bold">
              Connect WhatsApp Business
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Connect your WhatsApp Business account through
              Meta to start sending automated delivery
              notifications.
            </p>

            <Button
              size="lg"
              className="mt-6 w-full sm:w-auto"
              onClick={onConnect}
              disabled={connecting}
            >
              {connecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Connect WhatsApp Business
                </>
              )}
            </Button>

            <div className="mt-8 space-y-3 text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                How to connect
              </p>

              {[
                {
                  icon: Building2,
                  title: 'Select your WhatsApp Business account',
                  desc: 'Meta will guide you through the business onboarding process.',
                },
                {
                  icon: Shield,
                  title: 'Authorize Glystics',
                  desc: 'Give Glystics permission to manage your WhatsApp Business assets.',
                },
                {
                  icon: Bell,
                  title: 'Start sending notifications',
                  desc: 'Your WhatsApp connection will be available after onboarding.',
                },
              ].map((step, index) => {
                const Icon = step.icon;

                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-lg border border-border p-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent">
                      <Icon className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-sm font-medium">
                        {step.title}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950">
              <Bell className="h-4 w-4 text-amber-600" />
            </div>

            <span className="text-sm font-medium">
              Notifications Paused
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            All automated WhatsApp notifications are on hold
            until you reconnect.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950">
              <Zap className="h-4 w-4 text-blue-600" />
            </div>

            <span className="text-sm font-medium">
              Automations Inactive
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            Your workflow automations will resume automatically
            after reconnection.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950">
              <RefreshCw className="h-4 w-4 text-emerald-600" />
            </div>

            <span className="text-sm font-medium">
              Data Preserved
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            Your deliveries, contacts, and templates remain
            safe during disconnection.
          </p>
        </div>
      </div>
    </div>
  );
}

const FACEBOOK_APP_ID = '1094705089173300';

let sdkPromise: Promise<void> | null = null;

const loadFacebookSDK = (): Promise<void> => {
  if (fbWindow.FB) {
    return Promise.resolve();
  }

  if (sdkPromise) {
    return sdkPromise;
  }

  sdkPromise = new Promise((resolve, reject) => {
    fbWindow.fbAsyncInit = () => {
      try {
        fbWindow.FB.init({
          appId: FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v25.0',
        });

        resolve();
      } catch (error) {
        sdkPromise = null;
        reject(error);
      }
    };

    // Script already in the DOM (e.g. hot reload): fbAsyncInit above
    // will still be called once it finishes loading.
    if (document.getElementById('facebook-jssdk')) {
      return;
    }

    const script = document.createElement('script');

    script.id = 'facebook-jssdk';
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;

    script.onerror = () => {
      sdkPromise = null;
      reject(new Error('Failed to load Facebook SDK'));
    };

    document.body.appendChild(script);
  });

  return sdkPromise;
};

// Set to true to print the raw access token in the console (debugging only).
const LOG_FULL_TOKEN = false;

const maskToken = (token?: string) =>
  !token || LOG_FULL_TOKEN ? token : `${token.slice(0, 8)}...${token.slice(-4)}`;

const fbApi = <T = any,>(path: string, params: Record<string, any> = {}) =>
  new Promise<T>((resolve, reject) => {
    fbWindow.FB.api(path, params, (res: any) => {
      if (!res || res.error) reject(res?.error ?? new Error('Empty response'));
      else resolve(res);
    });
  });

// Logs everything Facebook gives us after a successful login.
const logFacebookDetails = async (loginResponse: any) => {
  const auth = loginResponse?.authResponse ?? {};

  console.group('[Facebook] Login success');
  console.log('Raw login response:', {
    ...loginResponse,
    authResponse: { ...auth, accessToken: maskToken(auth.accessToken) },
  });
  console.log('Status:', loginResponse?.status);
  console.log('User ID:', auth.userID);
  console.log('Granted scopes:', auth.grantedScopes);
  console.log('Expires in (s):', auth.expiresIn);
  console.log('Data access expires at:', auth.data_access_expiration_time);

  let getUserId = localStorage.getItem('userId')
    const saveFacebookConnection = async (authResponse: any) => {
    const response = await fetch(
      `${process.env.API_URL}/auth/update-user/${getUserId}`,
      {
        method: 'POST',
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          facebookAccessToken: authResponse.accessToken,
          grantedScopes: authResponse.grantedScopes,
          accessTokenExpiresIn: String(authResponse.expiresIn),
          facebookConnectStatus: true,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to save Facebook connection');
    }

    return response.json();
  };

  const calls: Array<[string, string, Record<string, any>]> = [
    ['Profile (/me)', '/me', { fields: 'id,name,email' }],
    ['Permissions (/me/permissions)', '/me/permissions', {}],
    [
      'Businesses & WhatsApp accounts (/me/businesses)',
      '/me/businesses',
      {
        fields:
          'id,name,owned_whatsapp_business_accounts{id,name,currency,timezone_id,phone_numbers{id,display_phone_number,verified_name,quality_rating}}',
      },
    ],
  ];

  for (const [label, path, params] of calls) {
    try {
      console.log(`${label}:`, await fbApi(path, params));
    } catch (error) {
      console.warn(`${label} failed:`, error);
    }
  }

  console.groupEnd();
};

export default function WhatsAppPage() {
  const queryClient = useQueryClient();

  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  // Disconnected by default; only true after Facebook authentication succeeds.
  const [fbConnected, setFbConnected] = useState(false);

  const { data: conn, isLoading } = useQuery({
    queryKey: ['whatsapp-connection'],
    queryFn: () => api.getWhatsAppConnection(),
  });

  // Preload the SDK so FB.login can run synchronously inside the click.
  useEffect(() => {
    loadFacebookSDK().catch((error) => {
      console.error('Facebook SDK failed to load:', error);
      toast.error(
        'Could not load the Facebook SDK. Disable ad blockers and try again.',
      );
    });
  }, []);

  const saveConnection = async (accessToken: string) => {
    try {
      setConnecting(true);

      // The backend should look up the WhatsApp Business Account and phone
      // number itself using this token (see notes), then store the connection.
      await api.connectWhatsApp({ accessToken } as any);

      await queryClient.invalidateQueries({
        queryKey: ['whatsapp-connection'],
      });

      toast.success('WhatsApp Business account connected successfully');
    } catch (error) {
      console.error('Failed to save WhatsApp connection:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to save WhatsApp connection',
      );
    } finally {
      setConnecting(false);
    }
  };

  const launchWhatsAppSignup = async () => {
    setConnecting(true);

    try {
      await loadFacebookSDK();

      // FB.login requires a plain (non-async) callback.
      fbWindow.FB.login(
        (response: any) => {
          const accessToken = response?.authResponse?.accessToken;

          if (!accessToken) {
            // User closed the popup or declined.
            console.warn('[Facebook] Login cancelled or failed:', response);
            setFbConnected(false);
            setConnecting(false);
            toast.info('WhatsApp connection was cancelled');
            return;
          }

          setFbConnected(true);
          void logFacebookDetails(response);
          void saveConnection(accessToken);
        },
        {
          // Same classic login that works in the standalone HTML test.
          scope:
            'public_profile,email,whatsapp_business_management,whatsapp_business_messaging',
          return_scopes: true,
        },
      );
    } catch (error) {
      setConnecting(false);
      toast.error(
        error instanceof Error ? error.message : 'Failed to connect WhatsApp',
      );
    }
  };

  const handleDisconnect = async () => {
    try {
      setDisconnecting(true);
      await api.disconnectWhatsApp();
      setFbConnected(false);
      await queryClient.invalidateQueries({
        queryKey: ['whatsapp-connection'],
      });
      toast.success('WhatsApp Business disconnected');
    } catch (error) {
      console.error('Failed to disconnect WhatsApp:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to disconnect WhatsApp',
      );
    } finally {
      setDisconnecting(false);
    }
  };

  if (isLoading || !conn) {
    return <LoadingState text="Loading WhatsApp connection..." />;
  }

  // Driven by Facebook authentication, not by the backend default status.
  // Once the backend returns real data, use: conn.status === 'Connected'
  const isConnected = fbConnected;

  return (
    <div>
      <PageHeader
        title="WhatsApp"
        description="Manage your WhatsApp Business connection and message health."
      />

      {!isConnected ? (
        <DisconnectedView
          onConnect={launchWhatsAppSignup}
          connecting={connecting}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Connection status */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-base font-semibold">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Connection Status
                </h3>

                <StatusBadge status={conn.status} />
              </div>

              <div className="divide-y divide-border border-y border-border">
                <InfoRow
                  icon={Building2}
                  label="Business name"
                  value={conn.businessName}
                />

                <InfoRow
                  icon={Phone}
                  label="Phone number"
                  value={conn.phoneNumber}
                />

                <InfoRow
                  icon={Hash}
                  label="Business Account ID"
                  value={conn.businessAccountId}
                />

                <InfoRow
                  icon={Hash}
                  label="Phone Number ID"
                  value={conn.phoneNumberId}
                />

                <InfoRow
                  icon={Calendar}
                  label="Connection date"
                  value={new Date(
                    conn.connectionDate,
                  ).toLocaleDateString('en-NG', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={launchWhatsAppSignup}
                  disabled={connecting}
                >
                  {connecting ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Reconnecting...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-3.5 w-3.5" />
                      Reconnect
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                >
                  {disconnecting ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    <>
                      <Unplug className="mr-2 h-3.5 w-3.5" />
                      Disconnect
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.info('Opening WhatsApp Manager...')}
                >
                  <Settings className="mr-2 h-3.5 w-3.5" />
                  Manage
                </Button>
              </div>
            </div>

            {/* Webhook status */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-base font-semibold">
                  <Webhook className="h-5 w-5 text-muted-foreground" />
                  Webhook Status
                </h3>

                <StatusBadge status={conn.webhookStatus} />
              </div>

              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950">
                    <Check className="h-5 w-5 text-emerald-600" />
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      Webhook is active
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Last event received:{' '}
                      {conn.lastEvent}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Subscribed Events
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    'message.sent',
                    'message.delivered',
                    'message.read',
                    'message.failed',
                    'delivery.created',
                    'delivery.updated',
                    'delivery.delivered',
                  ].map((event) => (
                    <span
                      key={event}
                      className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-muted-foreground"
                    >
                      {event}
                    </span>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => toast.info('Opening webhook settings...')}
              >
                <Settings className="mr-2 h-3.5 w-3.5" />
                Configure Webhook
              </Button>
            </div>
          </div>

          {/* Message health */}
          <div>
            <h3 className="mb-4 text-base font-semibold">
              Message Health
            </h3>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <HealthStat
                label="Sent"
                value={conn.messageHealth.sent.toLocaleString()}
                icon={Send}
                color="bg-primary/10 text-primary"
              />

              <HealthStat
                label="Delivered"
                value={conn.messageHealth.delivered.toLocaleString()}
                icon={Mail}
                color="bg-blue-50 text-blue-600 dark:bg-blue-950"
              />

              <HealthStat
                label="Read"
                value={conn.messageHealth.read.toLocaleString()}
                icon={MailOpen}
                color="bg-emerald-50 text-emerald-600 dark:bg-emerald-950"
              />

              <HealthStat
                label="Failed"
                value={conn.messageHealth.failed.toLocaleString()}
                icon={XCircle}
                color="bg-red-50 text-red-600 dark:bg-red-950"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}