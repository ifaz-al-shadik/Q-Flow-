import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/ui/ScrollToTop';
import WelcomeModal from './components/ui/WelcomeModal';
import CommandPalette from './components/ui/CommandPalette';
import VisitorDashboard from './components/visitor/VisitorDashboard';
import ReporterCheckIn from './components/reporter/ReporterCheckIn';
import AnalyticsDashboard from './components/admin/AnalyticsDashboard';
import ProfilePage from './components/profile/ProfilePage';

const AnimatedRoutes = () => {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                        <VisitorDashboard />
                    </motion.div>
                } />
                <Route path="/report" element={
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                        <ReporterCheckIn />
                    </motion.div>
                } />
                <Route path="/analytics" element={
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                        <AnalyticsDashboard />
                    </motion.div>
                } />
                <Route path="/profile" element={
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                        <ProfilePage />
                    </motion.div>
                } />
            </Routes>
        </AnimatePresence>
    );
};

function App() {
    return (
        <ThemeProvider>
            <NotificationProvider>
                <ToastProvider>
                    <FavoritesProvider>
                        <AuthProvider>
                            <Router>
                                <div className="min-h-screen flex flex-col font-sans bg-gray-50 dark:bg-dark-surface transition-colors duration-300">
                                    <Navbar />
                                    <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 overflow-hidden">
                                        <AnimatedRoutes />
                                    </main>
                                    <Footer />
                                    <ScrollToTop />
                                    <WelcomeModal />
                                    <CommandPalette />
                                </div>
                            </Router>
                        </AuthProvider>
                    </FavoritesProvider>
                </ToastProvider>
            </NotificationProvider>
        </ThemeProvider>
    );
}

export default App;
