import { useEffect, useRef, useState } from 'react'
import type { BirthData } from '../astro/chart'
import { localToUtc, offsetLabel } from '../astro/time'
import { placeLabel, searchPlaces, type Place } from '../lib/geo'

interface Props {
  initial?: BirthData | null
  onSubmit: (data: BirthData) => void
  submitLabel?: string
}

const pad = (n: number) => String(n).padStart(2, '0')

export function BirthForm({ initial, onSubmit, submitLabel = 'Revelar meu mapa' }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [date, setDate] = useState(initial ? `${initial.local.year}-${pad(initial.local.month)}-${pad(initial.local.day)}` : '')
  const [time, setTime] = useState(initial ? `${pad(initial.local.hour)}:${pad(initial.local.minute)}` : '')
  const [unknown, setUnknown] = useState(initial?.timeUnknown ?? false)
  const [place, setPlace] = useState<Place | null>(
    initial ? { name: initial.place, latitude: initial.latitude, longitude: initial.longitude, timeZone: initial.timeZone } : null,
  )
  const [query, setQuery] = useState(initial?.place ?? '')
  const [results, setResults] = useState<Place[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [advanced, setAdvanced] = useState(false)
  const [error, setError] = useState('')
  const abort = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!open || query.trim().length < 2 || (place && placeLabel(place) === query)) return
    const id = setTimeout(async () => {
      abort.current?.abort()
      const ctl = new AbortController()
      abort.current = ctl
      setLoading(true)
      try {
        setResults(await searchPlaces(query, ctl.signal))
      } catch {
        /* aborted */
      } finally {
        if (!ctl.signal.aborted) setLoading(false)
      }
    }, 300)
    return () => clearTimeout(id)
  }, [query, open, place])

  const choose = (p: Place) => {
    setPlace(p)
    setQuery(placeLabel(p))
    setOpen(false)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!date) return setError('Informe a data de nascimento.')
    if (!unknown && !time) return setError('Informe a hora de nascimento (ou marque "não sei a hora").')
    if (!place) return setError('Escolha a cidade de nascimento na lista.')
    const [y, m, d] = date.split('-').map(Number)
    const [hh, mm] = (unknown ? '12:00' : time).split(':').map(Number)
    try {
      localToUtc({ year: y, month: m, day: d, hour: hh, minute: mm }, place.timeZone)
    } catch {
      return setError('Fuso horário inválido. Use um nome IANA (ex.: America/Sao_Paulo) ou UTC-3.')
    }
    onSubmit({
      name: name.trim() || 'Meu mapa',
      local: { year: y, month: m, day: d, hour: hh, minute: mm },
      timeZone: place.timeZone,
      latitude: place.latitude,
      longitude: place.longitude,
      place: placeLabel(place),
      timeUnknown: unknown,
    })
  }

  let tzInfo = ''
  if (place && date) {
    try {
      const [y, m, d] = date.split('-').map(Number)
      const [hh, mm] = (time || '12:00').split(':').map(Number)
      const utc = localToUtc({ year: y, month: m, day: d, hour: hh, minute: mm }, place.timeZone)
      tzInfo = `${offsetLabel(utc, place.timeZone)} · ${utc.toISOString().slice(11, 16)} UTC`
    } catch {
      tzInfo = ''
    }
  }

  return (
    <form className="birth-form glass" onSubmit={submit}>
      <label className="field">
        <span>Nome</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Como você quer ser chamado" autoComplete="name" />
      </label>
      <div className="row">
        <label className="field">
          <span>Data de nascimento</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} min="1800-01-01" max="2100-12-31" required />
        </label>
        <label className="field">
          <span>Hora</span>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} disabled={unknown} />
        </label>
      </div>
      <label className="check">
        <input type="checkbox" checked={unknown} onChange={(e) => setUnknown(e.target.checked)} />
        <span>Não sei a hora exata (sem casas e ascendente)</span>
      </label>
      <div className="field city">
        <span>Cidade de nascimento</span>
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setPlace(null) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 180)}
          placeholder="Digite a cidade…"
          autoComplete="off"
        />
        {loading && <span className="spinner" />}
        {open && results.length > 0 && (
          <ul className="dropdown glass">
            {results.map((r, i) => (
              <li key={i}>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => choose(r)}>
                  <strong>{r.name}</strong>
                  <small>{[r.region, r.country].filter(Boolean).join(', ')} · {r.latitude.toFixed(2)}°, {r.longitude.toFixed(2)}°</small>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {place && (
        <p className="place-info">
          ✦ {place.latitude.toFixed(4)}°, {place.longitude.toFixed(4)}° · {place.timeZone}{tzInfo && ` · ${tzInfo}`}
        </p>
      )}
      <button type="button" className="link" onClick={() => setAdvanced((v) => !v)}>
        {advanced ? '− Ocultar ajustes manuais' : '+ Ajustar coordenadas / fuso manualmente'}
      </button>
      {advanced && (
        <div className="row three">
          <label className="field">
            <span>Latitude</span>
            <input type="number" step="0.0001" value={place?.latitude ?? ''} onChange={(e) => setPlace((p) => ({ ...(p ?? { name: query || 'Local', longitude: 0, timeZone: 'UTC' }), latitude: Number(e.target.value) }))} />
          </label>
          <label className="field">
            <span>Longitude</span>
            <input type="number" step="0.0001" value={place?.longitude ?? ''} onChange={(e) => setPlace((p) => ({ ...(p ?? { name: query || 'Local', latitude: 0, timeZone: 'UTC' }), longitude: Number(e.target.value) }))} />
          </label>
          <label className="field">
            <span>Fuso (IANA ou UTC±h)</span>
            <input value={place?.timeZone ?? ''} placeholder="America/Sao_Paulo" onChange={(e) => setPlace((p) => ({ ...(p ?? { name: query || 'Local', latitude: 0, longitude: 0 }), timeZone: e.target.value }))} />
          </label>
        </div>
      )}
      {error && <p className="error">{error}</p>}
      <button className="cta" type="submit">
        <span>✧ {submitLabel} ✧</span>
      </button>
    </form>
  )
}
