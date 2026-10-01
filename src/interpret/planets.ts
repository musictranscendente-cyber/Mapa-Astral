import type { PointKey } from '../astro/constants'

export interface PlanetText {
  principle: string
  keywords: string[]
  /** Completes: "<name> em <signo> indica que você ___ <style>". */
  verb: string
  description: string
  transit: string
}

export const PLANET_TEXT: Partial<Record<PointKey, PlanetText>> = {
  sun: {
    principle: 'Identidade, vitalidade e propósito',
    keywords: ['eu', 'vontade', 'propósito', 'consciência'],
    verb: 'expressa sua identidade e busca brilhar',
    description: 'O Sol é o centro do mapa: sua essência, aquilo que você veio desenvolver e irradiar.',
    transit: 'ilumina, dá visibilidade e vitalidade',
  },
  moon: {
    principle: 'Emoções, necessidades e memória',
    keywords: ['sentir', 'nutrir', 'segurança', 'instinto'],
    verb: 'sente, se protege e busca acolhimento',
    description: 'A Lua é seu mundo interior: emoções, hábitos, memórias e o que nutre sua alma.',
    transit: 'desperta emoções e humor passageiro',
  },
  mercury: {
    principle: 'Mente, comunicação e aprendizado',
    keywords: ['pensar', 'falar', 'aprender', 'conectar'],
    verb: 'pensa, comunica e aprende',
    description: 'Mercúrio mostra como sua mente funciona: raciocínio, fala, escrita e curiosidade.',
    transit: 'ativa conversas, ideias, notícias e decisões',
  },
  venus: {
    principle: 'Amor, beleza e valores',
    keywords: ['amar', 'atrair', 'valorizar', 'harmonizar'],
    verb: 'ama, se relaciona e aprecia a beleza',
    description: 'Vênus revela como você ama, o que acha belo e o que valoriza — inclusive financeiramente.',
    transit: 'traz harmonia, afeto, prazer e atração',
  },
  mars: {
    principle: 'Ação, desejo e coragem',
    keywords: ['agir', 'desejar', 'conquistar', 'defender'],
    verb: 'age, deseja e luta pelo que quer',
    description: 'Marte é sua força de ação: como você conquista, se defende e expressa o desejo.',
    transit: 'traz impulso, energia, pressa e possíveis atritos',
  },
  jupiter: {
    principle: 'Expansão, fé e sabedoria',
    keywords: ['expandir', 'crer', 'ensinar', 'prosperar'],
    verb: 'cresce, encontra sentido e atrai oportunidades',
    description: 'Júpiter mostra onde você encontra sorte, fé, abundância e desejo de crescer.',
    transit: 'expande, abre portas e traz otimismo',
  },
  saturn: {
    principle: 'Estrutura, limite e maturidade',
    keywords: ['estruturar', 'amadurecer', 'responsabilizar', 'perseverar'],
    verb: 'enfrenta responsabilidades e constrói com disciplina',
    description: 'Saturno é o mestre do tempo: mostra seus desafios, medos e onde você constrói autoridade.',
    transit: 'testa, cobra maturidade e consolida',
  },
  uranus: {
    principle: 'Liberdade, ruptura e inovação',
    keywords: ['libertar', 'inovar', 'despertar', 'romper'],
    verb: 'busca liberdade e rompe padrões',
    description: 'Urano é o despertar súbito: onde você é original, rebelde e anseia por liberdade.',
    transit: 'traz surpresas, rupturas e despertares',
  },
  neptune: {
    principle: 'Espiritualidade, sonho e dissolução',
    keywords: ['sonhar', 'transcender', 'inspirar', 'dissolver'],
    verb: 'sonha, se inspira e transcende',
    description: 'Netuno é o oceano do inconsciente: intuição, arte, espiritualidade e ilusões.',
    transit: 'sensibiliza, inspira, mas pode confundir',
  },
  pluto: {
    principle: 'Transformação, poder e renascimento',
    keywords: ['transformar', 'regenerar', 'aprofundar', 'empoderar'],
    verb: 'se transforma profundamente e encontra seu poder',
    description: 'Plutão é a força de morte e renascimento: onde você vive transformações profundas.',
    transit: 'transforma profundamente e revela o oculto',
  },
  node: {
    principle: 'Destino e direção evolutiva',
    keywords: ['evoluir', 'crescer', 'propósito da alma'],
    verb: 'encontra sua direção evolutiva',
    description: 'O Nodo Norte aponta o caminho de crescimento da alma nesta vida — o desconhecido que chama.',
    transit: 'traz encontros e situações de destino',
  },
  southNode: {
    principle: 'Talentos passados e zona de conforto',
    keywords: ['memória da alma', 'dons inatos', 'hábito'],
    verb: 'repousa em talentos já conhecidos',
    description: 'O Nodo Sul mostra dons trazidos de outras etapas e padrões que pedem desapego.',
    transit: 'faz revisitar o passado',
  },
  lilith: {
    principle: 'Sombra, instinto e poder selvagem',
    keywords: ['instinto', 'tabu', 'autonomia'],
    verb: 'guarda seu instinto mais livre e indomado',
    description: 'Lilith, a Lua Negra, revela onde você não aceita submissão e onde guarda feridas e potência selvagem.',
    transit: 'traz à tona desejos reprimidos',
  },
  asc: {
    principle: 'Persona e forma de iniciar',
    keywords: ['aparência', 'abordagem', 'corpo'],
    verb: 'se apresenta ao mundo',
    description: 'O Ascendente é a porta de entrada: como você se mostra, inicia e é percebido.',
    transit: '',
  },
  mc: {
    principle: 'Vocação e realização pública',
    keywords: ['carreira', 'reputação', 'missão'],
    verb: 'busca reconhecimento e realização',
    description: 'O Meio do Céu é o ponto mais alto do mapa: vocação, carreira e legado.',
    transit: '',
  },
}

