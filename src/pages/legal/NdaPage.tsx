import { Link } from 'react-router-dom'

export default function NdaPage() {
  return (
    <div className="min-h-screen bg-theme-bg px-4 py-16 font-inter">
      <div className="mx-auto max-w-[800px] rounded-[12px] border border-theme-border bg-theme-card p-6 shadow-sm md:p-10">
        <div className="mb-10 border-b border-theme-border pb-8">
          <p className="mb-2 font-inter text-[12px] font-bold uppercase tracking-widest text-tract-gold">TRACT INC.</p>
          <h1 className="mb-2 font-playfair text-[26px] font-bold text-theme-text md:text-[36px]">Mutual Non-Disclosure Agreement</h1>
          <p className="font-inter text-[14px] text-theme-muted">Effective Date: June 2026</p>
        </div>

        <div className="space-y-8 font-inter text-[15px] leading-relaxed text-theme-text">
          <p className="text-theme-muted">
            This Mutual Non-Disclosure Agreement (the &quot;Agreement&quot;) is entered into as of June 2026, by and between
            TRACT Inc. (&quot;TRACT&quot;) and the undersigned party (&quot;Counterparty&quot;).
          </p>

          {[
            {
              title: '1. Purpose',
              content:
                'The parties wish to explore a potential business relationship of mutual interest and, in connection with this exploration, may disclose to each other certain confidential technical and business information.',
            },
            {
              title: '2. Confidential Information',
              content:
                '"Confidential Information" shall include all information disclosed by one party to the other, whether orally or in writing, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and the circumstances of disclosure.',
            },
            {
              title: '3. Obligations',
              content:
                "Each party agrees (a) to use the other party's Confidential Information solely for the purpose described above, (b) to protect such Confidential Information from unauthorized use or disclosure with at least the same degree of care as it uses for its own confidential information, and (c) to restrict access to the Confidential Information to those employees or consultants who need to know such information for the purpose described above.",
            },
            {
              title: '4. Term',
              content:
                'The obligations of this Agreement shall survive for a period of two (2) years from the date of disclosure.',
            },
          ].map((section) => (
            <div key={section.title}>
              <h3 className="mb-3 font-inter text-[14px] font-bold uppercase tracking-wider text-theme-text">{section.title}</h3>
              <p className="leading-relaxed text-theme-muted">{section.content}</p>
            </div>
          ))}

          <div className="rounded-[10px] border border-theme-border bg-theme-surface-2 p-6">
            <p className="font-inter text-[13px] italic text-theme-muted">
              IN WITNESS WHEREOF, the parties have executed this Agreement to be legally binding.
            </p>
            <div className="mt-6 border-t border-theme-border pt-6">
              <p className="font-inter text-[14px] font-bold text-theme-text">Momina Khan</p>
              <p className="font-inter text-[13px] text-theme-muted">Chief Executive Officer, TRACT Inc.</p>
            </div>
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
