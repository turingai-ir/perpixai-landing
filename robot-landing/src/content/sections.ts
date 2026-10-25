import type { IconName } from '@/ui/icons.data'

/**
 * Language-neutral data for the sections below the conversation. All copy lives in
 * `src/i18n/locales/<lang>/home.json` (keyed by these ids); only ids and icons stay here.
 * Plans and models are not here: they come from the Perpix API (`lib/landing`).
 */

export const toolItems: { id: 'image' | 'video' | 'edit' | 'models'; icon: IconName }[] = [
  { id: 'image', icon: 'image' },
  { id: 'video', icon: 'video' },
  { id: 'edit', icon: 'magic' },
  { id: 'models', icon: 'cpu' },
]

/** Id of the clip shown in the pinned "prompt → film" section. */
export const filmDemoId = 'paykan-rain'
