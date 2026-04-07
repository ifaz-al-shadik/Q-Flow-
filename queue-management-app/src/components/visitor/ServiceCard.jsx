import { MapPin, Clock, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFavorites } from '../../context/FavoritesContext';

const getStatusStyles = (status) => {
    switch (status) {
        case 'Low':
            return 'bg-semantic-green/10 text-semantic-green border-semantic-green/20';
        case 'Medium':
            return 'bg-semantic-yellow/10 text-semantic-yellow border-semantic-yellow/20';
        case 'High':
            return 'bg-semantic-red/10 text-semantic-red border-semantic-red/20';
        default:
            return 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-600';
    }
};

const getProgressBarColor = (status) => {
    switch (status) {
        case 'Low': return 'bg-semantic-green';
        case 'Medium': return 'bg-semantic-yellow';
        case 'High': return 'bg-semantic-red';
        default: return 'bg-gray-400';
    }
};

const ServiceCard = ({ service, onClick }) => {
    const { isFavorite, toggleFavorite } = useFavorites();
    const fav = isFavorite(service.id);
    const percentage = Math.min((service.waitTime / 60) * 100, 100);

    const handleFavorite = (e) => {
        e.stopPropagation();
        toggleFavorite(service.id);
    };

    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={onClick}
            className="group bg-white dark:bg-dark-card p-5 rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm hover:shadow-xl hover:shadow-primary-500/10 dark:hover:shadow-primary-500/5 hover:border-primary-200 dark:hover:border-primary-700 transition-colors duration-300 cursor-pointer relative overflow-hidden"
        >
            <div className="absolute -right-12 -top-12 w-32 h-32 bg-primary-50 dark:bg-primary-500/10 rounded-full opacity-0 group-hover:opacity-100 blur-3xl transition-opacity duration-500 pointer-events-none"></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="pr-4 flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors line-clamp-1">{service.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-dark-muted font-medium mt-0.5">{service.type}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.8 }}
                        onClick={handleFavorite}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <Heart
                            className={`w-4.5 h-4.5 transition-colors ${fav
                                    ? 'fill-red-500 text-red-500'
                                    : 'text-gray-300 dark:text-slate-600 hover:text-red-400'
                                }`}
                        />
                    </motion.button>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border flex items-center gap-1.5 shadow-sm ${getStatusStyles(service.status)}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${getProgressBarColor(service.status)} animate-pulse`}></div>
                        {service.status}
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mt-2 relative z-10">
                <div className="flex items-center gap-1.5 font-semibold bg-gray-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-dark-border">
                    <MapPin className="w-4 h-4 text-gray-400 dark:text-dark-muted" />
                    {service.distance}
                </div>
                <div className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-gray-200 bg-primary-50/50 dark:bg-primary-500/10 px-3 py-1.5 rounded-lg border border-primary-50 dark:border-primary-500/20">
                    <Clock className="w-4 h-4 text-primary-500 dark:text-primary-400" />
                    {service.waitTime} min
                </div>
            </div>

            <div className="mt-5 h-1.5 w-full bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden relative z-10">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                    className={`h-full rounded-full ${getProgressBarColor(service.status)}`}
                />
            </div>
        </motion.div>
    );
};

export default ServiceCard;
