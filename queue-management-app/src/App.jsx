import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/ui/ScrollToTop';
import WelcomeModal from './components/ui/WelcomeModal';
import CommandPalette from './components/ui/CommandPalette';
import VisitorDashboard from './components/visitor/VisitorDashboard';
import ReporterCheckIn from './components/reporter/ReporterCheckIn';
import AnalyticsDashboard from './components/admin/AnalyticsDashboard';
import AdminPlaceManager from './components/admin/AdminPlaceManager';
import ServiceProviderDashboard from './components/provider/ServiceProviderDashboard';
import ProfilePage from './components/profile/ProfilePage';
import AboutPage from './components/about/AboutPage';

const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
};
const pageTransition = { duration: 0.3 };

// Protected Route component
const ProtectedRoute = ({ children, requireAdmin = false, requireAuth = true }) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
    if (requireAuth && !isAuthenticated) return <Navigate to="/" replace />;
    if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;
    return children;
};

const AnimatedRoutes = () => {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={
                    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
                        <VisitorDashboard />
                    </motion.div>
                } />
                <Route path="/report" element={
                    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
                        <ReporterCheckIn />
                    </motion.div>
                } />
                <Route path="/analytics" element={
                    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
                        <AnalyticsDashboard />
                    </motion.div>
                } />
                <Route path="/admin" element={
                    <ProtectedRoute requireAdmin>
                        <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
                            <AdminPlaceManager />
                        </motion.div>
                    </ProtectedRoute>
                } />
                <Route path="/provider" element={
                    <ProtectedRoute requireAuth>
                        <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
                            <ServiceProviderDashboard />
                        </motion.div>
                    </ProtectedRoute>
                } />
                <Route path="/profile" element={
                    <ProtectedRoute requireAuth>
                        <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
                            <ProfilePage />
                        </motion.div>
                    </ProtectedRoute>
                } />
                <Route path="/about" element={
                    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
                        <AboutPage />
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
