import React from 'react'
import clsx from 'clsx'

export function ComputingDots({ color }) {
  return (
    <span className="inline-flex items-center gap-[3px]">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className={clsx(
            'inline-block size-[5px] rounded-full animate-[dotBounce_0.9s_ease-in-out_infinite]',
            i === 0 && '[animation-delay:0s]',
            i === 1 && '[animation-delay:0.2s]',
            i === 2 && '[animation-delay:0.4s]',
          )}
          style={{ background: color }}
        />
      ))}
    </span>
  )
}
