export type Element = 'fogo' | 'terra' | 'ar' | 'agua'
export type Modality = 'cardinal' | 'fixo' | 'mutavel'

export interface SignInfo {
  id: number
  key: string
  name: string
  glyph: string
  element: Element
  modality: Modality
  ruler: PlanetKey
  polarity: 'yang' | 'yin'
}

// Variation selector U+FE0E forces text (non-emoji) presentation of glyphs.
const T = '︎'

export const SIGNS: SignInfo[] = [
  { id: 0, key: 'aries', name: 'Áries', glyph: '♈' + T, element: 'fogo', modality: 'cardinal', ruler: 'mars', polarity: 'yang' },
  { id: 1, key: 'taurus', name: 'Touro', glyph: '♉' + T, element: 'terra', modality: 'fixo', ruler: 'venus', polarity: 'yin' },
  { id: 2, key: 'gemini', name: 'Gêmeos', glyph: '♊' + T, element: 'ar', modality: 'mutavel', ruler: 'mercury', polarity: 'yang' },
  { id: 3, key: 'cancer', name: 'Câncer', glyph: '♋' + T, element: 'agua', modality: 'cardinal', ruler: 'moon', polarity: 'yin' },
  { id: 4, key: 'leo', name: 'Leão', glyph: '♌' + T, element: 'fogo', modality: 'fixo', ruler: 'sun', polarity: 'yang' },
  { id: 5, key: 'virgo', name: 'Virgem', glyph: '♍' + T, element: 'terra', modality: 'mutavel', ruler: 'mercury', polarity: 'yin' },
  { id: 6, key: 'libra', name: 'Libra', glyph: '♎' + T, element: 'ar', modality: 'cardinal', ruler: 'venus', polarity: 'yang' },
  { id: 7, key: 'scorpio', name: 'Escorpião', glyph: '♏' + T, element: 'agua', modality: 'fixo', ruler: 'pluto', polarity: 'yin' },
  { id: 8, key: 'sagittarius', name: 'Sagitário', glyph: '♐' + T, element: 'fogo', modality: 'mutavel', ruler: 'jupiter', polarity: 'yang' },
  { id: 9, key: 'capricorn', name: 'Capricórnio', glyph: '♑' + T, element: 'terra', modality: 'cardinal', ruler: 'saturn', polarity: 'yin' },
  { id: 10, key: 'aquarius', name: 'Aquário', glyph: '♒' + T, element: 'ar', modality: 'fixo', ruler: 'uranus', polarity: 'yang' },
  { id: 11, key: 'pisces', name: 'Peixes', glyph: '♓' + T, element: 'agua', modality: 'mutavel', ruler: 'neptune', polarity: 'yin' },
]

export const ELEMENT_INFO: Record<Element, { name: string; color: string; glow: string; essence: string }> = {
  fogo: { name: 'Fogo', color: '#e66767', glow: 'rgba(230,103,103,0.55)', essence: 'vontade, entusiasmo, coragem e inspiração' },
  terra: { name: 'Terra', color: '#199e70', glow: 'rgba(25,158,112,0.55)', essence: 'concretude, paciência, corpo e realização' },
  ar: { name: 'Ar', color: '#c98500', glow: 'rgba(201,133,0,0.55)', essence: 'mente, comunicação, ideias e conexões' },
  agua: { name: 'Água', color: '#3987e5', glow: 'rgba(57,135,229,0.55)', essence: 'emoção, intuição, empatia e memória' },
}

export const MODALITY_INFO: Record<Modality, { name: string; essence: string }> = {
  cardinal: { name: 'Cardinal', essence: 'iniciar, liderar, abrir caminhos' },
  fixo: { name: 'Fixo', essence: 'sustentar, aprofundar, persistir' },
  mutavel: { name: 'Mutável', essence: 'adaptar, transformar, integrar' },
}

export type PlanetKey =
  | 'sun' | 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn'
  | 'uranus' | 'neptune' | 'pluto' | 'node' | 'southNode' | 'lilith'

export type PointKey = PlanetKey | 'asc' | 'mc' | 'dsc' | 'ic' | 'fortune'

export interface PointInfo {
  key: PointKey
  name: string
  glyph: string
  color: string
  /** Weight used for element/modality balance and transit intensity. */
  weight: number
  personal?: boolean
}

