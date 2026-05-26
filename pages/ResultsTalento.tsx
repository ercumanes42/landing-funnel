import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Download, Calendar, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Sparkles, HelpCircle, XCircle } from 'lucide-react';
import Button from '../components/Button';
import BookingReminderModal from '../components/BookingReminderModal';
import { calculateResults } from '../utils/scoringTalento';
import { SurveyState, ResultData, AnalyticsEvent } from '../types';
import { DIMENSIONS, RISK_FEEDBACK, EXECUTIVE_SUMMARIES, METHODOLOGY_TEXT } from '../constantsTalento';
import { logEvent } from '../utils/analytics';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import PrintableReport from '../components/PrintableReportTalento';

const ResultsTalento: React.FC = () => {
    const navigate = useNavigate();
    const [results, setResults] = useState<ResultData | null>(null);
    const [hasBooked, setHasBooked] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null); // For screen view (unused for PDF now)
    const printRef = useRef<HTMLDivElement>(null); // For PDF generation

    useEffect(() => {
        const saved = localStorage.getItem('radar_state');
        const searchParams = new URLSearchParams(location.search);
        const scoreParam = searchParams.get('score');

        // MODE A: Shared Link (via Email)
        if (scoreParam) {
            const globalScore = parseInt(scoreParam, 10);
            if (!isNaN(globalScore)) {
                const d1 = parseInt(searchParams.get('d1') || String(globalScore), 10);
                const d2 = parseInt(searchParams.get('d2') || String(globalScore), 10);
                const d3 = parseInt(searchParams.get('d3') || String(globalScore), 10);
                const d4 = parseInt(searchParams.get('d4') || String(globalScore), 10);
                const t = parseInt(searchParams.get('t') || String(globalScore), 10);

                const r1 = searchParams.get('r1') || 'D1';
                const r2 = searchParams.get('r2') || 'D2';
                const r3 = searchParams.get('r3') || 'T';

                const dimensionScores = [
                    { id: "D1", score: d1, label: DIMENSIONS.D1.label },
                    { id: "D2", score: d2, label: DIMENSIONS.D2.label },
                    { id: "D3", score: d3, label: DIMENSIONS.D3.label },
                    { id: "D4", score: d4, label: DIMENSIONS.D4.label },
                    { id: "T", score: t, label: DIMENSIONS.T.label }
                ];

                const riskMap: Record<string, number> = { D1: d1, D2: d2, D3: d3, D4: d4, T: t };
                const topRisks = [
                    { dimension: r1, score: riskMap[r1] || 0 },
                    { dimension: r2, score: riskMap[r2] || 0 },
                    { dimension: r3, score: riskMap[r3] || 0 }
                ];

                const QUICK_WINS_MAP: Record<string, string> = {
                    D1: "Definir 3 KPIs de productividad por objetivos para eliminar el micro-management presencial.",
                    D2: "Lanzar programa de 'Reverse Mentoring': Juniors enseñan IA a Directivos.",
                    D3: "Auditoría flash de Clima Laboral anónima para detectar 'zonas tóxicas' ocultas.",
                    D4: "Mapa de talento: Identificar top 5 posiciones críticas sin sucesor y activar plan de carrera.",
                    T: "Crear un 'Semáforo de Datos': Qué información es segura subir a la IA y cuál no."
                };
                const quickWins = [QUICK_WINS_MAP[r1] || "", QUICK_WINS_MAP[r2] || "", QUICK_WINS_MAP[r3] || ""];

                setResults({ globalScore, dimensionScores, topRisks, quickWins });
                setHasBooked(true); // Assume booked if coming from email
                return;
            }
        }

        // MODE B: Local User (Normal Flow)
        if (saved) {
            try {
                const state: SurveyState = JSON.parse(saved);
                if (!state.isCompleted) {
                    navigate('/radar');
                    return;
                }

                const optIn = state.answers['meeting_optin'] as string;
                if (optIn && optIn.includes('Confirmed')) {
                    setHasBooked(true);
                }

                const calculated = calculateResults(state.answers);
                setResults(calculated);
            } catch (e) {
                navigate('/');
            }
        } else {
            navigate('/');
        }
    }, [navigate]);

    useEffect(() => {
        if (results) {
            logEvent(AnalyticsEvent.REPORT_VIEW);
            logEvent(AnalyticsEvent.FINAL_RESULT_VIEW);
        }
    }, [results]);

    if (!results) return <div className="min-h-screen flex items-center justify-center dark:text-white">Cargando análisis...</div>;

    const handleDownloadPDF = () => {
        generatePDF();
    };

    const generatePDF = () => {
        logEvent(AnalyticsEvent.PDF_CLICKED);
        logEvent(AnalyticsEvent.REPORT_DOWNLOAD);
        if (printRef.current) {
            const opt = {
                margin: 0,
                filename: 'Diagnostico_Talento_GFS.pdf',
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
                jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };
            // Temporarily visually show the element if needed, but usually hidden works if display is not none.
            // However, html2pdf requires the element to be rendered.
            // We use a fixed off-screen approach in CSS usually, but here 'hidden' class might prevent rendering in some html2canvas versions.
            // Safe bet: The wrapper is hidden, but we pass the inner content.
            // Actually, if the parent has display:none, html2canvas renders nothing.
            // Constraint: We need to render it visible but obscure it, or clone it.
            // Let's use the 'fixed' trick inline in the JSX.

            html2pdf().set(opt).from(printRef.current).save();
        }
        setShowModal(false);
    };

    const handleBookCall = () => {
        logEvent(AnalyticsEvent.BOOK_CALL_CLICKED);
        logEvent(AnalyticsEvent.BOOK_CALL_CLICK);
        navigate('/agendar?retry=true');
    };

    const getScoreLabel = (score: number) => {
        if (score < 40) return { text: "ALTO", color: "text-red-500", bg: "bg-red-500", bgLight: "bg-red-50 dark:bg-red-900/20" };
        if (score < 70) return { text: "MEDIO", color: "text-amber-500", bg: "bg-amber-500", bgLight: "bg-amber-50 dark:bg-amber-900/20" };
        return { text: "BAJO", color: "text-green-500", bg: "bg-green-500", bgLight: "bg-green-50 dark:bg-green-900/20" };
    };

    const getExecutiveSummary = (score: number) => {
        if (score < 40) return EXECUTIVE_SUMMARIES.critical;
        if (score < 70) return EXECUTIVE_SUMMARIES.transition;
        return EXECUTIVE_SUMMARIES.solid;
    };

    const getBenchmarkDiff = (score: number) => {
        const benchmark = 55; // Industry average simulation
        const diff = score - benchmark;
        return { diff, isAbove: diff >= 0 };
    };

    // Helper to get deep feedback based on score range
    const getFeedbackForDimension = (dimId: string, score: number) => {
        const key = dimId as keyof typeof RISK_FEEDBACK;
        const feedbackData = RISK_FEEDBACK[key];

        if (!feedbackData) return null;

        if (score < 50) return { ...feedbackData.low, level: 'low' };
        if (score < 75) return { ...feedbackData.medium, level: 'medium' };
        return { ...feedbackData.high, level: 'high' };
    };

    const scoreMeta = getScoreLabel(results.globalScore);
    const benchmark = getBenchmarkDiff(results.globalScore);

    // SVG Gauge Calculations
    const radius = 80;
    const stroke = 14;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (results.globalScore / 100) * circumference;

    return (
        <>
            <BookingReminderModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onBook={handleBookCall}
                onDownload={generatePDF}
            />

            {/* Hidden Print Template - Positioned off-screen so it renders but isn't visible */}
            <div style={{ position: 'fixed', left: '-9999px', top: 0, width: '800px' }}>
                <div ref={printRef}>
                    <PrintableReport results={results} />
                </div>
            </div>

            <div ref={reportRef} className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 min-h-screen pb-20 text-white">

                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 pt-6 pb-4 px-4 border-b border-slate-700">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex justify-between items-center mb-2 border-b border-slate-700 pb-4">
                            <div>
                                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 mb-1">
                                    GFS Consulting
                                </h1>
                                <p className="text-slate-400 text-sm font-mono uppercase tracking-widest">Dashboard Estratégico 2026</p>
                            </div>
                            <div className="text-right">
                                { /* Branding removed */}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 py-8">

                    {/* Methodology Highlight */}
                    <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 mb-8 flex items-start gap-3">
                        <HelpCircle className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-400 leading-relaxed">
                            {METHODOLOGY_TEXT}
                        </p>
                    </div>

                    {/* Top Section: Score + Summary */}
                    <div className="grid md:grid-cols-3 gap-6 mb-8">

                        {/* Gauge */}
                        <div className="flex flex-col items-center justify-center bg-slate-800/20 rounded-xl p-6 border border-slate-700/50">
                            <div className="relative">
                                <svg height={radius * 2 + 20} width={radius * 2 + 20} className="transform -rotate-90">
                                    <defs>
                                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#22D3EE" />
                                            <stop offset="100%" stopColor="#A78BFA" />
                                        </linearGradient>
                                    </defs>
                                    <circle
                                        stroke="#334155"
                                        strokeWidth={stroke}
                                        fill="transparent"
                                        r={normalizedRadius}
                                        cx={radius + 10}
                                        cy={radius + 10}
                                    />
                                    <circle
                                        stroke="url(#scoreGradient)"
                                        strokeWidth={stroke}
                                        strokeDasharray={circumference + ' ' + circumference}
                                        style={{ strokeDashoffset }}
                                        strokeLinecap="round"
                                        fill="transparent"
                                        r={normalizedRadius}
                                        cx={radius + 10}
                                        cy={radius + 10}
                                        className="transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-5xl font-extrabold">{results.globalScore}</span>
                                    <span className="text-xs text-slate-400 uppercase tracking-widest mt-1">Puntuación Global</span>
                                </div>
                            </div>

                            {/* Benchmark Badge */}
                            <div className={`mt-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${benchmark.isAbove ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                {benchmark.isAbove ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                {Math.abs(benchmark.diff)} pts {benchmark.isAbove ? 'sobre' : 'bajo'} media de eficiencia
                            </div>
                        </div>

                        {/* Status Badge + Executive Summary */}
                        <div className="md:col-span-2 flex flex-col justify-center p-6 bg-slate-800/20 rounded-xl border border-slate-700/50">
                            <div className={`inline-flex items-center self-start px-4 py-2 rounded-lg text-sm font-bold mb-4 ${scoreMeta.bgLight} ${scoreMeta.color}`}>
                                <Sparkles className="w-4 h-4 mr-2" />
                                {scoreMeta.text}
                            </div>

                            <h2 className="text-xl font-bold mb-3">Diagnóstico Ejecutivo</h2>
                            <p className="text-slate-300 leading-relaxed text-lg">
                                {getExecutiveSummary(results.globalScore)}
                            </p>
                        </div>
                    </div>

                    {/* Two Column Layout */}
                    <div className="grid md:grid-cols-12 gap-6 mb-8 items-start">

                        {/* LEFT COLUMN (Chart + Action Plan) - Spans 5 cols */}
                        <div className="md:col-span-5 space-y-6">

                            {/* Dimension Scores Chart */}
                            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                                <h3 className="text-lg font-bold mb-4 flex items-center">
                                    <TrendingUp className="w-5 h-5 text-cyan-400 mr-2" />
                                    Radiografía: Puntuaciones por Dimensión
                                </h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={results.dimensionScores} layout="vertical" margin={{ left: 5, right: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#475569" />
                                            <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                            <YAxis type="category" dataKey="id" width={25} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }}
                                                itemStyle={{ color: '#fff' }}
                                                labelStyle={{ color: '#fff' }}
                                                formatter={(value: number) => [`${value}/100`, 'Puntuación']}
                                            />
                                            <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={24}>
                                                {results.dimensionScores.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.score < 50 ? '#EF4444' : entry.score < 75 ? '#F59E0B' : '#22D3EE'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                {/* Legend */}
                                <div className="flex gap-4 mt-4 justify-center text-xs text-slate-400">
                                    <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span>Riesgo (&lt;50)</span>
                                    <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-500 mr-1"></span>Transición (50-74)</span>
                                    <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-cyan-400 mr-1"></span>Sólido (75+)</span>
                                </div>
                            </div>

                            {/* Action Plan (Moved to Left Column) */}
                            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                                <h3 className="text-lg font-bold mb-6 flex items-center">
                                    <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                                    Tu Plan de Acción: 3 Logros Rápidos
                                </h3>
                                <div className="space-y-4">
                                    {results.quickWins.slice(0, 3).map((win, idx) => (
                                        <div key={idx} className="bg-slate-900/50 rounded-lg p-5 border border-slate-700 hover:border-green-500/30 transition-colors">
                                            <div className="text-xs font-bold text-cyan-400 uppercase mb-2">Acción #{idx + 1}</div>
                                            <p className="text-slate-200 leading-relaxed font-medium text-sm">{win}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* RIGHT COLUMN (Deep Analysis) - Spans 7 cols */}
                        <div className="md:col-span-7 bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                            <h3 className="text-lg font-bold mb-4 flex items-center">
                                <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
                                Análisis de Prioridades Críticas
                            </h3>
                            <div className="space-y-6">
                                {results.topRisks.map((risk, idx) => {
                                    const feedback = getFeedbackForDimension(risk.dimension, risk.score);
                                    if (!feedback) return null;

                                    const dimLabel = DIMENSIONS[risk.dimension as keyof typeof DIMENSIONS]?.label;

                                    let badgeColor = "bg-slate-600";
                                    let titleColor = "text-slate-200";

                                    if (feedback.level === 'low') {
                                        badgeColor = "bg-red-500";
                                        titleColor = "text-red-400";
                                    } else if (feedback.level === 'medium') {
                                        badgeColor = "bg-amber-500";
                                        titleColor = "text-amber-400";
                                    } else {
                                        badgeColor = "bg-cyan-500";
                                        titleColor = "text-cyan-400";
                                    }

                                    return (
                                        <div key={idx} className="bg-slate-900/60 rounded-xl p-5 border border-slate-700/80 hover:border-slate-600 transition-colors">

                                            {/* Header */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-6 h-6 ${badgeColor} rounded text-white flex items-center justify-center text-xs font-bold`}>
                                                        {idx + 1}
                                                    </div>
                                                    <h4 className="font-bold text-white text-lg">{dimLabel}</h4>
                                                </div>
                                                <div className="text-sm font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">
                                                    {risk.score}/100
                                                </div>
                                            </div>

                                            {/* Status Title */}
                                            <div className={`text-sm font-bold uppercase tracking-wide mb-3 ${titleColor}`}>
                                                {feedback.label}
                                            </div>

                                            {/* Why */}
                                            <div className="mb-4">
                                                <p className="text-sm text-slate-300 leading-relaxed">
                                                    <span className="font-semibold text-white">¿Por qué este resultado?</span><br />
                                                    {feedback.why}
                                                </p>
                                            </div>

                                            {/* Missing / Gap Analysis */}
                                            {feedback.level !== 'high' && (
                                                <div className="bg-slate-800/40 rounded p-3 mb-3">
                                                    <p className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center">
                                                        <XCircle className="w-3 h-3 mr-1 text-red-400" />
                                                        Brechas Detectadas (Lo que falta):
                                                    </p>
                                                    <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
                                                        {feedback.missing.map((item: string, i: number) => (
                                                            <li key={i}>{item}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Consequence */}
                                            <div className="text-xs text-slate-400 italic border-l-2 border-slate-600 pl-3">
                                                <span className="font-semibold text-slate-300">Impacto de negocio:</span> {feedback.consequence}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 p-4 bg-green-900/20 border border-green-800 rounded-xl text-center">
                        <p className="text-green-400 font-medium">
                            Tu informe completo llegará a tu bandeja de entrada en menos de 5 minutos.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center print:hidden mt-6">
                        <Button onClick={handleBookCall} className="px-8 py-3 text-lg shadow-lg shadow-accent1/20">
                            <Calendar className="w-5 h-5 mr-2" />
                            Reservar revisión de 15 minutos
                        </Button>
                        <Button variant="outline" onClick={handleDownloadPDF} className="px-8 py-3 bg-slate-800 border-slate-600 hover:bg-slate-700 text-slate-200">
                            <Download className="w-5 h-5 mr-2" />
                            Descargar Informe PDF
                        </Button>
                    </div>

                    <div className="text-center mt-4">
                        <button 
                            onClick={() => logEvent(AnalyticsEvent.CLICK_REQUEST_REVIEW)}
                            className="text-sm text-gray-400 hover:text-gray-300 underline"
                        >
                            No ahora, prefiero revisar el informe primero
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 text-center text-xs text-slate-500 border-t border-slate-800 pt-8">
                        <p>© {new Date().getFullYear()} GFS Consulting. Análisis confidencial basado en respuestas proporcionadas. Todos los derechos reservados.</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ResultsTalento;