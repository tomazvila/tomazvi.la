import { useEffect } from 'react'
import { useRouter } from 'next/router'

const REMARK_HOST = 'https://comments.tomazvi.la'
const SITE_ID = 'blog'

// Remark42 embed: https://remark42.com/docs/configuration/frontend/
export default function Comment() {
  const router = useRouter()

  useEffect(() => {
    const w = window as any
    w.remark_config = {
      host: REMARK_HOST,
      site_id: SITE_ID,
      url: window.location.origin + window.location.pathname,
      theme: 'light',
    }
    const script = document.createElement('script')
    script.src = `${REMARK_HOST}/web/embed.js`
    script.defer = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
      delete w.REMARK42
      delete w.remark_config
    }
  }, [router.asPath])

  return <div id="remark42" className="mt-10" />
}
