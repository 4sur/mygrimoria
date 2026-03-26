# 🗺️ Zen I Ching — Roadmap Completo

> **Visión:** Plataforma pública de adivinación con IA (I Ching, Tarot, Runas) con autenticación de usuarios, historial de tiradas, blog, gamificación y micropagos.
> 
> **Stack:** React + Vite (frontend) · FastAPI + Python (IA) · **Supabase** (Auth, PostgreSQL, Storage) · WordPress Headless (CMS/Blog) · Stripe (pasarela de pago).
> 
> 📄 Ver también: [DBroadmap.md](./DBroadmap.md) · [roadmapwpheadless.md](./roadmapwpheadless.md)

---

## Estado Actual ✅

| Componente | Descripción | Estado |
|---|---|---|
| `src/` | React + Vite + TypeScript + Tailwind | ✅ Funcional |
| `backend/main.py` | FastAPI + Gemini 2.0 Flash (`/api/interpret`, `/api/chat`) | ✅ Funcional |
| `stitch/` | 7 plantillas HTML del ecosistema (landing, blog, logbook, 404, etc.) | ✅ Unificadas |
| `stitch/unified.css` | Sistema de diseño compartido (zen-header, zen-footer, botones) | ✅ Completo |

---

## Arquitectura Objetivo

```
┌──────────────────────────────────────────────────────────────────┐
│                     USUARIOS (browser)                           │
└─────────────────────────┬────────────────────────────────────────┘
                          │
              ┌───────────▼───────────┐
              │   React App (Vite)    │  ← Frontend principal
              │   + Supabase Auth JS  │    Puerto 3000 (dev)
              └─────┬─────────┬───────┘
                    │         │
         ┌──────────▼──┐  ┌───▼──────────────┐  ┌───────────────┐
         │  FastAPI    │  │ Supabase Auth    │  │ WordPress     │
         │  (Python)   │  │ (Google/Apple/   │  │ (Headless CMS)│
         │  Puerto 8000│  │  Microsoft/Email)│  │ WPGraphQL     │
         │             │  └──────┬───────────┘  └───────┬───────┘
         │ - /oracle   │         │                      │
         │ - /sessions │  ┌──────▼───────────┐          │
         │ - /gamif.   │  │  PostgreSQL      │          │ (Blog)
         │ - /ai/chat  │  │  (Supabase)      │          │
         └──────┬──────┘  │ · users          │          │
                │         │ · sessions       │          │
         ┌──────▼──────┐  │ · gamification   │          │
         │   Gemini    │  │ · credits        │          │
         │   AI API    │  └──────────────────┘          │
         └─────────────┘                    ┌───────────▼────────┐
                                            │   Stripe (pagos)   │
                                            └────────────────────┘
```

---

## ✅ Estado Actual (Marzo 2026)

| Componente | Descripción | Estado |
|---|---|---|
| `src/` | React + Vite + TypeScript + Tailwind | ✅ Funcional |
| `src/pages/Login` | Portal de login con mock auth | ✅ Implementado |
| `src/pages/Grimorio` | Digital Grimorio con drawer + Historial Chat | ✅ Implementado |
| `src/context/AuthContext` | Auth context (mock → Supabase next) | ✅ Mock activo |
| `backend/main.py` | FastAPI + Gemini 2.0 Flash | ✅ Funcional |
| `backend/models.py` | Modelos SQL + Chat History + Sesiones | ✅ Implementado |
| `stitch/` | 9 plantillas HTML del ecosistema | ✅ Diseñadas |
| `Oráculos` | Iching, Tarot, Runas (Lógica unificada y chat) | ✅ Funcional |
| `DBroadmap.md` | Plan de BD completo (Supabase) | ✅ Documentado |
| `roadmapwpheadless.md` | Plan WordPress Headless Blog | ✅ Documentado |

---

## FASE 1 — Infraestructura Base (Semana 1-2)

### 1.1 — Hosting y dominio

