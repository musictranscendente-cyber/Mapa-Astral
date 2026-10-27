import type { AngleKey } from '../../astro/astrocarto'
import type { PlanetKey } from '../../astro/constants'

export const ANGLE_NAME_ES: Record<AngleKey, string> = { AC: 'Ascendente', MC: 'Medio Cielo', DC: 'Descendente', IC: 'Fondo del Cielo' }

export const ANGLE_GUIDE_ES: Record<AngleKey, { title: string; text: string }> = {
  AC: { title: 'AC · Ascendente — línea continua', text: 'Donde el planeta estaba saliendo en el horizonte. Cerca de ella, actúa en ti mismo: en el cuerpo, en la energía, en cómo te perciben los demás. Es la línea más "personal".' },
  MC: { title: 'MC · Medio Cielo — línea continua vertical', text: 'Donde el planeta estaba en el punto más alto del cielo. Mueve la carrera, la reputación y la vida pública: es la línea de la vocación y de cómo te reconocen allí.' },
  DC: { title: 'DC · Descendente — línea discontinua', text: 'Donde el planeta se estaba poniendo. Actúa a través de los demás: pareja, matrimonio, socios, clientes e incluso rivales. Muestra el tipo de persona que tiendes a encontrar allí.' },
  IC: { title: 'IC · Fondo del Cielo — línea punteada vertical', text: 'Donde el planeta estaba bajo tus pies, al otro lado de la Tierra. Habla del hogar, la familia, las raíces y la vida íntima: es la línea de "vivir allí", la que más se siente en el día a día de la casa.' },
}

export const PLANET_GUIDE_ES: Partial<Record<PlanetKey, string>> = {
  sun: 'vitalidad, confianza en ti mismo y destaque', moon: 'emociones, acogida y sensación de pertenencia', mercury: 'ideas, estudios, contactos y negocios',
  venus: 'amor, belleza, placer y buenas relaciones', mars: 'energía y coraje — también prisa y conflictos', jupiter: 'suerte, crecimiento y oportunidades',
  saturn: 'esfuerzo, estructura y madurez — a veces peso', uranus: 'cambios, libertad e imprevistos', neptune: 'inspiración y espiritualidad — también confusión',
  pluto: 'transformación profunda, poder e intensidad',
}

export const LINES_ES: Partial<Record<PlanetKey, Record<AngleKey, string>>> = {
  sun: { AC: 'Te sientes más vivo, seguro y visible; ideal para recomenzar y cuidar la autoestima.', MC: 'Línea de éxito y reconocimiento profesional: oportunidad de liderar y destacar por lo que haces.', DC: 'Relaciones marcantes, con personas fuertes y brillantes; te descubres a través del otro.', IC: 'Sensación de hogar y orgullo de las raíces; bueno para formar familia y crear una base sólida.' },
  moon: { AC: 'Te vuelves más sensible, intuitivo y acogedor; la gente se acerca con facilidad.', MC: 'Contacto con el público y trabajo que cuida de personas; popularidad, con algunas oscilaciones.', DC: 'Relaciones afectuosas y protectoras; vínculos emocionales profundos (a veces dependencia).', IC: 'Una de las mejores líneas para vivir: sensación de casa, familia y bienestar emocional.' },
  mercury: { AC: 'Mente rápida, comunicativa y curiosa; bueno para estudiar, escribir y hacer contactos.', MC: 'Gana fuerza una carrera en comunicación, enseñanza, comercio, tecnología o medios.', DC: 'Socios, contratos e intercambios intelectuales; relaciones movidas por la conversación y las ideas.', IC: 'Casa animada, llena de libros y conversaciones; bueno para trabajar o estudiar desde casa.' },
  venus: { AC: 'Encanto, belleza y magnetismo en alza; te sientes bien y atraes personas y amabilidades.', MC: 'Carrera ligada al arte, la belleza, la moda o la diplomacia; reputación simpática y buena red.', DC: 'La línea clásica del amor: más posibilidades de romance, matrimonio y relaciones armoniosas.', IC: 'Hogar bonito y armonioso, familia en paz; un lugar agradable para vivir.' },
  mars: { AC: 'Energía física, coraje e iniciativa — pero también impaciencia, peleas y riesgo de accidentes.', MC: 'Ambición y competitividad en la carrera; bueno para emprender y liderar, con disputas.', DC: 'Relaciones intensas y apasionadas, pero con roces; atrae a personas fuertes o rivales.', IC: 'Mucha energía en casa: reformas y mudanzas, pero también tensiones familiares.' },
  jupiter: { AC: 'Optimismo, generosidad y suerte personal; las puertas se abren con facilidad.', MC: 'Una de las mejores líneas para la carrera: crecimiento, prestigio y oportunidades.', DC: 'Parejas y socios generosos que te ayudan a crecer; los matrimonios se ven favorecidos.', IC: 'Casa amplia, familia próspera y sensación de abundancia; ideal para vivir.' },
  saturn: { AC: 'La seriedad y la responsabilidad pesan; el lugar te hace madurar, pero puede cansar o aislar.', MC: 'Carrera construida con esfuerzo y paciencia; reconocimiento lento, pero sólido.', DC: 'Relaciones serias y comprometidas, a veces frías o con diferencia de edad.', IC: 'Los asuntos de familia y de la casa piden trabajo; buena para echar raíces con disciplina.' },
  uranus: { AC: 'Libertad, originalidad y cambios súbitos; inspira, pero vuelve inestable el día a día.', MC: 'Carrera innovadora, tecnología y giros profesionales inesperados.', DC: 'Encuentros sorprendentes y relaciones poco convencionales, que piden espacio.', IC: 'Cambios frecuentes de casa y de rutina; difícil sentirse asentado por mucho tiempo.' },
  neptune: { AC: 'Aumentan la sensibilidad, la creatividad y la espiritualidad; cuidado con la confusión y el cansancio.', MC: 'Carrera en arte, música, sanación o espiritualidad; imagen pública inspiradora (o difusa).', DC: 'Relaciones idealizadas y románticas; atención a ilusiones y decepciones.', IC: 'El hogar como refugio espiritual cerca del agua o la naturaleza; poco práctico, muy sensible.' },
  pluto: { AC: 'Transformación personal intensa: te reinventas, con magnetismo y crisis de crecimiento.', MC: 'Poder e influencia en la carrera, con luchas de poder y grandes giros.', DC: 'Relaciones profundas y transformadoras, que tocan el control y los celos.', IC: 'Remueve las raíces y la familia; lugar de sanación profunda, no siempre fácil.' },
}

export const STRENGTH_ES = { strong: 'influencia fuerte', medium: 'influencia media', mild: 'influencia leve' }
