import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, FileText, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
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
      {/* Hero Section */}
      <section className="min-h-[100svh] relative flex flex-col items-center justify-center pt-16 sm:pt-20 pb-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-white to-white dark:from-slate-900 dark:via-darkBg dark:to-darkBg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center flex flex-col items-center">
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-primary dark:text-white mb-3 sm:mb-4 leading-tight max-w-4xl mx-auto animate-fade-in-up">
            Diagnóstico Ejecutivo de <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent1 to-accent2">Talento y Organización 2026</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 mb-5 sm:mb-6 leading-relaxed max-w-3xl mx-auto animate-fade-in-up delay-100">
            Detecta tus principales riesgos en rotación, liderazgo, sucesión, clima y uso de IA en menos de 3 minutos.
          </p>

          <div className="flex flex-col gap-2 text-left mb-6 sm:mb-8 animate-fade-in-up delay-200 text-gray-700 dark:text-gray-300 mx-auto justify-center bg-white dark:bg-slate-800/50 p-3 sm:p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm inline-flex text-xs sm:text-sm">
            <p className="flex items-center"><Clock className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mr-2.5 flex-shrink-0" /> <span className="font-medium">8 preguntas rápidas</span></p>
            <p className="flex items-center"><FileText className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mr-2.5 flex-shrink-0" /> <span className="font-medium">Resultado instantáneo privado</span></p>
            <p className="flex items-center"><CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mr-2.5 flex-shrink-0" /> <span className="font-medium">Informe ejecutivo enviado por email</span></p>
            <p className="flex items-center"><ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mr-2.5 flex-shrink-0" /> <span className="font-medium">Sin coste, sin datos sensibles de tu equipo</span></p>
          </div>

          <div className="flex flex-col items-center animate-fade-in-up delay-300 w-full">
            <Button onClick={handleStart} className="text-sm sm:text-base md:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-full animate-glow font-bold tracking-wide hover:scale-105 transition-transform duration-200 shadow-2xl shadow-accent1/30 w-full sm:w-auto max-w-xl">
              Iniciar diagnóstico
              <ArrowRight className="ml-2 w-5 h-5 pointer-events-none" />
            </Button>
            <span className="mt-2 sm:mt-3 text-[10px] sm:text-xs md:text-sm font-medium text-gray-400 dark:text-gray-500">Menos de 3 minutos. Diseñado para equipos de RRHH y dirección.</span>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Landing;