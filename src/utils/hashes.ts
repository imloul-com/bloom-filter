// Collection of named hash functions
// Each takes (str: string, seed: number, size: number) => index

type HashFn = (str: string, seed: number, size: number) => number

/** Map hash output to [0, size). JS % keeps the dividend's sign; XOR/bit ops can leave h negative as a signed int. */
function toSlot(h: number, size: number): number {
  return (h >>> 0) % size
}

/** 32-bit value before `% m` (for UI). Seed is per-function index: `i * 1327` from getHashes. */
function djb2Raw(str: string, seed: number): number {
  let h = (5381 ^ seed) >>> 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(h, 33) ^ str.charCodeAt(i)) >>> 0
  }
  return h >>> 0
}

function fnv1aRaw(str: string, seed: number): number {
  let h = (2166136261 ^ seed) >>> 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(h ^ str.charCodeAt(i), 16777619)) >>> 0
  }
  return h >>> 0
}

function sdbmRaw(str: string, seed: number): number {
  let h = seed >>> 0
  for (let i = 0; i < str.length; i++) {
    h = (str.charCodeAt(i) + Math.imul(h, 65599) + (h << 6) + (h << 16)) >>> 0
  }
  return h >>> 0
}

function murmur3Raw(str: string, seed: number): number {
  let h = seed >>> 0
  for (let i = 0; i < str.length; i++) {
    let k = str.charCodeAt(i)
    k = Math.imul(k, 0xcc9e2d51) >>> 0
    k = ((k << 15) | (k >>> 17)) >>> 0
    k = Math.imul(k, 0x1b873593) >>> 0
    h ^= k
    h = ((h << 13) | (h >>> 19)) >>> 0
    h = (Math.imul(h, 5) + 0xe6546b64) >>> 0
  }
  h ^= str.length
  h ^= h >>> 16
  h = Math.imul(h, 0x85ebca6b) >>> 0
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35) >>> 0
  h ^= h >>> 16
  return h >>> 0
}

function crc32Raw(str: string, seed: number): number {
  let crc = (0xffffffff ^ seed) >>> 0
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i)
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

function jenkinsRaw(str: string, seed: number): number {
  let h = seed >>> 0
  for (let i = 0; i < str.length; i++) {
    h += str.charCodeAt(i)
    h += h << 10
    h ^= h >>> 6
    h >>>= 0
  }
  h += h << 3
  h ^= h >>> 11
  h += h << 15
  return h >>> 0
}

export const HASH_FUNCTIONS = {
  djb2: (str: string, seed: number, size: number) => toSlot(djb2Raw(str, seed), size),
  fnv1a: (str: string, seed: number, size: number) => toSlot(fnv1aRaw(str, seed), size),
  sdbm: (str: string, seed: number, size: number) => toSlot(sdbmRaw(str, seed), size),
  murmur3: (str: string, seed: number, size: number) => toSlot(murmur3Raw(str, seed), size),
  crc32: (str: string, seed: number, size: number) => toSlot(crc32Raw(str, seed), size),
  jenkins: (str: string, seed: number, size: number) => toSlot(jenkinsRaw(str, seed), size),
} as const satisfies Record<string, HashFn>

export type HashFunctionName = keyof typeof HASH_FUNCTIONS

const RAW_BY_NAME: Record<HashFunctionName, (str: string, seed: number) => number> = {
  djb2: djb2Raw,
  fnv1a: fnv1aRaw,
  sdbm: sdbmRaw,
  murmur3: murmur3Raw,
  crc32: crc32Raw,
  jenkins: jenkinsRaw,
}

export const HASH_NAMES: HashFunctionName[] = Object.keys(HASH_FUNCTIONS) as HashFunctionName[]

export interface HashPalette {
  key: string
  color: string
  bg: string
  border: string
  glow: string
}

export const HASH_COLORS: readonly HashPalette[] = [
  { key: 'h1', color: 'var(--h1)', bg: 'var(--h1-bg)', border: 'var(--h1-border)', glow: 'var(--h1-glow)' },
  { key: 'h2', color: 'var(--h2)', bg: 'var(--h2-bg)', border: 'var(--h2-border)', glow: 'var(--h2-glow)' },
  { key: 'h3', color: 'var(--h3)', bg: 'var(--h3-bg)', border: 'var(--h3-border)', glow: 'var(--h3-glow)' },
  { key: 'h4', color: 'var(--h4)', bg: 'var(--h4-bg)', border: 'var(--h4-border)', glow: 'var(--h4-glow)' },
  { key: 'h5', color: 'var(--h5)', bg: 'var(--h5-bg)', border: 'var(--h5-border)', glow: 'var(--h5-glow)' },
  { key: 'h6', color: 'var(--h6)', bg: 'var(--h6-bg)', border: 'var(--h6-border)', glow: 'var(--h6-glow)' },
]

/**
 * Unsigned 32-bit hash before modulo m (same pipeline as HASH_FUNCTIONS).
 */
export function rawHashBeforeMod(
  name: HashFunctionName,
  word: string,
  seedIndex: number,
): number {
  const raw = RAW_BY_NAME[name]
  return raw(word, seedIndex * 1327)
}

export function getHashes(
  word: string,
  selectedHashes: readonly HashFunctionName[],
  size: number,
): number[] {
  return selectedHashes.map((name, i) => {
    const fn = HASH_FUNCTIONS[name]
    return fn(word, i * 1327, size)
  })
}

/** Estimated FP rate above this is styled “severe” (red) in the UI. */
export const EST_FP_RATE_SEVERE = 0.1
/** Estimated FP rate above this is styled “moderate” (amber). */
export const EST_FP_RATE_MODERATE = 0.01

export function estimateFalsePositiveRate(n: number, m: number, k: number): number {
  if (n === 0) return 0
  return Math.pow(1 - Math.exp(-k * n / m), k)
}

export function optimalK(m: number, n: number): number {
  if (n === 0) return 3
  return Math.max(1, Math.round((m / n) * Math.LN2))
}
