import type { PlanetKey } from '../astro/constants'
import type { AngleKey } from '../astro/astrocarto'

export const ANGLE_NAME: Record<AngleKey, string> = { AC: 'Ascendente', MC: 'Meio do Céu', DC: 'Descendente', IC: 'Fundo do Céu' }

/** What each kind of line means, for the "how to read" guide. */
export const ANGLE_GUIDE: Record<AngleKey, { title: string; text: string }> = {
  AC: {
    title: 'AC · Ascendente — linha cheia',
    text: 'Onde o planeta estava nascendo no horizonte. Perto dela, ele age em você mesmo: no corpo, na energia, no jeito como as pessoas te percebem. É a linha mais "pessoal".',
  },
  MC: {
    title: 'MC · Meio do Céu — linha cheia vertical',
    text: 'Onde o planeta estava no ponto mais alto do céu. Mexe com carreira, reputação e vida pública: é a linha da vocação e de como você é reconhecido ali.',
  },
  DC: {
    title: 'DC · Descendente — linha tracejada',
    text: 'Onde o planeta estava se pondo. Age através dos outros: parcerias, casamento, sócios, clientes e até rivais. Mostra o tipo de pessoa que você tende a encontrar ali.',
  },
  IC: {
    title: 'IC · Fundo do Céu — linha pontilhada vertical',
    text: 'Onde o planeta estava sob seus pés, do outro lado da Terra. Fala de lar, família, raízes e vida íntima: é a linha de "morar", mais sentida no dia a dia da casa.',
  },
}

/** Short note per planet for the guide: what it brings and when to be careful. */
export const PLANET_GUIDE: Partial<Record<PlanetKey, string>> = {
  sun: 'vitalidade, autoconfiança e destaque',
  moon: 'emoções, acolhimento e sensação de pertencer',
  mercury: 'ideias, estudos, contatos e negócios',
  venus: 'amor, beleza, prazer e boas relações',
  mars: 'energia e coragem — também pressa e conflitos',
  jupiter: 'sorte, crescimento e oportunidades',
  saturn: 'esforço, estrutura e amadurecimento — às vezes peso',
  uranus: 'mudanças, liberdade e imprevistos',
  neptune: 'inspiração e espiritualidade — também confusão',
  pluto: 'transformação profunda, poder e intensidade',
}

const LINES: Partial<Record<PlanetKey, Record<AngleKey, string>>> = {
  sun: {
    AC: 'Você se sente mais vivo, confiante e visível; ótimo para recomeçar e cuidar da autoestima.',
    MC: 'Linha de sucesso e reconhecimento profissional: chance de liderar e ser notado pelo que faz.',
    DC: 'Parcerias marcantes, com pessoas fortes e brilhantes; você se descobre através do outro.',
    IC: 'Sensação de lar e orgulho das raízes; bom para formar família e criar uma base sólida.',
  },
  moon: {
    AC: 'Fica mais sensível, intuitivo e acolhedor; as pessoas se aproximam com facilidade.',
    MC: 'Contato com o público e trabalho que cuida de gente; popularidade, com algumas oscilações.',
    DC: 'Relações afetuosas e protetoras; vínculos emocionais profundos (às vezes dependência).',
    IC: 'Uma das melhores linhas para morar: sensação de casa, família e conforto emocional.',
  },
  mercury: {
    AC: 'Mente rápida, comunicativa e curiosa; bom para estudar, escrever e fazer contatos.',
    MC: 'Carreira em comunicação, ensino, comércio, tecnologia ou mídia ganha força.',
    DC: 'Sócios, contratos e trocas intelectuais; parcerias movidas por conversa e ideias.',
    IC: 'Casa movimentada, cheia de livros e conversas; bom para trabalhar ou estudar em casa.',
  },
  venus: {
    AC: 'Charme, beleza e magnetismo em alta; você se sente bem e atrai pessoas e gentilezas.',
    MC: 'Carreira ligada a arte, beleza, moda ou diplomacia; reputação simpática e boa rede.',
    DC: 'A linha clássica do amor: maior chance de romance, casamento e parcerias harmoniosas.',
    IC: 'Lar bonito e harmonioso, família em paz; um lugar gostoso para viver.',
  },
  mars: {
    AC: 'Energia física, coragem e iniciativa — mas também impaciência, brigas e risco de acidentes.',
    MC: 'Ambição e competitividade na carreira; bom para empreender e liderar, com disputas.',
    DC: 'Relações intensas e apaixonadas, porém com atritos; atrai pessoas fortes ou rivais.',
    IC: 'Muita energia em casa: reformas e mudanças, mas também tensões familiares.',
  },
  jupiter: {
    AC: 'Otimismo, generosidade e sorte pessoal; portas se abrem com facilidade.',
    MC: 'Uma das melhores linhas para a carreira: crescimento, prestígio e oportunidades.',
    DC: 'Parceiros e sócios generosos, que ajudam você a crescer; casamentos favorecidos.',
    IC: 'Casa ampla, família próspera e sensação de abundância; ótimo para morar.',
  },
  saturn: {
    AC: 'Seriedade e responsabilidade pesam; o lugar amadurece, mas pode cansar ou isolar.',
    MC: 'Carreira construída com esforço e paciência; reconhecimento lento, porém sólido.',
    DC: 'Relações sérias e comprometidas, às vezes frias ou com diferença de idade.',
    IC: 'Questões de família e da casa pedem trabalho; boa para criar raízes com disciplina.',
  },
  uranus: {
    AC: 'Liberdade, originalidade e mudanças súbitas; inspira, mas deixa o dia a dia instável.',
    MC: 'Carreira inovadora, tecnologia e viradas inesperadas de rumo profissional.',
    DC: 'Encontros surpreendentes e relações pouco convencionais, que pedem espaço.',
    IC: 'Mudanças frequentes de casa e de rotina; difícil se sentir assentado por muito tempo.',
  },
  neptune: {
    AC: 'Sensibilidade, criatividade e espiritualidade aumentam; cuidado com confusão e cansaço.',
    MC: 'Carreira em arte, música, cura ou espiritualidade; imagem pública inspiradora (ou difusa).',
    DC: 'Relações idealizadas e românticas; atenção a ilusões e decepções.',
    IC: 'Lar como refúgio espiritual perto da água ou da natureza; pouco prático, muito sensível.',
  },
  pluto: {
    AC: 'Transformação pessoal intensa: você se reinventa, com magnetismo e crises de crescimento.',
    MC: 'Poder e influência na carreira, com lutas de poder e grandes viradas.',
    DC: 'Relações profundas e transformadoras, que mexem com controle e ciúme.',
    IC: 'Mexe nas raízes e na família; lugar de cura profunda, nem sempre leve.',
  },
}

export const lineMeaning = (p: PlanetKey, a: AngleKey) => LINES[p]?.[a] ?? ''

export const BENEFIC: PlanetKey[] = ['sun', 'venus', 'jupiter', 'moon']

/** How strong a line is at a given distance from it. */
export const strengthLabel = (km: number) => (km < 250 ? 'influência forte' : km < 500 ? 'influência média' : 'influência leve')
