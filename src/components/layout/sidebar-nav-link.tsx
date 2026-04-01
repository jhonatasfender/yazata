import { AnimatePresence, motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils'

const linkBaseStyles =
  'flex items-center gap-3 rounded-xl border border-zinc-800 px-3 py-2 text-sm font-medium transition-colors'

type SidebarNavLinkProps = {
  to: string
  label: string
  icon: LucideIcon
  compact: boolean
  onClick?: () => void
}

export const SidebarNavLink = ({
  to,
  label,
  icon: Icon,
  compact,
  onClick,
}: SidebarNavLinkProps) => (
  <NavLink
    to={to}
    end={to === '/'}
    onClick={onClick}
    className={({ isActive }) =>
      cn(
        linkBaseStyles,
        isActive
          ? 'border-violet-400/50 bg-violet-500/20 text-violet-100'
          : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100',
      )
    }
  >
    {({ isActive }) => (
      <>
        <motion.span
          whileHover={{ scale: 1.06 }}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-lg',
            isActive ? 'bg-violet-400 text-zinc-950' : 'bg-zinc-700 text-zinc-200',
          )}
        >
          <Icon size={15} strokeWidth={2.2} />
        </motion.span>
        <AnimatePresence initial={false}>
          {!compact ? (
            <motion.span
              key="sidebar-label"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="truncate"
            >
              {label}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </>
    )}
  </NavLink>
)
