# Plan de Implementación - Rediseño del Landing de Diagnóstico

## 📊 Datos del Funnel (6-13 Marzo 2026)

| Métrica | Valor |
|---------|-------|
| Visitantes únicos | 47 |
| Iniciaron diagnóstico | 13 (27,7%) |
| Completaron diagnóstico | 2 (15%) |
| Abandono en paso 1 | 82% |
| Reservas de cita | 0% |

**Empresas en el funnel:** Heineken, El Corte Inglés, Balearia, ADIF, Banco Sabadell, Santander, Mango - ¡Clientes de primer nivel!

---

## 🔍 Análisis del Funcionamiento Actual

### Cómo funciona actualmente:

1. **Landing** → El usuario llega desde email frío
2. **Diagnóstico** → 8 pasos con 17+ preguntas likert + contexto + priorización
3. **BookingPage** → Se muestra resumen y dos opciones:
   - Reservar cita (Calendly)
   - "Enviar informe a mi correo"
4. **Webhook** → Se envían datos a Make:
   - Puntuación global
   - Puntuaciones por dimensión (D1, D2, D3, D4, T)
   - 3 riesgos principales
   - Estado: "Confirmed Booking" o "Skipped"
5. **Make** → Envía el informe por email (siempre, tanto si agenda como si no)

### Problema identificado:
- **82% abandona en el primer paso del diagnóstico** - El diagnóstico es demasiado largo
- Las preguntas son repetitivas y confusas
- El scoring actual funciona con 5 dimensiones, hay que mantenerlo coherente

---

## 🧮 Análisis del Scoring Actual

### Scoring actual (fichero utils/scoring.ts):

| Dimensión | Peso | Descripción |
|-----------|------|-------------|
| D1 | 22% | Equipos Híbridos y Liderazgo |
| D2 | 22% | Adaptación y Aprendizaje |
| D3 | 18% | Clima y Atracción |
| D4 | 18% | Sucesión |
| T | 20% | Gobernanza IA |

**Fórmula:** (valor - 1) / 4 * 100
- Respuesta 1 → 0 puntos
- Respuesta 5 → 100 puntos

**Nivel de exposición:**
- 0-39: Alto (Crítico)
- 40-69: Medio (En Transición)
- 70-100: Bajo (Sólido)

### mapping de las 8 nuevas preguntas a dimensiones:

| Pregunta | Texto | Dimensión对应 |
|----------|-------|---------------|
| 1 | Dificultad para cubrir puestos clave | D3 (Atracción) |
| 2 | Rotación no deseada afecta estabilidad | D3 (Clima) |
| 3 | Se detecta clima/fatiga/desconexión pronto | D3 (Clima) |
| 4 | Mandos medios mantienen rendimiento sin control | D1 (Liderazgo) |
| 5 | Aprendizaje se adapta rápido a cambios negocio | D2 (Adaptación) |
| 6 | IA se usa con criterios claros y seguridad | T (Gobernanza) |
| 7 | Sucesores identificados para roles críticos | D4 (Sucesión) |
| 8 | Propuesta de valor atrae talento sin depender solo de salario | D3 (Atracción) |

**Nota:** Las preguntas 1, 2, 3 y 8 se asignan a D3 (Clima y Atracción), lo cual tiene sentido porque ambas dimensiones están relacionadas con la experiencia del empleado.

---

## 📋 Plan de Implementación

### Fase 1: Página Principal (Hero)

**1.1 Landing.tsx - NuevoHero**
- [ ] Eliminar barra de alerta roja
- [ ] Nuevo título: "Diagnóstico Ejecutivo de Talento y Organización 2026"
- [ ] Nuevo subtítulo: "Detecta tus principales riesgos en rotación, liderazgo, sucesión, clima y uso de IA en menos de 3 minutos."
- [ ] Beneficios:
  - 8 preguntas rápidas
  - Resultado instantáneo privado
  - Informe ejecutivo enviado por email
  - Sin coste, sin datos sensibles de tu equipo
- [ ] Botón principal: "Iniciar diagnóstico"
- [ ] Texto secundario: "Menos de 3 minutos. Diseñado para equipos de RRHH y dirección."
- [ ] Mantener estilo premium oscuro

**1.2 Eliminar secciones innecesarias**
- [ ] Eliminar "What we measure" (5 bloques D1-D4 + T)
- [ ] Eliminar "Demo Section" (mockup de resultado)
- [ ] Eliminar "CTA Footer" (repetitivo)

