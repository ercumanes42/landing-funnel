import { Question } from './types';

export const APP_CONFIG = {
  CALENDLY_URL: "https://calendly.com/joaquingfs/diagnostico-ejecutivo-y-hoja-de-ruta",
  POST_ENDPOINT_URL: "https://hook.eu2.make.com/nz7fm8cbvtu1mng8xzrss5yu7239pscj",
  PRIVACY_POLICY_URL: "#",
  COOKIES_URL: "#"
};

export const DIMENSIONS = {
  D1: { label: "Súper Equipos Híbridos", weight: 0.22 },
  D2: { label: "Adaptación Acelerada", weight: 0.22 },
  D3: { label: "Cambio de Reglas", weight: 0.18 },
  D4: { label: "Sucesión", weight: 0.18 },
  T: { label: "Gobernanza IA", weight: 0.20 }
};

export const QUICK_WINS = {
  D1: "Definir 3 Indicadores de productividad por objetivos para eliminar la gestión por 'horas silla'.",
  D2: "Lanzar programa de 'Mentoría Inversa': Juniors enseñan uso de IA a Directivos.",
  D3: "Auditoría flash de Clima Laboral anónima para detectar 'zonas tóxicas' ocultas.",
  D4: "Mapa de talento: Identificar las 5 posiciones críticas sin sucesor y activar plan de continuidad.",
  T: "Crear un 'Semáforo de Datos': Definir qué información es segura subir a la IA y cuál es confidencial."
};

