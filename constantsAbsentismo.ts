import { Question } from './types';

export const APP_CONFIG = {
  CALENDLY_URL: "https://calendly.com/joaquingfs/diagnostico-ejecutivo-y-hoja-de-ruta",
  POST_ENDPOINT_URL: import.meta.env.VITE_MAKE_WEBHOOK_URL || "https://hook.eu2.make.com/bvsqarrcivpds6dcri5m4yy4h68jrv36",
  PRIVACY_POLICY_URL: "#",
  COOKIES_URL: "#"
};

export const STORAGE_KEY = "absentismo_state";

export const DIMENSIONS = {
  D1: { label: "Coste invisible", weight: 0.25 },
  D2: { label: "Sobrecarga operativa", weight: 0.22 },
  D3: { label: "Causa no segmentada", weight: 0.18 },
  D4: { label: "Respuesta tardía", weight: 0.20 },
  T: { label: "Impacto normalizado", weight: 0.15 }
};

export const QUICK_WINS = {
  D1: "Traducir las ausencias de los últimos 90 días a euros: horas perdidas, sustituciones, horas extra y retrasos.",
  D2: "Detectar qué mandos o equipos absorben más huecos y separar baja puntual de cuello operativo recurrente.",
  D3: "Agrupar las ausencias por patrón visible: cansancio, salud física, conflictos, turnos o picos de carga.",
  D4: "Definir una acción temprana en la primera semana para evitar que una baja corta se convierta en problema largo.",
  T: "Calcular qué pasaría si el absentismo sube 1 punto: margen, servicio, mandos o equipo."
};

