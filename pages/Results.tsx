import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar } from 'lucide-react';
import Button from '../components/Button';
import { calculateResults } from '../utils/scoring';
import { ResultData, AnalyticsEvent } from '../types';
import { logEvent } from '../utils/analytics';

const Results: React.FC = () => {
    const navigate = useNavigate();
    const [results, setResults] = useState<ResultData | null>(null);
    const [isGuest, setIsGuest] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlScore = params.get('score');
        
        // Robust parameter parsing
        const getIntParam = (name: string) => {
            const val = params.get(name);
            if (!val || val.trim() === '') return 0;
            const parsed = parseInt(val);
            return isNaN(parsed) ? 0 : parsed;
        };

        if (urlScore !== null) {
            const guestResults: ResultData = {
                globalScore: getIntParam('score'),
                dimensionScores: [
                    { id: "D1", label: "Súper Equipos Híbridos", score: getIntParam('d1'), color: "#06b6d4" },
                    { id: "D2", label: "Adaptación Acelerada", score: getIntParam('d2'), color: "#3b82f6" },
                    { id: "D3", label: "Cambio de Reglas", score: getIntParam('d3'), color: "#f59e0b" },
                    { id: "D4", label: "Sucesión", score: getIntParam('d4'), color: "#6366f1" },
                    { id: "T", label: "Gobernanza IA", score: getIntParam('t'), color: "#ec4899" }
                ],
                topRisks: [
                    { dimension: params.get('r1') || 'D1', score: 0 },
                    { dimension: params.get('r2') || 'D2', score: 0 },
                    { dimension: params.get('r3') || 'T', score: 0 }
                ].filter(r => r.dimension !== ''),
                quickWins: []
            };
            setResults(guestResults);
            setIsGuest(true);
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

    const handleBookCall = () => {
        logEvent(AnalyticsEvent.BOOK_CALL_CLICKED);
        navigate('/agendar');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 pb-20 text-white">
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
                        Tu informe está siendo procesado y llegará a tu email en menos de 5 minutos.
                    </p>

                    {/* Nivel de exposición */}
                    <div className="inline-flex items-center px-6 py-3 rounded-full font-bold mb-4 bg-slate-700">
                        {results.globalScore < 40 ? (
                            <span className="text-red-400">⚠️ Exposición Alta</span>
                        ) : results.globalScore < 70 ? (
                            <span className="text-amber-400">⚡ Exposición Media</span>
                        ) : (
                            <span className="text-green-400">✓ Exposición Baja</span>
                        )}
                    </div>

                    {/* Área principal - solo 1 */}
                    {results.topRisks[0] && (
                        <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
                            <p className="text-sm text-slate-400 mb-1">
                                {results.globalScore >= 75 ? "Tu mayor fortaleza detectada:" : 
                                 results.globalScore >= 40 ? "Tu principal área de mejora:" : 
                                 "⚠️ Riesgo crítico a resolver:"}
                            </p>
                            <p className="text-lg font-semibold text-white">
                                {results.dimensionScores.find(d => d.id === results.topRisks[0].dimension)?.label}
                            </p>
                        </div>
                    )}

                </div>

                {/* CTA Principal */}
                <div className="text-center mb-6">
                    <p className="text-slate-300 mb-4">
                        ¿Te gustaría que te expliquemos tu resultado personalmente?
                    </p>
                    <Button onClick={handleBookCall} className="px-8 py-4 text-lg shadow-lg shadow-accent1/20">
                        <Calendar className="w-5 h-5 mr-2" />
                        Reservar revisión de 15 min
                    </Button>
                </div>

                {/* Secondary */}
                <div className="text-center">
                    <button 
                        onClick={() => logEvent(AnalyticsEvent.CLICK_REQUEST_REVIEW)}
                        className="text-sm text-slate-500 hover:text-slate-400"
                    >
                        No gracias, esperaré el informe por email
                    </button>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center text-xs text-slate-600">
                    <p>© {new Date().getFullYear()} GFS Consulting</p>
                </div>
            </div>
        </div>
    );
};

export default Results;