---

### Fase 2: Diagnóstico Reducido

**2.1 constants.ts - Nuevas 8 preguntas**

```typescript
// Pregunta 1 - D3 (Atracción)
{ id: "q1", category: "D3", type: "likert", 
  text: "Es difícil cubrir puestos clave con la velocidad y calidad necesarias." }

// Pregunta 2 - D3 (Clima)
{ id: "q2", category: "D3", type: "likert", 
  text: "La rotación no deseada está afectando la estabilidad, rendimiento o continuidad de los equipos." }

// Pregunta 3 - D3 (Clima)  
{ id: "q3", category: "D3", type: "likert", 
  text: "Se detecta el clima, fatiga o desconexión a tiempo antes de que genere renuncias." }

// Pregunta 4 - D1 (Liderazgo)
{ id: "q4", category: "D1", type: "likert", 
  text: "Los mandos medios mantienen el rendimiento y compromiso sin necesidad de control constante." }

// Pregunta 5 - D2 (Adaptación)
{ id: "q5", category: "D2", type: "likert", 
  text: "El aprendizaje y desarrollo se adapta rápidamente a los cambios del negocio." }

// Pregunta 6 - T (Gobernanza IA)
{ id: "q6", category: "T", type: "likert", 
  text: "La IA se utiliza con criterios claros, seguridad y sin improvisación." }

// Pregunta 7 - D4 (Sucesión)
{ id: "q7", category: "D4", type: "likert", 
  text: "Se han identificado sucesores para los roles críticos de la organización." }

// Pregunta 8 - D3 (Atracción)
{ id: "q8", category: "D3", type: "likert", 
  text: "La propuesta de valor de la empresa ayuda a atraer talento sin depender solo del salario." }
```

**2.2 Escala Likert simplificada**
- [ ] Escala 1-5:
  - 1 = No ocurre
  - 2 = Ocurre poco
  - 3 = Ocurre parcialmente
  - 4 = Ocurre frecuentemente
  - 5 = Ocurre consistentemente
- [ ] Eliminar opciones "No aplica" e "No lo sé"
- [ ] Las 8 preguntas en una sola pantalla con scroll

**2.3 Eliminar pasos**
- [ ] Eliminar paso de Priorización (bloque de pain points)
- [ ] Eliminar paso de Contexto Organizacional (tamaño, sector, modelo, rol)
- [ ] Eliminar preguntas duplicadas

---

### Fase 3: Scoring y Lógica del Informe

**3.1 utils/scoring.ts - Nueva lógica**

```typescript
// Las 8 preguntas se agrupan en 5 dimensiones:
// D1: q4 (liderazgo)
// D2: q5 (adaptación/upskilling)
// D3: q1, q2, q3, q8 (atracción, rotación, clima, propuesta valor)
// D4: q7 (sucesión)
// T: q6 (gobierno IA)

// Cálculo:
// - D1, D2, D4, T: promedio de sus preguntas
// - D3: promedio de q1, q2, q3, q8

// Score global: promedio ponderado igual que antes
// D1: 22%, D2: 22%, D3: 18%, D4: 18%, T: 20%

// Nivel de exposición:
// - 1.0-2.2 (promedio 0-55): Alto
// - 2.3-3.4 (promedio 56-85): Medio  
// - 3.5-5.0 (promedio 86-100): Bajo
```

**3.2 Importante: El informe debe mantener las 5 dimensiones**
- El scoring cambia a promedio simple por dimensión
- Las 5 dimensiones se mantienen para el informe
- Los 3 riesgos principales salen de las dimensiones con menor puntuación

---

### Fase 4: Flujo de Valor (Mini-resultado)

**4.1 Nuevo flujo**
1. Hero → 2. Diagnóstico (8 preguntas) → 3. Mini-resultado (sin email) → 4. Formulario (nombre+email) → 5. Resultado completo → 6. Reserva opcional

**4.2 Mini-resultado (antes del email)**
- [ ] Mostrar nivel de exposición: Alto / Medio / Bajo
- [ ] Mostrar las 2 áreas de riesgo principales
- [ ] Texto: "Tu diagnóstico preliminar está listo. Hemos detectado tus 2 principales áreas de riesgo."
- [ ] Botón: "Ver mi informe privado"

