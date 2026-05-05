import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, MapPin, Users, Navigation, AlertCircle, Phone, CheckCircle2, LogIn, Star, TrendingDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useFavorites } from '../../context/FavoritesContext';

const statusConfig = {
    Low: { label: 'Low Crowd', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/30', bar: 'bg-emerald-500' },
    Medium: { label: 'Moderate Crowd', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/30', bar: 'bg-amber-500' },
    High: { label: 'High Crowd', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10', border: 'border-red-200 dark:border-red-500/30', bar: 'bg-red-500' },
    Closed: { label: 'Closed', color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-slate-700', border: 'border-gray-300 dark:border-slate-600', bar: 'bg-gray-400' },
};

const ServiceDetailModal = ({ service, isOpen, onClose }) => {
    const [reports, setReports] = useState([]);
    const [placeDetail, setPlaceDetail] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [loadingReports, setLoadingReports] = useState(false);
    const [joining, setJoining] = useState(false);
    const { isAuthenticated, joinQueue, queuePositions, arriveAtQueue, completeQueue } = useAuth();
    const toast = useToast();
    const { favorites, toggleFavorite } = useFavorites();

    const isFav = service ? favorites.includes(service.id) : false;
    const activeQueue = service ? queuePositions.find(q =>
        q.serviceId?.toString() === service.id?.toString() &&
        ['waiting', 'arrived', 'serving'].includes(q.status)
    ) : null;

    useEffect(() => {
        if (!isOpen || !service) return;
        setLoadingReports(true);
        Promise.all([
            fetch(`/api/reports/place/${service.id}`).then(r => r.json()).catch(() => []),
            fetch(`/api/places/${service.id}`).then(r => r.json()).catch(() => null),
            fetch(`/api/analytics/predict/${service.id}`).then(r => r.json()).catch(() => null),
        ]).then(([repts, detail, pred]) => {
            setReports(repts);
            setPlaceDetail(detail);
            setPrediction(pred);
        }).finally(() => setLoadingReports(false));
    }, [isOpen, service]);

    const handleJoinQueue = async () => {
        if (!isAuthenticated) { toast.error('Please sign in to join a virtual queue'); return; }
        setJoining(true);
        try {
            const entry = await joinQueue(service);
            toast.success(`Joined queue! You are #${entry.position} in line.`);
            onClose();
        } catch (error) { toast.error(error.message || 'Could not join queue.'); }
        finally { setJoining(false); }
    };

    const handleArrive = async () => {
        try {
            await arriveAtQueue(activeQueue._id);
            toast.success('Marked as arrived! Your wait time tracking has started.');
        } catch { toast.error('Could not update arrival status.'); }
    };

    const handleComplete = async () => {
        try {
            const result = await completeQueue(activeQueue._id);
            toast.success(`Done! Actual wait was ${result.actualWaitTime} minutes. Thank you!`);
            onClose();
        } catch { toast.error('Could not complete queue.'); }
    };

    const handleDirections = () => {
        if (service?.geo) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${service.geo[0]},${service.geo[1]}`, '_blank');
        }
    };

    if (!service) return null;
    const config = statusConfig[service.status] || statusConfig.Low;
    const percentage = Math.min((service.waitTime / 60) * 100, 100);
    const detail = placeDetail || {};

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />

                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-x-4 bottom-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:bottom-8 sm:w-full sm:max-w-lg bg-white dark:bg-dark-card rounded-3xl shadow-2xl dark:shadow-black/50 z-50 overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="relative p-6 pb-4 shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent dark:from-primary-500/10 dark:to-transparent pointer-events-none" />
                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex-1 pr-16">
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border mb-3 ${config.bg} ${config.color} ${config.border}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${config.bar} animate-pulse`} />
                                        {config.label}
                                    </div>
                                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-0.5">{service.name}</h2>
                                    <p className="text-gray-500 dark:text-dark-muted font-medium text-sm">{service.type}</p>
                                    {detail.address && (
                                        <p className="text-gray-400 dark:text-slate-500 text-xs mt-1 flex items-center gap-1">
                                            <MapPin className="w-3 h-3 shrink-0" />{detail.address}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-1.5 absolute top-0 right-0">
                                    <button onClick={() => toggleFavorite(service.id)}
                                        className={`p-2 rounded-xl transition-colors ${isFav ? 'text-red-500 bg-red-50 dark:bg-red-500/10' : 'bg-white/80 dark:bg-slate-800/80 text-gray-400 hover:text-red-400'}`}>
                                        <svg className="w-5 h-5" fill={isFav ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </button>
                                    <button onClick={onClose} className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 transition-colors backdrop-blur-sm">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {/* Stats Grid */}
                            <div className="px-6 grid grid-cols-3 gap-3 mb-4">
                                <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-3 text-center">
                                    <Clock className="w-4 h-4 text-primary-500 mx-auto mb-1" />
                                    <p className="text-xl font-extrabold text-gray-900 dark:text-gray-100">{service.waitTime}</p>
                                    <p className="text-xs text-gray-500 dark:text-dark-muted font-semibold">min wait</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-3 text-center">
                                    <Users className="w-4 h-4 text-primary-500 mx-auto mb-1" />
                                    <p className="text-xl font-extrabold text-gray-900 dark:text-gray-100">{detail.liveQueueCount ?? service.liveCount ?? '—'}</p>
                                    <p className="text-xs text-gray-500 dark:text-dark-muted font-semibold">in queue</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-3 text-center">
                                    <MapPin className="w-4 h-4 text-primary-500 mx-auto mb-1" />
                                    <p className="text-xl font-extrabold text-gray-900 dark:text-gray-100 truncate">{service.distance}</p>
                                    <p className="text-xs text-gray-500 dark:text-dark-muted font-semibold">away</p>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="px-6 mb-4">
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-xs font-bold text-gray-500 dark:text-dark-muted uppercase tracking-wider">Queue Capacity</span>
                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{Math.round(percentage)}%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1, ease: 'easeOut' }} className={`h-full rounded-full ${config.bar}`} />
                                </div>
                            </div>

                            {/* FR-9: ETA prediction */}
                            {prediction && (
                                <div className="mx-6 mb-4 p-3 rounded-2xl bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20 flex items-center gap-3">
                                    <TrendingDown className="w-5 h-5 text-primary-600 dark:text-primary-400 shrink-0" />
                                    <div>
                                        <p className="text-xs font-bold text-primary-700 dark:text-primary-300 uppercase tracking-wider">Predicted Wait</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">~{prediction.predictedWait} min based on historical data</p>
                                    </div>
                                </div>
                            )}

                            {/* FR-11: Best time */}
                            {prediction?.bestTimes?.[0] && (
                                <div className="mx-6 mb-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-3">
                                    <Star className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <div>
                                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Best Time to Visit</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                            {prediction.bestTimes[0].offset === 0 ? 'Now is a good time!' : `In ~${prediction.bestTimes[0].offset}h — ~${prediction.bestTimes[0].predictedWait} min wait`}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Operating Hours & Phone */}
                            {(detail.operatingHours || detail.phone) && (
                                <div className="px-6 mb-4 grid grid-cols-2 gap-3">
                                    {detail.operatingHours && (
                                        <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-3">
                                            <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">Hours</p>
                                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{detail.operatingHours.open} – {detail.operatingHours.close}</p>
                                            <p className="text-xs text-gray-500 dark:text-dark-muted">{detail.operatingHours.days}</p>
                                        </div>
                                    )}
                                    {detail.phone && (
                                        <a href={`tel:${detail.phone}`} className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-3 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                                            <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">Phone</p>
                                            <p className="text-sm font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{detail.phone}</p>
                                        </a>
                                    )}
                                </div>
                            )}

                            {/* Services */}
                            {detail.services?.length > 0 && (
                                <div className="px-6 mb-4">
                                    <p className="text-xs font-bold text-gray-500 dark:text-dark-muted uppercase tracking-wider mb-2">Services Offered</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {detail.services.map(s => (
                                            <span key={s} className="px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 text-xs font-bold">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* FR-4/5: Active queue controls */}
                            {activeQueue && (
                                <div className="mx-6 mb-4 p-4 rounded-2xl bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/30">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                                            <span className="text-sm font-extrabold text-primary-600 dark:text-primary-400">#{activeQueue.position}</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">You're in queue</p>
                                            <p className="text-xs text-gray-500 dark:text-dark-muted">Est. {activeQueue.estimatedWait} min · Status: <span className="capitalize font-bold">{activeQueue.status}</span></p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {activeQueue.status === 'waiting' && (
                                            <motion.button whileTap={{ scale: 0.97 }} onClick={handleArrive}
                                                className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-1.5 hover:bg-emerald-600 transition-colors">
                                                <LogIn className="w-4 h-4" /> I Arrived
                                            </motion.button>
                                        )}
                                        {(activeQueue.status === 'arrived' || activeQueue.status === 'serving') && (
                                            <motion.button whileTap={{ scale: 0.97 }} onClick={handleComplete}
                                                className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white font-bold text-sm flex items-center justify-center gap-1.5 hover:bg-primary-700 transition-colors">
                                                <CheckCircle2 className="w-4 h-4" /> My Turn Finished
                                            </motion.button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Recent Reports */}
                            <div className="px-6 mb-4">
                                <h3 className="text-xs font-bold text-gray-500 dark:text-dark-muted uppercase tracking-wider mb-3">Recent Reports</h3>
                                {loadingReports ? (
                                    <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500" /></div>
                                ) : reports.length === 0 ? (
                                    <div className="flex items-center gap-2 text-gray-400 dark:text-slate-500 text-sm py-2">
                                        <AlertCircle className="w-4 h-4" /> No reports yet for this location
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {reports.slice(0, 5).map((report, i) => (
                                            <div key={report._id || i} className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800 rounded-xl px-3 py-2.5 text-sm">
                                                <div className={`w-2 h-2 rounded-full shrink-0 ${statusConfig[report.reportedCrowdStatus]?.bar || 'bg-gray-400'}`} />
                                                <span className="font-semibold text-gray-700 dark:text-gray-300 capitalize">{report.reportType?.replace('_', ' ') || report.reportedCrowdStatus}</span>
                                                <span className="text-gray-400">·</span>
                                                <span className="text-gray-500 dark:text-dark-muted">{report.reportedWaitTime}min</span>
                                                {report.reporterName && <span className="text-gray-400 text-xs">by {report.reporterName}</span>}
                                                <span className="ml-auto text-xs text-gray-400 dark:text-slate-500">{new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="px-6 pb-6 flex gap-3 shrink-0 border-t border-gray-50 dark:border-dark-border pt-4">
                            {!activeQueue ? (
                                <motion.button onClick={handleJoinQueue} disabled={joining || service.status === 'Closed'}
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold shadow-lg shadow-primary-500/25 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
                                    <Users className="w-4 h-4" />
                                    {joining ? 'Joining...' : service.status === 'Closed' ? 'Currently Closed' : !isAuthenticated ? 'Sign In to Join Queue' : 'Join Virtual Queue'}
                                </motion.button>
                            ) : (
                                <div className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 font-bold">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Already in Queue
                                </div>
                            )}
                            <motion.button onClick={handleDirections} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold border border-gray-200 dark:border-dark-border hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                                <Navigation className="w-4 h-4" />
                            </motion.button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ServiceDetailModal;
