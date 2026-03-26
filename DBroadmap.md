# 🗄️ DB Roadmap — Zen I Ching

> **Stack:** PostgreSQL via Supabase · SQLAlchemy + Alembic · FastAPI · Supabase Auth (Google / Apple / Microsoft)

---

## Diseño del Schema (Referencia)

### Tablas principales

| Tabla | Descripción |
|---|---|
| `user_profiles` | Perfil extendido del usuario (el auth lo gestiona Supabase) |
| `oracle_sessions` | Cada consulta realizada por el usuario |
| `iching_results` | Resultado de I Ching: hexagrama + líneas mutantes + hexagrama resultante |
| `tarot_results` | Las 3 cartas de la tirada (pasado/presente/futuro) con posición y reversión |
| `rune_results` | Las 3 runas de la tirada |
| `ai_interpretations` | Texto completo de la IA + temas clave extraídos |
| `chat_messages` | Historial de chat post-lectura, persistido |
| `user_notes` | Notas personales del usuario sobre cada sesión |
| `symbolic_patterns` | Contador de apariciones de cada símbolo por usuario |
| `user_gamification` | XP, nivel, racha, créditos |
| `badges` | Catálogo de insignias disponibles |
| `user_badges` | Insignias desbloqueadas por usuario |
| `credit_transactions` | Log de todo movimiento de créditos |
| `subscription_plans` | Catálogo de planes disponibles |
| `user_subscriptions` | Suscripción activa del usuario |

### I Ching — Detalle de `iching_results`

```sql
CREATE TABLE iching_results (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id               UUID REFERENCES oracle_sessions(id) ON DELETE CASCADE,
  primary_hexagram_number  SMALLINT NOT NULL CHECK (primary_hexagram_number BETWEEN 1 AND 64),
  -- Los 6 trazos como array de booleans (true = línea mutante)
  -- lines[0] = Línea 1 (inferior), lines[5] = Línea 6 (superior)
  mutating_lines           BOOLEAN[6] NOT NULL DEFAULT '{false,false,false,false,false,false}',
  mutating_lines_count     SMALLINT GENERATED ALWAYS AS (
    (mutating_lines[1]::int + mutating_lines[2]::int + mutating_lines[3]::int +
     mutating_lines[4]::int + mutating_lines[5]::int + mutating_lines[6]::int)
  ) STORED,
  -- NULL si no hay trazos mutantes
  resultant_hexagram_number SMALLINT CHECK (resultant_hexagram_number BETWEEN 1 AND 64),
  created_at               TIMESTAMPTZ DEFAULT now()
);
```

> Los nombres de hexagramas, símbolos chinos y significados son **constantes** que viven en el frontend (`src/constants/iching.ts`). No se almacenan en la DB para evitar redundancia.

---

## FASE 1 — Configurar Supabase (Día 1)

### 1.1 — Crear proyecto en Supabase

