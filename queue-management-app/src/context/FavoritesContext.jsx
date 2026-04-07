import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const FavoritesContext = createContext();

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) throw new Error('useFavorites must be used within a FavoritesProvider');
    return context;
};

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState(() => {
        try {
            const saved = localStorage.getItem('qflow-favorites');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    useEffect(() => {
        localStorage.setItem('qflow-favorites', JSON.stringify(favorites));
    }, [favorites]);

    const toggleFavorite = useCallback((serviceId) => {
        setFavorites(prev =>
            prev.includes(serviceId)
                ? prev.filter(id => id !== serviceId)
                : [...prev, serviceId]
        );
    }, []);

    const isFavorite = useCallback((serviceId) => {
        return favorites.includes(serviceId);
    }, [favorites]);

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, count: favorites.length }}>
            {children}
        </FavoritesContext.Provider>
    );
};
