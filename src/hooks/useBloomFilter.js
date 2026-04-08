import { useState, useCallback, useRef } from 'react'
import { getHashes } from '@/utils/hashes'

function buildBitsFromItems(items, hashNames, m) {
  const nextBits = new Array(m).fill(0)
  const nextOwners = new Array(m).fill(null).map(() => new Set())
  for (const word of items) {
    const indices = getHashes(word, hashNames, m)
    for (let i = 0; i < hashNames.length; i++) {
      const idx = indices[i]
      nextBits[idx] = 1
      nextOwners[idx].add(i)
    }
  }
  return { nextBits, nextOwners }
}

export function useBloomFilter(initialSize = 32, initialHashNames = ['djb2', 'fnv1a', 'sdbm']) {
  const [size, setSize] = useState(initialSize)
  const [selectedHashes, setSelectedHashes] = useState(initialHashNames)
  const [bits, setBits] = useState(() => new Array(initialSize).fill(0))
  // bitOwners: array of sets — each bit tracks which hash-indices set it
  const [bitOwners, setBitOwners] = useState(() => new Array(initialSize).fill(null).map(() => new Set()))
  const [insertedItems, setInsertedItems] = useState([])
  const [animState, setAnimState] = useState({ active: false, phase: null, word: '', hashIdx: -1, indices: [], probingIdx: -1 })
  /** Bumped on `updateSize` / `updateHashes` so bit cells remount without insert-style pop animations. */
  const [bitLayoutEpoch, setBitLayoutEpoch] = useState(0)

  const isAnimating = useRef(false)

  const resetFilter = useCallback((newSize, newHashes) => {
    const s = newSize ?? size
    const h = newHashes ?? selectedHashes
    setBits(new Array(s).fill(0))
    setBitOwners(new Array(s).fill(null).map(() => new Set()))
    setInsertedItems([])
    setAnimState({ active: false, phase: null, word: '', hashIdx: -1, indices: [], probingIdx: -1 })
    isAnimating.current = false
  }, [size, selectedHashes])

  const updateSize = useCallback((newSize) => {
    if (newSize === size || isAnimating.current) return
    const { nextBits, nextOwners } = buildBitsFromItems(insertedItems, selectedHashes, newSize)
    setSize(newSize)
    setBits(nextBits)
    setBitOwners(nextOwners)
    setBitLayoutEpoch(e => e + 1)
    setAnimState({ active: false, phase: null, word: '', hashIdx: -1, indices: [], probingIdx: -1 })
    isAnimating.current = false
  }, [size, selectedHashes, insertedItems])

  const updateHashes = useCallback((newHashes) => {
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
    setAnimState({ active: false, phase: null, word: '', hashIdx: -1, indices: [], probingIdx: -1 })
    isAnimating.current = false
  }, [size, selectedHashes, insertedItems])

  const sleep = (ms) => new Promise(r => setTimeout(r, ms))

  const insert = useCallback(async (word, speed = 1) => {
    if (isAnimating.current) return
    isAnimating.current = true

    const indices = getHashes(word, selectedHashes, size)
    const delay = Math.round(600 / speed)

    setAnimState({ active: true, phase: 'hashing', word, hashIdx: -1, indices, probingIdx: -1 })
    await sleep(delay * 0.4)

    // Animate each hash one by one
    for (let i = 0; i < selectedHashes.length; i++) {
      setAnimState(s => ({ ...s, phase: 'hashing', hashIdx: i }))
      await sleep(delay)

      // Set the bit
      setAnimState(s => ({ ...s, phase: 'setting', hashIdx: i }))
      setBits(prev => {
        const next = [...prev]
        next[indices[i]] = 1
        return next
      })
      setBitOwners(prev => {
        const next = prev.map(s => new Set(s))
        next[indices[i]].add(i)
        return next
      })
      await sleep(delay * 0.7)
    }

    setInsertedItems(prev => prev.includes(word) ? prev : [...prev, word])
    setAnimState({ active: false, phase: 'done', word, hashIdx: -1, indices, probingIdx: -1 })
    isAnimating.current = false
  }, [selectedHashes, size])

  const lookup = useCallback(async (word, speed = 1) => {
    if (isAnimating.current) return null
    isAnimating.current = true

    const indices = getHashes(word, selectedHashes, size)
    const delay = Math.round(600 / speed)
    let allSet = true

    setAnimState({ active: true, phase: 'probing', word, hashIdx: -1, indices, probingIdx: -1 })
    await sleep(delay * 0.4)

    for (let i = 0; i < selectedHashes.length; i++) {
      setAnimState(s => ({ ...s, phase: 'probing', hashIdx: i, probingIdx: i }))
      await sleep(delay)

      const bitVal = bits[indices[i]]
      if (!bitVal) { allSet = false }
      setAnimState(s => ({ ...s, phase: 'probe-result', hashIdx: i, probingIdx: i, probeHit: !!bitVal }))
      await sleep(delay * 0.5)
    }

    const isDefinitelyIn = insertedItems.includes(word)
    let result
    if (allSet && isDefinitelyIn) result = 'found'
    else if (allSet && !isDefinitelyIn) result = 'false-positive'
    else result = 'not-found'

    setAnimState({ active: false, phase: 'lookup-done', word, hashIdx: -1, indices, probingIdx: -1, result })
    isAnimating.current = false
    return result
  }, [selectedHashes, size, bits, insertedItems])

  return {
    size, selectedHashes, bits, bitOwners, insertedItems,
    animState,
    bitLayoutEpoch,
    insert, lookup, resetFilter,
    updateSize, updateHashes,
  }
}
