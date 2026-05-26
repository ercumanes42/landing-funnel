import { getActiveFunnel } from "./utils/funnelSelector";
import * as Talento from "./constantsTalento";
import * as Absentismo from "./constantsAbsentismo";

// Helper to create a proxy that delegates to the active funnel's constant
const createProxy = <T extends object>(key: keyof typeof Talento & keyof typeof Absentismo): T => {
  return new Proxy({} as T, {
    get: (_, prop) => {
      const active = getActiveFunnel() === 'talento' ? Talento : Absentismo;
      return active[key][prop as keyof typeof active[typeof key]];
    },
    ownKeys: (_) => {
      const active = getActiveFunnel() === 'talento' ? Talento : Absentismo;
      return Reflect.ownKeys(active[key]);
    },
    getOwnPropertyDescriptor: (_, prop) => {
      const active = getActiveFunnel() === 'talento' ? Talento : Absentismo;
      return Reflect.getOwnPropertyDescriptor(active[key], prop);
    }
  });
};

export const APP_CONFIG = createProxy<typeof Talento.APP_CONFIG>('APP_CONFIG');
export const DIMENSIONS = createProxy<typeof Talento.DIMENSIONS>('DIMENSIONS');
export const QUICK_WINS = createProxy<typeof Talento.QUICK_WINS>('QUICK_WINS');
export const RISK_FEEDBACK = createProxy<typeof Talento.RISK_FEEDBACK>('RISK_FEEDBACK');
export const EXECUTIVE_SUMMARIES = createProxy<typeof Talento.EXECUTIVE_SUMMARIES>('EXECUTIVE_SUMMARIES');
export const LIKERT_LABELS = createProxy<typeof Talento.LIKERT_LABELS>('LIKERT_LABELS');

// Dynamic proxy for WIZARD_STEPS array
export const WIZARD_STEPS = new Proxy([] as any, {
  get: (_, prop) => {
    const active = getActiveFunnel() === 'talento' ? Talento : Absentismo;
    if (prop === 'length') {
      return active.WIZARD_STEPS.length;
    }
    return active.WIZARD_STEPS[prop as any];
  }
}) as typeof Talento.WIZARD_STEPS;

// Custom object for STORAGE_KEY that behaves as a string in coercion (like localStorage.getItem)
export const STORAGE_KEY = {
  toString: () => getActiveFunnel() === 'talento' ? 'radar_state' : 'absentismo_state',
  valueOf: () => getActiveFunnel() === 'talento' ? 'radar_state' : 'absentismo_state'
} as unknown as string;

export const METHODOLOGY_TEXT = {
  toString: () => getActiveFunnel() === 'talento' ? Talento.METHODOLOGY_TEXT : Absentismo.METHODOLOGY_TEXT,
  valueOf: () => getActiveFunnel() === 'talento' ? Talento.METHODOLOGY_TEXT : Absentismo.METHODOLOGY_TEXT
} as unknown as string;
