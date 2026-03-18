import { DIMENSIONS, QUICK_WINS } from "../constants";
import { AnswerValue, ResultData } from "../types";

export const calculateResults = (answers: Record<string, AnswerValue>): ResultData => {

  const getDimensionScore = (dimKey: string): number => {
    const questionMapping: Record<string, string[]> = {
      'D1': ['q4'],
      'D2': ['q5'],
      'D3': ['q1', 'q2', 'q3', 'q8'],
      'D4': ['q7'],
      'T': ['q6']
    };
    
    const questionIds = questionMapping[dimKey] || [];
    const answeredKeys = questionIds.filter(id => {
      const val = answers[id];
      return typeof val === 'number';
    });

    if (answeredKeys.length === 0) return 0;

    const sum = answeredKeys.reduce((acc, key) => {
      const val = answers[key] as number;
      return acc + val;
    }, 0);

    const average = sum / answeredKeys.length;
    return Math.round(((average - 1) / 4) * 100);
  };

  const scores = Object.entries(DIMENSIONS).map(([key, config]) => ({
    id: key,
    label: config.label,
    score: getDimensionScore(key),
    color: '#22D3EE'
  }));

  let weightedSum = 0;
  scores.forEach(s => {
    const weight = DIMENSIONS[s.id as keyof typeof DIMENSIONS].weight;
    weightedSum += s.score * weight;
  });

  const globalScore = Math.round(weightedSum);

  const sortedByScore = [...scores].sort((a, b) => a.score - b.score);

  const governanceScore = scores.find(s => s.id === 'T')?.score || 100;

  const topRisks = [];
  topRisks.push({ dimension: sortedByScore[0].id, score: sortedByScore[0].score });

  if (governanceScore <= 40 && sortedByScore[0].id !== 'T') {
    topRisks.push({ dimension: 'T', score: governanceScore });
  } else {
    const second = sortedByScore.find(s => s.id !== topRisks[0].dimension);
    if (second) topRisks.push({ dimension: second.id, score: second.score });
  }

  const third = sortedByScore.find(s => !topRisks.map(r => r.dimension).includes(s.id));
  if (third) topRisks.push({ dimension: third.id, score: third.score });

  const suggestedWins = sortedByScore.slice(0, 3).map(s => QUICK_WINS[s.id as keyof typeof QUICK_WINS]);

  return {
    globalScore,
    dimensionScores: scores,
    topRisks,
    quickWins: suggestedWins
  };
};
