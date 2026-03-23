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
}

export enum AnalyticsEvent {
  VIEW_LANDING = 'view_landing',
  CLICK_START = 'click_start_survey',
  START_SURVEY = 'start_survey',
  COMPLETE_SURVEY = 'complete_survey',
  EMAIL_CAPTURED = 'email_captured',
  PDF_CLICKED = 'pdf_clicked',
  BOOK_CALL_CLICKED = 'book_call_clicked',
  SKIP_BOOKING = 'skip_booking',
  SURVEY_STEP_VIEWED = 'survey_step_viewed',

  DIAGNOSTIC_START = 'diagnostic_start',
  BLOCK_1_COMPLETE = 'block_1_complete',
  BLOCK_2_COMPLETE = 'block_2_complete',
  BLOCK_3_COMPLETE = 'block_3_complete',
  BLOCK_4_COMPLETE = 'block_4_complete',
  DIAGNOSTIC_COMPLETE = 'diagnostic_complete',
  REPORT_VIEW = 'report_view',
  REPORT_DOWNLOAD = 'report_download',
  BOOK_CALL_CLICK = 'book_call_click',
  BOOK_CALL_COMPLETE = 'book_call_complete',
  ERROR_SHOWN = 'error_shown',

  DIAGNOSTIC_Q1_ANSWERED = 'diagnostic_question_1_answered',
  DIAGNOSTIC_Q2_ANSWERED = 'diagnostic_question_2_answered',
  DIAGNOSTIC_Q3_ANSWERED = 'diagnostic_question_3_answered',
  DIAGNOSTIC_Q4_ANSWERED = 'diagnostic_question_4_answered',
  DIAGNOSTIC_Q5_ANSWERED = 'diagnostic_question_5_answered',
  DIAGNOSTIC_Q6_ANSWERED = 'diagnostic_question_6_answered',
  DIAGNOSTIC_Q7_ANSWERED = 'diagnostic_question_7_answered',
  DIAGNOSTIC_Q8_ANSWERED = 'diagnostic_question_8_answered',
  MINI_RESULT_VIEW = 'mini_result_view',
  LEAD_FORM_VIEW = 'lead_form_view',
  LEAD_SUBMITTED = 'lead_submitted',
  FINAL_RESULT_VIEW = 'final_result_view',
  CLICK_REQUEST_REVIEW = 'click_request_review',
  CALENDLY_OPENED = 'calendly_opened',
  CALENDLY_BOOKED = 'calendly_booked'
}