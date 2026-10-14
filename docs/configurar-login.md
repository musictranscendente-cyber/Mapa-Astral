# Configurar o login (Supabase + Google + e-mail)

O app funciona sem login. Quando estas variáveis existem no build, aparecem a tela **Conta**
(ícone ☺ no topo) e a sincronização dos mapas na nuvem.

## 1. Criar o projeto no Supabase

1. Crie uma conta gratuita em <https://supabase.com> e clique em **New project**
   (região sugerida: *South America (São Paulo)*).
2. Em **SQL Editor → New query**, cole o conteúdo de `supabase/migrations/0001_contas_e_mapas.sql` e clique em **Run**.
   Isso cria a tabela dos mapas com segurança por usuário (cada pessoa só vê os próprios) e a função de excluir conta.
3. Em **Project Settings → API**, copie:
   - **Project URL** → será `VITE_SUPABASE_URL`
   - **anon public key** → será `VITE_SUPABASE_ANON_KEY` (essa chave é pública por design; a segurança vem das regras do banco)

## 2. Endereços permitidos

Em **Authentication → URL Configuration**:

- **Site URL:** `https://musictranscendente-cyber.github.io/Mapa-Astral/`
- **Redirect URLs:** adicione `https://musictranscendente-cyber.github.io/Mapa-Astral/` e `http://localhost:5173/`

## 3. Entrar com e-mail (código de 6 dígitos)

Em **Authentication → Email Templates → Magic Link**, troque o texto por algo como:

```html
<h2>Seu código do Mapa Astral</h2>
<p>Digite este código no app: <strong style="font-size:24px">{{ .Token }}</strong></p>
<p>Ou toque para entrar: <a href="{{ .ConfirmationURL }}">Entrar no Mapa Astral</a></p>
```

O código é o caminho mais confiável no app instalado no celular (o link abre no navegador).
Para volume real de e-mails, configure um SMTP próprio em **Project Settings → Authentication → SMTP**
(o envio padrão do Supabase tem limite baixo por hora).

## 4. Entrar com Google

1. Em <https://console.cloud.google.com>: crie um projeto → **APIs e serviços → Tela de consentimento OAuth**
   (tipo *Externo*, nome "Mapa Astral", seu e-mail de suporte).
2. **Credenciais → Criar credenciais → ID do cliente OAuth → Aplicativo da Web**.
   Em **URIs de redirecionamento autorizados**, cole a URL que o Supabase mostra em
   **Authentication → Providers → Google** (algo como `https://SEU-PROJETO.supabase.co/auth/v1/callback`).
3. Copie o **Client ID** e o **Client Secret** para **Authentication → Providers → Google** no Supabase e ative.

## 5. Publicar com as variáveis

No GitHub: **Settings → Secrets and variables → Actions → aba Variables → New repository variable**:

| Nome | Valor |
|---|---|
| `VITE_SUPABASE_URL` | Project URL do passo 1 |
| `VITE_SUPABASE_ANON_KEY` | anon public key do passo 1 |

Depois rode **Actions → Deploy → Run workflow** (ou faça qualquer merge na `main`).

Para testar localmente, crie um arquivo `.env.local` com as mesmas duas variáveis e rode `npm run dev`.
