# Deploy Ubuntu + Nginx + Cloudflare

Guia para publicar `ecolink.eco.br` na VM Ubuntu `163.176.154.127`.

## 1. Cloudflare

No DNS da zona `ecolink.eco.br`, crie:

```text
A      @      163.176.154.127      Proxied
CNAME  www    ecolink.eco.br       Proxied
```

Se a zona no Cloudflare for `eco.br`, use o nome `ecolink` no registro A em vez de `@`.

Em `SSL/TLS > Overview`, use `Full (strict)`.

Em `SSL/TLS > Origin Server`, crie um certificado para:

```text
ecolink.eco.br
*.ecolink.eco.br
```

Importante: se a private key ja foi colada em chat, commit, print ou ticket, revogue esse certificado e gere outro antes de publicar.

Salve o novo certificado e a nova chave na VM em arquivos temporarios:

```bash
nano /tmp/ecolink-origin.pem
nano /tmp/ecolink-origin.key
chmod 600 /tmp/ecolink-origin.key
```

Depois instale nos caminhos usados pelo Nginx:

```bash
chmod +x deploy/install-cloudflare-origin-cert.sh
./deploy/install-cloudflare-origin-cert.sh /tmp/ecolink-origin.pem /tmp/ecolink-origin.key
rm -f /tmp/ecolink-origin.pem /tmp/ecolink-origin.key
```

## 2. Supabase

Como o frontend usa Supabase Auth, libere o dominio em `Authentication > URL Configuration`:

```text
Site URL: https://ecolink.eco.br
Redirect URLs:
https://ecolink.eco.br/**
https://www.ecolink.eco.br/**
```

## 3. Pacotes na VM

```bash
sudo apt update
sudo apt install -y nginx git curl ca-certificates docker.io docker-compose-plugin
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo systemctl enable --now nginx docker
node -v
npm -v
```

## 4. Build do frontend

Na pasta do projeto:

```bash
cp .env.example .env.local
nano .env.local
npm ci
npm run build
sudo mkdir -p /var/www/ecolink/dist
sudo rsync -a --delete dist/ /var/www/ecolink/dist/
```

O `.env.local` precisa ter o projeto Supabase ativo:

```bash
VITE_SUPABASE_URL=https://seu-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

## 5. API

```bash
cd api
docker compose up -d --build db api
docker compose exec api alembic upgrade head
```

A API fica disponivel somente para a propria VM em `127.0.0.1:8000`.

## 6. Nginx

Na raiz do projeto:

```bash
sudo cp nginx/ecolink.eco.br.conf /etc/nginx/sites-available/ecolink.eco.br.conf
sudo cp nginx/cloudflare-real-ip.conf /etc/nginx/cloudflare-real-ip.conf
sudo ln -s /etc/nginx/sites-available/ecolink.eco.br.conf /etc/nginx/sites-enabled/ecolink.eco.br.conf
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## 7. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

## 8. Testes

```bash
curl -I http://ecolink.eco.br
curl -I https://ecolink.eco.br
curl https://ecolink.eco.br/health
curl https://ecolink.eco.br/api/v1/ping
```
