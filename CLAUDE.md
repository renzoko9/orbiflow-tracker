## Approach
- Read existing files before writing. Don't re-read unless changed.
- Thorough in reasoning, concise in output.
- No sycophantic openers or closing fluff.
- No emojis or em-dashes.
- Do not guess APIs, versions, flags, package names, or commit SHAs. Verify by reading code or docs before asserting.

## Code Rules
- Simplest working solution. No over-engineering.
- No abstractions for single-use operations.
- No speculative features.
- Read the file before modifying it. Never edit blind.
- No error handling for scenarios that cannot happen.
- Three similar lines is better than a premature abstraction.

## Workflow
- Write the complete solution in one pass.
- Run tests or verify output before declaring done.
- Do not refactor or improve passing code.
- If cause of a bug is unclear: say so. Do not guess.

---

# OrbiFlow Tracker

App de finanzas personales (tracker de ingresos/gastos) con asistente IA (Otto). Monorepo con backend, app movil y landing.

## Stack

| Capa | Tecnologia |
|------|-----------|
| **Backend** | NestJS 11, TypeORM 0.3, PostgreSQL, Passport JWT, Nodemailer + Handlebars, @nestjs/throttler. IA via LLM provider (OpenAI activo) |
| **Mobile** | React Native 0.81, Expo 54, Expo Router 6, NativeWind 4 (Tailwind), Zustand (estado), TanStack Query (data fetching), React Hook Form + Zod, Axios, react-native-reanimated, @gorhom/bottom-sheet |
| **Landing** | `inout-landing/` (sitio web) |
| **Lenguaje** | TypeScript strict en todos |

## Estructura del monorepo

```
orbiflow-tracker/
├── backend/                    # API REST NestJS
│   └── src/
│       ├── config/             # ORM, mail config
│       ├── database/           # entities/, repositories/
│       ├── modules/            # auth, users, accounts, categories, transactions, ai, chat
│       │   └── [feature]/
│       │       ├── feature.controller.ts   # (controllers/ si hay varios)
│       │       ├── feature.service.ts
│       │       ├── feature.module.ts
│       │       ├── dto/
│       │       ├── models/
│       │       └── services/   # Sub-servicios si aplica (ai: providers/ para LLM)
│       └── common/             # JWT guards/strategies, decorators, enums, exceptions, filters, providers (mail), utils
│
├── inout-mobile/               # App movil Expo (ACTIVA)
│   ├── app/                    # File-based routing (Expo Router)
│   │   ├── (auth)/             # login, register, forgot-password, verify-email, reset-password
│   │   ├── (tabs)/             # home, transactions, new, chatbot, insights
│   │   ├── chat.tsx, accounts/, categories/, transactions/, profile/, settings.tsx
│   │   ├── index.tsx           # Splash: rehidrata sesion y redirige (route guard)
│   │   └── _layout.tsx
│   └── src/
│       ├── config/             # env, APP_CONSTANTS
│       ├── providers/          # AppProviders (composicion de providers globales)
│       ├── features/           # Feature-based: accounts, auth, categories, chat, home, insights, profile, transactions
│       │   └── [feature]/      # api/ (queries + keys), components/, model/ (dto + zod), screens/, index.ts
│       └── shared/             # api/ (http-client + refresh-mutex), auth/ (zustand store), i18n/, storage/ (secure-store), theme/, ui/, utils/
│
├── inout-landing/              # Landing web
└── orbiflow-mobile-nativewind/ # (legacy, reemplazada por inout-mobile)
```

## Arquitectura

### Backend
- **Layered + Module-based**: Controller > Service > Repository > Entity
- Cada feature es un modulo NestJS auto-contenido
- Respuesta estandarizada: `ResponseAPI { responseType, title?, message, data? }`
- Auth: JWT dual (access 15m + refresh 7d), bcrypt, email verification con codigo 6 digitos
- Global exception filter convierte todo a ResponseAPI
- Rate limiting con @nestjs/throttler
- Path aliases: `@/*`, `@Entities`, `@Repositories`

