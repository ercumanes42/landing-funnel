import { DIMENSIONS, QUICK_WINS } from "../constants";
import { AnswerValue, ResultData } from "../types";

const OPTION_SCORES: Record<string, Record<string, number>> = {
  q1: {
    "Es excepcional: casi nadie se va": 95,
    "Es controlada: algunos casos puntuales": 70,
    "Es preocupante: hemos perdido a varios clave": 35,
    "Es crítica: estamos sangrando talento": 10
  },
  q2: {
    "No, los jóvenes suelen quedarse al menos 3 años": 90,
    "1-2 casos puntuales": 65,
    "3-5 casos (empieza a ser un patrón)": 35,
    "Más de 5 casos (estamos perdiendo inversión en formación joven)": 15
  }
};

const RED_FLAG_THRESHOLDS: Record<string, number> = {
  q1: 4,
  q2: 4,
  q3: 4,
  q4: 4,
  q5: 4,
  q6: 4,
  q7: 4,
  q8: 4
};

const PATTERNS = [
  {
    name: "Fuga de talento por clima y propuesta de valor",
    condition: (res: ResultData) => res.dimensionScores.find(d => d.id === "D3")!.score < 45,
    description: "El principal riesgo parece estar en la combinación de atracción, rotación, clima y promesa interna."
  },
  {
    name: "Mandos sosteniendo demasiado peso",
    condition: (res: ResultData) => res.dimensionScores.find(d => d.id === "D1")!.score < 45,
    description: "El rendimiento depende demasiado de control o esfuerzo del mando, una señal que suele preceder desgaste y salidas evitables."
  },
  {
    name: "Dependencia de roles críticos",
    condition: (res: ResultData) => res.dimensionScores.find(d => d.id === "D4")!.score < 45,
    description: "La organización puede tener perfiles difíciles de reemplazar sin sucesión ni transferencia suficiente."
  },
  {
    name: "Adaptación más lenta que el negocio",
    condition: (res: ResultData) => res.dimensionScores.find(d => d.id === "D2")!.score < 45,
    description: "El desarrollo interno no parece estar cerrando la brecha de capacidades con suficiente velocidad."
  },
  {
    name: "Fricción generacional",
    condition: (res: ResultData) => res.dimensionScores.find(d => d.id === "T")!.score < 45,
    description: "Puede haber choque entre talento joven y senior, con pérdida de aprendizaje cruzado y más presión sobre los mandos."
  }
];

const MATURITY_LEVELS = [
  {
    ScoreMax: 40,
    level: "Nivel 1: Exposición alta",
    description: "Hay señales de fuga o fricción con impacto potencial en talento clave, liderazgo, continuidad o adaptación.",
    nextStep: "Siguiente paso: ordenar las 3 áreas de riesgo y decidir qué dato revisar esta semana antes de lanzar iniciativas."
  },
  {
    ScoreMax: 70,
    level: "Nivel 2: Riesgo en transición",
    description: "La organización funciona, pero hay zonas de tensión que pueden convertirse en rotación o pérdida de capacidad si no se priorizan.",
    nextStep: "Siguiente paso: elegir una palanca principal y convertirla en una hoja de ruta de 30-60 días."
  },
  {
    ScoreMax: 101,
    level: "Nivel 3: Base saludable",
    description: "La organización muestra señales positivas de control, pero aún conviene blindar roles críticos y anticipar desconexión.",
    nextStep: "Siguiente paso: reforzar prevención, sucesión y aprendizaje para que la ventaja no dependa de personas aisladas."
  }
];

const QUESTION_MAPPING: Record<string, string[]> = {
  D1: ["q4"],
  D2: ["q5"],
  D3: ["q1", "q2", "q3", "q8"],
  D4: ["q7"],
  T: ["q6"]
};

const QUESTION_IDS = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"];

const getQuestionScore = (questionId: string, value: AnswerValue): number | null => {
  if (typeof value === "number") {
    return Math.round(100 - ((value - 1) / 4) * 100);
  }

  if (typeof value === "string") {
    return OPTION_SCORES[questionId]?.[value] ?? null;
  }

  return null;
};

export const calculateResults = (answers: Record<string, AnswerValue>): ResultData => {
  const answeredQuestionValues = QUESTION_IDS
    .map((id) => answers[id])
    .filter((value): value is number => typeof value === "number");
  const answeredCount = answeredQuestionValues.length;
  const rawTotal = answeredQuestionValues.reduce((sum, value) => sum + value, 0);
  const minRawTotal = answeredCount;
  const maxRawTotal = answeredCount > 0 ? answeredCount * 5 : QUESTION_IDS.length * 5;
  const riskPercent = answeredCount > 0
    ? Math.round(((rawTotal - minRawTotal) / (maxRawTotal - minRawTotal)) * 100)
    : 0;
  const globalScore = answeredCount > 0 ? 100 - riskPercent : 0;

  const getDimensionScore = (dimKey: string): number => {
    const questionIds = QUESTION_MAPPING[dimKey] || [];
    const scores = questionIds
      .map((id) => getQuestionScore(id, answers[id]))
      .filter((score): score is number => typeof score === "number");

    if (scores.length === 0) return 100;

    let average = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    questionIds.forEach(id => {
      const ans = answers[id];
      if (typeof ans === "number" && ans >= (RED_FLAG_THRESHOLDS[id] || 99)) {
        average = Math.min(average, 35);
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
    rawTotal,
    maxRawTotal,
    answeredCount,
    riskPercent,
    dimensionScores: scores,
    topRisks,
    quickWins: suggestedWins,
    maturityLevel: { level: "", description: "", nextStep: "" },
    patterns: []
  };

  const maturity = MATURITY_LEVELS.find(l => globalScore <= l.ScoreMax)!;
  tempResults.maturityLevel = {
    level: maturity.level,
    description: maturity.description,
    nextStep: maturity.nextStep
  };

  tempResults.patterns = PATTERNS.filter(p => p.condition(tempResults));

  return tempResults;
};
