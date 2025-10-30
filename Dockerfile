# Usa una imagen base oficial de Node.js
FROM node:22-alpine

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia el package.json y yarn.lock
COPY package.json yarn.lock ./

# Instala las dependencias
RUN yarn install --frozen-lockfile

# Copia el resto del código de la aplicación
COPY . .

# Compila la aplicación
RUN yarn build

# Expone el puerto que usa la aplicación
EXPOSE 8080

# Comando para iniciar la aplicación
CMD ["sh", "-c", "yarn migration:run && yarn seed && yarn start:prod"]