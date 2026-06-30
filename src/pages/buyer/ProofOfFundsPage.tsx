import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BadgeCheck,
  CheckCircle2,
  Clock,
  FileText,
  Upload,
  XCircle,
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Sidebar from '@/components/layout/Sidebar'
import { useAuthStore } from '@/store/authStore'
import { useSubmitPof } from '@/hooks/usePof'
import { cn } from '@/lib/utils'

const DOC_TYPES = [
  {
    id: 'proof_of_funds',
    label: 'Proof of Funds',
    desc: 'Bank statement or letter showing available funds',
  },
  {
    id: 'bank_approval',
    label: 'Bank Pre-Approval Letter',
    desc: 'Lender pre-approval for the target amount',
  },
  {
    id: 'transactional_funding',
    label: 'Transactional Funding',
    desc: 'Proof of transactional funding capability',
  },
]

function PofStatusBanner({
  status,
  reason,
}: {
  status: string
  reason?: string | null
}) {
  if (status === 'approved') {
    return (
      <div className="mb-6 flex items-center gap-3 rounded-app1-card border border-app1-primary/20 bg-app1-primary/5 p-5 shadow-app1-card">
        <BadgeCheck className="h-6 w-6 shrink-0 text-app1-primary" strokeWidth={1.75} />
        <div>
          <p className="font-poppins text-[14px] font-black text-app1-primary">Proof of Funds Approved</p>
          <p className="mt-0.5 font-poppins text-[13px] text-app1-primary/80">
            You are verified to place bids on the marketplace.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'pending') {
    return (
      <div className="mb-6 flex items-center gap-3 rounded-app1-card border border-amber-200 bg-amber-50 p-5 shadow-app1-card">
        <Clock className="h-6 w-6 shrink-0 text-amber-600" strokeWidth={1.75} />
        <div>
          <p className="font-poppins text-[14px] font-black text-amber-800">Under Review</p>
          <p className="mt-0.5 font-poppins text-[13px] text-amber-700">
            Your proof of funds is being reviewed by our team. This typically takes 1-2 business days.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'rejected') {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-app1-card border border-app1-danger/20 bg-app1-danger/5 p-5 shadow-app1-card">
        <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-app1-danger" strokeWidth={1.75} />
        <div>
          <p className="font-poppins text-[14px] font-black text-app1-danger">Proof of Funds Rejected</p>
          {reason ? (
            <p className="mt-0.5 font-poppins text-[13px] text-app1-danger/80">Reason: {reason}</p>
          ) : null}
          <p className="mt-1 font-poppins text-[13px] text-app1-danger/80">Please resubmit with a valid document.</p>
        </div>
      </div>
    )
  }

  return null
}

export default function ProofOfFundsPage() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const submitPof = useSubmitPof()

  const pofStatus = user?.pofStatus ?? 'not_submitted'
  const pofReason = user?.pofRejectionReason

  const [selectedType, setSelectedType] = useState('proof_of_funds')
  const [documentUrl, setDocumentUrl] = useState('')
  const [urlError, setUrlError] = useState('')

  const handleSubmit = () => {
    setUrlError('')

    if (!documentUrl.trim()) {
      setUrlError('Please provide a document URL.')
      return
    }

    if (!documentUrl.startsWith('http')) {
      setUrlError('Please enter a valid URL starting with http.')
      return
    }

    submitPof.mutate(
      {
        documentType: selectedType,
        documentUrl: documentUrl.trim(),
      },
      {
        onSuccess: () => {
          setDocumentUrl('')
        },
      },
    )
  }

  return (
    <DashboardLayout sidebar={<Sidebar />}>
      <div className="min-h-screen bg-app1-bg-main">
        <div className="mx-auto max-w-[700px] space-y-6 p-6 md:p-10">

          <div className="mb-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-app1-text-muted">
              Buyer Workspace
            </p>
            <h1 className="mt-1 font-cinzel text-3xl font-black text-app1-primary">
              Proof of Funds
            </h1>
          </div>

          <PofStatusBanner status={pofStatus} reason={pofReason} />

          <div className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-8 shadow-app1-card">
            <div className="mb-4 flex items-center gap-3">
              <FileText className="h-6 w-6 text-app1-secondary" strokeWidth={1.75} />
              <h2 className="font-cinzel text-[22px] font-black text-app1-primary">Proof of Funds Required</h2>
            </div>
            <p className="mb-4 font-poppins text-[14px] leading-relaxed text-app1-text-muted">
              To maintain a secure marketplace and protect sellers, buyers must provide verified proof of funds,
              transactional funding capability, or a bank pre-approval letter before placing binding offers on active
              contracts.
            </p>
            <div className="space-y-2">
              {[
                'Accepted by all verified sellers',
                'Required before your first bid',
                'Reviewed within 1-2 business days',
                'Valid for 12 months after approval',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-app1-primary" strokeWidth={1.75} />
                  <span className="font-poppins text-[13px] text-app1-text-muted">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {pofStatus !== 'approved' ? (
            <div className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-8 shadow-app1-card">
              <h2 className="mb-6 font-cinzel text-[22px] font-black text-app1-primary">
                {pofStatus === 'pending' || pofStatus === 'rejected' ? 'Resubmit Document' : 'Submit Document'}
              </h2>

              <div className="mb-6">
                <label className="mb-3 block font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted">
                  Document Type
                </label>
                <div className="space-y-2">
                  {DOC_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedType(type.id)}
                      className={cn(
                        'w-full rounded-xl border p-4 text-left transition-colors',
                        selectedType === type.id
                          ? 'border-app1-secondary bg-app1-secondary/5'
                          : 'border-app1-border-light bg-app1-bg-soft hover:border-app1-secondary/50',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2',
                            selectedType === type.id ? 'border-app1-secondary' : 'border-app1-border-light',
                          )}
                        >
                          {selectedType === type.id ? (
                            <div className="h-2 w-2 rounded-full bg-app1-secondary" />
                          ) : null}
                        </div>
                        <div>
                          <p className="font-poppins text-[14px] font-black text-app1-text-main">{type.label}</p>
                          <p className="mt-0.5 font-poppins text-[12px] text-app1-text-muted">{type.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="doc-url"
                  className="mb-2 block font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted"
                >
                  Document URL
                </label>
                <input
                  id="doc-url"
                  type="url"
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full rounded-lg border border-app1-border-light bg-app1-bg-soft px-4 py-3 font-poppins text-[14px] text-app1-text-main outline-none transition-colors placeholder:text-app1-text-muted focus:border-app1-secondary focus:ring-2 focus:ring-app1-secondary/30"
                />
                {urlError ? (
                  <p className="mt-1 font-poppins text-[12px] text-app1-danger">{urlError}</p>
                ) : null}
                <p className="mt-2 font-poppins text-[11px] text-app1-text-muted">
                  Share a secure link to your document (Google Drive, Dropbox, etc.) with view access enabled.
                </p>
              </div>

              <button
                type="button"
                disabled={submitPof.isPending}
                onClick={handleSubmit}
                className="flex items-center gap-2 bg-app1-secondary px-8 py-3 font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-primary-dark transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
              >
                <Upload className="h-4 w-4" />
                {submitPof.isPending ? 'Submitting...' : 'Submit Proof of Funds'}
              </button>
            </div>
          ) : null}

          {pofStatus === 'approved' ? (
            <button
              type="button"
              onClick={() => navigate('/buyer/marketplace')}
              className="w-full bg-app1-secondary py-4 font-poppins text-[12px] font-black uppercase tracking-[0.16em] text-app1-primary-dark transition-all hover:scale-[1.01]"
            >
              Browse Marketplace →
            </button>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  )
}
