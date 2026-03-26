# 🗺️ Roadmap — WordPress Headless Blog en Hostinger

> **Objetivo:** Usar WordPress como CMS headless para el Blog de Zen I Ching, consumiendo los datos desde React vía WPGraphQL.

---

## PASO 1 — Preparar WordPress en Hostinger

### 1.1 — Plugins a instalar (en este orden)

Ve a **WordPress Admin → Plugins → Añadir nuevo** e instala:

| # | Plugin | Enlace / Nombre exacto | Para qué sirve |
|---|---|---|---|
| 1 | **WPGraphQL** | `wp-graphql` | Expone tus posts y datos como API GraphQL |
| 2 | **WPGraphQL for ACF** | `wpgraphql-acf` | Si usas campos personalizados (ACF), expone sus datos también |
| 3 | **Advanced Custom Fields (ACF)** | `advanced-custom-fields` | Para definir campos extra en posts (categoría de oráculo, etc.) |
| 4 | **Enable CORS** | `enable-cors` | Permite que tu React (en otro dominio) lea la API de WP |
| 5 | **Yoast SEO** | `wordpress-seo` | SEO del blog, genera metadatos que React puede leer |

#### Alternativa manual para CORS (sin plugin)
Añade al final del `functions.php` de tu tema activo:

```php
add_action('init', function() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        status_header(200);
        exit;
    }
});
```

### 1.2 — Configuración de WordPress

- [ ] **Configurar permalink:** `Ajustes → Enlaces permanentes → Nombre de la entrada` (`/%postname%/`)
- [ ] **URL de tu WP:** Anota exactamente cómo está configurada. Ejemplos:
  - `tudominio.com/blog` (en subdirectorio)
  - `cms.tudominio.com` (en subdominio — recomendado)
- [ ] **Verificar WPGraphQL:** Ve a `GraphQL → GraphiQL IDE` en el admin de WP. Debe cargarte un playground donde puedes hacer consultas de prueba.

### 1.3 — Desactivar el front-end de WordPress (Headless Mode)

Añade al `functions.php`:

```php
// Redirigir el front-end público de WP a tu React
add_action('template_redirect', function() {
    if (!is_admin() && !is_user_logged_in()) {
        wp_redirect('https://tudominio.com', 301);
        exit;
    }
});
```

---

## PASO 2 — Estructura de Contenido en WordPress

### 2.1 — Categorías del Blog

Crea estas categorías en `Entradas → Categorías`:

| Slug | Nombre | Descripción |
|---|---|---|
| `i-ching` | I Ching | Artículos sobre los 64 hexagramas |
| `tarot` | Tarot | Guías de los Arcanos |
| `runas` | Runas | Interpretaciones de Elder Futhark |
| `espiritualidad` | Espiritualidad | Práctica contemplativa |
| `guias` | Guías | Cómo usar la plataforma |

### 2.2 — Campos personalizados ACF (opcional)

Si quieres metadatos extra en los posts del blog, crea un grupo de campos ACF llamado `post_meta`:

| Campo | Tipo | Para qué |
|---|---|---|
| `oracle_type` | Select (iching/tarot/runas) | Filtrar posts por oráculo |
| `reading_level` | Select (beginner/intermediate/advanced) | Dificultad del contenido |
| `featured_symbol` | Text | Símbolo destacado del post (ej: "The Sun") |
| `read_time_minutes` | Number | Tiempo de lectura estimado |

---

## PASO 3 — Conectar React con WPGraphQL

### 3.1 — Instalar dependencias en el frontend

```bash
npm install @apollo/client graphql
```

### 3.2 — Crear el cliente Apollo

Crear `src/lib/apolloClient.ts`:

```typescript
import { ApolloClient, InMemoryCache } from '@apollo/client'

export const apolloClient = new ApolloClient({
  uri: import.meta.env.VITE_WP_GRAPHQL_URL,
  cache: new InMemoryCache(),
})
```

Añadir a `.env`:
```env
VITE_WP_GRAPHQL_URL=https://cms.tudominio.com/graphql
```

### 3.3 — Envolver la App con Apollo Provider

En `src/main.tsx`:

```tsx
import { ApolloProvider } from '@apollo/client'
import { apolloClient } from './lib/apolloClient'

root.render(
  <ApolloProvider client={apolloClient}>
    <App />
  </ApolloProvider>
)
```

