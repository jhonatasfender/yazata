import { cn } from '../../../lib/utils'
import type { WorkspaceManagerOption } from './types'

type WorkspaceCompanyBlockProps = {
  placement: 'sidebar' | 'topbar'
  sidebarCompact: boolean
  companySelectId: string
  showManagerSwitcher: boolean
  showSingleCompanyLine: boolean
  selectedCompanyLabel: string | undefined
  managerOptions: WorkspaceManagerOption[]
  selectedManagerProfileId: string | null
  onSelectManagerProfile: (id: string) => void
}

export const WorkspaceCompanyBlock = ({
  placement,
  sidebarCompact,
  companySelectId,
  showManagerSwitcher,
  showSingleCompanyLine,
  selectedCompanyLabel,
  managerOptions,
  selectedManagerProfileId,
  onSelectManagerProfile,
}: WorkspaceCompanyBlockProps) => {
  const selectId = placement === 'topbar' ? `${companySelectId}-top` : companySelectId

  if (showManagerSwitcher) {
    if (placement === 'topbar') {
      return (
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-zinc-400" htmlFor={selectId}>
            Active company
          </label>
          <select
            id={selectId}
            className="min-w-[200px] max-w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-violet-400 focus:ring-2"
            value={selectedManagerProfileId ?? ''}
            onChange={(event) => {
              const value = event.target.value
              if (value) onSelectManagerProfile(value)
            }}
          >
            {managerOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.companyName}
              </option>
            ))}
          </select>
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-1.5">
        <label
          className={cn(
            'text-zinc-400',
            sidebarCompact ? 'sr-only' : 'text-xs font-medium text-zinc-500',
          )}
          htmlFor={selectId}
        >
          {sidebarCompact ? 'Active company' : 'Company'}
        </label>
        <select
          id={selectId}
          title={selectedCompanyLabel ? String(selectedCompanyLabel) : 'Select company'}
          className={cn(
            'w-full min-w-0 rounded-lg border border-zinc-700 bg-zinc-950 text-zinc-100 outline-none ring-violet-400 focus:ring-2',
            sidebarCompact ? 'px-1 py-1.5 text-[11px]' : 'px-3 py-2 text-sm',
          )}
          value={selectedManagerProfileId ?? ''}
          onChange={(event) => {
            const value = event.target.value
            if (value) onSelectManagerProfile(value)
          }}
        >
          {managerOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.companyName}
            </option>
          ))}
        </select>
      </div>
    )
  }

  if (showSingleCompanyLine) {
    if (placement === 'topbar') {
      return (
        <p className="text-xs text-zinc-500">
          Managing{' '}
          <span className="font-medium text-zinc-300">{selectedCompanyLabel}</span>
        </p>
      )
    }

    return (
      <p
        className={cn(
          'text-zinc-500',
          sidebarCompact
            ? 'line-clamp-2 text-center text-[10px] leading-tight'
            : 'text-xs',
        )}
        title={selectedCompanyLabel ? String(selectedCompanyLabel) : undefined}
      >
        {sidebarCompact ? (
          <span className="font-medium text-zinc-400">{selectedCompanyLabel}</span>
        ) : (
          <>
            Managing{' '}
            <span className="font-medium text-zinc-300">{selectedCompanyLabel}</span>
          </>
        )}
      </p>
    )
  }

  return null
}
