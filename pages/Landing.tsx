import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, Calculator, Clock, FileText, ShieldCheck } from 'lucide-react';
import Button from '../components/Button';
import { logEvent, AnalyticsEvent } from '../utils/analytics';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    logEvent(AnalyticsEvent.CLICK_START);
    logEvent(AnalyticsEvent.DIAGNOSTIC_START);
    navigate('/radar');
  };

  return (
    <div className="bg-bgLight dark:bg-darkBg transition-colors duration-300 overflow-x-hidden">
      <section className="min-h-[calc(100svh-4rem)] flex items-center py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-[1.02fr_0.98fr] gap-8 lg:gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 mb-5">
                <ShieldCheck className="w-4 h-4 text-accent1" />
                Sin datos medicos ni datos sensibles de empleados
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-primary dark:text-white leading-tight max-w-4xl">
                Diagnostico de Coste Oculto del Absentismo
              </h1>

              <p className="mt-5 text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                En 2 minutos identifica donde se esta convirtiendo el absentismo en coste, carga para mandos o riesgo operativo.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3 sm:items-center">
                <Button onClick={handleStart} className="text-base sm:text-lg px-7 py-4 rounded-md shadow-lg shadow-accent1/20 w-full sm:w-auto">
                  Calcular mi fuga de capacidad
                  <ArrowRight className="ml-2 w-5 h-5 pointer-events-none" />
                </Button>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  6 preguntas. Resultado inmediato. Informe descargable.
                </span>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  <p className="text-2xl font-extrabold text-accent1">7,1%</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">horas pactadas perdidas en Espana, 2025T4</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  <p className="text-2xl font-extrabold text-accent1">5,5%</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">por baja medica en el mismo periodo</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  <p className="text-2xl font-extrabold text-accent1">12,3%</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">en los sectores con mayor exposicion</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-accent1" />
                  Basado en fuentes publicas y benchmarks sectoriales
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-accent1" />
                  Pensado para Direccion, RRHH y Operaciones
                </span>
              </div>
            </div>

            <div className="lg:pl-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden">
                <div className="border-b border-slate-200 dark:border-slate-700 px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-bold">Vista previa</p>
                    <p className="font-bold text-primary dark:text-white">Informe de fuga de capacidad</p>
                  </div>
                  <Calculator className="w-6 h-6 text-accent1" />
                </div>

                <div className="p-5 space-y-5">
                  <div className="grid grid-cols-[88px_1fr] gap-4 items-center">
                    <div className="w-20 h-20 rounded-full border-8 border-amber-400 flex items-center justify-center">
                      <span className="text-2xl font-black text-primary dark:text-white">52</span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Nivel estimado</p>
                      <p className="text-xl font-bold text-primary dark:text-white">Exposicion media</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">El coste existe, pero todavia no esta completamente trazado.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: 'Coste invisible', value: 'Alto', color: 'bg-red-500' },
                      { label: 'Sobrecarga operativa', value: 'Medio', color: 'bg-amber-500' },
                      { label: 'Respuesta tardia', value: 'Medio', color: 'bg-amber-500' }
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between gap-4 border border-slate-100 dark:border-slate-800 rounded-md px-4 py-3">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                        <span className={`text-xs font-bold text-white rounded px-2.5 py-1 ${item.color}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                    <p className="text-sm font-semibold text-primary dark:text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-accent1" />
                      Accion recomendada
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                      Convertir ausencias de los ultimos 90 dias en coste por area antes de lanzar medidas generales.
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-500 dark:text-slate-500 text-center">
                Referencias: Randstad Research, INE, ONS, OMS/OIT y evidencia OCDE sobre retorno al trabajo.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
