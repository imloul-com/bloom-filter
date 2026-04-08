// Collection of named hash functions
// Each takes (str: string, seed: number, size: number) => index

/** Map hash output to [0, size). JS % keeps the dividend's sign; XOR/bit ops can leave h negative as a signed int. */
function toSlot(h, size) {
  return (h >>> 0) % size
}

/** 32-bit value before `% m` (for UI). Seed is per-function index: `i * 1327` from getHashes. */
function djb2Raw(str, seed) {
  let h = (5381 ^ seed) >>> 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(h, 33) ^ str.charCodeAt(i)) >>> 0
  }
  return h >>> 0
}

function fnv1aRaw(str, seed) {
  let h = (2166136261 ^ seed) >>> 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(h ^ str.charCodeAt(i), 16777619)) >>> 0
  }
  return h >>> 0
}

function sdbmRaw(str, seed) {
  let h = seed >>> 0
  for (let i = 0; i < str.length; i++) {
    h = (str.charCodeAt(i) + Math.imul(h, 65599) + (h << 6) + (h << 16)) >>> 0
  }
  return h >>> 0
}

function murmur3Raw(str, seed) {
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

function crc32Raw(str, seed) {
  let crc = (0xffffffff ^ seed) >>> 0
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i)
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

function jenkinsRaw(str, seed) {
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

const RAW_BY_NAME = {
  djb2: djb2Raw,
  fnv1a: fnv1aRaw,
  sdbm: sdbmRaw,
  murmur3: murmur3Raw,
  crc32: crc32Raw,
  jenkins: jenkinsRaw,
}

/**
 * Unsigned 32-bit hash before modulo m (same pipeline as HASH_FUNCTIONS).
 * @param {string} name — key in HASH_FUNCTIONS
 * @param {string} word
 * @param {number} seedIndex — hash column index `i` (seed = i * 1327)
 */
export function rawHashBeforeMod(name, word, seedIndex) {
  const raw = RAW_BY_NAME[name]
  if (!raw) return 0
  return raw(word, seedIndex * 1327)
}

export const HASH_FUNCTIONS = {
  djb2: (str, seed, size) => toSlot(djb2Raw(str, seed), size),
  fnv1a: (str, seed, size) => toSlot(fnv1aRaw(str, seed), size),
  sdbm: (str, seed, size) => toSlot(sdbmRaw(str, seed), size),
  murmur3: (str, seed, size) => toSlot(murmur3Raw(str, seed), size),
  crc32: (str, seed, size) => toSlot(crc32Raw(str, seed), size),
  jenkins: (str, seed, size) => toSlot(jenkinsRaw(str, seed), size),
}

export const HASH_NAMES = Object.keys(HASH_FUNCTIONS)

export const HASH_COLORS = [
  { key: 'h1', color: 'var(--h1)', bg: 'var(--h1-bg)', border: 'var(--h1-border)', glow: 'var(--h1-glow)' },
  { key: 'h2', color: 'var(--h2)', bg: 'var(--h2-bg)', border: 'var(--h2-border)', glow: 'var(--h2-glow)' },
  { key: 'h3', color: 'var(--h3)', bg: 'var(--h3-bg)', border: 'var(--h3-border)', glow: 'var(--h3-glow)' },
  { key: 'h4', color: 'var(--h4)', bg: 'var(--h4-bg)', border: 'var(--h4-border)', glow: 'var(--h4-glow)' },
  { key: 'h5', color: 'var(--h5)', bg: 'var(--h5-bg)', border: 'var(--h5-border)', glow: 'var(--h5-glow)' },
  { key: 'h6', color: 'var(--h6)', bg: 'var(--h6-bg)', border: 'var(--h6-border)', glow: 'var(--h6-glow)' },
]

export function getHashes(word, selectedHashes, size) {
  return selectedHashes.map((name, i) => {
    const fn = HASH_FUNCTIONS[name]
    return fn(word, i * 1327, size)
  })
}

/** Estimated FP rate above this is styled “severe” (red) in the UI. */
export const EST_FP_RATE_SEVERE = 0.1
/** Estimated FP rate above this is styled “moderate” (amber). */
export const EST_FP_RATE_MODERATE = 0.01

export function estimateFalsePositiveRate(n, m, k) {
  if (n === 0) return 0
  return Math.pow(1 - Math.exp(-k * n / m), k)
}

export function optimalK(m, n) {
  if (n === 0) return 3
  return Math.max(1, Math.round((m / n) * Math.LN2))
}
