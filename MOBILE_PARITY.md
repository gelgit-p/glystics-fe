# Dispatchly Mobile (Responsive Web) — Feature Parity

There is **no separate native/mobile codebase** in this repo (no Expo/React Native project). The mobile app is the responsive Vite/React frontend in `fe/`. This upgrade makes that frontend mobile-first while reusing the same NestJS APIs.

## Bottom navigation
Home (`/dashboard`) · Deliveries (`/deliveries`) · Automation (`/automations`) · Credits (`/billing`) · More (drawer with all sections incl. AI, WhatsApp, Templates, Notifications, Settings). Credit-locked tabs show a lock and route to Billing. Safe-area bottom padding prevents content hiding behind the bar.

## Parity checklist
| Web feature | Mobile status | Notes |
|---|---|---|
| Auth / protected routes | ✅ Complete | Existing JWT + refresh via `authenticatedFetch`; `CreditAccessGate` unchanged |
| Dashboard stats + WhatsApp stats | ✅ Complete | Real `/delivery/analytics`; mock activity chart series remains (labelled by existing code, not payment data) |
| Credits on dashboard + quick actions | ✅ Complete | Real `/credits/wallet`; Create/View deliveries, Manage credits, AI detection shortcuts |
| Recent deliveries | ✅ Complete | Cards on phones, table on ≥sm |
| Delivery list/search/status filter | ✅ Complete | Existing real `/delivery/:userId`; mobile cards with payment CTA + details link |
| Create delivery + quotes + checkout | ✅ Complete (existing flow) | Multi-step Shipbubble rates/insurance/checkout in DeliveriesPage dialogs; forms already responsive grids. Wide-screen-only creation table replaced by cards for list; creation remains dialog-based |
| Delivery details/tracking | ✅ Complete | Existing pages/routes retained |
| AI overview/inbox/drafts/approvals/audit | ✅ Complete | Draft/audit mobile cards; inbox stacks; draft detail already stacked with quote/WhatsApp/payment panels |
| Provider quote comparison + dispatch | ✅ Complete | Numbered quote cards/radio, recommended badge, customer WhatsApp selection, owner approval, payment-link + label status; paid-first rule preserved |
| Automations CRUD/toggle + AI detection switch + Super Admin | ✅ Complete | Existing AutomationsPage cards + AiAutomationSettings; bottom tab = Automation |
| Templates | ✅ Existing UI retained | Uses existing templates pages/APIs; no new fake template creation introduced |
| Notifications | ✅ Complete | Mobile cards; detail sheet retained |
| Billing/packages/transactions/purchase | ✅ Complete (existing) | Real Bachs checkout links; never simulated. Balance refresh via React Query invalidation on billing page |
| Profile/sender/WhatsApp connection/Webhooks+logs/settings | ✅ Complete (existing) | Retained; webhook logs expandable JSON |
| Dark theme | ⚠️ Partial pre-existing | CSS `.dark` tokens exist; no new theme toggle added in this task |

## Blocked / limitations (documented, not faked)
- Dashboard activity chart still uses the pre-existing `deliveryActivityData` mock series for the chart only; headline stats are real analytics. Replace when backend exposes time-series analytics.
- No offline mode / native push / native date-picker — this is a responsive web app, not a native app. Browser back/deep links work via React Router.
- Template creation power-user flows remain dense on very small screens (existing 1714-line page); list/filter usage is functional, but a dedicated template-creation wizard was out of scope.
- Delivery creation wizard is dialog-based (existing); on small phones it scrolls — usable, but a full-screen stepper would be a further UX improvement.

## Validation
- `npm test` (Vitest): bottom-nav tabs/active route, AI draft mobile cards.
- `npm run typecheck`, `npm run build`, targeted `eslint` on changed files.
