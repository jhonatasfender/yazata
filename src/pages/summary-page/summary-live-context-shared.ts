import { createContext, type Dispatch } from 'react'
import type { SummaryLiveAction, SummaryLiveState } from './summary-live-reducer'

export type SummaryLiveContextValue = {
  state: SummaryLiveState
  dispatch: Dispatch<SummaryLiveAction>
}

export const SummaryLiveContext = createContext<SummaryLiveContextValue | null>(null)
