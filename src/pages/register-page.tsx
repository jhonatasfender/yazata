import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import type { AppLayoutContext } from '../components/app-layout'
import { useProjects } from '../hooks/use-projects'
import { useTimeEntries } from '../hooks/use-time-entries'
import { confirmDialog } from '../lib/dialog'
import type { TimeEntryFormValues } from '../schemas/time-entry-schema'
import {
  QUICK_ENTRY_IN_PROGRESS_DESCRIPTION,
  QUICK_ENTRY_MIN_FINALIZE_MS,
} from '../constants/quick-entry'
import { findTimeEntryOverlap } from '../utils/time-entry-overlap'
import { formatElapsedClock, today } from '../utils/time'
import { RegisterEntryFormCard } from './register/register-entry-form-card'
import { RegisterMiniBoard } from './register/register-mini-board'
import type { EditingEntry } from './register/register-types'
import { RegisterUnlinkedState } from './register/register-unlinked-state'
import {
  clearQuickEntryLocalState,
  pauseQuickEntryState,
  quickEntryElapsedMs,
  quickEntryPaused,
  readQuickEntryLocalStateForEmployee,
  resumeQuickEntryState,
  type QuickEntryLocalState,
  writeQuickEntryLocalState,
} from '../utils/quick-entry-local-state'

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

