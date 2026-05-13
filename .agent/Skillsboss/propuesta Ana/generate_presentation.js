const path = require('path');
const fs = require('fs');

// Import the gamma function from skillboss
const { gamma } = require(path.join(__dirname, '..', '.agent', 'skills', 'skillboss', 'scripts', 'api-hub.js'));

const inputText = `
Crea una presentación profesional de consultoría en español (España) con 12 diapositivas. Tono: ejecutivo, directo, basado en datos. Estilo visual: oscuro/corporativo con acentos en naranja y azul. La presentación es un diagnóstico de madurez organizacional para un cliente que ha puntuado 78,6/100 y la propuesta de solución.

DIAPOSITIVA 1 — PORTADA
Título: 78,6/100: está sólido… pero no es consistente
Subtítulo: El riesgo 2026 no es diseño: es ejecución desigual
Contenido:
• Arquetipo: Sólido (>70)
• Dolor: mandos medios inconsistentes
• Algunos equipos vuelan, otros se atascan
Visual: Número 78,6 gigante con badge "SÓLIDO"
Nota del presentador: Abrir: "No venimos a arreglar 'una empresa inmadura'. Venimos a estandarizar ejecución."

DIAPOSITIVA 2 — EL PROBLEMA
Título: El problema no es política: es variabilidad
Contenido:
• Dirección y reglas están bien armadas
• Cambia la experiencia según el área
• El mando medio es el "sistema operativo"
Visual: 2 columnas comparativas: Diseño (alto) vs Ejecución (variable)
Palabra clave: variabilidad
Nota del presentador: "Cuando la ejecución depende del jefe, el sistema se rompe."

DIAPOSITIVA 3 — RADIOGRAFÍA
Título: Radiografía: todo alto… excepto el punto sensible
Contenido:
• D1 Híbrido: 93,8/100 (muy fuerte)
• D2 Adaptación: 87,5/100 (fuerte)
• D3 Clima: 81,3/100 (bien)
• D4 Retención/Sucesión: 68,8/100 (la más baja)
• IA/Ética: 70,8/100 (correcto)
Visual: Barras horizontales con D4 resaltada en rojo/naranja
Palabra clave: 68,8/100
Nota del presentador: "La palanca es D4, y D4 depende del mando."

DIAPOSITIVA 4 — EVIDENCIA
Título: Evidencia: lo 'medio' suele ser mando medio
Contenido:
• Retención >2 años: 3/5 (suficiente)
• Formación ágil en IA: 3/5 (depende de prioridad)
• Protocolos de datos IA: 3/5 (aplicación desigual)
Visual: 3 tarjetas "3/5" alineadas horizontalmente
Palabra clave: 3/5
Nota del presentador: "El diseño existe. Falta exigencia, habilitación y medición consistentes."

DIAPOSITIVA 5 — CAUSA RAÍZ
Título: Causa raíz (de sistema)
Contenido:
• No hay expectativas operativas claras
• No hay rituales mínimos repetibles
• No hay feedback con consecuencias
Visual: Triángulo con 3 vértices: Expectativas / Rituales / Consecuencias
Palabra clave: mínimos no negociables
Nota del presentador: "Sin estándar, aparece liderazgo 'a demanda'."

DIAPOSITIVA 6 — HIPÓTESIS
Título: Hipótesis verificables en 30 minutos
Contenido:
• 2–3 áreas con clima/rotación peor
• Evaluación del mando: cumplir > desarrollar
• Faltan 3 rutinas: 1:1, objetivos, conflictos
Visual: Checklist con ítems "lo confirmamos / lo medimos"
Palabra clave: 30 min
Nota del presentador: "Si se confirma, el plan se ejecuta sin debate."

DIAPOSITIVA 7 — RIESGOS 2026
Título: Riesgos 2026 (señales tempranas)
Contenido:
• Silos: "nosotros vs ellos" y escalados
• Rotación selectiva por jefe (equipos concretos)
• IA/seguridad desigual: cada uno a su manera
Visual: Tabla con columnas Riesgo / Señal / Impacto
Palabra clave: rotación por jefe
Nota del presentador: "No se ve en promedio; se ve por área."

DIAPOSITIVA 8 — PROPUESTA
Título: Opción A: Sistema de Liderazgo Mandos Medios (90 días)
Contenido:
• Estándar mínimo: 5 hábitos + toolkit
• Piloto 10–15 mandos (práctico, no curso)
• Gobernanza: mapa de calor + reviews mensuales
• Escalado 91–180 días
Visual: 4 bloques conectados: estándar → piloto → gobernanza → escalado
Palabra clave: 90 días
Nota del presentador: "Consistencia primero; excelencia después."

DIAPOSITIVA 9 — FASE 1
Título: 0–30 días: alinear y medir variabilidad
Contenido:
• Definir estándar mínimo (5 hábitos)
• Mapa de calor por áreas (clima, rotación, absentismo)
• Seleccionar cohorte piloto (10–15)
Visual: Mapa de calor + línea temporal 0–30
Palabra clave: mapa de calor
Nota del presentador: "Sin mapa de calor, se acusa al 'sistema' sin pruebas."

DIAPOSITIVA 10 — FASE 2
Título: 31–90 días: habilitar + rendición de cuentas
Contenido:
• Role plays + casos reales + shadowing
• Review mensual liderazgo con RRHH y dirección
• Coaching ligero a mandos pivote
Visual: Calendario de 3 meses con ritual mensual marcado
Palabra clave: no curso
Nota del presentador: "Entrenar en el trabajo, no en aula."

DIAPOSITIVA 11 — FASE 3
Título: 91–180 días: blindaje (retención y sucesión)
Contenido:
• Vincular evaluación/bonus a métricas de equipo
• Pipeline de sucesión en roles de mando
• Estándares comunes para 'mixto por áreas'
Visual: Candado + pipeline de sucesión
Palabra clave: métricas de equipo
Nota del presentador: "Si no afecta a evaluación, no escala."

DIAPOSITIVA 12 — CIERRE
Título: Siguiente paso: cierre de alcance sin suposiciones
Contenido:
• Incluye: método, materiales, KPIs, acompañamiento
• No incluye: rediseño total de retribución/convenio
• Requiere: sponsor + RRHH + 2 responsables + mandos piloto
• Reunión: responder 5 preguntas clave
Llamada a la acción: Agendar reunión y activar diagnóstico de variabilidad
Nota del presentador: "El siguiente paso es concreto, no abierto."
`;

async function main() {
  try {
    console.log('Generando presentación con Gamma...');
    console.log('Esto puede tardar unos segundos...\n');
    
    const result = await gamma({
      model: 'gamma/generation',
      inputText: inputText,
      format: 'presentation',
      language: 'es'
    });
    
    // Save the result
    const outputPath = path.join(__dirname, 'gamma_result.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log('\nResultado guardado en:', outputPath);
    
    // Display key info
    if (result.url) {
      console.log('\n🔗 URL de la presentación:', result.url);
    }
    if (result.editUrl) {
      console.log('✏️  URL de edición:', result.editUrl);
    }
    if (result.embedUrl) {
      console.log('📺 URL para embeber:', result.embedUrl);
    }
    
    // Show full response for debugging
    console.log('\nRespuesta completa:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