// Structured feedback based on score ranges
export const RISK_FEEDBACK = {
  D1: { // Equipos Híbridos
    low: {
      label: "Dependencia Presencial (Riesgo Crítico)",
      why: "Tu puntuación indica una cultura que aún equipara 'estar presente' con 'ser productivo'. Probablemente, la gestión se basa en la observación visual y no en objetivos claros.",
      missing: [
        "Faltan indicadores de resultados definidos y trazables que no dependan del horario.",
        "Se requiere establecer protocolos reales de comunicación asíncrona para evitar interrupciones.",
        "Es necesario construir una confianza estructural en la autogestión del empleado."
      ],
      consequence: "Riesgo inminente de fuga de talento joven y agotamiento en mandos medios por exceso de control digital."
    },
    medium: {
      label: "Fricción Híbrida (En Transición)",
      why: "Has adoptado las herramientas (videollamadas, chats) pero los procesos siguen siendo tradicionales. Existe una tensión donde se exige flexibilidad pero se premia la disponibilidad inmediata.",
      missing: [
        "Faltan rituales de alineación de equipos que no sean solo reuniones informativas.",
        "Se requiere documentar los procesos en abierto para no depender de preguntar a compañeros.",
        "Es necesario implementar un sistema de retroalimentación continua y estructurada."
      ],
      consequence: "Ineficiencia operativa, exceso de reuniones (reunionitis) y sensación de desconexión en empleados a distancia."
    },
    high: {
      label: "Cultura Híbrida Sólida",
      why: "Tu organización ha logrado desacoplar el trabajo del lugar físico. Los equipos operan con autonomía y alineación clara.",
      missing: [
        "Se podría mejorar optimizando los espacios físicos para 'momentos de verdad' y creatividad.",
        "Es recomendable reforzar las estrategias de desconexión digital proactiva."
      ],
      consequence: "Ventaja competitiva en atracción de talento global y resiliencia operativa ante cambios."
    }
  },
  D2: { // Adaptación Acelerada
    low: {
      label: "Resistencia Digital (Riesgo Crítico)",
      why: "La velocidad de aprendizaje de la organización es inferior a la del mercado. Probablemente, la tecnología se ve como un 'gasto' o 'problema técnico' y no como una palanca estratégica.",
      missing: [
        "Falta fomentar una mentalidad de experimentación rápida (probar y aprender).",
        "Se requiere asignar un presupuesto ágil para pruebas de concepto tecnológicas.",
        "Es necesario elevar la alfabetización digital en las capas directivas de la empresa."
      ],
      consequence: "Obsolescencia acelerada y pérdida de cuota de mercado frente a competidores más ágiles."
    },
    medium: {
      label: "Adopción Reactiva (En Transición)",
      why: "La organización implementa tecnología solo cuando es urgente o inevitable. Hay islas de innovación, pero no una cultura sistémica de cambio.",
      missing: [
        "Faltan procesos claros para escalar la innovación al resto de la empresa.",
        "Se requiere democratizar el acceso a herramientas digitales e Inteligencia Artificial.",
        "Es necesario alinear los incentivos (bonus, reconocimiento) al cambio y adopción tecnológica."
      ],
      consequence: "Oportunidades perdidas y costes elevados por implementaciones tardías y mal integradas."
    },
    high: {
      label: "Organización Ágil",
      why: "El cambio es parte del ADN de la empresa. La adopción tecnológica es proactiva y vista como una ventaja competitiva clave.",
      missing: [
        "Se podría mejorar la gobernanza de la innovación para evitar dispersión de esfuerzos.",
        "Es recomendable medir el impacto y retorno de inversión en tiempo real."
      ],
      consequence: "Alta capacidad de adaptación y giro ante disrupciones del mercado."
    }
  },
  D3: { // Cambio de Reglas (Clima/Cultura)
    low: {
      label: "Desconexión Cultural (Riesgo Crítico)",
      why: "Existe una brecha severa entre lo que la empresa dice ser y lo que los empleados viven. Es probable que existan zonas de liderazgo autoritario o falta de seguridad psicológica.",
      missing: [
        "Falta coherencia real entre los valores declarados y los comportamientos diarios.",
        "Se requiere crear seguridad psicológica para que los empleados puedan opinar sin miedo.",
        "Es necesario un reconocimiento real al empleado más allá del salario económico."
      ],
      consequence: "Alta rotación no deseada, renuncia silenciosa y deterioro de la imagen como empleador."
    },
    medium: {
      label: "Cultura Frágil (En Transición)",
      why: "El clima es aceptable en tiempos de calma, pero se quiebra bajo presión. Los empleados están satisfechos pero no necesariamente comprometidos a largo plazo.",
      missing: [
        "Falta definir un propósito compartido que sea inspirador para todos.",
        "Se requiere establecer rituales de conexión humana más profunda entre equipos.",
        "Es necesario desarrollar a los líderes para que actúen como entrenadores (coaches) de sus equipos."
      ],
      consequence: "Rendimiento promedio y vulnerabilidad ante ofertas agresivas de la competencia."
    },
    high: {
      label: "Cultura de Alto Rendimiento",
      why: "Existe un alto nivel de confianza y propósito compartido. La cultura atrae y retiene al talento por sí misma.",
      missing: [
        "Se podría mejorar la gestión de la diversidad de pensamiento en gran escala.",
        "Es recomendable prevenir el pensamiento grupal excesivo para mantener la innovación."
      ],
      consequence: "El equipo actúa como embajador de marca, reduciendo costes de contratación y venta."
    }
  },
  D4: { // Sucesión
    low: {
      label: "Vulnerabilidad de Liderazgo (Riesgo Crítico)",
      why: "El conocimiento crítico está concentrado en muy pocas personas. Si mañana faltan 2 o 3 líderes clave, la operación sufriría un impacto severo.",
      missing: [
        "Falta un mapa actualizado del talento crítico de la organización.",
        "Se requiere documentar planes de sucesión claros para puestos clave.",
        "Es necesario sistematizar la transferencia de conocimiento de los senior a los junior."
      ],
      consequence: "Crisis operativa ante bajas inesperadas y riesgo de depender excesivamente de personas específicas."
    },
    medium: {
      label: "Sucesión Informal (En Transición)",
      why: "Se intuye 'quién podría reemplazar a quién', pero no hay preparación formal. Los sucesores potenciales no están listos para asumir el rol hoy mismo.",
      missing: [
        "Falta activar planes de desarrollo individual para preparar a los sucesores.",
        "Se requiere exponer a los empleados de alto potencial a retos reales del negocio.",
        "Es necesario estructurar programas de mentoría cruzada entre áreas."
      ],
      consequence: "Tiempos de vacante prolongados y promociones internas fallidas."
    },
    high: {
      label: "Fábrica de Líderes",
      why: "La organización genera talento continuamente. Las salidas no son crisis, sino oportunidades de renovación natural.",
      missing: [
        "Se podría mejorar la rotación estratégica proactiva de líderes.",
        "Es recomendable planificar la sucesión para roles nuevos que aún no existen."
      ],
      consequence: "Continuidad del negocio garantizada y alta motivación por movilidad interna real."
    }
  },
  T: { // Gobernanza IA
    low: {
      label: "Exposición de Datos (Riesgo Crítico)",
      why: "El uso de Inteligencia Artificial y datos es caótico o inexistente. Es muy probable que los empleados estén usando herramientas gratuitas con datos sensibles sin control.",
      missing: [
        "Falta una política clara de uso aceptable de IA en la empresa.",
        "Se requiere proveer entornos seguros (privados) para experimentar con IA.",
        "Es necesario formar a la plantilla en privacidad de datos y uso de estas herramientas."
      ],
      consequence: "Fuga de propiedad intelectual, multas por protección de datos y decisiones automatizadas erróneas."
    },
    medium: {
      label: "Gobernanza Reactiva (En Transición)",
      why: "Existen normas básicas, pero frenan la innovación en lugar de habilitarla. 'Prohibir' es la estrategia principal en lugar de 'Educar'.",
      missing: [
        "Falta un comité de ética y gobierno de IA que sea ágil en la toma de decisiones.",
        "Se requiere crear un catálogo de casos de uso aprobados para guiar a los empleados.",
        "Es necesario realizar auditorías básicas de los algoritmos utilizados."
      ],
      consequence: "Uso oculto de herramientas no aprobadas y pérdida de productividad frente a competidores que sí usan IA."
    },
    high: {
      label: "Gobernanza Habilitadora",
      why: "La organización usa IA de forma masiva pero segura. Los datos son un activo estratégico protegido y activado.",
      missing: [
        "Se podría automatizar la gobernanza y control de calidad de datos.",
        "Es recomendable integrar la ética del dato desde el diseño de cualquier proyecto."
      ],
      consequence: "Escalabilidad exponencial segura y confianza del mercado."
    }
  }
};

