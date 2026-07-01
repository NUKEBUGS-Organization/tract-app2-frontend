import { Link } from 'react-router-dom'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-app1-bg-main px-4 py-16 font-poppins">
      <div className="mx-auto max-w-[800px] rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card md:p-10">
        <div className="mb-10 border-b border-app1-border-light pb-8">
          <p className="mb-2 font-poppins text-[12px] font-bold uppercase tracking-widest text-app1-secondary">TRACT INC.</p>
          <h1 className="mb-2 font-cinzel text-[26px] font-black text-app1-primary md:text-[36px]">Privacy Policy</h1>
          <p className="font-poppins text-[14px] text-app1-text-muted">Effective Date: June 16, 2026</p>
        </div>

        <div className="space-y-8 font-poppins text-[15px] leading-relaxed text-app1-text-main">
          <div>
            <h3 className="mb-3 font-poppins text-[14px] font-bold uppercase tracking-wider text-app1-text-main">Data Collection</h3>
            <p className="leading-relaxed text-app1-text-muted">
              TRACT collects data necessary for platform operations, software analytics, and transaction record-keeping. This
              includes account information, transaction data, and platform usage analytics required for the functioning of our
              software.
            </p>
          </div>

          <div>
            <h3 className="mb-3 font-poppins text-[14px] font-bold uppercase tracking-wider text-app1-text-main">Data Security</h3>
            <p className="leading-relaxed text-app1-text-muted">
              TRACT maintains data security in accordance with industry standards for SaaS platforms. We implement appropriate
              technical and organizational measures to protect your personal information against unauthorized access, alteration,
              disclosure, or destruction.
            </p>
          </div>

          <div>
            <h3 className="mb-3 font-poppins text-[14px] font-bold uppercase tracking-wider text-app1-text-main">Data Sharing</h3>
            <p className="leading-relaxed text-app1-text-muted">
              We do not sell user data. We share information only with essential third-party service providers (e.g., payment
              processors, hosting services) required for the functioning of our software. All third-party providers are
              contractually bound to maintain the confidentiality and security of your data.
            </p>
          </div>

          <div>
            <h3 className="mb-3 font-poppins text-[14px] font-bold uppercase tracking-wider text-app1-text-main">Your Rights</h3>
            <p className="leading-relaxed text-app1-text-muted">
              You have the right to access, correct, or request deletion of your personal data at any time. To exercise these
              rights, contact our legal team at{' '}
              <a href="mailto:legal@tractcorp.com" className="text-app1-secondary hover:underline">
                legal@tractcorp.com
              </a>
            </p>
          </div>

          <div>
            <h3 className="mb-3 font-poppins text-[14px] font-bold uppercase tracking-wider text-app1-text-main">Platform Nature</h3>
            <p className="leading-relaxed text-app1-text-muted">
              TRACT is a technology service provider offering a SaaS platform for real estate workflow automation. TRACT is not
              a licensed real estate broker, agent, or financial institution.
            </p>
          </div>

          <div className="rounded-[10px] border border-app1-border-light bg-app1-bg-soft p-6">
            <p className="mb-2 font-bold text-app1-text-main">Confidentiality</p>
            <p className="text-app1-text-muted">
              All platform interactions are governed by our Mutual Non-Disclosure Agreement. Confidential information shared on
              the platform is protected for a period of two (2) years from the date of disclosure per our NDA terms signed with
              TRACT Inc.
            </p>
          </div>

          <div className="rounded-[10px] border border-app1-border-light bg-app1-bg-soft p-6">
            <p className="mb-2 font-bold text-app1-text-main">Contact</p>
            <p className="text-app1-text-muted">
              For privacy-related questions contact:{' '}
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
