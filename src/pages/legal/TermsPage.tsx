import { Link } from 'react-router-dom'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-app1-bg-main px-4 py-16 font-poppins">
      <div className="mx-auto max-w-[800px] rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card md:p-10">
        <div className="mb-10 border-b border-app1-border-light pb-8">
          <p className="mb-2 font-poppins text-[12px] font-bold uppercase tracking-widest text-app1-secondary">TRACT INC.</p>
          <h1 className="mb-2 font-cinzel text-[26px] font-black text-app1-primary md:text-[36px]">Terms of Service</h1>
          <p className="font-poppins text-[14px] text-app1-text-muted">Effective Date: June 16, 2026</p>
        </div>

        <div className="space-y-8 font-poppins text-[15px] leading-relaxed text-app1-text-main">
          <div>
            <h2 className="mb-6 font-cinzel text-[22px] font-black text-app1-primary">Part I: Terms of Service</h2>

            <div className="mb-6">
              <h3 className="mb-3 font-poppins text-[14px] font-bold uppercase tracking-wider text-app1-text-main">
                1. Platform Nature
              </h3>
              <p className="leading-relaxed text-app1-text-muted">
                TRACT Inc. (&quot;TRACT&quot;) is a technology service provider that offers a software-as-a-service (SaaS)
                platform to assist real estate professionals with workflow automation, data organization, and clearinghouse
                administrative functions. TRACT is not a licensed real estate broker, agent, or financial institution. Users
                acknowledge that TRACT provides only the digital infrastructure for information management and administrative
                processing.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="mb-3 font-poppins text-[14px] font-bold uppercase tracking-wider text-app1-text-main">
                2. Service Fees (SaaS Subscription and Usage)
              </h3>
              <div className="space-y-4 text-app1-text-muted">
                <div className="rounded-[10px] border border-app1-border-light bg-app1-bg-soft p-4">
                  <p className="mb-1 font-bold text-app1-text-main">Wholesaler SaaS Technology Fee</p>
                  <p>
                    Users acting as wholesalers agree to pay a flat{' '}
                    <span className="font-bold text-app1-secondary">$500.00 USD</span> SaaS technology fee per transaction
                    initiated on the platform. This fee covers access to the TRACT administrative clearinghouse tools and
                    software maintenance for that transaction.
                  </p>
                </div>
                <div className="rounded-[10px] border border-app1-border-light bg-app1-bg-soft p-4">
                  <p className="mb-1 font-bold text-app1-text-main">Platform Utilization Fee</p>
                  <p>
                    Users acting as buyers agree to pay a{' '}
                    <span className="font-bold text-app1-secondary">1.5% platform utilization fee</span> based on the
                    transaction value. This fee is a subscription-based charge for the utilization of TRACT&apos;s proprietary
                    automated data processing and clearinghouse software during the transaction lifecycle. This is a technology
                    usage fee and does not constitute a commission or brokerage fee.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="mb-3 font-poppins text-[14px] font-bold uppercase tracking-wider text-app1-text-main">3. Disclaimer</h3>
              <p className="leading-relaxed text-app1-text-muted">
                The fees outlined above are strictly for the use of the proprietary TRACT software and technical
                infrastructure. These fees do not constitute, and are not intended to represent, real estate commissions or
                brokerage fees, for which TRACT remains unauthorized and unlicensed.
              </p>
            </div>
          </div>

          <div className="border-t border-app1-border-light" />

          <div>
            <h2 className="mb-6 font-cinzel text-[22px] font-black text-app1-primary">Part II: Privacy Policy</h2>
            <p className="leading-relaxed text-app1-text-muted">
              TRACT maintains data security in accordance with industry standards for SaaS platforms. We collect data
              necessary for platform operations, software analytics, and transaction record-keeping. We do not sell user data
              and share information only with essential third-party service providers (e.g., payment processors, hosting)
              required for the functioning of our software.
            </p>
          </div>

          <div className="rounded-[10px] border border-app1-border-light bg-app1-bg-soft p-6">
            <p className="mb-2 font-bold text-app1-text-main">Questions?</p>
            <p className="text-app1-text-muted">
              Contact our legal team at{' '}
              <a href="mailto:legal@tractcorp.com" className="text-app1-secondary hover:underline">
                legal@tractcorp.com
              </a>
            </p>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-app1-border-light pt-6">
          <Link
            to="/login"
            className="font-poppins text-[13px] font-bold uppercase tracking-wider text-app1-secondary hover:underline"
          >
            ← Back to Sign In
          </Link>
          <p className="font-poppins text-[12px] text-app1-text-muted">© {new Date().getFullYear()} TRACT Inc. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
