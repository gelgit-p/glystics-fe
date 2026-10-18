import { useQuery } from '@tanstack/react-query';
import { Link, Navigate } from 'react-router-dom';

interface CreditWalletAccess {
  hasPurchasedCredits: boolean;
}

export function CreditAccessGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = localStorage.getItem('userId') ?? '';
  const accessToken = localStorage.getItem('accessToken') ?? '';
  const wallet = useQuery<CreditWalletAccess>({
    queryKey: ['credit-wallet', userId],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/credits/wallet`,
        {
          headers: {
            accept: '*/*',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      if (!response.ok) {
        throw new Error(
          `Could not check credit access: ${response.status} ${response.statusText}`,
        );
      }

      const result: unknown = await response.json();
      if (
        typeof result !== 'object' ||
        result === null ||
        !('hasPurchasedCredits' in result) ||
        typeof result.hasPurchasedCredits !== 'boolean'
      ) {
        throw new Error('Invalid credit wallet response');
      }
      return { hasPurchasedCredits: result.hasPurchasedCredits };
    },
    enabled: Boolean(userId && accessToken),
    staleTime: 15_000,
  });

  if (!userId || !accessToken) {
    return <Navigate to="/login" replace />;
  }
  if (wallet.isLoading) {
    return <div className="p-8 text-sm text-muted-foreground">Checking credit access...</div>;
  }
  if (wallet.isError) {
    return (
      <div className="max-w-xl rounded-xl border border-destructive/30 bg-card p-6">
        <h2 className="font-semibold">Unable to verify credit access</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {wallet.error instanceof Error
            ? wallet.error.message
            : 'Please try again from Billing.'}
        </p>
        <Link to="/billing" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
          Open Billing
        </Link>
      </div>
    );
  }
  if (!wallet.data?.hasPurchasedCredits) {
    return <Navigate to="/billing?purchaseRequired=true" replace />;
  }

  return children;
}
