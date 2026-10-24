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
import { AccountPage } from './pages/AccountPage'
import { PlansPage } from './pages/PlansPage'
import { HoroscopePage } from './pages/HoroscopePage'
import { LegalPage } from './pages/LegalPage'
import { LunationsPage } from './pages/LunationsPage'
import { LunarReturnPage } from './pages/LunarReturnPage'
import { ProgressionsPage } from './pages/ProgressionsPage'
import { rememberReturn, takeReturn, useAuth, type AuthState } from './lib/auth'
import { AccessProvider } from './billing/access'
import { useAccess } from './billing/context'
import { getSim } from './billing/sim'
import { formatBRL } from './billing/rules'
import type { BirthData } from './astro/chart'
import { track, trackVisit } from './lib/analytics'
import { armInAppTimer, registerServiceWorker, scheduleMessages } from './lib/notifications'

export type Route = 'inicio' | 'mapa' | 'ceu' | 'previsoes' | 'sinastria' | 'revolucao' | 'perfis' | 'ajustes' | 'conta' | 'planos' | 'horoscopo' | 'termos' | 'privacidade' | 'lunacoes' | 'retorno-lunar' | 'progressoes'

const NAV: { key: Route; label: string; icon: string }[] = [
  { key: 'inicio', label: 'Início', icon: '✦' },
  { key: 'mapa', label: 'Mapa Natal', icon: '☉' },
  { key: 'ceu', label: 'Céu de Hoje', icon: '☽' },
  { key: 'previsoes', label: 'Previsões', icon: '✧' },
  { key: 'sinastria', label: 'Sinastria', icon: '♡' },
  { key: 'revolucao', label: 'Rev. Solar', icon: '☼' },
  { key: 'perfis', label: 'Perfis', icon: '☷' },
]

const ROUTES: Route[] = [...NAV.map((n) => n.key), 'ajustes', 'conta', 'planos', 'horoscopo', 'termos', 'privacidade', 'lunacoes', 'retorno-lunar', 'progressoes']

