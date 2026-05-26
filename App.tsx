import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import Landing from './pages/Landing';
import RadarWizard from './pages/RadarWizard';
import Results from './pages/Results';
import LandingTalento from './pages/LandingTalento';
import LandingAbsentismo from './pages/LandingAbsentismo';
import RadarWizardTalento from './pages/RadarWizardTalento';
import RadarWizardAbsentismo from './pages/RadarWizardAbsentismo';
import ResultsTalento from './pages/ResultsTalento';
import ResultsAbsentismo from './pages/ResultsAbsentismo';
import BookingPage from './pages/BookingPage';
import Dashboard from './pages/Dashboard';
import DashboardResults from './pages/DashboardResults';
import { identifyLead, logEvent, AnalyticsEvent } from './utils/analytics';
import { STORAGE_KEY } from './constants';
import { getActiveFunnel } from './utils/funnelSelector';

const PageTracker = () => {
  const location = useLocation();

  useEffect(() => {
    logEvent(AnalyticsEvent.PAGE_VIEW, {
      hash_route: window.location.hash || '#/'
    });
    window.scrollTo(0, 0);
  }, [location]);

  return null;
};

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailFromUrl = params.get('email');

    if (emailFromUrl) {
      const email = emailFromUrl.trim().replace(/\s/g, '');
      if (email.includes('@')) {
        const savedState = localStorage.getItem(STORAGE_KEY);
        let stateObj;
        try {
          stateObj = savedState ? JSON.parse(savedState) : { step: 0, answers: {}, isCompleted: false };
        } catch (e) {
          stateObj = { step: 0, answers: {}, isCompleted: false };
        }

        stateObj.answers = { ...stateObj.answers, email };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateObj));

        identifyLead(email, {
          source: 'email_campaign',
          identification_step: 'url_email_param'
        });
        logEvent(AnalyticsEvent.IDENTIFIED_FROM_EMAIL_LINK, {
          source: 'email_campaign'
        });
      }
    }
  }, []);

  const activeFunnel = getActiveFunnel();
  const headerTitle = activeFunnel === 'talento' ? 'DIAGNÓSTICO TALENTO' : 'DIAGNÓSTICO ABSENTISMO';

  return (
    <HashRouter>
      <PageTracker />
      <div className="min-h-screen flex flex-col font-sans text-primary dark:text-white transition-colors duration-300">
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent1 to-accent2">
                {headerTitle}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300 transition-colors"
                aria-label="Cambiar modo visual"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-grow">
          <Routes>
            {/* Dynamic domain/hash selectors */}
            <Route path="/" element={<Landing />} />
            <Route path="/radar" element={<RadarWizard />} />
            <Route path="/resultado" element={<Results />} />
            <Route path="/resultados" element={<Results />} />

            {/* Explicit Talento Funnel routes */}
            <Route path="/talento" element={<LandingTalento />} />
            <Route path="/radar-talento" element={<RadarWizardTalento />} />
            <Route path="/resultado-talento" element={<ResultsTalento />} />
            <Route path="/resultados-talento" element={<ResultsTalento />} />

            {/* Explicit Absentismo Funnel routes */}
            <Route path="/absentismo" element={<LandingAbsentismo />} />
            <Route path="/radar-absentismo" element={<RadarWizardAbsentismo />} />
            <Route path="/resultado-absentismo" element={<ResultsAbsentismo />} />
            <Route path="/resultados-absentismo" element={<ResultsAbsentismo />} />

            {/* General Routes */}
            <Route path="/agendar" element={<BookingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/mis-resultados" element={<DashboardResults />} />
          </Routes>
        </main>

        <footer className="bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-gray-800 py-10 print:hidden transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 dark:text-gray-400 text-sm">
            <p className="mb-4">© 2026 GFS Consulting. Todos los derechos reservados.</p>
            <div className="flex justify-center space-x-6">
              <a href="#" className="hover:text-primary dark:hover:text-white transition-colors">Política de Privacidad</a>
              <a href="#" className="hover:text-primary dark:hover:text-white transition-colors">Cookies</a>
              <a href="#" className="hover:text-primary dark:hover:text-white transition-colors">Contacto</a>
            </div>
            <p className="mt-4 text-xs text-gray-400">
              Diagnóstico ejecutivo automatizado.
            </p>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
