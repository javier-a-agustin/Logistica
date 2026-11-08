# =====================================================================
# Dockerfile del FRONTEND (React + Vite)
# Etapa 1: Node compila la app a archivos estáticos (HTML/JS/CSS en /dist)
# Etapa 2: Nginx sirve esos archivos y reenvía /api al backend
# =====================================================================

# ---------- Etapa 1: compilar ----------
FROM node:22-alpine AS build
WORKDIR /app

# Primero solo package.json + lock para cachear "npm ci" (igual que en el backend)
COPY package.json package-lock.json ./
RUN npm ci

# Copiamos el resto del código y generamos el build de producción
COPY . .
RUN npm run build

# ---------- Etapa 2: servir ----------
FROM nginx:1.27-alpine
# Nuestra configuración de Nginx (SPA + proxy hacia el backend)
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Los archivos compilados van a la carpeta que publica Nginx
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
