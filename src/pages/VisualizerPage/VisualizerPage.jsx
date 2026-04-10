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

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  )
  useEffect(() => {
    const handle = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handle)
    return () => window.removeEventListener('resize', handle)
  }, [])

  const isMobile = windowWidth < 640
  const isNarrow = windowWidth < 900
  const maxSize = windowWidth < 640 ? 64 : windowWidth < 1024 ? 128 : 512

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
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <header style={{
        padding: isMobile ? '12px 14px 0' : '20px 32px 0',
        maxWidth: 1100,
        width: '100%',
        margin: '0 auto',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap', minWidth: 0 }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: isMobile ? 22 : 28,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
            }}>
              Bloom Filter
            </h1>
            <span style={{
              fontSize: 13,
              color: 'var(--text-tertiary)',
              fontWeight: 400,
            }}>
              probabilistic membership · zero false negatives · tunable false positives
            </span>
          </div>
          <ThemeToggle />
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 10 }}>
          {selectedHashes.map((name, i) => {
            const col = HASH_COLORS[i % HASH_COLORS.length]
            return (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: col.color, display: 'inline-block' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: col.color }}>{name}</span>
              </div>
            )
          })}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--overlap-color)', display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--overlap-color)' }}>overlap</span>
          </div>
        </div>
      </header>

      <main style={{
        flex: 1,
        maxWidth: 1100,
        width: '100%',
        margin: '0 auto',
        padding: isMobile ? '12px 14px 32px' : isNarrow ? '16px 20px 32px' : '20px 32px 40px',
        display: 'grid',
        gridTemplateColumns: isNarrow ? '1fr' : '1fr 340px',
        gap: isMobile ? 14 : 20,
        alignItems: 'start',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
          }}>
            <input
              ref={inputRef}
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={handleKey}
              placeholder='Type a word… Enter to insert, Tab to look up'
              maxLength={64}
              disabled={isAnimating}
              style={{
                flex: 1,
                minWidth: 200,
                height: 44,
                padding: '0 16px',
                fontFamily: 'var(--font-mono)',
                fontSize: 15,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--border-strong)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
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

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try:</span>
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => { setInputVal(s); inputRef.current?.focus() }}
                disabled={isAnimating}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  padding: '3px 9px',
                  borderRadius: 4,
                  border: '1px solid var(--border-subtle)',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.1s',
                }}
                onMouseEnter={e => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.color = 'var(--text-secondary)' }}
                onMouseLeave={e => { e.target.style.borderColor = 'var(--border-subtle)'; e.target.style.color = 'var(--text-muted)' }}
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, ...(isNarrow ? {} : { position: 'sticky', top: 20 }) }}>
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

          <div style={{
            padding: '14px 16px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 10 }}>
              How it works
            </div>
            {[
              ['Insert', 'Run word through all k hash functions → set those bit positions to 1'],
              ['Look up', 'Check all k bit positions → if any is 0, definitely absent; if all 1, probably present'],
              ['False positive', 'All bits set by coincidence from other insertions — the core trade-off'],
              ['No false negatives', 'If a bit is 0, it was never set — guaranteed absence'],
            ].map(([t, d]) => (
              <div key={t} style={{ marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{t}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>— {d}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

    </div>
  )
}
