import { useMemo, useState } from 'react'
import type { Chart } from '../astro/chart'
import { HOUSE_SYSTEMS } from '../astro/houses'
import { AI_ENDPOINT, getUserKey, setUserKey } from '../ai/config'
import { buildDailyMessages, enableNotifications, notificationsSupported, scheduleMessages, testNotification } from '../lib/notifications'
import type { NotifyTopics, Settings } from '../lib/profiles'
import { BILLING } from '../billing/api'
import { useAccess } from '../billing/context'
import { SimulatorCard } from '../components/SimulatorCard'
import { StatsCard } from '../components/StatsCard'
import type { Route } from '../App'
import { LangPicker } from '../components/LangPicker'
import { locale, t } from '../i18n'

const TOPICS: [keyof NotifyTopics, string, string][] = [
  ['transitos', 'Trânsitos sobre o seu mapa', 'a mensagem principal do dia'],
  ['lunacoes', 'Lua Nova, Lua Cheia e eclipses', 'no dia em que acontecem'],
  ['planetas', 'Retrógrados e mudanças de signo', 'quando um planeta para, volta ou muda de signo'],
  ['luaSigno', 'Lua mudando de signo', 'a cada 2 ou 3 dias'],
  ['foraDeCurso', 'Lua fora de curso', 'horários para evitar começos importantes'],
]

interface Props {
  natal: Chart | null
  settings: Settings
  setSettings: (fn: (s: Settings) => Settings) => void
  go: (r: Route) => void
}

