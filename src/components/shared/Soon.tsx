/** Lightweight placeholder for routes not built yet. */
export default function Soon({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-theme-bg px-6 font-inter text-theme-text transition-colors duration-200">
      <p className="text-center font-inter text-[15px] text-gray-600">{label}</p>
    </div>
  )
}
