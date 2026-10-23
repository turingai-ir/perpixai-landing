import { useSyncExternalStore } from 'react'
import { voice } from '@/audio/voice'
import { Icon } from './Icon'

export function SoundToggle({ compact, onEnable }: { compact?: boolean; onEnable?: () => void }) {
  const on = useSyncExternalStore(
    (fn) => voice.subscribe(fn),
    () => voice.soundOn,
  )
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => {
        voice.unlock()
        voice.setMuted(on)
        if (!on) onEnable?.()
      }}
      className="flex cursor-pointer items-center gap-2 rounded-full border border-line bg-ink/70 px-4 py-2 text-xs text-fog/85 backdrop-blur transition hover:border-fog/30 hover:text-fog"
    >
      <Icon name={on ? 'soundOn' : 'soundOff'} className={`size-4 ${on ? 'text-cyan' : 'text-dim'}`} />
      {compact ? (on ? 'صدا روشن' : 'بی‌صدا') : on ? 'صدای پیکسو روشن است' : 'صدای پیکسو را روشن کن'}
    </button>
  )
}
