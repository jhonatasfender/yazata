import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import type { AppLayoutContext } from '../components/app-layout'
import { useProjects } from '../hooks/use-projects'
import { useTimeEntries } from '../hooks/use-time-entries'
import { confirmDialog } from '../lib/dialog'
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

const toLocalDate = (value: Date) => {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const toLocalTime = (value: Date, includeSeconds = false) => {
  const hours = String(value.getHours()).padStart(2, '0')
  const minutes = String(value.getMinutes()).padStart(2, '0')
  if (!includeSeconds) return `${hours}:${minutes}`
  const seconds = String(value.getSeconds()).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

const QUICK_ENTRY_STORAGE_KEY = 'tracker.quick-entry'

const formatElapsedTime = (elapsedMs: number) => {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export const RegisterPage = () => {
  const { manager, employee, activeWorkspaceContext } =
    useOutletContext<AppLayoutContext>()
  const [formVersion, setFormVersion] = useState(0)
  const [editingEntry, setEditingEntry] = useState<EditingEntry | null>(null)
  const [quickEntryStartedAt, setQuickEntryStartedAt] = useState<string | null>(null)
  const [quickEntryId, setQuickEntryId] = useState<string | null>(null)
  const [currentTimeMs, setCurrentTimeMs] = useState<number | null>(null)
  const quickEntryPersistRef = useRef({ description: '', projectId: '' })
  const {
    entries,
    loading,
    error,
    createEntry,
    createEntryAndGetId,
    updateEntry,
    deleteEntry,
    totalWeekHours,
    totalWeekAmountCents,
  } = useTimeEntries({
    enabled: Boolean(employee),
    mode: 'employee',
    employmentContractId: employee?.id,
    hourlyRateCents: employee?.hourly_rate_cents ?? 0,
  })
  const { projects } = useProjects({
    enabled: Boolean(employee),
    employmentContractId: employee?.id,
  })

  useEffect(() => {
    if (!employee) return

    const raw = window.localStorage.getItem(QUICK_ENTRY_STORAGE_KEY)
    if (!raw) return

    try {
      const parsed = JSON.parse(raw) as {
        employeeId?: string
        id?: string
        startedAt?: string
      }
      if (parsed.employeeId !== employee.id || !parsed.id || !parsed.startedAt) return

      setQuickEntryId(parsed.id)
      setQuickEntryStartedAt(parsed.startedAt)
    } catch {
      window.localStorage.removeItem(QUICK_ENTRY_STORAGE_KEY)
    }
  }, [employee])

  useEffect(() => {
    if (!employee || !quickEntryStartedAt || !quickEntryId) return

    window.localStorage.setItem(
      QUICK_ENTRY_STORAGE_KEY,
      JSON.stringify({
        employeeId: employee.id,
        id: quickEntryId,
        startedAt: quickEntryStartedAt,
      }),
    )
  }, [employee, quickEntryId, quickEntryStartedAt])

  useEffect(() => {
    if (!quickEntryStartedAt) return

    setCurrentTimeMs(Date.now())
    const timer = window.setInterval(() => {
      setCurrentTimeMs(Date.now())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [quickEntryStartedAt])

  const resetQuickEntry = () => {
    setQuickEntryId(null)
    setQuickEntryStartedAt(null)
    setCurrentTimeMs(null)
    quickEntryPersistRef.current = { description: '', projectId: '' }
    window.localStorage.removeItem(QUICK_ENTRY_STORAGE_KEY)
  }

  const quickEntryElapsedLabel = useMemo(() => {
    if (!quickEntryStartedAt || !currentTimeMs) return null
    const startedAtMs = new Date(quickEntryStartedAt).getTime()
    if (Number.isNaN(startedAtMs)) return null
    return formatElapsedTime(currentTimeMs - startedAtMs)
  }, [currentTimeMs, quickEntryStartedAt])

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
    const confirmed = await confirmDialog({
      title: 'Excluir registro',
      text: 'Deseja realmente excluir este registro?',
      confirmButtonText: 'Excluir',
    })
    if (!confirmed) return
    await deleteEntry(id)
  }

  const onStartQuickEntry = async (draft?: TimeEntryFormValues) => {
    if (loading || quickEntryStartedAt || quickEntryId) return

    const snapshot = editingEntry ? (draft ?? editingEntry.values) : null

    if (editingEntry) {
      setEditingEntry(null)
      setFormVersion((current) => current + 1)
    }

    quickEntryPersistRef.current =
      snapshot !== null
        ? {
            description: snapshot.description?.trim() ?? '',
            projectId: snapshot.projectId ?? '',
          }
        : { description: '', projectId: '' }

    const descriptionForCreate =
      snapshot !== null
        ? quickEntryPersistRef.current.description
        : 'Registro rápido em andamento'

    const startDate = new Date()
    const startedAtIso = startDate.toISOString()
    const startTime = toLocalTime(startDate, true)
    const oneSecondAfterStart = new Date(startDate.getTime() + 1_000)

    setQuickEntryStartedAt(startedAtIso)

    const entryId = await createEntryAndGetId({
      workDate: toLocalDate(startDate),
      startTime,
      endTime: toLocalTime(oneSecondAfterStart, true),
      description: descriptionForCreate,
      projectId: quickEntryPersistRef.current.projectId,
    })

    if (!entryId) {
      resetQuickEntry()
      return
    }

    setQuickEntryId(entryId)
  }

  const onStopQuickEntry = async () => {
    if (!quickEntryStartedAt || !quickEntryId || loading) return

    const startDate = new Date(quickEntryStartedAt)
    const endDate = new Date()
    const workDate = toLocalDate(startDate)
    const startTime = toLocalTime(startDate, true)
    let endTime = toLocalTime(endDate, true)

    if (toLocalDate(endDate) !== workDate) {
      endTime = '23:59:59'
    }

    if (endTime <= startTime) {
      const oneSecondAfterStart = new Date(startDate.getTime() + 1_000)
      endTime = toLocalTime(oneSecondAfterStart, true)
    }

    if (endTime <= startTime) {
      endTime = '23:59:59'
    }

    const success = await updateEntry(quickEntryId, {
      workDate,
      startTime,
      endTime,
      description: quickEntryPersistRef.current.description,
      projectId: quickEntryPersistRef.current.projectId,
    })

    if (success) {
      resetQuickEntry()
    }
  }

  if (employee && activeWorkspaceContext === 'manager') {
    return (
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="text-lg font-semibold">Employee workspace required</h2>
        <p className="mt-2 text-zinc-300">
          You are in <span className="font-medium text-zinc-100">Manager</span> workspace.
          Use the header to switch to{' '}
          <span className="font-medium text-zinc-100">Employee</span> to register time.
        </p>
      </section>
    )
  }

  if (!employee) {
    if (manager) {
      return (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-lg font-semibold">No employee contract</h2>
          <p className="mt-2 text-zinc-300">
            You are not linked as an employee. You can still manage people from Employees.
          </p>
          <Link
            to="/employees"
            className="mt-4 inline-flex rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-medium text-zinc-100 hover:border-zinc-500"
          >
            Go to Employees
          </Link>
        </section>
      )
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
        quickEntryStartedAt={quickEntryStartedAt}
        quickEntryElapsedLabel={quickEntryElapsedLabel}
        onStartQuickEntry={onStartQuickEntry}
        onStopQuickEntry={onStopQuickEntry}
      />

      <RegisterMiniBoard
        totalWeekHours={totalWeekHours}
        totalWeekAmountCents={totalWeekAmountCents}
        entries={entries}
        error={error}
        activeEntryId={quickEntryId}
        activeEntryElapsedLabel={quickEntryElapsedLabel}
        onEditEntry={onEditEntry}
        onDeleteEntry={onDeleteEntry}
      />
    </section>
  )
}