### Mobile
- **Feature-based**: cada feature en `src/features/[feature]` con `api/` (TanStack Query: queries + keys), `components/`, `model/` (DTOs + Zod), `screens/`, `index.ts` (barrel)
- `src/shared/` para lo transversal: `ui/` (design system), `theme/`, `api/` (http-client), `auth/` (store), `i18n/`, `storage/`, `utils/`
- Estado global con Zustand (`shared/auth/auth.store.ts`); data fetching y cache con TanStack Query
- `shared/api/http-client.ts`: axios con interceptors. Request inyecta JWT (salvo rutas publicas). Response maneja 401 con refresh automatico via `refresh-mutex.ts` (encola requests concurrentes, un solo refresh, retry); ante fallo limpia tokens y dispara `onAuthFailure` -> reset del store
- Route guard: `app/index.tsx` y `app/(tabs)/_layout.tsx` redirigen segun `isAuthenticated` tras hidratacion del store
- expo-secure-store para tokens (Keychain/Keystore nativo)
- Path alias: `@/*` apunta a `src/`

## Convenciones

### Commits
Formato: `type(scope): mensaje en español`
- Types: `feat`, `refactor`, `fix`, `docs`
- Scopes: `mobile`, `backend`
- Ejemplo: `feat(backend): Agrega endpoint verify-reset-code`

### Codigo
- Nombres de archivos: kebab-case (`auth.service.ts`, `create-account.dto.ts`)
- Clases: PascalCase
- Metodos/variables: camelCase
- Constantes/Enums valores: UPPER_SNAKE_CASE
- DTOs backend: class-validator decorators
- DTOs mobile: Zod schemas + `z.infer<>` para tipos
- Imports absolutos con `@/` en ambos proyectos

### API REST
- Prefijo global: `/api/v1`
- CRUD estandar: POST create, GET list, GET :id, PATCH :id, DELETE :id
- Auth: Bearer token en header Authorization
- Guards: `@UseGuards(JwtAccessGuard)` en endpoints protegidos
- Ownership check en services (user solo accede a sus propios recursos)

### Styling (Mobile)
- NativeWind (Tailwind classes en className)
- Tokens semanticos en `src/shared/theme` (`tailwind-tokens.js`, `palette.ts`, `tokens.ts`): surface, border, accent/accentSoft/accentStrong, brand, success, danger, textPrimary/Secondary/Tertiary/Disabled, etc. Hook `useThemeTokens()` para acceder a valores en JS
- Componentes shared de UI en `src/shared/ui` (barrel `index.ts`)
- No usar StyleSheet.create ni styled-components (salvo casos puntuales como absoluteFillObject)

## Comandos

### Backend (`cd backend`)
```bash
npm run start:dev          # Dev con watch
npm run build              # Compilar
npm run lint               # ESLint + fix
npm run format             # Prettier
npm run test               # Jest
npm run migration:generate # Generar migracion TypeORM
npm run migration:run      # Ejecutar migraciones
```

### Mobile (`cd inout-mobile`)
```bash
npm run start:dev          # Expo dev
npm run android:dev        # Android dev
npm run ios:dev            # iOS dev
npm run lint               # Expo lint
npm run typecheck          # tsc --noEmit
```

## Principios de desarrollo

- Escalabilidad: estructura modular que permite agregar features sin tocar existentes
- Clean Code: separacion de responsabilidades, DTOs para validacion, servicios desacoplados
- Type safety: TypeScript strict, validacion en ambos extremos (class-validator backend, Zod mobile)
- Seguridad: bcrypt, JWT dual, hashing de tokens, throttling, CORS, ownership checks
- DRY: HttpService base abstracto, componentes atomicos reutilizables, barrel exports (index.ts)

## Estado actual del proyecto

- Auth completo (backend y mobile): login, register, email verification, forgot/reset password, token refresh con mutex en interceptor, route guards post-logout
- CRUD funcionando en backend y mobile: accounts, categories, transactions
- IA: modulo `ai` con stats por periodo (year/month) y nota de cierre de mes generada por LLM (Otto), cacheada por fingerprint, solo para meses concluidos
- Chat: asistente Otto in-app (modulo `chat` backend + feature `chat` mobile)
- Insights: dashboard con selector de periodo, resumen, tendencia, desglose por categoria; auto-invalidacion al registrar/editar/borrar movimientos
- Sin CI/CD ni Docker configurado
- Sin tests escritos (infraestructura Jest lista en backend)
