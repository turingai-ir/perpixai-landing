import type { ButtonHTMLAttributes } from 'react'
import { clsx } from 'clsx'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { primary?: boolean; index?: number }

export function Choice({ primary, index = 0, className, children, ...rest }: Props) {
  return (
    <button
      type="button"
      style={{ animationDelay: `${index * 80}ms` }}
      className={clsx(
        'word cursor-pointer rounded-full px-4 py-2.5 text-sm font-medium transition duration-300 ease-cine hover:-translate-y-0.5 md:px-5 md:py-3 md:text-base',
        primary
          ? 'bg-brand text-white shadow-cta hover:shadow-cta-hover'
          : 'border border-fog/25 bg-white/[0.06] text-fog backdrop-blur hover:border-fog/50 hover:bg-white/10',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

export function Choices({ children }: { children: React.ReactNode }) {
  return <div className="mt-4 flex flex-wrap gap-2 md:mt-6 md:gap-3">{children}</div>
}
