# OrbiFlow Tracker

App de finanzas personales con inteligencia artificial. Registra ingresos y gastos, visualiza balances por cuenta, y recibe insights accionables impulsados por IA para tomar mejores decisiones financieras.

## El problema

Las apps de finanzas personales te dicen cuanto gastaste, pero no te dicen que hacer al respecto. Los datos existen pero no generan accion.

## La solucion

OrbiFlow no solo registra movimientos. Convierte datos financieros crudos en contexto que la IA interpreta para devolver recomendaciones en lenguaje natural, sin dashboards complejos.

## Tech Stack

| Capa | Tecnologia |
|------|-----------|
| **Backend** | NestJS 11, TypeORM 0.3, PostgreSQL, Passport JWT, Nodemailer + Handlebars |
| **Mobile** | React Native 0.81, Expo 54, Expo Router 6, NativeWind 4, React Hook Form + Zod, Axios |
| **IA** | Claude API (en desarrollo) |
| **Lenguaje** | TypeScript strict en ambos proyectos |

## Funcionalidades

### Implementadas
- **Autenticacion completa** - Login, registro, verificacion por email (codigo 6 digitos), recuperacion de contrasena, JWT dual (access 15min + refresh 7d)
- **Gestion de cuentas** - CRUD con icono y color personalizables, balance por cuenta y balance general
- **Gestion de categorias** - Globales y por usuario, tipo ingreso/gasto, con iconos y colores
- **Registro de transacciones** - Ingresos y gastos asociados a cuenta y categoria, con descripcion y fecha
- **Listado de movimientos** - Vista preview (ultimos 10) y vista completa con filtros server-side (tipo, categoria, rango de fecha, busqueda por texto)
- **Agrupacion por fecha** - Transacciones agrupadas por dia con labels relativos (Hoy, Ayer, fechas anteriores)
- **Design system** - Atomic Design (atoms, molecules, organisms), componentes reutilizables con NativeWind
- **Seguridad** - bcrypt, JWT dual, hashing de tokens, throttling, CORS, ownership checks

### Pendientes
- Reportes y graficos de movimientos
- Notificaciones push
- Exportacion de datos
- Presupuestos por categoria

## Integracion con IA

La capa de inteligencia artificial es el diferenciador principal de OrbiFlow. Se integra Claude API para transformar el historial financiero en insights accionables:

### Analisis de gastos
Deteccion de patrones y anomalias en tiempo real.
> "Gastaste 40% mas en Alimentacion esta semana vs tu promedio mensual"

### Predicciones financieras
Proyecciones basadas en tendencias de gasto.
> "A este ritmo, tu cuenta principal llegara a S/0 en 12 dias"

### Recomendaciones personalizadas
Sugerencias basadas en el comportamiento real del usuario.
> "Podrias ahorrar S/200/mes reduciendo entretenimiento al promedio de los ultimos 3 meses"

### Categorizacion automatica
Al crear una transaccion, la IA sugiere la categoria mas probable basada en la descripcion ingresada.

### Resumenes inteligentes
Insights periodicos en lenguaje natural directamente en el dashboard.
> "Este mes ahorraste S/500 mas que el anterior. Tu mayor gasto fue Transporte"

### Alertas proactivas
Notificaciones preventivas basadas en comportamiento atipico.
> "Llevas 3 gastos grandes hoy. Quieres revisar tu presupuesto?"

### Implementacion tecnica (roadmap)
- Modulo NestJS dedicado para la capa IA (`modules/ai/`)
- Endpoint `POST /ai/insights` que recibe contexto financiero y retorna analisis
- Procesamiento del historial de transacciones como contexto para Claude
- Seccion "Asistente" en mobile con insights dinamicos y conversacionales

## Arquitectura

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
    │   ├── (auth)/                   # Auth flow
    │   ├── (tabs)/                   # Tabs: home, transactions, new, accounts, settings
    │   ├── transactions/             # Vista completa con filtros
    │   └── accounts/                 # Creacion de cuentas
    └── src/
        ├── core/                     # DTOs, schemas, services, constantes, enums
        └── ui/
            ├── components/           # Atomic Design: atoms/, molecules/, organisms/
            ├── features/             # Componentes por feature: accounts/, transactions/
            ├── hooks/                # Custom hooks
            └── theme/                # Colores, design tokens
```

### Principios
- **Layered + Module-based** (backend) - Controller > Service > Repository > Entity
- **Clean Architecture** (mobile) - core/ (negocio) + ui/ (presentacion)
- **Atomic Design** (componentes) - atoms > molecules > organisms > templates
- **Type safety** - TypeScript strict + class-validator (backend) + Zod (mobile)

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
| POST | `/auth/resend-verification` | Reenviar codigo |
| POST | `/auth/refresh` | Refrescar access token |
| POST | `/auth/forgot-password` | Solicitar reset de contrasena |
| POST | `/auth/verify-reset-code` | Verificar codigo de reset |
| POST | `/auth/reset-password` | Restablecer contrasena |

### Accounts, Categories, Transactions
CRUD completo con autenticacion JWT. Transactions soporta filtros por query params (`type`, `categoryId`, `dateFrom`, `dateTo`, `search`, `limit`).

## Licencia

Proyecto privado.
