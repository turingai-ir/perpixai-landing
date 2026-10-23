import { faq } from '@/content/sections'
import { Icon } from '@/ui/Icon'
import { SplitHeading } from '@/ui/SplitHeading'

export function Faq() {
  return (
    <section id="faq" className="px-5 py-24 md:px-14 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
        <div>
          <span className="eyebrow mb-5">پشت صحنه</span>
          <SplitHeading lines={['سؤال‌هایی که', 'قبل از شروع می‌پرسند.']} text="سؤال‌هایی که قبل از شروع می‌پرسند." className="font-poster text-4xl leading-[1.2] md:text-6xl" />
        </div>
        <div className="border-t border-line">
          {faq.map((f) => (
            <details key={f.q} className="group border-b border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg font-semibold transition hover:text-white [&::-webkit-details-marker]:hidden">
                {f.q}
                <Icon name="plus" className="size-6 shrink-0 text-purple transition duration-500 ease-cine group-open:rotate-45 group-open:text-cyan" />
              </summary>
              <p className="-mt-2 pb-6 leading-8 text-mute">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
