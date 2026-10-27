import { useEffect, useState } from 'react';
import { authenticatedFetch as fetch } from '@/lib/authenticated-fetch';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { User, Mail, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SenderProfileCard } from '@/components/ai/SenderProfileForm';

interface UserProfile {
  fullName: string;
  email: string;
  businessName: string;
}

export default function ProfileSettingsPage() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const userId = localStorage.getItem('userId') ?? '';
  const { data: user, isLoading, isError, error } = useQuery<UserProfile>({
    queryKey: ['user-details', userId],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/me`,
        { headers: { accept: '*/*' } },
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch profile: ${response.status} ${response.statusText}`,
        );
      }

      const result: unknown = await response.json();
      if (
        typeof result !== 'object' ||
        result === null ||
        !('fullName' in result) ||
        typeof result.fullName !== 'string' ||
        !('email' in result) ||
        typeof result.email !== 'string' ||
        !('businessName' in result) ||
        typeof result.businessName !== 'string'
      ) {
        throw new Error('The profile response is invalid');
      }
      return {
        fullName: result.fullName,
        email: result.email,
        businessName: result.businessName,
      };
    },
    enabled: Boolean(userId),
  });

  useEffect(() => {
    if (!user) {
      return;
    }
    setName(user.fullName);
    setEmail(user.email);
    setBusinessName(user.businessName);
  }, [user]);

  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'A';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error('Logged-in user ID not found');
      return;
    }
    if (!name.trim() || !email.trim() || !businessName.trim()) {
      toast.error('Name, email, and business name are required');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/update-user/${encodeURIComponent(userId)}`,
        {
          method: 'POST',
          headers: {
            accept: '*/*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName: name.trim(),
            email: email.trim(),
            businessName: businessName.trim(),
          }),
        },
      );
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(
          result?.message ||
            `Failed to update profile: ${response.status} ${response.statusText}`,
        );
      }

      const updatedUser = await response.json() as UserProfile;
      queryClient.setQueryData(['user-details', userId], {
        fullName: updatedUser.fullName || name.trim(),
        email: updatedUser.email || email.trim(),
        businessName: updatedUser.businessName || businessName.trim(),
      });
      toast.success('Profile updated successfully');
    } catch (saveError) {
      toast.error(
        saveError instanceof Error
          ? saveError.message
          : 'Failed to update profile',
      );
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading profile...</p>;
  }
  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : 'Failed to load profile'}
      </p>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-1 text-base font-semibold">Profile Information</h3>
        <p className="mb-6 text-sm text-muted-foreground">Update your personal details and contact information.</p>

        <div className="mb-6 flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <Button variant="outline" size="sm" onClick={() => toast.info('Upload coming soon')}>Change Avatar</Button>
            <p className="mt-1 text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="businessName">Business name</Label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="pl-9" />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </form>
      </div>
      <SenderProfileCard />
    </div>
  );
}
