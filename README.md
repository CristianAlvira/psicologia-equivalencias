<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# psicologia-equivalencias API

# Instrucciones - Modo de desarrollo

1. Clonar proyecto
2. Instalar depedencias con

```
yarn install
```

3. Clona el archivo `.env.template` y renómbralo a `.env`
4. Cambiar las variables de entorno
5. Ejecutar db con

```
docker-compose up
```

6. Ejecutar migraciones necesarias con

```
yarn migration:run
```

7. Ejecutar seeders con

```
yarn seed
```

8. Inicia el modo de desarrollo: `yarn start:dev`

# Instrucciones para producción

1. Cambiar las variables de entorno
  - Tener en cuenta la variable NODE_ENV en `prod` para manejar migraciones
  - Tener en cuenta el cambio de secrets de JWT para refresh y para access, se puede usar el comando (Hay que tener node instalado)
    ```
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'));"
    ```

2. Ejecutar migraciones necesarias con

```
yarn migration:run
```

3. Ejecutar seeders con

```
yarn seed
```

4. Inicia el proyecto: `yarn start`
5. Tener en cuenta el comando: `yarn migration:run && yarn seed && yarn start` en el render para ejecutar el proyecto
