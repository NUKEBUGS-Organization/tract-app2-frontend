import { Link } from 'react-router-dom'

const sections = [
  ['1. 60-Day Beta Period & System Updates', [
    'You acknowledge that the Platform is entering a 60-day introductory launch phase (the Beta Period). The beta launch date has not yet been specified.',
    'Frequent Updates: During this 60-day window, the Platform will undergo continuous development, maintenance, and frequent software updates. You may experience temporary interruptions or changes in user interface as we optimize the system.',
    'Financial Model Deferment: Any updates to the long-term financial model deployed during this period will not be enforced on your account until the conclusion of the 60-day Beta Period. The current fees are the monthly subscriptions described below.',
  ]],
  ['2. Beta Period Platform Use Fees', [
    'To utilize the digital clearinghouse and contract generation tools during the Beta Period, users are subject to mandatory, non-refundable Software as a Service (SaaS) Platform Use Fees.',
    'Wholesaler / Asset Provider: $50.00 per month. Buyer / Investor: $100.00 per month. Licensed Realtor: $100.00 per month.',
    'Payment Trigger: These Platform Use Fees must be paid in full prior to execution of your first contract or digital assignment on the Platform. All fees are strictly non-refundable, regardless of whether a real estate transaction successfully reaches settlement.',
    'Earnest money deposits are paid directly to the designated title company. TRACT does not collect or hold earnest money deposits.',
  ]],
  ['3. Mandatory On-Platform Execution & Reporting', [
    'TRACT Inc. provides the technological infrastructure to route, track, and close off-market real estate transactions.',
    'Exclusive Deal Execution: Any transaction initiated, discovered, or negotiated through the Platform must be closed utilizing the Platform’s digital workflows.',
    'Action Tracking: Both Buyers and Wholesalers are required to report all material updates, status changes, and executed documents regarding a deal directly within the app. Failure to log transaction milestones constitutes a material breach of this Agreement.',
  ]],
  ['4. Non-Circumvention & Legal Penalties', [
    'Users are strictly prohibited from attempting to bypass, dodge, or circumvent the Platform to avoid SaaS Technology Fees or platform tracking after connecting with another party through TRACT or Buy TRACT.',
    'Platform Tracking: TRACT utilizes communication monitoring and response-tracking metrics to ensure compliance.',
    'Penalties for Circumvention: If TRACT Inc. determines that you have taken a transaction off-platform, your account will be immediately terminated. Furthermore, you will be subject to direct legal action and held liable for liquidated damages equal to the maximum anticipated technology fees, plus all associated attorney fees and court costs incurred by TRACT Inc. in enforcing this provision.',
  ]],
  ['5. Data Privacy & Document Verification', [
    'To maintain a secure marketplace, users are required to upload verification documents, such as identity verification, entity formation documents, and Proof of Funds.',
    'Strictly for Verification: These documents are utilized exclusively for internal platform verification, fraud prevention, and compliance.',
    'Your private financial and verification documents will not be sold, distributed, or shared with unauthorized third-party marketing agencies. TRACT collects data necessary for platform operations, software analytics, and transaction record-keeping, and shares information with essential service providers, such as payment processors and hosting providers, required to operate the software. See the Privacy Policy for further disclosures.',
  ]],
  ['6. Limitation of Liability & Role of TRACT Inc.', [
    'TRACT Inc. is exclusively a technology provider and Software as a Service (SaaS) platform.',
    'TRACT Inc. is not a licensed real estate brokerage, agent, title company, or escrow officer in the State of New Jersey or any other jurisdiction.',
    'We do not represent any party in a fiduciary capacity and hold zero liability for the performance, default, or financial loss resulting from any real estate contract generated between users.',
  ]],
] as const

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-app1-bg-main px-4 py-16 font-poppins">
      <article className="mx-auto max-w-[800px] rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card md:p-10">
        <header className="mb-8 border-b border-app1-border-light pb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-app1-secondary">TRACT INC.</p>
          <h1 className="mb-3 font-cinzel text-3xl font-black text-app1-primary">Terms of Service &amp; Beta Participation Agreement</h1>
          <p className="text-sm text-app1-text-muted">Version: September 7, 2026 · Governing law: State of New Jersey, United States</p>
        </header>
        <div className="space-y-8 text-[15px] leading-relaxed text-app1-text-muted">
          <p>This Agreement constitutes a legally binding contract between you (&quot;User,&quot; &quot;Wholesaler,&quot; &quot;Buyer,&quot; or &quot;Asset Provider&quot;) and TRACT Inc. (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By accessing or using the TRACT and Buy TRACT applications (the &quot;Platform&quot;), you agree to be bound by these terms.</p>
          {sections.map(([title, paragraphs]) => (
            <section key={title}>
              <h2 className="mb-3 text-lg font-bold text-app1-text-main">{title}</h2>
              <div className="space-y-3">{paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
            </section>
          ))}
          <p>Privacy details: <Link to="/legal/privacy" className="text-app1-primary underline">Privacy Policy</Link>. Questions about these terms: <a href="mailto:legal@tractcorp.com" className="text-app1-primary underline">legal@tractcorp.com</a>.</p>
        </div>
        <footer className="mt-10 border-t border-app1-border-light pt-6"><Link to="/login" className="text-sm font-bold text-app1-primary underline">Back to Sign In</Link></footer>
      </article>
    </main>
  )
}
