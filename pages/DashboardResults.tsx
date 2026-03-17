import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Calendar } from 'lucide-react';
import Button from '../components/Button';
import PrintableReport from '../components/PrintableReport';
import { DIMENSIONS } from '../constants';
import { ResultData } from '../types';

const DashboardResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState<ResultData | null>(null);
  const [showPDF, setShowPDF] = useState(false);

  useEffect(() => {
    const getIntParam = (name: string) => {
      const val = searchParams.get(name);
      if (!val || val.trim() === '') return 0;
      const parsed = parseInt(val);
      return isNaN(parsed) ? 0 : parsed;
    };

    const d1 = getIntParam('d1');
    const d2 = getIntParam('d2');
    const d3 = getIntParam('d3');
    const d4 = getIntParam('d4');
    const t = getIntParam('t');

    const dimensionScores = [
      { id: 'D1', label: DIMENSIONS.D1.label, score: d1 },
      { id: 'D2', label: DIMENSIONS.D2.label, score: d2 },
      { id: 'D3', label: DIMENSIONS.D3.label, score: d3 },
      { id: 'D4', label: DIMENSIONS.D4.label, score: d4 },
      { id: 'T', label: DIMENSIONS.T.label, score: t },
    ];

    const sorted = [...dimensionScores].sort((a, b) => a.score - b.score);

    setResults({
      globalScore: getIntParam('score'),
      dimensionScores,
      topRisks: [
        { dimension: sorted[0].id, score: sorted[0].score },
        { dimension: sorted[1].id, score: sorted[1].score },
        { dimension: sorted[2].id, score: sorted[2].score }
      ],
      quickWins: []
    });
  }, [searchParams]);

  const getExposureLevel = (score: number) => {
    if (score < 40) return { level: 'Alta', color: 'bg-red-500', text: 'text-red-500' };
    if (score < 70) return { level: 'Media', color: 'bg-amber-500', text: 'text-amber-500' };
    return { level: 'Baja', color: 'bg-green-500', text: 'text-green-500' };
  };

  const handleDownloadPDF = () => {
    setShowPDF(true);
  };

  const handleBookCall = () => {
    window.location.href = 'https://calendly.com/joaquingfs/diagnostico-ejecutivo-y-hoja-de-ruta';
  };

  if (!results) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (showPDF) {
    return (
      <div className="min-h-screen bg-white">
        <PrintableReport results={results} />
        <div className="fixed bottom-4 right-4">
          <Button onClick={() => setShowPDF(false)} className="bg-slate-600">
            Cerrar PDF
          </Button>
        </div>
      </div>
    );
  }

  const exposure = getExposureLevel(results.globalScore);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 pb-20 text-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            GFS Consulting
          </h1>
        </div>

        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 text-center mb-6">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center bg-slate-700">
            <span className="text-5xl font-bold">{results.globalScore}</span>
          </div>
          
          <div className={`inline-flex items-center px-4 py-2 rounded-full font-bold mb-4 ${exposure.color} text-white`}>
            Exposición {exposure.level}
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 mb-6">
          <h2 className="text-lg font-bold mb-4">Resultados por Dimensión</h2>
          
          <div className="space-y-4">
            {results.dimensionScores.map((dim) => {
              const dimExposure = getExposureLevel(dim.score);
              return (
                <div key={dim.id} className="flex items-center gap-4">
                  <div className="w-40 text-sm text-slate-300">{dim.label}</div>
                  <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${dimExposure.color}`} 
                      style={{ width: `${dim.score}%` }}
                    />
                  </div>
                  <div className="w-12 text-right font-bold">{dim.score}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <Button onClick={handleDownloadPDF} fullWidth className="bg-cyan-600 hover:bg-cyan-700">
            <Download className="w-5 h-5 mr-2" />
            Descargar Informe PDF
          </Button>
          
          <Button onClick={handleBookCall} variant="outline" fullWidth className="border-slate-600 text-slate-300 hover:bg-slate-800">
            <Calendar className="w-5 h-5 mr-2" />
            Agendar Revisión Personal
          </Button>
        </div>

        <div className="mt-8 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} GFS Consulting</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardResults;
