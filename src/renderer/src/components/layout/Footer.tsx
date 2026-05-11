import { GitBranch, ExternalLink } from 'lucide-react'

export function Footer(): JSX.Element {
  return (
    <footer className="bg-canvas border-t border-hairline">
      <div className="max-w-content mx-auto px-lg py-section">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-xl">
          <div className="col-span-2 md:col-span-1">
            <p className="font-sans font-[540] text-ink leading-none mb-lg" style={{ fontSize: '32px' }}>
              Demo
            </p>
            <p className="font-sans text-body-sm font-[320] text-ink opacity-60 max-w-[200px]">
              Electron auto-update via GitHub Releases.
            </p>
          </div>

          {[
            {
              heading: 'Resources',
              links: ['electron-updater', 'electron-builder', 'electron-vite']
            },
            {
              heading: 'Design',
              links: ['DESIGN.md', 'Tailwind CSS', 'shadcn/ui']
            },
            {
              heading: 'Links',
              links: ['GitHub', 'Releases', 'Issues']
            }
          ].map(({ heading, links }) => (
            <div key={heading}>
              <p className="caption text-ink opacity-40 mb-md">{heading}</p>
              <ul className="flex flex-col gap-sm">
                {links.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="flex items-center gap-xs font-sans text-body-sm font-[320] text-ink hover:opacity-60 transition-opacity group"
                    >
                      {item}
                      <ExternalLink size={10} strokeWidth={1.5} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-section pt-lg border-t border-hairline-soft flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
          <p className="caption text-ink opacity-40">© 2026 AutoUpdate Demo. Built with Electron.js.</p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-xs caption text-ink opacity-40 hover:opacity-70 transition-opacity"
          >
            <GitBranch size={13} strokeWidth={1.5} />
            View on GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}
