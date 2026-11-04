import React from 'react'

export default function LoadingSpinner({ size = 'md', text }) {
  const s = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }[size]
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className={`${s} border-3 border-slate-200 border-t-brand-500 rounded-full animate-spin`}
           style={{ borderWidth: 3 }} />
      {text && <p className="text-sm text-slate-500">{text}</p>}
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-brand-500 rounded-full animate-spin" />
        <p className="text-slate-500 font-medium">Loading…</p>
      </div>
    </div>
  )
}
