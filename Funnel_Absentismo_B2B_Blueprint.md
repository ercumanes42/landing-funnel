# Blueprint del Funnel B2B de Absentismo Laboral

## 0. Diagnostico del sistema actual

El sistema actual ya tiene una arquitectura correcta para un funnel de diagnostico automatizado:

- Captacion por email frio con enlace y email prellenado por URL.
- Landing en React/Vite.
- Cuestionario por pasos.
- Vista previa de resultado a mitad de flujo.
- Captura de datos al final.
- Resultados inmediatos.
- Rama A: agenda por Calendly.
- Rama B: descarga de informe PDF.
- Webhook a Make/PostHog con respuestas, puntuaciones, riesgos y estado de agenda.

La friccion actual es el punto a corregir. El funnel de Talento+IA pide 8 preguntas, 3 campos obligatorios, un multiselect opcional y consentimiento separado. En el reporte historico del embudo aparecen 32 vistas, 10 inicios, 1 diagnostico completado y 0 reuniones. La conclusion no es que el concepto no interese; el inicio existe. El problema esta en completar, entender valor y avanzar a reunion sin sentir venta.

La transformacion a absentismo debe mantener la mecanica ganadora - diagnostico, resultado, PDF, agenda - y cambiar tres cosas:

1. Reducir el cuestionario a 6 clics.
2. Convertir el resultado en un diagnostico de coste/capacidad, no en un informe de RRHH.
3. Pedir solo nombre y email de trabajo despues de que el usuario ya haya invertido esfuerzo y quiera ver su resultado.

## 1. Lead magnet optimo

### Eleccion

**Diagnostico Ejecutivo de Fuga de Capacidad y Coste Oculto del Absentismo**

Formato: scorecard interactivo de 6 preguntas + resultado inmediato + informe descargable de 1 pagina ampliada.

No debe venderse como "guia", "ebook" ni "whitepaper". Debe presentarse como una herramienta de decision:

> En 2 minutos identifica si tu absentismo es un problema de coste, de operacion o de gestion temprana, y cual es el primer foco que deberias revisar.

### Por que es el lead magnet mas fuerte

Los informes de lead magnets apuntan a herramientas de decision, no a contenido pasivo:

- En B2B ticket medio/alto funcionan mejor scorecards, benchmarks, diagnosticos breves y calculadoras porque ayudan a tomar decisiones, justificar impacto y reducir riesgo.
- El comprador B2B actual prefiere autoservicio: el informe de lead magnets cita que 67% de compradores B2B prefiere una experiencia sin comercial temprano, y que 94% de los grupos de compra ordenan su shortlist antes de hablar con vendedores.
- La friccion destruye el trafico frio: el estudio recoge que 51% percibe demasiado contenido generico y 51% demasiados pasos de acceso.
- El informe B2B estrategico indica que PDFs/whitepapers convencionales convierten de forma marginal, mientras microauditorias, calculadoras ROI y diagnosticos interactivos elevan valor percibido y calidad del lead.

Los informes de absentismo dan el angulo de dolor:

- Randstad Research, marzo 2026: en Espana, en 2025T4 el absentismo provoco la perdida del 7,1% de las horas pactadas y el absentismo por IT el 5,5%. Eso equivale a una media diaria de 1.595.211 personas que no acudieron a trabajar y 1.293.732 de baja medica.
- El mismo informe muestra que la baja medica se ha duplicado practicamente en la ultima decada en el promedio sectorial.
- Hay sectores con niveles superiores al 9%, llegando a 12,3% en actividades postales y de correos, 11,8% en servicios a edificios/jardineria y 11,2% en asistencia residencial.
- El informe Europa/LatAm muestra que en Reino Unido se estiman 148,9 millones de jornadas perdidas por enfermedad en 2024.
- En Chile, los trastornos mentales representan 32% de las licencias y los musculo-esqueleticos 18%; el gasto en subsidio por incapacidad laboral fue de $2,8 billones.
- OMS/OIT situan la perdida de productividad global por depresion y ansiedad en torno a US$ 1 billon anual.
- La evidencia comparada destaca intervencion temprana, retorno al trabajo, case management y claridad de responsabilidades como palancas solidas.

