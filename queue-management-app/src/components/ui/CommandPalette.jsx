import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, MapPin, Clock, BarChart3, FileEdit, Compass, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CommandPalette = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [services, setServices] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    // Fetch services for search
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await fetch('/api/places');
                const data = await res.json();
                setServices(data.map(p => ({
                    id: p._id,
                    name: p.name,
                    type: p.type,
                    waitTime: p.currentWaitTime,
                    status: p.crowdStatus
                })));
            } catch { }
        };
        if (isOpen) fetchServices();
    }, [isOpen]);

    // Keyboard shortcut: Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    const navigationItems = [
        { id: 'nav-home', name: 'Find Services', description: 'Browse nearby queues', icon: Compass, action: () => { navigate('/'); setIsOpen(false); } },
        { id: 'nav-report', name: 'Reporter Access', description: 'Submit a queue report', icon: FileEdit, action: () => { navigate('/report'); setIsOpen(false); } },
        { id: 'nav-analytics', name: 'Analytics Insights', description: 'View crowd analytics', icon: BarChart3, action: () => { navigate('/analytics'); setIsOpen(false); } },
    ];

    const getStatusDot = (status) => {
        switch (status) {
            case 'Low': return 'bg-semantic-green';
            case 'Medium': return 'bg-semantic-yellow';
            case 'High': return 'bg-semantic-red';
            default: return 'bg-gray-400';
        }
    };

    const filteredServices = query.trim()
        ? services.filter(s =>
            s.name.toLowerCase().includes(query.toLowerCase()) ||
            s.type.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5)
        : [];

    const filteredNav = query.trim()
        ? navigationItems.filter(n => n.name.toLowerCase().includes(query.toLowerCase()))
        : navigationItems;

    const allResults = [...filteredNav, ...filteredServices.map(s => ({
        id: s.id,
        name: s.name,
        description: `${s.type} · ${s.waitTime}m wait`,
        icon: MapPin,
        status: s.status,
        action: () => setIsOpen(false)
    }))];

    // Keyboard navigation
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, allResults.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && allResults[selectedIndex]) {
            allResults[selectedIndex].action();
        }
    }, [allResults, selectedIndex]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[70]"
                        onClick={() => setIsOpen(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                        className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-lg bg-white dark:bg-dark-card rounded-2xl shadow-2xl dark:shadow-black/50 z-[70] border border-gray-200 dark:border-dark-border overflow-hidden"
                    >
                        {/* Search Input */}
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-dark-border">
                            <Search className="w-5 h-5 text-gray-400 dark:text-dark-muted shrink-0" />
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                                onKeyDown={handleKeyDown}
                                placeholder="Search services, pages..."
                                className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-500 font-medium text-sm outline-none"
                            />
                            <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-dark-border text-[10px] font-bold text-gray-400 dark:text-slate-500">
                                ESC
                            </kbd>
                        </div>

                        {/* Results */}
                        <div className="max-h-72 overflow-y-auto py-2">
                            {!query.trim() && (
                                <p className="px-5 py-1.5 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Quick Navigation</p>
                            )}
                            {query.trim() && filteredServices.length > 0 && (
                                <p className="px-5 py-1.5 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Services</p>
                            )}

                            {allResults.map((item, i) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={item.action}
                                        onMouseEnter={() => setSelectedIndex(i)}
                                        className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${i === selectedIndex
                                                ? 'bg-primary-50 dark:bg-primary-500/10'
                                                : 'hover:bg-gray-50 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${i === selectedIndex
                                                ? 'bg-primary-500 text-white'
                                                : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400'
                                            }`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className={`text-sm font-bold truncate ${i === selectedIndex ? 'text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-gray-100'
                                                    }`}>{item.name}</p>
                                                {item.status && (
                                                    <div className={`w-2 h-2 rounded-full shrink-0 ${getStatusDot(item.status)}`} />
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-dark-muted font-medium truncate">{item.description}</p>
                                        </div>
                                        {i === selectedIndex && (
                                            <ArrowRight className="w-4 h-4 text-primary-500 shrink-0" />
                                        )}
                                    </button>
                                );
                            })}

                            {query.trim() && allResults.length === 0 && (
                                <div className="px-5 py-8 text-center">
                                    <p className="text-sm font-semibold text-gray-400 dark:text-slate-500">No results for "{query}"</p>
                                </div>
                            )}
                        </div>

                        {/* Footer hint */}
                        <div className="px-5 py-3 border-t border-gray-100 dark:border-dark-border flex items-center gap-4 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-dark-border">↑↓</kbd>
                                Navigate
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-dark-border">↵</kbd>
                                Select
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-dark-border">Esc</kbd>
                                Close
                            </span>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CommandPalette;
