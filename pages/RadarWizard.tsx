import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, Save, X } from 'lucide-react';
import Button from '../components/Button';
import { APP_CONFIG, LIKERT_LABELS, STORAGE_KEY, WIZARD_STEPS } from '../constants';
import { AnswerValue, Question, SurveyState } from '../types';
import { buildResultAnalyticsPayload, identifyLead, logEvent, AnalyticsEvent } from '../utils/analytics';
import { calculateResults } from '../utils/scoring';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RadarWizard: React.FC = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<SurveyState>({
    step: 0,
    answers: {},
    isCompleted: false,
    startTime: Date.now()
  });
  const [showValidation, setShowValidation] = useState(false);
  const leadFormViewedRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlEmail = params.get('email');

    if (urlEmail) {
      setState(prev => ({
        ...prev,
        answers: { ...prev.answers, email: urlEmail.trim().replace(/\s/g, '') }
      }));
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.isCompleted && Number.isInteger(parsed.step) && parsed.step < WIZARD_STEPS.length) {
          setState(parsed);
          return;
        }
        if (!parsed.isCompleted) {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    const params = new URLSearchParams(window.location.search);
    const utms: Record<string, string> = {};
    ['utm_source', 'utm_medium', 'utm_campaign'].forEach(key => {
      const val = params.get(key);
      if (val) utms[key] = val;
    });

    logEvent(AnalyticsEvent.DIAGNOSTIC_STARTED, { ...utms });
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (!state.isCompleted && WIZARD_STEPS[state.step]) {
      const stepQuestions = WIZARD_STEPS[state.step].questions;

      logEvent(AnalyticsEvent.DIAGNOSTIC_STEP_VIEWED, {
        step_number: state.step + 1,
        total_steps: WIZARD_STEPS.length,
        step_title: WIZARD_STEPS[state.step].title
      });

      if (stepQuestions[0]?.type === 'mini_result') {
        logEvent(AnalyticsEvent.MINI_RESULT_VIEWED, {
          ...buildResultAnalyticsPayload(calculateResults(state.answers))
        });
      }

      if (!leadFormViewedRef.current && stepQuestions.some(q => q.category === 'lead')) {
        leadFormViewedRef.current = true;
        logEvent(AnalyticsEvent.LEAD_FORM_VIEWED);
      }
    }
  }, [state.step, state.isCompleted]);

  const currentStepConfig = WIZARD_STEPS[state.step];
  const progress = ((state.step + 1) / WIZARD_STEPS.length) * 100;

  const handleAnswer = (questionId: string, value: AnswerValue) => {
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: value }
    }));

    const questionNumber = parseInt(questionId.replace('q', ''));
    if (!isNaN(questionNumber) && questionNumber >= 1 && questionNumber <= 8) {
      logEvent(AnalyticsEvent.DIAGNOSTIC_QUESTION_ANSWERED, {
        question_id: questionId,
        question_number: questionNumber,
        answer: value
      });
    }
  };

  const isQuestionInvalid = (q: Question): boolean => {
    if (q.required === false) return false;

    const ans = state.answers[q.id];

    if (q.type === 'boolean') return ans !== true;
    if (q.type === 'likert') return typeof ans !== 'number';
    if (q.id === 'email') return typeof ans !== 'string' || !EMAIL_REGEX.test(ans.trim());

    return ans === undefined || ans === null || (typeof ans === 'string' && ans.trim() === '');
  };

  const getMissingAnswersCount = (): number => {
    return currentStepConfig.questions.reduce((missing, q) => (
      isQuestionInvalid(q) ? missing + 1 : missing
    ), 0);
  };

  const validateStep = (): boolean => getMissingAnswersCount() === 0;
  const missingCount = getMissingAnswersCount();

  const nextStep = () => {
    if (!validateStep()) {
      setShowValidation(true);
      return;
    }

    setShowValidation(false);

    if (state.step === 0) {
      logEvent(AnalyticsEvent.DIAGNOSTIC_SECTION_COMPLETED, {
        section: 'diagnostic_questions',
        completed_questions: 8
      });
    }

    if (state.step < WIZARD_STEPS.length - 1) {
      setState(prev => ({ ...prev, step: prev.step + 1 }));
      window.scrollTo(0, 0);
    } else {
      finishSurvey();
    }
  };

  const prevStep = () => {
    if (state.step > 0) {
      setShowValidation(false);
      setState(prev => ({ ...prev, step: prev.step - 1 }));
      window.scrollTo(0, 0);
    }
  };

  const exitSurvey = () => {
    if (confirm("¿Seguro que quieres salir? Se conservará tu avance en este navegador.")) {
      navigate('/');
    }
  };

  const buildPayload = (surveyState: SurveyState, meetingOptIn: string) => {
    const results = calculateResults(surveyState.answers);
    const firstRisk = results.topRisks[0]?.dimension || "D1";
    const firstRiskLabel = results.dimensionScores.find(d => d.id === firstRisk)?.label || "";

    return {
      contact: {
        name: surveyState.answers['firstname'] || "",
        firstname: surveyState.answers['firstname'] || "",
        lastname: "",
        email: surveyState.answers['email'] || "",
        company: surveyState.answers['company'] || "",
        role: surveyState.answers['role'] || "",
        company_size: surveyState.answers['company_size'] || "",
        sector: surveyState.answers['sector'] || "",
        work_model: surveyState.answers['work_model'] || "",
        pain_point: firstRiskLabel,
        pain_point_1: firstRiskLabel,
        pain_point_2: results.dimensionScores.find(d => d.id === results.topRisks[1]?.dimension)?.label || "",
        pain_point_3: results.dimensionScores.find(d => d.id === results.topRisks[2]?.dimension)?.label || "",
        pain_points_txt: results.topRisks
          .map(r => results.dimensionScores.find(d => d.id === r.dimension)?.label)
          .filter(Boolean)
          .join(", ")
      },
      survey: {
        globalScore: results.globalScore,
        rawTotal: results.rawTotal,
        maxRawTotal: results.maxRawTotal,
        answeredCount: results.answeredCount,
        riskPercent: results.riskPercent,
        d1: results.dimensionScores.find(d => d.id === "D1")?.score || 0,
        d2: results.dimensionScores.find(d => d.id === "D2")?.score || 0,
        d3: results.dimensionScores.find(d => d.id === "D3")?.score || 0,
        d4: results.dimensionScores.find(d => d.id === "D4")?.score || 0,
        t: results.dimensionScores.find(d => d.id === "T")?.score || 0,
        r1: results.topRisks[0]?.dimension || "D1",
        r2: results.topRisks[1]?.dimension || "D2",
        r3: results.topRisks[2]?.dimension || "T",
        risks: results.topRisks,
        scores: results.dimensionScores.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.score }), {} as Record<string, number>),
        answers: surveyState.answers
      },
      meta: {
        timestamp: new Date().toISOString(),
        meetingOptIn,
        eventType: "lead_submitted",
        funnelId: "fuga_talento",
        payloadVersion: "2026_05_talento_v2",
        reportDelivery: "all_completed_leads",
        conversionLogic: "private_report_then_optional_executive_prioritization"
      }
    };
  };

  const finishSurvey = async () => {
    const finalState = { ...state, isCompleted: true };
    setState(finalState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(finalState));

    if (finalState.answers['email'] && typeof window !== 'undefined') {
      identifyLead(finalState.answers['email'] as string, {
        name: finalState.answers['firstname'] as string,
        contact_name: finalState.answers['firstname'] as string,
        identification_step: 'lead_form_submit'
      });
    }

    const payload = buildPayload(finalState, "Pending Booking");
    const results = calculateResults(finalState.answers);
    const analyticsPayload = {
      ...buildResultAnalyticsPayload(results),
      duration_seconds: Math.round((Date.now() - finalState.startTime) / 1000),
      answered_questions: Object.keys(finalState.answers).filter(key => /^q\d+$/.test(key)).length,
      lead_email_present: Boolean(finalState.answers['email'])
    };

    logEvent(AnalyticsEvent.LEAD_SUBMITTED, {
      lead_email_present: Boolean(finalState.answers['email'])
    });
    logEvent(AnalyticsEvent.DIAGNOSTIC_COMPLETED, analyticsPayload);

    if (APP_CONFIG.POST_ENDPOINT_URL) {
      try {
        await fetch(APP_CONFIG.POST_ENDPOINT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true
        });
      } catch (e) {
        console.error("Error triggering webhook", e);
        logEvent(AnalyticsEvent.WEBHOOK_ERROR, { method: 'lead_submit_fetch', error: String(e) });
      }
    }

    navigate('/resultado');
  };

  const getExposureLevel = (score: number) => {
    if (score < 40) return { level: 'Alta', color: 'bg-red-600', text: 'text-red-600' };
    if (score < 70) return { level: 'Media', color: 'bg-amber-500', text: 'text-amber-600' };
    return { level: 'Baja', color: 'bg-green-600', text: 'text-green-600' };
  };

  const renderLikert = (q: Question) => {
    const val = state.answers[q.id];

    return (
      <div className="mt-4">
        <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label={q.text}>
          {LIKERT_LABELS.map((label, idx) => {
            const value = idx + 1;
            const selected = val === value;

            return (
              <button
                key={label}
                type="button"
                onClick={() => handleAnswer(q.id, value)}
                aria-pressed={selected}
                title={label}
                className={`h-10 sm:h-11 rounded-md border text-sm font-black transition-all ${
                  selected
                    ? 'bg-accent1 text-white border-accent1 shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-accent1'
                }`}
              >
                {value}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <span>No ocurre</span>
          <span className="text-right">Ocurre mucho</span>
        </div>
      </div>
    );
  };

  const renderInput = (q: Question) => {
    const val = state.answers[q.id];

    if (q.type === 'likert') {
      return renderLikert(q);
    }

    if (q.type === 'select') {
      return (
        <div className="grid grid-cols-1 gap-3 mt-4">
          {q.options?.map((opt) => {
            const selected = val === opt;
            return (
              <button
                key={opt}
                onClick={() => handleAnswer(q.id, opt)}
                className={`min-h-[56px] px-4 py-3 rounded-lg text-left border transition-all text-sm sm:text-base flex items-center justify-between gap-4 ${
                  selected
                    ? 'bg-accent1/10 text-primary dark:text-white border-accent1 ring-2 ring-accent1/20 font-semibold'
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-accent1 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
              >
                <span>{opt}</span>
                {selected && <Check className="w-5 h-5 text-accent1 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      );
    }

    if (q.type === 'text') {
      return (
        <input
          type={q.id === 'email' ? 'email' : 'text'}
          inputMode={q.id === 'email' ? 'email' : 'text'}
          autoComplete={q.id === 'email' ? 'email' : 'given-name'}
          name={q.id}
          className="w-full mt-3 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent1 focus:border-transparent outline-none bg-white text-gray-900 placeholder-gray-400"
          placeholder={q.id === 'email' ? 'nombre@empresa.com' : 'Tu nombre'}
          value={(val as string) || ''}
          onChange={(e) => handleAnswer(q.id, e.target.value)}
        />
      );
    }

    if (q.type === 'boolean') {
      return (
        <label className="mt-3 flex gap-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={val === true}
            onChange={(e) => handleAnswer(q.id, e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-accent1 focus:ring-accent1"
          />
          <span>{q.text}</span>
        </label>
      );
    }

    if (q.type === 'mini_result') {
      const miniResults = calculateResults(state.answers);
      const exposure = getExposureLevel(miniResults.globalScore);
      const topRiskLabels = miniResults.topRisks
        .slice(0, 2)
        .map(risk => miniResults.dimensionScores.find(d => d.id === risk.dimension)?.label)
        .filter(Boolean);
      const firstQuickWin = miniResults.quickWins[0];

      const insight = miniResults.globalScore < 40
        ? {
            title: "Tu fuga de talento ya tiene señales visibles",
            desc: "Las respuestas apuntan a un riesgo que puede aparecer como rotación, baja energía o dependencia de personas clave. Conviene priorizar antes de que se convierta en reemplazos caros."
          }
        : miniResults.globalScore < 70
          ? {
              title: "Hay una zona de fricción que merece atención",
              desc: "El sistema funciona, pero hay señales suficientes para revisar dónde se puede perder talento: mando directo, propuesta de valor, sucesión o adaptación."
            }
          : {
              title: "La base es saludable, pero hay que blindarla",
              desc: "Tus respuestas muestran control general. El valor ahora está en detectar a tiempo los focos que podrían romper retención, sucesión o velocidad de aprendizaje."
            };

      return (
        <div className="mt-4 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm animate-fade-in overflow-hidden">
          <div className="p-6 text-center border-b border-slate-200 dark:border-slate-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide font-black">Diagnóstico preliminar</p>
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-md text-white font-black text-lg ${exposure.color}`}>
              Exposición {exposure.level}
            </div>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              Áreas más sensibles: <span className="font-bold text-primary dark:text-white">{topRiskLabels.join(" + ")}</span>
            </p>
          </div>

          <div className="p-6">
            <h4 className="font-black text-gray-900 dark:text-gray-100 text-xl">{insight.title}</h4>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{insight.desc}</p>

            {firstQuickWin && (
              <div className="mt-5 p-4 bg-accent1/5 dark:bg-accent1/10 rounded-lg border border-accent1/20">
                <p className="text-xs uppercase text-accent1 font-black mb-2">Primera palanca sugerida</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                  {firstQuickWin}
                </p>
              </div>
            )}

            <div className="mt-5 text-center p-5 bg-slate-950 rounded-lg border border-slate-800">
              <p className="text-sm font-medium text-slate-300">
                Tu informe completo ordena los 3 riesgos principales y la siguiente decisión interna.
              </p>
              <p className="mt-2 text-base font-black text-white">
                Solo falta enviártelo de forma privada.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const getButtonLabel = () => {
    if (state.step === 0) return 'Continuar';
    if (state.step === WIZARD_STEPS.length - 1) return 'Ver mi informe ejecutivo';
    return 'Continuar';
  };

  const getStepLabel = () => {
    if (state.step === 0) return '8 señales críticas';
    return 'Informe privado';
  };

  return (
    <div className="min-h-[calc(100svh-4rem)] bg-bgLight dark:bg-darkBg transition-colors duration-300">
      <div className="fixed top-16 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 z-40">
        <div
          className="h-full bg-accent1 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:py-10 min-h-[calc(100svh-4rem)] flex flex-col justify-center">
        <div className="mb-5 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <button onClick={exitSurvey} className="p-2 -ml-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full" title="Salir">
              <X className="w-5 h-5" />
            </button>
            <span>{getStepLabel()}</span>
          </div>
          <span className="flex items-center gap-1">
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Guardado auto</span>
          </span>
        </div>

        <div className="mb-5 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-primary dark:text-white mb-2">
            {currentStepConfig.title}
          </h2>
          {currentStepConfig.subtitle && (
            <p className="text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              {currentStepConfig.subtitle}
            </p>
          )}
        </div>

        <div className={state.step === 0 ? "grid md:grid-cols-2 gap-3 sm:gap-4" : "max-w-3xl mx-auto w-full space-y-4 sm:space-y-5"}>
          {currentStepConfig.questions.map((q, idx) => {
            const isError = showValidation && isQuestionInvalid(q);
            const showTitle = q.type !== 'mini_result' && q.type !== 'boolean';

            return (
              <div key={q.id} className={`flex flex-col h-full animate-fade-in-up p-3 sm:p-4 rounded-lg transition-colors ${isError ? 'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'}`}>
                {showTitle && (
                  <div className="flex-grow">
                    <h3 className={`text-sm sm:text-base font-bold mb-1 flex items-start justify-between gap-3 ${isError ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
                      <span>
                        {q.type === 'likert' && <span className="text-accent1 mr-2">{idx + 1}.</span>}
                        {q.text} {q.required && <span className="text-red-500">*</span>}
                      </span>
                      {isError && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full whitespace-nowrap dark:bg-red-900/40 dark:text-red-300">Revisar</span>}
                    </h3>
                    {q.hint && (
                      <p className={`text-sm italic mb-3 ${isError ? 'text-red-500/80 dark:text-red-400/80' : 'text-gray-500 dark:text-gray-400'}`}>
                        {q.hint}
                      </p>
                    )}
                  </div>
                )}
                <div className={showTitle ? "mt-auto" : ""}>
                  {renderInput(q)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800 sm:relative sm:bg-transparent sm:dark:bg-transparent sm:border-0 sm:mt-8">
          <div className="max-w-2xl mx-auto flex gap-4 justify-center">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={state.step === 0}
              className={state.step === 0 ? 'hidden' : 'bg-white text-primary border-gray-300 hover:bg-gray-50'}
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Anterior
            </Button>
            <div className="flex flex-col w-full">
              {showValidation && missingCount > 0 && (
                <p className="text-xs text-red-600 dark:text-red-400 font-bold mb-2 text-center">
                  Revisa las respuestas marcadas para continuar.
                </p>
              )}
              {missingCount > 0 && !showValidation && (
                <p className="text-xs text-amber-600 dark:text-amber-500 font-bold mb-2 text-center">
                  Te {missingCount === 1 ? 'falta' : 'faltan'} {missingCount} {missingCount === 1 ? 'respuesta' : 'respuestas'} en esta pantalla.
                </p>
              )}
              <Button fullWidth onClick={nextStep} className="rounded-md bg-accent1 hover:bg-teal-800">
                {getButtonLabel()}
                {state.step !== WIZARD_STEPS.length - 1 && <ChevronRight className="w-5 h-5 ml-1" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadarWizard;
