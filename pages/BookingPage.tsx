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
    const bookingFiredRef = React.useRef(false);

    useEffect(() => {
        const saved = localStorage.getItem('radar_state');
        if (saved) {
            setState(JSON.parse(saved));
        } else {
            navigate('/'); // No state, go home
        }
    }, [navigate]);

    // Calendly official hook
    useCalendlyEventListener({
        onEventScheduled: (e) => {
            console.log("[BookingPage] Calendly event_scheduled detected:", e.data);
            handleBookingSuccess();
        }
    });

    // Fallback: listen for raw postMessage from Calendly iframe
    useEffect(() => {
        const handleMsg = (e: MessageEvent) => {
            let data = e.data;
            if (typeof data === 'string') {
                try { data = JSON.parse(data); } catch { return; }
            }
            if (data?.event === 'calendly.event_scheduled') {
                console.log("[BookingPage] postMessage fallback detected");
                handleBookingSuccess();
            }
        };
        window.addEventListener('message', handleMsg);
        return () => window.removeEventListener('message', handleMsg);
    }, []);

    const handleBookingSuccess = async () => {
        if (bookingFiredRef.current) return;
        bookingFiredRef.current = true;

        logEvent(AnalyticsEvent.BOOK_CALL_CLICKED, { status: 'confirmed' });
        logEvent(AnalyticsEvent.BOOK_CALL_COMPLETE);

        // Show success screen immediately
        setIsBooked(true);

        // Build and fire webhook using the unified triggerWebhook method
        const savedRaw = localStorage.getItem('radar_state');
        if (savedRaw) {
            try {
                const freshState = JSON.parse(savedRaw);
                // Mark as confirmed in local state
                freshState.answers['meeting_optin'] = "Sí, Confirmed Booking";
                localStorage.setItem('radar_state', JSON.stringify(freshState));
                
                // Add a maximum wait time of 3 seconds for Make.com to respond
                const timeoutPromise = new Promise(resolve => setTimeout(resolve, 3000));
                await Promise.race([
                    triggerWebhook(freshState, true),
                    timeoutPromise
                ]);
            } catch (e) {
                console.error('[BookingPage] Error building payload:', e);
            }
        }

        // Navigate after webhook completes (or errors)
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
                        <div className="absolute top-0 right-0 bg-accent1 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                            SESIÓN GRATUITA (15 MIN)
                        </div>

                        {isBooked ? (
                            <div className="h-[550px] flex flex-col items-center justify-center">
                                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">¡Sesión Confirmada!</h2>
                                <p className="text-gray-500 dark:text-gray-400 mb-4">Preparando tu informe ejecutivo personalizado...</p>
                                <div className="w-10 h-10 border-4 border-accent1 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="h-[550px] w-full">
                                <InlineWidget
                                    url={APP_CONFIG.CALENDLY_URL}
                                    styles={{ height: '100%', width: '100%' }}
                                    prefill={{
                                        email: state?.answers['email'] as string,
                                        name: `${state?.answers['firstname'] || ''} ${state?.answers['lastname'] || ''}`.trim(),
                                        customAnswers: { a1: state?.answers['company'] as string }
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Skip link */}
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
