import type { AngleKey } from '../../astro/astrocarto'
import type { PlanetKey } from '../../astro/constants'

export const ANGLE_NAME_EN: Record<AngleKey, string> = { AC: 'Ascendant', MC: 'Midheaven', DC: 'Descendant', IC: 'Imum Coeli' }

export const ANGLE_GUIDE_EN: Record<AngleKey, { title: string; text: string }> = {
  AC: { title: 'AC · Ascendant — solid line', text: 'Where the planet was rising on the horizon. Near this line it acts on you yourself: your body, your energy, the way people see you. It\'s the most "personal" line.' },
  MC: { title: 'MC · Midheaven — solid vertical line', text: 'Where the planet was at the highest point of the sky. It stirs career, reputation and public life: the line of vocation and of how you\'re recognized there.' },
  DC: { title: 'DC · Descendant — dashed line', text: 'Where the planet was setting. It works through other people: partnerships, marriage, business partners, clients and even rivals. It shows the kind of person you tend to meet there.' },
  IC: { title: 'IC · Imum Coeli — dotted vertical line', text: 'Where the planet was beneath your feet, on the other side of the Earth. It speaks of home, family, roots and private life: the "living there" line, felt most in daily home life.' },
}

export const PLANET_GUIDE_EN: Partial<Record<PlanetKey, string>> = {
  sun: 'vitality, self-confidence and standing out', moon: 'emotions, comfort and a sense of belonging', mercury: 'ideas, studies, contacts and business',
  venus: 'love, beauty, pleasure and good relationships', mars: 'energy and courage — also haste and conflict', jupiter: 'luck, growth and opportunities',
  saturn: 'effort, structure and maturity — sometimes a burden', uranus: 'change, freedom and the unexpected', neptune: 'inspiration and spirituality — also confusion',
  pluto: 'deep transformation, power and intensity',
}

export const LINES_EN: Partial<Record<PlanetKey, Record<AngleKey, string>>> = {
  sun: { AC: 'You feel more alive, confident and visible; great for starting over and boosting self-esteem.', MC: 'A line of success and professional recognition: a chance to lead and be noticed for what you do.', DC: 'Defining partnerships with strong, brilliant people; you discover yourself through others.', IC: 'A sense of home and pride in your roots; good for starting a family and building a solid base.' },
  moon: { AC: 'You become more sensitive, intuitive and nurturing; people come close easily.', MC: 'Contact with the public and work that cares for people; popularity, with some ups and downs.', DC: 'Affectionate, protective relationships; deep emotional bonds (sometimes dependence).', IC: 'One of the best lines to live on: a feeling of home, family and emotional comfort.' },
  mercury: { AC: 'A quick, communicative and curious mind; good for studying, writing and making contacts.', MC: 'A career in communication, teaching, trade, technology or media gains strength.', DC: 'Partners, contracts and intellectual exchange; partnerships driven by conversation and ideas.', IC: 'A lively home full of books and conversation; good for working or studying from home.' },
  venus: { AC: 'Charm, beauty and magnetism run high; you feel good and attract people and kindness.', MC: 'A career in art, beauty, fashion or diplomacy; a likeable reputation and good network.', DC: 'The classic love line: a greater chance of romance, marriage and harmonious partnerships.', IC: 'A beautiful, harmonious home and family at peace; a lovely place to live.' },
  mars: { AC: 'Physical energy, courage and initiative — but also impatience, fights and accident risk.', MC: 'Ambition and competitiveness in your career; good for starting a business and leading, with rivalries.', DC: 'Intense, passionate relationships with friction; you attract strong people or rivals.', IC: 'Lots of energy at home: renovations and moves, but also family tension.' },
  jupiter: { AC: 'Optimism, generosity and personal luck; doors open easily.', MC: 'One of the best lines for your career: growth, prestige and opportunities.', DC: 'Generous partners and associates who help you grow; marriages are favored.', IC: 'A spacious home, a prosperous family and a sense of abundance; great for living.' },
  saturn: { AC: 'Seriousness and responsibility weigh more; the place matures you but can tire or isolate you.', MC: 'A career built with effort and patience; slow but solid recognition.', DC: 'Serious, committed relationships, sometimes cold or with an age gap.', IC: 'Family and home matters take work; good for putting down roots with discipline.' },
  uranus: { AC: 'Freedom, originality and sudden changes; inspiring, but daily life gets unstable.', MC: 'An innovative career, technology and unexpected professional turns.', DC: 'Surprising encounters and unconventional relationships that need space.', IC: 'Frequent changes of home and routine; it\'s hard to feel settled for long.' },
  neptune: { AC: 'Sensitivity, creativity and spirituality increase; watch out for confusion and fatigue.', MC: 'A career in art, music, healing or spirituality; an inspiring (or blurry) public image.', DC: 'Idealized, romantic relationships; watch out for illusions and disappointments.', IC: 'Home as a spiritual refuge near water or nature; not very practical, very sensitive.' },
  pluto: { AC: 'Intense personal transformation: you reinvent yourself, with magnetism and growth crises.', MC: 'Power and influence in your career, with power struggles and big turning points.', DC: 'Deep, transformative relationships that stir up control and jealousy.', IC: 'It stirs up roots and family; a place of deep healing, not always easy.' },
}

export const STRENGTH_EN = { strong: 'strong influence', medium: 'medium influence', mild: 'mild influence' }
