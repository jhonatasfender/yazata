import { useState } from 'react'
import { Navigate, useOutletContext } from 'react-router-dom'
import type { AppLayoutContext } from '../components/app-layout'
import { useProjects } from '../hooks/use-projects'
import { useTimeEntries } from '../hooks/use-time-entries'
import type { TimeEntryFormValues } from '../schemas/time-entry-schema'
import { today } from '../utils/time'
import { RegisterEntryFormCard } from './register/register-entry-form-card'
import { RegisterMiniBoard } from './register/register-mini-board'
import type { EditingEntry } from './register/register-types'
import { RegisterUnlinkedState } from './register/register-unlinked-state'

const defaultForm = (): TimeEntryFormValues => ({
  workDate: today(),
  startTime: '09:00',
  endTime: '18:00',
  description: '',
  projectId: '',
})

export const RegisterPage = () => {
  const { manager, employee } = useOutletContext<AppLayoutContext>()
  const [formVersion, setFormVersion] = useState(0)
  const [editingEntry, setEditingEntry] = useState<EditingEntry | null>(null)
  const {
    entries,
    loading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    totalWeekHours,
    totalWeekAmountCents,
  } = useTimeEntries({
    enabled: Boolean(employee),
    mode: 'employee',
    employeeId: employee?.id,
    hourlyRateCents: employee?.hourly_rate_cents ?? 0,
  })
  const { projects } = useProjects({
    enabled: Boolean(employee),
    employeeId: employee?.id,
  })

  const onSubmit = async (values: TimeEntryFormValues) => {
    const success = editingEntry
      ? await updateEntry(editingEntry.id, values)
      : await createEntry(values)
    if (!success) return

    setEditingEntry(null)
    setFormVersion((current) => current + 1)
  }

  const onEditEntry = (entry: (typeof entries)[number]) => {
    setEditingEntry({
      id: entry.id,
      values: {
        workDate: entry.work_date,
        startTime: entry.start_time,
        endTime: entry.end_time,
        description: entry.description ?? '',
        projectId: entry.project_id ?? '',
      },
      project: entry.project,
    })
  }

  const onDeleteEntry = async (id: string) => {
    const confirmed = window.confirm('Deseja realmente excluir este registro?')
    if (!confirmed) return
    await deleteEntry(id)
  }

  if (!employee) {
    if (manager) {
      return <Navigate to="/equipe" replace />
    }

    return <RegisterUnlinkedState />
  }

  const activeProjectOptions = projects
    .filter((project) => project.is_active)
    .map((project) => ({
      value: project.id,
      label: project.name,
    }))

  const editingProjectOption =
    editingEntry?.values.projectId &&
    !activeProjectOptions.some(
      (project) => project.value === editingEntry.values.projectId,
    )
      ? [
          {
            value: editingEntry.values.projectId,
            label: editingEntry.project?.name
              ? `${editingEntry.project.name} (arquivado)`
              : 'Projeto vinculado (arquivado)',
          },
        ]
      : []

  const projectOptions = [
    { value: '', label: 'Sem projeto' },
    ...editingProjectOption,
    ...activeProjectOptions,
  ]

  return (
    <section className="space-y-6">
      <RegisterEntryFormCard
        editingEntry={editingEntry}
        formVersion={formVersion}
        hourlyRateCents={employee.hourly_rate_cents}
        loading={loading}
        projectOptions={projectOptions}
        onSubmit={onSubmit}
        defaultValues={editingEntry?.values ?? defaultForm()}
        setEditingEntry={setEditingEntry}
        setFormVersion={setFormVersion}
      />

      <RegisterMiniBoard
        totalWeekHours={totalWeekHours}
        totalWeekAmountCents={totalWeekAmountCents}
        entries={entries}
        error={error}
        onEditEntry={onEditEntry}
        onDeleteEntry={onDeleteEntry}
      />
    </section>
  )
}
