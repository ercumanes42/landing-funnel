import React from 'react';
import { ResultData } from '../types';
import { DIMENSIONS, RISK_FEEDBACK, QUICK_WINS } from '../constants';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface PrintableReportProps {
    results: ResultData;
}

const PrintableReport: React.FC<PrintableReportProps> = ({ results }) => {

    const getScoreLabel = (score: number) => {
        if (score < 40) return { text: "RIESGO CRÍTICO", color: "#dc2626" };
        if (score < 70) return { text: "EN TRANSICIÓN", color: "#d97706" };
        return { text: "SÓLIDO", color: "#16a34a" };
    };

    const scoreMeta = getScoreLabel(results.globalScore);

    return (
        <div id="printable-report" className="w-[210mm] mx-auto bg-white text-black" style={{ fontFamily: 'Arial, sans-serif' }}>
            <div className="p-8">
                <div className="flex justify-between items-center border-b-2 border-slate-800 pb-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">DIAGNÓSTICO EJECUTIVO</h1>
                        <p className="text-sm text-slate-500">Informe de Resultados</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-lg text-slate-900">GFS Consulting</p>
                        <p className="text-sm text-slate-500">{new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-6">
                    <div className="col-span-1 text-center p-4 border-2 border-slate-200 rounded-lg">
                        <div className="text-5xl font-black text-slate-900">{results.globalScore}</div>
                        <div className="text-sm uppercase font-bold mt-2" style={{ color: scoreMeta.color }}>{scoreMeta.text}</div>
                    </div>
                    
                    <div className="col-span-2">
                        <h2 className="font-bold text-lg mb-3">Resumen Ejecutivo</h2>
                        <p className="text-sm text-slate-700 leading-relaxed">
                            Tu organización presenta un nivel de exposición {scoreMeta.text.toLowerCase()}. 
                            Los datos indican que existen áreas de oportunidad que requieren atención prioritaria 
                            para garantizar la sostenibilidad y crecimiento del negocio.
                        </p>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                        Resultados por Dimensión
                    </h3>
                    <div className="space-y-2">
                        {results.dimensionScores.map((dim, idx) => {
                            let color = "#16a34a";
                            if (dim.score < 50) color = "#dc2626";
                            else if (dim.score < 75) color = "#d97706";
                            
                            return (
                                <div key={idx} className="flex items-center text-sm">
                                    <div className="w-48 font-bold text-slate-700">{dim.label}</div>
                                    <div className="flex-1 mx-4 h-4 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${dim.score}%`, backgroundColor: color }}></div>
                                    </div>
                                    <div className="w-12 text-right font-bold">{dim.score}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                    <h3 className="font-bold text-lg mb-3 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                        Acciones Inmediatas
                    </h3>
                    <ul className="space-y-2">
                        {results.quickWins.slice(0, 3).map((win, idx) => (
                            <li key={idx} className="text-sm text-slate-700 flex items-start">
                                <span className="font-bold mr-2">{idx + 1}.</span>
                                {win}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="text-center text-xs text-slate-400 pt-4 border-t">
                    <p>Generado automáticamente por GFS Consulting</p>
                </div>
            </div>
        </div>
    );
};

export default PrintableReport;
