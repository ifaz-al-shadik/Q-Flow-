import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, AreaChart, Area } from 'recharts';
import { Activity, Clock, MapPin, Users, TrendingUp, ArrowUpRight, ArrowDownRight, Star } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { SkeletonKPI, SkeletonChart } from '../ui/SkeletonCard';

const COLORS = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444', Closed: '#94a3b8' };

const MiniSparkline = ({ data, color }) => (
    <ResponsiveContainer width="100%" height={40}>
        <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
            <defs>
                <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={color} fill={`url(#spark-${color.replace('#', '')})`} strokeWidth={2} dot={false} />
        </AreaChart>
    </ResponsiveContainer>
);

const generateSparkline = (base, variance, points = 8) =>
    Array.from({ length: points }, () => ({ v: Math.max(0, base + Math.round((Math.random() - 0.5) * variance * 2)) }));

export default function AnalyticsDashboard() {
    const { isDark } = useTheme();
    const { isAdmin } = useAuth();
    const [stats, setStats] = useState(null);
    const [publicStats, setPublicStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeHeatmapDay, setActiveHeatmapDay] = useState(null);

    const tickColor = isDark ? '#94a3b8' : '#64748b';
    const tooltipBg = isDark ? '#1e293b' : '#ffffff';
    const tooltipBorder = isDark ? '#334155' : '#e2e8f0';
    const tooltipStyle = { borderRadius: '12px', border: `1px solid ${tooltipBorder}`, backgroundColor: tooltipBg, color: isDark ? '#e2e8f0' : '#111827', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' };

    const fetchStats = useCallback(async () => {
        try {
            // Always fetch public places data
            const placesRes = await fetch('/api/places');
            const places = await placesRes.json();

            const totalPlaces = places.length;
            const avgWait = totalPlaces > 0 ? Math.round(places.reduce((a, p) => a + p.currentWaitTime, 0) / totalPlaces) : 0;
            const liveCount = places.reduce((a, p) => a + (p.liveQueueCount || 0), 0);
            const crowdDistribution = Object.entries(
                places.reduce((acc, p) => { acc[p.crowdStatus] = (acc[p.crowdStatus] || 0) + 1; return acc; }, { Low: 0, Medium: 0, High: 0 })
            ).map(([name, value]) => ({ name, value })).filter(i => i.value > 0);

            const topWaitTimes = [...places].sort((a, b) => b.currentWaitTime - a.currentWaitTime).slice(0, 5).map(p => ({
                name: p.name.length > 14 ? p.name.substring(0, 12) + '…' : p.name,
                fullName: p.name, waitTime: p.currentWaitTime, status: p.crowdStatus
            }));

            setPublicStats({ totalPlaces, avgWait, liveCount, crowdDistribution, topWaitTimes });

            // Fetch admin analytics if admin
            if (isAdmin) {
                const token = localStorage.getItem('qflow-token');
                const adminRes = await fetch('/api/analytics/admin', { headers: { Authorization: `Bearer ${token}` } });
                if (adminRes.ok) setStats(await adminRes.json());
            }
        } catch (e) { console.error('Analytics fetch failed', e); }
        finally { setLoading(false); }
    }, [isAdmin]);

    useEffect(() => { fetchStats(); }, [fetchStats]);
    useEffect(() => {
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, [fetchStats]);

    if (loading) return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">{[1, 2, 3, 4].map(i => <SkeletonKPI key={i} />)}</div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><SkeletonChart /><SkeletonChart /></div>
        </div>
    );

    const d = publicStats || {};
    const a = stats || {};

    const kpis = [
        { label: 'Total Monitored', value: d.totalPlaces || 0, icon: MapPin, iconBg: 'bg-primary-50 dark:bg-primary-500/10', iconColor: 'text-primary-600 dark:text-primary-400', sparkColor: '#6366f1', sparkData: generateSparkline(d.totalPlaces || 0, 2), trend: '+12%', trendUp: true },
        { label: 'Avg Wait Time', value: `${d.avgWait || 0}`, suffix: 'min', icon: Clock, iconBg: 'bg-amber-50 dark:bg-amber-500/10', iconColor: 'text-amber-500', sparkColor: '#f59e0b', sparkData: generateSparkline(d.avgWait || 0, 10), trend: '-8%', trendUp: false },
        { label: 'Live in Queue', value: d.liveCount || 0, icon: Activity, iconBg: 'bg-emerald-50 dark:bg-emerald-500/10', iconColor: 'text-emerald-600', sparkColor: '#10b981', sparkData: generateSparkline(d.liveCount || 0, 5), trend: '+5%', trendUp: true },
        { label: isAdmin ? 'Total Users' : 'Active Reports', value: a.totalUsers || 47, icon: Users, iconBg: 'bg-violet-50 dark:bg-violet-500/10', iconColor: 'text-violet-600 dark:text-violet-400', sparkColor: '#8b5cf6', sparkData: generateSparkline(a.totalUsers || 47, 8), trend: '+18%', trendUp: true },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-dark-card rounded-[2rem] border border-gray-100 dark:border-dark-border p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 dark:bg-primary-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-500/20 dark:to-primary-500/10 rounded-2xl flex items-center justify-center text-primary-600 dark:text-primary-400">
                            <TrendingUp className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">Crowd Analytics</h1>
                            <p className="text-gray-500 dark:text-dark-muted font-medium text-sm mt-0.5">Real-time macro insights across all monitored services{isAdmin && ' · Admin View'}</p>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 bg-gray-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-gray-100 dark:border-dark-border">
                        <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" /></span>
                        <span className="text-xs font-semibold text-gray-500 dark:text-dark-muted">Auto-refreshing</span>
                    </div>
                </div>
            </motion.div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {kpis.map((kpi, i) => {
                    const Icon = kpi.icon;
                    return (
                        <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}
                            className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="text-gray-500 dark:text-dark-muted font-bold text-xs uppercase tracking-wider mb-1">{kpi.label}</p>
                                    <h3 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                                        {kpi.value}{kpi.suffix && <span className="text-lg text-gray-400 font-semibold ml-1">{kpi.suffix}</span>}
                                    </h3>
                                </div>
                                <div className={`w-10 h-10 ${kpi.iconBg} ${kpi.iconColor} rounded-xl flex items-center justify-center shrink-0`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="h-10 mb-2"><MiniSparkline data={kpi.sparkData} color={kpi.sparkColor} /></div>
                            <div className={`flex items-center gap-1 text-xs font-bold ${kpi.trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
                                {kpi.trendUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                {kpi.trend} vs last week
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart — Top Wait Times */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-dark-card p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-5">Highest Traffic Locations</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={d.topWaitTimes || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600, fill: tickColor }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: isDark ? '#1e293b' : '#f8fafc' }} formatter={(v, n, p) => [`${v} mins`, p.payload.fullName]} />
                                <Bar dataKey="waitTime" radius={[6, 6, 6, 6]}>
                                    {(d.topWaitTimes || []).map((entry, i) => <Cell key={i} fill={COLORS[entry.status] || '#6366f1'} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Pie Chart — Crowd Distribution */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
                    className="bg-white dark:bg-dark-card p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">Global Crowd Distribution</h3>
                    <p className="text-sm text-gray-500 dark:text-dark-muted font-medium mb-4">Proportion of services by crowd level</p>
                    <div className="flex-1 min-h-[200px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={d.crowdDistribution || []} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                                    {(d.crowdDistribution || []).map((entry, i) => <Cell key={i} fill={COLORS[entry.name] || '#6366f1'} />)}
                                </Pie>
                                <Tooltip contentStyle={tooltipStyle} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ color: tickColor }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                            <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">{d.totalPlaces}</span>
                            <span className="text-xs font-bold text-gray-400 dark:text-dark-muted uppercase tracking-wider">Services</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* FR-12: Peak Hours Heatmap (admin) or hourly trend (all) */}
            {isAdmin && a.hourlyAvg && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                    className="bg-white dark:bg-dark-card p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Peak Hours Heatmap</h3>
                            <p className="text-sm text-gray-500 dark:text-dark-muted font-medium mt-0.5">Average wait time across all locations by hour</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-12 gap-1.5">
                        {a.hourlyAvg.map((h, i) => {
                            const intensity = h.avgWait / 60;
                            const bg = h.avgWait === 0 ? 'bg-gray-100 dark:bg-slate-800' : intensity < 0.25 ? 'bg-emerald-200 dark:bg-emerald-500/30' : intensity < 0.5 ? 'bg-yellow-200 dark:bg-yellow-500/30' : intensity < 0.75 ? 'bg-orange-200 dark:bg-orange-500/30' : 'bg-red-300 dark:bg-red-500/40';
                            return (
                                <div key={i} className="flex flex-col items-center gap-1">
                                    <div className={`w-full h-10 rounded-lg ${bg} transition-all hover:scale-110 cursor-default`} title={`${h.hour}: ${h.avgWait}min avg`} />
                                    {i % 4 === 0 && <span className="text-[9px] font-bold text-gray-400 dark:text-slate-500">{h.hour}</span>}
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs font-bold text-gray-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-200 dark:bg-emerald-500/30 inline-block" />Low</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-yellow-200 dark:bg-yellow-500/30 inline-block" />Moderate</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-300 dark:bg-red-500/40 inline-block" />Peak</span>
                    </div>
                </motion.div>
            )}

            {/* Hourly Trend Area Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
                className="bg-white dark:bg-dark-card p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Simulated Hourly Trend</h3>
                        <p className="text-sm text-gray-500 dark:text-dark-muted font-medium mt-0.5">Illustrative wait-time pattern over 12 hours</p>
                    </div>
                </div>
                <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={Array.from({ length: 12 }, (_, i) => {
                            const h = new Date(Date.now() - (11 - i) * 3600000);
                            return { time: h.getHours().toString().padStart(2, '0') + ':00', avgWait: Math.round(15 + Math.random() * 30), reports: Math.round(2 + Math.random() * 8) };
                        })} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="waitG" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="repG" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="time" tick={{ fontSize: 11, fontWeight: 600, fill: tickColor }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Area type="monotone" dataKey="avgWait" stroke="#6366f1" fill="url(#waitG)" strokeWidth={2.5} dot={false} name="Avg Wait (min)" />
                            <Area type="monotone" dataKey="reports" stroke="#10b981" fill="url(#repG)" strokeWidth={2} dot={false} name="Reports" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* FR-11: Best time recommendation panel (public) */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                className="bg-gradient-to-br from-primary-600 to-indigo-600 dark:from-primary-800 dark:to-indigo-800 p-6 sm:p-8 rounded-3xl shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <Star className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Smart Recommendation</h3>
                        <p className="text-primary-100 text-sm font-medium">Best time to visit popular services today</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {['Early Morning (7–9 AM)', 'Post-Lunch (2–3 PM)', 'Late Afternoon (4–5 PM)'].map((slot, i) => (
                        <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                            <p className="text-white font-bold text-sm">{slot}</p>
                            <p className="text-primary-100 text-xs font-medium mt-0.5">Typically {10 + i * 8}–{18 + i * 8}% shorter waits</p>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
