// Supports both GitHub and GitLab depending on env vars.
// GitHub: set GH_TOKEN + (optional) GH_OWNER
// GitLab: set GITLAB_PROJECT_ID + GITLAB_TOKEN + (optional) GITLAB_BASE_URL

const isGitLab = !!process.env.GITLAB_PROJECT_ID
const gitlabBase = process.env.GITLAB_BASE_URL || 'https://gitlab.com'
const projectId = process.env.GITLAB_PROJECT_ID || ''

// GitLab Generic Package Registry — stable "latest" slot that gets overwritten each release.
// electron-updater (generic provider) fetches: {url}/latest.yml  then downloads installer from same base.
const gitlabUpdateUrl = `${gitlabBase}/api/v4/projects/${projectId}/packages/generic/electron-releases/latest`

/** @type {import('electron-builder').Configuration} */
module.exports = {
  appId: 'com.demo.electronjs-autoupdate',
  productName: 'AutoUpdate Demo',
  directories: {
    buildResources: 'build',
    output: 'release/${version}'
  },
  files: [
    '!**/.vscode/*',
    '!src/*',
    '!electron.vite.config.{js,ts,mjs,cjs}',
    '!{.eslintignore,.eslintrc.cjs,.prettierignore,.prettierrc.yaml,CHANGELOG.md,README.md}',
    '!{.env,.env.*,.npmrc,pnpm-lock.yaml}',
    '!{tsconfig.json,tsconfig.*}',
    '!docs/**',
    '!scripts/**'
  ],
  asarUnpack: ['resources/**'],

  win: {
    executableName: 'autoupdate-demo',
    target: [{ target: 'nsis', arch: ['x64'] }]
  },
  nsis: {
    artifactName: '${name}-${version}-setup.${ext}',
    shortcutName: '${productName}',
    uninstallDisplayName: '${productName}',
    createDesktopShortcut: 'always'
  },
  mac: {
    target: [{ target: 'dmg', arch: ['x64', 'arm64'] }]
  },
  dmg: {
    artifactName: '${name}-${version}.${ext}'
  },
  linux: {
    target: [{ target: 'AppImage', arch: ['x64'] }],
    maintainer: 'electronjs.org',
    category: 'Utility'
  },
  appImage: {
    artifactName: '${name}-${version}.${ext}'
  },
  npmRebuild: false,

  publish: isGitLab
    ? {
        // Generic provider → electron-updater reads app-update.yml at runtime
        provider: 'generic',
        url: gitlabUpdateUrl,
        channel: 'latest'
      }
    : {
        provider: 'github',
        owner: process.env.GH_OWNER || 'duylq1',
        repo: 'electronjs-autoupdate',
        releaseType: 'release'
      }
}
