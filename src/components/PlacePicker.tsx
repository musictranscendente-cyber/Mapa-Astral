import { useEffect, useRef, useState } from 'react'
import { placeLabel, searchPlaces, type Place } from '../lib/geo'
import { t } from '../i18n'

export type WhereMode = 'natal' | 'aqui' | 'cidade'

export interface Where {
  latitude: number
  longitude: number
  label: string
  mode: WhereMode
}

interface Props {
  value: Where
  natal: { latitude: number; longitude: number; place: string }
  onChange: (w: Where) => void
  title?: string
}

/** Choose where the solar return is cast: birthplace, current location or any city. */
export function PlacePicker({ value, natal, onChange, title }: Props) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Place[]>([])
  const [searching, setSearching] = useState(value.mode === 'cidade')
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState('')
  const abort = useRef<AbortController | null>(null)

  useEffect(() => {
    if (q.trim().length < 2) return
    const id = setTimeout(async () => {
      abort.current?.abort()
      const ctl = new AbortController()
      abort.current = ctl
      try { setResults(await searchPlaces(q, ctl.signal)) } catch { /* aborted */ }
    }, 300)
    return () => clearTimeout(id)
  }, [q])

  const useNatal = () => {
    setError('')
    setSearching(false)
    onChange({ latitude: natal.latitude, longitude: natal.longitude, label: natal.place, mode: 'natal' })
  }

  const useHere = () => {
    setError('')
    setSearching(false)
    if (!navigator.geolocation) {
      setError(t('Este aparelho não informa a localização. Use "Outra cidade".'))
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLocating(false)
        onChange({
          latitude: p.coords.latitude,
          longitude: p.coords.longitude,
          label: `${t('Onde estou')} (${p.coords.latitude.toFixed(2)}°, ${p.coords.longitude.toFixed(2)}°)`,
          mode: 'aqui',
        })
      },
      (err) => {
        setLocating(false)
        setError(err.code === err.PERMISSION_DENIED
          ? t('Permissão de localização negada. Libere a localização para este site nas configurações do navegador, ou use "Outra cidade".')
          : t('Não foi possível obter sua localização agora. Tente de novo ou use "Outra cidade".'))
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 },
    )
  }

  const choose = (r: Place) => {
    onChange({ latitude: r.latitude, longitude: r.longitude, label: placeLabel(r), mode: 'cidade' })
    setQ('')
    setResults([])
    setSearching(false)
  }

  return (
    <div className="place-picker">
      {title && <p className="eyebrow">{title}</p>}
      <div className="pp-options" role="radiogroup">
        <button role="radio" aria-checked={value.mode === 'natal' && !searching} className={`pp-opt ${value.mode === 'natal' && !searching ? 'on' : ''}`} onClick={useNatal}>
          <span className="pp-dot" />⌂ {t('Cidade natal')}
        </button>
        <button role="radio" aria-checked={value.mode === 'aqui' && !searching} className={`pp-opt ${value.mode === 'aqui' && !searching ? 'on' : ''}`} onClick={useHere} disabled={locating}>
          <span className="pp-dot" />{locating ? t('Localizando…') : `⌖ ${t('Onde estou')}`}
        </button>
        <button role="radio" aria-checked={value.mode === 'cidade' || searching} className={`pp-opt ${value.mode === 'cidade' || searching ? 'on' : ''}`} onClick={() => { setSearching(true); setError('') }}>
          <span className="pp-dot" />⌕ {t('Outra cidade')}
        </button>
      </div>
      {searching && (
        <div className="field city pp-search">
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Digite o nome da cidade…')} />
          {q.trim().length >= 2 && results.length > 0 && (
            <ul className="dropdown glass">
              {results.map((r, i) => (
                <li key={i}>
                  <button type="button" onClick={() => choose(r)}>
                    <strong>{r.name}</strong><small>{[r.region, r.country].filter(Boolean).join(', ')}</small>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <p className="pp-selected">📍 <span>{searching ? t('Escolha a cidade na lista · atual:') : t('Calculando para:')}</span> <b>{value.label}</b></p>
      {error && <p className="warn small">{error}</p>}
    </div>
  )
}
