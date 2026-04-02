import { useContext } from 'react'
import { SummaryLiveContext } from './summary-live-context-shared'

export const useSummaryLive = () => {
  const ctx = useContext(SummaryLiveContext)
  if (!ctx) {
    throw new Error('useSummaryLive must be used within SummaryLiveProvider')
  }
  return ctx
}

export const useSummaryLiveNow = (): number => useSummaryLive().state.nowMs
