import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
    return context;
};

const SIMULATED_UPDATES = [
    { message: "Dhaka Medical College Hospital wait time increased to 50 min", type: "warning" },
    { message: "Dhaka Public Library crowd level dropped to Low", type: "success" },
    { message: "New location added: Labaid Hospital, Dhanmondi", type: "info" },
    { message: "Bangladesh Post Office - Gulshan reports High crowd levels", type: "warning" },
    { message: "Sonali Bank - Motijheel wait time decreased to 15 min", type: "success" },
    { message: "Bashundhara City Mall is now nearly empty", type: "success" },
    { message: "Square Hospital - Panthapath crowd surge detected", type: "warning" },
];

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([
        {
            id: Date.now(),
            message: "Welcome to Q-Flow! You'll receive live queue updates here.",
            type: "info",
            time: new Date(),
            read: false
        }
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const addNotification = useCallback((message, type = 'info') => {
        setNotifications(prev => [
            {
                id: Date.now() + Math.random(),
                message,
                type,
                time: new Date(),
                read: false
            },
            ...prev
        ].slice(0, 20)); // Keep max 20
    }, []);

    const markAllRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    // Simulated periodic notifications
    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            if (index < SIMULATED_UPDATES.length) {
                const update = SIMULATED_UPDATES[index];
                addNotification(update.message, update.type);
                index++;
            }
        }, 12000); // Every 12 seconds

        return () => clearInterval(interval);
    }, [addNotification]);

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAllRead, clearAll }}>
            {children}
        </NotificationContext.Provider>
    );
};
