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

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
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
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-xs">
          <a
            href="#features"
            onClick={() => onNavigate('home')}
            className="font-sans text-body-sm font-[320] text-ink hover:opacity-60 transition-opacity px-sm py-xs"
          >
            Features
          </a>
          <a
            href="#update"
            onClick={() => onNavigate('home')}
            className="font-sans text-body-sm font-[320] text-ink hover:opacity-60 transition-opacity px-sm py-xs"
          >
            Auto-Update
          </a>
          <button
            onClick={() => onNavigate('cms')}
            className={cn(
              'font-sans text-body-sm px-sm py-xs transition-all rounded-sm',
              activeView === 'cms'
                ? 'text-ink font-[480] bg-surface-soft'
                : 'text-ink font-[320] hover:opacity-60'
            )}
          >
            Release CMS
          </button>
        </nav>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-sm">
          <button
            className="btn-secondary flex items-center gap-xs"
            style={{ fontSize: '14px', padding: '5px 16px 7px' }}
            onClick={() => onNavigate('cms')}
          >
            <FolderOpen size={14} strokeWidth={1.5} />
            Manage Releases
          </button>
          <a
            href="#update"
            className="btn-primary flex items-center gap-xs"
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