- [ ] Registrar dominio (ej. `zeniching.com`)
- [ ] Configurar DNS
- [ ] Instalar SSL/TLS (Let's Encrypt)
- [ ] **Supabase:** Crear proyecto en [supabase.com](https://supabase.com) → ver [DBroadmap.md](./DBroadmap.md)
- [ ] **Frontend:** Deploy en Vercel o Netlify (recomendado para React)
- [ ] **Backend (FastAPI):** Deploy en Render.com o Railway.app (free tier disponible)
- [ ] **Blog CMS:** WordPress en Hostinger → ver [roadmapwpheadless.md](./roadmapwpheadless.md)

### 1.2 — Variables de entorno

Actualizar `.env` con todas las claves:

```env
# IA
GEMINI_API_KEY=...

# Supabase
DATABASE_URL=postgresql://postgres:[password]@db.xxxx.supabase.co:5432/postgres
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_JWT_SECRET=...

# Frontend (Vite)
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_WP_GRAPHQL_URL=https://cms.zeniching.com/graphql
VITE_API_URL=https://api.zeniching.com

# WordPress Blog
WP_URL=https://cms.zeniching.com

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# CORS
ALLOWED_ORIGINS=https://zeniching.com
```

### 1.2 — WordPress Headless (solo para Blog)

> Ver guía detallada en [roadmapwpheadless.md](./roadmapwpheadless.md)

Plugins mínimos necesarios:
```
├── WPGraphQL               # API GraphQL de posts
├── Enable CORS             # Permite lectura cross-origin
├── Advanced Custom Fields  # Campos extra en posts
├── Yoast SEO               # Metadatos de posts
└── WP Mail SMTP            # Emails transaccionales
```

---

## FASE 2 — Base de Datos Supabase (Semana 2-3)

> **Ver guía completa en [DBroadmap.md](./DBroadmap.md)**

### Resumen de tablas

| Tabla | Contenido |
|---|---|
| `user_profiles` | Perfil extendido (nombre, arquetipo, oráculo preferido) |
| `oracle_sessions` | Cada consulta realizada |
| `iching_results` | Hexagrama + trazos mutantes + hexagrama resultante |
| `tarot_results` | 3 cartas (pasado/presente/futuro) + reversión |
| `rune_results` | 3 runas con posición |
| `ai_interpretations` | Texto de Gemini + temas clave |
| `chat_messages` | Historial del chat persistido |
| `user_notes` | Notas personales del usuario |
| `symbolic_patterns` | Frecuencia de aparición de símbolos por usuario |
| `user_gamification` | XP, nivel, racha, créditos |
| `badges` + `user_badges` | Catálogo e insignias desbloqueadas |
| `credit_transactions` | Log de movimientos de créditos |
| `subscription_plans` + `user_subscriptions` | Planes y suscripciones activas |

### Pasos clave
- [x] Crear proyecto en Supabase (Estructura base)
- [ ] Activar OAuth providers (Google, Apple, Microsoft)
- [x] Inicializar Alembic y crear modelos SQLAlchemy
- [x] Ejecutar primera migración (`alembic upgrade head`)
- [x] Añadir `supabase`, `sqlalchemy[asyncio]`, `alembic`, `asyncpg` a `requirements.txt`
- [x] Implementar tabla `oracle_chat_messages` y persistencia de chat.
- [x] Integrar historial de chat en el Grimorio frontend.

---

## FASE 3 — Autenticación Real con Supabase (Semana 3)

### Flujo de autenticación

```
Usuario → Supabase Auth (email/Google/Apple/Microsoft)
       ↓
Supabase emite JWT
       ↓
React guarda sesión (Supabase SDK la gestiona automaticamente)
       ↓
Cada request a FastAPI incluye: Authorization: Bearer <token>
       ↓
FastAPI verifica el JWT con SUPABASE_JWT_SECRET
```

### Pasos
- [ ] Instalar `@supabase/supabase-js` en frontend
- [ ] Reemplazar `AuthContext` mock por Supabase Auth
- [ ] Añadir botones de login social (Google, Apple, Microsoft) en `LoginPage.tsx`
- [ ] Crear `backend/auth.py` con middleware de verificación JWT
- [ ] Endpoint `POST /api/auth/sync-profile` para crear perfil en primera sesión

---


## FASE 5 — Micropagos con WooCommerce + Stripe (Semana 5)

### 5.1 — Productos en WooCommerce

| Producto | Precio | Créditos | Descripción |
|---|---|---|---|
| **Starter Pack** | 2,99 € | 10 créditos | Para probar |
| **Oracle Pack** | 7,99 € | 30 créditos | El más popular |
| **Sage Pack** | 19,99 € | 100 créditos | Para usuarios activos |
| **Premium Mensual** | 9,99 €/mes | Ilimitado | Suscripción |
| **Premium Anual** | 79,99 €/año | Ilimitado | -33% descuento |

### 5.2 — Flujo de pago (UI)

```
Usuario en React → Clic "Comprar créditos"
       ↓
Modal de selección de pack
       ↓
React → POST /api/payments/create-checkout
    { product_id, user_id }
       ↓
Python → Stripe Checkout Session
       ↓
Redirect a Stripe → Usuario paga
       ↓
Stripe → Webhook → /api/webhooks/stripe
       ↓
Python acredita créditos en WP
       ↓
Email automático de confirmación
       ↓
React actualiza saldo en tiempo real
```

### 5.3 — Suscripciones Premium

- [ ] Instalar **WooCommerce Subscriptions** plugin
- [ ] Crear planes recurrentes Mensual / Anual
- [ ] En Python: verificar si `plan_type === 'premium'` para saltar conteo de créditos
- [ ] Webhook `customer.subscription.deleted` → downgrade a free

---

## FASE 6 — Frontend: UI de Usuario (Semana 6-7)

### 6.1 — Páginas a crear/adaptar

| Página | Archivo | Prioridad |
|---|---|---|
| Login / Registro | `src/pages/Auth.tsx` | 🔴 Alta |
| Dashboard / Mi cuenta | `src/pages/Dashboard.tsx` | 🔴 Alta |
| Historial de tiradas | `src/pages/Readings.tsx` | 🔴 Alta |
| Detalle de tirada | `src/pages/ReadingDetail.tsx` | 🟡 Media |
| Comprar créditos | `src/pages/Credits.tsx` | 🔴 Alta |
| Tirada pública compartida | `src/pages/PublicReading.tsx` | 🟡 Media |
| Perfil de usuario | `src/pages/Profile.tsx` | 🟢 Baja |

### 6.2 — Adaptar `stitch/` al nuevo flujo

- [ ] `zen_user_logbook`: conectar con `GET /api/me/readings` (datos reales)
- [ ] `zen_intention_setting_screen`: guardar pregunta en estado antes de tirar
- [ ] `zen_ai_oracle_interpretation_interface`: mostrar resultado real + opción compartir
- [ ] `zen_single_post_reading`: ruta `/reading/{id}` → vista pública de tirada

### 6.3 — Paywall suave (Freemium)

```typescript
// Lógica en antes de `/api/interpret`:
if (user.credits <= 0 && user.plan !== 'premium') {
  showUpgradeModal()
  return
}
// Usuarios no autenticados: 1 tirada gratis de prueba (sin guardar)
```

### 6.4 — Routing con React Router

```
/                      → Landing page
/oracle                → App principal (tirada)
/login                 → Login / Registro
/dashboard             → Panel de usuario (protegida)
/dashboard/readings    → Historial
/dashboard/credits     → Comprar créditos
/reading/:id           → Tirada pública compartida
/blog                  → Blog (desde WP via GraphQL)
/blog/:slug            → Post individual
/404                   → Página no encontrada
```

---

## FASE 7 — Blog desde WordPress (Semana 7)

### 7.1 — Conexión GraphQL

Instalar **WPGraphQL** y consultar desde React:

```typescript
// src/services/wordpress.ts
const GET_POSTS = gql`
  query GetPosts($first: Int!) {
    posts(first: $first) {
      nodes {
        id
        title
        slug
        excerpt
        featuredImage { node { sourceUrl } }
        categories { nodes { name } }
        date
      }
    }
  }
`
```

### 7.2 — Adaptar plantillas blog

- [ ] `stitch/zen_blog_index_feed` → `src/pages/Blog.tsx` (datos reales de WP)
- [ ] `stitch/zen_single_post_reading` → `src/pages/Post.tsx` (contenido real de WP)
- [ ] Los artículos se gestionan desde el admin de WordPress

---

## FASE 8 — Deploy y DevOps (Semana 8)

### 8.1 — Estructura de despliegue sugerida

```
VPS (Ubuntu 22.04)
├── /var/www/html/               ← React build (Nginx sirve static)
├── /var/www/wp/                 ← WordPress
├── /opt/zeniching-backend/      ← FastAPI (systemd)
└── Nginx (reverse proxy)
    ├── / → /var/www/html
    ├── /api/ → localhost:8000
    └── /wp-admin/ → WordPress
```

### 8.2 — CI/CD (GitHub Actions)

Crear `.github/workflows/deploy.yml`:

```yaml
on:
  push:
    branches: [main]
jobs:
  deploy-frontend:
    # npm run build → rsync al VPS
  deploy-backend:
    # rsync backend/ → VPS
    # systemctl restart zeniching-api
```

### 8.3 — Configurar systemd para FastAPI

```ini
# /etc/systemd/system/zeniching-api.service
[Unit]
Description=Zen I Ching FastAPI Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/opt/zeniching-backend
ExecStart=/opt/zeniching-backend/.venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

### 8.4 — Configurar Nginx

```nginx
server {
    listen 443 ssl;
    server_name zeniching.com;

    # React app
    root /var/www/html;
    try_files $uri $uri/ /index.html;

    # FastAPI
    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_set_header Authorization $http_authorization;
    }

    # WordPress (headless)
    location /wp/ {
        proxy_pass http://localhost:8080/wp/;
    }
    location /wp-json/ {
        proxy_pass http://localhost:8080/wp-json/;
    }
}
```

---

## FASE 9 — SEO, Analytics y Legal (Semana 9)

- [ ] **SEO:** Meta tags dinámicos en React (`react-helmet-async`)
- [ ] **Open Graph:** Tarjetas para compartir tiradas en redes sociales
- [ ] **Sitemap:** Plugin WP Sitemap → consumido por React para rutas de blog
- [ ] **Analytics:** Plausible (GDPR friendly) o Google Analytics 4
- [ ] **Cookies:** Banner de consentimiento (obligatorio en España/EU)
- [ ] **Legal:**
  - Política de Privacidad
  - Términos y Condiciones
  - Política de Reembolso (para WooCommerce)
  - Aviso Legal

---

## FASE 10 — Lanzamiento y Crecimiento (Semana 10+)

### 10.1 — Beta cerrada

- [ ] Invitar a 20-50 usuarios beta
- [ ] Recoger feedback en formulario
- [ ] Iterar sobre UX del flujo de tirada y pago

### 10.2 — Lanzamiento público

- [ ] Product Hunt
- [ ] Reddit: r/tarot, r/iching, r/spirituality
- [ ] Instagram / TikTok con tiradas de ejemplo

### 10.3 — Métricas clave a medir

| Métrica | Objetivo mes 1 |
|---|---|
| Usuarios registrados | 500 |
| Tiradas realizadas | 2.000 |
| Tasa conversión free→pago | 5% |
| MRR (Monthly Recurring Revenue) | 500€ |

---

## Resumen de Dependencias Técnicas

### Frontend (agregar a `package.json`)
```json
{
  "@supabase/supabase-js": "^2",
  "@apollo/client": "^3",
  "graphql": "^16",
  "@stripe/stripe-js": "^4",
  "react-helmet-async": "^2"
}
```

### Backend (agregar a `requirements.txt`)
```
supabase         # SDK oficial de Supabase
sqlalchemy[asyncio]
alembic
asyncpg          # Driver async PostgreSQL
httpx            # llamadas HTTP async
stripe           # SDK de Stripe
python-jose      # validación JWT
```

### WordPress Plugins (solo para Blog)
```
1. WPGraphQL
2. Enable CORS
3. Advanced Custom Fields
4. Yoast SEO
5. WP Mail SMTP
```

---

## Estimación de Tiempo Total

| Fase | Duración |
|---|---|
| Fase 1: Infraestructura + Supabase Setup | 1-2 semanas |
| Fase 2: BD + Migraciones | 1 semana |
| Fase 3: Auth Real (Supabase) | 1 semana |
| Fase 4: Persistir Sesiones Oraculares | 1 semana |
| Fase 5: Micropagos (Stripe) | 1 semana |
| Fase 6: Gamificación | 1 semana |
| Fase 7: UI Frontend (Grimorio, Profile) | 1-2 semanas |
| Fase 8: Blog (WordPress Headless) | 3-5 días |
| Fase 9: Deploy + DevOps | 1 semana |
| Fase 10: SEO, Legal, Launch | continuo |
| **Total MVP** | **~8-10 semanas** |

---

> **Próximo paso inmediato:** Implementar la **Autenticación Real con Supabase** (Fase 3). Reemplazar el `AuthContext` mock por el SDK oficial para permitir registros reales y vinculación de sesiones al `user_id` de Supabase. Ver [DBroadmap.md](./DBroadmap.md) para los pasos detallados.