export function SettingsPage({ natal, settings, setSettings, go }: Props) {
  const access = useAccess()
  const [notifStatus, setNotifStatus] = useState(() =>
    notificationsSupported() ? Notification.permission : 'unsupported')
  const [key, setKey] = useState(getUserKey)
  const [saved, setSaved] = useState(false)
  const preview = useMemo(() => (natal ? buildDailyMessages(natal, settings.notifyHour, 3, settings.notifyTopics) : []), [natal, settings.notifyHour, settings.notifyTopics])

  const toggleNotify = async (on: boolean) => {
    if (on) {
      const r = await enableNotifications()
      setNotifStatus(r === 'unsupported' ? 'unsupported' : r)
      if (r !== 'granted') return
    }
    setSettings((s) => ({ ...s, notify: on }))
    await scheduleMessages(natal, on, settings.notifyHour, settings.notifyTopics)
  }

  const clearAiCache = () => {
    try {
      Object.keys(localStorage).filter((k) => k.startsWith('mapa-astral:ai:')).forEach((k) => localStorage.removeItem(k))
    } catch { /* ignore */ }
  }

  return (
    <div className="settings">
      <header className="page-head">
        <p className="eyebrow">Preferências</p>
        <h1 className="title-glow">{t('Ajustes')}</h1>
      </header>

      <section className="glass pad settings-card">
        <h2>🌐 {t('Idioma')}</h2>
        <LangPicker />
      </section>

      {access.owner && <StatsCard />}
      {access.owner && <SimulatorCard go={go} />}

      <section className="glass pad settings-card">
        <h2>☽ Notificação diária</h2>
        <p className="muted">Receba uma mensagem por dia com o céu do dia sobre o seu mapa. Escolha abaixo o que você quer acompanhar.</p>
        {notifStatus === 'unsupported' ? (
          <p className="warn">Este navegador não suporta notificações. No celular, instale o app pela opção "Adicionar à tela inicial".</p>
        ) : (
          <>
            <label className="check">
              <input type="checkbox" checked={settings.notify && notifStatus === 'granted'} onChange={(e) => toggleNotify(e.target.checked)} disabled={!natal} />
              <span>Ativar notificação diária {natal ? `para ${natal.birth?.name}` : '(crie um mapa primeiro)'}</span>
            </label>
            {notifStatus === 'denied' && <p className="warn">As notificações foram bloqueadas. Libere nas configurações do navegador para este site.</p>}
            <label className="select">
              <span>Horário</span>
              <select
                value={settings.notifyHour}
                onChange={async (e) => {
                  const h = Number(e.target.value)
                  setSettings((s) => ({ ...s, notifyHour: h }))
                  await scheduleMessages(natal, settings.notify, h, settings.notifyTopics)
                }}
              >
                {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>)}
              </select>
            </label>
            <fieldset className="notif-topics">
              <legend className="eyebrow">O que avisar</legend>
              {TOPICS.map(([k, label, hint]) => (
                <label key={k} className="check">
                  <input type="checkbox" checked={settings.notifyTopics[k]} onChange={(e) => setSettings((s) => ({ ...s, notifyTopics: { ...s.notifyTopics, [k]: e.target.checked } }))} />
                  <span>{label} <small className="muted">· {hint}</small></span>
                </label>
              ))}
            </fieldset>
            {settings.notify && notifStatus === 'granted' && <button className="ghost" onClick={() => testNotification()}>Enviar notificação de teste</button>}
            {preview.length > 0 && (
              <div className="notif-preview">
                <p className="eyebrow">Prévia dos próximos dias</p>
                {preview.map((m) => (
                  <div key={m.date} className="notif-card glass-soft">
                    <span className="nc-icon">✶</span>
                    <div>
                      <strong>{m.title}</strong>
                      {m.body.split('\n').map((l, i) => <p key={i}>{l}</p>)}
                      <small className="muted">{new Date(m.date + 'T12:00').toLocaleDateString(locale(), { weekday: 'long', day: 'numeric', month: 'short' })}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="muted small">
              As mensagens são calculadas no seu aparelho. Com o app instalado (Chrome/Android), elas chegam mesmo com o app fechado;
              em outros navegadores, aparecem quando você abre o app após o horário escolhido.
            </p>
          </>
        )}
      </section>

      <section className="glass pad settings-card">
        <h2>✦ Análise completa</h2>
        {BILLING && !access.owner ? (
          <p>As análises completas fazem parte da sua conta. Veja seu saldo e as opções em <a href="#/planos">Planos</a>.</p>
        ) : AI_ENDPOINT ? (
          <p>A análise completa está ativada. Gere análises nas páginas Mapa Natal, Sinastria, Revolução Solar e Previsões.</p>
        ) : (
          <>
            <p className="muted">
              {access.owner
                ? 'Só você vê este campo. Com a chave salva, as análises do simulador são geradas de verdade (custo na sua conta do serviço).'
                : 'Para ativar a análise completa neste aparelho, informe a chave de ativação do serviço.'}
              {' '}Ela fica salva somente neste aparelho.
            </p>
            <label className="field">
              <span>Chave de ativação</span>
              <input type="password" value={key} onChange={(e) => { setKey(e.target.value); setSaved(false) }} placeholder="Cole aqui a chave" autoComplete="off" />
            </label>
            <div className="head-tools left">
              <button className="ghost" onClick={() => { setUserKey(key.trim()); setSaved(true) }}>Salvar chave</button>
              {getUserKey() && <button className="ghost danger" onClick={() => { setUserKey(''); setKey(''); setSaved(false) }}>Remover</button>}
              {saved && <span className="place-info">✓ Salva</span>}
            </div>
          </>
        )}
        <button className="link" onClick={clearAiCache}>Apagar análises salvas neste aparelho</button>
      </section>

      <section className="glass pad settings-card">
        <h2>⌂ Cálculo e visual</h2>
        <label className="select">
          <span>Sistema de casas</span>
          <select value={settings.houseSystem} onChange={(e) => setSettings((s) => ({ ...s, houseSystem: e.target.value as Settings['houseSystem'] }))}>
            {HOUSE_SYSTEMS.map((h) => <option key={h.key} value={h.key}>{h.name}</option>)}
          </select>
        </label>
        <label className="check">
          <input type="checkbox" checked={settings.motion} onChange={(e) => setSettings((s) => ({ ...s, motion: e.target.checked }))} />
          <span>Animações do céu estrelado</span>
        </label>
      </section>
    </div>
  )
}
