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
    const bookingFiredRef = React.useRef(false);  // reliable double-fire guard

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
            // Calendly may send either an object or a JSON string
            let eventData = e.data;
            if (typeof e.data === 'string') {
                try { eventData = JSON.parse(e.data); } catch { /* not JSON */ }
            }
            if (eventData?.event === 'calendly.event_scheduled') {
                console.log("Calendly Event Scheduled (Manual postMessage):", eventData);
                handleBookingSuccess();
            }
        };

        window.addEventListener('message', handleManualMessage);
        return () => window.removeEventListener('message', handleManualMessage);
    }, [state]);

    const handleBookingSuccess = async () => {
        // Prevent double firing with a reliable ref guard
        if (bookingFiredRef.current) {
            console.log("handleBookingSuccess: already fired, ignoring duplicate.");
            return;
        }
        bookingFiredRef.current = true;
        setIsBooked(true);

        // We run this logic manually after ensuring isBooked check
        logEvent(AnalyticsEvent.BOOK_CALL_CLICKED, { status: 'confirmed' });
        logEvent(AnalyticsEvent.BOOK_CALL_COMPLETE);

        // Read freshest state from localStorage (avoids stale closure)
        const savedRaw = localStorage.getItem('radar_state');
        if (savedRaw) {
            const freshState = JSON.parse(savedRaw);
            freshState.answers['meeting_optin'] = "Sí, Confirmed Booking";
            localStorage.setItem('radar_state', JSON.stringify(freshState));

            // CRITICAL FIX: await the webhook so Make.com receives it BEFORE navigate() kills the request
            await triggerWebhook(freshState, true);
        }

        // Only navigate AFTER the webhook has fully completed
        navigate('/resultado');
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

    const triggerWebhook = async (surveyState: SurveyState, confirmed: boolean): Promise<void> => {
        if (!APP_CONFIG.POST_ENDPOINT_URL) return;

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
                meetingOptIn: confirmed ? "Sí, Confirmed Booking" : "Skipped",
                isUnlocked: confirmed
            }
        };

        console.log("Payload being sent:", JSON.stringify(payload, null, 2));

        try {
            // CRITICAL: await the fetch so the page does NOT navigate away before Make.com acknowledges
            const r = await fetch(APP_CONFIG.POST_ENDPOINT_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload),
                keepalive: true
            });
            console.log("Webhook FINAL fired via Fetch. Status:", r.status);
            if (!r.ok) {
                console.error("Make.com rejected the payload with status", r.status);
            }
        } catch (err) {
            console.error("Fetch Network error:", err);
            logEvent(AnalyticsEvent.ERROR_SHOWN, { method: "booking_webhook_error", error: String(err) });
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

                <div className="mb-4">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-primary dark:text-white mb-2">
                        📅 Asegura tu Análisis de Prioridades
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Selecciona un horario para interpretar tus resultados y definir los 3 primeros pasos de tu hoja de ruta.
                    </p>
                </div>

                {/* Main Booking Container */}
                <div className="max-w-4xl mx-auto w-full">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border-2 border-accent1 overflow-hidden relative">
                        {/* Recommended Badge */}
                        <div className="absolute top-0 right-0 bg-accent1 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                            SESIÓN GRATUITA (15 MIN)
                        </div>

                        {isBooked ? (
                            <div className="h-[550px] flex flex-col items-center justify-center animate-fade-in">
                                <CheckCircle className="w-16 h-16 text-green-500 mb-4 animate-bounce" />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">¡Sesión Confirmada!</h2>
                                <p className="text-gray-500 dark:text-gray-400 mb-4">Estamos preparando tu informe ejecutivo personalizado...</p>
                                <div className="w-10 h-10 border-4 border-accent1 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="h-[550px] w-full">
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

                    {/* Manual Confirmation Button - shown only if not yet booked */}
                    {!isBooked && (
                        <div className="mt-6 bg-green-50 dark:bg-green-900/20 border-2 border-green-400 dark:border-green-600 rounded-2xl p-6 text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                ✅ <strong>¿Ya has seleccionado tu horario en el calendario?</strong><br/>
                                Pulsa el botón para confirmar y recibir tu informe ejecutivo personalizado.
                            </p>
                            <button
                                onClick={handleBookingSuccess}
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-xl text-base transition-colors shadow-lg hover:shadow-xl"
                            >
                                ✅ He agendado mi sesión → Enviarme el informe
                            </button>
                        </div>
                    )}

                    <div className="mt-6 text-center text-sm text-gray-400">
                        <button onClick={() => navigate('/resultado')} className="underline hover:text-gray-300">
                            Omitir y ver los resultados directamente →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
