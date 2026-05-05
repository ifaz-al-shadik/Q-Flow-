import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, MapPin, Trash2, Send, Plus, CheckCircle2, AlertTriangle, Building2, BarChart2, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const NOTIF_TYPES = [
  { id:'info', label:'Info', color:'bg-blue-500' },
  { id:'warning', label:'Warning', color:'bg-amber-500' },
  { id:'cancellation', label:'Cancellation', color:'bg-red-500' },
];

export default function ServiceProviderDashboard() {
  const { user, isProvider } = useAuth();
  const toast = useToast();
  const token = localStorage.getItem('qflow-token');
  const H = { Authorization: `Bearer ${token}` };

  const [places, setPlaces] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [stats, setStats] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('queue');

  // Broadcast notification state
  const [notifMsg, setNotifMsg] = useState('');
  const [notifType, setNotifType] = useState('info');
  const [sending, setSending] = useState(false);

  // Location request state
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [reqForm, setReqForm] = useState({ name:'', type:'Hospital', address:'', phone:'', description:'', open:'09:00', close:'17:00', days:'Sun–Thu' });
  const [submittingReq, setSubmittingReq] = useState(false);

  useEffect(() => {
    fetch('/api/places').then(r=>r.json()).then(data => {
      setPlaces(data);
      if (data.length > 0) { setSelectedId(data[0]._id); }
    }).catch(()=>{});
  }, []);

  const loadStats = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        fetch(`/api/queues/stats/${id}`, { headers: H }),
        fetch(`/api/analytics/provider/${id}`, { headers: H }),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (analyticsRes.ok) setAnalyticsData(await analyticsRes.json());
    } catch {}
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => {
    if (selectedId) loadStats(selectedId);
    const iv = setInterval(() => { if (selectedId) loadStats(selectedId); }, 20000);
    return () => clearInterval(iv);
  }, [selectedId, loadStats]);

  const selectedPlace = places.find(p => p._id === selectedId);

  const handleRemoveVisitor = async (queueId) => {
    if (!window.confirm('Remove this visitor from the queue?')) return;
    try {
      const r = await fetch(`/api/queues/provider/remove/${queueId}`, { method:'DELETE', headers: H });
      if (r.ok) { toast.success('Visitor removed'); loadStats(selectedId); }
      else toast.error('Failed to remove visitor');
    } catch { toast.error('Error removing visitor'); }
  };

  const handleSendNotification = async () => {
    if (!notifMsg.trim()) { toast.error('Please enter a message'); return; }
    setSending(true);
    try {
      const r = await fetch('/api/notifications/broadcast', {
        method:'POST', headers: { ...H, 'Content-Type':'application/json' },
        body: JSON.stringify({ placeId: selectedId, placeName: selectedPlace?.name, message: notifMsg, type: notifType, title: `Message from ${selectedPlace?.name}` })
      });
      const d = await r.json();
      if (r.ok) { toast.success(`Sent to ${d.sent} visitor(s)`); setNotifMsg(''); }
      else toast.error(d.message || 'Failed to send');
    } catch { toast.error('Error sending notification'); }
    finally { setSending(false); }
  };

  const handleRequestLocation = async (e) => {
    e.preventDefault();
    setSubmittingReq(true);
    try {
      const body = {
        name: reqForm.name, type: reqForm.type, address: reqForm.address,
        phone: reqForm.phone, description: reqForm.description,
        operatingHours: { open: reqForm.open, close: reqForm.close, days: reqForm.days },
        location: { type:'Point', coordinates: [90.4125, 23.8103] },
        status: 'pending'
      };
      const r = await fetch('/api/places', { method:'POST', headers: { ...H, 'Content-Type':'application/json' }, body: JSON.stringify(body) });
      if (r.ok) {
        toast.success('Location request submitted! Waiting for admin approval.');
        setShowRequestForm(false);
        setReqForm({ name:'', type:'Hospital', address:'', phone:'', description:'', open:'09:00', close:'17:00', days:'Sun–Thu' });
      } else { const d = await r.json(); toast.error(d.message || 'Failed to submit'); }
    } catch { toast.error('Error submitting request'); }
    finally { setSubmittingReq(false); }
  };

  if (!isProvider) return (
    <div className="flex items-center justify-center min-h-[60vh] text-center">
      <div>
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">Provider Access Required</h2>
        <p className="text-gray-500 dark:text-dark-muted mt-1 text-sm font-medium">Sign up as a Service Provider to access this dashboard.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}}
        className="bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-dark-border p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-violet-50 dark:bg-violet-500/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none"/>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 relative z-10">
          <div className="w-12 h-12 bg-violet-100 dark:bg-violet-500/20 rounded-2xl flex items-center justify-center shrink-0">
            <BarChart2 className="w-6 h-6 text-violet-600 dark:text-violet-400"/>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">Provider Dashboard</h1>
            <p className="text-gray-500 dark:text-dark-muted text-sm font-medium">Welcome, <span className="font-bold text-violet-600 dark:text-violet-400">{user?.name}</span></p>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>setShowRequestForm(!showRequestForm)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white font-bold text-sm hover:bg-violet-700 transition-colors">
              <Plus className="w-4 h-4"/> Request Location
            </button>
            {selectedId && <button onClick={()=>loadStats(selectedId)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-sm font-bold">
              Refresh
            </button>}
          </div>
        </div>
      </motion.div>

      {/* Request Location Form */}
      {showRequestForm && (
        <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}
          className="bg-white dark:bg-dark-card rounded-3xl border-2 border-violet-200 dark:border-violet-500/30 p-6">
          <div className="flex items-center gap-3 mb-5">
            <Building2 className="w-6 h-6 text-violet-600 dark:text-violet-400"/>
            <div>
              <h2 className="font-extrabold text-gray-900 dark:text-gray-100">Request a New Location</h2>
              <p className="text-sm text-gray-500 dark:text-dark-muted">Submit details — admin will review and approve</p>
            </div>
          </div>
          <form onSubmit={handleRequestLocation} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location Name *</label>
              <input required value={reqForm.name} onChange={e=>setReqForm({...reqForm, name:e.target.value})} placeholder="e.g. Square Hospital"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 font-medium focus:ring-2 focus:ring-violet-500 text-sm"/>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type *</label>
              <select value={reqForm.type} onChange={e=>setReqForm({...reqForm, type:e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 font-medium focus:ring-2 focus:ring-violet-500 text-sm">
                {['Hospital','Bank','Government Office','Public Service','Retail','Other'].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Address *</label>
              <input required value={reqForm.address} onChange={e=>setReqForm({...reqForm, address:e.target.value})} placeholder="Full address"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 font-medium focus:ring-2 focus:ring-violet-500 text-sm"/>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</label>
              <input value={reqForm.phone} onChange={e=>setReqForm({...reqForm, phone:e.target.value})} placeholder="+880-..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 font-medium focus:ring-2 focus:ring-violet-500 text-sm"/>
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</label>
              <textarea rows={2} value={reqForm.description} onChange={e=>setReqForm({...reqForm, description:e.target.value})} placeholder="Brief description of your service..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 font-medium focus:ring-2 focus:ring-violet-500 text-sm resize-none"/>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:col-span-2">
              {['open','close','days'].map(f=>(
                <div key={f} className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{f === 'days' ? 'Working Days' : f === 'open' ? 'Opens' : 'Closes'}</label>
                  <input value={reqForm[f]} onChange={e=>setReqForm({...reqForm,[f]:e.target.value})} placeholder={f==='days'?'Sun–Thu':'09:00'}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 text-sm font-medium focus:ring-2 focus:ring-violet-500"/>
                </div>
              ))}
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={submittingReq}
                className="flex-1 py-3 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-700 transition-colors disabled:opacity-60">
                {submittingReq ? 'Submitting...' : 'Submit for Admin Approval'}
              </button>
              <button type="button" onClick={()=>setShowRequestForm(false)}
                className="px-5 py-3 rounded-xl border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Location Selector */}
      <div className="bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-dark-border p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-2 text-gray-500 dark:text-dark-muted font-bold text-sm">
          <MapPin className="w-4 h-4"/> Monitoring:
        </div>
        <select value={selectedId} onChange={e=>setSelectedId(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 font-semibold focus:ring-2 focus:ring-violet-500">
          <option value="">— Select a Location —</option>
          {places.map(p=><option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
      </div>

      {loading && <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"/></div>}

      {stats && selectedId && !loading && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-5">
          {/* KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label:'Visitors in Queue', value: stats.liveCount, icon: Users, color:'text-violet-600 bg-violet-50 dark:bg-violet-500/10' },
              { label:'Total Queue Time', value: `${stats.totalQueueTime}min`, icon: Clock, color:'text-amber-600 bg-amber-50 dark:bg-amber-500/10' },
              { label:'Avg per Person', value: `${stats.avgWaitPerPerson}min`, icon: Clock, color:'text-primary-600 bg-primary-50 dark:bg-primary-500/10' },
              { label:'Arrived', value: stats.arrivedCount, icon: CheckCircle2, color:'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' },
            ].map((k,i)=>(
              <motion.div key={k.label} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
                className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-gray-100 dark:border-dark-border">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${k.color}`}>
                  <k.icon className="w-5 h-5"/>
                </div>
                <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">{k.value}</p>
                <p className="text-xs font-bold text-gray-500 dark:text-dark-muted uppercase tracking-wider mt-1">{k.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-2xl p-1.5">
            {[['queue','Live Queue'],['notify','Send Notification'],['besttime','Best Times']].map(([id,label])=>(
              <button key={id} onClick={()=>setTab(id)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${tab===id?'bg-white dark:bg-dark-card text-violet-600 dark:text-violet-400 shadow-sm':'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Live Queue Tab */}
          {tab === 'queue' && (
            <div className="bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-dark-border p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-extrabold text-gray-900 dark:text-gray-100 text-lg">Live Queue ({stats.liveCount})</h3>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                  <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"/><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"/></span>
                  Live
                </span>
              </div>
              {stats.queue.length === 0 ? (
                <div className="text-center py-12 text-gray-400 dark:text-slate-500 font-medium">No visitors in queue right now</div>
              ) : (
                <div className="space-y-2">
                  {stats.queue.map((q,i)=>(
                    <motion.div key={q._id} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*0.04}}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-dark-border">
                      <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center shrink-0">
                        <span className="text-sm font-extrabold text-violet-600 dark:text-violet-400">#{q.position}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">Visitor #{i+1}</p>
                        <p className="text-xs text-gray-500 dark:text-dark-muted capitalize">
                          Status: <span className={`font-bold ${q.status==='arrived'?'text-emerald-600':'text-gray-500'}`}>{q.status}</span>
                          {' · '}Est. {q.estimatedWait}min
                          {q.joinedAt && ` · Joined ${new Date(q.joinedAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}`}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${q.status==='arrived'?'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600':'bg-gray-100 dark:bg-slate-700 text-gray-500'}`}>
                        {q.status}
                      </span>
                      <button onClick={()=>handleRemoveVisitor(q._id)}
                        className="p-2 rounded-xl text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Send Notification Tab */}
          {tab === 'notify' && (
            <div className="bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-dark-border p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                  <Send className="w-5 h-5 text-amber-600"/>
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 dark:text-gray-100">Broadcast Notification</h3>
                  <p className="text-sm text-gray-500 dark:text-dark-muted">Send a message to all <strong>{stats.liveCount}</strong> visitor(s) currently in queue</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Message Type</p>
                  <div className="flex gap-2 flex-wrap">
                    {NOTIF_TYPES.map(t=>(
                      <button key={t.id} onClick={()=>setNotifType(t.id)}
                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all border-2 ${notifType===t.id?`${t.color} text-white border-transparent`:'border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 bg-white dark:bg-slate-800'}`}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Message</p>
                  <textarea rows={4} value={notifMsg} onChange={e=>setNotifMsg(e.target.value)}
                    placeholder='e.g. "The queue has been cancelled due to a tropical storm. We apologise for the inconvenience."'
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 font-medium focus:ring-2 focus:ring-violet-500 resize-none text-sm"/>
                </div>
                {stats.liveCount === 0 && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-sm font-medium">
                    <AlertTriangle className="w-4 h-4 shrink-0"/> No visitors currently in queue to notify.
                  </div>
                )}
                <button onClick={handleSendNotification} disabled={sending || stats.liveCount===0 || !notifMsg.trim()}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-violet-500 text-white font-bold flex items-center justify-center gap-2 hover:from-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20">
                  <Send className="w-4 h-4"/>
                  {sending ? 'Sending...' : `Send to ${stats.liveCount} Visitor(s)`}
                </button>
              </div>
            </div>
          )}

          {/* Best Times Tab */}
          {tab === 'besttime' && (
            <div className="bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-dark-border p-6">
              <h3 className="font-extrabold text-gray-900 dark:text-gray-100 text-lg mb-5">Best Visit Times</h3>
              {analyticsData?.bestTimes?.length > 0 ? (
                <div className="space-y-3">
                  {analyticsData.bestTimes.map((bt,i)=>(
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                        <Star className="w-5 h-5 text-emerald-600 dark:text-emerald-400"/>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-gray-100">{DAY_NAMES[bt.dayOfWeek]} at {String(bt.hour).padStart(2,'0')}:00</p>
                        <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">~{bt.avgWait} min avg wait</p>
                      </div>
                      <span className="text-xs font-bold text-white bg-emerald-500 px-2.5 py-1 rounded-lg">#{i+1}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-gray-400 dark:text-slate-500 font-medium">Not enough historical data yet. Build up as visitors use the queue.</p>
              )}
            </div>
          )}
        </motion.div>
      )}

      {!selectedId && !loading && (
        <div className="bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-dark-border p-16 text-center">
          <MapPin className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3"/>
          <p className="font-bold text-gray-500 dark:text-dark-muted">Select a location above to monitor it</p>
          <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">Or request a new location using the button above</p>
        </div>
      )}
    </div>
  );
}
