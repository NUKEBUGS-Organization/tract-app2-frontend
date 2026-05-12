import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function getRelativeTime(date: string | Date): string {
  const now  = Date.now()
  const then = new Date(date).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  const hrs  = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hrs  < 24) return `${hrs}h ago`
  return `${days}d ago`
}

export function getScoreColor(score: number): string {
  if (score >= 70) return '#2D5016'  // tract-green
  if (score >= 40) return '#E67E22'  // tract-orange
  return '#C0392B'                   // tract-red
}

export function getScoreLabel(score: number): string {
  if (score >= 70) return 'Excellent'
  if (score >= 50) return 'Good'
  if (score >= 40) return 'At Risk'
  return 'Critical'
}
