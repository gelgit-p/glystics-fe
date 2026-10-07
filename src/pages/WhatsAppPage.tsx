import { useEffect, useState } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input'; 

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  appId,
  onAppIdChange,
}: {
  onConnect: () => void;
  connecting: boolean;
  appId: string;
  onAppIdChange: (value: string) => void;
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

            {/* <Button
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
            </Button> */}

            <form
  className="mt-6 space-y-4 text-left"
  onSubmit={(e) => {
    e.preventDefault();
    onConnect();
  }}
>
  <div className="space-y-1.5">
    <label htmlFor="facebook-app-id" className="text-sm font-medium">
      Facebook App ID
    </label>

    <Input
      id="facebook-app-id"
      inputMode="numeric"
      placeholder="e.g. 1094705089173300"
      value={appId}
      onChange={(e) => onAppIdChange(e.target.value)}
      disabled={connecting}
      autoComplete="off"
    />

    <p className="text-xs text-muted-foreground">
      Find this in your Meta App Dashboard under App settings → Basic.
    </p>
  </div>

  <Button
    type="submit"
    size="lg"
    className="w-full"
    disabled={connecting || !appId.trim()}
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
</form>

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

interface WabaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businesses: any[];
  onSelectWaba: (waba: any, business: any) => void;
}

