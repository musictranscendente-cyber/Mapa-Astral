import { byLang } from '../i18n'
import { PROG_MOON_SIGN_EN, PROG_PHASES_EN } from './en/returns'
import { PROG_MOON_SIGN_ES, PROG_PHASES_ES } from './es/returns'

/** Textos de progressões secundárias. */

const PROG_MOON_SIGN_PT = [
  'fase de iniciativa e coragem emocional: vontade de começar do zero e agir por instinto.',
  'fase de estabilidade e de cuidar do corpo, do conforto e dos recursos.',
  'fase curiosa e comunicativa: estudos, conversas e muita movimentação mental.',
  'fase de lar, família e raízes: necessidade de acolhimento e de cuidar de quem você ama.',
  'fase de brilho e criatividade: vontade de ser visto, de amar e de se expressar.',
  'fase de organização, trabalho e saúde: ajustar a rotina e se tornar útil.',
  'fase de relacionamentos: parcerias, casamento e acordos ganham importância.',
  'fase intensa e transformadora: crises que libertam e encontros profundos.',
  'fase de expansão: viagens, estudos e busca de sentido para a vida.',
  'fase de ambição e responsabilidade: construir algo sólido e ser reconhecido.',
  'fase de liberdade, amizades e projetos coletivos: abrir-se ao novo.',
  'fase de recolhimento e espiritualidade: encerrar ciclos e ouvir a intuição.',
]

/** Progressed lunation cycle (about 30 years; each phase ≈ 3,5 years). */
const PROG_PHASES_PT = [
  { name: 'Lua Nova progredida', text: 'Um grande ciclo de 30 anos começa: sementes de uma nova identidade, ainda sem forma clara. Confie no instinto.' },
  { name: 'Lua Crescente progredida', text: 'O novo ciclo luta para se firmar: é hora de sair do passado e dar os primeiros passos com coragem.' },
  { name: 'Quarto Crescente progredido', text: 'Fase de ação e de crises de crescimento: decisões e construções concretas para o novo caminho.' },
  { name: 'Lua Gibosa progredida', text: 'Fase de aperfeiçoamento: ajustar, estudar e preparar a plenitude que se aproxima.' },
  { name: 'Lua Cheia progredida', text: 'Culminação: o que foi plantado há cerca de 15 anos se revela. Clareza sobre relacionamentos e propósito.' },
  { name: 'Lua Disseminante progredida', text: 'Fase de compartilhar o que você aprendeu: ensinar, comunicar e colher frutos.' },
  { name: 'Quarto Minguante progredido', text: 'Crise de consciência: rever crenças e estruturas que já não servem. Reorientação interior.' },
  { name: 'Lua Balsâmica progredida', text: 'Fim de um grande ciclo: desapego, introspecção e preparação para um novo começo.' },
]


export const PROG_MOON_SIGN = byLang({ pt: PROG_MOON_SIGN_PT, en: PROG_MOON_SIGN_EN, es: PROG_MOON_SIGN_ES })
export const PROG_PHASES = byLang({ pt: PROG_PHASES_PT, en: PROG_PHASES_EN, es: PROG_PHASES_ES })
export const phaseOf = (angle: number) => PROG_PHASES[Math.floor(((angle + 22.5) % 360) / 45) % 8]