export const POINTS: Record<PointKey, PointInfo> = {
  sun: { key: 'sun', name: 'Sol', glyph: '☉' + T, color: '#ffd166', weight: 4, personal: true },
  moon: { key: 'moon', name: 'Lua', glyph: '☽' + T, color: '#e8ecff', weight: 4, personal: true },
  mercury: { key: 'mercury', name: 'Mercúrio', glyph: '☿' + T, color: '#9be7ff', weight: 2, personal: true },
  venus: { key: 'venus', name: 'Vênus', glyph: '♀' + T, color: '#ff9ecd', weight: 2, personal: true },
  mars: { key: 'mars', name: 'Marte', glyph: '♂' + T, color: '#ff6b6b', weight: 2, personal: true },
  jupiter: { key: 'jupiter', name: 'Júpiter', glyph: '♃' + T, color: '#ffb86b', weight: 1.5 },
  saturn: { key: 'saturn', name: 'Saturno', glyph: '♄' + T, color: '#c9b37e', weight: 1.5 },
  uranus: { key: 'uranus', name: 'Urano', glyph: '♅' + T, color: '#6ef0e0', weight: 1 },
  neptune: { key: 'neptune', name: 'Netuno', glyph: '♆' + T, color: '#7aa2ff', weight: 1 },
  pluto: { key: 'pluto', name: 'Plutão', glyph: '♇' + T, color: '#c77dff', weight: 1 },
  node: { key: 'node', name: 'Nodo Norte', glyph: '☊' + T, color: '#a0f0b0', weight: 0.5 },
  southNode: { key: 'southNode', name: 'Nodo Sul', glyph: '☋' + T, color: '#88a090', weight: 0 },
  lilith: { key: 'lilith', name: 'Lilith', glyph: '⚸' + T, color: '#d06aa0', weight: 0 },
  asc: { key: 'asc', name: 'Ascendente', glyph: 'AC', color: '#ffe8a3', weight: 3 },
  mc: { key: 'mc', name: 'Meio do Céu', glyph: 'MC', color: '#ffe8a3', weight: 2 },
  dsc: { key: 'dsc', name: 'Descendente', glyph: 'DC', color: '#ffe8a3', weight: 0 },
  ic: { key: 'ic', name: 'Fundo do Céu', glyph: 'IC', color: '#ffe8a3', weight: 0 },
  fortune: { key: 'fortune', name: 'Roda da Fortuna', glyph: '⊗', color: '#f6d365', weight: 0 },
}

export const PLANET_ORDER: PlanetKey[] = [
  'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn',
  'uranus', 'neptune', 'pluto', 'node', 'southNode', 'lilith',
]

export type AspectKey = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition' | 'quincunx' | 'semisextile'

export interface AspectInfo {
  key: AspectKey
  name: string
  angle: number
  glyph: string
  orb: number
  nature: 'harmonico' | 'tenso' | 'neutro'
  color: string
  major: boolean
}

export const ASPECTS: AspectInfo[] = [
  { key: 'conjunction', name: 'Conjunção', angle: 0, glyph: '☌' + T, orb: 8, nature: 'neutro', color: '#ffd166', major: true },
  { key: 'opposition', name: 'Oposição', angle: 180, glyph: '☍' + T, orb: 8, nature: 'tenso', color: '#ff5d73', major: true },
  { key: 'trine', name: 'Trígono', angle: 120, glyph: '△', orb: 7, nature: 'harmonico', color: '#4ade80', major: true },
  { key: 'square', name: 'Quadratura', angle: 90, glyph: '□', orb: 7, nature: 'tenso', color: '#ff7849', major: true },
  { key: 'sextile', name: 'Sextil', angle: 60, glyph: '⚹', orb: 5, nature: 'harmonico', color: '#5cc8ff', major: true },
  { key: 'quincunx', name: 'Quincúncio', angle: 150, glyph: '⚻', orb: 3, nature: 'tenso', color: '#c084fc', major: false },
  { key: 'semisextile', name: 'Semissextil', angle: 30, glyph: '⚺', orb: 2, nature: 'neutro', color: '#94a3b8', major: false },
]

export const ASPECT_BY_KEY = Object.fromEntries(ASPECTS.map((a) => [a.key, a])) as Record<AspectKey, AspectInfo>

/** Classical dignities, used in the report. */
export const DIGNITIES: Partial<Record<PlanetKey, { domicile: number[]; exaltation: number[]; detriment: number[]; fall: number[] }>> = {
  sun: { domicile: [4], exaltation: [0], detriment: [10], fall: [6] },
  moon: { domicile: [3], exaltation: [1], detriment: [9], fall: [7] },
  mercury: { domicile: [2, 5], exaltation: [5], detriment: [8, 11], fall: [11] },
  venus: { domicile: [1, 6], exaltation: [11], detriment: [7, 0], fall: [5] },
  mars: { domicile: [0, 7], exaltation: [9], detriment: [6, 1], fall: [3] },
  jupiter: { domicile: [8, 11], exaltation: [3], detriment: [2, 5], fall: [9] },
  saturn: { domicile: [9, 10], exaltation: [6], detriment: [3, 4], fall: [0] },
  uranus: { domicile: [10], exaltation: [7], detriment: [4], fall: [1] },
  neptune: { domicile: [11], exaltation: [3], detriment: [5], fall: [9] },
  pluto: { domicile: [7], exaltation: [0], detriment: [1], fall: [6] },
}

export type Dignity = 'domicílio' | 'exaltação' | 'exílio' | 'queda' | null

export function dignityOf(planet: PlanetKey, sign: number): Dignity {
  const d = DIGNITIES[planet]
  if (!d) return null
  if (d.domicile.includes(sign)) return 'domicílio'
  if (d.exaltation.includes(sign)) return 'exaltação'
  if (d.detriment.includes(sign)) return 'exílio'
  if (d.fall.includes(sign)) return 'queda'
  return null
}

export const norm360 = (x: number) => ((x % 360) + 360) % 360

/** Signed smallest difference b - a in (-180, 180]. */
export const angDiff = (a: number, b: number) => {
  let d = norm360(b - a)
  if (d > 180) d -= 360
  return d
}

export const signOf = (lon: number) => Math.floor(norm360(lon) / 30)

export function formatDegree(lon: number, withSign = true): string {
  const l = norm360(lon)
  const s = signOf(l)
  const within = l - s * 30
  const deg = Math.floor(within)
  const min = Math.floor((within - deg) * 60)
  const txt = `${deg}°${String(min).padStart(2, '0')}'`
  return withSign ? `${txt} ${SIGNS[s].name}` : txt
}
