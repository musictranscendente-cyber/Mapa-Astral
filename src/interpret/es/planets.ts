import type { PointKey } from '../../astro/constants'
import type { HouseText, PlanetText } from '../planets'

// `verb` completa "tú ___" (conjugado en 2.ª persona); `transit` completa "<planeta> ___" (3.ª persona).
export const PLANET_TEXT_ES: Partial<Record<PointKey, PlanetText>> = {
  sun: {
    principle: 'Identidad, vitalidad y propósito',
    keywords: ['yo', 'voluntad', 'propósito', 'conciencia'],
    verb: 'expresas tu identidad y buscas brillar',
    description: 'El Sol es el centro de la carta: tu esencia, lo que viniste a desarrollar e irradiar.',
    transit: 'ilumina, da visibilidad y vitalidad',
  },
  moon: {
    principle: 'Emociones, necesidades y memoria',
    keywords: ['sentir', 'nutrir', 'seguridad', 'instinto'],
    verb: 'sientes, te proteges y buscas acogida',
    description: 'La Luna es tu mundo interior: emociones, hábitos, recuerdos y lo que nutre tu alma.',
    transit: 'despierta emociones y estados de ánimo pasajeros',
  },
  mercury: {
    principle: 'Mente, comunicación y aprendizaje',
    keywords: ['pensar', 'hablar', 'aprender', 'conectar'],
    verb: 'piensas, comunicas y aprendes',
    description: 'Mercurio muestra cómo funciona tu mente: razonamiento, habla, escritura y curiosidad.',
    transit: 'activa conversaciones, ideas, noticias y decisiones',
  },
  venus: {
    principle: 'Amor, belleza y valores',
    keywords: ['amar', 'atraer', 'valorar', 'armonizar'],
    verb: 'amas, te relacionas y aprecias la belleza',
    description: 'Venus revela cómo amas, qué te parece bello y qué valoras — también en lo económico.',
    transit: 'trae armonía, afecto, placer y atracción',
  },
  mars: {
    principle: 'Acción, deseo y coraje',
    keywords: ['actuar', 'desear', 'conquistar', 'defender'],
    verb: 'actúas, deseas y luchas por lo que quieres',
    description: 'Marte es tu fuerza de acción: cómo conquistas, te defiendes y expresas el deseo.',
    transit: 'trae impulso, energía, prisa y posibles roces',
  },
  jupiter: {
    principle: 'Expansión, fe y sabiduría',
    keywords: ['expandir', 'creer', 'enseñar', 'prosperar'],
    verb: 'creces, encuentras sentido y atraes oportunidades',
    description: 'Júpiter muestra dónde encuentras suerte, fe, abundancia y deseo de crecer.',
    transit: 'expande, abre puertas y trae optimismo',
  },
  saturn: {
    principle: 'Estructura, límites y madurez',
    keywords: ['estructurar', 'madurar', 'responsabilizarse', 'perseverar'],
    verb: 'enfrentas responsabilidades y construyes con disciplina',
    description: 'Saturno es el maestro del tiempo: muestra tus desafíos, tus miedos y dónde construyes autoridad.',
    transit: 'pone a prueba, exige madurez y consolida',
  },
  uranus: {
    principle: 'Libertad, ruptura e innovación',
    keywords: ['liberar', 'innovar', 'despertar', 'romper'],
    verb: 'buscas libertad y rompes patrones',
    description: 'Urano es el despertar súbito: dónde eres original, rebelde y anhelas libertad.',
    transit: 'trae sorpresas, rupturas y despertares',
  },
  neptune: {
    principle: 'Espiritualidad, sueño y disolución',
    keywords: ['soñar', 'trascender', 'inspirar', 'disolver'],
    verb: 'sueñas, te inspiras y trasciendes',
    description: 'Neptuno es el océano del inconsciente: intuición, arte, espiritualidad e ilusiones.',
    transit: 'sensibiliza e inspira, pero puede confundir',
  },
  pluto: {
    principle: 'Transformación, poder y renacimiento',
    keywords: ['transformar', 'regenerar', 'profundizar', 'empoderar'],
    verb: 'te transformas profundamente y encuentras tu poder',
    description: 'Plutón es la fuerza de muerte y renacimiento: dónde vives transformaciones profundas.',
    transit: 'transforma profundamente y revela lo oculto',
  },
  chiron: {
    principle: 'Herida, sanación y sabiduría',
    keywords: ['herida', 'sanación', 'maestría', 'aceptación'],
    verb: 'llevas una herida sensible que, acogida, se transforma en un don de sanación',
    description: 'Quirón, el sanador herido, muestra dónde sentiste un dolor profundo — y dónde, al acogerlo, desarrollas la sabiduría de ayudar a los demás.',
    transit: 'reabre heridas antiguas para que por fin puedan sanar',
  },
  node: {
    principle: 'Destino y dirección evolutiva',
    keywords: ['evolucionar', 'crecer', 'propósito del alma'],
    verb: 'encuentras tu dirección evolutiva',
    description: 'El Nodo Norte señala el camino de crecimiento del alma en esta vida — lo desconocido que llama.',
    transit: 'trae encuentros y situaciones de destino',
  },
  southNode: {
    principle: 'Talentos pasados y zona de confort',
    keywords: ['memoria del alma', 'dones innatos', 'hábito'],
    verb: 'descansas en talentos ya conocidos',
    description: 'El Nodo Sur muestra dones traídos de otras etapas y patrones que piden desapego.',
    transit: 'hace revisitar el pasado',
  },
  lilith: {
    principle: 'Sombra, instinto y poder salvaje',
    keywords: ['instinto', 'tabú', 'autonomía'],
    verb: 'guardas tu instinto más libre e indomable',
    description: 'Lilith, la Luna Negra, revela dónde no aceptas sumisión y dónde guardas heridas y potencia salvaje.',
    transit: 'saca a la luz deseos reprimidos',
  },
  asc: {
    principle: 'Persona y forma de iniciar',
    keywords: ['apariencia', 'enfoque', 'cuerpo'],
    verb: 'te presentas al mundo',
    description: 'El Ascendente es la puerta de entrada: cómo te muestras, inicias y te perciben.',
    transit: '',
  },
  mc: {
    principle: 'Vocación y realización pública',
    keywords: ['carrera', 'reputación', 'misión'],
    verb: 'buscas reconocimiento y realización',
    description: 'El Medio Cielo es el punto más alto de la carta: vocación, carrera y legado.',
    transit: '',
  },
}

