import { useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'
import { voice } from '@/audio/voice'
import { Icon } from './Icon'

export function SoundToggle({ compact, onEnable }: { compact?: boolean; onEnable?: () => void }) {
  const { t } = useTranslation()
  const on = useSyncExternalStore(
    (fn) => voice.subscribe(fn),
    () => voice.soundOn,
    () => false,
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
      className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-2 text-xs text-foreground/85 backdrop-blur transition hover:border-foreground/30 hover:text-foreground"
    >
      <Icon name={on ? 'soundOn' : 'soundOff'} className={`size-4 ${on ? 'text-accent' : 'text-subtle-foreground'}`} />
      {compact ? (on ? t('sound.compactOn') : t('sound.compactOff')) : on ? t('sound.on') : t('sound.off')}
    </button>
  )
}