**4.3 Mostrar resultado ANTES de pedir el email**
- Este es el cambio más importante para reducir abandono
- El usuario ve valor antes de dar su correo

---

### Fase 5: Formulario Minimalista

**5.1 constants.ts - Nuevo paso único**
- [ ] Título: "¿Dónde te enviamos tu informe privado?"
- [ ] Campo 1: Nombre
- [ ] Campo 2: Email corporativo
- [ ] Casilla: "Acepto recibir mi diagnóstico y un email de seguimiento relacionado con este resultado."

**5.2 Eliminar campos**
- [ ] Eliminar: apellidos, empresa, sector, tamaño, rol, modelo de trabajo
- [ ] **Importante:** El informe se envía por email SIEMPRE, tanto si agenda como si no

---

### Fase 6: Resultado y Reserva Opcional

**6.1 Results.tsx - Pantalla de resultado**
- [ ] Mostrar nivel de exposición (Alto/Medio/Bajo)
- [ ] Mostrar 2 prioridades recomendadas
- [ ] Explicación breve de cada una
- [ ] Texto: "Tu informe completo llegará a tu bandeja de entrada en menos de 5 minutos."

**6.2 Reserva opcional**
- [ ] Sección opcional después del resultado
- [ ] Texto: "¿Te gustaría que te expliquemos tu resultado y sugiramos una recomendación inicial? Reserva una revisión ejecutiva de 15 minutos."
- [ ] Botón principal: "Reservar revisión de 15 minutos"
- [ ] Botón secundario: "No ahora, prefiero revisar el informe primero"
- [ ] NO cargar Calendly por defecto, solo después de hacer clic

**6.3 No forzar reserva**
- [ ] Eliminar modal antes de descargar PDF
- [ ] El informe debe descargarse sin necesidad de reservar

---

### Fase 7: Análisis y Seguimiento

**7.1 analytics.ts - Nuevos eventos**
- [ ] view_landing (ya existe)
- [ ] click_start_diagnostic (ya existe)
- [ ] diagnostic_question_1_answered → diagnostic_question_8_answered
- [ ] mini_result_view
- [ ] lead_form_view
- [ ] lead_submitted
- [ ] final_result_view
- [ ] click_request_review
- [ ] calendly_opened
- [ ] calendly_booked

**7.2 Tipos.ts - Añadir eventos**
```typescript
DIAGNOSTIC_Q1_ANSWERED = 'diagnostic_question_1_answered',
// ... hasta Q8
MINI_RESULT_VIEW = 'mini_result_view',
LEAD_FORM_VIEW = 'lead_form_view',
LEAD_SUBMITTED = 'lead_submitted',
FINAL_RESULT_VIEW = 'final_result_view',
CLICK_REQUEST_REVIEW = 'click_request_review',
CALENDLY_OPENED = 'calendly_opened',
CALENDLY_BOOKED = 'calendly_booked'
```

**7.3 Mantener**
- [ ] UTMs en todos los eventos
- [ ] No romper integración con Make (webhook)

---

### Fase 8: Pruebas y Despliegue

- [ ] Probar flujo completo en local
- [ ] Verificar que el email se dispara en Make webhook
- [ ] Verificar funcionamiento en móvil
- [ ] Build de producción
- [ ] Desplegar a Vercel

---

## 📁 Ficheros a Modificar

| Fichero | Cambios |
|---------|---------|
| pages/Landing.tsx | Hero rediseñado, eliminar secciones |
| constants.ts | 8 preguntas, formulario minimalista |
| pages/RadarWizard.tsx | 1-2 pantallas máximo, nuevo flujo |
| utils/scoring.ts | Nueva lógica de puntuación |
| pages/Results.tsx | Nuevo formato, reserva opcional |
| types.ts | Nuevos eventos de análisis |
| utils/analytics.ts | Nuevos eventos de seguimiento |

---

## ⏱️ Tiempo Estimado

- Fase 1: 1 hora
- Fase 2: 2 horas
- Fase 3: 1 hora
- Fase 4: 2 horas
- Fase 5: 1 hora
- Fase 6: 1 hora
- Fase 7: 1 hora
- Fase 8: 1 hora

**Total estimado: 10 horas**

---

## ✅ Lista de Verificación Pre-lanzamiento

