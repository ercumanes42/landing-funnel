import React from 'react';
import { Users, CheckCircle, Calendar, TrendingUp } from 'lucide-react';
import FunnelChart from '../components/FunnelChart';

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <h3 className="text-3xl font-bold mt-2 text-gray-800 dark:text-white">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
        {trend && (
            <div className="mt-4 flex items-center text-sm text-green-500">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>{trend} vs mes anterior</span>
            </div>
        )}
    </div>
);

const Dashboard: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Panel de Control</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Visión general del rendimiento del embudo de diagnóstico.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        title="Visitas Totales"
                        value="1,200"
                        icon={Users}
                        color="bg-indigo-500"
                        trend="+12%"
                    />
                    <StatCard
                        title="Tests Completados"
                        value="350"
                        icon={CheckCircle}
                        color="bg-violet-500"
                        trend="+8%"
                    />
                    <StatCard
                        title="Citas Agendadas"
                        value="45"
                        icon={Calendar}
                        color="bg-pink-500"
                        trend="+15%"
                    />
                </div>

                {/* Main Chart Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <FunnelChart />
                    </div>

                    {/* Recent Activity / Insights */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Insights Rápidos</h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                                <p className="text-sm text-green-800 dark:text-green-300">
                                    <strong>Tasa de conversión alta:</strong> El 29% de los visitantes completan el test, superando el promedio del sector (15%).
                                </p>
                            </div>
                            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                                <p className="text-sm text-indigo-800 dark:text-indigo-300">
                                    <strong>Oportunidad:</strong> Solo el 12% de los leads agendan cita. Considera mejorar el copy de la página de resultados.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Leads Table */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Últimos Leads Capturados</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                            <thead className="bg-gray-50 dark:bg-slate-700/50 text-xs uppercase text-gray-700 dark:text-gray-300">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Nombre</th>
                                    <th className="px-6 py-4 font-semibold">Empresa</th>
                                    <th className="px-6 py-4 font-semibold">Rol</th>
                                    <th className="px-6 py-4 font-semibold text-center">Puntuación</th>
                                    <th className="px-6 py-4 font-semibold">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {[
                                    { name: "Ana García", company: "Tech Solutions SL", role: "CEO", score: 85, status: "Agendado" },
                                    { name: "Carlos Ruiz", company: "Logística Express", role: "RRHH", score: 42, status: "Completado" },
                                    { name: "Elena Mayor", company: "Retail Future", role: "Director General", score: 68, status: "Completado" },
                                    { name: "David López", company: "Consulting Group", role: "Gerente", score: 91, status: "Agendado" },
                                    { name: "Sofía Martín", company: "Industrias Norte", role: "Responsable Área", score: 35, status: "Pendiente" },
                                ].map((lead, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{lead.name}</td>
                                        <td className="px-6 py-4">{lead.company}</td>
                                        <td className="px-6 py-4">{lead.role}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium ${lead.score >= 70 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                                    lead.score >= 40 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                }`}>
                                                {lead.score}/100
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${lead.status === 'Agendado' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' :
                                                    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                                                }`}>
                                                {lead.status}
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
