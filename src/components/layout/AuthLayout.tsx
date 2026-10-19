import { Link } from 'react-router-dom';
import { MessageCircle, ArrowLeft } from 'lucide-react';

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Left panel */}
      <div className="hidden flex-1 flex-col justify-between bg-primary p-12 lg:flex">
        <Link to="/" className="flex items-center gap-2.5 text-primary-foreground">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
            <MessageCircle className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold">dispatchly</span>
        </Link>
        <div className="max-w-md">
          <h2 className="text-3xl font-bold text-primary-foreground">
            WhatsApp notifications built for modern logistics.
          </h2>
          <p className="mt-4 text-primary-foreground/80">
            Keep senders and receivers informed at every step of the delivery journey.
          </p>
          <div className="mt-8 space-y-3">
            {['Automated delivery notifications', 'Real-time shipment tracking', 'WhatsApp Business integration'].map((f) => (
              <div key={f} className="flex items-center gap-3 text-primary-foreground/90">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-primary-foreground/60">© 2026 dispatchly. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground lg:hidden">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
          {footer && <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>}
        </div>
      </div>
    </div>
  );
}