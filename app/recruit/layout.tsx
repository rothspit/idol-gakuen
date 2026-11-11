import type { ReactNode } from 'react'
import { M_PLUS_Rounded_1c } from 'next/font/google'
import './recruit.css'

const rounded = M_PLUS_Rounded_1c({
  weight: ['400', '500', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
})

export default function RecruitLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${rounded.className} recruit-root`} data-theme="pop">
      {children}
    </div>
  )
}
