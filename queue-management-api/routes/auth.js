import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

const formatUser = (user) => ({
    _id: user._id,
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    reportsCount: user.reportsCount,
    joinedAt: user.createdAt,
    notificationThreshold: user.notificationThreshold,
    subscribedPlaces: user.subscribedPlaces,
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const avatar = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

        const user = await User.create({
            name,
            email,
            password,
            avatar,
            role: role || 'visitor'
        });

        if (user) {
            res.status(201).json({
                ...formatUser(user),
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                ...formatUser(user),
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json(formatUser(user));
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH /api/auth/profile — update name, avatar, notificationThreshold
router.patch('/profile', protect, async (req, res) => {
    try {
        const { name, notificationThreshold } = req.body;
        const updates = {};
        if (name) {
            updates.name = name;
            updates.avatar = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }
        if (notificationThreshold !== undefined) updates.notificationThreshold = notificationThreshold;

        const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
        res.json(formatUser(user));
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH /api/auth/subscribe/:placeId — subscribe to notifications for a place
router.patch('/subscribe/:placeId', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const placeId = req.params.placeId;
        const alreadySubscribed = user.subscribedPlaces.some(p => p.toString() === placeId);

        if (alreadySubscribed) {
            user.subscribedPlaces = user.subscribedPlaces.filter(p => p.toString() !== placeId);
        } else {
            user.subscribedPlaces.push(placeId);
        }

        await user.save();
        res.json({ subscribed: !alreadySubscribed, subscribedPlaces: user.subscribedPlaces });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
