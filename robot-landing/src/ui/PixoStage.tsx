import { useCallback, useEffect, useState, type ComponentType } from 'react'
import { voice } from '@/audio/voice'
import { season } from '@/content/season'
import { asset } from '@/lib/asset'
import { isMobile, useReducedMotion } from '@/lib/motion'
import type { StageControls } from '@/stage/controls'
import { StageBoundary } from '@/stage/StageBoundary'
import type { StageProps } from '@/stage/StageCanvas'

const level = () => voice.level()

type Props = {
  controls: StageControls
  /** Accessible name of Pixo (name + title). */
  label: string
  badge: { name: string; role: string }
}

/**
 * Pixo on screen: the react-three-fiber scene, loaded as its own chunk so the conversation renders
 * instantly, or a still image when motion is reduced, WebGL fails or the context is lost for good.
 */
export function PixoStage({ controls, label, badge }: Props) {
  const [Scene, setScene] = useState<ComponentType<StageProps> | null>(null)
  const [shown, setShown] = useState(false)
  const reducedMotion = useReducedMotion()
  const [failed, setFailed] = useState(false)
  const still = reducedMotion || failed
  const toStill = useCallback(() => setFailed(true), [])
  const show = useCallback(() => setShown(true), [])

  useEffect(() => {
    if (reducedMotion) return
    let disposed = false
    import('@/stage/StageCanvas')
      .then((m) => {
        if (disposed) return
        controls.setPowered(true)
        controls.setLayout('side')
        setScene(() => m.default)
      })
      .catch(toStill)
    return () => {
      disposed = true
    }
  }, [controls, reducedMotion, toStill])

  return (
    <>
      {still && (
        <img
          src={asset('brand/pixo.webp')}
          alt={label}
          className="absolute top-0 h-[66%] w-full [mask-image:linear-gradient(black_78%,transparent)] object-contain object-bottom md:left-0 md:h-full md:w-1/2 md:[mask-image:radial-gradient(ellipse_60%_65%_at_50%_55%,black_60%,transparent)]"
        />
      )}
      {Scene && !still && (
        <div
          role="img"
          aria-label={label}
          style={{ opacity: shown ? 1 : 0 }}
          className="absolute inset-x-0 top-0 h-[66%] w-full [mask-image:linear-gradient(black_78%,transparent)] transition-opacity duration-[1500ms] md:h-full md:[mask-image:none]"
        >
          <StageBoundary onError={toStill}>
            <Scene
              controls={controls}
              levelSource={level}
              lite={isMobile()}
              yalda={season.id === 'yalda'}
              badge={badge}
              onContextLost={toStill}
              onReady={show}
            />
          </StageBoundary>
        </div>
      )}
    </>
  )
}
