# Voltech Frontend

Tienda y panel de administración de Voltech, desarrollados con React y Vite.

## Desarrollo local

```bash
npm ci
npm run dev
```

Vite muestra en la terminal la dirección local del frontend. Para generar una versión de producción:

```bash
npm run build
```

## API

Las llamadas HTTP están centralizadas en `src/services/api.js`. Actualmente usan `http://localhost:3000/api` y esperan respuestas de la API de Node.js con la forma `{ exito, data, mensaje }`.

El microservicio Spring Boot de usuarios del repositorio hermano expone `GET` y `POST /api/v1/usuarios` con respuestas JSON directas. Antes de conectar registro, inicio de sesión y actualización de dirección, hay que adaptar esas rutas y los datos que intercambian ambos proyectos. Productos y pedidos todavía usan la API anterior.
