import type { AspectKey, PointKey } from '../../astro/constants'

export const PAIR_TEXT_ES: Record<string, { flow: string; tension: string }> = {
  'sun|moon': {
    flow: 'Uno de los lazos más clásicos de compatibilidad: la esencia de uno ilumina el mundo emocional del otro. Hay sensación de complementariedad, como el día y la noche que se completan.',
    tension: 'La voluntad de uno no siempre acoge las necesidades emocionales del otro. Con conciencia, la relación enseña a equilibrar el "yo quiero" con el "yo necesito".',
  },
  'venus|mars': {
    flow: 'Química natural: el deseo de uno encuentra el encanto del otro. Atracción fluida, sensual y divertida.',
    tension: 'Atracción intensa, con chispas — la pasión y el roce van juntos. El desafío es convertir la tensión en magnetismo, no en disputa.',
  },
  'moon|moon': {
    flow: 'Sienten el mundo de forma parecida. Hay comodidad, un ritmo emocional compartido y facilidad de convivencia.',
    tension: 'Necesidades emocionales diferentes: lo que calma a uno puede inquietar al otro. Aprender el lenguaje afectivo de la pareja es esencial.',
  },
  'sun|sun': {
    flow: 'Identidades que se apoyan: reconocen y celebran el brillo del otro.',
    tension: 'Dos voluntades fuertes en direcciones diferentes. El respeto a la individualidad evita disputas de ego.',
  },
  'venus|venus': {
    flow: 'Gustos, valores y formas de amar en sintonía — placeres compartidos con facilidad.',
    tension: 'Formas diferentes de demostrar amor y de manejar el dinero. Hablar de valores evita malentendidos.',
  },
  'mercury|mercury': {
    flow: 'Conversación fácil, humor parecido, mentes que se entienden rápidamente.',
    tension: 'Estilos de pensar diferentes pueden generar discusiones — o debates estimulantes.',
  },
  'venus|moon': {
    flow: 'Ternura y cuidado mutuo: cada uno sabe exactamente cómo hacer que el otro se sienta amado.',
    tension: 'El cariño existe, pero las expectativas afectivas no siempre coinciden. Los pequeños gestos marcan una gran diferencia.',
  },
  'sun|venus': {
    flow: 'Admiración y afecto: uno ve belleza en la esencia del otro. Ideal para el romance y la amistad.',
    tension: 'Cariño con exigencias: el deseo de agradar puede volverse necesidad de aprobación.',
  },
  'mars|mars': {
    flow: 'Energías que se suman: actúan bien juntos, con ritmo e iniciativa compatibles.',
    tension: 'Pueden surgir competencia e impaciencia. Canalicen la energía en proyectos y deportes en común.',
  },
  'saturn|sun': {
    flow: 'Estructura y lealtad: uno da forma y estabilidad a los sueños del otro. Un lazo de largo plazo.',
    tension: 'Uno puede sentirse limitado o exigido por el otro. Con madurez, se convierte en un compromiso sólido.',
  },
  'saturn|moon': {
    flow: 'Seguridad emocional y responsabilidad — un vínculo que madura con el tiempo.',
    tension: 'Frialdad percibida o miedo al rechazo. La paciencia y las palabras de afecto suavizan este contacto.',
  },
  'saturn|venus': {
    flow: 'Amor fiel y comprometido: la relación tiende a durar.',
    tension: 'El afecto encuentra barreras — sensación de distancia o de "deber". Pide ligereza y demostraciones explícitas.',
  },
  'jupiter|sun': {
    flow: 'Uno expande y bendice al otro: optimismo, generosidad y crecimiento juntos.',
    tension: 'Excesos y promesas exageradas. Aun así, hay mucha buena voluntad.',
  },
  'jupiter|venus': {
    flow: 'Alegría, generosidad y placer: la relación trae suerte y ligereza.',
    tension: 'Indulgencia en exceso — cuidado con los gastos y las exageraciones en pareja.',
  },
  'node|sun': {
    flow: 'Encuentro de destino: uno ayuda al otro a seguir su camino evolutivo.',
    tension: 'Un encuentro marcante que desafía a salir de la zona de confort.',
  },
  'node|moon': {
    flow: 'Sensación de conocerse de antes: un vínculo kármico y familiar.',
    tension: 'Un lazo emocional que pide crecimiento y desapego de patrones antiguos.',
  },
  'pluto|venus': {
    flow: 'Amor profundo y transformador, con gran magnetismo.',
    tension: 'Intensidad que puede volverse celos o control. La confianza es la clave.',
  },
  'pluto|mars': {
    flow: 'Fuerza y pasión concentradas: juntos, logran mucho.',
    tension: 'Posibles luchas de poder — la intensidad necesita cauces sanos.',
  },
  'neptune|venus': {
    flow: 'Romanticismo, inspiración y sensación de amor ideal.',
    tension: 'Idealización: cuida de ver a la persona real, no la fantasía.',
  },
  'uranus|venus': {
    flow: 'Atracción eléctrica y liberadora — la relación es viva y sorprendente.',
    tension: 'Inestabilidad y necesidad de espacio. Una libertad acordada evita rupturas.',
  },
  'asc|sun': {
    flow: 'Afinidad inmediata: uno reconoce e ilumina la forma de ser del otro.',
    tension: 'Atracción con choque de estilos — se notan intensamente.',
  },
  'asc|moon': {
    flow: 'Comodidad instintiva: se sienten a gusto juntos desde el principio.',
    tension: 'Reacciones instintivas diferentes; la paciencia trae intimidad.',
  },
  'asc|venus': {
    flow: 'Atracción estética y simpatía natural — uno encuentra encantador al otro.',
    tension: 'Encanto con expectativas — cuidado con los juicios por la apariencia.',
  },
  'asc|mars': {
    flow: 'Energía y deseo: uno activa al otro físicamente.',
    tension: 'Chispas e impaciencia; mucha energía para canalizar.',
  },
}

export const NATURE_TEXT_ES: Record<AspectKey, string> = {
  conjunction: 'se funden — energía intensa y marcante en la relación',
  trine: 'fluyen con naturalidad — un talento de la relación',
  sextile: 'cooperan — oportunidades que crecen con iniciativa',
  square: 'se desafían — un roce que genera crecimiento',
  opposition: 'se reflejan — atracción de opuestos que pide equilibrio',
  quincunx: 'piden ajustes constantes',
  semisextile: 'se rozan sutilmente',
}

export const OVERLAY_TEXT_ES: Partial<Record<PointKey, string>> = {
  sun: 'ilumina y da vitalidad', moon: 'trae intimidad y comodidad emocional', mercury: 'estimula conversaciones e ideas',
  venus: 'trae afecto, belleza y placer', mars: 'activa, da energía y a veces provoca', jupiter: 'expande y trae suerte',
  saturn: 'estructura, exige responsabilidad y hace madurar', uranus: 'sorprende y libera', neptune: 'inspira y encanta — y puede confundir',
  pluto: 'transforma profundamente',
}
