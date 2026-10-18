import { useEffect, useState } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Coins,
  ExternalLink,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { PageHeader, LoadingState } from '@/components/shared';
import { Button } from '@/components/ui/button';

interface CreditWallet {
  walletId: string;
  businessName: string;
  balance: number;
  creditsUsedThisMonth: number;
  hasPurchasedCredits: boolean;
  lowBalance: boolean;
  lowBalanceThreshold: number;
}

interface CreditPackage {
  id: string;
  name: string;
  priceKobo: number;
  credits: number;
  bonusCredits: number;
}

interface CreditTransaction {
  id: string;
  type: 'PURCHASE' | 'BONUS' | 'USAGE' | 'REFUND' | 'ADMIN_ADJUSTMENT';
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

interface TransactionPage {
  items: CreditTransaction[];
  nextCursor: string | null;
}

interface PurchaseResult {
  checkoutUrl: string;
  purchase: { paymentReference: string };
}

interface ApiError {
  message?: string | string[];
}

const apiUrl = import.meta.env.VITE_API_URL;

function authHeaders() {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('Please sign in again to manage credits.');
  }
  return {
    accept: '*/*',
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

async function readError(response: Response, fallback: string) {
  const body = await response.json().catch(() => null) as ApiError | null;
  const message = Array.isArray(body?.message)
    ? body.message.join(', ')
    : body?.message;
  return new Error(
    message || `${fallback}: ${response.status} ${response.statusText}`,
  );
}

function formatNaira(kobo: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 2,
  }).format(kobo / 100);
}

