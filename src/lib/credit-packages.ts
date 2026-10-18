export const CREDIT_PACKAGE_OFFERS = [
  { name: 'Starter', priceKobo: 50_000, credits: 50, bonusCredits: 0 },
  { name: 'Growth', priceKobo: 200_000, credits: 220, bonusCredits: 0 },
  { name: 'Business', priceKobo: 500_000, credits: 600, bonusCredits: 0 },
] as const;

export function formatNaira(kobo: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 2,
  }).format(kobo / 100);
}
