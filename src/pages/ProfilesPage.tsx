import { useState } from 'react'
import type { BirthData } from '../astro/chart'
import { chartFromBirth } from '../astro/chart'
import { ELEMENT_INFO, POINTS, SIGNS } from '../astro/constants'
import { BirthForm } from '../components/BirthForm'
import type { Profile } from '../lib/profiles'

interface Props {
  profiles: Profile[]
  activeId: string | null
  onSelect: (id: string) => void
  onSave: (d: BirthData, id?: string) => void
  onRemove: (id: string) => void
}

export function ProfilesPage({ profiles, activeId, onSelect, onSave, onRemove }: Props) {
  const [editing, setEditing] = useState<Profile | 'new' | null>(profiles.length ? null : 'new')
  return (
    <div className="profiles">
      <header className="page-head">
        <p className="eyebrow">Seus mapas</p>
        <h1 className="title-glow">Perfis</h1>
        <p className="muted">Guarde os mapas de quem você ama. Tudo fica salvo apenas neste dispositivo.</p>
        <button className="cta" onClick={() => setEditing('new')}><span>+ Novo mapa</span></button>
      </header>

      {editing && (
        <section className="edit-box">
          <BirthForm
            key={editing === 'new' ? 'new' : editing.id}
            initial={editing === 'new' ? null : editing}
            submitLabel={editing === 'new' ? 'Criar mapa' : 'Salvar alterações'}
            onSubmit={(d) => { onSave(d, editing === 'new' ? undefined : editing.id); setEditing(null) }}
          />
          <button className="link" onClick={() => setEditing(null)}>Cancelar</button>
        </section>
      )}

      <div className="profile-grid">
        {profiles.map((p) => {
          let sun = 0, moon = 0, asc: number | null = null
          try {
            const c = chartFromBirth(p)
            sun = c.points.sun.sign
            moon = c.points.moon.sign
            asc = c.hasHouses ? c.points.asc.sign : null
          } catch { /* invalid profile */ }
          const el = SIGNS[sun].element
          return (
            <article key={p.id} className={`glass profile-card ${p.id === activeId ? 'active' : ''}`} style={{ ['--el' as string]: ELEMENT_INFO[el].color }}>
              <div className="pc-glyph">{SIGNS[sun].glyph}</div>
              <h3>{p.name}</h3>
              <p className="muted small">
                {String(p.local.day).padStart(2, '0')}/{String(p.local.month).padStart(2, '0')}/{p.local.year}
                {!p.timeUnknown && ` · ${String(p.local.hour).padStart(2, '0')}:${String(p.local.minute).padStart(2, '0')}`} · {p.place}
              </p>
              <p className="pc-trio">
                <span>{POINTS.sun.glyph} {SIGNS[sun].name}</span>
                <span>{POINTS.moon.glyph} {SIGNS[moon].name}</span>
                {asc != null && <span>AC {SIGNS[asc].name}</span>}
              </p>
              <div className="pc-actions">
                <button className="ghost" onClick={() => onSelect(p.id)}>Abrir</button>
                <button className="ghost" onClick={() => setEditing(p)}>Editar</button>
                <button className="ghost danger" onClick={() => { if (confirm(`Excluir o mapa de ${p.name}?`)) onRemove(p.id) }}>Excluir</button>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
