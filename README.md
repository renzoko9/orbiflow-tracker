# INOUT

App de finanzas personales con asistente de IA. Registra ingresos y gastos, visualiza balances por cuenta y patrimonio total, recibe insights accionables generados por LLM sobre datos reales, y conversa con **Otto**, el asistente integrado que entiende texto e imagenes (fotos de recibos) y registra movimientos por ti.

> El repositorio se llama `orbiflow-tracker` por razones historicas; la marca del producto es **INOUT**.

## Tech Stack

| Capa | Tecnologia |
|------|-----------|
| **Backend** | NestJS 11, TypeORM 0.3, PostgreSQL, Passport JWT, Nodemailer + Handlebars, @nestjs/throttler, @nestjs/schedule |
| **Mobile** | React Native 0.81, Expo 54, Expo Router 6, NativeWind 4, Zustand, TanStack Query, React Hook Form + Zod, Axios, react-native-reanimated, @gorhom/bottom-sheet |
| **Landing** | `inout-landing/` (sitio web) |
| **IA** | Capa LLM intercambiable. Providers integrados: OpenAI (activo) y Anthropic |
| **Object storage** | Cloudflare R2 (S3-compatible) via @aws-sdk/client-s3, bucket privado + URLs prefirmadas |
| **Lenguaje** | TypeScript strict en todos los proyectos |

## Estructura del monorepo

```
orbiflow-tracker/
├── backend/                    # API REST NestJS
│   └── src/
│       ├── config/             # ORM, mail, data-source (migraciones)
│       ├── common/             # JWT guards/strategies, decoradores, enums,
│       │   │                   # exceptions, filtros, utils
│       │   └── providers/storage/   # StorageService (Cloudflare R2)
│       ├── database/
│       │   ├── entities/       # Entidades TypeORM
│       │   ├── repositories/   # Repositorios
│       │   └── migrations/     # Migraciones TypeORM
│       ├── scripts/            # migrate-uploads-to-r2, prune-chat
│       └── modules/
│           ├── auth/           # Registro, login, verificacion, reset
│           ├── users/          # Perfil, avatar, cambio de contrasena
│           ├── accounts/       # Cuentas
│           ├── categories/     # Categorias
│           ├── transactions/   # Transacciones
│           ├── ai/             # Insights por LLM
│           │   ├── providers/  # LLMProvider, OpenAIProvider, AnthropicProvider
│           │   ├── services/   # InsightsService, InsightStatsService
│           │   └── controllers/
│           └── chat/           # Asistente Otto
│               ├── services/   # ChatToolsService, ChatRetentionService
│               └── models/
│
├── inout-mobile/               # App movil Expo (ACTIVA)
│   ├── app/                    # File-based routing (Expo Router)
│   │   ├── (auth)/             # login, register, forgot/reset password, verify-email
│   │   ├── (tabs)/             # home, transactions, new, chatbot, insights
│   │   ├── accounts/, categories/, transactions/, profile/
│   │   ├── chat.tsx, settings.tsx, currency.tsx, change-password.tsx
│   │   └── index.tsx           # Splash: rehidrata sesion y redirige (route guard)
│   └── src/
│       ├── config/             # env, APP_CONSTANTS
│       ├── providers/          # AppProviders
│       ├── features/           # accounts, auth, categories, chat, home,
│       │                       # insights, profile, transactions
│       │                       #   cada una: api/, components/, model/, screens/, index.ts
│       └── shared/             # api/ (http-client + refresh-mutex), auth/ (zustand),
│                               # i18n/, storage/, theme/, ui/, utils/
│
└── inout-landing/              # Landing web
```

> La app movil legacy `orbiflow-mobile-nativewind` fue eliminada. La app viva es `inout-mobile` (estructura feature-based).

## Funcionalidades

