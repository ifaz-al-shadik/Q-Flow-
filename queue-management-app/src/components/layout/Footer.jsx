import { Clock, Github, Heart, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-white dark:bg-dark-card border-t border-gray-100 dark:border-dark-border mt-auto transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Clock className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-900 dark:from-primary-400 dark:to-primary-200">Q-Flow</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-dark-muted leading-relaxed max-w-xs">
                            Real-time queue management for smarter cities. Skip the wait, plan your visit.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-200 uppercase tracking-wider mb-3">Quick Links</h4>
                        <ul className="space-y-2">
                            <li><Link to="/" className="text-sm text-gray-500 dark:text-dark-muted hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">Find Services</Link></li>
                            <li><Link to="/report" className="text-sm text-gray-500 dark:text-dark-muted hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">Report Queue</Link></li>
                            <li><Link to="/analytics" className="text-sm text-gray-500 dark:text-dark-muted hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">Analytics</Link></li>
                        </ul>
                    </div>

                    {/* Status */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-200 uppercase tracking-wider mb-3">System Status</h4>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-semantic-green opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-semantic-green"></span>
                            </span>
                            <span className="text-sm font-semibold text-semantic-green">All Systems Operational</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500">
                            <Zap className="w-3 h-3" />
                            <span>API response: ~12ms</span>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-dark-border flex flex-col sm:flex-row justify-between items-center gap-3">
                    <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">
                        © 2026 Q-Flow. Real-Time Queue Intelligence.
                    </p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 font-medium flex items-center gap-1">
                        Built with <Heart className="w-3 h-3 text-semantic-red inline" /> using React & Express
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
