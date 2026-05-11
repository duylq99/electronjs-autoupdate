const TECH_LABELS = [
  'Electron.js',
  'React 18',
  'TypeScript',
  'Tailwind CSS',
  'shadcn/ui',
  'electron-updater',
  'GitHub Releases',
  'Vite',
  'electron-builder',
  'Auto-Update'
]

export function MarqueeStrip(): JSX.Element {
  const repeated = [...TECH_LABELS, ...TECH_LABELS, ...TECH_LABELS]

  return (
    <div className="h-9 bg-inverse-canvas overflow-hidden flex items-center">
      <div
        className="flex items-center gap-xxl whitespace-nowrap"
        style={{
          animation: 'marquee 24s linear infinite'
        }}
      >
        {repeated.map((label, i) => (
          <span key={i} className="caption text-inverse-ink opacity-80">
            {label}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  )
}