- [ ] Crear cuenta en [supabase.com](https://supabase.com) (free tier)
- [ ] Crear nuevo proyecto: `zeniching`
- [ ] Guardar: `Project URL`, `anon key`, `service_role key`, `DB connection string`
- [ ] En `.env` del backend añadir:

```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://postgres:[password]@db.xxxx.supabase.co:5432/postgres
```

### 1.2 — Activar Supabase Auth

En el dashboard de Supabase → **Authentication → Providers**:

- [ ] **Email/Password** → Activar (ya está por defecto)
- [ ] **Google OAuth:**
  1. Google Cloud Console → Crear credenciales OAuth 2.0
  2. URI de redirección: `https://xxxx.supabase.co/auth/v1/callback`
  3. Pegar `Client ID` y `Client Secret` en Supabase
- [ ] **Apple OAuth:**
  1. Apple Developer → Services → Sign In with Apple
  2. Requiere cuenta Apple Developer ($99/año)
  3. Pegar `Service ID`, `Key ID`, `Private Key` en Supabase
- [ ] **Microsoft (Azure) OAuth:**
  1. Azure Portal → App Registrations → New registration
  2. Redirect URI: `https://xxxx.supabase.co/auth/v1/callback`
  3. Pegar `Application ID` y `Client Secret` en Supabase

### 1.3 — Configurar Email templates

En Supabase → **Authentication → Email Templates**:
- [ ] Personalizar email de confirmación con branding Zen I Ching
- [ ] Personalizar email de "Magic Link" si se activa esa opción

---

## FASE 2 — Migraciones con Alembic (Día 2-3)

### 2.1 — Instalar dependencias

```bash
pip install sqlalchemy alembic psycopg2-binary asyncpg supabase python-jose[cryptography] passlib[bcrypt]
```

Actualizar `backend/requirements.txt`:
```
fastapi
uvicorn
google-genai
python-dotenv
pydantic
sqlalchemy[asyncio]
alembic
asyncpg          # Driver async PostgreSQL
supabase         # SDK oficial de Supabase
python-jose      # Validación JWT de Supabase
```

### 2.2 — Inicializar Alembic

```bash
cd backend
alembic init alembic
```

Editar `alembic.ini`:
```ini
sqlalchemy.url = %(DATABASE_URL)s
```

Editar `alembic/env.py`:
```python
from dotenv import load_dotenv
import os
load_dotenv()
config.set_main_option("sqlalchemy.url", os.getenv("DATABASE_URL"))
```

### 2.3 — Crear modelos SQLAlchemy

Crear `backend/models.py` con todos los modelos. Estructura de archivos:

```
backend/
├── main.py              # FastAPI app (existente)
├── models.py            # Modelos SQLAlchemy
├── database.py          # Conexión async a PostgreSQL
├── auth.py              # Middleware de auth Supabase
├── routers/
│   ├── oracle.py        # Endpoints de oráculo
│   ├── sessions.py      # Historial y grimorio
│   ├── gamification.py  # XP, badges, créditos
│   └── payments.py      # Stripe (futuro)
└── alembic/             # Migraciones
    └── versions/
```

### 2.4 — Ejecutar migraciones

```bash
# Generar primera migración desde los modelos
alembic revision --autogenerate -m "initial_schema"

# Revisar el archivo generado en alembic/versions/
# Aplicar la migración
alembic upgrade head
```

---

## FASE 3 — Auth Middleware en FastAPI (Día 3-4)

### 3.1 — Verificar tokens de Supabase

Supabase emite JWTs estándar. Crear `backend/auth.py`:

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import os

security = HTTPBearer()
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")  # De Supabase dashboard → Settings → API

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(
            credentials.credentials,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated"
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"id": user_id, "email": payload.get("email")}
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
```

### 3.2 — Endpoint de sync de perfil

Al primer login, o si el perfil no existe, crearlo automáticamente:

```python
@app.post("/api/auth/sync-profile")
async def sync_profile(current_user = Depends(get_current_user), db = Depends(get_db)):
    # Busca o crea el user_profile para este user_id de Supabase
    ...
```

---

## FASE 4 — Actualizar Frontend (Día 4-5)

### 4.1 — Instalar Supabase JS SDK

```bash
npm install @supabase/supabase-js
```

### 4.2 — Crear cliente Supabase

Crear `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

Añadir a `.env`:
```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 4.3 — Reemplazar AuthContext mock por Supabase Auth

Actualizar `src/context/AuthContext.tsx`:

```typescript
// Login con email/password
const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

// Login social (Google, Apple, Microsoft)
const loginWithProvider = async (provider: 'google' | 'apple' | 'azure') => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${window.location.origin}/grimorio` }
  })
  if (error) throw error
}

// Logout
const logout = async () => {
  await supabase.auth.signOut()
}

// Escuchar cambios de sesión
supabase.auth.onAuthStateChange((event, session) => {
  setUser(session?.user ?? null)
  setIsLoggedIn(!!session)
})
```

### 4.4 — Añadir botones de login social a LoginPage

Añadir en `src/pages/Login/LoginPage.tsx`:
```tsx
<button onClick={() => loginWithProvider('google')} className="zen-btn-social">
  Continuar con Google
</button>
<button onClick={() => loginWithProvider('apple')} className="zen-btn-social">
  Continuar con Apple
</button>
<button onClick={() => loginWithProvider('azure')} className="zen-btn-social">
  Continuar con Microsoft
</button>
```

---

## FASE 5 — Persistir Sesiones Oraculares (Día 5-6)

### 5.1 — Nuevos endpoints en FastAPI

```python
# POST /api/sessions          → Crear nueva sesión oracular
# GET  /api/sessions          → Listar sesiones del usuario (grimorio)
# GET  /api/sessions/{id}     → Detalle de una sesión
# POST /api/sessions/{id}/note → Añadir nota personal
# GET  /api/me/patterns       → Patrones simbólicos del usuario
```

### 5.2 — Flujo de una consulta completa

```
1. Frontend: Usuario tira el oráculo
2. Frontend: POST /api/sessions { oracle_type, user_question, mood_tag }
   → Backend crea oracle_session + iching_results/tarot_results/rune_results
3. Frontend: POST /api/sessions/{id}/interpret
   → Backend llama a Gemini (con contexto histórico!) → guarda ai_interpretation
4. Frontend: Muestra la interpretación
5. Frontend: Chat posterior → POST /api/sessions/{id}/chat
   → Backend guarda cada mensaje en chat_messages
```

### 5.3 — Construir contexto histórico para la IA

```python
async def build_user_context(user_id: str, db) -> str:
    profile = await get_user_gamification(user_id, db)
    patterns = await get_top_symbols(user_id, db, limit=5)
    themes = await get_top_themes(user_id, db, limit=5)
    last_session = await get_last_session(user_id, db)

    return f"""
    [PRACTICANTE · Nivel {profile.level} · {profile.total_consultations} consultas]
    [SÍMBOLOS FRECUENTES: {', '.join(f"{p.symbol_key} ×{p.count}" for p in patterns)}]
    [TEMAS RECURRENTES: {', '.join(themes)}]
    [ÚLTIMA CONSULTA: {last_session.created_at} — {last_session.oracle_type}]
    """
```

---

## FASE 6 — Gamificación (Día 7-8)

### 6.1 — Lógica de XP y Niveles

```python
XP_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000, ...]  # 50 niveles

async def award_xp(user_id: str, action: str, db):
    XP_REWARDS = {
        "daily_first_consultation": 50,
        "consultation":              20,
        "chat_message":              10,
        "add_note":                  25,
    }
    xp = XP_REWARDS.get(action, 0)
    await update_user_xp(user_id, xp, db)
    await check_level_up(user_id, db)
    await check_badges(user_id, action, db)
```

### 6.2 — Catálogo de Badges (seed data)

Ejecutar como migración inicial de datos:

```sql
INSERT INTO badges (key, name, description, icon_emoji, tier, xp_reward, credits_reward) VALUES
  ('first_reading',    'Primer Paso',         'Realiza tu primera consulta',        '🌱', 'bronze',   50,   10),
  ('week_streak',      'El Camino',           '7 días consecutivos de consulta',    '🔥', 'bronze',  100,   25),
  ('all_oracles',      'Explorador',          'Usa los 3 oráculos distintos',       '🧭', 'silver',  200,   50),
  ('month_streak',     'Fiel al Camino',      '30 días consecutivos',               '⭐', 'silver',  500,  100),
  ('fifty_readings',   'Conocedor',           '50 consultas completadas',           '📖', 'gold',   1000,  200),
  ('symbol_ten',       'Vidente',             'Un símbolo aparece 10 veces',        '👁', 'gold',    800,  150),
  ('oracle_master',    'Maestro del Oráculo', '100 consultas + Nivel 35',           '⬛', 'obsidian',2000, 500);
```

### 6.3 — Economía de Créditos

```python
CREDIT_COSTS = {
    "ai_interpretation":         5,   # Interpretación IA estándar
    "ai_interpretation_context": 10,  # IA con memoria histórica
    "chat_message":              2,   # Por mensaje en el chat
    "monthly_analysis":          20,  # Análisis de patrones del mes
}

CREDIT_INCOME = {
    "plan_free_monthly":     50,   # Al inicio de cada mes
    "daily_checkin":         2,    # Check-in diario
    "streak_7_days":         25,   # Bonus racha semanal
    "streak_30_days":        100,  # Bonus racha mensual
}
```

---

## FASE 7 — Grimorio Conectado (Día 8-9)

- [ ] Actualizar `GrimorioPage.tsx` para que cargue datos reales desde `GET /api/sessions`
- [ ] Añadir estados de carga y vacíos ("Aún no has consultado el oráculo")
- [ ] Conectar el drawer de detalle con datos reales
- [ ] Mostrar la interpretación IA guardada
- [ ] Renderizar el hexagrama con sus líneas mutantes visualizadas
- [ ] Añadir botón para añadir/editar nota personal
- [ ] Mostrar badge de favorito y permitir toggling

---

## FASE 8 — Dashboard de Gamificación (Día 9-10)

Crear `src/pages/Profile/ProfilePage.tsx`:
- Barra de XP y nivel actual
- Rachas actuales y récords
- Galería de badges con los bloqueados en gris
- Saldo de créditos + historial
- Patrones simbólicos más frecuentes
- Archetype del usuario (calculado del oráculo más usado + símbolos)

---

## Resumen de Variables de Entorno

```env
# Backend (.env)
GEMINI_API_KEY=...
DATABASE_URL=postgresql://postgres:[password]@db.xxxx.supabase.co:5432/postgres
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_JWT_SECRET=...          # Settings > API > JWT Secret en Supabase

# Frontend (.env)
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_URL=http://localhost:8000
```

---

## Estimación de Tiempo

| Fase | Duración estimada |
|---|---|
| 1. Supabase Setup + OAuth | 1 día |
| 2. Migraciones Alembic | 1 día |
| 3. Auth Middleware FastAPI | 1 día |
| 4. Frontend Supabase Auth | 1 día |
| 5. Persistir sesiones oraculares | 2 días |
| 6. Gamificación | 2 días |
| 7. Grimorio conectado | 1 día |
| 8. Dashboard de perfil | 1 día |
| **Total** | **~10 días** |

---

> **Próximo paso:** Crear el proyecto en Supabase, configurar los providers de OAuth y ejecutar la primera migración.
