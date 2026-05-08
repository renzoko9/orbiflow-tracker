# OrbiFlow Tracker

App de finanzas personales con inteligencia artificial. Registra ingresos y gastos, visualiza balances por cuenta y recibe insights accionables generados por LLM directamente sobre el contexto financiero del usuario.

## Tech Stack

| Capa | Tecnologia |
|------|-----------|
| **Backend** | NestJS 11, TypeORM 0.3, PostgreSQL, Passport JWT, Nodemailer + Handlebars |
| **Mobile** | React Native 0.81, Expo 54, Expo Router 6, NativeWind 4, React Hook Form + Zod, TanStack Query, Axios, Zustand |
| **IA** | Capa LLM intercambiable. Providers integrados: Anthropic (claude-haiku-4-5) y OpenAI (gpt-4o-mini) |
| **Lenguaje** | TypeScript strict en ambos proyectos |

## Funcionalidades

- **Autenticacion completa** - Login, registro, verificacion por email (codigo 6 digitos), recuperacion de contrasena, cambio de contrasena con verificacion. JWT dual (access 15min + refresh 7d).
- **Gestion de cuentas** - CRUD con icono y color personalizables. Archivado y restauracion. Balance por cuenta y patrimonio total.
- **Gestion de categorias** - Globales y por usuario. Tipo ingreso/gasto. Iconos y colores. Archivado.
- **Registro de transacciones** - Ingresos y gastos asociados a cuenta y categoria, con descripcion y fecha. CRUD completo.
- **Listado de movimientos** - Vista preview (ultimos N) y vista completa con filtros server-side (tipo, categoria, rango de fecha, busqueda por texto).
- **Agrupacion por fecha** - Transacciones agrupadas por dia con labels relativos (Hoy, Ayer, fechas anteriores).
- **Insights con IA** - Analisis mensual y de distribucion de cuentas generados por LLM, con cache invalidado por fingerprint de datos.
- **Perfil** - Avatar, nombre, email. Cambio de contrasena verificado por codigo.
- **Design system** - Atomic Design (atoms, molecules, organisms) con NativeWind. Paleta teal custom integrada en Tailwind.
- **Seguridad** - bcrypt, JWT dual, hashing de tokens, throttling, CORS, ownership checks en cada feature.

## Integracion con IA

OrbiFlow expone insights generados por LLM sobre datos reales del usuario, sin que el modelo "alucine" numeros: la agregacion se hace en codigo y la IA solo narra.

### Providers intercambiables

La capa IA esta abstraida detras de la interface `LLMProvider`. Hoy hay dos implementaciones:
- **AnthropicProvider** (`claude-haiku-4-5`) usando el SDK oficial de Anthropic.
- **OpenAIProvider** (`gpt-4o-mini`) usando el SDK oficial de OpenAI con Chat Completions.

El switch entre providers es manual en `ai.module.ts` (un comentario), lo que permite ir y venir entre modelos sin tocar logica de negocio. Ambos usan tool calling forzado (`tool_choice`) para garantizar salida JSON estructurada.

### Insights actuales

**Resumen mensual** (`GET /insights/monthly`) - Insight sobre el estado financiero del mes actual. El backend agrega ingresos/gastos MTD, proyeccion lineal a fin de mes, comparacion con mes anterior, top categorias, deltas relevantes vs mes anterior y patron dia de semana vs fin de semana. El LLM elige uno de tres angulos:
1. Forecast del cierre del mes.
2. Categoria con mayor variacion vs mes anterior.
3. Habito de gasto (semana vs fin de semana).

**Distribucion de cuentas** (`GET /insights/accounts`) - Insight sobre como esta repartido el patrimonio. El backend agrega patrimonio total, estimacion del mes anterior, balance por cuenta, porcentaje de concentracion, dias desde la ultima transaccion y estado activo/inactivo. El LLM elige uno de tres angulos:
1. Concentracion en una sola cuenta.
2. Balance entre cuentas activas.
3. Tendencia patrimonial vs mes anterior.

### Cache por fingerprint

El cache de insights no usa TTL temporal: usa una huella SHA256 sobre los datos agregados que alimentan al modelo. Si los datos no cambian, el insight se sirve desde DB sin volver a llamar al LLM. Si agregas, editas o eliminas una transaccion, el fingerprint cambia y el insight se regenera automaticamente. Esto garantiza freshness real sin gastar tokens cuando no hace falta.

## Arquitectura

