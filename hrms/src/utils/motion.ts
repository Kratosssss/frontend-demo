export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

type MediaQueryMatcher = (query: string) => Pick<MediaQueryList, 'matches'>

export function prefersReducedMotion(
  matchMedia: MediaQueryMatcher | undefined =
    typeof window === 'undefined' ? undefined : window.matchMedia?.bind(window),
) {
  return matchMedia?.(REDUCED_MOTION_QUERY).matches ?? false
}

export function getChartMotionOptions(reducedMotion = prefersReducedMotion()) {
  return reducedMotion
    ? { animation: false, animationDuration: 0 }
    : { animationDuration: 450 }
}
