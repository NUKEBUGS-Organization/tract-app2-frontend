import { Link } from 'react-router-dom'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-theme-bg px-4 py-16 font-inter">
      <div className="mx-auto max-w-[800px] rounded-[12px] border border-theme-border bg-theme-card p-6 shadow-sm md:p-10">
        <div className="mb-10 border-b border-theme-border pb-8">
          <p className="mb-2 font-inter text-[12px] font-bold uppercase tracking-widest text-tract-gold">TRACT INC.</p>
          <h1 className="mb-2 font-playfair text-[26px] font-bold text-theme-text md:text-[36px]">Privacy Policy</h1>
          <p className="font-inter text-[14px] text-theme-muted">Effective Date: June 16, 2026</p>
        </div>

        <div className="space-y-8 font-inter text-[15px] leading-relaxed text-theme-text">
          <div>
            <h3 className="mb-3 font-inter text-[14px] font-bold uppercase tracking-wider text-theme-text">Data Collection</h3>
            <p className="leading-relaxed text-theme-muted">
              TRACT collects data necessary for platform operations, software analytics, and transaction record-keeping. This
              includes account information, transaction data, and platform usage analytics required for the functioning of our
              software.
            </p>
          </div>

          <div>
            <h3 className="mb-3 font-inter text-[14px] font-bold uppercase tracking-wider text-theme-text">Data Security</h3>
            <p className="leading-relaxed text-theme-muted">
              TRACT maintains data security in accordance with industry standards for SaaS platforms. We implement appropriate
              technical and organizational measures to protect your personal information against unauthorized access, alteration,
              disclosure, or destruction.
            </p>
          </div>

          <div>
            <h3 className="mb-3 font-inter text-[14px] font-bold uppercase tracking-wider text-theme-text">Data Sharing</h3>
            <p className="leading-relaxed text-theme-muted">
              We do not sell user data. We share information only with essential third-party service providers (e.g., payment
              processors, hosting services) required for the functioning of our software. All third-party providers are
              contractually bound to maintain the confidentiality and security of your data.
            </p>
          </div>

          <div>
            <h3 className="mb-3 font-inter text-[14px] font-bold uppercase tracking-wider text-theme-text">Your Rights</h3>
            <p className="leading-relaxed text-theme-muted">
              You have the right to access, correct, or request deletion of your personal data at any time. To exercise these
              rights, contact our legal team at{' '}
              <a href="mailto:legal@tractcorp.com" className="text-tract-gold hover:underline">
                legal@tractcorp.com
              </a>
            </p>
          </div>

          <div>
            <h3 className="mb-3 font-inter text-[14px] font-bold uppercase tracking-wider text-theme-text">Platform Nature</h3>
            <p className="leading-relaxed text-theme-muted">
              TRACT is a technology service provider offering a SaaS platform for real estate workflow automation. TRACT is not
              a licensed real estate broker, agent, or financial institution.
            </p>
          </div>

          <div className="rounded-[10px] border border-theme-border bg-theme-surface-2 p-6">
            <p className="mb-2 font-bold text-theme-text">Confidentiality</p>
            <p className="text-theme-muted">
              All platform interactions are governed by our Mutual Non-Disclosure Agreement. Confidential information shared on
              the platform is protected for a period of two (2) years from the date of disclosure per our NDA terms signed with
              TRACT Inc.
            </p>
          </div>

          <div className="rounded-[10px] border border-theme-border bg-theme-surface-2 p-6">
            <p className="mb-2 font-bold text-theme-text">Contact</p>
            <p className="text-theme-muted">
              For privacy-related questions contact:{' '}
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
