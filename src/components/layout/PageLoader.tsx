export default function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-theme-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-theme-border border-t-tract-gold" />
        <p className="font-inter text-[13px] text-theme-muted">Loading...</p>
      </div>
    </div>
  )
}
