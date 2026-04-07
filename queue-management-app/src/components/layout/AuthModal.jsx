import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const AuthModal = ({ isOpen, onClose }) => {
    const [mode, setMode] = useState('signin');
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signUp, signIn } = useAuth();
    const toast = useToast();

    const resetForm = () => {
        setName('');
        setEmail('');
        setPassword('');
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !password.trim()) {
            setError('Please fill in all fields');
            return;
        }
        if (mode === 'signup' && !name.trim()) {
            setError('Please enter your name');
            return;
        }
        if (password.length < 4) {
            setError('Password must be at least 4 characters');
            return;
        }

        setIsLoading(true);
        // Simulate slight delay for feedback
        await new Promise(r => setTimeout(r, 600));

        let result;
        if (mode === 'signup') {
            result = signUp(name.trim(), email.trim().toLowerCase(), password);
            if (result.success) {
                toast.success(`Welcome to Q-Flow, ${name.split(' ')[0]}! 🎉`);
                resetForm();
                onClose();
            }
        } else {
            result = signIn(email.trim().toLowerCase(), password);
            if (result.success) {
                toast.success('Welcome back! 👋');
                resetForm();
                onClose();
            }
        }

        if (!result.success) {
            setError(result.error);
        }
        setIsLoading(false);
    };

    const switchMode = () => {
        setMode(mode === 'signin' ? 'signup' : 'signin');
        setError('');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 40 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-x-4 top-[10%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md bg-white dark:bg-dark-card rounded-3xl shadow-2xl dark:shadow-black/50 z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="relative px-8 pt-8 pb-6">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-indigo-700 dark:from-primary-800 dark:to-indigo-900" />
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00djJoLTJ2LTJoMnptLTQgMHYyaC0ydi0yaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
                            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors z-10">
                                <X className="w-5 h-5" />
                            </button>
                            <div className="relative z-10">
                                <h2 className="text-2xl font-extrabold text-white tracking-tight">
                                    {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                                </h2>
                                <p className="text-white/60 text-sm font-medium mt-1">
                                    {mode === 'signin' ? 'Sign in to track your favorite queues' : 'Join Q-Flow and skip the wait'}
                                </p>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
                            {/* Social buttons */}
                            <div className="grid grid-cols-2 gap-3">
                                <button type="button" className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-dark-border text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                                    Google
                                </button>
                                <button type="button" className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-dark-border text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                                    <svg className="w-5 h-5 dark:fill-white" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" /></svg>
                                    GitHub
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-gray-200 dark:bg-dark-border"></div>
                                <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">or</span>
                                <div className="flex-1 h-px bg-gray-200 dark:bg-dark-border"></div>
                            </div>

                            {/* Error */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-semibold">
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            {error}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Name (signup) */}
                            <AnimatePresence>
                                {mode === 'signup' && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <User className="h-4 w-4 text-gray-400 dark:text-dark-muted group-focus-within:text-primary-500 transition-colors" />
                                            </div>
                                            <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)}
                                                className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 dark:border-dark-border rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Email */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-gray-400 dark:text-dark-muted group-focus-within:text-primary-500 transition-colors" />
                                </div>
                                <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 dark:border-dark-border rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                                />
                            </div>

                            {/* Password */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-gray-400 dark:text-dark-muted group-focus-within:text-primary-500 transition-colors" />
                                </div>
                                <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-12 py-3.5 border border-gray-200 dark:border-dark-border rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {mode === 'signin' && (
                                <div className="text-right">
                                    <button type="button" className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">Forgot password?</button>
                                </div>
                            )}

                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                whileHover={{ scale: isLoading ? 1 : 1.01 }}
                                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-extrabold shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-shadow flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {mode === 'signin' ? 'Sign In' : 'Create Account'}
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </motion.button>
                        </form>

                        {/* Footer */}
                        <div className="px-8 pb-6 text-center">
                            <p className="text-sm text-gray-500 dark:text-dark-muted font-medium">
                                {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                                <button type="button" onClick={switchMode}
                                    className="font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
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
