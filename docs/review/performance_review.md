# Informe de Revision de Rendimiento - MyGrimoria
Fecha de revision: 29 de Marzo de 2026
Proyecto: MyGrimoria - Aplicacion de oraculo mistico
Stack: React 19 + TypeScript + Vite + TailwindCSS 4

================================================================================
1. ANALISIS DE BUNDLE SIZE Y DEPENDENCIAS
================================================================================

El archivo package.json revela las siguientes dependencias con impacto en el bundle:

DEPENDENCIAS PRINCIPALES:
- motion (^12.23.24): ~150-200 KB - Libreria de animaciones muy pesada
- @supabase/supabase-js (^2.98.0): ~100-150 KB - SDK completo
- lucide-react (^0.546.0): ~80-100 KB - Iconos sin tree-shaking
- react-markdown (^10.1.0): ~50 KB - Rendering de Markdown
- @sentry/react (^10.46.0): ~50 KB - Error tracking
- react-router-dom (^7.13.1): ~30 KB - Enrutamiento
- react-icons (^5.6.0): ~10 KB - Duplicacion con lucide-react

PROBLEMAS IDENTIFICADOS:

1. DUPLICACION DE ICONOS
   - Se usan tanto lucide-react como react-icons simultaneamente
   - Recomendacion: Eliminar una de las dos

2. SENTRY CON SAMPLE RATE AL 100%
   - En main.tsx: tracesSampleRate: 1.0
   - Esto captura TODAS las transacciones, generando overhead
   - Recomendacion: Reducir a 0.1 para produccion

3. FALTA DE CODE SPLITTING
   - No hay React.lazy() para las rutas
   - Todo el codigo se carga inicialmente
   - Recomendacion: Implementar lazy loading

4. SIN OPTIMIZACIONES DE BUILD
   - No hay manualChunks configurado en vite.config.ts
   - Recomendacion: Configurar chunk splitting

ARCHIVO DE LOGO:
- src/assets/logo.png: 161 KB
- Muy grande para un logo que aparece multiples veces
- Recomendacion: Convertir a WebP (~20KB) o SVG

================================================================================
2. PROBLEMAS DE RENDIMIENTO EN EL CODIGO
================================================================================

2.1 COMPONENTE TYPEWRITER (CRITICO)
--------------------------------------
Archivo: src/components/Typewriter.tsx

PROBLEMAS ENCONTRADOS:
- useEffect causa re-renders en cada caracter
- Cada caracter causa re-render completo del componente padre
- Segundo useEffect puede causar ciclos infinitos si text cambia rapidamente
- No hay useMemo para el texto procesado

CODIGO PROBLEMATICO:
  useEffect(() => {
      if (index < text.length) {
          const timeout = setTimeout(() => {
              setDisplayedText((prev) => prev + text[index]);
              setIndex((prev) => prev + 1);
          }, speed);
          return () => clearTimeout(timeout);
      }
  }, [index, text, speed, onComplete, animate]);

IMPACTO: Alto - Afecta la experiencia en pantallas de interpretacion

---

2.2 HOOK USEORACLE
------------------
Archivo: src/hooks/useOracle.ts

PROBLEMAS ENCONTRADOS:
- El historial se carga cada vez que se visita la pagina sin cache
- No hay manera de invalidar la cache o verificar si ya esta cargado
- Posibles memory leaks si el componente se desmonta durante la peticion

CODIGO PROBLEMATICO:
  useEffect(() => {
      const loadHistory = async () => {
          const data = await getHistory();
          setHistory(data.readings.filter((r: any) => r.oracle_type == iching));
      };
      loadHistory();
  }, []);

---

2.3 AUTHCONTEXT
---------------
Archivo: src/context/AuthContext.tsx

PROBLEMAS ENCONTRADOS:
- refreshProfile no tiene abort controller
- No hay forma de cancelar requests en progreso
- Posibles race conditions si el usuario hace login/logout rapidamente
- refreshProfile se llama en multiples lugares sin control

---

2.4 PAGINAS (ICHING, TAROT, RUNES)
----------------------------------

Problemas comunes encontrados:
1. Cada pagina carga su propio historial de manera independiente
2. setTimeout sin cleanup en handleConsult
3. Efectos con dependencias incompletas
4. Estados locales duplicados (question en contexto y en cada pagina)

CODIGO PROBLEMATICO (IntentionPage.tsx):
  setTimeout(() => {
      navigate(/oracle/);
  }, 2000);

---

2.5 AUSENCIA DE OPTIMIZACIONES DE REACT
----------------------------------------

Componentes que DEBERIAN usar React.memo pero NO lo hacen:
- HexagramLine.tsx - Re-renderiza en cada linea casteada
- HexagramDisplay.tsx - Re-renderiza con cada cambio de estado
- LoadingOracle.tsx - Animaciones sin optimizacion
- OracleChat.tsx - Re-renderiza en cada mensaje

Ninguno de estos componentes utiliza:
- React.memo()
- useMemo() para calculos pesados
- useCallback() consistentemente

================================================================================
3. ANALISIS DE IMAGENES Y ASSETS
================================================================================

ASSETS ENCONTRADOS:

| Archivo                  | Tamano | Tipo | Estado      |
|--------------------------|--------|------|-------------|
| src/assets/logo.png      | 161 KB | PNG  | CRITICO     |
| Fondo Tarot (3 URLs)     | Variable | JPEG | Sin optimizar |

PROBLEMAS IDENTIFICADOS:

1. LOGO SIN OPTIMIZAR
   - 161 KB para un logo que aparece multiples veces
   - No hay version dark/light separada
   - Formato PNG sin compresion moderna

