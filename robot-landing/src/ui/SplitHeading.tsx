import type { ElementType, ReactNode } from 'react'

type Props = { as?: ElementType; lines: ReactNode[] | string[]; text: string; className?: string }

/**
 * Heading revealed word by word by the page choreography ([data-split] → [data-w]).
 * The accessible name stays the unsplit text; split words are hidden from assistive tech.
 */
export function SplitHeading({ as: Tag = 'h2', lines, text, className }: Props) {
  return (
    <Tag data-split aria-label={text} className={className}>
      {lines.map((line, li) => (
        <span key={li} aria-hidden className="block">
          {String(line)
            .split(' ')
            .map((w, i) => (
              <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-top">
                <span data-w className="inline-block">
                  {w}
                </span>
                &nbsp;
              </span>
            ))}
        </span>
      ))}
    </Tag>
  )
}
