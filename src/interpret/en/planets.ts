import type { PointKey } from '../../astro/constants'
import type { HouseText, PlanetText } from '../planets'

// `verb` completes "you ___" (base form); `transit` completes "<planet> ___" (third person).
export const PLANET_TEXT_EN: Partial<Record<PointKey, PlanetText>> = {
  sun: {
    principle: 'Identity, vitality and purpose',
    keywords: ['self', 'will', 'purpose', 'awareness'],
    verb: 'express your identity and seek to shine',
    description: 'The Sun is the center of the chart: your essence, what you came here to develop and radiate.',
    transit: 'illuminates, brings visibility and vitality',
  },
  moon: {
    principle: 'Emotions, needs and memory',
    keywords: ['feeling', 'nurturing', 'security', 'instinct'],
    verb: 'feel, protect yourself and seek comfort',
    description: 'The Moon is your inner world: emotions, habits, memories and what nourishes your soul.',
    transit: 'stirs emotions and passing moods',
  },
  mercury: {
    principle: 'Mind, communication and learning',
    keywords: ['thinking', 'speaking', 'learning', 'connecting'],
    verb: 'think, communicate and learn',
    description: 'Mercury shows how your mind works: reasoning, speech, writing and curiosity.',
    transit: 'activates conversations, ideas, news and decisions',
  },
  venus: {
    principle: 'Love, beauty and values',
    keywords: ['loving', 'attracting', 'valuing', 'harmonizing'],
    verb: 'love, relate to others and appreciate beauty',
    description: 'Venus reveals how you love, what you find beautiful and what you value — financially too.',
    transit: 'brings harmony, affection, pleasure and attraction',
  },
  mars: {
    principle: 'Action, desire and courage',
    keywords: ['acting', 'desiring', 'conquering', 'defending'],
    verb: 'act, desire and fight for what you want',
    description: 'Mars is your drive: how you go after things, defend yourself and express desire.',
    transit: 'brings drive, energy, haste and possible friction',
  },
  jupiter: {
    principle: 'Expansion, faith and wisdom',
    keywords: ['expanding', 'believing', 'teaching', 'prospering'],
    verb: 'grow, find meaning and attract opportunities',
    description: 'Jupiter shows where you find luck, faith, abundance and the wish to grow.',
    transit: 'expands, opens doors and brings optimism',
  },
  saturn: {
    principle: 'Structure, limits and maturity',
    keywords: ['structuring', 'maturing', 'taking responsibility', 'persevering'],
    verb: 'face responsibilities and build with discipline',
    description: 'Saturn is the master of time: it shows your challenges, fears and where you build authority.',
    transit: 'tests, demands maturity and consolidates',
  },
  uranus: {
    principle: 'Freedom, disruption and innovation',
    keywords: ['liberating', 'innovating', 'awakening', 'breaking free'],
    verb: 'seek freedom and break patterns',
    description: 'Uranus is the sudden awakening: where you are original, rebellious and long for freedom.',
    transit: 'brings surprises, breakthroughs and awakenings',
  },
  neptune: {
    principle: 'Spirituality, dreams and dissolution',
    keywords: ['dreaming', 'transcending', 'inspiring', 'dissolving'],
    verb: 'dream, find inspiration and transcend',
    description: 'Neptune is the ocean of the unconscious: intuition, art, spirituality and illusions.',
    transit: 'sensitizes and inspires, but can confuse',
  },
  pluto: {
    principle: 'Transformation, power and rebirth',
    keywords: ['transforming', 'regenerating', 'going deep', 'empowering'],
    verb: 'transform deeply and find your power',
    description: 'Pluto is the force of death and rebirth: where you go through deep transformations.',
    transit: 'transforms deeply and reveals what is hidden',
  },
  chiron: {
    principle: 'Wound, healing and wisdom',
    keywords: ['wound', 'healing', 'mastery', 'acceptance'],
    verb: 'carry a tender wound that, once embraced, becomes a gift for healing',
    description: 'Chiron, the wounded healer, shows where you felt a deep pain — and where, by embracing it, you develop the wisdom to help others.',
    transit: 'reopens old wounds so they can finally heal',
  },
  node: {
    principle: 'Destiny and direction of growth',
    keywords: ['evolving', 'growing', 'soul purpose'],
    verb: 'find your direction of growth',
    description: 'The North Node points to your soul\'s path of growth in this life — the unknown that calls you.',
    transit: 'brings fated encounters and situations',
  },
  southNode: {
    principle: 'Past talents and comfort zone',
    keywords: ['soul memory', 'innate gifts', 'habit'],
    verb: 'rest on talents you already know',
    description: 'The South Node shows gifts brought from earlier stages and patterns that ask to be released.',
    transit: 'makes you revisit the past',
  },
  lilith: {
    principle: 'Shadow, instinct and wild power',
    keywords: ['instinct', 'taboo', 'autonomy'],
    verb: 'keep your freest, untamed instinct',
    description: 'Lilith, the Black Moon, reveals where you refuse to submit and where you hold wounds and wild power.',
    transit: 'brings repressed desires to the surface',
  },
  asc: {
    principle: 'Persona and way of beginning',
    keywords: ['appearance', 'approach', 'body'],
    verb: 'present yourself to the world',
    description: 'The Ascendant is the front door: how you show yourself, begin things and are perceived.',
    transit: '',
  },
  mc: {
    principle: 'Vocation and public achievement',
    keywords: ['career', 'reputation', 'mission'],
    verb: 'seek recognition and achievement',
    description: 'The Midheaven is the highest point of the chart: vocation, career and legacy.',
    transit: '',
  },
}

