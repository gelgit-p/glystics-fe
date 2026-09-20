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
  ArrowRight,
  Shield,
  Zap,
  Bell,
} from 'lucide-react';
import { api } from '@/lib/api';
import { PageHeader, StatusBadge, LoadingState } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { loadFacebookSDK } from '@/lib/facebook';

function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" /> {label}
      </div>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function HealthStat({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg', color)}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <p className="mt-2 text-xl font-bold">{value}</p>
    </div>
  );
}

function DisconnectedView({ onConnect }: { onConnect: () => void }) {
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    await new Promise((r) => setTimeout(r, 1400));
    setConnecting(false);
    onConnect();
  };

  return (
    <div className="space-y-6">
      {/* Main disconnected card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-red-50/50 px-6 py-4 dark:bg-red-950/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-red-900 dark:text-red-200">WhatsApp Business Not Connected</h3>
              <p className="text-sm text-red-700 dark:text-red-300">Your WhatsApp Business account is disconnected. Notifications are paused.</p>
            </div>
          </div>
        </div>

        <div className="p-6 lg:p-8">
          <div className="mx-auto max-w-lg text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold">Connect WhatsApp Business</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Connect your WhatsApp Business account to start sending automated delivery notifications to your customers.
              You'll need your WhatsApp Business phone number and account credentials.
            </p>

            <Button
              size="lg"
              className="mt-6 w-full sm:w-auto"
              onClick={handleConnect}
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

            {/* Steps */}
            <div className="mt-8 space-y-3 text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">How to connect</p>
              {[
                { icon: Building2, title: 'Verify your business', desc: 'Confirm your business name and phone number.' },
                { icon: Shield, title: 'Authenticate with Meta', desc: 'Authorize Glystics via your Meta Business account.' },
                { icon: Bell, title: 'Start sending notifications', desc: 'Once connected, automated messages begin sending immediately.' },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border border-border p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <step.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Impact summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950">
              <Bell className="h-4 w-4 text-amber-600" />
            </div>
            <span className="text-sm font-medium">Notifications Paused</span>
          </div>
          <p className="text-xs text-muted-foreground">All automated WhatsApp notifications are on hold until you reconnect.</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950">
              <Zap className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium">Automations Inactive</span>
          </div>
          <p className="text-xs text-muted-foreground">Your workflow automations will resume automatically after reconnection.</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950">
              <RefreshCw className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-sm font-medium">Data Preserved</span>
          </div>
          <p className="text-xs text-muted-foreground">Your deliveries, contacts, and templates remain safe during disconnection.</p>
        </div>
      </div>
    </div>
  );
}

// export default function WhatsAppPage() {
//   const queryClient = useQueryClient();
//   const [isDisconnected, setIsDisconnected] = useState(false);
//   const [disconnecting, setDisconnecting] = useState(false);

//   const { data: conn, isLoading } = useQuery({
//     queryKey: ['whatsapp-connection'],
//     queryFn: () => api.getWhatsAppConnection(),
//   });

//   if (isLoading || !conn) return <LoadingState text="Loading WhatsApp connection..." />;

//   const handleConnect = () => {
//     setIsDisconnected(false);
//     queryClient.invalidateQueries({ queryKey: ['whatsapp-connection'] });
//     toast.success('WhatsApp Business connected successfully!');
//   };

//   const handleDisconnect = async () => {
//     setDisconnecting(true);
//     await api.disconnectWhatsApp();
//     setDisconnecting(false);
//     setIsDisconnected(true);
//     toast.success('WhatsApp Business disconnected');
//   };

//   if (isDisconnected) {
//     return (
//       <div>
//         <PageHeader title="WhatsApp" description="Manage your WhatsApp Business connection and message health." />
//         <DisconnectedView onConnect={handleConnect} />
//       </div>
//     );
//   }

//   return (
//     <div>
//       <PageHeader title="WhatsApp" description="Manage your WhatsApp Business connection and message health." />

//       <div className="grid gap-6 lg:grid-cols-2">
//         {/* Connection status */}
//         <div className="rounded-xl border border-border bg-card p-6">
//           <div className="mb-4 flex items-center justify-between">
//             <h3 className="flex items-center gap-2 text-base font-semibold">
//               <MessageCircle className="h-5 w-5 text-primary" /> Connection Status
//             </h3>
//             <StatusBadge status={conn.status} />
//           </div>
//           <div className="divide-y divide-border border-y border-border">
//             <InfoRow icon={Building2} label="Business name" value={conn.businessName} />
//             <InfoRow icon={Phone} label="Phone number" value={conn.phoneNumber} />
//             <InfoRow icon={Hash} label="Business Account ID" value={conn.businessAccountId} />
//             <InfoRow icon={Hash} label="Phone Number ID" value={conn.phoneNumberId} />
//             <InfoRow icon={Calendar} label="Connection date" value={new Date(conn.connectionDate).toLocaleDateString('en-NG', { month: 'long', day: 'numeric', year: 'numeric' })} />
//           </div>
//           <div className="mt-4 flex flex-wrap gap-2">
//             <Button variant="outline" size="sm" onClick={() => toast.success('Reconnecting...')}>
//               <RefreshCw className="mr-2 h-3.5 w-3.5" /> Reconnect
//             </Button>
//             <Button
//               variant="outline"
//               size="sm"
//               className="text-red-600 hover:text-red-700"
//               onClick={handleDisconnect}
//               disabled={disconnecting}
//             >
//               {disconnecting ? (
//                 <>
//                   <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Disconnecting...
//                 </>
//               ) : (
//                 <>
//                   <Unplug className="mr-2 h-3.5 w-3.5" /> Disconnect
//                 </>
//               )}
//             </Button>
//             <Button variant="outline" size="sm" onClick={() => toast.info('Opening WhatsApp Manager...')}>
//               <Settings className="mr-2 h-3.5 w-3.5" /> Manage
//             </Button>
//           </div>
//         </div>

//         {/* Webhook status */}
//         <div className="rounded-xl border border-border bg-card p-6">
//           <div className="mb-4 flex items-center justify-between">
//             <h3 className="flex items-center gap-2 text-base font-semibold">
//               <Webhook className="h-5 w-5 text-muted-foreground" /> Webhook Status
//             </h3>
//             <StatusBadge status={conn.webhookStatus} />
//           </div>
//           <div className="rounded-lg border border-border p-4">
//             <div className="flex items-center gap-3">
//               <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950">
//                 <Check className="h-5 w-5 text-emerald-600" />
//               </div>
//               <div>
//                 <p className="text-sm font-medium">Webhook is active</p>
//                 <p className="text-xs text-muted-foreground">Last event received: 2 minutes ago</p>
//               </div>
//             </div>
//           </div>
//           <div className="mt-4 space-y-2">
//             <p className="text-xs font-semibold uppercase text-muted-foreground">Subscribed Events</p>
//             <div className="flex flex-wrap gap-1.5">
//               {['message.sent', 'message.delivered', 'message.read', 'message.failed', 'delivery.created', 'delivery.updated', 'delivery.delivered'].map((e) => (
//                 <span key={e} className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">{e}</span>
//               ))}
//             </div>
//           </div>
//           <Button variant="outline" size="sm" className="mt-4" onClick={() => toast.info('Opening webhook settings...')}>
//             <Settings className="mr-2 h-3.5 w-3.5" /> Configure Webhook
//           </Button>
//         </div>
//       </div>

//       {/* Message health */}
//       <div className="mt-6">
//         <h3 className="mb-4 text-base font-semibold">Message Health</h3>
//         <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
//           <HealthStat label="Sent" value={conn.messageHealth.sent.toLocaleString()} icon={Send} color="bg-primary/10 text-primary" />
//           <HealthStat label="Delivered" value={conn.messageHealth.delivered.toLocaleString()} icon={Mail} color="bg-blue-50 text-blue-600 dark:bg-blue-950" />
//           <HealthStat label="Read" value={conn.messageHealth.read.toLocaleString()} icon={MailOpen} color="bg-emerald-50 text-emerald-600 dark:bg-emerald-950" />
//           <HealthStat label="Failed" value={conn.messageHealth.failed.toLocaleString()} icon={XCircle} color="bg-red-50 text-red-600 dark:bg-red-950" />
//         </div>
//       </div>
//     </div>
//   );
// }


export default function WhatsAppPage() {
  const queryClient = useQueryClient();
  const [connecting, setConnecting] = useState(false);

  const {
    data: conn,
    isLoading,
  } = useQuery({
    queryKey: ['whatsapp-connection'],
    queryFn: () => api.getWhatsAppConnection(),
  });

  // Load Facebook SDK once
  useEffect(() => {
    loadFacebookSDK().catch((error) => {
      console.error('Facebook SDK error:', error);
    });
  }, []);

  // Listen for Meta Embedded Signup events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // IMPORTANT:
      // event.origin should be the actual Facebook origin,
      // not a markdown-style URL.
      if (
        event.origin !== 'https://www.facebook.com' &&
        event.origin !== 'https://web.facebook.com'
      ) {
        return;
      }

      try {
        const data =
          typeof event.data === 'string'
            ? JSON.parse(event.data)
            : event.data;

        console.log('Meta Embedded Signup event:', data);

        if (data?.type !== 'WA_EMBEDDED_SIGNUP') {
          return;
        }

        console.log('WhatsApp Embedded Signup event:', data);

        if (data.event === 'FINISH') {
          const wabaId = data.data?.waba_id;
          const phoneNumberId = data.data?.phone_number_id;

          console.log('WABA ID:', wabaId);
          console.log('Phone Number ID:', phoneNumberId);

          // At this point Meta has completed the signup flow.
          // Send the returned information to your backend here.
          //
          // Example:
          //
          // await api.connectWhatsApp({
          //   wabaId,
          //   phoneNumberId,
          //   code: ...
          // });

          setConnecting(false);

          queryClient.invalidateQueries({
            queryKey: ['whatsapp-connection'],
          });

          toast.success(
            'WhatsApp Business account connected successfully',
          );
        }

        if (data.event === 'CANCEL') {
          console.log(
            'Embedded Signup cancelled:',
            data.data,
          );

          setConnecting(false);

          toast.info('WhatsApp connection was cancelled');
        }

        if (data.event === 'ERROR') {
          console.error(
            'Embedded Signup error:',
            data.data,
          );

          setConnecting(false);

          toast.error(
            'WhatsApp Embedded Signup failed',
          );
        }
      } catch (error) {
        console.error(
          'Failed to parse Meta message:',
          error,
        );
      }
    };

    window.addEventListener(
      'message',
      handleMessage,
    );

    return () => {
      window.removeEventListener(
        'message',
        handleMessage,
      );
    };
  }, [queryClient]);

  const handleConnectWhatsApp = async () => {
    try {
      setConnecting(true);

      await loadFacebookSDK();

      if (!window.FB) {
        throw new Error(
          'Facebook SDK is not available',
        );
      }

      const EMBEDDED_SIGNUP_CONFIG_ID =
        'YOUR_CONFIG_ID';

      window.FB.login(
        (response) => {
          console.log(
            'Embedded Signup login response:',
            response,
          );

          if (response.status !== 'connected') {
            console.log(
              'Embedded Signup was not completed',
            );

            setConnecting(false);

            toast.error(
              'WhatsApp connection was cancelled',
            );

            return;
          }

          console.log(
            'Auth response:',
            response.authResponse,
          );

          /*
           * IMPORTANT:
           *
           * Do NOT treat Facebook login success as
           * WhatsApp signup completion.
           *
           * The WA_EMBEDDED_SIGNUP FINISH event above
           * is what confirms that the Embedded Signup
           * flow completed.
           */
        },
        {
          config_id: EMBEDDED_SIGNUP_CONFIG_ID,

          response_type: 'code',

          override_default_response_type: true,

          extras: {
            feature: 'whatsapp_embedded_signup',
            version: 4,
          },
        },
      );
    } catch (error) {
      console.error(
        'Embedded Signup error:',
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to connect WhatsApp',
      );

      setConnecting(false);
    }
  };

  // This comes AFTER all hooks
  if (isLoading || !conn) {
    return (
      <LoadingState
        text="Loading WhatsApp connection..."
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="WhatsApp"
        description="Manage your WhatsApp Business connection and message health."
      />

      {!conn.connected ? (
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
                    Connect your WhatsApp Business account
                    to start sending notifications.
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
                  Connect your WhatsApp Business account
                  through Meta to start sending automated
                  delivery notifications.
                </p>

                <Button
                  size="lg"
                  className="mt-6 w-full sm:w-auto"
                  onClick={handleConnectWhatsApp}
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

                  <div className="flex items-start gap-3 rounded-lg border border-border p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent">
                      <Building2 className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-sm font-medium">
                        Select your WhatsApp Business account
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Meta will guide you through the
                        business onboarding process.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border border-border p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent">
                      <Shield className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-sm font-medium">
                        Authorize Glystics
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Give Glystics permission to manage
                        your WhatsApp Business assets.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border border-border p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent">
                      <Bell className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-sm font-medium">
                        Start sending notifications
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Your WhatsApp connection will be
                        available after onboarding.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* Your existing connected WhatsApp UI */}
        </div>
      )}
    </div>
  );
}