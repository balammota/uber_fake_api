# Mapistry + Supabase

Los datos de Mapistry (sitios, logs, entradas, request logs) se guardan en **Supabase**, no en memoria del servidor.

## Configuración (una vez)

### 1. Variables de entorno

Copia `.env.example` a `.env.local` (ya incluye tu proyecto):

```env
NEXT_PUBLIC_SUPABASE_URL=https://ytyoclfcfrxbbftovnpv.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Opcional (recomendado en producción): `SUPABASE_SERVICE_ROLE_KEY` desde  
Supabase → **Project Settings** → **API** → `service_role` (solo servidor).

### 2. Crear tablas

1. Abre [Supabase Dashboard](https://supabase.com/dashboard) → tu proyecto.
2. **SQL Editor** → **New query**.
3. Pega y ejecuta el contenido de [`supabase/schema.sql`](supabase/schema.sql).

**Si el dashboard devuelve 500 / `row-level security policy`:** ejecuta también [`supabase/fix-rls.sql`](supabase/fix-rls.sql) en el mismo SQL Editor.

### 3. Poblar datos iniciales

Con el servidor en marcha (`npm run dev`), la primera llamada a la API hace **seed automático** si las tablas están vacías:

```bash
curl -H "x-api-key: test-api-key-mapistry-123" http://localhost:3000/api/mapistry/sites
```

Verifica con:

```bash
npm run db:check
```

## Qué se guarda en Supabase

| Tabla | Contenido |
|-------|-----------|
| `mapistry_sites` | Plantas SRM (10 sitios) |
| `mapistry_logs` | Logs de cumplimiento por sitio |
| `mapistry_entries` | Entradas ambientales (incluye las del SRM Generator) |
| `mapistry_request_logs` | Historial de peticiones API |
| `srm_production` | Datos de producción crudos de plantas SRM (antes de subir a Mapistry) |

El **rate limit** (100 req/min) sigue en memoria del servidor (efímero).

### Tabla `srm_production`

Si ya ejecutaste `schema.sql` antes, vuelve a ejecutar solo el bloque `srm_production` del archivo actualizado, o corre el SQL nuevo completo en el editor.

## Vercel

Añade las mismas variables en **Project Settings → Environment Variables** y ejecuta `schema.sql` en el proyecto Supabase de producción.
