import { Link } from 'react-router-dom'

export default function LegalPage({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-tract-alabaster px-4 py-16 font-inter">
      <div className="mx-auto max-w-[800px] rounded-[12px] border border-gray-100 bg-white p-10 shadow-sm">
        <h1 className="mb-8 font-playfair text-[32px] font-bold text-tract-obsidian">{title}</h1>
        <p className="mb-6 font-inter text-[15px] leading-relaxed text-gray-500">
          This document is being prepared by the TRACT legal team. Please check back soon or contact us at{' '}
          <a href="mailto:legal@tract.com" className="text-tract-gold hover:underline">
            legal@tract.com
          </a>
        </p>
        <Link to="/login" className="font-inter text-[13px] font-bold uppercase tracking-wider text-tract-gold hover:underline">
          ← Back to Sign In
        </Link>
      </div>
    </div>
  )
}
