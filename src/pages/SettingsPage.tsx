import { useState } from 'react'
import type { Chart } from '../astro/chart'
import { HOUSE_SYSTEMS } from '../astro/houses'
import { AI_ENDPOINT, getUserKey, setUserKey } from '../ai/config'
import { buildDailyMessages, enableNotifications, notificationsSupported, scheduleMessages, testNotification } from '../lib/notifications'
import type { Settings } from '../lib/profiles'

interface Props {
  natal: Chart | null
  settings: Settings
  setSettings: (fn: (s: Settings) => Settings) => void
}

export function SettingsPage({ natal, settings, setSettings }: Props) {
  const [notifStatus, setNotifStatus] = useState(() =>
    notificationsSupported() ? Notification.permission : 'unsupported')
  const [key, setKey] = useState(getUserKey)
  const [saved, setSaved] = useState(false)
  const preview = natal ? buildDailyMessages(natal, settings.notifyHour, 3) : []

  const toggleNotify = async (on: boolean) => {
    if (on) {
      const r = await enableNotifications()
      setNotifStatus(r === 'unsupported' ? 'unsupported' : r)
      if (r !== 'granted') return
    }
    setSettings((s) => ({ ...s, notify: on }))
    await scheduleMessages(natal, on, settings.notifyHour)
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
        <h1 className="title-glow">Ajustes</h1>
      </header>

      <section className="glass pad settings-card">
        <h2>☽ Notificação diária</h2>
        <p className="muted">Receba todas as manhãs o principal trânsito do dia sobre o seu mapa e o clima da Lua.</p>
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
                  await scheduleMessages(natal, settings.notify, h)
                }}
              >
                {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>)}
              </select>
            </label>
            {settings.notify && notifStatus === 'granted' && <button className="ghost" onClick={() => testNotification()}>Enviar notificação de teste</button>}
            {preview.length > 0 && (
              <div className="notif-preview">
                <p className="eyebrow">Prévia dos próximos dias</p>
                {preview.map((m) => (
                  <div key={m.date} className="notif-card glass-soft">
                    <span className="nc-icon">✶</span>
                    <div>
                      <strong>{m.title}</strong>
                      <p>{m.body}</p>
                      <small className="muted">{new Date(m.date + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}</small>
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
        <h2>✦ Leitura por IA</h2>
        {AI_ENDPOINT ? (
          <p>A leitura por IA está ativada neste app. Gere leituras nas páginas Mapa Natal, Sinastria, Revolução Solar e Previsões.</p>
        ) : (
          <>
            <p className="muted">
              Para gerar leituras personalizadas, informe uma chave da API da Anthropic (Claude). Ela fica salva somente neste aparelho
              e é usada para chamar a API diretamente. O custo de cada leitura é cobrado na sua conta da Anthropic.
            </p>
            <label className="field">
              <span>Chave da API</span>
              <input type="password" value={key} onChange={(e) => { setKey(e.target.value); setSaved(false) }} placeholder="sk-ant-…" autoComplete="off" />
            </label>
            <div className="head-tools left">
              <button className="ghost" onClick={() => { setUserKey(key.trim()); setSaved(true) }}>Salvar chave</button>
              {getUserKey() && <button className="ghost danger" onClick={() => { setUserKey(''); setKey(''); setSaved(false) }}>Remover</button>}
              {saved && <span className="place-info">✓ Salva</span>}
            </div>
            <p className="muted small">Crie a chave em console.anthropic.com → API Keys. Para publicar o app com IA para todos, use o endpoint de servidor (veja o README).</p>
          </>
        )}
        <button className="link" onClick={clearAiCache}>Apagar leituras salvas neste aparelho</button>
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
