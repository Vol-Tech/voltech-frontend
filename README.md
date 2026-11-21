# Voltech Frontend

Tienda y panel de administración de Voltech, desarrollados con React y Vite.

## Desarrollo local

```bash
npm ci
npm run dev
```

Vite muestra en la terminal la dirección local del frontend (`http://localhost:5173`). Para generar una versión de producción:

```bash
npm run build
```

## Autenticación y roles

El inicio de sesión (tradicional y con Google OAuth) y la sesión en `localStorage` (`voltech_token` y `voltech_user`) se manejan en `src/context/AuthContext.jsx`. Para que el botón de Google funcione en local, el origen `http://localhost:5173` debe estar autorizado en Google Cloud Console.

Las rutas del panel (`/admin`) están protegidas con `ProtectedRoute.jsx` según el rol del usuario:

- **ADMINISTRADOR:** acceso completo al dashboard, órdenes, productos, categorías, usuarios y reportes.
- **VENDEDOR:** solo puede ver el listado y detalle de productos (`/admin/productos`) y órdenes/boletas (`/admin/ordenes`). No tiene acceso al resto del panel ni a crear, editar o eliminar registros.
- **CLIENTE:** solo navega en la tienda pública; si intenta entrar a `/admin`, se redirige al inicio.

## API

Las llamadas HTTP están centralizadas en `src/services/api.js` y adjuntan automáticamente la cabecera `Authorization: Bearer <token>` cuando hay una sesión activa.

Actualmente apuntan a `http://localhost:3000/api` y soportan tanto respuestas con la forma `{ exito, data, mensaje }` como JSON directo o `204 No Content`. Para conectar con el microservicio Spring Boot (`/api/v1`), basta con actualizar `API_URL` en `src/services/api.js` y `src/context/AuthContext.jsx` y verificar que las rutas de usuarios, productos y pedidos coincidan.

## Pruebas unitarias

El proyecto usa Karma y Jasmine (`karma.conf.cjs`) corriendo en `ChromeHeadless`. Para ejecutar los tests:

```bash
npm test
```

Los archivos `.spec.js` y `.spec.jsx` cubren el catálogo de productos, `AuthContext`, `ProtectedRoute`, `ListadoOrdenes` y los servicios de `api.js`.
