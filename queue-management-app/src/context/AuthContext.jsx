import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('qflow-user');
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    });

    const [reportHistory, setReportHistory] = useState(() => {
        try {
            const saved = localStorage.getItem('qflow-reports');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    const [queuePositions, setQueuePositions] = useState(() => {
        try {
            const saved = localStorage.getItem('qflow-queues');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    // Load user and queues on mount
    useEffect(() => {
        const loadInitialData = async () => {
            const token = localStorage.getItem('qflow-token');
            if (!token) return;

            try {
                // Fetch User Profile
                const userRes = await fetch('/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUser({
                        id: userData._id,
                        name: userData.name,
                        email: userData.email,
                        avatar: userData.avatar,
                        reportsCount: userData.reportsCount
                    });

                    // Fetch Active Queues for this user
                    const queueRes = await fetch('/api/queues', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (queueRes.ok) {
                        const queueData = await queueRes.json();
                        setQueuePositions(queueData);
                    }
                } else {
                    // Token invalid or expired
                    localStorage.removeItem('qflow-token');
                    setUser(null);
                }
            } catch (error) {
                console.error('Error loading initial auth data:', error);
            }
        };

        loadInitialData();
    }, []);

    const signUp = useCallback(async (name, email, password) => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();

            if (!res.ok) {
                return { success: false, error: data.message || 'Registration failed' };
            }

            localStorage.setItem('qflow-token', data.token);
            setUser({
                id: data._id,
                name: data.name,
                email: data.email,
                avatar: data.avatar,
                reportsCount: data.reportsCount
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Network error occurred' };
        }
    }, []);

    const signIn = useCallback(async (email, password) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (!res.ok) {
                return { success: false, error: data.message || 'Login failed' };
            }

            localStorage.setItem('qflow-token', data.token);
            setUser({
                id: data._id,
                name: data.name,
                email: data.email,
                avatar: data.avatar,
                reportsCount: data.reportsCount
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Network error occurred' };
        }
    }, []);

    const signOut = useCallback(() => {
        localStorage.removeItem('qflow-token');
        setUser(null);
        setQueuePositions([]);
        setReportHistory([]);
    }, []);

    const addReport = useCallback(async (report) => {
        try {
            const token = localStorage.getItem('qflow-token');
            // We can still allow anonymous reports if backend supports it, but here we pass token if available
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch('/api/reports', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    placeId: report.serviceId,
                    reportedWaitTime: report.waitTime,
                    reportedCrowdStatus: report.crowdStatus
                })
            });

            if (!res.ok) throw new Error('Failed to submit report');

            const savedReport = await res.json();

            setReportHistory(prev => [savedReport, ...prev].slice(0, 50));
            if (user && token) {
                setUser(prev => ({ ...prev, reportsCount: (prev.reportsCount || 0) + 1 }));
            }
        } catch (error) {
            console.error('Error adding report:', error);
            throw error;
        }
    }, [user]);

    const joinQueue = useCallback(async (service) => {
        try {
            const token = localStorage.getItem('qflow-token');
            if (!token) throw new Error('Not authenticated');

            const res = await fetch('/api/queues', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    serviceId: service.id,
                    serviceName: service.name,
                    serviceType: service.type
                })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Failed to join queue');

            setQueuePositions(prev => [data, ...prev.filter(q => q.serviceId !== service.id)]);
            return data;
        } catch (error) {
            console.error('Error joining queue:', error);
            throw error;
        }
    }, []);

    const leaveQueue = useCallback(async (serviceId) => {
        try {
            const token = localStorage.getItem('qflow-token');
            if (!token) return;

            const res = await fetch(`/api/queues/${serviceId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                setQueuePositions(prev => prev.filter(q => q.serviceId !== serviceId));
            }
        } catch (error) {
            console.error('Error leaving queue:', error);
        }
    }, []);

    return (
        <AuthContext.Provider value={{
            user, isAuthenticated: !!user,
            signUp, signIn, signOut,
            reportHistory, addReport,
            queuePositions, joinQueue, leaveQueue
        }}>
            {children}
        </AuthContext.Provider>
    );
};
