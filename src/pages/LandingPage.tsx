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
  Phone,
  Smartphone,
  Coins,
  Sparkles,
  Bot,
  ClipboardCheck,
  MousePointerClick,
  ShieldCheck,
  Wallet,
  FileText,
} from 'lucide-react';
import { CREDIT_PACKAGE_OFFERS, formatNaira } from '@/lib/credit-packages';

const features = [
  { icon: Sparkles, title: 'Dispatchly AI agent', desc: 'An AI agent that reads WhatsApp conversations, detects delivery intent, and prepares deliveries for you.' },
  { icon: Bot, title: 'Automatic detail extraction', desc: 'Receiver, address, package, weight, value and pickup date extracted from chat — missing details are asked for automatically.' },
  { icon: ClipboardCheck, title: 'Courier quotes in chat', desc: 'Shipbubble courier prices are sent to the customer on WhatsApp. They reply with an option number to choose.' },
  { icon: MousePointerClick, title: 'Human approval, always', desc: 'Nothing is booked without your approval. AI prepares drafts; you confirm before credits, checkout and labels.' },
  { icon: Bell, title: 'Automated delivery notifications', desc: 'Trigger WhatsApp messages automatically at every stage of the delivery journey.' },
  { icon: MessageCircle, title: 'WhatsApp Business integration', desc: 'Connect your WhatsApp Business account and start sending in minutes.' },
  { icon: Truck, title: 'Real-time shipment tracking', desc: 'Track every shipment from pickup to delivery with live status updates.' },
  { icon: Smartphone, title: 'Notification templates', desc: 'Pre-approved WhatsApp templates for every delivery event, fully customizable.' },
  { icon: Zap, title: 'Delivery event automation', desc: 'Build workflows that react to delivery events and notify customers instantly.' },
  { icon: BarChart3, title: 'Analytics', desc: 'Track delivery rates, message engagement, and customer response times.' },
  { icon: Code, title: 'REST API', desc: 'Integrate dispatchly directly into your existing logistics systems.' },
  { icon: Webhook, title: 'Webhooks', desc: 'Get real-time callbacks for every message and delivery event.' },
];

const workflow = ['WhatsApp Request', 'AI Draft Created', 'Quotes Sent', 'Customer Selected', 'Payment Confirmed', 'Label Booked', 'Picked Up', 'In Transit', 'Completed'];