### Posicionamiento

No somos "consultores vendiendo bienestar". Somos el equipo que traduce ausencias en capacidad, coste, continuidad y decisiones.

La promesa no es "reducimos tu absentismo". La promesa inicial es:

> Te ayudamos a ver que parte del absentismo te esta costando dinero, que parte esta rompiendo la operacion y que primer dato necesitas mirar antes de tomar medidas.

Esto genera dolor consciente porque el decisor no se siente acusado; se siente expuesto a una fuga que probablemente no esta midiendo bien.

## 2. Cuestionario exacto

Regla base: 6 preguntas, todas con botones/tarjetas. Sin texto libre. La progresion va de "situacion facil" a "coste real".

### Pregunta 1

**Texto exacto**

> Cuando alguien falta, donde se nota primero?

**Opciones**

- En operaciones: hay que mover turnos o tareas
- En los mandos: acaban tapando huecos
- En clientes: bajan tiempos, calidad o servicio
- En el equipo: se reparte la carga y se tensa
- Hoy no parece un problema serio

**Por que va aqui**

Es una entrada facil, no pide datos y hace que el usuario aterrice el absentismo en un efecto visible. Activa reconocimiento: "esto me pasa". Tambien evita empezar con dinero demasiado pronto, lo que sonaria agresivo.

### Pregunta 2

**Texto exacto**

> Cuando una baja se alarga, que suele pasar en la practica?

**Opciones**

- Tenemos sustitucion clara y funciona
- Tiramos de companeros hasta que vuelva
- Se acumula trabajo y luego hay que recuperarlo
- Depende demasiado del jefe directo
- No lo vemos hasta que ya molesta

**Por que va en este orden**

Pasa de ausencia puntual a continuidad. El usuario empieza a ver que el coste no esta solo en la baja, sino en la carga que deja detras. Las opciones estan redactadas como conversaciones reales de direccion, no como politica de RRHH.

### Pregunta 3

**Texto exacto**

> Teneis claro cuanto os cuestan esas ausencias?

**Opciones**

- Si: lo vemos en euros y por area
- Vemos dias perdidos, pero no euros
- Sabemos que duele, pero no cuanto
- Solo lo miramos cuando hay una crisis
- No tenemos un dato fiable

**Por que va aqui**

Es el primer giro financiero. Llega despues de dos preguntas operativas, por lo que no parece interrogatorio. Activa una brecha incomoda: muchos decisores creen "tener absentismo controlado" hasta que se dan cuenta de que solo cuentan dias, no coste.

### Vista previa despues de la pregunta 3

No pedir datos todavia. Mostrar una micro-salida:

> Primer patron detectado: tu problema parece estar menos en "contar ausencias" y mas en entender donde se convierten en coste real.

CTA:

> Completar el diagnostico de coste

Esto reduce abandono porque el usuario ya recibe valor antes de la captura.

### Pregunta 4

**Texto exacto**

> Que crees que hay mas veces detras de esas bajas?

**Opciones**

- Cansancio, estres o saturacion
- Dolor fisico, lesiones o problemas de salud
- Mal ambiente, jefes o conflictos
- Picos de carga, turnos o mala organizacion
- No vemos un patron claro

**Por que va aqui**

Ahora entramos en causa raiz. No se usa "salud mental", "riesgo psicosocial" ni jerga. Los informes justifican esta pregunta: salud mental, musculo-esqueleticos, organizacion del trabajo y carga operativa aparecen como drivers centrales. La opcion "no vemos un patron claro" es clave porque convierte la falta de dato en dolor.

### Pregunta 5