export const HOUSE_TEXT_ES: HouseText[] = [
  { name: 'Casa 1', theme: 'Identidad y apariencia', keywords: ['yo', 'cuerpo', 'presencia'], description: 'La Casa 1 es el inicio de todo: tu personalidad, tu cuerpo, tu forma espontánea de reaccionar ante la vida.' },
  { name: 'Casa 2', theme: 'Recursos y valores', keywords: ['dinero', 'talentos', 'autoestima'], description: 'La Casa 2 habla de recursos materiales, talentos, autoestima y de aquello que valoras.' },
  { name: 'Casa 3', theme: 'Comunicación y entorno', keywords: ['hermanos', 'estudios', 'intercambios'], description: 'La Casa 3 rige la comunicación, los estudios, los hermanos, los vecinos y los trayectos cortos.' },
  { name: 'Casa 4', theme: 'Hogar y raíces', keywords: ['familia', 'origen', 'intimidad'], description: 'La Casa 4 es la base de la carta: hogar, familia, ascendencia y tu vida emocional íntima.' },
  { name: 'Casa 5', theme: 'Creatividad y placer', keywords: ['romance', 'hijos', 'arte'], description: 'La Casa 5 es la casa de la alegría: romances, creatividad, hijos, aficiones y autoexpresión.' },
  { name: 'Casa 6', theme: 'Rutina y salud', keywords: ['trabajo diario', 'cuerpo', 'servicio'], description: 'La Casa 6 rige la rutina, la salud, los hábitos y el trabajo del día a día.' },
  { name: 'Casa 7', theme: 'Pareja y asociaciones', keywords: ['matrimonio', 'socios', 'el otro'], description: 'La Casa 7 es el espejo: matrimonio, asociaciones, contratos y lo que proyectas en el otro.' },
  { name: 'Casa 8', theme: 'Transformación e intimidad', keywords: ['crisis', 'sexualidad', 'herencias'], description: 'La Casa 8 rige las transformaciones, la intimidad profunda, los recursos compartidos y lo oculto.' },
  { name: 'Casa 9', theme: 'Expansión y sentido', keywords: ['viajes', 'filosofía', 'enseñanza'], description: 'La Casa 9 es la búsqueda de sentido: viajes largos, estudios superiores, fe y filosofía de vida.' },
  { name: 'Casa 10', theme: 'Carrera y vocación', keywords: ['estatus', 'misión', 'autoridad'], description: 'La Casa 10 es la cima de la carta: carrera, reputación, vocación y logros públicos.' },
  { name: 'Casa 11', theme: 'Amigos y sueños', keywords: ['grupos', 'proyectos', 'futuro'], description: 'La Casa 11 rige las amistades, los grupos, las redes, las causas colectivas y los sueños para el futuro.' },
  { name: 'Casa 12', theme: 'Espiritualidad e inconsciente', keywords: ['retiro', 'karma', 'trascendencia'], description: 'La Casa 12 es el océano interior: espiritualidad, inconsciente, retiro y lo que está oculto.' },
]

export const planetInHouseEs = (p: PlanetText, h: HouseText) =>
  `En la ${h.name.toLowerCase()} (${h.theme.toLowerCase()}), esta energía de ${p.principle.toLowerCase()} se manifiesta sobre todo en los temas de ${h.keywords.join(', ')}. Es en esta área de la vida donde ${p.verb}.`