export default function BillingPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [verificationReference, setVerificationReference] = useState(
    () => localStorage.getItem('pendingCreditReference') ?? '',
  );
  const userId = localStorage.getItem('userId') ?? '';
  const walletQuery = useQuery<CreditWallet>({
    queryKey: ['credit-wallet', userId],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/credits/wallet`, {
        headers: authHeaders(),
      });
      if (!response.ok) {
        throw await readError(response, 'Failed to load credit wallet');
      }
      return response.json() as Promise<CreditWallet>;
    },
    enabled: Boolean(userId),
  });
  const packagesQuery = useQuery<CreditPackage[]>({
    queryKey: ['credit-packages'],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/credits/packages`, {
        headers: authHeaders(),
      });
      if (!response.ok) {
        throw await readError(response, 'Failed to load credit packages');
      }
      return response.json() as Promise<CreditPackage[]>;
    },
    enabled: Boolean(userId),
  });
  const transactionsQuery = useInfiniteQuery<TransactionPage>({
    queryKey: ['credit-transactions', userId],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ limit: '20' });
      if (typeof pageParam === 'string' && pageParam) {
        params.set('cursor', pageParam);
      }
      const response = await fetch(`${apiUrl}/credits/transactions?${params}`, {
        headers: authHeaders(),
      });
      if (!response.ok) {
        throw await readError(response, 'Failed to load credit transactions');
      }
      return response.json() as Promise<TransactionPage>;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(userId),
  });

  const purchaseMutation = useMutation({
    mutationFn: async (packageId: string) => {
      const response = await fetch(`${apiUrl}/credits/purchases`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ packageId }),
      });
      if (!response.ok) {
        throw await readError(response, 'Could not start credit purchase');
      }
      const result = await response.json() as PurchaseResult;
      if (
        typeof result.checkoutUrl !== 'string' ||
        !result.checkoutUrl.startsWith('https://') ||
        typeof result.purchase?.paymentReference !== 'string'
      ) {
        throw new Error('The payment provider returned an invalid checkout link.');
      }
      return result;
    },
    onSuccess: (result) => {
      localStorage.setItem(
        'pendingCreditReference',
        result.purchase.paymentReference,
      );
      setVerificationReference(result.purchase.paymentReference);
      window.location.assign(result.checkoutUrl);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Purchase failed');
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (reference: string) => {
      const response = await fetch(
        `${apiUrl}/credits/purchases/${encodeURIComponent(reference)}/verify`,
        { method: 'POST', headers: authHeaders() },
      );
      if (!response.ok) {
        throw await readError(response, 'Payment has not been confirmed');
      }
      return response.json();
    },
    onSuccess: async () => {
      localStorage.removeItem('pendingCreditReference');
      setVerificationReference('');
      setSearchParams({});
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['credit-wallet', userId] }),
        queryClient.invalidateQueries({ queryKey: ['credit-transactions', userId] }),
      ]);
      toast.success('Payment confirmed. Credits have been added to your wallet.');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Payment verification failed');
    },
  });

  useEffect(() => {
    const returnedReference =
      searchParams.get('credit_reference') ?? searchParams.get('reference');
    if (returnedReference) {
      setVerificationReference(returnedReference);
      localStorage.setItem('pendingCreditReference', returnedReference);
    }
  }, [searchParams]);

  const transactions =
    transactionsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const purchaseRequired = searchParams.get('purchaseRequired') === 'true';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Credit Wallet"
        description={`Manage credits${walletQuery.data?.businessName ? ` for ${walletQuery.data.businessName}` : ''}. Credits are charged for deliveries and WhatsApp notifications.`}
      />

      {purchaseRequired && !walletQuery.data?.hasPurchasedCredits && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Purchase credits to unlock platform features</p>
            <p className="mt-1 text-sm">Deliveries, notifications, templates, automations, and WhatsApp tools are locked until a purchase is confirmed.</p>
          </div>
        </div>
      )}

      {walletQuery.isLoading ? (
        <LoadingState text="Loading your credit wallet..." />
      ) : walletQuery.isError ? (
        <div className="rounded-xl border border-destructive/30 bg-card p-5">
          <p className="font-semibold">Could not load your wallet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {walletQuery.error instanceof Error ? walletQuery.error.message : 'Please try again.'}
          </p>
          <Button className="mt-3" variant="outline" onClick={() => walletQuery.refetch()}>
            Try again
          </Button>
        </div>
      ) : walletQuery.data ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Coins className="h-4 w-4 text-primary" /> Available credits
              </div>
              <p className="mt-3 text-3xl font-bold">{walletQuery.data.balance.toLocaleString()}</p>
              <p className="mt-1 text-xs text-muted-foreground">Business wallet balance</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowUpRight className="h-4 w-4 text-orange-600" /> Used this month
              </div>
              <p className="mt-3 text-3xl font-bold">{walletQuery.data.creditsUsedThisMonth.toLocaleString()}</p>
              <p className="mt-1 text-xs text-muted-foreground">Delivery and WhatsApp charges</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-emerald-600" /> Account status
              </div>
              <p className="mt-3 text-xl font-semibold">
                {walletQuery.data.hasPurchasedCredits ? 'Credits purchased' : 'Purchase required'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Low-balance alert at {walletQuery.data.lowBalanceThreshold} credits
              </p>
            </div>
          </section>

          {walletQuery.data.lowBalance && (
            <div className="flex items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">Your credit balance is low. Purchase a package to avoid interrupted deliveries and notifications.</p>
            </div>
          )}
        </>
      ) : null}

      {verificationReference && (
        <section className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">Payment awaiting confirmation</p>
            <p className="mt-1 break-all font-mono text-xs text-muted-foreground">{verificationReference}</p>
          </div>
          <Button
            onClick={() => verifyMutation.mutate(verificationReference)}
            disabled={verifyMutation.isPending}
          >
            {verifyMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Verify payment
          </Button>
        </section>
      )}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Credit packages</h2>
          <p className="text-sm text-muted-foreground">Secure checkout opens on Bachs. Credits are added only after server-side payment verification.</p>
        </div>
        {packagesQuery.isLoading ? (
          <LoadingState text="Loading packages..." />
        ) : packagesQuery.isError ? (
          <div className="rounded-xl border border-destructive/30 bg-card p-5">
            <p className="font-semibold">Could not load credit packages</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {packagesQuery.error instanceof Error ? packagesQuery.error.message : 'Please try again.'}
            </p>
            <Button className="mt-3" variant="outline" onClick={() => packagesQuery.refetch()}>Try again</Button>
          </div>
        ) : packagesQuery.data?.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {packagesQuery.data.map((item) => (
              <article key={item.id} className="flex flex-col rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="mt-2 text-2xl font-bold">{formatNaira(item.priceKobo)}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-xl font-semibold">{item.credits.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">credits</span>
                </div>
                {item.bonusCredits > 0 ? (
                  <p className="mt-1 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    +{item.bonusCredits.toLocaleString()} bonus credits
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">No bonus credits</p>
                )}
                <Button
                  className="mt-5"
                  onClick={() => purchaseMutation.mutate(item.id)}
                  disabled={purchaseMutation.isPending}
                >
                  {purchaseMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
                  Purchase package
                </Button>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No credit packages are currently available.
          </div>
        )}
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Credit history</h2>
          <p className="text-sm text-muted-foreground">Purchases, promotional bonuses, usage, and refunds.</p>
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {transactionsQuery.isLoading ? (
            <LoadingState text="Loading transaction history..." />
          ) : transactionsQuery.isError ? (
            <div className="p-5 text-sm text-destructive">
              {transactionsQuery.error instanceof Error ? transactionsQuery.error.message : 'Failed to load credit history'}
              <Button className="ml-3" variant="outline" size="sm" onClick={() => transactionsQuery.refetch()}>Retry</Button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-10 text-center">
              <ArrowDownLeft className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 font-medium">No credit transactions yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Purchases and usage will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-full bg-muted p-2">
                      {transaction.amount < 0 ? <ArrowUpRight className="h-4 w-4 text-orange-600" /> : <ArrowDownLeft className="h-4 w-4 text-emerald-600" />}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">{new Date(transaction.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${transaction.amount < 0 ? 'text-orange-700 dark:text-orange-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Balance {transaction.balanceAfter.toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {transactionsQuery.hasNextPage && (
                <div className="p-4 text-center">
                  <Button variant="outline" onClick={() => transactionsQuery.fetchNextPage()} disabled={transactionsQuery.isFetchingNextPage}>
                    {transactionsQuery.isFetchingNextPage && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Load more
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
