# EcoLink Site

Frontend React + Vite com integracao direta com Supabase. A pasta `api/` contem uma API FastAPI separada, preparada para rodar via Docker na VM.

## Comandos principais

```bash
npm ci
npm run dev
npm run build
npm run preview
npm run lint
```

Em desenvolvimento, o Vite abre em `http://localhost:5173`.

## Variaveis de ambiente

Crie um `.env.local` a partir do `.env.example`:

```bash
VITE_SUPABASE_URL=https://seu-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

Sem essas variaveis, o app usa a configuracao antiga hardcoded. Se o projeto antigo do Supabase estiver removido, pausado ou com URL incorreta, login, cadastro, recuperacao de senha, marketplace, upload e perfil vao falhar.

## Rotas do frontend

```text
/                 Redireciona para /home
/home             Home publica
/marketplace      Area de lotes, somente logado
/dashboard        Cadastro de novo lote, somente logado
/meus-produtos    Lotes do usuario, somente logado
/profile          Perfil, somente logado
/login            Login
/register         Cadastro
/esqueci-senha    Recuperacao de senha
```

Ao acessar `/`, o usuario e redirecionado para `/home`. Ao acessar `/home`, ve a Home publica. Ao fazer login, o usuario vai para `/marketplace`.

## API

```bash
cd api
docker compose up -d --build db api
docker compose exec api alembic upgrade head
```

Em producao, a API fica exposta apenas localmente em `127.0.0.1:8000`, e o Nginx publica `/api/`.

## Deploy

Siga o checklist em `DEPLOY_UBUNTU_NGINX.md` para publicar na VM Ubuntu com Nginx, Cloudflare e o dominio `ecolink.eco.br`.
