import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Clock, MapPin, Bell, BarChart2, Users, ShieldCheck, Star, Github, Mail } from 'lucide-react';

// Oritrow's contribution — About & FAQ Page
// Showcases the Q-Flow platform with features, how it works, and FAQ section

const FEATURES = [
    { icon: Clock, title: 'Real-Time Wait Times', desc: 'Live queue data updated every 30 seconds so you always know what to expect before you arrive.', color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    { icon: MapPin, title: 'Interactive Map', desc: 'Find nearby service locations on a live map with crowd level indicators — Low, Medium, or High.', color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    { icon: Bell, title: 'Smart Notifications', desc: 'Subscribe to your favourite locations and get alerts when it\'s time to head over.', color: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400' },
    { icon: BarChart2, title: 'Analytics Dashboard', desc: 'Admins and providers get rich charts, heatmaps, and peak-hour analysis to optimise service delivery.', color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    { icon: Users, title: 'Virtual Queue', desc: 'Join a queue remotely and get your position tracked in real time — no physical waiting required.', color: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' },
    { icon: ShieldCheck, title: 'Role-Based Access', desc: 'Visitors, Reporters, Providers, and Admins each get a tailored experience with the right tools.', color: 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400' },
];

const STEPS = [
    { step: '01', title: 'Find a Service', desc: 'Search or browse the map to find banks, hospitals, or government offices near you.' },
    { step: '02', title: 'Check Live Status', desc: 'See the current crowd level, estimated wait time, and best times to visit.' },
    { step: '03', title: 'Join the Queue', desc: 'Register your spot virtually. Get your position number and real-time ETA.' },
    { step: '04', title: 'Arrive & Done', desc: 'Head over when it\'s almost your turn. Tap "I Arrived" and then "My Turn Finished" when done.' },
];

const FAQS = [
    { q: 'Is Q-Flow free to use?', a: 'Yes! Q-Flow is completely free for visitors. Service providers can register their locations for free during our launch period.' },
    { q: 'How accurate are the wait time estimates?', a: 'Wait times are calculated from real visitor data. The more people use Q-Flow at a location, the more accurate predictions become. Crowd reporters also help verify data in real time.' },
    { q: 'What happens if I miss my turn?', a: 'If you don\'t arrive within a reasonable time window, you can re-join the queue. Providers can also remove inactive visitors to keep the queue moving.' },
    { q: 'How do I become a verified reporter?', a: 'Sign up with the Reporter role and consistently submit accurate crowd reports. After enough verified reports, you earn Verified Reporter status.' },
    { q: 'Can service providers customize their queue?', a: 'Yes. Providers can send custom notifications to all visitors in their queue (e.g. delays or cancellations), remove visitors, and view analytics for their location.' },
    { q: 'Which cities/locations are supported?', a: 'Q-Flow currently covers major service centers in Dhaka, Bangladesh including hospitals, banks, government offices, and retail centers. More locations are added as providers register.' },
    { q: 'How do I report incorrect wait time data?', a: 'Use the Reporter Check-In feature from the navigation menu. You can report actual wait times, overcrowding, or if a location is closed.' },
];

const TEAM = [
    { name: 'Ifaz', role: 'Project Lead & Full-Stack Dev', avatar: 'IF', color: 'bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300' },
    { name: 'Siam', role: 'Frontend Developer — Rating System', avatar: 'SI', color: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300' },
    { name: 'mearnob', role: 'Frontend Developer — About & FAQ', avatar: 'ME', color: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' },
];

function FAQItem({ q, a }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-gray-100 dark:border-dark-border rounded-2xl overflow-hidden">
            <button onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                <span className="font-bold text-gray-900 dark:text-gray-100 text-sm pr-4">{q}</span>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
                    <ChevronDown className="w-5 h-5 text-gray-400 dark:text-slate-500" />
                </motion.div>
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }} className="overflow-hidden">
                        <p className="px-5 pb-4 text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed border-t border-gray-50 dark:border-dark-border pt-3">
                            {a}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-16 pb-16">

            {/* Hero */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="relative bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-dark-border overflow-hidden px-8 py-14 text-center">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600/5 via-transparent to-violet-500/5 pointer-events-none" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-widest mb-5">
                        🇧🇩 Made for Bangladesh
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-4">
                        About <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-violet-600">Q-Flow</span>
                    </h1>
                    <p className="text-lg text-gray-500 dark:text-dark-muted font-medium max-w-2xl mx-auto leading-relaxed">
                        Q-Flow (QueueLess BD) is a web-based platform designed to eliminate unnecessary waiting time at public service centers across Bangladesh — banks, hospitals, and government offices.
                    </p>
                </div>
            </motion.div>

            {/* Features Grid */}
            <section>
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">Platform Features</h2>
                    <p className="text-gray-500 dark:text-dark-muted mt-2 font-medium">Everything you need to manage queues smarter</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {FEATURES.map((f, i) => (
                        <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                            className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6 hover:shadow-md dark:hover:shadow-black/20 transition-shadow">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                                <f.icon className="w-5 h-5" />
                            </div>
                            <h3 className="font-extrabold text-gray-900 dark:text-gray-100 mb-2">{f.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-dark-muted font-medium leading-relaxed">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section>
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">How It Works</h2>
                    <p className="text-gray-500 dark:text-dark-muted mt-2 font-medium">Four simple steps to skip the wait</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {STEPS.map((s, i) => (
                        <motion.div key={s.step} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                            className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6 flex items-start gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center shrink-0 shadow-lg shadow-primary-500/25">
                                <span className="text-white font-extrabold text-sm">{s.step}</span>
                            </div>
                            <div>
                                <h3 className="font-extrabold text-gray-900 dark:text-gray-100 mb-1">{s.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-dark-muted font-medium leading-relaxed">{s.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* FAQ */}
            <section>
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">Frequently Asked Questions</h2>
                    <p className="text-gray-500 dark:text-dark-muted mt-2 font-medium">Everything you need to know about Q-Flow</p>
                </div>
                <div className="space-y-3">
                    {FAQS.map((faq, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                            <FAQItem q={faq.q} a={faq.a} />
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Team */}
            <section>
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">The Team</h2>
                    <p className="text-gray-500 dark:text-dark-muted mt-2 font-medium">CSE 470 Project — North South University</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {TEAM.map((member, i) => (
                        <motion.div key={member.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6 text-center">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-extrabold mx-auto mb-4 ${member.color}`}>
                                {member.avatar}
                            </div>
                            <p className="font-extrabold text-gray-900 dark:text-gray-100">{member.name}</p>
                            <p className="text-xs text-gray-500 dark:text-dark-muted font-medium mt-1 leading-snug">{member.role}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Contact */}
            <section className="bg-gradient-to-br from-primary-600 to-violet-700 rounded-3xl p-10 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                <div className="relative z-10">
                    <h2 className="text-2xl font-extrabold text-white mb-3">Have Questions?</h2>
                    <p className="text-white/70 font-medium mb-6">We're happy to help. Reach out to the development team.</p>
                    <a href="mailto:qflow.bd@gmail.com"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-primary-600 font-extrabold shadow-lg hover:bg-gray-50 transition-colors">
                        <Mail className="w-4 h-4" /> qflow.bd@gmail.com
                    </a>
                </div>
            </section>
        </div>
    );
}
