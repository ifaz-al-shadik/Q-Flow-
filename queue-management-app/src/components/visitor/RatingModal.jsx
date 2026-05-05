import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, CheckCircle2, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

// Siam's contribution — Post-Queue Rating Modal
// Allows visitors to rate their experience (1-5 stars) after completing a queue visit

const LABELS = ['', 'Very Bad', 'Bad', 'Okay', 'Good', 'Excellent!'];
const COLORS = ['', 'text-red-500', 'text-orange-500', 'text-yellow-500', 'text-lime-500', 'text-emerald-500'];

export default function RatingModal({ isOpen, onClose, placeId, placeName, queueId }) {
    const { user } = useAuth();
    const toast = useToast();
    const [stars, setStars] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const handleSubmit = async () => {
        if (!stars) { toast.error('Please select a star rating'); return; }
        if (!user) { toast.error('Please sign in to rate'); return; }
        setLoading(true);
        try {
            const token = localStorage.getItem('qflow-token');
            const res = await fetch('/api/ratings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ placeId, queueId, stars, comment })
            });
            const data = await res.json();
            if (res.ok) {
                setDone(true);
                setTimeout(() => { setDone(false); setStars(0); setComment(''); onClose(); }, 2000);
            } else {
                toast.error(data.message || 'Failed to submit rating');
            }
        } catch {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const active = hovered || stars;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-sm bg-white dark:bg-dark-card rounded-3xl shadow-2xl z-50 overflow-hidden"
                    >
                        {done ? (
                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-14 px-8 text-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                                    <CheckCircle2 className="w-9 h-9 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-xl font-extrabold text-gray-900 dark:text-gray-100">Thank you!</p>
                                    <p className="text-gray-500 dark:text-dark-muted text-sm font-medium mt-1">Your feedback helps others save time.</p>
                                </div>
                            </motion.div>
                        ) : (
                            <>
                                {/* Header */}
                                <div className="relative bg-gradient-to-br from-amber-500 to-orange-500 px-6 pt-7 pb-6">
                                    <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                    <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-1">Rate Your Visit</p>
                                    <h2 className="text-white font-extrabold text-lg leading-snug">{placeName}</h2>
                                </div>

                                <div className="p-6 space-y-5">
                                    {/* Stars */}
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map(n => (
                                                <motion.button key={n}
                                                    whileHover={{ scale: 1.25 }} whileTap={{ scale: 0.9 }}
                                                    onMouseEnter={() => setHovered(n)}
                                                    onMouseLeave={() => setHovered(0)}
                                                    onClick={() => setStars(n)}
                                                >
                                                    <Star className={`w-9 h-9 transition-all duration-150 ${n <= active ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-slate-700'}`} />
                                                </motion.button>
                                            ))}
                                        </div>
                                        <AnimatePresence mode="wait">
                                            {active > 0 && (
                                                <motion.p key={active} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                                    className={`text-sm font-extrabold ${COLORS[active]}`}>
                                                    {LABELS[active]}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Comment */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                                            Leave a comment (optional)
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={comment}
                                            onChange={e => setComment(e.target.value)}
                                            placeholder="What could be improved? What went well?"
                                            className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 text-sm font-medium focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none placeholder-gray-400 dark:placeholder-slate-500"
                                        />
                                    </div>

                                    {/* Submit */}
                                    <motion.button
                                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                                        onClick={handleSubmit}
                                        disabled={loading || !stars}
                                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <><Send className="w-4 h-4" /> Submit Rating</>
                                        )}
                                    </motion.button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}