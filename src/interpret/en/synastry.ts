import type { AspectKey, PointKey } from '../../astro/constants'

export const PAIR_TEXT_EN: Record<string, { flow: string; tension: string }> = {
  'sun|moon': {
    flow: 'One of the classic bonds of compatibility: one person\'s essence lights up the other\'s emotional world. There\'s a sense of complementarity, like day and night completing each other.',
    tension: 'One person\'s will doesn\'t always meet the other\'s emotional needs. With awareness, the relationship teaches you to balance "I want" with "I need".',
  },
  'venus|mars': {
    flow: 'Natural chemistry: one person\'s desire meets the other\'s charm. Attraction that is easy, sensual and fun.',
    tension: 'Intense attraction with sparks — passion and friction go hand in hand. The challenge is turning tension into magnetism, not rivalry.',
  },
  'moon|moon': {
    flow: 'You feel the world in a similar way. There\'s comfort, a shared emotional rhythm and ease in living together.',
    tension: 'Different emotional needs: what soothes one may unsettle the other. Learning your partner\'s language of affection is essential.',
  },
  'sun|sun': {
    flow: 'Identities that support each other: you recognize and celebrate each other\'s light.',
    tension: 'Two strong wills pulling in different directions. Respecting each other\'s individuality prevents ego battles.',
  },
  'venus|venus': {
    flow: 'Tastes, values and ways of loving in tune — shared pleasures come easily.',
    tension: 'Different ways of showing love and handling money. Talking about values prevents misunderstandings.',
  },
  'mercury|mercury': {
    flow: 'Easy conversation, a similar sense of humor, minds that understand each other quickly.',
    tension: 'Different thinking styles can lead to arguments — or stimulating debates.',
  },
  'venus|moon': {
    flow: 'Tenderness and mutual care: each knows exactly how to make the other feel loved.',
    tension: 'The affection is there, but emotional expectations don\'t always match. Small gestures make a big difference.',
  },
  'sun|venus': {
    flow: 'Admiration and affection: one sees beauty in the other\'s essence. Great for romance and friendship.',
    tension: 'Affection with strings attached: the wish to please can turn into a need for approval.',
  },
  'mars|mars': {
    flow: 'Energies that add up: you act well together, with compatible pace and initiative.',
    tension: 'Competition and impatience may arise. Channel the energy into shared projects and sports.',
  },
  'saturn|sun': {
    flow: 'Structure and loyalty: one gives shape and stability to the other\'s dreams. A long-term bond.',
    tension: 'One may feel limited or pressured by the other. With maturity, it becomes a solid commitment.',
  },
  'saturn|moon': {
    flow: 'Emotional security and responsibility — a bond that matures over time.',
    tension: 'Perceived coldness or fear of rejection. Patience and words of affection soften this contact.',
  },
  'saturn|venus': {
    flow: 'Faithful, committed love: the relationship tends to last.',
    tension: 'Affection meets barriers — a sense of distance or "duty". It asks for lightness and open displays of love.',
  },
  'jupiter|sun': {
    flow: 'One expands and blesses the other: optimism, generosity and growing together.',
    tension: 'Excess and over-promising. Still, there\'s plenty of goodwill.',
  },
  'jupiter|venus': {
    flow: 'Joy, generosity and pleasure: the relationship brings luck and lightness.',
    tension: 'Too much indulgence — watch out for spending and excess together.',
  },
  'node|sun': {
    flow: 'A fated meeting: one helps the other follow their path of growth.',
    tension: 'A striking encounter that pushes you out of your comfort zone.',
  },
  'node|moon': {
    flow: 'A feeling of having known each other before: a karmic, family-like bond.',
    tension: 'An emotional bond that asks for growth and letting go of old patterns.',
  },
  'pluto|venus': {
    flow: 'Deep, transformative love with great magnetism.',
    tension: 'Intensity that can turn into jealousy or control. Trust is the key.',
  },
  'pluto|mars': {
    flow: 'Concentrated strength and passion: together, you achieve a lot.',
    tension: 'Possible power struggles — the intensity needs healthy outlets.',
  },
  'neptune|venus': {
    flow: 'Romance, inspiration and a feeling of ideal love.',
    tension: 'Idealization: take care to see the real person, not the fantasy.',
  },
  'uranus|venus': {
    flow: 'Electric, liberating attraction — the relationship is alive and surprising.',
    tension: 'Instability and a need for space. Agreed-upon freedom prevents breakups.',
  },
  'asc|sun': {
    flow: 'Instant affinity: one recognizes and brings out the other\'s way of being.',
    tension: 'Attraction with clashing styles — you notice each other intensely.',
  },
  'asc|moon': {
    flow: 'Instinctive comfort: you feel at ease together from the start.',
    tension: 'Different instinctive reactions; patience brings intimacy.',
  },
  'asc|venus': {
    flow: 'Aesthetic attraction and natural warmth — each finds the other charming.',
    tension: 'Charm with expectations — beware of judging by appearances.',
  },
  'asc|mars': {
    flow: 'Energy and desire: one activates the other physically.',
    tension: 'Sparks and impatience; lots of energy to channel.',
  },
}

export const NATURE_TEXT_EN: Record<AspectKey, string> = {
  conjunction: 'merge — an intense, defining energy in the relationship',
  trine: 'flow naturally — one of the relationship\'s talents',
  sextile: 'cooperate — opportunities that grow with initiative',
  square: 'challenge each other — friction that creates growth',
  opposition: 'mirror each other — an attraction of opposites that asks for balance',
  quincunx: 'call for constant adjustments',
  semisextile: 'brush against each other subtly',
}

export const OVERLAY_TEXT_EN: Partial<Record<PointKey, string>> = {
  sun: 'lights up and energizes', moon: 'brings intimacy and emotional comfort', mercury: 'sparks conversations and ideas',
  venus: 'brings affection, beauty and pleasure', mars: 'activates, energizes and sometimes provokes', jupiter: 'expands and brings luck',
  saturn: 'structures, asks for responsibility and matures', uranus: 'surprises and frees', neptune: 'inspires and enchants — and may confuse',
  pluto: 'transforms deeply',
}
