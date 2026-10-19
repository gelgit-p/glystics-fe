import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  MessageCircle,
  Check,
  Building2,
  Phone,
  Globe,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Bell,
  Zap,
  Package,
  Truck,
  PackageCheck,
  XCircle,
  CalendarClock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const steps = ['Business', 'WhatsApp', 'Notifications', 'Complete'];

const businessTypes = ['Logistics company', 'E-commerce', 'Courier', 'Marketplace', 'Other'];

const notifPrefs = [
  { key: 'pickup', label: 'Pickup notifications', desc: 'Notify when pickup is scheduled', icon: Package },
  { key: 'rider', label: 'Rider assignment', desc: 'Notify when a rider is assigned', icon: Truck },
  { key: 'shipment', label: 'Shipment updates', desc: 'Notify on shipment status changes', icon: Zap },
  { key: 'out_for_delivery', label: 'Out-for-delivery', desc: 'Notify when package is out for delivery', icon: Truck },
  { key: 'delivery', label: 'Delivery confirmation', desc: 'Notify when package is delivered', icon: PackageCheck },
  { key: 'failed', label: 'Failed delivery', desc: 'Notify when delivery attempt fails', icon: XCircle },
  { key: 'reschedule', label: 'Delivery rescheduling', desc: 'Notify when delivery is rescheduled', icon: CalendarClock },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [businessName, setBusinessName] = useState('SwiftDrop Logistics');
  const [businessType, setBusinessType] = useState('Logistics company');
  const [country, setCountry] = useState('Nigeria');
  const [phone, setPhone] = useState('+234 801 234 5678');
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(notifPrefs.map((p) => [p.key, true])),
  );

  const connectWhatsApp = async () => {
    setConnecting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setConnecting(false);
    setWhatsappConnected(true);
    toast.success('WhatsApp Business connected!');
  };

  const next = () => {
    if (step === 0 && !businessName.trim()) {
      toast.error('Please enter your business name');
      return;
    }
    if (step < 3) setStep(step + 1);
  };

  const finish = () => {
    toast.success('Setup complete! Welcome to dispatchly.');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MessageCircle className="h-5 w-5" />
            </div>
            <span className="font-bold">dispatchly</span>
          </div>
          <span className="text-sm text-muted-foreground">Onboarding</span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => (
              <div key={s} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                      i < step
                        ? 'border-primary bg-primary text-primary-foreground'
                        : i === step
                          ? 'border-primary bg-white text-primary'
                          : 'border-border bg-white text-muted-foreground',
                    )}
                  >
                    {i < step ? <Check className="h-5 w-5" /> : i + 1}
                  </div>
                  <span className={cn('text-xs font-medium', i <= step ? 'text-foreground' : 'text-muted-foreground')}>
                    {s}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={cn('mx-2 h-0.5 flex-1 rounded', i < step ? 'bg-primary' : 'bg-border')} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="rounded-xl border border-border bg-white p-8 shadow-sm animate-fade-in">
          {step === 0 && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold">Tell us about your business</h2>
                <p className="mt-1 text-sm text-muted-foreground">This helps us customize your experience.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="bizName">Business name</Label>
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="bizName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="pl-9" placeholder="SwiftDrop Logistics" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Business type</Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {businessTypes.map((t) => (
                      <button
                        key={t}
                        onClick={() => setBusinessType(t)}
                        className={cn(
                          'rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors',
                          businessType === t
                            ? 'border-primary bg-accent text-accent-foreground'
                            : 'border-border hover:bg-muted',
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="country">Country</Label>
                    <div className="relative">
                      <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} className="pl-9" placeholder="Nigeria" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone number</Label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-9" placeholder="+234..." />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold">Connect WhatsApp</h2>
                <p className="mt-1 text-sm text-muted-foreground">Connect your WhatsApp Business account to start sending notifications.</p>
              </div>
              {!whatsappConnected ? (
                <div className="flex flex-col items-center rounded-lg border border-dashed border-border p-10 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent">
                    <MessageCircle className="h-8 w-8 text-accent-foreground" />
                  </div>
                  <h3 className="mb-1 font-semibold">WhatsApp Business</h3>
                  <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                    Connect your WhatsApp Business account to send automated delivery notifications to your customers.
                  </p>
                  <Button onClick={connectWhatsApp} disabled={connecting}>
                    {connecting ? 'Connecting...' : 'Connect WhatsApp Business'}
                  </Button>
                </div>
              ) : (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <Check className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-900 dark:text-emerald-100">Connected</p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300">Your WhatsApp Business account is connected.</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 rounded-lg bg-white p-4 dark:bg-emerald-950">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Business Account</span>
                      <span className="font-medium">{businessName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="font-medium">{phone}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold">Notification preferences</h2>
                <p className="mt-1 text-sm text-muted-foreground">Choose which delivery events trigger WhatsApp notifications.</p>
              </div>
              <div className="space-y-3">
                {notifPrefs.map((p) => (
                  <div
                    key={p.key}
                    className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                        <p.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{p.label}</p>
                        <p className="text-xs text-muted-foreground">{p.desc}</p>
                      </div>
                    </div>
                    <Switch checked={prefs[p.key]} onCheckedChange={(v) => setPrefs({ ...prefs, [p.key]: v })} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <CheckCircle className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold">Your WhatsApp notification system is ready.</h2>
              <p className="mt-2 max-w-md text-muted-foreground">
                You're all set up. Start creating deliveries and your customers will receive WhatsApp notifications automatically.
              </p>
              <div className="mt-8 grid w-full max-w-md gap-3 text-left">
                {[
                  { icon: Building2, label: 'Business', value: businessName },
                  { icon: MessageCircle, label: 'WhatsApp', value: whatsappConnected ? 'Connected' : 'Not connected' },
                  { icon: Bell, label: 'Notifications', value: `${Object.values(prefs).filter(Boolean).length} enabled` },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="ml-auto text-sm font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          {step < 3 && (
            <div className="mt-8 flex items-center justify-between">
              <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={next}>
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
          {step === 3 && (
            <div className="mt-8 flex justify-center">
              <Button size="lg" onClick={finish}>
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
