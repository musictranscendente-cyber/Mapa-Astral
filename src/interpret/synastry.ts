import type { AspectKey, PointKey } from '../astro/constants'
import { POINTS } from '../astro/constants'
import type { SynAspect } from '../astro/synastry'
import { HOUSE_TEXT, PLANET_TEXT } from './planets'

/** Specific meaning of the most important inter-chart contacts. */
const PAIR_TEXT: Record<string, { flow: string; tension: string }> = {
  'sun|moon': {
    flow: 'Um dos laços mais clássicos de compatibilidade: a essência de um ilumina o mundo emocional do outro. Há sensação de complementaridade, como dia e noite que se completam.',
    tension: 'A vontade de um nem sempre acolhe as necessidades emocionais do outro. Com consciência, a relação ensina a equilibrar o "eu quero" com o "eu preciso".',
  },
  'venus|mars': {
    flow: 'Química natural: o desejo de um encontra o charme do outro. Atração fluida, sensual e divertida.',
    tension: 'Atração intensa, com faíscas — paixão e atrito andam juntos. O desafio é transformar a tensão em magnetismo, não em disputa.',
  },
  'moon|moon': {
    flow: 'Vocês sentem o mundo de forma parecida. Há conforto, ritmo emocional compartilhado e facilidade de convivência.',
    tension: 'Necessidades emocionais diferentes: o que acalma um pode inquietar o outro. Aprender a linguagem afetiva do parceiro é essencial.',
  },
  'sun|sun': {
    flow: 'Identidades que se apoiam: vocês reconhecem e celebram o brilho um do outro.',
    tension: 'Duas vontades fortes em direções diferentes. Respeito à individualidade evita disputas de ego.',
  },
  'venus|venus': {
    flow: 'Gostos, valores e formas de amar em sintonia — prazeres compartilhados com facilidade.',
    tension: 'Formas diferentes de demonstrar amor e lidar com dinheiro. Conversar sobre valores evita mal-entendidos.',
  },
  'mercury|mercury': {
    flow: 'Conversa fácil, humor parecido, mentes que se entendem rapidamente.',
    tension: 'Estilos de pensar diferentes podem gerar discussões — ou debates estimulantes.',
  },
  'venus|moon': {
    flow: 'Ternura e acolhimento mútuo: um sabe exatamente como fazer o outro se sentir amado.',
    tension: 'Carinho existe, mas as expectativas afetivas nem sempre coincidem. Pequenos gestos fazem grande diferença.',
  },
  'sun|venus': {
    flow: 'Admiração e afeto: um enxerga beleza na essência do outro. Ótimo para romance e amizade.',
    tension: 'Carinho com cobranças: o desejo de agradar pode virar expectativa de aprovação.',
  },
  'mars|mars': {
    flow: 'Energias que se somam: vocês agem bem juntos, com ritmo e iniciativa compatíveis.',
    tension: 'Competição e impaciência podem surgir. Canalize a energia para projetos e esportes em comum.',
  },
  'saturn|sun': {
    flow: 'Estrutura e lealdade: um dá forma e estabilidade aos sonhos do outro. Laço de longo prazo.',
    tension: 'Um pode sentir-se limitado ou cobrado pelo outro. Com maturidade, vira compromisso sólido.',
  },
  'saturn|moon': {
    flow: 'Segurança emocional e responsabilidade — vínculo que amadurece com o tempo.',
    tension: 'Frieza percebida ou medo de rejeição. Paciência e palavras de afeto suavizam esse contato.',
  },
  'saturn|venus': {
    flow: 'Amor fiel e comprometido: a relação tende a durar.',
    tension: 'O afeto encontra barreiras — sensação de distância ou de "dever". Pede leveza e demonstrações explícitas.',
  },
  'jupiter|sun': {
    flow: 'Um expande e abençoa o outro: otimismo, generosidade e crescimento juntos.',
    tension: 'Excessos e promessas exageradas. Ainda assim, há muita boa vontade.',
  },
  'jupiter|venus': {
    flow: 'Alegria, generosidade e prazer: a relação traz sorte e leveza.',
    tension: 'Indulgência em excesso — cuidado com gastos e exageros a dois.',
  },
  'node|sun': {
    flow: 'Encontro de destino: um ajuda o outro a seguir seu caminho evolutivo.',
    tension: 'Encontro marcante que desafia a sair da zona de conforto.',
  },
  'node|moon': {
    flow: 'Sensação de já se conhecerem: vínculo kármico e familiar.',
    tension: 'Laço emocional que pede crescimento e desapego de padrões antigos.',
  },
  'pluto|venus': {
    flow: 'Amor profundo e transformador, com grande magnetismo.',
    tension: 'Intensidade que pode virar ciúme ou controle. Confiança é a chave.',
  },
  'pluto|mars': {
    flow: 'Força e paixão concentradas: juntos, vocês realizam muito.',
    tension: 'Lutas de poder possíveis — a intensidade precisa de canais saudáveis.',
  },
  'neptune|venus': {
    flow: 'Romantismo, inspiração e sensação de amor ideal.',
    tension: 'Idealização: cuidado para enxergar a pessoa real, não a fantasia.',
  },
  'uranus|venus': {
    flow: 'Atração elétrica e libertadora — a relação é viva e surpreendente.',
    tension: 'Instabilidade e necessidade de espaço. Liberdade combinada evita rupturas.',
  },
  'asc|sun': {
    flow: 'Afinidade imediata: um reconhece e ilumina a forma de ser do outro.',
    tension: 'Atração com atrito de estilos — vocês se notam intensamente.',
  },
  'asc|moon': {
    flow: 'Conforto instintivo: sentem-se à vontade juntos desde o início.',
    tension: 'Reações instintivas diferentes; paciência traz intimidade.',
  },
  'asc|venus': {
    flow: 'Atração estética e simpatia natural — um acha o outro encantador.',
    tension: 'Encanto com expectativas — cuidado com julgamentos de aparência.',
  },
  'asc|mars': {
    flow: 'Energia e desejo: um ativa o outro fisicamente.',
    tension: 'Faíscas e impaciência; muita energia para canalizar.',
  },
}

