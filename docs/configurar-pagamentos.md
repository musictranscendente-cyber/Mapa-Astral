# Configurar os pagamentos (Mercado Pago)

O sistema pago já está no código, mas fica **desligado** até você terminar estes passos.
Enquanto estiver desligado, o app continua todo liberado, como antes.

Como funciona:

- **Sem login:** a pessoa vê a roda do mapa, os 3 pilares, o céu de hoje e uma prévia das outras telas.
- **Conta grátis:** relatório completo, previsão de 7 dias, sinastria e revolução solar básicas, até 3 mapas e **1 análise completa de presente**.
- **Avulsos** (pagamento único, Pix ou cartão):
  - Análise do Mapa Natal: R$ 29
  - Sinastria completa: R$ 29
  - Revolução Solar do ano: R$ 39
  - Previsão de 12 meses: R$ 59
  - Pacote Aniversário: R$ 89
- **Planos** (sem renovação automática; renovar soma o tempo):
  - **Estrela:** R$ 14,90 por mês ou R$ 119 por ano. Inclui 3 análises por mês.
  - **Cosmos:** R$ 29,90 por mês ou R$ 249 por ano. Inclui até 30 análises por mês.

Os preços e limites ficam em `src/billing/rules.ts`. Depois de editar esse arquivo, rode `npm run sync:functions`.

---

## Passo 1 — Criar as tabelas no Supabase

1. Abra o Supabase e vá em **SQL Editor → New query**.
2. Copie todo o arquivo `supabase/migrations/0002_pagamentos.sql`, cole e clique em **Run**.
3. Em **Table Editor** devem aparecer 3 tabelas novas: `entitlements`, `purchases` e `analysis_log`.

## Passo 2 — Mercado Pago

1. Entre em <https://www.mercadopago.com.br/developers/panel/app> com a sua conta do Mercado Pago.
2. Clique em **Criar aplicação** e preencha:
   - Nome: Mapa Astral
   - Tipo de pagamento: **Pagamentos online**
   - Produto: **Checkout Pro**
3. Abra a aplicação, vá em **Credenciais de produção** e copie o **Access Token**. Ele começa com `APP_USR-`.
   - Se o Mercado Pago pedir dados do negócio para liberar as credenciais de produção, preencha.
4. Ainda na aplicação, vá em **Webhooks → Configurar notificações**:
   - **URL de produção:** `https://SEU-PROJETO.supabase.co/functions/v1/mp-webhook`
     (use o mesmo endereço do `VITE_SUPABASE_URL`, trocando o final).
   - **Eventos:** marque **Pagamentos**.
   - Salve e copie a **assinatura secreta** que aparece.

## Passo 3 — Chave do serviço de análise

1. Entre em <https://console.anthropic.com> e vá em **API Keys → Create Key**. Copie a chave (`sk-ant-…`).
2. Em **Billing**, adicione créditos. Cada análise custa poucos centavos de dólar.

## Passo 4 — Chave de publicação do Supabase

1. Entre em <https://supabase.com/dashboard/account/tokens>.
2. Clique em **Generate new token**, dê o nome `github` e copie o token (`sbp_…`).

## Passo 5 — Guardar tudo no GitHub (como *secrets*)

No repositório, vá em **Settings → Secrets and variables → Actions**, aba **Secrets**, botão **New repository secret**.
Crie um secret para cada item abaixo:

| Nome                    | Valor                                   |
| ----------------------- | --------------------------------------- |
| `SUPABASE_ACCESS_TOKEN` | o token `sbp_…` do passo 4              |
| `ANTHROPIC_API_KEY`     | a chave `sk-ant-…` do passo 3           |
| `MP_ACCESS_TOKEN`       | o Access Token `APP_USR-…` do passo 2   |
| `MP_WEBHOOK_SECRET`     | a assinatura secreta do webhook (passo 2) |

> Secrets ficam escondidos e só o servidor os usa. **Nunca** coloque essas chaves em *Variables* nem em nomes que começam com `VITE_`.

Depois:

1. Vá na aba **Actions** do GitHub.
2. Abra **Supabase Functions**, clique em **Run workflow** e confirme.
3. Quando o círculo ficar verde ✅, as funções `analysis`, `checkout` e `mp-webhook` estão no ar. Você pode conferir no Supabase, em **Edge Functions**.

## Passo 6 — Ligar o sistema pago no site

1. No GitHub, vá em **Settings → Secrets and variables → Actions**, aba **Variables**, e clique em **New repository variable**.
2. Crie a variável **`VITE_BILLING`** com o valor **`on`**.
3. Vá em **Actions → Deploy → Run workflow** (ou faça qualquer atualização no `main`).

Pronto: os bloqueios, a página **💎 Planos** e os botões de compra aparecem no app.

## Passo 7 — Testar uma compra real

1. Entre no app com a sua conta, abra **💎 Planos** e assine o **Estrela 1 mês** pagando com Pix.
2. Ao voltar para o app, a mensagem "Pagamento aprovado" aparece e o plano é liberado em segundos.
3. No Supabase, a tabela `purchases` mostra a compra como `approved` e `entitlements` mostra o plano.
4. Para receber o dinheiro de volta, faça o reembolso pelo painel do Mercado Pago. A compra passa para `refunded`.
   - Planos estornados não são retirados automaticamente: apague a linha da pessoa em `entitlements` se precisar.

## Se algo der errado

- **"Pagamentos ainda não configurados"**: falta o secret `MP_ACCESS_TOKEN`. Rode de novo o workflow **Supabase Functions** depois de criá-lo.
- **Pagou e não liberou**:
  1. No Mercado Pago, confira o webhook (URL e evento **Pagamentos**).
  2. No Supabase, veja os registros em **Edge Functions → mp-webhook → Logs**.
- **Análise não gera**: confira o secret `ANTHROPIC_API_KEY` e se a conta da Anthropic tem créditos.
- **Desligar tudo rapidamente**: apague a variável `VITE_BILLING` e rode o **Deploy** de novo.
