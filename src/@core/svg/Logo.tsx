// React Imports
import type { SVGAttributes } from 'react'

const Logo = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg width='1.5em' height='1.5em' viewBox='0 0 36 36' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <defs>
        <linearGradient id="brandGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3C50E0"/>
          <stop offset="100%" stopColor="#8B5CF6"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="36" height="36" rx="10" fill="url(#brandGrad)"/>
      <path d="M12 14C12 10.6863 14.6863 8 18 8C21.3137 8 24 10.6863 24 14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M8 14C8 12.8954 8.89543 12 10 12H26C27.1046 12 28 12.8954 28 14V25C28 26.6569 26.6569 28 25 28H11C9.34315 28 8 26.6569 8 25V14Z" fill="white"/>
      <path d="M18 15.5L19.2 18.2L22 19.5L19.2 20.8L18 23.5L16.8 20.8L14 19.5L16.8 18.2L18 15.5Z" fill="#3C50E0"/>
    </svg>
  )
}

export default Logo
