// Social scrapers do not resolve root-relative image paths, so og:image has to
// be absolute. This blog serves one domain, so a constant is the honest
// representation — there is no per-environment value to inject.
export const SITE_URL = 'https://tomazvi.la'

export function absoluteUrl(path: string) {
  return `${SITE_URL}${path}`
}
