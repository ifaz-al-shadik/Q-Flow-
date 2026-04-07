import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Filter, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SearchFilter = ({ searchQuery, setSearchQuery, services = [] }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const inputRef = useRef(null);
    const wrapperRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Generate suggestions
    useEffect(() => {
        if (searchQuery.trim() && services.length > 0) {
            const q = searchQuery.toLowerCase();
            const matches = services
                .filter(s => s.name.toLowerCase().includes(q) || s.type.toLowerCase().includes(q))
                .slice(0, 5);
            setSuggestions(matches);
        } else {
            setSuggestions([]);
        }
    }, [searchQuery, services]);

    const getStatusDot = (status) => {
        switch (status) {
            case 'Low': return 'bg-semantic-green';
            case 'Medium': return 'bg-semantic-yellow';
            case 'High': return 'bg-semantic-red';
            default: return 'bg-gray-400';
        }
    };

    return (
        <div className="flex flex-col gap-4" ref={wrapperRef}>
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
                    <Search className="h-5 w-5 text-gray-400 dark:text-dark-muted group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search places or services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    className="block w-full pl-14 pr-5 py-4 border-2 border-gray-100 dark:border-dark-border rounded-2xl bg-gray-50/80 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-semibold placeholder-gray-400 dark:placeholder-slate-500 text-gray-900 dark:text-gray-100 shadow-sm"
                />

                {/* Autocomplete Dropdown */}
                <AnimatePresence>
                    {isFocused && suggestions.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-xl dark:shadow-black/30 overflow-hidden z-30"
                        >
                            {suggestions.map((s, i) => (
                                <button
                                    key={s.id || i}
                                    onClick={() => {
                                        setSearchQuery(s.name);
                                        setIsFocused(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-left border-b border-gray-50 dark:border-dark-border last:border-0"
                                >
                                    <div className={`w-2 h-2 rounded-full shrink-0 ${getStatusDot(s.status)}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{s.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-dark-muted font-medium">{s.type}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs font-bold text-gray-500 dark:text-gray-400 shrink-0">
                                        <Clock className="w-3 h-3" />
                                        {s.waitTime}m
                                    </div>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex gap-3">
                <div className="flex-1 relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MapPin className="h-4 w-4 text-gray-400 dark:text-dark-muted group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Current Location"
                        className="block w-full pl-11 pr-3 py-3.5 border-2 border-gray-100 dark:border-dark-border rounded-2xl bg-gray-50/80 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-semibold text-sm placeholder-gray-400 dark:placeholder-slate-500 text-gray-900 dark:text-gray-100 shadow-sm"
                    />
                </div>
                <button className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gray-50/80 dark:bg-slate-800/80 border-2 border-gray-100 dark:border-dark-border text-gray-600 dark:text-gray-400 font-bold text-sm hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-gray-100 transition-all shadow-sm">
                    <Filter className="w-4 h-4" />
                    More
                </button>
            </div>
        </div>
    );
};

export default SearchFilter;
