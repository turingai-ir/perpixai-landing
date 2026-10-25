import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { Trans, useTranslation } from 'react-i18next'

/** Inline phone capture — one field, then we hand off to the real sign-up page. */
export function PhoneForm({ onSubmit, error }: { onSubmit: (v: string) => void; error: boolean }) {
  const { t } = useTranslation()
  const [value, setValue] = useState('')
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => input.current?.focus({ preventScroll: true }), [])

  const link = 'text-foreground/90 underline underline-offset-4 hover:text-foreground'

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit(value)
        }}
        className={clsx('word border-brand mt-6 flex max-w-md gap-2 rounded-full p-1.5', error && 'shake')}
      >
        <label htmlFor="phone" className="sr-only">
          {t('phone.label')}
        </label>
        <input
          ref={input}
          id="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          dir="ltr"
          placeholder={t('phone.placeholder')}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="min-w-0 flex-1 bg-transparent px-4 text-lg tracking-wider text-foreground outline-none placeholder:text-muted-foreground/50"
        />
        <button type="submit" className="bg-brand cursor-pointer rounded-full px-6 py-3 font-semibold text-primary-foreground">
          {t('phone.submit')}
        </button>
      </form>
      <p className="word mt-3 max-w-md px-2 text-xs leading-6 text-muted-foreground">
        <Trans
          i18nKey="phone.consent"
          components={{
            terms: <a href="/terms/" target="_blank" rel="noopener" className={link} />,
            privacy: <a href="/privacy/" target="_blank" rel="noopener" className={link} />,
          }}
        />
      </p>
    </>
  )
}
