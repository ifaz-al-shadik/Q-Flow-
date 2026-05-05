import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [reportHistory, setReportHistory] = useState([]);
    const [queuePositions, setQueuePositions] = useState([]);
    const [loading, setLoading] = useState(true);

    const getToken = () => localStorage.getItem('qflow-token');

    const authHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
    });

    // Load user + queues + reports on mount
    useEffect(() => {
        const loadInitialData = async () => {
            const token = getToken();
            if (!token) { setLoading(false); return; }
            try {
                const userRes = await fetch('/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUser(userData);
                    // Fetch queues and report history in parallel
                    const [queueRes, reportRes] = await Promise.all([
                        fetch('/api/queues', { headers: { 'Authorization': `Bearer ${token}` } }),
                        fetch('/api/reports/my', { headers: { 'Authorization': `Bearer ${token}` } })
                    ]);
                    if (queueRes.ok) setQueuePositions(await queueRes.json());
                    if (reportRes.ok) setReportHistory(await reportRes.json());
                } else {
                    localStorage.removeItem('qflow-token');
                }
            } catch (error) {
                console.error('Error loading auth data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    const signUp = useCallback(async (name, email, password, role = 'visitor') => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role })
            });
            const data = await res.json();
            if (!res.ok) return { success: false, error: data.message || 'Registration failed' };
            localStorage.setItem('qflow-token', data.token);
            setUser(data);
            setReportHistory([]);
            setQueuePositions([]);
            return { success: true };
        } catch { return { success: false, error: 'Network error occurred' }; }
    }, []);

    const signIn = useCallback(async (email, password) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) return { success: false, error: data.message || 'Login failed' };
            localStorage.setItem('qflow-token', data.token);
            setUser(data);
            // Load queues and reports after login
            const [queueRes, reportRes] = await Promise.all([
                fetch('/api/queues', { headers: { 'Authorization': `Bearer ${data.token}` } }),
                fetch('/api/reports/my', { headers: { 'Authorization': `Bearer ${data.token}` } })
            ]);
            if (queueRes.ok) setQueuePositions(await queueRes.json());
            if (reportRes.ok) setReportHistory(await reportRes.json());
            return { success: true };
        } catch { return { success: false, error: 'Network error occurred' }; }
    }, []);

    const signOut = useCallback(() => {
        localStorage.removeItem('qflow-token');
        setUser(null);
        setQueuePositions([]);
        setReportHistory([]);
    }, []);

    const updateProfile = useCallback(async (updates) => {
        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PATCH',
                headers: authHeaders(),
                body: JSON.stringify(updates)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setUser(data);
            return { success: true };
        } catch (e) { return { success: false, error: e.message }; }
    }, []);

    const addReport = useCallback(async (report) => {
        try {
            const res = await fetch('/api/reports', {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({
                    placeId: report.placeId,
                    reportedWaitTime: report.waitTime,
                    reportedCrowdStatus: report.crowdLevel,
                    reportType: report.reportType || 'wait_time',
                    note: report.note || ''
                })
            });
            if (!res.ok) throw new Error('Failed to submit report');
            const savedReport = await res.json();
            setReportHistory(prev => [savedReport, ...prev].slice(0, 50));
            setUser(prev => ({ ...prev, reportsCount: (prev?.reportsCount || 0) + 1 }));
            return savedReport;
        } catch (error) {
            console.error('Error adding report:', error);
            throw error;
        }
    }, []);

    const joinQueue = useCallback(async (service) => {
        try {
            const res = await fetch('/api/queues', {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({
                    serviceId: service.id,
                    serviceName: service.name,
                    serviceType: service.type
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to join queue');
            setQueuePositions(prev => [data, ...prev.filter(q => q.serviceId?.toString() !== service.id?.toString())]);
            return data;
        } catch (error) { throw error; }
    }, []);

    const arriveAtQueue = useCallback(async (queueId) => {
        try {
            const res = await fetch(`/api/queues/${queueId}/arrive`, {
                method: 'PATCH',
                headers: authHeaders()
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setQueuePositions(prev => prev.map(q => q._id === queueId ? data : q));
            return data;
        } catch (error) { throw error; }
    }, []);

    const completeQueue = useCallback(async (queueId) => {
        try {
            const res = await fetch(`/api/queues/${queueId}/complete`, {
                method: 'PATCH',
                headers: authHeaders()
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setQueuePositions(prev => prev.filter(q => q._id !== queueId));
            return data;
        } catch (error) { throw error; }
    }, []);

    const leaveQueue = useCallback(async (serviceId) => {
        try {
            const res = await fetch(`/api/queues/${serviceId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (res.ok) setQueuePositions(prev => prev.filter(q => q.serviceId?.toString() !== serviceId?.toString()));
        } catch (error) { console.error('Error leaving queue:', error); }
    }, []);

    return (
        <AuthContext.Provider value={{
            user, isAuthenticated: !!user, loading,
            signUp, signIn, signOut, updateProfile,
            reportHistory, addReport,
            queuePositions, joinQueue, arriveAtQueue, completeQueue, leaveQueue,
            isAdmin: user?.role === 'admin',
            isProvider: user?.role === 'provider' || user?.role === 'admin',
        }}>
            {children}
        </AuthContext.Provider>
    );
};
