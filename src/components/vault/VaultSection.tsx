import { useState } from 'react'
import { Download, FileText, Loader2, Plus, Trash2, Upload, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import {
  useVaultDocs,
  useUploadVaultDoc,
  useDeleteVaultDoc,
  type VaultDoc,
} from '@/hooks/useVault'
import { cn } from '@/lib/utils'

const FILE_TYPES = [
  { id: 'document', label: 'Document' },
  { id: 'inspection', label: 'Inspection Report' },
  { id: 'contract', label: 'Contract' },
  { id: 'disclosure', label: 'Disclosure' },
  { id: 'title', label: 'Title Document' },
  { id: 'other', label: 'Other' },
]

function UploadForm({ dealId, onClose }: { dealId: string; onClose: () => void }) {
  const upload = useUploadVaultDoc(dealId)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [type, setType] = useState('document')
  const [err, setErr] = useState('')

  const handleSubmit = () => {
    setErr('')
    if (!name.trim()) {
      setErr('File name is required.')
      return
    }
    if (!url.trim() || !url.startsWith('http')) {
      setErr('Valid URL is required.')
      return
    }

    upload.mutate(
      { fileName: name.trim(), fileUrl: url.trim(), fileType: type },
      { onSuccess: onClose },
    )
  }

  return (
    <div className="rounded-[12px] border border-tract-gold/30 bg-tract-gold/5 p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-inter text-[14px] font-bold text-theme-text">Upload Document</h4>
        <button
          type="button"
          onClick={onClose}
          className="text-theme-muted hover:text-theme-text"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Document name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-[8px] border border-theme-border bg-theme-input px-3 py-2.5 font-inter text-[13px] text-theme-text outline-none placeholder:text-theme-muted focus:border-tract-gold"
        />

        <input
          type="url"
          placeholder="https://drive.google.com/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full rounded-[8px] border border-theme-border bg-theme-input px-3 py-2.5 font-inter text-[13px] text-theme-text outline-none placeholder:text-theme-muted focus:border-tract-gold"
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full rounded-[8px] border border-theme-border bg-theme-input px-3 py-2.5 font-inter text-[13px] text-theme-text outline-none focus:border-tract-gold"
        >
          {FILE_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>

        {err && <p className="font-inter text-[12px] text-tract-red">{err}</p>}

        <button
          type="button"
          disabled={upload.isPending}
          onClick={handleSubmit}
          className="flex items-center gap-2 bg-tract-gold px-4 py-2.5 font-inter text-[12px] font-bold uppercase tracking-wider text-white hover:bg-yellow-600 disabled:opacity-50 transition-colors w-full justify-center"
        >
          {upload.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {upload.isPending ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  )
}

function DocRow({
  doc,
  dealId,
  currentUserId,
  currentRole,
}: {
  doc: VaultDoc
  dealId: string
  currentUserId: string
  currentRole: string
}) {
  const deleteDoc = useDeleteVaultDoc(dealId)
  const canDelete = doc.uploadedBy._id === currentUserId || currentRole === 'admin'

  const typeLabel = FILE_TYPES.find((t) => t.id === doc.fileType)?.label ?? doc.fileType

  return (
    <div className="flex items-center justify-between gap-3 rounded-[8px] border border-theme-border bg-theme-surface-2 p-3 hover:bg-theme-card transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <FileText className="h-5 w-5 shrink-0 text-tract-gold" strokeWidth={1.75} />
        <div className="min-w-0">
          <p className="font-inter text-[13px] font-bold text-theme-text truncate">{doc.fileName}</p>
          <p className="font-inter text-[11px] text-theme-muted mt-0.5">
            {typeLabel} · {doc.uploadedBy.fullName} ·{' '}
            {new Date(doc.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <a
          href={doc.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-theme-border text-tract-gold hover:bg-tract-gold/10 transition-colors"
          aria-label="Download"
        >
          <Download className="h-4 w-4" />
        </a>

        {canDelete && (
          <button
            type="button"
            disabled={deleteDoc.isPending}
            onClick={() => deleteDoc.mutate(doc._id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-theme-border text-tract-red hover:bg-tract-red-light disabled:opacity-50 transition-colors"
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export default function VaultSection({ dealId }: { dealId: string }) {
  const user = useAuthStore((s) => s.user)
  const { data: docs = [], isLoading } = useVaultDocs(dealId)
  const [showUpload, setShowUpload] = useState(false)

  return (
    <div className="rounded-lg border border-theme-border bg-theme-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-inter text-xs font-bold uppercase tracking-wider text-theme-muted">
          Secure Vault
        </h3>
        <button
          type="button"
          onClick={() => setShowUpload((s) => !s)}
          className={cn(
            'flex items-center gap-1.5',
            'font-inter text-[12px] font-bold',
            'uppercase tracking-wider',
            'transition-colors',
            showUpload ? 'text-theme-muted' : 'text-tract-gold hover:underline',
          )}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Document
        </button>
      </div>

      {showUpload && <UploadForm dealId={dealId} onClose={() => setShowUpload(false)} />}

      {isLoading && (
        <div className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-tract-gold" />
        </div>
      )}

      {!isLoading && docs.length === 0 && !showUpload && (
        <div className="py-6 text-center">
          <FileText className="h-10 w-10 text-theme-muted mx-auto mb-2" strokeWidth={1} />
          <p className="font-inter text-[13px] text-theme-muted">No documents yet.</p>
          <p className="font-inter text-[11px] text-theme-muted mt-1">
            Upload inspection reports, disclosures, and closing docs here.
          </p>
        </div>
      )}

      {!isLoading && docs.length > 0 && (
        <div className="space-y-2">
          {docs.map((doc) => (
            <DocRow
              key={doc._id}
              doc={doc}
              dealId={dealId}
              currentUserId={(user as { _id?: string; id?: string })?._id ?? (user as { id?: string })?.id ?? ''}
              currentRole={user?.role ?? ''}
            />
          ))}
        </div>
      )}
    </div>
  )
}
