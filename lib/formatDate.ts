// Pages are pre-rendered at image-build time, so a date rendered relative to
// "now" freezes at the moment of the build and drifts from then on. Format the
// timestamp absolutely instead: same input, same output, forever.
//
// Frontmatter dates are midnight UTC, so format in UTC or the displayed day
// shifts by one in a container running west of Greenwich.
export default function formatDate(date: string, locale = 'lt') {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date))
}
