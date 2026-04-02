import { timeStringToTotalSeconds } from './time'

export type TimeEntryIntervalRow = {
  id: string
  work_date: string
  start_time: string
  end_time: string
}

const intervalsOverlapSeconds = (
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
) => aStart < bEnd && bStart < aEnd

export const findTimeEntryOverlap = (
  entries: TimeEntryIntervalRow[],
  workDate: string,
  startTime: string,
  endTime: string,
  excludeEntryId?: string | null,
): TimeEntryIntervalRow | null => {
  const newStart = timeStringToTotalSeconds(startTime)
  const newEnd = timeStringToTotalSeconds(endTime)
  if (newStart === null || newEnd === null || newEnd <= newStart) return null

  for (const entry of entries) {
    if (entry.work_date !== workDate) continue
    if (excludeEntryId && entry.id === excludeEntryId) continue

    const oStart = timeStringToTotalSeconds(entry.start_time)
    const oEnd = timeStringToTotalSeconds(entry.end_time)
    if (oStart === null || oEnd === null || oEnd <= oStart) continue

    if (intervalsOverlapSeconds(newStart, newEnd, oStart, oEnd)) {
      return entry
    }
  }

  return null
}

export const collectRegisterEntryTimeIssueIds = (
  entries: TimeEntryIntervalRow[],
): Set<string> => {
  const ids = new Set<string>()

  for (const entry of entries) {
    const s = timeStringToTotalSeconds(entry.start_time)
    const e = timeStringToTotalSeconds(entry.end_time)
    if (s === null || e === null || e <= s) {
      ids.add(entry.id)
    }
  }

  const byDate = new Map<string, TimeEntryIntervalRow[]>()
  for (const entry of entries) {
    const list = byDate.get(entry.work_date)
    if (list) list.push(entry)
    else byDate.set(entry.work_date, [entry])
  }

  for (const list of byDate.values()) {
    const parsed = list
      .map((row) => ({
        row,
        start: timeStringToTotalSeconds(row.start_time),
        end: timeStringToTotalSeconds(row.end_time),
      }))
      .filter(
        (p): p is typeof p & { start: number; end: number } =>
          p.start !== null && p.end !== null && p.end > p.start,
      )

    for (let i = 0; i < parsed.length; i++) {
      for (let j = i + 1; j < parsed.length; j++) {
        const a = parsed[i]!
        const b = parsed[j]!
        if (intervalsOverlapSeconds(a.start, a.end, b.start, b.end)) {
          ids.add(a.row.id)
          ids.add(b.row.id)
        }
      }
    }
  }

  return ids
}

export type TimeEntryIntervalWithContract = TimeEntryIntervalRow & {
  employment_contract_id: string
}

export const collectTimeEntryIssueIdsByEmploymentContract = (
  entries: TimeEntryIntervalWithContract[],
): Set<string> => {
  const byContract = new Map<string, TimeEntryIntervalRow[]>()

  for (const entry of entries) {
    const cid = entry.employment_contract_id?.trim()
    if (!cid) continue

    const row: TimeEntryIntervalRow = {
      id: entry.id,
      work_date: entry.work_date,
      start_time: entry.start_time,
      end_time: entry.end_time,
    }
    const list = byContract.get(cid)
    if (list) list.push(row)
    else byContract.set(cid, [row])
  }

  const out = new Set<string>()
  for (const list of byContract.values()) {
    for (const id of collectRegisterEntryTimeIssueIds(list)) {
      out.add(id)
    }
  }
  return out
}
