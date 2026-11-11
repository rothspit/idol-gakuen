'use client'

import { useState } from 'react'

type CastImageProps = {
  src: string
  alt: string
  className?: string
  fill?: boolean
}

export default function CastImage({ src, alt, className = '', fill }: CastImageProps) {
  const [failed, setFailed] = useState(false)
  const layoutClass = fill ? 'absolute inset-0 h-full w-full object-cover' : ''

  if (failed) {
    return (
      <div
        className={[
          layoutClass,
          'flex items-center justify-center bg-gradient-to-br from-pink-50 to-white text-xs text-pink-300 font-bold',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        No Image
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={[layoutClass, className].filter(Boolean).join(' ')}
    />
  )
}
