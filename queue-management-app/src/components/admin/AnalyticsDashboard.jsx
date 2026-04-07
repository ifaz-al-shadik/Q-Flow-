import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, LineChart, Line, Area, AreaChart } from 'recharts';
import { Activity, Clock, MapPin, Users, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { SkeletonKPI, SkeletonChart } from '../ui/SkeletonCard';

const COLORS = {
    Low: '#10b981',
    Medium: '#f59e0b',
    High: '#ef4444'
};

// Generate sparkline data
const generateSparkline = (base, variance, points = 8) =>
    Array.from({ length: points }, (_, i) => ({
        v: Math.max(0, base + Math.round((Math.random() - 0.5) * variance * 2)),
        i
    }));

// Generate hourly trend data
const generateHourlyTrend = () => {
    const hours = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
        const h = new Date(now - i * 3600000);
        hours.push({
            time: h.getHours().toString().padStart(2, '0') + ':00',
            avgWait: Math.round(15 + Math.random() * 30),
            reports: Math.round(2 + Math.random() * 8),
        });
    }
    return hours;
};

const MiniSparkline = ({ data, color, height = 40 }) => (
    <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
            <defs>
                <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={color} fill={`url(#spark-${color})`} strokeWidth={2} dot={false} />
        </AreaChart>
    </ResponsiveContainer>
);

