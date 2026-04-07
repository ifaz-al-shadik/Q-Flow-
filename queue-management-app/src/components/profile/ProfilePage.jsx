import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Heart, Clock, FileText, LogOut, MapPin, Calendar, Award, ChevronRight, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';

const ProfilePage = () => {
    const { user, signOut, reportHistory, queuePositions, leaveQueue } = useAuth();
    const { favorites, toggleFavorite } = useFavorites();
    const [services, setServices] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetch('/api/places').then(r => r.json()).then(setServices).catch(() => { });
    }, []);

    const favoriteServices = services.filter(s => favorites.includes(s._id));

    const formatDate = (iso) => {
        const d = new Date(iso);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (iso) => {
        const d = new Date(iso);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: User },
        { id: 'favorites', label: 'Favorites', icon: Heart, count: favorites.length },
        { id: 'history', label: 'Reports', icon: FileText, count: reportHistory.length },
        { id: 'queues', label: 'My Queues', icon: Clock, count: queuePositions.length },
    ];

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-10 h-10 text-gray-400 dark:text-slate-500" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">Not Signed In</h2>
                    <p className="text-gray-500 dark:text-dark-muted font-medium">Sign in to view your profile, favorites, and queue history.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm overflow-hidden"
            >
                <div className="relative h-28 bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-800 dark:to-indigo-800">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00djJoLTJ2LTJoMnptLTQgMHYyaC0ydi0yaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
                </div>
                <div className="px-8 pb-6 -mt-10 relative z-10">
                    <div className="flex items-end gap-5">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-extrabold border-4 border-white dark:border-dark-card shadow-lg">
                            {user.avatar}
                        </div>
                        <div className="flex-1 pb-1">
                            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">{user.name}</h1>
                            <p className="text-gray-500 dark:text-dark-muted font-medium text-sm">{user.email}</p>
                        </div>
                        <button
                            onClick={signOut}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 font-bold text-sm transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                    <div className="flex gap-6 mt-5">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-dark-muted font-medium">
                            <Calendar className="w-4 h-4" />
                            Joined {formatDate(user.joinedAt)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-dark-muted font-medium">
                            <Award className="w-4 h-4" />
                            {user.reportsCount || 0} Reports Submitted
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-2xl p-1.5">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id
                                    ? 'bg-white dark:bg-dark-card text-primary-600 dark:text-primary-400 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${activeTab === tab.id
                                        ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                                        : 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400'
                                    }`}>{tab.count}</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { label: 'Saved Favorites', value: favorites.length, icon: Heart, color: 'text-red-500 bg-red-50 dark:bg-red-500/10' },
                            { label: 'Reports Submitted', value: reportHistory.length, icon: FileText, color: 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10' },
                            { label: 'Active Queues', value: queuePositions.length, icon: Clock, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-100 dark:border-dark-border"
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <p className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">{stat.value}</p>
                                <p className="text-sm font-bold text-gray-500 dark:text-dark-muted mt-1">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                )}

                {activeTab === 'favorites' && (
                    <div className="space-y-3">
                        {favoriteServices.length === 0 ? (
                            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-12 text-center">
                                <Heart className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                                <p className="font-bold text-gray-500 dark:text-dark-muted">No favorites yet</p>
                                <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">Click the heart icon on any service to save it</p>
                            </div>
                        ) : favoriteServices.map(s => (
                            <div key={s._id} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 dark:text-gray-100 truncate">{s.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-dark-muted">{s.type} · {s.currentWaitTime}min wait</p>
                                </div>
                                <button onClick={() => toggleFavorite(s._id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                                    <Heart className="w-4 h-4 fill-red-500" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="space-y-3">
                        {reportHistory.length === 0 ? (
                            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-12 text-center">
                                <FileText className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                                <p className="font-bold text-gray-500 dark:text-dark-muted">No reports yet</p>
                                <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">Submit a report from the Reporter Access page</p>
                            </div>
                        ) : reportHistory.map(r => (
                            <div key={r.id} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5 flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${r.crowdLevel === 'Low' ? 'bg-semantic-green/10 text-semantic-green'
                                        : r.crowdLevel === 'Medium' ? 'bg-semantic-yellow/10 text-semantic-yellow'
                                            : 'bg-semantic-red/10 text-semantic-red'
                                    }`}>
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 dark:text-gray-100 truncate">{r.placeName || 'Unknown'}</p>
                                    <p className="text-sm text-gray-500 dark:text-dark-muted">
                                        {r.crowdLevel} crowd · {r.waitTime}min · {formatDate(r.timestamp)} at {formatTime(r.timestamp)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'queues' && (
                    <div className="space-y-3">
                        {queuePositions.length === 0 ? (
                            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-12 text-center">
                                <Clock className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                                <p className="font-bold text-gray-500 dark:text-dark-muted">No active queues</p>
                                <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">Click "Join Virtual Queue" on any service to get in line</p>
                            </div>
                        ) : queuePositions.map(q => (
                            <motion.div
                                key={q.id}
                                layout
                                className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5"
                            >
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center">
                                        <span className="text-xl font-extrabold text-primary-600 dark:text-primary-400">#{q.position}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 dark:text-gray-100 truncate">{q.serviceName}</p>
                                        <p className="text-sm text-gray-500 dark:text-dark-muted">{q.serviceType} · Est. {q.estimatedWait}min</p>
                                    </div>
                                    <button onClick={() => leaveQueue(q.serviceId)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.max(10, 100 - q.position * 10)}%` }}
                                        transition={{ duration: 1.5, ease: 'easeOut' }}
                                        className="h-full rounded-full bg-gradient-to-r from-primary-500 to-indigo-500"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 dark:text-slate-500 font-semibold mt-2">Joined at {formatTime(q.joinedAt)}</p>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ProfilePage;