export interface HouseText {
  name: string
  theme: string
  keywords: string[]
  description: string
}

export const HOUSE_TEXT: HouseText[] = [
  { name: 'Casa 1', theme: 'Identidade e aparência', keywords: ['eu', 'corpo', 'presença'], description: 'A Casa 1 é o início de tudo: sua personalidade, seu corpo, sua maneira espontânea de reagir à vida.' },
  { name: 'Casa 2', theme: 'Recursos e valores', keywords: ['dinheiro', 'talentos', 'autoestima'], description: 'A Casa 2 fala de recursos materiais, talentos, autoestima e daquilo que você valoriza.' },
  { name: 'Casa 3', theme: 'Comunicação e entorno', keywords: ['irmãos', 'estudos', 'trocas'], description: 'A Casa 3 rege a comunicação, os estudos, os irmãos, vizinhos e deslocamentos curtos.' },
  { name: 'Casa 4', theme: 'Lar e raízes', keywords: ['família', 'origem', 'intimidade'], description: 'A Casa 4 é a base do mapa: lar, família, ancestralidade e sua vida emocional íntima.' },
  { name: 'Casa 5', theme: 'Criatividade e prazer', keywords: ['romance', 'filhos', 'arte'], description: 'A Casa 5 é a casa da alegria: romances, criatividade, filhos, hobbies e autoexpressão.' },
  { name: 'Casa 6', theme: 'Rotina e saúde', keywords: ['trabalho diário', 'corpo', 'serviço'], description: 'A Casa 6 rege a rotina, a saúde, os hábitos e o trabalho do dia a dia.' },
  { name: 'Casa 7', theme: 'Parcerias', keywords: ['casamento', 'sócios', 'o outro'], description: 'A Casa 7 é o espelho: casamento, parcerias, contratos e o que você projeta no outro.' },
  { name: 'Casa 8', theme: 'Transformação e intimidade', keywords: ['crises', 'sexualidade', 'heranças'], description: 'A Casa 8 rege transformações, intimidade profunda, recursos compartilhados e o oculto.' },
  { name: 'Casa 9', theme: 'Expansão e sentido', keywords: ['viagens', 'filosofia', 'ensino'], description: 'A Casa 9 é a busca de sentido: viagens longas, estudos superiores, fé e filosofia de vida.' },
  { name: 'Casa 10', theme: 'Carreira e vocação', keywords: ['status', 'missão', 'autoridade'], description: 'A Casa 10 é o topo do mapa: carreira, reputação, vocação e realizações públicas.' },
  { name: 'Casa 11', theme: 'Amigos e sonhos', keywords: ['grupos', 'projetos', 'futuro'], description: 'A Casa 11 rege amizades, grupos, redes, causas coletivas e os sonhos para o futuro.' },
  { name: 'Casa 12', theme: 'Espiritualidade e inconsciente', keywords: ['retiro', 'karma', 'transcendência'], description: 'A Casa 12 é o oceano interior: espiritualidade, inconsciente, retiro e o que está oculto.' },
]

/** Phrase for a planet occupying a house. */
export function planetInHouse(planet: PointKey, house: number): string {
  const p = PLANET_TEXT[planet]
  const h = HOUSE_TEXT[house - 1]
  if (!p) return ''
  return `Na ${h.name.toLowerCase()} (${h.theme.toLowerCase()}), esta energia de ${p.principle.toLowerCase()} se manifesta sobretudo nos temas de ${h.keywords.join(', ')}. É nessa área da vida que você ${p.verb}.`
}
