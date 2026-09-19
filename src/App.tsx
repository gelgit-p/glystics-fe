import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryProvider } from '@/providers/QueryProvider';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
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
const ContactsPage = lazy(() => import('@/pages/ContactsPage'));
const WhatsAppPage = lazy(() => import('@/pages/WhatsAppPage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const BillingPage = lazy(() => import('@/pages/BillingPage'));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));
const ProfileSettingsPage = lazy(() => import('@/pages/settings/ProfileSettingsPage'));
const TeamSettingsPage = lazy(() => import('@/pages/settings/TeamSettingsPage'));
const ApiSettingsPage = lazy(() => import('@/pages/settings/ApiSettingsPage'));
const WebhooksSettingsPage = lazy(() => import('@/pages/settings/WebhooksSettingsPage'));
const SecuritySettingsPage = lazy(() => import('@/pages/settings/SecuritySettingsPage'));
const TrackingPage = lazy(() => import('@/pages/TrackingPage'));

function PageLoader() {
  return <LoadingState text="Loading page..." />;
}

export default function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/track/:trackingId" element={<TrackingPage />} />

            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/deliveries" element={<DeliveriesPage />} />
              <Route path="/deliveries/:id" element={<DeliveryDetailsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/automations" element={<AutomationsPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
              <Route path="/whatsapp" element={<WhatsAppPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/billing" element={<BillingPage />} />
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
      <Toaster richColors position="top-right" />
    </QueryProvider>
  );
}
