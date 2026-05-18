import Sidebar from '@/components/layout/Sidebar'
import KycVerificationPanel from '@/components/kyc/KycVerificationPanel'

export default function BuyerProfilePage() {
  return (
    <div className="flex min-h-screen bg-tract-alabaster font-inter">
      <Sidebar />
      <main className="ml-64 flex flex-1 flex-col gap-10 p-10">
        <div>
          <h1 className="font-playfair text-4xl font-bold text-tract-green">Profile & Score</h1>
          <p className="mt-2 font-inter text-sm text-gray-500">Verification and reliability (scores coming soon).</p>
        </div>
        <KycVerificationPanel variant="settings" className="max-w-3xl" />
      </main>
    </div>
  )
}
