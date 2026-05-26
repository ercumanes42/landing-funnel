import React from 'react';
import { AlertTriangle, CheckCircle, FileText, Target, TrendingUp } from 'lucide-react';
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
  const mainRiskLabel = results.dimensionScores.find(d => d.id === mainRisk?.dimension)?.label || "Fuga de talento";
  const hasRawTotal = results.answeredCount > 0;
  const pageClass = "w-[210mm] min-h-[297mm] mx-auto bg-white p-10 flex flex-col";
  const today = new Date().toLocaleDateString();

  return (
    <div id="printable-report" className="bg-white text-black" style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.45' }}>
      <section className={pageClass} style={{ breakAfter: 'page', pageBreakAfter: 'always' }}>
        <div className="flex justify-between items-start border-b-4 border-slate-900 pb-5 mb-7">
          <div className="max-w-[72%]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700 mb-2">Radar ejecutivo privado</p>
            <h1 className="text-3xl font-black text-slate-900 leading-tight">Informe de fuga de talento</h1>
            <p className="text-base text-slate-600 mt-2 font-medium">
              Liderazgo, clima, sucesión, aprendizaje y colaboración generacional.
            </p>
          </div>
          <div className="text-right">
            <p className="font-black text-xl text-slate-900">GFS Consulting</p>
            <p className="text-sm text-slate-500">{today}</p>
          </div>
        </div>

        <div className="grid grid-cols-[0.9fr_1.35fr] gap-7 mb-7">
          <div className="p-6 border-4 border-slate-200 rounded-lg bg-slate-50">
            <p className="text-xs uppercase font-black tracking-wide text-slate-500 mb-3">Score de salud organizativa</p>
            <div className="text-7xl font-black text-slate-900 leading-none">{results.globalScore}</div>
            <div className="text-sm uppercase font-black mt-3" style={{ color: scoreMeta.color }}>{scoreMeta.text}</div>
            <div className="mt-5 pt-4 border-t border-slate-200">
              <p className="text-xs uppercase font-bold text-slate-500 mb-1">Lectura ejecutiva</p>
              <p className="text-sm font-bold text-slate-900">{results.maturityLevel.level}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="p-5 bg-slate-900 text-white rounded-lg">
              <p className="text-xs uppercase text-slate-400 font-black mb-1">Riesgo principal detectado</p>
              <p className="text-2xl font-black leading-tight">{mainRiskLabel}</p>
              <p className="text-sm text-slate-300 mt-3 leading-relaxed">{scoreMeta.summary}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 border-2 border-teal-700 rounded-lg bg-teal-50">
                <p className="text-xs uppercase font-black text-teal-800">Sumatoria de fricción</p>
                <p className="mt-2 text-4xl font-black text-slate-900">
                  {hasRawTotal ? results.rawTotal : "N/D"}
                  {hasRawTotal && <span className="text-lg text-slate-500"> / {results.maxRawTotal}</span>}
                </p>
                <p className="mt-2 text-xs font-bold text-slate-600">
                  {hasRawTotal ? `${results.answeredCount} respuestas del radar` : "No disponible en enlace compartido"}
                </p>
              </div>
              <div className="p-5 border-2 border-slate-200 rounded-lg bg-white">
                <p className="text-xs uppercase font-black text-slate-500">Fricción estimada</p>
                <p className="mt-2 text-4xl font-black text-slate-900">{results.riskPercent}%</p>
                <p className="mt-2 text-xs font-bold text-slate-600">Cuanto más alto, más urgencia de revisión.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-7">
          <h2 className="font-black text-xl mb-4 flex items-center gap-2 text-slate-900">
            <TrendingUp className="w-5 h-5" />
            Lectura por foco
          </h2>
          <div className="space-y-3 bg-slate-50 p-5 rounded-lg border border-slate-200">
            {results.dimensionScores.map((dim) => {
              let color = "#16a34a";
              if (dim.score < 40) color = "#dc2626";
              else if (dim.score < 70) color = "#d97706";

              return (
                <div key={dim.id} className="flex items-center text-sm">
                  <div className="w-64 font-bold text-slate-700 leading-tight">{dim.label}</div>
                  <div className="flex-1 mx-5 h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.max(dim.score, 8)}%`, backgroundColor: color }}></div>
                  </div>
                  <div className="w-12 text-right font-black text-slate-900">{dim.score}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 border-2 border-slate-200 rounded-lg text-center">
            <p className="text-2xl font-black text-slate-900">8</p>
            <p className="text-xs text-slate-500 font-medium">respuestas sumadas</p>
          </div>
          <div className="p-4 border-2 border-slate-200 rounded-lg text-center">
            <p className="text-2xl font-black text-slate-900">5</p>
            <p className="text-xs text-slate-500 font-medium">focos ejecutivos</p>
          </div>
          <div className="p-4 border-2 border-slate-200 rounded-lg text-center">
            <p className="text-2xl font-black text-slate-900">3</p>
            <p className="text-xs text-slate-500 font-medium">riesgos priorizados</p>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t-2 border-slate-200 flex justify-between items-center text-slate-500">
          <p className="text-xs">Página 1 de 2 · Diagnóstico ejecutivo de fuga de talento</p>
          <p className="text-xs font-bold text-slate-900">administracion@gfs.es</p>
        </div>
      </section>

      <section className={pageClass}>
        <div className="flex justify-between items-start border-b-4 border-slate-900 pb-5 mb-7">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700 mb-2">Plan de lectura</p>
            <h2 className="text-3xl font-black text-slate-900 leading-tight">Prioridades y siguiente decisión</h2>
          </div>
          <div className="text-right">
            <p className="font-black text-xl text-slate-900">GFS Consulting</p>
            <p className="text-sm text-slate-500">{today}</p>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_1fr] gap-6 mb-7">
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-lg">
            <h3 className="font-black text-lg mb-3 flex items-center gap-2 text-slate-900">
              <Target className="w-5 h-5 text-teal-700" />
              Prioridad principal
            </h3>
            <p className="text-2xl font-black text-slate-900 leading-tight">{mainRiskLabel}</p>
            <p className="mt-3 text-sm text-slate-700 leading-relaxed">{results.maturityLevel.description}</p>
          </div>

          <div className="p-5 border-2 border-slate-900 rounded-lg bg-white">
            <h3 className="font-black text-lg mb-3 flex items-center gap-2 text-slate-900">
              <FileText className="w-5 h-5 text-slate-700" />
              Cómo leer el resultado
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              Empieza por la dimensión con menor puntuación. Después revisa si la causa está en mando directo, propuesta de valor, sucesión, aprendizaje o colaboración entre generaciones.
            </p>
          </div>
        </div>

        <div className="mb-7 p-5 bg-amber-50 border-2 border-amber-200 rounded-lg">
          <h3 className="font-black text-lg mb-4 flex items-center gap-2 text-amber-800">
            <AlertTriangle className="w-5 h-5" />
            Patrones críticos identificados
          </h3>
          {results.patterns.length > 0 ? (
            <div className="space-y-4">
              {results.patterns.slice(0, 5).map((p, idx) => (
                <div key={idx} className="flex gap-3">
                  <span className="font-black text-amber-700">{idx + 1}.</span>
                  <div>
                    <p className="font-black text-slate-900">{p.name}</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-700 font-medium">
              No se detecta un patrón crítico dominante. Conviene revisar igualmente las dimensiones con menor puntuación para prevenir fuga futura.
            </p>
          )}
        </div>

        <div className="mb-7 p-5 bg-slate-50 border border-slate-200 rounded-lg">
          <h3 className="font-black text-lg mb-4 flex items-center gap-2 text-slate-900">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Primeras acciones recomendadas
          </h3>
          <ul className="space-y-3">
            {results.quickWins.slice(0, 3).map((win, idx) => (
              <li key={idx} className="text-sm text-slate-700 flex items-start gap-3">
                <div className="mt-0.5 w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs font-black shrink-0">{idx + 1}</div>
                <span className="leading-relaxed">{win}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 pt-4 border-t border-slate-200">
            <p className="text-sm font-black text-slate-900">Siguiente paso recomendado</p>
            <p className="text-sm text-slate-700 italic mt-1">{results.maturityLevel.nextStep}</p>
          </div>
        </div>

        <div className="p-5 border border-slate-200 rounded-lg bg-white">
          <h3 className="font-black text-lg mb-3 text-slate-900">Metodología</h3>
          <p className="text-xs text-slate-600 leading-relaxed">{METHODOLOGY_TEXT}</p>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-xs uppercase font-black text-slate-500">Baja fricción</p>
              <p className="text-lg font-black text-slate-900">8-18</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-xs uppercase font-black text-slate-500">Fricción media</p>
              <p className="text-lg font-black text-slate-900">19-29</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-xs uppercase font-black text-slate-500">Alta fricción</p>
              <p className="text-lg font-black text-slate-900">30-40</p>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t-2 border-slate-200 flex justify-between items-center text-slate-500">
          <div className="text-xs">
            <p>Generado automáticamente por <strong>GFS Consulting</strong></p>
            <p>Pensado para revisión estratégica interna.</p>
          </div>
          <div className="text-right text-xs font-bold">
            <p>Página 2 de 2</p>
            <p className="text-slate-900">administracion@gfs.es</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrintableReport;
