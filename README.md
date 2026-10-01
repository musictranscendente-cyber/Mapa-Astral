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

## Desenvolvimento

```bash
npm install
npm run dev      # servidor local
npm test         # testes de precisão
npm run build    # build de produção em dist/
```

O workflow `.github/workflows/deploy.yml` publica no GitHub Pages a cada push na `main`
(ative em *Settings → Pages → Source: GitHub Actions*).
