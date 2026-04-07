import { motion } from 'framer-motion';

const shimmer = {
    initial: { x: '-100%' },
    animate: {
        x: '100%',
        transition: {
            repeat: Infinity,
            duration: 1.5,
            ease: 'linear'
        }
    }
};

const SkeletonBlock = ({ className }) => (
    <div className={`relative overflow-hidden bg-gray-200 dark:bg-slate-700 rounded-lg ${className}`}>
        <motion.div
            variants={shimmer}
            initial="initial"
            animate="animate"
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent"
        />
    </div>
);

const SkeletonCard = () => (
    <div className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm">
        <div className="flex justify-between items-start mb-4">
            <div className="flex-1 pr-4">
                <SkeletonBlock className="h-5 w-3/4 mb-2" />
                <SkeletonBlock className="h-3.5 w-1/2" />
            </div>
            <SkeletonBlock className="h-7 w-16 rounded-full" />
        </div>
        <div className="flex gap-3 mt-3">
            <SkeletonBlock className="h-8 w-20 rounded-lg" />
            <SkeletonBlock className="h-8 w-24 rounded-lg" />
        </div>
        <SkeletonBlock className="h-1.5 w-full mt-5 rounded-full" />
    </div>
);

const SkeletonKPI = () => (
    <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm">
        <div className="flex justify-between items-start">
            <div>
                <SkeletonBlock className="h-3.5 w-28 mb-3" />
                <SkeletonBlock className="h-10 w-16" />
            </div>
            <SkeletonBlock className="h-12 w-12 rounded-xl" />
        </div>
    </div>
);

const SkeletonChart = () => (
    <div className="bg-white dark:bg-dark-card p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm">
        <SkeletonBlock className="h-6 w-48 mb-6" />
        <div className="flex items-end gap-4 h-60">
            {[60, 80, 40, 90, 55].map((h, i) => (
                <SkeletonBlock key={i} className={`flex-1 rounded-md`} style={{ height: `${h}%` }} />
            ))}
        </div>
    </div>
);

export { SkeletonCard, SkeletonKPI, SkeletonChart, SkeletonBlock };
export default SkeletonCard;
