import { getActiveFunnel } from "./funnelSelector";
import { calculateResults as calculateResultsTalento } from "./scoringTalento";
import { calculateResults as calculateResultsAbsentismo } from "./scoringAbsentismo";
import { AnswerValue, ResultData } from "../types";

export const calculateResults = (answers: Record<string, AnswerValue>): ResultData => {
  const activeFunnel = getActiveFunnel();
  if (activeFunnel === 'talento') {
    return calculateResultsTalento(answers);
  }
  return calculateResultsAbsentismo(answers);
};
