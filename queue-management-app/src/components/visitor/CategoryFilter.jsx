import { motion } from 'framer-motion';
import { Building2, Stethoscope, GraduationCap, Landmark, ShoppingBag, Mail, LayoutGrid } from 'lucide-react';

const categories = [
    { key: 'All', label: 'All', icon: LayoutGrid },
    { key: 'Healthcare', label: 'Health', icon: Stethoscope },
    { key: 'Public Service', label: 'Public', icon: Building2 },
    { key: 'Education', label: 'Education', icon: GraduationCap },
    { key: 'Financial', label: 'Finance', icon: Landmark },
    { key: 'Retail', label: 'Retail', icon: ShoppingBag },
    { key: 'Postal', label: 'Postal', icon: Mail },
];

const sortOptions = [
    { key: 'default', label: 'Default' },
    { key: 'waitAsc', label: 'Wait: Low → High' },
    { key: 'waitDesc', label: 'Wait: High → Low' },
    { key: 'crowdAsc', label: 'Crowd: Low → High' },
];

const CategoryFilter = ({ activeCategory, setActiveCategory, sortBy, setSortBy }) => {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
            {/* Category Chips */}
            <div className="flex flex-wrap gap-2 flex-1">
                {categories.map(cat => {
                    const isActive = activeCategory === cat.key;
                    const Icon = cat.icon;
                    return (
                        <motion.button
                            key={cat.key}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveCategory(cat.key)}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 border ${isActive
                                    ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-500/25'
                                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-dark-border hover:border-primary-300 dark:hover:border-primary-600 hover:text-primary-600 dark:hover:text-primary-400'
                                }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {cat.label}
                        </motion.button>
                    );
                })}
            </div>

            {/* Sort Dropdown */}
            <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-bold text-gray-600 dark:text-gray-400 bg-white dark:bg-slate-800 border border-gray-200 dark:border-dark-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer appearance-none pr-8 transition-colors"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%236b7280' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
            >
                {sortOptions.map(opt => (
                    <option key={opt.key} value={opt.key}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
};

export default CategoryFilter;