export const RISK_FEEDBACK = {
  D1: {
    low: {
      label: "Coste invisible",
      why: "La empresa nota el absentismo, pero todavía no lo traduce a impacto económico por área.",
      missing: [
        "Falta convertir días perdidos en horas y euros.",
        "Falta separar coste directo de sustituciones, horas extra y retrasos.",
        "Falta una lectura que pueda entender Dirección o Finanzas sin entrar en detalle de RRHH."
      ],
      consequence: "Se toman medidas con buena intención, pero sin saber qué fuga económica se quiere cerrar."
    },
    medium: {
      label: "Coste parcialmente visible",
      why: "Existen datos, pero no siempre se conectan con coste operativo o margen.",
      missing: [
        "Falta una fórmula común para comparar áreas.",
        "Falta priorizar por coste, no solo por volumen de ausencias."
      ],
      consequence: "El absentismo parece controlado hasta que tensiona presupuesto, servicio o productividad."
    },
    high: {
      label: "Coste trazable",
      why: "La empresa puede explicar dónde se convierte el absentismo en coste y decidir con datos.",
      missing: [
        "Conviene revisar el benchmark por sector y unidad para detectar desviaciones tempranas."
      ],
      consequence: "Mejor capacidad para priorizar acciones y defender inversiones con criterio financiero."
    }
  },
  D2: {
    low: {
      label: "Sobrecarga operativa",
      why: "Las ausencias se absorben moviendo tareas, turnos o mandos, lo que oculta el coste real.",
      missing: [
        "Falta visibilidad de quién tapa los huecos.",
        "Falta un criterio de sustitución por criticidad del puesto.",
        "Falta medir el impacto en calidad, servicio y carga del equipo."
      ],
      consequence: "La empresa funciona, pero a costa de cansancio, errores y pérdida de continuidad."
    },
    medium: {
      label: "Continuidad frágil",
      why: "Hay respuesta operativa, pero depende demasiado de personas concretas o decisiones ad hoc.",
      missing: [
        "Falta estandarizar coberturas para roles críticos.",
        "Falta anticipar picos de ausencia por área."
      ],
      consequence: "El sistema aguanta mientras la carga sea moderada; con un pico, se rompe."
    },
    high: {
      label: "Continuidad controlada",
      why: "La empresa tiene mecanismos para cubrir ausencias sin castigar siempre a los mismos equipos.",
      missing: [
        "Conviene monitorizar si la cobertura está generando coste oculto en mandos."
      ],
      consequence: "Menor deterioro de servicio y menor riesgo de desgaste acumulado."
    }
  },
  D3: {
    low: {
      label: "Causa no segmentada",
      why: "El absentismo se mira como una cifra única, aunque las causas requieren respuestas distintas.",
      missing: [
        "Falta separar patrones de cansancio, salud física, clima y organización del trabajo.",
        "Falta detectar áreas donde se repiten los mismos síntomas.",
        "Falta conectar causas con acciones concretas."
      ],
      consequence: "Se lanzan medidas generales que no atacan el motor real del problema."
    },
    medium: {
      label: "Patrones incompletos",
      why: "La empresa intuye causas, pero no siempre las cruza con área, turno o recurrencia.",
      missing: [
        "Falta una lectura 80/20 de los focos más repetidos.",
        "Falta revisar si el patrón cambia por tipo de trabajo."
      ],
      consequence: "La respuesta mejora, pero puede quedarse demasiado genérica."
    },
    high: {
      label: "Patrones claros",
      why: "La empresa entiende que no todas las ausencias pesan igual ni se resuelven igual.",
      missing: [
        "Conviene reforzar alertas tempranas por patrón y unidad."
      ],
      consequence: "Mejor capacidad para actuar antes de que el problema se cronifique."
    }
  },
  D4: {
    low: {
      label: "Respuesta tardía",
      why: "La actuación llega cuando la ausencia ya afecta al equipo, al mando o al retorno.",
      missing: [
        "Falta una acción clara durante la primera semana.",
        "Falta coordinar expectativas entre empresa, mando y persona.",
        "Falta preparar el retorno antes de que se produzca."
      ],
      consequence: "Las bajas tienden a alargarse o a volver como reincidencias operativas."
    },
    medium: {
      label: "Respuesta reactiva",
      why: "Hay seguimiento, pero suele activarse cuando ya existe fricción.",
      missing: [
        "Falta definir hitos tempranos.",
        "Falta separar casos simples de casos con riesgo de alargarse."
      ],
      consequence: "Se evita parte del daño, pero se pierde margen de prevención."
    },
    high: {
      label: "Respuesta temprana",
      why: "La empresa actúa pronto sin presionar ni improvisar.",
      missing: [
        "Conviene medir si la respuesta temprana reduce duración y recurrencia."
      ],
      consequence: "Menor duración media y menor sobrecarga del equipo."
    }
  },
  T: {
    low: {
      label: "Impacto normalizado",
      why: "La empresa se ha acostumbrado a absorber el absentismo como parte del día a día.",
      missing: [
        "Falta calcular el escenario de +1 punto de absentismo.",
        "Falta identificar quién absorbe primero el impacto.",
        "Falta elevar el dato a decisión ejecutiva."
      ],
      consequence: "El coste se paga en margen, servicio o cansancio antes de aparecer en un informe."
    },
    medium: {
      label: "Impacto parcialmente asumido",
      why: "El impacto se reconoce, pero no siempre se convierte en una decisión prioritaria.",
      missing: [
        "Falta vincular absentismo con capacidad real.",
        "Falta anticipar el impacto de un empeoramiento."
      ],
      consequence: "El problema compite mal por presupuesto hasta que ya es visible."
    },
    high: {
      label: "Impacto gestionado",
      why: "La empresa entiende que el absentismo es capacidad, coste y continuidad.",
      missing: [
        "Conviene mantener un escenario trimestral de riesgo."
      ],
      consequence: "Mejor reacción ante picos y mejor defensa de acciones preventivas."
    }
  }
};

export const METHODOLOGY_TEXT =
  "Este diagnóstico evalúa 5 focos ejecutivos del absentismo: coste invisible, sobrecarga operativa, causa no segmentada, respuesta tardía e impacto normalizado. La puntuación 0-100 mide capacidad de gestión: 0-39 indica exposición alta, 40-69 exposición media y 70-100 exposición baja.";

export const EXECUTIVE_SUMMARIES = {
  critical: "Tu diagnóstico apunta a una fuga de capacidad que probablemente se está absorbiendo con margen, mandos o cansancio del equipo. El primer paso no es lanzar más medidas, sino ver dónde se convierte en coste.",
  transition: "Tu empresa tiene parte del problema visible, pero aún hay zonas grises: coste por área, causas repetidas o momento de actuación. Ahí suele estar la oportunidad de mejora.",
  solid: "Tu empresa muestra una base razonable de control. El foco ahora es anticipar desviaciones, comparar por unidad y evitar que el absentismo se normalice como coste operativo."
};

