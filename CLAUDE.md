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

App de finanzas personales (tracker de ingresos/gastos). Monorepo con backend y mobile.

## Stack

| Capa | Tecnologia |
|------|-----------|
| **Backend** | NestJS 11, TypeORM 0.3, PostgreSQL, Passport JWT, Nodemailer + Handlebars |
| **Mobile** | React Native 0.81, Expo 54, Expo Router 6, NativeWind 4 (Tailwind), React Hook Form + Zod, Axios |
| **Lenguaje** | TypeScript strict en ambos |

## Estructura del monorepo

```
orbiflow-tracker/
├── backend/                    # API REST NestJS
│   └── src/
│       ├── config/             # ORM, mail config
│       ├── database/           # entities/, repositories/
│       ├── modules/            # Feature modules (auth, users, accounts, categories, transactions)
│       │   └── [feature]/
│       │       ├── feature.controller.ts
│       │       ├── feature.service.ts
│       │       ├── feature.module.ts
│       │       ├── dto/
│       │       ├── models/
│       │       └── services/   # Sub-servicios si aplica
│       └── common/             # JWT guards/strategies, decorators, enums, exceptions, filters, providers (mail), utils
│
├── orbiflow-mobile-nativewind/ # Mobile app Expo
│   ├── app/                    # File-based routing (Expo Router)
│   │   ├── (auth)/             # Stack: login, register, forgot-password, verify-email, reset-password
│   │   ├── (tabs)/             # Tabs: home, transactions, new, accounts, settings
│   │   └── _layout.tsx
│   ├── src/
│   │   ├── core/               # Logica de negocio y servicios
│   │   │   ├── api/            # ApiError, ResponseAPI interface
│   │   │   ├── config/         # Environment config
│   │   │   ├── constants/      # ENDPOINTS, STORAGE_KEYS
│   │   │   ├── dto/            # Interfaces de request/response
│   │   │   ├── enums/          # CategoryType, ResponseType
│   │   │   ├── schemas/        # Zod schemas (validacion)
│   │   │   └── services/       # HttpService (base), AuthService, StorageService
│   │   └── ui/
│   │       ├── components/     # Atomic Design: atoms/, molecules/, organisms/, templates/
│   │       ├── features/       # Componentes por feature: auth/, accounts/, categories/, transactions/
│   │       ├── hooks/          # Custom hooks
│   │       └── theme/          # Colores, design tokens
│   └── environments/           # Configs por entorno (dev, testing, prod)
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
- **Clean Architecture** (en transicion): core/ (negocio) + ui/ (presentacion)
- Atomic Design para componentes: atoms > molecules > organisms > templates
- Features separadas de design system
- Servicios como singletons (HttpService base, AuthService extiende)
- Axios interceptors para JWT injection y manejo de 401
- expo-secure-store para tokens (Keychain/Keystore nativo)
- Path alias: `@/*` apunta a raiz del proyecto mobile

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
- Colores custom en `src/ui/theme/colors.ts` integrados en tailwind.config.js
- Paleta principal: teal (primary-1 a primary-9)
- No usar StyleSheet.create ni styled-components

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

### Mobile (`cd orbiflow-mobile-nativewind`)
```bash
npm run start:dev          # Expo dev (APP_ENV=dev)
npm run android:dev        # Android dev
npm run ios:dev            # iOS dev
npm run web:dev            # Web dev
npm run lint               # Expo lint
```

## Principios de desarrollo

- Escalabilidad: estructura modular que permite agregar features sin tocar existentes
- Clean Code: separacion de responsabilidades, DTOs para validacion, servicios desacoplados
- Type safety: TypeScript strict, validacion en ambos extremos (class-validator backend, Zod mobile)
- Seguridad: bcrypt, JWT dual, hashing de tokens, throttling, CORS, ownership checks
- DRY: HttpService base abstracto, componentes atomicos reutilizables, barrel exports (index.ts)

## Estado actual del proyecto

- Auth completo: login, register, email verification, forgot/reset password
- CRUD: accounts, categories, transactions funcionando en backend
- Mobile: auth flow conectado, tabs skeleton, design system en construccion
- Pendiente: token refresh completo en mobile, route guards, features CRUD en mobile
- Sin CI/CD ni Docker configurado
- Sin tests escritos (infraestructura Jest lista en backend)
