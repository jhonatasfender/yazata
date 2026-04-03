import { AnimatePresence, motion } from 'framer-motion'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'
import type { NavItem } from './nav-items'
import { desktopSidebarVariants } from './sidebar-motion'
import { SidebarGithubFooter } from './sidebar-github-footer'
import { SidebarNavLink } from './sidebar-nav-link'

type DesktopSidebarProps = {
  desktopExpanded: boolean
  desktopMode: 'expanded' | 'collapsed'
  onToggleExpanded: () => void
  navItems: NavItem[]
  workspaceControls?: ReactNode
}

export const DesktopSidebar = ({
  desktopExpanded,
  desktopMode,
  onToggleExpanded,
  navItems,
  workspaceControls,
}: DesktopSidebarProps) => {
  const navContainerVariants = {
    expanded: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
    collapsed: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
  }

  const navItemVariants = {
    expanded: { opacity: 1, x: 0, transition: { duration: 0.2 } },
    collapsed: { opacity: 1, x: 0, transition: { duration: 0.15 } },
  }

  return (
    <motion.aside
      className="hidden shrink-0 flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 lg:flex lg:sticky lg:top-[max(2rem,env(safe-area-inset-top))] lg:h-[calc(100svh-max(2rem,env(safe-area-inset-top))-max(2rem,env(safe-area-inset-bottom)))] lg:max-h-[calc(100svh-max(2rem,env(safe-area-inset-top))-max(2rem,env(safe-area-inset-bottom)))] lg:self-start"
      variants={desktopSidebarVariants}
      animate={desktopMode}
      initial={false}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div
          className={cn(
            'mb-6',
            desktopExpanded ? 'flex items-center justify-between gap-2' : 'block',
          )}
        >
          <AnimatePresence initial={false} mode="wait">
            {desktopExpanded ? (
              <motion.div
                key="sidebar-header"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                <p className="text-xs uppercase tracking-wide text-zinc-400">Yazata</p>
                <h1 className="text-base font-semibold">Team tracker</h1>
              </motion.div>
            ) : null}
          </AnimatePresence>
          <button
            type="button"
            aria-label="Expand or collapse sidebar"
            className={cn(
              'rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-300 transition-colors hover:bg-zinc-800',
              desktopExpanded ? 'px-2 py-1' : 'w-full px-2 py-2',
            )}
            onClick={onToggleExpanded}
          >
            <motion.span
              className="flex items-center justify-center"
              animate={{ rotate: desktopExpanded ? 0 : 180 }}
              transition={{ duration: 0.2 }}
            >
              {desktopExpanded ? (
                <PanelLeftClose size={16} />
              ) : (
                <PanelLeftOpen size={16} />
              )}
            </motion.span>
          </button>
        </div>

        {workspaceControls}

        <motion.nav
          className="space-y-2"
          variants={navContainerVariants}
          animate={desktopMode}
          initial={false}
        >
          {navItems.map((item) => (
            <motion.div key={item.to} variants={navItemVariants}>
              <SidebarNavLink
                to={item.to}
                label={item.label}
                icon={item.icon}
                compact={!desktopExpanded}
              />
            </motion.div>
          ))}
        </motion.nav>
      </div>
      <SidebarGithubFooter compact={!desktopExpanded} />
    </motion.aside>
  )
}
