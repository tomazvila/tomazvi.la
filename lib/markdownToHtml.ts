import type { VFileCompatible } from 'vfile'
import { remark } from 'remark'
import gfm from 'remark-gfm'
import html from 'remark-html'

export default async function markdownToHtml(markdown: VFileCompatible) {
  // Only trusted, author-written post content passes through here (never comments),
  // so `sanitize: false` is safe and lets embedded HTML such as <video> render.
  const result = await remark().use(gfm).use(html, { sanitize: false }).process(markdown)
  // remark-gfm + remark-html double the `user-content-` prefix on footnote ids
  // but not on the hrefs, which breaks the anchors. Collapse it back.
  return result.toString().replace(/user-content-user-content-/g, 'user-content-')
}
