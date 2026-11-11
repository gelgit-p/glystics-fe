import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryProvider } from '@/providers/QueryProvider';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CreditAccessGate } from '@/components/layout/CreditAccessGate';
import { LoadingState } from '@/components/shared';

const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const DeliveriesPage = lazy(() => import('@/pages/DeliveriesPage'));
const DeliveryDetailsPage = lazy(() => import('@/pages/DeliveryDetailsPage'));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'));
const TemplatesPage = lazy(() => import('@/pages/TemplatesPage'));
const AutomationsPage = lazy(() => import('@/pages/AutomationsPage'));
const WhatsAppPage = lazy(() => import('@/pages/WhatsAppPage'));
const BillingPage = lazy(() => import('@/pages/BillingPage'));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));
const ProfileSettingsPage = lazy(() => import('@/pages/settings/ProfileSettingsPage'));
const TeamSettingsPage = lazy(() => import('@/pages/settings/TeamSettingsPage'));
const ApiSettingsPage = lazy(() => import('@/pages/settings/ApiSettingsPage'));
const WebhooksSettingsPage = lazy(() => import('@/pages/settings/WebhooksSettingsPage'));
const SecuritySettingsPage = lazy(() => import('@/pages/settings/SecuritySettingsPage'));
const TrackingPage = lazy(() => import('@/pages/TrackingPage'));
const AiOverviewPage = lazy(() => import('@/pages/ai/AiOverviewPage'));
const AiInboxPage = lazy(() => import('@/pages/ai/AiInboxPage'));
const AiDraftsPage = lazy(() => import('@/pages/ai/AiDraftsPage'));
const AiDraftDetailsPage = lazy(() => import('@/pages/ai/AiDraftDetailsPage'));
const AiApprovalsPage = lazy(() => import('@/pages/ai/AiApprovalsPage'));
const AiAuditPage = lazy(() => import('@/pages/ai/AiAuditPage'));
const AdminLayout = lazy(() => import('@/components/layout/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const AdminUsersPage = lazy(() => import('@/pages/admin/users/AdminUsersPage'));
const AdminUserDetailPage = lazy(() => import('@/pages/admin/users/AdminUserDetailPage'));
const AdminDeliveriesPage = lazy(() => import('@/pages/admin/deliveries/AdminDeliveriesPage'));
const AdminDeliveryDetailPage = lazy(() => import('@/pages/admin/deliveries/AdminDeliveryDetailPage'));
const AdminBillingPage = lazy(() => import('@/pages/admin/billing/AdminBillingPage'));
const AdminNotificationsPage = lazy(() => import('@/pages/admin/notifications/AdminNotificationsPage'));
const AdminTemplatesPage = lazy(() => import('@/pages/admin/templates/AdminTemplatesPage'));
const AdminAutomationsPage = lazy(() => import('@/pages/admin/automations/AdminAutomationsPage'));
const AdminWhatsappPage = lazy(() => import('@/pages/admin/whatsapp/AdminWhatsappPage'));
const AdminAiPage = lazy(() => import('@/pages/admin/ai/AdminAiPage'));
const AdminAiConversationPage = lazy(() => import('@/pages/admin/ai/AdminAiConversationPage'));
const AdminOverviewPage = lazy(() => import('@/pages/admin/overview/AdminOverviewPage'));
const SNInfoPage = lazy(() => import('@/pages/shared-network/InfoPage'));
const SNJoinPage = lazy(() => import('@/pages/shared-network/JoinPage'));
const SNLayout = lazy(() => import('@/pages/shared-network/SharedNetworkLayout'));
const SNOverviewPage = lazy(() => import('@/pages/shared-network/OverviewPage'));
const SNCapacityPage = lazy(() => import('@/pages/shared-network/CapacityPage'));
const SNSlotsPage = lazy(() => import('@/pages/shared-network/SlotsPage'));
const SNPoolsPage = lazy(() => import('@/pages/shared-network/PoolsPage'));
const SNDeliveriesPage = lazy(() => import('@/pages/shared-network/DeliveriesPage'));
const SNCreditsPage = lazy(() => import('@/pages/shared-network/CreditsPage'));
const SNBillingPage = lazy(() => import('@/pages/shared-network/BillingPage'));
const SNAiPage = lazy(() => import('@/pages/shared-network/AiPage'));
const SNAnalyticsPage = lazy(() => import('@/pages/shared-network/AnalyticsPage'));
const SNSettingsPage = lazy(() => import('@/pages/shared-network/SettingsPage'));
const AdminSharedNetworkPage = lazy(() => import('@/pages/admin/shared-network/AdminSharedNetworkPage'));
const LPLayout = lazy(() => import('@/pages/logistics-provider/LogisticsProviderLayout'));
const LPOverviewPage = lazy(() => import('@/pages/logistics-provider/OverviewPage'));
const LPCapacityPage = lazy(() => import('@/pages/logistics-provider/CapacityPage'));
const LPZonesPage = lazy(() => import('@/pages/logistics-provider/ZonesPage'));
const LPReservationsPage = lazy(() => import('@/pages/logistics-provider/ReservationsPage'));
const LPShipmentsPage = lazy(() => import('@/pages/logistics-provider/ShipmentsPage'));
const LPFleetPage = lazy(() => import('@/pages/logistics-provider/FleetEarningsProfilePages').then((m) => ({ default: m.LogisticsFleetPage })));
const LPEarningsPage = lazy(() => import('@/pages/logistics-provider/FleetEarningsProfilePages').then((m) => ({ default: m.LogisticsEarningsPage })));
const LPProfilePage = lazy(() => import('@/pages/logistics-provider/FleetEarningsProfilePages').then((m) => ({ default: m.LogisticsProfilePage })));
const LPMarketplacePage = lazy(() => import('@/pages/logistics-provider/MarketplacePage'));

function PageLoader() {
  return <LoadingState text="Loading page..." />;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const accessToken = localStorage.getItem('accessToken');

  return accessToken ? children : <Navigate to="/login" replace />;
}

function LogisticsProviderRoute({ children }: { children: React.ReactNode }) {
  // Server enforces LOGISTICS_PROVIDER (LogisticsProviderGuard re-reads DB role); this is UX gating only.
  return localStorage.getItem('userRole') === 'LOGISTICS_PROVIDER' ? children : <Navigate to="/dashboard" replace />;
}

function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  // Server enforces SUPER_ADMIN (SuperAdminGuard re-reads DB role); this is UX gating only.
  return localStorage.getItem('userRole') === 'SUPER_ADMIN' ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <QueryProvider>
      <TooltipProvider delayDuration={250}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/shared-network-info" element={<SNInfoPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/track/:trackingId"
              element={
                <ProtectedRoute>
                  <TrackingPage />
                </ProtectedRoute>
              }
            />

            {/* Admin has its own layout (sidebar + topbar); it must not nest
                inside DashboardLayout or both shells render duplicate chrome. */}
            <Route element={<ProtectedRoute><SuperAdminRoute><AdminLayout /></SuperAdminRoute></ProtectedRoute>}>
              <Route path="/admin" element={<AdminOverviewPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/users/:id" element={<AdminUserDetailPage />} />
              <Route path="/admin/deliveries" element={<AdminDeliveriesPage />} />
              <Route path="/admin/deliveries/:id" element={<AdminDeliveryDetailPage />} />
              <Route path="/admin/billing" element={<AdminBillingPage />} />
              <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
              <Route path="/admin/templates" element={<AdminTemplatesPage />} />
              <Route path="/admin/automations" element={<AdminAutomationsPage />} />
              <Route path="/admin/whatsapp" element={<AdminWhatsappPage />} />
              <Route path="/admin/ai" element={<AdminAiPage />} />
              <Route path="/admin/ai/conversations/:id" element={<AdminAiConversationPage />} />
              <Route path="/admin/shared-network" element={<AdminSharedNetworkPage />} />
            </Route>

            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/deliveries" element={<CreditAccessGate><DeliveriesPage /></CreditAccessGate>} />
              <Route path="/deliveries/:id" element={<CreditAccessGate><DeliveryDetailsPage /></CreditAccessGate>} />
              <Route path="/notifications" element={<CreditAccessGate><NotificationsPage /></CreditAccessGate>} />
              <Route path="/templates" element={<CreditAccessGate><TemplatesPage /></CreditAccessGate>} />
              <Route path="/automations" element={<CreditAccessGate><AutomationsPage /></CreditAccessGate>} />
              <Route path="/whatsapp" element={<CreditAccessGate><WhatsAppPage /></CreditAccessGate>} />
              <Route path="/ai" element={<CreditAccessGate><AiOverviewPage /></CreditAccessGate>} />
              <Route path="/ai/inbox" element={<CreditAccessGate><AiInboxPage /></CreditAccessGate>} />
              <Route path="/ai/drafts" element={<CreditAccessGate><AiDraftsPage /></CreditAccessGate>} />
              <Route path="/ai/drafts/:id" element={<CreditAccessGate><AiDraftDetailsPage /></CreditAccessGate>} />
              <Route path="/ai/approvals" element={<CreditAccessGate><AiApprovalsPage /></CreditAccessGate>} />
              <Route path="/ai/audit" element={<CreditAccessGate><AiAuditPage /></CreditAccessGate>} />
              <Route path="/billing" element={<BillingPage />} />
              <Route path="/shared-network/join" element={<SNJoinPage />} />
              <Route element={<SNLayout />}>
                <Route path="/shared-network" element={<SNOverviewPage />} />
                <Route path="/shared-network/capacity" element={<SNCapacityPage />} />
                <Route path="/shared-network/slots" element={<SNSlotsPage />} />
                <Route path="/shared-network/pools" element={<SNPoolsPage />} />
                <Route path="/shared-network/deliveries" element={<SNDeliveriesPage />} />
                <Route path="/shared-network/credits" element={<SNCreditsPage />} />
                <Route path="/shared-network/billing" element={<SNBillingPage />} />
                <Route path="/shared-network/ai" element={<SNAiPage />} />
                <Route path="/shared-network/analytics" element={<SNAnalyticsPage />} />
                <Route path="/shared-network/settings" element={<SNSettingsPage />} />
              </Route>
              <Route element={<LogisticsProviderRoute><LPLayout /></LogisticsProviderRoute>}>
                <Route path="/logistics-provider" element={<LPOverviewPage />} />
                <Route path="/logistics-provider/capacity" element={<LPCapacityPage />} />
                <Route path="/logistics-provider/zones" element={<LPZonesPage />} />
                <Route path="/logistics-provider/reservations" element={<LPReservationsPage />} />
                <Route path="/logistics-provider/shipments" element={<LPShipmentsPage />} />
                <Route path="/logistics-provider/fleet" element={<LPFleetPage />} />
                <Route path="/logistics-provider/earnings" element={<LPEarningsPage />} />
                <Route path="/logistics-provider/marketplace" element={<LPMarketplacePage />} />
                <Route path="/logistics-provider/profile" element={<LPProfilePage />} />
              </Route>
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/settings/profile" element={<ProfileSettingsPage />} />
              <Route path="/settings/team" element={<TeamSettingsPage />} />
              <Route path="/settings/api" element={<ApiSettingsPage />} />
              <Route path="/settings/webhooks" element={<WebhooksSettingsPage />} />
              <Route path="/settings/security" element={<SecuritySettingsPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
      </TooltipProvider>
      <Toaster richColors position="top-right" />
    </QueryProvider>
  );
}
