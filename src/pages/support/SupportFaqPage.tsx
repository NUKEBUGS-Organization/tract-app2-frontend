import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, HelpCircle } from 'lucide-react'
import SupportLayout from '@/components/support/SupportLayout'
import { cn } from '@/lib/utils'

const FAQ_DATA = [
  {
    category: 'Account & Verification',
    items: [
      {
        question: 'Who can buy properties on Buy TRACT?',
        answer:
          'The platform is built for corporate entities, institutional buyers, and individual real estate investors looking for verified off-market inventory.',
      },
      {
        question: 'Do I need to verify my proof of funds (POF)?',
        answer:
          'Yes. To maintain a secure marketplace and protect sellers, buyers must link a verified proof of funds, transactional funding capability, or a bank pre-approval letter before placing binding offers on active contracts.',
      },
    ],
  },
  {
    category: 'Transaction Fees & Payments',
    items: [
      {
        question: 'What are the buyer fees on Buy TRACT?',
        answer:
          'Buy TRACT utilizes a competitive transaction-fee structure. Buyers pay a 1.5% Platform Utilization fee calculated based on the final contract purchase price.',
      },
      {
        question: 'When is the 1.5% fee paid?',
        answer:
          'This fee is strictly success-based. It is factored into the closing statement and settled at the close of escrow. If the transaction falls through during the feasibility or title period, no transaction fee is charged by TRACT.',
      },
    ],
  },
  {
    category: 'Bidding & Closing Process',
    items: [
      {
        question: 'How do I submit an offer on a property?',
        answer:
          'Once your account is verified, navigate to the property profile, input your desired purchase price, escrow deposit amount, and target closing date, then click "Submit Offer." This generates a formal digital intent framework sent directly to the asset provider.',
      },
      {
        question: 'What happens after my offer is accepted?',
        answer:
          'Once accepted, TRACT automatically locks the deal and generates the necessary digital routing paths for title and escrow. Both parties will be introduced to the assigned closing coordinator to oversee earnest money deposit (EMD) submission and title clearance.',
      },
      {
        question: 'Who handles title and escrow?',
        answer:
          "Transactions can be routed through TRACT's preferred investor-friendly title companies, or buyers can use their own title companies and closing attorneys to ensure speed. Parties can also mutually agree on a designated local closing office during the offer phase.",
      },
    ],
  },
  {
    category: 'Shared Platform Mechanics & Security',
    items: [
      {
        question: 'How does TRACT protect equitable interest and prevent chain-linking?',
        answer:
          'TRACT actively vets listings to ensure the provider holds direct equitable interest (a valid, executable purchase and sale agreement) or direct ownership. Unauthorized re-marketing or "daisy-chaining" of deals without contract control is strictly prohibited.',
      },
      {
        question: 'What happens if a party defaults on a transaction?',
        answer:
          'Standard legal real estate remedies apply as dictated by the executed assignment or purchase agreement. Earnest money deposits are held securely in a third-party escrow account and disbursed according to contract terms if a default occurs.',
      },
    ],
  },
]

function AccordionItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="overflow-hidden rounded-xl border border-app1-border-light bg-app1-bg-card shadow-sm transition-all duration-200">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-app1-bg-soft"
      >
        <span className="font-poppins text-[14px] font-bold text-app1-text-main">{question}</span>
        <ChevronDown
          className={cn(
            'h-5 w-5 shrink-0 text-app1-text-muted transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>
      {open ? (
        <div className="border-t border-app1-border-light px-6 py-5">
          <p className="font-poppins text-[14px] leading-relaxed text-app1-text-muted">{answer}</p>
        </div>
      ) : null}
    </div>
  )
}

export default function SupportFaqPage() {
  return (
    <SupportLayout>
      <div className="mx-auto max-w-[760px] space-y-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-app1-primary/10">
            <HelpCircle className="h-6 w-6 text-app1-primary" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-app1-text-muted">Support</p>
            <h1 className="font-cinzel text-2xl font-black text-app1-primary">Frequently Asked Questions</h1>
          </div>
        </div>

        <p className="font-poppins text-[14px] leading-relaxed text-app1-text-muted">
          Find answers to the most common questions about buying on TRACT. Can&apos;t find what you&apos;re looking for?
          Open a support ticket and our team will help.
        </p>

        {FAQ_DATA.map((section) => (
          <div key={section.category}>
            <h2 className="mb-4 font-cinzel text-[18px] font-black text-app1-primary">{section.category}</h2>
            <div className="space-y-3">
              {section.items.map((item) => (
                <AccordionItem key={item.question} question={item.question} answer={item.answer} />
              ))}
            </div>
          </div>
        ))}

        <div className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-8 text-center shadow-app1-card">
          <p className="mb-2 font-cinzel text-[20px] font-black text-app1-primary">Still have questions?</p>
          <p className="mb-6 font-poppins text-[14px] text-app1-text-muted">
            Our support team typically responds within 24 hours.
          </p>
          <Link
            to="/support/new"
            className="inline-block bg-app1-secondary px-8 py-3 font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-primary-dark transition-all hover:scale-[1.02]"
          >
            Open a Support Ticket
          </Link>
        </div>
      </div>
    </SupportLayout>
  )
}
