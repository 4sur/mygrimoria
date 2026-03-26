# 🔐 Zen I Ching — Roadmap de Autenticación y OAuth

> **Objetivo:** Implementar un sistema de autenticación robusto y seguro utilizando **Supabase Auth** como proveedor de identidad, integrado con **FastAPI** mediante validación de JWT (JSON Web Tokens).

---

## ✅ Estado Actual (Marzo 2026)

| Componente | Estado | Detalle |
|---|---|---|
| **Supabase Client** | ✅ | Configurado en `src/lib/supabase.ts`. |
| **AuthContext** | ✅ | Implementado con soporte para providers y persistencia. |
| **Portal de Login** | ✅ | UI minimalista y funcional en `src/pages/Login`. |
| **JWT Verification** | ✅ | Lógica de validación HS256/ES256 lista en `backend/auth.py`. |
| **Google OAuth** | 🟡 | Código frontend listo; requiere verificación de configuración en Supabase. |
| **Apple/Microsoft** | ⚪ | Pendiente de configuración en Supabase. |

---

## 🚀 Fases de Implementación

### FASE 1 — Configuración de Providers (Cloud)
- [x] **Configurar Proyecto Supabase**: URL y Anon Key conectadas al frontend.
- [🟡] **Google Cloud Console**:
  - [x] Crear Credenciales OAuth 2.0.
  - [ ] Configurar URIs de redirección (`https://[REF].supabase.co/auth/v1/callback`).
- [ ] **Apple Developer Program**: (Opcional) Configurar "Sign in with Apple".
- [ ] **Azure AD**: (Opcional) Configurar App Registration para Microsoft Login.

### FASE 2 — Refuerzo del Backend (Middleware)
- [x] **JWT Validator**: Sistema que verifica la firma de Supabase en cada request.
- [x] **Profile Sync**: Creación automática del `UserProfile` local al detectar un nuevo UUID de Supabase.
- [x] **Protección de Rutas**:
  - [x] `GET /api/me`
  - [x] `POST /api/chat/save`
  - [x] `POST /api/iching/interpret`
  - [x] `POST /api/tarot/interpret`
  - [x] `POST /api/runes/interpret`
  - [x] `GET /api/history`

### FASE 3 — UX y Sesiones en Frontend
- [x] **Persistencia**: Mantener al usuario logueado tras refrescar (LocalStorage).
- [x] **Rutas Protegidas**: Componente `ProtectedRoute` implementado y activo en `App.tsx`.
- [ ] **SignUp Flow**: Añadir soporte para registro por Email/Password con confirmación de correo.
- [ ] **Profile Sync UI**: Animación de carga mientras se sincroniza el perfil local tras el OAuth.

### FASE 4 — Integración con Historial Real
- [ ] **Vincular Sesiones**: Asegurar que cada tirada de oráculo se guarde con el `user_id` del JWT, sustituyendo cualquier UUID temporal.
- [ ] **Gestión de Créditos**: (Próximo paso) Vincular el sistema de créditos al perfil autenticado.

---

## 🛠️ Instrucciones Técnicas

### 1. Cómo proteger una nueva ruta en FastAPI
Para requerir autenticación, añade `current_user: dict = Depends(get_current_user)` a los parámetros de la función del endpoint.

```python
@app.post("/api/oracle/action")
async def oracle_action(
    current_user: dict = Depends(get_current_user), # <-- Esto fuerza el login
    db: AsyncSession = Depends(get_db)
):
    # El usuario está autenticado si llega aquí
    return {"message": f"Hello {current_user['email']}"}
```

### 2. Sincronización de Perfil
El backend debe llamar siempre a `sync_user_profile` para asegurar que el usuario existe en nuestra base de datos PostgreSQL local antes de realizar operaciones de guardado.

---

> **Próximo paso inmediato:** Proteger los endpoints de interpretación de oráculos (`/interpret`) en `main.py` para que solo usuarios autenticados puedan generar lecturas y guardarlas en su historial.
