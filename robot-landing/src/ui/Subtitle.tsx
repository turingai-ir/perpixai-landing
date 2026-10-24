import type { Line } from '@/content/dialogue'

/** Word-by-word reveal. Persian letters join, so we never split below the word. */
export function Subtitle({ line, prev }: { line: Line | null; prev: Line | null }) {
  return (
    <div aria-live="polite" className="min-h-[5.5rem] md:min-h-[11rem]">
      {prev && (
        <p key={`prev-${prev.id}`} className="mb-4 hidden text-base leading-7 text-subtle-foreground md:block">
          {prev.text}
        </p>
      )}
      {line && (
        <p key={line.id} className="text-subtitle font-bold text-foreground md:text-subtitle-lg">
          {line.text.split(' ').map((w, i) => (
            <span key={i} className="word" style={{ animationDelay: `${i * 70}ms` }}>
              {w}&nbsp;
            </span>
          ))}
        </p>
      )}
    </div>
  )
}
