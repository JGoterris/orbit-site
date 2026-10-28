export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

export function fx(el: Element | null, keyframes: Keyframe[], duration: number, delay = 0) {
  if (!el || !el.animate || reducedMotion()) return undefined
  return el.animate(keyframes, {
    duration,
    delay,
    easing: 'cubic-bezier(.2,.75,.2,1)',
    fill: 'both',
  })
}