const key = (a: PointKey, b: PointKey) => {
  const k1 = `${a}|${b}`, k2 = `${b}|${a}`
  return PAIR_TEXT[k1] ? k1 : PAIR_TEXT[k2] ? k2 : null
}

const NATURE_TEXT: Record<AspectKey, string> = {
  conjunction: 'se fundem — energia intensa e marcante na relação',
  trine: 'fluem com naturalidade — um talento da relação',
  sextile: 'cooperam — oportunidades que crescem com iniciativa',
  square: 'se desafiam — atrito que gera crescimento',
  opposition: 'se espelham — atração de opostos que pede equilíbrio',
  quincunx: 'pedem ajustes constantes',
  semisextile: 'roçam-se sutilmente',
}

export function synAspectText(s: SynAspect, nameA: string, nameB: string): string {
  const k = key(s.a, s.b)
  const nature = s.type.nature
  const intro = `${POINTS[s.a].name} de ${nameA} e ${POINTS[s.b].name} de ${nameB} ${NATURE_TEXT[s.type.key]}.`
  if (k) {
    const t = PAIR_TEXT[k]
    const txt = nature === 'tenso' ? t.tension : nature === 'harmonico' ? t.flow : `${t.flow} A conjunção torna esse encontro especialmente intenso.`
    return `${intro} ${txt}`
  }
  const pa = PLANET_TEXT[s.a]?.principle.toLowerCase() ?? POINTS[s.a].name
  const pb = PLANET_TEXT[s.b]?.principle.toLowerCase() ?? POINTS[s.b].name
  return `${intro} Aqui se encontram ${pa} de um e ${pb} do outro.`
}

const OVERLAY_TEXT: Partial<Record<PointKey, string>> = {
  sun: 'ilumina e dá vitalidade',
  moon: 'traz intimidade e conforto emocional',
  mercury: 'estimula conversas e ideias',
  venus: 'traz afeto, beleza e prazer',
  mars: 'ativa, energiza e às vezes provoca',
  jupiter: 'expande e traz sorte',
  saturn: 'estrutura, cobra responsabilidade e amadurece',
  uranus: 'surpreende e liberta',
  neptune: 'inspira, encanta — e pode confundir',
  pluto: 'transforma profundamente',
}

export function overlayText(planet: PointKey, house: number, guest: string, host: string): string {
  const h = HOUSE_TEXT[house - 1]
  return `${POINTS[planet].name} de ${guest} cai na ${h.name.toLowerCase()} de ${host} (${h.theme.toLowerCase()}): ${guest} ${OVERLAY_TEXT[planet] ?? 'atua'} na área de ${h.keywords.join(', ')}.`
}

export function synSummary(total: number): { title: string; text: string } {
  if (total >= 75) return { title: 'Conexão luminosa', text: 'Uma combinação de grande afinidade: os contatos harmônicos predominam e a relação tende a fluir com naturalidade. Os desafios existem, mas encontram terreno fértil para serem superados.' }
  if (total >= 60) return { title: 'Boa sintonia', text: 'Há afinidades reais e áreas de crescimento. A relação tem base para florescer, especialmente quando vocês cultivam os pontos fortes abaixo.' }
  if (total >= 45) return { title: 'Encontro de aprendizado', text: 'Uma relação que mistura facilidade e atrito em medidas parecidas. Vocês se ensinam muito — o resultado depende da consciência e do diálogo.' }
  return { title: 'Encontro desafiador', text: 'Os contatos tensos são marcantes. Isso não impede o vínculo — muitas relações intensas nascem assim — mas pede maturidade, paciência e comunicação clara.' }
}
