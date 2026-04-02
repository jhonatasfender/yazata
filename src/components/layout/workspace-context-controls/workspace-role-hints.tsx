type WorkspaceRoleHintsProps = {
  showEmployeeHint: boolean
  showManagerHint: boolean
}

export const WorkspaceRoleHints = ({
  showEmployeeHint,
  showManagerHint,
}: WorkspaceRoleHintsProps) => (
  <>
    {showEmployeeHint ? (
      <p className="text-pretty text-sm leading-relaxed text-zinc-400">
        You are using the app as an <span className="text-zinc-200">employee</span>. Use{' '}
        <span className="font-medium text-zinc-200">Register Time</span> in the sidebar to
        log hours.
      </p>
    ) : null}
    {showManagerHint ? (
      <p className="text-pretty text-sm leading-relaxed text-zinc-400">
        You are using the app as a <span className="text-zinc-200">manager</span>. Open{' '}
        <span className="font-medium text-zinc-200">Employees</span> to invite or edit
        your team.
      </p>
    ) : null}
  </>
)
