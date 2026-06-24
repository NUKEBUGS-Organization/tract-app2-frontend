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
import TopBar from '@/components/layout/TopBar'
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
      <div className="mb-6 flex items-center gap-3 rounded-[12px] border border-tract-green/20 bg-tract-green-light p-5">
        <BadgeCheck className="h-6 w-6 shrink-0 text-tract-green" strokeWidth={1.75} />
        <div>
          <p className="font-inter text-[14px] font-bold text-tract-green">Proof of Funds Approved</p>
          <p className="mt-0.5 font-inter text-[13px] text-tract-green/80">
            You are verified to place bids on the marketplace.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'pending') {
    return (
      <div className="mb-6 flex items-center gap-3 rounded-[12px] border border-amber-200 bg-amber-50 p-5">
        <Clock className="h-6 w-6 shrink-0 text-amber-600" strokeWidth={1.75} />
        <div>
          <p className="font-inter text-[14px] font-bold text-amber-800">Under Review</p>
          <p className="mt-0.5 font-inter text-[13px] text-amber-700">
            Your proof of funds is being reviewed by our team. This typically takes 1-2 business days.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'rejected') {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-[12px] border border-tract-red/20 bg-tract-red-light p-5">
        <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-tract-red" strokeWidth={1.75} />
        <div>
          <p className="font-inter text-[14px] font-bold text-tract-red">Proof of Funds Rejected</p>
          {reason ? (
            <p className="mt-0.5 font-inter text-[13px] text-tract-red/80">Reason: {reason}</p>
          ) : null}
          <p className="mt-1 font-inter text-[13px] text-tract-red/80">Please resubmit with a valid document.</p>
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
      <div className="min-h-screen bg-theme-bg">
        <TopBar title="Proof of Funds" />

        <div className="mx-auto max-w-[700px] space-y-6 p-6 md:p-10">
          <PofStatusBanner status={pofStatus} reason={pofReason} />

          <div className="rounded-[12px] border border-theme-border bg-theme-card p-8 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <FileText className="h-6 w-6 text-tract-gold" strokeWidth={1.75} />
              <h2 className="font-playfair text-[22px] font-bold text-theme-text">Proof of Funds Required</h2>
            </div>
            <p className="mb-4 font-inter text-[14px] leading-relaxed text-theme-muted">
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
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-tract-green" strokeWidth={1.75} />
                  <span className="font-inter text-[13px] text-theme-muted">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {pofStatus !== 'approved' ? (
            <div className="rounded-[12px] border border-theme-border bg-theme-card p-8 shadow-sm">
              <h2 className="mb-6 font-playfair text-[22px] font-bold text-theme-text">
                {pofStatus === 'pending' || pofStatus === 'rejected' ? 'Resubmit Document' : 'Submit Document'}
              </h2>

              <div className="mb-6">
                <label className="mb-3 block font-inter text-[12px] font-bold uppercase tracking-wider text-theme-muted">
                  Document Type
                </label>
                <div className="space-y-2">
                  {DOC_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedType(type.id)}
                      className={cn(
                        'w-full rounded-[10px] border p-4 text-left transition-colors',
                        selectedType === type.id
                          ? 'border-tract-gold bg-tract-gold/5'
                          : 'border-theme-border bg-theme-surface-2 hover:border-tract-gold/50',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2',
                            selectedType === type.id ? 'border-tract-gold' : 'border-theme-border',
                          )}
                        >
                          {selectedType === type.id ? (
                            <div className="h-2 w-2 rounded-full bg-tract-gold" />
                          ) : null}
                        </div>
                        <div>
                          <p className="font-inter text-[14px] font-bold text-theme-text">{type.label}</p>
                          <p className="mt-0.5 font-inter text-[12px] text-theme-muted">{type.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="doc-url"
                  className="mb-2 block font-inter text-[12px] font-bold uppercase tracking-wider text-theme-muted"
                >
                  Document URL
                </label>
                <input
                  id="doc-url"
                  type="url"
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full rounded-[8px] border border-theme-border bg-theme-input px-4 py-3 font-inter text-[14px] text-theme-text outline-none transition-colors placeholder:text-theme-muted focus:border-tract-gold focus:ring-1 focus:ring-tract-gold"
                />
                {urlError ? (
                  <p className="mt-1 font-inter text-[12px] text-tract-red">{urlError}</p>
                ) : null}
                <p className="mt-2 font-inter text-[11px] text-theme-muted">
                  Share a secure link to your document (Google Drive, Dropbox, etc.) with view access enabled.
                </p>
              </div>

              <button
                type="button"
                disabled={submitPof.isPending}
                onClick={handleSubmit}
                className="flex items-center gap-2 bg-tract-gold px-8 py-3 font-inter text-[12px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-yellow-600 disabled:opacity-50"
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
              className="w-full bg-tract-gold py-4 font-inter text-[13px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-yellow-600"
            >
              Browse Marketplace →
            </button>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  )
}
