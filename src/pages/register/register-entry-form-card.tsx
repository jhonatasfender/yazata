import type { Dispatch, SetStateAction } from 'react'
import { Form } from '../../components/forms/form'
import { Input } from '../../components/forms/input'
import { Select } from '../../components/forms/select'
import { SubmitButton } from '../../components/forms/submit-button'
import { Textarea } from '../../components/forms/textarea'
import {
  timeEntrySchema,
  type TimeEntryFormValues,
} from '../../schemas/time-entry-schema'
import { formatBRL } from '../../utils/money'
import type { EditingEntry } from './register-types'

type RegisterEntryFormCardProps = {
  editingEntry: EditingEntry | null
  formVersion: number
  hourlyRateCents: number
  loading: boolean
  projectOptions: Array<{ value: string; label: string }>
  onSubmit: (values: TimeEntryFormValues) => Promise<void>
  defaultValues: TimeEntryFormValues
  setEditingEntry: Dispatch<SetStateAction<EditingEntry | null>>
  setFormVersion: Dispatch<SetStateAction<number>>
}

export const RegisterEntryFormCard = ({
  editingEntry,
  formVersion,
  hourlyRateCents,
  loading,
  projectOptions,
  onSubmit,
  defaultValues,
  setEditingEntry,
  setFormVersion,
}: RegisterEntryFormCardProps) => (
  <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 md:p-5">
    <div className="flex flex-col gap-3 border-b border-zinc-800 pb-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-lg font-semibold">
          {editingEntry ? 'Editar registro' : 'Registrar horas'}
        </h2>
        <p className="text-sm text-zinc-400">
          Preencha sua jornada e acompanhe tudo no mini-board abaixo.
        </p>
      </div>
      <div className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm">
        <p className="text-zinc-400">Valor/hora</p>
        <p className="font-semibold text-zinc-100">{formatBRL(hourlyRateCents)}</p>
      </div>
    </div>

    <Form<TimeEntryFormValues>
      key={`${editingEntry?.id ?? 'new'}-${formVersion}`}
      className="mt-4 grid gap-3 md:grid-cols-12 md:items-end"
      schema={timeEntrySchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
    >
      <div className="md:col-span-2">
        <Input type="date" name="workDate" label="Data" />
      </div>
      <div className="md:col-span-2">
        <Input type="time" name="startTime" label="Início" />
      </div>
      <div className="md:col-span-2">
        <Input type="time" name="endTime" label="Fim" />
      </div>
      <div className="md:col-span-3">
        <Select name="projectId" label="Projeto" options={projectOptions} />
      </div>
      <div className="md:col-span-2">
        <Textarea
          rows={1}
          name="description"
          label="Descrição"
          placeholder="No que você trabalhou?"
          className="min-h-[42px] resize-y"
        />
      </div>
      <div className="md:col-span-1">
        <SubmitButton
          className="h-[42px]"
          loadingText={loading ? 'Salvando...' : undefined}
        >
          {editingEntry ? 'Salvar' : 'Adicionar'}
        </SubmitButton>
      </div>

      {editingEntry ? (
        <div className="md:col-span-12">
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
    </Form>
  </article>
)
