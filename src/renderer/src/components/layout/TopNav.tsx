import { useState, useEffect } from 'react'
import { Menu, X, LayoutGrid, RefreshCw, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

type AppView = 'home' | 'cms'

interface TopNavProps {
  activeView: AppView
  onNavigate: (view: AppView) => void
}

export function TopNav({ activeView, onNavigate }: TopNavProps): JSX.Element {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [version, setVersion] = useState('')

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    window.electronAPI?.getAppVersion().then(setVersion)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 h-14 bg-canvas transition-shadow duration-200',
        scrolled && 'shadow-[0_1px_0_0_var(--color-hairline)]'
      )}
    >
      <div className="max-w-content mx-auto h-full px-lg flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-xs hover:opacity-70 transition-opacity"
        >
          <LayoutGrid size={20} strokeWidth={1.5} className="text-ink" />
          <span className="font-sans font-[540] text-body text-ink tracking-tight">AutoUpdate Demo</span>
          {version && (
            <span className="font-mono text-caption font-[400] text-ink opacity-40 border border-hairline rounded-sm px-xxs py-[2px]">
              v{version}
            </span>
          )}
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-xxs">
          {[
            { label: 'Home', view: 'home' as const, href: undefined },
            { label: 'Auto-Update', view: 'home' as const, href: '#update' },
            { label: 'Release CMS', view: 'cms' as const, href: undefined },
          ].map(({ label, view, href }) => {
            const isActive = activeView === view && (label !== 'Auto-Update')
            return (
              <a
                key={label}
                href={href ?? '#'}
                onClick={(e) => { if (!href) e.preventDefault(); onNavigate(view) }}
                className={cn(
                  'relative font-sans text-body-sm px-sm py-xs rounded-sm transition-all select-none',
                  isActive
                    ? 'text-ink font-[500]'
                    : 'text-ink font-[320] opacity-50 hover:opacity-80'
                )}
              >
                {label}
                {isActive && (
                  <span className="absolute bottom-0 left-sm right-sm h-[2px] bg-ink rounded-full" />
                )}
              </a>
            )
          })}
        </nav>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-sm">
          <button
            className={cn(
              'flex items-center gap-xs font-sans text-body-sm font-[480] px-md border rounded-pill transition-all',
              activeView === 'cms'
                ? 'bg-ink text-canvas border-ink'
                : 'bg-canvas text-ink border-hairline hover:border-ink/50'
            )}
            style={{ fontSize: '14px', padding: '5px 16px 7px' }}
            onClick={() => onNavigate('cms')}
          >
            <FolderOpen size={14} strokeWidth={1.5} />
            Manage Releases
          </button>
          <a
            href="#update"
            className={cn(
              'flex items-center gap-xs font-sans text-body-sm font-[480] px-md border rounded-pill transition-all',
              activeView === 'home'
                ? 'bg-ink text-canvas border-ink hover:opacity-80'
                : 'bg-canvas text-ink border-hairline hover:border-ink/50'
            )}
            style={{ fontSize: '14px', padding: '6px 16px' }}
            onClick={() => onNavigate('home')}
          >
            <RefreshCw size={14} strokeWidth={2} />
            Check Updates
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-xs"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-14 left-0 right-0 bg-canvas border-t border-hairline px-lg py-lg flex flex-col gap-md shadow-lg">
          <a href="#features" className="font-sans text-body font-[320] text-ink" onClick={() => { onNavigate('home'); setMenuOpen(false) }}>Features</a>
          <a href="#update" className="font-sans text-body font-[320] text-ink" onClick={() => { onNavigate('home'); setMenuOpen(false) }}>Auto-Update</a>
          <button className="font-sans text-body font-[320] text-ink text-left" onClick={() => { onNavigate('cms'); setMenuOpen(false) }}>Release CMS</button>
          <div className="flex flex-col gap-sm pt-md border-t border-hairline">
            <button className="btn-secondary text-center" onClick={() => { onNavigate('cms'); setMenuOpen(false) }}>Manage Releases</button>
            <a href="#update" className="btn-primary text-center" onClick={() => { onNavigate('home'); setMenuOpen(false) }}>Check Updates</a>
          </div>
        </div>
      )}
    </header>
  )
}