2. IMAGENES EXTERNAS EN TAROT
   - BG_PAST, BG_PRESENT, BG_FUTURE son URLs largas de Google Photos
   - Sin lazy loading implementado
   - Sin tamano adaptado para mobile

3. SIN IMAGE OPTIMIZATION EN BUILD
   - No se usa vite-plugin-imagemin o similar
   - No hay srcset para diferentes resoluciones
   - No hay loading=lazy en imagenes

================================================================================
4. OPORTUNIDADES DE OPTIMIZACION
================================================================================

4.1 OPTIMIZACIONES DE BUNDLE - ALTA PRIORIDAD
---------------------------------------------

1. CODE SPLITTING POR RUTAS
   - Implementar React.lazy en App.tsx
   - Usar lazy loading para IchingPage, TarotPage, RunesPage

2. ELIMINAR DEPENDENCIAS DUPLICADAS
   - Elegir entre lucide-react O react-icons, no ambos
   - Puede reducir ~80-100KB del bundle

3. OPTIMIZAR SENTRY PARA PRODUCCION
   - Cambiar tracesSampleRate de 1.0 a 0.1
   - Reducir replaysSessionSampleRate a 0.05

4. CONFIGURAR CHUNKS EN VITE
   - Agregar manualChunks en vite.config.ts
   - Separar vendor, supabase y motion en chunks independientes

---

4.2 OPTIMIZACIONES DE COMPONENTES - ALTA PRIORIDAD
---------------------------------------------------

1. TYPEWRITER CON USEREF
   - Usar useRef en lugar de useState para evitar re-renders excesivos
   - Agregar React.memo al componente

2. MEMOIZACION DE COMPONENTES PESADOS
   - Agregar React.memo a HexagramLine, HexagramDisplay
   - Agregar React.memo a LoadingOracle, OracleChat

3. CACHE DE HISTORIAL GLOBAL
   - Crear hook useHistoryCache para compartir datos entre paginas
   - Evitar cargar historial en cada visita

---

4.3 OPTIMIZACIONES DE IMAGENES - MEDIA PRIORIDAD
-------------------------------------------------

1. CONVERTIR LOGO A WEBP
   - Reducir de 161 KB a ~15-20 KB
   - O usar SVG para escalabilidad perfecta

2. AGREGAR LAZY LOADING
   - Usar loading=lazy en todas las imagenes

3. USAR CDN PARA IMAGENES EXTERNAS
   - Configurar Cloudinary para imagenes de Tarot

---

4.4 OPTIMIZACIONES DE CSS - BAJA PRIORIDAD
------------------------------------------

1. AGREGAR WILL-CHANGE A ANIMACIONES
   - Usar transform: translateZ(0) para forzar GPU

2. OPTIMIZAR FUENTES
   - Agregar font-display: swap

================================================================================
5. RESUMEN Y PRIORIDADES
================================================================================

HALLAZGOS CRITICOS - ARREGLAR INMEDIATAMENTE
--------------------------------------------

1. Logo sin optimizar - 161 KB innecesarios
2. Typewriter causa re-renders excesivos en cada caracter
3. Sentry con sample rate al 100% - overhead en produccion
4. Sin code splitting - bundle inicial muy grande


HALLAZGOS IMPORTANTES - ARREGLAR ESTA SEMANA
---------------------------------------------

5. Historial se carga en cada visita - sin cache, llamadas API redundantes
6. Componentes sin memoizacion - re-renders evitables
7. Duplicacion de librerias de iconos - bundle inflation
8. setTimeout sin cleanup - potenciales memory leaks


MEJORAS SUGERIDAS - BACKLOG
---------------------------

9. Optimizar fuentes con font-display swap
10. Lazy loading de imagenes
11. Configurar proper chunk splitting
12. Agregar analisis de bundle con rollup-plugin-visualizer

================================================================================
6. RECOMENDACIONES DE IMPLEMENTACION
================================================================================

FASE 1: QUICK WINS - 1 DIA
----------------------------

[ ] Reducir tracesSampleRate de Sentry de 1.0 a 0.1
[ ] Convertir logo.png a WebP (reducir de 161KB a ~20KB)
[ ] Eliminar react-icons (quedarse solo con lucide-react)
[ ] Agregar loading=lazy a imagenes existentes


FASE 2: OPTIMIZACIONES DE RENDER - 2-3 DIAS
---------------------------------------------

[ ] Implementar React.lazy en App.tsx para rutas
[ ] Agregar React.memo a HexagramLine, HexagramDisplay
[ ] Agregar React.memo a LoadingOracle, OracleChat
[ ] Optimizar Typewriter con useRef y React.memo
[ ] Crear cache de historial compartido


FASE 3: BUNDLE OPTIMIZATION - 2 DIAS
-------------------------------------

[ ] Configurar manualChunks en vite.config.ts
[ ] Implementar lazy loading para imagenes externas
[ ] Agregar compresion gzip/brotli en build
[ ] Configurar proper chunk splitting


FASE 4: FINE-TUNING - 1 DIA
----------------------------

[ ] Agregar will-change a animaciones CSS
[ ] Optimizar fuentes con font-display swap
[ ] Agregar analisis de bundle con rollup-plugin-visualizer
[ ] Revisar y limpiar dependencias sin uso


NOTAS ADICIONALES
------------------

- El impacto estimado de todas las optimizaciones es de reduccion del bundle
  inicial en un 40-60 por ciento.

- Las optimizaciones de React.memo y cache de historial tendran el mayor
  impacto en la experiencia de usuario.

- Se recomienda crear tests de rendimiento antes y despues de las
  optimizaciones para medir el impacto real.

================================================================================
INFORME GENERADO EL 29 DE MARZO DE 2026
================================================================================
