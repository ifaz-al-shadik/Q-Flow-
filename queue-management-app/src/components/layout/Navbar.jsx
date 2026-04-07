import { useState, useRef, useEffect } from 'react';
import { Clock, UserCircle, Menu, X, Bell, Sun, Moon, LogOut, User, Heart, ChevronDown } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import NotificationPanel from './NotificationPanel';
import AuthModal from './AuthModal';

const navLinks = [
    { to: '/', label: 'Find Service' },
    { to: '/report', label: 'Reporter Access' },
    { to: '/analytics', label: 'Analytics Insights' },
];

const Navbar = () => {
    const { isDark, toggleTheme } = useTheme();
    const { unreadCount } = useNotifications();
    const { user, isAuthenticated, signOut } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    // Close profile dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleSignOut = () => {
        signOut();
        setProfileOpen(false);
    };

    return (
        <nav className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl border-b border-gray-200 dark:border-dark-border shadow-sm sticky top-0 z-50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <Clock className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                        <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-900 dark:from-primary-400 dark:to-primary-200 tracking-tight">
                            Q-Flow
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map(link => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${location.pathname === link.to
                                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}

                        <div className="w-px h-8 bg-gray-200 dark:bg-dark-border mx-2" />

                        {/* Dark mode toggle */}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                            aria-label="Toggle theme"
                        >
                            <AnimatePresence mode="wait">
                                {isDark ? (
                                    <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                                        <Sun className="w-5 h-5" />
                                    </motion.div>
                                ) : (
                                    <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                                        <Moon className="w-5 h-5" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>

                        {/* Notification bell */}
                        <div className="relative">
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setNotifOpen(prev => !prev)}
                                className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors relative"
                                aria-label="Notifications"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-semantic-red text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-dark-card"
                                    >
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </motion.span>
                                )}
                            </motion.button>
                            <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
                        </div>

                        {/* Auth: Sign In or User Dropdown */}
                        {isAuthenticated ? (
                            <div className="relative ml-1" ref={profileRef}>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setProfileOpen(prev => !prev)}
                                    className="flex items-center gap-2 bg-primary-50 dark:bg-primary-500/10 px-3 py-2 rounded-full hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-colors"
                                >
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-indigo-500 flex items-center justify-center text-white text-xs font-extrabold">
                                        {user?.avatar}
                                    </div>
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 max-w-[80px] truncate">{user?.name?.split(' ')[0]}</span>
                                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                                </motion.button>

                                <AnimatePresence>
                                    {profileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-xl dark:shadow-black/30 overflow-hidden z-50"
                                        >
                                            <div className="px-4 py-3 border-b border-gray-100 dark:border-dark-border">
                                                <p className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate">{user?.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-dark-muted truncate">{user?.email}</p>
                                            </div>
                                            <div className="py-1">
                                                <button onClick={() => { setProfileOpen(false); navigate('/profile'); }}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-left">
                                                    <User className="w-4 h-4 text-gray-400" /> My Profile
                                                </button>
                                                <button onClick={() => { setProfileOpen(false); navigate('/profile'); }}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-left">
                                                    <Heart className="w-4 h-4 text-gray-400" /> Favorites
                                                </button>
                                            </div>
                                            <div className="border-t border-gray-100 dark:border-dark-border py-1">
                                                <button onClick={handleSignOut}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left">
                                                    <LogOut className="w-4 h-4" /> Sign Out
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <button onClick={() => setAuthOpen(true)} className="flex items-center gap-2 bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 px-5 py-2.5 rounded-full font-bold hover:bg-primary-100 dark:hover:bg-primary-500/20 hover:shadow-md transition-all active:scale-95 ml-1">
                                <UserCircle className="w-5 h-5" />
                                Sign In
                            </button>
                        )}
                    </div>

                    {/* Mobile controls */}
                    <div className="md:hidden flex items-center gap-1">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </motion.button>

                        <div className="relative">
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setNotifOpen(prev => !prev)}
                                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors relative"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-semantic-red text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-dark-card">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </motion.button>
                            <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
                        </div>

                        {isAuthenticated && (
                            <Link to="/profile" className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-indigo-500 flex items-center justify-center text-white text-xs font-extrabold mx-1">
                                {user?.avatar}
                            </Link>
                        )}

                        <button
                            onClick={() => setMobileOpen(prev => !prev)}
                            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <AnimatePresence mode="wait">
                                {mobileOpen ? (
                                    <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                                        <X className="w-6 h-6" />
                                    </motion.div>
                                ) : (
                                    <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                                        <Menu className="w-6 h-6" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="md:hidden overflow-hidden border-t border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card"
                    >
                        <div className="px-4 py-4 space-y-1">
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.to}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <Link
                                        to={link.to}
                                        onClick={() => setMobileOpen(false)}
                                        className={`block px-4 py-3 rounded-xl font-semibold transition-all ${location.pathname === link.to
                                            ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        {link.label}
                                    </Link>
                                </motion.div>
                            ))}
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.15 }}
                                className="pt-2"
                            >
                                {isAuthenticated ? (
                                    <Link to="/profile" onClick={() => setMobileOpen(false)}
                                        className="w-full flex items-center justify-center gap-2 bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 px-5 py-3 rounded-xl font-bold">
                                        <User className="w-5 h-5" /> My Profile
                                    </Link>
                                ) : (
                                    <button
                                        onClick={() => { setMobileOpen(false); setAuthOpen(true); }}
                                        className="w-full flex items-center justify-center gap-2 bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 px-5 py-3 rounded-xl font-bold hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-all"
                                    >
                                        <UserCircle className="w-5 h-5" /> Sign In
                                    </button>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
        </nav>
    );
};

export default Navbar;
