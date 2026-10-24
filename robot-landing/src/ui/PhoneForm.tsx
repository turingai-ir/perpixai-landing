import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { useTranslation } from 'react-i18next'

/** Inline phone capture — one field, then we hand off to the real sign-up page. */
export function PhoneForm({ onSubmit, error }: { onSubmit: (v: string) => void; error: boolean }) {
  const { t } = useTranslation()
  const [value, setValue] = useState('')
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => input.current?.focus({ preventScroll: true }), [])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(value)
      }}
      className={clsx('word mt-6 flex max-w-md gap-2 rounded-full border-brand p-1.5', error && 'shake')}
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
        className="min-w-0 flex-1 bg-transparent px-4 text-lg tracking-wider text-fog outline-none placeholder:text-mute/50"
      />
      <button type="submit" className="bg-brand cursor-pointer rounded-full px-6 py-3 font-semibold text-white">
        {t('phone.submit')}
      </button>
    </form>
  )
}
