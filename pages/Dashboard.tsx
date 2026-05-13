import React, { useState, useMemo } from 'react';
import { Users, CheckCircle, Calendar, TrendingUp, MousePointer, Download, ArrowRight, Clock, Building2, Mail, Filter, Activity, Search, X, BarChart3, PieChart, Globe, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import FunnelChart from '../components/FunnelChart';
import dashboardData from '../dashboard_public_data.json';

const StatCard = ({ title, value, icon: Icon, color, trend, subtitle }: any) => (
  <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{title}</p>
        <h3 className="text-2xl font-bold mt-2 text-gray-800 dark:text-white">{value}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
    {trend && (
      <div className="mt-3 flex items-center text-xs text-green-500">
        <TrendingUp className="w-3 h-3 mr-1" />
        <span>{trend}</span>
      </div>
    )}
  </div>
);

const Dashboard: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const data = dashboardData;

  const funnelSteps = [
    { key: 'abs_page_view', label: 'Vieron Landing', count: data.funnel.abs_page_view.count, percent: 100, icon: Users, color: 'bg-blue-500' },
    { key: 'abs_diagnostic_started', label: 'Iniciaron', count: data.funnel.abs_diagnostic_started.count, percent: 43, icon: MousePointer, color: 'bg-indigo-500' },
    { key: 'abs_mini_result_viewed', label: 'Vieron patrón', count: data.funnel.abs_mini_result_viewed.count, percent: 14, icon: CheckCircle, color: 'bg-violet-500' },
    { key: 'abs_lead_submitted', label: 'Lead capturado', count: data.funnel.abs_lead_submitted.count, percent: 14, icon: Activity, color: 'bg-purple-500' },
    { key: 'abs_result_viewed', label: 'Resultados', count: data.funnel.abs_result_viewed.count, percent: 14, icon: ArrowRight, color: 'bg-pink-500' },
  ];

  const filteredUsers = useMemo(() => {
    let users = data.users;
    if (searchTerm) {
      users = users.filter((u: any) => u.email.toLowerCase().includes(searchTerm.toLowerCase()) || u.company.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (selectedStage) {
      users = users.filter((u: any) => u.stages[selectedStage as keyof typeof u.stages]);
    }
    return users;
  }, [searchTerm, selectedStage]);

  const funnelChartData = funnelSteps.map(step => ({
    name: step.label,
    value: step.count,
    percent: step.percent
  }));

  const companiesData = data.companies.slice(0, 8).map(c => ({ name: c.name.replace(/ /g, '\n'), leads: c.leads }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-indigo-500" />
              Dashboard Analytics
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {data.config.totalEmailsSent} emails enviados • Período: {data.config.dateRange180.start} a {data.config.dateRange180.end}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs rounded-full flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Solo datos desde 3 Abr
            </span>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-200 text-sm">Limitación de datos</h3>
              <p className="text-amber-700 dark:text-amber-300 text-xs mt-1">
                PostHog solo tiene eventos desde el 3 de abril de 2026. Los 180 días anteriores (Oct 2025 - Mar 2026) no están disponibles en la plataforma.
                Se han identificado <strong>{data.summary.emailsTracked}</strong> emails únicos en el sistema.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Leads Totales" value={data.summary.emailsTracked} icon={Users} color="bg-blue-500" subtitle=" emails únicos" />
          <StatCard title="Visitantes Activos" value={data.summary.uniqueVisitorsWithEvents} icon={Globe} color="bg-indigo-500" subtitle=" con eventos" />
          <StatCard title="Tasa Inicio" value={`${((data.funnel.abs_diagnostic_started.count / data.funnel.abs_page_view.count) * 100).toFixed(0)}%`} icon={MousePointer} color="bg-violet-500" subtitle="iniciaron diagnóstico" />
          <StatCard title="Tasa Conversión" value={`${((data.funnel.abs_result_viewed.count / data.funnel.abs_page_view.count) * 100).toFixed(1)}%`} icon={ArrowRight} color="bg-pink-500" subtitle="completaron todo" />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Funnel Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Embudo de Conversión</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelChartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={11} width={80} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px', color: '#fff' }}
                    formatter={(value: any, name: string) => [value, name === 'value' ? 'Usuarios' : '']}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {funnelChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#EC4899'][index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-5 gap-2 mt-4">
              {funnelSteps.map((step, idx) => (
                <div key={step.key} className="text-center">
                  <div className="text-lg font-bold text-gray-800 dark:text-white">{step.count}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{step.label}</div>
                  <div className="text-xs text-indigo-500">{step.percent}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Companies */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-500" />
              Empresas
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={companiesData} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <XAxis type="number" stroke="#9CA3AF" fontSize={10} />
                  <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={9} width={80} />
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                  <Bar dataKey="leads" fill="#6366F1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-500" />
              Usuarios con Actividad
            </h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar email o empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <select
                value={selectedStage || ''}
                onChange={(e) => setSelectedStage(e.target.value || null)}
                className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Todas las etapas</option>
                <option value="abs_page_view">Vieron landing</option>
                <option value="abs_diagnostic_started">Iniciaron diagnóstico</option>
                <option value="abs_mini_result_viewed">Vieron patrón</option>
                <option value="abs_result_viewed">Vieron resultados</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-slate-700/50 text-xs uppercase text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="px-6 py-3 font-semibold">Usuario</th>
                  <th className="px-6 py-3 font-semibold">Empresa</th>
                  <th className="px-6 py-3 font-semibold">Eventos</th>
                  <th className="px-6 py-3 font-semibold">Duración</th>
                  <th className="px-6 py-3 font-semibold text-center">Progreso</th>
                  <th className="px-6 py-3 font-semibold">Última Actividad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredUsers.map((user: any, idx: number) => {
                  const stages = Object.entries(user.stages).filter(([_, v]) => v).map(([k]) => k);
                  const progress = Math.round((stages.length / 5) * 100);
                  return (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{user.company}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{user.events.toLocaleString()}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{user.sessionDuration}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {stages.map(s => (
                            <span key={s} className={`w-2 h-2 rounded-full ${s === 'abs_page_view' ? 'bg-blue-500' : s === 'abs_diagnostic_started' ? 'bg-indigo-500' : s === 'abs_mini_result_viewed' ? 'bg-violet-500' : s === 'abs_lead_submitted' ? 'bg-purple-500' : 'bg-pink-500'}`} title={s} />
                          ))}
                          <span className="ml-1 text-xs text-gray-500">{progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">{user.lastActive}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No se encontraron usuarios con los filtros seleccionados.
            </div>
          )}
        </div>

        {/* Session Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Duración Promedio</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white">{data.sessionMetrics.avgDuration}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Páginas Vistas</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white">{data.sessionMetrics.avgPagesViewed}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                <TrendingUp className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Tasa de Rebote</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white">{data.sessionMetrics.bounceRate}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                <Activity className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Duración Máxima</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white">{data.sessionMetrics.maxDuration}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Leads */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Top Leads</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-slate-700/50 text-xs uppercase text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="px-6 py-3 font-semibold">Email</th>
                  <th className="px-6 py-3 font-semibold">Empresa</th>
                  <th className="px-6 py-3 font-semibold text-center">Score</th>
                  <th className="px-6 py-3 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {data.topLeads.map((lead: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{lead.email}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{lead.company}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium ${lead.score >= 70 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : lead.score >= 40 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                        {lead.score}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items px-2 py-1 rounded text-xs font-medium ${lead.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : lead.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                        {lead.status === 'completed' ? 'Completado' : lead.status === 'in_progress' ? 'En progreso' : 'Registrado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
