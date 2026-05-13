import React from 'react';
import { AlertTriangle, CheckCircle, FileText } from 'lucide-react';
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
    <div id="printable-report" className="w-[210mm] mx-auto bg-white text-black" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="p-8">
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Informe Ejecutivo de Fuga de Capacidad por Absentismo</h1>
            <p className="text-sm text-slate-500 mt-1">Diagnóstico compartible para Dirección, RRHH y Operaciones</p>
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
            <h2 className="font-bold text-lg mb-2">Resumen ejecutivo</h2>
            <p className="text-sm text-slate-700 leading-relaxed">{scoreMeta.summary}</p>
            <div className="mt-3 p-3 bg-slate-50 rounded-lg">
              <p className="text-xs uppercase text-slate-500 font-bold">Fuga principal detectada</p>
              <p className="text-base font-bold text-slate-900">{mainRiskLabel}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-bold text-lg mb-3 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
            Lectura por foco
          </h3>
          <div className="space-y-2">
            {results.dimensionScores.map((dim) => {
              let color = "#16a34a";
              if (dim.score < 40) color = "#dc2626";
              else if (dim.score < 70) color = "#d97706";

              return (
                <div key={dim.id} className="flex items-center text-sm">
                  <div className="w-48 font-bold text-slate-700">{dim.label}</div>
                  <div className="flex-1 mx-4 h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.max(dim.score, 8)}%`, backgroundColor: color }}></div>
                  </div>
                  <div className="w-12 text-right font-bold">{dim.score}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="p-3 border border-slate-200 rounded-lg">
            <p className="text-2xl font-black text-slate-900">7,1%</p>
            <p className="text-xs text-slate-600">horas pactadas perdidas en España, 2025T4</p>
          </div>
          <div className="p-3 border border-slate-200 rounded-lg">
            <p className="text-2xl font-black text-slate-900">5,5%</p>
            <p className="text-xs text-slate-600">por baja médica en el mismo periodo</p>
          </div>
          <div className="p-3 border border-slate-200 rounded-lg">
            <p className="text-2xl font-black text-slate-900">12,3%</p>
            <p className="text-xs text-slate-600">en sectores de mayor exposición</p>
          </div>
        </div>

        <div className="mb-6 p-4 bg-slate-50 rounded-lg">
          <h3 className="font-bold text-lg mb-3 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            Primeras acciones recomendadas
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

        <div className="mb-6 p-4 border border-slate-200 rounded-lg">
          <h3 className="font-bold text-lg mb-2 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-slate-700" />
            Fórmula de coste a revisar
          </h3>
          <p className="text-sm text-slate-700">
            Horas perdidas x coste hora + sustituciones + horas extra + retrasos + impacto en servicio.
          </p>
          <p className="text-xs text-slate-500 mt-2">
            {METHODOLOGY_TEXT}
          </p>
        </div>

        <div className="mb-6 p-4 bg-slate-900 text-white rounded-lg">
          <h3 className="font-bold text-lg mb-2">Siguiente decisión interna</h3>
          <p className="text-sm leading-relaxed text-slate-100">
            Este informe identifica la fuga principal ({mainRiskLabel}). La decisión siguiente es ordenar las palancas corporativas: 
            coste real, causa probable y momento de actuación. Recomendación prioritaria: 
            {mainRisk?.dimension === 'D1' && " empezar por calcular el coste por área en los últimos 90 días antes de lanzar nuevas medidas."}
            {mainRisk?.dimension === 'D2' && " empezar por revisar quién absorbe la carga operativa para evitar quemar a los mandos intermedios y equipos clave."}
            {mainRisk?.dimension === 'D3' && " empezar por cruzar los datos de ausencias por área y turno para detectar patrones repetitivos (cansancio, rotación, carga)."}
            {mainRisk?.dimension === 'D4' && " empezar por establecer un protocolo claro de actuación temprana para evitar que bajas cortas se conviertan en largas."}
            {mainRisk?.dimension === 'T' && " empezar por proyectar el impacto económico y operativo si el absentismo sube 1 punto este año, para escalar el problema a Dirección."}
            {!mainRisk?.dimension && " empezar por calcular el coste por área en los últimos 90 días antes de lanzar nuevas medidas."}
          </p>
        </div>

        <div className="text-center text-xs text-slate-400 pt-4 border-t">
          <p>Generado automáticamente por GFS Consulting. Pensado para revisión interna.</p>
        </div>
      </div>
    </div>
  );
};

export default PrintableReport;
