import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Check, X, MapPin, Search, AlertTriangle, Users, ShieldCheck, Building2, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import AdminVisitorManager from './AdminVisitorManager';
import AdminWorkflowMonitor from './AdminWorkflowMonitor';

const CATEGORIES = ['Healthcare', 'Government', 'Financial', 'Education', 'Public Service', 'Retail', 'Other'];
const STATUS_COLORS = { approved: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10', pending: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10', rejected: 'text-red-500 bg-red-50 dark:bg-red-500/10', closed: 'text-gray-500 bg-gray-100 dark:bg-slate-700' };

const emptyForm = { name: '', type: 'Healthcare', address: '', description: '', phone: '', operatingHours: { open: '09:00', close: '17:00', days: 'Sun–Thu' }, services: '', location: { type: 'Point', coordinates: [90.3938, 23.7465] } };

export default function AdminPlaceManager() {
    const { isAdmin } = useAuth();
    const toast = useToast();
    const [activeTab, setActiveTab] = useState('places');
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    // Providers/Users
    const [providers, setProviders] = useState([]);
    const [loadingProviders, setLoadingProviders] = useState(false);

    const token = localStorage.getItem('qflow-token');
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    const fetchPlaces = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/places/admin/all', { headers });
            if (res.ok) setPlaces(await res.json());
        } catch (e) { toast.error('Failed to load places'); }
        finally { setLoading(false); }
    };

    useEffect(() => { if (isAdmin) fetchPlaces(); }, [isAdmin]);

    const fetchProviders = async () => {
        setLoadingProviders(true);
        try {
            const res = await fetch('/api/users?role=provider', { headers });
            if (res.ok) setProviders(await res.json());
        } catch { toast.error('Failed to load providers'); }
        finally { setLoadingProviders(false); }
    };

    useEffect(() => { if (isAdmin && activeTab === 'providers') fetchProviders(); }, [isAdmin, activeTab]);

    const handleChangeRole = async (userId, newRole) => {
        try {
            const res = await fetch(`/api/users/${userId}/role`, { method:'PATCH', headers, body: JSON.stringify({ role: newRole }) });
            if (res.ok) { toast.success('Role updated'); fetchProviders(); }
            else toast.error('Failed to update role');
        } catch { toast.error('Error updating role'); }
    };

    const handleDeleteProvider = async (userId, withPlaces) => {
        const msg = withPlaces ? 'Delete this provider AND all their locations?' : 'Delete this provider (keep their locations)?';
        if (!window.confirm(msg)) return;
        try {
            const res = await fetch(`/api/users/${userId}?removePlaces=${withPlaces}`, { method:'DELETE', headers });
            if (res.ok) { toast.success('Provider removed'); fetchProviders(); }
            else toast.error('Failed to remove provider');
        } catch { toast.error('Error removing provider'); }
    };

    const filtered = places.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.address?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'all' || p.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
    const openEdit = (p) => {
        setEditing(p._id);
        setForm({ ...p, services: Array.isArray(p.services) ? p.services.join(', ') : '' });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); setSubmitting(true);
        try {
            const payload = { ...form, services: form.services.split(',').map(s => s.trim()).filter(Boolean) };
            const url = editing ? `/api/places/${editing}` : '/api/places';
            const method = editing ? 'PATCH' : 'POST';
            const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
            if (!res.ok) throw new Error((await res.json()).message);
            toast.success(editing ? 'Place updated!' : 'Place added!');
            setShowForm(false);
            fetchPlaces();
        } catch (e) { toast.error(e.message); }
        finally { setSubmitting(false); }
    };

    const handleApprove = async (id, status) => {
        try {
            const res = await fetch(`/api/places/${id}/approve`, { method: 'PATCH', headers, body: JSON.stringify({ status }) });
            if (!res.ok) throw new Error();
            toast.success(`Place ${status}!`);
            setPlaces(prev => prev.map(p => p._id === id ? { ...p, status } : p));
        } catch { toast.error('Action failed'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this place? This cannot be undone.')) return;
        try {
            const res = await fetch(`/api/places/${id}`, { method: 'DELETE', headers });
            if (!res.ok) throw new Error();
            toast.success('Place deleted');
            setPlaces(prev => prev.filter(p => p._id !== id));
        } catch { toast.error('Delete failed'); }
    };

    if (!isAdmin) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center"><AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" /><h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Admin Access Required</h2></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-dark-border p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary-50 dark:bg-primary-500/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-500/20 dark:to-primary-500/10 rounded-2xl flex items-center justify-center">
                            <ShieldCheck className="w-7 h-7 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">Admin Panel</h1>
                            <p className="text-gray-500 dark:text-dark-muted font-medium text-sm mt-0.5">{places.filter(p=>p.status==='pending').length} pending · {places.length} locations · {providers.length} providers</p>
                        </div>
                    </div>
                    {activeTab === 'places' && (
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={openCreate}
                            className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-primary-500/25">
                            <Plus className="w-5 h-5" /> Add Place
                        </motion.button>
                    )}
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-2xl p-1.5">
                {[['places','Places',MapPin],['providers','Providers',Users],['visitors','Visitors',Users],['workflow','Workflow',Activity]].map(([id,label,Icon])=>(
                    <button key={id} onClick={()=>setActiveTab(id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${activeTab===id?'bg-white dark:bg-dark-card text-primary-600 dark:text-primary-400 shadow-sm':'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                        <Icon className="w-3.5 h-3.5"/>{label}
                        {id==='places' && places.filter(p=>p.status==='pending').length > 0 && (
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-600">{places.filter(p=>p.status==='pending').length}</span>
                        )}
                    </button>
                ))}
            </div>

            {activeTab === 'places' && <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search places..." className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-medium" />
                </div>
                <div className="flex gap-2">
                    {['all', 'approved', 'pending', 'rejected'].map(s => (
                        <button key={s} onClick={() => setFilterStatus(s)}
                            className={`px-4 py-3 rounded-xl font-bold text-sm capitalize transition-all ${filterStatus === s ? 'bg-primary-600 text-white shadow-md' : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Places Table */}
            <div className="bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-dark-border overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 dark:text-slate-500 font-semibold">No places found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-dark-border">
                                <tr>{['Name & Address', 'Type', 'Wait', 'Queue', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                                ))}</tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                                {filtered.map((place, i) => (
                                    <motion.tr key={place._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                                        className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{place.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5 truncate max-w-[200px]">{place.address || 'No address'}</p>
                                        </td>
                                        <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 text-xs font-bold">{place.type}</span></td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-700 dark:text-gray-300">{place.currentWaitTime}min</td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-700 dark:text-gray-300">{place.liveQueueCount || 0}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize ${STATUS_COLORS[place.status] || ''}`}>{place.status}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {place.status === 'pending' && (<>
                                                    <button onClick={() => handleApprove(place._id, 'approved')} className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 hover:bg-emerald-100 transition-colors"><Check className="w-4 h-4" /></button>
                                                    <button onClick={() => handleApprove(place._id, 'rejected')} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 transition-colors"><X className="w-4 h-4" /></button>
                                                </>)}
                                                <button onClick={() => openEdit(place)} className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 transition-colors"><Edit className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(place._id)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            </> }

            {/* Providers Tab */}
            {activeTab === 'providers' && (
                <div className="bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-dark-border overflow-hidden">
                    {loadingProviders ? (
                        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"/></div>
                    ) : providers.length === 0 ? (
                        <div className="text-center py-16">
                            <Users className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3"/>
                            <p className="font-bold text-gray-500 dark:text-dark-muted">No providers registered yet</p>
                            <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">Providers sign up with the "Service Provider" role</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-dark-border">
                                    <tr>{['Provider', 'Email', 'Reports', 'Joined', 'Role', 'Actions'].map(h=>(
                                        <th key={h} className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                                    ))}</tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                                    {providers.map((p,i)=>(
                                        <motion.tr key={p._id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}}
                                            className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center text-violet-700 dark:text-violet-300 font-extrabold text-sm">{p.avatar || p.name?.[0]}</div>
                                                    <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{p.name}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-dark-muted">{p.email}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-700 dark:text-gray-300">{p.reportsCount || 0}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-dark-muted">{new Date(p.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <select value={p.role} onChange={e=>handleChangeRole(p._id, e.target.value)}
                                                    className="px-2 py-1.5 rounded-lg border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-gray-200 text-xs font-bold focus:ring-2 focus:ring-primary-500">
                                                    {['visitor','reporter','provider','admin'].map(r=><option key={r} value={r}>{r}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button onClick={()=>handleDeleteProvider(p._id, false)}
                                                        title="Remove provider, keep locations"
                                                        className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 hover:bg-amber-100 transition-colors">
                                                        <X className="w-4 h-4"/>
                                                    </button>
                                                    <button onClick={()=>handleDeleteProvider(p._id, true)}
                                                        title="Remove provider AND all their locations"
                                                        className="p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 transition-colors">
                                                        <Trash2 className="w-4 h-4"/>
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="px-6 py-3 bg-gray-50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-dark-border flex items-center gap-4 text-xs font-semibold text-gray-400 dark:text-slate-500">
                                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-100 dark:bg-amber-500/20 inline-block"/> Remove provider only (keep locations)</span>
                                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 dark:bg-red-500/20 inline-block"/> Remove provider + all locations</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Visitors Tab */}
            {activeTab === 'visitors' && <AdminVisitorManager />}

            {/* Workflow Tab */}
            {activeTab === 'workflow' && <AdminWorkflowMonitor />}

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-dark-border w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">{editing ? 'Edit Place' : 'Add New Place'}</h2>
                                <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Place Name *</label>
                                        <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Category *</label>
                                        <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 font-medium">
                                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Phone</label>
                                        <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 font-medium" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Address</label>
                                        <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 font-medium" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Description</label>
                                        <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 font-medium resize-none" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Services (comma-separated)</label>
                                        <input value={form.services} onChange={e => setForm(f => ({ ...f, services: e.target.value }))} placeholder="e.g. OPD, Emergency, Lab Tests" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 font-medium" />
                                    </div>
                                    <div><label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Opens</label><input type="time" value={form.operatingHours?.open || '09:00'} onChange={e => setForm(f => ({ ...f, operatingHours: { ...f.operatingHours, open: e.target.value } }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 font-medium" /></div>
                                    <div><label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Closes</label><input type="time" value={form.operatingHours?.close || '17:00'} onChange={e => setForm(f => ({ ...f, operatingHours: { ...f.operatingHours, close: e.target.value } }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 font-medium" /></div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Longitude</label>
                                        <input type="number" step="any" value={form.location?.coordinates?.[0] || 90.39} onChange={e => setForm(f => ({ ...f, location: { ...f.location, coordinates: [parseFloat(e.target.value), f.location?.coordinates?.[1] || 23.74] } }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 font-medium" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Latitude</label>
                                        <input type="number" step="any" value={form.location?.coordinates?.[1] || 23.74} onChange={e => setForm(f => ({ ...f, location: { ...f.location, coordinates: [f.location?.coordinates?.[0] || 90.39, parseFloat(e.target.value)] } }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 font-medium" />
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border-2 border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                                    <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold shadow-lg shadow-primary-500/25 disabled:opacity-70">
                                        {submitting ? 'Saving...' : editing ? 'Save Changes' : 'Add Place'}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
