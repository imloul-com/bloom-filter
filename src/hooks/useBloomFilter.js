import { useState, useCallback, useRef } from 'react'
import { getHashes, HASH_NAMES } from '../utils/hashes'

export function useBloomFilter(initialSize = 32, initialHashNames = ['djb2', 'fnv1a', 'sdbm']) {
  const [size, setSize] = useState(initialSize)
  const [selectedHashes, setSelectedHashes] = useState(initialHashNames)
  const [bits, setBits] = useState(() => new Array(initialSize).fill(0))
  // bitOwners: array of sets — each bit tracks which hash-indices set it
  const [bitOwners, setBitOwners] = useState(() => new Array(initialSize).fill(null).map(() => new Set()))
  const [insertedItems, setInsertedItems] = useState([])
  const [animState, setAnimState] = useState({ active: false, phase: null, word: '', hashIdx: -1, indices: [], probingIdx: -1 })

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
    setSize(newSize)
    resetFilter(newSize, selectedHashes)
  }, [selectedHashes, resetFilter])

  const updateHashes = useCallback((newHashes) => {
    setSelectedHashes(newHashes)
    resetFilter(size, newHashes)
  }, [size, resetFilter])

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
    insert, lookup, resetFilter,
    updateSize, updateHashes,
  }
}
