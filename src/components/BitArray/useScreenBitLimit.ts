import { useEffect, useState } from 'react'

export function useScreenBitLimit(): number {
  const [limit, setLimit] = useState<number>(Infinity)
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      setLimit(w < 640 ? 64 : w < 1024 ? 128 : Infinity)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return limit
}
