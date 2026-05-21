import { Question } from './types';

export const APP_CONFIG = {
  CALENDLY_URL: "https://calendly.com/joaquingfs/diagnostico-ejecutivo-y-hoja-de-ruta",
  POST_ENDPOINT_URL: import.meta.env.VITE_MAKE_WEBHOOK_URL || "https://hook.eu2.make.com/xvz6o3714r7e5x14t6j28sgovr29mjmr",
  PRIVACY_POLICY_URL: "#",
  COOKIES_URL: "#"
};

export const STORAGE_KEY = "talento_fuga_state";

export const DIMENSIONS = {
  D1: { label: "Liderazgo y mandos medios", weight: 0.22 },
  D2: { label: "Aprendizaje y adaptación", weight: 0.22 },
  D3: { label: "Atracción, clima y fuga de talento", weight: 0.18 },
  D4: { label: "Sucesión de roles críticos", weight: 0.18 },
  T: { label: "Colaboración generacional", weight: 0.20 }
};

export const QUICK_WINS = {
  D1: "Revisar con los mandos dónde se está compensando la falta de liderazgo con control, urgencias o reuniones de seguimiento.",
  D2: "Detectar qué habilidades nuevas necesita el negocio en los próximos 90 días y convertirlas en una ruta de aprendizaje concreta.",
  D3: "Cruzar rotación, dificultad de contratación y señales de clima para localizar el primer punto de fuga de talento.",
  D4: "Identificar los 5 roles cuya salida frenaría más la operación y asignar sucesores o planes de cobertura realistas.",
  T: "Crear una dinámica de colaboración entre talento joven y senior para transferir conocimiento sin choques de ritmo, estilo o expectativas."
};

export const RISK_FEEDBACK = {
  D1: {
    low: {
      label: "Mandos sólidos",
      why: "Los mandos sostienen rendimiento y compromiso sin depender de control constante.",
      missing: ["Mantener rutinas de feedback y desarrollo para no volver al modo reactivo."],
      consequence: "Equipos más autónomos y menos riesgo de fuga por mala gestión directa."
    },
    medium: {
      label: "Liderazgo tensionado",
      why: "Hay mandos que funcionan, pero el rendimiento depende demasiado de personas concretas.",
      missing: ["Falta un estándar común de gestión, feedback y seguimiento."],
      consequence: "La calidad del liderazgo varía por equipo y puede empujar salidas evitables."
    },
    high: {
      label: "Riesgo por mando directo",
      why: "El sistema necesita demasiado control para sostener compromiso y rendimiento.",
      missing: ["No hay hábitos claros de liderazgo, escucha ni resolución temprana."],
      consequence: "La fuga puede aparecer como problema de salario cuando en realidad nace en la experiencia diaria."
    }
  },
  D2: {
    low: {
      label: "Aprendizaje vivo",
      why: "La empresa adapta capacidades con rapidez cuando cambia el negocio.",
      missing: ["Conectar el aprendizaje con objetivos de negocio medibles."],
      consequence: "Mayor empleabilidad interna y menos necesidad de reemplazar talento."
    },
    medium: {
      label: "Adaptación irregular",
      why: "Algunas áreas aprenden rápido, otras llegan tarde o dependen de iniciativas aisladas.",
      missing: ["Falta priorizar habilidades críticas y responsables de ejecución."],
      consequence: "El talento con más ambición puede buscar fuera el desarrollo que no ve dentro."
    },
    high: {
      label: "Desarrollo bloqueado",
      why: "El aprendizaje no está siguiendo la velocidad del negocio.",
      missing: ["No existe una ruta clara de upskilling ligada a roles críticos."],
      consequence: "Aumenta la desconexión, la obsolescencia y el coste de sustitución."
    }
  },
  D3: {
    low: {
      label: "Atracción y clima fuertes",
      why: "La propuesta de valor sostiene atracción, permanencia y compromiso.",
      missing: ["Seguir midiendo señales tempranas para no esperar a las renuncias."],
      consequence: "Mejor posición para competir por talento sin depender solo de salario."
    },
    medium: {
      label: "Fuga latente",
      why: "Hay señales de rotación, clima o atracción que todavía no están completamente conectadas.",
      missing: ["Falta unir datos de contratación, permanencia y percepción del equipo."],
      consequence: "La empresa puede enterarse tarde de por qué se marchan perfiles valiosos."
    },
    high: {
      label: "Fuga activa de talento",
      why: "La pérdida de talento o la dificultad de atraerlo ya amenaza estabilidad y continuidad.",
      missing: ["No se está leyendo a tiempo la combinación de clima, carrera, salario percibido y propuesta de valor."],
      consequence: "Más coste de reemplazo, pérdida de conocimiento y presión sobre los equipos que se quedan."
    }
  },
  D4: {
    low: {
      label: "Sucesión preparada",
      why: "Los roles críticos tienen cobertura razonable y alternativas visibles.",
      missing: ["Actualizar el mapa de sucesión cuando cambie la estrategia."],
      consequence: "Menor dependencia de personas irremplazables."
    },
    medium: {
      label: "Cobertura parcial",
      why: "Algunos puestos clave tienen sucesores, otros dependen de improvisación.",
      missing: ["Falta ordenar roles críticos por impacto y urgencia."],
      consequence: "Una salida puntual puede convertirse en bloqueo operativo."
    },
    high: {
      label: "Dependencia crítica",
      why: "La organización depende demasiado de personas concretas sin plan de relevo.",
      missing: ["No hay sucesores preparados ni transferencia de conocimiento suficiente."],
      consequence: "La fuga de un perfil clave puede frenar proyectos, clientes o decisiones."
    }
  },
  T: {
    low: {
      label: "Colaboración fluida",
      why: "Las generaciones colaboran con respeto, aprendizaje mutuo y roles claros.",
      missing: ["Convertir esas buenas prácticas en hábitos replicables por equipo."],
      consequence: "Mejor transferencia de conocimiento y menos fricción cultural."
    },
    medium: {
      label: "Silos generacionales",
      why: "Hay colaboración, pero todavía aparecen distancias entre perfiles jóvenes y senior.",
      missing: ["Faltan espacios donde ambas generaciones dependan una de otra para lograr resultados."],
      consequence: "Se pierde aprendizaje cruzado y aumenta la sensación de desconexión."
    },
    high: {
      label: "Fricción generacional",
      why: "Las diferencias de ritmo, comunicación o expectativas generan tensión en los equipos.",
      missing: ["No hay acuerdos claros de colaboración, mentoría o transferencia de conocimiento."],
      consequence: "Puede aumentar la fuga de talento joven, la resistencia senior y el desgaste de mandos."
    }
  }
};

