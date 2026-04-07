import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, Info, AlertTriangle, CheckCircle2, X, Trash2 } from 'lucide-react';

const typeConfig = {
    info: { icon: Info, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-500/10' },
    warning: { icon: AlertTriangle, color: 'text-semantic-yellow', bg: 'bg-semantic-yellow/10' },
    success: { icon: CheckCircle2, color: 'text-semantic-green', bg: 'bg-semantic-green/10' },
};

const formatTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
};

const NotificationPanel = ({ isOpen, onClose }) => {
    const { notifications, unreadCount, markAllRead, clearAll } = useNotifications();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40"
                        onClick={onClose}
                    />
                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="absolute right-0 top-full mt-2 w-96 max-h-[28rem] bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl shadow-2xl dark:shadow-black/40 z-50 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-dark-border">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Notifications</h3>
                                {unreadCount > 0 && (
                                    <span className="bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        className="text-xs text-primary-600 hover:text-primary-700 font-semibold px-2 py-1 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors"
                                    >
                                        Mark all read
                                    </button>
                                )}
                                <button
                                    onClick={clearAll}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Notification List */}
                        <div className="flex-1 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-dark-muted">
                                    <Bell className="w-10 h-10 mb-3 opacity-40" />
                                    <p className="text-sm font-medium">No notifications yet</p>
                                </div>
                            ) : (
                                <div className="py-1">
                                    {notifications.map((notif, i) => {
                                        const config = typeConfig[notif.type] || typeConfig.info;
                                        const Icon = config.icon;
                                        return (
                                            <motion.div
                                                key={notif.id}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.03 }}
                                                className={`flex items-start gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors ${!notif.read ? 'bg-primary-50/30 dark:bg-primary-500/5' : ''
                                                    }`}
                                            >
                                                <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 ${config.bg}`}>
                                                    <Icon className={`w-4 h-4 ${config.color}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm leading-snug ${notif.read
                                                            ? 'text-gray-500 dark:text-dark-muted'
                                                            : 'text-gray-800 dark:text-gray-200 font-medium'
                                                        }`}>
                                                        {notif.message}
                                                    </p>
                                                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 font-medium">
                                                        {formatTime(notif.time)}
                                                    </p>
                                                </div>
                                                {!notif.read && (
                                                    <div className="shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2" />
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NotificationPanel;