export const HOUSE_TEXT_EN: HouseText[] = [
  { name: '1st House', theme: 'Identity and appearance', keywords: ['self', 'body', 'presence'], description: 'The 1st House is where it all begins: your personality, your body, your spontaneous way of meeting life.' },
  { name: '2nd House', theme: 'Resources and values', keywords: ['money', 'talents', 'self-worth'], description: 'The 2nd House speaks of material resources, talents, self-worth and what you value.' },
  { name: '3rd House', theme: 'Communication and surroundings', keywords: ['siblings', 'studies', 'exchanges'], description: 'The 3rd House rules communication, studies, siblings, neighbors and short trips.' },
  { name: '4th House', theme: 'Home and roots', keywords: ['family', 'origins', 'intimacy'], description: 'The 4th House is the foundation of the chart: home, family, ancestry and your private emotional life.' },
  { name: '5th House', theme: 'Creativity and pleasure', keywords: ['romance', 'children', 'art'], description: 'The 5th House is the house of joy: romance, creativity, children, hobbies and self-expression.' },
  { name: '6th House', theme: 'Routine and health', keywords: ['daily work', 'body', 'service'], description: 'The 6th House rules routine, health, habits and day-to-day work.' },
  { name: '7th House', theme: 'Partnerships', keywords: ['marriage', 'partners', 'the other'], description: 'The 7th House is the mirror: marriage, partnerships, contracts and what you project onto others.' },
  { name: '8th House', theme: 'Transformation and intimacy', keywords: ['crises', 'sexuality', 'inheritance'], description: 'The 8th House rules transformation, deep intimacy, shared resources and the hidden.' },
  { name: '9th House', theme: 'Expansion and meaning', keywords: ['travel', 'philosophy', 'teaching'], description: 'The 9th House is the search for meaning: long journeys, higher learning, faith and life philosophy.' },
  { name: '10th House', theme: 'Career and vocation', keywords: ['status', 'mission', 'authority'], description: 'The 10th House is the top of the chart: career, reputation, vocation and public achievements.' },
  { name: '11th House', theme: 'Friends and dreams', keywords: ['groups', 'projects', 'future'], description: 'The 11th House rules friendships, groups, networks, collective causes and your dreams for the future.' },
  { name: '12th House', theme: 'Spirituality and the unconscious', keywords: ['retreat', 'karma', 'transcendence'], description: 'The 12th House is the inner ocean: spirituality, the unconscious, retreat and what is hidden.' },
]

export const planetInHouseEn = (p: PlanetText, h: HouseText) =>
  `In the ${h.name.toLowerCase()} (${h.theme.toLowerCase()}), this energy of ${p.principle.toLowerCase()} shows up mostly around ${h.keywords.join(', ')}. This is the area of life where you ${p.verb}.`
