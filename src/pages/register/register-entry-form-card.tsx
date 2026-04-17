import type { Dispatch, SetStateAction } from 'react'
import { Pause, Play, Square } from 'lucide-react'
import { useFormContext, type FieldPath } from 'react-hook-form'
import { Form } from '../../components/forms/form'
import { Input } from '../../components/forms/input'
import { Select } from '../../components/forms/select'
import { SubmitButton } from '../../components/forms/submit-button'
import { Textarea } from '../../components/forms/textarea'
import { TimeInput } from '../../components/forms/time-input'
import {
  timeEntrySchema,
  type TimeEntryFormValues,
} from '../../schemas/time-entry-schema'
import { formatBRL } from '../../utils/money'
import type { EditingEntry } from './register-types'

type RegisterEntryQuickControlsProps = {
  editingEntry: EditingEntry | null
  hourlyRateCents: number
  quickEntryStartedAt: string | null
  quickEntryElapsedLabel: string | null
  quickEntryPaused: boolean
  quickEntryCanFinalize: boolean
  quickEntryRemainingToFinalizeLabel: string | null
  onStartQuickEntry: (draft?: TimeEntryFormValues) => Promise<void>
  onStopQuickEntry: () => Promise<void>
  onPauseQuickEntry: () => void
  onResumeQuickEntry: () => void
}

const RegisterEntryQuickControls = ({
  editingEntry,
  hourlyRateCents,
  quickEntryStartedAt,
  quickEntryElapsedLabel,
  quickEntryPaused,
  quickEntryCanFinalize,
  quickEntryRemainingToFinalizeLabel,
  onStartQuickEntry,
  onStopQuickEntry,
  onPauseQuickEntry,
  onResumeQuickEntry,
}: RegisterEntryQuickControlsProps) => {
  const { getValues } = useFormContext<TimeEntryFormValues>()

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm">
        <p className="text-zinc-400">Valor/hora</p>
        <p className="font-semibold text-zinc-100">{formatBRL(hourlyRateCents)}</p>
      </div>
      {quickEntryStartedAt ? (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => (quickEntryPaused ? onResumeQuickEntry() : onPauseQuickEntry())}
            className="inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 text-sm font-medium text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-800 sm:w-auto"
          >
            {quickEntryPaused ? (
              <>
                <Play className="h-4 w-4 fill-zinc-100" aria-hidden />
                Retomar
              </>
            ) : (
              <>
                <Pause className="h-4 w-4" aria-hidden />
                Pausar
              </>
            )}
          </button>
          <button
            type="button"
            disabled={!quickEntryCanFinalize}
            title={
              quickEntryCanFinalize
                ? undefined
                : `Faltam ${quickEntryRemainingToFinalizeLabel ?? '—'} no cronômetro para poder salvar`
            }
            onClick={() => void onStopQuickEntry()}
            className="inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 text-sm font-medium text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <Square className="h-4 w-4 fill-zinc-100" aria-hidden />
            {quickEntryElapsedLabel
              ? `Parar e salvar (${quickEntryElapsedLabel})`
              : 'Parar e salvar'}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => void onStartQuickEntry(editingEntry ? getValues() : undefined)}
          className="inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 text-sm font-medium text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-800 sm:w-auto"
        >
          <Play className="h-4 w-4 fill-zinc-100" aria-hidden />
          Iniciar agora
        </button>
      )}
    </div>
  )
}

type RegisterEntryFormCardProps = {
  editingEntry: EditingEntry | null
  formVersion: number
  hourlyRateCents: number
  loading: boolean
  projectOptions: Array<{ value: string; label: string }>
  onSubmit: (values: TimeEntryFormValues) => Promise<void>
  afterSchemaValidate?: (
    values: TimeEntryFormValues,
  ) => { path: FieldPath<TimeEntryFormValues>; message: string } | undefined
  defaultValues: TimeEntryFormValues
  setEditingEntry: Dispatch<SetStateAction<EditingEntry | null>>
  setFormVersion: Dispatch<SetStateAction<number>>
  quickEntryStartedAt: string | null
  quickEntryElapsedLabel: string | null
  quickEntryPaused: boolean
  quickEntryCanFinalize: boolean
  quickEntryRemainingToFinalizeLabel: string | null
  onStartQuickEntry: (draft?: TimeEntryFormValues) => Promise<void>
  onStopQuickEntry: () => Promise<void>
  onPauseQuickEntry: () => void
  onResumeQuickEntry: () => void
}

