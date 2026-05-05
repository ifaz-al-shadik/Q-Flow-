import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, MapPin, Send, Users, Clock, ChevronRight, Eye, Building2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function AdminWorkflowMonitor() {
  const toast = useToast();
  const token = localStorage.getItem('qflow-token');
  const H = { Authorization: `Bearer ${token}` };

  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [providerActivity, setProviderActivity] = useState(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users?role=provider', { headers: H })
      .then(r => r.json()).then(data => { setProviders(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const viewProviderActivity = async (p) => {
    setSelectedProvider(p); setActivityLoading(true); setProviderActivity(null);
    try {
      const r = await fetch(`/api/users/${p._id}/provider-activity`, { headers: H });
      if (r.ok) setProviderActivity(await r.json());
      else toast.error('Failed to load provider activity');
    } catch { toast.error('Error loading activity'); }
    finally { setActivityLoading(false); }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Provider List */}
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-dark-border">
            <p className="font-bold text-gray-900 dark:text-gray-100 text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-violet-600" /> Providers ({providers.length})
            </p>
          </div>
          {loading ? (
            <div className="flex justify-center py-10"><div className="w-6 h-6 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : providers.length === 0 ? (
            <div className="text-center py-10 text-gray-400 dark:text-slate-500 text-sm font-medium px-4">No providers registered yet</div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-dark-border">
              {providers.map(p => (
                <motion.button key={p._id} onClick={() => viewProviderActivity(p)}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors ${selectedProvider?._id === p._id ? 'bg-violet-50 dark:bg-violet-500/10' : ''}`}>
                  <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center font-extrabold text-violet-600 dark:text-violet-400 text-sm shrink-0">
                    {p.avatar || p.name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate">{p.name}</p>
                    <p className="text-xs text-gray-500 dark:text-dark-muted truncate">{p.email}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 dark:text-slate-600 shrink-0" />
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Provider Activity Panel */}
        <div className="lg:col-span-2 space-y-4">
          {!selectedProvider ? (
            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border flex flex-col items-center justify-center py-20 text-center">
              <Activity className="w-10 h-10 text-gray-300 dark:text-slate-600 mb-3" />
              <p className="font-bold text-gray-500 dark:text-dark-muted">Select a provider to see their workflow</p>
              <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">View places, active queues and sent notifications</p>
            </div>
          ) : activityLoading ? (
            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border flex justify-center py-16">
              <div className="w-7 h-7 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : providerActivity && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Provider Info Banner */}
              <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 font-extrabold text-lg">
                  {selectedProvider.avatar || selectedProvider.name?.[0]}
                </div>
                <div className="flex-1">
                  <p className="font-extrabold text-gray-900 dark:text-gray-100">{selectedProvider.name}</p>
                  <p className="text-sm text-gray-500 dark:text-dark-muted">{selectedProvider.email}</p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: 'Locations', value: providerActivity.places?.length || 0 },
                    { label: 'In Queue', value: providerActivity.activeQueues?.length || 0 },
                    { label: 'Notifications', value: providerActivity.sentNotifications?.length || 0 },
                  ].map(s => (
                    <div key={s.label} className="bg-gray-50 dark:bg-slate-800 rounded-xl px-3 py-2">
                      <p className="text-lg font-extrabold text-gray-900 dark:text-gray-100">{s.value}</p>
                      <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Managed Locations */}
                <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Managed Locations
                  </p>
                  {!providerActivity.places?.length ? (
                    <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">No locations registered</p>
                  ) : (
                    <div className="space-y-2">
                      {providerActivity.places.map(pl => (
                        <div key={pl._id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-dark-border">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{pl.name}</p>
                            <p className="text-[10px] text-gray-400 dark:text-slate-500">{pl.type} · {pl.liveQueueCount || 0} in queue</p>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold shrink-0 ${pl.status === 'approved' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10'}`}>
                            {pl.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sent Notifications */}
                <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5" /> Sent Notifications
                  </p>
                  {!providerActivity.sentNotifications?.length ? (
                    <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">No notifications sent yet</p>
                  ) : (
                    <div className="space-y-2">
                      {providerActivity.sentNotifications.map(n => (
                        <div key={n._id} className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-dark-border">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${n.type === 'cancellation' ? 'bg-red-100 text-red-600 dark:bg-red-500/10' : n.type === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/10' : 'bg-blue-100 text-blue-600 dark:bg-blue-500/10'}`}>
                              {n.type}
                            </span>
                            <span className="text-[10px] text-gray-400 dark:text-slate-500">{new Date(n.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-snug">{n.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Active Queues across all places */}
              <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Active Visitors Across All Locations ({providerActivity.activeQueues?.length || 0})
                </p>
                {!providerActivity.activeQueues?.length ? (
                  <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">No active visitors right now</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="border-b border-gray-100 dark:border-dark-border">
                        {['Location', 'Position', 'Status', 'Est. Wait', 'Joined'].map(h => (
                          <th key={h} className="text-left text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider pb-2 pr-4">{h}</th>
                        ))}
                      </tr></thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                        {providerActivity.activeQueues.map(q => (
                          <tr key={q._id}>
                            <td className="py-2 pr-4 text-xs font-bold text-gray-800 dark:text-gray-200 truncate max-w-[120px]">{q.serviceId?.name || '—'}</td>
                            <td className="py-2 pr-4"><span className="w-6 h-6 rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-extrabold text-[10px] flex items-center justify-center">#{q.position}</span></td>
                            <td className="py-2 pr-4"><span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold capitalize ${q.status === 'arrived' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-gray-100 dark:bg-slate-700 text-gray-500'}`}>{q.status}</span></td>
                            <td className="py-2 pr-4 text-xs font-bold text-gray-700 dark:text-gray-300">{q.estimatedWait}min</td>
                            <td className="py-2 text-xs text-gray-400 dark:text-slate-500">{new Date(q.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
