import { Link } from 'react-router-dom'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-theme-bg px-4 py-16 font-inter">
      <div className="mx-auto max-w-[800px] rounded-[12px] border border-theme-border bg-theme-card p-10 shadow-sm">
        <div className="mb-10 border-b border-theme-border pb-8">
          <p className="mb-2 font-inter text-[12px] font-bold uppercase tracking-widest text-tract-gold">TRACT INC.</p>
          <h1 className="mb-2 font-playfair text-[36px] font-bold text-theme-text">Terms of Service</h1>
          <p className="font-inter text-[14px] text-theme-muted">Effective Date: June 16, 2026</p>
        </div>

        <div className="space-y-8 font-inter text-[15px] leading-relaxed text-theme-text">
          <div>
            <h2 className="mb-6 font-playfair text-[22px] font-bold text-theme-text">Part I: Terms of Service</h2>

            <div className="mb-6">
              <h3 className="mb-3 font-inter text-[14px] font-bold uppercase tracking-wider text-theme-text">
                1. Platform Nature
              </h3>
              <p className="leading-relaxed text-theme-muted">
                TRACT Inc. (&quot;TRACT&quot;) is a technology service provider that offers a software-as-a-service (SaaS)
                platform to assist real estate professionals with workflow automation, data organization, and clearinghouse
                administrative functions. TRACT is not a licensed real estate broker, agent, or financial institution. Users
                acknowledge that TRACT provides only the digital infrastructure for information management and administrative
                processing.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="mb-3 font-inter text-[14px] font-bold uppercase tracking-wider text-theme-text">
                2. Service Fees (SaaS Subscription and Usage)
              </h3>
              <div className="space-y-4 text-theme-muted">
                <div className="rounded-[10px] border border-theme-border bg-theme-surface-2 p-4">
                  <p className="mb-1 font-bold text-theme-text">Wholesaler SaaS Technology Fee</p>
                  <p>
                    Users acting as wholesalers agree to pay a flat{' '}
                    <span className="font-bold text-tract-gold">$500.00 USD</span> SaaS technology fee per transaction
                    initiated on the platform. This fee covers access to the TRACT administrative clearinghouse tools and
                    software maintenance for that transaction.
                  </p>
                </div>
                <div className="rounded-[10px] border border-theme-border bg-theme-surface-2 p-4">
                  <p className="mb-1 font-bold text-theme-text">Platform Utilization Fee</p>
                  <p>
                    Users acting as buyers agree to pay a{' '}
                    <span className="font-bold text-tract-gold">1.5% platform utilization fee</span> based on the
                    transaction value. This fee is a subscription-based charge for the utilization of TRACT&apos;s proprietary
                    automated data processing and clearinghouse software during the transaction lifecycle. This is a technology
                    usage fee and does not constitute a commission or brokerage fee.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="mb-3 font-inter text-[14px] font-bold uppercase tracking-wider text-theme-text">3. Disclaimer</h3>
              <p className="leading-relaxed text-theme-muted">
                The fees outlined above are strictly for the use of the proprietary TRACT software and technical
                infrastructure. These fees do not constitute, and are not intended to represent, real estate commissions or
                brokerage fees, for which TRACT remains unauthorized and unlicensed.
              </p>
            </div>
          </div>

          <div className="border-t border-theme-border" />

          <div>
            <h2 className="mb-6 font-playfair text-[22px] font-bold text-theme-text">Part II: Privacy Policy</h2>
            <p className="leading-relaxed text-theme-muted">
              TRACT maintains data security in accordance with industry standards for SaaS platforms. We collect data
              necessary for platform operations, software analytics, and transaction record-keeping. We do not sell user data
              and share information only with essential third-party service providers (e.g., payment processors, hosting)
              required for the functioning of our software.
            </p>
          </div>

          <div className="rounded-[10px] border border-theme-border bg-theme-surface-2 p-6">
            <p className="mb-2 font-bold text-theme-text">Questions?</p>
            <p className="text-theme-muted">
              Contact our legal team at{' '}
              <a href="mailto:legal@tractcorp.com" className="text-tract-gold hover:underline">
                legal@tractcorp.com
              </a>
            </p>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-theme-border pt-6">
          <Link
            to="/login"
            className="font-inter text-[13px] font-bold uppercase tracking-wider text-tract-gold hover:underline"
          >
            ← Back to Sign In
          </Link>
          <p className="font-inter text-[12px] text-theme-muted">© {new Date().getFullYear()} TRACT Inc. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