export const METHODOLOGY_TEXT =
  "Este diagnóstico evalúa 5 focos de riesgo: liderazgo, aprendizaje, atracción/clima/fuga de talento, sucesión y colaboración generacional. La sumatoria de fricción agrega las 8 respuestas del radar en una escala de 8 a 40. La puntuación 0-100 convierte esa fricción en salud organizativa: 0-39 indica exposición alta, 40-69 exposición media y 70-100 exposición baja.";

export const EXECUTIVE_SUMMARIES = {
  critical: "Tu organización muestra señales fuertes de fuga de talento o fricción interna. Conviene actuar antes de que el coste aparezca como rotación, pérdida de conocimiento o bloqueo de roles críticos.",
  transition: "Tu organización tiene parte del riesgo visible, pero aún hay zonas grises en liderazgo, clima, sucesión o adaptación que pueden acelerar la fuga si no se priorizan.",
  solid: "Tu organización muestra una base saludable. El foco ahora es anticipar desviaciones, reforzar sucesión y convertir la propuesta de valor en ventaja sostenida."
};

export const LIKERT_LABELS = [
  "No ocurre",
  "Ocurre poco",
  "Ocurre parcialmente",
  "Ocurre frecuentemente",
  "Ocurre mucho"
];

export const WIZARD_STEPS: { title: string; subtitle?: string; questions: Question[] }[] = [
  {
    title: "Radar ejecutivo de fuga de talento",
    subtitle: "Marca del 1 al 5. 1 = no ocurre. 5 = ocurre mucho.",
    questions: [
      {
        id: "q1",
        category: "D3",
        type: "likert",
        text: "Nos cuesta encontrar candidatos adecuados para puestos clave."
      },
      {
        id: "q2",
        category: "D3",
        type: "likert",
        text: "La rotación no deseada afecta al equipo."
      },
      {
        id: "q3",
        category: "D3",
        type: "likert",
        text: "Detectamos tarde señales de cansancio, mal clima o desconexión."
      },
      {
        id: "q4",
        category: "D1",
        type: "likert",
        text: "Los líderes tienen que hacer demasiado micromanagement para que el trabajo salga."
      },
      {
        id: "q5",
        category: "D2",
        type: "likert",
        text: "El equipo aprende tarde las habilidades que el negocio necesita."
      },
      {
        id: "q6",
        category: "T",
        type: "likert",
        text: "Hay choque entre talento joven y senior."
      },
      {
        id: "q7",
        category: "D4",
        type: "likert",
        text: "Faltan sucesores para roles críticos."
      },
      {
        id: "q8",
        category: "D3",
        type: "likert",
        text: "Dependéis demasiado del salario para atraer talento."
      }
    ]
  },
  {
    title: "¿Dónde enviamos tu informe privado?",
    subtitle: "Déjanos tu nombre y email corporativo para ver el resultado completo y recibir una copia privada.",
    questions: [
      {
        id: "firstname",
        text: "Nombre",
        hint: "Solo tu nombre, sin apellidos.",
        category: "lead",
        type: "text",
        required: true
      },
      {
        id: "email",
        text: "Email corporativo",
        hint: "Sin llamadas automáticas ni spam.",
        category: "lead",
        type: "text",
        required: true
      },
      {
        id: "consent",
        text: "Acepto recibir mi diagnóstico y un email de seguimiento relacionado con este resultado.",
        category: "lead",
        type: "boolean",
        required: true
      }
    ]
  }
];
