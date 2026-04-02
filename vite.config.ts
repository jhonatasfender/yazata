import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function resolveSiteUrl(env: Record<string, string>): string {
  const raw = env.VITE_SITE_URL?.trim()
  if (raw) return raw.replace(/\/$/, '')
  return 'https://CHANGE-ME.example'
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const siteUrl = resolveSiteUrl(env)

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'seo-site-url',
        transformIndexHtml(html) {
          return html.replaceAll('%SITE_URL%', siteUrl)
        },
        closeBundle() {
          const distDir = path.resolve(__dirname, 'dist')
          const files = [
            'robots.txt',
            'sitemap.xml',
            'llms.txt',
            path.join('.well-known', 'llms.txt'),
          ]
          for (const rel of files) {
            const file = path.join(distDir, rel)
            if (!fs.existsSync(file)) continue
            const text = fs.readFileSync(file, 'utf8').replaceAll('__SITE_URL__', siteUrl)
            fs.writeFileSync(file, text)
          }
        },
      },
    ],
  }
})
