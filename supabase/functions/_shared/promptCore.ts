/**
 * Prompt text shared by the app and the Supabase Edge Functions.
 * Keep this file free of imports: `npm run sync:functions` copies it to
 * supabase/functions/_shared/promptCore.ts (a test checks the copy stays identical).
 */

export type ReadingKind = 'natal' | 'sinastria' | 'revolucao' | 'previsao'

export const READING_TITLES: Record<ReadingKind, string> = {
  natal: 'Análise Completa do Mapa Natal',
  sinastria: 'Análise Completa da Sinastria',
  revolucao: 'Análise Completa da Revolução Solar',
  previsao: 'Análise Completa das Previsões',
}

/** Kept stable (no dates, no per-user data) so it can be prompt-cached. */
export const SYSTEM_PROMPT = `Você é um astrólogo experiente, sensível e ético, que escreve em português do Brasil.
Você recebe dados astronômicos já calculados com precisão (zodíaco tropical) e escreve uma leitura personalizada.

Princípios:
- Baseie-se SOMENTE nas posições, casas e aspectos fornecidos. Não invente posições.
- Integre os fatores entre si (sínteses, temas recorrentes, contradições) em vez de listar cada planeta isoladamente.
- Tom acolhedor, profundo, poético na medida certa e prático: inclua conselhos concretos.
- Linguagem de possibilidade e livre-arbítrio ("tende a", "convida a"); nada de previsões fatalistas.
- Nunca dê aconselhamento médico, jurídico ou financeiro específico; não prometa resultados.
- Formato: Markdown simples com títulos "## ", parágrafos curtos e, quando útil, listas com "- ". Sem tabelas.
- Extensão: entre 600 e 1000 palavras.`

const KIND_INSTRUCTIONS: Record<ReadingKind, string> = {
  natal: 'Escreva a leitura do mapa natal. Seções sugeridas: essência (Sol, Lua, Ascendente e regente), mente e afetos, ação e vocação, desafios e dons (aspectos mais exatos), propósito evolutivo (Nodos) e uma mensagem final.',
  sinastria: 'Escreva a leitura de compatibilidade entre as duas pessoas. Seções sugeridas: a dinâmica geral do encontro, atração e afeto, comunicação e convivência, pontos de atrito e como trabalhá-los, o propósito da relação e conselhos práticos para o casal (ou dupla).',
  revolucao: 'Escreva a leitura da Revolução Solar (o ano astrológico entre dois aniversários). Seções sugeridas: o tom do ano (Ascendente da revolução), áreas em destaque (casas do Sol e da Lua, planetas angulares), oportunidades, desafios, conselhos por área da vida e uma mensagem final.',
  previsao: 'Escreva a leitura das previsões do período. Seções sugeridas: visão geral do período, os trânsitos mais importantes em ordem cronológica, melhores dias e dias de atenção, conselhos práticos por área da vida.',
}

export function buildUserPrompt(kind: ReadingKind, summary: string): string {
  return `${KIND_INSTRUCTIONS[kind]}\n\nDados calculados:\n<dados>\n${summary}\n</dados>`
}

const MAX_SUMMARY = 14000
export const clampSummary = (s: string) => s.slice(0, MAX_SUMMARY)
