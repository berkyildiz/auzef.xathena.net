FROM node:20-alpine as builder

WORKDIR /app

# Bağımlılıkları kopyala ve kur
COPY package*.json ./
RUN npm ci

# Kaynak kodları kopyala ve projeyi derle
COPY . .
RUN npm run build

# Production sunucusu için Nginx kullan
FROM nginx:alpine

# Nginx ayar dosyasını kopyala
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Derlenen React uygulamasını Nginx sunucu dizinine kopyala
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
