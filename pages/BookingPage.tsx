import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const [calendlyOpened, setCalendlyOpened] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const bookingFiredRef = React.useRef(false);  // reliable double-fire guard

    useEffect(() => {
        const saved = localStorage.getItem('radar_state');
        if (saved) {
            setState(JSON.parse(saved));
        } else {
            navigate('/'); // No state, go home
        }
    }, [navigate]);

    const openCalendly = () => {
        const name = `${state?.answers['firstname'] || ''} ${state?.answers['lastname'] || ''}`.trim();
        const email = state?.answers['email'] as string || '';
        const url = `${APP_CONFIG.CALENDLY_URL}?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
        setCalendlyOpened(true);
    };

    const handleBookingSuccess = async () => {
        if (bookingFiredRef.current) return;
        bookingFiredRef.current = true;
        setIsSending(true);

        logEvent(AnalyticsEvent.BOOK_CALL_CLICKED, { status: 'confirmed' });
        logEvent(AnalyticsEvent.BOOK_CALL_COMPLETE);

        const savedRaw = localStorage.getItem('radar_state');
        if (savedRaw) {
            const freshState = JSON.parse(savedRaw);
            freshState.answers['meeting_optin'] = "Sí, Confirmed Booking";
            localStorage.setItem('radar_state', JSON.stringify(freshState));
            await triggerWebhook(freshState, true);
        }

        setIsBooked(true);
        setIsSending(false);
        // Small delay so user sees the success screen before navigating
        setTimeout(() => navigate('/resultado'), 2000);
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
                <div className="max-w-2xl mx-auto w-full space-y-6">

                    {isBooked ? (
                        /* SUCCESS STATE */
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-12 text-center border-2 border-green-400">
                            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">¡Sesión Confirmada!</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">Preparando tu informe ejecutivo personalizado...</p>
                            <div className="w-10 h-10 border-4 border-accent1 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        </div>
                    ) : (
                        <>
                            {/* STEP 1: Open Calendly */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border-2 border-accent1 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-accent1/10 rounded-full mb-4">
                                    <span className="text-3xl">📅</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Paso 1 — Selecciona tu horario</h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                                    Abre el calendario, elige día y hora, y completa tu reserva.
                                    Tu nombre y email ya estarán pre-rellenados.
                                </p>
                                <button
                                    onClick={openCalendly}
                                    className="bg-accent1 hover:bg-accent1/90 text-white font-bold py-4 px-10 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105 inline-flex items-center gap-2"
                                >
                                    <span>📅</span> Abrir calendario y reservar sesión
                                </button>
                                {calendlyOpened && (
                                    <p className="mt-3 text-xs text-green-600 dark:text-green-400 font-medium">✓ El calendario se ha abierto en una nueva pestaña</p>
                                )}
                            </div>

                            {/* STEP 2: Confirm booking */}
                            <div className={`rounded-2xl p-8 border-2 text-center transition-all ${
                                calendlyOpened
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600 shadow-xl'
                                    : 'bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 opacity-60'
                            }`}>
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-800/30 rounded-full mb-4">
                                    <span className="text-3xl">✅</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Paso 2 — Confirmar y recibir informe</h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                                    Una vez hayas completado la reserva en Calendly, pulsa aquí para recibir
                                    tu <strong>informe ejecutivo personalizado</strong> por email.
                                </p>
                                <button
                                    onClick={handleBookingSuccess}
                                    disabled={isSending}
                                    className="bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-bold py-4 px-10 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105 inline-flex items-center gap-2"
                                >
                                    {isSending ? (
                                        <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Enviando informe...</>
                                    ) : (
                                        <>✅ He reservado mi sesión → Enviarme el informe</>
                                    )}
                                </button>
                            </div>

                            {/* Skip link */}
                            <div className="text-center text-sm text-gray-400">
                                <button onClick={() => navigate('/resultado')} className="underline hover:text-gray-300">
                                    Omitir y ver los resultados directamente →
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
