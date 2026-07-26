const LEGAL_LINKS = [
  { label: 'Terms of Service', href: '/legal/terms' },
  { label: 'Privacy Policy', href: '/legal/privacy' },
  { label: 'NDA', href: '/legal/nda' },
  { label: 'Legal Notices', href: '/legal/terms' },
] as const

export default function DashboardFooter() {
  return (
    <footer className="mt-auto border-t border-app1-border-light bg-app1-bg-soft">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row md:px-12">
        <div>
          <span className="font-cinzel text-[20px] font-black text-app1-primary">TRACT</span>
          <p className="mt-2 font-poppins text-sm text-app1-text-muted">
            © {new Date().getFullYear()} TRACT Private Marketplace. All rights reserved.
          </p>
        </div>
        <nav className="flex flex-wrap justify-center gap-6">
          {LEGAL_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="font-poppins text-sm text-app1-text-muted transition-colors hover:text-app1-text-main"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
