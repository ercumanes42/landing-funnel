export type AnswerValue = string | number | string[] | boolean;

export interface Question {
  id: string;
  text: string;
  hint?: string;
  category: 'context' | 'D1' | 'D2' | 'D3' | 'D4' | 'T' | 'priority' | 'lead' | 'result';
  type: 'select' | 'likert' | 'multiselect' | 'text' | 'boolean' | 'mini_result';
  options?: string[];
  maxSelections?: number;
  required?: boolean;
}

export interface WizardStep {
  title: string;
  subtitle?: string;
  questions: Question[];
}

export interface SurveyState {
  step: number;
  answers: Record<string, AnswerValue>;
  isCompleted: boolean;
  startTime: number;
}

export interface DimensionScore {
  id: string;
  label: string;
  score: number; // 0-100
  color: string;
}

export interface ResultData {
  globalScore: number;
  rawTotal: number;
  maxRawTotal: number;
  answeredCount: number;
  riskPercent: number;
  dimensionScores: DimensionScore[];
  topRisks: { dimension: string; score: number }[];
  quickWins: string[];
  maturityLevel: {
    level: string;
    description: string;
    nextStep: string;
  };
  patterns: {
    name: string;
    description: string;
  }[];
}

export enum AnalyticsEvent {
  PAGE_VIEW = 'talent_page_view',
  LANDING_CTA_CLICKED = 'talent_landing_cta_clicked',
  IDENTIFIED_FROM_EMAIL_LINK = 'talent_identified_from_email_link',

  DIAGNOSTIC_STARTED = 'talent_diagnostic_started',
  DIAGNOSTIC_STEP_VIEWED = 'talent_diagnostic_step_viewed',
  DIAGNOSTIC_QUESTION_ANSWERED = 'talent_diagnostic_question_answered',
  DIAGNOSTIC_SECTION_COMPLETED = 'talent_diagnostic_section_completed',
  MINI_RESULT_VIEWED = 'talent_mini_result_viewed',
  LEAD_FORM_VIEWED = 'talent_lead_form_viewed',
  LEAD_SUBMITTED = 'talent_lead_submitted',
  DIAGNOSTIC_COMPLETED = 'talent_diagnostic_completed',

  RESULT_VIEWED = 'talent_result_viewed',
  REPORT_DOWNLOADED = 'talent_report_downloaded',
  BOOKING_CTA_CLICKED = 'talent_booking_cta_clicked',
  BOOKING_CONFIRMED = 'talent_booking_confirmed',
  BOOKING_SKIPPED = 'talent_booking_skipped',
  WEBHOOK_ERROR = 'talent_webhook_error'
}
