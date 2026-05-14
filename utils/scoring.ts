import { DIMENSIONS, QUICK_WINS } from "../constants";
import { AnswerValue, ResultData } from "../types";

const OPTION_SCORES: Record<string, Record<string, number>> = {
  q1: {
    "Hoy no parece un problema serio": 82,
    "En operaciones: hay que mover turnos o tareas": 45,
    "En clientes: bajan tiempos, calidad o servicio": 38,
    "En los mandos: acaban tapando huecos": 32,
    "En el equipo: se reparte la carga y se tensa": 30
  },
  q2: {
    "Tenemos sustitución clara y funciona": 88,
    "Tiramos de compañeros hasta que vuelva": 42,
    "Se acumula trabajo y luego hay que recuperarlo": 35,
    "Depende demasiado del jefe directo": 30,
    "No lo vemos hasta que ya molesta": 22
  },
  q3: {
    "Sí: lo vemos en euros y por área": 90,
    "Vemos días perdidos, pero no euros": 55,
    "Sabemos que duele, pero no cuánto": 38,
    "Solo lo miramos cuando hay una crisis": 28,
    "No tenemos un dato fiable": 20
  },
  q4: {
    "Cansancio, estrés o saturación": 42,
    "Dolor físico, lesiones o problemas de salud": 50,
    "Mal ambiente, jefes o conflictos": 35,
    "Picos de carga, turnos o mala organización": 38,
    "No vemos un patrón claro": 22
  },
  q5: {
    "Antes de que la baja se alargue": 90,
    "En la primera semana": 78,
    "Cuando ya afecta al equipo": 42,
    "Cuando el mando pide ayuda": 36,
    "Cuando la persona vuelve": 24
  },
  q6: {
    "Se notaría en margen o costes": 48,
    "Se notaría en clientes o servicio": 42,
    "Se notaría en el cansancio del equipo": 36,
    "Lo absorberíamos como siempre": 28,
    "No lo hemos calculado": 20
  }
};

const RED_FLAGS: Record<string, string[]> = {
  q3: ["No tenemos un dato fiable", "Solo lo miramos cuando hay una crisis"],
  q2: ["No lo vemos hasta que ya molesta"],
  q6: ["No lo hemos calculado"]
};

const PATTERNS = [
  {
    name: "Ceguera Financiera",
    condition: (res: ResultData) => res.dimensionScores.find(d => d.id === "D1")!.score < 40 && res.dimensionScores.find(d => d.id === "D2")!.score < 50,
    description: "La empresa sufre una sobrecarga operativa crítica pero no tiene visibilidad del coste económico. Esto impide que la dirección asigne presupuesto para soluciones reales."
  },
  {
    name: "Fragilidad Operativa",
    condition: (res: ResultData) => res.dimensionScores.find(d => d.id === "D2")!.score < 40 && res.dimensionScores.find(d => d.id === "D4")!.score < 50,
    description: "Hay una dependencia peligrosa de personas clave para cubrir huecos y la respuesta es reactiva. Un pico de bajas podría colapsar el servicio."
  },
  {
    name: "Desconexión de Liderazgo",
    condition: (res: ResultData) => res.dimensionScores.find(d => d.id === "D3")!.score < 40 && res.dimensionScores.find(d => d.id === "T")!.score < 40,
    description: "El absentismo se ha normalizado como un 'coste fijo' y no se analizan las causas. Hay un riesgo alto de que el clima laboral degrade la productividad."
  }
];

