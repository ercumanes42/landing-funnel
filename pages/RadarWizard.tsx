import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, Save, X } from 'lucide-react';
import Button from '../components/Button';
import { APP_CONFIG, STORAGE_KEY, WIZARD_STEPS } from '../constants';
import { AnswerValue, SurveyState } from '../types';
import { logEvent, AnalyticsEvent } from '../utils/analytics';
import { calculateResults } from '../utils/scoring';

const RadarWizard: React.FC = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<SurveyState>({
    step: 0,
    answers: {},
    isCompleted: false,
    startTime: Date.now()
  });
  const [showValidation, setShowValidation] = useState(false);

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
        if (!parsed.isCompleted) {
          setState(parsed);
          return;
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

    logEvent(AnalyticsEvent.START_SURVEY, { ...utms });
    logEvent(AnalyticsEvent.DIAGNOSTIC_START, { ...utms });
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (!state.isCompleted && WIZARD_STEPS[state.step]) {
      logEvent(AnalyticsEvent.SURVEY_STEP_VIEWED, {
        step_number: state.step + 1,
        total_steps: WIZARD_STEPS.length,
        step_title: WIZARD_STEPS[state.step].title
      });

      if (WIZARD_STEPS[state.step].questions[0]?.type === 'mini_result') {
        logEvent(AnalyticsEvent.MINI_RESULT_VIEW);
      }
    }
  }, [state.step, state.isCompleted]);

  const currentStepConfig = WIZARD_STEPS[state.step];
  const progress = ((state.step) / (WIZARD_STEPS.length - 1)) * 100;

  const handleAnswer = (questionId: string, value: AnswerValue) => {
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: value }
    }));

    const questionNumber = parseInt(questionId.replace('q', ''));
    if (!isNaN(questionNumber) && questionNumber >= 1 && questionNumber <= 6) {
      const eventMap: Record<number, AnalyticsEvent> = {
        1: AnalyticsEvent.DIAGNOSTIC_Q1_ANSWERED,
        2: AnalyticsEvent.DIAGNOSTIC_Q2_ANSWERED,
        3: AnalyticsEvent.DIAGNOSTIC_Q3_ANSWERED,
        4: AnalyticsEvent.DIAGNOSTIC_Q4_ANSWERED,
        5: AnalyticsEvent.DIAGNOSTIC_Q5_ANSWERED,
        6: AnalyticsEvent.DIAGNOSTIC_Q6_ANSWERED
      };
      logEvent(eventMap[questionNumber], { question_id: questionId, value });
    }

    if (questionId === 'firstname' || questionId === 'email') {
      logEvent(AnalyticsEvent.LEAD_FORM_VIEW);
    }
  };

  const getMissingAnswersCount = (): number => {
    return currentStepConfig.questions.reduce((missing, q) => {
      if (q.required === false) return missing;

      const ans = state.answers[q.id];
      const isBlank = ans === undefined || ans === null || (typeof ans === 'string' && ans.trim() === '');

      return isBlank ? missing + 1 : missing;
    }, 0);
  };

  const validateStep = (): boolean => getMissingAnswersCount() === 0;
  const missingCount = getMissingAnswersCount();

  const nextStep = () => {
    if (!validateStep()) {
      setShowValidation(true);
      return;
    }

    setShowValidation(false);

    if (state.step === 0) logEvent(AnalyticsEvent.BLOCK_1_COMPLETE);
    if (state.step === 3) logEvent(AnalyticsEvent.BLOCK_2_COMPLETE);
    if (state.step === 6) logEvent(AnalyticsEvent.BLOCK_3_COMPLETE);

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
    if (confirm("Seguro que quieres salir? Se conservara tu avance en este navegador.")) {
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
        reportDelivery: "all_completed_leads",
        conversionLogic: "report_for_internal_review_booking_for_interpretation"
      }
    };
  };

  const finishSurvey = async () => {
    const finalState = { ...state, isCompleted: true };
    setState(finalState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(finalState));

    const payload = buildPayload(finalState, "Pending Booking");

    logEvent(AnalyticsEvent.LEAD_SUBMITTED);
    logEvent(AnalyticsEvent.COMPLETE_SURVEY, payload);
    logEvent(AnalyticsEvent.DIAGNOSTIC_COMPLETE, payload);

    if (finalState.answers['email'] && typeof window !== 'undefined') {
      import('posthog-js').then(({ default: posthog }) => {
        posthog.identify(finalState.answers['email'] as string, {
          email: finalState.answers['email'],
          name: finalState.answers['firstname'] as string,
          $set: {
            email: finalState.answers['email'],
            contact_name: finalState.answers['firstname']
          }
        });
      });
      logEvent(AnalyticsEvent.EMAIL_CAPTURED);
    }

    if (APP_CONFIG.POST_ENDPOINT_URL) {
      try {
        fetch(APP_CONFIG.POST_ENDPOINT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true
        }).catch(e => {
          console.error("Webhook error", e);
          logEvent(AnalyticsEvent.ERROR_SHOWN, { method: 'fetch_catch', error: String(e) });
        });
      } catch (e) {
        console.error("Error triggering webhook", e);
        logEvent(AnalyticsEvent.ERROR_SHOWN, { method: 'try_catch', error: String(e) });
      }
    }

    navigate('/resultado');
  };

  const getExposureLevel = (score: number) => {
    if (score < 40) return { level: 'Alta', color: 'bg-red-600', text: 'text-red-600' };
    if (score < 70) return { level: 'Media', color: 'bg-amber-500', text: 'text-amber-600' };
    return { level: 'Baja', color: 'bg-green-600', text: 'text-green-600' };
  };

  const renderInput = (q: typeof currentStepConfig.questions[0]) => {
    const val = state.answers[q.id];

    if (q.type === 'select') {
      return (
        <div className="grid grid-cols-1 gap-3 mt-4">
          {q.options?.map((opt) => {
            const selected = val === opt;
            return (
              <button
                key={opt}
                onClick={() => handleAnswer(q.id, opt)}
                className={`
                  min-h-[56px] px-4 py-3 rounded-lg text-left border transition-all text-sm sm:text-base flex items-center justify-between gap-4
                  ${selected
                    ? 'bg-accent1/10 text-primary dark:text-white border-accent1 ring-2 ring-accent1/20 font-semibold'
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-accent1 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }
                `}
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
          type="text"
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

    if (q.type === 'mini_result') {
      const miniResults = calculateResults(state.answers);
      const exposure = getExposureLevel(miniResults.globalScore);
      const firstRisk = miniResults.topRisks[0];
      const firstRiskLabel = miniResults.dimensionScores.find(d => d.id === firstRisk?.dimension)?.label || "Coste invisible";

      const insight = miniResults.globalScore < 40
        ? {
            title: "Ya aparece una fuga clara",
            desc: "Tus primeras respuestas apuntan a un absentismo que probablemente se esta pagando en coste, mandos o continuidad operativa.",
            action: "Completa las 3 preguntas finales para ver el foco exacto."
          }
        : miniResults.globalScore < 70
          ? {
              title: "Hay una senal que conviene ordenar",
              desc: "No parece solo un problema de volumen. La clave sera separar coste, causa y momento de actuacion.",
              action: "Completa las 3 preguntas finales para cerrar el diagnostico."
            }
          : {
              title: "Buen punto de partida",
              desc: "Tus primeras respuestas muestran control inicial. Las ultimas preguntas validan si ese control tambien existe en causas y respuesta temprana.",
              action: "Completa el diagnostico de coste."
            };

      return (
        <div className="mt-4 p-6 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-6">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Vista previa basada en tus primeras respuestas</p>
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-md text-white font-bold text-lg ${exposure.color}`}>
              Exposicion {exposure.level}
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Primer foco probable: {firstRiskLabel}
            </p>
          </div>

          <div className="mb-6 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{insight.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{insight.desc}</p>
          </div>

          <div className="text-center p-4 bg-accent1/10 dark:bg-accent1/15 rounded-lg border border-accent1/30">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {insight.action}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Menos de 1 minuto mas. Informe ejecutivo incluido.
            </p>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Falta revisar: causa probable, momento de actuacion y escenario de impacto.
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  const getButtonLabel = () => {
    if (state.step === 2) return 'Ver primer patron';
    if (state.step === 3) return 'Completar diagnostico de coste';
    if (state.step === WIZARD_STEPS.length - 1) return 'Ver mi diagnostico';
    return 'Continuar';
  };

  return (
    <div className="min-h-screen bg-bgLight dark:bg-darkBg pb-20 transition-colors duration-300">
      <div className="fixed top-16 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 z-40">
        <div
          className="h-full bg-gradient-to-r from-accent1 to-accent2 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-10 sm:pt-16">
        <div className="mb-8 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <button onClick={exitSurvey} className="p-2 -ml-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full" title="Salir">
              <X className="w-5 h-5" />
            </button>
            <span>Paso {state.step + 1} de {WIZARD_STEPS.length}</span>
          </div>
          <span className="flex items-center gap-1">
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Guardado auto</span>
          </span>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary dark:text-white mb-2">
            {currentStepConfig.title}
          </h2>
          {currentStepConfig.subtitle && (
            <p className="text-base text-gray-500 dark:text-gray-400">
              {currentStepConfig.subtitle}
            </p>
          )}
        </div>

        <div className="space-y-8 sm:space-y-10">
          {currentStepConfig.questions.map((q) => {
            const ans = state.answers[q.id];
            const isMissing = q.required !== false && (
              ans === undefined ||
              ans === null ||
              (typeof ans === 'string' && ans.trim() === '')
            );
            const isError = showValidation && isMissing;

            return (
              <div key={q.id} className={`animate-fade-in-up p-4 rounded-lg transition-colors ${isError ? 'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 -mx-4' : ''}`}>
                {q.type !== 'mini_result' && (
                  <>
                    <h3 className={`text-lg font-medium mb-1 flex items-start justify-between ${isError ? 'text-red-600 dark:text-red-400 font-bold' : 'text-gray-800 dark:text-gray-200'}`}>
                      <span>
                        {q.text} {q.required && <span className="text-red-500">*</span>}
                      </span>
                      {isError && <span className="text-xs ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full whitespace-nowrap dark:bg-red-900/40 dark:text-red-300">Requerido</span>}
                    </h3>
                    {q.hint && (
                      <p className={`text-sm italic mb-3 ${isError ? 'text-red-500/80 dark:text-red-400/80' : 'text-gray-500 dark:text-gray-400'}`}>
                        {q.hint}
                      </p>
                    )}
                  </>
                )}
                {renderInput(q)}
              </div>
            );
          })}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800 sm:relative sm:bg-transparent sm:dark:bg-transparent sm:border-0 sm:mt-12">
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
                  Revisa la respuesta marcada para continuar.
                </p>
              )}
              {missingCount > 0 && !showValidation && (
                <p className="text-xs text-amber-600 dark:text-amber-500 font-bold mb-2 text-center">
                  Te {missingCount === 1 ? 'falta' : 'faltan'} {missingCount} {missingCount === 1 ? 'respuesta' : 'respuestas'} en esta pantalla.
                </p>
              )}
              <Button fullWidth onClick={nextStep}>
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
