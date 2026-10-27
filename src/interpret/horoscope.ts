import { POINTS, SIGNS } from '../astro/constants'
import type { Horoscope } from '../astro/horoscope'
import { byLang, locale, t } from '../i18n'
import { HEADLINE_EN, HOUSE_SHORT_EN, MARS_ACTION_EN, MERCURY_MIND_EN, MOON_DAY_EN, PHASE_TIP_EN, VENUS_LOVE_EN } from './en/horoscope'
import { HEADLINE_ES, HOUSE_SHORT_ES, MARS_ACTION_ES, MERCURY_MIND_ES, MOON_DAY_ES, PHASE_TIP_ES, VENUS_LOVE_ES } from './es/horoscope'

/** Moon in each solar house: the main theme of the day. */
const MOON_DAY_PT = [
  'A Lua passa pelo seu signo e coloca você no centro: emoções à flor da pele, vontade de cuidar de si e de ser notado. Bom dia para começar algo que tenha a sua cara.',
  'Com a Lua na sua casa do dinheiro e dos valores, o foco vai para segurança e conforto. Organize as finanças, saboreie pequenos prazeres e evite compras por impulso.',
  'A Lua movimenta conversas, mensagens e pequenos deslocamentos. Dia ágil, de trocas e ideias — ótimo para estudar, escrever ou resolver pendências do bairro e da família.',
  'A Lua chega à base do seu mapa: vontade de casa, de família e de recolhimento. Cuide do seu ninho, das raízes e das emoções antigas que pedem colo.',
  'A Lua acende sua casa da alegria: romance, criatividade, filhos e diversão ganham força. Permita-se brincar, criar e flertar com a vida.',
  'Com a Lua na casa da rotina e da saúde, o dia pede ordem: organizar tarefas, cuidar do corpo e do trabalho prático. Pequenos ajustes trazem grande bem-estar.',
  'A Lua ilumina suas parcerias: o outro ganha importância. Dia de conversar, negociar e cultivar o relacionamento — escute antes de responder.',
  'A Lua mergulha na sua casa das transformações: emoções intensas, intimidade e assuntos de dinheiro compartilhado. Bom para encerrar ciclos e olhar para o que está oculto.',
  'A Lua abre horizontes: vontade de aprender, viajar ou buscar sentido. Leia, planeje uma viagem, converse sobre fé e filosofia — sua mente pede amplitude.',
  'A Lua passa pelo topo do seu mapa: carreira e reputação em evidência. Suas atitudes ficam visíveis; mostre seu trabalho e cuide da imagem pública.',
  'A Lua movimenta amizades, grupos e projetos de futuro. Dia de rede, de colaboração e de sonhar junto — um contato pode abrir uma porta.',
  'A Lua recolhe-se na sua casa mais íntima: dia de descanso, intuição e silêncio. Menos agenda, mais escuta interior — sonhos podem trazer mensagens.',
]

const VENUS_LOVE_PT = [
  'Vênus no seu signo deixa você magnético: charme, beleza e facilidade de atrair.',
  'No amor, valorize gestos concretos e conforto a dois; presentes e mimos funcionam.',
  'Conversas leves e mensagens carinhosas aproximam — o flerte está nas palavras.',
  'O afeto pede aconchego: um programa em casa vale mais do que um grande evento.',
  'Romance em alta: dia propício para paquera, encontros e declarações.',
  'O amor se mostra no cuidado do dia a dia — pequenas atenções fazem diferença.',
  'Vênus favorece parcerias: harmonia, acordos e encontros significativos.',
  'Intensidade e entrega no amor; cuidado com ciúmes e jogos de poder.',
  'O coração quer aventura: alguém diferente ou um programa novo encanta.',
  'Afetos e carreira se cruzam: simpatia abre portas no trabalho.',
  'Amizades podem virar algo mais; grupos trazem boas companhias.',
  'Amores discretos ou do passado podem voltar à memória; cuide do seu coração em silêncio.',
]

const MARS_ACTION_PT = [
  'Marte no seu signo dá energia de sobra: comece, lidere, mas evite atropelar os outros.',
  'Use sua força para gerar recursos; trabalho duro rende, mas sem gastos impulsivos.',
  'Mente acelerada: defenda suas ideias com firmeza, sem transformar conversa em briga.',
  'Energia voltada para casa e família: reformas e arrumações rendem; evite discussões domésticas.',
  'Disposição para criar, praticar esportes e se divertir com intensidade.',
  'Produtividade alta no trabalho e na rotina; respeite os limites do corpo.',
  'Parcerias pedem negociação: competição ou conflitos podem surgir — escolha suas batalhas.',
  'Força para enfrentar crises e transformar o que precisa mudar.',
  'Vontade de expandir, estudar e conquistar novos territórios.',
  'Ambição em alta: bom para metas de carreira e decisões importantes.',
  'Energia para projetos coletivos; cuidado com atritos em grupos.',
  'Energia mais baixa e interior: descanse e aja nos bastidores.',
]