**Texto exacto**

> En que momento soleis actuar?

**Opciones**

- Antes de que la baja se alargue
- En la primera semana
- Cuando ya afecta al equipo
- Cuando el mando pide ayuda
- Cuando la persona vuelve

**Por que va aqui**

Introduce la palanca de intervencion temprana y retorno al trabajo sin nombrarla tecnicamente. Activa una pregunta interna: "estamos llegando tarde?". Esto conecta con la evidencia OCDE: actuar pronto y coordinar responsabilidades reduce duracion y recurrencia.

### Pregunta 6

**Texto exacto**

> Si el absentismo sube 1 punto este ano, que pasaria?

**Opciones**

- Se notaria en margen o costes
- Se notaria en clientes o servicio
- Se notaria en el cansancio del equipo
- Lo absorberiamos como siempre
- No lo hemos calculado

**Por que cierra el cuestionario**

Es la pregunta de dolor economico. Ya no pregunta "tienes un problema?", pregunta "que pasa si empeora?". El dato de Randstad da autoridad: el promedio nacional ya esta en 7,1% y la IT en 5,5%; un punto adicional no es abstracto, es capacidad perdida. La opcion "lo absorberiamos como siempre" parece defensiva, pero revela normalizacion del coste.

## 3. Captura de datos

### Campos obligatorios

Solo dos:

1. **Nombre**
2. **Email de trabajo**

No pedir empresa, telefono, cargo, tamano, sector ni numero de empleados en este punto.

### Momento optimo

Despues de la pregunta 6 y antes del resultado completo.

Motivo:

- Antes del cuestionario seria demasiado frio: no hay valor entregado.
- Durante el cuestionario corta el estado mental de descubrimiento.
- Despues de responder las 6 preguntas, el usuario ya ha hecho micro-compromisos y quiere cerrar el bucle.

### Copy exacto de captura

Titulo:

> Tu diagnostico ya esta listo

Subtexto:

> Te mostramos el resultado ahora y te enviamos una copia por email para que puedas revisarla o reenviarla internamente.

Campos:

- Nombre
- Email de trabajo

Microcopy:

> Sin llamadas automaticas. Sin pedir datos sensibles de tu plantilla.

CTA:

> Ver mi diagnostico

### Por que pedir mas destruye conversion

En trafico frio, cada campo extra obliga al usuario a justificar mentalmente si merece la pena seguir. Empresa, telefono y cargo comunican "me van a vender". El sistema ya puede capturar contexto desde la campana, UTM, dominio de email o base de datos. Si falta sector o tamano, se puede inferir despues o pedir en reunion, cuando ya existe confianza.

## 4. Landing page

### Paleta recomendada

- Fondo claro: `#F7F8FB`
- Texto principal: `#111827`
- Azul petroleo / confianza tecnica: `#0F766E`
- Azul corporativo secundario: `#1D4ED8`
- Ambar de urgencia moderada: `#F59E0B`
- Rojo solo para riesgo alto: `#DC2626`
- Verde solo para fortaleza: `#16A34A`

Justificacion:

- Azul petroleo/teal: autoridad, calma, precision, menos "startup juguete".
- Azul corporativo: confianza B2B.
- Ambar: urgencia sin agresividad.
- Rojo reservado: si todo es rojo, parece venta por miedo.

### Hero

**Headline**

> Diagnostico de Coste Oculto del Absentismo

**Subheadline**

> En 2 minutos identifica donde se esta convirtiendo el absentismo en coste, carga para mandos o riesgo operativo. Sin datos sensibles de tu equipo.

**CTA principal**

> Calcular mi fuga de capacidad

**Linea bajo CTA**

> 6 preguntas. Resultado inmediato. Informe descargable.

### Prueba social y credibilidad

Incluir solo prueba de autoridad, no logos inventados:

- "Basado en datos publicos de Randstad Research, INE, ONS, OMS/OIT y evidencia OCDE sobre retorno al trabajo."
- "Compara tu situacion con patrones sectoriales, no con opiniones."
- "No pide nombres de empleados, bajas individuales ni informacion medica."

### Escritorio vs movil

Escritorio:

- Hero en una sola pantalla.
- A la derecha, mini-preview del resultado: nivel de exposicion, primer foco, accion recomendada.
- Debajo del CTA, tres datos duros: 7,1% horas pactadas perdidas, 5,5% por IT, sectores hasta 12,3%.

Movil:

- Headline corto visible sin scroll.
- CTA antes de cualquier bloque secundario.
- Las cifras duras deben ser tarjetas compactas, no parrafos.
- El cuestionario debe mostrar una pregunta por pantalla si el dispositivo es pequeno.

### Que no debe aparecer

- "Reserva una demo".
- "Habla con ventas".
- "Solucion integral de absentismo".
- Formularios largos.
- Fotos genericas de oficina.
- Claims tipo "reduce un 30% tu absentismo" sin base.
- Copy de miedo medico o legal.
- Jerga como "riesgo psicosocial", "RTW", "SIL", "incapacidad temporal" en preguntas.

## 5. Informe de resultados

### Nombre

**Informe de Fuga de Capacidad por Absentismo**

Subtitulo:

> Diagnostico ejecutivo de coste, continuidad y respuesta temprana

### Formato recomendado

Primero pagina web de resultados. Despues PDF descargable.

La pagina web convierte mejor porque permite agenda inmediata y lectura dinamica. El PDF sirve para la rama B: reenviar internamente, volver mas tarde y compartir con Direccion, Finanzas u Operaciones.

### Estructura del informe

1. **Resumen ejecutivo**
   - Nivel: Bajo, Medio, Alto.
   - Frase de diagnostico: "El riesgo principal no parece ser el volumen de ausencias, sino la falta de visibilidad del coste".

2. **Tu fuga principal**
   - Coste invisible.
   - Sobrecarga operativa.
   - Causa no segmentada.
   - Respuesta tardia.
   - Normalizacion del impacto.

3. **Benchmark de contexto**
   - Espana 2025T4: 7,1% de horas pactadas perdidas.
   - IT: 5,5%.
   - Sectores de mayor riesgo: postal/correos 12,3%, servicios a edificios/jardineria 11,8%, asistencia residencial 11,2%, servicios sociales sin alojamiento 10,9%, actividades sanitarias 10,1%.

4. **Lectura por respuesta**
   - Se explica que indica cada respuesta clave.
   - No usar "bien/mal"; usar "lo que esto suele indicar".

5. **Coste que deberias estimar**
   - Formula simple:
   - Horas perdidas x coste hora + horas extra/sustitucion + impacto en servicio + coste de sobrecarga.
   - No inventar euros si no se han pedido datos.

6. **Primeras 3 acciones**
   - Una accion de dato.
   - Una accion de gestion temprana.
   - Una accion de operacion.

7. **Siguiente paso opcional**
   - Revision de 15 minutos para interpretar el resultado.
   - No "demo", no "asesoria comercial".

### Personalizacion segun respuestas

- Si Q3 es "Vemos dias, pero no euros" o peor: prioridad "coste invisible".
- Si Q1/Q2 muestran mandos tapando huecos o trabajo acumulado: prioridad "sobrecarga operativa".
- Si Q4 es "no vemos patron claro": prioridad "causa no segmentada".
- Si Q5 es "cuando ya afecta" o "cuando vuelve": prioridad "respuesta tardia".
- Si Q6 es "lo absorberiamos como siempre": prioridad "coste normalizado".

### Urgencia sin agresividad

Usar frases como:

> El riesgo no es que hoy falte mas gente. El riesgo es que la empresa haya aprendido a absorberlo con margen, mandos y cansancio.

