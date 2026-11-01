export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

// Resolves when something fading out over --fast (index.css) is gone, so its replacement never cuts in.
export const fadedOut = () => new Promise((done) => setTimeout(done, reducedMotion() ? 0 : 120))

// Same curve as --ease in index.css. The animated values are the element's natural end state, so
// nothing is kept after it finishes and CSS can still style the element.
export function fx(el: Element | null, keyframes: Keyframe[], duration: number, delay = 0) {
  if (!el || !el.animate || reducedMotion()) return undefined
  return el.animate(keyframes, {
    duration,
    delay,
    easing: 'cubic-bezier(.2,0,0,1)',
    fill: 'backwards',
  })
}
