import { useRef, useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { DEFAULT_AVATAR_IMAGE } from '@/lib/placeholders'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import type { User } from '@/types'

type Props = {
  size?: 'md' | 'lg'
  className?: string
}

export default function AvatarUploader({ size = 'lg', className }: Props) {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const px = size === 'lg' ? 'h-16 w-16 text-[28px]' : 'h-9 w-9 text-sm'
  const src = user?.avatarUrl?.trim() || DEFAULT_AVATAR_IMAGE
  const initial = (user?.fullName?.trim()?.[0] ?? 'U').toUpperCase()

  const onPick = async (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Choose an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be 5MB or smaller.')
      return
    }

    const form = new FormData()
    form.append('file', file)

    setUploading(true)
    try {
      const res = await api.post('/users/me/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const next = res.data?.data as User | undefined
      if (next) setUser({ ...user!, ...next })
      toast.success('Profile photo updated.')
    } catch {
      toast.error('Failed to upload photo.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className={cn('relative shrink-0', className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label="Upload profile photo"
        className={cn(
          'group relative overflow-hidden rounded-full border border-app1-border-light bg-app1-primary font-cinzel font-black text-white',
          px,
        )}
      >
        {user?.avatarUrl ? (
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center">{initial}</span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          ) : (
            <Camera className="h-5 w-5 text-white" strokeWidth={1.75} />
          )}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => void onPick(e.target.files?.[0])}
      />
    </div>
  )
}
