import { next } from '@vercel/edge'

const SOCIAL_LINK_BOTS =
  /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|vkShare|Pinterest|redditbot|Embedly|Iframely/i

function canonicalSiteUrl(): string {
  const fromEnv = (process.env.SITE_URL ?? process.env.VITE_SITE_URL)?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  const vercel = process.env.VERCEL_URL?.trim()
  if (vercel) return `https://${vercel.replace(/\/$/, '')}`
  return 'http://localhost:3000'
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function metaForPath(pathname: string): { title: string; description: string } {
  if (pathname.startsWith('/sign-up')) {
    return {
      title: 'Criar conta — Yazata | Faith Tracker',
      description:
        'Cadastre-se para acessar o Yazata e começar a registrar as horas trabalhadas.',
    }
  }
  if (pathname.startsWith('/login')) {
    return {
      title: 'Login — Yazata | Faith Tracker',
      description:
        'Faça login para registrar jornada, acompanhar horas e manter o histórico centralizado no Yazata.',
    }
  }
  if (pathname === '/forgot-password') {
    return {
      title: 'Recuperar senha — Yazata | Faith Tracker',
      description:
        'Redefina a senha da sua conta Yazata com o código enviado por e-mail.',
    }
  }
  return {
    title: 'Yazata — Faith Tracker',
    description: 'Registro de jornada e horas para equipes.',
  }
}

function botOgHtml(requestUrl: string): Response {
  const url = new URL(requestUrl)
  const site = canonicalSiteUrl()
  const { title, description } = metaForPath(url.pathname)
  const canonical = `${site}${url.pathname}`
  const ogImage = `${site}/favicon.svg`

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<link rel="canonical" href="${escapeHtml(canonical)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Yazata">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${escapeHtml(canonical)}">
<meta property="og:image" content="${escapeHtml(ogImage)}">
<meta property="og:locale" content="pt_BR">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
</head>
<body>
<p><a href="${escapeHtml(canonical)}">Yazata</a></p>
</body>
</html>`

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}

export default function middleware(request: Request): Response {
  const ua = request.headers.get('user-agent') ?? ''
  if (!SOCIAL_LINK_BOTS.test(ua)) {
    return next()
  }
  return botOgHtml(request.url)
}

export const config = {
  matcher: ['/login/:path*', '/sign-up/:path*', '/forgot-password'],
}
