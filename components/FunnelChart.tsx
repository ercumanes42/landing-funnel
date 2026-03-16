import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';

const data = [
    { name: 'Visitas', count: 1200, fill: '#6366f1' }, // Indigo-500
    { name: 'Completados', count: 350, fill: '#8b5cf6' }, // Violet-500
    { name: 'Agendados', count: 45, fill: '#ec4899' }, // Pink-500
];

const FunnelChart: React.FC = () => {
    return (
        <div className="w-full h-[400px] bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Embudo de Conversión</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af' }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af' }}
                    />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '8px',
                            border: 'none',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]} animationDuration={1500}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                        <LabelList dataKey="count" position="top" fill="#6b7280" />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 text-center gap-4">
                {data.map((item, index) => (
                    <div key={index} className="flex flex-col">
                        <span className="text-2xl font-bold" style={{ color: item.fill }}>{item.count}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{item.name}</span>
                        {index > 0 && (
                            <span className="text-xs text-gray-400 mt-1">
                                {Math.round((item.count / data[index - 1].count) * 100)}% conv.
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FunnelChart;
