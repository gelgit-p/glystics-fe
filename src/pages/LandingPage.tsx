import { Link } from 'react-router-dom';
import {
  MessageCircle,
  ArrowRight,
  Package,
  Truck,
  Bell,
  Zap,
  BarChart3,
  Code,
  Webhook,
  Check,
  ChevronRight,
  MapPin,
  Smartphone,
} from 'lucide-react';

const features = [
  { icon: Bell, title: 'Automated delivery notifications', desc: 'Trigger WhatsApp messages automatically at every stage of the delivery journey.' },
  { icon: MessageCircle, title: 'WhatsApp Business integration', desc: 'Connect your WhatsApp Business account and start sending in minutes.' },
  { icon: Truck, title: 'Real-time shipment tracking', desc: 'Track every shipment from pickup to delivery with live status updates.' },
  { icon: Smartphone, title: 'Notification templates', desc: 'Pre-approved WhatsApp templates for every delivery event, fully customizable.' },
  { icon: Zap, title: 'Delivery event automation', desc: 'Build workflows that react to delivery events and notify customers instantly.' },
  { icon: BarChart3, title: 'Analytics', desc: 'Track delivery rates, message engagement, and customer response times.' },
  { icon: Code, title: 'REST API', desc: 'Integrate Glystics directly into your existing logistics systems.' },
  { icon: Webhook, title: 'Webhooks', desc: 'Get real-time callbacks for every message and delivery event.' },
];

const workflow = ['Order Created', 'Pickup Scheduled', 'Rider Assigned', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered'];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MessageCircle className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">Glystics</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground">How it works</a>
            <a href="#workflow" className="text-sm font-medium text-muted-foreground hover:text-foreground">Workflow</a>
            <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">Sign in</Link>
          </div>
          <Link
            to="/register"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/40 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Built for logistics businesses
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              WhatsApp notifications built for modern logistics.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Keep senders and receivers informed at every step of the delivery journey with automated WhatsApp notifications.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                View Demo
              </Link>
            </div>
          </div>

          {/* Dashboard preview */}
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="overflow-hidden rounded-xl border border-border shadow-2xl shadow-black/5">
              <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                <div className="ml-3 flex-1 rounded-md border border-border bg-white px-3 py-1 text-xs text-muted-foreground">
                  app.whatsapnotify.com/dashboard
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 bg-muted/30 p-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: 'Total Deliveries', value: '12,482', icon: Package, color: 'text-blue-600' },
                  { label: 'Delivered', value: '10,921', icon: Check, color: 'text-emerald-600' },
                  { label: 'In Transit', value: '1,204', icon: Truck, color: 'text-amber-600' },
                  { label: 'Failed', value: '357', icon: Bell, color: 'text-red-600' },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg border border-border bg-white p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                      <s.icon className={`h-4 w-4 ${s.color}`} />
                    </div>
                    <p className="text-2xl font-bold">{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Delivery Activity</h3>
                  <div className="flex gap-1">
                    {['Today', '7d', '30d', '90d'].map((t, i) => (
                      <span key={t} className={`rounded-md px-2.5 py-1 text-xs font-medium ${i === 1 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex h-40 items-end gap-2">
                  {[40, 55, 70, 60, 85, 50, 35].map((h, i) => (
                    <div key={i} className="flex flex-1 flex-col gap-1">
                      <div className="flex flex-col gap-0.5">
                        <div className="rounded-t bg-primary/80" style={{ height: `${h * 1.5}px` }} />
                        <div className="bg-primary/40" style={{ height: `${h * 0.6}px` }} />
                        <div className="rounded-b bg-primary/20" style={{ height: `${h * 0.3}px` }} />
                      </div>
                      <span className="text-center text-[10px] text-muted-foreground">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-border py-20">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
            <p className="mt-2 text-muted-foreground">From delivery creation to customer notification in five simple steps.</p>
          </div>
          <div className="space-y-0">
            {[
              { icon: Package, title: 'Create Delivery', desc: 'Log a new delivery with sender and receiver details.' },
              { icon: Truck, title: 'Track Shipment', desc: 'Monitor the shipment as it moves through each stage.' },
              { icon: Bell, title: 'Delivery Event', desc: 'An event triggers when the shipment status changes.' },
              { icon: MessageCircle, title: 'WhatsApp Notification', desc: 'A WhatsApp message is sent automatically to the customer.' },
              { icon: Check, title: 'Customer', desc: 'The customer receives real-time updates on their delivery.' },
            ].map((step, i) => (
              <div key={step.title} className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-white">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  {i < 4 && <div className="h-12 w-0.5 bg-border" />}
                </div>
                <div className="pb-6">
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Everything you need to keep customers informed</h2>
            <p className="mt-2 text-muted-foreground">A complete communication platform built for logistics operations.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border border-border bg-white p-6 transition-shadow hover:shadow-md">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Logistics workflow */}
      <section id="workflow" className="border-t border-border py-20">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Logistics workflow</h2>
            <p className="mt-2 text-muted-foreground">Every delivery flows through a clear, trackable lifecycle.</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            {workflow.map((step, i) => (
              <div key={step} className="flex flex-col items-center">
                <div className="flex items-center gap-3 rounded-lg border border-border bg-white px-6 py-3 shadow-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </div>
                  <span className="font-medium">{step}</span>
                </div>
                {i < workflow.length - 1 && <ChevronRight className="my-1 h-5 w-5 rotate-90 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-primary py-20">
        <div className="mx-auto max-w-3xl px-4 text-center lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground">
            Start communicating with your customers automatically.
          </h2>
          <p className="mt-3 text-primary-foreground/80">
            Join logistics companies using Glystics to keep customers informed at every step.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-white/90"
          >
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-white py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MessageCircle className="h-4 w-4" />
            </div>
            <span className="font-semibold">Glystics</span>
          </div>
          <p className="text-sm text-muted-foreground">WhatsApp notifications for modern logistics.</p>
        </div>
      </footer>
    </div>
  );
}
