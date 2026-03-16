
import React from 'react';
import { ResultData } from '../types';
import { DIMENSIONS, RISK_FEEDBACK, EXECUTIVE_SUMMARIES, METHODOLOGY_TEXT } from '../constants';
import { TrendingUp, CheckCircle, AlertTriangle, XCircle, TrendingDown } from 'lucide-react';

interface PrintableReportProps {
    results: ResultData;
}

const PrintableReport: React.FC<PrintableReportProps> = ({ results }) => {

    const getScoreLabel = (score: number) => {
        if (score < 40) return { text: "RIESGO CRÍTICO", color: "text-red-700", bg: "bg-red-50" };
        if (score < 70) return { text: "EN TRANSICIÓN", color: "text-amber-700", bg: "bg-amber-50" };
        return { text: "SÓLIDO", color: "text-green-700", bg: "bg-green-50" };
    };

    const getExecutiveSummary = (score: number) => {
        if (score < 40) return EXECUTIVE_SUMMARIES.critical;
        if (score < 70) return EXECUTIVE_SUMMARIES.transition;
        return EXECUTIVE_SUMMARIES.solid;
    };

    const getFeedbackForDimension = (dimId: string, score: number) => {
        const key = dimId as keyof typeof RISK_FEEDBACK;
        const feedbackData = RISK_FEEDBACK[key];

        if (!feedbackData) return null;

        if (score < 50) return { ...feedbackData.low, level: 'low' };
        if (score < 75) return { ...feedbackData.medium, level: 'medium' };
        return { ...feedbackData.high, level: 'high' };
    };

    const scoreMeta = getScoreLabel(results.globalScore);

    return (
        <div id="printable-report" className="w-[210mm] mx-auto bg-white text-black" style={{ fontFamily: 'Arial, sans-serif' }}>

            {/* --- PAGE 1: RESUMEN EJECUTIVO (Fixed Height Container) --- */}
            <div className="p-[10mm] pb-0 min-h-[290mm] relative">
                <div className="mb-8 border-b-2 border-slate-800 pb-4 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 leading-tight">DIAGNÓSTICO</h1>
                        <p className="text-slate-500 uppercase tracking-widest text-sm mt-1">Informe Ejecutivo Confidencial</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-xl text-slate-900">GFS Consulting</p>
                        <p className="text-sm text-slate-500">{new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mb-8">
                    <p className="text-slate-600 text-sm italic">{METHODOLOGY_TEXT}</p>
                </div>

                <div className="grid grid-cols-3 gap-8 mb-10">
                    {/* Score Big */}
                    <div className="col-span-1 flex flex-col items-center justify-center p-6 border-r border-slate-200">
                        <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-4 border-slate-100">
                            <div className="text-center">
                                <span className="block text-6xl font-black text-slate-900">{results.globalScore}</span>
                                <span className="text-xs uppercase font-bold text-slate-400">Puntaje Global</span>
                            </div>
                        </div>
                        <div className={`mt-4 px-4 py-1.5 rounded-full text-sm font-bold border ${scoreMeta.bg} ${scoreMeta.color} border-current`}>
                            {scoreMeta.text}
                        </div>
                    </div>

                    {/* Executive Summary Text */}
                    <div className="col-span-2 flex flex-col justify-center">
                        <h2 className="text-xl font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Diagnóstico Ejecutivo</h2>
                        <p className="text-slate-700 leading-relaxed text-lg">
                            {getExecutiveSummary(results.globalScore)}
                        </p>
                    </div>
                </div>

                {/* Quick Wins Table */}
                <div className="mb-10 break-inside-avoid">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center uppercase tracking-wide border-l-4 border-green-500 pl-3">
                        <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                        Plan de Acción Inmediato (Logros Rápidos)
                    </h3>
                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                        {results.quickWins.slice(0, 3).map((win, idx) => (
                            <div key={idx} className="flex p-4 border-b border-slate-100 last:border-0 items-start">
                                <span className="font-bold text-slate-400 mr-4 text-xs mt-1 w-20 uppercase">Acción #{idx + 1}</span>
                                <p className="text-slate-800 font-medium">{win}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dimension Breakdown (Table) */}
                <div className="mb-12 break-inside-avoid">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center uppercase tracking-wide border-l-4 border-cyan-500 pl-3">
                        <TrendingUp className="w-5 h-5 mr-2 text-cyan-600" />
                        Radiografía por Dimensiones
                    </h3>
                    <div className="space-y-3">
                        {results.dimensionScores.map((dim, idx) => {
                            let colorClass = "bg-slate-200";
                            if (dim.score < 50) colorClass = "bg-red-500";
                            else if (dim.score < 75) colorClass = "bg-amber-500";
                            else colorClass = "bg-cyan-500";

                            return (
                                <div key={idx} className="flex items-center text-sm">
                                    <div className="w-48 font-bold text-slate-700">{dim.label}</div>
                                    <div className="flex-1 mx-4 h-4 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${colorClass}`} style={{ width: `${dim.score}%` }}></div>
                                    </div>
                                    <div className="w-12 text-right font-mono font-bold text-slate-900">{dim.score}</div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* --- PAGE 2: RISKS SECTION (Forced New Page) --- */}
            <div className="p-[10mm] pt-[15mm] min-h-[297mm]" style={{ pageBreakBefore: 'always' }}>
                <h3 className="text-lg font-bold text-slate-900 mb-8 flex items-center uppercase tracking-wide border-l-4 border-red-500 pl-3">
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                    Análisis de Prioridades Críticas
                </h3>

                <div className="space-y-6">
                    {results.topRisks.map((risk, idx) => {
                        const feedback = getFeedbackForDimension(risk.dimension, risk.score);
                        if (!feedback) return null;
                        const dimLabel = DIMENSIONS[risk.dimension as keyof typeof DIMENSIONS]?.label;

                        return (
                            <div key={idx} className="border border-slate-300 rounded-lg p-5 bg-white shadow-sm" style={{ pageBreakInside: 'avoid' }}>
                                <div className="flex justify-between items-start mb-3 border-b border-slate-100 pb-3">
                                    <h4 className="font-bold text-lg text-slate-900 flex items-center">
                                        <span className="bg-slate-900 text-white w-6 h-6 rounded flex items-center justify-center text-xs mr-3">{idx + 1}</span>
                                        {dimLabel}
                                    </h4>
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${feedback.level === 'low' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                                        {feedback.label}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {/* Why */}
                                    <div>
                                        <p className="text-sm text-slate-700 leading-relaxed mb-3">
                                            <span className="font-bold text-slate-900 block mb-1">Diagnóstico:</span>
                                            {feedback.why}
                                        </p>
                                    </div>

                                    {/* Gaps */}
                                    {feedback.level !== 'high' && (
                                        <div className="bg-slate-50 p-3 rounded border border-slate-200">
                                            <p className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center">
                                                <XCircle className="w-3 h-3 mr-1" />
                                                Brechas (Lo que falta):
                                            </p>
                                            <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside ml-1">
                                                {feedback.missing.map((item: string, i: number) => (
                                                    <li key={i}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Impact */}
                                    <div className="text-sm text-slate-500 italic mt-2">
                                        <span className="font-bold not-italic text-slate-700">Impacto de negocio: </span>
                                        {feedback.consequence}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Page 2 */}
                <div className="mt-auto pt-6 border-t border-slate-200 text-center relative top-[20mm]">
                    <p className="text-xs text-slate-400">Generado automáticamente por la Plataforma GFS Consulting. © {new Date().getFullYear()}</p>
                </div>
            </div>
        </div>
    );
};

export default PrintableReport;
