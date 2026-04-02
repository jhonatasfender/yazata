export type SummaryLiveState = {
  nowMs: number
}

export type SummaryLiveAction = { type: 'TICK' } | { type: 'SYNC'; nowMs: number }

export const summaryLiveReducer = (
  state: SummaryLiveState,
  action: SummaryLiveAction,
): SummaryLiveState => {
  switch (action.type) {
    case 'TICK':
      return { nowMs: Date.now() }
    case 'SYNC':
      return { nowMs: action.nowMs }
    default:
      return state
  }
}
