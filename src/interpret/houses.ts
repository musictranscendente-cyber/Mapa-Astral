import type { Chart } from '../astro/chart'
import { POINTS, SIGNS, norm360, type PointKey } from '../astro/constants'
import { HOUSE_TEXT, planetInHouse } from './planets'

/** What each house covers in practice — a fuller version of HOUSE_TEXT.description. */
const HOUSE_DETAIL = [
  'Mostra como você chega no mundo: a primeira impressão, o jeito de começar as coisas, o corpo e a vitalidade. É a "porta de entrada" do mapa — o filtro pelo qual todo o resto se expressa.',
  'Fala de como você ganha, gasta e guarda dinheiro, mas também dos seus talentos naturais e da sua autoestima: aquilo que você sente que tem valor, em você e no mundo.',
  'Rege a mente do dia a dia: como você aprende, conversa, escreve e se informa. Inclui irmãos, primos, vizinhos, a escola dos primeiros anos e as pequenas viagens.',
  'É a base emocional: a casa onde você mora e a casa que existe dentro de você. Fala da família, da infância, das raízes, de um dos pais e do que te faz sentir seguro.',
  'É onde você brilha por prazer: romances, paqueras, filhos, arte, esportes, jogos e tudo o que faz o coração bater mais forte. Mostra como você se diverte e cria.',
  'Fala da rotina, dos hábitos, da saúde do corpo e do trabalho prático do dia a dia — inclusive colegas, funcionários e animais de estimação. É onde a vida se organiza.',
  'É a casa do "nós": casamento, parcerias, sócios, contratos e também rivais declarados. Mostra o tipo de pessoa que você atrai e o que aprende através do outro.',
  'Rege o que é profundo e compartilhado: intimidade, sexualidade, dinheiro do casal, heranças, dívidas e as crises que transformam. É a casa da morte e do renascimento simbólicos.',
  'É a busca de sentido: viagens longas, outras culturas, faculdade, filosofia, religião e tudo o que amplia a sua visão de mundo. Mostra no que você acredita.',
  'É o topo do mapa: carreira, vocação, reputação e o lugar que você quer ocupar no mundo. Também fala de autoridade, de chefes e de um dos pais.',
  'Fala dos amigos, dos grupos, das redes e das causas coletivas, e dos sonhos e projetos para o futuro. Mostra com quem você caminha e para onde quer ir.',
  'É o bastidor da alma: espiritualidade, intuição, sonhos, o inconsciente e o que fica escondido até de você. Rege retiros, hospitais e o que se faz em silêncio.',
]

/** How the sign on the cusp colours the matters of a house. */
const SIGN_STYLE = [
  'com iniciativa, pressa e coragem — você prefere agir primeiro e pensar depois',
  'com calma, constância e senso prático — você busca segurança e conforto',
  'com curiosidade, conversa e variedade — você precisa de troca e movimento',
  'com sensibilidade, cuidado e memória afetiva — você protege e é protegido',
  'com orgulho, generosidade e vontade de brilhar — você quer ser reconhecido',
  'com atenção aos detalhes, método e senso de utilidade — você quer fazer bem feito',
  'com diplomacia, charme e busca de equilíbrio — você pensa no outro e na harmonia',
  'com intensidade, profundidade e desejo de controle — tudo ou nada',
  'com otimismo, fé e sede de liberdade — você quer crescer e ir além',
  'com seriedade, responsabilidade e paciência — você constrói aos poucos e para durar',
  'com originalidade, independência e espírito de grupo — você faz do seu jeito',
  'com intuição, empatia e um toque de idealismo — você sente mais do que explica',
]

export interface HouseReading {
  house: number
  sign: number
  detail: string
  cusp: string
  ruler: { planet: PointKey; house: number; text: string }
  planets: { planet: PointKey; text: string }[]
  empty: string | null
}

/** Full reading of one house of a chart with known birth time. */
export function houseReading(chart: Chart, index: number): HouseReading {
  const n = index + 1
  const sign = Math.floor(norm360(chart.cusps[index]) / 30)
  const theme = HOUSE_TEXT[index].theme.toLowerCase()
  const rulerKey = SIGNS[sign].ruler
  const rulerHouse = chart.points[rulerKey].house
  const rulerTheme = HOUSE_TEXT[rulerHouse - 1].theme.toLowerCase()
  const ruler = {
    planet: rulerKey,
    house: rulerHouse,
    text: rulerHouse === n
      ? `${POINTS[rulerKey].name}, o regente de ${SIGNS[sign].name}, está na própria casa ${n}: estes temas ganham força e independência — você tende a resolver tudo aqui com os próprios recursos.`
      : `${POINTS[rulerKey].name}, o regente de ${SIGNS[sign].name}, está na casa ${rulerHouse} (${rulerTheme}): os temas de ${theme} se ligam diretamente aos temas de ${rulerTheme}. Uma área alimenta a outra.`,
  }
  const planets = (Object.keys(chart.points) as PointKey[])
    .filter((k) => !['asc', 'mc', 'dsc', 'ic', 'southNode'].includes(k) && chart.points[k].house === n)
    .map((k) => ({ planet: k, text: planetInHouse(k, n) }))
  return {
    house: n,
    sign,
    detail: HOUSE_DETAIL[index],
    cusp: `Com ${SIGNS[sign].name} na cúspide, você vive os temas de ${theme} ${SIGN_STYLE[sign]}.`,
    ruler,
    planets,
    empty: planets.length
      ? null
      : 'Casa sem planetas não é uma área parada: só não pede tanta atenção. Ela funciona pelo signo da cúspide e pelo regente acima.',
  }
}

/** One line per house for the full-analysis summary. */
export function housesSummary(chart: Chart): string[] {
  return chart.cusps.map((_, i) => {
    const r = houseReading(chart, i)
    const inside = r.planets.map((p) => POINTS[p.planet].name).join(', ')
    return `- Casa ${r.house} (${HOUSE_TEXT[i].theme}): cúspide em ${SIGNS[r.sign].name}; regente ${POINTS[r.ruler.planet].name} na casa ${r.ruler.house}${inside ? `; planetas: ${inside}` : '; sem planetas'}`
  })
}
