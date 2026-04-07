import { motion } from 'framer-motion';
import { MapPin, Clock, Users, Zap } from 'lucide-react';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';

const StatItem = ({ icon: Icon, value, label, suffix = '', color, delay }) => {
    const { count, ref } = useAnimatedCounter(value);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, type: 'spring', stiffness: 200, damping: 20 }}
            className="flex items-center gap-4 bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-2xl px-5 py-4 border border-white/40 dark:border-white/10 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
        >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} shadow-sm`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
                <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight leading-none">
                    {count}{suffix}
                </p>
                <p className="text-xs font-semibold text-gray-500 dark:text-dark-muted uppercase tracking-wider mt-0.5">{label}</p>
            </div>
        </motion.div>
    );
};

const HeroStats = ({ totalPlaces, avgWait }) => (
    <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-3xl overflow-hidden mb-6"
    >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 dark:from-primary-800 dark:via-indigo-900 dark:to-slate-900" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00djJoLTJ2LTJoMnptLTQgMHYyaC0ydi0yaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />

        <div className="relative px-6 sm:px-8 py-7">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div>
                    <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-300" />
                        Live Network Overview
                    </h2>
                    <p className="text-sm text-white/60 font-medium mt-0.5">Real-time crowd intelligence across Bangladesh</p>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-1.5 rounded-full self-start">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                    </span>
                    <span className="text-xs font-bold text-white/80">Streaming Live</span>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatItem icon={MapPin} value={totalPlaces} label="Locations" color="bg-primary-500" delay={0.1} />
                <StatItem icon={Clock} value={avgWait} suffix="m" label="Avg Wait" color="bg-amber-500" delay={0.2} />
                <StatItem icon={Users} value={142} label="Active Users" color="bg-emerald-500" delay={0.3} />
                <StatItem icon={Zap} value={98} suffix="%" label="Uptime" color="bg-violet-500" delay={0.4} />
            </div>
        </div>
    </motion.div>
);

export default HeroStats;
