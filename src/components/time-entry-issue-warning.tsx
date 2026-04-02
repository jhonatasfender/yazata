import { AlertTriangle } from 'lucide-react'

type TimeEntryIssueWarningProps = {
  className?: string
}

export const TimeEntryIssueWarning = ({ className }: TimeEntryIssueWarningProps) => (
  <span
    className={className}
    title="Horário inválido ou sobreposição com outro registro no mesmo dia. Edite ou exclua."
    aria-label="Atenção: conflito ou horário inválido neste registro."
  >
    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" aria-hidden />
  </span>
)
