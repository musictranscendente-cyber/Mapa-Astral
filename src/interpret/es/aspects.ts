import type { AspectKey, PlanetKey, PointKey } from '../../astro/constants'

export const CHIRON_SIGN_ES: { wound: string; gift: string }[] = [
  { wound: 'una herida ligada al derecho de existir, de afirmarte y de ocupar tu propio espacio', gift: 'el coraje de ser quien eres — y de animar a otras personas a hacer lo mismo' },
  { wound: 'inseguridades con tu propio valor, el cuerpo, el dinero o la estabilidad', gift: 'una presencia serena que enseña a los demás a sentirse seguros y merecedores' },
  { wound: 'el miedo a no ser escuchado, a no ser lo bastante inteligente o a no saber expresarte', gift: 'la palabra que sana: escribir, enseñar y traducir lo que los demás no logran decir' },
  { wound: 'un dolor ligado a la familia, la acogida y el sentimiento de pertenencia', gift: 'la capacidad de nutrir y crear hogares — físicos y emocionales — donde los demás se sienten en casa' },
  { wound: 'la duda sobre tu propio brillo, el miedo a no ser visto ni reconocido', gift: 'inspirar e iluminar el talento ajeno, devolviendo a las personas la alegría de crear' },
  { wound: 'la exigencia de perfección, la sensación de nunca ser útil o lo bastante bueno', gift: 'una sanación práctica y paciente, que transforma rutinas y cuida del cuerpo y de la mente' },
  { wound: 'heridas en las relaciones: rechazo, desequilibrio o miedo a quedarte solo', gift: 'la capacidad de mediar, armonizar y ayudar a los demás a relacionarse mejor' },
  { wound: 'cuestiones de confianza, intimidad, pérdidas o control', gift: 'acompañar a personas en crisis profundas y mostrar que es posible renacer' },
  { wound: 'una búsqueda dolorosa de sentido, fe o verdad', gift: 'ser guía y maestro: abrir horizontes y devolver la esperanza a quien la perdió' },
  { wound: 'la presión por el reconocimiento y la autoridad, o por cargar responsabilidades demasiado pronto', gift: 'un liderazgo maduro y humano, que sostiene a los demás con firmeza y cuidado' },
  { wound: 'el sentimiento de ser diferente, de no pertenecer al grupo', gift: 'la originalidad al servicio del colectivo — unir a las personas en torno a algo nuevo' },
  { wound: 'límites frágiles, sensibilidad extrema o sensación de abandono espiritual', gift: 'una compasión inmensa, que sana con la presencia, el arte y la espiritualidad' },
]

export const ASPECT_TEXT_ES: Record<AspectKey, { dynamic: string; advice: string; transit: string }> = {
  conjunction: {
    dynamic: 'se funden en una sola fuerza — energías que actúan juntas y se intensifican mutuamente',
    advice: 'Integra estas fuerzas de forma consciente: en ti son inseparables.',
    transit: 'Fusión e inicio de ciclo: se planta una nueva semilla.',
  },
  opposition: {
    dynamic: 'se enfrentan desde lados opuestos — una polaridad que pide equilibrio y a menudo se revela a través de las relaciones',
    advice: 'Busca el punto de equilibrio: no hace falta elegir un lado.',
    transit: 'Culminación y conciencia: algo llega a su punto máximo y pide equilibrio.',
  },
  trine: {
    dynamic: 'fluyen en armonía natural — un talento innato que circula con facilidad',
    advice: 'Usa ese don activamente; el flujo fácil puede desaprovecharse.',
    transit: 'Fluidez y facilidad: las puertas se abren con naturalidad.',
  },
  square: {
    dynamic: 'están en tensión creativa — una fricción que genera crecimiento, acción y superación',
    advice: 'Convierte el conflicto en motor: aquí vive tu mayor fuerza conquistada.',
    transit: 'Desafío y acción: la tensión pide decisiones y movimiento.',
  },
  sextile: {
    dynamic: 'cooperan como aliados — oportunidades que florecen cuando tomas la iniciativa',
    advice: 'Da el primer paso: las oportunidades aparecen cuando actúas.',
    transit: 'Oportunidad: una invitación favorable que pide iniciativa.',
  },
  quincunx: {
    dynamic: 'hablan idiomas diferentes — exigen ajustes constantes y adaptación',
    advice: 'Sé flexible y paciente: el ajuste fino es el camino.',
    transit: 'Ajuste: hacen falta pequeñas correcciones de rumbo.',
  },
  semisextile: {
    dynamic: 'son vecinos con una leve fricción — un aprendizaje sutil',
    advice: 'Observa los detalles: aquí hay un crecimiento discreto.',
    transit: 'Sutileza: pequeños ajustes.',
  },
}

export const DURATION_ES: Partial<Record<PlanetKey, string>> = {
  moon: 'algunas horas', sun: 'algunos días', mercury: 'algunos días', venus: 'algunos días', mars: 'cerca de una semana',
  jupiter: 'algunas semanas', saturn: 'algunos meses', uranus: 'un largo período (meses)', neptune: 'un largo período (meses o años)',
  pluto: 'un período profundo y prolongado', chiron: 'algunos meses', node: 'algunas semanas',
}

export const NATAL_TARGET_ES: Partial<Record<PointKey, string>> = {
  sun: 'tu identidad y vitalidad', moon: 'tus emociones y necesidades íntimas', mercury: 'tu mente y comunicación',
  venus: 'tus afectos, placeres y valores', mars: 'tu energía de acción y deseo', jupiter: 'tu fe y capacidad de expansión',
  saturn: 'tus estructuras y responsabilidades', uranus: 'tu necesidad de libertad', neptune: 'tu sensibilidad y espiritualidad',
  pluto: 'tu poder personal y procesos profundos', chiron: 'tu herida más sensible y tu don de sanación',
  asc: 'tu forma de presentarte y tu cuerpo', mc: 'tu carrera y dirección de vida',
}

export const HEADLINE_VERB_ES: Record<AspectKey, string> = {
  conjunction: 'se une a', opposition: 'confronta a', trine: 'armoniza con', square: 'desafía a',
  sextile: 'favorece a', quincunx: 'ajusta a', semisextile: 'roza a',
}