> Si no separas coste, causa y momento de intervencion, es facil invertir en medidas que suenan bien pero no reducen la fuga real.

## 6. Conversion en dos ramas

### Rama A: agenda

La pagina de resultados debe hacer que agendar sea interpretacion, no venta.

Copy recomendado:

> Tu resultado ya muestra una prioridad clara. La pregunta ahora no es "hacer mas cosas", sino decidir que dato mirar primero para no atacar el absentismo a ciegas.

Bloque previo al CTA:

> En una revision de 15 minutos vemos:
> 1. Que significa tu nivel de exposicion.
> 2. Que respuesta apunta a mayor coste oculto.
> 3. Que primer dato pedir a RRHH/Operaciones antes de lanzar medidas.

CTA exacto:

> Revisar mis 3 palancas

Microcopy:

> Sin preparacion previa. Sin datos medicos. Solo interpretacion ejecutiva del diagnostico.

### Rama B: no agenda

Boton secundario:

> Prefiero revisar el informe por mi cuenta

PDF descargable:

Debe estar disenado para volver mas tarde:

- Portada sobria con nombre y fecha.
- Resultado en una frase.
- Benchmark con 3 cifras duras.
- "Dato que deberias pedir esta semana".
- "Senal de que conviene revisarlo con direccion".
- CTA discreto al final: "Si quieres contrastarlo, usa este enlace para elegir 15 minutos".

No incluir precios, servicios, paquetes, promesas comerciales ni presentacion corporativa larga.

### Follow-up post-descarga

Cadencia:

- Dia 0: entrega.
- Dia 2: insight de coste.
- Dia 5: insight de causa.
- Dia 9: benchmark sectorial.
- Dia 14: cierre util.

#### Dia 0 - entrega

Asunto: `Tu diagnostico de absentismo`

Cuerpo:

Hola {{nombre}},

Aqui tienes tu informe de fuga de capacidad por absentismo:

{{enlace_informe}}

Mi recomendacion: mira primero la seccion "Tu fuga principal". Es la parte que suele separar un problema de volumen de un problema de coste.

Un saludo,
{{firma}}

#### Dia 2 - coste

Asunto: `El coste no suele estar donde parece`

Cuerpo:

Hola {{nombre}},

Un matiz importante sobre tu diagnostico: muchas empresas cuentan dias de ausencia, pero no traducen esos dias a coste operativo.

La diferencia importa. Dos areas pueden tener el mismo absentismo y provocar impactos muy distintos si una obliga a pagar horas extra, mover turnos o retrasar servicio.

Si quieres revisarlo, empieza por esta formula:

horas perdidas x coste hora + sustituciones + sobrecarga + impacto en servicio.

{{enlace_informe}}

#### Dia 5 - causa

Asunto: `Una pista sobre las bajas`

Cuerpo:

Hola {{nombre}},

Cuando el absentismo se analiza como una sola cifra, casi siempre se actua tarde.

El informe de Chile que revisamos muestra un ejemplo claro: 32% de licencias por trastornos mentales y 18% por problemas musculo-esqueleticos. No se tratan igual, no se previenen igual y no se gestionan igual.

La pregunta util no es "cuanto absentismo tenemos?". Es "que patron se repite y en que equipos?".

{{enlace_informe}}

#### Dia 9 - benchmark

Asunto: `Una referencia para comparar`

Cuerpo:

Hola {{nombre}},

Para poner tu resultado en contexto: Randstad Research situa el absentismo en Espana en 7,1% de horas pactadas perdidas en 2025T4, con 5,5% por baja medica.

La media ayuda, pero no decide. Lo decisivo es compararte por tipo de trabajo, area y capacidad de sustitucion.

Por eso el informe separa coste, continuidad y momento de actuacion.

{{enlace_informe}}

#### Dia 14 - cierre util

Asunto: `Te dejo una pregunta`

Cuerpo:

Hola {{nombre}},

