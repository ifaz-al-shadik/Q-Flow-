import { useState, useEffect } from 'react';
import { UserCheck, Clock, MapPin, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';

const ReporterCheckIn = () => {
    const [status, setStatus] = useState('idle');
    const [crowdLevel, setCrowdLevel] = useState('Medium');
    const [places, setPlaces] = useState([]);
    const [selectedPlaceId, setSelectedPlaceId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();
    const { addReport } = useAuth();

    useEffect(() => {
        const fetchPlaces = async () => {
            try {
                const res = await fetch('/api/places');
                const data = await res.json();
                setPlaces(data);
                if (data.length > 0) setSelectedPlaceId(data[0]._id);
            } catch (err) {
                console.error("Failed to load locations", err);
            }
        };
        fetchPlaces();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPlaceId) return;

        setIsSubmitting(true);
        const estimatedTime = crowdLevel === 'Low' ? 10 : crowdLevel === 'Medium' ? 30 : 60;
        const selectedPlace = places.find(p => p._id === selectedPlaceId);

        try {
            const res = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    placeId: selectedPlaceId,
                    reportedWaitTime: estimatedTime,
                    reportedCrowdStatus: crowdLevel
                })
            });

            if (!res.ok) throw new Error('Submission failed');
            setStatus('success');
            toast.success(`Report submitted for ${selectedPlace?.name || 'location'}! Thank you.`);
            // Track in history
            addReport({ placeId: selectedPlaceId, placeName: selectedPlace?.name, crowdLevel, waitTime: estimatedTime });
            // Fire confetti 🎉
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#6366f1', '#8b5cf6', '#a855f7', '#10b981', '#f59e0b'] });
            setTimeout(() => confetti({ particleCount: 60, spread: 100, origin: { y: 0.5, x: 0.3 } }), 200);
            setTimeout(() => confetti({ particleCount: 60, spread: 100, origin: { y: 0.5, x: 0.7 } }), 400);
        } catch (err) {
            console.error(err);
            setStatus('error');
            toast.error('Failed to submit report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <motion.div
                layout
                className="bg-white dark:bg-dark-card rounded-[2rem] shadow-sm border border-gray-100 dark:border-dark-border p-8 sm:p-10 relative overflow-hidden transition-colors duration-300"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 dark:bg-primary-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                <motion.div layout className="flex items-center gap-5 mb-10 relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-500/20 dark:to-primary-500/10 rounded-2xl flex items-center justify-center text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-500/20 shadow-sm">
                        <UserCheck className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-1">Reporter Check-In</h1>
                        <p className="text-gray-500 dark:text-dark-muted font-medium">Contribute live queue data to help others.</p>
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {status === 'success' ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            className="py-12 flex flex-col items-center text-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', delay: 0.2, damping: 12 }}
                                className="w-24 h-24 bg-semantic-green/10 rounded-full flex items-center justify-center text-semantic-green mb-6 shadow-inner ring-8 ring-semantic-green/5"
                            >
                                <CheckCircle2 className="w-12 h-12" />
                            </motion.div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3 tracking-tight">Report Submitted!</h2>
                            <p className="text-gray-500 dark:text-dark-muted mb-10 max-w-sm font-medium leading-relaxed">Thank you for reporting. Your data helps keep wait times accurate and the community moving efficiently.</p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setStatus('idle')}
                                className="bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold px-8 py-3.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-gray-100 transition-colors border border-gray-200 dark:border-dark-border"
                            >
                                Submit Another Report
                            </motion.button>
                        </motion.div>
                    ) : (
                        <motion.form
                            key="form"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            onSubmit={handleSubmit}
                            className="space-y-8 relative z-10"
                        >
                            {/* Location Select */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Service Location</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <MapPin className="h-5 w-5 text-gray-400 dark:text-dark-muted group-focus-within:text-primary-500 transition-colors" />
                                    </div>
                                    <select
                                        value={selectedPlaceId}
                                        onChange={(e) => setSelectedPlaceId(e.target.value)}
                                        className="block w-full pl-12 pr-10 py-4 border border-gray-200 dark:border-dark-border rounded-2xl bg-gray-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-semibold text-gray-900 dark:text-gray-100 appearance-none cursor-pointer"
                                    >
                                        {places.map(place => (
                                            <option key={place._id} value={place._id}>{place.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400 dark:text-dark-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Crowd Level Selector */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Observed Crowd Level</label>
                                    <span className="text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                                        </span>
                                        Live Update
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    {['Low', 'Medium', 'High'].map((level) => {
                                        const isActive = crowdLevel === level;
                                        let colorClass = 'border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400 bg-white dark:bg-slate-800/50 shadow-sm';

                                        if (isActive) {
                                            if (level === 'Low') colorClass = 'bg-semantic-green/10 border-semantic-green/50 text-semantic-green ring-2 ring-semantic-green/20';
                                            if (level === 'Medium') colorClass = 'bg-semantic-yellow/10 border-semantic-yellow/50 text-semantic-yellow ring-2 ring-semantic-yellow/20';
                                            if (level === 'High') colorClass = 'bg-semantic-red/10 border-semantic-red/50 text-semantic-red ring-2 ring-semantic-red/20';
                                        }

                                        return (
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                key={level}
                                                type="button"
                                                onClick={() => setCrowdLevel(level)}
                                                className={`flex flex-col items-center justify-center py-5 border-2 rounded-2xl font-bold transition-all ${colorClass} active:scale-95 duration-200`}
                                            >
                                                <span className="text-lg">{level}</span>
                                                <span className="text-xs font-medium opacity-80 mt-1">Crowd</span>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Wait Time Estimate */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Estimated Wait Time (Mins)</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Clock className="h-5 w-5 text-gray-400 dark:text-dark-muted group-focus-within:text-primary-500 transition-colors" />
                                    </div>
                                    <input
                                        type="number"
                                        placeholder="e.g. 15"
                                        value={crowdLevel === 'Low' ? 10 : crowdLevel === 'Medium' ? 30 : 60}
                                        readOnly
                                        className="block w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-dark-border rounded-2xl bg-gray-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-semibold text-gray-900 dark:text-gray-100 text-lg"
                                    />
                                </div>
                            </div>

                            <div className="pt-6 flex gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="button"
                                    className="w-1/3 py-4 rounded-2xl text-gray-600 dark:text-gray-400 font-bold bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-2/3 py-4 rounded-2xl text-white font-extrabold text-lg bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-xl shadow-primary-500/30 dark:shadow-primary-500/20 transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Check-In'}
                                </motion.button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 bg-semantic-yellow/10 border border-semantic-yellow/20 rounded-2xl p-5 flex gap-4 max-w-xl mx-auto"
            >
                <AlertTriangle className="w-6 h-6 text-semantic-yellow shrink-0 mt-0.5" />
                <p className="text-sm text-semantic-yellow/90 font-medium leading-relaxed">
                    Accurate reporting helps us verify wait times automatically. Users who provide consistently verified reports may earn <strong className="font-bold">Verified Reporter</strong> badges.
                </p>
            </motion.div>
        </div>
    );
};

export default ReporterCheckIn;
