// Collection of named hash functions
// Each takes (str: string, seed: number, size: number) => index

export const HASH_FUNCTIONS = {
  djb2: (str, seed, size) => {
    let h = (5381 ^ seed) >>> 0
    for (let i = 0; i < str.length; i++) {
      h = (Math.imul(h, 33) ^ str.charCodeAt(i)) >>> 0
    }
    return h % size
  },

  fnv1a: (str, seed, size) => {
    let h = (2166136261 ^ seed) >>> 0
    for (let i = 0; i < str.length; i++) {
      h = (Math.imul(h ^ str.charCodeAt(i), 16777619)) >>> 0
    }
    return h % size
  },

  sdbm: (str, seed, size) => {
    let h = seed >>> 0
    for (let i = 0; i < str.length; i++) {
      h = (str.charCodeAt(i) + Math.imul(h, 65599) + (h << 6) + (h << 16)) >>> 0
    }
    return h % size
  },

  murmur3: (str, seed, size) => {
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
    return h % size
  },

  crc32: (str, seed, size) => {
    let crc = (0xffffffff ^ seed) >>> 0
    for (let i = 0; i < str.length; i++) {
      crc ^= str.charCodeAt(i)
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
      }
    }
    return ((crc ^ 0xffffffff) >>> 0) % size
  },

  jenkins: (str, seed, size) => {
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
    return (h >>> 0) % size
  },
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

export function estimateFalsePositiveRate(n, m, k) {
  if (n === 0) return 0
  return Math.pow(1 - Math.exp(-k * n / m), k)
}

export function optimalK(m, n) {
  if (n === 0) return 3
  return Math.max(1, Math.round((m / n) * Math.LN2))
}
