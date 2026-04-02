export function getSiteOrigin(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL?.trim().replace(/\/$/, '')
  if (fromEnv) return fromEnv
  if (typeof globalThis !== 'undefined' && 'location' in globalThis) {
    const loc = (globalThis as Window & typeof globalThis).location
    if (loc?.origin && loc.origin !== 'null') return loc.origin.replace(/\/$/, '')
  }
  return ''
}
