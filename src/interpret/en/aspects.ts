import type { AspectKey, PlanetKey, PointKey } from '../../astro/constants'

export const CHIRON_SIGN_EN: { wound: string; gift: string }[] = [
  { wound: 'a wound around the right to exist, assert yourself and take up your own space', gift: 'the courage to be who you are — and to encourage others to do the same' },
  { wound: 'insecurity about your own worth, your body, money or stability', gift: 'a serene presence that teaches others to feel safe and deserving' },
  { wound: 'the fear of not being heard, not being smart enough or not knowing how to express yourself', gift: 'words that heal: writing, teaching and putting into words what others cannot say' },
  { wound: 'a pain tied to family, being cared for and the feeling of belonging', gift: 'the ability to nurture and create homes — physical and emotional — where others feel at home' },
  { wound: 'doubt about your own light, the fear of not being seen or recognized', gift: 'inspiring and bringing out others\' talent, giving people back the joy of creating' },
  { wound: 'the demand for perfection, the feeling of never being useful or good enough', gift: 'a practical, patient healing that transforms routines and cares for body and mind' },
  { wound: 'wounds in relationships: rejection, imbalance or the fear of being alone', gift: 'the ability to mediate, harmonize and help others relate better' },
  { wound: 'issues of trust, intimacy, loss or control', gift: 'walking with people through deep crises and showing that rebirth is possible' },
  { wound: 'a painful search for meaning, faith or truth', gift: 'being a guide and teacher: opening horizons and restoring hope to those who lost it' },
  { wound: 'the pressure for recognition and authority, or carrying responsibilities too early', gift: 'a mature, humane leadership that supports others with firmness and care' },
  { wound: 'the feeling of being different, of not belonging to the group', gift: 'originality put at the service of the collective — bringing people together around something new' },
  { wound: 'fragile boundaries, extreme sensitivity or a sense of spiritual abandonment', gift: 'immense compassion that heals through presence, art and spirituality' },
]

export const ASPECT_TEXT_EN: Record<AspectKey, { dynamic: string; advice: string; transit: string }> = {
  conjunction: {
    dynamic: 'merge into a single force — energies that act together and intensify each other',
    advice: 'Integrate these forces consciously: in you, they are inseparable.',
    transit: 'Fusion and a new cycle: a new seed is planted.',
  },
  opposition: {
    dynamic: 'face each other from opposite sides — a polarity that asks for balance and often shows up through relationships',
    advice: 'Look for the point of balance: you don\'t have to pick a side.',
    transit: 'Culmination and awareness: something reaches its peak and asks for balance.',
  },
  trine: {
    dynamic: 'flow in natural harmony — an innate talent that moves with ease',
    advice: 'Use this gift actively; an easy flow can go to waste.',
    transit: 'Flow and ease: doors open naturally.',
  },
  square: {
    dynamic: 'are in creative tension — a friction that drives growth, action and overcoming',
    advice: 'Turn the conflict into an engine: this is where your hardest-won strength lives.',
    transit: 'Challenge and action: the tension calls for decisions and movement.',
  },
  sextile: {
    dynamic: 'cooperate as allies — opportunities that bloom when you take the initiative',
    advice: 'Take the first step: opportunities appear when you act.',
    transit: 'Opportunity: a favorable invitation that asks for initiative.',
  },
  quincunx: {
    dynamic: 'speak different languages — they demand constant adjustment and adaptation',
    advice: 'Be flexible and patient: fine-tuning is the way.',
    transit: 'Adjustment: small course corrections are needed.',
  },
  semisextile: {
    dynamic: 'are neighbors in light friction — a subtle lesson',
    advice: 'Notice the details: there is quiet growth here.',
    transit: 'Subtlety: small adjustments.',
  },
}

export const DURATION_EN: Partial<Record<PlanetKey, string>> = {
  moon: 'a few hours', sun: 'a few days', mercury: 'a few days', venus: 'a few days', mars: 'about a week',
  jupiter: 'a few weeks', saturn: 'a few months', uranus: 'a long period (months)', neptune: 'a long period (months to years)',
  pluto: 'a deep, extended period', chiron: 'a few months', node: 'a few weeks',
}

export const NATAL_TARGET_EN: Partial<Record<PointKey, string>> = {
  sun: 'your identity and vitality', moon: 'your emotions and inner needs', mercury: 'your mind and communication',
  venus: 'your affections, pleasures and values', mars: 'your drive and desire', jupiter: 'your faith and capacity to grow',
  saturn: 'your structures and responsibilities', uranus: 'your need for freedom', neptune: 'your sensitivity and spirituality',
  pluto: 'your personal power and deep processes', chiron: 'your most tender wound and your gift for healing',
  asc: 'the way you present yourself and your body', mc: 'your career and life direction',
}

export const HEADLINE_VERB_EN: Record<AspectKey, string> = {
  conjunction: 'meets', opposition: 'confronts', trine: 'harmonizes with', square: 'challenges',
  sextile: 'favors', quincunx: 'adjusts', semisextile: 'brushes',
}
