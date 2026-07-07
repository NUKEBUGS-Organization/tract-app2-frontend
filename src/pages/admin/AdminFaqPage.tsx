import { useState } from 'react'
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import AdminSidebar from '@/components/admin/AdminSidebar'
import PageHeader from '@/components/app1/PageHeader'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { FAQ_CATEGORIES } from '@/lib/constants/faqCategories'
import {
  useAdminFaq,
  useCreateFaq,
  useDeleteFaq,
  useUpdateFaq,
  type CreateFaqInput,
} from '@/hooks/useAdminFaq'
import type { FaqItem } from '@/hooks/useFaq'
import { cn } from '@/lib/utils'

const emptyForm: CreateFaqInput = {
  question: '',
  answer: '',
  category: FAQ_CATEGORIES[0],
  order: 0,
  isPublished: false,
}

function FaqFormFields({
  values,
  onChange,
  idPrefix,
}: {
  values: CreateFaqInput
  onChange: (next: CreateFaqInput) => void
  idPrefix: string
}) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={`${idPrefix}-question`} className="mb-1 block font-poppins text-[12px] font-bold uppercase tracking-wider text-app1-text-muted">
          Question
        </label>
        <Input
          id={`${idPrefix}-question`}
          value={values.question}
          onChange={(e) => onChange({ ...values, question: e.target.value })}
          className="font-poppins"
        />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-answer`} className="mb-1 block font-poppins text-[12px] font-bold uppercase tracking-wider text-app1-text-muted">
          Answer
        </label>
        <textarea
          id={`${idPrefix}-answer`}
          value={values.answer}
          onChange={(e) => onChange({ ...values, answer: e.target.value })}
          rows={5}
          className="w-full rounded-md border border-app1-border-light bg-app1-bg-card px-3 py-2 font-poppins text-[14px] text-app1-text-main focus:outline-none focus:ring-2 focus:ring-app1-secondary"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${idPrefix}-category`} className="mb-1 block font-poppins text-[12px] font-bold uppercase tracking-wider text-app1-text-muted">
            Category
          </label>
          <select
            id={`${idPrefix}-category`}
            value={values.category}
            onChange={(e) => onChange({ ...values, category: e.target.value })}
            className="w-full rounded-md border border-app1-border-light bg-app1-bg-card px-3 py-2 font-poppins text-[14px] text-app1-text-main focus:outline-none focus:ring-2 focus:ring-app1-secondary"
          >
            {FAQ_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${idPrefix}-order`} className="mb-1 block font-poppins text-[12px] font-bold uppercase tracking-wider text-app1-text-muted">
            Order
          </label>
          <Input
            id={`${idPrefix}-order`}
            type="number"
            min={0}
            value={values.order ?? 0}
            onChange={(e) => onChange({ ...values, order: Number(e.target.value) })}
            className="font-poppins"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Switch
          id={`${idPrefix}-published`}
          checked={values.isPublished ?? false}
          onCheckedChange={(checked) => onChange({ ...values, isPublished: checked })}
        />
        <label htmlFor={`${idPrefix}-published`} className="font-poppins text-[14px] text-app1-text-main">
          Published
        </label>
      </div>
    </div>
  )
}

export default function AdminFaqPage() {
  const { data: items = [], isLoading } = useAdminFaq()
  const createFaq = useCreateFaq()
  const updateFaq = useUpdateFaq()
  const deleteFaq = useDeleteFaq()

  const [createForm, setCreateForm] = useState<CreateFaqInput>(emptyForm)
  const [editing, setEditing] = useState<FaqItem | null>(null)
  const [editForm, setEditForm] = useState<CreateFaqInput>(emptyForm)

  const openEdit = (item: FaqItem) => {
    setEditing(item)
    setEditForm({
      question: item.question,
      answer: item.answer,
      category: item.category,
      order: item.order,
      isPublished: item.isPublished,
    })
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createForm.question.trim() || !createForm.answer.trim()) return
    await createFaq.mutateAsync(createForm)
    setCreateForm(emptyForm)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    await updateFaq.mutateAsync({ id: editing.id, ...editForm })
    setEditing(null)
  }

  const handleDelete = async (item: FaqItem) => {
    if (!window.confirm(`Delete FAQ entry "${item.question}"?`)) return
    await deleteFaq.mutateAsync(item.id)
  }

  return (
    <DashboardLayout sidebar={<AdminSidebar />} className="bg-app1-bg-main font-poppins text-app1-text-main">
      <div className="min-h-screen">
        <div className="mx-auto max-w-[1440px] space-y-6 p-6 md:p-10">
          <PageHeader eyebrow="Admin Workspace" title="FAQ Management" />

          <form
            onSubmit={handleCreate}
            className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card"
          >
            <div className="mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-app1-secondary" />
              <h2 className="font-cinzel text-lg font-black text-app1-primary">Create FAQ Entry</h2>
            </div>
            <FaqFormFields values={createForm} onChange={setCreateForm} idPrefix="create" />
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={createFaq.isPending}
                className="rounded-[8px] bg-app1-secondary px-5 py-2.5 font-poppins text-[13px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {createFaq.isPending ? 'Creating…' : 'Create Entry'}
              </button>
            </div>
          </form>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-app1-secondary" />
            </div>
          ) : (
            <div className="overflow-hidden rounded-app1-card border border-app1-border-light bg-app1-bg-card shadow-app1-card">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-app1-border-light bg-app1-bg-soft">
                      {['Question', 'Category', 'Order', 'Published', 'Actions'].map((h) => (
                        <th
                          key={h}
                          className={cn(
                            'px-6 py-4 font-poppins text-[11px] font-bold uppercase tracking-wider text-app1-text-muted',
                            h === 'Actions' && 'text-right',
                          )}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-app1-border-light">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center font-poppins text-app1-text-muted">
                          No FAQ entries yet.
                        </td>
                      </tr>
                    ) : (
                      items.map((item) => (
                        <tr key={item.id} className="transition-colors hover:bg-app1-bg-soft">
                          <td className="max-w-xs px-6 py-4 font-poppins text-[14px] font-bold text-app1-text-main">
                            {item.question}
                          </td>
                          <td className="px-6 py-4 font-poppins text-[13px] text-app1-text-muted">{item.category}</td>
                          <td className="px-6 py-4 font-poppins text-[13px] text-app1-text-muted">{item.order}</td>
                          <td className="px-6 py-4">
                            <span
                              className={cn(
                                'rounded-full px-3 py-1 font-poppins text-xs font-bold',
                                item.isPublished
                                  ? 'border border-emerald-700/20 bg-emerald-50 text-emerald-800'
                                  : 'bg-app1-bg-soft text-app1-text-muted',
                              )}
                            >
                              {item.isPublished ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="space-x-2 px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => openEdit(item)}
                              className="inline-flex items-center gap-1 rounded-[8px] border border-app1-border-light px-3 py-1.5 font-poppins text-[12px] font-bold text-app1-text-main hover:bg-app1-bg-soft"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </button>
                            <button
                              type="button"
                              disabled={deleteFaq.isPending}
                              onClick={() => handleDelete(item)}
                              className="inline-flex items-center gap-1 rounded-[8px] border border-red-200 px-3 py-1.5 font-poppins text-[12px] font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-app1-border-light bg-app1-bg-card sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-cinzel text-app1-primary">Edit FAQ Entry</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <FaqFormFields values={editForm} onChange={setEditForm} idPrefix="edit" />
            <DialogFooter className="mt-6 gap-2 sm:gap-0">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-[8px] border border-app1-border-light px-4 py-2 font-poppins text-[13px] font-bold text-app1-text-muted hover:bg-app1-bg-soft"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateFaq.isPending}
                className="rounded-[8px] bg-app1-secondary px-5 py-2 font-poppins text-[13px] font-bold text-white hover:opacity-90 disabled:opacity-50"
              >
                {updateFaq.isPending ? 'Saving…' : 'Save Changes'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
