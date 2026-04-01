import { AnimatePresence, motion } from 'framer-motion'
import type { NavItem } from './nav-items'
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
}

export const MobileSidebarDrawer = ({
  isOpen,
  onClose,
  navItems,
}: MobileSidebarDrawerProps) => (
  <AnimatePresence>
    {isOpen ? (
      <>
        <motion.button
          aria-label="Fechar menu lateral"
          className="fixed inset-0 z-30 bg-zinc-950/70 md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.aside
          className="fixed inset-y-0 left-0 z-40 w-72 border-r border-zinc-800 bg-zinc-900 p-4 shadow-2xl md:hidden"
          variants={drawerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-400">
                Yazata
              </p>
              <h1 className="text-lg font-semibold">Navegacao</h1>
            </div>
            <button
              type="button"
              aria-label="Fechar menu"
              className="rounded-lg border border-zinc-700 px-2 py-1 text-sm text-zinc-300 hover:bg-zinc-800"
              onClick={onClose}
            >
              x
            </button>
          </div>
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
        </motion.aside>
      </>
    ) : null}
  </AnimatePresence>
)
