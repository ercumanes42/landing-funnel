import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Save, X } from 'lucide-react';
import Button from '../components/Button';
import { WIZARD_STEPS, APP_CONFIG } from '../constants';
import { SurveyState, AnswerValue } from '../types';
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

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('radar_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // The Contexto Organizativo step was moved to the end. D1 is now step 0.
        // We can check if they are at step > 0 and haven't answered D1, OR if they have 'size' but haven't answered D1 (meaning they were in the old flow).
        const hasD1Answer = parsed.answers !== undefined && parsed.answers['d1_1'] !== undefined;

        // If they are past step 0, they MUST have completed D1 now.
        const isOldVersion = parsed.step > 0 && !hasD1Answer;

        if (!parsed.isCompleted && !isOldVersion) {
          setState(parsed);
        } else if (isOldVersion) {
          // Reset state for migration
          console.log("Migrating broken state - reseting wizard");
          localStorage.removeItem('radar_state');
          logEvent(AnalyticsEvent.START_SURVEY);
          logEvent(AnalyticsEvent.DIAGNOSTIC_START);
        }
      } catch (e) {
        console.error("Error loading state", e);
      }
    } else {
      logEvent(AnalyticsEvent.START_SURVEY);
      logEvent(AnalyticsEvent.DIAGNOSTIC_START);
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('radar_state', JSON.stringify(state));
  }, [state]);

  // Track each step the user views
  useEffect(() => {
    if (!state.isCompleted && WIZARD_STEPS[state.step]) {
      logEvent(AnalyticsEvent.SURVEY_STEP_VIEWED, {
        step_number: state.step + 1,
        total_steps: WIZARD_STEPS.length,
        step_title: WIZARD_STEPS[state.step].title
      });
      
      // Track mini result view
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
    
    // Track question answered events
    const questionNumber = parseInt(questionId.replace('q', ''));
    if (!isNaN(questionNumber) && questionNumber >= 1 && questionNumber <= 8) {
      const eventMap: Record<number, AnalyticsEvent> = {
        1: AnalyticsEvent.DIAGNOSTIC_Q1_ANSWERED,
        2: AnalyticsEvent.DIAGNOSTIC_Q2_ANSWERED,
        3: AnalyticsEvent.DIAGNOSTIC_Q3_ANSWERED,
        4: AnalyticsEvent.DIAGNOSTIC_Q4_ANSWERED,
        5: AnalyticsEvent.DIAGNOSTIC_Q5_ANSWERED,
        6: AnalyticsEvent.DIAGNOSTIC_Q6_ANSWERED,
        7: AnalyticsEvent.DIAGNOSTIC_Q7_ANSWERED,
        8: AnalyticsEvent.DIAGNOSTIC_Q8_ANSWERED
      };
      logEvent(eventMap[questionNumber], { question_id: questionId, value });
    }
    
    // Track lead form view
    if (questionId === 'firstname' || questionId === 'email') {
      logEvent(AnalyticsEvent.LEAD_FORM_VIEW);
    }
  };

  const getMissingAnswersCount = (): number => {
    let missing = 0;
    const currentQuestions = currentStepConfig.questions;
    for (const q of currentQuestions) {
      const ans = state.answers[q.id];

      // If explicitly marked as optional, skip validation if it's undefined
      if (q.required === false) continue;

      if (q.type === 'boolean' && q.required && ans !== true) missing++;
      else if (q.type === 'multiselect' && Array.isArray(ans) && ans.length === 0) missing++;
      else if (q.required && (!ans || (typeof ans === 'string' && ans.trim() === ''))) missing++;
      else if (ans === undefined || ans === null) missing++;
    }
    return missing;
  };

  const validateStep = (): boolean => getMissingAnswersCount() === 0;
  const missingCount = getMissingAnswersCount();

  const nextStep = () => {
    if (!validateStep()) {
      setShowValidation(true);
      return;
    }

    setShowValidation(false);

    if (state.step === 1) logEvent(AnalyticsEvent.BLOCK_1_COMPLETE);
    if (state.step === 2) logEvent(AnalyticsEvent.BLOCK_2_COMPLETE);
    if (state.step === 3) logEvent(AnalyticsEvent.BLOCK_3_COMPLETE);
    if (state.step === 4) logEvent(AnalyticsEvent.BLOCK_4_COMPLETE);

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
    if (confirm("¿Estás seguro de que quieres salir? Se perderá tu progreso no guardado.")) {
      navigate('/');
    }
  };

  const finishSurvey = async () => {
    const finalState = { ...state, isCompleted: true };
    setState(finalState);
    localStorage.setItem('radar_state', JSON.stringify(finalState));

    logEvent(AnalyticsEvent.LEAD_SUBMITTED);

    const results = calculateResults(state.answers);
    const payload = {
      contact: {
        name: state.answers['firstname'],
        firstname: state.answers['firstname'],
        lastname: state.answers['lastname'],
        email: state.answers['email'],
        company: state.answers['company'],
        role: state.answers['role'],
        company_size: state.answers['company_size'],
        sector: state.answers['sector'],
        work_model: state.answers['work_model'],
        pain_point: state.answers['pain_point'],
        pain_point_1: Array.isArray(state.answers['pain_point']) ? state.answers['pain_point'][0] || "" : "",
        pain_point_2: Array.isArray(state.answers['pain_point']) ? state.answers['pain_point'][1] || "" : "",
        pain_point_3: Array.isArray(state.answers['pain_point']) ? state.answers['pain_point'][2] || "" : "",
        pain_points_txt: Array.isArray(state.answers['pain_point']) ? state.answers['pain_point'].join(", ") : state.answers['pain_point']
      },
      survey: {
        globalScore: results.globalScore,
        // Individual dimension scores for easy URL construction in Make/Zapier
        d1: results.dimensionScores.find(d => d.id === "D1")?.score || 0,
        d2: results.dimensionScores.find(d => d.id === "D2")?.score || 0,
        d3: results.dimensionScores.find(d => d.id === "D3")?.score || 0,
        d4: results.dimensionScores.find(d => d.id === "D4")?.score || 0,
        t: results.dimensionScores.find(d => d.id === "T")?.score || 0,
        // Top 3 risk dimension IDs
        r1: results.topRisks[0]?.dimension || "D1",
        r2: results.topRisks[1]?.dimension || "D2",
        r3: results.topRisks[2]?.dimension || "T",
        risks: results.topRisks,
        scores: results.dimensionScores.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.score }), {} as Record<string, number>),
        answers: state.answers
      },
      meta: {
        timestamp: new Date().toISOString(),
        meetingOptIn: "Pending Booking"
      }
    };

    logEvent(AnalyticsEvent.COMPLETE_SURVEY, payload);
    logEvent(AnalyticsEvent.DIAGNOSTIC_COMPLETE, payload);

    if (state.answers['email'] && typeof window !== 'undefined') {
      import('posthog-js').then(({ default: posthog }) => {
        posthog.identify(state.answers['email'] as string, {
          email: state.answers['email'],
          name: state.answers['firstname'] as string
        });
      });
    }

    if (APP_CONFIG.POST_ENDPOINT_URL) {
      try {
        const url = APP_CONFIG.POST_ENDPOINT_URL;
        fetch(url, {
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

    if (state.answers['email']) {
      logEvent(AnalyticsEvent.EMAIL_CAPTURED);
      if (typeof window !== 'undefined') {
        import('posthog-js').then(({ default: posthog }) => {
          posthog.identify(state.answers['email'] as string, {
            email: state.answers['email'],
            $set: {
              email: state.answers['email'],
              contact_name: state.answers['firstname']
            }
          });
        });
      }
    }

    navigate('/resultado');
  };

  const renderInput = (q: typeof currentStepConfig.questions[0]) => {
    const val = state.answers[q.id];

    if (q.type === 'likert') {
      return (
        <div className="grid grid-cols-5 gap-2 sm:gap-4 mt-3">
          {[
            { score: 1, label: 'No ocurre' },
            { score: 2, label: 'Ocurre poco' },
            { score: 3, label: 'Ocurre parcialmente' },
            { score: 4, label: 'Ocurre frecuentemente' },
            { score: 5, label: 'Ocurre siempre' }
          ].map(({ score, label }) => (
            <div key={score} className="flex flex-col items-center">
              <button
                onClick={() => handleAnswer(q.id, score)}
                className={`
                  w-full h-12 sm:h-14 rounded-lg font-bold text-lg border transition-all cursor-pointer
                  ${val === score
                    ? 'bg-primary text-white border-primary ring-2 ring-offset-2 ring-primary dark:ring-offset-slate-900'
                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-gray-50 dark:hover:bg-slate-700'
                  }
                `}
              >
                {score}
              </button>
              <span className="text-[10px] sm:text-xs text-center text-gray-500 dark:text-gray-400 mt-2 font-medium leading-tight">
                {label}
              </span>
            </div>
          ))}
        </div>
      );
    }

    if (q.type === 'select') {
      return (
        <div className="grid grid-cols-1 gap-2 mt-3">
          {q.options?.map((opt) => (
            <button
              key={opt}
              onClick={() => handleAnswer(q.id, opt)}
              className={`
                px-4 py-3 rounded-lg text-left border transition-all text-sm sm:text-base
                ${val === opt
                  ? 'bg-accent1/10 text-primary dark:text-accent1 border-accent1 font-medium'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700'
                }
              `}
            >
              {opt}
            </button>
          ))}
        </div>
      );
    }

    if (q.type === 'multiselect') {
      const currentSelected = (val as string[]) || [];
      const isMaxReached = q.maxSelections ? currentSelected.length >= q.maxSelections : false;

      const toggleSelection = (opt: string) => {
        if (currentSelected.includes(opt)) {
          handleAnswer(q.id, currentSelected.filter(s => s !== opt));
        } else {
          if (!isMaxReached) {
            handleAnswer(q.id, [...currentSelected, opt]);
          }
        }
      };

      return (
        <div className="grid grid-cols-1 gap-2 mt-3">
          {q.options?.map((opt) => {
            const isSelected = currentSelected.includes(opt);
            const disabled = !isSelected && isMaxReached;
            return (
              <button
                key={opt}
                onClick={() => toggleSelection(opt)}
                disabled={disabled}
                className={`
                                px-4 py-3 rounded-lg text-left border transition-all text-sm sm:text-base
                                ${isSelected
                    ? 'bg-accent1/10 text-primary dark:text-accent1 border-accent1 font-medium'
                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                  }
                                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-slate-700'}
                            `}
              >
                <div className="flex justify-between items-center">
                  {opt}
                  {isSelected && <CheckCircleIcon />}
                </div>
              </button>
            )
          })}
          <p className="text-xs text-gray-500 mt-2">
            Seleccionado: {currentSelected.length} / {q.maxSelections}
          </p>
        </div>
      );
    }

    if (q.type === 'text') {
      // Force bg-white and text-gray-900 to ensure high contrast regardless of dark mode preference in this specific input
      return (
        <input
          type={q.id === 'email' ? 'email' : 'text'}
          className="w-full mt-3 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent1 focus:border-transparent outline-none bg-white text-gray-900 placeholder-gray-400"
          placeholder={q.id === 'email' ? 'nombre@empresa.com' : 'Escribe aquí...'}
          value={(val as string) || ''}
          onChange={(e) => handleAnswer(q.id, e.target.value)}
        />
      )
    }

    if (q.type === 'boolean') {
      return (
        <label className="flex items-start gap-3 mt-4 cursor-pointer group p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800">
          <input
            type="checkbox"
            className="w-5 h-5 text-accent1 border-gray-300 rounded focus:ring-accent1 mt-0.5"
            checked={(val as boolean) || false}
            onChange={(e) => handleAnswer(q.id, e.target.checked)}
          />
          <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">{q.text}</span>
        </label>
      )
    }

    if (q.type === 'mini_result') {
      const miniResults = calculateResults(state.answers);
      const getExposureLevel = (score: number) => {
        if (score < 40) return { level: 'Alta', color: 'bg-red-500', text: 'text-red-500', emoji: '🔴' };
        if (score < 70) return { level: 'Media', color: 'bg-amber-500', text: 'text-amber-500', emoji: '🟡' };
        return { level: 'Baja', color: 'bg-green-500', text: 'text-green-500', emoji: '🟢' };
      };
      const d3Score = miniResults.dimensionScores.find(d => d.id === 'D3')?.score || 0;
      const exposure = getExposureLevel(d3Score);

      const getInsight = (score: number) => {
        if (score < 40) return {
          title: "Alerta en Retención de Talento",
          desc: "Tus respuestas indican riesgos significativos en clima y rotación. Las empresas con esta puntuación suelen perder hasta un 30% de talento clave anualmente.",
          action: "Completa el diagnóstico para descubrir las 4 áreas restantes."
        };
        if (score < 70) return {
          title: "Área de Mejora Detectada",
          desc: "Tienes bases sólidas pero hay oportunidad clara de fortalecer tu estrategia de talento antes de que se convierta en un problema crítico.",
          action: "5 preguntas más para un diagnóstico completo."
        };
        return {
          title: "¡Excelente gestión del clima!",
          desc: "Tu organización muestra fortalezas en retención. Veamos cómo optimizar el resto de dimensiones para mantener esa ventaja.",
          action: "Descubre tu puntuación global en 5 preguntas más."
        };
      };

      const insight = getInsight(d3Score);

      return (
        <div className="mt-4 p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700">
          {/* Header con resultado */}
          <div className="text-center mb-6">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Vista previa basada en 3 dimensiones</p>
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold text-lg ${exposure.color}`}>
              <span className="text-2xl">{exposure.emoji}</span>
              Exposición {exposure.level}
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Dimension Clima y Retención: {d3Score}/100
            </p>
          </div>

          {/* Insight personalizado */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{insight.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{insight.desc}</p>
          </div>

          {/* CTA */}
          <div className="text-center p-4 bg-gradient-to-r from-accent1/10 to-accent2/10 dark:from-accent1/20 dark:to-accent2/20 rounded-lg border border-accent1/30">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {insight.action}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              ⏱️ 2 minutos más • Informe ejecutivo incluido
            </p>
          </div>

          {/* Preview de qué falta */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Falta evaluar: Equipos Híbridos • Adaptación • Sucesión • Gobernanza IA
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-bgLight dark:bg-darkBg pb-20 transition-colors duration-300">
      {/* Progress Bar */}
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
          <span className="flex items-center gap-1 cursor-pointer hover:text-primary dark:hover:text-white">
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Guardado auto</span>
          </span>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary dark:text-white mb-2">
            {currentStepConfig.title}
          </h2>
          {(currentStepConfig as any).subtitle && (
            <p className="text-base text-gray-500 dark:text-gray-400">
              {(currentStepConfig as any).subtitle}
            </p>
          )}
        </div>

        <div className="space-y-8 sm:space-y-12">
          {currentStepConfig.questions[0]?.type === 'likert' && (
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium italic mb-2">
              Selecciona una opción en cada afirmación para continuar.
            </p>
          )}
          {currentStepConfig.questions.map((q) => {
            const ans = state.answers[q.id];
            let isMissing = false;
            if (q.required !== false) {
              if (q.type === 'boolean' && q.required && ans !== true) isMissing = true;
              else if (q.type === 'multiselect' && Array.isArray(ans) && ans.length === 0) isMissing = true;
              else if (q.required && (!ans || (typeof ans === 'string' && ans.trim() === ''))) isMissing = true;
              else if (ans === undefined || ans === null) isMissing = true;
            }
            const isError = showValidation && isMissing;

            return (
              <div key={q.id} className={`animate-fade-in-up p-4 rounded-xl transition-colors ${isError ? 'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 -mx-4' : ''}`}>
                {q.type !== 'boolean' && (
                  <>
                    <h3 className={`text-lg font-medium mb-1 flex items-start justify-between ${isError ? 'text-red-600 dark:text-red-400 font-bold' : 'text-gray-800 dark:text-gray-200'}`}>
                      <span>
                        {q.text} {q.required && <span className="text-red-500">*</span>}
                      </span>
                      {isError && <span className="text-xs ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full whitespace-nowrap dark:bg-red-900/40 dark:text-red-300">Respuesta requerida</span>}
                    </h3>
                    {q.hint && (
                      <p className={`text-sm italic mb-3 ${isError ? 'text-red-500/80 dark:text-red-400/80' : 'text-gray-500 dark:text-gray-400'}`}>
                        {q.hint}
                      </p>
                    )}
                  </>
                )}
                {isError && q.type === 'boolean' && (
                  <div className="text-xs text-red-600 dark:text-red-400 font-bold mb-2">Debes marcar esta casilla para continuar:</div>
                )}
                {renderInput(q)}
              </div>
            );
          })}
        </div>

        {/* Navigation */}
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
                <p className="text-xs text-red-600 dark:text-red-400 font-bold mb-2 text-center animate-pulse">
                  Revisa las respuestas marcadas en rojo para continuar.
                </p>
              )}
              {missingCount > 0 && !showValidation && (
                <p className="text-xs text-amber-600 dark:text-amber-500 font-bold mb-2 text-center">
                  Te {missingCount === 1 ? 'falta' : 'faltan'} {missingCount} {missingCount === 1 ? 'respuesta' : 'respuestas'} en esta pantalla.
                </p>
              )}
              <Button
                fullWidth
                onClick={nextStep}
                disabled={false}
              >
                {state.step === 0
                  ? 'Ver mi perfil de riesgo →'
                  : state.step === 1
                    ? 'Continuar diagnóstico completo →'
                    : state.step === WIZARD_STEPS.length - 1
                      ? 'Generar mi informe ejecutivo'
                      : 'Siguiente'
                }
                {state.step !== WIZARD_STEPS.length - 1 && state.step !== 0 && state.step !== 1 && <ChevronRight className="w-5 h-5 ml-1" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckCircleIcon = () => (
  <svg className="w-5 h-5 text-accent1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

export default RadarWizard;