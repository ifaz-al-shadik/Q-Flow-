import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Heart, Clock, FileText, LogOut, MapPin, Calendar, Award, Trash2, Edit, CheckCircle2, LogIn, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useToast } from '../../context/ToastContext';

const ProfilePage = () => {
    const { user, signOut, reportHistory, queuePositions, leaveQueue, arriveAtQueue, completeQueue, updateProfile } = useAuth();
    const { favorites, toggleFavorite } = useFavorites();
    const toast = useToast();
    const [services, setServices] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [editingName, setEditingName] = useState(false);
    const [newName, setNewName] = useState('');
    const [savingName, setSavingName] = useState(false);

    useEffect(() => {
        fetch('/api/places').then(r => r.json()).then(setServices).catch(() => { });
    }, []);

    const favoriteServices = services.filter(s => favorites.includes(s._id));

    const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
    const formatTime = (iso) => iso ? new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—';

    const handleSaveName = async () => {
        if (!newName.trim()) return;
        setSavingName(true);
        const result = await updateProfile({ name: newName.trim() });
        if (result.success) { toast.success('Name updated!'); setEditingName(false); }
        else toast.error(result.error || 'Update failed');
        setSavingName(false);
    };

    const handleArrive = async (queueId) => {
        try { await arriveAtQueue(queueId); toast.success('Marked as arrived!'); }
        catch { toast.error('Could not update status.'); }
    };

    const handleComplete = async (queueId) => {
        try { const r = await completeQueue(queueId); toast.success(`Done! Wait was ${r.actualWaitTime} min.`); }
        catch { toast.error('Could not complete queue.'); }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: User },
        { id: 'favorites', label: 'Favorites', icon: Heart, count: favorites.length },
        { id: 'history', label: 'Reports', icon: FileText, count: reportHistory.length },
        { id: 'queues', label: 'My Queues', icon: Clock, count: queuePositions.length },
    ];

    if (!user) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-10 h-10 text-gray-400 dark:text-slate-500" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">Not Signed In</h2>
                <p className="text-gray-500 dark:text-dark-muted font-medium">Sign in to view your profile and history.</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Profile Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm overflow-hidden">
                <div className="relative h-28 bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-800 dark:to-indigo-800" />
                <div className="px-8 pb-6 -mt-10 relative z-10">
                    <div className="flex items-end gap-5">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-extrabold border-4 border-white dark:border-dark-card shadow-lg">
                            {user.avatar}
                        </div>
                        <div className="flex-1 pb-1">
                            {editingName ? (
                                <div className="flex items-center gap-2 mt-2">
                                    <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
                                        className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 font-bold text-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        onKeyDown={e => e.key === 'Enter' && handleSaveName()} />
                                    <button onClick={handleSaveName} disabled={savingName} className="px-3 py-1.5 rounded-xl bg-primary-600 text-white font-bold text-sm disabled:opacity-60">
                                        {savingName ? '...' : 'Save'}
                                    </button>
                                    <button onClick={() => setEditingName(false)} className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 font-bold text-sm">Cancel</button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 mt-2">
                                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">{user.name}</h1>
                                    <button onClick={() => { setNewName(user.name); setEditingName(true); }} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            <p className="text-gray-500 dark:text-dark-muted font-medium text-sm">{user.email}</p>
                        </div>
                        <button onClick={signOut} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 font-bold text-sm transition-colors mb-1">
                            <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-dark-muted font-medium">
                            <Calendar className="w-4 h-4" /> Joined {formatDate(user.joinedAt || user.createdAt)}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-dark-muted font-medium">
                            <Award className="w-4 h-4" /> {user.reportsCount || 0} Reports
                        </div>
                        <div className="flex items-center gap-1.5 text-sm font-bold capitalize px-2 py-0.5 rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400">
                            {user.role || 'visitor'}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-2xl p-1.5">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id ? 'bg-white dark:bg-dark-card text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                            <Icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                            {tab.count > 0 && (
                                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${activeTab === tab.id ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400'}`}>{tab.count}</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                {/* Overview */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { label: 'Saved Favorites', value: favorites.length, icon: Heart, color: 'text-red-500 bg-red-50 dark:bg-red-500/10' },
                            { label: 'Reports Submitted', value: user.reportsCount || 0, icon: FileText, color: 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10' },
                            { label: 'Active Queues', value: queuePositions.length, icon: Clock, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' },
                        ].map((stat, i) => (
                            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-100 dark:border-dark-border">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <p className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">{stat.value}</p>
                                <p className="text-sm font-bold text-gray-500 dark:text-dark-muted mt-1">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Favorites */}
                {activeTab === 'favorites' && (
                    <div className="space-y-3">
                        {favoriteServices.length === 0 ? (
                            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-12 text-center">
                                <Heart className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                                <p className="font-bold text-gray-500 dark:text-dark-muted">No favorites yet</p>
                                <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">Tap the heart on any service card to save it</p>
                            </div>
                        ) : favoriteServices.map(s => (
                            <div key={s._id} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 dark:text-gray-100 truncate">{s.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-dark-muted">{s.type} · {s.currentWaitTime}min wait · {s.crowdStatus}</p>
                                </div>
                                <button onClick={() => toggleFavorite(s._id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                                    <Heart className="w-4 h-4 fill-red-500" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Reports — FR-20 from DB */}
                {activeTab === 'history' && (
                    <div className="space-y-3">
                        {reportHistory.length === 0 ? (
                            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-12 text-center">
                                <FileText className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                                <p className="font-bold text-gray-500 dark:text-dark-muted">No reports yet</p>
                                <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">Submit a report from the Reporter Access page</p>
                            </div>
                        ) : reportHistory.map(r => {
                            const placeName = r.placeId?.name || 'Unknown Location';
                            const crowdColor = r.reportedCrowdStatus === 'Low' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : r.reportedCrowdStatus === 'Medium' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : r.reportedCrowdStatus === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-gray-100 dark:bg-slate-700 text-gray-500';
                            return (
                                <div key={r._id} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5 flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${crowdColor}`}>
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 dark:text-gray-100 truncate">{placeName}</p>
                                        <p className="text-sm text-gray-500 dark:text-dark-muted capitalize">
                                            {r.reportType?.replace('_', ' ')} · {r.reportedCrowdStatus} crowd · {r.reportedWaitTime}min · {formatDate(r.createdAt)}
                                        </p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-lg font-bold ${r.status === 'Verified' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : r.status === 'Rejected' ? 'bg-red-50 dark:bg-red-500/10 text-red-500' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'}`}>
                                        {r.status}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Active Queues — FR-4 & FR-5 */}
                {activeTab === 'queues' && (
                    <div className="space-y-3">
                        {queuePositions.length === 0 ? (
                            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-12 text-center">
                                <Clock className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                                <p className="font-bold text-gray-500 dark:text-dark-muted">No active queues</p>
                                <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">Click "Join Virtual Queue" on any service to get in line</p>
                            </div>
                        ) : queuePositions.map(q => (
                            <motion.div key={q._id} layout className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center">
                                        <span className="text-lg font-extrabold text-primary-600 dark:text-primary-400">#{q.position}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 dark:text-gray-100 truncate">{q.serviceName}</p>
                                        <p className="text-sm text-gray-500 dark:text-dark-muted">{q.serviceType} · Est. {q.estimatedWait}min · <span className="capitalize font-semibold">{q.status}</span></p>
                                    </div>
                                    <button onClick={() => leaveQueue(q.serviceId)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(10, 100 - q.position * 10)}%` }} transition={{ duration: 1.5, ease: 'easeOut' }}
                                        className="h-full rounded-full bg-gradient-to-r from-primary-500 to-indigo-500" />
                                </div>
                                <div className="flex gap-2">
                                    {q.status === 'waiting' && (
                                        <button onClick={() => handleArrive(q._id)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-colors">
                                            <LogIn className="w-4 h-4" /> I Arrived
                                        </button>
                                    )}
                                    {(q.status === 'arrived' || q.status === 'serving') && (
                                        <button onClick={() => handleComplete(q._id)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary-600 text-white font-bold text-sm hover:bg-primary-700 transition-colors">
                                            <CheckCircle2 className="w-4 h-4" /> My Turn Finished
                                        </button>
                                    )}
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
