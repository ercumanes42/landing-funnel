import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InlineWidget, useCalendlyEventListener } from 'react-calendly';
import { ArrowRight, Lock, CheckCircle, AlertTriangle } from 'lucide-react';
import Button from '../components/Button';
import { APP_CONFIG } from '../constants';
import { logEvent, AnalyticsEvent } from '../utils/analytics';
import { SurveyState } from '../types';
import { calculateResults } from '../utils/scoring';

const BookingPage: React.FC = () => {
    const navigate = useNavigate();
    const [state, setState] = useState<SurveyState | null>(null);
    const [isBooked, setIsBooked] = useState(false);
    const [isEmailed, setIsEmailed] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('radar_state');
        if (saved) {
            setState(JSON.parse(saved));
        } else {
            navigate('/'); // No state, go home
        }
    }, [navigate]);

    // 1. Official hook from react-calendly
    useCalendlyEventListener({
        onEventScheduled: (e) => {
            console.log("Calendly Event Scheduled (Hook):", e.data);
            handleBookingSuccess();
        }
    });

    // 2. Manual fallback for message communication
    useEffect(() => {
        const handleManualMessage = (e: MessageEvent) => {
            // Check for both common event formats
            if (e.data.event === 'calendly.event_scheduled' || 
                (typeof e.data === 'string' && e.data.includes('event_scheduled'))) {
                console.log("Calendly Event Scheduled (Manual):", e.data);
                handleBookingSuccess();
            }
        };

        window.addEventListener('message', handleManualMessage);
        return () => window.removeEventListener('message', handleManualMessage);
    }, [state]);

    const handleBookingSuccess = () => {
        if (isBooked) return; // Prevent double firing
        setIsBooked(true);
        logEvent(AnalyticsEvent.BOOK_CALL_CLICKED, { status: 'confirmed' });
        logEvent(AnalyticsEvent.BOOK_CALL_COMPLETE);

        // 1. Update Local Storage to Unlocked
        if (state) {
            const newState = { ...state };
            newState.answers['meeting_optin'] = "Sí, Confirmed Booking";
            localStorage.setItem('radar_state', JSON.stringify(newState));
            // Trigger Webhook Here ensuring "BOOKED" status
            triggerWebhook(newState, true);
        }

        // 2. Delay redirect slightly for UX
        setTimeout(() => {
            localStorage.removeItem('radar_state'); // Clear to prevent contaminating next test
            navigate('/resultado');
        }, 2000);
    };

    const handleSkip = () => {
        // User chose NOT to book - save "Skipped" status to localStorage
        logEvent(AnalyticsEvent.SKIP_BOOKING);

        if (state) {
            const newState = { ...state };
            newState.answers['meeting_optin'] = "Skipped"; // Explicitly mark as skipped
            localStorage.setItem('radar_state', JSON.stringify(newState));
            // Trigger webhook with "Skipped" so Make.com knows this lead needs retargeting
            triggerWebhook(newState, false);
        }

        setIsEmailed(true);
    };

    const triggerWebhook = (surveyState: SurveyState, confirmed: boolean) => {
        if (APP_CONFIG.POST_ENDPOINT_URL) {
            // Calculate results for the email link
            const calculated = calculateResults(surveyState.answers);

            const payload = {
                contact: {
                    name: surveyState.answers['firstname'],
                    firstname: surveyState.answers['firstname'],
                    lastname: surveyState.answers['lastname'],
                    email: surveyState.answers['email'],
                    company: surveyState.answers['company'],
                    role: surveyState.answers['role'],
                    company_size: surveyState.answers['company_size'],
                    sector: surveyState.answers['sector'],
                    work_model: surveyState.answers['work_model'],
                    pain_point: surveyState.answers['pain_point'],
                    pain_point_1: Array.isArray(surveyState.answers['pain_point']) ? surveyState.answers['pain_point'][0] || "" : "",
                    pain_point_2: Array.isArray(surveyState.answers['pain_point']) ? surveyState.answers['pain_point'][1] || "" : "",
                    pain_point_3: Array.isArray(surveyState.answers['pain_point']) ? surveyState.answers['pain_point'][2] || "" : "",
                    pain_points_txt: Array.isArray(surveyState.answers['pain_point']) ? surveyState.answers['pain_point'].join(", ") : surveyState.answers['pain_point']
                },
                survey: {
                    globalScore: calculated.globalScore,
                    // Individual dimension scores for URL construction
                    d1: calculated.dimensionScores.find(d => d.id === "D1")?.score || 0,
                    d2: calculated.dimensionScores.find(d => d.id === "D2")?.score || 0,
                    d3: calculated.dimensionScores.find(d => d.id === "D3")?.score || 0,
                    d4: calculated.dimensionScores.find(d => d.id === "D4")?.score || 0,
                    t: calculated.dimensionScores.find(d => d.id === "T")?.score || 0,
                    // Top 3 risk dimension IDs for URL
                    r1: calculated.topRisks[0]?.dimension || "D1",
                    r2: calculated.topRisks[1]?.dimension || "D2",
                    r3: calculated.topRisks[2]?.dimension || "T",
                    answers: surveyState.answers
                },
                meta: {
                    timestamp: new Date().toISOString(),
                    meetingOptIn: confirmed ? "Confirmed Booking" : "Skipped",
                    isUnlocked: confirmed
                }
            };

            console.log("Payload being sent:", JSON.stringify(payload, null, 2));

            // Enhanced Reliability: Always use fetch to communicate with Make.com (SendBeacon can fail on non-standard JSON headers)
            fetch(APP_CONFIG.POST_ENDPOINT_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload),
                cache: 'no-cache', // Prevents Safari/Chrome from caching the POST secretly
                keepalive: true
            }).then(r => {
                console.log("Webhook FINAL fired via Fetch. Status:", r.status);
                if (!r.ok) {
                    console.error("Make.com rejected the payload with status", r.status);
                }
            }).catch(err => {
                console.error("Fetch Network error:", err);
                logEvent(AnalyticsEvent.ERROR_SHOWN, { method: "booking_webhook_error", error: String(err) });
            });
        }
    };

    const calculated = state ? calculateResults(state.answers) : null;

    const getNivelExposicion = (score: number) => {
        if (score < 40) return "Alto (Crítico)";
        if (score < 70) return "Medio (En Transición)";
        return "Bajo (Sólido)";
    };

    const nivelExposicion = calculated ? getNivelExposicion(calculated.globalScore) : "";

    return (
        <div className="min-h-screen bg-bgLight dark:bg-darkBg flex flex-col items-center py-10 px-4 transition-colors duration-300">
            <div className="max-w-5xl w-full text-center space-y-6">

                <h1 className="text-3xl sm:text-4xl font-extrabold text-primary dark:text-white mb-8">
                    Resumen de tu diagnóstico (privado)
                </h1>

                {/* THE PARTIAL SUMMARY */}
                {calculated && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 mx-auto max-w-4xl text-left shadow-md">

                        <div className="flex flex-col sm:flex-row sm:items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                            <span className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider w-full sm:w-1/3 mb-2 sm:mb-0">Nivel de exposición:</span>
                            <span className={`px-4 py-1.5 text-sm font-bold rounded-full inline-block w-max ${calculated.globalScore < 40 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : calculated.globalScore < 70 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'}`}>
                                {nivelExposicion}
                            </span>
                        </div>

                        <div className="mb-6">
                            <span className="block text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-3">Tus 3 riesgos principales:</span>
                            <ul className="space-y-2">
                                {[0, 1, 2].map(i => {
                                    const risk = calculated.topRisks[i];
                                    if (!risk) return null;
                                    const dimLabel = calculated.dimensionScores.find(d => d.id === risk.dimension)?.label;
                                    return (
                                        <li key={i} className="flex items-start">
                                            <AlertTriangle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" />
                                            <span className="text-gray-800 dark:text-gray-200 font-medium">{dimLabel}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        <div className="mb-6">
                            <span className="block text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-3">Prioridades recomendadas (top 2):</span>
                            <ul className="space-y-3">
                                {[0, 1].map(i => {
                                    if (!calculated.quickWins[i]) return null;
                                    return (
                                        <li key={i} className="flex items-start bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                                            <div className="w-6 h-6 rounded-full bg-accent1/20 text-accent1 flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">{i + 1}</div>
                                            <span className="text-gray-700 dark:text-gray-300 text-sm">{calculated.quickWins[i]}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-700 bg-accent1/10 p-4 rounded-xl text-center">
                            <p className="text-primary dark:text-accent1 font-bold">
                                El informe completo incluye el detalle y un plan de acción por cada prioridad.
                            </p>
                        </div>
                    </div>
                )}

                {/* Two Options Layout */}
                <div className="grid md:grid-cols-2 gap-6 mt-8">

                    {/* OPTION A: Book a Call (Recommended) */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border-2 border-accent1 overflow-hidden relative">
                        {/* Recommended Badge */}
                        <div className="absolute top-0 right-0 bg-accent1 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                            RECOMENDADO
                        </div>

                        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-primary dark:text-white">Revisión 15 min (recomendada)</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Te explico el resultado y te doy un plan de acción inicial para tus 2 prioridades.
                            </p>
                        </div>

                        {isBooked ? (
                            <div className="h-[450px] flex flex-col items-center justify-center animate-fade-in">
                                <CheckCircle className="w-16 h-16 text-green-500 mb-4 animate-bounce" />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">¡Sesión Confirmada!</h2>
                                <p className="text-gray-500 dark:text-gray-400 mb-4">Preparando tu informe...</p>
                                <div className="w-10 h-10 border-4 border-accent1 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="h-[450px] w-full">
                                <InlineWidget
                                    url={APP_CONFIG.CALENDLY_URL}
                                    styles={{ height: '100%', width: '100%' }}
                                    prefill={{
                                        email: state?.answers['email'] as string,
                                        name: `${state?.answers['firstname']} ${state?.answers['lastname']}`,
                                        customAnswers: {
                                            a1: state?.answers['company'] as string
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* OPTION B: Skip and View Summary */}
                    {!location.search.includes('retry=true') && (
                        isEmailed ? (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 flex flex-col justify-center items-center h-full min-h-[450px] text-center animate-fade-in-up">
                                <CheckCircle className="w-16 h-16 text-green-500 mb-6" />
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">¡Solicitud recibida!</h3>
                                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                                    Recibirás tu informe completo en la bandeja de entrada de tu email corporativo en aproximadamente 5 minutos.
                                </p>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col justify-between h-full min-h-[450px]">
                                <div>
                                    <h3 className="text-lg font-bold text-primary dark:text-white mb-2">Prefiero no agendar (por ahora)</h3>
                                    <p className="text-gray-600 dark:text-gray-300 mb-4 mt-2">
                                        Te lo enviamos por email en 5 minutos.
                                    </p>
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={handleSkip}
                                    fullWidth
                                    className="mt-6 dark:bg-slate-700 dark:text-white dark:border-slate-600"
                                >
                                    <ArrowRight className="w-4 h-4 mr-2" />
                                    Enviar informe a mi correo
                                </Button>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
