export const desktopSidebarVariants = {
  expanded: {
    width: 264,
    transition: { type: 'spring' as const, stiffness: 260, damping: 26 },
  },
  collapsed: {
    width: 92,
    transition: { type: 'spring' as const, stiffness: 260, damping: 26 },
  },
}
