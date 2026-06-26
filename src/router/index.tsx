import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import ProtectedRoute from '@/components/shared/ProtectedRoute'

// Auth
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const VerifyPage = lazy(() => import('@/pages/auth/onboarding/VerifyPage'))
const DetailsPage = lazy(() => import('@/pages/auth/onboarding/DetailsPage'))
const BankPage = lazy(() => import('@/pages/auth/onboarding/BankPage'))
const KycPage = lazy(() => import('@/pages/auth/onboarding/KycPage'))
const CompletePage = lazy(() => import('@/pages/auth/onboarding/CompletePage'))

// Buyer
const BuyerDashboardPage = lazy(() => import('@/pages/buyer/DashboardPage'))
const MarketplacePage = lazy(() => import('@/pages/buyer/MarketplacePage'))
const BuyerListingDetailPage = lazy(() => import('@/pages/buyer/BuyerListingDetailPage'))
const BuyerBidsPage = lazy(() => import('@/pages/buyer/BuyerBidsPage'))
const BuyerDealsPage = lazy(() => import('@/pages/buyer/BuyerDealsPage'))
const BuyerHistoryPage = lazy(() => import('@/pages/buyer/BuyerHistoryPage'))
const BuyerProfilePage = lazy(() => import('@/pages/buyer/ProfilePage'))
const ProofOfFundsPage = lazy(() => import('@/pages/buyer/ProofOfFundsPage'))

// Wholesaler
const WholesalerDashboardPage = lazy(() => import('@/pages/wholesaler/DashboardPage'))
const CreateListingPage = lazy(() => import('@/pages/wholesaler/CreateListingPage'))
const ListingsPage = lazy(() => import('@/pages/wholesaler/ListingsPage'))
const DraftListingDetailPage = lazy(() => import('@/pages/wholesaler/DraftListingDetailPage'))
const WholesalerDealsPage = lazy(() => import('@/pages/wholesaler/WholesalerDealsPage'))
const BidsPage = lazy(() => import('@/pages/wholesaler/BidsPage'))
const ScorePage = lazy(() => import('@/pages/wholesaler/ScorePage'))
const WholesalerSettingsPage = lazy(() => import('@/pages/wholesaler/WholesalerSettingsPage'))
const CompliancePendingPage = lazy(() => import('@/pages/wholesaler/CompliancePendingPage'))

// Admin
const AdminControlCenterPage = lazy(() => import('@/pages/admin/AdminControlCenterPage'))
const AdminVerificationQueuePage = lazy(() => import('@/pages/admin/AdminVerificationQueuePage'))
const AdminPenaltyLogPage = lazy(() => import('@/pages/admin/AdminPenaltyLogPage'))
const AdminChatSurveillancePage = lazy(() => import('@/pages/admin/AdminChatSurveillancePage'))
const AdminFinancialLedgerPage = lazy(() => import('@/pages/admin/AdminFinancialLedgerPage'))
const AdminAllDealsPage = lazy(() => import('@/pages/admin/AdminAllDealsPage'))
const AdminPendingListingsPage = lazy(() => import('@/pages/admin/AdminPendingListingsPage'))
const AdminStateFirewallPage = lazy(() => import('@/pages/admin/AdminStateFirewallPage'))
const AdminUserManagementPage = lazy(() => import('@/pages/admin/AdminUserManagementPage'))

// Title Rep
const TitleRepDashboardPage = lazy(() => import('@/pages/title/TitleRepDashboardPage'))
const TitleDealsPage = lazy(() => import('@/pages/title/TitleDealsPage'))
const TitleEmdsPage = lazy(() => import('@/pages/title/TitleEmdsPage'))

// Deals
const DealTrackerPage = lazy(() => import('@/pages/deals/DealTrackerPage'))
const DealChatPage = lazy(() => import('@/pages/deals/DealChatPage'))
const ContractSigningPage = lazy(() => import('@/pages/deals/ContractSigningPage'))
const EmdInstructionsPage = lazy(() => import('@/pages/deals/EmdInstructionsPage'))
const TitleCompanySelectionPage = lazy(() => import('@/pages/deals/TitleCompanySelectionPage'))
const PostClosingRatingPage = lazy(() => import('@/pages/deals/PostClosingRatingPage'))

// Legal
const TermsPage = lazy(() => import('@/pages/legal/TermsPage'))
const PrivacyPage = lazy(() => import('@/pages/legal/PrivacyPage'))
const NdaPage = lazy(() => import('@/pages/legal/NdaPage'))