```
orbiflow-tracker/
├── backend/                          # API REST NestJS
│   └── src/
│       ├── config/                   # Configuracion (TypeORM, Mail)
│       ├── common/                   # Guards, decoradores, filtros, JWT, exceptions
│       ├── database/
│       │   ├── entities/             # Entidades TypeORM
│       │   └── repositories/         # Repositorios
│       └── modules/
│           ├── auth/                 # Autenticacion, registro, verificacion, reset
│           ├── users/                # Perfil, avatar, cambio de contrasena
│           ├── accounts/             # Cuentas
│           ├── categories/           # Categorias
│           ├── transactions/         # Transacciones
│           └── ai/                   # Capa IA
│               ├── providers/        # LLMProvider, AnthropicProvider, OpenAIProvider
│               ├── services/         # InsightsService (agregacion + cache + prompts)
│               ├── controllers/      # InsightsController
│               └── dto/
│
└── orbiflow-mobile-nativewind/       # App movil React Native
    ├── app/
    │   ├── (auth)/                   # Auth flow
    │   ├── (tabs)/                   # Tabs: home, transactions, new, accounts, settings
    │   ├── transactions/             # Vista completa con filtros
    │   ├── accounts/                 # Creacion y detalle de cuentas
    │   └── settings/                 # Perfil y cambio de contrasena
    └── src/
        ├── core/
        │   ├── api/                  # ApiError, ResponseAPI
        │   ├── services/             # HttpService base + servicios feature
        │   ├── store/                # Zustand stores (auth)
        │   ├── storage/              # SecureStore wrapper
        │   ├── dto/                  # Interfaces request/response
        │   ├── schemas/              # Zod schemas
        │   ├── constants/            # ENDPOINTS, query keys
        │   └── enums/
        └── ui/
            ├── components/           # Atomic Design: atoms/, molecules/, organisms/
            ├── features/             # Componentes por feature
            ├── hooks/                # Custom hooks (TanStack Query + mutaciones)
            └── theme/                # Paleta de colores y tokens
```

### Principios

- **Layered + Module-based** (backend) - Controller > Service > Repository > Entity. Cada feature es un modulo NestJS auto-contenido.
- **Clean Architecture** (mobile) - `core/` (logica/datos) separado de `ui/` (presentacion).
- **Atomic Design** (componentes) - atoms > molecules > organisms > templates.
- **Type safety** - TypeScript strict + class-validator (backend) + Zod (mobile).
- **Respuesta estandarizada** - Todo endpoint devuelve `ResponseAPI { responseType, title?, message, data? }`. Filtro global de excepciones convierte errores a este formato.
- **Ports & Adapters** (capa IA) - `LLMProvider` como puerto, providers concretos como adapters intercambiables.

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

La API queda disponible en `http://localhost:4800/api/v1`.

### Mobile

```bash
cd orbiflow-mobile-nativewind
npm install
npm run start:dev      # Inicia Expo en modo desarrollo
```

### Variables de entorno (backend)

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
| `ANTHROPIC_API_KEY` | API key de Anthropic (si se usa AnthropicProvider) |
| `OPENAI_API_KEY` | API key de OpenAI (si se usa OpenAIProvider) |

## API Endpoints

Prefijo global: `/api/v1`. Endpoints protegidos requieren `Authorization: Bearer <accessToken>`.

### Auth

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/auth/register` | Registro + envio de codigo de verificacion |
| POST | `/auth/login` | Login (requiere email verificado) |
| POST | `/auth/verify-email` | Verificar cuenta con codigo |
| POST | `/auth/resend-verification` | Reenviar codigo |
| POST | `/auth/refresh` | Refrescar access token |
| POST | `/auth/forgot-password` | Solicitar reset de contrasena |
| POST | `/auth/verify-reset-code` | Verificar codigo de reset |
| POST | `/auth/reset-password` | Restablecer contrasena |

### Users

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/users/me` | Perfil del usuario autenticado |
| PATCH | `/users/me` | Actualizar nombre/email |
| POST | `/users/me/avatar` | Subir avatar |
| DELETE | `/users/me/avatar` | Eliminar avatar |
| POST | `/users/me/change-password/request-code` | Solicitar codigo para cambio de contrasena |
| POST | `/users/me/change-password` | Cambiar contrasena con codigo |

### Accounts, Categories, Transactions

CRUD completo con autenticacion JWT y ownership checks. `transactions` soporta filtros por query params (`type`, `categoryId`, `dateFrom`, `dateTo`, `search`, `limit`).

### Insights (IA)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/insights/monthly` | Insight del mes actual (forecast, categorias, habitos) |
| GET | `/insights/accounts` | Insight sobre distribucion de patrimonio |

## Licencia

Proyecto privado.
