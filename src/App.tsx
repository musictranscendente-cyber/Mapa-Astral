import { useEffect, useMemo, useState } from 'react'
import { chartFromBirth, type Chart } from './astro/chart'
import { HOUSE_SYSTEMS } from './astro/houses'
import { Starfield } from './components/Starfield'
import { useProfiles, useSettings } from './lib/profiles'
import { Home } from './pages/Home'
import { NatalPage } from './pages/NatalPage'
import { SkyPage } from './pages/SkyPage'
import { ForecastPage } from './pages/ForecastPage'
import { ProfilesPage } from './pages/ProfilesPage'
import { SynastryPage } from './pages/SynastryPage'
import { SolarReturnPage } from './pages/SolarReturnPage'
import { SettingsPage } from './pages/SettingsPage'
import { armInAppTimer, registerServiceWorker, scheduleMessages } from './lib/notifications'

export type Route = 'inicio' | 'mapa' | 'ceu' | 'previsoes' | 'sinastria' | 'revolucao' | 'perfis' | 'ajustes'

const NAV: { key: Route; label: string; icon: string }[] = [
  { key: 'inicio', label: 'Início', icon: '✦' },
  { key: 'mapa', label: 'Mapa Natal', icon: '☉' },
  { key: 'ceu', label: 'Céu de Hoje', icon: '☽' },
  { key: 'previsoes', label: 'Previsões', icon: '✧' },
  { key: 'sinastria', label: 'Sinastria', icon: '♡' },
  { key: 'revolucao', label: 'Rev. Solar', icon: '☼' },
  { key: 'perfis', label: 'Perfis', icon: '☷' },
]

const ROUTES: Route[] = [...NAV.map((n) => n.key), 'ajustes']

const readRoute = (): Route => {
  const h = window.location.hash.replace(/^#\/?/, '') as Route
  return ROUTES.includes(h) ? h : 'inicio'
}

export default function App() {
  const [route, setRoute] = useState<Route>(readRoute)
  const { profiles, active, setActiveId, save, remove } = useProfiles()
  const [settings, setSettings] = useSettings()

  useEffect(() => {
    const on = () => setRoute(readRoute())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  const go = (r: Route) => {
    window.location.hash = '/' + r
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const natal: Chart | null = useMemo(() => {
    if (!active) return null
    try {
      return chartFromBirth(active, settings.houseSystem)
    } catch {
      return null
    }
  }, [active, settings.houseSystem])

  // Daily notifications: keep the service worker's message queue fresh for the active profile.
  useEffect(() => {
    registerServiceWorker()
    if (!settings.notify) return
    scheduleMessages(natal, true, settings.notifyHour)
    return armInAppTimer(settings.notifyHour)
  }, [natal, settings.notify, settings.notifyHour])

  const page = (() => {
    switch (route) {
      case 'mapa':
        return <NatalPage natal={natal} settings={settings} setSettings={setSettings} go={go} />
      case 'ceu':
        return <SkyPage natal={natal} profile={active} settings={settings} go={go} />
      case 'previsoes':
        return <ForecastPage natal={natal} go={go} />
      case 'sinastria':
        return (
          <SynastryPage
            profiles={profiles} activeId={active?.id ?? null} houseSystem={settings.houseSystem}
            onSave={(d) => save(d, undefined, false)} go={go}
          />
        )
      case 'revolucao':
        return <SolarReturnPage key={active?.id} natal={natal} houseSystem={settings.houseSystem} go={go} />
      case 'ajustes':
        return <SettingsPage natal={natal} settings={settings} setSettings={setSettings} />
      case 'perfis':
        return (
          <ProfilesPage
            profiles={profiles} activeId={active?.id ?? null}
            onSelect={(id) => { setActiveId(id); go('mapa') }}
            onSave={(d, id) => { save(d, id); go('mapa') }}
            onRemove={remove}
          />
        )
      default:
        return <Home natal={natal} profile={active} onCreate={(d) => { save(d); go('mapa') }} go={go} />
    }
  })()

  return (
    <>
      <Starfield motion={settings.motion} />
      <header className="topbar">
        <button className="brand" onClick={() => go('inicio')}>
          <span className="brand-mark">✶</span>
          <span className="brand-name">Mapa Astral</span>
        </button>
        <nav className="nav">
          {NAV.map((n) => (
            <button key={n.key} className={route === n.key ? 'active' : ''} onClick={() => go(n.key)}>
              <span className="nav-icon">{n.icon}</span>
              <span className="nav-label">{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="top-actions">
          {active && (
            <select className="profile-switch" value={active.id} onChange={(e) => setActiveId(e.target.value)} aria-label="Perfil ativo">
              {profiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          <button className={`icon-btn ${route === 'ajustes' ? 'on' : ''}`} title="Ajustes" aria-label="Ajustes" onClick={() => go('ajustes')}>
            ⚙
          </button>
        </div>
      </header>
      <main key={route} className="page">{page}</main>
      <footer className="footer">
        <p>Efemérides calculadas com Astronomy Engine (precisão &lt; 1′) · Zodíaco tropical · Casas {HOUSE_SYSTEMS.find((h) => h.key === settings.houseSystem)?.name}</p>
        <p className="muted">Feito com ✦ para quem busca conexão com as estrelas</p>
      </footer>
    </>
  )
}
