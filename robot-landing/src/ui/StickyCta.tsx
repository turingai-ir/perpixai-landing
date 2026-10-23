import { useEffect, useState } from 'react'

/** Mobile-only sign-up bar once the conversation has scrolled away. */
export function StickyCta({ onSignup }: { onSignup: () => void }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const hero = document.getElementById('top')
    if (!hero) return
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting), { threshold: 0.15 })
    io.observe(hero)
    return () => io.disconnect()
  }, [])

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 p-4 transition duration-500 ease-cine md:hidden"
      style={{ transform: show ? 'none' : 'translateY(120%)' }}
    >
      <button
        type="button"
        onClick={onSignup}
        className="bg-brand w-full cursor-pointer rounded-full py-4 text-base font-bold text-white shadow-[0_10px_40px_-5px_#d92dd4aa]"
      >
        ثبت‌نام رایگان + اعتبار هدیه
      </button>
    </div>
  )
}
