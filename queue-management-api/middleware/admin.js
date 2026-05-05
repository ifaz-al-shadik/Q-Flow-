import { protect } from './auth.js';

export const adminOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'admin')) {
        return next();
    }
    return res.status(403).json({ message: 'Admin access required' });
};

export const providerOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'provider')) {
        return next();
    }
    return res.status(403).json({ message: 'Provider or admin access required' });
};
