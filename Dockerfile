# Stage 1: Build Angular application
FROM node:20-alpine AS build
WORKDIR /app

# Copy package configurations and install dependencies
COPY package*.json ./
RUN npm ci

# Copy application source code and compile
COPY . .
RUN npm run build -- --configuration=production

# Stage 2: Serve application with Nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy built files from the browser build target
COPY --from=build /app/dist/imobiliaria-front/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
