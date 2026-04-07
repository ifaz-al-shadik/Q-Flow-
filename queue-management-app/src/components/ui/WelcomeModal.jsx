import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, Users, Zap, ChevronRight } from 'lucide-react';

const WelcomeModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        const hasVisited = localStorage.getItem('qflow-onboarded');
        if (!hasVisited) {
            const timer = setTimeout(() => setIsOpen(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        localStorage.setItem('qflow-onboarded', 'true');
        setIsOpen(false);
    };

    const steps = [
        {
            icon: MapPin,
            color: 'bg-primary-500',
            title: 'Find Services Near You',
            description: 'Browse real-time queue data from hospitals, banks, post offices, and more across Bangladesh.'
        },
        {
            icon: Clock,
            color: 'bg-amber-500',
            title: 'Check Live Wait Times',
            description: 'See estimated wait times before you go. Our crowd-sourced data keeps everything accurate.'
        },
        {
            icon: Users,
            color: 'bg-emerald-500',
            title: 'Report & Help Others',
            description: 'Submit queue reports as a community reporter. Earn verified badges for consistent reporting.'
        },
        {
            icon: Zap,
            color: 'bg-violet-500',
            title: 'Get Real-Time Alerts',
            description: 'Receive notifications when crowd levels change at your favorite locations. Never wait unnecessarily again.'
        }
    ];

    const currentStep = steps[step];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-[60]"
                        onClick={handleClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85, y: 50 }}
                        transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                        className="fixed inset-x-4 top-[12%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md bg-white dark:bg-dark-card rounded-3xl shadow-2xl dark:shadow-black/50 z-[60] overflow-hidden"
                    >
                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 p-2 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 transition-colors z-10"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Content */}
                        <div className="px-8 pt-10 pb-8">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -30 }}
                                    transition={{ duration: 0.25 }}
                                    className="flex flex-col items-center text-center"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', delay: 0.1, damping: 12 }}
                                        className={`w-20 h-20 rounded-2xl flex items-center justify-center ${currentStep.color} shadow-lg mb-6`}
                                    >
                                        <currentStep.icon className="w-10 h-10 text-white" />
                                    </motion.div>

                                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-3">{currentStep.title}</h2>
                                    <p className="text-gray-500 dark:text-dark-muted font-medium leading-relaxed max-w-sm">{currentStep.description}</p>
                                </motion.div>
                            </AnimatePresence>

                            {/* Step Dots */}
                            <div className="flex justify-center gap-2 mt-8 mb-6">
                                {steps.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setStep(i)}
                                        className={`h-2 rounded-full transition-all duration-300 ${i === step
                                                ? 'w-8 bg-primary-500'
                                                : 'w-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600'
                                            }`}
                                    />
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleClose}
                                    className="flex-1 py-3.5 rounded-xl text-gray-600 dark:text-gray-400 font-bold bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-sm"
                                >
                                    Skip
                                </button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        if (step < steps.length - 1) {
                                            setStep(step + 1);
                                        } else {
                                            handleClose();
                                        }
                                    }}
                                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-extrabold shadow-lg shadow-primary-500/25 transition-shadow flex items-center justify-center gap-1.5 text-sm"
                                >
                                    {step < steps.length - 1 ? 'Next' : 'Get Started'}
                                    <ChevronRight className="w-4 h-4" />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default WelcomeModal;
