/** Rough object / bucket overhead per key in a typical hash set (e.g. V8 Set + string). */
export const HASH_SET_ENTRY_OVERHEAD_BYTES = 32

const textEncoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null

export function utf8ByteLength(str) {
  if (!textEncoder) return str.length
  return textEncoder.encode(str).length
}

/** Fixed footprint of the bit array only (m bits → ⌈m/8⌉ bytes). */
export function bloomBitArrayBytes(m) {
  return Math.ceil(m / 8)
}

/**
 * Estimated bytes if keys were stored in an exact-membership set:
 * UTF-8 encoding of each string + fixed overhead per entry.
 */
export function estimatedHashSetBytes(strings) {
  let payload = 0
  for (const s of strings) {
    payload += utf8ByteLength(s)
  }
  return payload + HASH_SET_ENTRY_OVERHEAD_BYTES * strings.length
}

export function formatBytes(n) {
  const v = Math.max(0, Math.round(n))
  if (v < 1024) return `${v} B`
  if (v < 1024 * 1024) return `${(v / 1024).toFixed(v < 10_240 ? 2 : 1)} KB`
  return `${(v / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * @returns {{ bloomBytes: number, hashSetBytes: number, savedBytes: number, savingsPct: number | null }}
 */
export function compareBloomVsHashSet(m, strings) {
  const bloomBytes = bloomBitArrayBytes(m)
  const hashSetBytes = estimatedHashSetBytes(strings)
  const savedBytes = hashSetBytes - bloomBytes
  const savingsPct = hashSetBytes > 0 ? (savedBytes / hashSetBytes) * 100 : null
  return { bloomBytes, hashSetBytes, savedBytes, savingsPct }
}
