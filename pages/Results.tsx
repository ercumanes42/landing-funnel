import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, BarChart3, Calendar, CheckCircle, Download } from 'lucide-react';
import Button from '../components/Button';
import PrintableReport from '../components/PrintableReport';
import { calculateResults } from '../utils/scoring';
import { ResultData, AnalyticsEvent } from '../types';
import { buildResultAnalyticsPayload, logEvent } from '../utils/analytics';
import { APP_CONFIG, DIMENSIONS, QUICK_WINS, STORAGE_KEY } from '../constants';

const Results: React.FC = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<ResultData | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [isEmailed, setIsEmailed] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hashQuery = window.location.hash.includes('?')
      ? window.location.hash.slice(window.location.hash.indexOf('?') + 1)
      : '';
    const hashParams = new URLSearchParams(hashQuery);
    hashParams.forEach((value, key) => {
      if (!params.has(key)) params.set(key, value);
    });

    const urlScore = params.get('score');
    const isDirectPdf = params.get('pdf') === 'true';

    const getIntParam = (name: string) => {
      const val = params.get(name);
      if (!val || val.trim() === '') return 0;
      const parsed = parseInt(val);
      return isNaN(parsed) ? 0 : parsed;
    };

    if (urlScore !== null) {
      const dimensionScores = [
        { id: "D1", label: DIMENSIONS.D1.label, score: getIntParam('d1'), color: "#0F766E" },
        { id: "D2", label: DIMENSIONS.D2.label, score: getIntParam('d2'), color: "#1D4ED8" },
        { id: "D3", label: DIMENSIONS.D3.label, score: getIntParam('d3'), color: "#F59E0B" },
        { id: "D4", label: DIMENSIONS.D4.label, score: getIntParam('d4'), color: "#6366F1" },
        { id: "T", label: DIMENSIONS.T.label, score: getIntParam('t'), color: "#DC2626" }
      ];

      const sorted = [...dimensionScores].sort((a, b) => a.score - b.score);
      const guestResults: ResultData = {
        globalScore: getIntParam('score'),
        dimensionScores,
        topRisks: sorted.slice(0, 3).map(dim => ({ dimension: dim.id, score: dim.score })),
        quickWins: sorted.slice(0, 3).map(dim => QUICK_WINS[dim.id as keyof typeof QUICK_WINS]).filter(Boolean)
      };

      setResults(guestResults);
      setIsGuest(true);
      logEvent(AnalyticsEvent.RESULT_VIEWED, {
        ...buildResultAnalyticsPayload(guestResults),
        result_source: 'shared_url'
      });

      if (isDirectPdf) {
        setShowPDF(true);
        setTimeout(() => window.print(), 500);
      }
      return;
    }

    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        const state = JSON.parse(saved);
        if (!state.isCompleted) {
          navigate('/radar');
          return;
        }

        const calculated = calculateResults(state.answers);
        setResults(calculated);
        logEvent(AnalyticsEvent.RESULT_VIEWED, {
          ...buildResultAnalyticsPayload(calculated),
          result_source: 'completed_diagnostic'
        });
      } catch (e) {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  if (!results) {
    return <div className="min-h-screen flex items-center justify-center dark:text-white">Cargando...</div>;
  }

  const getExposureMeta = (score: number) => {
    if (score < 40) return { label: "Alta", badge: "bg-red-600", text: "text-red-600", border: "border-red-200" };
    if (score < 70) return { label: "Media", badge: "bg-amber-500", text: "text-amber-600", border: "border-amber-200" };
    return { label: "Baja", badge: "bg-green-600", text: "text-green-600", border: "border-green-200" };
  };

  const exposure = getExposureMeta(results.globalScore);
  const mainRisk = results.topRisks[0];
  const mainRiskLabel = results.dimensionScores.find(d => d.id === mainRisk?.dimension)?.label || "Coste invisible";
  const summary =
    results.globalScore < 40
      ? "Tu diagnóstico apunta a una fuga de capacidad que ya se está pagando en coste, mandos o continuidad."
      : results.globalScore < 70
        ? "Tu empresa tiene parte del problema visible, pero aún hay zonas grises donde el absentismo se convierte en coste."
        : "Tu empresa muestra una base razonable de control. El foco ahora es anticipar desviaciones y evitar costes normalizados.";

  const buildPayload = (status: string) => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    const state = JSON.parse(saved);
    state.answers['meeting_optin'] = status;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    const calc = calculateResults(state.answers);
    const firstRisk = calc.topRisks[0]?.dimension || "D1";
    const firstRiskLabel = calc.dimensionScores.find(d => d.id === firstRisk)?.label || "";

    return {
      contact: {
        name: state.answers['firstname'] || "",
        firstname: state.answers['firstname'] || "",
        lastname: "",
        email: state.answers['email'] || "",
        company: state.answers['company'] || "",
        role: state.answers['role'] || "",
        company_size: state.answers['company_size'] || "",
        sector: state.answers['sector'] || "",
        work_model: state.answers['work_model'] || "",
        pain_point: firstRiskLabel,
        pain_point_1: firstRiskLabel,
        pain_point_2: calc.dimensionScores.find(d => d.id === calc.topRisks[1]?.dimension)?.label || "",
        pain_point_3: calc.dimensionScores.find(d => d.id === calc.topRisks[2]?.dimension)?.label || "",
        pain_points_txt: calc.topRisks
          .map(r => calc.dimensionScores.find(d => d.id === r.dimension)?.label)
          .filter(Boolean)
          .join(", ")
      },
      survey: {
        globalScore: calc.globalScore,
        d1: calc.dimensionScores.find(d => d.id === "D1")?.score || 0,
        d2: calc.dimensionScores.find(d => d.id === "D2")?.score || 0,
        d3: calc.dimensionScores.find(d => d.id === "D3")?.score || 0,
        d4: calc.dimensionScores.find(d => d.id === "D4")?.score || 0,
        t: calc.dimensionScores.find(d => d.id === "T")?.score || 0,
        r1: calc.topRisks[0]?.dimension || "D1",
        r2: calc.topRisks[1]?.dimension || "D2",
        r3: calc.topRisks[2]?.dimension || "T",
        risks: calc.topRisks,
        scores: calc.dimensionScores.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.score }), {} as Record<string, number>),
        answers: state.answers
      },
      meta: {
        timestamp: new Date().toISOString(),
        meetingOptIn: status,
        eventType: status === "Downloaded Report" ? "report_downloaded" : "result_followup",
        funnelId: "absentismo_laboral",
        payloadVersion: "2026_05_absentismo_v1",
        reportDelivery: "all_completed_leads",
        conversionLogic: "report_for_internal_review_booking_for_interpretation",
        isUnlocked: false
      }
    };
  };

  const notifyMake = async (status: string) => {
    if (!APP_CONFIG.POST_ENDPOINT_URL) return;
    const payload = buildPayload(status);
    if (!payload) return;

    try {
      await fetch(APP_CONFIG.POST_ENDPOINT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      });
    } catch (e) {
      console.error("Error notifying Make:", e);
    }
  };

  const handleBookCall = () => {
    logEvent(AnalyticsEvent.BOOKING_CTA_CLICKED, {
      ...buildResultAnalyticsPayload(results),
      cta_text: 'Saber qué palanca mover primero'
    });
    navigate('/agendar');
  };

  const handleDownloadPDF = async () => {
    logEvent(AnalyticsEvent.REPORT_DOWNLOADED, {
      ...buildResultAnalyticsPayload(results),
      report_format: 'print_pdf'
    });
    await notifyMake("Downloaded Report");
    setIsEmailed(true);
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
      <div className="min-h-screen bg-bgLight dark:bg-darkBg pb-20 print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-10 sm:py-14">
          <div className="text-center mb-8">
            <p className="text-sm font-bold uppercase tracking-wide text-accent1">Informe de fuga de capacidad</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-primary dark:text-white">
              Diagnóstico completado
            </h1>
            {!isGuest && (
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                El informe queda disponible ahora para revisarlo, descargarlo o reenviarlo internamente.
              </p>
            )}
          </div>

          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6">
            <div className={`bg-white dark:bg-slate-900 border ${exposure.border} dark:border-slate-700 rounded-lg p-6 shadow-sm`}>
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Nivel de exposición</p>
                  <p className={`text-3xl font-black ${exposure.text}`}>{exposure.label}</p>
                </div>
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <span className="text-3xl font-black text-primary dark:text-white">{results.globalScore}</span>
                </div>
              </div>

              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{summary}</p>

              <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-500 dark:text-slate-400">Tu fuga principal</p>
                <p className="mt-1 text-xl font-bold text-primary dark:text-white">{mainRiskLabel}</p>
                {results.quickWins[0] && (
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{results.quickWins[0]}</p>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-bold text-primary dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-accent1" />
                Resultado por foco
              </h2>

              <div className="space-y-4">
                {results.dimensionScores.map((dim) => {
                  const dimExposure = getExposureMeta(dim.score);
                  return (
                    <div key={dim.id}>
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{dim.label}</span>
                        <span className={`text-xs font-bold ${dimExposure.text}`}>{dimExposure.label}</span>
                      </div>
                      <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${dimExposure.badge}`}
                          style={{ width: `${Math.max(dim.score, 8)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 grid sm:grid-cols-3 gap-3">
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                  <p className="text-xl font-black text-accent1">7,1%</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">horas pactadas perdidas</p>
                </div>
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                  <p className="text-xl font-black text-accent1">5,5%</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">por baja médica</p>
                </div>
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                  <p className="text-xl font-black text-accent1">12,3%</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">sectores de mayor exposición</p>
                </div>
              </div>
            </div>
          </div>

          {!isGuest && (
            <div className="mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-sm">
              <div className="grid lg:grid-cols-[1fr_auto] gap-5 items-center">
                <div>
                  <h2 className="text-xl font-bold text-primary dark:text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    Del diagnóstico a decisión interna
                  </h2>
                  <p className="mt-2 text-slate-600 dark:text-slate-300">
                    El informe te muestra dónde está la fuga. La revisión te muestra qué palanca mover primero: coste real, causa probable o momento de actuación.
                  </p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    En 15 minutos ordenamos tus 3 palancas y dejamos claro qué dato pedir primero a RRHH, Operaciones o Finanzas.
                  </p>
                </div>
                <Button onClick={handleBookCall} className="px-7 py-4 text-base rounded-md w-full lg:w-auto">
                  <Calendar className="w-5 h-5 mr-2" />
                  Saber qué palanca mover primero
                </Button>
              </div>

              <div className="mt-5 flex flex-col gap-3 items-center justify-center">
                {isEmailed ? (
                  <div className="flex items-center text-green-600 font-medium">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Informe listo para revisión interna.
                  </div>
                ) : (
                  <button
                    onClick={handleDownloadPDF}
                    className="w-full sm:w-auto py-3 px-5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    Descargar informe para revisarlo internamente
                  </button>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                  El informe es tuyo aunque no agendes. La revisión solo sirve para priorizar la decisión.
                </p>
              </div>
            </div>
          )}

          {isGuest && (
            <div className="mt-6 text-center">
              <button
                onClick={handleDownloadPDF}
                className="text-sm text-accent2 hover:text-accent1 inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-900 px-5 py-3 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold"
              >
                <Download className="w-5 h-5" />
                Descargar informe para revisarlo internamente
              </button>
            </div>
          )}

          <div className="mt-10 text-center text-xs text-slate-500">
            <p>GFS Consulting. Diagnóstico generado automáticamente.</p>
          </div>
        </div>
      </div>

      <div className="hidden print:block bg-white text-black min-h-screen">
        <PrintableReport results={results} />
      </div>
    </>
  );
};

export default Results;
