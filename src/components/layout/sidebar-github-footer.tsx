import { ExternalLink } from 'lucide-react'
import { cn } from '../../lib/utils'

export const SIDEBAR_GITHUB_URL = 'https://github.com/jhonatasfender/yazata'

type SidebarGithubFooterProps = {
  compact?: boolean
  className?: string
}

export const SidebarGithubFooter = ({
  compact = false,
  className,
}: SidebarGithubFooterProps) => (
  <div className={cn('mt-auto border-t border-zinc-800 pt-3', className)}>
    <a
      href={SIDEBAR_GITHUB_URL}
      target="_blank"
      rel="noopener noreferrer"
      title={compact ? 'GitHub — report issues, suggestions, or feedback' : undefined}
      aria-label="Open Yazata on GitHub for issues, suggestions, or feedback"
      className={cn(
        'flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100',
        compact && 'justify-center px-2',
      )}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-700 text-zinc-200">
        <ExternalLink size={15} strokeWidth={2.2} />
      </span>
      {!compact ? (
        <span className="min-w-0">
          <span className="block truncate text-zinc-200">GitHub</span>
          <span className="block truncate text-xs font-normal text-zinc-500">
            Issues, suggestions & feedback
          </span>
        </span>
      ) : null}
    </a>
  </div>
)
