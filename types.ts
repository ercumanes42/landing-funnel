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
  PAGE_VIEW = 'abs_page_view',
  LANDING_CTA_CLICKED = 'abs_landing_cta_clicked',
  IDENTIFIED_FROM_EMAIL_LINK = 'abs_identified_from_email_link',

  DIAGNOSTIC_STARTED = 'abs_diagnostic_started',
  DIAGNOSTIC_STEP_VIEWED = 'abs_diagnostic_step_viewed',
  DIAGNOSTIC_QUESTION_ANSWERED = 'abs_diagnostic_question_answered',
  DIAGNOSTIC_SECTION_COMPLETED = 'abs_diagnostic_section_completed',
  MINI_RESULT_VIEWED = 'abs_mini_result_viewed',
  LEAD_FORM_VIEWED = 'abs_lead_form_viewed',
  LEAD_SUBMITTED = 'abs_lead_submitted',
  DIAGNOSTIC_COMPLETED = 'abs_diagnostic_completed',

  RESULT_VIEWED = 'abs_result_viewed',
  REPORT_DOWNLOADED = 'abs_report_downloaded',
  BOOKING_CTA_CLICKED = 'abs_booking_cta_clicked',
  BOOKING_CONFIRMED = 'abs_booking_confirmed',
  BOOKING_SKIPPED = 'abs_booking_skipped',
  WEBHOOK_ERROR = 'abs_webhook_error'
}
