# 🗺️ MyGrimoria — Roadmap

> **Visión:** Plataforma mística de adivinación con IA (I Ching, Tarot, Runas) con autenticación, historial de tiradas, sanctum personal y blog.
> 
> **Stack:** React 19 + Vite + TypeScript + TailwindCSS 4 · FastAPI + Python · **Supabase** (Auth, PostgreSQL) · **DeepSeek** (IA) · WordPress Headless (Blog, opcional)

---

## Estado Actual ✅

| Componente | Descripción | Estado |
|---|---|---|
| `src/` | React 19 + Vite + TypeScript + TailwindCSS 4 | ✅ Funcional |
| `backend/main.py` | FastAPI + DeepSeek Chat (`/api/iching`, `/api/tarot`, `/api/runes`) | ✅ Funcional |
| Supabase Auth | Login con email + OAuth (Google/Apple) | ✅ Funcional |
| I Ching | Tirada de 6 líneas + hexagrama resultante + chat | ✅ Funcional |
| Tarot | 3-cartas (Pasado/Presente/Futuro) + chat | ✅ Funcional |
| Runes | 3-runas (Urd/Verdandi/Skuld) + chat | ✅ Funcional |
| Sanctum | Historial completo con filtros, favoritos y delete | ✅ Completo |
| Blog | wpService existe pero no conectado | ❌ Pendiente |
| User Profile | Perfil personalizable con datos para prompts | ✅ Completo v1.1 |
| Análisis SDD | AGENTS.md + SKILLS.md + README.md | ✅ Completo |

---

## 🛠️ Próximos Pasos (Priorizados)

### Fase 1 — Limpieza y Estabilización

- [x] ~~Gemini → DeepSeek~~ (Completado)
- [x] Verificar que el backend funciona con DeepSeek
- [x] Eliminar referencias obsoletas en documentación

### Phase 2 — Sanctum UI

- [x] Crear UI para mostrar historial de `/api/history`
- [x] Implementar filtros por oráculo (I Ching/Tarot/Runas)
- [x] Mostrar interpretación guardada y chat history
- [x] Permitir eliminar/favoritear lecturas

### Fase 2.5 — User Profile

- [x] Añadir columnas a user_profiles (display_name, avatar_url, birth_date, birth_place, current_place, gender, prompt_context)
- [x] Crear migración Alembic
- [x] Crear endpoints GET/PUT `/api/profile`
- [x] Crear página `/profile` en frontend
- [x] Actualizar Header (Admin → Profile para todos los usuarios)

### Fase 2.6 — Enhanced Prompts

- [x] Añadir función `build_user_context()` en backend
- [x] Mejorar prompt de I Ching con datos del usuario
- [x] Mejorar prompt de Tarot con datos del usuario
- [x] Mejorar prompt de Runes con datos del usuario

### Fase 3 — Blog (WordPress Headless)

- [ ] Configurar Apollo Client
- [ ] Conectar Blog.tsx con WPGraphQL
- [ ] Conectar PostDetail.tsx

### Fase 4 — UX/UI Mejoras

- [x] Añadir error boundaries
- [x] Mejorar estados de carga
- [ ] Añadir modo offline (cachear lecturas)

### Fase 5 — Analytics

- [x] Implementar tracking de eventos básicos
- [x] Añadir error reporting (Sentry)

### Fase 6 — Gamificación (Futuro)

- [ ] Sistema de XP y niveles
- [ ] Insignias
- [ ] Sistema de créditos

---

## Arquitectura

```
┌──────────────────────────────────────────────────────────────────┐
│                     USUARIOS (browser)                           │
└─────────────────────────┬────────────────────────────────────────┘
                          │
              ┌───────────▼───────────┐
              │   React App (Vite)   │
              │   Puerto 3000 (dev)   │
              └─────┬─────────┬───────┘
                    │         │
         ┌──────────▼──┐  ┌───▼──────────────┐
         │  FastAPI    │  │ Supabase Auth    │
         │  (Python)   │  │ (Google/Apple/   │
         │  Puerto 8000│  │  Email)          │
         │             │  └──────┬───────────┘
         │ - /iching   │         │
         │ - /tarot    │  ┌──────▼───────────┐
         │ - /runes    │  │  PostgreSQL      │
         │ - /history  │  │  (Supabase)      │
         └──────┬──────┘  └──────────────────┘
                │
         ┌──────▼──────┐
         │   DeepSeek  │
         │   AI API    │
         └─────────────┘
```

---

## Variables de Entorno

### Frontend (.env)
```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_URL=http://localhost:8000
```

### Backend (.env)
```env
DEEPSEEK_API_KEY=sk-...
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_JWT_SECRET=...
ALLOWED_ORIGINS=*
```

---

## Rutas

| Ruta | Descripción | Auth |
|---|---|---|
| `/` | Landing page | ❌ |
| `/blog` | Blog (WordPress) | ❌ |
| `/blog/:slug` | Post individual | ❌ |
| `/login` | Login/Registro | ❌ |
| `/oracle` | Configurar intención | ✅ |
| `/oracle/iching` | I Ching | ✅ |
| `/oracle/tarot` | Tarot | ✅ |
| `/oracle/runes` | Runas | ✅ |
| `/sanctum` | Historial personal | ✅ |
| `/sanctum` | Perfil usuario | ✅ |

---

## Tech Stack Detallado

### Frontend
- React 19
- TypeScript 5.8
- Vite 6
- TailwindCSS 4
- Motion (Framer Motion)
- React Router DOM 7
- Supabase JS SDK

### Backend
- FastAPI
- Python 3.13
- SQLAlchemy (async)
- Alembic
- DeepSeek API (OpenAI-compatible)

### Database
- Supabase (PostgreSQL)
- Supabase Auth

---

## Estimación

| Fase | Descripción | Estimación |
|---|---|---|
| 1 | Limpieza DeepSeek | 1 día |
| 2 | Sanctum UI | 2-3 días |
| 3 | Blog | 2 días |
| 4 | UX/UI | 2 días |
| 5 | Analytics | 1 día |
| **Total** | **MVP** | **~8 días** |

---

## Recursos

- [AGENTS.md](./AGENTS.md) — Guía para desarrolladores
- [SKILLS.md](./SKILLS.md) — Skills ejecutables SDD
- [README.md](./README.md) — Documentación general