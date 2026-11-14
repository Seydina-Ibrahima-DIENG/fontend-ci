# Dockerfile du frontend Angular (multi-stage)
# Étage 1 : Node compile l'application  →  Étage 2 : Nginx sert les fichiers

# ---------- Étage 1 : build Angular ----------
FROM node:22-alpine AS builder

WORKDIR /app

# 1) D'abord UNIQUEMENT les fichiers de dépendances (pour profiter du cache Docker)
# Connexion instable : npm réessaie et attend plus longtemps avant d'abandonner
ENV npm_config_fetch_retries=5 \
    npm_config_fetch_retry_mintimeout=20000 \
    npm_config_fetch_retry_maxtimeout=120000 \
    npm_config_fetch_timeout=600000

COPY package.json package-lock.json ./

# Le cache npm est conservé entre les builds (comme le cache Maven du backend)
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit --no-fund

# 2) Ensuite le code source, puis la compilation en mode production
COPY . .
RUN npm run build

# ---------- Étage 2 : Nginx sert les fichiers statiques ----------
# Variante "unprivileged" : Nginx tourne SANS droits root (port 8080)
FROM nginxinc/nginx-unprivileged:alpine


# Correctif de sécurité : applique les mises à jour des paquets Alpine.
# Corrige notamment CVE-2026-111497 (brotli-libs, CRITICAL) détectée par Trivy.
USER root
RUN apk upgrade --no-cache
USER 101

# Notre configuration Nginx (pages Angular + redirection /api vers la gateway)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# On récupère UNIQUEMENT le résultat du build Angular
COPY --from=builder /app/dist/jangalma/browser /usr/share/nginx/html

EXPOSE 8080