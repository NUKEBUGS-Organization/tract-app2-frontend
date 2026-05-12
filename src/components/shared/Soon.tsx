/** Lightweight placeholder for routes not built yet. */
export default function Soon({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-tract-alabaster px-6 font-inter text-tract-obsidian">
      <p className="text-center font-inter text-[15px] text-gray-600">{label}</p>
    </div>
  )
}
