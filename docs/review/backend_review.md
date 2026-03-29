# Backend Review - MyGrimoria

**Fecha de revisión:** 29 de Marzo de 2026  
**Analista:** Backend Review Agent  
**Versión del código:** Actual (main.py, models.py, auth.py)

---

## Resumen Ejecutivo

El backend de MyGrimoria está implementado con FastAPI y utiliza Supabase para autenticación y base de datos PostgreSQL. El código presenta una estructura funcional con endpoints para I Ching, Tarot y Runas, pero existen varios problemas de seguridad, consistencia y rendimiento que deben abordarse.

**Estado general:** ⚠️ Requiere mejoras antes de producción

---

## 1. Estructura de Endpoints (main.py)

### 1.1 Estado General

| Aspecto | Estado | Notas |
|---------|--------|-------|
| Organización | ✅ Bueno | Endpoints bien agrupados por oráculo |
| Documentación | ⚠️ Parcial | Solo títulos FastAPI, sin docstrings |
| Versionado | ❌ Ausente | Sin prefijo `/api/v1/` |
| Rate Limiting | ❌ Ausente | Vulnerable a abuse |
| Validación | ⚠️ Básico | Solo Pydantic, sin validación adicional |

### 1.2 Endpoints Implementados

```
/api/iching/
  ├── /interpret          (POST) - Interpretación de hexagrama
  ├── /chat               (POST) - Chat con maestro I Ching
  └── /draw               (GET)  - Draw cards (NO IMPLEMENTADO)

/api/tarot/
  ├── /draw               (GET)  - Sacar 3 cartas
  ├── /interpret         (POST) - Interpretación de tarot
  └── /chat               (POST) - Chat con lector de tarot

/api/runes/
  ├── /draw               (GET)  - Sacar 3 runas
  ├── /interpret          (POST) - Interpretación de runas
  └── /chat               (POST) - Chat con maestro de runas

/api/
  ├── /me                 (GET)  - Perfil del usuario actual
  ├── /profile            (GET)  - Obtener perfil
  ├── /profile            (PUT)  - Actualizar perfil
  ├── /history            (GET)  - Historial de sesiones
  ├── /chat/save          (POST) - Guardar chat
  └── /sessions/{id}/
       ├── DELETE         - Eliminar sesión
       └── POST /favorite - Toggle favorito
```

### 1.3 Problemas Identificados

#### 🔴 Crítico: Configuración CORS Permisiva (Línea 26-32)

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ❌ Permite cualquier origen
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Problema:** En producción, esto permite ataques CSRF y expone la API a cualquier dominio.

**Sugerencia:** Usar variable de entorno para orígenes permitidos:
```python
allowed_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```

#### 🔴 Crítico: Manejo de API Key con Fallback Inseguro (Línea 35-41)

```python
api_key = os.getenv("DEEPSEEK_API_KEY")
if not api_key:
    print("WARNING: DEEPSEEK_API_KEY environment variable not set")
    api_key = ""  # ❌ Crea cliente con key vacía

client = OpenAI(api_key=api_key, base_url="https://api.deepseek.com")
```

**Problema:** El servidor inicia con API key vacía, causando fallos silenciosos en producción.

**Sugerencia:**
```python
api_key = os.getenv("DEEPSEEK_API_KEY")
if not api_key:
    raise RuntimeError("DEEPSEEK_API_KEY environment variable is required")

client = OpenAI(api_key=api_key, base_url="https://api.deepseek.com")
MODEL_NAME = "deepseek-chat"
```

#### 🟡 Código Duplicado: Endpoints de Chat (Líneas 228-258, 344-374, 448-478)

Los tres endpoints de chat son casi idénticos:

```python
# iching/chat (línea 228)
# tarot/chat (línea 344)
# runes/chat (línea 448)

# Diferencias mínimas:
# - system_instruction varía
# - El resto es copy-paste
```

**Sugerencia:** Crear un router genérico o función auxiliar:
```python
async def handle_oracle_chat(
    request: ChatRequest,
    system_instruction: str,
    current_user: dict,
    db: AsyncSession
) -> dict:
    messages = [{"role": "system", "content": system_instruction}]
    # ... lógica común
```

#### 🟡 Sin Paginación en History (Línea 622-683)

