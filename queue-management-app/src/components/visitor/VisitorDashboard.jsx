import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import SearchFilter from './SearchFilter';
import LiveMap from './LiveMap';
import ServiceCard from './ServiceCard';
import ServiceDetailModal from './ServiceDetailModal';
import HeroStats from './HeroStats';
import CategoryFilter from './CategoryFilter';
import { SkeletonCard } from '../ui/SkeletonCard';

const crowdOrder = { Low: 1, Medium: 2, High: 3 };

const VisitorDashboard = () => {
    const [services, setServices] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedService, setSelectedService] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [activeCategory, setActiveCategory] = useState('All');
    const [sortBy, setSortBy] = useState('default');

    const fetchServices = useCallback(async (isInitial = false) => {
        try {
            if (isInitial) setLoading(true);
            const res = await fetch('/api/places');
            const data = await res.json();

            const mappedData = data.map(place => ({
                id: place._id,
                name: place.name,
                type: place.type,
                distance: (Math.random() * 3 + 0.3).toFixed(1) + 'mi',
                waitTime: place.currentWaitTime,
                status: place.crowdStatus,
                geo: [...place.location.coordinates].reverse(),
            }));
            setServices(mappedData);
            setLastUpdated(new Date());
        } catch (err) {
            console.error("Failed to fetch places", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchServices(true); }, [fetchServices]);
    useEffect(() => {
        const interval = setInterval(() => fetchServices(false), 30000);
        return () => clearInterval(interval);
    }, [fetchServices]);

    // Derived: filter + sort
    const filteredServices = useMemo(() => {
        let result = [...services];

        // Text search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(s =>
                s.name.toLowerCase().includes(q) ||
                s.type.toLowerCase().includes(q)
            );
        }

        // Category filter
        if (activeCategory !== 'All') {
            result = result.filter(s => s.type === activeCategory);
        }

        // Sort
        switch (sortBy) {
            case 'waitAsc':
                result.sort((a, b) => a.waitTime - b.waitTime);
                break;
            case 'waitDesc':
                result.sort((a, b) => b.waitTime - a.waitTime);
                break;
            case 'crowdAsc':
                result.sort((a, b) => (crowdOrder[a.status] || 0) - (crowdOrder[b.status] || 0));
                break;
            default:
                break;
        }

        return result;
    }, [services, searchQuery, activeCategory, sortBy]);

    const avgWait = services.length > 0 ? Math.round(services.reduce((a, s) => a + s.waitTime, 0) / services.length) : 0;

    return (
        <div className="flex flex-col gap-6">
            {/* Hero Stats Banner */}
            {!loading && <HeroStats totalPlaces={services.length} avgWait={avgWait} />}

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 min-h-[calc(100vh-6rem)] relative pb-10">
                {/* Left Column*/}
                <div className="w-full lg:w-[28rem] xl:w-[32rem] shrink-0 flex flex-col gap-6">
                    <div className="bg-white dark:bg-dark-card rounded-3xl shadow-sm border border-gray-100 dark:border-dark-border p-6 lg:p-8 relative overflow-hidden transition-colors duration-300">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 dark:bg-primary-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-3 tracking-tight relative z-10">Find Services</h1>
                        <p className="text-gray-500 dark:text-dark-muted mb-6 font-medium relative z-10">Discover places near you and check live wait times instantly.</p>
                        <div className="relative z-10">
                            <SearchFilter searchQuery={searchQuery} setSearchQuery={setSearchQuery} services={services} />
                        </div>
                    </div>

                    {/* Category Filter Chips */}
                    <CategoryFilter
                        activeCategory={activeCategory}
                        setActiveCategory={setActiveCategory}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                    />

                    <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 pb-4 scrollbar-hide">
                        <div className="flex justify-between items-center mb-1 px-1">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 tracking-tight">
                                {activeCategory === 'All' ? 'Nearest Fast Services' : activeCategory}
                                <span className="text-sm font-semibold text-gray-400 dark:text-slate-500 ml-2">({filteredServices.length})</span>
                            </h2>
                            <div className="flex items-center gap-3">
                                {lastUpdated && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-semantic-green opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-semantic-green"></span>
                                        </span>
                                        <span className="text-xs text-gray-400 dark:text-slate-500 font-semibold">Live</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        {loading ? (
                            <div className="flex flex-col gap-4">
                                {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                            </div>
                        ) : filteredServices.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-400 dark:text-slate-500 font-semibold text-lg mb-1">No services found</p>
                                <p className="text-gray-400 dark:text-slate-600 text-sm">Try a different search or category</p>
                            </div>
                        ) : (
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
                                }}
                                className="flex flex-col gap-4"
                            >
                                {filteredServices.map((service) => (
                                    <motion.div
                                        key={service.id}
                                        variants={{
                                            hidden: { opacity: 0, y: 30 },
                                            visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                                        }}
                                    >
                                        <ServiceCard service={service} onClick={() => setSelectedService(service)} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Right Column: Map */}
                <div className="w-full h-[600px] lg:h-auto lg:flex-1 border border-gray-200 dark:border-dark-border rounded-[2.5rem] overflow-hidden shadow-sm relative group lg:sticky lg:top-24 max-h-[calc(100vh-8rem)] z-0 block">
                    <LiveMap services={filteredServices} onMarkerClick={(service) => setSelectedService(service)} />
                </div>

                <ServiceDetailModal
                    service={selectedService}
                    isOpen={!!selectedService}
                    onClose={() => setSelectedService(null)}
                />
            </div>
        </div>
    );
};

export default VisitorDashboard;