const readRoute = (): Route => {
  // Payment providers append `?status=…` after the hash route.
  const h = window.location.hash.replace(/^#\/?/, '').split('?')[0] as Route
  return ROUTES.includes(h) ? h : 'inicio'
}

export default function App() {
  const auth = useAuth()
  return (
    <AccessProvider userId={auth.user?.id ?? null} email={auth.user?.email ?? null}>
      <Main auth={auth} />
    </AccessProvider>
  )
}

function Main({ auth }: { auth: AuthState }) {
  const [route, setRoute] = useState<Route>(readRoute)
  const { profiles, active, setActiveId, save: saveProfile, remove, clearLocal, sync } = useProfiles(auth.user?.id ?? null)
  const [settings, setSettings] = useSettings()
  const access = useAccess()
  const [notice, setNotice] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => { trackVisit() }, [])

  // Back from a login started on a locked screen: return to that screen.
  const userId = auth.user?.id
  useEffect(() => {
    if (!userId) return
    const back = takeReturn()
    if (back && back !== window.location.hash) window.location.hash = back
  }, [userId])

  useEffect(() => {
    const on = () => setRoute(readRoute())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  const go = (r: Route) => {
    window.location.hash = '/' + r
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /** Saves a chart, respecting how many charts the person's access allows. Returns '' when blocked. */
  const save = (data: BirthData, id?: string, activate = true): string => {
    if (!id && profiles.length >= access.profileLimit) {
      if (!access.loggedIn) {
        setNotice(`Sem conta, dá para guardar até ${access.profileLimit} mapas. Entre grátis para salvar mais.`)
        rememberReturn()
        go('conta')
      } else {
        setNotice(`Seu acesso permite até ${access.profileLimit} mapas. Escolha um plano para salvar mais.`)
        go('planos')
      }
      return ''
    }
    setNotice('')
    if (!id) track('mapa')
    return saveProfile(data, id, activate)
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
      case 'conta':
        return <AccountPage user={auth.user} loading={auth.loading} sync={sync} profileCount={profiles.length} onClearLocal={clearLocal} />
      case 'progressoes':
        return <ProgressionsPage natal={natal} go={go} />
      case 'retorno-lunar':
        return <LunarReturnPage key={active?.id} natal={natal} houseSystem={settings.houseSystem} go={go} />
      case 'lunacoes':
        return <LunationsPage natal={natal} go={go} />
      case 'termos':
      case 'privacidade':
        return <LegalPage doc={route} go={go} />
      case 'horoscopo':
        return <HoroscopePage natal={natal} go={go} />
      case 'planos':
        return <PlansPage natal={natal} go={go} />
      case 'ajustes':
        return <SettingsPage natal={natal} settings={settings} setSettings={setSettings} go={go} />
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
        <button className="icon-btn menu-btn" aria-label="Abrir menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>☰</button>
        <button className="brand" onClick={() => go('inicio')}>
          <span className="brand-mark">✶</span>
          <span className="brand-name">Cosmic Sky</span>
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
          {access.enabled && (
            <button className={`icon-btn plans-btn hide-narrow ${route === 'planos' ? 'on' : ''}`} title="Planos" aria-label="Planos" onClick={() => go('planos')}>
              {access.plan ? '✦' : '💎'}
            </button>
          )}
          <button className={`icon-btn account-btn ${route === 'conta' ? 'on' : ''}`} title={auth.user ? 'Minha conta' : 'Entrar'} aria-label="Conta" onClick={() => go('conta')}>
            {auth.user?.user_metadata?.avatar_url
              ? <img src={auth.user.user_metadata.avatar_url as string} alt="" referrerPolicy="no-referrer" />
              : auth.user ? (auth.user.email ?? '?').charAt(0).toUpperCase() : '☺'}
            {auth.user && <i className={`sync-dot ${sync}`} />}
          </button>
          <button className={`icon-btn hide-narrow ${route === 'ajustes' ? 'on' : ''}`} title="Ajustes" aria-label="Ajustes" onClick={() => go('ajustes')}>
            ⚙
          </button>
        </div>
      </header>
      {menuOpen && <MainMenu route={route} showPlans={access.enabled} onGo={(r) => { setMenuOpen(false); go(r) }} onClose={() => setMenuOpen(false)} />}
      {access.simulated && (
        <button className="sim-pill" onClick={() => go('ajustes')} title="Abrir o simulador em Ajustes">
          🧪 Simulação · {access.loggedIn ? (access.plan === 'cosmos' ? 'Cosmos' : access.plan === 'estrela' ? 'Estrela' : 'Grátis') : 'Sem login'} · {formatBRL(getSim().balance)}
        </button>
      )}
      <main key={route} className="page">
        {notice && <p className="glass pad notice" onClick={() => setNotice('')}>{notice}</p>}
        {page}
      </main>
      <footer className="footer">
        <p>Efemérides calculadas com Astronomy Engine (precisão &lt; 1′) · Zodíaco tropical · Casas {HOUSE_SYSTEMS.find((h) => h.key === settings.houseSystem)?.name}</p>
        <p className="muted">Feito com ✦ para quem busca conexão com as estrelas</p>
        <p className="footer-links"><a href="#/termos">Termos de Uso</a> · <a href="#/privacidade">Política de Privacidade</a></p>
      </footer>
    </>
  )
}

const MENU: { key: Route; label: string; icon: string; hint: string }[] = [
  { key: 'inicio', label: 'Início', icon: '✦', hint: 'Seu céu em resumo' },
  { key: 'horoscopo', label: 'Horóscopo do dia', icon: '☀', hint: 'Previsão diária dos 12 signos' },
  { key: 'mapa', label: 'Mapa Natal', icon: '☉', hint: 'Roda, relatório e análise completa' },
  { key: 'ceu', label: 'Céu de Hoje', icon: '☽', hint: 'Lua, planetas e trânsitos do dia' },
  { key: 'previsoes', label: 'Previsões', icon: '✧', hint: 'Dias de fluxo e trânsitos futuros' },
  { key: 'progressoes', label: 'Progressões', icon: '➶', hint: 'Seu mapa amadurecido e arcos solares' },
  { key: 'lunacoes', label: 'Eclipses e Lunações', icon: '◐', hint: 'Luas novas, cheias e eclipses no seu mapa' },
  { key: 'sinastria', label: 'Sinastria', icon: '♡', hint: 'Compatibilidade entre duas pessoas' },
  { key: 'revolucao', label: 'Revolução Solar', icon: '☼', hint: 'Seu ano pessoal e onde passar o aniversário' },
  { key: 'retorno-lunar', label: 'Retorno Lunar', icon: '☾', hint: 'O mapa do seu mês' },
  { key: 'perfis', label: 'Perfis', icon: '☷', hint: 'Seus mapas salvos' },
  { key: 'planos', label: 'Planos', icon: '💎', hint: 'Planos e análises avulsas' },
  { key: 'conta', label: 'Minha conta', icon: '☺', hint: 'Entrar, sincronizar e compras' },
  { key: 'ajustes', label: 'Ajustes', icon: '⚙', hint: 'Notificações, casas e preferências' },
]

/** Side menu with every section of the app. */
function MainMenu({ route, showPlans, onGo, onClose }: { route: Route; showPlans: boolean; onGo: (r: Route) => void; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose])
  return (
    <div className="menu-backdrop" onClick={onClose}>
      <nav className="menu-panel glass" aria-label="Menu" onClick={(e) => e.stopPropagation()}>
        <div className="menu-head">
          <span className="brand-mark">✶</span>
          <span className="brand-name">Cosmic Sky</span>
          <button className="icon-btn" aria-label="Fechar menu" autoFocus onClick={onClose}>✕</button>
        </div>
        <ul>
          {MENU.filter((m) => showPlans || m.key !== 'planos').map((m) => (
            <li key={m.key}>
              <button className={route === m.key ? 'active' : ''} onClick={() => onGo(m.key)}>
                <span className="menu-icon">{m.icon}</span>
                <span className="menu-text"><b>{m.label}</b><small>{m.hint}</small></span>
              </button>
            </li>
          ))}
        </ul>
        <p className="menu-legal"><a href="#/termos" onClick={onClose}>Termos de Uso</a> · <a href="#/privacidade" onClick={onClose}>Privacidade</a></p>
      </nav>
    </div>
  )
}
