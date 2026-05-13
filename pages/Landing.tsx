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
    <div className="bg-bgLight dark:bg-darkBg transition-colors duration-300 overflow-x-hidden relative">
      {/* Decorative gradient blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent1/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent2/10 blur-[120px] pointer-events-none" />
      
      <section className="min-h-[calc(100svh-4rem)] flex items-center py-12 sm:py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent1/10 dark:bg-accent1/20 border border-accent1/20 text-xs sm:text-sm font-semibold text-accent1 dark:text-indigo-400 mb-6 shadow-sm">
                <ShieldCheck className="w-4 h-4" />
                Sin datos medicos ni datos sensibles de empleados
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-primary dark:text-white leading-[1.1] max-w-4xl">
                Diagnostico de <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent1 to-accent2">Coste Oculto</span> del Absentismo
              </h1>

              <p className="mt-5 text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                En 2 minutos identifica donde se esta convirtiendo el absentismo en coste, carga para mandos o riesgo operativo.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-4 sm:items-center">
                <Button onClick={handleStart} className="text-base sm:text-lg px-8 py-4 rounded-xl shadow-xl shadow-accent1/30 w-full sm:w-auto bg-gradient-to-r from-accent1 to-accent2 hover:opacity-90 transition-all transform hover:scale-[1.02] text-white font-bold">
                  Calcular mi fuga de capacidad
                  <ArrowRight className="ml-2 w-5 h-5 pointer-events-none" />
                </Button>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center sm:text-left">
                  6 preguntas. Resultado inmediato.<br className="hidden sm:block"/> Informe descargable.
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

            <div className="lg:pl-4 animate-fade-in-up delay-200">
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
                <div className="bg-gradient-to-r from-slate-100 to-white dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-accent1 dark:text-indigo-400 font-bold mb-1">Vista previa</p>
                    <p className="font-bold text-primary dark:text-white text-lg">Informe Ejecutivo de Fuga</p>
                  </div>
                  <Calculator className="w-7 h-7 text-accent2 opacity-80" />
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-[90px_1fr] gap-5 items-center bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50">
                    <div className="w-20 h-20 rounded-full border-4 border-amber-400 flex items-center justify-center bg-white dark:bg-slate-900 shadow-inner">
                      <span className="text-3xl font-black text-primary dark:text-white">52</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nivel estimado</p>
                      <p className="text-xl font-bold text-primary dark:text-white leading-tight">Exposición media</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">El coste existe, pero todavía no está completamente trazado a euros reales.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: 'Coste invisible', value: 'Alto Riesgo', color: 'bg-rose-500 text-white' },
                      { label: 'Sobrecarga operativa', value: 'Medio', color: 'bg-amber-500 text-white' },
                      { label: 'Respuesta tardía', value: 'Medio', color: 'bg-amber-500 text-white' }
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between gap-4 bg-white dark:bg-slate-800 rounded-lg px-5 py-3.5 shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-shadow">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{item.label}</span>
                        <span className={`text-[10px] uppercase tracking-wider font-bold rounded-full px-3 py-1 ${item.color}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-accent1/5 dark:bg-accent1/10 rounded-xl p-5 border border-accent1/10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-accent1"></div>
                    <p className="text-sm font-bold text-accent1 dark:text-indigo-400 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Acción estratégica recomendada
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-2.5 leading-relaxed">
                      Convertir ausencias de los últimos 90 días en coste por área antes de lanzar medidas generales.
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
