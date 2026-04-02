import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'
import type { NavItem } from './nav-items'
import { SidebarGithubFooter } from './sidebar-github-footer'
import { SidebarNavLink } from './sidebar-nav-link'

const drawerVariants = {
  hidden: { x: '-100%', opacity: 0.9 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 280, damping: 30 },
  },
  exit: {
    x: '-100%',
    opacity: 0.95,
    transition: { duration: 0.2 },
  },
}

type MobileSidebarDrawerProps = {
  isOpen: boolean
  onClose: () => void
  navItems: NavItem[]
  workspaceControls?: ReactNode
}

export const MobileSidebarDrawer = ({
  isOpen,
  onClose,
  navItems,
  workspaceControls,
}: MobileSidebarDrawerProps) => {
  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.button
            aria-label="Close menu"
            className="fixed inset-0 z-30 bg-zinc-950/70 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className={cn([
              'fixed inset-y-0 left-0 z-40 flex h-full flex-col lg:hidden',
              'w-[min(18rem,calc(100vw-1rem))] max-w-[calc(100vw-1rem)]',
              'border-r border-zinc-800 bg-zinc-900 shadow-2xl',
              'p-4 pt-[max(1rem,env(safe-area-inset-top))]',
              'pb-[max(1rem,env(safe-area-inset-bottom))]',
              'pl-[max(1rem,env(safe-area-inset-left))]',
            ])}
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-400">Yazata</p>
                  <h1 className="text-lg font-semibold">Navigation</h1>
                </div>
                <button
                  type="button"
                  aria-label="Close menu"
                  className="rounded-lg border border-zinc-700 px-2 py-1 text-sm text-zinc-300 hover:bg-zinc-800"
                  onClick={onClose}
                >
                  x
                </button>
              </div>
              {workspaceControls}
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <SidebarNavLink
                    key={item.to}
                    to={item.to}
                    label={item.label}
                    icon={item.icon}
                    compact={false}
                    onClick={onClose}
                  />
                ))}
              </nav>
            </div>
            <SidebarGithubFooter />
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  )
}