// Settings / KYC
const KycVerificationPage = lazy(() => import('@/pages/settings/KycVerificationPage'))
const KycCallbackPage = lazy(() => import('@/pages/kyc/KycCallbackPage'))

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },

  // Auth
  { path: '/login', element: <LoginPage /> },
  { path: '/legal/terms', element: <TermsPage /> },
  { path: '/legal/privacy', element: <PrivacyPage /> },
  { path: '/legal/nda', element: <NdaPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/register/details', element: <DetailsPage /> },
  { path: '/register/verify', element: <VerifyPage /> },
  { path: '/register/kyc', element: <KycPage /> },
  { path: '/register/bank', element: <BankPage /> },
  { path: '/register/complete', element: <CompletePage /> },

  {
    path: '/settings/kyc',
    element: (
      <ProtectedRoute>
        <KycVerificationPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/kyc/callback',
    element: (
      <ProtectedRoute>
        <KycCallbackPage />
      </ProtectedRoute>
    ),
  },

  // Wholesaler
  {
    path: '/wholesaler/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['wholesaler', 'realtor']}>
        <WholesalerDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/wholesaler/listings',
    element: (
      <ProtectedRoute allowedRoles={['wholesaler', 'realtor']} suppressKycBanner>
        <ListingsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/wholesaler/listings/new',
    element: (
      <ProtectedRoute allowedRoles={['wholesaler', 'realtor']} suppressKycBanner>
        <CreateListingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/wholesaler/listings/compliance-pending',
    element: (
      <ProtectedRoute allowedRoles={['wholesaler', 'realtor']} suppressKycBanner>
        <CompliancePendingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/wholesaler/listings/:listingId',
    element: (
      <ProtectedRoute allowedRoles={['wholesaler', 'realtor']} suppressKycBanner>
        <DraftListingDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/wholesaler/score',
    element: (
      <ProtectedRoute allowedRoles={['wholesaler', 'realtor']}>
        <ScorePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/wholesaler/bids',
    element: (
      <ProtectedRoute allowedRoles={['wholesaler', 'realtor']}>
        <BidsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/wholesaler/deals',
    element: (
      <ProtectedRoute allowedRoles={['wholesaler', 'realtor']}>
        <WholesalerDealsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/wholesaler/settings',
    element: (
      <ProtectedRoute allowedRoles={['wholesaler', 'realtor']}>
        <WholesalerSettingsPage />
      </ProtectedRoute>
    ),
  },

  // Buyer
  {
    path: '/buyer/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['buyer']}>
        <BuyerDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/buyer/marketplace',
    element: (
      <ProtectedRoute suppressKycBanner>
        <MarketplacePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/buyer/listings/:id',
    element: (
      <ProtectedRoute suppressKycBanner>
        <BuyerListingDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/buyer/bids',
    element: (
      <ProtectedRoute allowedRoles={['buyer', 'realtor']}>
        <BuyerBidsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/buyer/deals',
    element: (
      <ProtectedRoute allowedRoles={['buyer', 'realtor']}>
        <BuyerDealsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/buyer/history',
    element: (
      <ProtectedRoute allowedRoles={['buyer', 'realtor']}>
        <BuyerHistoryPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/buyer/profile',
    element: (
      <ProtectedRoute allowedRoles={['buyer', 'realtor']}>
        <BuyerProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/buyer/proof-of-funds',
    element: (
      <ProtectedRoute allowedRoles={['buyer', 'realtor']}>
        <ProofOfFundsPage />
      </ProtectedRoute>
    ),
  },

  // Title Rep
  {
    path: '/title/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['title_rep']}>
        <TitleRepDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/title/deals',
    element: (
      <ProtectedRoute allowedRoles={['title_rep', 'admin']}>
        <TitleDealsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/title/emds',
    element: (
      <ProtectedRoute allowedRoles={['title_rep', 'admin']}>
        <TitleEmdsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/deals/:id/chat',
    element: (
      <ProtectedRoute>
        <DealChatPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/deals/:id/rating',
    element: (
      <ProtectedRoute suppressKycBanner>
        <PostClosingRatingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/deals/:id',
    element: (
      <ProtectedRoute>
        <DealTrackerPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/deals/:dealId/sign',
    element: (
      <ProtectedRoute allowedRoles={['buyer']} suppressKycBanner>
        <ContractSigningPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/deals/:dealId/title-company',
    element: (
      <ProtectedRoute allowedRoles={['buyer', 'realtor', 'wholesaler']} suppressKycBanner>
        <TitleCompanySelectionPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/deals/:dealId/emd',
    element: (
      <ProtectedRoute allowedRoles={['buyer']} suppressKycBanner>
        <EmdInstructionsPage />
      </ProtectedRoute>
    ),
  },

  // Admin
  {
    path: '/admin/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminControlCenterPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/penalties',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminPenaltyLogPage />
      </ProtectedRoute>
    ),
  },
  { path: '/admin/penalty-log', element: <Navigate to="/admin/penalties" replace /> },
  {
    path: '/admin/chat',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminChatSurveillancePage />
      </ProtectedRoute>
    ),
  },
  { path: '/admin/chat-surveillance', element: <Navigate to="/admin/chat" replace /> },
  {
    path: '/admin/verification-queue',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminVerificationQueuePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/ledger',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminFinancialLedgerPage />
      </ProtectedRoute>
    ),
  },
  { path: '/admin/financial-ledger', element: <Navigate to="/admin/ledger" replace /> },
  {
    path: '/admin/deals',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminAllDealsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/listings',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminPendingListingsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/state-firewall',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminStateFirewallPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/users',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminUserManagementPage />
      </ProtectedRoute>
    ),
  },

  // Fallback
  { path: '*', element: <Navigate to="/login" replace /> },
])
