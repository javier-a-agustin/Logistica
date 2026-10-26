# Logistica.Frontend

Interfaz web del sistema de logística (recepción, despacho y entrega de encomiendas) para la API de `Logistica.Backend`.

Stack: Vite + React + TypeScript, Tailwind CSS v4, React Router, TanStack Query, react-hook-form + zod.

## Requisitos

- Node.js 20.19+ (probado con Node 24)
- .NET 10 SDK y la base MySQL del backend en funcionamiento (ver `data.sql` en la raíz del repo)

## Cómo levantarlo

Desde la raíz del repositorio, en dos terminales:

```bash
# 1. Backend en http://localhost:5280
dotnet run --project Logistica.Backend --launch-profile http

# 2. Frontend en http://localhost:5173
cd Logistica.Frontend
npm install   # solo la primera vez
npm run dev
```

Usuarios de prueba (de `data.sql`), todos con contraseña `Dev123!`:

| Usuario     | Rol           | Pantalla inicial |
| ----------- | ------------- | ---------------- |
| `recepcion` | Recepcionista | Recepción        |
| `despacho`  | Despachante   | Despacho         |
| `chofer1`   | Chofer        | Mis viajes       |
| `gerente`   | Gerente       | Paquetes         |

## Conexión con la API

El backend no tiene CORS configurado, así que el navegador nunca le habla directo: todas las llamadas van a `/api/...` y el
proxy de Vite las reenvía al backend quitando el prefijo (`/api/Auth/Login` → `http://localhost:5280/Auth/Login`).

Variables en `.env` (se pueden pisar con un `.env.local`, que no se versiona):

| Variable           | Valor por defecto       | Uso                                                       |
| ------------------ | ----------------------- | --------------------------------------------------------- |
| `VITE_API_URL`     | `/api`                  | Prefijo de las llamadas desde el navegador                |
| `API_PROXY_TARGET` | `http://localhost:5280` | Destino del proxy en desarrollo (`https://localhost:7265`) |

`npm run build` genera `dist/`. Para servirlo en producción hace falta un servidor que reenvíe `/api` al backend
(o habilitar CORS en el backend y apuntar `VITE_API_URL` a su URL).

## Scripts

- `npm run dev`: servidor de desarrollo
- `npm run build`: chequeo de tipos + build de producción
- `npm run lint`: oxlint
- `npm run preview`: sirve el build localmente

## Estructura

```
src/
  api/         client.ts (fetch tipado + ApiError) y un módulo por controller
  auth/        sesión en localStorage, AuthProvider, useAuth, ProtectedRoute
  components/  primitivas de UI (Button, Input, Select, Table, Modal, Badge, Card…) y layout
  features/    pantallas: recepcion, paquetes, clientes, viajes (despacho, hoja de ruta, mis viajes),
               vehiculos, choferes, usuarios, catalogos, seguimiento
  hooks/       hooks de TanStack Query por recurso
  lib/         constantes (roles, estados), formateadores, helpers de formularios, navegación por rol
  types/       espejo de los DTOs de Logistica.Abstracciones
```

Los permisos por pantalla están en `src/lib/navigation.ts` y reflejan los `[Authorize(Roles = ...)]` de los controllers.