Te dejo una pregunta simple para cerrar el diagnostico:

Si el absentismo subiera un punto este ano, quien lo absorberia primero: margen, clientes, mandos o equipo?

La respuesta suele marcar donde empezar.

Si algun dia quieres contrastar tu resultado, aqui tienes el enlace:

{{enlace_agenda}}

Un saludo,
{{firma}}

## 7. Secuencia de email frio

### Cadencia

5 emails:

- Email 1: Dia 0.
- Email 2: Dia 3.
- Email 3: Dia 7.
- Email 4: Dia 12.
- Email 5: Dia 18.

El primero no vende. El ultimo tampoco. La secuencia funciona como una serie breve de observaciones ejecutivas.

### Asuntos

Email 1:

- `Absentismo en {{empresa}}`
- `Una fuga de capacidad`
- `Pregunta rapida, {{nombre}}`

Email 2:

- `Dias no es coste`
- `El dato que falta`
- `Coste oculto de ausencias`

Email 3:

- `Mandos tapando huecos`
- `Cuando falta alguien`
- `La carga invisible`

Email 4:

- `No todas las bajas pesan igual`
- `Patrones de absentismo`
- `Una lectura util`

Email 5:

- `Te dejo el diagnostico`
- `Por si te sirve`
- `Cierro con esto`

### Email 1 completo

Asunto: `Una fuga de capacidad`

Hola {{nombre}},

Revisando datos recientes de absentismo, hay una lectura que casi nunca aparece en los cuadros de mando: el problema no es solo cuanta gente falta, sino donde se convierte en coste.

Randstad situa el absentismo en Espana en el 7,1% de las horas pactadas, y la baja medica en el 5,5%. En algunos sectores el nivel supera el 10%.

Hemos preparado un diagnostico de 6 preguntas para ver si en una empresa el absentismo pesa mas en margen, mandos, clientes o equipo.

Se completa en 2 minutos:

{{enlace_diagnostico}}

No pide datos de empleados ni informacion medica.

Un saludo,
{{firma}}

### Angulo de cada email

Email 1: Insight macro. Introduce absentismo como fuga de capacidad, no como problema de RRHH.

Email 2: Coste invisible. Explica que contar dias no basta si no se traduce a euros, sustituciones y sobrecarga.

Email 3: Operacion. Habla de mandos tapando huecos y equipos absorbiendo trabajo.

Email 4: Causa. Introduce salud mental, fisico, turnos y clima como patrones distintos que no se resuelven con la misma medida.

Email 5: Cierre util. Deja el diagnostico como recurso, sin insistir en reunion.

## 8. Recomendacion de implementacion en el sistema actual

1. Cambiar el tema del funnel de "Talento+IA" a "Coste Oculto del Absentismo".
2. Sustituir las 8 preguntas actuales por las 6 anteriores.
3. Mantener la vista previa tras la pregunta 3.
4. Reducir captura a nombre + email de trabajo.
5. Eliminar empresa/telefono/cargo como campos visibles; si existen en base de datos, pasarlos ocultos por URL o webhook.
6. Recalcular resultados por 5 dimensiones:
   - Coste invisible.
   - Sobrecarga operativa.
   - Causa no segmentada.
   - Respuesta tardia.
   - Normalizacion del impacto.
7. Cambiar el CTA de agenda a "Revisar mis 3 palancas".
8. Mantener PDF, pero convertirlo en one-pager ejecutivo reenviable.
9. En Make, separar automatizaciones por:
   - completo y agenda,
   - completo y descarga,
   - completo y no agenda/no descarga,
   - abandono tras vista previa.

## 9. Principio rector

El usuario no debe sentir: "me estan vendiendo una solucion".

Debe sentir:

> "Acabo de ver algo de mi empresa que no estaba mirando bien."

Ese es el punto exacto donde el funnel deja de perseguir leads y empieza a crear demanda real.