export const WIZARD_STEPS: { title: string; subtitle?: string; questions: Question[] }[] = [
  {
    title: "Primero, dónde se nota",
    subtitle: "Elige la respuesta que más se parece a vuestra realidad.",
    questions: [
      {
        id: "q1",
        category: "D2",
        type: "select",
        text: "¿Cuándo alguien falta al trabajo, dónde se nota primero?",
        options: [
          "En operaciones: hay que mover turnos o tareas",
          "En los mandos: acaban tapando huecos",
          "En clientes: bajan tiempos, calidad o servicio",
          "En el equipo: se reparte la carga y se tensa",
          "Hoy no parece un problema serio"
        ]
      }
    ]
  },
  {
    title: "Continuidad",
    subtitle: "Una baja corta y una baja larga no rompen lo mismo.",
    questions: [
      {
        id: "q2",
        category: "D2",
        type: "select",
        text: "¿Cuando una baja se alarga, qué suele pasar en la práctica?",
        options: [
          "Tenemos sustitución clara y funciona",
          "Tiramos de compañeros hasta que vuelva",
          "Se acumula trabajo y luego hay que recuperarlo",
          "Depende demasiado del jefe directo",
          "No lo vemos hasta que ya molesta"
        ]
      }
    ]
  },
  {
    title: "Coste",
    subtitle: "Aquí suele aparecer la primera brecha real.",
    questions: [
      {
        id: "q3",
        category: "D1",
        type: "select",
        text: "¿Tenéis claro cuánto os cuestan esas ausencias?",
        options: [
          "Sí: lo vemos en euros y por área",
          "Vemos días perdidos, pero no euros",
          "Sabemos que duele, pero no cuánto",
          "Solo lo miramos cuando hay una crisis",
          "No tenemos un dato fiable"
        ]
      }
    ]
  },
  {
    title: "Primer patrón detectado",
    subtitle: "Vista previa antes de completar el diagnóstico.",
    questions: [
      { id: "mini_result", category: "result", type: "mini_result", text: "", required: false }
    ]
  },
  {
    title: "Causa probable",
    subtitle: "No todas las ausencias piden la misma respuesta.",
    questions: [
      {
        id: "q4",
        category: "D3",
        type: "select",
        text: "¿Qué motivo crees que hay detrás de esas bajas?",
        options: [
          "Cansancio, estrés o saturación",
          "Dolor físico, lesiones o problemas de salud",
          "Mal ambiente, jefes o conflictos",
          "Picos de carga, turnos o mala organización",
          "No vemos un patrón claro"
        ]
      }
    ]
  },
  {
    title: "Momento de actuación",
    subtitle: "El tiempo de respuesta cambia mucho el impacto.",
    questions: [
      {
        id: "q5",
        category: "D4",
        type: "select",
        text: "¿En qué momento soléis actuar?",
        options: [
          "Antes de que la baja se alargue",
          "En la primera semana",
          "Cuando ya afecta al equipo",
          "Cuando el mando pide ayuda",
          "Cuando la persona vuelve"
        ]
      }
    ]
  },
  {
    title: "Escenario ejecutivo",
    subtitle: "La pregunta que convierte absentismo en decisión.",
    questions: [
      {
        id: "q6",
        category: "T",
        type: "select",
        text: "¿Si el absentismo sube este año en la empresa, qué pasaría?",
        options: [
          "Se notaría en margen o costes",
          "Se notaría en clientes o servicio",
          "Se notaría en el cansancio del equipo",
          "Lo absorberíamos como siempre",
          "No lo hemos calculado"
        ]
      }
    ]
  },
  {
    title: "Tu diagnóstico ya está listo",
    subtitle: "Te mostramos el resultado ahora y te enviamos una copia para revisarla o reenviarla internamente.",
    questions: [
      {
        id: "firstname",
        text: "¿Cuál es tu nombre? *",
        hint: "Solo tu nombre, sin apellidos.",
        category: "lead",
        type: "text",
        required: true
      },
      {
        id: "email",
        text: "¿A qué email enviamos el informe? *",
        hint: "Sin llamadas automáticas ni spam.",
        category: "lead",
        type: "text",
        required: true
      }
    ]
  }
];