export default function LandingPage() {
  const buyCreditsPath = localStorage.getItem('accessToken')
    ? '/billing'
    : '/register';

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MessageCircle className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">dispatchly</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#ai-agent" className="text-sm font-medium text-muted-foreground hover:text-foreground">AI Agent</a>
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground">How it works</a>
            <a href="#workflow" className="text-sm font-medium text-muted-foreground hover:text-foreground">Workflow</a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground">Pricing</a>
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
              New · Dispatchly AI agent for WhatsApp deliveries
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Your AI delivery agent on WhatsApp.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Dispatchly AI reads customer WhatsApp chats, extracts delivery details, sends courier quotes, takes the customer’s choice, and prepares payment and booking — with your approval at every consequential step.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
              >
                Try Dispatchly AI <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#ai-agent"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                See how it works
              </a>
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


      {/* Dispatchly AI agent */}
      <section id="ai-agent" className="border-t border-border py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                <Sparkles className="h-3.5 w-3.5" /> Dispatchly AI
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">From WhatsApp chat to booked delivery — automatically.</h2>
              <p className="mt-4 text-muted-foreground">
                Customers already order on WhatsApp. Dispatchly AI turns those conversations into validated, priced, trackable deliveries without your team copying details into forms.
              </p>
              <ul className="mt-6 space-y-4">
                {[
                  { icon: MessageCircle, title: 'Detects delivery requests in chat', desc: 'Understands intent in inbound WhatsApp messages and starts a delivery draft instantly.' },
                  { icon: FileText, title: 'Extracts & completes the details', desc: 'Pulls receiver, address, package, weight, value and pickup date — and politely asks for anything missing.' },
                  { icon: Truck, title: 'Sends courier quotes to the customer', desc: 'Live Shipbubble courier prices are messaged to the customer, who replies with an option number.' },
                  { icon: Wallet, title: 'Payment link in the same chat', desc: 'On selection, the payment link is texted back automatically. Booking happens only after payment confirms.' },
                  { icon: ShieldCheck, title: 'You stay in control', desc: 'Review drafts, compare quotes, approve or reject. Turn AI detection on or off per account in Automations.' },
                ].map((item) => (
                  <li key={item.title} className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground"><item.icon className="h-4 w-4" /></div>
                    <div><h3 className="font-semibold">{item.title}</h3><p className="text-sm text-muted-foreground">{item.desc}</p></div>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/register" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                  Start with AI <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#how-it-works" className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted">See the workflow</a>
              </div>
            </div>

            {/* WhatsApp conversation demo (illustrative) */}
            <div className="mx-auto w-full max-w-md">
              <div className="overflow-hidden rounded-2xl border border-border bg-[#ece5dd] shadow-xl">
                <div className="flex items-center gap-3 bg-[#075e54] px-4 py-3 text-white">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20"><MessageCircle className="h-5 w-5" /></div>
                  <div><p className="text-sm font-semibold">Your Business · WhatsApp</p><p className="text-xs text-white/70">Dispatchly AI active</p></div>
                </div>
                <div className="space-y-3 p-4 text-sm">
                  <div className="ml-auto max-w-[85%] rounded-lg rounded-tr-none bg-white p-3 shadow-sm">
                    Please deliver a laptop to Ada Lovelace 08028520094 at 55, Herbert Macaulay Way, Yaba, Lagos, 2kg worth 500000, pickup 2026-10-30
                  </div>
                  <div className="max-w-[85%] rounded-lg rounded-tl-none bg-[#dcf8c6] p-3 shadow-sm">
                    🚚 <strong>Delivery quote options</strong><br /><br />
                    1. <strong>Millie Express</strong> — NGN 1,453 · ETA 2 days<br />
                    2. <strong>DHL Express</strong> — NGN 3,900 · ETA 1 day<br /><br />
                    Reply with the <strong>number</strong> of the option you want (for example: 1).
                  </div>
                  <div className="ml-auto w-fit rounded-lg rounded-tr-none bg-white px-4 py-2 font-semibold shadow-sm">1</div>
                  <div className="max-w-[85%] rounded-lg rounded-tl-none bg-[#dcf8c6] p-3 shadow-sm">
                    ✅ You selected option 1: Millie Express.<br /><br />
                    Please complete payment using this secure link:<br />
                    <span className="text-blue-700 underline">checkout.dispatchly…/pay</span><br /><br />
                    Your shipment will be booked after payment is confirmed.
                  </div>
                </div>
                <p className="border-t border-border bg-white px-4 py-2 text-center text-xs text-muted-foreground">Illustrative conversation. Prices shown are examples, not live quotes.</p>
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
            <p className="mt-2 text-muted-foreground">From a WhatsApp message to a booked, trackable delivery — with your approval built in.</p>
          </div>
          <div className="space-y-0">
            {[
              { icon: MessageCircle, title: 'Customer chats you', desc: 'A customer sends a normal WhatsApp message asking for a delivery.' },
              { icon: Sparkles, title: 'AI extracts the details', desc: 'Dispatchly AI detects the request, fills the draft, and asks for anything missing.' },
              { icon: Truck, title: 'Quotes go back on WhatsApp', desc: 'Courier prices are sent in chat; the customer replies with an option number.' },
              { icon: ClipboardCheck, title: 'You approve; customer pays', desc: 'Review the draft, approve, and the payment link is texted automatically. Labels are created only after payment confirms.' },
              { icon: Check, title: 'Tracked to completion', desc: 'Pickup, transit and delivery updates flow back to the customer on WhatsApp.' },
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
            <h2 className="text-3xl font-bold tracking-tight">Everything you need to deliver, without the manual work</h2>
            <p className="mt-2 text-muted-foreground">AI delivery automation plus a complete communication platform for logistics operations.</p>
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

      {/* Credit pricing */}
      <section id="pricing" className="border-t border-border bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">Simple credit pricing</h2>
            <p className="mt-3 text-muted-foreground">
              Choose a credit package to get started. Pay securely at checkout, then use credits for deliveries and WhatsApp notifications.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3">
            {CREDIT_PACKAGE_OFFERS.map((offer) => (
              <article
                key={offer.name}
                className={`flex flex-col rounded-xl border bg-white p-6 shadow-sm ${
                  offer.name === 'Growth'
                    ? 'border-primary ring-1 ring-primary'
                    : 'border-border'
                }`}
              >
                {offer.name === 'Growth' && (
                  <span className="mb-3 w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    Popular
                  </span>
                )}
                <h3 className="text-lg font-semibold">{offer.name}</h3>
                <p className="mt-4 text-3xl font-bold">{formatNaira(offer.priceKobo)}</p>
                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Coins className="h-4 w-4 text-primary" />
                  {offer.credits.toLocaleString()} credits
                </div>
                <p className="mt-5 text-sm text-muted-foreground">
                  One-time purchase. Credits are added after payment is confirmed.
                </p>
                <Link
                  to={buyCreditsPath}
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Buy credits to get started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
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
            Let AI turn WhatsApp chats into deliveries.
          </h2>
          <p className="mt-3 text-primary-foreground/80">
            Connect WhatsApp, enable Dispatchly AI, and approve your first AI-prepared delivery today.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-white/90"
          >
            Start with Dispatchly AI <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-white py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <MessageCircle className="h-4 w-4" />
              </div>
              <span className="font-semibold">dispatchly</span>
            </div>
            <p className="text-sm text-muted-foreground">AI delivery automation & WhatsApp notifications for modern logistics.</p>
          </div>
          <address className="flex flex-col items-center gap-2 border-t border-border pt-6 text-center text-sm not-italic text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
            <a href="tel:+2348028520094" className="inline-flex items-center gap-2 font-medium text-foreground hover:text-primary">
              <Phone className="h-4 w-4 text-primary" /> +234 802 852 0094
            </a>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-primary" /> 2A Beach Road, Ojo, Lagos, Nigeria
            </span>
          </address>
        </div>
      </footer>
    </div>
  );
}