function BusinessAccountsDialog({
  open,
  onOpenChange,
  businesses,
  onSelectWaba,
}: WabaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            WhatsApp Business Accounts
          </DialogTitle>

          <DialogDescription>
            Select or review the WhatsApp Business accounts
            available under your Meta businesses.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {businesses.length === 0 ? (
            <div className="rounded-lg border border-border p-6 text-center">
              <Building2 className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

              <p className="font-medium">
                No businesses found
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                No Meta businesses were returned for this account.
              </p>
            </div>
          ) : (
            businesses.map((business) => {
              const accounts =
                business.owned_whatsapp_business_accounts?.data ?? [];

              return (
                <div
                  key={business.id}
                  className="overflow-hidden rounded-xl border border-border"
                >
                  {/* Business header */}
                  <div className="border-b border-border bg-muted/40 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-semibold">
                          {business.name}
                        </h3>

                        <p className="mt-1 font-mono text-xs text-muted-foreground">
                          Business ID: {business.id}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* WABA accounts */}
                  <div className="p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-semibold">
                        WhatsApp Business Accounts
                      </h4>

                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs">
                        {accounts.length} account
                        {accounts.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {accounts.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-border p-5 text-center">
                        <p className="text-sm text-muted-foreground">
                          No WhatsApp Business Accounts found.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {accounts.map((account: any) => {
                          const phones =
                            account.phone_numbers?.data ?? [];

                          return (
                            <div
                              key={account.id}
                              className="rounded-lg border border-border"
                            >
                              {/* WABA info */}
                              {/* WABA info */}
<div className="border-b border-border p-4">
  <div className="flex items-start justify-between gap-4">
    <div className="grid flex-1 gap-4 sm:grid-cols-3">
      <div>
        <p className="text-xs text-muted-foreground">
          WABA Name
        </p>

        <p className="mt-1 text-sm font-medium">
          {account.name}
        </p>
      </div>

      <div>
        <p className="text-xs text-muted-foreground">
          WABA ID
        </p>

        <p className="mt-1 break-all font-mono text-xs">
          {account.id}
        </p>
      </div>

      <div>
        <p className="text-xs text-muted-foreground">
          Currency
        </p>

        <p className="mt-1 text-sm font-medium">
          {account.currency ?? '—'}
        </p>
      </div>
    </div>

    <Button
      type="button"
      size="sm"
      onClick={() => onSelectWaba(account, business)}
      className="shrink-0"
    >
      Select
    </Button>
  </div>
</div>

                              {/* Phone numbers */}
                              <div className="p-4">
                                <div className="mb-3 flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-muted-foreground" />

                                  <h5 className="text-sm font-semibold">
                                    Phone Numbers
                                  </h5>
                                </div>

                                {phones.length === 0 ? (
                                  <p className="text-sm text-muted-foreground">
                                    No phone numbers found.
                                  </p>
                                ) : (
                                  <div className="overflow-x-auto rounded-lg border border-border">
                                    <table className="w-full text-sm">
                                      <thead className="bg-muted/40">
                                        <tr className="border-b border-border">
                                          <th className="px-4 py-3 text-left font-medium">
                                            ID
                                          </th>

                                          <th className="px-4 py-3 text-left font-medium">
                                            Display Phone Number
                                          </th>

                                          <th className="px-4 py-3 text-left font-medium">
                                            Verified Name
                                          </th>

                                          <th className="px-4 py-3 text-left font-medium">
                                            Quality
                                          </th>
                                        </tr>
                                      </thead>

                                      <tbody>
                                        {phones.map((phone: any) => (
                                          <tr
                                            key={phone.id}
                                            className="border-b border-border last:border-0"
                                          >
                                            <td className="px-4 py-3">
                                              <span className="font-mono text-xs">
                                                {phone.id}
                                              </span>
                                            </td>

                                            <td className="px-4 py-3 whitespace-nowrap">
                                              {phone.display_phone_number ??
                                                '—'}
                                            </td>

                                            <td className="px-4 py-3">
                                              {phone.verified_name ?? '—'}
                                            </td>

                                            <td className="px-4 py-3">
                                              <span className="rounded-full bg-muted px-2 py-1 text-xs">
                                                {phone.quality_rating ?? '—'}
                                              </span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

let sdkPromise: Promise<void> | null = null;

// Only loads the script. Init happens later, once the user has entered an App ID.
const loadFacebookSDK = (): Promise<void> => {
  if (fbWindow.FB) return Promise.resolve();
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    fbWindow.fbAsyncInit = () => resolve();

    if (document.getElementById('facebook-jssdk')) return;

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

const initFacebook = (appId: string) => {
  fbWindow.FB.init({
    appId,
    cookie: true,
    xfbml: true,
    version: 'v25.0',
  });
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

  const saveFacebookConnection = async (authResponse: any, appId: any) => {
  const userId = localStorage.getItem('userId');

  if (!userId) {
    throw new Error('User ID not found. Please log in again.');
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/auth/update-user/${encodeURIComponent(userId)}`,
    {
      method: 'POST',
      headers: {
        accept: '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Spelled exactly as in your curl/Swagger example ("Acceess").
        facebookAcceessToken: authResponse.accessToken,
        appId,
        grantedScopes: authResponse.grantedScopes,
        accessTokenExpiresIn: String(authResponse.expiresIn),
        facebookConnectStatus: true,
        metaUserId: authResponse.userID
      }),
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to save Facebook connection');
  }

  return response.json();
};

// Logs everything Facebook gives us after a successful login.
  // Preload the SDK so log can run synchronously inside the click.


type WhatsAppPhoneNumber = {
  id: string;
  display_phone_number?: string;
  verified_name?: string;
  quality_rating?: string;
};

type WhatsAppBusinessAccount = {
  id: string;
  name: string;
  currency?: string;
  timezone_id?: string;
  phone_numbers?: {
    data: WhatsAppPhoneNumber[];
  };
};

type MetaBusiness = {
  id: string;
  name: string;
  owned_whatsapp_business_accounts?: {
    data: WhatsAppBusinessAccount[];
  };
};

type WhatsAppConnection = {
  webhookStatus: string;
  lastEvent: string;
  messageHealth: {
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  };
};

export default function WhatsAppPage() {

  const logFacebookDetails = async (loginResponse: any) => {
  const auth = loginResponse?.authResponse ?? {};

  console.group('[Facebook] Login success');

  console.log('Raw login response:', {
    ...loginResponse,
    authResponse: {
      ...auth,
      accessToken: maskToken(auth.accessToken),
    },
  });

  console.log('Status:', loginResponse?.status);
  console.log('User ID:', auth.userID);
  console.log('Granted scopes:', auth.grantedScopes);
  console.log('Expires in (s):', auth.expiresIn);
  console.log(
    'Data access expires at:',
    auth.data_access_expiration_time,
  );

  try {
    const profile = await fbApi('/me', {
      fields: 'id,name,email',
    });

    console.log('Profile (/me):', profile);
  } catch (error) {
    console.warn('Profile failed:', error);
  }

  try {
    const permissions = await fbApi('/me/permissions');

    console.log(
      'Permissions (/me/permissions):',
      permissions,
    );
  } catch (error) {
    console.warn(
      'Permissions failed:',
      error,
    );
  }

  try {
    const businessResponse = await fbApi<{
      data: MetaBusiness[];
    }>('/me/businesses', {
      fields:
        'id,name,owned_whatsapp_business_accounts{id,name,currency,timezone_id,phone_numbers{id,display_phone_number,verified_name,quality_rating}}',
    });

    console.log(
      'Businesses & WhatsApp accounts:',
      businessResponse,
    );

    setBusinesses(businessResponse.data ?? []);
    setShowBusinessPopup(true);
  } catch (error) {
    console.warn(
      'Businesses & WhatsApp accounts failed:',
      error,
    );
  }

  console.groupEnd();
};

  const queryClient = useQueryClient();

  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [businesses, setBusinesses] = useState<MetaBusiness[]>([]);
const [showBusinessPopup, setShowBusinessPopup] = useState(false);
const [loadingBusinesses, setLoadingBusinesses] = useState(false);
const [selectedWaba, setSelectedWaba] =
  useState<WhatsAppBusinessAccount | null>(null);

const [selectedBusiness, setSelectedBusiness] =
  useState<MetaBusiness | null>(null);

  console.log(selectedWaba?.id, 'selectedWabaId')
console.log(selectedWaba?.name, 'selectedWabaname')
console.log(selectedWaba?.phone_numbers?.data, 'selected_wabab_phone_number_data')
console.log(selectedBusiness?.id, 'selected_business_id')
console.log(selectedBusiness?.name, 'selected_business_name')

  // Disconnected by default; only true after Facebook authentication succeeds.
  const [fbConnected, setFbConnected] = useState(false);
  const [appId, setAppId] = useState('');

  const {
    data: conn,
    isLoading,
  } = useQuery<WhatsAppConnection>({
    queryKey: ['whatsapp-connection'],
    queryFn: () => api.getWhatsAppConnection(),
  });

  useEffect(() => {
    loadFacebookSDK().catch((error) => {
      console.error('Facebook SDK failed to load:', error);
      toast.error(
        'Could not load the Facebook SDK. Disable ad blockers and try again.',
      );
    });
  }, []);

  type LongLivedTokenResponse = {
  access_token?: string;
  long_lived_token?: string;
  longLivedToken?: string;
  token?: string;
  data?: {
    access_token?: string;
    long_lived_token?: string;
    longLivedToken?: string;
    token?: string;
  };
};

const getLongLivedFacebookToken = async (
  accessToken: string,
  userId: string,
): Promise<string> => {
  const url = new URL(
    `${import.meta.env.VITE_API_URL}/whatsapp/long-lived-token`,
  );

  url.searchParams.set('access_token', accessToken);
  url.searchParams.set('user_id', userId);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      accept: '*/*',
    },
  });

  const result: LongLivedTokenResponse = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      (result as any)?.message ||
        'Failed to generate Facebook long-lived access token',
    );
  }

  console.log('Long-lived token response:', result);

  // Supports the common possible response shapes.
  const longLivedToken =
    result.access_token ||
    result.long_lived_token ||
    result.longLivedToken ||
    result.token ||
    result.data?.access_token ||
    result.data?.long_lived_token ||
    result.data?.longLivedToken ||
    result.data?.token;

  if (!longLivedToken) {
    throw new Error(
      'Long-lived token was not returned by the server',
    );
  }

  return longLivedToken;
};

const storeFacebookTokens = async ({
  userId,
  facebookAccessToken,
  facebookLongLivedAccessToken,
}: {
  userId: string;
  facebookAccessToken: string;
  facebookLongLivedAccessToken: string;
}) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/whatsapp/store-token`,
    {
      method: 'POST',
      headers: {
        accept: '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        facebookAccessToken,
        facebookLongLivedAccessToken,
      }),
    },
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result?.message || 'Failed to store Facebook access tokens',
    );
  }

  console.log('Facebook tokens stored successfully:', result);

  return result;
};

const saveFacebookConnection = async (
  authResponse: any,
  appId: any,
) => {
  const userId = localStorage.getItem('userId');

  if (!userId) {
    throw new Error(
      'User ID not found. Please log in again.',
    );
  }

  if (!authResponse?.accessToken) {
    throw new Error(
      'Facebook access token was not returned.',
    );
  }

  const facebookAccessToken = authResponse.accessToken;

  /*
   * 1. Exchange the short-lived Facebook token
   *    for a long-lived token.
   */
  const facebookLongLivedAccessToken =
    await getLongLivedFacebookToken(
      facebookAccessToken,
      userId,
    );

  console.log(
    'Facebook access token:',
    maskToken(facebookAccessToken),
  );

  console.log(
    'Facebook long-lived token:',
    maskToken(facebookLongLivedAccessToken),
  );

  /*
   * 2. Store both tokens.
   */
  await storeFacebookTokens({
    userId,
    facebookAccessToken,
    facebookLongLivedAccessToken,
  });

  /*
   * 3. Continue saving the existing Facebook
   *    connection information.
   */
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/auth/update-user/${encodeURIComponent(
      userId,
    )}`,
    {
      method: 'POST',
      headers: {
        accept: '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Kept because this is the spelling currently
        // expected by your existing backend.
        facebookAcceessToken: facebookAccessToken,

        appId,
        grantedScopes: authResponse.grantedScopes,
        accessTokenExpiresIn: String(
          authResponse.expiresIn,
        ),
        facebookConnectStatus: true,
        metaUserId: authResponse.userID,
      }),
    },
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({}));

    throw new Error(
      error.message ||
        'Failed to save Facebook connection',
    );
  }

  return response.json();
};

const saveConnection = async (
  authResponse: any,
  appIdValue: string,
) => {
  try {
    setConnecting(true);

    await saveFacebookConnection(
      authResponse,
      appIdValue,
    );

    setFbConnected(true);

    await queryClient.invalidateQueries({
      queryKey: ['whatsapp-connection'],
    });

    toast.success(
      'WhatsApp Business account connected successfully',
    );
  } catch (error) {
    console.error(
      'Failed to save Facebook connection:',
      error,
    );

    setFbConnected(false);

    toast.error(
      error instanceof Error
        ? error.message
        : 'Failed to save Facebook connection',
    );

    // Important: rethrow so the login flow
    // doesn't continue to WABA selection if
    // token storage failed.
    throw error;
  } finally {
    setConnecting(false);
  }
};


const saveWhatsAppSelection = async (
  waba: WhatsAppBusinessAccount,
  business: MetaBusiness,
) => {
  try {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      throw new Error('User ID not found. Please log in again.');
    }

    const phones = waba.phone_numbers?.data ?? [];
    console.log(phones, 'find_live_phone_no')

    if (!waba.id) {
      throw new Error('WhatsApp Business Account ID is missing.');
    }

    const selectedPhoneNumberId = phones
      .map((phone) => phone.id)
      .filter(Boolean);

    const selectedPhone = phones[0];

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/auth/update-user/${encodeURIComponent(
        userId,
      )}`,
      {
        method: 'POST',
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedWabaId: waba.id,
          selectedFacebookBusinessId: business.id,
          selectedFacebookBusinessName: business.name,
          selectedPhoneNumberQualityRating:
            selectedPhone?.quality_rating ?? '',
          selectedPhoneNumberVerifiedName:
            selectedPhone?.verified_name ?? '',
          selectedPhoneNumberId,
          displayPhoneNumber: waba.phone_numbers?.data[0].display_phone_number,
          facebookConnectStatus: true
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new Error(
        error.message || 'Failed to save WhatsApp Business selection',
      );
    }

    const result = await response.json();

    // Keep the selected values in local state as well.
    setSelectedWaba(waba);
    setSelectedBusiness(business);
    setShowBusinessPopup(false);
    setFbConnected(true);

    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['whatsapp-connection'],
      }),
      queryClient.invalidateQueries({
        queryKey: ['user-details', userId],
      }),
    ]);

    toast.success('WhatsApp Business account selected successfully');

    return result;
  } catch (error) {
    console.error('Failed to save WhatsApp Business selection:', error);

    toast.error(
      error instanceof Error
        ? error.message
        : 'Failed to save WhatsApp Business selection',
    );
  }
};

const userId = localStorage.getItem('userId');

const {
  data: userDetails,
  isLoading: isUserLoading,
  refetch: refetchUserDetails,
} = useQuery({
  queryKey: ['user-details', userId],
  queryFn: async () => {
    if (!userId) {
      throw new Error('User ID not found');
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/auth/${encodeURIComponent(userId)}`,
      {
        method: 'GET',
        headers: {
          accept: '*/*',
        },
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch user details');
    }

    return response.json();
  },
  enabled: !!userId,
});


// Deliberately not async: FB.login must be called synchronously
// inside the click/submit so the popup isn't blocked.
const launchWhatsAppSignup = () => {
  const trimmedAppId = appId.trim();

  if (!/^\d+$/.test(trimmedAppId)) {
    toast.error('Please enter a valid Facebook App ID (numbers only)');
    return;
  }

  if (!fbWindow.FB) {
    toast.error('Facebook SDK is still loading. Try again in a moment.');
    return;
  }

  setConnecting(true);

  const handleFacebookLoginSuccess = async (
  response: any,
  appIdValue: string,
) => {
  const authResponse = response?.authResponse;

  if (!authResponse?.accessToken) {
    setConnecting(false);

    toast.info(
      'WhatsApp connection was cancelled',
    );

    return;
  }

  try {
    console.log(
      'Facebook authentication successful:',
      {
        userID: authResponse.userID,
        accessToken: maskToken(
          authResponse.accessToken,
        ),
        expiresIn: authResponse.expiresIn,
        grantedScopes:
          authResponse.grantedScopes,
      },
    );

    /*
     * This now performs:
     *
     * 1. GET /whatsapp/long-lived-token
     * 2. POST /whatsapp/store-token
     * 3. POST /auth/update-user/:id
     */
    await saveConnection(
      authResponse,
      appIdValue,
    );

    /*
     * Only load WABAs after token creation
     * and storage succeeds.
     */
    const businessResponse = await fbApi<{
      data: MetaBusiness[];
    }>('/me/businesses', {
      fields:
        'id,name,owned_whatsapp_business_accounts{id,name,currency,timezone_id,phone_numbers{id,display_phone_number,verified_name,quality_rating}}',
    });

    setBusinesses(
      businessResponse.data ?? [],
    );

    setShowBusinessPopup(true);
  } catch (error) {
    console.error(
      'WhatsApp connection flow failed:',
      error,
    );

    setFbConnected(false);

    toast.error(
      error instanceof Error
        ? error.message
        : 'Failed to connect WhatsApp Business',
    );
  } finally {
    setConnecting(false);
  }
};


  try {
    initFacebook(trimmedAppId);

    fbWindow.FB.login(
      (response: any) => {
        const authResponse = response?.authResponse;

        if (!authResponse?.accessToken) {
          console.warn('[Facebook] Login cancelled or failed:', response);
          setFbConnected(false);
          setConnecting(false);
          toast.info('WhatsApp connection was cancelled');
          return;
        }

        void handleFacebookLoginSuccess(
  response,
  trimmedAppId,
);
      },
      {
        scope:
          'public_profile,email,business_management,whatsapp_business_management,whatsapp_business_messaging',
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

const handleManageBusinesses = async () => {
  if (!fbWindow.FB) {
    toast.error('Facebook SDK is still loading. Try again in a moment.');
    return;
  }

  try {
    setLoadingBusinesses(true);

    const businessResponse = await fbApi<{
      data: MetaBusiness[];
    }>('/me/businesses', {
      fields:
        'id,name,owned_whatsapp_business_accounts{id,name,currency,timezone_id,phone_numbers{id,display_phone_number,verified_name,quality_rating}}',
    });

    const fetchedBusinesses = businessResponse.data ?? [];

    if (fetchedBusinesses.length === 0) {
      toast.info('No Meta businesses found for this account.');
      return;
    }

    setBusinesses(fetchedBusinesses);
    setShowBusinessPopup(true);
  } catch (error) {
    console.error('Failed to fetch Meta businesses:', error);

    // Most likely cause: the FB JS SDK session/cookie has expired,
    // since FB.init() only runs during the original connect flow.
    toast.error(
      error instanceof Error
        ? error.message
        : 'Failed to fetch your Meta businesses. Try reconnecting instead.',
    );
  } finally {
    setLoadingBusinesses(false);
  }
};

const handleDisconnect = async () => {
  try {
    setDisconnecting(true);

    const userId = localStorage.getItem('userId');

    if (!userId) {
      throw new Error('User ID not found. Please log in again.');
    }

    // Update the real backend connection status
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/auth/update-user/${encodeURIComponent(
        userId,
      )}`,
      {
        method: 'POST',
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          facebookConnectStatus: false,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new Error(
        error.message || 'Failed to disconnect WhatsApp Business',
      );
    }

    // Immediately update React Query cache
    queryClient.setQueryData(
      ['user-details', userId],
      (old: any) =>
        old
          ? {
              ...old,
              facebookConnectStatus: false,
            }
          : old,
    );

    // Also update the local connection cache
    queryClient.setQueryData(
      ['whatsapp-connection'],
      (old: WhatsAppConnection | undefined) => {
        if (!old) return old;

        return {
          ...old,
          webhookStatus: 'Disconnected',
        };
      },
    );

    // Keep local state in sync
    setFbConnected(false);

    // Refresh backend data
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['whatsapp-connection'],
      }),
      queryClient.invalidateQueries({
        queryKey: ['user-details', userId],
      }),
    ]);

    toast.success('WhatsApp Business disconnected');
  } catch (error) {
    console.error('Failed to disconnect WhatsApp:', error);

    toast.error(
      error instanceof Error
        ? error.message
        : 'Failed to disconnect WhatsApp',
    );
  } finally {
    setDisconnecting(false);
  }
};

  if (isLoading || isUserLoading || !userDetails || !conn) {
  return (
    <LoadingState text="Loading WhatsApp connection..." />
  );
}

  // Driven by Facebook authentication, not by the backend default status.
  // Once the backend returns real data, use: conn.status === 'Connected'
  const isConnected = userDetails?.facebookConnectStatus === true;

  const connectionData = {
  businessName:
    userDetails?.selectedFacebookBusinessName ||
    userDetails?.businessName ||
    '—',

  phoneNumber:
    userDetails?.displayPhoneNumber ||
    '—',

  businessAccountId:
    userDetails?.selectedWabaId ||
    '—',

  phoneNumberId:
    Array.isArray(userDetails?.selectedPhoneNumberId)
      ? userDetails.selectedPhoneNumberId[0] || '—'
      : userDetails?.selectedPhoneNumberId || '—',

  connectionDate: userDetails?.createdAt
    ? new Date(userDetails.createdAt)
    : null,
};

  return (
    <div>
    <BusinessAccountsDialog
      open={showBusinessPopup}
      onOpenChange={setShowBusinessPopup}
      businesses={businesses}
      onSelectWaba={(waba, business) => {
        console.log('Selected WABA:', waba);
        console.log('Selected Business:', business);

        void saveWhatsAppSelection(waba, business);
      }}
    />

      <PageHeader
        title="WhatsApp"
        description="Manage your WhatsApp Business connection and message health."
      />

      {!isConnected ? (
            <DisconnectedView
              onConnect={launchWhatsAppSignup}
              connecting={connecting}
              appId={appId}
              onAppIdChange={setAppId}
            />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Connection status */}
            <div className="rounded-xl border border-border bg-card p-6">
  <div className="mb-4 flex items-center justify-between">
    <h3 className="flex items-center gap-2 text-base font-semibold">
      <MessageCircle className="h-5 w-5 text-emerald-600" />
      Connection Status
    </h3>

    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      Connected
    </span>
  </div>

  <div className="divide-y divide-border border-y border-border">
    <InfoRow
      icon={Building2}
      label="Business name"
      value={connectionData.businessName}
    />

    <InfoRow
      icon={Phone}
      label="Phone number"
      value={connectionData.phoneNumber}
    />

    <InfoRow
      icon={Hash}
      label="Business Account ID"
      value={connectionData.businessAccountId}
    />

    <InfoRow
      icon={Hash}
      label="Phone Number ID"
      value={connectionData.phoneNumberId}
    />

    <InfoRow
      icon={Calendar}
      label="Connection date"
      value={
        connectionData.connectionDate
          ? connectionData.connectionDate.toLocaleDateString(
              'en-NG',
              {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              },
            )
          : '—'
      }
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
      onClick={handleManageBusinesses}
      disabled={loadingBusinesses}
    >
      {loadingBusinesses ? (
        <>
          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          <Settings className="mr-2 h-3.5 w-3.5" />
          Manage
        </>
      )}
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