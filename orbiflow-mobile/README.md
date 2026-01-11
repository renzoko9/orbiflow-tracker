# OrbiFlow Mobile - Frontend

Aplicación móvil de OrbiFlow Tracker construida con React Native, Expo y Clean Architecture.

## Arquitectura

Este proyecto sigue los principios de **Clean Architecture** con una separación clara en tres capas:

### Capas de la Arquitectura

```
src/
├── domain/          # Capa de Dominio (lógica de negocio)
│   ├── entities/    # Modelos de dominio
│   ├── repositories/# Contratos (interfaces)
│   └── use-cases/   # Casos de uso
│
├── data/            # Capa de Datos (infraestructura)
│   ├── repositories/# Implementaciones de repositorios
│   ├── api/         # Cliente HTTP y DTOs
│   ├── mappers/     # Conversión DTO ↔ Entity
│   └── storage/     # Persistencia local
│
├── presentation/    # Capa de Presentación (UI)
│   ├── components/  # Componentes UI
│   ├── hooks/       # Custom hooks
│   ├── store/       # State management (Zustand)
│   └── theme/       # Design system
│
└── shared/          # Compartido entre capas
    ├── types/
    ├── utils/
    └── constants/
```

### Flujo de Datos

```
[UI Screen] → [Hook] → [Use Case] → [Repository Interface] → [Repository Impl] → [API Client] → [Backend]
```

## Stack Tecnológico

- **React Native** + **Expo** - Framework móvil
- **TypeScript** - Tipado estático
- **Zustand** - State management
- **Axios** - Cliente HTTP
- **Expo Router** - Navegación
- **React Hook Form** + **Zod** - Formularios y validación
- **Expo Secure Store** - Almacenamiento seguro de tokens

## Estructura del Proyecto

```
orbiflow-mobile/
├── app/                     # Expo Router (rutas)
│   ├── (auth)/             # Pantallas de autenticación
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── (tabs)/             # Pantallas principales
│       ├── index.tsx       # Dashboard
│       ├── accounts.tsx    # Cuentas
│       └── transactions.tsx# Transacciones
│
├── src/                    # Código fuente (Clean Architecture)
│   ├── domain/
│   ├── data/
│   ├── presentation/
│   └── shared/
│
├── .env                    # Variables de entorno
└── tsconfig.json          # Configuración TypeScript
```

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con la URL de tu API
```

3. Iniciar el proyecto:
```bash
# Desarrollo
npm start

# Android
npm run android

# iOS (requiere macOS)
npm run ios

# Web
npm run web
```

## Variables de Entorno

```env
EXPO_PUBLIC_API_URL=http://localhost:4800/api/v1
```

Para desarrollo local con el backend en tu máquina:
- **Android Emulator**: `http://10.0.2.2:4800/api/v1`
- **iOS Simulator**: `http://localhost:4800/api/v1`
- **Dispositivo Físico**: `http://TU_IP_LOCAL:4800/api/v1`

## Path Aliases

El proyecto usa path aliases configurados en `tsconfig.json`:

```typescript
import { Account } from '@domain/entities/Account';
import { apiClient } from '@data/api/client';
import { Button } from '@presentation/components/ui';
import { formatCurrency } from '@shared/utils/formatters';
```

## Principios SOLID Aplicados

- **Single Responsibility**: Cada clase tiene una única responsabilidad
- **Open/Closed**: Abierto a extensión, cerrado a modificación
- **Liskov Substitution**: Las implementaciones pueden intercambiarse
- **Interface Segregation**: Interfaces específicas y enfocadas
- **Dependency Inversion**: Dependencias apuntan a abstracciones

## Ventajas de esta Arquitectura

✅ **Testeable**: Lógica de negocio independiente de la UI
✅ **Mantenible**: Código organizado y predecible
✅ **Escalable**: Fácil agregar nuevas features
✅ **Type-safe**: TypeScript en todas las capas
✅ **Desacoplado**: Cambiar implementaciones sin afectar el dominio

## Ejemplos de Uso

### Crear una nueva feature

1. **Domain Layer**: Crear entity, repository interface y use cases
2. **Data Layer**: Implementar repository, crear DTOs y mappers
3. **Presentation Layer**: Crear hook, componentes y pantallas

### Usar un hook en una pantalla

```typescript
import { useAccounts } from '@presentation/hooks/useAccounts';

export default function AccountsScreen() {
  const { accounts, loading, createAccount } = useAccounts();

  // Usar los datos y funciones...
}
```

## Scripts Disponibles

```bash
npm start          # Iniciar Expo Dev Server
npm run android    # Ejecutar en Android
npm run ios        # Ejecutar en iOS
npm run web        # Ejecutar en Web
npm test           # Ejecutar tests
npm run lint       # Linter
```

## Documentación Adicional

- [Guía de Clean Architecture](../CLEAN_ARCHITECTURE_GUIDE.md)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)

---

**Versión**: 1.0.0
**Última actualización**: Diciembre 2024
