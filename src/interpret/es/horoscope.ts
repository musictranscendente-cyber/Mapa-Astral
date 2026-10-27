export const MOON_DAY_ES = [
  'La Luna pasa por tu signo y te pone en el centro: emociones a flor de piel, ganas de cuidarte y de que te noten. Buen día para empezar algo que tenga tu sello.',
  'Con la Luna en tu casa del dinero y los valores, el foco va a la seguridad y la comodidad. Organiza tus finanzas, saborea pequeños placeres y evita las compras impulsivas.',
  'La Luna mueve conversaciones, mensajes y pequeños desplazamientos. Día ágil, de intercambios e ideas — ideal para estudiar, escribir o resolver pendientes del barrio y la familia.',
  'La Luna llega a la base de tu carta: ganas de casa, de familia y de recogimiento. Cuida tu nido, tus raíces y las emociones antiguas que piden consuelo.',
  'La Luna enciende tu casa de la alegría: el romance, la creatividad, los hijos y la diversión ganan fuerza. Permítete jugar, crear y coquetear con la vida.',
  'Con la Luna en la casa de la rutina y la salud, el día pide orden: organizar tareas, cuidar el cuerpo y el trabajo práctico. Pequeños ajustes traen gran bienestar.',
  'La Luna ilumina tus relaciones: el otro gana importancia. Día para conversar, negociar y cultivar la relación — escucha antes de responder.',
  'La Luna se sumerge en tu casa de las transformaciones: emociones intensas, intimidad y asuntos de dinero compartido. Bueno para cerrar ciclos y mirar lo que está oculto.',
  'La Luna abre horizontes: ganas de aprender, viajar o buscar sentido. Lee, planea un viaje, habla de fe y filosofía — tu mente pide amplitud.',
  'La Luna pasa por lo alto de tu carta: carrera y reputación en evidencia. Tus actitudes se ven; muestra tu trabajo y cuida tu imagen pública.',
  'La Luna mueve amistades, grupos y proyectos de futuro. Día de redes, colaboración y sueños compartidos — un contacto puede abrir una puerta.',
  'La Luna se recoge en tu casa más íntima: día de descanso, intuición y silencio. Menos agenda, más escucha interior — los sueños pueden traer mensajes.',
]

export const VENUS_LOVE_ES = [
  'Venus en tu signo te vuelve magnético: encanto, belleza y facilidad para atraer.',
  'En el amor, valora los gestos concretos y la comodidad en pareja; los regalos y mimos funcionan.',
  'Las conversaciones ligeras y los mensajes cariñosos acercan — el coqueteo está en las palabras.',
  'El afecto pide calidez: un plan en casa vale más que un gran evento.',
  'Romance en alza: día propicio para coquetear, citas y declaraciones.',
  'El amor se muestra en el cuidado diario — los pequeños detalles marcan la diferencia.',
  'Venus favorece las relaciones: armonía, acuerdos y encuentros significativos.',
  'Intensidad y entrega en el amor; cuidado con los celos y los juegos de poder.',
  'El corazón quiere aventura: alguien diferente o un plan nuevo te encanta.',
  'Afectos y carrera se cruzan: la simpatía abre puertas en el trabajo.',
  'Las amistades pueden convertirse en algo más; los grupos traen buena compañía.',
  'Amores discretos o del pasado pueden volver a la memoria; cuida tu corazón en silencio.',
]

export const MARS_ACTION_ES = [
  'Marte en tu signo te da energía de sobra: empieza y lidera, pero evita atropellar a los demás.',
  'Usa tu fuerza para generar recursos; el trabajo duro rinde, pero sin gastos impulsivos.',
  'Mente acelerada: defiende tus ideas con firmeza, sin convertir la conversación en pelea.',
  'Energía volcada en casa y familia: reformas y arreglos rinden; evita discusiones domésticas.',
  'Ganas de crear, hacer deporte y divertirte con intensidad.',
  'Productividad alta en el trabajo y la rutina; respeta los límites del cuerpo.',
  'Las relaciones piden negociación: pueden surgir competencia o conflictos — elige tus batallas.',
  'Fuerza para enfrentar crisis y transformar lo que necesita cambiar.',
  'Ganas de expandirte, estudiar y conquistar nuevos territorios.',
  'Ambición en alza: bueno para metas profesionales y decisiones importantes.',
  'Energía para proyectos colectivos; cuidado con los roces en grupo.',
  'Energía más baja e interior: descansa y actúa entre bastidores.',
]

export const MERCURY_MIND_ES = [
  'Mercurio en tu signo favorece expresarte y defender tus ideas.',
  'Buen momento para planear las finanzas y negociar precios.',
  'Comunicación fluida: ideal para estudios, contratos y mensajes importantes.',
  'Las conversaciones en familia ayudan a resolver pendientes antiguos.',
  'Las ideas creativas surgen con facilidad; anótalo todo.',
  'Mente organizada: ideal para listas, plazos y detalles del trabajo.',
  'El diálogo es la clave en las relaciones; los acuerdos claros evitan malentendidos.',
  'Investigaciones y conversaciones profundas revelan información importante.',
  'Curiosidad en alza: cursos, viajes e ideas nuevas te atraen.',
  'Comunícate con estrategia en el trabajo; tu palabra tiene peso.',
  'Los intercambios con amigos y redes traen buenas ideas.',
  'Reflexión silenciosa: escribe, medita y escucha tu intuición.',
]

export const PHASE_TIP_ES: Record<string, string> = {
  'Lua Nova': 'Luna Nueva: siembra intenciones y empieza con calma.',
  'Lua Crescente': 'Luna Creciente: tiempo de actuar y dar los primeros pasos.',
  'Quarto Crescente': 'Cuarto Creciente: supera obstáculos y ajusta el rumbo.',
  'Crescente Gibosa': 'Gibosa Creciente: refina y prepara la cosecha.',
  'Lua Cheia': 'Luna Llena: emociones intensas — cosecha, celebra y mira con claridad.',
  'Minguante Gibosa': 'Gibosa Menguante: comparte lo que aprendiste y agradece.',
  'Quarto Minguante': 'Cuarto Menguante: suelta lo que pesa y reorganiza.',
  'Lua Minguante': 'Luna Menguante: descansa, limpia y cierra ciclos.',
}

export const HOUSE_SHORT_ES = ['ti mismo', 'dinero y valores', 'comunicación', 'hogar y familia', 'amor y creatividad', 'rutina y salud',
  'relaciones', 'transformaciones', 'estudios y viajes', 'carrera', 'amigos y proyectos', 'vida interior']

export const HEADLINE_ES: Record<number, string[]> = {
  5: ['Día luminoso: el cielo juega a tu favor', 'Puertas abiertas y buena suerte en el aire'],
  4: ['Día de fluidez y buenas conexiones', 'Energía favorable para avanzar'],
  3: ['Día de equilibrio: elige tus prioridades', 'La constancia trae buenos resultados'],
  2: ['Día de paciencia y ajustes', 'Los desafíos piden calma y estrategia'],
  1: ['Día de recogimiento y cuidado', 'Ve despacio: el cielo pide una pausa'],
}
