import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ShieldCheck, Clock, Zap } from 'lucide-react';
import Button from '../components/Button';
import { logEvent, AnalyticsEvent } from '../utils/analytics';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    logEvent(AnalyticsEvent.LANDING_CTA_CLICKED, {
      cta_text: 'Comenzar diagnóstico gratuito'
    });
    navigate('/radar');
  };

  return (
    <div className="bg-bgLight dark:bg-darkBg transition-colors duration-300 overflow-x-hidden">
      <section className="min-h-[calc(100svh-4rem)] flex items-center border-b border-slate-200 dark:border-slate-800">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
          <div className="grid lg:grid-cols-[0.92fr_1.08fr] gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-serif font-bold text-primary dark:text-white leading-[1.08] max-w-4xl mx-auto lg:mx-0">
                ¿Estás perdiendo a tus <span className="text-accent1">mejores talentos</span> sin saber por qué?
              </h1>

              <ul className="mt-6 max-w-2xl mx-auto lg:mx-0 grid gap-3 text-left text-base sm:text-lg text-slate-700 dark:text-slate-200 font-semibold">
                {[
                  'El 75% de las empresas reporta un aumento en rotación voluntaria.',
                  'Descubre si tu organización sufre fricciones silenciosas.',
                  'Evalúa tus niveles de liderazgo y colaboración generacional.'
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 w-5 h-5 text-accent1 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col items-center lg:items-start gap-4">
                <Button 
                  onClick={handleStart} 
                  className="group relative text-base sm:text-lg px-8 py-4 rounded-xl shadow-lg shadow-accent1/20 hover:shadow-xl hover:shadow-accent1/35 w-full sm:w-auto bg-gradient-to-r from-accent1 to-accent2 hover:opacity-95 transition-all duration-300 text-white font-bold tracking-wide flex items-center justify-center transform hover:-translate-y-0.5"
                >
                  Comenzar diagnóstico gratuito
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
                </Button>
                
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-2 text-xs sm:text-sm font-medium">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/10">
                    <Zap className="w-3.5 h-3.5 shrink-0" />
                    Sin registro previo
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-500/10 dark:bg-teal-500/5 text-teal-600 dark:text-teal-400 border border-teal-500/20 dark:border-teal-500/10">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    3 minutos
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                    Confidencial y seguro
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:justify-self-end">
              <img
                src="/hero-talento-radar.png"
                alt="Ilustración de diagnóstico de talento y liderazgo"
                className="w-full max-w-xl xl:max-w-2xl max-h-[48svh] lg:max-h-[68svh] object-contain mx-auto rounded-lg shadow-xl shadow-slate-900/10 border border-slate-200 dark:border-slate-800"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
