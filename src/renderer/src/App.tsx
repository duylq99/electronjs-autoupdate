import { useState } from 'react'
import { FolderOpen, RefreshCw, Zap } from 'lucide-react'
import { TopNav } from '@/components/layout/TopNav'
import { MarqueeStrip } from '@/components/layout/MarqueeStrip'
import { ColorBlockSection } from '@/components/layout/ColorBlockSection'
import { Footer } from '@/components/layout/Footer'
import { UpdatePanel } from '@/components/UpdatePanel'
import { CmsPanel } from '@/components/CmsPanel'

type AppView = 'home' | 'cms'

export default function App(): JSX.Element {
  const [view, setView] = useState<AppView>('home')

  return (
    <div className="min-h-screen bg-canvas font-sans">
      <TopNav activeView={view} onNavigate={setView} />

      {view === 'cms' ? (
        /* ── CMS page ──────────────────────────────────────────── */
        <main className="pt-14">
          <div className="max-w-content mx-auto px-lg py-section">
            <CmsPanel />
          </div>
        </main>
      ) : (
        /* ── Home page ─────────────────────────────────────────── */
        <>
          {/* Hero */}
          <section className="pt-14">
            <div className="max-w-content mx-auto px-lg pt-section pb-section">
              <p className="eyebrow text-ink opacity-50 mb-xl">Electron.js Auto-Update Demo</p>
              <h1
                className="font-sans font-[340] text-ink mb-xl leading-none"
                style={{ fontSize: 'clamp(48px, 6.7vw, 86px)', letterSpacing: '-1.72px' }}
              >
                Ship updates.<br />
                Users get them<br />
                automatically.
              </h1>
              <p className="font-sans text-body-lg font-[330] text-ink opacity-70 max-w-xl mb-xxl" style={{ letterSpacing: '-0.14px' }}>
                A desktop app demonstrating seamless auto-update delivery via GitHub Releases using{' '}
                <code className="font-mono text-body font-[400] bg-surface-soft px-xs rounded-sm">electron-updater</code>,
                with a built-in Release CMS to manage assets from GitHub &amp; GitLab.
              </p>
              <div className="flex flex-wrap gap-sm">
                <a href="#update" className="btn-primary">Try Auto-Update</a>
                <button className="btn-secondary" onClick={() => setView('cms')}>
                  Open Release CMS
                </button>
              </div>
            </div>
          </section>

          {/* Marquee */}
          <MarqueeStrip />

          {/* How it works */}
          <section id="features" className="max-w-content mx-auto px-lg py-section">
            <p className="eyebrow text-ink opacity-50 mb-xl">How It Works</p>
            <h2
              className="font-sans font-[340] text-ink mb-xxl"
              style={{ fontSize: 'clamp(36px, 4.5vw, 64px)', letterSpacing: '-0.96px', lineHeight: '1.10' }}
            >
              Zero-friction<br />update delivery
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
              {[
                {
                  step: '01',
                  icon: FolderOpen,
                  title: 'Manage releases in CMS',
                  body: 'Create releases and upload installer files directly from the app — supports both GitHub and GitLab.'
                },
                {
                  step: '02',
                  icon: RefreshCw,
                  title: 'App checks for updates',
                  body: 'electron-updater polls the releases API to compare versions. Runs on startup or on demand.'
                },
                {
                  step: '03',
                  icon: Zap,
                  title: 'Download & install silently',
                  body: 'The update downloads in the background. One click installs it — no browser, no manual steps.'
                }
              ].map(({ step, icon: Icon, title, body }) => (
                <div key={step} className="bg-surface-soft rounded-lg p-lg">
                  <div className="flex items-center gap-sm mb-md">
                    <Icon size={16} strokeWidth={1.5} className="text-ink opacity-40" />
                    <p className="font-mono text-caption text-ink opacity-40 uppercase tracking-widest">{step}</p>
                  </div>
                  <h3 className="font-sans text-headline font-[540] text-ink mb-sm">{title}</h3>
                  <p className="font-sans text-body font-[320] text-ink opacity-70">{body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Auto-update panel — lime block */}
          <div className="max-w-content mx-auto px-lg pb-section">
            <ColorBlockSection color="lime" id="update">
              <p className="eyebrow text-ink opacity-60 mb-xl">Live Demo</p>
              <h2
                className="font-sans font-[340] text-ink mb-xxl"
                style={{ fontSize: 'clamp(32px, 3.5vw, 48px)', letterSpacing: '-0.64px', lineHeight: '1.15' }}
              >
                Check for updates right now
              </h2>
              <UpdatePanel />
            </ColorBlockSection>
          </div>

          {/* CMS teaser — mint block */}
          <div className="max-w-content mx-auto px-lg pb-section">
            <ColorBlockSection color="mint">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-xl">
                <div>
                  <p className="eyebrow text-ink opacity-60 mb-md">Release CMS</p>
                  <h2
                    className="font-sans font-[340] text-ink mb-md"
                    style={{ fontSize: 'clamp(28px, 3vw, 40px)', letterSpacing: '-0.48px', lineHeight: '1.15' }}
                  >
                    Manage files from<br />GitHub &amp; GitLab
                  </h2>
                  <p className="font-sans text-body font-[320] text-ink opacity-70 max-w-md">
                    Create releases, upload assets, and delete files — all from within the app. Supports both providers.
                  </p>
                </div>
                <button
                  className="btn-primary flex-shrink-0"
                  onClick={() => setView('cms')}
                >
                  Open Release CMS
                </button>
              </div>
            </ColorBlockSection>
          </div>

          {/* Tech stack — navy block */}
          <div className="max-w-content mx-auto px-lg pb-section" id="about">
            <ColorBlockSection color="navy">
              <p className="eyebrow text-inverse-ink opacity-50 mb-xl">Stack</p>
              <h2
                className="font-sans font-[340] text-inverse-ink mb-xxl"
                style={{ fontSize: 'clamp(32px, 3.5vw, 48px)', letterSpacing: '-0.64px', lineHeight: '1.15' }}
              >
                Built on solid foundations
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
                {[
                  { name: 'Electron 33', desc: 'Desktop runtime' },
                  { name: 'React 18', desc: 'UI layer' },
                  { name: 'TypeScript', desc: 'Type safety' },
                  { name: 'Vite + electron-vite', desc: 'Build tooling' },
                  { name: 'Tailwind CSS', desc: 'Styling' },
                  { name: 'shadcn/ui tokens', desc: 'Design system' },
                  { name: 'electron-updater', desc: 'Auto-update engine' },
                  { name: 'GitHub + GitLab', desc: 'Release providers' }
                ].map(({ name, desc }) => (
                  <div key={name} className="bg-canvas/10 rounded-md p-lg">
                    <p className="font-sans text-body-sm font-[480] text-inverse-ink mb-xxs">{name}</p>
                    <p className="font-sans text-caption font-[320] text-inverse-ink opacity-50">{desc}</p>
                  </div>
                ))}
              </div>
            </ColorBlockSection>
          </div>

          <Footer />
        </>
      )}
    </div>
  )
}
