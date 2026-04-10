import { useState, useCallback, useRef } from 'react'
import { getHashes, type HashFunctionName } from '@/utils/hashes'
import type { BloomAnimState, LookupResult } from '@/types/bloom'

function buildBitsFromItems(
  items: readonly string[],
  hashNames: readonly HashFunctionName[],
  m: number,
): { nextBits: number[]; nextOwners: Set<number>[] } {
  const nextBits = new Array<number>(m).fill(0)
  const nextOwners: Set<number>[] = Array.from({ length: m }, () => new Set<number>())
  for (const word of items) {
    const indices = getHashes(word, hashNames, m)
    for (let i = 0; i < hashNames.length; i++) {
      const idx = indices[i]
      if (idx === undefined) continue
      nextBits[idx] = 1
      nextOwners[idx].add(i)
    }
  }
  return { nextBits, nextOwners }
}

function initialAnimState(): BloomAnimState {
  return {
    active: false,
    phase: null,
    word: '',
    hashIdx: -1,
    indices: [],
    probingIdx: -1,
  }
}

export interface UseBloomFilterReturn {
  size: number
  selectedHashes: HashFunctionName[]
  bits: number[]
  bitOwners: Set<number>[]
  insertedItems: string[]
  animState: BloomAnimState
  bitLayoutEpoch: number
  insert: (word: string, speed?: number) => Promise<void>
  lookup: (word: string, speed?: number) => Promise<LookupResult | null>
  resetFilter: (newSize?: number, newHashes?: HashFunctionName[]) => void
  updateSize: (newSize: number) => void
  updateHashes: (newHashes: HashFunctionName[]) => void
}

export function useBloomFilter(
  initialSize = 32,
  initialHashNames: HashFunctionName[] = ['djb2', 'fnv1a', 'sdbm'],
): UseBloomFilterReturn {
  const [size, setSize] = useState(initialSize)
  const [selectedHashes, setSelectedHashes] = useState<HashFunctionName[]>(initialHashNames)
  const [bits, setBits] = useState(() => new Array<number>(initialSize).fill(0))
  const [bitOwners, setBitOwners] = useState<Set<number>[]>(() =>
    Array.from({ length: initialSize }, () => new Set<number>()),
  )
  const [insertedItems, setInsertedItems] = useState<string[]>([])
  const [animState, setAnimState] = useState<BloomAnimState>(initialAnimState)
  /** Bumped on `updateSize` / `updateHashes` so bit cells remount without insert-style pop animations. */
  const [bitLayoutEpoch, setBitLayoutEpoch] = useState(0)

  const isAnimating = useRef(false)

  const resetFilter = useCallback(
    (newSize?: number, _newHashes?: HashFunctionName[]) => {
      const s = newSize ?? size
      setBits(new Array(s).fill(0))
      setBitOwners(Array.from({ length: s }, () => new Set<number>()))
      setInsertedItems([])
      setAnimState(initialAnimState())
      isAnimating.current = false
    },
    [size],
  )

  const updateSize = useCallback(
    (newSize: number) => {
      if (newSize === size || isAnimating.current) return
      const { nextBits, nextOwners } = buildBitsFromItems(insertedItems, selectedHashes, newSize)
      setSize(newSize)
      setBits(nextBits)
      setBitOwners(nextOwners)
      setBitLayoutEpoch(e => e + 1)
      setAnimState(initialAnimState())
      isAnimating.current = false
    },
    [size, selectedHashes, insertedItems],
  )

  const updateHashes = useCallback(
    (newHashes: HashFunctionName[]) => {
      if (isAnimating.current) return
      const unchanged =
        newHashes.length === selectedHashes.length &&
        newHashes.every((h, i) => h === selectedHashes[i])
      if (unchanged) return
      const { nextBits, nextOwners } = buildBitsFromItems(insertedItems, newHashes, size)
      setSelectedHashes(newHashes)
      setBits(nextBits)
      setBitOwners(nextOwners)
      setBitLayoutEpoch(e => e + 1)
      setAnimState(initialAnimState())
      isAnimating.current = false
    },
    [size, selectedHashes, insertedItems],
  )

  const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

  const insert = useCallback(
    async (word: string, speed = 1) => {
      if (isAnimating.current) return
      isAnimating.current = true

      const indices = getHashes(word, selectedHashes, size)
      const delay = Math.round(600 / speed)

      setAnimState({
        active: true,
        phase: 'hashing',
        word,
        hashIdx: -1,
        indices,
        probingIdx: -1,
      })
      await sleep(delay * 0.4)

      for (let i = 0; i < selectedHashes.length; i++) {
        const idx = indices[i]
        if (idx === undefined) continue

        setAnimState(s => ({ ...s, phase: 'hashing', hashIdx: i }))
        await sleep(delay)

        setAnimState(s => ({ ...s, phase: 'setting', hashIdx: i }))
        setBits(prev => {
          const next = [...prev]
          next[idx] = 1
          return next
        })
        setBitOwners(prev => {
          const next = prev.map(set => new Set(set))
          const cell = next[idx]
          if (cell) cell.add(i)
          return next
        })
        await sleep(delay * 0.7)
      }

      setInsertedItems(prev => (prev.includes(word) ? prev : [...prev, word]))
      setAnimState({
        active: false,
        phase: 'done',
        word,
        hashIdx: -1,
        indices,
        probingIdx: -1,
      })
      isAnimating.current = false
    },
    [selectedHashes, size],
  )

  const lookup = useCallback(
    async (word: string, speed = 1) => {
      if (isAnimating.current) return null
      isAnimating.current = true

      const indices = getHashes(word, selectedHashes, size)
      const delay = Math.round(600 / speed)
      let allSet = true

      setAnimState({
        active: true,
        phase: 'probing',
        word,
        hashIdx: -1,
        indices,
        probingIdx: -1,
      })
      await sleep(delay * 0.4)

      for (let i = 0; i < selectedHashes.length; i++) {
        const idx = indices[i]
        if (idx === undefined) continue

        setAnimState(s => ({ ...s, phase: 'probing', hashIdx: i, probingIdx: i }))
        await sleep(delay)

        const bitVal = bits[idx]
        if (!bitVal) allSet = false
        setAnimState(s => ({
          ...s,
          phase: 'probe-result',
          hashIdx: i,
          probingIdx: i,
          probeHit: !!bitVal,
        }))
        await sleep(delay * 0.5)
      }

      const isDefinitelyIn = insertedItems.includes(word)
      let result: LookupResult
      if (allSet && isDefinitelyIn) result = 'found'
      else if (allSet && !isDefinitelyIn) result = 'false-positive'
      else result = 'not-found'

      setAnimState({
        active: false,
        phase: 'lookup-done',
        word,
        hashIdx: -1,
        indices,
        probingIdx: -1,
        result,
      })
      isAnimating.current = false
      return result
    },
    [selectedHashes, size, bits, insertedItems],
  )

  return {
    size,
    selectedHashes,
    bits,
    bitOwners,
    insertedItems,
    animState,
    bitLayoutEpoch,
    insert,
    lookup,
    resetFilter,
    updateSize,
    updateHashes,
  }
}
