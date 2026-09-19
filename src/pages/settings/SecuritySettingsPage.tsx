import { useState } from 'react';
import { toast } from 'sonner';
import { Shield, Lock, Smartphone, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

function SecurityCard({ icon: Icon, title, desc, children }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function SecuritySettingsPage() {
  const [saving, setSaving] = useState(false);
  const [twoFA, setTwoFA] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast.success('Password updated successfully');
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Change password */}
      <SecurityCard icon={Lock} title="Change Password" desc="Update your account password.">
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="current">Current password</Label>
            <Input id="current" type="password" required placeholder="••••••••" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="new">New password</Label>
              <Input id="new" type="password" required placeholder="•••••••••" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input id="confirm" type="password" required placeholder="•••••••••" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>{saving ? 'Updating...' : 'Update Password'}</Button>
          </div>
        </form>
      </SecurityCard>

      {/* Two-factor auth */}
      <SecurityCard icon={Shield} title="Two-Factor Authentication" desc="Add an extra layer of security to your account.">
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <p className="text-sm font-medium">Enable 2FA</p>
            <p className="text-xs text-muted-foreground">Require a verification code at login.</p>
          </div>
          <Switch checked={twoFA} onCheckedChange={(v) => { setTwoFA(v); toast.success(v ? '2FA enabled' : '2FA disabled'); }} />
        </div>
      </SecurityCard>

      {/* Login alerts */}
      <SecurityCard icon={Smartphone} title="Login Alerts" desc="Get notified of new sign-ins to your account.">
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <p className="text-sm font-medium">Email login alerts</p>
            <p className="text-xs text-muted-foreground">Receive an email when someone signs in.</p>
          </div>
          <Switch checked={loginAlerts} onCheckedChange={setLoginAlerts} />
        </div>
      </SecurityCard>

      {/* Active sessions */}
      <SecurityCard icon={Key} title="Active Sessions" desc="Manage devices logged into your account.">
        <div className="space-y-2">
          {[
            { device: 'MacBook Pro · Chrome', location: 'Lagos, NG', current: true, time: 'Active now' },
            { device: 'iPhone 15 · Safari', location: 'Lagos, NG', current: false, time: '2 hours ago' },
          ].map((s) => (
            <div key={s.device} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">{s.device}</p>
                <p className="text-xs text-muted-foreground">{s.location} · {s.time}</p>
              </div>
              {s.current ? (
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Current</span>
              ) : (
                <Button variant="ghost" size="sm" className="text-red-600" onClick={() => toast.success('Session revoked')}>
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </div>
      </SecurityCard>
    </div>
  );
}
