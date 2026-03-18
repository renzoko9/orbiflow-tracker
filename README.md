# OrbiFlow Tracker

Aplicacion de finanzas personales para gestionar cuentas, categorias y transacciones. Backend en NestJS con PostgreSQL y app movil en React Native con Expo.

## Tech Stack

### Backend
- **NestJS** 11 + **TypeScript** 5
- **PostgreSQL** con **TypeORM** 0.3
- **JWT** (access + refresh tokens)
- **Nodemailer** + Handlebars (verificacion por email)
- **Swagger** (documentacion de API)

### Mobile
- **React Native** 0.81 + **Expo** 54
- **Expo Router** 6 (navegacion basada en archivos)
- **NativeWind** 4 (Tailwind CSS para RN)
- **React Hook Form** + **Zod** (formularios y validacion)
- **Axios** (cliente HTTP con interceptores JWT)

## Funcionalidades

### Implementadas
- Registro de usuario con verificacion de email (codigo de 6 digitos)
- Login con JWT (access token 15min + refresh token 7d)
- Gestion de cuentas (CRUD, cuenta por defecto al registrar)
- Gestion de categorias (globales y por usuario, tipo ingreso/gasto)
- Gestion de transacciones (asociadas a cuenta y categoria)
- Rate limiting global (10 req/min) y especifico en reenvio de verificacion (3 req/min)
- App movil con pantallas de auth, dashboard, cuentas, movimientos y ajustes

### Pendientes
- Pantalla de verificacion de email en mobile
- Recuperacion de contrasena
- Reportes y graficos de movimientos
- Notificaciones push
- Exportacion de datos

## Estructura del Proyecto

```
orbiflow-tracker/
├── backend/                          # API REST NestJS
│   └── src/
│       ├── config/                   # Configuracion (TypeORM, Mail)
│       ├── common/                   # Guards, decoradores, filtros, JWT
│       ├── database/
│       │   ├── entities/             # Entidades TypeORM
│       │   └── repositories/         # Repositorios
│       └── modules/
│           ├── auth/                 # Autenticacion y registro
│           ├── users/                # Usuarios
│           ├── accounts/             # Cuentas
│           ├── categories/           # Categorias
│           ├── transactions/         # Transacciones
│           └── mail/                 # Servicio de email
│
└── orbiflow-mobile-nativewind/       # App movil React Native
    ├── app/
    │   ├── (auth)/                   # Pantallas de autenticacion
    │   └── (tabs)/                   # Pantallas principales
    ├── src/
    │   ├── core/                     # Servicios, schemas, modelos
    │   └── ui/                       # Componentes reutilizables
    └── environments/                 # Configuracion por entorno
```

## Setup

### Requisitos
- Node.js 22+
- PostgreSQL
- Expo CLI

### Backend

```bash
cd backend
npm install
cp .env.example .env   # Configurar variables de entorno
npm run start:dev
```

La API estara disponible en `http://localhost:4800/api/v1`.

### Mobile

```bash
cd orbiflow-mobile-nativewind
npm install
npm run start:dev      # Inicia Expo en modo desarrollo
```

### Variables de Entorno (Backend)

| Variable | Descripcion |
|----------|-------------|
| `PORT` | Puerto del servidor |
| `CONTEXT` | Prefijo de rutas (ej: `/api/v1`) |
| `CORS_ORIGIN` | Origen permitido para CORS |
| `DATABASE_*` | Conexion a PostgreSQL |
| `JWT_SECRET` | Secreto para firmar tokens |
| `EMAIL_HOST` | Host SMTP |
| `EMAIL_PORT` | Puerto SMTP |
| `EMAIL_USER` | Usuario SMTP |
| `EMAIL_PASSWORD` | Contrasena SMTP (App Password para Gmail) |
| `EMAIL_FROM` | Remitente de correos |

## API Endpoints

### Auth
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/auth/register` | Registro + envio de codigo de verificacion |
| POST | `/auth/login` | Login (requiere email verificado) |
| POST | `/auth/verify-email` | Verificar cuenta con codigo |
| POST | `/auth/resend-verification` | Reenviar codigo (3 req/min) |
| POST | `/auth/refresh` | Refrescar access token |

### Accounts, Categories, Transactions
CRUD completo con autenticacion JWT requerida.

## Licencia

Proyecto privado.