```python
@app.get("/api/history")
async def get_oracle_history(...):
    # ❌ Carga TODAS las sesiones
    result = await db.execute(
        select(OracleSession)
        .where(OracleSession.user_id == user_profile.id)
        # Sin .limit() ni .offset()
    )
```

**Sugerencia:**
```python
from fastapi import Query

@app.get("/api/history")
async def get_oracle_history(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    ...
):
    result = await db.execute(
        select(OracleSession)
        .where(...)
        .order_by(desc(OracleSession.created_at))
        .limit(limit)
        .offset(offset)
    )
```

#### 🟡 Logging con print() en lugar de logging (Líneas 38, 208, 256, 328, etc.)

```python
print(f"Error: {e}")  # ❌ No apropiado para producción
```

**Sugerencia:**
```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.error(f"Error calling AI API: {e}")
```

---

## 2. Modelos de Base de Datos (models.py)

### 2.1 Estado General

| Aspecto | Estado | Notas |
|---------|--------|-------|
| Relaciones | ✅ Bueno | Foreign keys y relaciones bien definidas |
| Tipos | ✅ Bueno | Uso apropiado de tipos PostgreSQL |
| Timestamps | ✅ Bueno | created_at con defaults |
| Índices | ❌ Incompletos | Faltan índices frecuentes |
| Constraints | ⚠️ Básico | Pocos constraints de validación |

### 2.2 Modelos Implementados

- **UserProfile** - Perfil de usuario con datos de personalización
- **OracleSession** - Sesión de oráculo (I Ching, Tarot, Runas)
- **IchingResult** - Resultado de hexagrama
- **TarotResult** - Resultado de tarot (3 cartas)
- **RuneResult** - Resultado de runas (3 runas)
- **AIInterpretation** - Interpretación IA
- **OracleChatMessage** - Mensajes de chat

### 2.3 Problemas Identificados

#### 🔴 Crítico: Sin Índices en Columnas de Consulta Frecuente (models.py)

```python
class OracleSession(Base):
    # ❌ Sin índice en oracle_type
    oracle_type = Column(String)
    
    # ❌ Sin índice en created_at para ORDER BY
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # ✅ Bien: user_id tiene FK pero podría beneficiarse de índice compuesto
    user_id = Column(UUID, ForeignKey("user_profiles.id", ondelete="CASCADE"))

class UserProfile:
    # ❌ Sin índice en email para lookups frecuentes
    email = Column(String, unique=True, index=True)  # Solo unique, no index adicional
```

**Sugerencia:**
```python
class OracleSession(Base):
    __table_args__ = (
        Index('ix_oracle_sessions_user_type_created', 'user_id', 'oracle_type', 'created_at'),
        Index('ix_oracle_sessions_created_at', 'created_at'),
    )
```

#### 🟡 Sin Constraints en oracle_type (Línea 35)

```python
oracle_type = Column(String)  # ❌ Acepta cualquier valor
```

**Sugerencia:**
```python
from sqlalchemy import Enum

class OracleSession(Base):
    oracle_type = Column(Enum('iching', 'tarot', 'runes', name='oracle_type_enum'), nullable=False)
```

#### 🟡 Campos JSON sin Validación de Esquema (Líneas 64-66, 76-78)

```python
class TarotResult(Base):
    past_card = Column(JSON, nullable=False)  # Sin validación de estructura
    present_card = Column(JSON, nullable=False)
    future_card = Column(JSON, nullable=False)
```

**Sugerencia:** Considerar crear tablas separadas o usar JSON Schema validation.

#### 🟡 Sin Soft Delete (Línea 703)

```python
await db.delete(session)  # ❌ Eliminación física
```

**Sugerencia:**
```python
# Agregar columna is_deleted
is_deleted = Column(Boolean, default=False)
is_deleted_at = Column(DateTime, nullable=True)

# En queries
.where(OracleSession.is_deleted == False)
```

---

## 3. Autenticación (auth.py)

### 3.1 Estado General

| Aspecto | Estado | Notas |
|---------|--------|-------|
| JWT Validation | ⚠️ Parcial | Implementación con problemas |
| JWKS Caching | ⚠️ Incompleto | Sin expiración |
| Profile Sync | ✅ Bueno | Lógica correcta |
| Seguridad | ⚠️ Varios problemas | Ver detalles |

### 3.2 Problemas Identificados

#### 🔴 Crítico:
