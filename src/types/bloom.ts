export type LookupResult = 'found' | 'false-positive' | 'not-found'

export type BloomAnimPhase =
  | null
  | 'hashing'
  | 'setting'
  | 'done'
  | 'probing'
  | 'probe-result'
  | 'lookup-done'

export interface BloomAnimState {
  active: boolean
  phase: BloomAnimPhase
  word: string
  hashIdx: number
  indices: number[]
  probingIdx: number
  probeHit?: boolean
  result?: LookupResult
}

/** UI extension: filter size and optional per-row probe flags for HashSteps. */
export interface BloomAnimStateView extends BloomAnimState {
  size: number
  probeResults: Record<number, boolean>
  bits?: number[]
}
