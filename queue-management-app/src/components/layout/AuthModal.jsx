import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, Users, FileText, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const ROLES = [
    {
        id: 'visitor',
        label: 'Visitor',
        desc: 'Check live wait times & join virtual queues',
        icon: Users,
        color: 'border-primary-400 bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300',
        inactive: 'border-gray-200 dark:border-dark-border text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800/50 hover:border-gray-300'
    },
    {
        id: 'reporter',
        label: 'Reporter',
        desc: 'Submit crowd data & help others save time',
        icon: FileText,
        color: 'border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        inactive: 'border-gray-200 dark:border-dark-border text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800/50 hover:border-gray-300'
    },
    {
        id: 'provider',
        label: 'Service Provider',
        desc: 'Monitor your location\'s queue & analytics',
        icon: Building2,
        color: 'border-violet-400 bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300',
        inactive: 'border-gray-200 dark:border-dark-border text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800/50 hover:border-gray-300'
    },
];

const AuthModal = ({ isOpen, onClose }) => {
    const [mode, setMode] = useState('signin');
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('visitor');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signUp, signIn } = useAuth();
    const toast = useToast();

    const resetForm = () => {
        setName(''); setEmail(''); setPassword('');
        setRole('visitor'); setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !password.trim()) { setError('Please fill in all fields'); return; }
        if (mode === 'signup' && !name.trim()) { setError('Please enter your name'); return; }
        if (password.length < 4) { setError('Password must be at least 4 characters'); return; }

        setIsLoading(true);
        await new Promise(r => setTimeout(r, 600));

        let result;
        if (mode === 'signup') {
            result = await signUp(name.trim(), email.trim().toLowerCase(), password, role);
            if (result.success) {
                const roleLabel = ROLES.find(r => r.id === role)?.label || 'user';
                toast.success(`Welcome to Q-Flow! Signed up as ${roleLabel} 🎉`);
                resetForm(); onClose();
            }
        } else {
            result = await signIn(email.trim().toLowerCase(), password);
            if (result.success) {
                toast.success('Welcome back! 👋');
                resetForm(); onClose();
            }
        }

        if (!result.success) setError(result.error || 'Something went wrong');
        setIsLoading(false);
    };

    const switchMode = () => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 40 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-x-4 top-[5%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md bg-white dark:bg-dark-card rounded-3xl shadow-2xl dark:shadow-black/50 z-50 overflow-hidden max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="relative px-8 pt-8 pb-6">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-indigo-700 dark:from-primary-800 dark:to-indigo-900" />
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors z-10">
                                <X className="w-5 h-5" />
                            </button>
                            <div className="relative z-10">
                                <h2 className="text-2xl font-extrabold text-white tracking-tight">
                                    {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                                </h2>
                                <p className="text-white/60 text-sm font-medium mt-1">
                                    {mode === 'signin' ? 'Sign in to track your favourite queues' : 'Choose your role and join Q-Flow'}
                                </p>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">

                            {/* Error */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-semibold">
                                            <AlertCircle className="w-4 h-4 shrink-0" />{error}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Signup-only fields */}
                            <AnimatePresence>
                                {mode === 'signup' && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-4">

                                        {/* Name */}
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <User className="h-4 w-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                            </div>
                                            <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)}
                                                className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 dark:border-dark-border rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm" />
                                        </div>

                                        {/* Role Selector */}
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">I am a...</p>
                                            <div className="space-y-2">
                                                {ROLES.map(r => {
                                                    const Icon = r.icon;
                                                    const isActive = role === r.id;
                                                    return (
                                                        <motion.button key={r.id} type="button" whileTap={{ scale: 0.98 }} onClick={() => setRole(r.id)}
                                                            className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${isActive ? r.color : r.inactive}`}>
                                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-current/10' : 'bg-gray-100 dark:bg-slate-700'}`}>
                                                                <Icon className={`w-5 h-5 ${isActive ? 'opacity-100' : 'text-gray-400 dark:text-slate-500'}`} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-bold text-sm">{r.label}</p>
                                                                <p className={`text-xs leading-tight mt-0.5 ${isActive ? 'opacity-80' : 'text-gray-400 dark:text-slate-500'}`}>{r.desc}</p>
                                                            </div>
                                                            <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${isActive ? 'border-current' : 'border-gray-300 dark:border-slate-600'}`}>
                                                                {isActive && <div className="w-2 h-2 rounded-full bg-current" />}
                                                            </div>
                                                        </motion.button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Email */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                </div>
                                <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 dark:border-dark-border rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm" />
                            </div>

                            {/* Password */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                </div>
                                <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-12 py-3.5 border border-gray-200 dark:border-dark-border rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {mode === 'signin' && (
                                <div className="text-right">
                                    <button type="button" className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors">Forgot password?</button>
                                </div>
                            )}

                            {/* Submit */}
                            <motion.button type="submit" disabled={isLoading}
                                whileHover={{ scale: isLoading ? 1 : 1.01 }} whileTap={{ scale: isLoading ? 1 : 0.98 }}
                                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-extrabold shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-shadow flex items-center justify-center gap-2 disabled:opacity-70">
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>{mode === 'signin' ? 'Sign In' : `Create ${ROLES.find(r => r.id === role)?.label || ''} Account`}<ArrowRight className="w-4 h-4" /></>
                                )}
                            </motion.button>

                            {/* Role info banner for provider */}
                            <AnimatePresence>
                                {mode === 'signup' && role === 'provider' && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden">
                                        <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 text-violet-700 dark:text-violet-300 text-xs font-medium">
                                            <Building2 className="w-4 h-4 shrink-0 mt-0.5" />
                                            <span>As a Service Provider, you'll get access to the <strong>Provider Dashboard</strong> to monitor your location's live queue, wait times, and weekly heatmap.</span>
                                        </div>
                                    </motion.div>
                                )}
                                {mode === 'signup' && role === 'reporter' && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden">
                                        <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                                            <FileText className="w-4 h-4 shrink-0 mt-0.5" />
                                            <span>As a Reporter, you can submit crowd data and wait times. Consistent reporters earn <strong>Verified Reporter</strong> status.</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>

                        {/* Footer */}
                        <div className="px-8 pb-6 text-center">
                            <p className="text-sm text-gray-500 dark:text-dark-muted font-medium">
                                {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                                <button type="button" onClick={switchMode} className="font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors">
                                    {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                                </button>
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AuthModal;
