import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InlineWidget, useCalendlyEventListener } from 'react-calendly';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { APP_CONFIG, STORAGE_KEY } from '../constants';
import { buildResultAnalyticsPayload, logEvent, AnalyticsEvent } from '../utils/analytics';
import { SurveyState } from '../types';
import { calculateResults } from '../utils/scoring';

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<SurveyState | null>(null);
  const [isBooked, setIsBooked] = useState(false);
  const bookingFiredRef = React.useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setState(JSON.parse(saved));
    } else {
      navigate('/');
    }
  }, [navigate]);

  const buildPayload = (surveyState: SurveyState, confirmed: boolean) => {
    const calculated = calculateResults(surveyState.answers);
    const firstRisk = calculated.topRisks[0]?.dimension || "D1";
    const firstRiskLabel = calculated.dimensionScores.find(d => d.id === firstRisk)?.label || "";

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
        pain_point_2: calculated.dimensionScores.find(d => d.id === calculated.topRisks[1]?.dimension)?.label || "",
        pain_point_3: calculated.dimensionScores.find(d => d.id === calculated.topRisks[2]?.dimension)?.label || "",
        pain_points_txt: calculated.topRisks
          .map(r => calculated.dimensionScores.find(d => d.id === r.dimension)?.label)
          .filter(Boolean)
          .join(", ")
      },
      survey: {
        globalScore: calculated.globalScore,
        d1: calculated.dimensionScores.find(d => d.id === "D1")?.score || 0,
        d2: calculated.dimensionScores.find(d => d.id === "D2")?.score || 0,
        d3: calculated.dimensionScores.find(d => d.id === "D3")?.score || 0,
        d4: calculated.dimensionScores.find(d => d.id === "D4")?.score || 0,
        t: calculated.dimensionScores.find(d => d.id === "T")?.score || 0,
        r1: calculated.topRisks[0]?.dimension || "D1",
        r2: calculated.topRisks[1]?.dimension || "D2",
        r3: calculated.topRisks[2]?.dimension || "T",
        risks: calculated.topRisks,
        scores: calculated.dimensionScores.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.score }), {} as Record<string, number>),
        answers: surveyState.answers
      },
      meta: {
        timestamp: new Date().toISOString(),
        meetingOptIn: confirmed ? "Confirmed Booking" : "Skipped",
        reportDelivery: "all_completed_leads",
        conversionLogic: "report_for_internal_review_booking_for_interpretation",
        isUnlocked: confirmed
      }
    };
  };

  const triggerWebhook = async (surveyState: SurveyState, confirmed: boolean): Promise<void> => {
    if (!APP_CONFIG.POST_ENDPOINT_URL) return;

    try {
      const response = await fetch(APP_CONFIG.POST_ENDPOINT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(buildPayload(surveyState, confirmed)),
        keepalive: true
      });

      if (!response.ok) {
        console.error("Make.com rejected the booking payload with status", response.status);
      }
    } catch (err) {
      console.error("Booking webhook network error:", err);
      logEvent(AnalyticsEvent.WEBHOOK_ERROR, { method: "booking_webhook_error", error: String(err) });
    }
  };

  const handleBookingSuccess = async () => {
    if (bookingFiredRef.current) return;
    bookingFiredRef.current = true;

    const savedRaw = localStorage.getItem(STORAGE_KEY);
    const freshState = savedRaw ? JSON.parse(savedRaw) : null;
    const calculated = freshState ? calculateResults(freshState.answers) : null;

    logEvent(AnalyticsEvent.BOOKING_CONFIRMED, {
      ...(calculated ? buildResultAnalyticsPayload(calculated) : {}),
      status: 'confirmed'
    });
    setIsBooked(true);

    if (freshState) {
      try {
        freshState.answers['meeting_optin'] = "Confirmed Booking";
        localStorage.setItem(STORAGE_KEY, JSON.stringify(freshState));

        const timeoutPromise = new Promise(resolve => setTimeout(resolve, 3000));
        await Promise.race([
          triggerWebhook(freshState, true),
          timeoutPromise
        ]);
      } catch (e) {
        console.error('[BookingPage] Error building payload:', e);
      }
    }

    navigate('/resultado');
  };

  useCalendlyEventListener({
    onEventScheduled: () => {
      handleBookingSuccess();
    }
  });

  useEffect(() => {
    const handleMsg = (e: MessageEvent) => {
      let data = e.data;
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch { return; }
      }
      if (data?.event === 'calendly.event_scheduled') {
        handleBookingSuccess();
      }
    };

    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, []);

  const handleSkip = async () => {
    if (bookingFiredRef.current) return;
    bookingFiredRef.current = true;

    if (state) {
      const newState = { ...state, answers: { ...state.answers, meeting_optin: "Skipped" } };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      const calculated = calculateResults(newState.answers);

      logEvent(AnalyticsEvent.BOOKING_SKIPPED, {
        ...buildResultAnalyticsPayload(calculated),
        status: 'skipped'
      });

      const timeoutPromise = new Promise(resolve => setTimeout(resolve, 3000));
      await Promise.race([
        triggerWebhook(newState, false),
        timeoutPromise
      ]);
    }

    navigate('/resultado');
  };

  const calculated = state ? calculateResults(state.answers) : null;
  const mainRisk = calculated?.topRisks[0];
  const mainRiskLabel = calculated?.dimensionScores.find(d => d.id === mainRisk?.dimension)?.label || "Coste invisible";

  return (
    <div className="min-h-screen bg-bgLight dark:bg-darkBg py-8 px-4 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/resultado')}
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al resultado
        </button>

        <div className="text-center mb-6">
          <p className="text-sm font-bold uppercase tracking-wide text-accent1">Interpretación ejecutiva de 15 minutos</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-primary dark:text-white mt-2">
            Saber qué palanca mover primero
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mt-3">
            Ya tienes el informe. Esta revisión no es para repetirlo: es para traducir {mainRiskLabel} en una prioridad defendible ante Dirección, RRHH u Operaciones.
          </p>
        </div>

        <div className="max-w-4xl mx-auto w-full">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden relative">
            <div className="absolute top-0 right-0 bg-accent1 text-white text-xs font-bold px-3 py-1 rounded-bl-md z-10">
              SIN DEMO NI PREPARACION
            </div>

            {isBooked ? (
              <div className="h-[550px] flex flex-col items-center justify-center">
                <CheckCircle className="w-16 h-16 text-green-600 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sesión confirmada</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Guardando tu diagnóstico y volviendo al resultado...</p>
                <div className="w-10 h-10 border-4 border-accent1 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="h-[550px] w-full">
                <InlineWidget
                  url={APP_CONFIG.CALENDLY_URL}
                  styles={{ height: '100%', width: '100%' }}
                  prefill={{
                    email: state?.answers['email'] as string,
                    name: `${state?.answers['firstname'] || ''}`.trim(),
                    customAnswers: { a1: mainRiskLabel }
                  }}
                />
              </div>
            )}
          </div>

          <div className="mt-6 text-center flex flex-col items-center justify-center">
            <button
              onClick={handleSkip}
              className="w-full max-w-md py-4 px-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-[0.98]"
            >
              Volver al informe ejecutivo
            </button>
            <p className="mt-3 text-xs text-gray-400">
              El informe seguirá disponible para descargarlo y compartirlo internamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
