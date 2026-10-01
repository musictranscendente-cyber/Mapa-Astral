# ✶ Mapa Astral

Aplicativo web de astrologia com cálculos astronômicos precisos e visual imersivo: mapa natal completo,
céu do dia e projeção de trânsitos pessoais para os dias e meses seguintes.

## Recursos

- **Mapa natal** — Sol a Plutão, Nodo Norte/Sul verdadeiro, Lilith média, Roda da Fortuna, Ascendente e Meio do Céu.
  Roda interativa em SVG (toque em um planeta para destacar seus aspectos), tabelas de planetas e casas,
  grade de aspectos, equilíbrio de elementos/modalidades/hemisférios e relatório interpretativo completo em português.
- **Sistemas de casas** — Placidus, Koch, Porfírio, Casas Iguais e Signos Inteiros (Porfírio como fallback em latitudes polares).
- **Céu de hoje** — posições ao vivo, fase da Lua realista (orientada para o hemisfério do observador), próximas lunações,
  retrogradações, aspectos do céu e roda dupla *céu × mapa natal* com seus trânsitos do momento.
- **Previsões** — 7 dias a 1 ano: curva de fluxo energético diário, áreas da vida (amor, carreira, energia, mente,
  emoções, espiritualidade), linha do tempo com o período ativo de cada trânsito e o instante exato, cartões interpretativos e ciclo lunar.
- **Sinastria** — compatibilidade entre dois mapas: índice geral e por dimensão (atração, emoção, comunicação, romance,
  compromisso, crescimento), roda dupla com os contatos, o que flui e o que desafia, e sobreposição de casas.
- **Revolução Solar** — instante exato do retorno do Sol (iteração de Newton, erro < 1 s), mapa do ano para a cidade natal,
  a localização atual ou qualquer cidade, com Ascendente do ano, casas do Sol e da Lua e planetas angulares.
- **Notificações diárias** — o trânsito mais relevante do dia e o clima da Lua, no horário escolhido (service worker +
  Periodic Background Sync no app instalado; nos demais navegadores, ao abrir o app).
- **Leitura por IA** — texto personalizado gerado pelo Claude (`claude-opus-5-5`, streaming) para mapa natal, sinastria,
  revolução solar e previsões, a partir das posições já calculadas.
- **Perfis** — vários mapas salvos localmente no dispositivo; impressão/PDF do relatório; instalável (manifest PWA).

## Precisão

- Efemérides: [Astronomy Engine](https://github.com/cosinekitty/astronomy) (VSOP87/ELP, precisão melhor que 1′),
  posições aparentes geocêntricas na eclíptica e equinócio verdadeiros da data (zodíaco tropical).
- Nodo verdadeiro calculado pelo plano osculador da órbita lunar (validado contra a série de Meeus).
- Ascendente/MC a partir do tempo sideral aparente e da obliquidade verdadeira.
- Fuso horário histórico (incluindo horário de verão brasileiro) via base IANA do navegador; cidades por
  geocodificação Open-Meteo, com lista offline de reserva e ajuste manual de coordenadas/fuso.
- Trânsitos localizados por varredura + bisseção (erro < 1 minuto).

Os testes (`src/astro/astro.test.ts`) verificam de forma independente que o Ascendente está no horizonte leste,
o MC no meridiano, que as cúspides de Placidus trissecam os semi-arcos, o horário de verão histórico e a exatidão dos trânsitos.

## Leitura por IA — configuração

Dois modos:

1. **Chave pessoal (teste/uso próprio):** em *Ajustes → Leitura por IA*, informe uma chave da API da Anthropic. Ela fica
   apenas no aparelho e a chamada vai direto do navegador para a API.
2. **Endpoint de servidor (produção):** publique `api/ai-reading.ts` (ex.: Vercel, com a variável `ANTHROPIC_API_KEY`)
   e defina `VITE_AI_ENDPOINT` com a URL no build (no GitHub: *Settings → Secrets and variables → Actions → Variables*).
   A chave fica só no servidor; o navegador envia apenas o resumo calculado do mapa. Antes de abrir ao público,
   adicione login e limite de uso (parte da fase de monetização).

As leituras usam fallback automático do servidor (`fallbacks: "default"`) e ficam salvas no aparelho para não repetir custo.

## Desenvolvimento

```bash
npm install
npm run dev      # servidor local
npm test         # testes de precisão
npm run build    # build de produção em dist/
```

O workflow `.github/workflows/deploy.yml` publica no GitHub Pages a cada push na `main`
(ative em *Settings → Pages → Source: GitHub Actions*).
