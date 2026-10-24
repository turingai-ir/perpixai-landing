import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { config } from '@/config'
import type { Demo } from '@/content/demos'

/** Cinematic frame that "develops" while Pixo computes, then plays the clip. */
export function DemoScreen({ demo, developing }: { demo: Demo; developing: boolean }) {
  const { t } = useTranslation()
  const { t: td } = useTranslation('demos')
  const [missingId, setMissingId] = useState<string | null>(null)
  const missing = missingId === demo.id

  return (
    <figure className="word mt-6 max-w-xl">
      <div className="border-brand relative aspect-video overflow-hidden rounded-2xl">
        {!missing && (
          <video
            key={demo.id}
            ref={(v) => {
              if (!v) return
              v.muted = true
              v.setAttribute('muted', '')
            }}
            poster={`${config.demoDir}/${demo.id}.jpg`}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 size-full object-cover transition duration-1000 ease-cine"
            style={{ opacity: developing ? 0 : 1, filter: developing ? 'blur(20px)' : 'none' }}
          >
            <source src={`${config.demoDir}/${demo.id}.mp4`} type="video/mp4" />
            {/* The last source's error means no format could play. */}
            <source src={`${config.demoDir}/${demo.id}.webm`} type="video/webm" onError={() => setMissingId(demo.id)} />
          </video>
        )}
        {missing && !developing && (
          <img
            src={`${config.demoDir}/${demo.id}.jpg`}
            alt=""
            onError={(e) => (e.currentTarget.style.display = 'none')}
            className="absolute inset-0 size-full object-cover"
          />
        )}
        {(developing || (missing && process.env.NODE_ENV === 'development')) && (
          <div className="absolute inset-0 grid place-items-center aura-demo">
            <div className="absolute inset-0 scanlines opacity-40" />
            <span className="relative text-sm text-fog/80">{developing ? t('demo.developing') : t('demo.missing', { id: demo.id })}</span>
          </div>
        )}
      </div>
      <figcaption className="mt-3 text-sm leading-7 text-mute">
        <span className="text-brand font-semibold">{t('demo.promptLabel')}</span>
        {td(`${demo.id}.prompt`)}
      </figcaption>
    </figure>
  )
}
