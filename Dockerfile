# Dockerfile du frontend Angular (multi-stage)
# Étage 1 : Node compile l'application  →  Étage 2 : Nginx sert les fichiers

# ---------- Étage 1 : build Angular ----------
FROM node:22-alpine AS builder

WORKDIR /app

# 1) D'abord UNIQUEMENT les fichiers de dépendances (pour profiter du cache Docker)
COPY package.json package-lock.json ./
RUN npm ci

# 2) Ensuite le code source, puis la compilation en mode production
COPY . .
RUN npm run build

# ---------- Étage 2 : Nginx sert les fichiers statiques ----------
# Variante "unprivileged" : Nginx tourne SANS droits root (port 8080)
FROM nginxinc/nginx-unprivileged:alpine

# Notre configuration Nginx (pages Angular + redirection /api vers la gateway)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# On récupère UNIQUEMENT le résultat du build Angular
COPY --from=builder /app/dist/jangalma/browser /usr/share/nginx/html

EXPOSE 8080