export const METHODOLOGY_TEXT = "Este diagnóstico evalúa 5 dimensiones críticas para la sostenibilidad organizacional en 2026. La puntuación (0-100) resulta de ponderar tus respuestas sobre prácticas actuales vs mejores prácticas de mercado. 0-49 indica brechas sistémicas (Riesgo), 50-75 indica procesos en maduración (Transición), y 76-100 indica ventajas competitivas (Solidez).";

export const EXECUTIVE_SUMMARIES = {
  critical: "Con una Puntuación Global inferior a 40, tu organización opera bajo modelos tradicionales que ya no responden a la volatilidad actual. Los datos señalan una desconexión sistémica entre la estrategia y la ejecución operativa diaria.",
  transition: "Con una Puntuación Global entre 40 y 70, tu organización está modernizándose, pero 'a dos velocidades'. Algunas áreas avanzan mientras otras frenan el progreso, generando fricción interna y desgaste de recursos.",
  solid: "Con una Puntuación Global superior a 70, tu organización cuenta con una base operativa resiliente. El desafío ahora no es 'arreglar', sino 'optimizar' para mantener la delantera y evitar la burocratización del éxito."
};

export const WIZARD_STEPS: { title: string; questions: Question[] }[] = [
  {
    title: "Diagnóstico de Talento y Organización",
    questions: [
      { id: "q1", category: "D3", type: "likert", text: "Es difícil cubrir puestos clave con la velocidad y calidad necesarias." },
      { id: "q2", category: "D3", type: "likert", text: "La rotación no deseada está afectando la estabilidad, rendimiento o continuidad de los equipos." },
      { id: "q3", category: "D3", type: "likert", text: "Se detecta el clima, fatiga o desconexión a tiempo antes de que genere renuncias." },
      { id: "q4", category: "D1", type: "likert", text: "Los mandos medios mantienen el rendimiento y compromiso sin necesidad de control constante." },
      { id: "q5", category: "D2", type: "likert", text: "El aprendizaje y desarrollo se adapta rápidamente a los cambios del negocio." },
      { id: "q6", category: "T", type: "likert", text: "La IA se utiliza con criterios claros, seguridad y sin improvisación." },
      { id: "q7", category: "D4", type: "likert", text: "Se han identificado sucesores para los roles críticos de la organización." },
      { id: "q8", category: "D3", type: "likert", text: "La propuesta de valor de la empresa ayuda a atraer talento sin depender solo del salario." }
    ]
  },
  {
    title: "Resultado Preliminar",
    questions: [
      { id: "mini_result", category: "result", type: "mini_result", text: "", required: false }
    ]
  },
  {
    title: "¿Donde te enviamos tu informe privado?",
    questions: [
      {
        id: "company_size",
        text: "Tamaño de la Empresa",
        category: "context",
        type: "select",
        options: ["Pequeña (1-50 empleados)", "Mediana (51-250 empleados)", "Gran Empresa (+250 empleados)"],
        required: true
      },
      {
        id: "sector",
        text: "Sector principal",
        category: "context",
        type: "select",
        options: ["Retail", "Tecnología", "Industria", "Servicios", "Salud", "Educación", "Otros"],
        required: true
      },
      {
        id: "work_model",
        text: "Modelo de trabajo actual",
        category: "context",
        type: "select",
        options: ["Presencial 100%", "Híbrido", "Remoto 100%"],
        required: true
      },
      {
        id: "role",
        text: "Tu rol principal",
        category: "context",
        type: "select",
        options: ["Director/a General", "Director/a RRHH", "Gerente / Responsable", "Consultor / Otros"],
        required: true
      },
      {
        id: "firstname",
        text: "Nombre",
        category: "lead",
        type: "text",
        required: true
      },
      {
        id: "lastname",
        text: "Apellidos",
        category: "lead",
        type: "text",
        required: true
      },
      {
        id: "company",
        text: "Empresa",
        category: "lead",
        type: "text",
        required: true
      },
      {
        id: "email",
        text: "Email corporativo",
        category: "lead",
        type: "text",
        required: true
      },
      {
        id: "pain_point",
        text: "¿Qué te quita el sueño hoy?",
        category: "lead",
        type: "text",
        required: true,
        hint: "Ej: Incertidumbre sobre cómo aplicar IA, rotación alta..."
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