const MATURITY_LEVELS = [
  {
ScoreMax: 40,
    level: "Nivel 1: Reactivo",
    description: "El absentismo es gestionado como una emergencia diaria. Se apagan fuegos y se acepta la pérdida de capacidad como inevitable.",
    nextStep: "Siguiente paso: Implementar la medición de costes reales por área para convertir el problema en un dato financiero."
  },
  {
    ScoreMax: 70,
    level: "Nivel 2: Controlado",
    description: "Existe visibilidad del problema y se han implementado algunas medidas, pero la respuesta sigue siendo fragmentaria y dependiente de la voluntad del mando.",
    nextStep: "Siguiente paso: Segmentar las causas por patrón y horario para aplicar soluciones quirúrgicas en lugar de generales."
  },
  {
    ScoreMax: 101,
    level: "Nivel 3: Optimizado",
    description: "La empresa tiene una cultura de prevención y respuesta temprana. El absentismo se monitoriza como un KPI de eficiencia operativa.",
    nextStep: "Siguiente paso: Refinar la analítica predictiva para anticipar picos de demanda y ajustar la capacidad antes de que aparezca la tensión."
  }
];

const QUESTION_MAPPING: Record<string, string[]> = {
  D1: ["q3"],
  D2: ["q1", "q2"],
  D3: ["q4"],
  D4: ["q5"],
  T: ["q6"]
};

const getQuestionScore = (questionId: string, value: AnswerValue): number | null => {
  if (typeof value === "number") {
    return Math.round(((value - 1) / 4) * 100);
  }

  if (typeof value === "string") {
    return OPTION_SCORES[questionId]?.[value] ?? null;
  }

  return null;
};

export const calculateResults = (answers: Record<string, AnswerValue>): ResultData => {
  const getDimensionScore = (dimKey: string): number => {
    const questionIds = QUESTION_MAPPING[dimKey] || [];
    const scores = questionIds
      .map((id) => getQuestionScore(id, answers[id]))
      .filter((score): score is number => typeof score === "number");

    if (scores.length === 0) return 100;

    let average = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    // Aplicar Red Flags: si alguna respuesta es crítica, penalizamos la dimensión
    questionIds.forEach(id => {
      const ans = answers[id];
      if (typeof ans === 'string' && RED_FLAGS[id]?.includes(ans)) {
        average = Math.min(average, 30); // Fuerza a riesgo alto
      }
    });

    return Math.round(average);
  };

  const scores = Object.entries(DIMENSIONS).map(([key, config]) => ({
    id: key,
    label: config.label,
    score: getDimensionScore(key),
    color: "#0F766E"
  }));

  let weightedSum = 0;
  let totalWeight = 0;

  scores.forEach((score) => {
    const questionIds = QUESTION_MAPPING[score.id] || [];
    const hasAnsweredDimension = questionIds.some((id) => answers[id] !== undefined && answers[id] !== null);

    if (hasAnsweredDimension) {
      const weight = DIMENSIONS[score.id as keyof typeof DIMENSIONS].weight;
      weightedSum += score.score * weight;
      totalWeight += weight;
    }
  });

  const globalScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  const answeredScores = scores.filter((score) => {
    const questionIds = QUESTION_MAPPING[score.id] || [];
    return questionIds.some((id) => answers[id] !== undefined && answers[id] !== null);
  });

  const sortedByScore = [...(answeredScores.length ? answeredScores : scores)].sort((a, b) => a.score - b.score);

  const topRisks = sortedByScore.slice(0, 3).map((score) => ({
    dimension: score.id,
    score: score.score
  }));

  const suggestedWins = sortedByScore
    .slice(0, 3)
    .map((score) => QUICK_WINS[score.id as keyof typeof QUICK_WINS])
    .filter(Boolean);

  const tempResults: ResultData = {
    globalScore,
    dimensionScores: scores,
    topRisks,
    quickWins: suggestedWins,
    maturityLevel: { level: "", description: "", nextStep: "" },
    patterns: []
  };

  // Calcular Nivel de Madurez
  const maturity = MATURITY_LEVELS.find(l => globalScore <= l.ScoreMax)!;
  tempResults.maturityLevel = {
    level: maturity.level,
    description: maturity.description,
    nextStep: maturity.nextStep
  };

  // Detectar Patrones
  tempResults.patterns = PATTERNS.filter(p => p.condition(tempResults));

  return tempResults;
};
