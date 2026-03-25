import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, Download } from 'lucide-react';
import Button from '../components/Button';
import PrintableReport from '../components/PrintableReport';
import { calculateResults } from '../utils/scoring';
import { ResultData, AnalyticsEvent } from '../types';
import { logEvent } from '../utils/analytics';
import { APP_CONFIG, DIMENSIONS, QUICK_WINS } from '../constants';

const Results: React.FC = () => {
    const navigate = useNavigate();
    const [results, setResults] = useState<ResultData | null>(null);
    const [isGuest, setIsGuest] = useState(false);
    const [showPDF, setShowPDF] = useState(false);
    const [isEmailed, setIsEmailed] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlScore = params.get('score');
        
        const getIntParam = (name: string) => {
            const val = params.get(name);
            if (!val || val.trim() === '') return 0;
            const parsed = parseInt(val);
            return isNaN(parsed) ? 0 : parsed;
        };

        const isDirectPdf = params.get('pdf') === 'true';

        if (urlScore !== null) {
            const d1 = getIntParam('d1');
            const d2 = getIntParam('d2');
            const d3 = getIntParam('d3');
            const d4 = getIntParam('d4');
            const t = getIntParam('t');
            
            const dimensionScores = [
                { id: "D1", label: DIMENSIONS.D1.label, score: d1, color: "#06b6d4" },
                { id: "D2", label: DIMENSIONS.D2.label, score: d2, color: "#3b82f6" },
                { id: "D3", label: DIMENSIONS.D3.label, score: d3, color: "#f59e0b" },
                { id: "D4", label: DIMENSIONS.D4.label, score: d4, color: "#6366f1" },
                { id: "T", label: DIMENSIONS.T.label, score: t, color: "#ec4899" }
            ];
            
            const sorted = [...dimensionScores].sort((a, b) => a.score - b.score);
            
            const guestResults: ResultData = {
                globalScore: getIntParam('score'),
                dimensionScores,
                topRisks: [
                    { dimension: sorted[0].id, score: sorted[0].score },
                    { dimension: sorted[1].id, score: sorted[1].score },
                    { dimension: sorted[2].id, score: sorted[2].score }
                ],
                quickWins: [
                    QUICK_WINS[sorted[0].id as keyof typeof QUICK_WINS],
                    QUICK_WINS[sorted[1].id as keyof typeof QUICK_WINS],
                    QUICK_WINS[sorted[2].id as keyof typeof QUICK_WINS]
                ].filter(Boolean)
            };
            setResults(guestResults);
            setIsGuest(true);
            if (isDirectPdf) {
                setShowPDF(true); // Using this to indicate direct PDF view
                setTimeout(() => window.print(), 500); // Auto trigger print dialog
            }
            return;
        }

        const saved = localStorage.getItem('radar_state');
        
        if (saved) {
            try {
                const state = JSON.parse(saved);
                if (!state.isCompleted) {
                    navigate('/radar');
                    return;
                }

                const calculated = calculateResults(state.answers);
                setResults(calculated);
                logEvent(AnalyticsEvent.REPORT_VIEW);
                logEvent(AnalyticsEvent.FINAL_RESULT_VIEW);
            } catch (e) {
                navigate('/');
            }
        } else {
            navigate('/');
        }
    }, [navigate]);

    if (!results) return <div className="min-h-screen flex items-center justify-center dark:text-white">Cargando...</div>;

    const notifyMake = async (status: string) => {
        const saved = localStorage.getItem('radar_state');
        if (!saved) return;
        
        try {
            const state = JSON.parse(saved);
            state.answers['meeting_optin'] = status;
            localStorage.setItem('radar_state', JSON.stringify(state));
            
            const calc = calculateResults(state.answers);
            const payload = {
                contact: {
                    name: state.answers['firstname'], firstname: state.answers['firstname'], lastname: state.answers['lastname'],
                    email: state.answers['email'], company: state.answers['company'], role: state.answers['role'],
                    company_size: state.answers['company_size'], sector: state.answers['sector'], work_model: state.answers['work_model'],
                    pain_point: state.answers['pain_point'],
                    pain_point_1: Array.isArray(state.answers['pain_point']) ? state.answers['pain_point'][0] || "" : "",
                    pain_point_2: Array.isArray(state.answers['pain_point']) ? state.answers['pain_point'][1] || "" : "",
                    pain_point_3: Array.isArray(state.answers['pain_point']) ? state.answers['pain_point'][2] || "" : "",
                    pain_points_txt: Array.isArray(state.answers['pain_point']) ? state.answers['pain_point'].join(", ") : state.answers['pain_point']
                },
                survey: {
                    globalScore: calc.globalScore, d1: calc.dimensionScores.find(d => d.id === "D1")?.score || 0,
                    d2: calc.dimensionScores.find(d => d.id === "D2")?.score || 0, d3: calc.dimensionScores.find(d => d.id === "D3")?.score || 0,
                    d4: calc.dimensionScores.find(d => d.id === "D4")?.score || 0, t: calc.dimensionScores.find(d => d.id === "T")?.score || 0,
                    r1: calc.topRisks[0]?.dimension || "D1", r2: calc.topRisks[1]?.dimension || "D2", r3: calc.topRisks[2]?.dimension || "T",
                    risks: calc.topRisks, scores: calc.dimensionScores.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.score }), {} as Record<string, number>),
                    answers: state.answers
                },
                meta: { timestamp: new Date().toISOString(), meetingOptIn: status, isUnlocked: false }
            };
            
            await fetch(APP_CONFIG.POST_ENDPOINT_URL, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(payload), 
                keepalive: true 
            });
        } catch(e) { 
            console.error("Error notifying Make:", e); 
        }
    };

    const handleBookCall = () => {
        logEvent(AnalyticsEvent.BOOK_CALL_CLICKED);
        navigate('/agendar');
    };

    const handleDownloadPDF = () => {
        logEvent(AnalyticsEvent.REPORT_DOWNLOAD);
        notifyMake("Downloaded Report");
        window.print();
    };

    if (showPDF) {
        return (
            <div className="min-h-screen bg-white">
                <PrintableReport results={results} />
                <div className="fixed bottom-4 right-4 print:hidden">
                    <Button onClick={() => setShowPDF(false)} className="bg-slate-600">
                        Volver
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 pb-20 text-white print:hidden">
            <div className="max-w-2xl mx-auto px-4 py-12">
                
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                        GFS Consulting
                    </h1>
                </div>

                {/* Resultado simplificado - Teaser */}
                <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 text-center mb-8">

                    {/* Check icon */}
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">
                        ¡Diagnóstico completado!
                    </h2>

                    <p className="text-slate-400 mb-6">
                        Tu informe ejecutivo llegará a tu email en <span className="text-white font-semibold">menos de 5 minutos</span>.
                    </p>

                    {/* Nivel de exposición */}
                    <div className="inline-flex items-center px-6 py-3 rounded-full font-bold mb-4 bg-slate-700">
                        {results.globalScore < 40 ? (
                            <span className="text-red-400">🔴 Exposición Alta</span>
                        ) : results.globalScore < 70 ? (
                            <span className="text-amber-400">🟡 Exposición Media</span>
                        ) : (
                            <span className="text-green-400">🟢 Exposición Baja</span>
                        )}
                    </div>

                    {/* Score global */}
                    <div className="mb-6">
                        <p className="text-sm text-slate-400 mb-1">Tu puntuación global</p>
                        <p className="text-4xl font-bold text-white">{results.globalScore}<span className="text-lg text-slate-500">/100</span></p>
                    </div>

                    {/* Área principal - solo 1 */}
                    {results.topRisks[0] && (
                        <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
                            <p className="text-sm text-slate-400 mb-1">
                                {results.globalScore >= 75 ? "Tu mayor fortaleza:" :
                                 results.globalScore >= 40 ? "Prioridad inmediata:" :
                                 "🚨 Riesgo crítico:"}
                            </p>
                            <p className="text-lg font-semibold text-white">
                                {results.dimensionScores.find(d => d.id === results.topRisks[0].dimension)?.label}
                            </p>
                            {results.quickWins[0] && (
                                <p className="text-sm text-slate-300 mt-2 italic">"{results.quickWins[0]}"</p>
                            )}
                        </div>
                    )}

                    <div className="mt-4 p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
                        <p className="text-xs text-slate-400">📊 Informe completo con análisis de {results.dimensionScores.length} dimensiones + hoja de ruta personalizada</p>
                    </div>
                </div>

                {/* Quick Win - Valor inmediato */}
                {!isGuest && results.quickWins[0] && (
                    <div className="bg-gradient-to-r from-accent1/20 to-accent2/20 rounded-xl p-6 border border-accent1/30 mb-8">
                        <p className="text-sm text-slate-300 mb-2">💡 <span className="font-semibold text-white">Acción recomendada para esta semana:</span></p>
                        <p className="text-white">{results.quickWins[0]}</p>
                    </div>
                )}

                {/* CTA Principal - Más persuasivo */}
                {!isGuest && (
                    <>
                    <div className="text-center mb-6">
                        <div className="mb-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                            <p className="text-slate-300 mb-2">¿Quieres entender <span className="text-white font-semibold">qué significan estos resultados</span> para tu equipo?</p>
                            <ul className="text-sm text-slate-400 text-left max-w-md mx-auto space-y-1">
                                <li className="flex items-start">
                                    <span className="text-accent1 mr-2">✓</span>
                                    Interpretación personalizada de tu diagnóstico
                                </li>
                                <li className="flex items-start">
                                    <span className="text-accent1 mr-2">✓</span>
                                    Priorización de los 3 primeros pasos
                                </li>
                                <li className="flex items-start">
                                    <span className="text-accent1 mr-2">✓</span>
                                    Sin coste, sin compromiso
                                </li>
                            </ul>
                        </div>

                        <Button onClick={handleBookCall} className="px-8 py-4 text-lg shadow-lg shadow-accent1/20 w-full sm:w-auto">
                            <Calendar className="w-5 h-5 mr-2" />
                            Agendar llamada gratuita de 15 min
                        </Button>
                        <p className="mt-2 text-xs text-slate-500">Disponible esta semana • Solo 3 cupos diarios</p>
                    </div>

                    {/* Secondary */}
                    <div className="text-center mb-8 h-20 flex flex-col justify-center items-center">
                        {isEmailed ? (
                            <div className="flex items-center text-green-400 font-medium animate-fade-in">
                                <CheckCircle className="w-5 h-5 mr-2" />
                                <span>¡Solicitud recibida! Revisa tu email.</span>
                            </div>
                        ) : (
                            <button
                                onClick={async () => {
                                    logEvent(AnalyticsEvent.CLICK_REQUEST_REVIEW);
                                    notifyMake("Skipped");
                                    setIsEmailed(true);
                                }}
                                className="w-full max-w-sm py-3 px-6 mt-4 bg-slate-800/80 border border-slate-600 hover:border-slate-500 rounded-xl text-slate-300 font-medium hover:bg-slate-700 transition-all shadow-sm active:scale-[0.98]"
                            >
                                No gracias, revisaré el informe por mi cuenta
                            </button>
                        )}
                    </div>
                    </>
                )}

                <div className="mt-4 text-center">
                    <p className="text-slate-300 mb-4">
                        Descarga tu informe ejecutivo detallado aquí:
                    </p>
                    <button 
                        onClick={handleDownloadPDF}
                        className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-2 mx-auto bg-slate-800/50 px-6 py-3 rounded-full border border-slate-700"
                    >
                        <Download className="w-5 h-5" />
                        Descargar Informe PDF
                    </button>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center text-xs text-slate-600">
                    <p>© {new Date().getFullYear()} GFS Consulting</p>
                </div>
            </div>
        </div>

        {/* Hidden area strictly for native printing without state change */}
        <div className="hidden print:block bg-white text-black min-h-screen">
            <PrintableReport results={results} />
        </div>
        </>
    );
};

export default Results;
