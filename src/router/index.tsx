import { createBrowserRouter, Navigate } from 'react-router-dom'
import LoginPage from '@/pages/auth/LoginPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import BankPage from '@/pages/auth/onboarding/BankPage'
import CompletePage from '@/pages/auth/onboarding/CompletePage'
import DetailsPage from '@/pages/auth/onboarding/DetailsPage'
import KycPage from '@/pages/auth/onboarding/KycPage'
import OnboardingVerifyPage from '@/pages/auth/onboarding/VerifyPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import WholesalerDashboard from '@/pages/wholesaler/DashboardPage'
import DraftListingDetailPage from '@/pages/wholesaler/DraftListingDetailPage'
import CreateListingPage from '@/pages/wholesaler/CreateListingPage'
import CompliancePendingPage from '@/pages/wholesaler/CompliancePendingPage'
import WholesalerScorePage from '@/pages/wholesaler/ScorePage'
import WholesalerListingsPage from '@/pages/wholesaler/ListingsPage'
import BidsPage from '@/pages/wholesaler/BidsPage'
import MarketplacePage from '@/pages/buyer/MarketplacePage'
import BuyerListingDetailPage from '@/pages/buyer/BuyerListingDetailPage'
import BuyerDashboardPage from '@/pages/buyer/DashboardPage'
import ContractSigningPage from '@/pages/deals/ContractSigningPage'
import TitleCompanySelectionPage from '@/pages/deals/TitleCompanySelectionPage'
import EmdInstructionsPage from '@/pages/deals/EmdInstructionsPage'
import DealTrackerPage from '@/pages/deals/DealTrackerPage'
import DealChatPage from '@/pages/deals/DealChatPage'
import PostClosingRatingPage from '@/pages/deals/PostClosingRatingPage'
import TitleRepDashboardPage from '@/pages/title/TitleRepDashboardPage'
import AdminControlCenterPage from '@/pages/admin/AdminControlCenterPage'
import AdminPenaltyLogPage from '@/pages/admin/AdminPenaltyLogPage'
import AdminChatSurveillancePage from '@/pages/admin/AdminChatSurveillancePage'
import AdminVerificationQueuePage from '@/pages/admin/AdminVerificationQueuePage'
import AdminFinancialLedgerPage from '@/pages/admin/AdminFinancialLedgerPage'
import WholesalerSidebar from '@/components/wholesaler/WholesalerSidebar'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },

  // Auth
  { path: '/login', element: <LoginPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/register/details', element: <DetailsPage /> },
  { path: '/register/verify', element: <OnboardingVerifyPage /> },
  { path: '/register/kyc', element: <KycPage /> },
  { path: '/register/bank', element: <BankPage /> },
  { path: '/register/complete', element: <CompletePage /> },

  // Wholesaler
  {
    path: '/wholesaler/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['wholesaler']}>
        <WholesalerDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/wholesaler/listings',
    element: (
      <ProtectedRoute allowedRoles={['wholesaler', 'realtor']}>
        <WholesalerListingsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/wholesaler/listings/new',
    element: (
      <ProtectedRoute allowedRoles={['wholesaler']}>
        <CreateListingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/wholesaler/listings/compliance-pending',
    element: (
      <ProtectedRoute allowedRoles={['wholesaler']}>
        <CompliancePendingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/wholesaler/listings/:listingId',
    element: (
      <ProtectedRoute allowedRoles={['wholesaler']}>
        <DraftListingDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/wholesaler/score',
    element: (
      <ProtectedRoute allowedRoles={['wholesaler', 'realtor']}>
        <WholesalerScorePage />
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
        <div className="flex min-h-screen bg-tract-alabaster font-inter">
          <WholesalerSidebar />
          <main className="ml-[240px] flex flex-1 items-center justify-center">
            <div className="text-center">
              <h1 className="mb-3 font-playfair text-4xl font-bold text-tract-green">Deal Tracker</h1>
              <p className="font-inter text-gray-500">Coming soon</p>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    ),
  },
  {
    path: '/wholesaler/settings',
    element: (
      <ProtectedRoute allowedRoles={['wholesaler', 'realtor']}>
        <div className="flex min-h-screen bg-tract-alabaster font-inter">
          <WholesalerSidebar />
          <main className="ml-[240px] flex flex-1 items-center justify-center">
            <div className="text-center">
              <h1 className="mb-3 font-playfair text-4xl font-bold text-tract-green">Settings</h1>
              <p className="font-inter text-gray-500">Coming soon</p>
            </div>
          </main>
        </div>
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
      <ProtectedRoute>
        <MarketplacePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/buyer/listings/:id',
    element: (
      <ProtectedRoute>
        <BuyerListingDetailPage />
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
      <ProtectedRoute>
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
      <ProtectedRoute allowedRoles={['buyer']}>
        <ContractSigningPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/deals/:dealId/title',
    element: (
      <ProtectedRoute allowedRoles={['buyer']}>
        <TitleCompanySelectionPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/deals/:dealId/emd',
    element: (
      <ProtectedRoute allowedRoles={['buyer']}>
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
    path: '/admin/penalty-log',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminPenaltyLogPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/chat-surveillance',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminChatSurveillancePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/verification-queue',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminVerificationQueuePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/financial-ledger',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminFinancialLedgerPage />
      </ProtectedRoute>
    ),
  },

  // Fallback
  { path: '*', element: <Navigate to="/login" replace /> },
])
