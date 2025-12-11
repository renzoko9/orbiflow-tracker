# Orbiflow Tracker - Backend

Sistema de gestión financiera personal construido con NestJS y PostgreSQL.

## Tecnologías

- **Framework**: NestJS 11.x
- **Base de datos**: PostgreSQL con TypeORM 0.3.x
- **Autenticación**: JWT (Access & Refresh Tokens)
- **Validación**: class-validator, class-transformer
- **Seguridad**: bcrypt para hashing de contraseñas
- **Testing**: Jest
- **Linting**: ESLint con Prettier

## Estructura del Proyecto

```
backend/
├── src/
│   ├── common/                 # Utilidades compartidas
│   │   ├── decorators/         # Decoradores personalizados (@User)
│   │   ├── enum/               # Enumeraciones (CategoryType)
│   │   ├── interfaces/         # Interfaces comunes (ResponseAPI)
│   │   └── jwt/                # Guards de autenticación JWT
│   ├── config/                 # Configuración
│   │   └── orm.config.ts       # Configuración de TypeORM
│   ├── database/
│   │   └── entities/           # Entidades de base de datos
│   ├── modules/                # Módulos de la aplicación
│   │   ├── accounts/           # Gestión de cuentas
│   │   ├── auth/               # Autenticación y registro
│   │   ├── categories/         # Gestión de categorías
│   │   ├── transactions/       # Gestión de transacciones
│   │   └── users/              # Gestión de usuarios
│   ├── app.module.ts           # Módulo principal
│   └── main.ts                 # Punto de entrada
└── package.json
```

## Modelos de Base de Datos

### User
```typescript
{
  id: number
  name: string
  lastname: string
  email: string (único)
  password: string (hasheado)
  refreshToken: string | null
  createdAt: Date
}
```

### Account
```typescript
{
  id: number
  name: string
  balance: decimal(10,2)
  description: string | null
  user_id: number (FK)
  createdAt: Date
}
```

### Category
```typescript
{
  id: number
  name: string
  type: CategoryType (INCOME | EXPENSE)
  user_id: number | null (null = categoría global)
  createdAt: Date
}
```

### Transaction
```typescript
{
  id: number
  amount: decimal(10,2)
  description: string | null
  type: CategoryType (INCOME | EXPENSE)
  date: Date
  user_id: number (FK)
  category_id: number (FK)
  account_id: number (FK)
  createdAt: Date
}
```

## API Endpoints

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar nuevo usuario (crea cuenta inicial automáticamente)
- `POST /auth/refresh` - Refrescar tokens

### Cuentas (requiere autenticación)
- `POST /accounts` - Crear nueva cuenta
- `GET /accounts` - Listar todas las cuentas del usuario
- `GET /accounts/:id` - Obtener cuenta por ID
- `PATCH /accounts/:id` - Actualizar cuenta
- `DELETE /accounts/:id` - Eliminar cuenta

### Categorías (requiere autenticación)
- `POST /categories` - Crear nueva categoría
- `GET /categories` - Listar categorías del usuario
- `GET /categories/global` - Listar categorías globales
- `GET /categories/:id` - Obtener categoría por ID
- `PUT /categories/:id` - Actualizar categoría
- `DELETE /categories/:id` - Eliminar categoría

### Transacciones (requiere autenticación)
- `POST /transactions` - Crear nueva transacción
- `GET /transactions` - Listar todas las transacciones del usuario
- `GET /transactions/account/:accountId` - Listar transacciones por cuenta
- `GET /transactions/:id` - Obtener transacción por ID
- `PUT /transactions/:id` - Actualizar transacción
- `DELETE /transactions/:id` - Eliminar transacción

## Instalación

### Requisitos previos
- Node.js (v18 o superior)
- PostgreSQL
- npm o yarn

### Configuración

1. Instalar dependencias:
```bash
cd backend
npm install
```

2. Configurar variables de entorno:
Crear archivo `.env` en `backend/`:
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=tu_password
DATABASE_NAME=orbiflow_tracker
JWT_SECRET=tu_secret_token
```

3. Ejecutar migraciones:
```bash
npm run migration:run
```

## Scripts Disponibles

### Desarrollo
```bash
npm run start:dev      # Iniciar en modo desarrollo con hot reload
npm run start:debug    # Iniciar en modo debug
```

### Producción
```bash
npm run build          # Compilar para producción
npm run start:prod     # Iniciar en modo producción
```

### Testing
```bash
npm test               # Ejecutar tests unitarios
npm run test:watch     # Ejecutar tests en modo watch
npm run test:cov       # Ejecutar tests con cobertura
npm run test:e2e       # Ejecutar tests end-to-end
```

### Base de datos
```bash
npm run migration:generate   # Generar nueva migración
npm run migration:run        # Ejecutar migraciones pendientes
npm run migration:revert     # Revertir última migración
```

### Calidad de código
```bash
npm run lint           # Ejecutar ESLint
npm run format         # Formatear código con Prettier
```

## Autenticación

El sistema utiliza JWT con dos tipos de tokens:

- **Access Token**: Válido por corto tiempo, usado en cada petición
- **Refresh Token**: Válido por más tiempo, usado para renovar access tokens

### Uso
1. Registrarse con `POST /auth/register` (crea automáticamente una cuenta inicial)
2. Login con `POST /auth/login` para obtener tokens
3. Incluir access token en header: `Authorization: Bearer {token}`
4. Refrescar tokens con `POST /auth/refresh` cuando expiren

## Características

- Autenticación segura con JWT y refresh tokens
- Hashing de contraseñas con bcrypt
- Validación automática de DTOs con class-validator
- Creación automática de cuenta inicial al registrarse
- Categorías globales y por usuario
- Gestión completa de transacciones con actualización automática de balances
- Guards de autenticación en endpoints protegidos
- Relaciones CASCADE para integridad de datos
- Decorador personalizado `@User()` para acceder al usuario autenticado
