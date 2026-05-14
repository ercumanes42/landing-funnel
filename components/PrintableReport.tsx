import React from 'react';
import { AlertTriangle, CheckCircle, FileText, TrendingUp, Target } from 'lucide-react';
import { ResultData } from '../types';
import { EXECUTIVE_SUMMARIES, METHODOLOGY_TEXT } from '../constants';

interface PrintableReportProps {
  results: ResultData;
}

const PrintableReport: React.FC<PrintableReportProps> = ({ results }) => {
  const getScoreLabel = (score: number) => {
    if (score < 40) return { text: "EXPOSICIÓN ALTA", color: "#dc2626", summary: EXECUTIVE_SUMMARIES.critical };
    if (score < 70) return { text: "EXPOSICIÓN MEDIA", color: "#d97706", summary: EXECUTIVE_SUMMARIES.transition };
    return { text: "EXPOSICIÓN BAJA", color: "#16a34a", summary: EXECUTIVE_SUMMARIES.solid };
  };

  const scoreMeta = getScoreLabel(results.globalScore);
  const mainRisk = results.topRisks[0];
  const mainRiskLabel = results.dimensionScores.find(d => d.id === mainRisk?.dimension)?.label || "Coste invisible";

  return (
    <div id="printable-report" className="w-[210mm] mx-auto bg-white text-black" style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.5' }}>
      <div className="p-10">
        <div className="flex justify-between items-start border-b-4 border-slate-900 pb-6 mb-8">
          <div className="max-w-[70%]">
            <h1 className="text-3xl font-black text-slate-900 leading-tight">Informe Ejecutivo de Fuga de Capacidad por Absentismo</h1>
            <p className="text-lg text-slate-600 mt-2 font-medium">Diagnóstico Estratégico para Dirección, RRHH y Operaciones</p>
          </div>
          <div className="text-right">
            <p className="font-black text-xl text-slate-900">GFS Consulting</p>
            <p className="text-sm text-slate-500">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8 mb-10">
          <div className="col-span-1 text-center p-6 border-4 border-slate-200 rounded-2xl bg-slate-50">
            <div className="text-6xl font-black text-slate-900">{results.globalScore}</div>
            <div className="text-sm uppercase font-black mt-2" style={{ color: scoreMeta.color }}>{scoreMeta.text}</div>
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-xs uppercase font-bold text-slate-500 mb-1">Nivel de Madurez</p>
              <p className="text-sm font-bold text-slate-900">{results.maturityLevel.level}</p>
            </div>
          </div>

          <div className="col-span-2">
            <h2 className="font-black text-xl mb-3 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Análisis de Situación
            </h2>
            <p className="text-base text-slate-700 leading-relaxed mb-4">{scoreMeta.summary}</p>
            <div className="p-4 bg-slate-900 text-white rounded-xl shadow-sm">
              <p className="text-xs uppercase text-slate-400 font-bold mb-1">Fuga principal detectada</p>
              <p className="text-xl font-bold">{mainRiskLabel}</p>
              <p className="text-xs text-slate-300 mt-2 leading-tight">{results.maturityLevel.description}</p>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <h3 className="font-black text-xl mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-slate-900" />
            Lectura de Dimensiones Críticas
          </h3>
          <div className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-200">
            {results.dimensionScores.map((dim) => {
              let color = "#16a34a";
              if (dim.score < 40) color = "#dc2626";
              else if (dim.score < 70) color = "#d97706";

              return (
                <div key={dim.id} className="flex items-center text-sm">
                  <div className="w-56 font-bold text-slate-700">{dim.label}</div>
                  <div className="flex-1 mx-6 h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.max(dim.score, 8)}%`, backgroundColor: color }}></div>
                  </div>
                  <div className="w-12 text-right font-black text-slate-900">{dim.score}</div>
                </div>
              );
            })}
          </div>
        </div>

        {results.patterns.length > 0 && (
          <div className="mb-10 p-6 bg-amber-50 border-2 border-amber-200 rounded-2xl">
            <h3 className="font-black text-lg mb-3 flex items-center gap-2 text-amber-800">
              <AlertTriangle className="w-5 h-5" />
              Patrones de Riesgo Identificados
            </h3>
            <div className="space-y-4">
              {results.patterns.map((p, idx) => (
                <div key={idx} className="flex gap-3">
                  <span className="font-black text-amber-600">{idx + 1}.</span>
                  <div>
                    <p className="font-bold text-slate-900">{p.name}</p>
                    <p className="text-sm text-slate-700">{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-10 grid grid-cols-3 gap-4">
          <div className="p-4 border-2 border-slate-200 rounded-xl text-center">
            <p className="text-2xl font-black text-slate-900">7,1%</p>
            <p className="text-xs text-slate-500 font-medium">horas pactadas perdidas en España, 2025T4</p>
          </div>
          <div className="p-4 border-2 border-slate-200 rounded-xl text-center">
            <p className="text-2xl font-black text-slate-900">5,5%</p>
            <p className="text-xs text-slate-500 font-medium">por baja médica en el mismo periodo</p>
          </div>
          <div className="p-4 border-2 border-slate-200 rounded-xl text-center">
            <p className="text-2xl font-black text-slate-900">12,3%</p>
            <p className="text-xs text-slate-500 font-medium">en sectores de mayor exposición</p>
          </div>
        </div>

        <div className="mb-10 p-6 bg-slate-50 border border-slate-200 rounded-2xl">
          <h3 className="font-black text-lg mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Hoja de Ruta: Acciones Prioritarias
          </h3>
          <ul className="space-y-3">
            {results.quickWins.slice(0, 3).map((win, idx) => (
              <li key={idx} className="text-sm text-slate-700 flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0">{idx + 1}</div>
                <span className="leading-relaxed">{win}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 pt-4 border-t border-slate-200">
            <p className="text-sm font-bold text-slate-900">Siguiente paso recomendado:</p>
            <p className="text-sm text-slate-600 italic">{results.maturityLevel.nextStep}</p>
          </div>
        </div>

        <div className="mb-10 p-6 border-2 border-slate-900 rounded-2xl bg-white">
          <h3 className="font-black text-lg mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-700" />
            Marco de Cálculo de Impacto Económico
          </h3>
          <p className="text-sm text-slate-700 font-medium mb-2">
            La métrica de fuga se calcula mediante la suma de:
          </p>
          <p className="text-base text-slate-900 font-bold py-2 px-4 bg-slate-100 rounded-lg text-center">
            Horas perdidas x coste hora + sustituciones + horas extra + retrasos + impacto en servicio.
          </p>
          <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
            {METHODOLOGY_TEXT}
          </p>
        </div>

        <div className="mt-12 pt-6 border-t-2 border-slate-200 flex justify-between items-center text-slate-500">
          <div className="text-xs">
            <p>Generado automáticamente por <strong>GFS Consulting</strong></p>
            <p>Pensado para revisión estratégica interna.</p>
          </div>
          <div className="text-right text-xs font-bold">
            <p>Contacto y Consultoría:</p>
            <p className="text-slate-900">administracion@gfs.es</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintableReport;