const MERCURY_MIND_PT = [
  'Mercúrio no seu signo favorece se expressar e defender suas ideias.',
  'Bom momento para planejar finanças e negociar valores.',
  'Comunicação fluida: ótimo para estudos, contratos e mensagens importantes.',
  'Conversas em família ajudam a resolver pendências antigas.',
  'Ideias criativas surgem com facilidade; anote tudo.',
  'Mente organizada: ótimo para listas, prazos e detalhes do trabalho.',
  'Diálogo é a chave nas parcerias; acordos claros evitam ruídos.',
  'Pesquisas e conversas profundas revelam informações importantes.',
  'Curiosidade em alta: cursos, viagens e novas ideias atraem.',
  'Comunique-se com estratégia no trabalho; sua palavra tem peso.',
  'Trocas com amigos e redes trazem boas ideias.',
  'Reflexão silenciosa: escreva, medite e escute a intuição.',
]

const PHASE_TIP_PT: Record<string, string> = {
  'Lua Nova': 'Lua Nova: plante intenções e comece com calma.',
  'Lua Crescente': 'Lua Crescente: tempo de agir e dar os primeiros passos.',
  'Quarto Crescente': 'Quarto Crescente: supere obstáculos e ajuste a rota.',
  'Crescente Gibosa': 'Crescente Gibosa: refine e prepare a colheita.',
  'Lua Cheia': 'Lua Cheia: emoções intensas — colha, celebre e veja com clareza.',
  'Minguante Gibosa': 'Minguante Gibosa: compartilhe o que aprendeu e agradeça.',
  'Quarto Minguante': 'Quarto Minguante: solte o que pesa e reorganize.',
  'Lua Minguante': 'Lua Minguante: descanse, limpe e encerre ciclos.',
}

const HOUSE_SHORT_PT = ['você mesmo', 'dinheiro e valores', 'comunicação', 'lar e família', 'amor e criatividade', 'rotina e saúde',
  'parcerias', 'transformações', 'estudos e viagens', 'carreira', 'amigos e projetos', 'vida interior']

export interface HoroscopeText {
  headline: string
  day: string
  love: string
  work: string
  mind: string
  highlight: string | null
  tip: string
}

const HEADLINE_PT: Record<number, string[]> = {
  5: ['Dia luminoso: o céu joga a seu favor', 'Portas abertas e boa sorte no ar'],
  4: ['Dia de fluxo e boas conexões', 'Energia favorável para avançar'],
  3: ['Dia de equilíbrio: escolha suas prioridades', 'Constância traz bons resultados'],
  2: ['Dia de paciência e ajustes', 'Desafios pedem calma e estratégia'],
  1: ['Dia de recolhimento e cuidado', 'Vá devagar: o céu pede pausa'],
}

const MOON_DAY = byLang({ pt: MOON_DAY_PT, en: MOON_DAY_EN, es: MOON_DAY_ES })
const VENUS_LOVE = byLang({ pt: VENUS_LOVE_PT, en: VENUS_LOVE_EN, es: VENUS_LOVE_ES })
const MARS_ACTION = byLang({ pt: MARS_ACTION_PT, en: MARS_ACTION_EN, es: MARS_ACTION_ES })
const MERCURY_MIND = byLang({ pt: MERCURY_MIND_PT, en: MERCURY_MIND_EN, es: MERCURY_MIND_ES })
const PHASE_TIP = byLang({ pt: PHASE_TIP_PT, en: PHASE_TIP_EN, es: PHASE_TIP_ES })
const HOUSE_SHORT = byLang({ pt: HOUSE_SHORT_PT, en: HOUSE_SHORT_EN, es: HOUSE_SHORT_ES })
const HEADLINE = byLang({ pt: HEADLINE_PT, en: HEADLINE_EN, es: HEADLINE_ES })

export function horoscopeText(h: Horoscope): HoroscopeText {
  const p = h.planets
  const headlines = HEADLINE[h.scores.geral]
  const headline = headlines[(h.date.getDate() + h.sign) % headlines.length]
  let day = MOON_DAY[p.moon.house - 1]
  if (h.moonIngress) {
    const hora = h.moonIngress.at.toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' })
    day += ` ${t('Às {time}, a Lua entra em {sign} e o clima muda para {theme}.', { time: hora, sign: SIGNS[h.moonIngress.sign].name, theme: HOUSE_SHORT[(h.moonIngress.sign - h.sign + 12) % 12] })}`
  }
  const work = `${MARS_ACTION[p.mars.house - 1]}${p.mercury.retro ? ` ${t('Mercúrio está retrógrado: revise antes de assinar ou enviar.')}` : ''}`
  let highlight: string | null = null
  if (h.aspect) {
    const a = h.aspect
    const tone = t(a.key === 'conjunction' ? 'funde e intensifica' : a.harmonious ? 'une com facilidade' : 'coloca em tensão')
    const temas = a.houseA === a.houseB ? t('o tema de {a}', { a: HOUSE_SHORT[a.houseA - 1] }) : t('os temas de {a} e {b}', { a: HOUSE_SHORT[a.houseA - 1], b: HOUSE_SHORT[a.houseB - 1] })
    highlight = t('{a} em {type} com {b}: o céu {tone} {themes} para você.', { a: POINTS[a.a].name, type: a.type, b: POINTS[a.b].name, tone, themes: temas })
  }
  return {
    headline,
    day,
    love: VENUS_LOVE[p.venus.house - 1],
    work,
    mind: MERCURY_MIND[p.mercury.house - 1],
    highlight,
    tip: PHASE_TIP[h.phase.name] ?? '',
  }
}