- **Autenticacion completa** - Login, registro, verificacion por email (codigo 6 digitos), recuperacion y cambio de contrasena con verificacion. JWT dual (access 15min + refresh 7d), refresh automatico con mutex en el interceptor del cliente.
- **Cuentas** - CRUD con icono y color. Archivado/restauracion. Balance por cuenta y patrimonio total.
- **Categorias** - Globales y por usuario, tipo ingreso/gasto, iconos y colores.
- **Transacciones** - Ingresos y gastos asociados a cuenta y categoria, con descripcion, fecha y fotos. Filtros server-side (tipo, categoria, rango de fechas, busqueda). Agrupacion por dia con labels relativos.
- **Insights con IA** - Estadisticas por periodo, resumen mensual y distribucion de patrimonio narrados por LLM, con cache invalidado por fingerprint de datos.
- **Chat con Otto** - Asistente conversacional in-app: entiende texto e imagenes (fotos de recibos), propone movimientos y los registra tras confirmacion del usuario.
- **Perfil** - Avatar, nombre, email. Cambio de contrasena verificado por codigo.
- **Seguridad** - bcrypt, JWT dual, hashing de tokens, throttling, CORS, ownership checks en cada feature.

## Integracion con IA

INOUT expone insights generados por LLM sobre datos reales del usuario sin que el modelo "alucine" numeros: la agregacion se hace en codigo y la IA solo narra.

### Providers intercambiables

La capa IA esta abstraida detras de la interface `LLMProvider`. Hay dos implementaciones:
- **OpenAIProvider** (activo) usando el SDK oficial de OpenAI.
- **AnthropicProvider** usando el SDK oficial de Anthropic.

El switch entre providers es manual en `ai.module.ts` (`useExisting` del token `LLM_PROVIDER`), lo que permite cambiar de modelo sin tocar logica de negocio. Ambos usan tool calling forzado para garantizar salida JSON estructurada.

### Insights

- **Stats** (`GET /insights/stats`) - Estadisticas agregadas por periodo (year/month).
- **Resumen mensual** (`GET /insights/monthly`) - Insight del mes actual; el backend agrega ingresos/gastos MTD, proyeccion a fin de mes, comparacion con el mes anterior, top categorias y patron semana vs fin de semana, y el LLM elige el angulo mas relevante.
- **Distribucion de cuentas** (`GET /insights/accounts`) - Insight sobre el reparto del patrimonio (concentracion, balance entre cuentas, tendencia patrimonial).

### Cache por fingerprint

El cache de insights no usa TTL temporal: usa una huella SHA256 sobre los datos agregados que alimentan al modelo. Si los datos no cambian, el insight se sirve desde DB sin volver a llamar al LLM. Si agregas, editas o eliminas una transaccion, el fingerprint cambia y el insight se regenera. Freshness real sin gastar tokens de mas.

## Chat con Otto

El modulo `chat` es un engine agnostico de canal: el `ChatService` orquesta la conversacion y devuelve entidades de dominio, mientras la presentacion (presigning de URLs de imagenes) vive en el controller. Esto desacopla el nucleo del transporte.

- **Entrada multimodal** - El usuario envia texto y/o una imagen (JPG, PNG, WEBP, max 5MB). Las imagenes se suben a R2 y se sirven via URL prefirmada.
- **Propuestas confirmables** - Otto puede proponer registrar un movimiento; el usuario lo confirma o cancela. Al confirmar se crea la transaccion (reutilizando la imagen del chat si aplica).
- **Retencion automatica** - Un cron diario (`@nestjs/schedule`) purga mensajes mas viejos que `CHAT_RETENTION_DAYS` (default 90) y borra sus imagenes en R2, salvo las que aun esten referenciadas por una transaccion. Tambien ejecutable a mano con `npm run prune:chat`.

## Object storage (Cloudflare R2)

Avatares e imagenes de transacciones y chat se almacenan en un bucket **privado** de Cloudflare R2 (S3-compatible). En la base de datos se guardan las **keys** de los objetos, no URLs; el backend genera URLs **prefirmadas** de lectura bajo demanda, solo para recursos del usuario que las solicita. No hay almacenamiento local de archivos.

Migracion de archivos locales preexistentes a R2: `npm run migrate:uploads` (idempotente).

## Arquitectura

### Principios

- **Layered + Module-based** (backend) - Controller > Service > Repository > Entity. Cada feature es un modulo NestJS auto-contenido.
- **Feature-based** (mobile) - cada feature en `src/features/[feature]` con `api/`, `components/`, `model/`, `screens/`, `index.ts`; lo transversal en `src/shared/`.
- **Type safety** - TypeScript strict + class-validator (backend) + Zod (mobile).
- **Respuesta estandarizada** - Todo endpoint devuelve `ResponseAPI { responseType, title?, message, data? }`. Filtro global de excepciones convierte errores a este formato.
- **Ports & Adapters** (capa IA) - `LLMProvider` como puerto, providers concretos como adapters intercambiables.

