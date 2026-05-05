import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Trash2, Plus, X, Search, Eye, Clock, FileText, ChevronDown } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function AdminVisitorManager() {
  const toast = useToast();
  const token = localStorage.getItem('qflow-token');
  const H = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const [visitors, setVisitors] = useState([]);
  const [places, setPlaces] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);     // viewed visitor activity
  const [activity, setActivity] = useState(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [showAddQueue, setShowAddQueue] = useState(null); // visitor to add to queue
  const [addPlaceId, setAddPlaceId] = useState('');

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/users?role=visitor', { headers: H });
      if (r.ok) setVisitors(await r.json());
    } catch { } finally { setLoading(false); }
  };

  const fetchPlaces = async () => {
    const r = await fetch('/api/places');
    if (r.ok) setPlaces(await r.json());
  };

  useEffect(() => { fetchVisitors(); fetchPlaces(); }, []);

  const viewActivity = async (v) => {
    setSelected(v); setActivityLoading(true); setActivity(null);
    try {
      const r = await fetch(`/api/users/${v._id}/activity`, { headers: H });
      if (r.ok) setActivity(await r.json());
    } catch { } finally { setActivityLoading(false); }
  };

  const handleAddToQueue = async (visitorId) => {
    if (!addPlaceId) { toast.error('Select a location'); return; }
    try {
      const r = await fetch('/api/users/queue/add', {
        method: 'POST', headers: H,
        body: JSON.stringify({ userId: visitorId, serviceId: addPlaceId })
      });
      const d = await r.json();
      if (r.ok) { toast.success(`Visitor added to queue at position #${d.position}`); setShowAddQueue(null); setAddPlaceId(''); }
      else toast.error(d.message || 'Failed to add');
    } catch { toast.error('Error adding to queue'); }
  };

  const handleRemoveFromQueue = async (queueId) => {
    if (!window.confirm('Remove this visitor from queue?')) return;
    try {
      const r = await fetch(`/api/users/queue/${queueId}`, { method: 'DELETE', headers: H });
      if (r.ok) { toast.success('Removed from queue'); viewActivity(selected); }
      else toast.error('Failed to remove');
    } catch { toast.error('Error'); }
  };

  const handleDeleteVisitor = async (v) => {
    if (!window.confirm(`Delete visitor "${v.name}"? This cancels all their queues.`)) return;
    try {
      const r = await fetch(`/api/users/${v._id}`, { method: 'DELETE', headers: H });
      if (r.ok) { toast.success('Visitor deleted'); setVisitors(vs => vs.filter(u => u._id !== v._id)); if (selected?._id === v._id) setSelected(null); }
      else toast.error('Delete failed');
    } catch { toast.error('Error'); }
  };

  const filtered = visitors.filter(v =>
    v.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search visitors..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 font-medium" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Visitors List */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
            <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{filtered.length} Visitors</p>
          </div>
          {loading ? (
            <div className="flex justify-center py-12"><div className="w-7 h-7 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-slate-500 font-medium text-sm">No visitors found</div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-dark-border max-h-[500px] overflow-y-auto">
              {filtered.map((v, i) => (
                <motion.div key={v._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer ${selected?._id === v._id ? 'bg-primary-50 dark:bg-primary-500/10' : ''}`}
                  onClick={() => viewActivity(v)}>
                  <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center font-extrabold text-primary-600 dark:text-primary-400 text-sm shrink-0">
                    {v.avatar || v.name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate">{v.name}</p>
                    <p className="text-xs text-gray-500 dark:text-dark-muted truncate">{v.email} · {v.reportsCount || 0} reports</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={e => { e.stopPropagation(); setShowAddQueue(v._id); setAddPlaceId(''); }}
                      title="Add to queue" className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 hover:bg-emerald-100 transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); handleDeleteVisitor(v); }}
                      title="Delete visitor" className="p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Panel */}
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border overflow-hidden">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center px-6">
              <Eye className="w-10 h-10 text-gray-300 dark:text-slate-600 mb-3" />
              <p className="font-bold text-gray-500 dark:text-dark-muted text-sm">Click a visitor to see their workflow</p>
            </div>
          ) : (
            <>
              <div className="px-5 py-3 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
                <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{selected.name}'s Activity</p>
                <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              {activityLoading ? (
                <div className="flex justify-center py-10"><div className="w-6 h-6 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : activity && (
                <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                  {/* Add to Queue inline */}
                  <AnimatePresence>
                    {showAddQueue === selected._id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden">
                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 space-y-2">
                          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Add to Queue</p>
                          <select value={addPlaceId} onChange={e => setAddPlaceId(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 text-xs font-medium">
                            <option value="">— Select Location —</option>
                            {places.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                          </select>
                          <div className="flex gap-2">
                            <button onClick={() => handleAddToQueue(selected._id)}
                              className="flex-1 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors">
                              Add
                            </button>
                            <button onClick={() => setShowAddQueue(null)}
                              className="flex-1 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 font-bold text-xs">
                              Cancel
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Queue History */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Queue History ({activity.queues?.length || 0})
                    </p>
                    {!activity.queues?.length ? (
                      <p className="text-xs text-gray-400 dark:text-slate-500 font-medium py-2">No queues yet</p>
                    ) : (
                      <div className="space-y-1.5">
                        {activity.queues.map(q => (
                          <div key={q._id} className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-dark-border">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{q.serviceId?.name || 'Unknown'}</p>
                              <p className="text-[10px] text-gray-400 dark:text-slate-500 capitalize">{q.status} · #{q.position} · {new Date(q.joinedAt).toLocaleDateString()}</p>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold shrink-0 ${q.status === 'waiting' || q.status === 'arrived' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 'bg-gray-100 dark:bg-slate-700 text-gray-500'}`}>
                              {q.status}
                            </span>
                            {(q.status === 'waiting' || q.status === 'arrived') && (
                              <button onClick={() => handleRemoveFromQueue(q._id)}
                                className="p-1 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shrink-0">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Report History */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> Reports ({activity.reports?.length || 0})
                    </p>
                    {!activity.reports?.length ? (
                      <p className="text-xs text-gray-400 dark:text-slate-500 font-medium py-2">No reports yet</p>
                    ) : (
                      <div className="space-y-1.5">
                        {activity.reports.map(r => (
                          <div key={r._id} className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-dark-border">
                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{r.placeId?.name || 'Unknown'}</p>
                            <p className="text-[10px] text-gray-400 dark:text-slate-500 capitalize">{r.reportType?.replace('_', ' ')} · {r.reportedCrowdStatus} · {r.reportedWaitTime}min</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