export const RegisterPage = () => {
  const { manager, employee, activeWorkspaceContext } =
    useOutletContext<AppLayoutContext>()
  const [formVersion, setFormVersion] = useState(0)
  const [editingEntry, setEditingEntry] = useState<EditingEntry | null>(null)
  const [quickEntryStartedAt, setQuickEntryStartedAt] = useState<string | null>(null)
  const [quickEntryId, setQuickEntryId] = useState<string | null>(null)
  const [quickEntryLocalState, setQuickEntryLocalState] =
    useState<QuickEntryLocalState | null>(null)
  const [currentTimeMs, setCurrentTimeMs] = useState<number | null>(null)
  const quickEntryPersistRef = useRef({ description: '', projectId: '' })
  const {
    entries,
    loading,
    error,
    setError,
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

  const syncQuickEntryFromStorage = () => {
    if (!employee) return
    const state = readQuickEntryLocalStateForEmployee(employee.id)
    if (!state) {
      setQuickEntryId(null)
      setQuickEntryStartedAt(null)
      setQuickEntryLocalState(null)
      return
    }

    setQuickEntryId(state.id)
    setQuickEntryStartedAt(state.startedAt)
    setQuickEntryLocalState(state)
  }

  useEffect(() => {
    syncQuickEntryFromStorage()
  }, [employee])

  useEffect(() => {
    if (!employee) return
    const onStorage = (e: StorageEvent) => {
      if (e.storageArea !== window.localStorage) return
      syncQuickEntryFromStorage()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [employee])

  useEffect(() => {
    if (!employee || !quickEntryLocalState) return
    if (quickEntryLocalState.employeeId !== employee.id) return
    writeQuickEntryLocalState(quickEntryLocalState)
  }, [employee, quickEntryLocalState])

  useEffect(() => {
    if (!quickEntryStartedAt || !quickEntryLocalState) return

    setCurrentTimeMs(Date.now())
    const timer = window.setInterval(() => {
      setCurrentTimeMs(Date.now())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [quickEntryLocalState, quickEntryStartedAt])

  const resetQuickEntry = () => {
    setQuickEntryId(null)
    setQuickEntryStartedAt(null)
    setQuickEntryLocalState(null)
    setCurrentTimeMs(null)
    quickEntryPersistRef.current = { description: '', projectId: '' }
    clearQuickEntryLocalState()
  }

  const quickEntryEffectiveElapsedMs = useMemo(() => {
    if (!quickEntryLocalState || !currentTimeMs) return 0
    return quickEntryElapsedMs(quickEntryLocalState, currentTimeMs)
  }, [currentTimeMs, quickEntryLocalState])

  const quickEntryElapsedLabel = useMemo(() => {
    if (!quickEntryLocalState || !currentTimeMs) return null
    return formatElapsedClock(quickEntryEffectiveElapsedMs)
  }, [quickEntryEffectiveElapsedMs, quickEntryLocalState, currentTimeMs])

  const quickEntryPausedActive = Boolean(
    quickEntryLocalState && quickEntryPaused(quickEntryLocalState),
  )

  const quickEntryCanFinalize =
    quickEntryEffectiveElapsedMs >= QUICK_ENTRY_MIN_FINALIZE_MS

  const quickEntryRemainingToFinalizeLabel = useMemo(() => {
    if (quickEntryCanFinalize) return null
    const remaining = Math.max(
      0,
      QUICK_ENTRY_MIN_FINALIZE_MS - quickEntryEffectiveElapsedMs,
    )
    return formatElapsedClock(remaining)
  }, [quickEntryCanFinalize, quickEntryEffectiveElapsedMs])

  const onPauseQuickEntry = () => {
    setQuickEntryLocalState((prev) => {
      if (!prev) return prev
      return pauseQuickEntryState(prev, Date.now())
    })
  }

  const onResumeQuickEntry = () => {
    setQuickEntryLocalState((prev) => {
      if (!prev) return prev
      return resumeQuickEntryState(prev, Date.now())
    })
  }

  const overlapErrorMessage =
    'Já existe outro registro neste dia que cruza esse intervalo de horários.'

  const afterSchemaValidate = (values: TimeEntryFormValues) => {
    const overlap = findTimeEntryOverlap(
      entries,
      values.workDate,
      values.startTime,
      values.endTime,
      editingEntry?.id ?? null,
    )
    if (!overlap) return undefined
    return { path: 'endTime' as const, message: overlapErrorMessage }
  }

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
    if (!employee || loading || quickEntryStartedAt || quickEntryId) return

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
        : QUICK_ENTRY_IN_PROGRESS_DESCRIPTION

    const startDate = new Date()
    const startMs = startDate.getTime()
    const startedAtIso = startDate.toISOString()
    const oneSecondAfterStart = new Date(startDate.getTime() + 1_000)
    const startWorkDate = toLocalDate(startDate)
    let startTime = toLocalTime(startDate, true)
    let endTime = toLocalTime(oneSecondAfterStart, true)

    if (toLocalDate(oneSecondAfterStart) !== startWorkDate) {
      startTime = '23:59:58'
      endTime = '23:59:59'
    }

    setQuickEntryStartedAt(startedAtIso)

    const entryId = await createEntryAndGetId({
      workDate: startWorkDate,
      startTime,
      endTime,
      description: descriptionForCreate,
      projectId: quickEntryPersistRef.current.projectId,
    })

    if (!entryId) {
      resetQuickEntry()
      return
    }

    setQuickEntryId(entryId)
    setQuickEntryLocalState({
      employeeId: employee.id,
      id: entryId,
      startedAt: startedAtIso,
      accumulatedRunningMs: 0,
      runningSinceMs: startMs,
    })
  }

  const onStopQuickEntry = async () => {
    if (!quickEntryStartedAt || !quickEntryId || loading) return

    if (!quickEntryCanFinalize) {
      setError(
        `Para evitar registros muito curtos, é preciso acumular pelo menos 20 minutos no cronômetro (pausas não contam). Faltam ${quickEntryRemainingToFinalizeLabel ?? '00:00:00'}.`,
      )
      return
    }

    const startDate = new Date(quickEntryStartedAt)
    const nowMs = Date.now()
    const stateFromStorage = employee
      ? readQuickEntryLocalStateForEmployee(employee.id)
      : null
    const effectiveState =
      stateFromStorage && stateFromStorage.id === quickEntryId
        ? stateFromStorage
        : quickEntryLocalState && quickEntryLocalState.id === quickEntryId
          ? quickEntryLocalState
          : null
    const elapsedFromTimer =
      effectiveState &&
      (!employee || effectiveState.employeeId === employee.id)
        ? quickEntryElapsedMs(effectiveState, nowMs)
        : null
    const endDate =
      elapsedFromTimer !== null
        ? new Date(startDate.getTime() + elapsedFromTimer)
        : new Date(nowMs)
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

    const overlap = findTimeEntryOverlap(
      entries,
      workDate,
      startTime,
      endTime,
      quickEntryId,
    )
    if (overlap) {
      setError(overlapErrorMessage)
      return
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
        afterSchemaValidate={afterSchemaValidate}
        defaultValues={editingEntry?.values ?? defaultForm()}
        setEditingEntry={setEditingEntry}
        setFormVersion={setFormVersion}
        quickEntryStartedAt={quickEntryStartedAt}
        quickEntryElapsedLabel={quickEntryElapsedLabel}
        quickEntryPaused={quickEntryPausedActive}
        quickEntryCanFinalize={quickEntryCanFinalize}
        quickEntryRemainingToFinalizeLabel={quickEntryRemainingToFinalizeLabel}
        onStartQuickEntry={onStartQuickEntry}
        onStopQuickEntry={onStopQuickEntry}
        onPauseQuickEntry={onPauseQuickEntry}
        onResumeQuickEntry={onResumeQuickEntry}
      />

      <RegisterMiniBoard
        totalWeekHours={totalWeekHours}
        totalWeekAmountCents={totalWeekAmountCents}
        entries={entries}
        error={error}
        activeEntryId={quickEntryId}
        activeEntryElapsedLabel={quickEntryElapsedLabel}
        activeEntryPaused={quickEntryPausedActive}
        onEditEntry={onEditEntry}
        onDeleteEntry={onDeleteEntry}
      />
    </section>
  )
}
