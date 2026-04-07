import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, MapPin, Users, Navigation, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const statusConfig = {
    Low: { label: 'Low Crowd', color: 'text-semantic-green', bg: 'bg-semantic-green/10', border: 'border-semantic-green/30', bar: 'bg-semantic-green' },
    Medium: { label: 'Moderate Crowd', color: 'text-semantic-yellow', bg: 'bg-semantic-yellow/10', border: 'border-semantic-yellow/30', bar: 'bg-semantic-yellow' },
    High: { label: 'High Crowd', color: 'text-semantic-red', bg: 'bg-semantic-red/10', border: 'border-semantic-red/30', bar: 'bg-semantic-red' },
};

const ServiceDetailModal = ({ service, isOpen, onClose }) => {
    const [reports, setReports] = useState([]);
    const [loadingReports, setLoadingReports] = useState(false);
    const { isAuthenticated, joinQueue } = useAuth();
    const toast = useToast();

    useEffect(() => {
        if (isOpen && service) {
            setLoadingReports(true);
            fetch(`/api/reports/place/${service.id}`)
                .then(r => r.json())
                .then(data => setReports(data))
                .catch(() => setReports([]))
                .finally(() => setLoadingReports(false));
        }
    }, [isOpen, service]);

    const handleJoinQueue = async () => {
        if (!isAuthenticated) {
            toast.error('Please sign in to join a virtual queue');
            return;
        }
        try {
            const entry = await joinQueue(service);
            toast.success(`Joined queue for ${service.name}! You are visitor #${entry.position}.`);
            onClose();
        } catch (error) {
            toast.error(error.message || 'Could not join queue.');
        }
    };

    if (!service) return null;
    const config = statusConfig[service.status] || statusConfig.Low;
    const percentage = Math.min((service.waitTime / 60) * 100, 100);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-x-4 bottom-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:bottom-8 sm:w-full sm:max-w-lg bg-white dark:bg-dark-card rounded-3xl shadow-2xl dark:shadow-black/50 z-50 overflow-hidden max-h-[85vh] flex flex-col"
                    >
                        {/* Header gradient */}
                        <div className="relative p-6 pb-4">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent dark:from-primary-500/10 dark:to-transparent pointer-events-none" />

                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 transition-colors z-10 backdrop-blur-sm"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="relative z-10">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border mb-3 ${config.bg} ${config.color} ${config.border}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${config.bar} animate-pulse`} />
                                    {config.label}
                                </div>
                                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-1">{service.name}</h2>
                                <p className="text-gray-500 dark:text-dark-muted font-medium">{service.type}</p>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="px-6 grid grid-cols-3 gap-3 mb-4">
                            <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-3 text-center">
                                <Clock className="w-5 h-5 text-primary-500 dark:text-primary-400 mx-auto mb-1" />
                                <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">{service.waitTime}</p>
                                <p className="text-xs text-gray-500 dark:text-dark-muted font-semibold">min wait</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-3 text-center">
                                <MapPin className="w-5 h-5 text-primary-500 dark:text-primary-400 mx-auto mb-1" />
                                <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">{service.distance}</p>
                                <p className="text-xs text-gray-500 dark:text-dark-muted font-semibold">away</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-3 text-center">
                                <Users className="w-5 h-5 text-primary-500 dark:text-primary-400 mx-auto mb-1" />
                                <p className={`text-2xl font-extrabold ${config.color}`}>{service.status}</p>
                                <p className="text-xs text-gray-500 dark:text-dark-muted font-semibold">crowd</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="px-6 mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-gray-500 dark:text-dark-muted uppercase tracking-wider">Queue Capacity</span>
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{Math.round(percentage)}%</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    className={`h-full rounded-full ${config.bar}`}
                                />
                            </div>
                        </div>

                        {/* Recent Reports */}
                        <div className="px-6 flex-1 overflow-y-auto mb-4">
                            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">Recent Reports</h3>
                            {loadingReports ? (
                                <div className="flex justify-center py-4">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500" />
                                </div>
                            ) : reports.length === 0 ? (
                                <div className="flex items-center gap-2 text-gray-400 dark:text-slate-500 text-sm py-3">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>No reports submitted yet for this location</span>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {reports.slice(0, 5).map((report, i) => (
                                        <motion.div
                                            key={report._id || i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800 rounded-xl px-3 py-2.5 text-sm"
                                        >
                                            <div className={`w-2 h-2 rounded-full ${statusConfig[report.reportedCrowdStatus]?.bar || 'bg-gray-400'}`} />
                                            <span className="font-semibold text-gray-700 dark:text-gray-300">{report.reportedCrowdStatus}</span>
                                            <span className="text-gray-400 dark:text-slate-500">•</span>
                                            <span className="text-gray-500 dark:text-dark-muted">{report.reportedWaitTime} min</span>
                                            <span className="ml-auto text-xs text-gray-400 dark:text-slate-500">
                                                {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* CTA Buttons */}
                        <div className="px-6 pb-6 flex gap-3">
                            <motion.button
                                onClick={handleJoinQueue}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-shadow"
                            >
                                <Users className="w-4 h-4" />
                                Join Virtual Queue
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold border border-gray-200 dark:border-dark-border hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                <Navigation className="w-4 h-4" />
                                Directions
                            </motion.button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ServiceDetailModal;
