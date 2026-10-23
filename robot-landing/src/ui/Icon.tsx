import { icons, type IconName } from './icons.data'

/** Inline Solar icon; decorative unless a label is given. */
export function Icon({ name, className, label }: { name: IconName; className?: string; label?: string }) {
  const { body, viewBox } = icons[name]
  return (
    <svg
      viewBox={viewBox}
      className={className ?? 'size-5'}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      dangerouslySetInnerHTML={{ __html: body }}
    />
  )
}