const AnalyticsDashboard = () => {
    const { isDark } = useTheme();
    const [stats, setStats] = useState({
        totalPlaces: 0,
        avgWait: 0,
        crowdDistribution: [],
        topWaitTimes: []
    });
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [hourlyTrend] = useState(generateHourlyTrend);

    const fetchAnalytics = useCallback(async (isInitial = false) => {
        try {
            if (isInitial) setLoading(true);
            const res = await fetch('/api/places');
            const data = await res.json();

            if (!data || data.length === 0) {
                setLoading(false);
                return;
            }

            const totalPlaces = data.length;
            const avgWait = Math.round(data.reduce((acc, place) => acc + place.currentWaitTime, 0) / totalPlaces);

            const crowdCounts = data.reduce((acc, place) => {
                acc[place.crowdStatus] = (acc[place.crowdStatus] || 0) + 1;
                return acc;
            }, { Low: 0, Medium: 0, High: 0 });

            const crowdDistribution = Object.keys(crowdCounts).map(status => ({
                name: status,
                value: crowdCounts[status]
            })).filter(item => item.value > 0);

            const topWaitTimes = [...data]
                .sort((a, b) => b.currentWaitTime - a.currentWaitTime)
                .slice(0, 5)
                .map(place => ({
                    name: place.name.length > 12 ? place.name.substring(0, 10) + '…' : place.name,
                    fullName: place.name,
                    waitTime: place.currentWaitTime,
                    status: place.crowdStatus
                }));

            setStats({ totalPlaces, avgWait, crowdDistribution, topWaitTimes });
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Failed to load analytics", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAnalytics(true); }, [fetchAnalytics]);
    useEffect(() => {
        const interval = setInterval(() => fetchAnalytics(false), 30000);
        return () => clearInterval(interval);
    }, [fetchAnalytics]);

    const tickColor = isDark ? '#94a3b8' : '#64748b';
    const tooltipBg = isDark ? '#1e293b' : '#ffffff';
    const tooltipBorder = isDark ? '#334155' : '#e2e8f0';

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="bg-white dark:bg-dark-card rounded-[2rem] shadow-sm border border-gray-100 dark:border-dark-border p-8 sm:p-10 relative overflow-hidden mb-8">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-gray-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
                        <div className="space-y-2">
                            <div className="h-7 w-48 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                            <div className="h-4 w-64 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    {[1, 2, 3, 4].map(i => <SkeletonKPI key={i} />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <SkeletonChart />
                    <SkeletonChart />
                </div>
            </div>
        );
    }

    const kpis = [
        {
            label: 'Total Monitored',
            value: stats.totalPlaces,
            suffix: '',
            icon: MapPin,
            iconBg: 'bg-primary-50 dark:bg-primary-500/10',
            iconColor: 'text-primary-600 dark:text-primary-400',
            sparkColor: '#6366f1',
            sparkData: generateSparkline(stats.totalPlaces, 2),
            trend: '+12%',
            trendUp: true
        },
        {
            label: 'Avg Wait Time',
            value: stats.avgWait,
            suffix: 'min',
            icon: Clock,
            iconBg: 'bg-semantic-yellow/10',
            iconColor: 'text-semantic-yellow',
            sparkColor: '#f59e0b',
            sparkData: generateSparkline(stats.avgWait, 10),
            trend: '-8%',
            trendUp: false
        },
        {
            label: 'Active Reports',
            value: 47,
            suffix: '',
            icon: Activity,
            iconBg: 'bg-semantic-green/10',
            iconColor: 'text-semantic-green',
            sparkColor: '#10b981',
            sparkData: generateSparkline(47, 15),
            trend: '+23%',
            trendUp: true
        },
        {
            label: 'Active Reporters',
            value: 12,
            suffix: '',
            icon: Users,
            iconBg: 'bg-violet-50 dark:bg-violet-500/10',
            iconColor: 'text-violet-600 dark:text-violet-400',
            sparkColor: '#8b5cf6',
            sparkData: generateSparkline(12, 4),
            trend: '+5%',
            trendUp: true
        },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-dark-card rounded-[2rem] shadow-sm border border-gray-100 dark:border-dark-border p-8 sm:p-10 relative overflow-hidden mb-8 transition-colors duration-300"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 dark:bg-primary-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-500/20 dark:to-primary-500/10 rounded-2xl flex items-center justify-center text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-500/20 shadow-sm">
                            <TrendingUp className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-1">Crowd Analytics</h1>
                            <p className="text-gray-500 dark:text-dark-muted font-medium">Real-time macro insights of all monitored services.</p>
                        </div>
                    </div>
                    {lastUpdated && (
                        <div className="hidden sm:flex items-center gap-2 bg-gray-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-gray-100 dark:border-dark-border">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-semantic-green opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-semantic-green"></span>
                            </span>
                            <span className="text-xs font-semibold text-gray-500 dark:text-dark-muted">
                                Auto-refreshing
                            </span>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* KPI Cards with Sparklines */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {kpis.map((kpi, i) => {
                    const Icon = kpi.icon;
                    return (
                        <motion.div
                            key={kpi.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.08 }}
                            className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="text-gray-500 dark:text-dark-muted font-bold text-xs uppercase tracking-wider mb-1.5">{kpi.label}</p>
                                    <h3 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                                        {kpi.value}
                                        {kpi.suffix && <span className="text-lg text-gray-400 dark:text-dark-muted font-semibold ml-1">{kpi.suffix}</span>}
                                    </h3>
                                </div>
                                <div className={`w-10 h-10 ${kpi.iconBg} ${kpi.iconColor} rounded-xl flex items-center justify-center shrink-0`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="h-10 mb-2">
                                <MiniSparkline data={kpi.sparkData} color={kpi.sparkColor} />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold ${kpi.trendUp ? 'text-semantic-green' : 'text-semantic-red'}`}>
                                {kpi.trendUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                {kpi.trend} vs last week
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
                {/* Bar Chart */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-dark-card p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm transition-colors duration-300">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 tracking-tight">Highest Traffic Locations</h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.topWaitTimes} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600, fill: tickColor }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: isDark ? '#1e293b' : '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: `1px solid ${tooltipBorder}`, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: tooltipBg, color: isDark ? '#e2e8f0' : '#111827' }}
                                    formatter={(value, name, props) => [`${value} mins`, props.payload.fullName]}
                                />
                                <Bar dataKey="waitTime" radius={[6, 6, 6, 6]}>
                                    {stats.topWaitTimes.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[entry.status]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Pie Chart */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
                    className="bg-white dark:bg-dark-card p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm flex flex-col transition-colors duration-300">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 tracking-tight">Global Crowd Distribution</h3>
                    <p className="text-sm text-gray-500 dark:text-dark-muted font-medium mb-4">Proportion of services categorized by crowd levels.</p>
                    <div className="flex-1 min-h-[250px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={stats.crowdDistribution} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                                    {stats.crowdDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: `1px solid ${tooltipBorder}`, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontWeight: 'bold', backgroundColor: tooltipBg, color: isDark ? '#e2e8f0' : '#111827' }}
                                    itemStyle={{ color: isDark ? '#e2e8f0' : '#111827' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ color: isDark ? '#94a3b8' : undefined }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                            <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">{stats.totalPlaces}</span>
                            <span className="text-xs font-bold text-gray-400 dark:text-dark-muted uppercase tracking-wider">Services</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Hourly Trend Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="bg-white dark:bg-dark-card p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm transition-colors duration-300 mt-2">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Wait Time Trend</h3>
                        <p className="text-sm text-gray-500 dark:text-dark-muted font-medium mt-1">Avg wait time over the last 12 hours</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold">
                        <span className="flex items-center gap-1.5 text-primary-600 dark:text-primary-400">
                            <span className="w-3 h-0.5 rounded bg-primary-600 dark:bg-primary-400"></span>
                            Wait Time
                        </span>
                        <span className="flex items-center gap-1.5 text-semantic-green">
                            <span className="w-3 h-0.5 rounded bg-semantic-green"></span>
                            Reports
                        </span>
                    </div>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={hourlyTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="waitGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="reportGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="time" tick={{ fontSize: 11, fontWeight: 600, fill: tickColor }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: `1px solid ${tooltipBorder}`, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: tooltipBg, color: isDark ? '#e2e8f0' : '#111827' }}
                            />
                            <Area type="monotone" dataKey="avgWait" stroke="#6366f1" fill="url(#waitGrad)" strokeWidth={2.5} dot={false} name="Avg Wait (min)" />
                            <Area type="monotone" dataKey="reports" stroke="#10b981" fill="url(#reportGrad)" strokeWidth={2} dot={false} name="Reports" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>
    );
};

export default AnalyticsDashboard;
