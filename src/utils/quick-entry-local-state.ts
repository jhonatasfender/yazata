import { QUICK_ENTRY_STORAGE_KEY } from '../constants/quick-entry'

export type QuickEntryLocalState = {
  employeeId: string
  id: string
  startedAt: string
  accumulatedRunningMs: number
  runningSinceMs: number | null
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isValidQuickEntryCoreFields = (
  employeeId: string,
  id: string,
  startedAt: string,
): boolean => {
  if (!employeeId || !id || !startedAt) return false
  return !Number.isNaN(new Date(startedAt).getTime())
}

export const parseQuickEntryLocalState = (
  raw: string | null,
): QuickEntryLocalState | null => {
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) return null

    const employeeId = typeof parsed.employeeId === 'string' ? parsed.employeeId : ''
    const id = typeof parsed.id === 'string' ? parsed.id : ''
    const startedAt = typeof parsed.startedAt === 'string' ? parsed.startedAt : ''
    if (!isValidQuickEntryCoreFields(employeeId, id, startedAt)) {
      return null
    }

    let accumulatedRunningMs = 0
    if (
      typeof parsed.accumulatedRunningMs === 'number' &&
      Number.isFinite(parsed.accumulatedRunningMs)
    ) {
      accumulatedRunningMs = Math.max(0, Math.floor(parsed.accumulatedRunningMs))
    }

    let runningSinceMs: number | null = null
    if (parsed.runningSinceMs === null) {
      runningSinceMs = null
    } else if (
      typeof parsed.runningSinceMs === 'number' &&
      Number.isFinite(parsed.runningSinceMs)
    ) {
      runningSinceMs = Math.floor(parsed.runningSinceMs)
    } else {
      const legacyStart = new Date(startedAt).getTime()
      runningSinceMs = Number.isNaN(legacyStart) ? null : legacyStart
    }

    return {
      employeeId,
      id,
      startedAt,
      accumulatedRunningMs,
      runningSinceMs,
    }
  } catch {
    return null
  }
}

export const readQuickEntryLocalState = (): QuickEntryLocalState | null => {
  if (typeof window === 'undefined') return null
  return parseQuickEntryLocalState(window.localStorage.getItem(QUICK_ENTRY_STORAGE_KEY))
}

export const readQuickEntryLocalStateForEmployee = (
  employmentContractId: string | null | undefined,
): QuickEntryLocalState | null => {
  if (!employmentContractId) return null
  const state = readQuickEntryLocalState()
  if (!state || state.employeeId !== employmentContractId) return null
  return state
}

export const readQuickEntryLocalStateForEntry = (
  entryId: string,
  employmentContractId: string,
): QuickEntryLocalState | null => {
  const state = readQuickEntryLocalState()
  if (!state) return null
  if (state.id !== entryId) return null
  if (state.employeeId !== employmentContractId) return null
  return state
}

export const writeQuickEntryLocalState = (state: QuickEntryLocalState) => {
  window.localStorage.setItem(QUICK_ENTRY_STORAGE_KEY, JSON.stringify(state))
}

export const clearQuickEntryLocalState = () => {
  window.localStorage.removeItem(QUICK_ENTRY_STORAGE_KEY)
}

export const quickEntryElapsedMs = (
  state: QuickEntryLocalState,
  nowMs: number,
): number => {
  const base = state.accumulatedRunningMs
  if (state.runningSinceMs === null) return base
  return base + Math.max(0, nowMs - state.runningSinceMs)
}

export const quickEntryPaused = (state: QuickEntryLocalState): boolean =>
  state.runningSinceMs === null

export const pauseQuickEntryState = (
  state: QuickEntryLocalState,
  nowMs: number,
): QuickEntryLocalState => {
  if (state.runningSinceMs === null) return state
  return {
    ...state,
    accumulatedRunningMs:
      state.accumulatedRunningMs + Math.max(0, nowMs - state.runningSinceMs),
    runningSinceMs: null,
  }
}

export const resumeQuickEntryState = (
  state: QuickEntryLocalState,
  nowMs: number,
): QuickEntryLocalState => {
  if (state.runningSinceMs !== null) return state
  return {
    ...state,
    runningSinceMs: nowMs,
  }
}
