import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Loader2 } from 'lucide-react'
import { useFaq } from '@/hooks/useFaq'
import { cn } from '@/lib/utils'

export default function FaqPage() {
  const { data: items = [], isLoading } = useFaq()

  const grouped = useMemo(() => {
    const map = new Map<string, typeof items>()
    for (const item of items) {
      const list = map.get(item.category) ?? []
      list.push(item)
      map.set(item.category, list)
    }
    return Array.from(map.entries())
  }, [items])

  return (
    <div className="min-h-screen bg-app1-bg-main px-4 py-12 font-poppins">
      <div className="mx-auto max-w-[800px]">
        <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-app1-text-muted">TRACT Help</p>
        <h1 className="mt-2 text-center font-cinzel text-3xl font-black text-app1-primary md:text-4xl">
          Frequently Asked Questions
        </h1>
        <p className="mt-4 text-center font-poppins text-sm text-app1-text-muted">
          Need more help?{' '}
          <Link to="/support" className="font-bold text-app1-secondary hover:underline">
            Open a support ticket
          </Link>
          .
        </p>

        {isLoading ? (
          <div className="mt-16 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-app1-secondary" />
          </div>
        ) : grouped.length === 0 ? (
          <div className="mt-12 rounded-app1-card border border-app1-border-light bg-app1-bg-card p-10 text-center shadow-app1-card">
            <p className="font-cinzel text-xl font-black text-app1-primary">No FAQ entries yet</p>
            <p className="mt-2 text-sm text-app1-text-muted">Check back soon or contact support.</p>
          </div>
        ) : (
          <div className="mt-12 space-y-10">
            {grouped.map(([category, faqs]) => (
              <section key={category}>
                <h2 className="mb-4 font-poppins text-[13px] font-black uppercase tracking-[0.14em] text-app1-secondary">
                  {category}
                </h2>
                <div className="space-y-3">
                  {faqs.map((faq) => (
                    <details
                      key={faq.id}
                      className="group rounded-app1-card border border-app1-border-light bg-app1-bg-card shadow-app1-card"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-poppins text-[15px] font-bold text-app1-text-main">
                        {faq.question}
                        <ChevronDown
                          className={cn(
                            'h-5 w-5 shrink-0 text-app1-text-muted transition-transform group-open:rotate-180',
                          )}
                        />
                      </summary>
                      <div className="border-t border-app1-border-light px-5 pb-5 pt-3">
                        <p className="whitespace-pre-wrap font-poppins text-[15px] leading-relaxed text-app1-text-muted">
                          {faq.answer}
                        </p>
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <p className="mt-16 text-center font-poppins text-[12px] text-app1-text-muted">
          © {new Date().getFullYear()} TRACT Private Marketplace
        </p>
      </div>
    </div>
  )
}
