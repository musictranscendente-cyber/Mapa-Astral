import type { PlanetKey } from '../astro/constants'
import type { AngleKey } from '../astro/astrocarto'

const PLANET_PLACE: Partial<Record<PlanetKey, string>> = {
  sun: 'brilho, vitalidade e reconhecimento',
  moon: 'acolhimento, emoções e sensação de lar',
  mercury: 'ideias, estudos, comunicação e negócios',
  venus: 'amor, beleza, prazer e harmonia',
  mars: 'energia, coragem e competição (com risco de conflitos)',
  jupiter: 'sorte, expansão, oportunidades e otimismo',
  saturn: 'disciplina, responsabilidade e provas que amadurecem',
  uranus: 'mudanças súbitas, liberdade e originalidade',
  neptune: 'inspiração, espiritualidade e arte (e algum risco de ilusão)',
  pluto: 'transformações profundas, poder e intensidade',
}

const ANGLE_AREA: Record<AngleKey, string> = {
  AC: 'na sua personalidade, no corpo e no jeito de se mostrar',
  MC: 'na carreira, na reputação e na vida pública',
  DC: 'nos relacionamentos e parcerias',
  IC: 'no lar, na família e na sensação de raízes',
}

export const ANGLE_NAME: Record<AngleKey, string> = { AC: 'Ascendente', MC: 'Meio do Céu', DC: 'Descendente', IC: 'Fundo do Céu' }

export const lineMeaning = (p: PlanetKey, a: AngleKey) => `Traz ${PLANET_PLACE[p]} ${ANGLE_AREA[a]}.`

export const BENEFIC: PlanetKey[] = ['sun', 'venus', 'jupiter', 'moon']
