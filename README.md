# Yazata - Faith Tracker (React + Vite + Tailwind + Clerk + Supabase)

Aplicacao web para equipes registrarem horas trabalhadas.
Tema padrao: **100% dark**.

## Naming

- Nome oficial: `Yazata`
- Descriptor: `Faith Tracker`
- Racional curto: "Yazata" (tradicao avestica) carrega o sentido de "digno de adoracao/veneracao", conectando o produto a uma identidade devocional sem perder a funcao de acompanhamento.
- Documento de apoio: `docs/naming/yazata-branding.md`

## Stack

- React + Vite + TypeScript
- React Router DOM
- Tailwind CSS
- Clerk (autenticacao)
- Supabase (banco + RLS)
- ESLint + Prettier

## Setup rapido

1. Instale dependencias:

```bash
npm install
```

1. Crie o arquivo de ambiente:

```bash
cp .env.example .env
```

1. Preencha o `.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_xxxxxxxxxxxxxxxxxxxxx
SUPABASE_DB_URL=postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres
```

1. Faça login e link do projeto (uma vez):

```bash
npx supabase login
npx supabase link --project-ref ptnnjcmjjlqkrvwurnws
```

1. Rode migrations localmente da sua maquina (Supabase CLI):

```bash
npm run db:push
```

Isso aplica os arquivos em `supabase/migrations/` usando o projeto linkado.
Se quiser forcar URL manual, use `npm run db:push:url`.

1. Configure no Clerk um JWT Template chamado `supabase` e conecte com o projeto Supabase.

1. Rode localmente:

```bash
npm run dev
```

## Scripts uteis

- `npm run lint`
- `npm run lint:fix`
- `npm run format`
- `npm run format:check`
- `npm run build`
- `npm run db:push`
- `npm run db:push:url`
- `npm run db:migration:new -- <nome_da_migration>`
- `npm run db:migration:list`
- `npm run db:migration:list:url`

## Estrutura principal

- `src/App.tsx`: UI de login e registro/listagem de horas
- `src/lib/env.ts`: validacao de variaveis de ambiente
- `src/lib/supabase.ts`: cliente Supabase com token do Clerk
- `src/utils/time.ts`: utilitarios de horas
- `supabase/migrations/`: migrations aplicadas via CLI

## Boas praticas aplicadas

- RLS ativado para proteger dados por usuario (`auth.jwt()->>'sub'`)
- Validacao de horario (`end_time > start_time`)
- Tema dark como padrao de todo o app
- Chaves sensiveis somente via `.env`
