export interface Place {
  name: string
  region?: string
  country?: string
  latitude: number
  longitude: number
  timeZone: string
}

/** Offline fallback when the geocoding service is unavailable. */
export const OFFLINE_CITIES: Place[] = [
  { name: 'São Paulo', region: 'SP', country: 'Brasil', latitude: -23.5505, longitude: -46.6333, timeZone: 'America/Sao_Paulo' },
  { name: 'Rio de Janeiro', region: 'RJ', country: 'Brasil', latitude: -22.9068, longitude: -43.1729, timeZone: 'America/Sao_Paulo' },
  { name: 'Belo Horizonte', region: 'MG', country: 'Brasil', latitude: -19.9167, longitude: -43.9345, timeZone: 'America/Sao_Paulo' },
  { name: 'Brasília', region: 'DF', country: 'Brasil', latitude: -15.7939, longitude: -47.8828, timeZone: 'America/Sao_Paulo' },
  { name: 'Salvador', region: 'BA', country: 'Brasil', latitude: -12.9777, longitude: -38.5016, timeZone: 'America/Bahia' },
  { name: 'Fortaleza', region: 'CE', country: 'Brasil', latitude: -3.7319, longitude: -38.5267, timeZone: 'America/Fortaleza' },
  { name: 'Recife', region: 'PE', country: 'Brasil', latitude: -8.0476, longitude: -34.877, timeZone: 'America/Recife' },
  { name: 'Porto Alegre', region: 'RS', country: 'Brasil', latitude: -30.0346, longitude: -51.2177, timeZone: 'America/Sao_Paulo' },
  { name: 'Curitiba', region: 'PR', country: 'Brasil', latitude: -25.4284, longitude: -49.2733, timeZone: 'America/Sao_Paulo' },
  { name: 'Florianópolis', region: 'SC', country: 'Brasil', latitude: -27.5954, longitude: -48.548, timeZone: 'America/Sao_Paulo' },
  { name: 'Manaus', region: 'AM', country: 'Brasil', latitude: -3.119, longitude: -60.0217, timeZone: 'America/Manaus' },
  { name: 'Belém', region: 'PA', country: 'Brasil', latitude: -1.4558, longitude: -48.4902, timeZone: 'America/Belem' },
  { name: 'Goiânia', region: 'GO', country: 'Brasil', latitude: -16.6869, longitude: -49.2648, timeZone: 'America/Sao_Paulo' },
  { name: 'Campinas', region: 'SP', country: 'Brasil', latitude: -22.9099, longitude: -47.0626, timeZone: 'America/Sao_Paulo' },
  { name: 'Natal', region: 'RN', country: 'Brasil', latitude: -5.7945, longitude: -35.211, timeZone: 'America/Fortaleza' },
  { name: 'João Pessoa', region: 'PB', country: 'Brasil', latitude: -7.1195, longitude: -34.845, timeZone: 'America/Fortaleza' },
  { name: 'Maceió', region: 'AL', country: 'Brasil', latitude: -9.6498, longitude: -35.7089, timeZone: 'America/Maceio' },
  { name: 'Aracaju', region: 'SE', country: 'Brasil', latitude: -10.9472, longitude: -37.0731, timeZone: 'America/Maceio' },
  { name: 'São Luís', region: 'MA', country: 'Brasil', latitude: -2.5307, longitude: -44.3068, timeZone: 'America/Fortaleza' },
  { name: 'Teresina', region: 'PI', country: 'Brasil', latitude: -5.0892, longitude: -42.8019, timeZone: 'America/Fortaleza' },
  { name: 'Cuiabá', region: 'MT', country: 'Brasil', latitude: -15.601, longitude: -56.0974, timeZone: 'America/Cuiaba' },
  { name: 'Campo Grande', region: 'MS', country: 'Brasil', latitude: -20.4697, longitude: -54.6201, timeZone: 'America/Campo_Grande' },
  { name: 'Vitória', region: 'ES', country: 'Brasil', latitude: -20.3155, longitude: -40.3128, timeZone: 'America/Sao_Paulo' },
  { name: 'Porto Velho', region: 'RO', country: 'Brasil', latitude: -8.7612, longitude: -63.9004, timeZone: 'America/Porto_Velho' },
  { name: 'Rio Branco', region: 'AC', country: 'Brasil', latitude: -9.9754, longitude: -67.8249, timeZone: 'America/Rio_Branco' },
  { name: 'Macapá', region: 'AP', country: 'Brasil', latitude: 0.0349, longitude: -51.0694, timeZone: 'America/Belem' },
  { name: 'Boa Vista', region: 'RR', country: 'Brasil', latitude: 2.8235, longitude: -60.6758, timeZone: 'America/Boa_Vista' },
  { name: 'Palmas', region: 'TO', country: 'Brasil', latitude: -10.1844, longitude: -48.3336, timeZone: 'America/Araguaina' },
  { name: 'Lisboa', country: 'Portugal', latitude: 38.7223, longitude: -9.1393, timeZone: 'Europe/Lisbon' },
  { name: 'Porto', country: 'Portugal', latitude: 41.1579, longitude: -8.6291, timeZone: 'Europe/Lisbon' },
  { name: 'Luanda', country: 'Angola', latitude: -8.839, longitude: 13.2894, timeZone: 'Africa/Luanda' },
  { name: 'Maputo', country: 'Moçambique', latitude: -25.9692, longitude: 32.5732, timeZone: 'Africa/Maputo' },
  { name: 'Buenos Aires', country: 'Argentina', latitude: -34.6037, longitude: -58.3816, timeZone: 'America/Argentina/Buenos_Aires' },
  { name: 'Montevidéu', country: 'Uruguai', latitude: -34.9011, longitude: -56.1645, timeZone: 'America/Montevideo' },
  { name: 'Santiago', country: 'Chile', latitude: -33.4489, longitude: -70.6693, timeZone: 'America/Santiago' },
  { name: 'Lima', country: 'Peru', latitude: -12.0464, longitude: -77.0428, timeZone: 'America/Lima' },
  { name: 'Bogotá', country: 'Colômbia', latitude: 4.711, longitude: -74.0721, timeZone: 'America/Bogota' },
  { name: 'Cidade do México', country: 'México', latitude: 19.4326, longitude: -99.1332, timeZone: 'America/Mexico_City' },
  { name: 'Nova York', country: 'EUA', latitude: 40.7128, longitude: -74.006, timeZone: 'America/New_York' },
  { name: 'Miami', country: 'EUA', latitude: 25.7617, longitude: -80.1918, timeZone: 'America/New_York' },
  { name: 'Los Angeles', country: 'EUA', latitude: 34.0522, longitude: -118.2437, timeZone: 'America/Los_Angeles' },
  { name: 'Londres', country: 'Reino Unido', latitude: 51.5074, longitude: -0.1278, timeZone: 'Europe/London' },
  { name: 'Paris', country: 'França', latitude: 48.8566, longitude: 2.3522, timeZone: 'Europe/Paris' },
  { name: 'Madri', country: 'Espanha', latitude: 40.4168, longitude: -3.7038, timeZone: 'Europe/Madrid' },
  { name: 'Roma', country: 'Itália', latitude: 41.9028, longitude: 12.4964, timeZone: 'Europe/Rome' },
  { name: 'Berlim', country: 'Alemanha', latitude: 52.52, longitude: 13.405, timeZone: 'Europe/Berlin' },
  { name: 'Tóquio', country: 'Japão', latitude: 35.6762, longitude: 139.6503, timeZone: 'Asia/Tokyo' },
  { name: 'Sydney', country: 'Austrália', latitude: -33.8688, longitude: 151.2093, timeZone: 'Australia/Sydney' },
]

const strip = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function searchOffline(q: string): Place[] {
  const n = strip(q.trim())
  if (!n) return []
  return OFFLINE_CITIES.filter((c) => strip(c.name).includes(n)).slice(0, 8)
}

interface OpenMeteoResult {
  name: string
  latitude: number
  longitude: number
  timezone?: string
  country?: string
  admin1?: string
}

/** Open-Meteo geocoding — free, no key, CORS-enabled, returns IANA time zones. */
export async function searchPlaces(q: string, signal?: AbortSignal): Promise<Place[]> {
  const query = q.trim()
  if (query.length < 2) return []
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=pt&format=json`
    const res = await fetch(url, { signal })
    if (!res.ok) throw new Error(String(res.status))
    const json = (await res.json()) as { results?: OpenMeteoResult[] }
    const list = (json.results ?? [])
      .filter((r) => r.timezone)
      .map((r) => ({
        name: r.name,
        region: r.admin1,
        country: r.country,
        latitude: r.latitude,
        longitude: r.longitude,
        timeZone: r.timezone!,
      }))
    return list.length ? list : searchOffline(query)
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e
    return searchOffline(query)
  }
}

export const placeLabel = (p: Place) => [p.name, p.region, p.country].filter(Boolean).join(', ')
