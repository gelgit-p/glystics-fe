// Pure mirror of the App.tsx LogisticsProviderRoute gate (there: localStorage userRole),
// kept framework-free so the RBAC rule is unit-testable. Backend LogisticsProviderGuard is authoritative.
export function LogisticsProviderRoute({ status }: { status?: string | null }): 'render' | 'redirect:/dashboard' {
  return status === 'LOGISTICS_PROVIDER' ? 'render' : 'redirect:/dashboard';
}
