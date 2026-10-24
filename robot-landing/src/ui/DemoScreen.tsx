import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { config } from '@/config'
import type { Demo } from '@/content/demos'

/** Cinematic frame that "develops" while Pixo computes, then plays the clip. */
export function DemoScreen({ demo, developing }: { demo: Demo; developing: boolean }) {
  const { t } = useTranslation()
  const { t: td } = useTranslation('demos')
  const [missing, setMissing] = useState(false)
  useEffect(() => setMissing(false), [demo.id])

  return (
    <figure className="word mt-6 max-w-xl">
      <div className="border-brand relative aspect-video overflow-hidden rounded-2xl">
        {!missing && (
          <video
            key={demo.id}
            ref={(v) => {
              if (v) (v.muted = true), v.setAttribute('muted', '')
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
            <source src={`${config.demoDir}/${demo.id}.webm`} type="video/webm" onError={() => setMissing(true)} />
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
          <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_30%,#d92dd455,transparent_50%),radial-gradient(circle_at_70%_70%,#06a1e955,transparent_55%)]">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 3px, rgb(255 255 255 / .06) 3px 4px)',
                backgroundSize: '100% 200%',
                animation: 'scan 1.2s linear infinite',
              }}
            />
            <span className="relative text-sm text-fog/80">
              {developing ? t('demo.developing') : t('demo.missing', { id: demo.id })}
            </span>
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
