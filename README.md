# Backend de reservas de pádel

Aplicación Node.js con Express y MongoDB para gestionar:

- Registro y login de usuarios
- Reserva de una de las 3 pistas
- Cancelación de reserva
- Persistencia en base de datos MongoDB
- Credenciales cargadas desde un fichero `.env`

## Variables de entorno

Crea un fichero `.env` con este contenido:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/padel-reservas
JWT_SECRET=supersecret
```

## Instalación

```bash
npm install
```

## Ejecución

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
npm start
```

Esto compila el frontend Angular y levanta el backend Express sirviendo la SPA desde el mismo dominio.

## Endpoints principales

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Reservas (requiere JWT)

- `GET /api/reservations`
- `POST /api/reservations`
- `PATCH /api/reservations/:id/cancel`