## Setup

### Requisitos

- Node.js 22+
- PostgreSQL
- Cuenta de Cloudflare R2 (o bucket S3-compatible)
- Expo CLI (para mobile)

### Backend

```bash
cd backend
npm install
cp .env.example .env     # Configurar variables de entorno
npm run migration:run    # Ejecutar migraciones
npm run start:dev
```

La API queda disponible en `http://localhost:4800/api/v1`.

### Mobile

```bash
cd inout-mobile
npm install
npm run start:dev        # Inicia Expo en modo desarrollo
```

### Variables de entorno (backend)

| Variable | Descripcion |
|----------|-------------|
| `PORT` | Puerto del servidor |
| `CONTEXT` | Prefijo de rutas (ej: `/api/v1`) |
| `CORS_ORIGIN` | Origen permitido para CORS |
| `DATABASE_*` | Conexion a PostgreSQL |
| `JWT_SECRET` | Secreto para firmar tokens |
| `EMAIL_*` | Configuracion SMTP (host, port, user, password, from) |
| `TOKEN_EXPIRY_HOURS` | Vigencia de tokens de verificacion/reset |
| `OPENAI_API_KEY` | API key de OpenAI (provider activo) |
| `ANTHROPIC_API_KEY` | API key de Anthropic (si se usa AnthropicProvider) |
| `R2_ENDPOINT` | Endpoint del bucket R2 (`https://<account_id>.r2.cloudflarestorage.com`) |
| `R2_ACCESS_KEY_ID` | Access Key ID del token R2 |
| `R2_SECRET_ACCESS_KEY` | Secret Access Key del token R2 |
| `R2_BUCKET` | Nombre del bucket |
| `CHAT_RETENTION_DAYS` | Dias tras los cuales se purgan mensajes de chat viejos (default 90) |

### Scripts utiles (backend)

```bash
npm run start:dev          # Dev con watch
npm run build              # Compilar
npm run migration:generate # Generar migracion TypeORM
npm run migration:run      # Ejecutar migraciones
npm run migrate:uploads    # Migrar archivos locales preexistentes a R2 (idempotente)
npm run prune:chat         # Purgar manualmente chat viejo y sus imagenes en R2
npm run lint               # ESLint + fix
npm run test               # Jest
```

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
| POST | `/users/me/avatar` | Subir avatar (a R2) |
| DELETE | `/users/me/avatar` | Eliminar avatar |
| POST | `/users/me/change-password/request-code` | Solicitar codigo para cambio de contrasena |
| POST | `/users/me/change-password` | Cambiar contrasena con codigo |

### Accounts, Categories, Transactions

CRUD completo con autenticacion JWT y ownership checks. `transactions` soporta filtros por query params (`type`, `categoryId`, `dateFrom`, `dateTo`, `search`, `limit`) y fotos asociadas (almacenadas en R2).

### Insights (IA)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/insights/stats` | Estadisticas agregadas por periodo (year/month) |
| GET | `/insights/monthly` | Insight del mes actual (forecast, categorias, habitos) |
| GET | `/insights/accounts` | Insight sobre distribucion de patrimonio |

### Chat (Otto)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/chat/conversation` | Mensajes de la conversacion (paginado con `before`/`limit`) |
| DELETE | `/chat/conversation` | Borrar la conversacion del usuario |
| POST | `/chat/messages` | Enviar mensaje (texto y/o imagen) |
| POST | `/chat/messages/:id/confirm` | Confirmar una propuesta de movimiento |
| POST | `/chat/messages/:id/cancel` | Cancelar una propuesta de movimiento |

## Estado del proyecto

- Auth, CRUD (accounts/categories/transactions), Insights y Chat (Otto) completos en backend y mobile.
- Object storage en Cloudflare R2 con URLs prefirmadas; sin almacenamiento local.
- Retencion automatica de chat via cron diario.
- Sin CI/CD ni Docker configurado. Infraestructura de tests (Jest) lista en backend, sin tests escritos aun.

## Licencia

Proyecto privado.
</content>
</invoke>
