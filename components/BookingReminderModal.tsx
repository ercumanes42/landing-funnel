import React from 'react';
import { X, Calendar, Download } from 'lucide-react';

interface BookingReminderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onBook: () => void;
    onDownload: () => void;
}

const BookingReminderModal: React.FC<BookingReminderModalProps> = ({
    isOpen,
    onClose,
    onBook,
    onDownload
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-accent1 to-accent2 rounded-full flex items-center justify-center">
                        <Calendar className="w-8 h-8 text-white" />
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
                    📊 Tu Informe Está Listo
                </h3>

                {/* Description */}
                <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
                    Para una <span className="font-semibold">mejor comprensión</span> de los resultados,
                    te recomendamos una sesión de <span className="font-semibold">20 minutos</span> con
                    nuestro experto en estrategia de talento.
                </p>

                {/* Benefits list */}
                <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2 mb-6">
                    <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        Interpretación personalizada de tus datos
                    </li>
                    <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        Respuestas a tus dudas específicas
                    </li>
                    <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        Recomendaciones accionables inmediatas
                    </li>
                </ul>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={onBook}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-accent1 to-accent2 text-white font-bold py-3 px-4 rounded-xl hover:opacity-90 transition-opacity"
                    >
                        <Calendar className="w-5 h-5" />
                        Agendar Sesión
                    </button>
                    <button
                        onClick={onDownload}
                        className="flex-1 flex items-center justify-center gap-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 font-medium py-3 px-4 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        <Download className="w-5 h-5" />
                        Solo Descargar PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingReminderModal;
