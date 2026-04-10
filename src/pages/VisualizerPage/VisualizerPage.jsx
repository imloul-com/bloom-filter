import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useBloomFilter } from '@/hooks/useBloomFilter'
import BitArray from '@/components/BitArray'
import HashSteps from '@/components/HashSteps'
import Settings from '@/components/Settings'
import StatsBar from '@/components/StatsBar'
import InsertedList from '@/components/InsertedList'
import ResultBanner from '@/components/ResultBanner'
import { HASH_COLORS } from '@/utils/hashes'
import { ThemeToggle } from './ThemeToggle.jsx'
import { SectionLabel } from './SectionLabel.jsx'
import { Btn } from './Btn.jsx'

const SUGGESTIONS = ['redis', 'bloom', 'filter', 'hash', 'apple', 'foo', 'bar', 'hello', 'world', 'bits']

export default function VisualizerPage() {
  const [inputVal, setInputVal] = useState('')
  const [animSpeed, setAnimSpeed] = useState(1)
  const [lastResult, setLastResult] = useState(null)
  const [lastWord, setLastWord] = useState('')
  const inputRef = useRef(null)

  const [maxSize, setMaxSize] = useState(512)
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      setMaxSize(w < 640 ? 64 : w < 1024 ? 128 : 512)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const {
    size, selectedHashes, bits, bitOwners, insertedItems,
    animState,
    bitLayoutEpoch,
    insert, lookup, resetFilter,
    updateSize, updateHashes,
  } = useBloomFilter(64, ['djb2', 'fnv1a', 'sdbm'])

  useEffect(() => {
    if (size > maxSize) updateSize(maxSize)
  }, [maxSize]) // eslint-disable-line react-hooks/exhaustive-deps

  const enrichedAnimState = { ...animState, size, probeResults: {} }

  const handleInsert = useCallback(async () => {
    const word = inputVal.trim()
    if (!word) return
    setInputVal('')
    setLastResult(null)
    setLastWord(word)
    await insert(word, animSpeed)
  }, [inputVal, insert, animSpeed])

  const handleLookup = useCallback(async () => {
    const word = inputVal.trim()
    if (!word) return
    setInputVal('')
    setLastWord(word)
    setLastResult(null)
    const result = await lookup(word, animSpeed)
    setLastResult(result)
  }, [inputVal, lookup, animSpeed])

  const handleReset = () => {
    resetFilter()
    setLastResult(null)
    setLastWord('')
    setInputVal('')
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') handleInsert()
    if (e.key === 'Tab') { e.preventDefault(); handleLookup() }
  }

  const isAnimating = animState.active

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-base)] pt-4 sm:pt-6">
      <header className="mx-auto w-full max-w-[1100px] px-3.5 sm:px-8">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-baseline gap-4">
            <h1 className="font-display text-[22px] font-extrabold tracking-tight text-[var(--text-primary)] sm:text-[28px] sm:tracking-[-0.03em]">
              Bloom Filter
            </h1>
            <span className="text-[13px] font-normal text-[var(--text-tertiary)]">
              probabilistic membership · zero false negatives · tunable false positives
            </span>
          </div>
          <ThemeToggle />
        </div>
        <div className="mt-2.5 flex flex-wrap gap-3">
          {selectedHashes.map((name, i) => {
            const col = HASH_COLORS[i % HASH_COLORS.length]
            return (
              <div key={name} className="flex items-center gap-1.5">
                <span
                  className="inline-block size-2 rounded-sm"
                  style={{ background: col.color }}
                />
                <span className="font-mono text-[11px]" style={{ color: col.color }}>{name}</span>
              </div>
            )
          })}
          <div className="flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-sm bg-[var(--overlap-color)]" />
            <span className="font-mono text-[11px] text-[var(--overlap-color)]">overlap</span>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1100px] flex-1 grid-cols-1 items-start gap-3.5 px-3.5 pb-8 pt-3 min-[640px]:px-5 min-[640px]:pb-8 min-[640px]:pt-4 min-[900px]:grid-cols-[1fr_340px] min-[900px]:gap-5 min-[900px]:px-8 min-[900px]:pb-10 min-[900px]:pt-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <input
              ref={inputRef}
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type a word… Enter to insert, Tab to look up"
              maxLength={64}
              disabled={isAnimating}
              className="h-11 min-w-[200px] flex-1 rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 font-mono text-[15px] text-[var(--text-primary)] outline-none transition-[border-color] duration-150 focus:border-[var(--border-strong)]"
            />
            <Btn
              label="Insert"
              shortcut="↵"
              color="var(--h1)"
              bg="var(--h1-bg)"
              border="var(--h1-border)"
              onClick={handleInsert}
              disabled={isAnimating || !inputVal.trim()}
            />
            <Btn
              label="Look up"
              shortcut="⇥"
              color="var(--h2)"
              bg="var(--h2-bg)"
              border="var(--h2-border)"
              onClick={handleLookup}
              disabled={isAnimating || !inputVal.trim()}
            />
            <Btn
              label="Reset"
              color="var(--text-tertiary)"
              bg="transparent"
              border="var(--border-default)"
              onClick={handleReset}
              disabled={isAnimating}
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] uppercase tracking-wide text-[var(--text-muted)]">Try:</span>
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => { setInputVal(s); inputRef.current?.focus() }}
                disabled={isAnimating}
                className="cursor-pointer rounded border border-[var(--border-subtle)] bg-transparent px-2 py-0.5 font-mono text-[11px] text-[var(--text-muted)] transition-all duration-100 hover:border-[var(--border-default)] hover:text-[var(--text-secondary)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>

          <div>
            <SectionLabel>Bit array — {size} bits</SectionLabel>
            <BitArray
              bits={bits}
              bitOwners={bitOwners}
              animState={enrichedAnimState}
              size={size}
              layoutEpoch={bitLayoutEpoch}
            />
          </div>

          {!animState.active && (lastResult || animState.phase === 'lookup-done') && (
            <ResultBanner
              result={lastResult || animState.result}
              word={lastWord}
            />
          )}

          <StatsBar
            bits={bits}
            insertedItems={insertedItems}
            size={size}
            k={selectedHashes.length}
          />

          <InsertedList items={insertedItems} />
        </div>

        <div className="flex flex-col gap-4 min-[900px]:sticky min-[900px]:top-5">
          <div>
            <SectionLabel>Hash calculations</SectionLabel>
            <HashSteps
              animState={enrichedAnimState}
              selectedHashes={selectedHashes}
              word={animState.word || lastWord}
            />
          </div>

          <Settings
            size={size}
            maxSize={maxSize}
            selectedHashes={selectedHashes}
            onSizeChange={updateSize}
            onHashesChange={updateHashes}
            animSpeed={animSpeed}
            onSpeedChange={setAnimSpeed}
            insertedCount={insertedItems.length}
          />

          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3.5">
            <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--text-tertiary)]">
              How it works
            </div>
            {[
              ['Insert', 'Run word through all k hash functions → set those bit positions to 1'],
              ['Look up', 'Check all k bit positions → if any is 0, definitely absent; if all 1, probably present'],
              ['False positive', 'All bits set by coincidence from other insertions — the core trade-off'],
              ['No false negatives', 'If a bit is 0, it was never set — guaranteed absence'],
            ].map(([t, d]) => (
              <div key={t} className="mb-2 last:mb-0">
                <span className="font-mono text-[11px] font-semibold text-[var(--text-secondary)]">{t}</span>
                <span className="ml-1 text-[11px] text-[var(--text-muted)]">— {d}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