### 3.4 — Crear el servicio de WordPress

Crear `src/services/wordpress.ts`:

```typescript
import { gql } from '@apollo/client'

// Query para la lista del blog
export const GET_POSTS = gql`
  query GetPosts($first: Int!, $after: String, $category: String) {
    posts(first: $first, after: $after, where: { categoryName: $category, status: PUBLISH }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        databaseId
        title
        slug
        excerpt
        date
        readingTime  # si tienes el campo ACF
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        categories {
          nodes {
            name
            slug
          }
        }
        author {
          node {
            name
            avatar { url }
          }
        }
      }
    }
  }
`

// Query para un post individual
export const GET_POST_BY_SLUG = gql`
  query GetPostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      title
      content
      date
      modified
      excerpt
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
      categories {
        nodes { name slug }
      }
      author {
        node {
          name
          description
          avatar { url }
        }
      }
      seo {
        title
        metaDesc
        canonical
        openGraph {
          title
          description
          image { url }
        }
      }
    }
  }
`
```

---

## PASO 4 — Actualizar Blog.tsx con Datos Reales

Actualizar `src/pages/Blog/index.tsx`:

```tsx
import { useQuery } from '@apollo/client'
import { GET_POSTS } from '../../services/wordpress'

const BlogPage = () => {
  const { data, loading, error, fetchMore } = useQuery(GET_POSTS, {
    variables: { first: 9 }
  })

  if (loading) return <LoadingState />
  if (error)   return <p>Error cargando el blog.</p>

  const posts = data?.posts?.nodes ?? []
  const pageInfo = data?.posts?.pageInfo

  return (
    <div>
      {/* Filtros por categoría */}
      <CategoryFilters />
      
      {/* Grid de posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Carga más */}
      {pageInfo?.hasNextPage && (
        <button onClick={() => fetchMore({ variables: { after: pageInfo.endCursor } })}>
          Cargar más
        </button>
      )}
    </div>
  )
}
```

Actualizar `src/pages/Blog/PostDetail.tsx`:

```tsx
import { useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { GET_POST_BY_SLUG } from '../../services/wordpress'

const PostDetail = () => {
  const { slug } = useParams<{ slug: string }>()
  const { data, loading } = useQuery(GET_POST_BY_SLUG, {
    variables: { slug }
  })

  const post = data?.post
  if (loading) return <LoadingState />
  if (!post)   return <NotFound />

  return (
    <article>
      <h1 dangerouslySetInnerHTML={{ __html: post.title }} />
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  )
}
```

---

## PASO 5 — Variables de Entorno

Actualizar `.env.example` con las nuevas variables:

```env
# App
GEMINI_API_KEY=tu_clave_aqui

# WordPress Headless Blog
VITE_WP_GRAPHQL_URL=https://cms.tudominio.com/graphql

# Supabase (para auth y DB)
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## PASO 6 — Pruebas de Integración

### 6.1 — Verificar WPGraphQL desde el IDE

En el admin de WP → `GraphQL → GraphiQL IDE`, ejecutar:

```graphql
query TestPosts {
  posts(first: 3) {
    nodes {
      title
      slug
      date
    }
  }
}
```

Debe devolver los 3 posts más recientes. Si funciona, la API está operativa.

### 6.2 — Verificar desde React

En la consola del navegador:
```javascript
fetch('https://cms.tudominio.com/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: '{ posts { nodes { title } } }' })
}).then(r => r.json()).then(console.log)
```

---

## Checklist Final

- [ ] WPGraphQL instalado y activo
- [ ] CORS configurado (plugin o manual)
- [ ] Permalinks configurados como `/%postname%/`
- [ ] Al menos 3 posts publicados para probar
- [ ] `VITE_WP_GRAPHQL_URL` añadida al `.env`
- [ ] Apollo Client instalado y configurado
- [ ] `Blog.tsx` y `PostDetail.tsx` cargando datos reales
- [ ] Imágenes optimizadas en WordPress (WebP)
- [ ] Yoast SEO configurado con sitemap activo

---

> **Próximo paso:** Una vez el blog funcione, conectar el Sitemap de WP con el SEO del frontend para indexación óptima.
