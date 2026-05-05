import { useState, useEffect } from 'react';
import { UserCheck, Clock, MapPin, AlertTriangle, CheckCircle2, XCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';

const REPORT_TYPES = [
    { id: 'wait_time', label: 'Wait Time Report', desc: 'Report observed crowd and wait time' },
    { id: 'closed', label: 'Location Closed', desc: 'Report that the location is currently closed' },
    { id: 'overcrowded', label: 'Overcrowded', desc: 'Report extreme crowd beyond normal levels' },
    { id: 'data_correction', label: 'Data Correction', desc: 'Correct inaccurate existing data' },
];

const ReporterCheckIn = () => {
    const [status, setStatus] = useState('idle');
    const [crowdLevel, setCrowdLevel] = useState('Medium');
    const [places, setPlaces] = useState([]);
    const [selectedPlaceId, setSelectedPlaceId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [customWait, setCustomWait] = useState('');
    const [reportType, setReportType] = useState('wait_time');
    const [note, setNote] = useState('');
    const toast = useToast();
    const { isAuthenticated, addReport, user } = useAuth();

    useEffect(() => {
        fetch('/api/places').then(r => r.json()).then(data => {
            setPlaces(data);
            if (data.length > 0) setSelectedPlaceId(data[0]._id);
        }).catch(() => { });
    }, []);

    const defaultWait = crowdLevel === 'Low' ? 10 : crowdLevel === 'Medium' ? 30 : 60;
    const estimatedTime = customWait ? parseInt(customWait) : defaultWait;
    const selectedPlace = places.find(p => p._id === selectedPlaceId);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPlaceId) return;
        if (!isAuthenticated) { toast.error('Please sign in to submit reports'); return; }

        setIsSubmitting(true);
        try {
            await addReport({
                placeId: selectedPlaceId,
                waitTime: reportType === 'closed' ? 0 : estimatedTime,
                crowdLevel: reportType === 'closed' ? 'Closed' : crowdLevel,
                reportType,
                note
            });
            setStatus('success');
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b'] });
            setTimeout(() => confetti({ particleCount: 60, spread: 100, origin: { y: 0.5, x: 0.3 } }), 200);
        } catch (err) {
            setStatus('error');
            toast.error('Failed to submit report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Auth guard
    if (!isAuthenticated) {
        return (
            <div className="max-w-2xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-dark-card rounded-[2rem] shadow-sm border border-gray-100 dark:border-dark-border p-10 text-center">
                    <div className="w-20 h-20 bg-primary-50 dark:bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <UserCheck className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">Sign In Required</h2>
                    <p className="text-gray-500 dark:text-dark-muted font-medium mb-6 max-w-sm mx-auto">
                        You must be signed in to submit crowd reports. Your contributions help thousands of people save time.
                    </p>
                    <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 px-4 py-2.5 rounded-xl text-sm font-semibold">
                        <AlertTriangle className="w-4 h-4" /> Please sign in from the top navigation bar
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-8 space-y-5">
            <motion.div layout className="bg-white dark:bg-dark-card rounded-[2rem] shadow-sm border border-gray-100 dark:border-dark-border p-8 sm:p-10 relative overflow-hidden transition-colors duration-300">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 dark:bg-primary-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                <motion.div layout className="flex items-center gap-5 mb-8 relative z-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-500/20 dark:to-primary-500/10 rounded-2xl flex items-center justify-center text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-500/20">
                        <UserCheck className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">Reporter Check-In</h1>
                        <p className="text-gray-500 dark:text-dark-muted font-medium text-sm mt-0.5">Reporting as <span className="text-primary-600 dark:text-primary-400 font-bold">{user?.name}</span> · {user?.reportsCount || 0} reports submitted</p>
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {status === 'success' ? (
                        <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                            className="py-10 flex flex-col items-center text-center relative z-10">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2, damping: 12 }}
                                className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-5 ring-8 ring-emerald-500/5">
                                <CheckCircle2 className="w-10 h-10" />
                            </motion.div>
                            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">Report Submitted!</h2>
                            <p className="text-gray-500 dark:text-dark-muted mb-8 max-w-xs font-medium text-sm">Thank you! Your data helps keep wait times accurate for everyone.</p>
                            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => { setStatus('idle'); setNote(''); setCustomWait(''); }}
                                className="bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold px-7 py-3 rounded-xl border border-gray-200 dark:border-dark-border hover:bg-gray-100 transition-colors">
                                Submit Another Report
                            </motion.button>
                        </motion.div>
                    ) : (
                        <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            {/* Report Type — FR-17 */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Report Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {REPORT_TYPES.map(rt => (
                                        <motion.button key={rt.id} type="button" whileTap={{ scale: 0.97 }} onClick={() => setReportType(rt.id)}
                                            className={`text-left p-3 rounded-2xl border-2 transition-all ${reportType === rt.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-gray-200 dark:border-dark-border bg-white dark:bg-slate-800/50 hover:border-gray-300'}`}>
                                            <p className={`text-sm font-bold ${reportType === rt.id ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'}`}>{rt.label}</p>
                                            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 leading-tight">{rt.desc}</p>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Location */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Service Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-dark-muted" />
                                    <select value={selectedPlaceId} onChange={e => setSelectedPlaceId(e.target.value)}
                                        className="block w-full pl-11 pr-10 py-3.5 border border-gray-200 dark:border-dark-border rounded-2xl bg-gray-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent font-semibold text-gray-900 dark:text-gray-100 appearance-none">
                                        {places.map(place => <option key={place._id} value={place._id}>{place.name}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Crowd Level — hidden for 'closed' type */}
                            {reportType !== 'closed' && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Observed Crowd Level</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['Low', 'Medium', 'High'].map(level => {
                                            const isActive = crowdLevel === level;
                                            let cls = 'border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400 bg-white dark:bg-slate-800/50';
                                            if (isActive) {
                                                if (level === 'Low') cls = 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-400 text-emerald-600 ring-2 ring-emerald-400/20';
                                                if (level === 'Medium') cls = 'bg-amber-50 dark:bg-amber-500/10 border-amber-400 text-amber-600 ring-2 ring-amber-400/20';
                                                if (level === 'High') cls = 'bg-red-50 dark:bg-red-500/10 border-red-400 text-red-500 ring-2 ring-red-400/20';
                                            }
                                            return (
                                                <motion.button key={level} type="button" whileTap={{ scale: 0.97 }} onClick={() => setCrowdLevel(level)}
                                                    className={`flex flex-col items-center justify-center py-4 border-2 rounded-2xl font-bold transition-all ${cls}`}>
                                                    <span className="text-base">{level}</span>
                                                    <span className="text-xs font-medium opacity-70 mt-0.5">Crowd</span>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Custom Wait Time — FR-6 */}
                            {reportType !== 'closed' && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Estimated Wait (minutes)</label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input type="number" min="0" max="300" placeholder={`Default: ${defaultWait} min`} value={customWait}
                                            onChange={e => setCustomWait(e.target.value)}
                                            className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 dark:border-dark-border rounded-2xl bg-gray-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent font-semibold text-gray-900 dark:text-gray-100" />
                                    </div>
                                    <p className="text-xs text-gray-400 dark:text-slate-500 pl-1">Leave blank to use crowd-level estimate ({defaultWait} min)</p>
                                </div>
                            )}

                            {/* Note */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Additional Note (optional)</label>
                                <textarea rows={2} value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Power cut, long lunch break..."
                                    className="block w-full px-4 py-3 border border-gray-200 dark:border-dark-border rounded-2xl bg-gray-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-primary-500 font-medium text-gray-900 dark:text-gray-100 resize-none text-sm" />
                            </div>

                            {status === 'error' && (
                                <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-500/10 rounded-xl px-4 py-3 text-sm font-semibold">
                                    <XCircle className="w-4 h-4 shrink-0" /> Failed to submit. Please try again.
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} type="submit" disabled={isSubmitting}
                                    className="flex-1 py-4 rounded-2xl text-white font-extrabold text-base bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-xl shadow-primary-500/30 dark:shadow-primary-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    {isSubmitting ? 'Submitting...' : 'Submit Check-In'}
                                </motion.button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Info banner */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                    Accurate reporting helps verify wait times automatically. Consistent reporters may earn <strong className="font-bold">Verified Reporter</strong> status.
                </p>
            </motion.div>
        </div>
    );
};

export default ReporterCheckIn;