export const RegisterEntryFormCard = ({
  editingEntry,
  formVersion,
  hourlyRateCents,
  loading,
  projectOptions,
  onSubmit,
  afterSchemaValidate,
  defaultValues,
  setEditingEntry,
  setFormVersion,
  quickEntryStartedAt,
  quickEntryElapsedLabel,
  quickEntryPaused,
  quickEntryCanFinalize,
  quickEntryRemainingToFinalizeLabel,
  onStartQuickEntry,
  onStopQuickEntry,
  onPauseQuickEntry,
  onResumeQuickEntry,
}: RegisterEntryFormCardProps) => {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 md:p-5">
      <Form<TimeEntryFormValues>
        key={`${editingEntry?.id ?? 'new'}-${formVersion}`}
        className="flex flex-col"
        schema={timeEntrySchema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        afterSchemaValidate={afterSchemaValidate}
      >
        <div className="flex flex-col gap-3 border-b border-zinc-800 pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {editingEntry ? 'Editar registro' : 'Registrar horas'}
            </h2>
            <p className="text-sm text-zinc-400">
              Preencha sua jornada e acompanhe tudo no mini-board abaixo.
            </p>
          </div>
          <RegisterEntryQuickControls
            editingEntry={editingEntry}
            hourlyRateCents={hourlyRateCents}
            quickEntryStartedAt={quickEntryStartedAt}
            quickEntryElapsedLabel={quickEntryElapsedLabel}
            quickEntryPaused={quickEntryPaused}
            quickEntryCanFinalize={quickEntryCanFinalize}
            quickEntryRemainingToFinalizeLabel={quickEntryRemainingToFinalizeLabel}
            onStartQuickEntry={onStartQuickEntry}
            onStopQuickEntry={onStopQuickEntry}
            onPauseQuickEntry={onPauseQuickEntry}
            onResumeQuickEntry={onResumeQuickEntry}
          />
        </div>

        {quickEntryStartedAt ? (
          <p className="mt-3 rounded-lg border border-emerald-800/70 bg-emerald-950/30 px-3 py-2 text-xs text-emerald-200">
            Registro rápido {quickEntryPaused ? 'pausado' : 'em andamento'}. Use{' '}
            <strong>Pausar</strong> para parar o cronômetro sem fechar o registro. Só é possível
            salvar após <strong>20 minutos</strong> no cronômetro (pausas não contam).
            {!quickEntryCanFinalize && quickEntryRemainingToFinalizeLabel ? (
              <>
                {' '}
                Faltam <strong>{quickEntryRemainingToFinalizeLabel}</strong>.
              </>
            ) : null}
          </p>
        ) : null}

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-2">
            <Input type="date" name="workDate" label="Data" />
          </div>
          <div className="lg:col-span-2">
            <TimeInput
              name="startTime"
              label="Início"
              revalidateFieldsOnBlur={['startTime', 'endTime']}
            />
          </div>
          <div className="lg:col-span-2">
            <TimeInput
              name="endTime"
              label="Fim"
              revalidateFieldsOnBlur={['startTime', 'endTime']}
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <Select name="projectId" label="Projeto" options={projectOptions} />
          </div>
          <div className="sm:col-span-2 lg:col-span-2 lg:pt-6">
            <SubmitButton
              className="h-[42px] w-full whitespace-nowrap"
              loadingText={loading ? 'Salvando...' : undefined}
            >
              {editingEntry ? 'Salvar' : 'Adicionar'}
            </SubmitButton>
          </div>
          <div className="sm:col-span-2 lg:col-span-12">
            <Textarea
              rows={2}
              name="description"
              label="Descrição"
              placeholder="No que você trabalhou?"
              className="min-h-[96px] resize-y"
            />
          </div>

          {editingEntry ? (
            <div className="sm:col-span-2 lg:col-span-12">
              <button
                type="button"
                onClick={() => {
                  setEditingEntry(null)
                  setFormVersion((current) => current + 1)
                }}
                className="cursor-pointer rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm font-medium text-zinc-100 hover:border-zinc-500"
              >
                Cancelar edição
              </button>
            </div>
          ) : null}
        </div>
      </Form>
    </article>
  )
}