- [ ] El diagnóstico se completa en menos de 3 minutos
- [ ] Solo 2 campos en el formulario (nombre + email)
- [ ] Mini-resultado se muestra ANTES del email
- [ ] El informe llega por email siempre
- [ ] La reserva es opcional
- [ ] No hay mensaje alarmista en el hero
- [ ] Funciona correctamente en móvil
- [ ] El seguimiento captura cada paso
- [ ] Los parámetros UTMs se mantienen

---

## 📝 Puntos Clave

1. **El informe llega SIEMPRE** - Esta es la promesa del email frío, no cambiar
2. **La reserva es un extra** - No forzar, el lead ya está capturado
3. **Tono ejecutivo** - Mantener premium, no alarmista
4. **Datos de análisis** - 82% abandona en paso 1, el diagnóstico es demasiado largo actualmente
5. **Calidad de leads** - Empresas como Heineken, Santander, Mango - el tráfico es válido, el problema es fricción
6. **Mantener 5 dimensiones** - El scoring funciona con D1, D2, D3, D4, T, mantener así para el informe

---

## 🎨 Directrices de UX/UI (Basado en Vercel Guidelines + ui-ux-pro-max)

### Accesibilidad (CRÍTICO)

- [ ] Botones solo con icono necesitan `aria-label`
- [ ] Controles de formulario necesitan `<label>` o `aria-label`
- [ ] Elementos interactivos necesitan gestores de teclado
- [ ] Imágenes necesitan `alt` (o `alt=""` si es decorativo)
- [ ] Actualizaciones asíncronas necesitan `aria-live="polite"`

### Formularios

- [ ] Inputs necesitan `autocomplete` y `name` significativos
- [ ] Usar tipo correcto (`email`, `tel`, etc.)
- [ ] Nunca bloquear pegado (`onPaste` + `preventDefault`)
- [ ] Labels clicables
- [ ] Botón submit habilitado hasta que starts request; spinner durante request
- [ ] Errores inline junto a campos; enfocar primer error en submit

### Animación

- [ ] Respetar `prefers-reduced-motion`
- [ ] Animar solo `transform`/`opacity` (compositor-friendly)
- [ ] Nunca `transition: all`—listar propiedades explícitamente

### Tipografía

- [ ] Usar `…` no `...`
- [ ] Comillas rizadas `"` `"` no rectas `"`
- [ ] `text-wrap: balance` en títulos

### Interacción y Estados

- [ ] Botones/enlaces necesitan estado `hover:` (feedback visual)
- [ ] Estados interactivos aumentan contraste
- [ ] Targets táctiles mínimos 44x44px
- [ ] `cursor-pointer` en elementos clickables
- [ ] Estados de focus visibles: `focus-visible:ring-*`

### Contenido

- [ ] Contenedores de texto manejan contenido largo: `truncate`, `line-clamp-*`
- [ ] Manejar estados vacíos—no renderizar UI rota para strings/arrays vacíos

### Diseño Oscuro (Dark Mode)

- [ ] `color-scheme: dark` en `<html>` para temas oscuros
- [ ] `<meta name="theme-color">` coincide con fondo de página

### Anti-patrones (EVITAR)

- ❌ `user-scalable=no` o `maximum-scale=1`
- ❌ `onPaste` con `preventDefault`
- ❌ `transition: all`
- ❌ `outline-none` sin reemplazo focus-visible
- ❌ Navegación inline onClick sin `<a>`
- ❌ `<div>` con click handlers (debe ser `<button>`)
- ❌ Imágenes sin dimensiones
- ❌ Inputs de formulario sin labels
- ❌ Botones de icono sin `aria-label`

---

## ✅ Checklist de Verificación Pre-lanzamiento

- [ ] El diagnóstico se completa en menos de 3 minutos
- [ ] Solo 2 campos en el formulario (nombre + email)
- [ ] Mini-resultado se muestra ANTES del email
- [ ] El informe llega por email siempre
- [ ] La reserva es opcional
- [ ] No hay mensaje alarmista en el hero
- [ ] Funciona correctamente en móvil
- [ ] El seguimiento captura cada paso
- [ ] Los parámetros UTMs se mantienen
- [ ] **UX: Estados hover/focus visibles**
- [ ] **UX: Labels en todos los inputs**
- [ ] **UX: Transiciones suaves (150-300ms)**
- [ ] **UX: targets táctiles mínimos 44px**
- [ ] **A11y: aria-labels en botones de icono**
- [ ] **A11y: mensajes de error inline**
